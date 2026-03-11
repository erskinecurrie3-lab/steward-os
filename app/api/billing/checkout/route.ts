/**
 * StewardOS Billing — Start Stripe Checkout for plan upgrade
 * POST /api/billing/checkout
 *
 * Admin only. Creates Checkout session for Growth or Network plan.
 */

import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { stripe } from "@/lib/stripe";

const PRICE_IDS: Record<string, string> = {
  growth: process.env.STRIPE_GROWTH_PRICE_ID ?? "",
  network: process.env.STRIPE_NETWORK_PRICE_ID ?? "",
};

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireChurch();
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminOrPastor(ctx)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const church = await getChurchByClerkOrg(ctx.churchId);
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  const body = await req.json();
  const planId = body.planId as string; // 'growth' | 'network'

  if (!planId || !PRICE_IDS[planId]) {
    return NextResponse.json(
      { error: "Invalid plan. Use 'growth' or 'network'." },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Billing not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  if (!church.stripeCustomerId) {
    return NextResponse.json(
      { error: "Church billing not set up. Complete onboarding first." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const billingUrl = `${baseUrl}/dashboard/settings/billing`;

  const session = await stripe.checkout.sessions.create({
    customer: church.stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[planId], quantity: 1 }],
    success_url: `${billingUrl}?success=1`,
    cancel_url: billingUrl,
    metadata: { church_id: church.id },
    subscription_data: {
      trial_period_days: 14,
      metadata: { church_id: church.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
