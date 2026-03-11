-- StewardOS RLS: Set church_id for the current session
-- Call this at the start of every request so RLS policies can enforce tenant isolation.
-- Used by createSupabaseForRequest() in lib/supabase.ts

CREATE OR REPLACE FUNCTION set_app_church_id(p_church_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.church_id', COALESCE(p_church_id, ''), true);
END;
$$;
