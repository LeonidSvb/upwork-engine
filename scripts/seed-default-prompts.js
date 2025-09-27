/**
 * Скрипт для заполнения дефолтных промптов в Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const defaultPrompts = [
  {
    name: 'filter_v1',
    prompt_type: 'filter',
    prompt_text: `Ты - AI-фильтр для анализа IT-вакансий с Upwork. Твоя задача - быстро определить, стоит ли браться за проект.

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
    version: 1,
    is_active: true
  },
  {
    name: 'analysis_v1',
    prompt_type: 'analysis',
    prompt_text: `Ты - эксперт по анализу IT-проектов на Upwork. Проведи детальный анализ вакансии.

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
}`,
    version: 1,
    is_active: true
  }
];

async function seedPrompts() {
  console.log('🚀 Заполнение дефолтных промптов...');

  try {
    // Деактивируем все существующие промпты
    await supabase
      .from('ai_prompts')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // обновляем все

    console.log('📝 Существующие промпты деактивированы');

    // Активируем существующие промпты
    for (const prompt of defaultPrompts) {
      const { data, error } = await supabase
        .from('ai_prompts')
        .update({ is_active: true })
        .eq('name', prompt.name)
        .select()
        .single();

      if (error) {
        console.error(`❌ Ошибка активации промпта ${prompt.name}:`, error);
      } else {
        console.log(`✅ Промпт ${prompt.name} активирован (ID: ${data.id})`);
      }
    }

    console.log('🎉 Дефолтные промпты успешно заполнены!');

    // Проверяем результат
    const { data: activePrompts } = await supabase
      .from('ai_prompts')
      .select('name, slug, prompt_type, is_active')
      .eq('is_active', true);

    console.log('📊 Активные промпты:');
    activePrompts?.forEach(p => {
      console.log(`  - ${p.name} (${p.slug}) [${p.prompt_type}]`);
    });

  } catch (error) {
    console.error('💥 Ошибка:', error);
    process.exit(1);
  }
}

// Запускаем скрипт
if (require.main === module) {
  seedPrompts();
}

module.exports = { seedPrompts };