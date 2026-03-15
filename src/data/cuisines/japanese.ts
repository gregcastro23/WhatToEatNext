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
          description: "A profound Japanese noodle soup where the alchemy of slow-simmered broth, alkaline noodles, and umami-rich tare creates a deeply restorative and complex sensory experience.",
          details: {"cuisine":"Japanese","prepTimeMinutes":45,"cookTimeMinutes":720,"baseServingSize":2,"spiceLevel":"Medium","season":["winter","autumn"]},
          ingredients: [{"amount":4,"unit":"cups","name":"Pork and chicken bone broth","notes":"Simmered for 12 hours for rich mouthfeel."},{"amount":2,"unit":"portions","name":"Alkaline wheat noodles","notes":"Kansui gives them their distinct chew and yellow hue."},{"amount":4,"unit":"tbsp","name":"Shoyu tare","notes":"A concentrated seasoning blend of soy sauce, mirin, and kombu."},{"amount":4,"unit":"slices","name":"Chashu pork","notes":"Braised pork belly, rolled and sliced."},{"amount":1,"unit":"whole","name":"Ajitsuke Tamago","notes":"Soft-boiled egg marinated in soy and mirin."},{"amount":2,"unit":"tbsp","name":"Scallions","notes":"Finely chopped for aromatic sharpness."}],
          instructions: ["Step 1: The Broth. Bring the long-simmered bone broth to a rolling boil, ensuring the fat is fully emulsified into the liquid.","Step 2: The Tare. Place 2 tablespoons of the concentrated shoyu tare into the bottom of each warmed serving bowl.","Step 3: The Noodles. Boil the alkaline noodles in unsalted water for exactly 60 seconds to maintain a firm, toothsome 'katame' texture.","Step 4: The Assembly. Vigorously pour the boiling broth over the tare to mix them instantly, then fold the drained noodles into the broth, arranging them neatly.","Step 5: The Toppings. Carefully lay the chashu slices, halved marinated egg, and scallions over the noodles. Serve immediately while fiercely hot."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","boiling","braising"]},
          elementalProperties: {"Fire":0.25,"Water":0.5,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Pluto","Moon"],"signs":["scorpio","cancer"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":850,"proteinG":35,"carbsG":65,"fatG":45,"fiberG":4,"sodiumMg":1500,"sugarG":5,"vitamins":["Vitamin B12","Niacin"],"minerals":["Iron","Zinc"]},
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
          substitutions: [{"originalIngredient":"Chicken thighs","substituteOptions":["Pork belly","Shiitake mushrooms"]}]
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
          description: "A savory, highly customizable Japanese cabbage pancake, bound by a yam-infused batter and griddled to develop a crisp exterior while maintaining a soft, steamy interior, finished with an iconic crosshatch of sauces.",
          details: {"cuisine":"Japanese","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Cabbage","notes":"Finely shredded."},{"amount":1,"unit":"cup","name":"Okonomiyaki flour","notes":"Wheat flour mixed with nagaimo (mountain yam) powder for aeration."},{"amount":0.75,"unit":"cup","name":"Dashi stock","notes":"Cooled, to hydrate the batter."},{"amount":2,"unit":"large","name":"Eggs","notes":"For binding."},{"amount":4,"unit":"slices","name":"Pork belly","notes":"Thinly sliced."},{"amount":2,"unit":"tbsp","name":"Tenkasu","notes":"Tempura scraps for internal crunch."},{"amount":3,"unit":"tbsp","name":"Okonomiyaki sauce","notes":"Thick, sweet, and savory."},{"amount":2,"unit":"tbsp","name":"Kewpie mayonnaise","notes":"Rich, egg-yolk-heavy mayo."},{"amount":1,"unit":"pinch","name":"Katsuobushi and Aonori","notes":"Bonito flakes and dried seaweed powder for garnish."}],
          instructions: ["Step 1: The Batter. Whisk the okonomiyaki flour with the cool dashi stock. Let it rest for 10 minutes, then gently fold in the eggs, shredded cabbage, and tenkasu. Do not overmix; air must remain in the batter.","Step 2: The Griddle. Heat a teppan or large cast-iron skillet to 400°F (200°C). Pour the batter onto the hot surface, shaping it into a thick, 1-inch high circle.","Step 3: The Pork. Lay the thin slices of pork belly over the top of the uncooked batter.","Step 4: The Flip. Once the bottom is deeply browned (about 5 minutes), flip the pancake confidently. Press down lightly to crisp the pork belly.","Step 5: The Dress. When fully cooked, transfer to a plate. Brush generously with okonomiyaki sauce. Squeeze the mayonnaise over it in a crosshatch pattern. Sprinkle with aonori and top with katsuobushi, which will dance in the heat."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["griddling","pan-frying"]},
          elementalProperties: {"Fire":0.3,"Water":0.2,"Earth":0.35,"Air":0.15},
          astrologicalAffinities: {"planets":["Venus","Jupiter"],"signs":["taurus","sagittarius"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":550,"proteinG":22,"carbsG":45,"fatG":32,"fiberG":5,"sodiumMg":950,"sugarG":12,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Potassium","Iron"]},
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
          substitutions: [{"originalIngredient":"Shrimp","substituteOptions":["Ginkgo nuts","Extra mushrooms"]}]
        },
        {
          name: "Yakitori",
          description: "An alchemically perfected and structurally rigorous preparation of Yakitori. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Yakitori","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Yakitori","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Miso Ramen",
          description: "An alchemically perfected and structurally rigorous preparation of Miso Ramen. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Miso Ramen","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Miso Ramen","substituteOptions":["Elemental equivalent"]}]
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
          description: "An alchemically perfected and structurally rigorous preparation of Gyoza. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Gyoza","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Gyoza","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Karaage",
          description: "An alchemically perfected and structurally rigorous preparation of Karaage. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Karaage","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Karaage","substituteOptions":["Elemental equivalent"]}]
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
