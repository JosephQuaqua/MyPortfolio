/*
# Create CMS portfolio schema with row level security

Plain-English summary: this migration creates every table the portfolio website reads its content from, plus the tables that store visitor submissions (hiring inquiries and contact messages) and a list of staff accounts allowed to manage content. Nothing about Joseph is stored in the application code; everything the public site shows comes from these tables.

## 1. New tables
- `admin_users`: staff accounts (role `admin` or `editor`) linked to Supabase Auth users.
- `profile`: single-row personal profile (name, title, headline, summary, location, availability, profile image, call-to-action labels and links).
- `site_settings`: single-row SEO and footer settings, plus the published CV URL.
- `social_links`: ordered list of social/contact links (GitHub, LinkedIn, Email, Phone, and future platforms).
- `experiences`: work, freelance, contribution and volunteer records.
- `projects`: portfolio projects with slug, descriptions, status, publication state, featured flag and display order.
- `project_technologies`: technologies used per project (child of `projects`).
- `project_images`: gallery images per project (child of `projects`).
- `skill_categories` and `skills`: skill groups and individual skills.
- `education`: academic and school records.
- `certifications`: certificates with credential details and a flag for URLs that need verification.
- `hiring_inquiries`: submissions from the Hire Me form, with status and internal admin notes.
- `contact_messages`: submissions from the contact form, with read/archived state and internal admin notes.

## 2. Security
- Row level security is enabled on every table.
- Public visitors (`anon`) can read only published content. Profile and site settings are readable by everyone because they are intentionally public.
- Public visitors can only INSERT hiring inquiries and contact messages, and only with the default `new` status and no admin notes. They cannot read submissions.
- Staff (members of `admin_users`) get full read/write access to content and submissions through the `public.is_staff()` helper.
- `is_staff()` is a SECURITY DEFINER function with a fixed search path. EXECUTE is revoked from PUBLIC and `anon`, and granted to `authenticated` only.
- Grants are limited to the verbs each role needs.

## 3. Important notes
1. Writes to content tables are restricted by RLS to staff; the anon key alone cannot modify content.
2. Internal notes (`admin_notes`) are never selectable by anonymous users.
3. Public insert limits: name, email and message length checks guard against oversized input.
4. Re-running this migration is safe: tables, indexes, policies and functions are created idempotently.
*/

-- Shared timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Staff accounts
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON admin_users TO authenticated;

DROP POLICY IF EXISTS "select_own_admin_row" ON admin_users;
CREATE POLICY "select_own_admin_row" ON admin_users FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Singleton profile
CREATE TABLE IF NOT EXISTS profile (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name text NOT NULL,
  professional_title text,
  headline text,
  summary text,
  location text,
  availability_status text,
  is_available boolean NOT NULL DEFAULT false,
  profile_image_url text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Singleton site settings (SEO, footer, CV)
CREATE TABLE IF NOT EXISTS site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image_url text,
  favicon_url text,
  canonical_url text,
  footer_text text,
  cv_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  label text NOT NULL,
  url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text,
  role text,
  description text,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  location text,
  experience_type text NOT NULL DEFAULT 'Professional Experience' CHECK (experience_type IN (
    'Professional Experience', 'Freelance', 'Project Contribution', 'Backend Development',
    'Full-Stack Development', 'Collaboration', 'Volunteer/Leadership')),
  technologies text[] NOT NULL DEFAULT '{}',
  achievements text[] NOT NULL DEFAULT '{}',
  live_url text,
  github_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL,
  subtitle text,
  short_description text,
  long_description text,
  category text,
  role text,
  year integer CHECK (year IS NULL OR (year BETWEEN 1990 AND 2100)),
  start_date date,
  completion_date date,
  project_status text NOT NULL DEFAULT 'in_progress' CHECK (project_status IN ('in_progress', 'completed', 'deployed')),
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  cover_image_url text,
  live_url text,
  github_url text,
  challenges text,
  solution text,
  technical_decisions text,
  key_features text[] NOT NULL DEFAULT '{}',
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_publication_order_idx ON projects (publication_status, display_order);

CREATE TABLE IF NOT EXISTS project_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, name)
);

CREATE INDEX IF NOT EXISTS project_technologies_project_idx ON project_technologies (project_id);

CREATE TABLE IF NOT EXISTS project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_images_project_idx ON project_images (project_id);

