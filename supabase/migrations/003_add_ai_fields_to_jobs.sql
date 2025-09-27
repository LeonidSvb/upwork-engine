-- Добавление полей для AI анализа в таблицу jobs

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS filter_passed boolean DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS filter_reason text DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS filter_processed_at timestamptz DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_analysis jsonb DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS analysis_processed_at timestamptz DEFAULT NULL;

-- Добавление индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_jobs_filter_passed ON jobs(filter_passed);
CREATE INDEX IF NOT EXISTS idx_jobs_filter_processed_at ON jobs(filter_processed_at);
CREATE INDEX IF NOT EXISTS idx_jobs_analysis_processed_at ON jobs(analysis_processed_at);

-- Комментарии для документации
COMMENT ON COLUMN jobs.filter_passed IS 'Результат первичного AI фильтра (pass/fail)';
COMMENT ON COLUMN jobs.filter_reason IS 'Краткое объяснение почему вакансия прошла или не прошла фильтр';
COMMENT ON COLUMN jobs.filter_processed_at IS 'Время когда был выполнен первичный фильтр';
COMMENT ON COLUMN jobs.ai_analysis IS 'Полный JSON результат глубокого AI анализа (scoring, рекомендации, cover letter)';
COMMENT ON COLUMN jobs.analysis_processed_at IS 'Время когда был выполнен глубокий анализ';