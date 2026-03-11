/**
 * WebhookLog — List webhook events for church
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const logs = await prisma.webhookLog.findMany({
    where: { churchId: church.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}
