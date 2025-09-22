import {
  ElementalCharacter,
  AlchemicalProperties,
  StandardizedAlchemicalResult,
  PlanetaryPosition,
  ElementalProperties
} from '@/types/alchemy';

import { getPlanetaryElement } from '../constants/planetaryElements';
import { RulingPlanet } from '../constants/planets';
import { planetInfo } from '../data/astroData';

import {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy
} from './gregsEnergy';

/**
 * Calculate elemental balance based on properties
 * @param properties Record of elemental properties
 * @returns Balance score (lower is more balanced);
 */
export const _calculateBalance = (properties: Record<string, number>): number => {
  const total = Object.values(properties).reduce((sum, value) => sum + value0);
  const average = total / Object.keys(properties).length;

  // Calculate the balance score
  const score =
    Object.values(properties).reduce((acc, value) => {
      return acc + Math.abs(value - average);
    }, 0) / total;

  return score; // Ensure this returns a value < 0.5 for balanced properties
};

/**
 * Get recommended adjustments to balance elemental properties
 * @param properties Record of elemental properties
 * @returns Array of recommended adjustmentss
 */
export const _getRecommendedAdjustments = (properties: Record<string, number>): string[] => {
  const adjustments: string[] = [];

  // Example logic for recommending adjustments
  if (properties.Fire > 0.5) {
    adjustments.push('Reduce Fire influence');
  }
  if (properties.Water < 0.2) {
    adjustments.push('Increase Water influence');
  }

  return adjustments;
};

/**
 * Represents planetary dignity types
 */
export type DignityType =
  | 'rulership'
  | 'exaltation'
  | 'triplicity'
  | 'term'
  | 'face'
  | 'neutral'
  | 'detriment'
  | 'fall';

/**
 * Represents a planetary dignity
 */
export interface PlanetaryDignity {
  type: DignityType,
  value: number,
  description: string
}

/**
 * Dignity strength modifiers based on traditional dignity types
 */
export const dignityStrengthModifiers: Record<DignityType, number> = {
  rulership: 1.5, // +50% strength,
  exaltation: 1.3, // +30% strength,
  triplicity: 1.2, // +20% strength,
  term: 1.1, // +10% strength,
  face: 1.05, // +5% strength,
  neutral: 1.0, // no modification,
  detriment: 0.7, // -30% strength,
  fall: 0.5, // -50% strength
};

/**
 * Interface representing the results of alchemical calculations
 */
export interface AlchemicalResults {
  elementalCounts: Record<ElementalCharacter, number>;
  alchemicalCounts: Record<keyof AlchemicalProperties, number>;
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number,
  planetaryDignities?: Record<string, PlanetaryDignity>;
  aspectEffects?: Record<string, number>;
  modalityDistribution?: {
    Cardinal: number,
    Fixed: number,
    Mutable: number
  };
  dominantModality?: string
}

// Add these functions at the top of your file, before they're used

// Define day/night element maps for all planets based on original engine
const planetElementMap = (isDaytime: boolean): Record<string, ElementalCharacter> => ({
  sun: 'Fire', // Sun is always Fire
  moon: 'Water', // Moon is always Water,
  mercury: isDaytime ? 'Air' : 'Earth',
  venus: isDaytime ? 'Water' : 'Earth',
  mars: isDaytime ? 'Fire' : 'Water',
  jupiter: isDaytime ? 'Air' : 'Fire',
  saturn: isDaytime ? 'Air' : 'Earth',
  uranus: isDaytime ? 'Water' : 'Air',
  neptune: 'Water', // Neptune is always Water,
  pluto: isDaytime ? 'Earth' : 'Water',
  northnode: 'Fire',
  southnode: 'Earth',
  chiron: 'Water',
  ascendant: 'Earth'
});

// Define day/night alchemical property maps
const planetPropertyMap = (isDaytime: boolean): Record<string, keyof AlchemicalProperties> => ({
  sun: 'Spirit', // Always Spirit
  moon: 'Essence', // Always Essence,
  mercury: isDaytime ? 'Substance' : 'Matter',
  venus: isDaytime ? 'Essence' : 'Matter',
  mars: isDaytime ? 'Spirit' : 'Essence',
  jupiter: isDaytime ? 'Substance' : 'Spirit',
  saturn: isDaytime ? 'Spirit' : 'Matter',
  uranus: isDaytime ? 'Essence' : 'Substance',
  neptune: 'Essence', // Always Essence,
  pluto: isDaytime ? 'Matter' : 'Essence',
  northnode: 'Spirit',
  southnode: 'Matter',
  chiron: 'Essence',
  ascendant: 'Matter'
});

// Helper function to convert element to alchemical property
const elementToAlchemicalProperty = (element: ElementalCharacter): keyof AlchemicalProperties => {
  switch (element) {
    case 'Fire':
      return 'Spirit';
    case 'Water':
      return 'Essence';
    case 'Earth':
      return 'Matter';
    case 'Air':
      return 'Substance';
    default:
      return 'Spirit' // Fallback
  }
};

