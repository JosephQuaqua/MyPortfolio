/*
# Admin activity log and media storage

Plain-English summary:
- Every staff change to CMS content (projects, experience, skills, education, certifications, site content, social links, contact messages, hiring inquiries, consultations, availability) is recorded automatically in an activity log with who did it, what changed, and when.
- Storage changes made from the admin (CV upload/replace/delete, media upload/delete) are recorded through a secure function that only staff can call.
- A new public media bucket holds images for project covers, profile photos, and certifications. Anyone can view images; only staff can upload, and only admins can delete.

## 1. New table
- admin_activity_log: id, actor_id, actor_email, action, entity, entity_id, metadata, created_at. Visible to staff only; no one can edit or delete log rows.

## 2. Functions
- log_admin_change(): trigger that writes a log row for staff changes only (visitors' submissions are not logged as admin activity).
- log_admin_activity(action, entity, entity_id, metadata): lets staff record storage actions. Staff only.

## 3. Storage
- New bucket media (public read, 10 MB limit, images only).
- Staff can upload and update media; only admins can delete.

## 4. Security
- RLS enabled. Visitors have no access to the log.
- All functions are restricted to the signed-in roles that need them.
*/

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL CHECK (char_length(action) BETWEEN 1 AND 120),
  entity text NOT NULL CHECK (char_length(entity) BETWEEN 1 AND 80),
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_activity_log_created_idx ON admin_activity_log (created_at DESC);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admin_activity_log FROM anon, authenticated;
GRANT SELECT ON admin_activity_log TO authenticated;

DROP POLICY IF EXISTS staff_select_admin_activity_log ON admin_activity_log;
CREATE POLICY staff_select_admin_activity_log ON admin_activity_log FOR SELECT TO authenticated USING (public.is_staff());

CREATE OR REPLACE FUNCTION public.log_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row jsonb;
  v_old jsonb;
  v_label text;
  v_metadata jsonb;
  v_email text;
BEGIN
  IF NOT public.is_staff() THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_row := to_jsonb(OLD);
  ELSE
    v_row := to_jsonb(NEW);
  END IF;
  v_old := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;

  v_label := coalesce(
    v_row->>'title', v_row->>'name', v_row->>'institution', v_row->>'platform',
    v_row->>'subject', v_row->>'client_name', v_row->>'full_name', v_row->>'site_title', TG_TABLE_NAME
  );
  v_metadata := jsonb_build_object('label', v_label);

  IF TG_OP = 'UPDATE' THEN
    IF v_old->>'publication_status' IS DISTINCT FROM v_row->>'publication_status' THEN
      v_metadata := v_metadata || jsonb_build_object('from', v_old->>'publication_status', 'to', v_row->>'publication_status');
    ELSIF v_old->>'status' IS DISTINCT FROM v_row->>'status' THEN
      v_metadata := v_metadata || jsonb_build_object('from', v_old->>'status', 'to', v_row->>'status');
    END IF;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  INSERT INTO admin_activity_log (actor_id, actor_email, action, entity, entity_id, metadata)
  VALUES (
    auth.uid(),
    v_email,
    TG_TABLE_NAME || '.' || lower(TG_OP),
    TG_TABLE_NAME,
    coalesce(v_row->>'id', v_old->>'id'),
    v_metadata
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_admin_change() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','experiences','skills','skill_categories','education','certifications','site_settings','profile','social_links','contact_messages','hiring_inquiries','consultations','consultation_types','availability_rules','availability_blocks']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', t || '_activity_log', t);
    EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION public.log_admin_change()', t || '_activity_log', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.log_admin_activity(p_action text, p_entity text, p_entity_id text, p_metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Only staff can record admin activity.' USING ERRCODE = '42501';
  END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO admin_activity_log (actor_id, actor_email, action, entity, entity_id, metadata)
  VALUES (auth.uid(), v_email, left(p_action, 120), left(p_entity, 80), left(p_entity_id, 120), coalesce(p_metadata, '{}'::jsonb));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_admin_activity(text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_admin_activity(text, text, text, jsonb) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

DROP POLICY IF EXISTS public_read_media ON storage.objects;
CREATE POLICY public_read_media ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
DROP POLICY IF EXISTS staff_insert_media ON storage.objects;
CREATE POLICY staff_insert_media ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff());
DROP POLICY IF EXISTS staff_update_media ON storage.objects;
CREATE POLICY staff_update_media ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff()) WITH CHECK (bucket_id = 'media' AND public.is_staff());
DROP POLICY IF EXISTS admin_delete_media ON storage.objects;
CREATE POLICY admin_delete_media ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS staff_delete_documents ON storage.objects;
CREATE POLICY staff_delete_documents ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND public.is_staff());
