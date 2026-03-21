import { motion, AnimatePresence } from "framer-motion";

interface FlyingCoinProps {
  show: boolean;
  direction: "to-seed" | "from-seed" | "to-vault" | "from-vault" | "interest";
  onComplete?: () => void;
}

export function FlyingCoin({ show, direction, onComplete }: FlyingCoinProps) {
  const configs = {
    "to-seed": { x: 150, y: -80, emoji: "⚡" },
    "from-seed": { x: -150, y: 80, emoji: "⚡" },
    "to-vault": { x: 100, y: -60, emoji: "⚡" },
    "from-vault": { x: -100, y: 60, emoji: "⚡" },
    interest: { x: 0, y: -30, emoji: "✨" },
  };

  const config = configs[direction];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{ left: "50%", top: "50%" }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: config.x,
            y: config.y,
            scale: direction === "interest" ? 1.5 : 0.3,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onAnimationComplete={onComplete}
        >
          <span className="text-3xl">{config.emoji}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function CountUp({ from, to, duration = 0.8, className = "", suffix = "" }: CountUpProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {to.toLocaleString()}{suffix}
      </motion.span>
    </motion.span>
  );
}

interface ShimmerEffectProps {
  show: boolean;
  children: React.ReactNode;
}

export function ShimmerEffect({ show, children }: ShimmerEffectProps) {
  if (!show) return <>{children}</>;
  return (
    <motion.div
      className="relative overflow-hidden"
      animate={{
        boxShadow: [
          "0 0 0px rgba(16, 185, 129, 0)",
          "0 0 20px rgba(16, 185, 129, 0.3)",
          "0 0 0px rgba(16, 185, 129, 0)",
        ],
      }}
      transition={{ duration: 2, repeat: 3 }}
    >
      {children}
    </motion.div>
  );
}

interface MultiCoinBurstProps {
  show: boolean;
  count?: number;
}

export function MultiCoinBurst({ show, count = 5 }: MultiCoinBurstProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${40 + Math.random() * 20}%`,
            top: "50%",
          }}
          initial={{ opacity: 1, scale: 1, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0.5,
            y: -100 - Math.random() * 100,
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            delay: i * 0.08,
            ease: "easeOut",
          }}
        >
          <span className="text-2xl">⚡</span>
        </motion.div>
      ))}
    </div>
  );
}
