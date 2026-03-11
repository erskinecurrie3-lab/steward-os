/**
 * send_sms step — Twilio SMS activity
 */

import { sendSMS } from "@/lib/twilio";

export type SendSmsInput = {
  to: string;
  body: string;
};

export async function executeSendSms(input: SendSmsInput): Promise<{ success: boolean }> {
  const result = await sendSMS(input.to, input.body);
  return { success: result.success };
}
