// src/data/cuisines/african.ts
import type { /* _ , */} from "@/types/alchemy";
import type { Cuisine } from "@/types/cuisine";

export const african: Cuisine = {
  name: "African",
  id: "african",
  description:
    "Rich and diverse cuisine with bold flavors, hearty stews, and complex spice profiles. Spanning from North African tagines to West African peanut stews and East African injera-based dishes.",
  traditionalSauces: {
    berbere: {
      name: "Berbere",
      description:
        "Ethiopian hot spice blend made from chili peppers, garlic, ginger and various spices",
      base: "dried chili peppers",
      keyIngredients: [
        "chili peppers",
        "garlic",
        "ginger",
        "fenugreek",
        "cardamom",
        "coriander",
      ],
      culinaryUses: [
        "stews",
        "meat dishes",
        "lentil dishes",
        "vegetable preparations",
      ],
      variants: ["Mild Berbere", "Extra-hot Berbere", "Awaze (berbere paste)"],
      elementalProperties: {
        Fire: 0.8,
        Earth: 0.1,
        Air: 0.1,
        Water: 0.0,
      },
      astrologicalInfluences: ["Mars", "Sun", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Traditionally dry-roasted and ground by hand, though now commercial versions are widely available.",
      technicalTips:
        "Toast the spices before grinding for maximum flavor development.",
    },
    harissa: {
      name: "Harissa",
      description:
        "North African hot chili pepper paste with garlic, olive oil and spices",
      base: "red chili peppers",
      keyIngredients: [
        "chili peppers",
        "garlic",
        "olive oil",
        "caraway",
        "coriander",
        "cumin",
      ],
      culinaryUses: ["couscous", "stews", "marinades", "dips"],
      variants: ["Rose Harissa", "Preserved Lemon Harissa", "Tunisian Harissa"],
      elementalProperties: {
        Fire: 0.7,
        Earth: 0.2,
        Water: 0.1,
        Air: 0.0,
      },
      astrologicalInfluences: ["Mars", "Mercury", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Can be preserved in olive oil for months when refrigerated.",
      technicalTips:
        "For milder harissa, remove seeds from peppers before processing.",
    },
    duqqa: {
      name: "Duqqa",
      description: "Egyptian dry spice blend with nuts, herbs, and spices",
      base: "toasted nuts",
      keyIngredients: [
        "hazelnuts",
        "sesame seeds",
        "coriander",
        "cumin",
        "mint",
        "salt",
      ],
      culinaryUses: [
        "dipping with bread",
        "sprinkled on vegetables",
        "coating for meats",
      ],
      variants: ["Hazelnut-dominant", "Sesame-dominant", "Herb-forward"],
      elementalProperties: {
        Earth: 0.5,
        Air: 0.3,
        Fire: 0.2,
        Water: 0.0,
      },
      astrologicalInfluences: ["Mercury", "Saturn", "Virgo"],
      seasonality: "all",
      preparationNotes:
        "Each family has their own recipe - proportions vary significantly.",
      technicalTips:
        "Allow to cool completely before storing to maintain crunch.",
    },
    chermoula: {
      name: "Chermoula",
      description:
        "A vibrant Moroccan marinade and sauce made with fresh herbs, aromatic spices, lemon, and olive oil - widely used in North African cuisine",
      base: "fresh herbs",
      keyIngredients: [
        "cilantro",
        "parsley",
        "olive oil",
        "lemon juice",
        "garlic",
        "cumin",
        "paprika",
        "coriander",
        "preserved lemon",
      ],
      culinaryUses: [
        "fish marinades",
        "tagine seasoning",
        "grilled meats",
        "roasted vegetables",
        "couscous dishes",
      ],
      variants: [
        "Red Chermoula (with paprika)",
        "Spicy Chermoula (with harissa)",
        "Preserved Lemon Chermoula",
      ],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.3,
        Air: 0.2,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Venus", "Neptune", "Pisces"],
      seasonality: "spring, summer",
      preparationNotes:
        "Traditionally prepared by hand-grinding all ingredients in a mortar and pestle to release maximum flavor. Best made fresh, but can be stored for up to a week refrigerated.",
      technicalTips:
        "Balance acidity with enough olive oil for a smooth emulsion. For best results, allow flavors to marry for at least 30 minutes before using.",
    },
    peanut: {
      name: "West African Peanut Sauce",
      description:
        "Rich, creamy sauce made from ground peanuts, tomatoes, and spices",
      base: "ground peanuts",
      keyIngredients: [
        "peanut butter",
        "tomatoes",
        "onions",
        "ginger",
        "chili peppers",
      ],
      culinaryUses: [
        "stews",
        "grilled meats",
        "rice dishes",
        "vegetable dishes",
      ],
      variants: [
        "Mafe (Senegalese)",
        "Groundnut Soup (Ghanaian)",
        "Spicy Peanut Sauce",
      ],
      elementalProperties: {
        Earth: 0.6,
        Fire: 0.2,
        Water: 0.2,
        Air: 0.0,
      },
      astrologicalInfluences: ["Jupiter", "Saturn", "Taurus"],
      seasonality: "all",
      preparationNotes: "The sauce thickens significantly as it cools.",
      technicalTips: "Roast raw peanuts before grinding for deeper flavor.",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: ["chermoula", "harissa", "yassa sauce"],
      fish: ["chermoula", "harissa", "yassa sauce"],
      beef: ["berbere", "peanut sauce", "harissa"],
      lamb: ["harissa", "chermoula", "duqqa"],
      goat: ["berbere", "peanut sauce", "suya spice"],
    },
    forVegetable: {
      okra: ["peanut sauce", "palm oil sauce"],
      eggplant: ["chermoula", "harissa", "shito"],
      greens: ["peanut sauce", "palm oil", "berbere"],
      squash: ["moroccan spice", "harissa", "duqqa"],
      legumes: ["berbere", "peanut sauce", "zhug"],
    },
    forCookingMethod: {
      grilling: ["suya spice", "chermoula", "pili pili"],
      stewing: ["berbere", "peanut sauce", "ras el hanout"],
      roasting: ["duqqa", "harissa", "chermoula"],
      frying: ["shito", "harissa", "berbere"],
    },
    byAstrological: {
      Fire: ["berbere", "harissa", "pili pili"],
      Earth: ["peanut sauce", "duqqa", "suya spice"],
      Air: ["chermoula", "duqqa", "moroccan spice"],
      Water: ["palm oil sauce", "peanut sauce", "dipping sauce"],
    },
    byRegion: {
      northAfrican: ["harissa", "chermoula", "ras el hanout"],
      westAfrican: ["peanut sauce", "palm oil sauce", "suya spice"],
      eastAfrican: ["berbere", "pili pili", "mchuzi mix"],
      southAfrican: ["chakalaka", "monkey gland sauce", "atchar"],
    },
    byDietary: {
      vegetarian: ["chermoula", "duqqa", "harissa"],
      vegan: ["harissa", "chermoula", "peanut sauce"],
      glutenFree: ["pili pili", "suya spice", "chermoula"],
      dairyFree: ["harissa", "duqqa", "berbere"],
    },
  },
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic East African Mandazi",
          "description": "A lightly sweetened, cardamom-spiced East African fried dough. The structure relies on coconut milk to tenderize the crumb and provide a subtle tropical aroma. Unlike a heavy doughnut, mandazi are fluffy, slightly hollow inside, and perfect for dipping into chai or coffee.",
          "details": {
            "cuisine": "East African",
            "prepTimeMinutes": 120,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 3,
              "unit": "cups",
              "name": "all-purpose flour",
              "notes": "Sifted."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "Adjust to taste."
            },
            {
              "amount": 2.25,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "For the airy structure."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground cardamom",
              "notes": "The defining aromatic profile."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To balance the sweetness."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "coconut milk",
              "notes": "Warm. Provides fat and tenderizes the dough."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "water",
              "notes": "Warm, for the dough."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "vegetable oil",
              "notes": "Added to the dough."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Lightly beaten. Binder."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "neutral oil",
              "notes": "For deep frying."
            }
          ],
          "instructions": [
            "Step 1: The Sponge. In a small bowl, dissolve the yeast and 1 tsp of sugar in the warm water. Let sit for 10 minutes until frothy.",
            "Step 2: Dry Ingredients. In a large bowl, whisk together the flour, remaining sugar, cardamom, and salt.",
            "Step 3: The Dough. Make a well in the center of the dry ingredients. Pour in the yeast mixture, warm coconut milk, oil, and the beaten egg.",
            "Step 4: Knead. Mix until a shaggy dough forms. Turn out onto a floured surface and knead vigorously for 10-15 minutes until smooth, elastic, and no longer sticky.",
            "Step 5: First Rise. Place the dough in a lightly oiled bowl, cover with a damp cloth, and let rise in a warm place for 1.5 to 2 hours until doubled in volume.",
            "Step 6: Shape. Punch down the dough. Divide into 4 equal pieces. Roll each piece into a circle about 1/4-inch thick. Cut each circle into 4 triangles (like cutting a pizza).",
            "Step 7: Second Rise. Place the triangles on a lightly floured tray. Cover and let rise for 20-30 minutes until puffy.",
            "Step 8: Fry. Heat the frying oil in a deep pot to 350°F (175°C). Carefully drop the dough triangles into the hot oil in small batches. They should puff up immediately.",
            "Step 9: Cook. Fry for 2-3 minutes per side until deep golden brown. Remove with a slotted spoon and drain on paper towels. Serve warm."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack",
              "dessert"
            ],
            "cookingMethods": [
              "kneading",
              "deep-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.35,
            "Water": 0.15,
            "Earth": 0.3,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus",
              "Sun"
            ],
            "signs": [
              "Taurus",
              "Leo"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 6,
            "carbsG": 58,
            "fatG": 18,
            "fiberG": 2,
            "sodiumMg": 280,
            "sugarG": 14,
            "vitamins": [
              "Vitamin A"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },

          alchemicalProperties: {"Spirit":2.2,"Essence":3.57,"Matter":4.19,"Substance":3.87},
          thermodynamicProperties: {"heat":0.0329,"entropy":0.2964,"reactivity":1.6243,"gregsEnergy":-0.4486,"kalchm":0.007,"monica":0.5486},
          "substitutions": [
            {
              "originalIngredient": "coconut milk",
              "substituteOptions": [
                "whole milk",
                "almond milk"
              ]
            },
            {
              "originalIngredient": "egg",
              "substituteOptions": [
                "omit entirely (dough will be slightly denser)"
              ]
            }
          ]
        },
        {
          "name": "Authentic North African Shakshuka",
          "description": "A deeply aromatic North African dish featuring eggs gently poached in a rich, spiced tomato and pepper stew. Historically rooted in agrarian traditions, it balances the fiery energy of warming spices with the grounding comfort of a savory, simmering sauce.",
          "details": {
            "cuisine": "North African",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 25,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "olive oil",
              "notes": "Used to extract fat-soluble flavors."
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
              "notes": "Diced."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground cumin",
              "notes": "Freshly ground."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sweet paprika",
              "notes": "Vibrant color."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "harissa paste",
              "notes": "Crucial for authentic heat."
            },
            {
              "amount": 800,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "Peeled and crushed by hand."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Room temperature."
            }
          ],
          "instructions": [
            "Step 1: Sauté onions and peppers in olive oil until soft.",
            "Step 2: Add garlic, cumin, paprika, and harissa. Toast the spices in the oil.",
            "Step 3: Pour in crushed tomatoes. Simmer for 15 minutes to thicken the stew.",
            "Step 4: Create wells in the sauce. Crack an egg into each well.",
            "Step 5: Cover and poach the eggs for 5-8 minutes.",
            "Step 6: Garnish with cilantro and parsley. Serve with crusty bread."
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
            "Fire": 0.45,
            "Water": 0.25,
            "Earth": 0.2,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Aries",
              "Leo"
            ],
            "lunarPhases": [
              "Waxing Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 12,
            "carbsG": 35,
            "fatG": 15,
            "fiberG": 6,
            "sodiumMg": 550,
            "sugarG": 8,
            "vitamins": [
              "Vitamin A",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },

          alchemicalProperties: {"Spirit":3.49,"Essence":4.45,"Matter":4.04,"Substance":3.55},
          thermodynamicProperties: {"heat":0.0781,"entropy":0.3127,"reactivity":2.4953,"gregsEnergy":-0.7023,"kalchm":2.38,"monica":-0.0376},
          "substitutions": [
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "silken tofu (vegan)"
              ]
            },
            {
              "originalIngredient": "harissa paste",
              "substituteOptions": [
                "chili garlic sauce"
              ]
            }
          ]
        },
        {
          "name": "Authentic Egyptian Ful Medames",
          "description": "The national dish of Egypt. A pre-Islamic peasant staple relying on the extremely slow breakdown of fava beans (ful) into an earthy, dense puree, heavily seasoned with raw cumin, garlic, and brightened with sharp lemon juice and aggressive amounts of olive oil.",
          "details": {
            "cuisine": "North African (Egypt)",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 180,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "dried small fava beans",
              "notes": "Must be dried, soaked overnight."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "red lentils",
              "notes": "Optional, added during boiling to help thicken the stew naturally."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Mashed into a paste with salt."
            },
            {
              "amount": 1.5,
              "unit": "tsp",
              "name": "ground cumin",
              "notes": "The primary aromatic."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Poured generously over the top when serving."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "Stirred in at the end."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Chopped, for garnish."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "tomato",
              "notes": "Finely diced, for garnish."
            }
          ],
          "instructions": [
            "Step 1: Soak the beans. Soak the dried fava beans in plenty of cold water for 12-24 hours. Drain and rinse.",
            "Step 2: Boil. Place the beans (and lentils, if using) in a heavy pot. Cover with 3 inches of water. Bring to a boil, skim the foam, cover tightly, and reduce heat to the lowest setting.",
            "Step 3: The Long Simmer. Simmer the beans for 2 to 4 hours until they are incredibly tender and easily crushed between two fingers. Do not add salt during this process.",
            "Step 4: The Mash. Use a wooden spoon or potato masher to roughly mash about half of the beans directly in the pot. It should be a thick, rustic porridge, not a smooth soup.",
            "Step 5: Flavor. Stir the garlic paste, ground cumin, and salt into the hot bean mash. Let it sit for 5 minutes off the heat.",
            "Step 6: The Acid. Stir in the fresh lemon juice.",
            "Step 7: Serve. Ladle the hot ful into shallow bowls. Create a small well in the center and pour in a generous amount of olive oil. Garnish heavily with diced tomatoes, parsley, and serve with warm pita bread and raw onions."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "boiling",
              "simmering",
              "mashing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.35,
            "Earth": 0.45,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn",
              "Earth"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 410,
            "proteinG": 18,
            "carbsG": 45,
            "fatG": 20,
            "fiberG": 15,
            "sodiumMg": 380,
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

          alchemicalProperties: {"Spirit":2.84,"Essence":3.95,"Matter":4.28,"Substance":4.01},
          thermodynamicProperties: {"heat":0.0468,"entropy":0.2964,"reactivity":1.783,"gregsEnergy":-0.4816,"kalchm":0.0333,"monica":0.4},
          "substitutions": [
            {
              "originalIngredient": "dried fava beans",
              "substituteOptions": [
                "canned fava beans (for a 15-minute quick version)",
                "pinto beans (flavor will be completely different)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Ethiopian Injera with Firfir",
          "description": "A profound study in fermentation and the foundational carbohydrate of the Horn of Africa. Teff flour is fermented over days into a sour, bubbling batter, then cooked on a flat griddle (mitad) to create a spongy, porous flatbread. Firfir re-purposes torn, dried injera by soaking it in a fiercely spicy, berbere-heavy sauce.",
          "details": {
            "cuisine": "East African (Ethiopia/Eritrea)",
            "prepTimeMinutes": 4320,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "Hot",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "teff flour",
              "notes": "Must be 100% teff for authentic sourness and texture."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "water",
              "notes": "For the fermentation batter."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "Often used to kickstart fermentation if not using a wild starter."
            },
            {
              "amount": 3,
              "unit": "whole",
              "name": "leftover/dry injera",
              "notes": "Torn into bite-sized pieces for the Firfir."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "red onions",
              "notes": "Finely minced."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "niter kibbeh (spiced clarified butter)",
              "notes": "Essential. Oil can be used for a vegan version, but lacks the complex aromatic depth."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "berbere spice blend",
              "notes": "The fiery, foundational spice of Ethiopian cuisine."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ginger",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "water or broth",
              "notes": "To create the sauce for the firfir."
            }
          ],
          "instructions": [
            "Step 1: The Fermentation (Injera). In a large glass bowl, mix the teff flour, yeast, and 3 cups of water into a smooth batter. Cover with a breathable cloth and let sit at room temperature for 2 to 3 days. It will bubble, separate, and develop a deeply sour smell.",
            "Step 2: The Absit. On baking day, carefully pour off the dark water on top. Boil 1/2 cup of water, stir in 1/2 cup of the batter to cook it slightly (making a paste called absit), and stir it back into the main batter. Let rest for 2 hours.",
            "Step 3: Cook the Injera. Heat a large non-stick crepe pan or mitad over medium-high heat. Pour the batter in a spiral from the outside in. Do not spread it. Wait for thousands of 'eyes' (bubbles) to form and pop. Cover the pan with a lid to steam the top for 1 minute. Remove the injera without flipping it. Let cool on a towel.",
            "Step 4: The Firfir Base. In a skillet, dry-cook the minced onions until they soften and lose moisture (about 5 mins). Add the niter kibbeh (or oil).",
            "Step 5: The Spice. Add the berbere spice, garlic, and ginger to the butter/onions. Fry for 2 minutes to toast the spices and release their oils.",
            "Step 6: The Sauce. Pour in the water or broth. Simmer for 10 minutes to create a rich, dark red, spicy sauce.",
            "Step 7: The Soak. Toss the torn pieces of leftover/dry injera into the simmering sauce. Stir well to coat. Let the injera absorb the liquid completely (about 2-3 minutes). It should be moist and spongy, but not complete mush.",
            "Step 8: Serve the Firfir on top of a fresh piece of whole Injera."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "lunch",
              "dinner"
            ],
            "cookingMethods": [
              "fermenting",
              "griddling",
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
              "Mars",
              "Saturn"
            ],
            "signs": [
              "Aries",
              "Capricorn"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 12,
            "carbsG": 70,
            "fatG": 18,
            "fiberG": 12,
            "sodiumMg": 450,
            "sugarG": 4,
            "vitamins": [
              "Vitamin A",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Calcium",
              "Zinc"
            ]
          },

          alchemicalProperties: {"Spirit":3.73,"Essence":4.37,"Matter":3.94,"Substance":3.22},
          thermodynamicProperties: {"heat":0.0946,"entropy":0.311,"reactivity":2.3664,"gregsEnergy":-0.6413,"kalchm":8.909,"monica":0.4654},
          "substitutions": [
            {
              "originalIngredient": "niter kibbeh",
              "substituteOptions": [
                "vegetable oil (for vegan fasting version)"
              ]
            },
            {
              "originalIngredient": "teff flour",
              "substituteOptions": [
                "50% wheat / 50% teff blend (if pure teff is too difficult to handle)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Nigerian Akara (Black-Eyed Pea Fritters)",
          "description": "A structural marvel of West African street food. Black-eyed peas are meticulously peeled, then vigorously beaten (aerated) with aromatics to incorporate air. When deep-fried, the batter expands rapidly, creating a feather-light, spongy interior encased in a rigid, golden, savory crust.",
          "details": {
            "cuisine": "West African",
            "prepTimeMinutes": 120,
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
              "name": "dried black-eyed peas",
              "notes": "Must be dried, soaked, and peeled."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "onion",
              "notes": "Roughly chopped."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "scotch bonnet or habanero peppers",
              "notes": "Seeds removed if less heat is desired."
            },
            {
              "amount": 1,
              "unit": "cube",
              "name": "chicken bouillon or Maggi",
              "notes": "Crushed. The primary umami source."
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
              "name": "water",
              "notes": "Used only to aid blending. Too much water ruins the batter."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "vegetable or palm oil",
              "notes": "For deep frying."
            }
          ],
          "instructions": [
            "Step 1: The Peel (Crucial). Soak the dried black-eyed peas in warm water for 15-30 minutes. Use your hands to aggressively rub the beans together to loosen and remove the translucent skins. The skins will float to the top; pour them off. The beans must be completely skinless.",
            "Step 2: The Grind. Place the peeled beans, onion, scotch bonnet peppers, and just enough water to get the blender moving (about 1/4 cup) into a blender. Blend into a completely smooth, thick paste.",
            "Step 3: The Aeration (The Secret). Transfer the paste to a mortar or a deep bowl. Using a wooden pestle or a whisk, beat the batter vigorously for 5 to 10 minutes. This incorporates air, making the batter light and fluffy (like whipping egg whites). It will visibly expand.",
            "Step 4: Season. Gently fold in the crushed bouillon cube and salt. Do not deflate the batter.",
            "Step 5: Heat the oil. Heat the oil in a deep pan to 350°F (175°C).",
            "Step 6: Fry. Using a tablespoon, scoop the aerated batter and gently drop it into the hot oil. They should form neat, round balls.",
            "Step 7: The Crisp. Fry until the bottom is deep golden brown, then flip and fry the other side (about 3-4 minutes total).",
            "Step 8: Drain on paper towels and serve immediately. Traditionally eaten for breakfast with akamu (pap) or bread."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack",
              "street food",
              "vegetarian"
            ],
            "cookingMethods": [
              "soaking",
              "peeling",
              "blending",
              "whipping",
              "deep-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.1,
            "Earth": 0.3,
            "Air": 0.2
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
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 14,
            "carbsG": 40,
            "fatG": 16,
            "fiberG": 8,
            "sodiumMg": 520,
            "sugarG": 4,
            "vitamins": [
              "Folate",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },

          alchemicalProperties: {"Spirit":1.39,"Essence":2.52,"Matter":3.38,"Substance":3.08},
          thermodynamicProperties: {"heat":0.0228,"entropy":0.2927,"reactivity":1.3276,"gregsEnergy":-0.3658,"kalchm":0.0083,"monica":1.3206},
          "substitutions": [
            {
              "originalIngredient": "dried black-eyed peas",
              "substituteOptions": [
                "brown beans (Ewa Oloyin)"
              ]
            },
            {
              "originalIngredient": "scotch bonnet",
              "substituteOptions": [
                "jalapeño (for much less heat)"
              ]
            }
          ]
        },
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Nigerian Jollof Rice",
          "description": "A celebratory, deeply savory, and smoky one-pot rice dish. The foundational alchemy relies on reducing a vibrant red pepper, tomato, and onion blend (the 'obe ata') into a concentrated paste, which is then absorbed by the rice. The coveted 'party Jollof' flavor comes from purposefully scorching the bottom layer of rice to infuse the entire pot with a rich, elemental smokiness.",
          "details": {
            "cuisine": "West African",
            "prepTimeMinutes": 25,
            "cookTimeMinutes": 60,
            "baseServingSize": 6,
            "spiceLevel": "Medium-Hot",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 3,
              "unit": "cups",
              "name": "long-grain parboiled rice",
              "notes": "Must be parboiled"
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "red bell peppers (tatashe)",
              "notes": "Seeds and stems removed."
            },
            {
              "amount": 3,
              "unit": "medium",
              "name": "plum tomatoes",
              "notes": "Used sparingly compared to peppers"
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "red onions",
              "notes": "Roughly chopped for the blend."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "scotch bonnet peppers (ata rodo)",
              "notes": "Adjust for heat."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "vegetable oil",
              "notes": "Essential for frying the tomato paste and base."
            },
            {
              "amount": 6,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "Provides depth of color and umami."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "red onion",
              "notes": "Thinly sliced, fried in the oil before the paste."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "curry powder",
              "notes": "Nigerian/Jamaican style curry powder, yellow and earthy."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dried thyme",
              "notes": "Crucial aromatic profile for Jollof."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "bay leaves",
              "notes": "Dried."
            },
            {
              "amount": 3,
              "unit": "cubes",
              "name": "chicken bouillon or Maggi cubes",
              "notes": "Crushed."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "rich beef or chicken stock",
              "notes": "Homemade stock preferred."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "unsalted butter",
              "notes": "Stirred in at the very end for a glossy finish."
            }
          ],
          "instructions": [
            "Step 1: Prepare the pepper base (Obe Ata). Blend bell peppers, tomatoes, roughly chopped onions, and scotch bonnets until smooth. Boil down for 15-20 mins until it becomes a thick paste.",
            "Step 2: Wash the parboiled rice repeatedly until the water runs clear. Drain well.",
            "Step 3: Heat oil in a large pot, fry sliced onion for 3-5 mins.",
            "Step 4: Add tomato paste and fry for 5-8 mins until it separates from oil.",
            "Step 5: Add pepper base, curry, thyme, bouillon, and bay leaves. Fry for 10 mins.",
            "Step 6: Add washed rice, stir to coat. Pour in stock (level with rice).",
            "Step 7: Cover tightly with foil and lid. Simmer on lowest heat.",
            "Step 8: Steam undisturbed for 30 mins.",
            "Step 9: Turn heat up to medium-high for 3-5 mins to intentionally scorch the bottom layer.",
            "Step 10: Stir in butter, let rest covered for 10 mins before serving."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "lunch"
            ],
            "cookingMethods": [
              "blending",
              "frying",
              "steaming"
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
              "Sun"
            ],
            "signs": [
              "Leo",
              "Aries"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 520,
            "proteinG": 9,
            "carbsG": 85,
            "fatG": 16,
            "fiberG": 5,
              "sodiumMg": 618,
              "sugarG": 14,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },

          alchemicalProperties: {"Spirit":4.82,"Essence":6.16,"Matter":5.98,"Substance":5.46},
          thermodynamicProperties: {"heat":0.0711,"entropy":0.336,"reactivity":2.3131,"gregsEnergy":-0.706,"kalchm":0.3064,"monica":0.4454},
          "substitutions": [
            {
              "originalIngredient": "chicken bouillon or stock",
              "substituteOptions": [
                "vegetable stock"
              ]
            }
          ]
        },
        {
          "name": "Authentic Ethiopian Doro Wat",
          "description": "The regal centerpiece of Ethiopian cuisine. A deeply complex, fiercely spicy chicken stew. The alchemy involves a massive volume of onions, dry-cooked down to a sweet paste, acting as the thickening matrix for the fiery berbere spice and clarified butter (niter kibbeh), completely eliminating the need for flour or thickeners.",
          "details": {
            "cuisine": "East African (Ethiopia)",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 180,
            "baseServingSize": 4,
            "spiceLevel": "Fiery",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 6,
              "unit": "large",
              "name": "red onions",
              "notes": "Finely minced in a food processor. The sheer volume of onions is the foundation of the dish."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "niter kibbeh",
              "notes": "Ethiopian spiced clarified butter. Essential for authentic flavor."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "berbere spice blend",
              "notes": "Must be high quality. Provides the dark red color and intense heat."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "ginger",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "chicken",
              "notes": "Cut into 8 or 10 pieces. Skin removed (traditional)."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "lemon juice",
              "notes": "Used to clean the chicken."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "water or chicken broth",
              "notes": "For simmering."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Hard-boiled. Pierced with a fork and steeped in the sauce at the end."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            }
          ],
          "instructions": [
            "Step 1: Clean the chicken. Soak the skinless chicken pieces in water and lemon juice for 15 minutes. Rinse and pat dry.",
            "Step 2: The Onion Base (The most critical step). Place the finely minced red onions in a large, heavy-bottomed dry pot (no oil or butter). Cook over medium-low heat for 30-45 minutes, stirring frequently. The onions will release their water, steam, and eventually reduce into a dark, sweet, jam-like paste.",
            "Step 3: The Fat. Once the onions are reduced and dry, add the niter kibbeh. Sauté the onion paste in the butter for 10 minutes.",
            "Step 4: The Spice. Add the berbere, minced garlic, and ginger. Cook for another 10-15 minutes over low heat. The mixture should be a thick, intensely dark red, fragrant mud.",
            "Step 5: The Braise. Add a splash of water/broth if the paste is sticking. Add the chicken pieces. Stir to coat them completely in the paste. Cook for 10 minutes, allowing the meat to absorb the spices.",
            "Step 6: Simmer. Pour in the remaining water/broth. Bring to a boil, then reduce to a low simmer. Cover and cook for 45-60 minutes until the chicken is tender and the sauce is thick and oily on top.",
            "Step 7: The Eggs. During the last 10 minutes of cooking, take the peeled hard-boiled eggs, score them lightly with a knife (so the sauce penetrates), and submerge them in the simmering stew.",
            "Step 8: Serve hot with Injera, allowing the flatbread to soak up the fiercely spiced sauce."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stew",
              "celebration"
            ],
            "cookingMethods": [
              "dry-cooking",
              "sautéing",
              "braising"
            ]
          },
          "elementalProperties": {
            "Fire": 0.5,
            "Water": 0.15,
            "Earth": 0.25,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Pluto"
            ],
            "signs": [
              "Scorpio",
              "Aries"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 650,
            "proteinG": 48,
            "carbsG": 25,
            "fatG": 40,
            "fiberG": 6,
            "sodiumMg": 850,
            "sugarG": 12,
            "vitamins": [
              "Vitamin A",
              "Vitamin B6",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },

          alchemicalProperties: {"Spirit":4.12,"Essence":4.42,"Matter":4.48,"Substance":4.22},
          thermodynamicProperties: {"heat":0.0929,"entropy":0.4052,"reactivity":2.4405,"gregsEnergy":-0.896,"kalchm":0.6755,"monica":0.7628},
          "substitutions": [
            {
              "originalIngredient": "niter kibbeh",
              "substituteOptions": [
                "ghee mixed with a pinch of cardamom, fenugreek, and clove"
              ]
            },
            {
              "originalIngredient": "chicken",
              "substituteOptions": [
                "beef stew meat (Siga Wat)",
                "red lentils (Misir Wat)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Senegalese Yassa Poulet",
          "description": "A sharp, vibrant West African chicken dish defined by intense acid and aggressive caramelization. The chicken and an enormous quantity of onions are marinated in sharp mustard and lemon juice, then the chicken is grilled over an open fire before being braised in the caramelized, highly acidic onion marmalade.",
          "details": {
            "cuisine": "West African (Senegal)",
            "prepTimeMinutes": 240,
            "cookTimeMinutes": 60,
            "baseServingSize": 4,
            "spiceLevel": "Mild-Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "whole",
              "name": "chicken",
              "notes": "Cut into pieces, skin on."
            },
            {
              "amount": 6,
              "unit": "large",
              "name": "yellow onions",
              "notes": "Thinly sliced. They are the main body of the sauce."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "The primary acid."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "Dijon mustard",
              "notes": "Provides tang and acts as an emulsifier."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "peanut oil",
              "notes": "For sautéing the onions."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "habanero or scotch bonnet pepper",
              "notes": "Pierced, left whole for aroma, or minced for intense heat."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Generous amount needed."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "chicken broth or water",
              "notes": "For the braise."
            }
          ],
          "instructions": [
            "Step 1: The Marinade. In a very large bowl, combine the chicken pieces, sliced onions, lemon juice, Dijon mustard, garlic, black pepper, and salt. Massage everything together vigorously. Cover and refrigerate for at least 3 hours, preferably overnight. The acid will begin to 'cook' the onions and tenderize the meat.",
            "Step 2: Separate. Remove the chicken pieces from the marinade, shaking off the onions. Reserve all the onions and the marinade liquid.",
            "Step 3: The Grill/Sear. Prepare a charcoal grill or heat a grill pan. Grill the chicken pieces over high heat until the skin is deeply charred and blistered. The chicken does not need to be cooked through. Set aside.",
            "Step 4: Caramelize the Onions. In a large Dutch oven or heavy pot, heat the peanut oil over medium heat. Add the reserved marinated onions (and all the liquid). Sauté slowly.",
            "Step 5: The Marmalade. Cook the onions, stirring frequently, for 30-40 minutes. They will soften, reduce, and turn a deep, golden brown. This slow caramelization balances the sharp acidity of the lemon and mustard.",
            "Step 6: The Braise. Nestle the grilled chicken pieces into the caramelized onions. Add the habanero pepper and the chicken broth. Bring to a simmer.",
            "Step 7: Cook. Cover the pot and simmer over low heat for 30 minutes, or until the chicken is completely tender and the sauce is thick and glossy.",
            "Step 8: Serve hot over a bed of broken rice or couscous."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "poultry"
            ],
            "cookingMethods": [
              "marinating",
              "grilling",
              "caramelizing",
              "braising"
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
              "Sun",
              "Mercury"
            ],
            "signs": [
              "Leo",
              "Gemini"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 580,
            "proteinG": 42,
            "carbsG": 22,
            "fatG": 35,
            "fiberG": 4,
            "sodiumMg": 750,
            "sugarG": 12,
            "vitamins": [
              "Vitamin C",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },

          alchemicalProperties: {"Spirit":4.3,"Essence":4.72,"Matter":4.73,"Substance":4.39},
          thermodynamicProperties: {"heat":0.0886,"entropy":0.3869,"reactivity":2.4796,"gregsEnergy":-0.8708,"kalchm":0.7806,"monica":0.5763},
          "substitutions": [
            {
              "originalIngredient": "chicken",
              "substituteOptions": [
                "firm white fish (Yassa Poisson)"
              ]
            },
            {
              "originalIngredient": "peanut oil",
              "substituteOptions": [
                "canola oil",
                "sunflower oil"
              ]
            }
          ]
        },
        {
          "name": "Authentic Senegalese Thieboudienne",
          "description": "The national dish of Senegal and the ancestor of Jambalaya. A structurally complex, one-pot fish and rice stew. The fish is stuffed with an herb paste (roff), simmered in a rich tomato base with large root vegetables, removed, and then broken rice is cooked directly in the highly concentrated, fish-infused broth.",
          "details": {
            "cuisine": "West African (Senegal)",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 90,
            "baseServingSize": 6,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "firm white fish steaks (grouper, snapper)",
              "notes": "Bone-in for flavor."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "For the 'roff' (stuffing)."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "For the roff."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "scotch bonnet pepper",
              "notes": "Minced, for the roff."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "peanut oil",
              "notes": "For frying."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "onion",
              "notes": "Chopped."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "Provides the red base."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "crushed tomatoes",
              "notes": "Canned or fresh."
            },
            {
              "amount": 2,
              "unit": "pieces",
              "name": "dried smoked fish or yete (cured mollusk)",
              "notes": "Essential for the authentic, deep umami funk."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "carrots",
              "notes": "Cut into large chunks."
            },
            {
              "amount": 0.5,
              "unit": "small",
              "name": "cabbage",
              "notes": "Cut into 2 large wedges."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "eggplant",
              "notes": "Cut into 2 large wedges."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "cassava (yuca) or sweet potato",
              "notes": "Peeled and chunked."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "broken jasmine rice",
              "notes": "Washed thoroughly."
            }
          ],
          "instructions": [
            "Step 1: The Roff. In a mortar, pound the parsley, garlic, scotch bonnet, salt, and pepper into a paste. Cut deep slits into the fish steaks and stuff the slits with this paste.",
            "Step 2: Fry the fish. Heat the peanut oil in a large, heavy pot. Briefly fry the stuffed fish steaks until golden on both sides. Remove and set aside.",
            "Step 3: The Base. In the same oil, fry the chopped onions until soft. Add the tomato paste and fry for 5 minutes until dark red. Add the crushed tomatoes.",
            "Step 4: The Broth. Pour in 6 cups of water. Add the smoked fish/yete. Bring to a boil.",
            "Step 5: Simmer vegetables. Add the large chunks of carrots, cabbage, eggplant, and cassava to the boiling broth. Reduce heat and simmer for 30 minutes until vegetables are tender.",
            "Step 6: Poach fish. Gently return the fried fish to the pot. Simmer for 10-15 minutes until cooked through. Carefully remove the fish and all the vegetables to a platter. Keep warm.",
            "Step 7: The Rice. You should have about 4 cups of deep red, fish-infused liquid left in the pot. Bring it to a boil. Add the washed broken rice. Stir once.",
            "Step 8: Steam. Reduce heat to the absolute lowest setting. Cover tightly with foil and a lid. Steam the rice for 30-40 minutes until it has absorbed all the liquid and is fluffy.",
            "Step 9: Serve. Mound the red rice on a large communal platter. Arrange the fish and vegetables artistically on top. Scrape the crispy rice from the bottom of the pot (the xooñ) and serve alongside."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "seafood",
              "one-pot"
            ],
            "cookingMethods": [
              "stuffing",
              "frying",
              "simmering",
              "steaming"
            ]
          },
          "elementalProperties": {
            "Fire": 0.25,
            "Water": 0.35,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Neptune",
              "Mars"
            ],
            "signs": [
              "Pisces",
              "Aries"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 680,
            "proteinG": 38,
            "carbsG": 85,
            "fatG": 22,
            "fiberG": 8,
            "sodiumMg": 850,
            "sugarG": 9,
            "vitamins": [
              "Vitamin A",
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Iodine",
              "Potassium",
              "Iron"
            ]
          },

          alchemicalProperties: {"Spirit":4.15,"Essence":5.95,"Matter":6.65,"Substance":5.8},
          thermodynamicProperties: {"heat":0.0471,"entropy":0.2901,"reactivity":1.79,"gregsEnergy":-0.4722,"kalchm":0.0019,"monica":0.7532},
          "substitutions": [
            {
              "originalIngredient": "firm white fish",
              "substituteOptions": [
                "chicken (for Thieboudienne Guinaar)"
              ]
            },
            {
              "originalIngredient": "broken jasmine rice",
              "substituteOptions": [
                "regular jasmine rice",
                "short-grain rice"
              ]
            }
          ]
        },
        {
          "name": "Authentic Nigerian Suya",
          "description": "The zenith of West African street barbecue. Thinly sliced meat is heavily coated in 'Yaji', a complex, peanut-based dry rub that acts as a tenderizer, flavor crust, and heat protectant. The meat is aggressively grilled over open flames, resulting in a smoky, nutty, fiery char.",
          "details": {
            "cuisine": "West African (Nigeria)",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "Fiery",
            "season": [
              "summer",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 600,
              "unit": "g",
              "name": "beef sirloin or flank steak",
              "notes": "Sliced as thinly as possible against the grain. Semi-freezing helps with slicing."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "roasted peanuts (Kuli Kuli base)",
              "notes": "Ground into a fine powder (but not turned into peanut butter; must remain dry)."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "cayenne pepper or chili powder",
              "notes": "Adjust for heat."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "paprika",
              "notes": "For color."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "onion powder",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "garlic powder",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground ginger",
              "notes": "Warmth."
            },
            {
              "amount": 1,
              "unit": "cube",
              "name": "chicken bouillon or Maggi",
              "notes": "Crushed into a fine powder."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "vegetable oil",
              "notes": "For brushing."
            },
            {
              "amount": 10,
              "unit": "whole",
              "name": "bamboo skewers",
              "notes": "Soaked in water."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "red onion",
              "notes": "Thinly sliced, for serving."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "tomatoes",
              "notes": "Sliced, for serving."
            }
          ],
          "instructions": [
            "Step 1: Make the Yaji (Suya Spice). In a bowl, combine the finely ground peanut powder, cayenne, paprika, onion powder, garlic powder, ginger, crushed bouillon, and salt. Mix thoroughly.",
            "Step 2: Prep the meat. Thread the paper-thin slices of beef onto the soaked bamboo skewers, accordion-style, so they lay relatively flat.",
            "Step 3: The Coating. Lay the skewers on a baking sheet. Generously coat both sides of the meat with the Yaji spice blend. Press the spice firmly into the meat with your fingers so it adheres like a crust.",
            "Step 4: Rest. Cover and let the meat marinate at room temperature for 30-45 minutes. The salt will draw out slightly moisture, hydrating the peanut powder into a paste.",
            "Step 5: Heat the grill. Prepare a charcoal grill for high, direct heat. (A very hot grill pan can be used indoors, but lacks the smoke).",
            "Step 6: Grill. Lightly dab or brush the skewers with a little vegetable oil. Grill the skewers directly over the flames. Because the meat is so thin, they will cook in 2-3 minutes per side. You want the peanut crust to char and blacken slightly.",
            "Step 7: Serve immediately on newspaper or butcher paper, scattered with copious amounts of raw sliced red onions, tomatoes, and extra Yaji spice on the side."
          ],
          "classifications": {
            "mealType": [
              "street food",
              "snack",
              "dinner",
              "bbq"
            ],
            "cookingMethods": [
              "skewering",
              "grilling",
              "dry-rubbing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.6,
            "Water": 0.05,
            "Earth": 0.25,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Aries",
              "Leo"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 35,
            "carbsG": 12,
            "fatG": 26,
            "fiberG": 3,
            "sodiumMg": 850,
            "sugarG": 4,
            "vitamins": [
              "Vitamin B6",
              "Niacin"
            ],
            "minerals": [
              "Zinc",
              "Iron",
              "Magnesium"
            ]
          },

          alchemicalProperties: {"Spirit":4.64,"Essence":5.59,"Matter":6.28,"Substance":5.91},
          thermodynamicProperties: {"heat":0.0662,"entropy":0.3837,"reactivity":2.0656,"gregsEnergy":-0.7263,"kalchm":0.005,"monica":1.3128},
          "substitutions": [
            {
              "originalIngredient": "beef sirloin",
              "substituteOptions": [
                "chicken breast",
                "goat meat"
              ]
            },
            {
              "originalIngredient": "ground peanuts",
              "substituteOptions": [
                "almond flour (if peanut allergy)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Egyptian Koshari",
          "description": "The ultimate Egyptian street food and a masterpiece of carbohydrate stacking. It combines rice, lentils, macaroni, and chickpeas into a dense base, heavily dressed with a spiced tomato sauce, a sharp garlic-vinegar splash (Dakka), and crowned with crispy fried onions. It is entirely vegan.",
          "details": {
            "cuisine": "North African (Egypt)",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "Mild-Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "brown lentils",
              "notes": "Rinsed."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "short-grain white rice",
              "notes": "Rinsed well."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "macaroni or ditalini pasta",
              "notes": "Dry."
            },
            {
              "amount": 1,
              "unit": "can (15oz)",
              "name": "chickpeas",
              "notes": "Rinsed and drained."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "yellow onions",
              "notes": "Very thinly sliced, for frying."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "vegetable oil",
              "notes": "For frying the onions."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "tomato passata",
              "notes": "For the sauce."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced. Divided between sauce and Dakka."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "white vinegar",
              "notes": "For the sauce."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "white vinegar",
              "notes": "For the Dakka (garlic sauce)."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground cumin",
              "notes": "Divided."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "ground coriander",
              "notes": "Aromatic."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "red pepper flakes",
              "notes": "For heat."
            }
          ],
          "instructions": [
            "Step 1: Crispy Onions (The most important step). Heat the oil in a large skillet. Fry the sliced onions over medium-high heat, stirring frequently, until deeply browned and crispy (15 mins). Remove with a slotted spoon to a paper towel. Reserve the onion-infused oil.",
            "Step 2: Lentils and Rice. Boil the lentils in 3 cups of water for 15 minutes until mostly tender. Add the washed rice directly to the lentils (add a little more water if dry). Add 1 tbsp of the reserved onion oil and salt. Cover and simmer for 15 mins until rice is cooked.",
            "Step 3: Pasta. In a separate pot, boil the macaroni in salted water until al dente. Drain and toss with 1 tbsp of the reserved onion oil to prevent sticking.",
            "Step 4: The Tomato Sauce. In a saucepan, heat 1 tbsp onion oil. Sauté half the minced garlic until fragrant. Add the tomato passata, 1 tbsp vinegar, cumin, coriander, red pepper flakes, salt, and pepper. Simmer for 15 minutes until thick.",
            "Step 5: The Dakka (Garlic Vinegar). In a small bowl, mix the remaining minced garlic, 2 tbsp white vinegar, a pinch of cumin, and 2 tbsp warm water.",
            "Step 6: Assemble. In deep bowls, layer the base: a large scoop of the lentil/rice mixture, followed by a scoop of macaroni, and a handful of chickpeas.",
            "Step 7: Top. Ladle the spiced tomato sauce over the carbohydrates. Splash the Dakka over the sauce. Finally, crown the dish with a massive handful of the crispy fried onions."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "street food",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "boiling",
              "frying",
              "simmering",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.2,
            "Earth": 0.5,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn",
              "Earth"
            ],
            "signs": [
              "Virgo",
              "Capricorn"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 620,
            "proteinG": 22,
            "carbsG": 105,
            "fatG": 14,
            "fiberG": 16,
            "sodiumMg": 580,
            "sugarG": 10,
            "vitamins": [
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Iron",
              "Magnesium",
              "Potassium"
            ]
          },

          alchemicalProperties: {"Spirit":4.4,"Essence":4.8,"Matter":4.5,"Substance":4.3},
          thermodynamicProperties: {"heat":0.0936,"entropy":0.379,"reactivity":2.4392,"gregsEnergy":-0.8309,"kalchm":2.7402,"monica":0.8376},
          "substitutions": [
            {
              "originalIngredient": "macaroni",
              "substituteOptions": [
                "broken spaghetti",
                "vermicelli"
              ]
            },
            {
              "originalIngredient": "white vinegar",
              "substituteOptions": [
                "apple cider vinegar"
              ]
            }
          ]
        },
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    dinner: {
      all: [
        {
          "name": "Authentic South African Bobotie",
          "description": "A structurally unique, sweet-and-savory Cape Malay meat pie. The alchemy relies on a deeply spiced, fruit-studded minced meat base that is baked beneath a savory egg-and-milk custard topping (similar to a moussaka without the vegetables).",
          "details": {
            "cuisine": "South African (Cape Malay)",
            "prepTimeMinutes": 25,
            "cookTimeMinutes": 45,
            "baseServingSize": 6,
            "spiceLevel": "Mild",
            "season": [
              "autumn",
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "ground beef or lamb",
              "notes": "Lamb is traditional, beef is common."
            },
            {
              "amount": 2,
              "unit": "slices",
              "name": "white bread",
              "notes": "Soaked in milk, squeezed dry. Acts as the panade."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "milk",
              "notes": "Divided use: soaking bread and for the custard topping."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "yellow onions",
              "notes": "Finely chopped."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "mild curry powder",
              "notes": "Cape Malay style."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "turmeric",
              "notes": "For color and earthiness."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "fruit chutney or apricot jam",
              "notes": "Crucial for the sweet-savory balance."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "raisins or sultanas",
              "notes": "Plumped in warm water."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "vinegar or lemon juice",
              "notes": "For acidity."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "bay leaves or lemon leaves",
              "notes": "Inserted vertically into the meat before baking."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "For the custard topping."
            }
          ],
          "instructions": [
            "Step 1: The Panade. Soak the bread in 1/2 cup of the milk. Squeeze it completely dry and crumble it. Reserve the squeezed milk.",
            "Step 2: The Base. In a large pan, sauté the onions until soft. Add the curry powder and turmeric, cooking for 1 minute until fragrant.",
            "Step 3: The Meat. Add the ground meat and brown it thoroughly. Stir in the crumbled soaked bread, chutney, raisins, vinegar, salt, and pepper.",
            "Step 4: Bake Phase 1. Preheat oven to 350°F (175°C). Transfer the meat mixture to an oiled baking dish. Press it down flat. Insert the bay leaves vertically into the meat. Bake for 20 minutes.",
            "Step 5: The Custard. Whisk the 2 eggs with the remaining 1/2 cup of milk (plus any reserved milk from soaking). Season with a pinch of salt.",
            "Step 6: Bake Phase 2. Remove the dish from the oven. Pour the egg custard evenly over the hot meat. Return to the oven and bake for another 20-25 minutes until the custard is set and golden brown.",
            "Step 7: Serve warm with yellow rice (geelrys) and extra chutney."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "casserole"
            ],
            "cookingMethods": [
              "sautéing",
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.2,
            "Earth": 0.45,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Jupiter",
              "Sun"
            ],
            "signs": [
              "Taurus",
              "Sagittarius"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 520,
            "proteinG": 35,
            "carbsG": 32,
            "fatG": 26,
            "fiberG": 3,
            "sodiumMg": 450,
            "sugarG": 18,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },

          alchemicalProperties: {"Spirit":4.18,"Essence":5.25,"Matter":3.94,"Substance":3.67},
          thermodynamicProperties: {"heat":0.0939,"entropy":0.3202,"reactivity":3.041,"gregsEnergy":-0.8799,"kalchm":90.9439,"monica":0.7162},
          "substitutions": [
            {
              "originalIngredient": "ground beef",
              "substituteOptions": [
                "brown lentils and finely chopped mushrooms (vegan, use plant milk/flax egg for custard)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Cameroonian Ndolé",
          "description": "The national dish of Cameroon. A rich, intensely caloric stew built on a base of pureed peanuts and bitter leaves (ndolé leaves). The bitterness is painstakingly washed out of the leaves before they are folded into the rich, oily peanut emulsion, often heavily fortified with meat, dried fish, and prawns.",
          "details": {
            "cuisine": "West African (Cameroon)",
            "prepTimeMinutes": 180,
            "cookTimeMinutes": 60,
            "baseServingSize": 6,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "Ndolé leaves (bitterleaf)",
              "notes": "If fresh, must be washed and squeezed repeatedly to remove extreme bitterness. Often bought frozen/pre-washed."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "raw peanuts (groundnuts)",
              "notes": "Boiled until soft, then pureed."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "beef stew meat or goat",
              "notes": "Cut into chunks."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "dried smoked fish (stockfish)",
              "notes": "For deep umami funk."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "fresh or dried shrimp",
              "notes": "Added late in the cooking process."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "peanut oil or palm oil",
              "notes": "Large quantity required for the emulsion."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "onions",
              "notes": "Divided; half blended with peanuts, half sliced for the final oil garnish."
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Blended."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "habanero pepper",
              "notes": "Blended."
            }
          ],
          "instructions": [
            "Step 1: Prep the peanuts. Boil the raw peanuts for 15 minutes to soften them. Drain. Blend the peanuts with half the onions, garlic, and habanero into a very smooth paste. Add water as needed to blend.",
            "Step 2: Boil the meat. In a large pot, boil the beef/goat and dried fish with salt and water until tender (about 1 hour). Do not drain the broth.",
            "Step 3: The Peanut Base. Pour the blended peanut paste into the pot with the meat and its broth. Stir well. Simmer uncovered for 20-30 minutes. The mixture will thicken significantly.",
            "Step 4: The Leaves. Add the pre-washed, chopped Ndolé leaves to the pot. Stir to combine. Simmer for 15 minutes.",
            "Step 5: The Shrimp. Add the shrimp to the stew.",
            "Step 6: The Oil Garnish. In a separate skillet, heat the oil until hot. Sauté the remaining sliced onions until golden brown. Pour the hot oil and onions directly over the simmering pot of Ndolé. Do not stir it in completely; let it sit on the surface.",
            "Step 7: Serve hot with fried plantains or bobolo (fermented cassava)."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stew"
            ],
            "cookingMethods": [
              "boiling",
              "blending",
              "simmering"
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
              "Saturn",
              "Pluto"
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
            "calories": 780,
            "proteinG": 45,
            "carbsG": 18,
            "fatG": 62,
            "fiberG": 8,
            "sodiumMg": 650,
            "sugarG": 4,
            "vitamins": [
              "Vitamin A",
              "Folate"
            ],
            "minerals": [
              "Iron",
              "Zinc",
              "Magnesium"
            ]
          },

          alchemicalProperties: {"Spirit":3.12,"Essence":3.83,"Matter":4.11,"Substance":3.86},
          thermodynamicProperties: {"heat":0.0616,"entropy":0.3307,"reactivity":1.9392,"gregsEnergy":-0.5796,"kalchm":0.0973,"monica":0.0734},
          "substitutions": [
            {
              "originalIngredient": "Ndolé leaves",
              "substituteOptions": [
                "spinach mixed with a small amount of kale or collard greens"
              ]
            },
            {
              "originalIngredient": "beef and fish",
              "substituteOptions": [
                "extra firm tofu and shiitake mushrooms (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Senegalese Maafe (Peanut Stew)",
          "description": "A rich, velvety West African stew. The alchemy involves breaking down unsweetened peanut butter into a savory tomato-based broth, allowing the peanut oil to separate and rise to the top, signaling the stew's readiness. It balances the heavy fat of the peanuts with sharp tomato acidity and earthy root vegetables.",
          "details": {
            "cuisine": "West African (Senegal/Mali)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 60,
            "baseServingSize": 6,
            "spiceLevel": "Medium",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "lamb, beef, or chicken",
              "notes": "Cut into chunks."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "peanut oil",
              "notes": "For browning the meat."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "onion",
              "notes": "Chopped."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "Fried to provide the red base."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "unsweetened, natural peanut butter",
              "notes": "Must contain ONLY peanuts (no added sugar or palm oil). Smooth preferred."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "water or broth",
              "notes": "For the stew base."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "sweet potatoes or yams",
              "notes": "Peeled and chunked."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "carrots",
              "notes": "Cut into thick rounds."
            },
            {
              "amount": 0.5,
              "unit": "small",
              "name": "cabbage",
              "notes": "Chopped."
            },
            {
              "amount": 1,
              "unit": "whole",
              "name": "scotch bonnet pepper",
              "notes": "Pierced, left whole for flavor without extreme heat."
            }
          ],
          "instructions": [
            "Step 1: Sear the meat. Heat the peanut oil in a large, heavy pot. Brown the meat chunks on all sides. Remove and set aside.",
            "Step 2: The Base. In the same oil, sauté the onions until soft. Add the garlic and tomato paste, frying for 3-4 minutes until the paste darkens.",
            "Step 3: The Broth. Gradually whisk the water/broth into the pot, scraping up any browned bits.",
            "Step 4: The Peanut Emulsion. In a separate bowl, whisk the peanut butter with 1 cup of hot water until it becomes a smooth, pourable liquid. Stir this into the pot.",
            "Step 5: Simmer. Return the meat to the pot. Add the scotch bonnet pepper. Bring to a gentle boil, then reduce heat to low, cover partially, and simmer for 30 minutes.",
            "Step 6: Add Vegetables. Add the sweet potatoes, carrots, and cabbage. Simmer for another 20-30 minutes until the meat and vegetables are tender.",
            "Step 7: The Oil Rise. The stew is done when the natural oils from the peanut butter separate and float to the surface as a reddish-orange layer.",
            "Step 8: Serve hot over white rice."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stew"
            ],
            "cookingMethods": [
              "searing",
              "simmering",
              "emulsifying"
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
              "Earth",
              "Jupiter"
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
            "calories": 650,
            "proteinG": 35,
            "carbsG": 42,
            "fatG": 40,
            "fiberG": 8,
            "sodiumMg": 520,
            "sugarG": 10,
            "vitamins": [
              "Vitamin A",
              "Vitamin E"
            ],
            "minerals": [
              "Potassium",
              "Magnesium"
            ]
          },

          alchemicalProperties: {"Spirit":3.37,"Essence":5.06,"Matter":5.91,"Substance":5.19},
          thermodynamicProperties: {"heat":0.0393,"entropy":0.279,"reactivity":1.6087,"gregsEnergy":-0.4095,"kalchm":0.0012,"monica":0.8564},
          "substitutions": [
            {
              "originalIngredient": "meat",
              "substituteOptions": [
                "chickpeas and extra root vegetables (for a vegan Maafe)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Moroccan Lamb Tagine with Couscous",
          "description": "A masterclass in North African slow-cooking. The conical lid of the tagine captures steam, condensing it back into the stew, allowing tough cuts of meat to braise in highly concentrated, spiced fruit juices (apricots/prunes) and toasted almonds without drying out.",
          "details": {
            "cuisine": "North African (Morocco)",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 120,
            "baseServingSize": 4,
            "spiceLevel": "Mild",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "lamb shoulder",
              "notes": "Cut into 2-inch chunks."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "onion",
              "notes": "Finely grated, to melt into the sauce."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Ras el Hanout",
              "notes": "Complex Moroccan spice blend."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground ginger",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground cinnamon",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "saffron threads",
              "notes": "Steeped in 2 tbsp warm water."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "beef or lamb broth",
              "notes": "Liquid base."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "dried apricots or prunes",
              "notes": "Provides the essential sweet-savory balance."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "blanched almonds",
              "notes": "Toasted, for garnish."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "couscous",
              "notes": "Steamed separately, never boiled in the stew."
            }
          ],
          "instructions": [
            "Step 1: The Spice Rub. Toss the lamb chunks with Ras el Hanout, ginger, cinnamon, salt, and pepper. Let marinate for 1 hour.",
            "Step 2: The Sear. Heat olive oil in the base of a tagine (or a heavy Dutch oven). Brown the lamb on all sides. Remove meat.",
            "Step 3: The Base. Add the grated onion and garlic to the pot. Sauté until soft. Return the meat to the pot.",
            "Step 4: The Braise. Pour in the broth and the saffron water. Bring to a simmer.",
            "Step 5: The Tagine Effect. Cover tightly with the conical lid. Reduce heat to the absolute lowest setting. Braise undisturbed for 1.5 hours.",
            "Step 6: The Fruit. Add the dried apricots/prunes. Cover and cook for another 30 minutes until the meat falls apart and the fruit is plump.",
            "Step 7: The Couscous. In a separate bowl, pour 2 cups of boiling water over 2 cups of couscous. Cover with plastic wrap for 5 minutes. Fluff vigorously with a fork.",
            "Step 8: Garnish and Serve. Top the tagine with toasted almonds and fresh cilantro. Serve the rich, sticky stew over the fluffy couscous."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stew"
            ],
            "cookingMethods": [
              "braising",
              "steaming"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.3,
            "Earth": 0.35,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Jupiter",
              "Sun"
            ],
            "signs": [
              "Sagittarius",
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 720,
            "proteinG": 45,
            "carbsG": 65,
            "fatG": 28,
            "fiberG": 8,
            "sodiumMg": 600,
            "sugarG": 22,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },

          alchemicalProperties: {"Spirit":5.42,"Essence":5.36,"Matter":4.78,"Substance":4.45},
          thermodynamicProperties: {"heat":0.1242,"entropy":0.4229,"reactivity":2.9662,"gregsEnergy":-1.1303,"kalchm":56.7195,"monica":-0.0566},
          "substitutions": [
            {
              "originalIngredient": "lamb shoulder",
              "substituteOptions": [
                "chicken thighs (reduces cooking time by half)",
                "root vegetables and chickpeas (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic South African Bunny Chow",
          "description": "An iconic Durban street food born of necessity. A half or quarter loaf of unsliced white bread is hollowed out to serve as an edible, highly absorbent bowl for a fiercely spicy, oily, Indian-South African curry. The 'virgin' (the scooped-out bread) is used to dip.",
          "details": {
            "cuisine": "South African (Durban Indian)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 60,
            "baseServingSize": 2,
            "spiceLevel": "Hot",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "loaf",
              "name": "unsliced white bread",
              "notes": "Must be a standard, square, flat-topped sandwich loaf. Hollowed out."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "lamb or mutton",
              "notes": "Bone-in preferred for a richer gravy, chopped into small pieces."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "vegetable oil",
              "notes": "A layer of oil on top of the curry is authentic."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "onion",
              "notes": "Finely chopped."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "Durban curry masala",
              "notes": "A specific, fiery, red chili-heavy blend. Alternatively, use hot Madras curry powder mixed with cayenne."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ginger-garlic paste",
              "notes": "Equal parts crushed."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "tomatoes",
              "notes": "Grated or pureed."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "potatoes",
              "notes": "Peeled and cut into large chunks. They thicken the gravy."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "fresh coriander (cilantro)",
              "notes": "For garnish."
            }
          ],
          "instructions": [
            "Step 1: The Spice Base. Heat the oil in a heavy pot over medium heat. Fry the chopped onions until golden. Add the ginger-garlic paste and the Durban masala. Fry for 1 minute to bloom the spices.",
            "Step 2: The Meat. Add the lamb pieces to the pot. Stir well to coat in the spices. Cook until the meat is browned.",
            "Step 3: The Gravy. Add the grated tomatoes and a splash of water. Reduce heat, cover, and simmer for 30 minutes.",
            "Step 4: The Potatoes. Add the potato chunks and enough hot water to just cover the meat. Cover and simmer for another 20-30 minutes until the potatoes are soft and beginning to break down, thickening the sauce. The meat must be tender.",
            "Step 5: The Bread Bowl. Cut the loaf of bread in half horizontally. Hollow out the center of the half-loaf, leaving a thick wall and base. Keep the scooped-out bread (the 'virgin').",
            "Step 6: Assemble. Ladle the hot, oily curry directly into the hollowed-out bread bowl.",
            "Step 7: Garnish with fresh coriander. Place the 'virgin' bread on top of the curry to soak up the gravy. Serve immediately (eaten strictly with hands)."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "street food"
            ],
            "cookingMethods": [
              "simmering",
              "hollowing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.2,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Saturn"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 850,
            "proteinG": 38,
            "carbsG": 95,
            "fatG": 35,
            "fiberG": 6,
            "sodiumMg": 920,
            "sugarG": 5,
            "vitamins": [
              "Vitamin C",
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },

          alchemicalProperties: {"Spirit":3.06,"Essence":3.66,"Matter":4.15,"Substance":3.78},
          thermodynamicProperties: {"heat":0.0641,"entropy":0.345,"reactivity":1.8815,"gregsEnergy":-0.5849,"kalchm":0.0632,"monica":0.4188},
          "substitutions": [
            {
              "originalIngredient": "lamb",
              "substituteOptions": [
                "chicken (Chicken Bunny)",
                "sugar beans (Broad Bean Bunny - vegetarian)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Ethiopian Kitfo",
          "description": "The pinnacle of Ethiopian raw meat preparation. It is an exercise in extreme ingredient purity. Lean, highest-quality beef is finely minced (never ground in a machine), then gently warmed (not cooked) in aggressively spiced clarified butter (niter kibbeh) and mitmita spice.",
          "details": {
            "cuisine": "East African (Ethiopia)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 5,
            "baseServingSize": 2,
            "spiceLevel": "Fiery",
            "season": [
              "all",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "beef tenderloin or extreme high-quality lean beef",
              "notes": "Must be fresh and safe for raw consumption. All fat and sinew meticulously removed."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "niter kibbeh",
              "notes": "Ethiopian spiced clarified butter. Must be warm and liquid."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "mitmita",
              "notes": "A fiery Ethiopian spice blend (hotter than berbere, heavy on bird's eye chili, cardamom, and salt)."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "korarima (Ethiopian cardamom)",
              "notes": "Ground."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "kosher salt",
              "notes": "To taste."
            }
          ],
          "instructions": [
            "Step 1: Mince the beef. Using a very sharp, heavy knife, finely mince the cold beef by hand. Do not use a meat grinder, which crushes the fibers into a paste. The texture should be small, distinct pieces.",
            "Step 2: Prepare the butter. In a small saucepan, gently melt the niter kibbeh over very low heat until it is warm and liquid, but absolutely NOT hot. If it is hot, it will cook the beef.",
            "Step 3: Combine. Place the minced raw beef in a bowl. Pour the warm niter kibbeh over the meat.",
            "Step 4: Spice. Add the mitmita, korarima, and salt. Use your hands or a spoon to gently massage and mix the spiced butter evenly throughout the meat.",
            "Step 5: Serve. Serve immediately. 'Tire' (completely raw) is traditional. For 'Leb leb' (slightly warmed), place the bowl over a pot of barely simmering water for 1-2 minutes while stirring. It must not turn brown.",
            "Step 6: Accompaniments. Serve with injera, kocho (fermented false banana bread), and ayibe (mild, crumbly cheese to cut the heat)."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "raw",
              "celebration"
            ],
            "cookingMethods": [
              "mincing",
              "massaging"
            ]
          },
          "elementalProperties": {
            "Fire": 0.6,
            "Water": 0,
            "Earth": 0.4,
            "Air": 0
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Pluto"
            ],
            "signs": [
              "Scorpio",
              "Aries"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 52,
            "carbsG": 2,
            "fatG": 28,
            "fiberG": 1,
            "sodiumMg": 650,
            "sugarG": 0,
            "vitamins": [
              "Vitamin B12",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },

          alchemicalProperties: {"Spirit":1.23,"Essence":1.53,"Matter":2.82,"Substance":2.8},
          thermodynamicProperties: {"heat":0.0329,"entropy":0.4305,"reactivity":1.1626,"gregsEnergy":-0.4676,"kalchm":0.0074,"monica":0.8752},
          "substitutions": [
            {
              "originalIngredient": "raw beef",
              "substituteOptions": [
                "no substitute. Do not attempt with standard grocery ground beef."
              ]
            }
          ]
        },
            {
              "name": "Authentic Bobotie",
              "description": "The national dish of South Africa. A complex, spiced minced meat bake topped with a savory egg custard and baked until the surface is golden and set, reflecting a fusion of Dutch and Indonesian influences.",
              "details": {
                "cuisine": "South African",
                "prepTimeMinutes": 20,
                "cookTimeMinutes": 45,
                "baseServingSize": 6,
                "spiceLevel": "Medium",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Ground beef",
                  "notes": "Lean."
                },
                {
                  "amount": 2,
                  "unit": "slices",
                  "name": "White bread",
                  "notes": "Soaked in milk."
                }
              ],
              "instructions": [
                "Step 1: Sauté meat with aromatics and curry spices.",
                "Step 2: Fold in soaked bread.",
                "Step 3: Spread into baking dish.",
                "Step 4: Pour egg-milk custard over the top.",
                "Step 5: Bake at 350°F until golden."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "baking"
                ]
              },
              "elementalProperties": {
                "Fire": 0.25,
                "Water": 0.2,
                "Earth": 0.45,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Jupiter"
                ],
                "signs": [
                  "sagittarius"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 28,
                "carbsG": 12,
                "fatG": 32,
                "fiberG": 2,
                "sodiumMg": 650,
                "sugarG": 8,
                "vitamins": [
                  "Vitamin B12"
                ],
                "minerals": [
                  "Iron"
                ]
              },

              alchemicalProperties: {"Spirit":0.45,"Essence":0.71,"Matter":1.07,"Substance":0.97},
              thermodynamicProperties: {"heat":0.0216,"entropy":0.2059,"reactivity":0.7618,"gregsEnergy":-0.1352,"kalchm":0.5245,"monica":0.4376},
              "substitutions": []
            },
            {
              "name": "Authentic Peri-Peri Chicken",
              "description": "A high-kinetic, fiercely spicy Mozambican/Portuguese fusion. Chicken is marinated in a violent emulsion of bird's eye chilies, lemon, and garlic, then grilled over high heat until charred and electric.",
              "details": {
                "cuisine": "African (Mozambican)",
                "prepTimeMinutes": 60,
                "cookTimeMinutes": 20,
                "baseServingSize": 4,
                "spiceLevel": "Very High",
                "season": [
                  "summer"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "whole",
                  "name": "Chicken",
                  "notes": "Spatchcocked."
                },
                {
                  "amount": 0.5,
                  "unit": "cup",
                  "name": "Peri-Peri sauce",
                  "notes": "Homemade with bird's eye chilies."
                }
              ],
              "instructions": [
                "Step 1: Spatchcock the chicken.",
                "Step 2: Marinate in peri-peri sauce for 24 hours.",
                "Step 3: Grill over high heat, skin-side down first.",
                "Step 4: Baste continuously with marinade.",
                "Step 5: Rest before carving."
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
                "Fire": 0.65,
                "Water": 0.05,
                "Earth": 0.2,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Mars"
                ],
                "signs": [
                  "aries"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 480,
                "proteinG": 42,
                "carbsG": 2,
                "fatG": 34,
                "fiberG": 0,
                "sodiumMg": 850,
                "sugarG": 1,
                "vitamins": [
                  "Vitamin C"
                ],
                "minerals": [
                  "Zinc"
                ]
              },

              alchemicalProperties: {"Spirit":0.43,"Essence":1.0,"Matter":1.0,"Substance":1.0},
              thermodynamicProperties: {"heat":0.0541,"entropy":0.3195,"reactivity":1.8194,"gregsEnergy":-0.5271,"kalchm":0.6957,"monica":0.4376},
              "substitutions": []
            },
            {
              "name": "Authentic Bunny Chow",
              "description": "Durban's structural masterpiece. A hollowed-out loaf of white bread serves as a vessel for a fiercely hot, slow-simmered lamb or bean curry, designed to be eaten entirely with the hands.",
              "details": {
                "cuisine": "South African (Durban)",
                "prepTimeMinutes": 15,
                "cookTimeMinutes": 60,
                "baseServingSize": 2,
                "spiceLevel": "High",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "loaf",
                  "name": "White bread",
                  "notes": "Unsliced."
                },
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Lamb or mutton",
                  "notes": "Curried."
                }
              ],
              "instructions": [
                "Step 1: Prepare a thick, spicy lamb curry.",
                "Step 2: Hollow out a half-loaf of bread.",
                "Step 3: Fill the cavity with curry.",
                "Step 4: Place the removed bread 'plug' on top.",
                "Step 5: Serve with carrot salad."
              ],
              "classifications": {
                "mealType": [
                  "lunch"
                ],
                "cookingMethods": [
                  "simmering",
                  "assembling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.4,
                "Water": 0.1,
                "Earth": 0.45,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Saturn"
                ],
                "signs": [
                  "capricorn"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 750,
                "proteinG": 35,
                "carbsG": 85,
                "fatG": 38,
                "fiberG": 6,
                "sodiumMg": 1200,
                "sugarG": 4,
                "vitamins": [
                  "Iron"
                ],
                "minerals": [
                  "Zinc"
                ]
              },

              alchemicalProperties: {"Spirit":0.65,"Essence":0.76,"Matter":1.02,"Substance":0.92},
              thermodynamicProperties: {"heat":0.0535,"entropy":0.2637,"reactivity":0.9343,"gregsEnergy":-0.1929,"kalchm":0.6492,"monica":0.4188},
              "substitutions": []
            },
            {
              "name": "Authentic Suya",
              "description": "The iconic West African street food. Skewered beef is coated in 'Yaji'—a potent, high-protein spice matrix made from ground peanuts, ginger, and chilies—then grilled rapidly to a smoky finish.",
              "details": {
                "cuisine": "West African (Nigerian)",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 10,
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
                  "name": "Beef flank",
                  "notes": "Sliced paper-thin."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Kuli-Kuli powder",
                  "notes": "Ground peanut cake."
                }
              ],
              "instructions": [
                "Step 1: Slice beef against the grain thinly.",
                "Step 2: Coat slices heavily in Yaji spice mix.",
                "Step 3: Skewer the meat.",
                "Step 4: Grill over charcoal until charred.",
                "Step 5: Serve with raw onions and extra spice."
              ],
              "classifications": {
                "mealType": [
                  "snack",
                  "dinner"
                ],
                "cookingMethods": [
                  "grilling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.55,
                "Water": 0.05,
                "Earth": 0.3,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Mars"
                ],
                "signs": [
                  "aries"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 45,
                "carbsG": 8,
                "fatG": 22,
                "fiberG": 2,
                "sodiumMg": 750,
                "sugarG": 2,
                "vitamins": [
                  "Vitamin B12"
                ],
                "minerals": [
                  "Iron"
                ]
              },

              alchemicalProperties: {"Spirit":0.5,"Essence":0.75,"Matter":1.2,"Substance":1.15},
              thermodynamicProperties: {"heat":0.0438,"entropy":0.3563,"reactivity":1.0889,"gregsEnergy":-0.3442,"kalchm":0.3899,"monica":0.4376},
              "substitutions": []
            },
            {
              "name": "Authentic Ndolé",
              "description": "Cameroon's nutritional titan. A dense, savory stew of bitterleaves, ground peanuts, and crayfish, resulting in a complex, creamy, and slightly bitter profile that is deeply restorative.",
              "details": {
                "cuisine": "Cameroonian",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 60,
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
                  "name": "Bitterleaves",
                  "notes": "Washed multiple times to reduce bitterness."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Ground peanuts",
                  "notes": "Freshly boiled and blended."
                }
              ],
              "instructions": [
                "Step 1: Wash bitterleaves vigorously.",
                "Step 2: Blend boiled peanuts into a paste.",
                "Step 3: Sauté meat/shrimp with aromatics.",
                "Step 4: Stir in peanut paste and bitterleaves.",
                "Step 5: Simmer until thick and creamy."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "simmering"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.3,
                "Earth": 0.5,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Saturn"
                ],
                "signs": [
                  "virgo"
                ],
                "lunarPhases": [
                  "Waning Crescent"
                ]
              },
              "nutritionPerServing": {
                "calories": 520,
                "proteinG": 38,
                "carbsG": 15,
                "fatG": 38,
                "fiberG": 12,
                "sodiumMg": 850,
                "sugarG": 4,
                "vitamins": [
                  "Vitamin A",
                  "Vitamin K"
                ],
                "minerals": [
                  "Iron",
                  "Magnesium"
                ]
              },

              alchemicalProperties: {"Spirit":0.49,"Essence":0.55,"Matter":0.69,"Substance":0.67},
              thermodynamicProperties: {"heat":0.0345,"entropy":0.1716,"reactivity":0.7814,"gregsEnergy":-0.0996,"kalchm":0.8573,"monica":-0.0188},
              "substitutions": []
            }
        ],
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    dessert: {
      all: [
        {
          "name": "Authentic South African Malva Pudding",
          "description": "A dense, sponge-like Cape Dutch dessert. The alchemy involves baking a batter enriched with apricot jam and vinegar (which activates the baking soda for lift), then immediately pouring a massive volume of boiling cream-and-butter syrup over the hot cake. The spongy crumb acts as a reservoir, absorbing the liquid to create a sticky, caramelized, pudding-like consistency.",
          "details": {
            "cuisine": "South African",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 45,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "all-purpose flour",
              "notes": "For the batter."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the batter."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Room temperature."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "apricot jam",
              "notes": "Crucial for the signature flavor."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "butter",
              "notes": "Melted, for the batter."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "baking soda",
              "notes": "Leavening agent."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "milk",
              "notes": "For the batter."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "vinegar (white or brown)",
              "notes": "Reacts with the baking soda."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "heavy cream",
              "notes": "For the sauce."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "butter",
              "notes": "For the sauce."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "sugar",
              "notes": "For the sauce."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "water or brandy",
              "notes": "For the sauce."
            }
          ],
          "instructions": [
            "Step 1: The Batter. Preheat oven to 350°F (175°C). Grease an 8x8 inch baking dish.",
            "Step 2: Creaming. Beat the sugar and egg together until pale and thick. Beat in the apricot jam.",
            "Step 3: Melt the 1 tbsp butter and whisk in the vinegar.",
            "Step 4: Mix. Sift the flour and baking soda together. Fold the dry ingredients into the egg mixture alternately with the milk. Lastly, fold in the butter/vinegar mixture.",
            "Step 5: Bake. Pour the batter into the greased dish. Bake for 30-40 minutes until deeply browned and a skewer comes out clean.",
            "Step 6: The Sauce (The Shock). Five minutes before the pudding is done, combine the heavy cream, 1/2 cup butter, 1/2 cup sugar, and water/brandy in a saucepan. Bring to a rolling boil until the sugar dissolves.",
            "Step 7: The Pour. Remove the baked pudding from the oven. Using a skewer, poke holes all over the surface. Immediately pour the boiling hot sauce slowly and evenly over the hot pudding. It will look like too much liquid, but the sponge will absorb it all.",
            "Step 8: Rest. Let the pudding sit in a warm place for 15 minutes to fully absorb the sauce before serving hot with custard or ice cream."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "baking"
            ],
            "cookingMethods": [
              "baking",
              "boiling",
              "soaking"
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
            "calories": 480,
            "proteinG": 4,
            "carbsG": 58,
            "fatG": 28,
            "fiberG": 1,
            "sodiumMg": 280,
            "sugarG": 42,
            "vitamins": [
              "Vitamin A"
            ],
            "minerals": [
              "Calcium"
            ]
          },

          alchemicalProperties: {"Spirit":2.53,"Essence":4.8,"Matter":4.93,"Substance":4.15},
          thermodynamicProperties: {"heat":0.0296,"entropy":0.2176,"reactivity":1.7483,"gregsEnergy":-0.3508,"kalchm":0.0204,"monica":0.8564},
          "substitutions": [
            {
              "originalIngredient": "apricot jam",
              "substituteOptions": [
                "peach preserve"
              ]
            },
            {
              "originalIngredient": "heavy cream",
              "substituteOptions": [
                "evaporated milk (for a lighter sauce)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Nigerian Coconut Chin Chin",
          "description": "A structurally resilient, deep-fried West African snack. The dough is intentionally low-hydration and heavily kneaded to develop gluten, ensuring the resulting squares fry into rigid, fiercely crunchy, biscuit-like nuggets that can be stored for weeks. Coconut milk adds a subtle, tropical lipid profile.",
          "details": {
            "cuisine": "West African (Nigeria)",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 20,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "all",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "cups",
              "name": "all-purpose flour",
              "notes": "Sifted."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For sweetness."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "baking powder",
              "notes": "Provides a very slight lift so they aren't rock hard."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "ground nutmeg",
              "notes": "Essential signature aromatic."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "unsalted butter or margarine",
              "notes": "Cold, cut into small cubes."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Binder."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "coconut milk",
              "notes": "Used sparingly to bind the dry dough."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "vegetable oil",
              "notes": "For deep frying."
            }
          ],
          "instructions": [
            "Step 1: Dry Mix. In a large bowl, mix the flour, sugar, baking powder, and nutmeg.",
            "Step 2: Cut in Fat. Add the cold butter cubes. Use your fingertips to rub the butter into the flour until the mixture resembles coarse breadcrumbs.",
            "Step 3: Bind. Make a well in the center. Add the egg and the coconut milk. Mix with your hands until it forms a stiff dough. It should be much harder and less sticky than bread dough. If it's too crumbly, add 1 tbsp of water.",
            "Step 4: Knead and Rest. Turn the dough out and knead it until smooth (about 3 minutes). Let it rest for 15 minutes to relax the gluten for easier rolling.",
            "Step 5: Roll. Divide the dough into 4 sections. On a floured surface, roll one section out flat to about 1/4-inch thickness.",
            "Step 6: Cut. Using a pizza cutter or sharp knife, cut the dough into a grid of small 1/2-inch squares (or thin rectangles).",
            "Step 7: Heat Oil. Heat the oil in a deep pot to 350°F (175°C).",
            "Step 8: Fry. Drop a handful of the cut dough pieces into the oil. They will sink, then rise. Stir continuously with a slotted spoon to ensure they brown evenly.",
            "Step 9: Cool. Fry until golden brown (they will darken slightly after removing). Drain on paper towels. They will harden significantly as they cool completely."
          ],
          "classifications": {
            "mealType": [
              "snack",
              "dessert"
            ],
            "cookingMethods": [
              "kneading",
              "rolling",
              "deep-frying"
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
              "Venus",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Aries"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 5,
            "carbsG": 48,
            "fatG": 16,
            "fiberG": 1,
            "sodiumMg": 85,
            "sugarG": 18,
            "vitamins": [
              "Vitamin A"
            ],
            "minerals": [
              "Iron"
            ]
          },

          alchemicalProperties: {"Spirit":1.77,"Essence":2.68,"Matter":3.37,"Substance":2.91},
          thermodynamicProperties: {"heat":0.036,"entropy":0.2744,"reactivity":1.3342,"gregsEnergy":-0.33,"kalchm":0.0287,"monica":0.9862},
          "substitutions": [
            {
              "originalIngredient": "coconut milk",
              "substituteOptions": [
                "evaporated milk",
                "water"
              ]
            },
            {
              "originalIngredient": "butter",
              "substituteOptions": [
                "margarine (very common in West Africa for this)"
              ]
            }
          ]
        },
        {
          "name": "Authentic South African Koeksister",
          "description": "An intense feat of pastry engineering. A deeply braided dough is deep-fried to a crisp golden brown, then plunged instantly from the boiling oil into ice-cold spiced syrup. The extreme temperature shock causes the dough to violently absorb the syrup, resulting in a crunchy exterior that gushes sweet liquid when bitten.",
          "details": {
            "cuisine": "South African",
            "prepTimeMinutes": 180,
            "cookTimeMinutes": 30,
            "baseServingSize": 12,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "cups",
              "name": "granulated sugar",
              "notes": "For the syrup. Made the day before."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "water",
              "notes": "For the syrup."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "cream of tartar",
              "notes": "Prevents the heavy syrup from crystallizing."
            },
            {
              "amount": 1,
              "unit": "piece",
              "name": "fresh ginger",
              "notes": "Bruised, for the syrup."
            },
            {
              "amount": 1,
              "unit": "stick",
              "name": "cinnamon",
              "notes": "For the syrup."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "all-purpose flour",
              "notes": "For the dough."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "butter",
              "notes": "Rubbed into the flour."
            },
            {
              "amount": 2,
              "unit": "tsp",
              "name": "baking powder",
              "notes": "Leavening."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "milk or water",
              "notes": "To bind the dough."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "neutral oil",
              "notes": "For frying."
            }
          ],
          "instructions": [
            "Step 1: The Syrup (Day Before). Boil sugar, water, ginger, and cinnamon stick until the sugar dissolves. Add the cream of tartar. Simmer for 10 mins. Remove from heat, let cool, and place in the freezer or refrigerator overnight. It MUST be ice cold when used.",
            "Step 2: The Dough. Rub the butter into the flour and baking powder. Add the milk/water and knead until a smooth, pliable dough forms. Let rest under a damp cloth for 1 hour.",
            "Step 3: Shaping. Roll the dough out to a 1/4-inch thickness. Cut into rectangles (2x3 inches). Make two longitudinal cuts in each rectangle, leaving one end intact, to create three 'legs'.",
            "Step 4: The Braid. Plait the three legs tightly together, pinching the loose ends firmly to seal them. Cover the braided dough while you heat the oil.",
            "Step 5: The Setup. Have your deep fryer at 350°F (175°C). Place the bowl of ice-cold syrup right next to the stove. (Keep the syrup bowl sitting in a larger bowl of ice to keep it cold).",
            "Step 6: Fry. Fry the braided dough until golden brown and crispy on both sides (about 3 mins).",
            "Step 7: The Shock. Using a slotted spoon, lift a hot koeksister from the oil, let it drain for 1 second, and plunge it completely into the ice-cold syrup. Push it down so it submerges.",
            "Step 8: Soak. Leave it in the cold syrup for 1 minute to absorb the liquid. Remove and place on a wire rack to drain. Keep refrigerated; they are eaten cold and sticky."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "sweet",
              "pastry"
            ],
            "cookingMethods": [
              "braiding",
              "deep-frying",
              "shock-soaking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.3,
            "Water": 0.4,
            "Earth": 0.2,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus",
              "Pluto"
            ],
            "signs": [
              "Scorpio",
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 3,
            "carbsG": 65,
            "fatG": 14,
            "fiberG": 1,
            "sodiumMg": 120,
            "sugarG": 48,
            "vitamins": [
              "None"
            ],
            "minerals": [
              "Iron"
            ]
          },

          alchemicalProperties: {"Spirit":2.74,"Essence":4.04,"Matter":4.16,"Substance":3.62},
          thermodynamicProperties: {"heat":0.0485,"entropy":0.2675,"reactivity":1.9566,"gregsEnergy":-0.4748,"kalchm":0.1125,"monica":1.3128},
          "substitutions": [
            {
              "originalIngredient": "cream of tartar",
              "substituteOptions": [
                "1 tsp lemon juice (to prevent crystallization)"
              ]
            }
          ]
        },
      ],
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
  },
  cookingTechniques: [
    {
      name: "Slow Simmering",
      description:
        "Long, gentle cooking of stews and sauces to develop deep flavors",
      elementalProperties: { Water: 0.5, Earth: 0.3, Fire: 0.2, Air: 0.0 },
      toolsRequired: ["heavy-bottomed pot", "wooden spoon", "heat diffuser"],
      bestFor: ["stews", "sauces", "tough cuts of meat", "legumes"],
      difficulty: "easy",
    },
    {
      name: "Hand Pounding",
      description:
        "Traditional technique using mortar and pestle to create pastes and spice blends",
      elementalProperties: { Earth: 0.6, Fire: 0.2, Water: 0.1, Air: 0.1 },
      toolsRequired: ["mortar and pestle", "sieve"],
      bestFor: ["spice blends", "sauces", "pounded yam", "fufu"],
      difficulty: "medium",
    },
    {
      name: "Clay Pot Cooking",
      description:
        "Slow cooking in unglazed clay pots that enhance flavors and maintain moisture",
      elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.2, Air: 0.0 },
      toolsRequired: ["clay pot", "heat diffuser", "wooden spoon"],
      bestFor: ["stews", "tagines", "rice dishes", "beans"],
      difficulty: "medium",
    },
    {
      name: "Charcoal Grilling",
      description: "Direct heat cooking over open charcoal for smoky flavor",
      elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0.0 },
      toolsRequired: ["charcoal grill", "skewers", "tongs"],
      bestFor: ["suya", "kebabs", "whole fish", "vegetables"],
      difficulty: "easy",
    },
    {
      name: "Fermentation",
      description:
        "Traditional preservation technique that develops complex flavors and probiotics",
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      toolsRequired: ["clay pots", "wooden tools", "weights"],
      bestFor: ["injera", "ogi", "garri", "fermented locust beans"],
      difficulty: "hard",
    },
  ],
  regionalCuisines: {
    northAfrican: {
      name: "North African Cuisine",
      description:
        "Mediterranean and Arabic influenced cuisine featuring tagines, couscous, and aromatic spices",
      signature: ["tagine", "couscous", "harissa", "shakshuka"],
      elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Mars", "Venus", "Mercury"],
      seasonality: "all",
    },
    westAfrican: {
      name: "West African Cuisine",
      description:
        "Bold, spicy cuisine with staples like rice, cassava, plantains and palm oil",
      signature: ["jollof rice", "fufu", "peanut stew", "egusi soup"],
      elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
      astrologicalInfluences: ["Jupiter", "Saturn", "Mars"],
      seasonality: "all",
    },
    eastAfrican: {
      name: "East African Cuisine",
      description:
        "Diverse cuisine influenced by Arabic, Indian and indigenous traditions",
      signature: ["injera with wat", "ugali", "pilau", "berbere spice"],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Sun", "Mars", "Saturn"],
      seasonality: "all",
    },
    southernAfrican: {
      name: "Southern African Cuisine",
      description:
        "Hearty cuisine combining indigenous, Dutch, Malaysian and British influences",
      signature: ["bobotie", "biltong", "pap", "chakalaka"],
      elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Venus", "Jupiter"],
      seasonality: "all",
    },
  },
  elementalProperties: {
    Earth: 0.4,
    Fire: 0.3,
    Water: 0.2,
    Air: 0.1,
  },
};
