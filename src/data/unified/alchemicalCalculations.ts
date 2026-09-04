import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";

// ===== ALCHEMICAL CALCULATION SYSTEM =====;
// Implements Kalchm (K_alchm) and Monica constant calculations
// Based on the core alchemical engine with enhanced metrics

// Alchemical properties interface
// Thermodynamic metrics interface
export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number; // K_alchm - Baseline alchemical equilibrium,
  monica: number; // Monica constant - Dynamic scaling factor
}

// Enhanced ingredient interface with alchemical properties
export interface AlchemicalIngredient {
  name: string;
  category: string;
  subcategory?: string;

  // Elemental Properties (Self-Reinforcement Compliant)
  elementalProperties: ElementalProperties;

  // Alchemical Properties (Core Metrics)
  alchemicalProperties: AlchemicalProperties;

  // Kalchm Value (Intrinsic Alchemical Equilibrium)
  kalchm: number;

  // Additional properties
  flavorProfile?: { [key: string]: number };
  nutritionalData?: { [key: string]: number };
  seasonalAvailability?: string[];
  cookingMethods?: string[];
}

// ===== CANONICAL THERMODYNAMIC ENGINE (§17c) =====;
//
// This module is the single source of truth for the six thermodynamic
// quantities. Every live surface converges here — see
// docs/physics/SYNTHESIS_MODEL.md §14/§17c.
//
// TOTALITY CONTRACT: none of these functions ever returns NaN, null, or a
// non-finite value, for ANY input. Degenerate input resolves to a documented,
// meaningful constant:
//   heat / entropy / reactivity / gregsEnergy → 0   (true value: numerator is 0)
//   kalchm                                    → 1.0 (DEFAULT_KALCHM, equilibrium)
//   monica                                    → φ   (MONICA_EQUILIBRIUM, the
//                                                    harmonic ideal — kalchm=1 is
//                                                    perfect balance, not "dead")
/**
 * Minimum magnitude for REACTIVITY in the monica denominator, so a reactivity of
 * 0 cannot divide. That is its only job — see `calculateMonica` below.
 *
 * ⚠️ Named `KALCHM_EPSILON` until §18k k26. It has nothing to do with kalchm: it
 * used to ALSO floor each ESMS axis inside `calculateKalchm`, but that floor was
 * removed in #642 (`0 ** 0` is already exactly 1 in JS, the true limit, and x^x
 * bottoms out at 0.692201 so the denominator can never reach 0 — both hazards
 * were imaginary and the floor only cost accuracy). The readers went; the name
 * outlived them by two months and misdescribed the constant to every reader in
 * between. Renamed to say what it does.
 *
 * ── BASIS: ASSUMED ──────────────────────────────────────────────────────────
 *
 * Not MEASURED and not DERIVED. The `MONICA_LN_EPSILON` construction (midpoint of
 * a measured bimodal gap) was applied to reactivity over the identical grid with
 * the identical algorithm and does NOT transfer: reactivity is unimodal, its
 * widest low gap scoring a dominance ratio of 1.0026 against 1.77 for |ln k|.
 * Three indistinguishable candidate gaps means no midpoint to take. There is
 * nothing here to derive; this is a chosen tolerance and is labelled as one.
 *
 * ── What it is inert against [MEASURED 2026-07-28, n=7920] ──────────────────
 *
 * Over the exhaustive single-body grid the minimum reactivity is
 * 0.22437673130193908, so ANY floor strictly below that cannot fire on this
 * population — the inertness is structural, not a lucky margin. Monica is
 * bit-identical (`Object.is`) at floors 0 (i.e. no floor at all), 0.0001, 0.001,
 * 0.01, 0.05, 0.1 and 0.2. Values first move at 0.5 (306 of 7920 cells, max
 * |Δmonica| 0.0641163822659449) and at 1 (1430 cells, max 0.1708601401780716).
 * `monicaReactivityFloorInertness.test.ts` re-derives this on every run and fails
 * if the grid moves, so it is a gate rather than a comment asserting a stale
 * measurement.
 *
 * ── Why it is kept rather than removed [§18k k26] ───────────────────────────
 *
 * Removal is NOT behaviour-neutral, despite 0 of 7920 canonical cells changing.
 * The second `calculateReactivity` in `src/utils/monicaKalchmCalculations.ts`
 * fabricates 0 at its pole (`denominator > 0 ? n/d : 0`) where the true value is
 * +∞, and its `calculateMonicaConstant` delegates here — so the guard IS reached,
 * with gregsEnergy ≠ 0. Removing the floor would turn one baseless number
 * (-3.417247237179051) into another (φ) while leaving that fabrication in place.
 * Fix the k12-class fallback there first; then removal becomes neutral and this
 * constant should go.
 */
