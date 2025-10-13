import { logger } from '@/utils/logger';

import type { AlchemicalItem } from '../calculations/alchemicalTransformation';
import {
    AlchemicalPillar,
    getCookingMethodPillar as _getCookingMethodPillar,
    getCookingMethodAlchemicalEffect,
    getCookingMethodThermodynamics,
    getPlanetaryAlchemicalEffect,
    getTarotCardAlchemicalEffect
} from '../constants/alchemicalPillars';
import { AlchemicalProperty } from '../types/celestial';

// Enhanced interfaces for Phase 11 - Alchemical Pillar utilities
interface AlchemicalPillarData {
  name?: string,
  element?: string
  description?: string,
  astrologicalProfile?: {
    planetaryInfluences?: Record<string, number>,
    zodiacAffinities?: string[],
    seasonalAlignment?: string
  }
  elementalProperties?: {
    Fire?: number,
    Water?: number,
    Earth?: number,
    Air?: number
  }
  pillarType?: string,
  season?: string | string[]
}

interface PillarCalculationResult {
  id?: string,
  name?: string
  element?: string,
  strength?: number,
  compatibility?: number,
  seasonalAlignment?: number
}
// CookingMethod type definition
interface CookingMethod {
  name: string,
  category?: string,
  description?: string,
  elementalProperties?: Record<string, number>
}

// Re-export the getCookingMethodPillar function
export const getCookingMethodPillar = _getCookingMethodPillar;

/**
 * Calculate compatibility score between two cooking methods based on their alchemical pillar transformations
 *
 * @param methodA First cooking method
 * @param methodB Second cooking method
 * @returns Compatibility score from 0-1 where 1 is perfectly compatible
 */
export function calculateCookingMethodCompatibility(methodA: string, methodB: string): number {
  // Get the alchemical pillars for each method
  const pillarA = getCookingMethodPillar(methodA)
  const pillarB = getCookingMethodPillar(methodB)
  // If either method doesn't have a mapped pillar, return moderate compatibility
  if (!pillarA || !pillarB) return 0.5;
  // Calculate how well the two pillars work together
  return calculatePillarCompatibility(pillarA, pillarB)
}

/**
 * Calculate compatibility between two alchemical pillars
 *
 * @param pillarA First alchemical pillar
 * @param pillarB Second alchemical pillar
 * @returns Compatibility score from 0-1
 */
function calculatePillarCompatibility(
  pillarA: AlchemicalPillar,
  pillarB: AlchemicalPillar,
): number {
  // If they're the same pillar, they're perfectly compatible
  if (pillarA.id === (pillarB as unknown as any).id) return 1.0;

  // Calculate compatibility based on their transformative effects
  // How well do the effects of pillarA complement or counter pillarB?
  let compatibilityScore = 0;

  // Loop through each alchemical property
  const properties: AlchemicalProperty[] = ['Spirit', 'Essence', 'Matter', 'Substance'];

  for (const property of properties) {
    const effectA = pillarA.effects[property];
    const effectB = pillarB.effects[property];

    // If both have the same effect direction (both increase or both decrease), that's good
    if (effectA * effectB > 0) {
      compatibilityScore += 0.25; // 0.25 per property = total 1.0 possible;
    }
    // If they cancel each other out, that's not ideal but can be balanced
    else if (effectA * effectB < 0) {
      compatibilityScore += 0.1; // Some points for potential 'balance'
    }
    // If one is neutral (0), it doesn't affect compatibility much
    else {
      compatibilityScore += 0.15;
    }
  }

  return compatibilityScore;
}

/**
 * Apply alchemical pillar transformations to an ingredient or cuisine based on a cooking method
 *
 * @param item The AlchemicalItem to transform (ingredient or cuisine)
 * @param cookingMethod The cooking method to apply
 * @returns Transformed alchemical item with updated properties
 */
