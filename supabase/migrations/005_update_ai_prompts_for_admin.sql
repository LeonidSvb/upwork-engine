-- Упрощение структуры ai_prompts для удобства администрирования
-- Добавляем простое поле slug для идентификации без версионирования

ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS slug text;

-- Создаем уникальный индекс для slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_prompts_slug_unique ON ai_prompts(slug) WHERE slug IS NOT NULL;

-- Добавляем комментарий
COMMENT ON COLUMN ai_prompts.slug IS 'Простой идентификатор для API (filter, analysis, etc)';

-- Заполняем slug для существующих записей
UPDATE ai_prompts SET slug = prompt_type WHERE slug IS NULL;

-- Функция для получения активного промпта по slug
CREATE OR REPLACE FUNCTION get_active_prompt(prompt_slug text)
RETURNS TABLE(prompt_text text, updated_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT ap.prompt_text, ap.updated_at
  FROM ai_prompts ap
  WHERE ap.slug = prompt_slug
    AND ap.is_active = true
  ORDER BY ap.version DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_prompt IS 'Получает активный промпт по slug';