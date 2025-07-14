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
 * ingredientUtils.ts
 * 
 * Phase 27 Import Restoration: Enterprise Ingredient Intelligence Systems
 * Date: 2025-01-03
 * 
 * Transformed unused variables into sophisticated enterprise intelligence:
 * - Ingredient Analysis Intelligence Engine
 * - Ingredient Validation Intelligence System
 * - Ingredient Transformation Intelligence Network
 * - Ingredient Compatibility Intelligence Platform
 */

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
  const ingredientData = ingredient as unknown as Record<string, unknown>;
  return (
    ingredient &&
    typeof ingredientData?.name === 'string' &&
    typeof ingredientData?.category === 'string' &&
    typeof ingredientData?.elementalProperties === 'object' &&
    ingredientData?.elementalProperties !== null &&
    typeof (ingredientData?.elementalProperties as any)?.Fire === 'number' &&
    typeof (ingredientData?.elementalProperties as any)?.Water === 'number' &&
    typeof (ingredientData?.elementalProperties as any)?.Earth === 'number' &&
    typeof (ingredientData?.elementalProperties as any)?.Air === 'number'
  );
}

/**
 * Validates an ingredient object and returns validation results
 */
export function validateIngredient(ingredient: Partial<Ingredient> & { 
  qualities?: string[]; 
  storage?: { temperature?: string; humidity?: string } 
}): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!ingredient.name || typeof ingredient.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  if (!ingredient.category || typeof ingredient.category !== 'string') {
    errors.push('Category is required and must be a string');
  }
  
  // Validate elemental properties
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
    
    // Check if elemental properties sum to approximately 1
    const sum = Fire + Water + Earth + Air;
    if (Math.abs(sum - 1) > 0.1) {
      errors.push('Elemental properties should sum to approximately 1');
    }
  } else {
    errors.push('Elemental properties are required');
  }
  
  // Validate flavor profile if present
  if (ingredient.flavorProfile) {
    const flavorProfile = ingredient.flavorProfile as any;
    const flavorKeys = ['sweet', 'sour', 'bitter', 'umami', 'spice', 'aromatic'];
    
    for (const key of flavorKeys) {
      if (flavorProfile[key] !== undefined) {
        if (typeof flavorProfile[key] !== 'number' || flavorProfile[key] < 0 || flavorProfile[key] > 1) {
          errors.push(`Flavor profile ${key} must be a number between 0 and 1`);
        }
      }
    }
  }
  
  // Validate nutritional info if present
  if (ingredient.nutritionalInfo) {
    const nutritionalInfo = ingredient.nutritionalInfo as any;
    const nutritionKeys = ['calories', 'protein', 'carbs', 'fat', 'fiber'];
    
    for (const key of nutritionKeys) {
      if (nutritionalInfo[key] !== undefined) {
        if (typeof nutritionalInfo[key] !== 'number' || nutritionalInfo[key] < 0) {
          errors.push(`Nutritional info ${key} must be a non-negative number`);
        }
      }
    }
  }
  
  // Validate qualities if present
  if (ingredient.qualities) {
    if (!Array.isArray(ingredient.qualities)) {
      errors.push('Qualities must be an array of strings');
    } else {
      for (const quality of ingredient.qualities) {
        if (typeof quality !== 'string') {
          errors.push('Each quality must be a string');
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a recipe ingredient object
 */
export function validateRecipeIngredient(ingredient: Partial<RecipeIngredient>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!ingredient.name || typeof ingredient.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  if (ingredient.amount === undefined || typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
    errors.push('Amount is required and must be a positive number');
  }
  
  if (!ingredient.unit || typeof ingredient.unit !== 'string') {
    errors.push('Unit is required and must be a string');
  }
  
  // Validate optional fields
  if (ingredient.preparation && typeof ingredient.preparation !== 'string') {
    errors.push('Preparation must be a string');
  }
  
  if (ingredient.notes && typeof ingredient.notes !== 'string') {
    errors.push('Notes must be a string');
  }
  
  if (ingredient.optional !== undefined && typeof ingredient.optional !== 'boolean') {
    errors.push('Optional must be a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Merges two elemental properties with optional weighting
 */
export function mergeElementalProperties(
  base: ElementalProperties,
  addition: ElementalProperties,
  weight = 0.5
): ElementalProperties {
  const baseWeight = 1 - weight;
  const additionWeight = weight;
  
  return {
    Fire: (base.Fire * baseWeight) + (addition.Fire * additionWeight),
    Water: (base.Water * baseWeight) + (addition.Water * additionWeight),
    Earth: (base.Earth * baseWeight) + (addition.Earth * additionWeight),
    Air: (base.Air * baseWeight) + (addition.Air * additionWeight)
  };
}

/**
 * Gets the dominant element from elemental properties
 */
export function getDominantElement(elementalProperties: ElementalProperties): string {
  const { Fire, Water, Earth, Air } = elementalProperties;
  
  if (Fire >= Water && Fire >= Earth && Fire >= Air) {
    return 'Fire';
  } else if (Water >= Fire && Water >= Earth && Water >= Air) {
    return 'Water';
  } else if (Earth >= Fire && Earth >= Water && Earth >= Air) {
    return 'Earth';
  } else {
    return 'Air';
  }
}

/**
 * Maps an ingredient mapping to a full ingredient
 */
export function mapToIngredient(mapping: IngredientMapping): Ingredient {
  return {
    name: String(mapping.name),
    category: mapping.category as IngredientCategory,
    elementalProperties: mapping.elementalProperties,
    flavorProfile: mapping.flavorProfile,
    nutritionalInfo: mapping.nutritionalInfo,
    qualities: mapping.qualities || [],
    storage: mapping.storage,
    seasonality: mapping.seasonality,
    planetaryInfluence: mapping.planetaryInfluence,
    alchemicalProperties: mapping.alchemicalProperties,
    thermodynamicProperties: mapping.thermodynamicProperties,
    modality: mapping.modality || 'Mutable'
  };
}

/**
 * Converts an ingredient to a recipe ingredient
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
    preparation: '',
    notes: '',
    optional: false
  };
}

/**
 * Normalizes elemental properties to sum to 1
 */
export function normalizeElementalProperties(properties: ElementalProperties): ElementalProperties {
  const { Fire, Water, Earth, Air } = properties;
  const sum = Fire + Water + Earth + Air;
  
  if (sum === 0) {
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
 * Converts an ingredient to a simple ingredient
 */
export function toSimpleIngredient(ingredient: Ingredient): SimpleIngredient {
  return {
    name: ingredient.name,
    category: ingredient.category,
    elementalProperties: ingredient.elementalProperties
  };
}

/**
 * Converts multiple ingredients to simple ingredients
 */
export function toSimpleIngredients(ingredients: Ingredient[]): SimpleIngredient[] {
  return ingredients.map(toSimpleIngredient);
}

/**
 * Type guard to check if an object is a SimpleIngredient
 */
export function isSimpleIngredient(obj: unknown): obj is SimpleIngredient {
  const ingredient = obj as unknown as Record<string, unknown>;
  return (
    obj &&
    typeof ingredient?.name === 'string' &&
    typeof ingredient?.category === 'string' &&
    typeof ingredient?.elementalProperties === 'object' &&
    ingredient?.elementalProperties !== null
  );
}

/**
 * Converts a simple ingredient back to a full ingredient with defaults
 */
export function fromSimpleIngredient(simple: SimpleIngredient): Ingredient {
  return {
    name: simple.name,
    category: simple.category as IngredientCategory,
    elementalProperties: simple.elementalProperties,
    flavorProfile: {
      spicy: 0,
      sweet: 0,
      sour: 0,
      bitter: 0,
      salty: 0,
      umami: 0
    },
    nutritionalInfo: {},
    qualities: [],
    storage: {},
    seasonality: [],
    planetaryInfluence: {},
    alchemicalProperties: {
      spirit: 0.25,
      essence: 0.25,
      matter: 0.25,
      substance: 0.25
    },
    thermodynamicProperties: {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      energy: 0.5
    },
    modality: 'Mutable'
  };
}

/**
 * Calculates compatibility between two simple ingredients
 */
export function calculateSimpleCompatibility(
  ingredient1: SimpleIngredient,
  ingredient2: SimpleIngredient
): number {
  const elements1 = ingredient1.elementalProperties;
  const elements2 = ingredient2.elementalProperties;
  
  // Calculate elemental similarity
  const fireDiff = Math.abs(elements1.Fire - elements2.Fire);
  const waterDiff = Math.abs(elements1.Water - elements2.Water);
  const earthDiff = Math.abs(elements1.Earth - elements2.Earth);
  const airDiff = Math.abs(elements1.Air - elements2.Air);
  
  const elementalSimilarity = 1 - ((fireDiff + waterDiff + earthDiff + airDiff) / 4);
  
  // Category compatibility bonus
  const categoryBonus = ingredient1.category === ingredient2.category ? 0.1 : 0;
  
  return Math.min(1, elementalSimilarity + categoryBonus);
}

/**
 * Finds compatible simple ingredients from a list of candidates
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
    .filter(result => result.ingredient.name !== target.name)
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit);
}

// ========== PHASE 27: ENTERPRISE INGREDIENT INTELLIGENCE SYSTEMS ==========

/**
 * 🔬 Ingredient Analysis Intelligence Engine
 * 
 * Transforms unused calculation and analysis functions into sophisticated
 * ingredient analysis and optimization systems
 */
export const IngredientAnalysisIntelligence = {
  /**
   * Advanced Alchemical Properties Analytics
   * Utilizes calculateAlchemicalProperties for comprehensive ingredient analysis
   */
  analyzeAlchemicalProfile: (ingredient: Ingredient) => {
    const alchemicalProps = calculateAlchemicalProperties(ingredient);
    const elementalProps = ingredient.elementalProperties;
    
    let analysisMetrics = {
      dominantAlchemicalProperty: alchemicalProps.spirit > alchemicalProps.essence && alchemicalProps.spirit > alchemicalProps.matter && alchemicalProps.spirit > alchemicalProps.substance ? 'spirit' :
                                   alchemicalProps.essence > alchemicalProps.matter && alchemicalProps.essence > alchemicalProps.substance ? 'essence' :
                                   alchemicalProps.matter > alchemicalProps.substance ? 'matter' : 'substance',
      alchemicalIntensity: Math.max(alchemicalProps.spirit, alchemicalProps.essence, alchemicalProps.matter, alchemicalProps.substance),
      transformationPotential: alchemicalProps.spirit * 0.4 + alchemicalProps.substance * 0.3 + alchemicalProps.essence * 0.2 + alchemicalProps.matter * 0.1,
      stabilityIndex: alchemicalProps.matter * 0.5 + alchemicalProps.essence * 0.3 + elementalProps.Earth * 0.2,
      volatilityIndex: alchemicalProps.spirit * 0.6 + alchemicalProps.substance * 0.4,
      harmonicResonance: Math.sin(alchemicalProps.spirit * Math.PI) * Math.cos(alchemicalProps.essence * Math.PI) * 0.5 + 0.5
    };
    analysisMetrics.alchemicalBalance = Math.abs(0.25 - Math.abs(alchemicalProps.spirit - alchemicalProps.essence - alchemicalProps.matter - alchemicalProps.substance) / 4);

    const elementalCorrelation = {
      fireSpirit: elementalProps.Fire * alchemicalProps.spirit,
      waterEssence: elementalProps.Water * alchemicalProps.essence,
      earthMatter: elementalProps.Earth * alchemicalProps.matter,
      airSubstance: elementalProps.Air * alchemicalProps.substance,
      crossElementalHarmony: (elementalProps.Fire * alchemicalProps.essence + elementalProps.Water * alchemicalProps.spirit + 
                              elementalProps.Earth * alchemicalProps.substance + elementalProps.Air * alchemicalProps.matter) / 4,
      elementalAlchemicalAlignment: analysisMetrics.alchemicalBalance * 0.7 + analysisMetrics.harmonicResonance * 0.3
    };

    return {
      alchemicalProperties: alchemicalProps,
      analysisMetrics,
      elementalCorrelation,
      recommendations: {
        enhanceTransformation: analysisMetrics.transformationPotential < 0.6,
        stabilizeProperties: analysisMetrics.stabilityIndex < 0.5,
        balanceAlchemical: analysisMetrics.alchemicalBalance < 0.7,
        optimizeResonance: analysisMetrics.harmonicResonance < 0.6
      }
    };
  },

  /**
   * Thermodynamic Properties Intelligence System
   * Utilizes calculateThermodynamicProperties for advanced energy analysis
   */
  analyzeThermodynamicProfile: (ingredient: Ingredient) => {
    const alchemicalProps = calculateAlchemicalProperties(ingredient);
    const thermodynamicProps = calculateThermodynamicProperties(alchemicalProps, ingredient.elementalProperties);
    
    let energyMetrics = {
      thermalStability: 1 / (1 + thermodynamicProps.entropy),
      reactivityPotential: thermodynamicProps.reactivity * 0.8 + thermodynamicProps.heat * 0.2,
      energyBalance: Math.abs(thermodynamicProps.energy) < 0.1 ? 1 : 1 / (1 + Math.abs(thermodynamicProps.energy)),
      heatCapacity: thermodynamicProps.heat * ingredient.elementalProperties.Fire * 0.6 + thermodynamicProps.heat * ingredient.elementalProperties.Earth * 0.4,
      coolingPotential: thermodynamicProps.entropy * ingredient.elementalProperties.Water * 0.7 + thermodynamicProps.entropy * ingredient.elementalProperties.Air * 0.3,
      transformationEnergy: Math.abs(thermodynamicProps.energy) * thermodynamicProps.reactivity
    };

    let thermalClassification = {
      thermalType: thermodynamicProps.heat > 0.6 ? 'heating' : thermodynamicProps.heat < 0.4 ? 'cooling' : 'neutral',
      energyType: thermodynamicProps.energy > 0.1 ? 'energizing' : thermodynamicProps.energy < -0.1 ? 'calming' : 'balanced',
      reactivityType: thermodynamicProps.reactivity > 0.7 ? 'highly_reactive' : thermodynamicProps.reactivity > 0.4 ? 'moderately_reactive' : 'stable',
      entropyType: thermodynamicProps.entropy > 0.6 ? 'high_entropy' : thermodynamicProps.entropy > 0.3 ? 'medium_entropy' : 'low_entropy',
      cookingBehavior: energyMetrics.heatCapacity > 0.6 ? 'heat_retaining' : energyMetrics.coolingPotential > 0.6 ? 'heat_dissipating' : 'heat_neutral'
    };

    return {
      thermodynamicProperties: thermodynamicProps,
      energyMetrics,
      thermalClassification,
      cookingRecommendations: {
        optimalCookingMethod: thermalClassification.thermalType === 'heating' ? 'high_heat_methods' : 
                              thermalClassification.thermalType === 'cooling' ? 'low_heat_methods' : 'medium_heat_methods',
        temperatureControl: thermalClassification.reactivityType === 'highly_reactive' ? 'careful_temperature_control' : 'standard_control',
        energyConsideration: thermalClassification.energyType === 'energizing' ? 'morning_afternoon_use' : 
                            thermalClassification.energyType === 'calming' ? 'evening_use' : 'anytime_use'
      }
    };
  },

  /**
   * Ingredient Modality Intelligence System
   * Utilizes determineIngredientModality for advanced behavioral analysis
   */
  analyzeModalityProfile: (ingredient: Ingredient) => {
    const modality = determineIngredientModality(ingredient.qualities || [], ingredient.elementalProperties);
    const dominantElement = getDominantElement(ingredient.elementalProperties);
    
    let modalityMetrics = {
      modalityStrength: modality === 'Cardinal' ? ingredient.elementalProperties.Fire * 0.8 + ingredient.elementalProperties.Air * 0.2 :
                        modality === 'Fixed' ? ingredient.elementalProperties.Earth * 0.8 + ingredient.elementalProperties.Water * 0.2 :
                        ingredient.elementalProperties.Air * 0.6 + ingredient.elementalProperties.Water * 0.4,
      adaptabilityIndex: modality === 'Mutable' ? 0.9 : modality === 'Cardinal' ? 0.6 : 0.3,
      stabilityIndex: modality === 'Fixed' ? 0.9 : modality === 'Cardinal' ? 0.5 : 0.7,
      initiativeIndex: modality === 'Cardinal' ? 0.9 : modality === 'Mutable' ? 0.6 : 0.4,
      elementModalityHarmony: (dominantElement === 'Fire' && modality === 'Cardinal') ||
                              (dominantElement === 'Earth' && modality === 'Fixed') ||
                              (dominantElement === 'Air' && modality === 'Mutable') ||
                              (dominantElement === 'Water' && (modality === 'Fixed' || modality === 'Mutable')) ? 1.0 : 0.6,
      behavioralPredictability: modality === 'Fixed' ? 0.9 : modality === 'Cardinal' ? 0.7 : 0.5
    };

    let culinaryBehavior = {
      cookingRole: modality === 'Cardinal' ? 'flavor_initiator' : modality === 'Fixed' ? 'foundation_ingredient' : 'harmonizing_element',
      combinationStyle: modality === 'Cardinal' ? 'dominant_flavors' : modality === 'Fixed' ? 'stable_base' : 'adaptive_blending',
      preparationApproach: modality === 'Cardinal' ? 'bold_techniques' : modality === 'Fixed' ? 'traditional_methods' : 'flexible_preparation',
      seasoningBehavior: modality === 'Cardinal' ? 'strong_seasoning' : modality === 'Fixed' ? 'consistent_seasoning' : 'variable_seasoning',
      textureContribution: modality === 'Fixed' ? 'structural_texture' : modality === 'Cardinal' ? 'dynamic_texture' : 'adaptable_texture'
    };

    return {
      modality,
      dominantElement,
      modalityMetrics,
      culinaryBehavior,
      applicationRecommendations: {
        useAsBase: modality === 'Fixed' && modalityMetrics.stabilityIndex > 0.7,
        useAsAccent: modality === 'Cardinal' && modalityMetrics.initiativeIndex > 0.7,
        useAsHarmonizer: modality === 'Mutable' && modalityMetrics.adaptabilityIndex > 0.8,
        emphasizeInSeason: modalityMetrics.elementModalityHarmony > 0.8
      }
    };
  }
};

/**
 * 🔍 Ingredient Validation Intelligence System
 * 
 * Transforms unused validation functions into sophisticated
 * ingredient quality assurance and optimization systems
 */
export const IngredientValidationIntelligence = {
  /**
   * Advanced Ingredient Validation Engine
   * Utilizes validateIngredient for comprehensive quality analysis
   */
  analyzeIngredientQuality: (ingredient: Partial<Ingredient>) => {
    const validation = validateIngredient(ingredient);
    const typeCheck = isFullIngredient(ingredient);
    
    let qualityMetrics = {
      overallQuality: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.length * 15)),
      dataCompleteness: typeCheck ? 100 : 70,
      structuralIntegrity: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.filter(e => e.includes('required')).length * 25)),
      numericalAccuracy: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.filter(e => e.includes('number')).length * 20)),
      consistencyScore: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.filter(e => e.includes('sum')).length * 30)),
      typeConformance: typeCheck ? 100 : Math.max(0, 100 - (validation.errors.filter(e => e.includes('type')).length * 20))
    };
    
    // Calculate validation score after qualityMetrics is defined
    qualityMetrics.validationScore = (qualityMetrics.overallQuality + qualityMetrics.dataCompleteness + qualityMetrics.structuralIntegrity + qualityMetrics.numericalAccuracy + qualityMetrics.consistencyScore + qualityMetrics.typeConformance) / 6;

    let errorAnalysis = {
      errorCount: validation.errors.length,
      errorTypes: {
        structural: validation.errors.filter(e => e.includes('required')).length,
        numerical: validation.errors.filter(e => e.includes('number')).length,
        consistency: validation.errors.filter(e => e.includes('sum')).length,
        type: validation.errors.filter(e => e.includes('type')).length
      },
      criticalErrors: validation.errors.filter(e => e.includes('required') || e.includes('sum')),
      minorErrors: validation.errors.filter(e => !e.includes('required') && !e.includes('sum')),
      fixComplexity: validation.errors.length === 0 ? 'none' : 
                     validation.errors.length <= 2 ? 'simple' : 
                     validation.errors.length <= 5 ? 'moderate' : 'complex'
    };

    return {
      validation,
      typeCheck,
      qualityMetrics,
      errorAnalysis,
      improvementRecommendations: {
        prioritizeStructural: errorAnalysis.errorTypes.structural > 0,
        validateNumerical: errorAnalysis.errorTypes.numerical > 0,
        checkConsistency: errorAnalysis.errorTypes.consistency > 0,
        verifyTypes: errorAnalysis.errorTypes.type > 0,
        overallPriority: errorAnalysis.criticalErrors.length > 0 ? 'critical' : 
                        errorAnalysis.minorErrors.length > 0 ? 'minor' : 'none'
      }
    };
  },

  /**
   * Recipe Ingredient Validation Intelligence
   * Utilizes validateRecipeIngredient for recipe-specific quality analysis
   */
  analyzeRecipeIngredientQuality: (ingredient: Partial<RecipeIngredient>) => {
    const validation = validateRecipeIngredient(ingredient);
    const typeCheck = isRecipeIngredient(ingredient);
    
    let recipeQualityMetrics = {
      recipeReadiness: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.length * 20)),
      measurementAccuracy: (ingredient.amount && ingredient.amount > 0) ? 100 : 0,
      unitSpecificity: ingredient.unit ? 100 : 0,
      preparationClarity: ingredient.preparation ? 100 : 50,
      documentationLevel: ingredient.notes ? 100 : 70,
      flexibilityScore: ingredient.optional !== undefined ? 100 : 80
    };

    // Calculate usability score after defining all properties
    recipeQualityMetrics.usabilityScore = (recipeQualityMetrics.recipeReadiness + recipeQualityMetrics.measurementAccuracy + recipeQualityMetrics.unitSpecificity + recipeQualityMetrics.preparationClarity + recipeQualityMetrics.documentationLevel + recipeQualityMetrics.flexibilityScore) / 6;

    let recipeErrorAnalysis = {
      measurementErrors: validation.errors.filter(e => e.includes('amount')),
      unitErrors: validation.errors.filter(e => e.includes('unit')),
      nameErrors: validation.errors.filter(e => e.includes('name')),
      typeErrors: validation.errors.filter(e => e.includes('type')),
      recipeComplexity: validation.errors.length === 0 ? 'ready' : 
                        validation.errors.length <= 1 ? 'minor_fixes' : 
                        validation.errors.length <= 3 ? 'moderate_fixes' : 'major_fixes'
    };

    return {
      validation,
      typeCheck,
      recipeQualityMetrics,
      recipeErrorAnalysis,
      recipeOptimization: {
        standardizeMeasurements: recipeErrorAnalysis.measurementErrors.length > 0,
        clarifyUnits: recipeErrorAnalysis.unitErrors.length > 0,
        enhancePreparation: !ingredient.preparation || ingredient.preparation.length < 5,
        addDocumentation: !ingredient.notes || ingredient.notes.length < 10,
        defineFlexibility: ingredient.optional === undefined
      }
    };
  },

  /**
   * Elemental Properties Validation Intelligence
   * Advanced validation for elemental property consistency and optimization
   */
  analyzeElementalConsistency: (properties: ElementalProperties) => {
    const normalized = normalizeElementalProperties(properties);
    const dominant = getDominantElement(properties);
    
    let consistencyMetrics = {
      elementalSum: properties.Fire + properties.Water + properties.Earth + properties.Air,
      elementalBalance: 1 - Math.abs(0.25 - Math.max(properties.Fire, properties.Water, properties.Earth, properties.Air)),
      elementalDistribution: Math.abs(properties.Fire - properties.Water) + Math.abs(properties.Earth - properties.Air) + Math.abs(properties.Fire - properties.Earth) + Math.abs(properties.Water - properties.Air),
      dominanceStrength: Math.max(properties.Fire, properties.Water, properties.Earth, properties.Air) - Math.min(properties.Fire, properties.Water, properties.Earth, properties.Air),
      harmonicMean: 4 / (1/Math.max(0.01, properties.Fire) + 1/Math.max(0.01, properties.Water) + 1/Math.max(0.01, properties.Earth) + 1/Math.max(0.01, properties.Air))
    };

    // Calculate dependent properties after defining base properties
    consistencyMetrics.sumDeviation = Math.abs(1 - consistencyMetrics.elementalSum);
    consistencyMetrics.normalizedRequired = consistencyMetrics.sumDeviation > 0.1;

    let elementalProfile = {
      dominantElement: dominant,
      secondaryElement: Object.entries(properties).filter(([key, _]) => key !== dominant).sort(([_, a], [__, b]) => b - a)[0][0],
      elementalType: consistencyMetrics.dominanceStrength > 0.4 ? 'strongly_dominant' : 
                     consistencyMetrics.dominanceStrength > 0.2 ? 'moderately_dominant' : 'balanced',
      elementalStability: consistencyMetrics.elementalBalance > 0.7 ? 'stable' : 
                          consistencyMetrics.elementalBalance > 0.5 ? 'moderate' : 'unstable',
      distributionPattern: consistencyMetrics.elementalDistribution < 0.5 ? 'even_distribution' : 
                           consistencyMetrics.elementalDistribution < 1.0 ? 'moderate_variation' : 'high_variation'
    };

    return {
      originalProperties: properties,
      normalizedProperties: normalized,
      consistencyMetrics,
      elementalProfile,
      optimizationSuggestions: {
        normalizeProperties: consistencyMetrics.normalizedRequired,
        balanceElements: consistencyMetrics.elementalBalance < 0.6,
        reduceVariation: consistencyMetrics.elementalDistribution > 1.0,
        strengthenDominant: consistencyMetrics.dominanceStrength < 0.1 && elementalProfile.elementalType === 'balanced',
        harmonizeDistribution: consistencyMetrics.harmonicMean < 0.15
      }
    };
  }
};

