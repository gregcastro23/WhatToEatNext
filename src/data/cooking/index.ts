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
  import { COOKING_METHOD_ELEMENTS } from '@/types/alchemy';
  import { getCookingMethodPillar, applyPillarTransformation } from '../../utils/alchemicalPillarUtils';
  import { getRecommendedCookingMethodsForIngredient } from '../../utils/alchemicalTransformationUtils';
  import { AlchemicalItem } from '../../calculations/alchemicalTransformation';
  import { transformItemWithPlanetaryPositions } from '../../calculations/alchemicalTransformation';
  import { ingredients } from '@/data/ingredients';
  
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
    alchemicalCompatibility?: number;
  }> => {
    // Convert ingredient to AlchemicalItem format for pillar transformations
    const ingredientItem: AlchemicalItem = {
      id: ingredient,
      name: ingredient,
      elementalProperties: getIngredientElementalProperties(ingredient),
      // Add additional properties that might be required by the alchemical system
      dominantElement: getDominantElementForIngredient(ingredient),
      dominantAlchemicalProperty: getDominantAlchemicalPropertyForIngredient(ingredient),
      spirit: 0.5,
      essence: 0.5,
      matter: 0.5,
      substance: 0.5
    };
    
    // Transform ingredient using current astrological state
    const transformedIngredient = transformIngredientWithAstrology(ingredientItem, astroState);
    
    // Get all cooking methods as AlchemicalItems
    const cookingMethodItems = Object.entries(cookingMethods)
      .map(([methodId, data]) => ({
        id: methodId,
        name: methodId,
        elementalProperties: data.elementalEffect || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        dominantElement: getDominantElementForCookingMethod(methodId as CookingMethod),
        dominantAlchemicalProperty: getDominantAlchemicalPropertyForCookingMethod(methodId as CookingMethod)
      } as AlchemicalItem));
    
    // Filter methods by suitability for the ingredient
    const suitableMethods = Object.entries(cookingMethods)
      .filter(([_, data]) => 
        data.suitable_for.some(item => 
          ingredient.toLowerCase().includes(item.toLowerCase())
        )
      );
    
    // Get recommendations based on alchemical pillar transformations
    const pillarRecommendations = getRecommendedCookingMethodsForIngredient(
      transformedIngredient,
      cookingMethodItems
    );
    
    // Combine traditional scoring with new alchemical pillar scoring
    return suitableMethods.map(([method, data]) => {
      // Get traditional scores
      const suitability = data.suitable_for.length / 5; // Normalized to 0-1
      const astrologicalAlignment = getAstrologicalEffect(method as CookingMethod, astroState);
      
      // Get alchemical pillar compatibility score if available
      const pillarScore = pillarRecommendations.find(rec => rec.method === method)?.compatibility || 0.5;
      
      return {
        method: method as CookingMethod,
        suitability,
        astrologicalAlignment,
        alchemicalCompatibility: pillarScore
      };
    })
    .sort((a, b) => {
      // Create a combined score that weighs all three factors
      const aScore = (a.suitability * 0.3) + (a.astrologicalAlignment * 0.3) + (a.alchemicalCompatibility * 0.4);
      const bScore = (b.suitability * 0.3) + (b.astrologicalAlignment * 0.3) + (b.alchemicalCompatibility * 0.4);
      return bScore - aScore;
    });
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

  /**
   * Get elemental properties for an ingredient (simple implementation)
   */
  function getIngredientElementalProperties(ingredient: string): Record<string, number> {
    // Try to get from ingredient database first
    const knownIngredient = Object.entries(ingredients).find(
      ([_, data]) => data.name.toLowerCase() === ingredient.toLowerCase()
    );
    
    if (knownIngredient && knownIngredient[1].elementalProperties) {
      return knownIngredient[1].elementalProperties;
    }
    
    // Simple fallback based on ingredient categories
    const props = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    
    // Adjust based on common ingredient categories
    if (ingredient.match(/meat|beef|pork|lamb|chicken|turkey/i)) {
      props.Fire = 0.4;
      props.Earth = 0.3;
    } else if (ingredient.match(/fish|seafood|shrimp|crab|lobster/i)) {
      props.Water = 0.5;
      props.Air = 0.3;
    } else if (ingredient.match(/vegetable|carrot|potato|onion|garlic/i)) {
      props.Earth = 0.5;
      props.Water = 0.3;
    } else if (ingredient.match(/fruit|apple|orange|berry|banana/i)) {
      props.Water = 0.4;
      props.Air = 0.4;
    } else if (ingredient.match(/herb|spice|pepper|cinnamon|mint/i)) {
      props.Air = 0.5;
      props.Fire = 0.3;
    } else if (ingredient.match(/grain|rice|wheat|oat|barley|corn/i)) {
      props.Earth = 0.6;
      props.Air = 0.2;
    } else if (ingredient.match(/dairy|milk|cheese|yogurt|cream/i)) {
      props.Water = 0.5;
      props.Earth = 0.3;
    }
    
    return props;
  }

  /**
   * Get dominant element for an ingredient
   */
  function getDominantElementForIngredient(ingredient: string): string {
    const props = getIngredientElementalProperties(ingredient);
    return Object.entries(props).reduce(
      (max, [element, value]) => value > (props[max] || 0) ? element : max, 
      'Fire'
    );
  }

  /**
   * Get dominant alchemical property for an ingredient
   */
  function getDominantAlchemicalPropertyForIngredient(ingredient: string): string {
    const elementProps = getIngredientElementalProperties(ingredient);
    
    // Calculate alchemical properties from elemental ones
    const spirit = elementProps.Fire * 0.6 + elementProps.Air * 0.4;
    const essence = elementProps.Water * 0.6 + elementProps.Fire * 0.4;
    const matter = elementProps.Earth * 0.7 + elementProps.Water * 0.3;
    const substance = elementProps.Air * 0.6 + elementProps.Earth * 0.4;
    
    const alchemicalProps = { Spirit: spirit, Essence: essence, Matter: matter, Substance: substance };
    
    return Object.entries(alchemicalProps).reduce(
      (max, [prop, value]) => value > (alchemicalProps[max as keyof typeof alchemicalProps] || 0) ? prop : max, 
      'Spirit'
    );
  }

  /**
   * Get dominant element for a cooking method
   */
  function getDominantElementForCookingMethod(method: CookingMethod): string {
    // Use the COOKING_METHOD_ELEMENTS if available
    if (COOKING_METHOD_ELEMENTS[method]) {
      return COOKING_METHOD_ELEMENTS[method];
    }
    
    // Fallback to the cooking method's elemental effect
    const methodData = cookingMethods[method];
    if (methodData && methodData.elementalEffect) {
      return Object.entries(methodData.elementalEffect).reduce(
        (max, [element, value]) => value > (methodData.elementalEffect[max as keyof typeof methodData.elementalEffect] || 0) ? element : max, 
        'Fire'
      );
    }
    
    // Default based on common patterns
    if (method.match(/grill|roast|bake|fry|broil/i)) return 'Fire';
    if (method.match(/boil|steam|poach|simmer/i)) return 'Water';
    if (method.match(/ferment|pickle|cure|dry/i)) return 'Earth';
    if (method.match(/raw|freeze|chill|smoke/i)) return 'Air';
    
    return 'Fire'; // Default
  }

  /**
   * Get dominant alchemical property for a cooking method
   */
  function getDominantAlchemicalPropertyForCookingMethod(method: CookingMethod): string {
    // Check if we have a pillar mapping for this method
    const pillar = getCookingMethodPillar(method);
    if (pillar) {
      // Get the property that this pillar most strongly affects
      const effects = pillar.effects;
      return Object.entries(effects).reduce(
        (max, [prop, effect]) => effect > (effects[max as keyof typeof effects] || -1) ? prop : max, 
        'Spirit'
      );
    }
    
    // Fallback to elemental-based calculation
    const element = getDominantElementForCookingMethod(method);
    
    switch (element) {
      case 'Fire': return 'Spirit';
      case 'Water': return 'Essence';
      case 'Earth': return 'Matter';
      case 'Air': return 'Substance';
      default: return 'Spirit';
    }
  }

  /**
   * Transform an ingredient using current astrological state
   */
  function transformIngredientWithAstrology(ingredient: AlchemicalItem, astroState: AstrologicalState): AlchemicalItem {
    // Convert astrological state to planetary positions format
    const planetPositions = Object.entries(astroState.planetaryPositions || {}).reduce(
      (positions, [planet, data]) => {
        positions[planet] = {
          sign: data.sign,
          degree: data.degree,
          isRetrograde: data.isRetrograde,
          exactLongitude: data.exactLongitude || data.degree
        };
        return positions;
      },
      {} as Record<string, any>
    );
    
    // Transform the ingredient
    return transformItemWithPlanetaryPositions(
      ingredient,
      planetPositions,
      astroState.isDaytime || true,
      astroState.zodiacSign,
      astroState.lunarPhase
    );
  }