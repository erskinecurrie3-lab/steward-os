/**
 * Temporal activities — send_sms, send_email, create_task, add_tag
 */

import { sendSMS } from "@/lib/twilio";
import { sendEmail as resendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";

export async function sendSms(input: { to: string; body: string }): Promise<{ success: boolean }> {
  const result = await sendSMS(input.to, input.body);
  return { success: result.success };
}

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  body?: string;
}): Promise<{ success: boolean }> {
  try {
    await resendEmail(input);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function createTask(input: {
  churchId: string;
  title: string;
  description?: string;
  guestId?: string;
}): Promise<{ taskId: string }> {
  const task = await prisma.task.create({
    data: {
      churchId: input.churchId,
      guestId: input.guestId ?? null,
      title: input.title,
      description: input.description ?? null,
      taskType: "general",
      priority: "normal",
    },
  });
  return { taskId: task.id };
}

export async function addTag(input: {
  guestId: string;
  tag: string;
  tagType?: "journey_stage" | "status";
}): Promise<{ success: boolean }> {
  const data =
    input.tagType === "status"
      ? { status: input.tag }
      : { journeyStage: input.tag };
  await prisma.guest.update({
    where: { id: input.guestId },
    data,
  });
  return { success: true };
}
