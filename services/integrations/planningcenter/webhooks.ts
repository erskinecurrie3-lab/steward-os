/**
 * Planning Center incoming webhook handlers
 * Processes webhook events and optionally triggers sync or emits to event bus.
 */

import { eventBus } from "@/services/events/event-bus";

export type PCOWebhookPayload = {
  data?: {
    type?: string;
    id?: string;
    attributes?: Record<string, unknown>;
  };
  meta?: { event?: string };
};

/**
 * Process an incoming Planning Center webhook.
 * Emits to event bus for automation and analytics.
 */
export async function handlePlanningCenterWebhook(
  churchId: string,
  payload: PCOWebhookPayload
): Promise<void> {
  const data = payload.data;
  const entityType = data?.type ?? "unknown";
  const entityId = data?.id;
  const meta = payload.meta;

  // Map PCO webhook to StewardOS event types
  const eventType = mapPCOEventToStewardOS(entityType, meta?.event);

  await eventBus.emit({
    type: eventType,
    churchId,
    provider: "planningcenter",
    entityType,
    externalId: entityId,
    payload: data?.attributes ?? payload,
    timestamp: new Date(),
  });
}

function mapPCOEventToStewardOS(
  entityType: string,
  pcoEvent?: string
): string {
  if (pcoEvent) {
    if (pcoEvent.includes("person") || pcoEvent.includes("people"))
      return "person.updated";
    if (pcoEvent.includes("plan")) return "plan.updated";
    if (pcoEvent.includes("group")) return "group.updated";
  }
  switch (entityType.toLowerCase()) {
    case "person":
      return "person.updated";
    case "plan":
      return "plan.updated";
    case "group":
      return "group.updated";
    case "donation":
      return "donation.created";
    case "check_in":
      return "check_in.created";
    default:
      return "integration.event";
  }
}