export const MONICA_REACTIVITY_FLOOR = 0.01;

// ── The monica degenerate band, DERIVED ─────────────────────────────────────
//
// This was `MONICA_LN_EPSILON = 0.05`, described in this file as a "tunable
// knob" — an unmeasured constant on the hot path, which is what §11 forbids.
//
// Measured exhaustively over the single-body grid (11 planets x 12 signs x 30
// degrees x 2 sects = 7920 points, deterministic, so this is a census not a
// sample), |ln(kalchm)| is BIMODAL with one wide clean gap:
//
//     degenerate cluster ends   0.046051701859880986
//                        GAP    width 0.17273416629286448
//     healthy values begin      0.21878586815274545
//
// The band belongs at the midpoint, which is the same derivation
// `agentMonicaTwoBody` already uses for TWO_BODY_LN_EPSILON.
//
// ── Why change a value that classified correctly? ───────────────────────────
//
// 0.05 and the midpoint capture the IDENTICAL 660 of 7920 points, so this is a
// provably zero-behaviour-change edit. The reason to make it is MARGIN: 0.05 sat
// only 0.003948 above the degenerate ceiling, while the midpoint sits 0.086367
// from both edges — 22x more room. A constant 0.004 from a cliff is one grid
// tweak away from silently reclassifying agents; one at the centre is not.
//
// ⚠️ The endpoints are stated here rather than computed from the grid at import,
// because the grid needs `groundingVessel` from @/utils/agentMonica, which
// imports THIS module — enumerating it here would be a dependency cycle. The
// enumeration lives in `src/__tests__/monicaLnEpsilonDerivation.test.ts`, which
// re-derives both endpoints and FAILS if the grid moves. So the derivation is
// checked on every test run; it is not a comment asserting a stale measurement.

/**
 * Largest |ln(kalchm)| in the degenerate cluster. [MEASURED 2026-07-25, n=7920]
 *
 * EXACTLY ZERO now. Before the epsilon floor was removed from `calculateKalchm`
 * this was 0.046051701859880986 — the floor smeared the degenerate cluster across
 * [0, 0.046] by contributing 0.954993 instead of 1 for a zeroed axis. With `0**0`
 * left alone, a degenerate chart's kalchm is exactly 1, so |ln kalchm| is exactly
 * 0 and the degenerate set is defined EXACTLY rather than empirically.
 */
export const SINGLE_BODY_DEGENERATE_LN_CEILING = 0;

/**
 * Smallest |ln(kalchm)| among non-degenerate points. [MEASURED 2026-07-25, n=7920]
 * Unchanged by the floor removal — the floor only ever touched zeroed axes.
 */
export const SINGLE_BODY_HEALTHY_LN_FLOOR = 0.21878586815274545;

/** Half-width of the monica degenerate band. When |ln(kalchm)| < this, kalchm is
 *  treated as the equilibrium point (perfect balance) and monica returns
 *  MONICA_EQUILIBRIUM instead of diverging toward ±∞.
 *
 *  DERIVED as the midpoint of the measured gap above = 0.10939293407637272.
 *  (It was 0.13241878500631321 while the kalchm floor smeared the degenerate
 *  ceiling up to 0.046. Removing the floor moved the ceiling to exactly 0, so the
 *  midpoint moved down. The band still captures the SAME 660 of 7920 grid points
 *  — the classification is unchanged, only its derivation is now exact.) */
export const MONICA_LN_EPSILON =
  (SINGLE_BODY_DEGENERATE_LN_CEILING + SINGLE_BODY_HEALTHY_LN_FLOOR) / 2;

/** The harmonic-ideal monica (golden ratio). Returned for a perfectly balanced
 *  (degenerate) alchemical state. See §17c. */
export const MONICA_EQUILIBRIUM = 1.618;

