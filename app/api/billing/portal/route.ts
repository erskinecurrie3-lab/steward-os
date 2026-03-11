/**
 * StewardOS Billing — Stripe Customer Portal
 * POST /api/billing/portal
 *
 * Creates a Stripe Billing Portal session for managing subscription, payment method, invoices.
 */

import { NextResponse } from "next/server";
import { requireChurch, isAdminOrPastor } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";
import { stripe } from "@/lib/stripe";

export async function POST() {
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
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }
  if (!church?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account. Upgrade to a plan first." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnUrl = `${baseUrl}/dashboard/settings/billing`;

  const session = await stripe.billingPortal.sessions.create({
    customer: church.stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: session.url });
}
