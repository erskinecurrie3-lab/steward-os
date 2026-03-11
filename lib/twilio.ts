/**
 * Twilio SMS service — StewardOS messaging
 * Sends SMS via Twilio with compliance checks (opt-out enforcement)
 */

import twilio from "twilio";
import { prisma } from "@/lib/db";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Normalize phone to E.164 format for Twilio.
 * Handles common US formats: (555) 123-4567, 555-123-4567, 5551234567
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return null;
}

/**
 * Check if a phone number has opted out of SMS.
 */
export async function isOptedOut(phone: string): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (!normalized) return true; // Invalid = treat as opted out
  const opt = await prisma.smsOptOut.findUnique({
    where: { phone: normalized },
  });
  return !!opt;
}

/**
 * Record an opt-out (when user replies STOP).
 */
export async function recordOptOut(phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  if (!normalized) return;
  await prisma.smsOptOut.upsert({
    where: { phone: normalized },
    create: { phone: normalized },
    update: {},
  });
}

/**
 * Send SMS via Twilio.
 * Returns { success: true, sid } or { success: false, error }.
 * Skips send if phone is opted out.
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!client || !fromNumber) {
    return { success: false, error: "Twilio not configured" };
  }

  const normalized = normalizePhone(to);
  if (!normalized) {
    return { success: false, error: "Invalid phone number" };
  }

  const optedOut = await isOptedOut(normalized);
  if (optedOut) {
    return { success: false, error: "Recipient has opted out" };
  }

  try {
    const message = await client.messages.create({
      body: body.slice(0, 1600), // Twilio limit
      from: fromNumber,
      to: normalized,
    });
    return { success: true, sid: message.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}
