# Upwork Engine

AI-powered Upwork job intake and triage system

🔗 **Live Demo**: [https://upwork-engine.vercel.app/](https://upwork-engine.vercel.app/)

## Описание

Автоматизированная система для приема, фильтрации и анализа вакансий с Upwork через Volna webhook интеграцию.

## Основные возможности

- 📥 **Webhook интеграция** - автоматический прием вакансий от Volna
- 🗄️ **Supabase база данных** - хранение и индексация вакансий
- 🎨 **Современный UI** - Next.js 15 + shadcn/ui + Tailwind CSS
- 📊 **Табличное отображение** - удобный просмотр всех вакансий
- 🔍 **Детальная информация** - бюджет, навыки, рейтинг клиента
- 🔗 **Прямые ссылки** - быстрый переход на вакансии Upwork

## Технологический стек

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - компонентная библиотека

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Next.js API Routes**
- **Vercel** (деплой)

### Инструменты
- **Volna** - webhook для мониторинга Upwork
- **Cloudflare Tunnel** - локальная разработка

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/LeonidSvb/upwork-engine.git
cd upwork-engine
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте `.env.local` на основе `.env.example`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Запуск локально

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
upwork-system/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Главная страница
│   ├── layout.tsx         # Layout
│   └── api/webhook/       # Webhook endpoint
├── components/            # React компоненты
│   └── ui/               # shadcn/ui компоненты
├── lib/                   # Утилиты
├── hooks/                 # React хуки
├── supabase/
│   └── migrations/       # SQL миграции
└── docs/                  # Документация
```

## База данных

### Таблицы

**jobs** - вакансии от Volna
- Основная информация (title, description, skills)
- Бюджет (budget, budget_type)
- Клиентские данные (client_rank, client_country)
- AI обработка (decision, score, summary_json)

**webhook_batches** - история батчей от Volna

Подробнее: [supabase/migrations/002_create_jobs_from_volna.sql](supabase/migrations/002_create_jobs_from_volna.sql)

## Deployment

Проект автоматически деплоится на Vercel при пуше в `master`:

1. Форкните репозиторий
2. Подключите к Vercel
3. Добавьте переменные окружения
4. Готово!

## Документация

- [ADR-0001: Локальная разработка](docs/ADR.md)
- [PRD: Product Requirements](docs/PRD.md)
- [SETUP: Инструкция по настройке](docs/SETUP.md)
- [CHANGELOG: История изменений](CHANGELOG.md)

## Roadmap

- [ ] AI анализ вакансий (GPT-4)
- [ ] Автоматическая генерация cover letter
- [ ] Система скоринга вакансий
- [ ] Уведомления о новых вакансиях
- [ ] Фильтры и поиск
- [ ] Интеграция с Telegram

## Лицензия

MIT

## Контакты

GitHub: [@LeonidSvb](https://github.com/LeonidSvb)