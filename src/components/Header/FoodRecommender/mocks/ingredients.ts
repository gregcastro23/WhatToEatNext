import type { ElementalProperties } from '@/types/alchemy';

export const defaultElementalProps: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

export const mockIngredients = {
  'Oils & Fats': [
    {
      name: 'sesame oil',
      elementalProperties: {
        Fire: 0.4,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.2
      }
    }
  ],
  'Herbs': [
    {
      name: 'basil',
      elementalProperties: {
        Fire: 0.3,
        Water: 0.3,
        Earth: 0.2,
        Air: 0.2
      }
    }
  ],
  'Spices': [
    {
      name: 'star anise',
      elementalProperties: {
        Fire: 0.35,
        Water: 0.25,
        Earth: 0.2,
        Air: 0.2
      }
    }
  ]
}; 