-- host-pocket · vip_emails
-- 在 Supabase Dashboard → SQL Editor 貼上並執行此檔內容
-- 用途：全權白名單（免 NT$40 訂閱）。後端用 DATABASE_URL 讀寫。

CREATE TABLE IF NOT EXISTS vip_emails (
  email TEXT PRIMARY KEY,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vip_emails_created_at_idx ON vip_emails (created_at DESC);

-- 關閉 PostgREST 公開存取（後端用 DATABASE_URL，不受影響）
ALTER TABLE vip_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE vip_emails FROM anon, authenticated;
GRANT ALL ON TABLE vip_emails TO service_role;

-- 可選：手動新增／移除
-- INSERT INTO vip_emails (email, note) VALUES ('friend@gmail.com', '好友')
--   ON CONFLICT (email) DO UPDATE SET note = EXCLUDED.note, updated_at = NOW();
-- DELETE FROM vip_emails WHERE email = 'friend@gmail.com';
