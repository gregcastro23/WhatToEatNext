import { calculateAspects as calculateAspectsCore } from '@/utils/astrology/core';
import {
  calculateEnhancedStelliumEffects,
  calculateHousePosition,
  calculateJoyEffects,
} from '@/utils/astrologyUtils';

/**
 * Element-key casing in the complete-effects chain.
 *
 * The result objects are keyed by one casing (`fire` in astrologyUtils, `Fire`
 * in astrology/core) while the element names written into them came in the
 * other casing, so the write landed on a key that doesn't exist. In the
 * astrologyUtils guard (`typeof result[k] === "number"`) that silently dropped
 * the contribution; in astrology/core it created a second key holding NaN.
 *
 * None of these functions has a production caller today
 * (calculateCompleteAstrologicalEffects has none), so fixing them changes no
 * live score. These tests pin the contract for whoever wires them in.
 *
 * Every test named "fixture reaches …" or "control: …" passes both before and
 * after the fix; it proves the fixture exercises the line under test.
 */

type Positions = Record<string, { sign: string; degree: number }>;

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const ZERO = { fire: 0, earth: 0, air: 0, water: 0 };

const longitudeOf = ({ sign, degree }: { sign: string; degree: number }) =>
  SIGNS.indexOf(sign) * 30 + degree;

/**
 * House stellium (3+ planets in one house) adds `planets.length` to the
 * house's element. `getHouseElement` returned "Fire"/"Earth"/…, so
 * `result["Fire"]` was undefined and the bonus never landed.
 *
 * With the Ascendant at 15° Aries every house straddles a sign boundary
 * (house 1 = 15° Aries – 15° Taurus). Two planets in one sign plus one in the
 * next share a house without any sign holding three, so the sign-stellium
 * branch stays silent and every point comes from the house branch alone.
 */
describe('calculateEnhancedStelliumEffects — house stellium', () => {
  const RISING = 15;

  const HOUSE_STELLIUMS: Array<{ house: number; element: keyof typeof ZERO; planets: Positions }> = [
    {
      house: 1,
      element: 'fire',
      planets: {
        Sun: { sign: 'aries', degree: 20 },
        Moon: { sign: 'aries', degree: 25 },
        Mars: { sign: 'taurus', degree: 5 },
      },
    },
    {
      house: 2,
      element: 'earth',
      planets: {
        Sun: { sign: 'taurus', degree: 20 },
        Moon: { sign: 'taurus', degree: 25 },
        Mars: { sign: 'gemini', degree: 5 },
      },
    },
    {
      house: 3,
      element: 'air',
      planets: {
        Sun: { sign: 'gemini', degree: 20 },
        Moon: { sign: 'gemini', degree: 25 },
        Mars: { sign: 'cancer', degree: 5 },
      },
    },
    {
      house: 4,
      element: 'water',
      planets: {
        Sun: { sign: 'cancer', degree: 20 },
        Moon: { sign: 'cancer', degree: 25 },
        Mars: { sign: 'leo', degree: 5 },
      },
    },
  ];

  test.each(HOUSE_STELLIUMS)(
    'fixture reaches the house branch: every planet sits in house $house and no sign holds three',
    ({ house, planets }) => {
      for (const position of Object.values(planets)) {
        expect(calculateHousePosition(RISING, longitudeOf(position))).toBe(house);
      }
      const perSign = new Map<string, number>();
      for (const { sign } of Object.values(planets)) {
        perSign.set(sign, (perSign.get(sign) ?? 0) + 1);
      }
      expect(Math.max(...perSign.values())).toBeLessThan(3);
    },
  );

  test.each(HOUSE_STELLIUMS)(
    'without a rising degree the same planets score nothing (no sign stellium) — house $house',
    ({ planets }) => {
      expect(calculateEnhancedStelliumEffects(planets)).toEqual(ZERO);
    },
  );

  test.each(HOUSE_STELLIUMS)(
    'house $house stellium adds planets.length to $element',
    ({ element, planets }) => {
      expect(calculateEnhancedStelliumEffects(planets, RISING)).toEqual({
        ...ZERO,
        [element]: Object.keys(planets).length,
      });
    },
  );

  test('the bonus scales with the planet count, not a constant 3', () => {
    const fourInHouseOne: Positions = {
      Sun: { sign: 'aries', degree: 16 },
      Moon: { sign: 'aries', degree: 28 },
      Mars: { sign: 'taurus', degree: 2 },
      Venus: { sign: 'taurus', degree: 14 },
    };
    for (const position of Object.values(fourInHouseOne)) {
      expect(calculateHousePosition(RISING, longitudeOf(position))).toBe(1);
    }
    expect(calculateEnhancedStelliumEffects(fourInHouseOne, RISING)).toEqual({
      ...ZERO,
      fire: 4,
    });
  });

  test('a rising degree above 360 is read modulo 360', () => {
    // 700 ≡ 340: 22°/28° aries and 5° taurus all fall in house 2 (earth).
    const planets: Positions = {
      Sun: { sign: 'aries', degree: 22 },
      Moon: { sign: 'aries', degree: 28 },
      Mars: { sign: 'taurus', degree: 5 },
    };
    for (const position of Object.values(planets)) {
      expect(calculateHousePosition(340, longitudeOf(position))).toBe(2);
    }
    expect(calculateEnhancedStelliumEffects(planets, 700)).toEqual({ ...ZERO, earth: 3 });
  });

  test('a non-finite rising degree yields no house, so no stellium rather than defaulting to fire', () => {
    const planets: Positions = {
      Sun: { sign: 'aries', degree: 20 },
      Moon: { sign: 'aries', degree: 25 },
      Mars: { sign: 'taurus', degree: 5 },
    };
    expect(calculateHousePosition(Number.NaN, 20)).toBeNaN();
    expect(calculateEnhancedStelliumEffects(planets, Number.NaN)).toEqual(ZERO);
  });

  test('a planet whose sign does not resolve is left out of the house count, not placed in Aries', () => {
    // Two real planets in house 1 plus one unresolvable sign at 25°. Placing the
    // unknown sign at 25° Aries would complete a house-1 stellium and score +3 fire.
    const planets: Positions = {
      Sun: { sign: 'aries', degree: 20 },
      Mars: { sign: 'taurus', degree: 5 },
      Chiron: { sign: 'not-a-sign', degree: 25 },
    };
    expect(calculateEnhancedStelliumEffects(planets, RISING)).toEqual(ZERO);
  });
});