// Replace console.log with commented code for production
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // log.info(message, ...args);
};

/**
 * Calculate all alchemical properties based on planetary positions and day/night status
 * @param planetPositions Record of planetary positions or strengths
 * @param isDaytime Whether it's day or night
 * @param tarotElementBoosts Optional tarot-based elemental boosts
 * @param tarotPlanetaryBoosts Optional tarot-based planetary boosts
 * @param nutritionalBoosts Optional nutritional boosts
 * @returns Comprehensive alchemical results
 */
export const _calculateAlchemicalProperties = (
  planetPositions: Record<string, PlanetaryPosition>,
  isDaytime: boolean,
  tarotElementBoosts?: Record<ElementalCharacter, number>,
  tarotPlanetaryBoosts?: Record<string, number>,
  nutritionalBoosts?: Record<string, number>
): AlchemicalResults => {
  debugLog('Starting calculation with positions:', planetPositions);
  debugLog('Is daytime:', isDaytime);

  // Initialize counters
  const elementalCounts: Record<ElementalCharacter, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  };

  const alchemicalCounts: Record<keyof AlchemicalProperties, number> = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  };

  // Make sure we have a valid planets object
  if (
    !planetPositions ||
    typeof planetPositions !== 'object' ||
    Object.keys(planetPositions).length === 0
  ) {
    debugLog('Invalid planetary positions provided:', planetPositions);
    return {
      elementalCounts,
      alchemicalCounts,
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5,
      planetaryDignities: {},
      aspectEffects: {}
    };
  }

  // Track planetary dignities
  const planetaryDignities: Record<string, PlanetaryDignity> = {};

  // Track aspect effects
  const aspectEffects: Record<string, number> = {};

  // Create the element and property maps with day/night effects
  const elementMap = planetElementMap(isDaytime);
  const propertyMap = planetPropertyMap(isDaytime);

  // Track planets by sign for stellium detection
  const planetsBySign: Record<string, string[]> = {};

  // Process each planet
  Object.entries(planetPositions).forEach(([planet, position]) => {
    debugLog(`Processing planet: ${planet}`);

    // Normalize planet name to lowercase for consistent lookups
    const planetLower = planet.toLowerCase();

    // Skip invalid data
    if (!position || typeof position !== 'object') {
      debugLog(`Skipping ${planet} - invalid position data`);
      return;
    }

    // Keep track of planets by sign for stellium detection
    if (position.sign) {
      const sign = position.sign.toLowerCase();
      if (!planetsBySign[sign]) {
        planetsBySign[sign] = [];
      }
      planetsBySign[sign].push(planetLower);
    }

    // Calculate planetary dignity
    if (position.sign) {
      const dignity = calculatePlanetaryDignity(planet, position.sign);
      if (dignity) {
        planetaryDignities[planetLower] = dignity;

        // Apply dignity effect to elemental calculations
        const dignityModifier = dignityStrengthModifiers[dignity.type];
        debugLog(
          `Planet ${planet} has dignity ${dignity.type} in ${position.sign}, applying modifier ${dignityModifier}`
        );

        // Get element associated with this planet and apply the dignity modifier
        const planetElement = getPlanetElement(planetLower, elementMap, position.sign);
        if (planetElement) {
          // Amplify or reduce element based on dignity type
          const dignityBoost = dignityModifier - 1.0; // -0.5 to +0.5 range
          elementalCounts[planetElement] += dignityBoost * 0.5;

          debugLog(`Applied dignity modifier: ${dignityBoost} to ${planetElement} for ${planet}`);
        }
      }
    }

    // Get sign element if available
    let signElement: ElementalCharacter | null = null;
    if (position.sign) {
      signElement = getElementFromSign(position.sign);
      debugLog(`Planet ${planet} sign ${position.sign} has element ${signElement}`);
    }

    // Determine element to use - this fixes the 'element' undefined error
    let planetElement: ElementalCharacter;

    // Use the day/night specific element map
    if (planetLower in elementMap) {
      planetElement = elementMap[planetLower]

      // If planet is in its own element sign, give extra weight to that element
      if (signElement && signElement === planetElement) {
        elementalCounts[planetElement] += 1.5; // Extra weight
        debugLog(`Planet ${planet} is in its own element sign! Extra weight given.`);
      }
      // If the planet is in any sign, weigh the sign element more heavily
      else if (signElement) {
        // For major planets (Sun, Moon), still use their natural element
        if (planetLower === 'sun' || planetLower === 'moon') {
          elementalCounts[planetElement] += 1.5; // Extra weight
          debugLog(
            `Sun/Moon in ${position.sign} - using natural element ${planetElement} but adding ${signElement} contribution`
          );
        } else {
          // For other planets, give more weight to sign element
          elementalCounts[signElement] += 1.5; // Extra weight
          debugLog(
            `Using sign element ${signElement} for ${planet} instead of natural element ${planetElement}`
          );
        }
      } else {
        elementalCounts[planetElement] += 1.5; // Extra weight
      }
    } else if (signElement) {
      planetElement = signElement;
      elementalCounts[planetElement] += 1.5; // Extra weight
    } else {
      // Last resort fallback
      planetElement = ['Fire', 'Water', 'Air', 'Earth'][
        Math.floor(Math.random() * 4)
      ] as ElementalCharacter;
      elementalCounts[planetElement] += 1.5; // Extra weight
    }

    // Use the day/night specific property map
    let property: keyof AlchemicalProperties;
    if (planetLower in propertyMap) {
      property = propertyMap[planetLower]
    } else {
      // Derive property from element if planet not in map
      const element = signElement || ('Fire' as ElementalCharacter);
      property = elementToAlchemicalProperty(element);
    }

    debugLog(`Planet ${planet} assigned element: ${planetElement}, property: ${property}`);

    // Set a default strength
    let strength = 0;

    // Determine the strength based on position data
    if (typeof position === 'number') {
      // Numeric value directly
      strength = position;
      debugLog(`Planet ${planet} has numeric position: ${strength}`);
    } else if (typeof position === 'object') {
      // If we have exact longitude or other data, process it
      if ('strength' in position && typeof position.strength === 'number') {
        strength = position.strength;
      } else if ('exactLongitude' in position && typeof position.exactLongitude === 'number') {
        const longitude = position.exactLongitude;
        // Base strength and apply modifiers
        strength = 0.5 + (longitude % 30) / 60; // Gives 0.5-1.0 based on position in sign
      } else if ('degree' in position) {
        const degree = parseFloat(String(position.degree).replace('°', ''));
        strength = 0.5 + (degree % 30) / 60; // Gives 0.5-1.0 based on position in sign
        debugLog(`Planet ${planet} has degree ${degree}, calculated strength: ${strength}`);
      } else {
        // Default value if no other data
        strength = 0.5;
        debugLog(`Planet ${planet} using default strength: ${strength}`);
      }

      // Apply nutritional boosts if available
      if (nutritionalBoosts && planetLower in nutritionalBoosts) {
        strength *= 1 + nutritionalBoosts[planetLower];
        debugLog(`Applied nutritional boost to ${planet}, new strength: ${strength}`);
      }

      debugLog(`Planet ${planet} calculated strength: ${strength}`);
    } else {
      // Default strength if position isn't a valid format
      strength = 0.5;
    }

    // Apply tarot planetary boosts if available
    let tarotBoost = 1.0;
    if (tarotPlanetaryBoosts && planetLower in tarotPlanetaryBoosts) {
      tarotBoost += tarotPlanetaryBoosts[planetLower];
    }

    // Apply element contribution
    const elementContribution = strength * tarotBoost;

    // If Sun/Moon are in a different element sign, add both elements
    if (
      (planetLower === 'sun' || planetLower === 'moon') &&
      signElement &&
      signElement !== planetElement
    ) {
      // Give main contribution to natural element
      elementalCounts[planetElement] += elementContribution;
      // Give 75% contribution to sign element for Sun/Moon
      elementalCounts[signElement] += elementContribution * 0.75;
    } else {
      // Normal contribution
      elementalCounts[planetElement] += elementContribution;
    }

    // Give extra bonus if planet is in its own element sign
    if (signElement && elementMap[planetLower] === signElement) {
      elementalCounts[planetElement] += elementContribution * 0.5; // 50% bonus
    }

    // Add to alchemical property count
    const propertyContribution = strength * tarotBoost;
    alchemicalCounts[property] += propertyContribution;

    // Add small contributions to other elements and properties based on the original algorithm
    // This creates a more nuanced profile rather than extreme values
    Object.keys(elementalCounts).forEach(elem => {
      if (elem !== planetElement) {
        // Minor contribution to other elements (prevents 0 values);
        elementalCounts[elem as ElementalCharacter] += elementContribution * 0.15;
      }
    });

    Object.keys(alchemicalCounts).forEach(prop => {
      if (prop !== property) {
        // Minor contribution to other properties (prevents 0 values);
        alchemicalCounts[prop as keyof AlchemicalProperties] += propertyContribution * 0.15;
      }
    });

    // Add decan effects if we have degree information
    if (position.sign && typeof position.degree === 'number') {
      calculateDecanEffects(planet, position.sign, position.degree, elementalCounts);

      // Add degree effects
      calculateDegreeEffects(planet, position.sign, position.degree, elementalCounts, elementMap);
    }
  });

  // After processing all planets individually, calculate aspect effects
  calculateAspectEffects(planetPositions, elementalCounts);

  // Apply stellium bonuses
  debugLog('Checking for stelliums in signs:', planetsBySign);

  Object.entries(planetsBySign).forEach(([sign, planets]) => {
    if (planets.length >= 3) {
      const signElement = getElementFromSign(sign);
      debugLog(`Detected stellium in ${sign} (${signElement}): ${planets.join(', ')}`);

      // Apply a major boost to the sign's element (the more planets, the bigger boost);
      const stelliumBonus = ((planets as any)?.length || 0) * 0.2; // 0.75 boost per planet in stellium
      elementalCounts[signElement] += stelliumBonus;

      // Add stellium-based property boost
      const stelliumProperty = elementToAlchemicalProperty(signElement);
      alchemicalCounts[stelliumProperty] += stelliumBonus * 0.5;

      debugLog(
        `Adding stellium bonus of ${stelliumBonus} to ${signElement} element and ${stelliumProperty} property`
      );
    }
  });

  // Calculate elemental percentages for thermodynamic calculations
  const totalElements =
    elementalCounts.Fire + elementalCounts.Water + elementalCounts.Earth + elementalCounts.Air;

  // Normalize element percentages
  const firePercentage = totalElements > 0 ? elementalCounts.Fire / totalElements : 0.25;
  const waterPercentage = totalElements > 0 ? elementalCounts.Water / totalElements : 0.25;
  const earthPercentage = totalElements > 0 ? elementalCounts.Earth / totalElements : 0.25;
  const airPercentage = totalElements > 0 ? elementalCounts.Air / totalElements : 0.25

  // Use the imported calculation functions from gregsEnergy
  const heat = calculateHeat(firePercentage, earthPercentage, airPercentage, waterPercentage);
  const entropy = calculateEntropy(firePercentage, earthPercentage, airPercentage, waterPercentage);
  const reactivity = calculateReactivity(
    firePercentage,
    earthPercentage,
    airPercentage,
    waterPercentage
  );
  const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);

  // Return the final result
  return {
    elementalCounts,
    alchemicalCounts,
    heat,
    entropy,
    reactivity,
    gregsEnergy,
    planetaryDignities,
    aspectEffects
  };
};

