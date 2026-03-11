ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'new';
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "pastoral_notes" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "submitter_name" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "submitter_email" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "submitter_phone" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "request_text" TEXT;
ALTER TABLE "prayer_requests" ADD COLUMN IF NOT EXISTS "is_anonymous" BOOLEAN DEFAULT false;
