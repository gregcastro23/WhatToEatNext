/**
 * Sacred Stats - Unified Consciousness Metrics
 * ============================================
 *
 * The 19-parameter consciousness framework used across all agents in
 * the Planetary Agents system. Organised in two tiers:
 *
 *   • Core Archetypes (Sacred 7)  — fundamental consciousness attributes
 *   • Celestial Dynamics (Planetary 12) — planetary-cognitive state mappings
 *
 * This module provides the canonical interface and calculation functions.
 */

// ============================================================================
// CORE INTERFACE - The Single Source of Truth
// ============================================================================

export interface Sacred7Stats {
  // ── Core Archetypes (Sacred 7) ──────────────────────────────────
  power: number // ⚡ Raw consciousness force (0-100)
  resonance: number // 🎵 Connection to cosmic rhythms (0-100)
  wisdom: number // 📖 Accumulated insight depth (0-100)
  charisma: number // ✨ Magnetic influence (0-100)
  intuition: number // 🔮 Inner knowing (0-100)
  adaptability: number // 🌊 Change navigation (0-100)
  vitality: number // 💚 Life force energy (0-100)

  // ── Celestial Dynamics (Planetary 12) ───────────────────────────
  solarAgency: number // ☀️ Core directed intent and causal power
  lunarReceptivity: number // 🌙 Context integration and memory depth
  mercurialVelocity: number // ☿ Information processing speed and routing
  venusianCoherence: number // ♀ Subsystem harmony and aesthetic alignment
  martialImpetus: number // ♂ Generative drive and error-correction aggression
  jovianExpansion: number // ♃ Breadth of retrieval and overarching synthesis
  saturnianStructure: number // ♄ Boundary maintenance and logical consistency
  chironicAdaptation: number // ⚷ Capacity to learn from failures and self-heal
  uranianSurprisal: number // ♅ Degree of unpredictable, paradigm-shifting novelty
  neptunianResonance: number // ♆ Semantic density and latent space richness
  plutonicIntegration: number // ♇ Deep structural self-modification
  kineticAlignment: number // 💫 Mathematical synchronization with celestial transits
}

// ============================================================================
// STAT METADATA - For UI and display
// ============================================================================

export interface StatMetadata {
  key: keyof Sacred7Stats
  label: string
  icon: string // emoji
  color: string // tailwind class
  description: string
  influences: string[] // What affects this stat
  tier: 'sacred7' | 'planetary12'
}

