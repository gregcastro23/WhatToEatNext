import { RulingPlanet, RULING_PLANETS } from '../constants/planets';
import { 
  getPlanetaryElement, 
  getPlanetaryAlchemicalProperty, 
  ElementalCharacter,
  AlchemicalProperty
} from '../constants/planetaryElements';
import {
  ElementalAlchemicalCounts,
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  countElementalAlchemicalProperties,
  thermodynamicCalculator,
  convertToElementalState
} from './gregsEnergy';
import { Planet } from '../constants/planetaryFoodAssociations';

/**
 * Represents planetary dignity types
 */
export type DignityType = 'rulership' | 'exaltation' | 'triplicity' | 'term' | 'face' | 'neutral' | 'detriment' | 'fall';

/**
 * Represents a planetary dignity
 */
export interface PlanetaryDignity {
  type: DignityType;
  value: number;
  description: string;
}

/**
 * Dignity strength modifiers based on traditional dignity types
 */
export const dignityStrengthModifiers: Record<DignityType, number> = {
  rulership: 1.5,  // +50% strength
  exaltation: 1.3, // +30% strength
  triplicity: 1.2, // +20% strength
  term: 1.1,       // +10% strength
  face: 1.05,      // +5% strength
  neutral: 1.0,    // no modification
  detriment: 0.7,  // -30% strength
  fall: 0.5        // -50% strength
};

/**
 * Interface representing the results of alchemical calculations
 */
export interface AlchemicalResults {
  elementalCounts: Record<ElementalCharacter, number>;
  alchemicalCounts: Record<AlchemicalProperty, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  planetaryDignities?: Record<string, PlanetaryDignity>;
  aspectEffects?: Record<string, number>;
}

/**
 * Calculate all alchemical properties based on planetary positions and day/night status
 * @param planetPositions Record of planetary positions or strengths
 * @param isDaytime Whether it's day or night
 * @param tarotElementBoosts Optional tarot-based elemental boosts
 * @param tarotPlanetaryBoosts Optional tarot-based planetary boosts
 * @param nutritionalBoosts Optional nutritional boosts
 * @returns Comprehensive alchemical results
 */
