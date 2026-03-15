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
          "substitutions": []
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
          description: "Rich miso ramen with chashu pork and vegetables",
          cuisine: "Japanese",
          ingredients: [
            {
              name: "ramen noodles",
              amount: "200",
              unit: "g",
              category: "grain",
              swaps: ["rice noodles"],
            },
            {
              name: "chashu pork",
              amount: "100",
              unit: "g",
              category: "protein",
              swaps: ["marinated mushrooms"],
            },
            { name: "miso broth", amount: "500", unit: "ml", category: "soup" },
            { name: "corn", amount: "50", unit: "g", category: "vegetable" },
            {
              name: "bamboo shoots",
              amount: "30",
              unit: "g",
              category: "vegetable",
            },
            {
              name: "soft-boiled egg",
              amount: "1",
              unit: "large",
              category: "protein",
              swaps: ["tofu"],
            },
          ],
          nutrition: {
            calories: 650,
            protein: 35,
            carbs: 85,
            fat: 22,
            fiber: 3,
            vitamins: ["B12", "A", "K"],
            minerals: ["Iron", "Zinc"],
          },
          timeToMake: "30 minutes",
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.09,
            Water: 0.25,
            Earth: 0.57,
            Air: 0.1,
          },
        },
      ],
      summer: [
        {
          name: "Yakitori Assortment",
          description: "Grilled chicken skewers with various seasonings",
          cuisine: "Japanese",
          ingredients: [
            {
              name: "chicken thigh",
              amount: "300",
              unit: "g",
              category: "protein",
              swaps: ["mushrooms", "tofu"],
            },
            {
              name: "green onion",
              amount: "4",
              unit: "stalks",
              category: "vegetable",
            },
            {
              name: "tare sauce",
              amount: "100",
              unit: "ml",
              category: "sauce",
            },
            {
              name: "shichimi togarashi",
              amount: "1",
              unit: "tbsp",
              category: "seasoning",
            },
          ],
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 15,
            fat: 28,
            fiber: 3,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"],
          },
          timeToMake: "25 minutes",
          season: ["summer"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.21,
            Water: 0.31,
            Earth: 0.33,
            Air: 0.14,
          },
        },
        {
          "name": "Authentic Oyakodon",
          "description": "A poetic and highly efficient Japanese comfort dish. The name translates to 'parent and child'.",
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
              "amount": 250,
              "unit": "g",
              "name": "chicken thighs",
              "notes": "Bite-sized pieces."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "dashi stock",
              "notes": "Awase dashi."
            }
          ],
          "instructions": [
            "Step 1: Mix dashi, soy sauce, mirin, and sugar.",
            "Step 2: Simmer onions and chicken in the broth until cooked.",
            "Step 3: Drizzle egg over chicken.",
            "Step 4: Simmer 30-45 seconds until barely set.",
            "Step 5: Slide over hot rice."
          ],
          "classifications": {
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.4,
            "Earth": 0.35,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon"
            ],
            "signs": [
              "Cancer"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 510,
            "proteinG": 32,
            "carbsG": 62,
            "fatG": 12,
            "fiberG": 2,
              "sodiumMg": 696,
              "sugarG": 9,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "chicken thighs",
              "substituteOptions": [
                "chicken breast"
              ]
            }
          ]
        },
        {
          name: "Okonomiyaki",
          description: "Savory cabbage pancake with various toppings",
          cuisine: "Japanese (Osaka-style)",
          cookingMethods: [
            {
              name: "grilling",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.06,
                Earth: 0.11,
                Air: 0.33,
              },
            },
            {
              name: "pan-frying",
              elementalProperties: {
                Fire: 0.42,
                Water: 0.09,
                Earth: 0.21,
                Air: 0.27,
              },
            },
            {
              name: "mixing",
              elementalProperties: {
                Fire: 0.07,
                Water: 0.21,
                Earth: 0.21,
                Air: 0.5,
              },
            },
          ],
          tools: [
            "flat griddle",
            "spatulas",
            "mixing bowls",
            "grater",
            "brush for sauce",
          ],
          preparationSteps: [
            "Mix batter ingredients",
            "Fold in shredded cabbage",
            "Cook on hot griddle",
            "Flip when golden",
            "Add toppings",
            "Apply sauces and garnishes",
          ],
          ingredients: [
            {
              name: "cabbage",
              amount: "400",
              unit: "g",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.3,
                Air: 0.3,
              },
            },
            {
              name: "okonomiyaki flour",
              amount: "150",
              unit: "g",
              category: "grain",
              swaps: ["all-purpose flour + dashi powder"],
            },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            {
              name: "pork belly",
              amount: "100",
              unit: "g",
              category: "protein",
              swaps: ["mushrooms"],
            },
            {
              name: "okonomiyaki sauce",
              amount: "4",
              unit: "tbsp",
              category: "sauce",
            },
            {
              name: "mayonnaise",
              amount: "2",
              unit: "tbsp",
              category: "sauce",
            },
            {
              name: "bonito flakes",
              amount: "10",
              unit: "g",
              category: "garnish",
              optional: true,
            },
          ],
          substitutions: {
            "pork belly": ["mushrooms", "tofu", "shrimp"],
            "bonito flakes": ["nori strips", "sesame seeds"],
            "okonomiyaki flour": ["all-purpose flour + dashi powder"],
          },
          servingSize: 2,
          allergens: ["wheat", "egg", "fish", "soy"],
          prepTime: "20 minutes",
          cookTime: "15 minutes",
          culturalNotes:
            "A popular street food from Osaka. The name means 'grilled as you like it', reflecting its customizable nature",
          pairingSuggestions: ["beer", "sake", "green tea"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 550,
            protein: 25,
            carbs: 45,
            fat: 32,
            fiber: 3,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.11,
            Water: 0.19,
            Earth: 0.42,
            Air: 0.28,
          },
          mealType: ["lunch", "dinner", "street food"],
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
            "strainer",
          ],
          preparationSteps: [
            "Prepare dipping sauce",
            "Make tempura batter",
            "Heat oil to 180°C",
            "Coat ingredients in batter",
            "Fry until golden",
            "Drain on paper towels",
          ],
          ingredients: [
            {
              name: "shrimp",
              amount: "8",
              unit: "pieces",
              category: "seafood",
              swaps: ["vegetables"],
            },
            {
              name: "assorted vegetables",
              amount: "400",
              unit: "g",
              category: "vegetable",
            },
            {
              name: "tempura flour",
              amount: "200",
              unit: "g",
              category: "grain",
              swaps: ["rice flour mix"],
            },
            {
              name: "ice water",
              amount: "200",
              unit: "ml",
              category: "liquid",
            },
            { name: "dashi", amount: "200", unit: "ml", category: "broth" },
            { name: "mirin", amount: "2", unit: "tbsp", category: "seasoning" },
          ],
          substitutions: {
            shrimp: ["sweet potato", "mushrooms", "tofu"],
            "tempura flour": ["rice flour + cornstarch"],
            dashi: ["vegetable stock"],
          },
          servingSize: 4,
          allergens: ["wheat", "shellfish"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          culturalNotes:
            "Originally introduced by Portuguese missionaries, tempura has become a refined Japanese art form emphasizing lightness and crispiness",
          pairingSuggestions: ["tentsuyu sauce", "green tea", "rice"],
          dietaryInfo: ["pescatarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 45,
            fat: 22,
            fiber: 3,
            vitamins: ["A", "C", "D"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["all"],
          mealType: ["lunch", "dinner"],
        },
        {
          name: "Udon Noodle Soup",
          description: "Thick wheat noodles in hot dashi broth",
          cuisine: "Japanese",
          cookingMethods: [
            {
              name: "boiling",
              elementalProperties: {
                Fire: 0.24,
                Water: 0.59,
                Earth: 0.12,
                Air: 0.06,
              },
            },
            {
              name: "simmering",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.53,
                Earth: 0.17,
                Air: 0.1,
              },
            },
            {
              name: "assembling",
              elementalProperties: {
                Fire: 0.04,
                Water: 0.16,
                Earth: 0.4,
                Air: 0.4,
              },
            },
          ],
          tools: [
            "large pot",
            "strainer",
            "ladle",
            "cooking chopsticks",
            "serving bowls",
          ],
          preparationSteps: [
            "Prepare dashi broth",
            "Cook udon noodles",
            "Slice toppings",
            "Heat broth with seasonings",
            "Assemble in bowls",
            "Add garnishes",
          ],
          ingredients: [
            {
              name: "udon noodles",
              amount: "400",
              unit: "g",
              category: "grain",
              swaps: ["rice noodles"],
            },
            { name: "dashi stock", amount: "1", unit: "L", category: "broth" },
            {
              name: "green onions",
              amount: "2",
              unit: "stalks",
              category: "vegetable",
            },
            {
              name: "kamaboko",
              amount: "100",
              unit: "g",
              category: "seafood",
              optional: true,
            },
            {
              name: "tempura bits",
              amount: "30",
              unit: "g",
              category: "topping",
              optional: true,
            },
            {
              name: "soy sauce",
              amount: "3",
              unit: "tbsp",
              category: "seasoning",
            },
          ],
          substitutions: {
            udon: ["rice noodles", "soba"],
            kamaboko: ["tofu", "mushrooms"],
            dashi: ["vegetable stock", "mushroom stock"],
          },
          servingSize: 2,
          allergens: ["wheat", "soy"],
          prepTime: "10 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A comforting noodle dish with regional variations across Japan. The chewy texture of udon is highly prized",
          pairingSuggestions: ["tempura", "onigiri", "green tea"],
          dietaryInfo: ["vegetarian possible"],
          spiceLevel: "none",
          nutrition: {
            calories: 380,
            protein: 14,
            carbs: 75,
            fat: 4,
            fiber: 3,
            vitamins: ["B1", "B2"],
            minerals: ["Iron", "Manganese"],
          },
          season: ["winter", "all"],

          elementalProperties: {
            Fire: 0.07,
            Water: 0.37,
            Earth: 0.48,
            Air: 0.08,
          },
          mealType: ["lunch", "dinner"],
        },
        {
          name: "Tonkatsu",
          description: "Breaded and deep-fried pork cutlet",
          cuisine: "Japanese",
          cookingMethods: [
            "breading",
            {
              name: "deep-frying",
              elementalProperties: {
                Fire: 0.45,
                Water: 0.06,
                Earth: 0.21,
                Air: 0.27,
              },
            },
            "cutting",
          ],
          tools: [
            "deep pot",
            "wire rack",
            "tongs",
            "thermometer",
            "sharp knife",
            "paper towels",
          ],
          preparationSteps: [
            "Tenderize pork cutlet",
            "Season with salt and pepper",
            "Coat with flour",
            "Dip in beaten egg",
            "Cover with panko",
            "Deep fry until golden",
            "Rest and slice",
          ],
          ingredients: [
            {
              name: "pork loin",
              amount: "400",
              unit: "g",
              category: "protein",
              swaps: ["chicken", "tofu"],
            },
            {
              name: "panko breadcrumbs",
              amount: "200",
              unit: "g",
              category: "coating",
            },
            { name: "eggs", amount: "2", unit: "large", category: "protein" },
            { name: "flour", amount: "100", unit: "g", category: "grain" },
            {
              name: "tonkatsu sauce",
              amount: "60",
              unit: "ml",
              category: "sauce",
            },
            {
              name: "cabbage",
              amount: "200",
              unit: "g",
              category: "vegetable",
            },
          ],
          substitutions: {
            pork: ["chicken breast", "firm tofu", "seitan"],
            panko: ["gluten-free breadcrumbs"],
            eggs: ["plant-based egg substitute"],
          },
          servingSize: 2,
          allergens: ["wheat", "egg"],
          prepTime: "15 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A Western-inspired dish that became a Japanese favorite in the early 1900s. The specific cutting technique and shredded cabbage are essential elements",
          pairingSuggestions: [
            "steamed rice",
            "miso soup",
            "pickled vegetables",
          ],
          dietaryInfo: ["contains meat"],
          spiceLevel: "none",
          nutrition: {
            calories: 650,
            protein: 42,
            carbs: 48,
            fat: 34,
            fiber: 3,
            vitamins: ["B1", "B6", "B12"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.24,
            Water: 0.25,
            Earth: 0.41,
            Air: 0.11,
          },
          mealType: ["lunch", "dinner"],
        },
        {
          name: "Chawanmushi",
          description: "Savory steamed egg custard with various ingredients",
          cuisine: "Japanese",
          cookingMethods: [
            {
              name: "steaming",
              elementalProperties: {
                Fire: 0.06,
                Water: 0.56,
                Earth: 0.13,
                Air: 0.25,
              },
            },
            "straining",
            {
              name: "assembling",
              elementalProperties: {
                Fire: 0.04,
                Water: 0.16,
                Earth: 0.4,
                Air: 0.4,
              },
            },
          ],
          tools: [
            "steamer",
            "fine-mesh strainer",
            "small cups",
            "whisk",
            "measuring cups",
          ],
          preparationSteps: [
            "Strain beaten eggs",
            "Mix with dashi stock",
            "Place ingredients in cups",
            "Pour egg mixture",
            "Steam gently",
            "Garnish and serve",
          ],
          ingredients: [
            {
              name: "eggs",
              amount: "3",
              unit: "large",
              category: "protein",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.3,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            { name: "dashi", amount: "300", unit: "ml", category: "broth" },
            {
              name: "chicken",
              amount: "60",
              unit: "g",
              category: "protein",
              swaps: ["mushrooms"],
            },
            {
              name: "shrimp",
              amount: "4",
              unit: "pieces",
              category: "seafood",
              optional: true,
            },
            {
              name: "mitsuba",
              amount: "4",
              unit: "sprigs",
              category: "herb",
              swaps: ["spinach"],
            },
            {
              name: "kamaboko",
              amount: "30",
              unit: "g",
              category: "seafood",
              optional: true,
            },
          ],
          substitutions: {
            chicken: ["mushrooms", "tofu"],
            shrimp: ["vegetables"],
            dashi: ["vegetable stock"],
          },
          servingSize: 4,
          allergens: ["egg", "shellfish", "fish"],
          prepTime: "20 minutes",
          cookTime: "15 minutes",
          culturalNotes:
            "A delicate dish that showcases the Japanese mastery of egg cookery. The name means 'steamed in a tea bowl'",
          pairingSuggestions: ["sake", "green tea", "rice"],
          dietaryInfo: ["contains seafood", "contains meat"],
          spiceLevel: "none",
          nutrition: {
            calories: 120,
            protein: 14,
            carbs: 2,
            fat: 7,
            fiber: 3,
            vitamins: ["B12", "D", "A"],
            minerals: ["Selenium", "Iodine"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.14,
            Water: 0.44,
            Earth: 0.3,
            Air: 0.12,
          },
          mealType: ["appetizer", "side dish"],
        },
        {
          name: "Yakitori",
          description: "Grilled chicken skewers with various seasonings",
          cuisine: "Japanese",
          cookingMethods: [
            {
              name: "grilling",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.06,
                Earth: 0.11,
                Air: 0.33,
              },
            },
            "skewering",
            "basting",
          ],
          tools: [
            "yakitori grill",
            "bamboo skewers",
            "basting brush",
            "cutting board",
            "sharp knife",
            "tongs",
          ],
          preparationSteps: [
            "Soak bamboo skewers",
            "Cut chicken into bite-size pieces",
            "Thread onto skewers",
            "Prepare tare sauce",
            "Grill while basting",
            "Apply final glaze",
          ],
          ingredients: [
            {
              name: "chicken thigh",
              amount: "500",
              unit: "g",
              category: "protein",
              swaps: ["mushrooms", "tofu"],
            },
            {
              name: "green onion",
              amount: "4",
              unit: "stalks",
              category: "vegetable",
            },
            { name: "sake", amount: "60", unit: "ml", category: "seasoning" },
            { name: "mirin", amount: "60", unit: "ml", category: "seasoning" },
            {
              name: "soy sauce",
              amount: "60",
              unit: "ml",
              category: "seasoning",
            },
            { name: "sugar", amount: "2", unit: "tbsp", category: "seasoning" },
          ],
          substitutions: {
            chicken: ["mushrooms", "tofu", "seitan"],
            sake: ["rice vinegar + water"],
            mirin: ["sweet rice wine", "rice vinegar + sugar"],
          },
          servingSize: 4,
          allergens: ["soy"],
          prepTime: "30 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A popular izakaya dish, yakitori represents the Japanese art of grilling. Each part of the chicken is traditionally used",
          pairingSuggestions: ["beer", "sake", "shishito peppers", "rice"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 28,
            carbs: 12,
            fat: 18,
            fiber: 3,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.29,
            Water: 0.24,
            Earth: 0.32,
            Air: 0.15,
          },
          mealType: ["dinner", "appetizer"],
        },
        {
          name: "Miso Ramen",
          description: "Hearty noodle soup with miso-based broth",
          cuisine: "Japanese (Hokkaido-style)",
          cookingMethods: [
            {
              name: "simmering",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.53,
                Earth: 0.17,
                Air: 0.1,
              },
            },
            {
              name: "boiling",
              elementalProperties: {
                Fire: 0.24,
                Water: 0.59,
                Earth: 0.12,
                Air: 0.06,
              },
            },
            {
              name: "assembling",
              elementalProperties: {
                Fire: 0.04,
                Water: 0.16,
                Earth: 0.4,
                Air: 0.4,
              },
            },
          ],
          tools: [
            "large pot",
            "strainer",
            "ladle",
            "serving bowls",
            "sharp knife",
          ],
          preparationSteps: [
            "Prepare rich broth",
            "Cook noodles",
            "Sauté corn and bean sprouts",
            "Slice chashu pork",
            "Assemble bowls",
            "Add toppings",
          ],
          ingredients: [
            {
              name: "ramen noodles",
              amount: "400",
              unit: "g",
              category: "grain",
              swaps: ["rice noodles"],
            },
            {
              name: "miso paste",
              amount: "4",
              unit: "tbsp",
              category: "seasoning",
            },
            {
              name: "pork broth",
              amount: "1",
              unit: "L",
              category: "broth",
              swaps: ["vegetable broth"],
            },
            {
              name: "chashu pork",
              amount: "200",
              unit: "g",
              category: "protein",
              swaps: ["tofu"],
            },
            { name: "corn", amount: "200", unit: "g", category: "vegetable" },
            {
              name: "bean sprouts",
              amount: "200",
              unit: "g",
              category: "vegetable",
            },
            {
              name: "butter",
              amount: "20",
              unit: "g",
              category: "dairy",
              optional: true,
            },
          ],
          substitutions: {
            "pork broth": ["vegetable broth", "mushroom broth"],
            "chashu pork": ["marinated tofu", "seitan"],
            butter: ["vegan butter", "sesame oil"],
          },
          servingSize: 2,
          allergens: ["wheat", "soy", "dairy"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          culturalNotes:
            "Miso ramen originated in Hokkaido, where the hearty, warming soup helped people endure cold winters",
          pairingSuggestions: ["gyoza", "edamame", "beer"],
          dietaryInfo: ["contains meat", "contains dairy"],
          spiceLevel: "mild to medium",
          nutrition: {
            calories: 680,
            protein: 38,
            carbs: 85,
            fat: 24,
            fiber: 3,
            vitamins: ["B12", "A", "C"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["winter", "all"],

          elementalProperties: {
            Fire: 0.07,
            Water: 0.37,
            Earth: 0.48,
            Air: 0.08,
          },
          mealType: ["lunch", "dinner"],
        },
        {
          "name": "Authentic Katsudon",
          "description": "A dynamic Japanese comfort dish combining Tonkatsu with softly set eggs.",
          "details": {
            "cuisine": "Japanese",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 15,
            "baseServingSize": 2,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "pieces",
              "name": "pork loin chops",
              "notes": "Breaded."
            }
          ],
          "instructions": [
            "Step 1: Fry Tonkatsu.",
            "Step 2: Simmer onions in broth.",
            "Step 3: Add Tonkatsu and eggs.",
            "Step 4: Serve over rice."
          ],
          "classifications": {
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.2,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Aries"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 750,
            "proteinG": 38,
            "carbsG": 70,
            "fatG": 32,
            "fiberG": 3,
              "sodiumMg": 515,
              "sugarG": 13,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Gyoza",
          description: "Pan-fried dumplings with meat and vegetable filling",
          cuisine: "Japanese",
          cookingMethods: [
            {
              name: "pan-frying",
              elementalProperties: {
                Fire: 0.42,
                Water: 0.09,
                Earth: 0.21,
                Air: 0.27,
              },
            },
            {
              name: "steaming",
              elementalProperties: {
                Fire: 0.06,
                Water: 0.56,
                Earth: 0.13,
                Air: 0.25,
              },
            },
            {
              name: "folding",
              elementalProperties: {
                Fire: 0.04,
                Water: 0.18,
                Earth: 0.18,
                Air: 0.61,
              },
            },
          ],
          tools: [
            "non-stick pan",
            "spatula",
            "mixing bowls",
            "cutting board",
            "gyoza press (optional)",
          ],
          preparationSteps: [
            "Mix filling ingredients",
            "Fill and fold wrappers",
            "Heat pan with oil",
            "Arrange gyoza",
            "Add water and steam",
            "Crisp bottom",
            "Serve with dipping sauce",
          ],
          ingredients: [
            {
              name: "gyoza wrappers",
              amount: "30",
              unit: "pieces",
              category: "grain",
            },
            {
              name: "ground pork",
              amount: "300",
              unit: "g",
              category: "protein",
              swaps: ["mushrooms"],
            },
            {
              name: "cabbage",
              amount: "200",
              unit: "g",
              category: "vegetable",
            },
            { name: "chives", amount: "50", unit: "g", category: "vegetable" },
            {
              name: "ginger",
              amount: "1",
              unit: "tbsp",
              category: "seasoning",
            },
            {
              name: "garlic",
              amount: "2",
              unit: "cloves",
              category: "seasoning",
            },
          ],
          substitutions: {
            "ground pork": ["minced mushrooms", "plant-based meat"],
            "gyoza wrappers": ["rice paper", "homemade wrappers"],
            cabbage: ["napa cabbage", "bok choy"],
          },
          servingSize: 4,
          allergens: ["wheat", "soy"],
          prepTime: "45 minutes",
          cookTime: "15 minutes",
          culturalNotes:
            "Adapted from Chinese jiaozi, gyoza became a Japanese favorite after WWII. The crispy bottom is a distinctive Japanese touch",
          pairingSuggestions: ["ramen", "rice", "beer", "green tea"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 280,
            protein: 14,
            carbs: 30,
            fat: 12,
            fiber: 3,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.12,
            Water: 0.47,
            Earth: 0.31,
            Air: 0.09,
          },
          mealType: ["appetizer", "side dish"],
        },
        {
          name: "Karaage",
          description: "Japanese-style fried chicken",
          cuisine: "Japanese",
          cookingMethods: [
            {
              name: "marinating",
              elementalProperties: {
                Fire: 0.13,
                Water: 0.44,
                Earth: 0.19,
                Air: 0.25,
              },
            },
            {
              name: "deep-frying",
              elementalProperties: {
                Fire: 0.45,
                Water: 0.06,
                Earth: 0.21,
                Air: 0.27,
              },
            },
          ],
          tools: [
            "deep pot",
            "wire rack",
            "mixing bowls",
            "paper towels",
            "thermometer",
          ],
          preparationSteps: [
            "Cut chicken into pieces",
            "Marinate with seasonings",
            "Coat with potato starch",
            "Heat oil to 170°C",
            "Double fry for crispiness",
            "Drain and serve",
          ],
          ingredients: [
            {
              name: "chicken thigh",
              amount: "600",
              unit: "g",
              category: "protein",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.35,
                Air: 0.15,
              },
            },
            {
              name: "soy sauce",
              amount: "3",
              unit: "tbsp",
              category: "seasoning",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.5,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            { name: "sake", amount: "2", unit: "tbsp", category: "seasoning" },
            {
              name: "ginger",
              amount: "1",
              unit: "tbsp",
              category: "seasoning",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.2,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "garlic",
              amount: "2",
              unit: "cloves",
              category: "seasoning",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "potato starch",
              amount: "100",
              unit: "g",
              category: "coating",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.2,
                Earth: 0.6,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            "chicken thigh": ["tofu", "cauliflower"],
            "potato starch": ["cornstarch"],
            sake: ["rice vinegar + water"],
          },
          servingSize: 4,
          allergens: ["soy"],
          prepTime: "30 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A popular izakaya dish that showcases the Japanese approach to fried foods - light, crispy, and well-seasoned",
          pairingSuggestions: [
            "beer",
            "rice",
            "shredded cabbage",
            "lemon wedges",
          ],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 380,
            protein: 28,
            carbs: 15,
            fat: 24,
            fiber: 3,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.32,
            Water: 0.24,
            Earth: 0.32,
            Air: 0.12,
          },
          mealType: ["appetizer", "main dish"],
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
