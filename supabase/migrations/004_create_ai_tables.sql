-- Таблица для хранения AI промптов (версионирование и переиспользование)
CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  prompt_type text NOT NULL CHECK (prompt_type IN ('filter', 'analysis', 'cover_letter')),
  prompt_text text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_name ON ai_prompts(name);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_type_active ON ai_prompts(prompt_type, is_active);

COMMENT ON TABLE ai_prompts IS 'Хранение версионированных AI промптов для фильтра и анализа';
COMMENT ON COLUMN ai_prompts.name IS 'Уникальное имя промпта (например: filter_v1, analysis_v2)';
COMMENT ON COLUMN ai_prompts.prompt_type IS 'Тип промпта: filter, analysis, или cover_letter';
COMMENT ON COLUMN ai_prompts.is_active IS 'Активен ли промпт для использования';


-- Таблица профилей пользователей (для multi-user в будущем)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  email text,
  full_name text,
  skills jsonb NOT NULL DEFAULT '[]',
  experience jsonb NOT NULL DEFAULT '{}',
  constraints jsonb NOT NULL DEFAULT '{}',
  goals jsonb NOT NULL DEFAULT '{}',
  portfolio_items jsonb NOT NULL DEFAULT '[]',
  hourly_rate_min numeric,
  hourly_rate_target numeric,
  availability_hours_per_week integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

COMMENT ON TABLE user_profiles IS 'Профили пользователей для персонализации AI анализа';
COMMENT ON COLUMN user_profiles.skills IS 'JSON массив навыков пользователя';
COMMENT ON COLUMN user_profiles.experience IS 'JSON объект с опытом работы и портфолио';
COMMENT ON COLUMN user_profiles.constraints IS 'JSON объект с ограничениями (что НЕ делает)';
COMMENT ON COLUMN user_profiles.goals IS 'JSON объект с целями (тип проектов, budget range, etc)';


-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON ai_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();