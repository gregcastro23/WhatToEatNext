'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './FoodRecommender.module.css';
import @/hooks  from 'useTarotAstrologyData ';
import {
  Clock,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Leaf,
  ThermometerSun,
  ThermometerSnowflake,
  Pill,
  Sparkles,
  Star,
  RefreshCw,
} from 'lucide-react';
import @/data  from 'integrations ';
import @/services  from 'RecommendationAdapter ';
import {
  ElementalItem,
  AlchemicalItem,
} from '@/calculations / (alchemicalTransformation || 1)';
import {
  AlchemicalProperty,
  ElementalCharacter,
} from '@/constants / (planetaryElements || 1)';
import @/constants  from 'planetaryFoodAssociations ';
import {
  LunarPhase,
  LunarPhaseWithSpaces,
  PlanetaryAspect,
} from '@/types / (alchemy || 1)';
import @/components  from 'TarotFoodDisplay ';
import {
  calculateAspects,
  calculatePlanetaryPositions,
} from '@/utils / (astrologyUtils || 1)';
import @/hooks  from 'useCurrentChart ';
import @/contexts  from 'AlchemicalContext ';

import @/utils  from 'logger ';

// Import ingredient data
import @/data  from 'ingredients ';
import @/constants  from 'tarotCards ';

// Import the standardized lunar phase constants and helper function
import {
  LUNAR_PHASE_MAP,
  formatLunarPhaseForDisplay,
} from '@/utils / (lunarPhaseUtils || 1)';

// Import the ingredient utility functions
import {
  calculateAlchemicalProperties,
  calculateThermodynamicProperties,
} from '@/utils / (ingredientUtils || 1)';

// Convert lunar phase strings to the proper LunarPhaseWithSpaces type format (lowercase with spaces)
const getLunarPhaseType = (
  phase: string | null | undefined
): LunarPhaseWithSpaces | undefined => {
  if (!phase) return undefined;

  // Map from the phase string (in any format) to the proper LunarPhaseWithSpaces type format (lowercase with spaces)
  const phaseMap: Record<string, LunarPhaseWithSpaces> = {
    'new moon': 'new moon',
    'waxing crescent': 'waxing crescent',
    'first quarter': 'first quarter',
    'waxing gibbous': 'waxing gibbous',
    'full moon': 'full moon',
    'waning gibbous': 'waning gibbous',
    'last quarter': 'last quarter',
    'waning crescent': 'waning crescent',
    // Also handle underscore format
    new_moon: 'new moon',
    waxing_crescent: 'waxing crescent',
    first_quarter: 'first quarter',
    waxing_gibbous: 'waxing gibbous',
    full_moon: 'full moon',
    waning_gibbous: 'waning gibbous',
    last_quarter: 'last quarter',
    waning_crescent: 'waning crescent',
    // Also handle title case format
    'New Moon': 'new moon',
    'Waxing Crescent': 'waxing crescent',
    'First Quarter': 'first quarter',
    'Waxing Gibbous': 'waxing gibbous',
    'Full Moon': 'full moon',
    'Waning Gibbous': 'waning gibbous',
    'Last Quarter': 'last quarter',
    'Waning Crescent': 'waning crescent',
  };

  // Normalize the input phase to handle case differences
  const normalizedPhase = phase.toLowerCase();

  // Try direct lookup first
  if (normalizedPhase in phaseMap) {
    return phaseMap[normalizedPhase];
  }

  // Try to match with underscores replaced by spaces
  const withSpaces = normalizedPhase.replace(/_ / (g || 1), ' ');
  if (withSpaces in phaseMap) {
    return phaseMap[withSpaces];
  }

  // Return undefined if no match found
  return undefined;
};

