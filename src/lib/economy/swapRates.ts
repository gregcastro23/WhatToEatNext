/**
 * Planetary Swap Rate Engine
 *
 * Computes dynamic ESMS exchange rates from the current planetary hour and
 * day. The base ratio matches the existing transmutation system (3:1) but the
 * effective rate floats with the alchemical contribution of the ruling planet:
 * tokens favored by the ruling planet get cheaper to acquire, while tokens
 * suppressed by it get more expensive.
 */

import { TOKEN_TYPES, TRANSMUTATION_RATIO } from "@/types/economy";
import type { TokenType } from "@/types/economy";
import { getTimeFactors } from "@/types/time";
import { PLANETARY_ALCHEMY } from "@/utils/planetaryAlchemyMapping";

export interface SwapRate {
  fromToken: TokenType;
  toToken: TokenType;
  /** Units of fromToken required to mint 1 unit of toToken right now. */
  rate: number;
  /** The same rate vs. the static 3:1 baseline (1.0 = no shift). */
  modifier: number;
}

export interface SwapRateContext {
  rulingHourPlanet: string;
  rulingDayPlanet: string;
  rates: SwapRate[];
  generatedAt: string;
  /** Until when this rate sheet is considered fresh (≈ end of planetary hour). */
  validUntil: string;
}

const TOKEN_KEYS: TokenType[] = [...TOKEN_TYPES];

const MIN_MODIFIER = 0.5; // Best case: half the usual cost
const MAX_MODIFIER = 1.5; // Worst case: 50% premium

/**
 * Given a planet, return the alchemical weight it contributes to each token
 * type (0..2 in the current mapping when summing hour + day rulers).
 */
function planetaryWeights(planet: string): Record<TokenType, number> {
  const base = PLANETARY_ALCHEMY[planet as keyof typeof PLANETARY_ALCHEMY];
  if (!base) {
    return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  }
  return {
    Spirit: base.Spirit,
    Essence: base.Essence,
    Matter: base.Matter,
    Substance: base.Substance,
  };
}

/**
 * Combine hour + day ruler weights (hour weighs more — it's the immediate
 * influence) and clamp to the [MIN_MODIFIER, MAX_MODIFIER] band.
 *
 * Rules:
 *  - A token favored by the ruling planet costs LESS of the source token.
 *  - A token favored by the source planet should cost MORE (you're trading a
 *    token whose energy is currently abundant — premium for the conversion).
 */
function computeModifier(
  fromToken: TokenType,
  toToken: TokenType,
  hourWeights: Record<TokenType, number>,
  dayWeights: Record<TokenType, number>,
): number {
  const supply = hourWeights[fromToken] * 0.7 + dayWeights[fromToken] * 0.3;
  const demand = hourWeights[toToken] * 0.7 + dayWeights[toToken] * 0.3;
  // demand > supply → favorable swap (modifier < 1)
  const delta = supply - demand;
  const modifier = 1 + delta * 0.25;
  return Math.max(MIN_MODIFIER, Math.min(MAX_MODIFIER, Number(modifier.toFixed(3))));
}

export function getCurrentSwapRates(now: Date = new Date()): SwapRateContext {
  // getTimeFactors() reads `new Date()` internally; for callers that need
  // determinism (tests) we still rely on the system clock — both rulers are a
  // function of that, so reproducing them here would duplicate logic.
  const factors = getTimeFactors();
  const hourPlanet = factors.planetaryHour.planet as string;
  const dayPlanet = factors.planetaryDay.planet as string;
  const hourWeights = planetaryWeights(hourPlanet);
  const dayWeights = planetaryWeights(dayPlanet);

  const rates: SwapRate[] = [];
  for (const fromToken of TOKEN_KEYS) {
    for (const toToken of TOKEN_KEYS) {
      if (fromToken === toToken) continue;
      const modifier = computeModifier(fromToken, toToken, hourWeights, dayWeights);
      rates.push({
        fromToken,
        toToken,
        rate: Number((TRANSMUTATION_RATIO * modifier).toFixed(4)),
        modifier,
      });
    }
  }

  // The planetary hour rolls every clock hour in our simplified model; lock the
  // rate sheet to the next top-of-hour so the UI knows when to refresh.
  const validUntil = new Date(now);
  validUntil.setMinutes(0, 0, 0);
  validUntil.setHours(validUntil.getHours() + 1);

  return {
    rulingHourPlanet: hourPlanet,
    rulingDayPlanet: dayPlanet,
    rates,
    generatedAt: now.toISOString(),
    validUntil: validUntil.toISOString(),
  };
}

export function findRate(
  context: SwapRateContext,
  fromToken: TokenType,
  toToken: TokenType,
): SwapRate | null {
  return (
    context.rates.find((r) => r.fromToken === fromToken && r.toToken === toToken) || null
  );
}
