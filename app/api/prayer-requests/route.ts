/**
 * Prayer requests — Public POST, Authenticated GET
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { analyzePrayerRequest } from "@/lib/analyzePrayerRequest";

export async function GET(_req: NextRequest) {
  let ctx;
  try {
    ctx = await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  const requests = await prisma.prayerRequest.findMany({
    where: { churchId: church.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { church_id, church_slug, content, request_text, submitter_name, submitter_email, submitter_phone, is_anonymous } = body;

    const text = request_text || content || "";
    if (!text.trim()) {
      return NextResponse.json({ error: "Prayer request text is required" }, { status: 400 });
    }

    let churchId = church_id;
    if (!churchId && church_slug) {
      const church = await prisma.church.findFirst({ where: { slug: church_slug } });
      if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });
      churchId = church.id;
    }
    if (!churchId) {
      const defaultChurch = await prisma.church.findFirst({ orderBy: { name: "asc" } });
      churchId = defaultChurch?.id;
    }
    if (!churchId) {
      return NextResponse.json({ error: "No church configured" }, { status: 400 });
    }

    const fullContent = [
      text,
      is_anonymous ? "" : [submitter_name, submitter_email, submitter_phone].filter(Boolean).join(" | "),
    ]
      .filter(Boolean)
      .join("\n---\n");

    const pr = await prisma.prayerRequest.create({
      data: {
        churchId,
        content: fullContent,
        requestText: text.trim(),
        submitterName: is_anonymous ? null : (submitter_name?.trim() || null),
        submitterEmail: is_anonymous ? null : (submitter_email?.trim() || null),
        submitterPhone: is_anonymous ? null : (submitter_phone?.trim() || null),
        isAnonymous: !!is_anonymous,
        status: "new",
      },
    });

    // Fire-and-forget AI analysis
    analyzePrayerRequest(pr.id).catch((err) =>
      console.error("Background prayer analysis failed:", err)
    );

    return NextResponse.json({ success: true, id: pr.id });
  } catch (e) {
    console.error("Prayer request error:", e);
    return NextResponse.json({ error: "Failed to submit prayer request" }, { status: 500 });
  }
}
