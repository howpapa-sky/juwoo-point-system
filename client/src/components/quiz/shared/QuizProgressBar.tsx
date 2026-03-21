// 퀴즈 프로그레스 바
import { Progress } from '@/components/ui/progress';
import { categoryEmojis, type WordCategory } from '@/data/englishWordsData';

interface Props {
  currentIndex: number;
  totalQuestions: number;
  category?: string;
  difficulty?: string;
  modeLabel: string;
  score: number;
}

export default function QuizProgressBar({ currentIndex, totalQuestions, category, difficulty, modeLabel, score }: Props) {
  const progress = ((currentIndex + 1) / Math.max(totalQuestions, 1)) * 100;

  const difficultyStyle = {
    easy: { bg: 'bg-green-100', text: 'text-green-700', label: '쉬움' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: '보통' },
    hard: { bg: 'bg-orange-100', text: 'text-orange-700', label: '도전!' },
    expert: { bg: 'bg-violet-100', text: 'text-violet-700', label: '전문가' },
  }[difficulty ?? 'easy'] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: difficulty };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {difficulty && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${difficultyStyle.bg} ${difficultyStyle.text}`}>
              {difficultyStyle.label}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {modeLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {category && (
            <span className="text-sm">
              {categoryEmojis[category as WordCategory]} {category}
            </span>
          )}
          <span className="text-sm font-medium">{currentIndex + 1} / {totalQuestions}</span>
          <span className="font-bold text-blue-600">⭐ {score}점</span>
        </div>
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
}
