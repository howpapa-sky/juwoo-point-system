// 퀴즈 세션 플로우 관리 — 워밍업 → 소개카드 → 본학습 → 보너스라운드 → 완료
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizMode, SessionPhase, ThemeKey } from '@/lib/quizConstants';
import { QUIZ_THEMES } from '@/lib/quizConstants';
import type { QuizQuestion } from '@/lib/quizEngine';
import { checkAnswer } from '@/lib/quizEngine';
import type { EnglishWord } from '@/data/englishWordsData';
import { useQuizSound } from '@/hooks/useQuizSound';
import CharacterBuddy, { getBuddyMessage } from './CharacterBuddy';
import QuizFeedbackBanner from './QuizFeedbackBanner';
import QuizProgressBar from './shared/QuizProgressBar';
import ComboCounter from './shared/ComboCounter';
import XPAnimation from './shared/XPAnimation';
import EnergyBar from './shared/EnergyBar';
import IntroCard from './types/IntroCard';
import MultipleChoice from './types/MultipleChoice';
import ListeningQuiz from './types/ListeningQuiz';
import MatchingQuiz from './types/MatchingQuiz';
import FillBlankQuiz from './types/FillBlankQuiz';
import SpellingQuiz from './types/SpellingQuiz';
import ReverseQuiz from './types/ReverseQuiz';
import SpeedRound from './types/SpeedRound';
import BossBattle from './types/BossBattle';
import SurvivalMode from './types/SurvivalMode';

interface Props {
  theme: ThemeKey;
  mode: QuizMode;
  questions: QuizQuestion[];
  onComplete: (result: SessionResult) => void;
  onExit: () => void;
  showHints?: boolean;
}

export interface SessionResult {
  correctCount: number;
  totalQuestions: number;
  score: number;
  maxStreak: number;
  earnedXP: number;
  wrongWords: EnglishWord[];
  speedCount?: number;
  bossHP?: number;
  bossName?: string;
}

