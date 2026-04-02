/**
 * Stripe Server-Side Client
 *
 * Initializes the Stripe SDK for server-side use in API routes.
 * Must NOT be imported from Edge Runtime (middleware) or client components.
 *
 * @file src/lib/stripe/stripe.ts
 */

import Stripe from "stripe";

function getStripeInstance(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment variables.",
    );
  }
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

/** Lazily-initialized Stripe instance */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = getStripeInstance();
  }
  return _stripe;
}

export default getStripe;
