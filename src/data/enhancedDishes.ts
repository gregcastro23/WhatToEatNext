// src/data/enhancedDishes.ts

import { cuisines } from './cuisines';
import { FoodProperty } from './foodTypes';

export const dishProperties: Record<string, FoodProperty[]> = {
  // Japanese dishes
  "Traditional Japanese Breakfast Set": [
    'hot',
    'light',
    'umami',
    'balanced'
  ],
  "Okayu with Umeboshi": [
    'hot',
    'wet',
    'light',
    'sour'
  ],
  "Zaru Soba": [
    'cold',
    'light',
    'umami'
  ],
  
  // Middle Eastern dishes
  "Shakshuka": [
    'hot',
    'spicy',
    'wet'
  ],
  "Hummus": [
    'cold',
    'light',
    'creamy'
  ],
  "Fattoush Salad": [
    'cold',
    'fresh',
    'light'
  ],

  // Thai dishes
  "Pad Thai": [
    'hot',
    'sweet',
    'sour',
    'spicy'
  ],
  "Som Tam": [
    'cold',
    'fresh',
    'spicy',
    'sour'
  ],
  "Green Curry": [
    'hot',
    'spicy',
    'wet'
  ],

  // Add properties for other dishes...
};

// Helper function to get properties for a dish
export function getDishProperties(dishName: string): FoodProperty[] {
  return dishProperties[dishName] || [];
}

// Helper function to enhance a dish with properties
export function enhanceDishWithProperties(dishName: string, originalDish: any) {
  return {
    ...originalDish,
    properties: getDishProperties(dishName)
  };
}