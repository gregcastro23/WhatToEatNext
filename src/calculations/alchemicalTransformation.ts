import { RulingPlanet } from '../constants/planets';
import { 
  ElementalCharacter, 
  AlchemicalProperty,
  getPlanetaryElement,
  getPlanetaryAlchemicalProperty
} from '../constants/planetaryElements';
import {
  calculateAlchemicalProperties,
  AlchemicalResults
} from './alchemicalCalculations';
import {
  calculatePlanetaryBoost,
  LunarPhase,
  Planet,
  PlanetaryDignity
} from '../constants/planetaryFoodAssociations';
import { ZodiacSign } from '../constants/zodiac';

/**
 * Interface for items with elemental data (ingredients, methods, cuisines)
 */
export interface ElementalItem {
  id: string;
  name: string;
  elementalProperties: Record<ElementalCharacter, number>;
  [key: string]: any; // Allow other properties
}

/**
 * Interface for transformed items with both elemental and alchemical data
 */
export interface AlchemicalItem extends ElementalItem {
  alchemicalProperties: Record<AlchemicalProperty, number>;
  transformedElementalProperties: Record<ElementalCharacter, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  // New planetary influence properties
  planetaryBoost: number;
  dominantPlanets: string[];
  planetaryDignities: Record<string, PlanetaryDignity>;
}

/**
 * Transform an item with elemental data using current planetary positions
 * 
 * @param item The original item with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @param currentZodiac Current zodiac sign (optional)
 * @param lunarPhase Current lunar phase (optional)
 * @returns Item transformed with alchemical properties
 */
export const transformItemWithPlanetaryPositions = (
  item: ElementalItem,
  planetPositions: Record<RulingPlanet | Planet, any>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhase | null
): AlchemicalItem => {
  // Validate and sanitize input values
  const sanitizedItem = {
    ...item,
    elementalProperties: Object.fromEntries(
      Object.entries(item.elementalProperties).map(([key, value]) => [
        key,
        Number.isFinite(value) ? value : 0.1
      ])
    ) as Record<ElementalCharacter, number>
  };

  // Calculate alchemical properties based on planetary positions
  const alchemicalResults = calculateAlchemicalProperties(
    planetPositions,
    isDaytime
  );
  
  // Calculate planetary boost based on ingredient's characteristics
  const { boost: planetaryBoost, dominantPlanets, dignities: planetaryDignities } = 
    calculatePlanetaryBoost(
      sanitizedItem, 
      planetPositions, 
      currentZodiac || null,
      lunarPhase || null
    );
  
  // Transform elemental properties based on planetary influences
  // Apply the planetary boost to increase the effect
  const transformedElementalProperties = transformElementalProperties(
    sanitizedItem.elementalProperties,
    alchemicalResults,
    planetaryBoost,
    currentZodiac?.toLowerCase() as ZodiacSign
  );
  
  // Calculate dominant element and alchemical property
  const dominantElement = getDominantElement(transformedElementalProperties);
  const dominantAlchemicalProperty = getDominantAlchemicalProperty(alchemicalResults.alchemicalCounts);
  
  // Apply safety checks for energy metrics
  const safeHeat = Number.isFinite(alchemicalResults.heat) ? 
    Math.max(0.1, Math.min(1.0, alchemicalResults.heat * planetaryBoost * 2.5)) : 0.5;
  
  const safeEntropy = Number.isFinite(alchemicalResults.entropy) ? 
    Math.max(0.1, Math.min(1.0, alchemicalResults.entropy * 1.5)) : 0.5;
  
  const safeReactivity = Number.isFinite(alchemicalResults.reactivity) ? 
    Math.max(0.1, Math.min(1.0, alchemicalResults.reactivity * 1.5)) : 0.5;
  
  // Calculate gregsEnergy using the original formula: heat - (reactivity * entropy)
  // Then scale to the 0-1 range for UI friendliness
  const rawGregsEnergy = safeHeat - (safeReactivity * safeEntropy);
  const scaledGregsEnergy = (rawGregsEnergy + 1) / 2; // Convert from range (-1,1) to (0,1)
  const safeGregsEnergy = Math.max(0.1, Math.min(1.0, scaledGregsEnergy));
  
  // Add more debug logging
  console.log(`[Ingredient: ${sanitizedItem.name}] Raw heat: ${alchemicalResults.heat}, Boosted heat: ${safeHeat}, Planetary boost: ${planetaryBoost}`);
  
  return {
    ...sanitizedItem,
    alchemicalProperties: alchemicalResults.alchemicalCounts,
    transformedElementalProperties,
    heat: safeHeat,
    entropy: safeEntropy,
    reactivity: safeReactivity,
    gregsEnergy: safeGregsEnergy,
    dominantElement,
    dominantAlchemicalProperty,
    planetaryBoost,
    dominantPlanets,
    planetaryDignities
  };
};

