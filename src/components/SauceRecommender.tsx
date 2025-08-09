import { Check, ChevronDown, ChevronUp, Droplet, Flame, Mountain, Wind } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Sauce } from '@/data/sauces';
import { ElementalProperties } from '@/types/alchemy';

interface SauceRecommenderProps {
  currentElementalProfile?: ElementalProperties;
  cuisine?: string;
  protein?: string;
  vegetable?: string;
  cookingMethod?: string;
  showByRegion?: boolean;
  showByAstrological?: boolean;
  showByDietary?: boolean;
  maxResults?: number;
  sauces?: Record<string, Sauce>;
  cuisines?: unknown;
  className?: string;
}

export default function SauceRecommender({
  currentElementalProfile = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  cuisine,
  protein,
  vegetable,
  cookingMethod,
  showByRegion = true,
  showByAstrological = true,
  showByDietary = false,
  maxResults = 16,
  sauces,
  cuisines,
  className,
}: SauceRecommenderProps) {
  type SauceRecommendation = {
    id: string;
    name: string;
    description: string;
    category: 'forProtein' | 'forVegetable' | 'forCookingMethod' | 'byCuisine' | 'crossCultural';
    forItem?: string;
    cuisine?: string;
    ingredients?: unknown[];
    culinaryUses?: unknown[];
    preparationNotes?: string;
    preparationSteps?: string[] | string;
    procedure?: string[] | string;
    instructions?: string[] | string;
    technicalTips?: string;
    elementalProperties: ElementalProperties;
    matchScore: number;
    elementalMatchScore: number;
    planetaryDayScore: number;
    planetaryHourScore: number;
    isFusion?: boolean;
    seasonality?: string;
    base?: string;
    variants?: string[] | string;
    usage?: string;
    prepTime?: string;
    cookTime?: string;
    yield?: string;
    difficulty?: string;
    storageInstructions?: string;
  };

  const [sauceRecommendations, setSauceRecommendations] = useState<SauceRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSauceCards, setExpandedSauceCards] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Generate sauce recommendations when component mounts or when inputs change
    const generateRecommendations = async () => {
      setLoading(true);
      try {
        // Wait for any async data to load
        const recommendations = await generateSauceRecommendations();
        setSauceRecommendations(recommendations);
      } catch (error) {
        console.error('Error generating sauce recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [cuisine, protein, vegetable, cookingMethod, currentElementalProfile]);

  // Toggle function for sauce card expansion
  const toggleSauceCard = (sauceId: string) => {
    setExpandedSauceCards(prev => ({
      ...prev,
      [sauceId]: !prev[sauceId],
    }));
  };

  // Calculate elemental match between sauce and current profile
  const calculateElementalMatch = (
    sauceElements: ElementalProperties,
    userElements: ElementalProperties,
  ): number => {
    // Ensure properties exist
    const elements = ['Fire', 'Water', 'Earth', 'Air'];

    // Calculate Euclidean distance (lower is better)
    let sumSquaredDiff = 0;
    elements.forEach(element => {
      const elementKey = element as keyof ElementalProperties;
      const diff = (sauceElements[elementKey] || 0) - (userElements[elementKey] || 0);
      sumSquaredDiff += diff * diff;
    });

    // Convert to similarity score (higher is better)
    // Distance of 0 = perfect match (1.0)
    // Maximum possible distance = 2 (sqrt(4)) when opposite elements
    const distance = Math.sqrt(sumSquaredDiff);
    const maxDistance = Math.sqrt(4); // Maximum possible distance (theoretical)
    const similarity = 1 - distance / maxDistance;

    // Ensure score is in [0,1]
    return Math.max(0, Math.min(1, similarity));
  };

  // Helper function to determine if it's currently daytime (6am-6pm)
  const isDaytime = (date: Date = new Date()): boolean => {
    const hour = date.getHours();
    return hour >= 6 && hour < 18;
  };

  // Map planets to their elemental influences (diurnal and nocturnal elements)
  const planetaryElements: Record<string, { diurnal: string; nocturnal: string }> = {
    Sun: { diurnal: 'Fire', nocturnal: 'Fire' },
    Moon: { diurnal: 'Water', nocturnal: 'Water' },
    Mercury: { diurnal: 'Air', nocturnal: 'Earth' },
    Venus: { diurnal: 'Water', nocturnal: 'Earth' },
    Mars: { diurnal: 'Fire', nocturnal: 'Water' },
    Jupiter: { diurnal: 'Air', nocturnal: 'Fire' },
    Saturn: { diurnal: 'Air', nocturnal: 'Earth' },
    Uranus: { diurnal: 'Water', nocturnal: 'Air' },
    Neptune: { diurnal: 'Water', nocturnal: 'Water' },
    Pluto: { diurnal: 'Earth', nocturnal: 'Water' },
  };

  // Calculate planetary day influence score
  const calculatePlanetaryDayInfluence = (
    sauceElements: ElementalProperties,
    planetaryDay: string,
    planetAffinity?: string[],
  ): number => {
    // Get the elements associated with the current planetary day
    const dayElements = planetaryElements[planetaryDay];
    if (!dayElements) return 0.5; // Unknown planet

    // For planetary day, BOTH diurnal and nocturnal elements influence all day
    const diurnalElement = dayElements.diurnal;
    const nocturnalElement = dayElements.nocturnal;

    // Calculate how much of each planetary element is present in the sauce
    const diurnalMatch = sauceElements[diurnalElement] || 0;
    const nocturnalMatch = sauceElements[nocturnalElement] || 0;

    // Calculate a weighted score - both elements are equally important for planetary day
    let elementalScore = (diurnalMatch + nocturnalMatch) / 2;

    // If the sauce has a direct planetary affinity, give bonus points
    if (planetAffinity?.some(p => p.toLowerCase() === planetaryDay.toLowerCase())) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return elementalScore;
  };

  // Calculate planetary hour influence score
  const calculatePlanetaryHourInfluence = (
    sauceElements: ElementalProperties,
    planetaryHour: string,
    isDaytime: boolean,
    planetAffinity?: string[],
  ): number => {
    // Get the elements associated with the current planetary hour
    const hourElements = planetaryElements[planetaryHour];
    if (!hourElements) return 0.5; // Unknown planet

    // For planetary hour, use diurnal element during day, nocturnal at night
    const relevantElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;

    // Calculate how much of the relevant planetary element is present in the sauce
    const elementalMatch = sauceElements[relevantElement] || 0;

    // Calculate score based on how well the sauce matches the planetary hour's element
    let elementalScore = elementalMatch;

    // If the sauce has a direct planetary affinity, give bonus points
    if (planetAffinity?.some(p => p.toLowerCase() === planetaryHour.toLowerCase())) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return elementalScore;
  };

  // Helper function to determine ingredient amounts
  const getIngredientAmountRange = (ingredient: string): string => {
    const ing = ingredient.toLowerCase();

    // Return appropriate range based on ingredient type
    if (ing.includes('oil')) return '2-4 tbsp';
    if (ing.includes('olive oil')) return '3-5 tbsp';
    if (ing.includes('butter')) return '2-4 tbsp';
    if (ing.includes('cream')) return '3/4-1 cup';
    if (ing.includes('milk')) return '3/4-1 cup';
    if (ing.includes('wine')) return '1/3-1/2 cup';
    if (ing.includes('stock') || ing.includes('broth')) return '3/4-1 1/4 cups';
    if (ing.includes('garlic')) return '2-5 cloves, minced';
    if (ing.includes('onion')) return '1/2-1, diced';
    if (ing.includes('shallot')) return '1-3, minced';
    if (ing.includes('tomato') && !ing.includes('paste')) return '1-2 cups, chopped';
    if (ing.includes('tomato paste')) return '1-3 tbsp';
    if (
      ing.includes('herb') ||
      ing.includes('basil') ||
      ing.includes('parsley') ||
      ing.includes('cilantro')
    )
      return '1-3 tbsp, chopped';
    if (ing.includes('spice') || ing.includes('pepper') || ing.includes('salt')) return 'to taste';
    if (ing.includes('lemon') || ing.includes('lime')) return '1/2-1, juiced';
    if (ing.includes('vinegar')) return '1-3 tbsp';
    if (ing.includes('mustard')) return '1/2-2 tbsp';
    if (ing.includes('honey') || ing.includes('sugar')) return '1/2-2 tsp';
    if (ing.includes('cheese')) return '1/4-3/4 cup, grated';
    if (ing.includes('flour')) return '1-3 tbsp';
    if (ing.includes('nut')) return '2-4 tbsp, chopped';
    if (ing.includes('anchovy')) return '3-6 fillets';
    if (ing.includes('chili')) return '1-2, chopped';
    if (ing.includes('ginger')) return '1-2 tbsp, minced';
    if (ing.includes('soy sauce')) return '1-3 tbsp';
    if (ing.includes('sesame oil')) return '1/2-2 tsp';
    if (ing.includes('mushroom')) return '3/4-1 1/2 cups, sliced';

    // Sauce-specific ingredients
    if (ing.includes('yogurt')) return '1/2-1 cup';
    if (ing.includes('tahini')) return '2-4 tbsp';
    if (ing.includes('miso')) return '1-3 tbsp';
    if (ing.includes('fish sauce')) return '1-3 tbsp';
    if (ing.includes('coconut milk')) return '3/4-1 cup';
    if (ing.includes('egg')) return '1-2';
    if (ing.includes('cornstarch')) return '1-2 tbsp';

    // Default range for other ingredients
    return 'to taste, as needed';
  };

  // Generate sauce recommendations based on criteria
  const _generateSauceRecommendations = async (): Promise<SauceRecommendation[]> => {
    // Initialize results array
    const results: SauceRecommendation[] = [];

    // Get all available sauces from props or try to import if not provided
    const allAvailableSauces: Record<string, Sauce> = sauces || {};

    // Get all available cuisines
    const allCuisines = cuisines || {};

    // If we have a specific cuisine, prioritize its sauces
    if (cuisine && allCuisines[cuisine.toLowerCase()]?.traditionalSauces) {
      const cuisineData = allCuisines[cuisine.toLowerCase()];
      const sauceRecommender = cuisineData.sauceRecommender || {};

      // Add sauce recommendations based on protein
      if (protein && sauceRecommender.forProtein && sauceRecommender.forProtein[protein]) {
        sauceRecommender.forProtein[protein].forEach((sauceName: string) => {
          // Find the sauce data in the traditionalSauces
          Object.entries(cuisineData.traditionalSauces).forEach(
            ([id, sauceData]: [string, unknown]) => {
              const sd = sauceData as Record<string, any>;
              if (String(sd.name || '').toLowerCase() === sauceName.toLowerCase()) {
                // Get current time factors
                const { getTimeFactors } = require('@/types/time');
                const timeFactors = getTimeFactors();

                // Basic elemental match calculation
                const elementalMatchScore = calculateElementalMatch(
                  sd.elementalProperties as ElementalProperties,
                  currentElementalProfile,
                );

                // Calculate planetary day influence
                const planetaryDayScore = calculatePlanetaryDayInfluence(
                  sd.elementalProperties as ElementalProperties,
                  timeFactors.planetaryDay.planet,
                  sd.astrologicalAffinities?.planets,
                );

                // Calculate planetary hour influence
                const planetaryHourScore = calculatePlanetaryHourInfluence(
                  sd.elementalProperties as ElementalProperties,
                  timeFactors.planetaryHour.planet,
                  isDaytime(),
                  sd.astrologicalAffinities?.planets,
                );

                // Calculate final match score with weights
                const weights = {
                  elemental: 0.45, // Elemental match: 45%
                  planetaryDay: 0.35, // Planetary day: 35%
                  planetaryHour: 0.2, // Planetary hour: 20%
                };

                const finalScore =
                  elementalMatchScore * weights.elemental +
                  planetaryDayScore * weights.planetaryDay +
                  planetaryHourScore * weights.planetaryHour;

                results.push({
                  id: `${cuisine.toLowerCase()}-${id}`,
                  name: String(sd.name),
                  description: String(sd.description || ''),
                  category: 'forProtein',
                  forItem: protein,
                  cuisine: cuisine,
                  ingredients: (sd.keyIngredients as unknown[]) || [],
                  culinaryUses: (sd.culinaryUses as unknown[]) || [],
                  preparationNotes: String(sd.preparationNotes || ''),
                  technicalTips: String(sd.technicalTips || ''),
                  elementalProperties: sd.elementalProperties as ElementalProperties,
                  matchScore: finalScore,
                  elementalMatchScore: elementalMatchScore,
                  planetaryDayScore: planetaryDayScore,
                  planetaryHourScore: planetaryHourScore,
                });
              }
            },
          );
        });
      }

      // Add sauce recommendations based on vegetable
      if (vegetable && sauceRecommender.forVegetable && sauceRecommender.forVegetable[vegetable]) {
        sauceRecommender.forVegetable[vegetable].forEach((sauceName: string) => {
          // Find the sauce data in the traditionalSauces
          Object.entries(cuisineData.traditionalSauces).forEach(
            ([id, sauceData]: [string, unknown]) => {
              const sd = sauceData as Record<string, any>;
              if (String(sd.name || '').toLowerCase() === sauceName.toLowerCase()) {
                // Get current time factors
                const { getTimeFactors } = require('@/types/time');
                const timeFactors = getTimeFactors();

                // Basic elemental match calculation
                const elementalMatchScore = calculateElementalMatch(
                  sd.elementalProperties as ElementalProperties,
                  currentElementalProfile,
                );

                // Calculate planetary day influence
                const planetaryDayScore = calculatePlanetaryDayInfluence(
                  sd.elementalProperties as ElementalProperties,
                  timeFactors.planetaryDay.planet,
                  sd.astrologicalAffinities?.planets,
                );

                // Calculate planetary hour influence
                const planetaryHourScore = calculatePlanetaryHourInfluence(
                  sd.elementalProperties as ElementalProperties,
                  timeFactors.planetaryHour.planet,
                  isDaytime(),
                  sd.astrologicalAffinities?.planets,
                );

                // Calculate final match score with weights
                const weights = {
                  elemental: 0.45, // Elemental match: 45%
                  planetaryDay: 0.35, // Planetary day: 35%
                  planetaryHour: 0.2, // Planetary hour: 20%
                };

                const finalScore =
                  elementalMatchScore * weights.elemental +
                  planetaryDayScore * weights.planetaryDay +
                  planetaryHourScore * weights.planetaryHour;

                results.push({
                  id: `${cuisine.toLowerCase()}-${id}`,
                  name: String(sd.name),
                  description: String(sd.description || ''),
                  category: 'forVegetable',
                  forItem: vegetable,
                  cuisine: cuisine,
                  ingredients: (sd.keyIngredients as unknown[]) || [],
                  culinaryUses: (sd.culinaryUses as unknown[]) || [],
                  preparationNotes: String(sd.preparationNotes || ''),
                  technicalTips: String(sd.technicalTips || ''),
                  elementalProperties: sd.elementalProperties as ElementalProperties,
                  matchScore: finalScore,
                  elementalMatchScore: elementalMatchScore,
                  planetaryDayScore: planetaryDayScore,
                  planetaryHourScore: planetaryHourScore,
                });
              }
            },
          );
        });
      }

      // Add sauce recommendations based on cooking method
      if (
        cookingMethod &&
        sauceRecommender.forCookingMethod &&
        sauceRecommender.forCookingMethod[cookingMethod]
      ) {
        sauceRecommender.forCookingMethod[cookingMethod].forEach((sauceName: string) => {
          // Find the sauce data in the traditionalSauces
          Object.entries(cuisineData.traditionalSauces).forEach(
            ([id, sauceData]: [string, unknown]) => {
              const sd = sauceData as Record<string, any>;
              if (String(sd.name || '').toLowerCase() === sauceName.toLowerCase()) {
                // Get current time factors
                const { getTimeFactors } = require('@/types/time');
                const timeFactors = getTimeFactors();

                // Basic elemental match calculation
                const elementalMatchScore = calculateElementalMatch(
                  sd.elementalProperties as ElementalProperties,
                  currentElementalProfile,
                );

                // Calculate planetary day influence
                const planetaryDayScore = calculatePlanetaryDayInfluence(
                  sd.elementalProperties as ElementalProperties,
                  timeFactors.planetaryDay.planet,
                  sd.astrologicalAffinities?.planets,
                );

                // Calculate planetary hour influence
                const planetaryHourScore = calculatePlanetaryHourInfluence(
                  sd.elementalProperties as ElementalProperties,
                  timeFactors.planetaryHour.planet,
                  isDaytime(),
                  sd.astrologicalAffinities?.planets,
                );

                // Calculate final match score with weights
                const weights = {
                  elemental: 0.45, // Elemental match: 45%
                  planetaryDay: 0.35, // Planetary day: 35%
                  planetaryHour: 0.2, // Planetary hour: 20%
                };

                const finalScore =
                  elementalMatchScore * weights.elemental +
                  planetaryDayScore * weights.planetaryDay +
                  planetaryHourScore * weights.planetaryHour;

                results.push({
                  id: `${cuisine.toLowerCase()}-${id}`,
                  name: String(sd.name),
                  description: String(sd.description || ''),
                  category: 'forCookingMethod',
                  forItem: cookingMethod,
                  cuisine: cuisine,
                  ingredients: (sd.keyIngredients as unknown[]) || [],
                  culinaryUses: (sd.culinaryUses as unknown[]) || [],
                  preparationNotes: String(sd.preparationNotes || ''),
                  technicalTips: String(sd.technicalTips || ''),
                  elementalProperties: sd.elementalProperties as ElementalProperties,
                  matchScore: finalScore,
                  elementalMatchScore: elementalMatchScore,
                  planetaryDayScore: planetaryDayScore,
                  planetaryHourScore: planetaryHourScore,
                });
              }
            },
          );
        });
      }

      // If we don't have specific filters, add all sauces from the cuisine
      if (!protein && !vegetable && !cookingMethod) {
        Object.entries(cuisineData.traditionalSauces).forEach(
          ([id, sauceData]: [string, unknown]) => {
            const sd = sauceData as Record<string, any>;
            // Get current time factors
            const { getTimeFactors } = require('@/types/time');
            const timeFactors = getTimeFactors();

            // Basic elemental match calculation
            const elementalMatchScore = calculateElementalMatch(
              sd.elementalProperties as ElementalProperties,
              currentElementalProfile,
            );

            // Calculate planetary day influence
            const planetaryDayScore = calculatePlanetaryDayInfluence(
              sd.elementalProperties as ElementalProperties,
              timeFactors.planetaryDay.planet,
              sd.astrologicalAffinities?.planets,
            );

            // Calculate planetary hour influence
            const planetaryHourScore = calculatePlanetaryHourInfluence(
              sd.elementalProperties as ElementalProperties,
              timeFactors.planetaryHour.planet,
              isDaytime(),
              sd.astrologicalAffinities?.planets,
            );

            // Calculate final match score with weights
            const weights = {
              elemental: 0.45, // Elemental match: 45%
              planetaryDay: 0.35, // Planetary day: 35%
              planetaryHour: 0.2, // Planetary hour: 20%
            };

            const finalScore =
              elementalMatchScore * weights.elemental +
              planetaryDayScore * weights.planetaryDay +
              planetaryHourScore * weights.planetaryHour;

            results.push({
              id: `${cuisine.toLowerCase()}-${id}`,
              name: String(sd.name),
              description: String(sd.description || ''),
              category: 'byCuisine',
              forItem: cuisine,
              cuisine: cuisine,
              ingredients: (sd.keyIngredients as unknown[]) || [],
              culinaryUses: (sd.culinaryUses as unknown[]) || [],
              preparationNotes: String(sd.preparationNotes || ''),
              technicalTips: String(sd.technicalTips || ''),
              elementalProperties: sd.elementalProperties as ElementalProperties,
              matchScore: finalScore,
              elementalMatchScore: elementalMatchScore,
              planetaryDayScore: planetaryDayScore,
              planetaryHourScore: planetaryHourScore,
            });
          },
        );
      }
    }

    // If we still need more recommendations or don't have a specific cuisine
    if (results.length < maxResults) {
      // Add cross-cultural recommendations based on elemental profile
      Object.entries(allCuisines).forEach(([cuisineId, cuisineData]: [string, unknown]) => {
        const cd = cuisineData as Record<string, any>;
        // Skip if this is the same as our specific cuisine
        if (cuisine && cuisineId.toLowerCase() === cuisine.toLowerCase()) {
          return;
        }

        // Only consider cuisines with traditional sauces
        if (cd.traditionalSauces) {
          Object.entries(cd.traditionalSauces).forEach(([id, sauceData]: [string, unknown]) => {
            const sd = sauceData as Record<string, any>;
            // Get current time factors
            const { getTimeFactors } = require('@/types/time');
            const timeFactors = getTimeFactors();

            // Basic elemental match calculation
            const elementalMatchScore = calculateElementalMatch(
              sd.elementalProperties as ElementalProperties,
              currentElementalProfile,
            );

            // Calculate planetary day influence
            const planetaryDayScore = calculatePlanetaryDayInfluence(
              sd.elementalProperties as ElementalProperties,
              timeFactors.planetaryDay.planet,
              sd.astrologicalAffinities?.planets,
            );

            // Calculate planetary hour influence
            const planetaryHourScore = calculatePlanetaryHourInfluence(
              sd.elementalProperties as ElementalProperties,
              timeFactors.planetaryHour.planet,
              isDaytime(),
              sd.astrologicalAffinities?.planets,
            );

            // Calculate final match score with weights
            const weights = {
              elemental: 0.45, // Elemental match: 45%
              planetaryDay: 0.35, // Planetary day: 35%
              planetaryHour: 0.2, // Planetary hour: 20%
            };

            const finalScore =
              elementalMatchScore * weights.elemental +
              planetaryDayScore * weights.planetaryDay +
              planetaryHourScore * weights.planetaryHour;

            // More restrictive filtering for cross-cuisine sauce recommendations
            // Increased threshold and added exclusion rules based on culinary appropriateness
            if (finalScore > 0.85) {
              // Increased from 0.65 for higher quality matches
              // Skip inappropriate combinations
              if (_shouldExcludeSauceCombination(String(sd.name || ''), cuisine)) {
                return;
              }

              results.push({
                id: `${cuisineId}-${id}`,
                name: String(sd.name),
                description: String(sd.description || ''),
                category: 'crossCultural',
                forItem: 'elemental match',
                cuisine: String(cd.name || cuisineId),
                ingredients: (sd.keyIngredients as unknown[]) || [],
                culinaryUses: (sd.culinaryUses as unknown[]) || [],
                preparationNotes: String(sd.preparationNotes || ''),
                technicalTips: String(sd.technicalTips || ''),
                elementalProperties: sd.elementalProperties as ElementalProperties,
                matchScore: finalScore,
                elementalMatchScore: elementalMatchScore,
                planetaryDayScore: planetaryDayScore,
                planetaryHourScore: planetaryHourScore,
                isFusion: true,
              });
            }
          });
        }
      });
    }

    // Remove duplicates and sort by match score
    const uniqueResults = results.filter(
      (sauce, index, self) =>
        index ===
        self.findIndex(
          s => (s as Record<string, unknown>).name === (sauce as Record<string, unknown>).name,
        ),
    );

    return uniqueResults
      .sort(
        (a, b) =>
          Number((b as Record<string, unknown>).matchScore || 0) -
          Number((a as Record<string, unknown>).matchScore || 0),
      )
      .slice(0, maxResults);
  };

  // Align function name used by effect
  const generateSauceRecommendations = _generateSauceRecommendations;

  // Helper function to determine if a sauce-cuisine combination should be excluded
  const _shouldExcludeSauceCombination = (sauceName: string, targetCuisine?: string): boolean => {
    if (!targetCuisine) return false;

    // Define incompatible sauce-cuisine pairs
    const incompatiblePairs: Record<string, string[]> = {
      thai: ['marinara', 'bolognese', 'bechamel', 'alfredo', 'ragu', 'gravy'],
      italian: ['fish sauce', 'soy sauce', 'curry paste', 'gochujang', 'teriyaki'],
      indian: ['aioli', 'bechamel', 'hollandaise', 'carbonara'],
      japanese: ['chimichurri', 'guacamole', 'marinara', 'bechamel'],
      mexican: ['soy sauce', 'fish sauce', 'oyster sauce', 'teriyaki'],
      french: ['soy sauce', 'gochujang', 'sweet chili', 'curry paste'],
      korean: ['marinara', 'bechamel', 'pesto', 'carbonara'],
      chinese: ['guacamole', 'chimichurri', 'aioli', 'hollandaise'],
    };

    // Normalize cuisine and sauce names for comparison
    const normalizedCuisine = targetCuisine.toLowerCase();
    const normalizedSauceName = sauceName.toLowerCase();

    // Check if this cuisine has incompatible sauces defined
    if (incompatiblePairs[normalizedCuisine]) {
      // Check if the sauce name contains any of the incompatible terms
      return incompatiblePairs[normalizedCuisine].some(incompatibleSauce =>
        normalizedSauceName.includes(incompatibleSauce),
      );
    }

    return false;
  };

  // Helper function to render the sauce element icons
  const _renderElementIcons = (elementalProps: ElementalProperties) => {
    const dominant = Object.entries(elementalProps).sort(([, a], [, b]) => b - a)[0][0];

    return (
      <div className='flex gap-1'>
        <Flame className={`h-3 w-3 ${dominant === 'Fire' ? 'text-red-500' : 'text-gray-300'}`} />
        <Droplet
          className={`h-3 w-3 ${dominant === 'Water' ? 'text-blue-500' : 'text-gray-300'}`}
        />
        <Wind className={`h-3 w-3 ${dominant === 'Air' ? 'text-purple-500' : 'text-gray-300'}`} />
        <Mountain
          className={`h-3 w-3 ${dominant === 'Earth' ? 'text-amber-500' : 'text-gray-300'}`}
        />
      </div>
    );
  };

  // Render match score badge
  const renderMatchBadge = (score: number) => {
    let colorClass = '';
    let label = '';

    if (score >= 0.9) {
      colorClass = 'bg-green-100 text-green-700';
      label = 'Perfect Match';
    } else if (score >= 0.8) {
      colorClass = 'bg-green-50 text-green-600';
      label = 'Great Match';
    } else if (score >= 0.7) {
      colorClass = 'bg-blue-50 text-blue-600';
      label = 'Good Match';
    } else if (score >= 0.6) {
      colorClass = 'bg-yellow-50 text-yellow-600';
      label = 'Fair Match';
    } else {
      colorClass = 'bg-gray-100 text-gray-600';
      label = 'Basic Match';
    }

    return (
      <span className={`flex items-center rounded-full px-2 py-0.5 text-xs ${colorClass}`}>
        <Check className='mr-1 h-3 w-3' />
        {label}
      </span>
    );
  };

  // Filter sauces based on current filter
  const filteredSauces = () => {
    if (filter === 'all') {
      return sauceRecommendations;
    }

    return sauceRecommendations.filter(sauce =>
      filter === 'fusion'
        ? sauce.isFusion
        : filter === 'traditional'
          ? !sauce.isFusion
          : filter === sauce.category,
    );
  };

  if (loading) {
    return (
      <div className={`rounded-lg bg-white p-4 shadow-md ${className}`}>
        <h3 className='mb-2 text-lg font-medium'>Sauce Recommendations</h3>
        <div className='animate-pulse space-y-3'>
          <div className='h-4 w-3/4 rounded bg-gray-200'></div>
          <div className='h-24 rounded bg-gray-200'></div>
          <div className='h-24 rounded bg-gray-200'></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-white p-4 shadow-md ${className}`}>
      <h3 className='mb-4 text-lg font-medium'>Sauce Recommendations</h3>

      {/* Filters */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-xs ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('traditional')}
          className={`rounded-full px-3 py-1 text-xs ${filter === 'traditional' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}
        >
          Traditional
        </button>
        <button
          onClick={() => setFilter('fusion')}
          className={`rounded-full px-3 py-1 text-xs ${filter === 'fusion' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
        >
          Fusion
        </button>
        {protein && (
          <button
            onClick={() => setFilter('forProtein')}
            className={`rounded-full px-3 py-1 text-xs ${filter === 'forProtein' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            For {protein}
          </button>
        )}
        {vegetable && (
          <button
            onClick={() => setFilter('forVegetable')}
            className={`rounded-full px-3 py-1 text-xs ${filter === 'forVegetable' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            For {vegetable}
          </button>
        )}
        {cookingMethod && (
          <button
            onClick={() => setFilter('forCookingMethod')}
            className={`rounded-full px-3 py-1 text-xs ${filter === 'forCookingMethod' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            For {cookingMethod}
          </button>
        )}
      </div>

      {/* Sauce cards */}
      {filteredSauces().length === 0 ? (
        <div className='py-6 text-center text-gray-500'>
          <p>No sauce recommendations found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {filteredSauces().map((sauce, index) => {
            const isExpanded = expandedSauceCards[sauce.id] || false;

            // Determine styling based on dominant element
            const elementalProps = sauce.elementalProperties || {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            };
            const dominant = Object.entries(elementalProps).sort(([, a], [, b]) => {
              // Pattern KK-10: Final Arithmetic Elimination continuation
              const numericA = Number(a) || 0;
              const numericB = Number(b) || 0;
              return numericB - numericA;
            })[0][0];
            const elementClass = dominant.toLowerCase();

            return (
              <div
                key={sauce.id || index}
                className={`rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${isExpanded ? 'bg-gray-50' : 'bg-white'} ${isExpanded ? '' : 'h-fit'} ${
                  elementClass === 'fire'
                    ? 'border-l-4 border-red-500'
                    : elementClass === 'water'
                      ? 'border-l-4 border-blue-500'
                      : elementClass === 'earth'
                        ? 'border-l-4 border-green-500'
                        : elementClass === 'air'
                          ? 'border-l-4 border-purple-500'
                          : ''
                }`}
              >
                {/* Card Header - Always visible */}
                <div className='p-3 pb-2'>
                  <div className='flex items-start justify-between'>
                    <h4 className='text-base font-medium'>{sauce.name}</h4>
                    {renderMatchBadge(sauce.matchScore)}
                  </div>

                  {/* Compact Description */}
                  <p className='my-1 line-clamp-2 text-xs text-gray-600'>{sauce.description}</p>

                  {/* Cuisine Tags */}
                  <div className='mb-1 flex flex-wrap gap-1'>
                    {sauce.cuisine && (
                      <span className='rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700'>
                        {sauce.cuisine}
                      </span>
                    )}
                    {sauce.base && (
                      <span className='rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700'>
                        {sauce.base}
                      </span>
                    )}
                    {sauce.isFusion && (
                      <span className='rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700'>
                        Fusion
                      </span>
                    )}
                  </div>

                  {/* Element Display */}
                  <div className='mt-2 flex items-center justify-between text-xs'>
                    <div className='flex gap-1'>
                      <Flame
                        className={`h-3 w-3 ${elementClass === 'fire' ? 'text-red-500' : 'text-gray-300'}`}
                      />
                      <Droplet
                        className={`h-3 w-3 ${elementClass === 'water' ? 'text-blue-500' : 'text-gray-300'}`}
                      />
                      <Wind
                        className={`h-3 w-3 ${elementClass === 'air' ? 'text-purple-500' : 'text-gray-300'}`}
                      />
                      <Mountain
                        className={`h-3 w-3 ${elementClass === 'earth' ? 'text-green-500' : 'text-gray-300'}`}
                      />
                    </div>

                    {/* Show top 3 ingredients or category */}
                    {sauce.ingredients && sauce.ingredients.length > 0 ? (
                      <div className='text-xs text-gray-500'>
                        {sauce.ingredients.slice(0, 3).map((ing, idx, arr) => (
                          <React.Fragment key={idx}>
                            <span>{typeof ing === 'string' ? ing : String(ing)}</span>
                            {idx < arr.length - 1 && idx < 2 && ', '}
                          </React.Fragment>
                        ))}
                        {sauce.ingredients.length > 3 && (
                          <span> +{sauce.ingredients.length - 3}</span>
                        )}
                      </div>
                    ) : sauce.category === 'forProtein' ? (
                      <span className='text-xs text-blue-600'>For {sauce.forItem}</span>
                    ) : sauce.category === 'forVegetable' ? (
                      <span className='text-xs text-green-600'>For {sauce.forItem}</span>
                    ) : sauce.category === 'forCookingMethod' ? (
                      <span className='text-xs text-orange-600'>For {sauce.forItem}</span>
                    ) : null}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className='border-t border-gray-100 px-3 py-2'>
                    {/* Detailed Info */}
                    <div className='mb-2 grid grid-cols-2 gap-3'>
                      {/* Key Ingredients Column */}
                      <div>
                        <h5 className='mb-1 text-xs font-medium'>Key Ingredients:</h5>
                        <ul className='pl-2'>
                          {sauce.ingredients &&
                            sauce.ingredients.map((ing, idx) => (
                              <li key={idx} className='flex items-start text-xs text-gray-600'>
                                <span className='mr-2 mt-1.5 inline-block h-1 w-1 rounded-full bg-gray-400'></span>
                                <span>
                                  {typeof ing === 'string' ? ing : String(ing)}
                                  {` - ${getIngredientAmountRange(typeof ing === 'string' ? ing : String(ing))}`}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Culinary Uses Column */}
                      <div>
                        <h5 className='mb-1 text-xs font-medium'>Uses:</h5>
                        <ul className='pl-2'>
                          {sauce.culinaryUses &&
                            sauce.culinaryUses.map((use, idx) => (
                              <li key={idx} className='flex items-start text-xs text-gray-600'>
                                <span className='mr-2 mt-1.5 inline-block h-1 w-1 rounded-full bg-gray-400'></span>
                                <span>{String(use)}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    {/* Notes */}
                    {(sauce.preparationNotes || sauce.technicalTips) && (
                      <div className='mb-2 rounded bg-amber-50 p-2 text-xs'>
                        {sauce.preparationNotes && (
                          <p className='mb-1'>
                            <span className='font-medium'>Chef's Notes:</span>{' '}
                            {sauce.preparationNotes}
                          </p>
                        )}
                        {sauce.technicalTips && (
                          <p>
                            <span className='font-medium'>Tips:</span> {sauce.technicalTips}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Seasonality */}
                    {sauce.seasonality && (
                      <div className='text-xs text-gray-600'>
                        <span className='font-medium'>Season:</span> {sauce.seasonality}
                      </div>
                    )}

                    {/* Consistently display preparation steps using various possible field names */}
                    {(sauce.preparationSteps || sauce.procedure || sauce.instructions) && (
                      <div className='mt-2'>
                        <h6 className='mb-1 font-medium'>Preparation:</h6>
                        {Array.isArray(
                          (sauce.preparationSteps as unknown) ||
                            (sauce.procedure as unknown) ||
                            (sauce.instructions as unknown),
                        ) ? (
                          <ol className='list-decimal pl-4'>
                            {(
                              (sauce.preparationSteps as string[]) ||
                              (sauce.procedure as string[]) ||
                              (sauce.instructions as string[])
                            ).map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        ) : (
                          <p>
                            {(sauce.preparationSteps as string) ||
                              (sauce.procedure as string) ||
                              (sauce.instructions as string)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Add additional sauce information */}
                    {sauce.prepTime && (
                      <div className='mt-1'>
                        <span className='text-gray-500'>Prep time: </span>
                        <span>{sauce.prepTime}</span>
                      </div>
                    )}

                    {sauce.cookTime && (
                      <div className='mt-1'>
                        <span className='text-gray-500'>Cook time: </span>
                        <span>{sauce.cookTime}</span>
                      </div>
                    )}

                    {sauce.yield && (
                      <div className='mt-1'>
                        <span className='text-gray-500'>Yield: </span>
                        <span>{sauce.yield}</span>
                      </div>
                    )}

                    {sauce.difficulty && (
                      <div className='mt-1'>
                        <span className='text-gray-500'>Difficulty: </span>
                        <span>{sauce.difficulty}</span>
                      </div>
                    )}

                    {sauce.storageInstructions && (
                      <div className='mt-1'>
                        <h6 className='mb-1 font-medium'>Storage:</h6>
                        <p>{sauce.storageInstructions}</p>
                      </div>
                    )}

                    {sauce.technicalTips && (
                      <div className='mt-1'>
                        <h6 className='mb-1 font-medium'>Technical Tips:</h6>
                        <p>{sauce.technicalTips}</p>
                      </div>
                    )}

                    {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
                      <div className='mt-1'>
                        <h6 className='mb-1 font-medium'>Culinary Uses:</h6>
                        <ul className='list-disc pl-4'>
                          {Array.isArray(sauce.culinaryUses) ? (
                            sauce.culinaryUses.map((use: string, i: number) => (
                              <li key={i}>{use}</li>
                            ))
                          ) : (
                            <li>{sauce.culinaryUses}</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {sauce.variants && sauce.variants.length > 0 && (
                      <div className='mt-1'>
                        <h6 className='mb-1 font-medium'>Variants:</h6>
                        <ul className='list-disc pl-4'>
                          {Array.isArray(sauce.variants) ? (
                            sauce.variants.map((variant: string, i: number) => (
                              <li key={i}>{variant}</li>
                            ))
                          ) : (
                            <li>{sauce.variants}</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {sauce.usage && (
                      <div className='mt-1'>
                        <h6 className='mb-1 font-medium'>Usage:</h6>
                        <p>{sauce.usage}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand/Collapse button */}
                <button
                  onClick={() => toggleSauceCard(sauce.id)}
                  className='flex w-full items-center justify-center border-t p-1 text-xs text-gray-500 hover:text-gray-700'
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className='mr-1 h-3 w-3' /> Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className='mr-1 h-3 w-3' /> More
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
