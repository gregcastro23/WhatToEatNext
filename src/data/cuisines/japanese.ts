// src/data/cuisines/japanese.ts
import type { Cuisine } from "@/types/cuisine";

export const japanese: Cuisine = {
  id: "japanese",
  name: "Japanese",
  description:
    "Traditional Japanese cuisine emphasizing seasonal ingredients, harmony of flavors, and meticulous preparation techniques",
  motherSauces: {
    dashi: {
      name: "Dashi",
      description:
        "Fundamental Japanese stock that serves as the base for many soups and sauces",
      base: "kombu and/or katsuobushi",
      thickener: "none",
      keyIngredients: [
        "kombu (dried kelp)",
        "katsuobushi (dried bonito flakes)",
      ],
      culinaryUses: [
        "miso soup",
        "noodle broths",
        "sauce base",
        "braising liquid",
      ],
      derivatives: [
        "Awase dashi",
        "Kombu dashi",
        "Shiitake dashi",
        "Iriko dashi",
      ],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Air: 0.1,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Moon", "Pisces"],
      seasonality: "all",
      preparationNotes:
        "Never boil kombu, gently heat to extract umami without bitterness",
      technicalTips:
        "Remove kombu before water boils, then add katsuobushi off heat",
      difficulty: "easy",
      storageInstructions:
        "Store refrigerated up to 3 days or freeze up to 1 month",
      yield: "1 liter",
    },
    tare: {
      name: "Tare",
      description:
        "Concentrated seasoning sauce used as a flavoring base for many Japanese dishes",
      base: "soy sauce",
      thickener: "reduction",
      keyIngredients: ["soy sauce", "mirin", "sake", "sugar"],
      culinaryUses: [
        "ramen seasoning",
        "glazes",
        "marinades",
        "dipping sauces",
      ],
      derivatives: ["Shoyu tare", "Shio tare", "Miso tare", "Karaage tare"],
      elementalProperties: {
        Earth: 0.4,
        Water: 0.3,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Saturn", "Mercury", "Taurus"],
      seasonality: "all",
      preparationNotes:
        "Often simmered with aromatics like ginger, garlic, and scallions",
      technicalTips:
        "Balance sweet, salty, and umami carefully; adjust with kombu or bonito",
      difficulty: "medium",
      storageInstructions: "Store refrigerated up to 1 month",
      yield: "500 ml",
    },
  },
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Traditional Japanese Breakfast Set (Ichiju Sansai)",
          "description": "A perfectly balanced structural model of Japanese nutritional philosophy: 'One soup, three sides' (Ichiju Sansai). It provides a complete spectrum of elements—Fire (grilled fish), Water (miso soup), Earth (rice and fermented pickles), and Air (steamed vegetables).",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 15,
            "baseServingSize": 1,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "fillet",
              "name": "salted salmon (Shioyaki)",
              "notes": "Grilled until the skin is crispy."
            },
            {
              "amount": 1,
              "unit": "bowl",
              "name": "miso soup",
              "notes": "Dashi-based with tofu and wakame."
            },
            {
              "amount": 1,
              "unit": "bowl",
              "name": "steamed short-grain rice",
              "notes": "The carbohydrate core."
            },
            {
              "amount": 1,
              "unit": "small dish",
              "name": "Tsukemono (pickles)",
              "notes": "Takuan or umeboshi for acidity."
            },
            {
              "amount": 1,
              "unit": "small dish",
              "name": "Kobachi (side dish)",
              "notes": "E.g., spinach ohitashi or hijiki seaweed salad."
            }
          ],
          "instructions": [
            "Step 1: Rice. Start the rice cooker first. It is the grounding element.",
            "Step 2: Fish. Grill the salted salmon over medium-high heat until the skin is blistered and golden.",
            "Step 3: Soup. Prepare fresh dashi. Whisk in miso paste off the heat. Add tofu cubes.",
            "Step 4: Sides. Prepare a small dish of blanched spinach with soy sauce and a few slices of pickled radish.",
            "Step 5: Assemble. Arrange all bowls on a tray according to traditional placement: rice on the front left, soup on the front right, main dish at the back."
          ],
          "classifications": {
            "mealType": [
              "breakfast"
            ],
            "cookingMethods": [
              "steaming",
              "grilling",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.3,
            "Earth": 0.3,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Sun"
            ],
            "signs": [
              "Virgo",
              "Pisces"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 450,
            "proteinG": 28,
            "carbsG": 55,
            "fatG": 12,
            "fiberG": 4,
            "sodiumMg": 950,
            "sugarG": 2,
            "vitamins": [
              "Vitamin D",
              "B12",
              "A"
            ],
            "minerals": [
              "Iodine",
              "Calcium",
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1327,"entropy":0.1598,"reactivity":1.284,"gregsEnergy":-0.0725,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "salmon",
              "substituteOptions": [
                "mackerel (Saba)",
                "fermented natto (for a vegan-centric set)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Tamagoyaki (Japanese Omelet)",
          "description": "An exercise in precise temperature control and layering. Thin sheets of egg seasoned with dashi, sugar, and soy are rolled consecutively in a square pan (makiyakinabe) to create a multi-layered, dense, yet springy custard block.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 10,
            "baseServingSize": 2,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Gently beaten to avoid bubbles."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "dashi stock",
              "notes": "Provides the essential umami and moisture."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "Tamagoyaki is traditionally sweet-savory."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "light soy sauce",
              "notes": "For seasoning."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "mirin",
              "notes": "For shine and sweetness."
            }
          ],
          "instructions": [
            "Step 1: The Mix. Whisk eggs with dashi, sugar, soy sauce, and mirin. Strain through a sieve for a perfectly smooth texture.",
            "Step 2: Heat. Grease a square pan with oil. Heat over medium-low.",
            "Step 3: First Layer. Pour a thin layer of egg to cover the bottom. When just set but still wet on top, roll it tightly from one end to the other.",
            "Step 4: Subsequent Layers. Move the roll to the back. Grease the empty pan. Pour another thin layer, lifting the existing roll so the new egg flows beneath it. Roll again.",
            "Step 5: Repeat. Continue until all egg is used. The result should be a thick rectangular log.",
            "Step 6: Shape. Press the hot log into a bamboo mat (makisu) for 5 minutes to set the shape and create ridges. Slice into 1-inch pieces."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack",
              "dim sum",
              "vegetarian"
            ],
            "cookingMethods": [
              "whisking",
              "layering",
              "rolling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.35,
            "Earth": 0.25,
            "Air": 0.25
          },
          "astrologicalAffinities": {
            "planets": [
              "Sun",
              "Moon"
            ],
            "signs": [
              "Leo",
              "Cancer"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 250,
            "proteinG": 14,
            "carbsG": 12,
            "fatG": 16,
            "fiberG": 0,
            "sodiumMg": 380,
            "sugarG": 8,
            "vitamins": [
              "Vitamin A",
              "Vitamin D"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1259,"entropy":0.1605,"reactivity":1.4128,"gregsEnergy":-0.1009,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "dashi",
              "substituteOptions": [
                "water with a pinch of dashi powder",
                "vegetable stock"
              ]
            }
          ]
        },
        {
          "name": "Authentic Natto Gohan",
          "description": "An alchemical study in bacterial fermentation (Bacillus subtilis). Fermented soybeans develop a unique, sticky, thread-like mucilage (neba-neba) and a pungent aroma. The key is aggressive mechanical agitation (whipping) to aerate the mucilage before combining with hot rice.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 5,
            "cookTimeMinutes": 0,
            "baseServingSize": 1,
            "spiceLevel": "Mild",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "pack (50g)",
              "name": "natto",
              "notes": "Fermented soybeans."
            },
            {
              "amount": 1,
              "unit": "bowl",
              "name": "hot steamed rice",
              "notes": "Must be very hot to slightly soften the natto."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "karashi (Japanese hot mustard)",
              "notes": "Usually included in the pack."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "dashi-soy sauce",
              "notes": "Usually included in the pack."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "scallions",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg yolk or raw egg",
              "notes": "Optional, but highly traditional for extra creaminess."
            }
          ],
          "instructions": [
            "Step 1: The Whipping (Critical). Place the natto in a small bowl. Use chopsticks to stir vigorously in a circular motion for exactly 50 to 100 strokes. The strings will become white, thick, and foamy.",
            "Step 2: Season. Add the mustard and soy sauce. Stir another 20 times to incorporate.",
            "Step 3: Combine. Pour the foamy natto over the center of the hot rice bowl.",
            "Step 4: Top. Add the egg yolk and scallions. Mix slightly into the top layer of rice and consume immediately."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "vegetarian",
              "vegan"
            ],
            "cookingMethods": [
              "whipping",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.05,
            "Water": 0.2,
            "Earth": 0.6,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn",
              "Moon"
            ],
            "signs": [
              "Capricorn",
              "Virgo"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 12,
            "carbsG": 48,
            "fatG": 10,
            "fiberG": 6,
            "sodiumMg": 450,
            "sugarG": 1,
            "vitamins": [
              "Vitamin K2",
              "Vitamin B12"
            ],
            "minerals": [
              "Manganese",
              "Iron",
              "Calcium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0643,"entropy":0.071,"reactivity":0.3055,"gregsEnergy":0.0426,"kalchm":0.25,"monica":0.1005},
                    "substitutions": [
            {
              "originalIngredient": "egg yolk",
              "substituteOptions": [
                "omit entirely (vegan)"
              ]
            }
          ]
        },
      ],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Onigiri Selection",
          "description": "The quintessential Japanese handheld meal. It relies on the structural properties of short-grain rice (Japonica) which, when compressed while warm, forms a self-supporting matrix. The nori seaweed acts as both a moisture barrier and a structural handle.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 0,
            "baseServingSize": 2,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "steamed Japanese rice",
              "notes": "Must be warm. Do not use sushi rice (vinegarized) for traditional onigiri."
            },
            {
              "amount": 2,
              "unit": "sheets",
              "name": "nori seaweed",
              "notes": "Cut into strips or squares."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "sea salt",
              "notes": "For the hands while shaping."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "umeboshi (pickled plums)",
              "notes": "For filling 1."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "grilled salted salmon (shioyaki)",
              "notes": "Flaked, for filling 2."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "toasted sesame seeds",
              "notes": "For coating."
            }
          ],
          "instructions": [
            "Step 1: Prep. Wet your hands with water and rub them with a generous amount of sea salt. This seasons the outside of the rice and prevents sticking.",
            "Step 2: Mold. Pick up a handful of warm rice. Create a small indentation in the center.",
            "Step 3: Fill. Place the filling (umeboshi or salmon) in the indentation. Cover with a little more rice.",
            "Step 4: Shape. Use your palms to compress and shape the rice into a triangle, ball, or cylinder. Do not pack too tightly; the rice should remain airy.",
            "Step 5: Wrap. Wrap a strip of nori around the base of the rice shape. Serve immediately while nori is crisp, or wrap in plastic for later."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "snack",
              "street food"
            ],
            "cookingMethods": [
              "steaming",
              "compressing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.05,
            "Water": 0.15,
            "Earth": 0.65,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Earth",
              "Moon"
            ],
            "signs": [
              "Taurus",
              "Cancer"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 8,
            "carbsG": 62,
            "fatG": 2,
            "fiberG": 2,
            "sodiumMg": 550,
            "sugarG": 1,
            "vitamins": [
              "Iodine",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0003,"entropy":0.0032,"reactivity":0.3848,"gregsEnergy":-0.0009,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "umeboshi",
              "substituteOptions": [
                "pickled ginger",
                "salted kombu"
              ]
            }
          ]
        },
      ],
      summer: [
        {
          "name": "Authentic Hiyashi Chuka (Cold Ramen)",
          "description": "A summer masterpiece of temperature and acidity. Ramen noodles are chilled and dressed in a tart soy-vinegar-sesame emulsion, topped with a geometric arrangement of cooling, colorful ingredients representing the 'five colors' of Japanese cuisine.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 10,
            "baseServingSize": 2,
            "spiceLevel": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "packs",
              "name": "fresh ramen noodles",
              "notes": "Boiled, then rapidly chilled in ice water."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "soy sauce",
              "notes": "For the dressing."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "rice vinegar",
              "notes": "For the dressing."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "toasted sesame oil",
              "notes": "For the dressing."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "To balance the vinegar."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "cucumber",
              "notes": "Julienned into thin matchsticks."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Made into a thin crepe (kinshi tamago) and shredded."
            },
            {
              "amount": 2,
              "unit": "slices",
              "name": "ham",
              "notes": "Julienned."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "tomato",
              "notes": "Sliced into wedges."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "shrimp",
              "notes": "Boiled and chilled."
            }
          ],
          "instructions": [
            "Step 1: The Dressing. Whisk soy sauce, vinegar, sesame oil, and sugar. Chill in the fridge.",
            "Step 2: The Noodles. Boil noodles until al dente. Drain and immediately submerge in ice water. Rub the noodles to remove surface starch. Drain and pat dry.",
            "Step 3: The Toppings. Prepare all toppings into uniform, thin matchsticks. This ensures every bite has multiple textures.",
            "Step 4: Assemble. Mound the cold noodles in a shallow bowl. Arrange the toppings in distinct radial sections on top, like a flower.",
            "Step 5: Pour the cold dressing over everything and serve immediately with a dab of karashi mustard."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "noodle"
            ],
            "cookingMethods": [
              "boiling",
              "chilling",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.05,
            "Water": 0.55,
            "Earth": 0.2,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Mercury"
            ],
            "signs": [
              "Cancer",
              "Gemini"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 24,
            "carbsG": 65,
            "fatG": 14,
            "fiberG": 3,
            "sodiumMg": 920,
            "sugarG": 8,
            "vitamins": [
              "Vitamin C",
              "Vitamin A"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0643,"entropy":0.2701,"reactivity":2.3229,"gregsEnergy":-0.5631,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "ham/shrimp",
              "substituteOptions": [
                "fried tofu strips and shiitake (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Soba Salad with Sesame-Ginger Dressing",
          "description": "A study in buckwheat chemistry. Soba noodles (buckwheat) have a fragile gluten structure and must be handled with care. They are paired with a high-friction ginger-sesame dressing that clings to the nutty noodles, providing an earthy, airy meal.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 5,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": [
              "summer",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 200,
              "unit": "g",
              "name": "dried soba noodles",
              "notes": "Must be at least 30-50% buckwheat."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "tahini or Chinese sesame paste",
              "notes": "For the dressing."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "fresh ginger",
              "notes": "Grated, for the dressing."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For the dressing."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "honey or maple syrup",
              "notes": "For the dressing."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "edamame beans",
              "notes": "Shelled."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "carrot",
              "notes": "Shredded."
            }
          ],
          "instructions": [
            "Step 1: Boil Soba. Cook in boiling water for exactly 4-5 mins. Do not overcook.",
            "Step 2: The Rinse (Critical). Drain and rinse vigorously in cold water, rubbing the noodles between your hands to remove the thick starch layer. This ensures they don't become gummy.",
            "Step 3: The Dressing. Whisk sesame paste, ginger, soy, and honey until emulsified.",
            "Step 4: Combine. Toss the cold noodles with the dressing, edamame, and carrots. Serve immediately chilled."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "vegan",
              "noodle"
            ],
            "cookingMethods": [
              "boiling",
              "chilling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.3,
            "Earth": 0.4,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Earth",
              "Mercury"
            ],
            "signs": [
              "Virgo",
              "Gemini"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 16,
            "carbsG": 58,
            "fatG": 12,
            "fiberG": 8,
            "sodiumMg": 450,
            "sugarG": 6,
            "vitamins": [
              "Vitamin K",
              "Vitamin B1"
            ],
            "minerals": [
              "Magnesium",
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":0,"Matter":0,"Substance":1},
          thermodynamicProperties: {"heat":0.2798,"entropy":4.1837,"reactivity":13.375,"gregsEnergy":-55.6769,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "soba",
              "substituteOptions": [
                "buckwheat pasta",
                "whole wheat spaghetti"
              ]
            }
          ]
        },
      ],
      winter: [
        {
          "name": "Authentic Japanese Curry Rice (Kare Raisu)",
          "description": "A unique British-influenced Japanese stew. The alchemy involves a 'brown roux' base—flour and butter cooked until toasted—combined with a specific curry powder blend. It is characterized by its thick, glossy consistency and its sweet-savory balance achieved through grated apple and caramelized onions.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "Mild-Medium",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "beef or pork shoulder",
              "notes": "Cut into chunks."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "onions",
              "notes": "Thinly sliced and caramelized."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Peeled and chunked."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "carrot",
              "notes": "Cut into rounds."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "unsalted butter",
              "notes": "For the roux."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "all-purpose flour",
              "notes": "For the roux."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "S&B Curry Powder",
              "notes": "Or similar Japanese-style blend."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tomato ketchup",
              "notes": "Adds acidity and sweetness."
            },
            {
              "amount": 0.5,
              "unit": "whole",
              "name": "apple",
              "notes": "Finely grated. The 'secret' ingredient."
            }
          ],
          "instructions": [
            "Step 1: The Roux. Melt butter, whisk in flour. Cook on low heat for 15-20 mins, stirring constantly, until it turns a dark peanut butter brown. Stir in curry powder and remove from heat.",
            "Step 2: The Base. In a pot, sear meat and onions. Add carrots, potatoes, and 4 cups of water. Simmer for 20 mins until vegetables are soft.",
            "Step 3: Combine. Ladle a bit of the hot broth into the roux to loosen it, then pour the roux back into the main pot. It will thicken instantly.",
            "Step 4: The 'Secret' flavors. Stir in the ketchup, grated apple, and honey. Simmer for another 10 mins until glossy. Serve over hot white rice with Fukujinzuke pickles."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "comfort food"
            ],
            "cookingMethods": [
              "browning",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.25,
            "Water": 0.2,
            "Earth": 0.45,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Jupiter",
              "Earth"
            ],
            "signs": [
              "Taurus",
              "Sagittarius"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 550,
            "proteinG": 32,
            "carbsG": 62,
            "fatG": 24,
            "fiberG": 6,
            "sodiumMg": 850,
            "sugarG": 12,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":0,"Substance":0},
          thermodynamicProperties: {"heat":0.3469,"entropy":0.3939,"reactivity":10.4321,"gregsEnergy":-3.7627,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "beef",
              "substituteOptions": [
                "chickpeas and extra potatoes (vegan)"
              ]
            }
          ]
        },
      ],
    },
    dinner: {
      all: [
        {
          "name": "Authentic Sushi Selection",
          "description": "True sushi is not about the fish; it is entirely about the rice (shari).",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 30,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "sushi rice",
              "notes": "Washed thoroughly."
            }
          ],
          "instructions": [
            "Step 1: Wash and soak rice.",
            "Step 2: Cook rice with kombu.",
            "Step 3: Season with vinegar and fan cool.",
            "Step 4: Assemble nigiri."
          ],
          "classifications": {
            "mealType": [
              "dinner"
            ],
            "cookingMethods": [
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.05,
            "Water": 0.45,
            "Earth": 0.3,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon"
            ],
            "signs": [
              "Pisces"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 20,
            "carbsG": 55,
            "fatG": 2,
            "fiberG": 1,
              "sodiumMg": 424,
              "sugarG": 14,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0003,"entropy":0.0056,"reactivity":0.7367,"gregsEnergy":-0.0039,"kalchm":1.0,"monica":1.0},
                    "substitutions": []
        },
        {
          name: "Miso Soup (Miso Shiru)",
          description: "The foundational pillar of Japanese cuisine: a bowl of dashi broth seasoned with fermented miso paste, containing tofu and wakame seaweed. The critical technique is dissolving miso off direct heat to preserve its living enzymes and complex umami depth.",
          details: {"cuisine":"Japanese","prepTimeMinutes":5,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [
            {"amount":3,"unit":"cups","name":"dashi stock","notes":"Awase dashi from kombu and katsuobushi is ideal."},
            {"amount":2,"unit":"tbsp","name":"white miso paste (shiro miso)","notes":"Or use aka miso for a deeper, saltier flavor."},
            {"amount":100,"unit":"g","name":"silken tofu","notes":"Cut into small cubes."},
            {"amount":2,"unit":"tbsp","name":"dried wakame seaweed","notes":"Rehydrated in cold water for 5 minutes."},
            {"amount":1,"unit":"stalk","name":"scallion","notes":"Thinly sliced, for garnish."}
          ],
          instructions: [
            "Step 1: The Dashi. Gently heat the dashi stock in a saucepan over medium heat until it just begins to simmer. Do not allow it to come to a full, rolling boil.",
            "Step 2: The Tofu. Add the cubed silken tofu and rehydrated wakame to the hot dashi. Warm gently for 2 minutes. The tofu is already cooked and only needs to be heated through.",
            "Step 3: The Miso. Remove the pot from direct heat. Place the miso paste in a small ladle or strainer and dip it into the hot broth. Use chopsticks to dissolve the miso directly into the broth through the ladle, preventing any undissolved clumps. This off-heat technique preserves the beneficial microorganisms.",
            "Step 4: The Season. Taste the broth. The saltiness should be present but gentle. Adjust by adding a small amount more miso if needed, always dissolving it off heat.",
            "Step 5: Serve. Ladle immediately into warmed ceramic bowls. Garnish with thinly sliced scallion. Miso soup should never be reheated to a boil after the miso is added."
          ],
          classifications: {"mealType":["breakfast","lunch","dinner","side"],"cookingMethods":["simmering"]},
          elementalProperties: {"Fire":0.1,"Water":0.55,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":65,"proteinG":5,"carbsG":7,"fatG":2,"fiberG":1,"sodiumMg":620,"sugarG":2,"vitamins":["Vitamin K","Folate"],"minerals":["Manganese","Calcium"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0683,"reactivity":3.145,"gregsEnergy":-0.2144,"kalchm":4.0,"monica":0.0492},
                    substitutions: [{"originalIngredient":"silken tofu","substituteOptions":["abura-age (fried tofu pouches)","nameko mushrooms"]},{"originalIngredient":"wakame seaweed","substituteOptions":["spinach","shredded napa cabbage"]}]
        },
        {
          name: "Yakisoba (Stir-Fried Noodles)",
          description: "A beloved Japanese street food of soft wheat noodles stir-fried in a blazing hot wok with pork, cabbage, and a complex sweet-savory-tangy sauce. The key is extreme heat that creates wok hei, charring the noodles slightly for a smoky complexity.",
          details: {"cuisine":"Japanese","prepTimeMinutes":15,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":2,"unit":"portions","name":"yakisoba noodles","notes":"Fresh or pre-steamed wheat noodles. Separate them gently before use."},
            {"amount":150,"unit":"g","name":"pork belly","notes":"Thinly sliced into bite-sized pieces."},
            {"amount":2,"unit":"cups","name":"green cabbage","notes":"Roughly chopped into 1-inch pieces."},
            {"amount":1,"unit":"medium","name":"carrot","notes":"Julienned into thin matchsticks."},
            {"amount":3,"unit":"tbsp","name":"yakisoba sauce","notes":"A blend of Worcestershire sauce, oyster sauce, ketchup, soy sauce, and sugar."},
            {"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"High smoke-point neutral oil."},
            {"amount":2,"unit":"tbsp","name":"aonori (dried green seaweed flakes)","notes":"For garnish."},
            {"amount":2,"unit":"tbsp","name":"beni shoga (pickled red ginger)","notes":"Tangy garnish that cuts through the richness."},
            {"amount":2,"unit":"tbsp","name":"katsuobushi (bonito flakes)","notes":"For garnish, will dance from the heat."}
          ],
          instructions: [
            "Step 1: The Heat. Heat a wok or large iron skillet over the highest possible flame until it is smoking. This extreme heat is non-negotiable for proper yakisoba.",
            "Step 2: The Pork. Add the oil and immediately add the pork belly slices. Stir-fry aggressively until the fat renders and the edges are just beginning to brown.",
            "Step 3: The Vegetables. Add the cabbage and carrot to the pork. Continue to stir-fry over high heat, tossing constantly. The vegetables should soften slightly but retain a firm bite.",
            "Step 4: The Noodles. Add the noodles to the wok. Spread them across the hot surface and let them sit undisturbed for 30 seconds to develop light char marks. Then toss everything together with the pork and vegetables.",
            "Step 5: The Sauce and Serve. Pour the yakisoba sauce over the noodles and toss vigorously to coat every strand evenly. The sauce will caramelize slightly on contact with the hot pan. Plate immediately and top with aonori, beni shoga, and dancing katsuobushi."
          ],
          classifications: {"mealType":["lunch","dinner","snack"],"cookingMethods":["stir-frying"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.25,"Air":0.15},
          astrologicalAffinities: {"planets":["Mars","Jupiter"],"signs":["aries","sagittarius"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":520,"proteinG":22,"carbsG":58,"fatG":22,"fiberG":4,"sodiumMg":980,"sugarG":9,"vitamins":["Vitamin C","Thiamin"],"minerals":["Iron","Zinc"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0895,"entropy":0.0993,"reactivity":3.3424,"gregsEnergy":-0.2426,"kalchm":4.0,"monica":0.0523},
                    substitutions: [{"originalIngredient":"pork belly","substituteOptions":["chicken thigh","shrimp","firm tofu"]},{"originalIngredient":"yakisoba noodles","substituteOptions":["ramen noodles","udon noodles"]}]
        },
        {
          name: "Takoyaki (Octopus Balls)",
          description: "A festive Osaka street food: spherical dumplings of creamy, barely-cooked batter encasing tender chunks of octopus, shaped in a specialized cast-iron pan. The master technique is the quarter-turn flip that builds the perfect crisp shell around a molten, custardy interior.",
          details: {"cuisine":"Japanese","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":1,"unit":"cup","name":"all-purpose flour","notes":"For the takoyaki batter base."},
            {"amount":2,"unit":"large","name":"eggs","notes":"At room temperature."},
            {"amount":2,"unit":"cups","name":"dashi stock","notes":"Cool dashi, for a light and savory batter."},
            {"amount":1,"unit":"tbsp","name":"soy sauce","notes":"For seasoning the batter."},
            {"amount":100,"unit":"g","name":"cooked octopus (tako)","notes":"Boiled and cut into 1 cm cubes."},
            {"amount":2,"unit":"stalks","name":"scallions","notes":"Finely sliced."},
            {"amount":2,"unit":"tbsp","name":"tenkasu (tempura scraps)","notes":"For internal crunch."},
            {"amount":2,"unit":"tbsp","name":"beni shoga (pickled red ginger)","notes":"Minced, for flavor inside the ball."},
            {"amount":3,"unit":"tbsp","name":"takoyaki sauce","notes":"Similar to okonomiyaki sauce."},
            {"amount":2,"unit":"tbsp","name":"Kewpie mayonnaise","notes":"For drizzling."},
            {"amount":1,"unit":"tbsp","name":"vegetable oil","notes":"For the takoyaki pan."}
          ],
          instructions: [
            "Step 1: The Batter. Whisk together flour, eggs, dashi, and soy sauce until the batter is completely smooth and slightly thinner than pancake batter.",
            "Step 2: The Pan. Heat the takoyaki pan over medium-high heat. Brush every mold generously with oil.",
            "Step 3: The Fill. Pour the batter into the molds, filling them to slightly overflowing. Immediately add a cube of octopus, a pinch of tenkasu, some scallion, and beni shoga into each mold.",
            "Step 4: The Flip. When the base of each ball is set and golden (about 3 minutes), use two metal skewers to rotate each ball exactly 90 degrees. The uncooked batter will flow down into the mold, forming the new outer shell. Repeat the turn to reach a full 360 degrees, building up a perfectly round sphere.",
            "Step 5: The Dress. Transfer the golden, crisp takoyaki to a plate. Apply takoyaki sauce with a brush, then drizzle mayonnaise over the top. Sprinkle with aonori and add a pinch of katsuobushi, which will wave from the heat."
          ],
          classifications: {"mealType":["snack","appetizer"],"cookingMethods":["pan-frying"]},
          elementalProperties: {"Fire":0.35,"Water":0.3,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Neptune","Venus"],"signs":["pisces","taurus"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":380,"proteinG":18,"carbsG":42,"fatG":14,"fiberG":2,"sodiumMg":760,"sugarG":6,"vitamins":["Vitamin B12","Choline"],"minerals":["Iodine","Phosphorus"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0057,"entropy":0.0899,"reactivity":3.3424,"gregsEnergy":-0.2947,"kalchm":4.0,"monica":0.0636},
                    substitutions: [{"originalIngredient":"cooked octopus (tako)","substituteOptions":["shrimp","squid","melting cheese (for cheese takoyaki)"]},{"originalIngredient":"tenkasu (tempura scraps)","substituteOptions":["corn","pickled daikon"]}]
        },
        {
          name: "Zaru Soba (Cold Buckwheat Noodles)",
          description: "The purest expression of Japanese buckwheat craftsmanship: chilled soba noodles, drained on a bamboo mat (zaru), served with a cold mentsuyu dipping sauce. Every element is stripped back to showcase the earthy, nutty flavor of the noodle itself.",
          details: {"cuisine":"Japanese","prepTimeMinutes":10,"cookTimeMinutes":5,"baseServingSize":2,"spiceLevel":"None","season":["summer","spring"]},
          ingredients: [
            {"amount":200,"unit":"g","name":"dried soba noodles","notes":"High buckwheat content (juwari soba, 100% buckwheat, or at minimum 80%)."},
            {"amount":1,"unit":"cup","name":"mentsuyu dipping sauce","notes":"Concentrated noodle dipping sauce diluted to about 1:2 with cold water."},
            {"amount":2,"unit":"tbsp","name":"wasabi","notes":"Freshly grated if possible, or good-quality paste."},
            {"amount":3,"unit":"stalks","name":"scallions","notes":"Finely sliced, for mixing into the dipping sauce."},
            {"amount":1,"unit":"sheet","name":"nori seaweed","notes":"Toasted and cut into thin strips, for garnish on top of soba."},
            {"amount":1,"unit":"tbsp","name":"toasted sesame seeds","notes":"Optional garnish."}
          ],
          instructions: [
            "Step 1: The Boil. Bring a large pot of unsalted water to a vigorous boil. Add the soba noodles and cook for the time indicated on the package, typically 4-5 minutes. Do not add salt; the noodles are seasoned by the dipping sauce.",
            "Step 2: The Shock. When the soba is just cooked (tender but still with a slight bite), drain immediately into a colander. Rinse the noodles under running cold water while rubbing them gently to remove excess starch. This stops the cooking process and makes the noodles smooth and firm.",
            "Step 3: The Ice Bath. Transfer the rinsed noodles into a bowl of ice water for 30 seconds to achieve the ideal cold, firm, slightly springy texture (koshi). Drain thoroughly.",
            "Step 4: The Presentation. Arrange the cold soba noodles on a bamboo zaru tray or a plate. Top with strips of nori. Prepare the dipping sauce by diluting mentsuyu with cold water in a small cup. Place the wasabi and scallions on the side.",
            "Step 5: The Dip. The correct method of eating is to place a small amount of wasabi and scallion into the dipping cup, pick up a small bundle of noodles with chopsticks, briefly dip the tips into the sauce (not the whole bundle), and eat in one clean motion."
          ],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["boiling"]},
          elementalProperties: {"Fire":0.05,"Water":0.45,"Earth":0.35,"Air":0.15},
          astrologicalAffinities: {"planets":["Mercury","Moon"],"signs":["virgo","cancer"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":310,"proteinG":14,"carbsG":62,"fatG":2,"fiberG":4,"sodiumMg":720,"sugarG":5,"vitamins":["Thiamin","Niacin"],"minerals":["Manganese","Magnesium"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0643,"entropy":0.2583,"reactivity":1.7709,"gregsEnergy":-0.3932,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"dried soba noodles","substituteOptions":["udon noodles (for zaru udon)","rice noodles"]},{"originalIngredient":"mentsuyu dipping sauce","substituteOptions":["homemade soy sauce, mirin, and dashi blend"]}]
        },
        {
          name: "Gyudon (Beef Rice Bowl)",
          description: "A fast-moving, soulful Japanese comfort bowl of thinly sliced beef and soft onions simmered in a sweet-savory soy and mirin broth, served over a mound of steamed rice. The cooking time is under ten minutes, making it the defining example of Japanese quick cooking done with precision.",
          details: {"cuisine":"Japanese","prepTimeMinutes":10,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [
            {"amount":300,"unit":"g","name":"thinly sliced beef ribeye or chuck","notes":"Must be paper-thin, about 2mm. Freeze briefly for easier slicing at home."},
            {"amount":1,"unit":"large","name":"onion","notes":"Halved and sliced into 5mm half-moon slivers."},
            {"amount":3,"unit":"tbsp","name":"soy sauce","notes":"Regular koikuchi soy sauce."},
            {"amount":2,"unit":"tbsp","name":"mirin","notes":"For sweetness and glaze."},
            {"amount":1,"unit":"tbsp","name":"sake","notes":"For aroma and to tenderize the meat."},
            {"amount":1,"unit":"tbsp","name":"sugar","notes":"A touch of sweetness."},
            {"amount":0.5,"unit":"cup","name":"dashi stock","notes":"Kombu dashi or instant dashi is fine."},
            {"amount":2,"unit":"cups","name":"steamed Japanese rice","notes":"Hot, freshly cooked short-grain rice."},
            {"amount":1,"unit":"tbsp","name":"beni shoga (pickled red ginger)","notes":"For serving, cuts through the richness."}
          ],
          instructions: [
            "Step 1: The Broth. Combine the dashi, soy sauce, mirin, sake, and sugar in a wide, shallow pan. Bring to a simmer over medium heat.",
            "Step 2: The Onions. Add the sliced onions to the simmering broth. Cook for 4-5 minutes until they are soft, translucent, and have absorbed the flavors of the broth.",
            "Step 3: The Beef. Separate the thin slices of beef and add them to the pan over the onions. Do not stir aggressively. Cook for only 1-2 minutes until the beef just changes color; it will continue cooking in the residual heat. Overcooking makes the thin slices tough.",
            "Step 4: The Bowl. Place a generous mound of steamed rice into a large bowl. Using a ladle or large spoon, scoop the beef and onion mixture over the rice, adding a generous amount of the sweet and savory broth as well.",
            "Step 5: Serve. Top with a small mound of beni shoga on the side of the bowl. For the classic preparation, a soft-poached egg (onsen tamago) placed on top is highly traditional and recommended."
          ],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["simmering"]},
          elementalProperties: {"Fire":0.2,"Water":0.35,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Venus"],"signs":["taurus","capricorn"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":590,"proteinG":30,"carbsG":68,"fatG":18,"fiberG":2,"sodiumMg":860,"sugarG":10,"vitamins":["Vitamin B12","Niacin"],"minerals":["Iron","Zinc"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.072,"entropy":0.0767,"reactivity":0.3934,"gregsEnergy":0.0418,"kalchm":0.25,"monica":0.0767},
                    substitutions: [{"originalIngredient":"thinly sliced beef ribeye or chuck","substituteOptions":["pork belly (for butadon)","chicken thigh (for toriniku don)"]},{"originalIngredient":"dashi stock","substituteOptions":["chicken broth","water with kombu"]}]
        },
        {
          name: "Ochazuke (Tea Over Rice)",
          description: "A quietly elegant Japanese dish of leftover steamed rice revived with hot green tea or dashi poured over it, topped with simple savory garnishes. It embodies the Japanese concept of mottainai (no waste) and is the perfect late-night or post-meal comfort.",
          details: {"cuisine":"Japanese","prepTimeMinutes":5,"cookTimeMinutes":5,"baseServingSize":1,"spiceLevel":"None","season":["all"]},
          ingredients: [
            {"amount":1,"unit":"cup","name":"steamed Japanese rice","notes":"Day-old rice works perfectly."},
            {"amount":1.5,"unit":"cups","name":"hot green tea (sencha or hojicha)","notes":"Brewed strong and hot. Alternatively use hot dashi for a more savory version."},
            {"amount":1,"unit":"piece","name":"umeboshi (pickled plum)","notes":"One of the classic toppings; pit removed and torn."},
            {"amount":1,"unit":"tbsp","name":"grilled salted salmon flakes (sake flakes)","notes":"A common and satisfying topping."},
            {"amount":1,"unit":"tsp","name":"nori strips","notes":"Cut into thin shreds."},
            {"amount":1,"unit":"tsp","name":"toasted sesame seeds","notes":"For nutty aroma."},
            {"amount":0.5,"unit":"tsp","name":"wasabi","notes":"A small amount, for a gentle heat."},
            {"amount":1,"unit":"tbsp","name":"arare rice crackers","notes":"Small, for crunch."}
          ],
          instructions: [
            "Step 1: The Rice. Place the cooked rice into a wide, deep bowl. If using cold rice, briefly microwave or steam it until warm.",
            "Step 2: The Toppings. Arrange the toppings over the warm rice: a torn umeboshi, a scattering of salmon flakes, nori strips, and sesame seeds.",
            "Step 3: The Tea. Brew a fresh cup of strong green tea. Hojicha (roasted green tea) gives a nutty, low-bitterness flavor while sencha is brighter and more grassy. For a more savory version, use hot dashi instead.",
            "Step 4: The Pour. Pour the hot tea directly over the rice and toppings at the table. The heat of the tea warms the rice and gently wilts the nori.",
            "Step 5: Serve. Add a small dab of wasabi to the side and drop in the arare crackers just before eating for textural contrast. Eat immediately while the tea is hot and the crackers still have some crunch."
          ],
          classifications: {"mealType":["breakfast","lunch","dinner","snack"],"cookingMethods":["steeping","assembling"]},
          elementalProperties: {"Fire":0.1,"Water":0.5,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Mercury"],"signs":["cancer","virgo"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":230,"proteinG":9,"carbsG":38,"fatG":4,"fiberG":1,"sodiumMg":480,"sugarG":1,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Manganese","Selenium"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0664,"entropy":0.2577,"reactivity":1.9349,"gregsEnergy":-0.4321,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"hot green tea (sencha or hojicha)","substituteOptions":["hot dashi","hot kombu water"]},{"originalIngredient":"umeboshi (pickled plum)","substituteOptions":["salted cod roe (mentaiko)","pickled daikon"]}]
        },
        {
          name: "Tamago Kake Gohan (Raw Egg Over Rice)",
          description: "The simplest and most intimate of Japanese breakfasts: a raw egg cracked over a bowl of scorching hot freshly cooked rice, seasoned with soy sauce. The heat of the rice partially cooks the egg, creating a rich, silky, golden coating around every grain. It is a dish of absolute trust in ingredient quality.",
          details: {"cuisine":"Japanese","prepTimeMinutes":2,"cookTimeMinutes":0,"baseServingSize":1,"spiceLevel":"None","season":["all"]},
          ingredients: [
            {"amount":1,"unit":"cup","name":"freshly steamed Japanese short-grain rice","notes":"Must be freshly cooked and screaming hot. This is essential; cold rice will not cook the egg properly."},
            {"amount":1,"unit":"large","name":"egg","notes":"Must be the freshest possible, ideally a Japanese tamago or farm-fresh egg."},
            {"amount":1,"unit":"tsp","name":"soy sauce","notes":"High quality; use a lighter tamari or dashi-soy for a more delicate flavor."},
            {"amount":0.5,"unit":"tsp","name":"mirin","notes":"Optional, for a very subtle sweetness."},
            {"amount":1,"unit":"sheet","name":"nori seaweed","notes":"Optional, torn into small pieces."},
            {"amount":1,"unit":"pinch","name":"toasted sesame seeds","notes":"Optional garnish."}
          ],
          instructions: [
            "Step 1: The Rice. Scoop freshly cooked, piping-hot rice into a bowl. The rice temperature is the cooking instrument; do not use leftover or reheated rice.",
            "Step 2: The Egg. Crack the egg directly over the center of the hot rice. You may separate the white from the yolk first, if preferred: add just the yolk for maximum richness and discard the white, or whisk the whole egg separately for an airier texture.",
            "Step 3: The Mix. Add the soy sauce over the egg and rice. Using chopsticks, quickly break the yolk and fold the egg vigorously into the rice. The heat of the rice will begin to cook the white while the yolk remains creamy.",
            "Step 4: The Fold. Continue mixing until the egg forms a light, golden, slightly foamy coating around the rice grains. The result should be a loose, creamy, unified mixture, not scrambled egg on rice.",
            "Step 5: Serve. Top with torn nori and sesame seeds. Eat immediately while warm. The entire dish should be eaten within 2 minutes of preparation."
          ],
          classifications: {"mealType":["breakfast"],"cookingMethods":["assembling"]},
          elementalProperties: {"Fire":0.15,"Water":0.3,"Earth":0.45,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["leo","cancer"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":310,"proteinG":14,"carbsG":44,"fatG":8,"fiberG":0,"sodiumMg":380,"sugarG":1,"vitamins":["Choline","Vitamin B12","Vitamin D"],"minerals":["Selenium","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1259,"entropy":0.1365,"reactivity":1.0095,"gregsEnergy":-0.0119,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"egg","substituteOptions":["onsen tamago (slow-poached egg) for a safer alternative"]},{"originalIngredient":"soy sauce","substituteOptions":["tamari","ponzu"]}]
        },
        {
          name: "Nikujaga (Meat and Potato Stew)",
          description: "A deeply comforting Japanese home-style stew of thinly sliced beef, potatoes, onions, and shirataki noodles braised together in a sweet soy and mirin broth. It is considered the definitive example of Japanese home cooking, evoking nostalgia and warmth.",
          details: {"cuisine":"Japanese","prepTimeMinutes":15,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["winter","autumn"]},
          ingredients: [
            {"amount":300,"unit":"g","name":"thinly sliced beef","notes":"Ribeye or chuck, sliced paper-thin."},
            {"amount":3,"unit":"medium","name":"potatoes","notes":"Peeled and cut into large, bite-sized chunks. Soak in water to remove starch."},
            {"amount":1,"unit":"large","name":"onion","notes":"Sliced into thick wedges."},
            {"amount":1,"unit":"medium","name":"carrot","notes":"Sliced into thick diagonal rounds."},
            {"amount":1,"unit":"pack","name":"shirataki noodles","notes":"Konnyaku noodles, drained and briefly blanched to remove odor."},
            {"amount":3,"unit":"tbsp","name":"soy sauce","notes":"For the braising broth."},
            {"amount":2,"unit":"tbsp","name":"mirin","notes":"For sweetness and gloss."},
            {"amount":1,"unit":"tbsp","name":"sake","notes":"For aroma."},
            {"amount":1,"unit":"tbsp","name":"sugar","notes":"Enhances the sweetness of the broth."},
            {"amount":1.5,"unit":"cups","name":"dashi stock","notes":"The foundation of the braising liquid."},
            {"amount":1,"unit":"tsp","name":"vegetable oil","notes":"For briefly sauteing the beef."}
          ],
          instructions: [
            "Step 1: The Beef. Heat a drop of oil in a wide pot or Dutch oven over medium-high heat. Add the thinly sliced beef and cook briefly, just until no longer pink. Do not fully cook it at this stage.",
            "Step 2: The Broth. Add the dashi, soy sauce, mirin, sake, and sugar to the pot. Stir to combine and bring to a simmer.",
            "Step 3: The Vegetables. Add the potatoes, onions, and carrot to the simmering broth. Bring back to a simmer, then reduce heat to medium-low.",
            "Step 4: The Braise. Place a drop lid (otoshibuta) or a piece of parchment paper cut to fit inside the pot directly on top of the ingredients. This maintains even, gentle heat and ensures all the components absorb the broth evenly. Simmer for 20-25 minutes until the potatoes are completely tender and have absorbed the broth.",
            "Step 5: The Finish. Add the blanched shirataki noodles and cook for a final 5 minutes. Check seasoning. Serve in deep bowls with ample broth and a side of steamed rice."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["braising","simmering"]},
          elementalProperties: {"Fire":0.15,"Water":0.45,"Earth":0.35,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Moon"],"signs":["capricorn","cancer"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":440,"proteinG":26,"carbsG":52,"fatG":12,"fiberG":5,"sodiumMg":820,"sugarG":8,"vitamins":["Vitamin C","Vitamin B12"],"minerals":["Potassium","Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.069,"entropy":0.071,"reactivity":0.4033,"gregsEnergy":0.0404,"kalchm":0.25,"monica":0.0722},
                    substitutions: [{"originalIngredient":"thinly sliced beef","substituteOptions":["pork belly (more traditional in Osaka)","chicken thigh"]},{"originalIngredient":"shirataki noodles","substituteOptions":["snap peas","green beans"]}]
        },
      ],
      winter: [
        {
          "name": "Authentic Sukiyaki",
          "description": "A ceremonial one-pot 'Nabemono' dish. The alchemy involves 'searing-braising' paper-thin marbled beef in a high-sugar soy broth (Warishita). The ingredients are cooked sequentially in a cast-iron pot at the table, then dipped into raw, whisked egg to provide a cooling, velvety mantle.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "thinly sliced marbled beef (Ribeye)",
              "notes": "Must be paper-thin."
            },
            {
              "amount": 1,
              "unit": "block",
              "name": "firm tofu",
              "notes": "Grilled (Yaki-dofu) and cubed."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "Shungiku (chrysanthemum greens)",
              "notes": "Or spinach."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "Shiitake mushrooms",
              "notes": "Stems removed, tops scored."
            },
            {
              "amount": 1,
              "unit": "pack",
              "name": "Shirataki noodles",
              "notes": "Konnyaku noodles."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "soy sauce",
              "notes": "For the Warishita."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "mirin",
              "notes": "For the Warishita."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "Sukiyaki is characterized by its high sugar content."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Fresh, for dipping."
            }
          ],
          "instructions": [
            "Step 1: The Warishita. Mix soy sauce, mirin, sake, and sugar in a jug.",
            "Step 2: The Sear. Rub a piece of beef fat over a hot cast-iron pot. Sear a few slices of beef. Pour in a little Warishita to glaze them. Eat these first.",
            "Step 3: The Assembly. Arrange the tofu, mushrooms, noodles, and greens in distinct sections of the pot. Pour in the remaining Warishita.",
            "Step 4: Simmer. Add more beef slices. Simmer briefly until the greens wilt. Do not overcook the beef.",
            "Step 5: The Ritual. Crack a raw egg into a small bowl and whisk it. Dip the hot beef and vegetables into the raw egg before eating."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "celebration"
            ],
            "cookingMethods": [
              "searing",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.25,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 620,
            "proteinG": 38,
            "carbsG": 35,
            "fatG": 38,
            "fiberG": 4,
            "sodiumMg": 1400,
            "sugarG": 22,
            "vitamins": [
              "Vitamin B12",
              "Zinc"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1598,"entropy":0.1742,"reactivity":1.2988,"gregsEnergy":-0.0664,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "beef",
              "substituteOptions": [
                "sliced seitan",
                "king oyster mushrooms (vegan)"
              ]
            }
          ]
        },
        {
          name: "Ramen",
          description: "A profound Japanese noodle soup where the alchemy of slow-simmered broth, alkaline noodles, and umami-rich tare creates a deeply restorative and complex sensory experience.",
          details: {"cuisine":"Japanese","prepTimeMinutes":45,"cookTimeMinutes":720,"baseServingSize":2,"spiceLevel":"Medium","season":["winter","autumn"]},
          ingredients: [{"amount":4,"unit":"cups","name":"Pork and chicken bone broth","notes":"Simmered for 12 hours for rich mouthfeel."},{"amount":2,"unit":"portions","name":"Alkaline wheat noodles","notes":"Kansui gives them their distinct chew and yellow hue."},{"amount":4,"unit":"tbsp","name":"Shoyu tare","notes":"A concentrated seasoning blend of soy sauce, mirin, and kombu."},{"amount":4,"unit":"slices","name":"Chashu pork","notes":"Braised pork belly, rolled and sliced."},{"amount":1,"unit":"whole","name":"Ajitsuke Tamago","notes":"Soft-boiled egg marinated in soy and mirin."},{"amount":2,"unit":"tbsp","name":"Scallions","notes":"Finely chopped for aromatic sharpness."}],
          instructions: ["Step 1: The Broth. Bring the long-simmered bone broth to a rolling boil, ensuring the fat is fully emulsified into the liquid.","Step 2: The Tare. Place 2 tablespoons of the concentrated shoyu tare into the bottom of each warmed serving bowl.","Step 3: The Noodles. Boil the alkaline noodles in unsalted water for exactly 60 seconds to maintain a firm, toothsome 'katame' texture.","Step 4: The Assembly. Vigorously pour the boiling broth over the tare to mix them instantly, then fold the drained noodles into the broth, arranging them neatly.","Step 5: The Toppings. Carefully lay the chashu slices, halved marinated egg, and scallions over the noodles. Serve immediately while fiercely hot."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","boiling","braising"]},
          elementalProperties: {"Fire":0.25,"Water":0.5,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Pluto","Moon"],"signs":["scorpio","cancer"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":850,"proteinG":35,"carbsG":65,"fatG":45,"fiberG":4,"sodiumMg":1500,"sugarG":5,"vitamins":["Vitamin B12","Niacin"],"minerals":["Iron","Zinc"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0028,"entropy":0.0034,"reactivity":0.9351,"gregsEnergy":-0.0004,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Chashu pork","substituteOptions":["Braised tofu","Roasted chicken"]}]
        },
      ],
      summer: [
        {
          name: "Yakitori Assortment",
          description: "The essence of Japanese grilling: skewered chicken, meticulously butchered into specific cuts, grilled over binchotan charcoal for extreme, clean heat that crisps the exterior while locking in the juices.",
          details: {"cuisine":"Japanese","prepTimeMinutes":30,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["summer","spring"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Chicken thighs","notes":"Deboned and cut into uniform bite-sized pieces."},{"amount":0.5,"unit":"lb","name":"Chicken meatballs (Tsukune)","notes":"Minced chicken with cartilage for texture."},{"amount":4,"unit":"stalks","name":"Tokyo negi (scallions)","notes":"Cut into 1-inch pieces."},{"amount":0.5,"unit":"cup","name":"Tare sauce","notes":"Thickened soy, mirin, sake, and sugar glaze."},{"amount":1,"unit":"pinch","name":"Shichimi togarashi","notes":"Seven-spice blend for finishing."}],
          instructions: ["Step 1: Butchery. Cut the chicken thighs with exacting precision so all pieces are uniform, ensuring even cooking. Alternate meat and negi on bamboo skewers.","Step 2: The Fire. Prepare a binchotan charcoal grill. The coals must be white-hot but producing no flames, emitting pure infrared heat.","Step 3: The Grill. Place the skewers over the heat. Rotate frequently, allowing the rendering fat to drop and smoke, flavoring the meat without causing flare-ups.","Step 4: The Glaze. For tare-flavored skewers, dip them into the thick tare sauce when they are 80% cooked, then return to the grill to caramelize the sugars.","Step 5: The Finish. Serve immediately, straight from the grill, sprinkled lightly with shichimi togarashi or salt depending on the cut."],
          classifications: {"mealType":["dinner","snack"],"cookingMethods":["grilling"]},
          elementalProperties: {"Fire":0.6,"Water":0.1,"Earth":0.2,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":38,"carbsG":12,"fatG":22,"fiberG":1,"sodiumMg":680,"sugarG":8,"vitamins":["Niacin","Vitamin B6"],"minerals":["Selenium","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.2361,"entropy":0.259,"reactivity":1.6528,"gregsEnergy":-0.1919,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Chicken thighs","substituteOptions":["Pork belly","Shiitake mushrooms"]}]
        },
        {
          name: "Oyakodon (Chicken and Egg Rice Bowl)",
          description: "A poetic Japanese comfort dish whose name translates to parent and child, referring to the chicken and egg cooked together. Chicken thighs and onion are simmered in a dashi-soy broth, then eggs are drizzled in at the last moment and cooked to a barely-set, silky, custard-like state before being slid over rice.",
          details: {"cuisine":"Japanese","prepTimeMinutes":10,"cookTimeMinutes":12,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [
            {"amount":300,"unit":"g","name":"chicken thighs","notes":"Boneless, skinless. Cut into bite-sized pieces on a slight diagonal for more surface area."},
            {"amount":1,"unit":"medium","name":"onion","notes":"Halved and thinly sliced into half-moon slivers."},
            {"amount":4,"unit":"large","name":"eggs","notes":"Lightly whisked in a bowl. Do not overmix; some streaks of white and yolk are ideal for a layered result."},
            {"amount":0.5,"unit":"cup","name":"dashi stock","notes":"Awase dashi from kombu and katsuobushi."},
            {"amount":2.5,"unit":"tbsp","name":"soy sauce","notes":"Regular koikuchi soy sauce."},
            {"amount":2,"unit":"tbsp","name":"mirin","notes":"For sweetness and glossy finish."},
            {"amount":0.5,"unit":"tbsp","name":"sake","notes":"For aroma and to tenderize the chicken."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"A small amount to round out the broth."},
            {"amount":2,"unit":"cups","name":"steamed Japanese rice","notes":"Hot, freshly cooked."},
            {"amount":1,"unit":"tbsp","name":"mitsuba or scallion","notes":"For garnish, finely sliced."}
          ],
          instructions: [
            "Step 1: The Broth. In a wide, shallow oyakodon pan or small skillet (one per serving), combine the dashi, soy sauce, mirin, sake, and sugar. Bring to a simmer over medium heat.",
            "Step 2: The Chicken. Add the sliced onion to the simmering broth and cook for 2-3 minutes until softened. Add the chicken pieces in a single layer over the onions. Cook for 4-5 minutes, turning once, until the chicken is just cooked through.",
            "Step 3: The Egg. Pour two-thirds of the beaten egg in a slow, circular motion over the chicken and onions. Do not stir. Cover the pan immediately and cook for 45 seconds over medium heat.",
            "Step 4: The Second Pour. Drizzle the remaining egg over the top and immediately cover the pan again. Turn off the heat. The residual heat will set the second pour to a creamy, barely-cooked, translucent consistency. This two-stage egg technique is the critical step for the correct texture.",
            "Step 5: The Serve. The eggs should be 70% set: the bottom layer fully cooked and the top layer still trembling and soft. Slide the entire contents of the pan over a bowl of hot rice in one motion. Garnish with mitsuba or scallion. Eat immediately."
          ],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["simmering"]},
          elementalProperties: {"Fire":0.15,"Water":0.4,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","libra"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":510,"proteinG":36,"carbsG":52,"fatG":14,"fiberG":2,"sodiumMg":780,"sugarG":7,"vitamins":["Choline","Vitamin B12","Niacin"],"minerals":["Selenium","Phosphorus","Iron"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.001,"entropy":0.0014,"reactivity":0.7592,"gregsEnergy":-0.0001,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"chicken thighs","substituteOptions":["salmon (for sake don)","ground pork"]},{"originalIngredient":"mitsuba","substituteOptions":["scallions","shiso leaves"]}]
        },
        {
          name: "Okonomiyaki",
          description: "A savory, highly customizable Japanese cabbage pancake, bound by a yam-infused batter and griddled to develop a crisp exterior while maintaining a soft, steamy interior, finished with an iconic crosshatch of sauces.",
          details: {"cuisine":"Japanese","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Cabbage","notes":"Finely shredded."},{"amount":1,"unit":"cup","name":"Okonomiyaki flour","notes":"Wheat flour mixed with nagaimo (mountain yam) powder for aeration."},{"amount":0.75,"unit":"cup","name":"Dashi stock","notes":"Cooled, to hydrate the batter."},{"amount":2,"unit":"large","name":"Eggs","notes":"For binding."},{"amount":4,"unit":"slices","name":"Pork belly","notes":"Thinly sliced."},{"amount":2,"unit":"tbsp","name":"Tenkasu","notes":"Tempura scraps for internal crunch."},{"amount":3,"unit":"tbsp","name":"Okonomiyaki sauce","notes":"Thick, sweet, and savory."},{"amount":2,"unit":"tbsp","name":"Kewpie mayonnaise","notes":"Rich, egg-yolk-heavy mayo."},{"amount":1,"unit":"pinch","name":"Katsuobushi and Aonori","notes":"Bonito flakes and dried seaweed powder for garnish."}],
          instructions: ["Step 1: The Batter. Whisk the okonomiyaki flour with the cool dashi stock. Let it rest for 10 minutes, then gently fold in the eggs, shredded cabbage, and tenkasu. Do not overmix; air must remain in the batter.","Step 2: The Griddle. Heat a teppan or large cast-iron skillet to 400°F (200°C). Pour the batter onto the hot surface, shaping it into a thick, 1-inch high circle.","Step 3: The Pork. Lay the thin slices of pork belly over the top of the uncooked batter.","Step 4: The Flip. Once the bottom is deeply browned (about 5 minutes), flip the pancake confidently. Press down lightly to crisp the pork belly.","Step 5: The Dress. When fully cooked, transfer to a plate. Brush generously with okonomiyaki sauce. Squeeze the mayonnaise over it in a crosshatch pattern. Sprinkle with aonori and top with katsuobushi, which will dance in the heat."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["griddling","pan-frying"]},
          elementalProperties: {"Fire":0.3,"Water":0.2,"Earth":0.35,"Air":0.15},
          astrologicalAffinities: {"planets":["Venus","Jupiter"],"signs":["taurus","sagittarius"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":550,"proteinG":22,"carbsG":45,"fatG":32,"fiberG":5,"sodiumMg":950,"sugarG":12,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Potassium","Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0796,"entropy":0.0883,"reactivity":2.8272,"gregsEnergy":-0.17,"kalchm":4.0,"monica":0.0434},
                    substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Shrimp","Mochi"]}]
        },
        {
          name: "Tempura",
          description: "The delicate art of deep-frying, where ice-cold, barely-mixed batter meets hot oil to create a lacework of shattering crispness around perfectly steamed seafood and vegetables.",
          details: {"cuisine":"Japanese","prepTimeMinutes":20,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Cake flour","notes":"Low-protein flour to prevent gluten development."},{"amount":1,"unit":"cup","name":"Ice water","notes":"Must be ice-cold to shock the batter and create crispness."},{"amount":1,"unit":"large","name":"Egg yolk","notes":"For richness and binding."},{"amount":8,"unit":"large","name":"Shrimp","notes":"Peeled, deveined, with tails on; scored to stay straight."},{"amount":1,"unit":"cup","name":"Assorted vegetables","notes":"Sweet potato, eggplant, shiso leaves."},{"amount":4,"unit":"cups","name":"Frying oil","notes":"Light vegetable oil mixed with a touch of sesame oil."},{"amount":0.5,"unit":"cup","name":"Tentsuyu","notes":"Dipping sauce made from dashi, soy, and mirin."}],
          instructions: ["Step 1: Preparation. Score the underside of the shrimp to prevent curling. Slice all vegetables into uniform, quick-cooking pieces.","Step 2: The Oil. Heat the oil to exactly 340°F (170°C) for vegetables, and 350°F (175°C) for seafood. Temperature control is the absolute essence of tempura.","Step 3: The Batter. In a chilled bowl, beat the egg yolk with the ice water. Sift the cake flour over the liquid and barely mix with chopsticks. Lumps of flour must remain; overmixing creates a heavy, doughy crust.","Step 4: The Fry. Dip the ingredients lightly in flour, then into the cold batter. Drop gently into the hot oil. Fry in small batches to avoid dropping the oil temperature.","Step 5: The Skim. Continuously skim the loose batter bits (tenkasu) from the oil. Remove the tempura when the bubbling subsides (indicating water has evaporated). Serve immediately with warm tentsuyu."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["deep-frying"]},
          elementalProperties: {"Fire":0.45,"Water":0.15,"Earth":0.1,"Air":0.3},
          astrologicalAffinities: {"planets":["Uranus","Mercury"],"signs":["aquarius","gemini"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":480,"proteinG":20,"carbsG":40,"fatG":28,"fiberG":3,"sodiumMg":520,"sugarG":2,"vitamins":["Vitamin A","Vitamin E"],"minerals":["Iodine","Copper"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0954,"entropy":0.4528,"reactivity":2.7397,"gregsEnergy":-1.1452,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Shrimp","substituteOptions":["Kabocha squash","Mushroom"]}]
        },
        {
          name: "Udon Noodle Soup",
          description: "A comforting bowl of thick, chewy, dramatically satisfying wheat noodles suspended in a translucent, deeply savory dashi broth, embodying the concept of 'koshi' (the perfect texture).",
          details: {"cuisine":"Japanese","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["winter","autumn"]},
          ingredients: [{"amount":2,"unit":"portions","name":"Fresh or frozen udon noodles","notes":"Thick wheat noodles with a strong, elastic bite."},{"amount":4,"unit":"cups","name":"Dashi","notes":"Clear broth made from kombu and katsuobushi."},{"amount":2,"unit":"tbsp","name":"Usukuchi soy sauce","notes":"Light-colored soy sauce to keep the broth translucent."},{"amount":2,"unit":"tbsp","name":"Mirin","notes":"For subtle sweetness and depth."},{"amount":2,"unit":"pieces","name":"Kamaboko","notes":"Sliced fish cake with a pink edge."},{"amount":2,"unit":"tbsp","name":"Scallions","notes":"Finely sliced."}],
          instructions: ["Step 1: The Broth (Tsuyu). In a saucepan, gently heat the dashi. Add the usukuchi soy sauce and mirin. Bring to a bare simmer; do not boil aggressively, which clouds the broth and destroys the delicate aromas.","Step 2: The Noodles. In a separate large pot of boiling water, cook the udon noodles until they are heated through but retain a strong, chewy center (koshi). Drain completely.","Step 3: The Assembly. Divide the hot noodles into large, warmed serving bowls. The noodles should fold beautifully upon themselves.","Step 4: The Pour. Ladle the hot, fragrant broth over the noodles until they are just submerged.","Step 5: The Garnish. Top elegantly with slices of kamaboko and a generous scattering of sharp scallions. Serve immediately."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["simmering","boiling"]},
          elementalProperties: {"Fire":0.15,"Water":0.6,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":380,"proteinG":12,"carbsG":75,"fatG":2,"fiberG":3,"sodiumMg":1100,"sugarG":4,"vitamins":["Folate","Thiamin"],"minerals":["Manganese","Selenium"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.001,"entropy":0.0734,"reactivity":4.0775,"gregsEnergy":-0.2984,"kalchm":4.0,"monica":0.0528},
                    substitutions: [{"originalIngredient":"Kamaboko","substituteOptions":["Fried tofu (Abura-age)","Poached egg"]}]
        },
        {
          name: "Tonkatsu",
          description: "A mastery of contrasting textures: a thick cut of pork, breaded in large, airy panko crumbs, and deep-fried to create a shatteringly crisp armor over impossibly tender, juicy meat.",
          details: {"cuisine":"Japanese","prepTimeMinutes":15,"cookTimeMinutes":12,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cuts","name":"Pork loin chops","notes":"About 3/4 inch thick. The fat cap should be scored to prevent curling."},{"amount":0.5,"unit":"cup","name":"All-purpose flour","notes":"For the initial dredge."},{"amount":1,"unit":"large","name":"Egg","notes":"Beaten, to adhere the panko."},{"amount":1.5,"unit":"cups","name":"Panko breadcrumbs","notes":"Fresh, large-flake panko creates the iconic spikey texture."},{"amount":3,"unit":"cups","name":"Frying oil","notes":"Neutral oil."},{"amount":2,"unit":"cups","name":"Cabbage","notes":"Shredded as finely as possible (hair-like) and soaked in ice water."},{"amount":3,"unit":"tbsp","name":"Tonkatsu sauce","notes":"A thick, fruity, savory-sweet sauce."}],
          instructions: ["Step 1: The Meat. Take the pork chops and make several small cuts along the fat and connective tissue on the edge. This severs the bands that cause the meat to curl when frying. Pound the meat slightly to tenderize, then season aggressively with salt and pepper.","Step 2: The Breading. Dredge the pork thoroughly in flour, shaking off the excess. Dip it completely into the beaten egg, then lay it into the panko. Press the panko firmly into the meat so every millimeter is covered with the jagged crumbs.","Step 3: The Fry. Heat the oil in a heavy pot to 340°F (170°C). Carefully lower the pork into the oil. Fry for 5-6 minutes, flipping halfway, until the crust is a deep, majestic golden brown.","Step 4: The Rest. Remove the tonkatsu and place it on a wire rack. This resting period (about 3-4 minutes) is crucial; carryover heat finishes cooking the center while the crust remains dry and crisp.","Step 5: The Serve. Slice the pork into 1-inch strips. Serve alongside a mountain of ice-cold, hyper-crisp shredded cabbage. Drizzle the tonkatsu sauce generously over the meat."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["deep-frying","breading"]},
          elementalProperties: {"Fire":0.4,"Water":0.1,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Mars"],"signs":["capricorn","aries"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":680,"proteinG":42,"carbsG":45,"fatG":35,"fiberG":4,"sodiumMg":750,"sugarG":8,"vitamins":["Thiamin","Vitamin B6"],"minerals":["Zinc","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0895,"entropy":0.0955,"reactivity":0.3785,"gregsEnergy":0.0534,"kalchm":0.25,"monica":0.1017},
                    substitutions: [{"originalIngredient":"Pork loin chops","substituteOptions":["Chicken breast (for Chicken Katsu)","Firm tofu"]}]
        },
        {
          name: "Chawanmushi",
          description: "A delicate, ethereal savory egg custard, steamed in a teacup. It relies on a high ratio of dashi to egg, resulting in a wobbly, silken texture that suspends elegant morsels of seafood, chicken, and aromatics.",
          details: {"cuisine":"Japanese","prepTimeMinutes":15,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"large","name":"Eggs","notes":"Fresh."},{"amount":1.5,"unit":"cups","name":"Dashi","notes":"High quality, cooled to room temperature."},{"amount":1,"unit":"tbsp","name":"Usukuchi soy sauce","notes":"Light soy sauce."},{"amount":1,"unit":"tsp","name":"Mirin","notes":"For subtle sweetness."},{"amount":2,"unit":"pieces","name":"Shrimp","notes":"Peeled and deveined."},{"amount":2,"unit":"pieces","name":"Chicken thigh","notes":"Bite-sized chunks."},{"amount":2,"unit":"slices","name":"Kamaboko","notes":"Fish cake."},{"amount":1,"unit":"piece","name":"Shiitake mushroom","notes":"Sliced."},{"amount":2,"unit":"leaves","name":"Mitsuba","notes":"Japanese parsley, or cilantro as substitute."}],
          instructions: ["Step 1: The Base. In a bowl, gently beat the eggs. You must break up the proteins without incorporating air; no foam should form. Whisk in the cooled dashi, soy sauce, and mirin.","Step 2: The Strain. Pour the egg mixture through a fine-mesh sieve. This step is non-negotiable; it removes the chalazae and any unmixed albumen, ensuring a flawless, silken texture.","Step 3: The Assembly. Divide the chicken, shrimp, shiitake, and kamaboko among two heat-proof teacups or ramekins. Pour the strained egg mixture over the ingredients, filling the cups near the top.","Step 4: The Steam. Cover each cup individually with foil to prevent condensation from dripping in. Place in a steamer over gently simmering (not violently boiling) water. Steam for 15-20 minutes. Aggressive heat will cause the egg to curdle and become porous instead of smooth.","Step 5: The Test. The custard is done when it is set but jiggles like soft tofu, and a skewer inserted comes out clean with clear liquid. Top with mitsuba leaf and serve immediately."],
          classifications: {"mealType":["appetizer","side"],"cookingMethods":["steaming"]},
          elementalProperties: {"Fire":0.1,"Water":0.5,"Earth":0.1,"Air":0.3},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","libra"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":180,"proteinG":18,"carbsG":6,"fatG":9,"fiberG":1,"sodiumMg":650,"sugarG":3,"vitamins":["Choline","Vitamin D"],"minerals":["Selenium","Phosphorus"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0047,"reactivity":0.9864,"gregsEnergy":-0.0042,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Shrimp","substituteOptions":["Ginkgo nuts","Extra mushrooms"]}]
        },
        {
          name: "Yakitori",
          description: "Bite-sized chicken pieces (thigh, skin, cartilage, heart) threaded on bamboo skewers and grilled over bincho-tan charcoal, basted with tare (sweet soy glaze) or simply salted with shio.",
          details: {"cuisine":"Japanese","prepTimeMinutes":30,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":500,"unit":"g","name":"chicken thigh","notes":"Cut into bite-sized pieces, skin on for some skewers."},{"amount":8,"unit":"sticks","name":"bamboo skewers","notes":"Soaked in water for 30 minutes to prevent burning."},{"amount":3,"unit":"tbsp","name":"soy sauce","notes":"For the tare glaze base."},{"amount":2,"unit":"tbsp","name":"mirin","notes":"Adds sweetness and gloss to the tare."},{"amount":1,"unit":"tbsp","name":"sake","notes":"Deepens the savory character of the glaze."},{"amount":1,"unit":"tbsp","name":"sugar","notes":"Balances the salt in the tare."},{"amount":1,"unit":"tsp","name":"flaky sea salt","notes":"For shio-style skewers, applied just before grilling."},{"amount":1,"unit":"pinch","name":"shichimi togarashi","notes":"Optional seven-spice blend for finishing."}],
          instructions: ["Step 1: The Tare. Combine soy sauce, mirin, sake, and sugar in a small saucepan. Bring to a boil, then reduce heat and simmer for 8-10 minutes until the glaze thickens enough to coat the back of a spoon. Set aside to cool slightly.","Step 2: The Skewering. Thread chicken pieces onto soaked bamboo skewers, alternating between thigh meat and skin pieces. Keep pieces uniform in size for even cooking. Compact them tightly so edges touch.","Step 3: The Seasoning. Decide each skewer as tare or shio. For shio skewers, season generously with flaky salt on both sides. For tare skewers, leave unseasoned for now.","Step 4: The Grill. Grill skewers over high direct heat (charcoal preferred) for 3-4 minutes per side, turning frequently. For tare skewers, brush with glaze during the last 2 minutes, turning and basting repeatedly to build up a lacquered coating.","Step 5: The Serve. Transfer to a plate immediately. Give tare skewers one final brush of glaze. Dust shio skewers with shichimi togarashi if desired. Serve hot alongside cold beer or highball."],
          classifications: {"mealType":["dinner","snack"],"cookingMethods":["grilling"]},
          elementalProperties: {"Fire":0.45,"Water":0.1,"Earth":0.25,"Air":0.2},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":350,"proteinG":28,"carbsG":8,"fatG":22,"fiberG":0,"sodiumMg":720,"sugarG":5,"vitamins":["Niacin","Vitamin B6"],"minerals":["Iron","Zinc","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1849,"entropy":0.225,"reactivity":1.4416,"gregsEnergy":-0.1394,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"chicken thigh","substituteOptions":["chicken breast","chicken hearts","chicken skin skewers"]},{"originalIngredient":"bamboo skewers","substituteOptions":["metal skewers"]}]
        },
        {
          name: "Miso Ramen",
          description: "Rich pork bone broth blended with fermented miso paste, topped with chashu pork, soft-boiled egg (ajitama), corn, butter, bean sprouts, scallions, and nori.",
          details: {"cuisine":"Japanese","prepTimeMinutes":30,"cookTimeMinutes":480,"baseServingSize":2,"spiceLevel":"Medium","season":["winter","autumn"]},
          ingredients: [{"amount":1,"unit":"kg","name":"pork bones","notes":"Femur and neck bones, blanched and scrubbed clean for a milky tonkotsu base."},{"amount":3,"unit":"tbsp","name":"white miso paste","notes":"Aka or awase miso also works. Adds fermented depth and salinity."},{"amount":2,"unit":"portions","name":"fresh ramen noodles","notes":"Wavy, medium-thick. Cook separately and drain just before serving."},{"amount":200,"unit":"g","name":"chashu pork belly","notes":"Braised in soy, mirin, and sake until meltingly tender, then sliced."},{"amount":2,"unit":"whole","name":"soft-boiled eggs","notes":"Marinated overnight in soy-mirin brine for ajitama."},{"amount":1,"unit":"tbsp","name":"unsalted butter","notes":"A pat per bowl, Sapporo-style. Melts into the broth."},{"amount":0.5,"unit":"cup","name":"sweet corn kernels","notes":"Adds sweetness that contrasts the salty miso."},{"amount":1,"unit":"cup","name":"bean sprouts","notes":"Raw or briefly blanched for crunch."},{"amount":2,"unit":"sheets","name":"nori","notes":"Toasted seaweed, tucked into the side of each bowl."},{"amount":2,"unit":"stalks","name":"scallions","notes":"Thinly sliced for garnish."}],
          instructions: ["Step 1: The Broth. Blanch pork bones in boiling water for 10 minutes, then drain and scrub off any scum. Return to a clean pot, cover with fresh water, and boil aggressively for 6-8 hours, adding water as needed, until the broth turns opaque and creamy white.","Step 2: The Tare. In a separate pan, heat a splash of sesame oil and fry minced garlic and ginger until fragrant. Add miso paste and stir constantly for 2 minutes to deepen its flavor without burning. Set aside as the flavor base.","Step 3: The Assembly. Cook ramen noodles in rapidly boiling water for 60-90 seconds until just al dente. Drain thoroughly and shake dry. Place the miso tare in the bottom of each bowl.","Step 4: The Pour. Ladle the boiling pork broth over the tare and stir vigorously to dissolve. Add the drained noodles to the center of each bowl.","Step 5: The Toppings. Arrange chashu slices, halved ajitama egg, corn, bean sprouts, a pat of butter, nori sheets, and sliced scallions on top. Serve immediately while the broth is still rolling hot."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["boiling","simmering","braising"]},
          elementalProperties: {"Fire":0.3,"Water":0.35,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Moon"],"signs":["scorpio","cancer"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":680,"proteinG":32,"carbsG":65,"fatG":32,"fiberG":4,"sodiumMg":1200,"sugarG":6,"vitamins":["Vitamin B12","Niacin","Folate"],"minerals":["Iron","Zinc","Manganese"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0041,"entropy":0.0047,"reactivity":0.8341,"gregsEnergy":0.0001,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"pork bones","substituteOptions":["chicken bones (for tori paitan)","vegetable stock with soy milk (for vegan)"]},{"originalIngredient":"chashu pork belly","substituteOptions":["braised chicken thigh","marinated tofu"]}]
        },
        {
          name: "Katsudon (Breaded Pork Cutlet Rice Bowl)",
          description: "A triumphant Japanese rice bowl that takes the already-spectacular Tonkatsu and transforms it into something even more comforting: the fried cutlet is sliced and simmered briefly in a sweet dashi-soy broth with onions and softly set egg before being poured over rice. The panko crust softens slightly to absorb the broth while retaining its character.",
          details: {"cuisine":"Japanese","prepTimeMinutes":20,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [
            {"amount":2,"unit":"cuts","name":"pork loin chops","notes":"About 3/4 inch thick, fat scored. Used to make Tonkatsu first."},
            {"amount":0.5,"unit":"cup","name":"all-purpose flour","notes":"For dredging the pork."},
            {"amount":1,"unit":"large","name":"egg for breading","notes":"Beaten, for the breading stage."},
            {"amount":1.5,"unit":"cups","name":"panko breadcrumbs","notes":"Fresh, large-flake panko for maximum crunch."},
            {"amount":3,"unit":"cups","name":"frying oil","notes":"Neutral oil for deep-frying the cutlets."},
            {"amount":1,"unit":"medium","name":"onion","notes":"Halved and thinly sliced."},
            {"amount":4,"unit":"large","name":"eggs for topping","notes":"Lightly beaten, for the egg finish."},
            {"amount":0.5,"unit":"cup","name":"dashi stock","notes":"The braising liquid base."},
            {"amount":3,"unit":"tbsp","name":"soy sauce","notes":"For the braising broth."},
            {"amount":2,"unit":"tbsp","name":"mirin","notes":"For sweetness and gloss."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"Rounds the broth flavor."},
            {"amount":2,"unit":"cups","name":"steamed Japanese rice","notes":"Hot, freshly cooked."}
          ],
          instructions: [
            "Step 1: The Tonkatsu. Score the fat cap of each pork chop. Season with salt and pepper. Bread in flour, beaten egg, and panko, pressing firmly. Deep-fry in oil at 340 degrees F (170 degrees C) for 5-6 minutes until deeply golden. Rest on a wire rack for 3 minutes, then slice into 1-inch strips.",
            "Step 2: The Broth. In a wide, shallow oyakodon pan, combine dashi, soy sauce, mirin, and sugar. Bring to a simmer over medium heat.",
            "Step 3: The Onions. Add the sliced onions to the broth and simmer for 3-4 minutes until they are soft and sweet.",
            "Step 4: The Katsu. Lay the sliced Tonkatsu strips over the onions in the pan. Let them sit in the simmering broth for 1 minute to absorb flavor. The crust will soften slightly and soak up the savory liquid.",
            "Step 5: The Egg and Serve. Pour the beaten egg in a circular motion over the katsu. Cover immediately and cook for 45-60 seconds until the egg is barely set and still trembling in the center. Slide the entire contents over a bowl of hot rice. Serve immediately."
          ],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["deep-frying","simmering","breading"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":820,"proteinG":46,"carbsG":72,"fatG":36,"fiberG":4,"sodiumMg":920,"sugarG":9,"vitamins":["Thiamin","Vitamin B6","Choline"],"minerals":["Zinc","Iron","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0895,"entropy":0.0955,"reactivity":0.4178,"gregsEnergy":0.0496,"kalchm":0.25,"monica":0.0857},
                    substitutions: [{"originalIngredient":"pork loin chops","substituteOptions":["chicken breast (for chicken katsudon)","firm tofu (for vegan katsudon)"]},{"originalIngredient":"panko breadcrumbs","substituteOptions":["crushed cornflakes","regular breadcrumbs"]}]
        },
        {
          name: "Gyoza",
          description: "Thin wheat wrappers filled with ground pork, cabbage, garlic chives, ginger, and sesame oil, pan-fried to achieve a crispy golden bottom while the top steams to tenderness.",
          details: {"cuisine":"Japanese","prepTimeMinutes":45,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":250,"unit":"g","name":"ground pork","notes":"Not too lean; some fat keeps the filling juicy."},{"amount":2,"unit":"cups","name":"napa cabbage","notes":"Finely chopped, salted, and squeezed dry to prevent soggy wrappers."},{"amount":0.25,"unit":"cup","name":"garlic chives (nira)","notes":"Finely minced. Essential for authentic gyoza flavor."},{"amount":1,"unit":"tbsp","name":"fresh ginger","notes":"Grated finely. Brightens the pork filling."},{"amount":1,"unit":"tbsp","name":"sesame oil","notes":"Toasted, mixed into the filling for fragrance."},{"amount":1,"unit":"tbsp","name":"soy sauce","notes":"Seasons the filling from within."},{"amount":30,"unit":"sheets","name":"gyoza wrappers","notes":"Thin, round wrappers. Thinner than wonton skins."},{"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"For pan-frying the bottoms to golden crispness."}],
          instructions: ["Step 1: The Filling. Combine ground pork, squeezed cabbage, garlic chives, grated ginger, sesame oil, and soy sauce in a bowl. Mix vigorously in one direction until the mixture becomes sticky and cohesive. Refrigerate for 15 minutes to firm up.","Step 2: The Pleating. Place a scant tablespoon of filling in the center of each wrapper. Wet the edge with water, fold in half, and create 5-6 pleats along one side, pressing firmly to seal. Stand each gyoza upright so the flat bottom rests evenly.","Step 3: The Sear. Heat vegetable oil in a large non-stick skillet over medium-high heat. Arrange gyoza in tight rows, flat side down. Cook without moving for 2-3 minutes until the bottoms are deeply golden brown.","Step 4: The Steam. Add 0.25 cup water to the hot pan and immediately cover with a tight lid. Steam for 3-4 minutes until the wrappers turn translucent and the filling is cooked through. Remove the lid and let any remaining water evaporate.","Step 5: The Serve. Slide the gyoza onto a plate, crispy side up. Serve with a dipping sauce of rice vinegar, soy sauce, and chili oil. Eat immediately while the bottoms are still crackling."],
          classifications: {"mealType":["dinner","appetizer"],"cookingMethods":["pan-frying","steaming"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.3,"Air":0.15},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","virgo"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":320,"proteinG":18,"carbsG":28,"fatG":16,"fiberG":2,"sodiumMg":680,"sugarG":2,"vitamins":["Vitamin K","Vitamin C","Thiamin"],"minerals":["Iron","Manganese","Selenium"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0843,"entropy":0.3432,"reactivity":1.8846,"gregsEnergy":-0.5625,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"ground pork","substituteOptions":["ground chicken","shrimp and pork mix"]},{"originalIngredient":"napa cabbage","substituteOptions":["regular green cabbage","bok choy"]}]
        },
        {
          name: "Karaage",
          description: "Bite-sized chicken thigh marinated in ginger, garlic, soy sauce, and sake, then coated in potato starch and double-fried for extreme crispness.",
          details: {"cuisine":"Japanese","prepTimeMinutes":40,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":500,"unit":"g","name":"chicken thigh","notes":"Boneless, skin-on, cut into bite-sized pieces. Thigh meat stays juicy through double frying."},{"amount":2,"unit":"tbsp","name":"soy sauce","notes":"The base of the marinade. Use regular, not low-sodium."},{"amount":1,"unit":"tbsp","name":"sake","notes":"Tenderizes the meat and removes gaminess."},{"amount":1,"unit":"tbsp","name":"fresh ginger","notes":"Grated finely, juice and pulp included."},{"amount":2,"unit":"cloves","name":"garlic","notes":"Grated or minced very finely into the marinade."},{"amount":0.5,"unit":"cup","name":"potato starch (katakuriko)","notes":"Creates an ultra-crispy, shatteringly light crust. Not cornstarch."},{"amount":3,"unit":"cups","name":"frying oil","notes":"Neutral oil heated to 325 degrees F for first fry, 375 degrees F for second."},{"amount":1,"unit":"whole","name":"lemon","notes":"Cut into wedges for serving. The acid cuts through the richness."}],
          instructions: ["Step 1: The Marinade. Combine soy sauce, sake, grated ginger, and garlic in a bowl. Add the chicken pieces and toss to coat. Marinate for 30 minutes at room temperature, or up to overnight in the refrigerator.","Step 2: The Coating. Remove chicken from marinade and let excess drip off. Toss pieces in potato starch, pressing lightly to adhere. Let sit for 5 minutes so the starch hydrates and forms a thin paste on the surface.","Step 3: The First Fry. Heat oil to 325 degrees F (160 degrees C). Fry chicken in batches for 3-4 minutes until pale golden and just cooked through. Remove to a wire rack and rest for 4 minutes. The residual heat continues cooking the interior.","Step 4: The Second Fry. Raise oil temperature to 375 degrees F (190 degrees C). Return all chicken to the oil for 60-90 seconds until the crust turns deep golden brown and audibly crackles. This second fry drives out surface moisture for maximum crispness.","Step 5: The Serve. Drain on a wire rack for 30 seconds. Pile onto a plate lined with paper, with lemon wedges and a small mound of Japanese mayonnaise on the side. Eat immediately."],
          classifications: {"mealType":["dinner","snack","lunch"],"cookingMethods":["deep-frying"]},
          elementalProperties: {"Fire":0.45,"Water":0.1,"Earth":0.25,"Air":0.2},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["leo","aries"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":450,"proteinG":32,"carbsG":22,"fatG":26,"fiberG":1,"sodiumMg":780,"sugarG":2,"vitamins":["Niacin","Vitamin B6","Vitamin C"],"minerals":["Zinc","Iron","Selenium"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1849,"entropy":0.225,"reactivity":1.4416,"gregsEnergy":-0.1394,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"chicken thigh","substituteOptions":["chicken breast","firm tofu"]},{"originalIngredient":"potato starch","substituteOptions":["cornstarch","tapioca starch"]}]
        },
      ],
    },
  },
  traditionalSauces: {
    shoyu: {
      name: "Shoyu (Soy Sauce)",
      description:
        "Fermented soybean sauce that forms the foundation of Japanese cuisine",
      base: "soybean",
      keyIngredients: ["soybeans", "wheat", "salt", "koji mold"],
      culinaryUses: ["dipping sauce", "seasoning", "marinade", "flavor base"],
      variants: ["Koikuchi", "Usukuchi", "Tamari", "Saishikomi"],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Saturn", "Pluto", "Scorpio"],
      seasonality: "all",
      preparationNotes: "Traditional brewing takes months of fermentation",
      technicalTips:
        "Different shoyu types are suited for different applications, usukuchi is lighter and saltier",
    },
    miso: {
      name: "Miso",
      description: "Fermented soybean paste with complex umami flavor",
      base: "soybean",
      keyIngredients: ["soybeans", "koji", "salt", "rice or barley"],
      culinaryUses: ["soup base", "marinade", "sauce base", "pickling agent"],
      variants: [
        "Shiro (white)",
        "Aka (red)",
        "Awase (mixed)",
        "Hatcho (soybean-only)",
      ],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.2,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Jupiter", "Moon", "Taurus"],
      seasonality: "all",
      preparationNotes:
        "Fermentation period determines color and flavor intensity",
      technicalTips:
        "Never boil miso to preserve live cultures and flavor complexity",
    },
    ponzu: {
      name: "Ponzu",
      description: "Tangy citrus-based sauce with soy and dashi",
      base: "citrus juice",
      keyIngredients: [
        "yuzu or sudachi juice",
        "soy sauce",
        "rice vinegar",
        "dashi",
      ],
      culinaryUses: ["dipping sauce", "dressing", "marinade"],
      difficulty: "easy",
      elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
      seasonality: "all",
      preparationNotes: "Best when aged for several days to develop flavor",
      yield: "500ml",
    },
    mentsuyu: {
      name: "Mentsuyu",
      description: "Multipurpose noodle soup base and seasoning sauce",
      base: "soy sauce and dashi",
      keyIngredients: ["soy sauce", "mirin", "sake", "sugar", "dashi"],
      culinaryUses: ["noodle dipping sauce", "soup base", "seasoning"],
      difficulty: "easy",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      seasonality: "all",
      preparationNotes: "Can be prepared concentrated and diluted as needed",
      yield: "750ml",
    },
    teriyaki: {
      name: "Teriyaki",
      description: "Sweet-savory glaze with soy sauce, mirin, and sugar",
      base: "soy sauce",
      keyIngredients: ["soy sauce", "mirin", "sake", "sugar", "ginger"],
      culinaryUses: ["glazing", "marinade", "finishing sauce"],
      difficulty: "easy",
      elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
      seasonality: "all",
      preparationNotes: "Traditionally applied in layers while grilling",
      yield: "500ml",
    },
  },
  sauceRecommender: {
    forProtein: {
      fish: ["ponzu", "mentsuyu", "teriyaki", "ginger sauce"],
      chicken: ["teriyaki", "katsu sauce", "yuzu kosho", "sesame sauce"],
      beef: ["yakiniku sauce", "ponzu", "warishita", "ginger sauce"],
      tofu: ["ponzu", "sesame sauce", "ginger sauce", "miso sauce"],
      pork: ["tonkatsu sauce", "shogayaki sauce", "miso sauce", "teriyaki"],
    },
    forVegetable: {
      leafy: ["sesame dressing", "ponzu", "shiro dashi", "miso dressing"],
      root: ["miso sauce", "mentsuyu", "kinpira sauce", "sesame sauce"],
      seaweed: ["ponzu", "soy vinegar", "miso sauce", "sesame dressing"],
      mushroom: ["butter shoyu", "mirin glaze", "dashi-based", "mentsuyu"],
    },
    forCookingMethod: {
      grilling: ["teriyaki", "yakitori tare", "miso glaze", "yuzu kosho"],
      simmering: ["mentsuyu", "kake sauce", "dashi-based", "warishita"],
      "deep-frying": ["tentsuyu", "tonkatsu sauce", "ponzu", "curry sauce"],
      steaming: ["ponzu", "ginger sauce", "yuzu sauce", "dashi vinegar"],
    },
    byAstrological: {
      Fire: [
        "spicy yuzu kosho",
        "karashi mustard sauce",
        "wasabi dressing",
        "chili oil",
      ],
      Water: [
        "clear dashi-based sauces",
        "gentle ponzu",
        "light broths",
        "nikiri",
      ],
      Earth: [
        "miso-based sauces",
        "thick teriyaki",
        "rich tonkatsu sauce",
        "sesame",
      ],
      Air: [
        "citrus dressings",
        "light vinaigrettes",
        "delicate herb sauces",
        "yuzu",
      ],
    },
    byRegion: {
      kanto: ["thick sweet sauces", "dark soy-based", "rich dashi"],
      kansai: ["light dashi", "delicate seasonings", "subtle umami"],
      hokkaido: ["butter-miso", "rich seafood sauces", "hearty broths"],
      kyushu: ["intense tonkotsu", "spicy yuzu kosho", "bold marinades"],
    },
    byDietary: {
      vegetarian: [
        "kombu dashi-based",
        "shiitake broth",
        "vegan ponzu",
        "miso-based",
      ],
      vegan: [
        "mushroom dashi",
        "soy-based sauces",
        "yuzu dressing",
        "umeboshi sauce",
      ],
      glutenFree: [
        "tamari-based sauces",
        "rice vinegar dressings",
        "citrus sauces",
      ],
      lowSodium: [
        "yuzu dressing",
        "vinegar-based",
        "herb oils",
        "mirin glazes",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Nimono",
      description:
        "Simmering ingredients in dashi-based broth with soy, mirin, and sake",
      elementalProperties: { Water: 0.5, Earth: 0.3, Fire: 0.1, Air: 0.1 },
      toolsRequired: [
        "heavy-bottomed pot",
        "otoshibuta (drop lid)",
        "cooking chopsticks",
      ],
      bestFor: ["root vegetables", "fish", "tofu", "meat"],
      difficulty: "medium",
    },
    {
      name: "Tempura",
      description:
        "Light batter frying technique that creates crisp, delicate coating",
      elementalProperties: { Fire: 0.4, Air: 0.3, Water: 0.2, Earth: 0.1 },
      toolsRequired: ["deep pot", "chopsticks", "wire skimmer", "thermometer"],
      bestFor: ["seafood", "vegetables", "mushrooms", "herbs"],
      difficulty: "hard",
    },
    {
      name: "Yakimono",
      description:
        "Grilling technique emphasizing simplicity and natural flavors",
      elementalProperties: { Fire: 0.5, Earth: 0.2, Air: 0.2, Water: 0.1 },
      toolsRequired: [
        "konro grill",
        "binchotan charcoal",
        "metal skewers",
        "tongs",
      ],
      bestFor: ["fish", "chicken", "beef", "vegetables"],
      difficulty: "medium",
    },
  ],
  regionalCuisines: {
    kansai: {
      name: "Kansai/Kyoto Cuisine",
      description:
        "Refined, delicate flavors emphasizing natural taste of ingredients with minimal seasoning",
      signature: ["kaiseki ryori", "yudofu", "obanzai", "kyogashi"],
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Moon", "Venus", "Cancer"],
      seasonality: "strong seasonal emphasis",
      specialIngredients: [
        "Kyoto vegetables",
        "fu (wheat gluten)",
        "refined tofu",
        "high-grade teas",
      ],
    },
    kanto: {
      name: "Kanto/Tokyo Cuisine",
      description: "Bolder, more soy-focused flavors with urban innovations",
      signature: [
        "edomae sushi",
        "monjayaki",
        "chankonabe",
        "deep-fried foods",
      ],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Jupiter", "Mars", "Capricorn"],
      seasonality: "moderate seasonal emphasis",
      specialIngredients: [
        "dark soy sauce",
        "abundant seafood",
        "creative fusion elements",
      ],
    },
    hokkaido: {
      name: "Hokkaido Cuisine",
      description:
        "Hearty, dairy-influenced northern cuisine with abundant seafood",
      signature: ["soup curry", "jingisukan", "seafood bowls", "miso ramen"],
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Mercury", "Taurus"],
      seasonality: "strong winter emphasis",
      specialIngredients: [
        "butter",
        "corn",
        "potatoes",
        "dairy",
        "sea urchin",
        "crab",
      ],
    },
  },
  elementalProperties: {
    Water: 0.35, // Represents broths, gentle cooking methods, and seafood focus,
    Earth: 0.3, // Represents grounding rice, roots, and umami elements,
    Air: 0.2, // Represents lightness, seasonal awareness, and presentation,
    Fire: 0.15, // Represents grilling techniques and wasabi heat
  },
  astrologicalInfluences: [
    "Neptune - Governs the subtle dashi broths and seafood elements",
    "Mercury - Influences the precision and attention to detail",
    "Moon - Shapes the cyclical nature of seasonal cuisine",
  ],
};

export default japanese;
