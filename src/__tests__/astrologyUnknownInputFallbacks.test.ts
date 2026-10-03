import {
  calculateAspects as calculateAspectsCore,
  calculateDominantElement,
  calculateElementalProfile,
  getZodiacElement as getZodiacElementCore,
} from '@/utils/astrology/core';
import {
  calculateAspects,
  calculateEnhancedStelliumEffects,
  calculateHousePosition,
  getZodiacElement,
} from '@/utils/astrologyUtils';
import { HOUSE_STRENGTH, calculateHouseEffect } from '@/utils/houseEffects';

/**
 * Unknown input has no element and no house; it must not be scored as one.
 *
 * Each helper here used to answer an input it didn't recognise with a real
 * value: an unrecognised sign was "Fire", an unrecognised planet was fire, a
 * missing sign was Aries, and a rising degree above 360 produced a negative
 * house. Every one of those is a fabricated reading. They now return
 * undefined (or skip the input), so the input contributes nothing.
 *
 * Tests named "control: …" pass both before and after the fix; they prove the
 * fixture reaches the line under test.
 */

const ZERO = { fire: 0, earth: 0, air: 0, water: 0 };

describe('getZodiacElement — unknown sign', () => {
  test.each([
    ['astrologyUtils', getZodiacElement],
    ['astrology/core', getZodiacElementCore],
  ])('%s: control: known signs resolve case-insensitively', (_name, lookup) => {
    expect(lookup('scorpio')).toBe('Water');
    expect(lookup('Scorpio')).toBe('Water');
  });

  test.each([
    ['astrologyUtils', getZodiacElement],
    ['astrology/core', getZodiacElementCore],
  ])('%s: an unrecognised sign has no element', (_name, lookup) => {
    expect(lookup('not-a-sign')).toBeUndefined();
    expect(lookup('')).toBeUndefined();
  });
});

describe('calculateEnhancedStelliumEffects — unknown sign or planet', () => {
  test('three planets in an unrecognised sign form no stellium', () => {
    expect(
      calculateEnhancedStelliumEffects({
        Sun: { sign: 'not-a-sign', degree: 5 },
        Moon: { sign: 'not-a-sign', degree: 10 },
        Mars: { sign: 'not-a-sign', degree: 20 },
      }),
    ).toEqual(ZERO);
  });

  test('control: a known third planet adds its own element', () => {
    // aries = fire. +3 (n), Sun+Mars match → 2·(1+1) = +4, Jupiter air → +1 air.
    expect(
      calculateEnhancedStelliumEffects({
        Sun: { sign: 'aries', degree: 5 },
        Mars: { sign: 'aries', degree: 10 },
        Jupiter: { sign: 'aries', degree: 20 },
      }),
    ).toEqual({ ...ZERO, fire: 7, air: 1 });
  });

  test('an unrecognised body counts toward n but has no element', () => {
    // Chiron is a body in aries, so the stellium has n = 3 (+3). It has no
    // planet element, so only Sun+Mars match (+4) and it adds nothing else.
    expect(
      calculateEnhancedStelliumEffects({
        Sun: { sign: 'aries', degree: 5 },
        Mars: { sign: 'aries', degree: 10 },
        Chiron: { sign: 'aries', degree: 20 },
      }),
    ).toEqual({ ...ZERO, fire: 7 });
  });
});

describe('calculateHousePosition — any rising degree', () => {
  test('always returns a house in 1–12', () => {
    for (let rising = -720; rising <= 720; rising += 7.5) {
      for (let planet = -30; planet < 390; planet += 7) {
        const house = calculateHousePosition(rising, planet);
        expect(house).toBeGreaterThanOrEqual(1);
        expect(house).toBeLessThanOrEqual(12);
      }
    }
  });

  test('a rising degree is read modulo 360', () => {
    expect(calculateHousePosition(700, 22)).toBe(calculateHousePosition(340, 22));
    expect(calculateHousePosition(-20, 22)).toBe(calculateHousePosition(340, 22));
    expect(calculateHousePosition(340, 22)).toBe(2);
  });
});

