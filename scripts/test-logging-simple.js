// Простой тест для логирования без TypeScript
const winston = require('winston');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'upwork-system' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 14,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 14,
      tailable: true
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

async function testLogging() {
  console.log('🧪 Тестирование системы логирования (простой тест)...\n');

  const requestId = 'test-' + Math.random().toString(36).substring(7);

  console.log('1. Тест базового логирования:');
  logger.info('Тестовое info сообщение', { requestId });
  logger.warn('Тестовое warning сообщение', { requestId });
  logger.error('Тестовое error сообщение', { requestId });
  logger.debug('Тестовое debug сообщение', { requestId });

  console.log('\n2. Тест структурированного логирования:');
  logger.info('API запрос обработан', {
    requestId,
    api: {
      method: 'POST',
      url: '/api/webhook',
      statusCode: 200,
      duration: 150
    }
  });

  logger.info('Webhook получен', {
    requestId,
    webhook: {
      source: 'upwork',
      total: 5,
      processed: 5
    }
  });

  logger.error('Ошибка базы данных', {
    requestId,
    database: {
      operation: 'insert',
      table: 'jobs',
      error: 'Connection timeout'
    }
  });

  logger.info('OpenAI запрос', {
    requestId,
    openai: {
      model: 'gpt-4o-mini',
      tokensUsed: 150,
      cost: 0.015
    }
  });

  console.log('\n✅ Тестирование завершено!');
  console.log('📂 Проверь файлы логов:');
  console.log('   - logs/combined.log (все логи)');
  console.log('   - logs/error.log (только ошибки)');

  console.log('\n🔍 Последние записи в логах:');

  // Читаем и показываем последние записи
  const fs = require('fs');
  try {
    const combinedLog = fs.readFileSync(path.join(logDir, 'combined.log'), 'utf8');
    const lines = combinedLog.trim().split('\n');
    console.log('\n📄 Последние 3 записи из combined.log:');
    lines.slice(-3).forEach((line, i) => {
      try {
        const parsed = JSON.parse(line);
        console.log(`${i + 1}. [${parsed.level.toUpperCase()}] ${parsed.message}`);
      } catch {
        console.log(`${i + 1}. ${line}`);
      }
    });
  } catch (error) {
    console.log('❌ Не удалось прочитать логи:', error.message);
  }
}

testLogging().catch(console.error);