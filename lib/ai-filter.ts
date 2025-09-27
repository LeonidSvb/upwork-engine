import { createClient } from '@supabase/supabase-js';
import { callOpenAI } from './openai';
import { getPrompt } from './prompts';
import { log } from './logging';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface FilterResult {
  passed: boolean;
  reason: string;
}

export async function runQuickFilter(jobId: string, requestId?: string): Promise<FilterResult> {
  const context = { requestId: requestId || Math.random().toString(36).substring(7) };

  log.info(`Запуск первичного фильтра для вакансии ${jobId}`, {
    jobId,
    operation: 'quick_filter_start'
  }, context);

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      log.database.error('Вакансия не найдена при запуске фильтра', {
        operation: 'select',
        table: 'jobs',
        recordId: jobId,
        error: jobError?.message || 'Запись не найдена'
      }, context);
      throw new Error(`Вакансия не найдена: ${jobError?.message}`);
    }

    log.database.success('Данные вакансии загружены для фильтра', {
      operation: 'select',
      table: 'jobs',
      recordId: jobId
    }, context);

    // Получаем динамический промпт
    const promptTemplate = await getPrompt('filter');

    // Подготавливаем данные для анализа
    const jobData = {
      title: job.title || '',
      description: job.description || '',
      budget: job.budget || 'не указан',
      budget_type: job.budget_type || 'не указан',
      skills: job.skills || 'не указаны',
      client_rank: job.client_rank || 'не указан',
      experience_level: job.experience_level || 'не указан',
      client_payment_verified: job.client_payment_verified || false,
      client_total_spent: job.client_total_spent || 0,
      client_country_name: job.client_country_name || 'не указана'
    };

    const filledPrompt = `${promptTemplate}

ДАННЫЕ ВАКАНСИИ:
${JSON.stringify(jobData, null, 2)}`;

    log.info('Отправка вакансии на фильтр OpenAI', {
      jobId,
      jobTitle: jobData.title,
      operation: 'openai_filter_request'
    }, context);

    const response = await callOpenAI(filledPrompt, {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 200,
      responseFormat: { type: 'json_object' }
    });

    const result: FilterResult = JSON.parse(response);

    log.info(`Результат фильтра: ${result.passed ? 'ПРОШЕЛ' : 'НЕ ПРОШЕЛ'}`, {
      jobId,
      filterPassed: result.passed,
      filterReason: result.reason,
      operation: 'filter_result'
    }, context);

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        filter_passed: result.passed,
        filter_reason: result.reason,
        filter_processed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      log.database.error('Ошибка сохранения результата фильтра', {
        operation: 'update',
        table: 'jobs',
        recordId: jobId,
        error: updateError.message
      }, context);
      throw updateError;
    }

    log.database.success('Результат фильтра сохранен', {
      operation: 'update',
      table: 'jobs',
      recordId: jobId
    }, context);

    return result;

  } catch (error) {
    log.error(`Ошибка при выполнении фильтра для вакансии ${jobId}`, {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      operation: 'quick_filter_error'
    }, context);
    throw error;
  }
}