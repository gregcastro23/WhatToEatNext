// src/data/african.ts
import { Cuisine } from '../types';

export const african: Cuisine = {
  name: "African",
  description: "Diverse cuisines from the African continent...",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Mandazi",
          description: "East African fried bread similar to doughnuts",
          cuisine: "Swahili",
          ingredients: [
            { name: "flour", amount: "2", unit: "cups", category: "grain" },
            { name: "sugar", amount: "1/4", unit: "cup", category: "sweetener" },
            { name: "coconut milk", amount: "1", unit: "cup", category: "dairy" },
            { name: "yeast", amount: "2", unit: "tsp", category: "leavening" },
            { name: "cardamom", amount: "1", unit: "tsp", category: "spice" }
          ],
          nutrition: {
            calories: 300,
            protein: 6,
            carbs: 50,
            fat: 8,
            vitamins: ["B1", "B2"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Grilled Fish",
          description: "Fresh fish grilled with African spices",
          cuisine: "West African",
          ingredients: [
            { name: "whole fish", amount: "1", unit: "kg", category: "protein" },
            { name: "lemon", amount: "2", unit: "whole", category: "citrus" },
            { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
            { name: "ginger", amount: "2", unit: "inches", category: "spice" },
            { name: "paprika", amount: "1", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 400,
            protein: 35,
            carbs: 10,
            fat: 25,
            vitamins: ["C", "B6"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "60 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        }
      ],
      winter: [
        {
          name: "Muamba de Galinha",
          description: "Central African chicken stew with okra",
          cuisine: "Angolan",
          ingredients: [
            { name: "chicken thighs", amount: "1", unit: "kg", category: "protein" },
            { name: "okra", amount: "200", unit: "g", category: "vegetable" },
            { name: "peanut butter", amount: "3", unit: "tbsp", category: "condiment" },
            { name: "tomatoes", amount: "4", unit: "whole", category: "vegetable" },
            { name: "onions", amount: "2", unit: "whole", category: "vegetable" },
            { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
            { name: "ginger", amount: "2", unit: "inches", category: "spice" },
            { name: "chili peppers", amount: "2", unit: "whole", category: "spice" }
          ],
          nutrition: {
            calories: 550,
            protein: 40,
            carbs: 20,
            fat: 30,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "90 minutes",
          season: ["winter"],
          mealType: ["lunch", "dinner"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Jollof Rice",
          description: "One-pot West African rice dish with tomatoes and spices",
          cuisine: "West African",
          ingredients: [
            { name: "rice", amount: "2", unit: "cups", category: "grain" },
            { name: "tomato paste", amount: "1", unit: "can", category: "condiment" },
            { name: "onions", amount: "2", unit: "whole", category: "vegetable" },
            { name: "bell peppers", amount: "1", unit: "whole", category: "vegetable" },
            { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
            { name: "ginger", amount: "1", unit: "tbsp", category: "spice" },
            { name: "chicken broth", amount: "4", unit: "cups", category: "broth" }
          ],
          nutrition: {
            calories: 500,
            protein: 15,
            carbs: 90,
            fat: 10,
            vitamins: ["A", "C", "B6"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ]
    },
    dinner: {
      all: [
        {
          name: "Bobotie",
          description: "South African spiced minced meat baked with an egg-based topping",
          cuisine: "South African",
          ingredients: [
            { name: "ground beef", amount: "500", unit: "g", category: "protein" },
            { name: "bread", amount: "2", unit: "slices", category: "grain" },
            { name: "milk", amount: "1", unit: "cup", category: "dairy" },
            { name: "eggs", amount: "2", unit: "whole", category: "protein" },
            { name: "onions", amount: "2", unit: "whole", category: "vegetable" },
            { name: "curry powder", amount: "2", unit: "tbsp", category: "spice" },
            { name: "almonds", amount: "1/4", unit: "cup", category: "nuts" }
          ],
          nutrition: {
            calories: 650,
            protein: 30,
            carbs: 40,
            fat: 35,
            vitamins: ["B12", "D"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "75 minutes",
          season: ["all"],
          mealType: ["dinner"]
        }
      ],
      winter: [
        {
          name: "Tagine",
          description: "Moroccan slow-cooked stew braised at low temperatures",
          cuisine: "Moroccan",
          ingredients: [
            { name: "lamb", amount: "1", unit: "kg", category: "protein" },
            { name: "apricots", amount: "200", unit: "g", category: "fruit" },
            { name: "chickpeas", amount: "1", unit: "cup", category: "legume" },
            { name: "onions", amount: "2", unit: "whole", category: "vegetable" },
            { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" },
            { name: "saffron", amount: "1/2", unit: "tsp", category: "spice" },
            { name: "almonds", amount: "1/4", unit: "cup", category: "nuts" }
          ],
          nutrition: {
            calories: 700,
            protein: 50,
            carbs: 60,
            fat: 30,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "120 minutes",
          season: ["winter"],
          mealType: ["dinner"]
        }
      ]
    },
    dessert: {
      all: [
        {
          name: "Malva Pudding",
          description: "Sweet baked dessert of Cape Dutch origin",
          cuisine: "South African",
          ingredients: [
            { name: "flour", amount: "1", unit: "cup", category: "grain" },
            { name: "sugar", amount: "1", unit: "cup", category: "sweetener" },
            { name: "milk", amount: "1", unit: "cup", category: "dairy" },
            { name: "eggs", amount: "2", unit: "whole", category: "protein" },
            { name: "apricot jam", amount: "1/2", unit: "cup", category: "spread" },
            { name: "butter", amount: "1/2", unit: "cup", category: "dairy" }
          ],
          nutrition: {
            calories: 450,
            protein: 8,
            carbs: 70,
            fat: 15,
            vitamins: ["A", "B6"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["dessert"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.25,    // Represents spicy and grilled elements
    Earth: 0.35,   // Represents hearty stews and grounding ingredients
    Water: 0.20,   // Represents soups and moist dishes
    Air: 0.20      // Represents lighter salads and fresh components
  }
};