import { NutritionalProfile, FoodDataCentralFood } from '../types/nutrition';

import { FoodDataCentral } from './apiClients';

export class NutritionService {
  async getNutritionalProfile(fdcId: string): Promise<NutritionalProfile> {
    const data = await FoodDataCentral.getFood(fdcId);

    const foodData = data as unknown as FoodDataCentralFood

    return {
      calories: foodData.foodNutrients.find(n => n.nutrientNumber === '208')?.value || 0,
      macros: {
        protein: this.getNutrientValue(foodData, '203'),
        carbs: this.getNutrientValue(foodData, '205'),
        fat: this.getNutrientValue(foodData, '204'),
        fiber: this.getNutrientValue(foodData, '291'),
        sugars: this.getNutrientValue(foodData, '269')
      },
      vitamins: {
        vitaminC: this.getNutrientValue(foodData, '401'),
        vitaminA: this.getNutrientValue(foodData, '318'),
        vitaminD: this.getNutrientValue(foodData, '328')
      },
      minerals: {
        iron: this.getNutrientValue(foodData, '303'),
        calcium: this.getNutrientValue(foodData, '301'),
        potassium: this.getNutrientValue(foodData, '306')
      },
      phytonutrients: this.extractPhytonutrients(foodData)
    };
  }

  private getNutrientValue(data: FoodDataCentralFood, nutrientId: string): number {
    return data.foodNutrients.find(n => n.nutrientNumber === nutrientId)?.value || 0
  }

  private extractPhytonutrients(data: FoodDataCentralFood): Record<string, number> {
    return data.foodNutrients
      .filter(n => n.nutrientName?.includes('Phytonutrient'));
      .reduce(
        (acc: Record<string, number>, n) => ({
          ...acc,
          [n.nutrientName || '']: n.value || 0
        }),
        {},
      );
  }
}