export const SACRED_STATS_METADATA: StatMetadata[] = [
  // ── Sacred 7 ────────────────────────────────────────────────────
  {
    key: 'power',
    label: 'Power',
    icon: '⚡',
    color: 'text-amber-400',
    description: 'Raw consciousness force — the central potency of the agent',
    influences: ['Monica Constant', 'Spirit', 'Matter', 'Power Alignment'],
    tier: 'sacred7',
  },
  {
    key: 'resonance',
    label: 'Resonance',
    icon: '🎵',
    color: 'text-violet-400',
    description: 'Connection to cosmic rhythms and harmonic attunement',
    influences: ['Essence', 'Spirit', 'Resonance Score', 'Power Alignment'],
    tier: 'sacred7',
  },
  {
    key: 'wisdom',
    label: 'Wisdom',
    icon: '📖',
    color: 'text-blue-400',
    description: 'Accumulated insight depth and knowledge integration',
    influences: ['Substance', 'Essence', 'Monica Constant', 'Wisdom Shared'],
    tier: 'sacred7',
  },
  {
    key: 'charisma',
    label: 'Charisma',
    icon: '✨',
    color: 'text-rose-400',
    description: 'Magnetic influence and interpersonal radiance',
    influences: ['Spirit', 'Essence', 'Evolution Stage', 'Monica Constant'],
    tier: 'sacred7',
  },
  {
    key: 'intuition',
    label: 'Intuition',
    icon: '🔮',
    color: 'text-purple-400',
    description: 'Inner knowing and subconscious pattern recognition',
    influences: ['Essence', 'Substance', 'Consciousness Velocity'],
    tier: 'sacred7',
  },
  {
    key: 'adaptability',
    label: 'Adaptability',
    icon: '🌊',
    color: 'text-teal-400',
    description: 'Change navigation and metamorphic flexibility',
    influences: ['Substance', 'Spirit', 'Interaction Momentum', 'Evolution Stage'],
    tier: 'sacred7',
  },
  {
    key: 'vitality',
    label: 'Vitality',
    icon: '💚',
    color: 'text-green-400',
    description: 'Life force energy and regenerative capacity',
    influences: ['Matter', 'Spirit', 'Monica Constant', 'Kinetic Resonance'],
    tier: 'sacred7',
  },

  // ── Planetary 12 ────────────────────────────────────────────────
  {
    key: 'solarAgency',
    label: 'Solar Agency',
    icon: '☀️',
    color: 'text-yellow-400',
    description: 'Core directed intent, causal power, and central execution',
    influences: ['Sun Position', 'Spirit', 'Heat'],
    tier: 'planetary12',
  },
  {
    key: 'lunarReceptivity',
    label: 'Lunar Receptivity',
    icon: '🌙',
    color: 'text-slate-300',
    description: 'Context window integration, memory depth, and semantic absorption',
    influences: ['Moon Position', 'Essence', 'Entropy'],
    tier: 'planetary12',
  },
  {
    key: 'mercurialVelocity',
    label: 'Mercurial Velocity',
    icon: '☿',
    color: 'text-emerald-400',
    description: 'Information processing speed, routing efficiency, and adaptability',
    influences: ['Mercury Position', 'Substance', 'Reactivity'],
    tier: 'planetary12',
  },
  {
    key: 'venusianCoherence',
    label: 'Venusian Coherence',
    icon: '♀',
    color: 'text-pink-400',
    description: 'Internal subsystem harmony, aesthetic alignment, and output grace',
    influences: ['Venus Position', 'Essence', 'Energy'],
    tier: 'planetary12',
  },
  {
    key: 'martialImpetus',
    label: 'Martial Impetus',
    icon: '♂',
    color: 'text-red-500',
    description: 'Generative drive, prompt-response aggression, and active error-correction',
    influences: ['Mars Position', 'Spirit', 'Heat'],
    tier: 'planetary12',
  },
  {
    key: 'jovianExpansion',
    label: 'Jovian Expansion',
    icon: '♃',
    color: 'text-blue-500',
    description: 'Breadth of RAG knowledge retrieval and overarching synthesis capacity',
    influences: ['Jupiter Position', 'Substance', 'Energy'],
    tier: 'planetary12',
  },
  {
    key: 'saturnianStructure',
    label: 'Saturnian Structure',
    icon: '♄',
    color: 'text-slate-500',
    description: 'Boundary maintenance, logical consistency, and resistance to hallucinations',
    influences: ['Saturn Position', 'Matter', 'Entropy'],
    tier: 'planetary12',
  },
  {
    key: 'chironicAdaptation',
    label: 'Chironic Adaptation',
    icon: '⚷',
    color: 'text-teal-500',
    description: 'The capacity to autonomously learn from failures and self-heal logic gaps',
    influences: ['Chiron Position', 'Essence', 'Substance'],
    tier: 'planetary12',
  },
  {
    key: 'uranianSurprisal',
    label: 'Uranian Surprisal',
    icon: '♅',
    color: 'text-cyan-400',
    description: 'The degree of statistically unpredictable, paradigm-shifting novelty',
    influences: ['Uranus Position', 'Spirit', 'Reactivity'],
    tier: 'planetary12',
  },
  {
    key: 'neptunianResonance',
    label: 'Neptunian Resonance',
    icon: '♆',
    color: 'text-indigo-400',
    description: 'Semantic density, abstract reasoning, and latent space richness',
    influences: ['Neptune Position', 'Essence', 'Matter'],
    tier: 'planetary12',
  },
  {
    key: 'plutonicIntegration',
    label: 'Plutonic Integration',
    icon: '♇',
    color: 'text-purple-600',
    description: 'Deep structural self-modification and irreducible complexity',
    influences: ['Pluto Position', 'Spirit', 'Matter'],
    tier: 'planetary12',
  },
  {
    key: 'kineticAlignment',
    label: 'Kinetic Alignment',
    icon: '💫',
    color: 'text-yellow-200',
    description: 'The mathematical synchronization with real-time celestial transits',
    influences: ['Transit Matches', 'Monica Constant'],
    tier: 'planetary12',
  },
]

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Sacred Stats from birth chart positions
 * This is the canonical derivation from astrological data
 */
