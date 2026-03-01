import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Home,
  Volume2,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  Trophy,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { booksData, Book } from "./EbookLibrary";
import { supabase } from "@/lib/supabaseClient";
import { useEbookProgress } from "@/hooks/useEbookProgress";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { hasQuizForBook } from "@/data/quizData";

export default function EbookReader() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;

  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // e북 진행률 훅
  const {
    progress: ebookProgress,
    saveProgress: saveEbookProgress,
    isCompleted: wasAlreadyCompleted
  } = useEbookProgress(bookId || '', book?.pages.length || 0);

  // 퀴즈 진행률 훅
  const { unlockTier } = useQuizProgress(bookId || '');

  // 책 데이터 로드
  useEffect(() => {
    const foundBook = booksData.find((b) => b.id === bookId);
    if (foundBook) {
      setBook(foundBook);
    }
  }, [bookId]);

  // Supabase에서 읽기 위치 복원
  useEffect(() => {
    if (book && ebookProgress) {
      setCurrentPage(ebookProgress.current_page);
      if (ebookProgress.is_completed) {
        setIsCompleted(true);
      }
    }
  }, [book, ebookProgress]);

  // 페이지 변경 시 Supabase에 저장
  useEffect(() => {
    if (book && currentPage > 0) {
      saveEbookProgress(currentPage);
    }
  }, [currentPage, book, saveEbookProgress]);

  const totalPages = book?.pages.length || 0;
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  // 이전 페이지
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 다음 페이지
  const handleNextPage = async () => {
    if (book && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (book && currentPage === totalPages - 1 && !isCompleted) {
      // 책 완료!
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF6347"],
      });
      toast.success("책을 다 읽었어요! 대단해요! 🎉");

      // 포인트 적립 (처음 완독 시에만)
      if (!wasAlreadyCompleted) {
        await awardReadingPoints();
      }

      // 퀴즈가 있는 책이면 기초 퀴즈 잠금 해제
      if (hasQuizForBook(book.id)) {
        await unlockTier('basic');
        toast.success("🎮 퀴즈가 열렸어요! 도전해볼까?");
      }
    }
  };

  // 포인트 적립
  const awardReadingPoints = async () => {
    try {
      const { data: profile } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      const points = 500; // 책 한 권 읽으면 500포인트
      const newBalance = currentBalance + points;

      await supabase.from("point_transactions").insert({
        juwoo_id: 1,
        rule_id: null,
        amount: points,
        balance_after: newBalance,
        note: `e북 읽기 완료: ${book?.title || '알 수 없는 책'}`,
        created_by: 1, // 시스템/관리자
      });

      await supabase.from("juwoo_profile").update({ current_points: newBalance }).eq("id", 1);

      toast.success(`📚 500 포인트 획득!`);
    } catch (error) {
      if (import.meta.env.DEV) console.error("포인트 적립 오류:", error);
    }
  };

  // 음성 읽기 (TTS)
  const speakText = () => {
    if (book && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(book.pages[currentPage]);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      toast.success("읽어드릴게요! 🔊");
    }
  };

  // 글자 크기 조절
  const increaseFontSize = () => {
    if (fontSize < 32) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 14) setFontSize(fontSize - 2);
  };

  // 다시 읽기
  const handleRestart = () => {
    setCurrentPage(0);
    setIsCompleted(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="max-w-md w-full border-4 border-amber-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">e북을 읽으려면 로그인해주세요!</p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="max-w-md w-full border-4 border-amber-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-4">책을 찾을 수 없어요</h2>
            <p className="text-muted-foreground mb-4">다른 책을 선택해주세요!</p>
            <Link href="/ebook-library">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
                도서관으로 가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 완독 화면
  if (isCompleted) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"}`}
      >
        <div className="container max-w-4xl py-10 px-4">
          <Card
            className={`border-4 border-amber-400 ${isDarkMode ? "bg-gray-800 text-white" : ""}`}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 animate-bounce">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">완독! 🎉</h1>
                <p className="text-xl text-muted-foreground">
                  "{book.title}" 을(를) 다 읽었어요!
                </p>
              </div>

              <div className="mb-8 p-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-2xl">
                <p className="text-6xl mb-4">{book.coverEmoji}</p>
                <p className="text-lg font-medium">
                  주우, 정말 대단해요! 책 읽기 완료! 📚✨
                </p>
                {!wasAlreadyCompleted && (
                  <p className="text-amber-700 dark:text-amber-300 mt-2">
                    500 포인트를 받았어요!
                  </p>
                )}
              </div>

              {/* 퀴즈 도전 버튼 */}
              {hasQuizForBook(book.id) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl">
                  <p className="text-lg font-bold mb-2">🎮 퀴즈에 도전해볼까?</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    책 내용을 잘 읽었는지 확인해봐!
                  </p>
                  <Link href={`/ebook-quiz/${book.id}`}>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    >
                      <Gamepad2 className="h-5 w-5 mr-2" />
                      퀴즈 도전하기!
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={handleRestart}
                  variant="outline"
                  className="font-bold"
                >
                  다시 읽기
                </Button>
                <Link href="/ebook-library">
                  <Button size="lg" variant="outline" className="font-bold">
                    다른 책 읽기
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
    <div
      className={`min-h-screen transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"}`}
    >
      <div className="container max-w-4xl py-6 px-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/ebook-library">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              도서관
            </Button>
          </Link>

          <h1
            className={`text-lg font-bold truncate max-w-[50%] ${isDarkMode ? "text-white" : ""}`}
          >
            {book.title}
          </h1>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>진행률</span>
            <span className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>
              {currentPage + 1} / {totalPages} 페이지
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* 도구 모음 */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={speakText}
            className={isDarkMode ? "border-gray-600 text-gray-300" : ""}
          >
            <Volume2 className="h-4 w-4 mr-1" />
            읽어주기
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={decreaseFontSize}
            className={isDarkMode ? "border-gray-600 text-gray-300" : ""}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={increaseFontSize}
            className={isDarkMode ? "border-gray-600 text-gray-300" : ""}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* 책 내용 */}
        <Card
          className={`mb-6 border-4 ${isDarkMode ? "bg-gray-800 border-gray-600" : "border-amber-300"}`}
        >
          <CardContent className="p-6 md:p-10">
            <div className="text-center mb-6">
              <span className="text-5xl">{book.coverEmoji}</span>
            </div>

            <div
              className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.8" }}
            >
              {book.pages[currentPage]}
            </div>
          </CardContent>
        </Card>

        {/* 페이지 네비게이션 */}
        <div className="flex items-center justify-between">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`${isDarkMode ? "border-gray-600 text-gray-300" : ""} ${currentPage === 0 ? "opacity-50" : ""}`}
          >
            <ChevronLeft className="h-6 w-6 mr-1" />
            이전
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentPage
                    ? "bg-amber-500 scale-125"
                    : isDarkMode
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-amber-200 hover:bg-amber-300"
                }`}
              />
            ))}
          </div>

          <Button
            size="lg"
            onClick={handleNextPage}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
          >
            {currentPage === totalPages - 1 ? "완료!" : "다음"}
            <ChevronRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
