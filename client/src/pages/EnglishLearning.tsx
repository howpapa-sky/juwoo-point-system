import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Trophy, Star, Check, X, Sparkles, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EnglishWord {
  id: number;
  word: string;
  meaning: string;
  category: string;
  example_sentence: string | null;
  pronunciation: string | null;
}

interface WordProgress {
  word_id: number;
  is_learned: boolean;
  correct_count: number;
  incorrect_count: number;
}

export default function EnglishLearning() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [progress, setProgress] = useState<Record<number, WordProgress>>({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 카테고리 목록 가져오기
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('english_words')
        .select('category')
        .order('category');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      const uniqueCategories = Array.from(new Set(data.map(d => d.category)));
      setCategories(uniqueCategories);
    };

    fetchCategories();
  }, [isAuthenticated]);

  // 선택한 카테고리의 단어 가져오기
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchWords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('english_words')
        .select('*')
        .eq('category', selectedCategory)
        .order('id');

      if (error) {
        console.error('Error fetching words:', error);
        setLoading(false);
        return;
      }

      setWords(data || []);
      setCurrentWordIndex(0);
      setShowAnswer(false);
      setQuizMode(false);
      setLoading(false);
    };

    fetchWords();
  }, [selectedCategory]);

  // 학습 진도 가져오기
  useEffect(() => {
    if (!isAuthenticated || words.length === 0) return;

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('word_learning_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .in('word_id', words.map(w => w.id));

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      const progressMap: Record<number, WordProgress> = {};
      data?.forEach(p => {
        progressMap[p.word_id] = p;
      });
      setProgress(progressMap);
    };

    fetchProgress();
  }, [isAuthenticated, words]);

  // 퀴즈 옵션 생성
  const generateQuizOptions = (correctAnswer: string) => {
    const allMeanings = words.map(w => w.meaning).filter(m => m !== correctAnswer);
    const shuffled = allMeanings.sort(() => Math.random() - 0.5);
    const wrongOptions = shuffled.slice(0, 3);
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
  };

  // 퀴즈 모드 시작
  const startQuiz = () => {
    setQuizMode(true);
    setShowAnswer(false);
    setSelectedAnswer(null);
    generateQuizOptions(words[currentWordIndex].meaning);
  };

  // 정답 확인 및 포인트 적립
  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer);
    const currentWord = words[currentWordIndex];
    const isCorrect = answer === currentWord.meaning;

    // 학습 진도 업데이트
    try {
      const existingProgress = progress[currentWord.id];
      
      if (existingProgress) {
        // 기존 진도 업데이트
        await supabase
          .from('word_learning_progress')
          .update({
            is_learned: isCorrect || existingProgress.is_learned,
            correct_count: isCorrect ? existingProgress.correct_count + 1 : existingProgress.correct_count,
            incorrect_count: !isCorrect ? existingProgress.incorrect_count + 1 : existingProgress.incorrect_count,
            last_learned_at: new Date().toISOString(),
          })
          .eq('juwoo_id', 1)
          .eq('word_id', currentWord.id);
      } else {
        // 새 진도 생성
        await supabase
          .from('word_learning_progress')
          .insert({
            juwoo_id: 1,
            word_id: currentWord.id,
            is_learned: isCorrect,
            correct_count: isCorrect ? 1 : 0,
            incorrect_count: !isCorrect ? 1 : 0,
            last_learned_at: new Date().toISOString(),
          });
      }

      // 정답이면 포인트 적립
      if (isCorrect && !existingProgress?.is_learned) {
        // 포인트 규칙 ID 조회 (영어 단어 암기)
        const { data: rules } = await supabase
          .from('point_rules')
          .select('id')
          .eq('name', '영어 단어 암기')
          .single();

        if (rules) {
          // 현재 포인트 잔액 조회
          const { data: profile } = await supabase
            .from('juwoo_profile')
            .select('current_points')
            .eq('id', 1)
            .single();

          const currentBalance = profile?.current_points || 0;
          const newBalance = currentBalance + 50;

          // 포인트 적립
          await supabase
            .from('point_transactions')
            .insert({
              juwoo_id: 1,
              rule_id: rules.id,
              amount: 50,
              balance_after: newBalance,
              note: `"${currentWord.word}" 단어 학습 완료`,
            });

          // 잔액 업데이트
          await supabase
            .from('juwoo_profile')
            .update({ current_points: newBalance })
            .eq('id', 1);

          toast.success("정답입니다! 🎉", {
            description: "50 포인트를 획득했습니다!",
          });
        }
      } else if (isCorrect) {
        toast.success("정답입니다! ✅");
      } else {
        toast.error("틀렸습니다 😢", {
          description: "다시 한번 시도해보세요!",
        });
      }

      // 진도 새로고침
      const { data: updatedProgress } = await supabase
        .from('word_learning_progress')
        .select('*')
        .eq('juwoo_id', 1)
        .in('word_id', words.map(w => w.id));

      const progressMap: Record<number, WordProgress> = {};
      updatedProgress?.forEach(p => {
        progressMap[p.word_id] = p;
      });
      setProgress(progressMap);

    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("오류가 발생했습니다");
    }
  };

  // 다음 단어
  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
      setQuizMode(false);
      setSelectedAnswer(null);
    }
  };

  // 이전 단어
  const prevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowAnswer(false);
      setQuizMode(false);
      setSelectedAnswer(null);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>영어 학습을 하려면 로그인해주세요.</CardDescription>
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

  const currentWord = words[currentWordIndex];
  const learnedCount = Object.values(progress).filter(p => p.is_learned).length;
  const progressPercent = words.length > 0 ? (learnedCount / words.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <BookOpen className="h-10 w-10" />
            영어 학습 📚
          </h1>
          <p className="text-muted-foreground">영어 단어를 학습하고 포인트를 획득하세요!</p>
        </div>

        {!selectedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
            {categories.map((category) => (
              <Card
                key={category}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">단어를 불러오는 중...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
            {/* 진행률 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{selectedCategory}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    카테고리 변경
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>학습 진도</span>
                    <span className="font-medium">
                      {learnedCount} / {words.length} 단어
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </CardHeader>
            </Card>

            {/* 플래시카드 / 퀴즈 */}
            {currentWord && (
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={progress[currentWord.id]?.is_learned ? "default" : "secondary"}>
                      {currentWordIndex + 1} / {words.length}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuizMode(false);
                          setShowAnswer(false);
                        }}
                      >
                        플래시카드
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startQuiz}
                      >
                        퀴즈
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!quizMode ? (
                    // 플래시카드 모드
                    <div className="text-center space-y-6 py-8">
                      <div className="text-5xl font-bold text-primary">
                        {currentWord.word}
                      </div>
                      {currentWord.pronunciation && (
                        <div className="text-lg text-muted-foreground">
                          [{currentWord.pronunciation}]
                        </div>
                      )}
                      {showAnswer ? (
                        <div className="space-y-4 animate-slide-up">
                          <div className="text-2xl font-semibold">
                            {currentWord.meaning}
                          </div>
                          {currentWord.example_sentence && (
                            <div className="text-sm text-muted-foreground italic">
                              "{currentWord.example_sentence}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowAnswer(true)}
                          size="lg"
                          className="mt-4"
                        >
                          <RotateCw className="h-4 w-4 mr-2" />
                          뜻 보기
                        </Button>
                      )}
                    </div>
                  ) : (
                    // 퀴즈 모드
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <div className="text-4xl font-bold text-primary">
                          {currentWord.word}
                        </div>
                        {currentWord.pronunciation && (
                          <div className="text-lg text-muted-foreground">
                            [{currentWord.pronunciation}]
                          </div>
                        )}
                        <p className="text-lg font-medium">이 단어의 뜻은?</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {quizOptions.map((option, index) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = option === currentWord.meaning;
                          const showResult = selectedAnswer !== null;

                          return (
                            <Button
                              key={index}
                              variant={
                                showResult
                                  ? isCorrect
                                    ? "default"
                                    : isSelected
                                    ? "destructive"
                                    : "outline"
                                  : "outline"
                              }
                              className="h-auto py-4 text-left justify-start"
                              onClick={() => !showResult && handleAnswerSelect(option)}
                              disabled={showResult}
                            >
                              <span className="flex items-center gap-2 w-full">
                                <span className="font-medium">{index + 1}.</span>
                                <span className="flex-1">{option}</span>
                                {showResult && isCorrect && (
                                  <Check className="h-5 w-5 text-green-600" />
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <X className="h-5 w-5 text-red-600" />
                                )}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 네비게이션 */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={prevWord}
                      disabled={currentWordIndex === 0}
                    >
                      이전 단어
                    </Button>
                    <Button
                      variant="outline"
                      onClick={nextWord}
                      disabled={currentWordIndex === words.length - 1}
                    >
                      다음 단어
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
