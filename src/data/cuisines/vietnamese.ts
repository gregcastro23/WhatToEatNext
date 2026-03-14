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
          "recipe_name": "Authentic Phở Bò (Vietnamese Beef Noodle Soup)",
          "description": "A deeply restorative and complex noodle soup that embodies the essence of Vietnamese culinary alchemy. It balances the deep, grounding earthiness of simmered beef bones with the ethereal, volatile aromatics of charred ginger, star anise, and cinnamon. Traditionally served as a morning meal, it invigorates the spirit and aligns the body's internal heat.",
          "details": {
            "cuisine": "Vietnamese",
            "prep_time_minutes": 30,
            "cook_time_minutes": 360,
            "base_serving_size": 4,
            "spice_level": "Mild",
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
            "meal_type": [
              "breakfast",
              "soup",
              "dinner"
            ],
            "cooking_methods": [
              "simmering",
              "charring",
              "toasting",
              "blanching"
            ]
          },
          "elemental_properties": {
            "fire": 0.25,
            "water": 0.55,
            "earth": 0.1,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Jupiter",
              "Neptune"
            ],
            "signs": [
              "Pisces",
              "Aries"
            ],
            "lunar_phases": [
              "New Moon",
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 35,
            "carbs_g": 60,
            "fat_g": 12,
            "fiber_g": 4
          },
          "substitutions": [
            {
              "original_ingredient": "beef bones and meat",
              "substitute_options": [
                "whole chicken and chicken bones (Phở Gà)",
                "charred daikon, shiitake, and vegetable broth (Phở Chay)"
              ]
            },
            {
              "original_ingredient": "fish sauce",
              "substitute_options": [
                "soy sauce (vegan)",
                "coconut aminos (vegan)"
              ]
            }
          ]
        },
        {
          name: "Cháo Gà",
          description: "Vietnamese chicken rice porridge",
          cuisine: "Vietnamese",
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
              name: "poaching",
              elementalProperties: {
                Fire: 0.19,
                Water: 0.5,
                Earth: 0.13,
                Air: 0.19,
              },
            },
          ],
          tools: [
            "large pot",
            "ladle",
            "knife",
            "cutting board",
            "small bowls for garnishes",
          ],
          preparationSteps: [
            "Cook rice until very soft",
            "Poach chicken",
            "Prepare garnishes",
            "Season porridge",
            "Shred chicken",
            "Assemble bowls",
          ],
          ingredients: [
            {
              name: "jasmine rice",
              amount: "1",
              unit: "cup",
              category: "grain",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.5,
                Air: 0.1,
              },
            },
            {
              name: "chicken",
              amount: "500",
              unit: "g",
              category: "protein",
              swaps: ["tofu"],
            },
            { name: "ginger", amount: "50", unit: "g", category: "spice" },
            {
              name: "green onions",
              amount: "4",
              unit: "stalks",
              category: "vegetable",
            },
            {
              name: "fish sauce",
              amount: "2",
              unit: "tbsp",
              category: "seasoning",
              swaps: ["soy sauce"],
            },
            {
              name: "black pepper",
              amount: "1",
              unit: "tsp",
              category: "spice",
            },
            {
              name: "fried shallots",
              amount: "4",
              unit: "tbsp",
              category: "garnish",
            },
            { name: "cilantro", amount: "1/2", unit: "cup", category: "herb" },
          ],
          substitutions: {
            chicken: ["turkey", "tofu", "mushrooms"],
            "fish sauce": ["soy sauce", "coconut aminos"],
            "fried shallots": ["fried garlic", "crispy onions"],
          },
          servingSize: 4,
          allergens: ["fish"],
          prepTime: "15 minutes",
          cookTime: "45 minutes",
          culturalNotes:
            "Cháo is a comforting breakfast dish often served when someone is feeling unwell. Each region has its own variation",
          pairingSuggestions: [
            "youtiao (fried dough)",
            "pickled vegetables",
            "century eggs",
          ],
          dietaryInfo: ["dairy-free", "adaptable to gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 28,
            carbs: 42,
            fat: 8,
            fiber: 3,
            vitamins: ["B6", "B12"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.11,
            Water: 0.48,
            Earth: 0.3,
            Air: 0.11,
          },
        },
        {
          name: "Bánh Cuốn",
          description:
            "Steamed rice rolls filled with ground pork and mushrooms",
          cuisine: "Vietnamese",
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
            "steamer",
            "non-stick pan",
            "spatula",
            "mixing bowls",
            "serving plates",
          ],
          preparationSteps: [
            "Make rice batter",
            "Prepare filling",
            "Steam thin layers",
            "Fill and roll",
            "Make dipping sauce",
            "Garnish and serve",
          ],
          ingredients: [
            {
              name: "rice flour",
              amount: "300",
              unit: "g",
              category: "flour",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.5,
                Air: 0.1,
              },
            },
            {
              name: "tapioca starch",
              amount: "50",
              unit: "g",
              category: "starch",
            },
            {
              name: "ground pork",
              amount: "200",
              unit: "g",
              category: "protein",
              swaps: ["mushrooms"],
            },
            {
              name: "wood ear mushrooms",
              amount: "50",
              unit: "g",
              category: "vegetable",
            },
            {
              name: "shallots",
              amount: "4",
              unit: "whole",
              category: "vegetable",
            },
            {
              name: "fish sauce",
              amount: "3",
              unit: "tbsp",
              category: "seasoning",
            },
            {
              name: "fried shallots",
              amount: "4",
              unit: "tbsp",
              category: "garnish",
            },
            {
              name: "Vietnamese herbs",
              amount: "1",
              unit: "bunch",
              category: "herb",
            },
          ],
          substitutions: {
            "ground pork": ["minced mushrooms", "tofu"],
            "fish sauce": ["soy sauce", "coconut aminos"],
            "wood ear mushrooms": ["shiitake mushrooms"],
          },
          servingSize: 4,
          allergens: ["fish"],
          prepTime: "30 minutes",
          cookTime: "45 minutes",
          culturalNotes:
            "A beloved breakfast dish from Northern Vietnam, often served with nước chấm dipping sauce and chả lụa (Vietnamese pork sausage)",
          pairingSuggestions: [
            "Vietnamese coffee",
            "fresh herbs",
            "chili sauce",
          ],
          dietaryInfo: ["dairy-free", "adaptable to vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 280,
            protein: 15,
            carbs: 45,
            fat: 6,
            fiber: 3,
            vitamins: ["B1", "B6"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.11,
            Water: 0.45,
            Earth: 0.33,
            Air: 0.11,
          },
        },
        {
          "recipe_name": "Authentic Xôi Xéo",
          "description": "An iconic Northern Vietnamese street food breakfast. Xôi Xéo is a brilliant study in textural contrast and visual warmth. The radiant yellow glutinous rice (dyed naturally with turmeric) provides a chewy, grounding base, topped with a rich, savory paste of steamed mung beans, and crowned with the crispy, aromatic crunch of fried shallots and a drizzle of shallot oil.",
          "details": {
            "cuisine": "Vietnamese",
            "prep_time_minutes": 240,
            "cook_time_minutes": 45,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "breakfast",
              "snack",
              "street food"
            ],
            "cooking_methods": [
              "steaming",
              "frying",
              "mashing"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.2,
            "earth": 0.5,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Saturn",
              "Sun"
            ],
            "signs": [
              "Taurus",
              "Virgo"
            ],
            "lunar_phases": [
              "First Quarter",
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 10,
            "carbs_g": 65,
            "fat_g": 14,
            "fiber_g": 6
          },
          "substitutions": [
            {
              "original_ingredient": "short-grain glutinous rice",
              "substitute_options": [
                "long-grain sweet rice"
              ]
            },
            {
              "original_ingredient": "split mung beans",
              "substitute_options": [
                "split yellow peas",
                "red lentils (texture will vary slightly)"
              ]
            },
            {
              "original_ingredient": "coconut milk",
              "substitute_options": [
                "omit entirely for a more traditional, savory profile"
              ]
            }
          ]
        },
        {
          name: "Bánh Mì Ốp La",
          description:
            "Vietnamese baguette with sunny-side up eggs, pâté, and fresh vegetables",
          cuisine: "Vietnamese",
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
              name: "toasting",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.06,
                Earth: 0.25,
                Air: 0.28,
              },
            },
          ],
          ingredients: [
            {
              name: "baguette",
              amount: "1",
              unit: "whole",
              category: "grain",
            },
            {
              name: "eggs",
              amount: "2",
              unit: "large",
              category: "protein",
            },
            {
              name: "pâté",
              amount: "2",
              unit: "tbsp",
              category: "protein",
            },
            {
              name: "cucumber",
              amount: "1/4",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "cilantro",
              amount: "1/4",
              unit: "cup",
              category: "herb",
            },
            {
              name: "soy sauce",
              amount: "1",
              unit: "tbsp",
              category: "condiment",
            },
          ],
          substitutions: {
            pâté: ["butter", "mayo"],
            baguette: ["ciabatta"],
          },
          servingSize: 1,
          allergens: ["gluten", "eggs"],
          prepTime: "5 minutes",
          cookTime: "10 minutes",
          nutrition: {
            calories: 420,
            protein: 18,
            carbs: 45,
            fat: 20,
            fiber: 2,
          },
          timeToMake: "15 minutes",
          season: ["all"],
          mealType: ["breakfast"],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.35,
            Air: 0.15,
          },
        },
      ],
      winter: [
        {
          name: "Cháo",
          description: "Vietnamese rice porridge with chicken",
          cuisine: "Vietnamese",
          ingredients: [
            {
              name: "rice",
              amount: "1",
              unit: "cup",
              category: "grain",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.5,
                Air: 0.1,
              },
            },
            {
              name: "chicken",
              amount: "200",
              unit: "g",
              category: "protein",
              swaps: ["tofu"],
            },
            { name: "ginger", amount: "30", unit: "g", category: "spice" },
            {
              name: "green onions",
              amount: "2",
              unit: "stalks",
              category: "vegetable",
            },
          ],
          nutrition: {
            calories: 350,
            protein: 25,
            carbs: 45,
            fat: 8,
            fiber: 3,
            vitamins: ["B1", "B2"],
            minerals: ["Iron", "Zinc"],
          },
          timeToMake: "45 minutes",
          season: ["winter"],

          elementalProperties: {
            Fire: 0.17,
            Water: 0.32,
            Earth: 0.37,
            Air: 0.13,
          },
          mealType: ["breakfast"],
        },
      ],
    },
    lunch: {
      all: [
        {
          "recipe_name": "Authentic Bánh Mì Thịt Nướng",
          "description": "The quintessential Vietnamese-French culinary synthesis.",
          "details": {
            "cuisine": "Vietnamese",
            "prep_time_minutes": 180,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "Mild-Medium",
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
            "meal_type": [
              "lunch"
            ],
            "cooking_methods": [
              "grilling",
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.15,
            "earth": 0.25,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Gemini"
            ],
            "lunar_phases": [
              "Waxing Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 520,
            "protein_g": 28,
            "carbs_g": 48,
            "fat_g": 24,
            "fiber_g": 3
          },
          "substitutions": [
            {
              "original_ingredient": "pork shoulder",
              "substitute_options": [
                "chicken thighs"
              ]
            }
          ]
        },
        {
          name: "Bún Chả",
          description: "Grilled pork meatballs with rice noodles and herbs",
          cuisine: "Vietnamese",
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
              name: "boiling",
              elementalProperties: {
                Fire: 0.24,
                Water: 0.59,
                Earth: 0.12,
                Air: 0.06,
              },
            },
          ],
          tools: ["grill", "mixing bowls", "pot", "strainer", "serving bowls"],
          preparationSteps: [
            "Form meatballs",
            "Make dipping sauce",
            "Grill meatballs",
            "Cook noodles",
            "Prepare herbs",
            "Assemble bowls",
          ],
          ingredients: [
            {
              name: "ground pork",
              amount: "500",
              unit: "g",
              category: "protein",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.3,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "rice noodles",
              amount: "400",
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
              name: "fish sauce",
              amount: "4",
              unit: "tbsp",
              category: "seasoning",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.6,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "garlic",
              amount: "6",
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
              name: "shallots",
              amount: "4",
              unit: "pieces",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.35,
                Water: 0.25,
                Earth: 0.3,
                Air: 0.1,
              },
            },
            {
              name: "lettuce",
              amount: "1",
              unit: "head",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.05,
                Water: 0.6,
                Earth: 0.15,
                Air: 0.2,
              },
            },
            {
              name: "herbs mix",
              amount: "2",
              unit: "cups",
              category: "herb",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.2,
                Earth: 0.2,
                Air: 0.5,
              },
            },
            {
              name: "green papaya",
              amount: "200",
              unit: "g",
              category: "vegetable",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.55,
                Earth: 0.15,
                Air: 0.1,
              },
            },
            {
              name: "lime",
              amount: "2",
              unit: "pieces",
              category: "fruit",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.5,
                Earth: 0.1,
                Air: 0.2,
              },
            },
          ],
          substitutions: {
            "ground pork": ["chicken", "turkey", "plant-based meat"],
            "fish sauce": ["soy sauce", "coconut aminos"],
            "green papaya": ["carrots", "daikon"],
          },
          servingSize: 4,
          allergens: ["fish"],
          prepTime: "45 minutes",
          cookTime: "20 minutes",
          culturalNotes:
            "A Hanoi specialty that gained international recognition when Anthony Bourdain and Barack Obama enjoyed it together",
          pairingSuggestions: ["Vietnamese beer", "pickled garlic", "chili"],
          dietaryInfo: ["dairy-free", "adaptable to gluten-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 480,
            protein: 32,
            carbs: 55,
            fat: 18,
            fiber: 3,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.22,
            Water: 0.42,
            Earth: 0.18,
            Air: 0.18,
          },
        },
        {
          name: "Bún Bò Huế",
          description: "Spicy beef noodle soup from Hue",
          cuisine: "Vietnamese",
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
              name: "boiling",
              elementalProperties: {
                Fire: 0.24,
                Water: 0.59,
                Earth: 0.12,
                Air: 0.06,
              },
            },
            "spice preparation",
          ],
          tools: [
            "large stock pot",
            "strainer",
            "ladle",
            "serving bowls",
            "chopsticks",
          ],
          preparationSteps: [
            "Prepare lemongrass broth",
            "Cook beef and pork",
            "Make chili oil",
            "Cook noodles",
            "Assemble bowls",
            "Add garnishes",
          ],
          ingredients: [
            {
              name: "beef shank",
              amount: "500",
              unit: "g",
              category: "protein",
              elementalProperties: {
                Fire: 0.3,
                Water: 0.2,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "pork knuckles",
              amount: "300",
              unit: "g",
              category: "protein",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.3,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "thick rice noodles",
              amount: "500",
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
              name: "lemongrass",
              amount: "4",
              unit: "stalks",
              category: "herb",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.2,
                Earth: 0.1,
                Air: 0.5,
              },
            },
            {
              name: "shrimp paste",
              amount: "2",
              unit: "tbsp",
              category: "seasoning",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.6,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "annatto seeds",
              amount: "2",
              unit: "tbsp",
              category: "spice",
            },
            {
              name: "Vietnamese herbs",
              amount: "2",
              unit: "cups",
              category: "herb",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.2,
                Earth: 0.2,
                Air: 0.5,
              },
            },
            {
              name: "banana flower",
              amount: "1",
              unit: "whole",
              category: "vegetable",
              optional: true,
              elementalProperties: {
                Fire: 0.1,
                Water: 0.4,
                Earth: 0.4,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            "beef shank": ["brisket", "tofu"],
            "pork knuckles": ["pork belly", "mushrooms"],
            "shrimp paste": ["miso paste"],
          },
          servingSize: 6,
          allergens: ["shellfish"],
          prepTime: "40 minutes",
          cookTime: "3 hours",
          culturalNotes:
            "A regional specialty from the imperial city of Hue, known for its spicy broth and complex flavors",
          pairingSuggestions: ["lime wedges", "chili sauce", "fresh herbs"],
          dietaryInfo: ["dairy-free"],
          spiceLevel: "hot",
          nutrition: {
            calories: 520,
            protein: 35,
            carbs: 65,
            fat: 18,
            fiber: 3,
            vitamins: ["B12", "C"],
            minerals: ["Iron", "Zinc"],
          },
          season: ["all"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.11,
            Water: 0.5,
            Earth: 0.21,
            Air: 0.18,
          },
        },
        {
          name: "Gỏi Cuốn",
          description:
            "Vietnamese fresh spring rolls with shrimp, pork, rice noodles, and herbs",
          cuisine: "Vietnamese",
          cookingMethods: [
            {
              name: "rolling",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.35,
                Air: 0.25,
              },
            },
          ],
          ingredients: [
            {
              name: "rice paper",
              amount: "12",
              unit: "sheets",
              category: "grain",
            },
            {
              name: "shrimp",
              amount: "12",
              unit: "medium",
              category: "protein",
            },
            {
              name: "pork belly",
              amount: "200",
              unit: "g",
              category: "protein",
            },
            {
              name: "rice vermicelli",
              amount: "100",
              unit: "g",
              category: "grain",
            },
            {
              name: "lettuce",
              amount: "1",
              unit: "head",
              category: "vegetable",
            },
            {
              name: "mint",
              amount: "1",
              unit: "bunch",
              category: "herb",
            },
          ],
          substitutions: {
            shrimp: ["tofu", "chicken"],
            "pork belly": ["chicken breast"],
          },
          servingSize: 4,
          allergens: ["shellfish"],
          prepTime: "30 minutes",
          cookTime: "15 minutes",
          nutrition: {
            calories: 220,
            protein: 18,
            carbs: 25,
            fat: 6,
            fiber: 3,
          },
          timeToMake: "45 minutes",
          season: ["spring", "summer"],
          mealType: ["lunch", "appetizer"],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.35,
            Earth: 0.3,
            Air: 0.25,
          },
        },
        {
          name: "Cơm Gà Hội An",
          description:
            "Hội An chicken rice with turmeric-infused rice and tender poached chicken",
          cuisine: "Vietnamese",
          cookingMethods: [
            {
              name: "poaching",
              elementalProperties: {
                Fire: 0.19,
                Water: 0.5,
                Earth: 0.13,
                Air: 0.19,
              },
            },
            {
              name: "steaming",
              elementalProperties: {
                Fire: 0.15,
                Water: 0.55,
                Earth: 0.15,
                Air: 0.15,
              },
            },
          ],
          ingredients: [
            {
              name: "chicken",
              amount: "1",
              unit: "whole",
              category: "protein",
            },
            {
              name: "jasmine rice",
              amount: "2",
              unit: "cups",
              category: "grain",
            },
            {
              name: "turmeric",
              amount: "1",
              unit: "tsp",
              category: "spice",
            },
            {
              name: "ginger",
              amount: "2",
              unit: "inches",
              category: "spice",
            },
            {
              name: "papaya salad",
              amount: "200",
              unit: "g",
              category: "vegetable",
            },
          ],
          substitutions: {
            "whole chicken": ["chicken thighs"],
            "papaya salad": ["cucumber salad"],
          },
          servingSize: 4,
          allergens: [],
          prepTime: "15 minutes",
          cookTime: "45 minutes",
          nutrition: {
            calories: 480,
            protein: 35,
            carbs: 55,
            fat: 12,
            fiber: 2,
          },
          timeToMake: "60 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.35,
            Earth: 0.35,
            Air: 0.1,
          },
        },
        {
          name: "Bánh Xèo",
          description:
            "Vietnamese sizzling crepes filled with pork, shrimp, and bean sprouts",
          cuisine: "Vietnamese",
          cookingMethods: [
            {
              name: "pan-frying",
              elementalProperties: {
                Fire: 0.42,
                Water: 0.09,
                Earth: 0.21,
                Air: 0.27,
              },
            },
          ],
          ingredients: [
            {
              name: "rice flour",
              amount: "1",
              unit: "cup",
              category: "grain",
            },
            {
              name: "turmeric powder",
              amount: "1/2",
              unit: "tsp",
              category: "spice",
            },
            {
              name: "coconut milk",
              amount: "1/2",
              unit: "cup",
              category: "liquid",
            },
            {
              name: "pork",
              amount: "200",
              unit: "g",
              category: "protein",
            },
            {
              name: "shrimp",
              amount: "150",
              unit: "g",
              category: "protein",
            },
            {
              name: "bean sprouts",
              amount: "2",
              unit: "cups",
              category: "vegetable",
            },
          ],
          substitutions: {
            shrimp: ["tofu"],
            pork: ["chicken", "mushrooms"],
          },
          servingSize: 4,
          allergens: ["shellfish"],
          prepTime: "20 minutes",
          cookTime: "30 minutes",
          nutrition: {
            calories: 350,
            protein: 22,
            carbs: 35,
            fat: 15,
            fiber: 3,
          },
          timeToMake: "50 minutes",
          season: ["all"],
          mealType: ["lunch", "dinner"],
          elementalProperties: {
            Fire: 0.35,
            Water: 0.2,
            Earth: 0.3,
            Air: 0.15,
          },
        },
      ],
    },
    dinner: {
      all: [
        {
          name: "Cá Kho Tộ",
          description: "Caramelized fish in clay pot",
          cuisine: "Vietnamese",
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
              name: "caramelizing",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.06,
                Earth: 0.25,
                Air: 0.19,
              },
            },
          ],
          tools: [
            "clay pot or heavy pot",
            "wooden spoon",
            "knife",
            "cutting board",
            "measuring spoons",
          ],
          preparationSteps: [
            "Clean and cut fish",
            "Make caramel sauce",
            "Layer ingredients",
            "Simmer fish",
            "Reduce sauce",
            "Garnish and serve",
          ],
          ingredients: [
            {
              name: "catfish steaks",
              amount: "800",
              unit: "g",
              category: "protein",
              swaps: ["salmon", "mackerel"],
            },
            { name: "sugar", amount: "3", unit: "tbsp", category: "sweetener" },
            {
              name: "fish sauce",
              amount: "4",
              unit: "tbsp",
              category: "seasoning",
            },
            {
              name: "coconut water",
              amount: "1",
              unit: "cup",
              category: "liquid",
            },
            {
              name: "shallots",
              amount: "4",
              unit: "whole",
              category: "vegetable",
            },
            {
              name: "garlic",
              amount: "4",
              unit: "cloves",
              category: "vegetable",
            },
            { name: "ginger", amount: "2", unit: "inches", category: "spice" },
            {
              name: "green onions",
              amount: "4",
              unit: "stalks",
              category: "vegetable",
            },
            {
              name: "black pepper",
              amount: "1",
              unit: "tsp",
              category: "spice",
            },
            {
              name: "chili",
              amount: "2",
              unit: "pieces",
              category: "spice",
              optional: true,
            },
          ],
          substitutions: {
            catfish: ["salmon", "mackerel", "tofu"],
            "fish sauce": ["soy sauce", "coconut aminos"],
            "coconut water": ["water", "stock"],
          },
          servingSize: 4,
          allergens: ["fish"],
          prepTime: "20 minutes",
          cookTime: "40 minutes",
          culturalNotes:
            "A homestyle dish that exemplifies the Vietnamese caramelization technique. The clay pot helps develop deep flavors and keeps the fish moist",
          pairingSuggestions: ["steamed rice", "water spinach", "soup"],
          dietaryInfo: ["dairy-free", "gluten-free"],
          spiceLevel: "mild to medium",
          nutrition: {
            calories: 420,
            protein: 35,
            carbs: 15,
            fat: 25,
            fiber: 3,
            vitamins: ["D", "B12"],
            minerals: ["Omega-3", "Iron"],
          },
          season: ["all"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.09,
            Water: 0.68,
            Earth: 0.16,
            Air: 0.08,
          },
        },
        {
          "recipe_name": "Authentic Cơm Tấm",
          "description": "A working-class breakfast icon from Saigon. The foundation is 'broken rice'.",
          "details": {
            "cuisine": "Vietnamese",
            "prep_time_minutes": 120,
            "cook_time_minutes": 45,
            "base_serving_size": 2,
            "spice_level": "Mild",
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
            "meal_type": [
              "breakfast"
            ],
            "cooking_methods": [
              "grilling",
              "steaming"
            ]
          },
          "elemental_properties": {
            "fire": 0.35,
            "water": 0.15,
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
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 680,
            "protein_g": 38,
            "carbs_g": 75,
            "fat_g": 26,
            "fiber_g": 4
          },
          "substitutions": [
            {
              "original_ingredient": "broken rice",
              "substitute_options": [
                "jasmine rice"
              ]
            }
          ]
        },
        {
          name: "Thịt Kho Tàu",
          description:
            "Vietnamese caramelized pork belly with hard-boiled eggs in coconut water",
          cuisine: "Vietnamese",
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
              name: "caramelizing",
              elementalProperties: {
                Fire: 0.5,
                Water: 0.06,
                Earth: 0.25,
                Air: 0.19,
              },
            },
          ],
          ingredients: [
            {
              name: "pork belly",
              amount: "500",
              unit: "g",
              category: "protein",
            },
            {
              name: "eggs",
              amount: "6",
              unit: "large",
              category: "protein",
            },
            {
              name: "coconut water",
              amount: "2",
              unit: "cups",
              category: "liquid",
            },
            {
              name: "fish sauce",
              amount: "3",
              unit: "tbsp",
              category: "condiment",
            },
            {
              name: "sugar",
              amount: "4",
              unit: "tbsp",
              category: "sweetener",
            },
          ],
          substitutions: {
            "pork belly": ["pork shoulder"],
            "coconut water": ["water with sugar"],
          },
          servingSize: 6,
          allergens: ["eggs", "fish"],
          prepTime: "15 minutes",
          cookTime: "90 minutes",
          nutrition: {
            calories: 520,
            protein: 28,
            carbs: 15,
            fat: 42,
            fiber: 0,
          },
          timeToMake: "105 minutes",
          season: ["all"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.3,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.1,
          },
        },
        {
          name: "Lẩu Thái",
          description:
            "Vietnamese-Thai fusion hot pot with seafood, vegetables, and aromatic broth",
          cuisine: "Vietnamese",
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
          ],
          ingredients: [
            {
              name: "shrimp",
              amount: "300",
              unit: "g",
              category: "protein",
            },
            {
              name: "squid",
              amount: "200",
              unit: "g",
              category: "protein",
            },
            {
              name: "fish balls",
              amount: "200",
              unit: "g",
              category: "protein",
            },
            {
              name: "lemongrass",
              amount: "3",
              unit: "stalks",
              category: "herb",
            },
            {
              name: "Thai chili",
              amount: "5",
              unit: "whole",
              category: "vegetable",
            },
            {
              name: "vegetables",
              amount: "500",
              unit: "g",
              category: "vegetable",
            },
          ],
          substitutions: {
            shrimp: ["tofu", "chicken"],
            squid: ["fish fillets"],
          },
          servingSize: 4,
          allergens: ["shellfish", "fish"],
          prepTime: "30 minutes",
          cookTime: "30 minutes",
          nutrition: {
            calories: 380,
            protein: 42,
            carbs: 25,
            fat: 12,
            fiber: 6,
          },
          timeToMake: "60 minutes",
          season: ["winter"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.35,
            Water: 0.4,
            Earth: 0.15,
            Air: 0.1,
          },
        },
        {
          name: "Bò Lúc Lắc",
          description:
            "Vietnamese shaking beef with cubed sirloin, garlic, and watercress",
          cuisine: "Vietnamese",
          cookingMethods: [
            {
              name: "stir-frying",
              elementalProperties: {
                Fire: 0.48,
                Water: 0.06,
                Earth: 0.11,
                Air: 0.35,
              },
            },
          ],
          ingredients: [
            {
              name: "beef sirloin",
              amount: "500",
              unit: "g",
              category: "protein",
            },
            {
              name: "garlic",
              amount: "6",
              unit: "cloves",
              category: "vegetable",
            },
            {
              name: "watercress",
              amount: "2",
              unit: "bunches",
              category: "vegetable",
            },
            {
              name: "tomatoes",
              amount: "2",
              unit: "medium",
              category: "vegetable",
            },
            {
              name: "soy sauce",
              amount: "2",
              unit: "tbsp",
              category: "condiment",
            },
            {
              name: "oyster sauce",
              amount: "1",
              unit: "tbsp",
              category: "condiment",
            },
          ],
          substitutions: {
            "beef sirloin": ["chicken breast", "tofu"],
            watercress: ["arugula", "spinach"],
          },
          servingSize: 4,
          allergens: ["soy"],
          prepTime: "15 minutes",
          cookTime: "10 minutes",
          nutrition: {
            calories: 420,
            protein: 38,
            carbs: 12,
            fat: 24,
            fiber: 2,
          },
          timeToMake: "25 minutes",
          season: ["all"],
          mealType: ["dinner"],
          elementalProperties: {
            Fire: 0.4,
            Water: 0.15,
            Earth: 0.3,
            Air: 0.15,
          },
        },
      ],
    },
    dessert: {
      all: [
        {
          name: "Chè Ba Màu",
          description:
            "Three-color dessert with beans, jelly, and coconut milk",
          cuisine: "Vietnamese",
          cookingMethods: [
            "cooking beans",
            {
              name: "layering",
              elementalProperties: {
                Fire: 0.08,
                Water: 0.15,
                Earth: 0.46,
                Air: 0.31,
              },
            },
          ],
          tools: [
            "saucepans",
            "strainer",
            "tall glasses",
            "measuring cups",
            "spoons",
          ],
          preparationSteps: [
            "Cook red beans",
            "Prepare mung beans",
            "Make pandan jelly",
            "Prepare coconut milk",
            "Layer ingredients",
            "Chill before serving",
          ],
          ingredients: [
            {
              name: "red beans",
              amount: "200",
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
              name: "mung beans",
              amount: "200",
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
              name: "pandan jelly",
              amount: "200",
              unit: "g",
              category: "jelly",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.1,
                Air: 0.5,
              },
            },
            {
              name: "coconut milk",
              amount: "400",
              unit: "ml",
              category: "liquid",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.6,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "palm sugar",
              amount: "100",
              unit: "g",
              category: "sweetener",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "pandan leaves",
              amount: "2",
              unit: "pieces",
              category: "herb",
              optional: true,
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.1,
                Air: 0.5,
              },
            },
            {
              name: "crushed ice",
              amount: "2",
              unit: "cups",
              category: "ice",
              elementalProperties: {
                Fire: 0,
                Water: 0.85,
                Earth: 0.05,
                Air: 0.1,
              },
            },
          ],
          substitutions: {
            "palm sugar": ["brown sugar", "coconut sugar"],
            "pandan jelly": ["grass jelly", "agar jelly"],
            "coconut milk": ["almond milk", "oat milk"],
          },
          servingSize: 4,
          allergens: ["tree nuts (coconut)"],
          prepTime: "30 minutes",
          cookTime: "1 hour",
          chillTime: "2 hours",
          culturalNotes:
            "A beloved Vietnamese dessert where the three colors represent different textures and flavors. Often enjoyed during hot summer days",
          pairingSuggestions: ["Vietnamese coffee", "additional coconut milk"],
          dietaryInfo: ["vegan", "gluten-free"],
          spiceLevel: "none",
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 52,
            fat: 12,
            fiber: 3,
            vitamins: ["B1", "E"],
            minerals: ["Iron", "Magnesium"],
          },
          season: ["summer"],
          mealType: ["dessert"],
          elementalProperties: {
            Fire: 0.1,
            Water: 0.43,
            Earth: 0.25,
            Air: 0.22,
          },
        },
        {
          name: "Chè Chuối",
          description: "Sweet banana in coconut milk soup",
          cuisine: "Vietnamese",
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
              name: "cooking",
              elementalProperties: {
                Fire: 0.24,
                Water: 0.33,
                Earth: 0.29,
                Air: 0.14,
              },
            },
          ],
          tools: [
            "pot",
            "wooden spoon",
            "measuring cups",
            "serving bowls",
            "knife",
          ],
          preparationSteps: [
            "Prepare bananas",
            "Make tapioca pearls",
            "Cook coconut milk",
            "Combine ingredients",
            "Add toppings",
            "Serve warm or cold",
          ],
          ingredients: [
            {
              name: "ripe bananas",
              amount: "6",
              unit: "medium",
              category: "fruit",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.4,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "coconut milk",
              amount: "400",
              unit: "ml",
              category: "liquid",
              elementalProperties: {
                Fire: 0.1,
                Water: 0.6,
                Earth: 0.2,
                Air: 0.1,
              },
            },
            {
              name: "tapioca pearls",
              amount: "100",
              unit: "g",
              category: "starch",
            },
            {
              name: "palm sugar",
              amount: "80",
              unit: "g",
              category: "sweetener",
              elementalProperties: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.4,
                Air: 0.1,
              },
            },
            {
              name: "pandan leaves",
              amount: "2",
              unit: "pieces",
              category: "herb",
              optional: true,
              elementalProperties: {
                Fire: 0.1,
                Water: 0.3,
                Earth: 0.1,
                Air: 0.5,
              },
            },
            {
              name: "sesame seeds",
              amount: "2",
              unit: "tbsp",
              category: "garnish",
              elementalProperties: {
                Fire: 0.4,
                Water: 0.1,
                Earth: 0.3,
                Air: 0.2,
              },
            },
            {
              name: "crushed peanuts",
              amount: "1/2",
              unit: "cup",
              category: "garnish",
              optional: true,
              elementalProperties: {
                Fire: 0.2,
                Water: 0.1,
                Earth: 0.5,
                Air: 0.2,
              },
            },
          ],
          substitutions: {
            "palm sugar": ["brown sugar", "coconut sugar"],
            "coconut milk": ["almond milk", "oat milk"],
            "pandan leaves": ["vanilla extract"],
          },
          servingSize: 6,
          allergens: ["tree nuts (coconut)", "peanuts"],
          prepTime: "15 minutes",
          cookTime: "25 minutes",
          culturalNotes:
            "A comforting dessert soup that's often served both hot and cold. The combination of bananas and coconut milk is a classic Vietnamese pairing",
          pairingSuggestions: ["Vietnamese coffee", "sesame crackers"],
          dietaryInfo: ["vegan", "gluten-free"],
          spiceLevel: "none",
          nutrition: {
            calories: 280,
            protein: 4,
            carbs: 42,
            fat: 12,
            fiber: 3,
            vitamins: ["B6", "C"],
            minerals: ["Potassium", "Magnesium"],
          },
          season: ["all"],
          mealType: ["dessert"],
          elementalProperties: {
            Fire: 0.16,
            Water: 0.39,
            Earth: 0.26,
            Air: 0.19,
          },
        },
        {
          name: "Bánh Flan",
          description:
            "Vietnamese caramel custard with coffee-infused caramel sauce, a French-Vietnamese fusion",
          cuisine: "Vietnamese",
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
              name: "steaming",
              elementalProperties: {
                Fire: 0.15,
                Water: 0.55,
                Earth: 0.15,
                Air: 0.15,
              },
            },
          ],
          ingredients: [
            {
              name: "eggs",
              amount: "6",
              unit: "large",
              category: "protein",
            },
            {
              name: "condensed milk",
              amount: "1",
              unit: "can",
              category: "dairy",
            },
            {
              name: "evaporated milk",
              amount: "1",
              unit: "can",
              category: "dairy",
            },
            {
              name: "sugar",
              amount: "1",
              unit: "cup",
              category: "sweetener",
            },
            {
              name: "Vietnamese coffee",
              amount: "2",
              unit: "tbsp",
              category: "flavoring",
            },
            {
              name: "vanilla extract",
              amount: "1",
              unit: "tsp",
              category: "flavoring",
            },
          ],
          substitutions: {
            "Vietnamese coffee": ["espresso"],
            "condensed milk": ["coconut condensed milk"],
          },
          servingSize: 8,
          allergens: ["eggs", "dairy"],
          prepTime: "20 minutes",
          cookTime: "60 minutes",
          nutrition: {
            calories: 320,
            protein: 8,
            carbs: 45,
            fat: 12,
            fiber: 0,
          },
          timeToMake: "80 minutes",
          season: ["all"],
          mealType: ["dessert"],
          elementalProperties: {
            Fire: 0.2,
            Water: 0.35,
            Earth: 0.35,
            Air: 0.1,
          },
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
      fire: [
        "sa tế",
        "tương ớt",
        "spicy nước chấm",
        "chili oil",
        "black pepper sauce",
      ],
      water: [
        "simple nước mắm",
        "sour tamarind sauce",
        "lime juice dressings",
        "mild nước chấm",
        "coconut sauces",
      ],
      earth: [
        "tương đen",
        "peanut sauce",
        "fermented bean curd",
        "mắm nêm",
        "mắm ruốc",
      ],
      air: [
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
