import { createClient } from '@supabase/supabase-js';
import { callOpenAI } from './openai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface FilterResult {
  passed: boolean;
  reason: string;
}

export async function runQuickFilter(jobId: string): Promise<FilterResult> {
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error(`Вакансия не найдена: ${jobError?.message}`);
  }

  const { data: prompt, error: promptError } = await supabase
    .from('ai_prompts')
    .select('prompt_text')
    .eq('name', 'filter_v1')
    .eq('is_active', true)
    .single();

  if (promptError || !prompt) {
    throw new Error('Промпт фильтра не найден');
  }

  const filledPrompt = prompt.prompt_text
    .replace('{title}', job.title || '')
    .replace('{description}', job.description || '')
    .replace('{budget}', job.budget || 'не указан')
    .replace('{budget_type}', job.budget_type || 'не указан')
    .replace('{skills}', job.skills || 'не указаны')
    .replace('{client_rank}', job.client_rank || 'не указан')
    .replace('{experience_level}', job.experience_level || 'не указан');

  const response = await callOpenAI(filledPrompt, {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 200,
    responseFormat: { type: 'json_object' }
  });

  const result: FilterResult = JSON.parse(response);

  await supabase
    .from('jobs')
    .update({
      filter_passed: result.passed,
      filter_reason: result.reason,
      filter_processed_at: new Date().toISOString()
    })
    .eq('id', jobId);

  return result;
}