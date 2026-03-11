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
  const demo = await prisma.demoBooking.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({
    id: demo.id,
    first_name: demo.firstName,
    last_name: demo.lastName,
    email: demo.email,
    church_name: demo.churchName,
    preferred_date: demo.preferredDate,
    preferred_time: demo.preferredTime,
    status: demo.status,
    created_at: demo.createdAt,
  });
}
