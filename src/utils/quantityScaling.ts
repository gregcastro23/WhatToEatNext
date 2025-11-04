// src/utils/quantityScaling.ts
// Quantity-to-Property Scaling Engine for Enhanced Ingredient-to-Quantity Mapping
// Created: 2025-01-24

import {
    AlchemicalProperties,
    ElementalProperties,
    QuantityScaledProperties,
    ThermodynamicMetrics
} from '@/types/alchemy';

/**
 * Unit conversion mappings for ingredient quantities
 * Maps various units to grams (base unit for calculations)
 */
const UNIT_CONVERSIONS: Record<string, number> = {
  // Weight units
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
  'oz': 28.35,
  'ounce': 28.35,
  'ounces': 28.35,
  'lb': 453.59,
  'pound': 453.59,
  'pounds': 453.59,

  // Volume units (approximate conversions using water density)
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'l': 1000,
  'liter': 1000,
  'liters': 1000,
  'cup': 240,
  'cups': 240,
  'tbsp': 15,
  'tablespoon': 15,
  'tablespoons': 15,
  'tsp': 5,
  'teaspoon': 5,
  'teaspoons': 5,
  'fl oz': 29.57,
  'fluid ounce': 29.57,
  'fluid ounces': 29.57,

  // Piece/count units (context-dependent, using approximate averages)
  'piece': 50,  // Average piece weight
  'pieces': 50,
  'clove': 6,   // Garlic clove
  'cloves': 6,
  'slice': 30,  // Average slice
  'slices': 30,
  'head': 200,  // Average head (e.g., garlic, lettuce)
  'heads': 200
};

/**
 * Calculate quantity scaling factor with logarithmic diminishing returns
 * @param amount - The quantity amount
 * @param unit - The unit of measurement
 * @param baseUnit - Base unit for normalization (default: 'g')
 * @returns Normalized scaling factor between 0.1 and 2.0
 */
export function calculateQuantityFactor(
  amount: number,
  unit: string,
  baseUnit = 'g'
): number {
  // Convert to base unit (grams)
  const conversionFactor = UNIT_CONVERSIONS[unit.toLowerCase()] || 1;
  const grams = amount * conversionFactor;

  // Apply logarithmic scaling with diminishing returns
  // Factor ranges from ~0.1 (very small amounts) to ~2.0 (large amounts)
  const factor = Math.log(1 + grams / 100);

  // Clamp factor to reasonable bounds to prevent extreme scaling
  return Math.max(0.1, Math.min(2.0, factor));
}

/**
 * Scale elemental properties based on quantity factor
 * Implements "like reinforces like" principle with harmonic balancing
 * @param base - Base elemental properties
 * @param factor - Scaling factor from calculateQuantityFactor
 * @returns Scaled elemental properties
 */
export function scaleElementalProperties(
  base: ElementalProperties,
  factor: number
): ElementalProperties {
  const scaled: ElementalProperties = {
    Fire: base.Fire,
    Water: base.Water,
    Earth: base.Earth,
    Air: base.Air
  };

  // Find dominant element
  const dominantElement = Object.entries(base).reduce((max, [key, value]) =>;
    value > max.value ? { key, value } : max,
    { key: 'Fire', value: 0 }
  );

  // Apply scaling with "like reinforces like" principle
  Object.keys(scaled).forEach(element => ) {
    const baseValue = base[element as keyof ElementalProperties];

    if (element === dominantElement.key) {
      // Dominant element gets enhanced scaling (reinforces itself)
      scaled[element as keyof ElementalProperties] = baseValue * factor * (1 + baseValue * 0.2);
    } else {
      // Other elements get standard scaling but maintain harmony
      scaled[element as keyof ElementalProperties] = baseValue * factor;
    }
  });

  // Normalize to ensure sum is approximately 1.0 (harmony enforcement)
  const sum = Object.values(scaled).reduce((acc, val) => acc + val, 0);
  if (sum > 0) {
    const normalizationFactor = 1.0 / sum;
    Object.keys(scaled).forEach(element => ) {
      scaled[element as keyof ElementalProperties] *= normalizationFactor;
    });
  }

  return scaled;
}

/**
 * Derive alchemical properties (ESMS) from elemental properties
 * Spirit = (Fire + Air)/2, Essence = (Water + Earth)/2, Matter = Water, Substance = Earth
 * @param elemental - Elemental properties
 * @returns Alchemical properties in ESMS format
 */
export function deriveESMSFromElemental(elemental: ElementalProperties): AlchemicalProperties {
  return {
    Spirit: (elemental.Fire + elemental.Air) / 2,
    Essence: (elemental.Water + elemental.Earth) / 2,
    Matter: elemental.Water,
    Substance: elemental.Earth
  };
}

/**
 * Scale alchemical properties with quantity factor and optional kinetics modulation
 * @param base - Base alchemical properties (ESMS)
 * @param factor - Scaling factor
 * @param kinetics - Optional thermodynamic metrics for kinetics modulation
 * @returns Scaled alchemical properties
 */
