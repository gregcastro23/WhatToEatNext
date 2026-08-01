import { z } from "zod";
import { CANONICAL_COOKING_METHOD_KEYS } from "@/constants/cookingMethodKeys";

/**
 * Environmental Thermodynamics — canonical contracts.
 *
 * Implements the Dual-Baseline Engine: an elevation-derived *climatic baseline*
 * (permanent, geographic) plus a *daily anomaly* (transient, weather-driven).
 * Absolute physics sets the trunk; the anomaly drives the daily advisory.
 *
 * Three rules govern every number in this file:
 *
 *  1. Every coefficient names its `basis` and a `source` a reader can re-derive it
 *     from. No value exists because it "felt right".
 *  2. Physics identities (Boyle, Clausius–Clapeyron) carry `tunable: false`. They are
 *     not free parameters and must never be fitted.
 *  3. Advisories are gated on the *computed effect size*, never on the driver
 *     magnitude. A 1.5 kPa front is a large pressure anomaly and a ~1.5% leavening
 *     effect; only one of those is worth telling a user about.
 */

// ============================================================================
// 1. Canonical method key-space  (Q14A)
// ============================================================================

/**
 * The single canonical method key-space. Supersedes four divergent registries:
 *   - `CookingMethod` union            (src/types/shared.ts — 18 keys, kebab-case, has a
 *                                       literal "method_name" placeholder)
 *   - `COOKING_METHOD_PILLAR_MAPPING`  (src/constants/alchemicalPillars.ts — 27 keys)
 *   - `COOKING_METHOD_KINETIC_PROFILES`(src/utils/cookingMethodKinetics.ts — 28 keys)
 *   - `METHOD_PHYSICAL_REFERENCE`      (src/data/cooking/physicalReference.ts)
 *
 * snake_case throughout. Every registry must be total over this list; the
 * coverage test is the enforcement point.
 */
// The canonical key space now lives in src/constants/cookingMethodKeys.ts, which
// owns the cooking-method domain. It was duplicated here; two hand-maintained
// lists of the same 31 strings is the exact fracture this schema was written to
// describe.
export const CANONICAL_COOKING_METHODS = CANONICAL_COOKING_METHOD_KEYS;

export const cookingMethodKeySchema = z.enum(
  CANONICAL_COOKING_METHOD_KEYS as unknown as [string, ...string[]],
);
export type CookingMethodKey = z.infer<typeof cookingMethodKeySchema>;

/**
 * Legacy spellings → canonical key. Read-only migration aid: normalize at the
 * registry boundary, never persist a legacy key.
 */
export const COOKING_METHOD_KEY_ALIASES: Readonly<Record<string, CookingMethodKey>> = {
  "stir-frying": "stir_frying",
  "tilt-skillet": "tilt_skillet",
  fermenting: "fermentation",
  drying: "dehydrating",
  sous_vide: "sous_vide",
  "sous-vide": "sous_vide",
  "pressure-cooking": "pressure_cooking",
};

// ============================================================================
// 2. Value basis  (defensible-values standard)
// ============================================================================

export const valueBasisSchema = z.enum([
  /** Read from an instrument or a published measurement. `source` cites it. */
  "MEASURED",
  /** Follows from a physical law + stated constants. `source` gives the formula. */
  "DERIVED",
  /** Produced by this engine from MEASURED/DERIVED inputs at request time. */
  "COMPUTED",
  /** No trustworthy input. The dependent advisory must be suppressed, not defaulted. */
  "ABSENT",
]);
export type ValueBasis = z.infer<typeof valueBasisSchema>;

/**
 * A physical coefficient with its provenance attached. `source` must be
 * sufficient to reconstruct `value` without reading this file's git history.
 */
export const physicalCoefficientSchema = z.object({
  value: z.number(),
  /** Explicit units, e.g. "degC/kPa", "fraction_per_kPa", "fraction_per_degC_dewpoint". */
  unit: z.string(),
  basis: valueBasisSchema,
  source: z.string().describe("Formula with constants, or a literature citation."),
  /**
   * false for physics identities that must never be fitted (Boyle's law, the
   * Clausius–Clapeyron slope). true for empirical culinary coefficients that
   * may be calibrated against observed outcomes.
   */
  tunable: z.boolean(),
});
export type PhysicalCoefficient = z.infer<typeof physicalCoefficientSchema>;

// ============================================================================
// 3. Regimes and response channels  (Q13C, plus the surface/interior split)
// ============================================================================

