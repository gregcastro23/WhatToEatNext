import { cookingMethods } from '@/data/cooking';
import { african } from '@/data/cuisines/african';
import { chinese } from '@/data/cuisines/chinese';
import { french } from '@/data/cuisines/french';
import { greek } from '@/data/cuisines/greek';
import { indian } from '@/data/cuisines/indian';
import { italian } from '@/data/cuisines/italian';
import { japanese } from '@/data/cuisines/japanese';
import { korean } from '@/data/cuisines/korean';
import { mexican } from '@/data/cuisines/mexican';
import { middleEastern } from '@/data/cuisines/middle-eastern';
import { russian } from '@/data/cuisines/russian';
import { thai } from '@/data/cuisines/thai';
import { vietnamese } from '@/data/cuisines/vietnamese';

// Define a standardized cooking method interface to use across the app
export interface CulturalCookingMethod {
  id: string;
  name: string;
  description: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  culturalOrigin: string;
  toolsRequired?: string[];
  bestFor?: string[];
  astrologicalInfluences?: {
    favorableZodiac?: string[];
    unfavorableZodiac?: string[];
    dominantPlanets?: string[];
  };
  relatedToMainMethod?: string; // Add a property to link to the main cooking method
  variationName?: string; // Optional name of the variation
}

// Map of cooking techniques that are variations of standard methods
const TECHNIQUE_MAPPING: Record<string, string> = {
  // Baking variations
  'wood-fired oven baking': 'baking',
  'tannur oven baking': 'baking',
  'mushipan steaming': 'steaming',
  'bain-marie': 'baking',
  'en papillote': 'baking',
  tandoor: 'baking',
  'brick oven pizza': 'baking',
  'pastry baking': 'baking',
  'bread baking': 'baking',

  // Frying variations
  'stir-frying': 'frying',
  'deep-frying': 'frying',
  'wok frying': 'frying',
  'shallow frying': 'frying',
  'flash frying': 'frying',
  'pan frying': 'frying',
  tempura: 'frying',
  'air frying': 'frying',

  // Steaming variations
  'dim sum steaming': 'steaming',
  'bamboo steaming': 'steaming',
  'banana leaf steaming': 'steaming',
  'pressure steaming': 'steaming',

  // Boiling variations
  blanching: 'boiling',
  nimono: 'boiling',
  'hot pot': 'boiling',
  'pasta al dente': 'boiling',
  simmering: 'boiling',
  poaching: 'boiling',

  // Grilling variations - expanded to catch all similar methods
  yakitori: 'grilling',
  robata: 'grilling',
  barbacoa: 'grilling',
  'al pastor': 'grilling',
  barbecue: 'grilling',
  'charcoal grilling': 'grilling',
  nướng: 'grilling',
  'grilling (yang)': 'grilling',
  'open-fire grilling': 'grilling',
  'direct heat grilling': 'grilling',
  grill: 'grilling',
  'charcoal grill': 'grilling',
  'korean bbq': 'grilling',
  hibachi: 'grilling',
  'kebab grilling': 'grilling',
  'suya grilling': 'grilling',
  'tandoori grilling': 'grilling',
  'satay grilling': 'grilling',
  'gas grilling': 'grilling',
  'electric grill': 'grilling',

  // Smoking variations
  'cold smoking': 'smoking',
  'hot smoking': 'smoking',
  'smoke roasting': 'smoking',

  // Slow cooking variations
  braising: 'slow_cooking',
  'clay pot cooking': 'slow_cooking',
  tagine: 'slow_cooking',
  'dutch oven cooking': 'slow_cooking',
  'slow roasting': 'slow_cooking',

  // Pickling variations
  'kimchi fermentation': 'fermenting',
  'sauerkraut fermentation': 'fermenting',
  'lacto-fermentation': 'fermenting',
  'vinegar pickling': 'fermenting',
  'wine fermentation': 'fermenting',

  // Marinating variations
  adobo: 'marinating',
  ceviche: 'marinating',
  brining: 'marinating',
  'dry rubs': 'marinating',

  // Roasting variations
  rotisserie: 'roasting',
  'spit roasting': 'roasting',
  'oven roasting': 'roasting',
  'coffee roasting': 'roasting',
  'vegetable roasting': 'roasting',

  // Sous vide variations
  'sous vide cooking': 'sous_vide',
  'water bath cooking': 'sous_vide',

  // Others
  'hand pounding': 'grinding',
  'mortar and pestle': 'grinding',
  'stone grinding': 'grinding'
};

/**
 * Extracts cooking techniques from all cuisine files and formats them
 * into a standardized structure
 */
