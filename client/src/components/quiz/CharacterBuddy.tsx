// "영단이" 캐릭터 반응 시스템 — Phase 2 확장 (실수 친구 연동)
import { motion } from 'framer-motion';

type BuddyMood = 'greeting' | 'correct' | 'wrong' | 'combo' | 'hint' | 'dontknow' | 'bonus' | 'complete' | 'new_friend' | 'friend_mastered';

const BUDDY_MESSAGES: Record<BuddyMood, string[]> = {
  greeting: [
    '주우야, 오늘은 어떤 단어를 배울까?',
    '준비됐어? 출발!',
    '오늘도 같이 공부하자!',
    '주우야! 반가워! 오늘도 화이팅!',
  ],
  correct: [
    '오! 대박이다!',
    '역시 주우야!',
    '천재다~!',
    '완벽해!',
    '멋지다!',
    '정확해! 정답!',
  ],
  wrong: [
    '괜찮아, 같이 다시 해보자!',
    '아깝다! 거의 맞았어!',
    '다음엔 꼭 맞출 수 있어!',
    '도전했네! 그게 중요해!',
    '배우는 거야! 괜찮아!',
    '아까워! 다시 들어보자!',
  ],
  combo: [
    '우와~ 콤보다! 멈추지 마!',
    '연속 정답! 대단해!',
    '불타오른다! 🔥',
    '이대로 가자!',
  ],
  hint: [
    '힌트 쓰는 것도 실력이야!',
    '좋은 전략이야!',
    '현명한 선택이야!',
  ],
  dontknow: [
    '정직한 게 최고야! 같이 알아보자!',
    '모른다고 말하는 것도 용기야!',
    '이제 정답을 알았으니 기억하자!',
  ],
  bonus: [
    '보너스 라운드! 다시 도전해볼까?',
    '한 번 더! 이번엔 맞출 수 있어!',
    '복습 시간이야! 파이팅!',
  ],
  complete: [
    '오늘도 고생했어! 내일 또 만나!',
    '대단해! 오늘도 성장했어!',
    '최고야! 다음에 또 하자!',
    '잘했어! 주우는 영어 천재야!',
  ],
  // Phase 2: 실수 친구 도감 연동
  new_friend: [
    '새로운 실수 친구가 왔어! 이름을 지어줄까?',
    '앗, 실수 친구가 찾아왔네! 반갑다!',
    '새 친구가 생겼어! 도감에서 만나보자!',
  ],
  friend_mastered: [
    '실수 친구가 단어를 마스터했어! 대단해!',
    '친구가 성장했어! 함께 자랐구나!',
    '와! 이 친구도 이제 영어 전문가야!',
  ],
};

export const getBuddyMessage = (mood: BuddyMood): string => {
  const messages = BUDDY_MESSAGES[mood];
  return messages[Math.floor(Math.random() * messages.length)];
};

export type { BuddyMood };

interface Props {
  message: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CharacterBuddy({ message, size = 'md' }: Props) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2"
    >
      <motion.span
        className="text-2xl flex-shrink-0"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🤖
      </motion.span>
      <div className={`bg-blue-50 rounded-xl rounded-tl-none px-4 py-2 ${sizeClass}`}>
        <span className="font-medium text-blue-700">{message}</span>
      </div>
    </motion.div>
  );
}
