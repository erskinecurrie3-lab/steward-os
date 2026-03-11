/**
 * Event RSVPs — List all RSVPs for church events
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

  const rsvps = await prisma.eventRsvp.findMany({
    where: { event: { churchId: church.id } },
    include: { event: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(
    rsvps.map((r) => ({
      id: r.id,
      event_id: r.eventId,
      event_title: r.event.name,
      guest_id: r.guestId,
      guest_name: r.guestName,
      guest_email: r.guestEmail,
      status: r.status,
      notes: r.notes,
    }))
  );
}
