/**
 * dataStandardization.js
 * 
 * Utilities for standardizing ingredient data across the application
 */

import ingredientCollection from '../data/ingredients';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '../constants/elementalConstants';

/**
 * Standardizes ingredient data to ensure all required fields are present with valid values
 * 
 * @param {Object} ingredient - The ingredient data to standardize
 * @returns {Object} - The standardized ingredient data
 */
export function standardizeIngredient(ingredient) {
  if (!ingredient) {
    throw new Error('Cannot standardize undefined ingredient');
  }

  // Ensure basic properties exist
  const standardized = {
    // Basic identification fields
    name: ingredient.name || '',
    category: ingredient.category || 'unknown',
    subCategory: ingredient.subCategory || '',
    
    // Ensure elemental properties are valid
    elementalProperties: ingredient.elementalProperties 
      ? normalizeElementalProperties(ingredient.elementalProperties) 
      : { ...DEFAULT_ELEMENTAL_PROPERTIES },
    
    // Ensure qualities is an array
    qualities: Array.isArray(ingredient.qualities) ? ingredient.qualities : [],
    
    // Ensure origin is an array
    origin: Array.isArray(ingredient.origin) ? ingredient.origin : [],
    
    // Standardize nutritional information
    nutritionalProfile: standardizeNutritionalProfile(ingredient.nutritionalProfile),
    
    // Standardize sensory profile
    sensoryProfile: standardizeSensoryProfile(ingredient.sensoryProfile),
    
    // Standardize storage information
    storage: standardizeStorage(ingredient.storage),
    
    // Standardize preparation methods
    preparation: standardizePreparation(ingredient.preparation),
    
    // Standardize culinary applications
    culinaryApplications: standardizeCulinaryApplications(ingredient.culinaryApplications),
    
    // Standardize health benefits
    healthBenefits: Array.isArray(ingredient.healthBenefits) ? ingredient.healthBenefects : [],
    
    // Standardize varieties
    varieties: ingredient.varieties || {},

    // Include all other properties from the original ingredient
    ...ingredient
  };

  // Standardize category-specific properties based on the category
  switch (standardized.category) {
    case 'vegetable':
      return standardizeVegetable(standardized);
    case 'protein':
      return standardizeProtein(standardized);
    case 'culinary_herb':
    case 'spice':
      return standardizeHerbOrSpice(standardized);
    case 'grain':
      return standardizeGrain(standardized);
    case 'oil':
    case 'vinegar':
      return standardizeOilOrVinegar(standardized);
    default:
      return standardized;
  }
}

/**
 * Normalize elemental properties to ensure they sum to 1
 * 
 * @param {Object} properties - The elemental properties to normalize
 * @returns {Object} - The normalized elemental properties
 */
function normalizeElementalProperties(properties) {
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  
  // Create a new object with the required elements
  const normalized = elements.reduce((obj, element) => {
    obj[element] = properties[element] || 0;
    return obj;
  }, {});
  
  // Calculate the sum of all elements
  const sum = elements.reduce((total, element) => total + normalized[element], 0);
  
  // If sum is 0 or very close to 0, return default values
  if (sum < 0.001) {
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }
  
  // Normalize the values to sum to 1
  elements.forEach(element => {
    normalized[element] = normalized[element] / (sum || 1);
  });
  
  return normalized;
}

/**
 * Standardize the nutritional profile
 * 
 * @param {Object} profile - The nutritional profile to standardize
 * @returns {Object} - The standardized nutritional profile
 */
function standardizeNutritionalProfile(profile = {}) {
  return {
    serving_size: profile.serving_size || "1 serving",
    calories: profile.calories || 0,
    macros: {
      protein: profile.macros?.protein || 0,
      carbs: profile.macros?.carbs || 0,
      fat: profile.macros?.fat || 0,
      fiber: profile.macros?.fiber || 0,
    },
    vitamins: profile.vitamins || {},
    minerals: profile.minerals || {},
    source: profile.source || "Estimated values",
    ...(profile || {})
  };
}

/**
 * Standardize the sensory profile
 * 
 * @param {Object} profile - The sensory profile to standardize
 * @returns {Object} - The standardized sensory profile
 */
