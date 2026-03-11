/**
 * AI prayer request analysis — shared logic for analyze route and background trigger
 */

import { prisma } from "@/lib/db";
import { invokeLLM } from "@/lib/openai";

function parsePrayerContent(content: string): { request_text: string; submitter_name?: string; is_anonymous: boolean } {
  const parts = content.split("\n---\n");
  const text = parts[0]?.trim() || "";
  const meta = parts[1]?.trim() || "";
  const [submitter_name] = meta.split(" | ");
  return {
    request_text: text,
    submitter_name: submitter_name || undefined,
    is_anonymous: !meta.trim(),
  };
}

export async function analyzePrayerRequest(prayerRequestId: string): Promise<void> {
  const pr = await prisma.prayerRequest.findFirst({
    where: { id: prayerRequestId },
  });

  if (!pr) return;

  const requestText = pr.requestText || parsePrayerContent(pr.content).request_text;
  const submitterName = pr.submitterName ?? parsePrayerContent(pr.content).submitter_name;
  const isAnonymous = pr.isAnonymous ?? parsePrayerContent(pr.content).is_anonymous;

  const prompt = `You are a compassionate pastoral care AI assistant. Analyze this prayer request and provide guidance for the pastoral team.

Prayer request: "${requestText}"
Submitted by: ${isAnonymous ? "Anonymous" : submitterName || "Unknown"}

Analyze and return:
- category: one of [health, family, grief, spiritual_growth, financial, relationships, work, crisis, praise, other]
- urgency: 
  * "critical" = immediate danger, mental health crisis, suicidal ideation, domestic violence, severe grief
  * "high" = serious illness, major life crisis, acute emotional distress
  * "medium" = significant but not immediate concern (job loss, family conflict, health concerns)
  * "low" = general prayer, praise, routine support
- summary: 1-2 sentence compassionate summary of the need (not repeating their words verbatim)
- follow_up_action: specific, actionable pastoral recommendation (e.g. "Schedule a personal call within 24 hours to check in and offer support", "Send a handwritten note with scripture encouragement this week")
- suggested_responder: "senior_pastor" | "care_team" | "volunteer" | "counselor" — based on urgency and category
- care_scriptures: array of 1-2 relevant, comforting scripture references (e.g. "Psalm 46:1", "Philippians 4:6-7")

Return ONLY valid JSON matching this schema. Be pastoral, warm, and practical.`;

  const aiResult = await invokeLLM<{
    category?: string;
    urgency?: string;
    summary?: string;
    follow_up_action?: string;
    suggested_responder?: string;
    care_scriptures?: string[];
  }>({ prompt });

  const scripturesSuffix =
    aiResult.care_scriptures?.length && aiResult.care_scriptures.length > 0
      ? ` | Scriptures: ${aiResult.care_scriptures.join(", ")}`
      : "";
  const aiFollowUpAction = `${aiResult.follow_up_action || ""}${scripturesSuffix}`.trim();

  await prisma.prayerRequest.update({
    where: { id: prayerRequestId },
    data: {
      category: aiResult.category || "other",
      urgency: aiResult.urgency || "medium",
      aiSummary: aiResult.summary ?? null,
      aiFollowUpAction: aiFollowUpAction || null,
      aiSuggestedResponder: aiResult.suggested_responder ?? null,
    },
  });
}
