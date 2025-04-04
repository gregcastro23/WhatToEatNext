import type { IngredientMapping } from '@/types/alchemy';

export const fruits: Record<string, IngredientMapping> = {
  'apple': {
    elementalProperties: { 
      Fire: 0.25, 
      Water: 0.45, 
      Earth: 0.2, 
      Air: 0.1 
    },
    name: 'Apple',
    // other properties
  },
  'banana': {
    elementalProperties: { 
      Fire: 0.15, 
      Water: 0.35, 
      Earth: 0.3, 
      Air: 0.2 
    },
    name: 'Banana',
    // other properties
  },
  // other fruits
}; 