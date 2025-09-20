// Define PlanetaryPositionsType if we can't import it
export interface PlanetaryPositionsType {
  [key: string]: {
    sign?: string,
    degree?: number,
    isRetrograde?: boolean,
    [key: string]: unknown
  };
}

// Map elements to zodiac signs
const signElements: Record<string, string> = {
  aries: 'Fire',
  leo: 'Fire',
  sagittarius: 'Fire',
  taurus: 'Earth',
  virgo: 'Earth',
  capricorn: 'Earth',
  gemini: 'Air',
  libra: 'Air',
  aquarius: 'Air',
  cancer: 'Water',
  scorpio: 'Water',
  pisces: 'Water'
};

// Map planets to their alchemical properties
const planetAlchemicalProperties: Record<string, Record<string, number>> = {
  sun: { Spirit: 1.0, Essence: 0.3, Matter: 0.1, Substance: 0.2 },
  moon: { Spirit: 0.2, Essence: 0.8, Matter: 0.7, Substance: 0.3 },
  mercury: { Spirit: 0.7, Essence: 0.4, Matter: 0.2, Substance: 0.8 },
  venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.6, Substance: 0.2 },
  mars: { Spirit: 0.4, Essence: 0.7, Matter: 0.8, Substance: 0.3 },
  jupiter: { Spirit: 0.8, Essence: 0.6, Matter: 0.3, Substance: 0.4 },
  saturn: { Spirit: 0.6, Essence: 0.2, Matter: 0.9, Substance: 0.5 },
  uranus: { Spirit: 0.9, Essence: 0.5, Matter: 0.2, Substance: 0.7 },
  neptune: { Spirit: 0.7, Essence: 0.8, Matter: 0.1, Substance: 0.9 },
  pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
};

