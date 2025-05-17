'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import {
  Flame,
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
  Search,
} from 'lucide-react';
import { cuisines } from '@/data/cuisines';
import { getCuisineRecommendations ,
  generateTopSauceRecommendations,
  calculateElementalMatch,
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
import { planetaryData } from '@/data/planets';

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

// Add this helper function near the top of the file, outside any components
const getSafeScore = (score: unknown): number => {
  // Convert to number if needed, default to 0.5 if NaN or undefined
  const numScore = typeof score === 'number' ? score : parseFloat(score);
  return !isNaN(numScore) ? numScore : 0.5;
};

// Add this helper function just before the CuisineRecommender component definition
// Helper function to ensure consistent recipe structure
function buildCompleteRecipe(recipe: any, cuisineName: string): any {
  // Set default values for undefined properties
  const defaultElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };

  // Find the cuisine flavor profile to use its elemental properties as a base
  const cuisineProfile = Object.values(cuisineFlavorProfiles).find(c => 
    c.name?.toLowerCase() === cuisineName?.toLowerCase() ||
    c.id?.toLowerCase() === cuisineName?.toLowerCase()
  );

  // Complete recipe with fallbacks
  return {
    id: recipe.id || `recipe-${Math.random().toString(36).substring(2, 9)}`,
    name: recipe.name || `${cuisineName} Recipe`,
    description: recipe.description || `A traditional recipe from ${cuisineName} cuisine.`,
    cuisine: recipe.cuisine || cuisineName,
    matchPercentage: recipe.matchPercentage || 
      (recipe.matchScore ? Math.round(recipe.matchScore * 100) : 85),
    matchScore: recipe.matchScore || 0.85,
    elementalProperties: recipe.elementalProperties || 
      (cuisineProfile?.elementalAlignment || cuisineProfile?.elementalProperties || defaultElementalProperties),
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || recipe.preparationSteps || recipe.procedure || [],
    cookTime: recipe.cookTime || recipe.cooking_time || recipe.cook_time || "30 minutes",
    prepTime: recipe.prepTime || recipe.preparation_time || recipe.prep_time || "15 minutes",
    servingSize: recipe.servingSize || recipe.servings || recipe.yield || "4 servings",
    difficulty: recipe.difficulty || recipe.skill_level || "Medium",
    dietaryInfo: recipe.dietaryInfo || recipe.dietary_restrictions || [],
    // Add any custom properties from the original recipe
    ...recipe
  };
}

