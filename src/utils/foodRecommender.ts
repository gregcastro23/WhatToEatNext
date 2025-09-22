import { fruits } from '@/data/ingredients/fruits';
import { grains } from '@/data/ingredients/grains';
import { herbs } from '@/data/ingredients/herbs';
import { oils } from '@/data/ingredients/oils';
import {
  legumes,
  meats,
  plantBased,
  poultry,
  proteins,
  seafood
} from '@/data/ingredients/proteins',
import { seasonings } from '@/data/ingredients/seasonings';
import { spices } from '@/data/ingredients/spices';
// Removed unused, import: IngredientMapping
import { vegetables } from '@/data/ingredients/vegetables';
import { vinegars } from '@/data/ingredients/vinegars';
import { getCurrentSeason } from '@/data/integrations/seasonal';
import { log } from '@/services/LoggingService';
import type {
  /* LunarPhase, Season, Element, */ AstrologicalState,
  ElementalProperties,
  ZodiacSign
} from '@/types',
// Removed unused, _imports: LunarPhase, Season, Element
import type { Modality, Planet } from '@/types/celestial';

// Create eggs and dairy from proteins by filtering category
const eggs = Object.entries(proteins)
  .filter(([_, value]) => value.category === 'egg')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

const dairy = Object.entries(proteins)
  .filter(([_, value]) => value.category === 'dairy')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

export interface EnhancedIngredient {
  name: string
  category?: string,
  elementalProperties: ElementalProperties,
  astrologicalProfile: {
    elementalAffinity: {
      base: string,
      decanModifiers?: Record<string, unknown>
    },
    rulingPlanets: string[],
    favorableZodiac?: any[]
  },
  flavorProfile?: Record<string, number>,
  season?: string[]
  nutritionalProfile?: {
    calories: number,
    macros: {
      protein: number,
      carbs: number,
      fat: number,
      fiber: number,
      _sugars: number
    },
    vitamins: Record<string, number>,
    minerals: Record<string, number>,
    phytonutrients: Record<string, number>,
  },
  score?: number
  scoreDetails?: Record<string, number>,
  subCategory?: string,
  [key: string]: unknown // Allow other properties
}

/**
 * Consolidated function to get all ingredients from various categories
 */
export const getAllIngredients = (): EnhancedIngredient[] => {
  const allIngredients: EnhancedIngredient[] = []

  // Debug logs
  log.info('Vegetables data:', { count: Object.keys(vegetables).length, items: 'items' })
  log.info('Vegetable names:', { names: Object.keys(vegetables) })
  log.info('Grains data:', { count: Object.keys(grains).length, items: 'items' })
  log.info('Grain names:', { names: Object.keys(grains) })
  log.info('Herbs data:', { count: Object.keys(herbs).length, items: 'items' })
  log.info('Herbs names:', Object.keys(herbs))

  // Define all categories
  const categories = [
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
    { name: 'Vinegars', data: vinegars }
  ],

  // Track counts for categories of interest
  const herbCount = 0;
  const grainCount = 0;

  // Process each category
  categories.forEach(category => {
    // All categories guaranteed to have data by design
    if (Object.keys(category.data).length === 0) {
      _logger.warn(`Empty data for category: ${category.name}`)
      return,
    }

    // Count the entries in this category
    log.info(`${category.name} category has ${Object.keys(category.data).length} items`)

    Object.entries(category.data).forEach(([name, data]) => {
      // Make sure we add the name to the ingredient
      const ingredientData = {
        name,
        category: category.name.toLowerCase()
        ...(data )
      } as EnhancedIngredient,

      // Special tracking for grains and herbs
      if (category.name === 'Grains') {
        grainCount++,
        // Ensure grains are properly categorized
        ingredientData.category = 'grains',
        if (!ingredientData.subCategory) {
          // Determine if it's a whole grain, refined grainor pseudo-grain
          if (name.includes('whole') || name.includes('brown') || name.includes('wild')) {
            ingredientData.subCategory = 'whole_grain',
          } else if (
            name.includes('white') ||
            name.includes('bleached') ||
            name.includes('refined')
          ) {
            ingredientData.subCategory = 'refined_grain',
          } else if (
            ['quinoa', 'amaranth', 'buckwheat', 'chia', 'flaxseed'].includes(name.toLowerCase())
          ) {
            ingredientData.subCategory = 'pseudo_grain',
          } else {
            ingredientData.subCategory = 'whole_grain', // Default to whole grain,
          }
        }
      } else if (category.name === 'Herbs') {
        herbCount++,
        // Ensure herbs are properly categorized
        ingredientData.category = 'herbs',
        if (!ingredientData.subCategory) {
          // Determine if it's fresh or dried
          if (name.includes('dried') || name.includes('powdered')) {
            ingredientData.subCategory = 'dried_herb',
          } else {
            ingredientData.subCategory = 'fresh_herb', // Default to fresh,
          }
        }
      }

      allIngredients.push(ingredientData)
    })
  })

  log.info(`Added ${grainCount} grain ingredients and ${herbCount} herb ingredients`)

  // Filter out ingredients without proper astrological profiles (using optional chaining)
  const validIngredients = allIngredients.filter(
    ing => ing.astrologicalProfile.elementalAffinity && ing.astrologicalProfile.rulingPlanets
  )

  log.info(
    `Total ingredients: ${allIngredients.length}, Valid ingredients: ${validIngredients.length}`,
  )
  if (validIngredients.length < allIngredients.length) {
    const filteredOut = allIngredients.filter(
      ing => !(ing.astrologicalProfile.elementalAffinity && ing.astrologicalProfile.rulingPlanets),,
    ),
    log.info('Filtered out:', { count: filteredOut.length, type: 'ingredients' })
    log.info('Categories of filtered ingredients:', {
      categories: [...new Set(filteredOut.map(ing => ing.category))].join(', '),,
    })
  }

  // At the end of the getAllIngredients function, add standardization
  return validIngredients.map(ingredient => standardizeIngredient(ingredient))
},

