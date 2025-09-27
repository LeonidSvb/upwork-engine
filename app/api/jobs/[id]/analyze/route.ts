import { NextRequest, NextResponse } from 'next/server';
import { runQuickFilter } from '@/lib/ai-filter';
import { runDeepAnalysis } from '@/lib/ai-analysis';
import { log } from '@/lib/logging';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const resolvedParams = await params;

  try {
    const jobId = resolvedParams.id;

    if (!jobId) {
      log.api.error('Отсутствует Job ID в запросе анализа', {
        method: 'POST',
        url: `/api/jobs/analyze`,
        statusCode: 400
      }, { requestId });

      return NextResponse.json(
        { error: 'Job ID обязателен' },
        { status: 400 }
      );
    }

    log.info(`Запуск анализа для вакансии ${jobId}`, {
      jobId,
      operation: 'analyze_job'
    }, { requestId });

    const filterResult = await runQuickFilter(jobId, requestId);

    log.info(`Фильтр ${filterResult.passed ? 'ПРОШЕЛ' : 'НЕ ПРОШЕЛ'}`, {
      jobId,
      filterPassed: filterResult.passed,
      filterReason: filterResult.reason
    }, { requestId });

    let analysisResult = null;

    if (filterResult.passed) {
      log.info('Запуск глубокого анализа', {
        jobId,
        operation: 'deep_analysis'
      }, { requestId });

      analysisResult = await runDeepAnalysis(jobId, requestId);

      log.info(`Анализ завершен`, {
        jobId,
        overallScore: analysisResult.overall_score,
        operation: 'analysis_completed'
      }, { requestId });
    }

    const duration = Date.now() - startTime;

    log.api.response('Анализ вакансии завершен', {
      method: 'POST',
      url: `/api/jobs/${jobId}/analyze`,
      statusCode: 200,
      duration
    }, { requestId });

    return NextResponse.json({
      success: true,
      filter: filterResult,
      analysis: analysisResult,
      message: filterResult.passed
        ? 'Фильтр пройден, анализ выполнен'
        : 'Вакансия не прошла фильтр'
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;

    log.api.error('Ошибка при выполнении анализа', {
      method: 'POST',
      url: `/api/jobs/${resolvedParams.id}/analyze`,
      statusCode: 500,
      duration,
      error: error.message
    }, { requestId });

    return NextResponse.json(
      {
        error: 'Ошибка при выполнении анализа',
        details: error.message
      },
      { status: 500 }
    );
  }
}