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
  mediumTracksWaterCeiling,
  altitudeCriticalTemperatureC,
  type MethodPhysicsProfile,
  type RateLimiter,
  type AltitudeResponse,
} from "@/data/cooking/methodPhysics";
import {
  cToF,
  saturationCeilingAtElevation,
  saturationCeilingFromStationPressure,
  slabCoreTime,
  timeScaleFactor,
  zValueFromQ10,
  Q10_CULINARY,
  Z_VALUE_CULINARY_C,
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

/**
 * Smallest elevation correction worth reporting as a correction, K.
 *
 * `[MEASURED 2026-08-16]` Not a fudge factor — it exists because an exact
 * comparison is wrong at sea level. Stull's Antoine coefficients put saturation
 * at 101.325 kPa at 99.99683 °C rather than exactly 100 °C (a +0.04 % residual
 * on the defining 760 mmHg, which `cookingThermo.test.ts` pins). So a strict
 * `ceiling < nominal` test fires for a boiling pot AT SEA LEVEL, flagging a
 * 3 mK "correction" and telling a cook on the coast that their elevation
 * changed something.
 *
 * 0.1 K is comfortably above that residual and far below any difference a
 * kitchen can express — it corresponds to about 30 m of elevation.
 */
const MEANINGFUL_CLAMP_C = 0.1;

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
  /**
   * The method's own medium temperature AT THIS ELEVATION, and what that does
   * to the reference cook time.
   *
   * `[MEASURED 2026-08-16]` This field exists because the panel used to
   * contradict itself. `mediumC` is a fixed constant, so at Bogotá a card could
   * print "Boiling · medium 212 °F" directly above "water boils at 196 °F here",
   * and the headline "min to core" was computed at the sea-level medium
   * regardless of where the user actually is. Measured understatement of the
   * core time: boiling and steaming 8 % at Denver, 14 % at Bogotá, 20 % at
   * La Paz; braising 1 / 6 / 12 %.
   */
  localizedMedium: LocalizedMedium;
}

/**
 * A method's medium temperature corrected for elevation.
 *
 * Correction applies ONLY where the medium physically sits on water's
 * vapour-pressure curve — see `mediumTracksWaterCeiling`. For a dry sear floor
 * or an oil bath the medium is unchanged, and saying otherwise would invent a
 * penalty rather than remove one.
 */
export interface LocalizedMedium {
  /** Medium temperature at this elevation, °C. */
  celsius: number;
  fahrenheit: number;
  /** True when elevation actually moved it. */
  clamped: boolean;
  /** Change from the nominal medium, K. ≤ 0. */
  shiftC: number;
  /** Reference core time at this elevation, or null where none is defined. */
  coreMinutes: number | null;
  /** Reference core time at sea level, for comparison. */
  seaLevelCoreMinutes: number | null;
  /** Fractional increase in core time, e.g. 0.14 for +14 %. Null when N/A. */
  coreTimeIncrease: number | null;
  /**
   * Set when the medium is on a NON-water vapour-pressure curve and therefore
   * does move with elevation, but not by an amount this library can compute.
   *
   * Distilling runs on ethanol's curve and cryogenic work on nitrogen's. We
   * carry water's Antoine coefficients and nobody else's, so the honest output
   * is a stated refusal rather than a number produced from the wrong curve.
   */
  uncomputableReason?: string;
  /**
   * Set when a MEASURED station pressure exceeded the Antoine validity ceiling
   * and was capped at 101.325 kPa — i.e. the reported medium is a floor, and
   * the real one is up to ~1.7 °C hotter. Never set on the elevation-derived
   * path, where ISA pressure cannot exceed sea level by construction.
   */
  pressureClamped?: boolean;
}

/**
 * A method's medium temperature and reference core time at a given elevation.
 *
 * The clamp is `min(nominal, localBoilingPoint)`, which is self-thresholding:
 * a 95 °C braise liquid is untouched until roughly 1510 m, a 91 °C simmer until
 * 2710 m and an 88 °C stew until 3610 m, because until then the ceiling is
 * still above them. No per-method threshold table is needed or wanted — one
 * would be a second thing to keep in step with the first.
 */
/**
 * @param stationPressureKpa Optional MEASURED absolute station pressure. When
 *   present it supersedes the ISA pressure implied by `elevationM` — a
 *   barometer beats a model, including on the days the model is furthest off
 *   (a deep low can drop the local ceiling a further ~1 °C below what ISA
 *   predicts for that elevation). Omit it and behaviour is byte-identical to
 *   before this parameter existed.
 */
