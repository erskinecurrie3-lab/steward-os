/**
 * StewardOS Church — Get/Update church profile
 * GET — fetch church profile (admin or member)
 * PATCH — update church profile (admin only)
 */

import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

const ALLOWED_PATCH_FIELDS = [
  "name",
  "denomination",
  "timezone",
  "logoUrl",
  "primaryColor",
  "websiteUrl",
  "address",
  "churchSettings",
] as const;

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: church.id,
    name: church.name,
    slug: church.slug,
    denomination: church.denomination,
    timezone: church.timezone,
    logoUrl: church.logoUrl,
    primaryColor: church.primaryColor,
    websiteUrl: church.websiteUrl,
    address: church.address,
    plan: church.plan,
    churchSettings: church.churchSettings as Record<string, unknown> | null,
  });
}

export async function PATCH(req: Request) {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminOrPastor(ctx)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_PATCH_FIELDS.includes(k as (typeof ALLOWED_PATCH_FIELDS)[number]))
  );

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(church);
  }

  const updated = await prisma.church.update({
    where: { id: church.id },
    data: updates,
  });

  return NextResponse.json(updated);
}
