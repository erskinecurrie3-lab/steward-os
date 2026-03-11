/**
 * StewardOS Super-Admin — Impersonate church admin
 * POST /api/super-admin/impersonate
 *
 * Creates Clerk actor token so super-admin can sign in as the target user.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/super-admin";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: actorUserId } = await requireSuperAdmin();

  const body = await req.json();
  const { userId: targetUserId, churchId } = body;

  if (!targetUserId) {
    return NextResponse.json(
      { error: "userId (Clerk user ID to impersonate) is required" },
      { status: 400 }
    );
  }

  // Get church admin's Clerk user ID — or use provided targetUserId if it's the Clerk ID
  let clerkUserId = targetUserId;

  if (churchId) {
    const user = await prisma.user.findFirst({
      where: { churchId, role: "admin" },
      orderBy: { createdAt: "asc" },
    });
    if (user) clerkUserId = user.clerkUserId;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Clerk not configured" }, { status: 500 });
  }

  const response = await fetch("https://api.clerk.com/v1/actor_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: clerkUserId,
      expires_in_seconds: 600,
      actor: { sub: actorUserId },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Clerk actor token failed:", data);
    return NextResponse.json(
      { error: data.errors?.[0]?.message ?? "Impersonation failed" },
      { status: response.status }
    );
  }

  return NextResponse.json({ url: data.url });
}
