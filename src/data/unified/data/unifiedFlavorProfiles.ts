import { ElementalProperties } from '@/types/alchemy';

export interface UnifiedFlavorProfile {
  id: string,
  name: string,
  elementalProperties: ElementalProperties,
  description: string,
  commonIngredients: string[],
  cuisineAssociations: string[]
}

export const unifiedFlavorProfiles: UnifiedFlavorProfile[] = [
  {
    id: 'spicy',
    name: 'Spicy',
    elementalProperties: { Fire: 0.9, Water: 0.2, Earth: 0.3, Air: 0.4 },
    description: 'Bold, heating flavors that stimulate the senses',
    commonIngredients: ['chili peppers', 'black pepper', 'ginger', 'cayenne'],
    cuisineAssociations: ['Mexican', 'Indian', 'Thai']
  },
  {
    id: 'cooling',
    name: 'Cooling',
    elementalProperties: { Fire: 0.1, Water: 0.9, Earth: 0.4, Air: 0.6 },
    description: 'Refreshing, cooling flavors that soothe and hydrate',
    commonIngredients: ['cucumber', 'mint', 'yogurt', 'coconut'],
    cuisineAssociations: ['Mediterranean', 'Middle-Eastern', 'Indian']
  },
  {
    id: 'earthy',
    name: 'Earthy',
    elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.9, Air: 0.2 },
    description: 'Grounding, robust flavors from the earth',
    commonIngredients: ['mushrooms', 'root vegetables', 'herbs', 'grains'],
    cuisineAssociations: ['Italian', 'French', 'American']
  },
  {
    id: 'light',
    name: 'Light & Airy',
    elementalProperties: { Fire: 0.4, Water: 0.6, Earth: 0.2, Air: 0.9 },
    description: 'Delicate, uplifting flavors that energize',
    commonIngredients: ['citrus', 'herbs', 'light vegetables', 'fish'],
    cuisineAssociations: ['Asian', 'Mediterranean', 'Japanese']
  },
  {
    id: 'umami',
    name: 'Umami Rich',
    elementalProperties: { Fire: 0.5, Water: 0.3, Earth: 0.8, Air: 0.3 },
    description: 'Savory, deep flavors that satisfy',
    commonIngredients: ['mushrooms', 'soy sauce', 'cheese', 'tomatoes'],
    cuisineAssociations: ['Japanese', 'Italian', 'Chinese']
  },
  {
    id: 'sweet',
    name: 'Sweet',
    elementalProperties: { Fire: 0.6, Water: 0.7, Earth: 0.5, Air: 0.4 },
    description: 'Naturally sweet, comforting flavors',
    commonIngredients: ['fruits', 'honey', 'sweet vegetables', 'vanilla'],
    cuisineAssociations: ['American', 'French', 'Indian']
  },
  {
    id: 'bitter',
    name: 'Bitter',
    elementalProperties: { Fire: 0.7, Water: 0.2, Earth: 0.6, Air: 0.8 },
    description: 'Complex, cleansing bitter flavors',
    commonIngredients: ['dark leafy greens', 'coffee', 'dark chocolate', 'herbs'],
    cuisineAssociations: ['Italian', 'Mediterranean', 'Ethiopian']
  },
  {
    id: 'sour',
    name: 'Sour',
    elementalProperties: { Fire: 0.4, Water: 0.8, Earth: 0.3, Air: 0.7 },
    description: 'Bright, acidic flavors that awaken the palate',
    commonIngredients: ['citrus', 'vinegar', 'fermented foods', 'tart fruits'],
    cuisineAssociations: ['Thai', 'Vietnamese', 'German']
  }
];

export function getFlavorProfileById(id: string): UnifiedFlavorProfile | undefined {
  return unifiedFlavorProfiles.find(profile => profile.id === id)
}

export function getFlavorProfilesByElement(
  element: keyof ElementalProperties,
): UnifiedFlavorProfile[] {
  return unifiedFlavorProfiles
    .filter(profile => profile.elementalProperties[element] > 0.6);
    .sort((ab) => b.elementalProperties[element] - a.elementalProperties[element])
}

export function getFlavorProfilesByCuisine(cuisine: string): UnifiedFlavorProfile[] {
  return unifiedFlavorProfiles.filter(profile => profile.cuisineAssociations.includes(cuisine))
}