/**
 * Church sync — Clerk org ↔ Church row
 * churchId in API = Clerk orgId. We look up Church by clerkOrgId.
 */

import { prisma } from "@/lib/db";

/** Get Church by Clerk org ID. Returns null if not synced yet. */
export async function getChurchByClerkOrg(clerkOrgId: string) {
  return prisma.church.findUnique({
    where: { clerkOrgId },
    include: { campuses: { select: { id: true, name: true } } },
  });
}

/** Create slug from church name (e.g. "Lakewood Church" -> "lakewood-church") */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Create Church row when Clerk org is first used. Call from dashboard or webhook. */
export async function syncChurch(clerkOrgId: string, name: string) {
  const slug = slugify(name) || "church-" + Date.now();
  return prisma.church.upsert({
    where: { clerkOrgId },
    create: { clerkOrgId, name, slug },
    update: { name, slug },
  });
}
