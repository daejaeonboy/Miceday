console.log(`
================================================================================
ACTION REQUIRED: Create public.inquiries table in Supabase
================================================================================
The quote-request page currently depends on public.inquiries.

Run the SQL below in the Supabase SQL Editor:

-- 1:1 / quote inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    company_name TEXT,
    category TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_read" ON public.inquiries;
CREATE POLICY "inquiries_read" ON public.inquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "inquiries_insert" ON public.inquiries;
CREATE POLICY "inquiries_insert" ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_update" ON public.inquiries;
CREATE POLICY "inquiries_update" ON public.inquiries FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_delete" ON public.inquiries;
CREATE POLICY "inquiries_delete" ON public.inquiries FOR DELETE USING (true);

================================================================================
`);
