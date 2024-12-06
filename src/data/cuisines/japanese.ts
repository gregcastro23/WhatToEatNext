// src/data/cuisines/japanese.ts
import type { Cuisine } from '@/types/recipe';

export const japanese: Cuisine = {
  name: 'Japanese',
  description: 'Traditional Japanese cuisine emphasizing seasonal ingredients, harmony of flavors, and meticulous preparation techniques',
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
          mealType: ["breakfast"],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        },
        {
          name: "Tamagoyaki",
          description: "Sweet-savory rolled Japanese omelette",
          cuisine: "Japanese",
          ingredients: [
            { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["JUST Egg"] },
            { name: "dashi", amount: "2", unit: "tbsp", category: "broth", swaps: ["vegetable stock"] },
            { name: "mirin", amount: "1", unit: "tbsp", category: "seasoning" },
            { name: "soy sauce", amount: "1", unit: "tsp", category: "seasoning" },
            { name: "sugar", amount: "1", unit: "tsp", category: "seasoning" }
          ],
          nutrition: {
            calories: 280,
            protein: 20,
            carbs: 8,
            fat: 18,
            vitamins: ["B12", "D", "A"],
            minerals: ["Iron", "Selenium"]
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.4,
            Air: 0.3,
            Earth: 0.2,
            Water: 0.1
          }
        },
        {
          name: "Natto Gohan",
          description: "Fermented soybeans over rice with condiments",
          cuisine: "Japanese",
          ingredients: [
            { name: "steamed rice", amount: "200", unit: "g", category: "grain" },
            { name: "natto", amount: "50", unit: "g", category: "protein" },
            { name: "raw egg", amount: "1", unit: "large", category: "protein", swaps: ["soft tofu"] },
            { name: "green onion", amount: "1", unit: "stalk", category: "vegetable" },
            { name: "soy sauce", amount: "1", unit: "tsp", category: "seasoning" },
            { name: "karashi mustard", amount: "1/4", unit: "tsp", category: "condiment" }
          ],
          nutrition: {
            calories: 400,
            protein: 20,
            carbs: 65,
            fat: 8,
            vitamins: ["K2", "B12", "D"],
            minerals: ["Iron", "Calcium"]
          },
          timeToMake: "10 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Onigiri Selection",
          description: "Rice balls with various fillings",
          cuisine: "Japanese",
          ingredients: [
            { name: "sushi rice", amount: "300", unit: "g", category: "grain" },
            { name: "umeboshi", amount: "2", unit: "pieces", category: "pickle" },
            { name: "grilled salmon", amount: "100", unit: "g", category: "protein", swaps: ["tempeh"] },
            { name: "tuna mayo", amount: "100", unit: "g", category: "protein", swaps: ["mashed chickpea"] },
            { name: "nori", amount: "2", unit: "sheets", category: "seaweed" }
          ],
          nutrition: {
            calories: 450,
            protein: 18,
            carbs: 75,
            fat: 10,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Iodine"]
          },
          timeToMake: "30 minutes",
          season: ["all"],
          mealType: ["lunch"],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.2,
            Fire: 0.2,
            Air: 0.1
          }
        }
      ],
      summer: [
        {
          name: "Hiyashi Chuka",
          description: "Cold ramen noodles with colorful toppings",
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
          mealType: ["lunch"],
          elementalProperties: {
            Water: 0.3,
            Air: 0.3,
            Earth: 0.2,
            Fire: 0.2
          }
        },
        {
          name: "Soba Salad",
          description: "Chilled buckwheat noodles with seasonal vegetables",
          cuisine: "Japanese",
          ingredients: [
            { name: "soba noodles", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free soba"] },
            { name: "mixed vegetables", amount: "200", unit: "g", category: "vegetable" },
            { name: "sesame dressing", amount: "60", unit: "ml", category: "sauce" },
            { name: "nori strips", amount: "2", unit: "sheets", category: "seaweed" },
            { name: "toasted sesame seeds", amount: "1", unit: "tbsp", category: "garnish" }
          ],
          nutrition: {
            calories: 380,
            protein: 16,
            carbs: 70,
            fat: 8,
            vitamins: ["B1", "B2", "E"],
            minerals: ["Manganese", "Iron"]
          },
          timeToMake: "20 minutes",
          season: ["summer"],
          mealType: ["lunch"],
          elementalProperties: {
            Air: 0.4,
            Water: 0.3,
            Earth: 0.2,
            Fire: 0.1
          }
        }
      ],
      winter: [
        {
          name: "Curry Rice",
          description: "Japanese-style curry with vegetables and rice",
          cuisine: "Japanese",
          ingredients: [
            { name: "rice", amount: "200", unit: "g", category: "grain" },
            { name: "curry roux", amount: "100", unit: "g", category: "sauce" },
            { name: "potato", amount: "200", unit: "g", category: "vegetable" },
            { name: "carrot", amount: "100", unit: "g", category: "vegetable" },
            { name: "onion", amount: "150", unit: "g", category: "vegetable" },
            { name: "beef", amount: "150", unit: "g", category: "protein", swaps: ["seitan", "mushrooms"] }
          ],
          nutrition: {
            calories: 650,
            protein: 25,
            carbs: 95,
            fat: 22,
            vitamins: ["A", "B6", "C"],
            minerals: ["Iron", "Potassium"]
          },
          timeToMake: "45 minutes",
          season: ["winter"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Water: 0.2,
            Air: 0.1
          }
        }
      ]
    },
    dinner: {
      all: [
        {
          name: "Sushi Selection",
          description: "Assorted nigiri and maki sushi",
          cuisine: "Japanese",
          ingredients: [
            { name: "sushi rice", amount: "300", unit: "g", category: "grain" },
            { name: "assorted fish", amount: "200", unit: "g", category: "protein", swaps: ["marinated vegetables"] },
            { name: "nori", amount: "4", unit: "sheets", category: "seaweed" },
            { name: "wasabi", amount: "15", unit: "g", category: "condiment" },
            { name: "pickled ginger", amount: "30", unit: "g", category: "pickle" }
          ],
          nutrition: {
            calories: 550,
            protein: 30,
            carbs: 80,
            fat: 12,
            vitamins: ["D", "B12", "A"],
            minerals: ["Omega-3", "Iodine"]
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["dinner"],
          elementalProperties: {
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
          }
        }
      ],
      winter: [
        {
          name: "Sukiyaki",
          description: "Hot pot with thinly sliced beef and vegetables",
          cuisine: "Japanese",
          ingredients: [
            { name: "thinly sliced beef", amount: "400", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
            { name: "napa cabbage", amount: "300", unit: "g", category: "vegetable" },
            { name: "shirataki noodles", amount: "200", unit: "g", category: "noodles" },
            { name: "tofu", amount: "200", unit: "g", category: "protein" },
            { name: "raw eggs", amount: "4", unit: "large", category: "protein", swaps: ["soft tofu"] }
          ],
          nutrition: {
            calories: 580,
            protein: 45,
            carbs: 25,
            fat: 35,
            vitamins: ["B12", "D", "K"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "40 minutes",
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.4,
            Water: 0.3,
            Earth: 0.2,
            Air: 0.1
          }
        },
        {
          name: "Ramen",
          description: "Rich miso ramen with chashu pork and vegetables",
          cuisine: "Japanese",
          ingredients: [
            { name: "ramen noodles", amount: "200", unit: "g", category: "grain", swaps: ["rice noodles"] },
            { name: "chashu pork", amount: "100", unit: "g", category: "protein", swaps: ["marinated mushrooms"] },
            { name: "miso broth", amount: "500", unit: "ml", category: "soup" },
            { name: "corn", amount: "50", unit: "g", category: "vegetable" },
            { name: "bamboo shoots", amount: "30", unit: "g", category: "vegetable" },
            { name: "soft-boiled egg", amount: "1", unit: "large", category: "protein", swaps: ["tofu"] }
          ],
          nutrition: {
            calories: 650,
            protein: 35,
            carbs: 85,
            fat: 22,
            vitamins: ["B12", "A", "K"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "30 minutes",
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Water: 0.4,
            Fire: 0.3,
            Earth: 0.2,
            Air: 0.1
          }
        }
      ],
      summer: [
        {
          name: "Yakitori Assortment",
          description: "Grilled chicken skewers with various seasonings",
          cuisine: "Japanese",
          ingredients: [
            { name: "chicken thigh", amount: "300", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
            { name: "green onion", amount: "4", unit: "stalks", category: "vegetable" },
            { name: "tare sauce", amount: "100", unit: "ml", category: "sauce" },
            { name: "shichimi togarashi", amount: "1", unit: "tbsp", category: "seasoning" }
          ],
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 15,
            fat: 28,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          timeToMake: "25 minutes",
          season: ["summer"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.5,
            Air: 0.2,
            Earth: 0.2,
            Water: 0.1
          }
        }
      ]
    }
  },
  elementalBalance: {
    Water: 0.3,
    Earth: 0.3,
    Fire: 0.2,
    Air: 0.2
  }
};