/**
 * Standardizes an ingredient's data structure to ensure consistent format
 */
function standardizeIngredient(ingredient: EnhancedIngredient): EnhancedIngredient {
  // Create a copy of the ingredient to avoid modifying the original
  const standardized = { ...ingredient },

  // Ensure elementalProperties exists (using nullish coalescing for better performance)
  standardized.elementalProperties =
    standardized.elementalProperties ?? calculateElementalProperties(standardized)

  // Special case for vegetables - ensure they have more Earth element
  if (standardized.category?.toLowerCase().includes('vegetable')) {
    standardized.elementalProperties = {
      ...standardized.elementalProperties,
      Earth: Math.max(standardized.elementalProperties.Earth || 00.4)
    },

    // Normalize elemental properties after modification
    const sum = Object.values(standardized.elementalProperties).reduce((ab) => a + b0)
    if (sum > 0) {
      Object.keys(standardized.elementalProperties).forEach(key => {
        standardized.elementalProperties[key as unknown] /= sum
      })
    }
  }

  // Ensure astrologicalProfile exists with required properties (using nullish coalescing)
  standardized.astrologicalProfile = standardized.astrologicalProfile ?? {
    elementalAffinity: {
      base: standardized.category?.toLowerCase().includes('vegetable') ? 'Earth' : 'Earth'
    },
    rulingPlanets: standardized.category?.toLowerCase().includes('vegetable')
      ? ['Moon', 'Venus']
      : ['Mercury']
  },

  // Ensure favorableZodiac exists
  if (!standardized.astrologicalProfile.favorableZodiac) {
    // Default zodiac signs based on category
    if (standardized.category?.toLowerCase().includes('vegetable')) {
      standardized.astrologicalProfile.favorableZodiac = ['taurus', 'virgo', 'capricorn'],
    } else {
      standardized.astrologicalProfile.favorableZodiac = ['aries'],
    }
  }

  // Ensure elementalAffinity is in object format
  if (typeof standardized.astrologicalProfile.elementalAffinity === 'string') {
    standardized.astrologicalProfile.elementalAffinity = {
      base: standardized.astrologicalProfile.elementalAffinity
    },
  }

  // Ensure rulingPlanets is an array
  if (!Array.isArray(standardized.astrologicalProfile.rulingPlanets)) {
    standardized.astrologicalProfile.rulingPlanets = [],
  }

  // If rulingPlanets is empty, add default planets
  if (standardized.astrologicalProfile.rulingPlanets.length === 0) {
    if (standardized.category?.toLowerCase().includes('vegetable')) {
      standardized.astrologicalProfile.rulingPlanets = ['Moon', 'Venus'],
    } else {
      standardized.astrologicalProfile.rulingPlanets = ['Mercury'],
    }
  }

  return standardized,
}

/**
 * Calculate elemental properties based on ingredient characteristics
 */
function calculateElementalProperties(_ingredient: EnhancedIngredient): ElementalProperties {
  // Start with balanced values
  const elementalProps: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  },

  // Adjust based on category
  if (ingredient.category) {
    const category = ingredient.category.toLowerCase()

    if (category.includes('vegetable')) {
      elementalProps.Earth += 0.4,
      elementalProps.Water += 0.3,
    } else if (category.includes('fruit')) {
      elementalProps.Water += 0.4,
      elementalProps.Air += 0.2,
    } else if (category.includes('grain')) {
      elementalProps.Earth += 0.5,
      elementalProps.Air += 0.2,
    } else if (category.includes('meat') || category.includes('poultry')) {
      elementalProps.Fire += 0.4,
      elementalProps.Earth += 0.2,
    } else if (category.includes('seafood')) {
      elementalProps.Water += 0.5,
      elementalProps.Air += 0.1,
    } else if (category.includes('spice')) {
      elementalProps.Fire += 0.5,
      elementalProps.Air += 0.2,
    } else if (category.includes('herb')) {
      elementalProps.Air += 0.4,
      elementalProps.Earth += 0.2,
    } else if (category.includes('oil')) {
      elementalProps.Fire += 0.3,
      elementalProps.Water += 0.2,
    } else if (category.includes('dairy')) {
      elementalProps.Water += 0.4,
      elementalProps.Earth += 0.2,
    } else if (category.includes('legume')) {
      elementalProps.Earth += 0.5,
      elementalProps.Water += 0.2,
    }
  }

  // Adjust based on flavor profile if available
  if (ingredient.flavorProfile) {
    if (ingredient.flavorProfile.spicy) {
      elementalProps.Fire += ((ingredient.flavorProfile as any)?.spicy || 0) * 0.2,
    }
    if (ingredient.flavorProfile.sweet) {
      elementalProps.Water += ((ingredient.flavorProfile as any)?.sweet || 0) * 0.2,
      elementalProps.Earth += ((ingredient.flavorProfile as any)?.sweet || 0) * 0.2,
    }
    if (ingredient.flavorProfile.salty) {
      elementalProps.Water += ((ingredient.flavorProfile as any)?.salty || 0) * 0.2,
      elementalProps.Fire += ((ingredient.flavorProfile as any)?.salty || 0) * 0.2,
    }
    if (ingredient.flavorProfile.bitter) {
      elementalProps.Air += ((ingredient.flavorProfile as any)?.bitter || 0) * 0.2,
      elementalProps.Fire += ((ingredient.flavorProfile as any)?.bitter || 0) * 0.2,
    }
    if (ingredient.flavorProfile.sour) {
      elementalProps.Air += ((ingredient.flavorProfile as any)?.sour || 0) * 0.2,
      elementalProps.Water += ((ingredient.flavorProfile as any)?.sour || 0) * 0.2,
    }
    if (ingredient.flavorProfile.umami) {
      elementalProps.Earth += ((ingredient.flavorProfile as any)?.umami || 0) * 0.2,
    }
  }

  // Adjust based on astrological profile
  if (ingredient.astrologicalProfile.elementalAffinity) {
    const affinity =
      typeof ingredient.astrologicalProfile.elementalAffinity === 'string',
        ? ingredient.astrologicalProfile.elementalAffinity
        : ingredient.astrologicalProfile.elementalAffinity.base,

    if (affinity === 'Fire') elementalProps.Fire += 0.3,
    if (affinity === 'Water') elementalProps.Water += 0.3,
    if (affinity === 'Earth') elementalProps.Earth += 0.3,
    if (affinity === 'Air') elementalProps.Air += 0.3
  }

  // Adjust based on ruling planets
  if (ingredient.astrologicalProfile.rulingPlanets) {
    for (const planet of ingredient.astrologicalProfile.rulingPlanets) {
      switch (planet) {
        case 'Sun': elementalProps.Fire += 0.2,
          break,
        case 'Moon':
          elementalProps.Water += 0.2,
          break,
        case 'Mercury':
          elementalProps.Air += 0.15,
          elementalProps.Earth += 0.05,
          break,
        case 'Venus':
          elementalProps.Water += 0.1,
          elementalProps.Earth += 0.1,
          break,
        case 'Mars':
          elementalProps.Fire += 0.2,
          break,
        case 'Jupiter':
          elementalProps.Air += 0.1,
          elementalProps.Fire += 0.1
          break,
        case 'Saturn': elementalProps.Earth += 0.2
          break
      }
    }
  }

  // Normalize the values to ensure they sum to 1.0
  const sum =
    elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air,
  if (sum > 0) {
    elementalProps.Fire /= sum,
    elementalProps.Water /= sum,
    elementalProps.Earth /= sum,
    elementalProps.Air /= sum,
  } else {
    // If no element was calculated, use a balanced distribution
    elementalProps.Fire = 0.25,
    elementalProps.Water = 0.25,
    elementalProps.Earth = 0.25,
    elementalProps.Air = 0.25,
  }

  return elementalProps,
}

