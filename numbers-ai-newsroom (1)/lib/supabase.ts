
import { createClient } from '@supabase/supabase-js';

const getSafeEnv = (key: string): string => {
  // Vite 전용 환경 변수 접근
  // @ts-ignore
  if (import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  
  // 일반 process.env 접근 (define 등에서 주입된 경우)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  return '';
};

// VITE_ 접두사가 붙은 변수명을 우선적으로 확인
const supabaseUrl = getSafeEnv('VITE_SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getSafeEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder-key';

export const isSupabaseConfigured = !supabaseUrl.includes('placeholder-project');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