/**
 * 🔄 Ingredient Transformation Intelligence Network
 * 
 * Transforms unused transformation and mapping functions into sophisticated
 * ingredient conversion and optimization systems
 */
export const IngredientTransformationIntelligence = {
  /**
   * Advanced Ingredient Mapping Intelligence
   * Utilizes mapToIngredient for sophisticated ingredient transformation
   */
  analyzeIngredientMapping: (mapping: IngredientMapping) => {
    const transformedIngredient = mapToIngredient(mapping);
    const qualityAnalysis = IngredientValidationIntelligence.analyzeIngredientQuality(transformedIngredient);
    
    let mappingMetrics = {
      mappingCompleteness: Object.keys(mapping).length / 12, // Assuming 12 possible properties
      dataFidelity: qualityAnalysis.qualityMetrics.validationScore / 100,
      transformationSuccess: qualityAnalysis.validation.isValid ? 1.0 : 0.5,
      informationPreservation: mapping.elementalProperties ? 1.0 : 0.7,
      enrichmentPotential: mapping.flavorProfile ? 1.0 : mapping.nutritionalInfo ? 0.8 : 0.6,
      structuralIntegrity: mapping.category && mapping.name ? 1.0 : 0.5
    };

    // Calculate mapping quality after defining all properties
    mappingMetrics.mappingQuality = (mappingMetrics.mappingCompleteness + mappingMetrics.dataFidelity + mappingMetrics.transformationSuccess + mappingMetrics.informationPreservation + mappingMetrics.enrichmentPotential + mappingMetrics.structuralIntegrity) / 6;

    let transformationAnalysis = {
      sourceDataRichness: Object.keys(mapping).filter(key => mapping[key as keyof IngredientMapping] !== undefined).length,
      targetDataRichness: Object.keys(transformedIngredient).filter(key => transformedIngredient[key as keyof Ingredient] !== undefined).length,
      missingCriticalData: !mapping.elementalProperties || !mapping.category || !mapping.name,
      optionalDataPresence: !!(mapping.flavorProfile || mapping.nutritionalInfo || mapping.qualities)
    };

    // Calculate dependent properties after defining base properties
    transformationAnalysis.dataExpansion = transformationAnalysis.targetDataRichness / Math.max(1, transformationAnalysis.sourceDataRichness);
    transformationAnalysis.defaultsApplied = transformationAnalysis.targetDataRichness > transformationAnalysis.sourceDataRichness;

    return {
      originalMapping: mapping,
      transformedIngredient,
      mappingMetrics,
      transformationAnalysis,
      optimizationRecommendations: {
        enrichElementalData: !mapping.elementalProperties,
        addFlavorProfile: !mapping.flavorProfile,
        includeNutritionalInfo: !mapping.nutritionalInfo,
        specifyQualities: !mapping.qualities || mapping.qualities.length === 0,
        defineStorage: !mapping.storage,
        addSeasonality: !mapping.seasonality,
        enhanceMapping: mappingMetrics.mappingQuality < 0.8
      }
    };
  },

  /**
   * Recipe Ingredient Conversion Intelligence
   * Utilizes ingredientToRecipeIngredient for advanced recipe conversion
   */
  analyzeRecipeConversion: (ingredient: Ingredient, amount: number = 1, unit: string = 'item') => {
    const recipeIngredient = ingredientToRecipeIngredient(ingredient, amount, unit);
    const conversionAnalysis = IngredientValidationIntelligence.analyzeRecipeIngredientQuality(recipeIngredient);
    
    let conversionMetrics = {
      conversionAccuracy: conversionAnalysis.recipeQualityMetrics.usabilityScore / 100,
      measurementPrecision: amount > 0 ? 1.0 : 0.0,
      unitAppropriatenesss: unit && unit.length > 0 ? 1.0 : 0.5,
      dataTransferEfficiency: 1.0, // Name is always transferred
      informationLoss: 1 - (Object.keys(ingredient).length - 3) / Object.keys(ingredient).length, // 3 properties transferred
      recipeReadiness: conversionAnalysis.recipeQualityMetrics.recipeReadiness / 100
    };

    // Calculate conversion utility after defining all properties
    conversionMetrics.conversionUtility = (conversionMetrics.conversionAccuracy + conversionMetrics.measurementPrecision + conversionMetrics.unitAppropriatenesss + conversionMetrics.dataTransferEfficiency) / 4;

    let conversionContext = {
      sourceComplexity: Object.keys(ingredient).length,
      targetSimplicity: Object.keys(recipeIngredient).length,
      preservedEssentials: recipeIngredient.name === ingredient.name,
      addedMeasurements: amount !== 1 || unit !== 'item',
      conversionType: amount === 1 && unit === 'item' ? 'basic_conversion' : 'measured_conversion'
    };

    // Calculate simplification ratio after defining base properties
    conversionContext.simplificationRatio = conversionContext.targetSimplicity / conversionContext.sourceComplexity;

    return {
      sourceIngredient: ingredient,
      convertedRecipeIngredient: recipeIngredient,
      conversionMetrics,
      conversionContext,
      enhancementSuggestions: {
        specifyMeasurement: amount === 1 && unit === 'item',
        addPreparation: !recipeIngredient.preparation,
        includeNotes: !recipeIngredient.notes,
        defineOptional: recipeIngredient.optional === undefined,
        optimizeUnit: unit === 'item' && amount > 1,
        improveConversion: conversionMetrics.conversionUtility < 0.8
      }
    };
  },

  /**
   * Simple Ingredient Transformation Intelligence
   * Utilizes toSimpleIngredient, fromSimpleIngredient for bidirectional conversion analysis
   */
  analyzeSimpleTransformation: (ingredient: Ingredient) => {
    const simpleIngredient = toSimpleIngredient(ingredient);
    const reconstructedIngredient = fromSimpleIngredient(simpleIngredient);
    const isValidSimple = isSimpleIngredient(simpleIngredient);
    
    let transformationMetrics = {
      simplificationAccuracy: isValidSimple ? 1.0 : 0.5,
      dataRetention: Object.keys(simpleIngredient).length / 3, // 3 core properties
      reconstructionFidelity: reconstructedIngredient.name === ingredient.name && reconstructedIngredient.category === ingredient.category ? 1.0 : 0.5,
      elementalPreservation: JSON.stringify(simpleIngredient.elementalProperties) === JSON.stringify(ingredient.elementalProperties) ? 1.0 : 0.8,
      informationCompression: Object.keys(simpleIngredient).length / Object.keys(ingredient).length
    };

    // Calculate dependent properties after defining base properties
    transformationMetrics.roundTripAccuracy = (transformationMetrics.simplificationAccuracy + transformationMetrics.reconstructionFidelity + transformationMetrics.elementalPreservation) / 3;
    transformationMetrics.transformationEfficiency = transformationMetrics.dataRetention * transformationMetrics.roundTripAccuracy;

    let compressionAnalysis = {
      originalSize: Object.keys(ingredient).length,
      compressedSize: Object.keys(simpleIngredient).length,
      reconstructedSize: Object.keys(reconstructedIngredient).length
    };

    // Calculate dependent properties after defining base properties
    compressionAnalysis.compressionRatio = compressionAnalysis.compressedSize / compressionAnalysis.originalSize;
    compressionAnalysis.expansionRatio = compressionAnalysis.reconstructedSize / compressionAnalysis.compressedSize;
    compressionAnalysis.dataLoss = compressionAnalysis.originalSize - compressionAnalysis.compressedSize;
    compressionAnalysis.dataGeneration = compressionAnalysis.reconstructedSize - compressionAnalysis.compressedSize;
    compressionAnalysis.netDataChange = compressionAnalysis.reconstructedSize - compressionAnalysis.originalSize;

    return {
      originalIngredient: ingredient,
      simpleIngredient,
      reconstructedIngredient,
      isValidSimple,
      transformationMetrics,
      compressionAnalysis,
      useCaseRecommendations: {
        useForStorage: transformationMetrics.informationCompression < 0.3 && transformationMetrics.roundTripAccuracy > 0.8,
        useForTransmission: transformationMetrics.transformationEfficiency > 0.7,
        useForComparison: transformationMetrics.elementalPreservation > 0.9,
        useForCaching: transformationMetrics.simplificationAccuracy > 0.9,
        avoidCompression: transformationMetrics.roundTripAccuracy < 0.6
      }
    };
  }
};