/**
 * Transform a collection of items using current planetary positions
 */
export const transformItemsWithPlanetaryPositions = (
  items: ElementalItem[],
  planetPositions: Record<RulingPlanet | Planet, any>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhase | null
): AlchemicalItem[] => {
  return items.map(item => 
    transformItemWithPlanetaryPositions(
      item, 
      planetPositions, 
      isDaytime,
      currentZodiac,
      lunarPhase
    )
  );
};

/**
 * Transform elemental properties using alchemical results and planetary boost
 * This applies the alchemical influence to the base elemental properties
 */
const transformElementalProperties = (
  originalProperties: Record<ElementalCharacter, number>,
  alchemicalResults: AlchemicalResults,
  planetaryBoost: number = 1.0,
  zodiacSign?: ZodiacSign
): Record<ElementalCharacter, number> => {
  // Create a copy of the original properties
  const transformedProperties: Record<ElementalCharacter, number> = { ...originalProperties };
  
  // Calculate base enhancement factor - stronger effect on dominant elements
  // Enhanced by planetary boost, but cap the enhancement factor to prevent excessive values
  const enhancementFactor = Math.min(0.10, 0.15 * planetaryBoost) * 0.5;
  
  // Get the dominant original element to preserve character
  const dominantElement = getDominantElement(originalProperties);
  
  // Apply transformations based on alchemical properties, with reduced enhancers
  // Spirit enhances Fire more if Fire is already present
  transformedProperties.Fire += 
    (alchemicalResults.alchemicalCounts.Spirit * enhancementFactor * (originalProperties.Fire + 0.15)) * 0.8;
  
  // Essence enhances Water more if Water is already present
  transformedProperties.Water += 
    (alchemicalResults.alchemicalCounts.Essence * enhancementFactor * (originalProperties.Water + 0.15)) * 0.7;
  
  // Matter enhances Earth more if Earth is already present
  transformedProperties.Earth += 
    (alchemicalResults.alchemicalCounts.Matter * enhancementFactor * (originalProperties.Earth + 0.15)) * 0.7;
  
  // Substance enhances Air more if Air is already present
  transformedProperties.Air += 
    (alchemicalResults.alchemicalCounts.Substance * enhancementFactor * (originalProperties.Air + 0.15)) * 0.7;
  
  // Apply cross-element influences with more dynamic calculations, with reduced strength
  applyElementalInfluences(transformedProperties, alchemicalResults.elementalCounts, originalProperties, Math.min(1.0, planetaryBoost * 0.7));
  
  // Boost the dominant element slightly to preserve ingredient character, but cap the boost
  transformedProperties[dominantElement] *= Math.min(1.05, 1.1 * planetaryBoost);
  
  // Apply zodiac-specific boost if available
  if (zodiacSign) {
    applyZodiacBoost(transformedProperties, zodiacSign);
  }
  
  // Normalize the values so they sum to 1.0
  normalizeValues(transformedProperties);
  
  return transformedProperties;
};

/**
 * Apply zodiac-specific boosts to elemental properties
 */
