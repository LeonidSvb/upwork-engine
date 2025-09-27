import { createClient } from '@supabase/supabase-js';
import { callOpenAI } from './openai';

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

export async function runDeepAnalysis(jobId: string, userId: string = 'default'): Promise<AnalysisResult> {
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error(`Вакансия не найдена: ${jobError?.message}`);
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !userProfile) {
    throw new Error('Профиль пользователя не найден');
  }

  const { data: prompt, error: promptError } = await supabase
    .from('ai_prompts')
    .select('prompt_text')
    .eq('name', 'analysis_v1')
    .eq('is_active', true)
    .single();

  if (promptError || !prompt) {
    throw new Error('Промпт анализа не найден');
  }

  const filledPrompt = prompt.prompt_text
    .replace('{user_profile}', JSON.stringify(userProfile, null, 2))
    .replace('{title}', job.title || '')
    .replace('{description}', job.description || '')
    .replace('{budget}', job.budget || 'не указан')
    .replace('{budget_type}', job.budget_type || 'не указан')
    .replace('{skills}', job.skills || 'не указаны')
    .replace('{client_rank}', job.client_rank || 'не указан')
    .replace('{client_country}', job.client_country_name || 'не указана')
    .replace('{experience_level}', job.experience_level || 'не указан')
    .replace('{raw}', JSON.stringify(job.raw || {}, null, 2));

  const response = await callOpenAI(filledPrompt, {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
    responseFormat: { type: 'json_object' }
  });

  const result: AnalysisResult = JSON.parse(response);

  await supabase
    .from('jobs')
    .update({
      ai_analysis: result,
      analysis_processed_at: new Date().toISOString()
    })
    .eq('id', jobId);

  return result;
}