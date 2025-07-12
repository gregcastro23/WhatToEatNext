import type { 
  CookingMethod, 
  ElementalEffect, 
  CookingAlchemicalProperties, 
  AstrologicalInfluences, 
  ThermodynamicProperties,
  CookingDuration,
  TemperatureRange
} from '@/types/cooking';

/**
 * Type guards for cooking method validation
 */

// Check if an object is a valid ElementalEffect
export function isElementalEffect(obj: unknown): obj is ElementalEffect {
  if (!obj || typeof obj !== 'object') return false;
  
  const effect = obj as Record<string, unknown>;
  return (
    typeof effect.Fire === 'number' &&
    typeof effect.Water === 'number' &&
    typeof effect.Earth === 'number' &&
    typeof effect.Air === 'number' &&
    effect.Fire >= 0 && effect.Fire <= 1 &&
    effect.Water >= 0 && effect.Water <= 1 &&
    effect.Earth >= 0 && effect.Earth <= 1 &&
    effect.Air >= 0 && effect.Air <= 1
  );
}

// Check if an object is a valid CookingAlchemicalProperties
export function isCookingAlchemicalProperties(obj: unknown): obj is CookingAlchemicalProperties {
  if (!obj || typeof obj !== 'object') return false;
  
  const props = obj as Record<string, unknown>;
  return (
    typeof props.Spirit === 'number' &&
    typeof props.Essence === 'number' &&
    typeof props.Matter === 'number' &&
    typeof props.Substance === 'number' &&
    props.Spirit >= 0 && props.Spirit <= 1 &&
    props.Essence >= 0 && props.Essence <= 1 &&
    props.Matter >= 0 && props.Matter <= 1 &&
    props.Substance >= 0 && props.Substance <= 1
  );
}

// Check if an object is a valid ThermodynamicProperties
export function isThermodynamicProperties(obj: unknown): obj is ThermodynamicProperties {
  if (!obj || typeof obj !== 'object') return false;
  
  const thermo = obj as Record<string, unknown>;
  return (
    typeof thermo.heat === 'number' &&
    typeof thermo.entropy === 'number' &&
    typeof thermo.reactivity === 'number' &&
    thermo.heat >= 0 && thermo.heat <= 1 &&
    thermo.entropy >= 0 && thermo.entropy <= 1 &&
    thermo.reactivity >= 0 && thermo.reactivity <= 1
  );
}

// Check if an object is a valid AstrologicalInfluences
export function isAstrologicalInfluences(obj: unknown): obj is AstrologicalInfluences {
  if (!obj || typeof obj !== 'object') return false;
  
  const astro = obj as Record<string, unknown>;
  
  // Check if dominantPlanets is an array of strings
  if (astro.dominantPlanets && !Array.isArray(astro.dominantPlanets)) return false;
  if (astro.dominantPlanets && !astro.dominantPlanets.every((p: unknown) => typeof p === 'string')) return false;
  
  // Check if lunarPhaseEffect is a record of numbers
  if (astro.lunarPhaseEffect && typeof astro.lunarPhaseEffect !== 'object') return false;
  if (astro.lunarPhaseEffect) {
    const lunar = astro.lunarPhaseEffect as Record<string, unknown>;
    for (const key in lunar) {
      if (typeof lunar[key] !== 'number') return false;
    }
  }
  
  return true;
}

// Check if an object is a valid CookingDuration
export function isCookingDuration(obj: unknown): obj is CookingDuration {
  if (!obj || typeof obj !== 'object') return false;
  
  const duration = obj as Record<string, unknown>;
  return (
    typeof duration.min === 'number' &&
    typeof duration.max === 'number' &&
    duration.min >= 0 &&
    duration.max >= duration.min
  );
}

// Check if an object is a valid TemperatureRange
export function isTemperatureRange(obj: unknown): obj is TemperatureRange {
  if (!obj || typeof obj !== 'object') return false;
  
  const temp = obj as Record<string, unknown>;
  return (
    typeof temp.min === 'number' &&
    typeof temp.max === 'number' &&
    typeof temp.unit === 'string' &&
    ['celsius', 'fahrenheit', 'kelvin'].includes(temp.unit) &&
    temp.min >= 0 &&
    temp.max >= temp.min
  );
}

