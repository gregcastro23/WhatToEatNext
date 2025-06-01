import { FoodDataCentral } from './apiClients';
import { NutritionalProfile, FoodDataCentralFood } from '../types/nutrition';

export class NutritionService {
  async getNutritionalProfile(fdcId: string): Promise<NutritionalProfile> {
    const data = await FoodDataCentral.getFood(fdcId);
    
    return {
      calories: data.foodNutrients.find(n => n.nutrientNumber === '208')?.value || 0,
      macros: {
        protein: this.getNutrientValue(data, '203'),
        carbs: this.getNutrientValue(data, '205'),
        fat: this.getNutrientValue(data, '204'),
        fiber: this.getNutrientValue(data, '291'),
        sugars: this.getNutrientValue(data, '269')
      },
      vitamins: {
        vitaminC: this.getNutrientValue(data, '401'),
        vitaminA: this.getNutrientValue(data, '318'),
        vitaminD: this.getNutrientValue(data, '328')
      },
      minerals: {
        iron: this.getNutrientValue(data, '303'),
        calcium: this.getNutrientValue(data, '301'),
        potassium: this.getNutrientValue(data, '306')
      },
      phytonutrients: this.extractPhytonutrients(data)
    };
  }

  private getNutrientValue(data: FoodDataCentralFood, nutrientId: string): number {
    return data.foodNutrients.find(n => 
      n.nutrientNumber === nutrientId
    )?.value || 0;
  }

  private extractPhytonutrients(data: FoodDataCentralFood): Record<string, number> {
    return data.foodNutrients
      .filter(n => n.nutrientName?.includes('Phytonutrient'))
      .reduce((acc: Record<string, number>, n) => ({
        ...acc,
        [n.nutrientName || '']: n.value || 0
      }), {});
  }
} 