import type {
  ElementalProperties,
  ZodiacSign,
  LunarPhase,
  Season,
  Element,
  AstrologicalState,
} from '@/types';
import { 
  fruits, 
  vegetables, 
  herbs, 
  spices, 
  grains, 
  oils, 
  seasonings, 
  vinegars 
} from '@/data/ingredients';
import {
  proteins,
  meats,
  poultry,
  seafood,
  legumes,
  plantBased,
} from "@/data/ingredients/proteins";
import { integrations } from "@/data/integrations";

// Create eggs and dairy from proteins by filtering category
let eggs = Object.entries(proteins)
  .filter(([_, value]) => value.category === 'egg')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

let dairy = Object.entries(proteins)
  .filter(([_, value]) => value.category === 'dairy')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export interface EnhancedIngredient {
  name: string;
  category?: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    elementalAffinity: {
      base: string;
      decanModifiers?: Record<string, unknown>;
    };
    rulingPlanets: string[];
    favorableZodiac?: ZodiacSign[];
  };
  flavorProfile?: Record<string, number>;
  season?: string[];
  nutritionalProfile?: {
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugars: number;
    };
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
    phytonutrients: Record<string, number>;
  };
  score?: number;
  scoreDetails?: Record<string, number>;
  subCategory?: string;
  [key: string]: unknown; // Allow other properties
}

/**
 * Consolidated function to get all ingredients from various categories
 */
