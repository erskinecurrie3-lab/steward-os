-- Platform/marketing admin entities (not church-scoped)
CREATE TABLE IF NOT EXISTS "leads" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" TEXT,
  "last_name" TEXT,
  "email" TEXT NOT NULL,
  "church_name" TEXT,
  "source" TEXT DEFAULT 'website',
  "status" TEXT DEFAULT 'new',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "demo_bookings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" TEXT,
  "last_name" TEXT,
  "email" TEXT NOT NULL,
  "church_name" TEXT NOT NULL,
  "attendance_size" TEXT,
  "preferred_date" TEXT,
  "preferred_time" TEXT,
  "status" TEXT DEFAULT 'pending',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_name" TEXT NOT NULL,
  "author_title" TEXT,
  "church_name" TEXT,
  "quote" TEXT NOT NULL,
  "is_visible" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT,
  "category" TEXT DEFAULT 'leadership',
  "author_name" TEXT DEFAULT 'StewardOS Team',
  "published_date" DATE,
  "cover_image_url" TEXT,
  "status" TEXT DEFAULT 'draft',
  "slug" TEXT UNIQUE,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads"("status");
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads"("created_at");
CREATE INDEX IF NOT EXISTS "demo_bookings_status_idx" ON "demo_bookings"("status");
CREATE INDEX IF NOT EXISTS "demo_bookings_created_at_idx" ON "demo_bookings"("created_at");
CREATE INDEX IF NOT EXISTS "blog_posts_status_idx" ON "blog_posts"("status");
CREATE INDEX IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts"("slug");