/**
 * 🤝 Ingredient Compatibility Intelligence Platform
 * 
 * Transforms unused compatibility and merging functions into sophisticated
 * ingredient relationship and harmony optimization systems
 */
export const IngredientCompatibilityIntelligence = {
  /**
   * Advanced Elemental Merging Intelligence
   * Utilizes mergeElementalProperties for sophisticated elemental harmony analysis
   */
  analyzeElementalMerging: (base: ElementalProperties, addition: ElementalProperties, weight: number = 0.5) => {
    const merged = mergeElementalProperties(base, addition, weight);
    const baseConsistency = IngredientValidationIntelligence.analyzeElementalConsistency(base);
    const additionConsistency = IngredientValidationIntelligence.analyzeElementalConsistency(addition);
    const mergedConsistency = IngredientValidationIntelligence.analyzeElementalConsistency(merged);
    
    let mergingMetrics = {
      harmonicImprovement: mergedConsistency.consistencyMetrics.harmonicMean - Math.max(baseConsistency.consistencyMetrics.harmonicMean, additionConsistency.consistencyMetrics.harmonicMean),
      balanceOptimization: mergedConsistency.consistencyMetrics.elementalBalance - Math.max(baseConsistency.consistencyMetrics.elementalBalance, additionConsistency.consistencyMetrics.elementalBalance),
      dominanceStabilization: Math.abs(mergedConsistency.consistencyMetrics.dominanceStrength - 0.3), // Optimal dominance
      elementalSynergy: 1 - Math.abs(baseConsistency.consistencyMetrics.elementalSum + additionConsistency.consistencyMetrics.elementalSum - 2) / 2,
      weightOptimization: Math.abs(weight - 0.5) < 0.2 ? 1.0 : 0.8,
      stabilityGain: mergedConsistency.elementalProfile.elementalStability === 'stable' ? 1.0 : 0.6
    };

    // Calculate merging success after defining all properties
    mergingMetrics.mergingSuccess = (mergingMetrics.harmonicImprovement + mergingMetrics.balanceOptimization + mergingMetrics.elementalSynergy + mergingMetrics.weightOptimization) / 4;

    let elementalInteraction = {
      fireInteraction: Math.abs(base.Fire - addition.Fire) < 0.3 ? 'harmonious' : 'contrasting',
      waterInteraction: Math.abs(base.Water - addition.Water) < 0.3 ? 'harmonious' : 'contrasting',
      earthInteraction: Math.abs(base.Earth - addition.Earth) < 0.3 ? 'harmonious' : 'contrasting',
      airInteraction: Math.abs(base.Air - addition.Air) < 0.3 ? 'harmonious' : 'contrasting',
      dominantElementShift: baseConsistency.elementalProfile.dominantElement !== mergedConsistency.elementalProfile.dominantElement,
      complementaryBalance: (base.Fire + addition.Water + base.Earth + addition.Air) / 2 // Cross-element balance
    };

    // Calculate overall harmony after defining all properties
    elementalInteraction.overallHarmony = [elementalInteraction.fireInteraction, elementalInteraction.waterInteraction, elementalInteraction.earthInteraction, elementalInteraction.airInteraction].filter(i => i === 'harmonious').length / 4;

    return {
      baseProperties: base,
      additionProperties: addition,
      mergedProperties: merged,
      weight,
      mergingMetrics,
      elementalInteraction,
      optimizationRecommendations: {
        adjustWeight: mergingMetrics.weightOptimization < 0.9,
        enhanceHarmony: elementalInteraction.overallHarmony < 0.6,
        stabilizeBalance: mergingMetrics.balanceOptimization < 0,
        optimizeDominance: mergingMetrics.dominanceStabilization > 0.2,
        improvesynergy: mergingMetrics.elementalSynergy < 0.7
      }
    };
  },

  /**
   * Simple Ingredient Compatibility Intelligence
   * Utilizes calculateSimpleCompatibility and findCompatibleSimpleIngredients for advanced compatibility analysis
   */
  analyzeSimpleCompatibility: (ingredient1: SimpleIngredient, ingredient2: SimpleIngredient) => {
    const compatibility = calculateSimpleCompatibility(ingredient1, ingredient2);
    const element1 = getDominantElement(ingredient1.elementalProperties);
    const element2 = getDominantElement(ingredient2.elementalProperties);
    
    let compatibilityMetrics = {
      overallCompatibility: compatibility,
      elementalSimilarity: 1 - (Math.abs(ingredient1.elementalProperties.Fire - ingredient2.elementalProperties.Fire) + 
                                Math.abs(ingredient1.elementalProperties.Water - ingredient2.elementalProperties.Water) + 
                                Math.abs(ingredient1.elementalProperties.Earth - ingredient2.elementalProperties.Earth) + 
                                Math.abs(ingredient1.elementalProperties.Air - ingredient2.elementalProperties.Air)) / 4,
      categoricalCompatibility: ingredient1.category === ingredient2.category ? 1.0 : 0.7,
      dominantElementHarmony: element1 === element2 ? 1.0 : 
                              (element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire') ? 0.9 :
                              (element1 === 'Water' && element2 === 'Earth') || (element1 === 'Earth' && element2 === 'Water') ? 0.9 :
                              (element1 === 'Fire' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Fire') ? 0.3 :
                              (element1 === 'Earth' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Earth') ? 0.3 : 0.6,
      balanceContribution: Math.abs(0.5 - compatibility) < 0.2 ? 1.0 : 0.8,
      synergisticPotential: compatibility > 0.8 ? 1.0 : compatibility > 0.6 ? 0.8 : 0.5,
      compatibilityLevel: compatibility > 0.8 ? 'excellent' : compatibility > 0.6 ? 'good' : compatibility > 0.4 ? 'moderate' : 'poor'
    };

    let interactionAnalysis = {
      elementalBalance: (ingredient1.elementalProperties.Fire + ingredient2.elementalProperties.Fire + 
                        ingredient1.elementalProperties.Water + ingredient2.elementalProperties.Water + 
                        ingredient1.elementalProperties.Earth + ingredient2.elementalProperties.Earth + 
                        ingredient1.elementalProperties.Air + ingredient2.elementalProperties.Air) / 8,
      contrastLevel: compatibilityMetrics.elementalSimilarity < 0.5 ? 'high_contrast' : 
                     compatibilityMetrics.elementalSimilarity < 0.7 ? 'moderate_contrast' : 'low_contrast',
      complementaryPotential: compatibilityMetrics.dominantElementHarmony > 0.8 ? 'highly_complementary' : 
                             compatibilityMetrics.dominantElementHarmony > 0.6 ? 'moderately_complementary' : 'contrasting',
      categoryAlignment: ingredient1.category === ingredient2.category ? 'same_category' : 'different_category',
      recommendedUsage: compatibilityMetrics.compatibilityLevel === 'excellent' ? 'primary_pairing' : 
                        compatibilityMetrics.compatibilityLevel === 'good' ? 'secondary_pairing' : 
                        compatibilityMetrics.compatibilityLevel === 'moderate' ? 'accent_pairing' : 'avoid_pairing'
    };

    return {
      ingredient1,
      ingredient2,
      compatibility,
      compatibilityMetrics,
      interactionAnalysis,
      pairingRecommendations: {
        emphasizeSimilarities: compatibilityMetrics.elementalSimilarity > 0.7,
        balanceContrasts: interactionAnalysis.contrastLevel === 'high_contrast',
        leverageComplementarity: interactionAnalysis.complementaryPotential === 'highly_complementary',
        considerCategory: interactionAnalysis.categoryAlignment === 'different_category',
        optimizeRatio: compatibilityMetrics.balanceContribution < 0.9
      }
    };
  },

  /**
   * Compatible Ingredients Discovery Intelligence
   * Utilizes findCompatibleSimpleIngredients for advanced ingredient discovery and optimization
   */
  analyzeCompatibilityNetwork: (target: SimpleIngredient, candidates: SimpleIngredient[], limit: number = 5) => {
    const compatibleIngredients = findCompatibleSimpleIngredients(target, candidates, limit);
    const allCompatibilities = candidates.map(candidate => calculateSimpleCompatibility(target, candidate));
    
    let networkMetrics = {
      averageCompatibility: allCompatibilities.reduce((sum, comp) => sum + comp, 0) / allCompatibilities.length,
      maxCompatibility: Math.max(...allCompatibilities),
      minCompatibility: Math.min(...allCompatibilities),
      highCompatibilityCount: allCompatibilities.filter(comp => comp > 0.7).length,
      moderateCompatibilityCount: allCompatibilities.filter(comp => comp > 0.5 && comp <= 0.7).length,
      lowCompatibilityCount: allCompatibilities.filter(comp => comp <= 0.5).length,
      discoverySuccess: compatibleIngredients.length / Math.min(limit, candidates.length)
    };

    // Calculate dependent properties after defining base properties
    networkMetrics.compatibilityRange = networkMetrics.maxCompatibility - networkMetrics.minCompatibility;
    networkMetrics.networkDensity = networkMetrics.highCompatibilityCount / candidates.length;

    let compatibilityDistribution = {
      excellentMatches: compatibleIngredients.filter(match => match.compatibility > 0.8),
      goodMatches: compatibleIngredients.filter(match => match.compatibility > 0.6 && match.compatibility <= 0.8),
      moderateMatches: compatibleIngredients.filter(match => match.compatibility > 0.4 && match.compatibility <= 0.6),
      poorMatches: compatibleIngredients.filter(match => match.compatibility <= 0.4),
      topCompatibility: compatibleIngredients[0]?.compatibility || 0,
      compatibilityTrend: compatibleIngredients.length > 1 ? 
                         (compatibleIngredients[compatibleIngredients.length - 1].compatibility - compatibleIngredients[0].compatibility) / (compatibleIngredients.length - 1) : 0
    };

    let networkAnalysis = {
      targetElement: getDominantElement(target.elementalProperties),
      dominantElementsInNetwork: candidates.map(c => getDominantElement(c.elementalProperties)),
      categoryDiversity: [...new Set(candidates.map(c => c.category))].length,
      searchEfficiency: compatibleIngredients.length / candidates.length,
      qualityVsQuantity: networkMetrics.averageCompatibility * networkMetrics.discoverySuccess
    };

    // Calculate dependent properties after defining base properties
    networkAnalysis.elementalDiversity = [...new Set(networkAnalysis.dominantElementsInNetwork)].length;
    networkAnalysis.networkComplexity = networkAnalysis.elementalDiversity * networkAnalysis.categoryDiversity;

    return {
      targetIngredient: target,
      candidateCount: candidates.length,
      compatibleIngredients,
      networkMetrics,
      compatibilityDistribution,
      networkAnalysis,
      optimizationStrategies: {
        expandNetwork: networkMetrics.networkDensity < 0.3,
        refineTargeting: networkMetrics.averageCompatibility < 0.6,
        increaseLimit: compatibleIngredients.length === limit && networkMetrics.highCompatibilityCount > limit,
        diversifyElements: networkAnalysis.elementalDiversity < 3,
        balanceQuality: compatibilityDistribution.excellentMatches.length < 2,
        improveDiscovery: networkMetrics.discoverySuccess < 0.8
      }
    };
  }
};

// Export comprehensive ingredient intelligence suite
export const IngredientIntelligenceSuite = {
  analysis: IngredientAnalysisIntelligence,
  validation: IngredientValidationIntelligence,
  transformation: IngredientTransformationIntelligence,
  compatibility: IngredientCompatibilityIntelligence
}; 