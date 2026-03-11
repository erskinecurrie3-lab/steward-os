/**
 * AI volunteer matching — suggest volunteers for a guest
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { invokeLLM } from "@/lib/openai";

type Suggestion = { volunteer_email: string; volunteer_name: string; fit_score: number; reason: string };

export async function POST(req: Request) {
  try {
    await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { guest, volunteers } = body;
  if (!guest || !Array.isArray(volunteers)) {
    return NextResponse.json({ error: "guest and volunteers required" }, { status: 400 });
  }

  const prompt = `You are helping a church match the right volunteer with a guest who needs pastoral care.

Guest profile:
- Name: ${guest.first_name} ${guest.last_name}
- Status: ${guest.status}
- Journey stage: ${guest.journey_stage?.replace?.(/_/g, " ") ?? "unknown"}
- Spiritual background: ${guest.spiritual_background || "unknown"}
- Family status: ${guest.family_status || "unknown"}
- Is at-risk: ${guest.is_at_risk}
- Notes: ${guest.notes || "none"}

Available volunteers (name, skills/availability from their profile):
${volunteers.map((v: { full_name?: string; email?: string; role?: string }, i: number) => `${i + 1}. ${v.full_name || v.email} - Role: ${v.role || "volunteer"}`).join("\n")}

Rank the top 2 volunteers for this guest and explain why. Return JSON with "suggestions" array, each having: "volunteer_email", "volunteer_name", "fit_score" (1-10), "reason" (1 sentence).`;

  try {
    const result = await invokeLLM<{ suggestions: Suggestion[] }>({ prompt });
    return NextResponse.json(result);
  } catch (e) {
    console.error("AI volunteer-suggestions:", e);
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
  }
}
