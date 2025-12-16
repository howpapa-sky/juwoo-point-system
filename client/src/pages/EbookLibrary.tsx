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
    id: "pokemon-go-guide",
    title: "주우를 위한 포켓몬고 레벨업 대모험!",
    author: "아빠",
    coverEmoji: "🚀",
    description: "70레벨 마스터를 향한 첫걸음! 포켓몬고 완벽 공략집",
    difficulty: "보통",
    readTime: "20분",
    category: "공략집",
    pages: [
      "🚀 주우를 위한 포켓몬고 레벨업 대모험! 🚀\n\n🌟 70레벨 마스터를 향한 첫걸음! 🌟\n\n안녕, 주우! 포켓몬 마스터를 꿈꾸는 멋진 트레이너구나!\n\n지금부터 포켓몬고 레벨 31에서 70까지, 아주 신나고 재미있는 모험을 함께 떠나볼 거야.\n\n이 책은 주우만을 위한 특별한 공략집이니까, 차근차근 따라오면 어느새 멋진 고수가 되어 있을 거야!\n\n준비됐지? 출발!",

      "🌈 1장: 포켓몬고 세상과 친해지기\n\n🗺️ 포켓몬고는 어떤 게임일까?\n\n포켓몬고는 우리가 사는 진짜 세상에서 포켓몬을 잡고, 키우고, 친구들과 배틀하는 정말 신기한 게임이야!\n\n주우가 밖으로 나가서 걸어 다니면, 스마트폰 화면에 귀여운 포켓몬들이 뿅! 하고 나타날 거야.\n\n그럼 몬스터볼을 던져서 잡으면 돼. 정말 쉽지?",

      "🎒 모험에 꼭 필요한 도구들!\n\n• 몬스터볼: 포켓몬을 잡을 때 쓰는 동그란 공이야. 포켓스탑에서 많이 얻을 수 있어!\n\n• 상처약: 배틀에서 다친 포켓몬을 치료해주는 약이야. 체육관을 돌리면 더 많이 나와!\n\n• 나무열매: 포켓몬에게 주면 더 잡기 쉬워지거나, 사탕을 2배로 주기도 해!\n\n  🍍 파인열매: 포켓몬을 잡으면 사탕을 2배로 줘! 진화시킬 때 아주 좋아.\n\n  🍓 라즈열매: 포켓몬이 몬스터볼에서 도망가지 않게 도와줘.",

      "📍 포켓스탑과 체육관: 보물이 가득한 곳!\n\n• 포켓스탑: 파란색 네모 모양이야. 가까이 가서 빙글빙글 돌리면 몬스터볼, 알, 상처약 같은 선물이 쏟아져!\n\n• 체육관: 아주 높은 탑처럼 생겼어. 내 포켓몬을 체육관에 보내서 지키게 하면, 포켓코인이라는 용돈을 받을 수 있어!\n\n이 용돈으로 멋진 아이템을 살 수 있단다.",

      "🎯 2장: 경험치(XP) 쑥쑥! 레벨업 비법\n\n레벨을 빨리 올리려면 경험치(XP)가 많이 필요해.\n\n경험치를 많이 얻는 비밀 방법을 알려줄게!\n\n🥇 경험치 많이 얻는 꿀팁 BEST 5!",

      "1️⃣ 엑설런트 던지기 마스터하기! (1,000 XP)\n\n포켓몬을 잡을 때, 동그란 원이 가장 작아졌을 때 맞추면 'Excellent!'가 떠!\n\n무려 1,000 XP나 주니까 꼭 연습해보자!\n\n처음엔 어려워도, 자꾸 하다 보면 금방 익숙해질 거야.\n\n2️⃣ 새로운 친구 사귀고 선물 보내기! (최대 100,000 XP)\n\n친구랑 선물을 주고받으면 우정 레벨이 올라가.\n\n'베스트 프렌드'가 되면 무려 100,000 XP를 한 번에 얻을 수 있어!\n\n이건 레벨업에 정말 최고야!",

      "3️⃣ 행복의알 사용하기! (경험치 2배!)\n\n행복의알을 사용하면 30분 동안 모든 경험치가 2배가 돼!\n\n친구랑 베스트 프렌드가 되기 직전에 사용하거나, 포켓몬을 많이 진화시킬 때 쓰면 레벨이 엄청 빨리 올라!\n\n4️⃣ 레이드 배틀에 도전하기! (최대 25,000 XP)\n\n체육관에 나타나는 아주 강한 보스 포켓몬을 다른 친구들과 함께 무찌르는 거야!\n\n5성 레이드에서 이기면 10,000 XP를 얻을 수 있어. 정말 짜릿하겠지?",

      "5️⃣ 포켓몬 진화시키기! (1,000 XP)\n\n구구나 뿔충이, 캐터피처럼 사탕이 적게 드는 포켓몬들을 모았다가, 행복의알을 켜고 한 번에 진화시키면 경험치가 쑥쑥 올라!\n\n'펑펑' 터져!\n\n🗓️ 매일매일 잊지 말아야 할 숙제!\n\n• 첫 포켓몬 잡기: 1,500 XP\n• 첫 포켓스탑 돌리기: 500 XP\n• 체육관에 포켓몬 올려두기: 하루 최대 50 포켓코인\n• 친구에게 선물 보내기: 우정 레벨 올리기!\n\n이것만 매일 해도 레벨이 쑥쑥 오를 거야!",

      "🌟 3장: 강력한 포켓몬 군단 만들기!\n\n레벨만 높다고 다가 아니지!\n\n멋지고 강한 포켓몬 친구들이 있어야 진짜 마스터라고 할 수 있어.\n\n💪 어떤 포켓몬을 키워야 할까?\n\n1. 반짝반짝 빛나는 포켓몬 (CP가 높은 포켓몬)\n야생에서 잡았는데 CP가 높은 포켓몬은 바로 사용하기 좋아! 별의모래를 아낄 수 있거든.\n\n2. 전설의 포켓몬 & 환상의 포켓몬\n5성 레이드나 특별한 리서치를 통해 얻을 수 있는 아주 특별하고 강한 포켓몬이야! 이상한 사탕을 모아서 꼭 키워보자!",

      "3. 메가 진화가 가능한 포켓몬\n이상해꽃, 리자몽, 거북왕처럼 메가 진화를 하면 잠시 동안 엄청나게 강해지는 포켓몬들이야.\n\n레이드 배틀에서 대활약할 수 있어!\n\n✨ 강화와 진화, 어떻게 다를까?\n\n• 강화: 포켓몬의 CP(전투력)와 HP(체력)를 높여주는 거야. 별의모래와 사탕이 필요해.\n\n• 진화: 포켓몬의 모습을 바꾸고 더 강하게 만드는 거야. 사탕이 많이 필요해. 어떤 포켓몬은 특별한 진화 아이템이 필요하기도 해!",

      "🍬 별의모래와 사탕, 알뜰하게 모으는 법!\n\n• 별의모래: 포켓몬을 잡거나, 알을 부화시키거나, 친구에게 선물을 받으면 얻을 수 있어. 아껴 쓰는 게 중요해!\n\n• 사탕: 같은 종류의 포켓몬을 잡거나, 파인열매를 주고 잡거나, 파트너 포켓몬과 함께 걸으면 얻을 수 있어.\n\n💡 주우를 위한 꿀팁!\n별의모래는 정말 소중하니까, 처음에는 CP가 높은 포켓몬 위주로 사용하고, 정말 마음에 드는 강한 포켓몬에게만 집중적으로 투자하는 게 좋아!",

      "🛡️ 4장: 배틀 마스터가 되는 길!\n\n이제 직접 배틀에 참여해서 실력을 뽐내볼 시간이야!\n\n⚔️ 체육관 배틀: 나의 힘을 보여줘!\n\n• 다른 팀의 체육관을 공격해서 내 포켓몬을 올려놓을 수 있어.\n\n• 상대방 포켓몬의 약점을 찌르는 타입의 포켓몬을 내보내면 쉽게 이길 수 있어!\n\n(예: 불 타입 포켓몬은 물 타입 공격에 약해!)",

      "🤝 레이드 배틀: 친구와 함께라면 무섭지 않아!\n\n• 혼자서는 이기기 힘든 강력한 보스 포켓몬을 여러 친구들과 힘을 합쳐 싸우는 거야.\n\n• 레이드에서 이기면 전설의 포켓몬을 잡을 수 있는 기회와 멋진 보상을 받을 수 있어!\n\n🚀 GO로켓단: 그림자 포켓몬을 구해줘!\n\n• 검은 포켓스탑에 나타나는 나쁜 악당들이야. GO로켓단을 이기면 아파하는 그림자 포켓몬을 구할 수 있어.\n\n• 그림자 포켓몬을 정화하면 착한 마음을 되찾고 더 강해진단다!",

      "💡 안전하게 게임하자!\n\n포켓몬을 잡으러 다닐 때는 항상 주변을 잘 살피고, 차 조심, 사람 조심!\n\n절대로 위험한 곳에는 혼자 가지 않도록 약속해, 주우!",

      "🏆 5장: 70레벨을 향한 특별 미션!\n\n레벨 40이 넘어가면, 경험치만 모으는 게 아니라 특별한 미션을 깨야 레벨업을 할 수 있어.\n\n주우가 70레벨까지 가면서 만나게 될 재미있는 미션들을 미리 살짝 알려줄게!\n\n🏅 플래티넘 메달 모으기\n한 가지 타입의 포켓몬을 많이 잡거나, 특정 활동을 많이 하면 얻을 수 있는 멋진 메달이야. 꾸준히 게임을 하다 보면 자연스럽게 모일 거야!",

      "🤝 친구와 함께하는 미션\n친구와 포켓몬을 교환하거나, 선물을 보내는 미션이 많아. 친구들과 사이좋게 지내는 게 레벨업에도 큰 도움이 돼!\n\n🚶‍♂️ 함께 걷는 모험\n파트너 포켓몬과 함께 걷거나, 알을 부화시키는 미션도 있어. 밖에서 신나게 뛰어놀수록 레벨이 쑥쑥!\n\n💡 미션은 즐겁게!\n미션이 어렵게 느껴질 수도 있지만, 게임을 즐기다 보면 어느새 다 깨져 있을 거야. 조급해하지 말고, 하나씩 즐겁게 도전해보자!",

      "📚 부록: 주우를 위한 포켓몬고 용어 사전\n\n• CP (Combat Power): 포켓몬이 얼마나 강한지를 나타내는 숫자야. 높을수록 강해!\n\n• HP (Health Points): 포켓몬의 체력이야. 배틀에서 0이 되면 기절해.\n\n• 개체값 (IV): 포켓몬이 태어날 때부터 가지고 있는 숨겨진 능력치야. 별 3개짜리 포켓몬이 좋은 포켓몬이야!\n\n• 타입 상성: 포켓몬에게는 불, 물, 풀 같은 타입이 있어. 가위바위보처럼 서로에게 강하고 약한 관계가 있단다.",

      "• 커뮤니티 데이: 한 달에 한 번, 특정 포켓몬이 아주 많이 나타나는 특별한 날이야! 색이 다른(이로치) 포켓몬을 만날 절호의 기회!\n\n🎉 이제 주우도 포켓몬고 마스터!\n\n이 책과 함께라면 주우는 분명 70레벨을 훌쩍 넘는 멋진 포켓몬 마스터가 될 수 있을 거야!\n\n가장 중요한 건 레벨을 빨리 올리는 것보다, 포켓몬들과 함께 즐겁게 모험하는 마음이란 걸 잊지 마!\n\n언제나 응원할게!\n\n모험을 떠나자, 주우! 🌟 챔피언! 🌟\n\n- 끝 -",
    ],
  },
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