export default function QuizSessionManager({
  theme, mode, questions, onComplete, onExit, showHints = true,
}: Props) {
  const currentTheme = QUIZ_THEMES[theme];
  const { playSound, speakWord, speakSlow } = useQuizSound();

  // 세션 상태
  const [phase, setPhase] = useState<SessionPhase>('greeting');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<EnglishWord[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [earnedXP, setEarnedXP] = useState(0);
  const [lastXP, setLastXP] = useState(0);

  // 피드백 배너
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [feedbackWord, setFeedbackWord] = useState<EnglishWord | null>(null);
  const [buddyMood, setBuddyMood] = useState<'greeting' | 'correct' | 'wrong' | 'combo' | 'hint' | 'dontknow' | 'bonus' | 'complete'>('greeting');

  const currentQ = questions[currentIndex];

  // 인사 후 자동 진행
  useEffect(() => {
    if (phase === 'greeting') {
      const timer = setTimeout(() => {
        // 스피드/보스/서바이벌은 바로 메인으로
        if (['speed-round', 'time-attack', 'boss-battle', 'survival'].includes(mode)) {
          setPhase('main');
        } else {
          setPhase('main');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, mode]);

  // 일반 문제 답변 처리
  const handleAnswer = useCallback((answer: string, usedHint: boolean) => {
    if (!currentQ) return;
    const isCorrect = checkAnswer(answer, currentQ.correctAnswer, currentQ.questionType);
    const word = currentQ.word;
    const baseXP = { easy: 10, medium: 15, hard: 25, expert: 40 };
    let xpGained = baseXP[word.difficulty as keyof typeof baseXP] ?? 10;
    if (usedHint) xpGained = Math.floor(xpGained * 0.7); // 힌트 사용 시 30% 감소 (부분 점수)

    if (isCorrect) {
      const newStreak = streak + 1;
      const basePoints = word.difficulty === 'easy' ? 10 :
                         word.difficulty === 'medium' ? 15 :
                         word.difficulty === 'hard' ? 25 : 40;
      const streakBonus = Math.min(newStreak * 3, 30);
      const comboMultiplier = Math.min(combo, 5);
      const totalPoints = Math.floor((basePoints + streakBonus) * comboMultiplier);

      if (newStreak >= 10) xpGained *= 2;
      else if (newStreak >= 5) xpGained *= 1.5;
      else if (newStreak >= 3) xpGained *= 1.2;

      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + totalPoints);
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      setCombo(prev => Math.min(prev + 0.2, 5));
      setEarnedXP(prev => prev + Math.floor(xpGained));
      setLastXP(Math.floor(xpGained));

      playSound(newStreak >= 5 ? 'streak' : 'correct');
      setBuddyMood(newStreak >= 3 ? 'combo' : 'correct');
    } else {
      setStreak(0);
      setCombo(1);
      setWrongWords(prev => [...prev, word]);
      playSound('wrong');
      setBuddyMood('wrong');
    }

    // 피드백 배너 표시
    setFeedbackCorrect(isCorrect);
    setFeedbackWord(word);
    setShowFeedback(true);
  }, [currentQ, streak, combo, playSound]);

  // 다음 문제로 이동
  const handleNext = useCallback(() => {
    setShowFeedback(false);
    setLastXP(0);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 본학습 끝
      if (wrongWords.length > 0 && phase === 'main') {
        setPhase('bonus-round');
        setBuddyMood('bonus');
      } else {
        setPhase('complete');
        onComplete({
          correctCount, totalQuestions: questions.length, score,
          maxStreak, earnedXP, wrongWords,
        });
      }
    }
  }, [currentIndex, questions.length, wrongWords, phase, correctCount, score, maxStreak, earnedXP, onComplete]);

  // 매칭 퀴즈 완료
  const handleMatchingComplete = useCallback((matchCorrect: number, _totalPairs: number) => {
    setCorrectCount(prev => prev + matchCorrect);
    setEarnedXP(prev => prev + matchCorrect * 10);
    handleNext();
  }, [handleNext]);

  // 스피드/보스/서바이벌 완료
  const handleSpecialComplete = useCallback((result: {
    correctCount: number;
    totalAnswered?: number;
    bossHP?: number;
    bossName?: string;
  }) => {
    playSound('complete');
    onComplete({
      correctCount: result.correctCount,
      totalQuestions: result.totalAnswered ?? questions.length,
      score, maxStreak, earnedXP, wrongWords,
      speedCount: result.totalAnswered,
      bossHP: result.bossHP,
      bossName: result.bossName,
    });
  }, [playSound, onComplete, questions.length, score, maxStreak, earnedXP, wrongWords]);

  // 인사 화면
  if (phase === 'greeting') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary} flex items-center justify-center`}>
        <div className="text-center p-8">
          <CharacterBuddy message={getBuddyMessage('greeting')} size="lg" />
        </div>
      </div>
    );
  }

  // 스피드 라운드
  if (mode === 'speed-round' || mode === 'time-attack') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary}`}>
        <div className="container max-w-4xl py-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onExit} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> 나가기
            </Button>
          </div>
          <SpeedRound
            questions={questions}
            timeLimit={mode === 'speed-round' ? 60 : 120}
            onComplete={(correct, total) => handleSpecialComplete({ correctCount: correct, totalAnswered: total })}
            onSpeak={speakWord}
            playSound={playSound}
          />
        </div>
      </div>
    );
  }

  // 보스 배틀
  if (mode === 'boss-battle') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary}`}>
        <div className="container max-w-4xl py-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onExit} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> 나가기
            </Button>
          </div>
          <BossBattle
            questions={questions}
            onComplete={(correct, hp, name) =>
              handleSpecialComplete({ correctCount: correct, bossHP: hp, bossName: name })
            }
            onSpeak={speakWord}
            playSound={playSound}
          />
        </div>
      </div>
    );
  }

  // 서바이벌
  if (mode === 'survival') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary}`}>
        <div className="container max-w-4xl py-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onExit} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> 나가기
            </Button>
          </div>
          <SurvivalMode
            questions={questions}
            onComplete={(correct, total) => handleSpecialComplete({ correctCount: correct, totalAnswered: total })}
            onSpeak={speakWord}
            playSound={playSound}
          />
        </div>
      </div>
    );
  }

  // 일반 세션 (본학습 + 보너스 라운드)
  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.secondary}`}>
      <div className="container max-w-4xl py-6 px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onExit} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> 나가기
          </Button>
          <div className="flex items-center gap-2">
            <EnergyBar correctCount={correctCount} totalAnswered={currentIndex + (showFeedback ? 1 : 0)} />
            <ComboCounter streak={streak} combo={combo} />
          </div>
        </div>

        {/* 진행바 */}
        <QuizProgressBar
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          modeLabel={phase === 'bonus-round' ? '보너스 라운드' : mode}
          difficulty={currentQ?.word.difficulty}
          score={score}
        />

        {/* XP 애니메이션 */}
        <XPAnimation xp={lastXP} show={lastXP > 0} />

        {/* 보너스 라운드 안내 */}
        {phase === 'bonus-round' && currentIndex === 0 && (
          <div className="mb-4">
            <CharacterBuddy message={getBuddyMessage('bonus')} />
          </div>
        )}

        {/* 문제 렌더링 */}
        <AnimatePresence mode="wait">
          {currentQ && !showFeedback && (
            <div key={`q-${currentIndex}`}>
              {currentQ.isIntroCard ? (
                <IntroCard
                  word={currentQ.word}
                  onComplete={handleNext}
                  onSpeak={speakWord}
                  onSpeakSlow={speakSlow}
                />
              ) : currentQ.questionType === 'listening' ? (
                <ListeningQuiz
                  word={currentQ.word}
                  options={currentQ.options ?? []}
                  onAnswer={handleAnswer}
                  onSpeak={speakWord}
                  onSpeakSlow={speakSlow}
                />
              ) : currentQ.questionType === 'matching' ? (
                <MatchingQuiz
                  pairs={questions.slice(currentIndex, currentIndex + 4).map(q => q.word)}
                  onComplete={handleMatchingComplete}
                  onSpeak={speakWord}
                />
              ) : currentQ.questionType === 'fill-blank' ? (
                <FillBlankQuiz
                  word={currentQ.word}
                  options={currentQ.options ?? []}
                  onAnswer={handleAnswer}
                  onSpeak={speakWord}
                  onSpeakSlow={speakSlow}
                />
              ) : currentQ.questionType === 'word-scramble' ? (
                <SpellingQuiz
                  word={currentQ.word}
                  scrambledLetters={currentQ.scrambledLetters ?? currentQ.word.word.split('').sort(() => Math.random() - 0.5)}
                  onAnswer={handleAnswer}
                  onSpeak={speakWord}
                  onSpeakSlow={speakSlow}
                />
              ) : currentQ.questionType === 'reverse' ? (
                <ReverseQuiz
                  word={currentQ.word}
                  options={currentQ.options ?? []}
                  onAnswer={handleAnswer}
                  onSpeak={speakWord}
                />
              ) : (
                /* 기본: 객관식 (multiple-choice, picture-match 등) */
                <MultipleChoice
                  word={currentQ.word}
                  options={currentQ.options ?? []}
                  onAnswer={handleAnswer}
                  onSpeak={speakWord}
                  onSpeakSlow={speakSlow}
                  showHint={showHints}
                />
              )}
            </div>
          )}
        </AnimatePresence>

        {/* 피드백 배너 */}
        {feedbackWord && (
          <QuizFeedbackBanner
            visible={showFeedback}
            isCorrect={feedbackCorrect}
            word={feedbackWord}
            buddyMessage={getBuddyMessage(buddyMood)}
            onNext={handleNext}
            onSpeak={speakWord}
          />
        )}
      </div>
    </div>
  );
}
