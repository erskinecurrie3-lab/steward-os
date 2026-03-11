/**
 * Care Note — Get, update, delete single note
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
  const note = await prisma.careNote.findFirst({
    where: { id, churchId: church.id },
  });

  if (!note) return NextResponse.json({ error: "Care note not found" }, { status: 404 });
  return NextResponse.json(note);
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
  const existing = await prisma.careNote.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) return NextResponse.json({ error: "Care note not found" }, { status: 404 });

  const body = await req.json();
  const { content } = body;

  const data: { content?: string } = {};
  if (content !== undefined) data.content = String(content).trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing);
  }

  const note = await prisma.careNote.update({
    where: { id },
    data,
  });

  return NextResponse.json(note);
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
  const existing = await prisma.careNote.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) return NextResponse.json({ error: "Care note not found" }, { status: 404 });

  await prisma.careNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
