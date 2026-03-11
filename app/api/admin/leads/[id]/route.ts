import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { status } = body;
  if (!status || typeof status !== "string") {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }
  const lead = await prisma.lead.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({
    id: lead.id,
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    church_name: lead.churchName,
    source: lead.source,
    status: lead.status,
    created_date: lead.createdAt,
  });
}
