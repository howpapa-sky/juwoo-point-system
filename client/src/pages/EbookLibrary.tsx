import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Star, Clock, Sparkles, Trophy, Flame, Gamepad2, CheckCircle2, Lock } from "lucide-react";
import { booksData, Book } from "@/data/booksData";
import { supabase } from "@/lib/supabaseClient";
import { hasQuizForBook } from "@/data/quizData";

export { booksData, type Book };

interface BookProgress {
  book_id: string;
  current_page: number;
  total_pages: number;
  is_completed: boolean;
}

interface QuizProgress {
  book_id: string;
  quiz_tier: string;
  is_completed: boolean;
  best_score: number;
}

export default function EbookLibrary() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [bookProgress, setBookProgress] = useState<Record<string, BookProgress>>({});
  const [quizProgress, setQuizProgress] = useState<Record<string, QuizProgress[]>>({});

  // 진행률 데이터 로드
  useEffect(() => {
    const loadProgress = async () => {
      // e북 진행률
      const { data: ebookData } = await supabase
        .from('ebook_progress')
        .select('book_id, current_page, total_pages, is_completed')
        .eq('juwoo_id', 1);

      if (ebookData) {
        const progressMap: Record<string, BookProgress> = {};
        ebookData.forEach(p => {
          progressMap[p.book_id] = p;
        });
        setBookProgress(progressMap);
      }

      // 퀴즈 진행률
      const { data: quizData } = await supabase
        .from('ebook_quiz_progress')
        .select('book_id, quiz_tier, is_completed, best_score')
        .eq('juwoo_id', 1);

      if (quizData) {
        const quizMap: Record<string, QuizProgress[]> = {};
        quizData.forEach(q => {
          if (!quizMap[q.book_id]) quizMap[q.book_id] = [];
          quizMap[q.book_id].push(q);
        });
        setQuizProgress(quizMap);
      }
    };

    if (isAuthenticated) {
      loadProgress();
    }
  }, [isAuthenticated]);

  const categories = ["전체", ...Array.from(new Set(booksData.map((book) => book.category)))];

  const filteredBooks =
    selectedCategory === "전체"
      ? booksData
      : booksData.filter((book) => book.category === selectedCategory);

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움": return "🌱";
      case "보통": return "⭐";
      case "어려움": return "🔥";
      default: return "📖";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움": return "bg-green-100 text-green-700 border-green-200";
      case "보통": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "어려움": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // 책 읽기 진행률 계산
  const getBookReadProgress = (bookId: string, totalPages: number) => {
    const progress = bookProgress[bookId];
    if (!progress) return 0;
    return Math.round(((progress.current_page + 1) / totalPages) * 100);
  };

  // 책 완독 여부
  const isBookCompleted = (bookId: string) => {
    return bookProgress[bookId]?.is_completed || false;
  };

  // 퀴즈 완료 개수
  const getQuizCompletedCount = (bookId: string) => {
    const quizzes = quizProgress[bookId] || [];
    return quizzes.filter(q => q.is_completed).length;
  };

  // 완독한 책 개수
  const completedBooksCount = Object.values(bookProgress).filter(p => p.is_completed).length;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="max-w-md w-full border-4 border-amber-400 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-7xl mb-6 animate-bounce">📚</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-6">e북을 읽으려면 로그인해주세요!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg py-6">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      <div className="container max-w-7xl py-10 px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-amber-100">
              <ArrowLeft className="h-4 w-4" />
              대시보드로
            </Button>
          </Link>
        </div>

        {/* 타이틀 섹션 */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            주우의 도서관
          </h1>
          <p className="text-lg text-muted-foreground">
            포켓몬GO 마스터가 되기 위한 {booksData.length}권의 특별한 책!
          </p>
        </div>

        {/* 통계 배너 */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border-2 border-amber-200">
            <div className="text-3xl mb-1">📚</div>
            <div className="text-2xl font-bold text-amber-600">{booksData.length}</div>
            <div className="text-sm text-muted-foreground">전체 도서</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border-2 border-green-200">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {completedBooksCount} / {booksData.length}
            </div>
            <div className="text-sm text-muted-foreground">완독한 책</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border-2 border-purple-200">
            <div className="text-3xl mb-1">🎮</div>
            <div className="text-2xl font-bold text-purple-600">
              {booksData.filter(b => hasQuizForBook(b.id)).length}
            </div>
            <div className="text-sm text-muted-foreground">퀴즈 있는 책</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border-2 border-yellow-200">
            <div className="text-3xl mb-1">🎁</div>
            <div className="text-2xl font-bold text-yellow-600">500</div>
            <div className="text-sm text-muted-foreground">완독 보상</div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg scale-105"
                  : "border-2 border-amber-300 hover:bg-amber-100 hover:border-amber-400"
              }`}
            >
              {category === "전체" && "📚 "}
              {category === "공략집" && "🎮 "}
              {category === "동화" && "🧚 "}
              {category}
            </Button>
          ))}
        </div>

        {/* 책 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => (
            <Link key={book.id} href={`/ebook-reader/${book.id}`}>
              <Card
                className="h-full border-4 border-amber-200 hover:border-amber-400 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-800 overflow-hidden group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  {/* 책 표지 */}
                  <div className="text-center mb-4">
                    <div className="relative inline-block">
                      <div className="p-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <span className="text-6xl">{book.coverEmoji}</span>
                      </div>
                      {/* 완독 배지 */}
                      {isBookCompleted(book.id) && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-1.5 shadow-lg">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {/* 퀴즈 있음 배지 */}
                      {!isBookCompleted(book.id) && hasQuizForBook(book.id) && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-1.5 shadow-lg">
                          <Gamepad2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[3.5rem]">
                      {book.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                  </div>

                  {/* 진행률 바 */}
                  {bookProgress[book.id] && !isBookCompleted(book.id) && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>읽는 중...</span>
                        <span>{getBookReadProgress(book.id, book.pages.length)}%</span>
                      </div>
                      <Progress value={getBookReadProgress(book.id, book.pages.length)} className="h-2" />
                    </div>
                  )}

                  {/* 완독 & 퀴즈 상태 */}
                  {isBookCompleted(book.id) && (
                    <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        ✅ 완독!
                        {hasQuizForBook(book.id) && (
                          <span className="ml-2">
                            🎮 퀴즈 {getQuizCompletedCount(book.id)}/3
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* 책 설명 */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center line-clamp-2 min-h-[2.5rem]">
                    {book.description}
                  </p>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${getDifficultyColor(book.difficulty)}`}>
                      {getDifficultyIcon(book.difficulty)} {book.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                      <Clock className="h-3 w-3" />
                      {book.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                      <BookOpen className="h-3 w-3" />
                      {book.pages.length}p
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 책이 없을 때 */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="h-20 w-20 mx-auto text-amber-400 mb-6" />
            <p className="text-2xl text-muted-foreground">아직 이 카테고리에 책이 없어요!</p>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 px-6 py-3 rounded-full shadow-md">
            <Sparkles className="h-5 w-5 text-green-600" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              책을 끝까지 읽으면 500 포인트를 받아요!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
