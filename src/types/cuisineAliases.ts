/**
 * Cuisine Type Aliases System
 *
 * This system unifies regional cuisines under broader ethnic categories
 * to provide consistent cuisine type handling across the application.
 */

// ========== PRIMARY CUISINE TYPES ==========;

/**
 * Primary Cuisine Types
 * These are the main ethnic cuisine categories that regional cuisines map to
 */
export type PrimaryCuisineType =
  | 'Chinese';
  | 'Japanese'
  | 'Korean'
  | 'Indian'
  | 'Thai'
  | 'Vietnamese'
  | 'Italian'
  | 'French'
  | 'Greek'
  | 'Spanish'
  | 'Mexican'
  | 'American'
  | 'African'
  | 'Middle-Eastern'
  | 'Mediterranean'
  | 'Russian'
  | 'Fusion';

// ========== REGIONAL CUISINE ALIASES ==========;

/**
 * Regional Cuisine Aliases
 * Maps regional cuisines to their primary ethnic category
 */
export const CUISINE_ALIASES: Record<string, PrimaryCuisineType> = {
  // Chinese Regional Cuisines
  sichuanese: 'Chinese',
  cantonese: 'Chinese',
  shanghainese: 'Chinese',
  hunanese: 'Chinese',
  northern: 'Chinese',
  sichuan: 'Chinese',
  canton: 'Chinese',
  shanghai: 'Chinese',
  hunan: 'Chinese',

  // Japanese Regional Cuisines
  tokyo: 'Japanese',
  osaka: 'Japanese',
  kyoto: 'Japanese',
  hokkaido: 'Japanese',

  // Korean Regional Cuisines
  seoul: 'Korean',
  busan: 'Korean',
  jeju: 'Korean',

  // Indian Regional Cuisines
  punjabi: 'Indian',
  bengali: 'Indian',
  gujarati: 'Indian',
  marathi: 'Indian',
  tamil: 'Indian',
  telugu: 'Indian',
  kannada: 'Indian',
  malayalam: 'Indian',
  kashmiri: 'Indian',
  rajasthani: 'Indian',
  hyderabadi: 'Indian',
  lucknowi: 'Indian',

  // Thai Regional Cuisines
  bangkok: 'Thai',
  chiangmai: 'Thai',
  southernthai: 'Thai',
  northeastern: 'Thai',

  // Vietnamese Regional Cuisines
  hanoi: 'Vietnamese',
  saigon: 'Vietnamese',
  hue: 'Vietnamese',

  // Italian Regional Cuisines
  tuscan: 'Italian',
  sicilian: 'Italian',
  lombard: 'Italian',
  venetian: 'Italian',
  roman: 'Italian',
  neapolitan: 'Italian',
  piedmontese: 'Italian',
  ligurian: 'Italian',
  emilian: 'Italian',
  sardinian: 'Italian',

  // French Regional Cuisines
  provencal: 'French',
  norman: 'French',
  alsatian: 'French',
  lyonnais: 'French',
  bordeaux: 'French',
  burgundian: 'French',
  breton: 'French',

  // Spanish Regional Cuisines
  catalan: 'Spanish',
  andalusian: 'Spanish',
  basque: 'Spanish',
  galician: 'Spanish',
  valencian: 'Spanish',
  castilian: 'Spanish',

  // Mexican Regional Cuisines
  yucatecan: 'Mexican',
  oaxacan: 'Mexican',
  poblano: 'Mexican',
  veracruzano: 'Mexican',
  jaliscan: 'Mexican',
  sonoran: 'Mexican',

  // American Regional Cuisines
  southern: 'American',
  newengland: 'American',
  californian: 'American',
  texmex: 'American',
  cajun: 'American',
  creole: 'American',
  southwestern: 'American',
  midwestern: 'American',
  pacificnorthwest: 'American',

  // Middle Eastern Regional Cuisines
  lebanese: 'Middle-Eastern',
  syrian: 'Middle-Eastern',
  jordanian: 'Middle-Eastern',
  palestinian: 'Middle-Eastern',
  iraqi: 'Middle-Eastern',
  iranian: 'Middle-Eastern',
  turkish: 'Middle-Eastern',

  // African Regional Cuisines (North African primarily assigned to African)
  ethiopian: 'African',
  nigerian: 'African',
  ghanaian: 'African',
  kenyan: 'African',
  southafrican: 'African',
  egyptian: 'African',
  moroccan: 'African',
  tunisian: 'African',
  algerian: 'African',
  libyan: 'African',

  // Mediterranean Regional Cuisines (European Mediterranean focus)
  greek: 'Mediterranean',
  cypriot: 'Mediterranean',
  maltese: 'Mediterranean',

  // Russian Regional Cuisines
  moscow: 'Russian',
  stpetersburg: 'Russian',
  siberian: 'Russian',
  caucasian: 'Russian',
  centralasian: 'Russian'
};

