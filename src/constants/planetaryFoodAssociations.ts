import { ElementalCharacter } from './planetaryElements';
import { ZodiacSign } from './zodiac';

/**
 * Enhanced planet type incorporating multiple astrological traditions
 */
export type Planet = 
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

/**
 * Planetary dignity types for calculation
 */
export type PlanetaryDignity = 
  | 'Domicile'
  | 'Exaltation'
  | 'Triplicity'
  | 'Term'
  | 'Face'
  | 'Mooltrikona'
  | 'Nakshatra'
  | 'Detriment'
  | 'Fall'
  | 'Neutral';

/**
 * Lunar phase system
 */
export type LunarPhase = 
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

/**
 * Planetary food associations structure
 */
export const planetaryFoodAssociations: Record<Planet, {
  foodCategories: string[];
  elementalBoost: Partial<Record<ElementalCharacter, number>>;
  taste: string[];
  doshaEffect: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  cookingMethods: string[];
  traditionalAssociations: {
    western: string[];
    chinese: string[];
  };
  boostValue: number;
  mealTiming: {
    optimalHours: string;
    digestivePhase: string;
  };
  spiceBlends: {
    primary: string[];
    complementary: string[];
    traditionalRecipes: string[];
  };
}> = {
  'Sun': {
    foodCategories: ['grains', 'citrus', 'spicy', 'golden foods'],
    elementalBoost: { Fire: 0.4, Air: 0.1 },
    taste: ['pungent', 'sweet'],
    doshaEffect: { vata: -0.2, pitta: 0.3, kapha: -0.1 },
    cookingMethods: ['roasting', 'sun-drying', 'caramelization'],
    traditionalAssociations: {
      western: ['Vitality', 'Leadership'],
      chinese: ['Yang foods', 'Fire element']
    },
    boostValue: 0.3,
    mealTiming: {
      optimalHours: 'Noon-2 PM',
      digestivePhase: 'Midday digestion'
    },
    spiceBlends: {
      primary: ['saffron', 'turmeric', 'cinnamon'],
      complementary: ['ras el hanout', 'baharat', 'five-spice'],
      traditionalRecipes: [
        'Solar Infused Olive Oil',
        'Golden Milk Latte Mix'
      ]
    }
  },
  'Moon': {
    foodCategories: ['seafood', 'dairy', 'white foods', 'liquids'],
    elementalBoost: { Water: 0.4, Earth: 0.1 },
    taste: ['salty', 'cooling'],
    doshaEffect: { vata: -0.3, pitta: -0.2, kapha: 0.2 },
    cookingMethods: ['steaming', 'poaching', 'fermentation'],
    traditionalAssociations: {
      western: ['Emotional nourishment'],
      chinese: ['Yin foods', 'Water element']
    },
    boostValue: 0.25,
    mealTiming: {
      optimalHours: '7-9 PM',
      digestivePhase: 'Nighttime digestion'
    },
    spiceBlends: {
      primary: ['sel gris', 'dill', 'cardamom'],
      complementary: ['furikake', 'za\'atar', 'herbes de Provence'],
      traditionalRecipes: [
        'Lunar Salt Blend',
        'Tidepool Seasoning'
      ]
    }
  },
  'Mercury': {
    foodCategories: ['nuts', 'seeds', 'herbs', 'mixed dishes'],
    elementalBoost: { Air: 0.2, Earth: 0.1, Water: 0.1 },
    taste: ['bitter', 'sweet'],
    doshaEffect: { vata: -0.1, pitta: 0.2, kapha: 0.1 },
    cookingMethods: ['stir-frying', 'fermentation'],
    traditionalAssociations: {
      western: ['Intellectual stimulation'],
      chinese: ['Metal foods', 'Air element']
    },
    boostValue: 0.2,
    mealTiming: {
      optimalHours: '7-9 AM & 3-5 PM',
      digestivePhase: 'Mental clarity meals'
    },
    spiceBlends: {
      primary: ['cinnamon', 'clove', 'nutmeg'],
      complementary: ['cardamom', 'turmeric', 'fennel'],
      traditionalRecipes: [
        'Ayurvedic Spice Mix',
        'Energy Bites'
      ]
    }
  },
  'Venus': {
    foodCategories: ['fruits', 'sweets', 'aromatic herbs', 'luxurious foods'],
    elementalBoost: { Water: 0.2, Air: 0.2 },
    taste: ['sweet', 'aromatic'],
    doshaEffect: { vata: -0.1, pitta: 0.3, kapha: 0.2 },
    cookingMethods: ['baking', 'poaching', 'marinating'],
    traditionalAssociations: {
      western: ['Pleasure', 'Beauty'],
      chinese: ['Earth foods', 'Water element']
    },
    boostValue: 0.25,
    mealTiming: {
      optimalHours: 'Noon-2 PM',
      digestivePhase: 'Midday digestion'
    },
    spiceBlends: {
      primary: ['rose', 'saffron', 'cardamom'],
      complementary: ['vanilla', 'cinnamon', 'clove'],
      traditionalRecipes: [
        'Rose Infused Olive Oil',
        'Sweet Spice Blend'
      ]
    }
  },
  'Mars': {
    foodCategories: ['red meat', 'spicy foods', 'stimulants', 'protein'],
    elementalBoost: { Fire: 0.3, Earth: 0.1 },
    taste: ['hot', 'bitter'],
    doshaEffect: { vata: -0.1, pitta: 0.3, kapha: 0.2 },
    cookingMethods: ['grilling', 'roasting', 'marinating'],
    traditionalAssociations: {
      western: ['Strength', 'Aggression'],
      chinese: ['Fire foods', 'Fire element']
    },
    boostValue: 0.25,
    mealTiming: {
      optimalHours: '5-7 PM',
      digestivePhase: 'Active digestion'
    },
    spiceBlends: {
      primary: ['chili', 'cumin', 'garam masala'],
      complementary: ['paprika', 'coriander', 'turmeric'],
      traditionalRecipes: [
        'Marinated Steak with Chili-Garam Masala',
        'Spicy Roasted Vegetables'
      ]
    }
  },
  'Jupiter': {
    foodCategories: ['rich foods', 'feast foods', 'liver', 'exotic spices'],
    elementalBoost: { Fire: 0.15, Air: 0.15, Water: 0.1 },
    taste: ['rich', 'savory'],
    doshaEffect: { vata: 0.1, pitta: 0.1, kapha: 0.2 },
    cookingMethods: ['slow cooking', 'roasting', 'braising'],
    traditionalAssociations: {
      western: ['Abundance', 'Expansion'],
      chinese: ['Earth foods', 'Wood element']
    },
    boostValue: 0.3,
    mealTiming: {
      optimalHours: '10-12 AM',
      digestivePhase: 'Growth and expansion'
    },
    spiceBlends: {
      primary: ['allspice', 'clove', 'turmeric'],
      complementary: ['cardamom', 'nutmeg', 'black pepper'],
      traditionalRecipes: [
        'Prosperity Spice Blend',
        'Abundance Curry Mix'
      ]
    }
  },
  'Saturn': {
    foodCategories: ['root vegetables', 'bitter greens', 'aged foods', 'preserved foods'],
    elementalBoost: { Earth: 0.4, Water: 0.1 },
    taste: ['bitter', 'dense'],
    doshaEffect: { vata: 0.2, pitta: -0.1, kapha: 0.1 },
    cookingMethods: ['roasting', 'baking', 'fermentation'],
    traditionalAssociations: {
      western: ['Restriction', 'Maturity'],
      chinese: ['Water foods', 'Earth element']
    },
    boostValue: 0.2,
    mealTiming: {
      optimalHours: '3-5 PM',
      digestivePhase: 'Slow and thorough digestion'
    },
    spiceBlends: {
      primary: ['black pepper', 'cumin', 'garam masala'],
      complementary: ['coriander', 'turmeric', 'cardamom'],
      traditionalRecipes: [
        'Baked Root Vegetables with Black Pepper and Turmeric',
        'Fermented Vegetables'
      ]
    }
  },
  'Rahu': {
    foodCategories: ['novel foods', 'fusion cuisine', 'fermented foods'],
    elementalBoost: { Air: 0.25, Fire: 0.15 },
    taste: ['new', 'exotic'],
    doshaEffect: { vata: 0.1, pitta: 0.1, kapha: 0.1 },
    cookingMethods: ['fusion', 'fermentation'],
    traditionalAssociations: {
      western: ['Innovation', 'Mystery'],
      chinese: ['Metal foods', 'Air element']
    },
    boostValue: 0.15,
    mealTiming: {
      optimalHours: 'Variable',
      digestivePhase: 'Transformative digestion'
    },
    spiceBlends: {
      primary: ['unusual spices', 'fusion blends', 'global combinations'],
      complementary: ['innovative pairings', 'unexpected combinations'],
      traditionalRecipes: [
        'Fusion Spice Blend',
        'Global Flavor Mix'
      ]
    }
  },
  'Ketu': {
    foodCategories: ['seafood', 'alcohol', 'elusive flavors', 'delicate foods'],
    elementalBoost: { Water: 0.3, Air: 0.1 },
    taste: ['subtle', 'mysterious'],
    doshaEffect: { vata: 0.1, pitta: -0.1, kapha: 0.1 },
    cookingMethods: ['poaching', 'steaming'],
    traditionalAssociations: {
      western: ['Transformation', 'Mystery'],
      chinese: ['Water foods', 'Water element']
    },
    boostValue: 0.2,
    mealTiming: {
      optimalHours: 'Dawn and dusk',
      digestivePhase: 'Ethereal digestion'
    },
    spiceBlends: {
      primary: ['subtle aromatics', 'light herbs', 'delicate blends'],
      complementary: ['gentle infusions', 'mild combinations'],
      traditionalRecipes: [
        'Delicate Herb Infusion',
        'Subtle Flavor Blend'
      ]
    }
  },
  'Uranus': {
    foodCategories: ['unusual foods', 'innovative cuisine', 'technological foods'],
    elementalBoost: { Air: 0.4, Fire: 0.1 },
    taste: ['electric', 'surprising'],
    doshaEffect: { vata: 0.3, pitta: 0.1, kapha: -0.1 },
    cookingMethods: ['molecular gastronomy', 'innovative techniques'],
    traditionalAssociations: {
      western: ['Revolution', 'Innovation'],
      chinese: ['Air element', 'Metal element']
    },
    boostValue: 0.2,
    mealTiming: {
      optimalHours: 'Unconventional times',
      digestivePhase: 'Breakthrough digestion'
    },
    spiceBlends: {
      primary: ['unexpected combinations', 'novel ingredients'],
      complementary: ['futuristic pairings', 'surprising elements'],
      traditionalRecipes: [
        'Innovative Flavor Powder',
        'Revolutionary Spice Mix'
      ]
    }
  },
  'Neptune': {
    foodCategories: ['seafood', 'ethereal foods', 'alcohols', 'adaptogens'],
    elementalBoost: { Water: 0.4, Air: 0.1 },
    taste: ['elusive', 'complex'],
    doshaEffect: { vata: 0.2, pitta: -0.1, kapha: 0.2 },
    cookingMethods: ['infusion', 'steaming', 'gentle cooking'],
    traditionalAssociations: {
      western: ['Dreams', 'Intuition'],
      chinese: ['Water element', 'Yin energy']
    },
    boostValue: 0.15,
    mealTiming: {
      optimalHours: 'Evening',
      digestivePhase: 'Subconscious digestion'
    },
    spiceBlends: {
      primary: ['lavender', 'chamomile', 'mild herbs'],
      complementary: ['subtle florals', 'gentle aromatics'],
      traditionalRecipes: [
        'Dream Tea Blend',
        'Intuitive Flavor Mix'
      ]
    }
  },
  'Pluto': {
    foodCategories: ['fermented foods', 'powerful flavors', 'transformative foods'],
    elementalBoost: { Fire: 0.2, Water: 0.2, Earth: 0.1 },
    taste: ['intense', 'transformative'],
    doshaEffect: { vata: 0.1, pitta: 0.2, kapha: -0.1 },
    cookingMethods: ['fermentation', 'aging', 'preserving'],
    traditionalAssociations: {
      western: ['Transformation', 'Power'],
      chinese: ['Water element', 'Fire element']
    },
    boostValue: 0.2,
    mealTiming: {
      optimalHours: 'Midnight',
      digestivePhase: 'Transformative digestion'
    },
    spiceBlends: {
      primary: ['fermented ingredients', 'intense flavors'],
      complementary: ['powerful combinations', 'complex blends'],
      traditionalRecipes: [
        'Transformation Ferment Starter',
        'Power Spice Blend'
      ]
    }
  }
};