/**
 * Substituted for a squared denominator of EXACTLY ZERO in the three
 * thermodynamic ratios. §18k k30.
 *
 * ── On the single-body population it is a POLE SUBSTITUTION ─────────────────
 *
 * `[MEASURED 2026-07-29, n=7920]` over the exhaustive single-body grid, ZERO cells
 * have a denominator anywhere in the open band `(0, 0.01)` for any of the three
 * ratios. Every clamp there substitutes for an exact 0, so for that population the
 * effective semantics are `if (den === 0) den = 0.01`.
 *
 * ⚠️ ── That does NOT generalise to caller input ────────────────────────────
 *
 * `[CORRECTED 2026-07-29]` An earlier revision of this note said the clamp "is
 * never" a small-denominator guard, generalising the grid census to the function.
 * That is false, and it matters because `GET /api/alchemize` takes caller-supplied
 * elementals. MEASURED at a real diurnal ESMS
 * `{Spirit: 2.3684111079749997, Essence: 1.5543791025227327, Matter: 0, Substance: 0}`
 * with `Earth = 0.001`, so `den = 1e-6` — inside the open band:
 *
 *     exact  num/den   8025465.570738742
 *     clamped (was)        802.5465570738742     ← 10,000x LOW
 *
 * `[FIXED 2026-07-30]` ── this no longer happens ─────────────────────────────
 *
 * The interpolation is GONE. `Math.max(den, THERMO_DEN_FLOOR)` was replaced by
 * `thermoQuotient` (below), which is exact for every `den > 0` and substitutes
 * this constant ONLY at an exact 0. The engine now serves 8025465.570738742 for
 * the case above. Pinned by `thermoDenFloorPoleSubstitution.test.ts`, which used
 * to assert the clamped value and now asserts the exact one.
 *
 * That change moved NOTHING on the single-body grid — the census immediately
 * above is exactly why: with zero cells in the open band, `Math.max` only ever
 * fired on an exact 0, which is the branch that remains. The published clamped
 * band (848 .. 1608) is bit-identical.
 *
 * The consequence for §18k k7, RESTATED: the open-band objection to consolidating
 * onto this engine is now resolved — canonical and
 * `src/utils/monicaKalchmCalculations.ts` agree there, both exact. Consolidation
 * is still justified on one-formula-per-runtime plus removing the second
 * module's k12 zero; what is no longer true is that canonical is measurably
 * WORSE in the band. The two runtimes were changed together —
 * `backend/alchm_kitchen/thermodynamics.py:thermo_quotient` mirrors this
 * exactly, and `backend/tests/test_kalchm_parity.py` pins it.
 *
 * ── Only ONE of the three denominators ever reaches zero ────────────────────
 *
 *   heat       (Substance+Essence+Matter+Water+Air+Earth)²   0 zeros, min 3.24
 *   entropy    (Essence+Matter+Earth+Water)²                 0 zeros, min 1.44
 *   reactivity (Matter+Earth)²                            1008 zeros, min 0.81
 *
 * The heat and entropy floors are INERT on this population, sitting 324× and
 * 144× below their minima. (They nest, as they must — all terms are
 * non-negative, so heat=0 implies entropy=0 implies reactivity=0.)
 *
 * ── Why (Matter + Earth) is exactly zero in 1008 of 7920 cells ──────────────
 *
 * Both terms are non-negative, so both must be exactly 0, and each has its own
 * cause. All three conditions hold at once:
 *
 *   1. `Earth = 0` — single-body elements are one-hot from the sign, so the nine
 *      non-Earth signs qualify. Taurus, Virgo and Capricorn never appear.
 *   2. The planet contributes 0 Matter IN THAT SECT — Sun/Mercury/Jupiter/Neptune
 *      in both sects; Moon/Venus/Mars/Saturn/Uranus/Pluto in DIURNAL only.
 *   3. The vessel contributes 0 Matter — exactly four of the fourteen pillars,
 *      those with `effects.Matter = -1`: Filtration, Evaporation, Distillation,
 *      Purification. `max(0, 1 + (-1)) = 0`, and the mass-4 normalisation
 *      preserves zero. Via `(degree-1) mod 14` these are degrees
 *      {2, 3, 4, 9, 16, 17, 18, 23}.
 *
 * ── BASIS: ASSUMED, and it is an API CONTRACT rather than a derivation ───────
 *
 * The reactivity numerator is STRICTLY POSITIVE in all 1008 cells (8.48 to
 * 16.08; zero cells have a zero numerator), so this is a TRUE POLE whose limit is
 * `+Infinity` — not an indeterminate 0/0. `0.01` therefore approximates nothing.
 * It CHOOSES WHERE TO CAP INFINITY, and that choice sets the top of the published
 * range directly, since the clamp yields `numerator / 0.01` = 848 to 1608.
 *
 * `[MEASURED]` what that does to what `GET /api/alchemize` serves:
 *
 *   median                 2.5
 *   p90                  999.99…      <- already inside the manufactured band
 *   max                 1608.00
 *   largest GENUINE value  20
 *   smallest MANUFACTURED 848         disjoint, and 42x above the real maximum
 *
 * So 12.7% of the published distribution is a block of values sitting 42x beyond
 * anything the model actually produces, and the 90th percentile lands inside it.
 * ⚠️ Anything taking a max, a percentile, or a normalisation over reactivity is
 * dominated by THIS CONSTANT rather than by the data. Changing it to 0.001 would
 * multiply that band by ten.
 *
 * ⚠️ The clamp is also NOT UNIFORM across the population — Earth signs and most
 * nocturnal sects are structurally exempt (conditions 1 and 2). It systematically
 * inflates diurnal, non-Earth, four-specific-pillar cells, so any comparison of
 * reactivity ACROSS sects or elements inherits that confound.
 *
 * ── RULED: keep it, do not derive it, do not delete it ──────────────────────
 *
 * Unlike `MONICA_REACTIVITY_FLOOR` (k26, inert) this is load-bearing for 12.73%
 * of the grid, and removing it would serve `Infinity` over an API that currently
 * promises a number. It is not derivable in the k3 sense because there is no gap
 * to place it in — nothing lies between 0 and 0.81. Its value is a product
 * decision about how to render a pole. Do not "derive" it later; if it needs to
 * change, that is an API contract change.
 *
 * Re-derived every run by `src/__tests__/thermoDenFloorPoleSubstitution.test.ts`.
 */
