import { ElementalAffinity } from '../types/alchemy';

// Add this utility function to ensure all ElementalAffinity objects have the required properties
export function formatElementalAffinity(input: unknown): ElementalAffinity {
  if (!input) {
    return { base: 'Fire' }; // Default fallback
  }
  
  // If it's a string, create a simple object with base
  if (typeof input === 'string') {
    return { base: input };
  }
  
  // Apply safe type casting for property access
  const inputData = input as any;
  
  // Ensure the base property exists
  if (!inputData?.base && inputData?.element) {
    return {
      ...inputData,
      base: inputData.element
    };
  }
  
  // If neither base nor element exists, provide a default
  if (!inputData?.base && !inputData?.element) {
    return {
      ...inputData,
      base: 'Fire'
    };
  }
  
  return inputData;
} 