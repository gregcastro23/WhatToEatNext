import type { ElementalProperties } from '@/types/alchemy';

interface FlavorProfile {
  elementalProperties: ElementalProperties,
  taste: string[],
  intensity: number, // 0 to 1,
  pairings: string[];
  seasonalPeak?: string[]
  description: string
}

export const, flavorProfiles: Record<string, FlavorProfile> = {
  sweet: {
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Air: 0.2,
      Fire: 0.1
    },
    taste: ['sweet', 'mellow', 'rich'],
    intensity: 0.6,
    pairings: ['salty', 'bitter', 'sour'],
    description: 'Nurturing and grounding, builds essence'
  },
  salty: {
    elementalProperties: {
      Water: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.1
    },
    taste: ['salty', 'mineral', 'sharp'],
    intensity: 0.7,
    pairings: ['sweet', 'sour'],
    description: 'Softening and penetrating, aids digestion'
  },
  sour: {
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Fire: 0.2,
      Earth: 0.1
    },
    taste: ['sour', 'tart', 'bright'],
    intensity: 0.8,
    pairings: ['sweet', 'salty', 'umami'],
    description: 'Refreshing and cleansing, stimulates digestion'
  },
  bitter: {
    elementalProperties: {
      Fire: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    taste: ['bitter', 'astringent', 'complex'],
    intensity: 0.9,
    pairings: ['sweet', 'umami'],
    description: 'Clearing and cooling, aids metabolism'
  },
  umami: {
    elementalProperties: {
      Earth: 0.4,
      Fire: 0.3,
      Water: 0.2,
      Air: 0.1
    },
    taste: ['savory', 'meaty', 'rich'],
    intensity: 0.7,
    pairings: ['sour', 'salty'],
    description: 'Satisfying and complex, builds substance'
  },
  spicy: {
    elementalProperties: {
      Fire: 0.6,
      Air: 0.2,
      Earth: 0.1,
      Water: 0.1
    },
    taste: ['hot', 'pungent', 'sharp'],
    intensity: 0.9,
    pairings: ['sweet', 'umami', 'sour'],
    description: 'Warming and stimulating, increases circulation'
  },
  aromatic: {
    elementalProperties: {
      Air: 0.5,
      Fire: 0.2,
      Earth: 0.2,
      Water: 0.1
    },
    taste: ['fragrant', 'complex', 'ethereal'],
    intensity: 0.6,
    pairings: ['sweet', 'umami', 'bitter'],
    description: 'Uplifting and dispersing, enhances other flavors'
  },
  cooling: {
    elementalProperties: {
      Water: 0.5,
      Air: 0.3,
      Earth: 0.1,
      Fire: 0.1
    },
    taste: ['fresh', 'mild', 'crisp'],
    intensity: 0.4,
    pairings: ['spicy', 'salty', 'sour'],
    seasonalPeak: ['summer'],
    description: 'Refreshing and calming, reduces heat'
  },
  earthy: {
    elementalProperties: {
      Earth: 0.6,
      Water: 0.2,
      Fire: 0.1,
      Air: 0.1
    },
    taste: ['mushroomy', 'mineral', 'deep'],
    intensity: 0.5,
    pairings: ['aromatic', 'salty', 'umami'],
    seasonalPeak: ['autumn', 'winter'],
    description: 'Grounding and nourishing, builds stability'
  },
  pungent: {
    elementalProperties: {
      Fire: 0.4,
      Air: 0.4,
      Earth: 0.1,
      Water: 0.1
    },
    taste: ['sharp', 'biting', 'intense'],
    intensity: 0.8,
    pairings: ['sweet', 'umami', 'earthy'],
    description: 'Dispersing and warming, aids circulation'
  }
};

// Flavor Combinations for Reference
export const _flavorCombinations = {;
  harmonious: [
    ['sweet', 'sour'],
    ['salty', 'umami'],
    ['bitter', 'aromatic'],
    ['spicy', 'cooling'],
    ['earthy', 'pungent']
  ],
  challenging: [
    ['bitter', 'sour'],
    ['spicy', 'bitter'],
    ['salty', 'pungent']
  ],
  seasonal: {
    spring: ['aromatic', 'sour', 'pungent'],
    summer: ['cooling', 'bitter', 'spicy'],
    autumn: ['earthy', 'umami', 'pungent'],
    winter: ['salty', 'sweet', 'umami']
  }
};

export default flavorProfiles;