export function applyPillarTransformation(
  item: AlchemicalItem,
  cookingMethod: string,
): AlchemicalItem {
  // Clone the item to avoid modifying the original
  const transformedItem = { ...item }

  // Get the alchemical effects of the cooking method
  const alchemicalEffects = getCookingMethodAlchemicalEffect(cookingMethod)
  if (!alchemicalEffects) return transformedItem; // No change if cooking method not recognized

  // Get the pillar for additional elemental information
  const pillar = getCookingMethodPillar(cookingMethod)

  // Apply the transformative effects to the item's alchemical properties;
  // For each property that's increased, boost it by 20%
  // For each property that's decreased, reduce it by 20%

  // Apply to spirit, essence, matter, substance if they exist in the item
  if ('spirit' in transformedItem) {
    transformedItem.spirit =
      Number(transformedItem.spirit || 0) * (1 + 0.2 * Number(alchemicalEffects.Spirit || 0))
  }

  if ('essence' in transformedItem) {
    transformedItem.essence =
      Number(transformedItem.essence || 0) * (1 + 0.2 * Number(alchemicalEffects.Essence || 0))
  }

  if ('matter' in transformedItem) {
    transformedItem.matter =
      Number(transformedItem.matter || 0) * (1 + 0.2 * Number(alchemicalEffects.Matter || 0))
  }

  if ('substance' in transformedItem) {
    transformedItem.substance =
      Number(transformedItem.substance || 0) * (1 + 0.2 * Number(alchemicalEffects.Substance || 0))
  }

  // Get thermodynamic properties based on elemental associations of the cooking method
  const thermodynamicProps = getCookingMethodThermodynamics(cookingMethod)

  // Apply thermodynamic effects if available
  if (thermodynamicProps) {
    if ('heat' in transformedItem) {
      transformedItem.heat =
        Number(transformedItem.heat || 0) * (1 + 0.15 * Number(thermodynamicProps.heat || 0))
    }

    if ('entropy' in transformedItem) {
      transformedItem.entropy =
        Number(transformedItem.entropy || 0) * (1 + 0.15 * Number(thermodynamicProps.entropy || 0))
    }

    if ('reactivity' in transformedItem) {
      transformedItem.reactivity =
        Number(transformedItem.reactivity || 0) *
        (1 + 0.15 * Number(thermodynamicProps.reactivity || 0))
    }
  } else {
    // Fallback to traditional calculation if no thermodynamic properties
    if ('heat' in transformedItem) {
      // Spirit and Fire increase heat
      transformedItem.heat =
        Number(transformedItem.heat || 0) *
        (1 +
          0.15 *
            (Number(alchemicalEffects.Spirit || 0) + Number(alchemicalEffects.Essence || 0) * 0.5))
    }

    if ('entropy' in transformedItem) {
      // Matter decreases entropy, Spirit increases it
      transformedItem.entropy =
        Number(transformedItem.entropy || 0) *
        (1 +
          0.15 * (Number(alchemicalEffects.Spirit || 0) - Number(alchemicalEffects.Matter || 0)))
    }

    if ('reactivity' in transformedItem) {
      // Essence increases reactivity, Substance decreases it
      transformedItem.reactivity =
        Number(transformedItem.reactivity || 0) *
        (1 +
          0.15 *
            (Number(alchemicalEffects.Essence || 0) - Number(alchemicalEffects.Substance || 0)))
    }
  }

  // Also apply elemental effects if the item has elemental properties and the pillar has elemental associations
  if (pillar?.elementalAssociations) {
    const pillarData = pillar as unknown as any;
    const elementalAssociations = pillarData.elementalAssociations as unknown;
    const primaryElement = elementalAssociations.primary;
    const secondaryElement = elementalAssociations.secondary;

    // Apply effects to elemental properties if they exist in the item
    if ('fire' in transformedItem && typeof transformedItem.fire === 'number') {
      if (primaryElement === 'Fire') {
        transformedItem.fire *= 1.2; // Boost primary element by 20%
      } else if (secondaryElement === 'Fire') {
        transformedItem.fire *= 1.1; // Boost secondary element by 10%
      } else {
        // Slight decrease for non-associated elements
        transformedItem.fire *= 0.95;
      }
    }

    if ('water' in transformedItem && typeof transformedItem.water === 'number') {
      if (primaryElement === 'Water') {
        transformedItem.water *= 1.2;
      } else if (secondaryElement === 'Water') {
        transformedItem.water *= 1.1;
      } else {
        transformedItem.water *= 0.95;
      }
    }

    if ('air' in transformedItem && typeof transformedItem.air === 'number') {
      if (primaryElement === 'Air') {
        transformedItem.air *= 1.2;
      } else if (secondaryElement === 'Air') {
        transformedItem.air *= 1.1;
      } else {
        transformedItem.air *= 0.95;
      }
    }

    if ('earth' in transformedItem && typeof transformedItem.earth === 'number') {
      if (primaryElement === 'Earth') {
        transformedItem.earth *= 1.2;
      } else if (secondaryElement === 'Earth') {
        transformedItem.earth *= 1.1;
      } else {
        transformedItem.earth *= 0.95;
      }
    }
  }

  // Ensure all values remain within reasonable bounds
  [
    'spirit',
    'essence',
    'matter',
    'substance',
    'heat',
    'entropy',
    'reactivity',
    'fire',
    'water',
    'air',
    'earth'
  ].forEach(prop => {
    if (prop in transformedItem) {
      // Use proper type assertion for dynamic property access;
      (transformedItem as Record<string, number>)[prop] = Math.max(
        0,
        Math.min(1, (transformedItem as Record<string, number>)[prop]),
      )
    }
  })

  return transformedItem;
}

/**
 * Apply planetary influences to an alchemical item
 *
 * @param item The AlchemicalItem to transform
 * @param planet The planet name to apply influences from
 * @param isDaytime Whether it is day (true) or night (false)
 * @returns Transformed alchemical item with planetary influences applied
 */