// Add this function before the component export
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
    const weight = recipeDominant.includes(element) ? 1.5 : 1;
    
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
  const isDaytime = alchemicalContext?.isDaytime ?? true;
  const planetaryPositions = alchemicalContext?.planetaryPositions ?? {};
  const state = alchemicalContext?.state ?? {
    astrologicalState: {
      zodiacSign: 'aries',
      lunarPhase: 'new moon',
    },
  };
  const currentZodiac = state.astrologicalState?.zodiacSign;
  const lunarPhase = state.astrologicalState?.lunarPhase;

  // Create a ref to store astrological state
  const astroStateRef = useRef({
    zodiacSign: currentZodiac || 'aries',
    lunarPhase: lunarPhase || 'new moon',
    elementalState: state.astrologicalState?.elementalState || state.elementalState || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }
  });

  // Update the ref when state changes
  useEffect(() => {
    astroStateRef.current = {
      zodiacSign: currentZodiac || 'aries',
      lunarPhase: lunarPhase || 'new moon',
      elementalState: state.astrologicalState?.elementalState || state.elementalState || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      }
    };
  }, [currentZodiac, lunarPhase, state.astrologicalState, state.elementalState]);

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
  const [showAllCuisines, setShowAllCuisines] = useState<boolean>(false);
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] =
    useState<ElementalProperties>(
      alchemicalContext?.state?.astrologicalState?.elementalState ||
        alchemicalContext?.state?.elementalState || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        }
    );
  const [matchingRecipes, setMatchingRecipes] = useState<any[]>([]);
  const [allRecipesData, setAllRecipesData] = useState<Recipe[]>([]);

  // Update current moment elemental profile when astrological state changes
  useEffect(() => {
    // Use type assertion to avoid type errors
    const safeState = state?.astrologicalState || {};
    if (safeState?.elementalState) {
      // Use type assertion to ensure type compatibility
      setCurrentMomentElementalProfile({
        ...safeState.elementalState,
      } as unknown as ElementalProperties);
    } else if (currentZodiac) {
      // If no elemental state but we have zodiac, calculate based on that
      const zodiacElements = calculateElementalProfileFromZodiac(
        currentZodiac as ZodiacSign,
        lunarPhase as LunarPhase
      );
      setCurrentMomentElementalProfile(zodiacElements);
    }
    
    // Generate top sauce recommendations when elemental profile changes
    try {
      const topSauces = generateTopSauceRecommendations(
        safeState?.elementalState || currentMomentElementalProfile,
        6
      );
      setSauceRecommendations(topSauces);
    } catch (error) {
      console.error('Error generating sauce recommendations:', error);
    }
  }, [state.astrologicalState, currentZodiac, lunarPhase]);

  // Update cuisineRecipes whenever matchingRecipes changes
  useEffect(() => {
    setCuisineRecipes(matchingRecipes);
  }, [matchingRecipes]);

  // Load cuisines when component mounts
  useEffect(() => {
    loadCuisines();
  }, [currentMomentElementalProfile, currentZodiac, lunarPhase]);

  // Move the async function outside the useEffect
  async function loadCuisines() {
    try {
      setLoading(true);
      setError(null);
      
      setLoadingStep('Getting astrological state...');
      // Get current astrological state
      const astroState = astroStateRef.current;
      
      // Get elemental profile from user's data
      setLoadingStep('Calculating elemental profile...');
      const userElementalProfile = currentMomentElementalProfile || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25, 
        Air: 0.25
      };
      
      // Generate cuisine recommendations
      setLoadingStep('Generating cuisine recommendations...');
      const recommendations = getCuisineRecommendations(astroState);
      setCuisineRecommendations(recommendations);
      
      // Define loadAllRecipes function in this scope
      const loadAllRecipes = async () => {
        try {
          setLoadingStep('Loading recipe data...');
          const recipes = await getAllRecipes();
          // console.log(`Loaded ${recipes.length} total recipes`);
          
          // Store all recipes for reference
          setAllRecipesData(recipes);
          
          // Set up matching recipes for each recommendation
          setLoadingStep('Matching recipes to cuisines...');
          
          const cuisinesWithRecipes = recommendations.map((cuisine) => {
            // Find matching recipes for this cuisine
            const matchingRecipes = recipes.filter(recipe => 
              recipe.cuisine && recipe.cuisine.toLowerCase() === cuisine.name.toLowerCase()
            );
            
            return {
              ...cuisine,
              recipes: matchingRecipes.length > 0 
                ? matchingRecipes.map(recipe => buildCompleteRecipe(recipe, cuisine.name))
                : []
            };
          });
          
          setCuisineRecommendations(cuisinesWithRecipes);
          setCuisines(cuisinesWithRecipes);
        } catch (error) {
          console.error('Error loading recipes:', error);
          // Continue without recipes if there was an error
        }
      };
      
      // Load recipes for the recommendations
      setLoadingStep('Loading recipes...');
      await loadAllRecipes();
      
      // Final step
      setLoadingStep('Complete!');
      setLoading(false);
    } catch (error) {
      console.error('Error loading cuisines:', error);
      setError(`Failed to load cuisines: ${error.message}`);
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
      if (selectedCuisineData.recipes && selectedCuisineData.recipes.length > 0) {
        setMatchingRecipes(selectedCuisineData.recipes);
      } else {
        // If no recipes are directly attached to the cuisine, try to find matching recipes
        const recipesForCuisine = allRecipesData.filter(recipe => 
          recipe.cuisine && 
          (recipe.cuisine.toLowerCase() === selectedCuisineData.name.toLowerCase() ||
           (selectedCuisineData.regionalVariants && 
            selectedCuisineData.regionalVariants.some(variant => 
              recipe.cuisine.toLowerCase() === variant.toLowerCase()
            ))
          )
        );
        
        if (recipesForCuisine.length > 0) {
          setMatchingRecipes(recipesForCuisine.map(recipe => 
            buildCompleteRecipe(recipe, selectedCuisineData.name)
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
      const timestamp = new Date().toISOString();
      // console.log(`[${timestamp}] ${step} - ${selectedCuisineData.name}: ${details ? JSON.stringify(details) : ''}`);
    }
  };

  const toggleRecipeExpansion = (index: number, event: React.MouseEvent) => {
    // Ensure event doesn't propagate to parent elements
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // Log click to help with debugging
    console.log(`[CuisineRecommender] Toggling recipe at index ${index}, current expanded state:`, expandedRecipes);

    // Create a copy of the expandedRecipes object (not an array)
    const newExpandedRecipes = { ...expandedRecipes };
    
    // Toggle the state for this index
    newExpandedRecipes[index] = !newExpandedRecipes[index];
    
    // Log the new state being set
    console.log(`[CuisineRecommender] Setting new expanded state:`, newExpandedRecipes);
    
    // Update the state with the new object
    setExpandedRecipes(newExpandedRecipes);
    
    // Track the interaction for analytics
    logCuisineAction('toggleRecipe', { index, newState: newExpandedRecipes[index] });
  };

  const toggleSauceExpansion = (index: number) => {
    setExpandedSauces((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSauceCard = (sauceId: string) => {
    setExpandedSauceCards((prev) => ({
      ...prev,
      [sauceId]: !prev[sauceId],
    }));
  };

  // Create a simplified local implementation for generateSauceRecommendations
  function generateSauceRecommendationsForCuisine(cuisineName: string) {
    try {
      const { allSauces } = require('@/data/sauces');
      const { getTimeFactors } = require('@/types/time');
      const timeFactors = getTimeFactors();
      
      // Get the cuisine's elemental profile
      const cuisine = cuisineRecommendations.find(c => 
        c.name.toLowerCase() === cuisineName.toLowerCase()
      );
      
      if (!cuisine || !cuisine.elementalProperties) {
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
      const cuisineElements = cuisine.elementalProperties;
      
      // Get elemental profile from current celestial alignment
      const userElements = currentMomentElementalProfile || {
        Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
      };
      
      // Map sauces with match calculations
      const saucesWithMatches = saucesArray.map(sauce => {
        // Make sure sauce has elemental properties
        const sauceElements = sauce.elementalProperties || {
          Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        };
        
        // Calculate cuisine-sauce elemental match
        const cuisineMatchScore = calculateElementalMatch(sauceElements, cuisineElements);
        
        // Calculate match with current celestial alignment
        const userMatchScore = calculateElementalMatch(sauceElements, userElements);
        
        // Calculate combined match score (weighted toward cuisine match)
        const combinedScore = (cuisineMatchScore * 0.7) + (userMatchScore * 0.3);
        
        // Add flavor profile matching if available
        let flavorMatchScore = 0.7; // default
        
        if (sauce.flavorProfile && cuisine.flavorProfile) {
          // Calculate how well sauce flavors complement cuisine flavors
          const flavorMatch = 0;
          const flavorCount = 0;
          
          // Match key flavors
          const flavors = ['sweet', 'sour', 'salty', 'bitter', 'umami', 'spicy'];
          flavors.forEach(flavor => {
            if (sauce.flavorProfile[flavor] && cuisine.flavorProfile[flavor]) {
              // Calculate complementary match (not exact match)
              const sauceValue = sauce.flavorProfile[flavor];
              const cuisineValue = cuisine.flavorProfile[flavor];
              
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
        
        return {
          ...sauce,
          id: sauce.id || sauce.name?.replace(/\s+/g, '-').toLowerCase(),
          matchPercentage,
          elementalMatchScore: Math.round(cuisineMatchScore * 100),
          userMatchScore: Math.round(userMatchScore * 100),
          flavorMatchScore: Math.round(flavorMatchScore * 100),
          cuisineName // Add cuisine name for reference
        };
      });
      
      // Sort sauces by match percentage and return top matches
      const sortedSauces = saucesWithMatches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5); // Return top 5 sauces
      
      // console.log(`Generated ${sortedSauces.length} sauce recommendations for ${cuisineName}`);
      return sortedSauces;
    } catch (error) {
      console.error('Error generating sauce recommendations:', error);
      return [];
    }
  }

  // Add this function inside the CuisineRecommender component or before it
  function getCuisineRecommendations(astroState) {
    // Start with all cuisines from cuisineFlavorProfiles
    const availableCuisines = Object.values(cuisineFlavorProfiles);
    
    // Create a map of parent cuisines to their regional variants
    const cuisineMap = new Map();
    
    // First pass - identify parent cuisines and standalone cuisines
    availableCuisines.forEach(cuisine => {
      // Skip regional variants for now
      if (!cuisine.parentCuisine) {
        cuisineMap.set(cuisine.id, {
          cuisine: cuisine,
          regionalVariants: []
        });
      }
    });
    
    // Second pass - add regional variants to their parents
    availableCuisines.forEach(cuisine => {
      if (cuisine.parentCuisine && cuisineMap.has(cuisine.parentCuisine)) {
        cuisineMap.get(cuisine.parentCuisine).regionalVariants.push(cuisine);
      }
    });
    
    // Import cuisines from data folder if needed
    try {
      const { cuisinesMap } = require('@/data/cuisines');
      // Add any missing cuisines from the data folder
      Object.values(cuisinesMap).forEach(cuisine => {
        const id = cuisine.id.toLowerCase();
        if (!cuisineMap.has(id)) {
          // Add as a parent cuisine if it doesn't exist
          cuisineMap.set(id, {
            cuisine: {
              id: id,
              name: cuisine.name,
              description: cuisine.description,
              elementalAlignment: cuisine.elementalProperties,
              signatureTechniques: cuisine.cookingTechniques?.map(t => t.name) || [],
              regionalVariants: Object.keys(cuisine.regionalCuisines || {}),
              regionalCuisines: cuisine.regionalCuisines
            },
            regionalVariants: []
          });
        }
      });
    } catch (error) {
      console.warn('Error loading cuisines from data folder:', error);
    }
    
    // Transform cuisines into the format expected by the UI
    const transformedCuisines = [];
    
    // Load planetary influence data for more precise scoring
    const planetsData = {
      Sun: planetaryData.Sun || {},
      Moon: planetaryData.Moon || {},
      Mars: planetaryData.Mars || {},
      Mercury: planetaryData.Mercury || {},
      Jupiter: planetaryData.Jupiter || {}
      // Add more planets as needed
    };
    
    // Current date and season for seasonal matching
    const now = new Date();
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    const currentMonth = now.getMonth();
    const currentSeason = seasons[Math.floor(((currentMonth + 1) % 12) / 3)];
    
    // Try to load time factors if available
    let timeFactors = { day: 1, hour: 0.5 };
    try {
      const { getTimeFactors } = require('@/types/time');
      timeFactors = getTimeFactors() || timeFactors;
    } catch (error) {
      console.warn('Could not load time factors, using defaults');
    }
    
    cuisineMap.forEach(({ cuisine, regionalVariants }, cuisineId) => {
      // Calculate a more comprehensive score based on multiple factors
      let baseScore = 0.5; // Default score
      const scoreFactors = []; // Track individual scoring factors for debugging
      
      // If we have astrological data
      if (astroState && astroState.elementalState) {
        // 1. Elemental Match (15% of score - reduced from 30%)
        const elementalMatch = calculateElementalMatch(
          cuisine.elementalAlignment || cuisine.elementalProperties || {
            Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
          },
          astroState.elementalState
        );
        scoreFactors.push({ factor: 'Elemental Match', value: elementalMatch, weight: 0.15 });
        
        // 2. Zodiac Influence (20% of score - unchanged)
        let zodiacScore = 0.5;
        if (astroState.zodiacSign && cuisine.zodiacInfluences) {
          // Direct match
          if (cuisine.zodiacInfluences.includes(astroState.zodiacSign)) {
            zodiacScore = 0.9;
          } 
          // Element match (check if cuisine zodiac influences have same element as current zodiac)
          else {
            const currentElement = calculateElementalProfileFromZodiac(
              astroState.zodiacSign as ZodiacSign
            );
            
            // Find dominant element of current zodiac
            const dominantElement = Object.entries(currentElement)
              .sort((a, b) => b[1] - a[1])[0][0];
            
            // Check if any of the cuisine's zodiac influences share this element
            const hasElementMatch = (cuisine.zodiacInfluences || []).some(zodiac => {
              const zodiacElement = calculateElementalProfileFromZodiac(
                zodiac as ZodiacSign
              );
              const zodiacDominantElement = Object.entries(zodiacElement)
                .sort((a, b) => b[1] - a[1])[0][0];
              
              return zodiacDominantElement === dominantElement;
            });
            
            if (hasElementMatch) {
              zodiacScore = 0.7;
            }
          }
        }
        scoreFactors.push({ factor: 'Zodiac Influence', value: zodiacScore, weight: 0.20 });
        
        // 3. Lunar Phase Match (15% of score)
        let lunarScore = 0.5;
        if (astroState.lunarPhase && cuisine.lunarPhaseInfluences) {
          if (cuisine.lunarPhaseInfluences.includes(astroState.lunarPhase)) {
            lunarScore = 0.9;
          }
          // Check for similar lunar phase categories (waxing, waning, etc.)
          else if (
            (astroState.lunarPhase.includes('waxing') && cuisine.lunarPhaseInfluences.some(phase => phase.includes('waxing'))) ||
            (astroState.lunarPhase.includes('waning') && cuisine.lunarPhaseInfluences.some(phase => phase.includes('waning'))) ||
            (astroState.lunarPhase.includes('full') && cuisine.lunarPhaseInfluences.includes('full moon')) ||
            (astroState.lunarPhase.includes('new') && cuisine.lunarPhaseInfluences.includes('new moon'))
          ) {
            lunarScore = 0.7;
          }
        }
        scoreFactors.push({ factor: 'Lunar Phase', value: lunarScore, weight: 0.15 });
        
        // 4. Seasonal Match (10% of score)
        let seasonalScore = 0.5;
        if (cuisine.seasonalPreference) {
          if (cuisine.seasonalPreference.includes(currentSeason) || 
              cuisine.seasonalPreference.includes('all')) {
            seasonalScore = 0.9;
          }
        }
        scoreFactors.push({ factor: 'Seasonal Match', value: seasonalScore, weight: 0.10 });
        
        // 5. Planetary Resonance (15% of score)
        let planetaryScore = 0.5;
        
        // Find current planetary day/hour influences
        const currentPlanetaryInfluences = [];
        try {
          const dayOfWeek = now.getDay();
          const hour = now.getHours();
          
          // Simplified planetary day/hour calculations (would be more complex in real app)
          const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
          const planetaryDay = planetaryDays[dayOfWeek];
          currentPlanetaryInfluences.push(planetaryDay);
          
          // Could add hour rulers for more precision
        } catch (error) {
          console.warn('Error calculating planetary influences:', error);
        }
        
        // Check if cuisine has resonance with any current planetary influences
        if (cuisine.planetaryResonance) {
          const matches = currentPlanetaryInfluences.filter(planet => 
            cuisine.planetaryResonance.includes(planet)
          );
          
          if (matches.length > 0) {
            planetaryScore = 0.5 + (matches.length * 0.2);
            // Cap at 0.9
            planetaryScore = Math.min(0.9, planetaryScore);
          }
        }
        scoreFactors.push({ factor: 'Planetary Resonance', value: planetaryScore, weight: 0.15 });
        
        // 6. Flavor Affinities (25% of score - increased from 10%)
        let flavorScore = 0.6; // Base score
        
        // This would normally be more sophisticated
        if (cuisine.flavorProfiles) {
          // Enhanced flavor matching logic
          flavorScore = 0.6;
          
          try {
            // Check if cuisine has flavor profiles that might match current preferences
            // This could be based on time of day, season, or user profile
            if (cuisine.flavorProfiles.spicy && isDaytime) {
              // During day, spicy foods score higher
              flavorScore += cuisine.flavorProfiles.spicy * 0.1;
            }
            
            if (cuisine.flavorProfiles.umami) {
              // Umami is generally valued
              flavorScore += cuisine.flavorProfiles.umami * 0.2;
            }
            
            // Seasonal preferences
            if (currentSeason === 'summer' && cuisine.flavorProfiles.sweet) {
              flavorScore += cuisine.flavorProfiles.sweet * 0.1;
            } else if (currentSeason === 'winter' && cuisine.flavorProfiles.bitter) {
              flavorScore += cuisine.flavorProfiles.bitter * 0.1;
            }
            
            // Cap at 0.95
            flavorScore = Math.min(0.95, flavorScore);
          } catch (error) {
            console.warn('Error in flavor matching:', error);
            // Fallback to simpler calculation
            flavorScore = 0.6 + (Math.random() * 0.3);
          }
        }
        scoreFactors.push({ factor: 'Flavor Profile', value: flavorScore, weight: 0.25 });
        
        // Calculate weighted average of all scores
        baseScore = scoreFactors.reduce((acc, factor) => {
          return acc + (factor.value * factor.weight);
        }, 0);
        
        // Apply some randomization (±5%) to break ties and clusters
        const randomFactor = 1 + ((Math.random() * 0.1) - 0.05);
        baseScore = baseScore * randomFactor;
        
        // Ensure score is within 0-1 range with more precision
        baseScore = Math.min(0.95, Math.max(0.5, baseScore));
      } else {
        // Add some randomness if no astrological data
        baseScore = 0.5 + Math.random() * 0.3;
      }
      
      // Create the main cuisine object with enhanced score
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
        score: baseScore,
        rawScore: baseScore,
        matchPercentage: Math.round(baseScore * 1000) / 10, // Show one decimal place precision
        compatibilityScore: baseScore,
        recipes: [],
        scoreFactors: scoreFactors, // Store individual factors for debugging
        // Add additional cuisine data if available
        signatureDishes: cuisine.signatureTechniques || cuisine.signatureDishes || [],
        commonIngredients: cuisine.signatureIngredients || cuisine.primaryIngredients || [],
        cookingTechniques: cuisine.signatureTechniques || cuisine.commonCookingMethods || [],
        // If we have regional variants, include them
        regionalVariants: regionalVariants.map(variant => variant.name)
      };
      
      transformedCuisines.push(mainCuisine);
      
      // Add regional variants with slightly lower scores
      regionalVariants.forEach(variant => {
        // Skip adding Cantonese and Sichuanese as separate cards
        // We'll keep them in Chinese cuisine's regionalVariants
        if (variant.id === 'cantonese' || variant.id === 'sichuanese') {
          return;
        }
        
        // Regional variants get a modified score based on parent
        let variantScore = baseScore * 0.95;
        
        // Recalculate for zodiac and lunar matches specific to the variant
        if (astroState?.zodiacSign && variant.zodiacInfluences?.includes(astroState.zodiacSign)) {
          variantScore += 0.08;
        }
        
        if (astroState?.lunarPhase && variant.lunarPhaseInfluences?.includes(astroState.lunarPhase)) {
          variantScore += 0.05;
        }
        
        // Apply small random factor to further differentiate similar variants
        variantScore = variantScore * (1 + ((Math.random() * 0.06) - 0.03));
        
        // Ensure score is within bounds with precision
        variantScore = Math.min(0.95, Math.max(0.5, variantScore));
        
        transformedCuisines.push({
          id: variant.id || variant.name?.toLowerCase().replace(/\s+/g, '-') || `cuisine-${Math.random()}`,
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
          score: variantScore,
          rawScore: variantScore,
          matchPercentage: Math.round(variantScore * 1000) / 10, // Show one decimal place precision
          compatibilityScore: variantScore,
          recipes: [],
          signatureDishes: variant.signatureTechniques || variant.signatureDishes || [],
          commonIngredients: variant.signatureIngredients || variant.primaryIngredients || [],
          cookingTechniques: variant.signatureTechniques || variant.commonCookingMethods || [],
          parentCuisine: cuisine.name
        });
      });
    });

    // Sort cuisines by score - we'll apply the slice in the render function now
    return transformedCuisines
      .sort((a, b) => b.score - a.score);
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

      {/* Group cuisine cards in a better grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {cuisineRecommendations
          .slice(0, showAllCuisines ? undefined : 6) // Show only top 6 cuisines by default
          .map((cuisine) => {
            // Display formatted match percentage
            const matchPercentage = typeof cuisine.matchPercentage === 'number' 
              ? cuisine.matchPercentage 
              : (cuisine.compatibilityScore 
                  ? Math.round(cuisine.compatibilityScore * 1000) / 10 
                  : 50);

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
                    {cuisine.regionalVariants && cuisine.regionalVariants.length > 0 && (
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
                {cuisine.signatureDishes && cuisine.signatureDishes.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs font-medium text-gray-500 block">Signature dishes:</span>
                    <span className="text-xs text-gray-600">
                      {cuisine.signatureDishes.slice(0, 3).join(", ")}
                      {cuisine.signatureDishes.length > 3 ? "..." : ""}
                    </span>
                  </div>
                )}

                {/* Show astrological influences if available */}
                {cuisine.zodiacInfluences && cuisine.zodiacInfluences.length > 0 && (
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

      {/* Show more/less button */}
      {cuisineRecommendations.length > 6 && (
        <div className="mb-4">
          <button
            onClick={() => setShowAllCuisines(!showAllCuisines)}
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center justify-center w-full py-2 border border-gray-200 rounded bg-white hover:bg-blue-50 transition-colors"
          >
            {showAllCuisines ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Show Top 6 Cuisines
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Show All {cuisineRecommendations.length} Cuisines
              </>
            )}
          </button>
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
              {selectedCuisineData.zodiacInfluences && selectedCuisineData.zodiacInfluences.length > 0 ? (
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">Zodiac:</span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedCuisineData.zodiacInfluences.map(sign => (
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
                <div className="text-sm text-gray-500">No specific zodiac influences</div>
              )}
              
              {selectedCuisineData.lunarPhaseInfluences && selectedCuisineData.lunarPhaseInfluences.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-500 block mb-1">Lunar phase:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCuisineData.lunarPhaseInfluences.map(phase => (
                      <span 
                        key={phase} 
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs
                          ${lunarPhase === phase ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {phase}
                        {lunarPhase === phase && <span className="ml-1">✓</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Regional variants if any */}
          {selectedCuisineData.regionalVariants && selectedCuisineData.regionalVariants.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Regional Variants</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCuisineData.regionalVariants.map(variant => {
                  // For Chinese cuisine, check if we need to add Chinese regional cuisines 
                  // from data directory that might not be in the FlavorProfiles
                  let variantName = variant;
                  let variantData = null;
                  
                  // Special handling for Chinese cuisine to ensure regional variants are displayed
                  if (selectedCuisineData.name === 'Chinese' && 
                      selectedCuisineData.id.toLowerCase() === 'chinese') {
                    try {
                      const { cuisinesMap } = require('@/data/cuisines');
                      const chineseCuisine = cuisinesMap.Chinese || {};
                      
                      // Get regional cuisines from the data folder
                      if (chineseCuisine.regionalCuisines && 
                          Object.keys(chineseCuisine.regionalCuisines).length > 0) {
                        
                        // Find the variant in the regionalCuisines
                        const variantKey = Object.keys(chineseCuisine.regionalCuisines)
                          .find(key => key.toLowerCase() === variant.toLowerCase() || 
                                      chineseCuisine.regionalCuisines[key].name === variant);
                        
                        if (variantKey && chineseCuisine.regionalCuisines[variantKey]) {
                          variantData = chineseCuisine.regionalCuisines[variantKey];
                          variantName = variantData.name || variant;
                        }
                      }
                    } catch (error) {
                      console.warn("Error loading Chinese regional cuisines:", error);
                    }
                  }
                  
                  return (
                    <span 
                      key={variant} 
                      className="inline-flex items-center px-2 py-1 rounded text-sm bg-gray-100 text-gray-800"
                      title={variantData?.description || ""}
                    >
                      {variantName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signature dishes if available */}
          {selectedCuisineData.signatureDishes && selectedCuisineData.signatureDishes.length > 0 && (
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
                ))}
              </div>
            </div>
          )}

          {/* Recipe Recommendations - Shown after cuisine info */}
          {cuisineRecipes && cuisineRecipes.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">
                Recipes ({cuisineRecipes.length} available)
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

                          {recipe.ingredients && recipe.ingredients.length > 0 && (
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
                                <span>{recipe.difficulty}</span>
                              </div>
                            )}
                          </div>

                          {recipe.dietaryInfo && recipe.dietaryInfo.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo.map((diet, i) => (
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

              {cuisineRecipes.length > 6 && (
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
                      Show All Recipes ({cuisineRecipes.length})
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
                    {selectedCuisineData?.signatureDishes && selectedCuisineData.signatureDishes.length > 0 
                      ? ` like ${selectedCuisineData.signatureDishes.slice(0, 3).join(", ")}, and more.`
                      : ' using ingredients typical to this cuisine.'}
                  </p>
                  
                  {selectedCuisineData?.commonIngredients && selectedCuisineData.commonIngredients.length > 0 && (
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

      {/* Global Sauce Recommender Section - now always shown regardless of cuisine selection */}
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
            {(sauceRecommendations.length > 0 ? sauceRecommendations : generateTopSauceRecommendations(currentMomentElementalProfile, 6)).map((sauce, index) => (
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
                {sauce.ingredients && sauce.ingredients.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sauce.ingredients.slice(0, 3).map((ingredient, i) => (
                      <span key={i} className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-100">
                        {ingredient}
                      </span>
                    ))}
                    {sauce.ingredients.length > 3 && (
                      <span className="text-xs text-gray-500">+{sauce.ingredients.length - 3} more</span>
                    )}
                  </div>
                )}
                
                {/* Expanded sauce details */}
                {expandedSauceCards[`${sauce.id || sauce.name}-${index}`] && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    {/* Main culinary information */}
                    <div className="mb-3">
                      <h6 className="font-medium text-sm mb-2 text-amber-800 pb-1 border-b border-amber-100">Culinary Profile</h6>
                      
                      {/* Base & Cuisine */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                        {sauce.base && (
                          <div>
                            <span className="font-medium text-gray-700">Base:</span>{" "}
                            <span className="text-gray-600">{sauce.base}</span>
                          </div>
                        )}
                        {sauce.cuisine && (
                          <div>
                            <span className="font-medium text-gray-700">Cuisine:</span>{" "}
                            <span className="text-gray-600">{sauce.cuisine}</span>
                          </div>
                        )}
                        {sauce.difficulty && (
                          <div>
                            <span className="font-medium text-gray-700">Difficulty:</span>{" "}
                            <span className="text-gray-600">{sauce.difficulty}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Timing Information */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                        {sauce.prepTime && (
                          <div>
                            <span className="font-medium text-gray-700">Prep:</span>{" "}
                            <span className="text-gray-600">{sauce.prepTime}</span>
                          </div>
                        )}
                        {sauce.cookTime && (
                          <div>
                            <span className="font-medium text-gray-700">Cook:</span>{" "}
                            <span className="text-gray-600">{sauce.cookTime}</span>
                          </div>
                        )}
                        {sauce.yield && (
                          <div>
                            <span className="font-medium text-gray-700">Yield:</span>{" "}
                            <span className="text-gray-600">{sauce.yield}</span>
                          </div>
                        )}
                      </div>

                      {/* Culinary Uses */}
                      {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
                        <div className="mb-2">
                          <h6 className="font-medium text-gray-700 mb-1">Perfect For:</h6>
                          <div className="flex flex-wrap gap-1">
                            {sauce.culinaryUses.map((use, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Complete Ingredients List */}
                    {(sauce.ingredients || sauce.keyIngredients) && (
                      <div className="mb-3 bg-gray-50 p-2 rounded border border-gray-100">
                        <h6 className="font-medium mb-1.5 text-gray-800">Ingredients:</h6>
                        <ul className="pl-1 space-y-1">
                          {(sauce.ingredients || sauce.keyIngredients).map((ingredient, idx) => (
                            <li key={idx} className="flex items-start text-gray-700">
                              <span className="inline-block w-1 h-1 rounded-full bg-amber-500 mt-1.5 mr-1.5"></span>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/* Ingredient Substitutions */}
                        <div className="mt-2 pt-1 border-t border-gray-200">
                          <h6 className="font-medium mb-1 text-gray-700">Common Substitutions:</h6>
                          <ul className="pl-1">
                            {sauce.base === "tomato" && (
                              <li className="text-xs text-gray-600 flex items-start">
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-1.5"></span>
                                <span>Fresh tomatoes: Use 3-4 lbs fresh tomatoes, peeled and deseeded, for 2 lbs canned</span>
                              </li>
                            )}
                            {sauce.keyIngredients?.includes("pine nuts") && (
                              <li className="text-xs text-gray-600 flex items-start">
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-1.5"></span>
                                <span>Pine nuts: Substitute with walnuts, almonds, or sunflower seeds</span>
                              </li>
                            )}
                            {sauce.keyIngredients?.includes("guanciale") && (
                              <li className="text-xs text-gray-600 flex items-start">
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-1.5"></span>
                                <span>Guanciale: Substitute with pancetta or bacon (less authentic but workable)</span>
                              </li>
                            )}
                            {sauce.keyIngredients?.includes("Pecorino Romano") && (
                              <li className="text-xs text-gray-600 flex items-start">
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-1.5"></span>
                                <span>Pecorino Romano: Use Parmigiano-Reggiano for milder flavor</span>
                              </li>
                            )}
                            {sauce.keyIngredients?.some(ing => ing.includes("wine")) && (
                              <li className="text-xs text-gray-600 flex items-start">
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-1.5"></span>
                                <span>Wine: Use stock with a splash of vinegar for alcohol-free version</span>
                              </li>
                            )}
                            <li className="text-xs text-gray-600 flex items-start">
                              <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-1.5"></span>
                              <span>Herbs: Fresh and dried can be swapped (1 tbsp fresh = 1 tsp dried)</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {/* Preparation Steps */}
                    {sauce.preparationSteps && sauce.preparationSteps.length > 0 && (
                      <div className="mb-3">
                        <h6 className="font-medium mb-1.5 text-gray-800">Preparation:</h6>
                        <ol className="pl-5 list-decimal space-y-1.5">
                          {sauce.preparationSteps.map((step, idx) => (
                            <li key={idx} className="text-gray-700">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Chef Notes and Technical Tips - Combined for better culinary focus */}
                    {(sauce.preparationNotes || sauce.technicalTips) && (
                      <div className="mb-3 bg-amber-50 p-2 rounded border border-amber-100">
                        <h6 className="font-medium mb-1 text-amber-800">Chef's Tips:</h6>
                        {sauce.preparationNotes && (
                          <p className="text-gray-700 mb-1.5">{sauce.preparationNotes}</p>
                        )}
                        {sauce.technicalTips && (
                          <p className="text-gray-700">{sauce.technicalTips}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Storage Instructions */}
                    {sauce.storageInstructions && (
                      <div className="mb-3 bg-blue-50 p-2 rounded border border-blue-100">
                        <h6 className="font-medium mb-1 text-blue-800">Storage & Shelf Life:</h6>
                        <p className="text-gray-700">{sauce.storageInstructions}</p>
                      </div>
                    )}
                    
                    {/* Sauce Variants */}
                    {sauce.variants && sauce.variants.length > 0 && (
                      <div className="mb-3">
                        <h6 className="font-medium mb-1 text-gray-800">Popular Variations:</h6>
                        <div className="flex flex-wrap gap-1">
                          {sauce.variants.map((variant, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 text-xs">
                              {variant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Seasonal Information - Kept because it's relevant to cooking */}
                    {sauce.seasonality && (
                      <div className="mb-2">
                        <h6 className="font-medium inline-block mr-1 text-gray-700">Best Season:</h6>
                        <span className="text-gray-600">{sauce.seasonality}</span>
                      </div>
                    )}
                    
                    {/* Move Astrological influences to bottom with less prominence */}
                    {sauce.astrologicalInfluences && sauce.astrologicalInfluences.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-100 text-gray-500">
                        <h6 className="text-xs font-medium mb-0.5 text-gray-500">Astrological Harmony:</h6>
                        <div className="flex flex-wrap gap-1">
                          {sauce.astrologicalInfluences.map((influence, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">
                              {influence}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
