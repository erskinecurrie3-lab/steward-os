/**
 * StewardOS Super-Admin — List all churches with MRR
 * GET /api/super-admin/churches
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/super-admin";
import { prisma } from "@/lib/db";

const PLAN_MRR: Record<string, number> = {
  starter: 49,
  growth: 99,
  network: 199,
  enterprise: 399,
};

export async function GET() {
  await requireSuperAdmin();

  const churches = await prisma.church.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      createdAt: true,
      stripeCustomerId: true,
      stripeSubId: true,
      _count: {
        select: { users: true, guests: true },
      },
    },
  });

  const list = churches.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    plan: c.plan,
    created_at: c.createdAt,
    stripe_customer_id: c.stripeCustomerId,
    user_count: c._count.users,
    guest_count: c._count.guests,
    mrr: c.stripeSubId ? (PLAN_MRR[c.plan.toLowerCase()] ?? 0) : 0,
  }));

  const totalMrr = list.reduce((sum, c) => sum + c.mrr, 0);

  return NextResponse.json({
    churches: list,
    totalMrr,
    totalChurches: list.length,
  });
}
