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
          "recipe_name": "Authentic Greek Bougatsa",
          "description": "A Northern Greek breakfast icon from Thessaloniki. It consists of multiple layers of ultra-thin phyllo pastry wrapping a warm, creamy semolina custard. It is defined by its presentation: cut into small bite-sized squares and heavily dusted with powdered sugar and cinnamon while still hot.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 30,
            "cook_time_minutes": 30,
            "base_serving_size": 6,
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
              "notes": "Must be very fresh."
            },
            {
              "amount": 1,
              "unit": "liter",
              "name": "whole milk",
              "notes": "For the custard."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fine semolina",
              "notes": "For the custard."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the custard."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Melted, for brushing."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "vanilla extract",
              "notes": "Aromatic."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "powdered sugar",
              "notes": "For heavy dusting."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ground cinnamon",
              "notes": "For heavy dusting."
            }
          ],
          "instructions": [
            "Step 1: The Custard. Whisk semolina, sugar, and milk in a saucepan. Cook over medium heat until thick like porridge. Stir in vanilla and 1 tbsp butter. Let cool slightly.",
            "Step 2: The Wrap. Butter two sheets of phyllo. Place a large spoonful of custard in the center. Fold the phyllo over the custard to create a large rectangular envelope. Wrap this envelope in another 2 buttered sheets of phyllo to ensure strength.",
            "Step 3: Bake. Place seam-side down on a baking sheet. Bake at 375°F (190°C) for 20-25 mins until deeply golden and crisp.",
            "Step 4: Finish. While hot, use a pizza cutter to chop into 1-inch squares. Heavily dust with powdered sugar and cinnamon. Serve immediately."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "snack"
            ],
            "cooking_methods": [
              "whisking",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.3,
            "earth": 0.3,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Moon"
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
            "calories": 380,
            "protein_g": 8,
            "carbs_g": 48,
            "fat_g": 18,
            "fiber_g": 1,
            "sodium_mg": 150,
            "sugar_g": 22,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "semolina custard",
              "substitute_options": [
                "savory spiced meat (for savory Bougatsa)",
                "feta cheese"
              ]
            }
          ]
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
          "recipe_name": "Authentic Greek Strapatsada",
          "description": "The quintessential Greek island summer breakfast. It is an alchemical emulsion of ripe, summer tomato water and eggs. The secret is to grate the tomatoes and boil them until their water is almost completely gone, concentrating the lycopene and sweetness before the eggs are added.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 10,
            "cook_time_minutes": 15,
            "base_serving_size": 2,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "large",
              "name": "vine-ripened tomatoes",
              "notes": "Grated on a box grater, skin discarded."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "Greek feta cheese",
              "notes": "Crumbled."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "dried oregano",
              "notes": "Rigani."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            }
          ],
          "instructions": [
            "Step 1: The Reduction. Place the grated tomato pulp and olive oil in a skillet over medium-high heat. Simmer for 10-12 minutes, stirring occasionally, until all the watery juice has evaporated and you are left with a thick, fragrant tomato jam.",
            "Step 2: The Eggs. Lower the heat to medium. Pour the beaten eggs into the tomato reduction.",
            "Step 3: The Scramble. Stir continuously for 2-3 minutes. You want the eggs to remain soft and custardy, infused with the red oil of the tomatoes.",
            "Step 4: The Cheese. Just before the eggs are fully set, stir in the crumbled feta and oregano. Cook for 30 more seconds so the cheese softens but doesn't melt completely.",
            "Step 5: Serve hot over toasted country bread with a final drizzle of raw olive oil."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "lunch",
              "vegetarian"
            ],
            "cooking_methods": [
              "simmering",
              "scrambling"
            ]
          },
          "elemental_properties": {
            "fire": 0.25,
            "water": 0.35,
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
              "Taurus"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 350,
            "protein_g": 18,
            "carbs_g": 12,
            "fat_g": 26,
            "fiber_g": 3,
            "sodium_mg": 520,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin C",
              "Vitamin A",
              "Lycopene"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "eggs",
              "substitute_options": [
                "tofu scramble (vegan)"
              ]
            }
          ]
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
          "recipe_name": "Authentic Greek Souvlaki (Pork Skewers)",
          "description": "The quintessential Greek street food. Success relies on selecting a cut of pork with sufficient intramuscular fat (neck or shoulder) and marinating it heavily in an acidic, herbaceous lemon-oregano bath to tenderize the meat before subjecting it to aggressive, high-heat charcoal grilling.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 120,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer",
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 800,
              "unit": "g",
              "name": "pork neck or shoulder (butt)",
              "notes": "Cut into uniform 1-inch cubes. Do not use lean pork tenderloin or loin; they will dry out."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "For the marinade."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "For the marinade. The acid tenderizes the meat."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced or pressed."
            },
            {
              "amount": 1.5,
              "unit": "tbsp",
              "name": "dried Greek oregano (rigani)",
              "notes": "Must be dried, not fresh."
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
              "amount": 8,
              "unit": "whole",
              "name": "wooden skewers",
              "notes": "Soaked in water for 30 minutes to prevent burning."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "Greek pita bread",
              "notes": "Thick and pocketless, grilled with olive oil."
            }
          ],
          "instructions": [
            "Step 1: The Marinade. In a large bowl, whisk together the olive oil, lemon juice, minced garlic, oregano, salt, and pepper.",
            "Step 2: Marinate the meat. Add the pork cubes to the bowl and toss thoroughly with your hands, massaging the liquid into the meat. Cover and refrigerate for at least 2 hours (up to 12 hours max; beyond that, the lemon juice turns the meat mushy).",
            "Step 3: Skewer. Thread the pork cubes tightly onto the soaked wooden skewers, leaving about an inch bare at the bottom for handling.",
            "Step 4: Heat the grill. Prepare a charcoal grill for high, direct heat (or use a heavy cast-iron grill pan).",
            "Step 5: Grill the Souvlaki. Place the skewers directly over the high heat. Grill for 10-12 minutes, turning every 2-3 minutes, until all sides are deeply browned, slightly charred on the edges, and the pork is cooked through.",
            "Step 6: Grill the pita. Lightly brush the pita breads with olive oil and grill them for 1 minute per side until warm and pliable.",
            "Step 7: Serve immediately. Traditionally served either on the stick with a squeeze of fresh lemon, or wrapped inside the grilled pita with tzatziki, tomatoes, red onions, and french fries."
          ],
          "classifications": {
            "meal_type": [
              "lunch",
              "dinner",
              "street food",
              "bbq"
            ],
            "cooking_methods": [
              "marinating",
              "grilling"
            ]
          },
          "elemental_properties": {
            "fire": 0.5,
            "water": 0.1,
            "earth": 0.2,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Aries",
              "Leo"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 35,
            "carbs_g": 28,
            "fat_g": 26,
            "fiber_g": 2,
            "sodium_mg": 650,
            "sugar_g": 3,
            "vitamins": [
              "Vitamin C",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pork neck",
              "substitute_options": [
                "chicken thighs (for Souvlaki Kotopoulo)",
                "lamb shoulder",
                "firm tofu chunks (vegan)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Horiatiki (Greek Village Salad)",
          "description": "The quintessential Greek summer salad. 'Horiatiki' means 'village style'. It is defined by what it lacks: there is absolutely no lettuce. It is a crude, rustic amalgamation of sun-ripened tomatoes, crisp cucumbers, and pungent onions, crowned with a massive, unbroken slab of feta and drowned in robust extra virgin olive oil.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 15,
            "cook_time_minutes": 0,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "large",
              "name": "vine-ripened tomatoes",
              "notes": "Core removed, cut into large, irregular wedges."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "cucumber",
              "notes": "Partially peeled (striped), cut into thick half-moons."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "red onion",
              "notes": "Very thinly sliced into rings."
            },
            {
              "amount": 1,
              "unit": "small",
              "name": "green bell pepper",
              "notes": "Cored and sliced into rings."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "Kalamata olives",
              "notes": "Whole, unpitted (traditional, prevents them from becoming mushy)."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "Greek feta cheese",
              "notes": "Served as one or two large rectangular slabs laid on top, NEVER crumbled."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dried Greek oregano (rigani)",
              "notes": "Must be dried on the branch, rubbed between palms to release oils."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality, robust. Poured generously over the top."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "A very light splash; the tomato juices provide the primary acid."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sea salt",
              "notes": "Added to the vegetables, but not the feta."
            }
          ],
          "instructions": [
            "Step 1: The Base. In a large, shallow bowl, combine the tomato wedges, cucumber half-moons, green pepper rings, and red onion rings.",
            "Step 2: Season the vegetables. Sprinkle the sea salt over the vegetables. Toss them gently with your hands. Let them sit for 5 minutes so the salt draws out the tomato juices, creating the 'zoumi' (the highly prized liquid at the bottom of the bowl).",
            "Step 3: Add olives. Scatter the whole Kalamata olives over the salad.",
            "Step 4: The Dressing. Drizzle the red wine vinegar over the vegetables.",
            "Step 5: The Crown. Place the large, unbroken slab(s) of feta cheese directly on top of the salad.",
            "Step 6: The Emulsion. Pour the extra virgin olive oil generously over everything, ensuring the feta is coated.",
            "Step 7: The Finish. Rub the dried oregano between your palms directly over the salad, letting it fall heavily on the feta and oil.",
            "Step 8: Serve immediately. Do not toss before serving. It must be served with thick slices of crusty country bread to mop up the oil and tomato juices (papara)."
          ],
          "classifications": {
            "meal_type": [
              "lunch",
              "salad",
              "appetizer",
              "vegetarian"
            ],
            "cooking_methods": [
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.5,
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
              "Taurus"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 320,
            "protein_g": 8,
            "carbs_g": 12,
            "fat_g": 28,
            "fiber_g": 4,
            "sodium_mg": 750,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin C",
              "Vitamin K"
            ],
            "minerals": [
              "Calcium",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "feta cheese",
              "substitute_options": [
                "firm tofu marinated in olive oil, lemon, and oregano (vegan)"
              ]
            },
            {
              "original_ingredient": "Kalamata olives",
              "substitute_options": [
                "Throubes (wrinkled black olives)",
                "green olives"
              ]
            }
          ]
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
            "fiber_g": 6,
              "sodium_mg": 269,
              "sugar_g": 10,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
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
            "fiber_g": 4,
              "sodium_mg": 363,
              "sugar_g": 13,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "recipe_name": "Authentic Greek Pastitsio",
          "description": "The majestic cousin of Moussaka. A highly architectural baked pasta dish featuring three distinct layers: a thick base of tubular pasta bound with egg and cheese, a fiercely spiced, cinnamon-heavy meat ragù, and a towering, cloud-like crown of nutmeg-scented béchamel sauce.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 45,
            "cook_time_minutes": 60,
            "base_serving_size": 8,
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
              "name": "Pastitsio pasta (Misko No. 2) or Ziti",
              "notes": "Long, thick, tubular pasta. Do not use penne if you want the authentic structural cut."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten. Used to bind the pasta layer."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "Kefalotyri or Parmesan cheese",
              "notes": "Grated. Divided across all layers."
            },
            {
              "amount": 750,
              "unit": "g",
              "name": "ground beef or lamb",
              "notes": "For the meat sauce."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely diced."
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
              "name": "dry red wine",
              "notes": "For deglazing."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "stick",
              "name": "cinnamon",
              "notes": "Essential."
            },
            {
              "amount": 0.25,
              "unit": "tsp",
              "name": "ground cloves",
              "notes": "Essential aromatic warmth."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "For the béchamel."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "all-purpose flour",
              "notes": "For the béchamel."
            },
            {
              "amount": 1,
              "unit": "liter",
              "name": "whole milk",
              "notes": "Warm, for the béchamel."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "egg yolks",
              "notes": "To enrich the béchamel."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "freshly grated nutmeg",
              "notes": "For the béchamel."
            }
          ],
          "instructions": [
            "Step 1: The Meat Sauce. Brown the meat, onions, and garlic in olive oil. Deglaze with red wine. Add tomatoes, cinnamon stick, cloves, salt, and pepper. Simmer for 45 minutes until very thick and dry. Remove cinnamon stick.",
            "Step 2: The Pasta. Boil the pasta in salted water until just al dente. Drain well. Return to the pot and quickly toss with 2 lightly beaten eggs, 1/3 cup of the grated cheese, and a knob of butter. This binds the base layer so it slices cleanly.",
            "Step 3: The Béchamel. Melt butter, whisk in flour, cook 2 mins. Slowly whisk in warm milk until thick. Remove from heat. Whisk in nutmeg, salt, 1/3 cup cheese, and rapidly whisk in the 2 egg yolks.",
            "Step 4: Assemble Layer 1. Preheat oven to 350°F (175°C). Butter a deep 9x13-inch baking dish. Lay the dressed pasta in the bottom, arranging the tubes so they all point in the same direction (for aesthetic slicing).",
            "Step 5: Assemble Layer 2. Spread the thick meat sauce evenly over the pasta.",
            "Step 6: Assemble Layer 3. Pour the thick béchamel over the meat, spreading it to the edges. Sprinkle the remaining 1/3 cup of cheese over the top.",
            "Step 7: Bake. Bake for 45-60 minutes until the top is puffed and deeply golden brown.",
            "Step 8: Rest. Crucial step. The Pastitsio MUST rest at room temperature for at least 45 minutes before slicing, or the layers will slide apart."
          ],
          "classifications": {
            "meal_type": [
              "dinner",
              "casserole"
            ],
            "cooking_methods": [
              "simmering",
              "boiling",
              "whisking",
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
              "Jupiter",
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
            "calories": 720,
            "protein_g": 38,
            "carbs_g": 58,
            "fat_g": 36,
            "fiber_g": 4,
            "sodium_mg": 820,
            "sugar_g": 9,
            "vitamins": [
              "Vitamin A",
              "Riboflavin"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "ground beef",
              "substitute_options": [
                "lentil and walnut ragù (vegetarian)"
              ]
            },
            {
              "original_ingredient": "Kefalotyri cheese",
              "substitute_options": [
                "Parmigiano-Reggiano",
                "Pecorino Romano"
              ]
            }
          ]
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
            "fiber_g": 1,
              "sodium_mg": 111,
              "sugar_g": 24,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
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
            "fiber_g": 12,
              "sodium_mg": 391,
              "sugar_g": 8,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "recipe_name": "Authentic Greek Youvetsi",
          "description": "A profound, slow-baked, one-pot Sunday staple. It involves braising bone-in meat (usually beef or lamb) in a spiced tomato sauce until meltingly tender, then adding kritharaki (orzo) directly into the boiling meat juices in the oven. The pasta absorbs all the fat and liquid, swelling into a dense, savory, almost risotto-like mass.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 20,
            "cook_time_minutes": 150,
            "base_serving_size": 6,
            "spice_level": "None",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "beef chuck or lamb shoulder",
              "notes": "Cut into large 2-inch chunks, bone-in preferred for depth of flavor."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "For searing the meat and sautéing aromatics."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely chopped."
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
              "name": "dry red wine",
              "notes": "For deglazing."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "Fresh or canned."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "For concentrated flavor."
            },
            {
              "amount": 1,
              "unit": "stick",
              "name": "cinnamon",
              "notes": "The defining aromatic profile of the dish."
            },
            {
              "amount": 3,
              "unit": "whole",
              "name": "allspice berries",
              "notes": "Or 1/4 tsp ground allspice."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "beef or vegetable broth",
              "notes": "Kept hot. Needed to cook the pasta."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "kritharaki (Greek orzo pasta)",
              "notes": "Toasted briefly in butter or oil before baking."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "Kefalotyri or Mizithra cheese",
              "notes": "Hard, salty sheep's milk cheese, grated heavily over the top."
            }
          ],
          "instructions": [
            "Step 1: Sear the meat. In a heavy oven-safe pot or Dutch oven, heat the olive oil over high heat. Brown the meat chunks aggressively on all sides. Remove meat and set aside.",
            "Step 2: Sauté Aromatics. Reduce heat to medium. Add the chopped onions to the fat and sauté until soft (5 mins). Add the garlic and tomato paste, cooking for 1 minute until the paste darkens.",
            "Step 3: Deglaze. Pour in the red wine and scrape up all the browned bits from the bottom. Let the alcohol boil off.",
            "Step 4: The Braise. Return the meat to the pot. Add the crushed tomatoes, cinnamon stick, allspice, salt, pepper, and 1 cup of the broth. Bring to a boil, cover, and reduce heat to low. Simmer on the stove for 1.5 to 2 hours until the meat is very tender.",
            "Step 5: Toast the pasta (Optional but recommended). In a separate dry skillet, toast the dry orzo for 2-3 minutes until slightly golden. This prevents it from turning to mush when baked.",
            "Step 6: Assemble for baking. Preheat oven to 375°F (190°C). Remove the pot from the stove. Pour the remaining 3 cups of hot broth into the pot with the meat. Stir in the toasted orzo.",
            "Step 7: The Bake. Place the uncovered pot into the oven. Bake for 25-30 minutes. Stir it gently exactly once halfway through to prevent the pasta from sticking to the bottom. It is done when the orzo is tender and has absorbed most of the liquid (it should still be slightly saucy, not completely dry).",
            "Step 8: The Finish. Remove from the oven and immediately cover it with a towel for 10 minutes. The pasta will continue to absorb liquid. Serve hot, buried under a mountain of grated Kefalotyri cheese."
          ],
          "classifications": {
            "meal_type": [
              "dinner",
              "casserole"
            ],
            "cooking_methods": [
              "searing",
              "braising",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.25,
            "earth": 0.45,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Jupiter",
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
            "calories": 680,
            "protein_g": 42,
            "carbs_g": 55,
            "fat_g": 32,
            "fiber_g": 5,
            "sodium_mg": 950,
            "sugar_g": 8,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Zinc",
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "beef chuck",
              "substitute_options": [
                "lamb shoulder",
                "whole chicken legs (requires less braising time)"
              ]
            },
            {
              "original_ingredient": "Kefalotyri cheese",
              "substitute_options": [
                "Pecorino Romano",
                "Parmigiano-Reggiano"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Greek Revithia (Chickpea Stew)",
          "description": "A humble, slow-cooked agrarian stew primarily consumed on the island of Sifnos. It relies on the prolonged baking of soaked chickpeas in a clay pot (skepastaria) with massive quantities of onions and olive oil, resulting in a sweet, starchy, golden emulsion.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 720,
            "cook_time_minutes": 240,
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
              "name": "dried chickpeas",
              "notes": "Must be dried. Soaked overnight with baking soda."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "baking soda",
              "notes": "Added to the soaking water to soften the skins."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "yellow onions",
              "notes": "Finely chopped. The volume of onions creates the sweet, thick base."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality. Do not reduce the amount; it emulsifies the stew."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "bay leaves",
              "notes": "Dried."
            },
            {
              "amount": 1,
              "unit": "tbsp",
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
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "Stirred in at the very end to cut the richness."
            }
          ],
          "instructions": [
            "Step 1: The Soak. Place the chickpeas in a large bowl. Dissolve the baking soda in cold water and cover the chickpeas by 3 inches. Soak for 12-24 hours. Drain and rub the chickpeas vigorously in a towel to remove as many loose skins as possible. Rinse thoroughly.",
            "Step 2: Preheat oven. Preheat oven to 300°F (150°C). Use a heavy Dutch oven or a traditional clay pot with a lid.",
            "Step 3: Assemble. Place the drained chickpeas, chopped onions, bay leaves, salt, and pepper into the pot.",
            "Step 4: The Liquids. Pour the olive oil over the chickpeas. Add enough cold water to just cover the chickpeas by about 1 inch.",
            "Step 5: Seal the pot. Cover the pot tightly with the lid. Traditionally, a flour-water paste is used to seal the lid to the pot to prevent any steam from escaping.",
            "Step 6: The Long Bake. Bake undisturbed for 4 to 5 hours. Check once at the 3-hour mark to ensure they haven't dried out (add boiling water if necessary).",
            "Step 7: The Finish. The stew is done when the chickpeas melt on your tongue and the liquid has reduced to a thick, golden, oily gravy. Remove from the oven.",
            "Step 8: Emulsify. Stir vigorously with a wooden spoon for 1 minute; this mashes some of the chickpeas and emulsifies the oil with the starches.",
            "Step 9: Add the lemon juice off the heat. Serve hot with rustic bread and olives."
          ],
          "classifications": {
            "meal_type": [
              "soup",
              "stew",
              "vegan",
              "dinner"
            ],
            "cooking_methods": [
              "soaking",
              "baking",
              "emulsifying"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.35,
            "earth": 0.45,
            "air": 0.05
          },
          "astrological_affinities": {
            "planets": [
              "Earth",
              "Saturn"
            ],
            "signs": [
              "Capricorn",
              "Taurus"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 14,
            "carbs_g": 45,
            "fat_g": 28,
            "fiber_g": 12,
            "sodium_mg": 550,
            "sugar_g": 6,
            "vitamins": [
              "Folate",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Manganese",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "dried chickpeas",
              "substitute_options": [
                "no direct substitute for this specific textural breakdown"
              ]
            },
            {
              "original_ingredient": "yellow onions",
              "substitute_options": [
                "white onions"
              ]
            }
          ]
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
          "recipe_name": "Authentic Keftedes (Greek Meatballs)",
          "description": "Crispy, intensely aromatic Greek meatballs. The alchemy lies in the heavy hydration of the meat with grated onions and soaked bread (panade), combined with an aggressive amount of fresh mint and oregano. They are pan-fried in olive oil to create a deeply crusted, rigid exterior that shatters to reveal a light, steaming interior.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 30,
            "cook_time_minutes": 20,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "ground beef or a mix of beef and pork",
              "notes": "At least 20% fat."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "red onion",
              "notes": "Grated on the large holes of a box grater. Retain all the juices."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 2,
              "unit": "slices",
              "name": "stale white bread",
              "notes": "Crusts removed, soaked in water and squeezed completely dry."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Lightly beaten."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh mint",
              "notes": "Finely chopped. The dominant flavor profile."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dried oregano",
              "notes": "Greek rigani."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "Tenderizes the meat."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "olive oil",
              "notes": "Added directly into the meat mixture for moisture."
            },
            {
              "amount": 1.5,
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
              "name": "all-purpose flour",
              "notes": "For dredging the meatballs before frying."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "olive oil or neutral oil",
              "notes": "For shallow frying."
            }
          ],
          "instructions": [
            "Step 1: The Mix. In a large bowl, combine the ground meat, grated onion (with its juices), squeezed-dry bread, egg, mint, parsley, oregano, vinegar, 2 tbsp olive oil, salt, and pepper.",
            "Step 2: The Knead. Use your hands to knead the mixture vigorously for 3-5 minutes. The mixture should become sticky and pale. This develops the myosin proteins, ensuring the meatballs hold together without being dense.",
            "Step 3: The Rest. Cover the bowl and refrigerate for at least 1 hour. This hydrates the bread and allows the mint and onion flavors to permeate the fat.",
            "Step 4: Form. Scoop out about 1.5 tablespoons of the mixture and roll it into a smooth ball. Slightly flatten it into a thick medallion.",
            "Step 5: Dredge. Place the flour on a plate. Roll each meatball in the flour to coat completely, then gently shake off the excess. This flour barrier creates the crispy crust.",
            "Step 6: Heat oil. Heat 1/2 inch of oil in a large, heavy skillet over medium-high heat. The oil is ready when a pinch of flour sizzles instantly.",
            "Step 7: Fry. Carefully place the meatballs in the hot oil. Do not crowd the pan. Fry for 3-4 minutes per side until deeply browned and crusty.",
            "Step 8: Drain. Remove to a paper towel-lined plate to drain. Serve hot or at room temperature with tzatziki and pita."
          ],
          "classifications": {
            "meal_type": [
              "appetizer",
              "meze",
              "dinner"
            ],
            "cooking_methods": [
              "kneading",
              "shallow-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.2,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Venus"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 450,
            "protein_g": 24,
            "carbs_g": 18,
            "fat_g": 32,
            "fiber_g": 2,
            "sodium_mg": 680,
            "sugar_g": 2,
            "vitamins": [
              "Vitamin B12",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "ground beef",
              "substitute_options": [
                "ground lamb",
                "lentil and mushroom mix (vegan)"
              ]
            },
            {
              "original_ingredient": "stale bread",
              "substitute_options": [
                "panko breadcrumbs",
                "gluten-free bread"
              ]
            }
          ]
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
          "recipe_name": "Authentic Greek Skordalia",
          "description": "A fiercely pungent, elemental Greek garlic dip. It relies on the mechanical emulsification of raw garlic, starches (either potatoes or stale bread), and high-quality olive oil. The result is a dense, creamy, heavily aerated paste that bites aggressively and is traditionally served alongside fried salt cod (Bakalarios) or boiled beets.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 15,
            "cook_time_minutes": 25,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "Russet or Yukon Gold potatoes",
              "notes": "Peeled and cut into chunks. Must be a starchy potato, not waxy."
            },
            {
              "amount": 6,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Peeled. Adjust down to 4 if you prefer less intense heat."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Must be very high quality, as it is the primary flavor carrier."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "white wine vinegar or fresh lemon juice",
              "notes": "Vinegar is more traditional in some regions, lemon in others."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "almonds or walnuts",
              "notes": "Finely crushed. Optional, but adds textural complexity and helps stabilize the emulsion."
            }
          ],
          "instructions": [
            "Step 1: Boil potatoes. Boil the potato chunks in salted water until completely fork-tender (about 20 mins). Drain well and return them to the hot, empty pot for 1 minute to evaporate excess moisture. They must be dry to emulsify properly.",
            "Step 2: The Garlic Paste. While the potatoes cook, place the raw garlic cloves and the 1 tsp of salt in a mortar and pestle. Pound violently until it becomes a completely smooth, sticky, translucent paste.",
            "Step 3: Mash the potatoes. Transfer the hot, dry potatoes to a large bowl. Mash them thoroughly until completely smooth. Do NOT use a blender or food processor for the potatoes, or they will turn into glue.",
            "Step 4: Combine base. Stir the garlic paste (and crushed nuts, if using) into the hot mashed potatoes.",
            "Step 5: The Emulsion (Crucial). While stirring the potato mixture continuously and vigorously with a wooden spoon or whisk, slowly drizzle in the olive oil in a thin, steady stream. The starch will absorb the oil.",
            "Step 6: The Acid. Alternate drizzling the oil with splashes of the vinegar/lemon juice until the mixture becomes pale, light, and almost fluffy.",
            "Step 7: Serve at room temperature or slightly chilled, heavily drizzled with more olive oil."
          ],
          "classifications": {
            "meal_type": [
              "appetizer",
              "meze",
              "dip",
              "vegan"
            ],
            "cooking_methods": [
              "boiling",
              "mashing",
              "emulsifying"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.1,
            "earth": 0.35,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Earth"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 380,
            "protein_g": 3,
            "carbs_g": 25,
            "fat_g": 32,
            "fiber_g": 3,
            "sodium_mg": 450,
            "sugar_g": 2,
            "vitamins": [
              "Vitamin C",
              "Vitamin B6"
            ],
            "minerals": [
              "Potassium",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "potatoes",
              "substitute_options": [
                "3 thick slices of stale country bread (crusts removed, soaked in water, and squeezed dry)"
              ]
            },
            {
              "original_ingredient": "white wine vinegar",
              "substitute_options": [
                "red wine vinegar",
                "fresh lemon juice"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Melitzanosalata (Greek Eggplant Dip)",
          "description": "A rustic, elemental dip. Unlike the smooth, tahini-heavy Baba Ganoush of the Levant, Greek Melitzanosalata is coarse, chunky, and relies entirely on the aggressive char of the eggplant skin to infuse the flesh with smoke. It is heavily acidulated with vinegar or lemon and bound with raw garlic and olive oil.",
          "details": {
            "cuisine": "Greek",
            "prep_time_minutes": 15,
            "cook_time_minutes": 45,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "large",
              "name": "globe eggplants (aubergines)",
              "notes": "Must be firm and shiny."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Finely minced or mashed into a paste."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality, robust."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "Traditional, provides a sharper bite than lemon juice."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "red onion",
              "notes": "Very finely minced."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh flat-leaf parsley",
              "notes": "Finely chopped."
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
              "amount": 2,
              "unit": "tbsp",
              "name": "walnuts",
              "notes": "Finely crushed. Optional, but adds textural contrast."
            }
          ],
          "instructions": [
            "Step 1: Char the eggplants. Prick the eggplants a few times with a fork. Roast them directly over an open gas flame, turning with tongs until the skin is completely blackened, blistered, and the flesh has collapsed (about 15-20 minutes). Alternatively, broil them in the oven, turning occasionally.",
            "Step 2: Steam and cool. Place the charred eggplants in a bowl and cover tightly with plastic wrap for 10 minutes. The trapped steam will loosen the skin.",
            "Step 3: Extract the flesh. Carefully peel away and discard the blackened skin. Remove the stem. Do not rinse the flesh, or you will lose the smoky flavor.",
            "Step 4: Drain. Place the naked eggplant flesh in a fine-mesh sieve over a bowl. Let it drain for 15 minutes to remove excess bitter liquid.",
            "Step 5: The Mash. Transfer the drained flesh to a mixing bowl. Use a fork to roughly mash it. Do not use a food processor; the texture must be chunky and fibrous.",
            "Step 6: Build the dip. Stir the minced garlic, red onion, parsley, salt, and pepper into the mashed eggplant.",
            "Step 7: The Emulsion. While stirring constantly, slowly drizzle in the red wine vinegar, followed by the olive oil. The mixture will slightly emulsify but remain rustic.",
            "Step 8: Rest. Cover and refrigerate for at least 1 hour before serving to allow the raw garlic and onion to mellow and the flavors to meld. Garnish with crushed walnuts and a drizzle of olive oil."
          ],
          "classifications": {
            "meal_type": [
              "appetizer",
              "meze",
              "vegan",
              "dip"
            ],
            "cooking_methods": [
              "charring",
              "mashing"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.2,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Pluto",
              "Mars"
            ],
            "signs": [
              "Scorpio",
              "Aries"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 180,
            "protein_g": 2,
            "carbs_g": 12,
            "fat_g": 15,
            "fiber_g": 5,
            "sodium_mg": 320,
            "sugar_g": 4,
            "vitamins": [
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Manganese",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "red wine vinegar",
              "substitute_options": [
                "fresh lemon juice"
              ]
            },
            {
              "original_ingredient": "walnuts",
              "substitute_options": [
                "pine nuts",
                "omit entirely"
              ]
            }
          ]
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
