'use client';

import { ChevronDown, ChevronUp, Droplets, Flame, Info, Mountain, Wind } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { enterpriseIntelligenceIntegration } from '@/services/EnterpriseIntelligenceIntegration';
import { log } from '@/services/LoggingService';
import { IntegratedAdvancedIntelligenceResult } from '@/types/advancedIntelligence';
import { ElementalProperties } from '@/types/alchemy';
import { Recipe } from '@/types/unified';
import type { ZodiacSign } from '@/types/zodiac';

import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
import { SauceRecommendation } from '../../data/sauces';
import { recommendationService } from '../../services/ConsolidatedRecommendationService';
import {
  calculateElementalProfileFromZodiac,
  getMatchScoreClass,
} from '../../utils/recommendation/cuisineRecommendation';

// Phase 2D: Advanced Intelligence Systems Integration

// Helper function to render recipe preparation steps
function renderRecipeSteps(
  recipe: Record<string, unknown>,
  index: number,
  expandedRecipes: ExpandedState,
  setExpandedRecipes: (state: ExpandedState) => void,
): React.ReactNode {
  const instructions = recipe.instructions;
  const preparationSteps = recipe.preparationSteps;
  const procedure = recipe.procedure;
  const stepsArray = Array.isArray(instructions)
    ? instructions
    : Array.isArray(preparationSteps)
      ? preparationSteps
      : Array.isArray(procedure)
        ? procedure
        : [];
  const hasSteps = stepsArray.length > 0;

  if (!hasSteps && !instructions && !preparationSteps && !procedure) {
    return null;
  }

  return (
    <div className='mt-2'>
      <h6 className='mb-1 text-xs font-semibold'>Procedure:</h6>
      {hasSteps ? (
        <ol className='list-decimal pl-4 text-xs'>
          {stepsArray.slice(0, expandedRecipes[`${index}-steps`] ? undefined : 3).map((step, i) => (
            <li key={i} className='mb-1'>
              {String(step)}
            </li>
          ))}

          {/* Show more steps button if needed */}
          {stepsArray.length > 3 && !expandedRecipes[`${index}-steps`] ? (
            <li className='mt-1 list-none'>
              <button
                className='text-xs text-blue-500 hover:underline'
                onClick={e => {
                  e.stopPropagation();
                  const newState = { ...expandedRecipes };
                  newState[`${index}-steps`] = true;
                  setExpandedRecipes(newState);
                }}
              >
                Show all steps ({stepsArray.length} total)
              </button>
            </li>
          ) : null}
        </ol>
      ) : (
        <p className='text-xs text-gray-600'>
          {typeof (instructions || preparationSteps || procedure) === 'string'
            ? String(instructions || preparationSteps || procedure)
            : 'No detailed instructions available.'}
        </p>
      )}
    </div>
  );
}

// Define AlchemicalItem interface for cuisine recommendations
interface AlchemicalItem {
  id: string;
  name: string;
  type: 'recipe' | 'ingredient' | 'cuisine';
  elementalProperties: ElementalProperties;
  score?: number;
}

// Define ScoredItem interface for sorting
interface ScoredItem {
  score: number;
  [key: string]: unknown;
  astrologicalAffinity?: number;
  seasonalRelevance?: string[];
  description?: string;
}

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

// Enhanced interface for cuisine with scoring and additional properties
interface CuisineWithScore {
  id: string;
  name: string;
  description?: string;
  elementalState: ElementalProperties;
  elementalProperties?: ElementalProperties;
  matchPercentage?: number;
  compatibilityScore?: number;
  score?: number;
  parentCuisine?: string;
  regionalVariants?: string[];
  signatureDishes?: string[];
  zodiacInfluences?: ZodiacSign[];
  recipes?: RecipeData[];
  [key: string]: unknown;
}

// Enhanced interface for sauce recommendations
interface SauceWithScore {
  id: string;
  name: string;
  description?: string;
  elementalState?: ElementalProperties;
  matchPercentage?: number;
  ingredients?: string[];
  elementalMatchScore?: number;
  currentMomentMatchScore?: number;
  planetaryDayScore?: number;
  planetaryHourScore?: number;
  preparationSteps?: string[] | string;
  procedure?: string[] | string;
  instructions?: string[] | string;
  [key: string]: unknown;
}

// Enhanced interface for recipe with scoring
interface RecipeWithScore {
  id: string;
  name: string;
  description?: string;
  ingredients?: Array<{ name: string; [key: string]: unknown }>;
  preparationSteps?: string[];
  procedure?: string[];
  instructions?: string[];
  elementalMatchScore?: number;
  currentMomentMatchScore?: number;
  planetaryDayScore?: number;
  planetaryHourScore?: number;
  [key: string]: unknown;
}

// TODO: Implement enhanced elemental compatibility scoring system
// TODO: Add comprehensive sauce recommendation algorithm

// Define recipe type alias for backward compatibility
type RecipeData = Recipe;

// Helper function to ensure consistent recipe structure
function buildCompleteRecipe(recipe: RecipeData, cuisineName: string): Recipe {
  // Set default values for undefined properties
  const defaultElementalProperties: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Find the cuisine flavor profile to use its elemental properties as a base
  const cuisineProfile = Object.values(cuisineFlavorProfiles).find(
    c =>
      c.name.toLowerCase() === cuisineName.toLowerCase() ||
      c.id.toLowerCase() === cuisineName.toLowerCase(),
  );

  // Apply safe type casting for cuisineProfile access
  const cuisineProfileData = cuisineProfile as unknown as {
    elementalAlignment?: ElementalProperties;
    elementalState?: ElementalProperties;
  };
  const elementalAlignment = cuisineProfileData.elementalAlignment;
  const elementalState = cuisineProfileData.elementalState;

  // Extract recipe data with safe property access
  const recipeData = recipe as unknown as Record<string, unknown>;

  // Complete recipe with fallbacks - avoid duplicate properties
  const baseRecipe = {
    id: recipe.id || `recipe-${Math.random().toString(36).substring(2, 9)}`,
    name: recipe.name || `${cuisineName} Recipe`,
    description: recipe.description || `A traditional recipe from ${cuisineName} cuisine.`,
    cuisine: recipe.cuisine || cuisineName,
    matchPercentage:
      (recipeData.matchPercentage as number) ||
      ((recipeData.matchScore as number)
        ? Math.round((recipeData.matchScore as number) * 100)
        : 85),
    matchScore: (recipeData.matchScore as number) || 0.85,
    elementalProperties:
      (recipeData.elementalState as ElementalProperties) ||
      elementalAlignment ||
      elementalState ||
      defaultElementalProperties,
    ingredients: recipe.ingredients || [],
    instructions:
      recipe.instructions ||
      (recipeData.preparationSteps as string[]) ||
      (recipeData.procedure as string[]) ||
      [],
    cookTime:
      (recipeData.cookingTime as number) ||
      (recipeData.cooking_time as number) ||
      (recipeData.cook_time as number) ||
      30,
    prepTime:
      (recipeData.preparationTime as number) ||
      (recipeData.preparation_time as number) ||
      (recipeData.prep_time as number) ||
      15,
    servingSize: recipe.servings || recipe.servings || (recipeData.yield as string) || '4 servings',
    difficulty: recipe.difficulty || (recipeData.skill_level as string) || 'Medium',
    dietaryInfo:
      (recipeData.dietaryInfo as string[]) || (recipeData.dietary_restrictions as string[]) || [],
  };

  // Merge with original recipe, prioritizing base recipe properties
  return { ...recipe, ...baseRecipe } as Recipe;
}

