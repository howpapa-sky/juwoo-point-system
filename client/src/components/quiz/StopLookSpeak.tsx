// Stop-Look-Speak 시스템
// 전두엽 억제 기능(inhibitory control)이 만 6~7세에 급격히 발달하는 시기.
// 외부 프롬프트("멈춤 3초")가 자기조절의 scaffold 역할. (Diamond, 2013)
// HA1 예기불안 8점(평균 3.5의 2.3배) → 불안 시 "빨리 끝내고 싶어서" 대충 찍기 회피반응.
// 3초 멈춤이 전두엽 개입 시간을 확보하여 충동적 반응을 억제.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface StopLookSpeakProps {
  onReady: () => void;
  type: 'session_start' | 'speed_warning';
}

export default function StopLookSpeak({ onReady, type }: StopLookSpeakProps) {
  const [countdown, setCountdown] = useState(3);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      if (type === 'speed_warning') {
        // 과속 경고는 3초 후 자동 닫힘
        onReady();
      } else {
        setReady(true);
      }
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, type, onReady]);

  const progress = ((3 - countdown) / 3) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center px-6 max-w-sm"
        >
          {/* 영단이 캐릭터 */}
          <motion.div
            className="text-7xl mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🤖
          </motion.div>

          {/* 메시지 */}
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {type === 'session_start' ? '잠깐! 준비됐어?' : '멈춤 3초! 천천히 생각해보자'}
          </h2>
          <p className="text-base text-slate-500 mb-8">
            {type === 'session_start'
              ? '마음을 가다듬고, 준비되면 출발하자!'
              : '서두르지 않아도 돼. 시간은 충분해!'}
          </p>

          {/* 원형 프로그레스 */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="#6366F1"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-indigo-600">
                {countdown > 0 ? countdown : ''}
              </span>
            </div>
          </div>

          {/* 버튼 */}
          {type === 'session_start' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={onReady}
                disabled={!ready}
                className="w-full h-14 text-xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-30"
                style={{ minHeight: 56 }}
              >
                {ready ? '출발! 🚀' : '잠깐만...'}
              </Button>
            </motion.div>
          )}

          {type === 'speed_warning' && countdown > 0 && (
            <p className="text-sm text-slate-400">
              {countdown}초 후 자동으로 돌아갈게요
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
