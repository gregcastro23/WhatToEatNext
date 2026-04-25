/**
 * Core Alchemical Calculations
 *
 * Real implementation that delegates ESMS (Spirit/Essence/Matter/Substance)
 * calculation to the authoritative planetary mapping and composes a full
 * alchemize-style result including thermodynamic metrics.
 *
 * Callers pass one of:
 *   - { planetPositions, isDaytime }  (common callsite, uses planetary mapping)
 *   - { planetaryPositions, ... }     (kalchmEngine style)
 *   - a bare planetary-positions record
 */

import type { AlchemicalProperties } from "@/types/celestial";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import {
  calculateElementalValues,
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  calculateKAlchm,
  calculateMonicaConstant,
} from "./kalchmEngine";

export interface AlchemizeResult {
  alchemicalProperties: AlchemicalProperties;
  elementalValues: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  thermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
    kalchm: number;
    monica: number;
  };
  dominantElement: "Fire" | "Water" | "Earth" | "Air";
  dominantAlchemicalProperty: keyof AlchemicalProperties;
}

const EMPTY_ESMS: AlchemicalProperties = {
  Spirit: 0,
  Essence: 0,
  Matter: 0,
  Substance: 0,
};
const EMPTY_ELEMENTS = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

/**
 * Convert a raw positions record into the planet → sign map that
 * `calculateAlchemicalFromPlanets` expects.
 */
function toPlanetSignMap(
  positions: Record<string, unknown> | null | undefined,
): Record<string, string> {
  if (!positions) return {};
  const result: Record<string, string> = {};
  for (const [planet, raw] of Object.entries(positions)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as { sign?: unknown; Sign?: unknown; zodiacSign?: unknown };
    const sign = (r.sign ?? r.Sign ?? r.zodiacSign ?? "") as string;
    if (!sign) continue;
    const planetName =
      planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
    result[planetName] = sign.toString().toLowerCase();
  }
  return result;
}

/**
 * Shape-aware entry point: accepts either `{ planetPositions, isDaytime }`
 * or `{ planetaryPositions }` or a bare positions record. Returns ESMS.
 */
export function calculateAlchemicalProperties(
  input: unknown,
): AlchemicalProperties {
  try {
    const params = (input ?? {}) as {
      planetPositions?: Record<string, unknown>;
      planetaryPositions?: Record<string, unknown>;
      isDaytime?: boolean;
    };
    const positions =
      params.planetPositions ??
      params.planetaryPositions ??
      (input as Record<string, unknown>);

    const planetSigns = toPlanetSignMap(positions);
    if (Object.keys(planetSigns).length === 0) return { ...EMPTY_ESMS };

    return calculateAlchemicalFromPlanets(planetSigns, params.isDaytime);
  } catch {
    return { ...EMPTY_ESMS };
  }
}

/**
 * Compute transmutation deltas between two states. Returns the elementwise
 * ESMS difference normalized to a 0-1 intensity score.
 */
export function computeTransmutation(
  from: Partial<AlchemicalProperties> | null | undefined,
  to: Partial<AlchemicalProperties> | null | undefined,
): {
  delta: AlchemicalProperties;
  intensity: number;
} {
  const f: AlchemicalProperties = {
    Spirit: from?.Spirit ?? 0,
    Essence: from?.Essence ?? 0,
    Matter: from?.Matter ?? 0,
    Substance: from?.Substance ?? 0,
  };
  const t: AlchemicalProperties = {
    Spirit: to?.Spirit ?? 0,
    Essence: to?.Essence ?? 0,
    Matter: to?.Matter ?? 0,
    Substance: to?.Substance ?? 0,
  };
  const delta: AlchemicalProperties = {
    Spirit: t.Spirit - f.Spirit,
    Essence: t.Essence - f.Essence,
    Matter: t.Matter - f.Matter,
    Substance: t.Substance - f.Substance,
  };
  const magnitude = Math.sqrt(
    delta.Spirit ** 2 +
      delta.Essence ** 2 +
      delta.Matter ** 2 +
      delta.Substance ** 2,
  );
  // Normalize against the original magnitude; intensity of 1 means the new
  // state is as far from the old state as the old state was from zero.
  const fromMag = Math.sqrt(
    f.Spirit ** 2 + f.Essence ** 2 + f.Matter ** 2 + f.Substance ** 2,
  );
  const intensity =
    fromMag === 0 ? (magnitude > 0 ? 1 : 0) : Math.min(1, magnitude / fromMag);
  return { delta, intensity };
}

/**
 * Full alchemize: compute ESMS, elemental values, and thermodynamic metrics
 * from the given planetary state. Drop-in replacement for the previous stub.
 */
export function alchemize(input: unknown): AlchemizeResult {
  try {
    const alchemicalProperties = calculateAlchemicalProperties(input);

    const params = (input ?? {}) as {
      planetPositions?: Record<string, unknown>;
      planetaryPositions?: Record<string, unknown>;
    };
    const positions =
      (params.planetPositions ?? params.planetaryPositions ?? {}) as Record<
        string,
        { sign?: string; degree?: number; exactLongitude?: number }
      >;

    const elementalValues =
      Object.keys(positions).length > 0
        ? calculateElementalValues(positions as any)
        : { ...EMPTY_ELEMENTS };

    // Thermodynamics require non-zero inputs — substitute tiny values when
    // everything is flat so we don't divide by zero.
    const esms = {
      Spirit: Math.max(0.1, alchemicalProperties.Spirit),
      Essence: Math.max(0.1, alchemicalProperties.Essence),
      Matter: Math.max(0.1, alchemicalProperties.Matter),
      Substance: Math.max(0.1, alchemicalProperties.Substance),
    };
    const elems = {
      Fire: Math.max(0.1, elementalValues.Fire),
      Water: Math.max(0.1, elementalValues.Water),
      Earth: Math.max(0.1, elementalValues.Earth),
      Air: Math.max(0.1, elementalValues.Air),
    };

    const heat = calculateHeat({ ...esms, ...elems });
    const entropy = calculateEntropy({ ...esms, ...elems });
    const reactivity = calculateReactivity({ ...esms, ...elems });
    const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);
    const kalchm = calculateKAlchm(
      esms.Spirit,
      esms.Essence,
      esms.Matter,
      esms.Substance,
    );
    const monica = calculateMonicaConstant(gregsEnergy, reactivity, kalchm);

    // Dominant element / ESMS property
    const elEntries = Object.entries(elementalValues) as Array<
      [keyof typeof elementalValues, number]
    >;
    const dominantElement = (
      elEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] ?? "Fire"
    ) as "Fire" | "Water" | "Earth" | "Air";
    const esmsEntries = Object.entries(alchemicalProperties) as Array<
      [keyof AlchemicalProperties, number]
    >;
    const dominantAlchemicalProperty =
      esmsEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] ?? "Spirit";

    return {
      alchemicalProperties,
      elementalValues,
      thermodynamics: {
        heat,
        entropy,
        reactivity,
        gregsEnergy,
        kalchm,
        monica: Number.isFinite(monica) ? monica : 1.0,
      },
      dominantElement,
      dominantAlchemicalProperty,
    };
  } catch {
    return {
      alchemicalProperties: { ...EMPTY_ESMS },
      elementalValues: { ...EMPTY_ELEMENTS },
      thermodynamics: {
        heat: 0,
        entropy: 0,
        reactivity: 0,
        gregsEnergy: 0,
        kalchm: 0,
        monica: 1.0,
      },
      dominantElement: "Fire",
      dominantAlchemicalProperty: "Spirit",
    };
  }
}
