/**
 * StewardOS Super-Admin — Search users across all churches
 * GET /api/super-admin/users?q=...
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/super-admin";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  await requireSuperAdmin();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { church: { select: { name: true } } },
    take: 50,
  });

  const list = users.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    churchName: u.church.name,
  }));

  return NextResponse.json(list);
}
