import type { PrimaryCuisineType } from '@/types/cuisineAliases';
import type {
  CompleteCuisineType,
  ContinentalCuisineType,
  CuisineCompatibility,
  DietaryCuisineType,
  FusionCuisineType,
  HistoricalCuisineType,
  RegionalCuisineType,
  StreetFoodCuisineType
} from '@/types/culinary';
import { CUISINE_CATEGORY_MAP } from '@/types/culinary';

/**
 * Cuisine Type Utilities
 * Comprehensive helper functions for working with the enhanced cuisine type system
 */

// ========== CUISINE CATEGORIZATION ==========

/**
 * Get the continental category for a cuisine type
 */
export function getCuisineContinent(cuisine: CompleteCuisineType): ContinentalCuisineType | string {
  return CUISINE_CATEGORY_MAP[cuisine] || 'Other';
}

/**
 * Check if a cuisine is a primary cuisine type
 */
export function isPrimaryCuisine(cuisine: CompleteCuisineType): cuisine is PrimaryCuisineType {
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
  return primaryCuisines.includes(cuisine as PrimaryCuisineType);
}

/**
 * Check if a cuisine is a regional variation
 */
export function isRegionalCuisine(cuisine: CompleteCuisineType): cuisine is RegionalCuisineType {
  const regionalCuisines: RegionalCuisineType[] = [
    // Chinese Regional
    'Sichuan',
    'Cantonese',
    'Shanghai',
    'Hunan',
    'Northern',
    // Japanese Regional
    'Tokyo',
    'Osaka',
    'Kyoto',
    'Hokkaido',
    // Korean Regional
    'Seoul',
    'Busan',
    'Jeju',
    // Indian Regional
    'Punjabi',
    'Bengali',
    'Gujarati',
    'Marathi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Kashmiri',
    'Rajasthani',
    'Hyderabadi',
    'Lucknowi',
    // Thai Regional
    'Bangkok',
    'Chiangmai',
    'SouthernThai',
    'Northeastern',
    // Vietnamese Regional
    'Hanoi',
    'Saigon',
    'Hue',
    // Italian Regional
    'Tuscan',
    'Sicilian',
    'Lombard',
    'Venetian',
    'Roman',
    'Neapolitan',
    'Piedmontese',
    'Ligurian',
    'Emilian',
    'Sardinian',
    // French Regional
    'Provencal',
    'Norman',
    'Alsatian',
    'Lyonnais',
    'Bordeaux',
    'Burgundian',
    'Breton',
    // Spanish Regional
    'Catalan',
    'Andalusian',
    'Basque',
    'Galician',
    'Valencian',
    'Castilian',
    // Mexican Regional
    'Yucatecan',
    'Oaxacan',
    'Poblano',
    'Veracruzano',
    'Jaliscan',
    'Sonoran',
    // American Regional
    'Southern',
    'NewEngland',
    'Californian',
    'TexMex',
    'Cajun',
    'Creole',
    'Southwestern',
    'Midwestern',
    'PacificNorthwest',
    // Middle Eastern Regional
    'Lebanese',
    'Syrian',
    'Jordanian',
    'Palestinian',
    'Iraqi',
    'Iranian',
    'Turkish',
    'Egyptian',
    'Moroccan',
    'Tunisian',
    'Algerian',
    'Libyan',
    // African Regional
    'Ethiopian',
    'Nigerian',
    'Ghanaian',
    'Kenyan',
    'SouthAfrican',
    // Mediterranean Regional
    'Greek' as RegionalCuisineType,
    'Cypriot',
    'Maltese',
    // Russian Regional
    'Moscow',
    'StPetersburg',
    'Siberian',
    'Caucasian',
    'CentralAsian'
  ];
  return regionalCuisines.includes(cuisine as RegionalCuisineType);
}

/**
 * Check if a cuisine is a fusion cuisine
 */
