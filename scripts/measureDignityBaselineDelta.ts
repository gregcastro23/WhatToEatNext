/**
 * Measures how the ESMS_BASELINE share distribution moves when the degree
 * dignity manifest D(θ) replaces the engine's existing sign-level dignity layer.
 *
 *   bun run scripts/measureDignityBaselineDelta.ts
 *
 * WHY NON-MUTATING. Wiring D into the engine and re-running
 * generate-esms-baseline.ts answers the same question, but breaks
 * src/__tests__/alchemicalConstitution.test.ts in the process and leaves the
 * committed constants known-stale. This measures the delta with the engine
 * untouched, so the amplitude decision lands before anything downstream moves.
 *
 * HOW IT USES THE REAL ENGINE. calculateAlchemicalFromPlanetsDetailed returns
 * the layer decomposition directly:
 *
 *   totals = Σ_p perPlanet[p].esms  +  aspectModifications
 *            └─ layers 1&2, per body ─┘  └─ layer 3, chart-level ─┘
 *
 * Layers 1–2 are additive per body; layer 3 is not, and is independent of any
 * one body's dignity. So D is applied to the per-body terms only, leaving the
 * aspect layer untouched — which is exactly the ordering Phase 2 specifies
 * ("before aspect interaction matrices are evaluated").
 *
 * An earlier version of this script summed single-body engine calls instead.
 * Its additivity control failed immediately (whole 3.4621 vs summed 2.9176):
 * a one-body chart has no aspects, so that shortcut silently dropped layer 3.
 * The decomposition control below is what replaced it.
 *
 * REPLACE, NOT STACK. perPlanet[p].esms already carries the engine's current
 * dignity multiplier (1 + esmsScale/100, sign-level, 5-state). The manifest is
 * a strict superset of that scheme — measured 118/120 agreement, the two gaps
 * being co-occurring dignities the narrow DignityType cannot express — so D
 * supersedes it. The old multiplier is divided back out before D is applied;
 * stacking them would double-count domicile and exaltation.
 *
 * Sampling is byte-identical to scripts/generate-esms-baseline.ts: same LCG,
 * seed, n, body list and share normalisation. Any difference in the output is
 * therefore attributable to D and nothing else.
 */

import { calculateAlchemicalFromPlanetsDetailed } from '@/utils/planetaryAlchemyMapping'
import {
  buildDignityManifest,
  getDignityMultiplier,
  DIGNITY_SCORE_DIVISOR,
  assertManifestInvariants,
  type ManifestPlanet,
} from '@/calculations/dignityManifest'
import { SEED, SAMPLE_SIZE } from './generate-esms-baseline'

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]
const BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter',
  'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant',
]
const KEYS = ['Spirit', 'Essence', 'Matter', 'Substance'] as const
type Key = (typeof KEYS)[number]
type Esms = Record<Key, number>

/** Same LCG as generate-esms-baseline.ts — reproducibility depends on it. */
function makeRng(seed: number) {
  let s = seed
  return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648
}

type Positions = Record<string, { sign: string; exactLongitude: number }>

function drawChart(rnd: () => number): Positions {
  const p: Positions = {}
  for (const body of BODIES) {
    const longitude = rnd() * 360
    p[body] = { sign: SIGNS[Math.floor(longitude / 30)], exactLongitude: longitude }
  }
  return p
}

const manifest = buildDignityManifest()

/**
 * Returns the shipped totals and the D-substituted totals for one chart, from
 * a single engine call. `dignified` re-weights only the per-body layer.
 */
function evaluate(chart: Positions, diurnal: boolean) {
  const detail = calculateAlchemicalFromPlanetsDetailed(chart, diurnal)
  const base = detail.totals as unknown as Esms
  const aspects = detail.aspectModifications as unknown as Esms

  const dignified: Esms = { ...aspects }
  const recomposed: Esms = { ...aspects }

  for (const [body, contribution] of Object.entries(detail.perPlanet)) {
    const esms = contribution.esms as unknown as Esms
    const oldMultiplier = contribution.dignityMultiplier
    const lon = chart[body]?.exactLongitude ?? 0
    // Ascendant is not a dignity-bearing body; getDignityMultiplier returns
    // exactly 1.0 for it rather than inventing a value.
    const d = getDignityMultiplier(
      manifest,
      body as ManifestPlanet,
      lon,
      diurnal ? 'diurnal' : 'nocturnal'
    )
    for (const k of KEYS) {
      recomposed[k] += esms[k]
      dignified[k] += (esms[k] / oldMultiplier) * d
    }
  }

  return { base, dignified, recomposed }
}