CREATE TABLE IF NOT EXISTS skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon_url text,
  proficiency_label text,
  learning_period text,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, name)
);

CREATE INDEX IF NOT EXISTS skills_category_idx ON skills (category_id);

CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  location text,
  degree text,
  field text,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  description text,
  relevant_areas text[] NOT NULL DEFAULT '{}',
  achievements text[] NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  issue_date date,
  credential_id text,
  credential_url text,
  credential_url_needs_verification boolean NOT NULL DEFAULT false,
  certificate_file_url text,
  description text,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hiring_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company text CHECK (company IS NULL OR char_length(company) <= 160),
  opportunity_type text NOT NULL CHECK (opportunity_type IN (
    'Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Internship', 'Collaboration', 'Other')),
  position_title text CHECK (position_title IS NULL OR char_length(position_title) <= 160),
  project_description text CHECK (project_description IS NULL OR char_length(project_description) <= 5000),
  budget_range text CHECK (budget_range IS NULL OR char_length(budget_range) <= 120),
  expected_start_date date,
  portfolio_url text CHECK (portfolio_url IS NULL OR char_length(portfolio_url) <= 500),
  additional_info text CHECK (additional_info IS NULL OR char_length(additional_info) <= 3000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interviewing', 'hired', 'archived')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hiring_inquiries_status_idx ON hiring_inquiries (status, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profile','site_settings','social_links','experiences','projects',
    'skill_categories','skills','education','certifications','hiring_inquiries','contact_messages']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

-- Row level security
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiring_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Grants: public read on content, staff write via RLS
GRANT SELECT ON profile, site_settings, social_links, experiences, projects, project_technologies,
  project_images, skill_categories, skills, education, certifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profile, site_settings, social_links, experiences, projects,
  project_technologies, project_images, skill_categories, skills, education, certifications TO authenticated;
GRANT INSERT ON hiring_inquiries, contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON hiring_inquiries, contact_messages TO authenticated;

-- Public read policies. profile and site_settings are intentionally public singletons.
DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_social_links" ON social_links;
CREATE POLICY "public_read_social_links" ON social_links FOR SELECT TO anon, authenticated USING (is_published);

DROP POLICY IF EXISTS "public_read_experiences" ON experiences;
CREATE POLICY "public_read_experiences" ON experiences FOR SELECT TO anon, authenticated USING (is_published);

DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (publication_status = 'published');

DROP POLICY IF EXISTS "public_read_project_technologies" ON project_technologies;
CREATE POLICY "public_read_project_technologies" ON project_technologies FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_technologies.project_id AND p.publication_status = 'published'));

DROP POLICY IF EXISTS "public_read_project_images" ON project_images;
CREATE POLICY "public_read_project_images" ON project_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_images.project_id AND p.publication_status = 'published'));

DROP POLICY IF EXISTS "public_read_skill_categories" ON skill_categories;
CREATE POLICY "public_read_skill_categories" ON skill_categories FOR SELECT TO anon, authenticated USING (is_published);

DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills" ON skills FOR SELECT TO anon, authenticated USING (is_published);

DROP POLICY IF EXISTS "public_read_education" ON education;
CREATE POLICY "public_read_education" ON education FOR SELECT TO anon, authenticated USING (is_published);

DROP POLICY IF EXISTS "public_read_certifications" ON certifications;
CREATE POLICY "public_read_certifications" ON certifications FOR SELECT TO anon, authenticated USING (is_published);

-- Public submission policies: visitors may only create new, unreviewed records
DROP POLICY IF EXISTS "public_insert_hiring_inquiries" ON hiring_inquiries;
CREATE POLICY "public_insert_hiring_inquiries" ON hiring_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND admin_notes IS NULL);

DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" ON contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (is_read = false AND is_archived = false AND admin_notes IS NULL);

-- Staff full access to content and submissions
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profile','site_settings','social_links','experiences','projects',
    'project_technologies','project_images','skill_categories','skills','education','certifications',
    'hiring_inquiries','contact_messages']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'staff_select_' || t, t);
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (public.is_staff())', 'staff_select_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'staff_insert_' || t, t);
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (public.is_staff())', 'staff_insert_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'staff_update_' || t, t);
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', 'staff_update_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'staff_delete_' || t, t);
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE TO authenticated USING (public.is_staff())', 'staff_delete_' || t, t);
  END LOOP;
END $$;
