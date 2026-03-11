-- AlterTable
ALTER TABLE "guests" ADD COLUMN "external_source" VARCHAR(50),
ADD COLUMN "external_id" VARCHAR(100);

-- CreateIndex
CREATE INDEX "guests_church_id_external_source_external_id_idx" ON "guests"("church_id", "external_source", "external_id");
