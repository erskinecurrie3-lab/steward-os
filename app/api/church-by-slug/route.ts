/**
 * Public — Get church name by slug (for prayer form header, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug?.trim()) {
    return NextResponse.json({ name: "Our Church" });
  }
  const church = await prisma.church.findFirst({
    where: { slug: slug.trim() },
    select: { name: true },
  });
  if (!church) {
    return NextResponse.json({ name: "Our Church" });
  }
  return NextResponse.json({ name: church.name });
}
