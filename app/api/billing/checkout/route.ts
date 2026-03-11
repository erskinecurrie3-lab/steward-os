/**
 * StewardOS Billing — Start Stripe Checkout for plan upgrade
 * POST /api/billing/checkout
 *
 * Admin only. Creates Checkout session for Growth or Network plan.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { prisma } from "@/lib/db";
import { stripe, getOrCreateChurchCustomer } from "@/lib/stripe";

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

  const priceId = PRICE_IDS[planId];
  if (!planId || !priceId || !priceId.startsWith("price_")) {
    return NextResponse.json(
      { error: planId ? `Stripe price not configured for ${planId}. Set STRIPE_GROWTH_PRICE_ID and STRIPE_NETWORK_PRICE_ID in .env` : "Invalid plan. Use 'growth' or 'network'." },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Billing not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  let customerId = church.stripeCustomerId;
  if (!customerId && stripe) {
    try {
      const { userId } = await auth();
      let adminEmail: string | undefined;
      if (userId) {
        const dbUser = await prisma.user.findFirst({
          where: { churchId: church.id },
          select: { email: true },
        });
        adminEmail = dbUser?.email;
      }
      customerId = await getOrCreateChurchCustomer(
        church.id,
        church.name,
        adminEmail
      );
      await prisma.church.update({
        where: { id: church.id },
        data: { stripeCustomerId: customerId },
      });
    } catch (err) {
      console.error("Stripe customer creation failed:", err);
      return NextResponse.json(
        { error: "Could not set up billing. Please try again or contact support." },
        { status: 500 }
      );
    }
  }
  if (!customerId) {
    return NextResponse.json(
      { error: "Church billing not set up. Complete onboarding first." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const billingUrl = `${baseUrl}/dashboard/settings/billing`;

  // If church already has this plan, avoid duplicate checkout
  if (church.plan === planId && church.stripeSubId) {
    return NextResponse.json(
      { error: `You already have the ${planId} plan. Use "Manage subscription" to update.` },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${billingUrl}?success=1`,
      cancel_url: billingUrl,
      metadata: { church_id: church.id },
      subscription_data: {
        trial_period_days: 14,
        metadata: { church_id: church.id },
      },
      allow_promotion_codes: true,
    });
  } catch (err) {
    console.error("Stripe checkout session failed:", err);
    const msg = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json(
      { error: `Checkout failed: ${msg}. Verify Stripe price IDs exist in your Stripe Dashboard.` },
      { status: 502 }
    );
  }

  if (!session?.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL. Please try again." },
      { status: 502 }
    );
  }
  return NextResponse.json({ url: session.url });
}
