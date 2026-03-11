-- Add data tables with church_id (required) and campus_id (optional)
-- Rule: church_id for tenant isolation, campus_id for filtering (NULL = org-wide)

-- CreateTable
CREATE TABLE "guests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guests_church_id_idx" ON "guests"("church_id");
CREATE INDEX "guests_campus_id_idx" ON "guests"("campus_id");

CREATE INDEX "tasks_church_id_idx" ON "tasks"("church_id");
CREATE INDEX "tasks_campus_id_idx" ON "tasks"("campus_id");

CREATE INDEX "events_church_id_idx" ON "events"("church_id");
CREATE INDEX "events_campus_id_idx" ON "events"("campus_id");

CREATE INDEX "care_notes_church_id_idx" ON "care_notes"("church_id");
CREATE INDEX "care_notes_campus_id_idx" ON "care_notes"("campus_id");

CREATE INDEX "prayer_requests_church_id_idx" ON "prayer_requests"("church_id");
CREATE INDEX "prayer_requests_campus_id_idx" ON "prayer_requests"("campus_id");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guests" ADD CONSTRAINT "guests_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "events" ADD CONSTRAINT "events_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "care_notes" ADD CONSTRAINT "care_notes_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "care_notes" ADD CONSTRAINT "care_notes_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
