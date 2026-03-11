/**
 * Pushpay / Church Community Builder — Tier 1 Critical
 * Giving, mobile giving, ChMS
 * TODO: OAuth, sync, webhooks
 */

export const pushpay = {
  provider: "pushpay",
  label: "Pushpay",
  supported: false,
  syncPeople: async (_churchId: string) => ({ synced: 0, failed: 0 }),
  syncGiving: async (_churchId: string) => ({ synced: 0, failed: 0 }),
};
