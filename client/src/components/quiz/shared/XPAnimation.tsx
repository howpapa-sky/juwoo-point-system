// XP 획득 플로팅 애니메이션
import { motion, AnimatePresence } from 'framer-motion';
import { xpFloat } from '@/lib/quizAnimations';

interface Props {
  xp: number;
  show: boolean;
}

export default function XPAnimation({ xp, show }: Props) {
  return (
    <AnimatePresence>
      {show && xp > 0 && (
        <motion.div
          variants={xpFloat}
          initial="initial"
          animate="animate"
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <span className="text-3xl font-bold text-yellow-500 drop-shadow-lg">
            +{xp} XP ✨
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