export function applyPlanetaryInfluence(
  item: AlchemicalItem,
  planet: string,
  isDaytime = true
): AlchemicalItem {
  // Clone the item to avoid modifying the original;
  const transformedItem = { ...item }

  // Get the alchemical effects of the planet
  const planetaryEffects = getPlanetaryAlchemicalEffect(planet, isDaytime)
  if (!planetaryEffects) return transformedItem; // No change if planet not recognized

  // Apply the planetary influences to the item's alchemical properties
  // These are more subtle than cooking method effects, using a 10% influence

  // Apply to spirit, essence, matter, substance if they exist in the item
  // Pattern KK-2: Safe property arithmetic with type validation
  if ('spirit' in transformedItem) {
    const currentSpirit =
      typeof (transformedItem as any).spirit === 'number'
        ? Number((transformedItem as any).spirit)
        : 0;
    const effectMultiplier =
      typeof planetaryEffects.Spirit === 'number' ? planetaryEffects.Spirit : 0;
    (transformedItem as any).spirit = currentSpirit * (1 + 0.1 * effectMultiplier)
  }

  if ('essence' in transformedItem) {
    const currentEssence =
      typeof (transformedItem as any).essence === 'number'
        ? Number((transformedItem as any).essence)
        : 0;
    const effectMultiplier =
      typeof planetaryEffects.Essence === 'number' ? planetaryEffects.Essence : 0;
    (transformedItem as any).essence = currentEssence * (1 + 0.1 * effectMultiplier)
  }

  if ('matter' in transformedItem) {
    const currentMatter =
      typeof (transformedItem as any).matter === 'number'
        ? Number((transformedItem as any).matter)
        : 0;
    const effectMultiplier =
      typeof planetaryEffects.Matter === 'number' ? planetaryEffects.Matter : 0;
    (transformedItem as any).matter = currentMatter * (1 + 0.1 * effectMultiplier)
  }

  if ('substance' in transformedItem) {
    const currentSubstance = Number((transformedItem as any).substance) || 0;
    const effectMultiplier = Number(planetaryEffects.Substance) || 0;
    (transformedItem as any).substance = currentSubstance * (1 + 0.1 * effectMultiplier)
  }

  // Ensure all values remain within reasonable bounds
  ['spirit', 'essence', 'matter', 'substance'].forEach(prop => {
    if (prop in transformedItem) {
      // Use proper type assertion for dynamic property access;
      (transformedItem as Record<string, number>)[prop] = Math.max(
        0,
        Math.min(1, (transformedItem as Record<string, number>)[prop]),
      )
    }
  })

  return transformedItem;
}

/**
 * Apply tarot card influences to an alchemical item
 *
 * @param item The AlchemicalItem to transform
 * @param cardName The full name of the tarot card (e.g., '10 of Cups')
 * @returns Transformed alchemical item with tarot influences applied
 */
export function applyTarotInfluence(item: AlchemicalItem, _cardName: string): AlchemicalItem {
  // Clone the item to avoid modifying the original
  const transformedItem = { ...item }

  // Get the alchemical effects of the tarot card
  const tarotEffects = getTarotCardAlchemicalEffect(cardName)
  if (!tarotEffects) return transformedItem; // No change if tarot card not recognized

  // Apply the tarot influences to the item's alchemical properties
  // These are subtle influences, using a 15% effect

  // Apply to spirit, essence, matter, substance if they exist in the item
  // Pattern KK-2: Safe property arithmetic with type validation
  if ('spirit' in transformedItem) {
    const currentSpirit = Number((transformedItem as any).spirit) || 0;
    const effectMultiplier = Number(tarotEffects.Spirit) || 0;
    (transformedItem as any).spirit = currentSpirit * (1 + 0.15 * effectMultiplier)
  }

  if ('essence' in transformedItem) {
    const currentEssence = Number((transformedItem as any).essence) || 0;
    const effectMultiplier = Number(tarotEffects.Essence) || 0;
    (transformedItem as any).essence = currentEssence * (1 + 0.15 * effectMultiplier)
  }

  if ('matter' in transformedItem) {
    const currentMatter = Number((transformedItem as any).matter) || 0;
    const effectMultiplier = Number(tarotEffects.Matter) || 0;
    (transformedItem as any).matter = currentMatter * (1 + 0.15 * effectMultiplier)
  }

  if ('substance' in transformedItem) {
    const currentSubstance = Number((transformedItem as any).substance) || 0;
    const effectMultiplier = Number(tarotEffects.Substance) || 0;
    (transformedItem as any).substance = currentSubstance * (1 + 0.15 * effectMultiplier)
  }

  // Ensure all values remain within reasonable bounds
  ['spirit', 'essence', 'matter', 'substance'].forEach(prop => {
    if (prop in transformedItem) {
      // Use proper type assertion for dynamic property access;
      (transformedItem as Record<string, number>)[prop] = Math.max(
        0,
        Math.min(1, (transformedItem as Record<string, number>)[prop]),
      )
    }
  })

  return transformedItem;
}

