// Define the global window interface to include our alchemize function
declare global {
  interface Window {
    alchemize?: any;
  }
}

import { StandardizedAlchemicalResult } from '@/types/alchemy';
import alchemicalEngine from '@/calculations/alchemicalEngine';

// Use the standardized interface we created
export type AlchemicalResult = StandardizedAlchemicalResult;

/**
 * Initialize the alchemize function
 * This loads the alchemize function from the core engine into window.alchemize
 */
export function initializeAlchemyEngine() {
  if (typeof window === 'undefined') return;
  
  try {
    // Assign the core alchemize function to the window object
    window.alchemize = alchemicalEngine.alchemize;
    console.log("Alchemical engine initialized successfully");
  } catch (error) {
    console.error("Failed to initialize alchemize function:", error);
  }
}

/**
 * A static version of the alchemize function that can be used directly
 * This wraps the core engine's implementation
 */
export const staticAlchemize = (birthInfo: any, horoscopeDict: any): AlchemicalResult => {
  return alchemicalEngine.alchemize(birthInfo, horoscopeDict);
};

// Re-export the core functionality
export { alchemicalEngine }; 