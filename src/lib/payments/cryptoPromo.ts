import { esmsRestaurantPaymentsEnabled } from "./restaurantEsms";
import { restaurantCryptoPaymentsEnabled } from "./restaurantPayments";

// ─── Homepage crypto/on-chain promo gating ─────────────────────────────
//
// The homepage promo must never advertise a crypto rail that isn't actually
// live, or we promise users something that doesn't work (a consumer-protection
// problem). Each advertised claim is gated on the SAME flag that gates the
// underlying flow, so the copy can never drift ahead of the real feature.
//
// All of these read NEXT_PUBLIC_ vars only, so they are safe to evaluate in a
// client bundle, and they are inlined identically on the server and client at
// build time (no hydration mismatch).

/** USDC restaurant checkout — same gate the order route + menu UI use. */
export function cryptoFoodCheckoutEnabled(): boolean {
  return restaurantCryptoPaymentsEnabled();
}

/** ESMS-for-food redemption — same gate the menu UI uses. */
export function esmsFoodRedemptionEnabled(): boolean {
  return esmsRestaurantPaymentsEnabled();
}

/**
 * On-chain ESMS (claim to a Base wallet, on-chain burn in the Bazaar) is a
 * distinct rail: it requires the ESMS token contract to be deployed on-chain
 * and the agents app configured to settle against it. The kitchen app cannot
 * introspect that state, so it is gated behind an explicit operator flag that
 * MUST stay off until the contract is deployed and verified on-chain.
 */
export function onchainEsmsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED === "true";
}

/** True when any crypto/on-chain food rail is live and may be advertised. */
export function anyCryptoFoodPromoEnabled(): boolean {
  return (
    cryptoFoodCheckoutEnabled() ||
    esmsFoodRedemptionEnabled() ||
    onchainEsmsEnabled()
  );
}
