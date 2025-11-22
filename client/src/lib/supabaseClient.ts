import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqxuavqpevllzzgkpudp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjkyNzQsImV4cCI6MjA3ODc0NTI3NH0.HBxOjed8E0lS8QgJkBbwr7Z7Gt9PsPxEyGA0IvC1IYM';

// 디버깅: 환경 변수 확인
console.log('[Supabase Client] Initializing with:');
console.log('URL:', supabaseUrl);
console.log('ANON_KEY (first 50 chars):', supabaseAnonKey.substring(0, 50) + '...');
console.log('Origin:', window.location.origin);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Netlify 배포 환경을 위한 추가 설정
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'juwoo-point-system',
    },
  },
});

// 디버깅: Auth 상태 변화 로깅
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase Auth] Event:', event);
  console.log('[Supabase Auth] Session:', session ? 'exists' : 'null');
  if (event === 'SIGNED_IN') {
    console.log('[Supabase Auth] User signed in:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('[Supabase Auth] User signed out');
  } else if (event === 'USER_UPDATED') {
    console.log('[Supabase Auth] User updated');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('[Supabase Auth] Token refreshed');
  }
});
