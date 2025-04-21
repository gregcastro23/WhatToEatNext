/**
 * Enhanced Type Guards
 * 
 * This module provides comprehensive type guards for complex data structures
 * to ensure type safety throughout the application.
 * 
 * Type guards are functions that perform runtime checks to determine if a value
 * matches a specific TypeScript type, enabling safe type assertions in code.
 * 
 * @module enhancedTypeGuards
 */

import { 
  Element,
  ZodiacSign,
  PlanetName, 
  CookingMethod,
  ElementalProperties,
  MoonPhase,
  MoonPhaseWithSpaces,
  MoonPhaseWithUnderscores,
  LowercaseMoonPhaseWithSpaces,
  LunarPhase,
  MOON_PHASE_MAP,
  MOON_PHASE_TO_DISPLAY
} from '../types';
import { AstrologicalProfile, PlanetaryPosition, PlanetaryAspect } from '../types/astrology';
import { ChakraEnergies } from '../types/alchemy';

/**
 * Type guard to check if a value is a valid Element
 * 
 * @param value - The value to check
 * @returns True if the value is a valid Element, false otherwise
 * 
 * @example
 * ```typescript
 * if (isElement(value)) {
 *   // value is typed as Element here
 *   const elementValue: Element = value;
 * }
 * ```
 */
export function isElement(value: unknown): value is Element {
  if (typeof value !== 'string') return false;
  return ['Fire', 'Water', 'Earth', 'Air'].includes(value);
}

/**
 * Type guard to check if a value is a valid ZodiacSign
 * 
 * @param value - The value to check
 * @returns True if the value is a valid ZodiacSign, false otherwise
 * 
 * @example
 * ```typescript
 * if (isZodiacSign(value)) {
 *   // value is typed as ZodiacSign here
 *   const sign: ZodiacSign = value;
 * }
 * ```
 */
export function isZodiacSign(value: unknown): value is ZodiacSign {
  if (typeof value !== 'string') return false;
  return [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ].includes(value);
}

/**
 * Type guard to check if a value is a valid PlanetName
 * 
 * @param value - The value to check
 * @returns True if the value is a valid PlanetName, false otherwise
 * 
 * @example
 * ```typescript
 * if (isPlanetName(value)) {
 *   // value is typed as PlanetName here
 *   const planet: PlanetName = value;
 * }
 * ```
 */
export function isPlanetName(value: unknown): value is PlanetName {
  if (typeof value !== 'string') return false;
  return [
    'sun', 'moon', 'mercury', 'venus', 'mars', 
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
  ].includes(value);
}

/**
 * Type guard to check if a value is a valid MoonPhase (uppercase with underscores)
 */
export function isMoonPhase(value: unknown): value is MoonPhase {
  if (typeof value !== 'string') return false;
  return [
    'NEW_MOON', 'WAXING_CRESCENT', 'FIRST_QUARTER', 'WAXING_GIBBOUS',
    'FULL_MOON', 'WANING_GIBBOUS', 'LAST_QUARTER', 'WANING_CRESCENT'
  ].includes(value);
}

/**
 * Type guard to check if a value is a valid MoonPhaseWithSpaces
 */
export function isMoonPhaseWithSpaces(value: unknown): value is MoonPhaseWithSpaces {
  if (typeof value !== 'string') return false;
  return [
    'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
  ].includes(value);
}

/**
 * Type guard to check if a value is a valid MoonPhaseWithUnderscores
 */
export function isMoonPhaseWithUnderscores(value: unknown): value is MoonPhaseWithUnderscores {
  if (typeof value !== 'string') return false;
  return [
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
  ].includes(value);
}

/**
 * Type guard to check if a value is a valid LowercaseMoonPhaseWithSpaces
 */
export function isLowercaseMoonPhaseWithSpaces(value: unknown): value is LowercaseMoonPhaseWithSpaces {
  if (typeof value !== 'string') return false;
  return [
    'new moon', 'waxing crescent', 'first quarter', 'waxing gibbous',
    'full moon', 'waning gibbous', 'last quarter', 'waning crescent'
  ].includes(value);
}

