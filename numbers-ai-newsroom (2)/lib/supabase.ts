
import { createClient } from '@supabase/supabase-js';

// Fix: Access environment variables via process.env instead of import.meta.env to resolve TypeScript errors.
// These are defined for the client in vite.config.ts via the 'define' property.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// 설정 여부 확인 (콘솔 로그는 보안상 배포 시 제외하거나 주의)
export const isSupabaseConfigured = !!(supabaseUrl && !supabaseUrl.includes('placeholder'));

if (!isSupabaseConfigured) {
  console.warn("Supabase 환경 변수가 설정되지 않았습니다. .env 파일이나 Vercel 설정을 확인하세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
