'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyStats } from '@/lib/hooks/useJobsStats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface JobsChartProps {
  data: DailyStats[];
  loading: boolean;
}

export function JobsChart({ data, loading }: JobsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика вакансий</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика вакансий</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  // Форматируем данные для графика
  const chartData = data.map((item) => ({
    ...item,
    dayFormatted: format(new Date(item.day), 'dd MMM', { locale: ru }),
    failed_filter: item.total_processed - item.passed_filter
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{format(new Date(data.day), 'dd MMMM yyyy', { locale: ru })}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-blue-600">●</span> Всего: {data.total_jobs}
            </p>
            <p className="text-sm">
              <span className="text-green-600">●</span> Прошли фильтр: {data.passed_filter}
            </p>
            <p className="text-sm">
              <span className="text-red-400">●</span> Не прошли: {data.failed_filter}
            </p>
            <p className="text-sm">
              Обработано: {data.total_processed} из {data.total_jobs}
            </p>
            {data.avg_score && (
              <p className="text-sm">
                Средний рейтинг: {data.avg_score}/10
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика вакансий за последние 30 дней</CardTitle>
        <p className="text-sm text-muted-foreground">
          Показывает количество полученных вакансий и результаты фильтрации по дням
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dayFormatted"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <YAxis fontSize={12} tick={{ fill: '#666' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar
                dataKey="total_jobs"
                fill="#3b82f6"
                name="Всего получено"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="passed_filter"
                fill="#10b981"
                name="Прошли фильтр"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="failed_filter"
                fill="#f87171"
                name="Не прошли фильтр"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Всего получено</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Прошли фильтр</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Не прошли фильтр</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}