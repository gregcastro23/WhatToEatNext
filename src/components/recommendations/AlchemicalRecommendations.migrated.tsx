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

import { AccessTime, Restaurant, WbSunny } from '@mui/icons-material';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  Chip, 
  Divider, 
  Tabs, 
  Tab 
} from '@mui/material';
import React, { useState, useMemo, useEffect } from 'react';
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';


import { 
  ElementalItem, 
  AlchemicalItem 
} from '@/calculations/alchemicalTransformation';
import { 
  ElementalCharacter, 
  AlchemicalProperty 
} from '@/constants/planetaryElements';
import { RulingPlanet } from '@/constants/planets';
import type { Ingredient, Modality } from "@/data/ingredients/types";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import { useServices } from '@/hooks/useServices';
import { 
  ZodiacSign, 
  LunarPhaseWithSpaces,
  PlanetaryAspect,
  ElementalProperties
, Element } from '@/types/alchemy';
import type { CookingMethod } from "@/types/alchemy";
import { PlanetaryPosition } from "@/types/celestial";
import { Recipe } from '@/types/recipe';

// Import constants and types

// Import utils
import { createElementalProperties } from '@/utils/elemental/elementalUtils';
import { determineIngredientModality } from '@/utils/ingredientUtils';
// Import interfaces and types from alchemical transformation

interface AlchemicalRecommendationsProps {
  // If these aren't passed, the component will use current astronomical conditions
  planetPositions?: Record<RulingPlanet, number>;
  isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: { [key: string]: number };
  aspects?: PlanetaryAspect[];
  // Recipe recommendations props
  recipes?: Recipe[];
  recipeCount?: number;
}

