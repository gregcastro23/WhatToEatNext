// src/data/enhancedDishes.ts

import { cuisines } from "./cuisines";
import type { FoodProperty } from "./foodTypes";

export const dishProperties: Record<string, FoodProperty[]> = {
  // Japanese dishes
  "Traditional Japanese Breakfast Set": ["hot", "light", "umami", "balanced"],
  "Okayu with Umeboshi": ["hot", "wet", "light", "sour"],
  "Zaru Soba": ["cold", "light", "umami"],

  // Middle Eastern dishes
  Shakshuka: ["hot", "spicy", "wet"],
  Hummus: ["cold", "light", "creamy"],
  "Fattoush Salad": ["cold", "fresh", "light"],

  // Thai dishes
  "Pad Thai": ["hot", "sweet", "sour", "spicy"],
  "Som Tam": ["cold", "fresh", "spicy", "sour"],
  "Green Curry": ["hot", "spicy", "wet"],

  // Vietnamese dishes
  "Pho Ga": ["hot", "aromatic", "light", "balanced"],
  "Banh Mi Op La": ["hot", "crispy", "fresh", "balanced"],
  "Bun Cha": ["hot", "grilled", "fresh", "aromatic"],
  "Che Ba Mau": ["cold", "sweet", "layered", "creamy"],
  Chao: ["hot", "wet", "comforting", "light"],

  // Chinese dishes
  "Hot Soy Milk Soup": ["hot", "savory", "light", "comforting"],
  "Mapo Tofu": ["hot", "spicy", "numbing", "savory"],
  "Sichuan Dry Pot": ["hot", "spicy", "numbing", "aromatic"],
  "Red Bean Soup": ["hot", "sweet", "comforting", "light"],
  "Mango Pomelo Sago": ["cold", "sweet", "creamy", "refreshing"],

  // Mexican dishes
  "Huevos Rancheros": ["hot", "spicy", "hearty", "fresh"],
  "Chilaquiles Verdes": ["hot", "crispy", "tangy", "spicy"],
  "Chiles en Nogada": ["hot", "rich", "complex", "balanced"],
  "Cochinita Pibil": ["hot", "tangy", "rich", "aromatic"],

  // Indian dishes
  "Butter Chicken": ["hot", "creamy", "rich", "mild-spicy"],
  "Palak Paneer": ["hot", "creamy", "earthy", "mild"],
  "Hyderabadi Biryani": ["hot", "aromatic", "spicy", "layered"],
  "Chole Bhature": ["hot", "spicy", "rich", "complex"],
};

// Helper function to get properties for a dish
export function getDishProperties(dishName: string): FoodProperty[] {
  return dishProperties[dishName] || [];
}

// Helper function to enhance a dish with properties
export function enhanceDishWithProperties(
  dishName: string,
  originalDish: unknown,
) {
  return {
    ...originalDish,
    properties: getDishProperties(dishName),
  };
}

// Type for food properties
export type FoodPropertyType = keyof typeof dishProperties;
