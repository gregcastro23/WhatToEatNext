// Phase 10: Calculation Type Interfaces
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

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAstrologicalState } from '../../hooks/useAstrologicalState';
import { Flame,
  Droplets,
  Wind,
  Mountain,
  Info,
  Clock,
  Tag,
  Leaf,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  List,
  Search } from 'lucide-react';
import { cuisines } from '../../data/cuisines';
import { recommendationService } from '../../services/ConsolidatedRecommendationService';
// TODO: Fix CSS module import - was: import from "./CuisineRecommender.module.css.ts"
import {
  ElementalProperties,
  AstrologicalState,
  PlanetaryPositionsType,
  AlchemicalState
} from "@/types/alchemy";
import type { ZodiacSign } from '@/types/zodiac';
import type { LunarPhase, LunarPhaseWithSpaces } from '@/types/alchemy';
import { ElementalCharacter, AlchemicalProperty } from '../../constants/planetaryElements';
import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
import { transformCuisines,
  sortByAlchemicalCompatibility } from '../../utils/alchemicalTransformationUtils';
import { cuisineFlavorProfiles,
  getRecipesForCuisineMatch } from '../../data/cuisineFlavorProfiles';
import { getAllRecipes } from '../../data/recipes';
import { sauceRecommendations as sauceRecsData,
  SauceRecommendation,
  allSauces,
  Sauce } from '../../data/sauces';
import { Recipe } from "@/types/recipe";
import { generateTopSauceRecommendations,
  getMatchScoreClass,
  renderScoreBadge,
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets } from '../../utils/recommendation/cuisineRecommendation';
import venusData from '../../data/planets/venus';
import marsData from '../../data/planets/mars';
import mercuryData from '../../data/planets/mercury';
import jupiterData from '../../data/planets/jupiter';

import { Element } from "@/types/alchemy";
import { PlanetaryPosition } from "@/types/celestial";

// Define AlchemicalItem interface for cuisine recommendations
interface AlchemicalItem {
  id: string;
  name: string;
  type: 'recipe' | 'ingredient' | 'cuisine';
  elementalProperties: ElementalProperties;
  astrologicalAffinity?: number;
  seasonalRelevance?: string[];
  description?: string;
}


// DUPLICATE: import { Element } from "@/types/alchemy";
// Keep the interface exports for any code that depends on them
export interface Cuisine {
  id: string;
  name: string;
  description: string;
  elementalProperties: ElementalProperties;
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

// Add this helper function near the top of the file, outside any components
const getSafeScore = (score: unknown): number => {
  // Convert to number if needed, default to 0.5 if NaN or undefined
  const numScore = typeof score === 'number' ? score : parseFloat(String(score));
  return !isNaN(numScore) ? numScore : 0.5;
};

// Enhanced elemental compatibility following self-reinforcement principles
const ELEMENT_COMPATIBILITY = { Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.7  },
  Water: { Fire: 0.7, Water: 0.9, Earth: 0.7, Air: 0.7  },
  Earth: { Fire: 0.7, Water: 0.7, Earth: 0.9, Air: 0.7  },
  Air: { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.9  }
};

// Define recipe type for better type safety
interface RecipeData {
  id?: string;
  name?: string;
  description?: string;
  cuisine?: string;
  matchPercentage?: number;
  matchScore?: number;
  elementalProperties?: ElementalProperties;
  ingredients?: any[];
  instructions?: any[];
  preparationSteps?: any[];
  procedure?: any[];
  cookTime?: string;
  cooking_time?: string;
  cook_time?: string;
  prepTime?: string;
  preparation_time?: string;
  prep_time?: string;
  servingSize?: string;
  servings?: string;
  yield?: string;
  difficulty?: string;
  skill_level?: string;
  dietaryInfo?: string[];
  dietary_restrictions?: string[];
  [key: string]: any;
}

// Helper function to ensure consistent recipe structure
function buildCompleteRecipe(recipe: RecipeData, cuisineName: string): RecipeData {
  // Set default values for undefined properties
  const defaultElementalProperties: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
   };

  // Find the cuisine flavor profile to use its elemental properties as a base
  const cuisineProfile = Object.values(cuisineFlavorProfiles)?.find(c => 
    c.name?.toLowerCase() === cuisineName?.toLowerCase() ||
    c.id?.toLowerCase() === cuisineName?.toLowerCase()
  );

  // Apply safe type casting for cuisineProfile access
  const cuisineProfileData = cuisineProfile as any;
  const elementalAlignment = cuisineProfileData?.elementalAlignment;
  const elementalState = cuisineProfileData?.elementalState;

  // Complete recipe with fallbacks
  return {
    id: recipe.id || `recipe-${Math.random()?.toString(36).substring(2, 9)}`,
    name: recipe.name || `${cuisineName} Recipe`,
    description: recipe.description || `A traditional recipe from ${cuisineName} cuisine.`,
    cuisine: recipe.cuisine || cuisineName,
    matchPercentage: recipe.matchPercentage || 
      (recipe.matchScore ? Math.round(recipe.matchScore * 100) : 85),
    matchScore: recipe.matchScore || 0.85,
    elementalProperties: recipe.elementalState || 
      (elementalAlignment || elementalState || defaultElementalProperties),
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || recipe.preparationSteps || recipe.procedure || [],
    cookTime: recipe.cookingTime || recipe.cooking_time || recipe.cook_time || "30 minutes",
    prepTime: recipe.preparationTime || recipe.preparation_time || recipe.prep_time || "15 minutes",
    servingSize: recipe.servings || recipe.servings || recipe.yield || "4 servings",
    difficulty: recipe.difficulty || recipe.skill_level || "Medium",
    dietaryInfo: recipe.dietaryInfo || recipe.dietary_restrictions || [],
    // Add any custom properties from the original recipe
    ...recipe
  };
}

