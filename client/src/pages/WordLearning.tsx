import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabaseClient";

interface Word {
  id: number;
  word: string;
  korean: string;
  category: string;
}

interface CategoryProgress {
  category: string;
  total: number;
  learned: number;
}

export default function WordLearning() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [categories, setCategories] = useState<CategoryProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? ((currentWordIndex + (isAnswered ? 1 : 0)) / words.length) * 100 : 0;

  // 카테고리 목록 및 진행률 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      setLoading(true);

      // 모든 카테고리와 단어 조회 (id 포함)
      const { data: wordsData, error } = await supabase
        .from('english_words')
        .select('id, category');

      if (error) throw error;

      // 카테고리별 단어 수 및 단어 ID 매핑
      const categoryMap = new Map<string, { total: number; wordIds: number[] }>();
      wordsData?.forEach((word) => {
        const existing = categoryMap.get(word.category) || { total: 0, wordIds: [] };
        categoryMap.set(word.category, {
          total: existing.total + 1,
          wordIds: [...existing.wordIds, word.id],
        });
      });

      // 학습 진행률 조회 (정답을 맞힌 단어들)
      const { data: progressData } = await supabase
        .from('english_learning_progress')
        .select('word_id')
        .eq('is_correct', true);

      // 정답을 맞힌 고유 단어 ID Set
      const learnedWordIds = new Set(progressData?.map((p) => p.word_id) || []);

      // 카테고리별 학습 진도 계산
      const categoryList: CategoryProgress[] = Array.from(categoryMap.entries()).map(
        ([category, data]) => {
          // 해당 카테고리에서 정답을 맞힌 단어 수 (최대 5개까지만)
          const learnedInCategory = data.wordIds.filter((id) => learnedWordIds.has(id)).length;
          const maxWords = Math.min(data.total, 5);
          return {
            category,
            total: data.total,
            learned: Math.min(learnedInCategory, maxWords),
          };
        }
      );

      setCategories(categoryList);
    } catch (error) {
      if (import.meta.env.DEV) console.error('카테고리 로드 오류:', error);
      toast.error('카테고리를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 선택 시 단어 로드
  const selectCategory = async (category: string) => {
    try {
      setLoading(true);
      setSelectedCategory(category);

      const { data, error } = await supabase
        .from('english_words')
        .select('*')
        .eq('category', category)
        .limit(5); // 카테고리당 5개 단어

      if (error) throw error;

      if (data && data.length > 0) {
        // 단어 섞기
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setCurrentWordIndex(0);
        setUserAnswer("");
        setIsAnswered(false);
        setCorrectCount(0);
        setIsCompleted(false);
      } else {
        toast.error('해당 카테고리에 단어가 없습니다.');
        setSelectedCategory(null);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('단어 로드 오류:', error);
      toast.error('단어를 가져오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  // 답안 제출
  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      toast.error('답을 입력해주세요!');
      return;
    }

    const correct = userAnswer.trim().toLowerCase() === currentWord.korean.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setCorrectCount(correctCount + 1);
      toast.success('정답이에요! 🎉');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      toast(`아깝다! 정답은 "${currentWord.korean}"이야. 다음엔 맞출 수 있어! 💪`);
    }
  };

  // 다음 단어
  const handleNext = () => {
    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // 학습 완료
      setIsCompleted(true);
      awardPoints();
    }
  };

  // 다른 단어
  const handleOther = () => {
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
  };

  // 포인트 적립
  const awardPoints = async () => {
    try {
      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      const currentBalance = profile?.current_points ?? 0;
      const points = 300; // 카테고리 완료 시 300P
      const newBalance = currentBalance + points;

      await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: points,
          balance_after: newBalance,
          note: '영어 단어 카테고리 완료',
          created_by: 1, // 시스템/관리자
        });

      await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      toast.success(`🎉 ${points} 포인트 획득!`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('포인트 적립 오류:', error);
    }
  };

  // 엔터키로 제출
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
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

  // 학습 완료 화면
  if (isCompleted) {
    const accuracy = Math.round((correctCount / words.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <div className="container max-w-2xl py-10">
          <div className="mb-6">
            <Link href="/english-learning">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                영어 학습으로
              </Button>
            </Link>
          </div>

          <Card className="border-2 border-green-300 dark:border-green-700">
            <CardHeader className="text-center pb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 mx-auto">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">학습 완료! 🎊</CardTitle>
              <p className="text-muted-foreground">
                {selectedCategory} 카테고리를 완료했어요!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">정답</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border-2 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-muted-foreground">다시 도전</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-600">{words.length - correctCount}</div>
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="text-sm text-muted-foreground mb-2">정답률</div>
                <div className="text-4xl font-bold text-primary mb-2">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">+300 포인트 획득!</div>
              </div>

              <div className="flex gap-3">
                <Link href="/english-learning" className="flex-1">
                  <Button variant="outline" className="w-full">
                    영어 학습으로
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsCompleted(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  다른 카테고리 학습
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 카테고리 선택 화면
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <Link href="/english-learning">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                영어 학습으로
              </Button>
            </Link>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                📖 영어 학습 📚
              </h1>
              <p className="text-lg text-muted-foreground">
                카테고리를 선택하세요
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary"
                onClick={() => selectCategory(cat.category)}
              >
                <CardHeader>
                  <CardTitle className="text-xl capitalize">{cat.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>학습 진도</span>
                      <span>{cat.learned} / {cat.total > 5 ? 5 : cat.total} 단어</span>
                    </div>
                    <Progress value={(cat.learned / (cat.total > 5 ? 5 : cat.total)) * 100} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 단어 학습 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container max-w-2xl py-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            카테고리 선택으로
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl capitalize">{selectedCategory}</CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentWordIndex + 1} / {words.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg inline-block text-sm font-medium">
                {currentWord.category}
              </div>
              <h2 className="text-5xl font-bold text-primary mb-4">{currentWord.word}</h2>
              <p className="text-muted-foreground">이 단어의 뜻은?</p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="한글 뜻을 입력하세요"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAnswered}
                className={`text-lg h-14 ${
                  isAnswered
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-slate-400 bg-slate-50 dark:bg-slate-950'
                    : ''
                }`}
                autoFocus
              />

              {isAnswered && (
                <div
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-500" />
                    )}
                    <span className="font-bold">
                      {isCorrect ? '정답입니다!' : '아깝다! 다시 도전해보자!'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      정답: <strong>{currentWord.korean}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isAnswered ? (
                <Button onClick={handleSubmit} className="flex-1 h-12 text-lg">
                  제출하기
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleOther}
                    variant="outline"
                    className="flex-1 h-12"
                  >
                    다른 단어
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    {currentWordIndex + 1 < words.length ? '다음 단어' : '결과 보기'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
