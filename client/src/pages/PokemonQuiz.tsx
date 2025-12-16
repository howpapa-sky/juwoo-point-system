import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Star, Trophy, RotateCcw, Sparkles, Gamepad2, Zap } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";

// 포켓몬고 퀴즈 데이터 (7살 주우에게 맞는 쉬운 문제들)
const pokemonQuizData = [
  {
    question: "피카츄의 타입은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    correctAnswer: "전기",
    options: ["전기", "불꽃", "물", "풀"],
    hint: "번개를 쏘는 포켓몬이에요!",
  },
  {
    question: "이상해씨가 진화하면 무엇이 될까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    correctAnswer: "이상해풀",
    options: ["이상해풀", "피카츄", "꼬부기", "파이리"],
    hint: "등에 씨앗이 있는 포켓몬이에요!",
  },
  {
    question: "이 포켓몬의 이름은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    correctAnswer: "리자몽",
    options: ["리자몽", "망나뇽", "갸라도스", "잠만보"],
    hint: "불꽃과 비행 타입이에요!",
  },
  {
    question: "꼬부기의 타입은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    correctAnswer: "물",
    options: ["물", "바위", "땅", "얼음"],
    hint: "등껍질이 있는 거북이 포켓몬이에요!",
  },
  {
    question: "파이리가 최종 진화하면 무엇이 될까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    correctAnswer: "리자몽",
    options: ["리자몽", "리자드", "부스터", "마그마"],
    hint: "날개가 생겨서 날 수 있어요!",
  },
  {
    question: "이 포켓몬의 이름은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    correctAnswer: "잠만보",
    options: ["잠만보", "뚱보", "고라파덕", "코다크"],
    hint: "항상 자고 먹기만 해요!",
  },
  {
    question: "이브이의 진화형이 아닌 것은?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    correctAnswer: "피카츄",
    options: ["피카츄", "부스터", "샤미드", "쥬피썬더"],
    hint: "이브이는 여러 가지로 진화할 수 있어요!",
  },
  {
    question: "피카츄의 진화형은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    correctAnswer: "라이츄",
    options: ["라이츄", "피츄", "에레브", "쥬피썬더"],
    hint: "천둥의 돌을 사용해요!",
  },
  {
    question: "뮤츠는 어떤 타입일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    correctAnswer: "에스퍼",
    options: ["에스퍼", "악", "격투", "드래곤"],
    hint: "초능력을 사용하는 전설의 포켓몬이에요!",
  },
  {
    question: "포켓몬을 잡을 때 사용하는 것은?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
    correctAnswer: "몬스터볼",
    options: ["몬스터볼", "열매", "포션", "돌"],
    hint: "던져서 포켓몬을 잡아요!",
  },
  {
    question: "이 포켓몬의 이름은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    correctAnswer: "팬텀",
    options: ["팬텀", "고우스트", "피카츄", "뮤"],
    hint: "고스트 타입의 무서운 포켓몬이에요!",
  },
  {
    question: "잉어킹이 진화하면 무엇이 될까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png",
    correctAnswer: "갸라도스",
    options: ["갸라도스", "라프라스", "샤미드", "물짱이"],
    hint: "강력한 용이 되어요!",
  },
  {
    question: "망나뇽은 어떤 타입일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    correctAnswer: "드래곤",
    options: ["드래곤", "물", "불꽃", "바위"],
    hint: "하늘을 나는 귀여운 용이에요!",
  },
  {
    question: "포켓몬 GO에서 포켓몬을 진화시키려면 필요한 것은?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png",
    correctAnswer: "사탕",
    options: ["사탕", "돈", "포션", "몬스터볼"],
    hint: "같은 포켓몬을 잡으면 얻을 수 있어요!",
  },
  {
    question: "이 포켓몬의 이름은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    correctAnswer: "뮤",
    options: ["뮤", "뮤츠", "세레비", "피카츄"],
    hint: "분홍색 환상의 포켓몬이에요!",
  },
  {
    question: "라이츄는 어떤 포켓몬의 진화형일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png",
    correctAnswer: "피카츄",
    options: ["피카츄", "피츄", "에레브", "쥬피썬더"],
    hint: "전기를 쏘는 노란 포켓몬에서 진화해요!",
  },
  {
    question: "레어 포켓몬을 부화시키려면 무엇이 필요할까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lucky-egg.png",
    correctAnswer: "알",
    options: ["알", "사탕", "돈", "별의모래"],
    hint: "인큐베이터에 넣고 걸으면 부화해요!",
  },
  {
    question: "포켓몬 GO 팀이 아닌 것은?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png",
    correctAnswer: "팀 골드",
    options: ["팀 골드", "팀 미스틱", "팀 발러", "팀 인스팅트"],
    hint: "파랑, 빨강, 노랑 팀이 있어요!",
  },
  {
    question: "꼬부기가 진화하면 무엇이 될까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    correctAnswer: "어니부기",
    options: ["어니부기", "거북왕", "라프라스", "물짱이"],
    hint: "더 커진 거북이가 되어요!",
  },
  {
    question: "이 전설의 포켓몬 이름은 무엇일까요?",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png",
    correctAnswer: "루기아",
    options: ["루기아", "칠색조", "뮤츠", "아르세우스"],
    hint: "바다의 수호신이에요!",
  },
];