/**
 * Type guard to check if a value is a valid LunarPhase
 * 
 * @param value - The value to check
 * @returns True if the value is a valid LunarPhase, false otherwise
 * 
 * @example
 * ```typescript
 * if (isLunarPhase(value)) {
 *   // value is typed as LunarPhase here
 *   const phase: LunarPhase = value;
 * }
 * ```
 */
export function isLunarPhase(value: unknown): value is LunarPhase {
  return isLowercaseMoonPhaseWithSpaces(value);
}

/**
 * Type guard to check if a value is a valid CookingMethod
 * 
 * @param value - The value to check
 * @returns True if the value is a valid CookingMethod, false otherwise
 * 
 * @example
 * ```typescript
 * if (isCookingMethod(value)) {
 *   // value is typed as CookingMethod here
 *   const method: CookingMethod = value;
 * }
 * ```
 */
export function isCookingMethod(value: unknown): value is CookingMethod {
  if (typeof value !== 'string') return false;
  return [
    'baking', 'boiling', 'roasting', 'steaming', 'frying',
    'grilling', 'sauteing', 'simmering', 'poaching', 'braising', 
    'stir-frying', 'fermenting', 'pickling', 'curing', 'infusing',
    'distilling', 'raw', 'fermentation', 'smoking', 'sous_vide',
    'pressure_cooking', 'spherification', 'cryo_cooking', 
    'emulsification', 'gelification', 'broiling'
  ].includes(value);
}

/**
 * Type guard for checking if an object is a valid ElementalProperties
 * 
 * Valid ElementalProperties must contain numeric values for all four elements:
 * Fire, Water, Earth, and Air.
 * 
 * @param obj - The object to check
 * @returns True if the object is a valid ElementalProperties, false otherwise
 * 
 * @example
 * ```typescript
 * if (isElementalProperties(obj)) {
 *   // obj is typed as ElementalProperties here
 *   const fire: number = obj.Fire;
 * }
 * ```
 */
export function isElementalProperties(obj: unknown): obj is ElementalProperties {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const props = obj as Record<string, unknown>;
  
  // Check required elemental properties
  return (
    typeof props['Fire'] === 'number' &&
    typeof props['Water'] === 'number' &&
    typeof props['Earth'] === 'number' &&
    typeof props['Air'] === 'number'
  );
}

/**
 * Type guard for PlanetaryPosition
 * 
 * A valid PlanetaryPosition must have a planet name, zodiac sign, and degree.
 * It may optionally have an isRetrograde flag.
 * 
 * @param obj - The object to check
 * @returns True if the object is a valid PlanetaryPosition, false otherwise
 * 
 * @example
 * ```typescript
 * if (isPlanetaryPosition(obj)) {
 *   // obj is typed as PlanetaryPosition here
 *   const planetInSign = `${obj.planet} in ${obj.sign} at ${obj.degree}°`;
 * }
 * ```
 */
export function isPlanetaryPosition(obj: unknown): obj is PlanetaryPosition {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const pos = obj as Record<string, unknown>;
  
  return (
    typeof pos.planet === 'string' &&
    isZodiacSign(pos.sign) &&
    typeof pos.degree === 'number' &&
    (pos.isRetrograde === undefined || typeof pos.isRetrograde === 'boolean')
  );
}

/**
 * Type guard for PlanetaryAspect
 * 
 * A valid PlanetaryAspect must have two planets, an aspect type, an orb value,
 * and an influence type.
 * 
 * @param obj - The object to check
 * @returns True if the object is a valid PlanetaryAspect, false otherwise
 * 
 * @example
 * ```typescript
 * if (isPlanetaryAspect(obj)) {
 *   // obj is typed as PlanetaryAspect here
 *   const aspectDescription = `${obj.planetA} ${obj.aspect} ${obj.planetB}`;
 * }
 * ```
 */
