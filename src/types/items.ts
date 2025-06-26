// Item types for the application
import { _ElementalProperties } from './common';
import { AlchemicalProperties } from './alchemy';

export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  elementalProperties: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
}

export interface IngredientItem extends BaseItem {
  type: 'ingredient';
  category: string;
  subcategory?: string;
  nutritionalInfo?: Record<string, any>;
  flavorProfile?: string[];
  cookingMethods?: string[];
  seasonality?: string[];
}

export interface RecipeItem extends BaseItem {
  type: 'recipe';
  ingredients: IngredientItem[];
  cookingMethod: string;
  cookingTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
}

export interface FoodItem extends BaseItem {
  type: 'food';
  category: 'ingredient' | 'recipe' | 'dish';
  source?: 'database' | 'api' | 'user';
  tags?: string[];
}

export type Item = IngredientItem | RecipeItem | FoodItem;

// Type guards
export function isIngredientItem(item: Item): item is IngredientItem {
  return item.type === 'ingredient';
}

export function isRecipeItem(item: Item): item is RecipeItem {
  return item.type === 'recipe';
}

export function isFoodItem(item: Item): item is FoodItem {
  return item.type === 'food';
}

// Utility types
export type ItemType = Item['type'];
export type ItemCategory = IngredientItem['category'] | RecipeItem['type'] | FoodItem['category'];

// Item collections
export interface ItemCollection<T extends Item = Item> {
  items: T[];
  count: number;
  categories: string[];
}

export interface IngredientCollection extends ItemCollection<IngredientItem> {
  byCategory: Record<string, IngredientItem[]>;
  byElement: Record<keyof ElementalProperties, IngredientItem[]>;
}

export interface RecipeCollection extends ItemCollection<RecipeItem> {
  byCuisine: Record<string, RecipeItem[]>;
  byDifficulty: Record<string, RecipeItem[]>;
  byCookingMethod: Record<string, RecipeItem[]>;
} 