export function isFusionCuisine(cuisine: CompleteCuisineType): cuisine is FusionCuisineType {
  const fusionCuisines: FusionCuisineType[] = [
    'Asian-Fusion',
    'Mediterranean-Fusion',
    'Latin-Fusion',
    'Modern-American',
    'Contemporary-European',
    'Global-Fusion',
    'Molecular-Gastronomy',
    'Farm-to-Table',
    'New-American',
    'California-Cuisine',
    'Pacific-Rim',
    'Caribbean-Fusion'
  ];
  return fusionCuisines.includes(cuisine as FusionCuisineType);
}

/**
 * Check if a cuisine is a dietary cuisine
 */
export function isDietaryCuisine(cuisine: CompleteCuisineType): cuisine is DietaryCuisineType {
  const dietaryCuisines: DietaryCuisineType[] = [
    'Vegetarian',
    'Vegan',
    'Raw-Food',
    'Gluten-Free',
    'Dairy-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
    'Whole30',
    'Plant-Based',
    'Mediterranean-Diet',
    'DASH-Diet'
  ];
  return dietaryCuisines.includes(cuisine as DietaryCuisineType);
}

/**
 * Check if a cuisine is a historical cuisine
 */
export function isHistoricalCuisine(
  cuisine: CompleteCuisineType
): cuisine is HistoricalCuisineType {
  const historicalCuisines: HistoricalCuisineType[] = [
    'Ancient-Roman',
    'Medieval-European',
    'Renaissance-Italian',
    'Victorian-English',
    'Colonial-American',
    'Ancient-Chinese',
    'Classical-Greek',
    'Ancient-Egyptian',
    'Moorish-Spanish',
    'Ottoman-Turkish'
  ];
  return historicalCuisines.includes(cuisine as HistoricalCuisineType);
}

/**
 * Check if a cuisine is a street food cuisine
 */
export function isStreetFoodCuisine(
  cuisine: CompleteCuisineType
): cuisine is StreetFoodCuisineType {
  const streetFoodCuisines: StreetFoodCuisineType[] = [
    'Street-Food-Asian',
    'Street-Food-Mexican',
    'Street-Food-Indian',
    'Street-Food-Middle-Eastern',
    'Street-Food-American',
    'Street-Food-European',
    'Food-Truck',
    'Fast-Casual',
    'Comfort-Food',
    'Pub-Food',
    'Diner-Food',
    'Barbecue'
  ];
  return streetFoodCuisines.includes(cuisine as StreetFoodCuisineType);
}

// ========== CUISINE COMPATIBILITY ==========

/**
 * Calculate compatibility between two cuisines
 */
export function calculateCuisineCompatibility(
  cuisine1: CompleteCuisineType,
  cuisine2: CompleteCuisineType
): number {
  // Same cuisine = perfect compatibility
  if (cuisine1 === cuisine2) return 1.0;
  // Same continental category = high compatibility
  const continent1 = getCuisineContinent(cuisine1);
  const continent2 = getCuisineContinent(cuisine2);
  if (continent1 === continent2) return 0.8;
  // Regional variations of same primary cuisine = very high compatibility
  if (isRegionalCuisine(cuisine1) && isRegionalCuisine(cuisine2)) {
    const primary1 = getPrimaryCuisineFromRegional(cuisine1);
    const primary2 = getPrimaryCuisineFromRegional(cuisine2);
    if (primary1 === primary2) return 0.9;
  }

  // Fusion cuisines with shared elements = moderate compatibility
  if (isFusionCuisine(cuisine1) || isFusionCuisine(cuisine2)) {
    return 0.6;
  }

  // Dietary cuisines can work with most others = moderate compatibility
  if (isDietaryCuisine(cuisine1) || isDietaryCuisine(cuisine2)) {
    return 0.7;
  }

  // Historical cuisines = lower compatibility with modern cuisines
  if (isHistoricalCuisine(cuisine1) || isHistoricalCuisine(cuisine2)) {
    return 0.4;
  }

  // Street food cuisines = moderate compatibility
  if (isStreetFoodCuisine(cuisine1) || isStreetFoodCuisine(cuisine2)) {
    return 0.6;
  }

  // Default moderate compatibility
  return 0.5;
}