export function isPlanetaryAspect(obj: unknown): obj is PlanetaryAspect {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const aspect = obj as Record<string, unknown>;
  const validInfluences = ['harmonious', 'challenging', 'neutral'];
  
  return (
    typeof aspect.planetA === 'string' &&
    typeof aspect.planetB === 'string' &&
    typeof aspect.aspect === 'string' &&
    typeof aspect.orb === 'number' &&
    typeof aspect.influence === 'string' &&
    validInfluences.includes(aspect.influence as string)
  );
}

/**
 * Type guard for AstrologicalProfile
 * 
 * A valid AstrologicalProfile can contain zodiac influences, lunar phase influences,
 * planetary positions, and planetary aspects, all of which are optional.
 * 
 * @param obj - The object to check
 * @returns True if the object is a valid AstrologicalProfile, false otherwise
 * 
 * @example
 * ```typescript
 * if (isAstrologicalProfile(obj)) {
 *   // obj is typed as AstrologicalProfile here
 *   if (obj.zodiac) {
 *     // Access zodiac influences
 *   }
 * }
 * ```
 */
export function isAstrologicalProfile(obj: unknown): obj is AstrologicalProfile {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const profile = obj as Record<string, unknown>;
  
  // Check each optional property if it exists
  if (profile.zodiac !== undefined) {
    if (!Array.isArray(profile.zodiac)) return false;
    if (!profile.zodiac.every(sign => isZodiacSign(sign))) return false;
  }
  
  if (profile.lunar !== undefined) {
    if (!Array.isArray(profile.lunar)) return false;
    if (!profile.lunar.every(phase => isLunarPhase(phase))) return false;
  }
  
  if (profile.planetary !== undefined) {
    if (!Array.isArray(profile.planetary)) return false;
    if (!profile.planetary.every(pos => isPlanetaryPosition(pos))) return false;
  }
  
  if (profile.aspects !== undefined) {
    if (!Array.isArray(profile.aspects)) return false;
    if (!profile.aspects.every(aspect => isPlanetaryAspect(aspect))) return false;
  }
  
  return true;
}

/**
 * Type guard for checking if a value is a valid ChakraEnergies object
 * 
 * A valid ChakraEnergies object must have numeric values for all seven chakras:
 * root, sacral, solarPlexus, heart, throat, brow, and crown.
 * 
 * @param obj - The object to check
 * @returns True if the object is a valid ChakraEnergies, false otherwise
 * 
 * @example
 * ```typescript
 * if (isChakraEnergies(obj)) {
 *   // obj is typed as ChakraEnergies here
 *   const heartEnergy: number = obj.heart;
 * }
 * ```
 */
export function isChakraEnergies(obj: unknown): obj is ChakraEnergies {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const chakras = obj as Record<string, unknown>;
  const validChakras = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'brow', 'crown'];
  
  // Check if all required chakras are present and have numeric values
  return validChakras.every(
    chakra => typeof chakras[chakra] === 'number' && !isNaN(chakras[chakra] as number)
  );
}

/**
 * Type guard for Record with specific key and value types
 * 
 * @template K - The type of keys in the record
 * @template V - The type of values in the record
 * @param obj - The object to check
 * @param keyGuard - Function to validate each key
 * @param valueGuard - Function to validate each value
 * @returns True if the object is a valid Record<K, V>, false otherwise
 * 
 * @example
 * ```typescript
 * const isPlanetKey = (key: string): key is PlanetName => isPlanetName(key);
 * const isNumberValue = (value: unknown): value is number => typeof value === 'number';
 * 
 * if (isRecordOf(obj, isPlanetKey, isNumberValue)) {
 *   // obj is typed as Record<PlanetName, number> here
 *   const sunValue: number = obj.sun;
 * }
 * ```
 */
