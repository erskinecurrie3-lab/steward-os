/**
 * GET /api/integrations/planning-center/callback
 * OAuth callback - exchange code for tokens, store in IntegrationConfig.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const TOKEN_URL = "https://api.planningcenteronline.com/oauth/token";
const USER_AGENT = "StewardOS (https://stewardos.cc)";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("[PlanningCenter callback]", error, searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/dashboard/integrations?error=planning_center_denied", req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=planning_center_invalid", req.url));
  }

  let churchId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString()) as { churchId: string };
    churchId = decoded.churchId;
  } catch {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=planning_center_state", req.url));
  }

  const clientId = process.env.PLANNING_CENTER_CLIENT_ID;
  const clientSecret = process.env.PLANNING_CENTER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("[PlanningCenter callback] Missing PLANNING_CENTER_CLIENT_ID or PLANNING_CENTER_CLIENT_SECRET");
    return NextResponse.redirect(new URL("/dashboard/integrations?error=config", req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.stewardos.cc";
  const redirectUri = `${baseUrl}/api/integrations/planning-center/callback`;

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error("[PlanningCenter callback] Token exchange failed:", tokenRes.status, body);
    return NextResponse.redirect(new URL("/dashboard/integrations?error=planning_center_token", req.url));
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const expiresAt = new Date(Date.now() + (tokenData.expires_in - 60) * 1000);

  await prisma.integrationConfig.upsert({
    where: { churchId_provider: { churchId, provider: "planningcenter" } },
    create: {
      churchId,
      provider: "planningcenter",
      status: "connected",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      lastError: null,
    },
    update: {
      status: "connected",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      lastError: null,
    },
  });

  return NextResponse.redirect(new URL("/dashboard/integrations?planning_center=connected", req.url));
}
