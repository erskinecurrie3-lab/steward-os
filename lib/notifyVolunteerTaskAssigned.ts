/**
 * StewardOS — Notify volunteer when assigned a task
 * Converted from steward-care-hub notifyVolunteerTaskAssigned.ts
 */

import { sendEmail } from "@/lib/email";

type TaskInfo = {
  title: string;
  taskType?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  dueDate?: Date | null;
  priority?: string | null;
  notes?: string | null;
};

const TASK_TYPE_LABELS: Record<string, string> = {
  follow_up_call: "Follow-Up Call",
  send_email: "Send Email",
  send_sms: "Send SMS",
  personal_visit: "Personal Visit",
  prayer: "Prayer",
  general: "General Task",
};

export async function notifyVolunteerTaskAssigned(
  volunteerEmail: string,
  volunteerName: string,
  task: TaskInfo
): Promise<void> {
  const taskLabel =
    TASK_TYPE_LABELS[task.taskType || ""] || "Follow-Up Task";
  const guestName = task.guestName || "a guest";
  const dueStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "No due date set";
  const priorityLabel = task.priority
    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    : "Normal";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.stewardos.com";
  const taskUrl = `${appUrl}/dashboard/volunteer`;

  const body = `Hi ${volunteerName},

A new follow-up task has been assigned to you in StewardOS.

──────────────────────────
📋 TASK DETAILS
──────────────────────────
Task:       ${task.title || taskLabel}
Type:       ${taskLabel}
Guest:      ${guestName}${task.guestEmail ? `\nEmail:      ${task.guestEmail}` : ""}
Due Date:   ${dueStr}
Priority:   ${priorityLabel}
${task.notes ? `\nNotes:\n${task.notes}` : ""}

──────────────────────────

To view and manage this task, log in to your Volunteer Portal:
${taskUrl}

If you have any questions, please reach out to your pastoral team.

With gratitude,
The StewardOS Team`;

  await sendEmail({
    to: volunteerEmail,
    subject: `📋 New Task Assigned: ${taskLabel} for ${guestName}`,
    body,
  });
}
