import type { Element, ElementalProperties, ZodiacSign, Season, LunarPhase } from './alchemy';

// ========== STANDARDIZED INGREDIENT SYSTEM ==========

/**
 * Standardized ingredient interface that handles all data inconsistencies
 * Provides both backward compatibility and forward consistency
 */

// Flexible vitamin/mineral types that can handle both array and object formats
export type VitaminData = string[] | Record<string, number>;
export type MineralData = string[] | Record<string, number>;

// Standardized nutritional profile that handles all formats
export interface StandardizedNutritionalProfile {
  // Basic macros (always numbers)
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  
  // Vitamins - flexible format, always safe to access
  vitamins?: VitaminData;
  
  // Minerals - flexible format, always safe to access  
  minerals?: MineralData;
  
  // Additional nutritional data
  antioxidants?: string[];
  phytonutrients?: string[];
  serving_size?: string;
  
  // Extended nutritional data for oils/detailed ingredients
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    saturated_fat_g?: number;
    monounsaturated_fat_g?: number;
    polyunsaturated_fat_g?: number;
    omega_3_g?: number;
    omega_6_g?: number;
    cholesterol?: number;
  };
  
  // Detailed vitamin/mineral data with amounts
  vitaminDetails?: Record<string, {
    amount: number;
    unit: string;
    dailyValue?: number;
  }>;
  
  mineralsDetails?: Record<string, {
    amount: number;
    unit: string;
    dailyValue?: number;
  }>;
  
  // Health and quality indicators
  vitamin_density?: number;
  mineral_density?: number;
  antioxidant_score?: number;
  
  // Source and quality metadata
  source?: string;
  fdcId?: number;
  verified?: boolean;
  lastUpdated?: Date;
}

// Standardized culinary applications structure
export interface StandardizedCulinaryApplications {
  // Primary cooking methods
  raw?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    preparation?: string[];
  };
  
  // Heat-based methods
  baking?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    temperature?: { min: number; max: number; unit: 'F' | 'C' };
    duration?: { min: number; max: number; unit: 'minutes' | 'hours' };
  };
  
  sauteing?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    heatLevel?: 'low' | 'medium' | 'high';
  };
  
  roasting?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    temperature?: { min: number; max: number; unit: 'F' | 'C' };
    duration?: { min: number; max: number; unit: 'minutes' | 'hours' };
  };
  
  grilling?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    heatLevel?: 'low' | 'medium' | 'high';
  };
  
  steaming?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    duration?: { min: number; max: number; unit: 'minutes' };
  };
  
  // Liquid methods
  boiling?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    duration?: { min: number; max: number; unit: 'minutes' };
  };
  
  poaching?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    temperature?: { min: number; max: number; unit: 'F' | 'C' };
  };
  
  // Preservation methods
  fermenting?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    duration?: { min: number; max: number; unit: 'days' | 'weeks' };
  };
  
  pickling?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    acidType?: string[];
  };
  
  drying?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    method?: string[];
  };
  
  // Special applications
  finishing?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    timing?: string[];
  };
  
  infusing?: {
    notes: string[];
    techniques?: string[];
    dishes?: string[];
    duration?: { min: number; max: number; unit: 'minutes' | 'hours' | 'days' };
  };
  
  // Regional/cultural applications
  regional?: Record<string, {
    name: string;
    usage: string[];
    preparation: string;
    pairings?: string[];
    cultural_notes?: string;
    medicinal_use?: string;
  }>;
  
  // Flexible extension for category-specific methods
  [methodName: string]: any;
}

// Standardized variety information
export interface StandardizedVariety {
  appearance: string;
  texture: string;
  flavor: string;
  best_uses: string[];
  notes?: string;
  ripening?: string;
  storage?: string;
  availability?: {
    seasons: Season[];
    regions?: string[];
  };
  nutritionalDifferences?: Partial<StandardizedNutritionalProfile>;
}

