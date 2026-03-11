/**
 * StewardOS Invites — Send invite (admin only)
 * POST /api/invites
 *
 * Creates invite record with 7-day expiry, sends email via Resend.
 */

import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.stewardos.cc";

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminOrPastor(ctx)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ invites: [], users: [] });
  }

  const [invites, users] = await Promise.all([
    prisma.invite.findMany({
      where: { churchId: church.id, acceptedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        campusId: true,
        expiresAt: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { churchId: church.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        campus: { select: { name: true } },
      },
    }),
  ]);
  return NextResponse.json({ invites, users });
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminOrPastor(ctx)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const body = await req.json();
  const { email, inviteRole, campusId } = body;

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const role = ["pastor", "staff", "volunteer"].includes(inviteRole) ? inviteRole : "staff";

  // Check if user already exists in this church
  const existing = await prisma.user.findFirst({
    where: { email: email.trim().toLowerCase(), churchId: church.id },
  });
  if (existing) {
    return NextResponse.json({ error: "User already in your church" }, { status: 400 });
  }

  // Get inviter's User id for invitedById
  const inviter = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      churchId: church.id,
      email: email.trim().toLowerCase(),
      role,
      campusId: campusId || null,
      invitedById: inviter?.id ?? null,
      token,
      expiresAt,
    },
  });

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "StewardOS <noreply@stewardos.cc>",
      to: email.trim(),
      subject: `You've been invited to join ${church.name} on StewardOS`,
      html: `
        <h1>You've been invited to StewardOS</h1>
        <p>You've been invited to join <strong>${church.name}</strong> as a ${role}.</p>
        <p><a href="${APP_URL}/join?token=${invite.token}">Accept your invite</a></p>
        <p>This link expires in 7 days.</p>
      `,
    });
  } catch (e) {
    console.error("Invite email failed:", e);
    await prisma.invite.delete({ where: { id: invite.id } });
    return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
