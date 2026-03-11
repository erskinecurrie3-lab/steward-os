/**
 * GET /api/campuses/[id] — Get single campus
 * PATCH /api/campuses/[id] — Update campus (admin only)
 * DELETE /api/campuses/[id] — Delete campus (admin only)
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
  const campus = await prisma.campus.findFirst({
    where: { id, churchId: church.id },
    select: { id: true, name: true, address: true, pastorName: true, isMain: true },
  });

  if (!campus) return NextResponse.json({ error: "Campus not found" }, { status: 404 });
  return NextResponse.json(campus);
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

  if (!ctx.isAdminOrPastor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const { id } = await params;
  const campus = await prisma.campus.findFirst({
    where: { id, churchId: church.id },
  });

  if (!campus) {
    return NextResponse.json({ error: "Campus not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, address, pastorName, isMain } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = String(name).trim() || campus.name;
  if (address !== undefined) data.address = address?.trim() || null;
  if (pastorName !== undefined) data.pastorName = pastorName?.trim() || null;
  if (typeof isMain === "boolean") data.isMain = isMain;

  const updated = await prisma.campus.update({
    where: { id },
    data,
    select: { id: true, name: true, address: true, pastorName: true, isMain: true },
  });

  return NextResponse.json(updated);
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

  if (!ctx.isAdminOrPastor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const { id } = await params;
  const campus = await prisma.campus.findFirst({
    where: { id, churchId: church.id },
  });

  if (!campus) {
    return NextResponse.json({ error: "Campus not found" }, { status: 404 });
  }

  const campusCount = await prisma.campus.count({ where: { churchId: church.id } });
  if (campusCount <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the only campus" },
      { status: 400 }
    );
  }

  await prisma.campus.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