// Use recommendation service's method instead of local implementation
function calculateElementalMatch(
  recipeElements: ElementalProperties,
  currentMomentElements: ElementalProperties
): number {
  return recommendationService.calculateElementalCompatibility(recipeElements, currentMomentElements);
}

// Add this type definition if it's missing
type ExpandedState = {
  [key: string | number]: boolean;
};

export default function CuisineRecommender() {
  // Add a simple analytics tracking function
  const trackEvent = (eventName: string, eventValue: string) => {
    // This function will safely capture analytics events
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}: ${eventValue}`);
    }
    // In the future, you can connect this to a real analytics service
  };

  // Get access to the AlchemicalContext
  const alchemicalContext = useAlchemical();
  const isDaytime = (alchemicalContext?.isDaytime ?? true);
  const planetaryPositions = alchemicalContext?.planetaryPositions ?? {};
  const state = alchemicalContext?.state ?? { astrologicalState: {
      currentZodiacSign: 'aries',
      lunarPhase: 'new moon' }
  };
  const currentZodiac = state.astrologicalState?.currentZodiacSign;
  const lunarPhase = state.astrologicalState?.lunarPhase;

  // Create a ref to store astrological state
  const astroStateRef = useRef({
    currentZodiacSign: currentZodiac,
    lunarPhase: lunarPhase,
    elementalState: (alchemicalContext as any)?.state?.astrologicalState?.elementalState || 
                   (state as any)?.astrologicalState?.elementalState || 
                   createDefaultElementalProperties()
  });

  // Create a function to get default elemental properties
  function createDefaultElementalProperties(): ElementalProperties {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
     };
  }

  // Update the ref when state changes
  useEffect(() => {
    astroStateRef.current = {
      currentZodiacSign: currentZodiac,
      lunarPhase: lunarPhase,
      elementalState: (alchemicalContext as any)?.state?.astrologicalState?.elementalState ||
                      (state as any)?.astrologicalState?.elementalState ||
                      createDefaultElementalProperties()
    };
  }, [alchemicalContext, state, currentZodiac, lunarPhase]);

  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [transformedCuisines, setTransformedCuisines] = useState<
    AlchemicalItem[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [cuisinesList, setCuisines] = useState<Cuisine[]>([]);
  const [cuisineRecommendations, setCuisineRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  const [filter, setFilter] = useState<string>('all');
  const [cuisineRecipes, setCuisineRecipes] = useState<any[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<any[]>([]);
  const [showAllRecipes, setShowAllRecipes] = useState<boolean>(false);
  const [showAllSauces, setShowAllSauces] = useState<boolean>(false);
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  const [expandedSauces, setExpandedSauces] = useState<ExpandedState>({});
  const [expandedSauceCards, setExpandedSauceCards] = useState<
    Record<string, boolean>
  >({});
  const [showCuisineDetails, setShowCuisineDetails] = useState<boolean>(false);
  
  // Enhanced features state
  const [showSauceRecommendations, setShowSauceRecommendations] = useState(false);
  const [showCuisineSpecificDetails, setShowCuisineSpecificDetails] = useState(false);
  const [showPlanetaryInfluences, setShowPlanetaryInfluences] = useState(false);
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties | undefined>(
    (alchemicalContext as any)?.state?.astrologicalState?.elementalState ||
    (alchemicalContext as any)?.state?.elementalState
  );
  const [matchingRecipes, setMatchingRecipes] = useState<any[]>([]);
  const [allRecipesData, setAllRecipesData] = useState<Recipe[]>([]);

  // Update current moment elemental profile when astrological state changes
  useEffect(() => {
    // Use a stable reference for comparisons by converting to a string
    const elementalStateString = JSON.stringify((state as any)?.astrologicalState?.elementalState || {});
    const currentProfileString = JSON.stringify(currentMomentElementalProfile || {});
    
    // Only update if the state has actually changed
    if (elementalStateString !== currentProfileString) {
      const newElementalState = (state as any)?.astrologicalState?.elementalState;
      
      if (newElementalState) {
        setCurrentMomentElementalProfile({ ...newElementalState });
        
        // Generate sauce recommendations only when elemental profile changes
        try {
          const topSauces = generateTopSauceRecommendations(
            newElementalState,
            6
          )
          setSauceRecommendations(topSauces);
        } catch (error) {
          console.error('Error generating sauce recommendations:', error);
        }
      } else if (currentZodiac && 
                 typeof calculateElementalProfileFromZodiac === 'function') {
        // Only recalculate if we don't have elemental state but zodiac changed
        const zodiacElements = calculateElementalProfileFromZodiac(
          currentZodiac as ZodiacSign,
          lunarPhase as LunarPhase
        )
        
        if (JSON.stringify(zodiacElements) !== currentProfileString) {
          setCurrentMomentElementalProfile(zodiacElements);
          
          // Update sauce recommendations with new elemental profile
          try {
            const topSauces = generateTopSauceRecommendations(
              zodiacElements,
              6
            )
            setSauceRecommendations(topSauces);
          } catch (error) {
            console.error('Error generating sauce recommendations:', error);
          }
        }
      }
    }
  }, [state.astrologicalState, currentZodiac, lunarPhase, calculateElementalProfileFromZodiac]);

  // Update cuisineRecipes whenever matchingRecipes changes
  useEffect(() => {
    setCuisineRecipes(matchingRecipes);
  }, [matchingRecipes]);

  // Load cuisines when component mounts or astrological state changes
  useEffect(() => {
    loadCuisines();
  }, [currentZodiac, lunarPhase]);

  // Move the async function outside the useEffect
  async function loadCuisines() {
    try {
      setLoading(true);
      setError(null);
      
      const elementalProperties = (state as any)?.elementalState || (state as any)?.astrologicalState?.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
       };
      
      // Use the recommendation service instead of direct utility function
      const result = await recommendationService.getRecommendedCuisines({
        elementalProperties: elementalProperties as ElementalProperties,
        planetaryPositions: planetaryPositions as Record<string, { sign: string; degree: number; }>,
        limit: 20
      });
      
      // Transform the result to the expected format
      const cuisineList = (result?.items || []).map(cuisineName => {
        const cuisine = cuisines.find(c => 
          c.name?.toLowerCase() === cuisineName?.toLowerCase() || 
          c.id?.toLowerCase() === cuisineName?.toLowerCase()
        );
        
        if (!cuisine) return null;
        
        return {
          id: cuisine.id,
          name: cuisine.name,
          description: cuisine.description,
          elementalProperties: cuisine.elementalState,
          astrologicalInfluences: cuisine.astrologicalInfluences,
          score: result?.scores?.[cuisineName] || 0.5,
          matchPercentage: Math.round((result?.scores?.[cuisineName] || 0.5) * 100)
        };
      }).filter(Boolean);
      
      setTransformedCuisines(cuisineList as unknown as AlchemicalItem[]);
      setLoading(false);
      
      // Track this event
      trackEvent('cuisine_recommendations_loaded', `${(cuisineList || []).length} cuisines`);
    } catch (err) {
      console.error('Error loading cuisine recommendations:', err);
      setError('Failed to load cuisine recommendations. Please try again.');
      setLoading(false);
    }
  }

  const handleCuisineSelect = (cuisineId: string) => {
    // console.log(`Cuisine selected: ${cuisineId}`);
    
    if (selectedCuisine === cuisineId) {
      // If already selected, toggle showing details
      setShowCuisineDetails(!showCuisineDetails);
      return;
    }

    // Update state
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    
    // Reset expansion states when selecting a new cuisine
    setExpandedRecipes({});
    setExpandedSauces({});
    setExpandedSauceCards({});
    setShowAllRecipes(false);
    setShowAllSauces(false);

    // Find selected cuisine from the cuisineRecommendations list
    const selectedCuisineData = cuisineRecommendations.find((c) => c.id === cuisineId || c.name === cuisineId);
    if (selectedCuisineData) {
      // console.log(`Found cuisine data for: ${selectedCuisineData.name}`);
      trackEvent('cuisine_select', selectedCuisineData.name);
      
      // Update matchingRecipes state with the selected cuisine's recipes
      // This will trigger the useEffect that updates cuisineRecipes
      if (selectedCuisineData.recipes && (selectedCuisineData.recipes || []).length > 0) {
        setMatchingRecipes(selectedCuisineData.recipes);
      } else {
        // If no recipes are directly attached to the cuisine, try to find matching recipes
        const recipesForCuisine = (allRecipesData || []).filter(recipe => 
          recipe.cuisine && 
          (recipe.cuisine?.toLowerCase() === selectedCuisineData.name?.toLowerCase() ||
           (selectedCuisineData.regionalVariants && 
            (selectedCuisineData.regionalVariants || []).some(variant => 
              recipe.cuisine?.toLowerCase() === variant?.toLowerCase())
           )
          )
        );
        
        if ((recipesForCuisine || []).length > 0) {
          setMatchingRecipes((recipesForCuisine || []).map(recipe => 
            buildCompleteRecipe(recipe as any, selectedCuisineData.name)
          ));
        } else {
          setMatchingRecipes([]);
        }
      }
    }
  };

  // Helper function to log cuisine actions with timestamps
  const logCuisineAction = (step: string, details?: any) => {
    if (selectedCuisineData) {
      const timestamp = new Date()?.toISOString();
      // console.log(`[${timestamp}] ${step} - ${selectedCuisineData.name}: ${details ? JSON.stringify(details) : ''}`);
    }
  };

  const toggleRecipeExpansion = (index: number, event: React.MouseEvent) => {
    // console.log(`Toggling recipe expansion for index ${index}`);
    
    // Create a copy of the current state
    const newExpandedRecipes = { ...expandedRecipes };
    
    // Toggle the expansion state for this recipe
    const isExpanding = !newExpandedRecipes[index];
    newExpandedRecipes[index] = isExpanding;
    
    // console.log(`Recipe ${index} expanded state changing to: ${isExpanding ? 'expanded' : 'collapsed'}`);
    
    if (isExpanding && cuisineRecipes && cuisineRecipes[index]) {
      // console.log(`Expanding recipe: ${cuisineRecipes[index].name}`, {
      //   currentState: expandedRecipes,
      //   newState: newExpandedRecipes
      // });
      
      // Log the event
      trackEvent('recipe_expand', cuisineRecipes[index].name);
    }
    
    // Update state
    setExpandedRecipes(newExpandedRecipes);
    
    // Force a re-render for this recipe
    // console.log(`Forced re-render for recipe ${index}`);
  };

  const toggleSauceExpansion = (index: number) => { setExpandedSauces((prev) => ({
      ...prev,
      [index]: !prev[index] }));
  };

  const toggleSauceCard = (sauceId: string) => { setExpandedSauceCards((prev) => ({
      ...prev,
      [sauceId]: !prev[sauceId] }));
  };

  // Create a simplified local implementation for generateSauceRecommendations
  function generateSauceRecommendationsForCuisine(cuisineName: string) {
    try {
      const { allSauces } = require('@/data/sauces');
      const { getTimeFactors } = require('@/types/time');
      const timeFactors = getTimeFactors();
      
      // Get the cuisine's elemental profile
      const cuisine = cuisineRecommendations.find(c => 
        c.name?.toLowerCase() === cuisineName?.toLowerCase());
      
      if (!cuisine || !cuisine.elementalState) {
        // console.log(`No valid cuisine data found for "${cuisineName}" to generate sauce recommendations`);
        return [];
      }
      
      // Convert sauces to array
      const saucesArray = allSauces ? Object.values(allSauces) : [];
      
      if (!saucesArray.length) {
        // console.log(`No sauces found in allSauces data`);
        return [];
      }
      
      // console.log(`Generating sauce recommendations for ${cuisineName} with ${saucesArray.length} available sauces`);
      
      // Calculate elemental properties for cuisine
      const cuisineElements = cuisine.elementalState;
      
      // Get elemental profile from current celestial alignment
      const currentMomentElements = currentMomentElementalProfile || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
       };
      
      // Map sauces with match calculations
      const saucesWithMatches = saucesArray.map(sauce => {
        // Apply safe type casting for sauce access
        const sauceData = sauce as any;
        const sauceElementalState = sauceData?.elementalState;
        
        // Make sure sauce has elemental properties
        const sauceElements = sauceElementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
         };
        
        // Calculate cuisine-sauce elemental match
        const cuisineMatchScore = calculateElementalMatch(sauceElements, cuisineElements);
        
        // Calculate match with current celestial alignment
        const currentMomentMatchScore = calculateElementalMatch(sauceElements, currentMomentElements);
        
        // Calculate combined match score (weighted toward cuisine match)
        const combinedScore = (cuisineMatchScore * 0.7) + (currentMomentMatchScore * 0.3);
        
        // Add flavor profile matching if available
        let flavorMatchScore = 0.7; // default
        
        // Apply safe type casting for flavor profile access
        const sauceFlavorProfile = sauceData?.flavorProfile;
        const cuisineData = cuisine as any;
        const cuisineFlavorProfile = cuisineData?.flavorProfile;
        
        if (sauceFlavorProfile && cuisineFlavorProfile) {
          // Calculate how well sauce flavors complement cuisine flavors
          let flavorMatch = 0;
          let flavorCount = 0;
          
          // Match key flavors
          const flavors = ['sweet', 'sour', 'salty', 'bitter', 'umami', 'spicy'];
          (flavors || []).forEach(flavor => {
            if (sauceFlavorProfile?.[flavor] && cuisineFlavorProfile?.[flavor]) {
              // Calculate complementary match (not exact match)
              const sauceValue = sauceFlavorProfile?.[flavor];
              const cuisineValue = cuisineFlavorProfile?.[flavor];
              
              // If cuisine is strong in a flavor, sauce should be moderate/low
              // If cuisine is weak in a flavor, sauce can enhance it
              const complementScore = cuisineValue > 0.6 
                ? 1 - sauceValue  // Complement high with low
                : sauceValue;     // Enhance low with high
                
              flavorMatch += complementScore;
              flavorCount++;
            }
          });
          
          if (flavorCount > 0) {
            flavorMatchScore = flavorMatch / flavorCount;
          }
        }
        
        // Calculate final score with flavor match included
        const finalScore = (combinedScore * 0.8) + (flavorMatchScore * 0.2);
        const matchPercentage = Math.round(finalScore * 100);
        
        // Apply safe type casting for sauce properties
        const sauceId = sauceData?.id;
        const sauceName = sauceData?.name;
        
        return {
          ...sauce,
          id: sauceId || sauceName?.replace(/\s+/g, '-')?.toLowerCase(),
          matchPercentage,
          elementalMatchScore: Math.round(cuisineMatchScore * 100),
          currentMomentMatchScore: Math.round(currentMomentMatchScore * 100),
          flavorMatchScore: Math.round(flavorMatchScore * 100),
          cuisineName // Add cuisine name for reference
        };
      });
      
      // Sort sauces by match percentage and return top matches
      const sortedSauces = saucesWithMatches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5); // Return top 5 sauces
      
      // console.log(`Generated (${(sortedSauces  || []).length} sauce recommendations for ${cuisineName}`);
      return sortedSauces;
    } catch (error) {
      console.error('Error generating sauce recommendations:', error);
      return [];
    }
  }

  // Add this function inside the CuisineRecommender component or before it
  function getCuisineRecommendations(astroState) {
    // Start with all cuisines
    const availableCuisines = Object.values(cuisineFlavorProfiles);
    
    // Create a map of parent cuisines to their regional variants
    const cuisineMap = new Map();
    
    // First pass - identify parent cuisines and standalone cuisines
    (availableCuisines || []).forEach(cuisine => {
      // Skip regional variants for now
      if (!cuisine.parentCuisine) {
        cuisineMap.set(cuisine.id, {
          cuisine: cuisine,
          regionalVariants: []
        });
      }
    });
    
    // Second pass - add regional variants to their parents
    (availableCuisines || []).forEach(cuisine => {
      if (cuisine.parentCuisine && cuisineMap.has(cuisine.parentCuisine)) {
        cuisineMap.get(cuisine.parentCuisine)?.regionalVariants?.push(cuisine);
      }
    });
    
    // Transform cuisines into the format expected by the UI
    const transformedCuisines = [];
    
    (cuisineMap || []).forEach(({ cuisine, regionalVariants }, cuisineId) => {
      // Calculate a score based on astroState
      let score = 0.5; // Default score
      
      // Calculate better score if we have astrological data
      if (astroState && astroState.elementalState) {
        // Match cuisine elemental properties with current elemental state
        score = calculateElementalMatch(
          cuisine.elementalAlignment || cuisine.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
           },
          astroState.elementalState
        )
        
        // Boost score for matching zodiac influences
        if (astroState.currentZodiacSign && cuisine.zodiacInfluences && 
            (Array.isArray(cuisine.zodiacInfluences) ? cuisine.zodiacInfluences.includes(astroState.currentZodiacSign) : cuisine.zodiacInfluences === astroState.currentZodiacSign)) {
          score += 0.15; // Add bonus for zodiac match
        }
        
        // Boost score for matching lunar influences
        if (astroState.lunarPhase && cuisine.lunarPhaseInfluences &&
            (Array.isArray(cuisine.lunarPhaseInfluences) ? cuisine.lunarPhaseInfluences.includes(astroState.lunarPhase) : cuisine.lunarPhaseInfluences === astroState.lunarPhase)) {
          score += 0.1; // Add bonus for lunar phase match
        }
        
        // Ensure score is within 0-1 range
        score = Math.min(0.95, Math.max(0.5, score));
      } else {
        // Add some randomness if no astrological data
        score = 0.5 + Math.random() * 0.3;
      }
      
      // Create the main cuisine object
      const mainCuisine = {
        id: cuisine.id || cuisine.name?.toLowerCase()?.replace(/\s+/g, '-') || `cuisine-${Math.random()}`,
        name: cuisine.name || 'Unknown Cuisine',
        description: cuisine.description || `A delicious cuisine with unique flavors and traditions.`,
        elementalProperties: cuisine.elementalAlignment || cuisine.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
         },
        astrologicalInfluences: cuisine.zodiacInfluences || [],
        zodiacInfluences: cuisine.zodiacInfluences || [],
        lunarPhaseInfluences: cuisine.lunarPhaseInfluences || [],
        score: score,
        matchPercentage: Math.round(score * 100),
        compatibilityScore: score,
        recipes: [],
        // Add additional cuisine data if available
        signatureDishes: cuisine.signatureTechniques || cuisine.signatureDishes || [],
        commonIngredients: cuisine.signatureIngredients || cuisine.primaryIngredients || [],
        cookingTechniques: cuisine.signatureTechniques || cuisine.commonCookingMethods || [],
        // If we have regional variants, include them
        regionalVariants: (regionalVariants || []).map(variant => variant.name)
      };
      
      transformedCuisines?.push(mainCuisine);
      
      // Add regional variants with slightly lower scores
      (regionalVariants || []).forEach(variant => {
        // Regional variants get a slightly lower base score than their parent
        let variantScore = score * 0.95;
        
        // But if they have zodiac or lunar phase matches of their own, they can increase
        if (astroState?.currentZodiacSign && variant.zodiacInfluences && 
            (Array.isArray(variant.zodiacInfluences) ? variant.zodiacInfluences.includes(astroState.currentZodiacSign) : variant.zodiacInfluences === astroState.currentZodiacSign)) {
          variantScore += 0.1;
        }
        
        if (astroState?.lunarPhase && variant.lunarPhaseInfluences && 
            (Array.isArray(variant.lunarPhaseInfluences) ? variant.lunarPhaseInfluences.includes(astroState.lunarPhase) : variant.lunarPhaseInfluences === astroState.lunarPhase)) {
          variantScore += 0.05;
        }
        
        variantScore = Math.min(0.95, Math.max(0.5, variantScore));
        
        transformedCuisines?.push({
          id: variant.id || variant.name?.toLowerCase()?.replace(/\s+/g, '-') || `cuisine-${Math.random()}`,
          name: variant.name || 'Unknown Regional Cuisine',
          description: variant.description || `A regional variant of ${cuisine.name} cuisine with distinctive characteristics.`,
          elementalProperties: variant.elementalAlignment || variant.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
           },
          astrologicalInfluences: variant.zodiacInfluences || [],
          zodiacInfluences: variant.zodiacInfluences || [],
          lunarPhaseInfluences: variant.lunarPhaseInfluences || [],
          score: variantScore,
          matchPercentage: Math.round(variantScore * 100),
          compatibilityScore: variantScore,
          recipes: [],
          signatureDishes: variant.signatureTechniques || variant.signatureDishes || [],
          commonIngredients: variant.signatureIngredients || variant.primaryIngredients || [],
          cookingTechniques: variant.signatureTechniques || variant.commonCookingMethods || [],
          parentCuisine: cuisine.name
        });
      });
    });

    // Sort cuisines by score and return more recommendations to fill the page
    return transformedCuisines
      .sort((a, b) => (a as ScoredItem).score - (b as ScoredItem).score)
      .slice(0, 18); // Increased from 10 to 18
  }

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
      
      {/* Enhanced features toggles */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <button
          onClick={() => setShowSauceRecommendations(!showSauceRecommendations)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            showSauceRecommendations 
              ? 'bg-orange-500 text-white' 
              : 'bg-white/90 text-orange-600 hover:bg-orange-100'
          }`}
        >
          🍯 Sauce Harmonizer
        </button>
        <button
          onClick={() => setShowCuisineSpecificDetails(!showCuisineSpecificDetails)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            showCuisineSpecificDetails 
              ? 'bg-green-500 text-white' 
              : 'bg-white/90 text-green-600 hover:bg-green-100'
          }`}
        >
          🌍 Regional Details
        </button>
        <button
          onClick={() => setShowPlanetaryInfluences(!showPlanetaryInfluences)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            showPlanetaryInfluences 
              ? 'bg-purple-500 text-white' 
              : 'bg-white/90 text-purple-600 hover:bg-purple-100'
          }`}
        >
          🪐 Planetary Influences
        </button>
      </div>

      {/* Group cuisine cards in a better grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {(cuisineRecommendations || []).map((cuisine) => {
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
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              {/* Cuisine header with name and match score */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium text-sm">{cuisine.name}</h3>
                  {isRegionalVariant && (
                    <span className="text-xs text-gray-500">Regional variant of {cuisine.parentCuisine}</span>
                  )}
                  {cuisine.regionalVariants && (cuisine.regionalVariants || []).length > 0 && (
                    <span className="text-xs text-gray-500 block">
                      {(cuisine.regionalVariants || []).length} regional variants
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
                  {cuisine.elementalState.Fire >= 0.3 && (
                    <div className="flex items-center" title={`fire: ${Math.round(cuisine.elementalState.Fire * 100)}%`}>
                      <Flame size={14} className="text-red-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalState.Fire * 100)}%</span>
                    </div>
                  )}
                  {cuisine.elementalState.Water >= 0.3 && (
                    <div className="flex items-center" title={`water: ${Math.round(cuisine.elementalState.Water * 100)}%`}>
                      <Droplets size={14} className="text-blue-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalState.Water * 100)}%</span>
                    </div>
                  )}
                  {cuisine.elementalState.Earth >= 0.3 && (
                    <div className="flex items-center" title={`earth: ${Math.round(cuisine.elementalState.Earth * 100)}%`}>
                      <Mountain size={14} className="text-green-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalState.Earth * 100)}%</span>
                    </div>
                  )}
                  {cuisine.elementalState.Air >= 0.3 && (
                    <div className="flex items-center" title={`Air: ${Math.round(cuisine.elementalState.Air * 100)}%`}>
                      <Wind size={14} className="text-yellow-500" />
                      <span className="text-xs ml-1">{Math.round(cuisine.elementalState.Air * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Show signature dishes and techniques if available */}
              {cuisine.signatureDishes && (cuisine.signatureDishes || []).length > 0 && (
                <div className="mt-1">
                  <span className="text-xs font-medium text-gray-500 block">Signature dishes:</span>
                  <span className="text-xs text-gray-600">
                    {cuisine.signatureDishes?.slice(0, 3)?.join(", ")}
                    {(cuisine.signatureDishes || []).length > 3 ? "..." : ""}
                  </span>
                </div>
              )}

              {/* Show astrological influences if available */}
              {cuisine.zodiacInfluences && (cuisine.zodiacInfluences || []).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {cuisine.zodiacInfluences?.slice(0, 3).map(sign => (
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
          )
        })}
      </div>

      {/* Standalone Sauce Recommendations Section */}
      {showSauceRecommendations && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-3">🍯 Celestial Sauce Harmonizer</h3>
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
            {((sauceRecommendations || []).length > 0 ? sauceRecommendations : (generateTopSauceRecommendations as any)(currentMomentElementalProfile, 6) || []).map((sauce, index) => (
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
                  {sauce.elementalState?.Fire >= 0.3 && (
                    <div className="flex items-center" title="Fire">
                      <Flame size={12} className="text-red-500" />
                    </div>
                  )}
                  {sauce.elementalState?.Water >= 0.3 && (
                    <div className="flex items-center" title="Water">
                      <Droplets size={12} className="text-blue-500" />
                    </div>
                  )}
                  {sauce.elementalState?.Earth >= 0.3 && (
                    <div className="flex items-center" title="Earth">
                      <Mountain size={12} className="text-green-500" />
                    </div>
                  )}
                  {sauce.elementalState?.Air >= 0.3 && (
                    <div className="flex items-center" title="Air">
                      <Wind size={12} className="text-yellow-500" />
                    </div>
                  )}
                </div>

                {/* Show key ingredients if available */}
                {sauce.ingredients && (sauce.ingredients || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sauce.ingredients?.slice(0, 3).map((ingredient, i) => (
                      <span key={i} className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-100">
                        {ingredient}
                      </span>
                    ))}
                    {(sauce.ingredients || []).length > 3 && (
                      <span className="text-xs text-gray-500">+{(sauce.ingredients || []).length - 3} more</span>
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
                            sauce.currentMomentMatchScore / 100
                          )}`}
                        >
                          {sauce.currentMomentMatchScore}%
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
                    {sauce.ingredients && sauce.ingredients  || [].length > 0 && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Ingredients:</h6>
                        <div className="flex flex-wrap gap-1">
                          {sauce?.ingredients || [].map((ingredient: string, i: number) => (
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
                             || []).map((step: string, i: number) => (
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
      )}

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
                {Object.entries(selectedCuisineData.elementalState || {}).map(([element, value]) => (
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
              {selectedCuisineData.zodiacInfluences && (selectedCuisineData.zodiacInfluences || []).length > 0 ? (
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">Zodiac:</span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(selectedCuisineData?.zodiacInfluences || []).map(sign => (
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
              
              {selectedCuisineData.lunarPhaseInfluences && (selectedCuisineData.lunarPhaseInfluences || []).length > 0 ? (
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">Lunar Phases:</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedCuisineData?.lunarPhaseInfluences || []).map(phase => (
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
          {selectedCuisineData.regionalVariants && (selectedCuisineData.regionalVariants || []).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Regional Variants</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedCuisineData?.regionalVariants || []).map(variant => (
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
          {selectedCuisineData.signatureDishes && (selectedCuisineData.signatureDishes || []).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Signature Dishes</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedCuisineData?.signatureDishes || []).map((dish, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-1 rounded text-sm bg-yellow-50 text-yellow-800"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Recommendations - Shown after cuisine info */}
          {cuisineRecipes && (cuisineRecipes || []).length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">
                Recipes ({(cuisineRecipes || []).length} available)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cuisineRecipes
                  .slice(0, showAllRecipes ? undefined : 6)
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
                              {recipe.regionalVariant} style
                            </span>
                          )}
                          {recipe.fromParentCuisine && recipe.parentCuisine && (
                            <span className="text-xs text-gray-500">
                              {recipe.parentCuisine} tradition
                            </span>
                          )}
                        </div>
                        {recipe.matchPercentage && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(
                              recipe.matchPercentage / 100
                            )}`}
                          >
                            {recipe.matchPercentage}%
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
                            {recipe.elementalState?.Fire >= 0.3 && (
                              <Flame size={12} className="text-red-500" />
                            )}
                            {recipe.elementalState?.Water >= 0.3 && (
                              <Droplets size={12} className="text-blue-500" />
                            )}
                            {recipe.elementalState?.Earth >= 0.3 && (
                              <Mountain size={12} className="text-green-500" />
                            )}
                            {recipe.elementalState?.Air >= 0.3 && (
                              <Wind size={12} className="text-yellow-500" />
                            )}
                          </div>

                          {recipe.ingredients && (recipe.ingredients || []).length > 0 && (
                            <div className="mt-1">
                              <h6 className="text-xs font-semibold mb-1">Ingredients:</h6>
                              <ul className="pl-4 list-disc text-xs">
                                {Array.isArray(recipe.ingredients) ? (recipe.ingredients || []).map((ingredient, i) => (
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
                                )) : (
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
                                  {(
                                    recipe.instructions ||
                                    recipe.preparationSteps ||
                                    recipe.procedure ||
                                    []
                                  ).slice(0, expandedRecipes[`${index}-steps`] ? undefined : 3).map((step, i) => (
                                    <li key={i} className="mb-1">{step}</li>
                                  ))}
                                  
                                  {/* Show more steps button if needed */}
                                  {(recipe.instructions || recipe.preparationSteps || recipe.procedure || []).length > 3 && !expandedRecipes[`${index}-steps`] && (
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
                                        Show all steps ({(recipe.instructions || recipe.preparationSteps || recipe.procedure || []).length} total)
                                      </button>
                                    </li>
                                  )}
                                </ol>
                              ) : (
                                <p className="text-xs text-gray-600">
                                  {typeof (recipe.instructions || recipe.preparationSteps || recipe.procedure) === 'string' 
                                    ? (recipe.instructions || recipe.preparationSteps || recipe.procedure)
                                    : 'No detailed instructions available.'
                                  }
                                </p>
                              )}
                            </div>
                          )}

                          {/* Additional recipe information */}
                          <div className="mt-2 pt-1 border-t border-gray-100 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                            {recipe.cookingTime && (
                              <div>
                                <span className="text-gray-500">Cook: </span>
                                <span>{recipe.cookingTime}</span>
                              </div>
                            )}

                            {recipe.preparationTime && (
                              <div>
                                <span className="text-gray-500">Prep: </span>
                                <span>{recipe.preparationTime}</span>
                              </div>
                            )}

                            {recipe.servings && (
                              <div>
                                <span className="text-gray-500">Serves: </span>
                                <span>{recipe.servings}</span>
                              </div>
                            )}

                            {recipe.difficulty && (
                              <div>
                                <span className="text-gray-500">Difficulty: </span>
                                <span>{recipe.difficulty}</span>
                              </div>
                            )}
                          </div>

                          {recipe.dietaryInfo && (recipe.dietaryInfo || []).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Array.isArray(recipe.dietaryInfo) ? (recipe?.dietaryInfo || []).map((diet, i) => (
                                <span key={i} className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {diet}
                                </span>
                              )) : (
                                <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {recipe.dietaryInfo}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {(cuisineRecipes || []).length > 6 && (
                <button
                  className="text-xs text-blue-500 mt-2 hover:underline flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllRecipes(!showAllRecipes);
                  }}
                >
                  {showAllRecipes ? (
                    <>
                      <ChevronUp size={12} className="mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} className="mr-1" />
                      Show All Recipes ({(cuisineRecipes || []).length})
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
                    {selectedCuisineData?.signatureDishes && selectedCuisineData.signatureDishes  || [].length > 0 
                      ? ` like ${selectedCuisineData.signatureDishes?.slice(0, 3)?.join(", ")}, and more.`
                      : ' using ingredients typical to this cuisine.'}
                  </p>
                  
                  {selectedCuisineData?.commonIngredients && selectedCuisineData.commonIngredients  || [].length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Key Ingredients:</p>
                      <p className="text-xs">
                        {selectedCuisineData.commonIngredients?.slice(0, 5)?.join(", ")}
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