export const cookingRegimeSchema = z.enum([
  /** Temperature ceiling is the medium's boiling point. Pressure is first-order. */
  "saturation_limited",
  /** Temperature is set by equipment. Pressure ~0 effect; humidity acts on the surface. */
  "setpoint_limited",
  /** Rate is set by vapour-pressure deficit. Humidity is first-order. */
  "evaporation_limited",
  /** Target is a solute concentration, read out via boiling point. Both drivers shift the readout. */
  "concentration_limited",
  /** Rate/extent is set by gas-phase expansion against ambient pressure. */
  "leavening_limited",
  /** No applied heat. Drivers act only through storage and biological rate. */
  "ambient_limited",
]);
export type CookingRegime = z.infer<typeof cookingRegimeSchema>;

/**
 * Response channels.
 *
 * A method is not one number. Humidity moves a roast's surface and its interior
 * in *opposite* directions: higher ambient moisture slows surface drying (browning
 * is delayed) while raising the wet-bulb plateau (the interior stalls less). A
 * single per-method scalar cannot express that, and would silently pick a side.
 */
export const responseChannelSchema = z.enum([
  /** The cooking medium's own state — water's boiling point, oil temp, cavity air. */
  "medium",
  /** Crust, browning front, surface dehydration. */
  "surface",
  /** Core temperature, time-to-doneness. */
  "interior",
  /** Gas-phase expansion — yeast and chemical leaveners. */
  "leavening",
  /** Pre-cook hygroscopic state of dry stores (the Pantry Hydration Index). */
  "ingredient",
]);
export type ResponseChannel = z.infer<typeof responseChannelSchema>;

/** The knob a channel turns. One channel writes exactly one axis. */
export const adjustmentAxisSchema = z.enum([
  "time_multiplier",
  "temperature_delta_c",
  "hydration_multiplier",
  "expansion_multiplier",
]);
export type AdjustmentAxis = z.infer<typeof adjustmentAxisSchema>;

/**
 * Which humidity clock a channel reads.
 *
 * Exposed sugar work equilibrates with room air in minutes; flour in a sealed bin
 * takes days to weeks. Driving the Pantry Hydration Index off *today's* dew point
 * would claim an effect that the physical process has not had time to produce.
 */
export const humidityClockSchema = z.enum([
  /** Today's reading. Exposed surfaces, open-air cooking, live cavity air. */
  "instant",
  /** Exponentially-weighted trend. Bulk dry stores reaching sorption equilibrium. */
  "lagged",
]);
export type HumidityClock = z.infer<typeof humidityClockSchema>;

// ============================================================================
// 4. Per-channel response
// ============================================================================

export const driverResponseSchema = z.object({
  coefficient: physicalCoefficientSchema,
  axis: adjustmentAxisSchema,
  /**
   * Effect-size floor, in the units of `axis`. Below this the advisory is
   * suppressed as physically trivial — the gate is on the computed effect, not
   * on the driver. e.g. 0.03 on `time_multiplier` suppresses anything under 3%.
   */
  minimumEffect: z.number().nonnegative(),
  /**
   * Statistical floor, in MAD-sigmas. Second half of the dual gate: an advisory
   * fires only when |z| ≥ minimumZ AND effect ≥ minimumEffect.
   *
   * Both are required. Z alone would fire on rare-but-trivial days; effect alone
   * would ignore that "unusual here" is what makes a daily tip worth reading.
   */
  minimumZ: z.number().nonnegative(),
  /** Hard clamp on |effect|. Prevents extrapolating a local linearization. */
  maximumEffect: z.number().positive(),
});
export type DriverResponse = z.infer<typeof driverResponseSchema>;

export const channelResponseSchema = z.object({
  channel: responseChannelSchema,
  regime: cookingRegimeSchema,
  /**
   * How much of the *outdoor* anomaly actually reaches this channel, 0–1.
   *
   * This is the field that keeps the engine honest. A closed oven's cavity
   * humidity is dominated by the food's own moisture release and the vent, not
   * by intake air — coupling ~0.15. An offset smoker breathes ambient air —
   * ~0.95. A deep fryer's oil does not care about outdoor humidity at all — ~0.05.
   * Without this term, "crank your oven because it's humid outside" is fabricated.
   */
  ambientCoupling: physicalCoefficientSchema,
  pressure: driverResponseSchema.nullable(),
  humidity: driverResponseSchema.nullable(),
  humidityClock: humidityClockSchema,
  /** Plain-language mechanism. Feeds `causal_chain[].effect`; never invented downstream. */
  mechanism: z.string(),
});
export type ChannelResponse = z.infer<typeof channelResponseSchema>;