export const calculateAlchemicalProperties = (
  planetPositions: Record<RulingPlanet | Planet, any>,
  isDaytime: boolean,
  tarotElementBoosts?: Record<ElementalCharacter, number>,
  tarotPlanetaryBoosts?: Record<string, number>,
  nutritionalBoosts?: Record<string, number>
): AlchemicalResults => {
  // Initialize element counters
  const elementalCounts: Record<ElementalCharacter, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  };

  // Initialize alchemical property counters
  const alchemicalCounts: Record<AlchemicalProperty, number> = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  };

  // Track planetary dignities
  const planetaryDignities: Record<string, PlanetaryDignity> = {};
  
  // Track aspect effects
  const aspectEffects: Record<string, number> = {};

  // Directly log the planet positions to verify they exist
  console.log("Processing planetary positions:", planetPositions, "isDaytime:", isDaytime);
  let processingCount = 0;

  // Process planetary contributions to elements and alchemical properties
  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position) {
      console.warn(`Planet ${planet} has no position data, skipping`);
      continue;
    }

    processingCount++;
    console.log(`Processing planet #${processingCount}: ${planet}`, position);
    
    let element: ElementalCharacter;
    let property: AlchemicalProperty;

    // First, correctly determine the planetary element
    const validPlanet = planet as RulingPlanet;
    const planetElementMap: Record<string, ElementalCharacter> = {
      'Sun': 'Fire',
      'Moon': 'Water',
      'Mercury': isDaytime ? 'Air' : 'Earth',
      'Venus': 'Water',
      'Mars': 'Fire',
      'Jupiter': 'Air',
      'Saturn': 'Earth',
      'Uranus': 'Air',
      'Neptune': 'Water',
      'Pluto': 'Earth'
    };

    // Then, correctly determine the alchemical property
    const planetPropertyMap: Record<string, AlchemicalProperty> = {
      'Sun': 'Spirit',
      'Mars': 'Spirit',
      'Moon': 'Essence',
      'Venus': 'Essence',
      'Neptune': 'Essence',
      'Mercury': 'Substance',
      'Jupiter': 'Substance',
      'Uranus': 'Substance',
      'Saturn': 'Matter',
      'Pluto': 'Matter'
    };

    // Use the maps to set element and property
    if (planet in planetElementMap) {
      element = planetElementMap[planet];
    } else if (typeof position === 'object') {
      // Fallback to sign element if planet not in map
      let signName = '';
      
      if (position.sign) {
        signName = position.sign;
      } else if (typeof position === 'string' && position.match(/[♈♉♊♋♌♍♎♏♐♑♒♓]/)) {
        // Handle cases where the position is just a zodiac symbol
        const zodiacSymbols: Record<string, string> = {
          '♈': 'aries', '♉': 'taurus', '♊': 'gemini', '♋': 'cancer',
          '♌': 'leo', '♍': 'virgo', '♎': 'libra', '♏': 'scorpio',
          '♐': 'sagittarius', '♑': 'capricorn', '♒': 'aquarius', '♓': 'pisces'
        };
        signName = zodiacSymbols[position] || '';
      }
      
      if (signName) {
        element = getElementFromSign(signName);
        console.log(`Planet ${planet} using sign ${signName}, element: ${element}`);
      } else {
        // Last resort fallback
        element = planetElementMap[planet] || 'Fire';
        console.log(`Planet ${planet} using default element: ${element}`);
      }
    } else {
      // Last resort fallback
      element = ['Fire', 'Water', 'Air', 'Earth'][Math.floor(Math.random() * 4)] as ElementalCharacter;
      console.log(`Planet ${planet} using random element: ${element}`);
    }

    if (planet in planetPropertyMap) {
      property = planetPropertyMap[planet];
    } else {
      // Derive property from element if planet not in map
      property = elementToAlchemicalProperty(element);
    }

    console.log(`Planet ${planet} assigned element: ${element}, property: ${property}`);

    // Set a default strength if none can be calculated
    let strength = 0;
    
    // Determine the strength based on position data
    if (typeof position === 'number') {
      // Numeric value directly
      strength = position; 
      console.log(`Planet ${planet} has numeric position: ${strength}`);
    } else if (typeof position === 'object') {
      // If we have exact longitude or other data, process it
      if ('strength' in position) {
        strength = position.strength;
      } else if ('exactLongitude' in position) {
        const longitude = position.exactLongitude;
        // Base strength and apply modifiers
        strength = 0.5 + ((longitude % 30) / 60); // Gives 0.5-1.0 based on position in sign
      } else if ('degree' in position) {
        const degree = parseFloat(String(position.degree).replace('°', ''));
        strength = 0.5 + ((degree % 30) / 60); // Gives 0.5-1.0 based on position in sign
        console.log(`Planet ${planet} has degree ${degree}, calculated strength: ${strength}`);
      } else {
        // Default value if no other data
        strength = 0.5;
        console.log(`Planet ${planet} using default strength: ${strength}`);
      }
      
      console.log(`Planet ${planet} calculated strength: ${strength}`);
      
      // Calculate dignity if we have sign information
      if (position.sign && planet in RULING_PLANETS) {
        const planetDignity = getPlanetaryDignity(planet, position.sign);
        console.log(`Planet ${planet} dignity in ${position.sign}:`, planetDignity);
        
        // Store the dignity information
        planetaryDignities[planet] = planetDignity;
        
        // Adjust strength based on dignity
        strength *= dignityStrengthModifiers[planetDignity.type];
        console.log(`Planet ${planet} adjusted strength based on dignity: ${strength}`);
      }
    }
    
    // Apply tarot planetary boosts if available
    let tarotBoost = 1.0;
    if (tarotPlanetaryBoosts && planet in tarotPlanetaryBoosts) {
      tarotBoost += tarotPlanetaryBoosts[planet];
    }
    
    // Add to element count with the modified strength based on dignity
    const elementContribution = strength * tarotBoost;
    elementalCounts[element] += elementContribution;
    
    // Add to alchemical property count
    const propertyContribution = strength * tarotBoost;
    alchemicalCounts[property] += propertyContribution;
    
    // Add small contributions to other elements and properties based on the original algorithm
    // This creates a more nuanced profile rather than extreme values
    Object.keys(elementalCounts).forEach(elem => {
      if (elem !== element) {
        // Minor contribution to other elements (prevents 0 values)
        elementalCounts[elem as ElementalCharacter] += elementContribution * 0.15;
      }
    });
    
    Object.keys(alchemicalCounts).forEach(prop => {
      if (prop !== property) {
        // Minor contribution to other properties (prevents 0 values)
        alchemicalCounts[prop as AlchemicalProperty] += propertyContribution * 0.15;
      }
    });
  }
  
  // Apply tarot elemental boosts if available
  if (tarotElementBoosts) {
    for (const [element, boost] of Object.entries(tarotElementBoosts)) {
      if (element in elementalCounts && boost > 0) {
        elementalCounts[element as ElementalCharacter] += boost;
        
        // Also boost the corresponding alchemical property
        const property = elementToAlchemicalProperty(element as ElementalCharacter);
        alchemicalCounts[property] += boost * 0.8; // Slightly reduced impact on properties
      }
    }
  }

  // Apply day/night cycle adjustments
  if (isDaytime) {
    // Day enhances Fire and Air elements
    elementalCounts.Fire *= 1.2;
    elementalCounts.Air *= 1.1;
    // Day enhances Spirit and Substance properties
    alchemicalCounts.Spirit *= 1.2;
    alchemicalCounts.Substance *= 1.1;
  } else {
    // Night enhances Water and Earth elements
    elementalCounts.Water *= 1.2;
    elementalCounts.Earth *= 1.1;
    // Night enhances Essence and Matter properties
    alchemicalCounts.Essence *= 1.2;
    alchemicalCounts.Matter *= 1.1;
  }

  console.log("Final elemental counts before processing:", elementalCounts);
  console.log("Final alchemical counts before processing:", alchemicalCounts);

  // Ensure we have non-zero values before calculations
  for (const key in elementalCounts) {
    elementalCounts[key as ElementalCharacter] = Math.max(0.1, elementalCounts[key as ElementalCharacter]);
  }

  for (const key in alchemicalCounts) {
    alchemicalCounts[key as AlchemicalProperty] = Math.max(0.1, alchemicalCounts[key as AlchemicalProperty]);
  }

  // Create elemental state for thermodynamic calculator
  const combinedState = convertToElementalState({
    ...elementalCounts,
    ...alchemicalCounts
  });

  // Get dominant planet and set it for the calculator
  const dominantPlanet = getDominantPlanet(planetPositions, planetaryDignities);
  console.log("Dominant planet:", dominantPlanet);
  if (dominantPlanet) {
    thermodynamicCalculator.setPlanetaryInfluence(dominantPlanet as any);
  }

  // Calculate energy metrics using both methods for redundancy
  let energyMetrics;
  try {
    // Try using the thermodynamic calculator
    energyMetrics = thermodynamicCalculator.generateMetrics(combinedState);
    
    // Add detailed debug logging for heat calculation
    console.log("HEAT CALCULATION DEBUG:");
    console.log("Spirit value:", alchemicalCounts.Spirit);
    console.log("Fire value:", elementalCounts.Fire);
    console.log("Heat raw calculation:", (Math.pow(alchemicalCounts.Spirit * 1.5, 2) + Math.pow(elementalCounts.Fire * 1.3, 2)) / 
                Math.pow(alchemicalCounts.Substance + alchemicalCounts.Essence + alchemicalCounts.Matter + elementalCounts.Water + elementalCounts.Air + elementalCounts.Earth, 2));
    console.log("Heat from thermodynamic calculator:", energyMetrics.heat);
    
    // Verify values are valid and reasonable
    if (isNaN(energyMetrics.heat) || 
        isNaN(energyMetrics.entropy) || 
        isNaN(energyMetrics.reactivity) || 
        isNaN(energyMetrics.gregsEnergy)) {
      throw new Error("Invalid energy metric values detected");
    }
    
    console.log("Energy metrics from thermodynamic calculator:", energyMetrics);
  } catch (error) {
    console.error("Error calculating with thermodynamic calculator:", error);
    
    // Fallback to direct calculations using the original alchemizer formulas
    const spirit = alchemicalCounts.Spirit;
    const essence = alchemicalCounts.Essence;
    const matter = alchemicalCounts.Matter;
    const substance = alchemicalCounts.Substance;
    const fire = elementalCounts.Fire;
    const water = elementalCounts.Water;
    const air = elementalCounts.Air;
    const earth = elementalCounts.Earth;
    
    // Original formulas from alchemizer with boosted multipliers
    const heat = (Math.pow(spirit * 1.5, 2) + Math.pow(fire * 1.3, 2)) / 
                Math.pow(substance + essence + matter + water + air + earth, 2);
    
    // Add even more detailed debugging for fallback calculation
    console.log("HEAT FALLBACK CALCULATION DEBUG:");
    console.log("Spirit:", spirit, "Fire:", fire);
    console.log("Numerator:", (Math.pow(spirit * 1.5, 2) + Math.pow(fire * 1.3, 2)));
    console.log("Denominator:", Math.pow(substance + essence + matter + water + air + earth, 2));
    console.log("Raw heat result:", heat);
    // If heat is still too low, try boosting it more aggressively
    const boostedHeat = Math.max(0.1, heat * 2.0);
    console.log("Boosted heat result:", boostedHeat);
    
    const entropy = (Math.pow(spirit, 2) + Math.pow(substance, 2) + 
                    Math.pow(fire, 2) + Math.pow(air, 2)) / 
                    Math.pow(essence + matter + earth + water, 2);
    
    const reactivity = (Math.pow(spirit, 2) + Math.pow(substance, 2) + 
                       Math.pow(essence, 2) + Math.pow(fire, 2) + 
                       Math.pow(air, 2) + Math.pow(water, 2)) / 
                       Math.pow(matter + earth, 2);
    
    const gregsEnergy = heat - (reactivity * entropy);
    
    console.log("Original alchemizer formulas - inputs:", {
      spirit, essence, matter, substance, fire, water, air, earth
    });
    
    console.log("Original alchemizer formula results:", {
      heat, entropy, reactivity, gregsEnergy
    });
    
    // Still normalize to avoid extreme values that don't display well
    energyMetrics = {
      heat: boostedHeat, // Use boosted heat instead of original heat 
      entropy: entropy,
      reactivity: reactivity,
      gregsEnergy: gregsEnergy
    };
    
    console.log("Energy metrics from original alchemizer formulas (with boosting):", energyMetrics);
  }
  
  // Final safety check to ensure values are in a displayable range
  // Add this check to double the heat value if it's too low
  if (energyMetrics.heat <= 0.15) {
    console.log("Heat value too low, doubling it:", energyMetrics.heat, "->", energyMetrics.heat * 2);
    energyMetrics.heat *= 2; // Double the heat if it's too low
  }
  
  energyMetrics = {
    heat: isNaN(energyMetrics.heat) ? 0.5 : Math.max(0.1, Math.min(1.0, energyMetrics.heat)),
    entropy: isNaN(energyMetrics.entropy) ? 0.5 : Math.max(0.1, Math.min(1.0, energyMetrics.entropy)),
    reactivity: isNaN(energyMetrics.reactivity) ? 0.5 : Math.max(0.1, Math.min(1.0, energyMetrics.reactivity)),
    gregsEnergy: isNaN(energyMetrics.gregsEnergy) ? 0.5 : Math.max(0.1, Math.min(1.0, energyMetrics.gregsEnergy))
  };

  // Calculate percentages for elements
  const elementalPercentages = calculateElementalPercentages(elementalCounts);

  // Return both raw counts and percentages
  return {
    elementalCounts,  // Raw counts
    elementalPercentages,  // Percentage values
    alchemicalCounts,
    heat: energyMetrics.heat,
    entropy: energyMetrics.entropy, 
    reactivity: energyMetrics.reactivity,
    gregsEnergy: energyMetrics.gregsEnergy,
    planetaryDignities,
    aspectEffects
  };
};

