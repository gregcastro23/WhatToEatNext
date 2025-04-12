'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { Flame, Droplets, Mountain, Wind, GalleryVertical, Sparkles, ArrowLeft, Moon, SunIcon, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cuisines } from '@/data/cuisines';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalProperty } from '@/constants/planetaryElements';
import styles from './CuisineRecommender.module.css';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { transformCuisines, sortByAlchemicalCompatibility } from '@/utils/alchemicalTransformationUtils';
import { ZodiacSign, LunarPhase, LunarPhaseWithSpaces } from '@/types/alchemy';
import { cuisineFlavorProfiles, getRecipesForCuisineMatch } from '@/data/cuisineFlavorProfiles';
import { allRecipes } from '@/data/recipes';
import { SpoonacularService } from '@/services/SpoonacularService';
import { LocalRecipeService } from '@/services/LocalRecipeService';
import { ElementalProperties } from '@/types/alchemy';
import { sauceRecommendations, SauceRecommendation } from '@/data/sauces';

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

export default function CuisineRecommender() {
  // Provide fallback values in case AlchemicalContext is not available
  const alchemicalContext = useAlchemical();
  const isDaytime = alchemicalContext?.isDaytime ?? true;
  const planetaryPositions = alchemicalContext?.planetaryPositions ?? {};
  const state = alchemicalContext?.state ?? {
    astrologicalState: {
      zodiacSign: 'aries',
      lunarPhase: 'new moon'
    }
  };
  const currentZodiac = state.astrologicalState?.zodiacSign;
  const lunarPhase = state.astrologicalState?.lunarPhase;
  
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cuisinesList, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [cuisineRecipes, setCuisineRecipes] = useState<any[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<any[]>([]);
  const [showAllRecipes, setShowAllRecipes] = useState<boolean>(false);
  const [showAllSauces, setShowAllSauces] = useState<boolean>(false);
  const [expandedRecipes, setExpandedRecipes] = useState<{[key: number]: boolean}>({});
  const [expandedSauces, setExpandedSauces] = useState<{[key: number]: boolean}>({});
  
  // Get elemental profile from current astrological state instead of using placeholder values
  const [userElementalProfile, setUserElementalProfile] = useState<ElementalProperties>(
    ((state as any).elementalState as ElementalProperties) || {
      Fire: 0.3, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.2
    }
  );
  const [matchingRecipes, setMatchingRecipes] = useState<any[]>([]);

  // Update user elemental profile when astrological state changes
  useEffect(() => {
    // Use type assertion to avoid type errors
    const safeState = state as any;
    if (safeState.elementalState) {
      // Use type assertion to ensure type compatibility
      setUserElementalProfile({...safeState.elementalState} as unknown as ElementalProperties);
    } else if (currentZodiac) {
      // If no elemental state but we have zodiac, calculate based on that
      const zodiacElements = calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign, lunarPhase as LunarPhase);
      setUserElementalProfile(zodiacElements);
    }
  }, [state, currentZodiac, lunarPhase]);

  // Update cuisineRecipes whenever matchingRecipes changes
  useEffect(() => {
    setCuisineRecipes(matchingRecipes);
  }, [matchingRecipes]);

  // Calculate elemental profile from zodiac and lunar phase
  const calculateElementalProfileFromZodiac = (zodiacSign: ZodiacSign, lunarPhase?: LunarPhase): ElementalProperties => {
    // Get zodiac element
    const zodiacElementMap: Record<string, keyof ElementalProperties> = {
      aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
      taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
      gemini: 'Air', libra: 'Air', aquarius: 'Air',
      cancer: 'Water', scorpio: 'Water', pisces: 'Water'
    };
    
    const primaryElement = zodiacElementMap[zodiacSign];
    
    // Start with base values
    const elementalProfile: ElementalProperties = {
      Fire: 0.15,
      Water: 0.15,
      Earth: 0.15,
      Air: 0.15
    };
    
    // Boost primary element from zodiac
    elementalProfile[primaryElement] = 0.6;
    
    // Add lunar phase influence if available
    if (lunarPhase) {
      const lunarElementMap: Record<string, keyof ElementalProperties> = {
        'new moon': 'Fire',
        'waxing crescent': 'Fire',
        'first quarter': 'Air',
        'waxing gibbous': 'Air',
        'full moon': 'Water',
        'waning gibbous': 'Water',
        'last quarter': 'Earth',
        'waning crescent': 'Earth'
      };
      
      const lunarElement = lunarElementMap[lunarPhase];
      
      if (lunarElement) {
        // Increase the lunar element (avoid exceeding 1.0 total)
        elementalProfile[lunarElement] += 0.2;
      }
    }
    
    // Add planetary influences
    if (Object.keys(planetaryPositions).length > 0) {
      const elementalContributions = calculateElementalContributionsFromPlanets(planetaryPositions);
      
      // Apply planetary contributions (with less weight than zodiac and lunar)
      for (const element of Object.keys(elementalProfile) as Array<keyof ElementalProperties>) {
        if (elementalContributions[element]) {
          elementalProfile[element] += elementalContributions[element] * 0.1;
        }
      }
    }
    
    // Normalize to ensure sum is approximately 1.0
    const sum = Object.values(elementalProfile).reduce((acc, val) => acc + val, 0);
    if (sum > 0) {
      for (const element of Object.keys(elementalProfile) as Array<keyof ElementalProperties>) {
        elementalProfile[element] = elementalProfile[element] / sum;
      }
    }
    
    return elementalProfile;
  };
  
  // Calculate elemental contributions from planetary positions
  const calculateElementalContributionsFromPlanets = (positions: Record<string, any>): ElementalProperties => {
    const contributions: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    // Planet to element mapping
    const planetElementMap: Record<string, keyof ElementalProperties> = {
      'Sun': 'Fire',
      'Moon': 'Water',
      'Mercury': 'Air',
      'Venus': 'Earth',
      'Mars': 'Fire',
      'Jupiter': 'Air',
      'Saturn': 'Earth',
      'Uranus': 'Air',
      'Neptune': 'Water',
      'Pluto': 'Water'
    };
    
    // Calculate contributions based on planet positions
    for (const [planet, position] of Object.entries(positions)) {
      const element = planetElementMap[planet];
      if (element) {
        // Weight by planet importance (Sun and Moon have higher influence)
        const weight = (planet === 'Sun' || planet === 'Moon') ? 0.3 : 0.1;
        contributions[element] += weight;
      }
    }
    
    return contributions;
  };

  const cssStyles = styles as unknown as CuisineStyles;

  /**
   * Calculate elemental match score between two elemental property sets
   * This computes how well the recipe's elements align with the user's preferred elements
   */
  const calculateElementalMatch = (
    recipeElements: ElementalProperties,
    userElements: ElementalProperties
  ): number => {
    // Get the element names (Fire, Water, Earth, Air)
    const elements = Object.keys(recipeElements);
    
    // Calculate cosine similarity between the two elemental vectors
    let dotProduct = 0;
    let recipeNorm = 0;
    let userNorm = 0;
    
    for (const element of elements) {
      const recipeValue = recipeElements[element as keyof ElementalProperties] || 0;
      const userValue = userElements[element as keyof ElementalProperties] || 0;
      
      dotProduct += recipeValue * userValue;
      recipeNorm += recipeValue * recipeValue;
      userNorm += userValue * userValue;
    }
    
    recipeNorm = Math.sqrt(recipeNorm);
    userNorm = Math.sqrt(userNorm);
    
    // Avoid division by zero
    if (recipeNorm === 0 || userNorm === 0) {
      return 0.5; // Neutral match if either has no elemental values
    }
    
    // Calculate cosine similarity (0-1 range)
    const similarity = dotProduct / (recipeNorm * userNorm);
    
    // Scale the similarity to a score between 0.5 and 1.0
    // This ensures even recipes with poor matches aren't completely excluded
    return 0.5 + (similarity * 0.5);
  };

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        setLoading(true);
        
        // Only use main cuisines from the cuisines index, not regional variants
        const loadedCuisines: Cuisine[] = Object.entries(cuisines).map(([id, cuisine]) => {
          // Skip regional variants
          if (cuisineFlavorProfiles[id]?.parentCuisine) {
            return null;
          }
          
          // Extract zodiac influences from astrological profile if available and convert to lowercase
          const zodiacInfluences = cuisine.astrologicalProfile?.favorableZodiac?.map(sign => 
            sign.toLowerCase() as ZodiacSign
          ) || [];
          
          // Extract lunar phase influences - if not available, assign based on dominant element
          // Water-dominant cuisines tend to align with full and waning moon phases
          // Fire-dominant cuisines tend to align with new and waxing moon phases
          let lunarPhaseInfluences: LunarPhase[] = [];
          if (lunarPhaseInfluences.length === 0 && cuisine.elementalAlignment) {
            const dominantElement = Object.entries(cuisine.elementalAlignment)
              .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
              
            if (dominantElement === 'Water') {
              lunarPhaseInfluences = ['full moon', 'waning gibbous'];
            } else if (dominantElement === 'Fire') {
              lunarPhaseInfluences = ['new moon', 'waxing crescent'];
            } else if (dominantElement === 'Earth') {
              lunarPhaseInfluences = ['last quarter', 'waning crescent'];
            } else if (dominantElement === 'Air') {
              lunarPhaseInfluences = ['first quarter', 'waxing gibbous'];
            }
          }
          
          return {
            id,
            name: cuisine.name || id.charAt(0).toUpperCase() + id.slice(1),
            description: cuisine.description || 'A unique culinary tradition',
            elementalProperties: cuisine.elementalAlignment || {
              Fire: Math.random() * 0.3 + 0.1,  // Random value between 0.1 and 0.4
              Water: Math.random() * 0.3 + 0.1,
              Earth: Math.random() * 0.3 + 0.1,
              Air: Math.random() * 0.3 + 0.1
            },
            astrologicalInfluences: cuisine.astrologicalProfile?.rulingPlanets || [],
            zodiacInfluences,
            lunarPhaseInfluences
          };
        }).filter(Boolean) as Cuisine[]; // Filter out null values (regional variants)
        
        setCuisines(loadedCuisines);
        
        // Prepare transformed cuisines for display using our alchemical transformation system
        const elementalItems: ElementalItem[] = loadedCuisines.map(cuisine => ({
          id: cuisine.id,
          name: cuisine.name,
          elementalProperties: cuisine.elementalProperties,
          zodiacInfluences: cuisine.zodiacInfluences,
          lunarPhaseInfluences: cuisine.lunarPhaseInfluences
        }));
        
        // Check if we have enough planetary data to transform
        // If no planetary data available, provide basic transformations
        let transformed;
        if (Object.keys(planetaryPositions).length > 0) {
          // Convert the complex planetaryPositions to the simpler format required by transformCuisines
          const simplifiedPlanetaryPositions: Record<string, number> = {};
          
          // Extract the degree or exactLongitude as the simplified position value
          Object.entries(planetaryPositions).forEach(([planet, position]) => {
            simplifiedPlanetaryPositions[planet] = position.exactLongitude || position.degree || 0;
          });
          
          // Transform cuisines if we have planetary positions
          transformed = transformCuisines(
            elementalItems,
            simplifiedPlanetaryPositions,
            isDaytime,
            currentZodiac,
            lunarPhase as LunarPhaseWithSpaces
          );
          
          // Apply score adjustments based on real astrological factors
          transformed = transformed.map(cuisine => {
            // Start with the baseline calculated score
            let enhancedScore = cuisine.gregsEnergy;
            
            // Boost cuisines that match current zodiac sign
            const zodiacBoost = cuisine.zodiacInfluences?.includes(currentZodiac as ZodiacSign) ? 0.15 : 0;
            
            // Boost cuisines that match current lunar phase
            const lunarBoost = cuisine.lunarPhaseInfluences?.includes(lunarPhase as LunarPhase) ? 0.12 : 0;
            
            // Calculate planetary influence boost based on matching influential planets
            const planetaryBoost = cuisine.dominantPlanets?.length 
              ? Math.min(0.18, cuisine.dominantPlanets.length * 0.06) 
              : 0;
            
            // Calculate elemental match with user profile
            const elementalBoost = calculateElementalMatch(
              cuisine.elementalProperties,
              userElementalProfile
            ) * 0.2; // Weight the elemental match appropriately
            
            // Apply boosts to the score, but don't exceed 0.98
            enhancedScore = Math.min(0.98, enhancedScore + zodiacBoost + lunarBoost + planetaryBoost + elementalBoost);
            
            // Allow for more diverse scores, no minimum
            return {
              ...cuisine,
              gregsEnergy: enhancedScore
            };
          });
        } else {
          // When no planetary data is available, calculate scores based on elemental match
          transformed = elementalItems.map(item => {
            // Calculate baseline elemental match with user profile
            const elementalMatch = calculateElementalMatch(
              item.elementalProperties, 
              userElementalProfile
            );
            
            // Add some variation based on zodiac and lunar matches
            const zodiacBoost = item.zodiacInfluences?.includes(currentZodiac as ZodiacSign) ? 0.2 : 0;
            const lunarBoost = item.lunarPhaseInfluences?.includes(lunarPhase as LunarPhase) ? 0.15 : 0;
            
            // Calculate final score with more variation (range approximately 0.3-0.95)
            const finalScore = 0.3 + (elementalMatch * 0.4) + zodiacBoost + lunarBoost;
            
            return {
              ...item,
              dominantElement: calculateDominantElement(item.elementalProperties),
              gregsEnergy: finalScore,
              transformedElementalProperties: item.elementalProperties,
              dominantPlanets: [],
              planetaryDignities: {}
            };
          });
        }
        
        setTransformedCuisines(transformed);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cuisines');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCuisines();
  }, [planetaryPositions, isDaytime, currentZodiac, lunarPhase]);

  // Calculate dominant element from elemental properties
  const calculateDominantElement = (elementalProps: Record<string, number>) => {
    return Object.entries(elementalProps)
      .sort(([, a], [, b]) => b - a)[0][0];
  };

  // Get styling class based on match score
  const getMatchScoreClass = (score: number): string => {
    if (score >= 0.96) return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
    if (score >= 0.90) return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
    if (score >= 0.85) return 'bg-green-200 text-green-800 font-semibold';
    if (score >= 0.80) return 'bg-green-100 text-green-700 font-medium';
    if (score >= 0.75) return 'bg-green-50 text-green-600';
    if (score >= 0.70) return 'bg-yellow-100 text-yellow-700';
    if (score >= 0.65) return 'bg-yellow-50 text-yellow-700';
    if (score >= 0.55) return 'bg-orange-100 text-orange-700';
    if (score >= 0.45) return 'bg-orange-50 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Function to render a more visually appealing score badge
  const renderScoreBadge = (score: number) => {
    const formattedScore = Math.round(score * 100);
    let stars = '';
    let tooltipText = '';
    
    if (score >= 0.96) {
      stars = '★★★';
      tooltipText = 'Perfect match for your elemental profile';
    } else if (score >= 0.90) {
      stars = '★★';
      tooltipText = 'Excellent match for your elemental profile';
    } else if (score >= 0.85) {
      stars = '★';
      tooltipText = 'Very good match for your elemental profile';
    } else if (score >= 0.75) {
      tooltipText = 'Good match for your elemental profile';
    } else if (score >= 0.60) {
      tooltipText = 'Average match for your elemental profile';
    } else {
      tooltipText = 'Basic match for your elemental profile';
    }
    
    // Determine enhanced styles based on score
    let enhancedStyle = "";
    if (score >= 0.96) {
      enhancedStyle = "font-bold animate-pulse bg-gradient-to-r from-green-600 to-emerald-500 text-white";
    } else if (score >= 0.90) {
      enhancedStyle = "font-bold bg-green-600 text-white";
    } else if (score >= 0.85) {
      enhancedStyle = "font-semibold bg-green-500 text-white";
    } else if (score >= 0.75) {
      enhancedStyle = "bg-green-100 text-green-800";
    } else if (score >= 0.60) {
      enhancedStyle = "bg-yellow-100 text-yellow-800";
    } else {
      enhancedStyle = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span 
        className={`text-xs font-medium px-2 py-1 rounded-full ${enhancedStyle} flex items-center transition-all duration-300 hover:scale-105`}
        title={tooltipText}
      >
        <span>{formattedScore}%</span>
        {stars && <span className="ml-1">{stars}</span>}
      </span>
    );
  };

  // Function to render compatibility badge with appropriate styling
  const renderCompatibilityBadge = (score: number) => {
    // Use actual score without randomization for more consistent results
    // Add a slight multiplier to make differences more apparent visually
    const adjustedScore = Math.min(1, score * 1.08);
    const formattedScore = Math.round(adjustedScore * 100);
    
    // Enhanced gradient styles for compatibility bar
    const gradientStyle = adjustedScore >= 0.96 
      ? 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 animate-gradient' 
      : adjustedScore >= 0.90 
        ? 'bg-gradient-to-r from-green-600 to-green-400' 
        : adjustedScore >= 0.85 
          ? 'bg-green-500' 
          : adjustedScore >= 0.80 
            ? 'bg-green-400' 
            : adjustedScore >= 0.75 
              ? 'bg-yellow-500' 
              : adjustedScore >= 0.70 
                ? 'bg-yellow-400' 
                : adjustedScore >= 0.65 
                  ? 'bg-yellow-300' 
                  : adjustedScore >= 0.55
                    ? 'bg-orange-400'
                    : 'bg-gray-400';
    
    return (
      <div className="mb-2 flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-3 mr-2 overflow-hidden">
          <div 
            className={`${gradientStyle} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${formattedScore}%` }}
          ></div>
        </div>
        {renderScoreBadge(adjustedScore)}
      </div>
    );
  };

  // Sort and filter cuisines
  const displayedCuisines = useMemo(() => {
    if (transformedCuisines.length === 0) return [];
    
    // Sort by alchemical compatibility
    let sorted = sortByAlchemicalCompatibility(transformedCuisines);
    
    // No additional filtering - the sorting already accounts for zodiac, lunar and elemental alignments
    return sorted;
  }, [transformedCuisines]);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-4 h-4 text-red-400" />;
      case 'Water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'Earth': return <Mountain className="w-4 h-4 text-green-400" />;
      case 'Air': return <Wind className="w-4 h-4 text-purple-400" />;
      default: return null;
    }
  };
  
  const getAlchemicalPropertyIcon = (property: AlchemicalProperty) => {
    return <Sparkles className="w-4 h-4 text-yellow-400" />;
  };
  
  const getLunarPhaseIcon = (phase: LunarPhase) => {
    return <Moon className="w-4 h-4 text-slate-400" />;
  };

  // Get card color class based on elemental composition
  const getCardColorClass = (elementalProperties: ElementalProperties) => {
    if (!elementalProperties) return '';
    
    // Find the dominant element (the one with highest value)
    const dominantElement = Object.entries(elementalProperties)
      .sort(([, a], [, b]) => b - a)[0][0];
    
    // Calculate the sum to get proportions
    const sum = Object.values(elementalProperties).reduce((acc, val) => acc + val, 0);
    
    // Check if any element is significantly dominant (over 40%)
    for (const [element, value] of Object.entries(elementalProperties)) {
      const proportion = sum > 0 ? value / sum : 0;
      
      if (proportion > 0.4) {
        switch (element) {
          case 'Fire': return 'border-red-200 bg-gradient-to-br from-red-50 to-amber-50';
          case 'Water': return 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50';
          case 'Earth': return 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50';
          case 'Air': return 'border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50';
        }
      }
    }
    
    // If no element is significantly dominant, use the element with the highest value
    switch (dominantElement) {
      case 'Fire': return 'border-red-200 bg-red-50';
      case 'Water': return 'border-blue-200 bg-blue-50';
      case 'Earth': return 'border-green-200 bg-green-50';
      case 'Air': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleCuisineSelect = (cuisineId: string) => {
    setSelectedCuisine(cuisineId);
    loadRecipesForCuisine(cuisineId);
  };

  /**
   * Load recipes for a selected cuisine
   */
  const loadRecipesForCuisine = async (cuisineName: string) => {
    if (!cuisineName) return;
    
    setLoading(true);
    try {
      console.log('Loading recipes for cuisine:', cuisineName);
      
      // First try to get recipes from our local recipe database
      const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisineName);
      console.log(`Found ${localRecipes.length} local recipes for ${cuisineName}`);
      
      // Get current elemental profile for calculations
      const currentElementalProfile = userElementalProfile;
      
      // If we have enough local recipes, don't bother with API calls
      if (localRecipes.length >= 5) {
        // Calculate elemental matches for local recipes
        const matchedRecipes = localRecipes.map(recipe => {
          if (!recipe) return null;
          
          // Use the recipe's actual elementalProperties, not a fallback
          const matchScore = calculateElementalMatch(
            recipe.elementalProperties || fetchCuisineElementalProperties(cuisineName),
            currentElementalProfile
          );
          
          return {
            ...recipe,
            matchScore
          };
        }).filter(Boolean) as any[]; // Filter out null items
        
        // Sort by match score
        matchedRecipes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        // Remove duplicate recipes by comparing names
        const uniqueRecipes = Array.from(new Map(matchedRecipes.map(recipe => 
          [recipe.name, recipe])).values());
        
        setMatchingRecipes(uniqueRecipes);
        setLoading(false);
        return;
      }
      
      // If we don't have enough local recipes, try the API (but be ready to fail gracefully)
      let matchedRecipes = localRecipes.map(recipe => {
        if (!recipe) return null;
        
        const matchScore = calculateElementalMatch(
          recipe.elementalProperties || fetchCuisineElementalProperties(cuisineName),
          currentElementalProfile
        );
        
        return {
          ...recipe,
          matchScore
        };
      }).filter(Boolean) as any[]; // Filter out null items
      
      // Try to fetch additional recipes from Spoonacular API (with error handling)
      try {
        console.log('Trying Spoonacular API for additional recipes');
        const spoonacularRecipes = await SpoonacularService.searchRecipes({
          cuisine: cuisineName,
          number: 10,
          addRecipeInformation: true,
          fillIngredients: true
        });
        
        if (spoonacularRecipes && spoonacularRecipes.length > 0) {
          console.log('Spoonacular returned recipes:', spoonacularRecipes.length);
          
          // Transform and add Spoonacular recipes to our matches
          const transformedSpoonacularRecipes = spoonacularRecipes.map(recipe => {
            if (!recipe) return null;
            
            // Calculate the elemental match score
            const matchScore = calculateElementalMatch(
              recipe.elementalProperties || fetchCuisineElementalProperties(cuisineName),
              currentElementalProfile
            );
            
            return {
              ...recipe,
              matchScore
            };
          }).filter(Boolean);
          
          // Combine with our existing recipes
          matchedRecipes = [...matchedRecipes, ...transformedSpoonacularRecipes];
        } else {
          console.log('No additional recipes found from Spoonacular API');
        }
      } catch (apiError) {
        // Log the error but continue with local recipes
        console.error('Error fetching from Spoonacular, using only local recipes:', apiError);
      }
      
      // If we STILL don't have any recipes at all, generate some basic ones from our ingredient data
      if (!matchedRecipes || matchedRecipes.length === 0) {
        console.log('No recipes found, generating basic recipes from ingredients');
        try {
          const generatedRecipes = generateBasicRecipesForCuisine(cuisineName);
          matchedRecipes = generatedRecipes;
        } catch (generationError) {
          console.error('Error generating recipes:', generationError);
          matchedRecipes = []; // Ensure it's an empty array if generation failed
        }
      }
      
      // Sort by match score
      matchedRecipes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      // Remove duplicate recipes by comparing names
      const uniqueRecipes = Array.from(new Map(matchedRecipes.map(recipe => 
        [recipe.name, recipe])).values());
      
      // Set the state with all recipes we could find
      setMatchingRecipes(uniqueRecipes);
      
      // Generate sauce recommendations for this cuisine
      const sauces = generateSauceRecommendations(cuisineName);
      setSauceRecommendations(sauces);
    } catch (error) {
      console.error('Error loading recipes:', error);
      
      // In case of any error, use local recipes only
      try {
        const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisineName);
        if (localRecipes && localRecipes.length > 0) {
          // Calculate elemental matches for local recipes
          const matchedRecipes = localRecipes.map(recipe => {
            if (!recipe) return null;
            
            const matchScore = calculateElementalMatch(
              recipe.elementalProperties || fetchCuisineElementalProperties(cuisineName),
              userElementalProfile
            );
            
            return {
              ...recipe,
              matchScore
            };
          }).filter(Boolean) as any[];
          
          // Sort by match score
          matchedRecipes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          
          // Remove duplicate recipes by comparing names
          const uniqueRecipes = Array.from(new Map(matchedRecipes.map(recipe => 
            [recipe.name, recipe])).values());
            
          setMatchingRecipes(uniqueRecipes);
        } else {
          // Last resort - generate basic recipes
          try {
            const generatedRecipes = generateBasicRecipesForCuisine(cuisineName);
            
            // Remove duplicates in generated recipes
            const uniqueGenerated = Array.from(new Map(generatedRecipes.map(recipe => 
              [recipe.name, recipe])).values());
              
            setMatchingRecipes(uniqueGenerated);
          } catch (generationError) {
            console.error('Error generating basic recipes:', generationError);
            setMatchingRecipes([]); // Empty array if all methods fail
          }
        }
      } catch (localError) {
        console.error('Error getting local recipes:', localError);
        setMatchingRecipes([]); // Set empty array if all fails
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get the elemental properties for a cuisine from our data
  const fetchCuisineElementalProperties = (cuisineName: string): ElementalProperties => {
    // Look up the cuisine in our data
    const cuisine = cuisines[cuisineName.toLowerCase()];
    
    // If found, return its elemental alignment
    if (cuisine?.elementalAlignment) {
      return cuisine.elementalAlignment;
    }
    
    // Otherwise, look it up in our cuisineElements map from generateBasicRecipesForCuisine
    const cuisineElements: Record<string, ElementalProperties> = {
      italian: { Fire: 0.3, Earth: 0.4, Water: 0.2, Air: 0.1 },
      french: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
      japanese: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
      mexican: { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 },
      indian: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
      thai: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      chinese: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
      greek: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    };
    
    return cuisineElements[cuisineName.toLowerCase()] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  };

  // Generate sauce recommendations for a cuisine
  const generateSauceRecommendations = (cuisineName: string): any[] => {
    // Get elemental properties from our cuisine data
    const elementalProperties = fetchCuisineElementalProperties(cuisineName);
    const dominantElement = Object.entries(elementalProperties)
      .sort(([, a], [, b]) => b - a)[0][0].toLowerCase();
    
    const recommendations: any[] = [];
    
    // Cast sauceRecommendations to SauceRecommendation to work with its properties
    const sauceRecs = sauceRecommendations as SauceRecommendation;
    
    // Add sauces by astrological element
    if (dominantElement in sauceRecs.byAstrological) {
      const sauces = sauceRecs.byAstrological[dominantElement as keyof typeof sauceRecs.byAstrological];
      sauces.forEach((sauce, index) => {
        recommendations.push({
          id: `${cuisineName.toLowerCase()}-sauce-element-${index}`,
          name: sauce,
          category: 'byAstrological',
          forItem: dominantElement,
          cuisine: cuisineName,
          description: `A ${dominantElement} element sauce that pairs well with ${cuisineName} cuisine.`,
          ingredients: ['Traditional ingredients', 'Seasonings', 'Aromatics'],
          elementalProperties
        });
      });
    }
    
    // Add sauces by protein
    const proteins = ['beef', 'chicken', 'pork', 'fish', 'vegetarian'];
    proteins.forEach(protein => {
      if (protein in sauceRecs.forProtein) {
        const sauces = sauceRecs.forProtein[protein as keyof typeof sauceRecs.forProtein];
        const sauce = sauces[Math.floor(Math.random() * sauces.length)];
        
        recommendations.push({
          id: `${cuisineName.toLowerCase()}-sauce-protein-${protein}`,
          name: sauce,
          category: 'forProtein',
          forItem: protein,
          cuisine: cuisineName,
          description: `A sauce ideal for ${protein} dishes in ${cuisineName} cuisine.`,
          ingredients: ['Protein-specific components', 'Flavor enhancers', 'Aromatics'],
          elementalProperties
        });
      }
    });
    
    // Add sauces by vegetable
    const vegetables = ['leafy', 'root', 'nightshades', 'squash', 'mushroom'];
    vegetables.forEach(vegetable => {
      if (vegetable in sauceRecs.forVegetable) {
        const sauces = sauceRecs.forVegetable[vegetable as keyof typeof sauceRecs.forVegetable];
        const sauce = sauces[Math.floor(Math.random() * sauces.length)];
        
        recommendations.push({
          id: `${cuisineName.toLowerCase()}-sauce-veg-${vegetable}`,
          name: sauce,
          category: 'forVegetable',
          forItem: vegetable,
          cuisine: cuisineName,
          description: `A sauce that complements ${vegetable} vegetables in ${cuisineName} cuisine.`,
          ingredients: ['Vegetable-based components', 'Seasonings', 'Complementary flavors'],
          elementalProperties
        });
      }
    });
    
    return recommendations;
  };

  // Generate basic recipes for a cuisine based on general patterns
  const generateBasicRecipesForCuisine = (cuisineName: string): any[] => {
    // Get elemental properties from our cuisine data
    const elementalProperties = fetchCuisineElementalProperties(cuisineName);
    
    // Generate 5 basic recipes 
    return [
      {
        id: `${cuisineName.toLowerCase()}-simple-1`,
        name: `${cuisineName} Starter Dish`,
        description: `A simple ${cuisineName} dish that introduces the basic flavors of the cuisine.`,
        cuisine: cuisineName,
        ingredients: [
          { name: `${cuisineName} seasoning blend`, amount: 2, unit: 'tbsp' },
          { name: 'protein of choice', amount: 400, unit: 'g' },
          { name: 'mixed vegetables', amount: 2, unit: 'cups' },
          { name: 'oil', amount: 2, unit: 'tbsp' },
          { name: 'aromatics', amount: 1, unit: 'cup' }
        ],
        instructions: [
          `Prepare the ingredients by cutting them into appropriate sizes`,
          `Heat oil in a pan and add aromatics`,
          `Add protein and cook until done`,
          `Add vegetables and ${cuisineName} seasonings`,
          `Serve hot with appropriate side dishes`
        ],
        timeToMake: '30 minutes',
        numberOfServings: 4,
        elementalProperties,
        matchScore: 0.8
      },
      {
        id: `${cuisineName.toLowerCase()}-simple-2`,
        name: `Traditional ${cuisineName} Main Course`,
        description: `An authentic ${cuisineName} main dish showcasing traditional flavors and techniques.`,
        cuisine: cuisineName,
        ingredients: [
          { name: 'regional starch', amount: 2, unit: 'cups' },
          { name: 'seasonal vegetables', amount: 3, unit: 'cups' },
          { name: 'traditional protein', amount: 500, unit: 'g' },
          { name: `${cuisineName} sauce`, amount: 1, unit: 'cup' },
          { name: 'fresh herbs', amount: 1/4, unit: 'cup' }
        ],
        instructions: [
          `Prepare the starch component according to regional methods`,
          `Cook the protein using traditional ${cuisineName} techniques`,
          `Prepare vegetables and combine with sauce`,
          `Assemble all components according to cultural presentation`,
          `Garnish with fresh herbs and serve`
        ],
        timeToMake: '45 minutes',
        numberOfServings: 4,
        elementalProperties,
        matchScore: 0.75
      },
      // Add a few more basic recipes
      {
        id: `${cuisineName.toLowerCase()}-simple-3`,
        name: `${cuisineName} Quick Meal`,
        description: `A simplified version of a ${cuisineName} favorite that can be made quickly.`,
        cuisine: cuisineName,
        ingredients: [
          { name: 'quick-cooking base', amount: 2, unit: 'cups' },
          { name: 'pre-cooked protein', amount: 300, unit: 'g' },
          { name: `${cuisineName} flavor base`, amount: 3, unit: 'tbsp' },
          { name: 'quick vegetables', amount: 2, unit: 'cups' }
        ],
        instructions: [
          `Prepare the quick-cooking base in 10 minutes`,
          `Combine with protein and vegetables`,
          `Add flavor base and adjust seasonings`,
          `Finish with appropriate ${cuisineName} techniques`
        ],
        timeToMake: '20 minutes',
        numberOfServings: 2,
        elementalProperties,
        matchScore: 0.7
      }
    ];
  };

  // Toggle recipe expansion
  const toggleRecipeExpansion = (index: number) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Toggle sauce expansion
  const toggleSauceExpansion = (index: number) => {
    setExpandedSauces(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // When going back to the list, reset expanded states
  const handleBackToList = () => {
    setSelectedCuisine(null);
    setCuisineRecipes([]);
    setSauceRecommendations([]);
    setShowAllRecipes(false);
    setShowAllSauces(false);
    setExpandedRecipes({});
    setExpandedSauces({});
  };

  // Helper function to get relevant search keywords for a cuisine
  const getCuisineKeywords = (cuisineName: string): string => {
    // Map of cuisines to their most distinctive ingredients or dishes
    const cuisineKeywords: Record<string, string> = {
      'italian': 'pasta tomato basil',
      'mexican': 'taco tortilla salsa',
      'indian': 'curry masala turmeric',
      'chinese': 'stir-fry soy ginger',
      'japanese': 'sushi miso rice',
      'thai': 'curry lemongrass coconut',
      'french': 'wine butter sauce',
      'spanish': 'paella saffron',
      'greek': 'feta olive mediterranean',
      'lebanese': 'hummus tahini',
      'turkish': 'kebab mezze',
      'moroccan': 'tagine couscous',
      'korean': 'kimchi bulgogi',
      'vietnamese': 'pho noodle',
      // Add more cuisines as needed
    };
    
    const lowerCuisine = cuisineName.toLowerCase();
    return cuisineKeywords[lowerCuisine] || cuisineName;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <h2 className="text-xl font-semibold mb-4">Celestial Cuisine Guide</h2>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Celestial Cuisine Guide</h2>
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          <p>Error loading cuisines: {error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedCuisine) {
    // Find the transformed cuisine for more detailed information
    const transformedCuisine = transformedCuisines.find(c => c.id === selectedCuisine);
    // Also get the original cuisine data
    const originalCuisine = cuisinesList.find(c => c.id === selectedCuisine);
    
    if (!transformedCuisine || !originalCuisine) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Celestial Cuisine Guide</h2>
          <p>Cuisine not found. Please try again.</p>
          <button 
            className="mt-4 flex items-center text-blue-600" 
            onClick={handleBackToList}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to cuisines
          </button>
        </div>
      );
    }
    
    // Calculate elemental match with user profile for this cuisine
    const elementalMatch = calculateElementalMatch(
      transformedCuisine.elementalProperties,
      userElementalProfile
    );
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <button 
          className="mb-4 flex items-center text-blue-600" 
          onClick={handleBackToList}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to cuisines
        </button>
        
        <h2 className="text-2xl font-semibold mb-2">{transformedCuisine.name}</h2>
        <p className="text-gray-600 mb-6">{originalCuisine.description}</p>
        
        {/* Cuisine Recipe Preview */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <GalleryVertical className="w-4 h-4 mr-2 text-amber-500" />
            Recipe Recommendations
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Explore recipes from {transformedCuisine.name} cuisine that match your preferences
            and current seasonal conditions.
          </p>
          {loading && (
            <div className="text-center text-gray-500 py-2">
              <p>Loading recipes...</p>
            </div>
          )}
          {!loading && cuisineRecipes.length === 0 && (
            <div className="text-center text-gray-500 py-2">
              <p>No recipes found for this cuisine. Try another selection or check the console for debugging info.</p>
            </div>
          )}
        </div>
        
        {/* Recipe Recommendations Section */}
        {cuisineRecipes.length > 0 && (
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-medium mb-3">Recommended Recipes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cuisineRecipes.slice(0, showAllRecipes ? cuisineRecipes.length : 4).map((recipe, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{recipe.name}</h4>
                    {recipe.matchScore && (
                      renderScoreBadge(recipe.matchScore as number)
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2 text-xs">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      {Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}
                    </span>
                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                      {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}
                    </span>
                    {recipe.prepTime && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Prep: {recipe.prepTime}
                      </span>
                    )}
                    {recipe.cookTime && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Cook: {recipe.cookTime}
                      </span>
                    )}
                    {!recipe.prepTime && !recipe.cookTime && recipe.timeToMake && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Time: {recipe.timeToMake}
                      </span>
                    )}
                  </div>
                  
                  {/* Show cooking methods if available */}
                  {recipe.cookingMethods && recipe.cookingMethods.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Array.isArray(recipe.cookingMethods) ? recipe.cookingMethods.slice(0, 3).map((method, i) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                          {typeof method === 'string' ? method : String(method)}
                        </span>
                      )) : (
                        <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                          {recipe.cookingMethods}
                        </span>
                      )}
                      {Array.isArray(recipe.cookingMethods) && recipe.cookingMethods.length > 3 && (
                        <span className="text-xs text-gray-500">+{recipe.cookingMethods.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Show a preview of ingredients even if not expanded */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-xs font-medium mb-1">Key Ingredients:</h5>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ing: any, i: number) => (
                          <span key={i} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">
                            {typeof ing === 'string' 
                              ? ing 
                              : typeof ing === 'object' 
                                ? (ing.name || Object.keys(ing).join(', '))
                                : String(ing)}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Recipe details section that becomes visible on expansion */}
                  {expandedRecipes[index] && (
                    <div className="mt-4 pt-3 border-t">
                      {/* Time & Cooking Information */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                        {recipe.prepTime && (
                          <div className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">Prep Time:</h5>
                            <p className="text-xs">{recipe.prepTime}</p>
                          </div>
                        )}
                        {recipe.cookTime && (
                          <div className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">Cook Time:</h5>
                            <p className="text-xs">{recipe.cookTime}</p>
                          </div>
                        )}
                        {recipe.totalTime && (
                          <div className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">Total Time:</h5>
                            <p className="text-xs">{recipe.totalTime}</p>
                          </div>
                        )}
                        {recipe.timeToMake && !recipe.prepTime && !recipe.cookTime && (
                          <div className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">Time to Make:</h5>
                            <p className="text-xs">{recipe.timeToMake}</p>
                          </div>
                        )}
                        {recipe.servingSize && (
                          <div className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">Serving Size:</h5>
                            <p className="text-xs">{recipe.servingSize}</p>
                          </div>
                        )}
                        {recipe.numberOfServings && (
                          <div className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">Servings:</h5>
                            <p className="text-xs">{recipe.numberOfServings}</p>
                          </div>
                        )}
                      </div>

                      {/* Ingredients Section */}
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Ingredients:</h5>
                          <ul className="text-xs text-gray-700 pl-4 list-disc">
                            {Array.isArray(recipe.ingredients) 
                              ? recipe.ingredients.map((ing: any, i: number) => (
                                  <li key={i} className="mb-1">
                                    {typeof ing === 'string' 
                                      ? ing 
                                      : typeof ing === 'object'
                                        ? (ing.amount && ing.unit 
                                            ? `${ing.amount} ${ing.unit} ${ing.name}${ing.preparation ? `, ${ing.preparation}` : ''}${ing.notes ? ` (${ing.notes})` : ''}`
                                            : (ing.name || Object.keys(ing).join(', ')))
                                        : String(ing)}
                                  </li>
                                ))
                              : <li>{String(recipe.ingredients)}</li>
                            }
                          </ul>
                        </div>
                      )}

                      {/* Procedure Section */}
                      {recipe.instructions && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Procedure:</h5>
                          <ol className="text-xs text-gray-700 pl-4 list-decimal">
                            {Array.isArray(recipe.instructions) 
                              ? recipe.instructions.map((step: any, i: number) => (
                                  <li key={i} className="mb-2">
                                    {typeof step === 'string' 
                                      ? step 
                                      : typeof step === 'object'
                                        ? JSON.stringify(step)
                                        : String(step)}
                                  </li>
                                ))
                              : typeof recipe.instructions === 'object'
                                ? Object.entries(recipe.instructions).map(([key, value], i) => (
                                    <li key={i} className="mb-1">{key}: {String(value)}</li>
                                  ))
                                : <li>{String(recipe.instructions)}</li>
                            }
                          </ol>
                        </div>
                      )}

                      {/* Cooking Methods Section */}
                      {recipe.cookingMethods && recipe.cookingMethods.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Cooking Methods:</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(recipe.cookingMethods) ? recipe.cookingMethods.map((method: any, i: number) => (
                              <span key={i} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">
                                {typeof method === 'string' ? method : String(method)}
                              </span>
                            )) : (
                              <span className="text-xs">{String(recipe.cookingMethods)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tools Section */}
                      {recipe.tools && recipe.tools.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Tools:</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(recipe.tools) ? recipe.tools.map((tool: any, i: number) => (
                              <span key={i} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">
                                {typeof tool === 'string' ? tool : String(tool)}
                              </span>
                            )) : (
                              <span className="text-xs">{String(recipe.tools)}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Preparation Steps Section */}
                      {recipe.preparationSteps && recipe.preparationSteps.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Preparation Steps:</h5>
                          <ol className="text-xs text-gray-700 pl-4 list-decimal">
                            {Array.isArray(recipe.preparationSteps) 
                              ? recipe.preparationSteps.map((step: any, i: number) => (
                                  <li key={i} className="mb-1">{typeof step === 'string' ? step : String(step)}</li>
                                ))
                              : <li>{String(recipe.preparationSteps)}</li>
                            }
                          </ol>
                        </div>
                      )}

                      {/* Nutrition Section */}
                      {recipe.nutrition && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Nutrition:</h5>
                          <div className="bg-gray-50 p-3 rounded">
                            {/* Macronutrients */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700">Calories:</span>
                                <span className="text-sm">{recipe.nutrition.calories || 0}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700">Protein:</span>
                                <span className="text-sm">{recipe.nutrition.protein || 0}g</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700">Carbs:</span>
                                <span className="text-sm">{recipe.nutrition.carbs || 0}g</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700">Fat:</span>
                                <span className="text-sm">{recipe.nutrition.fat || 0}g</span>
                              </div>
                            </div>
                            
                            {/* Additional nutrition info if available */}
                            {(recipe.nutrition.fiber || recipe.nutrition.sugar) && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                {recipe.nutrition.fiber !== undefined && (
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-700">Fiber:</span>
                                    <span className="text-sm">{recipe.nutrition.fiber}g</span>
                                  </div>
                                )}
                                {recipe.nutrition.sugar !== undefined && (
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-700">Sugar:</span>
                                    <span className="text-sm">{recipe.nutrition.sugar}g</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Vitamins */}
                            {recipe.nutrition.vitamins && recipe.nutrition.vitamins.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-gray-700">Vitamins:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Array.isArray(recipe.nutrition.vitamins) ? recipe.nutrition.vitamins.map((vitamin: string, i: number) => (
                                    <span key={i} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                      {vitamin}
                                    </span>
                                  )) : (
                                    <span className="text-xs">None</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Minerals */}
                            {recipe.nutrition.minerals && recipe.nutrition.minerals.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs font-medium text-gray-700">Minerals:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Array.isArray(recipe.nutrition.minerals) ? recipe.nutrition.minerals.map((mineral: string, i: number) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                      {mineral}
                                    </span>
                                  )) : (
                                    <span className="text-xs">None</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Nutrition data source note */}
                            <div className="mt-2 text-xs text-gray-500 italic">
                              {recipe.nutrition.source ? 
                                `Data from: ${recipe.nutrition.source}` : 
                                'Nutritional information is calculated estimate'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dietary Information */}
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold mb-2">Dietary Information:</h5>
                        <div className="flex flex-wrap gap-1">
                          {recipe.isVegetarian && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Vegetarian</span>
                          )}
                          {recipe.isVegan && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Vegan</span>
                          )}
                          {recipe.isGlutenFree && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Gluten-Free</span>
                          )}
                          {recipe.isDairyFree && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Dairy-Free</span>
                          )}
                          {recipe.isNutFree && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Nut-Free</span>
                          )}
                          {recipe.isLowCarb && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Low-Carb</span>
                          )}
                          {recipe.isKeto && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Keto</span>
                          )}
                          {recipe.isPaleo && (
                            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Paleo</span>
                          )}
                        </div>
                      </div>

                      {/* Allergens Section */}
                      {recipe.allergens && recipe.allergens.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Allergens:</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(recipe.allergens) ? recipe.allergens.map((allergen: any, i: number) => (
                              <span key={i} className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                                {typeof allergen === 'string' ? allergen : String(allergen)}
                              </span>
                            )) : (
                              <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{String(recipe.allergens)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cultural Notes */}
                      {recipe.culturalNotes && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Cultural Notes:</h5>
                          <p className="text-xs text-gray-700 p-2 bg-gray-50 rounded">{recipe.culturalNotes}</p>
                        </div>
                      )}

                      {/* Pairing Suggestions */}
                      {recipe.pairingSuggestions && recipe.pairingSuggestions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Pairing Suggestions:</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(recipe.pairingSuggestions) ? recipe.pairingSuggestions.map((suggestion: any, i: number) => (
                              <span key={i} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                                {typeof suggestion === 'string' ? suggestion : String(suggestion)}
                              </span>
                            )) : (
                              <span className="text-xs">{String(recipe.pairingSuggestions)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Spice Level */}
                      {recipe.spiceLevel && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Spice Level:</h5>
                          <span className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">{recipe.spiceLevel}</span>
                        </div>
                      )}

                      {/* Chef Notes */}
                      {recipe.chefNotes && recipe.chefNotes.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Chef Notes:</h5>
                          <ul className="text-xs text-gray-700 pl-4 list-disc">
                            {Array.isArray(recipe.chefNotes) 
                              ? recipe.chefNotes.map((note: any, i: number) => (
                                  <li key={i} className="mb-1">{typeof note === 'string' ? note : String(note)}</li>
                                ))
                              : <li>{String(recipe.chefNotes)}</li>
                            }
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {recipe.tips && recipe.tips.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Tips:</h5>
                          <ul className="text-xs text-gray-700 pl-4 list-disc">
                            {Array.isArray(recipe.tips) 
                              ? recipe.tips.map((tip: any, i: number) => (
                                  <li key={i} className="mb-1">{typeof tip === 'string' ? tip : String(tip)}</li>
                                ))
                              : <li>{String(recipe.tips)}</li>
                            }
                          </ul>
                        </div>
                      )}

                      {/* Substitutions */}
                      {recipe.substitutions && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Substitutions:</h5>
                          <div className="text-xs text-gray-700">
                            {typeof recipe.substitutions === 'string' 
                              ? recipe.substitutions 
                              : Array.isArray(recipe.substitutions)
                                ? recipe.substitutions.map((sub: any, i: number) => (
                                    <div key={i} className="mb-1">
                                      {typeof sub === 'string' ? sub : JSON.stringify(sub)}
                                    </div>
                                  ))
                                : typeof recipe.substitutions === 'object'
                                  ? Object.entries(recipe.substitutions).map(([key, value], i) => (
                                      <div key={i} className="mb-1"><span className="font-medium">{key}:</span> {String(value)}</div>
                                    ))
                                  : String(recipe.substitutions)
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Toggle button */}
                  <button 
                    className="mt-3 text-blue-600 hover:text-blue-800 flex items-center text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRecipeExpansion(index);
                    }}
                  >
                    {expandedRecipes[index] 
                      ? <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</> 
                      : <><ChevronDown className="w-3 h-3 mr-1" /> View Details</>
                    }
                  </button>
                </div>
              ))}
            </div>
            
            {cuisineRecipes.length > 4 && (
              <button
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
                onClick={() => setShowAllRecipes(!showAllRecipes)}
              >
                {showAllRecipes ? 'Show Less' : `View All ${cuisineRecipes.length} Recipes`}
              </button>
            )}
          </div>
        )}
        
        {/* Sauce Recommendations Section with expansion capability */}
        {sauceRecommendations.length > 0 && (
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-medium mb-3">Sauce Recommendations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sauceRecommendations.slice(0, showAllSauces ? sauceRecommendations.length : 6).map((sauce, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                  <h4 className="font-medium text-sm mb-1">{sauce.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {sauce.category === 'forProtein' ? 'Pair with: ' : 
                     sauce.category === 'forVegetable' ? 'Great for: ' : 
                     sauce.category === 'byAstrological' ? 'Astrological affinity: ' : ''}
                    <span className="font-medium">{sauce.forItem}</span>
                  </p>
                  
                  {/* Preview of key ingredients (up to 3) */}
                  {sauce.ingredients && sauce.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {sauce.ingredients.slice(0, 3).map((ing: any, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {typeof ing === 'string' ? ing : typeof ing === 'object' ? ing.name || Object.keys(ing).join(', ') : String(ing)}
                        </span>
                      ))}
                      {sauce.ingredients.length > 3 && (
                        <span className="text-xs text-gray-500">+{sauce.ingredients.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Expanded sauce details */}
                  {expandedSauces[index] && (
                    <div className="mt-2 pt-2 border-t text-xs">
                      {sauce.description && (
                        <p className="text-gray-700 mb-2">{sauce.description}</p>
                      )}
                      
                      {sauce.ingredients && sauce.ingredients.length > 0 && (
                        <div className="mt-2">
                          <h5 className="font-medium mb-1">Key Ingredients:</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(sauce.ingredients) && sauce.ingredients.map((ing: any, i: number) => (
                              <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded">
                                {typeof ing === 'string' 
                                  ? ing 
                                  : typeof ing === 'object'
                                    ? (ing.name || Object.keys(ing).join(', '))
                                    : String(ing)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {sauce.culinaryNotes && (
                        <div className="mt-2">
                          <h5 className="font-medium mb-1">Culinary Notes:</h5>
                          <p className="text-gray-700">{sauce.culinaryNotes}</p>
                        </div>
                      )}

                      {sauce.variants && sauce.variants.length > 0 && (
                        <div className="mt-2">
                          <h5 className="font-medium mb-1">Variants:</h5>
                          <div className="flex flex-wrap gap-1">
                            {sauce.variants.map((variant: string, i: number) => (
                              <span key={i} className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                                {variant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {sauce.technicalTips && (
                        <div className="mt-2">
                          <h5 className="font-medium mb-1">Chef's Tips:</h5>
                          <p className="text-gray-700 italic">{sauce.technicalTips}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Toggle button */}
                  <button 
                    className="mt-2 text-blue-600 hover:text-blue-800 flex items-center text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSauceExpansion(index);
                    }}
                  >
                    {expandedSauces[index] 
                      ? <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</> 
                      : <><Info className="w-3 h-3 mr-1" /> More Details</>
                    }
                  </button>
                </div>
              ))}
            </div>
            
            {sauceRecommendations.length > 6 && (
              <button
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
                onClick={() => setShowAllSauces(!showAllSauces)}
              >
                {showAllSauces ? 'Show Less' : `View All ${sauceRecommendations.length} Sauces`}
              </button>
            )}
          </div>
        )}
        
        {/* Zodiac Influences Section */}
        {originalCuisine.zodiacInfluences && originalCuisine.zodiacInfluences.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Zodiac Influences</h3>
            <div className="flex flex-wrap gap-2">
              {originalCuisine.zodiacInfluences.map(sign => {
                const isCurrentZodiac = sign === currentZodiac;
                return (
                  <div 
                    key={sign} 
                    className={`${isCurrentZodiac ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-600'} 
                             rounded-full px-3 py-1 text-sm flex items-center`}
                  >
                    {isCurrentZodiac && <SunIcon className="w-3 h-3 mr-1" />}
                    {sign.charAt(0).toUpperCase() + sign.slice(1)}
                    {isCurrentZodiac && <span className="ml-1 text-xs">(Current)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Lunar Phase Influences Section */}
        {originalCuisine.lunarPhaseInfluences && originalCuisine.lunarPhaseInfluences.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Lunar Phase Affinity</h3>
            <div className="flex flex-wrap gap-2">
              {originalCuisine.lunarPhaseInfluences.map(phase => {
                const isCurrentPhase = phase === lunarPhase;
                const phaseDisplay = phase.replace(/([A-Z])/g, ' $1').toLowerCase();
                return (
                  <div 
                    key={phase} 
                    className={`${isCurrentPhase ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'} 
                             rounded-full px-3 py-1 text-sm flex items-center`}
                  >
                    <Moon className={`w-3 h-3 mr-1 ${isCurrentPhase ? 'text-slate-800' : 'text-slate-500'}`} />
                    {phaseDisplay}
                    {isCurrentPhase && <span className="ml-1 text-xs">(Current)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Planetary Influences Section */}
        {'dominantPlanets' in transformedCuisine && transformedCuisine.dominantPlanets.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Planetary Influences</h3>
            <div className="flex flex-wrap gap-2">
              {transformedCuisine.dominantPlanets.map(planet => (
                <div key={planet} className="bg-violet-50 text-violet-600 rounded-full px-3 py-1 text-sm">
                  {planet}
                </div>
              ))}
            </div>
            
            {/* Display planetary dignities */}
            {transformedCuisine.planetaryDignities && Object.keys(transformedCuisine.planetaryDignities).length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">Planetary Influences:</h4>
                {Object.entries(transformedCuisine.planetaryDignities).map(([planet, dignity]) => (
                  <div key={planet} className="mb-1">
                    <span className="font-medium">{planet}:</span> {dignity.type}
                    {dignity.favorableZodiacSigns && dignity.favorableZodiacSigns.length > 0 && (
                      <span className="ml-1">
                        (Favorable in: {dignity.favorableZodiacSigns.join(', ')})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Celestial Cuisine Guide</h2>
      <p className="text-gray-600 mb-4">
        Explore culinary traditions aligned with current celestial energies.
        {currentZodiac && (
          <span className="ml-1">
            Current sign: <span className="font-medium">{currentZodiac.charAt(0).toUpperCase() + currentZodiac.slice(1)}</span>.
          </span>
        )}
      </p>
      
      {/* Gas Giant Influence Section */}
      {(() => {
        const safeState = alchemicalContext?.state as any;
        const planets = safeState?.dominantPlanets as Array<{name: string, effect?: string}> | undefined;
        
        if (planets && planets.length > 0 && 
            planets.some(p => p.name === 'Jupiter' || p.name === 'Saturn')) {
          return (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Gas Giant Influences
              </h3>
              <div className="flex flex-wrap gap-2">
                {planets
                  .filter(planet => planet.name === 'Jupiter' || planet.name === 'Saturn')
                  .map((planet) => {
                    const effect = planet.effect || 'balanced';
                    const effectColor = 
                      planet.name === 'Jupiter' 
                        ? (effect === 'expansive' ? 'text-emerald-600' : 
                           effect === 'restricted' ? 'text-amber-600' : 
                           'text-blue-600')
                        : (effect === 'restrictive' ? 'text-slate-600' : 
                           effect === 'softened' ? 'text-violet-600' : 
                           'text-gray-600');
                    
                    const description = 
                      planet.name === 'Jupiter' 
                        ? (effect === 'expansive' ? 'favors abundant, celebratory dishes' : 
                           effect === 'restricted' ? 'suggests moderation in portions' : 
                           'balanced culinary influence')
                        : (effect === 'restrictive' ? 'emphasizes structured, traditional preparations' : 
                           effect === 'softened' ? 'allows for more flexibility in recipes' : 
                           'balanced structuring influence');
                    
                    return (
                      <div 
                        key={planet.name} 
                        className="text-xs px-2 py-1 rounded bg-white border border-gray-200"
                      >
                        <span className="font-medium">{planet.name}:</span>{' '}
                        <span className={effectColor}>
                          {effect} ({description})
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Cuisine List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Show all cuisines if we have 6 or fewer, otherwise limit to 6 */}
        {displayedCuisines.slice(0, Math.min(displayedCuisines.length, 8)).map((cuisine) => {
          // Check if this cuisine is aligned with current zodiac and lunar phase
          const isZodiacAligned = currentZodiac && cuisine.zodiacInfluences?.includes(currentZodiac as ZodiacSign);
          const isLunarAligned = lunarPhase && cuisine.lunarPhaseInfluences?.includes(lunarPhase as LunarPhase);
          
          // Get element-based styling using the new function
          const elementColorClass = getCardColorClass(cuisine.elementalProperties);
          
          // Determine final card classes combining all factors
          const cardClasses = `border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
            'gregsEnergy' in cuisine && cuisine.gregsEnergy > 0.9 ? 'border-amber-300 bg-amber-50' : 
            'gregsEnergy' in cuisine && cuisine.gregsEnergy > 0.85 ? 'border-emerald-200 bg-emerald-50' :
            isZodiacAligned ? 'border-indigo-200 bg-indigo-50' :
            isLunarAligned ? 'border-slate-200 bg-slate-50' :
            elementColorClass
          }`;
          
          return (
            <div 
              key={cuisine.id} 
              className={cardClasses}
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{cuisine.name}</h3>
                <div className="flex items-center space-x-1">
                  {cuisine.dominantPlanets && cuisine.dominantPlanets.length > 0 && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                      {cuisine.dominantPlanets[0]}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Compatibility score if available */}
              {'gregsEnergy' in cuisine && (
                renderCompatibilityBadge(cuisine.gregsEnergy)
              )}
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {cuisine.description}
              </p>
              
              {/* Alignment indicators */}
              <div className="flex flex-wrap gap-2 mt-2">
                {isZodiacAligned && (
                  <div className="flex items-center text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-1">
                    <SunIcon className="w-3 h-3 mr-1" />
                    <span>{currentZodiac.charAt(0).toUpperCase() + currentZodiac.slice(1)}</span>
                  </div>
                )}
                
                {isLunarAligned && (
                  <div className="flex items-center text-xs bg-slate-100 text-slate-700 rounded-full px-2 py-1">
                    <Moon className="w-3 h-3 mr-1" />
                    <span>Lunar Aligned</span>
                  </div>
                )}
                
                {'gregsEnergy' in cuisine && cuisine.gregsEnergy > 0.85 && (
                  <div className="flex items-center text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span>Highly Compatible</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {displayedCuisines.length === 0 && (
        <div className="empty-state p-6 text-center bg-gray-50 rounded-lg">
          <p>Loading cuisine recommendations...</p>
        </div>
      )}
    </div>
  );
} 