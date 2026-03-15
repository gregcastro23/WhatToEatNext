// src/data/cuisines/indian.ts
import type { Cuisine } from "@/types/cuisine";

export const indian = {
  id: "indian",
  name: "Indian",
  description:
    "Traditional Indian cuisine spanning diverse regional specialties, spice blends, and cooking techniques",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Masala Dosa",
          "description": "A marvel of South Indian fermentation. A batter of rice and black lentils (urad dal) is fermented for 12+ hours to develop complex lactic acid tang and carbonation. When spread on a hot griddle, the proteins and starches Maillard-caramelize into a shatteringly crisp, paper-thin crepe that encases a soft, turmeric-stained potato mash.",
          "details": {
            "cuisine": "Indian (South)",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 30,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "parboiled rice",
              "notes": "Must be idli/dosa rice."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "whole skinless urad dal",
              "notes": "Black lentils."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "fenugreek seeds",
              "notes": "Aids in fermentation and color."
            },
            {
              "amount": 3,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Boiled and mashed for the masala filling."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "onion",
              "notes": "Sliced for the filling."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "mustard seeds",
              "notes": "For tempering."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "turmeric",
              "notes": "For color."
            },
            {
              "amount": 1,
              "unit": "sprig",
              "name": "curry leaves",
              "notes": "Essential aromatic."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "ghee or neutral oil",
              "notes": "For the griddle."
            }
          ],
          "instructions": [
            "Step 1: The Soak. Soak rice and dal separately with fenugreek for 6 hours.",
            "Step 2: The Grind. Grind dal into a fluffy paste, then grind rice into a slightly gritty paste. Combine.",
            "Step 3: The Fermentation. Add salt. Cover and ferment in a warm place for 12 hours until the batter doubles and smells sour.",
            "Step 4: The Masala. Sauté mustard seeds, curry leaves, onions, and turmeric. Add mashed potatoes and salt. Mix well. Set aside.",
            "Step 5: The Dosa. Heat a flat cast-iron griddle. Pour a ladle of batter in the center and spread in a thin spiral motion to the edges.",
            "Step 6: The Crisp. Drizzle ghee around the edges. Cook over medium-high until the bottom is deeply golden and crispy.",
            "Step 7: Assemble. Place a scoop of potato masala in the center. Fold the dosa over and serve immediately with coconut chutney and sambar."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "lunch",
              "dinner",
              "vegan"
            ],
            "cookingMethods": [
              "fermenting",
              "griddling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.25,
            "Water": 0.15,
            "Earth": 0.4,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Mercury",
              "Sun"
            ],
            "signs": [
              "Gemini",
              "Leo"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 9,
            "carbsG": 65,
            "fatG": 14,
            "fiberG": 6,
            "sodiumMg": 550,
            "sugarG": 2,
            "vitamins": [
              "Vitamin C",
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "urad dal",
              "substituteOptions": [
                "moong dal (milder)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Aloo Paratha",
          "description": "The quintessential North Indian breakfast. A whole wheat unleavened dough (atta) is used to encapsulate a heavily spiced, citrusy potato mash. The alchemy involves rolling the two layers together without tearing, ensuring the potato filling reaches the absolute edges of the bread.",
          "details": {
            "cuisine": "Indian (North)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "winter",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "whole wheat flour (atta)",
              "notes": "Must be finely milled Indian atta."
            },
            {
              "amount": 3,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Boiled, peeled, and mashed smooth."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "amchur (dried mango powder)",
              "notes": "Provides essential sourness."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "roasted cumin powder",
              "notes": "Warmth."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "garam masala",
              "notes": "Complexity."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "green chilies",
              "notes": "Finely minced."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "ghee or butter",
              "notes": "For roasting on the tawa."
            }
          ],
          "instructions": [
            "Step 1: The Dough. Mix flour, water, and a pinch of salt. Knead into a soft, elastic dough. Rest for 20 minutes.",
            "Step 2: The Filling. Mix mashed potatoes with amchur, cumin, garam masala, chilies, cilantro, and salt. It must be completely smooth.",
            "Step 3: The Stuffing. Take a ball of dough, flatten it. Place a ball of potato filling in the center. Pinch the edges of the dough over the filling to seal it completely.",
            "Step 4: The Roll. Flatten the stuffed ball. Gently roll it out into an 8-inch circle. If the dough tears, use a little dry flour to seal.",
            "Step 5: The Roast. Heat a tawa or skillet. Cook the paratha for 1 minute per side until brown spots appear. Apply ghee generously to both sides and fry until crispy and golden.",
            "Step 6: Serve hot with a massive knob of white butter and spicy mango pickle."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "lunch",
              "vegetarian"
            ],
            "cookingMethods": [
              "kneading",
              "griddling"
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
              "Earth",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 8,
            "carbsG": 62,
            "fatG": 18,
            "fiberG": 8,
            "sodiumMg": 480,
            "sugarG": 2,
            "vitamins": [
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "atta",
              "substituteOptions": [
                "whole wheat pastry flour"
              ]
            },
            {
              "originalIngredient": "ghee",
              "substituteOptions": [
                "neutral oil (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Idli Sambar",
          "description": "A paradigm of South Indian health and fermentation. Idlis are feather-light, steamed fermented cakes of rice and dal, engineered for maximum digestibility. They are paired with Sambar, a complex, tamarind-based vegetable and lentil stew characterized by a unique toasted spice profile.",
          "details": {
            "cuisine": "Indian (South)",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "idli rice",
              "notes": "Short grain, parboiled."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "split skinless urad dal",
              "notes": "Fermentation engine."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "toor dal (pigeon peas)",
              "notes": "For the sambar base."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sambar powder",
              "notes": "Toasted and ground coriander, fenugreek, and chilies."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tamarind paste",
              "notes": "Provides the essential tartness."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "mixed vegetables",
              "notes": "Drumstick, carrot, pumpkin, pearl onions."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "mustard seeds",
              "notes": "For tempering."
            },
            {
              "amount": 1,
              "unit": "sprig",
              "name": "curry leaves",
              "notes": "Essential."
            }
          ],
          "instructions": [
            "Step 1: Ferment the Idlis. (Same as Dosa, but grind dal very fluffy and rice into a coarse semolina texture). Steam in idli molds for 10-12 minutes.",
            "Step 2: Cook the lentils. Pressure cook toor dal with turmeric and water until mushy.",
            "Step 3: The Sambar Base. Boil the mixed vegetables in tamarind water with sambar powder and salt until tender.",
            "Step 4: Combine. Add the cooked, mashed dal to the vegetable broth. Simmer for 10 minutes to meld flavors.",
            "Step 5: The Tadka (Tempering). Heat oil, crackle mustard seeds, add dried red chilies and curry leaves. Pour this hot mixture into the sambar. Cover immediately to trap the aromatics.",
            "Step 6: Serve the soft idlis submerged in the hot sambar."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "fermenting",
              "steaming",
              "boiling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.4,
            "Earth": 0.25,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Jupiter"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 16,
            "carbsG": 62,
            "fatG": 6,
            "fiberG": 12,
            "sodiumMg": 650,
            "sugarG": 4,
            "vitamins": [
              "Folate",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "idli rice",
              "substituteOptions": [
                "quinoa (for a modern high-protein version)"
              ]
            }
          ]
        },
      ],
      summer: [
        {
          "name": "Authentic Poha (Spiced Flattened Rice)",
          "description": "A rapid, light breakfast from Maharashtra. It utilizes flattened parboiled rice (poha) which requires zero boiling; it is hydrated by a brief rinse and then steamed in its own residual moisture alongside a turmeric and mustard seed tempering.",
          "details": {
            "cuisine": "Indian (West)",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 10,
            "baseServingSize": 2,
            "spiceLevel": "Mild-Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "thick flattened rice (poha)",
              "notes": "Must be the thick variety; thin poha will turn to mush."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "onion",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "potato",
              "notes": "Diced into very small 1/4-inch cubes."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "peanuts",
              "notes": "Raw."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "mustard seeds",
              "notes": "For tempering."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "turmeric",
              "notes": "For the brilliant yellow color."
            },
            {
              "amount": 1,
              "unit": "sprig",
              "name": "curry leaves",
              "notes": "Essential."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "lemon juice",
              "notes": "Freshly squeezed."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sugar",
              "notes": "To balance the acidity."
            }
          ],
          "instructions": [
            "Step 1: The Rinse. Place poha in a colander. Rinse under cold water for 30 seconds. Drain and let it sit. Do not soak. It should become soft but remain as individual grains.",
            "Step 2: Tempering. Heat oil in a skillet. Fry peanuts until golden. Add mustard seeds until they pop. Add curry leaves and chilies.",
            "Step 3: Sauté. Add the tiny potato cubes and fry until tender. Add the onions and sauté until translucent.",
            "Step 4: The Color. Stir in the turmeric, salt, and sugar.",
            "Step 5: Combine. Add the hydrated poha to the skillet. Toss gently with a spatula. Cover and cook on the lowest heat for 2 minutes to steam through.",
            "Step 6: Finish. Turn off heat. Stir in the lemon juice and garnish heavily with fresh cilantro and sev (crispy chickpea noodles)."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "steaming",
              "tempering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.15,
            "Earth": 0.45,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Mercury",
              "Earth"
            ],
            "signs": [
              "Virgo",
              "Gemini"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 310,
            "proteinG": 6,
            "carbsG": 55,
            "fatG": 10,
            "fiberG": 4,
            "sodiumMg": 380,
            "sugarG": 6,
            "vitamins": [
              "Vitamin C",
              "B1"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "flattened rice",
              "substituteOptions": [
                "quinoa flakes"
              ]
            }
          ]
        },
      ],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Dal Tadka",
          "description": "A foundational study in pulse preparation and aromatic layering. Yellow lentils are boiled to a smooth, creamy puree, then finished with a 'tadka' (tempering) of whole spices and aromatics sizzled in ghee, which is poured over the dal just before serving to preserve the volatile oils.",
          "details": {
            "cuisine": "Indian",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 30,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "yellow lentils (Toor Dal or Moong Dal)",
              "notes": "Rinsed well."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "turmeric",
              "notes": "Added during boiling."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "ghee",
              "notes": "For the tempering. Essential for authentic flavor."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "cumin seeds",
              "notes": "Whole."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Finely minced."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "dried red chilies",
              "notes": "For the tadka."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "Kashmiri red chili powder",
              "notes": "For the vibrant red oil color."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "asafoetida (hing)",
              "notes": "Aids digestion and adds umami funk."
            }
          ],
          "instructions": [
            "Step 1: Boil. Pressure cook or boil the lentils with turmeric and salt until they are completely soft and mushy. Whisk until smooth.",
            "Step 2: Simmer. Adjust consistency with water and simmer gently while you prepare the tempering.",
            "Step 3: The Tadka. In a small pan, heat the ghee until smoking. Add the cumin seeds; they should sizzle instantly. Add the dried red chilies and garlic. Fry until garlic is golden.",
            "Step 4: The Color. Turn off the heat. Immediately stir in the red chili powder and hing (this prevent them from burning).",
            "Step 5: The Infusion. Pour the hot, sizzling tadka directly into the simmering dal. Cover the pot immediately for 2 minutes to trap the smoke and aromatics. Garnish with cilantro."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "vegetarian"
            ],
            "cookingMethods": [
              "boiling",
              "tempering"
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
              "Sun",
              "Mars"
            ],
            "signs": [
              "Leo",
              "Aries"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 280,
            "proteinG": 14,
            "carbsG": 35,
            "fatG": 12,
            "fiberG": 10,
            "sodiumMg": 450,
            "sugarG": 2,
            "vitamins": [
              "Folate",
              "Vitamin B1"
            ],
            "minerals": [
              "Iron",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "ghee",
              "substituteOptions": [
                "coconut oil (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Gujarati Kadhi",
          "description": "A brilliant exercise in dairy stabilization. This sweet-and-sour soup utilizes buttermilk or thinned yogurt stabilized with chickpea flour (besan), preventing it from curdling when boiled. It is characterized by its thin, silky consistency and the aggressive use of ginger, green chilies, and jaggery.",
          "details": {
            "cuisine": "Indian (Gujarat)",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "sour buttermilk or whisked yogurt",
              "notes": "Must be sour for the authentic profile."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "besan (chickpea flour)",
              "notes": "The stabilizer."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "jaggery or sugar",
              "notes": "Gujarati cuisine is defined by its subtle sweetness."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ginger-green chili paste",
              "notes": "Crushed."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "mustard seeds",
              "notes": "For tempering."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "cumin seeds",
              "notes": "For tempering."
            },
            {
              "amount": 1,
              "unit": "stick",
              "name": "cinnamon",
              "notes": "For tempering."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "cloves",
              "notes": "For tempering."
            }
          ],
          "instructions": [
            "Step 1: The Mix. In a large bowl, whisk the yogurt/buttermilk, besan, and 2 cups of water until perfectly smooth with no lumps.",
            "Step 2: The Simmer. Pour the mixture into a pot. Add jaggery, ginger-chili paste, and salt. Bring to a gentle boil, stirring constantly. Once it boils, it won't curdle. Simmer for 10 minutes.",
            "Step 3: The Tadka. Heat ghee. Crackle mustard and cumin seeds. Add cinnamon, cloves, dried red chilies, and curry leaves.",
            "Step 4: Combine. Pour the tadka into the boiling kadhi. Garnish with cilantro and serve with khichdi or rice."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "soup",
              "vegetarian"
            ],
            "cookingMethods": [
              "whisking",
              "boiling",
              "tempering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.5,
            "Earth": 0.2,
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
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 180,
            "proteinG": 8,
            "carbsG": 22,
            "fatG": 8,
            "fiberG": 2,
            "sodiumMg": 520,
            "sugarG": 12,
            "vitamins": [
              "Vitamin B12",
              "Riboflavin"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "yogurt",
              "substituteOptions": [
                "coconut yogurt (vegan, but adjust cooking time)"
              ]
            }
          ]
        },
      ],
      winter: [
        {
          "name": "Authentic Dal Makhani",
          "description": "The king of North Indian dal. The alchemy relies on extreme prolonged slow-cooking (traditionally overnight on dying coals) of whole black lentils (urad) and kidney beans. The friction of the long simmer breaks down the dal's structure into a naturally creamy emulsion, which is then further enriched with butter and cream.",
          "details": {
            "cuisine": "Indian (Punjabi)",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 360,
            "baseServingSize": 6,
            "spiceLevel": "Mild-Medium",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "whole black gram (urad dal)",
              "notes": "Must be whole, with skin. Soaked overnight."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "red kidney beans (rajma)",
              "notes": "Soaked overnight."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "unsalted butter",
              "notes": "Makhani means 'buttery'."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "heavy cream",
              "notes": "For the finishing richness."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "tomato puree",
              "notes": "Fresh or canned."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ginger-garlic paste",
              "notes": "Crushed."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "Kashmiri red chili powder",
              "notes": "For the deep red color."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "kasuri methi (dried fenugreek leaves)",
              "notes": "Crucial finishing aromatic."
            }
          ],
          "instructions": [
            "Step 1: The Boil. Pressure cook or boil the soaked dal and rajma with 5 cups of water and salt until tender. Do not drain.",
            "Step 2: The Mash. Use a heavy spoon to mash about 20% of the dal against the side of the pot. This releases the internal starches to thicken the gravy.",
            "Step 3: The Base. In a separate pan, sauté ginger-garlic paste in 2 tbsp butter. Add tomato puree and chili powder. Cook until the oil separates.",
            "Step 4: The Long Simmer. Combine the tomato base with the dal. Add 2 cups of hot water. Simmer on the absolute lowest heat for at least 2 hours (the longer the better). Stir frequently to prevent sticking.",
            "Step 5: Enrich. Stir in the remaining butter and the heavy cream. Add the crushed kasuri methi.",
            "Step 6: The Dhungar (Optional). Place a piece of lit charcoal in a small metal bowl inside the dal pot. Pour a drop of ghee on the coal and cover the pot for 5 minutes to infuse a smoky flavor.",
            "Step 7: Serve hot with Garlic Naan."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "vegetarian",
              "celebration"
            ],
            "cookingMethods": [
              "boiling",
              "mashing",
              "simmering",
              "smoking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.25,
            "Earth": 0.5,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn",
              "Jupiter"
            ],
            "signs": [
              "Capricorn",
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 550,
            "proteinG": 18,
            "carbsG": 42,
            "fatG": 38,
            "fiberG": 14,
            "sodiumMg": 680,
            "sugarG": 4,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Magnesium",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "heavy cream",
              "substituteOptions": [
                "cashew cream (vegan)"
              ]
            }
          ]
        },
      ],
    },
    dinner: {
      all: [
        {
          "name": "Authentic Butter Chicken (Murgh Makhani)",
          "description": "The masterpiece of Punjabi restaurant cuisine. The alchemy involves a two-stage process: first, chicken is yogurt-marinated and charred in a tandoor (Fire), then submerged in a 'Makhani' sauce—a velvet emulsion of tomatoes, butter, and cream, stabilized with pureed cashews.",
          "details": {
            "cuisine": "Indian (Delhi)",
            "prepTimeMinutes": 240,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "Mild",
            "season": [
              "winter",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 800,
              "unit": "g",
              "name": "boneless chicken thighs",
              "notes": "Tandoori charred or pan-seared."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "Greek yogurt",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ginger-garlic paste",
              "notes": "For the marinade."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "tomato passata",
              "notes": "Smooth puree."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Essential."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "heavy cream",
              "notes": "For finishing."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "cashew paste",
              "notes": "Raw cashews soaked and ground. Thickens and stabilizes the sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "honey or sugar",
              "notes": "To balance tomato acidity."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "kasuri methi",
              "notes": "Dried fenugreek leaves. The signature aroma."
            }
          ],
          "instructions": [
            "Step 1: Marinate. Mix chicken with yogurt, ginger-garlic paste, chili powder, and salt. Refrigerate for at least 4 hours.",
            "Step 2: The Char. Grill the chicken at high heat until charred on the outside but slightly undercooked inside. Set aside.",
            "Step 3: The Sauce. Simmer tomato passata with a little water for 15 minutes. Add the cashew paste and honey.",
            "Step 4: The Emulsion. Whisk in the cold butter cubes one by one into the simmering sauce. Stir in the heavy cream.",
            "Step 5: Combine. Add the charred chicken pieces to the sauce. Simmer for 10 minutes until chicken is cooked through.",
            "Step 6: Finish. Crush kasuri methi between your palms and stir it in. Serve with Naan."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "celebration"
            ],
            "cookingMethods": [
              "marinating",
              "grilling",
              "emulsifying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.3,
            "Water": 0.3,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Leo"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 620,
            "proteinG": 42,
            "carbsG": 15,
            "fatG": 48,
            "fiberG": 2,
            "sodiumMg": 850,
            "sugarG": 10,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "chicken",
              "substituteOptions": [
                "paneer (Paneer Makhani)",
                "roasted cauliflower (vegan, use cashew/coconut cream)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Hyderabadi Biryani",
          "description": "The 'Kacchi' method of biryani construction. Raw, marinated meat is layered with 70% cooked long-grain basmati rice in a heavy pot, sealed with a flour dough (Dum), and cooked over slow heat. The meat steams in its own juices while the rice absorbs the rising aromatic steam, creating a perfect vertical stratification of flavor.",
          "details": {
            "cuisine": "Indian (Hyderabad)",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 60,
            "baseServingSize": 6,
            "spiceLevel": "Hot",
            "season": [
              "all",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "goat meat or chicken",
              "notes": "Bone-in chunks."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "extra-long grain basmati rice",
              "notes": "Must be high-quality aged rice."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "fried onions (birista)",
              "notes": "Thinly sliced and deep-fried until dark brown."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "Greek yogurt",
              "notes": "For the meat marinade."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "ginger-garlic paste",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "shahi jeera (black cumin)",
              "notes": "For the rice and marinade."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "saffron threads",
              "notes": "Soaked in 1/4 cup warm milk."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh mint and cilantro",
              "notes": "Chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "ghee",
              "notes": "For layering."
            }
          ],
          "instructions": [
            "Step 1: Marinate (Raw). Mix raw meat with yogurt, ginger-garlic paste, birista, mint, cilantro, salt, and spices. Marinate for at least 4 hours (overnight for goat).",
            "Step 2: Parboil Rice. Boil rice in salted water with whole spices until only 70% cooked (grain should have a firm core). Drain.",
            "Step 3: Layering. In a heavy bottomed pot, layer the raw marinated meat at the bottom. Spread the parboiled rice over the meat.",
            "Step 4: Garnish. Drizzle saffron milk and ghee over the rice. Add more mint and birista.",
            "Step 5: The Dum (Seal). Seal the pot lid with a long rope of dough (wheat flour and water).",
            "Step 6: Cook. Cook on high for 15 mins, then place the pot on a tawa (griddle) and cook on lowest heat for 45 mins. The steam trapped inside is the alchemy.",
            "Step 7: Serve. Break the seal. Scoop from the bottom to get both meat and fragrant rice. Serve with Salan and Raita."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "celebration"
            ],
            "cookingMethods": [
              "marinating",
              "steaming",
              "dum-cooking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.15,
            "Earth": 0.35,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Jupiter",
              "Mars"
            ],
            "signs": [
              "Sagittarius",
              "Leo"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 750,
            "proteinG": 38,
            "carbsG": 85,
            "fatG": 32,
            "fiberG": 4,
            "sodiumMg": 950,
            "sugarG": 4,
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
              "originalIngredient": "goat meat",
              "substituteOptions": [
                "chicken",
                "mixed vegetables (for Veg Biryani - requires pre-cooking the veg slightly)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Palak Paneer",
          "description": "A refined North Indian classic. Fresh spinach is blanched and rapidly cooled to preserve its vibrant green color (chlorophyll protection), then pureed and simmered with a delicate tempering of ginger, garlic, and cumin, providing a verdant, silky bed for cubes of fresh paneer cheese.",
          "details": {
            "cuisine": "Indian (Punjabi)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "Mild-Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "fresh spinach",
              "notes": "Washed and stems removed."
            },
            {
              "amount": 250,
              "unit": "g",
              "name": "paneer cheese",
              "notes": "Cut into 1-inch cubes. Pan-fried if desired."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "onion",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ginger-garlic paste",
              "notes": "Crushed."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "green chilies",
              "notes": "Slit."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "heavy cream",
              "notes": "For the silky finish."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "cumin seeds",
              "notes": "For tempering."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "garam masala",
              "notes": "Added at the end."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "butter or ghee",
              "notes": "For sautéing."
            }
          ],
          "instructions": [
            "Step 1: Blanch. Boil spinach in water for 2 mins. Immediately plunge into an ice bath. Drain and puree until smooth with green chilies.",
            "Step 2: Sauté. Heat ghee. Sizzle cumin seeds. Add onions and sauté until translucent. Add ginger-garlic paste and fry for 1 min.",
            "Step 3: The Green. Pour in the spinach puree. Add a little water if too thick. Simmer for 5 mins. Season with salt.",
            "Step 4: The Cheese. Gently fold in the paneer cubes. Simmer for 2 mins.",
            "Step 5: Finish. Stir in garam masala and heavy cream. Remove from heat immediately to keep the color bright green."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "lunch",
              "vegetarian"
            ],
            "cookingMethods": [
              "blanching",
              "simmering"
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
              "Taurus",
              "Cancer"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 18,
            "carbsG": 12,
            "fatG": 24,
            "fiberG": 6,
            "sodiumMg": 450,
            "sugarG": 2,
            "vitamins": [
              "Vitamin K",
              "Vitamin A",
              "Folate"
            ],
            "minerals": [
              "Calcium",
              "Iron",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "paneer",
              "substituteOptions": [
                "tofu cubes (vegan)",
                "halloumi (saltier)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Chole Bhature",
          "description": "The ultimate Punjabi street food duo. Chole is a dark, intensely spiced chickpea curry (dyed with black tea), paired with Bhature—large, fermented, deep-fried leavened bread that puffs into a golden balloon.",
          "details": {
            "cuisine": "Indian (Punjabi)",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 60,
            "baseServingSize": 4,
            "spiceLevel": "Hot",
            "season": [
              "winter",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "dried chickpeas (kabuli chana)",
              "notes": "Soaked overnight with a black tea bag for color."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "all-purpose flour (maida)",
              "notes": "For the bhature."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "yogurt",
              "notes": "For the bhature dough fermentation."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "baking powder",
              "notes": "For the bhature lift."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "anardana powder (dried pomegranate seeds)",
              "notes": "The secret to the authentic sourness of Chole."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ginger-garlic paste",
              "notes": "For the curry."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "tomatoes",
              "notes": "Pureed."
            }
          ],
          "instructions": [
            "Step 1: Boil Chana. Pressure cook soaked chickpeas with a tea bag, salt, and water until tender. Discard tea bag.",
            "Step 2: Bhature Dough. Mix flour, yogurt, baking powder, sugar, salt, and oil. Knead into a soft dough. Let ferment for 4-6 hours.",
            "Step 3: Chole Base. Sauté onions, ginger-garlic paste, and tomato puree. Add Chole Masala and anardana powder. Fry until oil separates.",
            "Step 4: Combine. Add chickpeas to the base with some of their cooking water. Simmer until the gravy is thick and dark.",
            "Step 5: Fry Bhature. Roll dough into large ovals. Deep fry in very hot oil. Press down with a slotted spoon so they puff up like balloons.",
            "Step 6: Serve hot with pickled onions and green chilies."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "brunch",
              "street food",
              "vegetarian"
            ],
            "cookingMethods": [
              "fermenting",
              "boiling",
              "deep-frying"
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
              "Mars",
              "Jupiter"
            ],
            "signs": [
              "Aries",
              "Sagittarius"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 680,
            "proteinG": 18,
            "carbsG": 85,
            "fatG": 32,
            "fiberG": 12,
            "sodiumMg": 850,
            "sugarG": 4,
            "vitamins": [
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "yogurt (bhature)",
              "substituteOptions": [
                "lemon juice and warm water (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Malai Kofta",
          "description": "The peak of Mughlai luxury. Deep-fried dumplings (koftas) made of paneer and potato are submerged in a 'Malai' sauce—a rich, creamy, and slightly sweet onion-cashew gravy scented with saffron and cardamom.",
          "details": {
            "cuisine": "Indian (Mughlai)",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 30,
            "baseServingSize": 4,
            "spiceLevel": "Mild",
            "season": [
              "winter",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 250,
              "unit": "g",
              "name": "paneer",
              "notes": "Grated."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Boiled and mashed."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "raisins and cashews",
              "notes": "Finely chopped, for the kofta center."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "cashew paste",
              "notes": "For the gravy base."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "heavy cream",
              "notes": "For the finishing touch."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "onion-tomato puree",
              "notes": "Boiled and ground for a smooth white/gold gravy."
            }
          ],
          "instructions": [
            "Step 1: Make Koftas. Mix paneer, potato, cornstarch, and salt. Form into balls, stuffing the center with chopped raisins/nuts. Deep fry until golden.",
            "Step 2: The Gravy. Sauté whole spices (cardamom, cinnamon). Add the boiled onion-tomato-cashew paste. Simmer until the sauce is velvety.",
            "Step 3: Season. Add salt, a pinch of sugar, and crushed kasuri methi.",
            "Step 4: Finish. Stir in the heavy cream.",
            "Step 5: Assemble. Place the hot koftas in a serving dish and pour the gravy over them right before serving. (If you simmer them in the gravy, they will disintegrate)."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "celebration",
              "vegetarian"
            ],
            "cookingMethods": [
              "deep-frying",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.35,
            "Earth": 0.35,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus",
              "Moon"
            ],
            "signs": [
              "Libra",
              "Cancer"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 550,
            "proteinG": 14,
            "carbsG": 35,
            "fatG": 42,
            "fiberG": 4,
            "sodiumMg": 520,
            "sugarG": 12,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "paneer",
              "substituteOptions": [
                "extra firm tofu (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Pani Puri (Golgappa)",
          "description": "The quintessential Indian street food experience. It is an interactive study in flavor and texture explosion: a fragile, crispy semolina sphere (puri) is filled with a cooling potato-chickpea mash and submerged in a 'Pani'—a violently tart, spicy, and herbaceous mint water.",
          "details": {
            "cuisine": "Indian",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "Hot",
            "season": [
              "summer",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 24,
              "unit": "whole",
              "name": "crispy puris",
              "notes": "Made from semolina and flour."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "fresh mint leaves",
              "notes": "For the spicy water."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh cilantro",
              "notes": "For the spicy water."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tamarind paste",
              "notes": "For the sweet-sour balance."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "chaat masala",
              "notes": "Essential for the 'zing'."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kala namak (black salt)",
              "notes": "Essential for the authentic sulfuric umami."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Boiled and mashed for the filling."
            }
          ],
          "instructions": [
            "Step 1: The Pani. Blend mint, cilantro, green chilies, and ginger with a little water. Strain into a large jug. Add 4 cups of chilled water, tamarind, chaat masala, and black salt. Refrigerate.",
            "Step 2: The Filling. Mix mashed potatoes with boiled chickpeas, chili powder, and cumin powder.",
            "Step 3: The Ritual. Gently crack the top of a puri with your thumb. Stuff with a little filling. Dip the entire puri into the chilled spicy water. Consume in one single bite to experience the flavor explosion."
          ],
          "classifications": {
            "mealType": [
              "snack",
              "street food",
              "vegan"
            ],
            "cookingMethods": [
              "blending",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.4,
            "Earth": 0.1,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Mercury"
            ],
            "signs": [
              "Aries",
              "Gemini"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 250,
            "proteinG": 6,
            "carbsG": 45,
            "fatG": 8,
            "fiberG": 6,
            "sodiumMg": 950,
            "sugarG": 8,
            "vitamins": [
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "puris",
              "substituteOptions": [
                "no direct substitute"
              ]
            }
          ]
        },
        {
          "name": "Authentic Baingan Bharta",
          "description": "A rustic North Indian dish where the alchemy relies on the direct fire charring of a large eggplant. The skin is carbonized to infuse the flesh with a profound smokiness, then mashed and sautéed with aromatics to create a dense, earthy, and sweet-savory vegetable mash.",
          "details": {
            "cuisine": "Indian (Punjabi)",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 30,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "autumn",
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "large",
              "name": "globe eggplant",
              "notes": "Roasted over an open flame until collapsed."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "onions",
              "notes": "Finely chopped."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "tomatoes",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ginger-garlic paste",
              "notes": "Crushed."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "cumin seeds",
              "notes": "For tempering."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "red chili powder",
              "notes": "Adjust for heat."
            }
          ],
          "instructions": [
            "Step 1: The Char. Prick eggplant. Roast directly on gas burner until skin is charred and flesh is soft. Steam in a bowl for 10 mins. Peel and mash flesh.",
            "Step 2: Sauté. Heat oil. Crackle cumin. Sauté onions until golden. Add ginger-garlic paste and fry for 1 min.",
            "Step 3: The Base. Add tomatoes and spices. Cook until tomatoes turn mushy and oil separates.",
            "Step 4: Combine. Stir in the smoky mashed eggplant. Cook for 10 minutes on low heat to meld flavors.",
            "Step 5: Finish. Garnish with fresh cilantro and serve with hot Phulkas (rotis)."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "charring",
              "sautéing",
              "mashing"
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
              "Scorpio",
              "Capricorn"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 180,
            "proteinG": 4,
            "carbsG": 22,
            "fatG": 10,
            "fiberG": 8,
            "sodiumMg": 350,
            "sugarG": 8,
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
              "originalIngredient": "eggplant",
              "substituteOptions": [
                "no substitute for this specific smoky profile"
              ]
            }
          ]
        },
            {
              "name": "Authentic Rogan Josh",
              "description": "The crown jewel of Kashmiri cuisine. Tender lamb is slow-braised in a vibrant red sauce, flavored not with tomatoes, but with the essence of dried cockscomb flowers (Ratan Jot) and an intense aromatic matrix of fennel and ginger.",
              "details": {
                "cuisine": "Indian (Kashmiri)",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 120,
                "baseServingSize": 4,
                "spiceLevel": "Medium",
                "season": [
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "lbs",
                  "name": "Lamb shoulder",
                  "notes": "Bone-in, cut into chunks."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Yogurt",
                  "notes": "Whisked, room temperature."
                },
                {
                  "amount": 3,
                  "unit": "tbsp",
                  "name": "Kashmiri red chili powder",
                  "notes": "For vibrant color without extreme heat."
                },
                {
                  "amount": 2,
                  "unit": "tsp",
                  "name": "Fennel powder",
                  "notes": "Primary aromatic."
                },
                {
                  "amount": 1,
                  "unit": "tsp",
                  "name": "Ginger powder",
                  "notes": "Sun-dried ginger (Sonth)."
                },
                {
                  "amount": 1,
                  "unit": "pinch",
                  "name": "Asafoetida (Hing)",
                  "notes": "Essential for Kashmiri Pandit style."
                },
                {
                  "amount": 4,
                  "unit": "tbsp",
                  "name": "Mustard oil",
                  "notes": "Heated to smoking point to remove bitterness."
                }
              ],
              "instructions": [
                "Step 1: The Oil Prep. Heat mustard oil in a heavy pot until it smokes. Turn off heat, let it cool slightly, then return to medium heat. This removes the harsh raw sulfur smell.",
                "Step 2: The Searing. Add whole spices (cardamom, cloves, bay leaf) and then the lamb chunks. Sear aggressively until deeply browned.",
                "Step 3: The Red Matrix. Whisk the chili powder, fennel, and ginger powder into the yogurt. Pour this mixture over the meat.",
                "Step 4: The Slow Braise. Reduce heat to low. Cover and cook for 1.5 to 2 hours. The meat must cook in its own juices and the yogurt moisture. Do not add water.",
                "Step 5: The Bloom. The dish is ready when the oil (the 'Rogan') separates and floats to the top, reflecting a deep, jewel-like red color. Serve with steamed basmati rice."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "braising",
                  "searing"
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
                  "Mars",
                  "Sun"
                ],
                "signs": [
                  "aries",
                  "scorpio"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 580,
                "proteinG": 45,
                "carbsG": 8,
                "fatG": 42,
                "fiberG": 2,
                "sodiumMg": 850,
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
              "substitutions": [
                {
                  "originalIngredient": "Lamb shoulder",
                  "substituteOptions": [
                    "Goat meat",
                    "Beef chuck"
                  ]
                }
              ]
            },
            {
              "name": "Authentic Pav Bhaji",
              "description": "The kinetic pulse of Mumbai street food. A thick, spicy vegetable mash (bhaji) is violently crushed on a flat iron griddle, incorporating massive amounts of butter, served with soft, ghee-toasted bread rolls (pav).",
              "details": {
                "cuisine": "Indian (Street)",
                "prepTimeMinutes": 15,
                "cookTimeMinutes": 25,
                "baseServingSize": 4,
                "spiceLevel": "High",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "Mixed vegetables",
                  "notes": "Potatoes, cauliflower, peas, carrots - boiled."
                },
                {
                  "amount": 3,
                  "unit": "large",
                  "name": "Tomatoes",
                  "notes": "Finely chopped."
                },
                {
                  "amount": 1,
                  "unit": "large",
                  "name": "Green bell pepper",
                  "notes": "Finely diced."
                },
                {
                  "amount": 4,
                  "unit": "tbsp",
                  "name": "Pav Bhaji Masala",
                  "notes": "Concentrated spice blend."
                },
                {
                  "amount": 100,
                  "unit": "g",
                  "name": "Salted butter",
                  "notes": "Amul brand is traditional; used at every stage."
                },
                {
                  "amount": 8,
                  "unit": "whole",
                  "name": "Pav rolls",
                  "notes": "Soft white bread rolls."
                }
              ],
              "instructions": [
                "Step 1: The Base Sauté. On a large flat griddle (tawa) or wide pan, sauté onions and bell peppers in a massive knob of butter.",
                "Step 2: The Red Acid. Add tomatoes and cook until they collapse into a pulp. Stir in the Pav Bhaji masala and salt.",
                "Step 3: The Mash. Add the boiled mixed vegetables. Using a flat potato masher, violently crush and mix the vegetables into the tomato-butter matrix directly on the griddle.",
                "Step 4: The Hydration. Add a splash of hot water if the mash is too dry. It should be thick but flowing. Add more butter. Let it sizzle and emulsify.",
                "Step 5: The Toast. Slice the pav rolls horizontally. Toast them on the same griddle with butter and a pinch of spice until golden. Serve the bubbling bhaji with raw onions, lime wedges, and extra butter."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "dinner",
                  "snack"
                ],
                "cookingMethods": [
                  "mashing",
                  "griddling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.4,
                "Water": 0.15,
                "Earth": 0.35,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Sun",
                  "Mars"
                ],
                "signs": [
                  "leo",
                  "aries"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 480,
                "proteinG": 12,
                "carbsG": 65,
                "fatG": 28,
                "fiberG": 10,
                "sodiumMg": 1100,
                "sugarG": 12,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin A"
                ],
                "minerals": [
                  "Potassium",
                  "Iron"
                ]
              },
              "substitutions": [
                {
                  "originalIngredient": "Butter",
                  "substituteOptions": [
                    "Vegan butter (for vegan option)"
                  ]
                }
              ]
            },
            {
              "name": "Authentic Prawn Gassi",
              "description": "A coastal masterpiece from Mangalore. Fresh prawns are submerged in a fiercely orange coconut curry, characterized by the sharp, fruity acidity of tamarind and the deep warmth of roasted Bydagi chilies.",
              "details": {
                "cuisine": "Indian (Mangalorean)",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 15,
                "baseServingSize": 2,
                "spiceLevel": "High",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Tiger prawns",
                  "notes": "Peeled and deveined."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Fresh grated coconut",
                  "notes": "For the ground paste."
                },
                {
                  "amount": 6,
                  "unit": "whole",
                  "name": "Bydagi chilies",
                  "notes": "Roasted until dark and smoky."
                },
                {
                  "amount": 1,
                  "unit": "tbsp",
                  "name": "Coriander seeds",
                  "notes": "Roasted."
                },
                {
                  "amount": 1,
                  "unit": "tsp",
                  "name": "Tamarind paste",
                  "notes": "For acidity."
                },
                {
                  "amount": 1,
                  "unit": "sprig",
                  "name": "Curry leaves",
                  "notes": "For tempering."
                },
                {
                  "amount": 2,
                  "unit": "tbsp",
                  "name": "Coconut oil",
                  "notes": "For authentic aroma."
                }
              ],
              "instructions": [
                "Step 1: The Gassi Paste. Grind the grated coconut, roasted chilies, coriander seeds, turmeric, and tamarind into an impossibly smooth, vibrant orange paste with a tiny splash of water.",
                "Step 2: The Sizzle. In a pan, heat coconut oil. Add mustard seeds and curry leaves. When they pop, add the coconut-chili paste.",
                "Step 3: The Simmer. Cook the paste for 5 minutes to remove the raw coconut smell. Add half a cup of water to create a thick, pourable curry.",
                "Step 4: The Poach. Add the fresh prawns to the bubbling curry. Cook for exactly 3-4 minutes. Do not overcook; the prawns must be snappy and tender.",
                "Step 5: The Finish. Serve hot with 'Kori Rotti' (crispy rice wafers) or steamed red rice."
              ],
              "classifications": {
                "mealType": [
                  "dinner",
                  "lunch"
                ],
                "cookingMethods": [
                  "simmering",
                  "grinding"
                ]
              },
              "elementalProperties": {
                "Fire": 0.45,
                "Water": 0.35,
                "Earth": 0.15,
                "Air": 0.05
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
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 380,
                "proteinG": 32,
                "carbsG": 12,
                "fatG": 24,
                "fiberG": 4,
                "sodiumMg": 950,
                "sugarG": 2,
                "vitamins": [
                  "Vitamin B12",
                  "Zinc"
                ],
                "minerals": [
                  "Selenium",
                  "Iron"
                ]
              },
              "substitutions": [
                {
                  "originalIngredient": "Prawns",
                  "substituteOptions": [
                    "Fish cubes",
                    "Chicken (for Kori Gassi)"
                  ]
                }
              ]
            },
            {
              "name": "Authentic Aloo Paratha",
              "description": "The heavy, structural breakfast of Punjab. A whole-wheat unleavened dough encapsulates a fiercely spiced potato mash, rolled out and griddled with ghee until the layers fuse and the exterior develops golden brown leopard spots.",
              "details": {
                "cuisine": "Indian (Punjabi)",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 10,
                "baseServingSize": 2,
                "spiceLevel": "Medium",
                "season": [
                  "winter",
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "Atta (Durum whole wheat flour)",
                  "notes": "For the dough."
                },
                {
                  "amount": 2,
                  "unit": "large",
                  "name": "Potatoes",
                  "notes": "Boiled and mashed smooth."
                },
                {
                  "amount": 1,
                  "unit": "tsp",
                  "name": "Amchur (Dried mango powder)",
                  "notes": "Essential for sourness."
                },
                {
                  "amount": 1,
                  "unit": "tsp",
                  "name": "Ajwain (Carom seeds)",
                  "notes": "For digestion and aroma."
                },
                {
                  "amount": 2,
                  "unit": "tbsp",
                  "name": "Fresh cilantro",
                  "notes": "Finely chopped."
                },
                {
                  "amount": 4,
                  "unit": "tbsp",
                  "name": "Ghee",
                  "notes": "For griddling."
                }
              ],
              "instructions": [
                "Step 1: The Dough. Knead the atta with water and a pinch of salt until it is soft and elastic. Let it rest for 20 minutes.",
                "Step 2: The Stuffing. Mix the mashed potatoes with amchur, ajwain, chopped green chilies, cilantro, and salt. Ensure there are no lumps.",
                "Step 3: The Enclosure. Take a ball of dough, flatten it, and place a slightly smaller ball of potato stuffing in the center. Pleat the edges together to seal it completely.",
                "Step 4: The Roll. Gently roll out the stuffed ball into a flat disc. Be careful not to rupture the dough and leak the stuffing.",
                "Step 5: The Fire. Place on a hot tawa (griddle). Cook one side for 30 seconds, flip, and apply a teaspoon of ghee. Flip again and apply ghee. Press down with a spatula until both sides are crisp and golden brown. Serve with a massive dollop of white butter and mango pickle."
              ],
              "classifications": {
                "mealType": [
                  "breakfast",
                  "brunch"
                ],
                "cookingMethods": [
                  "kneading",
                  "griddling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.25,
                "Water": 0.1,
                "Earth": 0.55,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Saturn",
                  "Jupiter"
                ],
                "signs": [
                  "capricorn",
                  "taurus"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 450,
                "proteinG": 10,
                "carbsG": 62,
                "fatG": 22,
                "fiberG": 8,
                "sodiumMg": 650,
                "sugarG": 2,
                "vitamins": [
                  "Vitamin B6",
                  "Niacin"
                ],
                "minerals": [
                  "Magnesium",
                  "Iron"
                ]
              },
              "substitutions": [
                {
                  "originalIngredient": "Atta",
                  "substituteOptions": [
                    "Standard whole wheat flour"
                  ]
                }
              ]
            },
            {
              "name": "Authentic Gulab Jamun",
              "description": "The alchemical transformation of milk solids into crystalline luxury. 'Khoya' (reduced milk) is shaped into spheres, deep-fried to a dark mahogany brown, and then submerged in a hot cardamom-rose syrup until they swell into sponges of pure sweetness.",
              "details": {
                "cuisine": "Indian (Dessert)",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 30,
                "baseServingSize": 6,
                "spiceLevel": "None",
                "season": [
                  "celebration"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Khoya (Mawa)",
                  "notes": "Full-fat milk solids."
                },
                {
                  "amount": 2,
                  "unit": "tbsp",
                  "name": "Chenna (Fresh paneer)",
                  "notes": "Crumbled, for texture."
                },
                {
                  "amount": 0.25,
                  "unit": "cup",
                  "name": "All-purpose flour",
                  "notes": "For binding."
                },
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "Sugar",
                  "notes": "For the syrup."
                },
                {
                  "amount": 1,
                  "unit": "pinch",
                  "name": "Saffron and Cardamom",
                  "notes": "For the syrup."
                },
                {
                  "amount": 4,
                  "unit": "cups",
                  "name": "Ghee",
                  "notes": "For deep frying (traditionally preferred over oil)."
                }
              ],
              "instructions": [
                "Step 1: The Syrup. Boil sugar and water with crushed cardamom and saffron until it reaches a 'half-thread' consistency (slightly sticky). Keep it warm.",
                "Step 2: The Dough. Rub the khoya and chenna together until perfectly smooth. Mix in the flour gently. Knead into a soft, crack-free dough. Do not overwork.",
                "Step 3: The Shape. Form the dough into small, perfectly smooth balls. Any crack will cause them to explode in the hot oil.",
                "Step 4: The Fry. Heat ghee over very low heat. Drop the balls in. They must sink and then slowly rise as the heat penetrates. Fry, constantly rotating the oil, until they are an even, dark golden-brown.",
                "Step 5: The Saturation. Immediately remove from the ghee and drop the hot balls into the warm syrup. Let them soak for at least 2 hours. They will double in size and become incredibly soft. Serve warm."
              ],
              "classifications": {
                "mealType": [
                  "dessert"
                ],
                "cookingMethods": [
                  "deep-frying",
                  "soaking"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.4,
                "Earth": 0.35,
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
                "calories": 380,
                "proteinG": 6,
                "carbsG": 55,
                "fatG": 24,
                "fiberG": 0,
                "sodiumMg": 120,
                "sugarG": 48,
                "vitamins": [
                  "Riboflavin",
                  "Vitamin B12"
                ],
                "minerals": [
                  "Calcium",
                  "Phosphorus"
                ]
              },
              "substitutions": [
                {
                  "originalIngredient": "Khoya",
                  "substituteOptions": [
                    "Milk powder mixed with cream (cheat version)"
                  ]
                }
              ]
            }
        ],
      winter: [
        {
          "name": "Authentic Rogan Josh",
          "description": "The crown jewel of Kashmiri cuisine. It is a brilliant study in the color red, using either Kashmiri red chilies or Ratan Jot (alkanet root) to achieve a deep crimson hue. The alchemy involves a thin, oil-based gravy flavored with fennel and dry ginger (sonth), excluding onions and garlic in its most traditional Brahman form.",
          "details": {
            "cuisine": "Indian (Kashmiri)",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 90,
            "baseServingSize": 4,
            "spiceLevel": "Medium-Hot",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 800,
              "unit": "g",
              "name": "lamb or mutton",
              "notes": "Cut into chunks, bone-in."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "mustard oil",
              "notes": "Essential for authentic Kashmiri flavor. Must be heated to smoking point then cooled slightly."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "Greek yogurt",
              "notes": "Whisked. The primary liquid base."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "Kashmiri red chili powder",
              "notes": "Provides intense color with mild-medium heat."
            },
            {
              "amount": 1.5,
              "unit": "tbsp",
              "name": "fennel powder (saunf)",
              "notes": "The dominant aromatic."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dry ginger powder (sonth)",
              "notes": "Essential."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "asafoetida (hing)",
              "notes": "Replaces onions/garlic."
            }
          ],
          "instructions": [
            "Step 1: The Oil. Heat mustard oil to smoking point. Turn off heat, let cool slightly. Add whole spices (cardamom, cloves).",
            "Step 2: Sear. Add lamb pieces and hing. Brown meat thoroughly.",
            "Step 3: The Infusion. Whisk chili powder, fennel, and ginger into the yogurt. Add this mixture to the meat. Stir constantly to prevent curdling.",
            "Step 4: Braise. Add a splash of water. Cover and simmer over lowest heat for 1 to 1.5 hours until the meat is falling off the bone and the oil separates and floats to the top (Rogan).",
            "Step 5: Serve with steamed white rice (Saffron rice)."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "celebration"
            ],
            "cookingMethods": [
              "searing",
              "braising"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.15,
            "Earth": 0.35,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Saturn"
            ],
            "signs": [
              "Aries",
              "Scorpio"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 580,
            "proteinG": 42,
            "carbsG": 12,
            "fatG": 40,
            "fiberG": 2,
            "sodiumMg": 620,
            "sugarG": 4,
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
              "originalIngredient": "lamb",
              "substituteOptions": [
                "beef",
                "jackfruit (requires adjusted cooking time)"
              ]
            }
          ]
        },
      ],
    },
    dessert: {
      all: [
        {
          "name": "Authentic Gulab Jamun",
          "description": "The quintessential celebratory sweet of the Indian subcontinent.",
          "details": {
            "cuisine": "Indian",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 30,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 250,
              "unit": "g",
              "name": "Khoya",
              "notes": "Milk solids."
            }
          ],
          "instructions": [
            "Step 1: Knead dough.",
            "Step 2: Fry slowly in ghee.",
            "Step 3: Soak in rose syrup."
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
            "Fire": 0.35,
            "Water": 0.35,
            "Earth": 0.2,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 8,
            "carbsG": 55,
            "fatG": 20,
            "fiberG": 1,
              "sodiumMg": 185,
              "sugarG": 29,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "name": "Authentic Rasmalai",
          "description": "A sophisticated Bengali sweet. Fresh milk solids are curdled into Chenna (cheese), kneaded into discs, poached in light syrup, and finally submerged in a 'Ras'—a thick, saffron-and-cardamom-infused reduced milk.",
          "details": {
            "cuisine": "Indian (Bengali)",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 60,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "all",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "liters",
              "name": "whole milk",
              "notes": "Divided use: half for chenna, half for rabri."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "lemon juice",
              "notes": "To curdle the milk."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the poaching syrup."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "sugar",
              "notes": "For the reduced milk (rabri)."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "saffron threads",
              "notes": "For color and aroma."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "cardamom powder",
              "notes": "Aromatic."
            }
          ],
          "instructions": [
            "Step 1: The Chenna. Curdle boiling milk with lemon juice. Strain in cheesecloth, rinse, and hang for 30 mins.",
            "Step 2: Knead. Knead the chenna with the heel of your hand for 10 mins until perfectly smooth. Form into small, flat discs.",
            "Step 3: Poach. Boil discs in a light 1:3 sugar-water syrup for 15 mins until they double in size. Let cool in syrup.",
            "Step 4: The Rabri. Boil the second liter of milk until reduced by half. Add sugar, saffron, and cardamom.",
            "Step 5: The Soak. Gently squeeze the syrup out of the chenna discs and drop them into the hot rabri. Let them soak for 4 hours. Chill and serve."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "sweet",
              "celebration"
            ],
            "cookingMethods": [
              "boiling",
              "kneading",
              "poaching",
              "reducing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.45,
            "Earth": 0.25,
            "Air": 0.15
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
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 12,
            "carbsG": 38,
            "fatG": 14,
            "fiberG": 0,
            "sodiumMg": 120,
            "sugarG": 32,
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
              "originalIngredient": "whole milk",
              "substituteOptions": [
                "store-bought ricotta (for a quick cheat version)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Indian Kulfi",
          "description": "The traditional, unchurned ice cream of the Indian subcontinent. The alchemy relies on extreme, prolonged evaporation of milk (rabri) rather than whipping air into cream. This slow reduction creates intense caramelization, a dense, fudgy texture, and prevents large ice crystals from forming during freezing.",
          "details": {
            "cuisine": "Indian",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 120,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "liters",
              "name": "whole milk",
              "notes": "Must be full-fat. Do not use skim or 2%."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "Added late in the reduction process."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "saffron threads",
              "notes": "Soaked in 1 tbsp of warm milk to extract color and aroma."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "green cardamom powder",
              "notes": "Freshly ground from the pods."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "pistachios",
              "notes": "Unsalted, very finely chopped or ground into a coarse powder."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "almonds",
              "notes": "Unsalted, very finely chopped or ground into a coarse powder."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "rose water",
              "notes": "Optional, added off the heat."
            }
          ],
          "instructions": [
            "Step 1: The Long Boil (Rabri). Pour the milk into a very wide, heavy-bottomed pan or kadhai. Bring to a boil over medium-high heat. Once boiling, reduce the heat to medium-low.",
            "Step 2: Evaporation and Scraping. Simmer the milk continuously for 1.5 to 2 hours. A skin (malai) will form on the surface; push this skin to the sides of the pan. Every few minutes, aggressively scrape the bottom and sides of the pan with a spatula to prevent scorching and reintegrate the caramelized milk solids back into the liquid.",
            "Step 3: The Thickening. Continue this process until the milk has reduced to exactly one-third of its original volume. It should be thick, pale yellow/beige, and coated in tiny granules of milk solids.",
            "Step 4: Flavoring. Stir in the sugar, soaked saffron (with its milk), and cardamom powder. Simmer for 5 more minutes until the sugar is completely dissolved.",
            "Step 5: The Nuts. Turn off the heat. Stir in the finely chopped pistachios, almonds, and rose water (if using). Let the mixture cool completely to room temperature.",
            "Step 6: The Mold. Pour the cooled, thick mixture into traditional conical Kulfi molds, or into small paper cups or popsicle molds.",
            "Step 7: Freeze. Cover tightly with foil (insert a popsicle stick through the foil if not using molds with lids). Freeze for at least 8 hours, preferably overnight, until rock solid.",
            "Step 8: Unmold. To serve, run the outside of the mold briefly under warm water or rub it between your palms to loosen the kulfi, then pull it out."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "sweet",
              "frozen"
            ],
            "cookingMethods": [
              "boiling",
              "reducing",
              "freezing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.3,
            "Water": 0.35,
            "Earth": 0.25,
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
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 280,
            "proteinG": 10,
            "carbsG": 25,
            "fatG": 16,
            "fiberG": 1,
            "sodiumMg": 110,
            "sugarG": 22,
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
              "originalIngredient": "whole milk",
              "substituteOptions": [
                "1 can evaporated milk + 1 can sweetened condensed milk + 1 cup heavy cream (for a 'quick', no-cook version)"
              ]
            }
          ]
        },
      ],
      summer: [],
    },
  },
  traditionalSauces: {
    tandoori: {
      name: "Tandoori Marinade",
      description:
        "Yogurt-based marinade with vibrant spices for traditional tandoor cooking",
      base: "yogurt",
      keyIngredients: [
        "yogurt",
        "ginger-garlic paste",
        "red chili powder",
        "garam masala",
        "lemon juice",
      ],
      culinaryUses: [
        "marinating meats",
        "vegetable preparation",
        "flavor base",
        "coloring agent",
      ],
      variants: ["Achari tandoori", "Hariyali tandoori", "Malai tandoori"],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.2,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Allow marination for at least 4 hours, preferably overnight for best flavor",
      technicalTips:
        "For authentic color, use Kashmiri chili powder which adds color without excess heat",
    },
    tikka_masala: {
      name: "Tikka Masala",
      description:
        "Rich tomato-based curry sauce with cream and aromatic spices",
      base: "tomato and cream",
      keyIngredients: [
        "tomatoes",
        "cream",
        "garam masala",
        "fenugreek leaves",
        "butter",
      ],
      culinaryUses: [
        "sauce for grilled meats",
        "vegetable curry base",
        "dipping sauce",
        "rice accompaniment",
      ],
      variants: [
        "Butter masala",
        "Paneer tikka masala",
        "Vegetable tikka masala",
      ],
      elementalProperties: {
        Fire: 0.3,
        Water: 0.3,
        Earth: 0.3,
        Air: 0.1,
      },
      astrologicalInfluences: ["Venus", "Moon", "Taurus"],
      seasonality: "all",
      preparationNotes:
        "Allow the sauce to simmer gently to develop complex flavors",
      technicalTips:
        "Add kasuri methi (dried fenugreek leaves) at the end for authentic aroma",
    },
    raita: {
      name: "Raita",
      description: "Cooling yogurt condiment with vegetables and spices",
      base: "yogurt",
      keyIngredients: ["yogurt", "cucumber", "cumin", "mint", "cilantro"],
      culinaryUses: [
        "cooling accompaniment",
        "side dish",
        "dip",
        "spice balancer",
      ],
      variants: [
        "Boondi raita",
        "Pineapple raita",
        "Spinach raita",
        "Onion raita",
      ],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Air: 0.2,
        Fire: 0.0,
      },
      astrologicalInfluences: ["Moon", "Venus", "Cancer"],
      seasonality: "all",
      preparationNotes: "Use thick, strained yogurt for best texture",
      technicalTips: "Salt and drain cucumber to prevent watery raita",
    },
    tamarind_chutney: {
      name: "Tamarind Chutney",
      description:
        "Sweet and sour condiment made from tamarind pulp, jaggery and spices",
      base: "tamarind",
      keyIngredients: [
        "tamarind pulp",
        "jaggery",
        "cumin",
        "ginger",
        "black salt",
      ],
      culinaryUses: [
        "chaat accompaniment",
        "appetizer dip",
        "sandwich spread",
        "glaze",
      ],
      variants: [
        "Date-tamarind chutney",
        "Spicy tamarind chutney",
        "Garlic tamarind chutney",
      ],
      elementalProperties: {
        Water: 0.4,
        Fire: 0.3,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Saturn", "Gemini"],
      seasonality: "all",
      preparationNotes: "Balance sweet, sour, and spicy elements carefully",
      technicalTips: "Strain thoroughly for smooth consistency",
    },
    coriander_mint_chutney: {
      name: "Coriander-Mint Chutney",
      description: "Fresh, vibrant green chutney with herbs and green chilies",
      base: "herbs",
      keyIngredients: [
        "cilantro",
        "mint",
        "green chilies",
        "lemon juice",
        "cumin",
      ],
      culinaryUses: [
        "sandwich spread",
        "chaat topping",
        "dipping sauce",
        "marinade component",
      ],
      variants: [
        "Coconut green chutney",
        "Garlic green chutney",
        "Yogurt green chutney",
      ],
      elementalProperties: {
        Air: 0.5,
        Water: 0.3,
        Fire: 0.2,
        Earth: 0.0,
      },
      astrologicalInfluences: ["Mercury", "Moon", "Virgo"],
      seasonality: "all",
      preparationNotes:
        "Use ice water when blending to maintain bright green color",
      technicalTips:
        "Add a small amount of yogurt for creamier texture and longer shelf life",
    },
    coconut_curry: {
      name: "Coconut Curry Sauce",
      description:
        "Creamy, aromatic sauce with coconut milk and south Indian spices",
      base: "coconut milk",
      keyIngredients: [
        "coconut milk",
        "curry leaves",
        "mustard seeds",
        "turmeric",
        "green chilies",
      ],
      culinaryUses: [
        "seafood sauce",
        "vegetable curry base",
        "braising liquid",
        "rice accompaniment",
      ],
      variants: [
        "Kerala-style",
        "Goan curry",
        "Vegetable stew base",
        "Seafood moilee",
      ],
      elementalProperties: {
        Water: 0.5,
        Earth: 0.2,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Moon", "Neptune", "Pisces"],
      seasonality: "all",
      preparationNotes:
        "Temper spices properly to release their flavors into the coconut milk",
      technicalTips:
        "Use full-fat coconut milk for richness, light coconut milk may separate",
    },
    onion_tomato_masala: {
      name: "Onion-Tomato Masala",
      description:
        "Foundational sauce of caramelized onions and tomatoes for North Indian curries",
      base: "onion and tomato",
      keyIngredients: [
        "onions",
        "tomatoes",
        "ginger-garlic paste",
        "cumin",
        "coriander powder",
      ],
      culinaryUses: [
        "curry base",
        "gravy foundation",
        "rice flavoring",
        "legume enhancement",
      ],
      variants: [
        "Bhuna masala",
        "Restaurant-style base",
        "Home-style gravy",
        "Spicy version",
      ],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Leo"],
      seasonality: "all",
      preparationNotes:
        "Properly caramelizing onions (bhunao) is the key to depth of flavor",
      technicalTips:
        "Prepare in large batches and freeze in portions for quick weeknight cooking",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: [
        "tandoori marinade",
        "tikka masala",
        "korma",
        "kadhai masala",
        "coconut curry",
      ],
      lamb: [
        "rogan josh",
        "bhuna masala",
        "achari masala",
        "dopiaza",
        "onion_tomato_masala",
      ],
      fish: [
        "moilee sauce",
        "amritsari masala",
        "mustard sauce",
        "malvani masala",
        "coconut_curry",
      ],
      paneer: [
        "makhani sauce",
        "palak sauce",
        "kadhai masala",
        "shahi sauce",
        "tikka_masala",
      ],
      legumes: [
        "chana masala",
        "dal makhani sauce",
        "sambar",
        "rasam",
        "tadka",
      ],
      goat: [
        "kosha mangsho sauce",
        "kolhapuri rassa",
        "laal maas gravy",
        "saag base",
        "achari masala",
      ],
      eggs: [
        "mughlai gravy",
        "onion_tomato_masala",
        "curry leaf tempering",
        "mirchi ka salan",
        "tomato chutney base",
      ],
    },
    forVegetable: {
      leafy: [
        "palak sauce",
        "methi masala",
        "coconut sauce",
        "mustard paste",
        "sarson ka saag base",
      ],
      root: ["korma", "vindaloo", "do pyaza", "bharta masala", "coconut curry"],
      eggplant: [
        "bharta masala",
        "salan",
        "bagara masala",
        "achari sauce",
        "tamarind base",
      ],
      okra: [
        "bhindi masala",
        "sambhariya masala",
        "achari masala",
        "yogurt sauce",
        "onion_tomato_masala",
      ],
      potato: [
        "aloo dum masala",
        "jeera aloo spice mix",
        "chaat masala",
        "tikki masala",
        "mustard paste",
      ],
      cauliflower: [
        "aloo gobi masala",
        "coconut curry",
        "kasundi paste",
        "achari masala",
        "onion_tomato_masala",
      ],
      gourds: [
        "dahi wali kaddu",
        "lauki chana dal",
        "coconut curry",
        "sambhar base",
        "peanut sauce",
      ],
    },
    forCookingMethod: {
      tandoor: [
        "tandoori marinade",
        "hariyali marinade",
        "malai marinade",
        "achari marinade",
        "yogurt-based marinades",
      ],
      curry: [
        "garam masala base",
        "dhansak sauce",
        "xacuti masala",
        "chettinad sauce",
        "onion_tomato_masala",
      ],
      frying: [
        "pakora batter",
        "kathi masala",
        "besan masala",
        "amritsari masala",
        "ajwain tempering",
      ],
      steaming: [
        "mustard paste",
        "moilee sauce",
        "patrani masala",
        "coconut sauce",
        "coriander_mint_chutney",
      ],
      grilling: [
        "boti kabab marinade",
        "tikka marinade",
        "malai kabab paste",
        "reshmi kabab mixture",
        "hariyali paste",
      ],
      "stir-frying": [
        "kadhai masala",
        "chilli paneer sauce",
        "manchurian sauce",
        "ginger-garlic base",
        "dry mango spice",
      ],
    },
    byAstrological: {
      Fire: [
        "laal maas sauce",
        "vindaloo paste",
        "phaal curry sauce",
        "chettinad masala",
        "achari sauce",
      ],
      Earth: [
        "dal makhani sauce",
        "korma paste",
        "malai sauce",
        "shahi gravy",
        "tempering oil",
      ],
      Air: [
        "raita",
        "green chutney",
        "kadhi sauce",
        "tamarind chutney",
        "coriander_mint_chutney",
      ],
      Water: [
        "coconut curry sauce",
        "moilee gravy",
        "dahi wali gravy",
        "rasam",
        "kadhi",
      ],
    },
    byRegion: {
      north: [
        "makhani sauce",
        "korma",
        "kadhai masala",
        "yakhni",
        "onion_tomato_masala",
      ],
      south: [
        "sambar",
        "rasam",
        "chettinad masala",
        "moilee gravy",
        "coconut_curry",
      ],
      east: [
        "mustard sauce",
        "doi maach sauce",
        "posto paste",
        "panch phoron oil",
        "kalia gravy",
      ],
      west: [
        "malvani masala",
        "goda masala",
        "koli masala",
        "dhansak sauce",
        "kolhapuri masala",
      ],
      central: [
        "bhopali sauce",
        "safed maas gravy",
        "rogan josh",
        "nihari masala",
        "salan",
      ],
      northeast: [
        "bamboo shoot sauce",
        "fermented soybean paste",
        "axone base",
        "bhut jolokia oil",
        "fish sauce",
      ],
    },
    byDietary: {
      vegetarian: [
        "palak sauce",
        "coconut curry",
        "kadhi sauce",
        "sambar",
        "tikka_masala",
      ],
      vegan: [
        "chana masala",
        "tadka dal",
        "bharta masala",
        "amchur sauce",
        "coconut_curry",
      ],
      glutenFree: [
        "rasam",
        "chettinad masala",
        "moilee gravy",
        "dhansak sauce",
        "tamarind_chutney",
      ],
      dairyFree: [
        "tamarind chutney",
        "vindaloo paste",
        "mustard sauce",
        "phaal curry",
        "coconut_curry",
      ],
      jain: [
        "jain masala",
        "no-onion garlic base",
        "raw banana curry",
        "suran masala",
        "arbi gravy",
      ],
    },
    byFlavor: {
      spicy: [
        "vindaloo paste",
        "chettinad masala",
        "phaal curry",
        "kolhapuri rassa",
        "andhra masala",
      ],
      mild: [
        "korma",
        "pasanda sauce",
        "shahi gravy",
        "malai sauce",
        "cashew paste",
      ],
      tangy: [
        "tamarind_chutney",
        "amchur sauce",
        "nimbu-based dressing",
        "tomato salan",
        "imli chutney",
      ],
      sweet: [
        "kashmiri gravy",
        "date chutney",
        "shahi sauce",
        "malai curry",
        "coconut chutney",
      ],
      aromatic: [
        "biryani masala",
        "garam masala oil",
        "pulao spice mix",
        "kewra water",
        "rose essence sauce",
      ],
    },
  } as unknown,
  cookingTechniques: [
    {
      name: "Tadka",
      description: "Tempering spices in hot oil or ghee to release flavors",
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: ["small tadka pan", "spoon", "lid", "ladle"],
      bestFor: [
        "dal preparations",
        "curries",
        "rice dishes",
        "yogurt preparations",
      ],
      difficulty: "medium",
    },
    {
      name: "Dum",
      description:
        "Slow cooking in a sealed vessel to contain flavors and moisture",
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "heavy-bottomed pot",
        "dough for sealing",
        "tongs",
        "weight",
      ],
      bestFor: ["biryani", "meat curries", "rich vegetable dishes", "kebabs"],
      difficulty: "hard",
    },
    {
      name: "Bhunao",
      description: "Slow sautéing to caramelize and intensify flavors",
      elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
      toolsRequired: ["heavy kadhai", "wooden spoon", "tongs", "timer"],
      bestFor: [
        "onion-tomato masala",
        "meat preparations",
        "mixed vegetables",
        "keema",
      ],
      difficulty: "medium",
    },
    {
      name: "Tandoor",
      description: "High-heat clay oven cooking for char and smoky flavor",
      elementalProperties: { Fire: 0.8, Air: 0.1, Earth: 0.1, Water: 0.0 },
      toolsRequired: ["tandoor", "skewers", "brush", "tongs"],
      bestFor: ["breads", "marinated meats", "kebabs", "vegetables"],
      difficulty: "hard",
    },
    {
      name: "Baghar",
      description: "Pouring hot spice-infused oil over finished dishes",
      elementalProperties: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0.0 },
      toolsRequired: ["small pan", "spoon", "heat-proof container", "strainer"],
      bestFor: ["dals", "rice dishes", "raita", "curries"],
      difficulty: "easy",
    },
  ],
  regionalCuisines: {
    punjabi: {
      name: "Punjabi Cuisine",
      description:
        "Hearty, rich cuisine with generous use of dairy, robust spices, and tandoor cooking",
      signature: [
        "butter chicken",
        "dal makhani",
        "amritsari kulcha",
        "sarson da saag",
      ],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Jupiter", "taurus"],
      seasonality: "all",
    },
    bengali: {
      name: "Bengali Cuisine",
      description:
        "Delicate flavors with emphasis on fish, mustard, panch phoron spice blend and sweets",
      signature: ["maacher jhol", "shorshe ilish", "mishti doi", "rasgulla"],
      elementalProperties: { Water: 0.5, Earth: 0.2, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Venus", "Moon", "cancer"],
      seasonality: "all",
    },
    south_indian: {
      name: "South Indian Cuisine",
      description:
        "Predominantly rice-based with coconut, curry leaves, tamarind and complex spice blends",
      signature: ["dosa", "idli", "sambar", "rasam"],
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mercury", "Sun", "virgo"],
      seasonality: "all",
    },
    gujarati: {
      name: "Gujarati Cuisine",
      description:
        "Vegetarian cuisine with balance of sweet, salty and spicy flavors",
      signature: ["dhokla", "thepla", "undhiyu", "fafda-jalebi"],
      elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Jupiter", "Mercury", "gemini"],
      seasonality: "all",
    },
  },
  elementalProperties: {
    Fire: 0.5,
    Earth: 0.2,
    Water: 0.2,
    Air: 0.1,
  },
};

export default indian;
