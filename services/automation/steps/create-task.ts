/**
 * create_task step — Create StewardOS task
 */

import { prisma } from "@/lib/db";

export type CreateTaskInput = {
  churchId: string;
  campusId?: string | null;
  guestId?: string | null;
  title: string;
  description?: string;
  taskType?: string;
  priority?: string;
  dueDate?: string;
};

export async function executeCreateTask(input: CreateTaskInput): Promise<{ taskId: string }> {
  const task = await prisma.task.create({
    data: {
      churchId: input.churchId,
      campusId: input.campusId ?? null,
      guestId: input.guestId ?? null,
      title: input.title,
      description: input.description ?? null,
      taskType: input.taskType ?? "general",
      priority: input.priority ?? "normal",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
  return { taskId: task.id };
}
