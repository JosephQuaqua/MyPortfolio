UPDATE storage.buckets SET public = false WHERE id = 'documents';

DROP POLICY IF EXISTS public_read_documents ON storage.objects;
DROP POLICY IF EXISTS staff_delete_documents ON storage.objects;

CREATE POLICY public_read_published_cv ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'documents'
    AND name = 'cv.pdf'
    AND EXISTS (SELECT 1 FROM public.site_settings WHERE cv_is_published)
  );

CREATE POLICY staff_select_documents ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff());

CREATE POLICY admin_delete_documents ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND public.is_admin());
