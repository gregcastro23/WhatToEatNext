import type { CraftedAgent } from '@/lib/agent-types'
import { deriveStatsFromChart, type Sacred7Stats } from '@/lib/sacred-7-stats'

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]

function planetLongitude(
  planets: Record<string, { sign: string; degree: number }> | undefined,
  planet: string,
  fallback = 0
): number {
  const p = planets?.[planet]
  if (!p) return fallback
  const idx = SIGN_ORDER.indexOf(p.sign)
  if (idx < 0) return fallback
  return idx * 30 + (typeof p.degree === 'number' ? p.degree : 0)
}

/**
 * The Ascendant's absolute longitude, from the SELF-DESCRIBING `{sign, degree}`
 * form only.
 *
 * ⚠️ A bare number is refused, and that is a behaviour change. This used to read
 * `typeof ascendant === 'number' ? ascendant : 0`, treating the scalar as an
 * absolute longitude. `[MEASURED 2026-07-29]` all 71 production charts carrying a
 * numeric ascendant stored a DEGREE WITHIN A SIGN, so that read was wrong by
 * 30-150° — proven by one chart's own stored aspect (`Sun sextile Ascendant`,
 * orb 0.65, which only reconciles under the degree-within-sign reading). Those
 * values are purged and the writer now emits `{sign, degree}`; a scalar can no
 * longer state its unit, so it is not interpreted.
 *
 * The `fallback` for a genuinely absent Ascendant is unchanged (0) and remains a
 * k12-class fabrication, shared with the `planetLongitude` defaults above
 * (120/90/150/60/0). That whole family is knowingly left alone here — this change
 * migrates a SHAPE, and folding a fallback rewrite into it would mix two
 * different arguments. It affects `adaptability` and `vitality` only, each via
 * `ascendantLongitude / 360 * 10`, so the bound is 10 points of 100.
 */
function ascendantLongitude(
  ascendant: unknown,
  fallback = 0,
): number {
  if (!ascendant || typeof ascendant !== 'object') return fallback;
  const { sign, degree } = ascendant as { sign?: unknown; degree?: unknown };
  if (typeof sign !== 'string') return fallback;
  const idx = SIGN_ORDER.indexOf(sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase());
  if (idx < 0) return fallback;
  return idx * 30 + (typeof degree === 'number' ? degree : 0);
}

/**
 * Synchronously derive the Seven Sacred Stats from an agent's natal chart.
 *
 * This is the *static* baseline used by the persona builder so every response
 * carries stat-informed communication style. The async `computeLiveStats` adds
 * temporal modifiers (planetary hour, moon phase) on top — that's a separate
 * concern reserved for higher-latency contexts.
 */
export function deriveSacredStats(agent: CraftedAgent): Sacred7Stats {
  const planets = agent.consciousness?.natalChart?.planets
  const ascendant = agent.consciousness?.natalChart?.ascendant

  return deriveStatsFromChart({
    // `?? null`, never `?? 0`. 0 is a real, algebraically-proven monica for 284
    // single-body agents, so defaulting to it made "this agent has no monica"
    // and "this agent's monica is zero" the same value.
    monicaConstant: agent.consciousness?.monicaConstant ?? null,
    sunLongitude: planetLongitude(planets, 'Sun', 120),
    moonLongitude: planetLongitude(planets, 'Moon', 90),
    mercuryLongitude: planetLongitude(planets, 'Mercury', 150),
    venusLongitude: planetLongitude(planets, 'Venus', 60),
    marsLongitude: planetLongitude(planets, 'Mars', 0),
    ascendantLongitude: ascendantLongitude(ascendant),
  })
}
