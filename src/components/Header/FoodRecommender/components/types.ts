// src / (components || 1)/FoodRecommender / (types || 1).ts
export type FilterOptions = {
    dietary: {
      vegetarian: boolean;
      vegan: boolean;
      glutenFree: boolean;
      dairyFree: boolean;
    };
    time: {
      quick: boolean;
      medium: boolean;
      long: boolean;
    };
    spice: {
      mild: boolean;
      medium: boolean;
      spicy: boolean;
    };
    temperature: {
      hot: boolean;
      cold: boolean;
    };
  };
  
  export type NutritionPreferences = {
    lowCalorie: boolean;
    highProtein: boolean;
    lowCarb: boolean;
  };
  
  export type Ingredient = {
    name: string;
    amount: string;
    unit: string;
    category: string;
    swaps?: string[];
  };
  
  export type Nutrition = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamins?: string[];
    minerals?: string[];
  };
  
  export type Dish = {
    name: string;
    description: string;
    cuisine: string;
    ingredients: Ingredient[];
    nutrition: Nutrition;
    timeToMake: string;
    season: string[];
    mealType: string[];
  };