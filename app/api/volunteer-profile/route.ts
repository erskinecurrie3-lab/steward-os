/**
 * Volunteer profile — get and update availability, skills, etc.
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";

type VolunteerProfile = {
  availability_days?: string[];
  preferred_contact_method?: string;
  max_guests?: number;
  skills?: string[];
  notes?: string;
  is_available?: boolean;
};

export async function GET() {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const user = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
    select: { volunteerProfile: true },
  });

  const profile = (user?.volunteerProfile as VolunteerProfile) ?? {};
  return NextResponse.json({ volunteer_profile: profile });
}

export async function PATCH(req: Request) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const body = await req.json();
  const vp = body.volunteer_profile as VolunteerProfile | undefined;
  if (!vp || typeof vp !== "object") {
    return NextResponse.json({ error: "volunteer_profile required" }, { status: 400 });
  }

  const profile: VolunteerProfile = {
    availability_days: Array.isArray(vp.availability_days) ? vp.availability_days : [],
    preferred_contact_method: typeof vp.preferred_contact_method === "string" ? vp.preferred_contact_method : "call",
    max_guests: typeof vp.max_guests === "number" ? vp.max_guests : 5,
    skills: Array.isArray(vp.skills) ? vp.skills : [],
    notes: typeof vp.notes === "string" ? vp.notes : "",
    is_available: typeof vp.is_available === "boolean" ? vp.is_available : true,
  };

  const user = await prisma.user.findFirst({
    where: { clerkUserId: ctx.userId, churchId: church.id },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({
    where: { id: user.id },
    data: { volunteerProfile: profile },
  });

  return NextResponse.json({ volunteer_profile: profile });
}
