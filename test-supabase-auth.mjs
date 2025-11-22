import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqxuavqpevllzzgkpudp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjkyNzQsImV4cCI6MjA3ODc0NTI3NH0.HBxOjed8E0lS8QgJkBbwr7Z7Gt9PsPxEyGA0IvC1IYM';

console.log('🔍 Supabase 연결 테스트 시작...\n');
console.log('URL:', supabaseUrl);
console.log('ANON_KEY:', supabaseAnonKey.substring(0, 50) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testSignup() {
  console.log('📝 회원가입 테스트 중...');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test1234!@#$';
  
  console.log('테스트 이메일:', testEmail);
  console.log('테스트 비밀번호:', testPassword);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('\n❌ 회원가입 실패:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Full error:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('\n✅ 회원가입 성공!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session:', data.session ? '있음' : '없음');
    return true;
  } catch (err) {
    console.error('\n❌ 예외 발생:', err.message);
    console.error('Stack:', err.stack);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 기존 사용자 로그인 테스트 중...');
  
  const testEmail = 'yong@howlab.co.kr';
  const testPassword = 'test1234';
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('\n❌ 로그인 실패:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      return false;
    }
    
    console.log('\n✅ 로그인 성공!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    return true;
  } catch (err) {
    console.error('\n❌ 예외 발생:', err.message);
    return false;
  }
}

async function checkAuthSettings() {
  console.log('\n⚙️ Auth 설정 확인 중...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('현재 세션:', data.session ? '있음' : '없음');
    
    if (error) {
      console.error('세션 확인 오류:', error.message);
    }
  } catch (err) {
    console.error('세션 확인 예외:', err.message);
  }
}

async function runAllTests() {
  await checkAuthSettings();
  await testSignup();
  await testLogin();
  
  console.log('\n\n=== 테스트 완료 ===');
}

runAllTests();
