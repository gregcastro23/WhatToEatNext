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

  const cssStyles = styles as unknown as CuisineStyles;

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
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25
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
        } else {
          // Basic transformation with default scoring
          transformed = elementalItems.map(item => ({
            ...item,
            dominantElement: calculateDominantElement(item.elementalProperties),
            gregsEnergy: Math.random() * 0.5 + 0.5, // Random score between 0.5-1.0 as fallback
            transformedElementalProperties: item.elementalProperties,
            dominantPlanets: [],
            planetaryDignities: {}
          }));
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
    if (score >= 0.85) return 'bg-green-100 text-green-800 font-medium';
    if (score >= 0.7) return 'bg-green-50 text-green-700';
    if (score >= 0.5) return 'bg-yellow-50 text-yellow-700';
    if (score >= 0.35) return 'bg-orange-50 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Sort and filter cuisines
  const displayedCuisines = useMemo(() => {
    if (transformedCuisines.length === 0) return [];
    
    // First, sort by alchemical compatibility
    let sorted = sortByAlchemicalCompatibility(transformedCuisines);
    
    // Then apply any filters
    if (filter !== 'all') {
      if (filter === 'zodiac' && currentZodiac) {
        // Filter cuisines by current zodiac sign
        sorted = sorted.filter(cuisine => 
          cuisine.zodiacInfluences?.includes(currentZodiac as ZodiacSign) ||
          Object.values(cuisine.planetaryDignities || {}).some(
            dignity => dignity.favorableZodiacSigns?.includes(currentZodiac)
          )
        );
      } else if (filter === 'lunar' && lunarPhase) {
        // Filter cuisines by current lunar phase
        sorted = sorted.filter(cuisine => 
          cuisine.lunarPhaseInfluences?.includes(lunarPhase as LunarPhase)
        );
      } else if (filter === 'element' && currentZodiac) {
        // Determine dominant element from the current zodiac sign
        const zodiacElementMap: Record<string, string> = {
          aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
          taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
          gemini: 'Air', libra: 'Air', aquarius: 'Air',
          cancer: 'Water', scorpio: 'Water', pisces: 'Water'
        };
        
        const currentElement = zodiacElementMap[currentZodiac];
        if (currentElement) {
          sorted = sorted.filter(cuisine => 
            cuisine.dominantElement === currentElement
          );
        }
      }
    }
    
    return sorted;
  }, [transformedCuisines, filter, currentZodiac, lunarPhase]);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-5 h-5 text-red-400" />;
      case 'Water': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Earth': return <Mountain className="w-5 h-5 text-green-400" />;
      case 'Air': return <Wind className="w-5 h-5 text-purple-400" />;
      default: return null;
    }
  };
  
  const getAlchemicalPropertyIcon = (property: AlchemicalProperty) => {
    return <Sparkles className="w-5 h-5 text-yellow-400" />;
  };
  
  const getLunarPhaseIcon = (phase: LunarPhase) => {
    return <Moon className="w-5 h-5 text-slate-400" />;
  };

  const handleCuisineSelect = (cuisineId: string) => {
    setSelectedCuisine(cuisineId);
    loadRecipesForCuisine(cuisineId);
  };

  const loadRecipesForCuisine = async (cuisineId: string) => {
    try {
      setLoading(true);
      // Find the cuisine in cuisinesMap from the data folder
      const cuisineName = cuisinesList.find(c => c.id === cuisineId)?.name || '';
      
      // Simply use the cuisine ID as is without checking for regional variants
      const matchedRecipes = getRecipesForCuisineMatch(cuisineName, allRecipes, 20);
      
      // Sort recipes by match score
      matchedRecipes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      // Set the recipes
      setCuisineRecipes(matchedRecipes);
      
      // For sauce recommendations, just try to load the current cuisine
      try {
        const cuisineData = await import(`@/data/cuisines/${cuisineId}`);
        
        if (cuisineData && cuisineData[cuisineId] && cuisineData[cuisineId].sauceRecommender) {
          const sauces: any[] = [];
          
          // Extract sauces from the sauce recommender
          Object.entries(cuisineData[cuisineId].sauceRecommender).forEach(([category, recommendations]: [string, any]) => {
            if (category === 'forProtein' || category === 'forVegetable' || category === 'byAstrological') {
              Object.entries(recommendations).forEach(([key, sauceList]: [string, string[]]) => {
                if (Array.isArray(sauceList)) {
                  sauceList.forEach(sauceName => {
                    // Check if the actual sauce details exist in the sauces object
                    const sauceDetails = cuisineData[cuisineId].sauces && 
                                         cuisineData[cuisineId].sauces[sauceName.toLowerCase()];
                    
                    // If sauce details exist, use them; otherwise, create a basic object
                    const sauceObj = sauceDetails ? {
                      name: sauceDetails.name || sauceName,
                      category: category,
                      forItem: key,
                      description: sauceDetails.description || '',
                      ingredients: sauceDetails.keyIngredients || [],
                      culinaryNotes: sauceDetails.preparationNotes || 
                                     (sauceDetails.culinaryUses && 
                                      `Used for: ${sauceDetails.culinaryUses.join(', ')}`) || 
                                     `Pairs well with ${key} in ${cuisineName} cooking.`,
                      variants: sauceDetails.variants || [],
                      technicalTips: sauceDetails.technicalTips || ''
                    } : {
                      name: sauceName,
                      category: category,
                      forItem: key,
                      description: `A sauce from ${cuisineName} cuisine.`,
                      ingredients: [],
                      culinaryNotes: `Typically used with ${key}.`
                    };
                    
                    // Add or update category and forItem properties
                    sauceObj.category = category;
                    sauceObj.forItem = key;
                    
                    // Check if this sauce already exists in our array
                    if (!sauces.some(s => s.name === sauceObj.name)) {
                      sauces.push(sauceObj);
                    }
                  });
                }
              });
            }
          });
          
          // Try to enrich any sauce that still has missing information
          const enrichedSauces = await Promise.all(sauces.map(async (sauce) => {
            // Only try to enrich sauces with missing data
            if (!sauce.ingredients || sauce.ingredients.length === 0) {
              try {
                // Check all cuisine modules for the sauce
                const sauceName = sauce.name.toLowerCase().replace(/\s+/g, '');
                
                // Check if we can find details in the allSauces catalog
                try {
                  const { allSauces } = await import('@/data/sauces');
                  
                  // Try to find the sauce by name (case-insensitive)
                  const sauceDetailsByName = Object.values(allSauces).find(s => 
                    s.name.toLowerCase() === sauce.name.toLowerCase()
                  );
                  
                  if (sauceDetailsByName) {
                    // Update sauce details from the found sauce
                    sauce.ingredients = sauceDetailsByName.keyIngredients || sauce.ingredients;
                    sauce.description = sauceDetailsByName.description || sauce.description;
                    sauce.culinaryNotes = sauceDetailsByName.preparationNotes || 
                                          sauceDetailsByName.technicalTips || 
                                          (sauceDetailsByName.culinaryUses && 
                                           `Used for: ${sauceDetailsByName.culinaryUses.join(', ')}`) || 
                                          sauce.culinaryNotes;
                  }
                } catch (e) {
                  // If sauces module import fails, continue
                  console.warn('Could not load sauce catalog:', e);
                }
                
                // If still no ingredients, use generic but more specific placeholders based on sauce name
                if (!sauce.ingredients || sauce.ingredients.length === 0) {
                  const sauceType = sauce.name.toLowerCase();
                  
                  if (sauceType.includes('chermoula')) {
                    sauce.ingredients = ['Cilantro', 'Parsley', 'Olive oil', 'Lemon juice', 'Garlic', 'Cumin'];
                  } else if (sauceType.includes('harissa')) {
                    sauce.ingredients = ['Chilies', 'Garlic', 'Olive oil', 'Spices', 'Caraway'];
                  } else if (sauceType.includes('peanut')) {
                    sauce.ingredients = ['Peanut butter', 'Tomatoes', 'Onions', 'Ginger', 'Chilies'];
                  } else if (sauceType.includes('duqqa') || sauceType.includes('dukkah')) {
                    sauce.ingredients = ['Nuts', 'Seeds', 'Herbs', 'Spices'];
                  } else {
                    // Default ingredients for any other sauce
                    sauce.ingredients = ['Regional spices', 'Base ingredients', 'Aromatics', 'Regional herbs'];
                  }
                }
              } catch (err) {
                console.warn(`Error enriching sauce ${sauce.name}:`, err);
              }
            }
            
            return sauce;
          }));
          
          setSauceRecommendations(enrichedSauces);
        } else {
          setSauceRecommendations([]);
        }
      } catch (err) {
        // Generate some basic sauce recommendations based on the cuisine name
        const basicSauces = [
          {
            name: `${cuisineName} Dipping Sauce`,
            category: 'forProtein',
            forItem: 'general',
            description: `A simple dipping sauce common in ${cuisineName} cuisine.`,
            ingredients: ['Seasoning', 'Herbs', 'Oil/Vinegar base'],
            culinaryNotes: `Often served with grilled dishes in ${cuisineName} cooking.`
          },
          {
            name: `Traditional ${cuisineName} Sauce`,
            category: 'forVegetable',
            forItem: 'vegetables',
            description: `A traditional sauce used to enhance vegetable dishes in ${cuisineName} cuisine.`,
            ingredients: ['Regional herbs', 'Spices', 'Base liquid'],
            culinaryNotes: 'Adds depth and complexity to simple vegetable dishes.'
          }
        ];
        
        setSauceRecommendations(basicSauces);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setCuisineRecipes([]);
      setSauceRecommendations([]);
    } finally {
      setLoading(false);
    }
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
            <GalleryVertical className="w-5 h-5 mr-2 text-amber-500" />
            Recipe Recommendations
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Explore recipes from {transformedCuisine.name} cuisine that match your preferences
            and current seasonal conditions.
          </p>
          {!loading && cuisineRecipes.length === 0 && (
            <div className="text-center text-gray-500 py-2">
              Loading recipes...
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
                      <span className={`text-xs px-2 py-1 rounded-full ${getMatchScoreClass(recipe.matchScore as number)}`}>
                        {Math.round((recipe.matchScore as number) * 100)}% match
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2 text-xs">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      {recipe.mealType}
                    </span>
                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                      {recipe.season}
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
                  </div>
                  
                  {recipe.ingredients && (
                    <div className="mt-3">
                      <h5 className="text-xs font-medium mb-1">Key Ingredients:</h5>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, expandedRecipes[index] ? recipe.ingredients.length : 3).map((ing: any, i: number) => (
                          <span key={i} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">
                            {typeof ing === 'string' 
                              ? ing 
                              : typeof ing === 'object' 
                                ? (ing.name || Object.keys(ing).join(', '))
                                : String(ing)}
                          </span>
                        ))}
                        {!expandedRecipes[index] && recipe.ingredients.length > 3 && (
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
                      {recipe.instructions && (
                        <div className="mt-2">
                          <h5 className="text-xs font-medium mb-1">Instructions:</h5>
                          <ol className="text-xs text-gray-700 pl-4 list-decimal">
                            {Array.isArray(recipe.instructions) 
                              ? recipe.instructions.map((step: any, i: number) => (
                                  <li key={i} className="mb-1">
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
                      
                      {recipe.tips && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium mb-1">Tips:</h5>
                          <p className="text-xs text-gray-700">{recipe.tips}</p>
                        </div>
                      )}
                      
                      {recipe.nutritionalInfo && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium mb-1">Nutritional Info:</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(recipe.nutritionalInfo).map(([key, value]) => (
                              <span key={key} className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">
                                {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            ))}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Show all cuisines if we have 6 or fewer, otherwise limit to 6 */}
        {displayedCuisines.slice(0, Math.min(displayedCuisines.length, 8)).map((cuisine) => {
          // Check if this cuisine is aligned with current zodiac and lunar phase
          const isZodiacAligned = currentZodiac && cuisine.zodiacInfluences?.includes(currentZodiac as ZodiacSign);
          const isLunarAligned = lunarPhase && cuisine.lunarPhaseInfluences?.includes(lunarPhase as LunarPhase);
          
          return (
            <div 
              key={cuisine.id} 
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                'gregsEnergy' in cuisine && cuisine.gregsEnergy > 0.7 ? 'border-amber-300 bg-amber-50' : 
                isZodiacAligned ? 'border-indigo-200 bg-indigo-50' :
                isLunarAligned ? 'border-slate-200 bg-slate-50' : ''
              }`}
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              <h3 className="font-medium mb-2">{cuisine.name}</h3>
              
              {/* Compatibility score if available */}
              {'gregsEnergy' in cuisine && (
                <div className="mb-2 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.round(cuisine.gregsEnergy * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{Math.round(cuisine.gregsEnergy * 100)}% Compatible</span>
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {cuisine.description}
              </p>
              
              {/* Dominant element and alignment indicators */}
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
                
                {'gregsEnergy' in cuisine && cuisine.gregsEnergy > 0.7 && (
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