export type RestaurantPaymentPreference =
  | "automatic"
  | "card"
  | "crypto"
  | "esms";

/**
 * `metadata.purpose` stamped on restaurant-order Checkout Sessions.
 *
 * Shared so the writer (the checkout route) and the reader (the webhook) cannot
 * drift: a typo on either side silently routes a PAID order to no handler at
 * all, which looks identical to a customer who never checked out. The MCP
 * top-up path already does this via `MCP_TOP_UP_PURPOSE`.
 */
export const RESTAURANT_ORDER_PURPOSE = "restaurant_order" as const;

/**
 * Payment methods that do NOT settle during the Checkout redirect.
 *
 * Stripe finishes such a session with `payment_status: "unpaid"` and only later
 * emits `checkout.session.async_payment_succeeded` (or `…_failed`). Anything
 * listed here therefore REQUIRES those two events to be handled — without them
 * the order is written as pending and never advances.
 */
export const DELAYED_SETTLEMENT_PAYMENT_METHODS: readonly string[] = ["crypto"];

export function restaurantCryptoPaymentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED === "true";
}

export function normalizeRestaurantPaymentPreference(
  value: unknown,
): RestaurantPaymentPreference {
  if (value === "card" || value === "crypto" || value === "esms") return value;
  return "automatic";
}

export function stripePaymentMethodTypes(
  preference: RestaurantPaymentPreference,
): Array<"card" | "crypto"> | undefined {
  if (preference === "card") return ["card"];
  if (preference === "crypto") return ["crypto"];
  return undefined;
}
