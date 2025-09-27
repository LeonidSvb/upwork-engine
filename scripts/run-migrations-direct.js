const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration(file) {
  console.log(`\nВыполнение: ${file}`);
  const sql = fs.readFileSync(file, 'utf8');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`  [${i + 1}/${statements.length}] Выполнение запроса...`);

    try {
      const { data, error } = await supabase.rpc('execute_sql', { query: stmt });
      if (error) throw error;
      console.log(`  ✓ Успешно`);
    } catch (err) {
      console.log(`  Пробуем альтернативный метод...`);
      console.log(`  Запрос: ${stmt.substring(0, 100)}...`);
    }
  }
}

async function main() {
  const migrations = [
    path.join(__dirname, '../supabase/migrations/003_add_ai_fields_to_jobs.sql'),
    path.join(__dirname, '../supabase/migrations/004_create_ai_tables.sql'),
  ];

  console.log('Миграции нужно запустить вручную через Supabase SQL Editor');
  console.log('Скопируйте содержимое этих файлов:\n');

  migrations.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`- ${path.basename(file)}`);
    }
  });

  console.log('\nИли используйте Supabase CLI: supabase db push');
}

main().catch(console.error);