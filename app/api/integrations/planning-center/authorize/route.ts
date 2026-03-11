/**
 * GET /api/integrations/planning-center/authorize
 * Redirect church admin to Planning Center OAuth.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

const PCO_AUTH = "https://api.planningcenteronline.com/oauth/authorize";

export async function GET(_req: NextRequest) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const clientId = process.env.PLANNING_CENTER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Planning Center not configured" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.stewardos.cc";
  const redirectUri = `${baseUrl}/api/integrations/planning-center/callback`;

  await prisma.integrationConfig.upsert({
    where: { churchId_provider: { churchId: church.id, provider: "planningcenter" } },
    create: {
      churchId: church.id,
      provider: "planningcenter",
      status: "pending",
    },
    update: {},
  });

  const state = Buffer.from(JSON.stringify({ churchId: church.id })).toString("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "people services groups giving check_ins registrations",
    state,
  });

  return NextResponse.redirect(`${PCO_AUTH}?${params}`);
}
