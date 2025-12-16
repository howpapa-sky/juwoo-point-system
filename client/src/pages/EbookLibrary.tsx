import { useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Star, Clock, Sparkles } from "lucide-react";

// 책 데이터 타입
export interface Book {
  id: string;
  title: string;
  author: string;
  coverEmoji: string;
  description: string;
  pages: string[];
  difficulty: "쉬움" | "보통" | "어려움";
  readTime: string;
  category: string;
}

// 샘플 책 데이터 (나중에 실제 내용으로 교체)
export const booksData: Book[] = [
  {
    id: "sample-1",
    title: "주우의 첫 번째 모험",
    author: "아빠",
    coverEmoji: "🌟",
    description: "주우가 포켓몬 세계에서 첫 모험을 시작하는 이야기",
    difficulty: "쉬움",
    readTime: "5분",
    category: "동화",
    pages: [
      "어느 맑은 날, 주우는 포켓몬 마스터가 되기로 결심했어요.\n\n\"나도 피카츄랑 모험을 떠날 거야!\" 주우가 외쳤어요.",
      "주우는 집 앞 풀숲에서 작은 포켓몬을 발견했어요.\n\n\"안녕! 너 이름이 뭐야?\" 주우가 물었어요.\n\n포켓몬은 귀여운 소리로 대답했어요. \"피카!\"",
      "주우와 피카츄는 금방 친구가 되었어요.\n\n함께 마을을 돌아다니며 신나게 놀았답니다.\n\n\"우리 최고의 파트너가 되자!\" 주우가 말했어요.",
      "해가 질 무렵, 주우와 피카츄는 집으로 돌아왔어요.\n\n\"오늘 정말 재미있었어!\" 주우가 웃으며 말했어요.\n\n피카츄도 \"피카피카!\" 하며 기뻐했답니다.\n\n- 끝 -",
    ],
  },
  {
    id: "sample-2",
    title: "용감한 꼬부기",
    author: "아빠",
    coverEmoji: "🐢",
    description: "작은 꼬부기가 용기를 내는 이야기",
    difficulty: "쉬움",
    readTime: "5분",
    category: "동화",
    pages: [
      "작은 꼬부기는 늘 겁이 많았어요.\n\n다른 포켓몬들이 놀 때도 혼자 숨어있곤 했지요.\n\n\"나는 왜 이렇게 무서운 걸까...\"",
      "어느 날, 친구 피카츄가 물에 빠졌어요!\n\n\"살려줘!\" 피카츄가 외쳤어요.\n\n꼬부기는 너무 무서웠지만...",
      "\"내가 갈게!\" 꼬부기가 용기를 냈어요.\n\n꼬부기는 물 속으로 뛰어들어 피카츄를 구했어요.\n\n\"고마워 꼬부기! 넌 진짜 용감해!\"",
      "그날 이후, 꼬부기는 더 이상 무섭지 않았어요.\n\n\"친구를 위해서라면 뭐든 할 수 있어!\" 꼬부기가 말했어요.\n\n모든 친구들이 꼬부기를 응원해줬답니다.\n\n- 끝 -",
    ],
  },
];

export default function EbookLibrary() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  const categories = ["전체", ...Array.from(new Set(booksData.map((book) => book.category)))];

  const filteredBooks =
    selectedCategory === "전체"
      ? booksData
      : booksData.filter((book) => book.category === selectedCategory);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="max-w-md w-full border-4 border-amber-400">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📚</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      <div className="container max-w-6xl py-10 px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              대시보드로
            </Button>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-amber-600" />
            주우의 도서관
            <BookOpen className="h-8 w-8 text-amber-600" />
          </h1>
          <p className="text-muted-foreground text-lg">재미있는 책을 골라서 읽어보세요!</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "border-amber-300 hover:bg-amber-100"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 책 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Link key={book.id} href={`/ebook-reader/${book.id}`}>
              <Card className="h-full border-4 border-amber-200 hover:border-amber-400 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* 책 표지 */}
                  <div className="text-center mb-4">
                    <div className="inline-block p-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-3">
                      <span className="text-6xl">{book.coverEmoji}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {book.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                  </div>

                  {/* 책 정보 */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                    {book.description}
                  </p>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      <Star className="h-3 w-3" />
                      {book.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      <Clock className="h-3 w-3" />
                      {book.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      <BookOpen className="h-3 w-3" />
                      {book.pages.length}페이지
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 책이 없을 때 */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 mx-auto text-amber-400 mb-4" />
            <p className="text-xl text-muted-foreground">아직 이 카테고리에 책이 없어요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
