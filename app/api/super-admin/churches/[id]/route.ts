/**
 * StewardOS Super-Admin — Church detail
 * GET /api/super-admin/churches/:id
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/super-admin";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireSuperAdmin();
  const { id } = await params;

  const church = await prisma.church.findUnique({
    where: { id },
  });

  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const [userCount, guestCount, guests, tasks] = await Promise.all([
    prisma.user.count({ where: { churchId: id } }),
    prisma.guest.count({ where: { churchId: id } }),
    prisma.guest.findMany({
      where: { churchId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, email: true },
    }),
    prisma.task.findMany({
      where: { churchId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, status: true },
    }),
  ]);

  return NextResponse.json({
    church: { id: church.id, name: church.name, slug: church.slug, plan: church.plan },
    userCount,
    guestCount,
    guests,
    tasks,
  });
}
