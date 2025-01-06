// src/data/cuisines/chinese.ts
import type { Cuisine } from '@/types/recipe';

export const chinese: Cuisine = {
  name: "Chinese",
  description: "Traditional Chinese cuisine encompassing diverse regional cooking styles, techniques, and ingredients, emphasizing balance and seasonal harmony",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Congee with Century Egg",
          description: "Silky rice porridge with preserved egg and pork",
          cuisine: "Chinese",
          ingredients: [
            { name: "rice", amount: "1", unit: "cup", category: "grain" },
            { name: "century egg", amount: "2", unit: "whole", category: "protein", swaps: ["firm tofu"] },
            { name: "ground pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "ginger", amount: "2", unit: "inches", category: "spice" },
            { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
            { name: "white pepper", amount: "1", unit: "tsp", category: "spice" },
            { name: "soy sauce", amount: "2", unit: "tbsp", category: "seasoning" },
            { name: "youtiao", amount: "2", unit: "pieces", category: "bread", swaps: ["rice crackers"] }
          ],
          nutrition: {
            calories: 420,
            protein: 24,
            carbs: 58,
            fat: 12,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "45 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        },
        {
          name: "Dim Sum Breakfast",
          description: "Assorted steamed and fried dumplings and small plates",
          cuisine: "Chinese (Cantonese)",
          ingredients: [
            { name: "har gow", amount: "4", unit: "pieces", category: "dumpling", swaps: ["vegetable dumplings"] },
            { name: "siu mai", amount: "4", unit: "pieces", category: "dumpling", swaps: ["mushroom dumplings"] },
            { name: "char siu bao", amount: "2", unit: "pieces", category: "bun", swaps: ["vegetable buns"] },
            { name: "cheung fun", amount: "1", unit: "portion", category: "noodle" },
            { name: "chinese broccoli", amount: "200", unit: "g", category: "vegetable" },
            { name: "tea", amount: "500", unit: "ml", category: "beverage" }
          ],
          nutrition: {
            calories: 580,
            protein: 32,
            carbs: 75,
            fat: 22,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["breakfast", "lunch"]
        },
        {
          name: "You Tiao with Soy Milk",
          description: "Chinese fried dough sticks with fresh soy milk",
          cuisine: "Chinese",
          ingredients: [
            { name: "you tiao dough", amount: "400", unit: "g", category: "dough", swaps: ["gluten-free dough"] },
            { name: "fresh soy milk", amount: "500", unit: "ml", category: "beverage" },
            { name: "sugar", amount: "1", unit: "tbsp", category: "sweetener" },
            { name: "pickled vegetables", amount: "100", unit: "g", category: "vegetable" }
          ],
          nutrition: {
            calories: 480,
            protein: 18,
            carbs: 65,
            fat: 20,
            vitamins: ["B1", "B2"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["breakfast"]
        }
      ],
      winter: [
        {
          name: "Hot Soy Milk Soup",
          description: "Savory soy milk soup with various toppings",
          cuisine: "Chinese",
          ingredients: [
            { name: "fresh soy milk", amount: "800", unit: "ml", category: "beverage" },
            { name: "pickled mustard greens", amount: "50", unit: "g", category: "vegetable" },
            { name: "dried shrimp", amount: "30", unit: "g", category: "seafood", swaps: ["mushrooms"] },
            { name: "you tiao", amount: "2", unit: "pieces", category: "bread" },
            { name: "scallions", amount: "2", unit: "stalks", category: "vegetable" },
            { name: "chili oil", amount: "1", unit: "tbsp", category: "oil" }
          ],
          nutrition: {
            calories: 380,
            protein: 22,
            carbs: 42,
            fat: 18,
            vitamins: ["B12", "D", "E"],
            minerals: ["Calcium", "Iron"]
          },
          timeToMake: "25 minutes",
          season: ["winter"],
          mealType: ["breakfast"]
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Mapo Tofu",
          description: "Spicy Sichuan tofu dish with ground pork",
          cuisine: "Chinese (Sichuan)",
          ingredients: [
            { name: "silken tofu", amount: "400", unit: "g", category: "protein" },
            { name: "ground pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "doubanjiang", amount: "2", unit: "tbsp", category: "sauce" },
            { name: "sichuan peppercorns", amount: "1", unit: "tbsp", category: "spice" },
            { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
            { name: "ginger", amount: "2", unit: "inches", category: "spice" },
            { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
            { name: "chili oil", amount: "2", unit: "tbsp", category: "oil" }
          ],
          nutrition: {
            calories: 420,
            protein: 32,
            carbs: 12,
            fat: 28,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Dan Dan Noodles",
          description: "Spicy Sichuan noodles with ground pork and peanuts",
          cuisine: "Chinese (Sichuan)",
          ingredients: [
            { name: "wheat noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
            { name: "ground pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "ya cai", amount: "50", unit: "g", category: "vegetable" },
            { name: "peanuts", amount: "50", unit: "g", category: "nuts" },
            { name: "chili oil", amount: "3", unit: "tbsp", category: "oil" },
            { name: "sichuan peppercorns", amount: "1", unit: "tbsp", category: "spice" }
          ],
          nutrition: {
            calories: 580,
            protein: 28,
            carbs: 72,
            fat: 24,
            vitamins: ["B1", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["lunch"]
        }
      ]
    },
    summer: [
      {
        name: "Liangpi",
        description: "Cold wheat noodles with cucumber and spicy sauce",
        cuisine: "Chinese (Xi'an)",
        ingredients: [
          { name: "wheat noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
          { name: "cucumber", amount: "1", unit: "large", category: "vegetable" },
          { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
          { name: "chili oil", amount: "3", unit: "tbsp", category: "oil" },
          { name: "black vinegar", amount: "2", unit: "tbsp", category: "vinegar" },
          { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" }
        ],
        nutrition: {
          calories: 380,
          protein: 12,
          carbs: 68,
          fat: 10,
          vitamins: ["C", "B1"],
          minerals: ["Iron", "Manganese"]
        },
        timeToMake: "20 minutes",
        season: ["summer"],
        mealType: ["lunch"]
      },
      {
        name: "Cold Sesame Noodles",
        description: "Chilled noodles with sesame sauce and vegetables",
        cuisine: "Chinese",
        ingredients: [
          { name: "wheat noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
          { name: "sesame paste", amount: "4", unit: "tbsp", category: "sauce" },
          { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
          { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
          { name: "peanuts", amount: "50", unit: "g", category: "nuts" }
        ],
        nutrition: {
          calories: 420,
          protein: 16,
          carbs: 65,
          fat: 18,
          vitamins: ["E", "K"],
          minerals: ["Iron", "Magnesium"]
        },
        timeToMake: "15 minutes",
        season: ["summer"],
        mealType: ["lunch"]
      }
    ],
    winter: [
      {
        name: "Hot Pot",
        description: "Communal dish of simmering soup with various ingredients",
        cuisine: "Chinese (Sichuan)",
        ingredients: [
          { name: "soup base", amount: "2", unit: "L", category: "broth" },
          { name: "thinly sliced meat", amount: "500", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
          { name: "leafy greens", amount: "400", unit: "g", category: "vegetable" },
          { name: "mushrooms", amount: "300", unit: "g", category: "vegetable" },
          { name: "tofu", amount: "300", unit: "g", category: "protein" },
          { name: "noodles", amount: "200", unit: "g", category: "grain" }
        ],
        nutrition: {
          calories: 580,
          protein: 45,
          carbs: 42,
          fat: 28,
          vitamins: ["B12", "C", "D"],
          minerals: ["Iron", "Zinc"]
        },
        timeToMake: "90 minutes",
        season: ["winter"],
        mealType: ["lunch", "dinner"]
      }
    ],
    dinner: {
      all: [
        {
          name: "Kung Pao Chicken",
          description: "Spicy diced chicken with peanuts and vegetables",
          cuisine: "Chinese (Sichuan)",
          ingredients: [
            { name: "chicken thigh", amount: "400", unit: "g", category: "protein", swaps: ["tofu", "tempeh"] },
            { name: "peanuts", amount: "100", unit: "g", category: "nuts" },
            { name: "dried chilies", amount: "8", unit: "whole", category: "spice" },
            { name: "sichuan peppercorns", amount: "1", unit: "tbsp", category: "spice" },
            { name: "vegetables", amount: "200", unit: "g", category: "vegetable" }
          ],
          nutrition: {
            calories: 520,
            protein: 42,
            carbs: 18,
            fat: 32,
            vitamins: ["B6", "E"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["dinner"]
        },
        {
          name: "Peking Duck",
          description: "Traditional roasted duck with thin pancakes",
          cuisine: "Chinese (Beijing)",
          ingredients: [
            { name: "whole duck", amount: "2", unit: "kg", category: "protein", swaps: ["mock duck"] },
            { name: "thin pancakes", amount: "24", unit: "pieces", category: "grain" },
            { name: "scallions", amount: "1", unit: "bunch", category: "vegetable" },
            { name: "cucumber", amount: "2", unit: "whole", category: "vegetable" },
            { name: "hoisin sauce", amount: "200", unit: "g", category: "sauce" }
          ],
          nutrition: {
            calories: 680,
            protein: 45,
            carbs: 42,
            fat: 38,
            vitamins: ["B12", "A"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "24 hours",
          season: ["all"],
          mealType: ["dinner"]
        }
      ],
      summer: [
        {
          name: "Steamed Fish with Ginger and Scallions",
          description: "Fresh fish steamed Cantonese style",
          cuisine: "Chinese (Cantonese)",
          ingredients: [
            { name: "whole fish", amount: "800", unit: "g", category: "protein", swaps: ["tofu steaks"] },
            { name: "ginger", amount: "50", unit: "g", category: "spice" },
            { name: "scallions", amount: "4", unit: "stalks", category: "vegetable" },
            { name: "soy sauce", amount: "3", unit: "tbsp", category: "sauce" },
            { name: "sesame oil", amount: "2", unit: "tbsp", category: "oil" }
          ],
          nutrition: {
            calories: 320,
            protein: 45,
            carbs: 8,
            fat: 16,
            vitamins: ["D", "B12"],
            minerals: ["Selenium", "Iodine"]
          },
          timeToMake: "25 minutes",
          season: ["summer"],
          mealType: ["dinner"]
        }
      ],
      winter: [
        {
          name: "Dongpo Pork",
          description: "Braised pork belly Hangzhou style",
          cuisine: "Chinese (Hangzhou)",
          ingredients: [
            { name: "pork belly", amount: "1", unit: "kg", category: "protein", swaps: ["braised tofu"] },
            { name: "shaoxing wine", amount: "200", unit: "ml", category: "wine" },
            { name: "soy sauce", amount: "100", unit: "ml", category: "sauce" },
            { name: "rock sugar", amount: "50", unit: "g", category: "sweetener" },
            { name: "ginger", amount: "30", unit: "g", category: "spice" },
            { name: "scallions", amount: "4", unit: "stalks", category: "vegetable" }
          ],
          nutrition: {
            calories: 780,
            protein: 38,
            carbs: 12,
            fat: 65,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "180 minutes",
          season: ["winter"],
          mealType: ["dinner"]
        }
      ]
    },
    dessert: {
      all: [
        {
          name: "Red Bean Soup",
          description: "Sweet soup with red beans and lotus seeds",
          cuisine: "Chinese (Cantonese)",
          ingredients: [
            { name: "red beans", amount: "200", unit: "g", category: "beans" },
            { name: "lotus seeds", amount: "50", unit: "g", category: "seeds" },
            { name: "tangerine peel", amount: "1", unit: "piece", category: "citrus" },
            { name: "rock sugar", amount: "100", unit: "g", category: "sweetener" }
          ],
          nutrition: {
            calories: 220,
            protein: 8,
            carbs: 45,
            fat: 1,
            vitamins: ["B1", "B6"],
            minerals: ["Iron", "Magnesium"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["dessert"]
        },
        {
          name: "Eight Treasure Rice",
          description: "Glutinous rice dessert with dried fruits and nuts",
          cuisine: "Chinese",
          ingredients: [
            { name: "glutinous rice", amount: "300", unit: "g", category: "grain" },
            { name: "mixed dried fruits", amount: "150", unit: "g", category: "fruit" },
            { name: "red bean paste", amount: "200", unit: "g", category: "beans" },
            { name: "lotus seeds", amount: "50", unit: "g", category: "seeds" }
          ],
          nutrition: {
            calories: 380,
            protein: 6,
            carbs: 82,
            fat: 4,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "90 minutes",
          season: ["all"],
          mealType: ["dessert"]
        }
      ],
      summer: [
        {
          name: "Mango Pomelo Sago",
          description: "Chilled mango dessert soup",
          cuisine: "Chinese (Hong Kong)",
          ingredients: [
            { name: "fresh mango", amount: "400", unit: "g", category: "fruit" },
            { name: "sago pearls", amount: "50", unit: "g", category: "starch" },
            { name: "pomelo", amount: "200", unit: "g", category: "fruit" },
            { name: "coconut milk", amount: "200", unit: "ml", category: "dairy" },
            { name: "condensed milk", amount: "60", unit: "ml", category: "dairy", swaps: ["coconut condensed milk"] }
          ],
          nutrition: {
            calories: 280,
            protein: 4,
            carbs: 52,
            fat: 8,
            vitamins: ["C", "A"],
            minerals: ["Potassium"]
          },
          timeToMake: "40 minutes",
          season: ["summer"],
          mealType: ["dessert"]
        }
      ]
    }
  },
  elementalBalance: {
    Fire: 0.3,    // Represents wok hei and spicy elements
    Earth: 0.3,   // Represents grounding ingredients and slow cooking
    Water: 0.2,   // Represents soups and steamed dishes
    Air: 0.2      // Represents light preparations and fresh herbs
  }
};