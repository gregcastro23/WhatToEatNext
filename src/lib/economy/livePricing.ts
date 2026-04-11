import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";

interface EsmsCost {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface LivePricingContext {
  multiplier: number;
  aNumber: number;
  dominantElement: string;
  timestamp: string;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function asPlanetaryPositions(
  positions: Record<string, any>,
): Record<string, PlanetaryPosition> {
  const normalized: Record<string, PlanetaryPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    normalized[planet] = {
      sign: String(pos?.sign ?? "").toLowerCase(),
      degree: Number(pos?.degree ?? 0),
      minute: Number(pos?.minute ?? 0),
      isRetrograde: Boolean(pos?.isRetrograde),
    };
  }
  return normalized;
}

export async function getLivePricingContext(now = new Date()): Promise<LivePricingContext> {
  let positions: Record<string, any>;
  try {
    positions = await calculatePlanetaryPositions(now);
  } catch {
    positions = getFallbackPlanetaryPositions();
  }

  const alch = alchemize(asPlanetaryPositions(positions), now);
  const aNumber =
    Number(alch.esms.Spirit || 0) +
    Number(alch.esms.Essence || 0) +
    Number(alch.esms.Matter || 0) +
    Number(alch.esms.Substance || 0);

  // Dynamic spread based on current alchemical intensity.
  // Centered near 20, clamped to avoid extreme swings.
  const multiplier = clamp(1 + (aNumber - 20) / 100, 0.85, 1.35);

  return {
    multiplier: round(multiplier, 4),
    aNumber: round(aNumber, 4),
    dominantElement: alch.metadata.dominantElement,
    timestamp: now.toISOString(),
  };
}

export function applyLivePricing(base: EsmsCost, multiplier: number): EsmsCost {
  const apply = (value: number) => {
    if (value <= 0) return 0;
    return round(value * multiplier, 2);
  };
  return {
    spirit: apply(base.spirit),
    essence: apply(base.essence),
    matter: apply(base.matter),
    substance: apply(base.substance),
  };
}

