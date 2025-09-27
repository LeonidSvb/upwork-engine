'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface SummaryStats {
  total_jobs: number;
  passed_filter: number;
  total_processed: number;
  pending_analysis: number;
  avg_score: number | null;
  pass_rate_percent: number | null;
}

export interface DailyStats {
  day: string;
  total_jobs: number;
  passed_filter: number;
  total_processed: number;
  avg_score: number | null;
}

export function useJobsStats() {
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Получаем общую статистику
        const { data: summaryData, error: summaryError } = await supabase
          .from('jobs_summary_stats')
          .select('*')
          .single();

        if (summaryError) {
          throw summaryError;
        }

        // Получаем статистику по дням
        const { data: dailyData, error: dailyError } = await supabase
          .from('jobs_daily_stats')
          .select('*')
          .order('day', { ascending: true });

        if (dailyError) {
          throw dailyError;
        }

        setSummaryStats(summaryData);
        setDailyStats(dailyData || []);
      } catch (err: any) {
        console.error('Ошибка загрузки статистики:', err);
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return {
    summaryStats,
    dailyStats,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      fetchStats();
    }
  };

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);

      // Получаем общую статистику
      const { data: summaryData, error: summaryError } = await supabase
        .from('jobs_summary_stats')
        .select('*')
        .single();

      if (summaryError) {
        throw summaryError;
      }

      // Получаем статистику по дням
      const { data: dailyData, error: dailyError } = await supabase
        .from('jobs_daily_stats')
        .select('*')
        .order('day', { ascending: true });

      if (dailyError) {
        throw dailyError;
      }

      setSummaryStats(summaryData);
      setDailyStats(dailyData || []);
    } catch (err: any) {
      console.error('Ошибка загрузки статистики:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }
}