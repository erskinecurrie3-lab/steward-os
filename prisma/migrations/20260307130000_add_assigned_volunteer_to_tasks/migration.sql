-- Add assigned_volunteer (volunteer email) to tasks for RLS volunteer policy
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "assigned_volunteer" TEXT;
