import OpenAI from 'openai';
import { log } from './logging';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY не найден в переменных окружения');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAI(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' | 'text' };
  }
) {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = { type: 'json_object' as const }
  } = options || {};

  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  log.openai.request('Отправка запроса к OpenAI', {
    model,
    prompt: prompt.slice(0, 200) + (prompt.length > 200 ? '...' : ''),
    tokensUsed: 0
  }, { requestId });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI вернул пустой ответ');
    }

    const duration = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens || 0;

    log.openai.response('Получен ответ от OpenAI', {
      model,
      response: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      tokensUsed,
      cost: tokensUsed * 0.0001 // примерная стоимость
    }, { requestId, duration });

    return content;
  } catch (error) {
    const duration = Date.now() - startTime;

    log.openai.error('Ошибка при запросе к OpenAI', {
      model,
      error: error instanceof Error ? error.message : String(error)
    }, { requestId, duration });

    throw error;
  }
}