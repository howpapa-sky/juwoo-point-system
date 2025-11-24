// src/lib/supabase.ts
// Supabase 클라이언트 설정
// 이미 프로젝트에 이 파일이 있다면 이 파일은 무시하세요

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL과 Anon Key가 설정되지 않았습니다. .env 파일을 확인하세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 타입 안전성을 위한 Database 타입 (선택사항)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          total_points: number;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'earn' | 'spend' | 'adjust';
          category: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['point_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['point_transactions']['Insert']>;
      };
      point_categories: {
        Row: {
          id: string;
          name: string;
          type: 'earn' | 'spend';
          color: string;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['point_categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['point_categories']['Insert']>;
      };
    };
  };
};
