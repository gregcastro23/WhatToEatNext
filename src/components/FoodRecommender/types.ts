// Define the Nutrition type based on how it's used in NutritionDisplay
export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
  minerals?: string[];
} 