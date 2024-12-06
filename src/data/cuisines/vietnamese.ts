// src/data/vietnamese.ts
import { Cuisine } from '../types';

export const vietnamese: Cuisine = {
  name: "Vietnamese",
  description: "Vietnamese cuisine featuring fresh herbs, balanced flavors, and regional specialties from north to south",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Pho Ga",
          description: "Traditional chicken noodle soup with aromatic herbs and spices",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "rice noodles", amount: "200", unit: "g", category: "grain" },
            { name: "chicken", amount: "200", unit: "g", category: "protein", swaps: ["tofu", "mushrooms"] },
            { name: "bean sprouts", amount: "100", unit: "g", category: "vegetable" },
            { name: "herbs", amount: "1", unit: "cup", category: "herb" },
            { name: "chicken broth", amount: "1", unit: "L", category: "broth", swaps: ["vegetable broth"] },
            { name: "ginger", amount: "30", unit: "g", category: "spice" },
            { name: "star anise", amount: "3", unit: "whole", category: "spice" },
            { name: "cinnamon", amount: "1", unit: "stick", category: "spice" }
          ],
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 65,
            fat: 8,
            vitamins: ["B6", "C"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast", "lunch"]
        },
        {
          name: "Banh Mi Op La",
          description: "Vietnamese breakfast sandwich with fried eggs",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "baguette", amount: "1", unit: "piece", category: "grain", swaps: ["gluten-free baguette"] },
            { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu scramble"] },
            { name: "pate", amount: "30", unit: "g", category: "protein", swaps: ["mushroom pate"] },
            { name: "pickled vegetables", amount: "50", unit: "g", category: "vegetable" },
            { name: "cilantro", amount: "10", unit: "g", category: "herb" },
            { name: "chili", amount: "1", unit: "piece", category: "spice" }
          ],
          nutrition: {
            calories: 450,
            protein: 22,
            carbs: 48,
            fat: 18,
            vitamins: ["A", "D", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Chao",
          description: "Vietnamese rice porridge with fish",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "rice", amount: "1", unit: "cup", category: "grain" },
            { name: "fish fillet", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "ginger", amount: "20", unit: "g", category: "spice" },
            { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
            { name: "fish sauce", amount: "1", unit: "tbsp", category: "sauce", swaps: ["soy sauce"] }
          ],
          nutrition: {
            calories: 320,
            protein: 24,
            carbs: 52,
            fat: 4,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Selenium"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Bun Bo Hue",
          description: "Spicy beef noodle soup from Hue",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "rice vermicelli", amount: "400", unit: "g", category: "grain" },
            { name: "beef shank", amount: "300", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "lemongrass", amount: "4", unit: "stalks", category: "herb" },
            { name: "shrimp paste", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["miso"] },
            { name: "chili oil", amount: "2", unit: "tbsp", category: "oil" },
            { name: "banana flower", amount: "1", unit: "small", category: "vegetable" }
          ],
          nutrition: {
            calories: 520,
            protein: 32,
            carbs: 65,
            fat: 18,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "120 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"]
        }
      ],
      winter: [
        {
          name: "Banh Xeo",
          description: "Crispy savory crepes with shrimp and pork",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "rice flour", amount: "200", unit: "g", category: "grain" },
            { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
            { name: "pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
            { name: "herbs", amount: "1", unit: "cup", category: "herb" }
          ],
          nutrition: {
            calories: 480,
            protein: 28,
            carbs: 45,
            fat: 24,
            vitamins: ["A", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "45 minutes",
          season: ["winter"],
          mealType: ["lunch"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.2,    // Represents chili and spices
    Water: 0.3,   // Represents broths and soups
    Air: 0.3,     // Represents fresh herbs and aromatics
    Earth: 0.2    // Represents grounding ingredients
  }
};