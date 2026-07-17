import {
  calculateComprehensiveAspects,
  signDegreeToLongitude,
  type PlanetaryPositionData,
} from '../utils/aspectCalculator';

/**
 * Aspects are angular separations, so they need ABSOLUTE ecliptic longitudes
 * (0-360). `degree` is sign-relative (positions.ts derives it as
 * `longitude % 30`). Feeding degree in as a longitude squeezes all ten planets
 * into the first 30 degrees of the zodiac, which turns essentially every pair
 * into a conjunction — identically for every chart. RealAlchemizeService did
 * exactly that whenever a caller omitted exactLongitude, which silently made
 * ESMS near-constant. These tests pin the arithmetic and the symptom.
 */

// A chart spread across the whole zodiac.
const CHART: Record<string, { sign: string; degree: number }> = {
  Sun: { sign: 'leo', degree: 22 },
  Moon: { sign: 'pisces', degree: 3 },
  Mercury: { sign: 'virgo', degree: 8 },
  Venus: { sign: 'cancer', degree: 17 },
  Mars: { sign: 'aries', degree: 1 },
  Jupiter: { sign: 'sagittarius', degree: 25 },
  Saturn: { sign: 'capricorn', degree: 11 },
  Uranus: { sign: 'aquarius', degree: 6 },
  Neptune: { sign: 'capricorn', degree: 14 },
  Pluto: { sign: 'scorpio', degree: 19 },
};

describe('signDegreeToLongitude', () => {
  test('maps sign + degree to an absolute ecliptic longitude', () => {
    expect(signDegreeToLongitude('aries', 0)).toBe(0);
    expect(signDegreeToLongitude('leo', 22)).toBe(142);
    expect(signDegreeToLongitude('pisces', 3)).toBe(333);
    expect(signDegreeToLongitude('pisces', 29.99)).toBeCloseTo(359.99, 2);
  });

  test('includes arcminutes and is case-insensitive', () => {
    expect(signDegreeToLongitude('leo', 22, 30)).toBe(142.5);
    expect(signDegreeToLongitude('LEO', 22)).toBe(142);
  });

  test('returns null rather than guessing on an unknown sign', () => {
    // A wrong longitude yields confidently wrong aspects, so never fabricate.
    expect(signDegreeToLongitude('nonsense', 5)).toBeNull();
    expect(signDegreeToLongitude('', 5)).toBeNull();
  });
});

describe('aspect longitudes', () => {
  const withRealLongitudes = (): Record<string, PlanetaryPositionData> => {
    const out: Record<string, PlanetaryPositionData> = {};
    for (const [planet, p] of Object.entries(CHART)) {
      out[planet] = {
        sign: p.sign,
        degree: p.degree,
        exactLongitude: signDegreeToLongitude(p.sign, p.degree)!,
      };
    }
    return out;
  };

  // The old bug: exactLongitude fabricated from the sign-relative degree.
  const withFabricatedLongitudes = (): Record<string, PlanetaryPositionData> => {
    const out: Record<string, PlanetaryPositionData> = {};
    for (const [planet, p] of Object.entries(CHART)) {
      out[planet] = { sign: p.sign, degree: p.degree, exactLongitude: p.degree };
    }
    return out;
  };

  test('a spread-out chart is not one giant stellium', () => {
    const aspects = calculateComprehensiveAspects(withRealLongitudes());
    const conjunctions = aspects.filter((a) => a.type === 'conjunction');
    // Planets 30-330 degrees apart must not read as conjunct.
    expect(conjunctions.length).toBeLessThan(3);
    expect(new Set(aspects.map((a) => a.type)).size).toBeGreaterThan(3);
  });

  test('regression: sign-relative degrees as longitudes collapse everything to conjunctions', () => {
    const fabricated = calculateComprehensiveAspects(withFabricatedLongitudes());
    const real = calculateComprehensiveAspects(withRealLongitudes());

    const allConjunct = fabricated.every((a) => a.type === 'conjunction');
    expect(allConjunct).toBe(true);
    // ...and that is emphatically not the real chart.
    expect(real.filter((a) => a.type === 'conjunction').length).toBeLessThan(
      fabricated.length,
    );
  });

  test('omitting exactLongitude falls back to sign + degree, not to degree alone', () => {
    const noLongitude: Record<string, PlanetaryPositionData> = {};
    for (const [planet, p] of Object.entries(CHART)) {
      noLongitude[planet] = { sign: p.sign, degree: p.degree };
    }
    const fallback = calculateComprehensiveAspects(noLongitude);
    const explicit = calculateComprehensiveAspects(withRealLongitudes());
    expect(fallback.length).toBe(explicit.length);
    expect(fallback.map((a) => a.type).sort()).toEqual(
      explicit.map((a) => a.type).sort(),
    );
  });
});
