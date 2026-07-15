-- host-pocket · user_listings
-- 會員與已連接房源的關聯（Google 登入後寫入）
-- source: 'link' = 連接房源（空白自動新增）, 'quick' = 快速開始（preset JSON）

CREATE TABLE IF NOT EXISTS user_listings (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL,
  title TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

ALTER TABLE user_listings
  ADD COLUMN IF NOT EXISTS source TEXT;

CREATE INDEX IF NOT EXISTS user_listings_user_id_idx
  ON user_listings (user_id, updated_at DESC);

-- 關閉 PostgREST 公開存取（後端用 DATABASE_URL，不受影響）
ALTER TABLE user_listings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE user_listings FROM anon, authenticated;
GRANT ALL ON TABLE user_listings TO service_role;