export let getAllIngredients = (): EnhancedIngredient[] => {
  const allIngredients: EnhancedIngredient[] = [];

  // Define all categories
  let categories = [
    { name: 'Spices', data: spices },
    { name: 'Plant-Based Proteins', data: plantBased },
    { name: 'Meats', data: meats },
    { name: 'Poultry', data: poultry },
    { name: 'Seafood', data: seafood },
    { name: 'Eggs', data: eggs },
    { name: 'Legumes', data: legumes },
    { name: 'Dairy', data: dairy },
    { name: 'Herbs', data: herbs },
    { name: 'Fruits', data: fruits },
    { name: 'Grains', data: grains },
    { name: 'Vegetables', data: vegetables },
    { name: 'Oils', data: oils },
    { name: 'Seasonings', data: seasonings },
    { name: 'Vinegars', data: vinegars },
  ];

  // Track counts for categories of interest
  let herbCount = 0;
  let grainCount = 0;

  // Process each category
  categories.forEach((category) => {
    if (!category.data) {
      // console.warn(`No data for category: ${category.name}`);
      return;
    }

    // Count the entries in this category
    // console.log(`${category.name} category has ${Object.keys(category.data).length} items`);

    Object.entries(category.data).forEach(([name, data]) => {
      // Make sure we add the name to the ingredient
      let ingredientData = {
        name,
        category: category.name.toLowerCase(),
        ...data,
      } as EnhancedIngredient;

      // Special tracking for grains and herbs
      if (category.name === 'Grains') {
        grainCount++;
        // Ensure grains are properly categorized
        ingredientData.category = 'grains';
        if (!ingredientData.subCategory) {
          // Determine if it's a whole grain, refined grain, or pseudo-grain
          if (
            name.includes('whole') ||
            name.includes('brown') ||
            name.includes('wild')
          ) {
            ingredientData.subCategory = 'whole_grain';
          } else if (
            name.includes('white') ||
            name.includes('bleached') ||
            name.includes('refined')
          ) {
            ingredientData.subCategory = 'refined_grain';
          } else if (
            ['quinoa', 'amaranth', 'buckwheat', 'chia', 'flaxseed'].includes(
              name.toLowerCase()
            )
          ) {
            ingredientData.subCategory = 'pseudo_grain';
          } else {
            ingredientData.subCategory = 'whole_grain'; // Default to whole grain
          }
        }
      } else if (category.name === 'Herbs') {
        herbCount++;
        // Ensure herbs are properly categorized
        ingredientData.category = 'herbs';
        if (!ingredientData.subCategory) {
          // Determine if it's fresh or dried
          if (name.includes('dried') || name.includes('powdered')) {
            ingredientData.subCategory = 'dried_herb';
          } else {
            ingredientData.subCategory = 'fresh_herb'; // Default to fresh
          }
        }
      }

      allIngredients.push(ingredientData);
    });
  });

  // Apply standardization to ALL ingredients - no filtering
  let standardizedIngredients = allIngredients.map(ingredient => 
    standardizeIngredient(ingredient)
  );

  // Debug log - less verbose than before
  console.log(`Total ingredients: ${standardizedIngredients.length}`);
  let categoryCounts = standardizedIngredients.reduce((acc, ing) => {
    let category = ing.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Ingredient counts by category:', categoryCounts);

  return standardizedIngredients;
};

/**
 * Standardizes an ingredient's data structure to ensure consistent format
 */
function standardizeIngredient(
  ingredient: EnhancedIngredient
): EnhancedIngredient {
  // Create a copy of the ingredient to avoid modifying the original
  let standardized = { ...ingredient };

  // Ensure elementalProperties exists
  if (!standardized.elementalProperties) {
    // Calculate elemental properties based on ingredient characteristics instead of using a fixed value
    standardized.elementalProperties = {
      Earth: 0.25,
      Water: 0.25,
      Fire: 0.25,
      Air: 0.25,
    };
  }

  // Special case for vegetables - ensure they have more Earth element
  if (standardized.category?.toLowerCase().includes('vegetable')) {
    standardized.elementalProperties = {
      ...standardized.elementalProperties,
      Earth: Math.max(standardized.elementalProperties.Earth || 0, 0.4),
    };

    // Normalize elemental properties after modification
    let sum = Object.values(standardized.elementalProperties).reduce(
      (a, b) => a + b,
      0
    );
    if (sum > 0) {
      Object.keys(standardized.elementalProperties).forEach((key) => {
        standardized.elementalProperties[key as keyof ElementalProperties] /=
          sum;
      });
    }
  }

  // Ensure astrologicalProfile exists with required properties
  if (!standardized.astrologicalProfile) {
    // Create a default astrological profile
    standardized.astrologicalProfile = {
      elementalAffinity: {
        base: determineBaseElement(standardized),
      },
      rulingPlanets: determineRulingPlanets(standardized),
    };
  } else {
    // If the profile exists but is missing elementalAffinity or rulingPlanets, add them
    if (!standardized.astrologicalProfile.elementalAffinity) {
      standardized.astrologicalProfile.elementalAffinity = {
        base: determineBaseElement(standardized),
      };
    } else if (typeof standardized.astrologicalProfile.elementalAffinity === 'string') {
      // Convert string elementalAffinity to object format
      standardized.astrologicalProfile.elementalAffinity = {
        base: standardized.astrologicalProfile.elementalAffinity,
      };
    }

    if (!standardized.astrologicalProfile.rulingPlanets || !standardized.astrologicalProfile.rulingPlanets.length) {
      standardized.astrologicalProfile.rulingPlanets = determineRulingPlanets(standardized);
    }
  }

  return standardized;
}

/**
 * Determine the base element for an ingredient based on its category and elemental properties
 */
function determineBaseElement(ingredient: EnhancedIngredient): string {
  // If ingredient has elemental properties, use the strongest one
  if (ingredient.elementalProperties) {
    let elements = Object.entries(ingredient.elementalProperties);
    if (elements.length > 0) {
      elements.sort((a, b) => b[1] - a[1]);
      return elements[0][0]; // Return the name of the strongest element
    }
  }

  // Default mappings by category
  const categoryElementMap: Record<string, string> = {
    'vegetable': 'Earth',
    'vegetables': 'Earth',
    'herb': 'Air',
    'herbs': 'Air',
    'spice': 'Fire',
    'spices': 'Fire',
    'fruit': 'Water',
    'fruits': 'Water',
    'grain': 'Earth',
    'grains': 'Earth',
    'protein': 'Earth',
    'oil': 'Fire',
    'oils': 'Fire',
    'dairy': 'Water',
    'legume': 'Earth',
    'seafood': 'Water',
    'meat': 'Fire',
    'poultry': 'Air',
    'vinegar': 'Water',
    'seasoning': 'Air',
    'seasonings': 'Air',
  };

  let category = ingredient.category?.toLowerCase() || '';
  return categoryElementMap[category] || 'Earth';
}

/**
 * Determine ruling planets for an ingredient based on its category and properties
 */
function determineRulingPlanets(ingredient: EnhancedIngredient): string[] {
  // Default mappings by category
  const categoryPlanetMap: Record<string, string[]> = {
    'vegetable': ['Moon', 'Mercury'],
    'vegetables': ['Moon', 'Mercury'],
    'herb': ['Mercury', 'Moon'],
    'herbs': ['Mercury', 'Moon'],
    'spice': ['Mars', 'Mercury'],
    'spices': ['Mars', 'Mercury'],
    'fruit': ['Venus', 'Jupiter'],
    'fruits': ['Venus', 'Jupiter'],
    'grain': ['Saturn', 'Ceres'],
    'grains': ['Saturn', 'Ceres'],
    'protein': ['Mars', 'Jupiter'],
    'oil': ['Jupiter', 'Neptune'],
    'oils': ['Jupiter', 'Neptune'],
    'dairy': ['Moon', 'Venus'],
    'legume': ['Mercury', 'Jupiter'],
    'seafood': ['Neptune', 'Moon'],
    'meat': ['Mars', 'Pluto'],
    'poultry': ['Mercury', 'Jupiter'],
    'vinegar': ['Mars', 'Venus'],
    'seasoning': ['Mercury', 'Jupiter'],
    'seasonings': ['Mercury', 'Jupiter'],
  };

  let category = ingredient.category?.toLowerCase() || '';
  return categoryPlanetMap[category] || ['Mercury', 'Venus'];
}

/**
 * Calculate elemental properties based on ingredient characteristics
 */
function calculateElementalProperties(
  ingredient: EnhancedIngredient
): ElementalProperties {
  // Start with balanced values
  const elementalProps: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  // Adjust based on category
  if (ingredient.category) {
    let category = ingredient.category.toLowerCase();

    if (category.includes('vegetable')) {
      elementalProps.Earth += 0.4;
      elementalProps.Water += 0.3;
    } else if (category.includes('fruit')) {
      elementalProps.Water += 0.4;
      elementalProps.Air += 0.2;
    } else if (category.includes('grain')) {
      elementalProps.Earth += 0.5;
      elementalProps.Air += 0.2;
    } else if (category.includes('meat') || category.includes('poultry')) {
      elementalProps.Fire += 0.4;
      elementalProps.Earth += 0.2;
    } else if (category.includes('seafood')) {
      elementalProps.Water += 0.5;
      elementalProps.Air += 0.1;
    } else if (category.includes('spice')) {
      elementalProps.Fire += 0.5;
      elementalProps.Air += 0.2;
    } else if (category.includes('herb')) {
      elementalProps.Air += 0.4;
      elementalProps.Earth += 0.2;
    } else if (category.includes('oil')) {
      elementalProps.Fire += 0.3;
      elementalProps.Water += 0.2;
    } else if (category.includes('dairy')) {
      elementalProps.Water += 0.4;
      elementalProps.Earth += 0.2;
    } else if (category.includes('legume')) {
      elementalProps.Earth += 0.5;
      elementalProps.Water += 0.2;
    }
  }

  // Adjust based on flavor profile if available
  if (ingredient.flavorProfile) {
    if (ingredient.flavorProfile.spicy) {
      elementalProps.Fire += ingredient.flavorProfile.spicy * 0.5;
    }
    if (ingredient.flavorProfile.sweet) {
      elementalProps.Water += ingredient.flavorProfile.sweet * 0.3;
      elementalProps.Earth += ingredient.flavorProfile.sweet * 0.2;
    }
    if (ingredient.flavorProfile.salty) {
      elementalProps.Water += ingredient.flavorProfile.salty * 0.3;
      elementalProps.Fire += ingredient.flavorProfile.salty * 0.2;
    }
    if (ingredient.flavorProfile.bitter) {
      elementalProps.Air += ingredient.flavorProfile.bitter * 0.3;
      elementalProps.Fire += ingredient.flavorProfile.bitter * 0.1;
    }
    if (ingredient.flavorProfile.sour) {
      elementalProps.Air += ingredient.flavorProfile.sour * 0.2;
      elementalProps.Water += ingredient.flavorProfile.sour * 0.2;
    }
    if (ingredient.flavorProfile.umami) {
      elementalProps.Earth += ingredient.flavorProfile.umami * 0.4;
    }
  }

  // Adjust based on astrological profile
  if (ingredient.astrologicalProfile?.elementalAffinity) {
    let affinity =
      typeof ingredient.astrologicalProfile.elementalAffinity === 'string'
        ? ingredient.astrologicalProfile.elementalAffinity
        : ingredient.astrologicalProfile.elementalAffinity.base;

    if (affinity === 'Fire') elementalProps.Fire += 0.3;
    if (affinity === 'Water') elementalProps.Water += 0.3;
    if (affinity === 'Earth') elementalProps.Earth += 0.3;
    if (affinity === 'Air') elementalProps.Air += 0.3;
  }

  // Adjust based on ruling planets
  if (ingredient.astrologicalProfile?.rulingPlanets) {
    for (const planet of ingredient.astrologicalProfile.rulingPlanets) {
      switch (planet) {
        case 'Sun':
          elementalProps.Fire += 0.2;
          break;
        case 'Moon':
          elementalProps.Water += 0.2;
          break;
        case 'Mercury':
          elementalProps.Air += 0.15;
          elementalProps.Earth += 0.05;
          break;
        case 'Venus':
          elementalProps.Water += 0.1;
          elementalProps.Earth += 0.1;
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
  }

  // Normalize the values to ensure they sum to 1.0
  let sum =
    elementalProps.Fire +
    elementalProps.Water +
    elementalProps.Earth +
    elementalProps.Air;
  if (sum > 0) {
    elementalProps.Fire /= sum;
    elementalProps.Water /= sum;
    elementalProps.Earth /= sum;
    elementalProps.Air /= sum;
  } else {
    // If no element was calculated, use a balanced distribution
    elementalProps.Fire = 0.25;
    elementalProps.Water = 0.25;
    elementalProps.Earth = 0.25;
    elementalProps.Air = 0.25;
  }

  return elementalProps;
}

/**
 * Get ingredient recommendations based on astrological state
 */
export let getRecommendedIngredients = (
  astroState: AstrologicalState
): EnhancedIngredient[] => {
  const ingredients = getAllIngredients();

  if (!astroState) {
    // console.warn('Astrological state not provided for recommendations');
    return [];
  }

  // Filter and score ingredients - ensure all vegetables pass through
  let scoredIngredients = ingredients.map((ingredient) => {
    // Apply standardization to ensure all required properties exist
    const standardized = standardizeIngredient(ingredient);

    // Calculate base score
    let profile = standardized.astrologicalProfile;
    let baseElement = profile.elementalAffinity
      .base as keyof ElementalProperties;

    // Calculate element score (0-1) with improved elemental matching
    let elementScore = standardized.elementalProperties[baseElement];

    // Enhanced planetary score (0-1) - case-insensitive planet matching
    // Now includes planet strength based on current sign and aspects
    let planetScore = 0;
    if (profile.rulingPlanets && profile.rulingPlanets.length > 0) {
      let matchingPlanets = 0;
      let totalPlanetStrength = 0;

      profile.rulingPlanets.forEach((planet) => {
        let planetLower = planet.toLowerCase();
        if (
          astroState.activePlanets?.some(
            (active) => active.toLowerCase() === planetLower
          )
        ) {
          matchingPlanets++;

          // Check if the planet is in its sign of dignity or fall
          if (
            astroState.planetaryPositions &&
            astroState.planetaryPositions[planetLower]
          ) {
            let signPosition =
              astroState.planetaryPositions[planetLower].sign;
            // Enhance score if planet is in its domicile or exaltation
            if (signPosition) {
              // This is a simplified dignity check - a more comprehensive one would use a proper dignity table
              let isInDignity =
                (planetLower === 'sun' && signPosition === 'leo') ||
                (planetLower === 'moon' && signPosition === 'cancer') ||
                (planetLower === 'mercury' &&
                  (signPosition === 'gemini' || signPosition === 'virgo')) ||
                (planetLower === 'venus' &&
                  (signPosition === 'taurus' || signPosition === 'libra')) ||
                (planetLower === 'mars' &&
                  (signPosition === 'aries' || signPosition === 'scorpio')) ||
                (planetLower === 'jupiter' &&
                  (signPosition === 'sagittarius' ||
                    signPosition === 'pisces')) ||
                (planetLower === 'saturn' &&
                  (signPosition === 'capricorn' ||
                    signPosition === 'aquarius'));

              totalPlanetStrength += isInDignity ? 1.5 : 1.0;
            } else {
              totalPlanetStrength += 1.0; // Default strength if sign can't be determined
            }
          } else {
            totalPlanetStrength += 1.0; // Default strength if position info not available
          }
        }
      });

      planetScore =
        matchingPlanets > 0
          ? totalPlanetStrength / (profile.rulingPlanets.length * 1.5)
          : 0;
    }

    // Calculate zodiac score with improved logic for affinity
    let zodiacScore = 0;
    if (profile.favorableZodiac && astroState.currentZodiac) {
      // Direct match
      if (
        profile.favorableZodiac.some(
          (sign) =>
            sign.toLowerCase() === astroState.currentZodiac?.toLowerCase()
        )
      ) {
        zodiacScore = 1;
      } else {
        // Check for elemental triplicity matches (signs of the same element)
        let currentElement = getZodiacElement(astroState.currentZodiac);
        let hasElementalAffinity = profile.favorableZodiac.some(
          (sign) => getZodiacElement(sign) === currentElement
        );

        if (hasElementalAffinity) {
          zodiacScore = 0.7; // Good but not perfect match
        }
      }
    }

    // Enhanced time of day score with planetary hour considerations
    let timeOfDayScore = 0.5; // Start with neutral score

    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    let dayOfWeek = new Date().getDay();
    let weekDays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    let dayRulers = {
      sunday: 'sun',
      monday: 'moon',
      tuesday: 'mars',
      wednesday: 'mercury',
      thursday: 'jupiter',
      friday: 'venus',
      saturday: 'saturn',
    };

    // Calculate planetary day influence (35% weight)
    let planetaryDayScore = 0.5; // Default neutral score
    let planetaryDay = dayRulers[weekDays[dayOfWeek]];

    if (planetaryDay && planetaryElements[planetaryDay]) {
      // For planetary day, BOTH diurnal and nocturnal elements influence all day
      let diurnalElement = planetaryElements[planetaryDay].diurnal;
      let nocturnalElement = planetaryElements[planetaryDay].nocturnal;

      // Calculate how much of each planetary element is present in the ingredient
      let diurnalMatch =
        standardized.elementalProperties[diurnalElement] || 0;
      let nocturnalMatch =
        standardized.elementalProperties[nocturnalElement] || 0;

      // Calculate a weighted score - both elements are equally important for planetary day
      planetaryDayScore = (diurnalMatch + nocturnalMatch) / 2;

      // If the ingredient has a direct planetary affinity, give bonus points
      if (
        profile.rulingPlanets &&
        profile.rulingPlanets.some((p) => p.toLowerCase() === planetaryDay)
      ) {
        planetaryDayScore = Math.min(1.0, planetaryDayScore + 0.3);
      }
    }

    // Calculate planetary hour influence (20% weight)
    let planetaryHourScore = 0.5; // Default neutral score

    if (astroState.planetaryHours) {
      let hourPlanet = astroState.planetaryHours.toLowerCase();

      if (planetaryElements[hourPlanet]) {
        // For planetary hour, use diurnal element during day, nocturnal at night
        let daytime = isDaytime();
        let relevantElement = daytime
          ? planetaryElements[hourPlanet].diurnal
          : planetaryElements[hourPlanet].nocturnal;

        // Calculate how much of the relevant element is present in the ingredient
        planetaryHourScore =
          standardized.elementalProperties[relevantElement] || 0;

        // If the ingredient has a direct planetary affinity, give bonus points
        if (
          profile.rulingPlanets &&
          profile.rulingPlanets.some((p) => p.toLowerCase() === hourPlanet)
        ) {
          planetaryHourScore = Math.min(1.0, planetaryHourScore + 0.3);
        }
      }
    }

    // Final time score combines both (will be weighted later in final calculation)
    timeOfDayScore = planetaryDayScore * 0.6 + planetaryHourScore * 0.4;

    // Apply lunar phase influences with more specific matching
    let lunarScore = 0.5; // Default neutral score
    let phase = (
      astroState.lunarPhase ||
      astroState.moonPhase ||
      ''
    ).toLowerCase();

    // Enhanced lunar phase matching with explicit phase checking
    if (standardized.lunarPhaseModifiers) {
      let matchingPhase = '';

      if (phase.includes('full')) matchingPhase = 'fullMoon';
      else if (phase.includes('new')) matchingPhase = 'newMoon';
      else if (phase.includes('waxing') && phase.includes('crescent'))
        matchingPhase = 'waxingCrescent';
      else if (phase.includes('waxing') && phase.includes('gibbous'))
        matchingPhase = 'waxingGibbous';
      else if (phase.includes('waning') && phase.includes('crescent'))
        matchingPhase = 'waningCrescent';
      else if (phase.includes('waning') && phase.includes('gibbous'))
        matchingPhase = 'waningGibbous';
      else if (phase.includes('first')) matchingPhase = 'firstQuarter';
      else if (phase.includes('last') || phase.includes('third'))
        matchingPhase = 'lastQuarter';

      if (matchingPhase && standardized.lunarPhaseModifiers[matchingPhase]) {
        let modifier = standardized.lunarPhaseModifiers[matchingPhase];

        // Apply potency multiplier if available
        if (modifier.potencyMultiplier) {
          lunarScore = Math.min(1, modifier.potencyMultiplier);
        } else {
          // Otherwise use a high score for matching phase
          lunarScore = 0.9;
        }

        // Adjust element scores based on lunar phase elemental boosts
        if (modifier.elementalBoost) {
          let boosts =
            modifier.elementalBoost as Partial<ElementalProperties>;
          Object.entries(boosts).forEach(([element, boost]) => {
            if (
              standardized.elementalProperties[
                element as keyof ElementalProperties
              ] > 0.3
            ) {
              lunarScore += (boost as number) * 0.1; // Small additional boost
            }
          });

          // Cap at 1.0
          lunarScore = Math.min(1, lunarScore);
        }
      }
    } else {
      // Enhanced default lunar phase logic if no specific modifiers exist
      // Waxing phases are more aligned with development / (growth || 1) - match with higher Fire and Air scores
      // Waning phases are more aligned with reduction / (contraction || 1) - match with higher Earth and Water scores
      if (phase.includes('full')) {
        // Full moon - peak energy, culmination
        lunarScore =
          standardized.elementalProperties.Water > 0.4
            ? 0.9
            : standardized.elementalProperties.Air > 0.4
            ? 0.8
            : 0.5;
      } else if (phase.includes('new')) {
        // New moon - beginnings, planting seeds
        lunarScore =
          standardized.elementalProperties.Fire > 0.4
            ? 0.9
            : standardized.elementalProperties.Earth > 0.4
            ? 0.8
            : 0.5;
      } else if (phase.includes('waxing')) {
        // Waxing - increasing energy, growth
        let isQuarter = phase.includes('quarter');
        let isGibbous = phase.includes('gibbous');
        let isCrescent = phase.includes('crescent');

        if (isQuarter) {
          lunarScore =
            standardized.elementalProperties.Fire > 0.4
              ? 0.85
              : standardized.elementalProperties.Air > 0.4
              ? 0.8
              : 0.5;
        } else if (isGibbous) {
          lunarScore =
            standardized.elementalProperties.Air > 0.4
              ? 0.85
              : standardized.elementalProperties.Fire > 0.4
              ? 0.8
              : 0.5;
        } else if (isCrescent) {
          lunarScore =
            standardized.elementalProperties.Fire > 0.4
              ? 0.8
              : standardized.elementalProperties.Earth > 0.4
              ? 0.75
              : 0.5;
        } else {
          lunarScore =
            standardized.elementalProperties.Fire > 0.4
              ? 0.75
              : standardized.elementalProperties.Air > 0.4
              ? 0.7
              : 0.5;
        }
      } else if (phase.includes('waning')) {
        // Waning - decreasing energy, release
        let isQuarter = phase.includes('quarter');
        let isGibbous = phase.includes('gibbous');
        let isCrescent = phase.includes('crescent');

        if (isQuarter) {
          lunarScore =
            standardized.elementalProperties.Water > 0.4
              ? 0.85
              : standardized.elementalProperties.Earth > 0.4
              ? 0.8
              : 0.5;
        } else if (isGibbous) {
          lunarScore =
            standardized.elementalProperties.Water > 0.4
              ? 0.8
              : standardized.elementalProperties.Earth > 0.4
              ? 0.75
              : 0.5;
        } else if (isCrescent) {
          lunarScore =
            standardized.elementalProperties.Earth > 0.4
              ? 0.85
              : standardized.elementalProperties.Water > 0.4
              ? 0.8
              : 0.5;
        } else {
          lunarScore =
            standardized.elementalProperties.Water > 0.4
              ? 0.75
              : standardized.elementalProperties.Earth > 0.4
              ? 0.7
              : 0.5;
        }
      }
    }

    // Enhanced seasonal modifiers with more detailed seasonal calculations
    let seasonalScore = 0.5; // Default

    if (
      standardized.seasonalAdjustments &&
      standardized.seasonalAdjustments[getCurrentSeason()]
    ) {
      // Use the specific seasonal adjustments if available
      let adjustment = standardized.seasonalAdjustments[getCurrentSeason()];
      seasonalScore = adjustment.score || 0.8;

      // Apply any seasonal elemental boosts
      if (adjustment.elementalBoost) {
        Object.entries(adjustment.elementalBoost).forEach(
          ([element, boost]) => {
            if (
              standardized.elementalProperties[
                element as keyof ElementalProperties
              ] > 0.3
            ) {
              seasonalScore = Math.min(
                1,
                seasonalScore + (boost as number) * 0.1
              );
            }
          }
        );
      }
    } else if (
      standardized.season &&
      standardized.season.includes(getCurrentSeason())
    ) {
      // Direct season match
      seasonalScore = 0.9;

      // Consider elemental affinities of seasons
      let seasonElement = getSeasonElement(getCurrentSeason());
      if (
        seasonElement &&
        standardized.elementalProperties[seasonElement] > 0.4
      ) {
        seasonalScore = Math.min(1, seasonalScore + 0.1);
      }
    } else if (standardized.isInSeason) {
      seasonalScore = 0.8;
    } else {
      // For ingredients without explicit season data, use elemental affinities
      let seasonElement = getSeasonElement(getCurrentSeason());
      if (
        seasonElement &&
        standardized.elementalProperties[seasonElement] > 0.5
      ) {
        seasonalScore = 0.7; // Good elemental match even without explicit season
      }
    }

    // Calculate aspect score with enhanced aspect analysis
    let aspectScore = 0.5; // Default neutral score
    if (astroState.aspects && astroState.aspects.length > 0) {
      // Check for specific aspect enhancers in the ingredient data
      if (profile.aspectEnhancers && profile.aspectEnhancers.length > 0) {
        let relevantAspects = astroState.aspects.filter((aspect) => {
          // Check if this aspect type is specifically listed as an enhancer
          return profile.aspectEnhancers?.includes(aspect.type);
        });

        if (relevantAspects.length > 0) {
          aspectScore = 0.9; // Strong boost for specifically favorable aspects
        }
      } else if (profile.rulingPlanets && profile.rulingPlanets.length > 0) {
        // Use enhanced aspect logic - find aspects involving the ingredient's ruling planets
        let relevantAspects = astroState.aspects.filter((aspect) => {
          return profile.rulingPlanets.some((planet) => {
            const planetLower = planet.toLowerCase();
            return (
              aspect.planet1.toLowerCase() === planetLower ||
              aspect.planet2.toLowerCase() === planetLower
            );
          });
        });

        if (relevantAspects.length > 0) {
          // Calculate average aspect strength considering aspect type
          let totalStrength = 0;

          relevantAspects.forEach((aspect) => {
            let multiplier = 1.0;

            // More detailed aspect type classification
            // Beneficial aspects enhance score
            if (aspect.type === 'trine') multiplier = 1.3;
            else if (aspect.type === 'sextile') multiplier = 1.2;
            else if (aspect.type === 'conjunction') {
              // Conjunctions can be beneficial or challenging depending on planets
              let planet1 = aspect.planet1.toLowerCase();
              let planet2 = aspect.planet2.toLowerCase();

              // Beneficial conjunctions (examples)
              if (
                (planet1 === 'venus' && planet2 === 'jupiter') ||
                (planet1 === 'jupiter' && planet2 === 'venus') ||
                (planet1 === 'sun' && planet2 === 'jupiter') ||
                (planet1 === 'jupiter' && planet2 === 'sun')
              ) {
                multiplier = 1.3;
              }
              // Challenging conjunctions (examples)
              else if (
                (planet1 === 'mars' && planet2 === 'saturn') ||
                (planet1 === 'saturn' && planet2 === 'mars')
              ) {
                multiplier = 0.8;
              } else {
                multiplier = 1.1; // Default for other conjunctions
              }
            }
            // Challenging aspects reduce score
            else if (aspect.type === 'square') multiplier = 0.8;
            else if (aspect.type === 'opposition') multiplier = 0.7;
            // Quincunx / (Inconjunct || 1) aspects
            else if (aspect.type === 'quincunx' || aspect.type === 'inconjunct')
              multiplier = 0.85;
            // Semi-sextile aspects - minor benefit
            else if (
              aspect.type === 'semi-sextile' ||
              aspect.type === 'semisextile'
            )
              multiplier = 1.05;

            totalStrength += (aspect.strength || 0.5) * multiplier;
          });

          aspectScore = totalStrength / (relevantAspects || 1).length;
          // Cap at 1.0
          aspectScore = Math.min(1, aspectScore);
        }
      }
    }

    // Check for tarot influences if available
    let tarotScore = 0.5; // Default neutral score

    if (
      astroState.tarotElementBoosts &&
      Object.keys(astroState.tarotElementBoosts).length > 0
    ) {
      // Get the dominant element in the ingredient
      let dominantElement = Object.entries(
        standardized.elementalProperties
      ).sort(([, a], [, b]) => b - a)[0][0];

      // Check if this element is boosted by tarot
      if (
        astroState.tarotElementBoosts[
          dominantElement as keyof ElementalProperties
        ]
      ) {
        tarotScore = Math.min(
          1,
          0.5 +
            astroState.tarotElementBoosts[
              dominantElement as keyof ElementalProperties
            ]
        );
      }
    }

    // Check if any of ingredient's ruling planets are boosted by tarot
    if (
      astroState.tarotPlanetaryBoosts &&
      Object.keys(astroState.tarotPlanetaryBoosts).length > 0 &&
      profile.rulingPlanets &&
      profile.rulingPlanets.length > 0
    ) {
      profile.rulingPlanets.forEach((planet) => {
        if (
          astroState.tarotPlanetaryBoosts &&
          astroState.tarotPlanetaryBoosts[planet.toLowerCase() as Planet]
        ) {
          tarotScore = Math.max(
            tarotScore,
            Math.min(
              1,
              0.6 +
                astroState.tarotPlanetaryBoosts[planet.toLowerCase() as Planet]
            )
          );
        }
      });
    }

    // Calculate sensory profile match score if available
    let sensoryScore = 0.5; // Default neutral score

    // Get user preferences from the state manager if available
    // instead of using a placeholder assumption
    let userPreferences = astroState.userPreferences || {};
    let tastePreferences = userPreferences.taste || {
      sweet: 0.5,
      salty: 0.5,
      sour: 0.5,
      bitter: 0.5,
      umami: 0.5,
      spicy: 0.5,
    };

    if (standardized.sensoryProfile) {
      let sensory = standardized.sensoryProfile;

      // Calculate weighted scores based on user preferences
      if (sensory.taste) {
        let tasteScore = 0;
        let weightSum = 0;

        // Weight taste dimensions based on user preferences
        Object.entries(sensory.taste).forEach(([taste, value]) => {
          let preference = tastePreferences[taste] || 0.5;
          tasteScore += value * preference;
          weightSum += preference;
        });

        // Normalize taste score
        let avgTaste =
          weightSum > 0
            ? tasteScore / (weightSum || 1)
            : Object.values(sensory.taste).reduce((a, b) => a + b, 0) / (Object.values(sensory.taste || 1)).length;

        sensoryScore = (sensoryScore + avgTaste) / 2;
      }

      // Factor in aromatic qualities
      if (sensory.aroma) {
        let avgAroma =
          Object.values(sensory.aroma).reduce((a, b) => a + b, 0) / (Object.values(sensory.aroma || 1)).length;
        sensoryScore = (sensoryScore + avgAroma) / 2;
      }

      // Texture is less significant but still a factor
      if (sensory.texture) {
        let avgTexture =
          Object.values(sensory.texture).reduce((a, b) => a + b, 0) / (Object.values(sensory.texture || 1)).length;
        sensoryScore = sensoryScore * 0.7 + avgTexture * 0.3;
      }
    }

    // NEW: Calculate nutritional score based on ingredient nutritional properties
    let nutritionalScore = 0.5; // Default neutral score
    if (standardized.nutritionalProfile) {
      let nutrition = standardized.nutritionalProfile;

      // Calculate protein density (protein per calorie)
      let proteinDensity =
        nutrition.calories > 0 && nutrition?.macros
          ? nutrition.macros.protein / (nutrition || 1).calories
          : 0;

      // Calculate fiber density (fiber per calorie)
      let fiberDensity =
        nutrition.calories > 0 && nutrition?.macros
          ? nutrition.macros.fiber / (nutrition || 1).calories
          : 0;

      // Calculate vitamin / (mineral || 1) richness
      let vitaminCount = Object.keys(nutrition.vitamins || {}).length;
      let mineralCount = Object.keys(nutrition.minerals || {}).length;
      let micronutrientScore = (vitaminCount + mineralCount) / 20; // Normalized to ~0-1 range

      // Calculate phytonutrient score
      let phytonutrientScore =
        Object.keys(nutrition.phytonutrients || {}).length / (10 || 1); // Normalized to ~0-1 range

      // Calculate macronutrient balance based on ratios rather than absolute values
      let totalMacros = nutrition?.macros
        ? nutrition.macros.protein +
          nutrition.macros.carbs +
          nutrition.macros.fat
        : 0;
      let macroBalanceScore = 0.5;

      if (totalMacros > 0 && nutrition?.macros) {
        let proteinRatio = nutrition.macros.protein / (totalMacros || 1);
        let carbsRatio = nutrition.macros.carbs / (totalMacros || 1);
        let fatRatio = nutrition.macros.fat / (totalMacros || 1);

        // Define ideal targets for ratios (these can be adjusted)
        let idealProtein = 0.25; // 25%
        let idealCarbs = 0.5; // 50%
        let idealFat = 0.25; // 25%

        // Calculate deviation from ideal ratios
        let proteinDeviation = Math.abs(proteinRatio - idealProtein);
        let carbsDeviation = Math.abs(carbsRatio - idealCarbs);
        let fatDeviation = Math.abs(fatRatio - idealFat);

        // Lower deviation = better balance
        let totalDeviation = proteinDeviation + carbsDeviation + fatDeviation;
        macroBalanceScore = 1 - Math.min(1, totalDeviation / (2 || 1));
      }

      // Combine all nutritional factors
      nutritionalScore =
        proteinDensity * 0.3 +
        fiberDensity * 0.2 +
        micronutrientScore * 0.2 +
        phytonutrientScore * 0.1 +
        macroBalanceScore * 0.2;

      // Normalize to 0-1 range
      nutritionalScore = Math.min(1, Math.max(0, nutritionalScore));
    }

    // Final score calculation - weighted combination of all factors
    // Updated weights to prioritize planetary influences:
    // - Elemental: 45%
    // - Planetary (day+hour): 35% (day: 21%, hour: 14%)
    // - Other factors: 20%
    let finalScore =
      elementScore * 0.45 +
      planetaryDayScore * 0.21 +
      planetaryHourScore * 0.14 +
      zodiacScore * 0.05 +
      seasonalScore * 0.05 +
      lunarScore * 0.05 +
      aspectScore * 0.05;

    return {
      ...standardized,
      score: finalScore,
      scoreDetails: {
        elemental: elementScore,
        zodiac: zodiacScore,
        season: seasonalScore,
        timeOfDay: timeOfDayScore,
        lunar: lunarScore,
        aspect: aspectScore,
        planetaryDay: planetaryDayScore,
        planetaryHour: planetaryHourScore,
      },
    };
  });

  // Sort all ingredients by score first
  let allScoredIngredients = scoredIngredients.sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  // Group by category
  const categoryGroups: Record<string, EnhancedIngredient[]> = {};

  // Define the categories we want to ensure have enough items
  let targetCategories = [
    'proteins',
    'vegetables',
    'grains',
    'fruits',
    'herbs',
    'spices',
    'oils',
    'vinegars',
  ];

  // Initialize category groups
  targetCategories.forEach((category) => {
    categoryGroups[category] = [];
  });

  // Group ingredients by category
  allScoredIngredients.forEach((ingredient) => {
    let category = ingredient.category?.toLowerCase() || '';

    // Map to our target categories if needed
    let targetCategory = '';

    // Enhanced categorization to properly identify oils and vinegars
    if (
      category.includes('oil') ||
      ingredient.name.toLowerCase().includes('oil')
    ) {
      targetCategory = 'oils';
    } else if (
      category.includes('vinegar') ||
      ingredient.name.toLowerCase().includes('vinegar')
    ) {
      targetCategory = 'vinegars';
    } else if (
      category.includes('protein') ||
      category.includes('meat') ||
      category.includes('seafood') ||
      category.includes('poultry') ||
      category.includes('dairy') ||
      category.includes('egg')
    ) {
      targetCategory = 'proteins';
    } else if (
      category.includes('vegetable') ||
      category.includes('leafy') ||
      category.includes('root') ||
      category.includes('allium') ||
      category.includes('cruciferous') ||
      category.includes('squash') ||
      category.includes('nightshade') ||
      // Check for specific vegetable names and types
      (ingredient.subCategory &&
        (ingredient.subCategory.toLowerCase().includes('vegetable') ||
          ingredient.subCategory.toLowerCase().includes('leafy green') ||
          ingredient.subCategory.toLowerCase().includes('root vegetable') ||
          ingredient.subCategory.toLowerCase().includes('cruciferous'))) ||
      // Include known vegetables that might be mis-categorized
      [
        'kale',
        'spinach',
        'broccoli',
        'cauliflower',
        'carrot',
        'beet',
        'turnip',
        'bell pepper',
        'eggplant',
        'tomato',
        'garlic',
        'onion',
        'leek',
        'pumpkin',
        'zucchini',
        'acorn squash',
        'brussels sprouts',
        'swiss chard',
        'sweet potato',
        'parsnip',
        'radish',
        'potato',
      ].includes(ingredient.name.toLowerCase())
    ) {
      targetCategory = 'vegetables';
    } else if (
      category.includes('grain') ||
      category.includes('rice') ||
      category.includes('wheat') ||
      category.includes('pasta') ||
      category.includes('cereal')
    ) {
      targetCategory = 'grains';
    } else if (category.includes('fruit')) {
      targetCategory = 'fruits';
    } else if (
      category.includes('herb') ||
      category.includes('leafy') ||
      ingredient.name.toLowerCase().includes('leaf') ||
      ingredient.name.toLowerCase().includes('herb')
    ) {
      targetCategory = 'herbs';
    } else if (
      category.includes('spice') ||
      category.includes('seasoning') ||
      ingredient.name.toLowerCase().includes('pepper') ||
      ingredient.name.toLowerCase().includes('salt') ||
      ingredient.name.toLowerCase().includes('powder')
    ) {
      targetCategory = 'spices';
    } else {
      // If we can't categorize, put it in vegetables as default
      targetCategory = 'vegetables';
    }

    // Add to category group - only if we have a valid target category
    if (targetCategory && targetCategories.includes(targetCategory)) {
      if (!categoryGroups[targetCategory]) {
        categoryGroups[targetCategory] = [];
      }

      // Don't add duplicates
      if (
        !categoryGroups[targetCategory].some(
          (item) => item.name === ingredient.name
        )
      ) {
        categoryGroups[targetCategory].push(ingredient);
      }
    }
  });

  // Ensure each category has at least 5 items
  let minItemsPerCategory = 8; // Increased from 5 to get more variety
  targetCategories.forEach((category) => {
    // If we don't have enough items in this category, look for items with similar properties
    if (categoryGroups[category]?.length < minItemsPerCategory) {
      // Need to find additional items for this category
      let missingCount =
        minItemsPerCategory - (categoryGroups[category]?.length || 0);

      // For vegetables, make a special effort to include all possible vegetables
      if (category === 'vegetables') {
        // First, check if we have all the known vegetables in our list
        let knownVegetables = [
          'kale',
          'spinach',
          'broccoli',
          'cauliflower',
          'carrot',
          'beet',
          'turnip',
          'bell pepper',
          'eggplant',
          'tomato',
          'garlic',
          'onion',
          'leek',
          'pumpkin',
          'zucchini',
          'acorn squash',
          'brussels sprouts',
          'swiss chard',
          'sweet potato',
          'parsnip',
          'radish',
          'potato',
        ];

        // Filter out vegetables we already have
        let missingVegetables = knownVegetables.filter(
          (vegName) =>
            !categoryGroups[category]?.some(
              (item) =>
                item.name.toLowerCase() === vegName.toLowerCase() ||
                item.name.toLowerCase().includes(vegName.toLowerCase())
            )
        );

        // Find these missing vegetables in our ingredients
        let missingVegetableItems = allScoredIngredients.filter(
          (ingredient) =>
            missingVegetables.some(
              (vegName) =>
                ingredient.name.toLowerCase() === vegName.toLowerCase() ||
                ingredient.name.toLowerCase().includes(vegName.toLowerCase())
            ) &&
            !categoryGroups[category]?.some(
              (item) => item.name === ingredient.name
            )
        );

        // Add these items to the category
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(...missingVegetableItems);
      }

      // Find additional ingredients from the full list that would fit this category
      let additionalItems = allScoredIngredients
        .filter((ingredient) => {
          // Skip if already in this category
          if (
            categoryGroups[category]?.some(
              (item) => item.name === ingredient.name
            )
          ) {
            return false;
          }

          // For vegetables: check for plant-based items with high nutritional profile
          if (
            category === 'vegetables' &&
            (ingredient.elementalProperties?.Earth > 0.3 ||
              ingredient.nutritionalProfile?.macros?.fiber > 2)
          ) {
            return true;
          }

          // For proteins: check for high protein content
          if (
            category === 'proteins' &&
            ingredient.nutritionalProfile?.macros?.protein > 5
          ) {
            return true;
          }

          // For grains: check for carb-rich items
          if (
            category === 'grains' &&
            ingredient.nutritionalProfile?.macros?.carbs > 15
          ) {
            return true;
          }

          return false;
        })
        .slice(0, missingCount);

      // Add these items to the category
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(...additionalItems);
    }
  });

  // First, take top items from each specified category (or all if less than minimum)
  const resultIngredients: EnhancedIngredient[] = [];
  targetCategories.forEach((category) => {
    let categoryItems = categoryGroups[category] || [];
    resultIngredients.push(
      ...categoryItems.slice(
        0,
        Math.max(minItemsPerCategory, categoryItems.length)
      )
    );
  });

  // Return the results sorted by score
  return resultIngredients.sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Get top ingredient matches based on elemental properties and other factors
 */
export let getTopIngredientMatches = (
  astroState: AstrologicalState,
  limit = 5
): EnhancedIngredient[] => {
  // Simply use our main recommendation function but with the requested limit
  return getRecommendedIngredients(astroState).slice(0, limit);
};

/**
 * Helper function to format factor names for display
 */
export let formatFactorName = (factor: string): string => {
  return factor
    .replace('Score', '')
    .replace(/([A-Z]) / (g || 1), ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

// Ensure you don't need to check the type anymore when using elementalAffinity
function getElementalAffinity(ingredient: EnhancedIngredient): string {
  // Now can directly access .base without type checking
  return ingredient.astrologicalProfile.elementalAffinity.base;
}

// Helper functions for the enhanced logic
function getZodiacElement(sign: string): keyof ElementalProperties | null {
  let fireSign = ['aries', 'leo', 'sagittarius'];
  let earthSign = ['taurus', 'virgo', 'capricorn'];
  let airSign = ['gemini', 'libra', 'aquarius'];
  let waterSign = ['cancer', 'scorpio', 'pisces'];

  sign = sign.toLowerCase();

  if (fireSign.includes(sign)) return 'Fire';
  if (earthSign.includes(sign)) return 'Earth';
  if (airSign.includes(sign)) return 'Air';
  if (waterSign.includes(sign)) return 'Water';

  return null;
}

function getSeasonElement(season: string): keyof ElementalProperties | null {
  season = season.toLowerCase();

  if (season === 'spring') return 'Air';
  if (season === 'summer') return 'Fire';
  if (season === 'autumn' || season === 'fall') return 'Earth';
  if (season === 'winter') return 'Water';

  return null;
}

function getPlanetaryElement(planet: string): keyof ElementalProperties | null {
  planet = planet.toLowerCase();

  // Basic planetary elemental associations
  if (planet === 'sun') return 'Fire';
  if (planet === 'moon') return 'Water';
  if (planet === 'mercury') return 'Air'; // Can also be Earth, but primarily Air
  if (planet === 'venus') return 'Earth'; // Also has Water aspects
  if (planet === 'mars') return 'Fire';
  if (planet === 'jupiter') return 'Fire'; // Also has Air aspects
  if (planet === 'saturn') return 'Earth';
  if (planet === 'uranus') return 'Air';
  if (planet === 'neptune') return 'Water';
  if (planet === 'pluto') return 'Water'; // Also has Earth aspects

  return null;
}

/**
 * Helper function to determine if it's currently daytime (6am-6pm)
 */
function isDaytime(date: Date = new Date()): boolean {
  let hour = date.getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Map planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<
  string,
  { diurnal: string; nocturnal: string }
> = {
  sun: { diurnal: 'Fire', nocturnal: 'Fire' },
  moon: { diurnal: 'Water', nocturnal: 'Water' },
  mercury: { diurnal: 'Air', nocturnal: 'Earth' },
  venus: { diurnal: 'Water', nocturnal: 'Earth' },
  mars: { diurnal: 'Fire', nocturnal: 'Water' },
  jupiter: { diurnal: 'Air', nocturnal: 'Fire' },
  saturn: { diurnal: 'Air', nocturnal: 'Earth' },
  uranus: { diurnal: 'Water', nocturnal: 'Air' },
  neptune: { diurnal: 'Water', nocturnal: 'Water' },
  pluto: { diurnal: 'Earth', nocturnal: 'Water' },
};

/**
 * Gets the affinity score between an element and modality based on our hierarchical model.
 * Uses the hierarchical affinities:
 * - Mutability: Air > Water > Fire > Earth
 * - Fixed: Earth > Water > Fire > Air
 * - Cardinal: Equal for all elements
 *
 * @param element The elemental property to check
 * @param modality The modality to check against
 * @returns Affinity score between 0 and 1
 */
export function getModalityElementalAffinity(
  element: keyof ElementalProperties,
  modality: Modality
): number {
  switch (modality) {
    case 'Mutable':
      // Air has strongest affinity with Mutable, followed by Water, Fire, Earth
      if (element === 'Air') return 0.9;
      if (element === 'Water') return 0.8;
      if (element === 'Fire') return 0.7;
      if (element === 'Earth') return 0.5;
      break;

    case 'Fixed':
      // Earth has strongest affinity with Fixed, followed by Water, Fire, Air
      if (element === 'Earth') return 0.9;
      if (element === 'Water') return 0.8;
      if (element === 'Fire') return 0.6;
      if (element === 'Air') return 0.5;
      break;

    case 'Cardinal':
      // All elements have equal affinity with Cardinal
      return 0.8;
  }

  return 0.5; // Default fallback
}

// Debugging wrapper function for alchemize
function debugAlchemize(...args: any[]) {
  try {
    console.log("Starting alchemize function with arguments:", 
      JSON.stringify({
        planetaryPositionsCount: args[0] ? Object.keys(args[0]).length : 0,
        isDaytime: args[1],
        lunarPhase: args[2],
        retrogradesCount: args[3] ? Object.keys(args[3]).length : 0
      })
    );
    
    // Check for null / (undefined || 1) parameters
    if (!args[0] || typeof args[0] !== 'object') {
      console.error("Invalid planetary positions parameter:", args[0]);
      throw new Error("Invalid planetary positions");
    }
    
    // Import the alchemize function from the original module
    const { alchemize } = require('../calculations/alchemicalCalculations');
    
    // Call the original function with proper error handling
    let result = alchemize(...args);
    
    // Validate the result
    if (!result) {
      console.error("Alchemize returned null / (undefined || 1) result");
      throw new Error("Null result from alchemize");
    }
    
    console.log("Alchemize result summary:", {
      dominantElement: result.dominantElement,
      elementalBalance: result.elementalBalance,
      spirit: result.spirit,
      essence: result.essence,
      matter: result.matter,
      substance: result.substance
    });
    
    return result;
  } catch (error) {
    console.error("Error in alchemize function:", error);
    // Return a fallback result rather than throwing
    return {
      spirit: 0,
      essence: 0,
      matter: 0,
      substance: 0,
      elementalBalance: {
        fire: 0.25,
        earth: 0.25,
        air: 0.25,
        water: 0.25
      },
      dominantElement: 'balanced',
      recommendation: 'A balanced diet incorporating elements from all food groups.',
      'Total Effect Value': {
        Fire: 0.25,
        Earth: 0.25,
        Air: 0.25,
        Water: 0.25
      }
    };
  }
}

export default { alchemize: debugAlchemize };

/**
 * Returns the current season based on the current date
 * @returns The current season (spring, summer, fall, winter)
 */
function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan-Dec)

  if (month >= 2 && month <= 4) {
    return 'spring';
  } else if (month >= 5 && month <= 7) {
    return 'summer';
  } else if (month >= 8 && month <= 10) {
    return 'fall';
  } else {
    return 'winter';
  }
}

/**
 * Utility function for getting ingredients with additional filtering options
 * This is used by ingredientRecommender.ts
 */
export let getIngredientsUtil = (
  criteria: {
    category?: string | string[];
    element?: keyof ElementalProperties;
    season?: string | string[];
    minScore?: number;
    limit?: number;
    excludeIds?: string[];
  } = {}
): EnhancedIngredient[] => {
  // Get all ingredients first
  let allIngredients = getAllIngredients();
  
  // Apply filters
  let filtered = allIngredients.filter(ingredient => {
    // Filter by category if specified
    if (criteria.category) {
      if (Array.isArray(criteria.category)) {
        if (!criteria.category.includes(ingredient.category as string)) {
          return false;
        }
      } else if (ingredient.category !== criteria.category) {
        return false;
      }
    }
    
    // Filter by element if specified
    if (criteria.element) {
      // Check if this element is dominant in the ingredient
      const elementValue = ingredient.elementalProperties[criteria.element] || 0;
      if (elementValue < 0.3) { // Simple threshold for dominance
        return false;
      }
    }
    
    // Filter by season if specified
    if (criteria.season && ingredient.season) {
      if (Array.isArray(criteria.season)) {
        // Check if any of the specified seasons match
        if (!criteria.season.some(s => ingredient.season?.includes(s))) {
          return false;
        }
      } else if (!ingredient.season.includes(criteria.season)) {
        return false;
      }
    }
    
    // Filter by minimum score if specified
    if (criteria.minScore !== undefined && 
        ingredient.score !== undefined &&
        ingredient.score < criteria.minScore) {
      return false;
    }
    
    // Filter out excluded IDs
    if (criteria.excludeIds && criteria.excludeIds.includes(ingredient.name)) {
      return false;
    }
    
    return true;
  });
  
  // Sort by score if available
  if (filtered.some(ing => ing.score !== undefined)) {
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  
  // Apply limit if specified
  if (criteria.limit && criteria.limit > 0) {
    filtered = filtered.slice(0, criteria.limit);
  }
  
  return filtered;
};
