import { cookingMethods } from "@/data/cooking";
import { CUISINES_METADATA, getCuisineData } from "@/data/cuisines/index";
import type { CookingMethodData } from "@/types/cookingMethod";

// `cookingMethods` is a literal-keyed object (all values `CookingMethodData`).
// Lookups below use dynamic string keys, so view it through a typed,
// bounds-checked `Record` rather than indexing the literal type directly.
const cookingMethodsByName: Record<string, CookingMethodData> = cookingMethods;

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
  "wood-fired oven baking": "baking",
  "tannur oven baking": "baking",
  "mushipan steaming": "steaming",
  "bain-marie": "baking",
  "en papillote": "baking",
  _tandoor: "baking",
  "brick oven pizza": "baking",
  "pastry baking": "baking",
  "bread baking": "baking",

  // Frying variations
  "stir-frying": "frying",
  "deep-frying": "frying",
  "wok frying": "frying",
  "shallow frying": "frying",
  "flash frying": "frying",
  "pan frying": "frying",
  _tempura: "frying",
  "air frying": "frying",

  // Steaming variations
  "dim sum steaming": "steaming",
  "bamboo steaming": "steaming",
  "banana leaf steaming": "steaming",
  "pressure steaming": "steaming",

  // Boiling variations
  _blanching: "boiling",
  _nimono: "boiling",
  "hot pot": "boiling",
  "pasta al dente": "boiling",
  _simmering: "boiling",
  _poaching: "boiling",

  // Grilling variations - expanded to catch all similar methods
  _yakitori: "grilling",
  _robata: "grilling",
  _barbacoa: "grilling",
  "al pastor": "grilling",
  _barbecue: "grilling",
  "charcoal grilling": "grilling",
  nướ_ng: "grilling",
  "grilling (yang)": "grilling",
  "open-fire grilling": "grilling",
  "direct heat grilling": "grilling",
  grill: "grilling",
  "charcoal grill": "grilling",
  "korean bbq": "grilling",
  _hibachi: "grilling",
  "kebab grilling": "grilling",
  "suya grilling": "grilling",
  "tandoori grilling": "grilling",
  "satay grilling": "grilling",
  "gas grilling": "grilling",
  "electric grill": "grilling",

  // Smoking variations
  "cold smoking": "smoking",
  "hot smoking": "smoking",
  "smoke roasting": "smoking",

  // Slow cooking variations
  _braising: "slow_cooking",
  "clay pot cooking": "slow_cooking",
  _tagine: "slow_cooking",
  "dutch oven cooking": "slow_cooking",
  "slow roasting": "slow_cooking",

  // Pickling variations
  "kimchi fermentation": "fermenting",
  "sauerkraut fermentation": "fermenting",
  "lacto-fermentation": "fermenting",
  "vinegar pickling": "fermenting",
  "wine fermentation": "fermenting",

  // Marinating variations
  _adobo: "marinating",
  _ceviche: "marinating",
  _brining: "marinating",
  "dry rubs": "marinating",

  // Roasting variations
  _rotisserie: "roasting",
  "spit roasting": "roasting",
  "oven roasting": "roasting",
  "coffee roasting": "roasting",
  "vegetable roasting": "roasting",

  // Sous vide variations
  "sous vide cooking": "sous_vide",
  "water bath cooking": "sous_vide",

  // Others
  "hand pounding": "grinding",
  "mortar and pestle": "grinding",
  "stone grinding": "grinding",
};

/**
 * Extracts cooking techniques from all cuisine files and formats them
 * into a standardized structure
 */
export async function getCulturalCookingMethods(): Promise<CulturalCookingMethod[]> {
  const cuisineKeys = Object.keys(CUISINES_METADATA);
  const allMethods: CulturalCookingMethod[] = [];
  const addedMethods = new Set<string>();
  const methodVariationsMap: Record<string, Set<string>> = {};

  for (const key of cuisineKeys) {
    const cuisine = await getCuisineData(key);
    if (!cuisine || !cuisine.cookingTechniques) continue;

    cuisine.cookingTechniques.forEach((technique) => {
      const methodName = technique.name.toLowerCase();
      const methodId = `${cuisine.name.toLowerCase()}_${methodName.replace(/\s+/g, "_")}`;

      const caseInsensitiveKey = `${cuisine.name.toLowerCase()}: ${methodName.toLowerCase()}`;
      if (addedMethods.has(caseInsensitiveKey)) return;
      addedMethods.add(caseInsensitiveKey);

      const relatedMainMethod = Object.entries(TECHNIQUE_MAPPING).find(
        ([k]) => methodName.toLowerCase() === k.toLowerCase(),
      )?.[1];

      if (relatedMainMethod) {
        if (!methodVariationsMap[relatedMainMethod]) {
          methodVariationsMap[relatedMainMethod] = new Set<string>();
        }

        const culturalMethodKey = `${cuisine.name.toLowerCase()}: ${relatedMainMethod}`;
        if (methodVariationsMap[relatedMainMethod].has(culturalMethodKey)) return;
        methodVariationsMap[relatedMainMethod].add(culturalMethodKey);
      }

      const culturalMethod: CulturalCookingMethod = {
        id: methodId,
        name: technique.name,
        description: technique.description,
        elementalProperties: technique.elementalProperties,
        culturalOrigin: cuisine.name,
        toolsRequired: technique.toolsRequired,
        bestFor: technique.bestFor,
        relatedToMainMethod: relatedMainMethod,
        variationName: relatedMainMethod
          ? `${cuisine.name} ${technique.name}`
          : undefined,
        astrologicalInfluences: {
          dominantPlanets: [],
        },
      };

      allMethods.push(culturalMethod);
    });
  }

  allMethods.forEach((method) => {
    if (
      method.relatedToMainMethod &&
      cookingMethodsByName[method.relatedToMainMethod]
    ) {
      const mainMethod = cookingMethodsByName[method.relatedToMainMethod];
      if (mainMethod.astrologicalInfluences) {
        method.astrologicalInfluences = {
          ...method.astrologicalInfluences,
          favorableZodiac: mainMethod.astrologicalInfluences.favorableZodiac,
          unfavorableZodiac:
            mainMethod.astrologicalInfluences.unfavorableZodiac,
          dominantPlanets:
            mainMethod.astrologicalInfluences.dominantPlanets || [],
        };
      }
    }
  });

  return allMethods;
}

// Legacy export - empty array to avoid bundling large data.
// Use getCulturalCookingMethods() instead.
/** @deprecated Use getCulturalCookingMethods() instead */
export const culturalCookingMethods: CulturalCookingMethod[] = [];

// Helper to get methods by cultural origin
export async function getMethodsByCulture(culture: string): Promise<CulturalCookingMethod[]> {
  const allMethods = await getCulturalCookingMethods();
  return allMethods.filter(
    (method) => method.culturalOrigin.toLowerCase() === culture.toLowerCase(),
  );
}

// Helper to get cultural variations of a main cooking method
export async function getCulturalVariations(
  mainMethod: string,
): Promise<CulturalCookingMethod[]> {
  const allMethods = await getCulturalCookingMethods();
  return allMethods.filter(
    (method) => method.relatedToMainMethod === mainMethod,
  );
}

// Helper to map elemental properties to astrological influences
export function mapElementsToAstrology(
  methods: CulturalCookingMethod[],
): CulturalCookingMethod[] {
  return methods;
}
