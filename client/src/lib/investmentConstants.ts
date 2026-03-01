// ============================================
// 투자 시스템 공유 상수
// ============================================

// 저축 이자율 (주간)
export const SAVINGS_INTEREST_RATE = 0.03;

// 씨앗별 성장 기간 (일)
export const GROWTH_DAYS: Record<string, number> = {
  sunflower: 3,
  tree: 7,
  clover: 14,
  rose: 7,
  bamboo: 5,
  rainbow: 10,
};

// 씨앗별 성장 기간 라벨
export const GROWTH_LABELS: Record<string, string> = {
  sunflower: "3일 후 결과",
  tree: "1주 후 결과",
  clover: "2주 후 결과",
  rose: "1주 후 결과",
  bamboo: "5일 후 결과",
  rainbow: "10일 후 결과",
};

// 씨앗별 최소 보장 배수
export const MIN_GUARANTEE: Record<string, number> = {
  sunflower: 1.1,
  tree: 0.85,
  clover: 0.3,
  rose: 1.0,
  bamboo: 1.05,
  rainbow: 0.5,
};

// 씨앗별 최대 배수
export const MAX_MULTIPLIER: Record<string, number> = {
  sunflower: 1.1,
  tree: 1.4,
  clover: 2.5,
  rose: 1.8,
  bamboo: 1.25,
  rainbow: 3.0,
};

// 날씨 시스템
export type WeatherType = "sunny" | "cloudy" | "rainy" | "windy";

export interface Weather {
  type: WeatherType;
  icon: string;
  name: string;
  description: string;
  seedBonus: Record<string, number>;
}

export const WEATHERS: Weather[] = [
  {
    type: "sunny",
    icon: "☀️",
    name: "맑음",
    description: "햇빛이 좋아요! 씨앗이 기뻐해요",
    seedBonus: { sunflower: 0, tree: 0.02, clover: 0.05 },
  },
  {
    type: "sunny",
    icon: "☀️",
    name: "맑음",
    description: "화창한 날이에요!",
    seedBonus: { sunflower: 0, tree: 0.01, clover: 0.03 },
  },
  {
    type: "cloudy",
    icon: "⛅",
    name: "흐림",
    description: "평범한 하루예요",
    seedBonus: { sunflower: 0, tree: 0, clover: 0 },
  },
  {
    type: "rainy",
    icon: "🌧️",
    name: "비",
    description: "비가 와서 나무가 좋아해요!",
    seedBonus: { sunflower: 0, tree: 0.05, clover: -0.03 },
  },
  {
    type: "windy",
    icon: "💨",
    name: "바람",
    description: "바람에 클로버가 춤을 춰요!",
    seedBonus: { sunflower: 0, tree: -0.02, clover: 0.05 },
  },
];

export function getTodayWeather(): Weather {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % WEATHERS.length;
  return WEATHERS[index];
}

export function getWeatherBonus(seedType: string): number {
  const weather = getTodayWeather();
  return weather.seedBonus[seedType] || 0;
}
