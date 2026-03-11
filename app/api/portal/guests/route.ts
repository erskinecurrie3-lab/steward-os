/**
 * Public Guest Portal — lookup by email, create (no auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET ?email=x&churchId=y — lookup guest for portal */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const churchId = req.nextUrl.searchParams.get("churchId");

  if (!email?.trim() || !churchId) {
    return NextResponse.json({ error: "email and churchId required" }, { status: 400 });
  }

  const church = await prisma.church.findFirst({
    where: { OR: [{ id: churchId }, { clerkOrgId: churchId }] },
  });

  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const guest = await prisma.guest.findFirst({
    where: {
      churchId: church.id,
      email: { equals: email.trim().toLowerCase(), mode: "insensitive" },
    },
  });

  if (!guest) {
    return NextResponse.json([]);
  }

  const [first_name = "", ...rest] = (guest.name || "").trim().split(/\s+/);
  const last_name = rest.join(" ") || "";
  return NextResponse.json([
    {
      ...guest,
      first_name,
      last_name,
      status: "new_visitor",
      journey_stage: "stage_1_welcome",
      is_at_risk: false,
      created_date: guest.createdAt,
    },
  ]);
}

/** POST — create guest (portal registration) */
export async function POST(req: Request) {
  const body = await req.json();
  const { church_id, first_name, last_name, email, phone, spiritual_background, family_status, how_heard, prayer_request } = body;

  const churchId = church_id;
  if (!churchId || !email?.trim()) {
    return NextResponse.json({ error: "church_id and email required" }, { status: 400 });
  }

  const church = await prisma.church.findFirst({
    where: { OR: [{ id: churchId }, { clerkOrgId: churchId }] },
  });

  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const name = [first_name, last_name].filter(Boolean).join(" ").trim() || "Guest";
  const notesParts = [
    spiritual_background && `Background: ${spiritual_background}`,
    family_status && `Family: ${family_status}`,
    how_heard && `How heard: ${how_heard}`,
    prayer_request && `Prayer: ${prayer_request}`,
  ].filter(Boolean);
  const notes = notesParts.join("\n") || null;

  const guest = await prisma.guest.create({
    data: {
      churchId: church.id,
      name,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      notes,
    },
  });

  return NextResponse.json(guest, { status: 201 });
}