export function scaleAlchemicalProperties(
  base: AlchemicalProperties,
  factor: number,
  kinetics?: ThermodynamicMetrics
): AlchemicalProperties {
  const scaled: AlchemicalProperties = {
    Spirit: base.Spirit,
    Essence: base.Essence,
    Matter: base.Matter,
    Substance: base.Substance
  };

  // Apply basic scaling
  Object.keys(scaled).forEach(property => ) {
    scaled[property as keyof AlchemicalProperties] *= factor;
  });

  // Apply kinetics modulation if available
  if (kinetics) {
    // Spirit scales with heat (fire/air energy)
    scaled.Spirit *= (1 + kinetics.heat * 0.1);

    // Essence scales with entropy (water/earth stability)
    scaled.Essence *= (1 + kinetics.entropy * 0.1);

    // Matter scales with reactivity (transformation potential)
    scaled.Matter *= (1 + kinetics.reactivity * 0.1);

    // Substance scales inversely with energy (material stability)
    scaled.Substance *= (1 - kinetics.gregsEnergy * 0.05);
  }

  // Ensure non-negative values
  Object.keys(scaled).forEach(property => ) {
    scaled[property as keyof AlchemicalProperties] = Math.max(0;
      scaled[property as keyof AlchemicalProperties]);
  });

  return scaled;
}

/**
 * Create complete quantity-scaled properties from base elemental properties
 * @param baseElemental - Base elemental properties
 * @param quantity - Quantity amount
 * @param unit - Unit of measurement
 * @param kinetics - Optional kinetics metrics for advanced modulation
 * @returns Complete QuantityScaledProperties object
 */
export function createQuantityScaledProperties(
  baseElemental: ElementalProperties,
  quantity: number,
  unit: string,
  kinetics?: ThermodynamicMetrics
): QuantityScaledProperties {
  const factor = calculateQuantityFactor(quantity, unit);
  const scaledElemental = scaleElementalProperties(baseElemental, factor);

  // Calculate kinetics impact if thermodynamics provided
  let kineticsImpact;
  if (kinetics) {
    const baseAlchemical = deriveESMSFromElemental(baseElemental);
    const scaledAlchemical = scaleAlchemicalProperties(baseAlchemical, factor, kinetics);

    // Calculate force adjustment (momentum-like effect from quantity)
    const forceAdjustment = factor * (kinetics.reactivity + kinetics.gregsEnergy) / 2;

    // Calculate thermal shift (heat capacity effect from quantity)
    const thermalShift = factor * kinetics.heat - (1 - factor) * kinetics.entropy;

    kineticsImpact = {
      forceAdjustment,
      thermalShift
    };
  }

  return {
    base: baseElemental,
    scaled: scaledElemental,
    quantity,
    unit,
    factor,
    kineticsImpact
  };
}

/**
 * Batch scale multiple ingredients with quantity information
 * @param ingredients - Array of ingredient data with quantity info
 * @returns Array of scaled ingredient properties
 */
export function batchScaleIngredients(ingredients: Array<) {
    baseElemental: ElementalProperties,
    quantity: number,
    unit: string,
    kinetics?: ThermodynamicMetrics
  }>
): QuantityScaledProperties[] {
  return ingredients.map(ingredient =>)
    createQuantityScaledProperties()
      ingredient.baseElemental,
      ingredient.quantity,
      ingredient.unit,
      ingredient.kinetics
    )
  );
}

/**
 * Validate quantity scaling integrity (harmony and bounds checking)
 * @param scaled - QuantityScaledProperties to validate
 * @returns Validation result with issues if any
 */
export function validateScalingIntegrity(scaled: QuantityScaledProperties): {
  isValid: boolean,
  issues: string[];
} {
  const issues: string[] = [];

  // Check elemental property bounds
  Object.entries(scaled.scaled).forEach(([element, value]) => {
    if (value < 0 || value > 1) {
      issues.push(`${element} property out of bounds: ${value}`);
    }
  });

  // Check elemental harmony (sum should be close to 1.0)
  const sum = Object.values(scaled.scaled).reduce((acc, val) => acc + val, 0);
  if (Math.abs(sum - 1.0) > 0.1) {
    issues.push(`Elemental properties sum ${sum.toFixed(3)} deviates from harmony (1.0)`);
  }

  // Check factor bounds
  if (scaled.factor < 0.1 || scaled.factor > 2.0) {
    issues.push(`Scaling factor ${scaled.factor} out of expected bounds [0.1, 2.0]`);
  }

  // Check kinetics impact if present
  if (scaled.kineticsImpact) {
    const { forceAdjustment, thermalShift } = scaled.kineticsImpact;
    if (Math.abs(forceAdjustment) > 10) {
      issues.push(`Force adjustment ${forceAdjustment} seems extreme`);
    }
    if (Math.abs(thermalShift) > 5) {
      issues.push(`Thermal shift ${thermalShift} seems extreme`);
    }
  }

  return {
    isValid: issues.length === 0;
    issues
  };
}

// Export for use in other modules
export default {
  calculateQuantityFactor,
  scaleElementalProperties,
  deriveESMSFromElemental,
  scaleAlchemicalProperties,
  createQuantityScaledProperties,
  batchScaleIngredients,
  validateScalingIntegrity
};