// EXPORTED deliberately. While it was module-private, no test could import it by
// name, so the TypeScript name, the Python name and the shared JSON key could all
// drift apart with the suite fully green — the one genuinely silent rename hole in
// this module (the `MONICA_REACTIVITY_FLOOR` rename fails loudly by comparison).
// `kalchmCrossRuntimeParity.test.ts` now pins this symbol against the JSON.
export const THERMO_DEN_FLOOR = 0.01;

/**
 * The one place the three thermodynamic ratios decide what to do about their
 * denominator. `num / den` everywhere it is defined; the substitution ONLY at
 * the pole.
 *
 * ── What changed, and why it is not a value change on the grid ──────────────
 *
 * This was `num / Math.max(den, THERMO_DEN_FLOOR)`. On the exhaustive
 * single-body grid that is IDENTICAL to what is written here, because
 * `thermoDenFloorPoleSubstitution.test.ts` re-derives every run that ZERO of
 * the 7920 cells put any of the three denominators inside the open band
 * `(0, 0.01)` — so `Math.max` only ever fired on an exact 0, which is exactly
 * the branch below. The grid population does not move by a single ULP.
 *
 * ── What it DOES change: caller-supplied input ──────────────────────────────
 *
 * `Math.max` does not distinguish "denominator is 0" from "denominator is
 * small", and `GET /api/alchemize` takes caller-supplied elementals, so small
 * denominators ARE reachable there. `[MEASURED]` at the real diurnal ESMS
 * `{Spirit: 2.3684111079749997, Essence: 1.5543791025227327, Matter: 0,
 * Substance: 0}` with `Earth = 0.001`, giving `den = 1e-6`:
 *
 *     exact    num/den   8025465.570738742
 *     old      num/0.01      802.5465570738742   <- 10,000x LOW
 *
 * The old form silently interpolated across the whole open band, understating
 * without bound as `den -> 0`. `src/utils/monicaKalchmCalculations.ts` was
 * exact there, so this also removes a real divergence between the two engines
 * rather than merely moving canonical closer to it.
 *
 * ── The pole itself is UNCHANGED, deliberately ──────────────────────────────
 *
 * At `den === 0` the reactivity numerator is strictly positive (8.48 .. 16.08
 * across the 1008 zero cells), so it is a TRUE POLE whose limit is +Infinity —
 * not an indeterminate 0/0. `THERMO_DEN_FLOOR` is the published choice of where
 * to cap that infinity and is an API CONTRACT (§18k k30: "keep it, do not
 * derive it, do not delete it"). Nothing here re-derives or removes it; the
 * clamped band 848 .. 1608 that `/api/alchemize` serves is bit-identical.
 */
