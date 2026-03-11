/**
 * StewardOS Tasks — List and create
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { notifyVolunteerTaskAssigned } from "@/lib/notifyVolunteerTaskAssigned";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  let campusId: string | null = null;
  if (ctx.isAdminOrPastor) {
    const q = req.nextUrl.searchParams.get("campusId");
    if (q && q !== "all") campusId = q;
  } else {
    campusId = ctx.dbCampusId;
  }

  const tasks = await prisma.task.findMany({
    where: {
      churchId: church.id,
      ...(campusId ? { campusId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    title,
    description,
    status,
    dueDate,
    assignedVolunteer,
    assignedVolunteerEmail,
    taskType,
    priority,
    guestId,
    guestName,
    guestEmail,
    campusId,
  } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let validCampusId: string | null = null;
  let validGuestId: string | null = null;
  if (campusId) {
    const campus = await prisma.campus.findFirst({
      where: { id: campusId, churchId: church.id },
    });
    if (campus) validCampusId = campus.id;
  }
  if (guestId) {
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, churchId: church.id },
    });
    if (guest) validGuestId = guest.id;
  }

  const task = await prisma.task.create({
    data: {
      churchId: church.id,
      campusId: validCampusId,
      guestId: validGuestId,
      title: title.trim(),
      description: description?.trim() || null,
      status: status || "pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedVolunteer: assignedVolunteer?.trim() || null,
      assignedVolunteerEmail: assignedVolunteerEmail?.trim() || null,
      taskType: taskType || "general",
      priority: priority || "normal",
      guestName: guestName?.trim() || null,
      guestEmail: guestEmail?.trim() || null,
    },
  });

  // Notify volunteer when task is created with assignment
  if (task.assignedVolunteer || task.assignedVolunteerEmail) {
    let volunteerEmail: string | null = task.assignedVolunteerEmail?.trim() || null;
    if (!volunteerEmail && task.assignedVolunteer?.includes("@")) {
      volunteerEmail = task.assignedVolunteer;
    } else if (!volunteerEmail && task.assignedVolunteer) {
      const user = await prisma.user.findFirst({
        where: {
          churchId: church.id,
          OR: [
            { fullName: { equals: task.assignedVolunteer, mode: "insensitive" } },
            { email: { equals: task.assignedVolunteer, mode: "insensitive" } },
          ],
        },
        select: { email: true },
      });
      volunteerEmail = user?.email ?? null;
    }
    if (volunteerEmail) {
      notifyVolunteerTaskAssigned(
        volunteerEmail,
        task.assignedVolunteer || "Volunteer",
        {
          title: task.title,
          taskType: task.taskType,
          guestName: task.guestName,
          guestEmail: task.guestEmail,
          dueDate: task.dueDate,
          priority: task.priority,
          notes: task.description,
        }
      ).catch((e) => console.error("notifyVolunteerTaskAssigned:", e));
    }
  }

  return NextResponse.json(task);
}