const FoodRecommender: React.FC = () => {
  const {
    currentPlanetaryAlignment,
    currentZodiac,
    activePlanets,
    isDaytime,
    minorCard,
    majorCard,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    currentLunarPhase,
    isLoading,
    error: astroError,
  } = useTarotAstrologyData();

  const {
    chart,
    isLoading: chartLoading,
    error: chartError,
  } = useCurrentChart();

  const [transformedIngredients, setTransformedIngredients] = useState<
    AlchemicalItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>('');
  const [tarotCards, setTarotCards] = useState<{
    minorCard: unknown;
    majorCard: unknown;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (chartError) throw new Error(chartError);

        // Use chart data instead of calculating positions
        const { planetaryPositions, aspects } = chart;

        const season = getCurrentSeason();
        setCurrentSeason(season);

        // Check if allIngredients is defined before mapping
        if (!allIngredients || typeof allIngredients !== 'object') {
          throw new Error('Ingredient data is missing or invalid');
        }

        // Add debugging info
        logger.debug(
          `Ingredient data structure:`,
          Object.keys(allIngredients).length,
          'categories or items'
        );

        // Handle different possible structures of allIngredients
        let ingredientsAsElementalItems: ElementalItem[] = [];

        // Check if allIngredients is already flat (structure from index.ts)
        if (
          Object.values(allIngredients).some(
            (item) => item && typeof item === 'object' && 'name' in item
          )
        ) {
          // Structure is flat
          ingredientsAsElementalItems = Object.values(allIngredients).map(
            (ingredient: unknown) => ({
              id:
                ingredient.id ||
                ingredient.name.replace(/\s+/g, '_').toLowerCase(),
              name: ingredient.name,
              elementalProperties: {
                Fire: getElementValue(ingredient, 'fire'),
                Water: getElementValue(ingredient, 'water'),
                Earth: getElementValue(ingredient, 'earth'),
                Air: getElementValue(ingredient, 'air'),
              },
              category: ingredient.category,
              subCategory: ingredient.subCategory,
              isInSeason: ingredient.isInSeason,
              temperatureEffect: ingredient.temperatureEffect,
              medicinalProperties: ingredient.medicinalProperties,
              qualities: ingredient.qualities,
              astrologicalProfile: ingredient.astrologicalProfile,
            })
          );
        } else {
          // Structure is categorized (structure from ingredients.ts)
          // Flatten the structure
          ingredientsAsElementalItems = Object.entries(allIngredients).flatMap(
            ([category, items]) => {
              // Handle both array and object structures
              const ingredientItems = Array.isArray(items)
                ? items
                : Object.values(items);

              return ingredientItems.map((ingredient: unknown) => ({
                id:
                  ingredient.id ||
                  ingredient.name.replace(/\s+/g, '_').toLowerCase(),
                name: ingredient.name,
                elementalProperties: {
                  Fire: getElementValue(ingredient, 'fire'),
                  Water: getElementValue(ingredient, 'water'),
                  Earth: getElementValue(ingredient, 'earth'),
                  Air: getElementValue(ingredient, 'air'),
                },
                category: ingredient.category || category,
                subCategory: ingredient.subCategory || '',
                isInSeason: ingredient.isInSeason,
                temperatureEffect: ingredient.temperatureEffect,
                medicinalProperties: ingredient.medicinalProperties,
                qualities: ingredient.qualities,
                astrologicalProfile: ingredient.astrologicalProfile,
              }));
            }
          );
        }

        if (ingredientsAsElementalItems.length === 0) {
          throw new Error('Failed to extract any valid ingredients');
        }

        logger.debug(
          `Processed ${ingredientsAsElementalItems.length} ingredients`
        );

        // Apply seasonal modifiers
        if (season) {
          const seasonalModifiers: Record<string, Record<string, number>> = {
            spring: { Air: 0.2, Water: 0.1 },
            summer: { Fire: 0.2, Air: 0.1 },
            fall: { Earth: 0.2, Fire: 0.1 },
            winter: { Water: 0.2, Earth: 0.1 },
          };

          // Adjust ingredients based on season
          ingredientsAsElementalItems.forEach((ingredient) => {
            if (seasonalModifiers[season.toLowerCase()]) {
              Object.entries(seasonalModifiers[season.toLowerCase()]).forEach(
                ([element, modifier]) => {
                  ingredient.elementalProperties[
                    element as ElementalCharacter
                  ] += modifier;
                }
              );
            }

            // Mark ingredients that are in season
            if (
              ingredient.isInSeason &&
              typeof ingredient.isInSeason === 'object'
            ) {
              ingredient.isCurrentlyInSeason =
                ingredient.isInSeason[season.toLowerCase()];
            }
          });
        }

        // Apply tarot card influence to ingredient properties if available
        if (minorCard) {
          const tarotElement = minorCard.element;
          if (tarotElement) {
            // Find ingredients that match the tarot element and enhance them
            ingredientsAsElementalItems.forEach((ingredient) => {
              const dominantElement = getDominantElement(
                ingredient.elementalProperties
              );
              if (
                dominantElement.toLowerCase() === tarotElement.toLowerCase()
              ) {
                // Enhance ingredient's primary element by quantum value
                const quantumValue = minorCard.quantum || 1;
                ingredient.elementalProperties[dominantElement] *=
                  1 + quantumValue * 0.1;

                // Normalize
                const total = Object.values(
                  ingredient.elementalProperties
                ).reduce((sum, val) => sum + val, 0);
                if (total > 0) {
                  Object.keys(ingredient.elementalProperties).forEach(
                    (element) => {
                      ingredient.elementalProperties[
                        element as ElementalCharacter
                      ] =
                        ingredient.elementalProperties[
                          element as ElementalCharacter
                        ] / (total || 1);
                    }
                  );
                }
              }
            });
          }
        }

        // Enhance ingredients associated with the major arcana's planet
        if (majorCard && majorCard.planet) {
          const tarotPlanet = majorCard.planet;
          ingredientsAsElementalItems.forEach((ingredient) => {
            if (
              ingredient.astrologicalProfile?.rulingPlanets?.includes(
                tarotPlanet
              )
            ) {
              // Add a new property to indicate tarot major arcana affinity
              ingredient.tarotMajorAffinity = majorCard.name;
            }
          });
        }

        // Use the RecommendationAdapter with the chart data
        const adapter = new RecommendationAdapter(
          ingredientsAsElementalItems,
          [],
          []
        );

        await adapter.updatePlanetaryData(
          planetaryPositions,
          isDaytime,
          currentZodiac || '',
          currentLunarPhase ? getLunarPhaseType(currentLunarPhase) : undefined,
          tarotElementBoosts,
          tarotPlanetaryBoosts,
          aspects as PlanetaryAspect[]
        );

        // Get the transformed ingredients
        const transformedIngs = adapter.getRecommendedIngredients(12);
        setTransformedIngredients(transformedIngs);
      } catch (err: unknown) {
        setError(`Error getting recommendations: ${err.message}`);
        // console.error('FoodRecommender error:', err);
        setTransformedIngredients([]);
        setDebugInfo(
          JSON.stringify(
            {
              allIngredientsType: typeof allIngredients,
              allIngredientsKeys: allIngredients
                ? Object.keys(allIngredients)
                : [],
              errorMessage: err.message,
              stack: err.stack,
            },
            null,
            2
          )
        );
      } finally {
        setLoading(false);
      }
    };

    if (!chartLoading) {
      fetchData();
    }

    return () => controller.abort();
  }, [chart]);

  // Helper function to get element value from ingredient
  const getElementValue = (ingredient: unknown, element: string): number => {
    // Type guard for ingredient
    if (!ingredient || typeof ingredient !== 'object') return 0;

    // Handle case where elementalProperties is directly on the ingredient
    if ('elementalProperties' in ingredient) {
      const elementalProps = ingredient.elementalProperties;
      if (elementalProps && typeof elementalProps === 'object') {
        // Convert element to proper case for lookup
        const properElement = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
        return typeof elementalProps[properElement] === 'number'
          ? elementalProps[properElement]
          : 0;
      }
    }

    // Handle case where elements are directly on the ingredient
    if (element.toLowerCase() in ingredient) {
      let value = ingredient[element.toLowerCase()];
      return typeof value === 'number' ? value : 0;
    }

    // Handle case where elements are in a nested 'elements' object
    if ('elements' in ingredient) {
      const elements = ingredient.elements;
      if (elements && typeof elements === 'object') {
        if (element.toLowerCase() in elements) {
          const value = elements[element.toLowerCase()];
          return typeof value === 'number' ? value : 0;
        }
      }
    }

    return 0;
  };

  const getElementIcon = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'earth':
        return <Mountain className="w-4 h-4 text-green-400" />;
      case 'air':
        return <Wind className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getTemperatureIcon = (effect: unknown) => {
    // First check if effect is a string
    if (typeof effect !== 'string') {
      // Return a default icon or null if effect isn't a string
      return <ThermometerSun className="w-4 h-4 text-gray-400" />;
    }

    if (effect.includes('warm') || effect.includes('hot')) {
      return <ThermometerSun className="w-4 h-4 text-orange-300" />;
    }
    if (effect.includes('cool') || effect.includes('cold')) {
      return <ThermometerSnowflake className="w-4 h-4 text-blue-300" />;
    }

    // Default icon if no matches
    return <ThermometerSun className="w-4 h-4 text-gray-400" />;
  };

  const getAlchemicalPropertyIcon = (property: AlchemicalProperty) => {
    return <Sparkles className="w-4 h-4 text-yellow-400" />;
  };

  const getDignityColor = (dignity: PlanetaryDignity) => {
    switch (dignity) {
      case 'Domicile':
        return 'text-green-400';
      case 'Exaltation':
        return 'text-blue-400';
      case 'Neutral':
        return 'text-gray-400';
      case 'Detriment':
        return 'text-orange-400';
      case 'Fall':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Helper function to determine dominant element of an ingredient
  const getDominantElement = (
    elementalProperties: Record<ElementalCharacter, number>
  ): ElementalCharacter => {
    let dominant: ElementalCharacter = 'Fire';
    let maxValue = -1;

    Object.entries(elementalProperties).forEach(([element, value]) => {
      if (value > maxValue) {
        dominant = element as ElementalCharacter;
        maxValue = value;
      }
    });

    return dominant;
  };

  // Handle tarot card data when loaded
  const handleTarotLoaded = (cards: {
    minorCard: unknown;
    majorCard: unknown;
  }) => {
    setTarotCards(cards);
  };

  // Replace the safelyFormatNumber function with a more robust version
  const safelyFormatNumber = (value: unknown, decimals: number = 2): string => {
    if (value === undefined || value === null) return 'N / (A || 1)';
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return 'Invalid';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Inside the component function, add this function before the return statement:
  const calculateIngredientProperties = (ingredient: unknown) => {
    try {
      if (!ingredient || !ingredient.elementalProperties) {
        return {
          alchemical: { spirit: 0, essence: 0, matter: 0, substance: 0 },
          thermodynamic: { heat: 0, entropy: 0, reactivity: 0, energy: 0 },
        };
      }

      // Create a compatible ingredient object for the utility functions
      const ingredientObj = {
        elementalProperties: ingredient.elementalProperties,
      };

      // Calculate alchemical properties
      const alchemicalProps = calculateAlchemicalProperties(
        ingredientObj as any
      );

      // Calculate thermodynamic properties
      const thermodynamicProps = calculateThermodynamicProperties(
        alchemicalProps,
        ingredient.elementalProperties
      );

      return {
        alchemical: alchemicalProps,
        thermodynamic: thermodynamicProps,
      };
    } catch (error) {
      // console.error('Error calculating ingredient properties:', error);
      return {
        alchemical: { spirit: 0, essence: 0, matter: 0, substance: 0 },
        thermodynamic: { heat: 0, entropy: 0, reactivity: 0, energy: 0 },
      };
    }
  };

  // Replace the handleRefresh function with this one:
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // console.log('Manually refreshing celestial data and recommendations...');

      // Instead of trying to access refreshChart, we'll trigger a refresh via useCurrentChart's mechanism
      if (chart) {
        // Without direct access to the refresh method, we can fetch a new chart
        // by waiting a bit and re-rendering the component
        setTimeout(() => {
          setLoading(true); // Force a re-fetch by changing state
        }, 100);
        // console.log('Triggered celestial data refresh');
      }

      // The rest of the logic will be triggered by the chart update
    } catch (error) {
      // console.error('Error during manual refresh:', error);
      setError(
        `Failed to refresh celestial data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [chart]);

  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Celestial Ingredient Recommendations
        </h2>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-900 bg-opacity-30 hover:bg-opacity-50 rounded-md text-sm transition-all"
          title="Refresh celestial data and recommendations"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tarot display */}
      <TarotFoodDisplay onTarotLoaded={handleTarotLoaded} />

      {loading && (
        <p className="text-gray-400 mb-4">
          Calculating celestial alignments...
        </p>
      )}

      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded mb-4">
          <p className="text-red-300">{error}</p>
          {debugInfo && (
            <details className="mt-2">
              <summary className="text-sm text-gray-400 cursor-pointer">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {currentPlanetaryAlignment?.sun && (
                <div className="bg-yellow-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                  <span className="text-yellow-400 mr-1">☉</span>
                  <span className="text-yellow-100">
                    Sun in {currentPlanetaryAlignment.sun.sign}
                  </span>
                </div>
              )}

              {currentPlanetaryAlignment?.moon && (
                <div className="bg-blue-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                  <span className="text-blue-400 mr-1">☽</span>
                  <span className="text-blue-100">
                    Moon in {currentPlanetaryAlignment.moon.sign}
                  </span>
                </div>
              )}

              {currentLunarPhase && (
                <div className="bg-blue-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                  <span className="text-blue-400 mr-1">☽</span>
                  <span className="text-blue-100">
                    {formatLunarPhaseForDisplay(currentLunarPhase)}
                  </span>
                </div>
              )}

              {isDaytime !== undefined && (
                <div className="bg-purple-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-purple-400" />
                  <span className="text-purple-100">
                    {isDaytime ? 'Daytime' : 'Nighttime'}
                  </span>
                </div>
              )}

              {currentSeason && (
                <div className="bg-green-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                  <Leaf className="w-3 h-3 mr-1 text-green-400" />
                  <span className="text-green-100">{currentSeason}</span>
                </div>
              )}

              {currentZodiac && (
                <div className="bg-purple-900 bg-opacity-30 px-3 py-1 rounded-full text-xs flex items-center">
                  <Star className="w-3 h-3 mr-1 text-purple-400" />
                  <span className="text-purple-100">{currentZodiac}</span>
                </div>
              )}
            </div>
          </div>

          {transformedIngredients.length === 0 ? (
            <div className="bg-purple-900 bg-opacity-20 p-4 rounded">
              <p className="text-purple-300">
                No recommended ingredients found for the current planetary
                alignment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {transformedIngredients.map((ingredient, index) => {
                // Calculate additional properties
                const { alchemical, thermodynamic } =
                  calculateIngredientProperties(ingredient);

                return (
                  <div
                    key={index}
                    className="bg-opacity-20 bg-purple-900 rounded-lg p-4 hover:bg-opacity-30 transition-all"
                  >
                    <h4 className="font-medium text-white capitalize">
                      {ingredient.name.replace('_', ' ')}
                    </h4>

                    {ingredient.category && (
                      <div className="text-xs text-gray-400 mb-2">
                        {ingredient.category}
                      </div>
                    )}

                    {/* Thermodynamic Properties */}
                    <div className="mt-3 mb-2">
                      <h5 className="text-xs text-gray-300 mb-1">
                        Energy Properties
                      </h5>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div className="text-xs flex justify-between">
                          <span className="text-yellow-400">Heat:</span>
                          <span className="text-white">
                            {safelyFormatNumber(thermodynamic.heat * 100)}%
                          </span>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span className="text-indigo-400">Entropy:</span>
                          <span className="text-white">
                            {safelyFormatNumber(thermodynamic.entropy * 100)}%
                          </span>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span className="text-green-400">Reactivity:</span>
                          <span className="text-white">
                            {safelyFormatNumber(thermodynamic.reactivity * 100)}
                            %
                          </span>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span className="text-blue-400">Energy:</span>
                          <span className="text-white">
                            {safelyFormatNumber(thermodynamic.energy * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alchemical Properties */}
                    <div className="mt-3 mb-2">
                      <h5 className="text-xs text-gray-300 mb-1">
                        Alchemical Properties
                      </h5>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div className="text-xs flex justify-between">
                          <span className="text-purple-400">Spirit:</span>
                          <span className="text-white">
                            {safelyFormatNumber(alchemical.spirit * 100)}%
                          </span>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span className="text-pink-400">Essence:</span>
                          <span className="text-white">
                            {safelyFormatNumber(alchemical.essence * 100)}%
                          </span>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span className="text-amber-400">Matter:</span>
                          <span className="text-white">
                            {safelyFormatNumber(alchemical.matter * 100)}%
                          </span>
                        </div>
                        <div className="text-xs flex justify-between">
                          <span className="text-cyan-400">Substance:</span>
                          <span className="text-white">
                            {safelyFormatNumber(alchemical.substance * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add nutritional information section if available */}
                    {ingredient.nutritionalInfo && (
                      <div className="mt-2 mb-3">
                        <h5 className="text-xs text-gray-500 mb-1">
                          Nutritional Information
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          {ingredient.nutritionalInfo.calories && (
                            <div className="text-xs">
                              <span className="text-gray-400">Calories:</span>
                              <span className="text-white ml-1">
                                {ingredient.nutritionalInfo.calories}
                              </span>
                            </div>
                          )}
                          {ingredient.nutritionalInfo.protein && (
                            <div className="text-xs">
                              <span className="text-gray-400">Protein:</span>
                              <span className="text-white ml-1">
                                {ingredient.nutritionalInfo.protein}g
                              </span>
                            </div>
                          )}
                          {ingredient.nutritionalInfo.carbs && (
                            <div className="text-xs">
                              <span className="text-gray-400">Carbs:</span>
                              <span className="text-white ml-1">
                                {ingredient.nutritionalInfo.carbs}g
                              </span>
                            </div>
                          )}
                          {ingredient.nutritionalInfo.fat && (
                            <div className="text-xs">
                              <span className="text-gray-400">Fat:</span>
                              <span className="text-white ml-1">
                                {ingredient.nutritionalInfo.fat}g
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* If no Spoonacular data, show sensory profile or additional information if available */}
                    {!ingredient.nutritionalInfo &&
                      ingredient.sensoryProfile && (
                        <div className="mt-2 mb-3">
                          <h5 className="text-xs text-gray-500 mb-1">
                            Flavor Profile
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(
                              ingredient.sensoryProfile.taste || {}
                            )
                              .filter(([_, value]) => (value as number) > 0.5)
                              .slice(0, 3)
                              .map(([taste, value]) => (
                                <div
                                  key={taste}
                                  className="bg-purple-900 bg-opacity-30 px-2 py-0.5 rounded-full text-xs"
                                >
                                  {taste}: {Math.round((value as number) * 100)}
                                  %
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* If additional medicinal properties are available */}
                    {ingredient.medicinalProperties && (
                      <div className="mt-2 mb-3">
                        <h5 className="text-xs text-gray-500 mb-1">
                          Properties
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.medicinalProperties
                            .slice(0, 3)
                            .map((property: string, idx: number) => (
                              <div
                                key={idx}
                                className="bg-green-900 bg-opacity-30 px-2 py-0.5 rounded-full text-xs"
                              >
                                {property}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Elemental Properties visualization */}
                    <div className="mt-2 space-y-2">
                      {Object.entries(
                        ingredient.transformedElementalProperties || {}
                      )
                        .sort(([_, a], [__, b]) => b - a) // Sort by value, highest first
                        .map(([element, value]) => {
                          // Convert raw values to a more meaningful representation
                          // Instead of showing as percentages, represent as normalized strength (max 100%)
                          const totalElements = Object.values(
                            ingredient.transformedElementalProperties || {}
                          ).reduce((sum, val) => sum + val, 0);

                          // Calculate the relative strength (normalized to max 100%)
                          const normalizedValue =
                            totalElements > 0 ? value / (totalElements || 1) : 0;

                          // Generate width based on normalized value for visual bar
                          const width = `${Math.round(normalizedValue * 100)}%`;

                          // Get color based on element
                          const getElementColor = (elem: string) => {
                            switch (elem.toLowerCase()) {
                              case 'fire':
                                return 'bg-orange-500';
                              case 'water':
                                return 'bg-blue-500';
                              case 'earth':
                                return 'bg-green-500';
                              case 'air':
                                return 'bg-purple-500';
                              default:
                                return 'bg-gray-500';
                            }
                          };

                          // Show tarot highlight for elements matching the tarot card
                          const isTarotElement =
                            minorCard &&
                            element.toLowerCase() ===
                              minorCard.element?.toLowerCase();

                          return (
                            <div key={element} className="relative">
                              <div className="flex items-center text-xs justify-between mb-1">
                                <div className="flex items-center">
                                  {getElementIcon(element)}
                                  <span
                                    className={`ml-1 ${
                                      isTarotElement
                                        ? 'text-yellow-300 font-medium'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    {element}
                                    {isTarotElement && ' ✧'}
                                  </span>
                                </div>
                                <span className="text-gray-400">
                                  {safelyFormatNumber(normalizedValue * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-1.5">
                                <div
                                  className={`${getElementColor(
                                    element
                                  )} h-1.5 rounded-full`}
                                  style={{ width }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Energy Values with visualization */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-xs">
                        <span className="block text-gray-500 mb-1">Heat</span>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-800 rounded-full h-1.5 mr-2">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Math.round((ingredient.heat || 0) * 100)
                                  )
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-400">
                            {safelyFormatNumber(ingredient.heat)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="block text-gray-500 mb-1">
                          Entropy
                        </span>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-800 rounded-full h-1.5 mr-2">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Math.round((ingredient.entropy || 0) * 100)
                                  )
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-400">
                            {safelyFormatNumber(ingredient.entropy)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className="block text-gray-500 mb-1">Energy</span>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-800 rounded-full h-1.5 mr-2">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Math.round(
                                      (ingredient.gregsEnergy || 0) * 100
                                    )
                                  )
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-400">
                            {safelyFormatNumber(ingredient.gregsEnergy)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add modality information if available */}
                    {ingredient.modality && (
                      <div className="mt-3 mb-2">
                        <span className="text-xs text-gray-500 mb-1 block">
                          Quality:
                        </span>
                        <div className="bg-indigo-900 bg-opacity-30 inline-block px-2 py-0.5 rounded-full text-xs">
                          {ingredient.modality}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoodRecommender;