/**
 * Get the diurnal element for a planet based on traditional associations
 */
export const getDiurnalElement = (planet: RulingPlanet): ElementalCharacter => {
  const diurnalElements: Record<RulingPlanet, ElementalCharacter> = {
    Sun: 'Fire',
    Moon: 'Water',
    Mercury: 'Air',
    Venus: 'Water',
    Mars: 'Fire',
    Jupiter: 'Air',
    Saturn: 'Air',
    Uranus: 'Water',
    Neptune: 'Water',
    Pluto: 'Earth'
  };
  
  return diurnalElements[planet];
};

/**
 * Get the nocturnal element for a planet based on traditional associations
 */
export const getNocturnalElement = (planet: RulingPlanet): ElementalCharacter => {
  const nocturnalElements: Record<RulingPlanet, ElementalCharacter> = {
    Sun: 'Fire',
    Moon: 'Water',
    Mercury: 'Earth',
    Venus: 'Earth',
    Mars: 'Water',
    Jupiter: 'Fire',
    Saturn: 'Earth',
    Uranus: 'Air',
    Neptune: 'Water',
    Pluto: 'Water'
  };
  
  return nocturnalElements[planet];
};

/**
 * Gets the planetary dignity for a given planet in a specific sign
 * @param planet The planet to check
 * @param sign The zodiac sign
 * @returns Planetary dignity information
 */