/**
 * Planetary cooking guide interface for recommendation algorithm
 */
export interface PlanetaryCookingGuide {
  optimalCookingTemp: string;
  flavorPairings: string[];
  nutrientFocus: string[];
  preservationMethods: string[];
  traditionalRecipes: string[];
}

/**
 * Calculate planetary boost for an ingredient based on current astrological state
 */
export const calculatePlanetaryBoost = (
  item: any, // ElementalItem type
  planetPositions: Record<string, any>,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhase | null
) => {
  let boost = 0;
  const dominantPlanets: string[] = [];
  const dignities: Record<string, PlanetaryDignity> = {};

  // Planetary position calculations
  Object.entries(planetPositions).forEach(([planet, position]) => {
    const planetInfo = planetaryFoodAssociations[planet as Planet];
    if (!planetInfo) return;

    // Basic planetary boost
    const baseBoost = planetInfo.boostValue || 0.1;
    boost += baseBoost;

    // Add planet to dominant list if significant
    if (baseBoost > 0.2) {
      dominantPlanets.push(planet);
    }
  });

  // Zodiac sign boost if available
  if (currentZodiac) {
    boost += getZodiacBoost(currentZodiac, item);
  }

  // Lunar phase boost if available
  if (lunarPhase) {
    boost += getLunarPhaseBoost(lunarPhase);
  }

  return {
    boost: parseFloat(boost.toFixed(2)),
    dominantPlanets: Array.from(new Set(dominantPlanets)), // Fix for Set iteration in older JS versions
    dignities
  };
};

