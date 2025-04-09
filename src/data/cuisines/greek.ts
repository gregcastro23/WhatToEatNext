// src/data/greek.ts
import { Cuisine } from '../types';

export const greek: Cuisine = {
  name: "Greek",
  description: "Traditional Greek cuisine emphasizing fresh ingredients, olive oil, herbs, and regional specialties from mainland to islands",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Bougatsa",
          description: "Phyllo pastry filled with semolina custard and cinnamon",
          cuisine: "Greek",
          ingredients: [
            { name: "phyllo dough", amount: "12", unit: "sheets", category: "pastry", swaps: ["gluten-free phyllo"] },
            { name: "semolina", amount: "200", unit: "g", category: "grain" },
            { name: "milk", amount: "750", unit: "ml", category: "dairy", swaps: ["almond milk"] },
            { name: "eggs", amount: "3", unit: "large", category: "protein" },
            { name: "butter", amount: "100", unit: "g", category: "fat", swaps: ["olive oil"] },
            { name: "cinnamon", amount: "2", unit: "tsp", category: "spice" }
          ],
          nutrition: {
            calories: 380,
            protein: 10,
            carbs: 48,
            fat: 18,
            vitamins: ["A", "D"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Greek Yogurt with Honey",
          description: "Thick yogurt with honey and walnuts",
          cuisine: "Greek",
          ingredients: [
            { name: "Greek yogurt", amount: "200", unit: "g", category: "dairy", swaps: ["coconut yogurt"] },
            { name: "honey", amount: "2", unit: "tbsp", category: "sweetener" },
            { name: "walnuts", amount: "30", unit: "g", category: "nuts" },
            { name: "fresh figs", amount: "2", unit: "pieces", category: "fruit", swaps: ["any seasonal fruit"] }
          ],
          nutrition: {
            calories: 280,
            protein: 18,
            carbs: 32,
            fat: 12,
            vitamins: ["B12", "D"],
            minerals: ["Calcium", "Potassium"]
          },
          timeToMake: "5 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Strapatsada",
          description: "Scrambled eggs with tomatoes and feta",
          cuisine: "Greek",
          ingredients: [
            { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["tofu scramble"] },
            { name: "tomatoes", amount: "3", unit: "medium", category: "vegetable" },
            { name: "feta cheese", amount: "100", unit: "g", category: "dairy", swaps: ["vegan feta"] },
            { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
            { name: "oregano", amount: "1", unit: "tsp", category: "herb" }
          ],
          nutrition: {
            calories: 420,
            protein: 24,
            carbs: 12,
            fat: 32,
            vitamins: ["A", "C", "D"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "20 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Paximadia",
          description: "Twice-baked bread rusks with olive oil and tomatoes",
          cuisine: "Greek (Cretan)",
          ingredients: [
            { name: "barley rusks", amount: "4", unit: "pieces", category: "bread", swaps: ["gluten-free rusks"] },
            { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
            { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" },
            { name: "oregano", amount: "2", unit: "tsp", category: "herb" }
          ],
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 42,
            fat: 16,
            vitamins: ["C", "E"],
            minerals: ["Iron", "Fiber"]
          },
          timeToMake: "10 minutes",
          season: ["summer"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Souvlaki",
          description: "Grilled meat skewers with pita and tzatziki",
          cuisine: "Greek",
          ingredients: [
            { name: "pork", amount: "500", unit: "g", category: "protein", swaps: ["seitan", "mushrooms"] },
            { name: "pita bread", amount: "4", unit: "pieces", category: "bread", swaps: ["gluten-free pita"] },
            { name: "tzatziki", amount: "200", unit: "g", category: "sauce" },
            { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
            { name: "onions", amount: "1", unit: "medium", category: "vegetable" },
            { name: "oregano", amount: "2", unit: "tbsp", category: "herb" }
          ],
          nutrition: {
            calories: 520,
            protein: 35,
            carbs: 42,
            fat: 24,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Horiatiki",
          description: "Traditional Greek salad with feta",
          cuisine: "Greek",
          ingredients: [
            { name: "tomatoes", amount: "4", unit: "large", category: "vegetable" },
            { name: "cucumber", amount: "1", unit: "large", category: "vegetable" },
            { name: "green peppers", amount: "1", unit: "medium", category: "vegetable" },
            { name: "red onion", amount: "1", unit: "medium", category: "vegetable" },
            { name: "feta cheese", amount: "200", unit: "g", category: "dairy", swaps: ["vegan feta"] },
            { name: "kalamata olives", amount: "100", unit: "g", category: "vegetable" },
            { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" }
          ],
          nutrition: {
            calories: 380,
            protein: 12,
            carbs: 18,
            fat: 32,
            vitamins: ["A", "C", "K"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ],
      summer: [
        {
          name: "Gemista",
          description: "Stuffed tomatoes and peppers with rice and herbs",
          cuisine: "Greek",
          ingredients: [
            { name: "tomatoes", amount: "6", unit: "large", category: "vegetable" },
            { name: "peppers", amount: "6", unit: "medium", category: "vegetable" },
            { name: "rice", amount: "300", unit: "g", category: "grain" },
            { name: "herbs", amount: "1", unit: "bunch", category: "herb" },
            { name: "olive oil", amount: "100", unit: "ml", category: "oil" }
          ],
          nutrition: {
            calories: 420,
            protein: 8,
            carbs: 65,
            fat: 18,
            vitamins: ["C", "A"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "90 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        }
      ]
    }
  },
  elementalBalance: {
    Earth: 0.3,    // Represents grains and legumes
    Fire: 0.2,     // Represents grilling and spices
    Water: 0.3,    // Represents seafood and sauces
    Air: 0.2       // Represents light herbs and olive oil
  }
};