/**
 * StewardOS Guests — CRUD with plan limit enforcement
 * GET — list guests for church (campus-scoped for staff/volunteer)
 * POST — create guest (enforces plan member limit)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  // Staff/volunteer: always filter to their campus
  // Admin/pastor: filter by query param campusId if provided
  let campusId: string | null = null;
  if (ctx.isAdminOrPastor) {
    const q = req.nextUrl.searchParams.get("campusId");
    if (q && q !== "all") campusId = q;
  } else {
    campusId = ctx.dbCampusId;
  }

  const guests = await prisma.guest.findMany({
    where: {
      churchId: church.id,
      ...(campusId ? { campusId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { campus: { select: { name: true } } },
  });

  return NextResponse.json(guests);
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  // Enforce plan limit before creating
  const guestCount = await prisma.guest.count({
    where: { churchId: church.id },
  });
  const limit = church.planMemberLimit ?? 200;

  if (guestCount >= limit) {
    return NextResponse.json(
      {
        error: "Member limit reached",
        upgrade_url: "/dashboard/settings/billing",
        current_plan: church.plan,
      },
      { status: 402 }
    );
  }

  const body = await req.json();
  const { name, email, phone, notes, campusId } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  // Validate campusId belongs to church if provided
  let validCampusId: string | null = null;
  if (campusId) {
    const campus = await prisma.campus.findFirst({
      where: { id: campusId, churchId: church.id },
    });
    if (campus) validCampusId = campus.id;
  }

  const guest = await prisma.guest.create({
    data: {
      churchId: church.id,
      campusId: validCampusId,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  // Trigger email sequence enrollment (replaces sendGuestEmailSequence function)
  if (guest.email) {
    await enrollInEmailSequence(guest).catch(() => {});
  }

  return NextResponse.json(guest, { status: 201 });
}

/**
 * Enrollment in email sequence — replaces sendGuestEmailSequence Deno function.
 * Fetches active FollowUpSequence steps, sends Day 0 immediately or creates Task for future sends.
 */
async function enrollInEmailSequence(guest: {
  id: string;
  churchId: string;
  campusId: string | null;
  name: string;
  email: string | null;
}) {
  if (!guest.email?.trim()) return;

  const sequences = await prisma.followUpSequence.findMany({
    where: {
      churchId: guest.churchId,
      triggerType: "new_visitor_email_sequence",
      isActive: true,
    },
    orderBy: { delayDays: "asc" },
  });

  if (!sequences.length) {
    // Fallback: send one welcome email if no sequences configured
    const firstName = guest.name?.split(/\s+/)[0] || "Friend";
    await sendEmail({
      to: guest.email,
      subject: "Welcome! We're glad you're here",
      body: `Hi ${firstName},\n\nWe're so glad you joined us. Our team would love to connect with you—reply to this email anytime or give us a call.\n\nBlessings,\nYour Church`,
    });
    return;
  }

  const firstName = guest.name?.split(/\s+/)[0] || "Friend";
  const now = new Date();

  for (const seq of sequences) {
    const personalized = (seq.messageTemplate || "").replace(
      /\{first_name\}/g,
      firstName
    );
    const lines = personalized.split("\n");
    const subjectLine = lines[0]?.startsWith("Subject:")
      ? lines[0].replace("Subject:", "").trim()
      : seq.name;
    const body = lines[0]?.startsWith("Subject:")
      ? lines.slice(2).join("\n").trim()
      : personalized;

    if (seq.delayDays === 0) {
      await sendEmail({ to: guest.email, subject: subjectLine, body });
      continue;
    }

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + seq.delayDays);

    await prisma.task.create({
      data: {
        churchId: guest.churchId,
        campusId: guest.campusId,
        guestId: guest.id,
        title: `[EMAIL SEQUENCE] ${seq.name}`,
        description: `Auto-generated from Email Sequence: "${seq.name}" (Day ${seq.delayDays})\n\nSubject: ${subjectLine}\n\n${body}`,
        taskType: "send_email",
        guestName: guest.name,
        guestEmail: guest.email,
        status: "pending",
        dueDate,
        workflowId: seq.id,
        priority: seq.delayDays <= 1 ? "high" : "normal",
      },
    });
  }
}
