// e북 진행률 관리 훅
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface EbookProgress {
  id: number;
  juwoo_id: number;
  book_id: string;
  current_page: number;
  total_pages: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useEbookProgress(bookId: string, totalPages: number) {
  const [progress, setProgress] = useState<EbookProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 진행률 로드
  const loadProgress = useCallback(async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ebook_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('book_id', bookId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine for new books
        throw fetchError;
      }

      setProgress(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  // 진행률 저장
  const saveProgress = useCallback(async (currentPage: number) => {
    if (!bookId || totalPages === 0) return;

    const isCompleted = currentPage >= totalPages - 1;

    try {
      const { data, error: upsertError } = await supabase
        .from('ebook_progress')
        .upsert({
          juwoo_id: 1,
          book_id: bookId,
          current_page: currentPage,
          total_pages: totalPages,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'juwoo_id,book_id',
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      setProgress(data);
      return { isCompleted, isFirstCompletion: !progress?.is_completed && isCompleted };
    } catch (err) {
      setError(err as Error);
      return { isCompleted: false, isFirstCompletion: false };
    }
  }, [bookId, totalPages, progress?.is_completed]);

  // 처음 완독 여부 확인 (포인트 지급용)
  const markAsCompleted = useCallback(async () => {
    if (!bookId || totalPages === 0) return false;

    // 이미 완독했으면 false 반환
    if (progress?.is_completed) return false;

    const result = await saveProgress(totalPages - 1);
    return result?.isFirstCompletion || false;
  }, [bookId, totalPages, progress?.is_completed, saveProgress]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    error,
    saveProgress,
    markAsCompleted,
    reload: loadProgress,
    isCompleted: progress?.is_completed || false,
    currentPage: progress?.current_page || 0,
  };
}

// 모든 책의 진행률 가져오기
export async function getAllEbookProgress(): Promise<EbookProgress[]> {
  const { data, error } = await supabase
    .from('ebook_progress')
    .select('*')
    .eq('juwoo_id', 1);

  if (error) throw error;
  return data || [];
}

// 특정 책의 완독 여부 확인
export async function isBookCompleted(bookId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('ebook_progress')
    .select('is_completed')
    .eq('juwoo_id', 1)
    .eq('book_id', bookId)
    .single();

  if (error) return false;
  return data?.is_completed || false;
}
