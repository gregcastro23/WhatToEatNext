import type { IngredientMapping } from '@/types/ingredients';

export const melons: Record<string, IngredientMapping> = {
  'watermelon': {
    elementalProperties: {
      Water: 0.8,
      Fire: 0.1,
      Earth: 0.1,
      Air: 0
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Jupiter'],
      favorableZodiac: ['Cancer', 'Pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Water', planet: 'Jupiter' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    season: ['summer'],
    qualities: ['hydrating', 'sweet', 'refreshing'],
    category: 'fruit',
    subCategory: 'melon'
  },
  'cantaloupe': {
    elementalProperties: {
      Water: 0.6,
      Earth: 0.2,
      Fire: 0.1,
      Air: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['Taurus', 'Cancer'],
      elementalAffinity: {
        base: 'Water'
      }
    },
    season: ['summer'],
    qualities: ['sweet', 'aromatic', 'juicy'],
    category: 'fruit',
    subCategory: 'melon'
  },
  'honeydew': {
    elementalProperties: {
      Water: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['Taurus', 'Cancer'],
      elementalAffinity: {
        base: 'Water'
      }
    },
    season: ['summer'],
    qualities: ['refreshing', 'crisp', 'subtle sweetness'],
    category: 'fruit',
    subCategory: 'melon'
  },
  'winter_melon': {
    elementalProperties: {
      Water: 0.6,
      Earth: 0.3,
      Air: 0.1,
      Fire: 0
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Capricorn'],
      elementalAffinity: {
        base: 'Water'
      }
    },
    season: ['winter', 'fall'],
    qualities: ['mild', 'cooling', 'spongy'],
    category: 'fruit',
    subCategory: 'melon',
    medicinalProperties: ['cooling', 'detoxifying']
  }
}; 