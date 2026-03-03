// 콤보 카운터 컴포넌트
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { streakVariants } from '@/lib/quizAnimations';

interface Props {
  streak: number;
  combo: number;
}

export default function ComboCounter({ streak, combo }: Props) {
  return (
    <AnimatePresence>
      {streak > 0 && (
        <motion.div
          variants={streakVariants}
          initial="initial"
          animate="animate"
          exit={{ scale: 0 }}
          className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full"
        >
          <Flame className="h-4 w-4 text-orange-600" />
          <span className="font-bold text-orange-600">{streak}</span>
          {combo > 1 && <span className="text-xs text-orange-500">x{combo.toFixed(1)}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
