// src/data/foodTypes.ts

import { Cuisine, Dish, NutritionalInfo } from './cuisines';

// Properties that describe food characteristics
export type FoodProperty = 
  | 'hot' 
  | 'cold' 
  | 'wet' 
  | 'dry' 
  | 'light' 
  | 'heavy' 
  | 'spicy' 
  | 'mild' 
  | 'fresh' 
  | 'preserved'
  | 'sweet'
  | 'sour'
  | 'bitter'
  | 'umami'
  | 'neutral';

// Track daily food intake
export interface FoodEntry {
  dishId: string;
  cuisineId: string;
  timeEaten: Date;
  portion: number; // 1 = standard serving
  properties: FoodProperty[];
  nutrition: NutritionalInfo;
}

// Daily nutrition targets
export const nutritionTargets = {
  calories: { min: 1800, max: 2400, unit: 'kcal' },
  protein: { min: 50, max: 100, unit: 'g' },
  carbs: { min: 225, max: 325, unit: 'g' },
  fats: { min: 44, max: 78, unit: 'g' },
  fiber: { min: 25, max: 35, unit: 'g' }
};

// Cultural balance rules that extend existing cuisine data
export interface CulturalBalance {
  cuisineId: string;
  principles: string[];
  preferredCombinations: {
    foods: string[];
    reason: string;
  }[];
  avoidCombinations: {
    foods: string[];
    reason: string;
  }[];
}

// Helper to calculate nutritional balance
export function calculateNutritionalBalance(
  entries: FoodEntry[]
): { [key: string]: number } {
  return entries.reduce((acc, entry) => {
    Object.entries(entry.nutrition).forEach(([nutrient, value]) => {
      if (typeof value === 'number') {
        acc[nutrient] = (acc[nutrient] || 0) + value * entry.portion;
      }
    });
    return acc;
  }, {} as { [key: string]: number });
}

// Helper to analyze food properties balance
export function analyzePropertyBalance(
  entries: FoodEntry[]
): { property: FoodProperty; count: number }[] {
  const propertyCount = entries.reduce((acc, entry) => {
    entry.properties.forEach(prop => {
      acc[prop] = (acc[prop] || 0) + 1;
    });
    return acc;
  }, {} as Record<FoodProperty, number>);

  return Object.entries(propertyCount).map(([property, count]) => ({
    property: property as FoodProperty,
    count
  }));
}

// Helper to find complementary foods
export function findComplementaryDishes(
  currentEntries: FoodEntry[],
  availableDishes: Record<string, Cuisine>,
  targetProperties: FoodProperty[]
): Dish[] {
  // Get current nutritional totals
  const currentNutrition = calculateNutritionalBalance(currentEntries);
  
  // Find dishes that help balance nutrition and properties
  const recommendations: Dish[] = [];
  
  Object.values(availableDishes).forEach(cuisine => {
    Object.values(cuisine.dishes).forEach(mealTypes => {
      Object.values(mealTypes).forEach(seasonalDishes => {
        seasonalDishes.forEach(dish => {
          let score = 0;
          
          // Score based on needed nutrients
          Object.entries(nutritionTargets).forEach(([nutrient, target]) => {
            const current = currentNutrition[nutrient] || 0;
            if (current < target.min) {
              score += 1;
            }
          });
          
          // Score based on desired properties
          targetProperties.forEach(prop => {
            if (dish.properties?.includes(prop)) {
              score += 1;
            }
          });
          
          if (score > 0) {
            recommendations.push(dish);
          }
        });
      });
    });
  });
  
  return recommendations.sort((a, b) => 
    (b.nutrition.protein + b.nutrition.fiber) - 
    (a.nutrition.protein + a.nutrition.fiber)
  );
}

export interface MealRecommendation {
  dish: Dish;
  reasons: string[];
  nutritionalBenefits: string[];
  propertyBalance: string[];
  culturalNotes?: string[];
}