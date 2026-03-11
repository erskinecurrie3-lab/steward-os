/**
 * AI content generation for resource descriptions, training docs, etc.
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
  const prompt = body.prompt || body.prompt_text;
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const fullPrompt = `You are a church content creator. Generate the following for a church resource library: ${prompt.trim()}. Make it professional, warm, and practical.`;

  const result = await invokeLLM<string>({
    prompt: fullPrompt,
    systemPrompt: "You are a helpful church content creator. Write in a warm, professional, and practical tone. Return plain text, not JSON.",
    responseFormat: "text",
  });

  return NextResponse.json({ content: result });
}
