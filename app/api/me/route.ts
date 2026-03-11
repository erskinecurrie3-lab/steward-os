/**
 * GET /api/me — Current user's role and campus for the active org.
 * Used by useCampusFilter for campus-scoped data.
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    role: ctx.dbRole ?? "staff",
    campusId: ctx.dbCampusId,
    isAdminOrPastor: ctx.isAdminOrPastor,
  });
}