// Standardized astrological profile
export interface StandardizedAstrologicalProfile {
  rulingPlanets?: string[];
  favorableZodiac?: ZodiacSign[];
  elementalAffinity?: {
    base: Element;
    secondary?: Element;
    decanModifiers?: {
      first: { element: Element; planet: string };
      second: { element: Element; planet: string };
      third: { element: Element; planet: string };
    };
  };
  lunarPhaseModifiers?: {
    [phase in LunarPhase | string]?: {
      elementalBoost?: Partial<ElementalProperties>;
      preparationTips?: string[];
      thermodynamicEffects?: {
        heat?: number;
        entropy?: number;
        reactivity?: number;
        energy?: number;
      };
    };
  };
}

// Standardized storage information
export interface StandardizedStorage {
  fresh?: {
    temperature?: string;
    humidity?: string;
    duration: string;
    notes?: string;
    container?: string;
  };
  frozen?: {
    preparation?: string;
    duration: string;
    uses?: string;
    qualityNotes?: string;
  };
  dried?: {
    method?: string[];
    duration: string;
    storage?: string;
    rehydration?: string;
  };
  pickled?: {
    method?: string;
    duration: string;
    storage?: string;
    notes?: string;
  };
  container?: string;
  environment?: string;
  preservation?: string[];
}

// Standardized health properties
export interface StandardizedHealthProperties {
  benefits?: string[];
  cautions?: string[];
  interactions?: string[];
  therapeuticUses?: string[];
  contraindications?: string[];
  dosage?: {
    culinary?: string;
    therapeutic?: string;
    maximum?: string;
  };
  activeCompounds?: string[];
  researchStatus?: 'traditional' | 'preliminary' | 'established' | 'clinical';
}

// Category-specific extensions
export interface OilSpecificProperties {
  smokePoint?: {
    celsius: number;
    fahrenheit: number;
  };
  extractionMethod?: string;
  refinementLevel?: 'crude' | 'refined' | 'extra-virgin' | 'cold-pressed';
  fatProfile?: {
    saturated: number;
    monounsaturated: number;
    polyunsaturated: number;
    omega3: number;
    omega6: number;
    omega9: number;
  };
  stability?: {
    heat: 'low' | 'medium' | 'high';
    light: 'sensitive' | 'stable';
    oxidation: 'prone' | 'resistant';
  };
}

export interface SpiceSpecificProperties {
  heatLevel?: number; // 1-10 scale
  potency?: number; // 1-10 scale  
  intensity?: number; // 1-10 scale
  grindSize?: 'whole' | 'coarse' | 'medium' | 'fine' | 'powder';
  origin?: string | string[];
  harvestSeason?: Season[];
  activeCompounds?: string[];
  traditional_uses?: {
    culinary: string[];
    medicinal: string[];
    ceremonial?: string[];
  };
}

export interface FruitSpecificProperties {
  ripeness_indicators?: {
    visual: string[];
    tactile: string[];
    aromatic: string[];
  };
  ripening_process?: {
    climacteric: boolean;
    ethylene_producer: boolean;
    ethylene_sensitive: boolean;
    optimal_temperature?: string;
    duration?: string;
  };
  peak_season?: {
    start: string;
    end: string;
    regions?: string[];
  };
}

// Main standardized ingredient interface
export interface StandardizedIngredient {
  // Core identification (always required)
  name: string;
  id?: string;
  category: string;
  subCategory?: string;
  
  // Elemental properties (always required)
  elementalProperties: ElementalProperties;
  
  // Basic properties
  qualities?: string[];
  season?: Season | Season[];
  seasonality?: Season | Season[];
  
  // Standardized nutritional profile (handles all formats)
  nutritionalProfile?: StandardizedNutritionalProfile;
  
  // Standardized culinary applications (flexible structure)
  culinaryApplications?: StandardizedCulinaryApplications;
  
  // Standardized variety information
  varieties?: Record<string, StandardizedVariety>;
  
