import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawCruciferous: Record<string, Partial<IngredientMapping>> = {
  cauliflower: {
    name: 'Cauliflower',

    // Base elemental properties (unscaled)
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 100, unit: 'g' }, // Standard serving: 1 cup chopped
    scaledElemental: { Air: 0.40, Earth: 0.30, Water: 0.20, Fire: 0.10 }, // Scaled for harmony (already balanced)
    alchemicalProperties: { Spirit: 0.350, Essence: 0.150, Matter: 0.250, Substance: 0.250 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 0.95 }, // Cooling effect, gentle force
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Moon' }
        }
      }
    },
    qualities: ['cooling', 'drying', 'light', 'versatile', 'transformative'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: [
      'cumin',
      'turmeric',
      'garlic',
      'tahini',
      'lemon',
      'nutritional yeast',
      'curry spices'
    ],
    cookingMethods: ['roasted', 'steamed', 'raw', 'riced', 'mashed', 'grilled', 'pickled'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'k', 'b6', 'folate', 'b5'],
      minerals: ['potassium', 'magnesium', 'phosphorus', 'manganese'],
      calories: 25,
      protein_g: 2,
      fiber_g: 3,
      antioxidants: ['glucosinolates', 'flavonoids', 'carotenoids', 'isothiocyanates'],
      digestive_enzymes: 'moderate'
    },
    preparation: {
      washing: true,
      cutting: 'uniform florets',
      drying: 'thoroughly for roasting',
      notes: 'Can be processed into rice substitute or mashed as potato replacement',
      marinades: 'absorbs flavors well if pre-marinated',
      pre_cooking: 'blanching improves texture for some preparations'
    },
    varieties: {
      romanesco: {
        characteristics: 'lime green, fractal pattern, nutty flavor',
        uses: 'showcase dishes, roasting',
        best_cooking_methods: ['light steaming', 'roasting'],
        season: 'fall and early winter',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic romanesco profile'
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile romanesco for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        preparation: {
          methods: ['standard preparation'],
          timing: 'as needed',
          notes: 'Standard preparation for romanesco'
        }
      }
    },
    sensoryProfile: {
      taste: ['mild', 'nutty', 'versatile'],
      aroma: ['fresh', 'earthy'],
      texture: ['crisp when raw', 'tender when cooked'],
      notes: 'Characteristic cauliflower profile'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['mild', 'versatile'],
        secondary: ['nutty', 'earthy'],
        notes: 'Highly adaptable vegetable'
      },
      cookingMethods: ['roasted', 'steamed', 'raw'],
      cuisineAffinity: ['Global', 'Indian', 'Mediterranean'],
      preparationTips: ['Cut into uniform pieces', 'Dry thoroughly for roasting']
    },
    storage: {
      temperature: 'refrigerator',
      duration: '1-2 weeks',
      container: 'plastic bag',
      notes: 'Store in refrigerator crisper'
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const cruciferous: Record<string, IngredientMapping> = fixIngredientMappings(
  rawCruciferous as Record<string, Partial<IngredientMapping>>
);
