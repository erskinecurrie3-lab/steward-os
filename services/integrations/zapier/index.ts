/**
 * Zapier — Tier 1 Critical
 * Instant 5,000+ app compatibility via webhooks
 * TODO: Outgoing webhooks for visitor_created, etc.
 */

export const zapier = {
  provider: "zapier",
  label: "Zapier",
  supported: false,
  triggerWebhook: async (_churchId: string, _event: string, _payload: unknown) => ({
    success: false,
  }),
};
