'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SummaryStats } from '@/lib/hooks/useJobsStats';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: SummaryStats | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Нет данных</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passRate = stats.pass_rate_percent || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Всего вакансий */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего вакансий</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_jobs}</div>
          <p className="text-xs text-muted-foreground">
            Получено через webhook
          </p>
        </CardContent>
      </Card>

      {/* Проанализировано */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Проанализировано</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_processed}</div>
          <p className="text-xs text-muted-foreground">
            из {stats.total_jobs} ({Math.round((stats.total_processed / stats.total_jobs) * 100)}%)
          </p>
        </CardContent>
      </Card>

      {/* Прошли фильтр */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Прошли фильтр</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.passed_filter}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={passRate >= 30 ? "default" : passRate >= 15 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {passRate.toFixed(1)}%
            </Badge>
            <p className="text-xs text-muted-foreground">успешность</p>
          </div>
        </CardContent>
      </Card>

      {/* Средний score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avg_score ? `${stats.avg_score}/10` : '—'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.pending_analysis > 0
              ? `${stats.pending_analysis} в ожидании`
              : 'Все обработаны'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}