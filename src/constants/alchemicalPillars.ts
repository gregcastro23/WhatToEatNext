import { AlchemicalProperty , Element } from '../types/celestial';

/**
 * Interface representing an Alchemical Pillar
 * Each pillar defines a specific transformation of alchemical properties
 */
export interface AlchemicalPillar {
  id: number;
  name: string;
  description: string;
  effects: {
    Spirit: number;     // Effect on Spirit (-1 = decrease, 0 = neutral, 1 = increase)
    Essence: number;    // Effect on Essence
    Matter: number;     // Effect on Matter
    Substance: number;  // Effect on Substance
  };
  // Adding planetary and tarot associations
  planetaryAssociations?: string[];  // Associated planets
  tarotAssociations?: string[];      // Associated tarot cards
  elementalAssociations?: {          // Associated elemental character
    primary: Element;                // Primary element associated with the pillar
    secondary?: Element;             // Secondary element (if applicable)
  };
}

/**
 * The fundamental elemental nature of alchemical properties
 * Based on core principles of the alchemizer engine
 */
export const ALCHEMICAL_PROPERTY_ELEMENTS = {
  Spirit: { primary: 'Fire', secondary: 'Air' },      // Spirit exists between Fire and Air
  Essence: { primary: 'Fire', secondary: 'Water' },   // Essence exists between Fire and Water
  Matter: { primary: 'Earth', secondary: 'Water' },   // Matter exists between Earth and Water
  Substance: { primary: 'Air', secondary: 'Earth' }   // Substance exists between Air and Earth
};

/**
 * The 14 Alchemical Pillars representing ways in which the four
 * fundamental alchemical properties (Spirit, Essence, Matter, Substance)
 * are transformed during alchemical processes
 */
