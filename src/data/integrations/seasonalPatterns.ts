import type { ElementalProperties, Season } from '@/types/alchemy';

export const seasonalPatterns: Record<Season, {
  elementalInfluence: ElementalProperties;
  description: string;
  recommendedMethods: string[];
}> = {
  spring: {
    elementalInfluence: {
      Air: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Earth: 0.1
    },
    description: 'Light, fresh preparations with emerging growth energy',
    recommendedMethods: ['steaming', 'raw', 'light_frying']
  },
  summer: {
    elementalInfluence: {
      Fire: 0.4,
      Air: 0.3,
      Water: 0.2,
      Earth: 0.1
    },
    description: 'High-energy cooking with emphasis on fresh ingredients',
    recommendedMethods: ['grilling', 'raw', 'quick_frying']
  },
  autumn: {
    elementalInfluence: {
      Earth: 0.4,
      Air: 0.3,
      Fire: 0.2,
      Water: 0.1
    },
    description: 'Warming preparations with grounding energy',
    recommendedMethods: ['roasting', 'baking', 'braising']
  },
  winter: {
    elementalInfluence: {
      Water: 0.4,
      Earth: 0.3,
      Fire: 0.2,
      Air: 0.1
    },
    description: 'Slow, warming cooking methods with deep nourishment',
    recommendedMethods: ['braising', 'stewing', 'slow_roasting']
  }
};

export default seasonalPatterns;