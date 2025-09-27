import { NextRequest, NextResponse } from 'next/server';
import { runQuickFilter } from '@/lib/ai-filter';
import { runDeepAnalysis } from '@/lib/ai-analysis';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID обязателен' },
        { status: 400 }
      );
    }

    console.log(`Запуск анализа для вакансии ${jobId}`);

    const filterResult = await runQuickFilter(jobId);
    console.log(`Фильтр: ${filterResult.passed ? 'ПРОШЕЛ' : 'НЕ ПРОШЕЛ'} - ${filterResult.reason}`);

    let analysisResult = null;

    if (filterResult.passed) {
      console.log('Запуск глубокого анализа...');
      analysisResult = await runDeepAnalysis(jobId);
      console.log(`Анализ завершен. Score: ${analysisResult.overall_score}`);
    }

    return NextResponse.json({
      success: true,
      filter: filterResult,
      analysis: analysisResult,
      message: filterResult.passed
        ? 'Фильтр пройден, анализ выполнен'
        : 'Вакансия не прошла фильтр'
    });

  } catch (error: any) {
    console.error('Ошибка анализа:', error);

    return NextResponse.json(
      {
        error: 'Ошибка при выполнении анализа',
        details: error.message
      },
      { status: 500 }
    );
  }
}