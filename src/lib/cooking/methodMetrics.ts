/**
 * Derived, comparable metrics for cooking methods.
 *
 * Turns the raw physics in `methodPhysics.ts` into the handful of numbers a UI
 * can put in front of a cook, each carrying enough context to be read rather
 * than merely displayed.
 *
 * ── Why z-scores ────────────────────────────────────────────────────────────
 *
 * "h = 3000 W·m⁻²·K⁻¹" is meaningless to almost everyone. "z = +1.8 against all
 * 26 methods — near the top of the range" is immediately actionable. A raw
 * number with no distribution behind it is decoration; the z-score is what
 * makes it information.
 *
 * Two deliberate choices:
 *
 *  1. h is standardised on LOG10, not on the raw value. The coefficient spans
 *     4 orders of magnitude (8 → 10 000), so a linear z-score would put every
 *     method except steaming and pressure cooking within a fraction of a sigma
 *     of each other and report the two outliers at z ≈ +3. Logging first is the
 *     only way the middle of the range discriminates at all.
 *
 *  2. Median and MAD-sigma rather than mean and standard deviation, reusing
 *     `src/lib/environment/robustStats.ts`. n = 26 with genuine outliers is
 *     exactly the regime where a mean-based z-score is dragged around by the
 *     tail it is supposed to be measuring.
 *
 * ── The reference load ──────────────────────────────────────────────────────
 *
 * Cross-method time comparison needs a fixed question. Ours is: how long to
 * bring the CENTRE of a 25 mm slab of lean muscle from 5 °C to 60 °C?
 *
 * It only has an answer for methods whose medium is hotter than 60 °C. For the
 * rest the honest output is null with a stated reason — a fermentation crock
 * has no 60 °C core time, and inventing one would be exactly the failure this
 * whole layer exists to remove.
 *
 * @file src/lib/cooking/methodMetrics.ts
 */

import {
  COOKWARE_DERIVED,
  contactTemperatureC,
  getCookware,
  type CookwareDerived,
} from "@/data/cooking/cookwareMaterials";
import {
  METHOD_PHYSICS,
  type MethodPhysicsProfile,
  type RateLimiter,
  type AltitudeResponse,
} from "@/data/cooking/methodPhysics";
import {
  altitudeTimeMultiplier,
  boilingPointCAtElevation,
  cToF,
  slabCoreTime,
  type SlabCookResult,
} from "@/lib/cooking/thermo";
import { robustStat, robustZScore, type RobustStat } from "@/lib/environment/robustStats";

// ============================================================================
// The reference load
// ============================================================================

export const REFERENCE_LOAD = {
  thicknessMm: 25,
  initialC: 5,
  targetC: 60,
  description: "25 mm slab of lean muscle, 5 °C → 60 °C core",
} as const;

/** A medium must clear the target by this margin for the core time to be finite. */
const REFERENCE_HEADROOM_C = 2;

export interface ReferenceCookTime {
  result: SlabCookResult | null;
  /** Present only when `result` is null. */
  unavailableReason: string | null;
}

/**
 * Rate limiters for which a core-temperature time is the right question.
 *
 * ⚠️ Having an `h` is NOT sufficient. Smoking has a perfectly real convective
 * coefficient of ~20 W·m⁻²·K⁻¹, and feeding it to the slab solution returns
 * 36 min — a confident, precise, and completely wrong answer, because smoking
 * is paced by phenol deposition and the evaporative stall over many hours, not
 * by conduction to the core. Answering a mass-transfer question with a
 * heat-transfer number is the exact class of error this module exists to end.
 */
const CORE_TIME_LIMITERS: ReadonlySet<RateLimiter> = new Set(["heat-transfer", "phase-change"]);

/**
 * Time to bring the reference load to core with this method.
 *
 * Returns a reason instead of a number whenever the question does not apply —
 * a medium at or below the target never gets there however long you wait, and
 * a method paced by diffusion has no core-temperature answer at all.
 */
export function referenceCookTime(physics: MethodPhysicsProfile): ReferenceCookTime {
  if (!CORE_TIME_LIMITERS.has(physics.rateLimiter)) {
    return {
      result: null,
      unavailableReason: `Paced by ${physics.rateLimiter.replace("-", " ")}, not by heat reaching the core — a core-temperature time would not describe this method.`,
    };
  }
  if (!physics.h) {
    return {
      result: null,
      unavailableReason: "No heat transfer coefficient — this method does not move heat into food.",
    };
  }
  if (physics.mediumC <= REFERENCE_LOAD.targetC + REFERENCE_HEADROOM_C) {
    return {
      result: null,
      unavailableReason: `Medium runs at ${Math.round(physics.mediumC)} °C — it cannot carry a core to ${REFERENCE_LOAD.targetC} °C.`,
    };
  }
  return {
    result: slabCoreTime({
      thicknessMm: REFERENCE_LOAD.thicknessMm,
      mediumC: physics.mediumC,
      initialC: REFERENCE_LOAD.initialC,
      targetC: REFERENCE_LOAD.targetC,
      hWm2K: physics.h.typical,
    }),
    unavailableReason: null,
  };
}

