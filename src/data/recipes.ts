export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  swaps?: string[];
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
  minerals?: string[];
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: Ingredient[];
  nutrition: Nutrition;
  timeToMake: string;
  season: string[];
  cuisine: string;
  mealType: string[];
  elementalBalance: Record<string, number>; // Adjust based on your elemental properties
}

const recipes: Recipe[] = [
  {
    id: 1,
    name: 'Spaghetti Aglio e Olio',
    description: 'A simple Italian pasta dish made with garlic and olive oil.',
    ingredients: [
      { name: 'Spaghetti', amount: 200, unit: 'g' },
      { name: 'Garlic', amount: 4, unit: 'cloves' },
      { name: 'Olive Oil', amount: 60, unit: 'ml' },
      { name: 'Parsley', amount: 10, unit: 'g', swaps: ['Basil', 'Oregano'] },
    ],
    nutrition: {
      calories: 400,
      protein: 10,
      carbs: 60,
      fat: 15,
      vitamins: ['Vitamin A', 'Vitamin C'],
      minerals: ['Iron', 'Calcium'],
    },
    timeToMake: '20 minutes',
    season: ['all'],
    cuisine: 'Italian',
    mealType: ['Dinner', 'Lunch'],
    elementalBalance: {
      Fire: 0.5,
      Earth: 0.2,
      Air: 0.3,
      Water: 0.0,
    },
  },
  // Add more recipes as needed
];

export default recipes;
