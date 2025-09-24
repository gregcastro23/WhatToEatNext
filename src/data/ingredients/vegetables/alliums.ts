import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawAlliums: Record<string, Partial<IngredientMapping>> = {
  garlic: {
    name: 'Garlic',

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 3, unit: 'g' }, // Standard serving: 1 clove (3g)
    scaledElemental: { Fire: 0.58, Air: 0.21, Earth: 0.11, Water: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.395, Essence: 0.100, Matter: 0.105, Substance: 0.400 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.30, forceMagnitude: 1.25 }, // Strong warming, high force
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'],
      favorableZodiac: ['aries', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Pluto' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['warming', 'pungent', 'drying', 'protective', 'cleansing'],
    season: ['all'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['olive oil', 'herbs', 'ginger', 'chili', 'lemon', 'tomato', 'mushrooms', 'wine'],
    cookingMethods: ['roasted', 'sautéed', 'raw', 'confit', 'fermented', 'smoked', 'pickled'],
    nutritionalProfile: {
      vitamins: ['c', 'b6', 'b1', 'manganese'],
      minerals: ['manganese', 'selenium', 'calcium', 'phosphorus', 'copper'],
      calories: 4,
      protein_g: 0.2,
      carbs_g: 1,
      fiber_g: 0.1,
      medicinalProperties: ['allicin', 'antioxidants', 'organosulfur compounds'],
      immune_support: 'very high',
      heart_health: 'supportive',
      antimicrobial: 'potent'
    },
    preparation: {
      peeling: true,
      crushing: 'releases more compounds',
      resting: '10-15 minutes after cutting for maximum allicin development',
      notes: 'Different cutting methods alter flavor intensity',
      microplaning: 'creates paste-like consistency',
      pressing: 'more gentle than crushing',
      pre_roasting: 'leave head intact, cut top, drizzle with oil'
    },
    varieties: {
      hardneck: {
        characteristics: 'harder central stem, fewer but larger cloves',
        flavor: 'complex, often spicier, better for raw applications',
        storage: 'shorter shelf life, 3-4 months',
        popular_types: ['Rocambole', 'Purple Stripe', 'Porcelain'],
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic hardneck profile'
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile hardneck for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        preparation: {
          methods: ['standard preparation'],
          timing: 'as needed',
          notes: 'Standard preparation for hardneck'
        }
      }
    },
    sensoryProfile: {
      taste: ['pungent', 'sharp', 'complex'],
      aroma: ['strong', 'sulfurous'],
      texture: ['firm when raw', 'soft when cooked'],
      notes: 'Characteristic garlic profile'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['pungent', 'sharp'],
        secondary: ['complex', 'versatile'],
        notes: 'Essential aromatic for many cuisines'
      },
      cookingMethods: ['roasted', 'sautéed', 'raw', 'confit'],
      cuisineAffinity: ['Global', 'Mediterranean', 'Asian'],
      preparationTips: ['Crush or chop to release flavor', 'Add early for roasting, late for sautéing']
    },
    season: ['year-round'],
    storage: {
      temperature: 'cool, dark place',
      duration: '3-6 months',
      container: 'well-ventilated',
      notes: 'Keep in cool, dry place away from light'
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const _alliums: Record<string, IngredientMapping> = fixIngredientMappings(
  rawAlliums as Record<string, Partial<IngredientMapping>>
);
