/**
 * Visitor Created event handler
 * Triggered when: connect card submitted, PCO person created, etc.
 * Actions: trigger automation workflow (welcome SMS, email sequence)
 */

import type { IntegrationEvent } from "@/services/events/event-bus";
import { triggerWorkflows } from "@/services/automation/engine";

export async function handleVisitorCreated(event: IntegrationEvent): Promise<void> {
  const payload = event.payload as Record<string, unknown> | undefined;
  const context = {
    churchId: event.churchId,
    guestId: payload?.guestId as string | undefined,
    guestName: (payload?.name ?? payload?.guestName) as string | undefined,
    guestEmail: (payload?.email ?? payload?.guestEmail) as string | undefined,
    guestPhone: (payload?.phone ?? payload?.guestPhone) as string | undefined,
    service: payload?.service as string | undefined,
    campus: payload?.campus as string | undefined,
  };
  const result = await triggerWorkflows("visitor_created", context);
  if (result.triggered > 0 || result.errors.length > 0) {
    console.debug(
      `[VisitorCreated] churchId=${event.churchId} triggered=${result.triggered} errors=${result.errors.length}`
    );
  }
}
