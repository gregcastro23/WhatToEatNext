// src/data/cuisines/mexican.ts
export const mexican = {
  name: "Mexican",
  description:
    "Traditional Mexican cuisine featuring regional specialties, corn-based dishes, and diverse moles and salsas",
  dishes: {
    breakfast: {
      all: [
        {
          "recipe_name": "Authentic Huevos Rancheros",
          "description": "A robust, deeply flavorful Mexican breakfast historically served to rural farm workers (rancheros). It features lightly fried corn tortillas layered with refried black beans, sunny-side-up eggs, and smothered in a vibrant, slightly spicy roasted tomato and chili salsa. It perfectly balances the elemental fire of the salsa with the earthy sustenance of corn and beans.",
          "details": {
            "cuisine": "Mexican",
            "prep_time_minutes": 15,
            "cook_time_minutes": 25,
            "base_serving_size": 2,
            "spice_level": "Medium",
            "season": [
              "summer",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "medium",
              "name": "Roma tomatoes",
              "notes": "Core removed, left whole for roasting or boiling for the ranchero sauce."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "jalapeño or serrano pepper",
              "notes": "Stem removed. Seeded if less heat is desired."
            },
            {
              "amount": 0.5,
              "unit": "medium",
              "name": "white onion",
              "notes": "Roughly chopped for the sauce."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Peeled."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "refried black beans (frijoles refritos)",
              "notes": "Preferably cooked with epazote and a touch of lard or oil for authenticity."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "corn tortillas",
              "notes": "Day-old tortillas work best as they absorb less oil."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Ideally farm-fresh for vibrant, rich yolks."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "neutral oil or pork lard",
              "notes": "Divided use: for frying tortillas, eggs, and sautéing the sauce."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Divided to taste."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "queso fresco or cotija cheese",
              "notes": "Crumbled for garnish."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "Roughly chopped for garnish."
            },
            {
              "amount": 0.5,
              "unit": "whole",
              "name": "ripe avocado",
              "notes": "Sliced for garnish."
            }
          ],
          "instructions": [
            "Step 1: Prepare the Ranchero Sauce (Salsa Ranchera). Heat a dry cast-iron skillet or comal over medium-high heat. Char the tomatoes, jalapeño, onion, and garlic until blistered and blackened in spots. Alternatively, boil them in water for 10 minutes until soft.",
            "Step 2: Transfer the charred or boiled vegetables to a blender. Blend until smooth but retaining slightly rustic texture. Season with salt.",
            "Step 3: In a medium saucepan, heat 1 tablespoon of oil or lard over medium heat. Carefully pour in the blended salsa (it will splatter). Reduce heat and simmer for 10 minutes until the sauce deepens in color and thickens. Keep warm.",
            "Step 4: In a separate small saucepan, gently warm the refried black beans. Stir in a splash of water if they are too thick to spread easily. Keep warm.",
            "Step 5: Heat 2 tablespoons of oil in a large skillet over medium-high heat. Briefly fry the corn tortillas one by one, about 10-15 seconds per side. They should become pliable and slightly blistered, but not crispy like a tostada. Drain on paper towels.",
            "Step 6: In the same skillet, add a little more oil if needed. Fry the eggs sunny-side up (or to your preference), occasionally basting the whites with the hot oil to set them while keeping the yolks runny.",
            "Step 7: Assemble the dish. Place two fried tortillas on each warm serving plate. Spread a generous layer of warm refried beans over each tortilla.",
            "Step 8: Carefully transfer one fried egg onto each bean-coated tortilla.",
            "Step 9: Ladle the hot Ranchero sauce generously over the egg whites, leaving the bright yellow yolk exposed.",
            "Step 10: Garnish immediately with crumbled queso fresco, chopped cilantro, and slices of avocado. Serve hot."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "brunch"
            ],
            "cooking_methods": [
              "simmering",
              "frying",
              "blending",
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.45,
            "water": 0.15,
            "earth": 0.35,
            "air": 0.05
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunar_phases": [
              "First Quarter",
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 20,
            "carbs_g": 42,
            "fat_g": 28,
            "fiber_g": 12,
              "sodium_mg": 576,
              "sugar_g": 4,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "original_ingredient": "eggs",
              "substitute_options": [
                "tofu scramble (vegan)",
                "just egg"
              ]
            },
            {
              "original_ingredient": "refried black beans",
              "substitute_options": [
                "refried pinto beans",
                "whole black beans"
              ]
            },
            {
              "original_ingredient": "queso fresco",
              "substitute_options": [
                "mild feta cheese",
                "vegan cashew cheese crumbles"
              ]
            },
            {
              "original_ingredient": "pork lard / neutral oil",
              "substitute_options": [
                "avocado oil",
                "canola oil"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Chilaquiles Verdes",
          "description": "A masterclass in textural transformation and zero-waste agrarian cooking.",
          "details": {
            "cuisine": "Mexican",
            "prep_time_minutes": 15,
            "cook_time_minutes": 25,
            "base_serving_size": 4,
            "spice_level": "Hot",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 12,
              "unit": "whole",
              "name": "stale corn tortillas",
              "notes": "Cut into wedges."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "tomatillos",
              "notes": "Husks removed."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "epazote",
              "notes": "Fresh leaves."
            }
          ],
          "instructions": [
            "Step 1: Fry tortillas until rigid.",
            "Step 2: Boil tomatillos and serranos.",
            "Step 3: Blend salsa.",
            "Step 4: Fry salsa in hot oil, simmer.",
            "Step 5: Fold chips into simmering salsa for 1-2 minutes until al dente.",
            "Step 6: Serve with eggs, crema, and cheese."
          ],
          "classifications": {
            "meal_type": [
              "breakfast"
            ],
            "cooking_methods": [
              "frying",
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.35,
            "water": 0.2,
            "earth": 0.35,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Sun"
            ],
            "signs": [
              "Leo"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 450,
            "protein_g": 14,
            "carbs_g": 45,
            "fat_g": 26,
            "fiber_g": 6,
              "sodium_mg": 677,
              "sugar_g": 7,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "original_ingredient": "stale tortillas",
              "substitute_options": [
                "thick tortilla chips"
              ]
            }
          ]
        },
        {
          name: "Molletes",
          description: "Open-faced refried bean and cheese sandwiches",
          cuisine: "Mexican",
          cookingMethods: ["toasting", "melting", "assembling"],
          tools: [
            "baking sheet",
            "spatula",
            "knife",
            "cutting board",
            "small pot",
          ],
          preparationSteps: [
            "Split and toast bolillos",
            "Heat refried beans",
            "Spread beans on bread",
            "Top with cheese",
            "Broil until melted",
            "Top with pico de gallo",
          ],
          ingredients: [
            {
              name: "bolillo rolls",
              amount: "2",
              unit: "pieces",
              category: "grain",
              swaps: ["gluten-free bread"],
            },
            {
              name: "refried beans",
              amount: "1",
              unit: "cup",
              category: "legume",
            },
            {
              name: "cheese",
              amount: "1",
              unit: "cup",
              category: "dairy",
              swaps: ["vegan cheese"],
            },
            {
              name: "pico de gallo",
              amount: "1",
              unit: "cup",
              category: "salsa",
            },
          ],
          substitutions: {
            "bolillo rolls": ["sourdough", "gluten-free bread"],
            cheese: ["vegan cheese", "cashew cheese"],
            "refried beans": ["black bean spread", "pinto bean spread"],
          },
          servingSize: 2,
          allergens: ["dairy", "wheat"],
          prepTime: "10 minutes",
          cookTime: "5 minutes",
          culturalNotes:
            "A popular student breakfast that combines European bread with Mexican ingredients. The name comes from 'molletes', meaning 'cheeks' in Spanish",
          pairingSuggestions: [
            "Mexican hot chocolate",
            "fresh fruit",
            "café con leche",
          ],
          dietaryInfo: ["adaptable to vegetarian/vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 58,
            fat: 16,
            fiber: 3,
            vitamins: ["C", "B12"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["all"],
          mealType: ["breakfast", "snack"],
        },
        {
          name: "Enfrijoladas",
          description:
            "Tortillas dipped in black bean sauce and filled with cheese",
          cuisine: "Mexican",
          cookingMethods: [
            {
              name: "blending",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.26,
                Earth: 0.16,
                Air: 0.48,
              },
            },
            "dipping",
            "filling",
          ],
          tools: [
            "blender",
            "large skillet",
            "tongs",
            "serving plates",
            "ladle",
          ],
          preparationSteps: [
            "Blend black bean sauce",
            "Warm tortillas",
            "Dip in bean sauce",
            "Fill with cheese",
            "Roll tortillas",
            "Top with cream and onion",
          ],
          ingredients: [
            {
              name: "corn tortillas",
              amount: "8",
              unit: "pieces",
              category: "grain",
              swaps: ["gluten-free tortillas"],
            },
            {
              name: "black beans",
              amount: "2",
              unit: "cups",
              category: "legume",
            },
            {
              name: "queso fresco",
              amount: "1",
              unit: "cup",
              category: "dairy",
              swaps: ["vegan cheese"],
            },
            {
              name: "crema",
              amount: "1/2",
              unit: "cup",
              category: "dairy",
              swaps: ["cashew cream"],
            },
            {
              name: "onion",
              amount: "1",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "chipotle peppers",
              amount: "2",
              unit: "pieces",
              category: "spice",
            },
          ],
          substitutions: {
            "queso fresco": ["vegan cheese", "tofu feta"],
            crema: ["cashew cream", "vegan sour cream"],
            "chipotle peppers": ["smoked paprika", "ancho chile"],
          },
          servingSize: 4,
          allergens: ["dairy"],
          prepTime: "20 minutes",
          cookTime: "10 minutes",
          culturalNotes:
            "A comforting dish that showcases Mexico's mastery of bean preparations. Often served for breakfast or as a light dinner",
          pairingSuggestions: [
            "Mexican rice",
            "pickled jalapeños",
            "café de olla",
          ],
          dietaryInfo: ["vegetarian", "adaptable to vegan"],
          spiceLevel: "medium",
          nutrition: {
            calories: 440,
            protein: 20,
            carbs: 62,
            fat: 18,
            fiber: 3,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.23,
            Water: 0.17,
            Earth: 0.51,
            Air: 0.09,
          },
          mealType: ["breakfast", "dinner"],
        },
        {
          name: "Huevos Motuleños",
          description:
            "Eggs on tortillas with black beans, plantains, and salsa",
          cuisine: "Mexican (Yucatan)",
          cookingMethods: [
            {
              name: "frying",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.12,
                Earth: 0.18,
                Air: 0.29,
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
            "large skillet",
            "spatula",
            "tongs",
            "serving plates",
            "knife",
          ],
          preparationSteps: [
            "Fry plantains until golden",
            "Heat black beans",
            "Fry tortillas lightly",
            "Cook eggs sunny-side up",
            "Heat tomato sauce",
            "Layer ingredients",
            "Top with peas and ham",
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
              name: "corn tortillas",
              amount: "4",
              unit: "pieces",
              category: "grain",
              swaps: ["gluten-free tortillas"],
            },
            {
              name: "black beans",
              amount: "1",
              unit: "cup",
              category: "legume",
            },
            {
              name: "plantains",
              amount: "2",
              unit: "medium",
              category: "fruit",
            },
            {
              name: "tomato sauce",
              amount: "1",
              unit: "cup",
              category: "sauce",
            },
            { name: "peas", amount: "1/2", unit: "cup", category: "vegetable" },
            {
              name: "ham",
              amount: "100",
              unit: "g",
              category: "protein",
              swaps: ["tempeh"],
            },
          ],
          substitutions: {
            eggs: ["tofu scramble", "chickpea scramble"],
            ham: ["tempeh", "seitan", "mushrooms"],
            plantains: ["sweet bananas", "sweet potatoes"],
          },
          servingSize: 4,
          allergens: ["egg"],
          prepTime: "15 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A specialty from the Yucatan city of Motul, this dish combines Maya and Spanish influences with tropical ingredients",
          pairingSuggestions: [
            "habanero sauce",
            "Mexican coffee",
            "fresh orange juice",
          ],
          dietaryInfo: ["adaptable to vegetarian/vegan"],
          spiceLevel: "mild to medium",
          nutrition: {
            calories: 580,
            protein: 28,
            carbs: 75,
            fat: 24,
            fiber: 3,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.31,
            Water: 0.18,
            Earth: 0.42,
            Air: 0.1,
          },
          mealType: ["breakfast", "brunch"],
        },
      ],
      summer: [
        {
          name: "Licuado de Frutas",
          description: "Fresh fruit smoothie with milk and honey",
          cuisine: "Mexican",
          cookingMethods: [
            {
              name: "blending",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.26,
                Earth: 0.16,
                Air: 0.48,
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
            "blender",
            "measuring cups",
            "knife",
            "cutting board",
            "strainer",
          ],
          preparationSteps: [
            "Clean and chop fruits",
            "Add milk and honey",
            "Blend until smooth",
            "Adjust sweetness",
            "Serve immediately",
          ],
          ingredients: [
            {
              name: "mixed fruits",
              amount: "2",
              unit: "cups",
              category: "fruit",
            },
            {
              name: "milk",
              amount: "1",
              unit: "cup",
              category: "dairy",
              swaps: ["almond milk", "oat milk"],
            },
            {
              name: "honey",
              amount: "2",
              unit: "tbsp",
              category: "sweetener",
              swaps: ["agave"],
            },
            {
              name: "vanilla",
              amount: "1",
              unit: "tsp",
              category: "flavoring",
            },
          ],
          substitutions: {
            milk: ["almond milk", "oat milk", "coconut milk"],
            honey: ["agave nectar", "maple syrup"],
            "mixed fruits": ["any seasonal fruits"],
          },
          servingSize: 2,
          allergens: ["dairy"],
          prepTime: "5 minutes",
          cookTime: "5 minutes",
          culturalNotes:
            "A popular breakfast drink and afternoon refreshment. Each region has its preferred fruit combinations based on local availability",
          pairingSuggestions: ["pan dulce", "breakfast tacos", "fresh fruit"],
          dietaryInfo: ["adaptable to vegan"],
          spiceLevel: "none",
          nutrition: {
            calories: 240,
            protein: 8,
            carbs: 45,
            fat: 6,
            fiber: 3,
            vitamins: ["C", "D"],
            minerals: ["Calcium", "Potassium"],
          },
          season: ["summer"],

          elementalProperties: {
            Fire: 0.12,
            Water: 0.55,
            Earth: 0.23,
            Air: 0.11,
          },
          mealType: ["breakfast", "snack"],
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Caldo de Pollo",
          description: "Traditional Mexican chicken soup with vegetables",
          cuisine: "Mexican",
          cookingMethods: ["simmering", "chopping", "skimming"],
          tools: [
            "large stockpot",
            "strainer",
            "knife",
            "cutting board",
            "serving bowls",
          ],
          preparationSteps: [
            "Make chicken broth",
            "Prepare vegetables",
            "Cook chicken",
            "Add vegetables",
            "Season broth",
            "Serve hot with garnishes",
          ],
          ingredients: [
            {
              name: "whole chicken",
              amount: "1",
              unit: "large",
              category: "protein",
              swaps: ["chickpeas"],
            },
            {
              name: "carrots",
              amount: "4",
              unit: "large",
              category: "vegetable",
            },
            {
              name: "potatoes",
              amount: "4",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "chayote",
              amount: "2",
              unit: "whole",
              category: "vegetable",
            },
            {
              name: "Mexican rice",
              amount: "1",
              unit: "cup",
              category: "grain",
            },
            { name: "cilantro", amount: "1", unit: "bunch", category: "herb" },
          ],
          substitutions: {
            chicken: ["chickpeas", "mushrooms", "jackfruit"],
            chayote: ["zucchini", "summer squash"],
            "Mexican rice": ["white rice", "quinoa"],
          },
          servingSize: 6,
          allergens: ["none"],
          prepTime: "30 minutes",
          cookTime: "1.5 hours",
          culturalNotes:
            "A healing soup often served to those feeling under the weather. Each family has their own variation passed down through generations",
          pairingSuggestions: [
            "lime wedges",
            "chile piquin",
            "tortillas",
            "avocado",
          ],
          dietaryInfo: ["adaptable to vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 28,
            carbs: 32,
            fat: 12,
            fiber: 3,
            vitamins: ["A", "C", "B6"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["all", "winter"],
          mealType: ["lunch", "dinner", "healing"],
        },
      ],
      summer: [
        {
          name: "Aguachile",
          description: "Shrimp cured in lime juice with chiles and cucumber",
          cuisine: "Mexican (Sinaloa)",
          ingredients: [
            {
              name: "shrimp",
              amount: "500",
              unit: "g",
              category: "seafood",
              swaps: ["hearts of palm"],
            },
            {
              name: "lime juice",
              amount: "1",
              unit: "cup",
              category: "citrus",
            },
            {
              name: "cucumber",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "serrano peppers",
              amount: "4",
              unit: "pieces",
              category: "spice",
            },
            {
              name: "red onion",
              amount: "1",
              unit: "medium",
              category: "vegetable",
            },
          ],
          nutrition: {
            calories: 280,
            protein: 42,
            carbs: 12,
            fat: 8,
            fiber: 3,
            vitamins: ["C", "B12"],
            minerals: ["Iron", "Zinc"],
          },
          timeToMake: "20 minutes",
          season: ["summer"],

          elementalProperties: {
            Fire: 0.13,
            Water: 0.55,
            Earth: 0.22,
            Air: 0.1,
          },
          mealType: ["lunch"],
        },
      ],
      winter: [
        {
          "recipe_name": "Authentic Pozole Rojo",
          "description": "A pre-Columbian ceremonial stew rooted in the deep earthiness of nixtamalized corn.",
          "details": {
            "cuisine": "Mexican",
            "prep_time_minutes": 45,
            "cook_time_minutes": 180,
            "base_serving_size": 8,
            "spice_level": "Medium-Hot",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1.5,
              "unit": "kg",
              "name": "pork shoulder",
              "notes": "For broth."
            }
          ],
          "instructions": [
            "Step 1: Simmer pork.",
            "Step 2: Blend and fry chiles.",
            "Step 3: Combine with hominy."
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
            "fire": 0.35,
            "water": 0.35,
            "earth": 0.25,
            "air": 0.05
          },
          "astrological_affinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Scorpio"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 520,
            "protein_g": 38,
            "carbs_g": 45,
            "fat_g": 20,
            "fiber_g": 8,
              "sodium_mg": 521,
              "sugar_g": 10,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
      ],
    },
    dinner: {
      all: [
        {
          name: "Mole Poblano",
          description:
            "Complex sauce with chocolate and chilies served over turkey or chicken",
          cuisine: "Mexican (Puebla)",
          cookingMethods: [
            {
              name: "toasting",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.06,
                Earth: 0.25,
                Air: 0.28,
              },
            },
            {
              name: "blending",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.26,
                Earth: 0.16,
                Air: 0.48,
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
          ],
          tools: [
            "large pot",
            "blender",
            "strainer",
            "comal or skillet",
            "wooden spoon",
          ],
          preparationSteps: [
            "Toast chiles and spices",
            "Fry ingredients in stages",
            "Blend sauce ingredients",
            "Cook meat separately",
            "Simmer sauce",
            "Combine and serve",
            "Garnish with sesame seeds",
          ],
          ingredients: [
            {
              name: "mixed dried chiles",
              amount: "500",
              unit: "g",
              category: "chile",
            },
            {
              name: "chocolate",
              amount: "100",
              unit: "g",
              category: "chocolate",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.2,
                Earth: 0.45,
                Air: 0.1,
              },
            },
            {
              name: "turkey",
              amount: "2",
              unit: "kg",
              category: "protein",
              swaps: ["chicken", "mushrooms"],
            },
            {
              name: "sesame seeds",
              amount: "100",
              unit: "g",
              category: "seeds",
            },
            { name: "almonds", amount: "100", unit: "g", category: "nuts" },
            { name: "raisins", amount: "100", unit: "g", category: "fruit" },
          ],
          substitutions: {
            turkey: ["chicken", "mushrooms", "seitan"],
            almonds: ["pumpkin seeds"],
            chocolate: ["dairy-free chocolate"],
          },
          servingSize: 10,
          allergens: ["nuts"],
          prepTime: "2 hours",
          cookTime: "3 hours",
          culturalNotes:
            "A symbol of Mexican gastronomy, mole combines indigenous and European ingredients. Legend says it was created by nuns in colonial Puebla",
          pairingSuggestions: ["rice", "tortillas", "Mexican wine"],
          dietaryInfo: ["adaptable to vegetarian/vegan"],
          spiceLevel: "medium",
          nutrition: {
            calories: 580,
            protein: 42,
            carbs: 38,
            fat: 32,
            fiber: 3,
            vitamins: ["A", "B6", "E"],
            minerals: ["Iron", "Magnesium"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.31,
            Water: 0.16,
            Earth: 0.45,
            Air: 0.08,
          },
          mealType: ["dinner", "celebration", "special occasion"],
        },
        {
          name: "Chiles en Nogada",
          description: "Stuffed poblano chiles in walnut sauce",
          cuisine: "Mexican",
          cookingMethods: [
            {
              name: "roasting",
              elementalProperties: {
                Fire: 0.47,
                Water: 0.06,
                Earth: 0.18,
                Air: 0.29,
              },
            },
            {
              name: "stuffing",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.15,
                Earth: 0.54,
                Air: 0.23,
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
            "large skillet",
            "blender",
            "baking sheet",
            "tongs",
            "serving plates",
          ],
          preparationSteps: [
            "Roast and peel chiles",
            "Prepare picadillo filling",
            "Make walnut sauce",
            "Stuff chiles",
            "Batter and fry",
            "Cover with sauce",
            "Garnish with pomegranate",
          ],
          ingredients: [
            {
              name: "poblano chiles",
              amount: "6",
              unit: "large",
              category: "chile",
            },
            {
              name: "ground pork",
              amount: "500",
              unit: "g",
              category: "protein",
              swaps: ["plant-based meat"],
            },
            { name: "walnuts", amount: "250", unit: "g", category: "nut" },
            {
              name: "pomegranate seeds",
              amount: "1",
              unit: "cup",
              category: "fruit",
            },
            {
              name: "Mexican cream",
              amount: "1",
              unit: "cup",
              category: "dairy",
              swaps: ["cashew cream"],
            },
            {
              name: "seasonal fruits",
              amount: "2",
              unit: "cups",
              category: "fruit",
            },
          ],
          substitutions: {
            "ground pork": ["mushroom mixture", "plant-based meat"],
            "Mexican cream": ["cashew cream", "almond cream"],
            walnuts: ["pecans", "almonds"],
          },
          servingSize: 6,
          allergens: ["nuts", "dairy"],
          prepTime: "45 minutes",
          cookTime: "1 hour",
          culturalNotes:
            "Created by nuns in Puebla to celebrate Mexican independence, the colors represent the Mexican flag. Traditionally served in August-September",
          pairingSuggestions: ["white wine", "rice", "fresh bread"],
          dietaryInfo: ["adaptable to vegetarian/vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 650,
            protein: 28,
            carbs: 35,
            fat: 48,
            fiber: 3,
            vitamins: ["A", "C", "E"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["late summer", "early fall"],

          elementalProperties: {
            Fire: 0.36,
            Water: 0.13,
            Earth: 0.42,
            Air: 0.09,
          },
          mealType: ["dinner", "celebration"],
        },
        {
          name: "Cochinita Pibil",
          description: "Yucatan-style marinated pork wrapped in banana leaves",
          cuisine: "Mexican (Yucatan)",
          cookingMethods: ["marinating", "slow-cooking", "wrapping"],
          tools: [
            "large pot or slow cooker",
            "blender",
            "strainer",
            "tongs",
            "serving plates",
          ],
          preparationSteps: [
            "Blend achiote marinade",
            "Marinate pork overnight",
            "Wrap in banana leaves",
            "Slow cook until tender",
            "Shred meat",
            "Prepare garnishes",
            "Serve with tortillas",
          ],
          ingredients: [
            {
              name: "pork shoulder",
              amount: "2",
              unit: "kg",
              category: "protein",
              swaps: ["jackfruit"],
            },
            {
              name: "achiote paste",
              amount: "100",
              unit: "g",
              category: "seasoning",
            },
            {
              name: "sour orange juice",
              amount: "2",
              unit: "cups",
              category: "citrus",
              swaps: ["lime + orange juice"],
            },
            {
              name: "banana leaves",
              amount: "4",
              unit: "large",
              category: "wrapper",
              swaps: ["parchment paper"],
            },
            {
              name: "garlic",
              amount: "8",
              unit: "cloves",
              category: "aromatic",
            },
            { name: "oregano", amount: "2", unit: "tbsp", category: "herb" },
          ],
          substitutions: {
            "pork shoulder": ["jackfruit", "seitan", "mushrooms"],
            "sour orange": ["lime juice + orange juice"],
            "banana leaves": ["parchment paper", "foil"],
          },
          servingSize: 8,
          allergens: ["none"],
          prepTime: "1 hour plus marinating",
          cookTime: "4 hours",
          culturalNotes:
            "A pre-Hispanic Mayan dish that uses traditional cooking methods and achiote, a signature ingredient of Yucatecan cuisine",
          pairingSuggestions: [
            "pickled onions",
            "habanero salsa",
            "corn tortillas",
          ],
          dietaryInfo: ["adaptable to vegan"],
          spiceLevel: "medium",
          nutrition: {
            calories: 450,
            protein: 38,
            carbs: 12,
            fat: 28,
            fiber: 3,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["lunch", "dinner", "celebration"],
        },
        {
          name: "Birria",
          description:
            "Spicy braised meat stew traditionally made with goat or beef",
          cuisine: "Mexican (Jalisco)",
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
              name: "stewing",
              elementalProperties: {
                Fire: 0.22,
                Water: 0.41,
                Earth: 0.3,
                Air: 0.08,
              },
            },
            {
              name: "toasting",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.06,
                Earth: 0.25,
                Air: 0.28,
              },
            },
          ],
          tools: ["large pot", "blender", "strainer", "comal", "serving bowls"],
          preparationSteps: [
            "Toast and clean chiles",
            "Blend chile marinade",
            "Marinate meat overnight",
            "Slow cook meat",
            "Strain and reserve consomé",
            "Shred meat",
            "Serve with tortillas and broth",
          ],
          ingredients: [
            {
              name: "goat or beef",
              amount: "2",
              unit: "kg",
              category: "protein",
              swaps: ["jackfruit"],
            },
            {
              name: "dried chiles",
              amount: "6",
              unit: "mixed",
              category: "chile",
            },
            {
              name: "garlic",
              amount: "8",
              unit: "cloves",
              category: "aromatic",
            },
            { name: "vinegar", amount: "1/2", unit: "cup", category: "acid" },
            {
              name: "Mexican oregano",
              amount: "2",
              unit: "tbsp",
              category: "herb",
            },
            {
              name: "corn tortillas",
              amount: "24",
              unit: "pieces",
              category: "grain",
            },
          ],
          substitutions: {
            "goat/beef": ["jackfruit", "mushrooms", "seitan"],
            "dried chiles": ["chile powder blend"],
            vinegar: ["apple cider vinegar", "lime juice"],
          },
          servingSize: 8,
          allergens: ["none"],
          prepTime: "1 hour plus marinating",
          cookTime: "4 hours",
          culturalNotes:
            "Originally from Jalisco, birria has become a national favorite. The consomé is as prized as the meat itself",
          pairingSuggestions: ["lime", "onions", "cilantro", "salsa roja"],
          dietaryInfo: ["adaptable to vegan"],
          spiceLevel: "medium to hot",
          nutrition: {
            calories: 480,
            protein: 42,
            carbs: 28,
            fat: 24,
            fiber: 3,
            vitamins: ["B12", "A"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.14,
            Water: 0.15,
            Earth: 0.64,
            Air: 0.07,
          },
          mealType: ["lunch", "dinner", "celebration"],
        },
        {
          name: "Tamales Verdes",
          description:
            "Corn dough stuffed with pork in green sauce, steamed in corn husks",
          cuisine: "Mexican",
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
            "filling",
            "wrapping",
          ],
          tools: [
            "tamale steamer",
            "large bowl",
            "blender",
            "corn husk soaking pan",
            "spreading tool",
          ],
          preparationSteps: [
            "Soak corn husks",
            "Prepare masa dough",
            "Make green sauce",
            "Cook pork filling",
            "Spread masa",
            "Fill and wrap",
            "Steam tamales",
          ],
          ingredients: [
            { name: "masa harina", amount: "2", unit: "kg", category: "grain" },
            {
              name: "lard",
              amount: "500",
              unit: "g",
              category: "fat",
              swaps: ["vegetable shortening"],
            },
            {
              name: "pork",
              amount: "1",
              unit: "kg",
              category: "protein",
              swaps: ["jackfruit"],
            },
            {
              name: "tomatillos",
              amount: "1",
              unit: "kg",
              category: "vegetable",
            },
            {
              name: "corn husks",
              amount: "40",
              unit: "pieces",
              category: "wrapper",
            },
            {
              name: "serrano chiles",
              amount: "4",
              unit: "pieces",
              category: "chile",
            },
          ],
          substitutions: {
            lard: ["vegetable shortening", "coconut oil"],
            pork: ["jackfruit", "mushrooms", "beans"],
            "corn husks": ["banana leaves"],
          },
          servingSize: 20,
          allergens: ["none"],
          prepTime: "2 hours",
          cookTime: "1.5 hours",
          culturalNotes:
            "A pre-Hispanic dish that remains central to Mexican celebrations. Each region has its own variations",
          pairingSuggestions: ["atole", "champurrado", "café de olla"],
          dietaryInfo: ["adaptable to vegan"],
          spiceLevel: "medium",
          nutrition: {
            calories: 320,
            protein: 18,
            carbs: 42,
            fat: 14,
            fiber: 3,
            vitamins: ["A", "C"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["all", "christmas"],

          elementalProperties: {
            Fire: 0.34,
            Water: 0.18,
            Earth: 0.43,
            Air: 0.05,
          },
          mealType: ["breakfast", "dinner", "celebration"],
        },
      ],
      winter: [
        {
          name: "Cochinita Pibil",
          description: "Yucatan-style marinated pork wrapped in banana leaves",
          cuisine: "Mexican (Yucatan)",
          ingredients: [
            {
              name: "pork shoulder",
              amount: "2",
              unit: "kg",
              category: "protein",
              swaps: ["jackfruit"],
            },
            {
              name: "achiote paste",
              amount: "200",
              unit: "g",
              category: "seasoning",
            },
            {
              name: "sour orange juice",
              amount: "2",
              unit: "cups",
              category: "citrus",
            },
            {
              name: "banana leaves",
              amount: "4",
              unit: "large",
              category: "wrapper",
            },
            {
              name: "pickled red onions",
              amount: "2",
              unit: "cups",
              category: "condiment",
            },
          ],
          nutrition: {
            calories: 480,
            protein: 45,
            carbs: 15,
            fat: 28,
            fiber: 3,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"],
          },
          timeToMake: "12 hours",
          season: ["winter"],
          mealType: ["dinner"],
        },
      ],
    },
    dessert: {
      all: [
        {
          name: "Flan",
          description: "Classic Mexican caramel custard",
          cuisine: "Mexican",
          ingredients: [
            {
              name: "eggs",
              amount: "6",
              unit: "large",
              category: "protein",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.3,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "milk",
              amount: "2",
              unit: "cups",
              category: "dairy",
              swaps: ["coconut milk"],
            },
            { name: "sugar", amount: "1", unit: "cup", category: "sweetener" },
            {
              name: "vanilla",
              amount: "1",
              unit: "tbsp",
              category: "flavoring",
            },
          ],
          nutrition: {
            calories: 280,
            protein: 8,
            carbs: 42,
            fat: 10,
            fiber: 3,
            vitamins: ["A", "D"],
            minerals: ["Calcium"],
          },
          timeToMake: "60 minutes",
          season: ["all"],

          elementalProperties: {
            Fire: 0.18,
            Water: 0.4,
            Earth: 0.32,
            Air: 0.09,
          },
          mealType: ["dessert"],
          astrologicalProfile: {
            favorableZodiac: ["leo", "sagittarius"],
            rulingPlanets: ["sun", "jupiter"],
            elementalAffinity: "Fire",
          },
        },
        {
          "recipe_name": "Authentic Churros",
          "description": "A study in structural pastry tension.",
          "details": {
            "cuisine": "Mexican",
            "prep_time_minutes": 15,
            "cook_time_minutes": 20,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "flour",
              "notes": "Sifted."
            }
          ],
          "instructions": [
            "Step 1: Scald water and add flour.",
            "Step 2: Pipe stars into hot oil.",
            "Step 3: Coat in cinnamon sugar."
          ],
          "classifications": {
            "meal_type": [
              "dessert"
            ],
            "cooking_methods": [
              "frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.45,
            "water": 0.15,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Aries"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 310,
            "protein_g": 4,
            "carbs_g": 42,
            "fat_g": 15,
            "fiber_g": 1,
              "sodium_mg": 83,
              "sugar_g": 26,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
      ],
      summer: [
        {
          name: "Paletas",
          description: "Mexican ice pops with fresh fruit",
          cuisine: "Mexican",
          ingredients: [
            {
              name: "fresh fruit",
              amount: "4",
              unit: "cups",
              category: "fruit",
            },
            {
              name: "sugar",
              amount: "1/2",
              unit: "cup",
              category: "sweetener",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.2,
                Earth: 0.3,
                Air: 0.2,
              },
            },
            {
              name: "lime juice",
              amount: "2",
              unit: "tbsp",
              category: "citrus",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.2,
              },
            },
            {
              name: "chili powder",
              amount: "1",
              unit: "tsp",
              category: "spice",
              elementalProperties: {
                Fire: 0.7,
                Water: 0,
                Earth: 0.1,
                Air: 0.2,
              },
            },
          ],
          nutrition: {
            calories: 120,
            protein: 1,
            carbs: 28,
            fat: 0,
            fiber: 3,
            vitamins: ["C", "A"],
            minerals: ["Potassium"],
          },
          timeToMake: "240 minutes",
          season: ["summer"],

          elementalProperties: {
            Fire: 0.46,
            Water: 0.19,
            Earth: 0.17,
            Air: 0.18,
          },
          mealType: ["dessert"],
        },
      ],
    },
  },
  soups: {
    all: [
      {
        name: "Caldo de Pollo",
        description: "Traditional Mexican chicken soup with vegetables",
        cuisine: "Mexican",
        cookingMethods: ["simmering", "chopping", "skimming"],
        tools: [
          "large stockpot",
          "strainer",
          "knife",
          "cutting board",
          "serving bowls",
        ],
        preparationSteps: [
          "Make chicken broth",
          "Prepare vegetables",
          "Cook chicken",
          "Add vegetables",
          "Season broth",
          "Serve hot with garnishes",
        ],
        ingredients: [
          {
            name: "whole chicken",
            amount: "1",
            unit: "large",
            category: "protein",
            swaps: ["chickpeas"],
          },
          {
            name: "carrots",
            amount: "4",
            unit: "large",
            category: "vegetable",
          },
          {
            name: "potatoes",
            amount: "4",
            unit: "medium",
            category: "vegetable",
          },
          {
            name: "chayote",
            amount: "2",
            unit: "whole",
            category: "vegetable",
          },
          { name: "Mexican rice", amount: "1", unit: "cup", category: "grain" },
          { name: "cilantro", amount: "1", unit: "bunch", category: "herb" },
        ],
        substitutions: {
          chicken: ["chickpeas", "mushrooms", "jackfruit"],
          chayote: ["zucchini", "summer squash"],
          "Mexican rice": ["white rice", "quinoa"],
        },
        servingSize: 6,
        allergens: ["none"],
        prepTime: "30 minutes",
        cookTime: "1.5 hours",
        culturalNotes:
          "A healing soup often served to those feeling under the weather. Each family has their own variation passed down through generations",
        pairingSuggestions: [
          "lime wedges",
          "chile piquin",
          "tortillas",
          "avocado",
        ],
        dietaryInfo: ["adaptable to vegan"],
        spiceLevel: "mild",
        nutrition: {
          calories: 320,
          protein: 28,
          carbs: 32,
          fat: 12,
          fiber: 3,
          vitamins: ["A", "C", "B6"],
          minerals: ["Iron", "Potassium"],
        },
        season: ["all", "winter"],
        mealType: ["lunch", "dinner", "healing"],
      },
      {
        name: "Elote",
        description: "Grilled Mexican street corn with mayo, cheese, and chili",
        cuisine: "Mexican (Street Food)",
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
        ],
        tools: ["grill", "brush", "skewers"],
        preparationSteps: [
          "Husk corn and remove silk",
          "Grill corn until charred spots appear",
          "Brush with mayonnaise",
          "Sprinkle with cotija cheese",
          "Dust with chili powder and lime",
          "Serve immediately",
        ],
        ingredients: [
          {
            name: "corn on the cob",
            amount: "6",
            unit: "ears",
            category: "vegetable",
          },
          {
            name: "mayonnaise",
            amount: "1/2",
            unit: "cup",
            category: "condiment",
          },
          {
            name: "cotija cheese",
            amount: "1/2",
            unit: "cup",
            category: "dairy",
          },
          { name: "chili powder", amount: "2", unit: "tsp", category: "spice" },
          { name: "lime", amount: "2", unit: "whole", category: "fruit" },
          { name: "cilantro", amount: "1/4", unit: "cup", category: "herb" },
        ],
        substitutions: {
          "cotija cheese": ["feta cheese", "parmesan"],
          mayonnaise: ["crema"],
        },
        servingSize: 6,
        allergens: ["dairy", "eggs"],
        prepTime: "10 minutes",
        cookTime: "15 minutes",
        culturalNotes:
          "A quintessential Mexican street food, sold by eloteros from wheeled carts throughout Mexico",
        pairingSuggestions: ["esquites", "agua fresca", "michelada"],
        dietaryInfo: ["vegetarian"],
        spiceLevel: "mild",
        nutrition: {
          calories: 220,
          protein: 6,
          carbs: 28,
          fat: 12,
          fiber: 3,
          vitamins: ["A", "C", "B6"],
          minerals: ["Potassium", "Magnesium"],
        },
        timeToMake: "25 minutes",
        season: ["summer"],
        mealType: ["snack", "side"],
        elementalProperties: {
          Fire: 0.35,
          Water: 0.15,
          Earth: 0.3,
          Air: 0.2,
        },
      },
    ],
  },
  traditionalSauces: {
    mole: {
      name: "Mole",
      description:
        "Complex sauce combining chiles, spices, nuts, and chocolate",
      base: "dried chiles and toasted ingredients",
      keyIngredients: [
        "dried chiles",
        "chocolate",
        "nuts",
        "spices",
        "bread or tortillas",
      ],
      culinaryUses: [
        "sauce for poultry",
        "special occasion dishes",
        "enchilada topping",
        "flavor base",
      ],
      variants: [
        "Mole Poblano",
        "Mole Negro",
        "Mole Verde",
        "Mole Amarillo",
        "Mole Coloradito",
      ],
      elementalProperties: {
        earth: 0.4,
        fire: 0.3,
        water: 0.2,
        air: 0.1,
      },
      astrologicalInfluences: ["pluto", "mars", "scorpio"],
      seasonality: "all",
      preparationNotes:
        "Traditionally prepared over multiple days for celebrations and special occasions",
      technicalTips:
        "Toast ingredients separately to develop maximum flavor complexity",
    },
    salsaVerde: {
      name: "Salsa Verde",
      description: "Tangy green sauce made from tomatillos, chiles, and herbs",
      base: "tomatillo",
      keyIngredients: [
        "tomatillos",
        "serrano chiles",
        "cilantro",
        "onion",
        "garlic",
      ],
      culinaryUses: [
        "taco topping",
        "enchilada sauce",
        "marinade",
        "flavor enhancer",
      ],
      variants: [
        "Cruda (raw)",
        "Cocida (cooked)",
        "Asada (roasted)",
        "Cremosa (creamy with avocado)",
      ],
      elementalProperties: {
        water: 0.4,
        fire: 0.3,
        air: 0.2,
        earth: 0.1,
      },
      astrologicalInfluences: ["venus", "mercury", "gemini"],
      seasonality: "spring, summer",
      preparationNotes:
        "Can be served raw or cooked depending on desired flavor profile",
      technicalTips: "Roasting ingredients before blending adds smoky depth",
    },
    salsaRoja: {
      name: "Salsa Roja",
      description: "Rich red sauce made from tomatoes and dried chiles",
      base: "tomato and dried chiles",
      keyIngredients: ["tomatoes", "dried chiles", "garlic", "onion", "cumin"],
      culinaryUses: [
        "taco dressing",
        "enchilada sauce",
        "flavor base",
        "marinade",
      ],
      variants: [
        "Asada (roasted)",
        "Cruda (raw)",
        "Molcajeteada (stone-ground)",
        "Chile de Árbol",
      ],
      elementalProperties: {
        fire: 0.5,
        earth: 0.3,
        water: 0.1,
        air: 0.1,
      },
      astrologicalInfluences: ["mars", "sun", "aries"],
      seasonality: "summer, autumn",
      preparationNotes:
        "Most traditional version uses dried chiles rehydrated and blended with tomatoes",
      technicalTips: "Straining after blending creates a smoother texture",
    },
    adobo: {
      name: "Adobo",
      description: "Chile-based marinade with vinegar and spices",
      base: "dried chiles and vinegar",
      keyIngredients: [
        "guajillo chiles",
        "ancho chiles",
        "vinegar",
        "oregano",
        "cumin",
        "garlic",
      ],
      culinaryUses: [
        "meat marinade",
        "flavor base",
        "preservation method",
        "stew seasoning",
      ],
      variants: [
        "Rojo (red)",
        "Norteño (northern style)",
        "Húmedo (wet)",
        "Seco (dry rub)",
      ],
      elementalProperties: {
        fire: 0.4,
        air: 0.3,
        earth: 0.2,
        water: 0.1,
      },
      astrologicalInfluences: ["mars", "mercury", "sagittarius"],
      seasonality: "all",
      preparationNotes:
        "Originally used as a preservation technique, now primarily for flavor",
      technicalTips:
        "Longer marinating creates deeper flavor, but can break down delicate proteins",
    },
    pipian: {
      name: "Pipián",
      description: "Pre-Hispanic sauce based on ground pumpkin seeds",
      base: "pumpkin seeds",
      keyIngredients: [
        "pepitas (pumpkin seeds)",
        "tomatillos",
        "chiles",
        "spices",
        "herbs",
      ],
      culinaryUses: [
        "sauce for poultry",
        "vegetable topping",
        "enchilada sauce",
        "special dishes",
      ],
      variants: [
        "Verde (green)",
        "Rojo (red)",
        "Oaxaqueño (Oaxacan style)",
        "Blanco (white)",
      ],
      elementalProperties: {
        earth: 0.5,
        water: 0.2,
        air: 0.2,
        fire: 0.1,
      },
      astrologicalInfluences: ["saturn", "moon", "capricorn"],
      seasonality: "autumn, winter",
      preparationNotes:
        "Pre-Hispanic sauce that predates European influence in Mexican cuisine",
      technicalTips:
        "Toast seeds until fragrant but not burnt for optimal flavor",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: [
        "mole poblano",
        "pipián verde",
        "salsa verde",
        "adobo",
        "tinga sauce",
      ],
      beef: [
        "salsa roja",
        "chile colorado",
        "adobo",
        "salsa macha",
        "borracha sauce",
      ],
      pork: [
        "adobada",
        "salsa verde",
        "recado negro",
        "achiote paste",
        "pibil marinade",
      ],
      seafood: [
        "salsa veracruzana",
        "salsa verde cruda",
        "mojo de ajo",
        "salsa diabla",
        "aguachile dressing",
      ],
      vegetables: [
        "pipián",
        "salsa ranchera",
        "mole verde",
        "chipotle cream",
        "salsa de semillas",
      ],
    },
    forVegetable: {
      root: [
        "mole colorado",
        "pipián",
        "chile colorado",
        "adobo",
        "salsa macha",
      ],
      leafy: [
        "salsa verde",
        "pepita dressing",
        "avocado crema",
        "lime dressing",
        "cilantro sauce",
      ],
      squash: [
        "mole amarillo",
        "pipián",
        "salsa de pepitas",
        "chipotle butter",
        "crema poblana",
      ],
      cactus: [
        "salsa cruda",
        "chile lime dressing",
        "salsa mexicana",
        "adobo",
        "tomatillo dressing",
      ],
      corn: [
        "crema mexicana",
        "chile lime butter",
        "cotija cream",
        "salsa macha",
        "epazote butter",
      ],
    },
    forCookingMethod: {
      grilling: [
        "salsa roja asada",
        "chimichurri mexicano",
        "adobo",
        "mojo de ajo",
        "salsa borracha",
      ],
      simmering: [
        "mole",
        "tinga sauce",
        "chile colorado",
        "salsa verde cocida",
        "guisado base",
      ],
      frying: [
        "salsa mexicana",
        "chipotle mayonnaise",
        "crema ácida",
        "valentina cream",
        "habanero sauce",
      ],
      steaming: [
        "salsa verde",
        "chimichurri",
        "lime-cilantro sauce",
        "salsa marisquera",
        "mojo de ajo",
      ],
      raw: [
        "aguachile",
        "leche de tigre mexicana",
        "salsa bandera",
        "pico de gallo",
        "salsa cruda",
      ],
    },
    byAstrological: {
      fire: [
        "salsa macha",
        "habanero-based sauces",
        "chile de árbol salsa",
        "adobo picante",
        "chipotle salsas",
      ],
      earth: [
        "mole poblano",
        "pipián",
        "salsa de cacahuate",
        "recado negro",
        "adobo seco",
      ],
      water: [
        "aguachile",
        "salsa verde",
        "avocado crema",
        "salsa veracruzana",
        "mole verde",
      ],
      air: [
        "pico de gallo",
        "salsa bandera",
        "lime-cilantro dressing",
        "chimichurri mexicano",
        "citrus salsas",
      ],
    },
    byRegion: {
      oaxaca: [
        "mole negro",
        "mole coloradito",
        "salsa de chicatana",
        "chile pasilla mixe",
        "chilhuacle sauce",
      ],
      yucatan: [
        "recado rojo",
        "xnipec",
        "chiltomate",
        "habanero salsas",
        "recado negro",
      ],
      north: [
        "salsa roja norteña",
        "machaca sauce",
        "chile colorado",
        "chimichurri norteño",
        "salsa tatemada",
      ],
      centralMexico: [
        "borracha sauce",
        "salsa de pulque",
        "adobo de Toluca",
        "mole verde",
        "salsa ranchera",
      ],
      pacific: [
        "salsa huichol",
        "chamoy",
        "salsa negra",
        "salsa de mariscos",
        "aguachile",
      ],
    },
    byDietary: {
      vegetarian: [
        "salsa verde",
        "guacamole",
        "pico de gallo",
        "pipián verde",
        "mole verde",
      ],
      vegan: [
        "salsa roja",
        "salsa cruda",
        "salsa macha",
        "chimichurri mexicano",
        "salsa bandera",
      ],
      glutenFree: [
        "all traditional salsas",
        "mojo de ajo",
        "salsa macha",
        "adobo",
        "aguachile",
      ],
      dairyFree: [
        "salsa verde",
        "salsa roja",
        "pico de gallo",
        "salsa macha",
        "mole negro",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Nixtamalización",
      description:
        "Ancient process of treating corn with calcium hydroxide to enhance nutritional value and flavor",
      elementalProperties: { earth: 0.5, water: 0.3, fire: 0.1, air: 0.1 },
      toolsRequired: [
        "large pot",
        "calcium hydroxide (cal)",
        "wooden spoon",
        "grinding stone or mill",
      ],
      bestFor: [
        "corn masa preparation",
        "tortillas",
        "tamales",
        "atole",
        "pozole",
      ],
    },
    {
      name: "Asado",
      description:
        "Open-fire grilling technique creating distinctive smoky flavors",
      elementalProperties: { fire: 0.7, air: 0.2, earth: 0.1, water: 0.0 },
      toolsRequired: ["grill", "mesquite wood", "tongs", "comal"],
      bestFor: ["meats", "nopal cactus", "vegetables", "salsas", "chiles"],
    },
    {
      name: "Guisado",
      description: "Slow-simmered stew technique for developing deep flavors",
      elementalProperties: { water: 0.4, earth: 0.3, fire: 0.2, air: 0.1 },
      toolsRequired: [
        "clay pot",
        "cazuela",
        "wooden spoon",
        "steady heat source",
      ],
      bestFor: [
        "meat stews",
        "vegetable medleys",
        "taco fillings",
        "breakfast dishes",
      ],
    },
    {
      name: "Tatemado",
      description:
        "Charring technique for vegetables and chiles to develop smoky depth",
      elementalProperties: { fire: 0.6, earth: 0.2, air: 0.1, water: 0.1 },
      toolsRequired: ["comal", "direct flame", "tongs", "roasting basket"],
      bestFor: ["chiles", "tomatoes", "tomatillos", "onions", "salsas"],
    },
    {
      name: "Ahumado",
      description: "Smoking technique using various woods for distinct flavors",
      elementalProperties: { air: 0.4, fire: 0.3, earth: 0.2, water: 0.1 },
      toolsRequired: [
        "smoking chamber",
        "various woods",
        "temperature control",
        "hooks or racks",
      ],
      bestFor: ["meats", "chiles", "salt", "cheese", "seafood"],
    },
  ],
  regionalCuisines: {
    oaxaca: {
      name: "Oaxacan Cuisine",
      description:
        "Known as the 'land of seven moles' with rich indigenous culinary traditions",
      signature: [
        "mole negro",
        "tlayudas",
        "chapulines",
        "quesillo",
        "tamales oaxaqueños",
      ],
      elementalProperties: { earth: 0.5, fire: 0.2, water: 0.2, air: 0.1 },
      astrologicalInfluences: ["moon", "saturn", "taurus"],
      seasonality: "highly seasonal with ceremonial dishes",
    },
    yucatan: {
      name: "Yucatecan Cuisine",
      description:
        "Maya-influenced cuisine with distinctive achiote and citrus flavors",
      signature: [
        "cochinita pibil",
        "papadzules",
        "sopa de lima",
        "poc chuc",
        "panuchos",
      ],
      elementalProperties: { water: 0.4, earth: 0.3, fire: 0.2, air: 0.1 },
      astrologicalInfluences: ["venus", "mercury", "gemini"],
      seasonality: "tropical seasonal patterns",
    },
    northern: {
      name: "Northern Cuisine",
      description:
        "Meat-focused cuisine with flour tortillas and grilled specialties",
      signature: [
        "carne asada",
        "machaca",
        "flour tortillas",
        "chihuahua cheese",
        "burritos",
      ],
      elementalProperties: { fire: 0.5, earth: 0.3, air: 0.1, water: 0.1 },
      astrologicalInfluences: ["mars", "sun", "aries"],
      seasonality: "desert and ranching seasonal patterns",
    },
    centralMexico: {
      name: "Central Mexican Cuisine",
      description:
        "Home to Mexico City with ancient Aztec influences and modern street food",
      signature: [
        "tacos al pastor",
        "pozole",
        "chiles en nogada",
        "mole poblano",
        "street corn",
      ],
      elementalProperties: { earth: 0.4, fire: 0.3, water: 0.2, air: 0.1 },
      astrologicalInfluences: ["jupiter", "mercury", "virgo"],
      seasonality: "highland seasonal patterns with ceremonial dishes",
    },
    pacific: {
      name: "Pacific Coast Cuisine",
      description:
        "Seafood-forward cuisine with tropical fruits and fresh preparations",
      signature: [
        "pescado a la talla",
        "aguachile",
        "ceviche",
        "zarandeado",
        "camarones",
      ],
      elementalProperties: { water: 0.5, air: 0.2, fire: 0.2, earth: 0.1 },
      astrologicalInfluences: ["neptune", "venus", "pisces"],
      seasonality: "coastal seasonal patterns with monsoon influence",
    },
  },
  elementalProperties: {
    fire: 0.3, // Represents chiles and grilling,
    earth: 0.3, // Represents corn and beans,
    water: 0.2, // Represents sauces and stews,
    air: 0.2, // Represents herbs and light dishes
  },
};

export default mexican;
