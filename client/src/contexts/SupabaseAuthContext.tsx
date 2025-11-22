import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface SupabaseAuthContextType {
  user: User | null;
  userRole: 'admin' | 'user' | null;
  loading: boolean;
  error: AuthError | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    console.log('[Auth] Initializing Supabase Auth...');
    
    // 즉시 onAuthStateChange 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session ? 'session exists' : 'no session');
      console.log('[Auth] User:', session?.user?.email || 'none');
      
      if (session?.user) {
        console.log('[Auth] Setting user:', session.user.email);
        setUser(session.user);
        
        // 사용자 역할 설정 (기본값: user)
        // TODO: Supabase Auth의 user_metadata 또는 별도 테이블에서 역할 조회
        setUserRole('user');
        console.log('[Auth] User role set to default: user');
      } else {
        console.log('[Auth] No session, clearing user');
        setUser(null);
        setUserRole(null);
      }
      
      console.log('[Auth] Setting loading to false');
      setLoading(false);
    });

    // 초기 세션 확인 (비동기, 타임아웃 없음)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[Auth] Initial session check:', session ? 'found' : 'none');
      
      if (error) {
        console.error('[Auth] getSession error:', error);
        setError(error);
      }
      
      // onAuthStateChange가 이미 처리하므로 여기서는 loading만 false로 설정
      if (!session) {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[Auth] getSession failed:', err);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
    
    setUser(null);
    setUserRole(null);
    setLoading(false);
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