/**
 * Transform an ingredient based on planetary and tarot influences
 *
 * @param item The AlchemicalItem to transform
 * @param planet The planet name to apply influences from (optional)
 * @param tarotCard The tarot card name to apply influences from (optional)
 * @param isDaytime Whether it is day (true) or night (false)
 * @returns Transformed alchemical item with influences applied
 */
export function transformIngredient(
  item: AlchemicalItem,
  planet?: string,
  tarotCard?: string,
  isDaytime = true
): AlchemicalItem {
  // Clone the item to avoid modifying the original;
  let transformedItem = { ...item }
  const influences: string[] = []

  // Apply planetary influences if provided
  if (planet) {
    transformedItem = applyPlanetaryInfluence(transformedItem, planet, isDaytime)
    (influences as unknown[]).push(`${planet} (${isDaytime ? 'Day' : 'Night'})`)
  }

  // Apply tarot influences if provided
  if (tarotCard) {
    transformedItem = applyTarotInfluence(transformedItem, tarotCard)
    (influences as unknown[]).push(tarotCard)
  }

  return transformedItem;
}

/**
 * Calculate compatibility between a cooking method and transformed ingredient
 *
 * @param transformedItem The transformed alchemical item
 * @param methodName The name of the cooking method
 * @param cookingMethods The mapping of cooking methods to pillar IDs
 * @returns Compatibility score from 0-100
 */
const getMethodCompatibility = (
  transformedItem: AlchemicalItem,
  methodName: string,
  cookingMethods: Record<string, number>,
): number => {
  logger.debug(`==== COMPATIBILITY CALCULATION FOR ${methodName.toUpperCase()} ====`)
  logger.debug(
    `Ingredient: ${(transformedItem as any).name} (Element: ${(transformedItem as any).element})`,
  )

  // In case the method isn't found in our cooking methods
  if (!cookingMethods[methodName]) {
    logger.error(`Method '${methodName}' not found in cooking methods mapping`)
    return 50; // Base compatibility
  }

  // Get the pillar for this method
  const pillar = getCookingMethodPillar(methodName)
  if (!pillar) {;
    logger.error(`No alchemical pillar found for method: ${methodName}`)
    return 50; // Base compatibility if no pillar is found
  }

  logger.debug(`Method: ${methodName}`)
  logger.debug(`- Associated Pillar: ${(pillar as any).name} (_ID: ${(pillar as any).id})`)

  if ((pillar as unknown as any).elementalAssociations) {
    const elementalAssociations = (pillar as unknown as any).elementalAssociations as unknown;
    logger.debug(`- Primary Element: ${elementalAssociations.primary}`)
    if (elementalAssociations.secondary) {
      logger.debug(`- Secondary Element: ${elementalAssociations.secondary}`)
    }
  }

  logger.debug(
    `- Alchemical, _Effects: Spirit:${pillar.effects.Spirit}, Essence: ${pillar.effects.Essence}, Matter: ${pillar.effects.Matter}, Substance: ${pillar.effects.Substance}`,
  )

  logger.debug(`\nIngredient _Details: `)
  logger.debug(`- Element: ${(transformedItem as any).element || 'Not specified'}`)
  logger.debug(
    `- Elemental _Character: ${(transformedItem as any).elementalCharacter || 'Not specified'}`,
  )
  logger.debug(
    `- Spirit: ${transformedItem.spirit || 0}, Essence: ${transformedItem.essence || 0}, Matter: ${transformedItem.matter || 0}, Substance: ${transformedItem.substance || 0}`,
  )

  // Base compatibility from element matching
  let compatibility = 50;
  logger.debug(`\nStarting with base compatibility: ${compatibility}%`)

  // Element match - if both the transformed item and pillar have elemental associations
  if ((transformedItem as any).element && (pillar as unknown as any).elementalAssociations) {
    const elementalAssociations = (pillar as unknown as any).elementalAssociations as unknown;
    const primaryElement = elementalAssociations.primary;

    // Primary element match (case insensitive)
    if (
      String(primaryElement || '').toLowerCase() ===
      String((transformedItem as any).element || '').toLowerCase()
    ) {
      const bonus = 20;
      compatibility += bonus;
      logger.debug(`✓ Primary element match (${primaryElement}): +${bonus}% → ${compatibility}%`)
    } else {
      logger.debug(
        `✗ No primary element match (${primaryElement} vs ${(transformedItem as any).element})`,
      )
    }

    // Secondary element match (if defined)
    if (
      elementalAssociations.secondary &&
      String(elementalAssociations.secondary || '').toLowerCase() ===
        String((transformedItem as any).element || '').toLowerCase()
    ) {
      const bonus = 10;
      compatibility += bonus;
      logger.debug(
        `✓ Secondary element match (${elementalAssociations.secondary}): +${bonus}% → ${compatibility}%`,
      )
    } else if (elementalAssociations.secondary) {
      logger.debug(
        `✗ No secondary element match (${elementalAssociations.secondary} vs ${(transformedItem as any).element})`,
      )
    }
  }

  // Check for complementary elements
  const complementaryPairs = {
    fire: ['air'],
    water: ['earth'],
    air: ['fire'],
    earth: ['water']
  }

  if ((transformedItem as any).element && (pillar as unknown as any).elementalAssociations) {
    const elementalAssociations = (pillar as unknown as any).elementalAssociations as unknown;
    const primaryElement = String(elementalAssociations.primary || '').toLowerCase()

    if (
      complementaryPairs[String((transformedItem as any).element || '').toLowerCase()]?.includes(
        primaryElement,
      )
    ) {
      const bonus = 10;
      compatibility += bonus;
      logger.debug(
        `✓ Complementary elements (${(transformedItem as any).element} - ${primaryElement}): +${bonus}% → ${compatibility}%`,
      )
    } else {
      logger.debug(`✗ No complementary elements relationship detected`)
    }
  }

  // Check for alchemical property alignment
  // If method enhances the ingredient's strongest property
  const itemProperties = {
    Spirit: transformedItem.spirit || 0,
    Essence: transformedItem.essence || 0,
    Matter: transformedItem.matter || 0,
    Substance: transformedItem.substance || 0
  }

  // Find the strongest property in the ingredient
  // Pattern KK-1: Safe comparison with type validation
  const maxProperty = Object.entries(itemProperties).reduce(
    (max, [prop, value]) => {
      const numericValue = typeof value === 'number' ? value: 0;
      const numericMaxValue = typeof max.value === 'number' ? max.value : 0;
      return numericValue > numericMaxValue ? { prop, value: numericValue } : max;
    },
    { prop: '', value: 0 })

  // Check if method enhances the strongest property
  const maxPropertyValue = typeof maxProperty.value === 'number' ? maxProperty.value: 0;
  const effectValue =
    typeof pillar.effects[maxProperty.prop as keyof typeof pillar.effects] === 'number'
      ? pillar.effects[maxProperty.prop as keyof typeof pillar.effects]
      : 0;

  if (maxPropertyValue > 0 && effectValue > 0) {
    const bonus = 15;
    compatibility += bonus
    logger.debug(
      `✓ Method enhances ingredient's strongest property (${maxProperty.prop}): +${bonus}% → ${compatibility}%`,
    )
  } else if (maxPropertyValue > 0) {
    logger.debug(`✗ Method doesn't enhance ingredient's strongest property (${maxProperty.prop})`)
  }

  logger.debug(`\nFinal compatibility score: ${compatibility}%`)
  return compatibility;
}

