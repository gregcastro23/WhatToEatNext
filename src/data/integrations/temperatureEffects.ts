import type { ElementalProperties } from '@/types/alchemy';

interface TemperatureRange {
  min: number;
  max: number;
  elementalEffect: ElementalProperties;
  description: string;
  recommendedMethods: string[];
  cautions: string[];
}

export const temperatureEffects: Record<string, TemperatureRange> = {
  freezing: {
    min: -20,
    max: 0,
    elementalEffect: {
      Water: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0
    },
    description: 'Preservation and crystallization of flavors',
    recommendedMethods: ['raw', 'frozen desserts'],
    cautions: ['texture changes', 'dulled flavors']
  },
  cold: {
    min: 1,
    max: 10,
    elementalEffect: {
      Water: 0.5,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0
    },
    description: 'Refreshing and crisp qualities',
    recommendedMethods: ['raw', 'chilled preparations', 'cold infusion'],
    cautions: ['reduced aroma', 'numbed taste buds']
  },
  cool: {
    min: 11,
    max: 21,
    elementalEffect: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1
    },
    description: 'Balanced temperature for subtle flavors',
    recommendedMethods: ['room temperature service', 'light preparation'],
    cautions: ['temperature fluctuation']
  },
  room: {
    min: 22,
    max: 30,
    elementalEffect: {
      Air: 0.4,
      Earth: 0.3,
      Water: 0.2,
      Fire: 0.1
    },
    description: 'Natural state for most ingredients',
    recommendedMethods: ['fermentation', 'proofing', 'resting'],
    cautions: ['food safety time limits']
  },
  warm: {
    min: 31,
    max: 49,
    elementalEffect: {
      Fire: 0.3,
      Air: 0.3,
      Earth: 0.2,
      Water: 0.2
    },
    description: 'Enhanced aromatics and flavors',
    recommendedMethods: ['warming', 'tempering', 'slow cooking'],
    cautions: ['protein degradation begins']
  },
  hot: {
    min: 50,
    max: 100,
    elementalEffect: {
      Fire: 0.5,
      Air: 0.3,
      Water: 0.1,
      Earth: 0.1
    },
    description: 'Active cooking and transformation',
    recommendedMethods: ['boiling', 'steaming', 'poaching'],
    cautions: ['moisture loss', 'overcooking risk']
  },
  very_hot: {
    min: 101,
    max: 200,
    elementalEffect: {
      Fire: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Water: 0
    },
    description: 'Intense heat transformation',
    recommendedMethods: ['roasting', 'baking', 'frying'],
    cautions: ['burning risk', 'rapid moisture loss']
  },
  extreme: {
    min: 201,
    max: 300,
    elementalEffect: {
      Fire: 0.8,
      Air: 0.2,
      Water: 0,
      Earth: 0
    },
    description: 'Extreme transformation and caramelization',
    recommendedMethods: ['grilling', 'broiling', 'searing'],
    cautions: ['very short cooking time', 'high burning risk']
  }
};

export const getTemperatureRange = (temp: number): string => {
  return Object.keys(temperatureEffects).find(range => 
    temp >= temperatureEffects[range].min && 
    temp <= temperatureEffects[range].max
  ) || 'room';
};

export const getElementalEffect = (temp: number): ElementalProperties => {
  const range = getTemperatureRange(temp);
  return temperatureEffects[range].elementalEffect;
};

export function getTemperatureEffect(ingredient: string, temperature?: number) {
  // Map of ingredient temperature effects
  const effectMap: Record<string, string> = {
    'ginger': 'warming',
    'chili': 'hot',
    'mint': 'cooling',
    'cucumber': 'cool',
    // Add more ingredients as needed
  };
  
  // Simple fallback with some common effects
  const commonEffects = {
    'spices': 'warming',
    'herbs': 'neutral',
    'fruits': 'cooling',
    'vegetables': 'neutral'
  };
  
  // Check if we have a specific effect for this ingredient
  for (const [key, effect] of Object.entries(effectMap)) {
    if (ingredient.toLowerCase().includes(key)) {
      return effect;
    }
  }
  
  // Return a string, not an object
  return 'neutral';
}

export default temperatureEffects;