import { createClient } from '@supabase/supabase-js';

// Use server-side environment variables (without VITE_ prefix)
// Fallback to VITE_ prefix for local development
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  const error = `Supabase credentials missing! URL: ${supabaseUrl ? 'OK' : 'MISSING'}, Key: ${supabaseServiceKey ? 'OK' : 'MISSING'}`;
  console.error(error);
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
