/**
 * StewardOS Care Notes — List and create
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
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

  const guestId = req.nextUrl.searchParams.get("guestId");
  let campusId: string | null = null;
  if (ctx.isAdminOrPastor) {
    const q = req.nextUrl.searchParams.get("campusId");
    if (q && q !== "all") campusId = q;
  } else {
    campusId = ctx.dbCampusId;
  }

  let validGuestId: string | null = null;
  if (guestId) {
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, churchId: church.id },
    });
    if (guest) validGuestId = guest.id;
  }

  // When fetching notes for a specific guest, skip campus filter so volunteers see all notes they created (notes often have campusId: null)
  const notes = await prisma.careNote.findMany({
    where: {
      churchId: church.id,
      ...(validGuestId ? { guestId: validGuestId } : campusId ? { campusId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { guest: { select: { id: true, name: true } } },
  });

  return NextResponse.json(
    notes.map((n) => {
      const { guest, ...rest } = n;
      return {
        ...rest,
        guest_id: n.guestId,
        guest_name: guest?.name ?? null,
      };
    })
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
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const body = await req.json();
  const { content, guestId, guestName, campusId } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  let validCampusId: string | null = null;
  let validGuestId: string | null = null;
  if (campusId) {
    const campus = await prisma.campus.findFirst({
      where: { id: campusId, churchId: church.id },
    });
    if (campus) validCampusId = campus.id;
  }
  if (guestId) {
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, churchId: church.id },
    });
    if (guest) validGuestId = guest.id;
  }

  const noteContent = guestName
    ? `[Guest: ${guestName}] ${content.trim()}`
    : content.trim();

  const note = await prisma.careNote.create({
    data: {
      churchId: church.id,
      campusId: validCampusId,
      guestId: validGuestId,
      content: noteContent,
    },
  });

  return NextResponse.json(note);
}
