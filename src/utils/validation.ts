import { z } from 'zod';
import type { Recipe } from '../types/recipe';
import {
  Element,
  ELEMENT_MAP,
  ZodiacSign,
  ZODIAC_MAP,
  PlanetName,
  PLANET_MAP,
  Season,
  SEASON_MAP,
  LunarPhase,
  LUNAR_PHASE_MAP,
  CookingMethod,
  COOKING_METHOD_MAP
} from '../types/constants';

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
 * Type guard to check if a value is a valid Element
 */
export function isElement(value: unknown): value is Element {
  if (typeof value !== 'string') {
    return false;
  }
  return Object.values(Element).includes(value as Element);
}

/**
 * Normalizes an element string to the standardized Element enum
 * @param value Any string that might represent an element
 * @returns The standardized Element or undefined if invalid
 */
export function normalizeElement(value: string | unknown): Element | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return ELEMENT_MAP[value];
}

/**
 * Type guard to check if a value is a valid ZodiacSign
 */
export function isZodiacSign(value: unknown): value is ZodiacSign {
  if (typeof value !== 'string') {
    return false;
  }
  return Object.values(ZodiacSign).includes(value as ZodiacSign);
}

/**
 * Normalizes a zodiac sign string to the standardized ZodiacSign enum
 * @param value Any string that might represent a zodiac sign
 * @returns The standardized ZodiacSign or undefined if invalid
 */
export function normalizeZodiacSign(value: string | unknown): ZodiacSign | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return ZODIAC_MAP[value];
}

/**
 * Type guard to check if a value is a valid PlanetName
 */
export function isPlanetName(value: unknown): value is PlanetName {
  if (typeof value !== 'string') {
    return false;
  }
  return Object.values(PlanetName).includes(value as PlanetName);
}

/**
 * Normalizes a planet name string to the standardized PlanetName enum
 * @param value Any string that might represent a planet name
 * @returns The standardized PlanetName or undefined if invalid
 */
export function normalizePlanetName(value: string | unknown): PlanetName | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return PLANET_MAP[value];
}

/**
 * Type guard to check if a value is a valid Season
 */
export function isSeason(value: unknown): value is Season {
  if (typeof value !== 'string') {
    return false;
  }
  return Object.values(Season).includes(value as Season);
}

/**
 * Normalizes a season string to the standardized Season enum
 * @param value Any string that might represent a season
 * @returns The standardized Season or undefined if invalid
 */
export function normalizeSeason(value: string | unknown): Season | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return SEASON_MAP[value];
}

/**
 * Type guard to check if a value is a valid LunarPhase
 */
export function isLunarPhase(value: unknown): value is LunarPhase {
  if (typeof value !== 'string') {
    return false;
  }
  return Object.values(LunarPhase).includes(value as LunarPhase);
}

/**
 * Normalizes a lunar phase string to the standardized LunarPhase enum
 * @param value Any string that might represent a lunar phase
 * @returns The standardized LunarPhase or undefined if invalid
 */
export function normalizeLunarPhase(value: string | unknown): LunarPhase | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return LUNAR_PHASE_MAP[value];
}

/**
 * Type guard to check if a value is a valid CookingMethod
 */
export function isCookingMethod(value: unknown): value is CookingMethod {
  if (typeof value !== 'string') {
    return false;
  }
  return Object.values(CookingMethod).includes(value as CookingMethod);
}

/**
 * Normalizes a cooking method string to the standardized CookingMethod enum
 * @param value Any string that might represent a cooking method
 * @returns The standardized CookingMethod or undefined if invalid
 */
export function normalizeCookingMethod(value: string | unknown): CookingMethod | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return COOKING_METHOD_MAP[value];
}

/**
 * Validates and normalizes an array of elements
 * @param values Array of potential element strings
 * @returns Array of validated Elements, filtering out invalid ones
 */
export function normalizeElements(values: unknown[]): Element[] {
  if (!Array.isArray(values)) {
    return [];
  }
  
  return values
    .map(val => typeof val === 'string' ? normalizeElement(val) : undefined)
    .filter((val): val is Element => val !== undefined);
}

/**
 * Validates and normalizes an array of zodiac signs
 * @param values Array of potential zodiac sign strings
 * @returns Array of validated ZodiacSigns, filtering out invalid ones
 */
export function normalizeZodiacSigns(values: unknown[]): ZodiacSign[] {
  if (!Array.isArray(values)) {
    return [];
  }
  
  return values
    .map(val => typeof val === 'string' ? normalizeZodiacSign(val) : undefined)
    .filter((val): val is ZodiacSign => val !== undefined);
}

/**
 * Validates and normalizes an array of planet names
 * @param values Array of potential planet name strings
 * @returns Array of validated PlanetNames, filtering out invalid ones
 */
export function normalizePlanetNames(values: unknown[]): PlanetName[] {
  if (!Array.isArray(values)) {
    return [];
  }
  
  return values
    .map(val => typeof val === 'string' ? normalizePlanetName(val) : undefined)
    .filter((val): val is PlanetName => val !== undefined);
}

/**
 * Validates and normalizes an array of seasons
 * @param values Array of potential season strings
 * @returns Array of validated Seasons, filtering out invalid ones
 */
export function normalizeSeasons(values: unknown[]): Season[] {
  if (!Array.isArray(values)) {
    return [];
  }
  
  return values
    .map(val => typeof val === 'string' ? normalizeSeason(val) : undefined)
    .filter((val): val is Season => val !== undefined);
}

/**
 * Validates and normalizes an array of lunar phases
 * @param values Array of potential lunar phase strings
 * @returns Array of validated LunarPhases, filtering out invalid ones
 */
export function normalizeLunarPhases(values: unknown[]): LunarPhase[] {
  if (!Array.isArray(values)) {
    return [];
  }
  
  return values
    .map(val => typeof val === 'string' ? normalizeLunarPhase(val) : undefined)
    .filter((val): val is LunarPhase => val !== undefined);
}

/**
 * Validates and normalizes a record of element properties
 * @param properties Record of element properties
 * @returns Validated ElementalProperties with standardized element names
 */
export function normalizeElementalProperties(
  properties: Record<string, number> | undefined
): Record<Element, number> {
  const result: Partial<Record<Element, number>> = {};
  
  if (!properties || typeof properties !== 'object') {
    // Default to all zeros if no properties provided
    Object.values(Element).forEach(element => {
      result[element] = 0;
    });
    return result as Record<Element, number>;
  }
  
  // Initialize with zeros for all elements
  Object.values(Element).forEach(element => {
    result[element] = 0;
  });
  
  // Populate with values from the input properties
  Object.entries(properties).forEach(([key, value]) => {
    const element = normalizeElement(key);
    if (element && typeof value === 'number') {
      result[element] = value;
    }
  });
  
  return result as Record<Element, number>;
}

/**
 * Checks if an object has all required ElementalProperties
 */
export function hasValidElementalProperties(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const requiredElements = [Element.Fire, Element.Water, Element.Earth, Element.Air];
  return requiredElements.every(element => {
    const key = element as string;
    return key in obj && typeof (obj as Record<string, unknown>)[key] === 'number';
  });
}

/**
 * Type guard for Recipe object
 */
export function isRecipe(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  // Check required fields
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.ingredients) &&
    (typeof obj.cookingMethod === 'string' || obj.cookingMethod === undefined)
  );
}

/**
 * Type guard for Ingredient object
 */
export function isIngredient(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  // Check required fields
  return (
    typeof obj.name === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.unit === 'string'
  );
} 