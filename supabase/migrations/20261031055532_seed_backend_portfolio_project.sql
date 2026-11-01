/*
# Seed the backend portfolio project

Plain-English summary: adds the CMS-Based Portfolio Platform project where Joseph's role was Backend Developer. It is inserted as a draft-safe, in-progress record and is skipped if a project with the same slug already exists.

## 1. Modified data
- `projects`: one new row (slug `cms-portfolio-platform-backend`), status `in_progress`, published.
- No schema changes and no changes to existing rows.

## 2. Important notes
1. The role is recorded as Backend Developer, not full-stack.
2. No live or GitHub URL is stored, so none is shown publicly.
3. Re-running this migration is safe because of the slug conflict guard.
*/

INSERT INTO projects (
  slug, title, short_description, long_description, role, project_status,
  publication_status, display_order, live_url, github_url
)
VALUES (
  'cms-portfolio-platform-backend',
  'CMS-Based Portfolio Platform',
  'Backend development for a CMS-based professional portfolio platform.',
  'Contributed backend development for a CMS-based professional portfolio platform. Backend work includes architecture, database design, authentication, APIs, content management, and frontend integration.',
  'Backend Developer',
  'in_progress',
  'published',
  6,
  NULL,
  NULL
)
ON CONFLICT (slug) DO NOTHING;