export function thermoQuotient(numerator: number, denominator: number): number {
  // Exact wherever the ratio is defined.
  if (denominator > 0) return numerator / denominator;
  // A true pole. Substitute the published cap; see the note above.
  if (denominator === 0) return numerator / THERMO_DEN_FLOOR;
  // NaN (or, impossibly for a square, negative) — MALFORMED INPUT, not a pole.
  //
  // ⚠️ Do not fold this into the branch above. A denominator is NaN when an
  // elemental key is MISSING and destructures to `undefined`, which is a
  // reachable caller error, and `NaN > 0` is false — so a bare `else` would
  // hand malformed input the pole substitution and return a confident finite
  // number (MEASURED: 1609 for `{Fire, Water, Earth}` with no `Air`). Propagate
  // the NaN and let the `Number.isFinite` guard below decide, exactly as
  // `Math.max(NaN, floor)` did. Pinned by
  // `thermoDenFloorPoleSubstitution.test.ts`.
  return NaN;
}

/**
 * Calculate Kalchm (K_alchm) - Baseline alchemical equilibrium
 * Formula: K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 *
 * TOTAL: always finite and > 0. An all-zero input yields exactly 1.0.
 *
 * ── Why there is no longer an epsilon floor ─────────────────────────────────
 *
 * Each axis used to be floored at 0.01 (then named KALCHM_EPSILON), justified in a comment
 * as "so 0^0 and division-by-zero cannot occur". BOTH of those hazards are
 * imaginary in JavaScript, and the floor cost real accuracy:
 *
 *   1. `0 ** 0 === 1` in JS — and 1 is exactly lim(x->0) x^x. The language
 *      already returns the mathematically correct value for a zero axis. There
 *      was nothing to protect against.
 *   2. Division by zero is impossible: x^x has a global minimum of 0.692201 at
 *      x = 1/e, so it never reaches 0. The denominator
 *      (Matter^Matter * Substance^Substance) cannot be 0 for any real input.
 *
 * Meanwhile 0.01^0.01 = 0.954993, not 1 — so flooring a zero axis understated
 * its contribution by ~4.5%. Measured over the exhaustive single-body grid
 * (7920 points), the floor perturbed 4200 of them: median 2.21%, max 4.17%.
 * 68.2% of that grid has at least one axis exactly 0, so this was not an edge
 * case; it was the common case.
 *
 * ── What the guard IS for ───────────────────────────────────────────────────
 *
 * A NEGATIVE axis. `Math.pow(-0.5, -0.5)` is NaN — a negative base with a
 * fractional exponent has no real value. Dignity scores can be negative, so
 * rather than prove no construction ever yields a negative axis, clamp only
 * negatives. They land on 0, which then yields exactly 1 like any other zero.
 *
 * So: exact for zero, NaN-proof for negatives, no distortion anywhere.
 */
export function calculateKalchm(alchemicalProps: AlchemicalProperties): number {
  const { Spirit, Essence, Matter, Substance } = alchemicalProps;

  // Clamp NEGATIVES only — see the note above. Zero passes through untouched
  // because 0**0 is already exactly 1.
  const nonNeg = (x: number) => (x > 0 ? x : 0);
  const s = nonNeg(Spirit);
  const e = nonNeg(Essence);
  const m = nonNeg(Matter);
  const sub = nonNeg(Substance);

  const numerator = Math.pow(s, s) * Math.pow(e, e);
  const denominator = Math.pow(m, m) * Math.pow(sub, sub);

  const kalchm = numerator / denominator;
  return Number.isFinite(kalchm) && kalchm > 0 ? kalchm : 1.0;
}

const ESMS_AXES = ["Spirit", "Essence", "Matter", "Substance"] as const;
const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

/**
 * FAIL LOUDLY on malformed thermodynamic input. §18k k7.
 *
 * Replaces the fabrication layer that `src/utils/monicaKalchmCalculations.ts`
 * carried, which returned a hardcoded
 * `{heat: 0.08, entropy: 0.15, reactivity: 0.45, gregsEnergy: -0.02,
 * kalchm: 2.5, monica: 1.0}` for a null argument and silently substituted
 * `Spirit/Essence/Matter -> 4`, `Substance -> 2`, and every element -> `0.25`
 * for a missing or NaN field. A caller could not tell invented physics from
 * measured physics, which is the k12 class this codebase is eradicating.
 *
 * A hard seam here is the point: an upstream caller that cannot produce four
 * finite ESMS axes and four finite elements has a bug, and the correct
 * behaviour is to surface it — as a 500 from an API route, or a failed render
 * — rather than to serve a plausible number nobody can audit.
 *
 * ⚠️ Note what is NOT rejected. `0` is a LEGITIMATE value for every one of
 * these eight fields and passes: the old per-field guards used
 * `typeof x === "number" && !isNaN(x)`, which also admitted `0` but admitted
 * `Infinity` too. This requires FINITE, so `Infinity` — which produces
 * `Infinity/Infinity = NaN` downstream — is now caught at the boundary instead
 * of surfacing as a silent zero via the `Number.isFinite` guard below.
 */
