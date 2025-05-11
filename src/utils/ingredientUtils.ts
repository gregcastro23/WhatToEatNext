// Create or update a utility function to calculate proper alchemical properties

import type {
  AlchemicalProperties,
  ThermodynamicProperties,
  Modality,
} from '@/data/ingredients/types';
import { ElementalProperties } from '@/types/alchemy';
// Removed duplicate: // Removed duplicate: import { ElementalProperties } from '@/types/alchemy';
import type {
  Ingredient,
  RecipeIngredient,
  SimpleIngredient,
  IngredientMapping,
  IngredientCategory,
} from '@/types';

/**
 * Calculate alchemical properties based on elemental properties
 * Following the core alchemizer engine formula patterns
 */
export function calculateAlchemicalProperties(
  ingredient: Ingredient
): AlchemicalProperties {
  // Extract elemental properties
  let elementals = ingredient.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Base values derived from planetary influences in the alchemizer
  // Sun (Spirit), Moon / (Venus || 1) (Essence), Saturn / (Mars || 1) (Matter), Mercury / (Neptune || 1) (Substance)
  // The ratios below approximate the original alchemizer calculations
  let spirit = elementals.Fire * 0.7 + elementals.Air * 0.3;
  let essence =
    elementals.Water * 0.6 + elementals.Fire * 0.2 + elementals.Air * 0.2;
  let matter = elementals.Earth * 0.7 + elementals.Water * 0.3;
  let substance =
    elementals.Earth * 0.5 + elementals.Water * 0.3 + elementals.Air * 0.2;

  return {
    spirit,
    essence,
    matter,
    substance,
  };
}

/**
 * Calculate thermodynamic properties based on alchemical and elemental properties
 * Using the exact formulas from the alchemizer engine
 */
export function calculateThermodynamicProperties(
  alchemicalProps: AlchemicalProperties,
  elementalProps?: ElementalProperties
): ThermodynamicProperties {
  const { spirit, essence, matter, substance } = alchemicalProps;

  // Use provided elemental props or create defaults
  let elements = elementalProps || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Extract elemental values
  let fire = elements.Fire;
  let water = elements.Water;
  let air = elements.Air;
  let earth = elements.Earth;

  // Using the exact formulas from the alchemizer engine
  let heat =
    (spirit ** 2 + fire ** 2) /
    ((substance + essence + matter + water + air + earth) ** 2 || 1);

  let entropy =
    (spirit ** 2 + substance ** 2 + fire ** 2 + air ** 2) /
    ((essence + matter + earth + water) ** 2 || 1);

  let reactivity =
    (spirit ** 2 +
      substance ** 2 +
      essence ** 2 +
      fire ** 2 +
      air ** 2 +
      water ** 2) /
    ((matter + earth) ** 2 || 1);

  let energy = heat - reactivity * entropy;

  return {
    heat,
    entropy,
    reactivity,
    energy,
  };
}

// Helper functions to calculate individual properties
function calculateSpiritValue(flavorProfile: FlavorProfile): number {
  // Implement logic based on flavor profile attributes
  // Example: spirit might be higher for aromatic, fragrant ingredients
  return flavorProfile.intensity || 0.5; // Default to 0.5 if intensity not provided
}

// Implement similar helper functions for essence, matter, and substance

/**
 * Determines the modality of an ingredient based on its qualities and elemental properties
 * Using the hierarchical affinities:
 * - Mutability: Air > Water > Fire > Earth
 * - Fixed: Earth > Water > Fire > Air
 * - Cardinal: Equal for all elements
 *
 * @param qualities Array of quality descriptors
 * @param elementalProperties Optional elemental properties for more accurate determination
 * @returns The modality (Cardinal, Fixed, or Mutable)
 */
