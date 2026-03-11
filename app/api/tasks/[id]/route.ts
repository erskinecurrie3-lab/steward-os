/**
 * StewardOS Task — Get, update, delete single task
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { notifyVolunteerTaskAssigned } from "@/lib/notifyVolunteerTaskAssigned";

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
  const task = await prisma.task.findFirst({
    where: { id, churchId: church.id },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(task);
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
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const { id } = await params;
  const existing = await prisma.task.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, status, dueDate, assignedVolunteer, assignedVolunteerEmail, campusId } = body;

  const data: {
    title?: string;
    description?: string | null;
    status?: string;
    dueDate?: Date | null;
    assignedVolunteer?: string | null;
    assignedVolunteerEmail?: string | null;
    campusId?: string | null;
    completedAt?: Date | null;
  } = {};
  if (title !== undefined) data.title = String(title).trim();
  if (description !== undefined) data.description = description ? String(description).trim() : null;
  if (status !== undefined) {
    data.status = String(status);
    if (String(status) === "completed" && existing.status !== "completed") {
      data.completedAt = new Date();
    }
  }
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (assignedVolunteer !== undefined)
    data.assignedVolunteer = assignedVolunteer ? String(assignedVolunteer).trim() : null;
  if (assignedVolunteerEmail !== undefined)
    data.assignedVolunteerEmail = assignedVolunteerEmail ? String(assignedVolunteerEmail).trim() : null;
  if (campusId !== undefined) {
    if (campusId) {
      const campus = await prisma.campus.findFirst({
        where: { id: campusId, churchId: church.id },
      });
      data.campusId = campus?.id ?? null;
    } else {
      data.campusId = null;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing);
  }

  const task = await prisma.task.update({
    where: { id },
    data,
  });

  // Notify volunteer when newly assigned
  const volunteerEmailChanged =
    data.assignedVolunteerEmail !== undefined &&
    data.assignedVolunteerEmail !== existing.assignedVolunteerEmail;
  const volunteerNameChanged =
    data.assignedVolunteer !== undefined &&
    data.assignedVolunteer !== existing.assignedVolunteer;
  const justAssigned =
    (volunteerEmailChanged || volunteerNameChanged) &&
    (task.assignedVolunteer || task.assignedVolunteerEmail);

  if (justAssigned && (task.assignedVolunteer || task.assignedVolunteerEmail)) {
    let volunteerEmail: string | null =
      task.assignedVolunteerEmail && typeof task.assignedVolunteerEmail === "string"
        ? String(task.assignedVolunteerEmail).trim()
        : null;
    if (!volunteerEmail) {
      if (task.assignedVolunteer?.includes("@")) {
        volunteerEmail = task.assignedVolunteer;
      } else {
        const user = await prisma.user.findFirst({
          where: {
            churchId: church.id,
            OR: [
              { fullName: { equals: task.assignedVolunteer ?? "", mode: "insensitive" } },
              { email: { equals: task.assignedVolunteer ?? "", mode: "insensitive" } },
            ],
          },
          select: { email: true },
        });
        volunteerEmail = user?.email ?? null;
      }
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
  const existing = await prisma.task.findFirst({
    where: { id, churchId: church.id },
  });

  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
