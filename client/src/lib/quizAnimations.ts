// ============================================
// 퀴즈 애니메이션 variants (Framer Motion)
// ============================================

export const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } },
};

export const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
};

export const correctVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.5 },
  },
};

export const wrongVariants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

export const streakVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1, rotate: 0,
    transition: { type: 'spring' as const, stiffness: 500, damping: 15 },
  },
};

export const bannerSlideUp = {
  hidden: { y: 200, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: { y: 200, opacity: 0, transition: { duration: 0.2 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
};

export const xpFloat = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: {
    opacity: [1, 1, 0],
    y: -60,
    scale: [1, 1.3, 1],
    transition: { duration: 1.5 },
  },
};
