-- host-pocket · Row Level Security
-- 在 Supabase Dashboard → SQL Editor 貼上並執行
--
-- 背景：本專案的讀寫只透過 Node（DATABASE_URL / service connection），
-- 不經 PostgREST anon key。開啟 RLS 且不給 anon/authenticated policy，
-- 即可關閉「Table publicly accessible」警告，並避免專案 URL 被直接濫用。
--
-- 注意：不要加 FORCE ROW LEVEL SECURITY（會套用到 table owner，可能影響連線）。

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listing_settings ENABLE ROW LEVEL SECURITY;

-- 收回 PostgREST 角色對表的直接權限（雙重保險）
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_listings FROM anon, authenticated;
REVOKE ALL ON TABLE public.listing_settings FROM anon, authenticated;

-- service_role 仍可供後端／管理用途（JWT service_role 會 bypass RLS）
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.user_listings TO service_role;
GRANT ALL ON TABLE public.listing_settings TO service_role;
