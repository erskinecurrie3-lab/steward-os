/**
 * Prayer Request — Get, update, delete single request
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET(
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
  const pr = await prisma.prayerRequest.findFirst({
    where: { id, churchId: church.id },
  });

  if (!pr) return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });
  return NextResponse.json(pr);
}

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
  const existing = await prisma.prayerRequest.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });

  const body = await req.json();
  const { content, category, urgency, aiSummary, aiFollowUpAction, aiSuggestedResponder, status, pastoral_notes, pastoralNotes } = body;

  const data: {
    content?: string;
    category?: string;
    urgency?: string;
    aiSummary?: string | null;
    aiFollowUpAction?: string | null;
    aiSuggestedResponder?: string | null;
    status?: string;
    pastoralNotes?: string | null;
  } = {};
  if (content !== undefined) data.content = String(content).trim();
  if (category !== undefined) data.category = String(category);
  if (urgency !== undefined) data.urgency = String(urgency);
  if (aiSummary !== undefined) data.aiSummary = aiSummary ? String(aiSummary).trim() : null;
  if (aiFollowUpAction !== undefined) data.aiFollowUpAction = aiFollowUpAction ? String(aiFollowUpAction).trim() : null;
  if (aiSuggestedResponder !== undefined) data.aiSuggestedResponder = aiSuggestedResponder ? String(aiSuggestedResponder).trim() : null;
  if (status !== undefined) data.status = String(status);
  const notesVal = pastoral_notes ?? pastoralNotes;
  if (notesVal !== undefined) data.pastoralNotes = notesVal ? String(notesVal).trim() : null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing);
  }

  const pr = await prisma.prayerRequest.update({
    where: { id },
    data,
  });

  return NextResponse.json(pr);
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
  const existing = await prisma.prayerRequest.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });

  await prisma.prayerRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