/**
 * Get primary cuisine from regional cuisine
 */
export function getPrimaryCuisineFromRegional(_regional: RegionalCuisineType): PrimaryCuisineType {
  const regionalToPrimary = {
    // Chinese Regional
    Sichuan: 'Chinese',
    Cantonese: 'Chinese',
    Shanghai: 'Chinese',
    Hunan: 'Chinese',
    Northern: 'Chinese',
    // Japanese Regional
    Tokyo: 'Japanese',
    Osaka: 'Japanese',
    Kyoto: 'Japanese',
    Hokkaido: 'Japanese',
    // Korean Regional
    Seoul: 'Korean',
    Busan: 'Korean',
    Jeju: 'Korean',
    // Indian Regional
    Punjabi: 'Indian',
    Bengali: 'Indian',
    Gujarati: 'Indian',
    Marathi: 'Indian',
    Tamil: 'Indian',
    Telugu: 'Indian',
    Kannada: 'Indian',
    Malayalam: 'Indian',
    Kashmiri: 'Indian',
    Rajasthani: 'Indian',
    Hyderabadi: 'Indian',
    Lucknowi: 'Indian',
    // Thai Regional
    Bangkok: 'Thai',
    Chiangmai: 'Thai',
    SouthernThai: 'Thai',
    Northeastern: 'Thai',
    // Vietnamese Regional
    Hanoi: 'Vietnamese',
    Saigon: 'Vietnamese',
    Hue: 'Vietnamese',
    // Italian Regional
    Tuscan: 'Italian',
    Sicilian: 'Italian',
    Lombard: 'Italian',
    Venetian: 'Italian',
    Roman: 'Italian',
    Neapolitan: 'Italian',
    Piedmontese: 'Italian',
    Ligurian: 'Italian',
    Emilian: 'Italian',
    Sardinian: 'Italian',
    // French Regional
    Provencal: 'French',
    Norman: 'French',
    Alsatian: 'French',
    Lyonnais: 'French',
    Bordeaux: 'French',
    Burgundian: 'French',
    Breton: 'French',
    // Spanish Regional
    Catalan: 'Spanish',
    Andalusian: 'Spanish',
    Basque: 'Spanish',
    Galician: 'Spanish',
    Valencian: 'Spanish',
    Castilian: 'Spanish',
    // Mexican Regional
    Yucatecan: 'Mexican',
    Oaxacan: 'Mexican',
    Poblano: 'Mexican',
    Veracruzano: 'Mexican',
    Jaliscan: 'Mexican',
    Sonoran: 'Mexican',
    // American Regional
    Southern: 'American',
    NewEngland: 'American',
    Californian: 'American',
    TexMex: 'American',
    Cajun: 'American',
    Creole: 'American',
    Southwestern: 'American',
    Midwestern: 'American',
    PacificNorthwest: 'American',
    // Middle Eastern Regional
    Lebanese: 'Middle-Eastern',
    Syrian: 'Middle-Eastern',
    Jordanian: 'Middle-Eastern',
    Palestinian: 'Middle-Eastern',
    Iraqi: 'Middle-Eastern',
    Iranian: 'Middle-Eastern',
    Turkish: 'Middle-Eastern',
    Egyptian: 'Middle-Eastern',
    Moroccan: 'Middle-Eastern',
    Tunisian: 'Middle-Eastern',
    Algerian: 'Middle-Eastern',
    Libyan: 'Middle-Eastern',
    // African Regional
    Ethiopian: 'African',
    Nigerian: 'African',
    Ghanaian: 'African',
    Kenyan: 'African',
    SouthAfrican: 'African',
    // Mediterranean Regional
    Greek: 'Mediterranean' as PrimaryCuisineType,
    Cypriot: 'Mediterranean',
    Maltese: 'Mediterranean',
    // Russian Regional
    Moscow: 'Russian',
    StPetersburg: 'Russian',
    Siberian: 'Russian',
    Caucasian: 'Russian',
    CentralAsian: 'Russian'
  };
  return (
    ((regionalToPrimary as Record<string, string>)[_regional] as PrimaryCuisineType) ||
    ('Fusion' as PrimaryCuisineType)
  );
}

