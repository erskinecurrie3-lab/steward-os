/**
 * StewardOS — AI volunteer task fallback (overdue / declined)
 * Manual trigger via POST (requires auth) or via cron.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runAiFallback } from "@/lib/runAiFallback";

export async function POST(_req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { processed, results } = await runAiFallback();
    return NextResponse.json({ processed, results });
  } catch (error) {
    console.error("handleVolunteerTaskFallback error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