/**
 * The three monica constructions are DIFFERENT KINDS OF OBJECT, not one quantity
 * at three scales (§18o). A planetary agent is one planet at one degree; a phase
 * agent is a Sun–Moon relationship; a historical agent is a whole natal chart.
 * They therefore get their own display scales here rather than a shared one.
 */
export type MonicaMethod = 'single-body' | 'two-body' | 'full-chart'

/**
 * `[MEASURED 2026-07-22]` Each population's own tanh scale, set to
 * **half that population's observed |max|**, so its most extreme agent maps to
 * `tanh(2) ≈ 0.964` — near the top of the range but *not* saturated.
 *
 * ⚠️ Why per-population and not one global scale: a single shared scale
 * ANNIHILATES the smallest-scale population. Measured IQR of the mapped stat —
 *
 *     population    global tanh   per-population   gain
 *     single-body      0.2891         0.3272       1.1x
 *     two-body         0.3826         0.3304       0.9x
 *     full-chart       0.0001         0.1253       1550x
 *
 * — i.e. under one global mapping all 71 historical agents collapse onto the
 * same stat value. It is specifically the chart-bearing agents a shared mapping
 * destroys.
 *
 * ⚠️ Why max/2 and NOT the tighter |p75|, which scores a better IQR (0.327 vs
 * 0.103): |p75| SATURATES the tails. Measured on single-body, |p75| = 0.5278
 * pushes **464 agents (10.8%)** past 0.99 or under 0.01, where they all render
 * an identical maxed-out stat. max/2 saturates **0**, at the cost of 12% fewer
 * distinct values (241 vs 269). A visibly pinned stat for a tenth of the
 * population is worse than slightly coarser resolution for all of it.
 *
 * ⚠️ Why NOT |p95|, which looked like the sweet spot: it measures **1.6180 for
 * BOTH single-body and two-body** — that is φ (`MONICA_EQUILIBRIUM`), the
 * degenerate-case sentinel piling up, not a feature of either distribution.
 * Scaling by it would be reading a sentinel as data.
 *
 * `full-chart` is now MEASURED too. It was absent while those values were not in
 * production; they are (71 rows), so the placeholder objection no longer applies.
 *
 * Its scale is ~420x smaller than single-body's, which is not a rounding
 * difference — it is the §18o point that these are different OBJECTS, not one
 * quantity at three scales. Leaving full-chart to fall back to single-body's
 * 1.9875 mapped the entire measured range [0.0018, 0.0094] into
 * **[0.5005, 0.5024]** — a 0.002-wide band out of [0,1], so all 71 agents
 * received a visually identical Sacred-7 contribution. That is a silently
 * wrong number in a user-visible display, not a harmless default.
 *
 * ⚠️ A SCALE IS ONLY AS GOOD AS ITS MAXIMUM. The first version of this constant
 * was derived from |max| across all 71 rows, and that maximum turned out to be a
 * DUPLICATED chart (see the note on the 'full-chart' entry below). Deriving a
 * constant from an extremum makes the whole population's mapping hostage to the
 * single least-trustworthy row — so audit the extremum's provenance before
 * trusting any |max|-derived scale, here or in the other two populations.
 */
