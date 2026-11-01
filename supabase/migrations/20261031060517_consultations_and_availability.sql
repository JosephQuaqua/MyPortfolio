/*
# Consultation types, availability, bookings, and public booking functions

Plain-English summary:
- Consultation types are managed in the CMS (name, description, duration, price, active flag). Five initial types are seeded with their names only. Duration defaults to 60 minutes and price is left empty until you set it.
- Weekly availability rules define when consultations can happen (day, start, end, timezone, active flag).
- Blocked periods let you close specific dates or time ranges.
- Bookings (consultations) store the client and status (pending, confirmed, completed, cancelled, no_show).
- Public visitors never read bookings or blocks directly. They use two database functions: one lists open slots and one creates a pending booking.
- The database itself refuses overlapping pending or confirmed bookings, so two people cannot take the same slot even at the same moment.

## 1. New tables
- consultation_types, availability_rules, availability_blocks, consultations.

## 2. Security
- RLS enabled on all four tables.
- Public (anon and signed-in) can read active consultation types and active availability rules.
- Staff can read and manage everything; only admins can delete.
- Bookings and blocks are not readable by public visitors.
- Two functions are granted to public visitors: get_consultation_slots and create_consultation_booking. Both validate their input.

## 3. Notes
- No personal or booking data is seeded.
*/