const applyZodiacBoost = (
  transformedProperties: Record<ElementalCharacter, number>,
  zodiacSign: ZodiacSign
): void => {
  const zodiacElementMap: Record<ZodiacSign, ElementalCharacter> = {
    aries: 'Fire',
    taurus: 'Earth',
    gemini: 'Air',
    cancer: 'Water',
    leo: 'Fire',
    virgo: 'Earth',
    libra: 'Air',
    scorpio: 'Water',
    sagittarius: 'Fire',
    capricorn: 'Earth',
    aquarius: 'Air',
    pisces: 'Water'
  };
  
  if (zodiacSign in zodiacElementMap) {
    const elementToBoost = zodiacElementMap[zodiacSign];
    transformedProperties[elementToBoost] *= 1.1;
  }
};

/**
 * Apply elemental influences between elements based on traditional relationships
 * Enhanced to respect original properties and incorporate planetary boost
 */
const applyElementalInfluences = (
  transformedProperties: Record<ElementalCharacter, number>,
  elementalCounts: Record<ElementalCharacter, number>,
  originalProperties: Record<ElementalCharacter, number>,
  planetaryBoost: number = 1.0
): void => {
  // Use original properties to determine influence strength - include planetary boost but limit it
  const influenceFactor = Math.min(0.05, 0.08 * planetaryBoost);
  const fireStrength = originalProperties.Fire * influenceFactor;
  const waterStrength = originalProperties.Water * influenceFactor;
  const airStrength = originalProperties.Air * influenceFactor;
  const earthStrength = originalProperties.Earth * influenceFactor;

  // Fire strengthens Air proportionally to fire content, but weakens Water - reduce effect strength
  transformedProperties.Air += (elementalCounts.Fire * (fireStrength + 0.01));
  transformedProperties.Water -= (elementalCounts.Fire * (fireStrength / 3));
  
  // Water strengthens Earth proportionally to water content, but weakens Fire - reduce effect strength
  transformedProperties.Earth += (elementalCounts.Water * (waterStrength + 0.01));
  transformedProperties.Fire -= (elementalCounts.Water * (waterStrength / 3));
  
  // Air strengthens Fire proportionally to air content, but weakens Earth - reduce effect strength
  transformedProperties.Fire += (elementalCounts.Air * (airStrength + 0.01));
  transformedProperties.Earth -= (elementalCounts.Air * (airStrength / 3));
  
  // Earth strengthens Water proportionally to earth content, but weakens Air - reduce effect strength
  transformedProperties.Water += (elementalCounts.Earth * (earthStrength + 0.01));
  transformedProperties.Air -= (elementalCounts.Earth * (earthStrength / 3));
  
  // Ensure no negative values
  Object.keys(transformedProperties).forEach(element => {
    if (transformedProperties[element as ElementalCharacter] < 0) {
      transformedProperties[element as ElementalCharacter] = 0;
    }
  });
};

/**
 * Determines the dominant element based on transformed properties
 */
const getDominantElement = (
  transformedProperties: Record<ElementalCharacter, number>
): ElementalCharacter => {
  let dominant: ElementalCharacter = 'Fire';
  let maxValue = -1;
  
  (Object.entries(transformedProperties) as [ElementalCharacter, number][]).forEach(([element, value]) => {
    if (value > maxValue) {
      dominant = element;
      maxValue = value;
    }
  });
  
  return dominant;
};

/**
 * Determines the dominant alchemical property
 */
const getDominantAlchemicalProperty = (
  alchemicalCounts: Record<AlchemicalProperty, number>
): AlchemicalProperty => {
  let dominant: AlchemicalProperty = 'Spirit';
  let maxValue = -1;
  
  (Object.entries(alchemicalCounts) as [AlchemicalProperty, number][]).forEach(([property, value]) => {
    if (value > maxValue) {
      dominant = property;
      maxValue = value;
    }
  });
  
  return dominant;
};

/**
 * Update the normalization function
 */
const normalizeValues = <T extends string>(record: Record<T, number>): void => {
  // Convert all values to numbers and ensure they're finite
  const values = Object.values(record).map(v => Number.isFinite(v) ? v : 0.1) as number[];
  const total = values.reduce((sum, val) => sum + val, 0);
  const safeTotal = total > 0 ? total : 1;
  
  Object.keys(record).forEach((key, index) => {
    record[key as T] = parseFloat(((values[index] / safeTotal)).toFixed(4));
  });
}; 