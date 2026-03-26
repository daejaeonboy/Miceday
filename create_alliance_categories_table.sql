-- MICE 회원사 카테고리 관리 테이블 생성 및 기존 데이터 정리
-- 기존 alliance_members 데이터는 유지하고, category1 문자열은 계속 사용합니다.
-- 카테고리 관리는 alliance_categories 테이블로 옮기고,
-- 기존 'MICE 기획분과'는 'MICE 기획 · 운영분과'로 정규화합니다.
-- 기존 '기타' 데이터는 비활성 처리합니다.

BEGIN;

CREATE TABLE IF NOT EXISTS public.alliance_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.alliance_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on alliance_categories" ON public.alliance_categories;
DROP POLICY IF EXISTS "Allow public insert access on alliance_categories" ON public.alliance_categories;
DROP POLICY IF EXISTS "Allow public update access on alliance_categories" ON public.alliance_categories;
DROP POLICY IF EXISTS "Allow public delete access on alliance_categories" ON public.alliance_categories;

CREATE POLICY "Allow public read access on alliance_categories"
ON public.alliance_categories
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access on alliance_categories"
ON public.alliance_categories
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access on alliance_categories"
ON public.alliance_categories
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access on alliance_categories"
ON public.alliance_categories
FOR DELETE
USING (true);

INSERT INTO public.alliance_categories (name, display_order, is_active)
VALUES
    ('MICE 시설분과', 1, true),
    ('MICE 기획 · 운영분과', 2, true),
    ('MICE 지원분과', 3, true)
ON CONFLICT (name) DO UPDATE
SET
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

UPDATE public.alliance_members
SET category1 = 'MICE 기획 · 운영분과'
WHERE category1 = 'MICE 기획분과';

UPDATE public.alliance_members
SET is_active = false
WHERE category1 = '기타';

INSERT INTO public.alliance_categories (name, display_order, is_active)
SELECT normalized_name, 100 + ROW_NUMBER() OVER (ORDER BY normalized_name), true
FROM (
    SELECT DISTINCT TRIM(category1) AS normalized_name
    FROM public.alliance_members
    WHERE is_active = true
      AND TRIM(COALESCE(category1, '')) <> ''
      AND TRIM(category1) <> '기타'
) categories
WHERE normalized_name NOT IN ('MICE 시설분과', 'MICE 기획 · 운영분과', 'MICE 지원분과')
ON CONFLICT (name) DO NOTHING;

SELECT id, name, display_order, is_active
FROM public.alliance_categories
ORDER BY display_order ASC, name ASC;

SELECT category1, is_active, COUNT(*) AS member_count
FROM public.alliance_members
GROUP BY category1, is_active
ORDER BY category1 ASC, is_active DESC;

COMMIT;
