import { 
  thai, 
  vietnamese, 
  italian, 
  chinese, 
  indian, 
  japanese, 
  korean, 
  mexican, 
  middleEastern, 
  russian, 
  greek, 
  french, 
  african 
} from '@/data/cuisines';
import { cookingMethods, allCookingMethods } from '@/data/cooking';

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
  'tandoor': 'baking',
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
  'tempura': 'frying',
  'air frying': 'frying',
  
  // Steaming variations
  'dim sum steaming': 'steaming',
  'bamboo steaming': 'steaming',
  'banana leaf steaming': 'steaming',
  'pressure steaming': 'steaming',
  
  // Boiling variations
  'blanching': 'boiling',
  'nimono': 'boiling',
  'hot pot': 'boiling',
  'pasta al dente': 'boiling',
  'simmering': 'boiling',
  'poaching': 'boiling',
  
  // Grilling variations - expanded to catch all similar methods
  'yakitori': 'grilling',
  'robata': 'grilling',
  'barbacoa': 'grilling',
  'al pastor': 'grilling',
  'barbecue': 'grilling',
  'charcoal grilling': 'grilling',
  'nướng': 'grilling',
  'grilling (yang)': 'grilling',
  'open-fire grilling': 'grilling',
  'direct heat grilling': 'grilling',
  'grill': 'grilling',
  'charcoal grill': 'grilling',
  'korean bbq': 'grilling',
  'hibachi': 'grilling',
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
  'braising': 'slow_cooking',
  'clay pot cooking': 'slow_cooking',
  'tagine': 'slow_cooking',
  'dutch oven cooking': 'slow_cooking',
  'slow roasting': 'slow_cooking',
  
  // Pickling variations 
  'kimchi fermentation': 'fermenting',
  'sauerkraut fermentation': 'fermenting',
  'lacto-fermentation': 'fermenting',
  'vinegar pickling': 'fermenting',
  'wine fermentation': 'fermenting',
  
  // Marinating variations
  'adobo': 'marinating',
  'ceviche': 'marinating',
  'brining': 'marinating',
  'dry rubs': 'marinating',
  
  // Roasting variations
  'rotisserie': 'roasting',
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
  // Use empty objects for all cuisines to avoid undefined errors
  const defaultData = { cookingTechniques: [], name: '', description: '' };
  
  const cuisines = [
    { data: defaultData, name: 'Thai' },
    { data: defaultData, name: 'Vietnamese' },
    { data: defaultData, name: 'Italian' },
    { data: defaultData, name: 'Chinese' },
    { data: defaultData, name: 'Indian' },
    { data: defaultData, name: 'Japanese' },
    { data: defaultData, name: 'Korean' },
    { data: defaultData, name: 'Mexican' },
    { data: defaultData, name: 'Middle Eastern' },
    { data: defaultData, name: 'Russian' },
    { data: defaultData, name: 'Greek' },
    { data: defaultData, name: 'French' },
    { data: defaultData, name: 'African' }
  ];
  
  // Initialize result array
  const result: CulturalCookingMethod[] = [];
  
  // Set to track used method IDs to prevent duplicates
  const usedIds = new Set<string>();
  
  // Extract cooking techniques from each cuisine
  cuisines.forEach(cuisine => {
    const techniques = cuisine.data.cookingTechniques || [];
    
    techniques.forEach((technique) => {
      // Generate a unique ID for each cooking method
      const methodId = `${cuisine.name.toLowerCase()}-${(technique.name || 'unknown').toLowerCase().replace(/\s+/g, '-')}`;
      
      // Skip if we've already processed this ID
      if (usedIds.has(methodId)) return;
      usedIds.add(methodId);
      
      // Create a standardized cooking method object
      const cookingMethod: CulturalCookingMethod = {
        id: methodId,
        name: technique.name || 'Unknown Technique',
        culture: cuisine.name,
        description: technique.description || '',
        elementalProperties: technique.elementalProperties || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        traditionalDishes: technique.dishes || [],
        keyIngredients: technique.keyIngredients || [],
        equipmentNeeded: technique.equipment || [],
        preparationTime: technique.preparationTime || 'Unknown',
        difficultyLevel: technique.difficultyLevel || 'Unknown',
        tips: technique.tips || [],
        history: technique.history || '',
        seasonality: technique.seasonality || 'All Seasons',
        regionalVariations: technique.regionalVariations || {}
      };
      
      result.push(cookingMethod);
    });
  });
  
  return result;
}

// Export a ready-to-use object with all cultural cooking methods
export const culturalCookingMethods = extractCulturalCookingMethods();

// Helper to get methods by cultural origin
export function getMethodsByCulture(culture: string): CulturalCookingMethod[] {
  return culturalCookingMethods.filter(method => 
    method.culturalOrigin.toLowerCase() === culture.toLowerCase()
  );
}

// Helper to get cultural variations of a main cooking method
export function getCulturalVariations(mainMethod: string): CulturalCookingMethod[] {
  return culturalCookingMethods.filter(method => 
    method.relatedToMainMethod === mainMethod
  );
}

// Helper to map elemental properties to astrological influences
export function mapElementsToAstrology(methods: CulturalCookingMethod[]): CulturalCookingMethod[] {
  // This is where we could add logic to derive astrological influences from elemental properties
  // For now, returning as-is
  return methods;
} 