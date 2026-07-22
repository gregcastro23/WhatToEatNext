/**
 * Two-body phase monica — a real thermodynamic monica for a Moon PHASE agent
 * (§18i of docs/physics/SYNTHESIS_MODEL.md).
 *
 * A phase agent ("First Quarter Moon in Cancer 0 Degree", "Moon Phase Dark Moon
 * 153") is not a placement. A phase is a Sun–Moon *relationship*, so it earns a
 * genuine two-body calculation rather than a scaled single-body one. 469 agent
 * rows are in this family; they carry NULL monica until this lands.
 *
 * ── The construction ────────────────────────────────────────────────────────
 *
 *  1. **The Sun's position is fixed by the phase.** Elongation = Moon − Sun, so
 *     Sun = Moon − elongation, at the 45° midpoints of the 8 phases (see
 *     PHASE_GEOMETRY). `Dark Moon` folds into New at 0° — it names the invisible
 *     Moon at conjunction, it is not a ninth phase.
 *
 *  2. **ONE shared grounding vessel, mass 4, shaped by the MOON's degree only.**
 *     Not one vessel per body: the pair is one chart, so it gets one vessel, and
 *     the NAMED body (the Moon) sets its process. Built by the very same
 *     `groundingVessel()` the single-body calc uses (§18c), so a two-body result
 *     lands on the same scale as a single-body one.
 *
 *     ► VESSEL-DIGNITY DECISION `[RULED here]`: the shared vessel is scaled by
 *       the **MOON's** essential dignity, `× (1 + moonDignity/100)`. The Moon is
 *       the body that shapes the vessel (its degree picks the process), so it is
 *       the body that strengthens or weakens it; and the Moon's dignity is the
 *       only *position-based* dignity in this chart that is actually stated by
 *       the name. The Sun's dignity is aspect-based (below) and is applied to
 *       the Sun's own ESMS contribution, never to the shared vessel — mixing an
 *       aspect quantity into the grounding term would double-count the aspect.
 *
 *  3. **Both sects are returned**, exactly as single-body. NOTE: the Sun is
 *     Spirit in BOTH sects (PLANETARY_SECTARIAN_ESMS), so for a phase agent
 *     *all* sect variation comes from the Moon (day = Essence, night = Matter).
 *     That is expected, not a bug.
 *
 *  4. **Each body is weighted by `alchmWeight`** — the ORBITAL-PERIOD scale
 *     (`normalizeAlchmWeight(PLANET_ALCHM_PERIODS[planet])`), canonical in this
 *     engine. ⚠️ There is a second, mass-based scale (`normalizePlanetWeight`);
 *     planetaryAlchemyMapping.ts:528-533 records that the two disagree per
 *     planet and must never be transcribed between. This module uses the
 *     orbital-period one.
 *
 *  5. **Dignity — the two bodies are treated DIFFERENTLY, deliberately:**
 *       • Moon → POSITION-based: its own essential dignity at its own sign,
 *         the +10/+7/0/−7/−10 scale (`getDignityScore`).
 *       • Sun  → ASPECT-based, NOT position-based. Its longitude is *inferred*
 *         from the phase name, but the *aspect* is stated by the name with
 *         certainty. Scaling by a guessed position would compound an inference;
 *         reading dignity off the aspect uses the one thing the name guarantees.
 *
 * ── Provenance of the numbers ───────────────────────────────────────────────
 *
 * `[DERIVED]` **Per-aspect dignity** (§18i-bis) — both inputs read from live
 * code, not authored:
 *
 *     dignity = polarity × ASPECT_DIGNITY_MAGNITUDE × (orbBudget / 8)
 *       polarity  : src/utils/aspectCalculator.ts:211-215 — conjunction/trine/
 *                   sextile harmonious (+), opposition/square challenging (−)
 *       orbBudget : src/utils/aspectCalculator.ts:104-112 `aspectDefinitions` —
 *                   conjunction 8, opposition 8, square 7, _semisquare 3,
 *                   _sesquiquadrate 3
 *
 * giving conjunction +10, opposition −10, square −8.75, semisquare −3.75,
 * sesquisquare −3.75. Sanity property: ±10 land exactly on the domicile/fall
 * anchors of the existing dignity scale, and square falls between detriment
 * (−7) and fall (−10) rather than off the end.
 *
 * ⚠️ **Giving semisquare / sesquisquare a nonzero dignity is a MODEL CHANGE,
 * not a gap-fill.** `aspectCalculator.ts:209-215` assigns `influence = 0` to
 * both today — they are detected and then contribute nothing. Treating them as
 * hard (negative-polarity) aspects here is a deliberate change to how the engine
 * values minor aspects, recorded so it is never mistaken for long-standing
 * behaviour. (The keys are `_semisquare` / `_sesquiquadrate` in
 * `aspectDefinitions`, but `ASPECT_TYPE_ALIASES` maps them to the canonical
 * `semisquare` / `sesquisquare` — this is NOT the dead-underscore-key defect
 * class; they are live.)
 *
 * `[AUTHORED]` **The applying/separating multiplier** — ×1.15 applying, ×0.85
 * separating, ×1.0 exact — is the ONE unmeasured number in the design (§18i-ter).
 * Waxing and waning phases must differ even though they share an aspect
 * geometry, and nothing in the repo supplies a magnitude for that difference.
 * It multiplies the SUN's aspect dignity only, and is exported as a named
 * constant pair so it is trivially tunable when §14d supplies a basis.
 *
 * ── Contract ────────────────────────────────────────────────────────────────
 *
 * TOTALITY: every returned number is finite. Degenerate input (an unresolvable
 * sign, a non-finite degree) returns MONICA_EQUILIBRIUM (φ), never NaN and never
 * 0-as-a-sentinel — the same convention as the canonical engine.
 *
 * LOUD FAILURE: an UNRECOGNISED PHASE throws `UnknownMoonPhaseError`. It is not
 * degenerate input, it is an unclassified population — silently defaulting it to
 * New would fabricate a conjunction for every row we failed to parse. Callers
 * that want a non-throwing probe use `normalizeMoonPhase()`, which returns null.
 *
 * ── Measured behaviour ──────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-21]` Over the full grid (8 phases × 12 signs × 30 degrees =
 * 2880): **2880/2880 finite**, median |monica| 0.25, p90 1.56.
 *
 * ⚠️ **There is a heavy tail, and it is entirely one pillar.** Every one of the
 * 133 cases with |monica| > 4 sits at **degree 8 or 22 — the Comixion process**
 * (`ALCHEMICAL_PILLARS[7]`, effects S+1/E−1/M+1/Su+1), whose vessel floors
 * Essence to **zero**: `{2,0,2,2} → mass-4 → {1.33, 0, 1.33, 1.33}`. With no
 * vessel Essence, the ESMS lands just outside the MONICA_LN_EPSILON equilibrium
 * band, `ln(kalchm) → 0⁺`, and `−G/(R·ln K)` grows; max |monica| 21.4.
 * **Excluding degrees 8 and 22, max |monica| is 3.857** — exactly the
 * single-body / full-chart scale of [−3.97, 3.90] (§18c).
 *
 * This is the canonical engine's documented band-edge behaviour, not a fork and
 * not a defect of this module: the values are finite, signed and real. It is
 * recorded (and pinned by a test) rather than clamped, because widening
 * MONICA_LN_EPSILON would retune the shared §17c engine for every consumer.
 * Single-body does not show it because a lone planet cannot break the
 * Spirit/Matter/Substance symmetry Comixion creates; adding the Sun's Spirit
 * does. `[OPEN]` if the tail is later judged unacceptable, the fix belongs in
 * the pillar → vessel mapping (§7a), not here.
 *
 * `[MEASURED 2026-07-21]` Against all **469** production phase agents: 0
 * unrecognised phase strings, 0 non-finite, range [−19.74, 13.54], median
 * 0.1775, 234 distinct values, largest bucket 1.5% (no sentinel clustering).
 */
