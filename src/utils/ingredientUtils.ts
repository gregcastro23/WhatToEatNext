// Create or update a utility function to calculate proper alchemical properties

import type { AlchemicalProperties, ThermodynamicProperties, Modality , IngredientCategory } from '@/data/ingredients/types';
import type { ElementalProperties } from '@/types/alchemy';
import { FlavorProfile } from '@/types/alchemy';
import type { 
  Ingredient,
  RecipeIngredient, 
  SimpleIngredient, 
  IngredientMapping
} from '@/types';

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
  // Sun (Spirit), Moon/Venus (Essence), Saturn/Mars (Matter), Mercury/Neptune (Substance)
  let spirit = (elementals.Fire * 0.7) + (elementals.Air * 0.3);
  let essence = (elementals.Water * 0.6) + (elementals.Fire * 0.2) + (elementals.Air * 0.2);
  let matter = (elementals.Earth * 0.7) + (elementals.Water * 0.3);
  let substance = (elementals.Earth * 0.5) + (elementals.Water * 0.3) + (elementals.Air * 0.2);
  
  // Enhance with flavor profile if available
  if (ingredient.flavorProfile) {
    // Convert numeric flavor profile to FlavorProfile interface
    const flavorProfile = ingredient.flavorProfile as any as FlavorProfile;
    const flavorSpirit = calculateSpiritValue(flavorProfile);
    const flavorEssence = calculateEssenceValue(flavorProfile);
    const flavorMatter = calculateMatterValue(flavorProfile);
    const flavorSubstance = calculateSubstanceValue(flavorProfile);
    
    // Blend elemental and flavor-based calculations (70% elemental, 30% flavor)
    spirit = (spirit * 0.7) + (flavorSpirit * 0.3);
    essence = (essence * 0.7) + (flavorEssence * 0.3);
    matter = (matter * 0.7) + (flavorMatter * 0.3);
    substance = (substance * 0.7) + (flavorSubstance * 0.3);
  }
  
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
  // Spirit represents the fiery, transformative essence of ingredients
  // Higher for aromatic, spicy, and stimulating ingredients
  const intensity = flavorProfile.intensity || 0.5;
  const spiciness = flavorProfile.spice || 0;
  const aromatic = flavorProfile.aromatic || 0;
  
  // Calculate spirit based on transformative qualities
  return Math.min(1, (intensity * 0.4) + (spiciness * 0.4) + (aromatic * 0.2));
}

function calculateEssenceValue(flavorProfile: FlavorProfile): number {
  // Essence represents the fluid, emotional qualities
  // Higher for sweet, umami, and harmonizing ingredients  
  const sweetness = flavorProfile.sweet || 0;
  const umami = flavorProfile.umami || 0;
  const richness = flavorProfile.richness || 0;
  
  return Math.min(1, (sweetness * 0.4) + (umami * 0.3) + (richness * 0.3));
}

function calculateMatterValue(flavorProfile: FlavorProfile): number {
  // Matter represents grounding, substantial qualities
  // Higher for bitter, earthy, and foundational ingredients
  const bitterness = flavorProfile.bitter || 0;
  const earthiness = flavorProfile.earthy || 0;
  const density = flavorProfile.density || 0.5;
  
  return Math.min(1, (bitterness * 0.4) + (earthiness * 0.3) + (density * 0.3));
}

function calculateSubstanceValue(flavorProfile: FlavorProfile): number {
  // Substance represents the airy, mental, transformative qualities
  // Higher for sour, astringent, and clarifying ingredients
  const sourness = flavorProfile.sour || 0;
  const astringent = flavorProfile.astringent || 0;
  const clarity = flavorProfile.clarity || 0.5;
  
  return Math.min(1, (sourness * 0.4) + (astringent * 0.3) + (clarity * 0.3));
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
  const ingredientData = ingredient as unknown as Record<string, unknown>;
  return (
    ingredient &&
    typeof ingredientData?.name === 'string' &&
    typeof ingredientData?.amount === 'number' &&
    typeof ingredientData?.unit === 'string'
  );
}

/**
 * Type guard to check if an object is a full Ingredient
 */
export function isFullIngredient(ingredient: unknown): ingredient is Ingredient {
  if (!ingredient || typeof ingredient !== 'object') return false;

  // Use a broadly-typed record to avoid 'unknown' property access
  const ing = ingredient as Record<string, unknown>;

  return (
    typeof ing.name === 'string' &&
    typeof ing.category === 'string' &&
    typeof ing.elementalProperties === 'object' &&
    Array.isArray(ing.qualities) &&
    typeof ing.storage === 'object'
  );
}

/**
 * Validates that an ingredient object has all required properties
 */
