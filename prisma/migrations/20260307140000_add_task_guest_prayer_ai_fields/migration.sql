-- Guest: last_seen, spiritual_background, family_status
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "last_seen" TIMESTAMP(3);
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "spiritual_background" TEXT;
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "family_status" TEXT;

-- Task: guest_id, task_type, priority, guest_name, guest_email, ai_message_sent, ai_handled_at
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "guest_id" UUID;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "task_type" TEXT DEFAULT 'general';
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'normal';
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "guest_name" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "guest_email" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "ai_message_sent" TEXT;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "ai_handled_at" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "tasks_guest_id_idx" ON "tasks"("guest_id");

-- CareNote: guest_id
ALTER TABLE "care_notes" ADD COLUMN IF NOT EXISTS "guest_id" UUID;

-- PrayerRequest: category, urgency, ai_summary, ai_follow_up_action, ai_suggested_responder
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'other';
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "urgency" TEXT DEFAULT 'medium';
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "ai_summary" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "ai_follow_up_action" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "ai_suggested_responder" TEXT;