export const ALCHEMICAL_PILLARS: AlchemicalPillar[] = [
  {
    id: 1,
    name: 'Solution',
    description: 'The process of dissolving a solid in a liquid, increasing Essence and Matter while decreasing Spirit and Substance',
    effects: {
      Spirit: -1,
      Essence: 1,
      Matter: 1,
      Substance: -1
    },
    planetaryAssociations: ['Moon', 'Neptune'],
    tarotAssociations: ['2 of Cups', 'Queen of Cups'],
    elementalAssociations: {
      primary: 'Water',
      secondary: 'Earth'
    }
  },
  {
    id: 2,
    name: 'Filtration',
    description: 'The separation of solids from liquids, increasing Essence, Spirit, and Substance while decreasing Matter',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: 1
    },
    planetaryAssociations: ['Mercury', 'Saturn'],
    tarotAssociations: ['8 of Pentacles', 'Temperance'],
    elementalAssociations: {
      primary: 'Air',
      secondary: 'Water'
    }
  },
  {
    id: 3,
    name: 'Evaporation',
    description: 'The transition from liquid to gaseous state, increasing Essence and Spirit while decreasing Matter and Substance',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: -1
    },
    planetaryAssociations: ['Mercury', 'Uranus'],
    tarotAssociations: ['6 of Swords', '8 of Wands'],
    elementalAssociations: {
      primary: 'Air',
      secondary: 'Fire'
    }
  },
  {
    id: 4,
    name: 'Distillation',
    description: 'The purification of liquids through evaporation and condensation, increasing Essence, Spirit, and Substance while decreasing Matter',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: 1
    },
    planetaryAssociations: ['Mercury', 'Neptune'],
    tarotAssociations: ['Temperance', 'The Star'],
    elementalAssociations: {
      primary: 'Water',
      secondary: 'Air'
    }
  },
  {
    id: 5,
    name: 'Separation',
    description: 'The division of a substance into its constituents, increasing Essence, Matter, and Spirit while decreasing Substance',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1
    },
    planetaryAssociations: ['Mercury', 'Uranus', 'Pluto'],
    tarotAssociations: ['2 of Swords', 'The Tower'],
    elementalAssociations: {
      primary: 'Fire',
      secondary: 'Water'
    }
  },
  {
    id: 6,
    name: 'Rectification',
    description: 'The refinement and purification of all elements, increasing all alchemical properties',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: 1
    },
    planetaryAssociations: ['Sun', 'Jupiter'],
    tarotAssociations: ['The World', 'The Star'],
    elementalAssociations: {
      primary: 'Fire'
    }
  },
  {
    id: 7,
    name: 'Calcination',
    description: 'The reduction of a substance through intense heat, increasing Essence and Matter while decreasing Spirit and Substance',
    effects: {
      Spirit: -1,
      Essence: 1,
      Matter: 1,
      Substance: -1
    },
    planetaryAssociations: ['Mars', 'Saturn'],
    tarotAssociations: ['Tower', 'King of Wands'],
    elementalAssociations: {
      primary: 'Fire',
      secondary: 'Earth'
    }
  },
  {
    id: 8,
    name: 'Comixion',
    description: 'The thorough mixing of substances, increasing Matter, Spirit, and Substance while decreasing Essence',
    effects: {
      Spirit: 1,
      Essence: -1,
      Matter: 1,
      Substance: 1
    },
    planetaryAssociations: ['Venus', 'Jupiter', 'Pluto'],
    tarotAssociations: ['3 of Cups', '10 of Pentacles'],
    elementalAssociations: {
      primary: 'Earth',
      secondary: 'Air'
    }
  },
  {
    id: 9,
    name: 'Purification',
    description: 'The removal of impurities, increasing Essence and Spirit while decreasing Matter and Substance',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: -1
    },
    planetaryAssociations: ['Mercury', 'Neptune', 'Moon'],
    tarotAssociations: ['The Hermit', 'Temperance'],
    elementalAssociations: {
      primary: 'Fire',
      secondary: 'Air'
    }
  },
  {
    id: 10,
    name: 'Inhibition',
    description: 'The restraint of reactive processes, increasing Matter and Substance while decreasing Essence and Spirit',
    effects: {
      Spirit: -1,
      Essence: -1,
      Matter: 1,
      Substance: 1
    },
    planetaryAssociations: ['Saturn', 'Pluto'],
    tarotAssociations: ['4 of Pentacles', 'The Hanged Man'],
    elementalAssociations: {
      primary: 'Earth',
      secondary: 'Water'
    }
  },
  {
    id: 11,
    name: 'Fermentation',
    description: 'The transformation through microbial action, increasing Essence, Matter, and Spirit while decreasing Substance',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1
    },
    planetaryAssociations: ['Pluto', 'Jupiter', 'Mars'],
    tarotAssociations: ['Death', 'Wheel of Fortune'],
    elementalAssociations: {
      primary: 'Water',
      secondary: 'Fire'
    }
  },
  {
    id: 12,
    name: 'Fixation',
    description: 'The stabilization of volatile substances, increasing Matter and Substance while decreasing Essence and Spirit',
    effects: {
      Spirit: -1,
      Essence: -1,
      Matter: 1,
      Substance: 1
    },
    planetaryAssociations: ['Saturn', 'Venus'],
    tarotAssociations: ['4 of Pentacles', 'King of Pentacles'],
    elementalAssociations: {
      primary: 'Earth',
      secondary: 'Air'
    }
  },
  {
    id: 13,
    name: 'Multiplication',
    description: 'The amplification of alchemical virtues, increasing Essence, Matter, and Spirit while decreasing Substance',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1
    },
    planetaryAssociations: ['Jupiter', 'Sun', 'Uranus'],
    tarotAssociations: ['The Sun', '3 of Wands'],
    elementalAssociations: {
      primary: 'Fire',
      secondary: 'Water'
    }
  },
  {
    id: 14,
    name: 'Projection',
    description: 'The culminating transformation that protects and stabilizes, increasing all alchemical properties',
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: 1
    },
    planetaryAssociations: ['Sun', 'Moon', 'Mercury', 'Jupiter'],
    tarotAssociations: ['The World', 'The Magician'],
    elementalAssociations: {
      primary: 'Fire',
      secondary: 'Earth'
    }
  }
];

/**
 * Maps cooking methods to their corresponding alchemical pillars
 */