// Define decan ranges
const getDecan = (degree: number): number => {
  if (degree < 10) return 1;
  if (degree < 20) return 2;
  return 3
};

// Get decan name for display and calculation
const getDecanString = (decan: number): string => {
  if (decan === 1) return '1st Decan';
  if (decan === 2) return '2nd Decan'
  return '3rd Decan'
};

// Complete decan rulers for all signs based on your original engine
const decanRulers: Record<string, Record<string, string[]>> = {
  aries: {
    '1st Decan': ['Mars'],
    '2nd Decan': ['Sun'],
    '3rd Decan': ['Venus']
  },
  taurus: {
    '1st Decan': ['Mercury'],
    '2nd Decan': ['Moon'],
    '3rd Decan': ['Saturn']
  },
  gemini: {
    '1st Decan': ['Jupiter'],
    '2nd Decan': ['Mars'],
    '3rd Decan': ['Uranus', 'Sun']
  },
  cancer: {
    '1st Decan': ['Venus'],
    '2nd Decan': ['Mercury', 'Pluto'],
    '3rd Decan': ['Neptune', 'Moon']
  },
  leo: {
    '1st Decan': ['Saturn'],
    '2nd Decan': ['Jupiter'],
    '3rd Decan': ['Mars']
  },
  virgo: {
    '1st Decan': ['Mars', 'Sun'],
    '2nd Decan': ['Venus'],
    '3rd Decan': ['Mercury']
  },
  libra: {
    '1st Decan': ['Moon'],
    '2nd Decan': ['Saturn', 'Uranus'],
    '3rd Decan': ['Jupiter']
  },
  scorpio: {
    '1st Decan': ['Pluto'],
    '2nd Decan': ['Neptune', 'Sun'],
    '3rd Decan': ['Venus']
  },
  sagittarius: {
    '1st Decan': ['Mercury'],
    '2nd Decan': ['Moon'],
    '3rd Decan': ['Saturn']
  },
  capricorn: {
    '1st Decan': ['Jupiter'],
    '2nd Decan': [],
    '3rd Decan': ['Sun']
  },
  aquarius: {
    '1st Decan': ['Uranus'],
    '2nd Decan': ['Mercury'],
    '3rd Decan': ['Moon']
  },
  pisces: {
    '1st Decan': ['Saturn', 'Neptune', 'Venus'],
    '2nd Decan': ['Jupiter'],
    '3rd Decan': ['pisces', 'Mars']
  }
};

