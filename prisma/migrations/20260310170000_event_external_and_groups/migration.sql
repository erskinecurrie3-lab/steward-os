-- AlterTable: Add external source fields to events for PCO upserts
ALTER TABLE "events" ADD COLUMN "external_source" VARCHAR(50), ADD COLUMN "external_id" VARCHAR(100);

-- CreateIndex
CREATE INDEX "events_church_id_external_source_external_id_idx" ON "events"("church_id", "external_source", "external_id");

-- CreateTable: Groups (PCO Groups sync)
CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TEXT,
    "memberships_count" INTEGER NOT NULL DEFAULT 0,
    "external_source" VARCHAR(50),
    "external_id" VARCHAR(100),
    "pco_group_type_id" VARCHAR(50),
    "virtual_location_url" TEXT,
    "listed" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "groups_church_id_idx" ON "groups"("church_id");
CREATE INDEX "groups_campus_id_idx" ON "groups"("campus_id");
CREATE INDEX "groups_church_id_external_source_external_id_idx" ON "groups"("church_id", "external_source", "external_id");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "groups" ADD CONSTRAINT "groups_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
