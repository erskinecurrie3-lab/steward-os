/**
 * StewardOS Guest — Get, update, delete single guest
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
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const { id } = await params;
  const guest = await prisma.guest.findFirst({
    where: { id, churchId: church.id },
    include: { campus: { select: { name: true } } },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json(guest);
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
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const { id } = await params;
  const existing = await prisma.guest.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, email, phone, notes, campusId, assignedVolunteer, status, journeyStage, isAtRisk } = body;

  const data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    assignedVolunteer?: string | null;
    status?: string | null;
    journeyStage?: string | null;
    isAtRisk?: boolean;
    campusId?: string | null;
  } = {};
  if (name !== undefined) data.name = String(name).trim();
  if (email !== undefined) data.email = email ? String(email).trim() : null;
  if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
  if (notes !== undefined) data.notes = notes ? String(notes).trim() : null;
  if (assignedVolunteer !== undefined) data.assignedVolunteer = assignedVolunteer ? String(assignedVolunteer).trim() : null;
  if (status !== undefined) data.status = status ? String(status) : null;
  if (journeyStage !== undefined) data.journeyStage = journeyStage ? String(journeyStage) : null;
  if (isAtRisk !== undefined) data.isAtRisk = Boolean(isAtRisk);
  if (campusId !== undefined) {
    if (campusId) {
      const campus = await prisma.campus.findFirst({
        where: { id: campusId, churchId: church.id },
      });
      data.campusId = campus?.id ?? null;
    } else {
      data.campusId = null;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing);
  }

  const guest = await prisma.guest.update({
    where: { id },
    data,
  });

  return NextResponse.json(guest);
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
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const { id } = await params;
  const existing = await prisma.guest.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  await prisma.guest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
