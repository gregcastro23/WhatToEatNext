import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawBerries: Record<string, Partial<IngredientMapping>> = {
  blueberry: {
    name: 'Blueberry',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 100, unit: 'g' }, // Standard serving: 1 cup (100g)
    scaledElemental: { Water: 0.39, Air: 0.31, Earth: 0.20, Fire: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.250, Essence: 0.345, Matter: 0.100, Substance: 0.205 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.95 }, // Mild cooling, gentle force
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['cooling', 'sweet', 'astringent', 'balancing', 'restorative'],
    origin: ['North America', 'Europe', 'Asia'],
    season: ['summer', 'early fall'],
    category: 'fruit',
    subCategory: 'berry',
    affinities: [
      'lemon',
      'vanilla',
      'mint',
      'peach',
      'almond',
      'cinnamon',
      'maple',
      'cream',
      'ginger'
    ],
    cookingMethods: ['raw', 'baked', 'cooked', 'frozen', 'dried', 'fermented', 'infused'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'c', 'b6', 'e'],
      minerals: ['manganese', 'potassium', 'copper', 'iron'],
      calories: 57,
      carbs_g: 14,
      fiber_g: 3.6,
      antioxidants: ['anthocyanins', 'quercetin', 'resveratrol', 'pterostilbene'],
      specific_values: {
        vitamin_c_mg: 14,
        manganese_mg: 0.5,
        vitamin_k_mcg: 28,
        anthocyanins_mg: 163,
        proanthocyanidins_mg: 88
}
    },
    healthBenefits: [
      'Powerful antioxidant properties',
      'Supports brain health and cognitive function',
      'May improve memory in older adults',
      'Helps reduce inflammation',
      'Supports heart health',
      'May help regulate blood sugar',
      'Supports eye health (prevents macular degeneration)',
      'Promotes urinary tract health'
    ],
    varieties: {
      Highbush: {
        name: 'Highbush Blueberry',
        scientific: 'Vaccinium corymbosum',
        appearance: 'medium to large berries',
        flavor: 'sweet with balanced acidity',
        common_cultivars: ['Bluecrop', 'Duke', 'Elliott', 'Liberty'],
        notes: 'Most commonly cultivated variety'
}
    },
    sensoryProfile: {
      taste: ['sweet', 'tart', 'juicy'],
      aroma: ['fresh', 'fruity'],
      texture: ['plump', 'tender'],
      notes: 'Characteristic blueberry profile'
},
    culinaryProfile: {
      flavorProfile: {
        primary: ['sweet', 'tart'],
        secondary: ['juicy', 'fresh'],
        notes: 'Versatile berry for sweet and savory dishes'
},
      cookingMethods: ['raw', 'baked', 'cooked'],
      cuisineAffinity: ['American', 'European', 'Global'],
      preparationTips: ['Wash before use', 'Can be used fresh or frozen']
    },
    storage: {
      temperature: 'refrigerator',
      duration: '1-2 weeks',
      container: 'ventilated container',
      notes: 'Best stored in refrigerator'
}
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const berries: Record<string, IngredientMapping> = fixIngredientMappings(rawBerries);