// Check if an object is a valid CookingMethod
export function isCookingMethod(obj: unknown): obj is CookingMethod {
  if (!obj || typeof obj !== 'object') return false;
  
  const method = obj as Record<string, unknown>;
  
  // Required properties
  if (typeof method.id !== 'string' || !method.id) return false;
  if (typeof method.name !== 'string' || !method.name) return false;
  if (typeof method.description !== 'string') return false;
  
  // Optional but type-checked properties
  if (method.elementalEffect && !isElementalEffect(method.elementalEffect)) return false;
  if (method.alchemicalProperties && !isCookingAlchemicalProperties(method.alchemicalProperties)) return false;
  if (method.thermodynamicProperties && !isThermodynamicProperties(method.thermodynamicProperties)) return false;
  if (method.astrologicalInfluences && !isAstrologicalInfluences(method.astrologicalInfluences)) return false;
  if (method.duration && !isCookingDuration(method.duration)) return false;
  
  // Check arrays
  if (method.suitable_for && !Array.isArray(method.suitable_for)) return false;
  if (method.suitable_for && !method.suitable_for.every((item: unknown) => typeof item === 'string')) return false;
  
  if (method.benefits && !Array.isArray(method.benefits)) return false;
  if (method.benefits && !method.benefits.every((item: unknown) => typeof item === 'string')) return false;
  
  return true;
}

/**
 * Validation functions for cooking method data
 */

// Validate a cooking methods object
export function validateCookingMethods(methods: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
  validMethods: Record<string, CookingMethod>;
} {
  const errors: string[] = [];
  const validMethods: Record<string, CookingMethod> = {};
  
  for (const [key, method] of Object.entries(methods)) {
    if (!isCookingMethod(method)) {
      errors.push(`Invalid cooking method: ${key}`);
      continue;
    }
    
    const cookingMethod = method as CookingMethod;
    
    // Additional validation
    if (cookingMethod.score !== undefined && (cookingMethod.score < 0 || cookingMethod.score > 1)) {
      errors.push(`Invalid score for ${key}: must be between 0 and 1`);
    }
    
    if (cookingMethod.duration && cookingMethod.duration.min > cookingMethod.duration.max) {
      errors.push(`Invalid duration for ${key}: min cannot be greater than max`);
    }
    
    validMethods[key] = cookingMethod;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validMethods
  };
}

/**
 * Type-safe utility functions
 */

// Get elemental effect with fallback
export function getElementalEffect(method: CookingMethod): ElementalEffect {
  return method.elementalEffect || method.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
}

// Get alchemical properties with fallback
export function getAlchemicalProperties(method: CookingMethod): CookingAlchemicalProperties {
  return method.alchemicalProperties || {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  };
}

// Get thermodynamic properties with fallback
export function getThermodynamicProperties(method: CookingMethod): ThermodynamicProperties {
  return method.thermodynamicProperties || {
    heat: 0.5,
    entropy: 0.5,
    reactivity: 0.5
  };
}

// Get astrological influences with fallback
export function getAstrologicalInfluences(method: CookingMethod): AstrologicalInfluences {
  return method.astrologicalInfluences || {
    dominantPlanets: [],
    lunarPhaseEffect: {}
  };
}

// Get duration with fallback
export function getDuration(method: CookingMethod): CookingDuration {
  return method.duration || {
    min: 10,
    max: 60
  };
}

// Get suitable ingredients with fallback
export function getSuitableIngredients(method: CookingMethod): string[] {
  return method.suitable_for || [];
}

// Get benefits with fallback
export function getBenefits(method: CookingMethod): string[] {
  return method.benefits || [];
}

/**
 * Type-safe transformation functions
 */

// Transform cooking method to standardized format
export function standardizeCookingMethod(method: unknown): CookingMethod | null {
  if (!isCookingMethod(method)) return null;
  
  const cookingMethod = method as CookingMethod;
  
  return {
    id: cookingMethod.id,
    name: cookingMethod.name,
    description: cookingMethod.description,
    score: cookingMethod.score,
    elementalEffect: getElementalEffect(cookingMethod),
    alchemicalProperties: getAlchemicalProperties(cookingMethod),
    thermodynamicProperties: getThermodynamicProperties(cookingMethod),
    astrologicalInfluences: getAstrologicalInfluences(cookingMethod),
    duration: getDuration(cookingMethod),
    suitable_for: getSuitableIngredients(cookingMethod),
    benefits: getBenefits(cookingMethod),
    // Include other properties as they exist
    ...cookingMethod
  };
}

// Create a type-safe cooking method factory
export function createCookingMethod(
  id: string,
  name: string,
  description: string,
  options: Partial<CookingMethod> = {}
): CookingMethod {
  return {
    id,
    name,
    description,
    elementalEffect: options.elementalEffect || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    alchemicalProperties: options.alchemicalProperties || {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25
    },
    thermodynamicProperties: options.thermodynamicProperties || {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5
    },
    astrologicalInfluences: options.astrologicalInfluences || {
      dominantPlanets: [],
      lunarPhaseEffect: {}
    },
    duration: options.duration || {
      min: 10,
      max: 60
    },
    suitable_for: options.suitable_for || [],
    benefits: options.benefits || [],
    ...options
  };
} 