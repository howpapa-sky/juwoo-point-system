import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Volume2, Star, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";

// 임시 샘플 데이터
const sampleWords = [
  { id: 1, word: 'cat', meaning: '고양이', category: '동물' },
  { id: 2, word: 'dog', meaning: '강아지', category: '동물' },
  { id: 3, word: 'apple', meaning: '사과', category: '과일' },
  { id: 4, word: 'banana', meaning: '바나나', category: '과일' },
  { id: 5, word: 'red', meaning: '빨강', category: '색깔' },
  { id: 6, word: 'blue', meaning: '파랑', category: '색깔' },
  { id: 7, word: 'one', meaning: '하나', category: '숫자' },
  { id: 8, word: 'two', meaning: '둘', category: '숫자' },
  { id: 9, word: 'mom', meaning: '엄마', category: '가족' },
  { id: 10, word: 'dad', meaning: '아빠', category: '가족' },
];

interface QuizQuestion {
  word: string;
  correctAnswer: string;
  options: string[];
}

export default function EnglishQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalQuestions = 10;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100;

  // 퀴즈 문제 생성
  useEffect(() => {
    if (isAuthenticated) {
      generateQuestions();
    }
  }, [isAuthenticated]);

  const generateQuestions = () => {
    const shuffled = [...sampleWords].sort(() => Math.random() - 0.5);
    const quizQuestions: QuizQuestion[] = shuffled.slice(0, totalQuestions).map((word) => {
      // 오답 선택지 생성
      const wrongAnswers = sampleWords
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.meaning);

      // 선택지 섞기
      const options = [...wrongAnswers, word.meaning].sort(() => Math.random() - 0.5);

      return {
        word: word.word,
        correctAnswer: word.meaning,
        options,
      };
    });

    setQuestions(quizQuestions);
  };

  // 음성 재생
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 답안 선택
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectCount(correctCount + 1);
      toast.success('정답이에요! 🎉');
      // 축하 효과
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      toast.error(`틀렸어요! 정답은 "${currentQuestion.correctAnswer}"예요.`);
    }
  };

  // 포인트 적립 함수
  const awardPoints = async (score: number) => {
    try {
      // 현재 포인트 조회
      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      let points = 0;
      let note = '';

      if (score === 100) {
        points = 1000;
        note = '영어 퀴즈 만점 달성!';
      } else if (score >= 70) {
        points = 500;
        note = `영어 퀴즈 ${score}점 달성!`;
      }

      if (points > 0) {
        const newBalance = currentBalance + points;

        // 포인트 적립
        await supabase
          .from('point_transactions')
          .insert({
            juwoo_id: 1,
            amount: points,
            note,
          });

        // 잔액 업데이트
        await supabase
          .from('juwoo_profile')
          .update({ current_points: newBalance })
          .eq('id', 1);

        toast.success(`🎉 ${points} 포인트 획듍!`);
      }
    } catch (error) {
      console.error('포인트 적립 오류:', error);
    }
  };

  // 다음 문제
  const handleNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const finalCorrectCount = correctCount + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
      const finalScore = Math.round((finalCorrectCount / totalQuestions) * 100);
      
      setIsCompleted(true);
      
      // 포인트 적립
      await awardPoints(finalScore);
      
      // 만점 시 특별 효과
      if (finalCorrectCount === totalQuestions) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // 다시 시작
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsCompleted(false);
    generateQuestions();
  };

  // 별점 계산
  const calculateStars = () => {
    const score = (correctCount / totalQuestions) * 100;
    if (score === 100) return 3;
    if (score >= 70) return 2;
    if (score >= 40) return 1;
    return 0;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">영어 퀴즈를 풀려면 로그인해주세요.</p>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인하기</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isCompleted) {
    const stars = calculateStars();
    const score = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <div className="container max-w-4xl py-10">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                홈으로
              </Button>
            </Link>
          </div>

          <Card className="border-2 border-yellow-300 dark:border-yellow-700">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">퀴즈 완료! 🎉</h1>
                <p className="text-xl text-muted-foreground">정말 잘했어요!</p>
              </div>

              {/* 별점 */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    className={`h-12 w-12 ${
                      i <= stars
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* 점수 */}
              <div className="mb-8">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {score}점
                </div>
                <p className="text-muted-foreground">
                  {correctCount} / {totalQuestions} 문제 정답
                </p>
              </div>

              {/* 메시지 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-lg font-medium">
                  {score === 100 && "완벽해요! 모든 문제를 맞췄어요! 🏆"}
                  {score >= 70 && score < 100 && "정말 잘했어요! 조금만 더 노력하면 만점이에요! ⭐"}
                  {score >= 40 && score < 70 && "좋아요! 계속 연습하면 더 잘할 수 있어요! 💪"}
                  {score < 40 && "괜찮아요! 다시 도전해봐요! 화이팅! 🌟"}
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  다시 풀기
                </Button>
                <Link href="/english-flashcard">
                  <Button size="lg" variant="outline">
                    플래시카드 학습
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container max-w-4xl py-10">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">영어 퀴즈 🎯</h1>
          <p className="text-muted-foreground">정답을 선택하세요!</p>
        </div>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm font-medium">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* 문제 카드 */}
        <Card className="mb-6 border-2 border-blue-300 dark:border-blue-700">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-4">이 단어의 뜻은?</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className="text-5xl md:text-6xl font-bold text-blue-700 dark:text-blue-300">
                  {currentQuestion.word}
                </h2>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => speakWord(currentQuestion.word)}
                  className="rounded-full"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* 선택지 */}
            <div className="grid md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = isAnswered;

                let buttonClass = "h-20 text-xl font-medium transition-all";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += " bg-green-500 hover:bg-green-600 text-white border-4 border-green-600";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += " bg-red-500 hover:bg-red-600 text-white border-4 border-red-600";
                  } else {
                    buttonClass += " opacity-50";
                  }
                } else {
                  buttonClass += " hover:bg-blue-100 dark:hover:bg-blue-900 border-2";
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonClass}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={isAnswered}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 다음 버튼 */}
        {isAnswered && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12"
            >
              {currentQuestionIndex < totalQuestions - 1 ? '다음 문제' : '결과 보기'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