/**
 * Get all regional cuisines for a primary cuisine
 */
export function getRegionalCuisinesForPrimary(_primary: PrimaryCuisineType): RegionalCuisineType[] {
  const primaryToRegional: Record<PrimaryCuisineType, RegionalCuisineType[]> = {
    Chinese: ['Sichuan', 'Cantonese', 'Shanghai', 'Hunan', 'Northern'],
    Japanese: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'],
    Korean: ['Seoul', 'Busan', 'Jeju'],
    Indian: [
      'Punjabi',
      'Bengali',
      'Gujarati',
      'Marathi',
      'Tamil',
      'Telugu',
      'Kannada',
      'Malayalam',
      'Kashmiri',
      'Rajasthani',
      'Hyderabadi',
      'Lucknowi'
    ],
    Thai: ['Bangkok', 'Chiangmai', 'SouthernThai', 'Northeastern'],
    Vietnamese: ['Hanoi', 'Saigon', 'Hue'],
    Italian: [
      'Tuscan',
      'Sicilian',
      'Lombard',
      'Venetian',
      'Roman',
      'Neapolitan',
      'Piedmontese',
      'Ligurian',
      'Emilian',
      'Sardinian'
    ],
    French: ['Provencal', 'Norman', 'Alsatian', 'Lyonnais', 'Bordeaux', 'Burgundian', 'Breton'],
    Greek: ['Greek' as RegionalCuisineType, 'Cypriot', 'Maltese'],
    Spanish: ['Catalan', 'Andalusian', 'Basque', 'Galician', 'Valencian', 'Castilian'],
    Mexican: ['Yucatecan', 'Oaxacan', 'Poblano', 'Veracruzano', 'Jaliscan', 'Sonoran'],
    American: [
      'Southern',
      'NewEngland',
      'Californian',
      'TexMex',
      'Cajun',
      'Creole',
      'Southwestern',
      'Midwestern',
      'PacificNorthwest'
    ],
    'Middle-Eastern': [
      'Lebanese',
      'Syrian',
      'Jordanian',
      'Palestinian',
      'Iraqi',
      'Iranian',
      'Turkish',
      'Egyptian',
      'Moroccan',
      'Tunisian',
      'Algerian',
      'Libyan'
    ],
    African: ['Ethiopian', 'Nigerian', 'Ghanaian', 'Kenyan', 'SouthAfrican'],
    Mediterranean: ['Greek' as RegionalCuisineType, 'Cypriot', 'Maltese'],
    Russian: ['Moscow', 'StPetersburg', 'Siberian', 'Caucasian', 'CentralAsian'],
    Fusion: []
  };

  return primaryToRegional[_primary] || [];
}

// ========== CUISINE RECOMMENDATIONS ==========

/**
 * Get cuisine compatibility recommendations
 */
