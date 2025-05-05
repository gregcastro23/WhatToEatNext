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
import { ZodiacSign, LunarPhase, LunarPhaseWithSpaces, ElementalProperties } from '@/types/alchemy';
import { cuisineFlavorProfiles, getRecipesForCuisineMatch } from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import { SpoonacularService } from '@/services/SpoonacularService';
import { LocalRecipeService } from '@/services/LocalRecipeService';
import { sauceRecommendations as sauceRecsData, SauceRecommendation, allSauces, Sauce } from '@/data/sauces';
import type { Recipe } from '@/types/recipe';

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
  const [topRecommendedSauces, setTopRecommendedSauces] = useState<any[]>([]);
  const [expandedSauceCards, setExpandedSauceCards] = useState<Record<string, boolean>>({});
  const [showCuisineDetails, setShowCuisineDetails] = useState<boolean>(false);
  
  // Get elemental profile from current astrological state instead of using placeholder values
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties>(
    alchemicalContext?.state?.astrologicalState?.elementalState || 
    alchemicalContext?.state?.elementalState || 
    {
      Fire: 0.25, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.25
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
      setCurrentMomentElementalProfile({...safeState.elementalState} as unknown as ElementalProperties);
    } else if (currentZodiac) {
      // If no elemental state but we have zodiac, calculate based on that
      const zodiacElements = calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign, lunarPhase as LunarPhase);
      setCurrentMomentElementalProfile(zodiacElements);
    }
  }, [state.astrologicalState, currentZodiac, lunarPhase]);

  // Load top sauce recommendations when component mounts or when elemental profile changes
  useEffect(() => {
    const topSauces = generateTopSauceRecommendations();
    console.log(`Setting ${topSauces.length} top recommended sauces`);
    setTopRecommendedSauces(topSauces);
  }, [currentMomentElementalProfile, currentZodiac]); // Re-generate when these dependencies change

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
  const calculateElementalContributionsFromPlanets = (positions: Record<string, unknown>): ElementalProperties => {
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
    
    // Calculate cosine similarity (dot product / (magnitude of A * magnitude of B))
    const similarity = dotProduct / (recipeNorm * userNorm);
    
    // Convert to a percentage score (0.0 to 1.0)
    return similarity;
  };

  // Function to get match score CSS class based on the score
  const getMatchScoreClass = (score: number) => {
    // More dynamic classification with smoother transitions
    if (score >= 0.96) return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
    if (score >= 0.90) return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
    if (score >= 0.85) return 'bg-green-200 text-green-800 font-semibold';
    if (score >= 0.80) return 'bg-green-100 text-green-700 font-medium';
    if (score >= 0.75) return 'bg-green-50 text-green-600';
    if (score >= 0.70) return 'bg-yellow-100 text-yellow-700';
    if (score >= 0.65) return 'bg-yellow-50 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };
  
  // Function to render a score badge with stars for high scores
  const renderScoreBadge = (score: number, hasDualMatch: boolean = false) => {
    const formattedScore = Math.round(score * 100);
    let tooltipText = 'Match score based on cuisine, season, and elemental balance';
    
    if (score >= 0.96) {
      tooltipText = 'Perfect match: Highly recommended for your preferences';
    } else if (score >= 0.90) {
      tooltipText = 'Excellent match for your preferences';
    } else if (score >= 0.85) {
      tooltipText = 'Very good match for your preferences';
    }
    
    if (hasDualMatch) {
      tooltipText = `${tooltipText} (Matches multiple criteria)`;
    }
    
    return (
      <span 
        className={`text-sm ${getMatchScoreClass(score)} px-2 py-1 rounded flex items-center gap-1 transition-all duration-300 hover:scale-105`}
        title={tooltipText}
      >
        {hasDualMatch && <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>}
        <span>{formattedScore}% match</span>
      </span>
    );
  };

  // Get sauce recommendations for the current elemental profile
  const generateTopSauceRecommendations = () => {
    // Convert sauces record to array for mapping
    const saucesArray = allSauces ? Object.values(allSauces) : [];
    console.log(`Total available sauces: ${saucesArray.length}`);
    
    // Get current time factors
    const { getTimeFactors } = require('@/types/time');
    const timeFactors = getTimeFactors();
    
    // Determine if it's daytime (between 6am and 6pm)
    const isDaytime = () => {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18;
    };
    
    // Map planets to their elemental influences (diurnal and nocturnal elements)
    const planetaryElements: Record<string, { diurnal: string, nocturnal: string }> = {
      'Sun': { diurnal: 'Fire', nocturnal: 'Fire' },
      'Moon': { diurnal: 'Water', nocturnal: 'Water' },
      'Mercury': { diurnal: 'Air', nocturnal: 'Earth' },
      'Venus': { diurnal: 'Water', nocturnal: 'Earth' },
      'Mars': { diurnal: 'Fire', nocturnal: 'Water' },
      'Jupiter': { diurnal: 'Air', nocturnal: 'Fire' },
      'Saturn': { diurnal: 'Air', nocturnal: 'Earth' },
      'Uranus': { diurnal: 'Water', nocturnal: 'Air' },
      'Neptune': { diurnal: 'Water', nocturnal: 'Water' },
      'Pluto': { diurnal: 'Earth', nocturnal: 'Water' }
    };
    
    // Convert sauces to the format required by the match calculation
    const saucesWithMatches = saucesArray.map((sauce, index) => {
      // Base elemental match calculation
      const elementalMatchScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties,
        currentMomentElementalProfile
      );
      
      // Calculate planetary day and hour influence based on elemental properties
      let planetaryDayScore = 0.5; // Neutral base score
      let planetaryHourScore = 0.5; // Neutral base score
      
      if (sauce.elementalProperties) {
        // Get the planets' elemental influences
        const dayPlanet = timeFactors.planetaryDay.planet;
        const hourPlanet = timeFactors.planetaryHour.planet;
        
        if (planetaryElements[dayPlanet]) {
          // For planetary day, BOTH diurnal and nocturnal elements influence all day
          const dayDiurnalElement = planetaryElements[dayPlanet].diurnal;
          const dayNocturnalElement = planetaryElements[dayPlanet].nocturnal;
          
          // Calculate how much of each planetary element is present in the sauce
          const diurnalMatch = sauce.elementalProperties[dayDiurnalElement] || 0;
          const nocturnalMatch = sauce.elementalProperties[dayNocturnalElement] || 0;
          
          // Calculate score - both elements are equally important for planetary day
          planetaryDayScore = (diurnalMatch + nocturnalMatch) / 2;
        }
        
        if (planetaryElements[hourPlanet]) {
          // For planetary hour, use diurnal element during day, nocturnal at night
          const currentlyDaytime = isDaytime();
          const relevantElement = currentlyDaytime ? 
            planetaryElements[hourPlanet].diurnal : 
            planetaryElements[hourPlanet].nocturnal;
          
          // Calculate how much of the relevant element is present in the sauce
          planetaryHourScore = sauce.elementalProperties[relevantElement] || 0;
        }
      }
      
      // If the sauce has a direct planetary affinity, give bonus points
      if (sauce.astrologicalAffinities?.planets && sauce.astrologicalAffinities.planets.length > 0) {
        const saucePlanets = sauce.astrologicalAffinities.planets.map((p: string) => 
          typeof p === 'string' ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p
        );
        
        if (saucePlanets.includes(timeFactors.planetaryDay.planet)) {
          planetaryDayScore = Math.min(1.0, planetaryDayScore + 0.3);
        }
        
        if (saucePlanets.includes(timeFactors.planetaryHour.planet)) {
          planetaryHourScore = Math.min(1.0, planetaryHourScore + 0.3);
        }
      }
      
      // Calculate final match score with weights - increased planetary influence
      const weights = {
        elemental: 0.45, // Ensures elemental compatibility with cuisine
        planetaryDay: 0.35, // Increased influence of planetary day
        planetaryHour: 0.20 // Increased influence of planetary hour
      };
      
      const finalScore = (
        elementalMatchScore * weights.elemental +
        planetaryDayScore * weights.planetaryDay +
        planetaryHourScore * weights.planetaryHour
      );
      
      return {
        ...sauce,
        id: sauce.name?.replace(/\s+/g, '-').toLowerCase() || `sauce-${index}`, // Ensure each sauce has an id
        matchPercentage: Math.round(getSafeScore(finalScore) * 100),
        elementalMatchScore: Math.round(getSafeScore(elementalMatchScore) * 100),
        planetaryDayScore: Math.round(planetaryDayScore * 100),
        planetaryHourScore: Math.round(planetaryHourScore * 100)
      };
    });
    
    // Sort sauces by match percentage in descending order
    const sortedSauces = saucesWithMatches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5); // Return top 5 sauces
    
    return sortedSauces;
  };

  useEffect(() => {
    // Define the async function outside the useEffect body
    loadCuisines();
  }, [currentMomentElementalProfile, currentZodiac, lunarPhase]);

  // Move the async function outside the useEffect
  async function loadCuisines() {
    try {
      setLoading(true);
      // Load all cuisines from a local data file
      const allCuisines = cuisines;
      
      // Convert cuisines object to array with proper ElementalItem structure
      const cuisinesArray = Object.entries(allCuisines).map(([id, cuisine]) => ({
        id,
        name: cuisine.name || id,
        elementalProperties: cuisine.elementalProperties || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        description: cuisine.description || '',
        astrologicalInfluences: cuisine.astrologicalInfluences || []
      }));
      
      setCuisines(cuisinesArray);
      
      // Transform cuisines into their alchemical representation for compatibility calculation
      const transformed = transformCuisines(
        cuisinesArray,
        planetaryPositions as Record<string, unknown>,
        isDaytime,
        currentZodiac as ZodiacSign || 'aries',
        lunarPhase as LunarPhase || 'new moon'
      );
      
      // Sort by alchemical compatibility with current moment
      const sorted = sortByAlchemicalCompatibility(
        transformed,
        currentMomentElementalProfile
      );
      
      setTransformedCuisines(sorted);
      
      // Don't automatically select a cuisine
      // instead, just load the top recommended sauces
      if (sorted.length > 0) {
        const topSauces = generateTopSauceRecommendations();
        setTopRecommendedSauces(topSauces);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load cuisine data');
      setLoading(false);
      console.error('Error loading cuisines:', err);
    }
  }

  const handleCuisineSelect = (cuisineId: string) => {
    if (selectedCuisine === cuisineId) {
      // If already selected, toggle showing details
      setShowCuisineDetails(!showCuisineDetails);
      return;
    }
    
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    
    // Find selected cuisine from the cuisines list
    const selectedCuisineData = cuisinesList.find(c => c.id === cuisineId);
    if (selectedCuisineData) {
      // Reset recipe expansion state
      setExpandedRecipes({});
      setShowAllRecipes(false);
      
      // Get recipes for the selected cuisine
      const recipes = getRecipesForCuisineMatch(selectedCuisineData.name, allRecipesData || [], 10);
      
      // Remove duplicates by name
      const uniqueRecipes = recipes.filter((recipe, index, self) => 
        index === self.findIndex((r) => r.name === recipe.name)
      );
      
      // Sort recipes by match score (high to low)
      const sortedRecipes = [...uniqueRecipes].sort((a, b) => 
        (b.matchScore || 0) - (a.matchScore || 0)
      );
      
      setCuisineRecipes(sortedRecipes);
      
      // Generate sauce recommendations based on the cuisine
      const sauces = generateSauceRecommendationsForCuisine(selectedCuisineData.name);
      setSauceRecommendations(sauces);
    }
  };

  const toggleRecipeExpansion = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedRecipes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSauceExpansion = (index: number) => {
    setExpandedSauces(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSauceCard = (sauceId: string) => {
    setExpandedSauceCards(prev => ({
      ...prev,
      [sauceId]: !prev[sauceId]
    }));
  };

  // Get sauce recommendations that pair well with a specific cuisine
  const generateSauceRecommendationsForCuisine = (cuisineName: string) => {
    const saucesArray = allSauces ? Object.values(allSauces) : [];
    
    // Get current time factors
    const { getTimeFactors } = require('@/types/time');
    const timeFactors = getTimeFactors();
    
    // Get the cuisine's elemental profile
    const cuisine = Object.values(cuisines).find(c => c.name.toLowerCase() === cuisineName.toLowerCase());
    if (!cuisine || !cuisine.elementalProperties) {
      return [];
    }
    
    // Determine if it's daytime (between 6am and 6pm)
    const isDaytime = () => {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18;
    };
    
    // Map planets to their elemental influences (diurnal and nocturnal elements)
    const planetaryElements: Record<string, { diurnal: string, nocturnal: string }> = {
      'Sun': { diurnal: 'Fire', nocturnal: 'Fire' },
      'Moon': { diurnal: 'Water', nocturnal: 'Water' },
      'Mercury': { diurnal: 'Air', nocturnal: 'Earth' },
      'Venus': { diurnal: 'Water', nocturnal: 'Earth' },
      'Mars': { diurnal: 'Fire', nocturnal: 'Water' },
      'Jupiter': { diurnal: 'Air', nocturnal: 'Fire' },
      'Saturn': { diurnal: 'Air', nocturnal: 'Earth' },
      'Uranus': { diurnal: 'Water', nocturnal: 'Air' },
      'Neptune': { diurnal: 'Water', nocturnal: 'Water' },
      'Pluto': { diurnal: 'Earth', nocturnal: 'Water' }
    };
    
    // Convert sauces to the format required by the match calculation
    const saucesWithMatches = saucesArray.map((sauce, index) => {
      // Calculate elemental match between sauce and cuisine
      const elementalMatchScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties,
        cuisine.elementalProperties as ElementalProperties
      );
      
      // Calculate planetary day and hour influence based on elemental properties
      let planetaryDayScore = 0.5; // Neutral base score
      let planetaryHourScore = 0.5; // Neutral base score
      
      if (sauce.elementalProperties) {
        // Get the planets' elemental influences
        const dayPlanet = timeFactors.planetaryDay.planet;
        const hourPlanet = timeFactors.planetaryHour.planet;
        
        if (planetaryElements[dayPlanet]) {
          // For planetary day, BOTH diurnal and nocturnal elements influence all day
          const dayDiurnalElement = planetaryElements[dayPlanet].diurnal;
          const dayNocturnalElement = planetaryElements[dayPlanet].nocturnal;
          
          // Calculate how much of each planetary element is present in the sauce
          const diurnalMatch = sauce.elementalProperties[dayDiurnalElement] || 0;
          const nocturnalMatch = sauce.elementalProperties[dayNocturnalElement] || 0;
          
          // Calculate score - both elements are equally important for planetary day
          planetaryDayScore = (diurnalMatch + nocturnalMatch) / 2;
        }
        
        if (planetaryElements[hourPlanet]) {
          // For planetary hour, use diurnal element during day, nocturnal at night
          const currentlyDaytime = isDaytime();
          const relevantElement = currentlyDaytime ? 
            planetaryElements[hourPlanet].diurnal : 
            planetaryElements[hourPlanet].nocturnal;
          
          // Calculate how much of the relevant element is present in the sauce
          planetaryHourScore = sauce.elementalProperties[relevantElement] || 0;
        }
      }
      
      // If the sauce has a direct planetary affinity, give bonus points
      if (sauce.astrologicalAffinities?.planets && sauce.astrologicalAffinities.planets.length > 0) {
        const saucePlanets = sauce.astrologicalAffinities.planets.map((p: string) => 
          typeof p === 'string' ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p
        );
        
        if (saucePlanets.includes(timeFactors.planetaryDay.planet)) {
          planetaryDayScore = Math.min(1.0, planetaryDayScore + 0.3);
        }
        
        if (saucePlanets.includes(timeFactors.planetaryHour.planet)) {
          planetaryHourScore = Math.min(1.0, planetaryHourScore + 0.3);
        }
      }
      
      // Calculate final match score with weights - increased planetary influence
      const weights = {
        elemental: 0.45, // Ensures elemental compatibility with cuisine
        planetaryDay: 0.35, // Increased influence of planetary day
        planetaryHour: 0.20 // Increased influence of planetary hour
      };
      
      const finalScore = (
        elementalMatchScore * weights.elemental +
        planetaryDayScore * weights.planetaryDay +
        planetaryHourScore * weights.planetaryHour
      );
      
      return {
        ...sauce,
        matchPercentage: Math.round(getSafeScore(finalScore) * 100),
        elementalMatchScore: Math.round(getSafeScore(elementalMatchScore) * 100),
        planetaryDayScore: Math.round(planetaryDayScore * 100),
        planetaryHourScore: Math.round(planetaryHourScore * 100)
      };
    });
    
    // Sort sauces by match percentage in descending order
    const sortedSauces = saucesWithMatches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5); // Return top 5 sauces
    
    return sortedSauces;
  };

  // Add an effect to load all recipes when component mounts
  useEffect(() => {
    async function loadAllRecipes() {
      try {
        const recipes = await getAllRecipes();
        setAllRecipesData(recipes);
      } catch (error) {
        console.error("Failed to load recipes:", error);
        setError("Failed to load recipes. Please try again later.");
      }
    }
    
    loadAllRecipes();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading cuisine recommendations...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>;
  }

  // Get the currently selected cuisine data
  const selectedCuisineData = cuisinesList.find(c => c.id === selectedCuisine);
  
  // Get the compatibility score for the selected cuisine
  const selectedCuisineScore = transformedCuisines.find(
    tc => tc.id === selectedCuisine
  )?.compatibilityScore || 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-3">Celestial Cuisine Guide</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {transformedCuisines.slice(0, 9).map((cuisine) => {
          const cuisineData = cuisinesList.find(c => c.id === cuisine.id);
          if (!cuisineData) return null;
          
          // Calculate match percentage
          const matchPercentage = cuisine.compatibilityScore 
            ? Math.round(cuisine.compatibilityScore * 100) 
            : 50;
          
          return (
            <div 
              key={cuisine.id}
              className={`rounded border p-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCuisine === cuisine.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">{cuisineData.name}</h3>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(matchPercentage)}`}>
                  {matchPercentage}%
                </span>
              </div>
              
              {/* Only show elemental icons as a simple visual */}
              <div className="flex space-x-1">
                {cuisineData.elementalProperties.Fire >= 0.3 && <Flame size={14} className="text-red-500" />}
                {cuisineData.elementalProperties.Water >= 0.3 && <Droplets size={14} className="text-blue-500" />}
                {cuisineData.elementalProperties.Earth >= 0.3 && <Mountain size={14} className="text-green-500" />}
                {cuisineData.elementalProperties.Air >= 0.3 && <Wind size={14} className="text-yellow-500" />}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Display expanded details for selected cuisine */}
      {selectedCuisineData && showCuisineDetails && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{selectedCuisineData.name} Cuisine</h3>
            <span className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(
              (transformedCuisines.find(c => c.id === selectedCuisine)?.compatibilityScore || 0.5) * 100
            )}`}>
              {Math.round((transformedCuisines.find(c => c.id === selectedCuisine)?.compatibilityScore || 0.5) * 100)}% match
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{selectedCuisineData.description}</p>
          
          {/* Recipe Recommendations - Shown Immediately */}
          {cuisineRecipes.length > 0 ? (
            <div className="mt-2">
              <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Recipes</h4>
              <div className="grid grid-cols-2 gap-2">
                {cuisineRecipes.slice(0, showAllRecipes ? undefined : 5).map((recipe, index) => (
                  <div 
                    key={index} 
                    className="border rounded p-2 bg-white cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={(event) => toggleRecipeExpansion(index, event as React.MouseEvent)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="font-medium text-sm">{recipe.name}</h5>
                      {renderScoreBadge(recipe.matchPercentage / 100, recipe.hasDualMatch)}
                    </div>
                    <p className="text-xs text-gray-600 truncate" title={recipe.description}>
                      {recipe.description}
                    </p>
                    
                    {/* Expanded recipe details */}
                    {expandedRecipes[index] && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex space-x-1 mb-1">
                          {recipe.elementalProperties?.Fire >= 0.3 && <Flame size={12} className="text-red-500" />}
                          {recipe.elementalProperties?.Water >= 0.3 && <Droplets size={12} className="text-blue-500" />}
                          {recipe.elementalProperties?.Earth >= 0.3 && <Mountain size={12} className="text-green-500" />}
                          {recipe.elementalProperties?.Air >= 0.3 && <Wind size={12} className="text-yellow-500" />}
                        </div>
                        
                        {recipe.ingredients && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Ingredients:</h6>
                            <ul className="pl-4 list-disc">
                              {recipe.ingredients.map((ingredient, i) => (
                                <li key={i}>
                                  {typeof ingredient === 'string' 
                                    ? ingredient 
                                    : `${ingredient.amount} ${ingredient.unit} ${ingredient.name}${ingredient.preparation ? `, ${ingredient.preparation}` : ''}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Added Procedure section - check for multiple possible property names */}
                        {(recipe.instructions || recipe.preparationSteps || recipe.procedure) && (
                          <div className="mt-2">
                            <h6 className="font-medium mb-1">Procedure:</h6>
                            <ol className="pl-4 list-decimal">
                              {(recipe.instructions || recipe.preparationSteps || recipe.procedure || []).map((step, i) => {
                                // If we have many steps, only show first 3 when not fully expanded
                                const stepsToShow = (recipe.instructions || recipe.preparationSteps || recipe.procedure || []).length > 6 ? 3 : 6;
                                if (!expandedRecipes[`${index}-steps`] && i >= stepsToShow) return null;
                                return (
                                  <li key={i}>{step}</li>
                                );
                              })}
                            </ol>
                            
                            {/* Show expand button if there are more than 6 steps */}
                            {(recipe.instructions || recipe.preparationSteps || recipe.procedure || []).length > 6 && (
                              <button
                                className="text-xs text-blue-500 mt-1 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRecipes(prev => ({
                                    ...prev,
                                    [`${index}-steps`]: !prev[`${index}-steps`]
                                  }));
                                }}
                              >
                                {expandedRecipes[`${index}-steps`] ? "Show fewer steps" : "Show all steps"}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Additional recipe information */}
                        {recipe.cookTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Cooking time: </span>
                            <span>{recipe.cookTime}</span>
                          </div>
                        )}
                        
                        {recipe.prepTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Prep time: </span>
                            <span>{recipe.prepTime}</span>
                          </div>
                        )}
                        
                        {recipe.servingSize && (
                          <div className="mt-1">
                            <span className="text-gray-500">Servings: </span>
                            <span>{recipe.servingSize}</span>
                          </div>
                        )}
                        
                        {recipe.dietaryInfo && recipe.dietaryInfo.length > 0 && (
                          <div className="mt-1">
                            <span className="text-gray-500">Dietary: </span>
                            <span>{Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo.join(', ') : recipe.dietaryInfo}</span>
                          </div>
                        )}
                        
                        {recipe.culturalNotes && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Cultural Notes:</h6>
                            <p>{recipe.culturalNotes}</p>
                          </div>
                        )}
                        
                        {recipe.pairingSuggestions && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Pairs Well With:</h6>
                            <p>{Array.isArray(recipe.pairingSuggestions) ? recipe.pairingSuggestions.join(', ') : recipe.pairingSuggestions}</p>
                          </div>
                        )}
                        
                        {recipe.flavorProfile && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Flavor Profile:</h6>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(recipe.flavorProfile).map(([flavor, value]) => 
                                value > 0.3 ? (
                                  <span key={flavor} className="px-1 bg-gray-100 rounded text-gray-700">
                                    {flavor}: {Math.round(value * 100)}%
                                  </span>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                        
                        {recipe.astrologicalInfluences && recipe.astrologicalInfluences.length > 0 && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Astrological Influences:</h6>
                            <p>{Array.isArray(recipe.astrologicalInfluences) ? recipe.astrologicalInfluences.join(', ') : recipe.astrologicalInfluences}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {cuisineRecipes.length > 5 && (
                <button 
                  className="text-xs text-blue-500 mt-2 hover:underline"
                  onClick={() => setShowAllRecipes(!showAllRecipes)}
                >
                  {showAllRecipes ? 'Show Less' : `Show All Recipes (${cuisineRecipes.length})`}
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No recipes available for this cuisine.</div>
          )}
          
          {/* Sauce Recommendations - Shown after recipes */}
          {sauceRecommendations.length > 0 && (
            <div className="mt-4 pt-2 border-t border-gray-100">
              <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Recommended Sauces</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sauceRecommendations.slice(0, showAllSauces ? undefined : 6).map((sauce, index) => (
                  <div 
                    key={index} 
                    className="border rounded p-4 bg-gray-50 cursor-pointer hover:shadow-md transition-all duration-200 min-h-[180px] flex flex-col"
                    onClick={() => toggleSauceCard(sauce.id || `sauce-${index}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm leading-tight mr-1 max-w-[75%]">{sauce.name}</h5>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.matchPercentage/100)}`}>
                        {sauce.matchPercentage}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 line-clamp-4 grow" title={sauce.description}>
                      {sauce.description}
                    </p>
                    
                    {/* Expanded sauce details */}
                    {expandedSauceCards[sauce.id || `sauce-${index}`] && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex space-x-1 mb-1">
                          {sauce.elementalProperties?.Fire >= 0.3 && <Flame size={12} className="text-red-500" />}
                          {sauce.elementalProperties?.Water >= 0.3 && <Droplets size={12} className="text-blue-500" />}
                          {sauce.elementalProperties?.Earth >= 0.3 && <Mountain size={12} className="text-green-500" />}
                          {sauce.elementalProperties?.Air >= 0.3 && <Wind size={12} className="text-yellow-500" />}
                        </div>
                        
                        {/* Display match score breakdown */}
                        <div className="mt-2 mb-2 space-y-1">
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Elemental Match:</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.elementalMatchScore/100)}`}>
                              {sauce.elementalMatchScore}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Planetary Day Match:</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.planetaryDayScore/100)}`}>
                              {sauce.planetaryDayScore}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Planetary Hour Match:</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.planetaryHourScore/100)}`}>
                              {sauce.planetaryHourScore}%
                            </span>
                          </div>
                        </div>
                        
                        {sauce.ingredients && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Ingredients:</h6>
                            <ul className="pl-4 list-disc">
                              {sauce.ingredients.map((ingredient: string, i: number) => (
                                <li key={i}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Consistently display preparation steps using various possible field names */}
                        {(sauce.preparationSteps || sauce.procedure || sauce.instructions) && (
                          <div className="mt-2">
                            <h6 className="font-medium mb-1">Preparation:</h6>
                            {Array.isArray(sauce.preparationSteps || sauce.procedure || sauce.instructions) ? (
                              <ol className="pl-4 list-decimal">
                                {(sauce.preparationSteps || sauce.procedure || sauce.instructions).map((step: string, i: number) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            ) : (
                              <p>{sauce.preparationSteps || sauce.procedure || sauce.instructions}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Add additional sauce information */}
                        {sauce.prepTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Prep time: </span>
                            <span>{sauce.prepTime}</span>
                          </div>
                        )}
                        
                        {sauce.cookTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Cook time: </span>
                            <span>{sauce.cookTime}</span>
                          </div>
                        )}
                        
                        {sauce.yield && (
                          <div className="mt-1">
                            <span className="text-gray-500">Yield: </span>
                            <span>{sauce.yield}</span>
                          </div>
                        )}
                        
                        {sauce.difficulty && (
                          <div className="mt-1">
                            <span className="text-gray-500">Difficulty: </span>
                            <span>{sauce.difficulty}</span>
                          </div>
                        )}
                        
                        {sauce.storageInstructions && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Storage:</h6>
                            <p>{sauce.storageInstructions}</p>
                          </div>
                        )}
                        
                        {sauce.technicalTips && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Technical Tips:</h6>
                            <p>{sauce.technicalTips}</p>
                          </div>
                        )}
                        
                        {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Culinary Uses:</h6>
                            <ul className="pl-4 list-disc">
                              {Array.isArray(sauce.culinaryUses) ? 
                                sauce.culinaryUses.map((use: string, i: number) => (
                                  <li key={i}>{use}</li>
                                )) : 
                                <li>{sauce.culinaryUses}</li>
                              }
                            </ul>
                          </div>
                        )}
                        
                        {sauce.variants && sauce.variants.length > 0 && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Variants:</h6>
                            <ul className="pl-4 list-disc">
                              {Array.isArray(sauce.variants) ? 
                                sauce.variants.map((variant: string, i: number) => (
                                  <li key={i}>{variant}</li>
                                )) : 
                                <li>{sauce.variants}</li>
                              }
                            </ul>
                          </div>
                        )}
                        
                        {sauce.pairsWith && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Pairs Well With:</h6>
                            {Array.isArray(sauce.pairsWith) ? (
                              <ul className="pl-4 list-disc">
                                {sauce.pairsWith.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>{sauce.pairsWith}</p>
                            )}
                          </div>
                        )}
                        
                        {sauce.usage && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Usage:</h6>
                            <p>{sauce.usage}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {sauceRecommendations.length > 6 && (
                <button 
                  className="text-xs text-blue-500 mt-2 hover:underline"
                  onClick={() => setShowAllSauces(!showAllSauces)}
                >
                  {showAllSauces ? 'Show Less' : `Show All Sauces (${sauceRecommendations.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Top Recommended Sauces Based on Current Astrological State - Always visible */}
      {topRecommendedSauces.length > 0 && (
        <div className="mt-4 pt-2 border-t border-gray-100">
          <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">
            Celestially Aligned Sauces
            <span className="ml-1 text-gray-400 normal-case font-normal">(based on current astrological state)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {topRecommendedSauces.slice(0, 8).map((sauce, index) => (
              <div 
                key={index} 
                className="border rounded p-4 bg-gray-50 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col min-h-[180px]"
                onClick={() => toggleSauceCard(sauce.id || `top-sauce-${index}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm leading-tight mr-1 max-w-[75%]">{sauce.name}</h5>
                  <span className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${getMatchScoreClass(sauce.matchPercentage/100)}`}>
                    {sauce.matchPercentage}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 line-clamp-4 grow" title={sauce.description}>
                  {sauce.description}
                </p>
                
                {/* Expanded sauce details */}
                {expandedSauceCards[sauce.id || `top-sauce-${index}`] && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    <div className="flex space-x-1 mb-1">
                      {sauce.elementalProperties?.Fire >= 0.3 && <Flame size={12} className="text-red-500" />}
                      {sauce.elementalProperties?.Water >= 0.3 && <Droplets size={12} className="text-blue-500" />}
                      {sauce.elementalProperties?.Earth >= 0.3 && <Mountain size={12} className="text-green-500" />}
                      {sauce.elementalProperties?.Air >= 0.3 && <Wind size={12} className="text-yellow-500" />}
                    </div>
                    
                    {/* Display match score breakdown */}
                    <div className="mt-2 mb-2 space-y-1">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Elemental Match:</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.elementalMatchScore/100)}`}>
                          {sauce.elementalMatchScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Planetary Day Match:</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.planetaryDayScore/100)}`}>
                          {sauce.planetaryDayScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Planetary Hour Match:</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.planetaryHourScore/100)}`}>
                          {sauce.planetaryHourScore}%
                        </span>
                      </div>
                    </div>
                    
                    {sauce.ingredients && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Ingredients:</h6>
                        <ul className="pl-4 list-disc">
                          {sauce.ingredients.map((ingredient: string, i: number) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Consistently display preparation steps using various possible field names */}
                    {(sauce.preparationSteps || sauce.procedure || sauce.instructions) && (
                      <div className="mt-2">
                        <h6 className="font-medium mb-1">Preparation:</h6>
                        {Array.isArray(sauce.preparationSteps || sauce.procedure || sauce.instructions) ? (
                          <ol className="pl-4 list-decimal">
                            {(sauce.preparationSteps || sauce.procedure || sauce.instructions).map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        ) : (
                          <p>{sauce.preparationSteps || sauce.procedure || sauce.instructions}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Add additional sauce information */}
                    {sauce.prepTime && (
                      <div className="mt-1">
                        <span className="text-gray-500">Prep time: </span>
                        <span>{sauce.prepTime}</span>
                      </div>
                    )}
                    
                    {sauce.cookTime && (
                      <div className="mt-1">
                        <span className="text-gray-500">Cook time: </span>
                        <span>{sauce.cookTime}</span>
                      </div>
                    )}
                    
                    {sauce.yield && (
                      <div className="mt-1">
                        <span className="text-gray-500">Yield: </span>
                        <span>{sauce.yield}</span>
                      </div>
                    )}
                    
                    {sauce.difficulty && (
                      <div className="mt-1">
                        <span className="text-gray-500">Difficulty: </span>
                        <span>{sauce.difficulty}</span>
                      </div>
                    )}
                    
                    {sauce.storageInstructions && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Storage:</h6>
                        <p>{sauce.storageInstructions}</p>
                      </div>
                    )}
                    
                    {sauce.technicalTips && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Technical Tips:</h6>
                        <p>{sauce.technicalTips}</p>
                      </div>
                    )}
                    
                    {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Culinary Uses:</h6>
                        <ul className="pl-4 list-disc">
                          {Array.isArray(sauce.culinaryUses) ? 
                            sauce.culinaryUses.map((use: string, i: number) => (
                              <li key={i}>{use}</li>
                            )) : 
                            <li>{sauce.culinaryUses}</li>
                          }
                        </ul>
                      </div>
                    )}
                    
                    {sauce.variants && sauce.variants.length > 0 && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Variants:</h6>
                        <ul className="pl-4 list-disc">
                          {Array.isArray(sauce.variants) ? 
                            sauce.variants.map((variant: string, i: number) => (
                              <li key={i}>{variant}</li>
                            )) : 
                            <li>{sauce.variants}</li>
                          }
                        </ul>
                      </div>
                    )}
                    
                    {sauce.pairsWith && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Pairs Well With:</h6>
                        {Array.isArray(sauce.pairsWith) ? (
                          <ul className="pl-4 list-disc">
                            {sauce.pairsWith.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{sauce.pairsWith}</p>
                        )}
                      </div>
                    )}
                    
                    {sauce.usage && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Usage:</h6>
                        <p>{sauce.usage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 