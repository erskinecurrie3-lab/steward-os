/**
 * Twilio Incoming SMS Webhook
 * Handles STOP and HELP for A2P compliance.
 * Configure in Twilio: Messaging → Phone Numbers → [Your Number] → Webhook URL
 * POST https://stewardos.cc/api/webhooks/twilio/sms
 */

import { NextRequest, NextResponse } from "next/server";
import { recordOptOut } from "@/lib/twilio";

const HELP_RESPONSE =
  "StewardOS: Reply STOP to unsubscribe. For help, contact the church that sent you the message.";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = (formData.get("Body") as string) || "";
    const from = (formData.get("From") as string) || "";

    const normalizedBody = body.trim().toUpperCase();

    if (normalizedBody === "STOP" || normalizedBody === "STOPALL" || normalizedBody === "UNSUBSCRIBE") {
      await recordOptOut(from);
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>You have been unsubscribed. You will not receive further messages.</Message></Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    if (normalizedBody === "HELP" || normalizedBody === "INFO") {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${HELP_RESPONSE}</Message></Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (err) {
    console.error("Twilio SMS webhook error:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }
}
