// 별점 시스템 (하트 대체, 빨간색 없음!)
import { Star } from 'lucide-react';

interface Props {
  correctCount: number;
  totalAnswered: number;
}

export default function EnergyBar({ correctCount, totalAnswered }: Props) {
  const percent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;
  const stars = percent >= 90 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;

  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= stars
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}
