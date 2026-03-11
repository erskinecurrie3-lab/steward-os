/**
 * Process AI fallback for overdue/declined tasks.
 * Call via cron (e.g. every 6 hours): POST /api/cron/process-ai-fallback
 * Auth: Authorization: Bearer <CRON_SECRET> or x-cron-secret header
 */

import { NextResponse } from "next/server";
import { runAiFallback } from "@/lib/runAiFallback";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = req.headers.get("x-cron-secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { processed, results } = await runAiFallback();
    return NextResponse.json({ processed, results });
  } catch (error) {
    console.error("process-ai-fallback error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
