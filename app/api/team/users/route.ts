/**
 * List team members (volunteers) for church
 * Any org member can read (for VolunteerAssigner, etc.)
 */

import { NextResponse } from "next/server";
import { requireChurch } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: { churchId: church.id },
    select: { id: true, email: true, fullName: true, role: true },
  });

  return NextResponse.json(users.map((u) => ({ ...u, full_name: u.fullName })));
}
