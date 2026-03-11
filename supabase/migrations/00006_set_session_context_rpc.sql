-- StewardOS RLS: Set full session context for RLS policies
-- Call this at the start of every request. Used by createSupabaseForRequest().
-- Supports: church isolation, volunteer task filtering, super-admin bypass

CREATE OR REPLACE FUNCTION set_session_context(
  p_church_id text DEFAULT '',
  p_user_role text DEFAULT '',
  p_user_email text DEFAULT '',
  p_is_superadmin boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.church_id', COALESCE(p_church_id, ''), true);
  PERFORM set_config('app.user_role', COALESCE(p_user_role, ''), true);
  PERFORM set_config('app.user_email', COALESCE(p_user_email, ''), true);
  PERFORM set_config('app.is_superadmin', CASE WHEN p_is_superadmin THEN 'true' ELSE 'false' END, true);
END;
$$;
