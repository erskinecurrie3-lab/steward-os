/**
 * Events — List and create
 */

import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  let campusId: string | null = null;
  if (ctx.isAdminOrPastor) {
    const q = req.nextUrl.searchParams.get("campusId");
    if (q && q !== "all") campusId = q;
  } else {
    campusId = ctx.dbCampusId;
  }

  const events = await prisma.event.findMany({
    where: { churchId: church.id, ...(campusId ? { campusId } : {}) },
    orderBy: { date: "desc" },
    take: 50,
    include: { _count: { select: { rsvps: true } } },
  });

  return NextResponse.json(events.map(toEventResponse));
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

  const eventName = title ?? name;
  const eventDate = start_date ?? date;

  if (!eventName?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const data: Parameters<typeof prisma.event.create>[0]["data"] = {
    churchId: church.id,
    name: eventName.trim(),
    date: eventDate ? new Date(eventDate) : new Date(),
    eventType: event_type ?? "service",
    description: description ?? undefined,
    endDate: end_date ? new Date(end_date) : undefined,
    location: location ?? undefined,
    capacity: capacity != null ? Number(capacity) : undefined,
    isPublic: is_public !== false,
    rsvpEnabled: rsvp_enabled !== false,
    imageUrl: image_url ?? undefined,
    ministry: ministry ?? undefined,
  };

  const event = await prisma.event.create({
    data,
    include: { _count: { select: { rsvps: true } } },
  });

  return NextResponse.json(toEventResponse(event), { status: 201 });
}
