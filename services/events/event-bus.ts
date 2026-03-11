/**
 * StewardOS Event Bus
 * Central event distribution for integrations, automation, analytics.
 * In-process implementation — can be swapped for Redis Pub/Sub or AWS SNS in production.
 */

export type IntegrationEvent = {
  type: string;
  churchId: string;
  provider?: string;
  entityType?: string;
  externalId?: string;
  payload?: unknown;
  timestamp: Date;
};

export type EventHandler = (event: IntegrationEvent) => Promise<void>;

const handlers = new Map<string, Set<EventHandler>>();

/**
 * Subscribe to events by type (exact) or prefix (e.g. "person." matches "person.created", "person.updated")
 */
export function subscribe(
  eventTypeOrPrefix: string,
  handler: EventHandler
): () => void {
  const key = eventTypeOrPrefix.endsWith(".") ? eventTypeOrPrefix : eventTypeOrPrefix;
  if (!handlers.has(key)) handlers.set(key, new Set());
  handlers.get(key)!.add(handler);
  return () => handlers.get(key)?.delete(handler);
}

function getMatchingHandlers(eventType: string): EventHandler[] {
  const result: EventHandler[] = [];
  for (const [key, set] of handlers) {
    if (key.endsWith(".")) {
      if (eventType.startsWith(key)) result.push(...set);
    } else if (key === eventType) {
      result.push(...set);
    }
  }
  return result;
}

/**
 * Emit event to all matching subscribers
 */
export async function emit(event: IntegrationEvent): Promise<void> {
  const matched = getMatchingHandlers(event.type);
  const all = getMatchingHandlers("*");
  const toRun = [...new Set([...matched, ...all])];

  await Promise.allSettled(
    toRun.map((h) =>
      h(event).catch((err) => {
        console.error(`[EventBus] Handler error for ${event.type}:`, err);
      })
    )
  );
}

/**
 * Event bus instance for dependency injection
 */
export const eventBus = {
  emit,
  subscribe,
};
