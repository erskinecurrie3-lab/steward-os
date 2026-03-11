-- RLS for data tables: guests, tasks, events, care_notes, prayer_requests
-- church_id required, campus_id optional (NULL = org-wide)

ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "care_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prayer_requests" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guests_tenant_isolation" ON "guests"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));

CREATE POLICY "tasks_tenant_isolation" ON "tasks"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));

CREATE POLICY "events_tenant_isolation" ON "events"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));

CREATE POLICY "care_notes_tenant_isolation" ON "care_notes"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));

CREATE POLICY "prayer_requests_tenant_isolation" ON "prayer_requests"
  FOR ALL USING (church_id::text = current_setting('app.church_id', true));
