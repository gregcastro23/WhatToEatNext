/**
 * Stripe Checkout Session API
 *
 * Creates a Stripe Checkout session for subscription upgrades.
 *
 * @file src/app/api/stripe/checkout/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(request, {
    window: 60_000,
    max: 10,
    bucket: "stripe-checkout",
    identifier: session.user.id,
  });
  if (!rl.allowed) return rl.response!;

  // Recurring subscriptions are deprecated in favor of the unified ESMS Token Economy.
  // Guide callers to the ESMS Token Vault at /vault and /api/stripe/checkout-tokens.
  return NextResponse.json(
    {
      error: "Recurring subscriptions have been retired in favor of ESMS Token Pay-As-You-Go.",
      message: "All tools are accessible via ESMS tokens. Claim your daily Cosmic Yield or purchase a token bundle at the Token Vault.",
      vaultUrl: "/vault",
      tokenCheckoutUrl: "/api/stripe/checkout-tokens",
    },
    { status: 400 },
  );
}
