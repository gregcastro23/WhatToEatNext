import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawPoultry: Record<string, Partial<IngredientMapping>> = {
  chicken: {
    name: 'Chicken',
    elementalProperties: { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['virgo'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Water',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic chicken profile',
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile chicken for various uses',
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
      },
    },
    qualities: ['adaptable', 'mild', 'versatile', 'light', 'neutral', 'balancing'],
    category: 'poultry',
    origin: ['domesticated worldwide', 'ancestor is the red junglefowl of Southeast Asia'],
    varieties: {
      broiler: {
        name: 'Broiler / Fryer',
        characteristics: 'young and tender, usually 7-10 weeks old, 2-5 pounds',
        best_cooking_methods: ['roasting', 'frying', 'grilling', 'sautéing'],
        notes: 'Most common commercial chicken, versatile for most recipes',
      },
    },
    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic chicken profile',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile chicken for various uses',
      },
      cookingMethods: ['sautéing', 'steaming', 'roasting'],
      cuisineAffinity: ['Global', 'International'],
      preparationTips: ['Use as needed', 'Season to taste'],
    },
    season: ['year-round'],
    preparation: {
      methods: ['standard preparation'],
      timing: 'as needed',
      notes: 'Standard preparation for chicken',
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const poultry: Record<string, IngredientMapping> = fixIngredientMappings(
  rawPoultry as Record<string, Partial<IngredientMapping>>,
);

// Create a collection of all poultry items
export const _allPoultry = Object.values(poultry);

export default poultry;