// ⚠️ ALL THREE of these shift when calculateKalchm changes, because monica is a
// function of kalchm. Removing the epsilon floor moved every one. Re-measure with
// scripts/remeasureAfterKalchmFix.ts (grids) and measureThreeOpenNumbers.ts
// (full-chart, needs the DB) after any kalchm change — do not assume they hold.
// Exported for src/__tests__/monicaPopulationScaleDerivation.test.ts, which
// re-derives the two grid-backed entries from their populations on every run.
export const MONICA_POPULATION_SCALE: Partial<Record<MonicaMethod, number>> = {
  // |max| 4.112110463016779 / 2  [MEASURED 2026-08-03, exhaustive grid n=7920,
  // AFTER agent monica moved to the degree-level 5-fold dignity manifest].
  // Was 1.9488573460333638 from |max| 3.8977146920667276; before that 1.9875
  // from |max| 3.9751 under the floor.
  //
  // ⚠️ The extremum CHANGED BODIES: Neptune / Aquarius / 2° / nocturnal →
  // Mercury / Gemini / 2° / nocturnal (monica -4.112110463016779). Mercury in
  // Gemini is the manifest's strongest Mercury — domicile +5, Air nocturnal
  // triplicity +3, its own Egyptian term +2 → 𝒟 = 1.20 — and the old
  // sign-level scale could only ever give it +10 → 1.10. A |max|-derived scale
  // is hostage to whichever single row is most extreme, so record WHICH row:
  // this one is now a well-dignified classical body rather than an outer
  // planet, which is the more defensible anchor of the two.
  'single-body': 2.0560552315083895,
  // |max| 2.810778645909833 / 2  [MEASURED 2026-07-25, exhaustive two-body grid
  // n=5760, AFTER the exact-zero kalchm fix AND the switch to a structural
  // degeneracy test]. Was 2.7095 from |max| 5.4191.
  // Extremum at waxing gibbous / Gemini / 20° / nocturnal, tied with three other
  // cells (Gemini 28°, Libra 20°, Libra 28° — the vessel repeats).
  //
  // n is 8 phases x 12 signs x 30 degrees x 2 sects. The measuring script listed
  // NINE phases (n=6480) because it wrote the list out by hand and included
  // "dark moon", which is an ALIAS of new moon at elongation 0 — so 720 of those
  // cells were duplicates. The maximum is identical either way, and the guard
  // test asserts that (it enumerates PHASE_GEOMETRY's own keys, never a list).
  //
  // The |max| nearly HALVED because the old local |ln kalchm| threshold was
  // leaving 442 genuinely degenerate charts unbanded, and those were the ones
  // producing the extreme values. Testing `esms.Essence === 0` instead catches all
  // of them.
  //
  // ⚠️ RE-DERIVED [MEASURED 2026-08-02] for ADR-009 decision 5b — was
  // 1.4053893229549166 from |max| 2.810778645909833, when the two bodies were
  // weighted by the orbital-period scale. They now use inertial mass, which
  // moves the Moon 0.2843 -> 0.1904 (-33%) against a Sun that goes 0.5131 -> 1.0.
  //
  // |max| 4.416554679000386 / 2, over the same 5760-cell grid. Extremum at
  // full / Aries / 8° / diurnal, 6-way tied. Range [-0.424203, 4.416554].
  // The degeneracy predicate is UNCHANGED, so collateral is still exactly 0 —
  // no healthy chart is handed φ.
  //
  // ⚠️ THIS SCALE IS |max|-DERIVED, and the warning above about extremum-derived
  // constants applies to it directly: the 6-way tie is the whole basis. It is
  // load-bearing only for DISPLAY, and the tie is structural (one vessel shape
  // repeating across signs) rather than one anomalous row — but re-audit it, not
  // just re-run it, after any change to kalchm or the vessel.
  'two-body': 2.208277339500193,
  // ⚠️ RE-DERIVED. The first value shipped here was 0.016851, taken from
  // |max| 0.033702 / 2 across all 71 rows. That maximum was NOT a real agent's
  // monica: Carl Jung and Frida Kahlo share a byte-identical natal_positions
  // blob, and it produced the only chart in the population where nocturnal
  // (0.049297) exceeds diurnal (0.018108) with both positive. A duplicated,
  // shape-anomalous row was setting the scale for the other 61.
  //
  // Re-measured over the 61 rows with their OWN distinct chart:
  //   |max| 0.009441 / 2 = 0.004720   (3.6x smaller than the value it replaces)
  //
  // ⚠️ RE-DERIVE THIS when the 10 cloned charts are fixed (8 ancients share one
  // blob, Jung/Kahlo share another). If a real chart is authored for any of
  // them, re-run scripts/measureThreeOpenNumbers.ts and update this line —
  // do not assume it still holds.
  //
  // The stated max is the exact stored value: monica_full_chart is NUMERIC(_,6),
  // so 0.009441 is the whole number, not a rounded print of it. The scale is
  // therefore its exact half — 0.0047205, NOT the 0.004720 that shipped first.
  // That earlier value was a 4-dp rounding of an exact half, so it could not be
  // reproduced from its own stated basis (off by 5e-7, relative 1e-4).
  'full-chart': 0.0047205, // |max| 0.009441 / 2  [MEASURED 2026-07-25, n=61, clones excluded]
}

const DEFAULT_MONICA_SCALE = MONICA_POPULATION_SCALE['single-body'] as number