export const COOKING_METHOD_PILLAR_MAPPING: Record<string, number> = {
  // Wet Cooking Methods
  'boiling': 1,        // Solution
  'steaming': 3,       // Evaporation
  'poaching': 1,       // Solution
  'simmering': 1,       // Solution
  'braising': 11,      // Fermentation (slow transformation)
  'stewing': 11,       // Fermentation (slow transformation)
  'sous_vide': 12,     // Fixation (stabilizing at fixed temperature)
  
  // Dry Cooking Methods
  'baking': 7,         // Calcination
  'roasting': 7,       // Calcination
  'broiling': 7,       // Calcination
  'grilling': 7,       // Calcination
  'frying': 7,         // Calcination
  'sauteing': 5,       // Separation
  'stir-frying': 5,    // Separation
  
  // Transformation Methods
  'fermenting': 11,    // Fermentation
  'pickling': 11,      // Fermentation
  'curing': 12,        // Fixation
  'smoking': 13,       // Multiplication
  'drying': 3,         // Evaporation
  
  // Modern/Molecular Methods
  'spherification': 6, // Rectification
  'emulsification': 8, // Comixion
  'gelification': 12,  // Fixation
  'foam': 3,           // Evaporation
  'cryo_cooking': 10,  // Inhibition
  
  // No-heat Methods
  'raw': 9,            // Purification
  'ceviche': 1,        // Solution
  'marinating': 4      // Distillation (flavor extraction)
};

/**
 * Maps elements to their thermodynamic properties
 */
export const ELEMENTAL_THERMODYNAMIC_PROPERTIES: Record<Element, {
  heat: number;
  entropy: number;
  reactivity: number;
}> = {
  'Fire': { heat: 1.0, entropy: 0.7, reactivity: 0.8 },
  'Air': { heat: 0.3, entropy: 0.9, reactivity: 0.7 },
  'Water': { heat: 0.1, entropy: 0.4, reactivity: 0.6 },
  'Earth': { heat: 0.2, entropy: 0.1, reactivity: 0.2 }
};

/**
 * Maps planets to their alchemical effects based on day/night status
 * Values represent the contribution to each alchemical property
 */
export const PLANETARY_ALCHEMICAL_EFFECTS: Record<string, {
  diurnal: Record<AlchemicalProperty, number>,
  nocturnal: Record<AlchemicalProperty, number>
}> = {
  'Sun': {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0.8, Essence: 0.2, Matter: 0, Substance: 0 }
  },
  'Moon': {
    diurnal: { Spirit: 0, Essence: 0.7, Matter: 0.3, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 }
  },
  'Mercury': {
    diurnal: { Spirit: 0.7, Essence: 0, Matter: 0, Substance: 0.3 },
    nocturnal: { Spirit: 0.3, Essence: 0, Matter: 0.3, Substance: 0.4 }
  },
  'Venus': {
    diurnal: { Spirit: 0, Essence: 0.6, Matter: 0.4, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0.4, Matter: 0.6, Substance: 0 }
  },
  'Mars': {
    diurnal: { Spirit: 0.3, Essence: 0.4, Matter: 0.3, Substance: 0 },
    nocturnal: { Spirit: 0.2, Essence: 0.2, Matter: 0.6, Substance: 0 }
  },
  'Jupiter': {
    diurnal: { Spirit: 0.6, Essence: 0.4, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0.4, Substance: 0 }
  },
  'Saturn': {
    diurnal: { Spirit: 0.4, Essence: 0, Matter: 0.6, Substance: 0 },
    nocturnal: { Spirit: 0.2, Essence: 0, Matter: 0, Substance: 0.8 }
  },
  'Uranus': {
    diurnal: { Spirit: 0.4, Essence: 0.2, Matter: 0, Substance: 0.4 },
    nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0, Substance: 0.4 }
  },
  'Neptune': {
    diurnal: { Spirit: 0.2, Essence: 0.6, Matter: 0, Substance: 0.2 },
    nocturnal: { Spirit: 0, Essence: 0.5, Matter: 0, Substance: 0.5 }
  },
  'Pluto': {
    diurnal: { Spirit: 0, Essence: 0.3, Matter: 0.7, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0.3, Matter: 0.3, Substance: 0.4 }
  }
};

/**
 * Maps tarot suits to their alchemical property contributions
 */
