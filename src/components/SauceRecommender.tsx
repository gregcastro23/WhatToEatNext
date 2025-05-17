import React, { useState, useEffect } from 'react';
import { Sauce } from '@/data/sauces';
import { ElementalProperties } from '@/types/alchemy';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Droplet,
  Flame,
  Wind,
  Mountain,
} from 'lucide-react';
import { getElementBackgroundColor, getElementTextColor } from '@/utils/elementalUtils';

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
  const [sauceRecommendations, setSauceRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSauceCards, setExpandedSauceCards] = useState<
    Record<string, boolean>
  >({});
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
        console.error("Error generating sauce recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [cuisine, protein, vegetable, cookingMethod, currentElementalProfile]);

  // Toggle function for sauce card expansion
  const toggleSauceCard = (sauceId: string) => {
    console.log("Toggling sauce card:", sauceId, "Current state:", expandedSauceCards[sauceId]);
    setExpandedSauceCards((prev) => {
      const newState = {
        ...prev,
        [sauceId]: !prev[sauceId],
      };
      console.log("New state:", newState);
      return newState;
    });
  };

  // Calculate elemental match between sauce and current profile
  const calculateElementalMatch = (
    sauceElements: ElementalProperties,
    userElements: ElementalProperties
  ): number => {
    // Ensure properties exist
    const elements = ['Fire', 'Water', 'Earth', 'Air'];

    // Calculate Euclidean distance (lower is better)
    let sumSquaredDiff = 0;
    elements.forEach((element) => {
      const elementKey = element as keyof ElementalProperties;
      const diff =
        (sauceElements[elementKey] || 0) - (userElements[elementKey] || 0);
      sumSquaredDiff += diff * diff;
    });

    // Convert to similarity score (higher is better)
    // Distance of 0 = perfect match (1.0)
    // Maximum possible distance = 2 (sqrt(4)) when opposite elements
    const distance = Math.sqrt(sumSquaredDiff);
    const maxDistance = Math.sqrt(4); // Maximum possible distance (theoretical)
    const similarity = 1 - distance / (maxDistance || 1);

    // Ensure score is in [0,1]
    return Math.max(0, Math.min(1, similarity));
  };

  // Helper function to determine if it's currently daytime (6am-6pm)
  const isDaytime = (date: Date = new Date()): boolean => {
    const hour = date.getHours();
    return hour >= 6 && hour < 18;
  };

  // Map planets to their elemental influences (diurnal and nocturnal elements)
  const planetaryElements: Record<
    string,
    { diurnal: string; nocturnal: string }
  > = {
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
    planetAffinity?: string[]
  ): number => {
    // Get the elements associated with the current planetary day
    const dayElements = planetaryElements[planetaryDay];
    if (!dayElements) return 0.5; // Unknown planet

    // For planetary day, BOTH diurnal and nocturnal elements influence all day
    const diurnalElement = dayElements.diurnal;
    const nocturnalElement = dayElements.nocturnal;

    // Calculate how much of each planetary element is present in the sauce
    const diurnalMatch = sauceElements[diurnalElement as keyof ElementalProperties] || 0;
    const nocturnalMatch = sauceElements[nocturnalElement as keyof ElementalProperties] || 0;

    // Calculate a weighted score - both elements are equally important for planetary day
    let elementalScore = (diurnalMatch + nocturnalMatch) / 2;

    // If the sauce has a direct planetary affinity, give bonus points
    if (
      planetAffinity &&
      planetAffinity.some((p) => p.toLowerCase() === planetaryDay.toLowerCase())
    ) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return elementalScore;
  };

  // Calculate planetary hour influence score
  const calculatePlanetaryHourInfluence = (
    sauceElements: ElementalProperties,
    planetaryHour: string,
    isDaytime: boolean,
    planetAffinity?: string[]
  ): number => {
    // Get the elements associated with the current planetary hour
    const hourElements = planetaryElements[planetaryHour];
    if (!hourElements) return 0.5; // Unknown planet

    // For planetary hour, use diurnal element during day, nocturnal at night
    const relevantElement = isDaytime
      ? hourElements.diurnal
      : hourElements.nocturnal;

    // Calculate how much of the relevant planetary element is present in the sauce
    const elementalMatch = sauceElements[relevantElement as keyof ElementalProperties] || 0;

    // Calculate score based on how well the sauce matches the planetary hour's element
    let elementalScore = elementalMatch;

    // If the sauce has a direct planetary affinity, give bonus points
    if (
      planetAffinity &&
      planetAffinity.some(
        (p) => p.toLowerCase() === planetaryHour.toLowerCase()
      )
    ) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return elementalScore;
  };

  // Utility function to convert month number to month name
  const getMonthName = (monthNum: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Adjust for 0-based index or 1-based month number
    return months[(monthNum - 1) % 12] || 'Unknown';
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
    if (ing.includes('tomato') && !ing.includes('paste'))
      return '1-2 cups, chopped';
    if (ing.includes('tomato paste')) return '1-3 tbsp';
    if (
      ing.includes('herb') ||
      ing.includes('basil') ||
      ing.includes('parsley') ||
      ing.includes('cilantro')
    )
      return '1-3 tbsp, chopped';
    if (ing.includes('spice') || ing.includes('pepper') || ing.includes('salt'))
      return 'to taste';
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
  const generateSauceRecommendations = async (): Promise<any[]> => {
    // Initialize results array
    const results: any[] = [];

    // Get all available sauces from props or try to import if not provided
    const allAvailableSauces: Record<string, Sauce> = sauces || {};

    // Get all available cuisines
    const allCuisines = cuisines || {};

    // If we have a specific cuisine, prioritize its sauces
    if (cuisine && (allCuisines as any)[cuisine.toLowerCase()]?.traditionalSauces) {
      const cuisineData = (allCuisines as any)[cuisine.toLowerCase()];
      const sauceRecommender = cuisineData.sauceRecommender || {};

      // Add sauce recommendations based on protein
      if (
        protein &&
        sauceRecommender.forProtein &&
        sauceRecommender.forProtein[protein]
      ) {
        sauceRecommender.forProtein[protein].forEach((sauceName: string) => {
          // Find the sauce data in the traditionalSauces
          Object.entries(cuisineData.traditionalSauces).forEach(
            ([id, sauceData]: [string, any]) => {
              if (sauceData.name.toLowerCase() === sauceName.toLowerCase()) {
                // Get current time factors
                const timeFactors = { 
                  planetaryDay: { planet: 'Sun' },
                  planetaryHour: { planet: 'Moon' }
                };

                // Basic elemental match calculation
                let elementalMatchScore = calculateElementalMatch(
                  sauceData.elementalProperties,
                  currentElementalProfile
                );

                // Calculate planetary day influence
                let planetaryDayScore = calculatePlanetaryDayInfluence(
                  sauceData.elementalProperties,
                  timeFactors.planetaryDay.planet,
                  sauceData.astrologicalInfluences
                );

                // Calculate planetary hour influence
                let planetaryHourScore = calculatePlanetaryHourInfluence(
                  sauceData.elementalProperties,
                  timeFactors.planetaryHour.planet,
                  isDaytime(),
                  sauceData.astrologicalInfluences
                );

                // Calculate final match score with weights
                let weights = {
                  elemental: 0.45, // Elemental match: 45%
                  planetaryDay: 0.35, // Planetary day: 35%
                  planetaryHour: 0.2, // Planetary hour: 20%
                };

                let finalScore =
                  elementalMatchScore * weights.elemental +
                  planetaryDayScore * weights.planetaryDay +
                  planetaryHourScore * weights.planetaryHour;

                results.push({
                  id: `${cuisine.toLowerCase()}-${id}`,
                  name: sauceData.name,
                  description: sauceData.description || '',
                  category: 'forProtein',
                  forItem: protein,
                  cuisine: cuisine,
                  ingredients: sauceData.keyIngredients || [],
                  culinaryUses: sauceData.culinaryUses || [],
                  preparationNotes: sauceData.preparationNotes || '',
                  technicalTips: sauceData.technicalTips || '',
                  elementalProperties: sauceData.elementalProperties,
                  matchScore: finalScore,
                  elementalMatchScore: elementalMatchScore,
                  planetaryDayScore: planetaryDayScore,
                  planetaryHourScore: planetaryHourScore,
                });
              }
            }
          );
        });
      }

      // If we don't have specific filters, add all sauces from the cuisine
      if (!protein && !vegetable && !cookingMethod) {
        Object.entries(cuisineData.traditionalSauces).forEach(
          ([id, sauceData]: [string, any]) => {
            // Basic elemental match calculation
            let elementalMatchScore = calculateElementalMatch(
              sauceData.elementalProperties,
              currentElementalProfile
            );

            results.push({
              id: `${cuisine.toLowerCase()}-${id}`,
              name: sauceData.name,
              description: sauceData.description || '',
              category: 'byCuisine',
              forItem: cuisine,
              cuisine: cuisine,
              ingredients: sauceData.keyIngredients || [],
              culinaryUses: sauceData.culinaryUses || [],
              preparationNotes: sauceData.preparationNotes || '',
              technicalTips: sauceData.technicalTips || '',
              elementalProperties: sauceData.elementalProperties,
              matchScore: elementalMatchScore,
            });
          }
        );
      }
    }

    // Use imported sauces if available
    if (Object.keys(allAvailableSauces).length > 0 && results.length < maxResults) {
      Object.entries(allAvailableSauces).forEach(([id, sauceData]) => {
        // Basic elemental match calculation
        let elementalMatchScore = calculateElementalMatch(
          sauceData.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          currentElementalProfile
        );

        results.push({
          id: id,
          name: sauceData.name,
          description: sauceData.description || '',
          category: 'general',
          cuisine: sauceData.cuisine || '',
          ingredients: sauceData.keyIngredients || [],
          culinaryUses: sauceData.culinaryUses || [],
          preparationNotes: sauceData.preparationNotes || '',
          technicalTips: sauceData.technicalTips || '',
          elementalProperties: sauceData.elementalProperties,
          matchScore: elementalMatchScore,
        });
      });
    }

    // Remove duplicates and sort by match score
    const uniqueResults = results.filter(
      (sauce, index, self) =>
        index === self.findIndex((s) => s.name === sauce.name)
    );

    return uniqueResults
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  };

  // Helper function to determine if a sauce-cuisine combination should be excluded
  const shouldExcludeSauceCombination = (
    sauceName: string,
    targetCuisine?: string
  ): boolean => {
    if (!targetCuisine) return false;

    // Define incompatible sauce-cuisine pairs
    const incompatiblePairs: Record<string, string[]> = {
      thai: ['marinara', 'bolognese', 'bechamel', 'alfredo', 'ragu', 'gravy'],
      italian: [
        'fish sauce',
        'soy sauce',
        'curry paste',
        'gochujang',
        'teriyaki',
      ],
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
      return incompatiblePairs[normalizedCuisine].some((incompatibleSauce) =>
        normalizedSauceName.includes(incompatibleSauce)
      );
    }

    return false;
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
      <span
        className={`text-xs px-2 py-0.5 rounded-full flex items-center ${colorClass}`}
      >
        <Check className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  // Filter sauces based on current filter
  const filteredSauces = () => {
    if (filter === 'all') {
      return sauceRecommendations;
    }

    return sauceRecommendations.filter((sauce) =>
      filter === 'fusion'
        ? sauce.isFusion
        : filter === 'traditional'
        ? !sauce.isFusion
        : filter === sauce.category
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <h3 className="text-lg font-medium mb-2">Sauce Recommendations</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Sauce Recommendations</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1 rounded-full ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('traditional')}
          className={`text-xs px-3 py-1 rounded-full ${
            filter === 'traditional'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Traditional
        </button>
        <button
          onClick={() => setFilter('fusion')}
          className={`text-xs px-3 py-1 rounded-full ${
            filter === 'fusion'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Fusion
        </button>
        {protein && (
          <button
            onClick={() => setFilter('forProtein')}
            className={`text-xs px-3 py-1 rounded-full ${
              filter === 'forProtein'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            For {protein}
          </button>
        )}
        {vegetable && (
          <button
            onClick={() => setFilter('forVegetable')}
            className={`text-xs px-3 py-1 rounded-full ${
              filter === 'forVegetable'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            For {vegetable}
          </button>
        )}
        {cookingMethod && (
          <button
            onClick={() => setFilter('forCookingMethod')}
            className={`text-xs px-3 py-1 rounded-full ${
              filter === 'forCookingMethod'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            For {cookingMethod}
          </button>
        )}
      </div>

      {/* Sauce cards */}
      {filteredSauces().length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          <p>No sauce recommendations found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSauces().map((sauce, index) => {
            // Ensure each sauce has a unique ID
            const sauceUniqueId = sauce.id || `sauce-${index}`;
            const isExpanded = expandedSauceCards[sauceUniqueId] || false;

            // Determine styling based on dominant element
            const elementalProps = sauce.elementalProperties || {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            };
            // Ensure proper numeric sorting by explicitly casting values to numbers
            const dominant = Object.entries(elementalProps).sort(
              ([, a], [, b]) => Number(b) - Number(a)
            )[0][0];
            const elementClass = dominant.toLowerCase();

            return (
              <div
                key={sauceUniqueId}
                className={`border rounded-lg shadow-sm transition-all duration-300 
                  ${isExpanded ? 'shadow-md' : 'hover:shadow-md'} 
                  ${
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
                <div className={`p-3 pb-2 ${isExpanded ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-base">{sauce.name}</h4>
                    {renderMatchBadge(sauce.matchScore)}
                  </div>

                  {/* Compact Description */}
                  <p className="text-xs text-gray-600 my-1 line-clamp-2">
                    {sauce.description}
                  </p>

                  {/* Cuisine Tags */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {sauce.cuisine && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {sauce.cuisine}
                      </span>
                    )}
                    {sauce.base && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                        {sauce.base}
                      </span>
                    )}
                    {sauce.isFusion && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        Fusion
                      </span>
                    )}
                  </div>

                  {/* Element Display */}
                  <div className="flex justify-between items-center text-xs mt-2">
                    <div className="flex gap-1">
                      <Flame
                        className={`w-3 h-3 ${
                          elementClass === 'fire'
                            ? 'text-red-500'
                            : 'text-gray-300'
                        }`}
                      />
                      <Droplet
                        className={`w-3 h-3 ${
                          elementClass === 'water'
                            ? 'text-blue-500'
                            : 'text-gray-300'
                        }`}
                      />
                      <Wind
                        className={`w-3 h-3 ${
                          elementClass === 'air'
                            ? 'text-purple-500'
                            : 'text-gray-300'
                        }`}
                      />
                      <Mountain
                        className={`w-3 h-3 ${
                          elementClass === 'earth'
                            ? 'text-green-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </div>

                    {/* Show top 3 ingredients or category */}
                    {sauce.ingredients && sauce.ingredients.length > 0 ? (
                      <div className="text-xs text-gray-500">
                        {sauce.ingredients.slice(0, 3).map((ing, idx, arr) => (
                          <React.Fragment key={idx}>
                            <span>
                              {typeof ing === 'string' ? ing : String(ing)}
                            </span>
                            {idx < arr.length - 1 && idx < 2 && ', '}
                          </React.Fragment>
                        ))}
                        {sauce.ingredients.length > 3 && (
                          <span> +{sauce.ingredients.length - 3}</span>
                        )}
                      </div>
                    ) : sauce.category === 'forProtein' ? (
                      <span className="text-xs text-blue-600">
                        For {sauce.forItem}
                      </span>
                    ) : sauce.category === 'forVegetable' ? (
                      <span className="text-xs text-green-600">
                        For {sauce.forItem}
                      </span>
                    ) : sauce.category === 'forCookingMethod' ? (
                      <span className="text-xs text-orange-600">
                        For {sauce.forItem}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 py-2 border-t border-gray-100 bg-white">
                    {/* Detailed Info */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {/* Key Ingredients Column */}
                      <div>
                        <h5 className="text-xs font-medium mb-1">
                          Key Ingredients:
                        </h5>
                        <ul className="pl-2">
                          {sauce.ingredients &&
                            sauce.ingredients.map((ing, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-gray-600 flex items-start"
                              >
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                                <span>
                                  {typeof ing === 'string' ? ing : String(ing)}
                                  {` - ${getIngredientAmountRange(
                                    typeof ing === 'string' ? ing : String(ing)
                                  )}`}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Culinary Uses Column */}
                      <div>
                        <h5 className="text-xs font-medium mb-1">Uses:</h5>
                        <ul className="pl-2">
                          {sauce.culinaryUses &&
                            sauce.culinaryUses.map((use, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-gray-600 flex items-start"
                              >
                                <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                                <span>{use}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    {/* Notes */}
                    {(sauce.preparationNotes || sauce.technicalTips) && (
                      <div className="bg-amber-50 p-2 rounded text-xs mb-2">
                        {sauce.preparationNotes && (
                          <p className="mb-1">
                            <span className="font-medium">Chef's Notes:</span>{' '}
                            {sauce.preparationNotes}
                          </p>
                        )}
                        {sauce.technicalTips && (
                          <p>
                            <span className="font-medium">Tips:</span>{' '}
                            {sauce.technicalTips}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Seasonality */}
                    {sauce.seasonality && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Season:</span>{' '}
                        {typeof sauce.seasonality === 'object' 
                          ? sauce.seasonality.peak_months 
                            ? `Peak: ${Array.isArray(sauce.seasonality.peak_months) 
                                ? sauce.seasonality.peak_months.map(m => getMonthName(m)).join(', ') 
                                : sauce.seasonality.peak_months}`
                            : 'Seasonal'
                          : sauce.seasonality}
                      </div>
                    )}

                    {/* Consistently display preparation steps using various possible field names */}
                    {(sauce.preparationSteps ||
                      sauce.procedure ||
                      sauce.instructions) && (
                      <div className="mt-2">
                        <h6 className="text-xs font-medium mb-1">Preparation:</h6>
                        {Array.isArray(
                          sauce.preparationSteps ||
                            sauce.procedure ||
                            sauce.instructions
                        ) ? (
                          <ol className="pl-4 list-decimal text-xs">
                            {(
                              sauce.preparationSteps ||
                              sauce.procedure ||
                              sauce.instructions
                            ).map((step: string, i: number) => (
                              <li key={i} className="text-xs">{step}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-xs">
                            {sauce.preparationSteps ||
                              sauce.procedure ||
                              sauce.instructions}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Add additional sauce information */}
                    {sauce.prepTime && (
                      <div className="mt-1 text-xs">
                        <span className="text-gray-500">Prep time: </span>
                        <span>{sauce.prepTime}</span>
                      </div>
                    )}

                    {sauce.cookTime && (
                      <div className="mt-1 text-xs">
                        <span className="text-gray-500">Cook time: </span>
                        <span>{sauce.cookTime}</span>
                      </div>
                    )}

                    {sauce.yield && (
                      <div className="mt-1 text-xs">
                        <span className="text-gray-500">Yield: </span>
                        <span>{sauce.yield}</span>
                      </div>
                    )}

                    {sauce.storageInstructions && (
                      <div className="mt-1 text-xs">
                        <h6 className="font-medium mb-1">Storage:</h6>
                        <p>{sauce.storageInstructions}</p>
                      </div>
                    )}

                    {sauce.variants && sauce.variants.length > 0 && (
                      <div className="mt-1 text-xs">
                        <h6 className="font-medium mb-1">Variants:</h6>
                        <ul className="pl-4 list-disc">
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
                  </div>
                )}

                {/* Expand/Collapse button */}
                <button
                  onClick={() => toggleSauceCard(sauceUniqueId)}
                  className={`w-full flex items-center justify-center text-xs ${isExpanded ? 'text-blue-600 hover:text-blue-800 bg-gray-50' : 'text-gray-500 hover:text-gray-700'} p-1 border-t`}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" /> Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" /> More
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
