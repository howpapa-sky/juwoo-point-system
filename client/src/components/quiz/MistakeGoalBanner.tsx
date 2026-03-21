// 실수 목표 배너 — 퀴즈 세션 시작 시 표시
// "오늘은 실수 3번이 목표야!" → 실수를 허락하는 안전 장치
import { motion } from 'framer-motion';
import type { MistakeGoal } from '@/hooks/useMistakeGoal';

interface Props {
  goal: MistakeGoal | null;
}

export default function MistakeGoalBanner({ goal }: Props) {
  if (!goal) return null;

  const { target_mistakes, actual_mistakes, goal_met } = goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className={`rounded-2xl p-4 text-center ${
        goal_met
          ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl">{goal_met ? '🎉' : '🎯'}</span>
          <span className="font-bold text-slate-700">
            {goal_met
              ? '실수 목표 달성! 잘했어!'
              : `오늘은 실수 ${target_mistakes}번이 목표야!`}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="text-slate-500">
            오늘 실수: <strong className="text-slate-700">{actual_mistakes}번</strong>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            목표: <strong className="text-slate-700">{target_mistakes}번</strong>
          </span>
        </div>
        {!goal_met && actual_mistakes > 0 && (
          <p className="text-sm text-blue-500 mt-1">
            실수는 배움의 일부야! 걱정하지 마!
          </p>
        )}
      </div>
    </motion.div>
  );
}
