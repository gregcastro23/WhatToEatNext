import { z } from 'zod';
import { Recipe } from '@/types/recipe';
import type {
  ElementalProperties,
  AstrologicalState,
  ChakraEnergies,
  ZodiacSign,
  LunarPhase,
  Planet,
  Element
} from "@/types/alchemy";
import { PlanetaryPosition } from '@/types/celestial';
import { logger } from './logger';

export const recipeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  regionalCuisine: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string(),
    category: z.string(),
  })),
  mealType: z.array(z.string()),
  season: z.array(z.string()).optional(),
  timeToMake: z.string(),
  elementalProperties: z.object({
    Fire: z.number(),
    Earth: z.number(),
    Air: z.number(),
    Water: z.number(),
  }).optional(),
  properties: z.object({
    light: z.boolean().optional(),
    festive: z.boolean().optional(),
    grounding: z.boolean().optional(),
    comforting: z.boolean().optional(),
    luxurious: z.boolean().optional(),
    transformative: z.boolean().optional(),
  }).optional(),
  nutrition: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    balanced: z.boolean().optional(),
  }).optional(),
  traditional: z.number().optional(),
  popularity: z.number().optional(),
});

export function validateRecipe(recipe: Recipe) {
  return recipeSchema.safeParse(recipe);
}

/**
 * Type guard to check if a value is a valid ElementalProperties object
 * @param props The value to check
 * @returns True if the value is a valid ElementalProperties object
 */
export function isElementalProperties(props: unknown): props is ElementalProperties {
  if (!props || typeof props !== 'object') {
    return false;
  }
  
  const requiredKeys = ['Fire', 'Water', 'Earth', 'Air'];
  for (const key of requiredKeys) {
    if (!(key in (props as Record<string, unknown>)) || 
        typeof (props as Record<string, unknown>)[key] !== 'number') {
      return false;
    }
  }
  
  return true;
}

/**
 * Assert that a value is a valid ElementalProperties object
 * Throws an error if the validation fails
 */
export function validateElementalProperties(props: unknown): asserts props is ElementalProperties {
  if (!isElementalProperties(props)) {
    throw new TypeError('Invalid ElementalProperties: missing required elements or invalid values');
  }
}

/**
 * Type guard to check if a value is a valid ChakraEnergies object
 * @param props The value to check
 * @returns True if the value is a valid ChakraEnergies object
 */
export function isChakraEnergies(props: unknown): props is ChakraEnergies {
  if (!props || typeof props !== 'object') {
    return false;
  }
  
  const requiredKeys = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];
  for (const key of requiredKeys) {
    if (!(key in (props as Record<string, unknown>)) || 
        typeof (props as Record<string, unknown>)[key] !== 'number') {
      return false;
    }
  }
  
  return true;
}

/**
 * Type guard to check if a value is a valid ZodiacSign
 * @param sign The value to check
 * @returns True if the value is a valid ZodiacSign
 */
export function isZodiacSign(sign: unknown): sign is ZodiacSign {
  if (typeof sign !== 'string') {
    return false;
  }
  
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  return validSigns.includes(sign as ZodiacSign);
}

/**
 * Type guard to check if a value is a valid LunarPhase
 * @param phase The value to check
 * @returns True if the value is a valid LunarPhase
 */
export function isLunarPhase(phase: unknown): phase is LunarPhase {
  if (typeof phase !== 'string') {
    return false;
  }
  
  const validPhases: LunarPhase[] = [
    'new moon', 'waxing crescent', 'first quarter', 'waxing gibbous',
    'full moon', 'waning gibbous', 'last quarter', 'waning crescent'
  ];
  
  return validPhases.includes(phase as LunarPhase);
}

/**
 * Type guard to check if a value is a valid Element
 * @param element The value to check
 * @returns True if the value is a valid Element
 */
export function isElement(element: unknown): element is Element {
  if (typeof element !== 'string') {
    return false;
  }
  
  const validElements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  return validElements.includes(element as Element);
}

/**
 * Type guard to check if a value is a valid AstrologicalState
 * @param state The value to check
 * @returns True if the value is a valid AstrologicalState
 */
