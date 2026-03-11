/**
 * POST /api/integrations/planning-center/sync-groups
 * Sync Planning Center Groups to StewardOS Group model.
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { syncGroups } from "@/lib/planningCenter";

export async function POST() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  try {
    const result = await syncGroups(church.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[PlanningCenter sync-groups]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Groups sync failed" },
      { status: 500 }
    );
  }
}
