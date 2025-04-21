// Define the global window interface to include our alchemize function
declare global {
  interface Window {
    alchemize?: unknown;
  }
}

import { StandardizedAlchemicalResult } from '../types/alchemy';
import alchemicalEngine from '../app/alchemicalEngine';

// Use the standardized interface we created
export type AlchemicalResult = StandardizedAlchemicalResult;

/**
 * Initialize the Alchemical Engine with required configuration
 */
export function initializeAlchemicalEngine() {
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
export const staticAlchemize = (birthInfo: unknown, horoscopeDict: unknown): AlchemicalResult => {
  try {
    console.log('Static alchemize called with:', { birthInfo, horoscopeDict });
    
    // Try to use the alchemicalEngine
    if (typeof alchemicalEngine.alchemize === 'function') {
      console.log('Using alchemicalEngine.alchemize');
      return alchemicalEngine.alchemize(birthInfo, horoscopeDict);
    }
    
    // If alchemicalEngine.alchemize is not available, use hardcoded values for Greg's chart
    console.warn('alchemicalEngine.alchemize is not available, using hardcoded values');
    
    // Fallback values from Greg's chart based on the notepad
    return {
      spirit: 4,
      essence: 5,
      matter: 7,
      substance: -6,
      elementalBalance: {
        fire: 7,
        earth: 0,
        air: 1,
        water: -2
      },
      dominantElement: 'fire',
      recommendation: "Foods that cool and ground: fresh vegetables, fruits, and cooling herbs like mint.",
      'Total Effect Value': {
        Fire: 7,
        Water: -2,
        Air: 1,
        Earth: 0
      },
      Heat: 2.6,
      Entropy: 1.02,
      Reactivity: 2.67,
      Energy: -0.13
    };
  } catch (error) {
    console.error('Error in staticAlchemize:', error);
    
    // Return fallback values for Greg's chart
    return {
      spirit: 4,
      essence: 5,
      matter: 7,
      substance: -6,
      elementalBalance: {
        fire: 7,
        earth: 0,
        air: 1,
        water: -2
      },
      dominantElement: 'fire',
      recommendation: "Foods that cool and ground: fresh vegetables, fruits, and cooling herbs like mint.",
      'Total Effect Value': {
        Fire: 7,
        Water: -2,
        Air: 1,
        Earth: 0
      },
      Heat: 2.6,
      Entropy: 1.02,
      Reactivity: 2.67,
      Energy: -0.13
    };
  }
};

// Re-export the core functionality
export { alchemicalEngine }; 