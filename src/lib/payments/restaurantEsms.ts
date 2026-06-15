export interface EsmsBasketCost {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export type EsmsBalanceLike = EsmsBasketCost;

const ESMS_AXES: Array<keyof EsmsBasketCost> = [
  "spirit",
  "essence",
  "matter",
  "substance",
];

export function esmsRestaurantPaymentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED === "true";
}

export function esmsRestaurantCentsPerToken(): number {
  const value = Number(
    process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN,
  );
  return Number.isInteger(value) && value > 0 ? value : 0;
}

// ─── Redemption caps (server-enforced pre-launch guardrails) ───────────
//
// Per CRYPTO_FOOD_PAYMENTS.md the pilot must "Cap per-user and aggregate
// daily redemption" before enabling ESMS food payments in production.
// These read NON-public env vars and are only ever evaluated server-side
// (in the reservation transaction) — never call them from a client bundle.
// A value of 0 (or unset/invalid) means "no cap" — an explicit opt-out.
// The window is a UTC calendar day (date_trunc('day', now())), matching
// the rest of the daily-yield accounting.

const DEFAULT_PER_USER_DAILY_CAP = 5000; // tokens/day ($50 at 1¢/token)
const DEFAULT_AGGREGATE_DAILY_CAP = 200_000; // tokens/day ($2,000 at 1¢/token)

function capFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  // Explicit 0 disables the cap; negative/NaN falls back to the default so a
  // typo can never silently remove the guardrail.
  if (!Number.isFinite(value) || value < 0) return fallback;
  return Math.floor(value);
}

/** Max ESMS tokens a single user may redeem for food per UTC day (0 = unlimited). */
export function esmsRestaurantPerUserDailyCap(): number {
  return capFromEnv(
    "ESMS_RESTAURANT_PER_USER_DAILY_CAP",
    DEFAULT_PER_USER_DAILY_CAP,
  );
}

/** Max ESMS tokens redeemed for food platform-wide per UTC day (0 = unlimited). */
export function esmsRestaurantAggregateDailyCap(): number {
  return capFromEnv(
    "ESMS_RESTAURANT_AGGREGATE_DAILY_CAP",
    DEFAULT_AGGREGATE_DAILY_CAP,
  );
}

/** Total tokens across all four axes for a basket. */
export function esmsBasketTotal(cost: EsmsBasketCost): number {
  return cost.spirit + cost.essence + cost.matter + cost.substance;
}

export function quoteEsmsBasket(
  totalCents: number,
  centsPerToken = esmsRestaurantCentsPerToken(),
): EsmsBasketCost | null {
  if (
    !Number.isInteger(totalCents) ||
    totalCents <= 0 ||
    !Number.isInteger(centsPerToken) ||
    centsPerToken <= 0
  ) {
    return null;
  }

  const totalTokens = Math.ceil(totalCents / centsPerToken);
  const base = Math.floor(totalTokens / ESMS_AXES.length);
  let remainder = totalTokens % ESMS_AXES.length;
  const cost: EsmsBasketCost = {
    spirit: base,
    essence: base,
    matter: base,
    substance: base,
  };

  for (const axis of ESMS_AXES) {
    if (remainder === 0) break;
    cost[axis] += 1;
    remainder -= 1;
  }

  return cost;
}

export function canAffordEsmsBasket(
  balances: EsmsBalanceLike,
  cost: EsmsBasketCost,
): boolean {
  return ESMS_AXES.every((axis) => balances[axis] >= cost[axis]);
}
