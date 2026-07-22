/**
 * Two-body phase monica — a real thermodynamic monica for a Moon PHASE agent
 * (§18i of docs/physics/SYNTHESIS_MODEL.md).
 *
 * A phase agent ("First Quarter Moon in Cancer 0 Degree", "Moon Phase Dark Moon
 * 153") is not a placement. A phase is a Sun–Moon *relationship*, so it earns a
 * genuine two-body calculation rather than a scaled single-body one. 469 agent
 * rows are in this family. Until this lands they carry NULL in
 * `monica_diurnal` / `monica_nocturnal` (the single-body backfill skipped them)
 * and the OLD FAKE `monica_constant` of 0.5 — not NULL. That fake sentinel is
 * what this replaces.
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
 *     `groundingVessel()` the single-body calc uses (§18c) — one construction,
 *     not a fork (the §17c lesson).
 *
 *     ⚠️ Sharing the vessel does NOT put the two scales on top of each other.
 *     An earlier version of this note claimed it "lands on the same scale as a
 *     single-body one"; that was never measured and is false. See the measured
 *     behaviour section: the two-body grid reaches 12.6756 where single-body
 *     reaches 3.9751.
 *
 *     ► VESSEL-DIGNITY DECISION `[RULED 2026-07-21, revised]`: the shared vessel
 *       is **dignity-NEUTRAL** — `groundingVessel(moonDegree, 0)`. The Moon
 *       still shapes it (its degree picks the process); it no longer scales it.
 *
 *       An earlier revision scaled the shared vessel by the Moon's dignity. That
 *       gave the Moon's dignity **two** points of leverage on the result (its own
 *       ESMS *and* the grounding term) while the Sun's had one — an asymmetry
 *       that was never argued for, only inherited from the single-body case
 *       where there is exactly one body and the question cannot arise. Equalised:
 *       **each body's dignity is applied exactly once, to that body's own ESMS.**
 *       The vessel grounds the pair rather than taking a side.
 *
 *       This also keeps the aspect quantity out of the grounding term, which the
 *       previous note already required — now by construction rather than by an
 *       asymmetric exception.
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
 *  5. **Dignity — the two bodies SOURCE it differently, but APPLY it identically.**
 *       • Moon → POSITION-based: its own essential dignity at its own sign,
 *         the +10/+7/0/−7/−10 scale (`getDignityScore`).
 *       • Sun  → ASPECT-based, NOT position-based. Its longitude is *inferred*
 *         from the phase name, but the *aspect* is stated by the name with
 *         certainty. Scaling by a guessed position would compound an inference;
 *         reading dignity off the aspect uses the one thing the name guarantees.
 *
 *     Different SOURCES, identical APPLICATION: each is a ±10-scale number and
 *     each multiplies exactly one thing, `× (1 + dignity/100)` on its own body's
 *     ESMS. Neither touches the shared vessel (see 2).
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
 * `[DERIVED]` **The applying/separating multiplier** — 8/7 applying, 6/7
 * separating, 1 exact (§18i-ter). Read from the same two live orb budgets
 * §18i-bis uses, so an applying square scores exactly −10.00, the domicile
 * anchor. It replaced an authored ×1.15/×0.85 pair; see the constant's own note
 * for the measurement showing the authored value barely mattered. **§18 now has
 * no unmeasured numbers** — every constant here is read from live code or
 * measured, and each records which.
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
 * All figures below are `[MEASURED 2026-07-21]` **after** the dignity
 * equalisation and **with** TWO_BODY_LN_EPSILON applied. Both changed the
 * numbers, so any earlier figure quoted elsewhere is stale by construction.
 *
 * **Full grid** (8 phases × 12 signs × 30 degrees × 2 sects = 5760):
 * 5760/5760 finite · median |monica| 0.2244 · p90 1.2434 · **max 12.6756** ·
 * 304 cells (5.3%) resolve to φ via the local band.
 *
 * **All 469 production phase agents**: 0 unrecognised phase strings, 0
 * non-finite, **range [−5.4191, 1.8004]**, 221 distinct values, 16 φ.
 *
 * ⚠️ **The residual tail is one pillar, and it is not fully absorbed.**
 * Comixion (degrees 8 and 22, `ALCHEMICAL_PILLARS[7]`, S+1/E−1/M+1/Su+1) floors
 * vessel Essence to **zero**. Adding the Sun's Spirit to a Moon with no vessel
 * Essence drives `ln(kalchm) → 0`, and `−G/(R·ln K)` grows. The local band
 * absorbs the degenerate core, cutting production rows outside the single-body
 * range from **25 to 2** and the maximum from **149.35 to 5.42** — but a skirt
 * survives, because some Comixion cells land at `|ln k|` ABOVE the healthy floor
 * and cannot be absorbed without converting real values to φ.
 *
 * **Exactly two production rows fall outside the single-body range**
 * ([−3.197, 3.975]), both on Comixion degrees:
 *   • `Full Moon Moon in Libra 8 Degree` at **−5.4191**
 *   • `Waxing Crescent Moon in Taurus 22 Degree` at **−3.2711** (2.3% below the
 *     single-body floor — marginal, but counted rather than rounded away)
 * The first is a φ-MIXED row: its diurnal chart is degenerate and returns φ, its
 * nocturnal chart is healthy and returns −12.68, and `combined` is their mean.
 * Finite, signed, real — recorded and pinned, not clamped.
 *
 * ⚠️ Counting note: an earlier pass reported ONE such row because it filtered on
 * `|monica| > 4`. The single-body range is ASYMMETRIC, so a magnitude threshold
 * is not the same test as the range test and silently missed −3.2711.
 *
 * ► φ-MIXING IS NOT NEW AND NOT TWO-BODY-SPECIFIC. `[MEASURED]` The shipped
 *   single-body calc does the same thing in **180 of 3600 cells (5%)** — e.g.
 *   `Jupiter/Aries 1` is φ diurnal, 0.0126 nocturnal, 0.8153 combined. Those
 *   rows are in production today. It is defensible under the engine's own
 *   definition (§17c: φ is the harmonic *ideal*, a real value, not a
 *   couldn't-compute sentinel), so averaging it is averaging two real states.
 *   Flagged here because it is easy to mistake for a bug introduced by this
 *   module, and because it is what makes the last row hard to remove.
 *
 * `[OPEN]` To flatten the residual, the fix belongs in the pillar → vessel
 * mapping (§7a) — giving Comixion a nonzero Essence floor — NOT in a wider band
 * and NOT in an output clamp. That was attempted twice and rejected both times:
 * flooring before mass-4 normalisation divides the floor back out, and flooring
 * after it perturbs single-body from 3.9751 to 3.9089, which would desync the
 * 4280 rows already in production.
 */