export function localizedMedium(
  methodId: string,
  elevationM: number,
  stationPressureKpa?: number,
): LocalizedMedium | null {
  const physics = METHOD_PHYSICS[methodId];
  if (!physics) return null;

  const nominalC = physics.mediumC;
  const seaLevelCoreMinutes = referenceCookTime(physics).result?.minutes ?? null;

  const unchanged = (uncomputableReason?: string): LocalizedMedium => ({
    celsius: nominalC,
    fahrenheit: cToF(nominalC),
    clamped: false,
    shiftC: 0,
    coreMinutes: seaLevelCoreMinutes,
    seaLevelCoreMinutes,
    coreTimeIncrease: seaLevelCoreMinutes === null ? null : 0,
    ...(uncomputableReason ? { uncomputableReason } : {}),
  });

  if (physics.mediumKind === "non-aqueous-saturated") {
    return unchanged(
      "This medium sits on another substance's vapour-pressure curve — ethanol for distilling, " +
        "nitrogen for cryogenic work. It does fall with elevation, but not by water's Antoine " +
        "relation, which is the only one this library carries. Applying water's curve here would " +
        "produce a confident number read off the wrong graph.",
    );
  }

  if (!mediumTracksWaterCeiling(physics)) return unchanged();

  // A measured barometer supersedes the ISA model; absent one, elevation is the
  // only evidence we have. BOTH paths saturate at the Antoine limit and report
  // it, because both can exceed it: a high-pressure system above 101.325 kPa,
  // and — the one that is easy to miss — any elevation below −3.98 m, where ISA
  // pressure alone is already past the limit. Death Valley and the Turfan
  // Depression are not hypothetical inputs.
  const ceiling =
    stationPressureKpa !== undefined
      ? saturationCeilingFromStationPressure(stationPressureKpa)
      : saturationCeilingAtElevation(elevationM);
  const ceilingC = ceiling.celsius;
  const pressureClamped = ceiling.clamped;

  if (ceilingC >= nominalC - MEANINGFUL_CLAMP_C) {
    const result = unchanged();
    return pressureClamped ? { ...result, pressureClamped } : result;
  }

  const coreMinutes = referenceCookTime({ ...physics, mediumC: ceilingC }).result?.minutes ?? null;

  return {
    celsius: ceilingC,
    fahrenheit: cToF(ceilingC),
    clamped: true,
    shiftC: ceilingC - nominalC,
    coreMinutes,
    seaLevelCoreMinutes,
    coreTimeIncrease:
      coreMinutes === null || seaLevelCoreMinutes === null || seaLevelCoreMinutes === 0
        ? null
        : coreMinutes / seaLevelCoreMinutes - 1,
    ...(pressureClamped ? { pressureClamped } : {}),
  };
}

/**
 * The temperature elevation acts on for this method, against the local ceiling.
 *
 * Exposed so a caller can explain WHY a method is penalised when its displayed
 * medium did not move — tilt-skillet's sear floor stays at 424 °F while its
 * covered braise liquid follows the ceiling down.
 */
export function altitudeCriticalGap(
  methodId: string,
  elevationM: number,
): { criticalC: number; ceilingC: number; squeezed: boolean; differsFromMedium: boolean } | null {
  const physics = METHOD_PHYSICS[methodId];
  if (!physics) return null;
  const criticalC = altitudeCriticalTemperatureC(physics);
  // Saturating: this takes a caller-supplied elevation and must not throw
  // below sea level. Identical at every non-negative elevation.
  const ceilingC = saturationCeilingAtElevation(elevationM).celsius;
  return {
    criticalC,
    ceilingC,
    squeezed: ceilingC < criticalC,
    differsFromMedium: criticalC !== physics.mediumC,
  };
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
/**
 * @param stationPressureKpa Optional MEASURED station pressure, which supersedes
 *   the ISA pressure implied by `elevationM` throughout — the headline boiling
 *   point, the time multipliers and the localized medium all come off the same
 *   reading, so the card cannot show a measured medium beside a modelled boil.
 */
export function altitudeEffect(
  methodId: string,
  elevationM: number,
  stationPressureKpa?: number,
): AltitudeEffect | null {
  const physics = METHOD_PHYSICS[methodId];
  if (!physics) return null;

  // Saturating on both: `elevationM` is caller-supplied and below −3.98 m the
  // raw composition throws. The sea-level reference is saturated too, purely so
  // the two sides of `shiftC` come off the same function.
  const ceiling =
    stationPressureKpa !== undefined
      ? saturationCeilingFromStationPressure(stationPressureKpa)
      : saturationCeilingAtElevation(elevationM);
  const boilingC = ceiling.celsius;
  const seaLevelC = saturationCeilingAtElevation(0).celsius;

  const shiftC = boilingC - seaLevelC;

  return {
    elevationM,
    boilingC,
    boilingF: cToF(boilingC),
    shiftC,
    // Derived from the SAME ceiling as `boilingC` rather than re-entered from
    // elevation, so a measured barometer moves the multipliers too. With no
    // measurement this is identical to `altitudeTimeMultiplier(elevationM, …)`
    // by construction — both are `timeScaleFactor` of the same shift.
    softeningMultiplier: timeScaleFactor(shiftC, zValueFromQ10(Q10_CULINARY)),
    pasteurisationMultiplier: timeScaleFactor(shiftC, Z_VALUE_CULINARY_C),
    response: physics.altitudeResponse,
    multipliersApply: physics.altitudeResponse === "penalised",
    note: physics.altitudeNote,
    localizedMedium: localizedMedium(methodId, elevationM, stationPressureKpa)!,
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
