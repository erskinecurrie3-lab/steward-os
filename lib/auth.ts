/**
 * StewardOS Auth — Layer 2: church_id on every request
 *
 * Every API route must call requireChurch() or getChurchId().
 * No church_id = no data. Never trust client-provided churchId.
 */

import { auth } from "@clerk/nextjs/server";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export type ChurchContext = {
  churchId: string;
  userId: string;
  orgId: string;
  role: "org:admin" | "org:member" | string;
};

export type ChurchUserContext = ChurchContext & {
  dbRole: string | null;
  dbCampusId: string | null;
  isAdminOrPastor: boolean;
};

/**
 * Throws 401 if not signed in, 403 if not in an org.
 * Returns church context for the current request.
 * Use this at the top of every API route that needs church-scoped data.
 */
export async function requireChurch(): Promise<ChurchContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!orgId) {
    throw new Response(
      JSON.stringify({ error: "No organization selected. Switch to a church." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return {
    churchId: orgId, // Clerk orgId = churchId
    userId,
    orgId,
    role: (orgRole as string) ?? "org:member",
  };
}

/**
 * Returns church context with DB User role and campusId for campus-scoped filtering.
 * Use for APIs that need to apply campus filters (guests, tasks, events, etc.).
 */
export async function requireChurchWithUser(): Promise<ChurchUserContext> {
  const ctx = await requireChurch();
  const church = await getChurchByClerkOrg(ctx.orgId);
  const dbUser = church
    ? await prisma.user.findFirst({
        where: {
          clerkUserId: ctx.userId,
          churchId: church.id,
        },
        select: { role: true, campusId: true },
      })
    : null;

  const dbRole = dbUser?.role ?? null;
  const dbCampusId = dbUser?.campusId ?? null;
  const isAdminOrPastor = checkIsAdminOrPastor(ctx.role, dbRole);

  return {
    ...ctx,
    dbRole,
    dbCampusId,
    isAdminOrPastor,
  };
}

function checkIsAdminOrPastor(orgRole: string, dbRole: string | null): boolean {
  const o = orgRole?.toLowerCase() ?? "";
  const d = dbRole?.toLowerCase() ?? "";
  return (
    o === "org:admin" ||
    d === "admin" ||
    d === "pastor" ||
    d.includes("admin") ||
    d.includes("pastor")
  );
}

/**
 * Returns church context or null if not authenticated / no org.
 * Use when the route is optional (e.g. public pages).
 */
export async function getChurchOptional(): Promise<ChurchContext | null> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) return null;

  return {
    churchId: orgId,
    userId,
    orgId,
    role: (orgRole as string) ?? "org:member",
  };
}

/**
 * Check if user has admin or pastor role for this church.
 */
export function isAdminOrPastor(ctx: ChurchContext): boolean {
  const role = ctx.role?.toLowerCase() ?? "";
  return (
    role === "org:admin" ||
    role.includes("admin") ||
    role.includes("pastor")
  );
}

/** Require platform admin (super admin or org admin when no super-admins configured). */
export async function requirePlatformAdmin(): Promise<{ userId: string }> {
  const { userId, orgId, orgRole, sessionClaims } = await auth();
  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isSuperAdmin =
    superAdminIds.includes(userId) ||
    sessionClaims?.is_superadmin === true ||
    sessionClaims?.is_superadmin === "true";
  const ctx = { churchId: orgId ?? "", userId, orgId: orgId ?? "", role: (orgRole as string) ?? "" };
  const allowed = isSuperAdmin || (superAdminIds.length === 0 && orgId && isAdminOrPastor(ctx));
  if (!allowed) {
    throw new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { userId };
}
