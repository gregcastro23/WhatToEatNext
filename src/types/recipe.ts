export type ElementalBalance = {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
};

export type Ingredient = {
    name: string;
    amount: string;
    unit: string;
    category: string;
    swaps?: string[];
};

export type Recipe = {
    name: string;
    description: string;
    cuisine: string;
    ingredients: Ingredient[];
    nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        vitamins: string[];
        minerals: string[];
    };
    timeToMake: string;
    season: ('all' | 'summer' | 'winter')[];
    mealType: ('breakfast' | 'lunch' | 'dinner' | 'dessert')[];
    elementalProperties: ElementalBalance;
};

export type SeasonalRecipes = {
    all?: Recipe[];
    summer?: Recipe[];
    winter?: Recipe[];
};

export type Dishes = {
    breakfast?: SeasonalRecipes;
    lunch?: SeasonalRecipes;
    dinner?: SeasonalRecipes;
    dessert?: SeasonalRecipes;
};

export type Cuisine = {
    name: string;
    description: string;
    dishes: Dishes;
    elementalBalance: ElementalBalance;
};

export type CuisineMap = {
    [key: string]: Cuisine;
};