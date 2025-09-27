import { log } from './logging';

// Дефолтные промпты как fallback
const DEFAULT_PROMPTS = {
  filter: `Ты - AI-фильтр для анализа IT-вакансий с Upwork. Твоя задача - быстро определить, стоит ли браться за проект.

КРИТЕРИИ ОЦЕНКИ:
✅ ПОДХОДИТ:
- Frontend/Backend/Fullstack разработка
- JavaScript, TypeScript, React, Next.js, Node.js
- Веб-приложения, API разработка
- Интеграции с внешними сервисами
- Бюджет от $500+ для fixed, от $15/час для hourly
- Клиент с хорошей репутацией (payment verified)

❌ НЕ ПОДХОДИТ:
- Дизайн, контент, маркетинг
- PHP, WordPress, старые технологии
- Мобильные приложения (iOS/Android)
- Очень низкий бюджет
- Подозрительные клиенты

ОТВЕТ СТРОГО В JSON:
{
  "passed": true/false,
  "reason": "краткое объяснение решения (2-3 предложения)"
}`,

  analysis: `Ты - эксперт по анализу IT-проектов на Upwork. Проведи детальный анализ вакансии.

АНАЛИЗИРУЙ:
1. Техническое соответствие твоим навыкам
2. Качество описания проекта
3. Адекватность бюджета к объему работ
4. Репутацию и надежность клиента
5. Потенциальные риски и возможности

ОТВЕТ В JSON:
{
  "overall_score": число от 1 до 10,
  "technical_match": число от 1 до 10,
  "budget_adequacy": число от 1 до 10,
  "client_quality": число от 1 до 10,
  "project_clarity": число от 1 до 10,
  "recommendation": "TAKE" | "CONSIDER" | "SKIP",
  "strengths": ["список сильных сторон"],
  "concerns": ["список потенциальных проблем"],
  "summary": "краткое резюме анализа"
}`
};

/**
 * Получить активный промпт по slug
 */
export async function getPrompt(slug: string): Promise<string> {
  const requestId = Math.random().toString(36).substring(7);

  try {
    log.api.request(`Получение промпта ${slug}`, {
      method: 'GET',
      url: `/api/prompts/${slug}`
    }, { requestId });

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/prompts/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Если промпт не найден или ошибка - используем дефолтный
      log.api.response(`Промпт ${slug} не найден, используем дефолтный`, {
        slug,
        status: response.status,
        useDefault: true
      }, { requestId });

      return DEFAULT_PROMPTS[slug as keyof typeof DEFAULT_PROMPTS] || '';
    }

    const data = await response.json();

    log.api.response(`Промпт ${slug} получен`, {
      slug,
      status: response.status,
      textLength: data.text?.length || 0,
      useDefault: false
    }, { requestId });

    return data.text || DEFAULT_PROMPTS[slug as keyof typeof DEFAULT_PROMPTS] || '';

  } catch (error: any) {
    log.api.error(`Ошибка получения промпта ${slug}`, {
      slug,
      error: error.message,
      useDefault: true
    }, { requestId });

    // В случае ошибки возвращаем дефолтный промпт
    return DEFAULT_PROMPTS[slug as keyof typeof DEFAULT_PROMPTS] || '';
  }
}

/**
 * Обновить промпт
 */
export async function updatePrompt(slug: string, text: string): Promise<boolean> {
  const requestId = Math.random().toString(36).substring(7);

  try {
    log.api.request(`Обновление промпта ${slug}`, {
      method: 'POST',
      url: `/api/prompts/${slug}`,
      textLength: text.length
    }, { requestId });

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/prompts/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const success = response.ok;

    log.api.response(`Обновление промпта ${slug}`, {
      slug,
      status: response.status,
      success
    }, { requestId });

    return success;

  } catch (error: any) {
    log.api.error(`Ошибка обновления промпта ${slug}`, {
      slug,
      error: error.message
    }, { requestId });

    return false;
  }
}