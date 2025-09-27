# Инструкция по настройке

## 1. Создание таблицы в Supabase

1. Зайди в Supabase: https://supabase.com/dashboard/project/wfnyczvqmwjneapzuicf
2. Перейди в **SQL Editor**
3. Создай новый запрос
4. Скопируй содержимое файла `supabase/migrations/001_create_jobs_table.sql`
5. Вставь и нажми **Run**

## 2. Настройка переменных окружения в Vercel

1. Зайди в проект: https://vercel.com/settings/environment-variables
2. Или найди свой проект → Settings → Environment Variables
3. Добавь две переменные:

### SUPABASE_URL
```
https://wfnyczvqmwjneapzuicf.supabase.co
```

### SUPABASE_SERVICE_KEY
```
(скопируй из Supabase: Settings → API → service_role → Reveal)
```

4. Примени для **Production, Preview, Development**
5. Нажми **Save**

## 3. Редеплой проекта

После добавления переменных:
1. Перейди в **Deployments**
2. Найди последний деплой
3. Нажми **⋯ → Redeploy**

Или просто сделай новый коммит в GitHub - Vercel автоматически задеплоит.

## 4. Получение URL вебхука

После успешного деплоя твой вебхук будет доступен по адресу:

```
https://upwork-engine.vercel.app/api/webhook
```

Этот URL используй в Volna для отправки данных о вакансиях.

## 5. Тестирование вебхука

Проверь вебхук командой:

```bash
curl -X POST https://upwork-engine.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":"data","jobId":"test123"}'
```

Если всё настроено правильно, получишь:
```json
{"success":true,"jobId":"...","sourceJobId":"test123"}
```

## Что делает таблица jobs?

- **raw (JSONB)** - хранит ЛЮБОЙ JSON от Volna (неважно какая структура!)
- **source_job_id** - уникальный ID для дедупликации
- **decision, score, summary_json** - заполняются AI позже
- **cover_letter_md** - сгенерированное cover letter

Можешь отправлять абсолютно любую структуру JSON - всё сохранится в поле `raw`!