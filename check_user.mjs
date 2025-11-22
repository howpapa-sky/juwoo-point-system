import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'yong@howlab.co.kr');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('User data:', JSON.stringify(data, null, 2));
  }
}

checkUser();
