import { type ZodiacSign } from "@/types/alchemy";

// Enhanced interfaces for Phase 11 - Alchemical Pillar utilities
interface AlchemicalPillarData {
  name?: string;
  element?: string;
  description?: string;
  astrologicalProfile?: {
    planetaryInfluences?: Record<string, number>;
    zodiacAffinities?: string[];
    seasonalAlignment?: string;
  };
  elementalProperties?: {
    Fire?: number;
    Water?: number;
    Earth?: number;
    Air?: number;
  };
  pillarType?: string;
  season?: string | string[];
}

interface PillarCalculationResult {
  id?: string;
  name?: string;
  element?: string;
  strength?: number;
  compatibility?: number;
  seasonalAlignment?: number;
}
import { AlchemicalProperty } from '../types/celestial';
// CookingMethod type definition
interface CookingMethod {
  name: string;
  category?: string;
  description?: string;
  elementalProperties?: Record<string, number>;
}
import { 
  getCookingMethodAlchemicalEffect, 
  getCookingMethodPillar as _getCookingMethodPillar,
  getCookingMethodThermodynamics,
  ALCHEMICAL_PILLARS,
  AlchemicalPillar,
  getPlanetaryAlchemicalEffect,
  getTarotCardAlchemicalEffect,
  ALCHEMICAL_PROPERTY_ELEMENTS
} from '../constants/alchemicalPillars';
import type { AlchemicalItem } from '../calculations/alchemicalTransformation';

// Re-export the getCookingMethodPillar function
export const getCookingMethodPillar = _getCookingMethodPillar;

/**
 * Calculate compatibility score between two cooking methods based on their alchemical pillar transformations
 * 
 * @param methodA First cooking method
 * @param methodB Second cooking method
 * @returns Compatibility score from 0-1 where 1 is perfectly compatible
 */