interface QuizQuestion {
  question: string;
  image: string;
  correctAnswer: string;
  options: string[];
  hint: string;
}

export default function PokemonQuiz() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gameTicket, setGameTicket] = useState<number>(0);

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
    const shuffled = [...pokemonQuizData].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, totalQuestions));
  };

  // 답안 선택
  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowHint(false);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectCount(correctCount + 1);
      toast.success('정답이에요! 대단해요! 🎉');
      // 축하 효과
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      });
    } else {
      toast.error(`아쉬워요! 정답은 "${currentQuestion.correctAnswer}"예요.`);
    }
  };

  // 포인트 적립 및 게임 이용권 발급
  const awardPointsAndTicket = async (score: number) => {
    try {
      // 현재 포인트 조회
      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      let points = 0;
      let ticketMinutes = 0;
      let note = '';

      if (score === 100) {
        points = 2000;
        ticketMinutes = 60; // 1시간
        note = '포켓몬 퀴즈 만점! 🏆';
      } else if (score >= 80) {
        points = 1500;
        ticketMinutes = 45; // 45분
        note = `포켓몬 퀴즈 ${score}점 달성! ⭐`;
      } else if (score >= 60) {
        points = 1000;
        ticketMinutes = 30; // 30분
        note = `포켓몬 퀴즈 ${score}점 달성! 👍`;
      } else if (score >= 40) {
        points = 500;
        ticketMinutes = 15; // 15분
        note = `포켓몬 퀴즈 ${score}점 달성!`;
      }

      setGameTicket(ticketMinutes);

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

        toast.success(`🎉 ${points} 포인트 획득!`);
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
      setShowHint(false);
    } else {
      const finalScore = Math.round((correctCount / totalQuestions) * 100);

      setIsCompleted(true);

      // 포인트 적립 및 게임 이용권 발급
      await awardPointsAndTicket(finalScore);

      // 만점 시 특별 효과
      if (correctCount === totalQuestions) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
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
    setShowHint(false);
    setGameTicket(0);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100 dark:from-yellow-950 dark:via-red-950 dark:to-blue-950">
        <Card className="max-w-md w-full border-4 border-yellow-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">포켓몬 퀴즈를 풀려면 로그인해주세요!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">⚡</div>
          <p className="text-xl font-bold">퀴즈 준비 중...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const stars = calculateStars();
    const score = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100 dark:from-yellow-950 dark:via-red-950 dark:to-blue-950">
        <div className="container max-w-4xl py-10 px-4">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                홈으로
              </Button>
            </Link>
          </div>

          <Card className="border-4 border-yellow-400 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full mb-4 animate-pulse">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">퀴즈 완료! 🎉</h1>
                <p className="text-xl text-muted-foreground">주우, 정말 잘했어요!</p>
              </div>

              {/* 별점 */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    className={`h-14 w-14 transition-all ${
                      i <= stars
                        ? 'fill-yellow-400 text-yellow-400 animate-pulse'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* 점수 */}
              <div className="mb-8">
                <div className="text-7xl font-bold bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 bg-clip-text text-transparent mb-2">
                  {score}점
                </div>
                <p className="text-muted-foreground text-lg">
                  {correctCount} / {totalQuestions} 문제 정답
                </p>
              </div>

              {/* 게임 이용권 */}
              {gameTicket > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-2xl border-4 border-green-400 animate-bounce">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                    🎮 게임 이용권 획득! 🎮
                  </h2>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {gameTicket}분
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    포켓몬GO를 {gameTicket}분 동안 할 수 있어요!
                  </p>
                </div>
              )}

              {/* 메시지 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-yellow-950 dark:to-red-950 rounded-xl border-2 border-yellow-300">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-lg font-medium">
                  {score === 100 && "와! 포켓몬 마스터야! 모든 문제를 맞췄어요! 🏆"}
                  {score >= 80 && score < 100 && "대단해요! 포켓몬 박사가 될 수 있어요! ⭐"}
                  {score >= 60 && score < 80 && "잘했어요! 조금만 더 공부하면 최고가 될 거예요! 💪"}
                  {score >= 40 && score < 60 && "좋아요! 포켓몬 도감을 더 보면 잘할 수 있어요! 📖"}
                  {score < 40 && "괜찮아요! 다시 도전해봐요! 주우는 할 수 있어요! 🌟"}
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold text-lg px-8"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  다시 풀기
                </Button>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="font-bold text-lg">
                    대시보드로
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-blue-100 dark:from-yellow-950 dark:via-red-950 dark:to-blue-950">
      <div className="container max-w-4xl py-10 px-4">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            포켓몬 퀴즈
            <Zap className="h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground text-lg">정답을 맞추고 게임 이용권을 받아요!</p>
        </div>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm font-medium">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-4 bg-yellow-200" />
        </div>

        {/* 문제 카드 */}
        <Card className="mb-6 border-4 border-yellow-400 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {/* 포켓몬 이미지 */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-yellow-200 to-red-200 rounded-full mb-4">
                <img
                  src={currentQuestion.image}
                  alt="포켓몬"
                  className="h-32 w-32 md:h-40 md:w-40 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
                  }}
                />
              </div>
            </div>

            {/* 질문 */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 힌트 버튼 */}
            {!isAnswered && (
              <div className="text-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-yellow-600 border-yellow-400"
                >
                  💡 힌트 {showHint ? '숨기기' : '보기'}
                </Button>
                {showHint && (
                  <p className="mt-2 text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
                    {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {/* 선택지 */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = isAnswered;

                let buttonClass = "h-16 md:h-20 text-lg md:text-xl font-bold transition-all rounded-xl";

                if (showResult) {
                  if (isCorrect) {
                    buttonClass += " bg-green-500 hover:bg-green-600 text-white border-4 border-green-600";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += " bg-red-500 hover:bg-red-600 text-white border-4 border-red-600";
                  } else {
                    buttonClass += " opacity-50 border-2";
                  }
                } else {
                  buttonClass += " hover:bg-yellow-100 dark:hover:bg-yellow-900 border-2 border-yellow-300 hover:border-yellow-500";
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
              className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold text-xl px-12 py-6"
            >
              {currentQuestionIndex < totalQuestions - 1 ? '다음 문제 ➡️' : '결과 보기 🎉'}
            </Button>
          </div>
        )}

        {/* 현재 점수 표시 */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold">맞은 문제: {correctCount}개</span>
          </div>
        </div>
      </div>
    </div>
  );
}
