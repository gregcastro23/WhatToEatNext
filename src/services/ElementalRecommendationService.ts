import type { 
  ElementalProperties, 
  Recipe,
  ZodiacSign,
  LunarPhase
} from '@/types/alchemy';
import { _elementalUtils } from '@/utils/elementalUtils';
import { ZODIAC_ELEMENTS } from '@/constants/elementalConstants';

/**
 * Service to generate comprehensive elemental-based food and recipe recommendations
 */
export class ElementalRecommendationService {
  /**
   * Generates a complete recommendation based on elemental properties
   * @param properties The elemental properties to base recommendations on
   * @returns A comprehensive recommendation object
   */
  public static generateRecommendation(properties: ElementalProperties): ElementalRecommendation {
    const profile = elementalUtils.getElementalProfile(properties);
    const dominantElement = this.getDominantElement(properties);

    // Fix TS2339: Property access on service object using safe type casting
    const utilsService = elementalUtils as unknown;

    return {
      elementalBalance: properties,
      dominantElement,
      cookingTechniques: elementalUtils.getSuggestedCookingTechniques(properties),
      // ✅ Pattern MM-1: getComplementaryElement expects element key, not ElementalProperties object
      complementaryIngredients: [elementalUtils.getComplementaryElement(dominantElement)],
      flavorProfiles: utilsService?.getFlavorProfileRecommendations?.(properties) || [],
      healthBenefits: utilsService?.getHealthBenefits?.(properties) || [],
      timeOfDay: elementalUtils.getRecommendedTimeOfDay(properties),
      seasonalBest: this.getSeasonalRecommendations(dominantElement),
      // Fix TS2339: Property access on array type using safe type casting
      moodEffects: (() => {
        const characteristics = profile.characteristics as unknown;
        return characteristics?.moodEffects || [];
      })(),
      culinaryHerbs: (() => {
        const characteristics = profile.characteristics as unknown;
        return characteristics?.culinaryHerbs || [];
      })()
    };
  }

  /**
   * Generates zodiac-specific recommendations
   * @param zodiacSign The zodiac sign to generate recommendations for
   * @returns A recommendation tailored to the zodiac sign
   */
  public static generateZodiacRecommendation(zodiacSign: ZodiacSign): ElementalRecommendation {
    const element = ZODIAC_ELEMENTS[zodiacSign];
    const properties = {
      Fire: element === 'Fire' ? 0.6 : 0.1,
      Water: element === 'Water' ? 0.6 : 0.1,
      Earth: element === 'Earth' ? 0.6 : 0.1,
      Air: element === 'Air' ? 0.6 : 0.1
    };

    return this.generateRecommendation(elementalUtils.normalizeProperties(properties));
  }

  /**
   * Generates lunar phase-specific recommendations
   * @param lunarPhase The lunar phase to generate recommendations for
   * @returns A recommendation tailored to the lunar phase
   */
  public static generateLunarRecommendation(lunarPhase: LunarPhase): ElementalRecommendation {
    // Map lunar phases to elemental properties
    const lunarElementalMap: Record<string, Partial<ElementalProperties>> = {
      'new moon': { Earth: 0.4, Air: 0.3 },
      'waxing crescent': { Fire: 0.3, Air: 0.4 },
      'first quarter': { Fire: 0.4, Air: 0.3 },
      'waxing gibbous': { Fire: 0.5, Water: 0.3 },
      'full moon': { Water: 0.5, Fire: 0.3 },
      'waning gibbous': { Water: 0.4, Earth: 0.3 },
      'last quarter': { Earth: 0.4, Water: 0.3 },
      'waning crescent': { Earth: 0.5, Air: 0.2 }
    };

    const properties = {
      Fire: lunarElementalMap[lunarPhase]?.Fire || 0.25,
      Water: lunarElementalMap[lunarPhase]?.Water || 0.25,
      Earth: lunarElementalMap[lunarPhase]?.Earth || 0.25,
      Air: lunarElementalMap[lunarPhase]?.Air || 0.25
    };

    return this.generateRecommendation(elementalUtils.normalizeProperties(properties));
  }

  /**
   * Generates recipe-specific recommendations based on the recipe's elemental balance
   * @param recipe The recipe to generate recommendations for
   * @returns A recommendation tailored to the recipe
   */
  public static generateRecipeRecommendation(recipe: Recipe): ElementalRecommendation {
    const properties = elementalUtils.calculateelementalState(recipe);
    return this.generateRecommendation(properties);
  }

  /**
   * Gets the dominant element from elemental properties
   * @param properties The elemental properties
   * @returns The dominant element
   */
  private static getDominantElement(properties: ElementalProperties): keyof ElementalProperties {
    return Object.entries(properties)
      .reduce((max, [element, value]) => 
        value > max.value ? { element: element as keyof ElementalProperties, value } : max, 
        { element: 'Fire' as keyof ElementalProperties, value: 0 }
      ).element;
  }

  /**
   * Gets seasonal recommendations based on element
   * @param element The dominant element
   * @returns Array of seasonal recommendations
   */
  private static getSeasonalRecommendations(element: keyof ElementalProperties): string[] {
    const seasonalMap: Record<keyof ElementalProperties, string[]> = {
      'Fire': ['Summer', 'Late Spring'],
      'Water': ['Winter', 'Late Autumn'],
      'Earth': ['Autumn', 'Late Summer'],
      'Air': ['Spring', 'Early Summer']
    };

    return seasonalMap[element] || ['Any season'];
  }
}

/**
 * Comprehensive elemental recommendation type
 */
export interface ElementalRecommendation {
  elementalBalance: ElementalProperties;
  dominantElement: keyof ElementalProperties;
  cookingTechniques: string[];
  complementaryIngredients: string[];
  flavorProfiles: string[];
  healthBenefits: string[];
  timeOfDay: string[];
  seasonalBest: string[];
  moodEffects: string[];
  culinaryHerbs: string[];
}

export default ElementalRecommendationService; 