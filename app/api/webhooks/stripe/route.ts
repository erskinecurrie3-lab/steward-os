/**
 * StewardOS Stripe Webhook — Handle subscription events
 * POST /api/webhooks/stripe
 *
 * Verifies signature, updates Church plan on subscription events.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_GROWTH_PRICE_ID ?? ""]: "growth",
  [process.env.STRIPE_NETWORK_PRICE_ID ?? ""]: "network",
};

const PLAN_LIMITS: Record<string, number> = {
  starter: 200,
  growth: 1000,
  network: 999999,
  enterprise: 999999,
};

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const churchId = sub.metadata?.church_id as string | undefined;

    if (!churchId) {
      console.error("Subscription missing church_id metadata");
      return NextResponse.json({ received: true });
    }

    const priceId = sub.items.data[0]?.price?.id;
    const plan = PRICE_TO_PLAN[priceId ?? ""] ?? "starter";
    const planMemberLimit = PLAN_LIMITS[plan] ?? 200;

    await prisma.church.update({
      where: { id: churchId },
      data: {
        plan,
        stripeSubId: sub.id,
        planMemberLimit,
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;

    await prisma.church.updateMany({
      where: { stripeSubId: sub.id },
      data: {
        plan: "starter",
        stripeSubId: null,
        planMemberLimit: 200,
      },
    });
  }

  return NextResponse.json({ received: true });
}