export const getPlanetaryDignity = (planet: string, sign: string): PlanetaryDignity => {
  // Standardize planet name
  const standardizedPlanet = planet.trim().toLowerCase().replace(/\s+/g, '');
  const formalPlanet = standardizedPlanet.charAt(0).toUpperCase() + standardizedPlanet.slice(1);
  
  // Standardize sign name
  const standardizedSign = sign.trim().toLowerCase().replace(/\s+/g, '');

  // Rulership mappings
  const rulershipMap: Record<string, string[]> = {
    'sun': ['leo'],
    'moon': ['cancer'],
    'mercury': ['gemini', 'virgo'],
    'venus': ['taurus', 'libra'],
    'mars': ['aries', 'scorpio'],
    'jupiter': ['sagittarius', 'pisces'],
    'saturn': ['capricorn', 'aquarius'],
    'uranus': ['aquarius'],
    'neptune': ['pisces'],
    'pluto': ['scorpio']
  };

  // Exaltation mappings
  const exaltationMap: Record<string, string> = {
    'sun': 'aries',
    'moon': 'taurus',
    'mercury': 'virgo',
    'venus': 'pisces',
    'mars': 'capricorn',
    'jupiter': 'cancer',
    'saturn': 'libra',
    'uranus': 'scorpio',
    'neptune': 'leo',
    'pluto': 'aquarius' 
  };

  // Detriment is opposite of rulership
  const detrimentMap: Record<string, string[]> = {
    'sun': ['aquarius'],
    'moon': ['capricorn'],
    'mercury': ['sagittarius', 'pisces'],
    'venus': ['aries', 'scorpio'],
    'mars': ['libra', 'taurus'],
    'jupiter': ['gemini', 'virgo'],
    'saturn': ['cancer', 'leo'],
    'uranus': ['leo'],
    'neptune': ['virgo'],
    'pluto': ['taurus']
  };

  // Fall is opposite of exaltation
  const fallMap: Record<string, string> = {
    'sun': 'libra',
    'moon': 'scorpio',
    'mercury': 'pisces',
    'venus': 'virgo',
    'mars': 'cancer',
    'jupiter': 'capricorn',
    'saturn': 'aries',
    'uranus': 'taurus',
    'neptune': 'aquarius',
    'pluto': 'leo'
  };

  // Check for each dignity type
  if (standardizedPlanet in rulershipMap && rulershipMap[standardizedPlanet].includes(standardizedSign)) {
    return {
      type: 'rulership',
      value: 5,
      description: `${formalPlanet} rules ${standardizedSign}`
    };
  }
  
  if (standardizedPlanet in exaltationMap && exaltationMap[standardizedPlanet] === standardizedSign) {
    return {
      type: 'exaltation',
      value: 4,
      description: `${formalPlanet} is exalted in ${standardizedSign}`
    };
  }
  
  if (standardizedPlanet in detrimentMap && detrimentMap[standardizedPlanet].includes(standardizedSign)) {
    return {
      type: 'detriment',
      value: 2,
      description: `${formalPlanet} is in detriment in ${standardizedSign}`
    };
  }
  
  if (standardizedPlanet in fallMap && fallMap[standardizedPlanet] === standardizedSign) {
    return {
      type: 'fall',
      value: 1,
      description: `${formalPlanet} falls in ${standardizedSign}`
    };
  }

  // Default to neutral
  return {
    type: 'neutral',
    value: 3,
    description: `${formalPlanet} is neutral in ${standardizedSign}`
  };
};

