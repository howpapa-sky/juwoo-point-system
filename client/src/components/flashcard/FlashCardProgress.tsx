// 플래시카드 진행률 표시
import { Progress } from '@/components/ui/progress';
import { Flame, Star, Zap } from 'lucide-react';
import type { LearningStats, LearningMode, MatchCard } from './useFlashCardSession';

interface Props {
  mode: LearningMode;
  currentIndex: number;
  totalWords: number;
  matchedPairs: number[];
  matchCards: MatchCard[];
  stats: LearningStats;
}

export default function FlashCardProgress({
  mode, currentIndex, totalWords, matchedPairs, matchCards, stats,
}: Props) {
  const progress = mode === 'matching'
    ? matchCards.length > 0 ? (matchedPairs.length / (matchCards.length / 2)) * 100 : 0
    : totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0;

  return (
    <div className="mb-4">
      {/* 스탯 바 */}
      <div className="flex items-center justify-end gap-3 mb-2">
        <div className="flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-bold text-orange-600">{stats.streak}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-bold text-yellow-600">{stats.stars}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="font-bold text-purple-600">{stats.xp}</span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="flex items-center justify-between mb-1 text-sm">
        <span className="font-medium">
          {mode === 'matching'
            ? `${matchedPairs.length} / ${matchCards.length / 2} 짝`
            : `${currentIndex + 1} / ${totalWords}`}
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
}
