ALTER TABLE public.installation_cases
ADD COLUMN IF NOT EXISTS content TEXT;
