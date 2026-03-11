/**
 * Process due send_email tasks from email sequences.
 * Call via cron (e.g. every 15 min): POST /api/cron/process-email-tasks
 * Auth: Authorization: Bearer <CRON_SECRET> or x-cron-secret header
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = req.headers.get("x-cron-secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const tasks = await prisma.task.findMany({
    where: {
      taskType: "send_email",
      status: "pending",
      dueDate: { lte: now },
      guestEmail: { not: null },
    },
    take: 50,
  });

  const results: Array<{ task_id: string; status: string; error?: string }> = [];

  for (const task of tasks) {
    try {
      const desc = task.description || "";
      const lines = desc.split("\n");
      const subjectLine = lines[0]?.startsWith("Subject:")
        ? lines[0].replace("Subject:", "").trim()
        : task.title;
      const body = lines[0]?.startsWith("Subject:")
        ? lines.slice(2).join("\n").trim()
        : desc;

      await sendEmail({
        to: task.guestEmail!,
        subject: subjectLine,
        body,
      });

      await prisma.task.update({
        where: { id: task.id },
        data: { status: "completed", completedAt: now },
      });

      results.push({ task_id: task.id, status: "sent" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`Failed to send email for task ${task.id}:`, msg);
      results.push({ task_id: task.id, status: "error", error: msg });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