export function determineIngredientModality(
  qualities: string[] = [],
  elementalProperties?: ElementalProperties
): Modality {
  // Ensure qualities is an array
  let qualitiesArray = Array.isArray(qualities) ? qualities : [];

  // Create normalized arrays of qualities for easier matching
  let normalizedQualities = qualitiesArray.map((q) => q.toLowerCase());

  // Look for explicit quality indicators in the ingredients
  let cardinalKeywords = [
    'initiating',
    'spicy',
    'pungent',
    'stimulating',
    'invigorating',
    'activating',
  ];
  let fixedKeywords = [
    'grounding',
    'stabilizing',
    'nourishing',
    'sustaining',
    'foundational',
  ];
  let mutableKeywords = [
    'adaptable',
    'flexible',
    'versatile',
    'balancing',
    'harmonizing',
  ];

  let hasCardinalQuality = normalizedQualities.some((q) =>
    cardinalKeywords.includes(q)
  );
  let hasFixedQuality = normalizedQualities.some((q) =>
    fixedKeywords.includes(q)
  );
  let hasMutableQuality = normalizedQualities.some((q) =>
    mutableKeywords.includes(q)
  );

  // If there's a clear quality indicator, use that
  if (hasCardinalQuality && !hasFixedQuality && !hasMutableQuality) {
    return 'Cardinal';
  }
  if (hasFixedQuality && !hasCardinalQuality && !hasMutableQuality) {
    return 'Fixed';
  }
  if (hasMutableQuality && !hasCardinalQuality && !hasFixedQuality) {
    return 'Mutable';
  }

  // If elemental properties are provided, use them to determine modality
  if (elementalProperties) {
    const { Fire, Water, Earth, Air } = elementalProperties;

    // Determine dominant element
    let dominantElement = getDominantElement(elementalProperties);

    // Use hierarchical element-modality affinities
    switch (dominantElement) {
      case 'Air':
        // Air has strongest affinity with Mutable, then Cardinal, then Fixed
        if (Air > 0.4) {
          return 'Mutable';
        }
        break;
      case 'Earth':
        // Earth has strongest affinity with Fixed, then Cardinal, then Mutable
        if (Earth > 0.4) {
          return 'Fixed';
        }
        break;
      case 'Fire':
        // Fire has balanced affinities but leans Cardinal
        if (Fire > 0.4) {
          return 'Cardinal';
        }
        break;
      case 'Water':
        // Water is balanced between Fixed and Mutable
        if (Water > 0.4) {
          // Slightly favor Mutable for Water, as per our hierarchy
          return Water > 0.6 ? 'Mutable' : 'Fixed';
        }
        break;
    }

    // Calculate modality scores based on hierarchical affinities
    let mutableScore = Air * 0.9 + Water * 0.8 + Fire * 0.7 + Earth * 0.5;
    let fixedScore = Earth * 0.9 + Water * 0.8 + Fire * 0.6 + Air * 0.5;
    let cardinalScore = Fire * 0.8 + Earth * 0.8 + Water * 0.8 + Air * 0.8;

    // Return the modality with the highest score
    if (mutableScore > fixedScore && mutableScore > cardinalScore) {
      return 'Mutable';
    } else if (fixedScore > mutableScore && fixedScore > cardinalScore) {
      return 'Fixed';
    } else {
      return 'Cardinal';
    }
  }

  // Default to Mutable if no clear indicators are found
  return 'Mutable';
}

/**
 * Type guard to check if an object is a RecipeIngredient
 */
export function isRecipeIngredient(
  ingredient: unknown
): ingredient is RecipeIngredient {
  return (
    ingredient &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.amount === 'number' &&
    typeof ingredient.unit === 'string'
  );
}

/**
 * Type guard to check if an object is a full Ingredient
 */
export function isFullIngredient(
  ingredient: unknown
): ingredient is Ingredient {
  return (
    ingredient &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.category === 'string' &&
    ingredient.elementalProperties &&
    Array.isArray(ingredient.qualities) &&
    ingredient.storage &&
    typeof ingredient.storage.duration === 'string'
  );
}

/**
 * Validates an ingredient object to ensure it has all required properties
 * Returns an object with validation results and any error messages
 */
