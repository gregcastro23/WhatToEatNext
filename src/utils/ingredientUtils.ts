// Create or update a utility function to calculate proper alchemical properties

import type { AlchemicalProperties, ThermodynamicProperties, Modality } from '../data/ingredients/types';
import type { ElementalProperties, Element } from '../types/elemental';
import { FlavorProfile } from '../types/alchemy';
import { 
  IngredientCategory,
  isIngredientMapping
} from '../types';
import { 
  Ingredient as AlchemyIngredient,
  RecipeIngredient
} from '../types/alchemy';
import { Ingredient as DataIngredient } from '../data/ingredients/types';

// Combined Ingredient type that ensures 'qualities' property exists
type Ingredient = (AlchemyIngredient | DataIngredient) & {
  qualities?: string[];
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    elementalAffinity?: string | {
      base: string;
      secondary?: string;
      decanModifiers?: {
        first?: { element: string; planet: string };
        second?: { element: string; planet: string };
        third?: { element: string; planet: string };
      };
    };
    lunarPhaseModifiers?: Record<string, unknown>;
    aspectEnhancers?: string[];
    signAffinities?: string[];
    affinities?: Record<string, number>;
    zodiacAffinity?: string[]; // For compatibility with older code
  };
};

// Alias SimpleIngredient to RecipeIngredient for backward compatibility
type SimpleIngredient = RecipeIngredient;

/**
 * Calculate alchemical properties based on elemental properties
 * Following the core alchemizer engine formula patterns
 */
