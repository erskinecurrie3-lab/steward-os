/**
 * Notification preferences — get and update per-user
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

type NotificationPrefs = Record<string, boolean>;

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const user = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ preferences: {} });

  const u = await prisma.user.findFirst({
    where: { id: user.id },
    select: { notificationPreferences: true },
  });
  const prefs = (u?.notificationPreferences as NotificationPrefs) ?? {};
  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const body = await req.json();
  const preferences = body.preferences;
  if (!preferences || typeof preferences !== "object") {
    return NextResponse.json({ error: "preferences required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({
    where: { id: user.id },
    data: { notificationPreferences: preferences },
  });

  return NextResponse.json({ preferences });
}
