// Для тестирования компилируем TypeScript в runtime
require('ts-node/register');
const { log } = require('../lib/logging/index.ts');

async function testLogging() {
  console.log('🧪 Тестирование системы логирования...\n');

  console.log('1. Тест базового логирования:');
  log.info('Тестовое info сообщение');
  log.warn('Тестовое warning сообщение');
  log.error('Тестовое error сообщение');
  log.debug('Тестовое debug сообщение (видно только в dev)');

  console.log('\n2. Тест логирования с контекстом:');
  const requestId = 'test-' + Math.random().toString(36).substring(7);
  log.info('Сообщение с контекстом', { requestId, userId: 'test-user' });

  console.log('\n3. Тест API логирования:');
  log.api.request('Тестовый API запрос', {
    method: 'POST',
    url: '/api/test',
    statusCode: 200,
    duration: 150
  }, { requestId });

  log.api.response('Успешный API ответ', {
    method: 'POST',
    url: '/api/test',
    statusCode: 200,
    duration: 150,
    responseBody: { success: true }
  }, { requestId });

  log.api.error('Ошибка API', {
    method: 'POST',
    url: '/api/test',
    statusCode: 500,
    error: 'Тестовая ошибка API'
  }, { requestId });

  console.log('\n4. Тест Webhook логирования:');
  log.webhook.received('Тестовый webhook получен', {
    source: 'upwork',
    payload: { total: 5, projects: ['project1', 'project2'] }
  }, { requestId });

  log.webhook.processed('Webhook обработан', {
    source: 'upwork',
    batchId: 'batch-123',
    jobsCount: 5
  }, { requestId });

  log.webhook.error('Ошибка webhook', {
    source: 'upwork',
    error: 'Тестовая ошибка webhook'
  }, { requestId });

  console.log('\n5. Тест Database логирования:');
  log.database.query('Выполнение SQL запроса', {
    operation: 'select',
    table: 'jobs'
  }, { requestId });

  log.database.success('Успешное сохранение', {
    operation: 'insert',
    table: 'jobs',
    recordsCount: 3
  }, { requestId });

  log.database.error('Ошибка БД', {
    operation: 'insert',
    table: 'jobs',
    error: 'Тестовая ошибка базы данных'
  }, { requestId });

  console.log('\n6. Тест OpenAI логирования:');
  log.openai.request('Запрос к OpenAI', {
    model: 'gpt-4o-mini',
    prompt: 'Тестовый промпт для проверки логирования...'
  }, { requestId });

  log.openai.response('Ответ от OpenAI', {
    model: 'gpt-4o-mini',
    response: 'Тестовый ответ от OpenAI...',
    tokensUsed: 150,
    cost: 0.015
  }, { requestId });

  log.openai.error('Ошибка OpenAI', {
    model: 'gpt-4o-mini',
    error: 'Тестовая ошибка OpenAI'
  }, { requestId });

  console.log('\n✅ Тестирование завершено!');
  console.log('📂 Проверь файлы логов:');
  console.log('   - logs/combined.log (все логи)');
  console.log('   - logs/error.log (только ошибки)');
  console.log('\n💡 В production логи debug не будут записываться');
}

testLogging().catch(console.error);