export const TAROT_SUIT_ALCHEMICAL_MAPPING: Record<string, Record<AlchemicalProperty, number>> = {
  'Wands': { Spirit: 0.7, Essence: 0.2, Matter: 0.1, Substance: 0 },
  'Cups': { Spirit: 0.1, Essence: 0.7, Matter: 0, Substance: 0.2 },
  'Swords': { Spirit: 0.3, Essence: 0, Matter: 0, Substance: 0.7 },
  'Pentacles': { Spirit: 0, Essence: 0.2, Matter: 0.7, Substance: 0.1 }
};

/**
 * Get the alchemical pillar associated with a cooking method
 * @param cookingMethod The cooking method to map
 * @returns The corresponding alchemical pillar or undefined if not mapped
 */
export function getCookingMethodPillar(cookingMethod: string): AlchemicalPillar | undefined {
  const pillerId = COOKING_METHOD_PILLAR_MAPPING[cookingMethod.toLowerCase()];
  if (!pillerId) return undefined;
  
  return ALCHEMICAL_PILLARS.find(pillar => pillar.id === pillerId);
}

/**
 * Calculate the alchemical effect of a cooking method
 * @param cookingMethod The cooking method
 * @returns The effect on alchemical properties or null if method not recognized
 */
export function getCookingMethodAlchemicalEffect(cookingMethod: string): Record<AlchemicalProperty, number> | null {
  const pillar = getCookingMethodPillar(cookingMethod);
  if (!pillar) return null;
  
  return pillar.effects as Record<AlchemicalProperty, number>;
}

/**
 * Calculate the thermodynamic properties of a cooking method based on its elemental associations
 * @param cookingMethod The cooking method
 * @returns Thermodynamic properties (heat, entropy, reactivity) or null if method not recognized
 */
export function getCookingMethodThermodynamics(cookingMethod: string): { 
  heat: number, 
  entropy: number, 
  reactivity: number 
} | null {
  const pillar = getCookingMethodPillar(cookingMethod);
  if (!pillar || !pillar.elementalAssociations) return null;
  
  const primaryElement = pillar.elementalAssociations.primary;
  const secondaryElement = pillar.elementalAssociations.secondary;
  
  const primaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[primaryElement];
  
  // If no secondary element, return primary properties
  if (!secondaryElement) return primaryProps;
  
  // If secondary element exists, blend properties (70% primary, 30% secondary)
  const secondaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[secondaryElement];
  return {
    heat: (primaryProps.heat * 0.7) + (secondaryProps.heat * 0.3),
    entropy: (primaryProps.entropy * 0.7) + (secondaryProps.entropy * 0.3),
    reactivity: (primaryProps.reactivity * 0.7) + (secondaryProps.reactivity * 0.3)
  };
}

/**
 * Calculate the alchemical effect of a planet based on day/night status
 * @param planet The planet name
 * @param isDaytime Whether it is day (true) or night (false)
 * @returns The alchemical effect of the planet
 */
export function getPlanetaryAlchemicalEffect(
  planet: string, 
  isDaytime: boolean = true
): Record<AlchemicalProperty, number> | null {
  const planetEffects = PLANETARY_ALCHEMICAL_EFFECTS[planet];
  if (!planetEffects) return null;
  
  return isDaytime ? planetEffects.diurnal : planetEffects.nocturnal;
}

/**
 * Get the alchemical effect of a tarot card based on its suit
 * @param cardName The full name of the tarot card (e.g., "10 of Cups")
 * @returns The alchemical effect of the tarot card or null if not recognized
 */
export function getTarotCardAlchemicalEffect(cardName: string): Record<AlchemicalProperty, number> | null {
  // Find the pillar with the tarot association
  const pillar = ALCHEMICAL_PILLARS.find(p => 
    p.tarotAssociations?.some(tarot => 
      tarot.toLowerCase().includes(cardName.toLowerCase()) || 
      cardName.toLowerCase().includes(tarot.toLowerCase())
    )
  );
  
  return pillar ? pillar.effects : null;
}

// ========== MISSING EXPORTS FOR TS2305 FIXES ==========

// EnhancedCookingMethod type (causing error in recipeBuilding.ts)
export interface EnhancedCookingMethod {
  id: string;
  name: string;
  description: string;
  category: 'dry' | 'wet' | 'combination' | 'molecular' | 'raw' | 'traditional' | 'transformation';
  
