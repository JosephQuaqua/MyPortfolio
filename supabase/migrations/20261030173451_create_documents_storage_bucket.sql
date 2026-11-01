/*
# Create documents storage bucket for the downloadable CV

Plain-English summary: adds a public file bucket named `documents` where the CV PDF is stored. Anyone visiting the site can download the file, but only staff members can upload, replace or remove it.

## 1. New storage bucket
- `documents`: public bucket, PDF files only, 10 MB maximum size.
- The CV is expected at the fixed file name `cv.pdf` inside this bucket.

## 2. Security
- Anonymous and signed-in visitors can read (list and download) objects in the `documents` bucket.
- Only staff (`public.is_staff()`) can insert, update or delete objects in the `documents` bucket.
- Policies are scoped to this bucket only; other storage buckets are unaffected.

## 3. Important notes
1. Re-running this migration is safe: the bucket upsert and policy drops are idempotent.
2. Uploading a new CV with the same name replaces the previous file.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_read_documents" ON storage.objects;
CREATE POLICY "public_read_documents" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "staff_insert_documents" ON storage.objects;
CREATE POLICY "staff_insert_documents" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'documents' AND public.is_staff());

DROP POLICY IF EXISTS "staff_update_documents" ON storage.objects;
CREATE POLICY "staff_update_documents" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'documents' AND public.is_staff());

DROP POLICY IF EXISTS "staff_delete_documents" ON storage.objects;
CREATE POLICY "staff_delete_documents" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'documents' AND public.is_staff());
