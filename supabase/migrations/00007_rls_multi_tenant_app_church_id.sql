-- ═══════════════════════════════════════════════════════════════════════════════
-- Supabase RLS — Multi-Tenant Isolation Using app.church_id
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PREREQUISITE: Run 00004_set_app_church_id_rpc.sql or 00006_set_session_context_rpc.sql
--
-- SETUP:
-- 1. Call set_config('app.church_id', '<church_uuid>', true) at the start of
--    each request (e.g. in middleware, API route, or Supabase RPC).
-- 2. Or call SELECT set_session_context('<church_id>', ...) for Supabase client.
--
-- POLICY LOGIC:
-- - current_setting('app.church_id', true) returns the church UUID for this session
-- - Rows are visible/editable only when church_id matches
-- - Empty app.church_id = no access (fail-safe)
--
-- TABLES: churches, campuses, users, invites, guests, tasks, events,
--         care_notes, prayer_requests
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Enable RLS on all tenant-scoped tables ────────────────────────────────
ALTER TABLE churches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests  ENABLE ROW LEVEL SECURITY;

-- ─── Helper: Check if session has a valid church context ────────────────────
CREATE OR REPLACE FUNCTION app_has_church_context()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.church_id', true) IS NOT NULL
     AND current_setting('app.church_id', true) != '';
$$;

-- ─── churches: access only when app.church_id matches row id ────────────────
DROP POLICY IF EXISTS "rls_churches_tenant" ON churches;
CREATE POLICY "rls_churches_tenant"
  ON churches
  FOR ALL
  USING (id::text = current_setting('app.church_id', true))
  WITH CHECK (id::text = current_setting('app.church_id', true));

-- ─── campuses: scoped by church_id ──────────────────────────────────────────
DROP POLICY IF EXISTS "rls_campuses_tenant" ON campuses;
CREATE POLICY "rls_campuses_tenant"
  ON campuses
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── users: scoped by church_id ─────────────────────────────────────────────
DROP POLICY IF EXISTS "rls_users_tenant" ON users;
CREATE POLICY "rls_users_tenant"
  ON users
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── invites: scoped by church_id ───────────────────────────────────────────
DROP POLICY IF EXISTS "rls_invites_tenant" ON invites;
CREATE POLICY "rls_invites_tenant"
  ON invites
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── guests: scoped by church_id ────────────────────────────────────────────
DROP POLICY IF EXISTS "rls_guests_tenant" ON guests;
CREATE POLICY "rls_guests_tenant"
  ON guests
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── tasks: scoped by church_id ──────────────────────────────────────────────
DROP POLICY IF EXISTS "rls_tasks_tenant" ON tasks;
CREATE POLICY "rls_tasks_tenant"
  ON tasks
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── events: scoped by church_id ────────────────────────────────────────────
DROP POLICY IF EXISTS "rls_events_tenant" ON events;
CREATE POLICY "rls_events_tenant"
  ON events
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── care_notes: scoped by church_id ─────────────────────────────────────────
DROP POLICY IF EXISTS "rls_care_notes_tenant" ON care_notes;
CREATE POLICY "rls_care_notes_tenant"
  ON care_notes
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── prayer_requests: scoped by church_id ────────────────────────────────────
DROP POLICY IF EXISTS "rls_prayer_requests_tenant" ON prayer_requests;
CREATE POLICY "rls_prayer_requests_tenant"
  ON prayer_requests
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true))
  WITH CHECK (church_id::text = current_setting('app.church_id', true));

-- ─── Optional: Super-admin bypass (for platform admins) ───────────────────────
-- Uncomment and set app.is_superadmin = 'true' for super-admin sessions
/*
CREATE POLICY "rls_superadmin_churches"  ON churches        FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_campuses"   ON campuses       FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_users"      ON users          FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_invites"    ON invites        FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_guests"     ON guests         FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_tasks"      ON tasks          FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_events"     ON events         FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_care_notes"  ON care_notes     FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
CREATE POLICY "rls_superadmin_prayer"      ON prayer_requests FOR ALL USING (current_setting('app.is_superadmin', true) = 'true');
*/
