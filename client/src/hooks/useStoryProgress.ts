// 스토리 진행 상태 관리 훅
// english_story_progress 테이블 연동
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface StoryProgressRow {
  id: number;
  juwoo_id: number;
  story_id: string;
  current_page: number;
  total_pages: number;
  completed: boolean;
  interactions_completed: number;
  started_at: string;
  completed_at: string | null;
}

export function useStoryProgress() {
  const [loading, setLoading] = useState(false);

  // 스토리 진행 상태 로드
  const loadProgress = useCallback(async (storyId: string): Promise<StoryProgressRow | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('english_story_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('story_id', storyId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Story progress load error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 진행 상태 저장 (upsert)
  const saveProgress = useCallback(async (
    storyId: string,
    currentPage: number,
    totalPages: number,
    interactionsCompleted: number,
    isCompleted: boolean,
  ) => {
    try {
      const updateData: Record<string, unknown> = {
        juwoo_id: 1,
        story_id: storyId,
        current_page: currentPage,
        total_pages: totalPages,
        interactions_completed: interactionsCompleted,
        completed: isCompleted,
      };

      if (isCompleted) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('english_story_progress')
        .upsert(updateData, { onConflict: 'juwoo_id,story_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Story progress save error:', err);
    }
  }, []);

  // 완료한 스토리 목록 조회
  const getCompletedStories = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('english_story_progress')
        .select('story_id')
        .eq('juwoo_id', 1)
        .eq('completed', true);

      if (error) throw error;
      return (data ?? []).map((row) => row.story_id);
    } catch (err) {
      console.error('Completed stories error:', err);
      return [];
    }
  }, []);

  return {
    loading,
    loadProgress,
    saveProgress,
    getCompletedStories,
  };
}