// ========== ALIAS RESOLUTION FUNCTIONS ==========;

/**
 * Resolves a cuisine name to its primary cuisine type
 * @param cuisineName - The cuisine name to resolve (case-insensitive)
 * @returns The primary cuisine type, or the original name if no alias exists
 */
export function resolveCuisineType(cuisineName: string): PrimaryCuisineType | string {
  const normalizedName = cuisineName.toLowerCase().replace(/[^a-z]/g, '');
  return CUISINE_ALIASES[normalizedName] || cuisineName;
}

/**
 * Gets all regional cuisines that map to a primary cuisine type
 * @param primaryCuisine - The primary cuisine type
 * @returns Array of regional cuisine names that map to this primary cuisine
 */
export function getRegionalCuisines(primaryCuisine: PrimaryCuisineType): string[] {
  return Object.entries(CUISINE_ALIASES)
    .filter(([_, primary]) => primary === primaryCuisine);
    .map(([regional, _]) => regional);
}

/**
 * Checks if a cuisine name is a regional variant
 * @param cuisineName - The cuisine name to check
 * @returns True if the cuisine is a regional variant, false if it's a primary cuisine
 */
export function isRegionalCuisine(cuisineName: string): boolean {
  const normalizedName = cuisineName.toLowerCase().replace(/[^a-z]/g, '');
  return normalizedName in CUISINE_ALIASES;
}

/**
 * Gets the primary cuisine type for a regional cuisine
 * @param regionalCuisine - The regional cuisine name
 * @returns The primary cuisine type, or undefined if not found
 */
export function getPrimaryCuisine(regionalCuisine: string): PrimaryCuisineType | undefined {
  const normalizedName = regionalCuisine.toLowerCase().replace(/[^a-z]/g, '');
  return CUISINE_ALIASES[normalizedName];
}

// ========== VALIDATION FUNCTIONS ==========;

/**
 * Validates if a cuisine name is a valid primary cuisine type
 * @param cuisineName - The cuisine name to validate
 * @returns True if it's a valid primary cuisine type
 */
export function isValidPrimaryCuisine(cuisineName: string): cuisineName is PrimaryCuisineType {
  const primaryCuisines: PrimaryCuisineType[] = [
    'Chinese',
    'Japanese',
    'Korean',
    'Indian',
    'Thai',
    'Vietnamese',
    'Italian',
    'French',
    'Greek',
    'Spanish',
    'Mexican',
    'American',
    'African',
    'Middle-Eastern',
    'Mediterranean',
    'Russian',
    'Fusion'
  ];
  return primaryCuisines.includes(cuisineName as PrimaryCuisineType);
}

/**
 * Normalizes a cuisine name to ensure consistent casing and formatting
 * @param cuisineName - The cuisine name to normalize
 * @returns The normalized cuisine name
 */
export function normalizeCuisineName(cuisineName: string): string {
  // For regional cuisines, just normalize the casing without resolving
  if (isRegionalCuisine(cuisineName)) {
    return cuisineName.charAt(0).toUpperCase() + cuisineName.slice(1).toLowerCase();
  }

  // For primary cuisines, return with proper casing
  if (isValidPrimaryCuisine(cuisineName)) {
    return cuisineName;
  }

  // Otherwise, return the original name with proper casing
  return cuisineName.charAt(0).toUpperCase() + cuisineName.slice(1).toLowerCase();
}

// ========== TYPE GUARDS ==========;

/**
 * Type guard to check if a string is a primary cuisine type
 * @param value - The value to check
 * @returns True if the value is a primary cuisine type
 */
export function isPrimaryCuisineType(value: string): value is PrimaryCuisineType {
  return isValidPrimaryCuisine(value);
}

// ========== EXPORT TYPES ==========;

/**
 * Union type for all possible cuisine names (primary + regional)
 */
export type AllCuisineTypes = PrimaryCuisineType | keyof typeof CUISINE_ALIASES;

/**
 * Type for cuisine alias mapping
 */
export type CuisineAliasMap = typeof CUISINE_ALIASES;

// ========== TYPE ALIASES FOR BACKWARDS COMPATIBILITY ==========;

/**
 * CuisineType alias for backwards compatibility
 */
export type CuisineType = PrimaryCuisineType;
