/**
 * StewardOS Super-Admin — Access control for Erskine
 *
 * Set in Clerk Dashboard → User → Public Metadata:
 *   { "is_superadmin": true }
 */

import { auth } from "@clerk/nextjs/server";

export async function requireSuperAdmin(): Promise<{ userId: string }> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isSuperAdmin =
    superAdminIds.includes(userId) ||
    (sessionClaims?.is_superadmin as string) === "true" ||
    (sessionClaims?.is_superadmin as boolean) === true;

  if (!isSuperAdmin) {
    throw new Response(JSON.stringify({ error: "Super-admin only" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { userId };
}