// ============================================================================
// 5. ENVIRONMENTAL_RESPONSE_PROFILE registry  (Q12B)
// ============================================================================

/**
 * Joined to `COOKING_METHOD_KINETIC_PROFILES` and `COOKING_METHOD_PILLAR_MAPPING`
 * at calc time by `CookingMethodKey`. Deliberately not merged into
 * `CookingMethodData`, which is already ~40 optional fields deep.
 */
export const environmentalResponseProfileSchema = z.object({
  method: cookingMethodKeySchema,
  /** The regime that governs when no channel qualifies. Drives the score vector. */
  primaryRegime: cookingRegimeSchema,
  /**
   * Ordered, at least one. Bread carries `leavening` + `ingredient` + `surface`;
   * a roast carries `surface` + `interior` pulling opposite ways.
   */
  channels: z.array(channelResponseSchema).min(1),
  /**
   * Set when the method supplies its own pressure vessel. Absolute pressure is
   * ambient + gauge, so altitude propagates *through* the appliance rather than
   * being cancelled by it: 15 psi gauge in Denver is ~117 °C, not 121 °C.
   */
  vesselPressure: z
    .object({
      regulation: z.enum([
        /** Weight/spring valve holds a fixed gauge pressure. Altitude carries through. */
        "fixed_gauge",
        /** Electric controller, typically ~10–11.6 psi and often lower than stovetop. */
        "electronic",
        /** Sealed but unregulated. */
        "passive",
      ]),
      gaugeKpa: physicalCoefficientSchema,
      /** Surface a USDA dial-gauge altitude note when canning is implied. */
      canningAdvisory: z.boolean(),
    })
    .nullable(),
  notes: z.string().optional(),
});
export type EnvironmentalResponseProfile = z.infer<typeof environmentalResponseProfileSchema>;

export const environmentalResponseRegistrySchema = z.record(
  cookingMethodKeySchema,
  environmentalResponseProfileSchema,
);
export type EnvironmentalResponseRegistry = z.infer<typeof environmentalResponseRegistrySchema>;

// ============================================================================
// 6. Regime kinetics  (Q3C — per-regime activation energies)
// ============================================================================

/**
 * ΔT_medium → time multiplier, per regime.
 *
 * Stated as activation energy rather than Q10, because Q10 is not a constant:
 * Q10 = 2 is ~53 kJ/mol at room temperature and ~81 kJ/mol at boiling. Quoting
 * a bare "Q10 = 2" hides which one you meant. `q10AtReference` is printed for
 * intuition only and must be recomputed from `activationEnergyKjMol`, never
 * stored independently of it.
 */
export const regimeKineticsSchema = z.object({
  regime: cookingRegimeSchema,
  activationEnergyKjMol: physicalCoefficientSchema,
  /** Kelvin. The temperature the Arrhenius linearization is centred on. */
  referenceTemperatureK: z.number().positive(),
  /** Display-only. exp(Ea/R · (1/T − 1/(T+10))) at `referenceTemperatureK`. */
  q10AtReference: z.number().positive(),
  /**
   * Set for regimes carrying a food-safety consequence. Microbial lethality
   * follows a z-value, not the softening kinetics, and must not be collapsed
   * into the comfort-time multiplier.
   */
  lethalityZValueC: z.number().positive().nullable(),
});
export type RegimeKinetics = z.infer<typeof regimeKineticsSchema>;

// ============================================================================
// 7. Environment reading — the Dual-Baseline state  (Q2B, Q4B, Q9B, Q11C, Q16)
// ============================================================================

/**
 * Robust location + dispersion for one driver over the trailing window.
 *
 * Median and MAD rather than mean and σ, because the events worth flagging are
 * precisely the outliers — and a classical σ lets a storm inflate the denominator
 * that would have detected it, suppressing the next month of alerts.
 */
export const robustStatSchema = z.object({
  median: z.number(),
  /** MAD × 1.4826 — a σ-equivalent that outliers cannot inflate. Denominator for z. */
  madSigma: z.number().nonnegative(),
  unit: z.string(),
  basis: valueBasisSchema,
});
export type RobustStat = z.infer<typeof robustStatSchema>;