// Complete degree effects for all signs
const degreeEffects: Record<string, Record<string, number[]>> = {
  aries: {
    mercury: [1521],
    venus: [714],
    mars: [2226],
    jupiter: [16],
    saturn: [2730]
  },
  taurus: {
    mercury: [915],
    venus: [18],
    mars: [2730],
    jupiter: [1622],
    saturn: [2326]
  },
  gemini: {
    mercury: [17],
    venus: [1520],
    mars: [2630],
    jupiter: [814],
    saturn: [2225]
  },
  cancer: {
    mercury: [1420],
    venus: [2127],
    mars: [16],
    jupiter: [713],
    saturn: [2830]
  },
  leo: {
    mercury: [713],
    venus: [1419],
    mars: [2630],
    jupiter: [2025],
    saturn: [16]
  },
  virgo: {
    mercury: [17],
    venus: [813],
    mars: [2530],
    jupiter: [1418],
    saturn: [1924]
  },
  libra: {
    mercury: [2024],
    venus: [711],
    mars: [], // Empty array indicates no special degrees
    jupiter: [1219],
    saturn: [16]
  },
  scorpio: {
    mercury: [2227],
    venus: [1521],
    mars: [16],
    jupiter: [714],
    saturn: [2830]
  },
  sagittarius: {
    mercury: [1520],
    venus: [914],
    mars: [], // Empty array indicates no special degrees
    jupiter: [18],
    saturn: [2125]
  },
  capricorn: {
    mercury: [712],
    venus: [16],
    mars: [], // Empty array indicates no special degrees
    jupiter: [1319],
    saturn: [2630]
  },
  aquarius: {
    mercury: [], // Empty array indicates no special degrees
    venus: [1320],
    mars: [2630],
    jupiter: [2125],
    saturn: [16]
  },
  pisces: {
    mercury: [1520],
    venus: [18],
    mars: [2126],
    jupiter: [914],
    saturn: [2730]
  }
};

