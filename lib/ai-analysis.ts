import { createClient } from '@supabase/supabase-js';
import { callOpenAI } from './openai';
import { getPrompt } from './prompts';
import { log } from './logging';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface AnalysisResult {
  overall_score: number;
  fit_score: number;
  client_quality_score: number;
  budget_score: number;
  competition_level: 'low' | 'medium' | 'high';
  recommendation: 'apply' | 'skip' | 'maybe';
  key_strengths: string[];
  concerns: string[];
  client_analysis: string;
  negotiation_tips: string;
  estimated_time: string;
  suggested_approach: string;
}

export async function runDeepAnalysis(jobId: string, requestId?: string, userId: string = 'default'): Promise<AnalysisResult> {
  const context = { requestId: requestId || Math.random().toString(36).substring(7) };

  log.info(`Запуск глубокого анализа для вакансии ${jobId}`, {
    jobId,
    userId,
    operation: 'deep_analysis_start'
  }, context);

  try {
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      log.database.error('Вакансия не найдена при запуске анализа', {
        operation: 'select',
        table: 'jobs',
        recordId: jobId,
        error: jobError?.message || 'Запись не найдена'
      }, context);
      throw new Error(`Вакансия не найдена: ${jobError?.message}`);
    }

    log.database.success('Данные вакансии загружены для анализа', {
      operation: 'select',
      table: 'jobs',
      recordId: jobId
    }, context);

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !userProfile) {
      log.database.error('Профиль пользователя не найден', {
        operation: 'select',
        table: 'user_profiles',
        recordId: userId,
        error: profileError?.message || 'Запись не найдена'
      }, context);
      throw new Error('Профиль пользователя не найден');
    }

    log.database.success('Профиль пользователя загружен', {
      operation: 'select',
      table: 'user_profiles',
      recordId: userId
    }, context);

    // Получаем динамический промпт
    const promptTemplate = await getPrompt('analysis');

    // Подготавливаем полные данные для анализа
    const analysisData = {
      job: {
        title: job.title || '',
        description: job.description || '',
        budget: job.budget || 'не указан',
        budget_type: job.budget_type || 'не указан',
        skills: job.skills || 'не указаны',
        client_rank: job.client_rank || 'не указан',
        client_country_name: job.client_country_name || 'не указана',
        experience_level: job.experience_level || 'не указан',
        client_payment_verified: job.client_payment_verified || false,
        client_total_spent: job.client_total_spent || 0,
        client_total_hires: job.client_total_hires || 0,
        client_rating: job.client_rating || 0,
        upwork_url: job.upwork_url || ''
      },
      user_profile: userProfile || null
    };

    log.info('Отправка данных на глубокий анализ OpenAI', {
      jobId,
      jobTitle: analysisData.job.title,
      model: 'gpt-4o',
      operation: 'openai_analysis_request'
    }, context);

    const filledPrompt = `${promptTemplate}

ДАННЫЕ ДЛЯ АНАЛИЗА:
${JSON.stringify(analysisData, null, 2)}`;

    const response = await callOpenAI(filledPrompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: { type: 'json_object' }
    });

    const result: AnalysisResult = JSON.parse(response);

    log.info(`Анализ завершен со скором ${result.overall_score}`, {
      jobId,
      overallScore: result.overall_score,
      recommendation: result.recommendation,
      operation: 'analysis_result'
    }, context);

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        ai_analysis: result,
        analysis_processed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      log.database.error('Ошибка сохранения результата анализа', {
        operation: 'update',
        table: 'jobs',
        recordId: jobId,
        error: updateError.message
      }, context);
      throw updateError;
    }

    log.database.success('Результат анализа сохранен', {
      operation: 'update',
      table: 'jobs',
      recordId: jobId
    }, context);

    return result;

  } catch (error) {
    log.error(`Ошибка при глубоком анализе вакансии ${jobId}`, {
      jobId,
      userId,
      error: error instanceof Error ? error.message : String(error),
      operation: 'deep_analysis_error'
    }, context);
    throw error;
  }
}