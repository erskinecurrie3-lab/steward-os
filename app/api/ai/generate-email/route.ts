/**
 * AI email generation for follow-up sequences
 * Used by SequenceStepEditor
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { invokeLLM } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    try {
      await requireChurchWithUser();
    } catch (e) {
      return e instanceof Response
        ? e
        : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { day, prompt } = body;

    const resolvedPrompt =
      prompt ||
      `Write a warm, pastoral church follow-up email for a new guest on Day ${day ?? 1} of their visitor journey.
Use {first_name} placeholder. Tone: warm, genuine, pastoral — not salesy or generic.
Format: Start with "Subject: [subject line]" then two blank lines then the email body.
Sign as "The Pastoral Team".`;

    const result = await invokeLLM<string>({
      prompt: resolvedPrompt,
      responseFormat: "text",
    });

    return NextResponse.json({ result });
  } catch (e) {
    console.error("AI generate-email:", e);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
