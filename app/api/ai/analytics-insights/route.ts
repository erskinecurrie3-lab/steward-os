/**
 * AI analytics insights — summarize guest/care data
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

  const body = await req.json().catch(() => ({}));
  const { summary } = body;

  const prompt = `You are a church analytics advisor. Based on this church's data summary, provide 3-4 concise, actionable insights (1-2 sentences each). Be pastoral and practical. Focus on retention, at-risk guests, and care coverage.

Summary:
${summary || "No data provided"}

Return a JSON object with an "insights" array of strings. Example: {"insights": ["Insight 1...", "Insight 2..."]}`;

  try {
    const result = await invokeLLM<{ insights?: string[] }>({ prompt });
    return NextResponse.json({
      insights: result.insights || [],
    });
  } catch (e) {
    console.error("AI analytics-insights:", e);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
