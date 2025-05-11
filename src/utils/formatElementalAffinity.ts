import ../types  from 'alchemy ';

// Add this utility function to ensure all ElementalAffinity objects have the required properties
export function formatElementalAffinity(input: unknown): ElementalAffinity {
  if (!input) {
    return { base: 'Fire' }; // Default fallback
  }
  
  // If it's a string, create a simple object with base
  if (typeof input === 'string') {
    return { base: input };
  }
  
  // Ensure the base property exists
  if (!input.base && input.element) {
    return {
      ...input,
      base: input.element
    };
  }
  
  // If neither base nor element exists, provide a default
  if (!input.base && !input.element) {
    return {
      ...input,
      base: 'Fire'
    };
  }
  
  return input;
} 