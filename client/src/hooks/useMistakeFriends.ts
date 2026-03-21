// 실수 친구 도감 훅
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface MistakeFriend {
  id: number;
  word: string;
  meaning: string;
  friend_name: string | null;
  friend_emoji: string;
  encounter_count: number;
  is_mastered: boolean;
  mastered_at: string | null;
  first_met_at: string;
  last_met_at: string;
}

export function useMistakeFriends() {
  const [friends, setFriends] = useState<MistakeFriend[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mistake_friends')
        .select('*')
        .order('last_met_at', { ascending: false });

      if (error) throw error;
      setFriends(data ?? []);
    } catch (err) {
      if (import.meta.env.DEV) console.error('실수 친구 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 오답 발생 시 실수 친구 등록 또는 업데이트
  const recordMistake = useCallback(async (word: string, meaning: string): Promise<MistakeFriend | null> => {
    try {
      // 이미 존재하는지 확인
      const { data: existing, error: fetchErr } = await supabase
        .from('mistake_friends')
        .select('*')
        .eq('word', word)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (existing) {
        // encounter_count 증가
        const { data: updated, error: updateErr } = await supabase
          .from('mistake_friends')
          .update({
            encounter_count: existing.encounter_count + 1,
            last_met_at: new Date().toISOString(),
            // 마스터 상태 리셋 (다시 틀림)
            is_mastered: false,
            mastered_at: null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        return updated;
      } else {
        // 새 실수 친구 등록
        const { data: created, error: insertErr } = await supabase
          .from('mistake_friends')
          .insert({
            word,
            meaning,
            friend_emoji: getRandomEmoji(),
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        return created;
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('실수 친구 기록 에러:', err);
      return null;
    }
  }, []);

  // 실수 친구 이름 짓기
  const nameFriend = useCallback(async (friendId: number, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('mistake_friends')
        .update({ friend_name: name })
        .eq('id', friendId);

      if (error) throw error;
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('실수 친구 이름 짓기 에러:', err);
      return false;
    }
  }, []);

  // 정답 시 마스터 체크 (3회 연속 정답)
  const recordCorrect = useCallback(async (word: string): Promise<{ mastered: boolean } | null> => {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('mistake_friends')
        .select('*')
        .eq('word', word)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!existing || existing.is_mastered) return null;

      // correct_streak는 SRS에서 관리하므로 여기서는 encounter_count 기반 체크
      // 간단히: 해당 단어가 실수 친구인데 정답 맞추면 encounter_count 감소
      const newCount = Math.max(0, existing.encounter_count - 1);
      const isMastered = newCount <= 0;

      const { error: updateErr } = await supabase
        .from('mistake_friends')
        .update({
          encounter_count: newCount,
          is_mastered: isMastered,
          mastered_at: isMastered ? new Date().toISOString() : null,
          last_met_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateErr) throw updateErr;
      return { mastered: isMastered };
    } catch (err) {
      if (import.meta.env.DEV) console.error('실수 친구 정답 기록 에러:', err);
      return null;
    }
  }, []);

  return {
    friends,
    loading,
    loadFriends,
    recordMistake,
    recordCorrect,
    nameFriend,
  };
}

const EMOJIS = ['🤔', '😅', '🙃', '🤭', '😮', '🧐', '🤓', '😊', '🌟', '💫', '🌈', '🦊', '🐱', '🐶', '🐰'];

function getRandomEmoji(): string {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}
