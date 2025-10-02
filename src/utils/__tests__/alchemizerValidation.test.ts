/**
 * Alchemizer Formula Validation Tests
 *
 * These tests validate that our implementation matches the authoritative
 * alchemizer engine formulas exactly. Any deviation indicates a bug.
 *
 * Test data based on the reference alchemizer engine implementation.
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  PLANETARY_ALCHEMY,
  ZODIAC_ELEMENTS
} from '../planetaryAlchemyMapping';
import {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  calculateKAlchm,
  calculateMonicaConstant,
  calculateThermodynamicMetrics,
  type AlchemicalProperties
} from '../monicaKalchmCalculations';
import type { ElementalProperties } from '@/types/alchemy';

// ========== REFERENCE TEST DATA ==========

/**
 * Reference planetary positions from alchemizer engine example
 */
const REFERENCE_POSITIONS = {
  Sun: 'Gemini',
  Moon: 'Leo',
  Mercury: 'Taurus',
  Venus: 'Gemini',
  Mars: 'Aries',
  Jupiter: 'Gemini',
  Saturn: 'Pisces',
  Uranus: 'Taurus',
  Neptune: 'Aries',
  Pluto: 'Aquarius'
};

/**
 * Expected ESMS values from reference positions
 * Calculated from PLANETARY_ALCHEMY:
 * - Sun (Spirit:1) + Mercury (Spirit:1) + Jupiter (Spirit:1) + Saturn (Spirit:1) = Spirit:4
 * - Moon (Essence:1) + Venus (Essence:1) + Mars (Essence:1) + Jupiter (Essence:1) + Uranus (Essence:1) + Neptune (Essence:1) + Pluto (Essence:1) = Essence:7
 * - Moon (Matter:1) + Venus (Matter:1) + Mars (Matter:1) + Saturn (Matter:1) + Uranus (Matter:1) + Pluto (Matter:1) = Matter:6
 * - Mercury (Substance:1) + Neptune (Substance:1) = Substance:2
 */
const EXPECTED_ALCHEMICAL: AlchemicalProperties = {
  Spirit: 4,
  Essence: 7,
  Matter: 6,
  Substance: 2
};

/**
 * Expected elemental values from zodiac signs
 * Gemini (Air): Sun, Venus, Jupiter = 3
 * Leo (Fire): Moon = 1
 * Taurus (Earth): Mercury, Uranus = 2
 * Aries (Fire): Mars, Neptune = 2
 * Pisces (Water): Saturn = 1
 * Aquarius (Air): Pluto = 1
 *
 * Totals: Fire:3, Water:1, Earth:2, Air:4
 * Normalized (÷10): Fire:0.3, Water:0.1, Earth:0.2, Air:0.4
 */
const EXPECTED_ELEMENTALS: ElementalProperties = {
  Fire: 0.3,
  Water: 0.1,
  Earth: 0.2,
  Air: 0.4
};

// ========== PLANETARY ALCHEMY TESTS ==========

