ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "volunteer_profile" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences" JSONB;
ALTER TABLE "churches" ADD COLUMN IF NOT EXISTS "church_settings" JSONB;
