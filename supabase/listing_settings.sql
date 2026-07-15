-- host-pocket · listing_settings
-- 在 Supabase Dashboard → SQL Editor 貼上並執行此檔內容
-- 用途：儲存每個 Listing 的房東設定（含在地精選 1–4，存在 data JSONB）

CREATE TABLE IF NOT EXISTS listing_settings (
  listing_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 可選：加速 JSONB 查詢
CREATE INDEX IF NOT EXISTS listing_settings_data_gin
  ON listing_settings USING GIN (data);

-- 關閉 PostgREST 公開存取（後端用 DATABASE_URL，不受影響）
ALTER TABLE listing_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE listing_settings FROM anon, authenticated;
GRANT ALL ON TABLE listing_settings TO service_role;