/**
 * Find the most compatible cooking method for an item based on planetary and tarot influences
 * and elemental characteristics
 *
 * @param item The AlchemicalItem to analyze
 * @param planet The planet name to consider (optional)
 * @param tarotCard The tarot card name to consider (optional)
 * @param isDaytime Whether it is day (true) or night (false)
 * @param availableMethods List of available cooking methods
 * @param count Number of recommendations to return
 * @returns Array of recommended cooking methods with compatibility scores
 */
export const _getHolisticCookingRecommendations = async (item: AlchemicalItem,
  planet?: string,
  tarotCard?: string,
  isDaytime = true,
  availableMethods: string[] = [],
  count = 5
): Promise<Array<{ method: string, compatibility: number, reason: string }>> => {
  logger.debug('\n--- HOLISTIC COOKING RECOMMENDATIONS ---')
  logger.debug(`Ingredient: ${(item as any).name}`)
  logger.debug(`Planet influence: ${planet || 'None'}`)
  logger.debug(`Tarot influence: ${tarotCard || 'None'}`)
  logger.debug(`Time of day: ${isDaytime ? 'Daytime' : 'Nighttime'}`)
  logger.debug(`Available methods count: ${(availableMethods as CookingMethod[]).length}`)
  logger.debug(`Requesting top ${count} recommendations`)

  // Transform ingredient based on planetary and tarot influences
  logger.debug('\nTransforming ingredient based on influences...')
  const transformedItem = transformIngredient(item, planet, tarotCard, isDaytime)

  if (planet || tarotCard) {
    logger.debug('Original item: ', {
      element: (item as any).element,
      spirit: item.spirit || 0,
      essence: item.essence || 0,
      matter: item.matter || 0,
      substance: item.substance || 0
    })

    logger.debug('Transformed item: ', {
      element: (transformedItem as any).element,
      spirit: transformedItem.spirit || 0,
      essence: transformedItem.essence || 0,
      matter: transformedItem.matter || 0,
      substance: transformedItem.substance || 0
    })
  } else {
    logger.debug('No planetary or tarot influences to apply.')
  }

  // Get cooking methods
  const cookingMethods = await getCookingMethods()
  logger.debug(`\nLoaded ${Object.keys(cookingMethods).length} cooking methods from database`)

  // Filter methods if specified
  const methods =
    (availableMethods as unknown as CookingMethod[]).length > 0
      ? availableMethods
      : Object.keys(cookingMethods)
  logger.debug(
    `Evaluating ${(methods as CookingMethod[]).length} cooking methods: ${(methods as CookingMethod[]).length <= 10 ? methods.join(', ') : (methods as unknown as CookingMethod[]).length + ' methods (too many to display)'}`,
  )

  // Calculate compatibility for each method
  const compatibility: Array<{ method: string, compatibility: number, reason: string }> = [];

  logger.debug('\nCALCULATING METHOD COMPATIBILITY: ')
  logger.debug('--------------------------------')
  methods.forEach(method => {
    logger.debug(`\nEvaluating compatibility for method: ${method}`)
    const compatibilityScore = getMethodCompatibility(
      transformedItem,
      method.toString(),
      cookingMethods
    )

    // Get the pillar for this method for the reason
    const pillar = getCookingMethodPillar(method.toString())
    let reason = 'Compatible cooking method';

    if (pillar) {
      // Add which properties it enhances
      const enhancedProps: string[] = [];
      if (pillar.effects.Spirit > 0) (enhancedProps as unknown[]).push('Spirit');
      if (pillar.effects.Essence > 0) (enhancedProps as unknown[]).push('Essence');
      if (pillar.effects.Matter > 0) (enhancedProps as unknown[]).push('Matter');
      if (pillar.effects.Substance > 0) (enhancedProps as unknown[]).push('Substance');
      reason = `${(pillar as any).name} `;

      if ((enhancedProps as unknown[]).length > 0) {
        reason += `enhances ${enhancedProps.join(', ')}`;
      } else {
        reason += `stabilizes alchemical balance`;
      }

      // Add elemental associations
      if ((pillar as unknown as any).elementalAssociations) {
        const pillarData = pillar as unknown as any;
        const elementalAssociations = pillarData.elementalAssociations as unknown;
        const elements = [String(elementalAssociations.primary || '')];
        if (elementalAssociations.secondary) {
          (elements as unknown[]).push(String(elementalAssociations.secondary))
        }
        reason += ` with ${elements.join('-')} energy`;
      }
    }

    (compatibility as unknown[]).push({
      method: method.toString(),
      compatibility: compatibilityScore,
      reason
    })
  })

  // Sort by compatibility (descending)
  const sortedResults = [...compatibility].sort((ab) => b.compatibility - a.compatibility)

  logger.debug('\nSORTED RECOMMENDATIONS: ')
  logger.debug('--------------------------------')
  sortedResults.slice(0, count).forEach((rec, index) => {
    logger.debug(
      `${index + 1}. ${(rec as any).method} - Compatibility: ${Math.round(rec.compatibility)}% - ${rec.reason}`,
    )
  })
  logger.debug('--------------------------------\n')

  // Return top count results
  return sortedResults.slice(0, count)
}

