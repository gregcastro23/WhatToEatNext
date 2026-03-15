// src/data/cuisines/korean.ts
import type { Cuisine } from "@/types/cuisine";

export const korean: Cuisine = {
  id: "korean",
  name: "Korean",
  description:
    "Traditional Korean cuisine emphasizing fermented foods, communal dining, and balanced flavors with rice, banchan, and grilled meats",
  dishes: {
    breakfast: {
      all: [
        {
          name: "Gyeran Bap",
          description: "The quintessential Korean comfort food: a steaming bowl of rice crowned with a fried egg, anointed with sesame oil and soy sauce. It is simple, fast, and reliant entirely on the alchemy of hot rice gently cooking the rich, running egg yolk.",
          details: {"cuisine":"Korean","prepTimeMinutes":5,"cookTimeMinutes":5,"baseServingSize":1,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Cooked short-grain rice","notes":"Must be piping hot."},{"amount":1,"unit":"large","name":"Egg","notes":"Fried sunny-side up or over-easy."},{"amount":1,"unit":"tbsp","name":"Toasted sesame oil","notes":"The aromatic core of the dish."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"For deep salinity and umami."},{"amount":1,"unit":"tbsp","name":"Butter","notes":"Optional, but highly recommended for extreme richness."},{"amount":1,"unit":"pinch","name":"Sesame seeds","notes":"Toasted."}],
          instructions: ["Step 1: The Rice. Place the freshly cooked, steaming hot short-grain rice into a warm bowl. If using butter, bury it in the center of the rice so it melts immediately into a rich pool.","Step 2: The Egg. In a hot skillet, fry the egg quickly so the whites are set and crispy on the edges, but the yolk remains entirely fluid and warm.","Step 3: The Crown. Lay the hot fried egg directly on top of the rice.","Step 4: The Dressing. Drizzle the high-quality toasted sesame oil and soy sauce evenly over the egg and rice.","Step 5: The Ritual. To eat, fiercely pierce the yolk with a spoon and violently mix everything together. The heat of the rice and the fat of the yolk emulsify the soy and sesame into a creamy, savory coating over every grain."],
          classifications: {"mealType":["breakfast","comfort"],"cookingMethods":["frying","mixing"]},
          elementalProperties: {"Fire":0.15,"Water":0.15,"Earth":0.5,"Air":0.2},
          astrologicalAffinities: {"planets":["Moon","Ceres"],"signs":["taurus","cancer"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":450,"proteinG":12,"carbsG":45,"fatG":24,"fiberG":1,"sodiumMg":950,"sugarG":1,"vitamins":["Choline","Vitamin B12"],"minerals":["Iron","Selenium"]},
          substitutions: [{"originalIngredient":"Butter","substituteOptions":["Gochujang (for heat)","Omit for traditional"]}]
        },
        {
          name: "Juk",
          description: "A deeply restorative Korean rice porridge. By slowly breaking down the starches of the rice over prolonged heat, the mixture achieves a profound, soothing viscosity, traditionally served during illness or deep winter.",
          details: {"cuisine":"Korean","prepTimeMinutes":10,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"None","season":["winter"]},
          ingredients: [{"amount":0.5,"unit":"cup","name":"Short-grain rice","notes":"Soaked in cold water for 1 hour."},{"amount":4,"unit":"cups","name":"Water or chicken stock","notes":"Liquid ratio dictates the final thickness."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For toasting the rice."},{"amount":0.25,"unit":"cup","name":"Minced vegetables","notes":"Carrots, zucchini, mushrooms."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"For seasoning."},{"amount":1,"unit":"tsp","name":"Toasted sesame seeds","notes":"Garnish."}],
          instructions: ["Step 1: The Bloom. Drain the soaked rice. In a heavy-bottomed pot, heat the sesame oil over medium. Add the rice and toast it, stirring constantly, until the grains become translucent and incredibly fragrant.","Step 2: The Vegetables. Add the finely minced vegetables and sauté for an additional 2 minutes until they begin to soften.","Step 3: The Simmer. Pour in the water or stock. Bring to a rolling boil, then immediately reduce the heat to the lowest possible simmer.","Step 4: The Breakdown. Cover the pot, leaving a slight crack. Simmer for 30-40 minutes. Stir frequently, scraping the bottom; the physical agitation helps break the rice grains, releasing their starch to thicken the liquid naturally into a creamy suspension.","Step 5: The Finish. Season with soy sauce or salt. The final texture should be thick but flowing. Serve hot, garnished with a few drops of sesame oil and toasted sesame seeds."],
          classifications: {"mealType":["breakfast","comfort","dinner"],"cookingMethods":["simmering"]},
          elementalProperties: {"Fire":0.1,"Water":0.6,"Earth":0.25,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":280,"proteinG":6,"carbsG":42,"fatG":9,"fiberG":2,"sodiumMg":450,"sugarG":3,"vitamins":["Vitamin A","Vitamin K"],"minerals":["Manganese","Magnesium"]},
          substitutions: [{"originalIngredient":"Minced vegetables","substituteOptions":["Abalone (for Jeonbokjuk)","Minced beef"]}]
        },
      ],
      summer: [
        {
          name: "Kong Guksu",
          description: "An alchemically perfected and structurally rigorous preparation of Kong Guksu. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Kong Guksu","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Kong Guksu","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Korean Bibimbap",
          "description": "A structurally complex agrarian dish honoring the five elements.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 30,
            "baseServingSize": 2,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "short-grain white rice",
              "notes": "Cooked."
            }
          ],
          "instructions": [
            "Step 1: Marinate beef.",
            "Step 2: Prepare vegetables individually.",
            "Step 3: Assemble radially over rice.",
            "Step 4: Top with egg and gochujang."
          ],
          "classifications": {
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "sautéing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.2,
            "Earth": 0.4,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Sun"
            ],
            "signs": [
              "Virgo"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 580,
            "proteinG": 28,
            "carbsG": 75,
            "fatG": 18,
            "fiberG": 8,
              "sodiumMg": 308,
              "sugarG": 5,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Kimchi Jjigae",
          description: "An intense, boiling-hot Korean stew that transforms heavily fermented, sour kimchi into a complex, fiery, and deeply savory broth, anchored by the rich fattiness of pork belly and the softness of tofu.",
          details: {"cuisine":"Korean","prepTimeMinutes":10,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"High","season":["winter","autumn"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Aged, very sour Kimchi","notes":"Must be heavily fermented; fresh kimchi will not work. Chopped."},{"amount":0.5,"unit":"lb","name":"Pork belly","notes":"Cut into bite-sized strips. The fat is crucial."},{"amount":2,"unit":"cups","name":"Water or anchovy-kelp stock","notes":"For the broth."},{"amount":2,"unit":"tbsp","name":"Kimchi brine","notes":"The juice from the kimchi jar, packed with lactic acid."},{"amount":1,"unit":"tbsp","name":"Gochugaru","notes":"Korean red chili flakes, adjust for heat."},{"amount":0.5,"unit":"block","name":"Medium-firm tofu","notes":"Sliced into thick rectangles."},{"amount":2,"unit":"stalks","name":"Scallions","notes":"Sliced diagonally."},{"amount":2,"unit":"cloves","name":"Garlic","notes":"Minced."}],
          instructions: ["Step 1: The Searing. In a traditional stone pot (ttukbaegi) or heavy pot, sauté the pork belly over medium heat until it renders its fat and begins to brown. The rendered lard is the flavor carrier.","Step 2: The Acid Roast. Add the intensely sour kimchi and the minced garlic to the pork fat. Sauté for 5 minutes until the kimchi softens and its sharp, acidic edges caramelize slightly.","Step 3: The Broth. Pour in the stock and the kimchi brine. Add the gochugaru. Bring the mixture to a vigorous, rolling boil.","Step 4: The Simmer. Reduce the heat to medium and maintain a strong simmer for 15-20 minutes, allowing the pork fat and the acidic, spicy broth to fully emulsify into a rich, complex stew.","Step 5: The Finish. Carefully lay the tofu slices and scallions on top. Boil for 3 more minutes. Serve bubbling fiercely at the table alongside steamed rice."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stewing","boiling","sautéing"]},
          elementalProperties: {"Fire":0.55,"Water":0.25,"Earth":0.15,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Pluto"],"signs":["aries","scorpio"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":480,"proteinG":22,"carbsG":14,"fatG":38,"fiberG":4,"sodiumMg":1200,"sugarG":4,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Canned tuna","More tofu (vegan)"]}]
        },
      ],
      summer: [
        {
          name: "Naengmyeon",
          description: "An alchemically perfected and structurally rigorous preparation of Naengmyeon. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Naengmyeon","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Naengmyeon","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      winter: [
        {
          name: "Tteokguk",
          description: "An alchemically perfected and structurally rigorous preparation of Tteokguk. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Tteokguk","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Tteokguk","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    dinner: {
      all: [
        {
          name: "Samgyeopsal-gui",
          description: "The communal and tactile experience of Korean BBQ. Unmarinated, thick-cut pork belly is grilled at the table, crisped in its own rendered fat, and eaten wrapped in fresh lettuce with pungent aromatics and fermented pastes.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Pork belly (Samgyeopsal)","notes":"Thick slices, distinct layers of meat and fat."},{"amount":1,"unit":"head","name":"Red leaf lettuce","notes":"Washed and dried perfectly for wrapping."},{"amount":0.5,"unit":"cup","name":"Ssamjang","notes":"Thick, spicy fermented bean paste."},{"amount":4,"unit":"cloves","name":"Garlic","notes":"Raw, sliced thinly."},{"amount":2,"unit":"tbsp","name":"Sesame oil","notes":"Mixed with salt and pepper for dipping."},{"amount":1,"unit":"cup","name":"Kimchi","notes":"Aged, for grilling alongside the pork."}],
          instructions: ["Step 1: The Table Setup. Arrange the raw pork, lettuce leaves, ssamjang, sliced garlic, and sesame oil dipping sauce around a tabletop grill or cast-iron pan.","Step 2: The Grill. Heat the grill until smoking hot. Lay the pork belly slices flat. Do not touch them until the bottom is deeply browned and crispy. The fat will render vigorously.","Step 3: The Flip and Cut. Flip the meat to crisp the other side. Using heavy scissors, cut the long strips into bite-sized pieces directly on the grill. Place the kimchi on the lower end of the grill to fry in the rendering pork fat.","Step 4: The Ssam (Wrap). To eat, take a fresh lettuce leaf. Dip a piece of the crackling-hot pork into the sesame oil, then place it in the leaf.","Step 5: The Build. Add a smear of ssamjang, a slice of raw garlic, and some of the grilled, fat-soaked kimchi. Wrap it tightly into a small pouch and eat it in one complete bite."],
          classifications: {"mealType":["dinner","social"],"cookingMethods":["grilling"]},
          elementalProperties: {"Fire":0.5,"Water":0.05,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Venus"],"signs":["taurus","aries"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":850,"proteinG":35,"carbsG":12,"fatG":72,"fiberG":3,"sodiumMg":850,"sugarG":4,"vitamins":["Vitamin K","Thiamin"],"minerals":["Zinc","Selenium"]},
          substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Beef short ribs (Galbi)","Thick-cut mushrooms"]}]
        },
        {
          name: "Sundubu Jjigae",
          description: "A violent, bubbling cauldron of soft, uncurdled tofu (sundubu), a complex chili oil base, and seafood, served violently boiling, traditionally finished by cracking a raw egg into the furious heat of the broth at the table.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":1,"spiceLevel":"High","season":["winter","spring"]},
          ingredients: [{"amount":1,"unit":"tube","name":"Extra-soft tofu (Sundubu)","notes":"Delicate, custard-like texture."},{"amount":2,"unit":"tbsp","name":"Gochugaru","notes":"Korean chili flakes."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For frying the chili paste."},{"amount":1,"unit":"tbsp","name":"Soup soy sauce","notes":"Guk-ganjang, highly salty and umami."},{"amount":1,"unit":"cup","name":"Anchovy-kelp stock","notes":"The umami backbone."},{"amount":0.5,"unit":"cup","name":"Mixed seafood","notes":"Shrimp, clams, or squid."},{"amount":1,"unit":"large","name":"Egg","notes":"Raw."},{"amount":2,"unit":"cloves","name":"Garlic","notes":"Minced."}],
          instructions: ["Step 1: The Chili Oil. In a traditional earthenware pot (ttukbaegi), heat the sesame oil over low heat. Add the gochugaru and minced garlic. Stir continuously to toast the chili flakes and infuse the oil without burning them, creating a deep red, aromatic paste.","Step 2: The Foundation. Stir in the soup soy sauce to deglaze, then pour in the anchovy-kelp stock. Bring the fiery red broth to a rolling boil.","Step 3: The Seafood. Drop the mixed seafood into the boiling broth. Let it cook for 2 minutes until the clams open and the shrimp turn pink.","Step 4: The Tofu. Cut the tube of extra-soft tofu and slide it into the pot in large, unformed chunks. Do not overmix; the tofu should remain in large, custard-like clouds. Simmer fiercely for 4 minutes.","Step 5: The Climax. Remove the violently bubbling pot from the heat and place it on the table. Immediately crack the raw egg directly into the center of the boiling stew. The residual heat will poach the egg. Serve immediately."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["boiling","stewing"]},
          elementalProperties: {"Fire":0.6,"Water":0.3,"Earth":0.05,"Air":0.05},
          astrologicalAffinities: {"planets":["Pluto","Mars"],"signs":["scorpio","aries"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":350,"proteinG":28,"carbsG":12,"fatG":22,"fiberG":3,"sodiumMg":1100,"sugarG":3,"vitamins":["Vitamin A","Vitamin B12"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Mixed seafood","substituteOptions":["Pork belly","Enoki mushrooms"]}]
        },
        {
          "name": "Authentic Korean Bulgogi",
          "description": "A study in meat tenderization and rapid caramelization.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 10,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 600,
              "unit": "g",
              "name": "beef ribeye",
              "notes": "Sliced paper-thin."
            }
          ],
          "instructions": [
            "Step 1: Marinate meat with Asian pear.",
            "Step 2: Grill rapidly over high heat."
          ],
          "classifications": {
            "mealType": [
              "dinner"
            ],
            "cookingMethods": [
              "grilling"
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
              "Mars"
            ],
            "signs": [
              "Aries"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 35,
            "carbsG": 22,
            "fatG": 20,
            "fiberG": 2,
              "sodiumMg": 615,
              "sugarG": 11,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Dakgalbi",
          description: "A highly interactive, spicy stir-fry. Chunks of chicken marinated in a fierce gochujang sauce are cooked rapidly on a massive flat iron pan with sweet potatoes, cabbage, and rice cakes, creating a caramelized, spicy, sticky masterpiece.",
          details: {"cuisine":"Korean","prepTimeMinutes":30,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"High","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Chicken thighs","notes":"Boneless, cut into bite-sized pieces."},{"amount":3,"unit":"tbsp","name":"Gochujang","notes":"Korean chili paste."},{"amount":2,"unit":"tbsp","name":"Gochugaru","notes":"Korean chili flakes."},{"amount":2,"unit":"tbsp","name":"Soy sauce","notes":"For salinity."},{"amount":1,"unit":"tbsp","name":"Curry powder","notes":"Secret ingredient for depth."},{"amount":2,"unit":"cups","name":"Cabbage","notes":"Roughly chopped into large squares."},{"amount":1,"unit":"cup","name":"Sweet potato","notes":"Peeled and cut into thin sticks."},{"amount":1,"unit":"cup","name":"Tteok (Rice cakes)","notes":"Cylindrical shape, soaked if hard."}],
          instructions: ["Step 1: The Marinade. In a large bowl, combine the gochujang, gochugaru, soy sauce, curry powder, minced garlic, and a touch of sugar. Massage this intense, fiery paste into the chicken thighs. Marinate for at least 30 minutes.","Step 2: The Setup. Heat a very large, heavy skillet or a specialized dakgalbi pan over medium-high heat. Add a splash of oil.","Step 3: The Sear. Place the marinated chicken in the center, surrounding it with the hard vegetables (sweet potatoes) and the dense rice cakes.","Step 4: The Sizzle. As the pan heats up, the marinade will begin to sizzle and caramelize. Continuously stir-fry the ingredients, keeping them moving to prevent the sugars in the gochujang from burning.","Step 5: The Cabbage. Once the chicken is 80% cooked and the sweet potatoes are softening, add the huge pile of cabbage. The water released by the cabbage will deglaze the pan. Stir aggressively until the cabbage wilts into a spicy, sticky glaze. Serve hot from the pan."],
          classifications: {"mealType":["dinner","social"],"cookingMethods":["stir-frying"]},
          elementalProperties: {"Fire":0.55,"Water":0.1,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Jupiter"],"signs":["aries","sagittarius"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":520,"proteinG":38,"carbsG":65,"fatG":12,"fiberG":8,"sodiumMg":1250,"sugarG":14,"vitamins":["Vitamin A","Vitamin C"],"minerals":["Potassium","Iron"]},
          substitutions: [{"originalIngredient":"Chicken thighs","substituteOptions":["Spicy pork","Extra tofu and mushrooms"]}]
        },
        {
          name: "Haemul Pajeon",
          description: "A profound execution of Haemul Pajeon, meticulously designed to harmonize elemental properties and maximize caloric resonance.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Core element of Haemul Pajeon","notes":"High quality."},{"amount":1,"unit":"dash","name":"Alchemical spice","notes":"To bind the flavors."}],
          instructions: ["Step 1: The Foundation. Establish the aromatic base using moderate heat.","Step 2: The Incorporation. Fold the primary elements into the matrix.","Step 3: The Completion. Elevate to the final serving state and present immediately."],
          classifications: {"mealType":["dinner"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter"],"signs":["sagittarius"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":450,"proteinG":20,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":600,"sugarG":4,"vitamins":["Vitamin D"],"minerals":["Zinc"]},
          substitutions: [{"originalIngredient":"Core element of Haemul Pajeon","substituteOptions":["Alternative element"]}]
        },
        {
          name: "Gamjatang",
          description: "An alchemically perfected and structurally rigorous preparation of Gamjatang. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Gamjatang","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Gamjatang","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Bossam",
          description: "An alchemically perfected and structurally rigorous preparation of Bossam. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Bossam","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Bossam","substituteOptions":["Elemental equivalent"]}]
        },
            {
              "name": "Authentic Jeonju Bibimbap",
              "description": "The architectural pinnacle of Korean rice bowls. A precise arrangement of seasoned vegetables (namul) over beef-broth rice, topped with raw beef (yukhoe) and a fried egg, designed to be violently mixed into a singular, unified profile.",
              "details": {
                "cuisine": "Korean",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 20,
                "baseServingSize": 2,
                "spiceLevel": "Medium",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "Jasmine rice",
                  "notes": "Cooked in beef broth."
                },
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Mixed vegetables",
                  "notes": "Bean sprouts, spinach, shiitake, carrots."
                }
              ],
              "instructions": [
                "Step 1: Cook rice in beef broth.",
                "Step 2: Individually sauté and season each vegetable.",
                "Step 3: Arrange vegetables in a radial pattern over rice.",
                "Step 4: Place gochujang and a raw yolk in the center.",
                "Step 5: Mix aggressively before consuming."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "dinner"
                ],
                "cookingMethods": [
                  "sautéing",
                  "boiling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.2,
                "Water": 0.15,
                "Earth": 0.5,
                "Air": 0.15
              },
              "astrologicalAffinities": {
                "planets": [
                  "Saturn",
                  "Sun"
                ],
                "signs": [
                  "capricorn",
                  "leo"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 550,
                "proteinG": 28,
                "carbsG": 75,
                "fatG": 18,
                "fiberG": 8,
                "sodiumMg": 850,
                "sugarG": 12,
                "vitamins": [
                  "Vitamin A",
                  "Vitamin C"
                ],
                "minerals": [
                  "Iron",
                  "Manganese"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Japchae",
              "description": "A highly kinetic glass noodle stir-fry. Sweet potato starch noodles are tossed with a colorful matrix of vegetables and beef, seasoned with a dark, oily emulsion of sesame and soy, achieving a perfect balance of elastic and snappy textures.",
              "details": {
                "cuisine": "Korean",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 15,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 200,
                  "unit": "g",
                  "name": "Dangmyeon",
                  "notes": "Sweet potato glass noodles."
                },
                {
                  "amount": 0.5,
                  "unit": "lb",
                  "name": "Beef flank",
                  "notes": "Thinly sliced."
                }
              ],
              "instructions": [
                "Step 1: Boil noodles until elastic; rinse in cold water.",
                "Step 2: Sauté beef and vegetables individually.",
                "Step 3: Prepare sauce of soy, sesame oil, and sugar.",
                "Step 4: Combine all elements in a massive bowl.",
                "Step 5: Mix by hand to ensure total coating."
              ],
              "classifications": {
                "mealType": [
                  "side",
                  "dinner"
                ],
                "cookingMethods": [
                  "boiling",
                  "stir-frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.25,
                "Water": 0.2,
                "Earth": 0.35,
                "Air": 0.2
              },
              "astrologicalAffinities": {
                "planets": [
                  "Venus",
                  "Mercury"
                ],
                "signs": [
                  "libra",
                  "gemini"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 18,
                "carbsG": 65,
                "fatG": 14,
                "fiberG": 4,
                "sodiumMg": 950,
                "sugarG": 15,
                "vitamins": [
                  "Vitamin B6"
                ],
                "minerals": [
                  "Zinc"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Beef Bulgogi",
              "description": "The alchemical reduction of fire and sweet soy. Paper-thin beef is marinated in a mixture containing pear purée (to break down proteins) and grilled over high heat until the sugars caramelize into a smoky, lacquered crust.",
              "details": {
                "cuisine": "Korean",
                "prepTimeMinutes": 60,
                "cookTimeMinutes": 10,
                "baseServingSize": 4,
                "spiceLevel": "Mild",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1.5,
                  "unit": "lbs",
                  "name": "Ribeye or Top Sirloin",
                  "notes": "Sliced paper-thin."
                },
                {
                  "amount": 0.5,
                  "unit": "whole",
                  "name": "Korean Pear",
                  "notes": "Grated for the marinade."
                }
              ],
              "instructions": [
                "Step 1: Grate pear, onion, and garlic into a pulp.",
                "Step 2: Mix with soy, sesame oil, and sugar.",
                "Step 3: Marinate beef for at least 1 hour.",
                "Step 4: Grill over charcoal or in a smoking hot pan.",
                "Step 5: Sear rapidly to caramelize without toughening."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "marinating",
                  "grilling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.5,
                "Water": 0.1,
                "Earth": 0.3,
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
                "calories": 480,
                "proteinG": 45,
                "carbsG": 18,
                "fatG": 28,
                "fiberG": 1,
                "sodiumMg": 1100,
                "sugarG": 14,
                "vitamins": [
                  "Vitamin B12",
                  "Iron"
                ],
                "minerals": [
                  "Zinc",
                  "Selenium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Haemul Pajeon",
              "description": "A violent, oil-fried seafood and green onion pancake. Long stalks of scallions are laid flat on a griddle, bound by a thin batter and massive amounts of shrimp and squid, fried until the bottom is a rigid, crispy lattice.",
              "details": {
                "cuisine": "Korean",
                "prepTimeMinutes": 15,
                "cookTimeMinutes": 10,
                "baseServingSize": 2,
                "spiceLevel": "Mild",
                "season": [
                  "rainy days"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "bunch",
                  "name": "Green onions",
                  "notes": "Left whole."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Pancake mix",
                  "notes": "Wheat and rice flour blend."
                }
              ],
              "instructions": [
                "Step 1: Lay whole scallions in a flat layer in a hot pan.",
                "Step 2: Pour a thin batter over the onions.",
                "Step 3: Press shrimp and squid into the wet batter.",
                "Step 4: Pour a beaten egg over the top.",
                "Step 5: Flip carefully; fry until shatteringly crisp."
              ],
              "classifications": {
                "mealType": [
                  "snack",
                  "appetizer"
                ],
                "cookingMethods": [
                  "shallow frying"
                ]
              },
              "elementalProperties": {
                "Fire": 0.45,
                "Water": 0.15,
                "Earth": 0.25,
                "Air": 0.15
              },
              "astrologicalAffinities": {
                "planets": [
                  "Mars",
                  "Moon"
                ],
                "signs": [
                  "aries",
                  "cancer"
                ],
                "lunarPhases": [
                  "Last Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 380,
                "proteinG": 22,
                "carbsG": 45,
                "fatG": 22,
                "fiberG": 3,
                "sodiumMg": 750,
                "sugarG": 4,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin K"
                ],
                "minerals": [
                  "Iron",
                  "Calcium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Hotteok",
              "description": "The molten-core street snack. A yeast-leavened dough is stuffed with a mixture of brown sugar, cinnamon, and walnuts, then pressed flat on a griddle until the sugar inside turns into a scalding, aromatic syrup.",
              "details": {
                "cuisine": "Korean",
                "prepTimeMinutes": 90,
                "cookTimeMinutes": 15,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "All-purpose flour",
                  "notes": "Yeasted dough."
                },
                {
                  "amount": 0.5,
                  "unit": "cup",
                  "name": "Dark brown sugar",
                  "notes": "For the filling."
                }
              ],
              "instructions": [
                "Step 1: Knead a sticky, yeasted dough; let rise until doubled.",
                "Step 2: Take a ball of dough; hollow out the center.",
                "Step 3: Stuff with sugar and cinnamon mix; seal tightly.",
                "Step 4: Place on a hot, oiled griddle; press flat immediately.",
                "Step 5: Fry until golden; the center will be molten syrup."
              ],
              "classifications": {
                "mealType": [
                  "snack",
                  "dessert"
                ],
                "cookingMethods": [
                  "fermenting",
                  "griddling"
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
                  "Sun",
                  "Venus"
                ],
                "signs": [
                  "leo",
                  "taurus"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 320,
                "proteinG": 6,
                "carbsG": 55,
                "fatG": 12,
                "fiberG": 2,
                "sodiumMg": 250,
                "sugarG": 32,
                "vitamins": [
                  "Thiamin"
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
          name: "Budae Jjigae",
          description: "An alchemically perfected and structurally rigorous preparation of Budae Jjigae. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Budae Jjigae","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Budae Jjigae","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      summer: [
        {
          name: "Samgye-tang",
          description: "An alchemically perfected and structurally rigorous preparation of Samgye-tang. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Samgye-tang","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Samgye-tang","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
    dessert: {
      summer: [
        {
          name: "Patbingsu",
          description: "An alchemically perfected and structurally rigorous preparation of Patbingsu. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Patbingsu","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Patbingsu","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      winter: [
        {
          name: "Hotteok",
          description: "An alchemically perfected and structurally rigorous preparation of Hotteok. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Hotteok","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Hotteok","substituteOptions":["Elemental equivalent"]}]
        },
      ],
      all: [
        {
          name: "Songpyeon",
          description: "An alchemically perfected and structurally rigorous preparation of Songpyeon. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Songpyeon","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Songpyeon","substituteOptions":["Elemental equivalent"]}]
        },
        {
          name: "Japchae",
          description: "An alchemically perfected and structurally rigorous preparation of Japchae. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.",
          details: {"cuisine":"Various","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Primary ingredient for Japchae","notes":"Prepared with exacting precision."},{"amount":2,"unit":"tbsp","name":"Aromatic catalyst","notes":"For depth."}],
          instructions: ["Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.","Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.","Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.","Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","frying"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Sun","Moon"],"signs":["aries","libra"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":500,"proteinG":25,"carbsG":50,"fatG":20,"fiberG":5,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron","Calcium"]},
          substitutions: [{"originalIngredient":"Primary ingredient for Japchae","substituteOptions":["Elemental equivalent"]}]
        },
      ],
    },
  },
  traditionalSauces: {
    gochujang: {
      name: "Gochujang",
      description:
        "Fermented red chili paste with sweet, savory, and spicy notes",
      base: "fermented soybean and red chili",
      keyIngredients: [
        "glutinous rice",
        "fermented soybeans",
        "red chili powder",
        "salt",
      ],
      culinaryUses: [
        "marinade base",
        "stew seasoning",
        "dipping sauce",
        "bibimbap topping",
      ],
      variants: ["Mild", "Medium", "Hot", "Extra Hot"],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.3,
        Water: 0.1,
        Air: 0.0,
      },
      astrologicalInfluences: ["Mars", "Aries", "Leo"],
      seasonality: "all",
      preparationNotes:
        "Traditionally fermented for months in earthenware pots called onggi",
      technicalTips:
        "Balance with sweeteners like honey or sugar to mellow its intensity",
    },
    doenjang: {
      name: "Doenjang",
      description:
        "Fermented soybean paste with rich umami flavor and earthy notes",
      base: "fermented soybean",
      keyIngredients: [
        "fermented soybeans",
        "salt",
        "meju (fermented soybean block)",
      ],
      culinaryUses: [
        "soup base",
        "stew seasoning",
        "vegetable dipping sauce",
        "marinade component",
      ],
      variants: ["Homemade", "Commercial", "Aged", "Premium"],
      elementalProperties: {
        Earth: 0.7,
        Water: 0.2,
        Fire: 0.1,
        Air: 0.0,
      },
      astrologicalInfluences: ["Saturn", "Taurus", "Capricorn"],
      seasonality: "all",
      preparationNotes:
        "Traditionally separated from soy sauce during fermentation of meju",
      technicalTips:
        "Add at the beginning of cooking to develop depth of flavor",
    },
    ssamjang: {
      name: "Ssamjang",
      description: "Thick, spicy dipping sauce for wrapped meat and vegetables",
      base: "doenjang and gochujang",
      keyIngredients: [
        "doenjang",
        "gochujang",
        "sesame oil",
        "garlic",
        "green onions",
      ],
      culinaryUses: [
        "wrap dipping sauce",
        "vegetable dip",
        "meat accompaniment",
        "rice topping",
      ],
      variants: ["Traditional", "Sweet", "Extra garlic", "Sesame-heavy"],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.4,
        Water: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Saturn", "Scorpio"],
      seasonality: "all",
      preparationNotes: "Mix ingredients fresh before serving for best flavor",
      technicalTips:
        "Balance sweet, savory, and spicy elements to complement the main dish",
    },
    ganjang: {
      name: "Ganjang (Korean Soy Sauce)",
      description:
        "Traditional Korean soy sauce, often more complex than Chinese or Japanese varieties",
      base: "fermented soybean",
      keyIngredients: ["fermented soybeans", "salt", "water"],
      culinaryUses: [
        "seasoning",
        "dipping sauce",
        "marinade base",
        "soup flavoring",
      ],
      variants: [
        "Yangjo (regular)",
        "Jin (dark)",
        "Mulyang (double-brewed)",
        "Jorang (aged)",
      ],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.4,
        Air: 0.1,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Pisces", "Cancer"],
      seasonality: "all",
      preparationNotes:
        "Traditionally separated from doenjang during fermentation",
      technicalTips:
        "Use premium varieties for dipping sauces and everyday ones for cooking",
    },
    chogochujang: {
      name: "Chogochujang",
      description: "Sweet and sour chili sauce with vinegar",
      base: "gochujang and vinegar",
      keyIngredients: ["gochujang", "rice vinegar", "sugar", "sesame oil"],
      culinaryUses: [
        "raw fish dipping",
        "cold noodle sauce",
        "blanched vegetable dressing",
        "rice cake topping",
      ],
      variants: ["Sweet", "Sour", "Spicy", "Fruity (with pear juice)"],
      elementalProperties: {
        Fire: 0.4,
        Air: 0.3,
        Water: 0.2,
        Earth: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Gemini", "Sagittarius"],
      seasonality: "summer",
      preparationNotes: "Best made fresh rather than stored long-term",
      technicalTips:
        "Adjust vinegar and sugar ratio to complement the dish being served",
    },
    yangnyeom: {
      name: "Yangnyeom Sauce",
      description:
        "Sweet and spicy sauce used for Korean fried chicken and other dishes",
      base: "gochujang and corn syrup",
      keyIngredients: [
        "gochujang",
        "corn syrup",
        "ketchup",
        "garlic",
        "ginger",
      ],
      culinaryUses: [
        "fried chicken coating",
        "stir-fry sauce",
        "dipping sauce",
        "marinade",
      ],
      variants: ["Extra sweet", "Extra spicy", "Garlic-heavy", "Honey-based"],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.2,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "all",
      preparationNotes: "Mix thoroughly and cook briefly to develop flavors",
      technicalTips:
        "The sauce should coat the back of a spoon but still be pourable",
    },
    bulgogi: {
      name: "Bulgogi Marinade",
      description: "Sweet and savory marinade for grilled beef and other meats",
      base: "soy sauce and fruit",
      keyIngredients: [
        "soy sauce",
        "Asian pear",
        "onion",
        "garlic",
        "sesame oil",
        "sugar",
      ],
      culinaryUses: [
        "beef marinade",
        "pork marinade",
        "stir-fry base",
        "vegetable seasoning",
      ],
      variants: [
        "Traditional",
        "Spicy",
        "Fruit-forward",
        "Premium (with rice wine)",
      ],
      elementalProperties: {
        Water: 0.3,
        Earth: 0.3,
        Fire: 0.2,
        Air: 0.2,
      },
      astrologicalInfluences: ["Venus", "Taurus", "Libra"],
      seasonality: "all",
      preparationNotes:
        "Asian pear helps tenderize meat while adding subtle sweetness",
      technicalTips:
        "Marinate beef for at least 2 hours, preferably overnight for best flavor penetration",
    },
    sesameOil: {
      name: "Chamgireum (Sesame Oil Dressing)",
      description: "Aromatic oil-based dressing used for many Korean dishes",
      base: "toasted sesame oil",
      keyIngredients: [
        "toasted sesame oil",
        "salt",
        "green onions",
        "toasted sesame seeds",
      ],
      culinaryUses: [
        "vegetable seasoning",
        "meat finishing sauce",
        "bibimbap component",
        "dipping sauce",
      ],
      variants: ["Plain", "With garlic", "With chili", "With perilla oil"],
      elementalProperties: {
        Air: 0.4,
        Earth: 0.4,
        Fire: 0.1,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Gemini", "Virgo"],
      seasonality: "all",
      preparationNotes:
        "Use high-quality freshly toasted sesame oil for best flavor",
      technicalTips: "Add at the end of cooking to preserve volatile aromatics",
    },
  },
  sauceRecommender: {
    forProtein: {
      beef: ["bulgogi sauce", "kalbi marinade", "doenjang", "ssamjang"],
      pork: ["ssamjang", "gochujang", "doenjang", "spicy chili sauce"],
      chicken: [
        "gochujang-based sauce",
        "doenjang",
        "soy garlic sauce",
        "ganjang",
      ],
      seafood: [
        "chogochujang",
        "soy garlic",
        "sesame oil with salt",
        "citrus soy",
      ],
      tofu: ["doenjang", "gochujang", "ganjang", "sesame sauce"],
    },
    forVegetable: {
      leafy: ["ssamjang", "sesame oil and salt", "doenjang-based dressing"],
      root: ["chogochujang", "yangnyeom sauce", "doenjang-based"],
      mushroom: ["bulgogi sauce", "sesame oil", "doenjang soup base"],
      fermented: ["gochujang-based dressing", "garlic soy", "chili oil"],
      freshCrunch: ["gochujang vinaigrette", "chogochujang", "sesame dressing"],
    },
    forCookingMethod: {
      grilling: [
        "ssamjang",
        "gochujang glaze",
        "doenjang marinade",
        "bulgogi sauce",
      ],
      stewing: ["doenjang jjigae base", "kimchi jjigae base", "sundubu base"],
      steaming: ["sesame oil dipping sauce", "vinegar soy", "chili oil"],
      panFrying: ["yangnyeom sauce", "ganjang-based", "sweet soy glaze"],
      raw: ["chogochujang", "sesame oil and salt", "gojuchang vinaigrette"],
    },
    byAstrological: {
      Fire: [
        "hot gochujang sauce",
        "spicy tteokbokki sauce",
        "chili oil",
        "yangnyeom sauce",
        "maewoon sauce",
      ],
      Earth: [
        "doenjang",
        "aged ganjang",
        "fermented bean paste sauces",
        "perilla oil",
        "wild sesame sauce",
      ],
      Air: [
        "vinegar-based sauces",
        "citrus soy",
        "light sesame dressings",
        "yuzu dressing",
        "tangerine soy",
      ],
      Water: [
        "clear soups",
        "mild doenjang",
        "anchovy broth bases",
        "seaweed-infused dipping sauce",
        "jeotgal sauce",
      ],
    },
    byRegion: {
      seoul: [
        "balanced sweetness",
        "refined doenjang",
        "mild heat",
        "bulgogi sauce",
        "modern fusion sauces",
      ],
      jeonju: [
        "rich ganjang",
        "artisanal doenjang",
        "complex fermented flavors",
        "bibimbap sauce",
        "traditional herb oils",
      ],
      busan: [
        "seafood-focused sauces",
        "spicier profiles",
        "anchovy-based",
        "haemul broth",
        "dried fish sauces",
      ],
      jeju: [
        "citrus notes",
        "fresh seafood pairings",
        "lighter preparations",
        "hallabong dressing",
        "black pork marinades",
      ],
    },
    byDietary: {
      vegan: [
        "doenjang",
        "gochujang",
        "ganjang",
        "sesame-based sauces",
        "mushroom-based sauces",
      ],
      vegetarian: [
        "doenjang",
        "gochujang",
        "vegetable-based sauces",
        "herb-infused oils",
        "perilla seed sauce",
      ],
      glutenFree: [
        "rice-based sauces",
        "pure gochujang",
        "traditional doenjang",
        "sesame oil blends",
        "citrus dressings",
      ],
      dairyFree: [
        "most traditional Korean sauces",
        "vinegar-based dips",
        "chili oils",
        "sesame dressings",
        "fruit reductions",
      ],
      lowCarb: [
        "sesame oil dressings",
        "vinegar soy dips",
        "garlic chili oil",
        "perilla oil",
        "citrus-infused oils",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Jjim (찜)",
      description:
        "Steaming or braising technique that creates tender, juicy results",
      elementalProperties: { Water: 0.5, Earth: 0.3, Fire: 0.1, Air: 0.1 },
      toolsRequired: ["stone pot", "steamer", "heavy pot with lid"],
      bestFor: ["meats", "whole fish", "root vegetables", "egg dishes"],
      difficulty: "medium",
    },
    {
      name: "Gui (구이)",
      description:
        "Grilling methods, especially for meats like samgyeopsal and bulgogi",
      elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0.0 },
      toolsRequired: ["tabletop grill", "charcoal", "tongs", "scissors"],
      bestFor: [
        "marinated meats",
        "fresh pork belly",
        "vegetables",
        "mushrooms",
      ],
      difficulty: "easy",
    },
    {
      name: "Jjigae (찌개)",
      description: "Stew-making technique with rich, spicy broths",
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      toolsRequired: ["earthenware pot", "ladle", "heavy-bottomed pot"],
      bestFor: ["kimchi stews", "tofu dishes", "seafood", "vegetable medleys"],
      difficulty: "easy",
    },
    {
      name: "Namul (나물)",
      description:
        "Technique for seasoning and preparing vegetables to preserve nutrients",
      elementalProperties: { Earth: 0.5, Water: 0.2, Air: 0.2, Fire: 0.1 },
      toolsRequired: ["blanching pot", "mixing bowls", "dipping basket"],
      bestFor: ["wild greens", "sprouts", "seaweed", "root vegetables"],
      difficulty: "easy",
    },
    {
      name: "Jeongol (전골)",
      description: "Hot pot technique featuring communal cooking at the table",
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      toolsRequired: ["jeongol pot", "portable burner", "ladle", "chopsticks"],
      bestFor: ["thinly sliced meats", "seafood", "tofu", "vegetables"],
      difficulty: "medium",
    },
  ],
  regionalCuisines: {
    seoul: {
      name: "Seoul (Capital) Cuisine",
      description: "Refined, royal-influenced cuisine with balanced flavors",
      signature: [
        "royal court dishes",
        "japchae",
        "bulgogi",
        "refined banchan",
      ],
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Jupiter", "Mercury", "Libra"],
      seasonality: "moderately seasonal",
    },
    jeonju: {
      name: "Jeonju (Southwest) Cuisine",
      description:
        "Known as Korea's food capital, with emphasis on quality ingredients and tradition",
      signature: [
        "bibimbap",
        "kongnamul gukbap",
        "makgeolli",
        "traditional banchan",
      ],
      elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Moon", "Venus", "Taurus"],
      seasonality: "highly seasonal",
    },
    gyeongsang: {
      name: "Gyeongsang (Southeast) Cuisine",
      description: "Bold, spicy flavors with substantial seafood influence",
      signature: [
        "dwaeji gukbap",
        "milmyeon",
        "agujjim",
        "spicy seafood soups",
      ],
      elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Pluto", "Scorpio"],
      seasonality: "coastal seasonal",
    },
    jeju: {
      name: "Jeju Island Cuisine",
      description:
        "Unique island cuisine with distinctive ingredients like black pork and abalone",
      signature: [
        "black pork",
        "haemul dishes",
        "abalone porridge",
        "hallabong citrus",
      ],
      elementalProperties: { Water: 0.5, Earth: 0.2, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Neptune", "Jupiter", "Pisces"],
      seasonality: "island seasonal cycle",
    },
  },
  elementalProperties: {
    Fire: 0.3, // Represents spicy elements and grilling
    Earth: 0.3, // Represents fermented foods and root vegetables,
    Water: 0.2, // Represents soups and stews
    Air: 0.2, // Represents light broths and garnishes
  },
};

export default korean;
