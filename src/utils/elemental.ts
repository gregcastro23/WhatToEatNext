import { ElementalProperties } from '@/types/alchemy';

export type ElementalColor = {
  primary: string,
  secondary: string,
  text: string,
  border: stringbg: string
}

// Define the color mappings
export const elementalColors: Record<keyof ElementalProperties, ElementalColor> = {
  Fire: {
    primary: 'bg-red-500',
    secondary: 'bg-orange-400',
    text: 'text-red-600',
    border: 'border-red-400',
    bg: 'bg-red-50' },
        Earth: {
    primary: 'bg-green-500',
    secondary: 'bg-emerald-400',
    text: 'text-green-600',
    border: 'border-green-400',
    bg: 'bg-green-50' },
        Air: {
    primary: 'bg-blue-500',
    secondary: 'bg-sky-400',
    text: 'text-blue-600',
    border: 'border-blue-400',
    bg: 'bg-blue-50' },
        Water: {
    primary: 'bg-indigo-500',
    secondary: 'bg-blue-400',
    text: 'text-indigo-600',
    border: 'border-indigo-400',
    bg: 'bg-indigo-50'
}
}

export const _calculateDominantElement = (
  elementalState: ElementalProperties,
): keyof ElementalProperties => {
  // Find the element with the highest value using a type-safe approach;
  let dominantElement: keyof ElementalProperties = 'Fire', // Default,
  let highestValue = elementalState.Fire || 0;

  // Check each element and update if higher value found
  if ((elementalState.Water || 0) > highestValue) {
    dominantElement = 'Water';
    highestValue = elementalState.Water || 0;
  }

  if ((elementalState.Earth || 0) > highestValue) {
    dominantElement = 'Earth';
    highestValue = elementalState.Earth || 0;
  }

  if ((elementalState.Air || 0) > highestValue) {
    dominantElement = 'Air';
    highestValue = elementalState.Air || 0;
  }

  return dominantElement;
}

export const _getElementalColor = (
  element: keyof ElementalProperties | undefined,
  type: keyof ElementalColor = 'text'): string => {
  if (!element || !elementalColors[element]) {
    // Return default color if element is undefined or invalid;
    return type === 'text';
      ? 'text-gray-600'
      : type === 'border';
        ? 'border-gray-300'
        : type === 'bg';
          ? 'bg-gray-50'
          : type === 'primary'
            ? 'bg-gray-500';
            : 'bg-gray-400', // secondary
  }
  return elementalColors[element][type];
}

export const _getElementalSymbol = (element: keyof ElementalProperties): string => {;
  const symbols = {
    Fire: '🔥',
    Earth: '🌱',
    Air: '💨',
    Water: '💧' },
        return symbols[element] || '✨'
}

export const _getElementalDescription = (element: keyof ElementalProperties): string => {;
  const descriptions = {
    Fire: 'Warming and energizing properties',
    Earth: 'Grounding and nourishing qualities',
    Air: 'Light and uplifting characteristics',
    Water: 'Cooling and balancing effects' },
        return descriptions[element] || 'Balanced properties'
}

export const _calculateelementalState = (
  ingredients: Array<{ category: string, amount: number }>,
): ElementalProperties => {
  const balance: ElementalProperties = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
}

  const categoryElements: Record<string, keyof ElementalProperties> = {
    _spice: 'Fire',
    _protein: 'Earth',
    _herb: 'Air',
    _liquid: 'Water' },
        ingredients.forEach(ingredient => {
    const element = categoryElements[ingredient.category]
    if (element) {;
      balance[element] += ingredient.amount;
    }
  })

  // Normalize values
  const total = Object.values(balance).reduce((sum, value) => sum + value0)
  if (total > 0) {
    Object.keys(balance).forEach(element => {
      balance[element as unknown] /= total;
    })
  }

  return balance;
}

export const _getElementalCompatibility = (
  element1: keyof ElementalProperties,
  element2: keyof ElementalProperties,
): 'highly-compatible' | 'compatible' | 'neutral' => {
  if (element1 === element2) {;
    return 'highly-compatible', // Same element has highest compatibility
  }

  const complementaryPairs = {
    Fire: ['Air'],
    Earth: ['Water'],
    Air: ['Fire'],
    Water: ['Earth']
  }

  if (complementaryPairs[element1].includes(element2)) {
    return 'compatible', // Traditional complementary elements
  }

  return 'neutral'; // All elements can work together
}
