/**
 * AI task fallback — process overdue/declined tasks with AI-composed messages
 */

import { prisma } from "@/lib/db";
import { invokeLLM } from "@/lib/openai";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/twilio";

export type FallbackResult = { task_id: string; status: string; channel?: string; error?: string };

export async function runAiFallback(): Promise<{ processed: number; results: FallbackResult[] }> {
  const now = new Date();

  const allTasks = await prisma.task.findMany({
    where: { status: { in: ["pending", "assigned", "declined"] } },
    include: { guest: true },
  });

  const overdueTasks = allTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const hoursSinceDue = (now.getTime() - due.getTime()) / (1000 * 60 * 60);
    return task.status === "declined" || hoursSinceDue >= 24;
  });

  const results: FallbackResult[] = [];

  for (const task of overdueTasks) {
    try {
      const guest = task.guest;
      const guestContext = guest
        ? `Guest: ${guest.name}, background: ${(guest.spiritualBackground || "unknown").replace(/_/g, " ")}, status: ${(guest.status || "visitor").replace(/_/g, " ")}, journey stage: ${(guest.journeyStage || "stage_1_welcome").replace(/_/g, " ")}.`
        : `Task: ${task.title}.`;

      let prompt = "";
      let channel = "email";

      if (task.taskType === "send_sms") {
        channel = "sms";
        prompt = `Write a warm, genuine pastoral SMS (under 160 characters) for a church guest. ${guestContext} Task context: ${task.description || task.title}. Tone: caring, personal, non-salesy.`;
      } else if (task.taskType === "send_email") {
        prompt = `Write a warm, genuine pastoral follow-up email for a church guest. ${guestContext} Task context: ${task.description || task.title}. Include a subject line prefixed "Subject: ". Tone: caring, personal, pastoral — not salesy.`;
      } else if (task.taskType === "follow_up_call") {
        prompt = `A church volunteer was unable to make a follow-up call. Write a warm email to substitute for the missed call. ${guestContext} Task context: ${task.description || task.title}. Tone: warm, genuine, pastoral.`;
      } else if (task.taskType === "prayer") {
        prompt = `Write a short, heartfelt prayer note email for a church guest. ${guestContext} Tone: deeply personal, faith-affirming, warm.`;
      } else {
        prompt = `Write a warm pastoral follow-up message for a church guest. ${guestContext} Task: ${task.description || task.title}. Tone: genuine, caring, pastoral.`;
      }

      const aiMessage = await invokeLLM<string>({ prompt, responseFormat: "text" });
      const recipientEmail = task.guestEmail || guest?.email;
      const recipientPhone = guest?.phone;

      if (channel === "sms" && recipientPhone) {
        const smsBody = (typeof aiMessage === "string" ? aiMessage : String(aiMessage)).slice(0, 160);
        const smsResult = await sendSMS(recipientPhone, smsBody);
        if (!smsResult.success) throw new Error(smsResult.error ?? "SMS send failed");
      } else if (channel === "email" && recipientEmail) {
        let subject = "A Note From Our Church Family";
        let body = typeof aiMessage === "string" ? aiMessage : String(aiMessage);
        if (body.includes("Subject:")) {
          const lines = body.split("\n");
          const subjectLine = lines.find((l) => l.startsWith("Subject:"));
          if (subjectLine) {
            subject = subjectLine.replace("Subject:", "").trim();
            body = lines.filter((l) => !l.startsWith("Subject:")).join("\n").trim();
          }
        }
        await sendEmail({ to: recipientEmail, subject, body });
      } else if (channel === "sms" && !recipientPhone) {
        throw new Error("No phone number for SMS task");
      }

      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: "auto_handled",
          aiMessageSent: typeof aiMessage === "string" ? aiMessage : String(aiMessage),
          aiHandledAt: now,
        },
      });

      if (task.guestId) {
        await prisma.careNote.create({
          data: {
            churchId: task.churchId,
            campusId: task.campusId,
            guestId: task.guestId,
            content: `[AI Auto-Handled] ${(typeof aiMessage === "string" ? aiMessage : String(aiMessage)).substring(0, 300)}...`,
          },
        });
      }

      results.push({ task_id: task.id, status: "handled", channel });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      results.push({ task_id: task.id, status: "error", error: msg });
    }
  }

  return { processed: overdueTasks.length, results };
}
