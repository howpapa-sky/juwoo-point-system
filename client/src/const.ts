export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "주우의 포인트 시스템";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/FFD700/1F2937?text=⭐";

// Redirect to Supabase login page instead of Manus OAuth
export const getLoginUrl = () => {
  return '/login';
};