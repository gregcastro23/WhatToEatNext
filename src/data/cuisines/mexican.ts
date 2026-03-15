// src/data/cuisines/mexican.ts
export const mexican = {
  name: "Mexican",
  description:
    "Traditional Mexican cuisine featuring regional specialties, corn-based dishes, and diverse moles and salsas",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Huevos Rancheros",
          "description": "A robust, deeply flavorful Mexican breakfast historically served to rural farm workers (rancheros). It features lightly fried corn tortillas layered with refried black beans, sunny-side-up eggs, and smothered in a vibrant, slightly spicy roasted tomato and chili salsa. It perfectly balances the elemental fire of the salsa with the earthy sustenance of corn and beans.",
          "details": {
            "cuisine": "Mexican",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 25,
            "baseServingSize": 2,
            "spiceLevel": "Medium",
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
            "mealType": [
              "breakfast",
              "brunch"
            ],
            "cookingMethods": [
              "simmering",
              "frying",
              "blending",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.45,
            "Water": 0.15,
            "Earth": 0.35,
            "Air": 0.05
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
              "First Quarter",
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 20,
            "carbsG": 42,
            "fatG": 28,
            "fiberG": 12,
              "sodiumMg": 576,
              "sugarG": 4,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "tofu scramble (vegan)",
                "just egg"
              ]
            },
            {
              "originalIngredient": "refried black beans",
              "substituteOptions": [
                "refried pinto beans",
                "whole black beans"
              ]
            },
            {
              "originalIngredient": "queso fresco",
              "substituteOptions": [
                "mild feta cheese",
                "vegan cashew cheese crumbles"
              ]
            },
            {
              "originalIngredient": "pork lard / neutral oil",
              "substituteOptions": [
                "avocado oil",
                "canola oil"
              ]
            }
          ]
        },
        {
          "name": "Authentic Chilaquiles Verdes",
          "description": "A masterclass in textural transformation and zero-waste agrarian cooking.",
          "details": {
            "cuisine": "Mexican",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 25,
            "baseServingSize": 4,
            "spiceLevel": "Hot",
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
            "mealType": [
              "breakfast"
            ],
            "cookingMethods": [
              "frying",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.2,
            "Earth": 0.35,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Sun"
            ],
            "signs": [
              "Leo"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 450,
            "proteinG": 14,
            "carbsG": 45,
            "fatG": 26,
            "fiberG": 6,
              "sodiumMg": 677,
              "sugarG": 7,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "originalIngredient": "stale tortillas",
              "substituteOptions": [
                "thick tortilla chips"
              ]
            }
          ]
        },
        {
          name: "Molletes",
          description: "The structural brilliance of a Mexican open-faced sandwich. Bolillos are split, hollowed slightly, thickly plastered with refried beans, crowned with cheese, and broiled until the cheese bubbles fiercely and the edges of the bread become a shatteringly crisp barrier, topped with bright Pico de Gallo.",
          details: {"cuisine":"Mexican","prepTimeMinutes":10,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"whole","name":"Bolillo rolls","notes":"Or French bread; crusty exterior, soft interior."},{"amount":1,"unit":"cup","name":"Refried beans","notes":"Black or pinto, heated until highly spreadable."},{"amount":1.5,"unit":"cups","name":"Oaxaca or Monterey Jack cheese","notes":"Freshly grated; must melt exceptionally well."},{"amount":2,"unit":"tbsp","name":"Butter","notes":"Softened, for toasting."},{"amount":1,"unit":"cup","name":"Pico de Gallo","notes":"Freshly made: tomatoes, onion, cilantro, jalapeño, lime juice."}],
          instructions: ["Step 1: The Foundation. Slice the bolillo rolls completely in half horizontally. Scoop out a small trench of the soft interior crumb to create a structural 'boat' for the heavy toppings.","Step 2: The Toast. Spread the cut sides lightly with softened butter. Place under a broiler for 2-3 minutes until the surface is lightly toasted and rigid. This prevents the wet beans from making the bread soggy.","Step 3: The Plaster. Remove from the oven. Spread a thick, generous layer of the hot refried beans over the toasted surface, pushing it all the way to the crust edges.","Step 4: The Melt. Heap the grated cheese massively over the beans. Return to the broiler. Watch closely. Broil until the cheese is completely melted, bubbling violently, and developing spotty brown caramelization.","Step 5: The Contrast. Remove from the broiler. While the cheese is still molten, spoon the cold, highly acidic, and crunchy Pico de Gallo directly on top. The contrast of hot, fatty, and crunchy against cold, acidic, and fresh is the core identity of the dish."],
          classifications: {"mealType":["breakfast","lunch","snack"],"cookingMethods":["broiling","baking"]},
          elementalProperties: {"Fire":0.35,"Water":0.1,"Earth":0.4,"Air":0.15},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":580,"proteinG":24,"carbsG":62,"fatG":26,"fiberG":12,"sodiumMg":1100,"sugarG":5,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Calcium","Iron"]},
          substitutions: [{"originalIngredient":"Bolillo rolls","substituteOptions":["Baguette","Ciabatta"]}]
        },
        {
          name: "Enfrijoladas",
          description: "Corn tortillas submerged and softened in a rich, silken black bean purée, creating a structural fusion of earth and heat, crowned with sharp crema and crumbly cheese.",
          details: {"cuisine":"Mexican","prepTimeMinutes":10,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":6,"unit":"whole","name":"Corn tortillas","notes":"Slightly stale is best, lightly fried before dipping."},{"amount":2,"unit":"cups","name":"Black bean purée","notes":"Blended with onion, garlic, and epazote."},{"amount":0.5,"unit":"cup","name":"Queso fresco","notes":"Crumbled."},{"amount":0.25,"unit":"cup","name":"Crema Mexicana","notes":"Drizzled over the top."},{"amount":0.25,"unit":"cup","name":"White onion","notes":"Finely diced."}],
          instructions: ["Step 1: The Bean Matrix. In a deep skillet, simmer the black bean purée until it achieves a velvety, coats-the-spoon consistency.","Step 2: The Tortilla Prep. Briefly pass each corn tortilla through hot oil (just 5 seconds per side) to make them pliable but resistant to dissolving.","Step 3: The Submersion. Using tongs, submerge each tortilla entirely into the simmering bean purée.","Step 4: The Fold. Place the coated tortilla on a warm plate, fold it in half or into quarters.","Step 5: The Garnish. Pour extra bean purée over the top. Generously scatter the crumbled cheese, diced onion, and drizzle heavily with crema."],
          classifications: {"mealType":["breakfast","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.2,"Water":0.3,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Moon"],"signs":["capricorn","cancer"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":450,"proteinG":18,"carbsG":60,"fatG":16,"fiberG":14,"sodiumMg":700,"sugarG":4,"vitamins":["Folate","Calcium"],"minerals":["Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"Black bean purée","substituteOptions":["Pinto bean purée"]}]
        },
        {
          name: "Huevos Motuleños",
          description: "A towering, complex breakfast structure from the Yucatán. Crispy tortillas host perfectly fried eggs, bathed in a fiery tomato-habanero chiltomate sauce, contrasting with sweet plantains and savory ham.",
          details: {"cuisine":"Mexican","prepTimeMinutes":20,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":4,"unit":"whole","name":"Corn tortillas","notes":"Fried until crisp (tostadas)."},{"amount":4,"unit":"large","name":"Eggs","notes":"Fried sunny-side up."},{"amount":1.5,"unit":"cups","name":"Chiltomate sauce","notes":"Roasted tomatoes, onions, and habanero."},{"amount":0.5,"unit":"cup","name":"Refried black beans","notes":"For spreading."},{"amount":0.5,"unit":"cup","name":"Cooked ham","notes":"Diced."},{"amount":0.5,"unit":"cup","name":"Peas","notes":"Cooked."},{"amount":1,"unit":"whole","name":"Plantain","notes":"Fried until caramelized and sweet."},{"amount":0.25,"unit":"cup","name":"Queso fresco","notes":"Crumbled."}],
          instructions: ["Step 1: The Foundation. Spread a thick layer of hot refried black beans over two crispy tostadas per plate.","Step 2: The Eggs. Fry the eggs in hot oil until the whites are blistering and crisp, but the yolks remain liquid. Place one egg on each bean-coated tostada.","Step 3: The Bath. Pour the fiercely hot chiltomate sauce directly over the eggs, partially cooking the yolks with residual heat.","Step 4: The Inclusions. Scatter the diced ham and peas over the sauced eggs.","Step 5: The Contrast. Frame the plate with sweet, deeply caramelized fried plantains and top the eggs with crumbled queso fresco."],
          classifications: {"mealType":["breakfast","brunch"],"cookingMethods":["frying","simmering"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Mars"],"signs":["leo","aries"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":650,"proteinG":28,"carbsG":65,"fatG":32,"fiberG":12,"sodiumMg":1100,"sugarG":18,"vitamins":["Vitamin A","Vitamin C"],"minerals":["Potassium","Iron"]},
          substitutions: [{"originalIngredient":"Cooked ham","substituteOptions":["Roasted turkey","Omit for vegetarian"]}]
        },
      ],
      summer: [
        {
          name: "Licuado de Frutas",
          description: "An aerated, frothy, violently blended Mexican fruit smoothie. The inclusion of milk and oats turns it into a substantial, highly kinetic morning elixir.",
          details: {"cuisine":"Mexican","prepTimeMinutes":5,"cookTimeMinutes":0,"baseServingSize":2,"spiceLevel":"None","season":["summer","spring"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Cold milk","notes":"Whole milk for richness."},{"amount":1,"unit":"cup","name":"Fresh fruit","notes":"Banana, strawberry, or papaya."},{"amount":2,"unit":"tbsp","name":"Rolled oats","notes":"Provides thickness and sustained energy."},{"amount":1,"unit":"tbsp","name":"Honey or sugar","notes":"Adjust to fruit sweetness."},{"amount":1,"unit":"dash","name":"Vanilla extract","notes":"Aromatic enhancement."},{"amount":0.5,"unit":"cup","name":"Ice","notes":"Crucial for frothing."}],
          instructions: ["Step 1: The Chamber. Place the cold milk, chosen fruit, oats, honey, vanilla, and ice into a high-powered blender.","Step 2: The Vortex. Blend on the highest possible speed for 60-90 seconds. The extended blending time is required to pulverize the oats and incorporate a massive volume of air.","Step 3: The Pour. Serve immediately into tall chilled glasses. The drink should possess a thick, stable foam head."],
          classifications: {"mealType":["breakfast","beverage"],"cookingMethods":["blending"]},
          elementalProperties: {"Fire":0.05,"Water":0.5,"Earth":0.15,"Air":0.3},
          astrologicalAffinities: {"planets":["Moon","Mercury"],"signs":["cancer","gemini"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":220,"proteinG":9,"carbsG":38,"fatG":5,"fiberG":4,"sodiumMg":110,"sugarG":22,"vitamins":["Vitamin C","Calcium"],"minerals":["Potassium"]},
          substitutions: [{"originalIngredient":"Whole milk","substituteOptions":["Almond milk","Oat milk"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Caldo de Pollo",
          description: "A deeply restorative, crystal-clear chicken soup that extracts the absolute essence of the bird through slow simmering, fortified with large chunks of root vegetables, corn, and bright lime acid.",
          details: {"cuisine":"Mexican","prepTimeMinutes":15,"cookTimeMinutes":90,"baseServingSize":4,"spiceLevel":"None","season":["winter","autumn"]},
          ingredients: [{"amount":1,"unit":"whole","name":"Chicken","notes":"Cut into parts, bone-in, skin-on for gelatin extraction."},{"amount":10,"unit":"cups","name":"Water","notes":"Cold, to draw out impurities."},{"amount":2,"unit":"whole","name":"Carrots","notes":"Cut into massive chunks."},{"amount":2,"unit":"whole","name":"Potatoes","notes":"Cut into massive chunks."},{"amount":2,"unit":"ears","name":"Corn","notes":"Cut into 2-inch rounds."},{"amount":0.5,"unit":"head","name":"Cabbage","notes":"Cut into wedges."},{"amount":1,"unit":"bunch","name":"Cilantro","notes":"Stems and all."},{"amount":2,"unit":"whole","name":"Limes","notes":"For serving."}],
          instructions: ["Step 1: The Extraction. Place the chicken pieces in a massive pot and cover with cold water. Bring to a boil over medium heat, systematically skimming the albuminous scum that rises to the surface to ensure a crystal-clear broth.","Step 2: The Aromatic Base. Once skimmed, add half an onion, a head of garlic (halved), and salt. Reduce to a bare simmer. Cook for 45 minutes.","Step 3: The Root Matrix. Add the carrots and corn rounds. Simmer for 15 minutes.","Step 4: The Soft Additions. Add the potatoes and cabbage wedges. Simmer until the potatoes are tender but not dissolving (about 15 more minutes). Throw in the cilantro bunch in the last 5 minutes.","Step 5: The Serve. Serve in massive bowls, ensuring each person gets a piece of chicken, vegetables, and a piece of corn. Must be eaten with copious amounts of fresh lime juice squeezed in, raw chopped onion, and warm tortillas."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering"]},
          elementalProperties: {"Fire":0.15,"Water":0.6,"Earth":0.2,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Ceres"],"signs":["cancer","virgo"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":420,"proteinG":35,"carbsG":30,"fatG":18,"fiberG":6,"sodiumMg":850,"sugarG":6,"vitamins":["Vitamin A","Vitamin C"],"minerals":["Potassium","Phosphorus"]},
          substitutions: [{"originalIngredient":"Whole chicken","substituteOptions":["Beef shank (for Caldo de Res)"]}]
        },
      ],
      summer: [
        {
          name: "Aguachile",
          description: "The chemical triumph of raw seafood 'cooked' instantaneously in an intensely acidic, viciously spicy purée of lime juice, fresh chilies, and cilantro. It is electric, cold, and immediate.",
          details: {"cuisine":"Mexican","prepTimeMinutes":15,"cookTimeMinutes":0,"baseServingSize":2,"spiceLevel":"High","season":["summer"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Raw shrimp","notes":"Highest possible quality, peeled, deveined, and butterflied (mariposa)."},{"amount":1,"unit":"cup","name":"Fresh lime juice","notes":"Freshly squeezed, never bottled."},{"amount":3,"unit":"whole","name":"Serrano chilies","notes":"Adjust for terror level."},{"amount":1,"unit":"bunch","name":"Cilantro","notes":"Leaves and tender stems."},{"amount":0.5,"unit":"whole","name":"Red onion","notes":"Sliced paper-thin (julienne)."},{"amount":1,"unit":"whole","name":"Cucumber","notes":"Peeled, seeded, and cut into half-moons."},{"amount":1,"unit":"pinch","name":"Sea salt","notes":"Coarse."}],
          instructions: ["Step 1: The Acid Bath. Arrange the butterflied raw shrimp in a single layer on a shallow platter. Season aggressively with coarse sea salt.","Step 2: The Elixir. In a blender, combine the fresh lime juice, serrano chilies, and cilantro. Blend until completely smooth and fiercely green.","Step 3: The Denaturation. Pour the electric green chili-lime elixir directly over the raw shrimp. The acid will instantly begin denaturing the proteins, turning the shrimp opaque.","Step 4: The Geometry. Immediately scatter the paper-thin red onion and cucumber half-moons over the shrimp.","Step 5: The Rush. Do not let it sit like traditional ceviche. Aguachile is meant to be eaten immediately while the center of the shrimp is still slightly raw and snappy. Serve with crisp tostadas."],
          classifications: {"mealType":["appetizer","lunch"],"cookingMethods":["chemical denaturation"]},
          elementalProperties: {"Fire":0.5,"Water":0.4,"Earth":0.05,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Uranus"],"signs":["aries","aquarius"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":210,"proteinG":32,"carbsG":15,"fatG":2,"fiberG":3,"sodiumMg":950,"sugarG":5,"vitamins":["Vitamin C","Vitamin B12"],"minerals":["Selenium","Zinc"]},
          substitutions: [{"originalIngredient":"Raw shrimp","substituteOptions":["Scallops","Cauliflower (for vegan)"]}]
        },
      ],
      winter: [
        {
          "name": "Authentic Pozole Rojo",
          "description": "A pre-Columbian ceremonial stew rooted in the deep earthiness of nixtamalized corn.",
          "details": {
            "cuisine": "Mexican",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 180,
            "baseServingSize": 8,
            "spiceLevel": "Medium-Hot",
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
            "mealType": [
              "soup"
            ],
            "cookingMethods": [
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.35,
            "Earth": 0.25,
            "Air": 0.05
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Scorpio"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 520,
            "proteinG": 38,
            "carbsG": 45,
            "fatG": 20,
            "fiberG": 8,
              "sodiumMg": 521,
              "sugarG": 10,
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
          description: "The zenith of Mexican alchemical cooking. A sauce containing over twenty ingredients—dried chilies, nuts, seeds, spices, and chocolate—each individually toasted, fried, and ground, before being stewed into a thick, impossibly complex dark matter.",
          details: {"cuisine":"Mexican","prepTimeMinutes":120,"cookTimeMinutes":180,"baseServingSize":8,"spiceLevel":"Medium","season":["winter","autumn"]},
          ingredients: [{"amount":6,"unit":"whole","name":"Ancho chilies","notes":"Stemmed and seeded."},{"amount":4,"unit":"whole","name":"Pasilla chilies","notes":"Stemmed and seeded."},{"amount":4,"unit":"whole","name":"Mulato chilies","notes":"Stemmed and seeded."},{"amount":0.5,"unit":"cup","name":"Almonds, pecans, and sesame seeds","notes":"Mixed."},{"amount":0.25,"unit":"cup","name":"Raisins","notes":"Plumped."},{"amount":1,"unit":"whole","name":"Plantain","notes":"Fried."},{"amount":2,"unit":"whole","name":"Tomatoes","notes":"Roasted."},{"amount":1,"unit":"tablet","name":"Mexican chocolate","notes":"Such as Ibarra or Abuelita."},{"amount":1,"unit":"pinch","name":"Cinnamon, clove, anise, coriander","notes":"Whole, toasted."},{"amount":6,"unit":"cups","name":"Rich chicken broth","notes":"For thinning."},{"amount":1,"unit":"whole","name":"Poached chicken or turkey","notes":"For serving."}],
          instructions: ["Step 1: The Chili Roasting. Briefly fry the dried chilies in hot lard or oil for just seconds until fragrant but not burnt. Transfer to a bowl of hot water to rehydrate for 30 minutes.","Step 2: The Searing of the Earth. In the same fat, individually fry the nuts, seeds, raisins, plantains, onions, garlic, and tortilla/bread (for thickening) until deeply golden. Remove each ingredient as it finishes.","Step 3: The Grind. Grind the toasted spices. In a powerful blender, blend the rehydrated chilies, the fried nuts/fruit/bread mixture, and the roasted tomatoes with enough chicken broth to form a thick, smooth paste.","Step 4: The Crucible. Heat a heavy cazuela or pot. Pour the massive volume of purée into the hot pot (it will sizzle and spit violently). Stir constantly, frying the paste until it darkens significantly and reduces (about 30 mins).","Step 5: The Synthesis. Gradually whisk in the remaining chicken broth until it reaches a velvety, flowing consistency. Add the Mexican chocolate and simmer on lowest heat for at least 2 hours, allowing the harsh edges of the chilies and spices to round off into a singular, unified profile. Serve over poached chicken with sesame seeds."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["toasting","frying","blending","stewing"]},
          elementalProperties: {"Fire":0.3,"Water":0.2,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Pluto","Saturn"],"signs":["scorpio","capricorn"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":680,"proteinG":45,"carbsG":42,"fatG":38,"fiberG":12,"sodiumMg":850,"sugarG":15,"vitamins":["Vitamin A","Iron"],"minerals":["Magnesium","Zinc"]},
          substitutions: [{"originalIngredient":"Poached chicken","substituteOptions":["Turkey","Enchilada filling"]}]
        },
        {
          name: "Chiles en Nogada",
          description: "A triumph of Mexican independence and visual aesthetics. Roasted poblano peppers stuffed with a complex sweet-and-savory pork picadillo, smothered in an ivory walnut cream sauce, and jeweled with ruby pomegranate seeds.",
          details: {"cuisine":"Mexican","prepTimeMinutes":90,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"Mild","season":["autumn"]},
          ingredients: [{"amount":4,"unit":"whole","name":"Poblano peppers","notes":"Large, roasted, peeled, and deseeded."},{"amount":1,"unit":"lb","name":"Ground pork and beef","notes":"Mixed."},{"amount":0.5,"unit":"cup","name":"Apples, peaches, and pears","notes":"Diced."},{"amount":0.25,"unit":"cup","name":"Raisins and almonds","notes":"Chopped."},{"amount":1.5,"unit":"cups","name":"Fresh walnuts","notes":"Peeled (the papery skin removed to prevent bitterness)."},{"amount":0.5,"unit":"cup","name":"Crema or milk","notes":"For the sauce."},{"amount":0.25,"unit":"cup","name":"Goat cheese or queso fresco","notes":"For the sauce."},{"amount":1,"unit":"whole","name":"Pomegranate","notes":"Arils extracted."},{"amount":0.5,"unit":"cup","name":"Parsley","notes":"Chopped."}],
          instructions: ["Step 1: The Picadillo. Sauté the ground meat with onions and garlic. Add the diced fruits, raisins, almonds, and warm spices (cinnamon, clove). Simmer until the meat is browned and the fruit has softened, creating a dense, sweet-savory matrix.","Step 2: The Nogada (Walnut Sauce). In a blender, combine the peeled fresh walnuts, crema, cheese, a pinch of sugar, and a splash of sherry or milk. Blend until flawlessly smooth and ivory white. The sauce must be served at room temperature or slightly chilled.","Step 3: The Stuffing. Carefully stuff the roasted, peeled poblano peppers to the absolute brim with the warm picadillo. The peppers should look plump and structural.","Step 4: The Cloak. Place the stuffed peppers on a plate. Pour the thick walnut sauce entirely over the peppers, hiding the green beneath the white.","Step 5: The Flag. Garnish dramatically with the vibrant red pomegranate seeds and bright green parsley, completing the colors of the Mexican flag. Serve immediately."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["roasting","sautéing","blending"]},
          elementalProperties: {"Fire":0.15,"Water":0.25,"Earth":0.4,"Air":0.2},
          astrologicalAffinities: {"planets":["Venus","Jupiter"],"signs":["libra","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":850,"proteinG":38,"carbsG":45,"fatG":58,"fiberG":8,"sodiumMg":650,"sugarG":28,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Copper","Manganese"]},
          substitutions: [{"originalIngredient":"Ground pork/beef","substituteOptions":["Lentils and mushrooms (vegetarian)"]}]
        },
        {
          name: "Cochinita Pibil",
          description: "The primal, slow-roasted masterpiece of the Yucatán. Pork shoulder marinated in highly acidic sour orange juice and earthy achiote paste, wrapped tightly in banana leaves, and cooked until it structurally collapses into brilliant red, hyper-tender shreds.",
          details: {"cuisine":"Mexican","prepTimeMinutes":30,"cookTimeMinutes":240,"baseServingSize":6,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":3,"unit":"lbs","name":"Pork shoulder","notes":"Cut into massive chunks."},{"amount":100,"unit":"g","name":"Achiote paste","notes":"Annatto seed paste; provides the deep red color."},{"amount":1,"unit":"cup","name":"Sour orange juice","notes":"Or a mix of orange, lime, and grapefruit juice."},{"amount":1,"unit":"tsp","name":"Allspice, clove, cumin","notes":"Ground."},{"amount":1,"unit":"package","name":"Banana leaves","notes":"Passed over an open flame to become pliable."},{"amount":1,"unit":"cup","name":"Pickled red onions","notes":"Thinly sliced, cured in lime juice and habanero."}],
          instructions: ["Step 1: The Blood Red Marinade. Dissolve the dense achiote paste in the sour orange juice. Add the ground spices, garlic, and a heavy dose of salt. Massage this vibrant red liquid aggressively into the pork chunks. Marinate overnight.","Step 2: The Leaf Matrix. Line a heavy roasting pan or Dutch oven completely with the softened banana leaves, leaving plenty of overhang to fold over the top.","Step 3: The Burial. Place the marinated pork and all the liquid into the banana leaf-lined pot. Fold the leaves over the top to completely seal the meat, trapping all moisture and infusing the pork with the tea-like aroma of the leaves.","Step 4: The Slow Fire. Cover tightly with a lid or foil. Bake at 325°F (165°C) for 3.5 to 4 hours. The connective tissues must completely dissolve.","Step 5: The Pull. Open the leaves. The pork should be fiercely red and fall apart at the touch. Shred it directly in its own juices. Serve immediately on tortillas, topped exclusively with the sharp, fiery pickled red onions."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["marinating","slow-roasting"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.4,"Air":0.05},
          astrologicalAffinities: {"planets":["Pluto","Sun"],"signs":["scorpio","leo"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":520,"proteinG":45,"carbsG":12,"fatG":32,"fiberG":3,"sodiumMg":850,"sugarG":6,"vitamins":["Vitamin C","Thiamin"],"minerals":["Iron","Zinc"]},
          substitutions: [{"originalIngredient":"Pork shoulder","substituteOptions":["Chicken (Pollo Pibil)","Jackfruit"]}]
        },
        {
          name: "Birria",
          description: "An intense, fatty, deeply spiced meat stew originating from Jalisco. traditionally goat or beef is braised for hours in a dark red chili broth (consomé), the rendered fat of which is then used to violently fry the tortillas for the accompanying tacos.",
          details: {"cuisine":"Mexican","prepTimeMinutes":30,"cookTimeMinutes":240,"baseServingSize":6,"spiceLevel":"High","season":["winter","all"]},
          ingredients: [{"amount":3,"unit":"lbs","name":"Beef chuck and short ribs","notes":"Or goat. Bone-in for the broth."},{"amount":5,"unit":"whole","name":"Guajillo chilies","notes":"Rehydrated."},{"amount":3,"unit":"whole","name":"Ancho chilies","notes":"Rehydrated."},{"amount":2,"unit":"whole","name":"Cascabel chilies","notes":"Rehydrated."},{"amount":1,"unit":"tsp","name":"Cinnamon, clove, cumin, oregano","notes":"Spices."},{"amount":0.5,"unit":"cup","name":"Apple cider vinegar","notes":"To break down the meat."},{"amount":1,"unit":"bunch","name":"Cilantro and diced onions","notes":"For garnish."},{"amount":12,"unit":"whole","name":"Corn tortillas","notes":"For dipping and frying."}],
          instructions: ["Step 1: The Adobo. Blend the rehydrated chilies, spices, vinegar, roasted tomatoes, garlic, and onion into a smooth, thick red paste.","Step 2: The Sear. Aggressively sear the massive cuts of meat in a heavy pot until deeply browned.","Step 3: The Braise. Pour the red adobo over the meat, cover with water or broth, and bring to a simmer. Cover and braise on low heat for 3-4 hours until the meat is entirely structurally compromised and floating in a rich, fat-capped broth (the consomé).","Step 4: The Extraction. Remove the meat and chop it. Crucially, skim the deeply red, chili-infused fat from the top of the simmering broth and reserve it.","Step 5: The Taco Assembly. Dip corn tortillas directly into the reserved red fat, place them on a blazing hot griddle, fill with chopped meat (and Oaxaca cheese for 'Quesabirria'), fold, and fry until shatteringly crisp. Serve with a cup of the boiling hot consomé for dipping."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["braising","frying"]},
          elementalProperties: {"Fire":0.45,"Water":0.35,"Earth":0.15,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Pluto"],"signs":["aries","scorpio"],"lunarPhases":["Last Quarter"]},
          nutritionPerServing: {"calories":750,"proteinG":55,"carbsG":25,"fatG":48,"fiberG":5,"sodiumMg":1200,"sugarG":4,"vitamins":["Vitamin B12","Iron"],"minerals":["Zinc","Phosphorus"]},
          substitutions: [{"originalIngredient":"Beef chuck","substituteOptions":["Goat","Lamb"]}]
        },
        {
          name: "Tamales Verdes",
          description: "The triumph of mesoamerican engineering. Nicxtamalized corn dough (masa), made extraordinarily light through the rigorous whipping of lard, encapsulates shredded chicken and bright green tomatillo salsa, all steamed inside a protective corn husk.",
          details: {"cuisine":"Mexican","prepTimeMinutes":60,"cookTimeMinutes":90,"baseServingSize":12,"spiceLevel":"Medium","season":["celebration","all"]},
          ingredients: [{"amount":4,"unit":"cups","name":"Masa harina","notes":"Nixtamalized corn flour."},{"amount":1.5,"unit":"cups","name":"Pork lard","notes":"Must be whipped; provides the fluffy texture."},{"amount":3,"unit":"cups","name":"Chicken broth","notes":"Warm, to hydrate the masa."},{"amount":1,"unit":"tsp","name":"Baking powder","notes":"For lift."},{"amount":2,"unit":"cups","name":"Shredded chicken","notes":"Cooked."},{"amount":2,"unit":"cups","name":"Salsa Verde","notes":"Tomatillo, jalapeño, cilantro purée."},{"amount":1,"unit":"package","name":"Dried corn husks","notes":"Soaked in hot water for 1 hour."}],
          instructions: ["Step 1: The Flotation Test. In a large bowl, violently whip the lard until it is aerated, white, and resembles buttercream. Slowly incorporate the masa harina, baking powder, and warm chicken broth. Beat continuously for 10-15 minutes. The masa is ready when a small ball dropped in water floats to the surface.","Step 2: The Filling. Toss the shredded cooked chicken in the vibrant, acidic salsa verde.","Step 3: The Smear. Take a soaked, pliable corn husk. Using the back of a spoon, spread a thin, even rectangle of the aerated masa onto the smooth side of the husk.","Step 4: The Core. Place a generous line of the chicken-salsa mixture down the center of the masa.","Step 5: The Fold and Steam. Fold the edges of the husk together so the masa completely encases the filling. Fold the narrow bottom tail up. Stand the tamales vertically, open-end up, in a massive steamer. Steam aggressively for 1.5 hours until the masa separates easily from the husk."],
          classifications: {"mealType":["breakfast","dinner","celebration"],"cookingMethods":["whipping","steaming"]},
          elementalProperties: {"Fire":0.1,"Water":0.3,"Earth":0.4,"Air":0.2},
          astrologicalAffinities: {"planets":["Ceres","Jupiter"],"signs":["virgo","cancer"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":350,"proteinG":12,"carbsG":35,"fatG":18,"fiberG":4,"sodiumMg":650,"sugarG":3,"vitamins":["Niacin","Vitamin C"],"minerals":["Calcium","Iron"]},
          substitutions: [{"originalIngredient":"Pork lard","substituteOptions":["Vegetable shortening (for vegan)"]}]
        },
            {
              "name": "Authentic Pozole Rojo",
              "description": "A pre-Hispanic, ceremonial soup. Massive kernels of nixtamalized corn (hominy) are exploded in a rich pork broth tinted blood-red by guajillo and ancho chilies, creating a structural and energetic triumph of ancient Mexican cooking.",
              "details": {
                "cuisine": "Mexican",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 180,
                "baseServingSize": 8,
                "spiceLevel": "Medium",
                "season": [
                  "winter",
                  "celebration"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "lbs",
                  "name": "Pork shoulder/trotters",
                  "notes": "For gelatinous depth."
                },
                {
                  "amount": 1,
                  "unit": "can (massive)",
                  "name": "Hominy",
                  "notes": "White nixtamalized corn."
                }
              ],
              "instructions": [
                "Step 1: Simmer pork with aromatics until meat falls apart.",
                "Step 2: Rehydrate and blend dried chilies into a smooth paste.",
                "Step 3: Fry chili paste in oil; add to pork broth.",
                "Step 4: Add hominy; simmer until kernels blossom like flowers.",
                "Step 5: Serve with radish, oregano, lime, and tostadas."
              ],
              "classifications": {
                "mealType": [
                  "dinner",
                  "celebration"
                ],
                "cookingMethods": [
                  "simmering",
                  "stewing"
                ]
              },
              "elementalProperties": {
                "Fire": 0.3,
                "Water": 0.45,
                "Earth": 0.2,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Pluto",
                  "Sun"
                ],
                "signs": [
                  "scorpio",
                  "leo"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 450,
                "proteinG": 35,
                "carbsG": 42,
                "fatG": 18,
                "fiberG": 8,
                "sodiumMg": 1200,
                "sugarG": 4,
                "vitamins": [
                  "Vitamin B12",
                  "Iron"
                ],
                "minerals": [
                  "Zinc",
                  "Potassium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Carnitas",
              "description": "The alchemical reduction of pork in its own fat. Massive chunks of pork shoulder are slow-simmered in lard with citrus and aromatics until the exterior is dark and crispy while the interior is structurally compromised and meltingly tender.",
              "details": {
                "cuisine": "Mexican (Michoacán)",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 180,
                "baseServingSize": 6,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 3,
                  "unit": "lbs",
                  "name": "Pork shoulder",
                  "notes": "Skin-on if possible."
                },
                {
                  "amount": 2,
                  "unit": "lbs",
                  "name": "Lard",
                  "notes": "Must be submerged in fat."
                }
              ],
              "instructions": [
                "Step 1: Cut pork into large cubes.",
                "Step 2: Submerge in hot lard with orange juice, milk, and salt.",
                "Step 3: Simmer at 250°F for 2.5 hours.",
                "Step 4: Increase heat to 350°F; fry until exterior is dark and crisp.",
                "Step 5: Drain fat and shred meat into large chunks."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "dinner"
                ],
                "cookingMethods": [
                  "confit",
                  "frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.4,
                "Water": 0.05,
                "Earth": 0.5,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Saturn",
                  "Mars"
                ],
                "signs": [
                  "capricorn",
                  "aries"
                ],
                "lunarPhases": [
                  "Waning Gibbous"
                ]
              },
              "nutritionPerServing": {
                "calories": 750,
                "proteinG": 48,
                "carbsG": 2,
                "fatG": 62,
                "fiberG": 0,
                "sodiumMg": 850,
                "sugarG": 1,
                "vitamins": [
                  "Thiamin",
                  "Zinc"
                ],
                "minerals": [
                  "Iron",
                  "Selenium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Chiles Rellenos",
              "description": "A structural feat of egg aeration. Large poblano peppers are roasted, stuffed with a savory pork picadillo, and encased in a massive, puffy cloud of whipped egg whites, fried to a golden finish and served in a light tomato broth.",
              "details": {
                "cuisine": "Mexican",
                "prepTimeMinutes": 60,
                "cookTimeMinutes": 20,
                "baseServingSize": 4,
                "spiceLevel": "Mild",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 4,
                  "unit": "whole",
                  "name": "Poblano peppers",
                  "notes": "Roasted and peeled."
                },
                {
                  "amount": 4,
                  "unit": "large",
                  "name": "Egg whites",
                  "notes": "Whipped to stiff peaks."
                }
              ],
              "instructions": [
                "Step 1: Roast and peel poblanos; stuff with cheese or meat.",
                "Step 2: Whip egg whites until stiff; fold in yolks gently.",
                "Step 3: Dredge peppers in flour, then submerge in egg cloud.",
                "Step 4: Fry in hot oil until the egg structure is set and golden.",
                "Step 5: Serve in a pool of hot, thin tomato caldillo."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "roasting",
                  "whipping",
                  "frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.35,
                "Water": 0.2,
                "Earth": 0.25,
                "Air": 0.2
              },
              "astrologicalAffinities": {
                "planets": [
                  "Sun",
                  "Mercury"
                ],
                "signs": [
                  "leo",
                  "gemini"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 480,
                "proteinG": 22,
                "carbsG": 18,
                "fatG": 34,
                "fiberG": 4,
                "sodiumMg": 750,
                "sugarG": 6,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin A"
                ],
                "minerals": [
                  "Calcium",
                  "Iron"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Sopa de Lima",
              "description": "The electric, aromatic chicken soup of the Yucatán. It relies on the distinct, bitter-sweet acidity of the Yucatecan lime (Lima Agria), balanced by fried tortilla strips and shredded chicken in a crystal-clear broth.",
              "details": {
                "cuisine": "Mexican (Yucatán)",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 45,
                "baseServingSize": 4,
                "spiceLevel": "Mild",
                "season": [
                  "summer",
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "whole",
                  "name": "Chicken",
                  "notes": "Poached for broth."
                },
                {
                  "amount": 4,
                  "unit": "whole",
                  "name": "Yucatecan Limes",
                  "notes": "Or Key Limes as substitute."
                }
              ],
              "instructions": [
                "Step 1: Prepare a clear chicken broth with charred onions.",
                "Step 2: Shred the chicken meat; set aside.",
                "Step 3: Fry corn tortilla strips until deeply crisp.",
                "Step 4: Add lime slices and juice to the hot broth (do not boil).",
                "Step 5: Assemble: chicken and broth topped with hot tortilla strips."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "soup"
                ],
                "cookingMethods": [
                  "simmering",
                  "frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.6,
                "Earth": 0.15,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Neptune",
                  "Moon"
                ],
                "signs": [
                  "pisces",
                  "cancer"
                ],
                "lunarPhases": [
                  "New Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 350,
                "proteinG": 32,
                "carbsG": 25,
                "fatG": 14,
                "fiberG": 4,
                "sodiumMg": 850,
                "sugarG": 4,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin B12"
                ],
                "minerals": [
                  "Potassium",
                  "Phosphorus"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Churros",
              "description": "A high-kinetic, extruded pastry. A dense, boiled dough (pâte à choux style) is forced through a star-shaped nozzle into smoking oil, creating massive surface area for a shatteringly crisp exterior and a soft, steamy interior.",
              "details": {
                "cuisine": "Mexican",
                "prepTimeMinutes": 15,
                "cookTimeMinutes": 10,
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
                  "name": "All-purpose flour",
                  "notes": "Boiled dough."
                },
                {
                  "amount": 0.5,
                  "unit": "cup",
                  "name": "Cinnamon sugar",
                  "notes": "For coating."
                }
              ],
              "instructions": [
                "Step 1: Boil water, butter, and salt; stir in flour to form a ball.",
                "Step 2: Transfer dough to a pastry bag with a star tip.",
                "Step 3: Extrude directly into 375°F oil in 6-inch lengths.",
                "Step 4: Fry until golden brown and rigid.",
                "Step 5: Toss immediately in cinnamon sugar while hot."
              ],
              "classifications": {
                "mealType": [
                  "snack",
                  "dessert"
                ],
                "cookingMethods": [
                  "boiling",
                  "frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.4,
                "Water": 0.05,
                "Earth": 0.35,
                "Air": 0.2
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
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 380,
                "proteinG": 4,
                "carbsG": 48,
                "fatG": 18,
                "fiberG": 2,
                "sodiumMg": 350,
                "sugarG": 22,
                "vitamins": [
                  "Iron"
                ],
                "minerals": [
                  "Manganese"
                ]
              },
              "substitutions": []
            }
        ],
      winter: [
        {
          name: "Cochinita Pibil",
          description: "The primal, slow-roasted masterpiece of the Yucatán. Pork shoulder marinated in highly acidic sour orange juice and earthy achiote paste, wrapped tightly in banana leaves, and cooked until it structurally collapses into brilliant red, hyper-tender shreds.",
          details: {"cuisine":"Mexican","prepTimeMinutes":30,"cookTimeMinutes":240,"baseServingSize":6,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":3,"unit":"lbs","name":"Pork shoulder","notes":"Cut into massive chunks."},{"amount":100,"unit":"g","name":"Achiote paste","notes":"Annatto seed paste; provides the deep red color."},{"amount":1,"unit":"cup","name":"Sour orange juice","notes":"Or a mix of orange, lime, and grapefruit juice."},{"amount":1,"unit":"tsp","name":"Allspice, clove, cumin","notes":"Ground."},{"amount":1,"unit":"package","name":"Banana leaves","notes":"Passed over an open flame to become pliable."},{"amount":1,"unit":"cup","name":"Pickled red onions","notes":"Thinly sliced, cured in lime juice and habanero."}],
          instructions: ["Step 1: The Blood Red Marinade. Dissolve the dense achiote paste in the sour orange juice. Add the ground spices, garlic, and a heavy dose of salt. Massage this vibrant red liquid aggressively into the pork chunks. Marinate overnight.","Step 2: The Leaf Matrix. Line a heavy roasting pan or Dutch oven completely with the softened banana leaves, leaving plenty of overhang to fold over the top.","Step 3: The Burial. Place the marinated pork and all the liquid into the banana leaf-lined pot. Fold the leaves over the top to completely seal the meat, trapping all moisture and infusing the pork with the tea-like aroma of the leaves.","Step 4: The Slow Fire. Cover tightly with a lid or foil. Bake at 325°F (165°C) for 3.5 to 4 hours. The connective tissues must completely dissolve.","Step 5: The Pull. Open the leaves. The pork should be fiercely red and fall apart at the touch. Shred it directly in its own juices. Serve immediately on tortillas, topped exclusively with the sharp, fiery pickled red onions."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["marinating","slow-roasting"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.4,"Air":0.05},
          astrologicalAffinities: {"planets":["Pluto","Sun"],"signs":["scorpio","leo"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":520,"proteinG":45,"carbsG":12,"fatG":32,"fiberG":3,"sodiumMg":850,"sugarG":6,"vitamins":["Vitamin C","Thiamin"],"minerals":["Iron","Zinc"]},
          substitutions: [{"originalIngredient":"Pork shoulder","substituteOptions":["Chicken (Pollo Pibil)","Jackfruit"]}]
        },
      ],
    },
    dessert: {
      all: [
        {
          name: "Flan",
          description: "A flawless, dense custard locked in a state of suspended animation, capped with a layer of aggressively caramelized sugar. It relies on the absolute precision of a water bath to prevent the eggs from boiling and scrambling.",
          details: {"cuisine":"Mexican","prepTimeMinutes":15,"cookTimeMinutes":60,"baseServingSize":8,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Granulated sugar","notes":"For the caramel."},{"amount":1,"unit":"can","name":"Evaporated milk","notes":"Provides density."},{"amount":1,"unit":"can","name":"Sweetened condensed milk","notes":"Provides sweetness and viscosity."},{"amount":5,"unit":"large","name":"Eggs","notes":"Whole."},{"amount":1,"unit":"tbsp","name":"Vanilla extract","notes":"High quality."}],
          instructions: ["Step 1: The Caramel. Place the granulated sugar in a dry saucepan over medium heat. Do not stir, but swirl the pan, until it melts into a dark, amber liquid. Immediately pour this liquid fire into the bottom of a round baking dish (flanera), swirling to coat the bottom. Work fast before it solidifies into glass.","Step 2: The Custard Base. In a blender, combine the evaporated milk, condensed milk, eggs, and vanilla. Blend on low speed just until homogenized. Avoid incorporating too much air to prevent bubbles in the final structure.","Step 3: The Pour. Pour the egg mixture directly over the hardened caramel in the baking dish.","Step 4: The Baño María (Water Bath). Cover the dish tightly with foil. Place it inside a larger roasting pan. Pour boiling water into the roasting pan until it reaches halfway up the sides of the flan dish. This moderates the heat.","Step 5: The Bake and Chill. Bake at 350°F (175°C) for 50-60 minutes until the edges are set but the center still jiggles slightly. Remove from the water bath and chill in the refrigerator for at least 4 hours. To serve, invert onto a plate; the caramel will have liquefied, creating a dark sauce."],
          classifications: {"mealType":["dessert"],"cookingMethods":["caramelizing","baking","water bath"]},
          elementalProperties: {"Fire":0.15,"Water":0.4,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Venus","Moon"],"signs":["taurus","cancer"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":380,"proteinG":10,"carbsG":55,"fatG":12,"fiberG":0,"sodiumMg":150,"sugarG":52,"vitamins":["Riboflavin","Vitamin B12"],"minerals":["Calcium","Phosphorus"]},
          substitutions: [{"originalIngredient":"Evaporated milk","substituteOptions":["Heavy cream","Coconut milk"]}]
        },
        {
          "name": "Authentic Churros",
          "description": "A study in structural pastry tension.",
          "details": {
            "cuisine": "Mexican",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 20,
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
            "mealType": [
              "dessert"
            ],
            "cookingMethods": [
              "frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.45,
            "Water": 0.15,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Aries"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 310,
            "proteinG": 4,
            "carbsG": 42,
            "fatG": 15,
            "fiberG": 1,
              "sodiumMg": 83,
              "sugarG": 26,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
      ],
      summer: [
        {
          name: "Paletas",
          description: "A profound alchemical execution of Paletas, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Paletas","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
          instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary foundation of Paletas","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
  },
  soups: {
    all: [
      {
        name: "Caldo de Pollo",
        description: "A deeply restorative, crystal-clear chicken soup that extracts the absolute essence of the bird through slow simmering, fortified with large chunks of root vegetables, corn, and bright lime acid.",
        details: {"cuisine":"Mexican","prepTimeMinutes":15,"cookTimeMinutes":90,"baseServingSize":4,"spiceLevel":"None","season":["winter","autumn"]},
        ingredients: [{"amount":1,"unit":"whole","name":"Chicken","notes":"Cut into parts, bone-in, skin-on for gelatin extraction."},{"amount":10,"unit":"cups","name":"Water","notes":"Cold, to draw out impurities."},{"amount":2,"unit":"whole","name":"Carrots","notes":"Cut into massive chunks."},{"amount":2,"unit":"whole","name":"Potatoes","notes":"Cut into massive chunks."},{"amount":2,"unit":"ears","name":"Corn","notes":"Cut into 2-inch rounds."},{"amount":0.5,"unit":"head","name":"Cabbage","notes":"Cut into wedges."},{"amount":1,"unit":"bunch","name":"Cilantro","notes":"Stems and all."},{"amount":2,"unit":"whole","name":"Limes","notes":"For serving."}],
        instructions: ["Step 1: The Extraction. Place the chicken pieces in a massive pot and cover with cold water. Bring to a boil over medium heat, systematically skimming the albuminous scum that rises to the surface to ensure a crystal-clear broth.","Step 2: The Aromatic Base. Once skimmed, add half an onion, a head of garlic (halved), and salt. Reduce to a bare simmer. Cook for 45 minutes.","Step 3: The Root Matrix. Add the carrots and corn rounds. Simmer for 15 minutes.","Step 4: The Soft Additions. Add the potatoes and cabbage wedges. Simmer until the potatoes are tender but not dissolving (about 15 more minutes). Throw in the cilantro bunch in the last 5 minutes.","Step 5: The Serve. Serve in massive bowls, ensuring each person gets a piece of chicken, vegetables, and a piece of corn. Must be eaten with copious amounts of fresh lime juice squeezed in, raw chopped onion, and warm tortillas."],
        classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering"]},
        elementalProperties: {"Fire":0.15,"Water":0.6,"Earth":0.2,"Air":0.05},
        astrologicalAffinities: {"planets":["Moon","Ceres"],"signs":["cancer","virgo"],"lunarPhases":["Waning Crescent"]},
        nutritionPerServing: {"calories":420,"proteinG":35,"carbsG":30,"fatG":18,"fiberG":6,"sodiumMg":850,"sugarG":6,"vitamins":["Vitamin A","Vitamin C"],"minerals":["Potassium","Phosphorus"]},
        substitutions: [{"originalIngredient":"Whole chicken","substituteOptions":["Beef shank (for Caldo de Res)"]}]
      },
      {
        name: "Elote",
        description: "A profound alchemical execution of Elote, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.",
        details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
        ingredients: [{"amount":1,"unit":"unit","name":"Primary foundation of Elote","notes":"Sourced for absolute quality."},{"amount":2,"unit":"tbsp","name":"Aromatic complex","notes":"To bind the flavor matrix."}],
        instructions: ["Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.","Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.","Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.","Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."],
        classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
        elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
        astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
        nutritionPerServing: {"calories":500,"proteinG":20,"carbsG":45,"fatG":25,"fiberG":6,"sodiumMg":750,"sugarG":8,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Iron","Calcium"]},
        substitutions: [{"originalIngredient":"Primary foundation of Elote","substituteOptions":["Elemental equivalent"]}]
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
        Earth: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Air: 0.1,
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
        Water: 0.4,
        Fire: 0.3,
        Air: 0.2,
        Earth: 0.1,
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
        Fire: 0.5,
        Earth: 0.3,
        Water: 0.1,
        Air: 0.1,
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
        Fire: 0.4,
        Air: 0.3,
        Earth: 0.2,
        Water: 0.1,
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
        Earth: 0.5,
        Water: 0.2,
        Air: 0.2,
        Fire: 0.1,
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
      Fire: [
        "salsa macha",
        "habanero-based sauces",
        "chile de árbol salsa",
        "adobo picante",
        "chipotle salsas",
      ],
      Earth: [
        "mole poblano",
        "pipián",
        "salsa de cacahuate",
        "recado negro",
        "adobo seco",
      ],
      Water: [
        "aguachile",
        "salsa verde",
        "avocado crema",
        "salsa veracruzana",
        "mole verde",
      ],
      Air: [
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
      elementalProperties: { Earth: 0.5, Water: 0.3, Fire: 0.1, Air: 0.1 },
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
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: ["grill", "mesquite wood", "tongs", "comal"],
      bestFor: ["meats", "nopal cactus", "vegetables", "salsas", "chiles"],
    },
    {
      name: "Guisado",
      description: "Slow-simmered stew technique for developing deep flavors",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
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
      elementalProperties: { Fire: 0.6, Earth: 0.2, Air: 0.1, Water: 0.1 },
      toolsRequired: ["comal", "direct flame", "tongs", "roasting basket"],
      bestFor: ["chiles", "tomatoes", "tomatillos", "onions", "salsas"],
    },
    {
      name: "Ahumado",
      description: "Smoking technique using various woods for distinct flavors",
      elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
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
      elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 },
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
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
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
      elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
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
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
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
      elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
      astrologicalInfluences: ["neptune", "venus", "pisces"],
      seasonality: "coastal seasonal patterns with monsoon influence",
    },
  },
  elementalProperties: {
    Fire: 0.3, // Represents chiles and grilling,
    Earth: 0.3, // Represents corn and beans,
    Water: 0.2, // Represents sauces and stews,
    Air: 0.2, // Represents herbs and light dishes
  },
};

export default mexican;
