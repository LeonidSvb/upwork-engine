-- Создание view для агрегации статистики по дням
CREATE OR REPLACE VIEW jobs_daily_stats AS
SELECT
    DATE(created_at) as day,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN filter_passed = true THEN 1 END) as passed_filter,
    COUNT(CASE WHEN filter_passed IS NOT NULL THEN 1 END) as total_processed,
    ROUND(AVG(
        CASE
            WHEN ai_analysis IS NOT NULL
            AND ai_analysis::jsonb ? 'overall_score'
            THEN (ai_analysis::jsonb->>'overall_score')::numeric
        END
    ), 1) as avg_score
FROM jobs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Создание view для общей статистики
CREATE OR REPLACE VIEW jobs_summary_stats AS
SELECT
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN filter_passed = true THEN 1 END) as passed_filter,
    COUNT(CASE WHEN filter_passed IS NOT NULL THEN 1 END) as total_processed,
    COUNT(CASE WHEN filter_passed IS NULL THEN 1 END) as pending_analysis,
    ROUND(AVG(
        CASE
            WHEN ai_analysis IS NOT NULL
            AND ai_analysis::jsonb ? 'overall_score'
            THEN (ai_analysis::jsonb->>'overall_score')::numeric
        END
    ), 1) as avg_score,
    ROUND(
        (COUNT(CASE WHEN filter_passed = true THEN 1 END)::float /
         NULLIF(COUNT(CASE WHEN filter_passed IS NOT NULL THEN 1 END), 0)) * 100,
        1
    ) as pass_rate_percent
FROM jobs;