/**
 * Calculate aspect effects between planets
 */
export const calculateAspectEffects = (
  aspects: Array<{planet1: string, planet2: string, type: string, angle: number}>,
  planetPositions: Record<string, any>
): Record<string, number> => {
  const aspectEffects: Record<string, number> = {};
  
  aspects.forEach(aspect => {
    const planet1 = aspect.planet1;
    const planet2 = aspect.planet2;
    const aspectType = aspect.type.toLowerCase();
    const aspectKey = `${planet1}_${planet2}_${aspectType}`;
    
    // Get sign elements for both planets
    let planet1Element = '';
    let planet2Element = '';
    
    if (planetPositions[planet1]?.sign) {
      const sign1 = planetPositions[planet1].sign.toLowerCase();
      planet1Element = getElementFromSign(sign1);
    }
    
    if (planetPositions[planet2]?.sign) {
      const sign2 = planetPositions[planet2].sign.toLowerCase();
      planet2Element = getElementFromSign(sign2);
    }
    
    // Calculate aspect effect based on type
    let effectValue = 0;
    
    if (aspectType === 'conjunction') {
      // Conjunction gives +2 to the sign element
      effectValue = 2;
    } else if (aspectType === 'opposition') {
      // Opposition gives -2 to the sign element
      effectValue = -2;
    } else if (aspectType === 'trine') {
      // Trine gives +1 to the sign element
      effectValue = 1;
    } else if (aspectType === 'square') {
      // Square gives -1 to the sign element for most planets
      // But +1 if the Ascendant is involved
      if (planet1 === 'ascendant' || planet2 === 'ascendant') {
        effectValue = 1;
      } else {
        effectValue = -1;
      }
    }
    
    // Store the effect
    aspectEffects[aspectKey] = effectValue;
  });
  
  return aspectEffects;
};

