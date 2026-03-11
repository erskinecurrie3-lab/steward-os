-- Task: completed_at for response time metrics
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);

-- Journey templates (customized from seed or created from scratch)
CREATE TABLE IF NOT EXISTS "journey_templates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "church_id" UUID NOT NULL REFERENCES "churches"("id") ON DELETE CASCADE,
  "campus_id" UUID REFERENCES "campuses"("id") ON DELETE SET NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT DEFAULT 'custom',
  "touchpoints" INT DEFAULT 0,
  "days" INT DEFAULT 30,
  "seed_id" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "journey_templates_church_id_idx" ON "journey_templates"("church_id");

-- Journey touchpoints (steps in a journey)
CREATE TABLE IF NOT EXISTS "journey_touchpoints" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "journey_template_id" UUID NOT NULL REFERENCES "journey_templates"("id") ON DELETE CASCADE,
  "order_index" INT NOT NULL DEFAULT 0,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT DEFAULT 'manual',
  "days_offset" INT DEFAULT 0,
  "config" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "journey_touchpoints_journey_template_id_idx" ON "journey_touchpoints"("journey_template_id");

-- Journey stages (e.g. stage_1_welcome)
CREATE TABLE IF NOT EXISTS "journey_stages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "journey_template_id" UUID NOT NULL REFERENCES "journey_templates"("id") ON DELETE CASCADE,
  "order_index" INT NOT NULL DEFAULT 0,
  "name" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "journey_stages_journey_template_id_idx" ON "journey_stages"("journey_template_id");

-- Volunteer reference uploads (metadata; files in Supabase storage)
CREATE TABLE IF NOT EXISTS "volunteer_references" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "church_id" UUID NOT NULL REFERENCES "churches"("id") ON DELETE CASCADE,
  "campus_id" UUID REFERENCES "campuses"("id") ON DELETE SET NULL,
  "filename" TEXT NOT NULL,
  "storage_path" TEXT NOT NULL,
  "url" TEXT,
  "file_size" INT,
  "mime_type" TEXT,
  "uploaded_by" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "volunteer_references_church_id_idx" ON "volunteer_references"("church_id");
