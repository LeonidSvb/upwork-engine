import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();
    const timestamp = new Date().toISOString();

    console.log('='.repeat(80));
    console.log('WEBHOOK RECEIVED AT:', timestamp);
    console.log('Total projects:', payload.total);
    console.log('='.repeat(80));

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('Missing Supabase credentials');
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
      console.error('Batch save error:', batchError);
      throw batchError;
    }

    console.log('Batch saved:', batch.id);

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
        console.error('Jobs save error:', jobsError);
        throw jobsError;
      }

      console.log(`Saved ${savedJobs.length} jobs`);
    }

    console.log('='.repeat(80));

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      jobs_saved: jobs.length,
      timestamp
    });

  } catch (error) {
    console.error('ERROR:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}