// ============================================================================
// Corpus statistics
// ============================================================================

export interface MethodCorpusStats {
  /** Over log10(h.typical), for methods that have an h. */
  logH: RobustStat;
  /** Over medium temperature in °C, all methods. */
  mediumC: RobustStat;
  /** Over reference core time in minutes, methods where it is defined. */
  coreMinutes: RobustStat;
  /** How many methods contributed to each. */
  counts: { logH: number; mediumC: number; coreMinutes: number };
}

let cachedCorpus: MethodCorpusStats | null = null;

/**
 * Robust baselines over the whole method corpus.
 *
 * Computed once from `METHOD_PHYSICS` and memoised. Deterministic — the corpus
 * is static data, so this cannot go stale within a process.
 */
export function getMethodCorpusStats(): MethodCorpusStats {
  if (cachedCorpus) return cachedCorpus;

  const logH: number[] = [];
  const mediumC: number[] = [];
  const coreMinutes: number[] = [];

  for (const physics of Object.values(METHOD_PHYSICS)) {
    if (physics.h) logH.push(Math.log10(physics.h.typical));
    mediumC.push(physics.mediumC);
    const { result } = referenceCookTime(physics);
    if (result) coreMinutes.push(result.minutes);
  }

  cachedCorpus = {
    logH: robustStat(logH),
    mediumC: robustStat(mediumC),
    coreMinutes: robustStat(coreMinutes),
    counts: { logH: logH.length, mediumC: mediumC.length, coreMinutes: coreMinutes.length },
  };
  return cachedCorpus;
}

/** Test seam — the corpus is static, so this only exists for suites that mutate it. */
export function _resetCorpusCache(): void {
  cachedCorpus = null;
}

/**
 * Plain-language reading of a z-score.
 *
 * Bands are the conventional ones: within ±0.5 sigma is unremarkable, beyond
 * ±2 is an outlier. Returns null for a null z so the caller must handle the
 * "no measurable spread" case rather than defaulting it to "typical".
 */
export function describeZ(z: number | null): string | null {
  if (z === null) return null;
  const magnitude = Math.abs(z);
  const direction = z > 0 ? "above" : "below";
  if (magnitude < 0.5) return "typical for a cooking method";
  if (magnitude < 1) return `slightly ${direction} the median method`;
  if (magnitude < 2) return `well ${direction} the median method`;
  return `an outlier — far ${direction} every other method`;
}

// ============================================================================
// Per-method assembled metrics
// ============================================================================

export interface EquipmentImpact extends CookwareDerived {
  /** Interface temperature the instant 5 °C food lands, °C. */
  contactC: number;
  /** How far the interface falls below the pan's own temperature, K. */
  dropK: number;
}

export interface MethodPhysicsMetrics {
  methodId: string;
  physics: MethodPhysicsProfile;
  rateLimiter: RateLimiter;

  /** Transfer coefficient with its standing in the corpus. */
  transfer: {
    typical: number;
    low: number;
    high: number;
    regime: string;
    /** z of log10(h) against all methods that have one. */
    z: number | null;
    zNote: string | null;
  } | null;

  medium: {
    celsius: number;
    fahrenheit: number;
    z: number | null;
    zNote: string | null;
  };

  reference: ReferenceCookTime & {
    z: number | null;
    zNote: string | null;
  };

  /** Contact behaviour for each material this method calls for. */
  equipment: EquipmentImpact[];

  /** Whether browning chemistry is reachable at all. */
  browning: {
    available: boolean;
    explanation: string;
  };
}

/**
 * Pan temperature used for the contact-temperature comparison, °C.
 * A realistic preheat for a searing method; only the RANKING between materials
 * is meaningful, and that ranking is insensitive to this choice.
 */
const CONTACT_PAN_C = 230;