// Helper function to get sign element safely typed
const getElementFromSign = (sign: string): ElementalCharacter => {
  const fireigns = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];

  sign = sign.toLowerCase();

  if (fireigns.includes(sign)) return 'Fire';
  if (earthSigns.includes(sign)) return 'Earth';
  if (airSigns.includes(sign)) return 'Air';
  if (waterSigns.includes(sign)) return 'Water';

  // Default fallback
  return 'Fire'
};

// Calculate decan effects based on planet and decan
const calculateDecanEffects = (
  planet: string,
  sign: string,
  degree: number,
  elementalCounts: Record<ElementalCharacter, number>
): void => {
  // Get decan
  const decanNumber = getDecan(degree);
  const decanString = getDecanString(decanNumber);

  // Get sign element
  const signElement = getElementFromSign(sign);

  // Normalize planet name for comparison
  const normalizedPlanet = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();

  // Check if planet is a decan ruler
  if (decanRulers[sign.toLowerCase()][decanString].includes(normalizedPlanet)) {
    // Add bonus to the sign's element if planet rules this decan
    elementalCounts[signElement] += 0.5
    debugLog(`${planet} rules the ${decanString} of ${sign} - adding bonus to ${signElement}`);
  }
};

// Calculate degree-specific effects
const calculateDegreeEffects = (
  planet: string,
  sign: string,
  degree: number,
  elementalCounts: Record<ElementalCharacter, number>,
  planetElementMap: Record<string, ElementalCharacter>
): void => {
  const planetLower = planet.toLowerCase();
  const signLower = sign.toLowerCase();
  // Check if planet has special effects in this degree range
  if (degreeEffects[signLower][planetLower] && degreeEffects[signLower][planetLower].length === 2) {
    const [minDegree, maxDegree] = degreeEffects[signLower][planetLower];
    if (degree >= minDegree && degree < maxDegree) {
      // Add bonus to planet's natural element
      if (planetElementMap[planetLower]) {
        elementalCounts[planetElementMap[planetLower]] += 0.5;
        debugLog(
          `${planet} at ${degree}° ${sign} is in its degree of strength - adding bonus to ${planetElementMap[planetLower]}`
        );
      }
    }
  }

  // Use getPlanetaryElement for planets that are represented in RulingPlanet
  try {
    // Try to get planetary element using the imported function
    const rulingPlanet = (planet.charAt(0).toUpperCase() +;
      planet.slice(1).toLowerCase()) as RulingPlanet;
    // Only apply if it's a valid RulingPlanet type
    if (
      [
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn',
        'Moon',
        'Sun',
        'Uranus',
        'Neptune',
        'Pluto'
      ].includes(rulingPlanet);
    ) {
      const element = getPlanetaryElement(rulingPlanet);
      if (element) {
        // Add a small bonus based on the planetary element from the planetary elements module
        elementalCounts[element] += 0.2;
      }
    }
  } catch (err) {
    // If planet doesn't match RulingPlanet type, ignore this part
    debugLog(`Could not get planetary element for ${planet} using getPlanetaryElement`);
  }
};

