/**
 * Temporal workflow: visitor_created follow-up
 * Step 1 (immediate): Send welcome SMS via Twilio
 * Step 2 (24h delay): Notify pastor via email
 * Step 3 (72h delay): Send invitation to small group
 */

import { proxyActivities, sleep } from "@temporalio/workflow";

const activities = proxyActivities<typeof import("../activities/index")>({
  startToCloseTimeout: "60s",
  retry: { maximumAttempts: 3 },
});

export type VisitorFollowUpInput = {
  churchId: string;
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  service?: string;
  campus?: string;
};

export async function visitorFollowUpWorkflow(
  input: VisitorFollowUpInput
): Promise<{ completed: boolean }> {
  const { churchId, guestName, guestEmail, guestPhone } = input;

  // Step 1: Immediate welcome SMS
  if (guestPhone) {
    await activities.sendSms({
      to: guestPhone,
      body: `Hi ${guestName ?? "there"}! Thanks for visiting us today. We're glad you came—hope to see you again soon!`,
    });
  }

  // Step 2: 24h delay → notify pastor
  await sleep("24 hours");
  if (guestEmail) {
    await activities.sendEmail({
      to: guestEmail,
      subject: `Follow-up: ${guestName ?? "Visitor"} visited`,
      body: `This is a follow-up reminder for ${guestName ?? "a visitor"} who attended. Consider reaching out.`,
    });
  }

  // Step 3: 72h delay → small group invitation
  await sleep("48 hours"); // 24h + 48h = 72h from start
  if (guestPhone) {
    await activities.sendSms({
      to: guestPhone,
      body: `Hey ${guestName ?? "there"}! We'd love to connect you with a small group. Reply YES to learn more!`,
    });
  }

  return { completed: true };
}
