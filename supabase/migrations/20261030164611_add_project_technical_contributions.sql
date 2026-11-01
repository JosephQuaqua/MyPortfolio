/*
# Add technical contributions to projects

Plain-English summary: adds a list field to projects so the Technical Implementation section of each project page can show the specific engineering work done, separate from the product features list.

## 1. Modified tables
- `projects`: new column `technical_contributions` (text list, defaults to an empty list). Existing rows are unaffected.

## 2. Security
- No policy or grant changes. The column inherits the existing projects policies.

## 3. Important notes
1. Adding a column with a default is non-destructive and safe to re-run (IF NOT EXISTS).
*/

ALTER TABLE projects ADD COLUMN IF NOT EXISTS technical_contributions text[] NOT NULL DEFAULT '{}';