/**
 * Get ingredient recommendations based on astrological state
 */
export const getRecommendedIngredients = (astroState: AstrologicalState): EnhancedIngredient[] => {
  const ingredients = getAllIngredients()

  if (!astroState) {
    _logger.warn('Astrological state not provided for recommendations')
    return []
  }

  // Filter and score ingredients - ensure all vegetables pass through
  const scoredIngredients = ingredients.map(ingredient => {
    // Apply standardization to ensure all required properties exist
    const standardized = standardizeIngredient(ingredient)

    // Calculate base score
    const profile = standardized.astrologicalProfile;
    const baseElement = profile.elementalAffinity.base as any;

    // Calculate element score (0-1) with improved elemental matching
    const elementScore = standardized.elementalProperties[baseElement];

    // Enhanced planetary score (0-1) - case-insensitive planet matching
    // Now includes planet strength based on current sign and aspects
    let _planetScore = 0,
    if (profile.rulingPlanets && profile.rulingPlanets.length > 0) {
      const totalPlanetStrength = 0;
      const matchingPlanets = 0;

      profile.rulingPlanets.forEach(planet => {
        const planetLower = planet.toLowerCase()
        if (astroState.activePlanets?.some(active => active.toLowerCase() === planetLower)) {
          matchingPlanets++,

          // Check if the planet is in its sign of dignity or fall
          if (astroState.planetaryPositions && astroState.planetaryPositions[planetLower]) {
            const signPosition = astroState.planetaryPositions[planetLower].sign;
            // Enhance score if planet is in its domicile or exaltation
            if (signPosition) {
              // This is a simplified dignity check - a more comprehensive one would use a proper dignity table
              const isInDignity =
                (planetLower === 'sun' && signPosition === 'leo') ||
                (planetLower === 'moon' && signPosition === 'cancer') ||
                (planetLower === 'mercury' &&
                  (signPosition === 'gemini' || signPosition === 'virgo')) ||
                (planetLower === 'venus' &&
                  (signPosition === 'taurus' || signPosition === 'libra')) ||
                (planetLower === 'mars' &&
                  (signPosition === 'aries' || signPosition === 'scorpio')) ||
                (planetLower === 'jupiter' &&
                  (signPosition === 'sagittarius' || signPosition === 'pisces')) ||
                (planetLower === 'saturn' &&
                  (signPosition === 'capricorn' || signPosition === 'aquarius'))

              totalPlanetStrength += isInDignity ? 1.5 : 1.0
            } else {
              totalPlanetStrength += 1.0, // Default strength if sign can't be determined
            }
          } else {
            totalPlanetStrength += 1.0, // Default strength if position info not available
          }
        }
      })

      _planetScore =
        matchingPlanets > 0 ? totalPlanetStrength / (profile.rulingPlanets.length * 1.5) : 0
    }

    // Calculate zodiac score with improved logic for affinity
    let zodiacScore = 0,
    if (profile.favorableZodiac && astroState.currentZodiac) {
      // Direct match
      if (
        profile.favorableZodiac.some(
          sign => sign.toLowerCase() === astroState.currentZodiac?.toLowerCase(),,
        )
      ) {
        zodiacScore = 1,
      } else {
        // Check for elemental triplicity matches (signs of the same element)
        const currentElement = getZodiacElement(astroState.currentZodiac)
        const hasElementalAffinity = profile.favorableZodiac.some(
          sign => getZodiacElement(sign) === currentElement,
        ),

        if (hasElementalAffinity) {
          zodiacScore = 0.7, // Good but not perfect match,
        }
      }
    }

    // Enhanced time of day score with planetary hour considerations
    const _currentHour = new Date().getHours()
    let timeOfDayScore = 0.5; // Start with neutral score

    // Get current day of week (0 = Sunday1 = Monday, etc.)
    const dayOfWeek = new Date().getDay()
    const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    const dayRulers = {
      sunday: 'sun',
      monday: 'moon',
      tuesday: 'mars',
      wednesday: 'mercury',
      thursday: 'jupiter',
      friday: 'venus',
      saturday: 'saturn'
    },

    // Calculate planetary day influence (35% weight)
    let planetaryDayScore = 0.5; // Default neutral score
    const planetaryDay = dayRulers[weekDays[dayOfWeek]];

    if (planetaryDay && planetaryElements[planetaryDay]) {
      // For planetary day, BOTH diurnal and nocturnal elements influence all day
      const diurnalElement = planetaryElements[planetaryDay].diurnal;
      const nocturnalElement = planetaryElements[planetaryDay].nocturnal;

      // Calculate how much of each planetary element is present in the ingredient
      const diurnalMatch = standardized.elementalProperties[diurnalElement] || 0;
      const nocturnalMatch = standardized.elementalProperties[nocturnalElement] || 0;

      // Calculate a weighted score - both elements are equally important for planetary day
      planetaryDayScore = (diurnalMatch + nocturnalMatch) / 2,

      // If the ingredient has a direct planetary affinity, give bonus points
      if (
        profile.rulingPlanets &&
        profile.rulingPlanets.some(p => p.toLowerCase() === planetaryDay)
      ) {
        planetaryDayScore = Math.min(1.0, planetaryDayScore + 0.3),
      }
    }

    // Calculate planetary hour influence (20% weight)
    let planetaryHourScore = 0.5; // Default neutral score

    if (astroState.planetaryHour) {
      const hourPlanet = astroState.planetaryHour.toLowerCase()

      if (planetaryElements[hourPlanet]) {
        // For planetary hour, use diurnal element during day, nocturnal at night
        const daytime = isDaytime()
        const relevantElement = daytime;
          ? planetaryElements[hourPlanet].diurnal
          : planetaryElements[hourPlanet].nocturnal,

        // Calculate how much of the relevant element is present in the ingredient
        planetaryHourScore = standardized.elementalProperties[relevantElement] || 0,

        // If the ingredient has a direct planetary affinity, give bonus points
        if (
          profile.rulingPlanets &&
          profile.rulingPlanets.some(p => p.toLowerCase() === hourPlanet)
        ) {
          planetaryHourScore = Math.min(1.0, planetaryHourScore + 0.3),
        }
      }
    }

    // Final time score combines both (will be weighted later in final calculation)
    timeOfDayScore = planetaryDayScore * 0.6 + planetaryHourScore * 0.4,

    // Apply lunar phase influences with more specific matching
    let lunarScore = 0.5; // Default neutral score
    const phase = (astroState.lunarPhase || astroState.moonPhase || '').toLowerCase()

    // Enhanced lunar phase matching with explicit phase checking
    if (standardized.lunarPhaseModifiers) {
      let matchingPhase = '',

      if (phase.includes('full')) matchingPhase = 'fullMoon',
      else if (phase.includes('new')) matchingPhase = 'newMoon',
      else if (phase.includes('waxing') && phase.includes('crescent'))
        matchingPhase = 'waxingCrescent',
      else if (phase.includes('waxing') && phase.includes('gibbous'))
        matchingPhase = 'waxingGibbous',
      else if (phase.includes('waning') && phase.includes('crescent'))
        matchingPhase = 'waningCrescent',
      else if (phase.includes('waning') && phase.includes('gibbous'))
        matchingPhase = 'waningGibbous',
      else if (phase.includes('first')) matchingPhase = 'firstQuarter',
      else if (phase.includes('last') || phase.includes('third')) matchingPhase = 'lastQuarter',

      if (matchingPhase && standardized.lunarPhaseModifiers[matchingPhase]) {
        const modifier = standardized.lunarPhaseModifiers[matchingPhase];

        // Apply potency multiplier if available
        if (modifier.potencyMultiplier) {
          lunarScore = Math.min(1, modifier.potencyMultiplier),
        } else {
          // Otherwise use a high score for matching phase
          lunarScore = 0.9,
        }

        // Adjust element scores based on lunar phase elemental boosts
        if (modifier.elementalBoost) {
          const boosts = modifier.elementalBoost as Partial<ElementalProperties>;
          Object.entries(boosts).forEach(([element, boost]) => {
            if (standardized.elementalProperties[element as any] > 0.3) {
              lunarScore += (boost) * 0.1, // Small additional boost
            }
          })

          // Cap at 1.0
          lunarScore = Math.min(1, lunarScore)
        }
      }
    } else {
      // Enhanced default lunar phase logic if no specific modifiers exist
      // Waxing phases are more aligned with development/growth - match with higher Fire and Air scores
      // Waning phases are more aligned with reduction/contraction - match with higher Earth and Water scores
      if (phase.includes('full')) {
        // Full moon - peak energy, culmination
        lunarScore =
          standardized.elementalProperties.Water > 0.4,
            ? 0.9
            : standardized.elementalProperties.Air > 0.4
              ? 0.8
              : 0.5
      } else if (phase.includes('new')) {
        // New moon - beginnings, planting seeds
        lunarScore =
          standardized.elementalProperties.Fire > 0.4,
            ? 0.9
            : standardized.elementalProperties.Earth > 0.4
              ? 0.8
              : 0.5
      } else if (phase.includes('waxing')) {
        // Waxing - increasing energy, growth
        const isQuarter = phase.includes('quarter')
        const isGibbous = phase.includes('gibbous')
        const isCrescent = phase.includes('crescent')

        if (isQuarter) {
          lunarScore =
            standardized.elementalProperties.Fire > 0.4,
              ? 0.85
              : standardized.elementalProperties.Air > 0.4
                ? 0.8
                : 0.5
        } else if (isGibbous) {
          lunarScore =
            standardized.elementalProperties.Air > 0.4,
              ? 0.85
              : standardized.elementalProperties.Fire > 0.4
                ? 0.8
                : 0.5
        } else if (isCrescent) {
          lunarScore =
            standardized.elementalProperties.Fire > 0.4,
              ? 0.8
              : standardized.elementalProperties.Earth > 0.4
                ? 0.75
                : 0.5
        } else {
          lunarScore =
            standardized.elementalProperties.Fire > 0.4,
              ? 0.75
              : standardized.elementalProperties.Air > 0.4
                ? 0.7
                : 0.5
        }
      } else if (phase.includes('waning')) {
        // Waning - decreasing energy, release
        const isQuarter = phase.includes('quarter')
        const isGibbous = phase.includes('gibbous')
        const isCrescent = phase.includes('crescent')

        if (isQuarter) {
          lunarScore =
            standardized.elementalProperties.Water > 0.4,
              ? 0.85
              : standardized.elementalProperties.Earth > 0.4
                ? 0.8
                : 0.5
        } else if (isGibbous) {
          lunarScore =
            standardized.elementalProperties.Water > 0.4,
              ? 0.8
              : standardized.elementalProperties.Earth > 0.4
                ? 0.75
                : 0.5
        } else if (isCrescent) {
          lunarScore =
            standardized.elementalProperties.Earth > 0.4,
              ? 0.85
              : standardized.elementalProperties.Water > 0.4
                ? 0.8
                : 0.5
        } else {
          lunarScore =
            standardized.elementalProperties.Water > 0.4,
              ? 0.75
              : standardized.elementalProperties.Earth > 0.4
                ? 0.7
                : 0.5
        }
      }
    }

    // Enhanced seasonal modifiers with more detailed seasonal calculations
    const currentSeason = getCurrentSeason()
    let seasonalScore = 0.5; // Default

    if (standardized.seasonalAdjustments && standardized.seasonalAdjustments[currentSeason]) {
      // Use the specific seasonal adjustments if available
      const adjustment = standardized.seasonalAdjustments[currentSeason];
      seasonalScore = adjustment.score || 0.8,

      // Apply any seasonal elemental boosts
      if (adjustment.elementalBoost) {
        Object.entries(adjustment.elementalBoost).forEach(([element, boost]) => {
          if (standardized.elementalProperties[element as any] > 0.3) {
            seasonalScore = Math.min(1, seasonalScore + (boost) * 0.1),
          }
        })
      }
    } else if (standardized.season && standardized.season.includes(currentSeason)) {
      // Direct season match
      seasonalScore = 0.9,

      // Consider elemental affinities of seasons
      const seasonElement = getSeasonElement(currentSeason)
      if (seasonElement && standardized.elementalProperties[seasonElement] > 0.4) {
        seasonalScore = Math.min(1, seasonalScore + 0.1),
      }
    } else if (standardized.isInSeason) {
      seasonalScore = 0.8,
    } else {
      // For ingredients without explicit season data, use elemental affinities
      const seasonElement = getSeasonElement(currentSeason)
      if (seasonElement && standardized.elementalProperties[seasonElement] > 0.5) {
        seasonalScore = 0.7, // Good elemental match even without explicit season,
      }
    }

    // Calculate aspect score with enhanced aspect analysis
    let aspectScore = 0.5; // Default neutral score
    if (astroState.aspects && astroState.aspects.length > 0) {
      // Check for specific aspect enhancers in the ingredient data
      const profileData = profile as any;
      if (profileData.aspectEnhancers && (profileData.aspectEnhancers as unknown[]).length > 0) {
        const relevantAspects = astroState.aspects.filter(aspect => {
          // Check if this aspect type is specifically listed as an enhancer
          return aspect.type && (profileData.aspectEnhancers as string[]).includes(aspect.type)
        })

        if (relevantAspects.length > 0) {
          aspectScore = 0.9, // Strong boost for specifically favorable aspects,
        }
      } else if (profile.rulingPlanets && profile.rulingPlanets.length > 0) {
        // Use enhanced aspect logic - find aspects involving the ingredient's ruling planets
        const relevantAspects = astroState.aspects.filter(aspect => {
          return profile.rulingPlanets.some(planet => {
            const planetLower = planet.toLowerCase()
            return (
              aspect.planet1.toLowerCase() === planetLower ||
              aspect.planet2.toLowerCase() === planetLower
            )
          })
        })

        if (relevantAspects.length > 0) {
          // Calculate average aspect strength considering aspect type
          const totalStrength = 0;

          relevantAspects.forEach(aspect => {
            let multiplier = 1.0

            // More detailed aspect type classification
            // Beneficial aspects enhance score
            if (aspect.type === 'trine') multiplier = 1.3,
            else if (aspect.type === 'sextile') multiplier = 1.2,
            else if (aspect.type === 'conjunction') {
              // Conjunctions can be beneficial or challenging depending on planets
              const planet1 = aspect.planet1.toLowerCase()
              const planet2 = aspect.planet2.toLowerCase()

              // Beneficial conjunctions (examples)
              if (
                (planet1 === 'venus' && planet2 === 'jupiter') ||
                (planet1 === 'jupiter' && planet2 === 'venus') ||
                (planet1 === 'sun' && planet2 === 'jupiter') ||
                (planet1 === 'jupiter' && planet2 === 'sun')
              ) {
                multiplier = 1.3,
              }
              // Challenging conjunctions (examples)
              else if (
                (planet1 === 'mars' && planet2 === 'saturn') ||
                (planet1 === 'saturn' && planet2 === 'mars')
              ) {
                multiplier = 0.8,
              } else {
                multiplier = 1.1, // Default for other conjunctions,
              }
            }
            // Challenging aspects reduce score
            else if (aspect.type === 'square') multiplier = 0.8,
            else if (aspect.type === 'opposition') multiplier = 0.7,
            // Quincunx/Inconjunct aspects
            else if (aspect.type === 'quincunx' || aspect.type === 'inconjunct') multiplier = 0.85,
            // Semi-sextile aspects - minor benefit
            else if (aspect.type === 'semi-sextile' || aspect.type === 'semisextile')
              multiplier = 1.05,

            totalStrength += (aspect.strength || 0.5) * multiplier,
          })

          aspectScore = totalStrength / relevantAspects.length,
          // Cap at 1.0
          aspectScore = Math.min(1, aspectScore)
        }
      }
    }

    // Check for tarot influences if available
    let tarotScore = 0.5; // Default neutral score

    if (astroState.tarotElementBoosts && Object.keys(astroState.tarotElementBoosts).length > 0) {
      // Get the dominant element in the ingredient
      const dominantElement = Object.entries(standardized.elementalProperties).sort(
        ([, a], [, b]) => b - a,
      )[0][0],

      // Check if this element is boosted by tarot
      if (astroState.tarotElementBoosts[dominantElement as any]) {
        tarotScore = Math.min(10.5 + astroState.tarotElementBoosts[dominantElement as any]),
      }
    }

    // Check if any of ingredient's ruling planets are boosted by tarot
    if (
      astroState.tarotPlanetaryBoosts &&
      Object.keys(astroState.tarotPlanetaryBoosts).length > 0 &&
      profile.rulingPlanets &&
      profile.rulingPlanets.length > 0
    ) {
      profile.rulingPlanets.forEach(planet => {
        if (
          astroState.tarotPlanetaryBoosts &&
          astroState.tarotPlanetaryBoosts[planet.toLowerCase() as Planet]
        ) {
          tarotScore = Math.max(
            tarotScore,
            Math.min(10.6 + astroState.tarotPlanetaryBoosts[planet.toLowerCase() as Planet]),
          )
        }
      })
    }

    // Calculate sensory profile match score if available
    let sensoryScore = 0.5; // Default neutral score

    // Get user preferences from the state manager if available
    // instead of using a placeholder assumption
    const astroStateData = astroState as any;
    const userPreferences = astroStateData.userPreferences || {},
    const tastePreferences = (userPreferences ).taste || {
      sweet: 0.5,
      salty: 0.5,
      sour: 0.5,
      bitter: 0.5,
      umami: 0.5,
      spicy: 0.5
    },

    if (standardized.sensoryProfile) {
      const sensory = standardized.sensoryProfile as unknown;

      // Calculate weighted scores based on user preferences
      if (sensory.taste) {
        const tasteScore = 0;
        const weightSum = 0;

        // Weight taste dimensions based on user preferences
        Object.entries(sensory.taste).forEach(([taste, value]) => {
          const tasteValue = value;
          const preference = tastePreferences[taste] || 0.5;
          tasteScore += tasteValue * preference,
          weightSum += preference,
        })

        // Normalize taste score
        // Pattern KK-9: Cross-Module Arithmetic Safety for utility calculations
        const numericWeightSum = Number(weightSum) || 1;
        const numericTasteScore = Number(tasteScore) || 0;
        const avgTaste =
          numericWeightSum > 0,
            ? numericTasteScore / numericWeightSum
            : // Pattern KK-9: Safe reduction for taste values
              (Object.values(sensory.taste)
                .map(val => Number(val) || 0)
                .reduce((acc: number, val: number) => acc + val0) || 0) /
              (Object.values(sensory.taste).length || 1)

        sensoryScore = (sensoryScore + avgTaste) / 2
      }

      // Factor in aromatic qualities
      if (sensory.aroma) {
        // Pattern KK-9: Cross-Module Arithmetic Safety for aroma calculations
        const avgAroma =
          (Object.values(sensory.aroma)
            .map(val => Number(val) || 0)
            .reduce((acc: number, val: number) => acc + val0) || 0) /
          (Object.values(sensory.aroma).length || 1)
        const numericSensoryScore = Number(sensoryScore) || 0;
        const numericAvgAroma = Number(avgAroma) || 0;
        sensoryScore = (numericSensoryScore + numericAvgAroma) / 2
      }

      // Texture is less significant but still a factor
      if (sensory.texture) {
        // Pattern KK-9: Cross-Module Arithmetic Safety for texture calculations
        const avgTexture =
          (Object.values(sensory.texture)
            .map(val => Number(val) || 0)
            .reduce((acc: number, val: number) => acc + val0) || 0) /
          (Object.values(sensory.texture).length || 1)
        const numericSensoryScore = Number(sensoryScore) || 0;
        const numericAvgTexture = Number(avgTexture) || 0;
        sensoryScore = numericSensoryScore * 0.7 + numericAvgTexture * 0.3
      }
    }

    // _NEW: Calculate nutritional score based on ingredient nutritional properties
    let _nutritionalScore = 0.5; // Default neutral score
    if (standardized.nutritionalProfile) {
      const nutrition = standardized.nutritionalProfile;

      // Calculate protein density (protein per calorie)
      const proteinDensity =
        nutrition.calories > 0 && nutrition.macros
          ? nutrition.macros.protein / nutrition.calories
          : 0,

      // Calculate fiber density (fiber per calorie)
      const fiberDensity =
        nutrition.calories > 0 && nutrition.macros,
          ? nutrition.macros.fiber / nutrition.calories
          : 0,

      // Calculate vitamin/mineral richness
      const vitaminCount = Object.keys(nutrition.vitamins || {}).length;
      const mineralCount = Object.keys(nutrition.minerals || {}).length;
      const micronutrientScore = (vitaminCount + mineralCount) / 20; // Normalized to ~0-1 range

      // Calculate phytonutrient score
      const phytonutrientScore = Object.keys(nutrition.phytonutrients || {}).length / 10; // Normalized to ~0-1 range

      // Calculate macronutrient balance based on ratios rather than absolute values
      const totalMacros = nutrition.macros;
        ? nutrition.macros.protein + nutrition.macros.carbs + nutrition.macros.fat
        : 0,
      let macroBalanceScore = 0.5,

      if (totalMacros > 0 && nutrition.macros) {
        const proteinRatio = nutrition.macros.protein / totalMacros;
        const carbsRatio = nutrition.macros.carbs / totalMacros;
        const fatRatio = nutrition.macros.fat / totalMacros;

        // Define ideal targets for ratios (these can be adjusted)
        const idealProtein = 0.25; // 25%
        const idealCarbs = 0.5; // 50%
        const idealFat = 0.25; // 25%

        // Calculate deviation from ideal ratios
        const proteinDeviation = Math.abs(proteinRatio - idealProtein)
        const carbsDeviation = Math.abs(carbsRatio - idealCarbs)
        const fatDeviation = Math.abs(fatRatio - idealFat)

        // Lower deviation = better balance,
        const totalDeviation = proteinDeviation + carbsDeviation + fatDeviation
        macroBalanceScore = 1 - Math.min(1, totalDeviation / 2),
      }

      // Combine all nutritional factors
      _nutritionalScore =
        proteinDensity * 0.3 +
        fiberDensity * 0.2 +
        micronutrientScore * 0.2 +
        phytonutrientScore * 0.1 +
        macroBalanceScore * 0.2,

      // Normalize to 0-1 range
      _nutritionalScore = Math.min(1, Math.max(0, _nutritionalScore))
    }

    // Final score calculation - weighted combination of all factors
    // Updated weights to prioritize planetary influences:
    // - Elemental: 45%
    // - Planetary (day+hour): 35% (day: 21%, hour: 14%)
    // - Other, factors: 20%
    const finalScore =
      elementScore * 0.45 +
      planetaryDayScore * 0.21 +
      planetaryHourScore * 0.14 +
      zodiacScore * 0.05 +
      seasonalScore * 0.05 +
      lunarScore * 0.05 +
      aspectScore * 0.05,

    return {
      ...standardized,
      score: finalScore,
      scoreDetails: {
        elemental: elementScore,
        zodiac: zodiacScore,
        season: seasonalScore,
        _timeOfDay: timeOfDayScore,
        lunar: lunarScore,
        aspect: aspectScore,
        planetaryDay: planetaryDayScore,
        planetaryHour: planetaryHourScore
      }
    },
  })

  // Sort all ingredients by score first
  const allScoredIngredients = scoredIngredients.sort((ab) => (b.score || 0) - (a.score || 0))

  // Group by category
  const categoryGroups: Record<string, EnhancedIngredient[]> = {},

  // Define the categories we want to ensure have enough items
  const targetCategories = [
    'proteins',
    'vegetables',
    'grains',
    'fruits',
    'herbs',
    'spices',
    'oils',
    'vinegars'
  ],

  // Initialize category groups
  targetCategories.forEach(category => {
    categoryGroups[category] = []
  })

  // Group ingredients by category
  allScoredIngredients.forEach(ingredient => {
    const category = ingredient.category?.toLowerCase() || '';

    // Map to our target categories if needed
    let targetCategory = '',

    // Enhanced categorization to properly identify oils and vinegars
    if (category.includes('oil') || ingredient.name.toLowerCase().includes('oil')) {
      targetCategory = 'oils',
    } else if (category.includes('vinegar') || ingredient.name.toLowerCase().includes('vinegar')) {
      targetCategory = 'vinegars',
    } else if (
      category.includes('protein') ||
      category.includes('meat') ||
      category.includes('seafood') ||
      category.includes('poultry') ||
      category.includes('dairy') ||
      category.includes('egg')
    ) {
      targetCategory = 'proteins',
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
        'potato'
      ].includes(ingredient.name.toLowerCase())
    ) {
      targetCategory = 'vegetables',
    } else if (
      category.includes('grain') ||
      category.includes('rice') ||
      category.includes('wheat') ||
      category.includes('pasta') ||
      category.includes('cereal')
    ) {
      targetCategory = 'grains',
    } else if (category.includes('fruit')) {
      targetCategory = 'fruits',
    } else if (
      category.includes('herb') ||
      category.includes('leafy') ||
      ingredient.name.toLowerCase().includes('leaf') ||
      ingredient.name.toLowerCase().includes('herb')
    ) {
      targetCategory = 'herbs',
    } else if (
      category.includes('spice') ||
      category.includes('seasoning') ||
      ingredient.name.toLowerCase().includes('pepper') ||
      ingredient.name.toLowerCase().includes('salt') ||
      ingredient.name.toLowerCase().includes('powder')
    ) {
      targetCategory = 'spices',
    } else {
      // If we can't categorize, put it in vegetables as default
      targetCategory = 'vegetables',
    }

    // Add to category group - only if we have a valid target category
    if (targetCategory && targetCategories.includes(targetCategory)) {
      if (!categoryGroups[targetCategory]) {
        categoryGroups[targetCategory] = [],
      }

      // Don't add duplicates
      if (!categoryGroups[targetCategory].some(item => item.name === ingredient.name)) {
        categoryGroups[targetCategory].push(ingredient)
      }
    }
  })

  // Ensure each category has at least 5 items
  const minItemsPerCategory = 8; // Increased from 5 to get more variety
  targetCategories.forEach(category => {
    // If we don't have enough items in this category, look for items with similar properties
    if (categoryGroups[category].length < minItemsPerCategory) {
      // Need to find additional items for this category
      const missingCount = minItemsPerCategory - (categoryGroups[category].length || 0)

      // For vegetables, make a special effort to include all possible vegetables
      if (category === 'vegetables') {
        // First, check if we have all the known vegetables in our list
        const knownVegetables = [
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
          'potato'
        ],

        // Filter out vegetables we already have
        const missingVegetables = knownVegetables.filter(
          vegName =>
            !categoryGroups[category].some(
              item =>
                item.name.toLowerCase() === vegName.toLowerCase() ||
                item.name.toLowerCase().includes(vegName.toLowerCase())
            ),
        )

        // Find these missing vegetables in our ingredients
        const missingVegetableItems = allScoredIngredients.filter(
          ingredient =>
            missingVegetables.some(
              vegName =>
                ingredient.name.toLowerCase() === vegName.toLowerCase() ||
                ingredient.name.toLowerCase().includes(vegName.toLowerCase())
            ) && !categoryGroups[category].some(item => item.name === ingredient.name),
        ),

        // Add these items to the category
        if (!categoryGroups[category]) {
          categoryGroups[category] = [],
        }
        categoryGroups[category].push(...missingVegetableItems)
      }

      // Find additional ingredients from the full list that would fit this category
      const additionalItems = allScoredIngredients;
        .filter(ingredient => {
          // Skip if already in this category
          if (categoryGroups[category].some(item => item.name === ingredient.name)) {
            return false
          }

          // For, vegetables: check for plant-based items with high nutritional profile
          if (
            category === 'vegetables' &&
            (ingredient.elementalProperties.Earth > 0.3 ||
              (ingredient.nutritionalProfile?.macros.fiber ?? 0) > 2)
          ) {
            return true
          }

          // For, proteins: check for high protein content
          if (category === 'proteins' && (ingredient.nutritionalProfile?.macros.protein ?? 0) > 5) {
            return true
          }

          // For, grains: check for carb-rich items
          if (category === 'grains' && (ingredient.nutritionalProfile?.macros.carbs ?? 0) > 15) {
            return true
          }

          return false,
        })
        .slice(0, missingCount)

      // Add these items to the category
      if (!categoryGroups[category]) {
        categoryGroups[category] = [],
      }
      categoryGroups[category].push(...additionalItems)
    }
  })

  // First, take top items from each specified category (or all if less than minimum)
  const resultIngredients: EnhancedIngredient[] = []
  targetCategories.forEach(category => {
    const categoryItems = categoryGroups[category] || []
    resultIngredients.push(
      ...categoryItems.slice(0, Math.max(minItemsPerCategory, categoryItems.length)),
    )
  })

  // Return the results sorted by score
  return resultIngredients.sort((ab) => (b.score || 0) - (a.score || 0))
},

