'use client';

// Phase 10: Enhanced Calculation Interfaces with Monica/Kalchm Integration
interface _CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface _ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

// Interface for astrological state
interface AstroState {
  elementalState?: ElementalData;
  zodiacSign?: string;
  lunarPhase?: string;
  preferredCuisines?: Array<{ name?: string; id?: string; [key: string]: unknown }>;
  culturalPreferences?: Array<{ name?: string; id?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

// Interface for cuisine preferences
interface CuisinePreference {
  name: string;
  id?: string;
  [key: string]: unknown;
}

// Interface for recipe data
interface RecipeData {
  name?: string;
  id?: string;
  elementalProperties?: ElementalData;
  cookingMethods?: string[];
  techniques?: string[];
  ingredients?: Array<{ name?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

// Enhanced cuisine scoring interface with Monica/Kalchm metrics
interface EnhancedCuisineScore {
  elementalMatch: number;
  monicaCompatibility: number;
  kalchmHarmony: number;
  zodiacAlignment: number;
  lunarAlignment: number;
  seasonalOptimization: number;
  culturalSynergy: number;
  overallScore: number;
  confidence: number;
}

interface _NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface _MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}

// UI state type for expandable components
type ExpandedState = {
  [key: string | number]: boolean;
};

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import {
  Flame,
  Droplets,
  Wind,
  Mountain,
  Info as _Info,
  Clock,
  Tag,
  Leaf,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  List,
  Search,
  Star,
  Target,
  Zap
} from 'lucide-react';
import { cuisines } from '@/data/cuisines';
import { getCuisineRecommendations ,
  generateTopSauceRecommendations,
  getMatchScoreClass,
  renderScoreBadge,
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets,
} from '@/utils/cuisineRecommender';
import styles from './CuisineRecommender.module.css';
import {
  ElementalItem,
  AlchemicalItem,

  ZodiacSign,
  LunarPhase,
  LunarPhaseWithSpaces,
  ElementalProperties} from '@/types/alchemy';
import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import {
  useIngredientMapping,
  useElementalState,
  useAstroTarotElementalState
} from '@/hooks';
import {
  transformCuisines,
  sortByAlchemicalCompatibility,
} from '@/utils/alchemicalTransformationUtils';
import {
  cuisineFlavorProfiles,
  getRecipesForCuisineMatch,
} from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import {
  sauceRecommendations as sauceRecsData,
  SauceRecommendation,
  allSauces,
  Sauce,
} from '@/data/sauces';
import { Recipe } from '@/types/recipe';
// Import the comprehensive cuisine integration system
import {
  cuisineMonicaConstants,
  UnifiedCuisineIntegrationSystem,
  type CuisineMonicaProfile,
  type CuisineCompatibilityProfile,
} from '@/data/unified/cuisineIntegrations';
import { Season } from '@/types/seasons';

// Keep the interface exports for any code that depends on them
export interface Cuisine {
  id: string;
  name: string;
  description: string;
  elementalProperties: Record<string, number>;
  astrologicalInfluences: string[];
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhase[];
}

interface CuisineStyles {
  container: string;
  title: string;
  cuisineList: string;
  cuisineCard: string;
  cuisineName: string;
  description: string;
  alchemicalProperties: string;
  subtitle: string;
  propertyList: string;
  property: string;
  propertyName: string;
  propertyValue: string;
  astrologicalInfluences: string;
  influenceList: string;
  influence: string;
  loading: string;
  error: string;
}

// Initialize the unified cuisine integration system
const cuisineIntegrationSystem = new UnifiedCuisineIntegrationSystem();

// Add this helper function near the top of the file, outside any components
const getSafeScore = (score: unknown): number => {
  // Convert to number if needed, default to 0.5 if NaN or undefined
  const numScore = typeof score === 'number' ? score : parseFloat(score as string);
  return !isNaN(numScore) ? numScore : 0.5;
};

// Local implementation - moved before usage
function calculateElementalMatch(
  recipeElements: ElementalProperties,
  userElements: ElementalProperties
): number {
  // Calculate similarity based on elemental profiles
  let matchSum = 0;
  let totalWeight = 0;
  
  // Get dominant elements
  const recipeDominant = Object.entries(recipeElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);
    
  const userDominant = Object.entries(userElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);
  
  // Calculate base match score (weighted sum of similarity)
  for (const element of ['Fire', 'Water', 'Earth', 'Air'] as Array<keyof ElementalProperties>) {
    const recipeValue = recipeElements[element] || 0;
    const userValue = userElements[element] || 0;
    const weight = recipeDominant.includes(element as string) ? 1.5 : 1;
    
    matchSum += (1 - Math.abs(recipeValue - userValue)) * weight;
    totalWeight += weight;
  }
  
  // Calculate dominant element match bonus
  const dominantMatches = recipeDominant.filter(element => userDominant.includes(element)).length;
  const dominantBonus = dominantMatches * 0.1; // Add up to 0.2 bonus for matching dominant elements
  
  // Calculate final score
  const baseScore = matchSum / totalWeight;
  const finalScore = baseScore + dominantBonus;
  
  // Ensure score is between 0 and 1
  return Math.min(1, Math.max(0, finalScore));
}

// Add type guard after imports
function isCuisineData(value: unknown): value is CuisineData {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'elementalState' in value && typeof value.elementalState === 'object';
}

// Enhanced scoring algorithm with Monica/Kalchm integration
function calculateEnhancedCuisineScore(
  cuisine: Record<string, unknown>,
  astroState: Record<string, unknown>,
  currentSeason?: Season
): EnhancedCuisineScore {
  // Initialize scoring components
  let elementalMatch = 0.5;
  let monicaCompatibility = 0.5;
  let kalchmHarmony = 0.5;
  let zodiacAlignment = 0.5;
  let lunarAlignment = 0.5;
  let seasonalOptimization = 0.5;
  let culturalSynergy = 0.5;

  const cuisineName = cuisine.name?.toString().toLowerCase() || cuisine.id?.toString().toLowerCase();
  const monicaProfile = cuisineName ? cuisineMonicaConstants[cuisineName] : undefined;

  // 1. ELEMENTAL MATCH CALCULATION
  if (astroState?.elementalState && isCuisineData(cuisine) && (cuisine && typeof cuisine === 'object' && 'elementalAlignment' in cuisine ? (cuisine as { elementalAlignment?: ElementalData }).elementalAlignment : undefined)) {
    try {
      elementalMatch = calculateElementalMatch(
        (cuisine && typeof cuisine === 'object' && 'elementalAlignment' in cuisine ? (cuisine as { elementalAlignment?: ElementalData }).elementalAlignment : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as ElementalProperties,
        astroState.elementalState as ElementalProperties
      );
    } catch (error) {
      // console.warn('Error calculating elemental match:', error);
      elementalMatch = 0.5;
    }
  }

  // 2. MONICA COMPATIBILITY CALCULATION
  if (monicaProfile && astroState?.elementalState) {
    try {
      // Calculate Monica compatibility based on current elemental state
      const userMonicaEstimate = calculateMomentMonicaConstant(astroState.elementalState as ElementalProperties);
      const monicaDifference = Math.abs(monicaProfile.baseMonicaConstant - userMonicaEstimate);
      
      // Self-reinforcement principle: similar Monica values = higher compatibility
      monicaCompatibility = Math.max(0.7, 1 - (monicaDifference * 0.5));
      
      // Apply seasonal modifiers
      if (currentSeason && monicaProfile.seasonalModifiers && monicaProfile.seasonalModifiers[currentSeason]) {
        const seasonalModifier = monicaProfile.seasonalModifiers[currentSeason];
        monicaCompatibility *= seasonalModifier;
        monicaCompatibility = Math.min(1.0, monicaCompatibility);
      }
    } catch (error) {
      // console.warn('Error calculating Monica compatibility:', error);
      monicaCompatibility = 0.5;
    }
  }

  // 3. KALCHM HARMONY CALCULATION
  if (cuisineName) {
    try {
      // Use the system's Kalchm harmony calculation
      kalchmHarmony = cuisineIntegrationSystem.calculateKalchmHarmony([cuisineName]);
      
      // If we have multiple user preference cuisines, calculate harmony between them
      if (astroState?.preferredCuisines && Array.isArray(astroState.preferredCuisines) && astroState.preferredCuisines?.length > 0) {
        const userCuisines = astroState.preferredCuisines.map((c: CuisinePreference) => c.name?.toLowerCase() || String(c).toLowerCase());
        const harmonies = userCuisines.map((userCuisine: string) => 
          cuisineIntegrationSystem.calculateKalchmHarmony([cuisineName, userCuisine])
        );
        kalchmHarmony = harmonies.reduce((sum: number, h: number) => sum + h, 0) / harmonies.length;
      }
    } catch (error) {
      // console.warn('Error calculating Kalchm harmony:', error);
      kalchmHarmony = 0.5;
    }
  }

  // 4. ZODIAC ALIGNMENT CALCULATION
  if (astroState?.zodiacSign && cuisine.zodiacInfluences && Array.isArray(cuisine.zodiacInfluences)) {
    try {
      if (cuisine.zodiacInfluences.includes(astroState.zodiacSign)) {
        zodiacAlignment = 0.9; // Strong alignment
      } else {
        // Check for elemental compatibility between zodiac and cuisine
        const zodiacElement = getZodiacElement(astroState.zodiacSign as string);
        const dominantCuisineElement = getDominantElement((cuisine && typeof cuisine === 'object' && 'elementalAlignment' in cuisine ? (cuisine as { elementalAlignment?: Record<string, number> }).elementalAlignment : {}) as Record<string, number> || {});
        zodiacAlignment = calculateElementalAlignment(zodiacElement, dominantCuisineElement);
      }
    } catch (error) {
      // console.warn('Error calculating zodiac alignment:', error);
      zodiacAlignment = 0.5;
    }
  }

  // 5. LUNAR ALIGNMENT CALCULATION
  if (astroState?.lunarPhase && cuisine.lunarPhaseInfluences && Array.isArray(cuisine.lunarPhaseInfluences)) {
    try {
      if (cuisine.lunarPhaseInfluences.includes(astroState.lunarPhase)) {
        lunarAlignment = 0.85; // Good alignment
      } else {
        // Calculate lunar phase compatibility
        lunarAlignment = calculateLunarPhaseCompatibility(
          astroState.lunarPhase as string, 
          cuisine.lunarPhaseInfluences as string[]
        );
      }
    } catch (error) {
      // console.warn('Error calculating lunar alignment:', error);
      lunarAlignment = 0.5;
    }
  }

  // 6. SEASONAL OPTIMIZATION
  if (currentSeason && cuisineName) {
    try {
      seasonalOptimization = cuisineIntegrationSystem.getCuisineSeasonalCompatibility(
        cuisineName, 
        currentSeason
      );
    } catch (error) {
      // console.warn('Error calculating seasonal optimization:', error);
      seasonalOptimization = 0.5;
    }
  }

  // 7. CULTURAL SYNERGY (based on user's cuisine history or preferences)
  if (astroState?.culturalPreferences || astroState?.preferredCuisines) {
    try {
      const userCulturalGroups = extractCulturalGroups(
        (astroState as { preferredCuisines?: unknown[]; culturalPreferences?: unknown[] }).preferredCuisines || 
        (astroState as { culturalPreferences?: unknown[] }).culturalPreferences || []
      );
      const cuisineCulturalGroup = getCuisineCulturalGroup(cuisineName || '');
      culturalSynergy = calculateCulturalSynergy(userCulturalGroups, cuisineCulturalGroup);
    } catch (error) {
      // console.warn('Error calculating cultural synergy:', error);
      culturalSynergy = 0.5;
    }
  }

  // 8. CALCULATE WEIGHTED OVERALL SCORE
  const weights = {
    elemental: 0.25,     // 25% - Elemental compatibility
    monica: 0.20,        // 20% - Monica constant compatibility  
    kalchm: 0.15,        // 15% - Kalchm harmony
    zodiac: 0.15,        // 15% - Zodiac alignment
    lunar: 0.10,         // 10% - Lunar phase alignment
    seasonal: 0.10,      // 10% - Seasonal optimization
    cultural: 0.05       // 5% - Cultural synergy
  };

  const overallScore = (
    elementalMatch * weights.elemental +
    monicaCompatibility * weights.monica +
    kalchmHarmony * weights.kalchm +
    zodiacAlignment * weights.zodiac +
    lunarAlignment * weights.lunar +
    seasonalOptimization * weights.seasonal +
    culturalSynergy * weights.cultural
  );

  // 9. CALCULATE CONFIDENCE SCORE
  const confidence = calculateScoreConfidence({
    elementalMatch,
    monicaCompatibility,
    kalchmHarmony,
    zodiacAlignment,
    lunarAlignment,
    seasonalOptimization,
    culturalSynergy
  });

  return {
    elementalMatch,
    monicaCompatibility,
    kalchmHarmony,
    zodiacAlignment,
    lunarAlignment,
    seasonalOptimization,
    culturalSynergy,
    overallScore: Math.min(0.98, Math.max(0.1, overallScore)), // Clamp between 0.1-0.98
    confidence
  };
}

// Helper functions for enhanced scoring
function calculateMomentMonicaConstant(elementalState: ElementalProperties): number {
  // Estimate current moment's Monica constant based on elemental state
  const { Fire, Water, Earth, Air } = elementalState;
  
  // Higher fire and air = higher Monica constant (more transformative)
  // Higher earth and water = lower Monica constant (more grounding)
  const transformativeEnergy = (Fire * 1.4) + (Air * 1.2);
  const groundingEnergy = (Earth * 1.3) + (Water * 1.1);
  
  const baseConstant = 1.0 + (transformativeEnergy - groundingEnergy) * 0.4;
  return Math.max(0.8, Math.min(1.6, baseConstant));
}

function getZodiacElement(zodiacSign: string): string {
  const zodiacElements: Record<string, string> = {
    'aries': 'Fire', 'leo': 'Fire', 'sagittarius': 'Fire',
    'taurus': 'Earth', 'virgo': 'Earth', 'capricorn': 'Earth',
    'gemini': 'Air', 'libra': 'Air', 'aquarius': 'Air',
    'cancer': 'Water', 'scorpio': 'Water', 'pisces': 'Water'
  };
  return zodiacElements[zodiacSign?.toLowerCase()] || 'Air';
}

function getDominantElement(elementalProps: Record<string, number>): string {
  if (!elementalProps || Object.keys(elementalProps).length === 0) {
    return 'Fire'; // Default
  }
  return Object.entries(elementalProps)
    .reduce((a, b) => elementalProps[a[0]] > elementalProps[b[0]] ? a : b)[0];
}

function calculateElementalAlignment(element1: string, element2: string): number {
  // Self-reinforcement: same elements have high compatibility
  if (element1 === element2) return 0.9;
  
  // All different elements have good compatibility (no opposites)
  return 0.7;
}

function calculateLunarPhaseCompatibility(
  userPhase: string, 
  cuisinePhases: string[]
): number {
  // Basic lunar phase compatibility logic
  const phaseStrength: Record<string, number> = {
    'new moon': 0.8,
    'waxing crescent': 0.85,
    'first quarter': 0.7,
    'waxing gibbous': 0.9,
    'full moon': 0.95,
    'waning gibbous': 0.85,
    'last quarter': 0.7,
    'waning crescent': 0.75
  };
  
  const userStrength = phaseStrength[userPhase] || 0.7;
  const cuisineStrengths = cuisinePhases.map(phase => phaseStrength[phase] || 0.7);
  const avgCuisineStrength = cuisineStrengths.reduce((sum, s) => sum + s, 0) / cuisineStrengths.length;
  
  // Compatibility based on phase strength similarity
  return Math.max(0.6, 1 - Math.abs(userStrength - avgCuisineStrength));
}

function extractCulturalGroups(preferences: unknown[]): string[] {
  const culturalMapping: Record<string, string> = {
    'italian': 'european', 'french': 'european', 'spanish': 'european',
    'chinese': 'east_asian', 'japanese': 'east_asian', 'korean': 'east_asian',
    'indian': 'south_asian', 'thai': 'southeast_asian', 'vietnamese': 'southeast_asian',
    'mexican': 'latin_american', 'middle-eastern': 'middle_eastern',
    'american': 'north_american', 'african': 'african'
  };
  
  return preferences
    .map(pref => {
      const prefName = (pref as { name?: string })?.name;
      const prefString = typeof pref === 'string' ? pref : '';
      const key = (typeof prefName === 'string' ? prefName.toLowerCase() : prefString.toLowerCase());
      return culturalMapping[key];
    })
    .filter(Boolean);
}

function getCuisineCulturalGroup(cuisineName: string): string {
  const culturalMapping: Record<string, string> = {
    'italian': 'european', 'french': 'european', 'spanish': 'european',
    'chinese': 'east_asian', 'japanese': 'east_asian', 'korean': 'east_asian',
    'indian': 'south_asian', 'thai': 'southeast_asian', 'vietnamese': 'southeast_asian',
    'mexican': 'latin_american', 'middle-eastern': 'middle_eastern',
    'american': 'north_american', 'african': 'african'
  };
  
  return culturalMapping[cuisineName] || 'other';
}

function calculateCulturalSynergy(userGroups: string[], cuisineGroup: string): number {
  if (userGroups.includes(cuisineGroup)) return 0.9;
  if (userGroups?.length === 0) return 0.7; // Default if no preferences
  return 0.6; // Different cultural groups
}

function calculateScoreConfidence(scores: Record<string, unknown>): number {
  // Higher confidence when scores are more decisive (further from 0.5)
  const deviations = Object.values(scores).map((score: unknown) => {
    const numericScore = typeof score === 'number' ? score : 0.5;
    return Math.abs(numericScore - 0.5);
  });
  const avgDeviation = deviations.reduce((sum: number, dev: number) => sum + dev, 0) / deviations.length;
  return Math.min(0.95, 0.5 + avgDeviation);
}

// Add this helper function just before the CuisineRecommender component definition
// Helper function to ensure consistent recipe structure
function buildCompleteRecipe(
  recipe: RecipeData, 
  cuisineName: string, 
  currentMomentElementalProfile?: ElementalProperties, 
  astrologicalState?: AstroState,
  currentSeason?: Season
): RecipeData {
  // Set default values for undefined properties
  const defaultElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };

  // Find the cuisine flavor profile to use its elemental properties as a base
  const cuisineProfile = Object.values(cuisineFlavorProfiles).find(c => 
    (c as { name?: string })?.name?.toLowerCase() === cuisineName?.toLowerCase() ||
    (c as { id?: string })?.id?.toLowerCase() === cuisineName?.toLowerCase()
  );

  // ENHANCED: Calculate comprehensive recipe scoring with Kalchm integration
  const calculateRecipeScore = (recipe: RecipeData, _cuisine: Record<string, unknown>, currentMomentElements: ElementalProperties) => {
    const recipeElements = recipe.elementalProperties || 
      cuisineProfile?.elementalAlignment || 
      (cuisineProfile as { elementalProperties?: Record<string, number> })?.elementalProperties || 
      defaultElementalProperties;

    // 1. Elemental Match (40%) - using current moment's elemental state
    const elementalMatch = calculateElementalMatch(recipeElements as ElementalProperties, currentMomentElements);
    
    // 2. Kalchm Harmony (25%) - estimate recipe Kalchm from ingredients and cooking methods
    let recipeKalchm = 1.0; // Default neutral Kalchm
    
    // Estimate Kalchm from cooking methods
    const cookingMethods = recipe.cookingMethods || recipe.techniques || [];
    const kalchmModifiers: { [key: string]: number } = {
      'grilling': 1.15, 'roasting': 1.12, 'searing': 1.18, 'frying': 1.10,
      'steaming': 0.95, 'boiling': 0.92, 'poaching': 0.90,
      'baking': 0.88, 'slow-cooking': 0.85, 'smoking': 0.87,
      'stir-frying': 1.04, 'sautéing': 1.02, 'braising': 0.98
    };
    
    (Array.isArray(cookingMethods) ? cookingMethods : []).forEach((method: string) => {
      const modifier = kalchmModifiers[method?.toLowerCase()] || 1.0;
      recipeKalchm *= modifier;
    });
    
    // Estimate Kalchm from ingredient complexity
    const ingredientCount = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).length;
    const complexityModifier = Math.min(1.2, 0.9 + (ingredientCount * 0.02));
    recipeKalchm *= complexityModifier;
    
    // Get current moment's Kalchm from elemental state
    const currentMomentKalchm = calculateMomentMonicaConstant(currentMomentElements);
    const kalchmHarmony = Math.max(0.6, 1 - Math.abs(recipeKalchm - currentMomentKalchm) * 0.5);
    
    // 3. Astrological Alignment (20%)
    let astrologicalAlignment = 0.7; // Default
    if (astrologicalState && typeof astrologicalState === 'object' && 'currentZodiac' in astrologicalState) {
      const zodiacElement = getZodiacElement((astrologicalState as { currentZodiac?: string }).currentZodiac || 'aries');
      const dominantRecipeElement = getDominantElement(recipeElements as Record<string, number>);
      astrologicalAlignment = calculateElementalAlignment(zodiacElement, dominantRecipeElement);
    }
    
    // 4. Seasonal Optimization (10%)
    let seasonalOptimization = 0.7; // Default
    if (recipe.seasonality || recipe.season) {
      const recipeSeasons = Array.isArray(recipe.seasonality) ? recipe.seasonality : [recipe.seasonality || recipe.season];
      seasonalOptimization = recipeSeasons.includes(currentSeason) || recipeSeasons.includes('all') ? 0.9 : 0.6;
    }
    
    // 5. Difficulty Bonus (5%) - easier recipes get slight bonus for accessibility
    const difficultyBonus = (() => {
      const difficulty = (typeof recipe.difficulty === 'string' ? recipe.difficulty : 'medium').toLowerCase();
      if (difficulty.includes('easy') || difficulty.includes('simple')) return 0.9;
      if (difficulty.includes('medium') || difficulty.includes('intermediate')) return 0.8;
      return 0.7; // Hard recipes get lower bonus but still viable
    })();
    
    // Calculate weighted final score
    const weights = {
      elemental: 0.40,
      kalchm: 0.25,
      astrological: 0.20,
      seasonal: 0.10,
      difficulty: 0.05
    };
    
    const finalScore = (
      elementalMatch * weights.elemental +
      kalchmHarmony * weights.kalchm +
      astrologicalAlignment * weights.astrological +
      seasonalOptimization * weights.seasonal +
      difficultyBonus * weights.difficulty
    );
    
    return {
      score: finalScore,
      matchPercentage: Math.round(finalScore * 100),
      elementalMatch: Math.round(elementalMatch * 100),
      kalchmHarmony: Math.round(kalchmHarmony * 100),
      astrologicalAlignment: Math.round(astrologicalAlignment * 100),
      seasonalOptimization: Math.round(seasonalOptimization * 100),
      recipeKalchm
    };
  };

  // Get current moment's elemental state from astrologize API
  const currentMomentElements = currentMomentElementalProfile || astrologicalState?.domElements || defaultElementalProperties;
  
  // Calculate enhanced scoring using current moment's elemental state
  const scoring = calculateRecipeScore(recipe, cuisineProfile as unknown as Record<string, unknown>, currentMomentElements as unknown as ElementalProperties);

  // Complete recipe with enhanced data
  return {
    id: recipe.id || `recipe-${Math.random().toString(36).substring(2, 9)}`,
    name: recipe.name || `${cuisineName} Recipe`,
    description: recipe.description || `A traditional recipe from ${cuisineName} cuisine.`,
    cuisine: recipe.cuisine || cuisineName,
    
    // Enhanced scoring data
    matchPercentage: scoring.matchPercentage,
    matchScore: scoring.score,
    elementalMatch: scoring.elementalMatch,
    kalchmHarmony: scoring.kalchmHarmony,
    astrologicalAlignment: scoring.astrologicalAlignment,
    seasonalOptimization: scoring.seasonalOptimization,
    recipeKalchm: scoring.recipeKalchm,
    
    elementalProperties: recipe.elementalProperties || 
      (cuisineProfile && typeof cuisineProfile === 'object' && 'elementalAlignment' in cuisineProfile ? (cuisineProfile as unknown as Record<string, unknown>).elementalAlignment : 
       cuisineProfile && typeof cuisineProfile === 'object' && 'elementalProperties' in cuisineProfile ? (cuisineProfile as unknown as Record<string, unknown>).elementalProperties : 
       defaultElementalProperties) as ElementalData,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || recipe.preparationSteps || recipe.procedure || [],
    cookTime: recipe.cookTime || recipe.cooking_time || recipe.cook_time || "30 minutes",
    prepTime: recipe.prepTime || recipe.preparation_time || recipe.prep_time || "15 minutes",
    servingSize: recipe.servingSize || recipe.servings || recipe.yield || "4 servings",
    difficulty: recipe.difficulty || recipe.skill_level || "Medium",
    dietaryInfo: recipe.dietaryInfo || recipe.dietary_restrictions || [],
    cookingMethods: recipe.cookingMethods || recipe.techniques || [],
    seasonality: recipe.seasonality || recipe.season || [currentSeason],
    
    // Add any custom properties from the original recipe
    ...recipe
  };
}

export default function CuisineRecommender() {
  // Add a simple analytics tracking function
  const trackEvent = (eventName: string, eventValue: string) => {
    // This function will safely capture analytics events
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      // console.log(`[Analytics] ${eventName}: ${eventValue}`);
    }
    
    // Here you could integrate with analytics services like:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics endpoint
  };

  // Main state variables
  const [cuisineRecommendations, setCuisineRecommendations] = useState<any[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<SauceRecommendation[]>([]);
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  
  // UI state
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  const [expandedSauces, setExpandedSauces] = useState<ExpandedState>({});
  const [openSauceCards, setOpenSauceCards] = useState<ExpandedState>({});
  const [showRecipes, setShowRecipes] = useState(true);
  const [showSauces, setShowSauces] = useState(false);
  const [showCuisineDetails, setShowCuisineDetails] = useState(false);

  // FIXED: Add missing currentMomentElementalProfile state
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties | undefined>(
    undefined
  );
  
  // Ref to track loading state and prevent infinite loops
  const lastLoadedStateRef = useRef<string>('');

  // Get astrological state using the astrologize API
  const astrologicalState = useAstrologicalState();
  
  // Extract zodiac and lunar phase for template usage
  const currentZodiac = (astrologicalState && typeof astrologicalState === 'object' && 'currentZodiac' in astrologicalState) ? (astrologicalState as unknown as Record<string, unknown>).currentZodiac : 
    (astrologicalState && typeof astrologicalState === 'object' && 'zodiacSign' in astrologicalState) ? (astrologicalState as unknown as Record<string, unknown>).zodiacSign : null;
  const lunarPhase = astrologicalState?.lunarPhase || null;
  
  // Get current season for seasonal optimization
  const currentSeason: Season = useMemo(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, []);

  // ENHANCED: Update current moment elemental profile when astrological state changes
  useEffect(() => {
    if (astrologicalState?.isReady && astrologicalState?.domElements) {
      const newElementalState = astrologicalState.domElements;
      
      // Only update if the state has actually changed
      const currentProfileString = JSON.stringify(currentMomentElementalProfile || {});
      const newProfileString = JSON.stringify(newElementalState || {});
      
      if (newProfileString !== currentProfileString) {
        setCurrentMomentElementalProfile({ ...newElementalState });
        
        // Generate sauce recommendations with new elemental profile
        try {
          const topSauces = generateTopSauceRecommendations(newElementalState, 6);
          setSauceRecommendations(topSauces as unknown as SauceRecommendation[]);
        } catch (error) {
          // console.error('Error generating sauce recommendations:', error);
        }
      }
    } else if (astrologicalState?.currentZodiac && !currentMomentElementalProfile) {
      // Fallback: calculate from zodiac if no elemental state
      const zodiacElements = calculateElementalProfileFromZodiac(
        astrologicalState.currentZodiac
      );
      
      setCurrentMomentElementalProfile(zodiacElements);
      
      try {
        const topSauces = generateTopSauceRecommendations(zodiacElements, 6);
        setSauceRecommendations(topSauces as unknown as SauceRecommendation[]);
      } catch (error) {
        // console.error('Error generating sauce recommendations:', error);
      }
    }
  }, [astrologicalState?.isReady, astrologicalState?.domElements, astrologicalState?.currentZodiac, astrologicalState?.lunarPhase]);

  // Enhanced sauce recommendation generation with Monica/Kalchm integration
  const generateSauceRecommendationsForCuisine = useCallback((cuisineName: string) => {
    try {
      // Get all available sauces
      const saucesArray = allSauces ? Object.values(allSauces) : [];
      
      if (!saucesArray.length) {
        // console.log(`No sauces found in allSauces data`);
        return [];
      }
      
      // console.log(`Generating sauce recommendations for ${cuisineName} with ${saucesArray.length} available sauces`);
      
      // Get the cuisine's data for better matching
      const cuisine = cuisineRecommendations.find(c => 
        c.name.toLowerCase() === cuisineName.toLowerCase()
      );
      
      if (!cuisine) {
        // console.log(`No valid cuisine data found for "${cuisineName}"`);
        return [];
      }
      
      // Get cuisine's elemental profile and Monica profile
      const cuisineElements = cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      const monicaProfile = cuisineMonicaConstants[cuisineName.toLowerCase()];
      
      // Get current moment's elemental state from astrologize API
      const currentMomentElements = currentMomentElementalProfile || astrologicalState?.domElements || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      
      // Get current planetary hour for enhanced scoring
      const currentPlanetaryHour = astrologicalState?.currentPlanetaryHour || 'sun';
      
      // Map sauces with enhanced match calculations including Kalchm
      const saucesWithMatches = saucesArray.map(sauce => {
        const sauceData = sauce as unknown;
        const sauceElements = (sauceData && typeof sauceData === 'object' && 'elementalProperties' in sauceData) ? (sauceData as Record<string, unknown>).elementalProperties as unknown as ElementalProperties : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 } as ElementalProperties;
        
        // 1. Calculate cuisine-sauce elemental match
        const cuisineMatchScore = calculateElementalMatch(sauceElements as ElementalProperties, cuisineElements as ElementalProperties);
        
        // 2. Calculate match with current moment's elemental alignment
        const currentMomentMatchScore = calculateElementalMatch(sauceElements as ElementalProperties, currentMomentElements as ElementalProperties);
        
        // 3. Kalchm Harmony Calculation
        let kalchmHarmony = 0.7; // Default
        
        // Estimate sauce Kalchm from its properties
        let sauceKalchm = 1.0;
        
        // Kalchm modifiers based on sauce characteristics
        if (sauceData && typeof sauceData === 'object' && 'preparationMethod' in sauceData) {
          const kalchmModifiers: { [key: string]: number } = {
            'fermented': 1.25, 'aged': 1.15, 'cooked': 1.10, 'reduced': 1.12,
            'emulsified': 1.08, 'raw': 0.95, 'cold': 0.90, 'fresh': 0.85
          };
          
          const preparationMethod = (sauceData as Record<string, unknown>).preparationMethod;
          const method = typeof preparationMethod === 'string' ? preparationMethod.toLowerCase() : '';
          sauceKalchm *= kalchmModifiers[method] || 1.0;
        }
        
        // Complexity modifier based on ingredients
        const keyIngredients = (sauceData && typeof sauceData === 'object' && 'keyIngredients' in sauceData && Array.isArray((sauceData as Record<string, unknown>).keyIngredients)) ? (sauceData as Record<string, unknown>).keyIngredients as unknown[] : [];
        const ingredients = (sauceData && typeof sauceData === 'object' && 'ingredients' in sauceData && Array.isArray((sauceData as Record<string, unknown>).ingredients)) ? (sauceData as Record<string, unknown>).ingredients as unknown[] : [];
        const ingredientCount = (keyIngredients.length > 0 ? keyIngredients : ingredients).length;
        const complexityModifier = Math.min(1.2, 0.9 + (ingredientCount * 0.03));
        sauceKalchm *= complexityModifier;
        
                 // Get current moment's Monica constant for comparison
         const currentMomentKalchm = calculateMomentMonicaConstant(currentMomentElements);
         kalchmHarmony = Math.max(0.6, 1 - Math.abs(sauceKalchm - currentMomentKalchm) * 0.4);
        
        // 4. Monica compatibility (if available)
        let monicaCompatibility = 0.7; // Default
        if (monicaProfile && sauceData && typeof sauceData === 'object' && 'monicaConstant' in sauceData && typeof (sauceData as Record<string, unknown>).monicaConstant === 'number') {
          const monicaDifference = Math.abs(monicaProfile.baseMonicaConstant - ((sauceData as Record<string, unknown>).monicaConstant as number));
          monicaCompatibility = Math.max(0.6, 1 - (monicaDifference * 0.5));
        }
        
        // 5. Planetary Hour Alignment
        let planetaryHourScore = 0.7; // Default
        const astrologicalInfluences = (sauceData && typeof sauceData === 'object' && 'astrologicalInfluences' in sauceData && Array.isArray((sauceData as Record<string, unknown>).astrologicalInfluences)) ? (sauceData as Record<string, unknown>).astrologicalInfluences : [];
        const planetaryAffinities = (sauceData && typeof sauceData === 'object' && 'planetaryAffinities' in sauceData && Array.isArray((sauceData as Record<string, unknown>).planetaryAffinities)) ? (sauceData as Record<string, unknown>).planetaryAffinities : [];
        const saucePlanets = (astrologicalInfluences && typeof astrologicalInfluences === 'object' && 'length' in astrologicalInfluences && typeof astrologicalInfluences.length === 'number') ? 
          (astrologicalInfluences.length > 0 ? astrologicalInfluences : planetaryAffinities) : planetaryAffinities;
        if (saucePlanets && typeof saucePlanets === 'object' && 'includes' in saucePlanets && typeof saucePlanets.includes === 'function' && saucePlanets.includes(currentPlanetaryHour)) {
          planetaryHourScore = 0.9; // Bonus for matching current planetary hour
        }
        
        // 6. Seasonal optimization
        let seasonalBonus = 0;
        if (monicaProfile?.seasonalModifiers?.[currentSeason]) {
          seasonalBonus = (monicaProfile.seasonalModifiers[currentSeason] - 1.0) * 0.1;
        }
        
        // 7. Calculate weighted overall score with Kalchm integration
        const weights = {
          cuisine: 0.30,      // 30% - How well sauce matches cuisine
          moment: 0.25,       // 25% - How well sauce matches current moment's state
          kalchm: 0.20,       // 20% - Kalchm harmony (NEW)
          monica: 0.15,       // 15% - Monica compatibility
          planetary: 0.10     // 10% - Planetary hour alignment (NEW)
        };
        
        const combinedScore = (
          cuisineMatchScore * weights.cuisine +
          currentMomentMatchScore * weights.moment +
          kalchmHarmony * weights.kalchm +
          monicaCompatibility * weights.monica +
          planetaryHourScore * weights.planetary
        );
        
        // 8. Add cultural cuisine compatibility bonus
        let culturalBonus = 0;
        if (sauceData && typeof sauceData === 'object' && 'culturalOrigin' in sauceData && Array.isArray((sauceData as Record<string, unknown>).culturalOrigin)) {
          const culturalOrigin = (sauceData as Record<string, unknown>).culturalOrigin as string[];
          const cuisineCulturalGroup = getCuisineCulturalGroup(cuisineName);
          if (culturalOrigin && typeof culturalOrigin === 'object' && 'includes' in culturalOrigin && typeof culturalOrigin.includes === 'function' && cuisineCulturalGroup && typeof cuisineCulturalGroup === 'string' && cuisineCulturalGroup.toLowerCase && culturalOrigin.includes(cuisineCulturalGroup.toLowerCase())) {
            culturalBonus = 0.1;
          }
        }
        
        // 9. Apply seasonal bonus
        const seasonalOptimization = 0.7 + seasonalBonus;
        const finalScore = Math.min(0.95, (combinedScore + culturalBonus) * (0.9 + seasonalOptimization * 0.1));
        const matchPercentage = Math.round(finalScore * 100);
        
        return {
          ...sauce,
          id: (sauceData && typeof sauceData === 'object' && 'id' in sauceData) ? (sauceData as Record<string, unknown>).id : 
            (sauceData && typeof sauceData === 'object' && 'name' in sauceData && typeof (sauceData as Record<string, unknown>).name === 'string') ? ((sauceData as Record<string, unknown>).name as string).replace(/\s+/g, '-').toLowerCase() : 'unknown-sauce',
          matchPercentage,
          elementalMatchScore: Math.round(cuisineMatchScore * 100),
          currentMomentMatchScore: Math.round(currentMomentMatchScore * 100),
          kalchmHarmony: Math.round(kalchmHarmony * 100),
          monicaCompatibility: Math.round(monicaCompatibility * 100),
          planetaryHourScore: Math.round(planetaryHourScore * 100),
          seasonalOptimization: Math.round(seasonalOptimization * 100),
          culturalBonus: Math.round(culturalBonus * 100),
          sauceKalchm: Math.round(sauceKalchm * 100) / 100,
          cuisineName
        };
      });
      
      // Sort sauces by match percentage and return top matches
      const sortedSauces = saucesWithMatches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 8); // Return top 8 sauces
      
      // console.log(`Generated ${sortedSauces.length} enhanced sauce recommendations with Kalchm scoring for ${cuisineName}`);
      return sortedSauces;
    } catch (error) {
      // console.error('Error generating enhanced sauce recommendations:', error);
      return [];
    }
  }, [currentMomentElementalProfile, astrologicalState, currentSeason, cuisineRecommendations]);

