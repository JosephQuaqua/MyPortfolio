/*
# Booking validation uses the slot's own date

Plain-English summary: the booking function now confirms that the chosen time is a real open slot by checking the days around it, instead of two hard-coded time zones. Behavior otherwise unchanged.

## Security
- Same access as before: visitors can call the booking function; double booking is still blocked by the database.
*/

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
  v_day date := (p_starts_at AT TIME ZONE 'UTC')::date;
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
    SELECT 1
    FROM generate_series(v_day - 1, v_day + 1, interval '1 day') AS d(day)
    CROSS JOIN LATERAL public.get_consultation_slots(p_type_id, d.day::date) AS s
    WHERE s.starts_at = p_starts_at
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
