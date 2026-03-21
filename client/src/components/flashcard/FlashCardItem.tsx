// 개별 플래시카드 UI — 클래식/스펠링/듣기 모드별 카드
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Lightbulb } from 'lucide-react';
import { SRS_BOX_META } from '@/lib/englishConstants';
import type { EnglishWord, WordCategory } from '@/data/englishWordsData';
import { SpellingControls, ListenButton } from './FlashCardControls';

// 카테고리 테마
const categoryThemes: Record<WordCategory, {
  bg: string; border: string; icon: string; gradient: string;
}> = {
  "동물": { bg: "from-amber-100 to-orange-100", border: "border-amber-400", icon: "🐾", gradient: "from-amber-500 to-orange-500" },
  "과일": { bg: "from-pink-100 to-rose-100", border: "border-pink-400", icon: "🍎", gradient: "from-pink-500 to-rose-500" },
  "색깔": { bg: "from-purple-100 to-fuchsia-100", border: "border-purple-400", icon: "🌈", gradient: "from-purple-500 to-pink-500" },
  "숫자": { bg: "from-blue-100 to-cyan-100", border: "border-blue-400", icon: "🔢", gradient: "from-blue-500 to-cyan-500" },
  "가족": { bg: "from-pink-100 to-rose-100", border: "border-pink-400", icon: "👨‍👩‍👧", gradient: "from-pink-500 to-rose-500" },
  "음식": { bg: "from-yellow-100 to-amber-100", border: "border-yellow-400", icon: "🍔", gradient: "from-yellow-500 to-amber-500" },
  "자연": { bg: "from-green-100 to-emerald-100", border: "border-green-400", icon: "🌳", gradient: "from-green-500 to-emerald-500" },
  "탈것": { bg: "from-slate-100 to-gray-100", border: "border-slate-400", icon: "🚗", gradient: "from-slate-500 to-gray-500" },
  "신체": { bg: "from-rose-100 to-pink-100", border: "border-rose-400", icon: "🖐️", gradient: "from-rose-500 to-pink-500" },
  "감정": { bg: "from-yellow-100 to-orange-100", border: "border-yellow-400", icon: "😊", gradient: "from-yellow-500 to-orange-500" },
  "날씨": { bg: "from-sky-100 to-blue-100", border: "border-sky-400", icon: "☀️", gradient: "from-sky-500 to-blue-500" },
  "포켓몬": { bg: "from-yellow-100 to-orange-100", border: "border-yellow-400", icon: "⚡", gradient: "from-yellow-500 to-orange-500" },
  "동사": { bg: "from-indigo-100 to-violet-100", border: "border-indigo-400", icon: "🏃", gradient: "from-indigo-500 to-violet-500" },
  "학교": { bg: "from-blue-100 to-indigo-100", border: "border-blue-400", icon: "🏫", gradient: "from-blue-500 to-indigo-500" },
  "장소": { bg: "from-teal-100 to-cyan-100", border: "border-teal-400", icon: "📍", gradient: "from-teal-500 to-cyan-500" },
  "반대말": { bg: "from-purple-100 to-fuchsia-100", border: "border-purple-400", icon: "↔️", gradient: "from-purple-500 to-fuchsia-500" },
  "시간": { bg: "from-orange-100 to-amber-100", border: "border-orange-400", icon: "⏰", gradient: "from-orange-500 to-amber-500" },
  "일상표현": { bg: "from-lime-100 to-green-100", border: "border-lime-400", icon: "💬", gradient: "from-lime-500 to-green-500" },
  "옷": { bg: "from-fuchsia-100 to-pink-100", border: "border-fuchsia-400", icon: "👕", gradient: "from-fuchsia-500 to-pink-500" },
  "집": { bg: "from-amber-100 to-yellow-100", border: "border-amber-400", icon: "🏠", gradient: "from-amber-500 to-yellow-500" },
  "스포츠": { bg: "from-green-100 to-teal-100", border: "border-green-400", icon: "⚽", gradient: "from-green-500 to-teal-500" },
  "직업": { bg: "from-cyan-100 to-blue-100", border: "border-cyan-400", icon: "👨‍🔬", gradient: "from-cyan-500 to-blue-500" },
  "악기": { bg: "from-violet-100 to-purple-100", border: "border-violet-400", icon: "🎸", gradient: "from-violet-500 to-purple-500" },
  "형용사": { bg: "from-emerald-100 to-teal-100", border: "border-emerald-400", icon: "✨", gradient: "from-emerald-500 to-teal-500" },
  "문장": { bg: "from-blue-100 to-purple-100", border: "border-blue-400", icon: "📝", gradient: "from-blue-500 to-purple-500" },
};