export function validateIngredient(ingredient: Partial<Ingredient>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!ingredient.name) {
    errors.push('Name is required');
  }

  if (!ingredient.category) {
    errors.push('Category is required');
  } else {
    // Validate that the category is one of the allowed values
    const validCategories: IngredientCategory[] = [
      'culinary_herb',
      'spice',
      'vegetable',
      'fruit',
      'protein',
      'grain',
      'dairy',
      'oil',
    ];

    if (!validCategories.includes(ingredient.category as IngredientCategory)) {
      errors.push(
        `Invalid category: ${
          ingredient.category
        }. Must be one of: ${validCategories.join(', ')}`
      );
    }
  }

  // Check elementalProperties
  if (!ingredient.elementalProperties) {
    errors.push('Elemental properties are required');
  } else {
    const { Fire, Water, Earth, Air } = ingredient.elementalProperties;

    // Check that all elemental properties are present and are numbers between 0 and 1
    if (typeof Fire !== 'number' || Fire < 0 || Fire > 1) {
      errors.push('Fire elemental property must be a number between 0 and 1');
    }
    if (typeof Water !== 'number' || Water < 0 || Water > 1) {
      errors.push('Water elemental property must be a number between 0 and 1');
    }
    if (typeof Earth !== 'number' || Earth < 0 || Earth > 1) {
      errors.push('Earth elemental property must be a number between 0 and 1');
    }
    if (typeof Air !== 'number' || Air < 0 || Air > 1) {
      errors.push('Air elemental property must be a number between 0 and 1');
    }

    // Check that elemental properties sum to approximately 1
    let sum = Fire + Water + Earth + Air;
    if (sum < 0.99 || sum > 1.01) {
      errors.push(
        `Elemental properties should sum to 1, current sum: ${sum.toFixed(2)}`
      );
    }
  }

  // Check qualities
  if (
    !ingredient.qualities ||
    !Array.isArray(ingredient.qualities) ||
    ingredient.qualities.length === 0
  ) {
    errors.push('At least one quality is required');
  }

  // Check storage (required)
  if (!ingredient.storage) {
    errors.push('Storage information is required');
  } else if (!ingredient.storage.duration) {
    errors.push('Storage duration is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a recipe ingredient
 */
export function validateRecipeIngredient(
  ingredient: Partial<RecipeIngredient>
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!ingredient.name) {
    errors.push('Name is required');
  }

  if (typeof ingredient.amount !== 'number') {
    errors.push('Amount must be a number');
  }

  if (!ingredient.unit) {
    errors.push('Unit is required');
  }

  // If elemental properties are provided, validate them
  if (ingredient.elementalProperties) {
    const { Fire, Water, Earth, Air } = ingredient.elementalProperties;

    if (typeof Fire !== 'number' || Fire < 0 || Fire > 1) {
      errors.push('Fire elemental property must be a number between 0 and 1');
    }
    if (typeof Water !== 'number' || Water < 0 || Water > 1) {
      errors.push('Water elemental property must be a number between 0 and 1');
    }
    if (typeof Earth !== 'number' || Earth < 0 || Earth > 1) {
      errors.push('Earth elemental property must be a number between 0 and 1');
    }
    if (typeof Air !== 'number' || Air < 0 || Air > 1) {
      errors.push('Air elemental property must be a number between 0 and 1');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Merges two sets of elemental properties with optional weighting
 */
export function mergeElementalProperties(
  base: ElementalProperties,
  addition: ElementalProperties,
  weight = 0.5
): ElementalProperties {
  return {
    Fire: base.Fire * (1 - weight) + addition.Fire * weight,
    Water: base.Water * (1 - weight) + addition.Water * weight,
    Earth: base.Earth * (1 - weight) + addition.Earth * weight,
    Air: base.Air * (1 - weight) + addition.Air * weight,
  };
}

/**
 * Gets the dominant element from an ElementalProperties object
 */
export function getDominantElement(
  elementalProperties: ElementalProperties
): string {
  const { Fire, Water, Earth, Air } = elementalProperties;
  let max = Math.max(Fire, Water, Earth, Air);

  if (max === Fire) return 'Fire';
  if (max === Water) return 'Water';
  if (max === Earth) return 'Earth';
  if (max === Air) return 'Air';

  return 'Balanced';
}

/**
 * Converts an ingredient mapping to a full ingredient
 */
export function mapToIngredient(mapping: IngredientMapping): Ingredient {
  // Set default values for required properties
  const ingredient: Ingredient = {
    name: mapping.name,
    category: (mapping.category as IngredientCategory) || 'culinary_herb',
    elementalProperties: mapping.elementalProperties,
    qualities: mapping.qualities || [],
    storage: mapping.storage || {
      duration: 'unknown',
    },
  };

  // Add any additional properties from the mapping
  for (const key in mapping) {
    if (
      key !== 'name' &&
      key !== 'category' &&
      key !== 'elementalProperties' &&
      key !== 'qualities'
    ) {
      (ingredient as any)[key] = mapping[key];
    }
  }

  return ingredient;
}

/**
 * Converts a full ingredient to a recipe ingredient
 */
export function ingredientToRecipeIngredient(
  ingredient: Ingredient,
  amount = 1,
  unit = 'item'
): RecipeIngredient {
  return {
    name: ingredient.name,
    amount,
    unit,
    category: ingredient.category,
    subCategory: ingredient.subCategory,
    elementalProperties: ingredient.elementalProperties,
    // Include other relevant properties
    // ...
  };
}

/**
 * Normalizes elemental properties to ensure they sum to 1
 */
export function normalizeElementalProperties(
  properties: ElementalProperties
): ElementalProperties {
  const { Fire, Water, Earth, Air } = properties;
  let sum = Fire + Water + Earth + Air;

  if (sum === 0) {
    // If all values are 0, return an evenly balanced set
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: Fire / (sum || 1),
    Water: Water / (sum || 1),
    Earth: Earth / (sum || 1),
    Air: Air / (sum || 1),
  };
}
