/**
 * Mailchimp — Tier 2 Important
 * Email marketing
 * TODO: OAuth, sync lists, webhooks
 */

export const mailchimp = {
  provider: "mailchimp",
  label: "Mailchimp",
  supported: false,
  syncAudience: async (_churchId: string) => ({ synced: 0, failed: 0 }),
};
