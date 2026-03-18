// src/data/cuisines/thai.ts
import type { Cuisine } from "@/types/cuisine";

export const thai: Cuisine = {
  id: "thai",
  name: "Thai",
  description:
    "Traditional Thai cuisine featuring complex harmony of flavors including spicy, sweet, sour and salty elements",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Thai Jok (Congee)",
          "description": "A deeply comforting and restorative rice porridge, fundamentally rooted in Thai breakfast culture. Jok represents the harmonious alchemy of broken jasmine rice simmered into a silky suspension, enriched with deeply savory pork meatballs, warming ginger, and a suspended soft-boiled egg. It is a dish that grounds the spirit and warms the core.",
          "details": {
            "cuisine": "Thai",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 60,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": [
              "all",
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "jasmine rice",
              "notes": "Ideally broken jasmine rice. If using whole, briefly pulse in a food processor or soak overnight to encourage structural breakdown."
            },
            {
              "amount": 8,
              "unit": "cups",
              "name": "pork or chicken bone broth",
              "notes": "The foundation of the porridge's flavor; unsalted if possible to control final sodium levels."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "ground pork",
              "notes": "Not too lean; a 80/20 ratio ensures tender meatballs."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For seasoning the pork meatballs."
            },
            {
              "amount": 0.5,
              "unit": "tbsp",
              "name": "oyster sauce",
              "notes": "Adds umami depth to the pork."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "granulated sugar",
              "notes": "Balances the savory notes in the pork."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "ground white pepper",
              "notes": "Essential for the authentic, slightly floral heat. Divided: half for pork, half for garnishing."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Soft-boiled to a jammy yolk, or cracked raw directly into the boiling hot porridge upon serving."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "fresh ginger",
              "notes": "Peeled and very finely julienned (matchsticks)."
            },
            {
              "amount": 4,
              "unit": "stalks",
              "name": "green onions",
              "notes": "Finely sliced for garnish."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "Roughly chopped for garnish."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "fried garlic",
              "notes": "Crispy fried garlic bits in oil."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "seasoning sauce (Maggi) or light soy sauce",
              "notes": "For individual seasoning at the table."
            }
          ],
          "instructions": [
            "Step 1: Rinse the jasmine rice under cold water just until the water runs mostly clear. If using whole jasmine rice, place it in a mortar and pestle or food processor and briefly crack the grains to release their starches more readily.",
            "Step 2: In a large, heavy-bottomed pot, combine the cracked rice and the bone broth. Bring to a rolling boil over medium-high heat. Once boiling, immediately reduce the heat to a low simmer.",
            "Step 3: Simmer the rice uncovered for 45 to 60 minutes, stirring frequently (especially towards the end) to prevent the starches from scorching on the bottom of the pot. The porridge is ready when the grains have completely broken down into a thick, silky, homogenous suspension.",
            "Step 4: While the porridge simmers, prepare the pork meatballs. In a mixing bowl, combine the ground pork, 1 tablespoon light soy sauce, oyster sauce, sugar, and half of the white pepper. Mix vigorously by hand in one direction for 2-3 minutes until the mixture becomes sticky and cohesive.",
            "Step 5: Prepare the soft-boiled eggs. Bring a small saucepan of water to a boil. Gently lower the eggs into the water and boil for exactly 6 minutes for a jammy yolk. Transfer immediately to an ice bath, then peel.",
            "Step 6: When the porridge has reached the correct silky consistency, form the seasoned pork mixture into small, bite-sized meatballs (about 1 teaspoon each) and drop them directly into the simmering porridge.",
            "Step 7: Allow the meatballs to poach gently in the porridge for 3 to 5 minutes, or until they float and are cooked through. Adjust the consistency of the porridge with hot water if it has become too thick.",
            "Step 8: To serve, ladle the steaming hot porridge and meatballs into deep bowls. Halve a soft-boiled egg and place it in the center (or crack a raw egg into the very hot porridge).",
            "Step 9: Garnish generously with the julienned ginger, sliced green onions, cilantro, and crispy fried garlic. Serve immediately, allowing each person to season their bowl with additional white pepper and Maggi seasoning or light soy sauce to taste."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "comfort food"
            ],
            "cookingMethods": [
              "simmering",
              "poaching",
              "boiling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.6,
            "Earth": 0.2,
            "Air": 0.05
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Taurus"
            ],
            "lunarPhases": [
              "New Moon",
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 450,
            "proteinG": 28,
            "carbsG": 48,
            "fatG": 16,
            "fiberG": 2,
              "sodiumMg": 433,
              "sugarG": 14,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },

          alchemicalProperties: {"Spirit":4.96,"Essence":6.04,"Matter":5.46,"Substance":5.21},
          thermodynamicProperties: {"heat":0.0799,"entropy":0.3422,"reactivity":2.7661,"gregsEnergy":-0.8667,"kalchm":2.5542,"monica":-0.0564},
          "substitutions": [
            {
              "originalIngredient": "ground pork",
              "substituteOptions": [
                "minced shiitake mushrooms (vegan)",
                "ground chicken",
                "crumbled firm tofu"
              ]
            },
            {
              "originalIngredient": "pork or chicken bone broth",
              "substituteOptions": [
                "kombu and shiitake dashi (vegan)",
                "vegetable stock"
              ]
            },
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "silken tofu pieces (vegan)"
              ]
            }
          ]
        },
        {
          name: "Khao Tom",
          description: "Thai rice porridge, the comfort food eaten for breakfast or when ill, simmered until the jasmine rice breaks down into a silky, slightly thick broth. Unlike Chinese congee which is thick and starchy, khao tom is thinner and more broth-forward, served with an array of condiments and side dishes - pickled mustard greens, soft-boiled eggs, fried garlic, ginger slices, and crispy shallots. The porridge itself is simple; the accompaniments provide all the complexity.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"jasmine rice","notes":"Rinsed until the water runs clear. Day-old cooked rice breaks down even faster and produces a creamier texture."},{"amount":6,"unit":"cups","name":"chicken or pork broth","notes":"Homemade is significantly better. The porridge has very few components, so broth quality is paramount."},{"amount":0.5,"unit":"lb","name":"ground pork","notes":"Seasoned lightly and rolled into small meatballs for a classic khao tom moo (pork porridge) version."},{"amount":3,"unit":"cloves","name":"garlic","notes":"Thinly sliced and fried in oil until golden and crispy for garnish."},{"amount":2,"unit":"inch","name":"fresh ginger","notes":"Peeled and cut into fine julienne. Served raw alongside as a palate-cleansing condiment."},{"amount":4,"unit":"stalks","name":"green onions","notes":"Thinly sliced, for garnish."},{"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning the porridge. Start with 1 tablespoon and adjust."},{"amount":1,"unit":"tsp","name":"white pepper","notes":"Ground white pepper is the traditional spice for porridge - more aromatic and less harsh than black pepper."},{"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"For frying the garlic."},{"amount":4,"unit":"whole","name":"soft-boiled or poached eggs","notes":"Optional but classic accompaniment."}],
          instructions: ["Step 1: If making fresh, rinse the rice until water is clear. Bring the broth to a boil in a large pot. Add the rinsed rice and stir immediately to prevent clumping.","Step 2: Reduce heat to medium-low and simmer uncovered, stirring occasionally, for 25 to 35 minutes until the rice grains have swollen and split and the mixture has a smooth, porridge-like consistency. Add more broth or water if it becomes too thick.","Step 3: While the rice cooks, heat the oil in a small skillet over medium heat. Add the garlic slices and fry, stirring constantly, until golden and crispy. Watch carefully - they go from golden to burnt in seconds. Drain on paper towels.","Step 4: Season the pork with a pinch of salt and white pepper. Roll into small balls the size of a grape. When the porridge has reached the right consistency, drop the meatballs in one by one. They will cook in the simmering broth in 3 to 4 minutes.","Step 5: Season the porridge with fish sauce and white pepper. Ladle into bowls. Set the table with garnishes in small dishes: crispy fried garlic, julienned ginger, sliced green onions, and a small dish of fish sauce with white pepper and lime juice for individual seasoning."],
          classifications: {"mealType":["breakfast","comfort","sick food"],"cookingMethods":["simmering","poaching"]},
          elementalProperties: {"Fire":0.1,"Water":0.55,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Saturn"],"signs":["cancer","capricorn"],"lunarPhases":["Waning Crescent","New Moon"]},
          nutritionPerServing: {"calories":285,"proteinG":18,"carbsG":35,"fatG":8,"fiberG":1,"sodiumMg":820,"sugarG":2,"vitamins":["Niacin","Vitamin B6"],"minerals":["Phosphorus","Potassium","Selenium"]},

          alchemicalProperties: {"Spirit":4.13,"Essence":4.61,"Matter":4.23,"Substance":4.14},
          thermodynamicProperties: {"heat":0.0886,"entropy":0.3643,"reactivity":2.7174,"gregsEnergy":-0.9014,"kalchm":2.5103,"monica":-0.0376},
          substitutions: [{"originalIngredient":"ground pork","substituteOptions":["chicken breast, poached and shredded","firm tofu, crumbled (vegetarian)"]},{"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian/vegan)","tamari (gluten-free)"]}]
        },
        {
          name: "Patongo with Sangkaya",
          description: "Thailand's most beloved breakfast: long, twin-twisted Chinese-origin fried dough sticks (patongo or pa thong ko) served with sangkaya - a silky, fragrant Thai coconut pandan custard for dipping. The hollow, airy, slightly salty-savory fried dough contrasts with the cool, sweet, intensely pandan-perfumed custard. Found at early-morning street carts where the dough is fried to order and the custard is made in advance and kept at room temperature or lightly chilled.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"all-purpose flour","notes":"For the patongo dough."},{"amount":1,"unit":"tsp","name":"baking powder","notes":"Gives the dough its characteristic airy rise in the hot oil."},{"amount":0.5,"unit":"tsp","name":"baking soda","notes":"Works with the baking powder for maximum lift."},{"amount":0.5,"unit":"tsp","name":"salt","notes":"Essential savory note in the dough."},{"amount":0.75,"unit":"cup","name":"warm water","notes":"Mixed with the dry ingredients to form a soft dough. Too much water makes a sticky, unmanageable dough."},{"amount":2,"unit":"cups","name":"vegetable oil","notes":"For deep frying. At least 2 inches deep in the pot. Peanut oil is traditional."},{"amount":4,"unit":"large","name":"eggs","notes":"For the sangkaya custard."},{"amount":1,"unit":"cup","name":"full-fat coconut milk","notes":"For the custard. The fat content of the coconut milk determines the custard richness."},{"amount":0.5,"unit":"cup","name":"palm sugar or light brown sugar","notes":"For the custard. Palm sugar gives a more authentic, slightly caramel flavor."},{"amount":4,"unit":"leaves","name":"fresh pandan leaves","notes":"Knotted and simmered in the coconut milk to infuse. The defining flavor of Thai custard. If unavailable, a few drops of pandan extract can substitute."}],
          instructions: ["Step 1: Make the sangkaya first as it needs to chill. Simmer the coconut milk with the knotted pandan leaves for 5 minutes to infuse. Remove the pandan. Whisk the eggs with the sugar in a bowl until the sugar dissolves. Slowly pour the warm coconut milk into the eggs while whisking constantly. Pour into a steamer-safe dish.","Step 2: Steam the custard mixture over gently simmering water for 20 to 25 minutes until just set - it should wobble slightly in the center but not be liquid. Cool completely then refrigerate. Properly steamed sangkaya is smooth as silk with no bubbles.","Step 3: Make the patongo dough by mixing flour, baking powder, baking soda, and salt. Add warm water and mix to a shaggy dough. Knead briefly until smooth. Cover and rest 30 minutes.","Step 4: Heat oil in a wok or deep pot to 375F (190C). Roll the dough into a log and cut into small portions. Shape each into a rectangle. Place two rectangles on top of each other and press a chopstick down the center lengthwise to seal them together - this is the traditional shape that causes the dough to puff and split open.","Step 5: Drop the paired dough pieces into the hot oil and fry for 2 to 3 minutes, turning continuously with chopsticks, until puffed, golden, and hollow. Drain. Serve immediately alongside the cold sangkaya for dipping."],
          classifications: {"mealType":["breakfast","snack"],"cookingMethods":["deep-frying","steaming"]},
          elementalProperties: {"Fire":0.35,"Water":0.25,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Jupiter"],"signs":["leo","sagittarius"],"lunarPhases":["Waxing Crescent","Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":10,"carbsG":48,"fatG":22,"fiberG":1,"sodiumMg":380,"sugarG":18,"vitamins":["Riboflavin","Folate"],"minerals":["Manganese","Phosphorus","Iron"]},

          alchemicalProperties: {"Spirit":2.04,"Essence":2.74,"Matter":3.89,"Substance":3.18},
          thermodynamicProperties: {"heat":0.0392,"entropy":0.2795,"reactivity":1.2518,"gregsEnergy":-0.3107,"kalchm":0.0087,"monica":0.3344},
          substitutions: [{"originalIngredient":"palm sugar in custard","substituteOptions":["light brown sugar","coconut sugar"]},{"originalIngredient":"pandan leaves","substituteOptions":["pandan extract (a few drops)","vanilla bean (different flavor profile, but similar aromatic function)"]}]
        },
        {
          name: "Khao Kai Jeow",
          description: "The Thai omelette over rice - arguably the most comforting and complete single-dish meal in Thai cuisine. Eggs are beaten with fish sauce and possibly a little soy sauce, then dropped into a generous pool of very hot oil in a wok to create a dramatically puffed, lacy-edged, crispy-outside omelette in under 90 seconds. The contrast between the crunchy, golden exterior and the custardy, barely-set interior served over hot jasmine rice with sriracha is deeply satisfying. A proper kai jeow must use abundant oil for the characteristic texture.",
          details: {"cuisine":"Thai","prepTimeMinutes":5,"cookTimeMinutes":5,"baseServingSize":1,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"large","name":"eggs","notes":"Room temperature eggs puff better than cold. Beat vigorously until completely homogeneous - no visible white streaks."},{"amount":1,"unit":"tbsp","name":"fish sauce","notes":"The primary seasoning. Do not substitute soy sauce alone - fish sauce gives the characteristic umami and subtle fishiness that defines this dish."},{"amount":0.5,"unit":"tsp","name":"white sugar","notes":"A tiny amount balances the saltiness of the fish sauce."},{"amount":3,"unit":"tbsp","name":"vegetable oil","notes":"More oil than you think is necessary. The egg needs to be semi-submerged for the characteristic puffy, lacy edges. Peanut oil or lard is traditional."},{"amount":1,"unit":"cup","name":"hot cooked jasmine rice","notes":"The canvas for the omelette. Must be freshly cooked and hot."},{"amount":1,"unit":"tbsp","name":"sriracha or prik nam pla","notes":"Prik nam pla (fish sauce with fresh chilies and lime) is the more authentic condiment - mix fish sauce, chopped fresh chilies, and a squeeze of lime."}],
          instructions: ["Step 1: Beat the eggs vigorously in a bowl with the fish sauce and sugar until completely smooth and somewhat foamy. The more air beaten in, the better the puff.","Step 2: Heat the oil in a wok over maximum heat until the oil is shimmering and just beginning to smoke. This high heat is non-negotiable.","Step 3: Pour the beaten egg mixture into the center of the hot oil from a height of 6 to 8 inches - this height increases splashing and creates the lacy edges. The egg will immediately sizzle and puff dramatically.","Step 4: Using a wok spatula, quickly spoon the hot oil over the top of the egg to encourage even cooking and puffing. The entire process from pour to plate should take only 60 to 90 seconds.","Step 5: When the edges are crispy and golden and the center is just set but still custardy, fold in half or slide directly onto the hot jasmine rice. Drizzle with sriracha or prik nam pla. Eat immediately while the contrast between crispy exterior and soft interior remains at its peak."],
          classifications: {"mealType":["breakfast","lunch","dinner","comfort"],"cookingMethods":["deep-frying","wok cooking"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Mars"],"signs":["aries","leo"],"lunarPhases":["Full Moon","First Quarter"]},
          nutritionPerServing: {"calories":480,"proteinG":16,"carbsG":45,"fatG":26,"fiberG":1,"sodiumMg":920,"sugarG":2,"vitamins":["Vitamin A","Riboflavin","Vitamin B12"],"minerals":["Selenium","Phosphorus","Choline"]},

          alchemicalProperties: {"Spirit":1.68,"Essence":2.24,"Matter":2.17,"Substance":2.04},
          thermodynamicProperties: {"heat":0.06,"entropy":0.2967,"reactivity":2.0016,"gregsEnergy":-0.534,"kalchm":0.6329,"monica":0.7162},
          substitutions: [{"originalIngredient":"fish sauce","substituteOptions":["soy sauce plus a few drops of lime juice (vegetarian)","tamari"]},{"originalIngredient":"vegetable oil","substituteOptions":["lard (more traditional)","pork fat","coconut oil"]}]
        },
        {
          name: "Khao Tom Moo",
          description: "Pork rice porridge, the Thai iteration of khao tom featuring seasoned ground pork meatballs, thinly sliced pork, or pork with preserved vegetables poached gently in a clean, clear rice-thickened broth. A deeply restorative early-morning meal sold at street stalls before dawn, khao tom moo is thinner and clearer than Chinese congee, with the rice acting more as a thickener than the main body. The garnishes - crispy garlic oil, fresh ginger, green onions - provide aromatic contrast.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":35,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"jasmine rice","notes":"Rinsed well. Day-old leftover rice breaks down faster."},{"amount":7,"unit":"cups","name":"pork or chicken stock","notes":"The quality of the stock determines everything. Use good homemade stock if possible."},{"amount":0.5,"unit":"lb","name":"ground pork","notes":"Seasoned with fish sauce, white pepper, and a pinch of sugar, then rolled into small marble-sized balls."},{"amount":0.25,"unit":"lb","name":"thinly sliced pork loin","notes":"Sliced against the grain into bite-sized pieces for additional texture."},{"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning both the meatballs and the finished broth. Adjust to taste."},{"amount":1,"unit":"tsp","name":"white pepper","notes":"Ground white pepper is essential - black pepper gives a completely different character."},{"amount":3,"unit":"cloves","name":"garlic","notes":"Minced and fried in oil until golden for the crispy garlic oil garnish."},{"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"For the garlic oil."},{"amount":4,"unit":"stalks","name":"green onions","notes":"Thinly sliced."},{"amount":2,"unit":"inch","name":"fresh ginger","notes":"Peeled and cut into fine julienne strips."},{"amount":2,"unit":"tbsp","name":"preserved Chinese mustard greens (chai poh)","notes":"Rinsed of excess salt and roughly chopped. Optional but adds characteristic savory-salty depth."}],
          instructions: ["Step 1: Fry the minced garlic in oil in a small pan over medium heat until golden and crispy. Reserve the garlic and the fragrant oil separately.","Step 2: Bring the stock to a boil. Add the rinsed rice, reduce to a medium simmer, and cook for 20 to 25 minutes, stirring occasionally, until the rice grains have burst and the broth has thickened slightly to a porridge consistency. Add more stock if it thickens too much.","Step 3: Season the ground pork with fish sauce, white pepper, and a pinch of sugar. Roll into small balls. Season the sliced pork with fish sauce and white pepper as well.","Step 4: When the porridge reaches the right consistency, drop in the pork meatballs and sliced pork. Simmer gently for 4 to 5 minutes until the pork is cooked through. Season the broth with fish sauce and white pepper.","Step 5: Ladle into bowls. Garnish each bowl with crispy fried garlic, a drizzle of garlic oil, julienned ginger, sliced green onions, and a small amount of preserved mustard greens if using. Serve with a small dish of prik nam pla (fish sauce with chopped fresh chilies) for individual heat adjustment."],
          classifications: {"mealType":["breakfast","comfort","sick food"],"cookingMethods":["simmering","poaching"]},
          elementalProperties: {"Fire":0.1,"Water":0.55,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Saturn"],"signs":["cancer","virgo"],"lunarPhases":["Waning Crescent","New Moon"]},
          nutritionPerServing: {"calories":310,"proteinG":22,"carbsG":36,"fatG":9,"fiberG":1,"sodiumMg":880,"sugarG":2,"vitamins":["Niacin","Vitamin B6","Thiamin"],"minerals":["Phosphorus","Potassium","Selenium"]},

          alchemicalProperties: {"Spirit":4.68,"Essence":5.26,"Matter":5.21,"Substance":5.01},
          thermodynamicProperties: {"heat":0.0817,"entropy":0.3669,"reactivity":2.4699,"gregsEnergy":-0.8245,"kalchm":0.4878,"monica":-0.0376},
          substitutions: [{"originalIngredient":"ground pork","substituteOptions":["ground chicken","shrimp (added in last 2 minutes)"]},{"originalIngredient":"chai poh (preserved mustard greens)","substituteOptions":["sliced pickled ginger","finely chopped kimchi"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          name: "Pad Kra Pao",
          description: "Thailand's most popular workday lunch - a blazingly fast stir-fry of minced or ground pork (or chicken) with garlic, bird eye chilies, and holy basil (kra pao), sauced with fish sauce, oyster sauce, and a touch of sugar. Served over rice and crowned with a kai dao (Thai fried egg) with crispy, lacy edges and a runny yolk. The key is maximum heat and holy basil added at the very end with the heat off - not sweet Thai basil, which has a completely different character. This dish defines the energy of Bangkok street food.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":8,"baseServingSize":2,"spiceLevel":"Hot","season":["all"]},
          ingredients: [{"amount":0.75,"unit":"lb","name":"ground pork or finely minced pork","notes":"80/20 fat ratio is ideal. Very lean pork will be dry and bland under the high heat."},{"amount":6,"unit":"cloves","name":"garlic","notes":"Coarsely smashed and roughly chopped. Not minced fine - you want visible pieces."},{"amount":4,"unit":"whole","name":"bird eye chilies","notes":"Coarsely sliced. Adjust quantity for heat level. Thais use 5 to 10 for a properly fiery version."},{"amount":2,"unit":"tbsp","name":"oyster sauce","notes":"Provides the body and slight sweetness of the sauce."},{"amount":1,"unit":"tbsp","name":"fish sauce","notes":"Seasoning and umami."},{"amount":1,"unit":"tbsp","name":"light soy sauce","notes":"Additional salt and color."},{"amount":1,"unit":"tsp","name":"dark soy sauce","notes":"For color only. A small amount gives the dish its characteristic mahogany color."},{"amount":1,"unit":"tsp","name":"sugar","notes":"Palm sugar is traditional. Balances the salty elements."},{"amount":1,"unit":"cup","name":"fresh holy basil leaves","notes":"Kra pao, not Thai sweet basil (horapa). Holy basil has a peppery, clove-like quality. Added off heat only."},{"amount":3,"unit":"tbsp","name":"vegetable oil","notes":"For the stir-fry. The wok should be smoking before the garlic goes in."}],
          instructions: ["Step 1: Mix the oyster sauce, fish sauce, soy sauces, and sugar together in a small bowl to create the sauce. Have all ingredients prepped and within reach - this cooks in under 5 minutes.","Step 2: Heat a wok or large skillet over maximum heat until smoking. Add oil. Immediately add the garlic and chilies and fry for 20 to 30 seconds until fragrant and slightly golden.","Step 3: Add the ground pork and spread it across the wok surface. Leave undisturbed for 30 seconds to sear. Then break it apart vigorously with a spatula and toss constantly to brown evenly. The meat should be getting crispy at the edges.","Step 4: When the pork is fully cooked and beginning to caramelize, pour the sauce over and toss to coat everything evenly. Cook for 30 more seconds until the sauce is absorbed and the pork looks glossy.","Step 5: Remove the wok from heat completely. Add the holy basil leaves and toss with the residual heat. They will wilt in seconds. Taste and adjust seasoning. Serve immediately over hot jasmine rice, topped with a Thai fried egg (kai dao) cooked in abundant oil until the edges are crispy and the yolk is just runny."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["stir-frying","wok cooking"]},
          elementalProperties: {"Fire":0.5,"Water":0.15,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["Full Moon","First Quarter"]},
          nutritionPerServing: {"calories":520,"proteinG":32,"carbsG":48,"fatG":22,"fiberG":2,"sodiumMg":1180,"sugarG":6,"vitamins":["Niacin","Vitamin B6","Vitamin K"],"minerals":["Zinc","Iron","Selenium"]},

          alchemicalProperties: {"Spirit":3.79,"Essence":5.01,"Matter":3.85,"Substance":3.59},
          thermodynamicProperties: {"heat":0.0871,"entropy":0.3209,"reactivity":3.1312,"gregsEnergy":-0.9175,"kalchm":28.3411,"monica":0.5572},
          substitutions: [{"originalIngredient":"ground pork","substituteOptions":["ground chicken","minced beef","firm tofu crumbled (vegetarian)"]},{"originalIngredient":"holy basil (kra pao)","substituteOptions":["Italian basil plus a few Thai sweet basil leaves (approximate substitute)","no perfect substitute - the dish is fundamentally different without it"]}]
        },
        {
          name: "Khao Soi",
          description: "Northern Thailand's iconic curry noodle soup - a Northern Thai and Chiang Mai specialty influenced by Burmese and Yunnan Chinese cooking. Egg noodles are served in a coconut-curry broth with slow-braised chicken drumsticks, then topped with a handful of the same noodles deep-fried until shatteringly crispy. The contrast of silky boiled noodles in the creamy, aromatic curry broth topped with brittle, oily fried noodles is unique. Condiments of pickled mustard greens, shallots, lime, and nam prik pao complete the table.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["winter","autumn"]},
          ingredients: [{"amount":4,"unit":"whole","name":"chicken drumsticks","notes":"Bone-in for depth of flavor. Thighs work equally well."},{"amount":400,"unit":"g","name":"fresh or dried egg noodles","notes":"Medium-width. Half will be boiled for the bowl; the other half deep-fried for the topping."},{"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Full-fat only. Light coconut milk produces a watery, thin broth."},{"amount":2,"unit":"cups","name":"chicken stock","notes":"For thinning the curry to the right broth consistency."},{"amount":3,"unit":"tbsp","name":"red curry paste","notes":"Or khao soi curry paste if available. Red curry paste gives an approximate flavor profile."},{"amount":1,"unit":"tbsp","name":"curry powder","notes":"Mixed into the coconut milk before adding the curry paste. Gives the characteristic golden-orange color."},{"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning throughout."},{"amount":1,"unit":"tbsp","name":"palm sugar","notes":"To balance the broth."},{"amount":2,"unit":"cups","name":"vegetable oil","notes":"For deep-frying the noodle topping."},{"amount":4,"unit":"tbsp","name":"pickled mustard greens (chai poh)","notes":"Rinsed and chopped, served alongside as a condiment."},{"amount":4,"unit":"small","name":"shallots","notes":"Thinly sliced, for the condiment plate."}],
          instructions: ["Step 1: Deep-fry a handful of the raw egg noodles in hot oil until golden and crispy (about 1 minute). Drain and set aside as the topping. This can be done in advance.","Step 2: In a large pot, heat a tablespoon of oil over medium heat. Add the curry paste and fry for 2 minutes until fragrant and darkened. Add the curry powder and stir for 30 seconds.","Step 3: Pour in half the coconut milk and stir constantly until the fat separates and the mixture is fragrant, about 3 to 5 minutes. Add the chicken drumsticks and turn to coat in the paste.","Step 4: Add the remaining coconut milk, chicken stock, fish sauce, and palm sugar. Bring to a gentle simmer. Cook partially covered for 30 to 35 minutes until the chicken is tender and beginning to pull from the bone.","Step 5: Cook the remaining egg noodles in boiling water until al dente. Drain and divide among bowls. Ladle the curry broth and a drumstick over each portion. Crown with a generous pile of crispy fried noodles. Set out a condiment plate of pickled mustard greens, sliced shallots, lime wedges, and nam prik pao for each diner to customize their bowl."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["simmering","deep-frying","braising"]},
          elementalProperties: {"Fire":0.35,"Water":0.3,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Jupiter","Saturn"],"signs":["sagittarius","capricorn"],"lunarPhases":["Waxing Gibbous","Full Moon"]},
          nutritionPerServing: {"calories":680,"proteinG":38,"carbsG":58,"fatG":32,"fiberG":4,"sodiumMg":980,"sugarG":10,"vitamins":["Niacin","Vitamin A","Vitamin B6"],"minerals":["Iron","Potassium","Phosphorus"]},

          alchemicalProperties: {"Spirit":3.25,"Essence":4.37,"Matter":4.76,"Substance":4.55},
          thermodynamicProperties: {"heat":0.052,"entropy":0.3351,"reactivity":2.0153,"gregsEnergy":-0.6232,"kalchm":0.0175,"monica":0.4654},
          substitutions: [{"originalIngredient":"chicken drumsticks","substituteOptions":["firm tofu (vegetarian)","beef shank slices","shrimp (much shorter cooking time)"]},{"originalIngredient":"egg noodles","substituteOptions":["rice noodles (gluten-free)","ramen noodles"]}]
        },
        {
          "name": "Authentic Som Tam",
          "description": "An explosive study in the Thai concept of 'Rot Chat'.",
          "details": {
            "cuisine": "Thai",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 0,
            "baseServingSize": 2,
            "spiceLevel": "Fiery",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 2.5,
              "unit": "cups",
              "name": "green papaya",
              "notes": "Shredded."
            }
          ],
          "instructions": [
            "Step 1: Pound garlic and chilies.",
            "Step 2: Bruise beans and tomatoes.",
            "Step 3: Toss papaya."
          ],
          "classifications": {
            "mealType": [
              "salad"
            ],
            "cookingMethods": [
              "pounding"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.25,
            "Earth": 0.2,
            "Air": 0.2
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
            "calories": 180,
            "proteinG": 6,
            "carbsG": 28,
            "fatG": 7,
            "fiberG": 5,
              "sodiumMg": 530,
              "sugarG": 15,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },

          alchemicalProperties: {"Spirit":0.35,"Essence":0.75,"Matter":0.25,"Substance":0.2},
          thermodynamicProperties: {"heat":0.0716,"entropy":0.1546,"reactivity":4.6914,"gregsEnergy":-0.6536,"kalchm":1.089,"monica":0.4376},
          "substitutions": []
        },
        {
          name: "Tom Yum Goong",
          description: "Thailand's most iconic hot and sour soup, a violent aromatic infusion of galangal, lemongrass, and makrut lime leaf with plump shrimp, mushrooms, and a bracing lime finish. The Nam Sai (clear) version relies entirely on the intensity of the herbal broth rather than any dairy emulsion.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Hot","season":["all"]},
          ingredients: [
            {"amount":4,"unit":"cups","name":"shrimp or chicken stock","notes":"Ideally made from the shells of the shrimp for maximum depth."},
            {"amount":500,"unit":"g","name":"large shrimp","notes":"Peeled and deveined, shells reserved for stock."},
            {"amount":3,"unit":"stalks","name":"lemongrass","notes":"Outer leaves removed, stalks bruised with the back of a knife and cut into 2-inch sections."},
            {"amount":6,"unit":"slices","name":"fresh galangal","notes":"Do not substitute dried galangal or ginger. Fresh galangal has an entirely different aromatic profile."},
            {"amount":6,"unit":"leaves","name":"makrut lime leaves","notes":"Torn in half to release the essential oils from the central rib. Also called kaffir lime leaves."},
            {"amount":200,"unit":"g","name":"straw or oyster mushrooms","notes":"Halved or torn into bite-sized pieces."},
            {"amount":3,"unit":"whole","name":"bird eye chilies","notes":"Lightly crushed to release heat without fully disintegrating."},
            {"amount":4,"unit":"tbsp","name":"fresh lime juice","notes":"Added strictly off the heat. Approximately 2-3 limes."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"Added off the heat. Adjust to taste."},
            {"amount":1,"unit":"tbsp","name":"Nam Prik Pao","notes":"Thai roasted chili jam. Adds a deep, smoky sweetness. Essential."},
            {"amount":0.5,"unit":"cup","name":"fresh cilantro","notes":"Leaves and tender stems."}
          ],
          instructions: [
            "Step 1: The Shell Stock. If time permits, simmer shrimp shells in 4 cups of water for 10 minutes. Strain. This creates a deep, oceanic broth base superior to plain water.",
            "Step 2: The Aromatic Infusion. Bring the stock to a rolling boil. Add the bruised lemongrass sections, galangal slices, torn makrut lime leaves, and crushed chilies. Boil aggressively for 4-5 minutes. The kitchen will fill with an intensely citrus-herbal aroma.",
            "Step 3: The Mushrooms. Add the mushrooms to the boiling aromatic broth. Cook for 2-3 minutes until tender.",
            "Step 4: The Chili Jam. Stir in the Nam Prik Pao. It will dissolve into the broth, turning it a deeper, amber-tinged color with a faint smokiness.",
            "Step 5: The Shrimp Poach. Add the shrimp to the simmering broth. Cook for exactly 60-90 seconds until they just turn fully pink and curl. Remove from heat immediately. Overcooking shrimp is the cardinal sin of this dish.",
            "Step 6: The Acid Finish. Off the heat, stir in the fresh lime juice and fish sauce. These must never be boiled as heat destroys their delicate, bright notes. Taste and adjust the balance: it must be sharply sour, intensely savory, aromatic, and hot.",
            "Step 7: Serve. Ladle into bowls and garnish generously with fresh cilantro. Note: the lemongrass, galangal, and lime leaves are aromatic, not edible. Eat around them."
          ],
          classifications: {"mealType":["soup","dinner","lunch"],"cookingMethods":["simmering","infusing","poaching"]},
          elementalProperties: {"Fire":0.45,"Water":0.35,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Neptune"],"signs":["aries","pisces"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":185,"proteinG":24,"carbsG":9,"fatG":5,"fiberG":2,"sodiumMg":1100,"sugarG":4,"vitamins":["Vitamin C","Vitamin B12"],"minerals":["Selenium","Iodine"]},

          alchemicalProperties: {"Spirit":4.1,"Essence":5.47,"Matter":3.67,"Substance":3.61},
          thermodynamicProperties: {"heat":0.0962,"entropy":0.3268,"reactivity":4.2284,"gregsEnergy":-1.2856,"kalchm":291.2588,"monica":-0.2241},
          substitutions: [
            {"originalIngredient":"shrimp","substituteOptions":["chicken pieces (simmer longer)","squid rings","mixed seafood"]},
            {"originalIngredient":"straw mushrooms","substituteOptions":["oyster mushrooms","shiitake mushrooms"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce plus nori flakes (vegetarian)"]}
          ]
        },
        {
          name: "Yum Woon Sen",
          description: "Thai glass noodle salad - a light, intensely flavored yum (salad) featuring mung bean vermicelli tossed with ground pork or shrimp, Chinese celery, tomatoes, shallots, dried shrimp, and toasted peanuts in a dressing that hits all the Thai flavor dimensions simultaneously: sour lime, salty fish sauce, fiery chilies, savory toasted shrimp, and a hint of sweet. Glass noodles have a translucent, slippery quality when soaked that absorbs the dressing while maintaining a pleasant chew. Served at room temperature.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":10,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":100,"unit":"g","name":"glass noodles (mung bean vermicelli)","notes":"Soaked in cold water for 10 minutes until pliable, then drained. Do not use boiling water or they become mushy."},{"amount":0.5,"unit":"lb","name":"ground pork","notes":"Cooked by breaking into small pieces in boiling water or in a dry pan. Cooled before mixing."},{"amount":0.5,"unit":"lb","name":"medium shrimp","notes":"Peeled, deveined, and briefly poached. Can use pork alone."},{"amount":0.25,"unit":"cup","name":"dried shrimp","notes":"Briefly toasted in a dry pan. Adds an intense, funky, savory depth."},{"amount":2,"unit":"stalks","name":"Chinese celery or regular celery","notes":"Thinly sliced on the diagonal. Chinese celery has a more intense flavor."},{"amount":3,"unit":"small","name":"shallots","notes":"Thinly sliced. Their sharp sweetness is key to the salad."},{"amount":2,"unit":"medium","name":"tomatoes","notes":"Cut into wedges."},{"amount":4,"unit":"whole","name":"bird eye chilies","notes":"Finely sliced. Adjust for heat level."},{"amount":4,"unit":"tbsp","name":"fresh lime juice","notes":"Freshly squeezed. The backbone of the dressing."},{"amount":3,"unit":"tbsp","name":"fish sauce","notes":"For salinity and umami. Adjust to taste."},{"amount":1,"unit":"tsp","name":"palm sugar","notes":"To slightly round the dressing."},{"amount":3,"unit":"tbsp","name":"roasted peanuts","notes":"Roughly crushed. For crunch and richness."}],
          instructions: ["Step 1: Soak the glass noodles in cold water for 10 minutes. Drain and cut into manageable 6-inch lengths with scissors. Blanch in boiling water for 30 seconds only. Drain and cool with cold water immediately to prevent clumping. The noodles should be translucent and slightly chewy.","Step 2: Cook the ground pork by either breaking it into small pieces in a skillet over high heat until cooked through, or simmering in boiling water. Season with a splash of fish sauce. Cool completely.","Step 3: Briefly poach the shrimp in boiling salted water until just pink. Drain and cool. Toast the dried shrimp in a dry skillet over medium heat for 2 minutes until fragrant.","Step 4: Make the dressing by combining lime juice, fish sauce, and palm sugar. Stir until the sugar dissolves. Add the sliced chilies.","Step 5: In a large bowl, combine the cooled glass noodles, pork, shrimp, dried shrimp, Chinese celery, shallots, and tomato wedges. Pour the dressing over and toss thoroughly. Taste and adjust the balance - it should be aggressively sour and salty with noticeable heat. Transfer to a serving plate and top with crushed peanuts. Serve at room temperature."],
          classifications: {"mealType":["salad","lunch","dinner"],"cookingMethods":["boiling","mixing","toasting"]},
          elementalProperties: {"Fire":0.3,"Water":0.35,"Earth":0.2,"Air":0.15},
          astrologicalAffinities: {"planets":["Mercury","Mars"],"signs":["gemini","aries"],"lunarPhases":["Waxing Crescent","First Quarter"]},
          nutritionPerServing: {"calories":285,"proteinG":22,"carbsG":28,"fatG":9,"fiberG":3,"sodiumMg":980,"sugarG":6,"vitamins":["Vitamin C","Niacin","Vitamin B12"],"minerals":["Selenium","Iodine","Zinc"]},

          alchemicalProperties: {"Spirit":3.29,"Essence":5.59,"Matter":4.89,"Substance":4.62},
          thermodynamicProperties: {"heat":0.0437,"entropy":0.2653,"reactivity":2.4568,"gregsEnergy":-0.6082,"kalchm":0.2743,"monica":0.5298},
          substitutions: [{"originalIngredient":"glass noodles","substituteOptions":["rice vermicelli","shirataki noodles (low-carb)"]},{"originalIngredient":"dried shrimp","substituteOptions":["1 tbsp fish sauce plus toasted sesame seeds","nori flakes for umami (vegetarian)"]}]
        },
      ],
      summer: [
        {
          name: "Som Tam Thai",
          description: "The Bangkok-style green papaya salad that balances four elemental Thai flavors - hot, sour, salty, sweet - in a single dish assembled with a large ceramic mortar and wooden pestle. Unlike the Isaan version which uses fermented fish sauce and whole crabs, som tam Thai uses regular fish sauce, peanuts, and dried shrimp for a cleaner, more accessible flavor profile. The pounding technique bruises but does not pulverize - the papaya shreds should remain intact but seasoned through and through.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":0,"baseServingSize":2,"spiceLevel":"Hot","season":["summer"]},
          ingredients: [{"amount":2.5,"unit":"cups","name":"green papaya","notes":"Peeled, seeded, and shredded into fine julienne strips using a mandoline or julienne peeler. Green (unripe) papaya only - ripe papaya has the wrong texture and sweetness."},{"amount":6,"unit":"whole","name":"bird eye chilies","notes":"Adjust for heat level. Thais often use 10 or more. Pound briefly with the garlic."},{"amount":4,"unit":"cloves","name":"garlic","notes":"Pounded with the chilies in the first step."},{"amount":0.5,"unit":"cup","name":"long beans or green beans","notes":"Cut into 2-inch lengths. Pounded lightly to bruise - creates pockets to absorb the dressing."},{"amount":1,"unit":"cup","name":"cherry tomatoes","notes":"Halved. Added and bruised lightly - they should release some juice into the dressing."},{"amount":3,"unit":"tbsp","name":"dried shrimp","notes":"Adds savory, oceanic depth. Briefly pounded to separate."},{"amount":3,"unit":"tbsp","name":"roasted peanuts","notes":"Roughly crushed, not ground to powder."},{"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"Freshly squeezed. The sourness is the dominant flavor note."},{"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity. The quality of fish sauce matters here."},{"amount":1.5,"unit":"tbsp","name":"palm sugar","notes":"Melted or very finely shaved. Balances the sourness and heat."},{"amount":1,"unit":"tbsp","name":"tamarind paste","notes":"Diluted in a little water. Optional but adds more complex sourness."}],
          instructions: ["Step 1: Using a large clay mortar and wooden pestle, pound the garlic and chilies into a rough paste. This should take about 30 seconds - you want visible pieces, not powder.","Step 2: Add the dried shrimp and pound briefly to mix and separate the shrimp into small pieces.","Step 3: Add the long bean pieces and pound lightly - three or four strikes to bruise and crack them. They should remain identifiable, not mushy.","Step 4: Add the cherry tomatoes and press with the pestle to lightly crush and release juice. Add the palm sugar and stir until it dissolves in the tomato juice.","Step 5: Add the shredded green papaya and the lime juice, fish sauce, and tamarind paste. Using the pestle and a large spoon, toss and lightly pound the salad to integrate the flavors - the papaya should be slightly compressed and absorbing the dressing. Taste and adjust: the balance should be simultaneously tart, savory, hot, and sweet, with no one element dominating. Transfer to a plate and top with crushed peanuts. Serve immediately."],
          classifications: {"mealType":["salad","appetizer","side"],"cookingMethods":["pounding","mixing"]},
          elementalProperties: {"Fire":0.4,"Water":0.3,"Earth":0.2,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","gemini"],"lunarPhases":["New Moon","Waxing Crescent"]},
          nutritionPerServing: {"calories":175,"proteinG":8,"carbsG":24,"fatG":6,"fiberG":4,"sodiumMg":780,"sugarG":14,"vitamins":["Vitamin C","Vitamin A","Folate"],"minerals":["Potassium","Iron","Calcium"]},

          alchemicalProperties: {"Spirit":4.08,"Essence":5.49,"Matter":3.7,"Substance":3.38},
          thermodynamicProperties: {"heat":0.0969,"entropy":0.3008,"reactivity":3.8442,"gregsEnergy":-1.0593,"kalchm":458.8395,"monica":0.5486},
          substitutions: [{"originalIngredient":"green papaya","substituteOptions":["green mango (more sour)","kohlrabi (firm and mild)","cucumber (softer result)"]},{"originalIngredient":"dried shrimp","substituteOptions":["nori flakes plus toasted sesame (vegetarian)","no substitute if omitting - it creates a different dish"]}]
        },
      ],
      winter: [
        {
          name: "Khao Kha Moo",
          description: "Braised pork leg over rice - a Chinese-Thai street food classic of pork trotters or leg slow-braised for hours in a master stock of five-spice, star anise, cinnamon, oyster sauce, and dark soy sauce until the collagen transforms into a trembling, gelatinous richness. Served sliced over rice with the braising liquid reduced to a glossy sauce, accompanied by hard-boiled eggs stained mahogany from the braise, pickled mustard greens, and a fiery sriracha-garlic vinegar sauce. The fat and skin are inseparable from the dish's appeal.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":180,"baseServingSize":4,"spiceLevel":"Low","season":["winter","autumn"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"pork leg or pork trotter","notes":"With skin and some bone. The skin and connective tissue are essential - they provide the gelatinous sauce. Have the butcher cut into 2-inch cross sections."},{"amount":4,"unit":"whole","name":"eggs","notes":"Hard-boiled, peeled, and added to the braise to absorb the flavors and turn deep mahogany."},{"amount":3,"unit":"tbsp","name":"dark soy sauce","notes":"For deep color and mellow saltiness. Dark soy is sweeter and thicker than regular soy."},{"amount":2,"unit":"tbsp","name":"light soy sauce","notes":"For additional salinity."},{"amount":2,"unit":"tbsp","name":"oyster sauce","notes":"Adds body and sweetness to the braising liquid."},{"amount":2,"unit":"tbsp","name":"palm sugar or brown sugar","notes":"Balances the saltiness and gives the sauce a glossy sheen."},{"amount":3,"unit":"whole","name":"star anise","notes":"Central aromatic in the five-spice profile."},{"amount":1,"unit":"whole","name":"cinnamon stick","notes":"Adds warmth."},{"amount":1,"unit":"tsp","name":"five-spice powder","notes":"The defining seasoning blend."},{"amount":1,"unit":"head","name":"garlic","notes":"Halved horizontally, unpeeled."},{"amount":4,"unit":"cups","name":"water or light pork stock","notes":"For the braising liquid."},{"amount":4,"unit":"portions","name":"hot jasmine rice","notes":"Served underneath the pork."},{"amount":0.5,"unit":"cup","name":"pickled mustard greens","notes":"Sliced, for serving alongside. Their sourness cuts through the rich pork fat."}],
          instructions: ["Step 1: Briefly blanch the pork pieces in boiling water for 3 minutes to remove impurities and tighten the skin. Drain and rinse.","Step 2: In a heavy-bottomed pot, combine the water or stock, dark soy sauce, light soy sauce, oyster sauce, palm sugar, star anise, cinnamon, five-spice powder, and garlic head. Bring to a boil and stir to dissolve the sugar.","Step 3: Add the blanched pork pieces to the braising liquid. Bring back to a simmer. Reduce heat to the lowest possible setting, cover, and braise for 2 to 2.5 hours. The liquid should barely quiver.","Step 4: After 1 hour, add the peeled hard-boiled eggs to the braise. They will absorb color and flavor in the remaining cook time. After 2 hours, test the pork - a chopstick should pierce through the skin and meat with no resistance. If not tender, braise another 30 minutes.","Step 5: Remove the pork and eggs. Increase heat and reduce the braising liquid to a slightly thicker, glossy sauce. Slice the pork into thick pieces showing the layers of skin, fat, and meat. Serve over jasmine rice with the sauce spooned generously over the top. Accompany with a halved stained egg, pickled mustard greens, and a small dish of garlic-chili vinegar sauce."],
          classifications: {"mealType":["dinner","lunch","street food"],"cookingMethods":["braising","simmering"]},
          elementalProperties: {"Fire":0.2,"Water":0.4,"Earth":0.35,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Jupiter"],"signs":["capricorn","taurus"],"lunarPhases":["Waning Gibbous","Full Moon"]},
          nutritionPerServing: {"calories":620,"proteinG":38,"carbsG":55,"fatG":26,"fiberG":2,"sodiumMg":1080,"sugarG":12,"vitamins":["Niacin","Vitamin B12","Vitamin B6"],"minerals":["Iron","Zinc","Potassium"]},

          alchemicalProperties: {"Spirit":4.43,"Essence":5.54,"Matter":5.48,"Substance":4.89},
          thermodynamicProperties: {"heat":0.0704,"entropy":0.3146,"reactivity":2.1899,"gregsEnergy":-0.6185,"kalchm":0.3659,"monica":0.0278},
          substitutions: [{"originalIngredient":"pork leg","substituteOptions":["pork belly (richer)","chicken thighs (shorter braise, 45 minutes)"]},{"originalIngredient":"palm sugar","substituteOptions":["brown sugar","rock sugar (traditional Chinese substitute)"]}]
        },
        {
          name: "Tom Kha Gai",
          description: "A supremely elegant and therapeutic Thai coconut milk chicken soup. Creamy and aromatic, it achieves a profound balance between the rich sweetness of coconut milk, the medicinal bite of galangal, the citrus brightness of lemongrass and makrut lime leaf, and a gentle warmth from chilies. It is the gentler, more comforting counterpart to Tom Yum.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"Mild","season":["all","winter"]},
          ingredients: [
            {"amount":400,"unit":"g","name":"boneless chicken thighs","notes":"Sliced into thin strips. Thighs are superior to breast here due to their fat content, which enriches the coconut broth."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Use the highest quality, fattiest coconut milk available. Shake the can well before opening."},
            {"amount":2,"unit":"cups","name":"chicken stock","notes":"For the base of the broth."},
            {"amount":5,"unit":"slices","name":"fresh galangal","notes":"The defining ingredient. Peeled and sliced. Do not substitute with ginger."},
            {"amount":3,"unit":"stalks","name":"lemongrass","notes":"Outer leaves removed, stalks bruised and cut into 2-inch pieces."},
            {"amount":6,"unit":"leaves","name":"makrut lime leaves","notes":"Torn to release aromatic oils."},
            {"amount":200,"unit":"g","name":"oyster mushrooms","notes":"Torn into strips."},
            {"amount":3,"unit":"whole","name":"bird eye chilies","notes":"Lightly crushed. Adjust for desired heat level."},
            {"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"Added off the heat."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity."},
            {"amount":1,"unit":"tsp","name":"palm sugar","notes":"To round the flavors."},
            {"amount":0.5,"unit":"cup","name":"fresh cilantro","notes":"For garnish."}
          ],
          instructions: [
            "Step 1: The Broth Base. In a medium pot, combine the chicken stock, coconut milk, galangal slices, lemongrass pieces, torn makrut lime leaves, and crushed chilies. Bring to a gentle simmer over medium heat. Do not boil vigorously as it can break the coconut milk.",
            "Step 2: The Aromatic Infusion. Simmer the aromatic broth gently for 5-7 minutes, allowing the galangal, lemongrass, and lime leaves to fully release their essential oils into the liquid.",
            "Step 3: The Mushrooms. Add the torn oyster mushrooms and simmer for 3 minutes.",
            "Step 4: The Chicken. Add the sliced chicken thighs to the gently simmering broth. Cook for 5-7 minutes until the chicken is just cooked through and tender. The gentle heat prevents toughening.",
            "Step 5: The Palm Sugar Balance. Stir in the palm sugar to dissolve, rounding the sharp edges of the broth.",
            "Step 6: The Acid Finish. Remove from heat. Stir in the fresh lime juice and fish sauce. These must be added off the heat to preserve their brightness. Taste and adjust: the soup should be creamy, citrus-forward, mildly spicy, and gently savory.",
            "Step 7: Serve. Ladle into bowls and garnish with fresh cilantro. Remind guests that the galangal, lemongrass, and lime leaves are for flavoring only and should not be eaten."
          ],
          classifications: {"mealType":["soup","dinner","lunch"],"cookingMethods":["simmering","infusing"]},
          elementalProperties: {"Fire":0.2,"Water":0.45,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","taurus"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":380,"proteinG":26,"carbsG":10,"fatG":28,"fiberG":2,"sodiumMg":820,"sugarG":5,"vitamins":["Vitamin C","Niacin"],"minerals":["Potassium","Phosphorus"]},

          alchemicalProperties: {"Spirit":4.21,"Essence":5.66,"Matter":4.53,"Substance":4.3},
          thermodynamicProperties: {"heat":0.076,"entropy":0.3058,"reactivity":2.9981,"gregsEnergy":-0.8408,"kalchm":15.6002,"monica":-0.2053},
          substitutions: [
            {"originalIngredient":"chicken thighs","substituteOptions":["tofu (firm, pressed - vegan)","shrimp","mushrooms only (vegetarian)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"full-fat coconut milk","substituteOptions":["light coconut milk (less rich result)"]}
          ]
        },
        {
          name: "Kuay Teow Reua",
          description: "Boat noodles - Bangkok's most intensely flavored noodle soup, historically sold from small wooden boats navigating the canals of Bangkok. Distinguished from other Thai noodle soups by its dark, almost black broth, which gets its depth and color from pig's blood cooked slowly into the broth base alongside dark soy sauce, five-spice, and roasted coriander. Served in very small portions (a tradition from the boat era when bowls had to be small), it is common to eat four to six bowls in a sitting. The broth is deep, complex, and slightly metallic from the blood.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":120,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"pork spare ribs or neck bones","notes":"For the broth. Blanched first to remove impurities. The bones provide gelatin and depth."},{"amount":0.5,"unit":"lb","name":"pork loin","notes":"Thinly sliced against the grain into bite-sized pieces. Added raw to each bowl and cooked by the hot broth."},{"amount":0.25,"unit":"cup","name":"pork blood","notes":"Fresh or frozen. Stirred into the broth near the end. Optional but traditional - creates the characteristic dark color and metallic richness."},{"amount":200,"unit":"g","name":"flat rice noodles or rice vermicelli","notes":"Either width works. Soaked in warm water until pliable, then blanched briefly in boiling water."},{"amount":3,"unit":"tbsp","name":"dark soy sauce","notes":"For color and sweetness in the broth."},{"amount":2,"unit":"tbsp","name":"fish sauce","notes":"Primary seasoning."},{"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"Adds body."},{"amount":2,"unit":"whole","name":"star anise","notes":"Key aromatic in the broth."},{"amount":1,"unit":"stick","name":"cinnamon","notes":"For warmth."},{"amount":1,"unit":"tbsp","name":"roasted coriander seeds","notes":"Toasted dry until fragrant then roughly crushed."},{"amount":1,"unit":"tbsp","name":"sugar","notes":"Palm or white sugar to balance the broth."},{"amount":1,"unit":"cup","name":"morning glory (water spinach)","notes":"Blanched briefly. Or substitute bean sprouts."},{"amount":2,"unit":"tbsp","name":"fried garlic in oil","notes":"Essential finishing garnish. Store-bought is acceptable."}],
          instructions: ["Step 1: Blanch the pork bones in boiling water for 5 minutes to remove impurities. Discard the water and rinse bones. Place in a fresh pot with 8 cups of water, star anise, cinnamon, and coriander seeds. Bring to a boil then simmer for 1.5 hours.","Step 2: Strain the broth. Return to the pot and season with dark soy sauce, fish sauce, oyster sauce, and sugar. If using pork blood, stir it in now and simmer for 10 minutes. The broth should be dark, almost black, with a complex depth.","Step 3: Prepare the noodles by soaking then blanching briefly in boiling water. Drain and portion into bowls.","Step 4: Add a portion of raw sliced pork loin to each bowl. Ladle the very hot, simmering broth over the noodles and pork - the boiling broth will cook the thin pork slices in the bowl. Add blanched morning glory.","Step 5: Garnish with fried garlic in oil. Set out the traditional condiment quartet on the table: white sugar, fish sauce, vinegar with sliced chilies, and dried chili flakes - each diner seasons their bowl individually. The boat noodle experience is about personally calibrating the bowl across multiple small servings."],
          classifications: {"mealType":["lunch","dinner","street food"],"cookingMethods":["simmering","blanching","assembling"]},
          elementalProperties: {"Fire":0.3,"Water":0.45,"Earth":0.2,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Pluto"],"signs":["scorpio","capricorn"],"lunarPhases":["Waning Gibbous","Dark Moon"]},
          nutritionPerServing: {"calories":380,"proteinG":28,"carbsG":42,"fatG":12,"fiberG":2,"sodiumMg":1050,"sugarG":8,"vitamins":["Niacin","Vitamin B12","Iron"],"minerals":["Iron","Zinc","Potassium"]},

          alchemicalProperties: {"Spirit":3.8,"Essence":5.72,"Matter":6.01,"Substance":5.41},
          thermodynamicProperties: {"heat":0.0457,"entropy":0.2858,"reactivity":1.9895,"gregsEnergy":-0.5229,"kalchm":0.0077,"monica":0.4},
          substitutions: [{"originalIngredient":"pork blood","substituteOptions":["extra dark soy sauce and a splash of balsamic for color and depth (vegetarian-adjacent)","omit entirely for a cleaner broth"]},{"originalIngredient":"pork","substituteOptions":["beef brisket and beef balls (Thai-Chinese beef boat noodles variant)","chicken"]}]
        },
      ],
    },
    dinner: {
      all: [
        {
          name: "Pad Thai",
          description: "The definitive Thai stir-fried rice noodle dish, a masterwork of wok hei and rapid assembly. Flat sen lek noodles are soaked until pliable, then subjected to violent, high-heat stir-frying with shrimp, firm tofu, and egg, bound in a deeply savory and slightly sweet tamarind-based sauce, finished with crisp bean sprouts and crushed peanuts.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":200,"unit":"g","name":"sen lek rice noodles","notes":"Flat, medium-width rice noodles, soaked in room-temperature water for 30 minutes until pliable but not soft. Do not use boiling water."},
            {"amount":200,"unit":"g","name":"medium shrimp","notes":"Peeled and deveined."},
            {"amount":100,"unit":"g","name":"firm tofu","notes":"Pressed dry and cut into small cubes."},
            {"amount":2,"unit":"large","name":"eggs","notes":"Cracked directly into the wok."},
            {"amount":3,"unit":"tbsp","name":"tamarind paste","notes":"Thick, dark paste dissolved from a block in warm water and strained. Not tamarind concentrate."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity and depth."},
            {"amount":1,"unit":"tbsp","name":"palm sugar","notes":"Or light brown sugar. Dissolved."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"Adds additional umami complexity."},
            {"amount":2,"unit":"stalks","name":"green onions","notes":"Cut into 1-inch pieces."},
            {"amount":1,"unit":"cup","name":"bean sprouts","notes":"Added raw at the very end for crunch."},
            {"amount":3,"unit":"tbsp","name":"roasted peanuts","notes":"Coarsely crushed."},
            {"amount":2,"unit":"tbsp","name":"preserved radish (chai poh)","notes":"Rinsed and roughly chopped. Adds essential saltiness and texture."},
            {"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"High smoke-point oil for wok frying."},
            {"amount":1,"unit":"lime","name":"lime","notes":"Cut into wedges for serving."}
          ],
          instructions: [
            "Step 1: The Sauce. Whisk together the tamarind paste, fish sauce, palm sugar, and oyster sauce in a small bowl until the sugar is completely dissolved. Taste it: it should be intensely sour, salty, and slightly sweet. Set aside.",
            "Step 2: The Noodle Preparation. Drain the soaked noodles thoroughly. They should be pliable and translucent but still firm enough to hold their shape when lifted.",
            "Step 3: The Tofu. Heat 1 tablespoon of oil in a wok over maximum heat. Fry the tofu cubes until golden and crisp on all sides, about 3-4 minutes. Remove and set aside.",
            "Step 4: The Shrimp. In the same blazing hot wok, add a touch more oil and stir-fry the shrimp for 60-90 seconds until just pink. Push to the side of the wok.",
            "Step 5: The Egg Scramble. Crack the eggs into the cleared center of the wok. Scramble them briefly until they are just set but still custardy, then fold them into the shrimp.",
            "Step 6: The Noodle Stir-Fry. Add the drained noodles and the preserved radish to the wok. Pour the sauce mixture over the noodles immediately. Toss and fold everything together continuously over high heat for 2-3 minutes, allowing the noodles to absorb the sauce and char slightly in spots.",
            "Step 7: The Finish. Add the green onion pieces and half the bean sprouts. Toss once more for 30 seconds. Remove from heat immediately.",
            "Step 8: Serve. Plate the Pad Thai and top with the fried tofu, crushed peanuts, and remaining fresh bean sprouts. Serve with lime wedges, dried chili flakes, sugar, and fish sauce on the side for individual adjustment."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stir-frying","wok cooking"]},
          elementalProperties: {"Fire":0.4,"Water":0.15,"Earth":0.3,"Air":0.15},
          astrologicalAffinities: {"planets":["Mercury","Mars"],"signs":["gemini","aries"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":560,"proteinG":28,"carbsG":72,"fatG":18,"fiberG":4,"sodiumMg":1350,"sugarG":10,"vitamins":["Vitamin B12","Niacin"],"minerals":["Selenium","Zinc"]},

          alchemicalProperties: {"Spirit":4.54,"Essence":6.14,"Matter":4.98,"Substance":4.78},
          thermodynamicProperties: {"heat":0.0763,"entropy":0.326,"reactivity":2.9186,"gregsEnergy":-0.8752,"kalchm":12.6625,"monica":0.5572},
          substitutions: [
            {"originalIngredient":"shrimp","substituteOptions":["chicken breast (sliced thin)","extra tofu (vegan)","pork tenderloin"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce plus a pinch of salt (vegetarian)"]},
            {"originalIngredient":"tamarind paste","substituteOptions":["lime juice mixed with a small amount of rice vinegar (less depth)"]}
          ]
        },
        {
          name: "Pad Krapow Moo",
          description: "The street food engine of Thailand. A violently hot, rapid stir-fry of minced pork infused with the anise-like sting of holy basil (krapow), served over rice and crowned with a brutally fried egg (khai dao).",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":5,"baseServingSize":2,"spiceLevel":"Very High","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Minced pork","notes":"Must be coarsely ground with fat."},{"amount":2,"unit":"cups","name":"Holy basil leaves","notes":"Krapow. Do not substitute with Thai sweet basil."},{"amount":5,"unit":"cloves","name":"Garlic","notes":"Pounded in a mortar."},{"amount":5,"unit":"whole","name":"Bird's eye chilies","notes":"Pounded with the garlic."},{"amount":1,"unit":"tbsp","name":"Oyster sauce","notes":"For gloss and deep umami."},{"amount":1,"unit":"tbsp","name":"Dark soy sauce","notes":"For color and sweetness."},{"amount":1,"unit":"tbsp","name":"Fish sauce","notes":"For salinity."},{"amount":2,"unit":"large","name":"Eggs","notes":"Fried in a lake of oil."}],
          instructions: ["Step 1: The Aromatic Paste. In a mortar and pestle, aggressively pound the garlic and chilies into a coarse, wet paste. This releases the essential oils that slicing cannot achieve.","Step 2: The Sear. Heat a wok until it is smoking. Add oil and the garlic-chili paste. Fry for exactly 10 seconds until violently fragrant (do not burn).","Step 3: The Meat. Add the minced pork. Toss aggressively, breaking it apart, until it is just cooked through and begins to caramelize in its own fat.","Step 4: The Glaze. Add the oyster sauce, dark soy sauce, fish sauce, and a pinch of sugar. Toss until the meat is entirely coated in a dark, sticky glaze.","Step 5: The Basil Flash. Turn off the heat. Immediately throw in the massive pile of holy basil leaves. Toss once; the residual heat will instantly wilt them, preserving their delicate, pepper-anise aroma. Serve over rice with a deep-fried egg with a liquid yolk."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["stir-frying","pounding"]},
          elementalProperties: {"Fire":0.55,"Water":0.05,"Earth":0.25,"Air":0.15},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","gemini"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":520,"proteinG":32,"carbsG":8,"fatG":38,"fiberG":1,"sodiumMg":1100,"sugarG":4,"vitamins":["Vitamin B6","Niacin"],"minerals":["Zinc","Iron"]},

          alchemicalProperties: {"Spirit":3.29,"Essence":4.2,"Matter":3.2,"Substance":2.97},
          thermodynamicProperties: {"heat":0.095,"entropy":0.3368,"reactivity":3.1601,"gregsEnergy":-0.9693,"kalchm":19.8909,"monica":0.7162},
          substitutions: [{"originalIngredient":"Holy basil","substituteOptions":["Thai sweet basil (though structurally incorrect, it is common)"]}]
        },
        {
          name: "Pla Neung Manao",
          description: "A triumph of acidic and aromatic poaching. A whole fish is steamed rapidly to retain absolute moisture, then drowned in a bracing, fiercely sour, garlic-and-chili-laden lime broth.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"High","season":["summer"]},
          ingredients: [{"amount":1,"unit":"whole","name":"White fish","notes":"Sea bass or snapper, scaled and gutted."},{"amount":3,"unit":"stalks","name":"Lemongrass","notes":"Bruised, stuffed inside the fish."},{"amount":0.5,"unit":"cup","name":"Lime juice","notes":"Freshly squeezed."},{"amount":3,"unit":"tbsp","name":"Fish sauce","notes":"For salinity."},{"amount":1,"unit":"tbsp","name":"Palm sugar","notes":"To round out the acid."},{"amount":10,"unit":"cloves","name":"Garlic","notes":"Finely minced."},{"amount":5,"unit":"whole","name":"Bird's eye chilies","notes":"Finely sliced."},{"amount":1,"unit":"bunch","name":"Cilantro","notes":"Chopped."}],
          instructions: ["Step 1: The Preparation. Score the thickest part of the fish deeply on both sides. Stuff the cavity with the bruised lemongrass stalks to perfume the flesh from the inside out.","Step 2: The Steam. Place the fish on a heatproof plate that will fit inside a steamer. Steam over aggressively boiling water for 10-15 minutes until the flesh turns opaque and flakes easily at the spine.","Step 3: The Broth. While the fish steams, whisk together the fresh lime juice, fish sauce, dissolved palm sugar, massive quantities of minced garlic, and sliced chilies. The dressing must be intensely sour, salty, and spicy.","Step 4: The Drowning. Carefully remove the plate with the cooked fish from the steamer (retain the juices that pooled on the plate). Immediately pour the cold, vibrant lime broth entirely over the hot fish.","Step 5: The Garnish. Top generously with chopped cilantro. Place the plate over a small burner at the table to keep the broth simmering while eating."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["steaming"]},
          elementalProperties: {"Fire":0.3,"Water":0.5,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Neptune","Mercury"],"signs":["pisces","virgo"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":280,"proteinG":45,"carbsG":12,"fatG":4,"fiberG":1,"sodiumMg":1500,"sugarG":8,"vitamins":["Vitamin C","Vitamin B12"],"minerals":["Selenium","Potassium"]},

          alchemicalProperties: {"Spirit":4.03,"Essence":3.6,"Matter":2.18,"Substance":1.99},
          thermodynamicProperties: {"heat":0.2276,"entropy":0.4987,"reactivity":6.4464,"gregsEnergy":-2.9875,"kalchm":1286.8134,"monica":-0.1032},
          substitutions: [{"originalIngredient":"Whole fish","substituteOptions":["Fish fillets (reduce steaming time)"]}]
        },
        {
          name: "Gaeng Keow Wan Gai",
          description: "Thai Green Curry, perhaps the most vibrant and aromatic of the Thai curry canon. A fiercely green paste of fresh green chilies, lemongrass, galangal, kaffir lime zest, and shrimp paste is fried in cracked coconut cream, then simmered with chicken, Thai eggplant, and an ocean of fresh basil. It is simultaneously the most herbaceous and spicy of the major Thai curries.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":25,"baseServingSize":4,"spiceLevel":"Hot","season":["all"]},
          ingredients: [
            {"amount":500,"unit":"g","name":"boneless chicken thighs","notes":"Sliced into bite-sized strips. Thighs hold up better than breast in the curry."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Separated into thick cream (top) and thin milk (bottom) by refrigerating overnight and not shaking."},
            {"amount":4,"unit":"tbsp","name":"green curry paste","notes":"Good-quality store-bought or homemade. The foundation of all flavor."},
            {"amount":200,"unit":"g","name":"Thai eggplant","notes":"Golf ball-sized, quartered. Or substitute pea eggplants. Do not substitute Italian eggplant."},
            {"amount":1,"unit":"cup","name":"fresh Thai basil leaves","notes":"Horapah variety. Added at the very end. Do not substitute Italian basil."},
            {"amount":4,"unit":"leaves","name":"makrut lime leaves","notes":"Torn, central rib removed. For aromatic infusion."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning."},
            {"amount":1,"unit":"tbsp","name":"palm sugar","notes":"To balance the heat."},
            {"amount":2,"unit":"whole","name":"long red chilies","notes":"Sliced diagonally for garnish."},
            {"amount":1,"unit":"cup","name":"chicken stock","notes":"To adjust consistency."}
          ],
          instructions: [
            "Step 1: The Oil Separation (Keeo Gati). In a wok or wide pot, add the thick coconut cream from the top of the can. Heat over medium-high until the cream simmers and the coconut oil visibly separates and pools on the surface - this is called 'cracking the coconut cream' and is essential for frying the paste.",
            "Step 2: The Paste Fry. Add the green curry paste to the cracked coconut oil. Fry aggressively, stirring constantly, for 2-3 minutes until the paste darkens slightly and becomes incredibly fragrant. The raw edge of the galangal and chili will mellow and deepen.",
            "Step 3: The Chicken. Add the sliced chicken thighs to the fried paste. Toss to coat every piece. Stir-fry for 2 minutes until the chicken is sealed on the outside.",
            "Step 4: The Thin Milk and Stock. Pour in the remaining thin coconut milk and the chicken stock. Add the torn makrut lime leaves. Bring to a gentle simmer.",
            "Step 5: The Eggplant. Add the quartered Thai eggplants. Simmer gently for 8-10 minutes until the eggplant is completely tender and the chicken is cooked through.",
            "Step 6: The Seasoning. Season with fish sauce and palm sugar. The curry must be predominantly spicy and herbaceous with a background of sweetness and salinity.",
            "Step 7: The Basil Finish. Turn off the heat. Immediately add the fresh Thai basil leaves and sliced red chilies. Fold once; the basil will wilt from the residual heat. Serve immediately over jasmine rice."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","stir-frying","paste frying"]},
          elementalProperties: {"Fire":0.4,"Water":0.3,"Earth":0.2,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","gemini"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":420,"proteinG":28,"carbsG":12,"fatG":30,"fiberG":4,"sodiumMg":880,"sugarG":7,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Potassium","Iron"]},

          alchemicalProperties: {"Spirit":3.55,"Essence":4.77,"Matter":3.89,"Substance":3.63},
          thermodynamicProperties: {"heat":0.0768,"entropy":0.3093,"reactivity":2.9168,"gregsEnergy":-0.8253,"kalchm":7.2858,"monica":0.6974},
          substitutions: [
            {"originalIngredient":"chicken thighs","substituteOptions":["shrimp (reduce cook time)","firm tofu (vegan)","beef sirloin strips"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"Thai eggplant","substituteOptions":["zucchini","bamboo shoots","baby corn"]}
          ]
        },
        {
          name: "Gaeng Daeng Moo",
          description: "Thai Red Curry with pork - a deeply savory, aromatic, and moderately spiced curry built on a brick-red paste of dried red chilies, lemongrass, galangal, and shrimp paste. Less herbaceous than the green version, Red Curry is defined by its rich, complex savory depth and thick, clinging coconut sauce. Bamboo shoots provide structural contrast.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":25,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [
            {"amount":500,"unit":"g","name":"pork tenderloin or shoulder","notes":"Sliced thin against the grain. Shoulder gives more flavor but tenderloin is more tender."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Do not shake the can. Skim the thick cream from the top for frying the paste."},
            {"amount":3,"unit":"tbsp","name":"red curry paste","notes":"A quality paste of dried red chilies, galangal, lemongrass, and shrimp paste."},
            {"amount":200,"unit":"g","name":"canned bamboo shoots","notes":"Drained and rinsed. Sliced into strips."},
            {"amount":1,"unit":"cup","name":"fresh Thai basil","notes":"For finishing."},
            {"amount":4,"unit":"leaves","name":"makrut lime leaves","notes":"Torn in half."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For seasoning."},
            {"amount":2,"unit":"tsp","name":"palm sugar","notes":"Red curry benefits from a touch more sweetness than green."},
            {"amount":1,"unit":"cup","name":"chicken stock","notes":"To adjust body and consistency."},
            {"amount":2,"unit":"whole","name":"long red chilies","notes":"Diagonally sliced, for garnish color."}
          ],
          instructions: [
            "Step 1: Crack the Coconut Cream. Place the thick coconut cream skimmed from the can into a wok over medium heat. Simmer until the oil separates visibly from the white solids.",
            "Step 2: Fry the Paste. Add the red curry paste to the cracked oil. Fry for 2 minutes, stirring continuously, until it turns a deep rust-red and is intensely aromatic. The smell will shift from raw and sharp to deep and roasted.",
            "Step 3: Seal the Pork. Add the sliced pork to the paste. Toss vigorously to coat each piece and stir-fry for 2 minutes until the pork is sealed.",
            "Step 4: Build the Sauce. Pour in the remaining thin coconut milk and the chicken stock. Add the makrut lime leaves. Bring to a simmer.",
            "Step 5: Add the Bamboo. Stir in the bamboo shoot strips. Simmer for 10 minutes, allowing the curry to reduce and thicken slightly and the pork to become fully tender.",
            "Step 6: Season. Add the fish sauce and palm sugar. Taste: the curry should be savory, mildly spicy, rich, and slightly sweet with a coconut backbone.",
            "Step 7: Finish. Remove from heat, stir in the fresh Thai basil leaves and sliced red chilies. Serve immediately over steamed jasmine rice."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","paste frying","stir-frying"]},
          elementalProperties: {"Fire":0.35,"Water":0.3,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":440,"proteinG":30,"carbsG":10,"fatG":32,"fiberG":3,"sodiumMg":920,"sugarG":6,"vitamins":["Vitamin B12","Niacin"],"minerals":["Zinc","Potassium"]},

          alchemicalProperties: {"Spirit":4.0,"Essence":4.74,"Matter":3.71,"Substance":3.59},
          thermodynamicProperties: {"heat":0.1001,"entropy":0.3583,"reactivity":3.2891,"gregsEnergy":-1.0783,"kalchm":32.0821,"monica":0.6974},
          substitutions: [
            {"originalIngredient":"pork tenderloin","substituteOptions":["chicken breast","duck breast","firm tofu (vegan)"]},
            {"originalIngredient":"bamboo shoots","substituteOptions":["hearts of palm","Thai eggplant","zucchini"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]}
          ]
        },
        {
          name: "Larb Gai",
          description: "Larb is the national dish of Laos and a Thai Isaan masterpiece - a warm minced meat salad that operates by a completely different logic than Western salads. Ground chicken is cooked rapidly and immediately tossed in a ferociously tart lime dressing with toasted rice powder, dried chilies, shallots, mint, and fresh herbs. The toasted rice powder is non-negotiable: it provides a unique nutty crunch and helps bind the dressing.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Hot","season":["all"]},
          ingredients: [
            {"amount":400,"unit":"g","name":"ground chicken","notes":"Coarsely ground or finely chopped. Not too lean; some fat is essential for juiciness."},
            {"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"Freshly squeezed. The acid backbone of the entire dish."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For salinity and depth."},
            {"amount":2,"unit":"tbsp","name":"toasted rice powder","notes":"Khao Khua. Made by dry-toasting raw glutinous rice in a dry pan until golden, then grinding. Essential. Cannot be omitted."},
            {"amount":1,"unit":"tsp","name":"dried chili flakes","notes":"Roasted dried chilies ground coarsely. Adjust for heat."},
            {"amount":4,"unit":"whole","name":"shallots","notes":"Thinly sliced."},
            {"amount":1,"unit":"cup","name":"fresh mint leaves","notes":"Roughly torn. The defining herb."},
            {"amount":0.5,"unit":"cup","name":"fresh cilantro","notes":"Roughly chopped."},
            {"amount":2,"unit":"stalks","name":"green onions","notes":"Thinly sliced."},
            {"amount":2,"unit":"tbsp","name":"water or chicken stock","notes":"To help cook the meat without oil."}
          ],
          instructions: [
            "Step 1: Make the Toasted Rice Powder. In a dry wok or frying pan, toast 3 tablespoons of raw sticky rice over medium heat, stirring constantly, for 5-8 minutes until the grains are deeply golden and smell nutty. Transfer to a mortar and pestle and grind to a coarse powder. Set aside.",
            "Step 2: Cook the Chicken. Place a wok over high heat. Add a splash of water or stock (no oil). Add the ground chicken and break it apart, cooking rapidly until just cooked through with no pink remaining. The water will steam the meat while keeping it tender. Do not overcook.",
            "Step 3: The Dressing. Remove the wok from heat. Immediately add the fresh lime juice, fish sauce, dried chili flakes, and sliced shallots to the hot chicken. Toss everything together; the residual heat will slightly pickle the shallots.",
            "Step 4: The Rice Powder. Add the toasted rice powder and toss to distribute. It will absorb some of the dressing and bind the mixture.",
            "Step 5: The Herbs. Add the mint leaves, cilantro, and green onions. Toss gently just once or twice to preserve the freshness of the herbs. Taste and adjust with more lime juice or fish sauce.",
            "Step 6: Serve immediately at room temperature alongside fresh vegetables (cucumber, long beans, cabbage wedges) and sticky rice for scooping."
          ],
          classifications: {"mealType":["dinner","lunch","salad"],"cookingMethods":["stir-frying","toasting","mixing"]},
          elementalProperties: {"Fire":0.4,"Water":0.2,"Earth":0.25,"Air":0.15},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","virgo"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":310,"proteinG":36,"carbsG":14,"fatG":12,"fiberG":2,"sodiumMg":980,"sugarG":4,"vitamins":["Vitamin C","Vitamin B6"],"minerals":["Iron","Zinc"]},

          alchemicalProperties: {"Spirit":2.51,"Essence":4.46,"Matter":3.88,"Substance":3.51},
          thermodynamicProperties: {"heat":0.0417,"entropy":0.2434,"reactivity":2.2709,"gregsEnergy":-0.511,"kalchm":0.5018,"monica":0.8272},
          substitutions: [
            {"originalIngredient":"ground chicken","substituteOptions":["ground pork","ground turkey","minced mushrooms (vegan)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"toasted rice powder","substituteOptions":["panko breadcrumbs, toasted (different texture but similar function)"]}
          ]
        },
        {
          name: "Chicken Satay with Peanut Sauce",
          description: "Thai satay - marinated chicken thighs threaded onto skewers and grilled over charcoal until deeply caramelized and charred at the edges. The marinade relies on turmeric, lemongrass, and coconut milk to deeply penetrate the meat. The accompanying peanut dipping sauce is a separate dish unto itself: a complex emulsion of coconut milk, red curry paste, roasted peanuts, and tamarind.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":600,"unit":"g","name":"boneless chicken thighs","notes":"Sliced into thin strips, roughly 1 inch wide and 3 inches long. Thighs are mandatory for their fat content and flexibility on the skewer."},
            {"amount":2,"unit":"stalks","name":"lemongrass","notes":"Bottom 4 inches only, finely minced."},
            {"amount":1,"unit":"tsp","name":"ground turmeric","notes":"For color and subtle earthiness."},
            {"amount":1,"unit":"tsp","name":"ground cumin","notes":"For the marinade."},
            {"amount":1,"unit":"tsp","name":"ground coriander","notes":"For the marinade."},
            {"amount":4,"unit":"tbsp","name":"coconut milk","notes":"For the marinade base."},
            {"amount":1,"unit":"tbsp","name":"fish sauce","notes":"For the marinade."},
            {"amount":1,"unit":"tbsp","name":"palm sugar","notes":"For the marinade."},
            {"amount":1,"unit":"cup","name":"roasted peanuts","notes":"Roughly crushed, for the sauce."},
            {"amount":200,"unit":"ml","name":"coconut milk","notes":"For the peanut sauce."},
            {"amount":2,"unit":"tbsp","name":"red curry paste","notes":"The base of the peanut sauce."},
            {"amount":2,"unit":"tbsp","name":"tamarind paste","notes":"For sourness in the sauce."},
            {"amount":2,"unit":"tbsp","name":"palm sugar","notes":"For the peanut sauce."},
            {"amount":20,"unit":"pieces","name":"bamboo skewers","notes":"Soaked in water for 30 minutes to prevent burning."}
          ],
          instructions: [
            "Step 1: The Marinade. In a bowl, combine the minced lemongrass, ground turmeric, cumin, coriander, 4 tablespoons of coconut milk, fish sauce, and 1 tablespoon palm sugar. Mix well. Add the sliced chicken thighs and toss to coat thoroughly. Marinate for at least 1 hour, ideally 4 hours in the refrigerator.",
            "Step 2: The Peanut Sauce. In a small saucepan, heat the 200ml of coconut milk over medium heat until it begins to simmer. Add the red curry paste and fry in the coconut milk for 1 minute. Add the crushed peanuts, tamarind paste, and 2 tablespoons of palm sugar. Stir vigorously. The sauce should be thick, rich, and clings to a spoon. Adjust consistency with water if needed. Season with fish sauce if required.",
            "Step 3: Skewer the Chicken. Thread the marinated chicken strips onto soaked bamboo skewers in an S-pattern, stretching the meat along the full length of the skewer.",
            "Step 4: Grill. Cook the skewers on a very hot grill or grill pan for 2-3 minutes per side. The high heat is essential to achieve caramelization and the characteristic slight char on the edges.",
            "Step 5: Serve. Arrange the hot skewers on a plate. Serve the peanut sauce alongside in a small bowl, along with a simple ajaat (cucumber relish) of cucumber, shallot, and red chili in diluted white vinegar and sugar."
          ],
          classifications: {"mealType":["dinner","lunch","appetizer"],"cookingMethods":["grilling","marinating","simmering"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Jupiter"],"signs":["leo","sagittarius"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":480,"proteinG":34,"carbsG":22,"fatG":30,"fiberG":4,"sodiumMg":760,"sugarG":10,"vitamins":["Niacin","Vitamin B6"],"minerals":["Zinc","Magnesium"]},

          alchemicalProperties: {"Spirit":4.34,"Essence":5.08,"Matter":4.78,"Substance":4.59},
          thermodynamicProperties: {"heat":0.0831,"entropy":0.3694,"reactivity":2.5034,"gregsEnergy":-0.8417,"kalchm":1.1671,"monica":0.2323},
          substitutions: [
            {"originalIngredient":"chicken thighs","substituteOptions":["pork loin strips","beef sirloin","king oyster mushroom strips (vegan)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"roasted peanuts","substituteOptions":["cashews (nut allergy note)","sunflower seed butter (nut-free)"]}
          ]
        },
        {
          name: "Pad See Ew",
          description: "The wok-fried counterpart to Pad Thai, and in many ways the more technically demanding dish. Wide, flat sen yai rice noodles are stir-fried at extreme heat with Chinese broccoli, egg, and sliced pork or beef in a dark, sweet-salty soy sauce. The defining characteristic is the wok hei - the smoky, slightly charred flavor achieved only from a correctly seasoned wok at maximum temperature.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":8,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [
            {"amount":300,"unit":"g","name":"fresh wide rice noodles (sen yai)","notes":"If not fresh, soak dried wide rice noodles in warm water until just pliable but still firm."},
            {"amount":200,"unit":"g","name":"pork tenderloin or flank steak","notes":"Sliced very thin against the grain."},
            {"amount":2,"unit":"large","name":"eggs","notes":"Cracked into the wok at a key moment."},
            {"amount":150,"unit":"g","name":"Chinese broccoli (gai lan)","notes":"Stems sliced diagonally, leaves separated. The defining vegetable."},
            {"amount":2,"unit":"tbsp","name":"dark soy sauce","notes":"For deep color, sweetness, and body. The key flavoring."},
            {"amount":1,"unit":"tbsp","name":"light soy sauce","notes":"For salinity."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"For umami gloss."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"To balance the soy sauces."},
            {"amount":3,"unit":"cloves","name":"garlic","notes":"Smashed and roughly chopped."},
            {"amount":2,"unit":"tbsp","name":"vegetable oil","notes":"High smoke-point oil. Wok must be smoking hot."}
          ],
          instructions: [
            "Step 1: The Sauce. Combine the dark soy sauce, light soy sauce, oyster sauce, and sugar in a small bowl. Stir until the sugar dissolves. Set aside.",
            "Step 2: Separate the Noodles. If using fresh noodles, gently separate them into individual strands with your hands to prevent clumping in the wok. This step is critical.",
            "Step 3: The Protein. Heat a wok over maximum heat until it is absolutely smoking. Add 1 tablespoon of oil and the sliced pork. Spread in a single layer and sear without moving for 30 seconds. Then toss once, allowing the meat to caramelize. Remove and set aside.",
            "Step 4: The Egg. Add the remaining oil and the garlic to the still-blazing wok. Fry for 10 seconds. Push to the side. Crack the eggs directly into the center. Scramble vigorously until just set but still custardy.",
            "Step 5: The Noodle Fry. Immediately add the separated noodles to the wok. Pour the sauce mixture over the noodles. Toss and fold everything together rapidly, allowing the noodles to char slightly on the wok surface - this char is the essence of the dish.",
            "Step 6: The Gai Lan. Add the Chinese broccoli stems first, then the leaves. Return the cooked pork to the wok. Toss everything together for 1-2 minutes until the broccoli is bright green and just tender.",
            "Step 7: Serve immediately. Pad See Ew does not hold; it must be eaten the moment it leaves the wok. Serve with a small dish of ground white pepper, dried chili flakes, and fish sauce for individual seasoning."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stir-frying","wok cooking","searing"]},
          elementalProperties: {"Fire":0.45,"Water":0.15,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":590,"proteinG":32,"carbsG":65,"fatG":20,"fiberG":3,"sodiumMg":1450,"sugarG":8,"vitamins":["Vitamin C","Iron","Vitamin B12"],"minerals":["Zinc","Selenium"]},

          alchemicalProperties: {"Spirit":3.25,"Essence":4.25,"Matter":4.03,"Substance":3.76},
          thermodynamicProperties: {"heat":0.0679,"entropy":0.3269,"reactivity":2.2933,"gregsEnergy":-0.6817,"kalchm":0.5397,"monica":0.9948},
          substitutions: [
            {"originalIngredient":"pork tenderloin","substituteOptions":["chicken breast sliced thin","shrimp","extra-firm tofu (vegan)"]},
            {"originalIngredient":"Chinese broccoli","substituteOptions":["broccolini","bok choy","regular broccoli florets"]},
            {"originalIngredient":"fresh wide rice noodles","substituteOptions":["dried wide rice noodles, soaked"]}
          ]
        },
        {
          name: "Khao Pad Kra Pao Moo",
          description: "Basil Fried Rice is the logical extension of the beloved Pad Krapow into a complete one-dish meal. Cooked jasmine rice is stir-fried at violent heat with minced pork, a potent paste of bird eye chilies and garlic, and a holy basil finish. Topped with a rugged, oil-blistered fried egg with a still-runny yolk. This is the definitive Thai working lunch.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":8,"baseServingSize":2,"spiceLevel":"Very High","season":["all"]},
          ingredients: [
            {"amount":2,"unit":"cups","name":"cooked jasmine rice","notes":"Day-old cold rice is strongly preferred. Freshly cooked rice contains too much moisture and will result in steamed clumps rather than properly fried grains."},
            {"amount":250,"unit":"g","name":"ground pork","notes":"Coarsely ground is preferable to fine mince for better texture."},
            {"amount":1,"unit":"cup","name":"holy basil leaves","notes":"Krapow variety. The defining ingredient. Do not substitute with Thai sweet basil."},
            {"amount":5,"unit":"cloves","name":"garlic","notes":"Roughly chopped."},
            {"amount":4,"unit":"whole","name":"bird eye chilies","notes":"Adjust quantity for heat preference. Pounded with the garlic."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"For gloss and umami."},
            {"amount":1,"unit":"tbsp","name":"fish sauce","notes":"For salinity."},
            {"amount":1,"unit":"tsp","name":"dark soy sauce","notes":"For color."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"To balance."},
            {"amount":2,"unit":"large","name":"eggs","notes":"Fried separately in abundant hot oil until the white is blistered and crispy but the yolk is still fully runny."},
            {"amount":3,"unit":"tbsp","name":"vegetable oil","notes":"Divided: 1 tbsp for the rice, 2 tbsp for the fried egg."}
          ],
          instructions: [
            "Step 1: The Aromatic Foundation. Pound the garlic and bird eye chilies in a mortar and pestle into a coarse paste. This releases more aromatics than simply chopping.",
            "Step 2: The Pork Sear. Heat a wok until smoking. Add 1 tablespoon of oil and the garlic-chili paste. Fry for exactly 10 seconds until blindingly fragrant. Immediately add the ground pork. Break it apart aggressively and stir-fry over maximum heat until cooked through and just beginning to caramelize.",
            "Step 3: The Sauce. Add the oyster sauce, fish sauce, dark soy sauce, and sugar. Toss to coat the meat in a sticky, dark glaze.",
            "Step 4: The Rice. Add the cold, day-old rice to the wok. Break up any clumps with a spatula. Stir-fry aggressively for 2-3 minutes, pressing the rice against the hot wok surface to achieve slight crisping on individual grains.",
            "Step 5: The Basil. Turn off the heat. Add the holy basil leaves all at once. Toss once quickly; the residual heat will wilt them while preserving their volatile aroma.",
            "Step 6: The Egg. In a separate small pan or wok, heat 2 tablespoons of oil until shimmering and near-smoking. Crack an egg in. It will immediately blister and spit. The white should become lacy and crispy at the edges while the yolk remains soft. This requires high heat and courage.",
            "Step 7: Plate. Mound the basil fried rice in a wide bowl. Place the fried egg directly on top. Serve with cucumber slices and fish sauce with fresh chilies on the side."
          ],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["stir-frying","wok cooking","frying"]},
          elementalProperties: {"Fire":0.5,"Water":0.1,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["scorpio","aries"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":545,"proteinG":30,"carbsG":52,"fatG":24,"fiberG":2,"sodiumMg":1200,"sugarG":4,"vitamins":["Vitamin B6","Niacin"],"minerals":["Iron","Zinc"]},

          alchemicalProperties: {"Spirit":4.04,"Essence":5.23,"Matter":4.4,"Substance":4.14},
          thermodynamicProperties: {"heat":0.0814,"entropy":0.3352,"reactivity":2.7652,"gregsEnergy":-0.8455,"kalchm":6.637,"monica":0.9948},
          substitutions: [
            {"originalIngredient":"ground pork","substituteOptions":["ground chicken","minced beef","crumbled extra-firm tofu (vegan)"]},
            {"originalIngredient":"holy basil","substituteOptions":["Thai sweet basil (less peppery result)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]}
          ]
        },
        {
          name: "Suea Rong Hai",
          description: "Crying Tiger is a dramatic Thai grilled beef dish. The name supposedly derives from the idea that the beef is so delicious it would make a tiger weep with longing. Thick-cut beef sirloin is simply marinated in fish sauce, oyster sauce, and white pepper, then grilled hot over charcoal to a medium-rare, rested, and sliced against the grain. The magic is entirely in the accompanying Nam Jim Jaew - an extraordinary Isaan dipping sauce of toasted rice powder, dried chilies, fish sauce, lime, and tamarind.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [
            {"amount":500,"unit":"g","name":"beef sirloin or ribeye","notes":"Cut 1 to 1.5 inches thick. The thickness protects the interior during the high-heat grilling."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For the beef marinade."},
            {"amount":1,"unit":"tbsp","name":"oyster sauce","notes":"For the marinade gloss."},
            {"amount":1,"unit":"tsp","name":"ground white pepper","notes":"For the marinade."},
            {"amount":1,"unit":"tsp","name":"sugar","notes":"For the marinade."},
            {"amount":3,"unit":"tbsp","name":"fresh lime juice","notes":"For the Nam Jim Jaew dipping sauce."},
            {"amount":2,"unit":"tbsp","name":"fish sauce","notes":"For the Nam Jim Jaew."},
            {"amount":1,"unit":"tbsp","name":"tamarind paste","notes":"For the Nam Jim Jaew. Provides deep, fruity sourness."},
            {"amount":1,"unit":"tbsp","name":"toasted rice powder","notes":"Khao Khua - toasted and ground glutinous rice. Essential for the dipping sauce texture."},
            {"amount":1,"unit":"tsp","name":"dried chili flakes","notes":"Roasted and ground, for the Nam Jim Jaew."},
            {"amount":1,"unit":"tsp","name":"palm sugar","notes":"For the Nam Jim Jaew."},
            {"amount":2,"unit":"stalks","name":"green onions","notes":"Finely sliced, for the Nam Jim Jaew."}
          ],
          instructions: [
            "Step 1: Marinate the Beef. In a shallow dish, combine the fish sauce, oyster sauce, white pepper, and sugar. Add the thick-cut steaks and turn to coat. Marinate for at least 30 minutes at room temperature or up to 2 hours refrigerated.",
            "Step 2: Make the Nam Jim Jaew. Combine the lime juice, fish sauce, tamarind paste, toasted rice powder, dried chili flakes, and palm sugar in a bowl. Stir until the sugar and rice powder are well distributed. Add the sliced green onions. The sauce should be sour, spicy, savory, and complex with a slightly thick texture from the rice powder. Adjust to taste.",
            "Step 3: Preheat the Grill. Heat a charcoal grill or cast-iron grill pan to its maximum temperature. The heat must be intense for proper searing.",
            "Step 4: Grill the Beef. Remove the beef from the marinade (do not wipe off). Place on the blazing hot grill. Grill for 3-4 minutes per side for medium-rare, depending on thickness. The exterior should be deeply charred in places while the interior remains pink.",
            "Step 5: The Rest. Remove the beef from the grill and rest on a cutting board for at least 5 minutes. This is non-negotiable; cutting immediately will lose all the precious juices.",
            "Step 6: Slice and Serve. Slice the rested beef thinly against the grain. Arrange on a plate and serve alongside the Nam Jim Jaew dipping sauce and a plate of fresh vegetables (cucumber, tomato, cabbage)."
          ],
          classifications: {"mealType":["dinner"],"cookingMethods":["grilling","marinating"]},
          elementalProperties: {"Fire":0.45,"Water":0.15,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["aries","capricorn"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":45,"carbsG":8,"fatG":22,"fiberG":1,"sodiumMg":1050,"sugarG":5,"vitamins":["Vitamin B12","Niacin","Iron"],"minerals":["Zinc","Phosphorus"]},

          alchemicalProperties: {"Spirit":4.21,"Essence":5.41,"Matter":4.8,"Substance":4.4},
          thermodynamicProperties: {"heat":0.078,"entropy":0.3282,"reactivity":2.5601,"gregsEnergy":-0.7622,"kalchm":3.1166,"monica":0.2511},
          substitutions: [
            {"originalIngredient":"beef sirloin","substituteOptions":["pork shoulder steak","lamb leg steak","portobello mushrooms (vegetarian)"]},
            {"originalIngredient":"fish sauce","substituteOptions":["soy sauce (vegetarian)"]},
            {"originalIngredient":"tamarind paste","substituteOptions":["lime juice plus a touch of brown sugar"]}
          ]
        },
      ],
      summer: [
        {
          name: "Nam Kang Sai",
          description: "The structural opposite of hot and heavy. A violently cooling Thai dessert consisting of fiercely crushed ice piled over a customizable matrix of jellies, sweet beans, and syrups, flooded with condensed milk.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":0,"baseServingSize":1,"spiceLevel":"None","season":["summer"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Ice","notes":"Must be finely shaved or crushed into snow."},{"amount":0.5,"unit":"cup","name":"Toppings matrix","notes":"Red beans, grass jelly, sweet corn, attap seeds."},{"amount":3,"unit":"tbsp","name":"Hale's Blue Boy syrup","notes":"Iconic sweet, floral, bright red or green syrup."},{"amount":2,"unit":"tbsp","name":"Evaporated milk","notes":"For richness."},{"amount":1,"unit":"tbsp","name":"Sweetened condensed milk","notes":"For density and sweetness."}],
          instructions: ["Step 1: The Base. In the bottom of a wide bowl, arrange the chosen heavy toppings (sweet red beans, jellies, corn).","Step 2: The Mountain. Shave the ice directly over the toppings, forming a high, structured mountain. The ice must be fine enough to absorb syrup but granular enough not to instantly melt.","Step 3: The Saturation. Vigorously drench the ice mountain with the brightly colored, floral syrup. The ice will instantly absorb the color.","Step 4: The Emulsion. Pour the evaporated milk and a heavy drizzle of sweetened condensed milk over the top. The milk will streak down the sides, creating a visual marbling effect.","Step 5: The Collapse. Serve immediately with a spoon. As it is eaten, the ice collapses into the sweet milks and toppings, creating a cold, slushy soup."],
          classifications: {"mealType":["dessert","snack","beverage"],"cookingMethods":["shaving ice","assembling"]},
          elementalProperties: {"Fire":0,"Water":0.7,"Earth":0.15,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":250,"proteinG":4,"carbsG":55,"fatG":4,"fiberG":2,"sodiumMg":80,"sugarG":45,"vitamins":["Calcium"],"minerals":["Phosphorus"]},

          alchemicalProperties: {"Spirit":0.96,"Essence":1.67,"Matter":1.64,"Substance":1.53},
          thermodynamicProperties: {"heat":0.027,"entropy":0.1898,"reactivity":2.0486,"gregsEnergy":-0.3618,"kalchm":0.5248,"monica":0.8752},
          substitutions: [{"originalIngredient":"Hale's Blue Boy","substituteOptions":["Any highly concentrated fruit syrup"]}]
        },
        {
          name: "Yum Woon Sen",
          description: "A highly kinetic glass noodle salad. It relies on the absolute absorption capabilities of mung bean threads to hold a fiercely sour, spicy, and savory dressing, studded with blanched seafood and sharp aromatics.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":5,"baseServingSize":2,"spiceLevel":"High","season":["summer","spring"]},
          ingredients: [{"amount":100,"unit":"g","name":"Glass noodles (Woon Sen)","notes":"Mung bean threads, soaked in cold water."},{"amount":0.5,"unit":"lb","name":"Shrimp and minced pork","notes":"The dual protein base."},{"amount":3,"unit":"tbsp","name":"Lime juice","notes":"Fresh."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For umami."},{"amount":1,"unit":"tbsp","name":"Palm sugar","notes":"Dissolved."},{"amount":3,"unit":"whole","name":"Bird's eye chilies","notes":"Pounded."},{"amount":0.5,"unit":"cup","name":"Chinese celery and cilantro","notes":"Roughly chopped."},{"amount":0.5,"unit":"whole","name":"Red onion","notes":"Sliced thinly."},{"amount":2,"unit":"tbsp","name":"Roasted peanuts","notes":"For crunch."}],
          instructions: ["Step 1: The Dressing Matrix. In a large mixing bowl, whisk together the lime juice, fish sauce, palm sugar, and pounded chilies until the sugar is completely dissolved into a sharp, balanced elixir.","Step 2: The Protein Poach. Bring a pot of water to a boil. Briefly blanch the shrimp until just pink. In a separate pan with a tiny splash of water, cook the minced pork until it turns white. Add both hot proteins (and the small amount of pork broth) to the dressing.","Step 3: The Noodle Shock. Drop the soaked glass noodles into boiling water for exactly 2 minutes until translucent. Drain well and immediately add them to the bowl while blazing hot.","Step 4: The Absorption. Toss the hot noodles and proteins aggressively in the dressing. The heat of the noodles will instantly absorb the liquid matrix.","Step 5: The Aromatics. Fold in the red onion, Chinese celery, and cilantro. Top with roasted peanuts. Serve warm or at room temperature."],
          classifications: {"mealType":["appetizer","lunch"],"cookingMethods":["blanching","mixing"]},
          elementalProperties: {"Fire":0.35,"Water":0.4,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mercury","Uranus"],"signs":["gemini","aquarius"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":320,"proteinG":22,"carbsG":45,"fatG":8,"fiberG":2,"sodiumMg":1200,"sugarG":12,"vitamins":["Vitamin C","Niacin"],"minerals":["Selenium","Zinc"]},

          alchemicalProperties: {"Spirit":2.64,"Essence":3.71,"Matter":3.46,"Substance":3.19},
          thermodynamicProperties: {"heat":0.0585,"entropy":0.2899,"reactivity":2.3943,"gregsEnergy":-0.6356,"kalchm":0.5664,"monica":0.0922},
          substitutions: [{"originalIngredient":"Minced pork","substituteOptions":["Minced chicken","More seafood"]}]
        },
      ],
      winter: [
        {
          name: "Gaeng Massaman Neua",
          description: "The most complex of Thai curries, bearing deep Persian and Indian influence. Heavy, warm spices (cardamom, cinnamon) are pounded into a paste, then slowly braised with beef and potatoes in a violently rich, peanut-laced coconut cream.",
          details: {"cuisine":"Thai","prepTimeMinutes":30,"cookTimeMinutes":120,"baseServingSize":4,"spiceLevel":"Mild","season":["winter","autumn"]},
          ingredients: [{"amount":1.5,"unit":"lbs","name":"Beef chuck","notes":"Cut into large cubes for slow braising."},{"amount":4,"unit":"tbsp","name":"Massaman curry paste","notes":"A heavy, spice-driven paste."},{"amount":2,"unit":"cups","name":"Coconut milk","notes":"Separated into thick cream and thin milk."},{"amount":2,"unit":"whole","name":"Potatoes","notes":"Cut into large chunks."},{"amount":1,"unit":"whole","name":"Onion","notes":"Cut into wedges."},{"amount":0.25,"unit":"cup","name":"Roasted peanuts","notes":"Whole."},{"amount":3,"unit":"tbsp","name":"Tamarind paste","notes":"For deep, fruity sweetness."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For salinity."},{"amount":1,"unit":"whole","name":"Cinnamon stick & Star anise","notes":"Whole spices."}],
          instructions: ["Step 1: The Meat Braise. Simmer the beef chunks in the thin portion of the coconut milk with water for 1.5 hours until tender. This creates a fortified beef-coconut stock.","Step 2: The Oil Separation (Keeo Gati). In a separate heavy pot, heat the thick coconut cream over medium heat. Simmer until the water evaporates and the pure coconut oil violently separates and 'cracks' from the white solids.","Step 3: The Paste Frying. Add the massaman curry paste to the cracked coconut oil. Fry aggressively until it darkens and emits an incredibly rich, spiced aroma.","Step 4: The Unification. Transfer the braised beef and its cooking liquid into the fried paste. Add the potatoes, onions, peanuts, and whole spices. Bring to a gentle simmer.","Step 5: The Balance. Season with tamarind paste, fish sauce, and palm sugar. The resulting sauce must be thick, oily, and fiercely balanced between sweet, savory, and aromatic. Simmer until the potatoes are soft. Serve with rice."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["braising","paste frying"]},
          elementalProperties: {"Fire":0.2,"Water":0.25,"Earth":0.45,"Air":0.1},
          astrologicalAffinities: {"planets":["Jupiter","Saturn"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":650,"proteinG":38,"carbsG":28,"fatG":45,"fiberG":5,"sodiumMg":950,"sugarG":14,"vitamins":["Iron","Vitamin B12"],"minerals":["Zinc","Potassium"]},

          alchemicalProperties: {"Spirit":2.59,"Essence":3.53,"Matter":4.71,"Substance":4.15},
          thermodynamicProperties: {"heat":0.0388,"entropy":0.3,"reactivity":1.371,"gregsEnergy":-0.3726,"kalchm":0.0019,"monica":0.4842},
          substitutions: [{"originalIngredient":"Beef chuck","substituteOptions":["Chicken thighs (reduce braise time)"]}]
        },
        {
          name: "Tom Yum Goong Nam Khon",
          description: "The creamy version of the iconic Thai soup. It balances violent chili heat and sharp lime acidity with the intense aromatics of galangal and makrut lime leaf, bound together by a lush emulsion of evaporated milk and chili jam.",
          details: {"cuisine":"Thai","prepTimeMinutes":15,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Very High","season":["all"]},
          ingredients: [{"amount":3,"unit":"cups","name":"Shrimp stock or water","notes":"Ideally made from the shrimp shells."},{"amount":0.5,"unit":"lb","name":"Large shrimp","notes":"Peeled, tails left on."},{"amount":2,"unit":"stalks","name":"Lemongrass","notes":"Bruised and cut into 2-inch pieces."},{"amount":5,"unit":"slices","name":"Galangal","notes":"Fresh, do not substitute ginger."},{"amount":5,"unit":"leaves","name":"Makrut lime leaves","notes":"Torn to release oils."},{"amount":1,"unit":"cup","name":"Oyster or straw mushrooms","notes":"Torn."},{"amount":2,"unit":"tbsp","name":"Nam Prik Pao","notes":"Thai roasted chili jam."},{"amount":0.25,"unit":"cup","name":"Evaporated milk","notes":"Creates the 'Nam Khon' (creamy) texture."},{"amount":3,"unit":"tbsp","name":"Lime juice","notes":"Added off heat."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"Added off heat."}],
          instructions: ["Step 1: The Aromatic Infusion. Bring the stock to a rolling boil. Add the bruised lemongrass, galangal slices, and torn makrut lime leaves. Boil aggressively for 5 minutes to extract their intense essential oils into the water. The kitchen will become fiercely fragrant.","Step 2: The Mushrooms. Add the mushrooms and boil for 2 minutes until tender.","Step 3: The Emulsion. Stir in the Nam Prik Pao (chili jam) and the evaporated milk. The broth will turn a vibrant, opaque, oily orange.","Step 4: The Poach. Add the shrimp. Cook for exactly 1-2 minutes until they just turn pink and curl. Turn off the heat immediately. Do not boil the shrimp further.","Step 5: The Acid Finish. Off the heat, stir in the fish sauce and fresh lime juice. (Boiling lime juice destroys its brightness and turns it bitter). Taste and adjust; it should be sour, salty, spicy, and creamy all at once. Top with cilantro."],
          classifications: {"mealType":["soup","dinner"],"cookingMethods":["infusing","boiling","poaching"]},
          elementalProperties: {"Fire":0.4,"Water":0.4,"Earth":0.1,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Neptune"],"signs":["aries","pisces"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":280,"proteinG":24,"carbsG":12,"fatG":14,"fiberG":2,"sodiumMg":1400,"sugarG":6,"vitamins":["Vitamin C","Vitamin A"],"minerals":["Selenium","Iodine"]},

          alchemicalProperties: {"Spirit":3.81,"Essence":5.26,"Matter":3.07,"Substance":2.86},
          thermodynamicProperties: {"heat":0.1056,"entropy":0.2933,"reactivity":5.0447,"gregsEnergy":-1.3739,"kalchm":1603.1993,"monica":-0.2241},
          substitutions: [{"originalIngredient":"Evaporated milk","substituteOptions":["Coconut milk (for a different variation)"]}]
        },
        {
          name: "Gaeng Panang Neua",
          description: "An alchemically precise execution of Gaeng Panang Neua, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Gaeng Panang Neua","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Foundation of Gaeng Panang Neua","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Khao Soi Gai",
          description: "An alchemically precise execution of Khao Soi Gai, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Khao Soi Gai","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Foundation of Khao Soi Gai","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
    },
    dessert: {
      all: [
        {
          name: "Khao Niao Mamuang",
          description: "The most beloved dessert in Thailand and a masterpiece of textural and flavor contrast. Glutinous sticky rice is steamed until tender, then soaked in a warm, salted coconut cream sauce that penetrates each grain. It is served alongside perfectly ripe, fragrant Ataulfo or Nam Dok Mai mangoes, with an additional drizzle of rich coconut cream and a garnish of toasted mung beans.",
          details: {"cuisine":"Thai","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["summer","spring"]},
          ingredients: [
            {"amount":2,"unit":"cups","name":"glutinous sticky rice","notes":"Soaked in cold water for at least 4 hours or overnight. Do not substitute with regular jasmine rice."},
            {"amount":400,"unit":"ml","name":"full-fat coconut milk","notes":"Divided: 300ml for the soaking sauce, 100ml for the topping cream."},
            {"amount":4,"unit":"tbsp","name":"granulated sugar","notes":"Divided: 3 tbsp for the soaking sauce, 1 tbsp for the topping cream."},
            {"amount":1,"unit":"tsp","name":"fine sea salt","notes":"Divided: 0.5 tsp for each component. The salt is essential and not optional."},
            {"amount":2,"unit":"whole","name":"ripe mangoes","notes":"Nam Dok Mai or Ataulfo variety. Sliced lengthwise off the pit and peeled."},
            {"amount":2,"unit":"tbsp","name":"toasted mung beans","notes":"Or toasted sesame seeds. For the final garnish texture."},
            {"amount":2,"unit":"large","name":"pandan leaves","notes":"Knotted and placed in the steamer for subtle fragrance. Optional but traditional."}
          ],
          instructions: [
            "Step 1: Soak and Steam the Rice. Drain the soaked glutinous rice. Line a steamer basket with cheesecloth or a clean cloth. Spread the rice in an even layer. If using pandan leaves, tuck them amongst the rice. Steam over vigorously boiling water for 20-25 minutes until the grains are completely tender, chewy, and translucent.",
            "Step 2: The Coconut Soaking Sauce. While the rice steams, combine 300ml of the coconut milk, 3 tablespoons of sugar, and 0.5 teaspoon of salt in a small saucepan. Heat over medium-low heat, stirring constantly, until the sugar and salt are fully dissolved. Do not boil. Remove from heat immediately.",
            "Step 3: The Absorption. Transfer the hot, freshly steamed sticky rice to a wide mixing bowl. Immediately pour the warm coconut soaking sauce over the rice. Fold gently to combine. Cover the bowl tightly with plastic wrap and allow to rest for at least 15 minutes. The rice will absorb the majority of the sauce and become glossy and rich.",
            "Step 4: The Coconut Topping Cream. In the same small saucepan, combine the remaining 100ml of coconut milk, 1 tablespoon of sugar, and 0.5 teaspoon of salt. Heat gently, whisking until dissolved. This should be pourable and slightly thicker than the soaking sauce.",
            "Step 5: Plate and Serve. Mound a generous portion of the warm, glossy sticky rice on each plate. Fan the sliced mango alongside or over the rice. Drizzle the coconut topping cream generously over both the rice and the mango. Finish with a scattering of toasted mung beans for textural contrast."
          ],
          classifications: {"mealType":["dessert"],"cookingMethods":["steaming","simmering"]},
          elementalProperties: {"Fire":0.05,"Water":0.45,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":5,"carbsG":72,"fatG":14,"fiberG":3,"sodiumMg":280,"sugarG":28,"vitamins":["Vitamin C","Vitamin B6"],"minerals":["Potassium","Magnesium"]},

          alchemicalProperties: {"Spirit":2.21,"Essence":2.86,"Matter":3.36,"Substance":3.19},
          thermodynamicProperties: {"heat":0.0455,"entropy":0.3015,"reactivity":1.659,"gregsEnergy":-0.4547,"kalchm":0.0491,"monica":-0.122},
          substitutions: [
            {"originalIngredient":"ripe mangoes","substituteOptions":["ripe peaches (summer)","ripe jackfruit","durian (for a richer result)"]},
            {"originalIngredient":"toasted mung beans","substituteOptions":["toasted sesame seeds","crispy fried shallots"]}
          ]
        },
        {
          name: "Tub Tim Grob",
          description: "An alchemically precise execution of Tub Tim Grob, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Tub Tim Grob","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Foundation of Tub Tim Grob","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Bua Loi",
          description: "An alchemically precise execution of Bua Loi, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Bua Loi","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Foundation of Bua Loi","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Sangkaya Fak Thong",
          description: "An alchemically precise execution of Sangkaya Fak Thong, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Sangkaya Fak Thong","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Foundation of Sangkaya Fak Thong","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
      summer: [
        {
          name: "Nam Kang Sai",
          description: "The structural opposite of hot and heavy. A violently cooling Thai dessert consisting of fiercely crushed ice piled over a customizable matrix of jellies, sweet beans, and syrups, flooded with condensed milk.",
          details: {"cuisine":"Thai","prepTimeMinutes":10,"cookTimeMinutes":0,"baseServingSize":1,"spiceLevel":"None","season":["summer"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Ice","notes":"Must be finely shaved or crushed into snow."},{"amount":0.5,"unit":"cup","name":"Toppings matrix","notes":"Red beans, grass jelly, sweet corn, attap seeds."},{"amount":3,"unit":"tbsp","name":"Hale's Blue Boy syrup","notes":"Iconic sweet, floral, bright red or green syrup."},{"amount":2,"unit":"tbsp","name":"Evaporated milk","notes":"For richness."},{"amount":1,"unit":"tbsp","name":"Sweetened condensed milk","notes":"For density and sweetness."}],
          instructions: ["Step 1: The Base. In the bottom of a wide bowl, arrange the chosen heavy toppings (sweet red beans, jellies, corn).","Step 2: The Mountain. Shave the ice directly over the toppings, forming a high, structured mountain. The ice must be fine enough to absorb syrup but granular enough not to instantly melt.","Step 3: The Saturation. Vigorously drench the ice mountain with the brightly colored, floral syrup. The ice will instantly absorb the color.","Step 4: The Emulsion. Pour the evaporated milk and a heavy drizzle of sweetened condensed milk over the top. The milk will streak down the sides, creating a visual marbling effect.","Step 5: The Collapse. Serve immediately with a spoon. As it is eaten, the ice collapses into the sweet milks and toppings, creating a cold, slushy soup."],
          classifications: {"mealType":["dessert","snack","beverage"],"cookingMethods":["shaving ice","assembling"]},
          elementalProperties: {"Fire":0,"Water":0.7,"Earth":0.15,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Neptune"],"signs":["cancer","pisces"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":250,"proteinG":4,"carbsG":55,"fatG":4,"fiberG":2,"sodiumMg":80,"sugarG":45,"vitamins":["Calcium"],"minerals":["Phosphorus"]},

          alchemicalProperties: {"Spirit":0.96,"Essence":1.67,"Matter":1.64,"Substance":1.53},
          thermodynamicProperties: {"heat":0.027,"entropy":0.1898,"reactivity":2.0486,"gregsEnergy":-0.3618,"kalchm":0.5248,"monica":0.8752},
          substitutions: [{"originalIngredient":"Hale's Blue Boy","substituteOptions":["Any highly concentrated fruit syrup"]}]
        },
      ],
    },
    snacks: {
      all: [
        {
          name: "Kluay Tod",
          description: "An alchemically precise execution of Kluay Tod, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Kluay Tod","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Foundation of Kluay Tod","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
    },
  },
  traditionalSauces: {
    namPlaWaan: {
      name: "Nam Pla Wan (Sweet Fish Sauce)",
      description:
        "Sweet, spicy, and salty sauce combining fish sauce with palm sugar and chili",
      base: "fish sauce",
      keyIngredients: [
        "fish sauce",
        "palm sugar",
        "lime juice",
        "garlic",
        "chili",
      ],
      culinaryUses: [
        "dipping sauce",
        "dressing",
        "flavor base",
        "marinade",
        "condiment",
      ],
      variants: [
        "Nam Jim seafood",
        "Nam Jim Jaew",
        "Nam Jim Gai",
        "Spicy version",
        "Mild version",
      ],
      elementalProperties: {
        Water: 0.4,
        Fire: 0.3,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Mars", "Pisces"],
      seasonality: "all",
      preparationNotes:
        "Balance is key - should achieve equal sweet, sour, and salty notes with heat according to preference",
      technicalTips:
        "Palm sugar can be melted with a little water to help it dissolve more easily",
    },
    namPhrik: {
      name: "Nam Phrik (Chili Paste)",
      description:
        "Foundation of Thai cuisine, a versatile chili-based paste with regional variations",
      base: "chili peppers",
      keyIngredients: [
        "chili peppers",
        "garlic",
        "shallots",
        "fermented shrimp paste",
        "lime juice",
      ],
      culinaryUses: [
        "flavor base",
        "dipping sauce",
        "stir-fry paste",
        "marinade",
        "soup enhancer",
      ],
      variants: [
        "Nam Phrik Num",
        "Nam Phrik Ong",
        "Nam Phrik Kapi",
        "Nam Phrik Pao",
        "Nam Phrik Narok",
      ],
      elementalProperties: {
        Fire: 0.6,
        Earth: 0.2,
        Water: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Traditional preparation involves pounding in a mortar and pestle to develop complex flavors",
      technicalTips:
        "Roasting ingredients before pounding enhances aroma and reduces raw spiciness",
    },
    padThaiSauce: {
      name: "Pad Thai Sauce",
      description:
        "Sweet-sour-salty sauce that defines Thailand's most famous noodle dish",
      base: "tamarind paste",
      keyIngredients: [
        "tamarind paste",
        "fish sauce",
        "palm sugar",
        "rice vinegar",
        "preserved radish",
      ],
      culinaryUses: [
        "noodle sauce",
        "stir-fry sauce",
        "marinade",
        "dressing",
        "glaze",
      ],
      variants: [
        "Traditional",
        "Vegetarian/Vegan",
        "Spicy",
        "Royal-style",
        "Street vendor style",
      ],
      elementalProperties: {
        Earth: 0.4,
        Water: 0.3,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Venus", "Mercury", "Taurus"],
      seasonality: "all",
      preparationNotes:
        "Balance of sour from tamarind, sweet from palm sugar, and salty from fish sauce is crucial",
      technicalTips:
        "Prepare in advance and reduce to concentrate flavors before adding to noodles",
    },
    currySauces: {
      name: "Curry Pastes/Sauces",
      description:
        "Aromatic spice and herb pastes that form the foundation of Thai curries",
      base: "chilies and aromatics",
      keyIngredients: [
        "chilies",
        "galangal",
        "lemongrass",
        "kaffir lime",
        "shallots",
        "garlic",
        "shrimp paste",
      ],
      culinaryUses: [
        "curry base",
        "stir-fry paste",
        "marinade",
        "flavor enhancer",
        "soup base",
      ],
      variants: [
        "Green (Kaeng Khiao Wan)",
        "Red (Kaeng Phet)",
        "Yellow (Kaeng Kari)",
        "Massaman",
        "Panang",
      ],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Jupiter", "Leo"],
      seasonality: "all",
      preparationNotes:
        "Traditional preparation requires significant time pounding ingredients to release oils and flavor compounds",
      technicalTips:
        "Fry paste in coconut cream (the thick part that rises to the top of coconut milk) until aromatic and oil separates",
    },
    srirachaSauce: {
      name: "Sriracha Sauce",
      description:
        "Fermented chili sauce with garlic and vinegar that has gained worldwide popularity",
      base: "fermented chili peppers",
      keyIngredients: [
        "red chili peppers",
        "garlic",
        "vinegar",
        "sugar",
        "salt",
      ],
      culinaryUses: [
        "condiment",
        "marinade component",
        "stir-fry addition",
        "dipping sauce",
        "flavor enhancer",
      ],
      variants: [
        "Original Thai style",
        "Vietnamese style",
        "American style",
        "Extra garlic",
        "Aged version",
      ],
      elementalProperties: {
        Fire: 0.5,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Mercury", "Sagittarius"],
      seasonality: "all",
      preparationNotes:
        "Traditional Thai version is tangier and thinner than the popular American version",
      technicalTips:
        "Fermentation develops depth of flavor beyond simple chili heat",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: [
        "nam jim gai",
        "green curry",
        "prik king",
        "pad thai sauce",
        "nam jim jaew",
      ],
      pork: [
        "nam phrik ong",
        "red curry",
        "nam jim jaew",
        "sweet soy glaze",
        "tamarind sauce",
      ],
      beef: [
        "nam tok dressing",
        "massaman curry",
        "nam jim jaew",
        "oyster sauce blend",
        "panang curry",
      ],
      seafood: [
        "seafood nam jim",
        "yellow curry",
        "lime-chili-garlic sauce",
        "sweet fish sauce",
        "green curry",
      ],
      tofu: [
        "peanut sauce",
        "massaman curry",
        "sweet soy glaze",
        "tamarind sauce",
        "red curry",
      ],
    },
    forVegetable: {
      leafy: [
        "nam jim",
        "sweet fish sauce",
        "sesame-soy dressing",
        "coconut-lime",
        "peanut sauce",
      ],
      root: [
        "naam phrik phao",
        "massaman curry",
        "ginger sauce",
        "tamarind glaze",
        "sweet fish sauce",
      ],
      fruiting: [
        "nam pla wan",
        "sriracha-lime",
        "sweet chili sauce",
        "nam phrik",
        "lime dressing",
      ],
      herbs: [
        "coconut milk",
        "simple fish sauce",
        "lime dressing",
        "chili oil",
        "garlic-pepper sauce",
      ],
      mushroom: [
        "oyster sauce blend",
        "nam prik pao",
        "golden mountain sauce",
        "black pepper sauce",
        "light soy",
      ],
    },
    forCookingMethod: {
      grilling: [
        "nam jim jaew",
        "nam jim seafood",
        "tamarind glaze",
        "sriracha marinade",
        "sweet fish sauce",
      ],
      stirFrying: [
        "pad thai sauce",
        "oyster sauce blend",
        "holy basil sauce",
        "black pepper sauce",
        "golden mountain",
      ],
      steaming: [
        "lime-garlic-chili",
        "ginger sauce",
        "soy-sesame",
        "nam jim",
        "seafood dipping sauce",
      ],
      currying: [
        "curry pastes with coconut milk",
        "massaman curry",
        "panang curry",
        "jungle curry",
        "khao soi",
      ],
      salads: [
        "som tam dressing",
        "yam dressing",
        "larb dressing",
        "nam tok",
        "plaa dressing",
      ],
    },
    byAstrological: {
      Fire: [
        "nam phrik",
        "jungle curry",
        "dried chili dip",
        "sriracha",
        "prik king",
      ],
      Water: [
        "green curry",
        "nam jim seafood",
        "coconut-based sauces",
        "fish sauce blends",
        "herb infusions",
      ],
      Earth: [
        "massaman curry",
        "peanut sauce",
        "tamarind-based sauces",
        "nam phrik ong",
        "sweet soy",
      ],
      Air: [
        "lime-based dressings",
        "herb-infused oils",
        "light nam pla prik",
        "citrus vinaigrettes",
        "lemongrass dips",
      ],
    },
    byRegion: {
      northern: [
        "nam phrik num",
        "nam phrik ong",
        "jaew bong",
        "sai ua paste",
        "hang lay curry",
      ],
      northeastern: [
        "nam jim jaew",
        "som tam sauce",
        "larb dressing",
        "fermented fish sauce",
        "tamarind dipping",
      ],
      central: [
        "green curry",
        "red curry",
        "nam prik kapi",
        "pad thai sauce",
        "sweet chili sauce",
      ],
      southern: [
        "southern curry paste",
        "khua kling paste",
        "nam phrik goong siap",
        "sator sauce",
        "gaeng tai pla",
      ],
    },
    byDietary: {
      vegetarian: [
        "peanut sauce",
        "sweet soy glaze",
        "tamarind sauce",
        "mushroom sauce",
        "coconut curry",
      ],
      vegan: [
        "lime-herb dressing",
        "tamarind-based sauces",
        "vegetable curry",
        "sesame-soy dressing",
        "chili jam",
      ],
      glutenFree: [
        "nam jim",
        "green curry",
        "herb infusions",
        "fish sauce-based",
        "coconut-based sauces",
      ],
      dairyFree: [
        "all traditional Thai sauces",
        "curry pastes",
        "oil-based dressings",
        "chili dips",
        "herb infused oils",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Wok Cooking (Pad)",
      description:
        "Fast high-heat stir-frying that preserves texture and creates 'wok hei' or breath of the wok",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: [
        "wok",
        "wok spatula",
        "high BTU burner",
        "spider strainer",
        "cleaver",
      ],
      bestFor: [
        "stir-fries",
        "noodle dishes",
        "quick curries",
        "fried rice",
        "sautéed vegetables",
      ],
      difficulty: "medium",
    },
    {
      name: "Pounding (Tam/Dtam)",
      description:
        "Using mortar and pestle to crush ingredients, releasing essential oils and combining flavors",
      elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 },
      toolsRequired: [
        "clay or stone mortar",
        "wooden pestle",
        "preparation bowls",
        "strainer",
      ],
      bestFor: [
        "curry pastes",
        "som tam",
        "nam prik",
        "herb pastes",
        "spice blends",
      ],
      difficulty: "medium",
    },
    {
      name: "Steaming (Neung)",
      description:
        "Gentle cooking with steam to preserve nutrients and delicate textures",
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      toolsRequired: [
        "bamboo steamer",
        "wok",
        "cheesecloth",
        "banana leaves",
        "steamer rack",
      ],
      bestFor: [
        "fish",
        "custards",
        "dumplings",
        "sticky rice",
        "certain vegetables",
      ],
      difficulty: "easy",
    },
    {
      name: "Grilling (Yang)",
      description:
        "Direct heat cooking over charcoal for smoky flavor and caramelization",
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: [
        "charcoal grill",
        "bamboo skewers",
        "banana leaf wrappers",
        "basting brush",
      ],
      bestFor: [
        "marinated meats",
        "fish",
        "skewered foods",
        "vegetables",
        "sticky rice in bamboo",
      ],
      difficulty: "medium",
    },
    {
      name: "Curry Making (Gaeng)",
      description:
        "Complex process of creating curry from scratch with paste-making and slow simmering",
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      toolsRequired: [
        "mortar and pestle",
        "heavy pot",
        "coconut press",
        "strainer",
        "wooden spoons",
      ],
      bestFor: [
        "coconut-based curries",
        "clear spicy soups",
        "braised dishes",
        "complex stews",
      ],
      difficulty: "hard",
    },
  ],
  regionalCuisines: [
    {
      name: "Northern Thai (Lanna)",
      description:
        "More mild and less spicy cuisine with Burmese and Lao influences, featuring sticky rice and pork",
      signatureDishes: [
        "Khao Soi",
        "Nam Prik Ong",
        "Sai Ua",
        "Gaeng Hang Lay",
        "Khao Lam",
      ],
      keyIngredients: [
        "sticky rice",
        "pork",
        "tomatoes",
        "ginger",
        "turmeric",
        "kaffir lime",
      ],
      cookingTechniques: ["grilling", "stewing", "fermenting", "steaming"],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      culturalInfluences: ["Lanna Kingdom", "Burmese", "Chinese Yunnan", "Lao"],
      philosophicalFoundations:
        "Connected to Lanna traditions with an emphasis on communal dining and seasonal ingredients",
    },
    {
      name: "Northeastern Thai (Isaan)",
      description:
        "Intense flavors with Lao influence, featuring fermentation, spicy chilies, and sticky rice",
      signatureDishes: [
        "Som Tam",
        "Larb",
        "Gai Yang",
        "Nam Tok",
        "Moo Nam Tok",
      ],
      keyIngredients: [
        "sticky rice",
        "chilies",
        "lime",
        "fish sauce",
        "fresh herbs",
        "fermented fish",
      ],
      cookingTechniques: [
        "grilling",
        "pounding",
        "fermenting",
        "raw preparations",
      ],
      elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
      culturalInfluences: ["Lao", "Khmer", "Vietnamese"],
      philosophicalFoundations:
        "Emphasizes simple, straightforward preparations that highlight fresh ingredients",
    },
    {
      name: "Central Thai",
      description:
        "The royal court cuisine with balanced flavors combining sweet, sour, salty, and spicy elements",
      signatureDishes: [
        "Pad Thai",
        "Tom Yum Goong",
        "Gaeng Keow Wan",
        "Massaman Curry",
        "Hoy Tod",
      ],
      keyIngredients: [
        "jasmine rice",
        "coconut milk",
        "palm sugar",
        "fish sauce",
        "chilies",
        "galangal",
      ],
      cookingTechniques: [
        "stir-frying",
        "curry making",
        "deep-frying",
        "slow simmering",
      ],
      elementalProperties: { Water: 0.3, Fire: 0.3, Earth: 0.2, Air: 0.2 },
      culturalInfluences: [
        "Royal Thai Court",
        "Chinese",
        "Persian",
        "Portuguese",
      ],
      philosophicalFoundations:
        "Balance and refinement from royal court traditions, with elaborate preparations",
    },
    {
      name: "Southern Thai",
      description:
        "Intensely spicy and aromatic cuisine with Malaysian influences and abundant seafood",
      signatureDishes: [
        "Gaeng Tai Pla",
        "Khua Kling",
        "Gaeng Som",
        "Sataw Pad Kapi Goong",
        "Khao Yam",
      ],
      keyIngredients: [
        "seafood",
        "turmeric",
        "southern bird's eye chilies",
        "sator beans",
        "coconut",
      ],
      cookingTechniques: [
        "slow cooking",
        "dry currying",
        "stewing",
        "fermenting",
      ],
      elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
      culturalInfluences: ["Malay", "Indonesian", "Indian"],
      philosophicalFoundations:
        "Bold approach to flavor showcasing heat, pungency, and freshness of local ingredients",
    },
    {
      name: "Royal Thai Cuisine",
      description:
        "Refined, artistic cuisine developed in the royal palace with intricate preparation techniques",
      signatureDishes: [
        "Mee Krob",
        "Pla Dook Foo",
        "Chor Muang",
        "Massaman Curry",
        "Foi Thong",
      ],
      keyIngredients: [
        "premium meats",
        "coconut cream",
        "palm sugar",
        "edible flowers",
        "aromatic spices",
      ],
      cookingTechniques: [
        "carving",
        "intricate presentation",
        "reduction",
        "slow cooking",
      ],
      elementalProperties: { Air: 0.3, Earth: 0.3, Water: 0.2, Fire: 0.2 },
      culturalInfluences: [
        "Thai Royal Court",
        "Ayutthaya Kingdom",
        "Persian",
        "European",
      ],
      philosophicalFoundations:
        "Emphasizes aesthetic beauty, balance of flavors, and sophisticated presentation",
    },
  ],
  elementalProperties: {
    Fire: 0.35, // Represents spicy elements, chili heat, and grilling techniques,
    Water: 0.25, // Represents soups, coconut-based dishes, and steaming,
    Earth: 0.25, // Represents grains, proteins, and root vegetables,
    Air: 0.15, // Represents herbs, aromatics, and light textures
  },
};

export default thai;
