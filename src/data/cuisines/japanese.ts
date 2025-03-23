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
          cookingMethods: ["grilling", "steaming", "simmering"],
          tools: [
            "rice cooker",
            "fish grill",
            "small pots",
            "miso strainer",
            "chopsticks"
          ],
          preparationSteps: [
            "Cook rice",
            "Grill fish until crispy",
            "Prepare miso soup",
            "Steam vegetables",
            "Arrange components",
            "Serve with pickles"
          ],
          ingredients: [
            { name: "steamed rice", amount: "150", unit: "g", category: "grain", swaps: ["quinoa"] },
            { name: "grilled mackerel", amount: "100", unit: "g", category: "protein", swaps: ["tofu", "tempeh"] },
            { name: "miso paste", amount: "1", unit: "tbsp", category: "seasoning" },
            { name: "nori", amount: "1", unit: "sheet", category: "seaweed" },
            { name: "pickled vegetables", amount: "30", unit: "g", category: "vegetable" },
            { name: "raw egg", amount: "1", unit: "large", category: "protein", swaps: ["soft tofu"] }
          ],
          substitutions: {
            "mackerel": ["salmon", "tofu", "tempeh"],
            "raw egg": ["soft tofu", "scrambled egg"],
            "white rice": ["brown rice", "quinoa"]
          },
          servingSize: 1,
          allergens: ["fish", "egg", "soy"],
          prepTime: "10 minutes",
          cookTime: "15 minutes",
          culturalNotes: "The traditional Japanese breakfast emphasizes balance and variety, with each component serving a specific nutritional and cultural purpose",
          pairingSuggestions: ["green tea", "miso soup", "umeboshi"],
          dietaryInfo: ["pescatarian"],
          spiceLevel: "mild",
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
          cookingMethods: ["rolling", "pan-frying"],
          tools: [
            "rectangular tamagoyaki pan",
            "chopsticks",
            "bamboo mat",
            "mixing bowl",
            "whisk"
          ],
          preparationSteps: [
            "Beat eggs with seasonings",
            "Heat pan and oil lightly",
            "Pour thin layer of egg",
            "Roll partially cooked egg",
            "Add more egg mixture",
            "Continue rolling until complete",
            "Shape with bamboo mat"
          ],
          ingredients: [
            { name: "eggs", amount: "4", unit: "large", category: "protein", swaps: ["JUST Egg"] },
            { name: "dashi", amount: "2", unit: "tbsp", category: "broth", swaps: ["vegetable stock"] },
            { name: "mirin", amount: "1", unit: "tbsp", category: "seasoning" },
            { name: "soy sauce", amount: "1", unit: "tsp", category: "seasoning" },
            { name: "sugar", amount: "1", unit: "tsp", category: "seasoning" }
          ],
          substitutions: {
            "eggs": ["JUST Egg", "chickpea flour mixture"],
            "dashi": ["vegetable stock", "mushroom stock"],
            "mirin": ["rice vinegar + sugar"]
          },
          servingSize: 2,
          allergens: ["egg", "soy"],
          prepTime: "5 minutes",
          cookTime: "10 minutes",
          culturalNotes: "A staple in bento boxes and breakfast. The technique of rolling the omelette requires practice and is considered a test of a chef's skill",
          pairingSuggestions: ["steamed rice", "miso soup", "pickled vegetables"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
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
          mealType: ["breakfast", "bento"],
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
          cookingMethods: ["mixing", "steaming"],
          tools: [
            "rice cooker",
            "small bowls",
            "chopsticks",
            "rice paddle"
          ],
          preparationSteps: [
            "Cook rice",
            "Stir natto until sticky",
            "Add seasonings to natto",
            "Serve over hot rice",
            "Top with egg and garnishes",
            "Mix well before eating"
          ],
          ingredients: [
            { name: "steamed rice", amount: "200", unit: "g", category: "grain" },
            { name: "natto", amount: "50", unit: "g", category: "protein" },
            { name: "raw egg", amount: "1", unit: "large", category: "protein", swaps: ["soft tofu"] },
            { name: "green onion", amount: "1", unit: "stalk", category: "vegetable" },
            { name: "soy sauce", amount: "1", unit: "tsp", category: "seasoning" },
            { name: "karashi mustard", amount: "1/4", unit: "tsp", category: "condiment" }
          ],
          substitutions: {
            "raw egg": ["soft tofu", "avocado"],
            "karashi mustard": ["regular mustard", "wasabi"],
            "white rice": ["brown rice", "quinoa"]
          },
          servingSize: 1,
          allergens: ["soy", "egg"],
          prepTime: "5 minutes",
          cookTime: "15 minutes",
          culturalNotes: "A nutritious breakfast dish particularly popular in Eastern Japan. The sticky texture and strong flavor make it an acquired taste for many",
          pairingSuggestions: ["miso soup", "pickled vegetables", "green tea"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "mild",
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
          cookingMethods: ["shaping", "wrapping", "steaming"],
          tools: [
            "rice cooker",
            "onigiri mold (optional)",
            "bowl of water",
            "plastic wrap",
            "cutting board"
          ],
          preparationSteps: [
            "Cook sushi rice",
            "Wet hands with water",
            "Place rice in palm",
            "Create indent for filling",
            "Add chosen filling",
            "Shape into triangle",
            "Wrap with nori"
          ],
          ingredients: [
            { name: "sushi rice", amount: "300", unit: "g", category: "grain" },
            { name: "umeboshi", amount: "2", unit: "pieces", category: "pickle" },
            { name: "grilled salmon", amount: "100", unit: "g", category: "protein", swaps: ["tempeh"] },
            { name: "tuna mayo", amount: "100", unit: "g", category: "protein", swaps: ["mashed chickpea"] },
            { name: "nori", amount: "2", unit: "sheets", category: "seaweed" }
          ],
          substitutions: {
            "grilled salmon": ["tempeh", "tofu", "mushrooms"],
            "tuna mayo": ["mashed chickpea", "tofu salad"],
            "white rice": ["brown rice", "quinoa"]
          },
          servingSize: 4,
          allergens: ["fish", "soy"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          culturalNotes: "A portable food dating back to samurai times. Each region has its preferred fillings and shapes",
          pairingSuggestions: ["green tea", "miso soup", "pickled vegetables"],
          dietaryInfo: ["pescatarian"],
          spiceLevel: "none",
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
          mealType: ["lunch", "snack"],
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
          cookingMethods: ["boiling", "chilling", "assembling"],
          tools: [
            "large pot",
            "colander",
            "mixing bowls",
            "sharp knife",
            "serving plates"
          ],
          preparationSteps: [
            "Cook and chill noodles",
            "Prepare toppings",
            "Make sesame sauce",
            "Arrange noodles",
            "Add toppings in sections",
            "Serve with sauce"
          ],
          ingredients: [
            { name: "ramen noodles", amount: "200", unit: "g", category: "grain", swaps: ["rice noodles"] },
            { name: "ham", amount: "50", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "cucumber", amount: "1", unit: "medium", category: "vegetable" },
            { name: "egg", amount: "1", unit: "large", category: "protein" },
            { name: "sesame sauce", amount: "60", unit: "ml", category: "sauce" }
          ],
          substitutions: {
            "ham": ["tofu", "tempeh", "seitan"],
            "egg": ["tofu", "vegan egg"],
            "ramen noodles": ["soba", "rice noodles"]
          },
          servingSize: 2,
          allergens: ["egg", "wheat", "soy", "sesame"],
          prepTime: "15 minutes",
          cookTime: "10 minutes",
          culturalNotes: "A refreshing summer dish that became popular in the post-war period. The colorful presentation is as important as the taste",
          pairingSuggestions: ["cold barley tea", "gyoza", "pickled ginger"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
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
          cookingMethods: ["boiling", "chilling", "tossing"],
          tools: [
            "large pot",
            "colander",
            "mixing bowls",
            "sharp knife",
            "tongs"
          ],
          preparationSteps: [
            "Cook soba noodles",
            "Rinse and chill noodles",
            "Prepare vegetables",
            "Make sesame dressing",
            "Toss ingredients",
            "Garnish and serve"
          ],
          ingredients: [
            { name: "soba noodles", amount: "200", unit: "g", category: "grain", swaps: ["gluten-free soba"] },
            { name: "mixed vegetables", amount: "200", unit: "g", category: "vegetable" },
            { name: "sesame dressing", amount: "60", unit: "ml", category: "sauce" },
            { name: "nori strips", amount: "2", unit: "sheets", category: "seaweed" },
            { name: "toasted sesame seeds", amount: "1", unit: "tbsp", category: "garnish" }
          ],
          substitutions: {
            "soba noodles": ["gluten-free soba", "rice noodles"],
            "sesame dressing": ["ponzu", "ginger dressing"],
            "nori": ["kale chips", "toasted sesame"]
          },
          servingSize: 2,
          allergens: ["wheat", "soy", "sesame"],
          prepTime: "10 minutes",
          cookTime: "10 minutes",
          culturalNotes: "A modern take on traditional soba, popular in summer. The nutty flavor of buckwheat pairs well with fresh vegetables",
          pairingSuggestions: ["cold tea", "edamame", "pickled vegetables"],
          dietaryInfo: ["vegetarian", "vegan"],
          spiceLevel: "none",
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
          mealType: ["lunch", "dinner"],
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
        },
        {
          name: "Oyakodon",
          description: "Chicken and egg rice bowl with onions in dashi sauce",
          cuisine: "Japanese",
          cookingMethods: ["simmering", "steaming", "donburi-style"],
          tools: [
            "donburi pan",
            "rice cooker",
            "cooking chopsticks",
            "sharp knife",
            "serving bowls"
          ],
          preparationSteps: [
            "Cook rice",
            "Slice chicken and onions",
            "Simmer in dashi mixture",
            "Add beaten eggs",
            "Cover and steam briefly",
            "Serve over hot rice"
          ],
          ingredients: [
            { name: "steamed rice", amount: "400", unit: "g", category: "grain" },
            { name: "chicken thigh", amount: "300", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "eggs", amount: "4", unit: "large", category: "protein" },
            { name: "onion", amount: "1", unit: "large", category: "vegetable" },
            { name: "dashi", amount: "200", unit: "ml", category: "broth" },
            { name: "mirin", amount: "2", unit: "tbsp", category: "seasoning" },
            { name: "soy sauce", amount: "2", unit: "tbsp", category: "seasoning" }
          ],
          substitutions: {
            "chicken": ["tofu", "mushrooms"],
            "dashi": ["vegetable stock", "mushroom stock"],
            "eggs": ["Just Egg", "soft tofu"]
          },
          servingSize: 2,
          allergens: ["egg", "soy"],
          prepTime: "15 minutes",
          cookTime: "20 minutes",
          culturalNotes: "Oyakodon means 'parent-and-child bowl', referring to the chicken and egg combination. A beloved comfort food in Japan",
          pairingSuggestions: ["miso soup", "pickled vegetables", "green tea"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "none",
          nutrition: {
            calories: 650,
            protein: 45,
            carbs: 70,
            fat: 22,
            vitamins: ["B12", "D", "A"],
            minerals: ["Iron", "Selenium"]
          },
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Okonomiyaki",
          description: "Savory cabbage pancake with various toppings",
          cuisine: "Japanese (Osaka-style)",
          cookingMethods: ["grilling", "pan-frying", "mixing"],
          tools: [
            "flat griddle",
            "spatulas",
            "mixing bowls",
            "grater",
            "brush for sauce"
          ],
          preparationSteps: [
            "Mix batter ingredients",
            "Fold in shredded cabbage",
            "Cook on hot griddle",
            "Flip when golden",
            "Add toppings",
            "Apply sauces and garnishes"
          ],
          ingredients: [
            { name: "cabbage", amount: "400", unit: "g", category: "vegetable" },
            { name: "okonomiyaki flour", amount: "150", unit: "g", category: "grain", swaps: ["all-purpose flour + dashi powder"] },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "pork belly", amount: "100", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "okonomiyaki sauce", amount: "4", unit: "tbsp", category: "sauce" },
            { name: "mayonnaise", amount: "2", unit: "tbsp", category: "sauce" },
            { name: "bonito flakes", amount: "10", unit: "g", category: "garnish", optional: true }
          ],
          substitutions: {
            "pork belly": ["mushrooms", "tofu", "shrimp"],
            "bonito flakes": ["nori strips", "sesame seeds"],
            "okonomiyaki flour": ["all-purpose flour + dashi powder"]
          },
          servingSize: 2,
          allergens: ["wheat", "egg", "fish", "soy"],
          prepTime: "20 minutes",
          cookTime: "15 minutes",
          culturalNotes: "A popular street food from Osaka. The name means 'grilled as you like it', reflecting its customizable nature",
          pairingSuggestions: ["beer", "sake", "green tea"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 550,
            protein: 25,
            carbs: 45,
            fat: 32,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Calcium"]
          },
          season: ["all"],
          mealType: ["lunch", "dinner", "street food"]
        },
        {
          name: "Tempura",
          description: "Light and crispy battered seafood and vegetables",
          cuisine: "Japanese",
          cookingMethods: ["deep-frying", "battering"],
          tools: [
            "deep pot",
            "cooking chopsticks",
            "wire skimmer",
            "thermometer",
            "paper towels",
            "strainer"
          ],
          preparationSteps: [
            "Prepare dipping sauce",
            "Make tempura batter",
            "Heat oil to 180°C",
            "Coat ingredients in batter",
            "Fry until golden",
            "Drain on paper towels"
          ],
          ingredients: [
            { name: "shrimp", amount: "8", unit: "pieces", category: "seafood", swaps: ["vegetables"] },
            { name: "assorted vegetables", amount: "400", unit: "g", category: "vegetable" },
            { name: "tempura flour", amount: "200", unit: "g", category: "grain", swaps: ["rice flour mix"] },
            { name: "ice water", amount: "200", unit: "ml", category: "liquid" },
            { name: "dashi", amount: "200", unit: "ml", category: "broth" },
            { name: "mirin", amount: "2", unit: "tbsp", category: "seasoning" }
          ],
          substitutions: {
            "shrimp": ["sweet potato", "mushrooms", "tofu"],
            "tempura flour": ["rice flour + cornstarch"],
            "dashi": ["vegetable stock"]
          },
          servingSize: 4,
          allergens: ["wheat", "shellfish"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          culturalNotes: "Originally introduced by Portuguese missionaries, tempura has become a refined Japanese art form emphasizing lightness and crispiness",
          pairingSuggestions: ["tentsuyu sauce", "green tea", "rice"],
          dietaryInfo: ["pescatarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 45,
            fat: 22,
            vitamins: ["A", "C", "D"],
            minerals: ["Iron", "Calcium"]
          },
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Udon Noodle Soup",
          description: "Thick wheat noodles in hot dashi broth",
          cuisine: "Japanese",
          cookingMethods: ["boiling", "simmering", "assembling"],
          tools: [
            "large pot",
            "strainer",
            "ladle",
            "cooking chopsticks",
            "serving bowls"
          ],
          preparationSteps: [
            "Prepare dashi broth",
            "Cook udon noodles",
            "Slice toppings",
            "Heat broth with seasonings",
            "Assemble in bowls",
            "Add garnishes"
          ],
          ingredients: [
            { name: "udon noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
            { name: "dashi stock", amount: "1", unit: "L", category: "broth" },
            { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
            { name: "kamaboko", amount: "100", unit: "g", category: "seafood", optional: true },
            { name: "tempura bits", amount: "30", unit: "g", category: "topping", optional: true },
            { name: "soy sauce", amount: "3", unit: "tbsp", category: "seasoning" }
          ],
          substitutions: {
            "udon": ["rice noodles", "soba"],
            "kamaboko": ["tofu", "mushrooms"],
            "dashi": ["vegetable stock", "mushroom stock"]
          },
          servingSize: 2,
          allergens: ["wheat", "soy"],
          prepTime: "10 minutes",
          cookTime: "20 minutes",
          culturalNotes: "A comforting noodle dish with regional variations across Japan. The chewy texture of udon is highly prized",
          pairingSuggestions: ["tempura", "onigiri", "green tea"],
          dietaryInfo: ["vegetarian possible"],
          spiceLevel: "none",
          nutrition: {
            calories: 380,
            protein: 14,
            carbs: 75,
            fat: 4,
            vitamins: ["B1", "B2"],
            minerals: ["Iron", "Manganese"]
          },
          season: ["winter", "all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Tonkatsu",
          description: "Breaded and deep-fried pork cutlet",
          cuisine: "Japanese",
          cookingMethods: ["breading", "deep-frying", "cutting"],
          tools: [
            "deep pot",
            "wire rack",
            "tongs",
            "thermometer",
            "sharp knife",
            "paper towels"
          ],
          preparationSteps: [
            "Tenderize pork cutlet",
            "Season with salt and pepper",
            "Coat with flour",
            "Dip in beaten egg",
            "Cover with panko",
            "Deep fry until golden",
            "Rest and slice"
          ],
          ingredients: [
            { name: "pork loin", amount: "400", unit: "g", category: "protein", swaps: ["chicken", "tofu"] },
            { name: "panko breadcrumbs", amount: "200", unit: "g", category: "coating" },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "flour", amount: "100", unit: "g", category: "grain" },
            { name: "tonkatsu sauce", amount: "60", unit: "ml", category: "sauce" },
            { name: "cabbage", amount: "200", unit: "g", category: "vegetable" }
          ],
          substitutions: {
            "pork": ["chicken breast", "firm tofu", "seitan"],
            "panko": ["gluten-free breadcrumbs"],
            "eggs": ["plant-based egg substitute"]
          },
          servingSize: 2,
          allergens: ["wheat", "egg"],
          prepTime: "15 minutes",
          cookTime: "20 minutes",
          culturalNotes: "A Western-inspired dish that became a Japanese favorite in the early 1900s. The specific cutting technique and shredded cabbage are essential elements",
          pairingSuggestions: ["steamed rice", "miso soup", "pickled vegetables"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "none",
          nutrition: {
            calories: 650,
            protein: 42,
            carbs: 48,
            fat: 34,
            vitamins: ["B1", "B6", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Chawanmushi",
          description: "Savory steamed egg custard with various ingredients",
          cuisine: "Japanese",
          cookingMethods: ["steaming", "straining", "assembling"],
          tools: [
            "steamer",
            "fine-mesh strainer",
            "small cups",
            "whisk",
            "measuring cups"
          ],
          preparationSteps: [
            "Strain beaten eggs",
            "Mix with dashi stock",
            "Place ingredients in cups",
            "Pour egg mixture",
            "Steam gently",
            "Garnish and serve"
          ],
          ingredients: [
            { name: "eggs", amount: "3", unit: "large", category: "protein" },
            { name: "dashi", amount: "300", unit: "ml", category: "broth" },
            { name: "chicken", amount: "60", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "shrimp", amount: "4", unit: "pieces", category: "seafood", optional: true },
            { name: "mitsuba", amount: "4", unit: "sprigs", category: "herb", swaps: ["spinach"] },
            { name: "kamaboko", amount: "30", unit: "g", category: "seafood", optional: true }
          ],
          substitutions: {
            "chicken": ["mushrooms", "tofu"],
            "shrimp": ["vegetables"],
            "dashi": ["vegetable stock"]
          },
          servingSize: 4,
          allergens: ["egg", "shellfish", "fish"],
          prepTime: "20 minutes",
          cookTime: "15 minutes",
          culturalNotes: "A delicate dish that showcases the Japanese mastery of egg cookery. The name means 'steamed in a tea bowl'",
          pairingSuggestions: ["sake", "green tea", "rice"],
          dietaryInfo: ["contains seafood", "contains meat"],
          spiceLevel: "none",
          nutrition: {
            calories: 120,
            protein: 14,
            carbs: 2,
            fat: 7,
            vitamins: ["B12", "D", "A"],
            minerals: ["Selenium", "Iodine"]
          },
          season: ["all"],
          mealType: ["appetizer", "side dish"]
        },
        {
          name: "Yakitori",
          description: "Grilled chicken skewers with various seasonings",
          cuisine: "Japanese",
          cookingMethods: ["grilling", "skewering", "basting"],
          tools: [
            "yakitori grill",
            "bamboo skewers",
            "basting brush",
            "cutting board",
            "sharp knife",
            "tongs"
          ],
          preparationSteps: [
            "Soak bamboo skewers",
            "Cut chicken into bite-size pieces",
            "Thread onto skewers",
            "Prepare tare sauce",
            "Grill while basting",
            "Apply final glaze"
          ],
          ingredients: [
            { name: "chicken thigh", amount: "500", unit: "g", category: "protein", swaps: ["mushrooms", "tofu"] },
            { name: "green onion", amount: "4", unit: "stalks", category: "vegetable" },
            { name: "sake", amount: "60", unit: "ml", category: "seasoning" },
            { name: "mirin", amount: "60", unit: "ml", category: "seasoning" },
            { name: "soy sauce", amount: "60", unit: "ml", category: "seasoning" },
            { name: "sugar", amount: "2", unit: "tbsp", category: "seasoning" }
          ],
          substitutions: {
            "chicken": ["mushrooms", "tofu", "seitan"],
            "sake": ["rice vinegar + water"],
            "mirin": ["sweet rice wine", "rice vinegar + sugar"]
          },
          servingSize: 4,
          allergens: ["soy"],
          prepTime: "30 minutes",
          cookTime: "20 minutes",
          culturalNotes: "A popular izakaya dish, yakitori represents the Japanese art of grilling. Each part of the chicken is traditionally used",
          pairingSuggestions: ["beer", "sake", "shishito peppers", "rice"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 28,
            carbs: 12,
            fat: 18,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          season: ["all"],
          mealType: ["dinner", "appetizer"]
        },
        {
          name: "Miso Ramen",
          description: "Hearty noodle soup with miso-based broth",
          cuisine: "Japanese (Hokkaido-style)",
          cookingMethods: ["simmering", "boiling", "assembling"],
          tools: [
            "large pot",
            "strainer",
            "ladle",
            "serving bowls",
            "sharp knife"
          ],
          preparationSteps: [
            "Prepare rich broth",
            "Cook noodles",
            "Sauté corn and bean sprouts",
            "Slice chashu pork",
            "Assemble bowls",
            "Add toppings"
          ],
          ingredients: [
            { name: "ramen noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
            { name: "miso paste", amount: "4", unit: "tbsp", category: "seasoning" },
            { name: "pork broth", amount: "1", unit: "L", category: "broth", swaps: ["vegetable broth"] },
            { name: "chashu pork", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
            { name: "corn", amount: "200", unit: "g", category: "vegetable" },
            { name: "bean sprouts", amount: "200", unit: "g", category: "vegetable" },
            { name: "butter", amount: "20", unit: "g", category: "dairy", optional: true }
          ],
          substitutions: {
            "pork broth": ["vegetable broth", "mushroom broth"],
            "chashu pork": ["marinated tofu", "seitan"],
            "butter": ["vegan butter", "sesame oil"]
          },
          servingSize: 2,
          allergens: ["wheat", "soy", "dairy"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          culturalNotes: "Miso ramen originated in Hokkaido, where the hearty, warming soup helped people endure cold winters",
          pairingSuggestions: ["gyoza", "edamame", "beer"],
          dietaryInfo: ["contains meat", "contains dairy"],
          spiceLevel: "mild to medium",
          nutrition: {
            calories: 680,
            protein: 38,
            carbs: 85,
            fat: 24,
            vitamins: ["B12", "A", "C"],
            minerals: ["Iron", "Zinc"]
          },
          season: ["winter", "all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Katsudon",
          description: "Breaded pork cutlet with egg over rice",
          cuisine: "Japanese",
          cookingMethods: ["frying", "simmering", "donburi-style"],
          tools: [
            "deep pot",
            "donburi pan",
            "rice cooker",
            { name: "wire rack", category: "coating" },
            "sharp knife"
          ],
          preparationSteps: [
            "Prepare tonkatsu",
            "Cook rice",
            "Simmer dashi mixture",
            "Add sliced tonkatsu",
            "Pour beaten eggs",
            "Steam until set",
            "Serve over rice"
          ],
          ingredients: [
            { name: "pork cutlet", amount: "200", unit: "g", category: "protein", swaps: ["chicken", "tofu"] },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable" },
            { name: "steamed rice", amount: "400", unit: "g", category: "grain" },
            { name: "dashi", amount: "200", unit: "ml", category: "broth" },
            { name: "panko breadcrumbs", amount: "100", unit: "g", category: "coating" }
          ],
          substitutions: {
            "pork": ["chicken cutlet", "tofu steak"],
            "dashi": ["vegetable stock"],
            "eggs": ["Just Egg", "soft tofu"]
          },
          servingSize: 2,
          allergens: ["wheat", "egg", "soy"],
          prepTime: "20 minutes",
          cookTime: "25 minutes",
          culturalNotes: "A popular comfort food that combines tonkatsu with the donburi style. Often eaten before important exams as 'katsu' sounds like 'win' in Japanese",
          pairingSuggestions: ["miso soup", "pickled vegetables", "green tea"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "none",
          nutrition: {
            calories: 850,
            protein: 45,
            carbs: 90,
            fat: 38,
            vitamins: ["B1", "B12", "D"],
            minerals: ["Iron", "Zinc"]
          },
          season: ["all"],
          mealType: ["lunch", "dinner"]
        },
        {
          name: "Gyoza",
          description: "Pan-fried dumplings with meat and vegetable filling",
          cuisine: "Japanese",
          cookingMethods: ["pan-frying", "steaming", "folding"],
          tools: [
            "non-stick pan",
            "spatula",
            "mixing bowls",
            "cutting board",
            "gyoza press (optional)"
          ],
          preparationSteps: [
            "Mix filling ingredients",
            "Fill and fold wrappers",
            "Heat pan with oil",
            "Arrange gyoza",
            "Add water and steam",
            "Crisp bottom",
            "Serve with dipping sauce"
          ],
          ingredients: [
            { name: "gyoza wrappers", amount: "30", unit: "pieces", category: "grain" },
            { name: "ground pork", amount: "300", unit: "g", category: "protein", swaps: ["mushrooms"] },
            { name: "cabbage", amount: "200", unit: "g", category: "vegetable" },
            { name: "chives", amount: "50", unit: "g", category: "vegetable" },
            { name: "ginger", amount: "1", unit: "tbsp", category: "seasoning" },
            { name: "garlic", amount: "2", unit: "cloves", category: "seasoning" }
          ],
          substitutions: {
            "ground pork": ["minced mushrooms", "plant-based meat"],
            "gyoza wrappers": ["rice paper", "homemade wrappers"],
            "cabbage": ["napa cabbage", "bok choy"]
          },
          servingSize: 4,
          allergens: ["wheat", "soy"],
          prepTime: "45 minutes",
          cookTime: "15 minutes",
          culturalNotes: "Adapted from Chinese jiaozi, gyoza became a Japanese favorite after WWII. The crispy bottom is a distinctive Japanese touch",
          pairingSuggestions: ["ramen", "rice", "beer", "green tea"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 280,
            protein: 14,
            carbs: 30,
            fat: 12,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Zinc"]
          },
          season: ["all"],
          mealType: ["appetizer", "side dish"]
        },
        {
          name: "Karaage",
          description: "Japanese-style fried chicken",
          cuisine: "Japanese",
          cookingMethods: ["marinating", "deep-frying"],
          tools: [
            "deep pot",
            "wire rack",
            "mixing bowls",
            "paper towels",
            "thermometer"
          ],
          preparationSteps: [
            "Cut chicken into pieces",
            "Marinate with seasonings",
            "Coat with potato starch",
            "Heat oil to 170°C",
            "Double fry for crispiness",
            "Drain and serve"
          ],
          ingredients: [
            { name: "chicken thigh", amount: "600", unit: "g", category: "protein" },
            { name: "soy sauce", amount: "3", unit: "tbsp", category: "seasoning" },
            { name: "sake", amount: "2", unit: "tbsp", category: "seasoning" },
            { name: "ginger", amount: "1", unit: "tbsp", category: "seasoning" },
            { name: "garlic", amount: "2", unit: "cloves", category: "seasoning" },
            { name: "potato starch", amount: "100", unit: "g", category: "coating" }
          ],
          substitutions: {
            "chicken thigh": ["tofu", "cauliflower"],
            "potato starch": ["cornstarch"],
            "sake": ["rice vinegar + water"]
          },
          servingSize: 4,
          allergens: ["soy"],
          prepTime: "30 minutes",
          cookTime: "20 minutes",
          culturalNotes: "A popular izakaya dish that showcases the Japanese approach to fried foods - light, crispy, and well-seasoned",
          pairingSuggestions: ["beer", "rice", "shredded cabbage", "lemon wedges"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 380,
            protein: 28,
            carbs: 15,
            fat: 24,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"]
          },
          season: ["all"],
          mealType: ["appetizer", "main dish"]
        }
      ]
    }
  },
  traditionalSauces: {
    shoyu: {
      name: "Shoyu (Soy Sauce)",
      description: "Fermented soybean sauce that forms the foundation of Japanese cuisine",
      base: "soybean",
      keyIngredients: ["soybeans", "wheat", "salt", "koji mold"],
      culinaryUses: ["dipping sauce", "seasoning", "marinade", "flavor base"],
      variants: ["Koikuchi", "Usukuchi", "Tamari", "Saishikomi"],
      elementalProperties: {
        Water: 0.4,
    Earth: 0.3,
    Fire: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ["Saturn", "Pluto", "Scorpio"],
      seasonality: "all",
      preparationNotes: "Traditional brewing takes months of fermentation",
      technicalTips: "Different shoyu types are suited for different applications; usukuchi is lighter and saltier"
    },
    miso: {
      name: "Miso",
      description: "Fermented soybean paste with complex umami flavor",
      base: "soybean",
      keyIngredients: ["soybeans", "koji", "salt", "rice or barley"],
      culinaryUses: ["soup base", "marinade", "sauce base", "pickling agent"],
      variants: ["Shiro (white)", "Aka (red)", "Awase (mixed)", "Hatcho (soybean-only)"],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.2,
        Fire: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ["Jupiter", "Moon", "Taurus"],
      seasonality: "all",
      preparationNotes: "Fermentation period determines color and flavor intensity",
      technicalTips: "Never boil miso to preserve live cultures and flavor complexity"
    },
    ponzu: {
      name: "Ponzu",
      description: "Citrus-infused soy sauce with bright acidity",
      base: "citrus and soy",
      keyIngredients: ["soy sauce", "yuzu", "sudachi", "rice vinegar", "bonito flakes"],
      culinaryUses: ["dipping sauce", "dressing", "flavor enhancer", "marinade"],
      variants: ["Yuzu ponzu", "Sudachi ponzu", "Kabosu ponzu", "Vinegar-heavy ponzu"],
      elementalProperties: {
        Water: 0.4,
        Air: 0.3,
        Fire: 0.2,
        Earth: 0.1
      },
      astrologicalInfluences: ["Mercury", "Venus", "Gemini"],
      seasonality: "spring, summer",
      preparationNotes: "Better after resting at least a day to allow flavors to meld",
      technicalTips: "Store in refrigerator to maintain citrus brightness"
    },
    mentsuyu: {
      name: "Mentsuyu",
      description: "Multipurpose noodle sauce concentrate",
      base: "soy and dashi",
      keyIngredients: ["soy sauce", "mirin", "sake", "dashi", "sugar"],
      culinaryUses: ["noodle dipping sauce", "noodle soup base", "broth", "flavor base"],
      variants: ["Kaeshi", "Tsuyu dilutions", "Homemade vs commercial"],
      elementalProperties: {
        Water: 0.5,
        Earth: 0.2,
        Fire: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ["Neptune", "Jupiter", "Pisces"],
      seasonality: "all",
      preparationNotes: "Can be concentrated (for dipping) or diluted (for soups)",
      technicalTips: "Store in refrigerator for up to a month; freezes well"
    },
    teriyaki: {
      name: "Teriyaki",
      description: "Sweet-savory glaze with glossy finish",
      base: "soy and sugar",
      keyIngredients: ["soy sauce", "mirin", "sake", "sugar", "ginger"],
      culinaryUses: ["glaze", "marinade", "sauce base", "finishing sauce"],
      variants: ["Fruit-infused", "Ginger-forward", "Garlic teriyaki", "Honey teriyaki"],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1
      },
      astrologicalInfluences: ["Mars", "Venus", "Leo"],
      seasonality: "all",
      preparationNotes: "The name refers to the cooking method: teri (shine) and yaki (grill)",
      technicalTips: "Reduce sauce to proper consistency; it will thicken further when cool"
    }
  },
  sauceRecommender: {
    forProtein: {
      fish: ["ponzu", "shio-koji", "nikiri", "teriyaki", "miso"],
      chicken: ["teriyaki", "tare", "yuzu-kosho", "shoga-yaki sauce", "mentsuyu"],
      beef: ["yakiniku tare", "warishita", "goma-dare", "ponzu", "tonkatsu sauce"],
      tofu: ["tentsuyu", "ginger soy", "sesame dressing", "miso", "ponzu"],
      eggs: ["mentsuyu", "soy sauce", "dashi-based sauces", "mirin glaze"]
    },
    forVegetable: {
      leafy: ["goma-dare", "wafu dressing", "ponzu", "sesame oil and soy"],
      root: ["nimono sauce", "miso glaze", "dashi-based", "vinegar soy"],
      mushroom: ["butter soy", "sake soy", "mirin glaze", "dashi broth"],
      seaweed: ["ponzu", "light soy", "rice vinegar dressing", "sesame oil"],
      pickled: ["shiso dressing", "miso sauce", "light vinegar", "yuzu juice"]
    },
    forCookingMethod: {
      grilling: ["tare", "teriyaki", "yakitori sauce", "miso glaze", "yuzu-kosho"],
      simmering: ["nimono sauce", "dashi-shoyu", "mentsuyu", "katsuo-based"],
      frying: ["tentsuyu", "ponzu", "tonkatsu sauce", "curry sauce"],
      steaming: ["ponzu", "ginger soy", "yuzu sauce", "light dashi"],
      raw: ["nikiri", "fresh wasabi", "ponzu", "shoyu", "sanbaizu"]
    },
    byAstrological: {
      fire: ["spicy yuzu-kosho", "karashi mustard sauce", "wasabi soy", "hot dashi"],
      earth: ["miso based", "shiitake dashi", "earthy tsukudani", "robust neri-miso"],
      air: ["light ponzu", "yuzu-infused dressings", "citrus shoyu", "sudachi sauce"],
      water: ["clear dashi", "light mentsuyu", "delicate kombu dashi", "subtle usukuchi"]
    },
    byRegion: {
      kanto: ["dark soy-forward", "strong katsuo dashi", "Tokyo-style tsukudani"],
      kansai: ["light kombu dashi", "usukuchi shoyu", "sweet Kyoto-style sauces"],
      kyushu: ["pork-based tare", "spicy karashi", "robust Hakata flavors"],
      hokkaido: ["butter shoyu", "miso ramen tare", "seafood-infused sauces"],
      okinawa: ["awamori-infused", "island citrus sauce", "turmeric-based dressings"]
    }
  },
  cookingTechniques: [
    {
      name: "Nimono",
      description: "Simmering ingredients in a dashi-based broth until they absorb the flavor",
      elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
      toolsRequired: ["heavy pot", "otoshibuta (drop lid)", "cooking chopsticks"],
      bestFor: ["root vegetables", "proteins", "tofu dishes", "slow cooking"]
    },
    {
      name: "Yakimono",
      description: "Grilling or broiling methods that create distinctive charred flavors",
      elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0.0 },
      toolsRequired: ["konro grill", "binchotan charcoal", "grilling tongs", "wire mesh"],
      bestFor: ["skewered meats", "whole fish", "vegetables", "mochi"]
    },
    {
      name: "Agemono",
      description: "Deep-frying techniques including tempura and kara-age",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: ["tempura pot", "cooking chopsticks", "wire skimmer", "thermometer"],
      bestFor: ["seafood", "vegetables", "chicken", "tofu"]
    },
    {
      name: "Mushimono",
      description: "Steaming method that preserves natural flavors and nutrients",
      elementalProperties: { Water: 0.7, Air: 0.2, Earth: 0.1, Fire: 0.0 },
      toolsRequired: ["steamer", "bamboo mat", "parchment paper", "cooking chopsticks"],
      bestFor: ["delicate fish", "custards", "vegetables", "dumplings"]
    },
    {
      name: "Tsukemono",
      description: "Traditional pickling methods for vegetables",
      elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
      toolsRequired: ["pickling container", "weights", "konbu", "salt"],
      bestFor: ["seasonal vegetables", "daikon", "cucumbers", "cabbage"]
    }
  ],
  regionalCuisines: {
    kansai: {
      name: "Kansai (Kyoto) Cuisine",
      description: "Refined, delicate flavors emphasizing the natural taste of ingredients with minimal seasoning",
      signature: ["kaiseki ryori", "yudofu", "obanzai", "kyoto-style sushi"],
      elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Moon", "Mercury", "Virgo"],
      seasonality: "strongly seasonal"
    },
    kanto: {
      name: "Kanto (Tokyo) Cuisine",
      description: "Stronger, bolder flavors with an emphasis on seafood and hearty broths",
      signature: ["edomae sushi", "monjayaki", "fukagawa-meshi", "chanko nabe"],
      elementalProperties: { Water: 0.5, Fire: 0.3, Earth: 0.1, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Jupiter", "Aries"],
      seasonality: "moderately seasonal"
    },
    hokkaido: {
      name: "Hokkaido Cuisine",
      description: "Hearty northern cuisine featuring fresh seafood, dairy, and warming dishes",
      signature: ["soup curry", "genghis khan", "seafood donburi", "miso ramen"],
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Moon", "Capricorn"],
      seasonality: "distinctly seasonal"
    },
    kyushu: {
      name: "Kyushu Cuisine",
      description: "Bold southern cuisine known for rich pork dishes, spicy flavors, and unique specialties",
      signature: ["tonkotsu ramen", "mentaiko", "chicken nanban", "champon"],
      elementalProperties: { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Pluto", "Scorpio"],
      seasonality: "moderately seasonal"
    }
  },
  elementalProperties: {
    Water: 0.4,    // Represents dashi, broths, and ocean influence
    Earth: 0.3,    // Represents rice, umami, and grounding elements
    Air: 0.2,      // Represents lightness and delicacy
    Fire: 0.1      // Represents grilling techniques and wasabi
  }
};

export default japanese;