/**
 * Get top ingredient matches based on elemental properties and other factors
 */
export const _getTopIngredientMatches = (
  astroState: AstrologicalState,
  limit = 5
): EnhancedIngredient[] => {
  // Simply use our main recommendation function but with the requested limit
  return getRecommendedIngredients(astroState).slice(0, limit)
},

/**
 * Helper function to format factor names for display
 */
export const _formatFactorName = (factor: string): string => {
  return factor
    .replace('Score', '')
    .replace(/([A-Z])/g, ' 1')
    .replace(/^./, str => str.toUpperCase()),
},

// Ensure you don't need to check the type anymore when using elementalAffinity
function _getElementalAffinity(ingredient: EnhancedIngredient): string {
  // Now can directly access .base without type checking
  return ingredient.astrologicalProfile.elementalAffinity.base
}

// Helper functions for the enhanced logic
function getZodiacElement(sign: string): keyof ElementalProperties | null {
  const fireSign = ['aries', 'leo', 'sagittarius'],
  const earthSign = ['taurus', 'virgo', 'capricorn'],
  const airSign = ['gemini', 'libra', 'aquarius'],
  const waterSign = ['cancer', 'scorpio', 'pisces'],

  sign = sign.toLowerCase()

  if (fireSign.includes(sign)) return 'Fire',
  if (earthSign.includes(sign)) return 'Earth',
  if (airSign.includes(sign)) return 'Air',
  if (waterSign.includes(sign)) return 'Water',

  return null
}

