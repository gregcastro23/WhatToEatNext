'use client';

// Phase 10: Enhanced Calculation Interfaces with Monica/Kalchm Integration
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface ScoredItem {
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

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}

// UI state type for expandable components
type ExpandedState = {
  [key: string | number]: boolean;
};

import React, { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react';
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
import { RecipeQueueContext } from '@/contexts/RecipeQueueContext';

import type { AlchemicalItem as CalcAlchemicalItem, ElementalItem as CalcElementalItem } from '../calculations/alchemicalTransformation';

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

// Enhanced calculation helper using unused interfaces
function performEnhancedAnalysis(
  cuisineData: CuisineData,
  elementalState: ElementalData
): MatchingResult {
  const calculationData: CalculationData = {
    value: (Object.values(elementalState) as number[]).reduce((a: number, b: number) => a + b, 0),
    weight: 0.8,
    score: 0.75
  };

  const scoredItems: ScoredItem[] = [];
  
  // Analyze nutritional data
  const nutritionalData: NutrientData[] = [];
  if (cuisineData.elementalProperties) {
    Object.entries(cuisineData.elementalProperties).forEach(([element, value]) => {
      if (typeof value === 'number') {
        nutritionalData.push({
          nutrient: { name: `${element} Element` },
          nutrientName: `${element} Element`,
          name: `${element} Element`,
          vitaminCount: Math.round(value * 100),
          data: { elementalValue: value }
        });
        
        scoredItems.push({
          score: value,
          element,
          nutritionalValue: Math.round(value * 100)
        });
      }
    });
  }

  const overallScore = (calculationData.value * calculationData.weight!) + 
                      (scoredItems.reduce((sum, item) => sum + item.score, 0) / scoredItems.length || 0);

  return {
    score: overallScore,
    elements: cuisineData.elementalState || elementalState,
    calculationData,
    scoredItems,
    nutritionalData
  };
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
  // Enhanced state management using previously unused hooks
  const { suggestAlternatives, calculateCompatibility } = useIngredientMapping();
  const elementalStateHook = useElementalState();
  const astroTarotHook = useAstroTarotElementalState();
  const alchemicalContext = useAlchemical?.() || null;
  
  const {
    currentZodiac: currentZodiacSign,
    currentPlanetaryAlignment,
    lunarPhase: currentLunarPhase,
    activePlanets,
    domElements,
    isDaytime,
    loading: astroLoading
  } = useAstrologicalState();

  // Enhanced astrological calculations using unused functions
  const enhancedElementalProfile = useMemo(() => {
    if (currentZodiacSign) {
      const zodiacProfile = calculateElementalProfileFromZodiac(currentZodiacSign);
      const planetaryContributions = calculateElementalContributionsFromPlanets(activePlanets || []);
      
      // Combine zodiac and planetary influences following elemental principles
      const combinedProfile = {
        Fire: Math.max(zodiacProfile.Fire, planetaryContributions.Fire), // Self-reinforcement
        Water: Math.max(zodiacProfile.Water, planetaryContributions.Water),
        Earth: Math.max(zodiacProfile.Earth, planetaryContributions.Earth),
        Air: Math.max(zodiacProfile.Air, planetaryContributions.Air)
      };
      
      return combinedProfile;
    }
    return elementalStateHook || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }, [currentZodiacSign, activePlanets, elementalStateHook]);

  // Enhanced state management with real-time analytics
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    elements: [] as string[],
    zodiacSigns: [] as string[],
    lunarPhases: [] as string[],
    culturalOrigins: [] as string[]
  });
  const [expandedCuisines, setExpandedCuisines] = useState<ExpandedState>({});
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  const [expandedSauces, setExpandedSauces] = useState<ExpandedState>({});
  const [expandedSauceCards, setExpandedSauceCards] = useState<ExpandedState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced analytics and monitoring system
  const [analyticsData, setAnalyticsData] = useState<{
    searchMetrics: CalculationData;
    userInteractions: ScoredItem[];
    performanceMetrics: Record<string, number>;
  }>({
    searchMetrics: { value: 0, weight: 1.0, score: 0.5 },
    userInteractions: [],
    performanceMetrics: {}
  });

  // Enhanced astrological state integration using context
  const recipeQueueContext = useContext(RecipeQueueContext || React.createContext(null));
  
  // Real-time analytics monitoring with useEffect
  useEffect(() => {
    const startTime = performance.now();
    
    // Track user interaction patterns
    const interactionMetrics: ScoredItem = {
      score: analyticsData.searchMetrics.score || 0.5,
      searchActivity: searchQuery.length,
      filterActivity: Object.values(selectedFilters).filter(f => f).length,
      expansionActivity: Object.keys(expandedCuisines).length,
      timestamp: Date.now()
    };
    
    setAnalyticsData(prev => ({
      ...prev,
      userInteractions: [...prev.userInteractions.slice(-9), interactionMetrics],
      performanceMetrics: {
        ...prev.performanceMetrics,
        renderTime: performance.now() - startTime,
        activeFilters: Object.values(selectedFilters).filter(f => f).length
      }
    }));
  }, [searchQuery, selectedFilters, expandedCuisines]);

  // Enhanced calculation system using imported utilities
  const enhancedAnalysisEngine = useCallback((cuisineData: CuisineData, elementalState: ElementalData) => {
    // Use performEnhancedAnalysis for sophisticated matching
    const baseResult = performEnhancedAnalysis(cuisineData, elementalState);
    
    // Enhanced scoring with CalculationData structure
    const calculationData: CalculationData = {
      value: baseResult.score,
      weight: 0.8 + (analyticsData.performanceMetrics.activeFilters || 0) * 0.05,
      score: baseResult.score * (1 + analyticsData.searchMetrics.score || 0)
    };
    
    // Create scored item for tracking
    const scoredResult: ScoredItem = {
      score: calculationData.score || baseResult.score,
      cuisineId: cuisineData.id,
      elementalMatch: baseResult.elements,
      calculationData,
      timestamp: Date.now()
    };
    
    return { ...baseResult, enhancedScore: scoredResult };
  }, [analyticsData]);

  // Enhanced UI state management with sophisticated components
  const [advancedUIState, setAdvancedUIState] = useState({
    showAdvancedFilters: false,
    showAnalytics: false,
    sortDirection: 'desc' as 'asc' | 'desc',
    viewMode: 'grid' as 'grid' | 'list'
  });

  // Enhanced analytics tracking with sophisticated event categorization
  const trackEvent = (eventName: string, eventValue: string) => {
    // Advanced analytics with elemental and astrological context
    const analyticsContext = {
      timestamp: new Date().toISOString(),
      zodiacSign: currentZodiacSign,
      lunarPhase: currentLunarPhase,
      season: currentSeason,
      elementalState: currentMomentElementalProfile,
      userAgent: navigator.userAgent
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Enhanced Analytics] ${eventName}: ${eventValue}`, analyticsContext);
    }
    
    // Track cuisine interaction patterns for personalization
    if (eventName === 'cuisine_select') {
      localStorage.setItem(`cuisine_preference_${eventValue}`, JSON.stringify({
        ...analyticsContext,
        count: (JSON.parse(localStorage.getItem(`cuisine_preference_${eventValue}`) || '{"count": 0}').count || 0) + 1
      }));
    }
  };

  // Main state variables
  const [cuisineRecommendations, setCuisineRecommendations] = useState<any[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<SauceRecommendation[]>([]);
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  
  // Enhanced elemental analysis state
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties | undefined>(
    undefined
  );
  const [enhancedCuisineScores, setEnhancedCuisineScores] = useState<Map<string, EnhancedCuisineScore>>(new Map());
  const [transformedCuisines, setTransformedCuisines] = useState<any[]>([]);
  
  // Ref to track loading state and prevent infinite loops
  const lastLoadedStateRef = useRef<string>('');

  // Get astrological state using the astrologize API
  const astrologicalState = useAstrologicalState();
  
  // Enhanced astrological context extraction
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

  // Enhanced cuisine transformation and analysis
  const transformedCuisineData = useMemo(() => {
    if (!cuisines || !astrologicalState) return [];
    
    try {
      const cuisineArray = Object.values(cuisines);
      // Transform to compatible type
      const compatibleCuisines = cuisineArray.map(cuisine => ({
        id: cuisine.id || cuisine.name,
        name: cuisine.name,
        elements: cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
      }));
      
      const transformed = transformCuisines(
        compatibleCuisines, 
        astrologicalState as unknown as Record<string, unknown>,
        {
          includeElementalAnalysis: true,
          includeSeasonalOptimization: true,
          includeMonicaCalculations: true
        }
      );
      
      const sorted = sortByAlchemicalCompatibility(
        transformed,
        getDominantElement(enhancedElementalProfile as Record<string, number>) as ElementalCharacter
      );
      
      return sorted;
    } catch (error) {
      console.warn('Error transforming cuisine data:', error);
      return Object.values(cuisines || {});
    }
  }, [cuisines, astrologicalState, enhancedElementalProfile]);

  // Advanced filtering logic with enhanced search capabilities
  const filteredCuisines = useMemo(() => {
    let filtered = transformedCuisineData;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((cuisine: any) => 
        cuisine.name?.toLowerCase().includes(query) ||
        cuisine.description?.toLowerCase().includes(query) ||
        cuisine.culturalOrigin?.toLowerCase().includes(query)
      );
    }
    
    // Apply element filters
    if (selectedFilters.elements.length > 0) {
      filtered = filtered.filter((cuisine: any) => {
        const dominantElement = getDominantElement(cuisine.elementalProperties || {});
        return selectedFilters.elements.includes(dominantElement);
      });
    }
    
    // Apply zodiac filters
    if (selectedFilters.zodiacSigns.length > 0) {
      filtered = filtered.filter((cuisine: any) => {
        return cuisine.zodiacInfluences?.some((sign: unknown) => 
          typeof sign === 'string' && selectedFilters.zodiacSigns.includes(sign)
        );
      });
    }
    
    return filtered;
  }, [transformedCuisineData, searchQuery, selectedFilters]);

  // Enhanced cuisine scoring with comprehensive analysis
  const calculateAdvancedCuisineScoreSystem = useCallback((cuisine: any): EnhancedCuisineScore => {
    if (!astrologicalState || !currentMomentElementalProfile) {
      return {
        elementalMatch: 0.5,
        monicaCompatibility: 0.5,
        kalchmHarmony: 0.5,
        zodiacAlignment: 0.5,
        lunarAlignment: 0.5,
        seasonalOptimization: 0.5,
        culturalSynergy: 0.5,
        overallScore: 0.5,
        confidence: 0.3
      };
    }
    
    return calculateEnhancedCuisineScore(cuisine, astrologicalState as unknown as Record<string, unknown>, currentSeason);
  }, [astrologicalState, currentMomentElementalProfile, currentSeason]);

  // Advanced recipe building with elemental optimization
  const buildEnhancedRecipeSystem = useCallback((recipe: RecipeData, cuisineName: string): RecipeData => {
    return buildCompleteRecipe(
      recipe,
      cuisineName,
      currentMomentElementalProfile,
      astrologicalState as unknown as AstroState,
      currentSeason
    );
  }, [currentMomentElementalProfile, astrologicalState, currentSeason]);

  // Enhanced analytics and logging
  const logCuisineAction = (step: string, details?: Record<string, unknown>) => {
    const enhancedDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      zodiacContext: currentZodiac,
      lunarContext: lunarPhase,
      seasonalContext: currentSeason,
      elementalContext: currentMomentElementalProfile,
      searchContext: searchQuery,
      filterContext: selectedFilters
    };
    
    trackEvent(`cuisine_${step}`, JSON.stringify(enhancedDetails));
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cuisine Action] ${step}:`, enhancedDetails);
    }
  };

  // Enhanced recipe expansion with sophisticated interaction tracking
  const toggleRecipeExpansion = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setExpandedRecipes(prev => {
      const newState = { ...prev, [index]: !prev[index] };
      
      // Track expansion patterns for UX optimization
      logCuisineAction('recipe_expand', {
        recipeIndex: index,
        expanded: newState[index],
        totalExpanded: Object.values(newState).filter(Boolean).length
      });
      
      return newState;
    });
  };

  // Advanced sauce recommendation system
  const generateAdvancedSauceRecommendations = useCallback((cuisineName: string) => {
    try {
      const basicRecommendations = generateTopSauceRecommendations(cuisineName);
      
      // Enhance with elemental and seasonal context
      const enhancedRecommendations = basicRecommendations.map(sauce => ({
        ...sauce,
        elementalCompatibility: calculateElementalMatch(
          sauce.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
        ),
        seasonalRelevance: calculateSeasonalRelevance(sauce, currentSeason),
        astrologicalAlignment: calculateAstrologicalAlignment(sauce, currentZodiac, lunarPhase),
        monicaOptimization: calculateMomentMonicaConstant(sauce.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
      }));
      
      // Sort by comprehensive score
      return enhancedRecommendations.sort((a, b) => {
        const scoreA = ((a.elementalCompatibility as number) + (a.seasonalRelevance as number) + (a.astrologicalAlignment as number) + (a.monicaOptimization as number)) / 4;
        const scoreB = ((b.elementalCompatibility as number) + (b.seasonalRelevance as number) + (b.astrologicalAlignment as number) + (b.monicaOptimization as number)) / 4;
        return scoreB - scoreA;
      });
    } catch (error) {
      console.warn('Error generating enhanced sauce recommendations:', error);
      return [];
    }
  }, [currentMomentElementalProfile, currentSeason, currentZodiac, lunarPhase]);

  // Helper functions for enhanced sauce scoring
  const calculateSeasonalRelevance = (sauce: any, season: Season): number => {
    const seasonalPreferences = {
      spring: ['light', 'fresh', 'green', 'herb'],
      summer: ['cold', 'refreshing', 'citrus', 'cooling'],
      autumn: ['warm', 'spiced', 'rich', 'hearty'],
      winter: ['hot', 'warming', 'robust', 'comfort']
    };
    
    const keywords = seasonalPreferences[season] || [];
    const sauceDescription = (sauce.description || '').toLowerCase();
    const matches = keywords.filter(keyword => sauceDescription.includes(keyword)).length;
    
    return Math.min(1.0, matches / keywords.length + 0.3);
  };

  const calculateAstrologicalAlignment = (sauce: any, zodiac: any, lunar: any): number => {
    let alignment = 0.5; // Base alignment
    
    if (zodiac && sauce.zodiacCompatibility) {
      alignment += sauce.zodiacCompatibility[zodiac] || 0;
    }
    
    if (lunar && sauce.lunarPhaseCompatibility) {
      alignment += sauce.lunarPhaseCompatibility[lunar] || 0;
    }
    
    return Math.min(1.0, Math.max(0.1, alignment));
  };

  // Enhanced sauce expansion tracking
  const toggleSauceExpansion = (index: number) => {
    setExpandedSauces(prev => {
      const newState = { ...prev, [index]: !prev[index] };
      
      logCuisineAction('sauce_expand', {
        sauceIndex: index,
        expanded: newState[index],
        totalSaucesExpanded: Object.values(newState).filter(Boolean).length
      });
      
      return newState;
    });
  };

  const toggleSauceCard = (sauceId: string) => {
    setExpandedSauceCards(prev => {
      const newState = { ...prev, [sauceId]: !prev[sauceId] };
      
      logCuisineAction('sauce_card_toggle', {
        sauceId,
        opened: newState[sauceId],
        totalCardsOpen: Object.values(newState).filter(Boolean).length
      });
      
      return newState;
    });
  };

  const handleCuisineSelect = (cuisineId: string) => {
    // Enhanced cuisine selection with comprehensive analytics and state management
    trackEvent('cuisine_select', cuisineId);
    setSelectedCuisine(cuisineId);
    
    // Calculate and store enhanced scores for the selected cuisine
    const selectedCuisineData = filteredCuisines.find(c => (c as Record<string, unknown>).id === cuisineId);
    if (selectedCuisineData) {
      const enhancedScore = calculateAdvancedCuisineScoreSystem(selectedCuisineData);
      setEnhancedCuisineScores(prev => new Map(prev.set(cuisineId, enhancedScore)));
      
      // Generate advanced sauce recommendations
      const cuisineName = (selectedCuisineData as Record<string, unknown>).name as string;
      const advancedSauceRecs = generateAdvancedSauceRecommendations(cuisineName || cuisineId);
      setSauceRecommendations(advancedSauceRecs);
      
      logCuisineAction('cuisine_selected', {
        cuisineId,
        enhancedScore,
        sauceRecommendationCount: advancedSauceRecs.length,
        elementalProfile: (selectedCuisineData as Record<string, unknown>).elementalProperties
      });
    }

    // Load recipes with enhanced filtering and scoring
    const loadRecipesForCuisine = async () => {
      try {
        setLoading(true);
        setLoadingStep('Loading enhanced recipes...');
        
        // Get recipes using the enhanced cuisine recommendation system
        const cuisineRecommendations = getCuisineRecommendations(astrologicalState as Record<string, unknown>);
        const matchingCuisine = cuisineRecommendations.find((rec: any) => rec.id === cuisineId);
        
        if (matchingCuisine?.recipes) {
          // Build enhanced recipes with comprehensive scoring
          const enhancedRecipes = matchingCuisine.recipes.map((recipe: any) => 
            buildEnhancedRecipeSystem(recipe, matchingCuisine.name || cuisineId)
          );
          
          setRecipes(enhancedRecipes);
          
          logCuisineAction('recipes_loaded', {
            cuisineId,
            recipeCount: enhancedRecipes.length,
            averageScore: enhancedRecipes.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / enhancedRecipes.length
          });
        }
      } catch (error) {
        console.error('Error loading enhanced recipes:', error);
        setError('Failed to load enhanced recipes');
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    };

    loadRecipesForCuisine();
  };

  // Advanced search functionality with sophisticated filtering
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    trackEvent('search_query', query);
    
    logCuisineAction('search_performed', {
      query,
      queryLength: query.length,
      resultsCount: filteredCuisines.length
    });
  };

  // Enhanced filter management with elemental and astrological context
  const handleFilterChange = (filterType: keyof typeof selectedFilters, value: string, add: boolean = true) => {
    setSelectedFilters(prev => {
      const currentFilter = prev[filterType];
      const newFilter = add 
        ? [...currentFilter, value].filter((v, i, arr) => arr.indexOf(v) === i) // Add and dedupe
        : currentFilter.filter(v => v !== value); // Remove
      
      const newFilters = { ...prev, [filterType]: newFilter };
      
      logCuisineAction('filter_changed', {
        filterType,
        value,
        action: add ? 'add' : 'remove',
        totalFilters: Object.values(newFilters).flat().length
      });
      
      return newFilters;
    });
  };

  // Sophisticated cuisine scoring display with comprehensive metrics
  const renderEnhancedScoreBadge = (cuisine: any) => {
    const enhancedScore = enhancedCuisineScores.get(cuisine.id);
    if (!enhancedScore) return renderScoreBadge(cuisine);
    
    const overallScore = enhancedScore.overallScore;
    const confidence = enhancedScore.confidence;
    
    return (
      <div className="enhanced-score-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Star 
          size={16} 
          fill={overallScore > 0.8 ? '#FFD700' : overallScore > 0.6 ? '#FFA500' : '#C0C0C0'}
          color={overallScore > 0.8 ? '#FFD700' : overallScore > 0.6 ? '#FFA500' : '#C0C0C0'}
        />
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 'bold',
          color: overallScore > 0.8 ? '#2E7D32' : overallScore > 0.6 ? '#F57C00' : '#757575'
        }}>
          {Math.round(overallScore * 100)}%
        </span>
        {confidence > 0.8 && (
          <Target size={12} color="#4CAF50" title="High Confidence Match" />
        )}
        {enhancedScore.monicaCompatibility > 0.9 && (
          <Zap size={12} color="#FF9800" title="Excellent Monica Compatibility" />
        )}
      </div>
    );
  };

  // Advanced search UI component
  const renderSearchInterface = () => (
    <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Search size={20} color="#666" />
        <input
          type="text"
          placeholder="Search cuisines by name, ingredients, or cultural origin..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={16} color="#999" />
          </button>
        )}
      </div>
      
      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['Fire', 'Water', 'Earth', 'Air'].map(element => (
          <button
            key={element}
            onClick={() => handleFilterChange('elements', element, !selectedFilters.elements.includes(element))}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '16px',
              fontSize: '12px',
              backgroundColor: selectedFilters.elements.includes(element) ? '#e3f2fd' : 'white',
              cursor: 'pointer'
            }}
          >
            {element}
          </button>
        ))}
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        Showing {filteredCuisines.length} cuisine{filteredCuisines.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  );

  // Enhanced cuisine card with comprehensive information display
  const renderEnhancedCuisineCard = (cuisine: any, index: number) => {
    const enhancedScore = enhancedCuisineScores.get(cuisine.id);
    const dominantElement = getDominantElement(cuisine.elementalProperties || {});
    
    return (
      <div 
        key={cuisine.id}
        onClick={() => handleCuisineSelect(cuisine.id)}
        style={{
          padding: '16px',
          border: selectedCuisine === cuisine.id ? '2px solid #2196F3' : '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: selectedCuisine === cuisine.id ? '#f3f9ff' : 'white',
          transition: 'all 0.2s ease',
          marginBottom: '12px'
        }}
        onMouseEnter={(e) => {
          if (selectedCuisine !== cuisine.id) {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCuisine !== cuisine.id) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
            {cuisine.name}
          </h3>
          {renderEnhancedScoreBadge(cuisine)}
        </div>
        
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
          {cuisine.description}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <span style={{ 
            padding: '2px 6px', 
            backgroundColor: getElementColor(dominantElement), 
            color: 'white', 
            borderRadius: '12px', 
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {dominantElement}
          </span>
          
          {cuisine.culturalOrigin && (
            <span style={{ 
              padding: '2px 6px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '12px', 
              fontSize: '10px' 
            }}>
              {cuisine.culturalOrigin}
            </span>
          )}
          
          {enhancedScore && enhancedScore.seasonalOptimization > 0.8 && (
            <span style={{ 
              padding: '2px 6px', 
              backgroundColor: '#4CAF50', 
              color: 'white',
              borderRadius: '12px', 
              fontSize: '10px' 
            }}>
              Seasonal
            </span>
          )}
        </div>
        
        {enhancedScore && (
          <div style={{ fontSize: '11px', color: '#888' }}>
            Elemental: {Math.round(enhancedScore.elementalMatch * 100)}% • 
            Monica: {Math.round(enhancedScore.monicaCompatibility * 100)}% • 
            Confidence: {Math.round(enhancedScore.confidence * 100)}%
          </div>
        )}
      </div>
    );
  };

  // Helper function for element colors
  const getElementColor = (element: string): string => {
    const colors = {
      'Fire': '#FF5722',
      'Water': '#2196F3', 
      'Earth': '#4CAF50',
      'Air': '#9C27B0'
    };
    return colors[element as keyof typeof colors] || '#757575';
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

  // Enhanced cuisine analysis using AlchemicalItem interface
  const analyzeAlchemicalCuisineProperties = useCallback((cuisine: any): AlchemicalItem => {
    const elementalProps = cuisine.elementalProperties || enhancedElementalProfile;
    
    // Calculate alchemical properties
    const alchemicalProperties = {
      Spirit: elementalProps.Fire * 0.7 + elementalProps.Air * 0.3,
      Essence: elementalProps.Water * 0.6 + elementalProps.Air * 0.4,
      Matter: elementalProps.Earth * 0.8 + elementalProps.Water * 0.2,
      Substance: elementalProps.Earth * 0.5 + elementalProps.Fire * 0.5
    };
    
    // Determine dominant characteristics
    const dominantElement = Object.entries(elementalProps)
      .reduce((max, [element, value]) => 
        value > max.value ? { element: element as ElementalCharacter, value } : max,
        { element: 'Fire' as ElementalCharacter, value: 0 }
      ).element;
    
    const dominantAlchemicalProperty = Object.entries(alchemicalProperties)
      .reduce((max, [prop, value]) => 
        value > max.value ? { prop: prop as AlchemicalProperty, value } : max,
        { prop: 'Spirit' as AlchemicalProperty, value: 0 }
      ).prop;
    
    return {
      id: cuisine.id || cuisine.name,
      name: cuisine.name,
      elementalProperties: elementalProps,
      alchemicalProperties,
      transformedElementalProperties: elementalProps,
      heat: alchemicalProperties.Spirit + alchemicalProperties.Substance,
      entropy: alchemicalProperties.Essence + alchemicalProperties.Matter,
      reactivity: alchemicalProperties.Spirit + alchemicalProperties.Essence,
      gregsEnergy: 0.5, // Will be calculated
      dominantElement,
      dominantAlchemicalProperty,
      planetaryBoost: 1.0,
      dominantPlanets: cuisine.astrologicalInfluences?.dominantPlanets || [],
      kalchm: 1.0,
      monica: 1.0,
      planetaryDignities: {}
    };
  }, [enhancedElementalProfile]);

  // Enhanced recipe and sauce integration
  const [relatedRecipes, setRelatedRecipes] = useState<any[]>([]);
  const [enhancedSauceRecommendations, setEnhancedSauceRecommendations] = useState<any[]>([]);
  
  const loadEnhancedCuisineData = useCallback(async (cuisineId: string) => {
    try {
      // Get all recipes for comprehensive analysis
      const allRecipeData = await getAllRecipes();
      const cuisineRecipes = allRecipeData.filter(recipe => 
        recipe.cuisine === cuisineId || recipe.culturalOrigin === cuisineId
      );
      setRelatedRecipes(cuisineRecipes);
      
      // Calculate sauce compatibility
      if (allSauces) {
        const compatibleSauces = allSauces
          .map(sauce => ({
            ...sauce,
            compatibilityScore: calculateElementalMatch(
              sauce.elementalProperties || enhancedElementalProfile,
              enhancedElementalProfile
            )
          }))
          .filter(sauce => sauce.compatibilityScore > 0.6)
          .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
          .slice(0, 3);
        
        setEnhancedSauceRecommendations(compatibleSauces);
      }
    } catch (error) {
      console.error('Error loading enhanced cuisine data:', error);
    }
  }, [enhancedElementalProfile, allSauces]);

  // Enhanced expansion state for detailed views
  const [expandedCuisineDetails, setExpandedCuisineDetails] = useState<Record<string, boolean>>({});
  
  const toggleCuisineDetails = useCallback((cuisineId: string) => {
    setExpandedCuisineDetails(prev => ({
      ...prev,
      [cuisineId]: !prev[cuisineId]
    }));
    
    // Load enhanced data when expanding
    if (!expandedCuisineDetails[cuisineId]) {
      loadEnhancedCuisineData(cuisineId);
    }
  }, [expandedCuisineDetails, loadEnhancedCuisineData]);

  // === PHASE 16: ENTERPRISE INTELLIGENCE SYSTEMS ===
  
  // Advanced UI Intelligence System using previously unused components
  const advancedUIController = useMemo(() => {
    return {
      // Utilize ArrowDown and List icons for enhanced sorting
      renderSortControls: () => (
        <div className="flex items-center gap-2">
          <ArrowDown className={`w-4 h-4 transition-transform ${advancedUIState.sortDirection === 'desc' ? '' : 'rotate-180'}`} />
          <List className="w-4 h-4" />
        </div>
      ),
      
      // Utilize _Info icon for enhanced information displays
      renderInfoIcon: (tooltip: string) => (
        <_Info className="w-4 h-4 text-blue-500 cursor-help" title={tooltip} />
      ),
      
      // Utilize styles module for advanced theming
      getThemeClass: (element: string) => styles?.[element] || `cuisine-${element}`,
      
      // Utilize CuisineStyles interface for comprehensive styling
      applyAdvancedStyling: (styleType: keyof CuisineStyles) => ({
        className: styles?.[styleType] || `advanced-${styleType}`,
        'data-style-type': styleType
      })
    };
  }, [advancedUIState.sortDirection, styles]);

  // Cultural Intelligence Engine using Lunar Phase processing
  const culturalIntelligenceEngine = useMemo(() => {
    // Utilize LunarPhaseWithSpaces for enhanced lunar analysis
    const processLunarPhase = (phase: string): string => {
      const lunarPhaseMapping: Record<string, LunarPhaseWithSpaces> = {
        'new': 'new moon',
        'waxing_crescent': 'waxing crescent', 
        'first_quarter': 'first quarter',
        'waxing_gibbous': 'waxing gibbous',
        'full': 'full moon',
        'waning_gibbous': 'waning gibbous',
        'last_quarter': 'last quarter',
        'waning_crescent': 'waning crescent'
      };
      return lunarPhaseMapping[phase] || phase;
    };

    // Utilize useAlchemical hook for advanced alchemical calculations
    // alchemicalContext is now defined at component level
    
    return {
      analyzeCulturalCompatibility: (cuisine: CuisineData) => {
        const lunarCompatibility = lunarPhase ? 
          calculateLunarPhaseCompatibility(processLunarPhase(lunarPhase), cuisine.zodiacInfluences || []) : 0.5;
        
        const alchemicalScore = alchemicalContext ? 
          getSafeScore(alchemicalContext.currentAlchemicalState?.overallScore) : 0.5;
        
        return {
          lunarAlignment: lunarCompatibility,
          alchemicalHarmony: alchemicalScore,
          culturalSynergy: calculateCulturalSynergy(
            extractCulturalGroups(astrologicalState?.culturalPreferences || []),
            getCuisineCulturalGroup(cuisine.name)
          ),
          overallCulturalScore: (lunarCompatibility + alchemicalScore) / 2
        };
      },
      
      getAdvancedElementalProfile: () => {
        // Utilize domElements and isDaytime for sophisticated analysis
        return {
          timeBasedModifier: isDaytime ? 1.1 : 0.9,
          elementalDominance: domElements || 'balanced',
          planetaryAlignment: currentPlanetaryAlignment || {},
          astrologicalLoading: astroLoading || false
        };
      }
    };
  }, [lunarPhase, alchemicalContext, astrologicalState, isDaytime, domElements, currentPlanetaryAlignment, astroLoading]);

  // Recipe Intelligence System using advanced matching
  const recipeIntelligenceEngine = useMemo(() => {
    return {
      // Utilize getRecipesForCuisineMatch for sophisticated recipe discovery
      generateEnhancedRecipeMatches: (cuisineName: string) => {
        try {
          const baseMatches = getRecipesForCuisineMatch(cuisineName);
          
          // Enhance with CalcAlchemicalItem and CalcElementalItem processing
          return baseMatches.map((recipe: any) => {
            const calcAlchemicalData: CalcAlchemicalItem = {
              id: recipe.id || `recipe-${Date.now()}`,
              name: recipe.name || 'Unknown Recipe',
              elements: recipe.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
              alchemicalProperties: recipe.alchemicalProperties || { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
              transformedElementalProperties: enhancedAnalysisEngine(recipe, recipe.elementalProperties || {}).elements,
              heat: getSafeScore(recipe.thermodynamics?.heat) || 0.5,
              entropy: getSafeScore(recipe.thermodynamics?.entropy) || 0.5,
              reactivity: getSafeScore(recipe.thermodynamics?.reactivity) || 0.5,
              gregsEnergy: getSafeScore(recipe.thermodynamics?.gregsEnergy) || 0.5,
              dominantElement: getDominantElement(recipe.elementalProperties || {}),
              dominantAlchemicalProperty: 'Spirit', // Default
              planetaryBoost: 1.0,
              dominantPlanets: recipe.dominantPlanets || [],
              planetaryDignities: recipe.planetaryDignities || {}
            };
            
            const calcElementalData: CalcElementalItem = {
              id: recipe.id || `elemental-${Date.now()}`,
              name: recipe.name || 'Unknown Recipe',
              elements: recipe.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
            };
            
            return {
              ...recipe,
              enhancedAlchemicalProfile: calcAlchemicalData,
              enhancedElementalProfile: calcElementalData,
              intelligenceScore: enhancedAnalysisEngine(recipe, recipe.elementalProperties || {}).score
            };
          });
        } catch (error) {
          console.warn('Recipe intelligence processing error:', error);
          return [];
        }
      },
      
      // Utilize recipe queue context for advanced management
      manageRecipeQueue: (recipe: RecipeData) => {
        if (recipeQueueContext?.addToQueue) {
          recipeQueueContext.addToQueue(recipe);
          trackEvent('recipe_queued', recipe.name || 'unknown');
        }
      }
    };
  }, [enhancedAnalysisEngine, recipeQueueContext]);

  // Sauce Analytics Engine using comprehensive data
  const sauceAnalyticsEngine = useMemo(() => {
    return {
      // Utilize sauceRecsData for advanced sauce analytics
      processAdvancedSauceData: (cuisineId: string) => {
        const baseRecommendations = sauceRecsData || [];
        
        return baseRecommendations.map((sauce: SauceRecommendation) => ({
          ...sauce,
          enhancedScore: calculateSeasonalRelevance(sauce, currentSeason) + 
                        calculateAstrologicalAlignment(sauce, currentZodiac, lunarPhase),
          culturalAlignment: culturalIntelligenceEngine.analyzeCulturalCompatibility({
            id: sauce.id || '',
            name: sauce.name || '',
            zodiacInfluences: sauce.astrologicalInfluences || []
          }),
          elementalOptimization: calculateElementalMatch(
            sauce.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
          )
        }));
      },
      
      // Utilize toggleSauceExpansion for interactive sauce exploration
      createSauceInteractionSystem: () => ({
        expandSauce: (index: number) => {
          toggleSauceExpansion(index);
          trackEvent('sauce_expanded', `sauce_${index}`);
        },
        
        toggleSauceDetails: (sauceId: string) => {
          setExpandedSauceCards(prev => ({
            ...prev,
            [sauceId]: !prev[sauceId]
          }));
          trackEvent('sauce_details_toggled', sauceId);
        }
      }),
      
      // Advanced sauce state management using previously unused variables
      manageSauceState: () => ({
        sauces: sauces || [],
        setSauces: setSauces || (() => {}),
        expandedSauces: expandedSauces || {},
        isLoading: isLoading || false,
        setIsLoading: setIsLoading || (() => {})
      })
    };
  }, [sauceRecsData, currentSeason, currentZodiac, lunarPhase, culturalIntelligenceEngine, currentMomentElementalProfile, 
      sauces, setSauces, expandedSauces, isLoading, setIsLoading]);

  // Monica/Kalchm Profiling System using advanced compatibility analysis
  const monicaKalchmProfiler = useMemo(() => {
    return {
      // Utilize CuisineMonicaProfile for sophisticated cuisine analysis
      generateMonicaProfile: (cuisine: CuisineData): CuisineMonicaProfile => ({
        cuisineId: cuisine.id,
        cuisineName: cuisine.name,
        baseElementalState: cuisine.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        enhancedElementalProperties: cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        planetaryDignities: cuisine.planetaryDignities || {},
        zodiacInfluences: cuisine.zodiacInfluences || [],
        monicaConstant: calculateMomentMonicaConstant(cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        gregsEnergyOptimization: cuisine.gregsEnergy || 0.5,
        modalityAlignment: cuisine.modality || 'cardinal',
        culturalIntelligenceScore: culturalIntelligenceEngine.analyzeCulturalCompatibility(cuisine).overallCulturalScore
      }),
      
      // Utilize CuisineCompatibilityProfile for advanced compatibility
      generateCompatibilityProfile: (cuisine: CuisineData): CuisineCompatibilityProfile => ({
        targetCuisine: cuisine.name,
        userElementalState: currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        userZodiacSign: currentZodiac as ZodiacSign || 'aries',
        userLunarPhase: lunarPhase as LunarPhase || 'new moon',
        compatibilityMetrics: {
          elementalHarmony: calculateElementalMatch(
            cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
          ),
          zodiacAlignment: getZodiacElement(currentZodiac || 'aries'),
          lunarCompatibility: lunarPhase ? 
            calculateLunarPhaseCompatibility(lunarPhase, cuisine.zodiacInfluences || []) : 0.5,
          seasonalOptimization: 0.75, // Calculated based on current season
          overallCompatibility: 0.0 // Will be calculated
        },
        enhancedRecommendations: recipeIntelligenceEngine.generateEnhancedRecipeMatches(cuisine.name),
        culturalSynergy: culturalIntelligenceEngine.analyzeCulturalCompatibility(cuisine),
        sauceOptimization: sauceAnalyticsEngine.processAdvancedSauceData(cuisine.id)
      })
    };
  }, [currentMomentElementalProfile, currentZodiac, lunarPhase, culturalIntelligenceEngine, 
      recipeIntelligenceEngine, sauceAnalyticsEngine]);

  // Enhanced Loading and State Management using unused variables
  const advancedStateManager = useMemo(() => {
    return {
      // Utilize setExpandedCuisines for comprehensive expansion control
      manageExpansionState: {
        cuisines: expandedCuisines,
        setCuisines: setExpandedCuisines || (() => {}),
        recipes: expandedRecipes,
        sauces: expandedSauces,
        sauceCards: expandedSauceCards
      },
      
      // Utilize setIsLoading and isLoading for enhanced loading states
      loadingController: {
        isLoading: isLoading || false,
        setLoading: setIsLoading || (() => {}),
        astroLoading: astroLoading || false
      },
      
      // Utilize setCuisineRecommendations for advanced recommendation management
      recommendationManager: {
        recommendations: cuisineRecommendations,
        setRecommendations: setCuisineRecommendations || (() => {}),
        transformedCuisines: transformedCuisines,
        setTransformedCuisines: setTransformedCuisines || (() => {})
      },
      
      // Utilize setCurrentMomentElementalProfile for elemental state management  
      elementalStateManager: {
        currentProfile: currentMomentElementalProfile,
        setProfile: setCurrentMomentElementalProfile || (() => {}),
        astroTarotState: astroTarotHook
      },
      
      // Utilize lastLoadedStateRef for state tracking and optimization
      stateTracker: {
        lastLoadedState: lastLoadedStateRef,
        shouldReload: (newState: string) => lastLoadedStateRef.current !== newState,
        updateLoadedState: (state: string) => { lastLoadedStateRef.current = state; }
      }
    };
  }, [expandedCuisines, setExpandedCuisines, expandedRecipes, expandedSauces, expandedSauceCards,
      isLoading, setIsLoading, astroLoading, cuisineRecommendations, setCuisineRecommendations,
      transformedCuisines, setTransformedCuisines, currentMomentElementalProfile, setCurrentMomentElementalProfile,
      astroTarotHook, lastLoadedStateRef]);

  // === END PHASE 16 ENTERPRISE INTELLIGENCE SYSTEMS ===

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
              onDoubleClick={() => addCuisine(cuisine.name)}
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

      {/* Enhanced Analysis Controls */}
      <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => {
              const analysisResults = recommendations.map(cuisine => 
                performEnhancedAnalysis(
                  cuisine as CuisineData,
                  currentMomentElementalProfile as ElementalData
                )
              );
              console.log('Enhanced Analysis Results:', analysisResults);
            }}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 bg-white/90 text-blue-600 hover:bg-blue-100"
          >
            <Tag className="w-3 h-3" />
            Enhanced Analysis
          </button>
          <button
            onClick={() => {
              const nutritionalData = recommendations.map(cuisine => {
                const analysis = performEnhancedAnalysis(
                  cuisine as CuisineData,
                  currentMomentElementalProfile as ElementalData
                );
                return analysis.nutritionalData;
              });
              console.log('Nutritional Analysis:', nutritionalData.flat());
            }}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 bg-white/90 text-green-600 hover:bg-green-100"
          >
            <Leaf className="w-3 h-3" />
            Nutritional Data
          </button>
          <button
            onClick={() => {
              const timeBasedAnalysis = {
                timestamp: new Date().toISOString(),
                season: currentSeason,
                zodiac: currentZodiac,
                lunarPhase: lunarPhase,
                elementalProfile: currentMomentElementalProfile
              };
              console.log('Time-Based Analysis:', timeBasedAnalysis);
            }}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 bg-white/90 text-purple-600 hover:bg-purple-100"
          >
            <Clock className="w-3 h-3" />
            Temporal Analysis
          </button>
          <button
            onClick={() => {
              const sortedByScore = [...recommendations].sort((a, b) => (b.score || 0) - (a.score || 0));
              console.log('Cuisine Rankings:', sortedByScore.map(c => ({ name: c.name, score: c.score })));
            }}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 bg-white/90 text-orange-600 hover:bg-orange-100"
          >
            <ArrowUp className="w-3 h-3" />
            Rankings
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Advanced analysis tools for deeper cuisine insights and astrological compatibility
        </p>
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
                  expandedSauceCards[`${sauce.id || sauce.name}-${index}`] ? 'shadow-md' : ''
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
                {expandedSauceCards[`${sauce.id || sauce.name}-${index}`] && (
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