import { PLANET_ALCHM_PERIODS, normalizeAlchmWeight } from "@/data/planets";
import {
  MONICA_EQUILIBRIUM,
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "@/data/unified/alchemicalCalculations";
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
const SIGNS = Object.keys(ZODIAC_ELEMENTS) as Array<keyof typeof ZODIAC_ELEMENTS>;

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

/**
 * The dignity scale passed to the SHARED grounding vessel: none. The vessel
 * grounds the pair, it does not take a side — each body's dignity is applied
 * exactly once, to that body's own ESMS. Named rather than a bare `0` so the
 * equalisation is greppable and cannot be silently un-done.
 */
export const VESSEL_DIGNITY_NEUTRAL = 0;

/**
 * `[MEASURED 2026-07-21]` `|ln kalchm|` of the **exactly-degenerate** two-body
 * chart: Comixion (degree 8/22), nocturnal, where the vessel's Essence is
 * literally `0.000` and only `KALCHM_EPSILON` keeps `calculateKalchm` finite.
 *
 *     nocturnal deg 8/22 → S 1.824  E 0.000  M 1.618  Su 1.333   ln k = −0.110698
 *
 * A chart with a hard zero on an axis is degenerate by inspection, not by
 * threshold. This is the LOWER bound on the band: any width at or below it
 * leaves a genuinely degenerate chart being divided by ~0.
 */
export const DEGENERATE_LN_KALCHM = 0.110698;

/**
 * `[MEASURED 2026-07-21]` The smallest `|ln kalchm|` produced by any NON-Comixion
 * cell across the full 8×12×30×2 grid — the healthiest-case floor. This is the
 * UPPER bound on the band: at or above it, the band starts converting cases that
 * computed a perfectly sane monica into φ.
 */
export const HEALTHY_LN_KALCHM_FLOOR = 0.138173;

/**
 * `[DERIVED]` The two-body-local half-width of the monica equilibrium band, on
 * `|ln(kalchm)|` — the midpoint of the two measured bounds above, so it carries
 * the maximum available margin on both sides (~12% each way).
 *
 * ── Why local, and not a change to MONICA_LN_EPSILON ────────────────────────
 * The canonical `MONICA_LN_EPSILON` (0.05) is shared by every consumer of the
 * §17c engine, including the **4280 single-body agent rows already written to
 * production**. Widening it there would silently re-value all of them and every
 * full-chart caller besides. This band is applied in this module only; the
 * canonical engine is untouched and single-body output is bit-identical
 * (grid max 3.9751, regression-pinned).
 *
 * ── Why a wider band is the right shape of fix ──────────────────────────────
 * The two-body tail is not a scatter of unlucky inputs — it is one pillar.
 * Comixion (degrees 8 and 22) floors vessel Essence to zero, and adding the
 * Sun's Spirit to a Moon that has no vessel Essence lands the pair just OUTSIDE
 * the canonical band, where `ln(kalchm) → 0⁺` makes `−G/(R·ln K)` diverge. Those
 * cases are *nearer* to perfect balance than the ones the canonical band already
 * absorbs, so returning φ for them is the same statement the engine already
 * makes, not a new one. Clamping the output instead would fabricate a magnitude;
 * this widens the region where the engine declines to divide by ~0.
 *
 * ── What it does NOT do `[MEASURED]` ────────────────────────────────────────
 * It does not flatten the tail, and this is deliberate. The band is set by the
 * degeneracy boundary, not by how large the surviving output looks — sizing it
 * to swallow every big number would be output-fitting. A near-degenerate skirt
 * survives with |monica| above the single-body scale. Those values are finite,
 * signed and real; they are the honest reading of a nearly-balanced two-body
 * chart. The residual is quantified in the module docstring and pinned by test.
 *
 * `agentMonicaTwoBody.test.ts` pins BOTH bounds and the zero-collateral property,
 * so a future retune that widens this into real values fails loudly.
 */
export const TWO_BODY_LN_EPSILON =
  (DEGENERATE_LN_KALCHM + HEALTHY_LN_KALCHM_FLOOR) / 2; // 0.1244355

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
 * Every intermediate of the two-body calc, for one sect. `twoBodyMonicaForSect`
 * is a one-line wrapper over this.
 *
 * Exposed so tests and measurement scripts can read the real `kalchm` /
 * `gregsEnergy` / `reactivity` this module actually used, instead of
 * reconstructing the ESMS from the exported parts. A reconstruction is a second
 * copy of the formula, and §17c is the record of what happens when copies drift.
 */
export interface TwoBodyState {
  /** null when the input was degenerate and no chart could be built. */
  esms: ESMS | null;
  elemental: { Fire: number; Water: number; Air: number; Earth: number } | null;
  kalchm: number | null;
  /** `Math.log(kalchm)` — the quantity the equilibrium band is measured on. */
  lnKalchm: number | null;
  gregsEnergy: number | null;
  reactivity: number | null;
  /** Always finite. */
  monica: number;
  /** The local equilibrium band absorbed this case (§18i-quater). */
  equilibrium: boolean;
  /** The input could not be placed at all; monica is φ by the totality contract. */
  degenerate: boolean;
}

const DEGENERATE_STATE: TwoBodyState = {
  esms: null,
  elemental: null,
  kalchm: null,
  lnKalchm: null,
  gregsEnergy: null,
  reactivity: null,
  monica: MONICA_EQUILIBRIUM,
  equilibrium: false,
  degenerate: true,
};

/**
 * The two-body phase monica for one sect, with every intermediate. Always finite.
 *
 * @param rawPhase  phase as it appears in the agent name ("First Quarter",
 *                  "Dark Moon", "waxing_gibbous"). Unrecognised → throws.
 * @param moonSign  the Moon's sign (the sign the agent is named for).
 * @param moonDegree the Moon's degree within that sign.
 */
export function twoBodyState(
  rawPhase: string,
  moonSign: string,
  moonDegree: number,
  sect: Sect,
): TwoBodyState {
  // Throws on an unrecognised phase — deliberately, before any defaulting.
  const geometry = phaseGeometry(rawPhase);

  const moonSignKey = toSignKey(moonSign);
  if (!moonSignKey || !Number.isFinite(moonDegree)) {
    // Degenerate input: the pair cannot be placed at all. The canonical
    // totality constant, never NaN and never a 0 sentinel.
    return DEGENERATE_STATE;
  }

  const sun = derivedSunPosition(rawPhase, moonSignKey, moonDegree);
  if (!sun) return DEGENERATE_STATE;
  const sunSignKey = toSignKey(sun.sign);
  if (!sunSignKey) return DEGENERATE_STATE;

  // Moon: position-based essential dignity at its own sign.
  const moonDignity = getDignityScore("Moon", moonSignKey).esmsScale;
  // Sun: aspect-based dignity, scaled by applying/separating.
  const sunDignity =
    ASPECT_DIGNITY[geometry.aspect] *
    MOTION_DIGNITY_MULTIPLIER[geometry.motion];

  const moonEsms = bodyContribution("Moon", sect, moonDignity);
  const sunEsms = bodyContribution("Sun", sect, sunDignity);

  // ONE shared vessel, mass 4, SHAPED by the Moon's degree and scaled by
  // nobody's dignity. Each body's dignity has already been applied exactly once,
  // to its own ESMS above; scaling the shared vessel too would give whichever
  // body it belonged to a second point of leverage. See the vessel-dignity
  // decision in the module docstring.
  const vessel = groundingVessel(moonDegree, VESSEL_DIGNITY_NEUTRAL);

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
  const lnKalchm = Math.log(kalchm);

  // ── the two-body-local equilibrium band (§18i-quater) ────────────────────
  // Wider than the canonical MONICA_LN_EPSILON, and applied ONLY here. See the
  // constant's own note for why it is local and how the width was measured.
  const inBand =
    !Number.isFinite(kalchm) ||
    kalchm <= 0 ||
    Math.abs(lnKalchm) < TWO_BODY_LN_EPSILON;

  const monica = inBand
    ? MONICA_EQUILIBRIUM
    : calculateMonica(t.gregsEnergy, t.reactivity, kalchm);

  return {
    esms,
    elemental: elementalProps,
    kalchm,
    lnKalchm,
    gregsEnergy: t.gregsEnergy,
    reactivity: t.reactivity,
    monica: Number.isFinite(monica) ? monica : MONICA_EQUILIBRIUM,
    equilibrium: inBand,
    degenerate: false,
  };
}

/**
 * The two-body phase monica for one sect. Always finite. Thin wrapper over
 * `twoBodyState` — there is exactly one construction.
 */
export function twoBodyMonicaForSect(
  rawPhase: string,
  moonSign: string,
  moonDegree: number,
  sect: Sect,
): number {
  return twoBodyState(rawPhase, moonSign, moonDegree, sect).monica;
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
