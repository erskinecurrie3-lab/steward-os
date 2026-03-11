-- StewardOS Multi-Church RLS (Layer 3)
-- Run this in Supabase SQL Editor to enable tenant isolation at the database level.
-- Policies use app.church_id session variable — set by API before queries.

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Church" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Campus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChurchUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Guest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- Church: only accessible when app.church_id matches
CREATE POLICY "church_tenant_isolation" ON "Church"
  FOR ALL USING (id = current_setting('app.church_id', true));

-- Campus: scoped by church
CREATE POLICY "campus_tenant_isolation" ON "Campus"
  FOR ALL USING ("churchId" = current_setting('app.church_id', true));

-- ChurchUser: scoped by church
CREATE POLICY "church_user_tenant_isolation" ON "ChurchUser"
  FOR ALL USING ("churchId" = current_setting('app.church_id', true));

-- Guest: scoped by church
CREATE POLICY "guest_tenant_isolation" ON "Guest"
  FOR ALL USING ("churchId" = current_setting('app.church_id', true));

-- Task: scoped by church
CREATE POLICY "task_tenant_isolation" ON "Task"
  FOR ALL USING ("churchId" = current_setting('app.church_id', true));

-- Event: scoped by church
CREATE POLICY "event_tenant_isolation" ON "Event"
  FOR ALL USING ("churchId" = current_setting('app.church_id', true));

-- Note: Prisma connects with a single DB user. To use RLS with Prisma,
-- run set_config('app.church_id', churchId, true) at the start of each
-- transaction. See lib/db.ts setChurchContext() and use with $transaction.
