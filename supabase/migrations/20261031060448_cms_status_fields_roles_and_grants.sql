/*
# CMS status fields, admin role checks, and tighter grants

Plain-English summary:
- Contact messages get a single status (unread, read, archived) that drives the old flags, so the admin never has to keep two fields in sync.
- Hiring inquiries get a phone number.
- Profile gets contact email and phone fields so the public contact details come from the CMS.
- Certifications get an image/logo URL.
- Site settings get a CV publish switch.
- Admin role (`admin` vs `editor`) is enforced in the database: only admins can delete content; editors can create and edit.
- Anonymous visitors lose all write grants except the two public submission forms (contact messages and hiring inquiries).
- The LinkedIn URL is set to the exact value supplied.

## 1. New columns
- contact_messages.status (unread | read | archived), default unread.
- hiring_inquiries.phone (optional, max 40 characters).
- profile.contact_email, profile.contact_phone (optional).
- certifications.image_url (optional).
- site_settings.cv_is_published (default true).

## 2. Functions
- public.is_admin(): true when the signed-in user has the admin role. Execute is granted to signed-in users only.
- public.sync_contact_message_flags(): keeps is_read and is_archived derived from status.

## 3. Policies
- Delete policies on all CMS tables now require is_admin().

## 4. Grants
- anon loses UPDATE and DELETE everywhere and all write grants except INSERT on contact_messages and hiring_inquiries.
- anon loses SELECT on contact_messages, hiring_inquiries and admin_users.

## Notes
- Existing data is preserved; no columns are dropped or changed type.
*/

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unread';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_status_check') THEN
    ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('unread', 'read', 'archived'));
  END IF;
END $$;
UPDATE contact_messages SET status = CASE WHEN is_archived THEN 'archived' WHEN is_read THEN 'read' ELSE 'unread' END;

ALTER TABLE hiring_inquiries ADD COLUMN IF NOT EXISTS phone text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hiring_inquiries_phone_check') THEN
    ALTER TABLE hiring_inquiries ADD CONSTRAINT hiring_inquiries_phone_check CHECK (phone IS NULL OR char_length(phone) <= 40);
  END IF;
END $$;

ALTER TABLE profile ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS contact_phone text;
UPDATE profile SET contact_email = 'josephquaqua2004@gmail.com', contact_phone = '+91 99601 93828' WHERE id = 1 AND contact_email IS NULL;

ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS cv_is_published boolean NOT NULL DEFAULT true;

UPDATE social_links SET url = 'https://www.linkedin.com/in/joseph-y-m-quaqua-163487200/' WHERE platform = 'linkedin';

CREATE OR REPLACE FUNCTION public.sync_contact_message_flags()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.is_read := NEW.status <> 'unread';
  NEW.is_archived := NEW.status = 'archived';
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_messages_sync_flags ON contact_messages;
CREATE TRIGGER contact_messages_sync_flags
BEFORE INSERT OR UPDATE ON contact_messages
FOR EACH ROW EXECUTE FUNCTION public.sync_contact_message_flags();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS public_insert_contact_messages ON contact_messages;
CREATE POLICY public_insert_contact_messages ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'unread' AND is_read = false AND is_archived = false AND admin_notes IS NULL);

DROP POLICY IF EXISTS public_insert_hiring_inquiries ON hiring_inquiries;
CREATE POLICY public_insert_hiring_inquiries ON hiring_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'new' AND admin_notes IS NULL);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['certifications','contact_messages','education','experiences','hiring_inquiries','profile','project_images','project_technologies','projects','site_settings','skill_categories','skills','social_links']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'staff_delete_' || t, t);
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE TO authenticated USING (public.is_admin())', 'staff_delete_' || t, t);
  END LOOP;
END $$;

REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE SELECT ON contact_messages, hiring_inquiries, admin_users FROM anon;
GRANT INSERT ON contact_messages, hiring_inquiries TO anon;
