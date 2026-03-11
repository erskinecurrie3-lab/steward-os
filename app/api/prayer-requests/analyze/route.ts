/**
 * StewardOS — AI prayer request analysis (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { analyzePrayerRequest } from "@/lib/analyzePrayerRequest";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const prayer_request_id = body.prayer_request_id;

    if (!prayer_request_id) {
      return NextResponse.json(
        { error: "prayer_request_id is required" },
        { status: 400 }
      );
    }

    const pr = await prisma.prayerRequest.findFirst({
      where: { id: prayer_request_id },
    });

    if (!pr) {
      return NextResponse.json(
        { error: "Prayer request not found" },
        { status: 404 }
      );
    }

    const church = await prisma.church.findFirst({
      where: { clerkOrgId: orgId, id: pr.churchId },
    });
    if (!church) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await analyzePrayerRequest(prayer_request_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("analyzePrayerRequest error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