function assertThermodynamicInput(
  alchemicalProps: AlchemicalProperties,
  elementalProps: ElementalProperties,
  caller: string,
): void {
  if (!alchemicalProps || typeof alchemicalProps !== "object") {
    throw new TypeError(
      `${caller}: alchemicalProps is ${alchemicalProps === null ? "null" : typeof alchemicalProps}. ` +
        `ESMS cannot be invented — pass four finite axes or resolve them upstream.`,
    );
  }
  if (!elementalProps || typeof elementalProps !== "object") {
    throw new TypeError(
      `${caller}: elementalProps is ${elementalProps === null ? "null" : typeof elementalProps}. ` +
        `Elementals cannot be invented — pass four finite elements or resolve them upstream.`,
    );
  }
  for (const axis of ESMS_AXES) {
    const v = (alchemicalProps as Record<string, unknown>)[axis];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new TypeError(
        `${caller}: alchemicalProps.${axis} is ${String(v)} (expected a finite number). ` +
          `A missing or non-finite axis used to be silently replaced with a literal.`,
      );
    }
  }
  for (const element of ELEMENTS) {
    const v = (elementalProps as Record<string, unknown>)[element];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new TypeError(
        `${caller}: elementalProps.${element} is ${String(v)} (expected a finite number). ` +
          `A missing or non-finite element used to be silently replaced with 0.25.`,
      );
    }
  }
}

/**
 * Calculate thermodynamic metrics including heat, entropy, reactivity, and Greg's Energy
 *
 * THROWS on malformed input — see `assertThermodynamicInput`.
 */
export function calculateThermodynamics(
  alchemicalProps: AlchemicalProperties,
  elementalProps: ElementalProperties,
): Omit<ThermodynamicMetrics, "kalchm" | "monica"> {
  assertThermodynamicInput(alchemicalProps, elementalProps, "calculateThermodynamics");
  const { Spirit, Essence, Matter, Substance } = alchemicalProps;
  const { Fire, Water, Air, Earth } = elementalProps;

  // Heat calculation
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(
    Substance + Essence + Matter + Water + Air + Earth,
    2,
  );
  const heat = thermoQuotient(heatNum, heatDen);

  // Entropy calculation
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = thermoQuotient(entropyNum, entropyDen);

  // Reactivity calculation
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = thermoQuotient(reactivityNum, reactivityDen);

  // Greg's Energy — never clamped; may be negative (a real, meaningful sign).
  const gregsEnergy = heat - entropy * reactivity;

  // ⚠️ `[CORRECTED 2026-07-29]` This comment claimed the guard was "not a
  // reachable branch". It WAS reached: an elemental object MISSING a key
  // destructured to `undefined`, every arithmetic result became NaN, and all four
  // values fell through to 0 (MEASURED: `{Fire:0.3, Water:0.25, Earth:0.2}` with no
  // `Air` returned all zeros; control: the complete object returns
  // reactivity 2.0530045351473922).
  //
  // `[RESOLVED 2026-07-30 — §18k k7]` That was a k12-shaped fallback: 0 is a
  // legitimate value for all four quantities, so a caller could not distinguish
  // "genuinely zero" from "your input was malformed". It is now rejected at the
  // boundary by `assertThermodynamicInput`, which names the offending field, so
  // NO malformed input can reach here any more.
  //
  // The guard is KEPT as a genuine last resort — it is now unreachable for
  // missing/NaN/Infinity input, but a pathological combination of finite inputs
  // could in principle still overflow to a non-finite quotient, and 0 is a safer
  // last word than NaN escaping into a score. It is no longer load-bearing, and
  // `thermoFailsLoudly.test.ts` pins that the boundary catches these cases first.
  return {
    heat: Number.isFinite(heat) ? heat : 0,
    entropy: Number.isFinite(entropy) ? entropy : 0,
    reactivity: Number.isFinite(reactivity) ? reactivity : 0,
    gregsEnergy: Number.isFinite(gregsEnergy) ? gregsEnergy : 0,
  };
}

