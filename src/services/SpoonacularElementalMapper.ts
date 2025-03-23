import type { ElementalProperties } from '@/types/alchemy';
import type { Recipe } from '@/types/recipe';
import type { NutritionalProfile } from '@/types/nutrition';

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

export class SpoonacularElementalMapper {
  private static nutrientElementMap: Record<string, keyof ElementalProperties> = {
    '301': 'Earth',  // Calcium
    '303': 'Fire',   // Iron
    '306': 'Water',  // Potassium
    '401': 'Air',    // Vitamin C
    '318': 'Fire',   // Vitamin A
    '328': 'Earth',  // Vitamin D
    '291': 'Earth',  // Fiber
    '269': 'Water'   // Sugars
  };

  public static mapIngredient(ingredient: string): keyof ElementalProperties {
    return this.nutrientElementMap[ingredient.toLowerCase()] || 'Earth';
  }

  async getEnhancedElementalProfile(ingredientId: number): Promise<ElementalProperties> {
    const [details, nutrition] = await Promise.all([
      spoonacularApi.getIngredientDetails(ingredientId),
      nutritionService.getNutritionalProfile(ingredientId.toString())
    ]);

    // Base mapping from Spoonacular
    const baseElements = this.getBaseElementalMapping(details);
    
    // Enhanced nutritional mapping
    const nutritionalElements = this.mapNutritionToElements(nutrition);
    
    // Combine with dynamic weights
    return this.combineElements(
      baseElements, 
      nutritionalElements,
      { 
        Fire: 0.6,  // Prioritize nutritional factors
        Water: 0.6,
        Earth: 0.8, // Higher weight for earth elements (minerals)
        Air: 0.5 
      }
    );
  }

  private mapNutritionToElements(nutrition: NutritionalProfile): ElementalProperties {
    return Object.entries(nutrition).reduce((acc, [category, values]) => {
      if (typeof values === 'object') {
        Object.entries(values).forEach(([name, value]) => {
          const element = this.nutrientElementMap[
            Object.keys(this.nutrientElementMap).find(key => 
              name.toLowerCase().includes(key.toLowerCase())
            ) || 'Earth'
          ];
          acc[element] += this.normalizeValue(value, category);
        });
      }
      return acc;
    }, { Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  private normalizeValue(value: number, category: string): number {
    const ranges: Record<string, number> = {
      vitamins: 100,  // IU
      minerals: 100,  // mg
      macros: 1000,   // g
      phytonutrients: 10
    };
    return Math.tanh(value / (ranges[category] || 100));
  }

  private scaleValue(rawValue: number): number {
    return Math.min(1, Math.max(0, rawValue / 100)); // Keep between 0-1
  }

  private combineElements(
    base: ElementalProperties,
    nutrition: ElementalProperties,
    weights: ElementalProperties
  ): ElementalProperties {
    return {
      Fire: (base.Fire * 0.4) + (nutrition.Fire * weights.Fire),
      Water: (base.Water * 0.4) + (nutrition.Water * weights.Water),
      Earth: (base.Earth * 0.3) + (nutrition.Earth * weights.Earth),
      Air: (base.Air * 0.3) + (nutrition.Air * weights.Air)
    };
  }
}