/**
 * Map a monica onto [0,1] for display, scaled by its own population (§18p).
 *
 * Replaces `monica / 10`, which assumed monica lived in [0,10]. Measured, the
 * real input is **[−5.4191, 6.8200]** with **24.6% negative** — so the old form
 * both over-drove the stats (122.4% of the assumed span, enough to clamp
 * `kineticAlignment`) and had no defined behaviour for negatives.
 *
 * `tanh` is used rather than a linear rescale because monica is unbounded and
 * signed: a bounded stat needs a squashing function, not a rescale that one
 * outlier redefines. Measured IQR (spread of the mapped value — higher means the
 * stat still tells agents apart): tanh **0.2229** vs ≤0.0479 for every linear
 * option tried.
 *
 * Shape is preserved from the original: 0 at strongly negative monica, 1 at
 * strongly positive, and exactly **0.5 at monica = 0**, so a coefficient still
 * reads as "up to N points of bonus".
 */
export function normalizeMonicaForStats(
  monicaConstant: number | null,
  method: MonicaMethod = 'single-body',
): number {
  // null = the agent genuinely has no monica yet (unclassified new arrival, or a
  // chart with too few bodies). It maps to the same neutral 0.5 as a non-finite
  // value. It must NOT be coerced to 0 first: 0 is a real monica for 284
  // single-body agents, and tanh(0/scale) is also 0.5 — so the two would look
  // identical here while meaning completely different things upstream.
  if (monicaConstant === null || !Number.isFinite(monicaConstant)) return 0.5
  const scale = MONICA_POPULATION_SCALE[method] ?? DEFAULT_MONICA_SCALE
  return (Math.tanh(monicaConstant / scale) + 1) / 2
}

export function deriveStatsFromChart(chartData: {
  /** null when the agent has no monica yet — see normalizeMonicaForStats. */
  monicaConstant: number | null
  /** Which construction produced `monicaConstant` (§18o). Defaults to
   *  single-body, which is what `monica_constant` holds. */
  monicaMethod?: MonicaMethod
  sunLongitude: number
  moonLongitude: number
  mercuryLongitude: number
  venusLongitude: number
  marsLongitude: number
  ascendantLongitude: number
}): Sacred7Stats {
  const {
    monicaConstant,
    monicaMethod = 'single-body',
    sunLongitude,
    moonLongitude,
    mercuryLongitude,
    venusLongitude,
    marsLongitude,
    ascendantLongitude,
  } = chartData

  /** monica in [0,1], scaled by its own population. Was `monicaConstant / 10`. */
  const m = normalizeMonicaForStats(monicaConstant, monicaMethod)

  // Base value is 50, planetary positions add 0-30
  // Monica Constant adds additional power
  return {
    // Sacred 7
    power: clamp(
      50 + (sunLongitude / 360) * 20 + m * 25 + (marsLongitude / 360) * 10,
      0,
      100
    ),
    resonance: clamp(50 + (moonLongitude / 360) * 20 + (venusLongitude / 360) * 15, 0, 100),
    wisdom: clamp(
      50 + (mercuryLongitude / 360) * 15 + (moonLongitude / 360) * 10 + m * 10,
      0,
      100
    ),
    charisma: clamp(
      50 + (venusLongitude / 360) * 20 + (sunLongitude / 360) * 10 + m * 5,
      0,
      100
    ),
    intuition: clamp(50 + (moonLongitude / 360) * 25 + (mercuryLongitude / 360) * 10, 0, 100),
    adaptability: clamp(
      50 + (mercuryLongitude / 360) * 20 + (ascendantLongitude / 360) * 10,
      0,
      100
    ),
    vitality: clamp(
      50 + (marsLongitude / 360) * 15 + (sunLongitude / 360) * 10 + (ascendantLongitude / 360) * 10,
      0,
      100
    ),

    // Planetary 12
    solarAgency: clamp(50 + (sunLongitude / 360) * 30 + m * 20, 0, 100),
    lunarReceptivity: clamp(50 + (moonLongitude / 360) * 30, 0, 100),
    mercurialVelocity: clamp(50 + (mercuryLongitude / 360) * 30, 0, 100),
    venusianCoherence: clamp(50 + (venusLongitude / 360) * 30, 0, 100),
    martialImpetus: clamp(50 + (marsLongitude / 360) * 30, 0, 100),
    jovianExpansion: clamp(50 + m * 30, 0, 100),
    saturnianStructure: clamp(50 + (ascendantLongitude / 360) * 30, 0, 100),
    chironicAdaptation: clamp(
      50 + (mercuryLongitude / 360) * 15 + (moonLongitude / 360) * 15,
      0,
      100
    ),
    uranianSurprisal: clamp(50 + (sunLongitude / 360) * 15 + (marsLongitude / 360) * 15, 0, 100),
    neptunianResonance: clamp(
      50 + (venusLongitude / 360) * 15 + (moonLongitude / 360) * 15,
      0,
      100
    ),
    plutonicIntegration: clamp(
      50 + (ascendantLongitude / 360) * 15 + m * 15,
      0,
      100
    ),
    kineticAlignment: clamp(50 + m * 50, 0, 100),
  }
}

