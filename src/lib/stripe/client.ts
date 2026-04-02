/**
 * Stripe Client-Side Loader
 *
 * Provides a singleton Promise for the Stripe.js client instance,
 * used for Checkout redirects and Elements.
 *
 * @file src/lib/stripe/client.ts
 */

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn(
        "[stripe/client] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set",
      );
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
