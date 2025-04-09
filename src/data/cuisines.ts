// src/data/cuisines.ts
import { herbs } from '../ingredients/herbs';
import { CuisineType } from '../types';  // adjust the path as needed
import type { Recipe, ElementalProperties } from '@/types/alchemy';

interface CuisineType {
  name: string;
  description: string;
  dishes: {
    [key: string]: {
      [season: string]: Recipe[]
    }
  };
  elementalBalance: ElementalProperties;
}

export const cuisines: Record<string, CuisineType> = {
  japanese: {
    name: "Japanese",
    description: "Traditional Japanese cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Traditional Japanese Breakfast Set",
            description: "Classic breakfast with grilled fish, rice, miso soup, and sides",
            cuisine: "Japanese",
            ingredients: [
              { name: "steamed rice", amount: "150", unit: "g", category: "grain", swaps: ["quinoa"] },
              { name: "grilled mackerel", amount: "100", unit: "g", category: "protein", swaps: ["tofu", "tempeh"] },
              { name: "miso paste", amount: "1", unit: "tbsp", category: "seasoning" },
              { name: "nori", amount: "1", unit: "sheet", category: "seaweed" },
              { name: "pickled vegetables", amount: "30", unit: "g", category: "vegetable" },
              { name: "raw egg", amount: "1", unit: "large", category: "protein", swaps: ["soft tofu"] }
            ],
            nutrition: {
              calories: 450,
              protein: 28,
              carbs: 55,
              fat: 16,
              vitamins: ["D", "B12", "A"],
              minerals: ["Omega-3", "Iodine", "Iron"]
            },
            timeToMake: "20 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          },
          {
            name: "Okayu with Umeboshi",
            description: "Soothing rice porridge with pickled plum",
            cuisine: "Japanese",
            ingredients: [
              { name: "rice", amount: "100", unit: "g", category: "grain" },
              { name: "umeboshi", amount: "2", unit: "pieces", category: "pickle" },
              { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
              { name: "ginger", amount: "1", unit: "tbsp", category: "spice" },
              { name: "sesame seeds", amount: "1", unit: "tsp", category: "seed" }
            ],
            nutrition: {
              calories: 280,
              protein: 6,
              carbs: 58,
              fat: 4,
              vitamins: ["B1", "B6"],
              minerals: ["Manganese", "Iron"]
            },
            timeToMake: "30 minutes",
            season: ["winter", "all"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Zaru Soba",
            description: "Chilled buckwheat noodles with dipping sauce",
            cuisine: "Japanese",
            ingredients: [
              { name: "soba noodles", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free soba"] },
              { name: "mentsuyu", amount: "100", unit: "ml", category: "sauce" },
              { name: "wasabi", amount: "1", unit: "tsp", category: "condiment" },
              { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
              { name: "nori strips", amount: "2", unit: "sheets", category: "seaweed" }
            ],
            nutrition: {
              calories: 340,
              protein: 14,
              carbs: 68,
              fat: 2,
              vitamins: ["B1", "B2"],
              minerals: ["Manganese", "Iron"]
            },
            timeToMake: "15 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Hiyashi Chuka",
            description: "Cold ramen salad with colorful toppings",
            cuisine: "Japanese",
            ingredients: [
              { name: "ramen noodles", amount: "200", unit: "g", category: "grain", swaps: ["rice noodles"] },
              { name: "ham", amount: "50", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
              { name: "egg", amount: "1", unit: "large", category: "protein" },
              { name: "sesame sauce", amount: "60", unit: "ml", category: "sauce" }
            ],
            nutrition: {
              calories: 420,
              protein: 22,
              carbs: 65,
              fat: 12,
              vitamins: ["A", "C", "B12"],
              minerals: ["Iron", "Selenium"]
            },
            timeToMake: "25 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ],
        winter: [
          {
            name: "Udon Kitsune",
            description: "Thick wheat noodles with sweet fried tofu",
            cuisine: "Japanese",
            ingredients: [
              { name: "udon noodles", amount: "250", unit: "g", category: "grain", swaps: ["rice noodles"] },
              { name: "aburaage", amount: "2", unit: "pieces", category: "protein" },
              { name: "dashi", amount: "500", unit: "ml", category: "broth", swaps: ["vegetable broth"] },
              { name: "mirin", amount: "2", unit: "tbsp", category: "seasoning" },
              { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" }
            ],
            nutrition: {
              calories: 380,
              protein: 14,
              carbs: 72,
              fat: 8,
              vitamins: ["B1", "B2"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "20 minutes",
            season: ["winter"],
            mealType: ["lunch"]
          }
        ]
      },
      dinner: {
        winter: [
          {
            name: "Nabe Hot Pot",
            description: "Warming communal hot pot with seasonal ingredients",
            cuisine: "Japanese",
            ingredients: [
              { name: "dashi", amount: "1", unit: "L", category: "broth", swaps: ["vegetable broth"] },
              { name: "tofu", amount: "300", unit: "g", category: "protein" },
              { name: "napa cabbage", amount: "400", unit: "g", category: "vegetable" },
              { name: "mushrooms", amount: "200", unit: "g", category: "vegetable" },
              { name: "ponzu", amount: "100", unit: "ml", category: "sauce" }
            ],
            nutrition: {
              calories: 320,
              protein: 24,
              carbs: 28,
              fat: 16,
              vitamins: ["C", "D", "K"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "45 minutes",
            season: ["winter"],
            mealType: ["dinner"]
          },
          {
            name: "Katsudon",
            description: "Breaded pork cutlet with egg over rice",
            cuisine: "Japanese",
            ingredients: [
              { name: "pork cutlet", amount: "200", unit: "g", category: "protein", swaps: ["seitan cutlet"] },
              { name: "rice", amount: "200", unit: "g", category: "grain" },
              { name: "onion", amount: "1", unit: "medium", category: "vegetable" },
              { name: "eggs", amount: "2", unit: "large", category: "protein" },
              { name: "dashi", amount: "100", unit: "ml", category: "broth" }
            ],
            nutrition: {
              calories: 680,
              protein: 38,
              carbs: 76,
              fat: 28,
              vitamins: ["B12", "D", "B6"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "30 minutes",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Unagi Don",
            description: "Grilled eel over rice with sweet sauce",
            cuisine: "Japanese",
            ingredients: [
              { name: "unagi", amount: "200", unit: "g", category: "protein", swaps: ["marinated mushrooms"] },
              { name: "rice", amount: "200", unit: "g", category: "grain" },
              { name: "unagi sauce", amount: "30", unit: "ml", category: "sauce" },
              { name: "wasabi", amount: "1", unit: "tsp", category: "condiment" },
              { name: "pickled ginger", amount: "20", unit: "g", category: "pickle" }
            ],
            nutrition: {
              calories: 560,
              protein: 32,
              carbs: 68,
              fat: 22,
              vitamins: ["A", "D", "B12"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "20 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          },
          {
            name: "Tempura Moriawase",
            description: "Assorted tempura with seasonal vegetables and seafood",
            cuisine: "Japanese",
            ingredients: [
              { name: "mixed seafood", amount: "200", unit: "g", category: "protein", swaps: ["vegetables"] },
              { name: "seasonal vegetables", amount: "300", unit: "g", category: "vegetable" },
              { name: "tempura flour", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free flour"] },
              { name: "dashi", amount: "100", unit: "ml", category: "sauce" },
              { name: "grated daikon", amount: "50", unit: "g", category: "vegetable" }
            ],
            nutrition: {
              calories: 480,
              protein: 24,
              carbs: 52,
              fat: 24,
              vitamins: ["A", "C", "D"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "40 minutes",
            season: ["all"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  middleEastern: {
    name: "Middle Eastern",
    description: "Middle Eastern cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Shakshuka",
            description: "Eggs poached in spiced tomato sauce with peppers and onions",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["soft tofu"] },
              { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
              { name: "bell peppers", amount: "2", unit: "medium", category: "vegetable" },
              { name: "onion", amount: "1", unit: "large", category: "vegetable" },
              { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
              { name: "cumin", amount: "1", unit: "tsp", category: "spice" },
              { name: "paprika", amount: "1", unit: "tsp", category: "spice" },
              { name: "pita bread", amount: "2", unit: "pieces", category: "grain", swaps: ["gluten-free pita"] }
            ],
            nutrition: {
              calories: 420,
              protein: 24,
              carbs: 38,
              fat: 22,
              vitamins: ["A", "C", "D"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "25 minutes",
            season: ["all"],
            mealType: ["breakfast", "brunch"]
          },
          {
            name: "Ful Medames",
            description: "Traditional fava bean breakfast with olive oil, lemon, and herbs",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "fava beans", amount: "400", unit: "g", category: "legume" },
              { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
              { name: "lemon juice", amount: "2", unit: "tbsp", category: "acid" },
              { name: "garlic", amount: "2", unit: "cloves", category: "vegetable" },
              { name: "cumin", amount: "1", unit: "tsp", category: "spice" },
              { name: "parsley", amount: "1/4", unit: "cup", category: "herb" },
              { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" }
            ],
            nutrition: {
              calories: 380,
              protein: 18,
              carbs: 45,
              fat: 16,
              vitamins: ["C", "K", "B6"],
              minerals: ["Iron", "Folate"]
            },
            timeToMake: "20 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Fattoush Salad",
            description: "Fresh vegetable salad with toasted pita and sumac dressing",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "pita bread", amount: "2", unit: "pieces", category: "grain", swaps: ["gluten-free pita"] },
              { name: "cucumber", amount: "2", unit: "medium", category: "vegetable" },
              { name: "tomatoes", amount: "3", unit: "medium", category: "vegetable" },
              { name: "romaine lettuce", amount: "1", unit: "head", category: "vegetable" },
              { name: "radishes", amount: "6", unit: "medium", category: "vegetable" },
              { name: "sumac", amount: "1", unit: "tbsp", category: "spice" },
              { name: "pomegranate molasses", amount: "2", unit: "tbsp", category: "condiment" },
              { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" }
            ],
            nutrition: {
              calories: 320,
              protein: 8,
              carbs: 48,
              fat: 14,
              vitamins: ["C", "A", "K"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "15 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Tabbouleh",
            description: "Fresh parsley and bulgur salad with tomatoes and mint",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "bulgur wheat", amount: "1/2", unit: "cup", category: "grain", swaps: ["quinoa"] },
              { name: "parsley", amount: "3", unit: "bunches", category: "herb" },
              { name: "mint", amount: "1/2", unit: "cup", category: "herb" },
              { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
              { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
              { name: "lemon juice", amount: "4", unit: "tbsp", category: "acid" },
              { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" }
            ],
            nutrition: {
              calories: 280,
              protein: 6,
              carbs: 42,
              fat: 12,
              vitamins: ["C", "K", "A"],
              minerals: ["Iron", "Magnesium"]
            },
            timeToMake: "30 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ],
        winter: [
          {
            name: "Lentil Soup",
            description: "Warming red lentil soup with cumin and lemon",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "red lentils", amount: "2", unit: "cups", category: "legume" },
              { name: "onion", amount: "1", unit: "large", category: "vegetable" },
              { name: "carrots", amount: "2", unit: "medium", category: "vegetable" },
              { name: "cumin", amount: "2", unit: "tsp", category: "spice" },
              { name: "lemon juice", amount: "2", unit: "tbsp", category: "acid" },
              { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" }
            ],
            nutrition: {
              calories: 340,
              protein: 18,
              carbs: 52,
              fat: 8,
              vitamins: ["A", "C", "B6"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "40 minutes",
            season: ["winter"],
            mealType: ["lunch"]
          }
        ]
      },
      dinner: {
        winter: [
          {
            name: "Moussaka",
            description: "Layered eggplant and spiced meat casserole with béchamel",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "ground lamb", amount: "500", unit: "g", category: "protein", swaps: ["plant-based ground"] },
              { name: "eggplant", amount: "3", unit: "large", category: "vegetable" },
              { name: "potatoes", amount: "2", unit: "medium", category: "vegetable" },
              { name: "onion", amount: "1", unit: "large", category: "vegetable" },
              { name: "tomato sauce", amount: "400", unit: "ml", category: "sauce" },
              { name: "béchamel sauce", amount: "500", unit: "ml", category: "sauce", swaps: ["cashew sauce"] },
              { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" }
            ],
            nutrition: {
              calories: 580,
              protein: 32,
              carbs: 45,
              fat: 34,
              vitamins: ["B12", "A", "C"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "1.5 hours",
            season: ["winter"],
            mealType: ["dinner"]
          },
          {
            name: "Koshari",
            description: "Egyptian comfort food with rice, lentils, pasta, and spicy tomato sauce",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "rice", amount: "1", unit: "cup", category: "grain" },
              { name: "brown lentils", amount: "1", unit: "cup", category: "legume" },
              { name: "macaroni", amount: "1", unit: "cup", category: "grain", swaps: ["gluten-free pasta"] },
              { name: "chickpeas", amount: "400", unit: "g", category: "legume" },
              { name: "tomato sauce", amount: "500", unit: "ml", category: "sauce" },
              { name: "crispy onions", amount: "2", unit: "cups", category: "vegetable" }
            ],
            nutrition: {
              calories: 520,
              protein: 18,
              carbs: 92,
              fat: 8,
              vitamins: ["B1", "B6", "C"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "1 hour",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Grilled Mixed Mezze",
            description: "Assortment of grilled vegetables, meats, and dips",
            cuisine: "Middle Eastern",
            ingredients: [
              { name: "lamb kofta", amount: "400", unit: "g", category: "protein", swaps: ["mushroom kofta"] },
              { name: "hummus", amount: "200", unit: "g", category: "dip" },
              { name: "baba ganoush", amount: "200", unit: "g", category: "dip" },
              { name: "pita bread", amount: "4", unit: "pieces", category: "grain", swaps: ["gluten-free pita"] },
              { name: "mixed vegetables", amount: "500", unit: "g", category: "vegetable" },
              { name: "tzatziki", amount: "200", unit: "g", category: "sauce", swaps: ["dairy-free tzatziki"] }
            ],
            nutrition: {
              calories: 680,
              protein: 38,
              carbs: 65,
              fat: 32,
              vitamins: ["B12", "C", "A"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "45 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  thai: {
    name: "Thai",
    description: "Thai cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Jok (Rice Porridge)",
            description: "Comforting rice porridge with ginger, ground pork, and soft-boiled egg",
            cuisine: "Thai",
            ingredients: [
              { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
              { name: "ginger", amount: "2", unit: "tbsp", category: "spice" },
              { name: "ground pork", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
              { name: "soft-boiled egg", amount: "2", unit: "large", category: "protein", swaps: ["silken tofu"] },
              { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
              { name: "fried garlic", amount: "2", unit: "tbsp", category: "garnish" },
              { name: "white pepper", amount: "1", unit: "tsp", category: "spice" },
              { name: "soy sauce", amount: "2", unit: "tbsp", category: "seasoning" }
            ],
            nutrition: {
              calories: 380,
              protein: 22,
              carbs: 58,
              fat: 8,
              vitamins: ["B6", "B12"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "30 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          },
          {
            name: "Khao Tom (Rice Soup)",
            description: "Light rice soup with shrimp, ginger, and herbs",
            cuisine: "Thai",
            ingredients: [
              { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
              { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "ginger", amount: "2", unit: "inches", category: "spice" },
              { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
              { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" },
              { name: "green onions", amount: "4", unit: "stalks", category: "vegetable" },
              { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
            ],
            nutrition: {
              calories: 320,
              protein: 24,
              carbs: 48,
              fat: 6,
              vitamins: ["B12", "C"],
              minerals: ["Iron", "Iodine"]
            },
            timeToMake: "25 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Som Tam (Green Papaya Salad)",
            description: "Spicy and sour green papaya salad with long beans and tomatoes",
            cuisine: "Thai",
            ingredients: [
              { name: "green papaya", amount: "300", unit: "g", category: "vegetable" },
              { name: "long beans", amount: "100", unit: "g", category: "vegetable" },
              { name: "cherry tomatoes", amount: "100", unit: "g", category: "vegetable" },
              { name: "dried shrimp", amount: "2", unit: "tbsp", category: "protein", swaps: ["crushed toasted peanuts"] },
              { name: "lime", amount: "2", unit: "whole", category: "fruit" },
              { name: "palm sugar", amount: "2", unit: "tbsp", category: "sweetener" },
              { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
              { name: "Thai chilies", amount: "2", unit: "pieces", category: "spice" },
              { name: "garlic", amount: "3", unit: "cloves", category: "vegetable" },
              { name: "peanuts", amount: "1/4", unit: "cup", category: "nuts" }
            ],
            nutrition: {
              calories: 280,
              protein: 12,
              carbs: 32,
              fat: 16,
              vitamins: ["C", "A", "K"],
              minerals: ["Potassium", "Iron"]
            },
            timeToMake: "20 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Pad Thai",
            description: "Classic stir-fried rice noodles with tamarind sauce and peanuts",
            cuisine: "Thai",
            ingredients: [
              { name: "rice noodles", amount: "250", unit: "g", category: "grain" },
              { name: "tofu", amount: "200", unit: "g", category: "protein" },
              { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["extra tofu"] },
              { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["chickpea flour mixture"] },
              { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
              { name: "garlic chives", amount: "100", unit: "g", category: "vegetable" },
              { name: "peanuts", amount: "1/2", unit: "cup", category: "nuts" },
              { name: "tamarind paste", amount: "3", unit: "tbsp", category: "seasoning" },
              { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
              { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" }
            ],
            nutrition: {
              calories: 450,
              protein: 28,
              carbs: 65,
              fat: 18,
              vitamins: ["B12", "K", "E"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "30 minutes",
            season: ["all"],
            mealType: ["lunch", "dinner"]
          }
        ],
        winter: [
          {
            name: "Tom Kha Gai",
            description: "Coconut chicken soup with galangal and lemongrass",
            cuisine: "Thai",
            ingredients: [
              { name: "chicken breast", amount: "400", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
              { name: "mushrooms", amount: "200", unit: "g", category: "vegetable" },
              { name: "galangal", amount: "4", unit: "slices", category: "spice" },
              { name: "lemongrass", amount: "2", unit: "stalks", category: "herb" },
              { name: "kaffir lime leaves", amount: "4", unit: "pieces", category: "herb" },
              { name: "Thai chilies", amount: "3", unit: "pieces", category: "spice" },
              { name: "lime juice", amount: "3", unit: "tbsp", category: "acid" },
              { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
            ],
            nutrition: {
              calories: 420,
              protein: 32,
              carbs: 12,
              fat: 28,
              vitamins: ["D", "B12", "C"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "35 minutes",
            season: ["winter"],
            mealType: ["lunch"]
          }
        ]
      },
      dinner: {
        all: [
          {
            name: "Green Curry",
            description: "Rich coconut curry with eggplant and bamboo shoots",
            cuisine: "Thai",
            ingredients: [
              { name: "chicken thighs", amount: "500", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "green curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
              { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
              { name: "Thai eggplant", amount: "200", unit: "g", category: "vegetable" },
              { name: "bamboo shoots", amount: "200", unit: "g", category: "vegetable" },
              { name: "kaffir lime leaves", amount: "4", unit: "pieces", category: "herb" },
              { name: "Thai basil", amount: "1", unit: "cup", category: "herb" },
              { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
            ],
            nutrition: {
              calories: 520,
              protein: 35,
              carbs: 18,
              fat: 38,
              vitamins: ["A", "C", "K"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "45 minutes",
            season: ["all"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Pla Neung Manao",
            description: "Steamed fish with spicy lime sauce",
            cuisine: "Thai",
            ingredients: [
              { name: "sea bass", amount: "600", unit: "g", category: "protein", swaps: ["tofu steaks"] },
              { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
              { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
              { name: "Thai chilies", amount: "5", unit: "pieces", category: "spice" },
              { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
              { name: "cilantro", amount: "1", unit: "cup", category: "herb" },
              { name: "lemongrass", amount: "2", unit: "stalks", category: "herb" }
            ],
            nutrition: {
              calories: 320,
              protein: 42,
              carbs: 8,
              fat: 14,
              vitamins: ["D", "B12", "C"],
              minerals: ["Selenium", "Omega-3"]
            },
            timeToMake: "30 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          }
        ],
        winter: [
          {
            name: "Khao Soi",
            description: "Northern Thai curry noodle soup with crispy noodles",
            cuisine: "Thai",
            ingredients: [
              { name: "egg noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
              { name: "chicken thighs", amount: "400", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
              { name: "khao soi curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
              { name: "shallots", amount: "4", unit: "medium", category: "vegetable" },
              { name: "pickled mustard greens", amount: "100", unit: "g", category: "vegetable" },
              { name: "lime", amount: "2", unit: "whole", category: "fruit" },
              { name: "crispy noodles", amount: "100", unit: "g", category: "garnish" }
            ],
            nutrition: {
              calories: 580,
              protein: 32,
              carbs: 65,
              fat: 28,
              vitamins: ["A", "B12", "D"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "45 minutes",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  korean: {
    name: "Korean",
    description: "Korean cuisine",
    dishes: {
      breakfast: {
        winter: [
          {
            name: "Juk (Korean Rice Porridge)",
            description: "Warming rice porridge with vegetables and protein",
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
        ]
      },
      lunch: {
        summer: [
          {
            name: "Bibim Guksu",
            description: "Cold spicy noodles with vegetables",
            cuisine: "Korean",
            ingredients: [
              { name: "somen noodles", amount: "200", unit: "g", category: "grain", swaps: ["rice noodles"] },
              { name: "gochugaru", amount: "2", unit: "tbsp", category: "spice" },
              { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
              { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu"] }
            ],
            nutrition: {
              calories: 420,
              protein: 16,
              carbs: 72,
              fat: 10,
              vitamins: ["B12", "C", "D"],
              minerals: ["Iron", "Selenium"]
            },
            timeToMake: "20 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  italian: {
    name: "Italian",
    description: "Italian cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Cornetto e Cappuccino",
            description: "Traditional Italian breakfast pastry with coffee",
            cuisine: "Italian (Roman)",
            ingredients: [
              { name: "cornetto", amount: "1", unit: "piece", category: "pastry", swaps: ["gluten-free croissant"] },
              { name: "espresso", amount: "30", unit: "ml", category: "beverage" },
              { name: "steamed milk", amount: "120", unit: "ml", category: "dairy", swaps: ["oat milk", "almond milk"] },
              { name: "honey", amount: "1", unit: "tsp", category: "sweetener", swaps: ["agave"] }
            ],
            nutrition: {
              calories: 340,
              protein: 8,
              carbs: 42,
              fat: 16,
              vitamins: ["A", "D"],
              minerals: ["Calcium"]
            },
            timeToMake: "10 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ],
        summer: [
          {
            name: "Ricotta e Fichi",
            description: "Fresh ricotta with ripe figs and honey (Tuscan style)",
            cuisine: "Italian (Tuscan)",
            ingredients: [
              { name: "fresh ricotta", amount: "200", unit: "g", category: "dairy", swaps: ["almond ricotta"] },
              { name: "fresh figs", amount: "4", unit: "whole", category: "fruit" },
              { name: "honey", amount: "2", unit: "tbsp", category: "sweetener" },
              { name: "pistachios", amount: "30", unit: "g", category: "nuts" },
              { name: "mint leaves", amount: "4", unit: "pieces", category: "herb" }
            ],
            nutrition: {
              calories: 380,
              protein: 18,
              carbs: 42,
              fat: 18,
              vitamins: ["A", "B12", "K"],
              minerals: ["Calcium", "Magnesium"]
            },
            timeToMake: "5 minutes",
            season: ["summer"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Pasta alla Norma",
            description: "Sicilian pasta with eggplant and ricotta salata",
            cuisine: "Italian (Sicilian)",
            ingredients: [
              { name: "pasta", amount: "320", unit: "g", category: "grain", swaps: ["gluten-free pasta"] },
              { name: "eggplant", amount: "2", unit: "medium", category: "vegetable" },
              { name: "tomato sauce", amount: "400", unit: "g", category: "sauce" },
              { name: "ricotta salata", amount: "100", unit: "g", category: "dairy", swaps: ["vegan cheese"] },
              { name: "basil", amount: "1", unit: "bunch", category: "herb" }
            ],
            nutrition: {
              calories: 450,
              protein: 16,
              carbs: 72,
              fat: 14,
              vitamins: ["C", "A", "K"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "35 minutes",
            season: ["summer"],
            mealType: ["lunch", "dinner"]
          },
          {
            name: "Insalata Caprese",
            description: "Classic Capri salad with mozzarella and tomatoes",
            cuisine: "Italian (Campanian)",
            ingredients: [
              { name: "buffalo mozzarella", amount: "200", unit: "g", category: "dairy", swaps: ["plant-based mozzarella"] },
              { name: "tomatoes", amount: "300", unit: "g", category: "vegetable" },
              { name: "fresh basil", amount: "1", unit: "bunch", category: "herb" },
              { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
              { name: "balsamic vinegar", amount: "1", unit: "tbsp", category: "vinegar" }
            ],
            nutrition: {
              calories: 320,
              protein: 18,
              carbs: 8,
              fat: 24,
              vitamins: ["A", "C", "K"],
              minerals: ["Calcium", "Potassium"]
            },
            timeToMake: "10 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ],
        winter: [
          {
            name: "Ribollita",
            description: "Hearty Tuscan bread and vegetable soup",
            cuisine: "Italian (Tuscan)",
            ingredients: [
              { name: "stale bread", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free bread"] },
              { name: "cannellini beans", amount: "400", unit: "g", category: "legume" },
              { name: "cavolo nero", amount: "300", unit: "g", category: "vegetable" },
              { name: "vegetables", amount: "500", unit: "g", category: "vegetable" },
              { name: "olive oil", amount: "60", unit: "ml", category: "oil" }
            ],
            nutrition: {
              calories: 420,
              protein: 18,
              carbs: 65,
              fat: 14,
              vitamins: ["A", "C", "K"],
              minerals: ["Iron", "Fiber"]
            },
            timeToMake: "1.5 hours",
            season: ["winter"],
            mealType: ["lunch"]
          }
        ]
      },
      dinner: {
        winter: [
          {
            name: "Osso Buco alla Milanese",
            description: "Braised veal shanks with gremolata (Lombardy specialty)",
            cuisine: "Italian (Lombard)",
            ingredients: [
              { name: "veal shanks", amount: "1.2", unit: "kg", category: "protein", swaps: ["mushroom shanks"] },
              { name: "white wine", amount: "250", unit: "ml", category: "wine" },
              { name: "vegetables", amount: "300", unit: "g", category: "vegetable" },
              { name: "broth", amount: "500", unit: "ml", category: "liquid" },
              { name: "gremolata", amount: "1", unit: "portion", category: "condiment" }
            ],
            nutrition: {
              calories: 580,
              protein: 45,
              carbs: 15,
              fat: 32,
              vitamins: ["B12", "A", "K"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "2.5 hours",
            season: ["winter"],
            mealType: ["dinner"]
          },
          {
            name: "Risotto al Tartufo",
            description: "Piedmontese truffle risotto",
            cuisine: "Italian (Piedmontese)",
            ingredients: [
              { name: "arborio rice", amount: "320", unit: "g", category: "grain" },
              { name: "black truffle", amount: "20", unit: "g", category: "mushroom" },
              { name: "parmigiano", amount: "100", unit: "g", category: "dairy", swaps: ["nutritional yeast"] },
              { name: "butter", amount: "50", unit: "g", category: "dairy", swaps: ["olive oil"] },
              { name: "broth", amount: "1", unit: "L", category: "liquid" }
            ],
            nutrition: {
              calories: 480,
              protein: 14,
              carbs: 68,
              fat: 22,
              vitamins: ["B12", "D"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "40 minutes",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Acqua Pazza",
            description: "Neapolitan style fish in 'crazy water'",
            cuisine: "Italian (Neapolitan)",
            ingredients: [
              { name: "fresh fish", amount: "600", unit: "g", category: "protein", swaps: ["heart of palm"] },
              { name: "cherry tomatoes", amount: "300", unit: "g", category: "vegetable" },
              { name: "white wine", amount: "150", unit: "ml", category: "wine" },
              { name: "garlic", amount: "4", unit: "cloves", category: "vegetable" },
              { name: "parsley", amount: "1", unit: "bunch", category: "herb" }
            ],
            nutrition: {
              calories: 320,
              protein: 42,
              carbs: 12,
              fat: 14,
              vitamins: ["D", "B12", "C"],
              minerals: ["Selenium", "Iodine"]
            },
            timeToMake: "30 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          },
          {
            name: "Caponata",
            description: "Sicilian sweet and sour eggplant dish",
            cuisine: "Italian (Sicilian)",
            ingredients: [
              { name: "eggplant", amount: "700", unit: "g", category: "vegetable" },
              { name: "celery", amount: "200", unit: "g", category: "vegetable" },
              { name: "tomatoes", amount: "300", unit: "g", category: "vegetable" },
              { name: "capers", amount: "50", unit: "g", category: "condiment" },
              { name: "pine nuts", amount: "50", unit: "g", category: "nuts" }
            ],
            nutrition: {
              calories: 280,
              protein: 8,
              carbs: 32,
              fat: 16,
              vitamins: ["C", "K", "B6"],
              minerals: ["Potassium", "Fiber"]
            },
            timeToMake: "1 hour",
            season: ["summer"],
            mealType: ["dinner", "lunch"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  french: {
    name: "French",
    description: "French cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Classic French Breakfast",
            description: "Traditional café breakfast with croissant, café au lait, and fresh fruit",
            cuisine: "French",
            ingredients: [
              { name: "croissant", amount: "1", unit: "piece", category: "grain", swaps: ["gluten-free croissant"] },
              { name: "butter", amount: "30", unit: "g", category: "dairy", swaps: ["plant-based butter"] },
              { name: "jam", amount: "30", unit: "g", category: "spread" },
              { name: "coffee", amount: "200", unit: "ml", category: "beverage" },
              { name: "hot milk", amount: "100", unit: "ml", category: "dairy", swaps: ["almond milk", "oat milk"] }
            ],
            nutrition: {
              calories: 420,
              protein: 8,
              carbs: 48,
              fat: 24,
              vitamins: ["A", "D"],
              minerals: ["Calcium"]
            },
            timeToMake: "10 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          },
          {
            name: "Oeufs en Cocotte",
            description: "Baked eggs with cream and herbs",
            cuisine: "French",
            ingredients: [
              { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["JUST Egg"] },
              { name: "cream", amount: "60", unit: "ml", category: "dairy", swaps: ["cashew cream"] },
              { name: "herbs", amount: "1", unit: "tbsp", category: "herb" },
              { name: "butter", amount: "15", unit: "g", category: "dairy", swaps: ["olive oil"] },
              { name: "baguette", amount: "1/2", unit: "piece", category: "grain", swaps: ["gluten-free bread"] }
            ],
            nutrition: {
              calories: 380,
              protein: 18,
              carbs: 22,
              fat: 26,
              vitamins: ["A", "D", "B12"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "15 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Salade Niçoise",
            description: "Classic Provençal salad with tuna and vegetables",
            cuisine: "French",
            ingredients: [
              { name: "tuna", amount: "200", unit: "g", category: "protein", swaps: ["chickpeas"] },
              { name: "green beans", amount: "150", unit: "g", category: "vegetable" },
              { name: "potatoes", amount: "200", unit: "g", category: "vegetable" },
              { name: "eggs", amount: "2", unit: "large", category: "protein" },
              { name: "olives", amount: "50", unit: "g", category: "vegetable" },
              { name: "vinaigrette", amount: "60", unit: "ml", category: "dressing" }
            ],
            nutrition: {
              calories: 450,
              protein: 32,
              carbs: 35,
              fat: 22,
              vitamins: ["B12", "D", "K"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "30 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Quiche Lorraine",
            description: "Classic bacon and egg tart from Lorraine region",
            cuisine: "French",
            ingredients: [
              { name: "pastry dough", amount: "1", unit: "piece", category: "grain", swaps: ["gluten-free crust"] },
              { name: "bacon lardons", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
              { name: "eggs", amount: "4", unit: "large", category: "protein" },
              { name: "cream", amount: "250", unit: "ml", category: "dairy", swaps: ["cashew cream"] },
              { name: "Gruyère", amount: "100", unit: "g", category: "dairy", swaps: ["vegan cheese"] }
            ],
            nutrition: {
              calories: 580,
              protein: 24,
              carbs: 38,
              fat: 42,
              vitamins: ["A", "D", "B12"],
              minerals: ["Calcium", "Iron"]
            },
            timeToMake: "45 minutes",
            season: ["all"],
            mealType: ["lunch", "dinner"]
          }
        ],
        winter: [
          {
            name: "Soupe à l'Oignon",
            description: "Traditional French onion soup with bread and cheese",
            cuisine: "French",
            ingredients: [
              { name: "onions", amount: "1", unit: "kg", category: "vegetable" },
              { name: "beef stock", amount: "1.5", unit: "L", category: "broth", swaps: ["vegetable stock"] },
              { name: "baguette", amount: "1/2", unit: "piece", category: "grain", swaps: ["gluten-free bread"] },
              { name: "Gruyère", amount: "200", unit: "g", category: "dairy", swaps: ["vegan cheese"] },
              { name: "butter", amount: "50", unit: "g", category: "dairy", swaps: ["olive oil"] }
            ],
            nutrition: {
              calories: 420,
              protein: 18,
              carbs: 45,
              fat: 22,
              vitamins: ["C", "B1"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "1.5 hours",
            season: ["winter"],
            mealType: ["lunch", "dinner"]
          }
        ]
      },
      dinner: {
        winter: [
          {
            name: "Coq au Vin",
            description: "Burgundian braised chicken in wine sauce",
            cuisine: "French",
            ingredients: [
              { name: "chicken", amount: "1.5", unit: "kg", category: "protein", swaps: ["mushrooms and seitan"] },
              { name: "red wine", amount: "750", unit: "ml", category: "wine" },
              { name: "mushrooms", amount: "300", unit: "g", category: "vegetable" },
              { name: "bacon lardons", amount: "200", unit: "g", category: "protein", swaps: ["smoked tempeh"] },
              { name: "pearl onions", amount: "250", unit: "g", category: "vegetable" }
            ],
            nutrition: {
              calories: 580,
              protein: 45,
              carbs: 15,
              fat: 32,
              vitamins: ["B12", "B6", "K"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "2.5 hours",
            season: ["winter"],
            mealType: ["dinner"]
          },
          {
            name: "Cassoulet",
            description: "Southern French bean and meat casserole",
            cuisine: "French",
            ingredients: [
              { name: "white beans", amount: "500", unit: "g", category: "legume" },
              { name: "duck confit", amount: "400", unit: "g", category: "protein", swaps: ["mushroom confit"] },
              { name: "sausages", amount: "300", unit: "g", category: "protein", swaps: ["plant-based sausage"] },
              { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
              { name: "breadcrumbs", amount: "100", unit: "g", category: "grain", swaps: ["gluten-free breadcrumbs"] }
            ],
            nutrition: {
              calories: 750,
              protein: 48,
              carbs: 65,
              fat: 38,
              vitamins: ["B1", "B12", "K"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "3 hours",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Bouillabaisse",
            description: "Provençal fish stew with rouille sauce",
            cuisine: "French",
            ingredients: [
              { name: "mixed fish", amount: "800", unit: "g", category: "protein", swaps: ["hearts of palm", "mushrooms"] },
              { name: "shellfish", amount: "400", unit: "g", category: "protein", swaps: ["king oyster mushrooms"] },
              { name: "fennel", amount: "1", unit: "bulb", category: "vegetable" },
              { name: "tomatoes", amount: "400", unit: "g", category: "vegetable" },
              { name: "saffron", amount: "1", unit: "pinch", category: "spice" },
              { name: "rouille sauce", amount: "200", unit: "ml", category: "sauce" }
            ],
            nutrition: {
              calories: 480,
              protein: 52,
              carbs: 28,
              fat: 22,
              vitamins: ["D", "B12", "A"],
              minerals: ["Iodine", "Selenium"]
            },
            timeToMake: "1.5 hours",
            season: ["summer"],
            mealType: ["dinner"]
          },
          {
            name: "Ratatouille",
            description: "Provençal vegetable stew",
            cuisine: "French",
            ingredients: [
              { name: "eggplant", amount: "2", unit: "medium", category: "vegetable" },
              { name: "zucchini", amount: "3", unit: "medium", category: "vegetable" },
              { name: "bell peppers", amount: "2", unit: "large", category: "vegetable" },
              { name: "tomatoes", amount: "4", unit: "large", category: "vegetable" },
              { name: "herbs de Provence", amount: "2", unit: "tbsp", category: "herb" }
            ],
            nutrition: {
              calories: 220,
              protein: 6,
              carbs: 42,
              fat: 8,
              vitamins: ["C", "A", "K"],
              minerals: ["Potassium", "Manganese"]
            },
            timeToMake: "1 hour",
            season: ["summer"],
            mealType: ["dinner", "lunch"]
          }
        ]
      }
    },
    elementalBalance: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1
    }
  },
  indian: {
    name: "Indian",
    description: "Indian cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Masala Dosa with Sambar",
            description: "Crispy fermented rice crepe with spiced potato filling and lentil soup",
            cuisine: "Indian",
            ingredients: [
              { name: "dosa batter", amount: "200", unit: "ml", category: "grain", swaps: ["quinoa dosa batter"] },
              { name: "potato masala", amount: "200", unit: "g", category: "vegetable" },
              { name: "sambar", amount: "200", unit: "ml", category: "soup" },
              { name: "coconut chutney", amount: "50", unit: "g", category: "condiment" },
              { name: "ghee", amount: "1", unit: "tbsp", category: "fat", swaps: ["oil"] }
            ],
            nutrition: {
              calories: 450,
              protein: 12,
              carbs: 85,
              fat: 8,
              vitamins: ["B12", "C", "D"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "30 minutes",
            season: ["all"],
            mealType: ["breakfast", "lunch"]
          },
          {
            name: "Aloo Paratha",
            description: "Whole wheat flatbread stuffed with spiced potatoes",
            cuisine: "Indian",
            ingredients: [
              { name: "whole wheat flour", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
              { name: "potatoes", amount: "300", unit: "g", category: "vegetable" },
              { name: "spices", amount: "2", unit: "tbsp", category: "spice" },
              { name: "yogurt", amount: "100", unit: "g", category: "dairy", swaps: ["plant-based yogurt"] },
              { name: "butter", amount: "30", unit: "g", category: "fat", swaps: ["oil"] }
            ],
            nutrition: {
              calories: 380,
              protein: 10,
              carbs: 65,
              fat: 12,
              vitamins: ["B1", "C"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "45 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ],
        winter: [
          {
            name: "Upma",
            description: "Savory semolina porridge with vegetables",
            cuisine: "Indian",
            ingredients: [
              { name: "semolina", amount: "1", unit: "cup", category: "grain", swaps: ["quinoa"] },
              { name: "mixed vegetables", amount: "1", unit: "cup", category: "vegetable" },
              { name: "mustard seeds", amount: "1", unit: "tsp", category: "spice" },
              { name: "curry leaves", amount: "10", unit: "pieces", category: "herb" },
              { name: "ghee", amount: "2", unit: "tbsp", category: "fat", swaps: ["coconut oil"] }
            ],
            nutrition: {
              calories: 320,
              protein: 10,
              carbs: 52,
              fat: 12,
              vitamins: ["B1", "B12"],
              minerals: ["Iron"]
            },
            timeToMake: "25 minutes",
            season: ["winter"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Mango Curry with Coconut Rice",
            description: "Sweet and spicy mango curry with aromatic coconut rice",
            cuisine: "Indian",
            ingredients: [
              { name: "ripe mangoes", amount: "2", unit: "large", category: "fruit" },
              { name: "coconut milk", amount: "400", unit: "ml", category: "dairy" },
              { name: "basmati rice", amount: "1", unit: "cup", category: "grain" },
              { name: "mustard seeds", amount: "1", unit: "tsp", category: "spice" },
              { name: "curry leaves", amount: "10", unit: "pieces", category: "herb" }
            ],
            nutrition: {
              calories: 480,
              protein: 8,
              carbs: 82,
              fat: 16,
              vitamins: ["A", "C"],
              minerals: ["Potassium", "Manganese"]
            },
            timeToMake: "35 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Lemon Rice",
            description: "Tangy rice with peanuts and turmeric",
            cuisine: "Indian",
            ingredients: [
              { name: "basmati rice", amount: "2", unit: "cups", category: "grain" },
              { name: "lemon juice", amount: "4", unit: "tbsp", category: "acid" },
              { name: "peanuts", amount: "1/2", unit: "cup", category: "nuts" },
              { name: "turmeric", amount: "1", unit: "tsp", category: "spice" },
              { name: "curry leaves", amount: "15", unit: "pieces", category: "herb" }
            ],
            nutrition: {
              calories: 350,
              protein: 9,
              carbs: 65,
              fat: 8,
              vitamins: ["B1", "B6"],
              minerals: ["Iron", "Magnesium"]
            },
            timeToMake: "25 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ],
        winter: [
          {
            name: "Dal Makhani",
            description: "Creamy black lentils simmered overnight",
            cuisine: "Indian",
            ingredients: [
              { name: "black lentils", amount: "2", unit: "cups", category: "protein" },
              { name: "cream", amount: "200", unit: "ml", category: "dairy", swaps: ["coconut cream"] },
              { name: "butter", amount: "100", unit: "g", category: "fat", swaps: ["plant butter"] },
              { name: "tomato puree", amount: "2", unit: "cups", category: "vegetable" },
              { name: "spice blend", amount: "3", unit: "tbsp", category: "spice" }
            ],
            nutrition: {
              calories: 420,
              protein: 18,
              carbs: 45,
              fat: 22,
              vitamins: ["A", "K"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "8 hours",
            season: ["winter"],
            mealType: ["lunch", "dinner"]
          }
        ]
      },
      dinner: {
        winter: [
          {
            name: "Butter Chicken",
            description: "Tender chicken in rich tomato-cream sauce",
            cuisine: "Indian",
            ingredients: [
              { name: "chicken", amount: "500", unit: "g", category: "protein", swaps: ["cauliflower", "seitan"] },
              { name: "tomato sauce", amount: "400", unit: "ml", category: "sauce" },
              { name: "cream", amount: "200", unit: "ml", category: "dairy", swaps: ["coconut cream"] },
              { name: "butter", amount: "100", unit: "g", category: "fat", swaps: ["coconut oil"] },
              { name: "spice blend", amount: "3", unit: "tbsp", category: "spice" }
            ],
            nutrition: {
              calories: 650,
              protein: 35,
              carbs: 28,
              fat: 42,
              vitamins: ["A", "D", "B12"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "45 minutes",
            season: ["winter"],
            mealType: ["dinner"]
          },
          {
            name: "Palak Paneer",
            description: "Cottage cheese in creamy spinach gravy",
            cuisine: "Indian",
            ingredients: [
              { name: "spinach", amount: "500", unit: "g", category: "vegetable" },
              { name: "paneer", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "cream", amount: "100", unit: "ml", category: "dairy", swaps: ["cashew cream"] },
              { name: "spices", amount: "2", unit: "tbsp", category: "spice" },
              { name: "ginger", amount: "2", unit: "tbsp", category: "spice" }
            ],
            nutrition: {
              calories: 380,
              protein: 22,
              carbs: 18,
              fat: 26,
              vitamins: ["A", "K", "C"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "40 minutes",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Tandoori Fish Tikka",
            description: "Marinated and grilled fish with mint chutney",
            cuisine: "Indian",
            ingredients: [
              { name: "fish fillets", amount: "400", unit: "g", category: "protein", swaps: ["tofu", "seitan"] },
              { name: "yogurt", amount: "200", unit: "g", category: "dairy", swaps: ["coconut yogurt"] },
              { name: "spice blend", amount: "3", unit: "tbsp", category: "spice" },
              { name: "mint chutney", amount: "100", unit: "g", category: "sauce" },
              { name: "lemon", amount: "2", unit: "whole", category: "fruit" }
            ],
            nutrition: {
              calories: 380,
              protein: 45,
              carbs: 12,
              fat: 18,
              vitamins: ["D", "B12", "E"],
              minerals: ["Selenium", "Iodine"]
            },
            timeToMake: "35 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.4,
      Earth: 0.3,
      Air: 0.2,
      Water: 0.1
    }
  },
  mexican: {
    name: "Mexican",
    description: "Mexican cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Huevos Rancheros",
            description: "Fried eggs on tortillas with spicy tomato sauce and black beans",
            cuisine: "Mexican",
            ingredients: [
              { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu scramble"] },
              { name: "corn tortillas", amount: "2", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
              { name: "ranchero sauce", amount: "200", unit: "ml", category: "sauce" },
              { name: "black beans", amount: "1", unit: "cup", category: "protein" },
              { name: "avocado", amount: "1/2", unit: "whole", category: "fruit" }
            ],
            nutrition: {
              calories: 520,
              protein: 24,
              carbs: 48,
              fat: 28,
              vitamins: ["A", "C", "D"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "20 minutes",
            season: ["all"],
            mealType: ["breakfast", "brunch"]
          },
          {
            name: "Chilaquiles Verdes",
            description: "Tortilla chips in green salsa with eggs and cream",
            cuisine: "Mexican",
            ingredients: [
              { name: "corn tortillas", amount: "6", unit: "pieces", category: "grain", swaps: ["gluten-free tortillas"] },
              { name: "salsa verde", amount: "2", unit: "cups", category: "sauce" },
              { name: "eggs", amount: "2", unit: "large", category: "protein", swaps: ["tofu"] },
              { name: "Mexican crema", amount: "1/4", unit: "cup", category: "dairy", swaps: ["cashew cream"] },
              { name: "queso fresco", amount: "1/2", unit: "cup", category: "dairy", swaps: ["vegan cheese"] }
            ],
            nutrition: {
              calories: 480,
              protein: 22,
              carbs: 52,
              fat: 24,
              vitamins: ["A", "C", "K"],
              minerals: ["Calcium", "Iron"]
            },
            timeToMake: "25 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        summer: [
          {
            name: "Fish Tacos",
            description: "Grilled fish tacos with cabbage slaw and lime crema",
            cuisine: "Mexican",
            ingredients: [
              { name: "white fish", amount: "400", unit: "g", category: "protein", swaps: ["tempeh", "jackfruit"] },
              { name: "corn tortillas", amount: "8", unit: "pieces", category: "grain" },
              { name: "cabbage slaw", amount: "2", unit: "cups", category: "vegetable" },
              { name: "lime crema", amount: "1/2", unit: "cup", category: "sauce", swaps: ["cashew cream"] },
              { name: "avocado", amount: "1", unit: "whole", category: "fruit" }
            ],
            nutrition: {
              calories: 450,
              protein: 28,
              carbs: 42,
              fat: 22,
              vitamins: ["B12", "D", "C"],
              minerals: ["Omega-3", "Iron"]
            },
            timeToMake: "25 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Tostadas de Ceviche",
            description: "Seafood ceviche on crispy tostadas",
            cuisine: "Mexican",
            ingredients: [
              { name: "white fish", amount: "300", unit: "g", category: "protein", swaps: ["hearts of palm", "mushrooms"] },
              { name: "lime juice", amount: "1/2", unit: "cup", category: "acid" },
              { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
              { name: "tostadas", amount: "6", unit: "pieces", category: "grain" },
              { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" }
            ],
            nutrition: {
              calories: 320,
              protein: 24,
              carbs: 38,
              fat: 12,
              vitamins: ["C", "B12", "E"],
              minerals: ["Iron", "Selenium"]
            },
            timeToMake: "30 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ],
        winter: [
          {
            name: "Sopa de Tortilla",
            description: "Traditional tortilla soup with chicken and avocado",
            cuisine: "Mexican",
            ingredients: [
              { name: "chicken breast", amount: "200", unit: "g", category: "protein", swaps: ["jackfruit"] },
              { name: "tortilla strips", amount: "2", unit: "cups", category: "grain" },
              { name: "tomatoes", amount: "4", unit: "medium", category: "vegetable" },
              { name: "chipotle peppers", amount: "2", unit: "pieces", category: "spice" },
              { name: "avocado", amount: "1", unit: "whole", category: "fruit" }
            ],
            nutrition: {
              calories: 380,
              protein: 26,
              carbs: 42,
              fat: 18,
              vitamins: ["A", "C", "K"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "35 minutes",
            season: ["winter"],
            mealType: ["lunch"]
          }
        ]
      },
      dinner: {
        winter: [
          {
            name: "Pozole Rojo",
            description: "Hearty hominy soup with pork and red chilies",
            cuisine: "Mexican",
            ingredients: [
              { name: "pork shoulder", amount: "500", unit: "g", category: "protein", swaps: ["jackfruit", "mushrooms"] },
              { name: "hominy", amount: "400", unit: "g", category: "grain" },
              { name: "guajillo chilies", amount: "4", unit: "whole", category: "spice" },
              { name: "oregano", amount: "2", unit: "tbsp", category: "herb" },
              { name: "garnishes", amount: "1", unit: "set", category: "vegetable" }
            ],
            nutrition: {
              calories: 580,
              protein: 42,
              carbs: 48,
              fat: 28,
              vitamins: ["A", "C", "B6"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "3 hours",
            season: ["winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Pescado a la Veracruzana",
            description: "Fish in Veracruz style sauce with olives and capers",
            cuisine: "Mexican",
            ingredients: [
              { name: "white fish fillets", amount: "600", unit: "g", category: "protein", swaps: ["cauliflower steaks"] },
              { name: "tomatoes", amount: "4", unit: "large", category: "vegetable" },
              { name: "olives", amount: "1/2", unit: "cup", category: "vegetable" },
              { name: "capers", amount: "2", unit: "tbsp", category: "condiment" },
              { name: "rice", amount: "2", unit: "cups", category: "grain" }
            ],
            nutrition: {
              calories: 420,
              protein: 38,
              carbs: 45,
              fat: 16,
              vitamins: ["D", "B12", "C"],
              minerals: ["Iron", "Potassium"]
            },
            timeToMake: "45 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          },
          {
            name: "Chiles en Nogada",
            description: "Stuffed poblano peppers with walnut sauce",
            cuisine: "Mexican",
            ingredients: [
              { name: "poblano peppers", amount: "4", unit: "large", category: "vegetable" },
              { name: "ground pork", amount: "400", unit: "g", category: "protein", swaps: ["plant-based ground"] },
              { name: "fruit mixture", amount: "200", unit: "g", category: "fruit" },
              { name: "walnut sauce", amount: "200", unit: "ml", category: "sauce" },
              { name: "pomegranate seeds", amount: "100", unit: "g", category: "fruit" }
            ],
            nutrition: {
              calories: 520,
              protein: 32,
              carbs: 38,
              fat: 30,
              vitamins: ["A", "C", "E"],
              minerals: ["Iron", "Magnesium"]
            },
            timeToMake: "1 hour",
            season: ["summer", "fall"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  vietnamese: {
    name: "Vietnamese",
    description: "Vietnamese cuisine",
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
              { name: "chicken broth", amount: "1", unit: "L", category: "broth", swaps: ["vegetable broth"] }
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
              { name: "cilantro", amount: "10", unit: "g", category: "herb" }
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
        ]
      },
      lunch: {
        summer: [
          {
            name: "Banh Mi Chay",
            description: "Vegetarian Vietnamese sandwich with lemongrass tofu",
            cuisine: "Vietnamese",
            ingredients: [
              { name: "baguette", amount: "1", unit: "piece", category: "grain", swaps: ["gluten-free baguette"] },
              { name: "lemongrass tofu", amount: "150", unit: "g", category: "protein" },
              { name: "pickled vegetables", amount: "100", unit: "g", category: "vegetable" },
              { name: "cilantro", amount: "1/4", unit: "cup", category: "herb" },
              { name: "chili sauce", amount: "2", unit: "tbsp", category: "sauce" }
            ],
            nutrition: {
              calories: 380,
              protein: 16,
              carbs: 58,
              fat: 12,
              vitamins: ["C", "A", "K"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "20 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          },
          {
            name: "Bun Bo Xao",
            description: "Rice noodle salad with stir-fried beef and herbs",
            cuisine: "Vietnamese",
            ingredients: [
              { name: "rice noodles", amount: "200", unit: "g", category: "grain" },
              { name: "beef", amount: "150", unit: "g", category: "protein", swaps: ["seitan", "tempeh"] },
              { name: "fresh herbs", amount: "1", unit: "cup", category: "herb" },
              { name: "nuoc cham", amount: "60", unit: "ml", category: "sauce", swaps: ["vegetarian fish sauce"] },
              { name: "peanuts", amount: "30", unit: "g", category: "nuts" }
            ],
            nutrition: {
              calories: 520,
              protein: 28,
              carbs: 62,
              fat: 18,
              vitamins: ["B12", "C", "K"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "25 minutes",
            season: ["summer"],
            mealType: ["lunch"]
          }
        ],
        winter: [
          {
            name: "Canh Chua",
            description: "Sour soup with fish and tamarind",
            cuisine: "Vietnamese",
            ingredients: [
              { name: "fish", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "tamarind", amount: "30", unit: "g", category: "souring agent" },
              { name: "pineapple", amount: "100", unit: "g", category: "fruit" },
              { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
              { name: "rice", amount: "200", unit: "g", category: "grain" }
            ],
            nutrition: {
              calories: 400,
              protein: 24,
              carbs: 58,
              fat: 10,
              vitamins: ["C", "A", "B12"],
              minerals: ["Iron", "Calcium"]
            },
            timeToMake: "35 minutes",
            season: ["winter"],
            mealType: ["lunch", "dinner"]
          }
        ]
      },
      dinner: {
        fall: [
          {
            name: "Ca Kho To",
            description: "Caramelized fish in clay pot",
            cuisine: "Vietnamese",
            ingredients: [
              { name: "catfish", amount: "500", unit: "g", category: "protein", swaps: ["firm tofu"] },
              { name: "coconut water", amount: "200", unit: "ml", category: "liquid" },
              { name: "fish sauce", amount: "3", unit: "tbsp", category: "sauce", swaps: ["soy sauce"] },
              { name: "caramel sauce", amount: "2", unit: "tbsp", category: "sauce" },
              { name: "ginger", amount: "30", unit: "g", category: "spice" }
            ],
            nutrition: {
              calories: 420,
              protein: 48,
              carbs: 12,
              fat: 22,
              vitamins: ["D", "B12", "A"],
              minerals: ["Selenium", "Iron"]
            },
            timeToMake: "45 minutes",
            season: ["fall", "winter"],
            mealType: ["dinner"]
          }
        ],
        summer: [
          {
            name: "Bun Cha",
            description: "Grilled pork meatballs with rice noodles and herbs",
            cuisine: "Vietnamese",
            ingredients: [
              { name: "pork", amount: "400", unit: "g", category: "protein", swaps: ["mushrooms", "tempeh"] },
              { name: "rice noodles", amount: "300", unit: "g", category: "grain" },
              { name: "fresh herbs", amount: "200", unit: "g", category: "herb" },
              { name: "dipping sauce", amount: "200", unit: "ml", category: "sauce" },
              { name: "lettuce", amount: "200", unit: "g", category: "vegetable" }
            ],
            nutrition: {
              calories: 580,
              protein: 32,
              carbs: 65,
              fat: 28,
              vitamins: ["B6", "C", "K"],
              minerals: ["Iron", "Zinc"]
            },
            timeToMake: "40 minutes",
            season: ["summer"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  },
  [CuisineType.ITALIAN]: {
    herbs: {
      primary: ['basil', 'sage', 'rosemary'],
      common_combinations: {
        'tomato_sauce': ['basil', 'oregano'],
        'roasted_meat': ['rosemary', 'sage']
      }
    },
    // ... other cuisine properties
  },
  [CuisineType.THAI]: {
    herbs: {
      primary: ['thai_basil', 'cilantro', 'mint'],
      common_combinations: {
        'curry_paste': ['cilantro_root', 'thai_basil'],
        'soups': ['cilantro', 'thai_basil']
      }
    }
    // ... other cuisine properties
  },
  mediterranean: {
    name: "Mediterranean",
    description: "Mediterranean cuisine",
    dishes: {
      breakfast: {
        all: [
          {
            name: "Mediterranean Breakfast",
            description: "Traditional Mediterranean breakfast with olives, yogurt, and fresh fruit",
            cuisine: "Mediterranean",
            ingredients: [
              { name: "olives", amount: "100", unit: "g", category: "condiment" },
              { name: "yogurt", amount: "100", unit: "g", category: "dairy" },
              { name: "fresh fruit", amount: "100", unit: "g", category: "fruit" }
            ],
            nutrition: {
              calories: 200,
              protein: 10,
              carbs: 30,
              fat: 10,
              vitamins: ["A", "C", "K"],
              minerals: ["Potassium", "Magnesium"]
            },
            timeToMake: "10 minutes",
            season: ["all"],
            mealType: ["breakfast"]
          }
        ]
      },
      lunch: {
        all: [
          {
            name: "Mediterranean Salad",
            description: "Fresh salad with tomatoes, cucumber, and olive oil",
            cuisine: "Mediterranean",
            ingredients: [
              { name: "tomatoes", amount: "100", unit: "g", category: "vegetable" },
              { name: "cucumber", amount: "100", unit: "g", category: "vegetable" },
              { name: "olive oil", amount: "30", unit: "ml", category: "oil" }
            ],
            nutrition: {
              calories: 100,
              protein: 2,
              carbs: 10,
              fat: 7,
              vitamins: ["A", "C", "K"],
              minerals: ["Potassium", "Magnesium"]
            },
            timeToMake: "5 minutes",
            season: ["all"],
            mealType: ["lunch"]
          }
        ]
      },
      dinner: {
        all: [
          {
            name: "Mediterranean Chicken",
            description: "Grilled chicken with lemon and herbs",
            cuisine: "Mediterranean",
            ingredients: [
              { name: "chicken", amount: "400", unit: "g", category: "protein" },
              { name: "lemon", amount: "1", unit: "whole", category: "fruit" },
              { name: "herbs", amount: "1", unit: "tbsp", category: "herb" }
            ],
            nutrition: {
              calories: 300,
              protein: 20,
              carbs: 10,
              fat: 15,
              vitamins: ["A", "C", "K"],
              minerals: ["Potassium", "Magnesium"]
            },
            timeToMake: "30 minutes",
            season: ["all"],
            mealType: ["dinner"]
          }
        ]
      }
    },
    elementalBalance: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    }
  }
  // ... other cuisines
};

export type Cuisine = {
  name: string;
  description: string;
  dishes: {
    [mealType]: {
      [season]: Dish[];
    };
  };
  elementalBalance: ElementalProperties;
};

export type Dish = {
  name: string;
  description: string;
  cuisine: string;
  ingredients: Ingredient[];
  nutrition: NutritionalInfo;
  timeToMake: string;
  season: string[];
  mealType: string[];
};
  
export type Ingredient = {
  name: string;
  amount: string;
  unit: string;
  category: string;
  swaps?: string[];
};
  
export type NutritionalInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  vitamins?: string[];
  minerals?: string[];
};
  