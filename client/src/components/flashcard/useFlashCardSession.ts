// 플래시카드 세션 상태 관리 훅
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { englishWordsData, type EnglishWord, type WordCategory, type WordDifficulty } from '@/data/englishWordsData';
import { useSRS } from '@/hooks/useSRS';
import { useXP } from '@/hooks/useXP';
import { usePronunciation } from '@/hooks/usePronunciation';
import { useBadges } from '@/hooks/useBadges';
import { adjustPoints } from '@/lib/pointsHelper';
import { randomMessage, WRONG_MESSAGES } from '@/lib/englishConstants';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export type LearningMode = 'classic' | 'matching' | 'spelling' | 'listening';
export type GamePhase = 'setup' | 'learning' | 'result';

export interface LearningStats {
  totalCards: number;
  knownCards: number;
  unknownCards: number;
  streak: number;
  maxStreak: number;
  xp: number;
  stars: number;
  perfectRounds: number;
}

export interface MatchCard {
  id: string;
  content: string;
  type: 'word' | 'meaning';
  wordId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const difficultyConfig: Record<WordDifficulty, {
  label: string; stars: number; xpMultiplier: number;
}> = {
  easy: { label: '쉬움', stars: 1, xpMultiplier: 1 },
  medium: { label: '보통', stars: 2, xpMultiplier: 1.5 },
  hard: { label: '어려움', stars: 3, xpMultiplier: 2 },
  expert: { label: '전문가', stars: 4, xpMultiplier: 3 },
};

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const encouragements = {
  correct: ['대단해! 🌟', '완벽해! ⭐', '멋져요! 🎉', '천재야! 🧠', '굉장해! 🚀', '최고야! 👑'],
  streak: ['불꽃 연속 정답! 🔥', '연속 성공! ⚡', '멈출 수 없어! 💫', '완전 집중! 🎯'],
  wrong: ['괜찮아, 다시 해보자! 💪', '다음엔 맞출 수 있어! ⭐', '포기하지 마! 🔥'],
};

const getRandomMessage = (type: keyof typeof encouragements) =>
  encouragements[type][Math.floor(Math.random() * encouragements[type].length)];

const fireConfetti = (type: 'success' | 'perfect') => {
  confetti(type === 'perfect'
    ? { particleCount: 100, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#d97706'] }
    : { particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#22c55e', '#10b981', '#14b8a6'] }
  );
};

export function useFlashCardSession() {
  const { updateWordByName, addWords } = useSRS();
  const { addXP, updateStreak } = useXP();
  const { speak } = usePronunciation();
  const { checkAndAwardBadges } = useBadges();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [mode, setMode] = useState<LearningMode>('classic');
  const [selectedCategories, setSelectedCategories] = useState<WordCategory[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<WordDifficulty | 'all'>('all');
  const [cardCount, setCardCount] = useState(10);

  // Learning state
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownWords, setKnownWords] = useState<number[]>([]);
  const [unknownWords, setUnknownWords] = useState<number[]>([]);
  const [wordSrsBoxes, setWordSrsBoxes] = useState<Record<string, number>>({});

  // Stats
  const [stats, setStats] = useState<LearningStats>({
    totalCards: 0, knownCards: 0, unknownCards: 0,
    streak: 0, maxStreak: 0, xp: 0, stars: 0, perfectRounds: 0,
  });
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [floatingXp, setFloatingXp] = useState<{ amount: number; id: number } | null>(null);

  // Matching game
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedMatchCards, setSelectedMatchCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [matchMoves, setMatchMoves] = useState(0);

  // Spelling
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingHint, setSpellingHint] = useState(0);
  const [showSpellingAnswer, setShowSpellingAnswer] = useState(false);

  // Classic quiz
  const [classicOptions, setClassicOptions] = useState<EnglishWord[]>([]);
  const [selectedClassicAnswer, setSelectedClassicAnswer] = useState<number | null>(null);
  const [isClassicAnswered, setIsClassicAnswered] = useState(false);

  // Listening
  const [listeningOptions, setListeningOptions] = useState<EnglishWord[]>([]);
  const [selectedListeningAnswer, setSelectedListeningAnswer] = useState<number | null>(null);
  const [isListeningAnswered, setIsListeningAnswered] = useState(false);

  const currentWord = words[currentIndex];

  // Filtered words
  const filteredWords = useMemo(() => {
    let filtered = englishWordsData;
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(w => selectedCategories.includes(w.category));
    }
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(w => w.difficulty === selectedDifficulty);
    } else {
      const easy = filtered.filter(w => w.difficulty === 'easy');
      const medium = filtered.filter(w => w.difficulty === 'medium');
      const hard = filtered.filter(w => w.difficulty === 'hard');
      const easyCount = Math.ceil(cardCount * 0.6);
      const mediumCount = Math.ceil(cardCount * 0.3);
      filtered = [
        ...shuffleArray(easy).slice(0, easyCount),
        ...shuffleArray(medium).slice(0, mediumCount),
        ...shuffleArray(hard).slice(0, cardCount - easyCount - mediumCount),
      ];
    }
    return filtered;
  }, [selectedCategories, selectedDifficulty, cardCount]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(englishWordsData.map(w => w.category))) as WordCategory[];
  }, []);

  // Init functions
  const initClassicQuiz = useCallback((correctWord: EnglishWord, allWords: EnglishWord[]) => {
    const sameCat = allWords.filter(w => w.id !== correctWord.id && w.category === correctWord.category);
    const other = allWords.filter(w => w.id !== correctWord.id && w.category !== correctWord.category);
    const distractors: EnglishWord[] = [];
    for (const w of shuffleArray(sameCat)) {
      if (distractors.length >= 2) break; // 3지선다 (designTokens: maxChoices: 3)
      if (!distractors.find(d => d.meaning === w.meaning)) distractors.push(w);
    }
    for (const w of shuffleArray(other)) {
      if (distractors.length >= 2) break;
      if (!distractors.find(d => d.meaning === w.meaning) && w.meaning !== correctWord.meaning) distractors.push(w);
    }
    setClassicOptions(shuffleArray([correctWord, ...distractors]));
    setSelectedClassicAnswer(null);
    setIsClassicAnswered(false);
  }, []);

  const initMatchingGame = useCallback((gameWords: EnglishWord[]) => {
    const cards: MatchCard[] = [];
    gameWords.forEach((word, idx) => {
      cards.push({ id: `word-${idx}`, content: word.word, type: 'word', wordId: word.id, isFlipped: false, isMatched: false });
      cards.push({ id: `meaning-${idx}`, content: word.meaning, type: 'meaning', wordId: word.id, isFlipped: false, isMatched: false });
    });
    setMatchCards(shuffleArray(cards));
    setSelectedMatchCards([]);
    setMatchedPairs([]);
    setMatchMoves(0);
  }, []);

  const initListeningGame = useCallback((correctWord: EnglishWord, allWords: EnglishWord[]) => {
    const others = shuffleArray(allWords.filter(w => w.id !== correctWord.id)).slice(0, 2); // 3지선다
    setListeningOptions(shuffleArray([correctWord, ...others]));
    setSelectedListeningAnswer(null);
    setIsListeningAnswered(false);
  }, []);

  // Save learning progress
  const saveLearningProgress = useCallback(async (wordId: number, isCorrect: boolean) => {
    try {
      const { data: existing } = await supabase
        .from('english_learning_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .eq('word_id', wordId)
        .single();

      if (existing) {
        await supabase.from('english_learning_progress').update({
          review_count: existing.review_count + 1,
          correct_count: existing.correct_count + (isCorrect ? 1 : 0),
          mastery_level: isCorrect ? Math.min(5, existing.mastery_level + 1) : Math.max(0, existing.mastery_level - 1),
          last_reviewed_at: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('english_learning_progress').insert({
          juwoo_id: 1, word_id: wordId, review_count: 1,
          correct_count: isCorrect ? 1 : 0, mastery_level: isCorrect ? 1 : 0,
          last_reviewed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('학습 기록 저장 실패:', error);
    }
  }, []);

  // Next card
  const nextCard = useCallback(() => {
    setSpellingInput('');
    setSpellingHint(0);
    setShowSpellingAnswer(false);
    setSelectedListeningAnswer(null);
    setIsListeningAnswered(false);
    setSelectedClassicAnswer(null);
    setIsClassicAnswered(false);

    if (currentIndex < words.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (mode === 'classic') initClassicQuiz(words[nextIdx], englishWordsData);
      if (mode === 'listening') initListeningGame(words[nextIdx], words);
    } else {
      finishGame();
    }
  }, [currentIndex, words, mode, initClassicQuiz, initListeningGame]);

  // Finish game
  const finishGame = useCallback(async () => {
    const isPerfect = stats.totalCards > 0 && stats.knownCards === stats.totalCards;
    if (isPerfect) {
      setStats(prev => ({ ...prev, perfectRounds: prev.perfectRounds + 1 }));
      fireConfetti('perfect');
    } else {
      fireConfetti('success');
    }

    const basePoints = 200;
    const bonusPoints = Math.floor(stats.xp / 2);
    const totalPoints = basePoints + bonusPoints;

    const result = await adjustPoints({
      amount: totalPoints,
      note: `[영어-learn] 플래시카드 학습 완료 (${mode} 모드)${isPerfect ? ' - 퍼펙트!' : ''}`,
    });

    if (result.success) {
      toast.success(`🎉 ${totalPoints} 포인트 획득!`);
    }

    const learnedCount = stats.knownCards + stats.unknownCards;
    for (let i = 0; i < learnedCount; i++) {
      await addXP('new_word_learned');
    }
    await updateStreak();
    setTimeout(() => checkAndAwardBadges(), 1000);

    setPhase('result');
  }, [stats, mode, addXP, updateStreak, checkAndAwardBadges]);

  // Start game
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(filteredWords).slice(0, cardCount);
    if (shuffled.length === 0) {
      toast('선택한 조건에 맞는 단어가 없어요!', { icon: '📭' });
      return;
    }

    setWords(shuffled);
    setCurrentIndex(0);
    setKnownWords([]);
    setUnknownWords([]);
    setStats({ totalCards: shuffled.length, knownCards: 0, unknownCards: 0, streak: 0, maxStreak: 0, xp: 0, stars: 0, perfectRounds: 0 });

    const srsWords = shuffled.map(w => ({
      word: w.word, meaning: w.meaning,
      pronunciation: w.pronunciation ?? undefined,
      category: w.category, difficulty: w.difficulty,
    }));
    addWords(srsWords).then(async () => {
      const { data } = await supabase
        .from('english_word_srs')
        .select('word, box')
        .eq('juwoo_id', 1)
        .in('word', shuffled.map(w => w.word));
      if (data) {
        const boxes: Record<string, number> = {};
        data.forEach(row => { boxes[row.word] = row.box; });
        setWordSrsBoxes(boxes);
      }
    });

    if (mode === 'classic') initClassicQuiz(shuffled[0], englishWordsData);
    else if (mode === 'matching') initMatchingGame(shuffled.slice(0, Math.min(6, shuffled.length)));
    else if (mode === 'listening') initListeningGame(shuffled[0], shuffled);

    setPhase('learning');
  }, [filteredWords, cardCount, mode, addWords, initClassicQuiz, initMatchingGame, initListeningGame]);

  // Classic answer
  const handleClassicAnswer = useCallback(async (wordId: number) => {
    if (isClassicAnswered || !currentWord) return;
    setSelectedClassicAnswer(wordId);
    setIsClassicAnswered(true);

    const isCorrect = wordId === currentWord.id;
    if (isCorrect) {
      const xpGain = Math.floor(10 * difficultyConfig[currentWord.difficulty].xpMultiplier);
      const newStreak = stats.streak + 1;
      setKnownWords(prev => [...prev, currentWord.id]);
      setStats(prev => ({
        ...prev, knownCards: prev.knownCards + 1,
        streak: newStreak, maxStreak: Math.max(prev.maxStreak, newStreak),
        xp: prev.xp + xpGain, stars: prev.stars + difficultyConfig[currentWord.difficulty].stars,
      }));
      saveLearningProgress(currentWord.id, true);
      updateWordByName(currentWord.word, 'correct').then(r => {
        if (r) setWordSrsBoxes(prev => ({ ...prev, [currentWord.word]: r.newBox }));
      });
      setFloatingXp({ amount: xpGain, id: Date.now() });
      setTimeout(() => setFloatingXp(null), 1000);

      if (newStreak >= 3 && newStreak % 3 === 0) {
        setShowStreakAnimation(true);
        fireConfetti('success');
        toast.success(getRandomMessage('streak'));
        setTimeout(() => setShowStreakAnimation(false), 1500);
      } else {
        toast.success(getRandomMessage('correct'));
      }
      speak(currentWord.word);
      setTimeout(() => nextCard(), 1500);
    } else {
      setUnknownWords(prev => [...prev, currentWord.id]);
      setStats(prev => ({ ...prev, unknownCards: prev.unknownCards + 1, streak: 0 }));
      saveLearningProgress(currentWord.id, false);
      updateWordByName(currentWord.word, 'wrong').then(r => {
        if (r) setWordSrsBoxes(prev => ({ ...prev, [currentWord.word]: r.newBox }));
      });
      toast(getRandomMessage('wrong'), { icon: '💪' });
      setTimeout(() => nextCard(), 2500);
    }
  }, [isClassicAnswered, currentWord, stats.streak, saveLearningProgress, updateWordByName, speak, nextCard]);

  // Matching click
  const handleMatchCardClick = useCallback((cardId: string) => {
    const card = matchCards.find(c => c.id === cardId);
    if (!card || card.isMatched || selectedMatchCards.includes(cardId) || selectedMatchCards.length >= 2) return;

    const newSelected = [...selectedMatchCards, cardId];
    setSelectedMatchCards(newSelected);
    setMatchCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newSelected.length === 2) {
      setMatchMoves(prev => prev + 1);
      const [first, second] = newSelected.map(id => matchCards.find(c => c.id === id)!);

      if (first.wordId === second.wordId && first.type !== second.type) {
        setTimeout(() => {
          setMatchCards(prev => prev.map(c => c.wordId === first.wordId ? { ...c, isMatched: true } : c));
          setMatchedPairs(prev => [...prev, first.wordId]);
          setSelectedMatchCards([]);
          setStats(prev => ({ ...prev, xp: prev.xp + 15, stars: prev.stars + 2, streak: prev.streak + 1 }));
          fireConfetti('success');
          const word = words.find(w => w.id === first.wordId);
          if (word) {
            speak(word.word);
            updateWordByName(word.word, 'correct').then(r => {
              if (r) setWordSrsBoxes(prev => ({ ...prev, [word.word]: r.newBox }));
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          setMatchCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, isFlipped: false } : c));
          setSelectedMatchCards([]);
          setStats(prev => ({ ...prev, streak: 0 }));
        }, 1000);
      }
    }
  }, [matchCards, selectedMatchCards, words, speak, updateWordByName]);

  // Spelling
  const getSpellingHintText = useCallback(() => {
    if (!currentWord) return '';
    const word = currentWord.word;
    if (spellingHint === 0) return '_'.repeat(word.length).split('').join(' ');
    return word.split('').map((char, i) => i < spellingHint ? char : '_').join(' ');
  }, [currentWord, spellingHint]);

  const handleSpellingSubmit = useCallback(() => {
    if (!currentWord) return;
    const isCorrect = spellingInput.toLowerCase().trim() === currentWord.word.toLowerCase();

    if (isCorrect) {
      const xpGain = Math.max(5, 20 - spellingHint * 3);
      setStats(prev => ({
        ...prev, knownCards: prev.knownCards + 1, xp: prev.xp + xpGain,
        stars: prev.stars + (spellingHint === 0 ? 5 : 3),
        streak: prev.streak + 1, maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
      }));
      fireConfetti('success');
      toast.success(`정답! +${xpGain} XP 🎉`);
      speak(currentWord.word);
      updateWordByName(currentWord.word, 'correct').then(r => {
        if (r) setWordSrsBoxes(prev => ({ ...prev, [currentWord.word]: r.newBox }));
      });
      setTimeout(() => nextCard(), 1500);
    } else {
      setShowSpellingAnswer(true);
      setStats(prev => ({ ...prev, unknownCards: prev.unknownCards + 1, streak: 0 }));
      updateWordByName(currentWord.word, 'wrong').then(r => {
        if (r) setWordSrsBoxes(prev => ({ ...prev, [currentWord.word]: r.newBox }));
      });
      toast(randomMessage(WRONG_MESSAGES), { icon: '💪' });
    }
  }, [currentWord, spellingInput, spellingHint, speak, updateWordByName, nextCard]);

  const handleSpellingHint = useCallback(() => {
    if (!currentWord || spellingHint >= currentWord.word.length) return;
    setSpellingHint(prev => prev + 1);
    toast('힌트를 사용했어요! 💡', { icon: '💡' });
  }, [currentWord, spellingHint]);

  // Listening answer
  const handleListeningAnswer = useCallback((wordId: number) => {
    if (isListeningAnswered || !currentWord) return;
    setSelectedListeningAnswer(wordId);
    setIsListeningAnswered(true);
    const isCorrect = wordId === currentWord.id;

    if (isCorrect) {
      setStats(prev => ({
        ...prev, knownCards: prev.knownCards + 1, xp: prev.xp + 15,
        stars: prev.stars + 3, streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
      }));
      fireConfetti('success');
      toast.success('정답! 귀가 좋아요! 👂✨');
      updateWordByName(currentWord.word, 'correct').then(r => {
        if (r) setWordSrsBoxes(prev => ({ ...prev, [currentWord.word]: r.newBox }));
      });
    } else {
      setStats(prev => ({ ...prev, unknownCards: prev.unknownCards + 1, streak: 0 }));
      toast(randomMessage(WRONG_MESSAGES), { icon: '💪', description: `정답: ${currentWord.meaning}` });
      updateWordByName(currentWord.word, 'wrong').then(r => {
        if (r) setWordSrsBoxes(prev => ({ ...prev, [currentWord.word]: r.newBox }));
      });
    }
    setTimeout(() => nextCard(), 2000);
  }, [isListeningAnswered, currentWord, updateWordByName, nextCard]);

  const playCurrentWord = useCallback(() => {
    if (currentWord) speak(currentWord.word);
  }, [currentWord, speak]);

  const resetGame = useCallback(() => {
    setPhase('setup');
    setStats({ totalCards: 0, knownCards: 0, unknownCards: 0, streak: 0, maxStreak: 0, xp: 0, stars: 0, perfectRounds: 0 });
  }, []);

  return {
    // State
    phase, mode, selectedCategories, selectedDifficulty, cardCount,
    words, currentIndex, currentWord, knownWords, unknownWords, wordSrsBoxes,
    stats, showStreakAnimation, floatingXp,
    matchCards, selectedMatchCards, matchedPairs, matchMoves,
    spellingInput, spellingHint, showSpellingAnswer,
    classicOptions, selectedClassicAnswer, isClassicAnswered,
    listeningOptions, selectedListeningAnswer, isListeningAnswered,
    filteredWords, availableCategories,
    // Setters
    setMode, setSelectedCategories, setSelectedDifficulty, setCardCount,
    setSpellingInput,
    // Actions
    startGame, resetGame, nextCard, finishGame,
    handleClassicAnswer, handleMatchCardClick,
    handleSpellingSubmit, handleSpellingHint, getSpellingHintText,
    handleListeningAnswer, playCurrentWord,
    speak,
    difficultyConfig,
  };
}
