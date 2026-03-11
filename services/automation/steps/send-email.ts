/**
 * send_email step — Resend email activity
 */

import { sendEmail } from "@/lib/email";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
};

export async function executeSendEmail(input: SendEmailInput): Promise<{ success: boolean }> {
  try {
    await sendEmail(input);
    return { success: true };
  } catch {
    return { success: false };
  }
}
