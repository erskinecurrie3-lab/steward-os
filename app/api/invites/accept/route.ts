/**
 * StewardOS Invites — Accept invite
 * POST /api/invites/accept
 *
 * Validates token, creates User, adds to Clerk org, marks invite accepted.
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function toClerkOrgRole(role: string): "org:admin" | "org:member" {
  return role === "pastor" ? "org:admin" : "org:member";
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const body = await req.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }
  if (invite.acceptedAt) {
    return NextResponse.json({ error: "Already used" }, { status: 400 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 400 });
  }

  const church = await prisma.church.findUnique({ where: { id: invite.churchId } });
  if (!church?.clerkOrgId) {
    return NextResponse.json({ error: "Church not configured" }, { status: 500 });
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  // Create user in DB
  await prisma.user.create({
    data: {
      churchId: invite.churchId,
      campusId: invite.campusId,
      clerkUserId: userId,
      email: invite.email,
      fullName: clerkUser.firstName ?? null,
      role: invite.role,
      invitedById: invite.invitedById,
    },
  });

  // Add to Clerk Org
  try {
    await client.organizations.createOrganizationMembership({
      organizationId: church.clerkOrgId,
      userId,
      role: toClerkOrgRole(invite.role),
    });
  } catch (e) {
    console.error("Clerk org membership failed:", e);
    await prisma.user.deleteMany({
      where: { clerkUserId: userId, churchId: invite.churchId },
    });
    return NextResponse.json({ error: "Failed to add to organization" }, { status: 500 });
  }

  // Update Clerk user metadata
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      church_id: invite.churchId,
      church_name: church.name,
    },
  });

  // Mark invite accepted
  await prisma.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    churchId: invite.churchId,
    orgId: church.clerkOrgId,
  });
}
