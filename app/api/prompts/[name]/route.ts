import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/logging';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { name } = await params;
    const slug = name;

    log.api.request('GET prompt по slug', {
      method: 'GET',
      url: `/api/prompts/${slug}`
    }, { requestId });

    const { data, error } = await supabase
      .from('ai_prompts')
      .select('prompt_text, updated_at')
      .eq('prompt_type', slug)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      log.database.error('Ошибка получения промпта', {
        operation: 'select',
        table: 'ai_prompts',
        slug,
        error: error.message
      }, { requestId });

      return NextResponse.json(
        { error: 'Промпт не найден' },
        { status: 404 }
      );
    }

    const prompt = data;

    log.api.response('Промпт получен', {
      slug,
      found: true,
      textLength: prompt.prompt_text?.length || 0
    }, { requestId });

    return NextResponse.json({
      text: prompt.prompt_text,
      updated_at: prompt.updated_at
    });

  } catch (error: any) {
    log.api.error('Ошибка API промптов', {
      method: 'GET',
      error: error.message
    }, { requestId });

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { name } = await params;
    const slug = name;
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Текст промпта обязателен' },
        { status: 400 }
      );
    }

    log.api.request('POST обновление промпта', {
      method: 'POST',
      url: `/api/prompts/${slug}`,
      textLength: text.length
    }, { requestId });

    // Инкрементируем версию для нового промпта
    const { data: currentPrompt } = await supabase
      .from('ai_prompts')
      .select('version')
      .eq('prompt_type', slug)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = (currentPrompt?.version || 0) + 1;

    // Деактивируем старый промпт
    await supabase
      .from('ai_prompts')
      .update({ is_active: false })
      .eq('prompt_type', slug);

    // Создаем новый активный промпт
    const { error } = await supabase
      .from('ai_prompts')
      .insert({
        name: `${slug}_v${newVersion}`,
        prompt_type: slug,
        prompt_text: text,
        version: newVersion,
        is_active: true
      });

    if (error) {
      log.database.error('Ошибка сохранения промпта', {
        operation: 'insert',
        table: 'ai_prompts',
        slug,
        version: newVersion,
        error: error.message
      }, { requestId });

      return NextResponse.json(
        { error: 'Ошибка сохранения промпта' },
        { status: 500 }
      );
    }

    log.database.success('Промпт обновлен', {
      operation: 'insert',
      table: 'ai_prompts',
      slug,
      version: newVersion,
      textLength: text.length
    }, { requestId });

    return NextResponse.json({
      success: true,
      version: newVersion,
      message: 'Промпт успешно обновлен'
    });

  } catch (error: any) {
    log.api.error('Ошибка API промптов', {
      method: 'POST',
      error: error.message
    }, { requestId });

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}