// src/data/cooking/index.ts

import cookingMethods, { 
    getAstrologicalEffect, 
    calculateModifiedElementalEffect 
  } from './cookingMethods';
  import { molecularCookingMethods } from './molecularMethods';
  // If you have a traditionalMethods file, import from it here
  // import { traditionalMethods } from './traditionalMethods';
  import type { 
    CookingMethod, 
    ElementalProperties, 
    AstrologicalState 
  } from '@/types/alchemy';
  
  export interface CookingState {
    method: CookingMethod;
    duration: number;
    temperature?: number;
    astrologicalState: AstrologicalState;
    modifiers?: {
      seasonings?: string[];
      techniques?: string[];
    };
  }
  
  export const getCookingRecommendations = (
    ingredient: string,
    astroState: AstrologicalState
  ): Array<{
    method: CookingMethod;
    suitability: number;
    astrologicalAlignment: number;
  }> => {
    return Object.entries(cookingMethods)
      .filter(([_, data]) => 
        data.suitable_for.some(item => 
          ingredient.toLowerCase().includes(item.toLowerCase())
        )
      )
      .map(([method, data]) => ({
        method: method as CookingMethod,
        suitability: data.suitable_for.length / 5, // Normalized to 0-1
        astrologicalAlignment: getAstrologicalEffect(method as CookingMethod, astroState)
      }))
      .sort((a, b) => 
        (b.suitability * b.astrologicalAlignment) - 
        (a.suitability * a.astrologicalAlignment)
      );
  };
  
  // Aggregated exports of all cooking methods
  export const allCookingMethods = {
    ...cookingMethods,
    ...molecularCookingMethods,
    // Add traditionalMethods here if you have them
    // ...traditionalMethods
  };
  
  // Export individual items
  export {
    cookingMethods,
    molecularCookingMethods,
    getAstrologicalEffect,
    calculateModifiedElementalEffect
  };
  
  // If you need to export types
  export type { CookingMethodData } from './cookingMethods';