/**
 * Planetary Degree Dignity Manifest — D(θ)
 * ========================================
 *
 * Pre-computes the intrinsic dignity multiplier 𝒟_p(θ_p) for every
 * (planet × integer degree × sect) triple, producing the diagonal tensor
 *
 *   D(θ) = diag( 𝒟_1(θ_1), 𝒟_2(θ_2), …, 𝒟_N(θ_N) )
 *
 * which modulates the gravitational mass-distance tensor Λ(r) of
 * docs/physics/ESMS_WAVE_FUNCTION_SPECIFICATION.md §2:
 *
 *   Λ_dignified(r, θ) = D(θ) · Λ(r) = diag( 𝒟_p(θ_p) · M_p / r_p² )
 *
 * Dignity here is a *positional field property*: it depends only on a body's
 * own ecliptic longitude, never on pair-wise angular separation. Aspect
 * interaction belongs to a separate operator and is deliberately not modelled
 * in this module.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BASIS OF EVERY VALUE IN THIS FILE
 * ─────────────────────────────────────────────────────────────────────────
 * Per the project defensible-values standard, each table below states whether
 * it is RULED (a project decision), CLASSICAL (a reproducible historical
 * table), or DERIVED (generated from another constant in this file). Nothing
 * here is copied from a printed float.
 *
 *   DIGNITY_POINTS          RULED     — supplied in the Phase 2 specification
 *   EGYPTIAN_TERMS          CLASSICAL — Ptolemy, Tetrabiblos I.21; Lilly CA p.104
 *   DOROTHEAN_TRIPLICITY    CLASSICAL — Dorotheus of Sidon, Carmen Astrologicum
 *   CHALDEAN_ORDER          CLASSICAL — descending mean apparent orbital speed
 *   FACE_RULERS             DERIVED   — generated from CHALDEAN_ORDER, not typed
 *   TRADITIONAL_RULERSHIP   CLASSICAL — the seven-planet scheme
 *   EXALTATION_DEGREE       CLASSICAL — matches EXACT_EXALTATION_DEGREE in
 *                                       src/lib/degree-planetary-agent-mapping.ts
 *   MODERN_OVERLAY          RULED     — mirrors the LIVE engine
 *                                       (src/utils/astrologyUtils.ts
 *                                        getPlanetaryDignityInfo)
 *
 * Every table is checked by assertManifestInvariants(), which reconstructs the
 * tables from their own stated basis and fails loudly on drift.
 *
 * @module calculations/dignityManifest
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** The ten ESMS bodies. Order is the manifest's row order and is load-bearing. */
export const MANIFEST_PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const

export type ManifestPlanet = (typeof MANIFEST_PLANETS)[number]

/** The seven classical bodies — the only ones with term, triplicity and face rulership. */
export type ClassicalPlanet = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'

export type Sect = 'diurnal' | 'nocturnal'

export type ZodiacElement = 'Fire' | 'Earth' | 'Air' | 'Water'

/**
 * The five essential dignities plus the two debilities. Note this is a
 * *different* and wider set than `DignityType` in src/types/alchemy.ts, which
 * carries only Domicile/Exaltation/Detriment/Fall/Neutral. The narrow type is
 * deliberately left alone — see the "authority" note in the module docs.
 */
export type DignityKind =
  | 'domicile'
  | 'exaltation'
  | 'triplicity'
  | 'term'
  | 'face'
  | 'detriment'
  | 'fall'

/** One planet's full dignity accounting at one longitude, under one sect. */
export interface DignityBreakdown {
  planet: ManifestPlanet
  /** Absolute ecliptic longitude used for the lookup, normalised to [0, 360). */
  longitude: number
  sign: string
  sect: Sect
  /** Every dignity that applied, with its signed point contribution. */
  components: Array<{ kind: DignityKind; points: number; note: string }>
  /** Σ points — the `Score(p, θ_p)` of the specification. */
  score: number
  /** 𝒟_p(θ_p) = 1 + Score / DIGNITY_SCORE_DIVISOR. */
  multiplier: number
}

/**
 * The materialised tensor. `values` is a flat row-major matrix of shape
 * [planet][degree]; index it with `manifestIndex()`.
 */