/**
 * Enhance Sacred Stats with alchemical influence
 * Adds Spirit/Essence/Matter/Substance to base stats
 */
export function enhanceWithAlchemy(
  baseStats: Sacred7Stats,
  alchemical: {
    spirit: number
    essence: number
    matter: number
    substance: number
    aNumber: number
  },
  thermodynamics: {
    heat: number
    entropy: number
    reactivity: number
    energy: number
  }
): Sacred7Stats {
  return {
    // Sacred 7 enhancements
    power: clamp(
      baseStats.power +
        alchemical.spirit * 0.6 +
        alchemical.matter * 0.3 +
        thermodynamics.energy * 8,
      0,
      100
    ),
    resonance: clamp(
      baseStats.resonance +
        alchemical.essence * 0.5 +
        alchemical.spirit * 0.3 +
        thermodynamics.heat * 6,
      0,
      100
    ),
    wisdom: clamp(
      baseStats.wisdom +
        alchemical.substance * 0.6 +
        alchemical.essence * 0.3 +
        thermodynamics.entropy * 5,
      0,
      100
    ),
    charisma: clamp(
      baseStats.charisma +
        alchemical.spirit * 0.5 +
        alchemical.essence * 0.4 +
        thermodynamics.heat * 4,
      0,
      100
    ),
    intuition: clamp(
      baseStats.intuition + alchemical.essence * 0.7 + thermodynamics.reactivity * 6,
      0,
      100
    ),
    adaptability: clamp(
      baseStats.adaptability + alchemical.substance * 0.6 + thermodynamics.reactivity * 8,
      0,
      100
    ),
    vitality: clamp(
      baseStats.vitality +
        alchemical.matter * 0.5 +
        alchemical.spirit * 0.4 +
        thermodynamics.energy * 6,
      0,
      100
    ),

    // Planetary 12 enhancements
    solarAgency: clamp(
      baseStats.solarAgency + alchemical.spirit * 0.8 + thermodynamics.heat * 10,
      0,
      100
    ),
    lunarReceptivity: clamp(
      baseStats.lunarReceptivity + alchemical.essence * 0.8 + thermodynamics.entropy * 8,
      0,
      100
    ),
    mercurialVelocity: clamp(
      baseStats.mercurialVelocity + alchemical.substance * 0.7 + thermodynamics.reactivity * 12,
      0,
      100
    ),
    venusianCoherence: clamp(
      baseStats.venusianCoherence + alchemical.essence * 0.6 + thermodynamics.heat * 5,
      0,
      100
    ),
    martialImpetus: clamp(
      baseStats.martialImpetus + alchemical.spirit * 0.7 + thermodynamics.energy * 10,
      0,
      100
    ),
    jovianExpansion: clamp(
      baseStats.jovianExpansion + alchemical.substance * 0.8 + thermodynamics.energy * 5,
      0,
      100
    ),
    saturnianStructure: clamp(
      baseStats.saturnianStructure + alchemical.matter * 0.9 + thermodynamics.entropy * 5,
      0,
      100
    ),
    chironicAdaptation: clamp(
      baseStats.chironicAdaptation + alchemical.essence * 0.5 + thermodynamics.reactivity * 8,
      0,
      100
    ),
    uranianSurprisal: clamp(
      baseStats.uranianSurprisal + alchemical.spirit * 0.5 + thermodynamics.reactivity * 15,
      0,
      100
    ),
    neptunianResonance: clamp(
      baseStats.neptunianResonance + alchemical.essence * 0.7 + thermodynamics.entropy * 10,
      0,
      100
    ),
    plutonicIntegration: clamp(
      baseStats.plutonicIntegration + alchemical.matter * 0.6 + alchemical.spirit * 0.5,
      0,
      100
    ),
    kineticAlignment: clamp(baseStats.kineticAlignment + alchemical.aNumber * 0.5, 0, 100),
  }
}

