-- Create a public bucket used by front-end image uploads.
insert into storage.buckets (id, name, public)
values ('humanpartner', 'humanpartner', true)
on conflict (id) do nothing;

-- Allow anyone to read uploaded files in this bucket.
drop policy if exists "Humanpartner public read" on storage.objects;
create policy "Humanpartner public read"
on storage.objects
for select
to public
using (bucket_id = 'humanpartner');

-- Allow signed-in users to upload/update/delete files in this bucket.
drop policy if exists "Humanpartner authenticated upload" on storage.objects;
create policy "Humanpartner authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'humanpartner');

drop policy if exists "Humanpartner authenticated update" on storage.objects;
create policy "Humanpartner authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'humanpartner')
with check (bucket_id = 'humanpartner');

drop policy if exists "Humanpartner authenticated delete" on storage.objects;
create policy "Humanpartner authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'humanpartner');
