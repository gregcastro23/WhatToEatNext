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
