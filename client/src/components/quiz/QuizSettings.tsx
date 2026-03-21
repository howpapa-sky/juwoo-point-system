// 학습 설정 화면
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Turtle, Timer, Lightbulb, Heart, Hash, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fadeIn } from '@/lib/quizAnimations';

export interface QuizSettingsState {
  soundEnabled: boolean;
  slowPronunciation: boolean;
  timerEnabled: boolean;
  hintsEnabled: boolean;
  energyEnabled: boolean;
  questionCount: number;
  largeFontSize: boolean;
}

export const defaultSettings: QuizSettingsState = {
  soundEnabled: true,
  slowPronunciation: true,   // 기본 켜기 (PSI 81)
  timerEnabled: false,        // 기본 끄기 (처리속도 약점)
  hintsEnabled: true,         // 기본 켜기 (SD 27%)
  energyEnabled: false,       // 기본 끄기 (HA 67%)
  questionCount: 10,
  largeFontSize: true,        // 기본 크게
};

interface Props {
  settings: QuizSettingsState;
  onSettingsChange: (settings: QuizSettingsState) => void;
  onBack: () => void;
}

function ToggleRow({
  icon, label, description, checked, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <div>
          <p className="font-medium text-gray-800">{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          checked ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow"
          animate={{ left: checked ? '1.5rem' : '0.125rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

export default function QuizSettings({ settings, onSettingsChange, onBack }: Props) {
  const update = (key: keyof QuizSettingsState, value: boolean | number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <Card className="shadow-lg bg-white border-2">
        <CardContent className="p-6">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold">⚙️ 학습 설정</h2>
          </div>

          {/* 토글 설정들 */}
          <div className="space-y-0">
            <ToggleRow
              icon={<Volume2 className="h-5 w-5" />}
              label="효과음"
              description="정답/오답 효과음"
              checked={settings.soundEnabled}
              onChange={v => update('soundEnabled', v)}
            />
            <ToggleRow
              icon={<Turtle className="h-5 w-5" />}
              label="느린 발음"
              description="발음을 천천히 들을 수 있어요"
              checked={settings.slowPronunciation}
              onChange={v => update('slowPronunciation', v)}
            />
            <ToggleRow
              icon={<Timer className="h-5 w-5" />}
              label="시간제한"
              description="문제당 시간 제한"
              checked={settings.timerEnabled}
              onChange={v => update('timerEnabled', v)}
            />
            <ToggleRow
              icon={<Lightbulb className="h-5 w-5" />}
              label="힌트"
              description="50/50 힌트 사용 가능"
              checked={settings.hintsEnabled}
              onChange={v => update('hintsEnabled', v)}
            />
            <ToggleRow
              icon={<Heart className="h-5 w-5" />}
              label="에너지"
              description="오답 시 에너지 감소"
              checked={settings.energyEnabled}
              onChange={v => update('energyEnabled', v)}
            />
            <ToggleRow
              icon={<Type className="h-5 w-5" />}
              label="큰 글자"
              description="글자를 더 크게 표시"
              checked={settings.largeFontSize}
              onChange={v => update('largeFontSize', v)}
            />
          </div>

          {/* 문제 수 선택 */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <Hash className="h-5 w-5 text-gray-500" />
              <p className="font-medium text-gray-800">문제 수</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map(count => (
                <motion.button
                  key={count}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => update('questionCount', count)}
                  className={`py-3 rounded-xl border-2 font-bold transition-all ${
                    settings.questionCount === count
                      ? 'bg-purple-100 border-purple-400 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {count}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              💡 설정은 자동으로 저장돼요. 주우에게 가장 편한 설정으로 공부해요!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