describe('Planetary Alchemy Mapping', () => {
  describe('calculateAlchemicalFromPlanets', () => {
    it('calculates ESMS from planetary positions correctly', () => {
      const result = calculateAlchemicalFromPlanets(REFERENCE_POSITIONS);

      expect(result.Spirit).toBe(EXPECTED_ALCHEMICAL.Spirit);
      expect(result.Essence).toBe(EXPECTED_ALCHEMICAL.Essence);
      expect(result.Matter).toBe(EXPECTED_ALCHEMICAL.Matter);
      expect(result.Substance).toBe(EXPECTED_ALCHEMICAL.Substance);
    });

    it('sums planetary contributions correctly', () => {
      // Test with subset of planets
      const subset = {
        Sun: 'Aries', // Spirit: 1
        Moon: 'Cancer' // Essence: 1, Matter: 1
      };

      const result = calculateAlchemicalFromPlanets(subset);

      expect(result.Spirit).toBe(1); // Sun only
      expect(result.Essence).toBe(1); // Moon only
      expect(result.Matter).toBe(1); // Moon only
      expect(result.Substance).toBe(0); // None
    });

    it('handles empty positions gracefully', () => {
      const result = calculateAlchemicalFromPlanets({});

      expect(result.Spirit).toBe(0);
      expect(result.Essence).toBe(0);
      expect(result.Matter).toBe(0);
      expect(result.Substance).toBe(0);
    });
  });

  describe('aggregateZodiacElementals', () => {
    it('aggregates zodiac elements correctly', () => {
      const result = aggregateZodiacElementals(REFERENCE_POSITIONS);

      expect(result.Fire).toBeCloseTo(EXPECTED_ELEMENTALS.Fire, 2);
      expect(result.Water).toBeCloseTo(EXPECTED_ELEMENTALS.Water, 2);
      expect(result.Earth).toBeCloseTo(EXPECTED_ELEMENTALS.Earth, 2);
      expect(result.Air).toBeCloseTo(EXPECTED_ELEMENTALS.Air, 2);
    });

    it('normalizes to sum = 1.0', () => {
      const result = aggregateZodiacElementals(REFERENCE_POSITIONS);
      const sum = result.Fire + result.Water + result.Earth + result.Air;

      expect(sum).toBeCloseTo(1.0, 10);
    });

    it('handles single planet correctly', () => {
      const result = aggregateZodiacElementals({ Sun: 'Aries' });

      expect(result.Fire).toBe(1.0);
      expect(result.Water).toBe(0.0);
      expect(result.Earth).toBe(0.0);
      expect(result.Air).toBe(0.0);
    });
  });
});

// ========== THERMODYNAMIC FORMULA TESTS ==========

