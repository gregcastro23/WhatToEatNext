'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAstrologicalState } from '../hooks/useAstrologicalState';
import { Flame, Droplets, Mountain, Wind, GalleryVertical, Sparkles, ArrowLeft, Moon, sunIcon, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cuisines } from '../data/cuisines';
import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { AlchemicalProperty } from '../constants/planetaryElements';
import styles from './CuisineRecommender.module.css';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { transformCuisines, sortByAlchemicalCompatibility } from '../utils/alchemicalTransformationUtils';
import { ZodiacSign, LunarPhase, LunarPhaseWithSpaces, ElementalProperties } from '../types/alchemy';
import { cuisineFlavorProfiles, getRecipesForCuisineMatch } from '../data/cuisineFlavorProfiles';
import { getAllRecipes } from '../data/recipes';
import { SpoonacularService } from '../services/SpoonacularService';
import { LocalRecipeService } from '../services/LocalRecipeService';
import { sauceRecommendations as sauceRecsData, SauceRecommendation, allSauces, Sauce } from '../data/sauces';
import type { Recipe } from '../types/recipe';
// Import similarity from ml-distance
import { similarity } from 'ml-distance';
import RecipeRecommendations from './Recipe/RecipeRecommendations';
// Import the local cuisines data as fallback
import { cuisinesMap } from '../data/cuisines/index';
import { CUISINES } from '../data/cuisines/index';

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
  const numScore = typeof score === 'number' ? score : parseFloat(String(score));
  return !isNaN(numScore) ? numScore : 0.5;
};

// Element to icon mapping
const ElementIcons = {
  Fire: Flame,
  Water: Droplets,
  Earth: Mountain,
  Air: Wind,
};

// Memoized element icon component
const ElementIcon = memo(({ element }: { element: keyof typeof ElementIcons }) => {
  const IconComponent = ElementIcons[element] || Flame;
  return <IconComponent size={18} />;
});
ElementIcon.displayName = 'ElementIcon';

// Memoized score badge component
const ScoreBadge = memo(({ score, hasDualMatch = false }: { score: number, hasDualMatch?: boolean }) => {
  const getMatchScoreClass = (score: number) => {
    if (score >= 0.8) return styles.highMatch;
    if (score >= 0.6) return styles.goodMatch;
    if (score >= 0.4) return styles.moderateMatch;
    return styles.lowMatch;
  };

  return (
    <div className={`${styles.scoreBadge} ${getMatchScoreClass(score)}`}>
      {hasDualMatch && <Sparkles size={12} className={styles.dualMatchIcon} />}
      {Math.round(score * 100)}%
    </div>
  );
});
ScoreBadge.displayName = 'ScoreBadge';

