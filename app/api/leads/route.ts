/**
 * Public Lead capture — Contact form
 * No auth required.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, church_name, source, status, notes } = body;
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    await prisma.lead.create({
      data: {
        firstName: first_name?.trim() || null,
        lastName: last_name?.trim() || null,
        email: email.trim(),
        churchName: church_name?.trim() || null,
        source: source?.trim() || "website",
        status: status?.trim() || "new",
        notes: notes?.trim() || null,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
