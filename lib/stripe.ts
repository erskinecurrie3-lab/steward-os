/**
 * StewardOS Stripe — Layer 4: Per-church billing
 * Each church has its own Stripe Customer + Subscription.
 * Stripe is optional for onboarding; billing features require STRIPE_SECRET_KEY.
 */

import Stripe from "stripe";

function createStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
}

export const stripe = createStripeClient();

/** Create or get Stripe Customer for a church */
export async function getOrCreateChurchCustomer(
  churchId: string,
  churchName: string,
  email?: string
): Promise<string> {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is required");
  const customers = await stripe.customers.list({
    email: email ?? undefined,
    limit: 10,
  });

  const existing = customers.data.find(
    (c) => c.metadata?.churchId === churchId
  );
  if (existing) return existing.id;

  const customer = await stripe.customers.create({
    name: churchName,
    email: email ?? undefined,
    metadata: { churchId },
  });

  return customer.id;
}

/** Create checkout session for church subscription */
export async function createCheckoutSession(
  churchId: string,
  churchName: string,
  successUrl: string,
  cancelUrl: string,
  customerId?: string
) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is required");
  const customer =
    customerId ??
    (await getOrCreateChurchCustomer(churchId, churchName));

  const session = await stripe.checkout.sessions.create({
    customer,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID ?? "price_placeholder",
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { churchId },
    subscription_data: { metadata: { churchId } },
  });

  return session;
}

/** Create billing portal session for church to manage subscription */
export async function createPortalSession(
  churchId: string,
  returnUrl: string,
  customerId: string
) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is required");
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}
