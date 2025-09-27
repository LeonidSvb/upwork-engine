-- Таблица для вакансий от Volna
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Идентификаторы
  volna_project_id TEXT UNIQUE,
  upwork_url TEXT NOT NULL,

  -- Основная информация
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT,

  -- Бюджет
  budget_type TEXT CHECK (budget_type IN ('fixed', 'hourly', 'no')),
  budget TEXT,

  -- Метаданные вакансии
  site TEXT DEFAULT 'Upwork.com',
  published_at TIMESTAMPTZ,
  duration TEXT,
  engagement TEXT,
  experience_level TEXT,
  job_type TEXT,
  categories JSONB,

  -- Информация о клиенте
  client_rank TEXT,
  client_payment_verified BOOLEAN,
  client_total_spent NUMERIC(10, 2),
  client_total_hires INTEGER,
  client_avg_rate NUMERIC(10, 2),
  client_rating NUMERIC(3, 2),
  client_reviews INTEGER,
  client_country_code TEXT,
  client_country_name TEXT,

  -- Флаги
  us_only BOOLEAN DEFAULT false,
  uk_only BOOLEAN DEFAULT false,

  -- Полный raw payload (для анализа)
  raw JSONB NOT NULL,

  -- AI обработка (будет заполняться позже)
  decision TEXT CHECK (decision IN ('yes', 'no')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  summary_json JSONB,
  cover_letter_md TEXT,

  -- Служебные поля
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица для webhook батчей от Volna
CREATE TABLE IF NOT EXISTS webhook_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Информация о фильтре Volna
  filter_id INTEGER,
  filter_name TEXT,
  filter_url TEXT,

  -- Статистика батча
  total_projects INTEGER,
  results_url TEXT,

  -- Raw данные
  raw JSONB NOT NULL,

  -- Служебные
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_jobs_published ON jobs(published_at DESC);
CREATE INDEX idx_jobs_score ON jobs(score DESC) WHERE score IS NOT NULL;
CREATE INDEX idx_jobs_decision ON jobs(decision) WHERE decision IS NOT NULL;
CREATE INDEX idx_jobs_budget_type ON jobs(budget_type);
CREATE INDEX idx_jobs_client_rank ON jobs(client_rank);
CREATE INDEX idx_jobs_experience ON jobs(experience_level);

-- Индекс для поиска по JSONB
CREATE INDEX idx_jobs_raw_gin ON jobs USING GIN(raw);
CREATE INDEX idx_batches_raw_gin ON webhook_batches USING GIN(raw);

-- Функция автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер автообновления
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии
COMMENT ON TABLE jobs IS 'Вакансии от Volna с детальной структурой';
COMMENT ON TABLE webhook_batches IS 'История батчей от Volna webhook';
COMMENT ON COLUMN jobs.raw IS 'Полный JSON проекта от Volna';
COMMENT ON COLUMN jobs.volna_project_id IS 'Извлекается из URL для дедупликации';