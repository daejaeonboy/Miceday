-- Fix for Storage RLS Policies when using Firebase Auth
-- Since the frontend uses Firebase Auth, Supabase sees the requests as 'anon' (public).
-- We need to allow public inserts/updates to the 'humanpartner' bucket.

-- 1. Allow public uploads (INSERT)
DROP POLICY IF EXISTS "Humanpartner authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Humanpartner public upload" ON storage.objects;

CREATE POLICY "Humanpartner public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'humanpartner');

-- 2. Allow public updates (UPDATE)
DROP POLICY IF EXISTS "Humanpartner authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Humanpartner public update" ON storage.objects;

CREATE POLICY "Humanpartner public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'humanpartner')
WITH CHECK (bucket_id = 'humanpartner');

-- 3. Allow public deletes (DELETE)
DROP POLICY IF EXISTS "Humanpartner authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Humanpartner public delete" ON storage.objects;

CREATE POLICY "Humanpartner public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'humanpartner');
