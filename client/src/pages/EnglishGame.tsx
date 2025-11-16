import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Trophy, Star, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type GameMode = "word-match" | "spelling" | "sentence";

export default function EnglishGame() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [level, setLevel] = useState(1);

  const { data: randomWord, refetch: getNewWord } = trpc.english.randomWord.useQuery(
    { level },
    { enabled: false }
  );

  const addPointsMutation = trpc.points.add.useMutation();

  useEffect(() => {
    if (randomWord) {
      setCurrentWord(randomWord);
    }
  }, [randomWord]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setStreak(0);
    getNewWord();
  };

  const checkAnswer = () => {
    if (!currentWord || !userAnswer.trim()) return;

    let correct = false;
    
    if (gameMode === "word-match") {
      correct = userAnswer.trim().toLowerCase() === currentWord.meaning.toLowerCase();
    } else if (gameMode === "spelling") {
      correct = userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();
    } else if (gameMode === "sentence") {
      correct = userAnswer.trim().toLowerCase().includes(currentWord.word.toLowerCase());
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const points = level * 100;
      setScore(score + points);
      setStreak(streak + 1);
      
      // Add points to user's balance
      addPointsMutation.mutate({
        amount: points,
        note: `영어 학습 게임 정답 (${currentWord.word})`,
      }, {
        onSuccess: () => {
          toast.success(`정답! +${points}P`);
        }
      });
    } else {
      setStreak(0);
      toast.error("틀렸어요! 다시 도전해보세요.");
    }
  };

  const nextQuestion = () => {
    setShowResult(false);
    setUserAnswer("");
    getNewWord();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>영어 게임을 하려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인하기</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <div className="container py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>

          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">영어 학습 게임 📚</h1>
            <p className="text-muted-foreground">재미있게 영어를 배우고 포인트도 받아요!</p>
          </div>

          {/* Level Selection */}
          <Card className="mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>난이도 선택</CardTitle>
              <CardDescription>자신의 수준에 맞는 난이도를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={level === 1 ? "default" : "outline"}
                  onClick={() => setLevel(1)}
                  className="flex-1"
                >
                  🟢 쉬움 (100P)
                </Button>
                <Button
                  variant={level === 2 ? "default" : "outline"}
                  onClick={() => setLevel(2)}
                  className="flex-1"
                >
                  🟡 보통 (200P)
                </Button>
                <Button
                  variant={level === 3 ? "default" : "outline"}
                  onClick={() => setLevel(3)}
                  className="flex-1"
                >
                  🔴 어려움 (300P)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Game Mode Selection */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
              style={{ animationDelay: "0.2s" }}
              onClick={() => startGame("word-match")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  단어 맞추기
                </CardTitle>
                <CardDescription>영어 단어를 보고 뜻을 맞춰보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">시작하기</Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
              style={{ animationDelay: "0.3s" }}
              onClick={() => startGame("spelling")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  스펠링 게임
                </CardTitle>
                <CardDescription>한글 뜻을 보고 영어 단어를 쓰세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">시작하기</Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
              style={{ animationDelay: "0.4s" }}
              onClick={() => startGame("sentence")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-purple-500" />
                  문장 만들기
                </CardTitle>
                <CardDescription>단어를 사용해서 문장을 만들어보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">시작하기</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <div className="container py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => setGameMode(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            게임 선택으로
          </Button>
          <div className="flex gap-4">
            <div className="text-sm font-medium">
              점수: <span className="text-blue-600">{score}P</span>
            </div>
            <div className="text-sm font-medium">
              연속: <span className="text-green-600">{streak}회</span>
            </div>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {gameMode === "word-match" && "단어 맞추기"}
              {gameMode === "spelling" && "스펠링 게임"}
              {gameMode === "sentence" && "문장 만들기"}
            </CardTitle>
            <CardDescription>
              레벨 {level} - 정답당 {level * 100}P
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentWord ? (
              <>
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                  <div className="text-4xl font-bold mb-4">
                    {gameMode === "word-match" && currentWord.word}
                    {gameMode === "spelling" && currentWord.meaning}
                    {gameMode === "sentence" && currentWord.word}
                  </div>
                  {gameMode === "sentence" && (
                    <div className="text-sm text-muted-foreground">
                      이 단어를 사용해서 문장을 만드세요
                    </div>
                  )}
                </div>

                {!showResult ? (
                  <div className="space-y-4">
                    <Input
                      placeholder={
                        gameMode === "word-match"
                          ? "한글 뜻을 입력하세요"
                          : gameMode === "spelling"
                          ? "영어 단어를 입력하세요"
                          : "문장을 입력하세요"
                      }
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                      className="text-lg"
                      autoFocus
                    />
                    <Button onClick={checkAnswer} className="w-full" size="lg">
                      정답 확인
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-6 rounded-lg text-center ${
                        isCorrect
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {isCorrect ? (
                          <>
                            <Check className="h-8 w-8 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">정답!</span>
                          </>
                        ) : (
                          <>
                            <X className="h-8 w-8 text-red-600" />
                            <span className="text-2xl font-bold text-red-600">틀렸어요!</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">정답: </span>
                          {gameMode === "word-match" && currentWord.meaning}
                          {gameMode === "spelling" && currentWord.word}
                          {gameMode === "sentence" && currentWord.example_sentence}
                        </div>
                        {currentWord.example_sentence && gameMode !== "sentence" && (
                          <div className="text-sm text-muted-foreground">
                            예문: {currentWord.example_sentence}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={nextQuestion} className="w-full" size="lg">
                      다음 문제
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">문제를 불러오는 중...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