// Helper functions for calculations
const getTriplicityRulers = (zodiacSign?: string | null): Planet[] => {
  // Implementation depends on your zodiac mappings
  return ['Sun', 'Mars', 'Jupiter'] as Planet[];
};

const getSeasonalMultiplier = (): number => {
  // Implementation depends on your seasonal logic
  return 1.0;
};

/**
 * Get dignity multiplier for calculations
 */
export const getDignityMultiplier = (dignity: PlanetaryDignity): number => {
  const multipliers: Record<PlanetaryDignity, number> = {
    'Domicile': 1.5,
    'Exaltation': 1.3,
    'Triplicity': 1.2,
    'Term': 1.1,
    'Face': 1.05,
    'Mooltrikona': 1.4,
    'Nakshatra': 1.25,
    'Detriment': 0.7,
    'Fall': 0.5,
    'Neutral': 1.0
  };
  return multipliers[dignity] || 1.0;
};

/**
 * Get zodiac boost based on elemental properties
 */
export const getZodiacBoost = (zodiacSign: string, item: any): number => {
  // Basic implementation - would expand based on your zodiac logic
  return 0.1;
};

/**
 * Get lunar phase boost
 */
export const getLunarPhaseBoost = (lunarPhase: LunarPhase): number => {
  const phaseBoosts: Record<LunarPhase, number> = {
    'New Moon': 0.1,
    'Waxing Crescent': 0.15,
    'First Quarter': 0.2,
    'Waxing Gibbous': 0.25,
    'Full Moon': 0.3,
    'Waning Gibbous': 0.25,
    'Last Quarter': 0.2,
    'Waning Crescent': 0.15
  };
  return phaseBoosts[lunarPhase] || 0.1;
};

/**
 * Get flavor boost from planetary associations
 */
export const getFlavorBoost = (
  planet: Planet,
  ingredient: any
): number => {
  const elementBoost = planetaryFoodAssociations[planet].elementalBoost;
  return Object.entries(elementBoost).reduce((acc, [element, boost]) => {
    return acc + (ingredient.elementalProperties?.[element as ElementalCharacter] || 0) * (boost || 0);
  }, 0);
};

/**
 * Get nutritional synergy between ingredient and planet
 */
export const getNutritionalSynergy = (
  planet: Planet,
  ingredient: any
): string[] => {
  // Implementation depends on your nutritional data
  return [];
};

/**
 * Format elemental balance for display
 */
export const formatelementalState = (
  elements: Partial<Record<ElementalCharacter, number>>
): string => {
  const validEntries = Object.entries(elements)
    .filter(([_, val]) => Number.isFinite(val))
    .map(([elem, val]) => `${elem} ${Math.round((val || 0) * 100)}%`)
    .join(" · ");
  
  return validEntries;
};
