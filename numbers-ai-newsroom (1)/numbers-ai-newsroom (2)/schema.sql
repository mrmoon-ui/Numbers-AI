
-- 1. 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER',
  status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. 보안 정책 설정
-- 모든 인증된 사용자는 승인된 관리자의 프로필을 볼 수 있음
CREATE POLICY "승인된 사용자는 프로필 열람 가능" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "자신의 프로필 수정 가능" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 회원가입 시 자동 프로필 생성을 위한 트리거용 정책
CREATE POLICY "시스템 프로필 생성 허용" ON public.profiles
  FOR INSERT WITH CHECK (true);
