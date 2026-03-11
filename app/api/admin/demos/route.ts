import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requirePlatformAdmin();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const demos = await prisma.demoBooking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(
    demos.map((d) => ({
      id: d.id,
      first_name: d.firstName,
      last_name: d.lastName,
      email: d.email,
      church_name: d.churchName,
      attendance_size: d.attendanceSize,
      preferred_date: d.preferredDate,
      preferred_time: d.preferredTime,
      status: d.status,
      notes: d.notes,
      created_at: d.createdAt,
    }))
  );
}
