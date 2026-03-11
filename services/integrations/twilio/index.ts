/**
 * Twilio — Tier 1 Critical
 * SMS for follow-up automation
 * TODO: Configure, send_sms activity
 */

export const twilio = {
  provider: "twilio",
  label: "Twilio",
  supported: false,
  sendSms: async (_to: string, _body: string) => ({ success: false }),
};