CREATE TABLE IF NOT EXISTS consultation_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR char_length(description) <= 1000),
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 480),
  price_amount numeric(10,2) CHECK (price_amount IS NULL OR price_amount >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (char_length(currency) = 3),
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata' CHECK (char_length(timezone) BETWEEN 1 AND 64),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_rules_time_order CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text CHECK (reason IS NULL OR char_length(reason) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_blocks_time_order CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_type_id uuid REFERENCES consultation_types(id) ON DELETE SET NULL,
  client_name text NOT NULL CHECK (char_length(client_name) BETWEEN 1 AND 120),
  client_email text NOT NULL CHECK (char_length(client_email) BETWEEN 3 AND 254 AND client_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  client_notes text CHECK (client_notes IS NULL OR char_length(client_notes) <= 2000),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  admin_notes text CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 5000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consultations_time_order CHECK (ends_at > starts_at)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultations_no_overlap') THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_no_overlap
      EXCLUDE USING gist (tstzrange(starts_at, ends_at, '[)') WITH &&)
      WHERE (status IN ('pending', 'confirmed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS consultations_starts_at_idx ON consultations (starts_at);
CREATE INDEX IF NOT EXISTS availability_blocks_range_idx ON availability_blocks (starts_at, ends_at);

ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON consultation_types, availability_rules, availability_blocks, consultations FROM anon, authenticated;
GRANT SELECT ON consultation_types, availability_rules TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON consultation_types, availability_rules, availability_blocks, consultations TO authenticated;

DROP POLICY IF EXISTS public_read_consultation_types ON consultation_types;
CREATE POLICY public_read_consultation_types ON consultation_types FOR SELECT TO anon, authenticated USING (is_active);
DROP POLICY IF EXISTS staff_select_consultation_types ON consultation_types;
CREATE POLICY staff_select_consultation_types ON consultation_types FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS staff_insert_consultation_types ON consultation_types;
CREATE POLICY staff_insert_consultation_types ON consultation_types FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_update_consultation_types ON consultation_types;
CREATE POLICY staff_update_consultation_types ON consultation_types FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_delete_consultation_types ON consultation_types;
CREATE POLICY staff_delete_consultation_types ON consultation_types FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS public_read_availability_rules ON availability_rules;
CREATE POLICY public_read_availability_rules ON availability_rules FOR SELECT TO anon, authenticated USING (is_active);
DROP POLICY IF EXISTS staff_select_availability_rules ON availability_rules;
CREATE POLICY staff_select_availability_rules ON availability_rules FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS staff_insert_availability_rules ON availability_rules;
CREATE POLICY staff_insert_availability_rules ON availability_rules FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_update_availability_rules ON availability_rules;
CREATE POLICY staff_update_availability_rules ON availability_rules FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_delete_availability_rules ON availability_rules;
CREATE POLICY staff_delete_availability_rules ON availability_rules FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS staff_select_availability_blocks ON availability_blocks;
CREATE POLICY staff_select_availability_blocks ON availability_blocks FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS staff_insert_availability_blocks ON availability_blocks;
CREATE POLICY staff_insert_availability_blocks ON availability_blocks FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_update_availability_blocks ON availability_blocks;
CREATE POLICY staff_update_availability_blocks ON availability_blocks FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_delete_availability_blocks ON availability_blocks;
CREATE POLICY staff_delete_availability_blocks ON availability_blocks FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS staff_select_consultations ON consultations;
CREATE POLICY staff_select_consultations ON consultations FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS staff_insert_consultations ON consultations;
CREATE POLICY staff_insert_consultations ON consultations FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_update_consultations ON consultations;
CREATE POLICY staff_update_consultations ON consultations FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_delete_consultations ON consultations;
CREATE POLICY staff_delete_consultations ON consultations FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO consultation_types (name, display_order)
SELECT v.name, v.ord FROM (VALUES
  ('Technical Consultation', 1),
  ('Project Planning', 2),
  ('Backend / Database Review', 3),
  ('Architecture Review', 4),
  ('Development Collaboration', 5)
) AS v(name, ord)
WHERE NOT EXISTS (SELECT 1 FROM consultation_types c WHERE c.name = v.name);

CREATE OR REPLACE FUNCTION public.get_consultation_slots(p_type_id uuid, p_date date)
RETURNS TABLE (starts_at timestamptz, ends_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH t AS (
    SELECT duration_minutes FROM consultation_types WHERE id = p_type_id AND is_active
  ),
  candidates AS (
    SELECT DISTINCT
      gs AS slot_start,
      gs + make_interval(mins => t.duration_minutes) AS slot_end
    FROM availability_rules r
    CROSS JOIN t
    CROSS JOIN LATERAL generate_series(
      (p_date + r.start_time) AT TIME ZONE r.timezone,
      (p_date + r.end_time) AT TIME ZONE r.timezone - make_interval(mins => t.duration_minutes),
      make_interval(mins => t.duration_minutes)
    ) AS gs
    WHERE r.is_active
      AND r.day_of_week = extract(dow FROM p_date)::int
      AND p_date BETWEEN (now() AT TIME ZONE 'UTC')::date - 1 AND (now() AT TIME ZONE 'UTC')::date + 365
  )
  SELECT c.slot_start, c.slot_end
  FROM candidates c
  WHERE c.slot_start > now()
    AND NOT EXISTS (
      SELECT 1 FROM availability_blocks b
      WHERE tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(c.slot_start, c.slot_end, '[)')
    )
    AND NOT EXISTS (
      SELECT 1 FROM consultations k
      WHERE k.status IN ('pending', 'confirmed')
        AND tstzrange(k.starts_at, k.ends_at, '[)') && tstzrange(c.slot_start, c.slot_end, '[)')
    )
  ORDER BY c.slot_start;
$$;

CREATE OR REPLACE FUNCTION public.create_consultation_booking(
  p_type_id uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_email text,
  p_client_notes text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duration integer;
  v_ends_at timestamptz;
  v_id uuid;
  v_name text := btrim(coalesce(p_client_name, ''));
  v_email text := btrim(coalesce(p_client_email, ''));
  v_notes text := nullif(btrim(coalesce(p_client_notes, '')), '');
BEGIN
  IF char_length(v_name) < 1 OR char_length(v_name) > 120 THEN
    RAISE EXCEPTION 'Please enter your name.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_email) < 3 OR char_length(v_email) > 254 OR v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address.' USING ERRCODE = '22023';
  END IF;
  IF v_notes IS NOT NULL AND char_length(v_notes) > 2000 THEN
    RAISE EXCEPTION 'Your notes are too long. Please keep them under 2000 characters.' USING ERRCODE = '22023';
  END IF;

  SELECT duration_minutes INTO v_duration FROM consultation_types WHERE id = p_type_id AND is_active;
  IF v_duration IS NULL THEN
    RAISE EXCEPTION 'That consultation type is not available.' USING ERRCODE = '22023';
  END IF;
  v_ends_at := p_starts_at + make_interval(mins => v_duration);

  IF NOT EXISTS (
    SELECT 1 FROM public.get_consultation_slots(p_type_id, (p_starts_at AT TIME ZONE 'UTC')::date)
    WHERE starts_at = p_starts_at
  ) AND NOT EXISTS (
    SELECT 1 FROM public.get_consultation_slots(p_type_id, ((p_starts_at AT TIME ZONE 'Asia/Kolkata'))::date)
    WHERE starts_at = p_starts_at
  ) THEN
    RAISE EXCEPTION 'That time is no longer available. Please choose another slot.' USING ERRCODE = '22023';
  END IF;

  BEGIN
    INSERT INTO consultations (consultation_type_id, client_name, client_email, client_notes, starts_at, ends_at, status)
    VALUES (p_type_id, v_name, v_email, v_notes, p_starts_at, v_ends_at, 'pending')
    RETURNING id INTO v_id;
  EXCEPTION WHEN exclusion_violation THEN
    RAISE EXCEPTION 'That time has just been booked. Please choose another slot.' USING ERRCODE = '22023';
  END;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_consultation_slots(uuid, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_consultation_booking(uuid, timestamptz, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_consultation_slots(uuid, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_consultation_booking(uuid, timestamptz, text, text, text) TO anon, authenticated;
