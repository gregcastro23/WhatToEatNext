import {
  calculateComprehensiveAspects,
  type PlanetaryPositionData,
} from '../utils/aspectCalculator';

/**
 * The Sun/Moon 20%-wider-orb rule was checked against lowercase planet names
 * ("sun"/"moon"), but every live caller keys positions by the canonical
 * capitalized name ("Sun"/"Moon" — see RealAlchemizeService's planetaryAlchemy
 * table and every position-source convention in the repo). The bonus was
 * therefore dead: it never fired, and Sun/Moon aspects used the same orb
 * budget as Pluto. These tests pin the fix and its symptom.
 */

// A Sun-Mars square just past the plain 7° orb but within the 8.4° a Sun
// aspect should get (7 * 1.2 = 8.4).
const CHART: Record<string, PlanetaryPositionData> = {
  Sun: { sign: 'aries', degree: 0, exactLongitude: 0 },
  Mars: { sign: 'cancer', degree: 7.8, exactLongitude: 97.8 }, // 97.8° away, orb 7.8° past the square
  Mercury: { sign: 'aries', degree: 0, exactLongitude: 0.3 }, // near-conjunct Sun, unaffected either way
};

describe('Sun/Moon orb multiplier', () => {
  test('a Sun aspect outside the plain orb but inside the widened one is found', () => {
    const aspects = calculateComprehensiveAspects(CHART);
    const sunMars = aspects.find(
      (a) =>
        (a.planet1 === 'Sun' && a.planet2 === 'Mars') ||
        (a.planet1 === 'Mars' && a.planet2 === 'Sun'),
    );
    // Square's plain maxOrb is 7°; this pair sits at orb 7.8° — only visible
    // with the Sun's 1.2× widening (7 * 1.2 = 8.4°).
    expect(sunMars).toBeDefined();
    expect(sunMars?.type).toBe('square');
    expect(sunMars?.orb).toBeCloseTo(7.8, 5);
  });

  test('the same separation with no luminary involved gets no aspect', () => {
    const noLuminary: Record<string, PlanetaryPositionData> = {
      Mercury: { sign: 'aries', degree: 0, exactLongitude: 0 },
      Mars: { sign: 'cancer', degree: 7.8, exactLongitude: 97.8 },
    };
    const aspects = calculateComprehensiveAspects(noLuminary);
    const pair = aspects.find(
      (a) =>
        (a.planet1 === 'Mercury' && a.planet2 === 'Mars') ||
        (a.planet1 === 'Mars' && a.planet2 === 'Mercury'),
    );
    // Same 7.8° separation, no Sun/Moon → outside the plain 7° square orb.
    expect(pair).toBeUndefined();
  });

  test('strength at a given orb is higher for a luminary pair than a non-luminary pair', () => {
    // Both pairs sit at the same 2° orb past an exact square (90°); only the
    // Moon pair gets the widened orb budget, so its cosine-bell strength
    // (computed against a larger maxOrb) must be higher.
    const moonPair: Record<string, PlanetaryPositionData> = {
      Moon: { sign: 'aries', degree: 0, exactLongitude: 0 },
      Saturn: { sign: 'cancer', degree: 2, exactLongitude: 92 },
    };
    const plainPair: Record<string, PlanetaryPositionData> = {
      Venus: { sign: 'aries', degree: 0, exactLongitude: 0 },
      Saturn: { sign: 'cancer', degree: 2, exactLongitude: 92 },
    };
    const moonAspect = calculateComprehensiveAspects(moonPair).find(
      (a) => a.type === 'square',
    );
    const plainAspect = calculateComprehensiveAspects(plainPair).find(
      (a) => a.type === 'square',
    );
    expect(moonAspect).toBeDefined();
    expect(plainAspect).toBeDefined();
    expect(moonAspect!.orb).toBeCloseTo(plainAspect!.orb, 5);
    expect(moonAspect!.strength).toBeGreaterThan(plainAspect!.strength);
  });
});