function standardizeSensoryProfile(profile = {}) {
  const defaultValue = 0.25;
  
  return {
    taste: {
      sweet: profile?.taste?.sweet ?? defaultValue,
      salty: profile?.taste?.salty ?? defaultValue,
      sour: profile?.taste?.sour ?? defaultValue,
      bitter: profile?.taste?.bitter ?? defaultValue,
      umami: profile?.taste?.umami ?? defaultValue,
      spicy: profile?.taste?.spicy ?? defaultValue,
    },
    aroma: {
      floral: profile?.aroma?.floral ?? defaultValue,
      fruity: profile?.aroma?.fruity ?? defaultValue,
      herbal: profile?.aroma?.herbal ?? defaultValue,
      spicy: profile?.aroma?.spicy ?? defaultValue,
      earthy: profile?.aroma?.earthy ?? defaultValue,
      woody: profile?.aroma?.woody ?? defaultValue,
    },
    texture: {
      crisp: profile?.texture?.crisp ?? defaultValue,
      tender: profile?.texture?.tender ?? defaultValue,
      creamy: profile?.texture?.creamy ?? defaultValue,
      chewy: profile?.texture?.chewy ?? defaultValue,
      crunchy: profile?.texture?.crunchy ?? defaultValue,
      silky: profile?.texture?.silky ?? defaultValue,
    },
    ...(profile || {})
  };
}

/**
 * Standardize storage information
 * 
 * @param {Object} storage - The storage information to standardize
 * @returns {Object} - The standardized storage information
 */
function standardizeStorage(storage = {}) {
  return {
    temperature: storage.temperature || "room temperature",
    duration: storage.duration || "unknown",
    container: storage.container || "airtight container",
    tips: Array.isArray(storage.tips) ? storage.tips : [],
    ...(storage || {})
  };
}

/**
 * Standardize preparation methods
 * 
 * @param {Object} preparation - The preparation methods to standardize
 * @returns {Object} - The standardized preparation methods
 */
function standardizePreparation(preparation = {}) {
  return {
    methods: Array.isArray(preparation.methods) ? preparation.methods : [],
    washing: preparation.washing ?? false,
    notes: preparation.notes || "",
    ...(preparation || {})
  };
}

/**
 * Standardize culinary applications
 * 
 * @param {Object} applications - The culinary applications to standardize
 * @returns {Object} - The standardized culinary applications
 */
function standardizeCulinaryApplications(applications = {}) {
  return {
    commonUses: Array.isArray(applications.commonUses) ? applications.commonUses : [],
    pairingRecommendations: {
      complementary: Array.isArray(applications?.pairingRecommendations?.complementary) 
        ? applications.pairingRecommendations.complementary 
        : [],
      contrasting: Array.isArray(applications?.pairingRecommendations?.contrasting) 
        ? applications.pairingRecommendations.contrasting 
        : [],
      toAvoid: Array.isArray(applications?.pairingRecommendations?.toAvoid) 
        ? applications.pairingRecommendations.toAvoid 
        : [],
    },
    seasonalPeak: Array.isArray(applications.seasonalPeak) ? applications.seasonalPeak : [],
    techniques: applications.techniques || {},
    ...(applications || {})
  };
}

/**
 * Standardize vegetable-specific properties
 * 
 * @param {Object} vegetable - The vegetable to standardize
 * @returns {Object} - The standardized vegetable
 */
function standardizeVegetable(vegetable) {
  return {
    ...vegetable,
    seasonality: Array.isArray(vegetable.seasonality) ? vegetable.seasonality : [],
    cooking: {
      methodsRanked: vegetable.cooking?.methodsRanked || {},
      cookingTimesByMethod: vegetable.cooking?.cookingTimesByMethod || {},
      doneness: Array.isArray(vegetable.cooking?.doneness) ? vegetable.cooking.doneness : [],
      ...(vegetable.cooking || {})
    }
  };
}

/**
 * Standardize protein-specific properties
 * 
 * @param {Object} protein - The protein to standardize
 * @returns {Object} - The standardized protein
 */
