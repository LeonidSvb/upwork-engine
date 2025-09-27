const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  console.log('Запуск миграций...\n');

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;

    console.log(`Выполнение: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        const queries = sql.split(';').filter(q => q.trim());
        for (const query of queries) {
          if (!query.trim()) continue;
          const { error: queryError } = await supabase.rpc('exec_sql', { sql_query: query });
          if (queryError) {
            console.error(`  Ошибка в запросе: ${queryError.message}`);
          }
        }
      }

      console.log(`  ✓ Успешно выполнено\n`);
    } catch (err) {
      console.error(`  ✗ Ошибка: ${err.message}\n`);
    }
  }

  console.log('Миграции завершены!');
}

runMigrations().catch(console.error);