  // Core alchemical properties
  alchemicalEffects: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  
  // Thermodynamic properties
  thermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
  };
  
  // Elemental influences
  elementalInfluence: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  
  // Monica compatibility metrics
  monicaCompatibility: {
    score: number;
    factors: string[];
    enhancedProperties: string[];
  };
  
  // Additional properties
  techniques: string[];
  equipment: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeRange: {
    min: number;
    max: number;
    unit: 'minutes' | 'hours';
  };
  
  // Astrological associations
  planetaryAssociations?: string[];
  zodiacAffinity?: string[];
  lunarPhaseOptimal?: string[];
}

// Sample enhanced cooking methods data
const ENHANCED_COOKING_METHODS: EnhancedCookingMethod[] = [
  {
    id: 'roasting',
    name: 'Roasting',
    description: 'Dry heat cooking method that concentrates flavors through caramelization',
    category: 'dry',
    alchemicalEffects: { Spirit: 1, Essence: 0, Matter: -1, Substance: 1 },
    thermodynamics: { heat: 0.8, entropy: 0.6, reactivity: 0.7 },
    elementalInfluence: { Fire: 0.8, Water: 0.1, Earth: 0.3, Air: 0.4 },
    monicaCompatibility: { score: 0.85, factors: ['high heat', 'flavor concentration'], enhancedProperties: ['caramelization', 'moisture reduction'] },
    techniques: ['searing', 'browning', 'basting'],
    equipment: ['oven', 'roasting pan'],
    skillLevel: 'intermediate',
    timeRange: { min: 30, max: 180, unit: 'minutes' },
    planetaryAssociations: ['Mars', 'Sun'],
    zodiacAffinity: ['Aries', 'Leo']
  },
  {
    id: 'steaming',
    name: 'Steaming',
    description: 'Moist heat cooking using steam to preserve nutrients and delicate textures',
    category: 'wet',
    alchemicalEffects: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    thermodynamics: { heat: 0.5, entropy: 0.3, reactivity: 0.4 },
    elementalInfluence: { Fire: 0.2, Water: 0.8, Earth: 0.2, Air: 0.6 },
    monicaCompatibility: { score: 0.92, factors: ['gentle heat', 'nutrient preservation'], enhancedProperties: ['moisture retention', 'texture preservation'] },
    techniques: ['indirect cooking', 'vapor cooking'],
    equipment: ['steamer', 'steam basket'],
    skillLevel: 'beginner',
    timeRange: { min: 5, max: 45, unit: 'minutes' },
    planetaryAssociations: ['Moon', 'Neptune'],
    zodiacAffinity: ['Cancer', 'Pisces']
  },
  {
    id: 'fermentation',
    name: 'Fermentation',
    description: 'Transformation through beneficial microorganisms',
    category: 'transformation',
    alchemicalEffects: { Spirit: 1, Essence: 1, Matter: 0, Substance: 1 },
    thermodynamics: { heat: 0.2, entropy: 0.9, reactivity: 0.8 },
    elementalInfluence: { Fire: 0.1, Water: 0.6, Earth: 0.7, Air: 0.3 },
    monicaCompatibility: { score: 0.95, factors: ['living transformation', 'probiotic benefits'], enhancedProperties: ['bioavailability', 'flavor complexity'] },
    techniques: ['lacto-fermentation', 'alcoholic fermentation'],
    equipment: ['fermentation vessel', 'airlock'],
    skillLevel: 'advanced',
    timeRange: { min: 24, max: 720, unit: 'hours' },
    planetaryAssociations: ['Pluto', 'Jupiter'],
    zodiacAffinity: ['Scorpio', 'Sagittarius']
  }
];

// getAllEnhancedCookingMethods function (causing errors in recipeBuilding.ts and seasonal.ts)
export function getAllEnhancedCookingMethods(): EnhancedCookingMethod[] {
  return [...ENHANCED_COOKING_METHODS];
}

// getMonicaCompatibleCookingMethods function (causing errors in recipeBuilding.ts and seasonal.ts)
export function getMonicaCompatibleCookingMethods(minScore: number = 0.8): EnhancedCookingMethod[] {
  return ENHANCED_COOKING_METHODS.filter(method => 
    method.monicaCompatibility.score >= minScore
  );
} 