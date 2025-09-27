-- Таблица для хранения вакансий с гибкой структурой данных
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Минимальные обязательные поля
  source_job_id TEXT UNIQUE NOT NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Главное: raw данные в JSONB (любая структура!)
  raw JSONB NOT NULL,

  -- Поля для AI-обработки (заполняются позже)
  decision TEXT CHECK (decision IN ('yes', 'no')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  summary_json JSONB,
  cover_letter_md TEXT,

  -- Служебные поля
  notified_at TIMESTAMPTZ,
  model TEXT,
  prompt_version TEXT,
  cost_tokens INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0.0,

  -- Метаданные
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_score ON jobs(score DESC) WHERE score IS NOT NULL;
CREATE INDEX idx_jobs_decision ON jobs(decision) WHERE decision IS NOT NULL;

-- Индекс для поиска по JSONB (если понадобится)
CREATE INDEX idx_jobs_raw_gin ON jobs USING GIN(raw);

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

-- Комментарии для документации
COMMENT ON TABLE jobs IS 'Хранение вакансий с гибкой структурой данных в JSONB';
COMMENT ON COLUMN jobs.raw IS 'Полный payload от Volna в JSONB формате - любая структура';
COMMENT ON COLUMN jobs.source_job_id IS 'Уникальный ID вакансии для дедупликации';
COMMENT ON COLUMN jobs.summary_json IS 'AI-сгенерированное резюме вакансии в структурированном JSON';