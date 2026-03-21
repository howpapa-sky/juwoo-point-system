// 플래시카드 컨트롤 버튼 (넘기기/TTS/힌트)
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb, Check, ChevronRight } from 'lucide-react';

interface SpellingControlsProps {
  onHint: () => void;
  onSubmit: () => void;
  onNext: () => void;
  hintCount: number;
  maxHints: number;
  showAnswer: boolean;
  gradient: string;
}

export function SpellingControls({
  onHint, onSubmit, onNext, hintCount, maxHints, showAnswer, gradient,
}: SpellingControlsProps) {
  return (
    <div className="flex gap-2 justify-center">
      <Button onClick={onHint} variant="outline" disabled={hintCount >= maxHints || showAnswer}>
        <Lightbulb className="h-4 w-4 mr-2" />
        힌트 ({hintCount}/{maxHints})
      </Button>
      {!showAnswer ? (
        <Button onClick={onSubmit} className={`bg-gradient-to-r ${gradient}`}>
          <Check className="h-4 w-4 mr-2" />
          확인
        </Button>
      ) : (
        <Button onClick={onNext}>
          다음 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

interface ListenButtonProps {
  onPlay: () => void;
}

export function ListenButton({ onPlay }: ListenButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="lg"
        onClick={onPlay}
        className="mb-6 h-20 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        style={{ minHeight: 80 }}
      >
        <Volume2 className="h-8 w-8 mr-2" />
        <span className="text-xl">다시 듣기 🔊</span>
      </Button>
    </motion.div>
  );
}
