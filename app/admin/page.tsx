'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptData {
  text: string;
  updated_at?: string;
}

const PROMPT_TYPES = [
  {
    key: 'filter',
    name: 'Фильтр',
    description: 'Быстрый фильтр для первичной оценки вакансий (GPT-4o-mini)'
  },
  {
    key: 'analysis',
    name: 'Анализ',
    description: 'Глубокий анализ вакансий с детальными рекомендациями (GPT-4o)'
  }
];

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Record<string, PromptData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Загружаем промпты при монтировании
  useEffect(() => {
    PROMPT_TYPES.forEach(type => {
      loadPrompt(type.key);
    });
  }, []);

  const loadPrompt = async (promptKey: string) => {
    setLoading(prev => ({ ...prev, [promptKey]: true }));

    try {
      const response = await fetch(`/api/prompts/${promptKey}`);

      if (response.ok) {
        const data = await response.json();
        setPrompts(prev => ({
          ...prev,
          [promptKey]: {
            text: data.text || '',
            updated_at: data.updated_at
          }
        }));
      } else {
        setPrompts(prev => ({
          ...prev,
          [promptKey]: { text: '' }
        }));
      }
    } catch (error) {
      console.error(`Ошибка загрузки промпта ${promptKey}:`, error);
      toast({
        title: 'Ошибка',
        description: `Не удалось загрузить промпт ${promptKey}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [promptKey]: false }));
    }
  };

  const savePrompt = async (promptKey: string) => {
    const promptText = prompts[promptKey]?.text;

    if (!promptText?.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Текст промпта не может быть пустым',
        variant: 'destructive'
      });
      return;
    }

    setSaving(prev => ({ ...prev, [promptKey]: true }));

    try {
      const response = await fetch(`/api/prompts/${promptKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: promptText.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: 'Успешно',
          description: `Промпт "${promptKey}" обновлен (версия ${data.version || 'новая'})`
        });

        // Перезагружаем промпт чтобы получить updated_at
        await loadPrompt(promptKey);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сохранения');
      }
    } catch (error: any) {
      console.error(`Ошибка сохранения промпта ${promptKey}:`, error);
      toast({
        title: 'Ошибка',
        description: error.message || `Не удалось сохранить промпт ${promptKey}`,
        variant: 'destructive'
      });
    } finally {
      setSaving(prev => ({ ...prev, [promptKey]: false }));
    }
  };

  const updatePromptText = (promptKey: string, text: string) => {
    setPrompts(prev => ({
      ...prev,
      [promptKey]: {
        ...prev[promptKey],
        text
      }
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не обновлялся';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Админка AI Промптов</h1>
        <p className="text-muted-foreground mt-2">
          Управление промптами для AI анализа вакансий. Изменения применяются мгновенно.
        </p>
      </div>

      <Tabs defaultValue="filter" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {PROMPT_TYPES.map(type => (
            <TabsTrigger key={type.key} value={type.key}>
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {PROMPT_TYPES.map(type => (
          <TabsContent key={type.key} value={type.key}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {type.name}
                      <Badge variant="outline">{type.key}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {type.description}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Обновлен:</div>
                    <div>{formatDate(prompts[type.key]?.updated_at)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {loading[type.key] ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Загрузка промпта...</span>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={prompts[type.key]?.text || ''}
                      onChange={(e) => updatePromptText(type.key, e.target.value)}
                      placeholder={`Введите промпт для ${type.name.toLowerCase()}...`}
                      className="min-h-[300px] font-mono text-sm"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={() => savePrompt(type.key)}
                        disabled={saving[type.key] || !prompts[type.key]?.text?.trim()}
                      >
                        {saving[type.key] ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => loadPrompt(type.key)}
                        disabled={loading[type.key]}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Перезагрузить
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">ℹ️ Информация</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Промпты сохраняются с версионированием - каждое изменение создает новую версию</li>
          <li>• Изменения применяются мгновенно для всех новых запросов к AI</li>
          <li>• При ошибке загрузки используются встроенные дефолтные промпты</li>
          <li>• Все изменения логируются в системе winston</li>
        </ul>
      </div>
    </div>
  );
}