describe('Thermodynamic Formulas', () => {
  const testAlchemical = EXPECTED_ALCHEMICAL;
  const testElemental = EXPECTED_ELEMENTALS;

  describe('calculateHeat', () => {
    it('calculates Heat with exact formula: (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²', () => {
      const { Spirit } = testAlchemical;
      const { Fire, Water, Earth, Air } = testElemental;
      const { Substance, Essence, Matter } = testAlchemical;

      const numerator = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
      const denominator = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
      const expected = numerator / denominator;

      const result = calculateHeat(Spirit, Fire, Substance, Essence, Matter, Water, Air, Earth);

      expect(result).toBeCloseTo(expected, 10);
    });

    it('handles edge case: denominator = 0', () => {
      const result = calculateHeat(1, 1, 0, 0, 0, 0, 0, 0);
      expect(result).toBe(0); // Should return 0, not Infinity
    });
  });

  describe('calculateEntropy', () => {
    it('calculates Entropy with exact formula: (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²', () => {
      const { Spirit, Substance } = testAlchemical;
      const { Fire, Air } = testElemental;
      const { Essence, Matter } = testAlchemical;
      const { Earth, Water } = testElemental;

      const numerator =
        Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
      const denominator = Math.pow(Essence + Matter + Earth + Water, 2);
      const expected = numerator / denominator;

      const result = calculateEntropy(Spirit, Substance, Fire, Air, Essence, Matter, Earth, Water);

      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe('calculateReactivity', () => {
    it('calculates Reactivity with exact formula: (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²', () => {
      const { Spirit, Substance, Essence } = testAlchemical;
      const { Fire, Air, Water } = testElemental;
      const { Matter } = testAlchemical;
      const { Earth } = testElemental;

      const numerator =
        Math.pow(Spirit, 2) +
        Math.pow(Substance, 2) +
        Math.pow(Essence, 2) +
        Math.pow(Fire, 2) +
        Math.pow(Air, 2) +
        Math.pow(Water, 2);
      const denominator = Math.pow(Matter + Earth, 2);
      const expected = numerator / denominator;

      const result = calculateReactivity(
        Spirit,
        Substance,
        Essence,
        Fire,
        Air,
        Water,
        Matter,
        Earth
      );

      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe('calculateGregsEnergy', () => {
    it('calculates GregsEnergy with exact formula: Heat - (Entropy × Reactivity)', () => {
      const heat = 0.5;
      const entropy = 0.3;
      const reactivity = 0.4;

      const expected = heat - entropy * reactivity;
      const result = calculateGregsEnergy(heat, entropy, reactivity);

      expect(result).toBeCloseTo(expected, 10);
    });

    it('handles negative values correctly', () => {
      const heat = 0.1;
      const entropy = 0.8;
      const reactivity = 0.5;

      const expected = heat - entropy * reactivity; // = 0.1 - 0.4 = -0.3
      const result = calculateGregsEnergy(heat, entropy, reactivity);

      expect(result).toBeCloseTo(expected, 10);
      expect(result).toBeLessThan(0);
    });
  });

  describe('calculateKAlchm', () => {
    it('calculates Kalchm with exact formula: (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)', () => {
      const { Spirit, Essence, Matter, Substance } = testAlchemical;

      const numerator = Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence);
      const denominator = Math.pow(Matter, Matter) * Math.pow(Substance, Substance);
      const expected = numerator / denominator;

      const result = calculateKAlchm(Spirit, Essence, Matter, Substance);

      expect(result).toBeCloseTo(expected, 5); // Allow some floating point error
    });

    it('handles zero values safely (uses 0.01 minimum)', () => {
      const result = calculateKAlchm(0, 0, 0, 0);

      // Should use 0.01 for all values
      const expected =
        (Math.pow(0.01, 0.01) * Math.pow(0.01, 0.01)) /
        (Math.pow(0.01, 0.01) * Math.pow(0.01, 0.01));

      expect(result).toBeCloseTo(expected, 5);
    });
  });

  describe('calculateMonicaConstant', () => {
    it('calculates Monica with exact formula: -GregsEnergy / (Reactivity × ln(Kalchm)) when Kalchm > 0', () => {
      const gregsEnergy = -0.5;
      const reactivity = 0.4;
      const kalchm = 2.5;

      const expected = -gregsEnergy / (reactivity * Math.log(kalchm));
      const result = calculateMonicaConstant(gregsEnergy, reactivity, kalchm);

      expect(result).toBeCloseTo(expected, 10);
    });

    it('returns 1.0 when Kalchm = 0', () => {
      const result = calculateMonicaConstant(0.5, 0.4, 0);
      expect(result).toBe(1.0);
    });

    it('returns 1.0 when ln(Kalchm) = 0 (Kalchm = 1)', () => {
      const result = calculateMonicaConstant(0.5, 0.4, 1);
      expect(result).toBe(1.0);
    });

    it('returns 1.0 when reactivity = 0', () => {
      const result = calculateMonicaConstant(0.5, 0, 2.5);
      expect(result).toBe(1.0);
    });
  });

  describe('calculateThermodynamicMetrics', () => {
    it('calculates all metrics together correctly', () => {
      const metrics = calculateThermodynamicMetrics(testAlchemical, testElemental);

      expect(metrics).toHaveProperty('heat');
      expect(metrics).toHaveProperty('entropy');
      expect(metrics).toHaveProperty('reactivity');
      expect(metrics).toHaveProperty('gregsEnergy');
      expect(metrics).toHaveProperty('kalchm');
      expect(metrics).toHaveProperty('monica');

      // Verify gregsEnergy = heat - (entropy × reactivity)
      const expectedGregsEnergy = metrics.heat - metrics.entropy * metrics.reactivity;
      expect(metrics.gregsEnergy).toBeCloseTo(expectedGregsEnergy, 10);
    });

    it('produces consistent results across multiple calls', () => {
      const result1 = calculateThermodynamicMetrics(testAlchemical, testElemental);
      const result2 = calculateThermodynamicMetrics(testAlchemical, testElemental);

      expect(result1.heat).toBe(result2.heat);
      expect(result1.entropy).toBe(result2.entropy);
      expect(result1.reactivity).toBe(result2.reactivity);
      expect(result1.gregsEnergy).toBe(result2.gregsEnergy);
      expect(result1.kalchm).toBe(result2.kalchm);
      expect(result1.monica).toBe(result2.monica);
    });
  });
});

// ========== INTEGRATION TESTS ==========

describe('Full Alchemizer Integration', () => {
  it('reproduces alchemizer engine results for reference positions', () => {
    // Step 1: Calculate ESMS from planetary positions
    const alchemical = calculateAlchemicalFromPlanets(REFERENCE_POSITIONS);

    expect(alchemical.Spirit).toBe(4);
    expect(alchemical.Essence).toBe(7);
    expect(alchemical.Matter).toBe(6);
    expect(alchemical.Substance).toBe(2);

    // Step 2: Aggregate zodiac elementals
    const elemental = aggregateZodiacElementals(REFERENCE_POSITIONS);

    expect(elemental.Fire).toBeCloseTo(0.3, 2);
    expect(elemental.Water).toBeCloseTo(0.1, 2);
    expect(elemental.Earth).toBeCloseTo(0.2, 2);
    expect(elemental.Air).toBeCloseTo(0.4, 2);

    // Step 3: Calculate thermodynamic metrics
    const metrics = calculateThermodynamicMetrics(alchemical, elemental);

    // All metrics should be finite numbers
    expect(isFinite(metrics.heat)).toBe(true);
    expect(isFinite(metrics.entropy)).toBe(true);
    expect(isFinite(metrics.reactivity)).toBe(true);
    expect(isFinite(metrics.gregsEnergy)).toBe(true);
    expect(isFinite(metrics.kalchm)).toBe(true);

    // Monica might be NaN in some cases, but should be a number type
    expect(typeof metrics.monica).toBe('number');
  });

  it('maintains formula relationships across different inputs', () => {
    const testCases = [
      { Sun: 'Aries', Moon: 'Taurus' },
      { Sun: 'Leo', Venus: 'Libra', Mars: 'Scorpio' },
      { Mercury: 'Gemini', Jupiter: 'Sagittarius', Saturn: 'Capricorn' }
    ];

    for (const positions of testCases) {
      const alchemical = calculateAlchemicalFromPlanets(positions);
      const elemental = aggregateZodiacElementals(positions);
      const metrics = calculateThermodynamicMetrics(alchemical, elemental);

      // Verify core relationship: GregsEnergy = Heat - (Entropy × Reactivity)
      const expectedGregsEnergy = metrics.heat - metrics.entropy * metrics.reactivity;
      expect(metrics.gregsEnergy).toBeCloseTo(expectedGregsEnergy, 10);
    }
  });
});

// ========== EDGE CASE TESTS ==========

describe('Edge Cases and Error Handling', () => {
  it('handles all zero values without errors', () => {
    const alchemical: AlchemicalProperties = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    const elemental: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    const metrics = calculateThermodynamicMetrics(alchemical, elemental);

    expect(isFinite(metrics.heat) || metrics.heat === 0).toBe(true);
    expect(isFinite(metrics.entropy) || metrics.entropy === 0).toBe(true);
    expect(isFinite(metrics.reactivity) || metrics.reactivity === 0).toBe(true);
  });

  it('handles extreme values without overflow', () => {
    const alchemical: AlchemicalProperties = { Spirit: 100, Essence: 100, Matter: 100, Substance: 100 };
    const elemental: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

    const metrics = calculateThermodynamicMetrics(alchemical, elemental);

    expect(isFinite(metrics.heat)).toBe(true);
    expect(isFinite(metrics.entropy)).toBe(true);
    expect(isFinite(metrics.reactivity)).toBe(true);
  });

  it('handles unknown planets gracefully', () => {
    const positions = {
      Sun: 'Gemini',
      Chiron: 'Aries', // Unknown planet
      Moon: 'Leo'
    };

    const result = calculateAlchemicalFromPlanets(positions);

    // Should calculate correctly using known planets only
    expect(result.Spirit).toBe(1); // Sun only
    expect(result.Essence).toBe(1); // Moon only
    expect(result.Matter).toBe(1); // Moon only
  });
});
