// src/data/cuisines/middle-eastern.ts
import type { Cuisine } from "@/types/cuisine";

export const middleEastern: Cuisine = {
  id: "middle-eastern",
  name: "Middle Eastern",
  description:
    "Traditional Middle Eastern cuisine featuring aromatic spices, fresh herbs, and ancient cooking techniques",
  dishes: {
    breakfast: {
      all: [
        {
          "recipe_name": "Authentic Shakshuka",
          "description": "A deeply aromatic, traditional Middle Eastern and North African dish featuring eggs gently poached in a rich, spiced tomato and pepper stew. Historically rooted in Mediterranean agrarian traditions, it balances the fiery energy of warming spices with the grounding comfort of a savory, simmering sauce.",
          "details": {
            "cuisine": "Middle Eastern",
            "prep_time_minutes": 15,
            "cook_time_minutes": 25,
            "base_serving_size": 4,
            "spice_level": "Medium",
            "season": [
              "spring",
              "summer",
              "autumn",
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "extra virgin olive oil",
              "notes": "Used to extract the fat-soluble flavor compounds from aromatics and spices."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely diced."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "red bell peppers",
              "notes": "Diced; red preferred for sweetness and complementary color."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced or pressed. Add later to prevent bitterness from burning."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground cumin",
              "notes": "Freshly ground is highly recommended for optimal aromatic release."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sweet paprika",
              "notes": "Provides vibrant color and mild fruitiness."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "smoked paprika",
              "notes": "Imparts depth and a subtle campfire aroma."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "harissa paste",
              "notes": "Crucial for authentic regional heat and complexity."
            },
            {
              "amount": 800,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "Or fresh, deeply ripe tomatoes, peeled and crushed by hand."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Adjust to taste."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly cracked."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Room temperature for even poaching."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "Roughly chopped for finishing."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Roughly chopped for finishing."
            },
            {
              "amount": 4,
              "unit": "pieces",
              "name": "pita bread",
              "notes": "Warmed, serving as an edible utensil."
            }
          ],
          "instructions": [
            "Step 1: Place a heavy-bottomed, large skillet (preferably cast iron) over medium heat. Allow the pan to heat for 2 minutes before pouring in the extra virgin olive oil.",
            "Step 2: Add the diced yellow onions and red bell peppers to the skillet. Sauté gently, stirring occasionally, until the onions are translucent and the peppers have softened (about 8 to 10 minutes).",
            "Step 3: Clear a small space in the center of the pan and add the minced garlic, ground cumin, sweet paprika, smoked paprika, and harissa paste. Toast the spices in the residual oil for 30 to 60 seconds until highly fragrant. Stir them into the onion and pepper mixture.",
            "Step 4: Pour in the crushed tomatoes. Season the mixture with kosher salt and freshly cracked black pepper. Stir well to combine, scraping up any fond at the bottom of the skillet.",
            "Step 5: Reduce the heat to medium-low and allow the sauce to simmer uncovered for 10 to 15 minutes. Wait for the tomatoes to break down and the sauce to thicken slightly, creating a rich, cohesive stew.",
            "Step 6: Using the back of a wooden spoon, press four evenly spaced indentations (wells) into the thickened sauce. Crack one room-temperature egg into each well.",
            "Step 7: Cover the skillet with a tight-fitting lid. Poach the eggs in the simmering sauce for 5 to 8 minutes, depending on your preferred level of doneness. The egg whites should be completely opaque and set, while the yolks should remain soft and slightly jiggly.",
            "Step 8: Remove the skillet from the heat immediately, as the residual heat of the sauce will continue to cook the eggs. Scatter the fresh chopped cilantro and parsley generously over the top.",
            "Step 9: Serve immediately from the skillet, accompanied by warm pita bread for dipping and scooping the sauce and runny egg yolks."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "brunch",
              "dinner"
            ],
            "cooking_methods": [
              "sautéing",
              "simmering",
              "poaching"
            ]
          },
          "elemental_properties": {
            "fire": 0.45,
            "water": 0.25,
            "earth": 0.2,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Sun",
              "Venus"
            ],
            "signs": [
              "Aries",
              "Leo",
              "Taurus"
            ],
            "lunar_phases": [
              "Waxing Gibbous",
              "Waning Gibbous",
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 320,
            "protein_g": 12,
            "carbs_g": 35,
            "fat_g": 15,
            "fiber_g": 6,
              "sodium_mg": 381,
              "sugar_g": 9,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "original_ingredient": "eggs",
              "substitute_options": [
                "silken tofu chunks (vegan)",
                "soft-boiled quail eggs",
                "chickpea scramble"
              ]
            },
            {
              "original_ingredient": "red bell peppers",
              "substitute_options": [
                "roasted red peppers (jarred)",
                "green bell peppers",
                "poblano peppers"
              ]
            },
            {
              "original_ingredient": "harissa paste",
              "substitute_options": [
                "chili garlic sauce",
                "sriracha",
                "pinch of cayenne pepper"
              ]
            },
            {
              "original_ingredient": "pita bread",
              "substitute_options": [
                "crusty sourdough",
                "challah bread",
                "gluten-free flatbread"
              ]
            }
          ]
        },
        {
          name: "Ful Medames",
          description:
            "Traditional fava bean breakfast with olive oil, lemon, and herbs",
          cuisine: "Middle Eastern",
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
              name: "mashing",
              elementalProperties: {
                Fire: 0.11,
                Water: 0.21,
                Earth: 0.5,
                Air: 0.18,
              },
            },
            "garnishing",
          ],
          tools: [
            "medium pot",
            "potato masher or fork",
            "serving bowl",
            "citrus juicer",
            "knife",
          ],
          preparationSteps: [
            "Simmer fava beans until tender",
            "Mash beans partially",
            "Mix with olive oil and lemon",
            "Season with cumin and garlic",
            "Garnish with herbs and tomatoes",
            "Drizzle with additional oil",
          ],
          ingredients: [
            {
              name: "fava beans",
              amount: "400",
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
              name: "olive oil",
              amount: "3",
              unit: "tbsp",
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
              name: "garlic",
              amount: "2",
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
              name: "cumin",
              amount: "1",
              unit: "tsp",
              category: "spice",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.1,
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
              name: "tomatoes",
              amount: "2",
              unit: "medium",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            "fava beans": ["lima beans", "chickpeas"],
            parsley: ["cilantro", "mint"],
            tomatoes: ["cucumber", "radishes"],
          },
          servingSize: 4,
          allergens: ["none"],
          prepTime: "10 minutes",
          cookTime: "10 minutes",
          culturalNotes:
            "Egypt's national dish, dating back to ancient times. Traditionally served for breakfast but enjoyed throughout the day",
          pairingSuggestions: [
            "pita bread",
            "sliced eggs",
            "olive oil",
            "tahini sauce",
          ],
          dietaryInfo: ["vegan", "gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 45,
            fat: 16,
            fiber: 3,
            vitamins: ["C", "K", "B6"],
            minerals: ["Iron", "Folate"],
          },
          timeToMake: "20 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.25,
            Earth: 0.28,
            Air: 0.17,
          },
        },
        {
          name: "Manakish Za'atar",
          description: "Flatbread topped with za'atar herb blend and olive oil",
          cuisine: "Middle Eastern (Levant)",
          cookingMethods: [
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
              name: "kneading",
              elementalProperties: {
                Fire: 0.14,
                Water: 0.14,
                Earth: 0.43,
                Air: 0.29,
              },
            },
            "topping",
          ],
          tools: [
            "mixing bowl",
            "baking sheet",
            "rolling pin",
            "pastry brush",
            "oven",
          ],
          preparationSteps: [
            "Prepare bread dough",
            "Let dough rise",
            "Roll out into circles",
            "Mix za'atar with oil",
            "Spread za'atar mixture",
            "Bake until golden",
          ],
          ingredients: [
            {
              name: "bread flour",
              amount: "500",
              unit: "g",
              category: "grain",
              swaps: ["whole wheat flour"],
            },
            {
              name: "za'atar",
              amount: "1/2",
              unit: "cup",
              category: "spice blend",
            },
            { name: "olive oil", amount: "1/2", unit: "cup", category: "oil" },
            { name: "yeast", amount: "2", unit: "tsp", category: "leavening" },
            { name: "sugar", amount: "1", unit: "tsp", category: "sweetener" },
            { name: "salt", amount: "2", unit: "tsp", category: "seasoning" },
          ],
          substitutions: {
            "bread flour": ["all-purpose flour", "gluten-free flour blend"],
            "za'atar": ["dried oregano + sesame seeds + sumac"],
            "olive oil": ["grapeseed oil", "avocado oil"],
          },
          servingSize: 6,
          allergens: ["gluten"],
          prepTime: "20 minutes",
          cookTime: "15 minutes",
          culturalNotes:
            "A beloved street food throughout the Levant, traditionally enjoyed for breakfast. The za'atar blend varies by region and family recipe",
          pairingSuggestions: [
            "labneh",
            "olives",
            "fresh vegetables",
            "mint tea",
          ],
          dietaryInfo: ["vegan", "adaptable to gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 45,
            fat: 12,
            fiber: 3,
            vitamins: ["E", "K"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.22,
            Water: 0.07,
            Earth: 0.54,
            Air: 0.17,
          },
        },
        {
          name: "Labneh with Za'atar",
          description:
            "Strained yogurt cheese with olive oil and za'atar spice blend",
          cuisine: "Middle Eastern (Levant)",
          cookingMethods: ["straining", "garnishing"],
          tools: ["cheesecloth", "strainer", "mixing bowl", "serving plate"],
          preparationSteps: [
            "Strain yogurt overnight",
            "Form into balls or spread",
            "Drizzle with olive oil",
            "Sprinkle with za'atar",
            "Garnish with fresh herbs",
          ],
          ingredients: [
            {
              name: "yogurt",
              amount: "1",
              unit: "kg",
              category: "dairy",
              swaps: ["coconut yogurt"],
            },
            {
              name: "za'atar",
              amount: "3",
              unit: "tbsp",
              category: "spice blend",
            },
            { name: "olive oil", amount: "1/4", unit: "cup", category: "oil" },
            {
              name: "mint leaves",
              amount: "1",
              unit: "handful",
              category: "herb",
            },
            {
              name: "pita bread",
              amount: "4",
              unit: "pieces",
              category: "grain",
              swaps: ["gluten-free pita"],
            },
          ],
          substitutions: {
            yogurt: ["Greek yogurt", "coconut yogurt"],
            "za'atar": ["dried thyme + sesame seeds"],
            "pita bread": ["gluten-free bread", "vegetables"],
          },
          servingSize: 6,
          allergens: ["dairy"],
          prepTime: "10 minutes",
          cookTime: "12 hours straining",
          culturalNotes:
            "A staple breakfast food throughout the Levant, often served with olive oil and fresh herbs",
          pairingSuggestions: [
            "cucumber",
            "tomatoes",
            "olives",
            "fresh mint tea",
          ],
          dietaryInfo: ["vegetarian", "adaptable to vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 180,
            protein: 12,
            carbs: 8,
            fat: 14,
            fiber: 3,
            vitamins: ["B12", "D"],
            minerals: ["Calcium", "Probiotics"],
          },
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.12,
            Water: 0.45,
            Earth: 0.33,
            Air: 0.11,
          },
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Mansaf",
          description:
            "Traditional Levantine lamb dish with fermented dried yogurt and rice",
          cuisine: "Middle Eastern (Jordan)",
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
              name: "layering",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.15,
                Earth: 0.46,
                Air: 0.31,
              },
            },
            {
              name: "fermenting",
              elementalProperties: {
                Fire: 0.06,
                Water: 0.33,
                Earth: 0.39,
                Air: 0.22,
              },
            },
          ],
          tools: [
            "large pot",
            "serving platter",
            "rice cooker",
            "strainer",
            "wooden spoon",
          ],
          preparationSteps: [
            "Prepare jameed sauce",
            "Cook lamb until tender",
            "Prepare rice",
            "Toast pine nuts",
            "Layer rice and meat",
            "Pour sauce over",
            "Garnish with nuts and parsley",
          ],
          ingredients: [
            {
              name: "lamb shoulder",
              amount: "1.5",
              unit: "kg",
              category: "protein",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.2,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            { name: "jameed", amount: "500", unit: "g", category: "dairy" },
            {
              name: "rice",
              amount: "1",
              unit: "kg",
              category: "grain",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.5,
                Air: 0.1,
              },
            },
            {
              name: "pine nuts",
              amount: "100",
              unit: "g",
              category: "nut",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.1,
                Earth: 0.5,
                Air: 0.2,
              },
            },
            {
              name: "flatbread",
              amount: "4",
              unit: "pieces",
              category: "grain",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.1,
                Earth: 0.5,
                Air: 0.2,
              },
            },
            {
              name: "parsley",
              amount: "1",
              unit: "bunch",
              category: "herb",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.2,
                Earth: 0.2,
                Air: 0.5,
              },
            },
          ],
          substitutions: {
            jameed: ["yogurt + salt", "buttermilk"],
            lamb: ["beef", "chicken"],
            "pine nuts": ["walnuts", "almonds"],
          },
          servingSize: 6,
          allergens: ["dairy", "nuts"],
          prepTime: "30 minutes",
          cookTime: "180 minutes",
          culturalNotes:
            "Jordan's national dish, traditionally served on special occasions. The dish represents Bedouin hospitality and generosity",
          pairingSuggestions: ["Arabic salad", "yogurt", "mint tea"],
          dietaryInfo: ["halal"],
          spiceLevel: "mild",
          nutrition: {
            calories: 750,
            protein: 45,
            carbs: 65,
            fat: 38,
            fiber: 3,
            vitamins: ["B12", "D"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.13,
            Water: 0.19,
            Earth: 0.5,
            Air: 0.18,
          },
        },
        {
          name: "Fattoush",
          description: "Levantine bread salad with sumac and mixed vegetables",
          cuisine: "Middle Eastern (Levant)",
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
              name: "chopping",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.08,
                Earth: 0.54,
                Air: 0.31,
              },
            },
            "tossing",
          ],
          tools: ["large bowl", "sharp knife", "baking sheet", "whisk"],
          preparationSteps: [
            "Toast pita bread",
            "Chop vegetables",
            "Make dressing",
            "Combine ingredients",
            "Add bread just before serving",
            "Garnish with sumac",
          ],
          ingredients: [
            {
              name: "pita bread",
              amount: "2",
              unit: "pieces",
              category: "grain",
              swaps: ["gluten-free pita"],
            },
            {
              name: "romaine lettuce",
              amount: "1",
              unit: "head",
              category: "vegetable",
            },
            {
              name: "cucumber",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "tomatoes",
              amount: "3",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "radishes",
              amount: "6",
              unit: "medium",
              category: "vegetable",
            },
            { name: "sumac", amount: "2", unit: "tbsp", category: "spice" },
            {
              name: "pomegranate molasses",
              amount: "2",
              unit: "tbsp",
              category: "condiment",
            },
          ],
          substitutions: {
            "pita bread": ["gluten-free bread", "crackers"],
            sumac: ["lemon zest + salt"],
            "pomegranate molasses": ["balsamic reduction"],
          },
          servingSize: 4,
          allergens: ["gluten"],
          prepTime: "20 minutes",
          cookTime: "5 minutes",
          culturalNotes:
            "A refreshing salad that originated as a way to use stale bread. The sumac provides a distinctive tangy flavor essential to Levantine cuisine",
          pairingSuggestions: ["grilled meats", "hummus", "falafel"],
          dietaryInfo: ["vegan", "adaptable to gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 220,
            protein: 6,
            carbs: 42,
            fat: 4,
            fiber: 3,
            vitamins: ["C", "A", "K"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["summer"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.24,
            Water: 0.06,
            Earth: 0.51,
            Air: 0.18,
          },
        },
      ],
    },
    dinner: {
      winter: [
        {
          name: "Moussaka",
          description:
            "Layered eggplant and spiced meat casserole with béchamel",
          cuisine: "Middle Eastern",
          cookingMethods: [
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
              name: "frying",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.12,
                Earth: 0.18,
                Air: 0.29,
              },
            },
            {
              name: "layering",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.15,
                Earth: 0.46,
                Air: 0.31,
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
            "large baking dish",
            "skillet",
            "saucepan",
            "mandoline",
            "whisk",
            "strainer",
          ],
          preparationSteps: [
            "Salt and drain eggplant",
            "Fry eggplant slices",
            "Prepare meat sauce",
            "Make béchamel sauce",
            "Layer ingredients",
            "Bake until golden",
          ],
          ingredients: [
            {
              name: "ground lamb",
              amount: "500",
              unit: "g",
              category: "protein",
              swaps: ["plant-based ground"],
            },
            {
              name: "eggplant",
              amount: "3",
              unit: "large",
              category: "vegetable",
            },
            {
              name: "potatoes",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "onion",
              amount: "1",
              unit: "large",
              category: "vegetable",
            },
            {
              name: "tomato sauce",
              amount: "400",
              unit: "ml",
              category: "sauce",
            },
            {
              name: "béchamel sauce",
              amount: "500",
              unit: "ml",
              category: "sauce",
              swaps: ["cashew sauce"],
            },
            { name: "cinnamon", amount: "1", unit: "tsp", category: "spice" },
            { name: "nutmeg", amount: "1/4", unit: "tsp", category: "spice" },
          ],
          substitutions: {
            "ground lamb": ["ground beef", "plant-based ground"],
            béchamel: ["cashew cream sauce", "almond milk sauce"],
            eggplant: ["zucchini", "mushrooms"],
          },
          servingSize: 8,
          allergens: ["dairy", "gluten"],
          prepTime: "45 minutes",
          cookTime: "45 minutes",
          culturalNotes:
            "A beloved dish throughout the Middle East and Mediterranean, each region having its own variation. The combination of meat and eggplant reflects the region's agricultural heritage",
          pairingSuggestions: ["Greek salad", "crusty bread", "red wine"],
          dietaryInfo: ["adaptable to vegetarian/vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 580,
            protein: 32,
            carbs: 45,
            fat: 34,
            fiber: 3,
            vitamins: ["B12", "A", "C"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.42,
            Water: 0.09,
            Earth: 0.41,
            Air: 0.09,
          },
        },
        {
          name: "Kuzi",
          description: "Whole roasted lamb with spiced rice and nuts",
          cuisine: "Middle Eastern",
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
              name: "braising",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.35,
                Earth: 0.3,
                Air: 0.1,
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
          ],
          tools: [
            "large roasting pan",
            "rice cooker",
            "spice grinder",
            "kitchen twine",
            "thermometer",
          ],
          preparationSteps: [
            "Marinate lamb",
            "Prepare spice mixture",
            "Cook aromatic rice",
            "Toast nuts",
            "Roast lamb",
            "Assemble and garnish",
          ],
          ingredients: [
            {
              name: "lamb shoulder",
              amount: "2",
              unit: "kg",
              category: "protein",
              swaps: ["jackfruit", "mushrooms"],
            },
            {
              name: "aromatic rice",
              amount: "500",
              unit: "g",
              category: "grain",
            },
            { name: "almonds", amount: "100", unit: "g", category: "nuts" },
            { name: "pine nuts", amount: "50", unit: "g", category: "nuts" },
            { name: "raisins", amount: "100", unit: "g", category: "fruit" },
            {
              name: "mixed spices",
              amount: "3",
              unit: "tbsp",
              category: "spice",
            },
          ],
          substitutions: {
            "lamb shoulder": ["beef shoulder", "jackfruit"],
            "pine nuts": ["cashews", "almonds"],
            "mixed spices": ["baharat", "ras el hanout"],
          },
          servingSize: 8,
          allergens: ["nuts"],
          prepTime: "60 minutes",
          cookTime: "180 minutes",
          culturalNotes:
            "A celebratory dish often served at important gatherings and festivals. The combination of meat, rice, and nuts represents abundance and hospitality",
          pairingSuggestions: ["tabbouleh", "yogurt sauce", "flatbread"],
          dietaryInfo: ["halal"],
          spiceLevel: "medium",
          nutrition: {
            calories: 850,
            protein: 45,
            carbs: 65,
            fat: 48,
            fiber: 3,
            vitamins: ["B12", "B6", "E"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.32,
            Water: 0.2,
            Earth: 0.39,
            Air: 0.09,
          },
        },
      ],
      summer: [
        {
          name: "Mixed Grill Platter",
          description:
            "Assortment of grilled meats and vegetables with various dips",
          cuisine: "Middle Eastern",
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
              name: "marinating",
              elementalProperties: {
                Fire: 0.13,
                Water: 0.44,
                Earth: 0.19,
                Air: 0.25,
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
            "grill",
            "skewers",
            "tongs",
            "mixing bowls",
            "serving platter",
          ],
          preparationSteps: [
            "Prepare marinades",
            "Marinate meats",
            "Thread onto skewers",
            "Grill meats and vegetables",
            "Prepare accompaniments",
            "Arrange on platter",
          ],
          ingredients: [
            {
              name: "lamb kofta",
              amount: "400",
              unit: "g",
              category: "protein",
              swaps: ["mushroom kofta"],
            },
            {
              name: "chicken shish",
              amount: "400",
              unit: "g",
              category: "protein",
              swaps: ["seitan skewers"],
            },
            {
              name: "mixed vegetables",
              amount: "500",
              unit: "g",
              category: "vegetable",
            },
            { name: "hummus", amount: "200", unit: "g", category: "dip" },
            { name: "baba ganoush", amount: "200", unit: "g", category: "dip" },
            {
              name: "flatbread",
              amount: "4",
              unit: "pieces",
              category: "grain",
              swaps: ["gluten-free flatbread"],
            },
          ],
          substitutions: {
            "lamb kofta": ["beef kofta", "plant-based kofta"],
            "chicken shish": ["tofu shish", "seitan"],
            flatbread: ["gluten-free pita", "lettuce wraps"],
          },
          servingSize: 4,
          allergens: ["gluten"],
          prepTime: "30 minutes",
          cookTime: "25 minutes",
          culturalNotes:
            "Grilled meats are central to Middle Eastern cuisine, often served at gatherings and celebrations. Each region has its own special marinades and spice blends",
          pairingSuggestions: [
            "fattoush salad",
            "pickled vegetables",
            "garlic sauce",
          ],
          dietaryInfo: ["halal", "adaptable to vegetarian/vegan"],
          spiceLevel: "medium",
          nutrition: {
            calories: 680,
            protein: 45,
            carbs: 55,
            fat: 32,
            fiber: 3,
            vitamins: ["B12", "C", "A"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["summer"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.37,
            Water: 0.15,
            Earth: 0.37,
            Air: 0.11,
          },
        },
        {
          "recipe_name": "Authentic Mujaddara",
          "description": "An ancient, profoundly comforting Levantine staple.",
          "details": {
            "cuisine": "Middle Eastern",
            "prep_time_minutes": 15,
            "cook_time_minutes": 45,
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
              "name": "lentils",
              "notes": "Brown or green."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "rice or bulgur",
              "notes": "Long-grain."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "onions",
              "notes": "Sliced thinly for frizzling."
            }
          ],
          "instructions": [
            "Step 1: Parboil lentils.",
            "Step 2: Caramelize onions in olive oil until deeply dark and crispy (frizzled).",
            "Step 3: Remove half the onions for garnish.",
            "Step 4: Add cumin and coriander.",
            "Step 5: Add rice, lentils, and water. Simmer until absorbed.",
            "Step 6: Serve topped with frizzled onions."
          ],
          "classifications": {
            "meal_type": [
              "dinner"
            ],
            "cooking_methods": [
              "simmering",
              "frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.1,
            "earth": 0.6,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Saturn"
            ],
            "signs": [
              "Capricorn"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 16,
            "carbs_g": 65,
            "fat_g": 18,
            "fiber_g": 12,
              "sodium_mg": 246,
              "sugar_g": 12,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "original_ingredient": "rice",
              "substitute_options": [
                "bulgur wheat"
              ]
            }
          ]
        },
      ],
      all: [
        {
          name: "Shawarma",
          description:
            "Marinated meat slowly roasted on a vertical spit, served in bread with tahini sauce",
          cuisine: "Middle Eastern",
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
              name: "marinating",
              elementalProperties: {
                Fire: 0.13,
                Water: 0.44,
                Earth: 0.19,
                Air: 0.25,
              },
            },
            {
              name: "slicing",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.08,
                Earth: 0.54,
                Air: 0.31,
              },
            },
          ],
          tools: [
            "vertical rotisserie",
            "sharp knife",
            "mixing bowls",
            "food processor",
            "serving plates",
          ],
          preparationSteps: [
            "Prepare marinade",
            "Marinate meat overnight",
            "Stack on vertical spit",
            "Slow roast",
            "Slice thin portions",
            "Serve with accompaniments",
          ],
          ingredients: [
            {
              name: "chicken thighs",
              amount: "2",
              unit: "kg",
              category: "protein",
              swaps: ["seitan"],
            },
            {
              name: "shawarma spice mix",
              amount: "4",
              unit: "tbsp",
              category: "spice blend",
            },
            {
              name: "garlic",
              amount: "8",
              unit: "cloves",
              category: "aromatic",
            },
            {
              name: "lemon juice",
              amount: "1/2",
              unit: "cup",
              category: "acid",
            },
            { name: "olive oil", amount: "1/2", unit: "cup", category: "oil" },
            {
              name: "pita bread",
              amount: "8",
              unit: "pieces",
              category: "grain",
              swaps: ["lettuce wraps"],
            },
          ],
          substitutions: {
            "chicken thighs": ["lamb", "seitan", "jackfruit"],
            "pita bread": ["flatbread", "gluten-free wrap"],
            "shawarma spice mix": ["curry powder + cumin + paprika"],
          },
          servingSize: 8,
          allergens: ["gluten"],
          prepTime: "30 minutes",
          cookTime: "240 minutes",
          culturalNotes:
            "A street food staple throughout the Middle East, each region has its own spice blend and serving style",
          pairingSuggestions: [
            "hummus",
            "tabbouleh",
            "pickled vegetables",
            "garlic sauce",
          ],
          dietaryInfo: ["halal", "adaptable to vegan"],
          spiceLevel: "medium",
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 35,
            fat: 22,
            fiber: 3,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],

          elementalProperties: {
            Fire: 0.29,
            Water: 0.19,
            Earth: 0.37,
            Air: 0.15,
          },
          mealType: ["dinner"],
        },

        {
          name: "Baklava",
          description:
            "Layered phyllo pastry filled with nuts and soaked in honey syrup",
          cuisine: "Middle Eastern",
          cookingMethods: [
            {
              name: "layering",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.15,
                Earth: 0.46,
                Air: 0.31,
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
            "syrup-making",
          ],
          tools: [
            "baking dish",
            "pastry brush",
            "sharp knife",
            "saucepan",
            "food processor",
          ],
          preparationSteps: [
            "Process nuts with spices",
            "Layer phyllo sheets with butter",
            "Add nut mixture",
            "Continue layering",
            "Cut into diamonds",
            "Bake until golden",
            "Pour hot syrup over",
          ],
          ingredients: [
            {
              name: "phyllo dough",
              amount: "1",
              unit: "package",
              category: "pastry",
            },
            {
              name: "walnuts",
              amount: "500",
              unit: "g",
              category: "nut",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.1,
                Earth: 0.5,
                Air: 0.2,
              },
            },
            {
              name: "butter",
              amount: "400",
              unit: "g",
              category: "fat",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.2,
                Earth: 0.5,
                Air: 0.1,
              },
            },
            {
              name: "honey",
              amount: "250",
              unit: "ml",
              category: "sweetener",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.3,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "cinnamon",
              amount: "2",
              unit: "tsp",
              category: "spice",
              elementalProperties: {
                Fire: 0.45,
                Water: 0.1,
                Earth: 0.35,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            walnuts: ["pistachios", "almonds"],
            butter: ["ghee", "clarified butter"],
            honey: ["sugar syrup", "agave"],
          },
          servingSize: 24,
          allergens: ["nuts", "gluten"],
          prepTime: "45 minutes",
          cookTime: "45 minutes",
          culturalNotes:
            "A dessert with ancient origins, found throughout the former Ottoman Empire. Each region claims its own style and nut preference",
          pairingSuggestions: ["Turkish coffee", "mint tea"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 300,
            protein: 5,
            carbs: 25,
            fat: 22,
            fiber: 3,
            vitamins: ["E"],
            minerals: ["Magnesium"],
          },
          season: ["all"],
          mealType: ["dessert"],
          elementalProperties: {
            Fire: 0.33,
            Water: 0.12,
            Earth: 0.45,
            Air: 0.11,
          },
        },

        {
          "recipe_name": "Authentic Levantine Falafel",
          "description": "A triumph of plant-based culinary geometry.",
          "details": {
            "cuisine": "Middle Eastern",
            "prep_time_minutes": 1440,
            "cook_time_minutes": 20,
            "base_serving_size": 4,
            "spice_level": "Mild",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "dried chickpeas",
              "notes": "NO CANNED CHICKPEAS."
            }
          ],
          "instructions": [
            "Step 1: Soak chickpeas.",
            "Step 2: Grind with herbs and spices.",
            "Step 3: Fry in hot oil."
          ],
          "classifications": {
            "meal_type": [
              "lunch"
            ],
            "cooking_methods": [
              "frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.1,
            "earth": 0.4,
            "air": 0.1
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
            "calories": 380,
            "protein_g": 12,
            "carbs_g": 35,
            "fat_g": 22,
            "fiber_g": 9,
              "sodium_mg": 419,
              "sugar_g": 2,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },

        {
          name: "Umm Ali",
          description: "Egyptian bread pudding with milk, cream, and nuts",
          cuisine: "Middle Eastern (Egyptian)",
          cookingMethods: [
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
              name: "assembling",
              elementalProperties: {
                Fire: 0.04,
                Water: 0.16,
                Earth: 0.4,
                Air: 0.4,
              },
            },
            {
              name: "broiling",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.06,
                Earth: 0.12,
                Air: 0.32,
              },
            },
          ],
          tools: [
            "baking dish",
            "mixing bowls",
            "saucepan",
            "whisk",
            "measuring cups",
          ],
          preparationSteps: [
            "Break bread into pieces",
            "Heat milk and cream",
            "Layer bread and nuts",
            "Pour hot milk mixture",
            "Top with cream",
            "Bake until golden",
          ],
          ingredients: [
            {
              name: "puff pastry",
              amount: "500",
              unit: "g",
              category: "pastry",
              swaps: ["croissants"],
            },
            {
              name: "whole milk",
              amount: "1",
              unit: "liter",
              category: "dairy",
            },
            {
              name: "heavy cream",
              amount: "500",
              unit: "ml",
              category: "dairy",
            },
            { name: "mixed nuts", amount: "200", unit: "g", category: "nuts" },
            { name: "sugar", amount: "200", unit: "g", category: "sweetener" },
            {
              name: "vanilla",
              amount: "2",
              unit: "tsp",
              category: "flavoring",
            },
          ],
          substitutions: {
            "puff pastry": ["croissants", "bread"],
            "whole milk": ["almond milk", "oat milk"],
            "heavy cream": ["coconut cream", "cashew cream"],
          },
          servingSize: 8,
          allergens: ["dairy", "nuts", "gluten"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          culturalNotes:
            "A beloved Egyptian dessert with a royal history, named after Umm Alia sultan's wife",
          pairingSuggestions: ["Arabic coffee", "mint tea"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 480,
            protein: 10,
            carbs: 45,
            fat: 32,
            fiber: 3,
            vitamins: ["A", "D"],
            minerals: ["Calcium"],
          },
          season: ["winter"],
          mealType: ["dessert"],
          elementalProperties: {
            Fire: 0.17,
            Water: 0.07,
            Earth: 0.59,
            Air: 0.17,
          },
        },

        {
          name: "Knafeh",
          description:
            "Sweet cheese pastry made with shredded phyllo dough and aromatic syrup",
          cuisine: "Middle Eastern (Levant)",
          cookingMethods: [
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
              name: "assembling",
              elementalProperties: {
                Fire: 0.04,
                Water: 0.16,
                Earth: 0.4,
                Air: 0.4,
              },
            },
            "syrup-making",
          ],
          tools: [
            "round baking pan",
            "food processor",
            "saucepan",
            "pastry brush",
            "spatula",
          ],
          preparationSteps: [
            "Prepare orange blossom syrup",
            "Process kataifi dough",
            "Mix with ghee",
            "Layer with cheese",
            "Bake until golden",
            "Soak with syrup",
            "Garnish with pistachios",
          ],
          ingredients: [
            {
              name: "kataifi dough",
              amount: "500",
              unit: "g",
              category: "pastry",
            },
            {
              name: "akkawi cheese",
              amount: "500",
              unit: "g",
              category: "dairy",
              swaps: ["mozzarella"],
            },
            { name: "ghee", amount: "300", unit: "g", category: "fat" },
            {
              name: "sugar syrup",
              amount: "500",
              unit: "ml",
              category: "syrup",
            },
            {
              name: "orange blossom water",
              amount: "2",
              unit: "tbsp",
              category: "flavoring",
            },
            { name: "pistachios", amount: "100", unit: "g", category: "nut" },
          ],
          substitutions: {
            "akkawi cheese": ["mozzarella", "fresh cheese"],
            ghee: ["clarified butter", "butter"],
            "orange blossom water": ["rose water", "vanilla"],
          },
          servingSize: 12,
          allergens: ["dairy", "nuts", "gluten"],
          prepTime: "40 minutes",
          cookTime: "35 minutes",
          culturalNotes:
            "A beloved dessert throughout the Levant, particularly famous in Nablus, Palestine. Often eaten for breakfast",
          pairingSuggestions: ["Arabic coffee", "black tea"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 420,
            protein: 12,
            carbs: 48,
            fat: 24,
            fiber: 3,
            vitamins: ["A", "E"],
            minerals: ["Calcium"],
          },
          season: ["all"],
          mealType: ["dessert", "breakfast"],
          elementalProperties: {
            Fire: 0.12,
            Water: 0.14,
            Earth: 0.66,
            Air: 0.09,
          },
        },

        {
          name: "Kofta Kebab",
          description:
            "Grilled spiced ground meat skewers with herbs and onions",
          cuisine: "Middle Eastern",
          cookingMethods: [
            {
              name: "grinding",
              elementalProperties: {
                Fire: 0.14,
                Water: 0.07,
                Earth: 0.57,
                Air: 0.21,
              },
            },
            "skewering",
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
          tools: [
            "food processor",
            "metal skewers",
            "grill",
            "mixing bowls",
            "grater",
          ],
          preparationSteps: [
            "Mix ground meat with spices",
            "Grate onions and drain",
            "Combine with herbs",
            "Shape onto skewers",
            "Grill until charred",
            "Serve with accompaniments",
          ],
          ingredients: [
            {
              name: "ground lamb",
              amount: "1",
              unit: "kg",
              category: "protein",
              swaps: ["ground beef"],
            },
            {
              name: "onion",
              amount: "2",
              unit: "large",
              category: "vegetable",
            },
            { name: "parsley", amount: "1", unit: "bunch", category: "herb" },
            {
              name: "seven spices",
              amount: "2",
              unit: "tbsp",
              category: "spice blend",
            },
            { name: "sumac", amount: "1", unit: "tbsp", category: "spice" },
          ],
          substitutions: {
            "ground lamb": ["ground beef", "ground chicken"],
            "seven spices": ["baharat", "kebab spice mix"],
            sumac: ["lemon zest"],
          },
          servingSize: 6,
          allergens: ["none"],
          prepTime: "30 minutes",
          cookTime: "15 minutes",
          culturalNotes:
            "A classic street food and home-cooked dish throughout the Middle East. The art of kofta-making is passed down through generations",
          pairingSuggestions: [
            "flatbread",
            "hummus",
            "grilled vegetables",
            "rice",
          ],
          dietaryInfo: ["halal"],
          spiceLevel: "medium",
          nutrition: {
            calories: 380,
            protein: 32,
            carbs: 8,
            fat: 26,
            fiber: 3,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.41,
            Water: 0.12,
            Earth: 0.37,
            Air: 0.1,
          },
        },

        {
          name: "Chicken Makloubeh",
          description:
            "Upside-down rice dish with chicken, eggplant, and cauliflower",
          cuisine: "Middle Eastern (Palestinian)",
          cookingMethods: [
            {
              name: "layering",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.15,
                Earth: 0.46,
                Air: 0.31,
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
            {
              name: "steaming",
              elementalProperties: {
                Fire: 0.06,
                Water: 0.56,
                Earth: 0.13,
                Air: 0.25,
              },
            },
          ],
          tools: [
            "large pot",
            "frying pan",
            "serving plate",
            "strainer",
            "wooden spoon",
          ],
          preparationSteps: [
            "Cook chicken with spices",
            "Fry vegetables",
            "Layer ingredients",
            "Cook rice",
            "Steam together",
            "Flip onto serving plate",
          ],
          ingredients: [
            {
              name: "chicken pieces",
              amount: "1.5",
              unit: "kg",
              category: "protein",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.35,
                Air: 0.15,
              },
            },
            {
              name: "rice",
              amount: "750",
              unit: "g",
              category: "grain",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.5,
                Air: 0.1,
              },
            },
            {
              name: "eggplant",
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
              name: "cauliflower",
              amount: "1",
              unit: "head",
              category: "vegetable",
            },
            {
              name: "pine nuts",
              amount: "100",
              unit: "g",
              category: "nut",
              swaps: ["almonds"],
            },
          ],
          substitutions: {
            "chicken pieces": ["lamb", "beef"],
            "pine nuts": ["almonds", "cashews"],
            "white rice": ["brown rice", "freekeh"],
          },
          servingSize: 8,
          allergens: ["nuts"],
          prepTime: "45 minutes",
          cookTime: "90 minutes",
          culturalNotes:
            "A celebratory dish that means 'upside-down' in Arabic. The dramatic unveiling of the dish is part of the dining experience",
          pairingSuggestions: [
            "yogurt sauce",
            "Arabic salad",
            "pickled vegetables",
          ],
          dietaryInfo: ["halal"],
          spiceLevel: "mild",
          nutrition: {
            calories: 520,
            protein: 35,
            carbs: 48,
            fat: 24,
            fiber: 3,
            vitamins: ["A", "C", "B12"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["all"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.22,
            Water: 0.2,
            Earth: 0.42,
            Air: 0.17,
          },
        },

        {
          name: "Tabbouleh",
          description:
            "Fresh Lebanese parsley salad with bulgur, tomatoes, and lemon",
          cuisine: "Middle Eastern (Lebanese)",
          cookingMethods: [
            {
              name: "chopping",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.12,
                Earth: 0.35,
                Air: 0.45,
              },
            },
            {
              name: "soaking",
              elementalProperties: {
                Fire: 0.05,
                Water: 0.65,
                Earth: 0.2,
                Air: 0.1,
              },
            },
          ],
          tools: [
            "sharp knife",
            "cutting board",
            "mixing bowl",
            "citrus juicer",
          ],
          preparationSteps: [
            "Soak bulgur wheat in water",
            "Finely chop parsley and mint",
            "Dice tomatoes and green onions",
            "Drain bulgur and squeeze dry",
            "Combine all ingredients",
            "Dress with lemon juice and olive oil",
          ],
          ingredients: [
            {
              name: "flat-leaf parsley",
              amount: "3",
              unit: "bunches",
              category: "herb",
            },
            {
              name: "fine bulgur",
              amount: "1/4",
              unit: "cup",
              category: "grain",
            },
            {
              name: "tomatoes",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "green onions",
              amount: "4",
              unit: "stalks",
              category: "vegetable",
            },
            {
              name: "fresh mint",
              amount: "1/2",
              unit: "cup",
              category: "herb",
            },
            {
              name: "lemon juice",
              amount: "1/3",
              unit: "cup",
              category: "citrus",
            },
            { name: "olive oil", amount: "1/4", unit: "cup", category: "fat" },
          ],
          substitutions: {
            "fine bulgur": ["quinoa", "couscous"],
            "flat-leaf parsley": ["curly parsley"],
          },
          servingSize: 6,
          allergens: ["gluten"],
          prepTime: "20 minutes",
          cookTime: "0 minutes",
          culturalNotes:
            "A cornerstone of Lebanese cuisine, tabbouleh is parsley with some bulgur, not the other way around",
          pairingSuggestions: ["grilled meats", "pita bread", "hummus"],
          dietaryInfo: ["vegan", "vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 120,
            protein: 3,
            carbs: 14,
            fat: 7,
            fiber: 3,
            vitamins: ["C", "K", "A"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["spring", "summer"],
          mealType: ["lunch", "appetizer"],
          elementalProperties: {
            Fire: 0.15,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.35,
          },
        },

        {
          name: "Kibbeh",
          description:
            "Bulgur and ground meat croquettes with pine nuts and spices",
          cuisine: "Middle Eastern (Levantine)",
          cookingMethods: [
            {
              name: "grinding",
              elementalProperties: {
                Fire: 0.14,
                Water: 0.07,
                Earth: 0.57,
                Air: 0.21,
              },
            },
            {
              name: "deep-frying",
              elementalProperties: {
                Fire: 0.55,
                Water: 0.05,
                Earth: 0.1,
                Air: 0.3,
              },
            },
          ],
          tools: [
            "food processor",
            "mixing bowl",
            "deep fryer",
            "slotted spoon",
          ],
          preparationSteps: [
            "Soak bulgur and squeeze dry",
            "Process with lean meat and spices",
            "Prepare filling with pine nuts",
            "Shape into torpedo forms",
            "Deep fry until golden",
            "Drain on paper towels",
          ],
          ingredients: [
            {
              name: "fine bulgur",
              amount: "1",
              unit: "cup",
              category: "grain",
            },
            {
              name: "lean ground lamb",
              amount: "500",
              unit: "g",
              category: "protein",
            },
            {
              name: "onion",
              amount: "1",
              unit: "large",
              category: "vegetable",
            },
            { name: "pine nuts", amount: "1/4", unit: "cup", category: "nut" },
            {
              name: "seven spices",
              amount: "1",
              unit: "tbsp",
              category: "spice blend",
            },
            {
              name: "vegetable oil",
              amount: "2",
              unit: "cups",
              category: "fat",
            },
          ],
          substitutions: {
            "ground lamb": ["ground beef"],
            "pine nuts": ["walnuts"],
          },
          servingSize: 8,
          allergens: ["gluten", "nuts"],
          prepTime: "45 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "Considered the national dish of Lebanon, with countless regional variations",
          pairingSuggestions: ["yogurt", "tabbouleh", "fattoush"],
          dietaryInfo: ["halal"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 18,
            carbs: 22,
            fat: 19,
            fiber: 3,
            vitamins: ["B12", "B6"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["appetizer", "lunch"],
          elementalProperties: {
            Fire: 0.35,
            Water: 0.15,
            Earth: 0.4,
            Air: 0.1,
          },
        },

        {
          name: "Basbousa",
          description:
            "Semolina cake soaked in sweet rose or orange blossom syrup",
          cuisine: "Middle Eastern",
          cookingMethods: [
            {
              name: "baking",
              elementalProperties: {
                Fire: 0.35,
                Water: 0.08,
                Earth: 0.52,
                Air: 0.05,
              },
            },
            {
              name: "soaking",
              elementalProperties: {
                Fire: 0.05,
                Water: 0.65,
                Earth: 0.2,
                Air: 0.1,
              },
            },
          ],
          tools: ["baking pan", "mixing bowl", "whisk", "saucepan"],
          preparationSteps: [
            "Mix semolina with yogurt and sugar",
            "Add melted butter and baking powder",
            "Spread in pan and score diamonds",
            "Place almond on each piece",
            "Bake until golden",
            "Pour hot syrup over hot cake",
          ],
          ingredients: [
            { name: "semolina", amount: "2", unit: "cups", category: "grain" },
            { name: "sugar", amount: "1", unit: "cup", category: "sweetener" },
            { name: "yogurt", amount: "1", unit: "cup", category: "dairy" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat" },
            { name: "almonds", amount: "24", unit: "pieces", category: "nut" },
            {
              name: "rose water",
              amount: "1",
              unit: "tbsp",
              category: "flavoring",
            },
          ],
          substitutions: {
            "rose water": ["orange blossom water", "vanilla"],
            almonds: ["pistachios", "coconut"],
          },
          servingSize: 24,
          allergens: ["dairy", "gluten", "nuts"],
          prepTime: "15 minutes",
          cookTime: "35 minutes",
          culturalNotes:
            "A beloved dessert throughout the Arab world, often served during Ramadan and special occasions",
          pairingSuggestions: ["Arabic coffee", "black tea"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 180,
            protein: 3,
            carbs: 28,
            fat: 8,
            fiber: 3,
            vitamins: ["E"],
            minerals: ["Calcium"],
          },
          season: ["all"],
          mealType: ["dessert"],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.25,
            Earth: 0.55,
            Air: 0.1,
          },
        },
      ],
    },
  },
  traditionalSauces: {
    tahini: {
      name: "Tahini",
      description:
        "Creamy sesame seed paste used as a base for many Middle Eastern sauces",
      base: "sesame seeds",
      keyIngredients: ["hulled sesame seeds", "neutral oil", "salt"],
      culinaryUses: [
        "sauce base",
        "dressing",
        "dip",
        "condiment",
        "dessert ingredient",
      ],
      variants: [
        "Light tahini",
        "Dark tahini",
        "Whole seed tahini",
        "Lebanese-style",
        "Sweet tahini",
      ],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.2,
        Air: 0.2,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Venus", "Moon", "taurus"],
      seasonality: "all",
      preparationNotes:
        "Traditionally ground with stone mills to preserve flavor and nutrients",
      technicalTips:
        "Stir well before using as natural separation occurs. Add water slowly when thinning",
    },
    hummus: {
      name: "Hummus",
      description: "Creamy chickpea dip with tahini, garlic, and lemon",
      base: "chickpeas and tahini",
      keyIngredients: [
        "chickpeas",
        "tahini",
        "garlic",
        "lemon juice",
        "olive oil",
      ],
      culinaryUses: [
        "dip",
        "spread",
        "sandwich filling",
        "appetizer",
        "mezze component",
      ],
      variants: [
        "Classic",
        "With pine nuts",
        "With roasted peppers",
        "Musabaha (chunky)",
        "Ful-hummus (with fava beans)",
      ],
      elementalProperties: {
        Earth: 0.4,
        Water: 0.3,
        Air: 0.2,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Jupiter", "Mercury", "virgo"],
      seasonality: "all",
      preparationNotes:
        "Each region claims to make the most authentic version. Texture can range from rustic to silky smooth",
      technicalTips:
        "Cook chickpeas with baking soda to help break down skins for smoother texture",
    },
    zaatar: {
      name: "Za'atar Oil",
      description:
        "Herb and sesame blend mixed with olive oil for dipping and spreading",
      base: "dried herbs and sesame",
      keyIngredients: [
        "thyme",
        "oregano",
        "marjoram",
        "sumac",
        "sesame seeds",
        "olive oil",
        "salt",
      ],
      culinaryUses: [
        "bread dipping",
        "marinade",
        "topping",
        "seasoning",
        "flavor enhancer",
      ],
      variants: ["Lebanese", "Palestinian", "Jordanian", "Syrian", "Israeli"],
      elementalProperties: {
        Air: 0.4,
        Earth: 0.3,
        Fire: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Venus", "gemini"],
      seasonality: "all, with fresh variations in spring",
      preparationNotes:
        "Family recipes are closely guarded secrets, with regional variations in proportions",
      technicalTips:
        "Mix with high-quality olive oil just before serving to preserve aromatics",
    },
    harissa: {
      name: "Harissa",
      description: "Hot chile paste with garlic, spices, and olive oil",
      base: "dried chiles",
      keyIngredients: [
        "dried chiles",
        "garlic",
        "coriander",
        "cumin",
        "caraway",
        "olive oil",
      ],
      culinaryUses: [
        "condiment",
        "marinade",
        "flavor base",
        "sauce enhancer",
        "stew ingredient",
      ],
      variants: [
        "Rose harissa",
        "Mild harissa",
        "Tunisian",
        "Moroccan",
        "Algerian",
      ],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.2,
        Air: 0.1,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "aries"],
      seasonality: "all",
      preparationNotes:
        "Traditional preservation technique for chiles in North African cuisine",
      technicalTips:
        "A little goes a long way. Store with a layer of olive oil on top to preserve freshness",
    },
    toum: {
      name: "Toum",
      description: "Intense garlic sauce with an airy, creamy texture",
      base: "garlic and oil",
      keyIngredients: ["garlic", "neutral oil", "lemon juice", "salt"],
      culinaryUses: [
        "grilled meat accompaniment",
        "sandwich spread",
        "dip",
        "marinade base",
      ],
      variants: [
        "Lebanese",
        "Syrian",
        "Traditional (egg-free)",
        "Modern (with egg white)",
        "Mint-infused",
      ],
      elementalProperties: {
        Air: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Earth: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Mars", "gemini"],
      seasonality: "all",
      preparationNotes:
        "Traditionally made by hand pounding in a mortar and pestle until emulsified",
      technicalTips:
        "Slow oil incorporation is essential for proper emulsification and fluffy texture",
    },
  },
  sauceRecommender: {
    forProtein: {
      lamb: [
        "yogurt-mint sauce",
        "pomegranate molasses",
        "tahini sauce",
        "harissa",
        "baharat marinade",
      ],
      chicken: [
        "toum",
        "sumac-onion sauce",
        "tarator",
        "amba",
        "preserved lemon dressing",
      ],
      beef: [
        "tahini sauce",
        "Turkish pepper paste",
        "harissa",
        "chermoula",
        "cumin-chili oil",
      ],
      seafood: [
        "chermoula",
        "tahini-lemon",
        "harissa-yogurt",
        "saffron-citrus",
        "sesame-herb oil",
      ],
      vegetarian: [
        "tahini sauce",
        "pomegranate molasses",
        "garlic-yogurt",
        "zhug",
        "spiced tomato",
      ],
    },
    forVegetable: {
      root: [
        "tahini sauce",
        "beet-tahini",
        "ras el hanout oil",
        "harissa",
        "preserved lemon dressing",
      ],
      leafy: [
        "sumac-onion dressing",
        "pomegranate vinaigrette",
        "lemon-garlic",
        "za'atar oil",
        "tahini-yogurt",
      ],
      eggplant: [
        "pomegranate molasses",
        "tahini sauce",
        "garlic-yogurt",
        "tomato charmoula",
        "mint oil",
      ],
      legume: [
        "tahini sauce",
        "cumin-garlic oil",
        "lemon-parsley",
        "olive-herb dressing",
        "harissa oil",
      ],
      grain: [
        "saffron butter",
        "olive-herb oil",
        "pomegranate reduction",
        "tahini",
        "preserved lemon",
      ],
    },
    forCookingMethod: {
      grilling: ["toum", "harissa", "chermoula", "sumac-onion", "zhug"],
      baking: [
        "za'atar oil",
        "sesame paste",
        "pomegranate glaze",
        "rose water syrup",
        "orange blossom honey",
      ],
      stewing: [
        "baharat sauce",
        "ras el hanout",
        "saffron-tomato",
        "preserved lemon",
        "tamarind",
      ],
      frying: [
        "tahini sauce",
        "garlic-yogurt",
        "lemon-herb",
        "tomato ezme",
        "tahini-yogurt",
      ],
      raw: [
        "olive oil-lemon",
        "herb-garlic",
        "sumac dressing",
        "pomegranate vinaigrette",
        "tahini-citrus",
      ],
    },
    byAstrological: {
      fire: [
        "harissa",
        "zhug",
        "chermoula",
        "hot pepper paste",
        "garlic-chili oil",
      ],
      earth: [
        "tahini",
        "hummus",
        "baba ganoush",
        "walnut-pomegranate",
        "chickpea-olive",
      ],
      water: [
        "yogurt sauces",
        "tarator",
        "cucumber-mint",
        "lemon-herb",
        "rosewater-honey",
      ],
      air: [
        "za'atar oil",
        "herb-infused oils",
        "citrus dressings",
        "sumac-onion",
        "mint-lemon",
      ],
    },
    byRegion: {
      levant: [
        "tahini sauce",
        "toum",
        "za'atar oil",
        "yogurt-cucumber",
        "pomegranate molasses",
      ],
      northAfrica: [
        "harissa",
        "chermoula",
        "preserved lemon paste",
        "ras el hanout oil",
        "caraway seed sauce",
      ],
      persian: [
        "walnut-pomegranate",
        "saffron-lime",
        "herb-yogurt",
        "barberry sauce",
        "dried lime dressing",
      ],
      arabian: [
        "date syrup",
        "tamarind sauce",
        "cardamom-rosewater",
        "baharat oil",
        "saffron-honey",
      ],
      turkish: [
        "red pepper paste",
        "yogurt-garlic",
        "isot butter",
        "pomegranate",
        "sumac-onion",
      ],
    },
    byDietary: {
      vegetarian: [
        "tahini sauce",
        "yogurt-based sauces",
        "herb oils",
        "pomegranate molasses",
        "za'atar oil",
      ],
      vegan: [
        "tahini sauce",
        "harissa",
        "chermoula",
        "herb oils",
        "pomegranate molasses",
      ],
      glutenFree: [
        "tahini sauce",
        "harissa",
        "chermoula",
        "yogurt-based sauces",
        "herb oils",
      ],
      dairyFree: [
        "tahini sauce",
        "pomegranate molasses",
        "herb oils",
        "chermoula",
        "zhug",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Mezze Preparation",
      description:
        "Art of creating balanced small dishes that complement each other in flavor, texture, and temperature",
      elementalProperties: { Earth: 0.3, Water: 0.3, Fire: 0.2, Air: 0.2 },
      toolsRequired: [
        "various serving dishes",
        "mortar and pestle",
        "fine grater",
        "sharp knife",
      ],
      bestFor: [
        "entertaining",
        "appetizers",
        "communal dining",
        "showcasing seasonal produce",
      ],
      difficulty: "medium",
    },
    {
      name: "Tagine Cooking",
      description:
        "Slow cooking in a conical earthenware pot that traps steam to create tender, aromatic dishes",
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "tagine pot",
        "diffuser",
        "long wooden spoon",
        "steady heat source",
      ],
      bestFor: [
        "tough cuts of meat",
        "whole vegetables",
        "fruit-meat combinations",
        "aromatic dishes",
      ],
      difficulty: "medium",
    },
    {
      name: "Bread Baking",
      description:
        "Traditional flatbread preparation using high heat and minimal leavening",
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
      toolsRequired: [
        "tanoor/taboon oven",
        "baking stone",
        "cushion for shaping",
        "long wooden peel",
      ],
      bestFor: [
        "pita",
        "lavash",
        "taboon bread",
        "saj bread",
        "communion bread",
      ],
      difficulty: "hard",
    },
    {
      name: "Charcoal Grilling",
      description:
        "Open-fire cooking over aromatic woods to impart smoky flavor to proteins and vegetables",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: [
        "mangal grill",
        "metal skewers",
        "long tongs",
        "brushes for basting",
      ],
      bestFor: ["kebabs", "kofta", "whole fish", "vegetables", "bread"],
      difficulty: "medium",
    },
    {
      name: "Preserving",
      description:
        "Ancient techniques for extending shelf life through fermentation, pickling, and drying",
      elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
      toolsRequired: [
        "clay pots",
        "glass jars",
        "cheesecloth",
        "sun-drying racks",
        "weights",
      ],
      bestFor: ["vegetables", "fruits", "herbs", "dairy products", "fish"],
      difficulty: "hard",
    },
  ],
  regionalCuisines: {
    levantine: {
      name: "Levantine Cuisine",
      description:
        "Cuisine of the Eastern Mediterranean coast, featuring olive oil, herbs, and za'atar",
      signature: ["mezze", "kibbeh", "tabbouleh", "manakish", "knafeh"],
      elementalProperties: { Earth: 0.4, Water: 0.2, Air: 0.2, Fire: 0.2 },
      astrologicalInfluences: ["Venus", "Mercury", "gemini"],
      seasonality: "heavily influenced by seasonal produce",
    },
    persian: {
      name: "Persian Cuisine",
      description:
        "Ancient Iranian culinary tradition with complex rice dishes and delicate use of herbs and fruits",
      signature: [
        "tahdig",
        "fesenjan",
        "jeweled rice",
        "koresh",
        "barbari bread",
      ],
      elementalProperties: { Earth: 0.3, Air: 0.3, Fire: 0.2, Water: 0.2 },
      astrologicalInfluences: ["Venus", "Sun", "Libra"],
      seasonality: "aligned with ancient festivals and seasonal transitions",
    },
    northAfrican: {
      name: "North African Cuisine",
      description:
        "Bold, spicy flavors with influences from Berber, Arab, Mediterranean, and Sub-Saharan traditions",
      signature: ["couscous", "tagine", "harissa", "merguez", "pastilla"],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Mars", "Sun", "aries"],
      seasonality: "desert-influenced seasonal patterns",
    },
    arabian: {
      name: "Arabian Peninsula Cuisine",
      description:
        "Desert-adapted cuisine with dates, rice, camel products, and distinctive spice blends",
      signature: [
        "kabsa",
        "harees",
        "mandi",
        "margoog",
        "dates with camel milk",
      ],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Saturn", "Moon", "capricorn"],
      seasonality: "oasis agriculture with date harvest emphasis",
    },
    turkish: {
      name: "Turkish-Influenced Cuisine",
      description:
        "Ottoman culinary legacy with layered flavors, yogurt, and regional variations",
      signature: ["lahmacun", "pide", "gözleme", "imam bayildi", "künefe"],
      elementalProperties: { Water: 0.3, Earth: 0.3, Fire: 0.2, Air: 0.2 },
      astrologicalInfluences: ["Jupiter", "Venus", "taurus"],
      seasonality: "four distinct seasons with special holiday dishes",
    },
  },
  elementalProperties: {
    Fire: 0.2,
    Water: 0.3,
    Earth: 0.3,
    Air: 0.2,
  },
};

export default middleEastern;