export function getCuisineCompatibilityRecommendations(
  cuisine: CompleteCuisineType,
  _ingredients: string[]
): CuisineCompatibility[] {
  const allCuisines: CompleteCuisineType[] = Object.keys(
    CUISINE_CATEGORY_MAP
  ) as CompleteCuisineType[];

  return allCuisines
    .filter(c => c !== cuisine)
    .map(targetCuisine => ({
      cuisine: targetCuisine,
      score: calculateCuisineCompatibility(cuisine, targetCuisine),
      factors: getCompatibilityFactors(cuisine, targetCuisine),
      _ingredientMatches: getCommonIngredients(cuisine, targetCuisine),
      _regionalVariations: getRegionalVariations(cuisine, targetCuisine)
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get compatibility factors between two cuisines
 */
export function getCompatibilityFactors(
  cuisine1: CompleteCuisineType,
  cuisine2: CompleteCuisineType
): string[] {
  const factors: string[] = [];

  const continent1 = getCuisineContinent(cuisine1);
  const continent2 = getCuisineContinent(cuisine2);

  if (continent1 === continent2) {
    factors.push(`Both ${continent1} cuisines`);
  }

  if (isRegionalCuisine(cuisine1) && isRegionalCuisine(cuisine2) {
    const primary1 = getPrimaryCuisineFromRegional(cuisine1);
    const primary2 = getPrimaryCuisineFromRegional(cuisine2);
    if (primary1 === primary2) {
      factors.push(`Regional variations of ${primary1}`);
    }
  }

  if (isFusionCuisine(cuisine1) || isFusionCuisine(cuisine2) {
    factors.push('Fusion cuisine compatibility');
  }

  if (isDietaryCuisine(cuisine1) || isDietaryCuisine(cuisine2) {
    factors.push('Dietary preference alignment');
  }

  return factors;
}

/**
 * Get common ingredients between cuisines
 */
export function getCommonIngredients(
  cuisine1: CompleteCuisineType,
  cuisine2: CompleteCuisineType;
): string[] {
  // This would be populated with actual ingredient data
  // For now, returning placeholder data
  const commonIngredients: Record<string, string[]> = {
    'Chinese-Italian': ['garlic', 'onion', 'ginger', 'soy sauce'],
    'French-Italian': ['olive oil', 'garlic', 'herbs', 'wine'],
    'Mexican-American': ['corn', 'beans', 'tomatoes', 'chili'],
    'Indian-Thai': ['coconut', 'curry', 'rice', 'spices']
  }

  const key = `${cuisine1}-${cuisine2}`;
  const reverseKey = `${cuisine2}-${cuisine1}`;

  return commonIngredients[key] || commonIngredients[reverseKey] || [];
}

/**
 * Get regional variations for cuisines
 */
export function getRegionalVariations(
  cuisine1: CompleteCuisineType,
  cuisine2: CompleteCuisineType
): string[] {
  const variations: string[] = [];

  if (isRegionalCuisine(cuisine1) {
    variations.push(`${cuisine1} (regional)`);
  }

  if (isRegionalCuisine(cuisine2) {
    variations.push(`${cuisine2} (regional)`);
  }

  return variations;
}

// ========== CUISINE VALIDATION ==========

/**
 * Validate if a string is a valid cuisine type
 */
export function isValidCuisineType(cuisine: string): cuisine is CompleteCuisineType {
  return cuisine in CUISINE_CATEGORY_MAP;
}

/**
 * Normalize cuisine name to standard format
 */
export function normalizeCuisineName(cuisine: string): CompleteCuisineType | string {
  // Convert to title case and replace spaces with hyphens
  const normalized = cuisine;
    .toLowerCase()
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');

  return isValidCuisineType(normalized) ? normalized : cuisine
}

/**
 * Get cuisine display name
 */
export function getCuisineDisplayName(cuisine: CompleteCuisineType): string {
  return cuisine.replace(/-/g, ' ');
}

// ========== CUISINE GROUPING ==========

/**
 * Group cuisines by category
 */
export function groupCuisinesByCategory(
  cuisines: CompleteCuisineType[]
): Record<string, CompleteCuisineType[]> {
  const groups: Record<string, CompleteCuisineType[]> = {};

  cuisines.forEach(cuisine => {
    const category = getCuisineContinent(cuisine);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(cuisine);
  });

  return groups;
}

/**
 * Get all cuisines in a category
 */
export function getCuisinesInCategory(category: string): CompleteCuisineType[] {
  return Object.entries(CUISINE_CATEGORY_MAP)
    .filter(([_, cat]) => cat === category)
    .map(([cuisine, _]) => cuisine as CompleteCuisineType);
}

// ========== EXPORT ALL UTILITIES ==========

export { CUISINE_CATEGORY_MAP };
