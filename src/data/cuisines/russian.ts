// src/data/cuisines/russian.ts
import type { Cuisine } from "@/types/cuisine";

export const russian: Cuisine = {
  id: "russian",
  name: "Russian",
  description:
    "Traditional Russian cuisine emphasizing hearty dishes, fermented foods, and preserved ingredients",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Russian Syrniki",
          "description": "Traditional Eastern European farmer's cheese pancakes. These are delicate, pillowy, and slightly tangy from the lactic acid of the tvorog. Structurally, they walk the line between a pancake and a cheesecake, offering a comforting, grounding energy deeply tied to agrarian dairy traditions.",
          "details": {
            "cuisine": "Russian",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all",
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "tvorog (farmer's cheese)",
              "notes": "Must be dry. If wet, wrap in cheesecloth and squeeze out excess moisture, otherwise the dough will require too much flour and become heavy."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten. Acts as the primary binder."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "granulated sugar",
              "notes": "Adjust based on desired sweetness, but traditional syrniki are only mildly sweet."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Essential to balance the sweetness and enhance the cheese flavor."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "pure vanilla extract",
              "notes": "Adds a warming, aromatic depth."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "all-purpose flour",
              "notes": "For the dough. Use as little as possible to keep them light and fluffy."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "all-purpose flour",
              "notes": "Reserved for dredging the outside of the pancakes before frying."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "clarified butter (ghee) or neutral oil",
              "notes": "For pan-frying to a crisp golden brown."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "smetana (sour cream)",
              "notes": "For serving."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "berry preserves or jam",
              "notes": "Sour cherry or raspberry is traditional."
            }
          ],
          "instructions": [
            "Step 1: Prepare the tvorog. Pass the farmer's cheese through a fine-mesh sieve or mash it thoroughly with a fork until smooth and free of large curds. If the cheese is overly moist, wring it out in a clean kitchen towel first.",
            "Step 2: In a large mixing bowl, combine the smoothed tvorog, lightly beaten eggs, granulated sugar, salt, and vanilla extract. Mix until uniformly incorporated.",
            "Step 3: Gradually fold the 4 tablespoons of flour into the cheese mixture. The resulting dough should be sticky but hold its shape. Over-mixing or adding too much flour will yield dense, rubbery syrniki.",
            "Step 4: Scatter the remaining 1/4 cup of flour onto a clean work surface or large plate.",
            "Step 5: Using lightly floured hands, scoop out roughly 2 tablespoons of dough at a time. Roll into a ball, drop it into the dredging flour, and gently flatten it into a thick medallion (about 1/2-inch thick). Tap off any excess flour.",
            "Step 6: Heat a large, heavy-bottomed skillet over medium-low heat. Add the clarified butter or neutral oil.",
            "Step 7: Once the oil is shimmering, carefully place the syrniki in the pan, working in batches to avoid crowding. Fry for 3 to 4 minutes on the first side until a deep golden-brown crust forms.",
            "Step 8: Carefully flip the syrniki with a thin spatula and fry for another 3 to 4 minutes on the second side. The centers should be set and piping hot.",
            "Step 9: Transfer the cooked syrniki to a paper towel-lined plate to drain briefly.",
            "Step 10: Serve immediately while hot, topped generously with cold smetana (sour cream) and a spoonful of berry preserves."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "dessert",
              "brunch"
            ],
            "cookingMethods": [
              "mixing",
              "pan-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.3,
            "Earth": 0.4,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus",
              "Moon"
            ],
            "signs": [
              "Taurus",
              "Cancer"
            ],
            "lunarPhases": [
              "Full Moon",
              "Waxing Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 22,
            "carbsG": 35,
            "fatG": 18,
            "fiberG": 1,
              "sodiumMg": 258,
              "sugarG": 7,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "tvorog (farmer's cheese)",
              "substituteOptions": [
                "dry ricotta cheese",
                "drained firm tofu (vegan)",
                "cottage cheese (strained overnight)"
              ]
            },
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "flax egg (vegan)",
                "applesauce binder"
              ]
            },
            {
              "originalIngredient": "all-purpose flour",
              "substituteOptions": [
                "rice flour",
                "gluten-free baking blend",
                "semolina flour"
              ]
            },
            {
              "originalIngredient": "smetana (sour cream)",
              "substituteOptions": [
                "creme fraiche",
                "coconut yogurt (vegan)"
              ]
            }
          ]
        },
        {
          name: "Kasha",
          description: "The primordial staple of Russian existence. Buckwheat groats are aggressively toasted to seal their structure before being steamed, resulting in separated, fiercely earthy grains dressed heavily in butter.",
          details: {"cuisine":"Russian","prepTimeMinutes":5,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"None","season":["winter","autumn"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Buckwheat groats","notes":"Roasted (grechka)."},{"amount":1,"unit":"large","name":"Egg","notes":"Optional, used historically to coat grains before boiling."},{"amount":2,"unit":"cups","name":"Water or broth","notes":"Boiling."},{"amount":4,"unit":"tbsp","name":"Butter","notes":"Unsalted, added aggressively at the end."},{"amount":1,"unit":"tsp","name":"Salt","notes":"Kosher."}],
          instructions: ["Step 1: The Toast. Place the dry buckwheat groats in a heavy skillet over high heat. Stir continuously until they emit a highly fragrant, nutty aroma. This prevents them from turning into mush during boiling.","Step 2: The Egg Matrix (Optional). Remove from heat and stir a beaten egg violently into the hot grains, coating them completely, then return to heat to dry the egg. This ancient technique guarantees individual, fluffy grains.","Step 3: The Steam. Pour the boiling water or broth over the hot buckwheat (it will spit violently). Add salt.","Step 4: The Submersion. Cover the pot with a tight-fitting lid, reduce the heat to the absolute minimum, and do not disturb it for 15-20 minutes until all liquid is absorbed.","Step 5: The Buttering. Remove from heat. Bury the massive pats of butter into the hot grains. Cover and let sit for 5 minutes, then fluff with a fork. It should be rich, separate, and earthy."],
          classifications: {"mealType":["breakfast","side","comfort"],"cookingMethods":["toasting","steaming"]},
          elementalProperties: {"Fire":0.15,"Water":0.2,"Earth":0.6,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Ceres"],"signs":["capricorn","virgo"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":280,"proteinG":6,"carbsG":32,"fatG":14,"fiberG":4,"sodiumMg":500,"sugarG":1,"vitamins":["Niacin","Riboflavin"],"minerals":["Magnesium","Zinc"]},
          substitutions: [{"originalIngredient":"Buckwheat","substituteOptions":["Millet","Oats"]}]
        },
        {
          "name": "Authentic Blini",
          "description": "Pre-dating Christianity, Blini symbolize the sun.",
          "details": {
            "cuisine": "Russian",
            "prepTimeMinutes": 180,
            "cookTimeMinutes": 30,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "For the sponge."
            }
          ],
          "instructions": [
            "Step 1: Make sponge.",
            "Step 2: Rise dough.",
            "Step 3: Scald with boiling water.",
            "Step 4: Fry."
          ],
          "classifications": {
            "mealType": [
              "breakfast"
            ],
            "cookingMethods": [
              "frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.25,
            "Earth": 0.35,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Sun"
            ],
            "signs": [
              "Leo"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 9,
            "carbsG": 42,
            "fatG": 12,
            "fiberG": 2,
              "sodiumMg": 493,
              "sugarG": 12,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Oladi",
          description: "Thick, highly aerated Russian kefir pancakes. The extreme acidity of the kefir reacts violently with baking soda, producing a fluffy, sponge-like interior protected by a crisp, heavily fried exterior.",
          details: {"cuisine":"Russian","prepTimeMinutes":10,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Kefir","notes":"Must be room temperature or slightly warm for maximum reaction."},{"amount":1,"unit":"large","name":"Egg","notes":"Room temperature."},{"amount":2,"unit":"tbsp","name":"Sugar","notes":"For slight sweetness and browning."},{"amount":0.5,"unit":"tsp","name":"Salt","notes":"Flavor balance."},{"amount":2,"unit":"cups","name":"All-purpose flour","notes":"For structure."},{"amount":1,"unit":"tsp","name":"Baking soda","notes":"The catalyst."},{"amount":0.25,"unit":"cup","name":"Neutral oil","notes":"For shallow frying."}],
          instructions: ["Step 1: The Acid Base. In a bowl, whisk the room temperature kefir, egg, sugar, and salt.","Step 2: The Catalyst. Sift the flour and baking soda directly over the wet ingredients. Gently fold the mixture together. Do not overmix; the batter should be thick, lumpy, and immediately start bubbling violently as the acid reacts with the base.","Step 3: The Rest. Let the highly active batter sit entirely undisturbed for 10 minutes to allow the bubbles to stabilize. Do not stir it again.","Step 4: The Fry. Heat a generous layer of oil in a heavy skillet over medium heat. Gently spoon the foamy batter into the pan. Do not flatten them.","Step 5: The Flip. Fry until the bottoms are deeply golden brown and bubbles burst on the surface (about 2-3 minutes). Flip carefully and fry the other side. Serve immediately with sour cream (smetana) and jam."],
          classifications: {"mealType":["breakfast","snack"],"cookingMethods":["shallow frying","chemical leavening"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.15,"Air":0.35},
          astrologicalAffinities: {"planets":["Moon","Uranus"],"signs":["cancer","aquarius"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":350,"proteinG":10,"carbsG":48,"fatG":12,"fiberG":2,"sodiumMg":600,"sugarG":8,"vitamins":["Vitamin D","Riboflavin"],"minerals":["Calcium","Phosphorus"]},
          substitutions: [{"originalIngredient":"Kefir","substituteOptions":["Buttermilk","Plain yogurt thinned with water"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Traditional Borscht",
          "description": "A foundational Slavic root-vegetable soup, instantly recognizable by its deep, resonant magenta hue.",
          "details": {
            "cuisine": "Russian",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 150,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "beef soup bones",
              "notes": "For stock."
            },
            {
              "amount": 3,
              "unit": "medium",
              "name": "beets",
              "notes": "Julienned."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "white vinegar",
              "notes": "Preserves red color."
            }
          ],
          "instructions": [
            "Step 1: Make beef bone broth.",
            "Step 2: Prepare zazharka (sautéed onions, carrots).",
            "Step 3: Sauté beets with vinegar and sugar.",
            "Step 4: Simmer potatoes and cabbage in broth.",
            "Step 5: Add zazharka to broth, simmer briefly.",
            "Step 6: Add fresh dill and garlic off heat. Serve with sour cream."
          ],
          "classifications": {
            "mealType": [
              "soup"
            ],
            "cookingMethods": [
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.5,
            "Earth": 0.35,
            "Air": 0.05
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn"
            ],
            "signs": [
              "Capricorn"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 18,
            "carbsG": 28,
            "fatG": 15,
            "fiberG": 6,
              "sodiumMg": 1067,
              "sugarG": 3,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "beef bones",
              "substituteOptions": [
                "mushroom broth"
              ]
            }
          ]
        },
        {
          name: "Pelmeni",
          description: "The frozen survival food of Siberia. Small, ear-shaped dumplings encapsulating a raw, highly seasoned matrix of minced pork and beef, boiled rapidly to trap the rendered juices inside the unleavened dough shell.",
          details: {"cuisine":"Russian","prepTimeMinutes":60,"cookTimeMinutes":10,"baseServingSize":4,"spiceLevel":"Mild","season":["winter"]},
          ingredients: [{"amount":3,"unit":"cups","name":"All-purpose flour","notes":"For the unleavened dough."},{"amount":1,"unit":"cup","name":"Water","notes":"Cold."},{"amount":1,"unit":"large","name":"Egg","notes":"For dough strength."},{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"Fatty."},{"amount":0.5,"unit":"lb","name":"Ground beef","notes":"Lean."},{"amount":1,"unit":"large","name":"Onion","notes":"Grated entirely into a pulp, with juice."},{"amount":2,"unit":"tbsp","name":"Ice water","notes":"Mixed into the meat to create broth internally."}],
          instructions: ["Step 1: The Dough. Knead the flour, egg, water, and salt into a stiff, elastic dough. Wrap it in plastic and let it rest for 30 minutes to relax the gluten.","Step 2: The Core. Mix the ground pork, beef, heavily grated onion, salt, black pepper, and ice water. The ice water is critical; it turns to steam during boiling, creating a soup trapped inside the dumpling.","Step 3: The Architecture. Roll the dough extremely thin. Cut into 2-inch circles. Place a small marble of raw meat mixture in the center.","Step 4: The Seal. Fold the dough over into a half-moon, sealing the edges hermetically. Bring the two points of the half-moon together and pinch them to create the classic 'ear' shape.","Step 5: The Boil. Drop the pelmeni into heavily salted, rapidly boiling water with a bay leaf. Boil until they float to the top, then cook for exactly 3 more minutes. Serve instantly, heavily anointed with melted butter, sour cream, and black pepper."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["kneading","boiling","stuffing"]},
          elementalProperties: {"Fire":0.15,"Water":0.4,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Moon"],"signs":["capricorn","cancer"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":580,"proteinG":28,"carbsG":65,"fatG":22,"fiberG":3,"sodiumMg":850,"sugarG":2,"vitamins":["Iron","Thiamin"],"minerals":["Selenium","Zinc"]},
          substitutions: [{"originalIngredient":"Pork/beef mix","substituteOptions":["Mushroom and potato (Vareniki)"]}]
        },
        {
          name: "Shchi",
          description: "The sour cabbage soup that sustained empires. Its brilliance lies in the slow, prolonged stewing of fermented sauerkraut alongside fatty meat, resulting in an incredibly sharp, savory, and restorative broth.",
          details: {"cuisine":"Russian","prepTimeMinutes":15,"cookTimeMinutes":120,"baseServingSize":6,"spiceLevel":"None","season":["winter","autumn"]},
          ingredients: [{"amount":1.5,"unit":"lbs","name":"Beef chuck or pork ribs","notes":"Bone-in for marrow extraction."},{"amount":1,"unit":"lb","name":"Sauerkraut","notes":"Russian style, heavily sour. Do not rinse."},{"amount":2,"unit":"whole","name":"Potatoes","notes":"Diced."},{"amount":1,"unit":"whole","name":"Carrot","notes":"Grated."},{"amount":1,"unit":"whole","name":"Onion","notes":"Diced."},{"amount":2,"unit":"tbsp","name":"Tomato paste","notes":"For depth."},{"amount":1,"unit":"bunch","name":"Dill and parsley","notes":"For finishing."}],
          instructions: ["Step 1: The Broth. Place the bone-in meat in a large pot with cold water. Bring to a boil, skim the albumin foam aggressively, and simmer for 1.5 hours until the meat is falling apart. Remove the meat, chop it, and return it to the clear broth.","Step 2: The Searing of the Acid. In a separate skillet, sauté the onions and carrots until golden. Add the un-rinsed sauerkraut and tomato paste. Sauté aggressively for 10 minutes to caramelize the harsh edges of the lactic acid.","Step 3: The Fusion. Add the intensely sour, caramelized cabbage mixture to the boiling meat broth. Add the diced potatoes.","Step 4: The Stew. Simmer the soup for another 30-40 minutes until the potatoes are completely soft and beginning to break down into the broth.","Step 5: The Ripening. Shchi is famously better the next day. Let it cool, refrigerate, and reheat. Serve boiling hot, with a massive dollop of sour cream (smetana) and a piece of dense black rye bread."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["simmering","sautéing"]},
          elementalProperties: {"Fire":0.15,"Water":0.5,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Pluto","Saturn"],"signs":["scorpio","capricorn"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":350,"proteinG":25,"carbsG":22,"fatG":16,"fiberG":6,"sodiumMg":1100,"sugarG":5,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Iron","Potassium"]},
          substitutions: [{"originalIngredient":"Sauerkraut","substituteOptions":["Fresh cabbage (for Shchi iz svezhey kapusty)"]}]
        },
        {
          name: "Ukha",
          description: "An ancient, crystal-clear Russian fish soup. True Ukha relies on a specific sequence: making an initial broth from small, bony fish, straining it, and then poaching highly prized, large fish steaks in the fortified liquid.",
          details: {"cuisine":"Russian","prepTimeMinutes":20,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Small fish or fish heads/spines","notes":"For the initial stock extraction."},{"amount":1,"unit":"lb","name":"Prized fish","notes":"Salmon, sturgeon, or pike, cut into large steaks."},{"amount":3,"unit":"whole","name":"Potatoes","notes":"Cut into large cubes."},{"amount":1,"unit":"whole","name":"Onion","notes":"Left whole."},{"amount":1,"unit":"whole","name":"Carrot","notes":"Sliced."},{"amount":2,"unit":"leaves","name":"Bay leaf","notes":"Aromatic."},{"amount":1,"unit":"shot","name":"Vodka","notes":"Traditionally added at the very end to clarify the broth."}],
          instructions: ["Step 1: The Foundation. Place the fish heads, bones, or small fish in a pot with cold water, the whole onion, and peppercorns. Bring to a bare simmer. Skim meticulously. Cook for 30 minutes to extract the collagen and flavor.","Step 2: The Filtration. Strain the broth entirely through a fine mesh sieve. Discard the boiled bones and onion. Return the clear, fortified liquid to the pot.","Step 3: The Architecture. Add the potatoes, sliced carrots, and bay leaves to the clear broth. Simmer for 15 minutes until the potatoes are tender.","Step 4: The Poach. Carefully lay the large, prized fish steaks into the bubbling broth. Cook for exactly 7-10 minutes until the fish is just opaque. Do not stir violently; the fish must remain intact.","Step 5: The Clarification. Remove from heat. Pour in a single shot of high-quality vodka (which helps clarify the broth and remove any muddy taste). Cover and let rest for 5 minutes. Garnish heavily with fresh dill and serve."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","poaching"]},
          elementalProperties: {"Fire":0.1,"Water":0.7,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Neptune","Moon"],"signs":["pisces","cancer"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":320,"proteinG":35,"carbsG":25,"fatG":8,"fiberG":3,"sodiumMg":650,"sugarG":4,"vitamins":["Vitamin D","Vitamin B12"],"minerals":["Iodine","Selenium"]},
          substitutions: [{"originalIngredient":"Prized fish","substituteOptions":["Cod","Halibut"]}]
        },
      ],
      winter: [
        {
          name: "Solyanka",
          description: "The most intense soup in the Russian repertoire. A violently sour, salty, and smoky concoction made from a matrix of mixed cured meats, pickles, olives, capers, and lemon, built on a heavy beef broth.",
          details: {"cuisine":"Russian","prepTimeMinutes":20,"cookTimeMinutes":90,"baseServingSize":6,"spiceLevel":"Medium","season":["winter"]},
          ingredients: [{"amount":6,"unit":"cups","name":"Strong beef broth","notes":"Rich and dark."},{"amount":1,"unit":"lb","name":"Mixed cured meats","notes":"Smoked sausage, ham, bacon, kidney, chopped."},{"amount":1,"unit":"cup","name":"Dill pickles","notes":"Russian style, heavily brined, chopped."},{"amount":0.5,"unit":"cup","name":"Pickle brine","notes":"The liquid from the jar."},{"amount":0.5,"unit":"cup","name":"Black olives","notes":"Pitted and sliced."},{"amount":2,"unit":"tbsp","name":"Capers","notes":"Brined."},{"amount":2,"unit":"tbsp","name":"Tomato paste","notes":"For color and umami."},{"amount":1,"unit":"whole","name":"Lemon","notes":"Sliced into thin rounds."}],
          instructions: ["Step 1: The Searing of the Meats. In a heavy pot, violently sauté the chopped onions and the massive assortment of smoked and cured meats until their fat renders and they begin to crisp.","Step 2: The Red Acid. Add the tomato paste and chopped pickles. Sauté aggressively for 5 minutes until the tomato paste darkens and the pickles release their sharp aroma.","Step 3: The Broth. Pour in the strong beef broth and the highly acidic pickle brine. Bring to a fierce boil, then reduce to a simmer.","Step 4: The Brine Matrix. Add the sliced black olives and capers. Simmer for 15-20 minutes, allowing the immense salt, smoke, and acid to unify into a dark, complex liquid.","Step 5: The Finish. Serve boiling hot. Place a thin slice of fresh lemon and a massive spoonful of sour cream directly into each bowl. The contrast of the hot, smoky, sour broth against the cold dairy is essential."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["simmering","sautéing"]},
          elementalProperties: {"Fire":0.3,"Water":0.4,"Earth":0.2,"Air":0.1},
          astrologicalAffinities: {"planets":["Pluto","Mars"],"signs":["scorpio","aries"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":480,"proteinG":25,"carbsG":12,"fatG":36,"fiberG":3,"sodiumMg":1800,"sugarG":4,"vitamins":["Vitamin C","Niacin"],"minerals":["Sodium","Iron"]},
          substitutions: [{"originalIngredient":"Mixed cured meats","substituteOptions":["Mixed fish (for Fish Solyanka)","Wild mushrooms (for Mushroom Solyanka)"]}]
        },
      ],
    },
    dinner: {
      all: [
        {
          name: "Beef Stroganoff",
          description: "The aristocratic classic. Thin strips of tender beef are flash-seared at extreme temperatures, then folded into a rich, complex sauce built entirely on the emulsion of sour cream, mustard, and heavily caramelized onions.",
          details: {"cuisine":"Russian","prepTimeMinutes":15,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1.5,"unit":"lbs","name":"Beef tenderloin or sirloin","notes":"Must be a highly tender cut, sliced into thin strips across the grain."},{"amount":1,"unit":"large","name":"Onion","notes":"Sliced into thin half-moons."},{"amount":0.5,"unit":"lb","name":"Mushrooms","notes":"Cremini or button, sliced."},{"amount":2,"unit":"tbsp","name":"Butter","notes":"For searing."},{"amount":1,"unit":"cup","name":"Sour cream (Smetana)","notes":"Full fat."},{"amount":1,"unit":"tbsp","name":"Dijon mustard","notes":"For sharpness."},{"amount":1,"unit":"cup","name":"Beef broth","notes":"Strong."}],
          instructions: ["Step 1: The Flash Sear. Heat a cast-iron skillet to an extremely high temperature. Add butter. Sear the beef strips in small batches for no more than 60 seconds per side. They must be browned on the outside but entirely raw in the center. Remove the meat immediately to prevent toughening.","Step 2: The Caramelization. In the same pan, lower the heat and sauté the onions and mushrooms until deeply caramelized and all their water has evaporated.","Step 3: The Deglaze. Sprinkle a tablespoon of flour over the onions, stir, and immediately pour in the beef broth. Scrape the fond from the bottom of the pan. Simmer until it thickens into a glossy gravy.","Step 4: The Emulsion. Lower the heat to a bare whisper. Whisk the mustard and the massive volume of sour cream into the gravy. Do not let it boil, or the sour cream will curdle violently.","Step 5: The Integration. Return the rare beef strips and their resting juices to the warm sauce. Let them sit for just 2 minutes to heat through. Serve immediately over fried potatoes or egg noodles."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["searing","emulsifying"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Venus","Mars"],"signs":["taurus","leo"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":550,"proteinG":42,"carbsG":10,"fatG":38,"fiberG":2,"sodiumMg":650,"sugarG":4,"vitamins":["Vitamin B12","Riboflavin"],"minerals":["Zinc","Iron"]},
          substitutions: [{"originalIngredient":"Beef tenderloin","substituteOptions":["Portobello mushrooms (vegetarian)"]}]
        },
        {
          name: "Golubtsy",
          description: "Cabbage leaves blanched to pliability, encasing a structurally sound matrix of ground meat and rice, then braised for hours in a rich, acidic tomato-sour cream sauce until the cabbage completely surrenders.",
          details: {"cuisine":"Russian","prepTimeMinutes":45,"cookTimeMinutes":90,"baseServingSize":6,"spiceLevel":"None","season":["autumn","winter"]},
          ingredients: [{"amount":1,"unit":"head","name":"Green cabbage","notes":"Large, with pliable leaves."},{"amount":1,"unit":"lb","name":"Ground pork and beef mix","notes":"For the filling."},{"amount":0.5,"unit":"cup","name":"Rice","notes":"Parboiled."},{"amount":1,"unit":"large","name":"Onion","notes":"Grated or finely minced."},{"amount":1,"unit":"cup","name":"Tomato sauce or crushed tomatoes","notes":"For the braising liquid."},{"amount":0.5,"unit":"cup","name":"Sour cream","notes":"Whisked into the sauce."},{"amount":2,"unit":"cups","name":"Beef broth","notes":"For braising."}],
          instructions: ["Step 1: The Blanching. Core the cabbage entirely. Submerge the whole head in boiling water. As the outer leaves soften and turn bright green, peel them off one by one. Shave down the thick central vein of each leaf so it rolls easily.","Step 2: The Matrix. Mix the raw ground meat, parboiled rice, grated onion, salt, and pepper. The rice will absorb the fat and juices from the meat as it cooks, acting as an internal binder.","Step 3: The Architecture. Place a heavy scoop of the meat matrix at the base of a cabbage leaf. Roll it forward, tucking in the sides like an envelope, creating a tight, hermetically sealed cylinder.","Step 4: The Sauce. Whisk the tomato sauce, beef broth, and sour cream together.","Step 5: The Braise. Pack the golubtsy tightly, seam-side down, in a heavy Dutch oven. Pour the acidic, fatty sauce entirely over them. Cover and simmer gently on the stove or bake at 350°F (175°C) for 1.5 hours until the cabbage can be cut cleanly with a fork."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["blanching","stuffing","braising"]},
          elementalProperties: {"Fire":0.2,"Water":0.35,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Ceres"],"signs":["cancer","virgo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":22,"carbsG":28,"fatG":25,"fiberG":5,"sodiumMg":700,"sugarG":8,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Potassium","Iron"]},
          substitutions: [{"originalIngredient":"Pork/beef mix","substituteOptions":["Mushrooms and buckwheat (vegetarian)"]}]
        },
        {
          name: "Kotlety",
          description: "The definitive Russian pan-fried meat patty. The secret to their incredible juiciness lies in the inclusion of milk-soaked bread (panade) directly into the meat mixture, preventing the proteins from contracting during the aggressive frying process.",
          details: {"cuisine":"Russian","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Ground pork and beef","notes":"Mixed 50/50 for optimal fat content."},{"amount":2,"unit":"slices","name":"White bread","notes":"Crusts removed, stale is preferred."},{"amount":0.5,"unit":"cup","name":"Milk","notes":"To soak the bread."},{"amount":1,"unit":"large","name":"Onion","notes":"Grated into a pulp."},{"amount":1,"unit":"large","name":"Egg","notes":"For binding."},{"amount":0.5,"unit":"cup","name":"Breadcrumbs","notes":"For dredging."},{"amount":3,"unit":"tbsp","name":"Oil and butter","notes":"Mixed, for frying."}],
          instructions: ["Step 1: The Panade. Tear the white bread into pieces and submerge it in the milk. Let it soak for 10 minutes until it collapses into a mush. Squeeze out excess liquid lightly.","Step 2: The Emulsion. Combine the ground meats, the soaked bread mush, the grated onion pulp, the egg, salt, and pepper. Knead the mixture aggressively with your hands or slap it against the bowl until it becomes pale, sticky, and structurally unified.","Step 3: The Shape. Form the mixture into thick, oval patties. Dredge each patty very lightly in fine breadcrumbs.","Step 4: The Fry. Heat the oil and butter in a skillet over medium-high heat. Fry the kotlety until a dark, crisp crust forms on the bottom (about 4 minutes).","Step 5: The Steam. Flip the patties. Turn the heat to low, add a tiny splash of water to the pan, and immediately cover with a lid. Steam-fry for another 5 minutes to ensure the thick center cooks through while remaining violently juicy."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["mixing","pan-frying"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Venus"],"signs":["taurus","aries"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":480,"proteinG":28,"carbsG":18,"fatG":32,"fiberG":1,"sodiumMg":650,"sugarG":3,"vitamins":["Iron","Vitamin B12"],"minerals":["Zinc","Phosphorus"]},
          substitutions: [{"originalIngredient":"Ground pork/beef","substituteOptions":["Ground chicken","Ground turkey"]}]
        },
        {
          name: "Olivier Salad",
          description: "The cornerstone of Russian celebrations. A highly structured, meticulously diced amalgamation of root vegetables, meat, and pickles, suspended entirely in a heavy matrix of high-fat mayonnaise.",
          details: {"cuisine":"Russian","prepTimeMinutes":45,"cookTimeMinutes":30,"baseServingSize":8,"spiceLevel":"None","season":["celebration"]},
          ingredients: [{"amount":4,"unit":"whole","name":"Potatoes","notes":"Waxy, boiled in their skins, then peeled and perfectly diced."},{"amount":2,"unit":"whole","name":"Carrots","notes":"Boiled and perfectly diced."},{"amount":4,"unit":"large","name":"Eggs","notes":"Hard-boiled and diced."},{"amount":1,"unit":"lb","name":"Doctor's sausage or boiled chicken","notes":"Finely diced."},{"amount":4,"unit":"whole","name":"Dill pickles","notes":"Russian style, diced and squeezed of excess liquid."},{"amount":1,"unit":"cup","name":"Peas","notes":"Cooked."},{"amount":1,"unit":"cup","name":"Mayonnaise","notes":"High quality, full fat."}],
          instructions: ["Step 1: The Boiling. Boil the potatoes and carrots whole, in their skins. This prevents them from absorbing water and turning to mush. Let them cool entirely before peeling. Boil the eggs.","Step 2: The Precision Dice. The aesthetic and textural success of Olivier lies in the knife work. Dice the potatoes, carrots, eggs, sausage/chicken, and pickles into perfect, uniform 1/4-inch cubes.","Step 3: The Assembly. In a massive bowl, combine all the diced ingredients and the peas. Toss them gently.","Step 4: The Matrix. Fold in the massive volume of mayonnaise, ensuring every single cube is coated in the fat emulsion. Add a splash of pickle brine if it needs acidity.","Step 5: The Chilling. The salad must be pressed into a serving bowl and refrigerated for at least 4 hours, preferably overnight, to allow the starches to firm up and the flavors to unify. Serve cold."],
          classifications: {"mealType":["appetizer","side","celebration"],"cookingMethods":["boiling","chopping","mixing"]},
          elementalProperties: {"Fire":0.05,"Water":0.3,"Earth":0.5,"Air":0.15},
          astrologicalAffinities: {"planets":["Venus","Saturn"],"signs":["taurus","virgo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":14,"carbsG":25,"fatG":28,"fiberG":4,"sodiumMg":850,"sugarG":5,"vitamins":["Vitamin A","Vitamin C"],"minerals":["Potassium","Iron"]},
          substitutions: [{"originalIngredient":"Doctor's sausage","substituteOptions":["Boiled beef","Vegetarian sausage"]}]
        },
            {
              "name": "Authentic Ukrainian Borscht",
              "description": "The nutritional titan of Eastern Europe. A deeply layered vegetable soup built on a foundation of beef broth and fermented beet essence, balanced by the high fat content of sour cream and the sharp acid of lemon.",
              "details": {
                "cuisine": "Russian/Ukrainian",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 120,
                "baseServingSize": 6,
                "spiceLevel": "None",
                "season": [
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 3,
                  "unit": "large",
                  "name": "Beets",
                  "notes": "Grated and sautéed with acid to preserve color."
                },
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Beef shank",
                  "notes": "Bone-in."
                }
              ],
              "instructions": [
                "Step 1: Prepare a rich beef and bone broth.",
                "Step 2: Sauté beets with tomato paste and lemon juice.",
                "Step 3: Individually sauté carrots and onions (the 'zazharka').",
                "Step 4: Combine vegetables in the broth; simmer until tender.",
                "Step 5: Serve with a massive dollop of smetana and fresh dill."
              ],
              "classifications": {
                "mealType": [
                  "dinner",
                  "soup"
                ],
                "cookingMethods": [
                  "simmering",
                  "sautéing"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.5,
                "Earth": 0.3,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Pluto",
                  "Moon"
                ],
                "signs": [
                  "scorpio",
                  "cancer"
                ],
                "lunarPhases": [
                  "Waning Gibbous"
                ]
              },
              "nutritionPerServing": {
                "calories": 380,
                "proteinG": 28,
                "carbsG": 22,
                "fatG": 18,
                "fiberG": 6,
                "sodiumMg": 850,
                "sugarG": 12,
                "vitamins": [
                  "Vitamin C",
                  "Folate"
                ],
                "minerals": [
                  "Iron",
                  "Potassium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Blini",
              "description": "The sun-symbol of Slavic spring. Yeasted, aerated pancakes made with buckwheat and wheat flour, relying on a long fermentation to develop their characteristic 'holes' and slightly sour flavor, designed to be vessels for fat and brine.",
              "details": {
                "cuisine": "Russian",
                "prepTimeMinutes": 120,
                "cookTimeMinutes": 20,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "spring",
                  "Maslenitsa"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Buckwheat flour",
                  "notes": "For earthy depth."
                },
                {
                  "amount": 1,
                  "unit": "tbsp",
                  "name": "Active dry yeast",
                  "notes": "For aeration."
                }
              ],
              "instructions": [
                "Step 1: Prepare a yeasted sponge; let ferment for 1 hour.",
                "Step 2: Whisk in remaining flour, yolks, and warm milk.",
                "Step 3: Fold in stiffly beaten egg whites for extreme lightness.",
                "Step 4: Fry in a hot buttered skillet into large, paper-thin discs.",
                "Step 5: Brush each hot blin with melted butter immediately."
              ],
              "classifications": {
                "mealType": [
                  "breakfast",
                  "celebration"
                ],
                "cookingMethods": [
                  "fermenting",
                  "griddling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.25,
                "Water": 0.15,
                "Earth": 0.35,
                "Air": 0.25
              },
              "astrologicalAffinities": {
                "planets": [
                  "Sun",
                  "Venus"
                ],
                "signs": [
                  "leo",
                  "taurus"
                ],
                "lunarPhases": [
                  "New Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 350,
                "proteinG": 12,
                "carbsG": 45,
                "fatG": 14,
                "fiberG": 4,
                "sodiumMg": 450,
                "sugarG": 4,
                "vitamins": [
                  "Thiamin"
                ],
                "minerals": [
                  "Manganese",
                  "Selenium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Piroshki",
              "description": "The portable survival pockets of Russia. A soft, rich yeasted dough encapsulates a variety of fillings (meat, cabbage, or potato), then either deep-fried or baked until the structure is pillowy and golden.",
              "details": {
                "cuisine": "Russian",
                "prepTimeMinutes": 120,
                "cookTimeMinutes": 20,
                "baseServingSize": 6,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 3,
                  "unit": "cups",
                  "name": "All-purpose flour",
                  "notes": "Enriched dough."
                },
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Ground beef and onion",
                  "notes": "For the filling."
                }
              ],
              "instructions": [
                "Step 1: Knead an enriched yeast dough; let rise twice.",
                "Step 2: Prepare a dry filling of sautéed meat, cabbage, and egg.",
                "Step 3: Flatten dough circles; stuff and pinch into ovals.",
                "Step 4: Deep fry until golden or bake at 375°F.",
                "Step 5: Rest under a towel to soften the crust."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "snack"
                ],
                "cookingMethods": [
                  "baking",
                  "deep-frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.35,
                "Water": 0.1,
                "Earth": 0.4,
                "Air": 0.15
              },
              "astrologicalAffinities": {
                "planets": [
                  "Jupiter",
                  "Saturn"
                ],
                "signs": [
                  "sagittarius",
                  "capricorn"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 18,
                "carbsG": 48,
                "fatG": 22,
                "fiberG": 3,
                "sodiumMg": 650,
                "sugarG": 5,
                "vitamins": [
                  "Vitamin B12"
                ],
                "minerals": [
                  "Zinc",
                  "Iron"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Medovik",
              "description": "The 'Honey Cake' architectural titan. Eight to twelve layers of honey-infused biscuit are stacked with a tangy sour cream frosting, then rested for 24 hours until the layers structurally merge into a singular, melting texture.",
              "details": {
                "cuisine": "Russian",
                "prepTimeMinutes": 90,
                "cookTimeMinutes": 30,
                "baseServingSize": 12,
                "spiceLevel": "None",
                "season": [
                  "celebration"
                ]
              },
              "ingredients": [
                {
                  "amount": 0.5,
                  "unit": "cup",
                  "name": "Honey",
                  "notes": "Heated until dark amber."
                },
                {
                  "amount": 3,
                  "unit": "cups",
                  "name": "Sour cream",
                  "notes": "For the frosting."
                }
              ],
              "instructions": [
                "Step 1: Melt honey, sugar, and butter; stir in baking soda.",
                "Step 2: Roll out 10 paper-thin dough discs; bake for 5 mins each.",
                "Step 3: Frost each layer heavily with sweetened sour cream.",
                "Step 4: Coat the entire cake in crushed biscuit crumbs.",
                "Step 5: Rest in fridge for 24 hours (Mandatory structural step)."
              ],
              "classifications": {
                "mealType": [
                  "dessert"
                ],
                "cookingMethods": [
                  "baking",
                  "layering"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.3,
                "Earth": 0.4,
                "Air": 0.15
              },
              "astrologicalAffinities": {
                "planets": [
                  "Venus",
                  "Saturn"
                ],
                "signs": [
                  "taurus",
                  "capricorn"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 580,
                "proteinG": 8,
                "carbsG": 75,
                "fatG": 34,
                "fiberG": 1,
                "sodiumMg": 250,
                "sugarG": 52,
                "vitamins": [
                  "Vitamin A"
                ],
                "minerals": [
                  "Calcium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Syrniki",
              "description": "The dense, protein-heavy Slavic breakfast. Small, thick patties made from farmer's cheese (Tvorog) and minimal flour, pan-fried to a crisp exterior while the interior remains a soft, warm, slightly tart cheesecake.",
              "details": {
                "cuisine": "Russian",
                "prepTimeMinutes": 15,
                "cookTimeMinutes": 10,
                "baseServingSize": 2,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 500,
                  "unit": "g",
                  "name": "Tvorog (Farmer's Cheese)",
                  "notes": "Dry, curdled cheese."
                },
                {
                  "amount": 2,
                  "unit": "tbsp",
                  "name": "Semolina",
                  "notes": "For binding."
                }
              ],
              "instructions": [
                "Step 1: Mash tvorog until smooth; mix with egg and sugar.",
                "Step 2: Add semolina; let sit for 10 minutes to hydrate.",
                "Step 3: Form into thick, small discs; dredge in flour.",
                "Step 4: Pan-fry in butter over medium-low heat.",
                "Step 5: Serve hot with smetana and blackcurrant jam."
              ],
              "classifications": {
                "mealType": [
                  "breakfast",
                  "dessert"
                ],
                "cookingMethods": [
                  "pan-frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.25,
                "Water": 0.25,
                "Earth": 0.35,
                "Air": 0.15
              },
              "astrologicalAffinities": {
                "planets": [
                  "Moon",
                  "Venus"
                ],
                "signs": [
                  "cancer",
                  "taurus"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 380,
                "proteinG": 32,
                "carbsG": 25,
                "fatG": 18,
                "fiberG": 1,
                "sodiumMg": 150,
                "sugarG": 12,
                "vitamins": [
                  "Vitamin D",
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
      winter: [
        {
          name: "Zharkoe",
          description: "A profound alchemical execution of Zharkoe, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Zharkoe","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Zharkoe","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    dessert: {
      all: [
        {
          name: "Pashka",
          description: "A profound alchemical execution of Pashka, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Pashka","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Pashka","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Sochnik",
          description: "A profound alchemical execution of Sochnik, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Sochnik","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Sochnik","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Vareniki s Vishney",
          description: "A profound alchemical execution of Vareniki s Vishney, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Vareniki s Vishney","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Vareniki s Vishney","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Pryaniki",
          description: "A profound alchemical execution of Pryaniki, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Pryaniki","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Pryaniki","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      winter: [
        {
          name: "Pryaniki",
          description: "A profound alchemical execution of Pryaniki, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Pryaniki","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Pryaniki","substituteOptions":["Elemental equivalent"]}]
        },

        {
          name: "Pelmeni",
          description: "The frozen survival food of Siberia. Small, ear-shaped dumplings encapsulating a raw, highly seasoned matrix of minced pork and beef, boiled rapidly to trap the rendered juices inside the unleavened dough shell.",
          details: {"cuisine":"Russian","prepTimeMinutes":60,"cookTimeMinutes":10,"baseServingSize":4,"spiceLevel":"Mild","season":["winter"]},
          ingredients: [{"amount":3,"unit":"cups","name":"All-purpose flour","notes":"For the unleavened dough."},{"amount":1,"unit":"cup","name":"Water","notes":"Cold."},{"amount":1,"unit":"large","name":"Egg","notes":"For dough strength."},{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"Fatty."},{"amount":0.5,"unit":"lb","name":"Ground beef","notes":"Lean."},{"amount":1,"unit":"large","name":"Onion","notes":"Grated entirely into a pulp, with juice."},{"amount":2,"unit":"tbsp","name":"Ice water","notes":"Mixed into the meat to create broth internally."}],
          instructions: ["Step 1: The Dough. Knead the flour, egg, water, and salt into a stiff, elastic dough. Wrap it in plastic and let it rest for 30 minutes to relax the gluten.","Step 2: The Core. Mix the ground pork, beef, heavily grated onion, salt, black pepper, and ice water. The ice water is critical; it turns to steam during boiling, creating a soup trapped inside the dumpling.","Step 3: The Architecture. Roll the dough extremely thin. Cut into 2-inch circles. Place a small marble of raw meat mixture in the center.","Step 4: The Seal. Fold the dough over into a half-moon, sealing the edges hermetically. Bring the two points of the half-moon together and pinch them to create the classic 'ear' shape.","Step 5: The Boil. Drop the pelmeni into heavily salted, rapidly boiling water with a bay leaf. Boil until they float to the top, then cook for exactly 3 more minutes. Serve instantly, heavily anointed with melted butter, sour cream, and black pepper."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["kneading","boiling","stuffing"]},
          elementalProperties: {"Fire":0.15,"Water":0.4,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Moon"],"signs":["capricorn","cancer"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":580,"proteinG":28,"carbsG":65,"fatG":22,"fiberG":3,"sodiumMg":850,"sugarG":2,"vitamins":["Iron","Thiamin"],"minerals":["Selenium","Zinc"]},
          substitutions: [{"originalIngredient":"Pork/beef mix","substituteOptions":["Mushroom and potato (Vareniki)"]}]
        },
      ],
    },
  },
  traditionalSauces: {
    smetana: {
      name: "Smetana",
      description: "Cultured sour cream with rich texture and tangy flavor",
      base: "milk fat",
      keyIngredients: ["cream", "bacterial culture"],
      culinaryUses: [
        "soup topping",
        "sauce base",
        "baking ingredient",
        "dressing",
        "dollop on savory dishes",
      ],
      variants: [
        "Homestyle thick",
        "Commercial lighter",
        "Reduced fat",
        "Infused with herbs",
        "Fermented longer",
      ],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.2,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Moon", "Venus", "Cancer"],
      seasonality: "all",
      preparationNotes:
        "Traditionally fermented at room temperature for 24-48 hours to develop flavor and texture",
      technicalTips:
        "Use as a finishing touch, adding after cooking to preserve its probiotic properties",
    },
    adjika: {
      name: "Adjika",
      description: "Spicy pepper and herb paste from the Caucasus region",
      base: "hot peppers",
      keyIngredients: ["red peppers", "garlic", "herbs", "salt", "walnuts"],
      culinaryUses: [
        "meat marinade",
        "flavor enhancer",
        "bread spread",
        "vegetable seasoning",
        "stew base",
      ],
      variants: [
        "Abkhazian",
        "Georgian",
        "Russian style",
        "Green adjika",
        "Preserved version",
      ],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.2,
        Air: 0.1,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "summer preparation, year-round use",
      preparationNotes:
        "Traditionally ground with stone mortar and pestle, then fermented in clay pots",
      technicalTips: "Can be used raw or cooked intensity mellows with cooking",
    },
    khrenovina: {
      name: "Khrenovina",
      description: "Fiery horseradish and tomato sauce",
      base: "horseradish root",
      keyIngredients: ["horseradish", "tomatoes", "garlic", "salt", "sugar"],
      culinaryUses: [
        "cold meat accompaniment",
        "sandwich spread",
        "appetizer dip",
        "zakuski component",
        "sauce for fatty foods",
      ],
      variants: [
        "Siberian",
        "With beets",
        "Extra hot",
        "Tomato-forward",
        "With apples",
      ],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.2,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Saturn", "Scorpio"],
      seasonality: "made in autumn, consumed year-round",
      preparationNotes:
        "Often prepared during harvest season when horseradish is at its most pungent",
      technicalTips:
        "Grate horseradish in well-ventilated area or underwater to prevent eye irritation",
    },
    gribnoj_soys: {
      name: "Gribnoj Sous",
      description: "Rich mushroom sauce with sour cream base",
      base: "mushrooms",
      keyIngredients: [
        "forest mushrooms",
        "onions",
        "butter",
        "flour",
        "sour cream",
      ],
      culinaryUses: [
        "potato topping",
        "meat sauce",
        "dumpling accompaniment",
        "grain topping",
        "casserole base",
      ],
      variants: [
        "Wild mushroom",
        "White mushroom",
        "Creamy",
        "Clear stock version",
        "With wine",
      ],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.3,
        Air: 0.1,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Saturn", "Neptune", "Virgo"],
      seasonality: "autumn mushroom harvest, preserved for year-round use",
      preparationNotes:
        "Traditionally made with foraged wild mushrooms dried mushrooms are reconstituted in winter",
      technicalTips:
        "Brown mushrooms thoroughly to develop full umami flavor before adding liquids",
    },
    ikra: {
      name: "Ikra Baklazhanaya",
      description: "Smoky eggplant caviar spread",
      base: "eggplant",
      keyIngredients: [
        "eggplants",
        "tomatoes",
        "onions",
        "carrots",
        "garlic",
        "herbs",
      ],
      culinaryUses: [
        "bread spread",
        "appetizer",
        "side dish",
        "filling",
        "vegetable topping",
      ],
      variants: [
        "Odessa style",
        "Smoky style",
        "With peppers",
        "Chunky rustic",
        "Smooth pureed",
      ],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Venus", "Mars", "Taurus"],
      seasonality: "summer preparation, preserved for winter use",
      preparationNotes:
        "Traditional preparation involves roasting eggplants over open flame for smoky flavor",
      technicalTips:
        "Let flavors marry overnight for best taste, serve at room temperature",
    },
  },
  sauceRecommender: {
    forProtein: {
      beef: [
        "gribnoj sous",
        "smetana with dill",
        "mustard sauce",
        "horseradish",
        "black pepper sauce",
      ],
      pork: [
        "mustard sauce",
        "prune sauce",
        "apple-horseradish",
        "sour cherry sauce",
        "garlic sauce",
      ],
      poultry: [
        "sour cream sauce",
        "mushroom sauce",
        "cranberry sauce",
        "adjika marinade",
        "garlic butter",
      ],
      fish: [
        "ukha reduction",
        "sorrel sauce",
        "smetana with chives",
        "mustard-dill",
        "white wine sauce",
      ],
      game: [
        "lingonberry sauce",
        "juniper sauce",
        "sour cream with mushrooms",
        "blackcurrant sauce",
        "adjika",
      ],
    },
    forVegetable: {
      root: [
        "smetana",
        "brown butter",
        "dill sauce",
        "mushroom gravy",
        "beet sauce",
      ],
      leafy: [
        "smetana-garlic",
        "sunflower oil dressing",
        "mustard vinaigrette",
        "kvas reduction",
        "sour cream with herbs",
      ],
      mushroom: [
        "sour cream",
        "garlic butter",
        "dill sauce",
        "wine reduction",
        "walnut oil",
      ],
      pickled: [
        "honey drizzle",
        "sunflower oil",
        "mustard sauce",
        "smetana",
        "herb oil",
      ],
      preserved: [
        "horseradish cream",
        "mustard sauce",
        "herb oil",
        "garlic sauce",
        "sour cream",
      ],
    },
    forCookingMethod: {
      baking: [
        "smetana glaze",
        "egg wash",
        "honey glaze",
        "mushroom sauce",
        "garlic butter",
      ],
      boiling: [
        "butter with herbs",
        "sour cream",
        "mustard sauce",
        "vinegar reduction",
        "horseradish cream",
      ],
      frying: [
        "mushroom sauce",
        "garlic sauce",
        "adjika",
        "sour cream",
        "berry sauce",
      ],
      stewing: [
        "broth reduction",
        "sour cream finish",
        "dill sauce",
        "wine sauce",
        "tomato-pepper sauce",
      ],
      smoking: [
        "horseradish cream",
        "mustard sauce",
        "lingonberry sauce",
        "kvas reduction",
        "sour pickle sauce",
      ],
    },
    byAstrological: {
      Fire: [
        "adjika",
        "hot mustard",
        "pepper sauce",
        "horseradish cream",
        "spicy tomato",
      ],
      Earth: [
        "mushroom sauce",
        "potato sauce",
        "beet sauce",
        "dill-sour cream",
        "cabbage sauce",
      ],
      Water: [
        "fish sauce",
        "sorrel sauce",
        "sour cream",
        "kvass sauce",
        "berry sauce",
      ],
      Air: [
        "light herb oils",
        "vinaigrettes",
        "whipped smetana",
        "honey-herb dressing",
        "berry vinegar",
      ],
    },
    byRegion: {
      northern: [
        "mushroom sauce",
        "fish broth",
        "berry sauce",
        "herb butter",
        "sour milk sauce",
      ],
      southern: [
        "adjika",
        "tomato sauces",
        "garlic sauce",
        "herb oils",
        "fruit compotes",
      ],
      siberian: [
        "pine nut sauce",
        "game reductions",
        "sea buckthorn sauce",
        "wild herb oil",
        "cedar infusions",
      ],
      ural: [
        "mushroom gravy",
        "root vegetable sauce",
        "black pepper sauce",
        "honey-herb",
        "berry reductions",
      ],
      volga: [
        "fish sauce",
        "mustard sauce",
        "sour cream",
        "dill sauce",
        "horseradish cream",
      ],
    },
    byDietary: {
      vegetarian: [
        "mushroom sauce",
        "berry sauce",
        "herb oil",
        "smetana",
        "vegetable reductions",
      ],
      vegan: [
        "herb oil",
        "berry sauce",
        "kvass reduction",
        "mushroom broth",
        "vegetable purees",
      ],
      glutenFree: [
        "smetana",
        "herb butter",
        "berry sauce",
        "vegetable purees",
        "nut-based sauces",
      ],
      dairyFree: [
        "herb oil",
        "vegetable broth",
        "berry reduction",
        "kvass sauce",
        "tomato-based sauce",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Souring (Zakvaski)",
      description:
        "Traditional fermentation techniques for preserving vegetables, dairy, and grains",
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      toolsRequired: [
        "clay pots",
        "wooden tools",
        "brine",
        "glass jars",
        "weights",
      ],
      bestFor: ["cabbage", "cucumbers", "beets", "milk", "bread starter"],
      difficulty: "medium",
    },
    {
      name: "Russian Oven Cooking",
      description:
        "Slow cooking in traditional masonry stove that retains heat for extended periods",
      elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
      toolsRequired: [
        "pech (Russian oven)",
        "clay pots",
        "long wooden paddles",
        "cast iron pots",
      ],
      bestFor: ["stews", "porridges", "breads", "slow-roasted meats", "pies"],
      difficulty: "hard",
    },
    {
      name: "Solenije",
      description:
        "Salt preservation technique creating distinctive flavors different from fermentation",
      elementalProperties: { Earth: 0.5, Water: 0.3, Fire: 0.1, Air: 0.1 },
      toolsRequired: [
        "wooden barrels",
        "salt",
        "heavy weights",
        "herbs",
        "glass jars",
      ],
      bestFor: ["mushrooms", "vegetables", "fish", "pork fat", "herbs"],
      difficulty: "easy",
    },
    {
      name: "Smokehouse Methods",
      description:
        "Cold and hot smoking techniques for preserving fish, meat, and cheeses",
      elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
      toolsRequired: [
        "smoke house",
        "wood chips",
        "hooks",
        "racks",
        "temperature control",
      ],
      bestFor: ["fish", "game", "sausages", "pork fat", "cheese"],
      difficulty: "hard",
    },
    {
      name: "Томление (Tomlenie)",
      description:
        "Ultra-slow cooking/simmering method in covered pots to develop deep flavors",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "cast iron pot",
        "heat diffuser",
        "slow heat source",
        "wooden spoon",
      ],
      bestFor: [
        "porridges",
        "milk dishes",
        "stews",
        "root vegetables",
        "grains",
      ],
      difficulty: "medium",
    },
  ],
  regionalCuisines: {
    northern: {
      name: "Northern Russian Cuisine",
      description:
        "Fish-forward cuisine with berries, mushrooms, and hearty grains adapted to cold climate",
      signature: [
        "ukha",
        "pies with fish",
        "lingonberry dishes",
        "mushroom preparations",
        "grain porridges",
      ],
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Moon", "Saturn", "Pisces"],
      seasonality: "strongly seasonal with emphasis on preservation",
    },
    central: {
      name: "Central Russian Cuisine",
      description:
        "Classic Russian dishes with simple ingredients and traditional cooking methods",
      signature: ["shchi", "kasha", "olivier salad", "kotlety", "black bread"],
      elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Venus", "Taurus"],
      seasonality:
        "four distinct seasonal variations with preservation techniques",
    },
    siberian: {
      name: "Siberian Cuisine",
      description:
        "Hearty, calorie-rich food designed for extreme cold, featuring game and wild plants",
      signature: [
        "pelmeni",
        "stroganina",
        "cedar nuts",
        "game meats",
        "fish pie",
      ],
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Jupiter", "Capricorn"],
      seasonality: "short growing season with extensive preservation",
    },
    caucasian: {
      name: "Caucasian-Influenced Russian Cuisine",
      description:
        "Southern Russian cooking with strong influences from Georgia, Armenia, and Azerbaijan",
      signature: [
        "shashlik",
        "adjika",
        "khachapuri adaptations",
        "herb-forward dishes",
        "fruit preserves",
      ],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "longer growing season with more fresh produce",
    },
    volga: {
      name: "Volga Region Cuisine",
      description:
        "Diverse cuisine reflecting the multicultural Volga river basin with Tatar influences",
      signature: [
        "belish",
        "ukha",
        "river fish dishes",
        "pastries",
        "honey-based desserts",
      ],
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Jupiter", "Moon", "Cancer"],
      seasonality: "river-influenced with seasonal fishing patterns",
    },
  },
  elementalProperties: {
    Earth: 0.5,
    Water: 0.3,
    Fire: 0.1,
    Air: 0.1,
  },
};

export default russian;
