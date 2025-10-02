// src/utils/__tests__/quantityScaling.test.ts
// Unit tests for quantity-to-property scaling engine
// Created: 2025-01-24

import {
    batchScaleIngredients,
    calculateQuantityFactor,
    createQuantityScaledProperties,
    deriveESMSFromElemental,
    scaleAlchemicalProperties,
    scaleElementalProperties,
    validateScalingIntegrity
} from '../quantityScaling';

import { AlchemicalProperties, ElementalProperties, ThermodynamicMetrics } from '@/types/alchemy';

describe('Quantity Scaling Engine', () => {
  describe('calculateQuantityFactor', () => {
    it('should calculate correct factor for common amounts', () => {
      // Small amounts
      expect(calculateQuantityFactor(1, 'tsp')).toBeCloseTo(0.37, 2);
      expect(calculateQuantityFactor(5, 'g')).toBeCloseTo(0.46, 2);

      // Medium amounts
      expect(calculateQuantityFactor(100, 'g')).toBeCloseTo(1.0, 2);
      expect(calculateQuantityFactor(1, 'cup')).toBeCloseTo(1.18, 2);

      // Large amounts
      expect(calculateQuantityFactor(500, 'g')).toBeCloseTo(1.47, 2);
      expect(calculateQuantityFactor(1000, 'g')).toBeCloseTo(1.65, 2);
    });

    it('should handle different units correctly', () => {
      expect(calculateQuantityFactor(3, 'oz')).toBeCloseTo(calculateQuantityFactor(85, 'g'), 2);
      expect(calculateQuantityFactor(1, 'kg')).toBeCloseTo(calculateQuantityFactor(1000, 'g'), 2);
    });

    it('should clamp factors within bounds', () => {
      expect(calculateQuantityFactor(0.1, 'g')).toBe(0.1); // Minimum bound
      expect(calculateQuantityFactor(10000, 'g')).toBeLessThanOrEqual(2.0); // Maximum bound
    });
  });

  describe('scaleElementalProperties', () => {
    const baseElemental: ElementalProperties = {
      Fire: 0.3,
      Water: 0.4,
      Earth: 0.2,
      Air: 0.1
};

    it('should scale properties with "like reinforces like" principle', () => {
      const scaled = scaleElementalProperties(baseElemental, 1.2);

      // Water (dominant) should get enhanced scaling
      expect(scaled.Water).toBeGreaterThan(baseElemental.Water);
      // Other elements should also increase but less dramatically
      expect(scaled.Fire).toBeGreaterThan(baseElemental.Fire);
      expect(scaled.Earth).toBeGreaterThan(baseElemental.Earth);
      expect(scaled.Air).toBeGreaterThan(baseElemental.Air);
    });

    it('should maintain harmony (sum ≈ 1.0)', () => {
      const scaled = scaleElementalProperties(baseElemental, 1.5);
      const sum = scaled.Fire + scaled.Water + scaled.Earth + scaled.Air;
      expect(sum).toBeCloseTo(1.0, 2);
    });

    it('should handle neutral scaling (factor = 1)', () => {
      const scaled = scaleElementalProperties(baseElemental, 1.0);
      expect(scaled.Fire).toBe(baseElemental.Fire);
      expect(scaled.Water).toBe(baseElemental.Water);
      expect(scaled.Earth).toBe(baseElemental.Earth);
      expect(scaled.Air).toBe(baseElemental.Air);
    });
  });

  describe('deriveESMSFromElemental', () => {
    it('should correctly derive ESMS from elemental properties', () => {
      const elemental: ElementalProperties = {
        Fire: 0.4,
        Water: 0.3,
        Earth: 0.2,
        Air: 0.1
};

      const esms = deriveESMSFromElemental(elemental);

      expect(esms.Spirit).toBe((0.4 + 0.1) / 2); // (Fire + Air) / 2
      expect(esms.Essence).toBe((0.3 + 0.2) / 2); // (Water + Earth) / 2
      expect(esms.Matter).toBe(0.3); // Water
      expect(esms.Substance).toBe(0.2); // Earth
    });

    it('should maintain alchemical harmony', () => {
      const elemental: ElementalProperties = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
};

      const esms = deriveESMSFromElemental(elemental);

      expect(esms.Spirit).toBe(esms.Essence); // Should be balanced
      expect(esms.Matter).toBe(esms.Substance);
    });
  });

  describe('scaleAlchemicalProperties', () => {
    const baseAlchemical: AlchemicalProperties = {
      Spirit: 0.3,
      Essence: 0.4,
      Matter: 0.2,
      Substance: 0.1
};

    it('should scale all properties by factor', () => {
      const scaled = scaleAlchemicalProperties(baseAlchemical, 1.5);

      expect(scaled.Spirit).toBe(baseAlchemical.Spirit * 1.5);
      expect(scaled.Essence).toBe(baseAlchemical.Essence * 1.5);
      expect(scaled.Matter).toBe(baseAlchemical.Matter * 1.5);
      expect(scaled.Substance).toBe(baseAlchemical.Substance * 1.5);
    });

    it('should apply kinetics modulation when thermodynamics provided', () => {
      const kinetics: ThermodynamicMetrics = {
        heat: 0.8,
        entropy: 0.2,
        reactivity: 0.6,
        gregsEnergy: 0.9,
        kalchm: 1.2,
        monica: 0.7
};

      const scaled = scaleAlchemicalProperties(baseAlchemical, 1.2, kinetics);

      // Spirit should increase due to high heat
      expect(scaled.Spirit).toBeGreaterThan(baseAlchemical.Spirit * 1.2);
      // Substance should decrease due to high energy
      expect(scaled.Substance).toBeLessThan(baseAlchemical.Substance * 1.2);
    });

    it('should ensure non-negative values', () => {
      const baseWithZeros: AlchemicalProperties = {
        Spirit: 0,
        Essence: 0,
        Matter: 0,
        Substance: 0
};

      const scaled = scaleAlchemicalProperties(baseWithZeros, 2.0);
      expect(scaled.Spirit).toBe(0);
      expect(scaled.Essence).toBe(0);
      expect(scaled.Matter).toBe(0);
      expect(scaled.Substance).toBe(0);
    });
  });

  describe('createQuantityScaledProperties', () => {
    const baseElemental: ElementalProperties = {
      Fire: 0.3,
      Water: 0.4,
      Earth: 0.2,
      Air: 0.1
};

    it('should create complete scaled properties object', () => {
      const result = createQuantityScaledProperties(baseElemental, 100, 'g');

      expect(result).toHaveProperty('base');
      expect(result).toHaveProperty('scaled');
      expect(result.quantity).toBe(100);
      expect(result.unit).toBe('g');
      expect(result.factor).toBeCloseTo(1.0, 1);
      expect(result.kineticsImpact).toBeUndefined(); // No kinetics provided
    });

    it('should include kinetics impact when thermodynamics provided', () => {
      const kinetics: ThermodynamicMetrics = {
        heat: 0.5,
        entropy: 0.3,
        reactivity: 0.7,
        gregsEnergy: 0.8,
        kalchm: 1.1,
        monica: 0.6
};

      const result = createQuantityScaledProperties(baseElemental, 200, 'g', kinetics);

      expect(result.kineticsImpact).toBeDefined();
      expect(result.kineticsImpact!.forceAdjustment).toBeDefined();
      expect(result.kineticsImpact!.thermalShift).toBeDefined();
    });
  });

  describe('batchScaleIngredients', () => {
    const ingredients = [
      {
        baseElemental: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
        quantity: 50,
        unit: 'g'
},
      {
        baseElemental: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
        quantity: 150,
        unit: 'g'
}
    ];

    it('should scale multiple ingredients correctly', () => {
      const results = batchScaleIngredients(ingredients);

      expect(results).toHaveLength(2);
      expect(results[0].quantity).toBe(50);
      expect(results[1].quantity).toBe(150);
      expect(results[0].scaled.Water).toBeGreaterThan(ingredients[0].baseElemental.Water);
      expect(results[1].scaled.Water).toBeGreaterThan(ingredients[1].baseElemental.Water);
    });
  });

  describe('validateScalingIntegrity', () => {
    it('should validate correct scaling properties', () => {
      const validScaled = createQuantityScaledProperties(
        { Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1 },
        100,
        'g'
      );

      const validation = validateScalingIntegrity(validScaled);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect out-of-bounds elemental values', () => {
      const invalidScaled = {
        ...createQuantityScaledProperties(
          { Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1 },
          100,
          'g'
        ),
        scaled: { Fire: 1.5, Water: 0.4, Earth: 0.2, Air: -0.1 } // Invalid values
      };

      const validation = validateScalingIntegrity(invalidScaled);
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Fire property out of bounds: 1.5'),
      expect(validation.issues).toContain('Air property out of bounds: -0.1');
    });

    it('should detect harmony violations', () => {
      const invalidScaled = {
        ...createQuantityScaledProperties(
          { Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1 },
          100,
          'g'
        ),
        scaled: { Fire: 0.8, Water: 0.7, Earth: 0.6, Air: 0.5 } // Sum = 2.6
      };

      const validation = validateScalingIntegrity(invalidScaled);
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('sum'))).toBe(true);
    });

    it('should detect extreme kinetics values', () => {
      const invalidScaled = {
        ...createQuantityScaledProperties(
          { Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1 },
          100,
          'g'
        ),
        kineticsImpact: { forceAdjustment: 50, thermalShift: -20 } // Extreme values
      };

      const validation = validateScalingIntegrity(invalidScaled);
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('extreme'))).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should demonstrate end-to-end quantity scaling workflow', () => {
      // Simulate garlic scaling from 1 clove to 3 cloves
      const garlicElemental: ElementalProperties = {
        Fire: 0.6, // Garlic is fiery
    Water: 0.2,
        Earth: 0.1,
        Air: 0.1
};

      const singleClove = createQuantityScaledProperties(garlicElemental, 1, 'clove');
      const threeCloves = createQuantityScaledProperties(garlicElemental, 3, 'clove');

      // Three cloves should have higher scaling factor
      expect(threeCloves.factor).toBeGreaterThan(singleClove.factor);

      // Fire should be enhanced more in larger quantity (like reinforces like)
      expect(threeCloves.scaled.Fire).toBeGreaterThan(singleClove.scaled.Fire);

      // Both should maintain harmony
      const singleSum = Object.values(singleClove.scaled).reduce((a, b) => a + b, 0);
      const threeSum = Object.values(threeCloves.scaled).reduce((a, b) => a + b, 0);

      expect(singleSum).toBeCloseTo(1.0, 2);
      expect(threeSum).toBeCloseTo(1.0, 2);
    });

    it('should handle cooking thermodynamics integration', () => {
      const tomatoElemental: ElementalProperties = {
        Fire: 0.2,
        Water: 0.5, // Tomatoes are watery
    Earth: 0.2,
        Air: 0.1
};

      // Simulate roasting thermodynamics (high heat, low entropy)
      const roastingKinetics: ThermodynamicMetrics = {
        heat: 0.9,
        entropy: 0.1,
        reactivity: 0.8,
        gregsEnergy: 0.95,
        kalchm: 1.3,
        monica: 0.8
};

      const result = createQuantityScaledProperties(tomatoElemental, 200, 'g', roastingKinetics);

      // Should have kinetics impact
      expect(result.kineticsImpact).toBeDefined();

      // Water should be dominant element
      expect(result.scaled.Water).toBeGreaterThan(result.scaled.Fire);
      expect(result.scaled.Water).toBeGreaterThan(result.scaled.Earth);
      expect(result.scaled.Water).toBeGreaterThan(result.scaled.Air);
    });
  });
});
