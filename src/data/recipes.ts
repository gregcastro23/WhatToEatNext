import { italianRecipes } from './Italian';
import { chineseRecipes } from './Chinese';
import { greekRecipes } from './Greek';
import { russianRecipes } from './Russian';
import { africanRecipes } from './African';
import { HSCARecipes } from './HSCA';
import { japaneseRecipes } from './Japanese';
import { middleEasternRecipes } from './MiddleEastern';
import { thaiRecipes } from './Thai';
import { koreanRecipes } from './Korean';
import { frenchRecipes } from './French';
import { indianRecipes } from './Indian';
import { mexicanRecipes } from './Mexican';
import { vietnameseRecipes } from './Vietnamese';

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
  elementalBalance: Record<string, number>;
}

const recipes: Recipe[] = [
  ...italianRecipes,
  ...chineseRecipes,
  ...greekRecipes,
  ...russianRecipes,
  ...africanRecipes,
  ...HSCARecipes,
  ...japaneseRecipes,
  ...middleEasternRecipes,
  ...thaiRecipes,
  ...koreanRecipes,
  ...frenchRecipes,
  ...indianRecipes,
  ...mexicanRecipes,
  ...vietnameseRecipes,
];

export default recipes;