/**
 * StewardOS — AI-powered follow-up task generation
 */

import { NextRequest, NextResponse } from "next/server";
import { requireChurchWithUser } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { invokeLLM } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    // Clerk auth check at the top
    let ctx;
    try {
      ctx = await requireChurchWithUser();
    } catch (e) {
      return e instanceof Response
        ? e
        : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const church = await getChurchByClerkOrg(ctx.churchId);
    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    await req.json().catch(() => ({}));
    // Always use church.id from server (client may send orgId as church_id)
    const church_id = church.id;

    const now = new Date();

    // Fetch guests for this church
    const guests = await prisma.guest.findMany({
      where: { churchId: church_id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Filter guests that need follow-up — IDENTICAL logic
    const needsFollowUp = guests.filter((g) => {
      const lastSeen = g.lastSeen;
      if (!lastSeen)
        return (
          g.journeyStage === "stage_1_welcome" || g.journeyStage === "stage_2_connect"
        );
      const daysSinceSeen =
        (now.getTime() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSeen >= 14; // 2+ weeks not seen
    });

    if (needsFollowUp.length === 0) {
      return NextResponse.json({
        tasks_created: 0,
        message: "No guests need follow-up at this time.",
      });
    }

    // Fetch existing pending tasks to avoid duplicates
    const existingTasks = await prisma.task.findMany({
      where: { churchId: church_id, status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    const existingGuestIds = new Set(existingTasks.map((t) => t.guestId).filter(Boolean));

    const guestsToProcess = needsFollowUp
      .filter((g) => !existingGuestIds.has(g.id))
      .slice(0, 10);

    if (guestsToProcess.length === 0) {
      return NextResponse.json({
        tasks_created: 0,
        message: "All flagged guests already have pending tasks.",
      });
    }

    // Use AI to generate personalized task suggestions — IDENTICAL prompt
    const guestSummaries = guestsToProcess.map((g) => ({
        id: g.id,
        name: g.name,
        stage: g.journeyStage,
        last_seen: g.lastSeen,
        spiritual_background: g.spiritualBackground,
        family_status: g.familyStatus,
        notes: g.notes?.substring(0, 200),
      }));

    const aiResult = await invokeLLM<{
      tasks?: Array<{
        guest_id: string;
        title: string;
        task_type?: string;
        priority?: string;
        description?: string;
        ai_message?: string;
      }>;
    }>({
      prompt: `You are a church care coordinator AI. For each guest below, generate a personalized follow-up task for a volunteer.
      
Guests:
${JSON.stringify(guestSummaries, null, 2)}

Journey stages:
- stage_1_welcome: Brand new visitor (warm welcome outreach)
- stage_2_connect: Getting connected (invite to small group/event)
- stage_3_grow: Growing in faith (discipleship resources)
- stage_4_serve: Ready to serve (connect to ministry)
- stage_5_belong: Full member

Rules:
- If last_seen > 21 days: task_type = "send_email" or "send_sms" for a warm reconnect
- If last_seen 14-21 days: task_type = "follow_up_call"
- stage_1_welcome or stage_2_connect with no last_seen: task_type = "send_email"
- Priority: if not seen in 21+ days = "high", 14-21 days = "normal"
- Generate a short personalized message (2-3 sentences) the volunteer can send

Return JSON: {"tasks": [{"guest_id": "...", "title": "...", "task_type": "send_email|send_sms|follow_up_call|personal_visit|prayer|general", "priority": "low|normal|high|urgent", "description": "...", "ai_message": "Personalized message volunteer can send..."}]}`,
      systemPrompt:
        'You are a church care coordinator AI. Return ONLY valid JSON: {"tasks": [{"guest_id": "...", "title": "...", "task_type": "send_email|send_sms|follow_up_call|personal_visit|prayer|general", "priority": "low|normal|high|urgent", "description": "...", "ai_message": "..."}]}',
    });

    const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const guestMap = new Map(guestsToProcess.map((g) => [g.id, g]));
    let tasksCreated = 0;

    for (const t of aiResult.tasks ?? []) {
      const guest = guestMap.get(t.guest_id);
      if (!guest) continue;

      await prisma.task.create({
        data: {
          churchId: church_id,
          guestId: t.guest_id,
          guestName: guest.name,
          guestEmail: guest.email ?? null,
          title: t.title,
          taskType: t.task_type || "follow_up_call",
          priority: t.priority || "normal",
          description: t.description ?? null,
          aiMessageSent: t.ai_message ?? null,
          status: "pending",
          dueDate,
        },
      });
      tasksCreated++;
    }

    console.log(
      `Generated ${tasksCreated} follow-up tasks for church ${church_id}`
    );
    return NextResponse.json({
      tasks_created: tasksCreated,
      guests_processed: guestsToProcess.length,
    });
  } catch (error) {
    console.error("generateFollowUpTasks error:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
