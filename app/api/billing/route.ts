/**
 * StewardOS Billing — Get plan & usage
 * GET /api/billing
 *
 * Returns current plan, member/guest count, limits, and upgrade URL.
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
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const [guestCount, userCount] = await Promise.all([
    prisma.guest.count({ where: { churchId: church.id } }),
    prisma.user.count({ where: { churchId: church.id } }),
  ]);

  const memberCount = guestCount; // plan limit applies to guests per spec

  return NextResponse.json({
    plan: church.plan,
    planMemberLimit: church.planMemberLimit,
    memberCount,
    userCount,
    atLimit: memberCount >= church.planMemberLimit,
    hasActiveSubscription: Boolean(church.stripeSubId),
  });
}