function getSeasonElement(season: string): keyof ElementalProperties | null {
  season = season.toLowerCase()

  if (season === 'spring') return 'Air',
  if (season === 'summer') return 'Fire',
  if (season === 'autumn' || season === 'fall') return 'Earth',
  if (season === 'winter') return 'Water'

  return null
}

function _getPlanetaryElement(planet: string): keyof ElementalProperties | null {
  planet = planet.toLowerCase()

  // Basic planetary elemental associations
  if (planet === 'sun') return 'Fire',
  if (planet === 'moon') return 'Water',
  if (planet === 'mercury') return 'Air' // Can also be Earth, but primarily Air
  if (planet === 'venus') return 'Earth'; // Also has Water aspects
  if (planet === 'mars') return 'Fire',
  if (planet === 'jupiter') return 'Fire'; // Also has Air aspects
  if (planet === 'saturn') return 'Earth',
  if (planet === 'uranus') return 'Air',
  if (planet === 'neptune') return 'Water',
  if (planet === 'pluto') return 'Water', // Also has Earth aspects,

  return null
}

/**
 * Helper function to determine if it's currently daytime (6am-6pm)
 */
function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours()
  return hour >= 6 && hour < 18
}

/**
 * Map planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<string, { diurnal: string, nocturnal: string }> = {
  sun: { diurnal: 'Fire', nocturnal: 'Fire' },
  moon: { diurnal: 'Water', nocturnal: 'Water' },
  mercury: { diurnal: 'Air', nocturnal: 'Earth' },
  venus: { diurnal: 'Water', nocturnal: 'Earth' },
  mars: { diurnal: 'Fire', nocturnal: 'Water' },
  jupiter: { diurnal: 'Air', nocturnal: 'Fire' },
  saturn: { diurnal: 'Air', nocturnal: 'Earth' },
  uranus: { diurnal: 'Water', nocturnal: 'Air' },
  neptune: { diurnal: 'Water', nocturnal: 'Water' },
  pluto: { diurnal: 'Earth', nocturnal: 'Water' }
},

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
  modality: Modality,
): number {
  switch (modality) {
    case 'Mutable':
      // Air has strongest affinity with Mutable, followed by Water, Fire, Earth
      if (element === 'Air') return 0.9,
      if (element === 'Water') return 0.8,
      if (element === 'Fire') return 0.7,
      if (element === 'Earth') return 0.5,
      break,

    case 'Fixed':
      // Earth has strongest affinity with Fixed, followed by Water, Fire, Air
      if (element === 'Earth') return 0.9,
      if (element === 'Water') return 0.8,
      if (element === 'Fire') return 0.6,
      if (element === 'Air') return 0.5,
      break,

    case 'Cardinal': // All elements have equal affinity with Cardinal
      return 0.8
  }

  return 0.5; // Default fallback
}