// TODO: Integrate with recommendation service for elemental matching
function calculateElementalMatch(
  recipeElements: ElementalProperties,
  currentMomentElements: ElementalProperties,
): number {
  return recommendationService.calculateElementalCompatibility(
    recipeElements,
    currentMomentElements,
  );
}

// Add this type definition if it's missing
type ExpandedState = {
  [key: string | number]: boolean;
};

export default function CuisineRecommender() {
  // TODO: Implement comprehensive analytics tracking system
  const trackEvent = (eventName: string, eventValue: string) => {
    if (process.env.NODE_ENV === 'development') {
      log.info(`[Analytics] ${eventName}: ${eventValue}`);
    }
  };

  // TODO: Optimize alchemical context usage and state management
  const alchemicalContext = useAlchemical();
  const planetaryPositions = alchemicalContext.planetaryPositions ?? {};
  const state = alchemicalContext.state ?? {
    astrologicalState: {
      currentZodiacSign: 'aries',
      lunarPhase: 'new moon',
    },
  };
  const currentZodiac = state.astrologicalState.currentZodiacSign;
  const lunarPhase = state.astrologicalState.lunarPhase;

  // Create a ref to store astrological state
  const astroStateRef = useRef({
    currentZodiacSign: currentZodiac,
    lunarPhase: lunarPhase,
    elementalState:
      (
        alchemicalContext as unknown as {
          state?: { astrologicalState?: { elementalState?: ElementalProperties } };
        }
      ).state?.astrologicalState?.elementalState ||
      (state as unknown as { astrologicalState?: { elementalState?: ElementalProperties } })
        .astrologicalState?.elementalState ||
      createDefaultElementalProperties(),
  });

  // Create a function to get default elemental properties
  function createDefaultElementalProperties(): ElementalProperties {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Update the ref when state changes
  useEffect(() => {
    astroStateRef.current = {
      currentZodiacSign: currentZodiac,
      lunarPhase: lunarPhase,
      elementalState:
        (
          alchemicalContext as unknown as {
            state?: { astrologicalState?: { elementalState?: ElementalProperties } };
          }
        ).state?.astrologicalState?.elementalState ||
        (state as unknown as { astrologicalState?: { elementalState?: ElementalProperties } })
          .astrologicalState?.elementalState ||
        createDefaultElementalProperties(),
    };
  }, [alchemicalContext, state, currentZodiac, lunarPhase]);

  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cuisineRecommendations, setCuisineRecommendations] = useState<CuisineWithScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  const [cuisineRecipes, setCuisineRecipes] = useState<unknown[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<unknown[]>([]);
  const [showAllRecipes, setShowAllRecipes] = useState<boolean>(false);
  const [showAllSauces, setShowAllSauces] = useState<boolean>(false);
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  const [expandedSauces, setExpandedSauces] = useState<ExpandedState>({});
  const [expandedSauceCards, setExpandedSauceCards] = useState<Record<string, boolean>>({});
  const [showCuisineDetails, setShowCuisineDetails] = useState<boolean>(false);

  // Enhanced features state
  const [showSauceRecommendations, setShowSauceRecommendations] = useState(false);
  const [showCuisineSpecificDetails, setShowCuisineSpecificDetails] = useState(false);
  const [showPlanetaryInfluences, setShowPlanetaryInfluences] = useState(false);
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<
    ElementalProperties | undefined
  >(
    (
      alchemicalContext as unknown as {
        state?: { astrologicalState?: { elementalState?: ElementalProperties } };
      }
    ).state?.astrologicalState?.elementalState ||
      (alchemicalContext as unknown as { state?: { elementalState?: ElementalProperties } }).state
        ?.elementalState,
  );
  const [matchingRecipes, setMatchingRecipes] = useState<unknown[]>([]);
  const [allRecipesData, setAllRecipesData] = useState<Recipe[]>([]);
  // Phase 2D: Advanced Intelligence Systems Integration
  const [enterpriseIntelligence, setEnterpriseIntelligence] =
    useState<IntegratedAdvancedIntelligenceResult | null>(null);
  const [advancedIntelligenceLoading, setAdvancedIntelligenceLoading] = useState(false);
  const [showAdvancedIntelligence, setShowAdvancedIntelligence] = useState(false);

  // Update current moment elemental profile when astrological state changes
  useEffect(() => {
    // Use a stable reference for comparisons by converting to a string
    const elementalStateString = JSON.stringify(
      (state as unknown as { astrologicalState?: { elementalState?: ElementalProperties } })
        .astrologicalState?.elementalState || {},
    );
    const currentProfileString = JSON.stringify(currentMomentElementalProfile || {});

    // Only update if the state has actually changed
    if (elementalStateString !== currentProfileString) {
      const newElementalState = (
        state as unknown as { astrologicalState?: { elementalState?: ElementalProperties } }
      ).astrologicalState?.elementalState;

      if (newElementalState) {
        setCurrentMomentElementalProfile({ ...newElementalState });

        // Generate sauce recommendations only when elemental profile changes
        try {
          // TODO: Replace with actual sauce recommendation function
          const topSauces: SauceRecommendation[] = [];
          setSauceRecommendations(topSauces);
        } catch (error) {
          console.error('Error generating sauce recommendations:', error);
        }
      } else if (currentZodiac && typeof calculateElementalProfileFromZodiac === 'function') {
        // Only recalculate if we don't have elemental state but zodiac changed
        const zodiacElements = calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign);

        if (JSON.stringify(zodiacElements) !== currentProfileString) {
          setCurrentMomentElementalProfile(zodiacElements);

          // Update sauce recommendations with new elemental profile
          try {
            // TODO: Replace with actual sauce recommendation function
            const topSauces: SauceRecommendation[] = [];
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
    void loadCuisines();
  }, [currentZodiac, lunarPhase]);

  // Phase 2D: Advanced Intelligence Systems Integration
  const generateAdvancedIntelligenceAnalysis = async () => {
    if (!selectedCuisine || !astroStateRef.current) return;

    setAdvancedIntelligenceLoading(true);
    try {
      // Get current cuisine data
      const cuisineData = transformedCuisines.find((c: AlchemicalItem) => c.id === selectedCuisine);
      const recipeData = cuisineRecipes[0] as Recipe | undefined;
      const ingredientData = (recipeData as unknown as Record<string, unknown>)?.ingredients || [];

      // Generate enterprise intelligence analysis
      const analysis = await enterpriseIntelligenceIntegration.performEnterpriseAnalysis(
        recipeData,
        Array.isArray(ingredientData) ? ingredientData : [],
        (cuisineData || { id: selectedCuisine, name: selectedCuisine }) as Record<string, unknown>,
        {
          zodiacSign: astroStateRef.current.currentZodiacSign as ZodiacSign,
          lunarPhase: astroStateRef.current.lunarPhase as LunarPhase,
          season: 'all',
          elementalProperties:
            astroStateRef.current.elementalState || createDefaultElementalProperties(),
          planetaryPositions: planetaryPositions,
          userPreferences: {
            dietaryRestrictions: [],
            flavorPreferences: [],
            culturalPreferences: [],
          },
        } as Record<string, unknown>,
      );

      setEnterpriseIntelligence(analysis as unknown as IntegratedAdvancedIntelligenceResult);
      setShowAdvancedIntelligence(true);

      // Track the event
      trackEvent('advanced_intelligence_generated', selectedCuisine);
    } catch (error) {
      console.error('Advanced intelligence analysis failed:', error);
      setError('Failed to generate advanced intelligence analysis');
    } finally {
      setAdvancedIntelligenceLoading(false);
    }
  };

  // Move the async function outside the useEffect
  async function loadCuisines() {
    try {
      setLoading(true);
      setError(null);

      const elementalProperties = (state as unknown as { elementalState?: ElementalProperties })
        .elementalState ||
        (state as unknown as { astrologicalState?: { elementalState?: ElementalProperties } })
          .astrologicalState?.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

      // Use the recommendation service instead of direct utility function
      const result = await recommendationService.getRecommendedCuisines({
        elementalProperties: elementalProperties,
        planetaryPositions: planetaryPositions as Record<string, { sign: string; degree: number }>,
        limit: 20,
      });

      // TODO: Implement proper cuisine data transformation and mapping
      const cuisineList = (result.items || [])
        .map(cuisineName => {
          return {
            id: cuisineName.toLowerCase().replace(/\s+/g, '-') || `cuisine-${Math.random()}`,
            name: cuisineName || 'Unknown Cuisine',
            description: `Traditional ${cuisineName} cuisine with rich flavors and heritage.`,
            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            astrologicalInfluences: [],
            score: result.scores[cuisineName] || 0.5,
            matchPercentage: Math.round((result.scores[cuisineName] || 0.5) * 100),
          };
        })
        .filter(Boolean);

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

  const handleCuisineSelect = (_cuisineId: string) => {
    // log.info(`Cuisine selected: ${_cuisineId}`);

    if (selectedCuisine === _cuisineId) {
      // If already selected, toggle showing details
      setShowCuisineDetails(!showCuisineDetails);
      return;
    }

    // Update state
    setSelectedCuisine(_cuisineId);
    setShowCuisineDetails(true);

    // Reset expansion states when selecting a new cuisine
    setExpandedRecipes({});
    setExpandedSauces({});
    setExpandedSauceCards({});
    setShowAllRecipes(false);
    setShowAllSauces(false);

    // Find selected cuisine from the transformed cuisines list
    const selectedCuisineData = transformedCuisines.find(c => {
      return c.id === _cuisineId || c.name === _cuisineId;
    }) as unknown as CuisineWithScore;
    if (selectedCuisineData) {
      const cuisine = selectedCuisineData;
      trackEvent('cuisine_select', cuisine.name);

      // TODO: Implement comprehensive recipe matching algorithm
      if (cuisine.recipes && (cuisine.recipes || []).length > 0) {
        setMatchingRecipes(cuisine.recipes);
      } else {
        const recipesForCuisine = (allRecipesData || []).filter(
          recipe =>
            recipe.cuisine &&
            (recipe.cuisine.toLowerCase() === cuisine.name.toLowerCase() ||
              (cuisine.regionalVariants &&
                (cuisine.regionalVariants || []).some(
                  variant => recipe.cuisine?.toLowerCase() === variant.toLowerCase(),
                ))),
        );

        if ((recipesForCuisine || []).length > 0) {
          setMatchingRecipes(
            (recipesForCuisine || []).map(recipe =>
              buildCompleteRecipe(recipe as unknown as RecipeData, cuisine.name),
            ),
          );
        } else {
          setMatchingRecipes([]);
        }
      }
    }
  };

  // TODO: Implement comprehensive cuisine action logging system

  const toggleRecipeExpansion = (index: number, _event: React.MouseEvent) => {
    const newExpandedRecipes = { ...expandedRecipes };
    const isExpanding = !newExpandedRecipes[index];
    newExpandedRecipes[index] = isExpanding;

    if (isExpanding && cuisineRecipes && cuisineRecipes[index]) {
      const recipe = cuisineRecipes[index] as CuisineWithScore;
      trackEvent('recipe_expand', recipe.name);
    }

    setExpandedRecipes(newExpandedRecipes);
  };

  const _toggleSauceExpansion = (index: number) => {
    setExpandedSauces(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleSauceCard = (sauceId: string) => {
    setExpandedSauceCards(prev => ({ ...prev, [sauceId]: !prev[sauceId] }));
  };

  // TODO: Implement advanced sauce recommendation algorithm with ML integration
  // TODO: Add flavor profile analysis and complementary pairing logic
  // TODO: Integrate with enterprise intelligence for enhanced recommendations

  // TODO: Implement ML-enhanced cuisine recommendation engine
  // TODO: Add astrological compatibility scoring algorithm
  // TODO: Integrate regional variant analysis with parent cuisine relationships
  // TODO: Implement dynamic scoring based on celestial alignments

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center space-y-3 rounded-lg bg-white p-6 shadow'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500'></div>
        <div className='text-center'>
          <p className='text-lg font-medium'>Loading cuisine recommendations...</p>
          <p className='text-sm text-gray-500'>{loadingStep}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className='rounded bg-red-50 p-4 text-red-500'>{error}</div>;
  }

  // Get the currently selected cuisine data
  const selectedCuisineData = transformedCuisines.find(c => {
    return c.id === selectedCuisine || c.name === selectedCuisine;
  }) as unknown as CuisineWithScore;

  return (
    <div className='rounded-lg bg-white p-4 shadow'>
      <h2 className='mb-3 text-xl font-medium'>Celestial Cuisine Guide</h2>

      {/* Enhanced features toggles */}
      <div className='mb-4 flex flex-wrap gap-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-3'>
        <button
          onClick={() => setShowSauceRecommendations(!showSauceRecommendations)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showSauceRecommendations
              ? 'bg-orange-500 text-white'
              : 'bg-white/90 text-orange-600 hover:bg-orange-100'
          }`}
        >
          🍯 Sauce Harmonizer
        </button>
        <button
          onClick={() => setShowCuisineSpecificDetails(!showCuisineSpecificDetails)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showCuisineSpecificDetails
              ? 'bg-green-500 text-white'
              : 'bg-white/90 text-green-600 hover:bg-green-100'
          }`}
        >
          🌍 Regional Details
        </button>
        <button
          onClick={() => setShowPlanetaryInfluences(!showPlanetaryInfluences)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showPlanetaryInfluences
              ? 'bg-purple-500 text-white'
              : 'bg-white/90 text-purple-600 hover:bg-purple-100'
          }`}
        >
          🪐 Planetary Influences
        </button>
      </div>

      {/* Group cuisine cards in a better grid layout */}
      <div className='mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {(transformedCuisines || []).map(cuisineItem => {
          const cuisine = cuisineItem as unknown as CuisineWithScore;
          // Calculate match percentage
          const matchPercentage =
            cuisine.matchPercentage ||
            (cuisine.compatibilityScore ? Math.round(cuisine.compatibilityScore * 100) : 50);

          // Check if this is a regional variant
          const isRegionalVariant = !!cuisine.parentCuisine;

          return (
            <div
              key={cuisine.id}
              className={`cursor-pointer rounded border p-3 transition-all duration-200 hover:shadow-md ${
                selectedCuisine === cuisine.id || selectedCuisine === cuisine.name
                  ? 'border-blue-400 bg-blue-50'
                  : isRegionalVariant
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-200'
              }`}
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              {/* Cuisine header with name and match score */}
              <div className='mb-2 flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium'>{cuisine.name}</h3>
                  {isRegionalVariant ? (
                    <span className='text-xs text-gray-500'>
                      Regional variant of {cuisine.parentCuisine}
                    </span>
                  ) : null}
                  {cuisine.regionalVariants && (cuisine.regionalVariants || []).length > 0 ? (
                    <span className='block text-xs text-gray-500'>
                      {(cuisine.regionalVariants || []).length} regional variants
                    </span>
                  ) : null}
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs ${getMatchScoreClass(
                    cuisine.compatibilityScore || cuisine.score || 0.5,
                  )}`}
                >
                  {matchPercentage}%
                </span>
              </div>

              {/* Cuisine description - truncated */}
              <p className='mb-2 line-clamp-2 text-xs text-gray-600' title={cuisine.description}>
                {cuisine.description}
              </p>

              {/* Elemental properties */}
              <div className='mb-2 flex items-center space-x-1'>
                <span className='text-xs font-medium text-gray-500'>Elements:</span>
                <div className='flex space-x-1'>
                  {(cuisine.elementalState.Fire || cuisine.elementalProperties?.Fire || 0) >=
                  0.3 ? (
                    <div
                      className='flex items-center'
                      title={`fire: ${Math.round(cuisine.elementalState.Fire * 100)}%`}
                    >
                      <Flame size={14} className='text-red-500' />
                      <span className='ml-1 text-xs'>
                        {Math.round(cuisine.elementalState.Fire * 100)}%
                      </span>
                    </div>
                  ) : null}
                  {(cuisine.elementalState.Water || cuisine.elementalProperties?.Water || 0) >=
                  0.3 ? (
                    <div
                      className='flex items-center'
                      title={`water: ${Math.round((cuisine.elementalState.Water || cuisine.elementalProperties?.Water || 0) * 100)}%`}
                    >
                      <Droplets size={14} className='text-blue-500' />
                      <span className='ml-1 text-xs'>
                        {Math.round(
                          (cuisine.elementalState.Water ||
                            cuisine.elementalProperties?.Water ||
                            0) * 100,
                        )}
                        %
                      </span>
                    </div>
                  ) : null}
                  {(cuisine.elementalState.Earth || cuisine.elementalProperties?.Earth || 0) >=
                  0.3 ? (
                    <div
                      className='flex items-center'
                      title={`earth: ${Math.round((cuisine.elementalState.Earth || cuisine.elementalProperties?.Earth || 0) * 100)}%`}
                    >
                      <Mountain size={14} className='text-green-500' />
                      <span className='ml-1 text-xs'>
                        {Math.round(
                          (cuisine.elementalState.Earth ||
                            cuisine.elementalProperties?.Earth ||
                            0) * 100,
                        )}
                        %
                      </span>
                    </div>
                  ) : null}
                  {(cuisine.elementalState.Air || cuisine.elementalProperties?.Air || 0) >= 0.3 ? (
                    <div
                      className='flex items-center'
                      title={`Air: ${Math.round((cuisine.elementalState.Air || cuisine.elementalProperties?.Air || 0) * 100)}%`}
                    >
                      <Wind size={14} className='text-yellow-500' />
                      <span className='ml-1 text-xs'>
                        {Math.round(
                          (cuisine.elementalState.Air || cuisine.elementalProperties?.Air || 0) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Show signature dishes and techniques if available */}
              {cuisine.signatureDishes && (cuisine.signatureDishes || []).length > 0 ? (
                <div className='mt-1'>
                  <span className='block text-xs font-medium text-gray-500'>Signature dishes:</span>
                  <span className='text-xs text-gray-600'>
                    {cuisine.signatureDishes.slice(0, 3).join(', ')}
                    {(cuisine.signatureDishes || []).length > 3 ? '...' : ''}
                  </span>
                </div>
              ) : null}

              {/* Show astrological influences if available */}
              {cuisine.zodiacInfluences && (cuisine.zodiacInfluences || []).length > 0 ? (
                <div className='mt-1 flex flex-wrap gap-1'>
                  {cuisine.zodiacInfluences.slice(0, 3).map(sign => (
                    <span
                      key={sign}
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${currentZodiac === sign ? 'bg-blue-100 font-medium text-blue-800' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {sign}
                      {currentZodiac === sign ? <span className='ml-1'>✓</span> : null}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Standalone Sauce Recommendations Section */}
      {showSauceRecommendations && (
        <div className='mt-6 border-t border-gray-200 pt-4'>
          <h3 className='mb-3 text-lg font-medium'>🍯 Celestial Sauce Harmonizer</h3>
          <p className='mb-4 text-sm text-gray-600'>
            Discover sauces that complement the current moment's alchemical alignment and enhance
            your culinary experience.
          </p>

          {loading ? (
            <div className='p-4 text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500'></div>
              <p className='text-sm text-gray-500'>Finding harmonious sauces...</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {((sauceRecommendations || []).length > 0 ? sauceRecommendations : []).map(
                (sauceItem, index) => {
                  const sauce = sauceItem as SauceWithScore;
                  return (
                    <div
                      key={`${sauce.id || sauce.name}-${index}`}
                      className={`rounded border bg-white p-3 transition-all duration-200 hover:shadow-md ${
                        expandedSauceCards[`${sauce.id || sauce.name}-${index}`] ? 'shadow-md' : ''
                      }`}
                      onClick={() => toggleSauceCard(`${sauce.id || sauce.name}-${index}`)}
                    >
                      <div className='mb-2 flex items-start justify-between'>
                        <h5 className='mr-1 text-sm font-medium leading-tight'>{sauce.name}</h5>
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${getMatchScoreClass(
                            (sauce.matchPercentage || 0) / 100,
                          )}`}
                        >
                          {sauce.matchPercentage || 0}%
                        </span>
                      </div>
                      <p
                        className='line-clamp-3 grow text-xs leading-relaxed text-gray-600'
                        title={sauce.description}
                      >
                        {sauce.description}
                      </p>

                      {/* Show elemental properties */}
                      <div className='mt-2 flex space-x-1'>
                        {(sauce.elementalState?.Fire || 0) >= 0.3 && (
                          <div className='flex items-center' title='Fire'>
                            <Flame size={12} className='text-red-500' />
                          </div>
                        )}
                        {(sauce.elementalState?.Water || 0) >= 0.3 && (
                          <div className='flex items-center' title='Water'>
                            <Droplets size={12} className='text-blue-500' />
                          </div>
                        )}
                        {(sauce.elementalState?.Earth || 0) >= 0.3 && (
                          <div className='flex items-center' title='Earth'>
                            <Mountain size={12} className='text-green-500' />
                          </div>
                        )}
                        {(sauce.elementalState?.Air || 0) >= 0.3 && (
                          <div className='flex items-center' title='Air'>
                            <Wind size={12} className='text-yellow-500' />
                          </div>
                        )}
                      </div>

                      {/* Show key ingredients if available */}
                      {sauce.ingredients && (sauce.ingredients || []).length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-1'>
                          {sauce.ingredients.slice(0, 3).map((ingredient, i) => (
                            <span
                              key={i}
                              className='rounded border border-gray-100 bg-white px-1.5 py-0.5 text-xs'
                            >
                              {ingredient}
                            </span>
                          ))}
                          {(sauce.ingredients || []).length > 3 && (
                            <span className='text-xs text-gray-500'>
                              +{(sauce.ingredients || []).length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expanded sauce details */}
                      {expandedSauceCards[`${sauce.id || sauce.name}-${index}`] && (
                        <div className='mt-2 border-t border-gray-200 pt-2 text-xs'>
                          <div className='mb-2 mt-2 space-y-1'>
                            <div className='flex items-center justify-between text-gray-600'>
                              <span>Elemental Match:</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs ${getMatchScoreClass(
                                  (sauce.elementalMatchScore || 0) / 100,
                                )}`}
                              >
                                {sauce.elementalMatchScore || 0}%
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-gray-600'>
                              <span>Celestial Alignment:</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs ${getMatchScoreClass(
                                  (sauce.currentMomentMatchScore || 0) / 100,
                                )}`}
                              >
                                {sauce.currentMomentMatchScore || 0}%
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-gray-600'>
                              <span>Planetary Day Match:</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs ${getMatchScoreClass(
                                  (sauce.planetaryDayScore || 0) / 100,
                                )}`}
                              >
                                {sauce.planetaryDayScore || 0}%
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-gray-600'>
                              <span>Planetary Hour Match:</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs ${getMatchScoreClass(
                                  (sauce.planetaryHourScore || 0) / 100,
                                )}`}
                              >
                                {sauce.planetaryHourScore || 0}%
                              </span>
                            </div>
                          </div>

                          {/* Show all ingredients */}
                          {sauce.ingredients && (sauce.ingredients || []).length > 0 && (
                            <div className='mt-1'>
                              <h6 className='mb-1 font-medium'>Ingredients:</h6>
                              <div className='flex flex-wrap gap-1'>
                                {(sauce.ingredients || []).map((ingredient: string, i: number) => (
                                  <span
                                    key={i}
                                    className='inline-block rounded bg-gray-100 px-1.5 py-0.5'
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show preparation steps */}
                          {(sauce.preparationSteps || sauce.procedure || sauce.instructions) && (
                            <div className='mt-2'>
                              <h6 className='mb-1 font-medium'>Preparation:</h6>
                              {Array.isArray(
                                (sauce as Record<string, unknown>).preparationSteps ||
                                  (sauce as Record<string, unknown>).procedure ||
                                  (sauce as Record<string, unknown>).instructions,
                              ) ? (
                                <ol className='list-decimal pl-4'>
                                  {(Array.isArray(
                                    (sauce as Record<string, unknown>).preparationSteps,
                                  )
                                    ? ((sauce as Record<string, unknown>)
                                        .preparationSteps as unknown[])
                                    : Array.isArray((sauce as Record<string, unknown>).procedure)
                                      ? ((sauce as Record<string, unknown>).procedure as unknown[])
                                      : Array.isArray(
                                            (sauce as Record<string, unknown>).instructions,
                                          )
                                        ? ((sauce as Record<string, unknown>)
                                            .instructions as unknown[])
                                        : []
                                  ).map((step: unknown, i: number) => (
                                    <li key={i}>{String(step)}</li>
                                  ))}
                                </ol>
                              ) : (
                                <p>
                                  {String(
                                    (sauce as Record<string, unknown>).preparationSteps ||
                                      (sauce as Record<string, unknown>).procedure ||
                                      (sauce as Record<string, unknown>).instructions ||
                                      '',
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}

      {/* Display expanded details for selected cuisine */}
      {selectedCuisineData && showCuisineDetails && (
        <div className='mt-4 border-t border-gray-200 pt-3'>
          <div className='mb-2 flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold'>
                {String((selectedCuisineData as Record<string, unknown>).name || '')} Cuisine
              </h3>
              {(selectedCuisineData as Record<string, unknown>).parentCuisine ? (
                <span className='text-sm text-gray-500'>
                  Regional variant of{' '}
                  {String((selectedCuisineData as Record<string, unknown>).parentCuisine || '')}
                </span>
              ) : null}
            </div>
            <span
              className={`rounded px-2 py-1 text-xs ${getMatchScoreClass(
                Number((selectedCuisineData as Record<string, unknown>).compatibilityScore) ||
                  Number((selectedCuisineData as Record<string, unknown>).score) ||
                  0.5,
              )}`}
            >
              {Math.round(
                (Number((selectedCuisineData as Record<string, unknown>).compatibilityScore) ||
                  Number((selectedCuisineData as Record<string, unknown>).score) ||
                  0.5) * 100,
              )}
              % match
            </span>
          </div>

          <p className='mb-3 text-sm text-gray-600'>
            {String((selectedCuisineData as Record<string, unknown>).description || '')}
          </p>

          {/* Display more detailed information about the cuisine */}
          <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Elemental properties */}
            <div className='rounded border bg-gray-50 p-3'>
              <h4 className='mb-2 text-sm font-medium'>Elemental Properties</h4>
              <div className='grid grid-cols-2 gap-2'>
                {Object.entries(
                  ((selectedCuisineData as Record<string, unknown>)
                    .elementalState as ElementalProperties) || {
                    Fire: 0,
                    Water: 0,
                    Earth: 0,
                    Air: 0,
                  },
                ).map(([element, value]) => (
                  <div key={element} className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      {element === 'Fire' && <Flame size={16} className='mr-1 text-red-500' />}
                      {element === 'Water' && <Droplets size={16} className='mr-1 text-blue-500' />}
                      {element === 'Earth' && (
                        <Mountain size={16} className='mr-1 text-green-500' />
                      )}
                      {element === 'Air' && <Wind size={16} className='mr-1 text-yellow-500' />}
                      <span className='text-sm'>{element}</span>
                    </div>
                    <div className='h-2.5 w-20 rounded-full bg-gray-200'>
                      <div
                        className={`h-2.5 rounded-full ${
                          element === 'Fire'
                            ? 'bg-red-500'
                            : element === 'Water'
                              ? 'bg-blue-500'
                              : element === 'Earth'
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.round(Number(value || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Astrological influences */}
            <div className='rounded border bg-gray-50 p-3'>
              <h4 className='mb-2 text-sm font-medium'>Astrological Influences</h4>
              {(selectedCuisineData as Record<string, unknown>).zodiacInfluences &&
              Array.isArray((selectedCuisineData as Record<string, unknown>).zodiacInfluences) &&
              ((selectedCuisineData as Record<string, unknown>).zodiacInfluences as unknown[])
                .length > 0 ? (
                <div>
                  <span className='mb-1 block text-xs font-medium text-gray-500'>Zodiac:</span>
                  <div className='mb-2 flex flex-wrap gap-1'>
                    {(
                      ((selectedCuisineData as Record<string, unknown>)
                        .zodiacInfluences as unknown[]) || []
                    ).map((sign: unknown) => (
                      <span
                        key={String(sign)}
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${currentZodiac === sign ? 'bg-blue-100 font-medium text-blue-800' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {String(sign)}
                        {currentZodiac === sign && <span className='ml-1'>✓</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className='text-xs text-gray-500'>No specific zodiac influences</p>
              )}

              {(selectedCuisineData as Record<string, unknown>).lunarPhaseInfluences &&
              Array.isArray(
                (selectedCuisineData as Record<string, unknown>).lunarPhaseInfluences,
              ) &&
              ((selectedCuisineData as Record<string, unknown>).lunarPhaseInfluences as unknown[])
                .length > 0 ? (
                <div>
                  <span className='mb-1 block text-xs font-medium text-gray-500'>
                    Lunar Phases:
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {(
                      ((selectedCuisineData as Record<string, unknown>)
                        .lunarPhaseInfluences as unknown[]) || []
                    ).map((phase: unknown) => (
                      <span
                        key={String(phase)}
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs ${lunarPhase === phase ? 'bg-blue-100 font-medium text-blue-800' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {String(phase)}
                        {lunarPhase === phase && <span className='ml-1'>✓</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Regional variants if any */}
          {(selectedCuisineData as Record<string, unknown>).regionalVariants &&
          Array.isArray((selectedCuisineData as Record<string, unknown>).regionalVariants) &&
          ((selectedCuisineData as Record<string, unknown>).regionalVariants as unknown[]).length >
            0 ? (
            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium'>Regional Variants</h4>
              <div className='flex flex-wrap gap-2'>
                {(
                  ((selectedCuisineData as Record<string, unknown>)
                    .regionalVariants as unknown[]) || []
                ).map((variant: unknown) => (
                  <span
                    key={String(variant)}
                    className='inline-flex items-center rounded bg-gray-100 px-2 py-1 text-sm text-gray-800'
                  >
                    {String(variant)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Signature dishes if available */}
          {(selectedCuisineData as Record<string, unknown>).signatureDishes &&
          Array.isArray((selectedCuisineData as Record<string, unknown>).signatureDishes) &&
          ((selectedCuisineData as Record<string, unknown>).signatureDishes as unknown[]).length >
            0 ? (
            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium'>Signature Dishes</h4>
              <div className='flex flex-wrap gap-2'>
                {(
                  ((selectedCuisineData as Record<string, unknown>).signatureDishes as unknown[]) ||
                  []
                ).map((dish: unknown, index: number) => (
                  <span
                    key={index}
                    className='inline-flex items-center rounded bg-yellow-50 px-2 py-1 text-sm text-yellow-800'
                  >
                    {String(dish)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Recipe Recommendations - Shown after cuisine info */}
          {cuisineRecipes && (cuisineRecipes || []).length > 0 ? (
            <div className='mt-4'>
              <h4 className='mb-2 text-sm font-medium'>
                Recipes ({(cuisineRecipes || []).length} available)
              </h4>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {cuisineRecipes.slice(0, showAllRecipes ? undefined : 6).map((recipe, index) => (
                  <div
                    key={`${(recipe as Record<string, unknown>).id || (recipe as Record<string, unknown>).name}-${index}`}
                    className={`cursor-pointer rounded border bg-white p-3 transition-all duration-200 hover:shadow-md ${expandedRecipes[index] ? 'shadow-md' : ''}`}
                    onClick={e => toggleRecipeExpansion(index, e as React.MouseEvent)}
                    data-recipe-index={index}
                    data-recipe-name={(recipe as Record<string, unknown>).name}
                    data-is-expanded={expandedRecipes[index] ? 'true' : 'false'}
                  >
                    <div className='mb-1 flex items-center justify-between'>
                      <div>
                        <h5 className='text-sm font-medium'>
                          {String((recipe as Record<string, unknown>).name || '')}
                        </h5>
                        {(recipe as Record<string, unknown>).regionalVariant ? (
                          <span className='text-xs text-gray-500'>
                            {String((recipe as Record<string, unknown>).regionalVariant || '')}{' '}
                            style
                          </span>
                        ) : null}
                        {(recipe as Record<string, unknown>).fromParentCuisine &&
                        (recipe as Record<string, unknown>).parentCuisine ? (
                          <span className='text-xs text-gray-500'>
                            From {String((recipe as Record<string, unknown>).parentCuisine || '')}
                          </span>
                        ) : null}
                      </div>
                      {(recipe as Record<string, unknown>).matchPercentage ? (
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${getMatchScoreClass(
                            Number((recipe as Record<string, unknown>).matchPercentage) || 0.5,
                          )}`}
                        >
                          {String(
                            Math.round(
                              Number((recipe as Record<string, unknown>).matchPercentage || 0),
                            ),
                          )}
                          %
                        </span>
                      ) : null}
                    </div>

                    {!expandedRecipes[index] && (
                      <p
                        className='line-clamp-2 text-xs text-gray-600'
                        title={String((recipe as Record<string, unknown>).description || '')}
                      >
                        {String(
                          (recipe as Record<string, unknown>).description ||
                            'A traditional recipe from this cuisine.',
                        )}
                      </p>
                    )}

                    {/* Expanded recipe details - add a data attribute for debugging */}
                    {expandedRecipes[index] && (
                      <div
                        className='expanded-recipe-content mt-2 border-t pt-2'
                        data-expanded='true'
                        style={{ display: 'block !important' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <p className='mb-2 text-xs text-gray-600'>
                          {String(
                            (recipe as Record<string, unknown>).description ||
                              'A traditional recipe from this cuisine.',
                          )}
                        </p>

                        <div className='mb-1 flex space-x-1'>
                          {(() => {
                            const elementalState = (recipe as Record<string, unknown>)
                              .elementalState;
                            const fireValue =
                              typeof elementalState === 'object' &&
                              elementalState !== null &&
                              'Fire' in elementalState
                                ? Number((elementalState as Record<string, unknown>).Fire || 0)
                                : 0;
                            return fireValue >= 0.3 ? (
                              <Flame size={12} className='text-red-500' />
                            ) : null;
                          })()}
                          {(() => {
                            const elementalState = (recipe as Record<string, unknown>)
                              .elementalState;
                            const waterValue =
                              typeof elementalState === 'object' &&
                              elementalState !== null &&
                              'Water' in elementalState
                                ? Number((elementalState as Record<string, unknown>).Water || 0)
                                : 0;
                            return waterValue >= 0.3 ? (
                              <Droplets size={12} className='text-blue-500' />
                            ) : null;
                          })()}
                          {(() => {
                            const elementalState = (recipe as Record<string, unknown>)
                              .elementalState;
                            const earthValue =
                              typeof elementalState === 'object' &&
                              elementalState !== null &&
                              'Earth' in elementalState
                                ? Number((elementalState as Record<string, unknown>).Earth || 0)
                                : 0;
                            return earthValue >= 0.3 ? (
                              <Mountain size={12} className='text-green-500' />
                            ) : null;
                          })()}
                          {(() => {
                            const elementalState = (recipe as Record<string, unknown>)
                              .elementalState;
                            const airValue =
                              typeof elementalState === 'object' &&
                              elementalState !== null &&
                              'Air' in elementalState
                                ? Number((elementalState as Record<string, unknown>).Air || 0)
                                : 0;
                            return airValue >= 0.3 ? (
                              <Wind size={12} className='text-yellow-500' />
                            ) : null;
                          })()}
                        </div>

                        {/* Show ingredients with proper type casting */}
                        {
                          ((recipe as Record<string, unknown>).ingredients &&
                          Array.isArray((recipe as Record<string, unknown>).ingredients) &&
                          ((recipe as Record<string, unknown>).ingredients as unknown[]).length >
                            0 ? (
                            <div className='mt-1'>
                              <h6 className='mb-1 text-xs font-semibold'>Ingredients:</h6>
                              <ul className='list-disc pl-4 text-xs'>
                                {Array.isArray((recipe as Record<string, unknown>).ingredients) ? (
                                  (
                                    ((recipe as Record<string, unknown>)
                                      .ingredients as unknown[]) || []
                                  ).map((ingredient, i) => (
                                    <li key={i} className='mb-0.5'>
                                      {typeof ingredient === 'string'
                                        ? ingredient
                                        : `${(ingredient as Record<string, unknown>).amount || ''} ${
                                            (ingredient as Record<string, unknown>).unit || ''
                                          } ${(ingredient as Record<string, unknown>).name}${
                                            (ingredient as Record<string, unknown>).preparation
                                              ? `, ${(ingredient as Record<string, unknown>).preparation}`
                                              : ''
                                          }`}
                                    </li>
                                  ))
                                ) : (
                                  <li>Ingredients not available</li>
                                )}
                              </ul>
                            </div>
                          ) : null) as React.ReactElement
                        }

                        {
                          (((recipe as Record<string, unknown>).instructions ||
                            (recipe as Record<string, unknown>).preparationSteps ||
                            (recipe as Record<string, unknown>).procedure) && (
                            <div className='mt-2'>
                              <h6 className='mb-1 text-xs font-semibold'>Procedure:</h6>
                              <p className='text-xs text-gray-600'>
                                {String(
                                  (recipe as Record<string, unknown>).instructions ||
                                    (recipe as Record<string, unknown>).preparationSteps ||
                                    (recipe as Record<string, unknown>).procedure ||
                                    'No detailed instructions available.',
                                )}
                              </p>
                            </div>
                          )) as React.ReactElement
                        }

                        {/* Additional recipe information */}
                        <div className='mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gray-100 pt-1 text-xs'>
                          {(recipe as Record<string, unknown>).cookingTime ? (
                            <div>
                              <span className='text-gray-500'>Cook: </span>
                              <span>
                                {String((recipe as Record<string, unknown>).cookingTime || '')}
                              </span>
                            </div>
                          ) : null}

                          {(recipe as Record<string, unknown>).preparationTime ? (
                            <div>
                              <span className='text-gray-500'>Prep: </span>
                              <span>
                                {String((recipe as Record<string, unknown>).preparationTime || '')}
                              </span>
                            </div>
                          ) : null}

                          {(recipe as Record<string, unknown>).servings ? (
                            <div>
                              <span className='text-gray-500'>Serves: </span>
                              <span>
                                {String((recipe as Record<string, unknown>).servings || '')}
                              </span>
                            </div>
                          ) : null}

                          {(recipe as Record<string, unknown>).difficulty ? (
                            <div>
                              <span className='text-gray-500'>Difficulty: </span>
                              <span>
                                {String((recipe as Record<string, unknown>).difficulty || '')}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {Boolean(
                          (recipe as Record<string, unknown>).dietaryInfo &&
                            Array.isArray((recipe as Record<string, unknown>).dietaryInfo) &&
                            ((recipe as Record<string, unknown>).dietaryInfo as unknown[]).length >
                              0,
                        ) && (
                          <div className='mt-2 flex flex-wrap gap-1'>
                            {Array.isArray((recipe as Record<string, unknown>).dietaryInfo) ? (
                              (
                                ((recipe as Record<string, unknown>).dietaryInfo as unknown[]) || []
                              ).map((diet, i) => (
                                <span
                                  key={i}
                                  className='inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700'
                                >
                                  {String(diet)}
                                </span>
                              ))
                            ) : (
                              <span className='inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700'>
                                {String((recipe as Record<string, unknown>).dietaryInfo)}
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
                  className='mt-2 flex items-center text-xs text-blue-500 hover:underline'
                  onClick={e => {
                    e.stopPropagation();
                    setShowAllRecipes(!showAllRecipes);
                  }}
                >
                  {showAllRecipes ? (
                    <>
                      <ChevronUp size={12} className='mr-1' />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} className='mr-1' />
                      Show All Recipes ({(cuisineRecipes || []).length})
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className='mt-4 border-t border-gray-100 pt-2'>
              <h4 className='mb-2 text-sm font-medium'>Recipes</h4>
              <div className='rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600'>
                <p className='mb-2'>
                  No recipes available for{' '}
                  {String((selectedCuisineData as Record<string, unknown>).name || 'this cuisine')}.
                </p>

                <div className='mt-4 flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                  <p className='text-xs'>
                    Try selecting a different cuisine or check back later for updated recipes.
                  </p>
                </div>

                {/* Fallback placeholder recipes */}
                <div className='mt-4 rounded border border-gray-100 bg-white p-3'>
                  <h5 className='text-sm font-medium'>
                    {String((selectedCuisineData as Record<string, unknown>).name || 'Cuisine')}{' '}
                    Dish Inspiration
                  </h5>
                  <p className='mt-1 text-xs'>
                    Try exploring traditional{' '}
                    {String(
                      (selectedCuisineData as Record<string, unknown>).name || 'this cuisine',
                    )}{' '}
                    recipes
                    {Array.isArray(
                      (selectedCuisineData as Record<string, unknown>).signatureDishes,
                    ) &&
                    (
                      ((selectedCuisineData as Record<string, unknown>)
                        .signatureDishes as unknown[]) || []
                    ).length > 0
                      ? ` like ${Array.isArray((selectedCuisineData as Record<string, unknown>).signatureDishes) ? ((selectedCuisineData as Record<string, unknown>).signatureDishes as unknown[]).slice(0, 3).map(String).join(', ') : ''}, and more.`
                      : ' using ingredients typical to this cuisine.'}
                  </p>

                  {Array.isArray(
                    (selectedCuisineData as Record<string, unknown>).commonIngredients,
                  ) &&
                    (
                      ((selectedCuisineData as Record<string, unknown>)
                        .commonIngredients as unknown[]) || []
                    ).length > 0 && (
                      <div className='mt-2'>
                        <p className='text-xs font-medium'>Key Ingredients:</p>
                        <p className='text-xs'>
                          {Array.isArray(
                            (selectedCuisineData as Record<string, unknown>).commonIngredients,
                          )
                            ? (
                                (selectedCuisineData as Record<string, unknown>)
                                  .commonIngredients as unknown[]
                              )
                                .slice(0, 5)
                                .map(String)
                                .join(', ')
                            : ''}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 2D: Advanced Intelligence Systems Integration */}
      {selectedCuisine && (
        <div className='mt-6 border-t border-gray-200 pt-4'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800'>Advanced Intelligence Analysis</h3>
            <button
              onClick={generateAdvancedIntelligenceAnalysis}
              disabled={advancedIntelligenceLoading}
              className='flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {advancedIntelligenceLoading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Info size={16} />
                  Generate Analysis
                </>
              )}
            </button>
          </div>

          {showAdvancedIntelligence && enterpriseIntelligence && (
            <div className='space-y-6'>
              {/* Overall System Health */}
              <div className='rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4'>
                <h4 className='text-md mb-2 font-semibold text-purple-800'>
                  System Health Overview
                </h4>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {Math.round(
                        ((enterpriseIntelligence as unknown as { overallScore?: number })
                          ?.overallScore || 0.85) * 100,
                      )}
                      %
                    </div>
                    <div className='text-sm text-gray-600'>Overall Score</div>
                  </div>
                  <div className='text-center'>
                    <div
                      className={`text-2xl font-bold ${
                        enterpriseIntelligence.systemHealth === 'excellent'
                          ? 'text-green-600'
                          : enterpriseIntelligence.systemHealth === 'good'
                            ? 'text-blue-600'
                            : enterpriseIntelligence.systemHealth === 'fair'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                      }`}
                    >
                      {enterpriseIntelligence.systemHealth.toUpperCase()}
                    </div>
                    <div className='text-sm text-gray-600'>System Health</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {enterpriseIntelligence.predictiveIntelligence
                        ? Math.round(enterpriseIntelligence.predictiveIntelligence.confidence * 100)
                        : 0}
                      %
                    </div>
                    <div className='text-sm text-gray-600'>Predictive Confidence</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {enterpriseIntelligence.mlIntelligence
                        ? Math.round(enterpriseIntelligence.mlIntelligence.confidence * 100)
                        : 0}
                      %
                    </div>
                    <div className='text-sm text-gray-600'>ML Confidence</div>
                  </div>
                </div>
              </div>

              {/* Predictive Intelligence */}
              {enterpriseIntelligence.predictiveIntelligence && (
                <div className='rounded-lg border border-gray-200 bg-white p-4'>
                  <h4 className='text-md mb-3 flex items-center gap-2 font-semibold text-gray-800'>
                    <div className='h-3 w-3 rounded-full bg-purple-500'></div>
                    Predictive Intelligence
                  </h4>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <h5 className='mb-2 text-sm font-medium text-gray-700'>Recipe Predictions</h5>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Success Probability:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.predictiveIntelligence.recipePrediction
                                .successProbability * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>User Satisfaction:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.predictiveIntelligence.recipePrediction
                                .userSatisfactionPrediction * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className='text-xs text-gray-600'>
                          {
                            enterpriseIntelligence.predictiveIntelligence.recipePrediction
                              .optimalTimingPrediction
                          }
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className='mb-2 text-sm font-medium text-gray-700'>
                        Astrological Predictions
                      </h5>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Alignment:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.predictiveIntelligence.astrologicalPrediction
                                .alignmentPrediction * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className='text-xs text-gray-600'>
                          {
                            enterpriseIntelligence.predictiveIntelligence.astrologicalPrediction
                              .timingOptimizationPrediction
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ML Intelligence */}
              {enterpriseIntelligence.mlIntelligence && (
                <div className='rounded-lg border border-gray-200 bg-white p-4'>
                  <h4 className='text-md mb-3 flex items-center gap-2 font-semibold text-gray-800'>
                    <div className='h-3 w-3 rounded-full bg-green-500'></div>
                    Machine Learning Intelligence
                  </h4>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <h5 className='mb-2 text-sm font-medium text-gray-700'>
                        Recipe Optimization
                      </h5>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>ML Optimized Score:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.mlIntelligence.recipeOptimization
                                .mlOptimizedScore * 100,
                            )}
                            %
                          </span>
                        </div>
                        {enterpriseIntelligence.mlIntelligence.recipeOptimization
                          .ingredientSubstitutionRecommendations.length > 0 && (
                          <div className='text-xs text-gray-600'>
                            {
                              enterpriseIntelligence.mlIntelligence.recipeOptimization
                                .ingredientSubstitutionRecommendations[0]
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className='mb-2 text-sm font-medium text-gray-700'>Cuisine Fusion</h5>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Fusion Success:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.mlIntelligence.cuisineFusion
                                .fusionSuccessPrediction * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Cultural Harmony:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.mlIntelligence.cuisineFusion
                                .culturalHarmonyPrediction * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Analytics Intelligence */}
              {enterpriseIntelligence.advancedAnalyticsIntelligence && (
                <div className='rounded-lg border border-gray-200 bg-white p-4'>
                  <h4 className='text-md mb-3 flex items-center gap-2 font-semibold text-gray-800'>
                    <div className='h-3 w-3 rounded-full bg-blue-500'></div>
                    Advanced Analytics Intelligence
                  </h4>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <h5 className='mb-2 text-sm font-medium text-gray-700'>Recipe Analytics</h5>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Multi-dimensional Score:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.advancedAnalyticsIntelligence.recipeAnalytics
                                .multiDimensionalScore * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Success Probability:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.advancedAnalyticsIntelligence.recipeAnalytics
                                .predictiveInsights.successProbability * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className='mb-2 text-sm font-medium text-gray-700'>
                        Astrological Analytics
                      </h5>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Culinary Correlation:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.advancedAnalyticsIntelligence
                                .astrologicalAnalytics.correlationAnalysis.culinaryCorrelation *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Alignment Prediction:</span>
                          <span className='font-medium'>
                            {Math.round(
                              enterpriseIntelligence.advancedAnalyticsIntelligence
                                .astrologicalAnalytics.predictiveModeling.alignmentPrediction * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrated Advanced Intelligence */}
              {(
                enterpriseIntelligence as unknown as {
                  integratedAdvancedIntelligence?: Record<string, unknown>;
                }
              )?.integratedAdvancedIntelligence && (
                <div className='rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4'>
                  <h4 className='text-md mb-3 flex items-center gap-2 font-semibold text-indigo-800'>
                    <div className='h-3 w-3 rounded-full bg-indigo-500'></div>
                    Integrated Advanced Intelligence
                  </h4>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='text-center'>
                      <div className='text-xl font-bold text-indigo-600'>
                        {Math.round(
                          ((
                            enterpriseIntelligence as unknown as {
                              integratedAdvancedIntelligence?: { overallConfidence?: number };
                            }
                          )?.integratedAdvancedIntelligence?.overallConfidence || 0) * 100,
                        )}
                        %
                      </div>
                      <div className='text-sm text-gray-600'>Overall Confidence</div>
                    </div>
                    <div className='text-center'>
                      <div
                        className={`text-xl font-bold ${
                          (
                            enterpriseIntelligence as unknown as {
                              integratedAdvancedIntelligence?: { systemHealth?: string };
                            }
                          )?.integratedAdvancedIntelligence?.systemHealth === 'excellent'
                            ? 'text-green-600'
                            : (
                                  enterpriseIntelligence as unknown as {
                                    integratedAdvancedIntelligence?: { systemHealth?: string };
                                  }
                                )?.integratedAdvancedIntelligence?.systemHealth === 'good'
                              ? 'text-blue-600'
                              : (
                                    enterpriseIntelligence as unknown as {
                                      integratedAdvancedIntelligence?: { systemHealth?: string };
                                    }
                                  )?.integratedAdvancedIntelligence?.systemHealth === 'fair'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                        }`}
                      >
                        {(
                          enterpriseIntelligence as unknown as {
                            integratedAdvancedIntelligence?: { systemHealth?: string };
                          }
                        )?.integratedAdvancedIntelligence?.systemHealth?.toUpperCase() || 'UNKNOWN'}
                      </div>
                      <div className='text-sm text-gray-600'>System Health</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xl font-bold text-purple-600'>
                        {new Date(
                          (
                            enterpriseIntelligence as unknown as {
                              integratedAdvancedIntelligence?: { timestamp?: string };
                            }
                          )?.integratedAdvancedIntelligence?.timestamp || new Date(),
                        ).toLocaleTimeString()}
                      </div>
                      <div className='text-sm text-gray-600'>Analysis Time</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
