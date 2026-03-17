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
          name: "Hummus",
          description: "The foundational emulsion of the Levantine table. Dried chickpeas are cooked until completely collapsing, then processed with massive amounts of raw tahini and ice-cold water to create a stable, aerated, perfectly smooth matrix of extraordinary richness and depth. The alchemy of sesame fat and legume starch creates a dip that is simultaneously light and dense, bright with lemon yet grounded by the Earth energy of chickpeas.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":20,"cookTimeMinutes":90,"baseServingSize":6,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"dried chickpeas","notes":"Soaked overnight with baking soda for superior softness."},{"amount":1,"unit":"cup","name":"raw tahini","notes":"Highest quality, freshly stirred from the jar."},{"amount":3,"unit":"cloves","name":"garlic","notes":"Raw, peeled."},{"amount":1,"unit":"whole","name":"lemon","notes":"Juiced, approximately 3 tablespoons of fresh juice."},{"amount":0.5,"unit":"cup","name":"ice water","notes":"Used during blending to aerate and whiten the emulsion."},{"amount":2,"unit":"tbsp","name":"extra virgin olive oil","notes":"For finishing and serving."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Adjust to taste."},{"amount":0.5,"unit":"tsp","name":"ground cumin","notes":"Optional, for aromatic depth."},{"amount":1,"unit":"pinch","name":"sweet paprika","notes":"For garnishing."}],
          instructions: ["Step 1: Drain the soaked chickpeas and place them in a large pot. Cover with fresh cold water by at least 3 inches. Bring to a vigorous boil, skimming any foam that rises. Reduce heat and simmer for 60 to 90 minutes until the chickpeas are so tender they can be crushed effortlessly between two fingers.","Step 2: Reserve 1 cup of the hot cooking liquid. Drain the chickpeas. Set aside a small handful of whole cooked chickpeas for garnishing.","Step 3: While the chickpeas are still hot, transfer them to a high-powered food processor. Process for 2 full minutes without adding anything until a thick, slightly grainy paste forms.","Step 4: Add the raw tahini, raw garlic, lemon juice, and salt to the processor. Continue blending for another 2 minutes as the mixture becomes pale and stiff.","Step 5: The Finish. With the processor running continuously, drizzle in the ice water a tablespoon at a time over the next 2 to 3 minutes. Watch the hummus transform from dense and beige to light, almost white, and impossibly silky. Taste and adjust seasoning. Serve on a wide plate, swirled into a crater, filled with olive oil, whole chickpeas, and a dusting of paprika."],
          classifications: {"mealType":["appetizer","lunch","snack"],"cookingMethods":["boiling","emulsifying"]},
          elementalProperties: {"Fire":0.1,"Water":0.3,"Earth":0.5,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Venus"],"signs":["capricorn","taurus"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":310,"proteinG":14,"carbsG":28,"fatG":18,"fiberG":9,"sodiumMg":420,"sugarG":3,"vitamins":["Folate","Vitamin B6"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"dried chickpeas","substituteOptions":["canned chickpeas (shorter cook, less creamy)","white beans for a lighter version"]},{"originalIngredient":"raw tahini","substituteOptions":["roasted tahini (nuttier, darker)","sunflower seed butter"]}]
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
          description: "The iconic street-food pillar of the Middle East. Thin slices of heavily marinated chicken or lamb are stacked onto a vertical spit and slow-roasted over radiant heat for hours, the rotating mass basting itself continuously in its own rendering fat. The outer crust crisps and caramelizes from the Maillard reaction while the interior remains moist and yielding. Shaved to order and wrapped in flatbread with garlic sauce and pickles, it is the perfect expression of Fire alchemy applied to protein.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":30,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"boneless chicken thighs","notes":"Skin-on preferred for fat self-basting; or use lamb shoulder."},{"amount":3,"unit":"tbsp","name":"shawarma spice blend","notes":"Cumin, coriander, turmeric, cinnamon, allspice, black pepper, and cardamom."},{"amount":0.5,"unit":"cup","name":"plain whole-milk yogurt","notes":"Tenderizes the protein through lactic acid."},{"amount":3,"unit":"tbsp","name":"extra virgin olive oil","notes":"Carries fat-soluble spice compounds into the meat."},{"amount":4,"unit":"cloves","name":"garlic","notes":"Minced to a paste."},{"amount":1,"unit":"whole","name":"lemon","notes":"Juiced; for acid balance and brightness."},{"amount":4,"unit":"pieces","name":"flatbread or pita","notes":"For serving."},{"amount":0.5,"unit":"cup","name":"garlic sauce (toum)","notes":"Lebanese-style emulsified garlic sauce."},{"amount":0.5,"unit":"cup","name":"pickled turnips","notes":"Vibrant pink, for acidity and crunch."}],
          instructions: ["Step 1: In a large bowl, combine the shawarma spice blend, yogurt, olive oil, garlic paste, and lemon juice into a thick marinade. Add the chicken thighs and coat every surface thoroughly. Refrigerate for a minimum of 4 hours, ideally overnight, to allow the lactic acid to denature the surface proteins.","Step 2: Remove the chicken from the marinade and allow it to come to room temperature for 30 minutes. Heat a cast iron grill pan or heavy skillet over high heat until it is visibly smoking.","Step 3: Sear the chicken thighs in batches, pressing them flat with a heavy weight if available, for 5 to 7 minutes per side. You want a deeply charred, nearly black crust on the outside while the interior remains juicy. The carbonized spice crust is non-negotiable.","Step 4: Let the cooked chicken rest for 5 minutes. Then slice it thinly against the grain using a sharp knife in short, rapid strokes, shaving it as thin as possible to mimic the spit-shaved experience.","Step 5: The Finish. Warm the flatbread until it is pliable. Spread a generous layer of toum garlic sauce. Pile the shaved, crispy chicken slices in the center. Add pickled turnips, tomato slices, and fresh parsley. Roll tightly and serve immediately."],
          classifications: {"mealType":["dinner","lunch","street food"],"cookingMethods":["grilling","marinating","searing"]},
          elementalProperties: {"Fire":0.45,"Water":0.2,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":580,"proteinG":42,"carbsG":38,"fatG":28,"fiberG":3,"sodiumMg":890,"sugarG":4,"vitamins":["Niacin","Vitamin B6"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"chicken thighs","substituteOptions":["lamb shoulder","cauliflower steaks for vegan version"]},{"originalIngredient":"garlic sauce (toum)","substituteOptions":["tahini sauce","hummus"]}]
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
          description: "The elemental transformation of ground meat through fire. A blend of fatty lamb and beef is combined with raw grated onion, whose cellular moisture steams the interior as the outside chars aggressively on the grill. Fresh herbs and warm spices create a complex aromatic matrix. The kofta must contain enough fat to remain juicy under the violent heat of a live-coal fire. The elongated shape along the flat metal skewer maximizes surface area exposed to the inferno.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":25,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"ground lamb","notes":"At least 20% fat content; lean lamb will produce dry kofta."},{"amount":0.5,"unit":"lb","name":"ground beef","notes":"80/20 blend for additional fat."},{"amount":1,"unit":"medium","name":"onion","notes":"Grated on the fine side of a box grater; excess liquid squeezed out."},{"amount":0.25,"unit":"cup","name":"fresh parsley","notes":"Very finely chopped."},{"amount":2,"unit":"tsp","name":"ground cumin","notes":"Freshly ground if possible."},{"amount":1,"unit":"tsp","name":"ground coriander","notes":"Complementary warm spice."},{"amount":1,"unit":"tsp","name":"allspice","notes":"Essential Middle Eastern aromatic."},{"amount":0.5,"unit":"tsp","name":"ground cinnamon","notes":"Subtle warmth."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"For seasoning throughout."},{"amount":0.5,"unit":"tsp","name":"black pepper","notes":"Freshly ground."}],
          instructions: ["Step 1: In a large bowl, combine the ground lamb, ground beef, grated onion (squeezed of excess moisture), finely chopped parsley, cumin, coriander, allspice, cinnamon, salt, and black pepper. Using your hands, knead and squeeze the mixture aggressively for 3 to 5 minutes until it becomes sticky and homogeneous. This develops the myosin proteins that bind the kofta to the skewer.","Step 2: Refrigerate the kofta mixture for at least 30 minutes to allow the fat to firm up, which makes shaping easier and prevents the kofta from sliding off the skewer during grilling.","Step 3: Prepare a grill or grill pan and heat it until smoking hot. If using charcoal, wait until the coals are glowing white-hot with no visible flames.","Step 4: Wet your hands with cold water. Take a portion of the meat mixture (about the size of a large egg) and mold it firmly around a flat metal skewer, pressing and squeezing to form a long, torpedo shape approximately 1 inch in diameter. The meat should grip the skewer tightly.","Step 5: The Finish. Grill the kofta kebabs directly over maximum heat for 3 to 4 minutes per side, turning only once, until deeply charred on the outside and just cooked through. Serve immediately with flatbread, tomatoes, onions, fresh parsley, and a generous drizzle of tahini sauce."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["grilling","charcoal-grilling"]},
          elementalProperties: {"Fire":0.5,"Water":0.15,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":520,"proteinG":38,"carbsG":5,"fatG":38,"fiberG":1,"sodiumMg":720,"sugarG":2,"vitamins":["Niacin","Vitamin B12"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"ground lamb","substituteOptions":["ground beef only","ground turkey (lower fat, add olive oil)"]},{"originalIngredient":"allspice","substituteOptions":["baharat spice blend","equal parts cinnamon and nutmeg"]}]
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
          },
        {
          name: "Hummus",
          description: "The foundational emulsion of the Levantine table. Dried chickpeas are cooked until completely collapsing, then processed with massive amounts of raw tahini and ice-cold water to create a stable, aerated, perfectly smooth matrix of extraordinary richness and depth. The alchemy of sesame fat and legume starch creates a dip that is simultaneously light and dense, bright with lemon yet grounded by the Earth energy of chickpeas.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":20,"cookTimeMinutes":90,"baseServingSize":6,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"dried chickpeas","notes":"Soaked overnight with baking soda for superior softness."},{"amount":1,"unit":"cup","name":"raw tahini","notes":"Highest quality, freshly stirred from the jar."},{"amount":3,"unit":"cloves","name":"garlic","notes":"Raw, peeled."},{"amount":1,"unit":"whole","name":"lemon","notes":"Juiced, approximately 3 tablespoons of fresh juice."},{"amount":0.5,"unit":"cup","name":"ice water","notes":"Used during blending to aerate and whiten the emulsion."},{"amount":2,"unit":"tbsp","name":"extra virgin olive oil","notes":"For finishing and serving."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Adjust to taste."},{"amount":0.5,"unit":"tsp","name":"ground cumin","notes":"Optional, for aromatic depth."},{"amount":1,"unit":"pinch","name":"sweet paprika","notes":"For garnishing."}],
          instructions: ["Step 1: Drain the soaked chickpeas and place them in a large pot. Cover with fresh cold water by at least 3 inches. Bring to a vigorous boil, skimming any foam that rises. Reduce heat and simmer for 60 to 90 minutes until the chickpeas are so tender they can be crushed effortlessly between two fingers.","Step 2: Reserve 1 cup of the hot cooking liquid. Drain the chickpeas. Set aside a small handful of whole cooked chickpeas for garnishing.","Step 3: While the chickpeas are still hot, transfer them to a high-powered food processor. Process for 2 full minutes without adding anything until a thick, slightly grainy paste forms.","Step 4: Add the raw tahini, raw garlic, lemon juice, and salt to the processor. Continue blending for another 2 minutes as the mixture becomes pale and stiff.","Step 5: The Finish. With the processor running continuously, drizzle in the ice water a tablespoon at a time over the next 2 to 3 minutes. Watch the hummus transform from dense and beige to light, almost white, and impossibly silky. Taste and adjust seasoning. Serve on a wide plate, swirled into a crater, filled with olive oil, whole chickpeas, and a dusting of paprika."],
          classifications: {"mealType":["appetizer","dinner","snack"],"cookingMethods":["boiling","emulsifying"]},
          elementalProperties: {"Fire":0.1,"Water":0.3,"Earth":0.5,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Venus"],"signs":["capricorn","taurus"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":310,"proteinG":14,"carbsG":28,"fatG":18,"fiberG":9,"sodiumMg":420,"sugarG":3,"vitamins":["Folate","Vitamin B6"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"dried chickpeas","substituteOptions":["canned chickpeas (shorter cook, less creamy)","white beans for a lighter version"]},{"originalIngredient":"raw tahini","substituteOptions":["roasted tahini (nuttier, darker)","sunflower seed butter"]}]
        },
        {
          name: "Falafel",
          description: "A structural triumph of legumes. Raw, soaked chickpeas are ground into a coarse, intensely green matrix with massive amounts of parsley, cilantro, and garlic, then flash-fried into spheres with a shatteringly crisp exterior and a steamy, herb-flecked, soft interior. The critical rule: never use canned or cooked chickpeas. Only raw-soaked legumes contain the ungelatinized starches that bind correctly and produce the iconic crunch without a flour binder.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":30,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"dried chickpeas","notes":"Soaked 12 to 24 hours in cold water. Never cooked or canned."},{"amount":1,"unit":"cup","name":"fresh flat-leaf parsley","notes":"Packed, stems and all."},{"amount":1,"unit":"cup","name":"fresh cilantro","notes":"Packed, stems and all, for the green interior."},{"amount":1,"unit":"medium","name":"yellow onion","notes":"Roughly chopped."},{"amount":5,"unit":"cloves","name":"garlic","notes":"Peeled."},{"amount":2,"unit":"tsp","name":"ground cumin","notes":"Freshly ground for maximum aroma."},{"amount":1,"unit":"tsp","name":"ground coriander","notes":"Warm complementary spice."},{"amount":0.5,"unit":"tsp","name":"cayenne pepper","notes":"For controlled heat."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Essential."},{"amount":0.5,"unit":"tsp","name":"baking soda","notes":"Activates just before frying to create interior lightness."},{"amount":4,"unit":"cups","name":"neutral frying oil","notes":"Canola or sunflower, for deep frying."}],
          instructions: ["Step 1: Drain the soaked chickpeas thoroughly. In a food processor, combine the chickpeas, parsley, cilantro, onion, garlic, cumin, coriander, cayenne, and salt. Pulse repeatedly until the mixture is a coarse, gritty paste. It must not be smooth or the falafel will be dense. Test it: press a small amount in your palm; it should just hold together.","Step 2: Refrigerate the falafel mixture for at least 1 hour. This hydrates the remaining starch and helps the mixture firm up for easier shaping.","Step 3: Add the baking soda to the mixture and mix thoroughly just before frying. Heat the frying oil in a deep pot to 350 degrees Fahrenheit (175 Celsius). Test with a small piece first; it should sizzle immediately and rise to the surface.","Step 4: Using wet hands or a falafel scoop, form the mixture into round balls or flattened discs approximately 1.5 inches in diameter. Work quickly and do not overcompress them.","Step 5: The Finish. Fry the falafel in batches, without crowding the pot, for 3 to 4 minutes until deeply browned all over. They should sound hollow when tapped. Drain on paper towels and serve immediately while the crust is still crackling. Serve in pita with tahini, fresh vegetables, and pickled turnips."],
          classifications: {"mealType":["dinner","lunch","street food"],"cookingMethods":["grinding","deep-frying"]},
          elementalProperties: {"Fire":0.4,"Water":0.15,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":380,"proteinG":18,"carbsG":45,"fatG":16,"fiberG":12,"sodiumMg":650,"sugarG":3,"vitamins":["Folate","Vitamin K"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"chickpeas","substituteOptions":["fava beans (Egyptian-style falafel)","half chickpeas and half fava beans"]},{"originalIngredient":"cilantro","substituteOptions":["additional parsley for cilantro-averse palates"]}]
        },
        {
          name: "Baba Ghanoush",
          description: "The smoked alchemical transformation of a humble vegetable. Eggplant is charred directly over an open flame until the exterior is completely blackened and the interior has collapsed into a smoky, silky, almost liquid state. The flesh is combined with raw tahini, lemon, and garlic to create a dip whose defining characteristic is the irreplaceable flavor of wood smoke and char. No broiler or oven can replicate the direct flame char; the Maillard reaction on the skin and the pyrolysis of the eggplant flesh are the whole point.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":15,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["summer","autumn"]},
          ingredients: [{"amount":2,"unit":"large","name":"globe eggplants","notes":"The largest you can find; more flesh relative to skin."},{"amount":3,"unit":"tbsp","name":"raw tahini","notes":"High quality, freshly stirred."},{"amount":2,"unit":"cloves","name":"garlic","notes":"Minced to a fine paste with salt."},{"amount":2,"unit":"tbsp","name":"fresh lemon juice","notes":"Approximately half a lemon."},{"amount":2,"unit":"tbsp","name":"extra virgin olive oil","notes":"For finishing."},{"amount":0.5,"unit":"tsp","name":"fine sea salt","notes":"To taste."},{"amount":2,"unit":"tbsp","name":"fresh flat-leaf parsley","notes":"Finely chopped, for garnish."},{"amount":1,"unit":"pinch","name":"smoked paprika","notes":"Optional, for additional smokiness."}],
          instructions: ["Step 1: Place the whole, unpierced eggplants directly on the grate of a gas burner set to its highest flame, or over charcoal. The direct contact with fire is mandatory. Char them, turning every 5 minutes with tongs, until the skin is completely blackened all over and the eggplant has fully deflated and collapsed. This takes 20 to 30 minutes for large eggplants.","Step 2: Transfer the charred eggplants to a colander set over a bowl. Let them rest for 15 minutes. The steam continues to cook the interior and the colander allows the extremely bitter, dark liquid to drain away. Do not skip the draining step.","Step 3: Peel away all of the blackened skin with your fingers under cold running water. You will have soft, grey-brown, smoky flesh. Place it in the colander again and squeeze gently to remove any remaining liquid.","Step 4: Roughly chop the eggplant flesh on a board rather than processing it. Baba ghanoush should be textured and rustic, never smooth like hummus. In a bowl, combine the chopped eggplant, tahini, garlic paste, lemon juice, and salt. Mix together.","Step 5: The Finish. Taste and adjust; it should be smoky, bright with acid, and nutty from the tahini. Spread onto a plate, drizzle generously with olive oil, scatter with parsley, and serve with warm pita or as part of a mezze spread."],
          classifications: {"mealType":["appetizer","dinner","snack"],"cookingMethods":["charring","roasting","mashing"]},
          elementalProperties: {"Fire":0.35,"Water":0.3,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Moon"],"signs":["scorpio","cancer"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":180,"proteinG":5,"carbsG":15,"fatG":13,"fiberG":7,"sodiumMg":320,"sugarG":6,"vitamins":["Vitamin C","Folate"],"minerals":["Potassium","Magnesium"]},
          substitutions: [{"originalIngredient":"globe eggplants","substituteOptions":["Japanese eggplants (thinner, char faster)","zucchini for a milder version"]},{"originalIngredient":"tahini","substituteOptions":["Greek yogurt for a lighter, less smoky version"]}]
        },
        {
          name: "Mujaddara",
          description: "The ancient Levantine staple of extraordinary simplicity and depth. Lentils and rice are cooked together in a single pot while a massive, almost excessive quantity of onions is slowly fried in olive oil until they cross the threshold from caramelized to deeply frizzled and almost crispy. These blackened, sweet, intensely flavored onions are folded through the lentils and piled on top. The entire dish is a meditation on the transformative power of the Maillard reaction and the Earth alchemy of legumes and grain.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":15,"cookTimeMinutes":50,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"brown or green lentils","notes":"Rinsed well; do not use red lentils as they dissolve."},{"amount":1,"unit":"cup","name":"long-grain white rice","notes":"Washed until water runs clear."},{"amount":4,"unit":"large","name":"yellow onions","notes":"Thinly sliced into rings; this seems excessive but is correct."},{"amount":0.5,"unit":"cup","name":"extra virgin olive oil","notes":"A generous amount is essential for proper frizzling."},{"amount":1,"unit":"tsp","name":"ground cumin","notes":"The primary spice."},{"amount":0.5,"unit":"tsp","name":"ground coriander","notes":"Complementary warmth."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Adjust to taste."},{"amount":3,"unit":"cups","name":"water","notes":"For cooking the lentils and rice."},{"amount":1,"unit":"cup","name":"plain yogurt","notes":"For serving alongside."}],
          instructions: ["Step 1: Heat all of the olive oil in a large, heavy-bottomed pot over medium heat. Add ALL of the sliced onions. This will seem like far too many onions. It is not. Cook, stirring regularly, for 30 to 40 minutes until the onions have dramatically reduced in volume and are dark brown and frizzled. Remove half the onions and set aside for topping.","Step 2: While the onions cook, simmer the lentils separately in water for 15 minutes until partially cooked but still firm at the center. Drain and set aside.","Step 3: To the pot with the remaining caramelized onions, add the cumin and coriander and stir for 1 minute. Add the par-cooked lentils, the washed rice, and season with salt. Pour in 2.5 cups of water. Stir once to combine.","Step 4: Bring to a boil, then immediately reduce to the lowest possible heat. Cover tightly and cook undisturbed for 20 minutes until the liquid is fully absorbed and the rice is cooked through.","Step 5: The Finish. Remove from heat, place a clean kitchen towel under the lid to absorb steam, and let rest for 5 minutes. Fluff gently. Serve piled high with the reserved frizzled onions on top and a large bowl of cold plain yogurt alongside."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying","caramelizing"]},
          elementalProperties: {"Fire":0.15,"Water":0.2,"Earth":0.6,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Moon"],"signs":["capricorn","cancer"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":480,"proteinG":17,"carbsG":68,"fatG":17,"fiberG":12,"sodiumMg":480,"sugarG":10,"vitamins":["Vitamin B6","Folate"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"long-grain white rice","substituteOptions":["bulgur wheat (traditional variation)","brown rice (longer cook time)"]},{"originalIngredient":"brown or green lentils","substituteOptions":["Puy lentils (firmer texture)","split peas"]}]
        },
        {
          name: "Maqluba",
          description: "The upside-down rice dish. Maqluba, literally meaning turned upside-down in Arabic, is an architectural construction. Layers of meat, fried vegetables, and spiced rice are assembled in a single pot in reverse order. When complete, the pot is inverted onto a serving platter in one dramatic reveal, producing a golden dome of rice crowned with the browned meat and caramelized vegetables. The construction requires precision; the rice must be cooked to the precise water absorption point to hold its architectural form when inverted.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":45,"cookTimeMinutes":60,"baseServingSize":6,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"bone-in chicken pieces","notes":"Or lamb shoulder pieces; pat dry for browning."},{"amount":2,"unit":"cups","name":"long-grain rice","notes":"Soaked in water for 30 minutes, then drained."},{"amount":1,"unit":"large","name":"eggplant","notes":"Sliced into thick rounds, salted, and fried."},{"amount":2,"unit":"medium","name":"tomatoes","notes":"Sliced into thick rounds."},{"amount":1,"unit":"large","name":"onion","notes":"Sliced for the base layer."},{"amount":2,"unit":"tbsp","name":"baharat spice blend","notes":"Seven-spice; includes allspice, cinnamon, black pepper, coriander, cumin, cloves, and nutmeg."},{"amount":3,"unit":"cups","name":"hot chicken broth","notes":"For cooking the rice layer."},{"amount":0.25,"unit":"cup","name":"toasted pine nuts and almonds","notes":"For the final garnish."},{"amount":3,"unit":"tbsp","name":"extra virgin olive oil","notes":"For browning."},{"amount":1,"unit":"tsp","name":"turmeric","notes":"For golden color in the rice."}],
          instructions: ["Step 1: Brown the chicken pieces in olive oil in a large, deep pot until deeply golden. Remove and set aside. In the same pot, fry the eggplant slices in batches until browned. Set aside separately.","Step 2: Layer the base of the pot: start with sliced onions, then sliced tomatoes. Place the browned chicken on top of the tomato layer. Arrange the fried eggplant over the chicken.","Step 3: In a bowl, season the drained rice with baharat, turmeric, salt, and a drizzle of olive oil. Pour the seasoned rice evenly over the eggplant layer. Press down gently to compact it.","Step 4: Pour the hot chicken broth carefully over the back of a spoon to avoid disturbing the layers. The liquid should cover the rice by about half an inch. Bring to a boil, then immediately reduce to the very lowest heat. Cover tightly and cook for 35 to 40 minutes until all liquid is absorbed.","Step 5: The Finish. Remove from heat and let stand, covered, for 10 minutes. Place a large, flat serving platter over the pot. With one confident motion, invert the pot onto the platter. Lift the pot slowly to reveal the architectural dome. Garnish with toasted nuts and fresh parsley."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["frying","braising","steaming"]},
          elementalProperties: {"Fire":0.3,"Water":0.25,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Jupiter","Sun"],"signs":["sagittarius","leo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":620,"proteinG":38,"carbsG":58,"fatG":24,"fiberG":6,"sodiumMg":820,"sugarG":7,"vitamins":["Niacin","Vitamin B6"],"minerals":["Iron","Zinc"]},
          substitutions: [{"originalIngredient":"bone-in chicken pieces","substituteOptions":["lamb shoulder","cauliflower and chickpeas for vegetarian version"]},{"originalIngredient":"eggplant","substituteOptions":["zucchini","potatoes"]}]
        },
        {
          name: "Lamb Kofta Kebabs",
          description: "The elemental transformation of ground meat through fire. Fatty ground lamb is combined with raw grated onion, fresh parsley, and a precise blend of warm spices. The mixture is kneaded aggressively until the myosin proteins develop and create a sticky, cohesive matrix that grips a flat metal skewer. Grilled over maximum heat, the exterior chars and caramelizes while the interior remains juicy and aromatic. The fat renders and drips, creating flame flare-ups that impart additional smoky complexity.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":25,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1.5,"unit":"lbs","name":"ground lamb","notes":"At least 20 percent fat content; lean lamb produces dry kofta."},{"amount":1,"unit":"medium","name":"yellow onion","notes":"Grated on the fine side of a box grater; squeeze out the excess liquid."},{"amount":0.5,"unit":"cup","name":"fresh flat-leaf parsley","notes":"Very finely chopped."},{"amount":2,"unit":"tsp","name":"ground cumin","notes":"Freshly ground for maximum aroma."},{"amount":1,"unit":"tsp","name":"ground coriander","notes":"Complementary warm spice."},{"amount":1,"unit":"tsp","name":"allspice","notes":"Essential Middle Eastern aromatic."},{"amount":0.5,"unit":"tsp","name":"ground cinnamon","notes":"Subtle background warmth."},{"amount":0.5,"unit":"tsp","name":"cayenne pepper","notes":"For controlled heat."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Adjust to taste."},{"amount":4,"unit":"pieces","name":"flatbread","notes":"For serving."},{"amount":0.5,"unit":"cup","name":"tahini sauce","notes":"For drizzling."}],
          instructions: ["Step 1: In a large bowl, combine the ground lamb, grated onion with its squeezed liquid discarded, finely chopped parsley, cumin, coriander, allspice, cinnamon, cayenne, and salt. Using your hands, knead and squeeze the mixture aggressively for 3 to 5 minutes until it becomes completely homogeneous and almost paste-like in its stickiness. This protein development is critical for the kofta to grip the skewer.","Step 2: Refrigerate the mixture for 30 minutes. This firms the fat and makes shaping easier. Meanwhile, prepare a charcoal or gas grill and heat to maximum temperature.","Step 3: Wet your hands with cold water. Take a golf-ball-sized portion of meat and mold it firmly around a flat metal skewer, pressing and squeezing to form a long, thin, torpedo shape approximately 1 inch in diameter and 5 inches long. The meat must grip the skewer with absolute tenacity.","Step 4: Grill the kofta directly over maximum heat, turning only once, for 3 to 4 minutes per side. The goal is a deeply charred, almost blackened exterior crust with an interior that is just barely cooked through and still moist.","Step 5: The Finish. Remove from the grill and rest for 2 minutes. Slide from the skewers onto warm flatbread. Drizzle with tahini sauce, add sliced tomatoes, raw onion rings, and fresh parsley. Wrap and serve immediately."],
          classifications: {"mealType":["dinner","lunch","street food"],"cookingMethods":["grilling","charcoal-grilling","marinating"]},
          elementalProperties: {"Fire":0.5,"Water":0.15,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":490,"proteinG":36,"carbsG":22,"fatG":30,"fiberG":3,"sodiumMg":680,"sugarG":2,"vitamins":["Niacin","Vitamin B12"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"ground lamb","substituteOptions":["80/20 ground beef","half lamb and half beef","ground turkey with added olive oil"]},{"originalIngredient":"allspice","substituteOptions":["baharat spice blend","equal parts cinnamon and nutmeg"]}]
        },
        {
          name: "Persian Tahdig",
          description: "The crown jewel of Persian cooking and the most desired element of any Iranian meal. Tahdig, meaning bottom of the pot, is the intentionally formed crust of golden, crispy rice created by a precise cooking method. Long-grain basmati rice is parboiled, then layered back into the pot with a fat barrier of oil or butter. The pot is sealed with a towel-wrapped lid to trap all steam internally, and the heat is applied in a precise sequence: high heat to initiate the crust, then very low heat to cook the interior for 45 minutes without scorching. The inverted reveal is the dramatic climax.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":20,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"aged basmati rice","notes":"The longer and thinner the grain, the better the tahdig."},{"amount":3,"unit":"tbsp","name":"fine sea salt","notes":"For the parboiling water; use more than you think."},{"amount":4,"unit":"tbsp","name":"neutral oil or clarified butter","notes":"Canola or ghee; this forms the critical fat barrier."},{"amount":0.25,"unit":"tsp","name":"ground saffron","notes":"Dissolved in 2 tablespoons of hot water for color and aroma."},{"amount":1,"unit":"large","name":"russet potato","notes":"Sliced thinly for a potato tahdig variation; optional but spectacular."},{"amount":1,"unit":"clean","name":"kitchen towel","notes":"Wrapped under the lid to absorb steam during the steam-cook phase."}],
          instructions: ["Step 1: Rinse the basmati rice repeatedly under cold water until the water runs completely clear. Soak in heavily salted cold water for 1 hour. This hydrates the grains, washes out excess starch, and seasons the rice from the inside out.","Step 2: Bring a very large pot of heavily salted water to a rolling boil. Drain the soaked rice and add it. Parboil for exactly 5 to 7 minutes; the rice should be cooked on the outside but still have a firm, white, chalky core. Drain immediately in a colander and rinse with cool water to stop cooking.","Step 3: Add the oil or butter to the empty pot and heat over high. If using potato tahdig, layer the thin potato slices across the bottom of the hot oil. Spoon the par-cooked rice loosely over the potato layer in a mound, building it into a loose pyramid shape. Do not compress it.","Step 4: Drizzle the saffron water over the top of the rice pyramid. Wrap a clean kitchen towel tightly around the pot lid and place it on the pot. Cook on high heat for 2 to 3 minutes to initiate the crust formation, then immediately reduce to the absolute minimum heat. Cook undisturbed for 45 minutes.","Step 5: The Finish. Remove from heat. Fill the kitchen sink with 2 inches of cold water and place the bottom of the pot in it for 2 minutes. This thermal shock releases the crust from the pot. Place a platter over the pot and invert in one confident motion to reveal the golden tahdig. Serve the fluffy rice alongside the crispy crust."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["boiling","steaming","crust-forming"]},
          elementalProperties: {"Fire":0.25,"Water":0.3,"Earth":0.4,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Sun"],"signs":["capricorn","leo"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":380,"proteinG":6,"carbsG":68,"fatG":10,"fiberG":1,"sodiumMg":420,"sugarG":0,"vitamins":["Niacin","Thiamine"],"minerals":["Iron","Manganese"]},
          substitutions: [{"originalIngredient":"aged basmati rice","substituteOptions":["jasmine rice (shorter grain, different texture)","extra-long grain basmati"]},{"originalIngredient":"neutral oil","substituteOptions":["clarified butter (ghee) for richer flavor","coconut oil"]}]
        },
        {
          name: "Lentil Soup (Shorbat Adas)",
          description: "The definitive soup of the Arab world. Shorbat Adas is a deeply comforting, velvety red lentil soup that uses minimal ingredients to achieve maximum depth. Red lentils are used precisely because they dissolve completely into a smooth, homogeneous liquid upon cooking, requiring no blending. The elemental alchemy involves the complete dissolution of legume cellular structure into a warm, golden, cumin-scented liquid. A final drizzle of lemon juice right before serving cuts through the richness and brightens the entire bowl.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":15,"cookTimeMinutes":35,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1.5,"unit":"cups","name":"red lentils","notes":"Rinsed well; no soaking required as they dissolve."},{"amount":1,"unit":"large","name":"yellow onion","notes":"Finely diced."},{"amount":3,"unit":"cloves","name":"garlic","notes":"Minced."},{"amount":2,"unit":"tsp","name":"ground cumin","notes":"The primary flavor of this soup."},{"amount":1,"unit":"tsp","name":"ground turmeric","notes":"For the golden color."},{"amount":0.5,"unit":"tsp","name":"ground coriander","notes":"For aromatic depth."},{"amount":5,"unit":"cups","name":"water or vegetable broth","notes":"For the base liquid."},{"amount":2,"unit":"tbsp","name":"extra virgin olive oil","notes":"For sauteing the aromatics."},{"amount":1,"unit":"whole","name":"lemon","notes":"Juiced, added at the end for brightness."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Adjust to taste."}],
          instructions: ["Step 1: Heat the olive oil in a large pot over medium heat. Add the diced onion and cook for 8 to 10 minutes, stirring regularly, until it is deeply softened and beginning to turn golden at the edges. Add the minced garlic and cook for 1 minute more.","Step 2: Add the ground cumin, turmeric, and coriander to the onions and stir for 1 minute until the raw smell of the spices cooks out and they become deeply fragrant.","Step 3: Add the rinsed red lentils and pour in the water or broth. Stir to combine, bring to a boil, then reduce heat and simmer uncovered for 20 to 25 minutes.","Step 4: Watch the lentils closely. They will begin to dissolve and break down on their own without any help. By the 20-minute mark, the soup should be thick and creamy. If it becomes too thick, add a little more water. Season with salt to taste.","Step 5: The Finish. Squeeze in the fresh lemon juice and stir vigorously. The acid immediately brightens the entire bowl. Taste and adjust lemon and salt. Ladle into bowls and top each one with a swirl of olive oil and a pinch of ground cumin. Serve with warm flatbread."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["sauteing","simmering","dissolving"]},
          elementalProperties: {"Fire":0.2,"Water":0.45,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Saturn"],"signs":["cancer","capricorn"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":290,"proteinG":18,"carbsG":42,"fatG":7,"fiberG":10,"sodiumMg":580,"sugarG":4,"vitamins":["Folate","Vitamin B6"],"minerals":["Iron","Potassium"]},
          substitutions: [{"originalIngredient":"red lentils","substituteOptions":["yellow split peas (longer cook time)","green lentils (will not dissolve, must be blended)"]},{"originalIngredient":"water","substituteOptions":["vegetable broth for more depth","chicken broth"]}]
        },
        {
          name: "Harira",
          description: "The great restorative soup of Morocco. Harira is a dense, complex, tomato-based broth loaded with chickpeas, lentils, lamb, and a complexity of spices that includes cinnamon and ginger alongside the expected cumin and turmeric. Its defining textural characteristic comes from a final addition of Tadouira, a paste of flour and water whisked in during the last minutes of cooking that thickens the entire soup to a silky, almost chowder-like consistency. Traditionally consumed to break the Ramadan fast, it is a complete nutritional matrix in a single bowl.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":25,"cookTimeMinutes":60,"baseServingSize":6,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":0.5,"unit":"lb","name":"lamb shoulder","notes":"Cut into very small cubes; or use ground lamb."},{"amount":0.5,"unit":"cup","name":"dried chickpeas","notes":"Soaked overnight and drained."},{"amount":0.5,"unit":"cup","name":"brown lentils","notes":"Rinsed."},{"amount":2,"unit":"large","name":"tomatoes","notes":"Grated or finely diced."},{"amount":1,"unit":"cup","name":"tomato passata","notes":"Or canned crushed tomatoes."},{"amount":1,"unit":"large","name":"onion","notes":"Finely diced."},{"amount":0.5,"unit":"cup","name":"fresh cilantro and flat-leaf parsley","notes":"Roughly chopped; both essential."},{"amount":1,"unit":"tsp","name":"ground ginger","notes":"A signature Moroccan spice here."},{"amount":1,"unit":"tsp","name":"ground turmeric","notes":"For the warm golden color."},{"amount":1,"unit":"tsp","name":"ground cinnamon","notes":"Essential warmth and complexity."},{"amount":0.25,"unit":"cup","name":"all-purpose flour","notes":"For the Tadouira thickening agent."},{"amount":1,"unit":"whole","name":"lemon","notes":"Juiced, for serving."}],
          instructions: ["Step 1: In a large heavy pot, combine the lamb cubes, diced onion, grated tomatoes, tomato passata, soaked chickpeas, ginger, turmeric, cinnamon, cumin, a large pinch of salt, and half the cilantro and parsley. Add enough water to cover by 3 inches. Bring to a boil.","Step 2: Reduce heat and simmer for 30 minutes, skimming any foam that rises. The chickpeas will begin to soften. Add the rinsed brown lentils and continue simmering for another 20 minutes.","Step 3: Make the Tadouira: in a small bowl, whisk the flour with half a cup of cold water until completely smooth with no lumps. This slurry is the key to the distinctive Harira texture.","Step 4: Bring the soup to a vigorous boil. Slowly drizzle in the Tadouira paste while stirring constantly and continuously. Keep stirring and boiling for 5 minutes until the soup visibly thickens and the floury taste cooks out completely.","Step 5: The Finish. Remove from heat, add the remaining cilantro and parsley, and taste for salt. Ladle into bowls and pass a plate of lemon wedges alongside. Traditionally served with fresh dates and chebakia pastry during Ramadan."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","thickening","braising"]},
          elementalProperties: {"Fire":0.25,"Water":0.4,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Jupiter","Moon"],"signs":["sagittarius","cancer"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":340,"proteinG":22,"carbsG":38,"fatG":10,"fiberG":9,"sodiumMg":720,"sugarG":7,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Zinc"]},
          substitutions: [{"originalIngredient":"lamb shoulder","substituteOptions":["beef chuck","chicken thighs","omit for vegan version"]},{"originalIngredient":"all-purpose flour","substituteOptions":["cornstarch slurry (half the amount)","rice flour"]}]
        },
        {
          name: "Dolma",
          description: "Stuffed grape leaves are a monument to patience and precision. Dolma requires individually rolling dozens of small parcels of seasoned rice, herbs, and sometimes meat inside brined grape leaves, then stacking them in tight, concentric circles in a pot so they hold their shape under the pressure of the steaming liquid. The filling must be perfectly calibrated: enough rice to fill but not burst the leaf as the grain expands during cooking. A base of sliced onions and tomatoes lines the pot bottom, serving both as a flavor foundation and a protective barrier against direct heat.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":60,"cookTimeMinutes":55,"baseServingSize":6,"spiceLevel":"Mild","season":["spring","summer"]},
          ingredients: [{"amount":1,"unit":"jar","name":"brined grape leaves","notes":"Approximately 50 to 60 leaves; rinse thoroughly to remove excess salt."},{"amount":1.5,"unit":"cups","name":"long-grain white rice","notes":"Rinsed; do not use parboiled rice."},{"amount":0.5,"unit":"lb","name":"ground lamb or beef","notes":"Optional; omit for a vegan version."},{"amount":1,"unit":"cup","name":"fresh flat-leaf parsley","notes":"Finely chopped."},{"amount":0.5,"unit":"cup","name":"fresh mint","notes":"Finely chopped; essential."},{"amount":1,"unit":"medium","name":"onion","notes":"Finely diced."},{"amount":2,"unit":"tbsp","name":"extra virgin olive oil","notes":"In the filling and for the pot."},{"amount":1,"unit":"tsp","name":"ground allspice","notes":"The defining spice of Levantine dolma."},{"amount":0.5,"unit":"tsp","name":"ground cinnamon","notes":"For sweetness and depth."},{"amount":2,"unit":"large","name":"tomatoes","notes":"Sliced, for lining the pot bottom."},{"amount":2,"unit":"whole","name":"lemons","notes":"Juiced; poured over before cooking."}],
          instructions: ["Step 1: Make the filling. Combine the raw rinsed rice, ground meat if using, diced onion, chopped parsley and mint, olive oil, allspice, cinnamon, and a generous amount of salt and black pepper. Mix thoroughly with your hands. The filling should be well-seasoned as the grape leaf itself adds no flavor.","Step 2: Lay a grape leaf flat on a work surface, shiny-side-down. Place a small, fat cigar of filling (approximately 1 tablespoon) near the stem end. Fold the bottom of the leaf up over the filling, fold in both sides, and then roll tightly away from you. Do not roll too tight; the rice needs room to expand.","Step 3: Line the bottom of a heavy pot with sliced tomatoes and a layer of any torn or small grape leaves. This prevents the dolma from scorching.","Step 4: Pack the rolled dolma tightly into the pot in a single layer in concentric circles, then stack additional layers on top. Pour the lemon juice and 1.5 cups of water over them. Place a heavy plate on top of the dolma to weigh them down during cooking. Cover the pot.","Step 5: The Finish. Bring to a boil, then reduce to very low heat and simmer for 45 to 55 minutes until the rice is fully cooked. To test, remove one dolma and cut it in half; the rice should be tender throughout. Let rest for 10 minutes before removing the plate. Serve at room temperature with yogurt and lemon wedges."],
          classifications: {"mealType":["dinner","appetizer","celebration"],"cookingMethods":["stuffing","steaming","simmering"]},
          elementalProperties: {"Fire":0.15,"Water":0.35,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Venus","Moon"],"signs":["taurus","cancer"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":320,"proteinG":14,"carbsG":42,"fatG":11,"fiberG":4,"sodiumMg":680,"sugarG":4,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"brined grape leaves","substituteOptions":["blanched Swiss chard leaves","blanched cabbage leaves"]},{"originalIngredient":"ground lamb","substituteOptions":["ground beef","omit and double the rice and herbs for vegan version"]}]
        },
        {
          name: "Shawarma",
          description: "The iconic street-food pillar of the Middle East. Thin slices of heavily marinated chicken or lamb are stacked onto a vertical spit and slow-roasted over radiant heat for hours, the rotating mass basting itself continuously in its own rendering fat. The outer crust crisps and caramelizes from the Maillard reaction while the interior remains moist and yielding. Shaved to order and wrapped in flatbread with garlic sauce and pickles, it is the perfect expression of Fire alchemy applied to protein.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":30,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"boneless chicken thighs","notes":"Skin-on preferred for fat self-basting; or use lamb shoulder."},{"amount":3,"unit":"tbsp","name":"shawarma spice blend","notes":"Cumin, coriander, turmeric, cinnamon, allspice, black pepper, and cardamom."},{"amount":0.5,"unit":"cup","name":"plain whole-milk yogurt","notes":"Tenderizes the protein through lactic acid."},{"amount":3,"unit":"tbsp","name":"extra virgin olive oil","notes":"Carries fat-soluble spice compounds into the meat."},{"amount":4,"unit":"cloves","name":"garlic","notes":"Minced to a paste."},{"amount":1,"unit":"whole","name":"lemon","notes":"Juiced; for acid balance and brightness."},{"amount":4,"unit":"pieces","name":"flatbread or pita","notes":"For serving."},{"amount":0.5,"unit":"cup","name":"garlic sauce (toum)","notes":"Lebanese-style emulsified garlic sauce."},{"amount":0.5,"unit":"cup","name":"pickled turnips","notes":"Vibrant pink, for acidity and crunch."}],
          instructions: ["Step 1: In a large bowl, combine the shawarma spice blend, yogurt, olive oil, garlic paste, and lemon juice into a thick marinade. Add the chicken thighs and coat every surface thoroughly. Refrigerate for a minimum of 4 hours, ideally overnight, to allow the lactic acid to denature the surface proteins.","Step 2: Remove the chicken from the marinade and allow it to come to room temperature for 30 minutes. Heat a cast iron grill pan or heavy skillet over high heat until it is visibly smoking.","Step 3: Sear the chicken thighs in batches, pressing them flat with a heavy weight if available, for 5 to 7 minutes per side. You want a deeply charred, nearly black crust on the outside while the interior remains juicy. The carbonized spice crust is non-negotiable.","Step 4: Let the cooked chicken rest for 5 minutes. Then slice it thinly against the grain using a sharp knife in short, rapid strokes, shaving it as thin as possible to mimic the spit-shaved experience.","Step 5: The Finish. Warm the flatbread until it is pliable. Spread a generous layer of toum garlic sauce. Pile the shaved, crispy chicken slices in the center. Add pickled turnips, tomato slices, and fresh parsley. Roll tightly and serve immediately."],
          classifications: {"mealType":["dinner","lunch","street food"],"cookingMethods":["grilling","marinating","searing"]},
          elementalProperties: {"Fire":0.45,"Water":0.2,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":580,"proteinG":42,"carbsG":38,"fatG":28,"fiberG":3,"sodiumMg":890,"sugarG":4,"vitamins":["Niacin","Vitamin B6"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"chicken thighs","substituteOptions":["lamb shoulder","cauliflower steaks for vegan version"]},{"originalIngredient":"garlic sauce (toum)","substituteOptions":["tahini sauce","hummus"]}]
        },
        {
          name: "Kofta Kebab",
          description: "The elemental transformation of ground meat through fire. A blend of fatty lamb and beef is combined with raw grated onion, whose cellular moisture steams the interior as the outside chars aggressively on the grill. Fresh herbs and warm spices create a complex aromatic matrix. The kofta must contain enough fat to remain juicy under the violent heat of a live-coal fire. The elongated shape along the flat metal skewer maximizes surface area exposed to the inferno.",
          details: {"cuisine":"Middle Eastern","prepTimeMinutes":25,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"ground lamb","notes":"At least 20% fat content; lean lamb will produce dry kofta."},{"amount":0.5,"unit":"lb","name":"ground beef","notes":"80/20 blend for additional fat."},{"amount":1,"unit":"medium","name":"onion","notes":"Grated on the fine side of a box grater; excess liquid squeezed out."},{"amount":0.25,"unit":"cup","name":"fresh parsley","notes":"Very finely chopped."},{"amount":2,"unit":"tsp","name":"ground cumin","notes":"Freshly ground if possible."},{"amount":1,"unit":"tsp","name":"ground coriander","notes":"Complementary warm spice."},{"amount":1,"unit":"tsp","name":"allspice","notes":"Essential Middle Eastern aromatic."},{"amount":0.5,"unit":"tsp","name":"ground cinnamon","notes":"Subtle warmth."},{"amount":1,"unit":"tsp","name":"fine sea salt","notes":"For seasoning throughout."},{"amount":0.5,"unit":"tsp","name":"black pepper","notes":"Freshly ground."}],
          instructions: ["Step 1: In a large bowl, combine the ground lamb, ground beef, grated onion with excess moisture squeezed out, finely chopped parsley, cumin, coriander, allspice, cinnamon, salt, and black pepper. Using your hands, knead and squeeze the mixture aggressively for 3 to 5 minutes until it becomes sticky and homogeneous. This develops the myosin proteins that bind the kofta to the skewer.","Step 2: Refrigerate the kofta mixture for at least 30 minutes to allow the fat to firm up, which makes shaping easier and prevents the kofta from sliding off the skewer during grilling.","Step 3: Prepare a grill or grill pan and heat it until smoking hot. If using charcoal, wait until the coals are glowing white-hot with no visible flames.","Step 4: Wet your hands with cold water. Take a portion of the meat mixture (about the size of a large egg) and mold it firmly around a flat metal skewer, pressing and squeezing to form a long, torpedo shape approximately 1 inch in diameter. The meat should grip the skewer tightly.","Step 5: The Finish. Grill the kofta kebabs directly over maximum heat for 3 to 4 minutes per side, turning only once, until deeply charred on the outside and just cooked through. Serve immediately with flatbread, tomatoes, onions, fresh parsley, and a generous drizzle of tahini sauce."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["grilling","charcoal-grilling"]},
          elementalProperties: {"Fire":0.5,"Water":0.15,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":520,"proteinG":38,"carbsG":5,"fatG":38,"fiberG":1,"sodiumMg":720,"sugarG":2,"vitamins":["Niacin","Vitamin B12"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"ground lamb","substituteOptions":["ground beef only","ground turkey (lower fat, add olive oil)"]},{"originalIngredient":"allspice","substituteOptions":["baharat spice blend","equal parts cinnamon and nutmeg"]}]
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
