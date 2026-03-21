// ============================================
// 실수 친구 도감 — "실수를 없애야 할 적이 아닌, 함께 데리고 다니는 친구"
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Star, Volume2, Sparkles, Heart,
} from 'lucide-react';
import { useMistakeFriends, type MistakeFriend } from '@/hooks/useMistakeFriends';
import { usePronunciation } from '@/hooks/usePronunciation';

export default function MistakeFriends() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { friends, loading, loadFriends, nameFriend } = useMistakeFriends();
  const { speak } = usePronunciation();

  const [selectedFriend, setSelectedFriend] = useState<MistakeFriend | null>(null);
  const [namingFriend, setNamingFriend] = useState<MistakeFriend | null>(null);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadFriends();
    }
  }, [isAuthenticated, loadFriends]);

  const handleNameSubmit = useCallback(async () => {
    if (!namingFriend || !nameInput.trim()) return;
    const success = await nameFriend(namingFriend.id, nameInput.trim());
    if (success) {
      setNamingFriend(null);
      setNameInput('');
      await loadFriends();
    }
  }, [namingFriend, nameInput, nameFriend, loadFriends]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-2xl font-black mb-2">로그인이 필요해요</h2>
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const masteredFriends = friends.filter((f) => f.is_mastered);
  const activeFriends = friends.filter((f) => !f.is_mastered);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-2">
          <Link href="/english-learning">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full mb-3">
            <Users className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">실수 친구 도감</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">실수 친구들</h1>
          <p className="text-slate-500">아직 배우는 중인 단어들이야!</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm rounded-2xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black text-amber-600">{activeFriends.length}</p>
              <p className="text-sm text-amber-700">배우는 중</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-yellow-100 to-amber-100 shadow-sm rounded-2xl">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-black text-yellow-600">{masteredFriends.length}</p>
              <p className="text-sm text-yellow-700">완벽히 외웠어!</p>
            </CardContent>
          </Card>
        </div>

        {/* 빈 상태 */}
        {friends.length === 0 && !loading && (
          <Card className="border-0 bg-white/80 shadow-lg rounded-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🌟
              </motion.div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                아직 실수 친구가 없어요
              </h3>
              <p className="text-slate-500">
                틀려도 괜찮아, 친구가 생기는 거야!<br />
                퀴즈를 풀다 보면 실수 친구가 찾아올 거예요.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 배우는 중인 친구들 */}
        {activeFriends.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🤔</span> 배우는 중인 친구들
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activeFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onTap={() => setSelectedFriend(friend)}
                  onName={() => {
                    setNamingFriend(friend);
                    setNameInput(friend.friend_name ?? '');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 마스터한 친구들 */}
        {masteredFriends.length > 0 && (
          <div>
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="text-lg">⭐</span> 완벽히 외웠어!
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {masteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onTap={() => setSelectedFriend(friend)}
                  isMastered
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 이름 짓기 모달 */}
      <AnimatePresence>
        {namingFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setNamingFriend(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <span className="text-5xl">{namingFriend.friend_emoji}</span>
                <h3 className="text-xl font-black mt-2">실수 친구 이름 짓기!</h3>
                <p className="text-slate-500 text-sm mt-1">
                  "{namingFriend.word}" = {namingFriend.meaning}
                </p>
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="이름을 지어줘!"
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl text-center text-lg font-bold focus:outline-none focus:border-amber-500"
                maxLength={20}
                style={{ fontSize: 18, minHeight: 48 }}
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setNamingFriend(null)}
                >
                  나중에
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl"
                  onClick={handleNameSubmit}
                  disabled={!nameInput.trim()}
                >
                  이름 짓기!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단어 상세 모달 */}
      <AnimatePresence>
        {selectedFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelectedFriend(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <span className="text-6xl">{selectedFriend.friend_emoji}</span>
                {selectedFriend.friend_name && (
                  <p className="text-lg font-bold text-amber-600 mt-2">
                    {selectedFriend.friend_name}
                  </p>
                )}
                <div className="mt-4 mb-2">
                  <p className="text-3xl font-black text-slate-800">{selectedFriend.word}</p>
                  <p className="text-lg text-slate-600 mt-1">{selectedFriend.meaning}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-600"
                  onClick={() => speak(selectedFriend.word)}
                >
                  <Volume2 className="h-4 w-4" />
                  발음 듣기
                </Button>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500">
                  <span>만난 횟수: {selectedFriend.encounter_count}번</span>
                  {selectedFriend.is_mastered && (
                    <span className="text-yellow-600 font-bold flex items-center gap-1">
                      <Star className="h-4 w-4" /> 마스터!
                    </span>
                  )}
                </div>
              </div>
              <Button
                className="w-full mt-4 h-12 rounded-xl"
                variant="outline"
                onClick={() => setSelectedFriend(null)}
              >
                닫기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 실수 친구 카드 컴포넌트
function FriendCard({
  friend,
  onTap,
  onName,
  isMastered = false,
}: {
  friend: MistakeFriend;
  onTap: () => void;
  onName?: () => void;
  isMastered?: boolean;
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Card
        className={`border-0 shadow-md rounded-2xl cursor-pointer active:scale-[0.98] transition-all overflow-hidden ${
          isMastered ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' : 'bg-white/90'
        }`}
        onClick={onTap}
      >
        <CardContent className="p-4">
          <div className="text-center">
            <span className="text-3xl">{friend.friend_emoji}</span>
            {friend.friend_name ? (
              <p className="text-sm font-bold text-amber-600 mt-1 truncate">{friend.friend_name}</p>
            ) : onName ? (
              <button
                className="text-sm text-blue-500 mt-1 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onName();
                }}
              >
                이름 짓기
              </button>
            ) : null}
            <p className="text-base font-black text-slate-800 mt-1">{friend.word}</p>
            <p className="text-sm text-slate-500">{friend.meaning}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-sm text-slate-400">
              <Heart className="h-3 w-3" />
              <span>만난 횟수: {friend.encounter_count}번</span>
            </div>
            {isMastered && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full">
                <Sparkles className="h-3 w-3 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-700">완벽히 외웠어!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
