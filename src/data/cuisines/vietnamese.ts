// src/data/vietnamese.ts
import type { Cuisine } from '@/types/recipe';

export const vietnamese: Cuisine = {
  name: "Vietnamese",
  description: "Traditional Vietnamese cuisine emphasizing fresh ingredients, herbs, and balanced flavors",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Phở",
          description: "Traditional Vietnamese noodle soup with herbs and meat",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "rice noodles", amount: "200", unit: "g", category: "grain", swaps: ["shirataki noodles"] },
            { name: "beef slices", amount: "150", unit: "g", category: "protein", swaps: ["tofu", "mushrooms"] },
            { name: "bean sprouts", amount: "100", unit: "g", category: "vegetable" },
            { name: "herbs", amount: "1", unit: "bunch", category: "herb" },
            { name: "beef broth", amount: "750", unit: "ml", category: "broth", swaps: ["vegetable broth"] }
          ],
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 52,
            fat: 12,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast", "lunch"]
        }
      ],
      winter: [
        {
          name: "Cháo",
          description: "Vietnamese rice porridge with chicken",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "rice", amount: "1", unit: "cup", category: "grain" },
            { name: "chicken", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "ginger", amount: "30", unit: "g", category: "spice" },
            { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
          ],
          nutrition: {
            calories: 350,
            protein: 25,
            carbs: 45,
            fat: 8,
            vitamins: ["B1", "B2"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "45 minutes",
          season: ["winter"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Bánh Mì",
          description: "Vietnamese sandwich with pickled vegetables and meat",
          cuisine: "Vietnamese",
          ingredients: [
            { name: "baguette", amount: "1", unit: "piece", category: "grain", swaps: ["gluten-free baguette"] },
            { name: "pâté", amount: "50", unit: "g", category: "protein", swaps: ["mushroom pâté"] },
            { name: "pickled vegetables", amount: "100", unit: "g", category: "vegetable" },
            { name: "cilantro", amount: "1", unit: "bunch", category: "herb" }
          ],
          nutrition: {
            calories: 450,
            protein: 22,
            carbs: 58,
            fat: 16,
            vitamins: ["C", "A"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.2,    // Represents grilling and spices
    Earth: 0.2,   // Represents rice and grounding ingredients
    Water: 0.3,   // Represents broths and soups
    Air: 0.3      // Represents fresh herbs and aromatics
  }
};