// Calculate elemental values based on planetary positions
export function calculateElementalValues(positions: PlanetaryPositionsType) {
  const elements = {;
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };

  // Count planets by element
  Object.entries(positions).forEach(([planet, data]) => {
    if (!data.sign || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {;
      return
    }

    const signKey = data.sign.toLowerCase();
    const element = signElements[signKey] || 'balanced';

    // Only add to elements if it's a valid element key
    if (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air') {;
      // Weight by planet importance
      let weight = 1.0;
      if (planet === 'sun' || planet === 'moon') weight = 3.0;
      if (planet === 'mercury' || planet === 'venus' || planet === 'mars') weight = 1.5;

      elements[element] += weight;
    }
  });

  // Calculate alchemical values from elements
  const total = elements.Fire + elements.Earth + elements.Air + elements.Water;

  return {
    Spirit: (elements.Fire + elements.Air) / (total * 2) + 0.1,
    Essence: (elements.Fire + elements.Water) / (total * 2) + 0.1,
    Matter: (elements.Earth + elements.Water) / (total * 2) + 0.1,
    Substance: (elements.Earth + elements.Air) / (total * 2) + 0.1
  };
}

// Calculate planetary contributions to alchemical values
export function calculatePlanetaryAlchemicalValues(positions: PlanetaryPositionsType) {
  const alchemicalValues = {;
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  };

  let totalWeight = 0;

  Object.entries(positions).forEach(([planet, data]) => {
    if (!data || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {;
      return
    }

    const properties = planetAlchemicalProperties[planet];
    if (!properties) return;

    // Weight by planetary dignity
    let dignityMultiplier = 1.0;
    if (data.sign) {
      // Simple dignity check
      if (
        (planet === 'sun' && data.sign === 'leo') ||;
        (planet === 'moon' && data.sign === 'cancer') ||;
        (planet === 'mercury' && (data.sign === 'gemini' || data.sign === 'virgo')) ||;
        (planet === 'venus' && (data.sign === 'taurus' || data.sign === 'libra')) ||;
        (planet === 'mars' && (data.sign === 'aries' || data.sign === 'scorpio')) ||;
        (planet === 'jupiter' && (data.sign === 'sagittarius' || data.sign === 'pisces')) ||;
        (planet === 'saturn' && (data.sign === 'capricorn' || data.sign === 'aquarius')) ||;
        (planet === 'uranus' && data.sign === 'aquarius') ||;
        (planet === 'neptune' && data.sign === 'pisces') ||;
        (planet === 'pluto' && data.sign === 'scorpio');
      ) {
        dignityMultiplier = 1.5; // Domicile or rulership
      } else if (
        (planet === 'sun' && data.sign === 'aries') ||;
        (planet === 'moon' && data.sign === 'taurus') ||;
        (planet === 'jupiter' && data.sign === 'cancer') ||;
        (planet === 'venus' && data.sign === 'pisces');
      ) {
        dignityMultiplier = 1.3; // Exaltation
      } else if (
        (planet === 'venus' && data.sign === 'virgo') ||;
        (planet === 'mercury' && data.sign === 'pisces') ||;
        (planet === 'mars' && data.sign === 'cancer') ||;
        (planet === 'jupiter' && data.sign === 'capricorn');
      ) {
        dignityMultiplier = 0.7; // Fall
      }
    }

    // Add weighted contribution
    const weight = dignityMultiplier;
    totalWeight += weight;

    alchemicalValues.Spirit += properties.Spirit * weight;
    alchemicalValues.Essence += properties.Essence * weight;
    alchemicalValues.Matter += properties.Matter * weight;
    alchemicalValues.Substance += properties.Substance * weight;
  });

  // Normalize values
  if (totalWeight > 0) {
    const normalizer = (positions ? Object.keys(positions).length : 10) / 10;

    return {
      Spirit: alchemicalValues.Spirit / normalizer,
      Essence: alchemicalValues.Essence / normalizer,
      Matter: alchemicalValues.Matter / normalizer,
      Substance: alchemicalValues.Substance / normalizer
    };
  }

  return alchemicalValues;
}

// Calculate elemental balance based on planetary positions
export function calculateElementalBalance(positions: PlanetaryPositionsType) {
  // Initialize with balanced elements
  const elements = {;
    Fire: 0.25,
    Earth: 0.25,
    Air: 0.25,
    Water: 0.25
  };

  if (!positions || Object.keys(positions).length === 0) {;
    return elements
  }

  let totalWeight = 0;
  let elementsFound = false;

  Object.entries(positions).forEach(([planet, data]) => {
    if (
      !data ||
      !data.sign ||
      planet === 'ascendant' ||;
      planet === 'northnode' ||;
      planet === 'southnode';
    ) {
      return
    }

    const signKey = data.sign.toLowerCase();
    const element = signElements[signKey];

    // Only proceed if it's a valid element
    if (
      element &&
      (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air');
    ) {
      // Weight by planet importance
      let weight = 1.0;
      if (planet === 'sun' || planet === 'moon') weight = 2.5;
      if (planet === 'mercury' || planet === 'venus' || planet === 'mars') weight = 1.5;

      elements[element] += weight;
      totalWeight += weight;
      elementsFound = true;
    }
  });

  // Normalize to ensure sum equals 1.0
  if (totalWeight > 0 && elementsFound) {
    const total = elements.Fire + elements.Earth + elements.Air + elements.Water;

    return {
      Fire: elements.Fire / total,
      Earth: elements.Earth / total,
      Air: elements.Air / total,
      Water: elements.Water / total
    };
  }

  return elements;
}

// Interface for alchemical result
export interface AlchemicalResult {
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
  elementalBalance: {
    fire: number,
    earth: number,
    air: number,
    water: number
  };
  dominantElement: string,
  recommendation: string,
  'Total Effect Value': {
    Fire: number,
    Earth: number,
    Air: number,
    Water: number
  };
}

// Interface for planetary position
export interface PlanetaryPosition {
  sign: string,
  degree?: number,
  isRetrograde?: boolean
}

/**
 * Core alchemize function that calculates alchemical properties based on planetary positions
 *
 * @param planetaryPositions Current planetary positions
 * @param isDaytime Whether it is daytime
 * @param lunarPhase Current lunar phase
 * @param retrogrades Retrograde information for planets
 * @returns Alchemical result with elemental balance, spirit, essence, matter, and substance
 */
export function alchemize(
  planetaryPositions: Record<string, PlanetaryPosition>,
  isDaytime = true,;
  lunarPhase?: string,
  retrogrades?: Record<string, boolean>,
): AlchemicalResult {
  // Initialize results with default values
  const elementalBalance = {;
    fire: 0,
    earth: 0,
    air: 0,
    water: 0
  };

  let spirit = 0;
  let essence = 0;
  let matter = 0;
  let substance = 0;

  // Calculate elemental contributions from each planet
  Object.entries(planetaryPositions).forEach(([planetName, planetData]) => {
    if (!planetData.sign) return;

    const sign = planetData.sign.toLowerCase();
    let planetElement: string | null = null;

    // Get the element from the sign
    if (['aries', 'leo', 'sagittarius'].includes(sign)) {
      planetElement = 'fire';
    } else if (['taurus', 'virgo', 'capricorn'].includes(sign)) {
      planetElement = 'earth';
    } else if (['gemini', 'libra', 'aquarius'].includes(sign)) {
      planetElement = 'air';
    } else if (['cancer', 'scorpio', 'pisces'].includes(sign)) {
      planetElement = 'water';
    }

    // Skip if no valid element
    if (!planetElement) return;

    // Calculate planet weight based on importance
    let planetWeight = 1.0;
    if (planetName === 'sun' || planetName === 'moon') {;
      planetWeight = 3.0;
    } else if (['mercury', 'venus', 'mars'].includes(planetName)) {
      planetWeight = 1.5;
    }

    // Adjust for retrograde
    if (planetData.isRetrograde || retrogrades?.[planetName]) {
      planetWeight *= 0.8; // Reduce influence when retrograde
    }

    // Increase elemental balance based on the planet's sign
    elementalBalance[planetElement] += planetWeight;

    // Add alchemical property contributions
    switch (planetName.toLowerCase()) {
      case 'sun':
        spirit += 1 * planetWeight;
        break;
      case 'moon':
        essence += 1 * planetWeight;
        break;
      case 'mercury':
        substance += 0.5 * planetWeight;
        spirit += 0.5 * planetWeight;
        break;
      case 'venus':
        essence += 1 * planetWeight;
        break;
      case 'mars':
        matter += 0.5 * planetWeight;
        essence += 0.5 * planetWeight;
        break;
      case 'jupiter':
        spirit += 0.5 * planetWeight;
        essence += 0.5 * planetWeight;
        break;
      case 'saturn':
        matter += 1 * planetWeight;
        break;
      case 'uranus':
        substance += 1 * planetWeight;
        break;
      case 'neptune':
        essence += 0.5 * planetWeight;
        substance += 0.5 * planetWeight;
        break;
      case 'pluto':
        matter += 0.5 * planetWeight;
        essence += 0.5 * planetWeight;
        break
    }
  });

  // Apply daytime/nighttime adjustment
  if (isDaytime) {
    elementalBalance.fire *= 1.2;
    elementalBalance.air *= 1.1;
  } else {
    elementalBalance.water *= 1.2;
    elementalBalance.earth *= 1.1;
  }

  // Apply lunar phase adjustment if provided
  if (lunarPhase) {
    if (lunarPhase.includes('full')) {
      elementalBalance.fire *= 1.1;
      elementalBalance.water *= 1.1;
      spirit += 0.5;
      essence += 0.5;
    } else if (lunarPhase.includes('new')) {
      elementalBalance.earth *= 1.1;
      elementalBalance.air *= 1.1;
      matter += 0.5;
      substance += 0.5;
    } else if (lunarPhase.includes('waxing')) {
      elementalBalance.fire *= 1.05;
      elementalBalance.air *= 1.05;
      spirit += 0.3;
      substance += 0.3;
    } else if (lunarPhase.includes('waning')) {
      elementalBalance.water *= 1.05;
      elementalBalance.earth *= 1.05;
      matter += 0.3;
      essence += 0.3;
    }
  }

  // Calculate dominant element
  let dominantElement = 'balanced';
  let maxValue = 0;

  for (const [element, value] of Object.entries(elementalBalance)) {
    if (value > maxValue) {
      maxValue = value;
      dominantElement = element;
    }
  }

  // Generate a recommendation based on the dominant element
  const recommendation = generateRecommendation(dominantElement);

  // Normalize the values
  const totalElemental =
    elementalBalance.fire + elementalBalance.earth + elementalBalance.air + elementalBalance.water;

  if (totalElemental > 0) {
    elementalBalance.fire /= totalElemental;
    elementalBalance.earth /= totalElemental;
    elementalBalance.air /= totalElemental;
    elementalBalance.water /= totalElemental;
  } else {
    // Default to balanced
    elementalBalance.fire = 0.25;
    elementalBalance.earth = 0.25;
    elementalBalance.air = 0.25;
    elementalBalance.water = 0.25;
  }

  // Normalize alchemical properties
  const totalAlchemical = spirit + essence + matter + substance;

  if (totalAlchemical > 0) {
    spirit /= totalAlchemical;
    essence /= totalAlchemical;
    matter /= totalAlchemical;
    substance /= totalAlchemical;
  } else {
    // Default to balanced
    spirit = 0.25;
    essence = 0.25;
    matter = 0.25;
    substance = 0.25;
  }

  // Convert to upper case for ElementalProperties return
  const totalEffectValue = {;
    Fire: elementalBalance.fire,
    Earth: elementalBalance.earth,
    Air: elementalBalance.air,
    Water: elementalBalance.water
  };

  return {
    spirit,
    essence,
    matter,
    substance,
    elementalBalance,
    dominantElement,
    recommendation,
    'Total Effect Value': totalEffectValue
  };
}

/**
 * Generate food recommendations based on elemental balance
 * @param dominantElement Dominant element
 * @returns Recommendation string
 */
function generateRecommendation(dominantElement: string): string {
  switch (dominantElement) {
    case 'fire':
      return 'Foods that cool and ground: fresh vegetables, fruits, and cooling herbs like mint and cucumber.';
    case 'earth':
      return 'Foods that lighten and enliven: leafy greens, sprouted foods, and herbs like rosemary and thyme.';
    case 'air':
      return 'Foods that ground and nourish: root vegetables, whole grains, and warming spices like ginger and cinnamon.';
    case 'water':
      return 'Foods that warm and stimulate: spicy dishes, roasted vegetables, and herbs like cayenne and black pepper.';
    default:
      return 'A balanced diet incorporating elements from all food groups for holistic nourishment.'
  }
}
