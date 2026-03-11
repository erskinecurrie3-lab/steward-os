/**
 * Automation workflow engine
 * Loads workflow config from PostgreSQL, executes steps with retry logic.
 * Supports both in-process execution and Temporal.io for durable long-running workflows.
 */

import { prisma } from "@/lib/db";
import { executeStep, type StepType } from "./steps";

export type WorkflowStep = {
  type: StepType;
  config: Record<string, unknown>;
};

export type WorkflowContext = {
  churchId: string;
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  service?: string;
  campus?: string;
  [key: string]: unknown;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function interpolate(str: string, ctx: WorkflowContext): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    const v = ctx[key];
    return v != null ? String(v) : "";
  });
}

function resolveConfig(config: Record<string, unknown>, ctx: WorkflowContext): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === "string") {
      out[k] = interpolate(v, ctx);
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[k] = resolveConfig(v as Record<string, unknown>, ctx);
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function runStepWithRetry(
  step: WorkflowStep,
  context: WorkflowContext
): Promise<Record<string, unknown>> {
  let lastErr: Error | null = null;
  const config = resolveConfig(step.config, context);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await executeStep(step.type as StepType, config, {
        churchId: context.churchId,
        guestId: context.guestId,
      });
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  throw lastErr ?? new Error("Step failed");
}

/**
 * Run workflows triggered by an event (in-process).
 * For long delays (e.g. 24h, 72h), use Temporal for durable execution.
 */
export async function triggerWorkflows(
  eventType: string,
  context: WorkflowContext
): Promise<{ triggered: number; errors: string[] }> {
  const workflows = await prisma.automationWorkflow.findMany({
    where: { churchId: context.churchId, triggerEvent: eventType, isActive: true },
  });

  let triggered = 0;
  const errors: string[] = [];

  for (const wf of workflows) {
    const steps = (wf.steps as WorkflowStep[]) ?? [];
    if (steps.length === 0) continue;

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await runStepWithRetry(step, context);
        // delay steps block; for Temporal, workflow sleeps across restarts
      }
      triggered++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Workflow ${wf.name}: ${msg}`);
    }
  }

  return { triggered, errors };
}

/**
 * Start workflow via Temporal (when configured).
 * Use for workflows with long delays (24h, 72h) so they survive restarts.
 */
export async function startTemporalWorkflow(
  workflowType: string,
  input: WorkflowContext
): Promise<{ workflowId?: string; error?: string }> {
  const temporalEnabled = process.env.TEMPORAL_ADDRESS;
  if (!temporalEnabled) {
    return { error: "Temporal not configured" };
  }

  try {
    const { Client, Connection } = await import("@temporalio/client");
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
    });
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
    });

    const handle = await client.workflow.start(workflowType, {
      taskQueue: "stewardos-automation",
      workflowId: `wf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      args: [input],
    });

    return { workflowId: handle.workflowId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}
