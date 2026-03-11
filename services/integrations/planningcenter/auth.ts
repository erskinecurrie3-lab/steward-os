/**
 * Planning Center OAuth2 flow and token refresh
 * GET  https://api.planningcenteronline.com/oauth/authorize
 * POST https://api.planningcenteronline.com/oauth/token
 */

import { prisma } from "@/lib/db";

const PCO_BASE = "https://api.planningcenteronline.com";
const TOKEN_URL = `${PCO_BASE}/oauth/token`;
const USER_AGENT = "StewardOS (https://stewardos.cc)";

export const PROVIDER = "planningcenter";
export const SCOPES = "people services groups giving check_ins registrations";

export function getAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.PLANNING_CENTER_CLIENT_ID;
  if (!clientId) throw new Error("PLANNING_CENTER_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state,
  });
  return `https://api.planningcenteronline.com/oauth/authorize?${params}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const clientId = process.env.PLANNING_CENTER_CLIENT_ID;
  const clientSecret = process.env.PLANNING_CENTER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PLANNING_CENTER_CLIENT_ID and CLIENT_SECRET required");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(config: {
  id: string;
  churchId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}): Promise<string> {
  const clientId = process.env.PLANNING_CENTER_CLIENT_ID;
  const clientSecret = process.env.PLANNING_CENTER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PLANNING_CENTER_CLIENT_ID and CLIENT_SECRET required");
  }
  if (!config.refreshToken) {
    throw new Error("No refresh token for Planning Center");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: config.refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  const expiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

  await prisma.integrationConfig.update({
    where: { id: config.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      lastError: null,
    },
  });

  return data.access_token;
}

/**
 * Get valid access token, refreshing if expired.
 */
export async function getValidAccessToken(churchId: string): Promise<{
  accessToken: string;
  configId: string;
}> {
  const config = await prisma.integrationConfig.findFirst({
    where: { churchId, provider: PROVIDER },
  });

  if (!config) throw new Error("Planning Center integration not configured");
  if (!config.accessToken || !config.refreshToken) {
    throw new Error("Planning Center integration not connected (missing tokens)");
  }

  const now = new Date();
  const needsRefresh = !config.expiresAt || config.expiresAt <= now;

  let accessToken = config.accessToken;
  if (needsRefresh) {
    accessToken = await refreshAccessToken({
      id: config.id,
      churchId,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      expiresAt: config.expiresAt,
    });
  }

  return { accessToken, configId: config.id };
}