export function buildMethodMetrics(methodId: string): MethodPhysicsMetrics | null {
  const physics = METHOD_PHYSICS[methodId];
  if (!physics) return null;

  const corpus = getMethodCorpusStats();

  const transferZ = physics.h ? robustZScore(Math.log10(physics.h.typical), corpus.logH) : null;
  const mediumZ = robustZScore(physics.mediumC, corpus.mediumC);
  const reference = referenceCookTime(physics);
  const referenceZ = reference.result
    ? robustZScore(reference.result.minutes, corpus.coreMinutes)
    : null;

  const equipment: EquipmentImpact[] = physics.recommendedMaterials
    .map((id) => getCookware(id))
    .filter((m): m is CookwareDerived => m !== null)
    .map((material) => {
      const contactC = contactTemperatureC(CONTACT_PAN_C, REFERENCE_LOAD.initialC, material.effusivity);
      return { ...material, contactC, dropK: CONTACT_PAN_C - contactC };
    });

  return {
    methodId,
    physics,
    rateLimiter: physics.rateLimiter,
    transfer: physics.h
      ? {
          typical: physics.h.typical,
          low: physics.h.low,
          high: physics.h.high,
          regime: physics.h.regime,
          z: transferZ,
          zNote: describeZ(transferZ),
        }
      : null,
    medium: {
      celsius: physics.mediumC,
      fahrenheit: cToF(physics.mediumC),
      z: mediumZ,
      zNote: describeZ(mediumZ),
    },
    reference: { ...reference, z: referenceZ, zNote: describeZ(referenceZ) },
    equipment,
    browning: {
      available: physics.surfaceCanBrown,
      explanation: physics.surfaceCanBrown
        ? "The surface can dry out and pass 140 °C, so Maillard browning is available."
        : "The surface stays wet and pins at the boiling point, so it never reaches the ~140 °C Maillard threshold. Browning requires a separate dry-heat step.",
    },
  };
}

// ============================================================================
// Environment
// ============================================================================

export interface AltitudeEffect {
  elevationM: number;
  /** Local boiling point of water. */
  boilingC: number;
  boilingF: number;
  /** Shift from sea level, K. Always ≤ 0 above sea level. */
  shiftC: number;
  /** Time multiplier for softening chemistry (Q10 regime). */
  softeningMultiplier: number;
  /** Time multiplier for microbial lethality (z = 5.6 °C regime). */
  pasteurisationMultiplier: number;
  /** Direction and existence of the effect on THIS method. */
  response: AltitudeResponse;
  /** True only when the multipliers describe this method's own cooking time. */
  multipliersApply: boolean;
  note: string;
}

/**
 * What a given elevation does to a method.
 *
 * `response` is the load-bearing field, and it is deliberately not a boolean.
 * Three distinct things can be true of a method at 3000 m:
 *
 *   boiling          penalised    — ceiling falls to 90 °C, softening takes ~2×
 *   pressure cooking compensated  — gauge pressure adds to ambient, restoring
 *                                   and exceeding the sea-level ceiling
 *   dehydrating      accelerated  — a lower vapour-pressure barrier genuinely
 *                                   speeds moisture out
 *   roasting         unaffected   — oven air does not know its own altitude
 *
 * A boolean "sensitive" flag would put boiling and pressure cooking in the same
 * bucket and hand a ×2 slowdown to the one appliance high-altitude kitchens buy
 * *specifically to avoid it*. The multipliers are always returned — they
 * describe the water, which is worth showing — but `multipliersApply` says
 * whether they may be presented as this method's own cooking time.
 */
export function altitudeEffect(methodId: string, elevationM: number): AltitudeEffect | null {
  const physics = METHOD_PHYSICS[methodId];
  if (!physics) return null;

  const boilingC = boilingPointCAtElevation(elevationM);
  const seaLevelC = boilingPointCAtElevation(0);

  return {
    elevationM,
    boilingC,
    boilingF: cToF(boilingC),
    shiftC: boilingC - seaLevelC,
    softeningMultiplier: altitudeTimeMultiplier(elevationM, "softening"),
    pasteurisationMultiplier: altitudeTimeMultiplier(elevationM, "pasteurisation"),
    response: physics.altitudeResponse,
    multipliersApply: physics.altitudeResponse === "penalised",
    note: physics.altitudeNote,
  };
}

/**
 * Rank all materials by how well they hold the interface temperature on contact.
 * Method-independent; useful for an equipment explainer.
 */
export function rankMaterialsByContact(panC = CONTACT_PAN_C, foodC = REFERENCE_LOAD.initialC) {
  return COOKWARE_DERIVED.map((material) => ({
    ...material,
    contactC: contactTemperatureC(panC, foodC, material.effusivity),
  })).sort((a, b) => b.contactC - a.contactC);
}