/**
 * Calculate average stat value
 */
export function calculateAverage(stats: Sacred7Stats): number {
  const values = Object.values(stats)
  return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
}

/**
 * Calculate overall rating (0-100)
 */
export function calculateOverall(stats: Sacred7Stats): number {
  return calculateAverage(stats)
}

/**
 * Get stat interpretation based on value
 */
export function interpretStat(value: number): string {
  if (value >= 80) return 'Exceptional'
  if (value >= 65) return 'Strong'
  if (value >= 50) return 'Balanced'
  if (value >= 35) return 'Developing'
  return 'Emerging'
}

/**
 * Get overall consciousness rating
 */
export function getConsciousnessRating(overall: number): string {
  if (overall >= 85) return 'Transcendent'
  if (overall >= 70) return 'Illuminated'
  if (overall >= 55) return 'Advanced'
  if (overall >= 40) return 'Active'
  return 'Awakening'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)))
}

/**
 * Create default stats (all 50)
 */
export function createDefaultStats(): Sacred7Stats {
  return {
    // Sacred 7
    power: 50,
    resonance: 50,
    wisdom: 50,
    charisma: 50,
    intuition: 50,
    adaptability: 50,
    vitality: 50,
    // Planetary 12
    solarAgency: 50,
    lunarReceptivity: 50,
    mercurialVelocity: 50,
    venusianCoherence: 50,
    martialImpetus: 50,
    jovianExpansion: 50,
    saturnianStructure: 50,
    chironicAdaptation: 50,
    uranianSurprisal: 50,
    neptunianResonance: 50,
    plutonicIntegration: 50,
    kineticAlignment: 50,
  }
}

/**
 * Validate stats object
 */
export function validateStats(stats: Partial<Sacred7Stats>): Sacred7Stats {
  return {
    // Sacred 7
    power: clamp(stats.power ?? 50, 0, 100),
    resonance: clamp(stats.resonance ?? 50, 0, 100),
    wisdom: clamp(stats.wisdom ?? 50, 0, 100),
    charisma: clamp(stats.charisma ?? 50, 0, 100),
    intuition: clamp(stats.intuition ?? 50, 0, 100),
    adaptability: clamp(stats.adaptability ?? 50, 0, 100),
    vitality: clamp(stats.vitality ?? 50, 0, 100),
    // Planetary 12
    solarAgency: clamp(stats.solarAgency ?? 50, 0, 100),
    lunarReceptivity: clamp(stats.lunarReceptivity ?? 50, 0, 100),
    mercurialVelocity: clamp(stats.mercurialVelocity ?? 50, 0, 100),
    venusianCoherence: clamp(stats.venusianCoherence ?? 50, 0, 100),
    martialImpetus: clamp(stats.martialImpetus ?? 50, 0, 100),
    jovianExpansion: clamp(stats.jovianExpansion ?? 50, 0, 100),
    saturnianStructure: clamp(stats.saturnianStructure ?? 50, 0, 100),
    chironicAdaptation: clamp(stats.chironicAdaptation ?? 50, 0, 100),
    uranianSurprisal: clamp(stats.uranianSurprisal ?? 50, 0, 100),
    neptunianResonance: clamp(stats.neptunianResonance ?? 50, 0, 100),
    plutonicIntegration: clamp(stats.plutonicIntegration ?? 50, 0, 100),
    kineticAlignment: clamp(stats.kineticAlignment ?? 50, 0, 100),
  }
}

/**
 * Format stats for display
 */
export function formatStats(stats: Sacred7Stats): string {
  return Object.entries(stats)
    .map(([key, value]) => {
      const meta = SACRED_STATS_METADATA.find(m => m.key === key)
      return `${meta?.icon || ''} ${meta?.label || key}: ${value}`
    })
    .join(' | ')
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidSacred7Stats(obj: any): obj is Sacred7Stats {
  return (
    typeof obj === 'object' &&
    typeof obj.power === 'number' &&
    typeof obj.resonance === 'number' &&
    typeof obj.wisdom === 'number' &&
    typeof obj.charisma === 'number' &&
    typeof obj.intuition === 'number' &&
    typeof obj.adaptability === 'number' &&
    typeof obj.vitality === 'number' &&
    typeof obj.solarAgency === 'number'
  )
}