  // ENHANCED CUISINE RECOMMENDATIONS WITH MONICA/KALCHM INTEGRATION
  const getEnhancedCuisineRecommendations = useCallback((astroState: AstroState) => {
    try {
      // Start with all cuisines
      const availableCuisines = cuisineFlavorProfiles ? Object.values(cuisineFlavorProfiles) : [];
      
      if (availableCuisines?.length === 0) {
        // console.warn('No cuisine flavor profiles available');
        return [];
      }
      
      // Create a map of parent cuisines to their regional variants
      const cuisineMap = new Map();
      
      // First pass - identify parent cuisines and standalone cuisines
      availableCuisines.forEach(cuisine => {
        try {
          // Skip regional variants for now
          if (!cuisine.parentCuisine) {
            cuisineMap.set((cuisine as { id?: string })?.id, {
              cuisine: cuisine,
              regionalVariants: []
            });
          }
        } catch (error) {
          // console.warn('Error processing cuisine:', cuisine?.name, error);
        }
      });
      
      // Second pass - add regional variants to their parents
      availableCuisines.forEach(cuisine => {
        try {
          if (cuisine.parentCuisine && cuisineMap.has(cuisine.parentCuisine)) {
            cuisineMap.get(cuisine.parentCuisine).regionalVariants.push(cuisine);
          }
        } catch (error) {
          // console.warn('Error processing regional variant:', cuisine?.name, error);
        }
      });
      
      // Transform cuisines with enhanced scoring
      const transformedCuisines: unknown[] = [];
      
      cuisineMap.forEach(({ cuisine, regionalVariants }, cuisineId) => {
        try {
          // Calculate enhanced score using Monica/Kalchm integration
          const enhancedScore = calculateEnhancedCuisineScore(cuisine, astroState, currentSeason);
          
          // Create the main cuisine object with enhanced data
          const mainCuisine = {
            id: cuisine.id || cuisine.name?.toLowerCase().replace(/\s+/g, '-') || `cuisine-${Math.random()}`,
            name: cuisine.name || 'Unknown Cuisine',
            description: cuisine.description || `A delicious cuisine with unique flavors and traditions.`,
            elementalProperties: cuisine.elementalAlignment || cuisine.elementalProperties || {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25
            },
            astrologicalInfluences: cuisine.zodiacInfluences || [],
            zodiacInfluences: cuisine.zodiacInfluences || [],
            lunarPhaseInfluences: cuisine.lunarPhaseInfluences || [],
            
            // Enhanced scoring data
            score: enhancedScore.overallScore,
            enhancedScore,
            matchPercentage: Math.round(enhancedScore.overallScore * 100),
            compatibilityScore: enhancedScore.overallScore,
            confidence: enhancedScore.confidence,
            
            // Monica/Kalchm data
            monicaProfile: cuisine.name ? cuisineMonicaConstants[cuisine.name.toLowerCase()] : undefined,
            
            recipes: [],
            // Add additional cuisine data if available
            signatureDishes: cuisine.signatureTechniques || cuisine.signatureDishes || [],
            commonIngredients: cuisine.signatureIngredients || cuisine.primaryIngredients || [],
            cookingTechniques: cuisine.signatureTechniques || cuisine.commonCookingMethods || [],
            // If we have regional variants, include them
            regionalVariants: regionalVariants.map((variant: Record<string, unknown>) => variant?.name)
          };
          
          transformedCuisines.push(mainCuisine);
          
          // Add regional variants with enhanced scoring
          regionalVariants.forEach((variant: Record<string, unknown>) => {
            try {
              const variantScore = calculateEnhancedCuisineScore(variant, astroState, currentSeason);
              
              // Regional variants get a slight penalty in base score
              variantScore.overallScore *= 0.95;
              
              transformedCuisines.push({
                id: (variant.id as string) || ((variant.name && typeof variant.name === 'string') ? variant.name.toLowerCase().replace(/\s+/g, '-') : `cuisine-${Math.random()}`),
                name: variant.name || 'Unknown Regional Cuisine',
                description: variant.description || `A regional variant of ${cuisine.name} cuisine with distinctive characteristics.`,
                elementalProperties: variant.elementalAlignment || variant.elementalProperties || {
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25
                },
                astrologicalInfluences: variant.zodiacInfluences || [],
                zodiacInfluences: variant.zodiacInfluences || [],
                lunarPhaseInfluences: variant.lunarPhaseInfluences || [],
                
                // Enhanced scoring data
                score: variantScore.overallScore,
                enhancedScore: variantScore,
                matchPercentage: Math.round(variantScore.overallScore * 100),
                compatibilityScore: variantScore.overallScore,
                confidence: variantScore.confidence,
                
                recipes: [],
                signatureDishes: variant.signatureTechniques || variant.signatureDishes || [],
                commonIngredients: variant.signatureIngredients || variant.primaryIngredients || [],
                cookingTechniques: variant.signatureTechniques || variant.commonCookingMethods || [],
                parentCuisine: cuisine.name
              });
            } catch (error) {
              // console.warn('Error processing variant scoring:', variant?.name, error);
            }
          });
        } catch (error) {
          // console.warn('Error processing cuisine scoring:', cuisine?.name, error);
        }
      });

      // FIXED: Sort cuisines by score in DESCENDING order (best matches first)
      return transformedCuisines
        .sort((a, b) => {
          const scoreA = (a && typeof a === 'object' && 'score' in a) ? Number(a.score) || 0 : 0;
          const scoreB = (b && typeof b === 'object' && 'score' in b) ? Number(b.score) || 0 : 0;
          return scoreB - scoreA;
        })
        .slice(0, 20); // Increased recommendations
    } catch (error) {
      // console.error('Error in getEnhancedCuisineRecommendations:', error);
      return [];
    }
  }, [currentSeason]);