  // Standardized astrological profile
  astrologicalProfile?: StandardizedAstrologicalProfile;
  
  // Standardized storage information
  storage?: StandardizedStorage;
  
  // Standardized health properties
  healthProperties?: StandardizedHealthProperties;
  
  // Category-specific properties (type-safe extensions)
  oilProperties?: OilSpecificProperties;
  spiceProperties?: SpiceSpecificProperties;
  fruitProperties?: FruitSpecificProperties;
  
  // Relationships and usage
  pairings?: string[];
  substitutions?: string[];
  affinities?: string[];
  
  // Preparation guidance
  preparation?: {
    washing?: string | boolean;
    peeling?: string | boolean;
    cutting?: string;
    cooking?: string;
    notes?: string;
    tips?: string[];
  };
  
  // Cultural and historical context
  culturalSignificance?: Record<string, string>;
  regionalUses?: Record<string, string>;
  history?: string;
  etymology?: string;
  
  // Quality and sourcing
  qualityIndicators?: string[];
  sourcingNotes?: string[];
  sustainability?: {
    concerns?: string[];
    certifications?: string[];
    recommendations?: string[];
  };
  
  // Flexible extension for future properties
  [key: string]: any;
}

// Type guards for safe data access
export function isVitaminArray(vitamins: VitaminData): vitamins is string[] {
  return Array.isArray(vitamins);
}

export function isVitaminObject(vitamins: VitaminData): vitamins is Record<string, number> {
  return !Array.isArray(vitamins) && typeof vitamins === 'object';
}

export function isMineralArray(minerals: MineralData): minerals is string[] {
  return Array.isArray(minerals);
}

export function isMineralObject(minerals: MineralData): minerals is Record<string, number> {
  return !Array.isArray(minerals) && typeof minerals === 'object';
}

// Safe vitamin/mineral extraction utilities
export function safeGetVitamins(profile?: StandardizedNutritionalProfile): string[] {
  if (!profile?.vitamins) return [];
  
  if (isVitaminArray(profile.vitamins)) {
    return profile.vitamins;
  }
  
  if (isVitaminObject(profile.vitamins)) {
    return Object.keys(profile.vitamins);
  }
  
  return [];
}

export function safeGetMinerals(profile?: StandardizedNutritionalProfile): string[] {
  if (!profile?.minerals) return [];
  
  if (isMineralArray(profile.minerals)) {
    return profile.minerals;
  }
  
  if (isMineralObject(profile.minerals)) {
    return Object.keys(profile.minerals);
  }
  
  return [];
}

export function safeGetVitaminValues(profile?: StandardizedNutritionalProfile): Record<string, number> {
  if (!profile?.vitamins) return {};
  
  if (isVitaminObject(profile.vitamins)) {
    return profile.vitamins;
  }
  
  if (isVitaminArray(profile.vitamins)) {
    // Convert array to object with default values
    return profile.vitamins.reduce((acc, vitamin) => {
      acc[vitamin] = 1; // Default presence indicator
      return acc;
    }, {} as Record<string, number>);
  }
  
  return {};
}

export function safeGetMineralValues(profile?: StandardizedNutritionalProfile): Record<string, number> {
  if (!profile?.minerals) return {};
  
  if (isMineralObject(profile.minerals)) {
    return profile.minerals;
  }
  
  if (isMineralArray(profile.minerals)) {
    // Convert array to object with default values
    return profile.minerals.reduce((acc, mineral) => {
      acc[mineral] = 1; // Default presence indicator
      return acc;
    }, {} as Record<string, number>);
  }
  
  return {};
}

// Data completeness assessment
export interface DataCompletenessScore {
  overall: number; // 0-100
  nutrition: number;
  culinary: number;
  astrology: number;
  varieties: number;
  storage: number;
  missingFields: string[];
  strengths: string[];
  recommendations: string[];
}

