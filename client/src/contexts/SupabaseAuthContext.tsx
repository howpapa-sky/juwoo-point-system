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
        
        // users 테이블에서 역할 조회
        const fetchUserRole = async () => {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .single();
            
            if (error) {
              console.error('[Auth] Error fetching user role:', error);
              setUserRole('user');
            } else {
              const role = data?.role || 'user';
              console.log('[Auth] User role fetched:', role);
              setUserRole(role as 'admin' | 'user');
            }
          } catch (err) {
            console.error('[Auth] Failed to fetch user role:', err);
            setUserRole('user');
          }
        };
        
        fetchUserRole();
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
