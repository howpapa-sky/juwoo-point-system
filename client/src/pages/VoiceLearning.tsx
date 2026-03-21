import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Volume2, CheckCircle, XCircle, Trophy, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface Word {
  id: number;
  word: string;
  korean: string;
  category: string;
}

export default function VoiceLearning() {
  const { user } = useSupabaseAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<{ word: string; correct: boolean; userSaid: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
    initSpeechRecognition();
  }, []);

  function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(speechResult);
      checkAnswer(speechResult);
    };

    recognitionInstance.onerror = (event: any) => {
      if (import.meta.env.DEV) console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error('음성이 감지되지 않았습니다. 다시 시도해주세요.');
      } else {
        toast.error('음성 인식 오류가 발생했습니다.');
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }

  async function loadWords() {
    try {
      const { data, error } = await supabase
        .from('english_words')
        .select('id, word, korean, category')
        .limit(10);

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to load words:', error);
      toast.error('단어를 가져오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    if (!recognition) {
      toast.error('음성 인식이 초기화되지 않았습니다.');
      return;
    }

    setTranscript("");
    setIsListening(true);
    recognition.start();
  }

  function stopListening() {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }

  function checkAnswer(userSaid: string) {
    const currentWord = words[currentIndex];
    const correct = userSaid.toLowerCase() === currentWord.word.toLowerCase();

    setResults([...results, {
      word: currentWord.word,
      correct,
      userSaid
    }]);

    if (correct) {
      toast.success(`정답입니다! "${currentWord.word}"`);
    } else {
      toast(`아깝다! 정답은 "${currentWord.word}"이야. 다시 해보자! 💪`);
    }

    // 다음 단어로 이동
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTranscript("");
      } else {
        completeLesson();
      }
    }, 2000);
  }

  async function completeLesson() {
    setIsCompleted(true);
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / words.length) * 100);

    // 포인트 적립 (80% 이상 정답 시 +500P)
    if (accuracy >= 80) {
      try {
        const { data: profile } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profile) {
          const newPoints = profile.current_points + 500;
          await supabase.from('point_transactions').insert({
            juwoo_id: 1,
            rule_id: null,
            amount: 500,
            balance_after: newPoints,
            note: '음성 학습 완료',
            created_by: 1, // 시스템/관리자
          });

          await supabase
            .from('juwoo_profile')
            .update({ current_points: newPoints })
            .eq('id', 1);

          toast.success(`🎉 학습 완료! +500 포인트 적립!`);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Failed to award points:', error);
      }
    }
  }

  function playAudio() {
    const currentWord = words[currentIndex];
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">단어 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>단어가 없습니다</CardTitle>
            <CardDescription>학습할 단어를 먼저 추가해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/english-learning">
              <Button className="w-full">영어 학습으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / words.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-4 border-green-500">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16" />
            </div>
            <CardTitle className="text-3xl">학습 완료! 🎉</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              음성 인식 학습을 완료했어요!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-600 mt-1">정답</div>
              </div>
              <div className="text-center p-4 bg-slate-100 rounded-lg">
                <div className="text-3xl font-bold text-slate-600">{words.length - correctCount}</div>
                <div className="text-sm text-gray-600 mt-1">다시 도전</div>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">{accuracy}%</div>
              <div className="text-gray-600">정답률</div>
              {accuracy >= 80 && (
                <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                  <p className="text-lg font-bold text-yellow-800">+500 포인트 획득!</p>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="font-bold text-lg mb-3">학습 결과</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.correct ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-500" />
                    )}
                    <div>
                      <div className="font-bold">{result.word}</div>
                      {!result.correct && (
                        <div className="text-sm text-gray-600">당신이 말한 것: "{result.userSaid}"</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link href="/english-learning" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  영어 학습으로
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setCurrentIndex(0);
                  setResults([]);
                  setIsCompleted(false);
                  setTranscript("");
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                다시 학습하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/english-learning">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              영어 학습으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎤 음성 인식 학습</h1>
          <p className="text-gray-600">단어를 보고 영어로 발음해보세요!</p>
        </div>

        {/* 진행률 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">진행률</span>
              <span className="text-sm font-medium">{currentIndex + 1} / {words.length}</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* 단어 카드 */}
        <Card className="mb-6 border-4 border-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-2">{currentWord.category}</div>
              <CardTitle className="text-5xl mb-4">{currentWord.korean}</CardTitle>
              <CardDescription className="text-white/90 text-lg">
                이 단어를 영어로 발음하세요
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* 발음 듣기 버튼 */}
            <div className="text-center mb-6">
              <Button
                onClick={playAudio}
                variant="outline"
                className="px-8 py-6 text-lg"
              >
                <Volume2 className="mr-2 h-5 w-5" />
                발음 듣기
              </Button>
            </div>

            {/* 음성 인식 버튼 */}
            <div className="text-center mb-6">
              {!isListening ? (
                <Button
                  onClick={startListening}
                  className="px-12 py-8 text-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  <Mic className="mr-3 h-8 w-8" />
                  녹음 시작
                </Button>
              ) : (
                <Button
                  onClick={stopListening}
                  className="px-12 py-8 text-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 animate-pulse"
                >
                  <MicOff className="mr-3 h-8 w-8" />
                  녹음 중...
                </Button>
              )}
            </div>

            {/* 인식된 텍스트 */}
            {transcript && (
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">인식된 단어:</p>
                <p className="text-2xl font-bold text-blue-600">"{transcript}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 안내 */}
        <Card className="border-2 border-dashed border-blue-300">
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>"발음 듣기" 버튼을 눌러 정확한 발음을 확인하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>"녹음 시작" 버튼을 누르고 영어 단어를 발음하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>80% 이상 정답 시 +500 포인트를 획득합니다!</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
