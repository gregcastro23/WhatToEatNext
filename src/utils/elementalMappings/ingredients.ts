import type { IngredientMappings } from '@/types/ingredients';

export const ingredientMappings: IngredientMappings = {
  // Aromatics
  ginger: {
    elementalProperties: {
      Fire: 0.7,
      Earth: 0.2,
      Air: 0.1,
      Water: 0
    },
    season: ['all']
  },
  garlic: {
    elementalProperties: {
      Fire: 0.6,
      Earth: 0.3,
      Air: 0.1,
      Water: 0
    },
    season: ['all']
  },
  
  // Spices
  cinnamon: {
    elementalProperties: {
      Fire: 0.8,
      Air: 0.2,
      Earth: 0,
      Water: 0
    },
    season: ['fall', 'winter']
  },
  cardamom: {
    elementalProperties: {
      Air: 0.6,
      Fire: 0.3,
      Earth: 0.1,
      Water: 0
    },
    season: ['fall', 'winter']
  },
  clove: {
    elementalProperties: {
      Fire: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Water: 0
    },
    season: ['fall', 'winter']
  },

  // Cooling Ingredients
  mint: {
    elementalProperties: {
      Water: 0.6,
      Air: 0.4,
      Fire: 0,
      Earth: 0
    },
    season: ['spring', 'summer']
  },
  cucumber: {
    elementalProperties: {
      Water: 0.8,
      Air: 0.2,
      Fire: 0,
      Earth: 0
    },
    season: ['summer']
  },

  // Earthy Ingredients
  mushroom: {
    elementalProperties: {
      Earth: 0.7,
      Water: 0.3,
      Fire: 0,
      Air: 0
    },
    season: ['fall', 'spring']
  },
  seaweed: {
    elementalProperties: {
      Water: 0.6,
      Earth: 0.4,
      Fire: 0,
      Air: 0
    },
    season: ['all']
  },

  // Proteins
  fish: {
    elementalProperties: {
      Water: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0
    },
    season: ['all']
  },
  beef: {
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.5,
      Water: 0,
      Air: 0
    },
    season: ['all']
  },
  chicken: {
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.3,
      Water: 0
    },
    season: ['all']
  },

  // Dairy
  dairy: {
    elementalProperties: {
      Water: 0.5,
      Earth: 0.5,
      Fire: 0,
      Air: 0
    },
    season: ['all']
  },

  // Vegetables
  'bitter greens': {
    elementalProperties: {
      Earth: 0.4,
      Air: 0.4,
      Water: 0.2,
      Fire: 0
    },
    season: ['spring', 'fall']
  },
  turmeric: {
    elementalProperties: {
      Fire: 0.6,
      Earth: 0.4,
      Water: 0,
      Air: 0
    },
    season: ['all']
  },
  chili: {
    elementalProperties: {
      Fire: 0.9,
      Air: 0.1,
      Water: 0,
      Earth: 0
    },
    season: ['summer', 'fall']
  },
  basil: {
    elementalProperties: {
      Air: 0.5,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0
    },
    season: ['summer']
  },
  sage: {
    elementalProperties: {
      Air: 0.4,
      Earth: 0.4,
      Fire: 0.2,
      Water: 0
    },
    season: ['fall', 'winter']
  },
  rosemary: {
    elementalProperties: {
      Fire: 0.4,
      Air: 0.3,
      Earth: 0.3,
      Water: 0
    },
    season: ['all']
  },
  thyme: {
    elementalProperties: {
      Air: 0.5,
      Earth: 0.3,
      Fire: 0.2,
      Water: 0
    },
    season: ['all']
  }
} as const;

// Helper function to get ingredients by dominant element
export const getIngredientsByElement = (element: keyof typeof ingredientMappings[string]['elementalProperties']) => {
  return Object.entries(ingredientMappings)
    .filter(([_, mapping]) => {
      const elements = Object.entries(mapping.elementalProperties);
      const dominantElement = elements.reduce((max, curr) => 
        curr[1] > max[1] ? curr : max
      );
      return dominantElement[0] === element;
    })
    .map(([name]) => name);
};

// Helper function to get seasonal ingredients
export const getSeasonalIngredients = (season: string) => {
  return Object.entries(ingredientMappings)
    .filter(([_, mapping]) => mapping.season.includes(season))
    .map(([name]) => name);
};

// Helper function to get complementary ingredients
export const getComplementaryIngredients = (ingredient: keyof typeof ingredientMappings) => {
  const baseElement = Object.entries(ingredientMappings[ingredient].elementalProperties)
    .reduce((max, curr) => curr[1] > max[1] ? curr : max)[0];
  
  return Object.entries(ingredientMappings)
    .filter(([name, mapping]) => {
      if (name === ingredient) return false;
      const complementaryElement = Object.entries(mapping.elementalProperties)
        .reduce((max, curr) => curr[1] > max[1] ? curr : max)[0];
      return isComplementaryElement(baseElement, complementaryElement);
    })
    .map(([name]) => name);
};

// Helper function to determine if elements are complementary
const isComplementaryElement = (element1: string, element2: string): boolean => {
  const complementaryPairs = [
    ['Fire', 'Air'],
    ['Water', 'Earth']
  ];
  
  return complementaryPairs.some(pair => 
    (pair[0] === element1 && pair[1] === element2) ||
    (pair[1] === element1 && pair[0] === element2)
  );
}; 