import type { Recipe } from './recipe';

export interface SeasonalDishes {
  all?: Recipe[];
  summer?: Recipe[];
  winter?: Recipe[];
  spring?: Recipe[];
  fall?: Recipe[];
}

export interface CuisineDishes {
  breakfast?: SeasonalDishes;
  lunch?: SeasonalDishes;
  dinner?: SeasonalDishes;
  dessert?: SeasonalDishes;
}

export interface Cuisine {
  name: string;
  description: string;
  dishes: CuisineDishes;
  elementalProperties: ElementalProperties;
} 