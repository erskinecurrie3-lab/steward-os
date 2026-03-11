/**
 * Integration Webhook — Receive events from Planning Center, Pushpay, Mailchimp, etc.
 * POST /api/webhooks/integration?church_id=...&provider=...
 *
 * Verifies signature (if webhook_secret configured), logs payload, returns 202.
 * Actual processing can be handled by a background job or processWebhookEvent function.
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import type { PCOWebhookPayload } from "@/services/integrations/planningcenter/webhooks";

const PROVIDERS = [
  "planningcenter",
  "pushpay",
  "subsplash",
  "breeze",
  "rockrms",
  "tithely",
  "mailchimp",
  "twilio",
  "zapier",
] as const;

function verifyWebhookSignature(
  provider: string,
  signature: string,
  body: string,
  secret: string | null
): boolean {
  if (!secret) return false;
  try {
    const hash = createHmac("sha256", secret).update(body).digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const hashBuf = Buffer.from(hash, "utf8");
    if (sigBuf.length !== hashBuf.length) return false;
    return timingSafeEqual(sigBuf, hashBuf);
  } catch {
    return false;
  }
}

function parseWebhookPayload(provider: string, body: string): {
  eventType: string;
  entityType?: string;
  externalId?: string;
  payload: unknown;
} {
  let bodyObj: Record<string, unknown>;
  try {
    bodyObj = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return { eventType: "unknown", payload: {} };
  }

  switch (provider) {
    case "planningcenter": {
      const data = bodyObj.data as Record<string, unknown> | undefined;
      const rel = data?.relationships as Record<string, unknown> | undefined;
      const actionType = rel?.["action-type"] as { data?: { id?: string } } | undefined;
      return {
        eventType: (actionType?.data?.id as string) || (bodyObj.type as string) || "unknown",
        entityType: (data?.type as string) ?? undefined,
        externalId: (data?.id as string) ?? undefined,
        payload: data?.attributes ?? bodyObj,
      };
    }
    case "pushpay":
      return {
        eventType: (bodyObj.type as string) || "unknown",
        externalId: (bodyObj.id as string) ?? undefined,
        payload: bodyObj,
      };
    case "mailchimp": {
      const data = bodyObj.data as Record<string, unknown> | undefined;
      return {
        eventType: (bodyObj.type as string) || "unknown",
        externalId: (data?.id as string) ?? undefined,
        payload: data ?? bodyObj,
      };
    }
    case "twilio":
      return {
        eventType: (bodyObj.EventType as string) || "unknown",
        externalId: (bodyObj.ResourceSid as string) ?? undefined,
        payload: bodyObj,
      };
    default:
      return { eventType: "unknown", payload: bodyObj };
  }
}

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider");
    const churchId = url.searchParams.get("church_id");

    if (!provider || !churchId) {
      return NextResponse.json(
        { error: "Missing provider or church_id" },
        { status: 400 }
      );
    }

    if (!PROVIDERS.includes(provider as (typeof PROVIDERS)[number])) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const config = await prisma.integrationConfig.findFirst({
      where: { churchId, provider },
    });

    if (!config) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const body = await req.text();
    const signature =
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-mailchimp-webhook-signature") ||
      "";

    const signatureValid = signature
      ? verifyWebhookSignature(provider, signature, body, config.webhookSecret)
      : true;

    const webhook = parseWebhookPayload(provider, body);

    // Register event handlers on first webhook (idempotent)
    const { registerEventHandlers } = await import("@/services/events/handlers");
    registerEventHandlers();

    const webhookLog = await prisma.webhookLog.create({
      data: {
        churchId,
        configId: config.id,
        provider,
        eventType: webhook.eventType,
        payload: webhook.payload as object,
        status: signatureValid ? "received" : "failed",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        signatureValid,
        ...(signatureValid ? {} : { error: "Invalid signature" }),
      },
    });

    if (!signatureValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Process webhook asynchronously (don't block response)
    if (provider === "planningcenter" && churchId) {
      const { handlePlanningCenterWebhook } = await import(
        "@/services/integrations/planningcenter/webhooks"
      );
      handlePlanningCenterWebhook(churchId, JSON.parse(body) as PCOWebhookPayload).catch(
        (err) => console.error("[Webhook] PCO handler error:", err)
      );
    }
    return NextResponse.json(
      { success: true, webhookId: webhookLog.id },
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Integration webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