function standardizeProtein(protein) {
  return {
    ...protein,
    cuts: protein.cuts || {},
    cookingTips: {
      internalTemperature: protein.cookingTips?.internalTemperature || {},
      restingTime: protein.cookingTips?.restingTime || "",
      commonMistakes: Array.isArray(protein.cookingTips?.commonMistakes) 
        ? protein.cookingTips.commonMistakes 
        : [],
      ...(protein.cookingTips || {})
    },
    sustainability: {
      rating: protein.sustainability?.rating || "Unknown",
      considerations: Array.isArray(protein.sustainability?.considerations) 
        ? protein.sustainability.considerations 
        : [],
      alternatives: Array.isArray(protein.sustainability?.alternatives) 
        ? protein.sustainability.alternatives 
        : [],
      ...(protein.sustainability || {})
    }
  };
}

/**
 * Standardize herb or spice-specific properties
 * 
 * @param {Object} herbOrSpice - The herb or spice to standardize
 * @returns {Object} - The standardized herb or spice
 */
function standardizeHerbOrSpice(herbOrSpice) {
  return {
    ...herbOrSpice,
    potency: herbOrSpice.potency || 5,
    aroma: {
      intensity: herbOrSpice.aroma?.intensity || 5,
      volatility: herbOrSpice.aroma?.volatility || 5,
      mainCompounds: Array.isArray(herbOrSpice.aroma?.mainCompounds) 
        ? herbOrSpice.aroma.mainCompounds 
        : [],
      ...(herbOrSpice.aroma || {})
    },
    drying: {
      methods: Array.isArray(herbOrSpice.drying?.methods) ? herbOrSpice.drying.methods : [],
      flavorRetention: herbOrSpice.drying?.flavorRetention || 0.5,
      ...(herbOrSpice.drying || {})
    },
    timing: {
      addEarly: herbOrSpice.timing?.addEarly ?? false,
      addLate: herbOrSpice.timing?.addLate ?? false,
      notes: herbOrSpice.timing?.notes || "",
      ...(herbOrSpice.timing || {})
    },
    substitutions: Array.isArray(herbOrSpice.substitutions) ? herbOrSpice.substitutions : []
  };
}

/**
 * Standardize grain-specific properties
 * 
 * @param {Object} grain - The grain to standardize
 * @returns {Object} - The standardized grain
 */
function standardizeGrain(grain) {
  return {
    ...grain,
    cookingRatio: grain.cookingRatio || { water: 2, grain: 1 },
    cookingTime: grain.cookingTime || "",
    glycemicIndex: grain.glycemicIndex || 50,
    glutenContent: grain.glutenContent ?? "unknown",
    soaking: {
      required: grain.soaking?.required ?? false,
      time: grain.soaking?.time || "",
      ...(grain.soaking || {})
    },
    sprouting: {
      viable: grain.sprouting?.viable ?? false,
      time: grain.sprouting?.time || "",
      ...(grain.sprouting || {})
    }
  };
}

/**
 * Standardize oil or vinegar-specific properties
 * 
 * @param {Object} oilOrVinegar - The oil or vinegar to standardize
 * @returns {Object} - The standardized oil or vinegar
 */
function standardizeOilOrVinegar(oilOrVinegar) {
  const isOil = oilOrVinegar.category === 'oil';
  
  return {
    ...oilOrVinegar,
    ...(isOil ? { smokePoint: oilOrVinegar.smokePoint || {} } : {}),
    ...(!isOil ? { acidity: oilOrVinegar.acidity || 5 } : {}),
    extractionMethod: oilOrVinegar.extractionMethod || "",
    refinement: oilOrVinegar.refinement || "",
    flavorIntensity: oilOrVinegar.flavorIntensity || 5,
    bestUses: {
      cooking: Array.isArray(oilOrVinegar.bestUses?.cooking) ? oilOrVinegar.bestUses.cooking : [],
      finishing: Array.isArray(oilOrVinegar.bestUses?.finishing) ? oilOrVinegar.bestUses.finishing : [],
      infusing: Array.isArray(oilOrVinegar.bestUses?.infusing) ? oilOrVinegar.bestUses.infusing : [],
      ...(oilOrVinegar.bestUses || {})
    }
  };
}

export default {
  standardizeIngredient
}; 