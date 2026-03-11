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

  if (!ctx.isAdminOrPastor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json([]);
  }

  const campuses = await prisma.campus.findMany({
    where: { churchId: church.id },
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
    select: { id: true, name: true, address: true, pastorName: true, isMain: true },
  });
  return NextResponse.json(campuses);
}

export async function POST(req: Request) {
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

  const body = await req.json();
  const { name, address, pastorName, isMain } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Campus name is required" }, { status: 400 });
  }

  const campus = await prisma.campus.create({
    data: {
      churchId: church.id,
      name: name.trim(),
      address: address?.trim() || null,
      pastorName: pastorName?.trim() || null,
      isMain: Boolean(isMain),
    },
  });

  return NextResponse.json({
    id: campus.id,
    name: campus.name,
    address: campus.address,
    pastorName: campus.pastorName,
    isMain: campus.isMain,
  });
}
