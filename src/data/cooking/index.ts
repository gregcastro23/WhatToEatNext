// src/data/cooking/index.ts

import cookingMethods, { 
    getAstrologicalEffect, 
    calculateModifiedElementalEffect 
  } from './cookingMethods';
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
  
  export {
    cookingMethods,
    getAstrologicalEffect,
    calculateModifiedElementalEffect,
    type CookingMethodData
  };