/**
 * Calculate Monica constant (M) - Dynamic scaling factor
 * Formula: M = -Greg's Energy / (Reactivity * ln(Kalchm))
 *
 * TOTAL: always finite, never NaN/null (§17c). At the equilibrium point
 * (kalchm ≈ 1, where ln → 0 and the raw formula diverges) monica is the perfect-
 * balance case and returns MONICA_EQUILIBRIUM (φ). The MONICA_LN_EPSILON band
 * both removes the NaN and bounds the near-1 blowup; real charts (kalchm far
 * from 1) are unaffected.
 */
export function calculateMonica(
  gregsEnergy: number,
  reactivity: number,
  kalchm: number,
): number {
  if (!Number.isFinite(kalchm) || kalchm <= 0) return MONICA_EQUILIBRIUM;
  const lnKalchm = Math.log(kalchm);
  // Degenerate/equilibrium band: perfectly balanced state, monica is φ.
  if (Math.abs(lnKalchm) < MONICA_LN_EPSILON) return MONICA_EQUILIBRIUM;
  const safeReactivity =
    Math.abs(reactivity) < MONICA_REACTIVITY_FLOOR
      ? Math.sign(reactivity || 1) * MONICA_REACTIVITY_FLOOR
      : reactivity;
  const monica = -gregsEnergy / (safeReactivity * lnKalchm);
  return Number.isFinite(monica) ? monica : MONICA_EQUILIBRIUM;
}

/**
 * Complete alchemical analysis for an ingredient or cuisine — heat, entropy,
 * reactivity, Greg's Energy, kalchm and monica in one call.
 *
 * THE canonical six-field entry point. `src/utils/monicaKalchmCalculations.ts`
 * exported a second composite of the same shape (`calculateThermodynamicMetrics`)
 * which fabricated on bad input; it has been deleted and its consumers routed
 * here. §18k k7.
 *
 * THROWS on malformed input — see `assertThermodynamicInput`.
 */
export function performAlchemicalAnalysis(
  alchemicalProps: AlchemicalProperties,
  elementalProps: ElementalProperties,
): ThermodynamicMetrics {
  // Assert HERE as well as in calculateThermodynamics, because calculateKalchm
  // runs first and would otherwise fail on a null argument with an opaque
  // "Cannot destructure property 'Spirit' of 'null'" rather than a message
  // naming the caller and the offending field.
  assertThermodynamicInput(alchemicalProps, elementalProps, "performAlchemicalAnalysis");
  // Calculate Kalchm
  const kalchm = calculateKalchm(alchemicalProps);
  // Calculate thermodynamic metrics;
  const thermodynamics = calculateThermodynamics(
    alchemicalProps,
    elementalProps,
  );

  // Calculate Monica constant
  const monica = calculateMonica(
    thermodynamics.gregsEnergy,
    thermodynamics.reactivity,
    kalchm,
  );

  return {
    ...thermodynamics,
    kalchm,
    monica,
  };
}

// ===== INGREDIENT ENHANCEMENT FUNCTIONS =====;

/**
 * Derive alchemical properties from elemental properties
 * This is used when we only have elemental data and need to estimate alchemical properties
 */
export function deriveAlchemicalFromElemental(
  elementalProps: ElementalProperties,
): AlchemicalProperties {
  const { Fire, Water, Earth, Air } = elementalProps;

  // Mapping based on alchemical principles: // Spirit: Volatile, transformative (Fire + Air dominant)
  // Essence: Active principles (Water + Fire)
  // Matter: Physical structure (Earth dominant)
  // Substance: Stable components (Earth + Water)
  return {
    Spirit: Fire * 0.6 + Air * 0.4,
    Essence: Water * 0.5 + Fire * 0.3 + Air * 0.2,
    Matter: Earth * 0.7 + Water * 0.3,
    Substance: Earth * 0.5 + Water * 0.4 + Fire * 0.1,
  };
}

/**
 * Enhance an ingredient with alchemical properties and Kalchm calculation
 */
