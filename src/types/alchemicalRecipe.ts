export interface AlchemicalIngredient {
  amount: number;
  unit: string;
  name: string;
  notes: string;
}

export interface AlchemicalRecipe {
  recipe_name: string;
  description: string;
  details: {
    cuisine: string;
    prep_time_minutes: number;
    cook_time_minutes: number;
    base_serving_size: number;
    spice_level: string;
    season: string[];
  };
  ingredients: AlchemicalIngredient[];
  instructions: string[];
  classifications: {
    meal_type: string[];
    cooking_methods: string[];
  };
  elemental_properties: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  astrological_affinities: {
    planets: string[];
    signs: string[];
    lunar_phases: string[];
  };
  nutrition_per_serving: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
    sugar_g: number;
    vitamins: string[];
    minerals: string[];
  };
  substitutions: Array<{
    original_ingredient: string;
    substitute_options: string[];
  }>;
}
