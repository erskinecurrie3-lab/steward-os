/**
 * Subsplash — Tier 1 Critical
 * Apps, giving, media
 * TODO: OAuth, sync, webhooks
 */

export const subsplash = {
  provider: "subsplash",
  label: "Subsplash",
  supported: false,
  syncPeople: async (_churchId: string) => ({ synced: 0, failed: 0 }),
  syncGiving: async (_churchId: string) => ({ synced: 0, failed: 0 }),
};