export function extractCulturalCookingMethods(): CulturalCookingMethod[] {
  const cuisines = [;
    { data: thai, name: 'Thai' },
    { data: vietnamese, name: 'Vietnamese' },
    { data: italian, name: 'Italian' },
    { data: chinese, name: 'Chinese' },
    { data: indian, name: 'Indian' },
    { data: japanese, name: 'Japanese' },
    { data: korean, name: 'Korean' },
    { data: mexican, name: 'Mexican' },
    { data: middleEastern, name: 'Middle Eastern' },
    { data: russian, name: 'Russian' },
    { data: greek, name: 'Greek' },
    { data: french, name: 'French' },
    { data: african, name: 'African' }
  ];

  const methods: CulturalCookingMethod[] = [];
  // Use a Set to track method names already added (case insensitive)
  const addedMethods = new Set<string>();
  // Keep track of method variations already mapped to main methods
  const methodVariationsMap: Record<string, Set<string>> = {};

  // Group methods by main category for hierarchical organization
  const methodsByMainCategory: Record<string, CulturalCookingMethod[]> = {};

  // Extract cooking techniques from each cuisine
  cuisines.forEach(cuisine => {;
    if (!cuisine.data.cookingTechniques) return;

    cuisine.data.cookingTechniques.forEach(technique => {;
      // Generate a unique ID for each cooking method
      const methodName = technique.name.toLowerCase();
      const methodId = `${cuisine.name.toLowerCase()}_${methodName.replace(/\s+/g, '_')}`;

      // Skip if this is a duplicate name/cuisine combination
      const caseInsensitiveKey = `${cuisine.name.toLowerCase()}:${methodName.toLowerCase()}`;
      if (addedMethods.has(caseInsensitiveKey)) {
        return;
      }
      addedMethods.add(caseInsensitiveKey);

      // Check if this method is a variation of a standard cooking method
      // Use case-insensitive matching for technique mapping
      const relatedMainMethod = Object.entries(TECHNIQUE_MAPPING).find(;
        ([key]) => methodName.toLowerCase() === key.toLowerCase(),
      )?.[1];

      // If this is a variation and we've already added a variation from this culture
      // to this main method, skip it to avoid duplicates
      if (relatedMainMethod) {
        if (!methodVariationsMap[relatedMainMethod]) {
          methodVariationsMap[relatedMainMethod] = new Set<string>();
        }

        const culturalMethodKey = `${cuisine.name.toLowerCase()}:${relatedMainMethod}`;
        if (methodVariationsMap[relatedMainMethod].has(culturalMethodKey)) {
          return;
        }
        methodVariationsMap[relatedMainMethod].add(culturalMethodKey);
      }

      const culturalMethod: CulturalCookingMethod = {;
        id: methodId,
        name: technique.name,
        description: technique.description,
        elementalProperties: technique.elementalProperties,
        culturalOrigin: cuisine.name,
        toolsRequired: technique.toolsRequired,
        bestFor: technique.bestFor,
        // Add relationship to main method if applicable
        relatedToMainMethod: relatedMainMethod,
        variationName: relatedMainMethod ? `${cuisine.name} ${technique.name}` : undefined,
        // Add placeholder for astrological influences that we can map later
        astrologicalInfluences: {
          dominantPlanets: []
        }
      };

      methods.push(culturalMethod);

      // Group method by main category for hierarchical organization
      if (relatedMainMethod) {
        if (!methodsByMainCategory[relatedMainMethod]) {
          methodsByMainCategory[relatedMainMethod] = [];
        }
        methodsByMainCategory[relatedMainMethod].push(culturalMethod);
      }
    });
  });

  // Add basic astrological influences for methods that don't have them
  methods.forEach(method => {;
    if (method.relatedToMainMethod && cookingMethods[method.relatedToMainMethod]) {
      // Inherit some properties from the main method
      const mainMethod = cookingMethods[method.relatedToMainMethod];
      if (mainMethod.astrologicalInfluences) {
        method.astrologicalInfluences = {;
          ...method.astrologicalInfluences,
          favorableZodiac: mainMethod.astrologicalInfluences.favorableZodiac,
          unfavorableZodiac: mainMethod.astrologicalInfluences.unfavorableZodiac,
          dominantPlanets: mainMethod.astrologicalInfluences.dominantPlanets || []
        };
      }
    }
  });

  return methods;
}

// Export a ready-to-use object with all cultural cooking methods
export const culturalCookingMethods = extractCulturalCookingMethods();

// Helper to get methods by cultural origin
export function getMethodsByCulture(culture: string): CulturalCookingMethod[] {
  return culturalCookingMethods.filter(
    method => method.culturalOrigin.toLowerCase() === culture.toLowerCase(),;
  );
}

// Helper to get cultural variations of a main cooking method
export function getCulturalVariations(mainMethod: string): CulturalCookingMethod[] {
  return culturalCookingMethods.filter(method => method.relatedToMainMethod === mainMethod);
}

// Helper to map elemental properties to astrological influences
export function mapElementsToAstrology(methods: CulturalCookingMethod[]): CulturalCookingMethod[] {
  // This is where we could add logic to derive astrological influences from elemental properties
  // For now, returning as-is
  return methods;
}
