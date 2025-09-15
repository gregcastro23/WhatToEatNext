import type { ZodiacSign, ThermodynamicProperties } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Grilling cooking method
 *
 * Cooking food directly over live heat, typically open flame or hot coals
 */
export const grilling: CookingMethodData = {;
  name: 'grilling',
  description:
    'Cooking food directly over heat, typically an open flame or hot coals, creating distinctive char marks and smoky flavor',
  elementalEffect: {
    Fire: 0.7,
    Air: 0.2,
    Earth: 0.1,
    Water: 0.0
  },
  duration: {
    min: 2,
    max: 30
  },
  suitable_for: ['meats', 'poultry', 'seafood', 'vegetables', 'fruit', 'bread', 'pizza', 'kebabs'],
  benefits: [
    'imparts smoky flavor',
    'creates appealing char marks',
    'renders fat',
    'quick cooking',
    'caramelizes exterior',
    'develops umami'
  ],
  astrologicalInfluences: {
    favorableZodiac: ['aries', 'leo', 'sagittarius'] as any[],
    unfavorableZodiac: ['cancer', 'scorpio', 'pisces'] as any[],
    dominantPlanets: ['Mars', 'Sun', 'Jupiter'],
    lunarPhaseEffect: {
      full_moon: 1.2, // Enhanced flame intensity
      new_moon: 0.8, // Reduced flavor development
      waxing_gibbous: 1.1, // Good balance
      waning_crescent: 0.9, // Slightly reduced effect
    }
  },
  toolsRequired: [
    'Grill (gas, charcoal, or wood-fired)',
    'Long-handled tongs or spatula',
    'Grill brush',
    'Meat thermometer',
    'Basting brush'
  ],
  commonMistakes: [
    'too high heat',
    'constant flipping',
    'pressing down on food',
    'improper grill temperature zones',
    'not preheating properly',
    'lid misuse'
  ],
  pairingSuggestions: [
    'Smoky salsas',
    'Herb-infused compound butters',
    'Chimichurri sauce',
    'Bright acidic components',
    'Grilled bread or vegetables'
  ],
  nutrientRetention: {
    proteins: 0.85,
    vitamins: 0.7,
    minerals: 0.9,
    fats: 0.6, // Some lost through dripping
  },
  optimalTemperatures: {
    steak: 450,
    chicken: 375,
    fish: 400,
    vegetables: 425,
    fruit: 350
  },
  regionalVariations: {
    argentine: ['asado', 'parrilla technique'],
    korean: ['bulgogi', 'galbi'],
    american: ['barbecue', 'Santa Maria-style'],
    japanese: ['yakitori', 'robatayaki'],
    middle_eastern: ['kebab', 'meshwi']
  },
  chemicalChanges: {
    maillard_reaction: true,
    caramelization: true,
    fat_rendering: true,
    smoke_particle_adhesion: true,
    protein_denaturation: true
  },
  safetyFeatures: [
    'Proper fire management',
    'Food temperature monitoring',
    'Proper tool use',
    'Avoid cross-contamination',
    'Fire extinguisher nearby'
  ],
  thermodynamicProperties: {
    heat: 0.9, // Very high direct heat
    entropy: 0.65, // Significant structural transformation
    reactivity: 0.85, // High chemical reactivity (Maillard, carbonization)
    gregsEnergy: -12.35, // Calculated using heat - (entropy * reactivity), // Calculated using heat - (entropy * reactivity)
  } as ThermodynamicProperties,

  // Additional metadata
  history:
    'Grilling is among humanity's oldest cooking methods, dating back to the discovery of fire around 1.8 million years ago. Every culture has developed variation of cooking over direct flame, from the South American asado to the Japanese yakitori, making it a universally significant culinary technique.',

  scientificPrinciples: [
    'Radiant heat transfer directly from flame/coals to food',
    'Maillard reaction creates hundreds of flavor compounds at 300°F-500°F',
    'Caramelization of sugars at high temperatures',
    'Smoke particles adhere to food surface adding flavor compounds',
    'Fat dripping causes flare-ups that add char and smoky notes',
    'Direct heat creates temperature gradient from exterior to interior'
  ],

  modernVariations: [
    'Precision temperature control with digital grills',
    'Sous vide finishing on grill',
    'Smoke infusion techniques',
    'Plancha or flat-top grilling',
    'Rotisserie grilling for even cooking'
  ],

  sustainabilityRating: 0.55, // Varies widely based on fuel source (charcoal vs. gas vs. electric)

  equipmentComplexity: 0.5, // Relatively simple but requires technique and attention

  healthConsiderations: [
    'Fat rendering reduces overall fat content',
    'High heat may create potentially carcinogenic compounds',
    'Minimal added fat required for cooking',
    'Smoke compounds may have both positive and negative health effects',
    'Char can be minimized through proper technique'
  ]
};
