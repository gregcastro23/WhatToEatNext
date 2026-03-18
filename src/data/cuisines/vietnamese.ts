// src/data/vietnamese.ts
import type { Cuisine } from "@/types/cuisine";

export const vietnamese: Cuisine = {
  id: "vietnamese",
  name: "Vietnamese",
  description:
    "Traditional Vietnamese cuisine emphasizing fresh ingredients, herbs, and balanced flavors",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Phở Bò (Vietnamese Beef Noodle Soup)",
          "description": "A deeply restorative and complex noodle soup that embodies the essence of Vietnamese culinary alchemy. It balances the deep, grounding earthiness of simmered beef bones with the ethereal, volatile aromatics of charred ginger, star anise, and cinnamon. Traditionally served as a morning meal, it invigorates the spirit and aligns the body's internal heat.",
          "details": {
            "cuisine": "Vietnamese",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 360,
            "baseServingSize": 4,
            "spiceLevel": "Mild",
            "season": [
              "all",
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "kg",
              "name": "beef leg bones or knuckle bones",
              "notes": "Parboiled and rinsed rigorously before the main simmer to ensure a crystal-clear broth."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "beef brisket or chuck",
              "notes": "Simmered in the broth until tender, then sliced thinly against the grain."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Unpeeled, charred over an open flame until blackened outside and softened inside."
            },
            {
              "amount": 1,
              "unit": "large piece (about 4 inches)",
              "name": "fresh ginger",
              "notes": "Unpeeled, charred over an open flame, then smashed to release volatile oils."
            },
            {
              "amount": 5,
              "unit": "whole",
              "name": "star anise pods",
              "notes": "Lightly toasted in a dry pan until fragrant."
            },
            {
              "amount": 1,
              "unit": "stick (about 3 inches)",
              "name": "cinnamon stick (cassia bark)",
              "notes": "Lightly toasted."
            },
            {
              "amount": 3,
              "unit": "whole",
              "name": "cloves",
              "notes": "Lightly toasted."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "coriander seeds",
              "notes": "Lightly toasted."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "fennel seeds",
              "notes": "Lightly toasted."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "fish sauce (nước mắm)",
              "notes": "Added towards the end of cooking to season the broth without turning it sour."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "yellow rock sugar",
              "notes": "Crucial for balancing the savory and aromatic elements with a mellow sweetness."
            },
            {
              "amount": 1.5,
              "unit": "tbsp",
              "name": "kosher salt",
              "notes": "Adjust to taste."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "dried flat rice noodles (bánh phở)",
              "notes": "Soaked in warm water, then blanched quickly in boiling water right before serving."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "beef sirloin or eye of round",
              "notes": "Sliced paper-thin across the grain. It will cook instantly when the boiling broth is poured over it."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "white onion",
              "notes": "Sliced paper-thin, soaked in ice water to remove bite, used for garnish."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "scallions (green onions)",
              "notes": "Finely chopped for garnish."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "Roughly chopped for garnish."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "Thai basil",
              "notes": "Served on the side."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "fresh mint",
              "notes": "Served on the side."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "bean sprouts",
              "notes": "Served on the side."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "lime",
              "notes": "Cut into wedges, served on the side."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "bird's eye chili",
              "notes": "Thinly sliced, served on the side for heat."
            }
          ],
          "instructions": [
            "Step 1: Parboil the bones. Place the beef bones in a large stockpot and cover with cold water. Bring to a vigorous boil and boil for 5 minutes. Drain the water and vigorously scrub the bones under cold running water to remove all impurities. Rinse the pot clean.",
            "Step 2: Char the aromatics. Place the unpeeled onion and ginger directly on a gas burner grate or under a broiler. Turn occasionally until deeply blackened and fragrant, about 10-15 minutes. Let cool, then rinse under water to remove the loose ash. Smash the ginger.",
            "Step 3: Toast the spices. In a dry skillet over medium-low heat, toast the star anise, cinnamon, cloves, coriander seeds, and fennel seeds until highly fragrant (about 3 minutes). Place them in a spice bag or cheesecloth pouch.",
            "Step 4: Begin the broth. Return the clean bones to the clean stockpot. Add the brisket/chuck, charred onion, charred ginger, rock sugar, and salt. Add 6 liters of cold water. Bring to a gentle boil, then immediately reduce the heat to a bare simmer. Continually skim off any scum or fat that rises to the surface to ensure a clear broth.",
            "Step 5: Simmer the meat. After 1.5 to 2 hours of simmering, remove the brisket/chuck once it is tender. Submerge it in a bowl of cold water for 10 minutes to stop the cooking and prevent it from turning dark, then cover and refrigerate. Slice thinly before serving.",
            "Step 6: Continue the broth. Add the spice pouch to the simmering broth. Continue to simmer gently for another 3 to 4 hours. Do not let it boil vigorously, or the broth will become cloudy.",
            "Step 7: Finish the broth. Remove the bones, onion, ginger, and spice pouch. Strain the broth through a fine-mesh sieve lined with cheesecloth into a clean pot. Bring the strained broth back to a gentle simmer. Stir in the fish sauce and adjust seasoning with salt or sugar if necessary. Keep the broth at a rolling boil right before serving.",
            "Step 8: Prepare the noodles. Soak the dried rice noodles in warm water for 30 minutes until pliable. Right before serving, blanch the soaked noodles in a separate pot of boiling water for 30-60 seconds until tender but chewy. Drain well and divide among large, deep serving bowls.",
            "Step 9: Assemble the bowls. Top the noodles in each bowl with slices of the cooked brisket and the raw, paper-thin sirloin. Add the paper-thin raw onion slices, chopped scallions, and cilantro.",
            "Step 10: Serve. Ladle the boiling hot, clear broth directly over the raw beef slices in the bowls, which will cook them instantly. Serve immediately with a plate of Thai basil, mint, bean sprouts, lime wedges, and sliced chilies for each person to customize their bowl."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "soup",
              "dinner"
            ],
            "cookingMethods": [
              "simmering",
              "charring",
              "toasting",
              "blanching"
            ]
          },
          "elementalProperties": {
            "Fire": 0.25,
            "Water": 0.55,
            "Earth": 0.1,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Jupiter",
              "Neptune"
            ],
            "signs": [
              "Pisces",
              "Aries"
            ],
            "lunarPhases": [
              "New Moon",
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 35,
            "carbsG": 60,
            "fatG": 12,
            "fiberG": 4,
              "sodiumMg": 742,
              "sugarG": 10,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          alchemicalProperties: {"Spirit":1,"Essence":3,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0321,"entropy":0.0958,"reactivity":9.4008,"gregsEnergy":-0.8689,"kalchm":27.0,"monica":0.028},
                    "substitutions": [
            {
              "originalIngredient": "beef bones and meat",
              "substituteOptions": [
                "whole chicken and chicken bones (Phở Gà)",
                "charred daikon, shiitake, and vegetable broth (Phở Chay)"
              ]
            },
            {
              "originalIngredient": "fish sauce",
              "substituteOptions": [
                "soy sauce (vegan)",
                "coconut aminos (vegan)"
              ]
            }
          ]
        },
        {
          name: "Cháo Gà",
          description: "Vietnamese chicken rice porridge. The rice is heavily broken down through prolonged simmering in a rich, ginger-fortified chicken broth, resulting in a silken, restorative matrix designed for healing.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":10,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"None","season":["winter","comfort"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Jasmine rice","notes":"Washed and toasted."},{"amount":0.25,"unit":"cup","name":"Glutinous rice","notes":"Adds viscosity."},{"amount":8,"unit":"cups","name":"Strong chicken broth","notes":"Homemade with ginger and onion."},{"amount":2,"unit":"cups","name":"Shredded chicken","notes":"Poached."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For seasoning."},{"amount":1,"unit":"inch","name":"Ginger","notes":"Julienned finely."},{"amount":0.5,"unit":"cup","name":"Scallions and cilantro","notes":"Chopped."},{"amount":1,"unit":"pinch","name":"Black pepper","notes":"White or black, heavily applied."},{"amount":1,"unit":"batch","name":"Youtiao (Quẩy)","notes":"Fried dough sticks for dipping."}],
          instructions: ["Step 1: The Toast. In a dry pan, toast the washed jasmine and glutinous rice until dry and slightly fragrant. This prevents the grains from completely dissolving into glue during the long simmer.","Step 2: The Boil. Add the toasted rice to a large pot with the boiling chicken broth.","Step 3: The Breakdown. Reduce the heat to the lowest possible simmer. Cover partially. Cook for 45-60 minutes, stirring occasionally to scrape the bottom. The grains will burst, releasing their starch to naturally thicken the liquid into a silken, suspended porridge.","Step 4: The Seasoning. Stir in the fish sauce. The texture should be thick but pourable.","Step 5: The Assembly. Ladle the hot porridge into bowls. Top generously with the shredded chicken, julienned ginger, scallions, cilantro, and a massive amount of black pepper. Serve with crispy fried dough sticks."],
          classifications: {"mealType":["breakfast","comfort","dinner"],"cookingMethods":["toasting","simmering"]},
          elementalProperties: {"Fire":0.1,"Water":0.6,"Earth":0.25,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Ceres"],"signs":["cancer","virgo"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":350,"proteinG":22,"carbsG":48,"fatG":6,"fiberG":2,"sodiumMg":850,"sugarG":2,"vitamins":["Niacin","Vitamin B6"],"minerals":["Selenium","Phosphorus"]},
          alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0012,"entropy":0.0015,"reactivity":0.8784,"gregsEnergy":-0.0002,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Chicken","substituteOptions":["Pork ribs (for Cháo Sườn)"]}]
        },
        {
          name: "Bánh Cuốn",
          description: "The delicate art of Vietnamese steaming. A fermented rice batter is spread gossamer-thin over a taut cloth suspended above boiling water, steamed into a translucent sheet, and carefully rolled around a savory pork and wood-ear mushroom filling.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":60,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Bánh cuốn flour mix","notes":"Rice flour and tapioca starch."},{"amount":3,"unit":"cups","name":"Water","notes":"For the batter."},{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"Finely minced."},{"amount":0.5,"unit":"cup","name":"Wood ear mushrooms","notes":"Rehydrated and finely minced."},{"amount":0.5,"unit":"cup","name":"Shallots","notes":"Minced."},{"amount":0.5,"unit":"cup","name":"Fried shallots","notes":"For garnish."},{"amount":0.5,"unit":"cup","name":"Nước Chấm","notes":"Sweet, sour, salty dipping sauce."},{"amount":4,"unit":"slices","name":"Chả lụa","notes":"Vietnamese pork sausage."}],
          instructions: ["Step 1: The Batter and Rest. Whisk the flour mix, water, a pinch of salt, and a dash of oil. It is crucial to let this batter rest for at least 30 minutes (or overnight) so the starches fully hydrate, ensuring elasticity.","Step 2: The Filling. Sauté the minced pork, wood ear mushrooms, and shallots with fish sauce and black pepper until dry and fragrant.","Step 3: The Steam Drum. Prepare a specialized steaming pot with a taut cloth stretched tightly over the boiling water. (Alternatively, use a non-stick crepe pan).","Step 4: The Casting. Pour a very small ladle of batter onto the hot cloth. Quickly spread it into a massive, paper-thin circle using the back of the ladle. Cover with a domed lid and steam for exactly 60 seconds until the sheet bubbles and becomes translucent.","Step 5: The Roll. Using a flat bamboo stick, carefully lift the fragile sheet off the cloth onto an oiled tray. Place a line of filling in the center and roll it into a neat cylinder. Serve topped with fried shallots, accompanied by chả lụa and a bowl of warm nước chấm."],
          classifications: {"mealType":["breakfast","lunch"],"cookingMethods":["steaming","rolling"]},
          elementalProperties: {"Fire":0.1,"Water":0.45,"Earth":0.25,"Air":0.2},
          astrologicalAffinities: {"planets":["Venus","Mercury"],"signs":["libra","gemini"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":420,"proteinG":18,"carbsG":55,"fatG":14,"fiberG":4,"sodiumMg":950,"sugarG":8,"vitamins":["Thiamin","Niacin"],"minerals":["Iron","Manganese"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0664,"entropy":0.2812,"reactivity":2.0816,"gregsEnergy":-0.519,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Ground pork","substituteOptions":["More mushrooms and tofu (vegetarian)"]}]
        },
        {
          "name": "Authentic Xôi Xéo",
          "description": "An iconic Northern Vietnamese street food breakfast. Xôi Xéo is a brilliant study in textural contrast and visual warmth. The radiant yellow glutinous rice (dyed naturally with turmeric) provides a chewy, grounding base, topped with a rich, savory paste of steamed mung beans, and crowned with the crispy, aromatic crunch of fried shallots and a drizzle of shallot oil.",
          "details": {
            "cuisine": "Vietnamese",
            "prepTimeMinutes": 240,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "short-grain glutinous rice (sweet rice)",
              "notes": "Must be soaked for at least 4 hours, preferably overnight, to steam properly."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground turmeric",
              "notes": "Mixed into the soaking water to give the rice its signature brilliant yellow hue."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Divided; half for the rice, half for the mung beans."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "peeled, split mung beans",
              "notes": "Soaked for 4 hours until softened."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "neutral oil or rendered chicken fat",
              "notes": "For mixing into the cooked mung bean paste for richness."
            },
            {
              "amount": 6,
              "unit": "large",
              "name": "shallots",
              "notes": "Thinly and evenly sliced."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "neutral oil",
              "notes": "For frying the shallots. The resulting shallot-infused oil is used to dress the dish."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "coconut milk",
              "notes": "Optional, but highly recommended; sprinkled over the rice during the last 5 minutes of steaming for a glossy finish."
            }
          ],
          "instructions": [
            "Step 1: Soak the rice and beans. Rinse the glutinous rice until the water runs clear. In a large bowl, dissolve the turmeric in plenty of water, add the rice, and soak for 4-8 hours. In a separate bowl, rinse and soak the split mung beans for 4 hours.",
            "Step 2: Prepare the fried shallots (Hành Phi). In a small saucepan, combine the sliced shallots and the 1/2 cup of neutral oil over medium-low heat. Fry gently, stirring frequently, until the shallots turn golden brown and crispy (about 15-20 minutes). Carefully strain the shallots through a fine-mesh sieve, catching the infused oil in a bowl. Spread the shallots on paper towels to crisp up and cool. Reserve the shallot oil.",
            "Step 3: Steam the mung beans. Drain the soaked mung beans well. Toss them with 1/2 tsp of salt. Place them in a steamer basket over boiling water and steam for 15-20 minutes until easily mashed between two fingers.",
            "Step 4: Form the mung bean paste. While the beans are still hot, transfer them to a mortar and pestle, food processor, or use a potato masher. Pound or process them into a completely smooth, fine paste. Mix in 1 tbsp of neutral oil (or rendered chicken fat/shallot oil). While still warm and pliable, tightly compress the paste into a firm, dense ball. Cover with plastic wrap and let it cool and set.",
            "Step 5: Steam the sticky rice. Drain the turmeric-soaked rice thoroughly. Toss with the remaining 1/2 tsp of salt and 1 tbsp of the reserved shallot oil. Place the rice in a steamer basket lined with cheesecloth or a muslin cloth. Make a few holes in the rice layer to allow steam to escape.",
            "Step 6: Steam the rice over boiling water for 30-35 minutes. At the 25-minute mark, gently sprinkle the coconut milk (if using) evenly over the rice and fluff it gently with chopsticks. Continue steaming until the rice is tender, sticky, and slightly translucent, but not mushy.",
            "Step 7: Assemble the dish. Place a portion of the warm yellow sticky rice onto a plate or a banana leaf.",
            "Step 8: Take the firm ball of mung bean paste and, using a sharp knife, shave off very thin, delicate slices directly over the hot rice. The heat of the rice will slightly soften the mung bean shavings.",
            "Step 9: Drizzle 1-2 teaspoons of the reserved fragrant shallot oil over the rice and mung beans.",
            "Step 10: Garnish generously with the crispy fried shallots. Serve immediately while warm."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack",
              "street food"
            ],
            "cookingMethods": [
              "steaming",
              "frying",
              "mashing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.2,
            "Earth": 0.5,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn",
              "Sun"
            ],
            "signs": [
              "Taurus",
              "Virgo"
            ],
            "lunarPhases": [
              "First Quarter",
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 10,
            "carbsG": 65,
            "fatG": 14,
            "fiberG": 6,
              "sodiumMg": 526,
              "sugarG": 9,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          alchemicalProperties: {"Spirit":2,"Essence":0,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":1.1753,"entropy":1.3997,"reactivity":1.8156,"gregsEnergy":-1.3658,"kalchm":4.0,"monica":0.5427},
                    "substitutions": [
            {
              "originalIngredient": "short-grain glutinous rice",
              "substituteOptions": [
                "long-grain sweet rice"
              ]
            },
            {
              "originalIngredient": "split mung beans",
              "substituteOptions": [
                "split yellow peas",
                "red lentils (texture will vary slightly)"
              ]
            },
            {
              "originalIngredient": "coconut milk",
              "substituteOptions": [
                "omit entirely for a more traditional, savory profile"
              ]
            }
          ]
        },
        {
          name: "Bánh Mì Ốp La",
          description: "An alchemically precise execution of Bánh Mì Ốp La, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Bánh Mì Ốp La","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0756,"entropy":0.0918,"reactivity":3.32,"gregsEnergy":-0.2293,"kalchm":4.0,"monica":0.0498},
                    substitutions: [{"originalIngredient":"Foundation of Bánh Mì Ốp La","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
      winter: [
        {
          name: "Cháo",
          description: "An alchemically precise execution of Cháo, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Cháo","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0756,"entropy":0.0918,"reactivity":3.32,"gregsEnergy":-0.2293,"kalchm":4.0,"monica":0.0498},
                    substitutions: [{"originalIngredient":"Foundation of Cháo","substituteOptions":["Alternate protein or vegetable"]}]
        },
      ],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Bánh Mì Thịt Nướng",
          "description": "The quintessential Vietnamese-French culinary synthesis.",
          "details": {
            "cuisine": "Vietnamese",
            "prepTimeMinutes": 180,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "Mild-Medium",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "pork shoulder",
              "notes": "Thinly sliced."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "lemongrass",
              "notes": "Minced."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "Vietnamese baguettes",
              "notes": "Airy inside."
            }
          ],
          "instructions": [
            "Step 1: Marinate pork in lemongrass, fish sauce, sugar.",
            "Step 2: Grill pork quickly over high heat until charred.",
            "Step 3: Toast baguette.",
            "Step 4: Spread mayo and pate.",
            "Step 5: Layer pork, pickled daikon/carrots, cucumber, cilantro, jalapeño.",
            "Step 6: Drizzle Maggi seasoning."
          ],
          "classifications": {
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "grilling",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.15,
            "Earth": 0.25,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Gemini"
            ],
            "lunarPhases": [
              "Waxing Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 520,
            "proteinG": 28,
            "carbsG": 48,
            "fatG": 24,
            "fiberG": 3,
              "sodiumMg": 335,
              "sugarG": 16,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0237,"entropy":0.0347,"reactivity":0.7824,"gregsEnergy":-0.0035,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "pork shoulder",
              "substituteOptions": [
                "chicken thighs"
              ]
            }
          ]
        },
        {
          name: "Bún Chả",
          description: "The smoky, caramelized scent of Hanoi. Fatty pork patties and belly slices are aggressively grilled over charcoal, then submerged entirely in a warm, acidic, sweet-savory broth of diluted fish sauce and green papaya, eaten with cold rice noodles.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":0.5,"unit":"lb","name":"Pork belly","notes":"Thinly sliced."},{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"Formed into small patties."},{"amount":2,"unit":"tbsp","name":"Caramel sauce (Nước màu)","notes":"Essential for color and sweetness."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For marinade."},{"amount":1,"unit":"tbsp","name":"Minced lemongrass and garlic","notes":"Aromatics."},{"amount":1,"unit":"cup","name":"Warm Nước Chấm","notes":"Dipping broth: fish sauce, sugar, lime, water."},{"amount":0.5,"unit":"cup","name":"Green papaya and carrot","notes":"Pickled, floating in the broth."},{"amount":8,"unit":"oz","name":"Bún (Rice vermicelli)","notes":"Cooked and cooled."},{"amount":1,"unit":"basket","name":"Fresh herbs","notes":"Mint, perilla, lettuce."}],
          instructions: ["Step 1: The Marinade. Massage the sliced pork belly and the ground pork patties with the caramel sauce, fish sauce, lemongrass, garlic, and a pinch of sugar. The caramel sauce is non-negotiable for the dark, lacquered exterior.","Step 2: The Charcoal Fire. Grill the meats over a fiercely hot charcoal fire. The rendering fat will drip onto the coals, creating a heavy smoke that aggressively perfumes the meat.","Step 3: The Broth. In a bowl, prepare the dipping broth. It must be warm, a delicate balance of sweet, sour, and salty, acting as a soup rather than a pure condiment. Add the pickled papaya and carrots.","Step 4: The Submersion. Take the violently sizzling, charred meats directly from the grill and plunge them straight into the bowl of warm broth.","Step 5: The Ritual. To eat, take a pinch of cold bún noodles and fresh herbs, dip them into the meat-infused broth, and eat in a single bite. The contrast of hot, smoky meat, warm broth, and cold noodles is the defining feature."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["grilling","marinating"]},
          elementalProperties: {"Fire":0.45,"Water":0.3,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":680,"proteinG":32,"carbsG":65,"fatG":34,"fiberG":4,"sodiumMg":1800,"sugarG":18,"vitamins":["Vitamin C","Niacin"],"minerals":["Zinc","Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1849,"entropy":0.202,"reactivity":1.741,"gregsEnergy":-0.1668,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Chicken thighs"]}]
        },
        {
          name: "Bún Bò Huế",
          description: "The dark, fiery, and fiercely aromatic beef noodle soup of Central Vietnam. It relies on a violently heavy broth extracted from beef bones and pork knuckles, tinted blood-red with annatto and heavily perfumed with massive stalks of bruised lemongrass and fermented shrimp paste.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":240,"baseServingSize":4,"spiceLevel":"High","season":["winter","all"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"Beef and pork bones","notes":"Oxtail, pork knuckles (giò heo)."},{"amount":1,"unit":"lb","name":"Beef shank or brisket","notes":"For slicing."},{"amount":6,"unit":"stalks","name":"Lemongrass","notes":"Heavily bruised."},{"amount":2,"unit":"tbsp","name":"Mắm ruốc","notes":"Fermented shrimp paste. The funky soul of the broth."},{"amount":2,"unit":"tbsp","name":"Annatto oil","notes":"Oil infused with achiote seeds for the fiery red color."},{"amount":1,"unit":"tbsp","name":"Chili flakes","notes":"Fried in the annatto oil."},{"amount":1,"unit":"package","name":"Thick round rice noodles (Bún bò)","notes":"Thicker than standard pho noodles."},{"amount":1,"unit":"basket","name":"Banana blossom, mint, lime","notes":"For garnish."},{"amount":4,"unit":"cubes","name":"Congealed pork blood (Huyết)","notes":"Traditional authentic inclusion."}],
          instructions: ["Step 1: The Blanch. Violently boil all bones and meat for 10 minutes. Discard the foul water and wash the bones completely. This ensures the final heavy broth remains clean.","Step 2: The Long Extraction. Place the clean bones, beef shank, bruised lemongrass stalks, and a charred onion in a massive pot of fresh water. Simmer aggressively. Remove the beef shank after 2 hours when tender. Continue simmering the bones for another 2 hours.","Step 3: The Funk. Dissolve the dense, pungent shrimp paste (mắm ruốc) in water, let the sediment settle, and pour only the clear, highly aromatic liquid into the broth.","Step 4: The Fire Oil. In a small pan, heat oil and annatto seeds until the oil is deeply red. Discard seeds. Fry minced lemongrass and chili flakes in this red oil, then dump the entire violently sizzling mixture into the broth.","Step 5: The Assembly. Place hot, thick noodles in a bowl. Top with thin slices of the beef shank, pieces of pork knuckle, and cubes of blood. Ladle the boiling, fiery-red, lemongrass-scented broth over everything. Serve with a mountain of shredded banana blossom."],
          classifications: {"mealType":["soup","dinner"],"cookingMethods":["simmering","infusing"]},
          elementalProperties: {"Fire":0.4,"Water":0.45,"Earth":0.1,"Air":0.05},
          astrologicalAffinities: {"planets":["Pluto","Mars"],"signs":["scorpio","aries"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":650,"proteinG":45,"carbsG":68,"fatG":22,"fiberG":4,"sodiumMg":2100,"sugarG":5,"vitamins":["Vitamin B12","Iron"],"minerals":["Zinc","Sodium"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0076,"entropy":0.0078,"reactivity":0.9898,"gregsEnergy":-0.0002,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Congealed pork blood","substituteOptions":["Omit entirely (common in diaspora)"]}]
        },
        {
          name: "Gỏi Cuốn",
          description: "The aesthetic architecture of a Vietnamese summer roll. A translucent sheet of rice paper tightly binds a hyper-fresh matrix of cold vermicelli, snappy shrimp, pork, and sharp herbs, offering a purely clean flavor meant to be dragged through a heavy, fatty peanut sauce.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":10,"baseServingSize":4,"spiceLevel":"None","season":["summer","spring"]},
          ingredients: [{"amount":8,"unit":"sheets","name":"Rice paper (Bánh tráng)","notes":"For wrapping."},{"amount":0.5,"unit":"lb","name":"Pork belly or lean pork","notes":"Boiled and sliced paper-thin."},{"amount":0.5,"unit":"lb","name":"Shrimp","notes":"Boiled, peeled, and sliced in half horizontally."},{"amount":4,"unit":"oz","name":"Rice vermicelli (Bún)","notes":"Cooked and cooled."},{"amount":1,"unit":"head","name":"Lettuce","notes":"Soft leaves."},{"amount":1,"unit":"bunch","name":"Mint, cilantro, and garlic chives","notes":"Fresh herbs are the core flavor."},{"amount":0.5,"unit":"cup","name":"Peanut sauce (Tương đậu phộng)","notes":"Hoisin, peanut butter, garlic, chili."}],
          instructions: ["Step 1: The Boiling. Boil the pork until fully cooked. Let it cool, then slice it impossibly thin. Boil the shrimp just until pink, peel, and slice them directly down the center to create two thin halves.","Step 2: The Hydration. Take a sheet of rigid rice paper. Quickly dip it entirely into warm water and immediately place it flat on a damp surface. Do not soak it; it will hydrate and become sticky and pliable in about 10 seconds.","Step 3: The Architecture. On the lower third of the paper, lay a piece of lettuce. Top with a small pinch of noodles, herbs, and pork slices. Roll the paper over this pile once to form a tight core.","Step 4: The Display. Just above the core, lay 3-4 shrimp halves, pink side facing down (against the paper). Fold the left and right sides of the paper inward to seal the edges.","Step 5: The Seal. Continue rolling forward, wrapping tightly over the shrimp. The final roll should be an impossibly tight, translucent cylinder displaying the pink shrimp clearly through the skin. Serve immediately with the dense, fatty peanut dipping sauce."],
          classifications: {"mealType":["appetizer","snack"],"cookingMethods":["boiling","rolling","raw"]},
          elementalProperties: {"Fire":0,"Water":0.5,"Earth":0.2,"Air":0.3},
          astrologicalAffinities: {"planets":["Venus","Mercury"],"signs":["libra","gemini"],"lunarPhases":["New Moon"]},
          nutritionPerServing: {"calories":280,"proteinG":18,"carbsG":35,"fatG":8,"fiberG":3,"sodiumMg":650,"sugarG":4,"vitamins":["Vitamin A","Vitamin C"],"minerals":["Calcium","Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0625,"entropy":0.2867,"reactivity":2.3194,"gregsEnergy":-0.6025,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Pork and shrimp","substituteOptions":["Fried tofu (for vegetarian)"]}]
        },
        {
          name: "Cơm Gà Hội An",
          description: "The luminous yellow chicken rice of Hoi An. Rice is toasted in chicken fat and violently dyed with turmeric, then cooked in a rich chicken broth, served with hand-shredded poached chicken mixed with sharp, acidic herbs and onions.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":20,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1,"unit":"whole","name":"Free-range chicken","notes":"Essential for tight meat texture and yellow fat."},{"amount":2,"unit":"cups","name":"Jasmine rice","notes":"Washed and drained well."},{"amount":1,"unit":"tbsp","name":"Turmeric powder","notes":"For the intensely vibrant yellow color."},{"amount":2,"unit":"tbsp","name":"Chicken fat","notes":"Rendered from the chicken skin."},{"amount":1,"unit":"whole","name":"Onion","notes":"Sliced paper-thin and soaked in ice water to remove bite."},{"amount":1,"unit":"bunch","name":"Vietnamese coriander (Rau răm)","notes":"Essential sharp, peppery herb."},{"amount":2,"unit":"tbsp","name":"Lime juice and salt","notes":"To dress the chicken salad."}],
          instructions: ["Step 1: The Poach. Poach the whole chicken gently with ginger and shallots. Remove, plunge into an ice bath to tighten the skin, and reserve the golden broth.","Step 2: The Fat Rendering. Cut excess skin and fat from the chicken and fry it in a pan until it renders into a pool of liquid chicken fat.","Step 3: The Golden Grain. Heat the rendered fat in a pot. Add the raw, dry rice and turmeric powder. Toast aggressively for 5 minutes until every grain is coated in fat and violently yellow.","Step 4: The Broth Absorption. Pour the reserved chicken broth over the yellow rice. Cook like standard rice until the liquid is absorbed and the grains are fluffy and distinct.","Step 5: The Salad. Hand-shred the cooled chicken meat (do not chop it). Toss the shredded meat vigorously with the ice-cold sliced onions, rau răm, lime juice, salt, and pepper. Serve the acidic chicken salad over a mound of the rich, fatty yellow rice."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["poaching","toasting","mixing"]},
          elementalProperties: {"Fire":0.15,"Water":0.3,"Earth":0.4,"Air":0.15},
          astrologicalAffinities: {"planets":["Sun","Venus"],"signs":["leo","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":550,"proteinG":35,"carbsG":65,"fatG":15,"fiberG":2,"sodiumMg":750,"sugarG":2,"vitamins":["Niacin","Vitamin B6"],"minerals":["Iron","Zinc"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1259,"entropy":0.1433,"reactivity":1.0893,"gregsEnergy":-0.0303,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Free-range chicken","substituteOptions":["Standard chicken (though less authentic in texture)"]}]
        },
        {
          name: "Bánh Xèo",
          description: "A wildly crisp, violently yellow Vietnamese crepe. The batter, colored with turmeric and enriched with coconut milk, is poured into a smoking hot wok to fry aggressively, trapping shrimp, pork, and bean sprouts in a brittle, lacy shell.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":20,"cookTimeMinutes":15,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Rice flour","notes":"Do not use wheat flour."},{"amount":0.5,"unit":"tsp","name":"Turmeric powder","notes":"For the yellow color."},{"amount":0.5,"unit":"cup","name":"Coconut milk","notes":"Adds slight richness."},{"amount":1,"unit":"cup","name":"Water or beer","notes":"Beer adds carbonation for extra crispness."},{"amount":0.25,"unit":"lb","name":"Pork belly","notes":"Sliced thinly."},{"amount":0.25,"unit":"lb","name":"Shrimp","notes":"Small, left whole."},{"amount":1,"unit":"cup","name":"Bean sprouts","notes":"For internal crunch."},{"amount":1,"unit":"basket","name":"Lettuce and herbs","notes":"Mustard greens, mint, perilla, for wrapping."}],
          instructions: ["Step 1: The Slurry. Whisk the rice flour, turmeric, coconut milk, water/beer, and a pinch of salt into a very thin, watery liquid. Let it rest for 30 minutes.","Step 2: The Sizzle. Heat a large skillet or wok over extremely high heat. Add oil, a few slices of pork, and shrimp. Sear aggressively.","Step 3: The Searing Lace. Vigorously stir the batter (the flour sinks). Pour a ladle of the thin batter into the violently hot pan, swirling immediately to coat the entire surface. It must hiss loudly and form a thin, lacy edge.","Step 4: The Steam. Throw a handful of bean sprouts onto one half of the crepe. Cover the pan immediately for exactly 1 minute to steam the sprouts and cook the top of the batter.","Step 5: The Crisp. Remove the lid. Lower the heat slightly and wait (about 2-3 minutes) for the bottom to become entirely rigid, brittle, and deeply brown. Fold in half. Slide onto a plate. To eat, rip off a piece of the crispy crepe, wrap it in a mustard green leaf with fresh herbs, and plunge it into dipping sauce."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["shallow frying","steaming"]},
          elementalProperties: {"Fire":0.4,"Water":0.15,"Earth":0.25,"Air":0.2},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","gemini"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":480,"proteinG":18,"carbsG":55,"fatG":22,"fiberG":4,"sodiumMg":650,"sugarG":4,"vitamins":["Vitamin C","Vitamin K"],"minerals":["Calcium","Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1716,"entropy":0.2083,"reactivity":1.4224,"gregsEnergy":-0.1247,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Pork and shrimp","substituteOptions":["Mushrooms and tofu"]}]
        },
      ],
    },
    dinner: {
      all: [
        {
          name: "Cá Kho Tộ",
          description: "The essence of Vietnamese peasant cooking. Catfish steaks are violently braised in a traditional clay pot, utilizing a thick, boiling matrix of fish sauce, coconut water, and dark caramel to shellack the fish in a deeply salty, sweet, sticky glaze.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":15,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Catfish steaks","notes":"Bone-in, skin-on. The fat is crucial."},{"amount":3,"unit":"tbsp","name":"Sugar","notes":"For creating the dark caramel (Nước màu)."},{"amount":4,"unit":"tbsp","name":"Fish sauce","notes":"High salinity."},{"amount":1,"unit":"cup","name":"Coconut water","notes":"Natural sweetness and braising liquid."},{"amount":1,"unit":"tbsp","name":"Black pepper","notes":"Coarsely ground, massive quantity."},{"amount":3,"unit":"whole","name":"Shallots and garlic","notes":"Minced."},{"amount":2,"unit":"whole","name":"Thai chilies","notes":"Left whole or halved."}],
          instructions: ["Step 1: The Caramel Burn. In a traditional clay pot (tộ) or a heavy Dutch oven, heat the sugar and a splash of water over medium heat. Do not stir. Let it boil until it turns into a dark, smoking, reddish-black caramel. Work fast before it turns to bitter ash.","Step 2: The Searing. Immediately add the minced shallots and garlic to the dark caramel to stop the cooking. Add the fish sauce (it will spit violently).","Step 3: The Coating. Lay the catfish steaks flat in the bubbling dark liquid. Turn them once so they are coated in the intensely dark caramel-fish sauce glaze.","Step 4: The Braise. Pour in the coconut water, add the chilies and a massive dose of black pepper. Bring to a vigorous boil.","Step 5: The Reduction. Reduce the heat and simmer uncovered for 30-40 minutes. The liquid must reduce down into a thick, sticky, intensely salty-sweet glaze that clings to the rich fish fat. Serve directly in the clay pot alongside plain white rice."],
          classifications: {"mealType":["dinner","comfort"],"cookingMethods":["caramelizing","braising"]},
          elementalProperties: {"Fire":0.35,"Water":0.3,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Pluto","Saturn"],"signs":["scorpio","capricorn"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":350,"proteinG":22,"carbsG":18,"fatG":18,"fiberG":1,"sodiumMg":1600,"sugarG":15,"vitamins":["Vitamin D","Vitamin B12"],"minerals":["Potassium","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0843,"entropy":0.0899,"reactivity":0.439,"gregsEnergy":0.0448,"kalchm":0.25,"monica":0.0736},
                    substitutions: [{"originalIngredient":"Catfish","substituteOptions":["Salmon","Pork belly (for Thịt Kho)"]}]
        },
        {
          "name": "Authentic Cơm Tấm",
          "description": "A working-class breakfast icon from Saigon. The foundation is 'broken rice'.",
          "details": {
            "cuisine": "Vietnamese",
            "prepTimeMinutes": 120,
            "cookTimeMinutes": 45,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1.5,
              "unit": "cups",
              "name": "broken rice",
              "notes": "Rinsed and soaked."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "pork chops",
              "notes": "Bone-in."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "Scallion Oil",
              "notes": "Mỡ Hành."
            }
          ],
          "instructions": [
            "Step 1: Marinate pork chops with lemongrass and fish sauce.",
            "Step 2: Steam broken rice.",
            "Step 3: Make scallion oil.",
            "Step 4: Grill pork chops.",
            "Step 5: Serve with fried egg, Nước Chấm, and pickled vegetables."
          ],
          "classifications": {
            "mealType": [
              "breakfast"
            ],
            "cookingMethods": [
              "grilling",
              "steaming"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.15,
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
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 680,
            "proteinG": 38,
            "carbsG": 75,
            "fatG": 26,
            "fiberG": 4,
              "sodiumMg": 479,
              "sugarG": 13,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          alchemicalProperties: {"Spirit":0,"Essence":0,"Matter":0,"Substance":0},
          thermodynamicProperties: {"heat":0.2899,"entropy":0.438,"reactivity":0.9687,"gregsEnergy":-0.1344,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "broken rice",
              "substituteOptions": [
                "jasmine rice"
              ]
            }
          ]
        },
        {
          name: "Thịt Kho Tàu",
          description: "An alchemically precise execution of Thịt Kho Tàu, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Thịt Kho Tàu","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0756,"entropy":0.0918,"reactivity":3.32,"gregsEnergy":-0.2293,"kalchm":4.0,"monica":0.0498},
                    substitutions: [{"originalIngredient":"Foundation of Thịt Kho Tàu","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Lẩu Thái",
          description: "An alchemically precise execution of Lẩu Thái, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Lẩu Thái","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0756,"entropy":0.0918,"reactivity":3.32,"gregsEnergy":-0.2293,"kalchm":4.0,"monica":0.0498},
                    substitutions: [{"originalIngredient":"Foundation of Lẩu Thái","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Bò Lúc Lắc",
          description: "Violently agitated beef. 'Shaking Beef' is defined by the absolute maximum heat of the wok, searing marinated beef cubes so fast that a caramelized crust forms while the interior remains completely rare, tossed with raw onions and acidic tomatoes.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":20,"cookTimeMinutes":5,"baseServingSize":2,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Beef tenderloin or sirloin","notes":"Cut into precise 1-inch cubes."},{"amount":1,"unit":"tbsp","name":"Oyster sauce","notes":"For the marinade."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"For the marinade."},{"amount":1,"unit":"tsp","name":"Sugar","notes":"To aid caramelization."},{"amount":5,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":0.5,"unit":"whole","name":"Red onion","notes":"Cut into thick petals."},{"amount":1,"unit":"whole","name":"Tomato","notes":"Cut into wedges."},{"amount":1,"unit":"bunch","name":"Watercress or lettuce","notes":"For plating."}],
          instructions: ["Step 1: The Matrix. Toss the beef cubes with oyster sauce, soy sauce, sugar, garlic, and a splash of oil. Marinate for 30 minutes. Do not salt, or the beef will bleed moisture.","Step 2: The Fire. Heat a heavy wok or cast-iron pan over the absolute highest heat possible. It must be smoking heavily.","Step 3: The Shake. Add a splash of oil. Dump the beef cubes in a single layer. Do not touch them for 60 seconds to allow a fierce, dark crust to form.","Step 4: The Agitation. Once crusted, violently shake the wok (lúc lắc), tossing the beef cubes rapidly. Add the onion petals and toss for just 30 more seconds.","Step 5: The Acid. Turn off the heat. Immediately toss in the tomato wedges; the residual heat will barely soften them. Serve the aggressively seared beef directly over a bed of cool, peppery watercress, accompanied by a lime-salt-pepper dipping sauce."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["wok-searing","tossing"]},
          elementalProperties: {"Fire":0.6,"Water":0.1,"Earth":0.2,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Sun"],"signs":["aries","leo"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":450,"proteinG":45,"carbsG":12,"fatG":22,"fiberG":2,"sodiumMg":850,"sugarG":8,"vitamins":["Vitamin B12","Vitamin K"],"minerals":["Zinc","Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.2361,"entropy":0.259,"reactivity":1.6528,"gregsEnergy":-0.1919,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Beef tenderloin","substituteOptions":["Firm tofu (cut large and deep-fried first)"]}]
        },
            {
              "name": "Authentic Phở Bò",
              "description": "The alchemical core of Vietnam. A crystal-clear beef broth extracted through 12 hours of simmering charred aromatics and marrow bones, designed to extract the 'essence of beef', served over elastic rice noodles.",
              "details": {
                "cuisine": "Vietnamese",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 720,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 3,
                  "unit": "lbs",
                  "name": "Beef leg bones",
                  "notes": "Marrow bones."
                },
                {
                  "amount": 1,
                  "unit": "whole",
                  "name": "Ginger/Onion",
                  "notes": "Charred until black."
                }
              ],
              "instructions": [
                "Step 1: Parboil and wash bones to ensure broth clarity.",
                "Step 2: Simmer bones with charred aromatics and star anise.",
                "Step 3: Remove scum continuously; do not boil aggressively.",
                "Step 4: Flash-boil rice noodles until elastic.",
                "Step 5: Assemble: noodles, rare beef, boiling broth, herbs."
              ],
              "classifications": {
                "mealType": [
                  "breakfast",
                  "dinner"
                ],
                "cookingMethods": [
                  "simmering"
                ]
              },
              "elementalProperties": {
                "Fire": 0.1,
                "Water": 0.65,
                "Earth": 0.15,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Moon",
                  "Jupiter"
                ],
                "signs": [
                  "cancer",
                  "sagittarius"
                ],
                "lunarPhases": [
                  "Waning Crescent"
                ]
              },
              "nutritionPerServing": {
                "calories": 450,
                "proteinG": 35,
                "carbsG": 65,
                "fatG": 8,
                "fiberG": 2,
                "sodiumMg": 1500,
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
              alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
              thermodynamicProperties: {"heat":0.0664,"entropy":0.0706,"reactivity":4.1153,"gregsEnergy":-0.2243,"kalchm":4.0,"monica":0.0393},
                            "substitutions": []
            },
            {
              "name": "Authentic Bánh Mì",
              "description": "A structural fusion of cultures. A high-kinetic baguette with a rice-flour fortified crust shatters into airy crumbs, encapsulating fatty liver pâté, charred pork, and highly acidic pickled vegetables.",
              "details": {
                "cuisine": "Vietnamese",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 10,
                "baseServingSize": 1,
                "spiceLevel": "Medium",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "whole",
                  "name": "Vietnamese Baguette",
                  "notes": "Rice flour/wheat blend."
                },
                {
                  "amount": 2,
                  "unit": "tbsp",
                  "name": "Liver Pâté",
                  "notes": "For fatty moisture."
                }
              ],
              "instructions": [
                "Step 1: Split baguette; spread with mayo and pâté.",
                "Step 2: Layer grilled pork, cucumber slices, and cilantro.",
                "Step 3: Add a massive amount of pickled daikon/carrot (đồ chua).",
                "Step 4: Season with Maggi liquid seasoning and bird's eye chilies.",
                "Step 5: Serve immediately while the crust is still rigid."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "snack"
                ],
                "cookingMethods": [
                  "assembling",
                  "grilling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.3,
                "Water": 0.1,
                "Earth": 0.35,
                "Air": 0.25
              },
              "astrologicalAffinities": {
                "planets": [
                  "Mercury",
                  "Mars"
                ],
                "signs": [
                  "gemini",
                  "aries"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 520,
                "proteinG": 24,
                "carbsG": 65,
                "fatG": 22,
                "fiberG": 4,
                "sodiumMg": 1100,
                "sugarG": 8,
                "vitamins": [
                  "Vitamin C",
                  "Niacin"
                ],
                "minerals": [
                  "Iron"
                ]
              },
              alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
              thermodynamicProperties: {"heat":0.0796,"entropy":0.3586,"reactivity":1.7353,"gregsEnergy":-0.5426,"kalchm":1.0,"monica":1.0},
                            "substitutions": []
            },
            {
              "name": "Authentic Bún Thịt Nướng",
              "description": "The contrast bowl of the South. Cold rice vermicelli acts as a neutral base for hot, lemongrass-marinated grilled pork, crunchy spring rolls, and a massive volume of fresh herbs, unified by a sweet-savory fish sauce dressing.",
              "details": {
                "cuisine": "Vietnamese (South)",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 15,
                "baseServingSize": 2,
                "spiceLevel": "Medium",
                "season": [
                  "summer"
                ]
              },
              "ingredients": [
                {
                  "amount": 8,
                  "unit": "oz",
                  "name": "Rice vermicelli",
                  "notes": "Cold."
                },
                {
                  "amount": 0.5,
                  "unit": "lb",
                  "name": "Lemongrass pork",
                  "notes": "Grilled."
                }
              ],
              "instructions": [
                "Step 1: Marinate pork in lemongrass, fish sauce, and sugar.",
                "Step 2: Grill pork over high heat until caramelized.",
                "Step 3: Place cold noodles in a bowl; top with shredded lettuce.",
                "Step 4: Add grilled pork, herbs, peanuts, and spring roll.",
                "Step 5: Pour warm Nước Chấm over the entire bowl."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "dinner"
                ],
                "cookingMethods": [
                  "grilling",
                  "assembling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.35,
                "Water": 0.3,
                "Earth": 0.2,
                "Air": 0.15
              },
              "astrologicalAffinities": {
                "planets": [
                  "Mercury",
                  "Venus"
                ],
                "signs": [
                  "gemini",
                  "libra"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 580,
                "proteinG": 28,
                "carbsG": 75,
                "fatG": 24,
                "fiberG": 6,
                "sodiumMg": 1200,
                "sugarG": 12,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin A"
                ],
                "minerals": [
                  "Potassium",
                  "Zinc"
                ]
              },
              alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
              thermodynamicProperties: {"heat":0.0843,"entropy":0.3432,"reactivity":2.2465,"gregsEnergy":-0.6868,"kalchm":1.0,"monica":1.0},
                            "substitutions": []
            },
            {
              "name": "Authentic Chả Cá Lã Vọng",
              "description": "The legendary turmeric fish of Hanoi. Firm white fish is marinated in galangal and turmeric, then fried at the table in a massive amount of fresh dill and scallions, creating an intensely aromatic and electric green oil.",
              "details": {
                "cuisine": "Vietnamese (Hanoi)",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 15,
                "baseServingSize": 2,
                "spiceLevel": "Medium",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Snakehead fish or Catfish",
                  "notes": "Firm white fish."
                },
                {
                  "amount": 2,
                  "unit": "bunches",
                  "name": "Fresh Dill",
                  "notes": "Essential aromatic."
                }
              ],
              "instructions": [
                "Step 1: Marinate fish in turmeric, galangal, and shrimp paste.",
                "Step 2: Grill fish pieces until 80% cooked.",
                "Step 3: Place fish in a frying pan at the table with oil.",
                "Step 4: Dump massive amounts of dill and scallions into the pan.",
                "Step 5: Serve with vermicelli, peanuts, and Mắm Tôm (shrimp paste)."
              ],
              "classifications": {
                "mealType": [
                  "dinner",
                  "celebration"
                ],
                "cookingMethods": [
                  "frying",
                  "grilling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.45,
                "Water": 0.25,
                "Earth": 0.1,
                "Air": 0.2
              },
              "astrologicalAffinities": {
                "planets": [
                  "Jupiter",
                  "Uranus"
                ],
                "signs": [
                  "sagittarius",
                  "aquarius"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 35,
                "carbsG": 12,
                "fatG": 28,
                "fiberG": 2,
                "sodiumMg": 1400,
                "sugarG": 2,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin B12"
                ],
                "minerals": [
                  "Selenium",
                  "Iron"
                ]
              },
              alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
              thermodynamicProperties: {"heat":0.0954,"entropy":0.1107,"reactivity":4.3843,"gregsEnergy":-0.39,"kalchm":4.0,"monica":0.0642},
                            "substitutions": []
            },
            {
              "name": "Authentic Chè Trôi Nước",
              "description": "The 'Floating in Water' dessert. Glutinous rice balls with a savory mung bean core are suspended in a warm ginger-syrup matrix, embodying the alchemical balance of chewy structure and liquid heat.",
              "details": {
                "cuisine": "Vietnamese",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 30,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "celebration"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Glutinous rice flour",
                  "notes": "For the shell."
                },
                {
                  "amount": 0.5,
                  "unit": "cup",
                  "name": "Mung bean paste",
                  "notes": "For the filling."
                }
              ],
              "instructions": [
                "Step 1: Steam and mash mung beans into balls.",
                "Step 2: Wrap mung bean core in glutinous rice dough.",
                "Step 3: Boil balls until they float to the surface.",
                "Step 4: Prepare a heavy syrup of ginger and palm sugar.",
                "Step 5: Transfer balls to the syrup; top with coconut cream."
              ],
              "classifications": {
                "mealType": [
                  "dessert"
                ],
                "cookingMethods": [
                  "boiling",
                  "simmering"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.55,
                "Earth": 0.25,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Moon",
                  "Neptune"
                ],
                "signs": [
                  "cancer",
                  "pisces"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 350,
                "proteinG": 8,
                "carbsG": 65,
                "fatG": 8,
                "fiberG": 4,
                "sodiumMg": 150,
                "sugarG": 28,
                "vitamins": [
                  "Vitamin B6"
                ],
                "minerals": [
                  "Magnesium",
                  "Potassium"
                ]
              },
              alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
              thermodynamicProperties: {"heat":0.001,"entropy":0.071,"reactivity":3.4096,"gregsEnergy":-0.2411,"kalchm":4.0,"monica":0.051},
                            "substitutions": []
            }
        ,
        {
          name: "Banh Mi Thit Nuong",
          description: "The Vietnamese banh mi is one of the most perfect sandwiches in the world - a product of French colonial culinary fusion where a crispy, airy Vietnamese baguette made with rice flour for lightness meets a profoundly savory filling of grilled lemongrass pork. The pork is marinated in a complex mixture of fish sauce, lemongrass, shallots, garlic, sugar, and five-spice, then grilled over charcoal until caramelized at the edges, the fat rendering into sweet, smoky beads.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Pork shoulder or tenderloin","notes":"Sliced thin against the grain."},{"amount":2,"unit":"stalks","name":"Lemongrass","notes":"White part only, minced very fine."},{"amount":3,"unit":"tbsp","name":"Fish sauce","notes":"High quality, such as Phu Quoc brand."},{"amount":2,"unit":"tbsp","name":"Sugar","notes":"For caramelization."},{"amount":4,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":2,"unit":"whole","name":"Shallots","notes":"Minced."},{"amount":4,"unit":"whole","name":"Vietnamese baguettes (banh mi)","notes":"Or short French baguettes."},{"amount":1,"unit":"cup","name":"Do chua (pickled daikon and carrot)","notes":"Vietnamese quick pickle."},{"amount":0.5,"unit":"bunch","name":"Fresh cilantro","notes":"Whole sprigs."},{"amount":2,"unit":"whole","name":"Jalapeno or Fresno chilies","notes":"Sliced thin."}],
          instructions: ["Step 1: Combine minced lemongrass, fish sauce, sugar, garlic, shallots, oyster sauce, and a pinch of five-spice in a bowl. Marinate the sliced pork in this mixture for at least 30 minutes or up to 4 hours in the refrigerator.","Step 2: Make the do chua if not already prepared: julienne daikon and carrot, toss with salt, let stand 10 minutes, rinse, then cover with rice vinegar, sugar, and warm water. Let pickle for at least 20 minutes.","Step 3: Grill the marinated pork over the highest possible heat - a charcoal grill is ideal - for 2 to 3 minutes per side. The edges should blacken and caramelize from the sugar in the marinade. The interior should remain juicy.","Step 4: While the pork rests, split the baguettes lengthwise without fully separating them. Toast the cut faces on the grill for 1 minute until lightly crispy.","Step 5: Spread Vietnamese mayonnaise (or regular) generously on both cut faces. Add a smear of pate if using.","Step 6: Layer the grilled pork slices, generous amounts of do chua, whole cilantro sprigs, sliced chilies, and cucumber slices. Press down firmly and serve immediately while the bread is still warm and crispy."],
          classifications: {"mealType":["lunch","breakfast","snack"],"cookingMethods":["grilling","pickling"]},
          elementalProperties: {"Fire":0.3,"Water":0.2,"Earth":0.3,"Air":0.2},
          astrologicalAffinities: {"planets":["Mars","Mercury","Sun"],"signs":["aries","gemini","leo"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":480,"proteinG":32,"carbsG":48,"fatG":18,"fiberG":3,"sodiumMg":1100,"sugarG":10,"vitamins":["Vitamin C","Thiamin","Niacin"],"minerals":["Iron","Potassium","Phosphorus"]},
          alchemicalProperties: {"Spirit":2,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.2988,"entropy":0.8208,"reactivity":3.6509,"gregsEnergy":-2.6979,"kalchm":4.0,"monica":0.5331},
                    substitutions: [{"originalIngredient":"Pork shoulder","substituteOptions":["Chicken thigh","Tofu (for vegetarian banh mi)"]},{"originalIngredient":"Fish sauce","substituteOptions":["Soy sauce plus a drop of lime"]}]
        },
        {
          name: "Com Tam",
          description: "Com Tam - broken rice - is the soul food of Saigon (Ho Chi Minh City). The broken rice grains, which are irregular fragments produced during the milling process and once considered inferior, have a unique starchy texture that adheres better to grilled meats and absorbs nuoc cham more readily than whole-grain rice. The dish is served with suon nuong (grilled pork chop marinated in fish sauce, lemongrass, and sugar), bi (pork skin shreds), and cha trung (steamed egg cake).",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Broken jasmine rice (gao tam)","notes":"Or substitute jasmine rice broken in a food processor."},{"amount":4,"unit":"whole","name":"Pork loin chops","notes":"Thin cut, about 0.5 inch thick."},{"amount":3,"unit":"tbsp","name":"Fish sauce","notes":"For the marinade."},{"amount":2,"unit":"tbsp","name":"Sugar","notes":"For caramelization in the marinade."},{"amount":2,"unit":"stalks","name":"Lemongrass","notes":"White part only, minced."},{"amount":3,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":2,"unit":"large","name":"Eggs","notes":"For the cha trung steamed egg cake."},{"amount":3,"unit":"tbsp","name":"Nuoc cham dipping sauce","notes":"Fish sauce, lime, sugar, chili, garlic, water."}],
          instructions: ["Step 1: Marinate the pork chops for at least 2 hours: combine fish sauce, sugar, minced lemongrass, garlic, shallots, and a splash of oil. The pork should be coated generously.","Step 2: Cook the broken rice in a rice cooker or pot with slightly less water than normal rice (the starchier broken grains absorb differently). The cooked broken rice should be slightly firmer and chewier than regular rice.","Step 3: For the cha trung, beat eggs with fish sauce, a pinch of sugar, and a small amount of vermicelli noodles and minced pork or mushrooms. Steam in a small greased container for 15 minutes until set. Cut into wedges.","Step 4: Grill the marinated pork chops over very high heat on a charcoal grill or cast iron grill pan. Cook 3 to 4 minutes per side until deeply caramelized with char marks and the meat is just cooked through.","Step 5: While the pork rests, make the nuoc cham by combining fish sauce, fresh lime juice, sugar, minced garlic, and sliced chilies. Balance sweet, sour, salty, and spicy.","Step 6: Plate the broken rice mounded on one side of the plate. Add the grilled pork chop, a wedge of cha trung, and any garnishes. Serve with a small bowl of nuoc cham for dipping."],
          classifications: {"mealType":["lunch","dinner","breakfast"],"cookingMethods":["grilling","steaming"]},
          elementalProperties: {"Fire":0.3,"Water":0.25,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Mars","Saturn"],"signs":["leo","aries","capricorn"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":520,"proteinG":36,"carbsG":55,"fatG":16,"fiberG":2,"sodiumMg":980,"sugarG":8,"vitamins":["Thiamin","Niacin","Vitamin B6"],"minerals":["Iron","Zinc","Phosphorus"]},
          alchemicalProperties: {"Spirit":2,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.2988,"entropy":0.3164,"reactivity":0.9348,"gregsEnergy":0.003,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Pork chops","substituteOptions":["Chicken thigh","Grilled tofu steak"]},{"originalIngredient":"Broken rice","substituteOptions":["Jasmine rice","Steamed rice"]}]
        },
        {
          name: "Bun Bo Hue",
          description: "The fiercest and most complex of all Vietnamese noodle soups, Bun Bo Hue originates from the ancient imperial capital of Hue in central Vietnam. Unlike the delicate pho of Hanoi, Bun Bo Hue is unapologetically bold - its broth is built on lemongrass, shrimp paste, and fiery annatto oil, creating a deep reddish-orange color with a sharp, complex heat from the Sa Te chili paste. Thick round rice noodles replace the flat rice noodles of pho, and the soup contains multiple cuts of beef and pork.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":45,"cookTimeMinutes":180,"baseServingSize":6,"spiceLevel":"High","season":["all"]},
          ingredients: [{"amount":1.5,"unit":"lbs","name":"Beef shank","notes":"Bone-in."},{"amount":1,"unit":"lb","name":"Pork hocks","notes":"For richness and collagen."},{"amount":3,"unit":"stalks","name":"Lemongrass","notes":"Bruised with the back of a knife."},{"amount":2,"unit":"tbsp","name":"Shrimp paste (mam ruoc Hue)","notes":"Fermented shrimp paste, the defining flavor."},{"amount":2,"unit":"tbsp","name":"Annatto seeds or annatto oil","notes":"For the characteristic red color."},{"amount":3,"unit":"tbsp","name":"Sa te chili paste","notes":"Or make from dried chilies, lemongrass, and shallots."},{"amount":1,"unit":"lb","name":"Thick round rice noodles (bun bo Hue noodles)","notes":"Soaked and drained."},{"amount":8,"unit":"cups","name":"Water","notes":"For the broth."}],
          instructions: ["Step 1: Blanch the beef shank and pork hocks in boiling water for 5 minutes. Drain, rinse under cold water, and clean the bones thoroughly. This removes impurities for a cleaner broth.","Step 2: Return the blanched meat to a clean stockpot with 8 cups of fresh water, bruised lemongrass stalks, halved onion (charred), and fish sauce. Bring to a boil, skim carefully, then simmer on low heat for 2 hours.","Step 3: Make the annatto oil: heat vegetable oil with annatto seeds over medium heat until the oil turns deep red, about 5 minutes. Strain and reserve the red oil.","Step 4: In a small pan, fry the minced shallots and garlic in the annatto oil until golden. Add the sa te chili paste and fry for 2 minutes. Add the shrimp paste and fry briefly until aromatic.","Step 5: Add the fried spice mixture to the simmering broth. Season with fish sauce and salt to taste. The broth should be deeply flavorful, significantly salty, with a sharp lemongrass fragrance and visible red oil on the surface.","Step 6: Remove the beef shank, slice against the grain. Prepare noodles according to package directions. Assemble bowls: noodles first, then sliced beef shank, a piece of pork hock, ladle over extremely hot broth. Serve with bean sprouts, banana blossom, sawgrass herb, lime, and fresh chilies."],
          classifications: {"mealType":["lunch","dinner","breakfast"],"cookingMethods":["simmering","slow-cooking","frying"]},
          elementalProperties: {"Fire":0.4,"Water":0.35,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Pluto","Saturn"],"signs":["aries","scorpio","capricorn"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":550,"proteinG":42,"carbsG":48,"fatG":20,"fiberG":3,"sodiumMg":1400,"sugarG":5,"vitamins":["Vitamin B12","Niacin","Vitamin C"],"minerals":["Iron","Zinc","Potassium"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":3,"Substance":0},
          thermodynamicProperties: {"heat":0.037,"entropy":0.0387,"reactivity":0.5334,"gregsEnergy":0.0164,"kalchm":0.1481,"monica":0.0161},
                    substitutions: [{"originalIngredient":"Shrimp paste","substituteOptions":["Fish sauce (milder flavor)","Anchovy paste"]},{"originalIngredient":"Beef shank","substituteOptions":["Beef brisket","Pork shoulder"]}]
        },
        {
          name: "Cao Lau",
          description: "Cao Lau is one of the most geographically specific dishes in the world - it is said to be impossible to replicate authentically outside of Hoi An because the noodles require water drawn specifically from the ancient Cham wells of Ba Le in the old town. The thick, chewy, slightly yellow noodles have a unique texture from lye water and rice ash, topped with sliced char siu-style pork, crispy croutons made from the same noodle dough, and a small amount of broth that barely pools beneath the ingredients.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":40,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Cao Lau noodles","notes":"Or substitute thick udon noodles as the closest approximation."},{"amount":0.5,"unit":"lb","name":"Pork shoulder","notes":"For roasting char siu style."},{"amount":3,"unit":"tbsp","name":"Five-spice powder","notes":"For the pork marinade."},{"amount":2,"unit":"tbsp","name":"Hoisin sauce","notes":"For the pork glaze."},{"amount":2,"unit":"tbsp","name":"Honey","notes":"For caramelization."},{"amount":2,"unit":"tbsp","name":"Soy sauce","notes":"For the pork marinade."},{"amount":2,"unit":"cups","name":"Bean sprouts","notes":"Fresh."},{"amount":0.5,"unit":"bunch","name":"Fresh herbs","notes":"Mint, rau ram (Vietnamese coriander), Thai basil."}],
          instructions: ["Step 1: Marinate pork shoulder overnight in a mixture of five-spice powder, hoisin sauce, honey, soy sauce, garlic, and a splash of rice wine. The pork should be thoroughly coated.","Step 2: Roast the marinated pork at 400F for 25 minutes, basting every 10 minutes with the reserved marinade mixed with additional honey. The exterior should be caramelized, slightly charred at the edges, and deeply red.","Step 3: Slice the pork thin against the grain. Reserve some marinade glaze.","Step 4: For the crispy croutons (banh da), take a handful of noodles and fry them in 1 cm of hot oil until puffed and crispy. Drain on paper towels.","Step 5: Cook the cao lau noodles according to package directions - they should be briefly boiled and then briefly dry-fried in a wok with a touch of oil. Season with a small amount of the pork braising liquid.","Step 6: Arrange noodles in shallow bowls. Top with sliced pork, fresh bean sprouts, fresh herbs, and a scattering of crispy noodle croutons. Add only a small amount of the rich pork braising liquid - Cao Lau is deliberately drier than most Vietnamese noodle dishes."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["roasting","frying","braising"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Venus","Mercury"],"signs":["capricorn","taurus","gemini"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":490,"proteinG":28,"carbsG":58,"fatG":16,"fiberG":3,"sodiumMg":860,"sugarG":12,"vitamins":["Niacin","Vitamin B6","Thiamin"],"minerals":["Iron","Phosphorus","Zinc"]},
          alchemicalProperties: {"Spirit":2,"Essence":1,"Matter":2,"Substance":1},
          thermodynamicProperties: {"heat":0.1801,"entropy":0.3807,"reactivity":1.0651,"gregsEnergy":-0.2255,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Cao Lau noodles","substituteOptions":["Thick udon noodles","Wide rice noodles"]},{"originalIngredient":"Pork shoulder","substituteOptions":["Chicken (Ga Nuong)","Firm tofu"]}]
        },
        {
          name: "Mi Quang",
          description: "Mi Quang is the defining noodle dish of Quang Nam province in central Vietnam. Fat, turmeric-yellow rice noodles are arranged in a shallow bowl over a small amount of richly flavored, turmeric-bright broth that barely covers the noodles - this is a wet noodle dish, not a soup. The broth is built on pork bones, shrimp, and an aromatic base of turmeric, shallots, and chilies. It is topped with a lavish garnish station of roasted peanuts, sesame rice crackers, fresh herbs, and bean sprouts.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":60,"baseServingSize":4,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Wide rice noodles","notes":"Fresh or dried, ideally turmeric-yellow Mi Quang noodles."},{"amount":0.5,"unit":"lb","name":"Pork shoulder","notes":"Thinly sliced."},{"amount":0.25,"unit":"lb","name":"Large shrimp","notes":"Peeled and deveined."},{"amount":2,"unit":"tsp","name":"Ground turmeric","notes":"The defining color and flavor."},{"amount":4,"unit":"whole","name":"Shallots","notes":"Minced."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For seasoning."},{"amount":0.25,"unit":"cup","name":"Roasted peanuts","notes":"Coarsely crushed, for topping."},{"amount":4,"unit":"whole","name":"Sesame rice crackers (banh trang)","notes":"For serving."},{"amount":0.5,"unit":"bunch","name":"Fresh herbs","notes":"Mint, rau ram, Vietnamese coriander, banana blossom."}],
          instructions: ["Step 1: Make a rich broth: simmer pork bones with 4 cups water, fish sauce, and a little sugar for 45 minutes. Strain and reserve the clear broth.","Step 2: Heat annatto oil or neutral oil in a wok over high heat. Add minced shallots and fry until golden and fragrant. Add the turmeric and stir-fry for 30 seconds.","Step 3: Add the sliced pork and shrimp. Stir-fry over very high heat until just cooked, about 3 minutes. Season with fish sauce, sugar, and a pinch of black pepper.","Step 4: Add 2 cups of the pork broth to the wok with the meat and shrimp. Bring to a boil, reduce to simmer, and let the flavors meld for 5 minutes. The broth should be deeply golden from the turmeric.","Step 5: Prepare the noodles according to package directions. Arrange a generous portion in each bowl. Ladle only a small amount of the turmeric broth over the noodles - just enough to moisten, not submerge.","Step 6: Top with the braised pork and shrimp, crushed roasted peanuts, fresh herbs, bean sprouts, and a sesame rice cracker. Squeeze fresh lime over everything. The cracker softens as you eat."],
          classifications: {"mealType":["lunch","dinner","breakfast"],"cookingMethods":["stir-frying","simmering","braising"]},
          elementalProperties: {"Fire":0.3,"Water":0.3,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Sun","Mars","Mercury"],"signs":["leo","aries","virgo"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":460,"proteinG":30,"carbsG":52,"fatG":14,"fiberG":4,"sodiumMg":920,"sugarG":6,"vitamins":["Vitamin C","Niacin","Vitamin B6"],"minerals":["Iron","Potassium","Magnesium"]},
          alchemicalProperties: {"Spirit":2,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.2988,"entropy":0.7544,"reactivity":3.6627,"gregsEnergy":-2.4645,"kalchm":4.0,"monica":0.4854},
                    substitutions: [{"originalIngredient":"Pork shoulder","substituteOptions":["Chicken breast","Crab meat"]},{"originalIngredient":"Shrimp","substituteOptions":["Squid","Tofu"]}]
        },
        {
          name: "Banh Cuon",
          description: "Banh Cuon are paper-thin steamed rice rolls - one of the most technically demanding dishes in Vietnamese cuisine. A loose batter of fine rice flour and tapioca starch is spread in an ultra-thin layer over a cloth stretched over a pot of boiling water, steamed for literally 30 seconds until just set, then peeled off in a translucent sheet and immediately rolled around a filling of seasoned ground pork and wood ear mushrooms. The final rolls have the delicate, silky texture of fine silk.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":30,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Rice flour","notes":"Fine, not glutinous rice flour."},{"amount":0.25,"unit":"cup","name":"Tapioca starch","notes":"For translucency and elasticity."},{"amount":2.5,"unit":"cups","name":"Water","notes":"Cold, for the batter."},{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"For the filling."},{"amount":1,"unit":"cup","name":"Wood ear mushrooms","notes":"Dried, soaked and finely chopped."},{"amount":4,"unit":"whole","name":"Shallots","notes":"Minced, for the pork filling."},{"amount":2,"unit":"tbsp","name":"Fish sauce","notes":"For seasoning the filling."},{"amount":0.5,"unit":"cup","name":"Fried shallots","notes":"For garnish."},{"amount":0.5,"unit":"lb","name":"Cha lua (Vietnamese pork loaf)","notes":"Sliced, for serving."}],
          instructions: ["Step 1: Whisk the rice flour, tapioca starch, water, and a pinch of salt until completely smooth. Strain through a fine sieve. Let rest for 30 minutes. The batter should be the consistency of very thin cream.","Step 2: For the filling, saute minced shallots in oil until golden. Add the ground pork, breaking it up, and cook until no pink remains. Add finely chopped wood ear mushrooms, fish sauce, sugar, and white pepper. Cook until aromatic and well-seasoned. Cool completely.","Step 3: Set up the steamer: stretch a piece of muslin or a fine cloth tightly over a pot of vigorously boiling water. Brush lightly with oil.","Step 4: Ladle a thin layer of batter onto the cloth and spread quickly with a flat spatula to form a nearly transparent round sheet about 8 inches across. Cover with a lid for 30 seconds only.","Step 5: Uncover and use a flat scraper or the back of a wet spatula to peel the delicate sheet off the cloth in one motion. Place flat on an oiled cutting board. Add a thin line of pork and mushroom filling across the center and immediately roll into a cylinder.","Step 6: Arrange on a plate, garnish with fried shallots and sliced cha lua. Serve immediately with nuoc cham, sliced cucumber, and fresh herbs."],
          classifications: {"mealType":["breakfast","lunch","snack"],"cookingMethods":["steaming","sauteing"]},
          elementalProperties: {"Fire":0.15,"Water":0.4,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus","Mercury"],"signs":["cancer","taurus","virgo"],"lunarPhases":["Waning Crescent"]},
          nutritionPerServing: {"calories":350,"proteinG":20,"carbsG":44,"fatG":10,"fiberG":2,"sodiumMg":720,"sugarG":3,"vitamins":["Thiamin","Niacin","Vitamin B6"],"minerals":["Iron","Phosphorus","Potassium"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":2,"Substance":1},
          thermodynamicProperties: {"heat":0.0299,"entropy":0.0901,"reactivity":1.1213,"gregsEnergy":-0.0711,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Ground pork","substituteOptions":["Ground shrimp","Ground chicken","Tofu and mushroom mix"]},{"originalIngredient":"Wood ear mushrooms","substituteOptions":["Shiitake mushrooms","King oyster mushrooms"]}]
        },
        {
          name: "Che Ba Mau",
          description: "Che Ba Mau - Three Color Dessert Drink - is the most festive and visually dramatic of all Vietnamese sweet soups. Three distinct layers are carefully constructed in a tall glass: a bottom layer of green pandan-flavored mung bean paste, a middle layer of translucent red bean jelly, and a top layer of split mung beans, all crowned with a generous pour of sweet coconut cream. When presented with shaved ice, the colors remain distinct, mingling only when the diner stirs them together into a complex, subtly sweet, tropical dessert.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":60,"cookTimeMinutes":40,"baseServingSize":6,"spiceLevel":"None","season":["summer","spring"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Split mung beans","notes":"Soaked overnight, cooked until tender."},{"amount":1,"unit":"cup","name":"Red adzuki beans","notes":"Cooked with sugar until soft."},{"amount":2,"unit":"cups","name":"Pandan jelly","notes":"Agar-agar mixed with pandan leaf extract and sugar."},{"amount":1,"unit":"can","name":"Coconut cream","notes":"Full fat, 13.5 oz can."},{"amount":0.5,"unit":"cup","name":"Granulated sugar","notes":"For sweetening each component."},{"amount":3,"unit":"leaves","name":"Fresh pandan leaves","notes":"For the green jelly and coconut cream infusion."},{"amount":4,"unit":"cups","name":"Shaved ice","notes":"Finely shaved for the best texture."}],
          instructions: ["Step 1: Prepare each component separately. For the mung bean layer: simmer soaked split mung beans with water and sugar until completely soft and mashable. Cool and refrigerate.","Step 2: For the pandan jelly: blend fresh pandan leaves with water and strain through muslin to extract vivid green pandan juice. Mix agar-agar powder with water and pandan juice, bring to a boil until dissolved, add sugar, pour into a tray, and allow to set at room temperature. Cut into small cubes or strips.","Step 3: For the red bean layer: simmer adzuki beans with sugar until very tender and sweet. The syrup should be thick. Cool.","Step 4: Make the coconut cream topping: heat coconut cream with pandan leaves, a pinch of salt, and a little sugar until fragrant and steaming. Strain to remove pandan. Keep warm.","Step 5: When ready to assemble, fill tall glasses or bowls with shaved ice. Layer from bottom to top: cooked sweet mung beans, then red bean in syrup, then pandan jelly cubes.","Step 6: Pour warm coconut cream over the top just before serving. The contrast of cold ice and warm coconut cream is intentional. The colors will remain distinct until stirred - present to the diner unmixed so they can appreciate the visual layering before combining."],
          classifications: {"mealType":["dessert","snack","drink"],"cookingMethods":["simmering","gelling"]},
          elementalProperties: {"Fire":0.1,"Water":0.45,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus","Neptune"],"signs":["cancer","taurus","pisces"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":280,"proteinG":8,"carbsG":52,"fatG":8,"fiberG":6,"sodiumMg":90,"sugarG":32,"vitamins":["Folate","Thiamin","Vitamin B6"],"minerals":["Potassium","Iron","Magnesium"]},
          alchemicalProperties: {"Spirit":0,"Essence":3,"Matter":2,"Substance":1},
          thermodynamicProperties: {"heat":0.0002,"entropy":0.0303,"reactivity":1.8511,"gregsEnergy":-0.0559,"kalchm":6.75,"monica":0.0158},
                    substitutions: [{"originalIngredient":"Pandan leaves","substituteOptions":["Pandan extract","Matcha powder for green color"]},{"originalIngredient":"Adzuki beans","substituteOptions":["Red kidney beans","Black-eyed peas"]}]
        },
        ],
    },
    dessert: {
      all: [
        {
          name: "Chè Ba Màu",
          description: "An alchemically precise execution of Chè Ba Màu, balancing extreme thermal application with structural integrity.",
          details: {"cuisine":"Various","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":2,"spiceLevel":"Medium","season":["all"]},
          ingredients: [{"amount":1,"unit":"unit","name":"Foundation of Chè Ba Màu","notes":"Highest quality."},{"amount":1,"unit":"dash","name":"Alchemical binding agent","notes":"For cohesion."}],
          instructions: ["Step 1: The Setup. Prepare the components with absolute geometric precision.","Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.","Step 3: The Assembly. Combine elements while maintaining textural contrast.","Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["various"]},
          elementalProperties: {"Fire":0.25,"Water":0.25,"Earth":0.25,"Air":0.25},
          astrologicalAffinities: {"planets":["Jupiter","Venus"],"signs":["sagittarius","taurus"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":400,"proteinG":25,"carbsG":40,"fatG":15,"fiberG":4,"sodiumMg":800,"sugarG":5,"vitamins":["Vitamin C"],"minerals":["Iron"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0756,"entropy":0.0918,"reactivity":3.32,"gregsEnergy":-0.2293,"kalchm":4.0,"monica":0.0498},
                    substitutions: [{"originalIngredient":"Foundation of Chè Ba Màu","substituteOptions":["Alternate protein or vegetable"]}]
        },
        {
          name: "Chè Chuối",
          description: "A thick, violently rich dessert soup relying on the suspension of sweet bananas and tapioca pearls within a heavy, salted coconut cream matrix.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":10,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":4,"unit":"whole","name":"Saba bananas (Chuối sứ)","notes":"Small, starchy bananas. Cavendish will turn to mush."},{"amount":1,"unit":"can","name":"Coconut milk","notes":"Full fat."},{"amount":0.25,"unit":"cup","name":"Small tapioca pearls (Bột báng)","notes":"Soaked in water."},{"amount":0.25,"unit":"cup","name":"Sugar","notes":"To taste."},{"amount":0.5,"unit":"tsp","name":"Salt","notes":"Crucial to cut the extreme richness of the coconut."},{"amount":2,"unit":"tbsp","name":"Roasted peanuts","notes":"Crushed, for garnish."},{"amount":1,"unit":"tbsp","name":"Toasted sesame seeds","notes":"For garnish."}],
          instructions: ["Step 1: The Banana Preparation. Peel the starchy bananas and slice them diagonally into thick pieces. Toss them lightly in sugar to draw out a little moisture and firm them up.","Step 2: The Liquid Matrix. In a pot, bring the full-fat coconut milk and a splash of water to a gentle simmer. Do not boil violently or the coconut milk will break and separate into oil.","Step 3: The Suspension. Drain the soaked tapioca pearls and stir them into the simmering coconut milk. Cook for 10 minutes until the pearls turn translucent, thickening the liquid into a viscous syrup.","Step 4: The Integration. Add the sliced bananas, the remaining sugar, and the crucial half-teaspoon of salt. Simmer for 5 minutes until the bananas are tender but completely retain their structural shape.","Step 5: The Contrast. Serve warm in small bowls. The dessert must be heavily garnished with roasted crushed peanuts and sesame seeds to provide sharp, brittle contrast against the soft, rich matrix."],
          classifications: {"mealType":["dessert"],"cookingMethods":["simmering"]},
          elementalProperties: {"Fire":0.1,"Water":0.5,"Earth":0.35,"Air":0.05},
          astrologicalAffinities: {"planets":["Venus","Moon"],"signs":["taurus","cancer"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":350,"proteinG":3,"carbsG":55,"fatG":16,"fiberG":4,"sodiumMg":300,"sugarG":28,"vitamins":["Vitamin C","Vitamin B6"],"minerals":["Potassium","Manganese"]},
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0005,"reactivity":0.7718,"gregsEnergy":0.0,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Saba bananas","substituteOptions":["Plantains"]}]
        },
        {
          name: "Bánh Flan",
          description: "The Vietnamese interpretation of caramel custard. It is distinct from its Mexican cousin due to the incorporation of dark coffee over the caramel, resulting in a bitter, complex edge that balances the dense, sweet egg matrix.",
          details: {"cuisine":"Vietnamese","prepTimeMinutes":15,"cookTimeMinutes":40,"baseServingSize":6,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":0.5,"unit":"cup","name":"Sugar","notes":"For the caramel."},{"amount":3,"unit":"large","name":"Eggs","notes":"Plus 2 extra yolks for extreme richness."},{"amount":1,"unit":"cup","name":"Whole milk","notes":"Warmed."},{"amount":0.5,"unit":"cup","name":"Sweetened condensed milk","notes":"The primary sweetener."},{"amount":1,"unit":"tsp","name":"Vanilla extract","notes":"Aromatic."},{"amount":2,"unit":"tbsp","name":"Strong Vietnamese coffee","notes":"Poured over the flan before serving."},{"amount":1,"unit":"cup","name":"Crushed ice","notes":"Served underneath or around the flan."}],
          instructions: ["Step 1: The Glass. Melt the sugar in a dry saucepan until it reaches a dark, smoking amber. Immediately pour a thin layer into the bottom of individual ramekins, swirling to coat before it solidifies into glass.","Step 2: The Egg Matrix. In a bowl, gently whisk the whole eggs and extra yolks. Do not beat violently; incorporating air bubbles will ruin the silken texture.","Step 3: The Emulsion. Whisk the warm milk and condensed milk together, then slowly pour this hot mixture into the eggs, whisking continuously (tempering). Strain the entire mixture through a fine sieve to remove any unmixed chalazae.","Step 4: The Steam. Pour the strained matrix into the caramel-lined ramekins. Cover each tightly with foil. Steam gently over barely simmering water for 30-40 minutes until set but trembling. Chill completely.","Step 5: The Bitter Finish. Invert the cold flan onto a plate of crushed ice. The caramel will have liquefied into a sauce. Pour a shot of dark, bitter Vietnamese espresso directly over the flan, letting it mix with the sweet caramel."],
          classifications: {"mealType":["dessert"],"cookingMethods":["caramelizing","steaming"]},
          elementalProperties: {"Fire":0.15,"Water":0.45,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Venus","Saturn"],"signs":["taurus","capricorn"],"lunarPhases":["First Quarter"]},
          nutritionPerServing: {"calories":280,"proteinG":8,"carbsG":38,"fatG":10,"fiberG":0,"sodiumMg":95,"sugarG":35,"vitamins":["Riboflavin","Vitamin B12"],"minerals":["Calcium","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.069,"entropy":0.0734,"reactivity":0.4225,"gregsEnergy":0.038,"kalchm":0.25,"monica":0.0648},
                    substitutions: [{"originalIngredient":"Whole milk","substituteOptions":["Evaporated milk"]}]
        },
      ],
    },
  },
  traditionalSauces: {
    nuocCham: {
      name: "Nước Chấm",
      description:
        "Quintessential Vietnamese dipping sauce combining fish sauce, lime, sugar, and chili",
      base: "fish sauce",
      keyIngredients: [
        "fish sauce",
        "lime juice",
        "sugar",
        "garlic",
        "chili",
        "water",
      ],
      culinaryUses: [
        "dipping sauce",
        "dressing",
        "marinade",
        "noodle sauce",
        "flavor enhancer",
      ],
      variants: [
        "Northern style (less sweet)",
        "Southern style (sweeter)",
        "Vegetarian (soy-based)",
        "Extra spicy",
        "Garlic-forward",
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
        "Balance is critical - should harmonize sweet, sour, salty, and spicy flavors in perfect proportion",
      technicalTips:
        "Let sit for at least 15 minutes before serving to allow flavors to meld",
    },
    nuocMam: {
      name: "Nước Mắm (Fish Sauce)",
      description:
        "Fermented anchovy sauce that forms the foundation of Vietnamese cuisine",
      base: "fermented anchovies",
      keyIngredients: ["anchovies", "salt", "time"],
      culinaryUses: [
        "base for dipping sauces",
        "seasoning",
        "marinade",
        "broth enhancer",
        "dressing component",
      ],
      variants: [
        "Phú Quốc (premium)",
        "Phan Thiết",
        "Northern style",
        "Southern style",
        "Aged premium",
      ],
      elementalProperties: {
        Water: 0.5,
        Earth: 0.3,
        Fire: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Moon", "Scorpio"],
      seasonality: "all",
      preparationNotes:
        "Traditional production takes at least 12 months of fermentation in wooden barrels",
      technicalTips:
        "High-quality fish sauce should have a deep amber color and complex aroma beyond just fishiness",
    },
    tuongOt: {
      name: "Tương Ớt (Chili Sauce)",
      description:
        "Vietnamese-style fermented chili sauce with garlic and vinegar",
      base: "chili peppers",
      keyIngredients: [
        "red chili peppers",
        "garlic",
        "vinegar",
        "salt",
        "sugar",
      ],
      culinaryUses: [
        "condiment",
        "stir-fry enhancement",
        "marinade component",
        "dipping sauce",
        "soup enhancer",
      ],
      variants: [
        "Huế style (extra spicy)",
        "Saigon style",
        "Garlic-heavy",
        "Sweet version",
        "Northern style",
      ],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.2,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Traditional recipes often include fermentation to develop deeper flavor",
      technicalTips:
        "Roasting or charring chilies first adds complexity and tempers raw heat",
    },
    tuongDen: {
      name: "Tương Đen (Black Bean Sauce)",
      description:
        "Fermented soybean sauce used in Vietnamese-Chinese fusion dishes",
      base: "fermented soybeans",
      keyIngredients: ["black beans", "soy sauce", "garlic", "sugar", "oil"],
      culinaryUses: [
        "stir-fry sauce",
        "marinade",
        "dipping sauce",
        "vegetable seasoning",
        "flavor base",
      ],
      variants: [
        "Sweet style",
        "Garlicky style",
        "Spicy style",
        "Clear style",
        "Chinese-influenced",
      ],
      elementalProperties: {
        Earth: 0.4,
        Water: 0.3,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Saturn", "Jupiter", "Capricorn"],
      seasonality: "all",
      preparationNotes:
        "Often used in dishes showing Chinese culinary influence in Vietnamese cuisine",
      technicalTips:
        "Toast in oil before using to release aromatics and reduce raw bean flavor",
    },
    saTe: {
      name: "Sa Tế (Vietnamese Sateay Sauce)",
      description:
        "Aromatic lemongrass and chili paste used in soups and stir-fries",
      base: "lemongrass and chilies",
      keyIngredients: [
        "lemongrass",
        "chilies",
        "garlic",
        "shallots",
        "annatto oil",
        "fish sauce",
      ],
      culinaryUses: [
        "soup enhancement",
        "stir-fry sauce",
        "marinade",
        "grilling sauce",
        "flavor paste",
      ],
      variants: [
        "Northern style",
        "Huế style (extra spicy)",
        "Vegetarian (no fish sauce)",
        "Extra lemongrass",
        "Chinese-influenced",
      ],
      elementalProperties: {
        Fire: 0.4,
        Air: 0.3,
        Earth: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mars", "Mercury", "Leo"],
      seasonality: "all",
      preparationNotes:
        "Most authentic when chilies and aromatics are pounded by hand in a mortar and pestle",
      technicalTips:
        "The oil should separate when fried properly, creating a vibrant red layer on top",
    },
  },
  sauceRecommender: {
    forProtein: {
      beef: [
        "nước chấm",
        "sa tế",
        "lime-pepper-salt dip",
        "ginger fish sauce",
        "hoisin sauce",
      ],
      pork: [
        "nước chấm",
        "nước mắm gừng",
        "tương đen",
        "chili fish sauce",
        "tamarind sauce",
      ],
      chicken: [
        "ginger fish sauce",
        "nước chấm",
        "caramel sauce",
        "lime-pepper-salt dip",
        "fermented bean curd",
      ],
      seafood: [
        "ginger fish sauce",
        "sour fish sauce",
        "green chili sauce",
        "garlic lime sauce",
        "tamarind dip",
      ],
      tofu: [
        "nước chấm chay",
        "tương đen",
        "ginger soy sauce",
        "tamarind sauce",
        "peanut sauce",
      ],
    },
    forVegetable: {
      leafy: [
        "nước chấm",
        "lime-garlic sauce",
        "fermented bean curd",
        "peanut sauce",
        "sesame sauce",
      ],
      root: [
        "gừng nước mắm",
        "tamarind sauce",
        "soy-scallion sauce",
        "coconut sauce",
        "caramel sauce",
      ],
      herbs: [
        "simple nước chấm",
        "lime juice",
        "chili oil",
        "peanut sauce",
        "black pepper dip",
      ],
      mushroom: [
        "five-spice sauce",
        "tương đen",
        "ginger fish sauce",
        "lemongrass sauce",
        "sa tế",
      ],
      sprouts: [
        "light nước chấm",
        "lime juice dressing",
        "soy-vinegar dip",
        "sesame oil",
        "sweet-sour sauce",
      ],
    },
    forCookingMethod: {
      grilling: [
        "lime-pepper-salt dip",
        "nước chấm",
        "lemongrass sauce",
        "hoisin sauce",
        "peanut sauce",
      ],
      boiling: [
        "ginger fish sauce",
        "simple nước chấm",
        "scallion oil",
        "chili vinegar",
        "fermented shrimp paste",
      ],
      steaming: [
        "ginger fish sauce",
        "soy scallion sauce",
        "lime juice",
        "spicy fish sauce",
        "garlic oil",
      ],
      frying: [
        "sweet and sour sauce",
        "nước chấm",
        "tamarind sauce",
        "pickled vegetable dip",
        "sa tế",
      ],
      raw: [
        "spicy nước chấm",
        "lime-chili sauce",
        "salty-sweet fish sauce",
        "herbs and lime",
        "mắm nêm",
      ],
    },
    byAstrological: {
      Fire: [
        "sa tế",
        "tương ớt",
        "spicy nước chấm",
        "chili oil",
        "black pepper sauce",
      ],
      Water: [
        "simple nước mắm",
        "sour tamarind sauce",
        "lime juice dressings",
        "mild nước chấm",
        "coconut sauces",
      ],
      Earth: [
        "tương đen",
        "peanut sauce",
        "fermented bean curd",
        "mắm nêm",
        "mắm ruốc",
      ],
      Air: [
        "herb-infused dressings",
        "lime-pepper-salt dip",
        "citrus vinaigrettes",
        "scallion oil",
        "light herb sauces",
      ],
    },
    byDietary: {
      vegan: [
        "soy sauce dip",
        "vegan nước chấm",
        "fermented tofu sauce",
        "peanut sauce",
        "tamarind sauce",
      ],
      vegetarian: [
        "mushroom sauce",
        "soy-based fish sauce",
        "sesame-soy dip",
        "herb oil",
        "chili-lime sauce",
      ],
      glutenFree: [
        "rice vinegar dressing",
        "fish sauce dip",
        "coconut-based sauces",
        "lime-chili sauce",
        "herb sauces",
      ],
      dairyFree: [
        "nước chấm",
        "soy-based dipping sauce",
        "garlic-lime sauce",
        "ginger sauce",
        "chili oil",
      ],
    },
    byRegion: {
      northern: [
        "simple nước chấm",
        "mắm tôm",
        "dipping vinegar",
        "garlic fish sauce",
        "scallion oil",
      ],
      central: [
        "spicy nước chấm",
        "mắm ruốc huế",
        "sa tế",
        "fermented fish",
        "lime-chili dips",
      ],
      southern: [
        "sweet nước chấm",
        "tamarind sauce",
        "coconut sauces",
        "caramel sauce",
        "hoisin sauce",
      ],
      mekong: [
        "fermented mudfish sauce",
        "sweet fish sauce",
        "pineapple fish sauce",
        "spicy nước mắm",
        "mắm nêm",
      ],
    },
  },
  cookingTechniques: [
    {
      name: "Kho (Clay Pot Braising)",
      description:
        "Slow caramelization and braising in a clay pot with fish sauce and caramel",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "clay pot",
        "wooden spoon",
        "caramel sauce",
        "long cooking time",
      ],
      bestFor: ["fish", "pork", "chicken", "tofu", "eggs"],
      difficulty: "medium",
    },
    {
      name: "Nướng (Grilling)",
      description:
        "Aromatic grilling over charcoal, often with lemongrass marinades",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: [
        "charcoal grill",
        "bamboo skewers",
        "banana leaf wrapping",
        "marinade brush",
      ],
      bestFor: ["pork", "beef", "seafood", "chicken", "meatballs"],
      difficulty: "medium",
    },
    {
      name: "Xào (Stir-frying)",
      description:
        "Quick high-heat cooking that preserves fresh flavors and textures",
      elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
      toolsRequired: ["wok", "high heat source", "spatula", "prep bowls"],
      bestFor: [
        "vegetables",
        "rice noodles",
        "quick meat dishes",
        "tofu",
        "morning glory",
      ],
      difficulty: "medium",
    },
    {
      name: "Hấp (Steaming)",
      description:
        "Gentle cooking that preserves natural flavors and nutritional content",
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      toolsRequired: [
        "steamer basket",
        "banana leaves",
        "parchment paper",
        "pot",
      ],
      bestFor: [
        "fish",
        "rice cakes",
        "dumplings",
        "custards",
        "fresh vegetables",
      ],
      difficulty: "easy",
    },
    {
      name: "Cuốn (Rolling/Wrapping)",
      description:
        "Creating fresh rolls with rice paper or lettuce, emphasizing contrast and freshness",
      elementalProperties: { Water: 0.3, Earth: 0.3, Air: 0.3, Fire: 0.1 },
      toolsRequired: [
        "rice paper",
        "bowl of warm water",
        "clean work surface",
        "sharp knife",
      ],
      bestFor: [
        "spring rolls",
        "summer rolls",
        "lettuce wraps",
        "beef in betel leaf",
        "rice noodle rolls",
      ],
      difficulty: "easy",
    },
  ],
  regionalCuisines: [
    {
      name: "Northern Vietnamese",
      description:
        "More subtle and delicate flavors with Chinese influence and less spice and sugar",
      signatureDishes: [
        "Phở Hà Nội",
        "Bún Chả",
        "Chả Cá Lã Vọng",
        "Bánh Cuốn",
        "Xôi",
      ],
      keyIngredients: [
        "fresh herbs",
        "black pepper",
        "freshwater fish",
        "nước mắm",
        "fermented shrimp paste",
      ],
      cookingTechniques: [
        "stir-frying",
        "grilling",
        "steaming",
        "slow simmering",
      ],
      elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
      culturalInfluences: [
        "Chinese",
        "French colonial",
        "indigenous Vietnamese",
      ],
      philosophicalFoundations:
        "Balance and subtlety, with respect for traditional methods and pure flavors",
    },
    {
      name: "Central Vietnamese",
      description:
        "Bold, spicy flavors influenced by royal cuisine with elaborate presentation",
      signatureDishes: [
        "Bún Bò Huế",
        "Bánh Xèo",
        "Mì Quảng",
        "Bánh Bèo",
        "Cơm Hến",
      ],
      keyIngredients: [
        "lemongrass",
        "chilies",
        "shrimp paste",
        "turmeric",
        "rice crackers",
        "fermented fish",
      ],
      cookingTechniques: [
        "slow cooking",
        "fermentation",
        "intricate cutting",
        "spice preparation",
      ],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
      culturalInfluences: ["Royal Vietnamese court", "Thai", "Cham"],
      philosophicalFoundations:
        "Complex and sophisticated flavors that honor the royal culinary traditions",
    },
    {
      name: "Southern Vietnamese",
      description:
        "Sweet, vibrant flavors with abundant fresh herbs and tropical ingredients",
      signatureDishes: [
        "Hủ Tiếu Nam Vang",
        "Cơm Tấm",
        "Canh Chua",
        "Bánh Xèo",
        "Lẩu",
      ],
      keyIngredients: [
        "coconut milk",
        "sugarcane",
        "tropical fruits",
        "abundant herbs",
        "river fish",
        "tamarind",
      ],
      cookingTechniques: [
        "simmering",
        "caramelizing",
        "quick stir-frying",
        "fresh preparations",
      ],
      elementalProperties: { Water: 0.3, Earth: 0.3, Air: 0.2, Fire: 0.2 },
      culturalInfluences: ["Khmer", "Chinese", "Thai", "French colonial"],
      philosophicalFoundations:
        "Embraces abundance and fusion while maintaining the essential Vietnamese balance",
    },
    {
      name: "Mekong Delta",
      description:
        "Emphasizes freshwater fish, tropical fruits, and rice with Khmer influences",
      signatureDishes: [
        "Cá Kho Tộ",
        "Canh Chua Cá",
        "Bánh Tét",
        "Mắm (fermented fish dishes)",
        "Lẩu Mắm",
      ],
      keyIngredients: [
        "freshwater fish",
        "elephant ear fish",
        "rice",
        "tamarind",
        "water coconut",
        "fermented fish",
      ],
      cookingTechniques: [
        "clay pot cooking",
        "fermentation",
        "caramelization",
        "stewing",
      ],
      elementalProperties: { Water: 0.5, Earth: 0.3, Fire: 0.1, Air: 0.1 },
      culturalInfluences: ["Khmer", "indigenous Vietnamese", "Chinese"],
      philosophicalFoundations:
        "Connection to river life and the bounty of the delta, with emphasis on preservation techniques",
    },
    {
      name: "Highland Vietnamese",
      description:
        "Rustic, earthy cuisine utilizing mountain ingredients and ethnic minority traditions",
      signatureDishes: [
        "Thịt Nướng Cây Rừng",
        "Cơm Lam",
        "Gà Nướng",
        "Thịt Heo Gác Bếp",
        "Rau Rừng Xào",
      ],
      keyIngredients: [
        "mountain herbs",
        "wild vegetables",
        "bamboo",
        "game meats",
        "forest mushrooms",
      ],
      cookingTechniques: [
        "smoking",
        "open fire cooking",
        "bamboo tube cooking",
        "preserving",
      ],
      elementalProperties: { Earth: 0.5, Fire: 0.3, Air: 0.1, Water: 0.1 },
      culturalInfluences: [
        "Ethnic minorities (Ê Đê, H'Mông, Thái)",
        "Indigenous practices",
      ],
      philosophicalFoundations:
        "Deep connection to mountain landscapes and ethnic culinary heritage",
    },
  ],
  elementalProperties: {
    Water: 0.3, // Represents soups and broths
    Earth: 0.3, // Represents rice and proteins,
    Fire: 0.2, // Represents spicy elements and grilling
    Air: 0.2, // Represents herbs and aromatics
  },
};

export default vietnamese;
