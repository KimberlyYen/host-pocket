-- host-pocket · users
-- 在 Supabase Dashboard → SQL Editor 貼上並執行此檔內容
-- 用途：Google 登入會員（google_sub 唯一）

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- 關閉 PostgREST 公開存取（後端用 DATABASE_URL，不受影響）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE users FROM anon, authenticated;
GRANT ALL ON TABLE users TO service_role;