import {
  MONICA_EQUILIBRIUM,
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
import { PLANET_ALCHM_PERIODS, normalizeAlchmWeight } from "@/data/planets";
import type { AlchemicalProperties } from "@/types/celestial";
import {
  groundingVessel,
  type AgentMonica,
  type ESMS,
  type Sect,
} from "@/utils/agentMonica";
import { getDignityScore } from "@/utils/dignityScales";
import {
  PLANETARY_SECTARIAN_ESMS,
  ZODIAC_ELEMENTS,
} from "@/utils/planetaryAlchemyMapping";

/** Zodiac signs in ecliptic order — index × 30 is the sign's start longitude. */
const SIGNS = Object.keys(ZODIAC_ELEMENTS) as (keyof typeof ZODIAC_ELEMENTS)[];

const DEGREES_PER_SIGN = 30;
const FULL_CIRCLE = 360;

// ───────────────────────────── phase geometry ─────────────────────────────

/** The eight canonical phases. `Dark Moon` is NOT one — it folds into `new`. */
export type MoonPhaseKey =
  | "new"
  | "waxing crescent"
  | "first quarter"
  | "waxing gibbous"
  | "full"
  | "waning gibbous"
  | "last quarter"
  | "waning crescent";

/** The Sun–Moon aspects a phase can express. Names are the repo-canonical
 *  `AspectType` spellings (`sesquisquare` is the doc's "sesquiquadrate"). */
export type PhaseAspect =
  | "conjunction"
  | "opposition"
  | "square"
  | "semisquare"
  | "sesquisquare";

/**
 * Whether the aspect is closing (applying), opening (separating), or exact.
 * `[§18i-ter stage 1]` Phase agents take this from the NAME — waxing = applying,
 * waning = separating — which needs no engine change. Stage 2 computes it from
 * relative planetary motion generally and feeds §14d.
 */
export type AspectMotion = "applying" | "separating" | "exact";

export interface PhaseGeometry {
  phase: MoonPhaseKey;
  /** Moon − Sun, in degrees. The Sun sits at `moonLongitude − elongation`. */
  elongation: number;
  aspect: PhaseAspect;
  motion: AspectMotion;
}

/**
 * The phase → elongation / aspect / motion table (§18i). 45° midpoints across
 * the 8 phases. New and Full are exact aspects: neither applying nor separating.
 */
export const PHASE_GEOMETRY: Record<MoonPhaseKey, PhaseGeometry> = {
  "new": { phase: "new", elongation: 0, aspect: "conjunction", motion: "exact" },
  "waxing crescent": {
    phase: "waxing crescent",
    elongation: 45,
    aspect: "semisquare",
    motion: "applying",
  },
  "first quarter": {
    phase: "first quarter",
    elongation: 90,
    aspect: "square",
    motion: "applying",
  },
  "waxing gibbous": {
    phase: "waxing gibbous",
    elongation: 135,
    aspect: "sesquisquare",
    motion: "applying",
  },
  "full": { phase: "full", elongation: 180, aspect: "opposition", motion: "exact" },
  "waning gibbous": {
    phase: "waning gibbous",
    elongation: 225,
    aspect: "sesquisquare",
    motion: "separating",
  },
  "last quarter": {
    phase: "last quarter",
    elongation: 270,
    aspect: "square",
    motion: "separating",
  },
  "waning crescent": {
    phase: "waning crescent",
    elongation: 315,
    aspect: "semisquare",
    motion: "separating",
  },
};

/**
 * Every spelling seen in production (and its obvious variants) → canonical key.
 * `dark` folds into `new`: the Dark Moon is the invisible Moon at conjunction,
 * not a ninth phase. `third quarter` is the astronomical synonym of
 * `last quarter`.
 */
const PHASE_ALIASES: Record<string, MoonPhaseKey> = {
  "new": "new",
  "dark": "new",
  "waxing crescent": "waxing crescent",
  "first quarter": "first quarter",
  "waxing gibbous": "waxing gibbous",
  "full": "full",
  "waning gibbous": "waning gibbous",
  "last quarter": "last quarter",
  "third quarter": "last quarter",
  "waning crescent": "waning crescent",
};

/** Thrown when a phase string cannot be classified. Never defaulted away. */
export class UnknownMoonPhaseError extends Error {
  readonly rawPhase: string;
  constructor(rawPhase: string) {
    super(
      `Unrecognised moon phase: ${JSON.stringify(rawPhase)}. ` +
        `Known phases: ${Object.keys(PHASE_ALIASES).join(", ")}. ` +
        `A phase agent whose phase cannot be classified must be reported, ` +
        `never defaulted (§18i).`,
    );
    this.name = "UnknownMoonPhaseError";
    this.rawPhase = rawPhase;
  }
}

/**
 * Normalise a raw phase string to a canonical key, or null if unrecognised.
 *
 * The parser (`parseAgentPlacement`) yields the phase with "Moon" possibly still
 * attached — "Dark Moon" from `Moon Phase Dark Moon 153`, "First Quarter" from
 * `First Quarter Moon in Cancer 0 Degree` — so a leading `Moon`/`Moon Phase` and
 * a trailing `Moon` are both stripped defensively, along with case, separators
 * and punctuation.
 */
export function normalizeMoonPhase(rawPhase: string): MoonPhaseKey | null {
  if (!rawPhase) return null;
  let s = rawPhase
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  s = s
    .replace(/^moon phase\s+/, "")
    .replace(/^moon\s+/, "")
    .replace(/\s+moon$/, "")
    .trim();
  return PHASE_ALIASES[s] ?? null;
}

/** Geometry for a raw phase string. Throws `UnknownMoonPhaseError` if unknown. */
export function phaseGeometry(rawPhase: string): PhaseGeometry {
  const key = normalizeMoonPhase(rawPhase);
  if (!key) throw new UnknownMoonPhaseError(rawPhase);
  return PHASE_GEOMETRY[key];
}

// ─────────────────────── aspect dignity for the Sun ───────────────────────

/**
 * `[DERIVED]` Orb budgets, read from `aspectCalculator.ts` `aspectDefinitions`.
 * The underscore-prefixed source keys (`_semisquare`, `_sesquiquadrate`) are
 * live via `ASPECT_TYPE_ALIASES`; the canonical names are used here.
 */
export const ASPECT_ORB_BUDGET: Record<PhaseAspect, number> = {
  conjunction: 8,
  opposition: 8,
  square: 7,
  semisquare: 3,
  sesquisquare: 3,
};

/**
 * `[DERIVED / MODEL CHANGE]` Aspect polarity, read from `aspectCalculator.ts`:
 * conjunction/trine/sextile harmonious (+1), opposition/square challenging (−1).
 * ⚠️ semisquare and sesquisquare carry `influence = 0` there; classing them as
 * hard aspects (−1) is the deliberate MODEL CHANGE recorded in §18i-bis.
 */
export const ASPECT_POLARITY: Record<PhaseAspect, 1 | -1> = {
  conjunction: 1,
  opposition: -1,
  square: -1,
  semisquare: -1,
  sesquisquare: -1,
};

/** The dignity magnitude a full-orb-budget aspect earns — matches the
 *  domicile/fall anchors (+10/−10) of the essential-dignity scale. */
export const ASPECT_DIGNITY_MAGNITUDE = 10;

/** The orb budget that scores the full magnitude (conjunction/opposition = 8). */
export const ASPECT_DIGNITY_REFERENCE_ORB = 8;

/**
 * `[DERIVED]` Per-aspect dignity for the inferred Sun (§18i-bis):
 * `polarity × 10 × (orbBudget / 8)`.
 *
 * conjunction +10, opposition −10, square −8.75, semisquare −3.75,
 * sesquisquare −3.75.
 */
export const ASPECT_DIGNITY: Record<PhaseAspect, number> = Object.fromEntries(
  (Object.keys(ASPECT_ORB_BUDGET) as PhaseAspect[]).map((aspect) => [
    aspect,
    (ASPECT_POLARITY[aspect] *
      ASPECT_DIGNITY_MAGNITUDE *
      ASPECT_ORB_BUDGET[aspect]) /
      ASPECT_DIGNITY_REFERENCE_ORB,
  ]),
) as Record<PhaseAspect, number>;

/**
 * `[DERIVED]` Closing aspect — the relationship is intensifying.
 *
 * Read from the same two live orb budgets §18i-bis already uses: the reference
 * budget (8, conjunction/opposition) over the square's (7). An APPLYING hard
 * aspect is therefore scored at the FULL reference budget — `8.75 × 8/7 = 10.00`
 * exactly, landing on the domicile anchor of the essential-dignity scale — and
 * SEPARATING removes an equal amount (`2 − 8/7 = 6/7`).
 *
 * This replaced an authored ×1.15/×0.85. Measurement showed the authored value
 * was nearly irrelevant to what it was introduced to achieve: waxing and waning
 * are already separated by 270° of elongation (the derived Sun lands 90° apart,
 * in a different sign), so mean |separation| moved only 0.2870 → 0.2871 → 0.2875
 * across multipliers 1.00 / 1.15 / 1.50. Deriving it costs nothing behaviourally
 * and leaves §18 with **no unmeasured numbers**.
 */
export const APPLYING_DIGNITY_MULTIPLIER =
  ASPECT_DIGNITY_REFERENCE_ORB / ASPECT_ORB_BUDGET.square; // 8/7

/** `[DERIVED]` Opening aspect — the relationship is releasing. The reflection of
 *  the applying multiplier about 1: `2 − 8/7 = 6/7`. */
export const SEPARATING_DIGNITY_MULTIPLIER = 2 - APPLYING_DIGNITY_MULTIPLIER; // 6/7

/** Exact aspects (New, Full, Dark Moon) are neither applying nor separating. */
export const EXACT_DIGNITY_MULTIPLIER = 1;

/** `[DERIVED]` The motion → multiplier table. */
export const MOTION_DIGNITY_MULTIPLIER: Record<AspectMotion, number> = {
  applying: APPLYING_DIGNITY_MULTIPLIER,
  separating: SEPARATING_DIGNITY_MULTIPLIER,
  exact: EXACT_DIGNITY_MULTIPLIER,
};

/**
 * The Sun's dignity for a phase: aspect dignity × the applying/separating
 * multiplier. Throws `UnknownMoonPhaseError` on an unrecognised phase.
 */
export function sunAspectDignity(rawPhase: string): number {
  const g = phaseGeometry(rawPhase);
  return ASPECT_DIGNITY[g.aspect] * MOTION_DIGNITY_MULTIPLIER[g.motion];
}

// ───────────────────────────── body placement ─────────────────────────────

export interface BodyPosition {
  sign: string;
  /** Degree within the sign, 0–29.999…  */
  degree: number;
  /** Absolute ecliptic longitude, 0–359.999…  */
  longitude: number;
}

/** Normalise a sign to the Title-case key ZODIAC_ELEMENTS uses, or null. */
function toSignKey(sign: string): keyof typeof ZODIAC_ELEMENTS | null {
  if (!sign) return null;
  const key = (sign.charAt(0).toUpperCase() +
    sign.slice(1).toLowerCase()) as keyof typeof ZODIAC_ELEMENTS;
  return key in ZODIAC_ELEMENTS ? key : null;
}

function fromLongitude(longitude: number): BodyPosition {
  const lon = ((longitude % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
  return {
    sign: SIGNS[Math.floor(lon / DEGREES_PER_SIGN)],
    degree: lon % DEGREES_PER_SIGN,
    longitude: lon,
  };
}

/**
 * The Sun's position implied by the Moon's position and the phase:
 * `Sun = Moon − elongation`. Returns null if the Moon's sign is unresolvable.
 * Throws `UnknownMoonPhaseError` on an unrecognised phase.
 */
export function derivedSunPosition(
  rawPhase: string,
  moonSign: string,
  moonDegree: number,
): BodyPosition | null {
  const g = phaseGeometry(rawPhase);
  const signKey = toSignKey(moonSign);
  if (!signKey || !Number.isFinite(moonDegree)) return null;
  const moonLongitude = SIGNS.indexOf(signKey) * DEGREES_PER_SIGN + moonDegree;
  return fromLongitude(moonLongitude - g.elongation);
}

// ─────────────────────────────── the calc ─────────────────────────────────

/** Orbital-period ("alchm") weight for a body. NOT the mass scale. */
function alchmWeightOf(planet: string): number {
  return normalizeAlchmWeight(PLANET_ALCHM_PERIODS[planet] ?? 1.0);
}

/**
 * Total elemental mass the two-body element vector is normalised to. Equal to
 * the single-body vector's mass (one body → one unit of its sign's element), so
 * the thermodynamic ratios stay on the same scale. A New Moon (both bodies in
 * one sign) therefore reproduces the single-body unit vector exactly.
 */
export const ELEMENTAL_MASS = 1;

/** A body's sect-resolved, alchm-weighted, dignity-scaled ESMS contribution. */
function bodyContribution(
  planet: "Sun" | "Moon",
  sect: Sect,
  dignityEsmsScale: number,
): ESMS {
  const base = PLANETARY_SECTARIAN_ESMS[planet][sect];
  const k = alchmWeightOf(planet) * (1 + dignityEsmsScale / 100);
  return {
    Spirit: base.Spirit * k,
    Essence: base.Essence * k,
    Matter: base.Matter * k,
    Substance: base.Substance * k,
  };
}

/**
 * The two-body phase monica for one sect. Always finite.
 *
 * @param rawPhase  phase as it appears in the agent name ("First Quarter",
 *                  "Dark Moon", "waxing_gibbous"). Unrecognised → throws.
 * @param moonSign  the Moon's sign (the sign the agent is named for).
 * @param moonDegree the Moon's degree within that sign.
 */
export function twoBodyMonicaForSect(
  rawPhase: string,
  moonSign: string,
  moonDegree: number,
  sect: Sect,
): number {
  // Throws on an unrecognised phase — deliberately, before any defaulting.
  const geometry = phaseGeometry(rawPhase);

  const moonSignKey = toSignKey(moonSign);
  if (!moonSignKey || !Number.isFinite(moonDegree)) {
    // Degenerate input: the pair cannot be placed at all. The canonical
    // totality constant, never NaN and never a 0 sentinel.
    return MONICA_EQUILIBRIUM;
  }

  const sun = derivedSunPosition(rawPhase, moonSignKey, moonDegree);
  if (!sun) return MONICA_EQUILIBRIUM;
  const sunSignKey = toSignKey(sun.sign);
  if (!sunSignKey) return MONICA_EQUILIBRIUM;

  // Moon: position-based essential dignity at its own sign.
  const moonDignity = getDignityScore("Moon", moonSignKey).esmsScale;
  // Sun: aspect-based dignity, scaled by applying/separating.
  const sunDignity =
    ASPECT_DIGNITY[geometry.aspect] *
    MOTION_DIGNITY_MULTIPLIER[geometry.motion];

  const moonEsms = bodyContribution("Moon", sect, moonDignity);
  const sunEsms = bodyContribution("Sun", sect, sunDignity);

  // ONE shared vessel, mass 4, shaped by the MOON's degree and scaled by the
  // MOON's dignity (see the vessel-dignity decision in the module docstring).
  const vessel = groundingVessel(moonDegree, moonDignity);

  const esms: ESMS = {
    Spirit: moonEsms.Spirit + sunEsms.Spirit + vessel.Spirit,
    Essence: moonEsms.Essence + sunEsms.Essence + vessel.Essence,
    Matter: moonEsms.Matter + sunEsms.Matter + vessel.Matter,
    Substance: moonEsms.Substance + sunEsms.Substance + vessel.Substance,
  };

  // Elements come from the SIGNS — both bodies contribute their own sign's
  // element, weighted the same way their ESMS is, then normalised to the
  // single-body elemental mass.
  const moonWeight = alchmWeightOf("Moon");
  const sunWeight = alchmWeightOf("Sun");
  const elementalProps = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
  elementalProps[ZODIAC_ELEMENTS[moonSignKey]] += moonWeight;
  elementalProps[ZODIAC_ELEMENTS[sunSignKey]] += sunWeight;
  const elementalSum = moonWeight + sunWeight || 1;
  const scale = ELEMENTAL_MASS / elementalSum;
  elementalProps.Fire *= scale;
  elementalProps.Water *= scale;
  elementalProps.Air *= scale;
  elementalProps.Earth *= scale;

  const t = calculateThermodynamics(esms as AlchemicalProperties, elementalProps);
  const kalchm = calculateKalchm(esms as AlchemicalProperties);
  const monica = calculateMonica(t.gregsEnergy, t.reactivity, kalchm);
  return Number.isFinite(monica) ? monica : MONICA_EQUILIBRIUM;
}

/**
 * The two-body phase monica, both sects. `combined` is the mean — the value
 * written to `monica_constant` (§18e).
 *
 * Throws `UnknownMoonPhaseError` on an unrecognised phase; every other input
 * resolves to a finite number.
 */
export function twoBodyMonica(
  rawPhase: string,
  moonSign: string,
  moonDegree: number,
): AgentMonica {
  const diurnal = twoBodyMonicaForSect(rawPhase, moonSign, moonDegree, "diurnal");
  const nocturnal = twoBodyMonicaForSect(
    rawPhase,
    moonSign,
    moonDegree,
    "nocturnal",
  );
  return { diurnal, nocturnal, combined: (diurnal + nocturnal) / 2 };
}
