import type { 
  ThermodynamicProperties,
  Planet,
  ZodiacSign,
  Season,
  Recipe,
  UnifiedIngredient,
  CookingMethod,
  ElementalProfile } from '../types';
import { getCurrentSeason } from '@/utils/dateUtils';
import { recipe } from '@/types/seasons';

import { _Element, _ElementalProperties } from "@/types/alchemy";
import alchemicalEngine, { AlchemicalEngine } from '@/calculations/core/alchemicalEngine';

/**
 * AlchemicalRecommendation interface for providing structured recommendations
 */
export interface AlchemicalRecommendation {
  dominantElement: keyof ElementalProperties;thermodynamics: ThermodynamicProperties;
  recommendedIngredients: string[];
  recommendedCookingMethods: string[];
  recommendations: string[];
  warnings: string[];
}

/**
 * Service for generating alchemical recommendations based on planetary positions
 * Uses the AlchemicalEngine as its core calculation engine
 */
export class AlchemicalRecommendationService {
  private static instance: AlchemicalRecommendationService;
  private engine: AlchemicalEngine;
  
  private constructor() {
    this.engine = alchemicalEngine as unknown as AlchemicalEngine;
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AlchemicalRecommendationService {
    if (!AlchemicalRecommendationService.instance) {
      AlchemicalRecommendationService.instance = new AlchemicalRecommendationService();
    }
    return AlchemicalRecommendationService.instance;
  }
  
  /**
   * Generate recommendations based on planetary positions
   */
  public generateRecommendations(
    planetaryPositions: Record<Planet, ZodiacSign>,
    ingredients: UnifiedIngredient[],
    cookingMethods: CookingMethod[]
  ): AlchemicalRecommendation {
    // Calculate thermodynamic properties using the engine
    const thermodynamics = this.engine.alchemize(planetaryPositions as unknown as { [planet: string]: string });
    
    // Convert thermodynamic properties to elemental properties
    const elementalBalance = this.deriveElementalProperties(thermodynamics);
    
    // Determine dominant element
    const dominantElement = this.getDominantElement(elementalBalance);
    
    // Filter ingredients by elemental compatibility
    const compatibleIngredients = this.findCompatibleIngredients(
      ingredients,
      elementalBalance,
      thermodynamics
    );
    
    // Filter cooking methods by elemental compatibility
    const compatibleMethods = this.findCompatibleCookingMethods(
      cookingMethods,
      elementalBalance,
      thermodynamics
    );
    
    // Generate specific recommendations
    const recommendations = this.generateTextRecommendations(
      elementalBalance,
      thermodynamics,
      dominantElement
    );
    
    // Generate any warnings if needed
    const warnings = this.generateWarnings(thermodynamics);
    
    return {
      dominantElement,
      thermodynamics,
      recommendedIngredients: (compatibleIngredients || []).map(i => i.name),
      recommendedCookingMethods: (compatibleMethods || []).map(method => method.toString()),
      recommendations,
      warnings
    };
  }
  
  /**
   * Find compatible ingredients based on elemental properties
   */
  private findCompatibleIngredients(
    ingredients: UnifiedIngredient[],
    elementalProperties: ElementalProperties,
    thermodynamics: ThermodynamicProperties
  ): UnifiedIngredient[] {
    return ingredients
      .map(ingredient => ({
        ingredient,
        score: this.engine.calculateElementalCompatibility(
          elementalProperties,
          ingredient.elementalPropertiesState as unknown as ElementalProperties
        )
      }))
      .filter(({ score }) => score > 0.7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ ingredient }) => ingredient);
  }
  
  /**
   * Find compatible cooking methods based on elemental properties
   */
  private findCompatibleCookingMethods(
    methods: CookingMethod[],
    elementalProperties: ElementalProperties,
    thermodynamics: ThermodynamicProperties
  ): CookingMethod[] {
    return methods
      .map(method => {
        const methodData = method as unknown as Record<string, unknown>;
        return {
          method,
          score: this.engine.calculateElementalCompatibility(
            elementalProperties,
            (methodData?.elementalState as ElementalProperties) || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
          )
        };
      })
      .filter(({ score }) => score > 0.7)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ method }) => method);
  }
  
  /**
   * Generate text recommendations based on elemental properties
   */
  private generateTextRecommendations(
    elementalProperties: ElementalProperties,
    thermodynamics: ThermodynamicProperties,
    dominantElement: keyof ElementalProperties
  ): string[] {
    const recommendations: string[] = [];
    
    // Add recommendations based on dominant element
    switch (dominantElement) {
      case 'Fire':
        recommendations?.push('Focus on cooking methods that enhance flavors through high heat.');
        recommendations?.push('Use bold, bright spices and seasonings.');
        break;
      case 'Water':
        recommendations?.push('Use moisture-based cooking methods for best results.');
        recommendations?.push('Focus on aromatic and liquid-based ingredients.');
        break;
      case 'Earth':
        recommendations?.push('Root vegetables and hearty dishes will be most satisfying.');
        recommendations?.push('Slow cooking methods will yield the best results.');
        break;
      case 'Air':
        recommendations?.push('Light cooking methods will enhance flavors today.');
        recommendations?.push('Incorporate aromatic herbs and light textures.');
        break;
    }
    
    // Add recommendations based on thermodynamics
    if (thermodynamics.heat > 0.7) {
      recommendations?.push('The planetary energy is highly active - cooking quickly will preserve this energy.');
    }
    
    if (thermodynamics.entropy > 0.7) {
      recommendations?.push('Current conditions favor experimentation and fusion cooking.');
    }
    
    // Fix TS2339: Property 'kalchm' does not exist on type 'ThermodynamicProperties'
    const thermodynamicsData = thermodynamics as unknown;
    if ((thermodynamicsData as Record<string, unknown>)?.kalchm && typeof (thermodynamicsData as Record<string, unknown>).kalchm === 'number' && (thermodynamicsData as Record<string, unknown>).kalchm > 2.0) {
      recommendations?.push('Exceptional transformation potential - fermentation and aging processes are enhanced.');
    }
    
    // Add seasonal recommendation
    const currentSeason = getCurrentSeason();
    recommendations?.push(`${currentSeason.charAt(0)?.toUpperCase() + currentSeason?.slice(1)} ingredients will be especially potent.`);
    
    return recommendations;
  }
  
  /**
   * Generate warnings based on thermodynamic properties
   */
  private generateWarnings(thermodynamics: ThermodynamicProperties): string[] {
    const warnings: string[] = [];
    
    if (thermodynamics.entropy > 0.9) {
      warnings?.push('High entropy may lead to unpredictable cooking results - measure ingredients precisely.');
    }
    
    if (thermodynamics.reactivity > 0.8) {
      warnings?.push('Heightened reactivity may cause flavor clashes - simplify ingredient combinations.');
    }
    
    // Fix TS2339: Property 'kalchm' does not exist on type 'ThermodynamicProperties'
    const warningsThermodynamicsData = thermodynamics as unknown;
    if ((warningsThermodynamicsData as Record<string, unknown>)?.kalchm && typeof (warningsThermodynamicsData as Record<string, unknown>).kalchm === 'number' && (warningsThermodynamicsData as Record<string, unknown>).kalchm < 0.5) {
      warnings?.push('Low kalchm levels indicate poor transformation potential - avoid fermentation or chemical leavening.');
    }
    
    return warnings;
  }
  
  /**
   * Get the dominant element from elemental properties
   */
  private getDominantElement(properties: ElementalProperties): keyof ElementalProperties {
    // Initialize with Fire element
    let maxElement: keyof ElementalProperties = 'Fire';
    
    // Get the value for Fire - try lowercase first, then capitalized
    let maxValue = properties.Fire !== undefined ? properties.Fire : 
                  (properties.Fire !== undefined ? properties.Fire : 0);
    
    // Check Water
    const waterValue = properties.Water !== undefined ? properties.Water : 
                      (properties.Water !== undefined ? properties.Water : 0);
    if (waterValue > maxValue) {
      maxElement = 'Water';
      maxValue = waterValue;
    }
    
    // Check Earth
    const earthValue = properties.Earth !== undefined ? properties.Earth : 
                      (properties.Earth !== undefined ? properties.Earth : 0);
    if (earthValue > maxValue) {
      maxElement = 'Earth';
      maxValue = earthValue;
    }
    
    // Check Air
    const AirValue = properties.Air !== undefined ? properties.Air : 
                    (properties.Air !== undefined ? properties.Air : 0);
    if (AirValue > maxValue) {
      maxElement = 'Air';
      maxValue = AirValue;
    }
    
    return maxElement;
  }
  
  /**
   * Derive elemental properties from thermodynamic properties
   */
  private deriveElementalProperties(thermodynamics: ThermodynamicProperties): ElementalProperties {
    // Fix TS2339: Property 'monica' and 'kalchm' do not exist on type 'ThermodynamicProperties'
    const derivedThermodynamicsData = thermodynamics as unknown;
    
    // Simplified mapping from thermodynamics to elemental properties
    const Fire = thermodynamics.heat * 0.7 + thermodynamics.reactivity * 0.3;
    const Water = ((derivedThermodynamicsData as Record<string, unknown>)?.monica && typeof (derivedThermodynamicsData as Record<string, unknown>).monica === 'number' ? (derivedThermodynamicsData as Record<string, unknown>).monica : 0) * 0.6 + (1 - thermodynamics.heat) * 0.4;
    const _Earth = ((derivedThermodynamicsData as Record<string, unknown>)?.kalchm && typeof (derivedThermodynamicsData as Record<string, unknown>).kalchm === 'number' ? (derivedThermodynamicsData as Record<string, unknown>).kalchm : 0) * 0.5 + (1 - thermodynamics.entropy) * 0.5;
    const Air = thermodynamics.entropy * 0.8 + thermodynamics.reactivity * 0.2;
    
    // Normalize to ensure values sum to 1
    const total = Fire + Water + _Earth + Air;
    
    return { Fire: Fire / total, Water: Water / total, Earth: _Earth / total, Air: Air / total
    };
  }
  
  /**
   * Get recommendations for a specific recipe
   */
  public getRecipeRecommendations(
    recipe: Recipe,
    planetaryPositions: Record<Planet, ZodiacSign>
  ): {
    compatibility: number;
    suggestions: string[];
    adjustments: string[];
  } {
    // Calculate thermodynamic properties using the engine
    const thermodynamics = this.engine.alchemize(planetaryPositions as unknown as { [planet: string]: string });
    
    // Convert thermodynamic properties to elemental properties
    const currentElementalProperties = this.deriveElementalProperties(thermodynamics);
    
    // Get recipe's elemental properties (or use default if not present)
    const recipeElementalProperties = (recipe.elementalState as unknown) || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    };
    
    // Calculate compatibility
    const compatibility = this.engine.calculateElementalCompatibility(
      currentElementalProperties as unknown as ElementalProperties,
      recipeElementalProperties as unknown as ElementalProperties
    );
    
    // Generate suggestions based on compatibility
    const suggestions: string[] = [];
    const adjustments: string[] = [];
    
    if (compatibility > 0.8) {
      suggestions?.push('This recipe is highly compatible with current planetary alignments.');
      suggestions?.push('Focus on traditional preparation methods for best results.');
    } else if (compatibility > 0.6) {
      suggestions?.push('This recipe has good compatibility with current planetary alignments.');
      suggestions?.push('Consider minor adjustments to enhance its elemental balance.');
      
      // Generate specific adjustments
      const dominantElement = this.getDominantElement(currentElementalProperties);
      switch (dominantElement) {
        case 'Fire':
          adjustments?.push('Add a touch of heat through spices or higher cooking temperature.');
          break;
        case 'Water':
          adjustments?.push('Increase moisture content or cooking time in liquid.');
          break;
        case 'Earth':
          adjustments?.push('Add root vegetables or earthy spices like cumin or coriander.');
          break;
        case 'Air':
          adjustments?.push('Incorporate aromatic herbs or use more whipping/folding techniques.');
          break;
      }
    } else {
      suggestions?.push('This recipe may need significant adjustments for current planetary alignments.');
      
      // Generate more substantial adjustments
      const recipeElement = this.getDominantElement(recipeElementalProperties as unknown as ElementalProperties);
      const currentElement = this.getDominantElement(currentElementalProperties);
      
      adjustments?.push(`Transform the recipe's dominant ${recipeElement} energy toward ${currentElement} energy.`);
      
      switch (currentElement) {
        case 'Fire':
          adjustments?.push('Use direct heat cooking methods rather than indirect methods.');
          adjustments?.push('Add warming spices like ginger, chili, or black pepper.');
          break;
        case 'Water':
          adjustments?.push('Convert to a stew, soup, or braised preparation.');
          adjustments?.push('Incorporate more liquid ingredients and Water-rich vegetables.');
          break;
        case 'Earth':
          adjustments?.push('Add grounding ingredients like root vegetables or mushrooms.');
          adjustments?.push('Use slow cooking methods to deepen flavors.');
          break;
        case 'Air':
          adjustments?.push('Lighten the dish with fresh herbs and citrus zest.');
          adjustments?.push('Incorporate more whipping, aeration, or leavening.');
          break;
      }
    }
    
    return {
      compatibility,
      suggestions,
      adjustments
    };
  }
}

// Export a singleton instance for use across the application
export const alchemicalRecommendationService = AlchemicalRecommendationService.getInstance();

// Export default for compatibility with existing code
export default alchemicalRecommendationService; 