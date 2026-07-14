-- host-pocket · user_listings
-- 會員與已連接房源的關聯（Google 登入後「連接房源」會寫入）

CREATE TABLE IF NOT EXISTS user_listings (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS user_listings_user_id_idx
  ON user_listings (user_id, updated_at DESC);
