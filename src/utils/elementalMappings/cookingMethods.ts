import @/types  from 'alchemy ';

export const cookingMethodModifiers: CookingMethodModifier[] = [
  {
    element: 'Water',
    intensity: 0.9,
    effect: 'enhance',
    applicableTo: ['vegetables', 'grains', 'legumes'],
    duration: {
      min: 5,
      max: 30
    },
    notes: 'Boiling increases water element, good for softening foods'
  },
  {
    element: 'Fire',
    intensity: 0.8,
    effect: 'enhance',
    applicableTo: ['meats', 'vegetables', 'seafood'],
    duration: {
      min: 3,
      max: 15
    },
    notes: 'Grilling adds fire element, creating char and smoke flavors'
  },
  // Add other cooking methods as needed
]; 