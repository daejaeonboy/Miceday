BEGIN;

-- Safety check: review current category distribution before/after running the update.
SELECT category1, COUNT(*) AS member_count
FROM public.alliance_members
GROUP BY category1
ORDER BY category1;

UPDATE public.alliance_members
SET category1 = 'MICE 지원분과'
WHERE category1 = '기타';

SELECT category1, COUNT(*) AS member_count
FROM public.alliance_members
GROUP BY category1
ORDER BY category1;

COMMIT;
