/**
 * IntegrationConfig — List and create church integrations
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const configs = await prisma.integrationConfig.findMany({
    where: { churchId: church.id },
    orderBy: { provider: "asc" },
    select: {
      id: true,
      provider: true,
      status: true,
      syncEnabled: true,
      syncIntervalMinutes: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      lastError: true,
      webhookUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json(configs);
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const body = await req.json();
  const { provider } = body;

  const PROVIDERS = [
    "planningcenter", "pushpay", "subsplash", "breeze", "rockrms",
    "tithely", "mailchimp", "twilio", "zapier",
  ];
  if (!provider || !PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const existing = await prisma.integrationConfig.findFirst({
    where: { churchId: church.id, provider },
  });
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const config = await prisma.integrationConfig.create({
    data: {
      churchId: church.id,
      provider,
      status: "pending",
    },
    select: {
      id: true,
      provider: true,
      status: true,
      syncEnabled: true,
      syncIntervalMinutes: true,
      createdAt: true,
    },
  });

  return NextResponse.json(config, { status: 201 });
}
