/**
 * Event — Get, update, delete
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

function toEventResponse(e: {
  id: string;
  name: string;
  date: Date;
  description: string | null;
  eventType: string | null;
  endDate: Date | null;
  location: string | null;
  capacity: number | null;
  isPublic: boolean;
  rsvpEnabled: boolean;
  imageUrl: string | null;
  ministry: string | null;
  rsvpCount: number;
  _count?: { rsvps: number };
}) {
  const rsvpCount = e._count?.rsvps ?? e.rsvpCount;
  return {
    ...e,
    title: e.name,
    start_date: e.date,
    event_type: e.eventType ?? "service",
    rsvp_count: rsvpCount,
  };
}

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
  const event = await prisma.event.findFirst({
    where: { id, churchId: church.id },
    include: { _count: { select: { rsvps: true } }, rsvps: true },
  });

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  return NextResponse.json({
    ...toEventResponse(event),
    rsvps: event.rsvps.map((r) => ({
      id: r.id,
      event_id: r.eventId,
      guest_name: r.guestName,
      guest_email: r.guestEmail,
      status: r.status,
      notes: r.notes,
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const { id } = await params;
  const existing = await prisma.event.findFirst({ where: { id, churchId: church.id } });
  if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await req.json();
  const {
    title,
    name,
    start_date,
    date,
    description,
    event_type,
    end_date,
    location,
    capacity,
    is_public,
    rsvp_enabled,
    image_url,
    ministry,
  } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined || name !== undefined) data.name = (title ?? name ?? existing.name).trim();
  if (start_date !== undefined || date !== undefined)
    data.date = new Date(start_date ?? date ?? existing.date);
  if (description !== undefined) data.description = description ?? null;
  if (event_type !== undefined) data.eventType = event_type ?? "service";
  if (end_date !== undefined) data.endDate = end_date ? new Date(end_date) : null;
  if (location !== undefined) data.location = location ?? null;
  if (capacity !== undefined) data.capacity = capacity != null ? Number(capacity) : null;
  if (is_public !== undefined) data.isPublic = is_public !== false;
  if (rsvp_enabled !== undefined) data.rsvpEnabled = rsvp_enabled !== false;
  if (image_url !== undefined) data.imageUrl = image_url ?? null;
  if (ministry !== undefined) data.ministry = ministry ?? null;

  const event = await prisma.event.update({
    where: { id },
    data,
    include: { _count: { select: { rsvps: true } } },
  });

  return NextResponse.json(toEventResponse(event));
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
  const existing = await prisma.event.findFirst({ where: { id, churchId: church.id } });
  if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