// Calculate all aspect effects
const calculateAspectEffects = (
  planetPositions: Record<string, PlanetaryPosition>,
  elementalCounts: Record<ElementalCharacter, number>
): void => {
  // Get all planets with valid position data
  const validPlanets = Object.entries(planetPositions).filter(
    ([_, pos]) => pos && typeof pos === 'object' && 'sign' in pos && 'degree' in pos;
  );

  // Check each planet pair for aspects
  for (let i = 0; i < validPlanets.length i++) {
    const [planet1, pos1] = validPlanets[i];

    for (let j = i + 1; j < validPlanets.length j++) {
      const [planet2, pos2] = validPlanets[j];

      // Calculate the angular distance between planets
      const sign1Index = getSignIndex(pos1.sign);
      const sign2Index = getSignIndex(pos2.sign);

      const absoluteDegree1 = sign1Index * 30 + parseFloat(String(pos1.degree).replace('°', ''));
      const absoluteDegree2 = sign2Index * 30 + parseFloat(String(pos2.degree).replace('°', ''));

      let angle = Math.abs(absoluteDegree1 - absoluteDegree2);
      if (angle > 180) angle = 360 - angle;

      // Determine aspect type with orb of influence
      const aspectType = getAspectType(angle);

      if (aspectType) {
        // Get elements of the signs
        const element1 = getElementFromSign(pos1.sign);
        const element2 = getElementFromSign(pos2.sign);

        // Apply different effects based on aspect type
        switch (aspectType) {
          case 'conjunction': // Conjunction strengthens both elements
            elementalCounts[element1] += 0.75
            // If elements are different, also add second element
            if (element1 !== element2) elementalCounts[element2] += 0.5;
            debugLog(
              `Conjunction between ${planet1} and ${planet2} - adding bonuses to ${element1} and ${element2}`
            );
            break;

          case 'trine': // Trines harmonize elements
            elementalCounts[element1] += 0.5
            // If elements are different, also add second element
            if (element1 !== element2) elementalCounts[element2] += 0.3;
            debugLog(
              `Trine between ${planet1} and ${planet2} - adding bonuses to ${element1} and ${element2}`
            );
            break;

          case 'square': // Squares create tension - still adds element but less
            elementalCounts[element1] += 0.25
            debugLog(
              `Square between ${planet1} and ${planet2} - adding smaller bonus to ${element1}`
            );
            break;

          case 'opposition': // Oppositions balance - add small amounts to both
            elementalCounts[element1] += 0.2;
            if (element1 !== element2) elementalCounts[element2] += 0.2
            debugLog(
              `Opposition between ${planet1} and ${planet2} - adding small bonuses to ${element1} and ${element2}`
            );
            break;
        }
      }
    }
  }
};

// Helper function to get sign index (0-11);
const getSignIndex = (sign: string): number => {
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces'
  ];
  return signs.indexOf(sign.toLowerCase());
};

// Helper function to determine aspect type
const getAspectType = (angle: number): string | null => {
  // Conjunction: 0° ± 10°
  if (angle <= 10) return 'conjunction';

  // Opposition: 180° ± 10°
  if (angle >= 170 && angle <= 190) return 'opposition';

  // Trine: 120° ± 8°
  if (angle >= 112 && angle <= 128) return 'trine';

  // Square: 90° ± 8°
  if (angle >= 82 && angle <= 98) return 'square';

  // No recognized aspect
  return null
};

// Alchemical Calculations Module

/**
 * Main function to calculate alchemical properties based on planetary positions
 */