/**
 * Get element from zodiac sign
 */
const getElementFromSign = (sign: string): ElementalCharacter => {
  const lowerSign = sign.toLowerCase();
  
  if (lowerSign.includes('aries') || lowerSign.includes('leo') || lowerSign.includes('sagittarius')) {
    return 'Fire';
  } else if (lowerSign.includes('taurus') || lowerSign.includes('virgo') || lowerSign.includes('capricorn')) {
    return 'Earth';
  } else if (lowerSign.includes('gemini') || lowerSign.includes('libra') || lowerSign.includes('aquarius')) {
    return 'Air';
  } else if (lowerSign.includes('cancer') || lowerSign.includes('scorpio') || lowerSign.includes('pisces')) {
    return 'Water';
  }
  
  // Default fallback
  return 'Fire';
};

/**
 * Detect stelliums in chart
 * A stellium is 3 or more planets in the same sign
 */
export const detectStelliums = (
  planetPositions: Record<string, any>
): Array<{sign: string, planets: string[], effect: Record<ElementalCharacter, number>}> => {
  // Group planets by sign
  const planetsBySign: Record<string, string[]> = {};
  
  Object.entries(planetPositions).forEach(([planet, position]) => {
    if (typeof position === 'object' && position.sign) {
      const sign = position.sign.toLowerCase();
      if (!planetsBySign[sign]) {
        planetsBySign[sign] = [];
      }
      planetsBySign[sign].push(planet);
    }
  });
  
  // Find stelliums (3+ planets in same sign)
  const stelliums = [];
  
  for (const [sign, planets] of Object.entries(planetsBySign)) {
    if (planets.length >= 3) {
      // Calculate stellium effect following the original algorithm
      const signElement = getElementFromSign(sign);
      const effect: Record<ElementalCharacter, number> = {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      };
      
      // 1. Bonus of +n of element of sign
      effect[signElement] += planets.length;
      
      // 2. Bonus for matching elements:
      // Each planet whose element matches the sign gets a bonus of (1 + m)
      // where m is the number of other planets with a matching element
      let matchingPlanets = 0;
      planets.forEach(planet => {
        if (planet in RULING_PLANETS) {
          const planetElement = getPlanetaryElement(planet as RulingPlanet);
          if (planetElement === signElement) {
            matchingPlanets++;
          }
        }
      });
      
      // Add the matching element bonus
      if (matchingPlanets > 0) {
        let bonus = 0;
        for (let i = 0; i < matchingPlanets; i++) {
          bonus += (1 + i); // 1 for first match, 1+1 for second, 1+2 for third, etc.
        }
        effect[signElement] += bonus;
      }
      
      // 3. Add bonus for non-matching elements
      planets.forEach(planet => {
        if (planet in RULING_PLANETS) {
          const planetElement = getPlanetaryElement(planet as RulingPlanet);
          if (planetElement !== signElement) {
            effect[planetElement] += 1; // Add 1 to each planet's element
          }
        }
      });
      
      stelliums.push({
        sign,
        planets,
        effect
      });
    }
  }
  
  return stelliums;
};

