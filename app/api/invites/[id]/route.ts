/**
 * DELETE /api/invites/[id] — Revoke a pending invite (admin only)
 */

import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminOrPastor(ctx)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const invite = await prisma.invite.findFirst({
    where: { id, churchId: church.id, acceptedAt: null },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found or already accepted" }, { status: 404 });
  }

  await prisma.invite.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