export function getCategoryTheme(category: WordCategory) {
  return categoryThemes[category] ?? categoryThemes["동물"];
}

// 클래식 퀴즈 카드
interface ClassicCardProps {
  word: EnglishWord;
  options: EnglishWord[];
  selectedAnswer: number | null;
  isAnswered: boolean;
  srsBox?: number;
  onAnswer: (wordId: number) => void;
  onSpeak: (text: string) => void;
  difficultyLabel: string;
  difficultyStars: number;
}

export function ClassicQuizCard({
  word, options, selectedAnswer, isAnswered, srsBox,
  onAnswer, onSpeak, difficultyLabel, difficultyStars,
}: ClassicCardProps) {
  const theme = getCategoryTheme(word.category);
  const optionLabels = ['①', '②', '③'];

  return (
    <motion.div
      key={word.id}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className={`border-4 ${theme.border} shadow-xl mb-6 overflow-hidden`}>
        <div className={`bg-gradient-to-r ${theme.gradient} p-3 flex items-center justify-between`}>
          <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
            {theme.icon} {word.category}
          </Badge>
          <div className="flex items-center gap-2">
            {srsBox != null && SRS_BOX_META[srsBox] && (
              <Badge className="bg-white/30 text-white border-0 text-sm px-2 py-1">
                {SRS_BOX_META[srsBox].icon} {SRS_BOX_META[srsBox].label}
              </Badge>
            )}
            <Badge className="bg-white/20 text-white border-0 text-sm">
              {difficultyLabel} {'⭐'.repeat(difficultyStars)}
            </Badge>
          </div>
        </div>
        <CardContent className="flex flex-col items-center justify-center p-6 py-8">
          <p className="text-sm text-muted-foreground mb-2">이 단어의 뜻은? 🤔</p>
          <motion.h2
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {word.word}
          </motion.h2>
          <Button
            size="sm"
            onClick={() => onSpeak(word.word)}
            className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white shadow-lg`}
            style={{ minHeight: 48 }}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            발음 듣기 🔊
          </Button>
        </CardContent>
      </Card>

      {/* 3지선다 보기 */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {options.map((option, idx) => {
          const isCorrect = option.id === word.id;
          const isSelected = selectedAnswer === option.id;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileTap={{ scale: isAnswered ? 1 : 0.97 }}
            >
              <Button
                onClick={() => onAnswer(option.id)}
                disabled={isAnswered}
                variant="outline"
                className={`w-full h-16 text-xl font-bold border-3 transition-all ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-green-100 border-green-500 text-green-700 shadow-lg'
                      : isSelected
                      ? 'bg-orange-100 border-orange-400 text-orange-700'
                      : 'opacity-40'
                    : 'hover:border-purple-400 hover:bg-purple-50 bg-white'
                }`}
                style={{ minHeight: 64 }}
              >
                <span className="mr-2 text-sm opacity-70">{optionLabels[idx]}</span>
                {option.meaning}
                {isAnswered && isCorrect && <span className="ml-2">✅</span>}
                {isAnswered && isSelected && !isCorrect && <span className="ml-2">💡</span>}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* 정답 후 정보 */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className={`border-2 ${selectedAnswer === word.id ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'} mb-4`}>
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold mb-1">{word.word} = {word.meaning}</p>
                <p className="text-sm text-gray-500 mb-1">{word.pronunciation}</p>
                {word.tip && (
                  <p className="text-sm text-yellow-700 flex items-center justify-center gap-1">
                    <Lightbulb className="h-3 w-3" />{word.tip}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-1 italic">
                  "{word.example}" - {word.exampleKorean}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 스펠링 카드
interface SpellingCardProps {
  word: EnglishWord;
  srsBox?: number;
  hintText: string;
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  onHint: () => void;
  onNext: () => void;
  onSpeak: (text: string) => void;
  hintCount: number;
  showAnswer: boolean;
}

export function SpellingCard({
  word, srsBox, hintText, input, onInputChange,
  onSubmit, onHint, onNext, onSpeak, hintCount, showAnswer,
}: SpellingCardProps) {
  const theme = getCategoryTheme(word.category);

  return (
    <motion.div key={word.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`border-4 ${theme.border} shadow-xl mb-6`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className={`bg-gradient-to-r ${theme.gradient} text-white border-0`}>
              {theme.icon} {word.category}
            </Badge>
            {srsBox != null && SRS_BOX_META[srsBox] && (
              <Badge variant="outline" className="text-sm">
                {SRS_BOX_META[srsBox].icon} {SRS_BOX_META[srsBox].label}
              </Badge>
            )}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-2 text-gray-800">{word.meaning}</h2>
          <Button variant="ghost" onClick={() => onSpeak(word.word)} className="mb-4" style={{ minHeight: 48 }}>
            <Volume2 className="h-5 w-5 mr-2" />발음 듣기
          </Button>
          <div className="text-3xl font-mono tracking-[0.5em] mb-4 text-gray-400">{hintText}</div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              placeholder="영어 단어를 입력하세요"
              className="flex-1 px-4 py-3 text-xl border-2 rounded-xl focus:border-purple-500 focus:outline-none text-center"
              disabled={showAnswer}
              style={{ fontSize: 20, minHeight: 48 }}
            />
          </div>
          {showAnswer && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 mb-4">
              <p className="text-blue-800">정답: <span className="font-bold text-2xl">{word.word}</span></p>
            </motion.div>
          )}
          <SpellingControls
            onHint={onHint} onSubmit={onSubmit} onNext={onNext}
            hintCount={hintCount} maxHints={word.word.length}
            showAnswer={showAnswer} gradient={theme.gradient}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 듣기 카드
interface ListeningCardProps {
  word: EnglishWord;
  options: EnglishWord[];
  selectedAnswer: number | null;
  isAnswered: boolean;
  srsBox?: number;
  onAnswer: (wordId: number) => void;
  onPlay: () => void;
}

export function ListeningCard({
  word, options, selectedAnswer, isAnswered, srsBox, onAnswer, onPlay,
}: ListeningCardProps) {
  return (
    <motion.div key={word.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-4 border-purple-300 shadow-xl mb-6">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">👂</div>
          {srsBox != null && SRS_BOX_META[srsBox] && (
            <div className="mb-2">
              <Badge variant="outline" className="text-sm">
                {SRS_BOX_META[srsBox].icon} {SRS_BOX_META[srsBox].label}
              </Badge>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-4">무슨 단어일까요?</h2>
          <ListenButton onPlay={onPlay} />
          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => {
              const isCorrect = option.id === word.id;
              const isSelected = selectedAnswer === option.id;
              return (
                <motion.div key={option.id} whileTap={{ scale: isAnswered ? 1 : 0.97 }}>
                  <Button
                    onClick={() => onAnswer(option.id)}
                    disabled={isAnswered}
                    variant="outline"
                    className={`w-full h-16 text-xl border-3 ${
                      isAnswered
                        ? isCorrect ? 'bg-green-100 border-green-500 text-green-700'
                          : isSelected ? 'bg-orange-100 border-orange-400 text-orange-700' : 'opacity-50'
                        : 'hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    style={{ minHeight: 64 }}
                  >
                    {option.meaning}
                    {isAnswered && isCorrect && ' ✅'}
                    {isAnswered && isSelected && !isCorrect && ' 💡'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
