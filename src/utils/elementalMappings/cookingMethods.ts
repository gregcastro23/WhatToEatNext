import type { CookingMethodModifier } from '@/types/alchemy';

export const cookingMethodModifiers: CookingMethodModifier[] = [
  {
    name: "Boiling",
    elementalModifiers: {
      water: 1.0,
      fire: 0.5,
      earth: 0.0,
      air: 0.2
    }
  },
  {
    name: "Grilling",
    elementalModifiers: {
      fire: 1.0,
      air: 0.5,
      earth: 0.2,
      water: 0.0
    }
  },
  // Add other cooking methods as needed
]; 