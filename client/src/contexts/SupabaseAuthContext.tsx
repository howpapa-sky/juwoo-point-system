import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing Supabase Auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] getSession error:', error);
          setLoading(false);
          return;
        }
        
        console.log('[Auth] Session:', session ? 'exists' : 'none');
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role from users table
        if (session?.user?.id) {
          console.log('[Auth] Fetching user role for:', session.user.id);
          const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('open_id', session.user.id)
            .single();
          
          if (roleError) {
            console.error('[Auth] Role fetch error:', roleError);
          }
          
          setUserRole(userData?.role || 'user');
          console.log('[Auth] User role:', userData?.role || 'user');
        }
        
        setLoading(false);
        console.log('[Auth] Initialization complete');
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        setLoading(false);
      }
    };
    
    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('[Auth] Initialization timeout - forcing loading to false');
      setLoading(false);
    }, 5000);
    
    initAuth().finally(() => clearTimeout(timeout));

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role from users table
      if (session?.user?.id) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('open_id', session.user.id)
          .single();
        setUserRole(userData?.role || 'user');
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