/**
 * Mercury's element is split by degree: air in the first half of a sign, earth
 * in the second. The second half was written "Earth", so it never matched an
 * earth sign and its non-matching +1 was dropped.
 */
describe('calculateEnhancedStelliumEffects — Mercury in the second half of a sign', () => {
  test('control: a first-half Mercury is air', () => {
    // aries = fire. +3 (n), Sun+Mars match → 2·(1+1) = +4, Mercury air → +1 air.
    expect(
      calculateEnhancedStelliumEffects({
        Sun: { sign: 'aries', degree: 5 },
        Mars: { sign: 'aries', degree: 12 },
        Mercury: { sign: 'aries', degree: 10 },
      }),
    ).toEqual({ ...ZERO, fire: 7, air: 1 });
  });

  test('a second-half Mercury in a non-earth sign adds +1 earth', () => {
    expect(
      calculateEnhancedStelliumEffects({
        Sun: { sign: 'aries', degree: 5 },
        Mars: { sign: 'aries', degree: 10 },
        Mercury: { sign: 'aries', degree: 20 },
      }),
    ).toEqual({ ...ZERO, fire: 7, earth: 1 });
  });

  test('a second-half Mercury in an earth sign counts as matching', () => {
    // taurus = earth. +3 (n), Mercury matches → 1·(1+0) = +1, Sun fire +1, Moon water +1.
    expect(
      calculateEnhancedStelliumEffects({
        Sun: { sign: 'taurus', degree: 5 },
        Moon: { sign: 'taurus', degree: 10 },
        Mercury: { sign: 'taurus', degree: 20 },
      }),
    ).toEqual({ fire: 1, earth: 4, air: 0, water: 1 });
  });
});

/**
 * astrology/core's calculateAspects keys its result "Fire"/"Earth"/… but
 * lowercased the element before writing, producing `{Fire: 0, …, fire: NaN}`.
 * Its Ascendant special case compared the ELEMENT to "ascendant", so it never
 * fired.
 */