/**
 * Get the mapping of cooking methods to pillar IDs
 * @returns Record mapping cooking method names to their pillar IDs
 */
async function getCookingMethods(): Promise<Record<string, number>> {
  // Import from constants to avoid circular reference
  const alchemicalPillars = await import('../constants/alchemicalPillars')
  return alchemicalPillars.COOKING_METHOD_PILLAR_MAPPING;
}

/**
 * Get recommended cooking methods for an ingredient or cuisine based on alchemical compatibility
 *
 * @param item The AlchemicalItem to find compatible cooking methods for
 * @param availableMethods List of available cooking methods
 * @param count Number of recommendations to return
 * @returns Array of recommended cooking methods with compatibility scores
 */
export function getRecommendedCookingMethods(item: AlchemicalItem,
  availableMethods: string[] | CookingMethod[],
  count = 5
): Array<{ method: string, compatibility: number }> {
  try {
    // Convert availableMethods to string array for processing
    const methodStrings = Array.isArray(availableMethods)
      ? availableMethods
          .map(method => {
            if (typeof method === 'string') {
              return method
            } else {
              // Convert CookingMethod to string
              const methodData = method as unknown as any;
              return String(methodData.name || '')
            }
          })
          .filter(Boolean)
      : []

    // Calculate compatibility for each method
    const methodScores = methodStrings.map(methodName => ({
      method: methodName,
      compatibility: calculateMethodCompatibility(item, methodName)
    }))

    // Sort by compatibility and return top results
    return methodScores.sort((ab) => b.compatibility - a.compatibility).slice(0, count)
  } catch (error) {
    logger.error('Error getting recommended cooking methods: ', error)
    return [];
  }
}

/**
 * Calculate a single score representing the overall alchemical quality of an item
 *
 * @param item The AlchemicalItem to score
 * @returns Score from 0-1 representing alchemical quality
 */