const AlchemicalRecommendationsMigrated: React.FC<AlchemicalRecommendationsProps> = ({
  planetPositions,
  isDaytime,
  currentZodiac,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = [],
  recipes = [],
  recipeCount = 3
}) => {
  // Use services instead of contexts
  const services = useServices();
  const { 
    isLoading: servicesLoading, 
    error: servicesError, 
    astrologyService,
    ingredientService,
    recipeService,
    alchemicalRecommendationService,
    recommendationService
  } = services;
  
  // Safe access to elementalCalculator from services
  const servicesData = services as Record<string, unknown>;
  const elementalCalculator = servicesData?.elementalCalculator;

  // Component state
  const [activeTab, setActiveTab] = useState(0);
  const [targetElement, setTargetElement] = useState<ElementalCharacter>('Fire');
  const [targetProperty, setTargetProperty] = useState<AlchemicalProperty>('Spirit');
  const [modalityFilter, setModalityFilter] = useState<'all' | Modality>('all');
  const [resolvedPlanetaryPositions, setResolvedPlanetaryPositions] = useState<Record<RulingPlanet, number>>({
    Sun: 0,
    Moon: 0,
    Mercury: 0,
    Venus: 0,
    Mars: 0,
    Jupiter: 0,
    Saturn: 0,
    Uranus: 0,
    Neptune: 0,
    Pluto: 0
  });
  const [resolvedIsDaytime, setResolvedIsDaytime] = useState<boolean>(true);
  const [resolvedCurrentZodiac, setResolvedCurrentZodiac] = useState<ZodiacSign | null>(null);
  const [resolvedLunarPhase, setResolvedLunarPhase] = useState<LunarPhaseWithSpaces>('new moon');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [recommendations, setRecommendations] = useState<unknown>({
    topIngredients: [],
    topMethods: [],
    topCuisines: [],
    dominantElement: 'Fire',
    dominantAlchemicalProperty: 'Spirit',
    heat: 0.5,
    entropy: 0.5,
    reactivity: 0.5,
    gregsEnergy: 0.5
  });
  const [transformedIngredients, setTransformedIngredients] = useState<AlchemicalItem[]>([]);
  const [transformedMethods, setTransformedMethods] = useState<AlchemicalItem[]>([]);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  const [energeticProfile, setEnergeticProfile] = useState<unknown>(null);
  const [ingredientsArray, setIngredientsArray] = useState<ElementalItem[]>([]);
  const [cookingMethodsArray, setCookingMethodsArray] = useState<ElementalItem[]>([]);
  const [cuisinesArray, setCuisinesArray] = useState<ElementalItem[]>([]);

  // Load astrological data and initial setup
  useEffect(() => {
    if (servicesLoading || !astrologyService || !elementalCalculator) {
      return;
    }

    const loadAstrologyData = async () => {
      try {
        // Determine if we're using provided props or service data
        if (planetPositions) {
          setResolvedPlanetaryPositions(planetPositions);
        } else {
          // Get planetary positions from service
          const positions = await astrologyService.getCurrentPlanetaryPositions();
          // Convert to the format expected by the component
          const simplePositions: Record<RulingPlanet, number> = {
            Sun: 0,
            Moon: 0,
            Mercury: 0,
            Venus: 0,
            Mars: 0,
            Jupiter: 0,
            Saturn: 0,
            Uranus: 0,
            Neptune: 0,
            Pluto: 0
          };
          
          // Extract degrees from the planetary positions
          Object.entries(positions || {}).forEach(([planet, data]) => {
            if (planet in simplePositions && data && typeof data === 'object' && 'degree' in data) {
              simplePositions[planet as RulingPlanet] = data.degree || 0;
            }
          });
          
          setResolvedPlanetaryPositions(simplePositions);
        }
        
        // Set other resolved values with safe property access
        const astroData = astrologyService as unknown as Record<string, unknown>;
        setResolvedIsDaytime(isDaytime !== undefined ? isDaytime : await astrologyService.isDaytime());
        setResolvedCurrentZodiac(currentZodiac || await astrologyService.getCurrentZodiacSign() || null);
        
        // Safe access to getCurrentLunarPhase
        const lunarPhaseMethod = astroData?.getCurrentLunarPhase;
        if (lunarPhaseMethod && typeof lunarPhaseMethod === 'function') {
          setResolvedLunarPhase(lunarPhase || await lunarPhaseMethod() || 'new moon');
        } else {
          setResolvedLunarPhase(lunarPhase || 'new moon');
        }
      } catch (err) {
        console.error('Error loading astrological data:', err);
        setError(err instanceof Error ? err : new Error('Error loading astrological data'));
      }
    };

    loadAstrologyData();
  }, [servicesLoading, astrologyService, elementalCalculator, planetPositions, isDaytime, currentZodiac, lunarPhase]);

  // Load ingredient data
  useEffect(() => {
    if (servicesLoading || !ingredientService) {
      return;
    }

    const loadIngredientData = async () => {
      try {
        const allIngredients = await ingredientService.getAllIngredients();
        
        // Convert ingredients to ElementalItem format
        const items = Array.isArray(allIngredients) ? allIngredients.map(ingredient => {
          // Get ingredient elemental properties or calculate them
          let elementalProps: ElementalProperties;
          
          if (ingredient.elementalPropertiesState) {
            elementalProps = createElementalProperties(ingredient.elementalPropertiesState);
          } else {
            // Calculate based on ingredient category and attributes
            elementalProps = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  });
            
            // Adjust by category
            const category = ingredient.category?.toLowerCase() || '';
            
            if (category.includes('vegetable') || category === 'vegetable') {
              elementalProps.Earth += 0.5;
              elementalProps.Water += 0.3;
            } else if (category.includes('fruit') || category === 'fruit') {
              elementalProps.Water += 0.4;
              elementalProps.Air += 0.3;
            } else if (category.includes('protein') || category === 'protein' || category.includes('meat') || category === 'meat') {
              elementalProps.Fire += 0.4;
              elementalProps.Earth += 0.3;
            } else if (category.includes('grain') || category === 'grain') {
              elementalProps.Earth += 0.5;
              elementalProps.Air += 0.2;
            } else if (category.includes('herb') || category.includes('spice') || category === 'spice') {
              elementalProps.Fire += 0.3;
              elementalProps.Air += 0.4;
            }
            
            // Adjust by ruling planets
            const rulingPlanets = ingredient.astrologicalPropertiesProfile?.rulingPlanets || [];
            
            for (const planet of rulingPlanets) {
              switch (String(planet)?.toLowerCase()) {
                case 'Sun':
                  elementalProps.Fire += 0.2;
                  break;
                case 'Moon':
                  elementalProps.Water += 0.2;
                  break;
                case 'Mercury':
                  elementalProps.Air += 0.2;
                  break;
                case 'Venus':
                  elementalProps.Earth += 0.1;
                  elementalProps.Water += 0.1;
                  break;
                case 'Mars':
                  elementalProps.Fire += 0.2;
                  break;
                case 'Jupiter':
                  elementalProps.Air += 0.1;
                  elementalProps.Fire += 0.1;
                  break;
                case 'Saturn':
                  elementalProps.Earth += 0.2;
                  break;
              }
            }
            
            // Normalize values
            const total = Object.values(elementalProps)?.reduce((sum, val) => sum + val, 0);
            if (total > 0) {
              for (const element in elementalProps) {
                elementalProps[element as "Fire" | "Water" | "Earth" | "Air"] /= total;
              }
            } else {
              // If nothing was calculated, use balanced elements
              elementalProps = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
               });
            }
          }
          
          return {
            id: ingredient.id || ingredient.name,
            name: ingredient.name,
            elementalProperties: elementalProps as Record<ElementalCharacter, number>,
            qualities: ingredient.qualities || [],
            modality: ingredient.modality as Modality | undefined
          } as ElementalItem;
        }) : [];
        
        setIngredientsArray(items);
      } catch (err) {
        console.error('Error loading ingredient data:', err);
        setError(err instanceof Error ? err : new Error('Error loading ingredient data'));
      }
    };

    loadIngredientData();
  }, [servicesLoading, ingredientService]);

  // Load cooking methods and cuisines data
  useEffect(() => {
    if (servicesLoading || !recommendationService) {
      return;
    }

    const loadCookingAndCuisineData = async () => {
      try {
        // Safe access to getAllCookingMethods
        const serviceData = recommendationService as unknown as Record<string, unknown>;
        const getAllCookingMethodsMethod = serviceData?.getAllCookingMethods;
        
        let cookingMethods: any[] = [];
        if (getAllCookingMethodsMethod && typeof getAllCookingMethodsMethod === 'function') {
          cookingMethods = await getAllCookingMethodsMethod();
        }
        
        const methodItems = (cookingMethods || []).map(method => {
          // Get cooking method elemental effect or calculate it
          let elementalEffect: ElementalProperties;
          
          if (method.elementalState) {
            elementalEffect = createElementalProperties(method.elementalState);
          } else {
            // Default elemental properties
            elementalEffect = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
             });
            
            // Adjust based on method type
            const methodName = method.name?.toLowerCase();
            
            if (methodName && (methodName.includes('grill') || methodName === 'grill' || methodName.includes('broil') || methodName === 'broil' || 
                methodName.includes('fry') || methodName === 'fry' || methodName.includes('sear') || methodName === 'sear')) {
              elementalEffect.Fire += 0.5;
              elementalEffect.Air += 0.2;
            } else if (methodName && (methodName.includes('boil') || methodName === 'boil' || methodName.includes('steam') || methodName === 'steam' || 
                      methodName.includes('poach') || methodName === 'poach' || methodName.includes('simmer') || methodName === 'simmer')) {
              elementalEffect.Water += 0.5;
              elementalEffect.Fire += 0.2;
            } else if (methodName && (methodName.includes('bake') || methodName === 'bake' || methodName.includes('roast') || methodName === 'roast')) {
              elementalEffect.Earth += 0.4;
              elementalEffect.Fire += 0.3;
            } else if (methodName && (methodName.includes('ferment') || methodName === 'ferment' || methodName.includes('cure') || methodName === 'cure' || 
                      methodName.includes('pickle') || methodName === 'pickle')) {
              elementalEffect.Water += 0.4;
              elementalEffect.Earth += 0.3;
            } else if (methodName && (methodName.includes('smoke') || methodName === 'smoke')) {
              elementalEffect.Air += 0.5;
              elementalEffect.Fire += 0.3;
            }
            
            // Normalize values
            const total = Object.values(elementalEffect)?.reduce((sum, val) => sum + val, 0);
            if (total > 0) {
              for (const element in elementalEffect) {
                elementalEffect[element as "Fire" | "Water" | "Earth" | "Air"] /= total;
              }
            }
          }
          
          return {
            id: method.id || method.name,
            name: method.name,
            elementalProperties: elementalEffect as Record<ElementalCharacter, number>
          } as ElementalItem;
        });
        
        setCookingMethodsArray(methodItems);
        
        // Safe access to getAllCuisines
        const getAllCuisinesMethod = serviceData?.getAllCuisines;
        
        let cuisines = [];
        if (getAllCuisinesMethod && typeof getAllCuisinesMethod === 'function') {
          cuisines = await getAllCuisinesMethod();
        }
        
        const cuisineItems = (cuisines || []).map(cuisine => {
          // Get cuisine elemental state or calculate it
          let elementalState: ElementalProperties;
          
          if ((cuisine as CuisineData).elementalState) {
            elementalState = createElementalProperties((cuisine as CuisineData).elementalState as ElementalProperties);
          } else {
            // Calculate based on cuisine characteristics
            elementalState = createElementalProperties({ Fire: 0, Water: 0, Earth: 0, Air: 0  });
            
            const cuisineName = (cuisine as CuisineData).name?.toLowerCase();
            const region = String((cuisine as CuisineData).region || '').toLowerCase();
            
            // Adjust by cuisine type/region
            if (cuisineName && (cuisineName.includes('indian') || cuisineName === 'indian' || 
                cuisineName.includes('thai') || cuisineName === 'thai' || 
                cuisineName.includes('mexican') || cuisineName === 'mexican')) {
              elementalState.Fire += 0.5;
              elementalState.Air += 0.3;
            } else if (cuisineName && (cuisineName.includes('mediterranean') || cuisineName === 'mediterranean' || 
                      cuisineName.includes('italian') || cuisineName === 'italian')) {
              elementalState.Earth += 0.4;
              elementalState.Fire += 0.3;
            } else if (cuisineName && (cuisineName.includes('chinese') || cuisineName === 'chinese' || 
                      cuisineName.includes('japanese') || cuisineName === 'japanese')) {
              elementalState.Water += 0.4;
              elementalState.Air += 0.3;
            } else if (cuisineName && (cuisineName.includes('french') || cuisineName === 'french')) {
              elementalState.Earth += 0.5;
              elementalState.Water += 0.2;
            }
            
            // Normalize values
            const total = Object.values(elementalState)?.reduce((sum, val) => sum + val, 0);
            if (total > 0) {
              for (const element in elementalState) {
                elementalState[element as "Fire" | "Water" | "Earth" | "Air"] /= total;
              }
            } else {
              // If nothing was calculated, use balanced elements
              elementalState = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
            }
          }
          
          return {
            id: (cuisine as CuisineData).id || (cuisine as CuisineData).name,
            name: (cuisine as CuisineData).name,
            elementalProperties: elementalState as Record<ElementalCharacter, number>
          } as ElementalItem;
        });
        
        setCuisinesArray(cuisineItems);
      } catch (err) {
        console.error('Error loading cooking and cuisine data:', err);
        setError(err instanceof Error ? err : new Error('Error loading cooking and cuisine data'));
      }
    };

    loadCookingAndCuisineData();
  }, [servicesLoading, recommendationService]);

  // Filter ingredients array by modality
  const filteredIngredientsArray = useMemo(() => {
    if (modalityFilter === 'all') return ingredientsArray;
    
    return ingredientsArray.filter(ingredient => {
      const elementalProps = ingredient.elementalPropertiesState;
      const qualities = Array.isArray(ingredient.qualities) ? ingredient.qualities : [];
              const modality = ingredient.modality as Modality | undefined || 
          determineIngredientModality(Array.isArray(qualities) ? qualities : [], elementalProps as ElementalProperties);
      return modality === modalityFilter;
    });
  }, [ingredientsArray, modalityFilter]);

  // Get recommendations using services
  useEffect(() => {
    if (
      servicesLoading || 
      !alchemicalRecommendationService || 
      !filteredIngredientsArray.length || 
      !cookingMethodsArray.length || 
      !cuisinesArray.length ||
      !resolvedPlanetaryPositions ||
      Object.values(resolvedPlanetaryPositions)?.every(v => v === 0)
    ) {
      return;
    }

    const getRecommendations = async () => {
      try {
        setLoading(true);
        
        // Create recommendation adapter using the alchemical recommendation service
        const serviceAny = alchemicalRecommendationService as unknown as Record<string, unknown>;
        const transformDataMethod = serviceAny?.transformData as Function;
        const transformedData = transformDataMethod ? 
          await transformDataMethod(
            filteredIngredientsArray,
            cookingMethodsArray,
            cuisinesArray,
            resolvedPlanetaryPositions,
            resolvedIsDaytime,
            resolvedCurrentZodiac,
            resolvedLunarPhase,
            tarotElementBoosts,
            tarotPlanetaryBoosts,
            aspects
          ) : 
          { ingredients: [], cookingMethods: [], cuisines: [] };
        
        // ✅ Pattern MM-1: generateRecommendations expects (planetaryPositions, ingredients, cookingMethods)
        const planetaryPositions = resolvedPlanetaryPositions || {};
        const recs = await alchemicalRecommendationService.generateRecommendations(
          planetaryPositions as unknown as Record<string, ZodiacSign>,
          (filteredIngredientsArray || []) as unknown as UnifiedIngredient[],
          (cookingMethodsArray || []) as unknown as CookingMethod[]
        );
        
        // Set recommendations and transformed data
        setRecommendations(recs);
        setTransformedIngredients(transformedData.ingredients);
        setTransformedMethods(transformedData.cookingMethods);
        setTransformedCuisines(transformedData.cuisines);
        
        // Create energetic profile
        const recsData = recs as unknown as Record<string, unknown>;
        const profile = {
          dominantElement: recsData?.dominantElement || 'Fire',
          dominantAlchemicalProperty: recsData?.dominantAlchemicalProperty || 'Spirit',
          heat: recsData?.heat || 0,
          entropy: recsData?.entropy || 0,
          reactivity: recsData?.reactivity || 0,
          gregsEnergy: recsData?.gregsEnergy || 0,
          elementalState: {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
          },
          alchemicalProperties: {
            Spirit: 0,
            Essence: 0,
            Matter: 0,
            Substance: 0
          }
        };
        
        // Calculate average elemental values from top ingredients
        const topIngredients = Array.isArray(recsData?.topIngredients) ? recsData?.topIngredients : [];
        if (topIngredients.length > 0) {
          topIngredients.forEach((item: unknown) => {
            const itemData = item as Record<string, unknown>;
            if (itemData?.elementalState) {
              const elementalState = itemData.elementalState as Record<string, number>;
              profile.elementalState.Fire += Number(elementalState?.Fire || 0) / topIngredients.length;
              profile.elementalState.Water += Number(elementalState?.Water || 0) / topIngredients.length;
              profile.elementalState.Earth += Number(elementalState?.Earth || 0) / topIngredients.length;
              profile.elementalState.Air += Number(elementalState?.Air || 0) / topIngredients.length;
            }
            
            // Extract alchemical properties if available
            if (itemData?.alchemicalProperties) {
              const alchemicalProperties = itemData.alchemicalProperties as Record<string, number>;
              profile.alchemicalProperties.Spirit += Number(alchemicalProperties?.Spirit || 0) / topIngredients.length;
              profile.alchemicalProperties.Essence += Number(alchemicalProperties?.Essence || 0) / topIngredients.length;
              profile.alchemicalProperties.Matter += Number(alchemicalProperties?.Matter || 0) / topIngredients.length;
              profile.alchemicalProperties.Substance += Number(alchemicalProperties?.Substance || 0) / topIngredients.length;
            }
          });
        }
        
        setEnergeticProfile(profile);
        setLoading(false);
      } catch (err) {
        console.error('Error getting recommendations:', err);
        setError(err instanceof Error ? err : new Error('Error getting recommendations'));
        setLoading(false);
      }
    };
    
    getRecommendations();
  }, [
    servicesLoading,
    alchemicalRecommendationService,
    filteredIngredientsArray,
    cookingMethodsArray,
    cuisinesArray,
    resolvedPlanetaryPositions,
    resolvedIsDaytime,
    resolvedCurrentZodiac,
    resolvedLunarPhase,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    aspects,
    targetElement,
    targetProperty
  ]);

  // Get recommended recipes
  const recommendedRecipes = useMemo(() => {
    if (!recipes || (recipes || []).length === 0 || !energeticProfile) return [];
    
    // Use recommendation engine to recommend recipes
    const result = getRecommendedRecipes({ recipes, energeticProfile, recipeCount });
    // Ensure we return an array, not a Promise
    return Array.isArray(result) ? result : [];
  }, [recipes, energeticProfile, recipeCount]);

  // Handle loading and error states
  if (servicesLoading || loading) {
    return <div>Loading alchemical recommendations...</div>;
  }
  
  if (servicesError || error) {
    return <div>Error: {(servicesError || error)?.message}</div>;
  }

  // Return JSX
  return (
    <div className="alchemical-recommendations">
      <h2>Alchemical Recommendations</h2>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Ingredients & Methods" />
          <Tab label="Recipe Recommendations" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <div className="alchemical-stats">
            <h3>Dominant Influences</h3>
            <div className="stat-grid">
              <div className="stat">
                <span className="label">Dominant Element:</span>
                <span className="value">{String((recommendations as Record<string, unknown>)?.dominantElement || 'Fire')}</span>
              </div>
              <div className="stat">
                <span className="label">Dominant Alchemical Property:</span>
                <span className="value">{String((recommendations as Record<string, unknown>)?.dominantAlchemicalProperty || 'Spirit')}</span>
              </div>
              {resolvedCurrentZodiac && (
                <div className="stat">
                  <span className="label">Current Zodiac:</span>
                  <span className="value">{resolvedCurrentZodiac}</span>
                </div>
              )}
              {resolvedLunarPhase && (
                <div className="stat">
                  <span className="label">Lunar Phase:</span>
                  <span className="value">{resolvedLunarPhase}</span>
                </div>
              )}
            </div>
            
            <h3>Energetic Profile</h3>
            <div className="stat-grid">
              <div className="stat">
                <span className="label">Heat:</span>
                <span className="value">{(Number((recommendations as Record<string, unknown>)?.heat || 0)).toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="label">Entropy:</span>
                <span className="value">{(Number((recommendations as Record<string, unknown>)?.entropy || 0)).toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="label">Reactivity:</span>
                <span className="value">{(Number((recommendations as Record<string, unknown>)?.reactivity || 0)).toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="label">Greg's Energy:</span>
                <span className="value">{(Number((recommendations as Record<string, unknown>)?.gregsEnergy || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="element-filter">Target Element:</label>
              <select 
                id="element-filter" 
                value={targetElement}
                onChange={(e) => setTargetElement(e?.target?.value as ElementalCharacter)}
              >
                <option value="Fire">fire</option>
                <option value="Water">water</option>
                <option value="Earth">earth</option>
                <option value="Air">Air</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="property-filter">Target Property:</label>
              <select 
                id="property-filter" 
                value={targetProperty}
                onChange={(e) => setTargetProperty(e?.target?.value as AlchemicalProperty)}
              >
                <option value="Spirit">Spirit</option>
                <option value="Essence">Essence</option>
                <option value="Matter">Matter</option>
                <option value="Substance">Substance</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="modality-filter">Modality:</label>
              <select 
                id="modality-filter" 
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e?.target?.value as 'all' | Modality)}
              >
                <option value="all">All Modalities</option>
                <option value="cardinal">Cardinal</option>
                <option value="fixed">Fixed</option>
                <option value="mutable">Mutable</option>
              </select>
            </div>
          </div>
          
          <div className="recommendation-sections">
            <div className="recommendation-section">
              <h3>Recommended Ingredients</h3>
              <ul className="recommendation-list">
                {(() => {
                  const topIngredients = (recommendations as Record<string, unknown>)?.topIngredients;
                  const ingredientsArray = Array.isArray(topIngredients) ? topIngredients : [];
                  return ingredientsArray.map((item: unknown, index: number) => {
                    const itemData = item as Record<string, unknown>;
                    const elementalState = itemData?.elementalState as Record<string, unknown>;
                    return (
                      <li key={`ingredient-${index}`} className="recommendation-item">
                        <h4>{String(itemData?.name || 'Unknown')}</h4>
                        <div className="item-details">
                          <div className="detail">
                            <strong>fire:</strong> {Math.round(Number(elementalState?.Fire || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>water:</strong> {Math.round(Number(elementalState?.Water || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>earth:</strong> {Math.round(Number(elementalState?.Earth || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>Air:</strong> {Math.round(Number(elementalState?.Air || 0) * 100)}%
                          </div>
                        </div>
                        {Boolean(itemData?.modality && String(itemData?.modality)) && (
                          <div className="item-modality">
                            <span className={`modality-badge ${(String(itemData?.modality || '')).toLowerCase()}`}>
                              {String(itemData?.modality || '')}
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>
            
            <div className="recommendation-section">
              <h3>Recommended Cooking Methods</h3>
              <ul className="recommendation-list">
                {(() => {
                  const topMethods = (recommendations as Record<string, unknown>)?.topMethods;
                  const methodsArray = Array.isArray(topMethods) ? topMethods : [];
                  return methodsArray.map((item: AlchemicalItem, index: number) => {
                    const elementalState = item.elementalState as Record<string, unknown>;
                    return (
                      <li key={`method-${index}`} className="recommendation-item">
                        <h4>{item.name}</h4>
                        <div className="item-details">
                          <div className="detail">
                            <strong>fire:</strong> {Math.round(Number(elementalState?.Fire || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>water:</strong> {Math.round(Number(elementalState?.Water || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>earth:</strong> {Math.round(Number(elementalState?.Earth || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>Air:</strong> {Math.round(Number(elementalState?.Air || 0) * 100)}%
                          </div>
                        </div>
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>
            
            <div className="recommendation-section">
              <h3>Recommended Cuisines</h3>
              <ul className="recommendation-list">
                {(() => {
                  const topCuisines = (recommendations as Record<string, unknown>)?.topCuisines;
                  const cuisinesArray = Array.isArray(topCuisines) ? topCuisines : [];
                  return cuisinesArray.map((item: AlchemicalItem, index: number) => {
                    const elementalState = item.elementalState as Record<string, unknown>;
                    return (
                      <li key={`cuisine-${index}`} className="recommendation-item">
                        <h4>{item.name}</h4>
                        <div className="item-details">
                          <div className="detail">
                            <strong>fire:</strong> {Math.round(Number(elementalState?.Fire || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>water:</strong> {Math.round(Number(elementalState?.Water || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>earth:</strong> {Math.round(Number(elementalState?.Earth || 0) * 100)}%
                          </div>
                          <div className="detail">
                            <strong>Air:</strong> {Math.round(Number(elementalState?.Air || 0) * 100)}%
                          </div>
                        </div>
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 1 && (
        <div className="recipe-recommendations">
          <h3>Recommended Recipes</h3>
          <Grid container spacing={3}>
            {(recommendedRecipes || []).map((_recipe, index) => (
              <Grid item xs={12} sm={6} md={4} key={`recipe-${index}`}>
                <Card className="recipe-card">
                  {_recipe.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={_recipe.image}
                      alt={_recipe.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {_recipe.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {_recipe.cuisine}
                    </Typography>
                    
                    <div className="recipe-tags">
                      {_recipe.mealType && (
                        <Chip 
                          icon={<Restaurant />}
                          label={Array.isArray(_recipe.mealType) ? _recipe?.mealType?.[0] : _recipe.mealType}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      
                      {_recipe.timeRequired && (
                        <Chip 
                          icon={<AccessTime />}
                          label={`${_recipe.timeRequired} min`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      
                      {_recipe.currentSeason && (
                        <Chip 
                          icon={<WbSunny />}
                          label={Array.isArray(_recipe.currentSeason) ? _recipe?.currentSeason?.[0] : (_recipe.currentSeason as string)}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </div>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="body2">
                      {explainRecommendation(_recipe, energeticProfile as Record<string, unknown>)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {(recommendedRecipes || []).length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No recipe recommendations available. Try adjusting your filters or adding more recipes.
            </Typography>
          )}
        </div>
      )}
      
      <style jsx>{`
        .alchemical-recommendations {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .label {
          font-weight: 600;
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
        }
        
        .value {
          font-size: 1.2rem;
          color: #222;
        }
        
        .filter-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-group select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
          min-width: 150px;
        }
        
        .recommendation-sections {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .recommendation-section {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          padding: 1.5rem;
        }
        
        .recommendation-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .recommendation-item {
          border-bottom: 1px solid #eee;
          padding: 1rem 0;
        }
        
        .recommendation-item:last-child {
          border-bottom: none;
        }
        
        .item-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .detail {
          font-size: 0.9rem;
        }
        
        .item-modality {
          margin-top: 0.5rem;
          text-align: right;
        }
        
        .modality-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background-color: #f0f0f0;
          color: #555;
          font-size: 0.8rem;
        }
        
        .modality-badge.cardinal {
          background-color: #ffecb3;
          color: #996000;
        }
        
        .modality-badge.fixed {
          background-color: #c8e6c9;
          color: #1b5e20;
        }
        
        .modality-badge.mutable {
          background-color: #bbdefb;
          color: #0d47a1;
        }
        
        .recipe-recommendations {
          margin-top: 1rem;
        }
        
        .recipe-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};


// Missing function definitions for AlchemicalRecommendations
function getRecommendedRecipes(_criteria: unknown): Promise<any[]> {
  // Placeholder implementation
  return Promise.resolve([]);
}

function explainRecommendation(_recipe: Recipe, _userData: Record<string, unknown>): string {
  // Placeholder implementation
  return `This recipe aligns with your current astrological profile.`;
}

export default AlchemicalRecommendationsMigrated; 