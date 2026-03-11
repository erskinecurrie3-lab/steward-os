/**
 * Journey template — get, update, delete
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

export async function GET(
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
  const template = await prisma.journeyTemplate.findFirst({
    where: { id, churchId: church.id },
    include: {
      touchpointList: { orderBy: { orderIndex: "asc" } },
      stages: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

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
  const existing = await prisma.journeyTemplate.findFirst({
    where: { id, churchId: church.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, category, touchpoints, days, touchpointList, stages } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = String(title).trim();
  if (description !== undefined) data.description = description ? String(description).trim() : null;
  if (category !== undefined) data.category = String(category).trim();
  if (touchpoints !== undefined) data.touchpoints = Number(touchpoints);
  if (days !== undefined) data.days = Number(days);

  await prisma.journeyTemplate.update({
    where: { id },
    data: data as never,
  });

  if (Array.isArray(touchpointList)) {
    await prisma.journeyTouchpoint.deleteMany({ where: { journeyTemplateId: id } });
    for (let i = 0; i < touchpointList.length; i++) {
      const tp = touchpointList[i];
      await prisma.journeyTouchpoint.create({
        data: {
          journeyTemplateId: id,
          orderIndex: i,
          title: tp.title?.trim() || `Step ${i + 1}`,
          description: tp.description?.trim() || null,
          type: tp.type || "manual",
          daysOffset: typeof tp.daysOffset === "number" ? tp.daysOffset : 0,
          config: tp.config ?? undefined,
        },
      });
    }
  }

  if (Array.isArray(stages)) {
    await prisma.journeyStage.deleteMany({ where: { journeyTemplateId: id } });
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      await prisma.journeyStage.create({
        data: {
          journeyTemplateId: id,
          orderIndex: i,
          name: s.name?.trim() || `stage_${i + 1}`,
          label: s.label?.trim() || `Stage ${i + 1}`,
          description: s.description?.trim() || null,
        },
      });
    }
  }

  const full = await prisma.journeyTemplate.findUnique({
    where: { id },
    include: {
      touchpointList: { orderBy: { orderIndex: "asc" } },
      stages: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(full);
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
  const existing = await prisma.journeyTemplate.findFirst({
    where: { id, churchId: church.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.journeyTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
