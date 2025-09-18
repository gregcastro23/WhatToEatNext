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
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.2, Air: 0.0 },
    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic beef profile',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile beef for various uses',
      },
      cookingMethods: ['grilling', 'roasting', 'braising'],
      cuisineAffinity: ['american', 'european'],
      preparationTips: ['allow to reach room temperature before cooking', 'season generously'],
    },
  },
  chicken: {
    name: 'Chicken',
    description: 'White meat from poultry, available in various cuts with different properties.',
    category: 'protein',
    qualities: ['light', 'lean', 'versatile'],
    sustainabilityScore: 1,
    season: ['all'],
    elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.2, Air: 0.0 },
    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic chicken profile',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['mild', 'savory'],
        notes: 'Versatile for many cuisines.',
      },
      cookingMethods: ['roasting', 'grilling', 'frying', 'poaching'],
      cuisineAffinity: ['global'],
      preparationTips: ['Cook to internal temperature of 165°F.', 'Brining enhances moisture.'],
    },
  },
  pork: {
    name: 'Pork',
    description: 'Meat from pigs, known for its rich flavor and versatility.',
    category: 'protein',
    qualities: ['rich', 'savory', 'versatile'],
    sustainabilityScore: 3,
    season: ['all'],
    elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.2, Air: 0.0 },
    sensoryProfile: {
      taste: ['Savory', 'Slightly sweet'],
      aroma: ['Rich', 'Meaty'],
      texture: ['Varies from tender to crisp'],
      notes: 'Pairs well with sweet and tangy flavors.',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['savory', 'umami'],
        secondary: ['sweet'],
        notes: 'Excellent with fruits like apple and cherry.',
      },
      cookingMethods: ['roasting', 'braising', 'grilling', 'smoking'],
      cuisineAffinity: ['asian', 'american', 'german'],
      preparationTips: ['Do not overcook.', 'Works well with rubs and marinades.'],
    },
  },
  lamb: {
    name: 'Lamb',
    description: 'Meat from young sheep, with a distinct, slightly gamy flavor.',
    category: 'protein',
    qualities: ['tender', 'gamy', 'distinctive'],
    sustainabilityScore: 4,
    season: ['spring'],
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0.0 },
    sensoryProfile: {
      taste: ['Rich', 'Earthy', 'Slightly gamy'],
      aroma: ['Strong', 'Distinctive'],
      texture: ['Tender', 'Fine-grained'],
      notes: 'Flavor becomes stronger with age (mutton).',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['gamy', 'earthy'],
        secondary: ['herbaceous'],
        notes: 'Complemented by herbs like rosemary and mint.',
      },
      cookingMethods: ['roasting', 'grilling', 'braising'],
      cuisineAffinity: ['mediterranean', 'middle_eastern'],
      preparationTips: ['Best served medium-rare.', 'Fat carries a lot of the flavor.'],
    },
  },
};

export const _meats: Record<string, IngredientMapping> = fixIngredientMappings(rawMeats);
export const _meatNames = Object.keys(rawMeats);
