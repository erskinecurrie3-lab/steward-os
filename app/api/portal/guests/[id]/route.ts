/**
 * Public Guest Portal — update guest (after lookup by email)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const { phone, how_heard, prayer_request } = body;
  const data: { phone?: string | null; notes?: string } = {};
  if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
  if (how_heard !== undefined || prayer_request !== undefined) {
    const parts: string[] = [];
    if (how_heard) parts.push(`How heard: ${String(how_heard).trim()}`);
    if (prayer_request) parts.push(`Prayer request (${new Date().toLocaleDateString()}): ${String(prayer_request).trim()}`);
    const current = (guest.notes || "").trim();
    if (current && parts.length === 0) data.notes = current;
    else if (parts.length) data.notes = parts.join("\n");
  }

  if (Object.keys(data).length === 0) {
    const [first_name = "", ...rest] = (guest.name || "").trim().split(/\s+/);
    const last_name = rest.join(" ") || "";
    return NextResponse.json({
      ...guest,
      first_name,
      last_name,
      status: "new_visitor",
      journey_stage: "stage_1_welcome",
      is_at_risk: false,
      created_date: guest.createdAt,
    });
  }

  const updated = await prisma.guest.update({
    where: { id },
    data,
  });

  const [first_name = "", ...rest] = (updated.name || "").trim().split(/\s+/);
  const last_name = rest.join(" ") || "";

  return NextResponse.json({
    ...updated,
    first_name,
    last_name,
    status: "new_visitor",
    journey_stage: "stage_1_welcome",
    is_at_risk: false,
    created_date: updated.createdAt,
  });
}
