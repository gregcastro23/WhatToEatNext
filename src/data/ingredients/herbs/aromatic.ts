import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawAromaticHerbs: Record<string, Partial<IngredientMapping>> = {
  'thyme': {
    name: 'Thyme',
    elementalProperties: { Air: 0.5, Fire: 0.3, Earth: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Sun' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Air: 0.1 },
        preparationTips: ['Best for drying and preserving']
      },
      fullMoon: {
        elementalBoost: { Air: 0.2 },
        preparationTips: ['Enhanced aromatic properties', 'Ideal for teas and infusions']
      },
      waxingCrescent: {
        elementalBoost: { Air: 0.1, Fire: 0.05 },
        preparationTips: ['Good for light cooking applications']
      },
      waxingGibbous: {
        elementalBoost: { Air: 0.15, Fire: 0.1 },
        preparationTips: ['Perfect for stocks and broths']
      }
    }
  },
  'rosemary': {
    name: 'Rosemary',
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Mars'],
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Air', planet: 'Jupiter' },
          third: { element: 'Earth', planet: 'Pluto' }
        }
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Fire: 0.1, Earth: 0.05 },
        preparationTips: ['Best for subtle infusions', 'Good time for drying']
      },
      waxingCrescent: {
        elementalBoost: { Fire: 0.15, Air: 0.05 },
        preparationTips: ['Good for infused oils']
      },
      firstQuarter: {
        elementalBoost: { Fire: 0.2 },
        preparationTips: ['Ideal for grilling meats']
      },
      waxingGibbous: {
        elementalBoost: { Fire: 0.25 },
        preparationTips: ['Perfect for roasts and hearty dishes']
      },
      fullMoon: {
        elementalBoost: { Fire: 0.3 },
        preparationTips: ['Maximum potency', 'Best for medicinal preparations']
      },
      waningGibbous: {
        elementalBoost: { Fire: 0.2, Air: 0.1 },
        preparationTips: ['Excellent for soups and stews']
      },
      lastQuarter: {
        elementalBoost: { Fire: 0.15, Earth: 0.1 },
        preparationTips: ['Good for marinades']
      },
      waningCrescent: {
        elementalBoost: { Fire: 0.1, Earth: 0.15 },
        preparationTips: ['Best for subtle applications']
      }
    }
  },
  'basil': {
    name: 'Basil',
    elementalProperties: { Air: 0.5, Fire: 0.3, Earth: 0.2, Water: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['gemini', 'cancer'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Moon' },
          third: { element: 'Earth', planet: 'Venus' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Air: 0.1, Fire: 0.1 },
          preparationTips: ['Best for fresh pesto']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for infused oils']
        }
      }
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const aromaticHerbs: Record<string, IngredientMapping> = fixIngredientMappings(rawAromaticHerbs); 