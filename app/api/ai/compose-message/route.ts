/**
 * AI Message Composer — Generate personalized follow-up for any guest
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { invokeLLM } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    first_name,
    spiritual_background,
    family_status,
    journey_stage,
    channel,
    context,
  } = body;

  const guestName = first_name || "[Guest]";
  const bg = (spiritual_background || "returning").replace(/_/g, " ");
  const fam = (family_status || "unknown").replace(/_/g, " ");
  const stage = (journey_stage || "stage_1_welcome").replace(/_/g, " ");
  const ch = channel === "sms" ? "sms" : "email";
  const extra = context?.trim() || "standard follow-up";

  const prompt =
    ch === "sms"
      ? `Write a personalized church follow-up text message (under 160 characters) for a guest.
Guest: ${guestName}, background: ${bg}, family: ${fam}, stage: ${stage}.
Extra: ${extra}.
Tone: warm, genuine, pastoral — not salesy. Under 160 chars, casual.`
      : `Write a personalized church follow-up email for a guest.
Guest: ${guestName}, background: ${bg}, family: ${fam}, stage: ${stage}.
Extra: ${extra}.
Tone: warm, genuine, pastoral — not salesy. Include subject line prefixed 'Subject: '.`;

  const result = await invokeLLM<string>({
    prompt,
    systemPrompt:
      "You are a warm, pastoral church communicator. Write genuine, caring messages — never salesy or generic.",
    responseFormat: "text",
  });

  return NextResponse.json({ result: result?.trim() ?? "" });
}
