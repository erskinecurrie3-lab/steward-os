/**
 * Single resource — delete
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

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
  const existing = await prisma.resource.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

  await prisma.resource.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
