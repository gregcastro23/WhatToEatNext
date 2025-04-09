// src/data/russian.ts
import { Cuisine } from '../types';

export const russian: Cuisine = {
  name: "Russian",
  description: "Traditional Russian cuisine emphasizing hearty dishes, fermented foods, and preserved ingredients",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Syrniki",
          description: "Farmer's cheese pancakes",
          cuisine: "Russian",
          ingredients: [
            { name: "tvorog", amount: "500", unit: "g", category: "dairy", swaps: ["firm tofu"] },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "flour", amount: "100", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
            { name: "sugar", amount: "2", unit: "tbsp", category: "sweetener" },
            { name: "vanilla extract", amount: "1", unit: "tsp", category: "flavoring" },
            { name: "sour cream", amount: "100", unit: "g", category: "dairy", swaps: ["coconut yogurt"] }
          ],
          nutrition: {
            calories: 380,
            protein: 24,
            carbs: 32,
            fat: 18,
            vitamins: ["B12", "D"],
            minerals: ["Calcium", "Phosphorus"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Kasha",
          description: "Buckwheat porridge with milk",
          cuisine: "Russian",
          ingredients: [
            { name: "buckwheat groats", amount: "200", unit: "g", category: "grain" },
            { name: "milk", amount: "500", unit: "ml", category: "dairy", swaps: ["oat milk"] },
            { name: "butter", amount: "30", unit: "g", category: "fat", swaps: ["plant butter"] },
            { name: "salt", amount: "1", unit: "tsp", category: "seasoning" }
          ],
          nutrition: {
            calories: 320,
            protein: 12,
            carbs: 58,
            fat: 8,
            vitamins: ["B1", "B2"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Blini",
          description: "Thin yeasted pancakes",
          cuisine: "Russian",
          ingredients: [
            { name: "flour", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
            { name: "milk", amount: "600", unit: "ml", category: "dairy", swaps: ["almond milk"] },
            { name: "eggs", amount: "3", unit: "large", category: "protein" },
            { name: "yeast", amount: "7", unit: "g", category: "leavening" },
            { name: "sugar", amount: "1", unit: "tbsp", category: "sweetener" },
            { name: "sour cream", amount: "100", unit: "g", category: "dairy", swaps: ["coconut yogurt"] }
          ],
          nutrition: {
            calories: 220,
            protein: 8,
            carbs: 35,
            fat: 6,
            vitamins: ["A", "D"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "90 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Borscht",
          description: "Classic beetroot and cabbage soup",
          cuisine: "Russian",
          ingredients: [
            { name: "beef", amount: "500", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "beets", amount: "500", unit: "g", category: "vegetable" },
            { name: "cabbage", amount: "300", unit: "g", category: "vegetable" },
            { name: "potatoes", amount: "300", unit: "g", category: "vegetable" },
            { name: "carrots", amount: "200", unit: "g", category: "vegetable" },
            { name: "onion", amount: "200", unit: "g", category: "vegetable" },
            { name: "tomato paste", amount: "2", unit: "tbsp", category: "condiment" },
            { name: "sour cream", amount: "200", unit: "g", category: "dairy", swaps: ["cashew cream"] }
          ],
          nutrition: {
            calories: 420,
            protein: 28,
            carbs: 42,
            fat: 18,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "120 minutes",
          season: ["all"],
          mealType: ["lunch"]
        },
        {
          name: "Pelmeni",
          description: "Russian meat dumplings",
          cuisine: "Russian",
          ingredients: [
            { name: "flour", amount: "500", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
            { name: "ground meat", amount: "400", unit: "g", category: "protein", swaps: ["mushroom mix"] },
            { name: "onion", amount: "200", unit: "g", category: "vegetable" },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "sour cream", amount: "100", unit: "g", category: "dairy", swaps: ["cashew cream"] },
            { name: "dill", amount: "1", unit: "bunch", category: "herb" }
          ],
          nutrition: {
            calories: 480,
            protein: 24,
            carbs: 58,
            fat: 16,
            vitamins: ["B12", "B1"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "90 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Shchi",
          description: "Traditional cabbage soup",
          cuisine: "Russian",
          ingredients: [
            { name: "cabbage", amount: "1", unit: "head", category: "vegetable" },
            { name: "beef", amount: "400", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "carrots", amount: "200", unit: "g", category: "vegetable" },
            { name: "potatoes", amount: "300", unit: "g", category: "vegetable" },
            { name: "sour cream", amount: "100", unit: "g", category: "dairy", swaps: ["cashew cream"] },
            { name: "bay leaves", amount: "2", unit: "pieces", category: "herb" }
          ],
          nutrition: {
            calories: 380,
            protein: 22,
            carbs: 45,
            fat: 14,
            vitamins: ["C", "K"],
            minerals: ["Iron", "Fiber"]
          },
          timeToMake: "120 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ],
      winter: [
        {
          name: "Solyanka",
          description: "Hearty soup with mixed meats and pickles",
          cuisine: "Russian",
          ingredients: [
            { name: "mixed meats", amount: "500", unit: "g", category: "protein", swaps: ["seitan mix"] },
            { name: "pickles", amount: "200", unit: "g", category: "vegetable" },
            { name: "onions", amount: "200", unit: "g", category: "vegetable" },
            { name: "olives", amount: "100", unit: "g", category: "vegetable" },
            { name: "lemon", amount: "1", unit: "whole", category: "citrus" },
            { name: "sour cream", amount: "100", unit: "g", category: "dairy", swaps: ["cashew cream"] }
          ],
          nutrition: {
            calories: 420,
            protein: 32,
            carbs: 18,
            fat: 28,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Sodium"]
          },
          timeToMake: "90 minutes",
          season: ["winter"],
          mealType: ["lunch"]
        }
      ]
    }
  },
  dinner: {
    all: [
      {
        name: "Beef Stroganoff",
        description: "Tender beef in sour cream sauce",
        cuisine: "Russian",
        ingredients: [
          { name: "beef tenderloin", amount: "800", unit: "g", category: "protein", swaps: ["mushrooms"] },
          { name: "mushrooms", amount: "400", unit: "g", category: "vegetable" },
          { name: "onions", amount: "200", unit: "g", category: "vegetable" },
          { name: "sour cream", amount: "300", unit: "ml", category: "dairy", swaps: ["cashew cream"] },
          { name: "mustard", amount: "2", unit: "tbsp", category: "condiment" },
          { name: "egg noodles", amount: "500", unit: "g", category: "grain", swaps: ["gluten-free pasta"] }
        ],
        nutrition: {
          calories: 580,
          protein: 42,
          carbs: 45,
          fat: 28,
          vitamins: ["B12", "D"],
          minerals: ["Iron", "Zinc"]
        },
        timeToMake: "45 minutes",
        season: ["all"],
        mealType: ["dinner"]
      },
      {
        name: "Golubtsy",
        description: "Stuffed cabbage rolls",
        cuisine: "Russian",
        ingredients: [
          { name: "cabbage", amount: "1", unit: "head", category: "vegetable" },
          { name: "ground meat", amount: "600", unit: "g", category: "protein", swaps: ["lentils"] },
          { name: "rice", amount: "200", unit: "g", category: "grain" },
          { name: "tomato sauce", amount: "500", unit: "ml", category: "sauce" },
          { name: "onions", amount: "200", unit: "g", category: "vegetable" },
          { name: "sour cream", amount: "200", unit: "ml", category: "dairy", swaps: ["cashew cream"] }
        ],
        nutrition: {
          calories: 420,
          protein: 28,
          carbs: 48,
          fat: 18,
          vitamins: ["C", "B12"],
          minerals: ["Iron", "Calcium"]
        },
        timeToMake: "120 minutes",
        season: ["all"],
        mealType: ["dinner"]
      },
      {
        name: "Kotlety",
        description: "Russian style meat patties",
        cuisine: "Russian",
        ingredients: [
          { name: "ground meat mix", amount: "500", unit: "g", category: "protein", swaps: ["mushroom mix"] },
          { name: "bread", amount: "100", unit: "g", category: "grain", swaps: ["gluten-free bread"] },
          { name: "milk", amount: "100", unit: "ml", category: "dairy", swaps: ["oat milk"] },
          { name: "onion", amount: "1", unit: "large", category: "vegetable" },
          { name: "butter", amount: "50", unit: "g", category: "fat", swaps: ["oil"] }
        ],
        nutrition: {
          calories: 380,
          protein: 32,
          carbs: 22,
          fat: 24,
          vitamins: ["B12", "B6"],
          minerals: ["Iron", "Zinc"]
        },
        timeToMake: "40 minutes",
        season: ["all"],
        mealType: ["dinner"]
      }
    ],
    winter: [
      {
        name: "Zharkoe",
        description: "Russian meat and potato stew",
        cuisine: "Russian",
        ingredients: [
          { name: "beef", amount: "800", unit: "g", category: "protein", swaps: ["mushrooms"] },
          { name: "potatoes", amount: "800", unit: "g", category: "vegetable" },
          { name: "carrots", amount: "200", unit: "g", category: "vegetable" },
          { name: "onions", amount: "200", unit: "g", category: "vegetable" },
          { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
          { name: "bay leaves", amount: "2", unit: "pieces", category: "herb" }
        ],
        nutrition: {
          calories: 520,
          protein: 38,
          carbs: 42,
          fat: 24,
          vitamins: ["A", "B12"],
          minerals: ["Iron", "Potassium"]
        },
        timeToMake: "150 minutes",
        season: ["winter"],
        mealType: ["dinner"]
      }
    ]
  },
  dessert: {
    all: [
      {
        name: "Pashka",
        description: "Traditional Easter dessert with farmer's cheese",
        cuisine: "Russian",
        ingredients: [
          { name: "tvorog", amount: "1", unit: "kg", category: "dairy", swaps: ["cashew cheese"] },
          { name: "butter", amount: "200", unit: "g", category: "dairy", swaps: ["coconut oil"] },
          { name: "dried fruit", amount: "200", unit: "g", category: "fruit" },
          { name: "nuts", amount: "100", unit: "g", category: "nuts" },
          { name: "vanilla", amount: "1", unit: "pod", category: "spice" }
        ],
        nutrition: {
          calories: 420,
          protein: 18,
          carbs: 28,
          fat: 32,
          vitamins: ["A", "D"],
          minerals: ["Calcium", "Phosphorus"]
        },
        timeToMake: "24 hours",
        season: ["spring"],
        mealType: ["dessert"]
      },
      {
        name: "Sochnik",
        description: "Curd cheese pastry",
        cuisine: "Russian",
        ingredients: [
          { name: "flour", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
          { name: "tvorog", amount: "500", unit: "g", category: "dairy", swaps: ["cashew cheese"] },
          { name: "butter", amount: "200", unit: "g", category: "dairy", swaps: ["vegan butter"] },
          { name: "sugar", amount: "150", unit: "g", category: "sweetener" },
          { name: "eggs", amount: "2", unit: "large", category: "protein" }
        ],
        nutrition: {
          calories: 380,
          protein: 12,
          carbs: 42,
          fat: 22,
          vitamins: ["A", "D", "B12"],
          minerals: ["Calcium"]
        },
        timeToMake: "60 minutes",
        season: ["all"],
        mealType: ["dessert"]
      },
      {
        name: "Vareniki s Vishney",
        description: "Sweet cherry dumplings",
        cuisine: "Russian",
        ingredients: [
          { name: "flour", amount: "400", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
          { name: "cherries", amount: "500", unit: "g", category: "fruit" },
          { name: "sugar", amount: "100", unit: "g", category: "sweetener" },
          { name: "sour cream", amount: "200", unit: "g", category: "dairy", swaps: ["coconut cream"] }
        ],
        nutrition: {
          calories: 320,
          protein: 6,
          carbs: 58,
          fat: 8,
          vitamins: ["C", "A"],
          minerals: ["Iron", "Potassium"]
        },
        timeToMake: "90 minutes",
        season: ["all"],
        mealType: ["dessert"]
      }
    ],
    winter: [
      {
        name: "Pryaniki",
        description: "Spiced honey cookies",
        cuisine: "Russian",
        ingredients: [
          { name: "flour", amount: "400", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
          { name: "honey", amount: "200", unit: "g", category: "sweetener" },
          { name: "spice mix", amount: "2", unit: "tbsp", category: "spice" },
          { name: "butter", amount: "100", unit: "g", category: "dairy", swaps: ["vegan butter"] }
        ],
        nutrition: {
          calories: 280,
          protein: 4,
          carbs: 52,
          fat: 8,
          vitamins: ["B1", "B2"],
          minerals: ["Iron"]
        },
        timeToMake: "120 minutes",
        season: ["winter"],
        mealType: ["dessert"]
      }
    ]
  },
  elementalBalance: {
    Earth: 0.4,    // Represents hearty ingredients and root vegetables
    Water: 0.3,    // Represents soups and stews
    Fire: 0.2,     // Represents cooking methods and spices
    Air: 0.1       // Represents light pastries and herbs
  }
};