'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, CheckCircle, XCircle } from 'lucide-react';

interface AnalyzeButtonProps {
  jobId: string;
}

export default function AnalyzeButton({ jobId }: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Ошибка анализа');
      }

      setResult(data);
    } catch (error: any) {
      console.error('Ошибка анализа:', error);
      setResult({
        error: true,
        message: error.message
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (result?.error) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Ошибка
      </Badge>
    );
  }

  if (result?.filter) {
    return (
      <div className="flex items-center gap-1">
        <Badge
          variant={result.filter.passed ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          {result.filter.passed ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {result.filter.passed ? 'Прошел' : 'Не прошел'}
        </Badge>
        {result.analysis && (
          <Badge variant="outline" className="text-xs">
            {result.analysis.overall_score}/100
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      size="sm"
      variant="default"
      className="flex items-center gap-1"
    >
      {isAnalyzing ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Brain className="w-3 h-3" />
      )}
      {isAnalyzing ? 'Анализ...' : 'AI'}
    </Button>
  );
}