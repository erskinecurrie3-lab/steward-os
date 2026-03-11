-- StewardOS Multi-Church RLS (Layer 3)
-- Run this in Supabase SQL Editor for the new schema (churches, campuses, users, invites).
-- Policies use app.church_id session variable — set by API before queries.

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "churches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invites" ENABLE ROW LEVEL SECURITY;

-- churches: only accessible when app.church_id matches
CREATE POLICY "churches_tenant_isolation" ON "churches"
  FOR ALL USING (id::text = current_setting('app.church_id', true));

-- campuses: scoped by church
CREATE POLICY "campuses_tenant_isolation" ON "campuses"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));

-- users: scoped by church
CREATE POLICY "users_tenant_isolation" ON "users"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));

-- invites: scoped by church
CREATE POLICY "invites_tenant_isolation" ON "invites"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));
