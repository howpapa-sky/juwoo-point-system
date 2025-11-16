import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Trophy, Star, Check, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function EnglishLearning() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  const { data: categories } = trpc.english.categories.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: words } = trpc.english.wordsByCategory.useQuery(
    { category: selectedCategory! },
    { enabled: !!selectedCategory }
  );

  const { data: progress } = trpc.english.progress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateProgressMutation = trpc.english.updateProgress.useMutation({
    onSuccess: (data, variables) => {
      if (variables.isCorrect) {
        toast.success("정답입니다! 🎉", {
          description: "50 포인트를 획득했습니다!",
        });
      } else {
        toast.error("틀렸습니다 😢", {
          description: "다시 한번 시도해보세요!",
        });
      }
    },
  });

  const utils = trpc.useUtils();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>영어 학습 기능을 사용하려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>로그인하고 시작하기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWord = words?.[currentWordIndex];
  const totalWords = words?.length || 0;
  const progressPercent = totalWords > 0 ? ((currentWordIndex + 1) / totalWords) * 100 : 0;

  const learnedWords = progress?.filter(p => p.status === 'mastered').length || 0;
  const learningWords = progress?.filter(p => p.status === 'learning').length || 0;

  const handleNextWord = () => {
    if (currentWordIndex < totalWords - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
      setQuizMode(false);
      setSelectedAnswer(null);
    } else {
      toast.success("모든 단어를 학습했습니다! 🎉");
      setSelectedCategory(null);
      setCurrentWordIndex(0);
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowAnswer(false);
      setQuizMode(false);
      setSelectedAnswer(null);
    }
  };

  const startQuiz = () => {
    if (!currentWord || !words) return;
    
    // Generate quiz options
    const correctAnswer = currentWord.korean;
    const otherWords = words.filter(w => w.id !== currentWord.id);
    const wrongAnswers = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.korean);
    
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
    setQuizMode(true);
    setSelectedAnswer(null);
  };

  const handleQuizAnswer = async (answer: string) => {
    if (!currentWord) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentWord.korean;
    
    await updateProgressMutation.mutateAsync({
      wordId: currentWord.id,
      isCorrect,
    });

    // Invalidate queries to refresh data
    utils.english.progress.invalidate();

    // Auto advance after a delay
    setTimeout(() => {
      handleNextWord();
    }, 1500);
  };

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container max-w-6xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-purple-600" />
                영어 단어 학습
              </h1>
              <p className="text-muted-foreground mt-1">
                카테고리를 선택하고 단어를 학습하세요!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  학습한 단어
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{learnedWords}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  학습 중인 단어
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{learningWords}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  총 단어 수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">100</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories?.map((category) => (
              <Card
                key={category}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentWordIndex(0);
                }}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {words?.filter(w => w.category === category).length || 10}개 단어
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Learning view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedCategory(null);
              setCurrentWordIndex(0);
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedCategory}</h1>
            <p className="text-sm text-muted-foreground">
              {currentWordIndex + 1} / {totalWords}
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            {learnedWords} 학습 완료
          </Badge>
        </div>

        <Progress value={progressPercent} className="mb-8" />

        {currentWord && (
          <Card className="mb-8">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-6xl font-bold text-purple-600 mb-4">
                {currentWord.word}
              </CardTitle>
              {showAnswer && !quizMode && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-4xl font-semibold text-gray-700 dark:text-gray-300">
                    {currentWord.korean}
                  </p>
                  {currentWord.example_sentence && (
                    <p className="text-lg text-muted-foreground italic">
                      "{currentWord.example_sentence}"
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!quizMode ? (
                <div className="flex gap-4 justify-center">
                  {!showAnswer ? (
                    <>
                      <Button
                        size="lg"
                        onClick={() => setShowAnswer(true)}
                        className="flex-1 max-w-xs"
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        뜻 보기
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={startQuiz}
                        className="flex-1 max-w-xs"
                      >
                        <Trophy className="mr-2 h-5 w-5" />
                        퀴즈 풀기
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-4 w-full">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handlePrevWord}
                        disabled={currentWordIndex === 0}
                        className="flex-1"
                      >
                        이전 단어
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNextWord}
                        className="flex-1"
                      >
                        {currentWordIndex === totalWords - 1 ? "완료" : "다음 단어"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-lg font-medium mb-6">
                    "{currentWord.word}"의 뜻은 무엇일까요?
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {quizOptions.map((option, index) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === currentWord.korean;
                      const showResult = selectedAnswer !== null;

                      return (
                        <Button
                          key={index}
                          size="lg"
                          variant={
                            showResult
                              ? isCorrect
                                ? "default"
                                : isSelected
                                ? "destructive"
                                : "outline"
                              : "outline"
                          }
                          className="justify-start text-lg h-auto py-4"
                          onClick={() => handleQuizAnswer(option)}
                          disabled={selectedAnswer !== null}
                        >
                          {showResult && isCorrect && (
                            <Check className="mr-2 h-5 w-5" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="mr-2 h-5 w-5" />
                          )}
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
