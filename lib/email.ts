/**
 * Email service — send via Resend
 * Drop-in: same data shape (to, subject, body) → Resend
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "StewardOS <noreply@stewardos.cc>";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
};

/**
 * Send email via Resend.
 */
export async function sendEmail({ to, subject, body, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set; skipping email");
    return { id: null };
  }

  const recipients = Array.isArray(to) ? to : [to];

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: recipients,
    subject,
    ...(html ? { html } : { text: body ?? "" }),
  });

  if (error) throw error;
  return data;
}
