import { FoodDataCentral } from './apiClients';

interface NutritionalProfile {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugars: number;
  };
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  phytonutrients: Record<string, number>;
}

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

  private getNutrientValue(data: any, nutrientId: string): number {
    return data.foodNutrients.find((n: any) => 
      n.nutrientNumber === nutrientId
    )?.value || 0;
  }

  private extractPhytonutrients(data: any): Record<string, number> {
    return data.foodNutrients
      .filter((n: any) => n.nutrientName?.includes('Phytonutrient'))
      .reduce((acc: Record<string, number>, n: any) => ({
        ...acc,
        [n.nutrientName]: n.value
      }), {});
  }
} 