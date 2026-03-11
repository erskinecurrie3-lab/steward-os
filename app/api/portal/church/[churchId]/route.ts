/**
 * Public church info for Guest Portal branding
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ churchId: string }> }
) {
  const { churchId } = await params;
  if (!churchId) {
    return NextResponse.json({ error: "churchId required" }, { status: 400 });
  }

  const church = await prisma.church.findFirst({
    where: { OR: [{ id: churchId }, { clerkOrgId: churchId }] },
    select: { id: true, name: true },
  });

  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  return NextResponse.json({ id: church.id, name: church.name });
}
