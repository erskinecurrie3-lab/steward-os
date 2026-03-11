/**
 * AI message generation — follow-up message for a guest
 */

import { NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { invokeLLM } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    await requireChurchWithUser();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, journeyStage, spiritualBackground, familyStatus } = body;

  const prompt = `Write a warm, personalized follow-up message (email or text) for a church guest named ${firstName} ${lastName}. 
They are in the "${journeyStage}" stage of their visitor journey. 
Their spiritual background: ${spiritualBackground || "unknown"}. 
Family status: ${familyStatus || "unknown"}.
Tone: pastoral, warm, genuine. Not salesy. 3-4 sentences max. Start with their first name.`;

  try {
    const result = await invokeLLM<string>({
      prompt,
      systemPrompt: "You are a pastoral church communicator. Write warm, genuine messages. Return plain text only.",
      responseFormat: "text",
    });
    return NextResponse.json({ message: result });
  } catch (e) {
    console.error("AI generate-message:", e);
    return NextResponse.json({ error: "Failed to generate message" }, { status: 500 });
  }
}
