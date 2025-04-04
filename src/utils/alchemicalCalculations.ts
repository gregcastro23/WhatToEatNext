import type { PlanetaryPositionsType } from '@/contexts/AlchemicalContext/context';

// Map elements to zodiac signs
const signElements: Record<string, string> = {
  'aries': 'Fire',
  'leo': 'Fire',
  'sagittarius': 'Fire',
  'taurus': 'Earth',
  'virgo': 'Earth',
  'capricorn': 'Earth',
  'gemini': 'Air',
  'libra': 'Air',
  'aquarius': 'Air',
  'cancer': 'Water',
  'scorpio': 'Water',
  'pisces': 'Water'
};

// Map planets to their alchemical properties
const planetAlchemicalProperties: Record<string, Record<string, number>> = {
  'sun': { Spirit: 1.0, Essence: 0.3, Matter: 0.1, Substance: 0.2 },
  'moon': { Spirit: 0.2, Essence: 0.8, Matter: 0.7, Substance: 0.3 },
  'mercury': { Spirit: 0.7, Essence: 0.4, Matter: 0.2, Substance: 0.8 },
  'venus': { Spirit: 0.3, Essence: 0.9, Matter: 0.6, Substance: 0.2 },
  'mars': { Spirit: 0.4, Essence: 0.7, Matter: 0.8, Substance: 0.3 },
  'jupiter': { Spirit: 0.8, Essence: 0.6, Matter: 0.3, Substance: 0.4 },
  'saturn': { Spirit: 0.6, Essence: 0.2, Matter: 0.9, Substance: 0.5 },
  'uranus': { Spirit: 0.9, Essence: 0.5, Matter: 0.2, Substance: 0.7 },
  'neptune': { Spirit: 0.7, Essence: 0.8, Matter: 0.1, Substance: 0.9 },
  'pluto': { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
};

// Calculate elemental values based on planetary positions
export function calculateElementalValues(positions: PlanetaryPositionsType) {
  const elements = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };
  
  // Count planets by element
  Object.entries(positions).forEach(([planet, data]) => {
    if (!data.sign || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {
      return;
    }
    
    const signKey = data.sign.toLowerCase();
    const element = signElements[signKey] || 'balanced';
    
    // Only add to elements if it's a valid element key
    if (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air') {
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
  const alchemicalValues = {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  };
  
  let totalWeight = 0;
  
  Object.entries(positions).forEach(([planet, data]) => {
    if (!data || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {
      return;
    }
    
    const properties = planetAlchemicalProperties[planet];
    if (!properties) return;
    
    // Weight by planetary dignity
    let dignityMultiplier = 1.0;
    if (data.sign) {
      // Simple dignity check
      if (
        (planet === 'sun' && data.sign === 'leo') ||
        (planet === 'moon' && data.sign === 'cancer') ||
        (planet === 'mercury' && (data.sign === 'gemini' || data.sign === 'virgo')) ||
        (planet === 'venus' && (data.sign === 'taurus' || data.sign === 'libra')) ||
        (planet === 'mars' && (data.sign === 'aries' || data.sign === 'scorpio')) ||
        (planet === 'jupiter' && (data.sign === 'sagittarius' || data.sign === 'pisces')) ||
        (planet === 'saturn' && (data.sign === 'capricorn' || data.sign === 'aquarius')) ||
        (planet === 'uranus' && data.sign === 'aquarius') ||
        (planet === 'neptune' && data.sign === 'pisces') ||
        (planet === 'pluto' && data.sign === 'scorpio')
      ) {
        dignityMultiplier = 1.5; // Domicile or rulership
      } else if (
        (planet === 'sun' && data.sign === 'aries') ||
        (planet === 'moon' && data.sign === 'taurus') ||
        (planet === 'jupiter' && data.sign === 'cancer') ||
        (planet === 'venus' && data.sign === 'pisces')
      ) {
        dignityMultiplier = 1.3; // Exaltation
      } else if (
        (planet === 'venus' && data.sign === 'virgo') ||
        (planet === 'mercury' && data.sign === 'pisces') ||
        (planet === 'mars' && data.sign === 'cancer') ||
        (planet === 'jupiter' && data.sign === 'capricorn')
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
  const elements = {
    Fire: 0.25,
    Earth: 0.25,
    Air: 0.25, 
    Water: 0.25
  };
  
  if (!positions || Object.keys(positions).length === 0) {
    return elements;
  }
  
  let totalWeight = 0;
  let elementsFound = false;
  
  Object.entries(positions).forEach(([planet, data]) => {
    if (!data || !data.sign || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {
      return;
    }
    
    const signKey = data.sign.toLowerCase();
    const element = signElements[signKey];
    
    // Only proceed if it's a valid element
    if (element && (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air')) {
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
  
  // Apply a fallback distribution to avoid single-element domination
  return {
    Fire: 0.25,
    Earth: 0.25, 
    Air: 0.25,
    Water: 0.25
  };
} 