// ── Control: the decomposition must reconstruct the shipped totals ──────────

function proveDecomposition(): void {
  const rnd = makeRng(SEED)
  const TOL = 1e-9
  let maxDelta = 0
  for (let trial = 0; trial < 500; trial++) {
    const chart = drawChart(rnd)
    for (const diurnal of [true, false]) {
      const { base, recomposed } = evaluate(chart, diurnal)
      for (const k of KEYS) {
        const delta = Math.abs(base[k] - recomposed[k])
        if (delta > maxDelta) maxDelta = delta
        if (delta > TOL) {
          throw new Error(
            `[decomposition] Σ perPlanet + aspectModifications ≠ totals — ${k} ` +
              `totals=${base[k]} recomposed=${recomposed[k]} (trial ${trial}, diurnal=${diurnal}). ` +
              `The layer split this script relies on does not hold; do not trust the delta below.`
          )
        }
      }
    }
  }
  console.log(`decomposition: PROVEN over 500 charts × 2 sects (max |Δ| = ${maxDelta.toExponential(2)})`)
}

// ── Sampling ────────────────────────────────────────────────────────────────

interface Stat { mean: number; sd: number }

function sampleSect(diurnal: boolean, n: number) {
  const rnd = makeRng(SEED)
  const shares: Record<'base' | 'dign', Record<Key, number[]>> = {
    base: { Spirit: [], Essence: [], Matter: [], Substance: [] },
    dign: { Spirit: [], Essence: [], Matter: [], Substance: [] },
  }
  let baseMass = 0
  let dignMass = 0

  for (let i = 0; i < n; i++) {
    const { base, dignified } = evaluate(drawChart(rnd), diurnal)
    const bt = KEYS.reduce((s, k) => s + base[k], 0)
    const dt = KEYS.reduce((s, k) => s + dignified[k], 0)
    baseMass += bt
    dignMass += dt
    for (const k of KEYS) {
      shares.base[k].push(bt > 0 ? (base[k] / bt) * 100 : 0)
      shares.dign[k].push(dt > 0 ? (dignified[k] / dt) * 100 : 0)
    }
  }

  const stat = (a: number[]): Stat => {
    const mean = a.reduce((s, v) => s + v, 0) / a.length
    return { mean, sd: Math.sqrt(a.reduce((s, v) => s + (v - mean) ** 2, 0) / a.length) }
  }
  const out = { base: {} as Record<Key, Stat>, dign: {} as Record<Key, Stat> }
  for (const k of KEYS) {
    out.base[k] = stat(shares.base[k])
    out.dign[k] = stat(shares.dign[k])
  }
  return { ...out, baseMass: baseMass / n, dignMass: dignMass / n }
}

function main() {
  assertManifestInvariants()
  console.log(`invariants: PASS  |  divisor=${DIGNITY_SCORE_DIVISOR}  |  n=${SAMPLE_SIZE}/sect  seed=${SEED}\n`)
  proveDecomposition()

  for (const diurnal of [true, false]) {
    const r = sampleSect(diurnal, SAMPLE_SIZE)
    console.log(`\n=== ${diurnal ? 'DIURNAL' : 'NOCTURNAL'} ===`)
    console.log('  coin         shipped%    dignified%        Δpp     Δ/sd')
    for (const k of KEYS) {
      const b = r.base[k]
      const d = r.dign[k]
      const delta = d.mean - b.mean
      const inSd = b.sd > 0 ? delta / b.sd : 0
      console.log(
        `  ${k.padEnd(10)} ${b.mean.toFixed(2).padStart(9)} ${d.mean.toFixed(2).padStart(13)}` +
          `${((delta >= 0 ? '+' : '') + delta.toFixed(3)).padStart(11)}` +
          `${((inSd >= 0 ? '+' : '') + inSd.toFixed(3)).padStart(9)}`
      )
    }
    const massDelta = ((r.dignMass - r.baseMass) / r.baseMass) * 100
    console.log(
      `  mean absolute mass ${r.baseMass.toFixed(4)} → ${r.dignMass.toFixed(4)} ` +
        `(${massDelta >= 0 ? '+' : ''}${massDelta.toFixed(2)}%)`
    )
  }

  console.log(
    '\nΔpp = shift in each coin\'s share of the chart, in percentage points.\n' +
      'Δ/sd expresses that shift against the baseline\'s own population spread —\n' +
      'the number that matters, since archetypes are scored per-quantity against it.\n' +
      'Shares are scale-free, so uniform mass change cancels; a nonzero Δpp is\n' +
      'dignity moving mass BETWEEN coins.'
  )
}

main()
