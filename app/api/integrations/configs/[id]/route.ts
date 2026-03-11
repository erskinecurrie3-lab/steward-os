/**
 * IntegrationConfig — Update, delete
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const { id } = await params;
  const config = await prisma.integrationConfig.findFirst({
    where: { id, churchId: church.id },
  });
  if (!config) return NextResponse.json({ error: "Integration not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.syncEnabled === "boolean") data.syncEnabled = body.syncEnabled;
  if (typeof body.syncIntervalMinutes === "number") data.syncIntervalMinutes = body.syncIntervalMinutes;

  const updated = await prisma.integrationConfig.update({
    where: { id },
    data,
    select: {
      id: true,
      provider: true,
      status: true,
      syncEnabled: true,
      syncIntervalMinutes: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      lastError: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const { id } = await params;
  const config = await prisma.integrationConfig.findFirst({
    where: { id, churchId: church.id },
  });
  if (!config) return NextResponse.json({ error: "Integration not found" }, { status: 404 });

  await prisma.integrationConfig.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