export function assessDataCompleteness(ingredient: StandardizedIngredient): DataCompletenessScore {
  let score = 0;
  let maxScore = 0;
  const missingFields: string[] = [];
  const strengths: string[] = [];
  
  // Core properties (30 points)
  maxScore += 30;
  if (ingredient.name) score += 5;
  if (ingredient.category) score += 5;
  if (ingredient.elementalProperties) score += 10;
  if (ingredient.qualities?.length) score += 5;
  if (ingredient.season) score += 5;
  
  // Nutritional data (25 points)
  maxScore += 25;
  if (ingredient.nutritionalProfile) {
    score += 5;
    if (ingredient.nutritionalProfile.calories !== undefined) score += 2;
    if (ingredient.nutritionalProfile.vitamins) score += 4;
    if (ingredient.nutritionalProfile.minerals) score += 4;
    if (ingredient.nutritionalProfile.macros) score += 5;
    if (ingredient.nutritionalProfile.antioxidants?.length) score += 3;
    if (ingredient.nutritionalProfile.serving_size) score += 2;
    strengths.push('Nutritional data');
  } else {
    missingFields.push('nutritionalProfile');
  }
  
  // Culinary applications (20 points)
  maxScore += 20;
  if (ingredient.culinaryApplications) {
    const methodCount = Object.keys(ingredient.culinaryApplications).length;
    score += Math.min(20, methodCount * 3);
    if (methodCount >= 3) strengths.push('Culinary versatility');
  } else {
    missingFields.push('culinaryApplications');
  }
  
  // Astrological data (10 points)
  maxScore += 10;
  if (ingredient.astrologicalProfile) {
    score += 3;
    if (ingredient.astrologicalProfile.rulingPlanets?.length) score += 2;
    if (ingredient.astrologicalProfile.favorableZodiac?.length) score += 2;
    if (ingredient.astrologicalProfile.lunarPhaseModifiers) score += 3;
    strengths.push('Astrological correspondences');
  } else {
    missingFields.push('astrologicalProfile');
  }
  
  // Varieties and storage (10 points)
  maxScore += 10;
  if (ingredient.varieties && Object.keys(ingredient.varieties).length > 0) {
    score += 5;
    strengths.push('Variety information');
  }
  if (ingredient.storage) {
    score += 5;
    strengths.push('Storage guidance');
  }
  
  // Health properties (5 points)
  maxScore += 5;
  if (ingredient.healthProperties?.benefits?.length) {
    score += 5;
    strengths.push('Health benefits');
  }
  
  const overallScore = Math.round((score / maxScore) * 100);
  
  return {
    overall: overallScore,
    nutrition: ingredient.nutritionalProfile ? 
      Math.round((Object.keys(ingredient.nutritionalProfile).length / 15) * 100) : 0,
    culinary: ingredient.culinaryApplications ? 
      Math.round((Object.keys(ingredient.culinaryApplications).length / 10) * 100) : 0,
    astrology: ingredient.astrologicalProfile ? 85 : 0,
    varieties: ingredient.varieties ? 
      Math.min(100, Object.keys(ingredient.varieties).length * 25) : 0,
    storage: ingredient.storage ? 90 : 0,
    missingFields,
    strengths,
    recommendations: generateRecommendations(missingFields, overallScore)
  };
}

function generateRecommendations(missingFields: string[], score: number): string[] {
  const recommendations: string[] = [];
  
  if (score < 50) {
    recommendations.push('Comprehensive data enhancement needed');
  }
  
  if (missingFields.includes('nutritionalProfile')) {
    recommendations.push('Add nutritional data for better user guidance');
  }
  
  if (missingFields.includes('culinaryApplications')) {
    recommendations.push('Add cooking methods and techniques');
  }
  
  if (missingFields.includes('astrologicalProfile')) {
    recommendations.push('Add planetary correspondences and lunar phase modifiers');
  }
  
  return recommendations;
} 