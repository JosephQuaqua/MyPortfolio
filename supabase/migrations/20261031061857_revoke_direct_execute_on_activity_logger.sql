/*
# Restrict direct execution of the admin activity logger

1. Changed functions
- `public.log_admin_activity(text, text, text, jsonb)` is no longer callable directly through the Data API by signed-in users or anonymous visitors.

2. Why
- The function writes to the admin activity log. Activity is recorded by database triggers, which do not need direct API access, so the direct grant only widened who could write log entries.

3. Security
- EXECUTE revoked from PUBLIC, anon and authenticated.
- No application code calls this function; it is unaffected.
*/

REVOKE EXECUTE ON FUNCTION public.log_admin_activity(text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