export function isRecordOf<K extends string | number | symbol, V>(
  obj: unknown,
  keyGuard: (key: string) => key is K,
  valueGuard: (value: unknown) => value is V
): obj is Record<K, V> {
  if (typeof obj !== 'object' || obj === null) return false;
  
  return Object.entries(obj as Record<string, unknown>).every(
    ([key, value]) => keyGuard(key) && valueGuard(value)
  );
}

/**
 * Type guard for arrays of specific type
 * 
 * @template T - The type of items in the array
 * @param arr - The array to check
 * @param itemGuard - Function to validate each item
 * @returns True if the array contains only items of type T, false otherwise
 * 
 * @example
 * ```typescript
 * if (isArrayOf(arr, isPlanetaryPosition)) {
 *   // arr is typed as PlanetaryPosition[] here
 *   const planets = arr.map(pos => pos.planet);
 * }
 * ```
 */
export function isArrayOf<T>(
  arr: unknown,
  itemGuard: (item: unknown) => item is T
): arr is T[] {
  if (!Array.isArray(arr)) return false;
  return arr.every(item => itemGuard(item));
}

/**
 * Type guard for checking if a value is a valid ISO date string
 * 
 * @param value - The value to check
 * @returns True if the value is a valid ISO date string, false otherwise
 * 
 * @example
 * ```typescript
 * if (isISODateString(value)) {
 *   // value is confirmed to be an ISO date string
 *   const date = new Date(value);
 * }
 * ```
 */
export function isISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return isoDateRegex.test(value);
}

/**
 * Type guard for checking if an object has all required properties
 * 
 * @template T - The expected type of the object
 * @param obj - The object to check
 * @param requiredProps - Array of required property keys
 * @returns True if the object has all required properties, false otherwise
 * 
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 * 
 * if (hasRequiredProperties<User>(obj, ['id', 'name', 'email'])) {
 *   // obj is typed as User here
 *   const userName: string = obj.name;
 * }
 * ```
 */
export function hasRequiredProperties<T extends object>(
  obj: unknown,
  requiredProps: (keyof T)[]
): obj is T {
  if (typeof obj !== 'object' || obj === null) return false;
  
  return requiredProps.every(prop => 
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

/**
 * Type guard for validating nested object structures
 * 
 * This function recursively checks objects and arrays to find values
 * that match the validator function. It reports the path to any invalid items.
 * 
 * @template T - The expected type of the object
 * @param obj - The object to validate
 * @param validator - Function to validate each object
 * @param path - Current path in the object structure (for internal use)
 * @returns Validation result with valid flag and error information
 * 
 * @example
 * ```typescript
 * const result = validateNestedObject(
 *   { users: [{ id: 1 }, { name: 'Invalid' }] },
 *   (obj): obj is User => typeof obj.id === 'number' && typeof obj.name === 'string'
 * );
 * 
 * if (!result.valid) {
 *   console.error(`Validation failed at: ${result.path.join('.')}`);
 * }
 * ```
 */
export function validateNestedObject<T>(
  obj: unknown,
  validator: (innerObj: unknown) => innerObj is T,
  path: string[] = []
): { valid: boolean; path?: string[]; message?: string } {
  if (typeof obj !== 'object' || obj === null) {
    return { 
      valid: false, 
      path, 
      message: `Expected object at path [${path.join('.')}], got ${typeof obj}` 
    };
  }
  
  // If this is an array, validate each element
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = validateNestedObject(
        obj[i],
        validator,
        [...path, i.toString()]
      );
      if (!result.valid) return result;
    }
    return { valid: true };
  }
  
  // If this is a plain object, validate it
  if (validator(obj)) {
    return { valid: true };
  }
  
  // If not valid, check its properties recursively
  const plainObj = obj as Record<string, unknown>;
  for (const [key, value] of Object.entries(plainObj)) {
    if (typeof value === 'object' && value !== null) {
      const result = validateNestedObject(
        value,
        validator,
        [...path, key]
      );
      if (!result.valid) return result;
    }
  }
  
  return { valid: true };
} 