/**
 * Demo booking — public, no auth
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, church_name, attendance_size, preferred_date, preferred_time, status, notes, role, biggest_challenge, current_tools, goals } = body;
    if (!email?.trim() || !church_name?.trim()) {
      return NextResponse.json({ error: "Email and church name required" }, { status: 400 });
    }
    await prisma.demoBooking.create({
      data: {
        firstName: first_name?.trim() || null,
        lastName: last_name?.trim() || null,
        email: email.trim(),
        churchName: church_name.trim(),
        attendanceSize: attendance_size?.trim() || null,
        preferredDate: preferred_date?.trim() || null,
        preferredTime: preferred_time?.trim() || null,
        status: status?.trim() || "pending",
        notes: [notes, role, biggest_challenge, current_tools, goals].filter(Boolean).map((s) => String(s).trim()).join(" | ") || null,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