/**
 * Properly normalizes values in a record to ensure they add up to 1.0
 * while maintaining their relative proportions
 */
export const normalizeValues = <T extends string>(record: Record<T, number>): void => {
  const total = Object.values(record).reduce((sum, val) => sum + val, 0);
  if (total === 0) return;
  
  // Normalize all values to sum to 1.0
  for (const key in record) {
    record[key] = record[key] / total;
  }
};

/**
 * Balances values in a record without fully normalizing
 * This preserves the relative magnitudes while preventing any one value from dominating
 */
export const balanceValues = <T extends string>(record: Record<T, number>): void => {
  const values: number[] = Object.values(record);
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total === 0) return;
  
  // Check if any value is disproportionately high (more than 70% of total)
  const max = Math.max(...values);
  if (max / total > 0.7) {
    // Apply a softer normalization that brings values closer together
    // without completely equalizing them
    for (const key in record) {
      if (record[key] === max) {
        record[key] = record[key] * 0.7; // Reduce dominant value
      } else {
        record[key] = record[key] * 1.1; // Boost smaller values
      }
    }
  }
};

/**
 * Determines the dominant element based on counts
 */
export const getDominantElement = (elementalCounts: Record<ElementalCharacter, number>): ElementalCharacter => {
  let dominant: ElementalCharacter = 'Fire';
  let maxCount = -1;
  
  (Object.entries(elementalCounts) as [ElementalCharacter, number][]).forEach(([element, count]) => {
    if (count > maxCount) {
      dominant = element;
      maxCount = count;
    }
  });
  
  return dominant;
};

