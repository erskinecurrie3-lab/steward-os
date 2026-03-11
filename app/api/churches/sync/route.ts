/**
 * Sync Church from Clerk Organization.
 * Call when user first accesses dashboard with an org — ensures Church row exists.
 */

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireChurch } from "@/lib/auth";
import { syncChurch } from "@/lib/church";

export async function POST() {
  const ctx = await requireChurch();

  const client = await clerkClient();
  const org = await client.organizations.getOrganization({
    organizationId: ctx.orgId,
  });

  const church = await syncChurch(ctx.churchId, org.name);
  if (!church) {
    return NextResponse.json(
      { error: "Could not sync church. Ensure org exists in Clerk." },
      { status: 400 }
    );
  }

  return NextResponse.json({ church: { id: church.id, name: church.name } });
}
