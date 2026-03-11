import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(
    leads.map((l) => ({
      id: l.id,
      first_name: l.firstName,
      last_name: l.lastName,
      email: l.email,
      church_name: l.churchName,
      source: l.source,
      status: l.status,
      notes: l.notes,
      created_date: l.createdAt,
    }))
  );
}
