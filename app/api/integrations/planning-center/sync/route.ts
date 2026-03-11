/**
 * POST /api/integrations/planning-center/sync
 * Trigger Planning Center people sync for the current church.
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { syncPeople } from "@/lib/planningCenter";

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
    const result = await syncPeople(church.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[PlanningCenter sync]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
