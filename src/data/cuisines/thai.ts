// src/data/cuisines/thai.ts
import type { Cuisine } from '@/types/recipe';

export const thai: Cuisine = {
  name: 'Thai',
  description: 'Traditional Thai cuisine balancing sweet, sour, spicy, and salty flavors with aromatic herbs and spices',
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
          mealType: ["breakfast"],
          elementalProperties: {
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
          }
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
              { name: "fish sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
              { name: "white pepper", amount: "1", unit: "tsp", category: "spice" }
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
            mealType: ["breakfast"],
            elementalProperties: {
              Water: 0.5,
              Earth: 0.2,
              Fire: 0.2,
              Air: 0.1
            }
          },
          {
            name: "Patongo with Sangkaya",
            description: "Thai-style fried dough served with pandan custard dip",
            cuisine: "Thai",
            ingredients: [
              { name: "all-purpose flour", amount: "300", unit: "g", category: "grain", swaps: ["gluten-free flour blend"] },
              { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
              { name: "pandan leaves", amount: "4", unit: "pieces", category: "herb" },
              { name: "eggs", amount: "3", unit: "large", category: "protein" },
              { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
              { name: "yeast", amount: "1", unit: "tsp", category: "leavening" }
            ],
            nutrition: {
              calories: 420,
              protein: 12,
              carbs: 65,
              fat: 14,
              vitamins: ["A", "D", "E"],
              minerals: ["Calcium", "Iron"]
            },
            timeToMake: "40 minutes",
            season: ["all"],
            mealType: ["breakfast"],
            elementalProperties: {
              Air: 0.4,
              Earth: 0.3,
              Fire: 0.2,
              Water: 0.1
            }
          },
          {
            name: "Khao Kai Jeow",
            description: "Thai-style omelet with rice and sriracha sauce",
            cuisine: "Thai",
            ingredients: [
              { name: "eggs", amount: "3", unit: "large", category: "protein", swaps: ["JUST Egg"] },
              { name: "jasmine rice", amount: "1", unit: "cup", category: "grain" },
              { name: "fish sauce", amount: "1", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
              { name: "green onions", amount: "2", unit: "stalks", category: "vegetable" },
              { name: "white pepper", amount: "1/2", unit: "tsp", category: "spice" },
              { name: "sriracha sauce", amount: "2", unit: "tbsp", category: "sauce" }
            ],
            nutrition: {
              calories: 380,
              protein: 18,
              carbs: 52,
              fat: 12,
              vitamins: ["B12", "D", "K"],
              minerals: ["Iron", "Selenium"]
            },
            timeToMake: "15 minutes",
            season: ["all"],
            mealType: ["breakfast"],
            elementalProperties: {
              Fire: 0.4,
              Earth: 0.3,
              Air: 0.2,
              Water: 0.1
            }
          }
        ]
      },
      lunch: {
        all: [
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
              { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" },
              { name: "dried shrimp", amount: "2", unit: "tbsp", category: "protein", swaps: ["mushroom powder"] }
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
            mealType: ["lunch", "dinner"],
            elementalProperties: {
              Fire: 0.3,
              Earth: 0.3,
              Water: 0.2,
              Air: 0.2
            }
          },
          {
            name: "Khao Soi",
            description: "Northern Thai curry noodle soup with coconut milk",
            cuisine: "Thai",
            ingredients: [
              { name: "egg noodles", amount: "400", unit: "g", category: "grain", swaps: ["rice noodles"] },
              { name: "chicken thighs", amount: "400", unit: "g", category: "protein", swaps: ["tofu"] },
              { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
              { name: "khao soi curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
              { name: "shallots", amount: "4", unit: "medium", category: "vegetable" },
              { name: "pickled mustard greens", amount: "100", unit: "g", category: "vegetable" },
              { name: "lime", amount: "2", unit: "whole", category: "fruit" },
              { name: "crispy noodles", amount: "100", unit: "g", category: "garnish" },
              { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] }
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
            season: ["all"],
            mealType: ["lunch"],
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
            name: "Som Tam Thai",
            description: "Spicy green papaya salad with dried shrimp and peanuts",
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
            mealType: ["lunch"],
            elementalProperties: {
              Fire: 0.5,
              Water: 0.2,
              Earth: 0.2,
              Air: 0.1
            }
          }
        ],
        winter: [
            {
              name: "Khao Kha Moo",
              description: "Braised pork leg with rice and pickled vegetables",
              cuisine: "Thai",
              ingredients: [
                { name: "pork leg", amount: "800", unit: "g", category: "protein", swaps: ["braised mushrooms"] },
                { name: "jasmine rice", amount: "400", unit: "g", category: "grain" },
                { name: "star anise", amount: "3", unit: "whole", category: "spice" },
                { name: "cinnamon", amount: "1", unit: "stick", category: "spice" },
                { name: "soy sauce", amount: "4", unit: "tbsp", category: "seasoning" },
                { name: "pickled mustard greens", amount: "200", unit: "g", category: "vegetable" },
                { name: "garlic", amount: "8", unit: "cloves", category: "vegetable" },
                { name: "boiled eggs", amount: "4", unit: "large", category: "protein" }
              ],
              nutrition: {
                calories: 650,
                protein: 45,
                carbs: 55,
                fat: 28,
                vitamins: ["B12", "D", "K"],
                minerals: ["Iron", "Zinc"]
              },
              timeToMake: "180 minutes",
              season: ["winter"],
              mealType: ["lunch"],
              elementalProperties: {
                Earth: 0.4,
                Water: 0.3,
                Fire: 0.2,
                Air: 0.1
              }
            },
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
              mealType: ["lunch"],
              elementalProperties: {
                Water: 0.4,
                Fire: 0.3,
                Earth: 0.2,
                Air: 0.1
              }
            },
            {
              name: "Kuay Teow Reua",
              description: "Boat noodle soup with rich spiced broth",
              cuisine: "Thai",
              ingredients: [
                { name: "rice noodles", amount: "200", unit: "g", category: "grain" },
                { name: "beef", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                { name: "pork blood", amount: "100", unit: "ml", category: "protein", swaps: ["dark soy sauce"] },
                { name: "morning glory", amount: "100", unit: "g", category: "vegetable" },
                { name: "bean sprouts", amount: "100", unit: "g", category: "vegetable" },
                { name: "five spice powder", amount: "1", unit: "tbsp", category: "spice" },
                { name: "dark soy sauce", amount: "2", unit: "tbsp", category: "seasoning" },
                { name: "crispy pork rinds", amount: "50", unit: "g", category: "garnish", swaps: ["fried shallots"] }
              ],
              nutrition: {
                calories: 480,
                protein: 35,
                carbs: 58,
                fat: 18,
                vitamins: ["B12", "Iron", "A"],
                minerals: ["Zinc", "Iron"]
              },
              timeToMake: "45 minutes",
              season: ["winter"],
              mealType: ["lunch"],
              elementalProperties: {
                Water: 0.4,
                Fire: 0.3,
                Earth: 0.2,
                Air: 0.1
              }
            }
          ]
        },
        dinner: {
            all: [
              {
                name: "Gaeng Keow Wan Gai",
                description: "Green curry with chicken, Thai eggplants, and sweet basil",
                cuisine: "Thai",
                ingredients: [
                  { name: "chicken thighs", amount: "500", unit: "g", category: "protein", swaps: ["tofu"] },
                  { name: "green curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
                  { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                  { name: "Thai eggplant", amount: "200", unit: "g", category: "vegetable" },
                  { name: "bamboo shoots", amount: "200", unit: "g", category: "vegetable" },
                  { name: "kaffir lime leaves", amount: "4", unit: "pieces", category: "herb" },
                  { name: "Thai basil", amount: "1", unit: "cup", category: "herb" },
                  { name: "palm sugar", amount: "1", unit: "tbsp", category: "sweetener" },
                  { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                  { name: "Thai chilies", amount: "4", unit: "pieces", category: "spice" }
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
                mealType: ["dinner"],
                elementalProperties: {
                  Water: 0.3,
                  Fire: 0.3,
                  Earth: 0.2,
                  Air: 0.2
                }
              },
              {
                name: "Pad Krapow Moo",
                description: "Stir-fried pork with holy basil and chili",
                cuisine: "Thai",
                ingredients: [
                  { name: "ground pork", amount: "400", unit: "g", category: "protein", swaps: ["plant-based ground"] },
                  { name: "holy basil", amount: "2", unit: "cups", category: "herb" },
                  { name: "garlic", amount: "6", unit: "cloves", category: "vegetable" },
                  { name: "Thai chilies", amount: "6", unit: "pieces", category: "spice" },
                  { name: "oyster sauce", amount: "2", unit: "tbsp", category: "seasoning", swaps: ["mushroom sauce"] },
                  { name: "fish sauce", amount: "1", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                  { name: "jasmine rice", amount: "2", unit: "cups", category: "grain" },
                  { name: "fried egg", amount: "2", unit: "large", category: "protein", swaps: ["tofu"] }
                ],
                nutrition: {
                  calories: 580,
                  protein: 42,
                  carbs: 45,
                  fat: 28,
                  vitamins: ["B12", "K", "A"],
                  minerals: ["Iron", "Zinc"]
                },
                timeToMake: "20 minutes",
                season: ["all"],
                mealType: ["dinner"],
                elementalProperties: {
                  Fire: 0.5,
                  Earth: 0.2,
                  Water: 0.2,
                  Air: 0.1
                }
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
                    { name: "lemongrass", amount: "2", unit: "stalks", category: "herb" },
                    { name: "celery", amount: "2", unit: "stalks", category: "vegetable" }
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
                  mealType: ["dinner"],
                  elementalProperties: {
                    Water: 0.4,
                    Fire: 0.3,
                    Air: 0.2,
                    Earth: 0.1
                  }
                },
                {
                  name: "Yum Woon Sen",
                  description: "Spicy glass noodle salad with seafood",
                  cuisine: "Thai",
                  ingredients: [
                    { name: "glass noodles", amount: "200", unit: "g", category: "grain" },
                    { name: "shrimp", amount: "200", unit: "g", category: "protein", swaps: ["tofu"] },
                    { name: "squid", amount: "200", unit: "g", category: "protein", swaps: ["mushrooms"] },
                    { name: "ground pork", amount: "100", unit: "g", category: "protein", swaps: ["crumbled tempeh"] },
                    { name: "tomatoes", amount: "2", unit: "medium", category: "vegetable" },
                    { name: "onion", amount: "1", unit: "medium", category: "vegetable" },
                    { name: "celery", amount: "2", unit: "stalks", category: "vegetable" },
                    { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
                    { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                    { name: "Thai chilies", amount: "4", unit: "pieces", category: "spice" }
                  ],
                  nutrition: {
                    calories: 420,
                    protein: 38,
                    carbs: 45,
                    fat: 12,
                    vitamins: ["B12", "C", "D"],
                    minerals: ["Iron", "Zinc"]
                  },
                  timeToMake: "25 minutes",
                  season: ["summer"],
                  mealType: ["dinner"],
                  elementalProperties: {
                    Fire: 0.4,
                    Water: 0.3,
                    Air: 0.2,
                    Earth: 0.1
                  }
                }
              ],
              winter: [
                {
                  name: "Gaeng Massaman Neua",
                  description: "Massaman curry with beef and potatoes",
                  cuisine: "Thai",
                  ingredients: [
                    { name: "beef chuck", amount: "600", unit: "g", category: "protein", swaps: ["jackfruit", "seitan"] },
                    { name: "massaman curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
                    { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                    { name: "potatoes", amount: "400", unit: "g", category: "vegetable" },
                    { name: "onions", amount: "2", unit: "medium", category: "vegetable" },
                    { name: "peanuts", amount: "100", unit: "g", category: "nuts" },
                    { name: "tamarind paste", amount: "2", unit: "tbsp", category: "seasoning" },
                    { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" },
                    { name: "cardamom pods", amount: "4", unit: "pieces", category: "spice" },
                    { name: "cinnamon stick", amount: "1", unit: "piece", category: "spice" }
                  ],
                  nutrition: {
                    calories: 680,
                    protein: 45,
                    carbs: 42,
                    fat: 38,
                    vitamins: ["B12", "A", "E"],
                    minerals: ["Iron", "Potassium"]
                  },
                  timeToMake: "120 minutes",
                  season: ["winter"],
                  mealType: ["dinner"],
                  elementalProperties: {
                    Earth: 0.4,
                    Fire: 0.3,
                    Water: 0.2,
                    Air: 0.1
                  }
                },
                {
                    name: "Tom Yum Goong Nam Khon",
                    description: "Creamy spicy and sour shrimp soup with mushrooms",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "tiger prawns", amount: "500", unit: "g", category: "protein", swaps: ["king oyster mushrooms"] },
                      { name: "straw mushrooms", amount: "200", unit: "g", category: "vegetable" },
                      { name: "lemongrass", amount: "3", unit: "stalks", category: "herb" },
                      { name: "galangal", amount: "6", unit: "slices", category: "spice" },
                      { name: "kaffir lime leaves", amount: "6", unit: "pieces", category: "herb" },
                      { name: "Thai chilies", amount: "8", unit: "pieces", category: "spice" },
                      { name: "evaporated milk", amount: "200", unit: "ml", category: "dairy", swaps: ["coconut milk"] },
                      { name: "lime juice", amount: "4", unit: "tbsp", category: "acid" },
                      { name: "nam prik pao", amount: "3", unit: "tbsp", category: "seasoning" },
                      { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" }
                    ],
                    nutrition: {
                      calories: 420,
                      protein: 45,
                      carbs: 18,
                      fat: 22,
                      vitamins: ["D", "B12", "C"],
                      minerals: ["Zinc", "Iron"]
                    },
                    timeToMake: "45 minutes",
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
                    name: "Gaeng Panang Neua",
                    description: "Thick, rich panang curry with tender beef",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "beef tenderloin", amount: "500", unit: "g", category: "protein", swaps: ["seitan"] },
                      { name: "panang curry paste", amount: "4", unit: "tbsp", category: "seasoning" },
                      { name: "coconut cream", amount: "400", unit: "ml", category: "liquid" },
                      { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
                      { name: "kaffir lime leaves", amount: "6", unit: "pieces", category: "herb" },
                      { name: "Thai basil", amount: "1", unit: "cup", category: "herb" },
                      { name: "palm sugar", amount: "2", unit: "tbsp", category: "sweetener" },
                      { name: "fish sauce", amount: "3", unit: "tbsp", category: "seasoning", swaps: ["soy sauce"] },
                      { name: "peanuts", amount: "1/2", unit: "cup", category: "nuts" }
                    ],
                    nutrition: {
                      calories: 650,
                      protein: 42,
                      carbs: 22,
                      fat: 45,
                      vitamins: ["B12", "E", "K"],
                      minerals: ["Iron", "Zinc"]
                    },
                    timeToMake: "60 minutes",
                    season: ["winter"],
                    mealType: ["dinner"],
                    elementalProperties: {
                      Fire: 0.4,
                      Earth: 0.3,
                      Water: 0.2,
                      Air: 0.1
                    }
                  },
                  {
                    name: "Khao Soi Gai",
                    description: "Northern Thai curry noodle soup with chicken",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "egg noodles", amount: "500", unit: "g", category: "grain", swaps: ["rice noodles"] },
                      { name: "chicken legs", amount: "600", unit: "g", category: "protein", swaps: ["tofu"] },
                      { name: "coconut milk", amount: "800", unit: "ml", category: "liquid" },
                      { name: "khao soi curry paste", amount: "5", unit: "tbsp", category: "seasoning" },
                      { name: "crispy noodles", amount: "100", unit: "g", category: "garnish" },
                      { name: "shallots", amount: "4", unit: "whole", category: "vegetable" },
                      { name: "pickled mustard greens", amount: "100", unit: "g", category: "vegetable" },
                      { name: "lime", amount: "2", unit: "whole", category: "fruit" },
                      { name: "chili oil", amount: "4", unit: "tbsp", category: "oil" }
                    ],
                    nutrition: {
                      calories: 720,
                      protein: 38,
                      carbs: 65,
                      fat: 42,
                      vitamins: ["A", "D", "K"],
                      minerals: ["Iron", "Calcium"]
                    },
                    timeToMake: "75 minutes",
                    season: ["winter"],
                    mealType: ["dinner"],
                    elementalProperties: {
                      Water: 0.3,
                      Fire: 0.3,
                      Earth: 0.2,
                      Air: 0.2
                    }
                  }
                ]
              }
            },
            dessert: {
                all: [
                  {
                    name: "Khao Niao Mamuang",
                    description: "Sweet sticky rice with fresh mango and coconut cream",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "sticky rice", amount: "200", unit: "g", category: "grain" },
                      { name: "ripe mango", amount: "2", unit: "whole", category: "fruit" },
                      { name: "coconut cream", amount: "200", unit: "ml", category: "liquid" },
                      { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" },
                      { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" },
                      { name: "salt", amount: "1/4", unit: "tsp", category: "seasoning" },
                      { name: "pandan leaves", amount: "2", unit: "pieces", category: "herb" }
                    ],
                    nutrition: {
                      calories: 450,
                      protein: 6,
                      carbs: 85,
                      fat: 12,
                      vitamins: ["A", "C", "E"],
                      minerals: ["Potassium", "Manganese"]
                    },
                    timeToMake: "45 minutes",
                    season: ["all"],
                    mealType: ["dessert"],
                    elementalProperties: {
                      Water: 0.4,
                      Earth: 0.3,
                      Air: 0.2,
                      Fire: 0.1
                    }
                  },
                  {
                    name: "Tub Tim Grob",
                    description: "Water chestnut rubies in coconut milk",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "water chestnuts", amount: "200", unit: "g", category: "vegetable" },
                      { name: "tapioca flour", amount: "100", unit: "g", category: "starch" },
                      { name: "red food coloring", amount: "1", unit: "tsp", category: "coloring" },
                      { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                      { name: "palm sugar", amount: "3", unit: "tbsp", category: "sweetener" },
                      { name: "jackfruit", amount: "100", unit: "g", category: "fruit" },
                      { name: "crushed ice", amount: "2", unit: "cups", category: "ice" }
                    ],
                    nutrition: {
                      calories: 320,
                      protein: 4,
                      carbs: 45,
                      fat: 16,
                      vitamins: ["E", "K"],
                      minerals: ["Manganese", "Copper"]
                    },
                    timeToMake: "40 minutes",
                    season: ["all"],
                    mealType: ["dessert"],
                    elementalProperties: {
                      Water: 0.5,
                      Earth: 0.2,
                      Air: 0.2,
                      Fire: 0.1
                    }
                  },
                  {
                    name: "Bua Loi",
                    description: "Rice flour dumplings in warm coconut milk",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "glutinous rice flour", amount: "200", unit: "g", category: "flour" },
                      { name: "pandan extract", amount: "1", unit: "tsp", category: "flavoring" },
                      { name: "coconut milk", amount: "400", unit: "ml", category: "liquid" },
                      { name: "palm sugar", amount: "100", unit: "g", category: "sweetener" },
                      { name: "salt", amount: "1/4", unit: "tsp", category: "seasoning" },
                      { name: "ginger", amount: "2", unit: "slices", category: "spice" }
                    ],
                    nutrition: {
                      calories: 280,
                      protein: 3,
                      carbs: 48,
                      fat: 10,
                      vitamins: ["E"],
                      minerals: ["Calcium", "Iron"]
                    },
                    timeToMake: "30 minutes",
                    season: ["all"],
                    mealType: ["dessert"],
                    elementalProperties: {
                      Water: 0.4,
                      Earth: 0.3,
                      Air: 0.2,
                      Fire: 0.1
                    }
                  }
                ],
                summer: [
                  {
                    name: "Nam Kang Sai",
                    description: "Thai shaved ice dessert with various toppings",
                    cuisine: "Thai",
                    ingredients: [
                      { name: "shaved ice", amount: "4", unit: "cups", category: "ice" },
                      { name: "red syrup", amount: "60", unit: "ml", category: "syrup" },
                      { name: "green syrup", amount: "60", unit: "ml", category: "syrup" },
                      { name: "palm seeds", amount: "100", unit: "g", category: "fruit" },
                      { name: "red beans", amount: "100", unit: "g", category: "legume" },
                      { name: "grass jelly", amount: "100", unit: "g", category: "jelly" },
                      { name: "sweet corn", amount: "100", unit: "g", category: "vegetable" },
                      { name: "coconut milk", amount: "200", unit: "ml", category: "liquid" }
                    ],
                    nutrition: {
                      calories: 320,
                      protein: 5,
                      carbs: 65,
                      fat: 8,
                      vitamins: ["A", "C"],
                      minerals: ["Iron", "Potassium"]
                    },
                    timeToMake: "20 minutes",
                    season: ["summer"],
                    mealType: ["dessert"],
                    elementalProperties: {
                      Water: 0.6,
                      Air: 0.2,
                      Earth: 0.1,
                      Fire: 0.1
                    }
                  }
                ]
              },
              elementalProperties: {
                Fire: 0.2,
                Water: 0.2,
                Air: 0.2,
                Earth: 0.4
              }
}

export default thai;