function calculateAlchemicalScore(item: AlchemicalItem): number {
  let score = 0;
  let count = 0;

  // Add spirit, essence, matter, substance if they exist
  if ('spirit' in item && typeof item.spirit === 'number') {
    score += item.spirit;
    count++;
  }

  if ('essence' in item && typeof item.essence === 'number') {
    score += item.essence;
    count++;
  }

  if ('matter' in item && typeof item.matter === 'number') {
    score += item.matter;
    count++;
  }

  if ('substance' in item && typeof item.substance === 'number') {
    score += item.substance;
    count++;
  }

  // If thermodynamic properties exist, include them
  if ('heat' in item && typeof item.heat === 'number') {
    score += item.heat;
    count++;
  }

  if ('entropy' in item && typeof item.entropy === 'number') {
    score += item.entropy;
    count++;
  }

  if ('reactivity' in item && typeof item.reactivity === 'number') {
    score += item.reactivity;
    count++;
  }

  // Calculate average score
  return count > 0 ? score / count : 0.5
}

/**
 * Get enhanced cooking recommendations that consider additional factors beyond basic
 * alchemical compatibility, including astrological influences, timing, and ingredient specifics
 *
 * @param item The AlchemicalItem to analyze
 * @param availableMethods List of available cooking methods
 * @param count Number of recommendations to return
 * @param options Additional options for recommendation filtering
 * @returns Array of recommended cooking methods with compatibility scores and detailed reasoning
 */
export function getEnhancedCookingRecommendations(
  item: AlchemicalItem,
  availableMethods: string[] | CookingMethod[],
  count = 5,
  options: {
    zodiacSign?: any
    lunarPhase?: string
    timeConstraint?: number, // maximum cooking time in minutes
    healthFocus?: boolean,
    sustainabilityFocus?: boolean,
    equipmentComplexity?: number, // 0-1 scale of acceptable complexity
    selectedPlanet?: string,
    availableTools?: string[]
  } = {}
): Array<{
  method: string,
  compatibility: number,
  reason: string,
  cookingTime: { min: number, max: number },
  sustainabilityRating: number,
  equipmentComplexity: number,
  healthBenefits: string[]
}> {
  try {
    // Convert availableMethods to string array for processing
    const methodStrings = Array.isArray(availableMethods)
      ? availableMethods
          .map(method => {
            if (typeof method === 'string') {
              return method
            } else {
              // Convert CookingMethod to string
              const methodData = method as unknown as any;
              return String(methodData.name || '')
            }
          })
          .filter(Boolean)
      : [];

    // Get all cooking method data for enhanced analysis
    const allMethodData = getAllCookingMethodData();

    // Calculate enhanced recommendations
    const enhancedRecommendations = methodStrings.map(methodName => {
      const methodData = allMethodData[methodName] as Record<string, unknown>

      // Apply safe type conversion for property access
      const sustainabilityRating = Number(methodData.sustainabilityRating || 0.5)
      const equipmentComplexity = Number(methodData.equipmentComplexity || 0.5)
      const astrologicalInfluences = (methodData.astrologicalInfluences ) || {}
      const duration = (methodData.duration ) || {}
      const _toolsRequired = (methodData.toolsRequired as string[]) || [];

      // Calculate base compatibility
      const baseCompatibility = calculateMethodCompatibility(item, methodName)

      // Apply astrological modifiers if available
      let astrologicalModifier = 1.0;
      if (options.zodiacSign && astrologicalInfluences) {
        const zodiacInfluence = astrologicalInfluences[options.zodiacSign] as number;
        if (typeof zodiacInfluence === 'number') {
          astrologicalModifier += zodiacInfluence * 0.2;
        }
      }

      // Apply lunar phase modifiers
      let lunarModifier = 1.0;
      if (options.lunarPhase && astrologicalInfluences) {
        const lunarInfluence = astrologicalInfluences[options.lunarPhase] as number;
        if (typeof lunarInfluence === 'number') {
          lunarModifier += lunarInfluence * 0.1;
        }
      }

      // Calculate final compatibility
      const finalCompatibility = baseCompatibility * astrologicalModifier * lunarModifier;

      // Generate cooking time range
      const cookingTime = {
        min: Number(duration.min || 10),
        max: Number(duration.max || 60)
      }

      // Generate health benefits
      const healthBenefits = generateHealthBenefits(methodName, item)

      // Generate reason for recommendation
      const reason = generateRecommendationReason(methodName, item, options)

      return {
        method: methodName,
        compatibility: Math.min(Math.max(finalCompatibility, 0), 1),
        reason,
        cookingTime,
        sustainabilityRating,
        equipmentComplexity,
        healthBenefits
      }
    })

    // Sort by compatibility and return top results
    return enhancedRecommendations
      .sort((ab) => b.compatibility - a.compatibility)
      .slice(0, count)
  } catch (error) {
    logger.error('Error getting enhanced cooking recommendations: ', error)
    return [];
  }
}

