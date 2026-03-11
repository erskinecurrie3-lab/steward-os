-- StewardOS Multi-Church Initial Migration
-- Run with: npx prisma migrate deploy (after setting DATABASE_URL)

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'staff', 'volunteer');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchUser" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'staff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "campusId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "campusId" TEXT,
    "assignedToUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "campusId" TEXT,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_clerkOrgId_key" ON "Church"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Church_stripeCustomerId_key" ON "Church"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Campus_churchId_idx" ON "Campus"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchUser_clerkUserId_churchId_key" ON "ChurchUser"("clerkUserId", "churchId");

-- CreateIndex
CREATE INDEX "ChurchUser_churchId_idx" ON "ChurchUser"("churchId");

-- CreateIndex
CREATE INDEX "ChurchUser_clerkUserId_idx" ON "ChurchUser"("clerkUserId");

-- CreateIndex
CREATE INDEX "Guest_churchId_idx" ON "Guest"("churchId");

-- CreateIndex
CREATE INDEX "Guest_campusId_idx" ON "Guest"("campusId");

-- CreateIndex
CREATE INDEX "Task_churchId_idx" ON "Task"("churchId");

-- CreateIndex
CREATE INDEX "Task_campusId_idx" ON "Task"("campusId");

-- CreateIndex
CREATE INDEX "Task_assignedToUserId_idx" ON "Task"("assignedToUserId");

-- CreateIndex
CREATE INDEX "Event_churchId_idx" ON "Event"("churchId");

-- CreateIndex
CREATE INDEX "Event_campusId_idx" ON "Event"("campusId");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchUser" ADD CONSTRAINT "ChurchUser_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "ChurchUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
