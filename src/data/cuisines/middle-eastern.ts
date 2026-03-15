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
          "name": "Authentic Shakshuka",
          "description": "A deeply aromatic, traditional Middle Eastern and North African dish featuring eggs gently poached in a rich, spiced tomato and pepper stew. Historically rooted in Mediterranean agrarian traditions, it balances the fiery energy of warming spices with the grounding comfort of a savory, simmering sauce.",
          "details": {
            "cuisine": "Middle Eastern",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 25,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
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
            "mealType": [
              "breakfast",
              "brunch",
              "dinner"
            ],
            "cookingMethods": [
              "sautéing",
              "simmering",
              "poaching"
            ]
          },
          "elementalProperties": {
            "Fire": 0.45,
            "Water": 0.25,
            "Earth": 0.2,
            "Air": 0.1
          },
          "astrologicalAffinities": {
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
            "lunarPhases": [
              "Waxing Gibbous",
              "Waning Gibbous",
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 12,
            "carbsG": 35,
            "fatG": 15,
            "fiberG": 6,
              "sodiumMg": 381,
              "sugarG": 9,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "silken tofu chunks (vegan)",
                "soft-boiled quail eggs",
                "chickpea scramble"
              ]
            },
            {
              "originalIngredient": "red bell peppers",
              "substituteOptions": [
                "roasted red peppers (jarred)",
                "green bell peppers",
                "poblano peppers"
              ]
            },
            {
              "originalIngredient": "harissa paste",
              "substituteOptions": [
                "chili garlic sauce",
                "sriracha",
                "pinch of cayenne pepper"
              ]
            },
            {
              "originalIngredient": "pita bread",
              "substituteOptions": [
                "crusty sourdough",
                "challah bread",
                "gluten-free flatbread"
              ]
            }
          ]
        },
        {
          name: "Ful Medames",
          description: "The ancient, structural foundation of the Middle Eastern morning. Fava beans stewed to the brink of collapse, fiercely heavily dressed in raw olive oil, sharp lemon, and pungent cumin.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":10,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"cans","name":"Fava beans (Ful)","notes":"With their liquid."},{"amount":3,"unit":"cloves","name":"Garlic","notes":"Crushed to a paste with salt."},{"amount":1,"unit":"tbsp","name":"Ground cumin","notes":"Essential aromatic."},{"amount":2,"unit":"whole","name":"Lemons","notes":"Juiced."},{"amount":0.5,"unit":"cup","name":"Extra virgin olive oil","notes":"Highest quality."},{"amount":1,"unit":"cup","name":"Tomatoes, cucumbers, onions","notes":"Finely diced, for topping."}],
          instructions: ["Step 1: The Breakdown. Place the fava beans and their liquid into a saucepan over medium heat. Simmer aggressively. As they heat, mash about half of the beans against the side of the pot with a heavy spoon to thicken the liquid into a dense, starchy gravy.","Step 2: The Aromatic Infusion. In a mortar and pestle, obliterate the garlic cloves with coarse salt and the ground cumin into a wet paste.","Step 3: The Acid and Heat. Remove the bubbling beans from the heat. Instantly stir in the garlic-cumin paste and the massive volume of fresh lemon juice. The heat will bloom the garlic without making it bitter.","Step 4: The Fat. Transfer to a wide, shallow serving bowl. Pour the extra virgin olive oil over the surface until it forms a thick, golden slick.","Step 5: The Garnish. Top generously with chopped parsley, diced tomatoes, and onions. Consume immediately using fresh, warm pita bread as a scoop."],
          classifications: {"mealType":["breakfast","lunch"],"cookingMethods":["stewing","mashing"]},
          elementalProperties: {"Fire":0.15,"Water":0.2,"Earth":0.55,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Sun"],"signs":["capricorn","taurus"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":350,"proteinG":14,"carbsG":38,"fatG":18,"fiberG":12,"sodiumMg":600,"sugarG":3,"vitamins":["Folate","Vitamin C"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"Fava beans","substituteOptions":["Chickpeas (for Balila)"]}]
        },
        {
          name: "Manakish Za'atar",
          description: "The quintessential Levantine flatbread. A heavily dimpled, yeasted dough acts as a canvas for an aggressive, oil-soaked paste of wild thyme, sumac, and sesame seeds, baked rapidly under intense heat.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":90,"cookTimeMinutes":10,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":3,"unit":"cups","name":"Bread flour","notes":"For structural integrity."},{"amount":1,"unit":"tbsp","name":"Active dry yeast","notes":"For aeration."},{"amount":1,"unit":"cup","name":"Warm water","notes":"Hydration."},{"amount":0.5,"unit":"cup","name":"Za'atar blend","notes":"Wild thyme, sumac, toasted sesame seeds."},{"amount":0.5,"unit":"cup","name":"Extra virgin olive oil","notes":"To bind the za'atar into a paste."}],
          instructions: ["Step 1: The Dough. Combine the flour, yeast, salt, and water. Knead aggressively for 10 minutes until the dough is violently elastic and smooth. Let it ferment and rise for 1 hour until doubled.","Step 2: The Paste. In a small bowl, mix the dry za'atar blend with the olive oil until it forms a thick, dark green sludge. It should be easily spreadable but not watery.","Step 3: The Canvas. Punch down the dough and divide it into balls. Roll each out into flat, round discs. Crucially, use your fingertips to press deep dimples all over the surface of the dough; this prevents it from puffing like a pita and traps pools of the oil.","Step 4: The Plastering. Spread a generous layer of the za'atar paste over the dimpled dough, taking it almost to the very edges.","Step 5: The Bake. Bake on a blazing hot pizza stone or inverted baking sheet at 500°F (260°C) for 6-8 minutes, until the bottom is charred and the top is bubbling and fragrant. Serve immediately."],
          classifications: {"mealType":["breakfast","snack"],"cookingMethods":["baking","kneading"]},
          elementalProperties: {"Fire":0.35,"Water":0.05,"Earth":0.45,"Air":0.15},
          astrologicalAffinities: {"planets":["Venus","Earth"],"signs":["taurus","virgo"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":480,"proteinG":10,"carbsG":65,"fatG":22,"fiberG":4,"sodiumMg":450,"sugarG":2,"vitamins":["Vitamin E","Thiamin"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Za'atar blend","substituteOptions":["Akkawi cheese (for Manakish Jebne)"]}]
        },
        {
          name: "Labneh with Za'atar",
          description: "A profound alchemical execution of Labneh with Za'atar, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Labneh with Za'atar","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Labneh with Za'atar","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Mansaf",
          description: "The majestic national dish of Jordan. An exercise in scale and distinct layers: a massive platter of saffron-stained rice covering thin shrak bread, crowned with massive chunks of slow-cooked lamb, all drenched continuously in a violently tangy, fermented dried yogurt sauce (Jameed).",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":30,"cookTimeMinutes":180,"baseServingSize":8,"spiceLevel":"None","season":["celebration"]},
          ingredients: [{"amount":1,"unit":"ball","name":"Jameed","notes":"Hard, dried, fermented goat's milk yogurt. The undisputed soul of the dish."},{"amount":3,"unit":"lbs","name":"Bone-in lamb shoulder","notes":"Cut into large, primal pieces."},{"amount":3,"unit":"cups","name":"Short-grain rice","notes":"Washed to remove excess starch."},{"amount":2,"unit":"loaves","name":"Shrak or Markook bread","notes":"Paper-thin flatbread."},{"amount":0.5,"unit":"cup","name":"Pine nuts and slivered almonds","notes":"Fried in ghee until golden."},{"amount":1,"unit":"tsp","name":"Hawaij or Arabic spice blend","notes":"For the lamb."},{"amount":0.25,"unit":"tsp","name":"Turmeric or saffron","notes":"For coloring the rice."}],
          instructions: ["Step 1: The Jameed Hydration. Take the rock-hard ball of jameed, smash it into chunks, and soak it in warm water for hours. Transfer to a blender and process into a completely smooth, fiercely tangy, white liquid.","Step 2: The Lamb. Boil the lamb pieces aggressively for 10 minutes, skimming all scum. Discard the water. Return the lamb to the pot, cover with fresh water, add onions and spices, and simmer for 2 hours until tender.","Step 3: The Fusion. Pour the liquid jameed into the pot with the lamb and its broth. It is critical to stir continuously in one direction until the mixture boils, otherwise the yogurt will instantly curdle and separate. Simmer together for 30 minutes so the meat absorbs the sharp acidity.","Step 4: The Rice. Cook the short-grain rice with ghee and turmeric until vibrant yellow and fluffy.","Step 5: The Architecture. On a massive communal platter, lay down the thin shrak bread. Soak the bread heavily with the hot jameed sauce. Pile the yellow rice into a mountain. Arrange the massive pieces of lamb on top. Garnish with the ghee-fried nuts and parsley. Serve with extra sauce to pour continuously while eating."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["boiling","simmering","layering"]},
          elementalProperties: {"Fire":0.2,"Water":0.35,"Earth":0.4,"Air":0.05},
          astrologicalAffinities: {"planets":["Jupiter","Sun"],"signs":["sagittarius","leo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":850,"proteinG":48,"carbsG":65,"fatG":42,"fiberG":3,"sodiumMg":1400,"sugarG":5,"vitamins":["Vitamin B12","Riboflavin"],"minerals":["Zinc","Calcium"]},
          substitutions: [{"originalIngredient":"Jameed","substituteOptions":["Greek yogurt mixed with liquid kashk or buttermilk"]}]
        },
        {
          name: "Fattoush",
          description: "A profound alchemical execution of Fattoush, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Fattoush","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Fattoush","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    dinner: {
      winter: [
        {
          name: "Moussaka",
          description: "The Levantine/Arabic Moussaka (Maghmour) is distinct from the Greek version: it is a robust, room-temperature, vegan stew where thick slabs of fried eggplant and chickpeas are suspended in an intensely rich, heavily spiced tomato-garlic matrix.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":20,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"Mild","season":["summer","autumn"]},
          ingredients: [{"amount":2,"unit":"large","name":"Eggplants","notes":"Peeled in stripes, sliced into thick rounds."},{"amount":1,"unit":"can","name":"Chickpeas","notes":"Drained."},{"amount":2,"unit":"cups","name":"Crushed tomatoes","notes":"Or fresh, ripe tomatoes, diced."},{"amount":1,"unit":"large","name":"Onion","notes":"Sliced into half-moons."},{"amount":8,"unit":"cloves","name":"Garlic","notes":"Left whole or halved."},{"amount":1,"unit":"tbsp","name":"Dried mint","notes":"Essential aromatic."},{"amount":0.5,"unit":"cup","name":"Olive oil","notes":"For frying and the base."}],
          instructions: ["Step 1: The Eggplant Preparation. Salt the thick eggplant slices aggressively and let them sit for 30 minutes to draw out bitter moisture and collapse their spongy cellular structure. Pat them completely dry.","Step 2: The Fry. Deep fry or heavily pan-fry the eggplant slices in hot oil until they are deeply browned and entirely soft throughout. Drain on paper towels.","Step 3: The Base. In a wide, heavy pot, heat olive oil. Add the sliced onions and the massive amount of whole garlic cloves. Sauté until deeply caramelized and sweet.","Step 4: The Matrix. Add the crushed tomatoes, chickpeas, dried mint, and salt to the onions. Bring to a rolling simmer.","Step 5: The Integration. Submerge the fried eggplant slices into the tomato matrix. Cover the pot and simmer on very low heat for 30-40 minutes until the oil separates and floats to the top, signaling the sauce has broken and thickened. Serve cold or at room temperature with pita."],
          classifications: {"mealType":["lunch","appetizer","dinner"],"cookingMethods":["frying","stewing"]},
          elementalProperties: {"Fire":0.25,"Water":0.35,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Venus","Pluto"],"signs":["taurus","scorpio"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":380,"proteinG":8,"carbsG":32,"fatG":26,"fiberG":12,"sodiumMg":650,"sugarG":10,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Potassium","Manganese"]},
          substitutions: [{"originalIngredient":"Dried mint","substituteOptions":["Fresh mint","Oregano"]}]
        },
        {
          name: "Kuzi",
          description: "A profound alchemical execution of Kuzi, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Kuzi","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Kuzi","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      summer: [
        {
          name: "Mixed Grill Platter",
          description: "A profound alchemical execution of Mixed Grill Platter, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Mixed Grill Platter","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Mixed Grill Platter","substituteOptions":["Elemental equivalent"]}]
        },
        {
          "name": "Authentic Mujaddara",
          "description": "An ancient, profoundly comforting Levantine staple.",
          "details": {
            "cuisine": "Middle Eastern",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "None",
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
            "mealType": [
              "dinner"
            ],
            "cookingMethods": [
              "simmering",
              "frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.1,
            "Earth": 0.6,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn"
            ],
            "signs": [
              "Capricorn"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 16,
            "carbsG": 65,
            "fatG": 18,
            "fiberG": 12,
              "sodiumMg": 246,
              "sugarG": 12,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "rice",
              "substituteOptions": [
                "bulgur wheat"
              ]
            }
          ]
        },
      ],
      all: [
        {
          name: "Shawarma",
          description: "A profound alchemical execution of Shawarma, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Shawarma","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Shawarma","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Baklava",
          description: "A profound alchemical execution of Baklava, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Baklava","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Baklava","substituteOptions":["Elemental equivalent"]}]
        },

        {
          "name": "Authentic Levantine Falafel",
          "description": "A triumph of plant-based culinary geometry.",
          "details": {
            "cuisine": "Middle Eastern",
            "prepTimeMinutes": 1440,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "Mild",
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
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.1,
            "Earth": 0.4,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Earth"
            ],
            "signs": [
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 12,
            "carbsG": 35,
            "fatG": 22,
            "fiberG": 9,
              "sodiumMg": 419,
              "sugarG": 2,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },

        {
          name: "Umm Ali",
          description: "A profound alchemical execution of Umm Ali, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Umm Ali","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Umm Ali","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Knafeh",
          description: "A profound alchemical execution of Knafeh, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Knafeh","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Knafeh","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Kofta Kebab",
          description: "A profound alchemical execution of Kofta Kebab, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Kofta Kebab","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Kofta Kebab","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Chicken Makloubeh",
          description: "A profound alchemical execution of Chicken Makloubeh, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Chicken Makloubeh","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Chicken Makloubeh","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Tabbouleh",
          description: "A profound alchemical execution of Tabbouleh, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Tabbouleh","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Tabbouleh","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Kibbeh",
          description: "The ultimate expression of Levantine meat-working. A shell of extremely lean, twice-ground beef and fine bulgur wheat forms an architectural dome around a deeply spiced filling of fatty lamb, pine nuts, and allspice.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":90,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Lean beef or lamb","notes":"Completely devoid of fat and sinew for the outer shell."},{"amount":1,"unit":"cup","name":"Fine bulgur wheat","notes":"Soaked until tender."},{"amount":0.5,"unit":"lb","name":"Ground lamb","notes":"Fatty, for the internal filling."},{"amount":0.25,"unit":"cup","name":"Pine nuts","notes":"Toasted."},{"amount":1,"unit":"tbsp","name":"Seven Spice (Baharat)","notes":"Essential aromatic."},{"amount":4,"unit":"cups","name":"Frying oil","notes":"Neutral oil for deep frying."}],
          instructions: ["Step 1: The Filling. Sauté the fatty ground lamb with diced onions, pine nuts, and Seven Spice until browned and deeply fragrant. Let it cool completely; it cannot be stuffed while hot.","Step 2: The Shell Matrix. In a food processor, combine the ultra-lean meat, soaked bulgur, grated onion, and salt. Process continuously until it forms a perfectly smooth, sticky, dough-like emulsion.","Step 3: The Architecture. Wet your hands with ice water. Take a ping-pong sized ball of the shell matrix. Hollow it out with your index finger, rotating it to form a thin, torpedo-shaped cup.","Step 4: The Stuffing. Fill the cup with the cooled lamb mixture. Pinch the top closed, ensuring absolute structural integrity so it does not rupture during frying. Form points at both ends.","Step 5: The Fry. Deep fry at 350°F (175°C) until the exterior is deeply browned and formidably crisp, roughly 5-7 minutes. Serve hot with yogurt or labneh."],
          classifications: {"mealType":["appetizer","dinner"],"cookingMethods":["grinding","deep-frying","stuffing"]},
          elementalProperties: {"Fire":0.4,"Water":0.1,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Mars"],"signs":["capricorn","aries"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":550,"proteinG":35,"carbsG":32,"fatG":28,"fiberG":6,"sodiumMg":750,"sugarG":2,"vitamins":["Iron","Niacin"],"minerals":["Zinc","Phosphorus"]},
          substitutions: [{"originalIngredient":"Lean beef","substituteOptions":["Potato and pumpkin (for vegan Kibbeh)"]}]
        },

        {
          name: "Basbousa",
          description: "A structurally dense, coarse-crumbed semolina cake, heavily saturated in cold floral syrup immediately upon exiting the oven, forcing it into a state of crystalline sweetness.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":15,"cookTimeMinutes":35,"baseServingSize":8,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Semolina flour","notes":"Coarse ground is mandatory for texture."},{"amount":1,"unit":"cup","name":"Desiccated coconut","notes":"Unsweetened."},{"amount":0.5,"unit":"cup","name":"Ghee or melted butter","notes":"For richness."},{"amount":1,"unit":"cup","name":"Plain yogurt","notes":"To hydrate the semolina."},{"amount":0.5,"unit":"cup","name":"Almonds","notes":"Blanched, for studding the top."},{"amount":1.5,"unit":"cups","name":"Sugar syrup","notes":"Flavored with rose or orange blossom water."}],
          instructions: ["Step 1: The Syrup. Boil sugar, water, and lemon juice until slightly thickened. Stir in rose water and let it cool completely. Cold syrup on hot cake is the immutable law of this dessert.","Step 2: The Batter. In a large bowl, use your fingers to rub the melted ghee violently into the coarse semolina until every grain is coated. Gently mix in the coconut, yogurt, and a pinch of baking powder until a thick batter forms.","Step 3: The Pan. Press the batter evenly into a heavily greased baking pan. Score the surface into diamonds. Press a blanched almond into the center of each diamond.","Step 4: The Bake. Bake at 375°F (190°C) for 30-35 minutes until the top is deeply golden brown.","Step 5: The Saturation. Remove the cake from the oven. Immediately pour the cold syrup entirely over the bubbling hot cake. It will hiss and absorb instantly. Let it sit for at least 2 hours to fully hydrate before slicing."],
          classifications: {"mealType":["dessert"],"cookingMethods":["baking","saturating"]},
          elementalProperties: {"Fire":0.2,"Water":0.35,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Venus","Moon"],"signs":["taurus","cancer"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":6,"carbsG":65,"fatG":18,"fiberG":3,"sodiumMg":180,"sugarG":45,"vitamins":["Riboflavin"],"minerals":["Calcium","Iron"]},
          substitutions: [{"originalIngredient":"Ghee","substituteOptions":["Coconut oil"]}]
        },
          {
            "name": "Authentic Hummus bi Tahini",
            "description": "The alchemical emulsion of earth and fat. Dried chickpeas are cooked until they structurally collapse, then processed with massive amounts of raw tahini and ice-cold water to create a stable, aerated, and perfectly smooth matrix.",
            "details": {
              "cuisine": "Middle Eastern (Levantine)",
              "prepTimeMinutes": 720,
              "cookTimeMinutes": 120,
              "baseServingSize": 6,
              "spiceLevel": "None",
              "season": [
                "all"
              ]
            },
            "ingredients": [
              {
                "amount": 2,
                "unit": "cups",
                "name": "Dried chickpeas",
                "notes": "Soaked with baking soda."
              },
              {
                "amount": 1,
                "unit": "cup",
                "name": "Tahini",
                "notes": "Highest quality."
              }
            ],
            "instructions": [
              "Step 1: Boil chickpeas until they can be crushed between two fingers.",
              "Step 2: Process warm chickpeas into a thick paste.",
              "Step 3: Add tahini, lemon, and garlic; process for 5 minutes.",
              "Step 4: Drizzle in ice water to aerate and whiten the mixture.",
              "Step 5: Serve with a lake of olive oil and whole chickpeas."
            ],
            "classifications": {
              "mealType": [
                "appetizer",
                "vegan"
              ],
              "cookingMethods": [
                "simmering",
                "emulsifying"
              ]
            },
            "elementalProperties": {
              "Fire": 0.1,
              "Water": 0.3,
              "Earth": 0.5,
              "Air": 0.1
            },
            "astrologicalAffinities": {
              "planets": [
                "Saturn",
                "Venus"
              ],
              "signs": [
                "capricorn",
                "taurus"
              ],
              "lunarPhases": [
                "Waning Gibbous"
              ]
            },
            "nutritionPerServing": {
              "calories": 320,
              "proteinG": 14,
              "carbsG": 28,
              "fatG": 22,
              "fiberG": 10,
              "sodiumMg": 450,
              "sugarG": 2,
              "vitamins": [
                "Folate",
                "Vitamin B6"
              ],
              "minerals": [
                "Iron",
                "Magnesium"
              ]
            },
            "substitutions": []
          },
          {
            "name": "Authentic Falafel",
            "description": "A structural triumph of legumes. Raw, soaked chickpeas are ground into a coarse green matrix with massive amounts of herbs, then flash-fried into spheres that are shatteringly crisp on the outside and steamy-soft inside.",
            "details": {
              "cuisine": "Middle Eastern (Levantine)",
              "prepTimeMinutes": 720,
              "cookTimeMinutes": 10,
              "baseServingSize": 4,
              "spiceLevel": "Mild",
              "season": [
                "all"
              ]
            },
            "ingredients": [
              {
                "amount": 2,
                "unit": "cups",
                "name": "Dried chickpeas",
                "notes": "Soaked but never cooked."
              },
              {
                "amount": 1,
                "unit": "bunch",
                "name": "Parsley and Cilantro",
                "notes": "For the green core."
              }
            ],
            "instructions": [
              "Step 1: Grind soaked raw chickpeas coarsely with aromatics.",
              "Step 2: Mix in spices and a pinch of baking soda.",
              "Step 3: Rest the mixture for 30 minutes to stabilize.",
              "Step 4: Form into small spheres using a falafel mold.",
              "Step 5: Deep fry at 350°F until dark brown and crispy."
            ],
            "classifications": {
              "mealType": [
                "lunch",
                "snack",
                "vegan"
              ],
              "cookingMethods": [
                "grinding",
                "deep-frying"
              ]
            },
            "elementalProperties": {
              "Fire": 0.45,
              "Water": 0.1,
              "Earth": 0.35,
              "Air": 0.1
            },
            "astrologicalAffinities": {
              "planets": [
                "Mars",
                "Saturn"
              ],
              "signs": [
                "aries",
                "capricorn"
              ],
              "lunarPhases": [
                "First Quarter"
              ]
            },
            "nutritionPerServing": {
              "calories": 380,
              "proteinG": 18,
              "carbsG": 45,
              "fatG": 16,
              "fiberG": 12,
              "sodiumMg": 650,
              "sugarG": 3,
              "vitamins": [
                "Folate",
                "Vitamin K"
              ],
              "minerals": [
                "Iron",
                "Magnesium"
              ]
            },
            "substitutions": []
          },
          {
            "name": "Authentic Shakshuka",
            "description": "A study in tomato reduction and protein poaching. A thick, spicy tomato and red pepper matrix (matbucha style) serves as a poaching liquid for whole eggs, which are cooked until the whites are set and the yolks are liquid gold.",
            "details": {
              "cuisine": "Middle Eastern (North African)",
              "prepTimeMinutes": 10,
              "cookTimeMinutes": 30,
              "baseServingSize": 2,
              "spiceLevel": "High",
              "season": [
                "all"
              ]
            },
            "ingredients": [
              {
                "amount": 4,
                "unit": "large",
                "name": "Eggs",
                "notes": "Freshest possible."
              },
              {
                "amount": 2,
                "unit": "cups",
                "name": "Tomato-pepper sauce",
                "notes": "Simmered until thick."
              }
            ],
            "instructions": [
              "Step 1: Sauté peppers, onions, and garlic until soft.",
              "Step 2: Add tomatoes and spices; simmer until zero water remains.",
              "Step 3: Make wells in the thick sauce; crack eggs into them.",
              "Step 4: Cover and cook on low heat until whites are just opaque.",
              "Step 5: Serve in the pan with massive amounts of challah bread."
            ],
            "classifications": {
              "mealType": [
                "breakfast",
                "brunch"
              ],
              "cookingMethods": [
                "simmering",
                "poaching"
              ]
            },
            "elementalProperties": {
              "Fire": 0.4,
              "Water": 0.25,
              "Earth": 0.25,
              "Air": 0.1
            },
            "astrologicalAffinities": {
              "planets": [
                "Mars",
                "Sun"
              ],
              "signs": [
                "aries",
                "leo"
              ],
              "lunarPhases": [
                "Full Moon"
              ]
            },
            "nutritionPerServing": {
              "calories": 350,
              "proteinG": 22,
              "carbsG": 18,
              "fatG": 22,
              "fiberG": 4,
              "sodiumMg": 850,
              "sugarG": 10,
              "vitamins": [
                "Vitamin A",
                "Vitamin C"
              ],
              "minerals": [
                "Iron",
                "Selenium"
              ]
            },
            "substitutions": []
          },
          {
            "name": "Authentic Mujadara",
            "description": "The 'peasant's comfort'. A perfectly calibrated structural mix of lentils and rice, flavored with the deep, sweet-bitter essence of massive amounts of onions caramelized to the point of blackness.",
            "details": {
              "cuisine": "Middle Eastern (Levantine)",
              "prepTimeMinutes": 10,
              "cookTimeMinutes": 45,
              "baseServingSize": 4,
              "spiceLevel": "None",
              "season": [
                "all"
              ]
            },
            "ingredients": [
              {
                "amount": 1,
                "unit": "cup",
                "name": "Green or brown lentils",
                "notes": "Maintain shape."
              },
              {
                "amount": 4,
                "unit": "large",
                "name": "Onions",
                "notes": "Sliced into thin rings."
              }
            ],
            "instructions": [
              "Step 1: Sauté onions in a lake of oil until dark brown/black.",
              "Step 2: Boil lentils until 80% cooked.",
              "Step 3: Add rice and half the onions to the lentils; simmer.",
              "Step 4: Cover and let steam until all liquid is gone.",
              "Step 5: Top with the remaining crispy black onions and yogurt."
            ],
            "classifications": {
              "mealType": [
                "dinner",
                "lunch",
                "vegan"
              ],
              "cookingMethods": [
                "boiling",
                "caramelizing"
              ]
            },
            "elementalProperties": {
              "Fire": 0.2,
              "Water": 0.2,
              "Earth": 0.55,
              "Air": 0.05
            },
            "astrologicalAffinities": {
              "planets": [
                "Saturn",
                "Earth"
              ],
              "signs": [
                "capricorn",
                "virgo"
              ],
              "lunarPhases": [
                "New Moon"
              ]
            },
            "nutritionPerServing": {
              "calories": 420,
              "proteinG": 18,
              "carbsG": 65,
              "fatG": 14,
              "fiberG": 12,
              "sodiumMg": 450,
              "sugarG": 12,
              "vitamins": [
                "Vitamin B6",
                "Iron"
              ],
              "minerals": [
                "Magnesium",
                "Potassium"
              ]
            },
            "substitutions": []
          },
          {
            "name": "Authentic Kunafa",
            "description": "The queen of desserts. A layer of stretchy, unsalted Nabulsi cheese is encased in butter-soaked shredded phyllo dough (kataifi), baked until golden, and drenched in cold orange blossom syrup.",
            "details": {
              "cuisine": "Middle Eastern (Levantine)",
              "prepTimeMinutes": 20,
              "cookTimeMinutes": 30,
              "baseServingSize": 8,
              "spiceLevel": "None",
              "season": [
                "celebration",
                "Ramadan"
              ]
            },
            "ingredients": [
              {
                "amount": 1,
                "unit": "lb",
                "name": "Kataifi pastry",
                "notes": "Shredded phyllo."
              },
              {
                "amount": 1,
                "unit": "lb",
                "name": "Nabulsi or Akawi cheese",
                "notes": "Desalted."
              }
            ],
            "instructions": [
              "Step 1: Desalt cheese by soaking in water for hours.",
              "Step 2: Rub shredded pastry with melted butter and orange dye.",
              "Step 3: Press half of the pastry into a pan; top with cheese.",
              "Step 4: Bake until the cheese is molten and the crust is rigid.",
              "Step 5: Invert onto a plate; pour cold floral syrup over immediately."
            ],
            "classifications": {
              "mealType": [
                "dessert"
              ],
              "cookingMethods": [
                "baking",
                "syrup-saturation"
              ]
            },
            "elementalProperties": {
              "Fire": 0.15,
              "Water": 0.35,
              "Earth": 0.4,
              "Air": 0.1
            },
            "astrologicalAffinities": {
              "planets": [
                "Venus",
                "Moon"
              ],
              "signs": [
                "taurus",
                "cancer"
              ],
              "lunarPhases": [
                "Full Moon"
              ]
            },
            "nutritionPerServing": {
              "calories": 520,
              "proteinG": 18,
              "carbsG": 62,
              "fatG": 28,
              "fiberG": 1,
              "sodiumMg": 350,
              "sugarG": 45,
              "vitamins": [
                "Vitamin A",
                "Riboflavin"
              ],
              "minerals": [
                "Calcium",
                "Phosphorus"
              ]
            },
            "substitutions": []
          }
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
      Fire: [
        "harissa",
        "zhug",
        "chermoula",
        "hot pepper paste",
        "garlic-chili oil",
      ],
      Earth: [
        "tahini",
        "hummus",
        "baba ganoush",
        "walnut-pomegranate",
        "chickpea-olive",
      ],
      Water: [
        "yogurt sauces",
        "tarator",
        "cucumber-mint",
        "lemon-herb",
        "rosewater-honey",
      ],
      Air: [
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
