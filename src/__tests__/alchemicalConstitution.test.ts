import { sampleSect } from '../../scripts/generate-esms-baseline';
import { calculateComprehensiveAspects, type PlanetaryPositionData } from '../utils/aspectCalculator';
import type { AspectWithStrength } from '../utils/aspectESMSEffects';
import {
  ESMS_BASELINE,
  ESMS_KEYS,
  ARCHETYPE_BY_QUANTITY,
  toEsmsShares,
  selectArchetype,
  type EsmsShares,
} from '../utils/alchemicalConstitution';
import { calculateEnhancedAlchemicalFromPlanets } from '../utils/planetaryAlchemyMapping';

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];
const BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter',
  'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant',
];

/** Build a chart the way natalChartService does: longitude drives the sign. */
function chartFrom(rnd: () => number) {
  const aspectPositions: Record<string, PlanetaryPositionData> = {};
  const signMap: Record<string, string> = {};
  for (const body of BODIES) {
    const longitude = rnd() * 360;
    const sign = SIGNS[Math.floor(longitude / 30)];
    aspectPositions[body] = { sign, degree: longitude % 30, exactLongitude: longitude };
    signMap[body] = sign;
  }
  const aspects: AspectWithStrength[] = calculateComprehensiveAspects(aspectPositions).map((a) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.type,
    strength: a.strength,
  }));
  return { signMap, aspects };
}

function makeRng(seed: number) {
  let s = seed;
  return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
}

describe('toEsmsShares', () => {
  test('normalizes raw planetary sums to percentage shares totalling 100', () => {
    const shares = toEsmsShares({ Spirit: 4, Essence: 4, Matter: 1, Substance: 1 });
    expect(shares.spirit).toBeCloseTo(40);
    expect(shares.essence).toBeCloseTo(40);
    expect(shares.matter).toBeCloseTo(10);
    expect(shares.substance).toBeCloseTo(10);
  });

  test('returns exact, unrounded shares', () => {
    // 1/3 each must not be pre-rounded — selectArchetype needs sub-point precision.
    const shares = toEsmsShares({ Spirit: 1, Essence: 1, Matter: 1, Substance: 0 });
    expect(shares.spirit).toBeCloseTo(33.333, 2);
    expect(Number.isInteger(shares.spirit)).toBe(false);
  });

  test('guards against divide-by-zero on an empty chart', () => {
    const shares = toEsmsShares({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 });
    for (const key of ESMS_KEYS) expect(shares[key]).toBe(0);
  });
});

describe('selectArchetype', () => {
  const atBaseline = (sect: 'diurnal' | 'nocturnal'): EsmsShares => ({
    spirit: ESMS_BASELINE[sect].spirit.mean,
    essence: ESMS_BASELINE[sect].essence.mean,
    matter: ESMS_BASELINE[sect].matter.mean,
    substance: ESMS_BASELINE[sect].substance.mean,
  });

  test('picks the quantity furthest above its sect baseline, not the largest', () => {
    // Essence is numerically the biggest, but Spirit is the one that stands out.
    const shares = { ...atBaseline('diurnal') };
    shares.spirit += 3;
    const { dominantToken, baseArchetype } = selectArchetype(shares, true);
    expect(shares.essence).toBeGreaterThan(shares.spirit); // Essence still larger
    expect(dominantToken).toBe('spirit');
    expect(baseArchetype).toBe(ARCHETYPE_BY_QUANTITY.spirit);
  });

  test('uses the sect-appropriate baseline', () => {
    // Matter at the day mean is unremarkable by day, but far BELOW the night mean.
    const dayShares = { ...atBaseline('diurnal') };
    dayShares.matter += 4;
    expect(selectArchetype(dayShares, true).dominantToken).toBe('matter');
    // Same numbers scored against the night baseline must not pick Matter.
    expect(selectArchetype(dayShares, false).dominantToken).not.toBe('matter');
  });

  test('every quantity can win, so no archetype is unreachable', () => {
    for (const key of ESMS_KEYS) {
      const shares = { ...atBaseline('nocturnal') };
      shares[key] += 5;
      expect(selectArchetype(shares, false).dominantToken).toBe(key);
    }
  });

  test('all four archetypes occur across a population of real charts', () => {
    const rnd = makeRng(4242);
    const seen = new Set<string>();
    for (let i = 0; i < 600; i++) {
      const diurnal = rnd() > 0.5;
      const { signMap, aspects } = chartFrom(rnd);
      const esms = calculateEnhancedAlchemicalFromPlanets(signMap, diurnal, aspects);
      seen.add(selectArchetype(toEsmsShares(esms), diurnal).baseArchetype);
    }
    expect(seen.size).toBe(4);
  });

  test('scoring rounded shares would lose signal, so exact shares are required', () => {
    // Substance's day sd is well under one point; integer rounding is ~0.5 of it.
    expect(ESMS_BASELINE.diurnal.substance.sd).toBeLessThan(1);
    const shares = { ...atBaseline('diurnal') };
    shares.substance += 0.4;
    const rounded: EsmsShares = {
      spirit: Math.round(shares.spirit),
      essence: Math.round(shares.essence),
      matter: Math.round(shares.matter),
      substance: Math.round(shares.substance),
    };
    expect(selectArchetype(shares, true).z).not.toBeCloseTo(selectArchetype(rounded, true).z, 2);
  });
});

describe('ESMS_BASELINE', () => {
  // Guards the constants against engine drift: if PLANETARY_ALCHEMY, the
  // sectarian table, the dignity scales or the aspect effects change, the
  // committed baseline goes stale and archetypes skew silently. Regenerate with
  // `bun run scripts/generate-esms-baseline.ts` and paste the result.
  const SAMPLE = 2000;
  const MEAN_TOLERANCE = 0.5;
  const SD_TOLERANCE = 0.3;

  test.each([['diurnal'], ['nocturnal']] as const)(
    '%s baseline still matches the live engine',
    (sect) => {
      const fresh = sampleSect(sect === 'diurnal', SAMPLE);
      for (const key of ESMS_KEYS) {
        expect(Math.abs(fresh[key].mean - ESMS_BASELINE[sect][key].mean)).toBeLessThan(MEAN_TOLERANCE);
        expect(Math.abs(fresh[key].sd - ESMS_BASELINE[sect][key].sd)).toBeLessThan(SD_TOLERANCE);
      }
    },
  );

  test('sect materially changes the profile, so a blended baseline would be wrong', () => {
    expect(
      Math.abs(ESMS_BASELINE.diurnal.matter.mean - ESMS_BASELINE.nocturnal.matter.mean),
    ).toBeGreaterThan(20);
  });
});
