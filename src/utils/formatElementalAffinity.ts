import { ElementalAffinity } from '../types/alchemy';

// Add this utility function to ensure all ElementalAffinity objects have the required properties
export function formatElementalAffinity(input: unknown): ElementalAffinity {
  if (!input) {
    return {
      primary: 'Fire',
      strength: 0.5,
      compatibility: { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
    }; // Default fallback
  }

  // If it's a string, create a simple object with primary
  if (typeof input === 'string') {
    return {
      primary: input as unknown,
      strength: 0.5,
      compatibility: { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
    };
  }

  // Apply safe type casting for property access
  const inputData = input as unknown;

  // Ensure the primary property exists
  if (!inputData?.primary && inputData?.element) {
    return {
      primary: inputData.element,
      secondary: inputData.secondary,
      strength: inputData.strength || 0.5,
      compatibility: inputData.compatibility || { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
    };
  }

  // If neither primary nor element exists, provide a default
  if (!inputData?.primary && !inputData?.element) {
    return {
      primary: 'Fire',
      secondary: inputData.secondary,
      strength: inputData.strength || 0.5,
      compatibility: inputData.compatibility || { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
    };
  }

  // Ensure all required properties exist
  return {
    primary: inputData.primary || 'Fire',
    secondary: inputData.secondary,
    strength: inputData.strength || 0.5,
    compatibility: inputData.compatibility || { Fire: 1, Water: 0.3, Earth: 0.7, Air: 0.6 },
  } as ElementalAffinity;
}
