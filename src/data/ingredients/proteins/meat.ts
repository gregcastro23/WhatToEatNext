import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawMeats: Record<string, Partial<IngredientMapping>> = {
  beef: {
    name: 'Beef',
    description: 'Red meat from cattle, available in various cuts with different properties.',
    category: 'protein',
    qualities: ['robust', 'rich', 'substantial'],
    sustainabilityScore: 2,
    season: ['all'],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.2, Air: 0.0 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 200, unit: 'g' }, // Standard serving: 7oz steak
    scaledElemental: { Fire: 0.67, Water: 0.11, Earth: 0.22, Air: 0.00 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.335, Essence: 0.055, Matter: 0.110, Substance: 0.220 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.25, forceMagnitude: 1.18 }, // Strong warming, high force
    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic beef profile'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile beef for various uses'
      },
      cookingMethods: ['grilling', 'roasting', 'braising'],
      cuisineAffinity: ['american', 'european'],
      preparationTips: ['allow to reach room temperature before cooking', 'season generously']
    }
  },
  chicken: {
    name: 'Chicken',
    description: 'White meat from poultry, available in various cuts with different properties.',
    category: 'protein',
    qualities: ['light', 'lean', 'versatile'],
    sustainabilityScore: 1,
    season: ['all'],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.2, Air: 0.0 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 150, unit: 'g' }, // Standard serving: 5oz breast
    scaledElemental: { Fire: 0.29, Water: 0.51, Earth: 0.20, Air: 0.00 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.145, Essence: 0.355, Matter: 0.255, Substance: 0.100 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.98 }, // Mild warming, balanced force
    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic chicken profile'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['mild', 'savory'],
        notes: 'Versatile for many cuisines.'
      },
      cookingMethods: ['roasting', 'grilling', 'frying', 'poaching'],
      cuisineAffinity: ['global'],
      preparationTips: ['Cook to internal temperature of 165°F.', 'Brining enhances moisture.']
    }
  },
  pork: {
    name: 'Pork',
    description: 'Meat from pigs, known for its rich flavor and versatility.',
    category: 'protein',
    qualities: ['rich', 'savory', 'versatile'],
    sustainabilityScore: 3,
    season: ['all'],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.2, Air: 0.0 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 180, unit: 'g' }, // Standard serving: 6oz chop
    scaledElemental: { Fire: 0.39, Water: 0.41, Earth: 0.20, Air: 0.00 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.195, Essence: 0.305, Matter: 0.205, Substance: 0.100 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.18, forceMagnitude: 1.08 }, // Moderate warming, moderate force
    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['savory', 'umami'],
        secondary: ['sweet'],
        notes: 'Excellent with fruits like apple and cherry.'
      },
      cookingMethods: ['roasting', 'braising', 'grilling', 'smoking'],
      cuisineAffinity: ['asian', 'american', 'german'],
      preparationTips: ['Do not overcook.', 'Works well with rubs and marinades.']
    }
  },
  lamb: {
    name: 'Lamb',
    description: 'Meat from young sheep, with a distinct, slightly gamy flavor.',
    category: 'protein',
    qualities: ['tender', 'gamy', 'distinctive'],
    sustainabilityScore: 4,
    season: ['spring'],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0.0 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 160, unit: 'g' }, // Standard serving: 5.5oz chop
    scaledElemental: { Fire: 0.58, Earth: 0.31, Air: 0.11, Water: 0.00 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.345, Essence: 0.000, Matter: 0.155, Substance: 0.310 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.22, forceMagnitude: 1.15 }, // Strong warming, high force

    culinaryProfile: {
      flavorProfile: {
        primary: ['gamy', 'earthy'],
        secondary: ['herbaceous'],
        notes: 'Complemented by herbs like rosemary and mint.'
      },
      cookingMethods: ['roasting', 'grilling', 'braising'],
      cuisineAffinity: ['mediterranean', 'middle_eastern'],
      preparationTips: ['Best served medium-rare.', 'Fat carries a lot of the flavor.']
    }
};

export const _meats: Record<string, IngredientMapping> = fixIngredientMappings(rawMeats);
export const _meatNames = Object.keys(rawMeats);
