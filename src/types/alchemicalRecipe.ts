import type {
  ZodiacSignType,
  CuisineType,
  Season,
  SpiceLevel,
  MealType,
  CookingMethod,
  Planet as PlanetName,
  LunarPhase
} from "./constants";
export interface AlchemicalIngredient {
  amount: number;
  unit: string;
  name: string;
  notes: string;
}

export interface RecipeAlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export interface RecipeThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

export interface AlchemicalRecipe {
  id?: string;
  name: string;
  description: string;
  details: {
    cuisine: CuisineType | string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    baseServingSize: number;
    spiceLevel: SpiceLevel | string;
    season: Season[];
  };
  ingredients: AlchemicalIngredient[];
  instructions: string[];
  classifications: {
    mealType: MealType[];
    cookingMethods: CookingMethod[];
  };
  elementalProperties: {
    Fire: number; // Capitalized to match project interface
    Water: number;
    Earth: number;
    Air: number;
  };
  astrologicalAffinities: {
    planets: PlanetName[];
    signs: ZodiacSignType[];
    lunarPhases: LunarPhase[];
  };
  alchemicalProperties: RecipeAlchemicalProperties;
  thermodynamicProperties: RecipeThermodynamicProperties;
  nutritionPerServing: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    sodiumMg: number;
    sugarG: number;
    vitamins: string[];
    minerals: string[];
  };
  substitutions: Array<{
    originalIngredient: string;
    substituteOptions: string[];
  }>;
}