describe('astrology/core calculateAspects — elemental effects', () => {
  test('a conjunction adds to the sign element under the result’s own keys', async () => {
    // 2° orb of 8 → strength 0.75, significance 1.0, applied to both planets.
    const { aspects, elementalEffects } = await calculateAspectsCore({
      Sun: { sign: 'aries', degree: 10 },
      Mars: { sign: 'aries', degree: 12 },
    });
    expect(aspects.map((a) => a.type)).toEqual(['conjunction']);
    expect(elementalEffects).toEqual({ Fire: 1.5, Earth: 0, Air: 0, Water: 0 });
  });

  test('an exact square not involving the Ascendant uses the square significance (0.8)', async () => {
    const { elementalEffects } = await calculateAspectsCore({
      Sun: { sign: 'aries', degree: 10 },
      Moon: { sign: 'cancer', degree: 10 },
    });
    expect(elementalEffects).toEqual({ Fire: 0.8, Earth: 0, Air: 0, Water: 0.8 });
  });

  test('a square to the Ascendant uses multiplier 1', async () => {
    const { elementalEffects } = await calculateAspectsCore({
      Sun: { sign: 'aries', degree: 10 },
      Ascendant: { sign: 'cancer', degree: 10 },
    });
    expect(elementalEffects).toEqual({ Fire: 1, Earth: 0, Air: 0, Water: 1 });
  });

  // Most keys of its aspect table carried a leading underscore, so it emitted
  // types such as "_trine" that are not members of AspectType.
  test.each([
    ['conjunction', { sign: 'aries', degree: 12 }],
    ['semi-sextile', { sign: 'taurus', degree: 10 }],
    ['semisquare', { sign: 'taurus', degree: 25 }],
    ['sextile', { sign: 'gemini', degree: 10 }],
    ['quintile', { sign: 'gemini', degree: 22 }],
    ['square', { sign: 'cancer', degree: 10 }],
    ['trine', { sign: 'leo', degree: 10 }],
    ['sesquisquare', { sign: 'leo', degree: 25 }],
    ['quincunx', { sign: 'virgo', degree: 10 }],
    ['opposition', { sign: 'libra', degree: 10 }],
  ])('emits the AspectType name %s', async (type, partner) => {
    const { aspects } = await calculateAspectsCore({
      Sun: { sign: 'aries', degree: 10 },
      Moon: partner,
    });
    expect(aspects.map((a) => a.type)).toEqual([type]);
  });
});

/**
 * calculateJoyEffects looked the sign up case-sensitively in a list holding
 * "Libra" and "Scorpio", so a lowercase libra/scorpio planet (and any
 * capitalized sign other than those two) got index -1 and a wrong house.
 * A planet in its joy house adds +2 to that house's element.
 */
describe('calculateJoyEffects — sign lookup', () => {
  test('control: Mars in aries in house 6 (its joy) adds +2 earth', () => {
    // 10° aries, rising 210 → relative 160° → house 6.
    expect(calculateHousePosition(210, 10)).toBe(6);
    expect(calculateJoyEffects({ Mars: { sign: 'aries', degree: 10 } }, 210)).toEqual({
      ...ZERO,
      earth: 2,
    });
  });

  test('Venus in libra in house 5 (its joy) adds +2 fire', () => {
    // 10° libra = 190°, rising 60 → relative 130° → house 5.
    expect(calculateHousePosition(60, 190)).toBe(5);
    expect(calculateJoyEffects({ Venus: { sign: 'libra', degree: 10 } }, 60)).toEqual({
      ...ZERO,
      fire: 2,
    });
  });

  test('Mars in scorpio in house 6 (its joy) adds +2 earth', () => {
    // 10° scorpio = 220°, rising 60 → relative 160° → house 6.
    expect(calculateHousePosition(60, 220)).toBe(6);
    expect(calculateJoyEffects({ Mars: { sign: 'scorpio', degree: 10 } }, 60)).toEqual({
      ...ZERO,
      earth: 2,
    });
  });

  test('the sign lookup is case-insensitive', () => {
    // 10° Aries, rising 0 → house 1, Mercury's joy.
    expect(calculateJoyEffects({ Mercury: { sign: 'Aries', degree: 10 } }, 0)).toEqual({
      ...ZERO,
      fire: 2,
    });
  });

  test('a planet whose sign does not resolve contributes nothing', () => {
    // Index -1 would put it at -20°, which with rising 340 is house 1 — Mercury's joy.
    expect(calculateJoyEffects({ Mercury: { sign: 'not-a-sign', degree: 10 } }, 340)).toEqual(ZERO);
  });
});