export const climaticBaselineSchema = z.object({
  /** Elevation-derived via the ISA barometric formula. The permanent trunk. */
  pressureKpa: physicalCoefficientSchema,
  /** Trailing-30d robust stats. These are the z-score denominators. */
  surfacePressure: robustStatSchema,
  dewPoint: robustStatSchema,
  /**
   * Days of observation actually behind the stats above. MAD over a handful of
   * samples is close to meaningless, so this gates the confidence basis.
   */
  sampleDays: z.number().int().nonnegative(),
  /**
   * Resolved at full DEM fidelity — deliberately NOT the p5 geohash cell centroid.
   * A ~5 km cell in rugged terrain can span enough elevation to move the boiling
   * point by more than a degree, and elevation is the dominant term.
   */
  elevationM: z.number(),
  elevationBasis: valueBasisSchema,
  /** True while the window was seeded from the archive rather than sampled live. */
  archiveSeeded: z.boolean(),
});

export const liveReadingSchema = z.object({
  /**
   * Station pressure. NEVER `pressure_msl`.
   *
   * Sea-level-adjusted pressure has the altitude signal removed by construction:
   * feed it to a boiling-point solver and Denver returns ~100 °C. Open-Meteo's
   * `surface_pressure` is correct here; its `pressure_msl` is not.
   */
  surfacePressureKpa: physicalCoefficientSchema,
  dewPointC: physicalCoefficientSchema,
  /** Lagged dew point for the `ingredient` channel. Null until the EMA has warmed up. */
  dewPointEmaC: physicalCoefficientSchema.nullable(),
  /** Time constant behind `dewPointEmaC`, in days. */
  emaTimeConstantDays: z.number().positive(),
  outdoorAirTempC: physicalCoefficientSchema,
  observedAt: z.string().datetime(),
  /** Age gate. Past the TTL, degrade to climatic baseline and suppress humidity. */
  stale: z.boolean(),
});

/**
 * Indoor state. Dew point transports across the wall largely unchanged; relative
 * humidity does not (80% RH at 10 °C outdoors is drier air than 40% RH at 22 °C
 * indoors). So RH is always *recomputed* here from the transported dew point,
 * never carried in from the API.
 */
export const indoorStateSchema = z.object({
  assumedAirTempC: z.number(),
  assumedAirTempBasis: valueBasisSchema,
  /** Magnus–Tetens (Alduchov–Eskridge a=17.625, b=243.04), ±0.4 °C over −45…60 °C. */
  relativeHumidityPct: physicalCoefficientSchema,
  /** True once a user profile supplies it (e.g. "no A/C"). */
  userOverridden: z.boolean(),
});

/**
 * The daily anomaly, in both physical and statistical units.
 *
 * Physical Δ says how much the cooking changes; z says how unusual today is for
 * THIS location. Neither substitutes for the other — a −1.8 kPa swing is routine
 * on the Gulf coast in hurricane season and a 3σ event in Denver, while a 3σ event
 * in a very calm climate can still be a physically trivial half-percent.
 */
export const anomalyVectorSchema = z.object({
  /** live.surfacePressureKpa − baseline.surfacePressure.median */
  pressureKpa: z.number(),
  /** live.dewPointC − baseline.dewPoint.median */
  dewPointC: z.number(),
  /** live.dewPointEmaC − baseline.dewPoint.median. Drives the `ingredient` channel. */
  dewPointLaggedC: z.number().nullable(),
  /** pressureKpa / baseline.surfacePressure.madSigma */
  pressureZ: z.number(),
  /** dewPointC / baseline.dewPoint.madSigma */
  dewPointZ: z.number(),
  dewPointLaggedZ: z.number().nullable(),
});
export type AnomalyVector = z.infer<typeof anomalyVectorSchema>;

export const environmentReadingSchema = z.object({
  geohash: z.string(),
  climaticBaseline: climaticBaselineSchema,
  live: liveReadingSchema.nullable(),
  indoor: indoorStateSchema,
  anomaly: anomalyVectorSchema.nullable(),
  /**
   * Q11C. When live data is unavailable the baseline physics stands on its own
   * and only the humidity-driven advisories go dark.
   */
  degradation: z
    .enum(["none", "live_unavailable", "live_stale", "humidity_unavailable", "no_location"])
    .default("none"),
});
export type EnvironmentReading = z.infer<typeof environmentReadingSchema>;

// ============================================================================
// 8. Stitch payload  (Q17B + Q18, Q19B, Q20D)
// ============================================================================
// snake_case across the service boundary, matching tiltSkilletSchema.

