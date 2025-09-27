import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { log } from '../../../lib/logging';
import { runQuickFilter } from '../../../lib/ai-filter';

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const payload = await request.json();
    const timestamp = new Date().toISOString();

    log.webhook.received('Получен webhook от Upwork', {
      source: 'upwork',
      payload: {
        total: payload.total,
        filter: payload.filter?.name,
        projects_count: payload.projects?.length || 0
      }
    }, { requestId, timestamp });

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      log.error('Отсутствуют креденшиалы Supabase', { requestId });
      return NextResponse.json({
        success: true,
        message: 'Data logged (Supabase not configured)',
        timestamp
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const batchData = {
      filter_id: payload.filter?.id,
      filter_name: payload.filter?.name,
      filter_url: payload.filter?.url,
      total_projects: payload.total,
      results_url: payload.results_url,
      raw: payload
    };

    const { data: batch, error: batchError } = await supabase
      .from('webhook_batches')
      .insert(batchData)
      .select()
      .single();

    if (batchError) {
      log.database.error('Ошибка сохранения batch', {
        operation: 'insert',
        table: 'webhook_batches',
        error: batchError.message
      }, { requestId });
      throw batchError;
    }

    log.database.success('Батч сохранен', {
      operation: 'insert',
      table: 'webhook_batches',
      recordId: batch.id
    }, { requestId });

    const jobs = payload.projects?.map(project => {
      const urlMatch = project.url?.match(/pid=(\d+)/);
      const volnaProjectId = urlMatch ? urlMatch[1] : null;

      return {
        volna_project_id: volnaProjectId,
        upwork_url: project.url,
        title: project.title,
        description: project.description,
        skills: project.skills,
        budget_type: project.budget_type,
        budget: project.budget,
        site: project.site,
        published_at: project.published,
        duration: project.duration,
        engagement: project.engagement,
        experience_level: project.experience_level,
        job_type: project.job_type,
        categories: project.categories,
        client_rank: project.client_details?.rank,
        client_payment_verified: project.client_details?.payment_method_verified,
        client_total_spent: project.client_details?.total_spent,
        client_total_hires: project.client_details?.total_hires,
        client_avg_rate: project.client_details?.avg_hourly_rate_paid,
        client_rating: project.client_details?.rating,
        client_reviews: project.client_details?.reviews,
        client_country_code: project.client_details?.country?.iso_code2,
        client_country_name: project.client_details?.country?.name,
        us_only: project.us_only,
        uk_only: project.uk_only,
        raw: project
      };
    }) || [];

    if (jobs.length > 0) {
      const { data: savedJobs, error: jobsError } = await supabase
        .from('jobs')
        .upsert(jobs, {
          onConflict: 'volna_project_id',
          ignoreDuplicates: false
        })
        .select('id');

      if (jobsError) {
        log.database.error('Ошибка сохранения jobs', {
          operation: 'upsert',
          table: 'jobs',
          error: jobsError.message
        }, { requestId });
        throw jobsError;
      }

      log.database.success('Сохранены jobs', {
        operation: 'upsert',
        table: 'jobs',
        recordsCount: savedJobs.length
      }, { requestId });

      // Автоматический запуск первичного фильтра для новых вакансий
      log.info('Запуск автоматического фильтра для новых вакансий', {}, { requestId });

      for (const job of savedJobs) {
        try {
          const filterResult = await runQuickFilter(job.id);
          log.info(`Автофильтр для вакансии ${job.id}: ${filterResult.passed ? 'ПРОШЕЛ' : 'НЕ ПРОШЕЛ'}`, {
            jobId: job.id,
            passed: filterResult.passed,
            reason: filterResult.reason
          }, { requestId });
        } catch (filterError) {
          log.error(`Ошибка автофильтра для вакансии ${job.id}`, {
            jobId: job.id,
            error: filterError.message
          }, { requestId });
        }
      }
    }

    const duration = Date.now() - startTime;

    log.webhook.processed('Webhook успешно обработан', {
      source: 'upwork',
      batchId: batch.id,
      jobsCount: jobs.length
    }, { requestId, duration });


    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      jobs_saved: jobs.length,
      timestamp
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    log.webhook.error('Ошибка обработки webhook', {
      source: 'upwork',
      error: error.message
    }, { requestId, duration });

    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}