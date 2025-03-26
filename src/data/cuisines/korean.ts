// src/data/korean.ts
import type { Cuisine } from '@/types/recipe';

export const korean: Cuisine = {
  name: "Korean",
  description: "Traditional Korean cuisine emphasizing fermented foods, communal dining, and balanced flavors with rice, banchan, and grilled meats",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Gyeran Bap",
          description: "Rice with soft scrambled eggs and sesame oil",
          cuisine: "Korean",
          ingredients: [
            { name: "steamed rice", amount: "1", unit: "cup", category: "grain" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu scramble"] },
            { name: "sesame oil", amount: "1", unit: "tsp", category: "oil" },
            { name: "soy sauce", amount: "1", unit: "tsp", category: "seasoning" },
            { name: "seaweed", amount: "1", unit: "sheet", category: "garnish" },
            { name: "green onion", amount: "1", unit: "stalk", category: "vegetable" }
          ],
          nutrition: {
            calories: 380,
            protein: 14,
            carbs: 62,
            fat: 10,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Selenium"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
          }
        },
        {
          name: "Juk",
          description: "Korean rice porridge with various toppings",
          cuisine: "Korean",
          ingredients: [
            { name: "short grain rice", amount: "1", unit: "cup", category: "grain" },
            { name: "mushrooms", amount: "100", unit: "g", category: "vegetable" },
            { name: "carrots", amount: "1", unit: "medium", category: "vegetable" },
            { name: "ginger", amount: "1", unit: "tbsp", category: "spice" },
            { name: "kimchi", amount: "100", unit: "g", category: "fermented" }
          ],
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 68,
            fat: 4,
            vitamins: ["B6", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "40 minutes",
          season: ["winter"],
          mealType: ["breakfast"]
        }
      ],
      summer: [
        {
          name: "Kong Guksu",
          description: "Chilled soy milk noodle soup",
          cuisine: "Korean",
          ingredients: [
            { name: "soy milk", amount: "500", unit: "ml", category: "dairy" },
            { name: "somyeon noodles", amount: "200", unit: "g", category: "grain", swaps: ["rice noodles"] },
            { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
            { name: "tomato", amount: "1", unit: "medium", category: "vegetable" },
            { name: "sesame seeds", amount: "1", unit: "tbsp", category: "garnish" }
          ],
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 65,
            fat: 12,
            vitamins: ["C", "K"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "25 minutes",
          season: ["summer"],
          mealType: ["breakfast", "lunch"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Bibimbap",
          description: "Mixed rice bowl with vegetables and gochujang",
          cuisine: "Korean",
          ingredients: [
            { name: "steamed rice", amount: "2", unit: "cups", category: "grain" },
            { name: "bulgogi", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
            { name: "spinach", amount: "100", unit: "g", category: "vegetable" },
            { name: "carrots", amount: "100", unit: "g", category: "vegetable" },
            { name: "bean sprouts", amount: "100", unit: "g", category: "vegetable" },
            { name: "egg", amount: "1", unit: "large", category: "protein", swaps: ["tofu"] },
            { name: "gochujang", amount: "2", unit: "tbsp", category: "sauce" },
            { name: "sesame oil", amount: "1", unit: "tbsp", category: "oil" }
          ],
          nutrition: {
            calories: 580,
            protein: 28,
            carbs: 82,
            fat: 18,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "40 minutes",
          season: ["all"],
          mealType: ["lunch"]
        },
        {
          name: "Kimchi Jjigae",
          description: "Spicy kimchi stew with pork and tofu",
          cuisine: "Korean",
          ingredients: [
            { name: "kimchi", amount: "300", unit: "g", category: "fermented" },
            { name: "pork belly", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "tofu", amount: "200", unit: "g", category: "protein" },
            { name: "gochugaru", amount: "1", unit: "tbsp", category: "spice" },
            { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
          ],
          nutrition: {
            calories: 420,
            protein: 32,
            carbs: 18,
            fat: 28,
            vitamins: ["C", "B12", "K"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "35 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ],
      summer: [
        {
          name: "Naengmyeon",
          description: "Cold buckwheat noodles in chilled broth",
          cuisine: "Korean",
          ingredients: [
            { name: "buckwheat noodles", amount: "200", unit: "g", category: "grain", swaps: ["sweet potato noodles"] },
            { name: "beef broth", amount: "500", unit: "ml", category: "broth", swaps: ["vegetable broth"] },
            { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
            { name: "pear", amount: "1/2", unit: "medium", category: "fruit" },
            { name: "egg", amount: "1", unit: "large", category: "protein" },
            { name: "mustard sauce", amount: "2", unit: "tbsp", category: "sauce" }
          ],
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 72,
            fat: 4,
            vitamins: ["C", "B1"],
            minerals: ["Iron", "Manganese"]
          },
          timeToMake: "30 minutes",
          season: ["summer"],
          mealType: ["lunch"]
        }
      ],
      winter: [
        {
          name: "Tteokguk",
          description: "Rice cake soup traditionally eaten on New Year's",
          cuisine: "Korean",
          ingredients: [
            { name: "rice cakes", amount: "300", unit: "g", category: "grain" },
            { name: "beef brisket", amount: "150", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "seaweed", amount: "2", unit: "sheets", category: "garnish" },
            { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
          ],
          nutrition: {
            calories: 420,
            protein: 22,
            carbs: 65,
            fat: 8,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Iodine"]
          },
          timeToMake: "45 minutes",
          season: ["winter"],
          mealType: ["lunch"]
        }
      ]
    },
    dinner: {
      all: [
        {
          name: "Samgyeopsal-gui",
          description: "Grilled pork belly with lettuce wraps and accompaniments",
          cuisine: "Korean",
          ingredients: [
            { name: "pork belly", amount: "600", unit: "g", category: "protein", swaps: ["mushroom belly", "tempeh"] },
            { name: "lettuce leaves", amount: "1", unit: "head", category: "vegetable" },
            { name: "garlic", amount: "1", unit: "head", category: "vegetable" },
            { name: "ssamjang", amount: "4", unit: "tbsp", category: "sauce" },
            { name: "kimchi", amount: "200", unit: "g", category: "fermented" },
            { name: "green onions", amount: "1", unit: "bunch", category: "vegetable" }
          ],
          nutrition: {
            calories: 680,
            protein: 42,
            carbs: 12,
            fat: 52,
            vitamins: ["B12", "K"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["dinner"]
        },
        {
          name: "Sundubu Jjigae",
          description: "Spicy soft tofu stew",
          cuisine: "Korean",
          ingredients: [
            { name: "soft tofu", amount: "400", unit: "g", category: "protein" },
            { name: "kimchi", amount: "100", unit: "g", category: "fermented" },
            { name: "gochugaru", amount: "1", unit: "tbsp", category: "spice" },
            { name: "clams", amount: "200", unit: "g", category: "seafood", swaps: ["mushrooms"] },
            { name: "egg", amount: "1", unit: "large", category: "protein" }
          ],
          nutrition: {
            calories: 320,
            protein: 28,
            carbs: 18,
            fat: 16,
            vitamins: ["B12", "D", "K"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["dinner"]
        }
      ],
      winter: [
        {
          name: "Budae Jjigae",
          description: "Korean army base stew with mixed ingredients",
          cuisine: "Korean",
          ingredients: [
            { name: "spam", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "korean sausage", amount: "200", unit: "g", category: "protein", swaps: ["vegetarian sausage"] },
            { name: "kimchi", amount: "200", unit: "g", category: "fermented" },
            { name: "ramen noodles", amount: "2", unit: "packs", category: "grain" },
            { name: "rice cakes", amount: "200", unit: "g", category: "grain" },
            { name: "gochugaru", amount: "2", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 720,
            protein: 38,
            carbs: 82,
            fat: 32,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Sodium"]
          },
          timeToMake: "40 minutes",
          season: ["winter"],
          mealType: ["dinner"]
        }
      ],
      summer: [
        {
          name: "Samgye-tang",
          description: "Ginseng chicken soup",
          cuisine: "Korean",
          ingredients: [
            { name: "whole chicken", amount: "1", unit: "small", category: "protein", swaps: ["seitan chicken"] },
            { name: "ginseng", amount: "1", unit: "root", category: "herb" },
            { name: "glutinous rice", amount: "100", unit: "g", category: "grain" },
            { name: "garlic", amount: "8", unit: "cloves", category: "vegetable" },
            { name: "jujubes", amount: "4", unit: "pieces", category: "fruit" }
          ],
          nutrition: {
            calories: 520,
            protein: 45,
            carbs: 42,
            fat: 22,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "90 minutes",
          season: ["summer"],
          mealType: ["dinner"]
        }
      ]
    },
    dessert: {
      summer: [
        {
          name: "Patbingsu",
          description: "Shaved ice with sweet red beans and toppings",
          cuisine: "Korean",
          ingredients: [
            { name: "shaved ice", amount: "4", unit: "cups", category: "ice" },
            { name: "red bean paste", amount: "200", unit: "g", category: "bean" },
            { name: "condensed milk", amount: "60", unit: "ml", category: "dairy", swaps: ["coconut condensed milk"] },
            { name: "rice cakes", amount: "100", unit: "g", category: "grain" },
            { name: "fruit", amount: "200", unit: "g", category: "fruit" }
          ],
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 65,
            fat: 4,
            vitamins: ["C", "A"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "15 minutes",
          season: ["summer"],
          mealType: ["dessert"]
        }
      ],
      winter: [
        {
          name: "Hotteok",
          description: "Sweet filled pancakes",
          cuisine: "Korean",
          ingredients: [
            { name: "flour", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
            { name: "brown sugar", amount: "100", unit: "g", category: "sweetener" },
            { name: "nuts", amount: "50", unit: "g", category: "nuts" },
            { name: "cinnamon", amount: "1", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 280,
            protein: 6,
            carbs: 52,
            fat: 8,
            vitamins: ["B1", "E"],
            minerals: ["Iron"]
          },
          timeToMake: "45 minutes",
          season: ["winter"],
          mealType: ["dessert"]
        }
      ],
      all: [
        {
          name: "Songpyeon",
          description: "Half-moon shaped rice cakes",
          cuisine: "Korean",
          ingredients: [
            { name: "rice flour", amount: "400", unit: "g", category: "grain" },
            { name: "sesame seeds", amount: "100", unit: "g", category: "seeds" },
            { name: "honey", amount: "60", unit: "ml", category: "sweetener" },
            { name: "pine needles", amount: "2", unit: "cups", category: "herb" }
          ],
          nutrition: {
            calories: 220,
            protein: 4,
            carbs: 45,
            fat: 4,
            vitamins: ["B1", "E"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["dessert"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.3,    // Represents spicy elements and grilling
    Earth: 0.3,   // Represents fermented foods and root vegetables
    Water: 0.2,   // Represents soups and stews
    Air: 0.2      // Represents light broths and garnishes
  }
};

export default korean;