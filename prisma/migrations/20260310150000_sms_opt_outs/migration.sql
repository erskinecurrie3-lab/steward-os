-- CreateTable
CREATE TABLE "sms_opt_outs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone" VARCHAR(20) NOT NULL,
    "opted_out_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_opt_outs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_opt_outs_phone_key" ON "sms_opt_outs"("phone");

-- CreateIndex
CREATE INDEX "sms_opt_outs_phone_idx" ON "sms_opt_outs"("phone");