export function calculateAlchemicalProperties(ingredient: Ingredient): AlchemicalProperties {
  // Extract elemental properties
  const elementals = ingredient.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Base values derived from planetary influences in the alchemizer
  // sun (Spirit), Moon/venus (Essence), Saturn/Mars (Matter), mercury/Neptune (Substance)
  // The ratios below approximate the original alchemizer calculations
  const spirit = (elementals.Fire * 0.7) + (elementals.Air * 0.3);
  const essence = (elementals.Water * 0.6) + (elementals.Fire * 0.2) + (elementals.Air * 0.2);
  const matter = (elementals.Earth * 0.7) + (elementals.Water * 0.3);
  const substance = (elementals.Earth * 0.5) + (elementals.Water * 0.3) + (elementals.Air * 0.2);
  
  return {
    spirit,
    essence,
    matter,
    substance
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
  const elements = elementalProps || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Extract elemental values
  const fire = elements.Fire;
  const water = elements.Water;
  const air = elements.Air;
  const earth = elements.Earth;
  
  // Using the exact formulas from the alchemizer engine
  const heat = (spirit**2 + fire**2) / 
    ((substance + essence + matter + water + air + earth)**2 || 1);
    
  const entropy = (spirit**2 + substance**2 + fire**2 + air**2) / 
    ((essence + matter + earth + water)**2 || 1);
    
  const reactivity = (spirit**2 + substance**2 + essence**2 + fire**2 + air**2 + water**2) / 
    ((matter + earth)**2 || 1);
  
  const energy = heat - (reactivity * entropy);
  
  return {
    heat,
    entropy,
    reactivity,
    energy
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
  const qualitiesArray = Array.isArray(qualities) ? qualities : [];
  
  // Create normalized arrays of qualities for easier matching
  const normalizedQualities = qualitiesArray.map(q => q.toLowerCase());
  
  // Look for explicit quality indicators in the ingredients
  const cardinalKeywords = ['initiating', 'spicy', 'pungent', 'stimulating', 'invigorating', 'activating'];
  const fixedKeywords = ['grounding', 'stabilizing', 'nourishing', 'sustaining', 'foundational'];
  const mutableKeywords = ['adaptable', 'flexible', 'versatile', 'balancing', 'harmonizing'];
  
  const hasCardinalQuality = normalizedQualities.some(q => cardinalKeywords.includes(q));
  const hasFixedQuality = normalizedQualities.some(q => fixedKeywords.includes(q));
  const hasMutableQuality = normalizedQualities.some(q => mutableKeywords.includes(q));
  
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
    const dominantElement = getDominantElement(elementalProperties);
    
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
    const mutableScore = (Air * 0.9) + (Water * 0.8) + (Fire * 0.7) + (Earth * 0.5);
    const fixedScore = (Earth * 0.9) + (Water * 0.8) + (Fire * 0.6) + (Air * 0.5);
    const cardinalScore = (Fire * 0.8) + (Earth * 0.8) + (Water * 0.8) + (Air * 0.8);
    
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
export function isRecipeIngredient(ingredient: unknown): ingredient is RecipeIngredient {
  return (
    !!ingredient &&
    typeof ingredient === 'object' &&
    typeof (ingredient as RecipeIngredient).name === 'string' &&
    typeof (ingredient as RecipeIngredient).amount === 'number' &&
    typeof (ingredient as RecipeIngredient).unit === 'string'
  );
}

/**
 * Type guard to check if an object is a full Ingredient
 */
export function isFullIngredient(ingredient: unknown): ingredient is Ingredient {
  return (
    !!ingredient &&
    typeof ingredient === 'object' &&
    typeof (ingredient as Ingredient).name === 'string' &&
    typeof (ingredient as Ingredient).category === 'string' &&
    !!(ingredient as Ingredient).elementalProperties &&
    Array.isArray((ingredient as Ingredient).qualities)
  );
}

/**
 * Validates an ingredient object to ensure it has all required properties
 * Returns an object with validation results and any error messages
 */
export function validateIngredient(ingredient: Partial<Ingredient>): { 
  isValid: boolean; 
  errors: string[] 
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
    const validCategories: string[] = [
      IngredientCategory.Herb,
      IngredientCategory.Spice,
      IngredientCategory.Vegetable,
      IngredientCategory.Fruit,
      IngredientCategory.Protein,
      IngredientCategory.Grain,
      IngredientCategory.Dairy,
      IngredientCategory.Oil
    ];

    if (!validCategories.includes(ingredient.category as string)) {
      errors.push(`Invalid category: ${ingredient.category}. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  // Check for required fields based on category
  if (ingredient.category === IngredientCategory.Spice && !ingredient.elementalProperties) {
    errors.push('Elemental properties are required for spices');
  }

  // Check for at least one quality
  if (!ingredient.qualities || ingredient.qualities.length === 0) {
    errors.push('At least one quality is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a recipe ingredient
 */
export function validateRecipeIngredient(ingredient: Partial<RecipeIngredient>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!ingredient.name) {
    errors.push('Name is required');
  }

  if (ingredient.amount !== undefined && typeof ingredient.amount !== 'number' && typeof ingredient.amount !== 'string') {
    errors.push('Amount must be a number or string');
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
    errors
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
    Air: base.Air * (1 - weight) + addition.Air * weight
  };
}

/**
 * Identifies the dominant element from elemental properties
 * Returns the element with the highest value
 */
export function getDominantElement(elementalProperties: ElementalProperties): keyof ElementalProperties {
  // Create a list of [element, value] pairs
  const elementEntries = Object.entries(elementalProperties)
    .filter(([key]) => ['Fire', 'Water', 'Earth', 'Air'].includes(key));
  
  // Sort by value in descending order
  elementEntries.sort((a, b) => b[1] - a[1]);
  
  // Return the element with the highest value, or 'balanced' if all values are equal
  const [dominantElement] = elementEntries[0] || ['Fire'];
  
  return dominantElement as keyof ElementalProperties;
}

/**
 * Converts an ingredient mapping to a full ingredient
 */
export function mapToIngredient(mapping: IngredientMapping): Ingredient {
  // Create a base ingredient with known required fields
  const baseElements = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };

  // Define a default element that complies with the Element type
  const defaultElement: string = 'Earth';

  // Create the ingredient fields separately to avoid type issues
  const baseIngredient = {
    name: mapping.name,
    amount: 1, // Default value
    unit: 'item', // Default value
    category: mapping.category !== undefined ? mapping.category : 'unknown',
    elementalProperties: mapping.elementalProperties || baseElements,
    qualities: mapping.qualities || [],
    element: defaultElement,
    astrologicalProfile: {
      rulingPlanets: mapping.astrologicalProfile?.rulingPlanets || [],
      signAffinities: mapping.astrologicalProfile?.signAffinities || [],
      zodiacAffinity: mapping.astrologicalProfile?.signAffinities || [],
      elementalAffinity: {
        base: mapping.astrologicalProfile?.elementalAffinity?.base || 'Unknown'
      }
    }
  };

  // First convert to unknown, then to Ingredient to avoid the type error
  const ingredient = baseIngredient as unknown as Ingredient;

  // Don't try to access seasonality directly if it might not exist
  // in the IngredientMapping type
  if ('seasonality' in mapping && Array.isArray(mapping.seasonality)) {
    // Use type assertion since we've confirmed it exists
    (ingredient as any).seasonality = mapping.seasonality;
  }

  return ingredient;
}

/**
 * Converts a full ingredient to a recipe ingredient
 */
export function ingredientToRecipeIngredient(
  ingredient: Ingredient,
  amount: number | string = 1,
  unit = 'item'
): RecipeIngredient {
  // Create a base RecipeIngredient from the provided ingredient
  const recipeIngredient: RecipeIngredient = {
    name: ingredient.name,
    amount: amount,
    unit: unit,
    category: ingredient.category || 'unknown',
    // Cast to ElementalProperties from RecipeIngredient type to ensure compatibility
    elementalProperties: ingredient.elementalProperties ? {
      Fire: ingredient.elementalProperties.Fire || 0,
      Water: ingredient.elementalProperties.Water || 0,
      Earth: ingredient.elementalProperties.Earth || 0,
      Air: ingredient.elementalProperties.Air || 0
    } : undefined
  };
  
  // Handle astrologicalProfile separately since structure might differ
  if (ingredient.astrologicalProfile) {
    recipeIngredient.astrologicalProfile = {
      rulingPlanets: ingredient.astrologicalProfile.rulingPlanets || [],
    };
    
    // Handle elementalAffinity with proper structure
    if (ingredient.astrologicalProfile.elementalAffinity) {
      const elementalAffinity = ingredient.astrologicalProfile.elementalAffinity;
      // Check if it's already an object with a base property
      if (typeof elementalAffinity === 'object' && elementalAffinity !== null && 'base' in elementalAffinity) {
        // Use type assertion to handle the known structure
        const baseValue = (elementalAffinity as { base: string }).base;
        const secondaryValue = (elementalAffinity as { secondary?: string }).secondary;
        
        recipeIngredient.astrologicalProfile.elementalAffinity = {
          base: baseValue || 'unknown',
          secondary: secondaryValue
        };
      }
      // If it's a string, create a proper object
      else if (typeof elementalAffinity === 'string') {
        recipeIngredient.astrologicalProfile.elementalAffinity = {
          base: elementalAffinity || 'unknown'
        };
      }
      // Fallback with a safe default
      else {
        recipeIngredient.astrologicalProfile.elementalAffinity = {
          base: 'unknown'
        };
      }
    }
    
    // Handle zodiacAffinity vs signAffinities
    if ('signAffinities' in ingredient.astrologicalProfile && 
        Array.isArray(ingredient.astrologicalProfile.signAffinities)) {
      recipeIngredient.astrologicalProfile.zodiacAffinity = ingredient.astrologicalProfile.signAffinities;
    }
  }

  // Handle season/seasonality differences safely 
  if ('seasonality' in ingredient && Array.isArray((ingredient as any).seasonality)) {
    (recipeIngredient as any).season = (ingredient as any).seasonality.map((s: any) => String(s));
  }

  // Handle optional/isOptional differences
  if ('optional' in ingredient && typeof (ingredient as any).optional === 'boolean') {
    recipeIngredient.isOptional = (ingredient as any).optional;
  }

  // Handle notes if present
  if ('notes' in ingredient && typeof (ingredient as any).notes === 'string') {
    recipeIngredient.notes = (ingredient as any).notes;
  }

  return recipeIngredient;
}

/**
 * Normalizes elemental properties to ensure they sum to 1
 */
export function normalizeElementalProperties(properties: ElementalProperties): ElementalProperties {
  const { Fire, Water, Earth, Air } = properties;
  const sum = Fire + Water + Earth + Air;
  
  if (sum === 0) {
    // If all values are 0, return an evenly balanced set
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  return {
    Fire: Fire / sum,
    Water: Water / sum,
    Earth: Earth / sum,
    Air: Air / sum
  };
} 