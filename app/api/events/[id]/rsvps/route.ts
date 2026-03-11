/**
 * Event RSVPs — List and create
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
  const event = await prisma.event.findFirst({
    where: { id, churchId: church.id },
    select: { id: true },
  });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const rsvps = await prisma.eventRsvp.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    rsvps.map((r) => ({
      id: r.id,
      event_id: r.eventId,
      event_title: undefined,
      guest_id: r.guestId,
      guest_name: r.guestName,
      guest_email: r.guestEmail,
      status: r.status,
      notes: r.notes,
    }))
  );
}

export async function POST(
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
  const event = await prisma.event.findFirst({
    where: { id, churchId: church.id },
  });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await req.json();
  const { guest_name, guest_email, status, notes } = body;

  if (!guest_email?.trim()) {
    return NextResponse.json({ error: "guest_email required" }, { status: 400 });
  }

  const rsvp = await prisma.eventRsvp.create({
    data: {
      eventId: id,
      guestName: guest_name ?? undefined,
      guestEmail: guest_email.trim(),
      status: status ?? "attending",
      notes: notes ?? undefined,
    },
  });

  // Update cached rsvp count
  const count = await prisma.eventRsvp.count({
    where: { eventId: id, status: "attending" },
  });
  await prisma.event.update({
    where: { id },
    data: { rsvpCount: count },
  });

  return NextResponse.json(
    {
      id: rsvp.id,
      event_id: rsvp.eventId,
      guest_name: rsvp.guestName,
      guest_email: rsvp.guestEmail,
      status: rsvp.status,
      notes: rsvp.notes,
    },
    { status: 201 }
  );
}