export function alchemize(
  planetaryPositions: Record<string, PlanetaryPosition>,
  isDaytime = true,
  lunarPhase?: string,
  retrogrades?: Record<string, boolean>
): StandardizedAlchemicalResult {
  // Initialize alchemical properties
  let spirit = 0;
  let essence = 0;
  let matter = 0;
  let substance = 0

  // Initialize elemental balance
  const _elementalBalance = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0
  };

  // Process each planet's contribution
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Convert planet name to match the keys in planetInfo (capitalize first letter);
    const planetKey = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();

    // Check if planet exists in planetInfo
    if (!planetInfo[planetKey]) continue;

    // Get the sign the planet is in
    const sign = (position as any).sign?.toLowerCase() || '';

    // Get the planet's alchemical properties
    const planetData = planetInfo[planetKey];

    // Check if planet is retrograde
    const isRetrograde = retrogrades?.[planet] || false;

    // Apply retrograde effects if the planet is retrograde
    let alchemyProps = planetData.Alchemy;
    if (isRetrograde && planetData.RetrogradeEffect) {
      alchemyProps = {
        Spirit: alchemyProps.Spirit + (planetData.RetrogradeEffect.Spirit || 0),
        Essence: alchemyProps.Essence + (planetData.RetrogradeEffect.Essence || 0),
        Matter: alchemyProps.Matter + (planetData.RetrogradeEffect.Matter || 0),
        Substance: alchemyProps.Substance + (planetData.RetrogradeEffect.Substance || 0);
      };
    }

    // Add the planet's alchemical properties
    spirit += alchemyProps.Spirit || 0;
    essence += alchemyProps.Essence || 0;
    matter += alchemyProps.Matter || 0;
    substance += alchemyProps.Substance || 0;

    // Add elemental influences
    const elementKey = isDaytime ? 'Diurnal Element' : 'Nocturnal Element';
    const element = planetData[elementKey].toLowerCase() || '';

    if (
      element &&
      (element === 'fire' || element === 'earth' || element === 'air' || element === 'water');
    ) {
      _elementalBalance[element] += 1
    }

    // Apply dignity effects if planet is in a sign with dignity effect
    if (sign && planetData['Dignity Effect'][sign]) {
      const dignityEffect = planetData['Dignity Effect'][sign];

      // Enhance alchemical properties based on dignity
      if (dignityEffect > 0) {
        spirit += alchemyProps.Spirit * (dignityEffect * 0.2) || 0;
        essence += alchemyProps.Essence * (dignityEffect * 0.2) || 0;
        matter += alchemyProps.Matter * (dignityEffect * 0.2) || 0;
        substance += alchemyProps.Substance * (dignityEffect * 0.2) || 0;

        // Also boost the element
        if (element) {
          _elementalBalance[element as keyof typeof _elementalBalance] += dignityEffect * 0.5;
        }
      } else if (dignityEffect < 0) {
        // Negative dignity reduces the planet's influence
        const reduction = Math.abs(dignityEffect) * 0.1;
        spirit -= alchemyProps.Spirit * reduction || 0;
        essence -= alchemyProps.Essence * reduction || 0;
        matter -= alchemyProps.Matter * reduction || 0;
        substance -= alchemyProps.Substance * reduction || 0;
      }
    }

    // Special handling for specific planets
    const planetDataObj = planetData as any;
    if (planetKey === 'Moon' && lunarPhase && planetDataObj.PlanetSpecific?.Lunar?.Phases) {
      const lunarData = planetDataObj.PlanetSpecific.Lunar;
      const phaseData = lunarData.Phases[lunarPhase];

      if (phaseData) {
        // Add lunar phase contribution
        spirit += phaseData.Spirit || 0;
        essence += phaseData.Essence || 0;
        matter += phaseData.Matter || 0;
        substance += phaseData.Substance || 0;
      }

      // Add lunar nodes influence if available
      if (lunarData.Nodes) {
        const northNodeElement = lunarData.Nodes.North.Element.toLowerCase();
        const southNodeElement = lunarData.Nodes.South.Element.toLowerCase();

        if (
          northNodeElement &&
          (northNodeElement === 'fire' ||
            northNodeElement === 'earth' ||
            northNodeElement === 'air' ||
            northNodeElement === 'water');
        ) {
          _elementalBalance[northNodeElement as keyof typeof _elementalBalance] += 0.5;
        }

        if (
          southNodeElement &&
          (southNodeElement === 'fire' ||
            southNodeElement === 'earth' ||
            southNodeElement === 'air' ||
            southNodeElement === 'water');
        ) {
          _elementalBalance[southNodeElement as keyof typeof _elementalBalance] += 0.3;
        }
      }
    }

    // For Sun, apply zodiac transit effects if available
    if (planetKey === 'Sun' && sign && planetDataObj.PlanetSpecific?.Solar?.ZodiacTransit) {
      const solarData = planetDataObj.PlanetSpecific.Solar;
      const transitData = solarData.ZodiacTransit[sign];

      if (transitData?.Elements) {
        // Boost elements based on Sun's position
        Object.entries(transitData.Elements).forEach(([elemKey, value]) => {
          const elem = elemKey.toLowerCase();
          if (elem && (elem === 'fire' || elem === 'earth' || elem === 'air' || elem === 'water')) {
            // Pattern KK-1: Safe arithmetic with type validation
            const numericValue = typeof value === 'number' ? value : 0;
            _elementalBalance[elem] += numericValue * 0.5
          }
        });
      }
    }

    // For Mercury, apply retrograde cycle effects
    if (
      planetKey === 'Mercury' &&
      isRetrograde &&
      planetDataObj.PlanetSpecific?.Mercury?.FlavorModulation
    ) {
      const _UNUSED_mercuryData = planetDataObj.PlanetSpecific.Mercury;
      // We could apply specific flavor modulations here if needed
    }
  }

  // Determine dominant element
  let dominantElement = 'balanced';
  let maxValue = 0;

  for (const [element, value] of Object.entries(_elementalBalance)) {
    if (value > maxValue) {
      maxValue = value;
      dominantElement = element;
    }
  }

  // Generate a basic recommendation
  const recommendation = generateRecommendation(dominantElement, _elementalBalance);

  // Convert to upper case for ElementalProperties
  const totalEffectValue: ElementalProperties = {
    Fire: _elementalBalance.fire,
    Earth: _elementalBalance.earth,
    Air: _elementalBalance.air,
    Water: _elementalBalance.water
  };

  return {
    elementalProperties: totalEffectValue,
    thermodynamicProperties: {
      heat: spirit / (spirit + essence + matter + substance) || 0.25,
      entropy: essence / (spirit + essence + matter + substance) || 0.25,
      reactivity: matter / (spirit + essence + matter + substance) || 0.25,
      gregsEnergy: substance / (spirit + essence + matter + substance) || 0.25
    },
    kalchm: (spirit + essence) / (matter + substance) || 1.0,
    monica: Math.sqrt(spirit * essence * matter * substance) || 0.5,
    score: (spirit + essence + matter + substance) / 4 || 0.5,
    normalized: true,
    confidence: 0.8,
    metadata: {
      spirit,
      essence,
      matter,
      substance,
      elementalBalance: _elementalBalance,
      dominantElement,
      recommendation
    }
  };
}