export function enhanceIngredientWithAlchemy(ingredient: {
  name: string;
  category: string;
  subcategory?: string;
  elementalProperties: ElementalProperties;
  [key: string]: unknown;
}): AlchemicalIngredient {
  // Derive alchemical properties from elemental properties
  const alchemicalProperties = deriveAlchemicalFromElemental(
    ingredient.elementalProperties,
  );

  // Calculate Kalchm
  const kalchm = calculateKalchm(alchemicalProperties);
  return {
    ...ingredient,
    alchemicalProperties,
    kalchm,
  };
}

/**
 * Calculate compatibility between two ingredients based on their Kalchm values
 * Uses self-reinforcement, principles: similar Kalchm = higher compatibility
 */
export function calculateKalchmCompatibility(
  kalchm1: number,
  kalchm2: number,
): number {
  // Calculate the ratio between the two Kalchm values
  const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);

  // Convert ratio to compatibility score (0.7 minimum for good compatibility)
  return 0.7 + ratio * 0.3;
}

// ===== CUISINE ENHANCEMENT FUNCTIONS =====;

/**
 * Calculate aggregate Kalchm for a cuisine based on its typical ingredients
 */
export function calculateCuisineKalchm(
  ingredients: AlchemicalIngredient[],
  weights?: number[],
): number {
  if ((ingredients || []).length === 0) return 1.0;

  const effectiveWeights =
    weights ?? (ingredients || []).map(() => 1 / (ingredients || []).length);
  let weightedKalchmSum = 0;
  let totalWeight = 0;

  for (const [i, ingredient] of (ingredients || []).entries()) {
    const weight = effectiveWeights[i] || 0;
    weightedKalchmSum += ingredient.kalchm * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedKalchmSum / totalWeight : 1.0;
}

/**
 * Find ingredients with similar Kalchm values for substitution recommendations
 */
export function findKalchmSimilarIngredients(
  targetKalchm: number,
  ingredientPool: AlchemicalIngredient[],
  tolerance = 0.2,
): AlchemicalIngredient[] {
  return (ingredientPool || []).filter((ingredient) => {
    const compatibility = calculateKalchmCompatibility(
      targetKalchm,
      ingredient.kalchm,
    );
    return compatibility >= 0.9 - tolerance; // High compatibility threshold
  });
}

// ===== VALIDATION AND UTILITY FUNCTIONS =====;

/**
 * Validate alchemical properties to ensure they're within reasonable bounds
 */
export function validateAlchemicalProperties(
  props: AlchemicalProperties,
): boolean {
  const { Spirit, Essence, Matter, Substance } = props;

  // Check if all values are positive numbers
  if (Spirit <= 0 || Essence <= 0 || Matter <= 0 || Substance <= 0) {
    return false;
  }

  // Check if values are within reasonable bounds (0-2 scale)
  if (Spirit > 2 || Essence > 2 || Matter > 2 || Substance > 2) {
    return false;
  }

  return true;
}

/**
 * Normalize alchemical properties to ensure they sum to 1
 */
export function normalizeAlchemicalProperties(
  props: AlchemicalProperties,
): AlchemicalProperties {
  const { Spirit, Essence, Matter, Substance } = props;
  const sum = Spirit + Essence + Matter + Substance;

  if (sum === 0) {
    // Return derived default from balanced elementals if sum is 0
    return deriveAlchemicalFromElemental({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    });
  }

  return {
    Spirit: Spirit / sum,
    Essence: Essence / sum,
    Matter: Matter / sum,
    Substance: Substance / sum,
  };
}

/**
 * Get default alchemical properties for unknown ingredients.
 * Derived from balanced elemental properties (Fire=Water=Earth=Air=0.25)
 * using the standard elemental-to-alchemical mapping.
 */
export function getDefaultAlchemicalProperties(): AlchemicalProperties {
  return deriveAlchemicalFromElemental({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });
}

// ===== EXPORT TYPES AND CONSTANTS =====;

export type { AlchemicalProperties };

// Default Kalchm value for unknown ingredients
export const DEFAULT_KALCHM = 1.0;

// Kalchm ranges for different ingredient categories
export const KALCHM_RANGES = {
  spices: { min: 0.5, max: 2.5 },
  herbs: { min: 0.7, max: 1.8 },
  vegetables: { min: 0.6, max: 1.4 },
  fruits: { min: 0.8, max: 1.6 },
  grains: { min: 0.9, max: 1.3 },
  proteins: { min: 1.0, max: 1.8 },
  dairy: { min: 0.8, max: 1.6 },
};
