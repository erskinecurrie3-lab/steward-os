-- StewardOS RLS — Core Tables
-- Paste into Supabase SQL Editor. Locks every table to church_id.
-- Requires: set_app_church_id(), app.user_role, app.user_email, app.is_superadmin

-- Enable RLS on all tables
ALTER TABLE guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches        ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (optional)
-- DROP POLICY IF EXISTS "church_isolation_guests" ON guests;
-- etc.

-- ─── churches table ───────────────────────────────────────────
CREATE POLICY "church_isolation_churches"
  ON churches
  FOR ALL
  USING (id::text = current_setting('app.church_id', true));

-- ─── guests table ─────────────────────────────────────────────
CREATE POLICY "church_isolation_guests"
  ON guests
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── tasks table ───────────────────────────────────────────────
CREATE POLICY "church_isolation_tasks"
  ON tasks
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- Volunteer role: only see tasks assigned to them
CREATE POLICY "volunteer_own_tasks"
  ON tasks
  FOR SELECT
  USING (
    church_id::text = current_setting('app.church_id', true)
    AND (
      current_setting('app.user_role', true) != 'volunteer'
      OR assigned_volunteer = current_setting('app.user_email', true)
    )
  );

-- ─── care_notes table ──────────────────────────────────────────
CREATE POLICY "church_isolation_care_notes"
  ON care_notes
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── events table ──────────────────────────────────────────────
CREATE POLICY "church_isolation_events"
  ON events
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── prayer_requests table ─────────────────────────────────────
CREATE POLICY "church_isolation_prayer_requests"
  ON prayer_requests
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── campuses table ────────────────────────────────────────────
CREATE POLICY "church_isolation_campuses"
  ON campuses
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── users table ───────────────────────────────────────────────
CREATE POLICY "church_isolation_users"
  ON users
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── invites table ─────────────────────────────────────────────
CREATE POLICY "church_isolation_invites"
  ON invites
  FOR ALL
  USING (church_id::text = current_setting('app.church_id', true));

-- ─── Super-admin bypass (for Erskine account) ───────────────────
CREATE POLICY "superadmin_bypass_guests"
  ON guests
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_tasks"
  ON tasks
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_care_notes"
  ON care_notes
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_events"
  ON events
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_prayer_requests"
  ON prayer_requests
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_campuses"
  ON campuses
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_users"
  ON users
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_invites"
  ON invites
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');

CREATE POLICY "superadmin_bypass_churches"
  ON churches
  FOR ALL
  USING (current_setting('app.is_superadmin', true) = 'true');
