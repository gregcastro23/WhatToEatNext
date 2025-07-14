export * from './breakfast';
export * from './lunch';
export * from './dinner';
export * from './appetizers';
export * from './sides';
export * from './sauces';
export * from './desserts';
export * from './salads';
export * from './beverages';
export * from './condiments';
export * from './soups';

import { Recipe } from '../../types/recipe';
import { breakfastRecipes } from './breakfast';
import { lunchRecipes } from './lunch';
import { dinnerRecipes } from './dinner';
import { appetizerRecipes } from './appetizers';
import { sideRecipes } from './sides';
import { sauceRecipes } from './sauces';
import { dessertRecipes } from './desserts';
import { saladRecipes } from './salads';
import { beverageRecipes } from './beverages';
import { condimentRecipes } from './condiments';
import { soupRecipes } from './soups';

export const allRecipes: Recipe[] = [
  ...breakfastRecipes,
  ...lunchRecipes,
  ...dinnerRecipes,
  ...appetizerRecipes,
  ...sideRecipes,
  ...sauceRecipes,
  ...dessertRecipes,
  ...saladRecipes,
  ...beverageRecipes,
  ...condimentRecipes,
  ...soupRecipes
]; 