export interface DignityManifest {
  planets: readonly ManifestPlanet[]
  /** Degrees per planet row — 360. */
  stride: number
  diurnal: Float64Array
  nocturnal: Float64Array
  /** Measured, not assumed: the actual extremes present in this manifest. */
  range: {
    min: number
    max: number
    minAt: { planet: ManifestPlanet; degree: number; sect: Sect }
    maxAt: { planet: ManifestPlanet; degree: number; sect: Sect }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RULED — the scoring scale
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classical dignity point values, as specified for Phase 2.
 *
 * Score is a SUM over all applicable dignities (the Lilly convention implied by
 * "full 5-fold dignity"), so folds compound: a planet in both domicile and its
 * own term outranks one sitting in domicile alone. Summation is deliberate and
 * is what DIGNITY_SCORE_DIVISOR is calibrated against — see that constant.
 */
export const DIGNITY_POINTS: Record<DignityKind, number> = {
  domicile: 5,
  exaltation: 4,
  triplicity: 3,
  term: 2,
  face: 1,
  detriment: -5,
  fall: -4,
}

/**
 * 𝒟_p(θ_p) = 1 + Score / this.
 *
 * RULED at 50.0. The Phase 2 draft specified 10.0, which — against the measured
 * score extrema below — yields 𝒟 ∈ [0.10, 2.10], a 21× spread. That is roughly
 * seventeen times the amplitude the live engine applies via
 * src/utils/dignityScales.ts (𝒟 ∈ [0.90, 1.10]), and it reaches ESMS through
 * the log-ratio monica/kalchm observables, where a debilitated Matter-bearing
 * body at 0.10 can drive the Φ denominator onto its epsilon floor. It also
 * inflated mean 𝒟 to 1.09 — a ~9% global mass gain, not a redistribution,
 * which would move every threshold stabilised under ADR-009.
 *
 * 50.0 preserves the full 5-fold summed nuance while compressing the range to
 * 𝒟 ∈ [0.82, 1.22], adjacent to the live scale.
 *
 * MEASURED SCORE EXTREMA (reproduce with buildDignityManifest().range):
 *   max +11  Mercury 0°–7° Virgo   — domicile +5, exaltation +4, term +2.
 *            Mercury is the only body that rules AND is exalted in one sign,
 *            so +11 is the true ceiling, not the +10 a four-fold stack implies.
 *   min  −9  Mercury 0°–12° Pisces — detriment −5, fall −4, Venus holds the term.
 */
export const DIGNITY_SCORE_DIVISOR = 50.0

/**
 * How the five folds combine into `Score`.
 *   'sum' — Lilly/Ptolemaic essential-dignity scoring; the spec's "5-fold".
 *   'max' — strongest single dignity only; a far narrower amplitude.
 * Exposed because the choice is a physics decision, not an implementation
 * detail, and swapping it must not require editing the scorer.
 */
export type DignityAggregation = 'sum' | 'max'
export const DEFAULT_AGGREGATION: DignityAggregation = 'sum'

/**
 * Whether the three modern outers receive domicile/exaltation/detriment/fall.
 *
 * The live engine (getPlanetaryDignityInfo) does grant them, so the default is
 * `true` for parity. Outers never receive triplicity, term or face — those
 * tables are seven-planet by construction.
 */
export const INCLUDE_MODERN_OVERLAY = true

// ─────────────────────────────────────────────────────────────────────────────
// CLASSICAL — zodiac scaffolding
// ─────────────────────────────────────────────────────────────────────────────

export const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const

export type SignName = (typeof SIGNS)[number]

/** Element repeats Fire→Earth→Air→Water every four signs. DERIVED from index. */
const ELEMENT_CYCLE: readonly ZodiacElement[] = ['Fire', 'Earth', 'Air', 'Water']

export function elementOfSign(signIndex: number): ZodiacElement {
  return ELEMENT_CYCLE[signIndex % 4]
}

/**
 * CLASSICAL — the seven-planet rulership scheme.
 *
 * This is the scheme the LIVE dignity engine uses (astrologyUtils.ts:1261),
 * where Mars keeps Scorpio, Saturn keeps Aquarius and Jupiter keeps Pisces.
 * It deliberately does NOT follow src/lib/degree-planetary-agent-mapping.ts,
 * whose `ruler` field is modern-primary (Scorpio→Pluto, Aquarius→Uranus,
 * Pisces→Neptune). See the authority note in the module docs.
 */
const TRADITIONAL_RULERSHIP: Record<SignName, ClassicalPlanet> = {
  aries: 'Mars',
  taurus: 'Venus',
  gemini: 'Mercury',
  cancer: 'Moon',
  leo: 'Sun',
  virgo: 'Mercury',
  libra: 'Venus',
  scorpio: 'Mars',
  sagittarius: 'Jupiter',
  capricorn: 'Saturn',
  aquarius: 'Saturn',
  pisces: 'Jupiter',
}

/**
 * CLASSICAL — exaltation sign and exact degree.
 * Degrees agree with EXACT_EXALTATION_DEGREE in
 * src/lib/degree-planetary-agent-mapping.ts:296.
 */
const EXALTATION: Record<ClassicalPlanet, { sign: SignName; degree: number }> = {
  Sun: { sign: 'aries', degree: 19 },
  Moon: { sign: 'taurus', degree: 3 },
  Mercury: { sign: 'virgo', degree: 15 },
  Venus: { sign: 'pisces', degree: 27 },
  Mars: { sign: 'capricorn', degree: 28 },
  Jupiter: { sign: 'cancer', degree: 15 },
  Saturn: { sign: 'libra', degree: 21 },
}

/**
 * RULED — modern outer-planet dignities, mirroring the live engine
 * (astrologyUtils.ts:1270-1298) so this module does not fork dignity authority.
 * Detriment/fall are DERIVED as the opposing sign, never typed.
 */
const MODERN_OVERLAY: Record<'Uranus' | 'Neptune' | 'Pluto', { domicile: SignName; exaltation: SignName }> = {
  Uranus: { domicile: 'aquarius', exaltation: 'scorpio' },
  Neptune: { domicile: 'pisces', exaltation: 'leo' },
  Pluto: { domicile: 'scorpio', exaltation: 'sagittarius' },
}

/**
 * CLASSICAL — Dorothean triplicity rulers by element and sect.
 *
 * ⚠️ This intentionally does NOT reuse `_TRIPLICITY_RULERS` in
 * src/constants/zodiac.ts:75. That constant is sect-less, has zero readers, and
 * two of its four rows diverge from Dorotheus (Fire's participating ruler is
 * Saturn, not Mars; Earth is Venus/Moon/Mars, not Venus/Saturn/Mercury).
 * Reconciling it is tracked separately — see the findings note.
 */
const DOROTHEAN_TRIPLICITY: Record<
  ZodiacElement,
  { day: ClassicalPlanet; night: ClassicalPlanet; participating: ClassicalPlanet }
> = {
  Fire: { day: 'Sun', night: 'Jupiter', participating: 'Saturn' },
  Earth: { day: 'Venus', night: 'Moon', participating: 'Mars' },
  Air: { day: 'Saturn', night: 'Mercury', participating: 'Jupiter' },
  Water: { day: 'Venus', night: 'Mars', participating: 'Moon' },
}

/**
 * CLASSICAL — Egyptian (Ptolemaic) terms/bounds.
 *
 * Each entry is [ruler, upperBoundExclusive] in degrees within the sign. Bounds
 * are cumulative and the final bound is always 30. Each sign distributes its 30
 * degrees across exactly the five non-luminaries, each appearing once — both
 * properties are asserted by assertManifestInvariants().
 *
 * No terms table previously existed anywhere in this repository; this is new
 * authoritative data, not a re-export.
 */
const EGYPTIAN_TERMS: Record<SignName, Array<[ClassicalPlanet, number]>> = {
  aries: [['Jupiter', 6], ['Venus', 12], ['Mercury', 20], ['Mars', 25], ['Saturn', 30]],
  taurus: [['Venus', 8], ['Mercury', 14], ['Jupiter', 22], ['Saturn', 27], ['Mars', 30]],
  gemini: [['Mercury', 6], ['Jupiter', 12], ['Venus', 17], ['Mars', 24], ['Saturn', 30]],
  cancer: [['Mars', 7], ['Venus', 13], ['Mercury', 19], ['Jupiter', 26], ['Saturn', 30]],
  leo: [['Jupiter', 6], ['Venus', 11], ['Saturn', 18], ['Mercury', 24], ['Mars', 30]],
  virgo: [['Mercury', 7], ['Venus', 17], ['Jupiter', 21], ['Mars', 28], ['Saturn', 30]],
  libra: [['Saturn', 6], ['Mercury', 14], ['Jupiter', 21], ['Venus', 28], ['Mars', 30]],
  scorpio: [['Mars', 7], ['Venus', 11], ['Mercury', 19], ['Jupiter', 24], ['Saturn', 30]],
  sagittarius: [['Jupiter', 12], ['Venus', 17], ['Mercury', 21], ['Saturn', 26], ['Mars', 30]],
  capricorn: [['Mercury', 7], ['Jupiter', 14], ['Venus', 22], ['Saturn', 26], ['Mars', 30]],
  aquarius: [['Mercury', 7], ['Venus', 13], ['Jupiter', 20], ['Mars', 25], ['Saturn', 30]],
  pisces: [['Venus', 12], ['Jupiter', 16], ['Mercury', 19], ['Mars', 28], ['Saturn', 30]],
}

/**
 * CLASSICAL — Chaldean order, descending mean apparent orbital speed.
 * The face sequence is DERIVED from this, so the 36 faces are reproducible
 * from a seven-element list rather than typed out (and cannot drift silently).
 */
const CHALDEAN_ORDER: readonly ClassicalPlanet[] = [
  'Saturn',
  'Jupiter',
  'Mars',
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
]

/** Aries' first face is Mars — offset 2 into CHALDEAN_ORDER. */
const CHALDEAN_START_OFFSET = 2

/**
 * DERIVED — the 36 face (decan) rulers, index 0 = 0°–10° Aries.
 *
 * ⚠️ This is the *Chaldean face*, which is the ruler classical scoring means by
 * the +1 dignity. It is NOT the same table as the `ruler` field in
 * src/data/tarot/decanAlchemyMap.ts, which uses the decanate/triplicity-
 * rulership scheme with modern outers (Gemini III → Uranus, Cancer II → Pluto).
 * That file's header calls itself "Chaldean"; it is not. Both tables are valid
 * for their own purpose — the tarot map keeps its scheme, dignity uses this one.
 */
const FACE_RULERS: readonly ClassicalPlanet[] = Array.from(
  { length: 36 },
  (_unused, i) => CHALDEAN_ORDER[(i + CHALDEAN_START_OFFSET) % CHALDEAN_ORDER.length]
)

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED — opposition helpers (detriment and fall are never typed)
// ─────────────────────────────────────────────────────────────────────────────

function signIndexOf(sign: SignName): number {
  return SIGNS.indexOf(sign)
}

/** The sign 180° away. Detriment opposes domicile; fall opposes exaltation. */
function opposingSign(sign: SignName): SignName {
  return SIGNS[(signIndexOf(sign) + 6) % 12]
}

/** Signs a planet rules. Mercury and Venus rule two; the outers rule one. */
function domicilesOf(planet: ManifestPlanet): SignName[] {
  const classical = (Object.keys(TRADITIONAL_RULERSHIP) as SignName[]).filter(
    s => TRADITIONAL_RULERSHIP[s] === (planet as ClassicalPlanet)
  )
  if (classical.length > 0) return classical
  if (INCLUDE_MODERN_OVERLAY && planet in MODERN_OVERLAY) {
    return [MODERN_OVERLAY[planet as keyof typeof MODERN_OVERLAY].domicile]
  }
  return []
}

function exaltationOf(planet: ManifestPlanet): { sign: SignName; degree: number | null } | null {
  if (planet in EXALTATION) {
    const e = EXALTATION[planet as ClassicalPlanet]
    return { sign: e.sign, degree: e.degree }
  }
  if (INCLUDE_MODERN_OVERLAY && planet in MODERN_OVERLAY) {
    return { sign: MODERN_OVERLAY[planet as keyof typeof MODERN_OVERLAY].exaltation, degree: null }
  }
  return null
}

function isClassical(planet: ManifestPlanet): planet is ClassicalPlanet {
  return CHALDEAN_ORDER.includes(planet as ClassicalPlanet)
}

// ─────────────────────────────────────────────────────────────────────────────
// The scorer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score one planet's essential dignity at one ecliptic longitude.
 *
 * Pure and total: every longitude in ℝ maps to a breakdown, wrapping into
 * [0, 360). A planet with no applicable dignity scores 0 and multiplies by
 * exactly 1.0, so an absent dignity is inert rather than fabricated.
 */
export function scoreDignity(
  planet: ManifestPlanet,
  longitude: number,
  sect: Sect,
  aggregation: DignityAggregation = DEFAULT_AGGREGATION
): DignityBreakdown {
  const norm = ((longitude % 360) + 360) % 360
  const signIdx = Math.floor(norm / 30)
  const sign = SIGNS[signIdx]
  const degInSign = norm - signIdx * 30
  const element = elementOfSign(signIdx)

  const components: DignityBreakdown['components'] = []

  // ── Domicile / detriment ────────────────────────────────────────────────
  const domiciles = domicilesOf(planet)
  if (domiciles.includes(sign)) {
    components.push({ kind: 'domicile', points: DIGNITY_POINTS.domicile, note: `rules ${sign}` })
  }
  if (domiciles.some(d => opposingSign(d) === sign)) {
    components.push({ kind: 'detriment', points: DIGNITY_POINTS.detriment, note: `opposes own ${domiciles.join('/')}` })
  }

  // ── Exaltation / fall ───────────────────────────────────────────────────
  const exalt = exaltationOf(planet)
  if (exalt) {
    if (exalt.sign === sign) {
      const at = exalt.degree === null ? '' : ` (exact ${exalt.degree}°)`
      components.push({ kind: 'exaltation', points: DIGNITY_POINTS.exaltation, note: `exalted in ${sign}${at}` })
    }
    if (opposingSign(exalt.sign) === sign) {
      components.push({ kind: 'fall', points: DIGNITY_POINTS.fall, note: `falls in ${sign}` })
    }
  }

  // ── Triplicity (sect-dependent) ─────────────────────────────────────────
  // Only the seven classical bodies hold triplicity, terms or faces.
  if (isClassical(planet)) {
    const trip = DOROTHEAN_TRIPLICITY[element]
    const ruling = sect === 'diurnal' ? trip.day : trip.night
    if (ruling === planet || trip.participating === planet) {
      const role = ruling === planet ? sect : 'participating'
      components.push({
        kind: 'triplicity',
        points: DIGNITY_POINTS.triplicity,
        note: `${element} triplicity (${role})`,
      })
    }

    // ── Term / bound ──────────────────────────────────────────────────────
    for (const [ruler, upper] of EGYPTIAN_TERMS[sign]) {
      if (degInSign < upper) {
        if (ruler === planet) {
          components.push({ kind: 'term', points: DIGNITY_POINTS.term, note: `Egyptian term in ${sign}` })
        }
        break
      }
    }

    // ── Face / decan ──────────────────────────────────────────────────────
    const faceIdx = Math.floor(norm / 10)
    if (FACE_RULERS[faceIdx] === planet) {
      components.push({ kind: 'face', points: DIGNITY_POINTS.face, note: `Chaldean face ${faceIdx + 1}/36` })
    }
  }

  const score =
    components.length === 0
      ? 0
      : aggregation === 'sum'
        ? components.reduce((acc, c) => acc + c.points, 0)
        : components.reduce((best, c) => (c.points > best ? c.points : best), components[0].points)

  return {
    planet,
    longitude: norm,
    sign,
    sect,
    components,
    score,
    multiplier: 1.0 + score / DIGNITY_SCORE_DIVISOR,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// The manifest
// ─────────────────────────────────────────────────────────────────────────────

export const MANIFEST_STRIDE = 360

/** Row-major flat index into a manifest plane. */
export function manifestIndex(planetIdx: number, degree: number): number {
  return planetIdx * MANIFEST_STRIDE + (((Math.floor(degree) % 360) + 360) % 360)
}

/**
 * Build the complete 10 × 360 × 2 dignity manifest.
 *
 * Two planes because triplicity is sect-dependent: the same planet at the same
 * degree carries different dignity by day and by night. Collapsing to a single
 * plane would silently drop that fold.
 *
 * Degrees are sampled at integer resolution, matching the specification's
 * "10-planet × 360-degree matrix". Term boundaries all fall on integers, so
 * integer sampling loses no term transition; exact-exaltation degrees are
 * likewise integral. Sub-degree callers should use scoreDignity() directly.
 */
export function buildDignityManifest(
  aggregation: DignityAggregation = DEFAULT_AGGREGATION
): DignityManifest {
  const n = MANIFEST_PLANETS.length
  const diurnal = new Float64Array(n * MANIFEST_STRIDE)
  const nocturnal = new Float64Array(n * MANIFEST_STRIDE)

  let min = Infinity
  let max = -Infinity
  let minAt: DignityManifest['range']['minAt'] = { planet: 'Sun', degree: 0, sect: 'diurnal' }
  let maxAt: DignityManifest['range']['maxAt'] = { planet: 'Sun', degree: 0, sect: 'diurnal' }

  for (let p = 0; p < n; p++) {
    const planet = MANIFEST_PLANETS[p]
    for (let d = 0; d < MANIFEST_STRIDE; d++) {
      const i = manifestIndex(p, d)
      const day = scoreDignity(planet, d, 'diurnal', aggregation).multiplier
      const night = scoreDignity(planet, d, 'nocturnal', aggregation).multiplier
      diurnal[i] = day
      nocturnal[i] = night

      if (day < min) { min = day; minAt = { planet, degree: d, sect: 'diurnal' } }
      if (night < min) { min = night; minAt = { planet, degree: d, sect: 'nocturnal' } }
      if (day > max) { max = day; maxAt = { planet, degree: d, sect: 'diurnal' } }
      if (night > max) { max = night; maxAt = { planet, degree: d, sect: 'nocturnal' } }
    }
  }

  return { planets: MANIFEST_PLANETS, stride: MANIFEST_STRIDE, diurnal, nocturnal, range: { min, max, minAt, maxAt } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign-resolution fallback and legacy degradation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-fold point breakdown for one body, plus the legacy-compatible summary.
 *
 * Points rather than booleans, because under 'sign-mean' resolution the
 * degree-level folds are expectation values and genuinely fractional.
 */
export interface DignityFoldSummary {
  domicile: number
  exaltation: number
  triplicity: number
  term: number
  face: number
  detriment: number
  fall: number
  /** Σ folds — the Score of the specification. */
  score: number
  /** 𝒟 = 1 + score / DIGNITY_SCORE_DIVISOR. */
  multiplier: number
  /**
   * 'degree'    — a real ecliptic longitude was available; exact dignity.
   * 'sign-mean' — only a sign was known, so degree-level folds are the mean
   *               over that sign's 30 degrees. Never a fabricated 0°.
   */
  resolution: 'degree' | 'sign-mean'
}

const EMPTY_FOLDS = (): Omit<DignityFoldSummary, 'score' | 'multiplier' | 'resolution'> => ({
  domicile: 0,
  exaltation: 0,
  triplicity: 0,
  term: 0,
  face: 0,
  detriment: 0,
  fall: 0,
})

function foldsFromComponents(components: DignityBreakdown['components']) {
  const folds = EMPTY_FOLDS()
  for (const c of components) folds[c.kind] += c.points
  return folds
}

/**
 * Absolute ecliptic longitude from a sign name and a degree within it, or null
 * when the sign is unrecognised.
 *
 * Exists so no caller writes `SIGNS.indexOf(sign) * 30 + degree` by hand.
 * `SIGNS` is lowercase, but sign keys elsewhere in this codebase are Title-case
 * (`toSignKey` in agentMonica) or raw API strings, and a bare `indexOf` returns
 * −1 for all twelve of those — silently mapping EVERY sign to the same wrong
 * longitude rather than failing. That defect shipped briefly during the agent
 * migration and was caught only because a two-body test asserted that Moon
 * domicile and Moon detriment must differ. Case is normalised here, and an
 * unknown sign returns null rather than a plausible number.
 */
export function longitudeFromSignDegree(sign: string, degree: number): number | null {
  const idx = SIGNS.indexOf(String(sign).trim().toLowerCase() as SignName)
  if (idx < 0) return null
  if (!Number.isFinite(degree)) return null
  return idx * 30 + degree
}

/**
 * Exact dignity folds at a known ecliptic longitude.
 */
export function dignityFoldsAtLongitude(
  planet: ManifestPlanet,
  longitude: number,
  sect: Sect,
  aggregation: DignityAggregation = DEFAULT_AGGREGATION
): DignityFoldSummary {
  const b = scoreDignity(planet, longitude, sect, aggregation)
  return {
    ...foldsFromComponents(b.components),
    score: b.score,
    multiplier: b.multiplier,
    resolution: 'degree',
  }
}

/**
 * Expected dignity folds for a body known only by sign — E[𝒟 | sign].
 *
 * Domicile, exaltation, detriment, fall and triplicity are all sign-level, so
 * their mean over the sign equals their exact value and is unchanged. Only term
 * and face vary within a sign, and both are piecewise-constant on integer
 * degree boundaries, so averaging the 30 integer degrees yields the exact
 * measure (a term spanning 6° of 30 contributes 2 × 6/30 = 0.4).
 *
 * This exists because AlchemicalPlanetPositions accepts a bare sign string,
 * which produces a position with no degree at all. Defaulting such a body to 0°
 * would mint Jupiter's Aries term and face 1 across every legacy chart — the
 * same failure aspectCalculator.ts:288 already guards against.
 */
export function dignityFoldsForSign(
  planet: ManifestPlanet,
  sign: string,
  sect: Sect,
  aggregation: DignityAggregation = DEFAULT_AGGREGATION
): DignityFoldSummary {
  const idx = SIGNS.indexOf(sign.toLowerCase() as SignName)
  if (idx < 0) {
    // Unknown sign contributes no dignity rather than a fabricated one.
    return { ...EMPTY_FOLDS(), score: 0, multiplier: 1.0, resolution: 'sign-mean' }
  }

  const acc = EMPTY_FOLDS()
  let score = 0
  for (let d = 0; d < 30; d++) {
    const b = scoreDignity(planet, idx * 30 + d, sect, aggregation)
    const f = foldsFromComponents(b.components)
    for (const k of Object.keys(acc) as Array<keyof typeof acc>) acc[k] += f[k]
    score += b.score
  }
  for (const k of Object.keys(acc) as Array<keyof typeof acc>) acc[k] /= 30
  score /= 30

  return { ...acc, score, multiplier: 1.0 + score / DIGNITY_SCORE_DIVISOR, resolution: 'sign-mean' }
}

/**
 * Collapse the cumulative folds to the narrow 5-state DignityType that existing
 * consumers expect.
 *
 * Uses the LIVE engine's precedence chain (astrologyUtils.ts:1343-1353):
 * Domicile → Exaltation → Detriment → Fall → Neutral. Deliberately NOT
 * "highest-scoring": Mercury in Pisces holds both detriment (−5) and fall (−4),
 * and highest-scoring would report Fall where the engine reports Detriment
 * today — flipping the `strength` field that PlanetInfoModal's bar and the
 * dignityEffects accumulator read live.
 *
 * Returns 'Neutral', not 'Peregrine': the DignityType union has no Peregrine
 * member and widening it is exactly what this degradation exists to avoid.
 */
export function toLegacyDignityType(folds: DignityFoldSummary): LegacyDignityType {
  // Tested against zero, not against > 0: detriment and fall carry NEGATIVE
  // points (−5, −4), so a positivity check silently degrades every debility to
  // Neutral. That mistake scored 96/120 against the live engine instead of 120.
  if (folds.domicile !== 0) return 'Domicile'
  if (folds.exaltation !== 0) return 'Exaltation'
  if (folds.detriment !== 0) return 'Detriment'
  if (folds.fall !== 0) return 'Fall'
  return 'Neutral'
}

/** Mirrors DignityType in src/types/alchemy.ts — intentionally not widened. */
export type LegacyDignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral'

/**
 * The percentage form the existing consumers contract on.
 *
 * `dignityEsmsScale` is not an opaque score — agentMonica.ts:107 and
 * agentMonicaTwoBody.ts:665 both compute `1 + dignityEsmsScale / 100`, and
 * planetaryFBD.ts:741 renders it as "+10%". Emitting the raw manifest score
 * there would halve the applied effect in both monica paths. (𝒟 − 1) × 100
 * reproduces 𝒟 exactly through that existing /100 math, and reduces to the
 * current values for the old scale (domicile → 10).
 *
 * Derived from the score rather than from 𝒟: `(1.12 - 1) * 100` evaluates to
 * 12.00000000000001 in IEEE754, which planetaryFBD would render verbatim as
 * "+12.00000000000001%". score × (100/divisor) is exact for integer scores,
 * and the rounding only trims float dust from fractional sign-mean scores.
 */
export function toLegacyEsmsScale(score: number): number {
  const raw = score * (100 / DIGNITY_SCORE_DIVISOR)
  return Math.round(raw * 1e6) / 1e6
}

/** Read 𝒟_p(θ_p) out of a built manifest. */
export function getDignityMultiplier(
  manifest: DignityManifest,
  planet: ManifestPlanet,
  longitude: number,
  sect: Sect
): number {
  const p = manifest.planets.indexOf(planet)
  if (p < 0) return 1.0 // unknown body contributes no dignity, rather than a fabricated one
  const plane = sect === 'diurnal' ? manifest.diurnal : manifest.nocturnal
  return plane[manifestIndex(p, longitude)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Self-verification — every table must reconstruct from its stated basis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assert the manifest's constants round-trip from their own declared basis.
 * Throws on the first violation. Intended to run in CI and at manifest build
 * time in scripts, so a mistyped bound cannot reach the field engine.
 */
export function assertManifestInvariants(): void {
  const fail = (msg: string): never => {
    throw new Error(`[dignityManifest] invariant violated: ${msg}`)
  }

  // 1. Terms partition each sign's 30 degrees across exactly the five
  //    non-luminaries, each exactly once, with strictly increasing bounds.
  const nonLuminaries: ClassicalPlanet[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  for (const sign of SIGNS) {
    const row = EGYPTIAN_TERMS[sign]
    if (row.length !== 5) fail(`${sign} has ${row.length} terms, expected 5`)
    let prev = 0
    for (const [, upper] of row) {
      if (upper <= prev) fail(`${sign} term bounds not strictly increasing at ${upper}`)
      prev = upper
    }
    if (prev !== 30) fail(`${sign} terms end at ${prev}°, expected 30°`)
    const rulers = row.map(([r]) => r).sort()
    const expected = [...nonLuminaries].sort()
    if (rulers.join(',') !== expected.join(',')) {
      fail(`${sign} term rulers are ${rulers.join(',')}, expected each non-luminary once`)
    }
  }

  // 2. The face cycle closes: 36 faces over a 7-cycle must return to Mars.
  if (FACE_RULERS.length !== 36) fail(`FACE_RULERS has ${FACE_RULERS.length} entries, expected 36`)
  if (FACE_RULERS[0] !== 'Mars') fail(`first face is ${FACE_RULERS[0]}, expected Mars (Aries I)`)
  if (FACE_RULERS[35] !== 'Mars') fail(`last face is ${FACE_RULERS[35]}, expected Mars (Pisces III)`)

  // 3. Every classical planet rules at least one sign and every sign has a ruler.
  for (const planet of CHALDEAN_ORDER) {
    if (domicilesOf(planet).length === 0) fail(`${planet} rules no sign`)
  }

  // 4. Triplicity assigns three distinct rulers per element.
  for (const el of Object.keys(DOROTHEAN_TRIPLICITY) as ZodiacElement[]) {
    const t = DOROTHEAN_TRIPLICITY[el]
    const set = new Set([t.day, t.night, t.participating])
    if (set.size !== 3) fail(`${el} triplicity rulers are not distinct`)
  }

  // 5. An undignified body multiplies by exactly 1 — no fabricated baseline.
  //    Uranus in Gemini holds no classical dignity and no modern one.
  const inert = scoreDignity('Uranus', 65, 'diurnal')
  if (inert.multiplier !== 1.0) {
    fail(`undignified Uranus at 65° returned ${inert.multiplier}, expected exactly 1.0`)
  }

  // 6. The score extrema cited by DIGNITY_SCORE_DIVISOR must still hold. The
  //    divisor is calibrated against them, so a change to DIGNITY_POINTS that
  //    moves the ceiling or floor must not pass silently.
  let lo = Infinity
  let hi = -Infinity
  for (const planet of MANIFEST_PLANETS) {
    for (let d = 0; d < MANIFEST_STRIDE; d++) {
      for (const sect of ['diurnal', 'nocturnal'] as const) {
        const s = scoreDignity(planet, d, sect, 'sum').score
        if (s < lo) lo = s
        if (s > hi) hi = s
      }
    }
  }
  if (hi !== 11) fail(`max summed score is ${hi}, expected 11 (Mercury in Virgo) — recalibrate DIGNITY_SCORE_DIVISOR`)
  if (lo !== -9) fail(`min summed score is ${lo}, expected -9 (Mercury in Pisces) — recalibrate DIGNITY_SCORE_DIVISOR`)
}
