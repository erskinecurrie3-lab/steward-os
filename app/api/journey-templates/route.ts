/**
 * Journey templates — list and create
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

  const templates = await prisma.journeyTemplate.findMany({
    where: { churchId: church.id },
    include: {
      touchpointList: { orderBy: { orderIndex: "asc" } },
      stages: { orderBy: { orderIndex: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(templates);
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
  const { title, description, category, touchpoints, days, seedId, campusId, touchpointList, stages } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let validCampusId: string | null = null;
  if (campusId) {
    const campus = await prisma.campus.findFirst({
      where: { id: campusId, churchId: church.id },
    });
    if (campus) validCampusId = campus.id;
  }

  const template = await prisma.journeyTemplate.create({
    data: {
      churchId: church.id,
      campusId: validCampusId,
      title: String(title).trim(),
      description: description?.trim() || null,
      category: category?.trim() || "custom",
      touchpoints: typeof touchpoints === "number" ? touchpoints : 0,
      days: typeof days === "number" ? days : 30,
      seedId: seedId?.trim() || null,
    },
  });

  const tpList = Array.isArray(touchpointList) ? touchpointList : [];
  for (let i = 0; i < tpList.length; i++) {
    const tp = tpList[i];
    await prisma.journeyTouchpoint.create({
      data: {
        journeyTemplateId: template.id,
        orderIndex: i,
        title: tp.title?.trim() || `Step ${i + 1}`,
        description: tp.description?.trim() || null,
        type: tp.type || "manual",
        daysOffset: typeof tp.daysOffset === "number" ? tp.daysOffset : 0,
        config: tp.config ?? undefined,
      },
    });
  }

  const stageList = Array.isArray(stages) ? stages : [];
  for (let i = 0; i < stageList.length; i++) {
    const s = stageList[i];
    await prisma.journeyStage.create({
      data: {
        journeyTemplateId: template.id,
        orderIndex: i,
        name: s.name?.trim() || `stage_${i + 1}`,
        label: s.label?.trim() || `Stage ${i + 1}`,
        description: s.description?.trim() || null,
      },
    });
  }

  const full = await prisma.journeyTemplate.findUnique({
    where: { id: template.id },
    include: {
      touchpointList: { orderBy: { orderIndex: "asc" } },
      stages: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(full);
}