export function calculateCookingMethodCompatibility(
  methodA: string,
  methodB: string
): number {
  // Get the alchemical pillars for each method
  const pillarA = getCookingMethodPillar(methodA);
  const pillarB = getCookingMethodPillar(methodB);
  
  // If either method doesn't have a mapped pillar, return moderate compatibility
  if (!pillarA || !pillarB) return 0.5;
  
  // Calculate how well the two pillars work together
  return calculatePillarCompatibility(pillarA, pillarB);
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
  pillarB: AlchemicalPillar
): number {
  // If they're the same pillar, they're perfectly compatible
  if (pillarA.id === (pillarB as unknown)?.id) return 1.0;
  
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
      compatibilityScore += 0.25; // 0.25 per property = total 1.0 possible
    }
    // If they cancel each other out, that's not ideal but can be balanced
    else if (effectA * effectB < 0) {
      compatibilityScore += 0.1; // Some points for potential "balance"
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
  cookingMethod: string
): AlchemicalItem {
  // Clone the item to avoid modifying the original
  const transformedItem = { ...item };
  
  // Get the alchemical effects of the cooking method
  const alchemicalEffects = getCookingMethodAlchemicalEffect(cookingMethod);
  if (!alchemicalEffects) return transformedItem; // No change if cooking method not recognized
  
  // Get the pillar for additional elemental information
  const pillar = getCookingMethodPillar(cookingMethod);
  
  // Apply the transformative effects to the item's alchemical properties
  // For each property that's increased, boost it by 20%
  // For each property that's decreased, reduce it by 20%
  
  // Apply to spirit, essence, matter, substance if they exist in the item
  if ('spirit' in transformedItem) {
    transformedItem.spirit = Number(transformedItem.spirit || 0) * (1 + 0.2 * Number(alchemicalEffects.Spirit || 0));
  }
  
  if ('essence' in transformedItem) {
    transformedItem.essence = Number(transformedItem.essence || 0) * (1 + 0.2 * Number(alchemicalEffects.Essence || 0));
  }
  
  if ('matter' in transformedItem) {
    transformedItem.matter = Number(transformedItem.matter || 0) * (1 + 0.2 * Number(alchemicalEffects.Matter || 0));
  }
  
  if ('substance' in transformedItem) {
    transformedItem.substance = Number(transformedItem.substance || 0) * (1 + 0.2 * Number(alchemicalEffects.Substance || 0));
  }
  
  // Get thermodynamic properties based on elemental associations of the cooking method
  const thermodynamicProps = getCookingMethodThermodynamics(cookingMethod);
  
  // Apply thermodynamic effects if available
  if (thermodynamicProps) {
    if ('heat' in transformedItem) {
      transformedItem.heat = Number(transformedItem.heat || 0) * (1 + 0.15 * Number(thermodynamicProps.heat || 0));
    }
    
    if ('entropy' in transformedItem) {
      transformedItem.entropy = Number(transformedItem.entropy || 0) * (1 + 0.15 * Number(thermodynamicProps.entropy || 0));
    }
    
    if ('reactivity' in transformedItem) {
      transformedItem.reactivity = Number(transformedItem.reactivity || 0) * (1 + 0.15 * Number(thermodynamicProps.reactivity || 0));
    }
  } else {
    // Fallback to traditional calculation if no thermodynamic properties
    if ('heat' in transformedItem) {
      // Spirit and Fire increase heat
      transformedItem.heat = Number(transformedItem.heat || 0) * 
        (1 + 0.15 * (Number(alchemicalEffects.Spirit || 0) + (Number(alchemicalEffects.Essence || 0) * 0.5)));
    }
    
    if ('entropy' in transformedItem) {
      // Matter decreases entropy, Spirit increases it
      transformedItem.entropy = Number(transformedItem.entropy || 0) * 
        (1 + 0.15 * (Number(alchemicalEffects.Spirit || 0) - Number(alchemicalEffects.Matter || 0)));
    }
    
    if ('reactivity' in transformedItem) {
      // Essence increases reactivity, Substance decreases it
      transformedItem.reactivity = Number(transformedItem.reactivity || 0) * 
        (1 + 0.15 * (Number(alchemicalEffects.Essence || 0) - Number(alchemicalEffects.Substance || 0)));
    }
  }
  
  // Also apply elemental effects if the item has elemental properties and the pillar has elemental associations
  if (pillar?.elementalAssociations) {
    const _primaryElement = (pillar as unknown)?.elementalAssociations.primary;
    const secondaryElement = (pillar as unknown)?.elementalAssociations.secondary;
    
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
  ['spirit', 'essence', 'matter', 'substance', 'heat', 'entropy', 'reactivity', 'fire', 'water', 'air', 'earth'].forEach(prop => {
    if (prop in transformedItem) {
      // Use proper type assertion for dynamic property access
      (transformedItem as Record<string, number>)[prop] = Math.max(0, Math.min(1, (transformedItem as Record<string, number>)[prop]));
    }
  });
  
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
  _isDaytime = true
): AlchemicalItem {
  // Clone the item to avoid modifying the original
  const transformedItem = { ...item };
  
  // Get the alchemical effects of the planet
  const planetaryEffects = getPlanetaryAlchemicalEffect(planet, isDaytime);
  if (!planetaryEffects) return transformedItem; // No change if planet not recognized
  
  // Apply the planetary influences to the item's alchemical properties
  // These are more subtle than cooking method effects, using a 10% influence
  
  // Apply to spirit, essence, matter, substance if they exist in the item
  // Pattern KK-2: Safe property arithmetic with type validation
  if ('spirit' in transformedItem) {
    const currentSpirit = typeof (transformedItem as unknown).spirit === 'number' ? (transformedItem as unknown).spirit : 0;
    const effectMultiplier = typeof planetaryEffects.Spirit === 'number' ? planetaryEffects.Spirit : 0;
    (transformedItem as unknown).spirit = currentSpirit * (1 + 0.1 * effectMultiplier);
  }
  
  if ('essence' in transformedItem) {
    const currentEssence = typeof (transformedItem as unknown).essence === 'number' ? (transformedItem as unknown).essence : 0;
    const effectMultiplier = typeof planetaryEffects.Essence === 'number' ? planetaryEffects.Essence : 0;
    (transformedItem as unknown).essence = currentEssence * (1 + 0.1 * effectMultiplier);
  }
  
  if ('matter' in transformedItem) {
    const currentMatter = typeof (transformedItem as unknown).matter === 'number' ? (transformedItem as unknown).matter : 0;
    const effectMultiplier = typeof planetaryEffects.Matter === 'number' ? planetaryEffects.Matter : 0;
    (transformedItem as unknown).matter = currentMatter * (1 + 0.1 * effectMultiplier);
  }
  
  if ('substance' in transformedItem) {
    const currentSubstance = typeof (transformedItem as unknown).substance === 'number' ? (transformedItem as unknown).substance : 0;
    const effectMultiplier = typeof planetaryEffects.Substance === 'number' ? planetaryEffects.Substance : 0;
    (transformedItem as unknown).substance = currentSubstance * (1 + 0.1 * effectMultiplier);
  }
  
  // Ensure all values remain within reasonable bounds
  ['spirit', 'essence', 'matter', 'substance'].forEach(prop => {
    if (prop in transformedItem) {
      // Use proper type assertion for dynamic property access
      (transformedItem as Record<string, number>)[prop] = Math.max(0, Math.min(1, (transformedItem as Record<string, number>)[prop]));
    }
  });
  
  return transformedItem;
}

/**
 * Apply tarot card influences to an alchemical item
 * 
 * @param item The AlchemicalItem to transform
 * @param cardName The full name of the tarot card (e.g., "10 of Cups")
 * @returns Transformed alchemical item with tarot influences applied
 */
export function applyTarotInfluence(
  item: AlchemicalItem,
  cardName: string
): AlchemicalItem {
  // Clone the item to avoid modifying the original
  const transformedItem = { ...item };
  
  // Get the alchemical effects of the tarot card
  const tarotEffects = getTarotCardAlchemicalEffect(cardName);
  if (!tarotEffects) return transformedItem; // No change if tarot card not recognized
  
  // Apply the tarot influences to the item's alchemical properties
  // These are subtle influences, using a 15% effect
  
  // Apply to spirit, essence, matter, substance if they exist in the item
  // Pattern KK-2: Safe property arithmetic with type validation
  if ('spirit' in transformedItem) {
    const currentSpirit = typeof (transformedItem as unknown).spirit === 'number' ? (transformedItem as unknown).spirit : 0;
    const effectMultiplier = typeof tarotEffects.Spirit === 'number' ? tarotEffects.Spirit : 0;
    (transformedItem as unknown).spirit = currentSpirit * (1 + 0.15 * effectMultiplier);
  }
  
  if ('essence' in transformedItem) {
    const currentEssence = typeof (transformedItem as unknown).essence === 'number' ? (transformedItem as unknown).essence : 0;
    const effectMultiplier = typeof tarotEffects.Essence === 'number' ? tarotEffects.Essence : 0;
    (transformedItem as unknown).essence = currentEssence * (1 + 0.15 * effectMultiplier);
  }
  
  if ('matter' in transformedItem) {
    const currentMatter = typeof (transformedItem as unknown).matter === 'number' ? (transformedItem as unknown).matter : 0;
    const effectMultiplier = typeof tarotEffects.Matter === 'number' ? tarotEffects.Matter : 0;
    (transformedItem as unknown).matter = currentMatter * (1 + 0.15 * effectMultiplier);
  }
  
  if ('substance' in transformedItem) {
    const currentSubstance = typeof (transformedItem as unknown).substance === 'number' ? (transformedItem as unknown).substance : 0;
    const effectMultiplier = typeof tarotEffects.Substance === 'number' ? tarotEffects.Substance : 0;
    (transformedItem as unknown).substance = currentSubstance * (1 + 0.15 * effectMultiplier);
  }
  
  // Ensure all values remain within reasonable bounds
  ['spirit', 'essence', 'matter', 'substance'].forEach(prop => {
    if (prop in transformedItem) {
      // Use proper type assertion for dynamic property access
      (transformedItem as Record<string, number>)[prop] = Math.max(0, Math.min(1, (transformedItem as Record<string, number>)[prop]));
    }
  });
  
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
  _isDaytime = true
): AlchemicalItem {
  // Clone the item to avoid modifying the original
  let transformedItem = { ...item };
  const influences = [];
  
  // Apply planetary influences if provided
  if (planet) {
    transformedItem = applyPlanetaryInfluence(transformedItem, planet, isDaytime);
    influences.push(`${planet} (${isDaytime ? 'Day' : 'Night'})`);
  }
  
  // Apply tarot influences if provided
  if (tarotCard) {
    transformedItem = applyTarotInfluence(transformedItem, tarotCard);
    influences.push(tarotCard);
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
  cookingMethods: Record<string, number>
): number => {
  // console.log(`==== COMPATIBILITY CALCULATION FOR ${methodName.toUpperCase()} ====`);
  // console.log(`Ingredient: ${(transformedItem as unknown)?.name} (Element: ${(transformedItem as unknown)?.element})`);
  
  // In case the method isn't found in our cooking methods
  if (!cookingMethods[methodName]) {
    // console.error(`Method "${methodName}" not found in cooking methods mapping`);
    return 50; // Base compatibility
  }

  // Get the pillar for this method
  const pillar = getCookingMethodPillar(methodName);
  if (!pillar) {
    // console.error(`No alchemical pillar found for method: ${methodName}`);
    return 50; // Base compatibility if no pillar is found
  }
  
  // console.log(`Method: ${methodName}`);
  // console.log(`- Associated Pillar: ${(pillar as unknown)?.name} (ID: ${(pillar as unknown)?.id})`);
  
  if ((pillar as unknown)?.elementalAssociations) {
    // console.log(`- Primary Element: ${(pillar as unknown)?.elementalAssociations.primary}`);
    if ((pillar as unknown)?.elementalAssociations.secondary) {
      // console.log(`- Secondary Element: ${(pillar as unknown)?.elementalAssociations.secondary}`);
    }
  }
  
  // console.log(`- Alchemical Effects: Spirit:${pillar.effects.Spirit}, Essence:${pillar.effects.Essence}, Matter:${pillar.effects.Matter}, Substance:${pillar.effects.Substance}`);
  
  // console.log(`\nIngredient Details:`)
  console.log(`- Element: ${(transformedItem as unknown)?.element || 'Not specified'}`);
  // console.log(`- Elemental Character: ${(transformedItem as unknown)?.elementalCharacter || 'Not specified'}`);
  // console.log(`- Spirit: ${transformedItem.spirit || 0}, Essence: ${transformedItem.essence || 0}, Matter: ${transformedItem.matter || 0}, Substance: ${transformedItem.substance || 0}`);

  // Base compatibility from element matching
  let compatibility = 50;
  // console.log(`\nStarting with base compatibility: ${compatibility}%`);
  
  // Element match - if both the transformed item and pillar have elemental associations
  if ((transformedItem as unknown)?.element && (pillar as unknown)?.elementalAssociations) {
    const _primaryElement = (pillar as unknown)?.elementalAssociations.primary;
    
    // Primary element match (case insensitive)
          if ((primaryElement as unknown)?.toLowerCase?.() === (transformedItem as unknown)?.element?.toLowerCase?.()) {
      const bonus = 20;
      compatibility += bonus;
      // console.log(`✓ Primary element match (${primaryElement}): +${bonus}% → ${compatibility}%`);
    } else {
      // console.log(`✗ No primary element match (${primaryElement} vs ${(transformedItem as unknown)?.element})`);
    }
    
    // Secondary element match (if defined)
    if ((pillar as unknown)?.elementalAssociations.secondary && 
        (pillar as unknown)?.elementalAssociations.secondary?.toLowerCase?.() === (transformedItem as unknown)?.element?.toLowerCase?.()) {
      const bonus = 10;
      compatibility += bonus;
      // console.log(`✓ Secondary element match (${(pillar as unknown)?.elementalAssociations.secondary}): +${bonus}% → ${compatibility}%`);
    } else if ((pillar as unknown)?.elementalAssociations.secondary) {
      // console.log(`✗ No secondary element match (${(pillar as unknown)?.elementalAssociations.secondary} vs ${(transformedItem as unknown)?.element})`);
    }
  }
  
  // Check for complementary elements
  const complementaryPairs = {
    fire: ['air'],
    water: ['earth'],
    air: ['fire'],
    earth: ['water']
  };
  
  if ((transformedItem as unknown)?.element && (pillar as unknown)?.elementalAssociations) {
    const _primaryElement = (pillar as unknown)?.elementalAssociations.primary?.toLowerCase?.();
    
          if (complementaryPairs[(transformedItem as unknown)?.element?.toLowerCase?.()]?.includes(primaryElement)) {
      const bonus = 10;
      compatibility += bonus;
      // console.log(`✓ Complementary elements (${(transformedItem as unknown)?.element} - ${primaryElement}): +${bonus}% → ${compatibility}%`);
    } else {
      // console.log(`✗ No complementary elements relationship detected`);
    }
  }
  
  // Check for alchemical property alignment
  // If method enhances the ingredient's strongest property
  const itemProperties = {
    Spirit: transformedItem.spirit || 0,
    Essence: transformedItem.essence || 0,
    Matter: transformedItem.matter || 0, 
    Substance: transformedItem.substance || 0
  };
  
  // Find the strongest property in the ingredient
  // Pattern KK-1: Safe comparison with type validation
  const maxProperty = Object.entries(itemProperties)
    .reduce((max, [prop, value]) => {
      const numericValue = typeof value === 'number' ? value : 0;
      const numericMaxValue = typeof max.value === 'number' ? max.value : 0;
      return numericValue > numericMaxValue ? {prop, value: numericValue} : max;
    }, {prop: '', value: 0});
  
  // Check if method enhances the strongest property
  const maxPropertyValue = typeof maxProperty.value === 'number' ? maxProperty.value : 0;
  const effectValue = typeof pillar.effects[maxProperty.prop as keyof typeof pillar.effects] === 'number' 
    ? pillar.effects[maxProperty.prop as keyof typeof pillar.effects] : 0;
  
  if (maxPropertyValue > 0 && effectValue > 0) {
    const bonus = 15;
    compatibility += bonus;
    // console.log(`✓ Method enhances ingredient's strongest property (${maxProperty.prop}): +${bonus}% → ${compatibility}%`);
  } else if (maxPropertyValue > 0) {
    // console.log(`✗ Method doesn't enhance ingredient's strongest property (${maxProperty.prop})`);
  }
  
  // console.log(`\nFinal compatibility score: ${compatibility}%`);
  return compatibility;
};

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
export const getHolisticCookingRecommendations = async (
  item: AlchemicalItem,
  planet?: string,
  tarotCard?: string,
  _isDaytime = true,
  availableMethods: string[] = [],
  count = 5
): Promise<Array<{ method: string, compatibility: number, reason: string }>> => {
  // console.log('\n--- HOLISTIC COOKING RECOMMENDATIONS ---');
  // console.log(`Ingredient: ${(item as unknown)?.name}`);
  // console.log(`Planet influence: ${planet || 'None'}`);
  // console.log(`Tarot influence: ${tarotCard || 'None'}`);
  // console.log(`Time of day: ${isDaytime ? 'Daytime' : 'Nighttime'}`);
  // console.log(`Available methods count: ${(availableMethods as unknown)?.length}`);
  // console.log(`Requesting top ${count} recommendations`);

  // Transform ingredient based on planetary and tarot influences
  // console.log('\nTransforming ingredient based on influences...');
  const transformedItem = transformIngredient(item, planet, tarotCard, isDaytime);
  
  if (planet || tarotCard) {
    /* console.log('Original item:', {
      element: (item as unknown)?.element,
      spirit: item.spirit || 0,
      essence: item.essence || 0,
      matter: item.matter || 0,
      substance: item.substance || 0
    });
  
    console.log('Transformed item:', {
      element: (transformedItem as unknown)?.element,
      spirit: transformedItem.spirit || 0,
      essence: transformedItem.essence || 0,
      matter: transformedItem.matter || 0,
      substance: transformedItem.substance || 0
    }); */
  } else {
    // console.log('No planetary or tarot influences to apply.');
  }

  // Get cooking methods
  const cookingMethods = await getCookingMethods();
  // console.log(`\nLoaded ${Object.keys(cookingMethods).length} cooking methods from database`);
  
  // Filter methods if specified
  const methods = (availableMethods as unknown)?.length > 0
    ? availableMethods
    : Object.keys(cookingMethods);
  
  // console.log(`Evaluating ${(methods as unknown)?.length} cooking methods: ${(methods as unknown)?.length <= 10 ? methods.join(', ') : (methods as unknown)?.length + ' methods (too many to display)'}`);

  // Calculate compatibility for each method
  const compatibility: Array<{ method: string, compatibility: number, reason: string }> = [];
  
  // console.log('\nCALCULATING METHOD COMPATIBILITY:');
  // console.log('--------------------------------');
  
  methods.forEach(method => {
    // console.log(`\nEvaluating compatibility for method: ${method}`);
    const compatibilityScore = getMethodCompatibility(transformedItem, method.toString(), cookingMethods);
    
    // Get the pillar for this method for the reason
    const pillar = getCookingMethodPillar(method.toString());
    let reason = "Compatible cooking method";
    
    if (pillar) {
      // Add which properties it enhances
      const enhancedProps = [];
      if (pillar.effects.Spirit > 0) enhancedProps.push("Spirit");
      if (pillar.effects.Essence > 0) enhancedProps.push("Essence");
      if (pillar.effects.Matter > 0) enhancedProps.push("Matter");
      if (pillar.effects.Substance > 0) enhancedProps.push("Substance");
      
      reason = `${(pillar as unknown)?.name} `;
      
      if ((enhancedProps as unknown)?.length > 0) {
        reason += `enhances ${enhancedProps.join(", ")}`;
      } else {
        reason += `stabilizes alchemical balance`;
      }
      
      // Add elemental associations
      if ((pillar as unknown)?.elementalAssociations) {
        const elements = [(pillar as unknown)?.elementalAssociations.primary];
        if ((pillar as unknown)?.elementalAssociations.secondary) {
          elements.push((pillar as unknown)?.elementalAssociations.secondary);
        }
        reason += ` with ${elements.join("-")} energy`;
      }
    }
    
    compatibility.push({
      method: method.toString(),
      compatibility: compatibilityScore,
      reason
    });
  });

  // Sort by compatibility (descending)
  const sortedResults = [...compatibility].sort((a, b) => b.compatibility - a.compatibility);
  
  // console.log('\nSORTED RECOMMENDATIONS:');
  // console.log('--------------------------------');
  sortedResults.slice(0, count).forEach((rec, index) => {
    // console.log(`${index + 1}. ${(rec as unknown)?.method} - Compatibility: ${Math.round(rec.compatibility)}% - ${rec.reason}`);
  });
  // console.log('--------------------------------\n');
  
  // Return top count results
  return sortedResults.slice(0, count);
};

/**
 * Get the mapping of cooking methods to pillar IDs
 * @returns Record mapping cooking method names to their pillar IDs
 */
async function getCookingMethods(): Promise<Record<string, number>> {
  // Import from constants to avoid circular reference
  const alchemicalPillars = await import('../constants/alchemicalPillars');
  return alchemicalPillars.COOKING_METHOD_PILLAR_MAPPING as Record<string, number>;
}

/**
 * Get recommended cooking methods for an ingredient or cuisine based on alchemical compatibility
 * 
 * @param item The AlchemicalItem to find compatible cooking methods for
 * @param availableMethods List of available cooking methods
 * @param count Number of recommendations to return
 * @returns Array of recommended cooking methods with compatibility scores
 */
export function getRecommendedCookingMethods(
  item: AlchemicalItem,
  availableMethods: string[] | CookingMethod[],
  count = 5
): Array<{ method: string, compatibility: number }> {
  // Calculate compatibility for each available method
  const compatibilities = (availableMethods as unknown)?.map?.(method => {
    // Apply the transformation to see how it affects the item
    const transformed = applyPillarTransformation(item, method.toString());
    
    // Calculate a compatibility score
    // Basic implementation: how much does it improve the dominant properties?
    const originalScore = calculateAlchemicalScore(item);
    const transformedScore = calculateAlchemicalScore(transformed);
    
    const improvement = transformedScore - originalScore;
    
    // Convert to a 0-1 scale and ensure positive
    const compatibility = Math.max(0, (improvement + 0.5) / 1.5);
    
    return {
      method: method.toString(),
      compatibility
    };
  });
  
  // Sort by compatibility and return the top results
  return compatibilities
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, count);
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
  return count > 0 ? score / count : 0.5;
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
    zodiacSign?: ZodiacSign,
    lunarPhase?: string,
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
  // Import cooking method data
  const allCookingMethods = getAllCookingMethodData();
  
  // Convert available methods to strings if they aren't already
  const methodStrings = (availableMethods as unknown)?.map?.(m => m.toString());
  
  // Filter available methods to those we have data for
  const availableMethodsWithData = (methodStrings as unknown)?.filter?.(
    method => method in allCookingMethods
  );
  
  // Calculate base compatibility scores using existing function
  const baseRecommendations = getRecommendedCookingMethods(
    item, 
    availableMethodsWithData,
    (availableMethodsWithData as unknown)?.length // Get all, we'll filter later
  );
  
  // Create enhanced recommendations with additional data
  const enhancedRecommendations = (baseRecommendations as unknown)?.map?.(rec => {
    const methodData = allCookingMethods[(rec as unknown)?.method];
    
    // Extract methodData with safe property access
    const data = methodData as unknown;
    const sustainabilityRating = data?.sustainabilityRating;
    const equipmentComplexity = data?.equipmentComplexity;
    const astrologicalInfluences = data?.astrologicalInfluences;
    const duration = data?.duration;
    const toolsRequired = data?.toolsRequired;
    const healthConsiderations = data?.healthConsiderations;
    const suitable_for = data?.suitable_for;
    
    let zodiacCompatibility = 1.0;
    let lunarCompatibility = 1.0;
    let timeCompatibility = 1.0;
    let toolCompatibility = 1.0;
    const sustainabilityScore = sustainabilityRating || 0.5;
    const complexityScore = equipmentComplexity || 0.5;
    const reasons = [];
    
    // Adjust for zodiac compatibility if provided
    if (options.zodiacSign && astrologicalInfluences) {
      if (astrologicalInfluences.favorableZodiac?.includes(options.zodiacSign)) {
        zodiacCompatibility = 1.5;
        reasons.push(`favorable for ${options.zodiacSign}`);
      } else if (astrologicalInfluences.unfavorableZodiac?.includes(options.zodiacSign)) {
        zodiacCompatibility = 0.5;
        reasons.push(`less favorable for ${options.zodiacSign}`);
      }
    }
    
    // Adjust for lunar phase if provided
    if (options.lunarPhase && astrologicalInfluences?.lunarPhaseEffect?.[options.lunarPhase]) {
      lunarCompatibility = astrologicalInfluences.lunarPhaseEffect[options.lunarPhase];
      if (lunarCompatibility > 1.0) {
        reasons.push(`enhanced during ${options.lunarPhase}`);
      } else if (lunarCompatibility < 1.0) {
        reasons.push(`subdued during ${options.lunarPhase}`);
      }
    }
    
    // Check time constraints
    if (options.timeConstraint && duration) {
      if (duration.min > options.timeConstraint) {
        timeCompatibility = 0.1; // Significant penalty if minimum time exceeds constraint
        reasons.push(`exceeds time constraint (${duration.min} min)`);
      } else if (duration.max > options.timeConstraint) {
        // Some penalty if maximum time exceeds constraint but minimum doesn't
        timeCompatibility = 0.5 + 0.5 * (options.timeConstraint - duration.min) / 
                          (duration.max - duration.min);
        reasons.push(`may exceed time constraint depending on preparation`);
      } else if (duration.max < options.timeConstraint * 0.5) {
        // Bonus for methods well under time constraint
        timeCompatibility = 1.2;
        reasons.push(`efficient cooking time (${duration.min}-${duration.max} min)`);
      }
    }
    
    // Check available tools if specified
    if (options.availableTools && (options.availableTools as unknown)?.length > 0 && toolsRequired) {
      const requiredTools = toolsRequired;
      const missingTools = (requiredTools as unknown)?.filter?.(
        tool => !options.availableTools?.some(
          availableTool => (tool as unknown)?.toLowerCase?.().includes((availableTool as unknown)?.toLowerCase?.())
        )
      );
      
      if ((missingTools as unknown)?.length > 0) {
        // Penalty based on percentage of missing tools
        toolCompatibility = 1 - ((missingTools as unknown)?.length / (requiredTools as unknown)?.length) * 0.8;
        if (missingTools.length === 1) {
          reasons.push(`missing tool: ${missingTools[0]}`);
        } else {
          reasons.push(`missing ${(missingTools as unknown)?.length} tools`);
        }
      } else {
        toolCompatibility = 1.2; // Bonus for having all tools
        reasons.push(`all required tools available`);
      }
    }
    
    // Adjust sustainability and health focus if requested
    let healthBenefits: string[] = [];
    
    if (options.healthFocus && healthConsiderations) {
      // Extract positive health considerations
              healthBenefits = (healthConsiderations as unknown)?.filter?.(
        consideration => !(consideration as unknown)?.toLowerCase?.().includes('risk') &&
                        !(consideration as unknown)?.toLowerCase?.().includes('concern') &&
                        !(consideration as unknown)?.toLowerCase?.().includes('monitor')
      );
      
      if ((healthBenefits as unknown)?.length >= 3) {
        reasons.push(`offers ${(healthBenefits as unknown)?.length} health benefits`);
      }
    }
    
    if (options.sustainabilityFocus && sustainabilityRating) {
      if (sustainabilityRating >= 0.8) {
        reasons.push(`highly sustainable (${Math.round(sustainabilityRating * 100)}%)`);
      } else if (sustainabilityRating <= 0.4) {
        reasons.push(`lower sustainability (${Math.round(sustainabilityRating * 100)}%)`);
      }
    }
    
    // Check if this method is suitable for the item's type
    let suitabilityFactor = 1.0;
    if (item.type && suitable_for) {
      const isExplicitlySuitable = suitable_for.some(
        suitableType => {
          const typeStr = suitableType as string;
          const itemType = item.type as string;
          return typeof typeStr === 'string' && typeof itemType === 'string' && 
                 typeStr.toLowerCase() === itemType.toLowerCase();
        }
      );
      
      if (isExplicitlySuitable) {
        suitabilityFactor = 1.5;
        reasons.push(`ideal for ${item.type}`);
      }
    }
    
    // Calculate final weighted compatibility score
    const enhancedCompatibility = rec.compatibility * 
                                 zodiacCompatibility * 
                                 lunarCompatibility * 
                                 timeCompatibility * 
                                 toolCompatibility *
                                 suitabilityFactor;
    
    return {
      method: (rec as unknown)?.method,
      compatibility: Math.min(1, enhancedCompatibility), // Cap at 1.0
      reason: (reasons as unknown)?.length > 0 ? reasons.join("; ") : "Compatible cooking method",
      cookingTime: duration || { min: 0, max: 60 },
      sustainabilityRating: sustainabilityScore,
      equipmentComplexity: complexityScore,
      healthBenefits: healthBenefits.slice(0, 3) // Top 3 health benefits
    };
  });
  
  // Sort by compatibility (descending) and return top results
  return enhancedRecommendations
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, count);
}

/**
 * Get all cooking method data from the appropriate directories
 * @returns Record mapping cooking method names to their data
 */
function getAllCookingMethodData(): Record<string, unknown> {
  // This is a placeholder - in a real implementation, this would
  // dynamically load all cooking method data from the files
  try {
    const methods = {};
    
    // Import methods from each category
    // Using dynamic imports instead of require statements
    const dryMethods = import('../data/cooking/methods/dry').then(module => (module as unknown).default || module);
    const wetMethods = import('../data/cooking/methods/wet').then(module => (module as unknown).default || module);
    const traditionalMethods = import('../data/cooking/methods/traditional').then(module => (module as unknown).default || module);
    
    // Since we're using async imports, return a promise with all methods
    return Promise.all([dryMethods, wetMethods, traditionalMethods])
      .then(([dry, wet, traditional]) => ({
        ...dry,
        ...wet,
        ...traditional
      }))
      .catch(error => {
        // console.error("Error loading cooking method data:", error);
        return {};
      }) as unknown as Record<string, unknown>;
  } catch (error) {
    // console.error("Error loading cooking method data:", error);
    return {};
  }
} 