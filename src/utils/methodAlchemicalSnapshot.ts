/**
 * Pure per-method alchemical pipeline — the same math the Enhanced Cooking
 * Method Recommender runs (ESMS → pillar transform → Greg's Energy →
 * Kalchm/Monica → P=IV kinetics → Harmony), extracted as a standalone
 * utility so other surfaces (Transmutation Hub hero, method profile pages)
 * can compute live readouts without mounting the recommender.
 *
 * All inputs are plain data; safe in both server and client components.
 */
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";
import type { KineticMetrics } from "@/calculations/kinetics";
import type { AlchemicalPillar } from "@/constants/alchemicalPillars";
import { getCookingMethodThermodynamics } from "@/constants/alchemicalPillars";
import type { CookingMethodData, CookingMethodKineticProfile } from "@/types/cookingMethod";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import {
  calculateMethodSpecificKinetics,
  getKineticProfile,
} from "@/utils/cookingMethodKinetics";
import {
  calculateKAlchm,
  calculateMonicaConstant,
} from "@/utils/monicaKalchmCalculations";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import {
  calculateHarmonyIndex,
  type FocusMode,
  type HarmonyResult,
  type UserIntent,
} from "@/utils/resonanceGapScoring";

/** Minimal ESMS input shape (no index signature, so any named ESMS type assigns). */
export interface AlchemicalQuantitiesInput {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

/** ESMS output shape — index signature keeps it assignable to @/types/celestial AlchemicalProperties. */
export interface AlchemicalQuantities extends AlchemicalQuantitiesInput {
  [key: string]: number;
}

export interface MethodMomentInput {
  /**
   * Planetary positions — either raw context objects ({ sign, isRetrograde,
   * exactLongitude, ... }) or plain sign-name strings. Raw objects are
   * preferred: retrograde/speed data modulates the kinetics.
   */
  planetaryPositions?: Record<string, unknown> | null;
  /** Live ESMS override (e.g. from /api/alchm-quantities). */
  baseESMS?: AlchemicalQuantitiesInput | null;
  focusMode?: FocusMode;
  userIntent?: UserIntent;
  highStress?: boolean;
}

export interface MethodAlchemicalSnapshot {
  id: string;
  baseESMS: AlchemicalQuantities;
  transformedESMS: AlchemicalQuantities;
  pillar: AlchemicalPillar | undefined;
  thermo: { heat: number; entropy: number; reactivity: number };
  gregsEnergy: number;
  kalchm: number;
  monica: number | null;
  kinetics: KineticMetrics | null;
  kProfile: CookingMethodKineticProfile;
  harmony: HarmonyResult;
}

export const DEFAULT_PLANETARY_POSITIONS: Record<string, string> = {
  Sun: "Leo",
  Moon: "Cancer",
  Mercury: "Gemini",
  Venus: "Taurus",
  Mars: "Aries",
  Jupiter: "Sagittarius",
  Saturn: "Capricorn",
  Uranus: "Aquarius",
  Neptune: "Pisces",
  Pluto: "Scorpio",
};

const PLANETS = Object.keys(DEFAULT_PLANETARY_POSITIONS);

function extractSign(position: unknown): string {
  if (typeof position === "string") return position;
  if (position && typeof position === "object") {
    const sign = (position as Record<string, unknown>).sign;
    if (typeof sign === "string" && sign.length > 0) {
      return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
    }
  }
  return "Aries";
}

/** Collapse raw context positions to plain sign names for the ESMS engine. */
export function toSignPositions(
  positions: Record<string, unknown> | null | undefined,
): Record<string, string> {
  if (!positions || Object.keys(positions).length === 0) {
    return DEFAULT_PLANETARY_POSITIONS;
  }
  const normalized: Record<string, string> = {};
  for (const planet of PLANETS) {
    normalized[planet] = extractSign(
      positions[planet] ?? positions[planet.toLowerCase()],
    );
  }
  return normalized;
}

/** Duration for harmony scoring — legacy data files may use time_range. */
function resolveDuration(
  method: CookingMethodData,
): { min: number; max: number } | undefined {
  if (method.duration) return method.duration;
  const timeRange = (method as unknown as Record<string, unknown>).time_range;
  if (
    timeRange &&
    typeof timeRange === "object" &&
    typeof (timeRange as { min?: unknown }).min === "number" &&
    typeof (timeRange as { max?: unknown }).max === "number"
  ) {
    return timeRange as { min: number; max: number };
  }
  return undefined;
}

/** Run the full per-method pipeline for the given sky moment. */
export function computeMethodSnapshot(
  id: string,
  method: CookingMethodData,
  moment: MethodMomentInput = {},
): MethodAlchemicalSnapshot {
  const signPositions = toSignPositions(moment.planetaryPositions);
  const live = moment.baseESMS ?? calculateAlchemicalFromPlanets(signPositions);
  const baseESMS: AlchemicalQuantities = {
    Spirit: live?.Spirit ?? 4,
    Essence: live?.Essence ?? 4,
    Matter: live?.Matter ?? 4,
    Substance: live?.Substance ?? 2,
  };

  const pillar = getCookingMethodPillar(id);
  const transformedESMS: AlchemicalQuantities = pillar
    ? {
        Spirit: baseESMS.Spirit + (pillar.effects.Spirit || 0),
        Essence: baseESMS.Essence + (pillar.effects.Essence || 0),
        Matter: baseESMS.Matter + (pillar.effects.Matter || 0),
        Substance: baseESMS.Substance + (pillar.effects.Substance || 0),
      }
    : baseESMS;

  const thermo = (method.thermodynamicProperties as
    | { heat: number; entropy: number; reactivity: number }
    | undefined) ??
    getCookingMethodThermodynamics(id) ?? {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
    };

  const gregsEnergy = calculateGregsEnergy({
    Spirit: transformedESMS.Spirit,
    Essence: transformedESMS.Essence,
    Matter: transformedESMS.Matter,
    Substance: transformedESMS.Substance,
    Fire: method.elementalEffect.Fire,
    Water: method.elementalEffect.Water,
    Air: method.elementalEffect.Air,
    Earth: method.elementalEffect.Earth,
  }).gregsEnergy;

  const kalchm = calculateKAlchm(
    transformedESMS.Spirit,
    transformedESMS.Essence,
    transformedESMS.Matter,
    transformedESMS.Substance,
  );
  const monica = kalchm
    ? calculateMonicaConstant(gregsEnergy, thermo.reactivity, kalchm)
    : null;

  let kinetics: KineticMetrics | null = null;
  try {
    kinetics = calculateMethodSpecificKinetics({
      methodId: id,
      elementalEffect: method.elementalEffect,
      transformedESMS,
      thermodynamics: thermo,
      gregsEnergy,
      monica,
      kineticProfile: method.kineticProfile,
      planetaryPositions:
        moment.planetaryPositions &&
        Object.keys(moment.planetaryPositions).length > 0
          ? moment.planetaryPositions
          : signPositions,
    });
  } catch {
    /* kinetics stay null */
  }

  const kProfile = getKineticProfile(id, method.kineticProfile);

  const harmony = calculateHarmonyIndex(
    {
      transformedESMS,
      elementalEffect: method.elementalEffect,
      thermodynamics: thermo,
      gregsEnergy,
      kalchm,
      monica,
      duration: resolveDuration(method),
      kineticPower: kinetics?.power,
    },
    moment.userIntent ?? null,
    { highStress: moment.highStress ?? false },
    moment.focusMode ?? "harmony",
  );

  return {
    id,
    baseESMS,
    transformedESMS,
    pillar,
    thermo,
    gregsEnergy,
    kalchm,
    monica,
    kinetics,
    kProfile,
    harmony,
  };
}

export interface RankedMethodSnapshot {
  id: string;
  method: CookingMethodData;
  snapshot: MethodAlchemicalSnapshot;
}

/** Score every method for the moment, sorted by harmony (best first). */
export function rankMethodsForMoment(
  methods: Record<string, CookingMethodData>,
  moment: MethodMomentInput = {},
): RankedMethodSnapshot[] {
  return Object.entries(methods)
    .map(([id, method]) => ({
      id,
      method,
      snapshot: computeMethodSnapshot(id, method, moment),
    }))
    .sort((a, b) => b.snapshot.harmony.harmonyIndex - a.snapshot.harmony.harmonyIndex);
}