describe('houseEffects calculateHouseEffect — sign element', () => {
  // House 1 is fire / Angular, ruled by Mars. Venus is not its ruler, so the
  // sign element only enters through the synergy and house-1 bonuses.
  const houseOnly = { Fire: HOUSE_STRENGTH.Angular, Earth: 0, Air: 0, Water: 0 };

  test('control: aries in house 1 gets the synergy and house-1 bonuses', () => {
    expect(calculateHouseEffect('Venus', 1, 'aries')).toEqual({
      ...houseOnly,
      Fire: HOUSE_STRENGTH.Angular + 0.5 + 1.0,
    });
  });

  test('the sign lookup is case-insensitive', () => {
    expect(calculateHouseEffect('Venus', 1, 'Taurus')).toEqual(
      calculateHouseEffect('Venus', 1, 'taurus'),
    );
    expect(calculateHouseEffect('Venus', 1, 'taurus')).toEqual({ ...houseOnly, Earth: 1.0 });
  });

  test('an unrecognised sign adds only the house’s own effect', () => {
    expect(calculateHouseEffect('Venus', 1, 'not-a-sign')).toEqual(houseOnly);
  });
});

describe('astrology/core calculateElementalProfile — unknown or missing sign', () => {
  test('a planet with an unrecognised or missing sign is left out of the profile', async () => {
    // Moon (weight 3) is the only resolvable planet, so the profile is all water.
    // Before: "not-a-sign" was Fire and a missing sign was read as Aries.
    const profile = await calculateElementalProfile(
      {
        planetaryPositions: {
          Moon: { sign: 'cancer', degree: 10 },
          Sun: { sign: 'not-a-sign', degree: 10 },
          Mars: { degree: 10 },
        },
      },
      {},
    );
    expect(profile).toEqual({ Fire: 0, Earth: 0, Air: 0, Water: 1 });
  });
});

/**
 * An unrecognised sign has no longitude. Both calculateAspects copies placed it
 * at sign index -1, i.e. 30° before Aries, and emitted aspects to that point:
 * 12° of an unknown sign sat at -18°, a 28° gap from 10° Aries — a semi-sextile.
 * astrologyUtils' copy is live (useChartData, getCurrentAstrologicalState), so
 * the phantom reached the displayed aspect list.
 */
describe.each([
  ['astrologyUtils', async (p: Record<string, { sign: string; degree: number }>) => calculateAspects(p)],
  ['astrology/core', calculateAspectsCore],
])('%s calculateAspects — unknown sign', (_name, aspectsOf) => {
  test('control: two planets 2° apart in aries are a conjunction', async () => {
    const { aspects } = await aspectsOf({
      Sun: { sign: 'aries', degree: 10 },
      Mars: { sign: 'aries', degree: 12 },
    });
    expect(aspects.map((a) => a.type)).toEqual(['conjunction']);
  });

  test('a planet in an unrecognised sign forms no aspect and adds no element', async () => {
    const { aspects, elementalEffects } = await aspectsOf({
      Sun: { sign: 'aries', degree: 10 },
      Mars: { sign: 'not-a-sign', degree: 12 },
    });
    expect(aspects).toEqual([]);
    expect(Object.values(elementalEffects).every((v) => v === 0)).toBe(true);
  });

  test('the other pairs in the chart are kept', async () => {
    const { aspects } = await aspectsOf({
      Sun: { sign: 'aries', degree: 10 },
      Moon: { sign: 'leo', degree: 10 },
      Mars: { sign: 'not-a-sign', degree: 12 },
    });
    expect(aspects.map((a) => `${a.planet1}-${a.planet2}:${a.type}`)).toEqual(['Sun-Moon:trine']);
  });
});

describe('astrology/core calculateDominantElement — no data', () => {
  test('control: a lone Moon in cancer is water-dominant', async () => {
    const dominant = await calculateDominantElement(
      { planetaryPositions: { Moon: { sign: 'cancer', degree: 10 } } },
      {},
    );
    expect(dominant).toBe('Water');
  });

  test('with no resolvable positions there is no dominant element (not Fire)', async () => {
    expect(await calculateDominantElement({ planetaryPositions: {} }, {})).toBeUndefined();
    expect(await calculateDominantElement({}, {})).toBeUndefined();
    expect(
      await calculateDominantElement(
        { planetaryPositions: { Sun: { sign: 'not-a-sign', degree: 10 } } },
        {},
      ),
    ).toBeUndefined();
  });
});