  const loadCuisines = useCallback(async (
    currentAstroState?: Record<string, unknown>,
    currentElementalProfile?: ElementalProperties,
    season?: Season
  ) => {
    try {
      // Use passed parameters or fall back to current state
      const astroState = currentAstroState || astrologicalState;
      const _elementalProfile = currentElementalProfile || currentMomentElementalProfile;
      const currentSeasonToUse = season || currentSeason;
      
      // Create a stable key to track if we need to reload
      const stateKey = JSON.stringify({
        isReady: astroState?.isReady,
        zodiac: (astroState && typeof astroState === 'object' && 'currentZodiac' in astroState) ? (astroState as Record<string, unknown>).currentZodiac :
          (astroState && typeof astroState === 'object' && 'zodiacSign' in astroState) ? (astroState as Record<string, unknown>).zodiacSign : null,
        lunar: astroState?.lunarPhase,
        season: currentSeasonToUse
      });
      
      // Prevent infinite loops by checking if we've already loaded for this state
      if (lastLoadedStateRef.current === stateKey) {
        return;
      }
      
      lastLoadedStateRef.current = stateKey;
      
      setLoading(true);
      setError(null);
      
      setLoadingStep('Calculating astrological influences...');
      
      // Get enhanced cuisine recommendations
      const recommendations = getEnhancedCuisineRecommendations(astroState as unknown as Record<string, unknown>);
      
      if (recommendations?.length === 0) {
        // console.warn('No cuisine recommendations generated');
        setError('No cuisines available at this time. Please try again later.');
        return;
      }
      
      setCuisineRecommendations(recommendations);
      
      setLoadingStep('Loading recipe database...');
      
      // Load all recipes asynchronously
      const loadAllRecipes = async () => {
        try {
          if (typeof getAllRecipes === 'function') {
            const allRecipes = await getAllRecipes();
            return allRecipes || [];
          } else {
            // console.warn('getAllRecipes function not available');
            return [];
          }
        } catch (recipeError) {
          // console.warn('Could not load all recipes:', recipeError);
          return [];
        }
      };
      
      const allRecipes = await loadAllRecipes();
      
      setLoadingStep('Optimizing Monica constants...');
      
      // If we have a top recommendation, auto-select it and load its recipes
      if (recommendations?.length > 0) {
        const topRecommendation = recommendations[0];
        setSelectedCuisine((topRecommendation as { id?: string })?.id);
        
        setLoadingStep('Loading cuisine-specific recipes...');
        
        try {
          // Get recipes for the top cuisine
          const cuisineRecipes = getRecipesForCuisineMatch ? 
            await Promise.resolve(getRecipesForCuisineMatch((topRecommendation as { name?: string })?.name, allRecipes)) : [];
          
          const enhancedRecipes = Array.isArray(cuisineRecipes) ? cuisineRecipes.map(recipe => 
            buildCompleteRecipe(recipe as any, (topRecommendation as { name?: string })?.name, currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, astroState as any, currentSeasonToUse)
          ) : [];
          
          setRecipes(enhancedRecipes as any);
        } catch (recipeError) {
          // console.warn('Error loading recipes:', recipeError);
          setRecipes([]);
        }
        
        setLoadingStep('Generating sauce pairings...');
        
        try {
          // Generate sauce recommendations
          const sauceRecs = generateSauceRecommendationsForCuisine((topRecommendation as { name?: string })?.name);
          setSauceRecommendations(sauceRecs as unknown as SauceRecommendation[]);
          setSauces(allSauces ? Object.values(allSauces) : []);
        } catch (sauceError) {
          // console.warn('Error generating sauce recommendations:', sauceError);
          setSauceRecommendations([]);
          setSauces([]);
        }
      }
      
      setLoadingStep('Finalizing recommendations...');
      
    } catch (err) {
      // console.error('Error loading cuisines:', err);
      setError('Failed to load cuisine recommendations. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }, [getEnhancedCuisineRecommendations, generateSauceRecommendationsForCuisine]); // Add proper dependencies

  // Enhanced cuisine loading with Monica/Kalchm integration
  // FIXED: Pass current state values to loadCuisines, but use stable dependencies
  useEffect(() => {
    if (astrologicalState?.isReady) {
      loadCuisines(astrologicalState as unknown as Record<string, unknown>, currentMomentElementalProfile, currentSeason);
    }
  }, [astrologicalState?.isReady, astrologicalState?.currentZodiac, astrologicalState?.lunarPhase, currentSeason]);

  const handleCuisineSelect = (cuisineId: string) => {
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    
    // Find the selected cuisine
    const selectedCuisineData = cuisineRecommendations.find(
      (c) => c.id === cuisineId || c.name === cuisineId
    );
    
    if (!selectedCuisineData) {
      // console.warn('Could not find cuisine data for:', cuisineId);
      return;
    }
    
    logCuisineAction('cuisine_selected', {
      cuisineId,
      cuisineName: selectedCuisineData?.name,
      matchScore: selectedCuisineData.score
    });
    
    trackEvent('cuisine_selected', selectedCuisineData?.name);
    
    // Load recipes for the selected cuisine
    const loadRecipesForCuisine = async () => {
      try {
        setLoadingStep('Loading recipes...');
        setLoading(true);
        
        const allRecipes = await getAllRecipes();
        let cuisineRecipes = await Promise.resolve(getRecipesForCuisineMatch(selectedCuisineData?.name, allRecipes));
        
        // Enhanced recipe building with better scoring
        cuisineRecipes = Array.isArray(cuisineRecipes) ? cuisineRecipes.map(recipe => buildCompleteRecipe(recipe as unknown as RecipeData, selectedCuisineData?.name, currentMomentElementalProfile, astrologicalState as unknown as Record<string, unknown>, currentSeason)) : [];
        
        setRecipes(cuisineRecipes as unknown as Recipe[]);
        
        // Generate sauce recommendations for this cuisine
        const sauceRecs = generateSauceRecommendationsForCuisine(selectedCuisineData?.name);
        setSauceRecommendations(sauceRecs as unknown as SauceRecommendation[]);
        setSauces((allSauces || []) as unknown as Sauce[]);
        
      } catch (error) {
        // console.error('Error loading recipes for cuisine:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    };
    
    loadRecipesForCuisine();
  };
  
  const logCuisineAction = (step: string, details?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      // console.log(`[Cuisine Action] ${step}:`, _details);
    }
  };

  const toggleRecipeExpansion = (index: number, event: React.MouseEvent) => {
    // Prevent event bubbling if clicking on interactive elements
    if ((event.target as HTMLElement).closest('button, a, input, select')) {
      return;
    }
    
    setExpandedRecipes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
    
    trackEvent('recipe_expanded', `recipe_${index}`);
    
    logCuisineAction('recipe_expanded', {
      recipeIndex: index,
      expanded: !expandedRecipes[index]
    });
  };

  const toggleSauceExpansion = (index: number) => {
    setExpandedSauces(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSauceCard = (sauceId: string) => {
    setOpenSauceCards(prev => ({
      ...prev,
      [sauceId]: !prev[sauceId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-3 bg-white rounded-lg shadow">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-lg font-medium">Loading cuisine recommendations...</p>
          <p className="text-sm text-gray-500">{loadingStep}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>;
  }

  // Get the currently selected cuisine data
  const selectedCuisineData = cuisineRecommendations.find(
    (c) => c.id === selectedCuisine || c.name === selectedCuisine
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-medium mb-3">Celestial Cuisine Guide</h2>

      {/* Group cuisine cards in a better grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {cuisineRecommendations.map((cuisine) => {
          // Calculate match percentage
          const matchPercentage = cuisine.matchPercentage || 
            (cuisine.compatibilityScore ? Math.round(cuisine.compatibilityScore * 100) : 50);

          // Check if this is a regional variant
          const isRegionalVariant = !!cuisine.parentCuisine;

          return (
            <div
              key={cuisine.id}
              className={`rounded border p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCuisine === cuisine.id || selectedCuisine === cuisine.name
                  ? 'border-blue-400 bg-blue-50'
                  : isRegionalVariant 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-gray-200'
              }`}
              onClick={() => handleCuisineSelect(cuisine?.id)}
            >
              {/* Cuisine header with name and match score */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium text-sm">{cuisine.name}</h3>
                  {isRegionalVariant && (
                    <span className="text-xs text-gray-500">Regional variant of {cuisine.parentCuisine}</span>
                  )}
                  {cuisine.regionalVariants && cuisine.regionalVariants?.length > 0 && (
                    <span className="text-xs text-gray-500 block">
                      {cuisine.regionalVariants.length} regional variants
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(
                    cuisine.compatibilityScore || cuisine.score || 0.5
                  )}`}
                >
                  {matchPercentage}%
                </span>
              </div>

              {/* Cuisine description - truncated */}
              <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={cuisine.description}>
                {cuisine.description}
              </p>

              {/* Elemental properties */}
              <div className="flex items-center space-x-1 mb-2">
                <span className="text-xs font-medium text-gray-500">Elements:</span>
                <div className="flex space-x-1">
                  {cuisine.elementalProperties.Fire >= 0.3 && (
                    <div className="flex items-center" title={`Fire: ${Math.round(cuisine.elementalProperties.Fire * 100)}%`}>
                      <Flame size={14} className="text-red-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalProperties.Fire * 100)}%</span>
                    </div>
                  )}
                  {cuisine.elementalProperties.Water >= 0.3 && (
                    <div className="flex items-center" title={`Water: ${Math.round(cuisine.elementalProperties.Water * 100)}%`}>
                      <Droplets size={14} className="text-blue-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalProperties.Water * 100)}%</span>
                    </div>
                  )}
                  {cuisine.elementalProperties.Earth >= 0.3 && (
                    <div className="flex items-center" title={`Earth: ${Math.round(cuisine.elementalProperties.Earth * 100)}%`}>
                      <Mountain size={14} className="text-green-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalProperties.Earth * 100)}%</span>
                    </div>
                  )}
                  {cuisine.elementalProperties.Air >= 0.3 && (
                    <div className="flex items-center" title={`Air: ${Math.round(cuisine.elementalProperties.Air * 100)}%`}>
                      <Wind size={14} className="text-yellow-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalProperties.Air * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Show signature dishes and techniques if available */}
              {cuisine.signatureDishes && cuisine.signatureDishes?.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs font-medium text-gray-500 block">Signature dishes:</span>
                  <span className="text-xs text-gray-600">
                    {(Array.isArray(cuisine.signatureDishes) ? cuisine.signatureDishes.slice(0, 3).join(", ") : "")}
                    {(Array.isArray(cuisine.signatureDishes) && cuisine.signatureDishes.length > 3 ? "..." : "")}
                  </span>
                </div>
              )}

              {/* Show astrological influences if available */}
              {cuisine.zodiacInfluences && cuisine.zodiacInfluences?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {cuisine.zodiacInfluences.slice(0, 3).map(sign => (
                    <span 
                      key={sign} 
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs
                        ${currentZodiac === sign ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {sign}
                      {currentZodiac === sign && <span className="ml-1">✓</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Standalone Sauce Recommendations Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-3">Celestial Sauce Harmonizer</h3>
        <p className="text-sm text-gray-600 mb-4">
          Discover sauces that complement the current moment's alchemical alignment and enhance your culinary experience.
        </p>
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Finding harmonious sauces...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(sauceRecommendations?.length > 0 ? sauceRecommendations : (() => {
              try {
                return generateTopSauceRecommendations(currentMomentElementalProfile, 6) || [];
              } catch (error) {
                // console.warn('Error generating fallback sauce recommendations:', error);
                return [];
              }
            })()).map((sauce, index) => (
              <div
                key={`${sauce.id || sauce.name}-${index}`}
                className={`p-3 border rounded bg-white hover:shadow-md transition-all duration-200 ${
                  openSauceCards[`${sauce.id || sauce.name}-${index}`] ? 'shadow-md' : ''
                }`}
                onClick={() => toggleSauceCard(`${sauce.id || sauce.name}-${index}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm leading-tight mr-1">{sauce.name}</h5>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                      sauce.matchPercentage / 100
                    )}`}
                  >
                    {sauce.matchPercentage}%
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed text-gray-600 line-clamp-3 grow"
                  title={sauce.description}
                >
                  {sauce.description}
                </p>
                
                {/* Show elemental properties */}
                <div className="flex space-x-1 mt-2">
                  {sauce.elementalProperties?.Fire >= 0.3 && (
                    <div className="flex items-center" title="Fire">
                      <Flame size={12} className="text-red-500" />
                    </div>
                  )}
                  {sauce.elementalProperties?.Water >= 0.3 && (
                    <div className="flex items-center" title="Water">
                      <Droplets size={12} className="text-blue-500" />
                    </div>
                  )}
                  {sauce.elementalProperties?.Earth >= 0.3 && (
                    <div className="flex items-center" title="Earth">
                      <Mountain size={12} className="text-green-500" />
                    </div>
                  )}
                  {sauce.elementalProperties?.Air >= 0.3 && (
                    <div className="flex items-center" title="Air">
                      <Wind size={12} className="text-yellow-500" />
                    </div>
                  )}
                </div>

                {/* Show key ingredients if available */}
                {sauce.ingredients && sauce.ingredients?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sauce.ingredients.slice(0, 3).map((ingredient, i) => (
                      <span key={i} className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-100">
                        {ingredient}
                      </span>
                    ))}
                    {sauce.ingredients?.length > 3 && (
                      <span className="text-xs text-gray-500">+{sauce.ingredients.length - 3} more</span>
                    )}
                  </div>
                )}
                
                {/* Expanded sauce details */}
                {openSauceCards[`${sauce.id || sauce.name}-${index}`] && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    <div className="mt-2 mb-2 space-y-1">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Elemental Match:</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                            sauce.elementalMatchScore / 100
                          )}`}
                        >
                          {sauce.elementalMatchScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Celestial Alignment:</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                            sauce.userMatchScore / 100
                          )}`}
                        >
                          {sauce.userMatchScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Planetary Day Match:</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                            sauce.planetaryDayScore / 100
                          )}`}
                        >
                          {sauce.planetaryDayScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Planetary Hour Match:</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                            sauce.planetaryHourScore / 100
                          )}`}
                        >
                          {sauce.planetaryHourScore}%
                        </span>
                      </div>
                    </div>

                    {/* Show all ingredients */}
                    {sauce.ingredients && sauce.ingredients?.length > 0 && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Ingredients:</h6>
                        <div className="flex flex-wrap gap-1">
                          {sauce.ingredients.map(
                            (ingredient: string, i: number) => (
                              <span key={i} className="inline-block px-1.5 py-0.5 bg-gray-100 rounded">
                                {ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show preparation steps */}
                    {(sauce.preparationSteps ||
                      sauce.procedure ||
                      sauce.instructions) && (
                      <div className="mt-2">
                        <h6 className="font-medium mb-1">Preparation:</h6>
                        {Array.isArray(
                          sauce.preparationSteps ||
                            sauce.procedure ||
                            sauce.instructions
                        ) ? (
                          <ol className="pl-4 list-decimal">
                            {(
                              sauce.preparationSteps ||
                              sauce.procedure ||
                              sauce.instructions
                            ).map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        ) : (
                          <p>
                            {sauce.preparationSteps ||
                              sauce.procedure ||
                              sauce.instructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display expanded details for selected cuisine */}
      {selectedCuisineData && showCuisineDetails && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold text-lg">
                {selectedCuisineData.name} Cuisine
              </h3>
              {selectedCuisineData.parentCuisine && (
                <span className="text-sm text-gray-500">Regional variant of {selectedCuisineData.parentCuisine}</span>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(
                selectedCuisineData.compatibilityScore || 
                selectedCuisineData.score || 0.5
              )}`}
            >
              {selectedCuisineData.matchPercentage || 
                Math.round((selectedCuisineData.compatibilityScore || 
                  selectedCuisineData.score || 0.5) * 100)
              }% match
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            {selectedCuisineData.description}
          </p>

          {/* Display more detailed information about the cuisine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Elemental properties */}
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="text-sm font-medium mb-2">Elemental Properties</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedCuisineData.elementalProperties).map(([element, value]) => (
                  <div key={element} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {element === 'Fire' && <Flame size={16} className="text-red-500 mr-1" />}
                      {element === 'Water' && <Droplets size={16} className="text-blue-500 mr-1" />}
                      {element === 'Earth' && <Mountain size={16} className="text-green-500 mr-1" />}
                      {element === 'Air' && <Wind size={16} className="text-yellow-500 mr-1" />}
                      <span className="text-sm">{element}</span>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          element === 'Fire' ? 'bg-red-500' : 
                          element === 'Water' ? 'bg-blue-500' : 
                          element === 'Earth' ? 'bg-green-500' : 
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.round(Number(value) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Astrological influences */}
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="text-sm font-medium mb-2">Astrological Influences</h4>
              {selectedCuisineData.zodiacInfluences && selectedCuisineData.zodiacInfluences?.length > 0 ? (
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">Zodiac:</span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(selectedCuisineData.zodiacInfluences as string[]).map(sign => (
                      <span 
                        key={sign} 
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs
                          ${currentZodiac === sign ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {sign}
                        {currentZodiac === sign && <span className="ml-1">✓</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No specific zodiac influences</p>
              )}
              
              {selectedCuisineData.lunarPhaseInfluences && selectedCuisineData.lunarPhaseInfluences?.length > 0 ? (
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">Lunar Phases:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCuisineData.lunarPhaseInfluences.map(phase => (
                      <span 
                        key={phase} 
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs
                          ${lunarPhase === phase ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {phase}
                        {lunarPhase === phase && <span className="ml-1">✓</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Regional variants if any */}
          {selectedCuisineData.regionalVariants && selectedCuisineData.regionalVariants?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Regional Variants</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCuisineData.regionalVariants.map(variant => (
                  <span 
                    key={variant} 
                    className="inline-flex items-center px-2 py-1 rounded text-sm bg-gray-100 text-gray-800"
                  >
                    {variant}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Signature dishes if available */}
          {selectedCuisineData.signatureDishes && selectedCuisineData.signatureDishes?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Signature Dishes</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCuisineData.signatureDishes.map((dish, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-1 rounded text-sm bg-yellow-50 text-yellow-800"
                  >
                    {dish}
                  </span>
                ) as React.ReactNode)}
              </div>
            </div>
          )}

          {/* Recipe Recommendations - Shown after cuisine info */}
          {recipes && recipes?.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">
                Recipes ({recipes.length} available)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recipes
                  .slice(0, showRecipes ? undefined : 6)
                  .map((recipe, index) => (
                    <div
                      key={`${recipe.id || recipe.name}-${index}`}
                      className={`border rounded p-3 bg-white cursor-pointer hover:shadow-md transition-all duration-200 ${expandedRecipes[index] ? 'shadow-md' : ''}`}
                      onClick={(e) => toggleRecipeExpansion(index, e as React.MouseEvent)}
                      data-recipe-index={index}
                      data-recipe-name={recipe.name}
                      data-is-expanded={expandedRecipes[index] ? 'true' : 'false'}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <h5 className="font-medium text-sm">{recipe.name}</h5>
                          {recipe.regionalVariant && (
                            <span className="text-xs text-gray-500">
                              {recipe.regionalVariant as any} style
                            </span>
                          )}
                          {recipe.fromParentCuisine && recipe.parentCuisine && (
                            <span className="text-xs text-gray-500">
                              {recipe.parentCuisine as any} tradition
                            </span>
                          )}
                        </div>
                        {recipe.matchPercentage && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                              Number(recipe.matchPercentage) / 100
                            )}`}
                          >
                            {recipe.matchPercentage as any}%
                          </span>
                        )}
                      </div>
                      
                      {!expandedRecipes[index] && (
                        <p
                          className="text-xs text-gray-600 line-clamp-2"
                          title={recipe.description}
                        >
                          {recipe.description || "A traditional recipe from this cuisine."}
                        </p>
                      )}

                      {/* Expanded recipe details - add a data attribute for debugging */}
                      {expandedRecipes[index] && (
                        <div 
                          className="expanded-recipe-content mt-2 border-t pt-2"
                          data-expanded="true"
                          style={{ display: 'block !important' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-xs text-gray-600 mb-2">
                            {recipe.description || "A traditional recipe from this cuisine."}
                          </p>

                          <div className="flex space-x-1 mb-1">
                            {recipe.elementalProperties?.Fire >= 0.3 && (
                              <Flame size={12} className="text-red-500" />
                            )}
                            {recipe.elementalProperties?.Water >= 0.3 && (
                              <Droplets size={12} className="text-blue-500" />
                            )}
                            {recipe.elementalProperties?.Earth >= 0.3 && (
                              <Mountain size={12} className="text-green-500" />
                            )}
                            {recipe.elementalProperties?.Air >= 0.3 && (
                              <Wind size={12} className="text-yellow-500" />
                            )}
                          </div>

                          {recipe.ingredients && recipe.ingredients?.length > 0 && (
                            <div className="mt-1">
                              <h6 className="text-xs font-semibold mb-1">Ingredients:</h6>
                              <ul className="pl-4 list-disc text-xs">
                                {Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient, i) => (
                                  <li key={i} className="mb-0.5">
                                    {typeof ingredient === 'string'
                                      ? ingredient
                                      : `${ingredient.amount || ''} ${
                                          ingredient.unit || ''
                                        } ${ingredient.name}${
                                          ingredient.preparation
                                            ? `, ${ingredient.preparation}`
                                            : ''
                                        }`}
                                  </li>
                                ) as React.ReactNode) : (
                                  <li>Ingredients not available</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Show preparation steps with proper fallbacks */}
                          {(recipe.instructions ||
                            recipe.preparationSteps ||
                            recipe.procedure) && (
                            <div className="mt-2">
                              <h6 className="text-xs font-semibold mb-1">Procedure:</h6>
                              {Array.isArray(recipe.instructions || recipe.preparationSteps || recipe.procedure) ? (
                                <ol className="pl-4 list-decimal text-xs">
                                  {((
                                    recipe.instructions ||
                                    recipe.preparationSteps ||
                                    recipe.procedure ||
                                    []
                                  ) as any || [])?.slice(0, expandedRecipes[`${index}-steps`] ? undefined : 3).map((step: Record<string, unknown>, i: number) => (
                                    <li key={i} className="mb-1">{typeof step === 'string' ? step : JSON.stringify(step)}</li>
                                  ) as React.ReactNode)}
                                  
                                  {/* Show more steps button if needed */}
                                  {((recipe.instructions || recipe.preparationSteps || recipe.procedure || []) as any || [])?.length > 3 && !expandedRecipes[`${index}-steps`] && (
                                    <li className="list-none mt-1">
                                      <button
                                        className="text-xs text-blue-500 hover:underline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newState = {...expandedRecipes};
                                          newState[`${index}-steps`] = true;
                                          setExpandedRecipes(newState);
                                        }}
                                      >
                                        Show all steps ({((recipe.instructions || recipe.preparationSteps || recipe.procedure || []) as any || [])?.length} total)
                                      </button>
                                    </li>
                                  )}
                                </ol>
                              ) : (
                                <p className="text-xs text-gray-600">
                                  {(() => {
                                    const recipeData = recipe as Record<string, unknown>;
                                    const instructions = recipeData?.instructions || recipeData?.preparationSteps || recipeData?.procedure;
                                    return typeof instructions === 'string' ? instructions : 'No detailed instructions available.';
                                  })()}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Additional recipe information */}
                          <div className="mt-2 pt-1 border-t border-gray-100 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                            {recipe.cookTime && (
                              <div>
                                <span className="text-gray-500">Cook: </span>
                                <span>{recipe.cookTime}</span>
                              </div>
                            )}

                            {recipe.prepTime && (
                              <div>
                                <span className="text-gray-500">Prep: </span>
                                <span>{recipe.prepTime}</span>
                              </div>
                            )}

                            {recipe.servingSize && (
                              <div>
                                <span className="text-gray-500">Serves: </span>
                                <span>{recipe.servingSize}</span>
                              </div>
                            )}

                            {recipe.difficulty && (
                              <div>
                                <span className="text-gray-500">Difficulty: </span>
                                <span>{(recipe as any)?.difficulty || 'Unknown'}</span>
                              </div>
                            )}
                          </div>

                          {recipe.dietaryInfo && Array.isArray(recipe.dietaryInfo) && recipe.dietaryInfo?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo.map((diet, i) => (
                                <span key={i} className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {diet}
                                </span>
                              ) as React.ReactNode) : (
                                <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {recipe.dietaryInfo}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) as React.ReactNode)}
              </div>

              {Array.isArray(recipes) && recipes?.length > 6 && (
                <button
                  className="text-xs text-blue-500 mt-2 hover:underline flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRecipes(!showRecipes);
                  }}
                >
                  {showRecipes ? (
                    <>
                      <ChevronUp size={12} className="mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} className="mr-1" />
                      Show All Recipes ({Array.isArray(recipes) ? recipes.length : 0})
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 pt-2 border-t border-gray-100">
              <h4 className="text-sm font-medium mb-2">
                Recipes
              </h4>
              <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="mb-2">
                  No recipes available for {selectedCuisineData?.name || "this cuisine"}.
                </p>
                
                <div className="flex gap-2 items-center mt-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-xs">
                    Try selecting a different cuisine or check back later for updated recipes.
                  </p>
                </div>
                
                {/* Fallback placeholder recipes */}
                <div className="mt-4 p-3 bg-white rounded border border-gray-100">
                  <h5 className="text-sm font-medium">{selectedCuisineData?.name || "Cuisine"} Dish Inspiration</h5>
                  <p className="text-xs mt-1">
                    Try exploring traditional {selectedCuisineData?.name || "this cuisine"} recipes 
                    {selectedCuisineData?.signatureDishes && Array.isArray(selectedCuisineData.signatureDishes) && selectedCuisineData.signatureDishes?.length > 0 
                      ? ` like ${selectedCuisineData.signatureDishes.slice(0, 3).join(", ")}, and more.`
                      : ' using ingredients typical to this cuisine.'}
                  </p>
                  
                  {selectedCuisineData?.commonIngredients && Array.isArray(selectedCuisineData.commonIngredients) && selectedCuisineData.commonIngredients?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Key Ingredients:</p>
                      <p className="text-xs">
                        {selectedCuisineData.commonIngredients.slice(0, 5).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
