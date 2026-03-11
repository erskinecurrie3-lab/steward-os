/**
 * FollowUpSequence — Update and delete
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const { id } = await params;
  const existing = await prisma.followUpSequence.findFirst({
    where: { id, churchId: church.id },
  });
  if (!existing) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.trigger_type !== undefined) data.triggerType = body.trigger_type;
  if (body.journey_stage !== undefined) data.journeyStage = body.journey_stage;
  if (body.channel !== undefined) data.channel = body.channel;
  if (body.delay_days !== undefined) data.delayDays = Number(body.delay_days);
  if (body.message_template !== undefined) data.messageTemplate = body.message_template;
  if (body.is_active !== undefined) data.isActive = body.is_active;

  const seq = await prisma.followUpSequence.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    ...seq,
    delay_days: seq.delayDays,
    message_template: seq.messageTemplate,
    trigger_type: seq.triggerType,
    journey_stage: seq.journeyStage,
    is_active: seq.isActive,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const { id } = await params;
  const existing = await prisma.followUpSequence.findFirst({
    where: { id, churchId: church.id },
  });
  if (!existing) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

  await prisma.followUpSequence.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
