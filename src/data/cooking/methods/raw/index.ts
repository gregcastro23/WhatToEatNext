import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Raw cooking methods - preparation without applying heat
 */
export const rawCookingMethods: Record<string, CookingMethodData> = {
  raw: {
    name: 'raw' as any,
    description: 'Serving food without applying heat, preserving natural nutrients and enzymes',
    elementalEffect: { Fire: 0.1, Water: 0.4, Earth: 0.2, Air: 0.3 },
    duration: { min: 0, max: 30 },
    suitable_for: ['fruits', 'vegetables', 'nuts', 'seeds', 'certain fish'],
    benefits: ['Preserves nutrients', 'Maintains natural enzymes', 'Fresh flavors', 'Quick preparation']
  },
  
  marinating: {
    name: 'marinating' as any,
    description: 'Soaking food in acidic or enzymatic solutions to tenderize and flavor',
    elementalEffect: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
    duration: { min: 30, max: 1440 }, // 30 minutes to 24 hours
    suitable_for: ['meats', 'vegetables', 'tofu'],
    benefits: ['Tenderizes proteins', 'Infuses flavors', 'Can improve digestibility']
  },
  
  curing: {
    name: 'curing' as any,
    description: 'Preserving food with salt, sugar, or other curing agents',
    elementalEffect: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    duration: { min: 60, max: 10080 }, // 1 hour to 1 week
    suitable_for: ['meats', 'fish', 'vegetables'],
    benefits: ['Preserves food', 'Concentrates flavors', 'Creates unique textures']
  },
  
  pickling: {
    name: 'pickling' as any,
    description: 'Preserving in acidic solutions like vinegar or brine',
    elementalEffect: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    duration: { min: 60, max: 2160 }, // 1 hour to 1.5 days
    suitable_for: ['vegetables', 'fruits', 'eggs'],
    benefits: ['Preserves food', 'Adds tangy flavor', 'Probiotics from fermentation']
  }
};

export default rawCookingMethods; 