/** One hop of the causal chain. Stitch composes UI from these; it never does physics. */
export const causalStepSchema = z.object({
  factor: z.string().describe("e.g. 'surface_pressure', 'indoor_dew_point'"),
  from: z.number(),
  to: z.number(),
  unit: z.string(),
  /** The mechanism this hop expresses, lifted from `ChannelResponse.mechanism`. */
  effect: z.string(),
  /** Signed, in the units of the axis this hop writes. */
  magnitude: z.number(),
  axis: adjustmentAxisSchema,
  channel: responseChannelSchema,
  basis: valueBasisSchema,
});
export type CausalStep = z.infer<typeof causalStepSchema>;

/** Q18: full spectrum, so the UI can isolate the daily delta from the geography. */
export const mediumStateSchema = z.object({
  boiling_point_c: z.object({
    sea_level: z.number(),
    climatic_baseline: z.number(),
    today: z.number(),
    /** today − climatic_baseline. The number the daily tip is actually about. */
    anomaly_delta: z.number(),
    /** climatic_baseline − sea_level. The number the geography tip is about. */
    elevation_delta: z.number(),
  }),
  /** Present only when `vesselPressure` is set. Absolute = ambient + gauge. */
  vessel_absolute_kpa: z.number().nullable(),
  vessel_boiling_point_c: z.number().nullable(),
});

export const adjustmentsSchema = z.object({
  time_multiplier: z.number().nullable(),
  temperature_delta_c: z.number().nullable(),
  hydration_multiplier: z.number().nullable(),
  expansion_multiplier: z.number().nullable(),
});

/**
 * Q19B: per-regime, not a scalar. Denver is punishing for beans and unremarkable
 * for roasting; one number cannot say both.
 */
export const regimeScoreVectorSchema = z.record(cookingRegimeSchema, z.number().min(0).max(100));

export const advisoryScoresSchema = z.object({
  /** Q20D. Against sea-level standard conditions. Educates on geography; stable. */
  absolute: regimeScoreVectorSchema,
  /** Q20D. Against this location's own climatic baseline. The daily hook; mean-reverting to ~50. */
  relative: regimeScoreVectorSchema,
  composite_absolute: z.number().min(0).max(100),
  composite_relative: z.number().min(0).max(100),
});

/**
 * Backend-composed prose. Kept alongside the structured chain — not instead of it —
 * and generated *from* the computed magnitudes so the copy cannot drift from the
 * math. Stitch may render this verbatim or build its own from `causal_chain`.
 */
export const narrativeChainSchema = z.object({
  trigger: z.string(),
  mechanism: z.string(),
  action: z.string(),
});

export const environmentalAdvisoryPayloadSchema = z.object({
  schema_version: z.literal("1.0.0"),
  method: cookingMethodKeySchema,
  regime: cookingRegimeSchema,

  location: z.object({
    geohash: z.string(),
    elevation_m: z.number(),
    elevation_basis: valueBasisSchema,
  }),

  environmental_factors: z.object({
    pressure_anomaly_kpa: z.number().nullable(),
    dew_point_anomaly_c: z.number().nullable(),
    /** How unusual today is for THIS location, in MAD-sigmas. Drives "rarest in 30 days" copy. */
    pressure_anomaly_z: z.number().nullable(),
    dew_point_anomaly_z: z.number().nullable(),
    surface_pressure_kpa: z.number(),
    indoor_relative_humidity_pct: z.number().nullable(),
    observed_at: z.string().datetime().nullable(),
    /** Days behind the baseline. Stitch should soften its copy when this is low. */
    baseline_sample_days: z.number().int().nonnegative(),
  }),

  medium: mediumStateSchema,
  adjustments: adjustmentsSchema,
  causal_chain: z.array(causalStepSchema),
  narrative: narrativeChainSchema.nullable(),
  scores: advisoryScoresSchema,

  /**
   * True when every channel's effect fell under `minimumEffect`. The payload is
   * still complete and still correct — there is simply nothing worth saying today.
   * Stitch renders a calm state, not an empty one.
   */
  advisory_suppressed: z.boolean(),
  suppression_reason: z.string().nullable(),
  /** Mirrors `EnvironmentReading.degradation` so the UI can be honest about gaps. */
  degradation: z.string(),
  /** Lowest basis across every input feeding `adjustments`. ABSENT ⇒ show nothing. */
  confidence_basis: valueBasisSchema,
});
export type EnvironmentalAdvisoryPayload = z.infer<typeof environmentalAdvisoryPayloadSchema>;
