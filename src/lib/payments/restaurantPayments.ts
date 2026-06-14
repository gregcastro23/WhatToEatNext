export type RestaurantPaymentPreference =
  | "automatic"
  | "card"
  | "crypto"
  | "esms";

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
