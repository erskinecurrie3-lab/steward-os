/**
 * GET /api/super-admin/check — Returns whether current user is super admin
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ isSuperAdmin: false });
  }
  const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isSuperAdmin =
    superAdminIds.includes(userId) ||
    (sessionClaims?.is_superadmin as string) === "true" ||
    (sessionClaims?.is_superadmin as boolean) === true;
  return NextResponse.json({ isSuperAdmin });
}
