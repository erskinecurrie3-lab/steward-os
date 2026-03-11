-- Church resource library (documents, training, forms, etc.)
CREATE TABLE IF NOT EXISTS "resources" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "church_id" UUID NOT NULL REFERENCES "churches"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'other',
  "tags" JSONB NOT NULL DEFAULT '[]',
  "file_url" TEXT,
  "file_name" TEXT,
  "file_type" TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "uploaded_by" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "resources_church_id_idx" ON "resources"("church_id");
CREATE INDEX IF NOT EXISTS "resources_category_idx" ON "resources"("category");
