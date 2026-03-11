-- CreateTable: Automation workflows for event-triggered automation
CREATE TABLE "automation_workflows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "church_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_workflows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_workflows_church_id_idx" ON "automation_workflows"("church_id");
CREATE INDEX "automation_workflows_church_id_trigger_event_idx" ON "automation_workflows"("church_id", "trigger_event");

ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