// Memoized cuisine card component
const CuisineCard = memo(({ 
  cuisine, 
  matchScore, 
  onClick,
  isSelected
}: { 
  cuisine: Cuisine, 
  matchScore: number,
  onClick: () => void,
  isSelected: boolean
}) => {
  return (
    <div 
      className={`${styles.cuisineCard} ${isSelected ? styles.selectedCuisine : ''}`} 
      onClick={onClick}
    >
      <div className={styles.cuisineHeader}>
        <h3 className={styles.cuisineName}>{cuisine.name}</h3>
        <ScoreBadge score={matchScore} />
      </div>
      <p className={styles.description}>{cuisine.description}</p>
      <div className={styles.elementalDisplay}>
        {Object.entries(cuisine.elementalProperties).map(([element, value]) => (
          <div key={element} className={styles.elementTag}>
            <ElementIcon element={element as keyof typeof ElementIcons} />
            <span>{Math.round(value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
});
CuisineCard.displayName = 'CuisineCard';

function CuisineRecommender() {
  // Provide fallback values in case AlchemicalContext is not available
  const alchemicalContext = useAlchemical();
  const isDaytime = alchemicalContext?.isDaytime ?? true;
  const planetaryPositions = alchemicalContext?.planetaryPositions ?? {};
  const state = alchemicalContext?.state ?? {
    astrologicalState: {
      sunSign: 'aries',
      lunarPhase: 'new moon'
    }
  };
  const currentZodiac = state.astrologicalState?.sunSign;
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
    (alchemicalContext?.state?.elementalState as ElementalProperties) || 
    {
      Fire: 0.25, 
      Water: 0.25, 
      Earth: 0.25, 
      Air: 0.25
    }
  );
  const [matchingRecipes, setMatchingRecipes] = useState<any[]>([]);

  // Memoize the elemental profile calculations
  const calculatedElementalProfile = useMemo(() => {
    // Use type assertion to avoid type errors
    const safeState = state?.astrologicalState || {};
    if (currentZodiac) {
      // Calculate based on zodiac if we have it
      return calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign, lunarPhase as LunarPhase);
    }
    
    // Default empty values
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }, [state.astrologicalState, currentZodiac, lunarPhase, planetaryPositions]);

  // Update current moment elemental profile when calculated profile changes
  useEffect(() => {
    setCurrentMomentElementalProfile(calculatedElementalProfile);
  }, [calculatedElementalProfile]);

  // Memoize cuisine similarity calculation
  const calculateCuisineSimilarity = useCallback((cuisine1: ElementalProperties, cuisine2: ElementalProperties) => {
    try {
      // Convert element objects to vectors for cosine similarity
      const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
      const vector1 = elements.map(e => cuisine1[e] || 0);
      const vector2 = elements.map(e => cuisine2[e] || 0);
      
      // Calculate cosine similarity - value between 0 and 1
      return similarity.cosine(vector1, vector2);
    } catch (error) {
      console.error("Error calculating cuisine similarity:", error);
      return 0.5; // Default to medium similarity on error
    }
  }, []);

  // Memoize elemental match calculation
  const calculateElementalMatch = useCallback((
    recipeElements: ElementalProperties,
    userElements: ElementalProperties
  ): number => {
    // Ensure both objects have the same keys for comparison
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    
    // Calculate cosine similarity as the match score
    return calculateCuisineSimilarity(recipeElements, userElements);
  }, [calculateCuisineSimilarity]);

  // Generate sauce recommendations - memoized for performance
  const generateTopSauceRecommendations = useCallback(() => {
    if (!allSauces || Object.keys(allSauces).length === 0) {
      console.warn("No sauce data available");
      return [];
    }

    // Create an array of sauce objects with scores
    const scoredSauces = Object.entries(allSauces).map(([id, sauce]) => {
      // Calculate elemental match between sauce and current moment
      const elementalScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties,
        currentMomentElementalProfile
      );
      
      // Check for astrological matches (zodiac and lunar)
      const hasZodiacMatch = !sauce.astrologicalInfluences || 
        sauce.astrologicalInfluences.includes(currentZodiac as string);
      
      const hasLunarMatch = true; // Simplify by assuming all sauces match lunar phase
      
      // Combine scores with weights (elemental: 60%, zodiac: 25%, lunar: 15%)
      const totalScore = (elementalScore * 0.6) + 
        (hasZodiacMatch ? 0.25 : 0) + 
        (hasLunarMatch ? 0.15 : 0);
      
      return {
        id,
        name: sauce.name,
        description: sauce.description,
        elementalProperties: sauce.elementalProperties,
        score: totalScore,
        hasZodiacMatch,
        hasLunarMatch
      };
    });
    
    // Sort by score (highest first) and take top 5
    return scoredSauces
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [currentMomentElementalProfile, currentZodiac, calculateElementalMatch]);

  // Memoize top sauce recommendations to avoid recalculations
  const topSauceRecommendations = useMemo(() => {
    return generateTopSauceRecommendations();
  }, [currentMomentElementalProfile, currentZodiac]); 

  // Update topRecommendedSauces when recommendations change
  useEffect(() => {
    setTopRecommendedSauces(topSauceRecommendations);
  }, [topSauceRecommendations]);

  // Update cuisineRecipes whenever matchingRecipes changes
  useEffect(() => {
    setCuisineRecipes(matchingRecipes);
  }, [matchingRecipes]);

  // Calculate elemental profile from zodiac and lunar phase
  const calculateElementalProfileFromZodiac = useCallback((zodiacSign: ZodiacSign, lunarPhase?: LunarPhase): ElementalProperties => {
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
  }, [planetaryPositions]);
  
  // Calculate elemental contributions from planetary positions
  const calculateElementalContributionsFromPlanets = useCallback((positions: Record<string, unknown>): ElementalProperties => {
    const contributions: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    // Planet to element mapping
    const planetElementMap: Record<string, keyof ElementalProperties> = {
      'sun': 'Fire',
      'Moon': 'Water',
      'mercury': 'Air',
      'venus': 'Earth',
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
        // Weight by planet importance (sun and Moon have higher influence)
        const weight = (planet === 'sun' || planet === 'Moon') ? 0.3 : 0.1;
        contributions[element] += weight;
      }
    }
    
    return contributions;
  }, []);

  // Memoize load cuisines function to prevent recreation on renders
  const loadCuisines = useCallback(async () => {
    try {
      setLoading(true);
      
      // First attempt to use provided cuisines data
      let cuisinesData = cuisines;
      
      // If cuisines data is not available, use local fallback
      if (!cuisinesData || Object.keys(cuisinesData).length === 0) {
        console.log("Using local cuisine data as fallback");
        cuisinesData = CUISINES;
      }
      
      // Convert cuisines object to array with ids
      const cuisinesArray = Object.entries(cuisinesData)
        .map(([id, cuisine]) => ({
          id,
          ...cuisine,
          // Ensure required properties have default values if missing
          description: cuisine.description || '',
          elementalProperties: cuisine.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          astrologicalInfluences: cuisine.astrologicalInfluences || []
        })) as Cuisine[];
      
      if (cuisinesArray.length === 0) {
        throw new Error("No cuisines found in data");
      }
      
      // Set the cuisines list
      setCuisines(cuisinesArray);
      
      // Transform cuisines for alchemical calculations
      try {
        // Convert cuisines to ElementalItem format for transformation
        const elementalCuisines = cuisinesArray.map(cuisine => ({
          id: cuisine.id,
          name: cuisine.name,
          elementalProperties: cuisine.elementalProperties as Record<string, number>,
        })) as ElementalItem[];
        
        // Convert planetary positions to a simple Record<string, number>
        const simplePlanetPositions: Record<string, number> = {};
        Object.entries(planetaryPositions).forEach(([planet, position]) => {
          simplePlanetPositions[planet] = 1.0; // Default influence value
        });
        
        const transformedItems = await transformCuisines(
          elementalCuisines, 
          simplePlanetPositions,
          isDaytime,
          currentZodiac,
          lunarPhase as LunarPhaseWithSpaces
        );
        setTransformedCuisines(transformedItems);
      } catch (err) {
        console.error("Error transforming cuisines:", err);
        // Still continue with basic cuisine data
      }
      
      // Set loading to false
      setLoading(false);
    } catch (err) {
      console.error("Error loading cuisines:", err);
      setError(`Failed to load cuisines: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  }, [currentMomentElementalProfile]);

  // Initial load of cuisines
  useEffect(() => {
    loadCuisines();
  }, [loadCuisines]);

  // Generate sauce recommendations for cuisine with useCallback
  const generateSauceRecommendationsForCuisine = useCallback((cuisine: Cuisine): unknown[] => {
    if (!allSauces || Object.keys(allSauces).length === 0 || !cuisine?.elementalProperties) {
      return [];
    }
    
    // Create an array of sauce objects with scores
    const scoredSauces = Object.entries(allSauces).map(([id, sauce]) => {
      // Calculate score based on elemental match between sauce and cuisine
      const elementalScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties,
        cuisine.elementalProperties as ElementalProperties
      );
        
      // Also consider match with current astrological state for best results
      const astroScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties,
        currentMomentElementalProfile
      );
      
      // Combine scores with weights (cuisine match: 70%, astro match: 30%)
      const totalScore = (elementalScore * 0.7) + (astroScore * 0.3);
      
      return {
        id,
        name: sauce.name,
        description: sauce.description,
        elementalProperties: sauce.elementalProperties,
        score: totalScore,
        cuisineMatch: elementalScore,
        astroMatch: astroScore
      };
    });
    
    // Sort by score (highest first) and take top 8
    return scoredSauces
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [calculateElementalMatch, currentMomentElementalProfile]);

  // Handle cuisine selection with useCallback
  const handleCuisineSelect = useCallback((cuisineId: string) => {
    const isAlreadySelected = selectedCuisine === cuisineId;
    
    // Toggle selection: deselect if already selected, otherwise select new cuisine
    const newSelectedCuisine = isAlreadySelected ? null : cuisineId;
    setSelectedCuisine(newSelectedCuisine);
    
    // Reset expanded states when changing selections
    setExpandedRecipes({});
    setExpandedSauces({});
    setShowAllRecipes(false);
    setShowAllSauces(false);
    
    // If a cuisine is being selected, load its recommendations
    if (!isAlreadySelected && cuisineId) {
      try {
        // Find the selected cuisine
        const selectedCuisineData = cuisinesList.find(c => c.id === cuisineId);
        
        if (selectedCuisineData) {
          // First get all recipes, then pass them to the matching function
          getAllRecipes()
            .then(recipes => {
              // Now pass these recipes to the matching function
              const recipesForCuisine = getRecipesForCuisineMatch(
                selectedCuisineData.name,
                recipes
              );
              setMatchingRecipes(recipesForCuisine);
              
              // Generate sauce recommendations for this cuisine
              const sauces = generateSauceRecommendationsForCuisine(selectedCuisineData);
              setSauceRecommendations(sauces);
            })
            .catch(err => {
              console.error("Error getting recipes for cuisine:", err);
            });
        }
      } catch (err) {
        console.error("Error loading recommendations for cuisine:", err);
      }
    }
  }, [selectedCuisine, cuisinesList, currentMomentElementalProfile, generateSauceRecommendationsForCuisine]);

  // Toggle recipe expansion with useCallback
  const toggleRecipeExpansion = useCallback((index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedRecipes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // Toggle sauce expansion with useCallback
  const toggleSauceExpansion = useCallback((index: number) => {
    setExpandedSauces(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // Toggle sauce card with useCallback
  const toggleSauceCard = useCallback((sauceId: string) => {
    setExpandedSauceCards(prev => ({
      ...prev,
      [sauceId]: !prev[sauceId]
    }));
  }, []);

  // Memoize sorted cuisines
  const sortedCuisines = useMemo(() => {
    if (!cuisinesList.length) return [];
    
    // Calculate match scores for each cuisine
    return cuisinesList.map(cuisine => {
      const matchScore = calculateElementalMatch(
        cuisine.elementalProperties as ElementalProperties,
        currentMomentElementalProfile
      );
      
      return {
        cuisine,
        matchScore
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [cuisinesList, calculateElementalMatch, currentMomentElementalProfile]);

  // Toggle showing all recipes
  const toggleShowAllRecipes = useCallback(() => {
    setShowAllRecipes(prev => !prev);
  }, []);

  // Toggle showing all sauces
  const toggleShowAllSauces = useCallback(() => {
    setShowAllSauces(prev => !prev);
  }, []);

  // Toggle cuisine details
  const toggleCuisineDetails = useCallback(() => {
    setShowCuisineDetails(prev => !prev);
  }, []);

  // Filter cuisines by category
  const filterCuisines = useCallback((category: string) => {
    setFilter(category);
  }, []);

  // Show loading state
  if (loading) {
    return <div className={styles.loading}>Loading culinary recommendations...</div>;
  }

  // Show error state
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Astrological Cuisine Recommendations</h2>
      
      <div className={styles.elementalInfo}>
        <h3>Current Elemental Influences</h3>
        <div className={styles.elementalValues}>
          {Object.entries(currentMomentElementalProfile).map(([element, value]) => (
            <div key={element} className={styles.elementValue}>
              <ElementIcon element={element as keyof typeof ElementIcons} />
              <span>{element}: {Math.round(value * 100)}%</span>
              </div>
          ))}
              </div>
      </div>
      
      <div className={styles.filterOptions}>
        <button 
          onClick={() => filterCuisines('all')} 
          className={filter === 'all' ? styles.activeFilter : ''}
        >
          All Cuisines
        </button>
        <button 
          onClick={() => filterCuisines('bestMatch')} 
          className={filter === 'bestMatch' ? styles.activeFilter : ''}
        >
          Best Matches
        </button>
        <button 
          onClick={() => filterCuisines('seasonal')} 
          className={filter === 'seasonal' ? styles.activeFilter : ''}
        >
          Seasonal
        </button>
          </div>
          
      <div className={styles.cuisineList}>
        {sortedCuisines
          .filter(item => {
            if (filter === 'all') return true;
            if (filter === 'bestMatch') return item.matchScore > 0.7;
            if (filter === 'seasonal') {
              // Always include cuisines when in seasonal filter for now
              // since we don't have seasonalPreferences in Cuisine type
              return true;
            }
            return true;
          })
          .map(({ cuisine, matchScore }) => (
            <CuisineCard
              key={cuisine.id}
              cuisine={cuisine}
              matchScore={matchScore}
              onClick={() => handleCuisineSelect(cuisine.id)}
              isSelected={selectedCuisine === cuisine.id}
            />
          ))
        }
          </div>
          
      {selectedCuisine && cuisinesList.find(c => c.id === selectedCuisine) && (
        <div className={styles.recommendationsSection}>
          <button className={styles.backButton} onClick={() => setSelectedCuisine(null)}>
            <ArrowLeft size={16} /> Back to Cuisines
          </button>
          
          <h3 className={styles.recommendationsTitle}>
            {cuisinesList.find(c => c.id === selectedCuisine)?.name} Recommendations
          </h3>
          
          <button 
            className={styles.detailsToggle} 
            onClick={toggleCuisineDetails}
          >
            {showCuisineDetails ? 'Hide Details' : 'Show Details'}
            {showCuisineDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showCuisineDetails && (
            <div className={styles.cuisineDetails}>
              {/* Cuisine details content */}
                          </div>
                        )}
                        
          {/* Recipe recommendations */}
          {cuisineRecipes.length > 0 && (
            <div className={styles.recipesSection}>
              <h4>Recipe Recommendations</h4>
              <div className={styles.recipeList}>
                {cuisineRecipes
                  .slice(0, showAllRecipes ? cuisineRecipes.length : 5)
                  .map((recipe, index) => (
                    <div 
                      key={index} 
                      className={styles.recipeCard}
                      onClick={(e) => toggleRecipeExpansion(index, e)}
                    >
                      {/* Recipe card content */}
                          </div>
                  ))
                }
                          </div>
              
              {cuisineRecipes.length > 5 && (
                <button 
                  className={styles.showMoreButton}
                  onClick={toggleShowAllRecipes}
                >
                  {showAllRecipes ? 'Show Less' : `Show All (${cuisineRecipes.length})`}
                </button>
              )}
                          </div>
                        )}
                        
          {/* Sauce recommendations */}
          {sauceRecommendations.length > 0 && (
            <div className={styles.saucesSection}>
              <h4>Sauce Recommendations</h4>
              <div className={styles.sauceList}>
                {sauceRecommendations
                  .slice(0, showAllSauces ? sauceRecommendations.length : 4)
                  .map((sauce, index) => (
                    <div 
                      key={index} 
                      className={styles.sauceCard}
                      onClick={() => toggleSauceExpansion(index)}
                    >
                      {/* Sauce card content */}
                          </div>
                  ))
                }
                          </div>
              
              {sauceRecommendations.length > 4 && (
                <button 
                  className={styles.showMoreButton}
                  onClick={toggleShowAllSauces}
                >
                  {showAllSauces ? 'Show Less' : `Show All (${sauceRecommendations.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {!selectedCuisine && topRecommendedSauces.length > 0 && (
        <div className={styles.topSaucesSection}>
          <h3>Top Sauce Recommendations for Today</h3>
          <div className={styles.topSauceList}>
            {topRecommendedSauces.map((sauce, index) => (
              <div 
                key={index} 
                className={styles.topSauceCard}
                onClick={() => toggleSauceCard(sauce.id)}
              >
                <h4>{sauce.name}</h4>
                <ScoreBadge 
                  score={sauce.score} 
                  hasDualMatch={sauce.hasZodiacMatch && sauce.hasLunarMatch}
                />
                
                {expandedSauceCards[sauce.id] && (
                  <div className={styles.sauceDetails}>
                    <p>{sauce.description}</p>
                    <div className={styles.elementalDisplay}>
                      {Object.entries(sauce.elementalProperties || {}).map(([element, value]) => (
                        <div key={element} className={styles.elementTag}>
                          <ElementIcon element={element as keyof typeof ElementIcons} />
                          <span>{Math.round(parseFloat(String(value)) * 100)}%</span>
                    </div>
                      ))}
                      </div>
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

// Export as both default and named
export { CuisineRecommender };
export default CuisineRecommender; 