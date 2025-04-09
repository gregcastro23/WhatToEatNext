import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawPome: Record<string, Partial<IngredientMapping>> = {
  'apple': {
    name: 'Apple',
    elementalProperties: {
      Earth: 0.5,
      Water: 0.3, 
      Air: 0.2,
      Fire: 0
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Water', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    season: ['fall'],
    qualities: ['crisp', 'sweet', 'tart'],
    category: 'fruit',
    subCategory: 'pome'
  },
  'pear': {
    name: 'Pear',
    elementalProperties: {
      Water: 0.4,
      Earth: 0.4,
      Air: 0.2,
      Fire: 0
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    season: ['fall', 'winter'],
    qualities: ['juicy', 'sweet', 'fragrant'],
    category: 'fruit',
    subCategory: 'pome'
  },
  'quince': {
    name: 'Quince',
    elementalProperties: {
      Earth: 0.6,
      Air: 0.2,
      Water: 0.2,
      Fire: 0
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'capricorn'],
      elementalAffinity: {
        base: 'Earth'
      }
    },
    season: ['fall'],
    qualities: ['astringent', 'fragrant', 'firm'],
    category: 'fruit',
    subCategory: 'pome'
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const pome: Record<string, IngredientMapping> = fixIngredientMappings(rawPome); 