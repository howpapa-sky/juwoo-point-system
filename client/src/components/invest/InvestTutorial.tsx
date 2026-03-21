import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const TUTORIAL_KEY = "invest_tutorial_seen";

const SLIDES = [
  {
    emoji: "🌱",
    title: "여기는 씨앗 농장이야!",
    lines: [
      "에너지로 씨앗을 심을 수 있어요",
      "씨앗이 자라면 열매를 수확해요",
      "잘 자라면 심은 것보다 더 많이 돌아와요!",
    ],
  },
  {
    emoji: "🌻🌳🍀",
    title: "씨앗은 3종류!",
    lines: [
      "🌻 해바라기 — 항상 110% 확정! 안전해요",
      "🌳 나무 — 85~140%, 든든한 친구",
      "🍀 클로버 — 30~250%, 대박 모험!",
    ],
  },
  {
    emoji: "☀️🌧️💨",
    title: "날씨에 따라 달라져요",
    lines: [
      "맑은 날엔 씨앗이 잘 자라요",
      "비나 바람이 오면 적게 열릴 수도 있어요",
      "해바라기는 날씨 영향이 없어요!",
    ],
  },
  {
    emoji: "🏦",
    title: "금고에 모아두면 이자가 붙어!",
    lines: [
      "매주 일요일에 3% 이자를 받아요",
      "오래 두면 이자가 이자를 낳아요",
      "안전하게 모으고 싶을 때 딱!",
    ],
  },
];

interface InvestTutorialProps {
  onClose: () => void;
}

export default function InvestTutorial({ onClose }: InvestTutorialProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    onClose();
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-sm"
    >
      <div className="w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.p
              className="text-7xl mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {slide.emoji}
            </motion.p>

            <h2 className="text-2xl font-black text-slate-800 mb-4">
              {slide.title}
            </h2>

            <div className="space-y-2 mb-8">
              {slide.lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="text-base text-slate-600"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 프로그레스 도트 */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "bg-emerald-500 scale-125"
                  : i < currentSlide
                    ? "bg-emerald-300"
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          {!isLast && (
            <Button
              variant="ghost"
              className="flex-1 h-14 rounded-2xl text-slate-500 text-base"
              onClick={handleFinish}
            >
              건너뛰기
            </Button>
          )}
          <Button
            className={`flex-1 h-14 rounded-2xl font-bold text-lg text-white shadow-lg ${
              isLast
                ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/25"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/25"
            }`}
            onClick={handleNext}
          >
            {isLast ? "씨앗을 심어보자! 🌱" : "다음"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function shouldShowTutorial(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) !== "true";
}