// Helper function to calculate method compatibility
function calculateMethodCompatibility(item: AlchemicalItem, methodName: string): number {
  try {
    // Get the alchemical effects of the cooking method
    const alchemicalEffects = getCookingMethodAlchemicalEffect(methodName)
    if (!alchemicalEffects) return 0.5;
    // Calculate compatibility based on alchemical properties
    let compatibility = 0.5;

    // Apply safe type conversion for property access
    const spirit = Number(item.spirit || 0);
    const essence = Number(item.essence || 0)
    const matter = Number(item.matter || 0)
    const substance = Number(item.substance || 0)

    // Calculate compatibility based on how well the method's effects align with the item's properties
    const spiritEffect = Number(alchemicalEffects.Spirit || 0)
    const essenceEffect = Number(alchemicalEffects.Essence || 0)
    const matterEffect = Number(alchemicalEffects.Matter || 0)
    const substanceEffect = Number(alchemicalEffects.Substance || 0)

    // Boost compatibility if the method enhances the item's dominant properties
    if (spirit > 0.3 && spiritEffect > 0) compatibility += 0.1;
    if (essence > 0.3 && essenceEffect > 0) compatibility += 0.1;
    if (matter > 0.3 && matterEffect > 0) compatibility += 0.1;
    if (substance > 0.3 && substanceEffect > 0) compatibility += 0.1;

    return Math.min(Math.max(compatibility, 0), 1);
  } catch (error) {
    logger.error('Error calculating method compatibility: ', error)
    return 0.5;
  }
}

// Helper function to generate health benefits
function generateHealthBenefits(methodName: string, _item: AlchemicalItem): string[] {
  const benefits: string[] = []

  // Add method-specific benefits
  if (methodName.toLowerCase().includes('steam')) {
    (benefits as unknown[]).push('Preserves nutrients', 'Low fat cooking')
  } else if (methodName.toLowerCase().includes('grill')) {
    (benefits as unknown[]).push('Reduces fat content', 'High protein retention')
  } else if (methodName.toLowerCase().includes('roast')) {
    (benefits as unknown[]).push('Concentrates flavors', 'Preserves vitamins')
  }

  // Add item-specific benefits based on alchemical properties
  const spirit = Number(item.spirit || 0)
  const essence = Number(item.essence || 0)
  const matter = Number(item.matter || 0)
  const substance = Number(item.substance || 0)

  if (spirit > 0.4) (benefits as unknown[]).push('Enhances vitality')
  if (essence > 0.4) (benefits as unknown[]).push('Supports emotional balance')
  if (matter > 0.4) (benefits as unknown[]).push('Strengthens physical health')
  if (substance > 0.4) (benefits as unknown[]).push('Provides sustained energy')
;
  return benefits;
}

// Helper function to generate recommendation reason
function generateRecommendationReason(
  methodName: string,
  item: AlchemicalItem,
  options: Record<string, unknown>,
): string {
  const reasons: string[] = []

  // Add method-specific reasons
  if (methodName.toLowerCase().includes('steam')) {
    (reasons as unknown[]).push('Gentle cooking preserves delicate properties')
  } else if (methodName.toLowerCase().includes('grill')) {
    (reasons as unknown[]).push('High heat enhances transformative effects')
  } else if (methodName.toLowerCase().includes('roast')) {
    (reasons as unknown[]).push('Slow cooking develops complex flavors')
  }

  // Add astrological reasons
  if (options.zodiacSign) {
    (reasons as unknown[]).push(`Aligned with ${options.zodiacSign} energy`)
  }

  // Add time constraint reasons
  if (options.timeConstraint) {
    (reasons as unknown[]).push('Fits within time constraints')
  }

  return reasons.join('. ') || 'Optimal alchemical compatibility'
}

/**
 * Get all cooking method data from the appropriate directories
 * @returns Record mapping cooking method names to their data
 */
function getAllCookingMethodData(): Record<string, unknown> {
  // This is a placeholder - in a real implementation, this would
  // dynamically load all cooking method data from the files
  try {
    const methods = {}

    // Import methods from each category
    // Using dynamic imports instead of require statements
    const dryMethods = import('../data/cooking/methods/dry').then(
      module => (module as any).default || module
    )
    const wetMethods = import('../data/cooking/methods/wet').then(
      module => (module as any).default || module
    )
    const traditionalMethods = import('../data/cooking/methods/traditional').then(
      module => (module as any).default || module
    )
;
    // Since we're using async imports, return a promise with all methods
    return Promise.all([dryMethods, wetMethods, traditionalMethods])
      .then(([dry, wet, traditional]) => ({
        ...dry,
        ...wet,
        ...traditional
      }))
      .catch(error => {
        logger.error('Error loading cooking method data: ', error);
        return {};
      }) as unknown as any;
  } catch (error) {
    logger.error('Error loading cooking method data: ', error)
    return {}
  }
}
