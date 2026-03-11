/**
 * FollowUpSequence — List and create email sequence steps
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const sequences = await prisma.followUpSequence.findMany({
    where: {
      churchId: church.id,
      triggerType: "new_visitor_email_sequence",
    },
    orderBy: { delayDays: "asc" },
    take: 50,
  });

  return NextResponse.json(
    sequences.map((s) => ({
      ...s,
      delay_days: s.delayDays,
      message_template: s.messageTemplate,
      trigger_type: s.triggerType,
      journey_stage: s.journeyStage,
      is_active: s.isActive,
    }))
  );
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const body = await req.json();
  const {
    name,
    trigger_type,
    journey_stage,
    channel,
    delay_days,
    message_template,
    is_active,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const seq = await prisma.followUpSequence.create({
    data: {
      churchId: church.id,
      name: name.trim(),
      triggerType: trigger_type ?? "new_visitor_email_sequence",
      journeyStage: journey_stage ?? "stage_1_welcome",
      channel: channel ?? "email",
      delayDays: Number(delay_days) ?? 0,
      messageTemplate: message_template ?? null,
      isActive: is_active !== false,
    },
  });

  return NextResponse.json(
    { ...seq, delay_days: seq.delayDays, message_template: seq.messageTemplate, trigger_type: seq.triggerType, journey_stage: seq.journeyStage, is_active: seq.isActive },
    { status: 201 }
  );
}