export function validateIngredient(ingredient: Partial<Ingredient> & { 
  qualities?: string[]; 
  storage?: { temperature?: string; humidity?: string } 
}): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Required fields
  if (!ingredient.name || typeof ingredient.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  if (!ingredient.category) {
    errors.push('Category is required');
  }
  
  if (!ingredient.elementalProperties) {
    errors.push('Elemental properties are required');
  }
  
  // Optional validations
  if (ingredient.qualities && !Array.isArray(ingredient.qualities)) {
    errors.push('Qualities must be an array');
  }
  
  // Fix specific property access errors
  if (ingredient.qualities && Array.isArray(ingredient.qualities)) {
    // Check each quality is a string
    const invalidQualities = ingredient.qualities.filter((q) => typeof q !== 'string');
    if (invalidQualities.length > 0) {
      errors.push('All qualities must be strings');
    }
  }
  
  // Storage validation
  if (ingredient.storage && typeof ingredient.storage !== 'object') {
    errors.push('Storage must be an object');
  }
  
  if (ingredient.storage && typeof ingredient.storage === 'object') {
    // Additional storage property validations could go here
  }
  
  // Elemental properties validation
  if (ingredient.elementalProperties) {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    const props = ingredient.elementalProperties;
    
    for (const element of elements) {
      if (typeof props[element] !== 'number') {
        errors.push(`Elemental property ${element} must be a number`);
      }
    }
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
 * Gets the dominant element from an ElementalProperties object
 */
export function getDominantElement(elementalProperties: ElementalProperties): string {
  const { Fire, Water, Earth, Air } = elementalProperties;
  const max = Math.max(Fire, Water, Earth, Air);
  
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
  // Use object spread to safely copy remaining fields while providing sane defaults
  const {
    name = '',
    category = 'culinary_herb',
    elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities = [],
    storage = { duration: 'unknown' },
    amount = 1,
    astrologicalProfile = {
      elementalAffinity: { base: 'Earth' as Element },
      rulingPlanets: [],
      zodiacAffinity: [],
    },
    ...rest
  } = mapping as Record<string, unknown> & Partial<IngredientMapping>;

  return {
    name: name as string,
    amount: (amount as number).toString(),
    category: category as IngredientCategory,
    elementalProperties: elementalProperties as ElementalProperties,
    qualities: qualities as string[],
    storage: storage as Record<string, unknown>,
    astrologicalProfile: astrologicalProfile as {
      elementalAffinity: { base: string; secondary?: string; };
      rulingPlanets: string[];
      zodiacAffinity?: string[];
    },
    ...(rest as Record<string, unknown>),
  } as Ingredient;
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
    category: (ingredient.category ?? 'culinary_herb') as string,
    elementalProperties: ingredient.elementalProperties,
  };
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

/**
 * Creates a SimpleIngredient from a full Ingredient for lightweight operations
 */
export function toSimpleIngredient(ingredient: Ingredient): SimpleIngredient {
  return {
    name: ingredient.name,
    amount: 1,
    unit: 'item',
    category: ingredient.category as string,
    elementalProperties: ingredient.elementalProperties
  };
}

/**
 * Creates multiple SimpleIngredients from an array of full Ingredients
 */
export function toSimpleIngredients(ingredients: Ingredient[]): SimpleIngredient[] {
  return ingredients.map(toSimpleIngredient);
}

/**
 * Checks if an object is a SimpleIngredient
 */
export function isSimpleIngredient(obj: unknown): obj is SimpleIngredient {
  const ingredient = obj as Record<string, unknown>;
  return (
    obj &&
    typeof obj === 'object' &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.category === 'string' &&
    ingredient.elementalProperties &&
    typeof ingredient.elementalProperties === 'object'
  );
}

/**
 * Converts a SimpleIngredient back to a full Ingredient with default values
 */
export function fromSimpleIngredient(simple: SimpleIngredient): Ingredient {
  return {
    name: simple.name,
    amount: '1',
    category: simple.category as IngredientCategory,
    elementalProperties: simple.elementalProperties,
    storage: { duration: 'unknown' },
    astrologicalProfile: {
      elementalAffinity: { base: getDominantElement(simple.elementalProperties as ElementalProperties) as any },
      rulingPlanets: [],
      zodiacAffinity: []
    }
  };
}

/**
 * Performs lightweight elemental compatibility check between SimpleIngredients
 */
export function calculateSimpleCompatibility(
  ingredient1: SimpleIngredient,
  ingredient2: SimpleIngredient
): number {
  const props1 = ingredient1.elementalProperties as any as ElementalProperties;
  const props2 = ingredient2.elementalProperties as any as ElementalProperties;
  
  // Calculate elemental similarity (dot product normalized)
  const similarity = 
    (props1.Fire * props2.Fire) +
    (props1.Water * props2.Water) +
    (props1.Earth * props2.Earth) +
    (props1.Air * props2.Air);
  
  return Math.min(1, Math.max(0, similarity));
}

/**
 * Finds the most compatible SimpleIngredients from a list
 */
export function findCompatibleSimpleIngredients(
  target: SimpleIngredient,
  candidates: SimpleIngredient[],
  limit = 5
): Array<{ ingredient: SimpleIngredient; compatibility: number }> {
  return candidates
    .map(candidate => ({
      ingredient: candidate,
      compatibility: calculateSimpleCompatibility(target, candidate)
    }))
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit);
} 