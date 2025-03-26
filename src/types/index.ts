// Time-related types
export const MEAL_TIMES = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type MealTime = typeof MEAL_TIMES[number];

export const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all'] as const;
export type Season = typeof SEASONS[number];

// Recipe and ingredient types
export interface Ingredient {
  name: string;
  category: string;
  amount: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
}

export interface Dish {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  timeToMake: string;
  nutrition: Nutrition;
}

export interface FilterOptions {
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
}

export interface NutritionPreferences {
  lowCalorie: boolean;
  highProtein: boolean;
  lowCarb: boolean;
}

export type TimeData = {
  [season in Season]?: Dish[];
};

export type CuisineData = {
  name: string;
  dishes: {
    [mealTime in MealTime]?: TimeData;
  };
};

export type Cuisines = {
  [id: string]: CuisineData;
};

// Helper type for time-based context
export type TimeOfDay = {
  hour: number;
  minute: number;
  period: MealTime;
  season: Season;
};

export enum CuisineType {
  ITALIAN = 'ITALIAN',
  // ... other cuisines
}