'use client';

import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { JobsChart } from '@/components/dashboard/JobsChart';
import { useJobsStats } from '@/lib/hooks/useJobsStats';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { summaryStats, dailyStats, loading, error, refetch } = useJobsStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Хедер */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              К вакансиям
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Аналитика</h1>
            <p className="text-sm text-muted-foreground">
              Статистика обработки вакансий Upwork
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Ошибка загрузки данных: {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="mt-2"
          >
            Попробовать снова
          </Button>
        </div>
      )}

      {/* KPI карточки */}
      <StatsCards stats={summaryStats} loading={loading} />

      {/* График */}
      <JobsChart data={dailyStats} loading={loading} />

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Краткая сводка */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Краткая сводка</h3>
          {summaryStats && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Всего получено:</span>
                <span className="font-medium">{summaryStats.total_jobs} вакансий</span>
              </div>
              <div className="flex justify-between">
                <span>Проанализировано:</span>
                <span className="font-medium">
                  {summaryStats.total_processed}
                  ({Math.round((summaryStats.total_processed / summaryStats.total_jobs) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Успешность фильтра:</span>
                <span className="font-medium text-green-600">
                  {summaryStats.pass_rate_percent?.toFixed(1)}%
                </span>
              </div>
              {summaryStats.avg_score && (
                <div className="flex justify-between">
                  <span>Средний рейтинг:</span>
                  <span className="font-medium">{summaryStats.avg_score}/10</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Рекомендации */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Рекомендации</h3>
          <div className="space-y-2 text-sm">
            {summaryStats && (
              <>
                {summaryStats.pass_rate_percent && summaryStats.pass_rate_percent < 15 && (
                  <p className="text-orange-600">
                    • Низкая успешность фильтра. Рассмотрите корректировку критериев.
                  </p>
                )}
                {summaryStats.pending_analysis > 10 && (
                  <p className="text-blue-600">
                    • {summaryStats.pending_analysis} вакансий ожидают анализа.
                  </p>
                )}
                {summaryStats.avg_score && summaryStats.avg_score < 6 && (
                  <p className="text-red-600">
                    • Средний рейтинг вакансий низкий. Возможно стоит пересмотреть источники.
                  </p>
                )}
                {summaryStats.pass_rate_percent && summaryStats.pass_rate_percent > 30 && (
                  <p className="text-green-600">
                    • Отличная успешность фильтра! Система работает эффективно.
                  </p>
                )}
              </>
            )}
            <p className="text-gray-600">
              • Регулярно проверяйте качество отобранных вакансий.
            </p>
            <p className="text-gray-600">
              • Анализируйте тренды для улучшения фильтров.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}