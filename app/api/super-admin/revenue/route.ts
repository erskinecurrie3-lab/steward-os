/**
 * StewardOS Super-Admin — Revenue overview
 * GET /api/super-admin/revenue
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/super-admin";
import { prisma } from "@/lib/db";

export async function GET() {
  await requireSuperAdmin();

  const churches = await prisma.church.findMany({
    select: { plan: true },
  });

  const planCounts: Record<string, number> = {};
  for (const c of churches) {
    planCounts[c.plan] = (planCounts[c.plan] ?? 0) + 1;
  }

  return NextResponse.json({
    planCounts,
    totalChurches: churches.length,
  });
}
