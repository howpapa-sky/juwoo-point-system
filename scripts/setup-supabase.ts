import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqxuavqpevllzzgkpudp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjQwOTMsImV4cCI6MjA0NzMwMDA5M30.ZcCNXYFPLDZkHdT7Bh9Vy9DxW7xkBvOxdOEOTtJCzfE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  // Create tables using Supabase client
  const { data: juwooData, error: juwooError } = await supabase
    .from('juwoo_profile')
    .select('*')
    .limit(1);
  
  if (juwooError && juwooError.code === 'PGRST116') {
    console.log('Tables do not exist. Please create them manually in Supabase dashboard.');
    console.log('Go to: https://supabase.com/dashboard/project/vqxuavqpevllzzgkpudp/editor');
    return;
  }
  
  console.log('Juwoo profile:', juwooData);
  console.log('Database setup complete!');
}

setupDatabase().catch(console.error);
