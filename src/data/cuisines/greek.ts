// src/data/cuisines/greek.ts
import type { Cuisine } from "@/types/cuisine";

export const greek: Cuisine = {
  id: "greek",
  name: "Greek",
  description:
    "Traditional Greek cuisine emphasizing fresh ingredients, olive oil, herbs, and regional specialties from mainland to islands",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Bougatsa",
          description:
            "Phyllo pastry filled with semolina custard and cinnamon",
          cuisine: "Greek (Thessaloniki)",
          cookingMethods: ["layering", "baking", "custard-making"],
          tools: [
            "baking pan",
            "pastry brush",
            "saucepan",
            "whisk",
            "mixing bowls",
          ],
          preparationSteps: [
            "Prepare semolina custard and cool",
            "Layer phyllo sheets with butter",
            "Spread custard filling",
            "Top with more phyllo layers",
            "Bake until golden",
            "Dust with cinnamon and sugar",
          ],
          ingredients: [
            {
              name: "phyllo dough",
              amount: "12",
              unit: "sheets",
              category: "pastry",
              swaps: ["gluten-free phyllo"],
            },
            { name: "semolina", amount: "200", unit: "g", category: "grain" },
            {
              name: "milk",
              amount: "750",
              unit: "ml",
              category: "dairy",
              swaps: ["almond milk"],
            },
            { name: "eggs", amount: "3", unit: "large", category: "protein" },
            {
              name: "butter",
              amount: "100",
              unit: "g",
              category: "fat",
              swaps: ["olive oil"],
            },
            { name: "cinnamon", amount: "2", unit: "tsp", category: "spice" },
          ],
          substitutions: {
            phyllo: ["gluten-free phyllo"],
            milk: ["almond milk", "soy milk"],
            butter: ["olive oil"],
          },
          servingSize: 8,
          allergens: ["gluten", "dairy", "eggs"],
          prepTime: "25 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A beloved Greek breakfast pastry with origins in Byzantine cuisine, particularly associated with Thessaloniki",
          pairingSuggestions: ["Greek coffee", "fresh orange juice", "honey"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 380,
            protein: 10,
            carbs: 48,
            fat: 18,
            fiber: 3,
            vitamins: ["A", "D"],
            minerals: ["Calcium", "Iron"],
          },
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Earth: 0.5,
            Water: 0.2,
            Air: 0.2,
            Fire: 0.1,
          },
        },
        {
          "recipe_name": "Authentic Greek Yogurt with Honey and Walnuts",
          "description": "The simplest and purest expression of Greek dairy and apiary. It relies entirely on the quality of three raw ingredients. The yogurt must be authentic, full-fat, sheep or goat's milk yogurt (strained/straggisto) to provide a tart, thick, spackle-like base for the floral sweetness of raw thyme honey and the bitter tannin of walnuts.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 5,
            "cook_time_minutes": 0,
            "base_serving_size": 1,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "authentic Greek strained yogurt",
              "notes": "Full-fat (5-10%). Sheep's milk is traditional and preferred for its slight tang."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "raw Greek honey",
              "notes": "Thyme honey or pine honey is traditional. It should be thick and intensely floral."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "walnuts",
              "notes": "Roughly chopped. Briefly toasted if desired, but raw is common."
            }
          ],
          "instructions": [
            "Step 1: Chill the serving bowl. The yogurt must be served very cold.",
            "Step 2: Spoon the thick, strained yogurt into the bowl. Do not stir or whip it; keep the dense, spackle-like texture intact.",
            "Step 3: Generously drizzle the raw honey over the top. The honey should sit heavily on the surface.",
            "Step 4: Scatter the chopped walnuts over the honey.",
            "Step 5: Serve immediately. The diner should dig through the layers to get a combination of tart, sweet, and crunch in every bite."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "dessert",
              "snack",
              "raw"
            ],
            "cooking_methods": [
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.05,
            "water": 0.4,
            "earth": 0.4,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Taurus"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 350,
            "protein_g": 20,
            "carbs_g": 38,
            "fat_g": 16,
            "fiber_g": 2,
            "sodium_mg": 85,
            "sugar_g": 35,
            "vitamins": [
              "Riboflavin",
              "Vitamin B12"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "Greek yogurt",
              "substitute_options": [
                "coconut or almond milk thick yogurt (vegan)"
              ]
            },
            {
              "original_ingredient": "walnuts",
              "substitute_options": [
                "pistachios",
                "almonds"
              ]
            }
          ]
        },
        {
          name: "Strapatsada",
          description:
            "Traditional scrambled eggs with tomatoes, feta, and olive oil",
          cuisine: "Greek (Peloponnese)",
          cookingMethods: [
            "scrambling",
            {
              name: "sautéing",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.12,
                Earth: 0.18,
                Air: 0.29,
              },
            },
          ],
          tools: [
            "non-stick pan",
            "sharp knife",
            "grater",
            "wooden spoon",
            "serving plates",
          ],
          preparationSteps: [
            "Grate ripe tomatoes",
            "Heat olive oil in pan",
            "Cook tomatoes until reduced",
            "Add beaten eggs",
            "Scramble until just set",
            "Crumble feta on top",
            "Finish with oregano",
          ],
          ingredients: [
            {
              name: "eggs",
              amount: "4",
              unit: "large",
              category: "protein",
              swaps: ["tofu scramble"],
            },
            {
              name: "ripe tomatoes",
              amount: "3",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "feta cheese",
              amount: "100",
              unit: "g",
              category: "dairy",
              swaps: ["vegan feta"],
            },
            { name: "olive oil", amount: "3", unit: "tbsp", category: "oil" },
            {
              name: "dried oregano",
              amount: "1",
              unit: "tsp",
              category: "herb",
            },
            {
              name: "black pepper",
              amount: "1/4",
              unit: "tsp",
              category: "seasoning",
            },
          ],
          substitutions: {
            eggs: ["tofu scramble", "chickpea flour mixture"],
            feta: ["vegan feta", "nutritional yeast"],
            tomatoes: ["canned tomatoes", "roasted red peppers"],
          },
          servingSize: 2,
          allergens: ["eggs", "dairy"],
          prepTime: "10 minutes",
          cookTime: "15 minutes",
          culturalNotes:
            "A rustic breakfast dish that makes use of Greece's abundant tomatoes and olive oil. Popular throughout the Peloponnese region",
          pairingSuggestions: ["crusty bread", "olives", "Greek coffee"],
          dietaryInfo: ["vegetarian", "gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 420,
            protein: 24,
            carbs: 12,
            fat: 32,
            fiber: 3,
            vitamins: ["A", "C", "D"],
            minerals: ["Calcium", "Iron"],
          },
          season: ["summer", "autumn"],
          mealType: ["breakfast", "lunch"],
          elementalProperties: {
            Fire: 0.19,
            Water: 0.29,
            Earth: 0.42,
            Air: 0.1,
          },
        },
      ],
      summer: [
        {
          name: "Paximadia",
          description: "Twice-baked bread rusks with olive oil and tomatoes",
          cuisine: "Greek (Cretan)",
          ingredients: [
            {
              name: "barley rusks",
              amount: "4",
              unit: "pieces",
              category: "bread",
              swaps: ["gluten-free rusks"],
            },
            {
              name: "tomatoes",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            { name: "olive oil", amount: "4", unit: "tbsp", category: "oil" },
            { name: "oregano", amount: "2", unit: "tsp", category: "herb" },
          ],
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 42,
            fat: 16,
            fiber: 3,
            vitamins: ["C", "E"],
            minerals: ["Iron", "Fiber"],
          },
          timeToMake: "10 minutes",
          season: ["summer"],
          mealType: ["breakfast"],
          cookingMethods: ["assembling"],
          tools: ["serving plate", "grater", "knife"],
          preparationSteps: [
            "Grate tomatoes",
            "Drizzle rusks with olive oil",
            "Top with tomatoes",
            "Sprinkle with oregano",
          ],
          substitutions: {
            "barley rusks": ["gluten-free rusks", "toasted bread"],
            tomatoes: ["sun-dried tomatoes"],
          },
          servingSize: 2,
          allergens: ["gluten"],
          prepTime: "5 minutes",
          cookTime: "5 minutes",
          culturalNotes:
            "A traditional Cretan breakfast, originally made to preserve bread",
          pairingSuggestions: ["Greek coffee", "olives"],
          dietaryInfo: ["vegan"],
          spiceLevel: "none",
          elementalProperties: {
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1,
          },
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Souvlaki",
          description: "Grilled meat skewers with herbs and lemon",
          cuisine: "Greek",
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
              name: "grilling",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.06,
                Earth: 0.11,
                Air: 0.33,
              },
            },
            "skewering",
          ],
          tools: [
            "metal skewers",
            "grill",
            "mixing bowl",
            "sharp knife",
            "tongs",
          ],
          preparationSteps: [
            "Cut meat into cubes",
            "Prepare marinade",
            "Marinate meat",
            "Thread onto skewers",
            "Grill until charred",
            "Rest before serving",
          ],
          ingredients: [
            {
              name: "pork",
              amount: "1",
              unit: "kg",
              category: "protein",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.3,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "olive oil",
              amount: "1/2",
              unit: "cup",
              category: "oil",
              elementalProperties: {
                Fire: 0.4,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.2,
              },
            },
            {
              name: "lemon",
              amount: "2",
              unit: "whole",
              category: "fruit",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.2,
              },
            },
            {
              name: "garlic",
              amount: "6",
              unit: "cloves",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "oregano",
              amount: "2",
              unit: "tbsp",
              category: "herb",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.1,
                Earth: 0.2,
                Air: 0.5,
              },
            },
            {
              name: "salt",
              amount: "1",
              unit: "tbsp",
              category: "seasoning",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.1,
                Earth: 0.7,
                Air: 0.1,
              },
            },
            {
              name: "black pepper",
              amount: "1",
              unit: "tsp",
              category: "spice",
              elementalProperties: {
                Fire: 0.6,
                Water: 0.1,
                Earth: 0.2,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            pork: ["chicken", "lamb", "mushrooms"],
            "olive oil": ["vegetable oil"],
            garlic: ["garlic powder"],
          },
          servingSize: 6,
          allergens: [],
          prepTime: "20 minutes",
          cookTime: "2 hours",
          culturalNotes:
            "A traditional Greek dish often served at celebrations and family gatherings",
          pairingSuggestions: ["Greek salad", "tzatziki", "pita bread"],
          dietaryInfo: ["dairy-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 5,
            fat: 28,
            fiber: 3,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.34,
            Water: 0.15,
            Earth: 0.3,
            Air: 0.21,
          },
        },
        {
          name: "Horiatiki",
          description:
            "Traditional Greek village salad with tomatoes, cucumbers, and feta",
          cuisine: "Greek",
          cookingMethods: [
            {
              name: "chopping",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.08,
                Earth: 0.54,
                Air: 0.31,
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
            "sharp knife",
            "cutting board",
            "serving bowl",
            "measuring spoons",
          ],
          preparationSteps: [
            "Chop vegetables into chunks",
            "Slice onion thinly",
            "Combine ingredients",
            "Top with feta block",
            "Dress with oil and oregano",
            "Serve immediately",
          ],
          ingredients: [
            {
              name: "tomatoes",
              amount: "4",
              unit: "large",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.1,
              },
            },
            {
              name: "cucumber",
              amount: "1",
              unit: "large",
              category: "vegetable",
              elementalProperties: {
                Fire: 0,
                Water: 0.7,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "red onion",
              amount: "1",
              unit: "medium",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.4,
                Water: 0.2,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "green peppers",
              amount: "1",
              unit: "large",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.6,
                Water: 0.1,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "feta cheese",
              amount: "200",
              unit: "g",
              category: "dairy",
              swaps: ["vegan feta"],
            },
            {
              name: "Kalamata olives",
              amount: "100",
              unit: "g",
              category: "vegetable",
            },
            { name: "olive oil", amount: "60", unit: "ml", category: "oil" },
            {
              name: "dried oregano",
              amount: "1",
              unit: "tbsp",
              category: "herb",
            },
          ],
          substitutions: {
            feta: ["vegan feta", "tofu feta"],
            "Kalamata olives": ["black olives"],
            "red onion": ["white onion", "shallots"],
          },
          servingSize: 4,
          allergens: ["dairy"],
          prepTime: "15 minutes",
          cookTime: "0 minutes",
          culturalNotes:
            "The authentic Greek salad never includes lettuce. It's a summer dish that celebrates the ripeness of Mediterranean vegetables",
          pairingSuggestions: ["crusty bread", "grilled meat", "white wine"],
          dietaryInfo: ["vegetarian", "gluten-free", "low-carb"],
          spiceLevel: "none",
          nutrition: {
            calories: 280,
            protein: 8,
            carbs: 12,
            fat: 24,
            fiber: 3,
            vitamins: ["C", "A", "K"],
            minerals: ["Calcium", "Potassium"],
          },
          season: ["summer"],

          elementalProperties: {
            Fire: 0.27,
            Water: 0.33,
            Earth: 0.3,
            Air: 0.11,
          },
          mealType: ["lunch", "dinner", "side"],
        },
      ],
      summer: [
        {
          "recipe_name": "Authentic Greek Gemista",
          "description": "The art of summer vegetable stuffing. Firm tomatoes and bell peppers are hollowed out, their flesh pureed and combined with short-grain rice and an abundance of fresh herbs. They are then baked slowly until the rice absorbs the vegetable juices and the shells collapse into sweet, caramelized submission.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 30,
            "cook_time_minutes": 75,
            "base_serving_size": 6,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 6,
              "unit": "large",
              "name": "firm beefsteak tomatoes",
              "notes": "Tops sliced off (reserved), flesh scooped out and reserved."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "bell peppers",
              "notes": "Tops sliced off (reserved), seeds removed."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "short-grain rice (Carolina or Arborio)",
              "notes": "Rinsed well."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Divided use. High quality is essential."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely minced."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh mint",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "For depth."
            },
            {
              "amount": 1.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Peeled and cut into thick wedges, to fill the gaps in the baking pan."
            }
          ],
          "instructions": [
            "Step 1: Hollow the vegetables. Cut the tops off the tomatoes and peppers. Set the caps aside. Use a spoon to carefully hollow out the tomatoes. Place the tomato flesh in a blender and puree it.",
            "Step 2: Prepare the base. Arrange the empty tomatoes and peppers in a large, deep baking dish. Fill any large empty spaces between them with the potato wedges.",
            "Step 3: The Filling. In a large skillet, heat half the olive oil over medium heat. Sauté the onions and garlic until soft. Add the rinsed rice and toast for 1 minute.",
            "Step 4: Incorporate the liquids. Pour half of the reserved tomato puree into the skillet. Add the tomato paste, parsley, mint, salt, and pepper. Simmer for 5 minutes until the liquid is slightly absorbed. The rice will only be partially cooked.",
            "Step 5: Stuff. Spoon the rice mixture loosely into the hollowed vegetables, filling them only 3/4 of the way to the top (the rice will expand significantly). Place the reserved caps back on top.",
            "Step 6: The Bath. Pour the remaining tomato puree and the remaining olive oil over the top of all the vegetables and the potatoes. Add 1/2 cup of water to the bottom of the pan.",
            "Step 7: Bake. Preheat oven to 375°F (190°C). Cover the pan tightly with aluminum foil. Bake for 45 minutes.",
            "Step 8: Caramelize. Remove the foil and bake for another 30 minutes. The vegetables should look wrinkled, slightly charred on the edges, and the potatoes should be tender and golden.",
            "Step 9: Rest. Let them rest at room temperature for at least 30 minutes before serving. They are often eaten lukewarm or cold."
          ],
          "classifications": {
            "meal_type": [
              "dinner",
              "lunch",
              "vegan",
              "vegetarian"
            ],
            "cooking_methods": [
              "hollowing",
              "simmering",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.4,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Cancer"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 350,
            "protein_g": 6,
            "carbs_g": 48,
            "fat_g": 16,
            "fiber_g": 8,
            "sodium_mg": 620,
            "sugar_g": 10,
            "vitamins": [
              "Vitamin C",
              "Vitamin A",
              "Potassium"
            ],
            "minerals": [
              "Iron",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "short-grain rice",
              "substitute_options": [
                "quinoa",
                "bulgur wheat"
              ]
            },
            {
              "original_ingredient": "potatoes",
              "substitute_options": [
                "zucchini wedges"
              ]
            }
          ]
        },
      ],
    },
    dinner: {
      all: [
        {
          "recipe_name": "Authentic Greek Moussaka",
          "description": "A structurally complex casserole relying on precise layering and moisture control.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 60,
            "cook_time_minutes": 60,
            "base_serving_size": 8,
            "spice_level": "None",
            "season": [
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 3,
              "unit": "large",
              "name": "eggplants",
              "notes": "Salted and dried."
            }
          ],
          "instructions": [
            "Step 1: Fry vegetables.",
            "Step 2: Make meat sauce.",
            "Step 3: Make béchamel.",
            "Step 4: Layer and bake.",
            "Step 5: Rest before cutting."
          ],
          "classifications": {
            "meal_type": [
              "dinner"
            ],
            "cooking_methods": [
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.2,
            "earth": 0.45,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Jupiter"
            ],
            "signs": [
              "Taurus"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 650,
            "protein_g": 32,
            "carbs_g": 35,
            "fat_g": 42,
            "fiber_g": 6
          },
          "substitutions": []
        },
        {
          "recipe_name": "Authentic Spanakopita",
          "description": "An ancient, herbaceous pie balancing wild greens and feta.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 45,
            "cook_time_minutes": 60,
            "base_serving_size": 8,
            "spice_level": "None",
            "season": [
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "spinach",
              "notes": "Massaged to remove water."
            }
          ],
          "instructions": [
            "Step 1: Massage spinach.",
            "Step 2: Mix filling.",
            "Step 3: Layer phyllo with butter/oil.",
            "Step 4: Bake until crispy."
          ],
          "classifications": {
            "meal_type": [
              "lunch"
            ],
            "cooking_methods": [
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.2,
            "earth": 0.35,
            "air": 0.25
          },
          "astrological_affinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Taurus"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 380,
            "protein_g": 14,
            "carbs_g": 28,
            "fat_g": 26,
            "fiber_g": 4
          },
          "substitutions": []
        },
        {
          name: "Pastitsio",
          description:
            "Baked pasta casserole with spiced meat sauce and béchamel",
          cuisine: "Greek",
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
              name: "baking",
              elementalProperties: {
                Fire: 0.32,
                Water: 0.11,
                Earth: 0.21,
                Air: 0.37,
              },
            },
            {
              name: "sauce-making",
              elementalProperties: {
                Fire: 0.27,
                Water: 0.33,
                Earth: 0.2,
                Air: 0.2,
              },
            },
          ],
          tools: [
            "large baking dish",
            "pasta pot",
            "saucepan",
            "whisk",
            "wooden spoon",
          ],
          preparationSteps: [
            "Cook pasta al dente",
            "Prepare meat sauce",
            "Make béchamel sauce",
            "Layer pasta and meat",
            "Top with béchamel",
            "Bake until golden",
          ],
          ingredients: [
            {
              name: "bucatini pasta",
              amount: "500",
              unit: "g",
              category: "pasta",
              swaps: ["penne", "ziti"],
            },
            {
              name: "ground beef",
              amount: "750",
              unit: "g",
              category: "protein",
              swaps: ["lamb", "plant-based meat"],
            },
            {
              name: "onions",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "tomato paste",
              amount: "70",
              unit: "g",
              category: "vegetable",
            },
            { name: "butter", amount: "100", unit: "g", category: "dairy" },
            { name: "flour", amount: "100", unit: "g", category: "dry" },
            { name: "milk", amount: "1", unit: "L", category: "dairy" },
            { name: "eggs", amount: "3", unit: "large", category: "protein" },
            { name: "nutmeg", amount: "1/2", unit: "tsp", category: "spice" },
            { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" },
          ],
          substitutions: {
            "ground beef": ["ground lamb", "plant-based meat"],
            milk: ["plant-based milk"],
            butter: ["olive oil", "vegan butter"],
          },
          servingSize: 8,
          allergens: ["dairy", "eggs", "gluten"],
          prepTime: "45 minutes",
          cookTime: "45 minutes",
          culturalNotes:
            "A Greek interpretation of Italian baked pasta, enriched with spices that reflect the country's position between East and West",
          pairingSuggestions: [
            "Greek red wine",
            "simple green salad",
            "crusty bread",
          ],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 550,
            protein: 32,
            carbs: 45,
            fat: 28,
            fiber: 3,
            vitamins: ["B12", "D", "A"],
            minerals: ["Iron", "Calcium", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.09,
            Water: 0.2,
            Earth: 0.61,
            Air: 0.09,
          },
          mealType: ["dinner"],
        },
        {
          "recipe_name": "Authentic Greek Dolmades",
          "description": "An ancient Mediterranean art form of encasing a heavily herbed, pine-nut and currant-studded rice filling within slightly bitter, brined grape leaves. The bundles are then tightly packed and steamed in an olive oil and lemon emulsion, creating tender, self-contained flavor capsules.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 60,
            "cook_time_minutes": 45,
            "base_serving_size": 6,
            "spice_level": "None",
            "season": [
              "spring",
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "jar (about 60 leaves)",
              "name": "grape leaves in brine",
              "notes": "Carefully unrolled, rinsed, and stems snipped off."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "short-grain rice (e.g., Arborio or Carolina)",
              "notes": "Rinsed well."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Divided; half for the filling, half for the cooking liquid."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely minced."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "fresh dill",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.5,
              "unit": "bunch",
              "name": "fresh mint",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "pine nuts",
              "notes": "Lightly toasted."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "dried currants",
              "notes": "For a subtle sweetness."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "Crucial for the cooking broth."
            },
            {
              "amount": 1.5,
              "unit": "cups",
              "name": "hot water or vegetable broth",
              "notes": "For steaming."
            }
          ],
          "instructions": [
            "Step 1: Prep the leaves. Bring a large pot of water to a boil. Blanch the rinsed grape leaves in batches for 2 minutes to soften them further. Drain and set aside.",
            "Step 2: The Filling. In a skillet, heat 1/4 cup of olive oil. Sauté the minced onions until soft. Remove from heat. Stir in the raw rinsed rice, dill, mint, pine nuts, currants, salt, and pepper. Mix thoroughly.",
            "Step 3: Rolling. Lay a grape leaf flat on a cutting board, shiny side down, vein side up. Place 1 heaping teaspoon of the rice mixture near the stem end. Fold the bottom two lobes up over the filling. Fold the sides inward tightly. Roll tightly toward the tip of the leaf, like a small cigar. Repeat until filling is gone.",
            "Step 4: The Base. Line the bottom of a wide, heavy pot or Dutch oven with any torn or unused grape leaves. This prevents the dolmades from burning.",
            "Step 5: Pack the pot. Arrange the rolled dolmades seam-side down in the pot, packing them very tightly together in concentric circles. Create a second layer if necessary.",
            "Step 6: The Emulsion. Pour the remaining 1/4 cup olive oil, the lemon juice, and the hot water over the dolmades. The liquid should just barely cover the top layer.",
            "Step 7: The Weight. Place an inverted, heat-proof dinner plate directly on top of the dolmades to weigh them down and prevent them from unrolling during cooking.",
            "Step 8: Cook. Bring the liquid to a gentle simmer over medium heat. Reduce heat to low, cover the pot, and simmer for 40-45 minutes until the rice is completely tender and has absorbed the liquid.",
            "Step 9: Cool. Remove from heat and let them cool completely in the pot. Dolmades are traditionally served at room temperature or chilled."
          ],
          "classifications": {
            "meal_type": [
              "appetizer",
              "meze",
              "vegan"
            ],
            "cooking_methods": [
              "blanching",
              "rolling",
              "steaming"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.3,
            "earth": 0.4,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Earth",
              "Venus"
            ],
            "signs": [
              "Virgo",
              "Taurus"
            ],
            "lunar_phases": [
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 280,
            "protein_g": 4,
            "carbs_g": 32,
            "fat_g": 16,
            "fiber_g": 5,
            "sodium_mg": 580,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin A",
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Manganese",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "grape leaves",
              "substitute_options": [
                "blanched cabbage leaves",
                "Swiss chard leaves"
              ]
            },
            {
              "original_ingredient": "pine nuts and currants",
              "substitute_options": [
                "ground lamb or beef (for a meat version, omit currants)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Greek Galaktoboureko",
          "description": "A masterpiece of Hellenic pastry alchemy.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 30,
            "cook_time_minutes": 50,
            "base_serving_size": 12,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "package",
              "name": "phyllo dough",
              "notes": "Thawed."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "fine semolina flour",
              "notes": "For custard base."
            }
          ],
          "instructions": [
            "Step 1: Prepare and cool syrup.",
            "Step 2: Make semolina custard.",
            "Step 3: Layer phyllo.",
            "Step 4: Bake.",
            "Step 5: Pour cold syrup over hot pastry."
          ],
          "classifications": {
            "meal_type": [
              "dessert"
            ],
            "cooking_methods": [
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.25,
            "water": 0.3,
            "earth": 0.3,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Taurus"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 9,
            "carbs_g": 65,
            "fat_g": 22,
            "fiber_g": 1
          },
          "substitutions": []
        },
        {
          "recipe_name": "Authentic Fasolada",
          "description": "Considered the national dish of Greece.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 720,
            "cook_time_minutes": 120,
            "base_serving_size": 6,
            "spice_level": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "white beans",
              "notes": "Soaked."
            }
          ],
          "instructions": [
            "Step 1: Boil beans.",
            "Step 2: Simmer with vegetables.",
            "Step 3: Emulsify with olive oil at the end."
          ],
          "classifications": {
            "meal_type": [
              "soup"
            ],
            "cooking_methods": [
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.4,
            "earth": 0.45,
            "air": 0.05
          },
          "astrological_affinities": {
            "planets": [
              "Earth"
            ],
            "signs": [
              "Taurus"
            ],
            "lunar_phases": [
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 410,
            "protein_g": 14,
            "carbs_g": 45,
            "fat_g": 20,
            "fiber_g": 12
          },
          "substitutions": []
        },
        {
          name: "Youvetsi",
          description: "Baked orzo pasta with lamb in tomato sauce",
          cuisine: "Greek",
          cookingMethods: [
            {
              name: "braising",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.35,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "baking",
              elementalProperties: {
                Fire: 0.32,
                Water: 0.11,
                Earth: 0.21,
                Air: 0.37,
              },
            },
          ],
          tools: [
            "Dutch oven",
            "baking dish",
            "sharp knife",
            "wooden spoon",
            "strainer",
          ],
          preparationSteps: [
            "Brown meat in batches",
            "Sauté aromatics",
            "Add tomatoes and stock",
            "Transfer to baking dish",
            "Add orzo and bake",
            "Rest before serving",
          ],
          ingredients: [
            {
              name: "lamb shoulder",
              amount: "1",
              unit: "kg",
              category: "protein",
              swaps: ["beef"],
            },
            { name: "orzo pasta", amount: "500", unit: "g", category: "pasta" },
            {
              name: "onions",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "garlic",
              amount: "4",
              unit: "cloves",
              category: "vegetable",
            },
            {
              name: "tomatoes",
              amount: "800",
              unit: "g",
              category: "vegetable",
            },
            { name: "cinnamon", amount: "1", unit: "stick", category: "spice" },
            { name: "olive oil", amount: "80", unit: "ml", category: "oil" },
          ],
          substitutions: {
            lamb: ["beef chuck", "mushrooms"],
            orzo: ["small pasta", "rice"],
            tomatoes: ["canned tomatoes"],
          },
          servingSize: 6,
          allergens: ["gluten"],
          prepTime: "30 minutes",
          cookTime: "2 hours",
          culturalNotes:
            "A hearty one-pot meal that showcases the Greek love of pasta dishes and slow-cooked meats",
          pairingSuggestions: [
            "grated kefalotyri cheese",
            "Greek red wine",
            "simple salad",
          ],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 580,
            protein: 35,
            carbs: 65,
            fat: 22,
            fiber: 3,
            vitamins: ["B12", "A"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["autumn", "winter"],

          elementalProperties: {
            Fire: 0.31,
            Water: 0.17,
            Earth: 0.45,
            Air: 0.08,
          },
          mealType: ["dinner"],
        },
        {
          name: "Revithia",
          description: "Traditional Greek chickpea soup with lemon and herbs",
          cuisine: "Greek",
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
              name: "soaking",
              elementalProperties: {
                Fire: 0,
                Water: 0.75,
                Earth: 0.17,
                Air: 0.08,
              },
            },
          ],
          tools: [
            "large pot",
            "colander",
            "wooden spoon",
            "measuring cups",
            "sharp knife",
          ],
          preparationSteps: [
            "Soak chickpeas overnight",
            "Drain and rinse",
            "Sauté aromatics",
            "Add chickpeas and stock",
            "Simmer until tender",
            "Season with lemon",
          ],
          ingredients: [
            {
              name: "chickpeas",
              amount: "500",
              unit: "g",
              category: "legume",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.2,
                Earth: 0.6,
                Air: 0.1,
              },
            },
            {
              name: "onions",
              amount: "2",
              unit: "medium",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.4,
                Water: 0.2,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "garlic",
              amount: "4",
              unit: "cloves",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "olive oil",
              amount: "80",
              unit: "ml",
              category: "oil",
              elementalProperties: {
                Fire: 0.4,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.2,
              },
            },
            {
              name: "bay leaves",
              amount: "2",
              unit: "whole",
              category: "herb",
            },
            {
              name: "lemons",
              amount: "2",
              unit: "whole",
              category: "citrus",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.2,
              },
            },
            {
              name: "rosemary",
              amount: "2",
              unit: "sprigs",
              category: "herb",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.1,
                Earth: 0.1,
                Air: 0.5,
              },
            },
          ],
          substitutions: {
            chickpeas: ["canned chickpeas"],
            rosemary: ["thyme"],
            lemons: ["lemon juice"],
          },
          servingSize: 6,
          allergens: ["none"],
          prepTime: "overnight + 15 minutes",
          cookTime: "90 minutes",
          culturalNotes:
            "A staple of Greek fasting periods, this hearty soup demonstrates the simplicity and nutrition of Mediterranean cooking",
          pairingSuggestions: [
            "crusty bread",
            "olives",
            "raw onion",
            "olive oil",
          ],
          dietaryInfo: ["vegan", "gluten-free"],
          spiceLevel: "none",
          nutrition: {
            calories: 290,
            protein: 15,
            carbs: 42,
            fat: 10,
            fiber: 3,
            vitamins: ["B6", "C"],
            minerals: ["Iron", "Folate", "Magnesium"],
          },
          season: ["autumn", "winter"],

          elementalProperties: {
            Fire: 0.28,
            Water: 0.23,
            Earth: 0.29,
            Air: 0.2,
          },
          mealType: ["lunch", "dinner"],
        },
        {
          "recipe_name": "Authentic Greek Gigantes Plaki",
          "description": "A slow-baked, magnificent agrarian dish utilizing giant white beans (Gigantes or Corona). The beans are first boiled until tender, then transferred to a pan and baked slowly in a rich, olive-oil-heavy tomato and herb sauce until the sauce caramelizes and the top layer of beans becomes crusty and slightly charred.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 720,
            "cook_time_minutes": 180,
            "base_serving_size": 6,
            "spice_level": "None",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "dried Gigantes beans or large Lima/Corona beans",
              "notes": "Must be soaked overnight."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Divided use. High quality."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "red onions",
              "notes": "Thinly sliced."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "Canned or fresh."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "For depth."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Roughly chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh dill",
              "notes": "Roughly chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "honey or sugar",
              "notes": "To balance the acidity of the tomatoes."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Added late."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            }
          ],
          "instructions": [
            "Step 1: Soak. Soak the dried beans in plenty of cold water overnight (12-24 hours). Drain and rinse.",
            "Step 2: Boil. Place the beans in a large pot, cover with fresh water by 2 inches. Bring to a boil, skim the foam, reduce heat, and simmer until they are just tender but still hold their shape completely (about 45-60 mins). Drain, reserving 1 cup of the cooking water.",
            "Step 3: The Sauce. In a skillet, heat half the olive oil over medium heat. Sauté the sliced onions until deeply softened and golden (10 mins). Add the garlic and tomato paste, cooking for 1 minute.",
            "Step 4: Combine. Add the crushed tomatoes, honey, parsley, dill, salt, and pepper to the skillet. Simmer for 5 minutes.",
            "Step 5: Assemble for baking. Preheat oven to 375°F (190°C). Transfer the boiled beans to a 9x13-inch baking dish. Pour the tomato/onion sauce evenly over the beans. Add the reserved 1 cup of bean cooking water. Drizzle the remaining 1/4 cup of olive oil over the top.",
            "Step 6: Bake (Plaki). Bake uncovered for 1 hour to 1 hour and 15 minutes. The liquid should reduce to a thick, oily glaze, and the beans on the top layer should develop a darkened, crusty exterior. Do not stir them while baking.",
            "Step 7: Serve warm or at room temperature. It is essential to serve with crusty bread to mop up the seasoned olive oil."
          ],
          "classifications": {
            "meal_type": [
              "dinner",
              "lunch",
              "vegan",
              "vegetarian"
            ],
            "cooking_methods": [
              "boiling",
              "baking",
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.3,
            "earth": 0.4,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Earth",
              "Saturn"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 18,
            "carbs_g": 52,
            "fat_g": 18,
            "fiber_g": 14,
            "sodium_mg": 480,
            "sugar_g": 9,
            "vitamins": [
              "Folate",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Magnesium",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "Gigantes beans",
              "substitute_options": [
                "butter beans",
                "large lima beans"
              ]
            },
            {
              "original_ingredient": "honey",
              "substitute_options": [
                "maple syrup (vegan)",
                "granulated sugar"
              ]
            }
          ]
        },
        {
          name: "Keftedes",
          description: "Greek meatballs with herbs and spices",
          cuisine: "Greek",
          cookingMethods: [
            {
              name: "mixing",
              elementalProperties: {
                Fire: 0.07,
                Water: 0.21,
                Earth: 0.21,
                Air: 0.5,
              },
            },
            {
              name: "frying",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.12,
                Earth: 0.18,
                Air: 0.29,
              },
            },
          ],
          tools: [
            "mixing bowl",
            "frying pan",
            "measuring spoons",
            "paper towels",
            "tongs",
          ],
          preparationSteps: [
            "Soak bread in milk",
            "Mix meat and seasonings",
            "Form small meatballs",
            "Chill for 30 minutes",
            "Fry until golden",
            "Drain on paper towels",
          ],
          ingredients: [
            {
              name: "ground beef",
              amount: "500",
              unit: "g",
              category: "protein",
              swaps: ["lamb"],
            },
            {
              name: "ground pork",
              amount: "250",
              unit: "g",
              category: "protein",
            },
            {
              name: "onion",
              amount: "1",
              unit: "large",
              category: "vegetable",
            },
            {
              name: "garlic",
              amount: "3",
              unit: "cloves",
              category: "vegetable",
            },
            { name: "mint", amount: "1/4", unit: "cup", category: "herb" },
            { name: "bread", amount: "2", unit: "slices", category: "grain" },
            { name: "milk", amount: "60", unit: "ml", category: "dairy" },
            { name: "olive oil", amount: "120", unit: "ml", category: "oil" },
          ],
          substitutions: {
            "ground meat": ["plant-based meat"],
            bread: ["gluten-free bread"],
            milk: ["plant-based milk"],
          },
          servingSize: 6,
          allergens: ["gluten", "dairy"],
          prepTime: "45 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A popular meze that appears at most Greek celebrations. The mint and dried oregano give them their distinctive flavor",
          pairingSuggestions: ["tzatziki", "lemon wedges", "pita bread"],
          dietaryInfo: ["contains meat"],
          spiceLevel: "mild",
          nutrition: {
            calories: 380,
            protein: 28,
            carbs: 12,
            fat: 26,
            fiber: 3,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.33,
            Water: 0.13,
            Earth: 0.41,
            Air: 0.13,
          },
          mealType: ["appetizer", "main"],
        },
        {
          "recipe_name": "Authentic Galatopita",
          "description": "A rustic, crustless Greek milk pie. It is an exercise in simple agrarian alchemy: milk is thickened with semolina into a dense custard, enriched with eggs and butter, and baked until the top forms a naturally scorched, caramelized skin, requiring no phyllo pastry.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 15,
            "cook_time_minutes": 50,
            "base_serving_size": 8,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "liter",
              "name": "whole milk",
              "notes": "Must be whole milk for proper texture."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "fine semolina flour",
              "notes": "The primary thickener."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For sweetness and caramelization."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "pure vanilla extract",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "lemon zest",
              "notes": "Freshly grated."
            },
            {
              "amount": 50,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Stirred into the hot custard."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "butter",
              "notes": "For heavily greasing the baking pan."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ground cinnamon",
              "notes": "For heavy dusting before serving."
            }
          ],
          "instructions": [
            "Step 1: Preheat oven to 350°F (175°C). Heavily butter a 9-inch round or square baking dish.",
            "Step 2: Heat the milk. In a medium saucepan, warm the milk over medium heat until it begins to steam (do not boil).",
            "Step 3: Thicken. Slowly whisk in the semolina and sugar in a steady stream. Continue whisking constantly for 5-8 minutes until the mixture thickens into a heavy porridge. Remove from heat.",
            "Step 4: Enrich. Immediately stir in the 50g of butter, vanilla extract, and lemon zest until the butter melts completely.",
            "Step 5: Temper the eggs. In a small bowl, have the beaten eggs ready. Slowly whisk about 1/2 cup of the hot semolina mixture into the eggs to temper them. Then, rapidly whisk the egg mixture back into the main saucepan until completely smooth.",
            "Step 6: Bake. Pour the custard into the prepared baking dish. Smooth the top with a spatula.",
            "Step 7: The Crust. Bake for 45-50 minutes. The pie will puff up significantly and the top must become deeply golden brown with dark, almost burnt-looking patches. This scorched skin is the signature of the dish.",
            "Step 8: Cool. Remove from the oven. It will deflate as it cools. You must let it cool completely to room temperature (at least 2 hours) so the semolina sets firmly enough to slice.",
            "Step 9: Garnish. Dust generously with ground cinnamon before cutting into squares or wedges."
          ],
          "classifications": {
            "meal_type": [
              "dessert",
              "snack"
            ],
            "cooking_methods": [
              "whisking",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.35,
            "earth": 0.35,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Taurus",
              "Cancer"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 250,
            "protein_g": 8,
            "carbs_g": 35,
            "fat_g": 9,
            "fiber_g": 1,
            "sodium_mg": 85,
            "sugar_g": 22,
            "vitamins": [
              "Vitamin D",
              "Riboflavin"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "semolina flour",
              "substitute_options": [
                "farina (Cream of Wheat)"
              ]
            },
            {
              "original_ingredient": "whole milk",
              "substitute_options": [
                "oat milk (will be less rich and may require slightly more semolina)"
              ]
            }
          ]
        },
        {
          name: "Skordalia",
          description: "Garlic and potato dip with olive oil",
          cuisine: "Greek",
          cookingMethods: ["boiling", "mashing", "emulsifying"],
          tools: [
            "potato masher",
            "food processor",
            "saucepan",
            "fine strainer",
            "mixing bowl",
          ],
          preparationSteps: [
            "Boil potatoes",
            "Mash while hot",
            "Crush garlic",
            "Gradually add oil",
            "Season to taste",
            "Rest before serving",
          ],
          ingredients: [
            {
              name: "potatoes",
              amount: "500",
              unit: "g",
              category: "vegetable",
            },
            {
              name: "garlic",
              amount: "8",
              unit: "cloves",
              category: "vegetable",
            },
            { name: "olive oil", amount: "200", unit: "ml", category: "oil" },
            {
              name: "lemon juice",
              amount: "2",
              unit: "tbsp",
              category: "acid",
            },
            {
              name: "white wine vinegar",
              amount: "1",
              unit: "tbsp",
              category: "acid",
            },
            {
              name: "almonds",
              amount: "50",
              unit: "g",
              category: "nuts",
              optional: true,
            },
          ],
          substitutions: {
            potatoes: ["bread", "almonds"],
            garlic: ["roasted garlic"],
            almonds: ["walnuts", "omit"],
          },
          servingSize: 6,
          allergens: ["nuts (if using)"],
          prepTime: "20 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A powerful garlic dip traditionally served with fried fish or vegetables. Regional variations use bread or nuts instead of potatoes",
          pairingSuggestions: [
            "fried cod",
            "beetroot",
            "bread",
            "raw vegetables",
          ],
          dietaryInfo: ["vegan", "gluten-free"],
          spiceLevel: "medium",
          nutrition: {
            calories: 260,
            protein: 3,
            carbs: 18,
            fat: 22,
            fiber: 3,
            vitamins: ["C", "B6"],
            minerals: ["Potassium", "Magnesium"],
          },
          season: ["all"],
          mealType: ["appetizer", "sauce"],
        },
        {
          name: "Melitzanosalata",
          description: "Smoky eggplant dip with garlic and olive oil",
          cuisine: "Greek",
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
              name: "mashing",
              elementalProperties: {
                Fire: 0.11,
                Water: 0.21,
                Earth: 0.5,
                Air: 0.18,
              },
            },
          ],
          tools: [
            "grill",
            "food processor",
            "sharp knife",
            "mixing bowl",
            "colander",
          ],
          preparationSteps: [
            "Grill eggplants until charred",
            "Drain excess liquid",
            "Remove skin",
            "Mash with garlic",
            "Add oil gradually",
            "Season to taste",
          ],
          ingredients: [
            {
              name: "eggplants",
              amount: "2",
              unit: "large",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.3,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "garlic",
              amount: "3",
              unit: "cloves",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "olive oil",
              amount: "80",
              unit: "ml",
              category: "oil",
              elementalProperties: {
                Fire: 0.4,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.2,
              },
            },
            {
              name: "lemon juice",
              amount: "2",
              unit: "tbsp",
              category: "acid",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.2,
              },
            },
            {
              name: "parsley",
              amount: "1/4",
              unit: "cup",
              category: "herb",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.2,
                Earth: 0.2,
                Air: 0.5,
              },
            },
            {
              name: "red onion",
              amount: "1/2",
              unit: "small",
              category: "vegetable",
              optional: true,
              elementalProperties: {
                Fire: 0.4,
                Water: 0.2,
                Earth: 0.3,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            eggplants: ["roasted red peppers"],
            "red onion": ["shallots", "omit"],
            parsley: ["dill"],
          },
          servingSize: 6,
          allergens: ["none"],
          prepTime: "15 minutes",
          cookTime: "30 minutes",
          culturalNotes:
            "A smoky dip that showcases the Greek mastery of eggplant preparation. The charring process is crucial for authentic flavor",
          pairingSuggestions: ["pita bread", "crudités", "grilled meat"],
          dietaryInfo: ["vegan", "gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 120,
            protein: 2,
            carbs: 8,
            fat: 10,
            fiber: 3,
            vitamins: ["C", "B6"],
            minerals: ["Potassium", "Manganese"],
          },
          season: ["summer", "autumn"],

          elementalProperties: {
            Fire: 0.37,
            Water: 0.16,
            Earth: 0.26,
            Air: 0.21,
          },
          mealType: ["appetizer", "meze"],
        },
      ],
    },
    dessert: {
      all: [
        // ... dessert dishes
      ],
    },
  },
  traditionalSauces: {
    tzatziki: {
      name: "Tzatziki",
      description: "Cooling yogurt and cucumber sauce with garlic and herbs",
      base: "yogurt",
      keyIngredients: [
        "Greek yogurt",
        "cucumber",
        "garlic",
        "olive oil",
        "dill",
      ],
      culinaryUses: ["dipping sauce", "condiment", "marinade", "meze"],
      variants: ["Mint tzatziki", "Spicy tzatziki", "Avocado tzatziki"],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Air: 0.2,
        Fire: 0.0,
      },
      astrologicalInfluences: ["Moon", "Venus", "Cancer"],
      seasonality: "all",
      preparationNotes:
        "Properly draining the cucumber is key to a thick consistency",
      technicalTips:
        "Salt and drain cucumbers for at least 30 minutes before mixing",
    },
    avgolemono: {
      name: "Avgolemono",
      description: "Silky egg and lemon sauce that thickens soups and stews",
      base: "eggs and lemon",
      keyIngredients: [
        "eggs",
        "lemon juice",
        "broth",
        "rice or orzo (optional)",
      ],
      culinaryUses: [
        "soup base",
        "sauce for dolmades",
        "fish sauce",
        "vegetable dressing",
      ],
      variants: ["Thick sauce", "Soup form", "Vegetable avgolemono"],
      elementalProperties: {
        Water: 0.4,
        Air: 0.3,
        Fire: 0.2,
        Earth: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Moon", "Gemini"],
      seasonality: "winter, spring",
      preparationNotes:
        "The key is to temper the eggs properly to avoid curdling",
      technicalTips:
        "Add hot broth to eggs very slowly while whisking constantly",
    },
    ladolemono: {
      name: "Ladolemono",
      description: "Simple but powerful emulsion of olive oil and lemon juice",
      base: "olive oil and lemon",
      keyIngredients: [
        "extra virgin olive oil",
        "lemon juice",
        "garlic",
        "oregano",
      ],
      culinaryUses: [
        "dressing for grilled foods",
        "marinade",
        "seafood sauce",
        "vegetable dressing",
      ],
      variants: ["Mustard ladolemono", "Herb-infused", "Spicy version"],
      elementalProperties: {
        Air: 0.5,
        Fire: 0.2,
        Earth: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Sun", "Mercury", "Leo"],
      seasonality: "all",
      preparationNotes:
        "The ratio is typically 3 parts oil to 1 part lemon juice",
      technicalTips: "Whisk vigorously or blend for proper emulsification",
    },
    skordalia: {
      name: "Skordalia",
      description: "Pungent garlic sauce made with potato, bread, or nuts",
      base: "garlic and starch",
      keyIngredients: [
        "garlic",
        "potato or bread",
        "olive oil",
        "vinegar",
        "almonds (optional)",
      ],
      culinaryUses: ["fish accompaniment", "vegetable dip", "spread", "meze"],
      variants: ["Potato skordalia", "Bread skordalia", "Almond skordalia"],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Air: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mars", "Saturn", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Achieving the right balance of garlic is crucial - adjust to taste",
      technicalTips:
        "Slowly incorporate oil while blending for proper emulsification",
    },
    htipiti: {
      name: "Htipiti",
      description: "Spicy roasted red pepper and feta dip",
      base: "roasted peppers and cheese",
      keyIngredients: [
        "roasted red peppers",
        "feta cheese",
        "olive oil",
        "garlic",
        "chili",
      ],
      culinaryUses: [
        "bread spread",
        "vegetable dip",
        "sandwich filling",
        "meze",
      ],
      variants: ["Spicy htipiti", "Smoky htipiti", "Creamy htipiti"],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.3,
        Water: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Leo"],
      seasonality: "summer, autumn",
      preparationNotes:
        "The smokiness of the peppers is essential for authentic flavor",
      technicalTips: "Roast peppers directly over flame for best smoky taste",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: ["ladolemono", "avgolemono", "tomato-based sauce"],
      lamb: ["tzatziki", "ladolemono", "minty yogurt sauce"],
      fish: ["skordalia", "ladolemono", "avgolemono", "lemon sauce"],
      beef: ["tomato-based sauce", "yogurt-based sauce", "red wine reduction"],
      vegetable: ["skordalia", "tzatziki", "tahini sauce"],
      seafood: ["ladolemono", "skordalia", "garlic oil", "lemon sauce"],
      pork: ["ladolemono", "htipiti", "mustard sauce"],
    },
    forVegetable: {
      leafy: ["ladolemono", "tahini sauce", "yogurt-based sauce"],
      root: ["skordalia", "olive oil and lemon", "tomato-based sauce"],
      eggplant: ["tzatziki", "tomato sauce", "tahini sauce", "garlic sauce"],
      legumes: [
        "olive oil and lemon",
        "tomato sauce",
        "herb oil",
        "vinegar sauce",
      ],
      squash: ["yogurt sauce", "tahini", "olive oil and herbs"],
      zucchini: ["tzatziki", "mint sauce", "ladolemono"],
    },
    forCookingMethod: {
      grilling: ["tzatziki", "ladolemono", "herb oil", "htipiti"],
      roasting: [
        "skordalia",
        "yogurt sauce",
        "olive oil and lemon",
        "avgolemono",
      ],
      braising: [
        "avgolemono",
        "tomato sauce",
        "olive oil finish",
        "red wine sauce",
      ],
      frying: ["tzatziki", "skordalia", "lemon wedges", "garlic sauce"],
      stewing: [
        "avgolemono",
        "olive oil finish",
        "herb oil",
        "red wine reduction",
      ],
      baking: ["ladolemono", "yogurt sauce", "lemon sauce"],
    },
    byAstrological: {
      fire: [
        "spicy yogurt sauce",
        "red pepper-based sauce",
        "garlic oil",
        "htipiti",
      ],
      earth: [
        "skordalia",
        "mushroom-based sauce",
        "tahini sauce",
        "olive tapenade",
      ],
      air: [
        "ladolemono",
        "herb-infused oil",
        "light yogurt sauce",
        "lemon vinaigrette",
      ],
      water: ["avgolemono", "tzatziki", "cucumber-based sauce", "fish sauce"],
    },
    byRegion: {
      mainland: ["skordalia", "tomato-based sauces", "avgolemono", "htipiti"],
      islands: ["ladolemono", "herb oils", "fish-based sauces", "lemon sauces"],
      northern: [
        "butter-based sauces",
        "yogurt sauces",
        "paprika oil",
        "garlic sauce",
      ],
      crete: [
        "herb-infused olive oil",
        "wine reductions",
        "dakos-style sauce",
        "ancient grain sauces",
      ],
      peloponnese: [
        "oil and lemon sauces",
        "oregano-infused oils",
        "wine reductions",
      ],
      cyclades: [
        "caper sauces",
        "olive pastes",
        "fresh herb oils",
        "seafood reductions",
      ],
    },
    byDietary: {
      vegetarian: [
        "tahini sauce",
        "skordalia",
        "olive oil and lemon",
        "htipiti",
      ],
      vegan: ["ladolemono", "tahini sauce", "herb oil", "olive tapenade"],
      glutenFree: ["tzatziki", "ladolemono", "herb oil", "yogurt-based sauces"],
      dairyFree: [
        "ladolemono",
        "tomato-based sauce",
        "herb oil",
        "garlic sauce",
      ],
      lowCarb: ["tzatziki", "olive oil dips", "lemon sauce", "herb sauce"],
    },
  },
  cookingTechniques: [
    {
      name: "Psisimo",
      description:
        "Greek-style grilling, often using olive oil, lemon, and herbs",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: ["charcoal grill", "skewers", "brush for oil", "tongs"],
      bestFor: ["lamb", "pork", "chicken", "seafood", "vegetables"],
      difficulty: "easy",
    },
    {
      name: "Stifado",
      description: "Slow-cooked stew with pearl onions, wine, and tomatoes",
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "heavy pot",
        "wooden spoon",
        "sharp knife",
        "measuring cups",
      ],
      bestFor: ["beef", "rabbit", "game meat", "octopus"],
      difficulty: "medium",
    },
    {
      name: "Sotirito",
      description: "Shallow frying, often used for vegetables and fritters",
      elementalProperties: { Fire: 0.5, Air: 0.3, Earth: 0.1, Water: 0.1 },
      toolsRequired: [
        "heavy-bottomed pan",
        "slotted spoon",
        "paper towels",
        "thermometer",
      ],
      bestFor: ["zucchini fritters", "eggplant", "fish", "meatballs"],
      difficulty: "medium",
    },
    {
      name: "Yiachni",
      description: "Braising in tomato sauce with herbs and spices",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "Dutch oven",
        "wooden spoon",
        "sharp knife",
        "measuring spoons",
      ],
      bestFor: ["green beans", "okra", "rabbit", "beef"],
      difficulty: "easy",
    },
    {
      name: "Plasto",
      description:
        "Traditional pie-making technique with layered phyllo or other dough",
      elementalProperties: { Earth: 0.5, Air: 0.3, Water: 0.1, Fire: 0.1 },
      toolsRequired: [
        "baking pan",
        "pastry brush",
        "rolling pin",
        "sharp knife",
      ],
      bestFor: ["spinach pie", "cheese pie", "meat pie", "vegetable pie"],
      difficulty: "hard",
    },
  ],
  regionalCuisines: {
    crete: {
      name: "Cretan Cuisine",
      description:
        "Focused on local ingredients, wild greens, olive oil, and rustic preparation methods",
      signature: ["dakos", "gamopilafo", "staka", "sfakian pie"],
      elementalProperties: { Earth: 0.5, Air: 0.2, Fire: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Saturn", "Jupiter", "Taurus"],
      seasonality: "all",
    },
    macedonia: {
      name: "Macedonian Cuisine",
      description:
        "Northern Greek cuisine with strong Balkan influences and hearty dishes",
      signature: ["bougatsa", "pastitsada", "gigantes plaki", "trahana soup"],
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Mars", "Capricorn"],
      seasonality: "all",
    },
    cyclades: {
      name: "Cycladic Cuisine",
      description:
        "Island cuisine featuring seafood, local cheeses, and sun-dried ingredients",
      signature: [
        "fava dip",
        "kakavia fish soup",
        "matsata pasta",
        "louza cured pork",
      ],
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      astrologicalInfluences: ["Neptune", "Moon", "Pisces"],
      seasonality: "all",
    },
    peloponnese: {
      name: "Peloponnesian Cuisine",
      description:
        "Rich in olive oil, citrus, and slow-cooked meat and bean dishes",
      signature: [
        "rooster kokkinisto",
        "diples",
        "kagianas",
        "lagoto rabbit stew",
      ],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Venus", "Aries"],
      seasonality: "all",
    },
  },
  elementalProperties: {
    Earth: 0.4,
    Water: 0.3,
    Fire: 0.2,
    Air: 0.1,
  },
};

export default greek;