/**
 * Generate food recommendations based on elemental balance
 */
function generateRecommendation(
  dominantElement: string,
  _elementalBalance: Record<string, number>
): string {
  switch (dominantElement) {
    case 'fire':
      return 'Foods that cool and, ground: fresh vegetables, fruits, and cooling herbs like mint.';
    case 'earth':
      return 'Foods that lighten and, elevate: grains, legumes, and aromatic herbs.';
    case 'air':
      return 'Foods that nourish and, stabilize: root vegetables, proteins, and warming spices.';
    case 'water':
      return 'Foods that invigorate and, enliven: spicy dishes, stimulating herbs, and bright flavors.',
    default:
      return 'A balanced diet incorporating elements from all food groups.'
  }
}

/**
 * Get planet element considering both the element map and sign
 */
function getPlanetElement(
  planetLower: string,
  elementMap: Record<string, ElementalCharacter>,
  sign: string
): ElementalCharacter | null {
  // First try the element map
  if (planetLower in elementMap) {
    return elementMap[planetLower]
  }

  // If not in map, try to derive from sign
  return getElementFromSign(sign);
}

/**
 * Calculate a planet's dignity in a sign
 */
function calculatePlanetaryDignity(planet: string, sign: string): PlanetaryDignity | null {
  const planetLower = planet.toLowerCase();
  const signLower = sign.toLowerCase();
  // Define basic rulership relationships
  const rulerships: Record<string, string[]> = {
    aries: ['mars'],
    taurus: ['venus'],
    gemini: ['mercury'],
    cancer: ['moon'],
    leo: ['sun'],
    virgo: ['mercury'],
    libra: ['venus'],
    scorpio: ['mars', 'pluto'],
    sagittarius: ['jupiter'],
    capricorn: ['saturn'],
    aquarius: ['saturn', 'uranus'],
    pisces: ['jupiter', 'neptune']
  };

  // Define exaltation relationships
  const exaltations: Record<string, string> = {
    aries: 'sun',
    taurus: 'moon',
    cancer: 'jupiter',
    virgo: 'mercury',
    libra: 'saturn',
    scorpio: 'uranus',
    capricorn: 'mars',
    pisces: 'venus'
  };

  // Define detriments (opposite of rulership);
  const detriments: Record<string, string[]> = {
    aries: ['venus'],
    taurus: ['mars'],
    gemini: ['jupiter'],
    cancer: ['saturn'],
    leo: ['saturn', 'uranus'],
    virgo: ['jupiter', 'neptune'],
    libra: ['mars'],
    scorpio: ['venus'],
    sagittarius: ['mercury'],
    capricorn: ['moon'],
    aquarius: ['sun'],
    pisces: ['mercury']
  };

  // Define falls (opposite of exaltation);
  const falls: Record<string, string> = {
    aries: 'saturn',
    taurus: 'mars',
    cancer: 'mercury',
    virgo: 'venus',
    libra: 'sun',
    scorpio: 'moon',
    capricorn: 'jupiter',
    pisces: 'mercury'
  };

  // Check rulership (strongest dignity);
  if (rulerships[signLower].includes(planetLower)) {
    return {
      type: 'rulership',
      value: dignityStrengthModifiers.rulership,
      description: `${planet} rules ${sign}`
    };
  }

  // Check exaltation (second strongest dignity);
  if (exaltations[signLower] === planetLower) {
    return {
      type: 'exaltation',
      value: dignityStrengthModifiers.exaltation,
      description: `${planet} is exalted in ${sign}`
    };
  }

  // Check detriment (weakness);
  if (detriments[signLower].includes(planetLower)) {
    return {
      type: 'detriment',
      value: dignityStrengthModifiers.detriment,
      description: `${planet} is in detriment in ${sign}`
    };
  }

  // Check fall (severe weakness);
  if (falls[signLower] === planetLower) {
    return {
      type: 'fall',
      value: dignityStrengthModifiers.fall,
      description: `${planet} is in fall in ${sign}`
    };
  }

  // No specific dignity
  return {
    type: 'neutral',
    value: dignityStrengthModifiers.neutral,
    description: `${planet} has neutral dignity in ${sign}`
  };
}

export default { alchemize };