/**
 * Determines the dominant alchemical property based on counts
 */
export const getDominantAlchemicalProperty = (alchemicalCounts: Record<AlchemicalProperty, number>): AlchemicalProperty => {
  let dominant: AlchemicalProperty = 'Spirit';
  let maxCount = -1;
  
  (Object.entries(alchemicalCounts) as [AlchemicalProperty, number][]).forEach(([prop, count]) => {
    if (count > maxCount) {
      dominant = prop;
      maxCount = count;
    }
  });
  
  return dominant;
};

/**
 * Maps an elemental character to a corresponding alchemical property
 */
function elementToAlchemicalProperty(element: ElementalCharacter): AlchemicalProperty {
  // Define mapping between elements and properties
  const mapping: Record<ElementalCharacter, AlchemicalProperty> = {
    Fire: 'Spirit',
    Water: 'Essence',
    Earth: 'Matter',
    Air: 'Substance'
  };
  
  return mapping[element];
}

// Add this mapping function to convert dignity types to their effect values
// This matches the original planetInfo["Dignity Effect"] values from alchemize
function mapDignityTypeToEffectValue(planet: string, sign: string, dignityType: DignityType): number {
  // Following the original algorithm's values
  switch(dignityType) {
    case 'rulership': return 1;  // Rulership is +1
    case 'exaltation': return 2; // Exaltation is +2
    case 'neutral': return 0;    // Neutral is 0 (no effect)
    case 'detriment': return -1; // Detriment is -1
    case 'fall': return -2;      // Fall is -2
    default: return 0;
  }
}

/**
 * Determine the dominant planet based on position and dignity
 */
function getDominantPlanet(
  planetPositions: Record<string, any>,
  planetaryDignities: Record<string, PlanetaryDignity>
): string | null {
  let strongestPlanet = null;
  let highestScore = -1;
  
  Object.entries(planetaryDignities).forEach(([planet, dignity]) => {
    let score = 0;
    
    // Base score on dignity type
    switch(dignity.type) {
      case 'rulership': score = 5; break;
      case 'exaltation': score = 4; break;
      case 'triplicity': score = 3; break;
      case 'term': score = 2; break;
      case 'face': score = 1; break;
      case 'neutral': score = 0; break;
      case 'detriment': score = -1; break;
      case 'fall': score = -2; break;
    }
    
    // Add bonus for luminaries (Sun and Moon)
    if (planet === 'Sun') score += 2;
    if (planet === 'Moon') score += 1;
    
    // Check if this is the strongest planet so far
    if (score > highestScore) {
      highestScore = score;
      strongestPlanet = planet;
    }
  });
  
  return strongestPlanet;
}

// Add a specific normalization function for elemental percentages
export const calculateElementalPercentages = (elementalCounts: Record<ElementalCharacter, number>): Record<ElementalCharacter, number> => {
  const totalElemental = 
    elementalCounts.Fire + 
    elementalCounts.Water + 
    elementalCounts.Earth + 
    elementalCounts.Air;
  
  if (totalElemental <= 0) {
    // Return actual zeros instead of default 25%
    return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  }
  
  return {
    Fire: Math.round((elementalCounts.Fire / totalElemental) * 100),
    Water: Math.round((elementalCounts.Water / totalElemental) * 100),
    Earth: Math.round((elementalCounts.Earth / totalElemental) * 100),
    Air: Math.round((elementalCounts.Air / totalElemental) * 100)
  };
}; 