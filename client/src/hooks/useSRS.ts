// SRS (간격반복) 시스템 훅
// Leitner 5-Box 시스템 기반
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SRS_REVIEW_INTERVALS, MAX_DAILY_REVIEW } from '@/lib/englishConstants';

export interface WordSRS {
  id: number;
  juwoo_id: number;
  word: string;
  meaning: string;
  pronunciation: string | null;
  category: string | null;
  unit_id: string | null;
  difficulty: string;
  box: 1 | 2 | 3 | 4 | 5;
  correct_streak: number;
  total_attempts: number;
  total_correct: number;
  pronunciation_best_score: number;
  next_review_at: string;
  last_attempt_at: string | null;
  last_correct_at: string | null;
  created_at: string;
  updated_at: string;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function useSRS() {
  const [reviewWords, setReviewWords] = useState<WordSRS[]>([]);
  const [gardenStats, setGardenStats] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);

  // 오늘 복습할 단어 조회
  const loadReviewWords = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('english_word_srs')
        .select('*')
        .eq('juwoo_id', 1)
        .lte('next_review_at', now)
        .order('box', { ascending: true }) // 낮은 박스(어려운 단어) 우선
        .order('next_review_at', { ascending: true })
        .limit(MAX_DAILY_REVIEW);

      if (error) throw error;
      setReviewWords(data ?? []);
    } catch (err) {
      console.error('SRS review load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 단어 정원 통계 조회
  const loadGardenStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('english_word_srs')
        .select('box')
        .eq('juwoo_id', 1);

      if (error) throw error;

      const stats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      (data ?? []).forEach((row) => {
        stats[row.box] = (stats[row.box] ?? 0) + 1;
      });
      setGardenStats(stats);
      setTotalWords((data ?? []).length);
    } catch (err) {
      console.error('Garden stats load error:', err);
    }
  }, []);

  // SRS 업데이트 (정답/오답/모르겠어요)
  const updateWord = useCallback(async (
    wordId: number,
    result: 'correct' | 'wrong' | 'dont_know',
    pronunciationScore?: number,
  ) => {
    try {
      const { data: current, error: fetchErr } = await supabase
        .from('english_word_srs')
        .select('*')
        .eq('id', wordId)
        .single();

      if (fetchErr) throw fetchErr;
      if (!current) return;

      const now = new Date();
      let newBox: number;
      let correctStreak: number;

      if (result === 'correct') {
        newBox = Math.min(current.box + 1, 5);
        correctStreak = current.correct_streak + 1;
      } else if (result === 'dont_know') {
        // 모르겠어요: 1단계만 하락 (솔직함에 대한 보상)
        newBox = Math.max(1, current.box - 1);
        correctStreak = 0;
      } else {
        // 오답: 최대 2단계 하락 (좌절 방지)
        newBox = Math.max(1, current.box - 2);
        correctStreak = 0;
      }

      const interval = SRS_REVIEW_INTERVALS[newBox] ?? 0;
      const nextReview = addDays(now, interval);

      const updateData: Record<string, unknown> = {
        box: newBox,
        correct_streak: correctStreak,
        total_attempts: current.total_attempts + 1,
        total_correct: result === 'correct' ? current.total_correct + 1 : current.total_correct,
        next_review_at: nextReview.toISOString(),
        last_attempt_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      if (result === 'correct') {
        updateData.last_correct_at = now.toISOString();
      }

      if (pronunciationScore != null && pronunciationScore > current.pronunciation_best_score) {
        updateData.pronunciation_best_score = pronunciationScore;
      }

      const { error: updateErr } = await supabase
        .from('english_word_srs')
        .update(updateData)
        .eq('id', wordId);

      if (updateErr) throw updateErr;
      return { newBox, correctStreak };
    } catch (err) {
      console.error('SRS update error:', err);
      return null;
    }
  }, []);

  // 새 단어를 SRS에 등록
  const addWord = useCallback(async (word: {
    word: string;
    meaning: string;
    pronunciation?: string;
    category?: string;
    unit_id?: string;
    difficulty?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('english_word_srs')
        .upsert({
          juwoo_id: 1,
          word: word.word,
          meaning: word.meaning,
          pronunciation: word.pronunciation ?? null,
          category: word.category ?? null,
          unit_id: word.unit_id ?? null,
          difficulty: word.difficulty ?? 'easy',
          box: 1,
          next_review_at: new Date().toISOString(),
        }, {
          onConflict: 'juwoo_id,word',
        })
        .select();

      if (error) throw error;
      return data?.[0] ?? null;
    } catch (err) {
      console.error('SRS add word error:', err);
      return null;
    }
  }, []);

  // 여러 단어를 한 번에 등록
  const addWords = useCallback(async (words: {
    word: string;
    meaning: string;
    pronunciation?: string;
    category?: string;
    unit_id?: string;
    difficulty?: string;
  }[]) => {
    try {
      const rows = words.map((w) => ({
        juwoo_id: 1,
        word: w.word,
        meaning: w.meaning,
        pronunciation: w.pronunciation ?? null,
        category: w.category ?? null,
        unit_id: w.unit_id ?? null,
        difficulty: w.difficulty ?? 'easy',
        box: 1,
        next_review_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('english_word_srs')
        .upsert(rows, { onConflict: 'juwoo_id,word' });

      if (error) throw error;
    } catch (err) {
      console.error('SRS bulk add error:', err);
    }
  }, []);

  // 유닛별 단어 조회
  const getWordsByUnit = useCallback(async (unitId: string): Promise<WordSRS[]> => {
    try {
      const { data, error } = await supabase
        .from('english_word_srs')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('unit_id', unitId)
        .order('box', { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error('SRS unit words error:', err);
      return [];
    }
  }, []);

  // 유닛 마스터리 퍼센트 (박스 3 이상 비율)
  const getUnitMastery = useCallback(async (unitId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('english_word_srs')
        .select('box')
        .eq('juwoo_id', 1)
        .eq('unit_id', unitId);

      if (error) throw error;
      if (!data || data.length === 0) return 0;

      const mastered = data.filter((w) => w.box >= 3).length;
      return Math.round((mastered / data.length) * 100);
    } catch (err) {
      console.error('SRS unit mastery error:', err);
      return 0;
    }
  }, []);

  // 단어명으로 SRS 업데이트 (퀴즈에서 사용 — word명 기반)
  const updateWordByName = useCallback(async (
    word: string,
    result: 'correct' | 'wrong' | 'dont_know',
    pronunciationScore?: number,
  ) => {
    try {
      const { data, error } = await supabase
        .from('english_word_srs')
        .select('id')
        .eq('juwoo_id', 1)
        .eq('word', word)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return updateWord(data.id, result, pronunciationScore);
    } catch (err) {
      console.error('SRS updateWordByName error:', err);
      return null;
    }
  }, [updateWord]);

  useEffect(() => {
    loadReviewWords();
    loadGardenStats();
  }, [loadReviewWords, loadGardenStats]);

  const reload = useCallback(async () => {
    await Promise.all([loadReviewWords(), loadGardenStats()]);
  }, [loadReviewWords, loadGardenStats]);

  return {
    reviewWords,
    gardenStats,
    totalWords,
    loading,
    updateWord,
    updateWordByName,
    addWord,
    addWords,
    getWordsByUnit,
    getUnitMastery,
    reload,
  };
}
