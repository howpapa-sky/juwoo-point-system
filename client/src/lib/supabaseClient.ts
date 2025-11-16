import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqxuavqpevllzzgkpudp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjkyNzQsImV4cCI6MjA3ODc0NTI3NH0.HBxOjed8E0lS8QgJkBbwr7Z7Gt9PsPxEyGA0IvC1IYM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