export function isAstrologicalState(state: unknown): state is AstrologicalState {
  if (!state || typeof state !== 'object') {
    return false;
  }
  
  const stateObj = state as Partial<AstrologicalState>;
  
  if (!stateObj.sunSign || !isZodiacSign(stateObj.sunSign)) {
    return false;
  }
  
  if (!stateObj.moonSign || !isZodiacSign(stateObj.moonSign)) {
    return false;
  }
  
  if (!stateObj.lunarPhase || !isLunarPhase(stateObj.lunarPhase)) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a key is a valid elemental property key
 */
export function isElementalPropertyKey(key: string): key is keyof ElementalProperties {
  return ['Fire', 'Water', 'Earth', 'Air'].includes(key);
}

/**
 * Log unexpected values for debugging
 */
export function logUnexpectedValue(context: string, value: unknown): void {
  logger.warn(`Unexpected value in ${context}:`, value);
}

/**
 * Narrow down unknown positions object to a usable Record
 */
export function narrowPlanetaryPositions(positions: unknown): Record<string, unknown> {
  if (!positions || typeof positions !== 'object') {
    return {};
  }
  
  return positions as Record<string, unknown>;
}

/**
 * Type guard to check if a value is a valid CelestialPosition
 */
export function isValidCelestialPosition(position: unknown): position is CelestialPosition {
  if (!position || typeof position !== 'object') {
    return false;
  }
  
  const pos = position as Partial<CelestialPosition>;
  
  return (
    typeof pos.sign === 'string' &&
    typeof pos.degree === 'number' &&
    typeof pos.exactLongitude === 'number' &&
    typeof pos.isRetrograde === 'boolean'
  );
}

/**
 * Safely validate and return a value or its default
 */
export function validateOrDefault<T>(
  value: unknown, 
  validator: (val: unknown) => val is T,
  defaultValue: T
): T {
  return validator(value) ? value : defaultValue;
}

/**
 * Type guard for checking if an object is a valid Record of string keys
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard for checking if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for checking if a value is a number within a specific range
 */
export function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Type guard for checking if a value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Validate an object has all required properties
 */
export function hasRequiredProperties<T extends object>(
  obj: unknown, 
  requiredProps: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  for (const prop of requiredProps) {
    if (!(prop in (obj as Record<string | symbol, unknown>))) {
      return false;
    }
  }
  
  return true;
}

/**
 * Safely validate a value and provide a default if invalid
 */
export function validateWithFallback<T>(
  value: unknown,
  check: (val: unknown) => boolean,
  fallback: T
): T {
  return check(value) ? value as T : fallback;
}

/**
 * Create a default implementation of a type with all required fields
 */
export function createDefault<T>(template: Partial<T>, requiredDefaults: T): T {
  return { ...requiredDefaults, ...template };
}

/**
 * Check if two objects are structurally equivalent (deep equality check)
 */
export function areStructurallyEqual(obj1: unknown, obj2: unknown): boolean {
  // Handle primitives and references to the same object
  if (obj1 === obj2) return true;
  
  // Check if either value is null or not an object
  if (obj1 === null || obj2 === null || 
      typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }
  
  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    
    for (const i = 0; i < obj1.length; i++) {
      if (!areStructurallyEqual(obj1[i], obj2[i])) return false;
    }
    
    return true;
  }
  
  // Not arrays but objects
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => 
    Object.prototype.hasOwnProperty.call(obj2, key) && 
    areStructurallyEqual((obj1 as any)[key], (obj2 as any)[key])
  );
}

/**
 * Validate a config object against a schema with detailed error reporting
 */
export function validateConfig<T>(config: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(config);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    
    throw new Error(`Invalid configuration: ${errors}`);
  }
  
  return result.data;
}

/**
 * Type guard for checking if an object has a specific method
 */
export function hasMethod<T extends object, M extends keyof T>(
  obj: unknown, 
  methodName: M
): obj is T & { [K in M]: Function } {
  return obj !== null && 
         typeof obj === 'object' && 
         methodName in (obj as object) && 
         typeof (obj as any)[methodName] === 'function';
}

/**
 * Validate that an object is JSON serializable
 */
export function isJsonSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch (e) {
    return false;
  }
} 