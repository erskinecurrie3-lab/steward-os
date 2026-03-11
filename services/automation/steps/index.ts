/**
 * Automation step executors
 */

import { executeSendSms } from "./send-sms";
import { executeSendEmail } from "./send-email";
import { executeCreateTask } from "./create-task";
import { executeAddTag } from "./add-tag";
import { executeDelay } from "./delay";

export type StepType = "send_sms" | "send_email" | "create_task" | "add_tag" | "delay";

export type StepInput = Record<string, unknown>;

const STEP_EXECUTORS: Record<
  StepType,
  (input: StepInput) => Promise<Record<string, unknown>>
> = {
  send_sms: (i) => executeSendSms(i as { to: string; body: string }),
  send_email: (i) =>
    executeSendEmail(i as { to: string | string[]; subject: string; body?: string; html?: string }),
  create_task: (i) =>
    executeCreateTask(i as {
      churchId: string;
      campusId?: string | null;
      guestId?: string | null;
      title: string;
      description?: string;
      taskType?: string;
      priority?: string;
      dueDate?: string;
    }),
  add_tag: (i) =>
    executeAddTag(i as { guestId: string; tag: string; tagType?: "journey_stage" | "status" | "custom" }),
  delay: (i) =>
    executeDelay(
      i as { seconds?: number; minutes?: number; hours?: number; days?: number }
    ).then(() => ({})),
};

export async function executeStep(
  stepType: StepType,
  input: StepInput,
  context: { churchId: string; guestId?: string }
): Promise<Record<string, unknown>> {
  const merged = { ...input, churchId: context.churchId, guestId: context.guestId };
  const fn = STEP_EXECUTORS[stepType];
  if (!fn) throw new Error(`Unknown step type: ${stepType}`);
  return fn(merged);
}
