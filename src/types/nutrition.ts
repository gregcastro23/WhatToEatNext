/**
 * Represents a nutritional profile for food items.
 * This interface defines the structure of nutritional data used throughout the application.
 */
export interface NutritionalProfile {
  // Macronutrients
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    [key: string]: number | undefined;
  };
  
  // Vitamins
  vitamins?: {
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
    thiamin?: number;
    riboflavin?: number;
    niacin?: number;
    b6?: number;
    b12?: number;
    folate?: number;
    [key: string]: number | undefined;
  };
  
  // Minerals
  minerals?: {
    calcium?: number;
    iron?: number;
    magnesium?: number;
    phosphorus?: number;
    potassium?: number;
    sodium?: number;
    zinc?: number;
    [key: string]: number | undefined;
  };
  
  // Phytonutrients and other nutritional components
  phytonutrients?: {
    antioxidants?: number;
    flavonoids?: number;
    carotenoids?: number;
    [key: string]: number | undefined;
  };
  
  // Allow for additional nutrition categories
  [key: string]: Record<string, number | undefined> | undefined;
} 