// 학습 유닛 진행 상태 관리 훅
// english_unit_progress 테이블 연동 + 해금 로직
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LEARNING_PATH, type LearningUnit } from '@/data/learningPath';

export interface UnitProgressRow {
  id: number;
  juwoo_id: number;
  unit_id: string;
  status: 'locked' | 'active' | 'completed';
  words_mastered: number;
  total_words: number;
  mastery_percent: number;
  started_at: string | null;
  completed_at: string | null;
}

export function useUnitProgress() {
  const [progress, setProgress] = useState<UnitProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('english_unit_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .order('unit_id', { ascending: true });

      if (error) throw error;
      setProgress(data ?? []);
    } catch (err) {
      console.error('Unit progress load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 유닛 상태 가져오기 (없으면 locked)
  const getUnitStatus = useCallback((unitId: string): UnitProgressRow['status'] => {
    const row = progress.find((p) => p.unit_id === unitId);
    return row?.status ?? 'locked';
  }, [progress]);

  // 유닛 진행률 가져오기
  const getUnitProgress = useCallback((unitId: string): UnitProgressRow | null => {
    return progress.find((p) => p.unit_id === unitId) ?? null;
  }, [progress]);

  // 해금 조건 체크 (learningPath 기반)
  const checkUnlock = useCallback(async (
    unitId: string,
    getUnitMastery: (unitId: string) => Promise<number>,
  ): Promise<boolean> => {
    const unit = LEARNING_PATH.find((u: LearningUnit) => u.id === unitId);
    if (!unit) return false;

    // 첫 번째 유닛은 항상 해금
    if (!unit.unlockCondition.previousUnitId) return true;

    const prevUnitId = unit.unlockCondition.previousUnitId;
    const requiredMastery = unit.unlockCondition.requiredMastery;

    // 이전 유닛 마스터리 체크
    const mastery = await getUnitMastery(prevUnitId);
    return mastery >= requiredMastery;
  }, []);

  // 유닛 활성화
  const activateUnit = useCallback(async (unitId: string) => {
    const unit = LEARNING_PATH.find((u: LearningUnit) => u.id === unitId);
    if (!unit) return;

    try {
      const { error } = await supabase
        .from('english_unit_progress')
        .upsert({
          juwoo_id: 1,
          unit_id: unitId,
          status: 'active',
          total_words: unit.targetWords.length,
          started_at: new Date().toISOString(),
        }, { onConflict: 'juwoo_id,unit_id' });

      if (error) throw error;
      await loadProgress();
    } catch (err) {
      console.error('Unit activate error:', err);
    }
  }, [loadProgress]);

  // 유닛 완료 처리
  const completeUnit = useCallback(async (unitId: string) => {
    try {
      const { error } = await supabase
        .from('english_unit_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('juwoo_id', 1)
        .eq('unit_id', unitId);

      if (error) throw error;
      await loadProgress();
    } catch (err) {
      console.error('Unit complete error:', err);
    }
  }, [loadProgress]);

  // 마스터리 업데이트
  const updateMastery = useCallback(async (unitId: string, wordsMastered: number, masteryPercent: number) => {
    try {
      const { error } = await supabase
        .from('english_unit_progress')
        .update({
          words_mastered: wordsMastered,
          mastery_percent: masteryPercent,
        })
        .eq('juwoo_id', 1)
        .eq('unit_id', unitId);

      if (error) throw error;
    } catch (err) {
      console.error('Mastery update error:', err);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    getUnitStatus,
    getUnitProgress,
    checkUnlock,
    activateUnit,
    completeUnit,
    updateMastery,
    reload: loadProgress,
  };
}
