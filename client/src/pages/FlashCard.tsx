import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Volume2, Check, X, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// 임시 샘플 데이터 (나중에 Supabase로 교체)
const sampleWords = [
  { id: 1, word: 'cat', meaning: '고양이', category: '동물', pronunciation: 'kæt' },
  { id: 2, word: 'dog', meaning: '강아지', category: '동물', pronunciation: 'dɔːɡ' },
  { id: 3, word: 'apple', meaning: '사과', category: '과일', pronunciation: 'æpl' },
  { id: 4, word: 'banana', meaning: '바나나', category: '과일', pronunciation: 'bənænə' },
  { id: 5, word: 'red', meaning: '빨강', category: '색깔', pronunciation: 'red' },
  { id: 6, word: 'blue', meaning: '파랑', category: '색깔', pronunciation: 'bluː' },
  { id: 7, word: 'one', meaning: '하나', category: '숫자', pronunciation: 'wʌn' },
  { id: 8, word: 'two', meaning: '둘', category: '숫자', pronunciation: 'tuː' },
  { id: 9, word: 'mom', meaning: '엄마', category: '가족', pronunciation: 'mɑːm' },
  { id: 10, word: 'dad', meaning: '아빠', category: '가족', pronunciation: 'dæd' },
];

export default function FlashCard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<number[]>([]);
  const [unknownWords, setUnknownWords] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentWord = sampleWords[currentIndex];
  const totalWords = sampleWords.length;
  const progress = ((knownWords.length + unknownWords.length) / totalWords) * 100;

  // 음성 재생 함수
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // 7살 아이를 위해 천천히
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('음성 재생을 지원하지 않는 브라우저입니다.');
    }
  };

  // 카드 뒤집기
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // 아는 단어로 표시
  const handleKnown = async () => {
    if (!knownWords.includes(currentWord.id)) {
      setKnownWords([...knownWords, currentWord.id]);
      nextCard();
    }
  };

  // 모르는 단어로 표시
  const handleUnknown = () => {
    if (!unknownWords.includes(currentWord.id)) {
      setUnknownWords([...unknownWords, currentWord.id]);
      nextCard();
    }
  };

  // 다음 카드
  const nextCard = async () => {
    setIsFlipped(false);
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
      // 포인트 적립
      await awardPoints();
      // 포인트 적립 (나중에 구현)
      toast.success('🎉 모든 카드 학습 완료!');
    }
  };

  // 다시 시작
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setUnknownWords([]);
    setIsCompleted(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">영어 학습을 하려면 로그인해주세요.</p>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인하기</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 포인트 적립 함수
  const awardPoints = async () => {
    try {
      // 현재 포인트 조회
      const { data: profile } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      const currentBalance = profile?.current_points || 0;
      const points = 500;
      const newBalance = currentBalance + points;

      // 포인트 적립
      await supabase
        .from('point_transactions')
        .insert({
          amount: points,
          note: '플래시카드 10개 학습 완료',
        });

      // 잔액 업데이트
      await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      toast.success(`🎉 ${points} 포인트 획득!`);
    } catch (error) {
      console.error('포인트 적립 오류:', error);
    }
  };

  if (isCompleted) {
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

          <Card className="border-2 border-green-300 dark:border-green-700">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">학습 완료! 🎉</h1>
                <p className="text-xl text-muted-foreground">모든 플래시카드를 학습했어요!</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-green-50 dark:bg-green-950 rounded-xl border-2 border-green-300 dark:border-green-700">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Check className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">아는 단어</span>
                  </div>
                  <div className="text-4xl font-bold text-green-600">{knownWords.length}</div>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-950 rounded-xl border-2 border-red-300 dark:border-red-700">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <X className="h-6 w-6 text-red-600" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">모르는 단어</span>
                  </div>
                  <div className="text-4xl font-bold text-red-600">{unknownWords.length}</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  다시 학습하기
                </Button>
                <Link href="/english-quiz">
                  <Button size="lg" variant="outline">
                    퀴즈 풀기
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">플래시카드 학습 📚</h1>
          <p className="text-muted-foreground">카드를 뒤집어서 뜻을 확인하세요!</p>
        </div>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm font-medium">{knownWords.length + unknownWords.length} / {totalWords}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* 플래시카드 */}
        <div className="mb-8 perspective-1000">
          <div
            className={`relative w-full h-[400px] md:h-[500px] transition-transform duration-500 transform-style-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
          >
            {/* 앞면 (영어 단어) */}
            <Card
              className={`absolute inset-0 backface-hidden border-4 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 ${
                isFlipped ? 'invisible' : 'visible'
              }`}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-8">
                <div className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                  {currentWord.category}
                </div>
                <h2 className="text-6xl md:text-8xl font-bold mb-6 text-blue-700 dark:text-blue-300">
                  {currentWord.word}
                </h2>
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord.word);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Volume2 className="h-6 w-6 mr-2" />
                  발음 듣기
                </Button>
                <p className="mt-6 text-muted-foreground text-sm">카드를 클릭하면 뜻이 나와요!</p>
              </CardContent>
            </Card>

            {/* 뒷면 (한글 뜻) */}
            <Card
              className={`absolute inset-0 backface-hidden rotate-y-180 border-4 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 ${
                isFlipped ? 'visible' : 'invisible'
              }`}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-8">
                <div className="mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium">
                  {currentWord.category}
                </div>
                <h2 className="text-5xl md:text-7xl font-bold mb-4 text-purple-700 dark:text-purple-300">
                  {currentWord.meaning}
                </h2>
                <p className="text-2xl text-muted-foreground mb-6">/{currentWord.pronunciation}/</p>
                <p className="text-muted-foreground text-sm">이 단어를 알고 있나요?</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleUnknown}
            className="flex-1 max-w-xs bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white h-16 text-lg"
          >
            <X className="h-6 w-6 mr-2" />
            모르겠어요
          </Button>
          <Button
            size="lg"
            onClick={handleKnown}
            className="flex-1 max-w-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-16 text-lg"
          >
            <Check className="h-6 w-6 mr-2" />
            알아요!
          </Button>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
