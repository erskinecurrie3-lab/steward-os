/*
  Warnings:

  - You are about to drop the `Campus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Church` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChurchUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Guest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campus" DROP CONSTRAINT "Campus_churchId_fkey";

-- DropForeignKey
ALTER TABLE "ChurchUser" DROP CONSTRAINT "ChurchUser_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_campusId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_campusId_fkey";

-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedToUserId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_campusId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_churchId_fkey";

-- DropTable
DROP TABLE "Campus";

-- DropTable
DROP TABLE "Church";

-- DropTable
DROP TABLE "ChurchUser";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Guest";

-- DropTable
DROP TABLE "Task";

-- DropEnum
DROP TYPE "TaskStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "churches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "clerk_org_id" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "stripe_customer_id" TEXT,
    "stripe_sub_id" TEXT,
    "plan_member_limit" INTEGER NOT NULL DEFAULT 200,
    "denomination" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "logo_url" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#C9A84C',
    "website_url" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "pastor_name" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "campus_id" UUID,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_by" UUID,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "token" TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    "invited_by" UUID,
    "accepted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "churches_slug_key" ON "churches"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "churches_clerk_org_id_key" ON "churches"("clerk_org_id");

-- CreateIndex
CREATE INDEX "campuses_church_id_idx" ON "campuses"("church_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_church_id_idx" ON "users"("church_id");

-- CreateIndex
CREATE INDEX "users_campus_id_idx" ON "users"("campus_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_church_id_idx" ON "invites"("church_id");

-- CreateIndex
CREATE INDEX "invites_token_idx" ON "invites"("token");

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
