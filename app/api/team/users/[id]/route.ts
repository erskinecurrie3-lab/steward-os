/**
 * PATCH /api/team/users/[id] — Update member role (admin only)
 */

import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

function toClerkOrgRole(role: string): "org:admin" | "org:member" {
  return role === "admin" || role === "pastor" ? "org:admin" : "org:member";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminOrPastor(ctx)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church?.clerkOrgId) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const body = await req.json();
  const { role } = body;
  const validRoles = ["admin", "pastor", "staff", "volunteer"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Use: admin, pastor, staff, volunteer" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id, churchId: church.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data: { role },
  });

  const client = await clerkClient();
  await client.organizations.updateOrganizationMembership({
    organizationId: church.clerkOrgId,
    userId: user.clerkUserId,
    role: toClerkOrgRole(role),
  });

  return NextResponse.json({ success: true, role });
}
