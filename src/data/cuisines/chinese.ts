// src/data/cuisines/chinese.ts
export const chinese = {
  name: "Chinese",
  description:
    "Traditional Chinese cuisine with balanced flavors, varied techniques, and regional specialties. Known for harmony in taste, color, and nutrition.",
  traditionalSauces: {
    soy: {
      name: "Soy Sauce",
      description:
        "Fermented soybean sauce that forms the foundation of Chinese cooking",
      base: "fermented soybeans",
      keyIngredients: ["soybeans", "wheat", "salt", "fermenting agents"],
      culinaryUses: [
        "marinades",
        "dipping sauce",
        "flavor base",
        "coloring agent",
      ],
      variants: ["Light soy", "Dark soy", "Sweet soy", "Double black"],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.3,
        Fire: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Saturn", "Neptune", "capricorn"],
      seasonality: "all",
      preparationNotes:
        "Traditionally fermented for months or years to develop complexity",
      technicalTips:
        "Use light soy for flavor, dark soy for color and deeper notes",
    },
    hoisin: {
      name: "Hoisin Sauce",
      description: "Sweet and savory sauce with a thick consistency",
      base: "fermented soybeans",
      keyIngredients: [
        "fermented soybean paste",
        "garlic",
        "chili",
        "sugar",
        "spices",
      ],
      culinaryUses: ["glazing", "dipping", "stir-fry sauce", "marinade"],
      variants: ["Cantonese style", "Northern style", "Spicy hoisin"],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Venus", "Jupiter", "taurus"],
      seasonality: "all",
      preparationNotes:
        "Balance of sweet and savory can vary by region and brand",
      technicalTips: "Thin with water or rice wine for a lighter glaze",
    },
    xo: {
      name: "XO Sauce",
      description: "Luxury seafood sauce with deep umami flavors",
      base: "dried seafood",
      keyIngredients: [
        "dried scallops",
        "dried shrimp",
        "Jinhua ham",
        "chili",
        "garlic",
        "shallots",
      ],
      culinaryUses: [
        "flavor enhancer",
        "stir-fries",
        "noodle dishes",
        "premium condiment",
      ],
      variants: ["Traditional Hong Kong style", "Spicy XO", "Vegetarian XO"],
      elementalProperties: {
        Water: 0.4,
        Fire: 0.3,
        Earth: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Mars", "scorpio"],
      seasonality: "all",
      preparationNotes:
        "Traditionally requires expensive ingredients and significant preparation time",
      technicalTips: "A little goes a long way - use sparingly to add depth",
    },
    black_bean: {
      name: "Black Bean Sauce",
      description: "Savory sauce made from fermented black soybeans",
      base: "fermented black soybeans",
      keyIngredients: [
        "fermented black soybeans",
        "garlic",
        "soy sauce",
        "rice wine",
      ],
      culinaryUses: [
        "stir-fries",
        "steamed dishes",
        "marinades",
        "flavor base",
      ],
      variants: [
        "Garlic black bean",
        "Chili black bean",
        "Douchi (whole beans)",
      ],
      elementalProperties: {
        Earth: 0.5,
        Water: 0.2,
        Fire: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Pluto", "Saturn", "capricorn"],
      seasonality: "all",
      preparationNotes:
        "Beans are typically rinsed before use to moderate saltiness",
      technicalTips: "Mash beans slightly to release more flavor when cooking",
    },
    oyster: {
      name: "Oyster Sauce",
      description:
        "Rich, savory sauce with sweet undertones made from oyster extracts",
      base: "oyster extract",
      keyIngredients: [
        "oyster extract",
        "sugar",
        "salt",
        "cornstarch",
        "soy sauce",
      ],
      culinaryUses: [
        "stir-fries",
        "marinades",
        "dipping sauce",
        "flavor enhancer",
      ],
      variants: ["Premium", "Vegetarian (mushroom-based)"],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Fire: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Neptune", "Moon", "pisces"],
      seasonality: "all",
      preparationNotes: "Modern versions are thickened with cornstarch",
      technicalTips: "Add at the end of cooking to preserve flavor complexity",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: ["oyster sauce", "black bean sauce", "hoisin sauce"],
      beef: ["black bean sauce", "oyster sauce", "soy sauce"],
      pork: ["sweet and sour sauce", "hoisin sauce", "black bean sauce"],
      fish: [
        "ginger-scallion sauce",
        "sweet soy glaze",
        "Sichuan garlic sauce",
      ],
      tofu: ["mapo sauce", "brown bean sauce", "garlic sauce"],
    },
    forVegetable: {
      leafy: ["garlic sauce", "oyster sauce", "light soy sauce"],
      root: ["brown bean sauce", "XO sauce", "sweet and sour sauce"],
      mushrooms: ["oyster sauce", "ginger sauce", "light soy sauce"],
      eggplant: ["garlic sauce", "yuxiang sauce", "sweet bean sauce"],
      beans: ["sichuan pepper oil", "black bean sauce", "chili garlic sauce"],
    },
    forCookingMethod: {
      stir_fry: ["light soy sauce", "oyster sauce", "hoisin sauce"],
      steaming: ["ginger-scallion oil", "black bean sauce", "light soy sauce"],
      braising: ["master stock", "dark soy sauce", "red cooking sauce"],
      roasting: ["maltose glaze", "five-spice marinade", "hoisin sauce"],
      boiling: ["dipping sauce", "chili oil", "sesame sauce"],
    },
    byAstrological: {
      Fire: ["chili oil", "spicy bean paste", "XO sauce"],
      Earth: ["dark soy sauce", "black bean sauce", "hoisin sauce"],
      Air: ["white pepper sauce", "light vinegar dressing", "clear broths"],
      Water: ["oyster sauce", "ginger sauce", "delicate seafood-based sauces"],
    },
    byRegion: {
      cantonese: ["oyster sauce", "hoisin sauce", "sweet soy sauce"],
      sichuan: ["chili oil", "doubanjiang", "fish-fragrant sauce"],
      hunan: ["black bean chili sauce", "sour-hot sauce", "salted chili sauce"],
      shanghainese: ["sweet soy sauce", "rice wine sauce", "red cooking sauce"],
      northern: ["bean paste", "garlic sauce", "sesame paste"],
    },
    byDietary: {
      vegetarian: ["mushroom sauce", "sweet bean sauce", "light soy sauce"],
      vegan: ["garlic sauce", "rice vinegar dressing", "sweet and sour sauce"],
      glutenFree: ["tamari", "rice wine sauce", "ginger scallion sauce"],
      dairyFree: ["light soy sauce", "black bean sauce", "garlic sauce"],
    },
  },
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Chinese Congee (Jook)",
          "description": "The ultimate restorative foundation of Chinese comfort food. It relies on the prolonged, violent boiling of rice grains in excess liquid until the structural integrity of the starch completely breaks down, resulting in a thick, velvety, homogenized suspension.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 90,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "winter",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "jasmine rice",
              "notes": "Rinsed well."
            },
            {
              "amount": 8,
              "unit": "cups",
              "name": "water or chicken broth",
              "notes": "High liquid-to-rice ratio is essential (usually 8:1 to 10:1)."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "neutral oil",
              "notes": "Mixed with the raw rice before boiling to help the grains burst open."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 1,
              "unit": "piece (2-inch)",
              "name": "fresh ginger",
              "notes": "Julienned, added during cooking."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "scallions",
              "notes": "Finely sliced, for garnish."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "white pepper",
              "notes": "Freshly ground, for serving."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For seasoning at the table."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "sesame oil",
              "notes": "For finishing."
            }
          ],
          "instructions": [
            "Step 1: Prep the rice. Rinse the rice until water is clear. Drain completely. Toss the raw rice with the neutral oil and 1 tsp of salt. Let it sit for 30 minutes; this breaks down the grain surface so it cooks faster and silkier.",
            "Step 2: The Boil. In a large, heavy-bottomed pot, bring the water/broth to a rolling boil. Add the oil-coated rice and the julienned ginger.",
            "Step 3: The Simmer. Once boiling again, reduce heat to low. The pot must maintain a gentle, continuous simmer. Cover partially with a lid to allow steam to escape.",
            "Step 4: Agitation. Simmer for 1.5 hours. You MUST stir the congee thoroughly every 10-15 minutes, scraping the bottom of the pot. This agitation helps the starch release and prevents burning.",
            "Step 5: The Consistency. The congee is done when the grains are completely blown open and it looks like a thick, creamy soup. Add boiling water if it gets too thick.",
            "Step 6: Serve hot. Diners customize their bowls with scallions, white pepper, soy sauce, sesame oil, and crispy Youtiao."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "comfort food",
              "vegan"
            ],
            "cookingMethods": [
              "boiling",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.6,
            "Earth": 0.25,
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
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 210,
            "proteinG": 5,
            "carbsG": 42,
            "fatG": 4,
            "fiberG": 1,
            "sodiumMg": 580,
            "sugarG": 0,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0005,"reactivity":0.8637,"gregsEnergy":-0.0,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "chicken broth",
              "substituteOptions": [
                "water",
                "vegetable broth"
              ]
            },
            {
              "originalIngredient": "jasmine rice",
              "substituteOptions": [
                "short grain white rice"
              ]
            }
          ]
        },
        {
          "name": "Authentic Youtiao (Chinese Fried Dough)",
          "description": "A structural engineering marvel of the breakfast world. The dough utilizes the explosive chemical reaction of baking powder, baking soda, and ammonium bicarbonate (alum). When a pair of the dough strips are pressed together and violently stretched into screaming hot oil, they expand rapidly, creating massive internal air pockets within a shatteringly crisp exterior.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 240,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2.5,
              "unit": "cups",
              "name": "all-purpose flour",
              "notes": "Medium protein is best."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "baking powder",
              "notes": "Leavening."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "baking soda",
              "notes": "Leavening."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Flavor."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Optional, but adds slight richness and structure."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "vegetable oil",
              "notes": "For the dough, plus much more for frying."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "water",
              "notes": "Room temperature."
            }
          ],
          "instructions": [
            "Step 1: The Dough. In a large bowl, whisk the flour, baking powder, baking soda, and salt. Add the egg, 1 tbsp oil, and water. Mix into a shaggy dough.",
            "Step 2: The 'Punching' Knead. Do not fold the dough like bread. Instead, use your knuckles to repeatedly punch the dough down into the bowl, folding it over itself occasionally. Knead like this for 5 minutes until smooth. It will be slightly sticky.",
            "Step 3: The Rest. Coat the dough lightly in oil, wrap it very tightly in plastic wrap, and refrigerate for at least 4 hours, or overnight. This relaxes the gluten completely so it can be stretched without tearing.",
            "Step 4: Prep to fry. Take the dough out 1 hour before frying so it comes to room temperature. Do NOT knead it again.",
            "Step 5: Heat the oil. Heat a deep wok or pot of oil to exactly 390°F (200°C). It must be very hot.",
            "Step 6: Shaping. Gently stretch the dough on an un-floured surface into a long rectangle, about 1/4 inch thick. Cut the rectangle into 1-inch wide strips.",
            "Step 7: The Stack. Stack one strip directly on top of another. Press a chopstick lengthwise firmly down the center of the stacked strips to seal them together.",
            "Step 8: The Stretch and Fry. Grab both ends of the stacked strip, gently pull to stretch it to about 10 inches long, and carefully drop it into the hot oil.",
            "Step 9: Agitate. Immediately and continuously flip the dough back and forth in the oil using chopsticks. It will puff up massively and rapidly. Fry until deep golden brown. Drain and serve hot."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack",
              "street food"
            ],
            "cookingMethods": [
              "kneading",
              "resting",
              "deep-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.45,
            "Water": 0.1,
            "Earth": 0.2,
            "Air": 0.25
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Uranus"
            ],
            "signs": [
              "Aries",
              "Aquarius"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 7,
            "carbsG": 52,
            "fatG": 16,
            "fiberG": 2,
            "sodiumMg": 380,
            "sugarG": 1,
            "vitamins": [
              "Vitamin E"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0098,"entropy":0.0143,"reactivity":0.8833,"gregsEnergy":-0.0029,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "egg",
              "substituteOptions": [
                "extra 2 tbsp of water (for vegan youtiao)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Sweet/Savory Soy Milk Soup (Dou Jiang)",
          "description": "The essential pairing for Youtiao. True Chinese breakfast soy milk is made from scratch, utilizing the slow, methodical soaking and grinding of raw yellow soybeans. It is served either sweetened with sugar, or in a highly complex savory version (Xian Dou Jiang) where the hot milk is deliberately curdled with black vinegar, creating a silken tofu-like soup.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 30,
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
              "name": "dried yellow soybeans",
              "notes": "Must be dried, not canned. Soaked overnight."
            },
            {
              "amount": 6,
              "unit": "cups",
              "name": "water",
              "notes": "Filtered water for blending."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "granulated sugar",
              "notes": "For the sweet version."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "black rice vinegar (Chinkiang)",
              "notes": "For the savory version (Xian Dou Jiang). Acts as a coagulant."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For the savory version."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sesame oil",
              "notes": "For the savory version."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "dried baby shrimp",
              "notes": "For the savory version."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "pickled mustard greens (zha cai)",
              "notes": "Finely chopped, for the savory version."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "scallions",
              "notes": "Finely chopped, for the savory version."
            },
            {
              "amount": 2,
              "unit": "pieces",
              "name": "Youtiao (fried dough)",
              "notes": "Torn into chunks for dipping/soaking."
            }
          ],
          "instructions": [
            "Step 1: Soak. Cover the dried soybeans with 3 inches of water and soak overnight (10-12 hours). They will expand significantly. Drain and rinse.",
            "Step 2: Grind. Place the soaked soybeans in a high-powered blender with 3 cups of fresh water. Blend on high for 2 minutes until it becomes a milky, frothy puree.",
            "Step 3: Extract. Pour the puree into a nut-milk bag or a fine-mesh sieve lined with cheesecloth set over a large pot. Squeeze the bag as hard as possible to extract all the soy milk. The dry pulp left behind is called okara (discard or save for other uses). Blend the okara again with the remaining 3 cups of water and squeeze again.",
            "Step 4: Boil. Place the pot of raw soy milk over medium heat. It will foam aggressively. As it nears boiling, reduce the heat to low and skim the foam. Boil gently for 15-20 minutes. It MUST be boiled thoroughly to destroy naturally occurring toxins in raw soy. Stir frequently to prevent burning on the bottom.",
            "Step 5: For Sweet Dou Jiang. Stir in the sugar until dissolved. Serve hot with Youtiao.",
            "Step 6: For Savory Dou Jiang (Xian Dou Jiang). In individual serving bowls, place 1/2 tbsp black vinegar, 1/4 tbsp soy sauce, a few drops sesame oil, dried shrimp, pickled greens, and scallions.",
            "Step 7: The Curdle. Pour the boiling hot, unsweetened soy milk aggressively into the prepared bowls. The acid in the vinegar will instantly react with the hot soy protein, causing it to curdle beautifully into soft, silken clouds.",
            "Step 8: Top with torn pieces of Youtiao and a drizzle of chili oil."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "beverage",
              "soup"
            ],
            "cookingMethods": [
              "soaking",
              "blending",
              "boiling",
              "curdling"
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
              "Moon",
              "Uranus"
            ],
            "signs": [
              "Cancer",
              "Aquarius"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 250,
            "proteinG": 18,
            "carbsG": 15,
            "fatG": 12,
            "fiberG": 4,
            "sodiumMg": 480,
            "sugarG": 6,
            "vitamins": [
              "Vitamin K",
              "B Vitamins"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.001,"entropy":0.0014,"reactivity":0.9502,"gregsEnergy":-0.0004,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "black vinegar",
              "substituteOptions": [
                "rice vinegar (will alter the flavor slightly, but will still curdle)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Jianbing (Chinese Crepe)",
          "description": "The king of Chinese street food breakfasts. It is an architectural performance art: a thin, slightly elastic mung bean and wheat crepe is poured on a hot cast-iron griddle, coated in egg, slathered in fermented sweet and spicy sauces, and wrapped around a crispy, violently crunchy fried cracker (baocui) or youtiao.",
          "details": {
            "cuisine": "Chinese (Northern)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 10,
            "baseServingSize": 2,
            "spiceLevel": "Mild-Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "all-purpose flour",
              "notes": "For the crepe batter."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "mung bean flour",
              "notes": "Essential for the authentic flavor and slight chew."
            },
            {
              "amount": 1.25,
              "unit": "cups",
              "name": "water",
              "notes": "To thin the batter."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "One cracked over each crepe."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "Tianmianjiang (sweet bean sauce)",
              "notes": "The primary savory-sweet glaze."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "chili crisp or chili oil",
              "notes": "For heat."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "cilantro",
              "notes": "Finely chopped."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "scallions",
              "notes": "Finely chopped."
            },
            {
              "amount": 2,
              "unit": "pieces",
              "name": "Baocui (crispy fried cracker) or Youtiao",
              "notes": "Provides the essential structural crunch."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "black sesame seeds",
              "notes": "For garnish."
            }
          ],
          "instructions": [
            "Step 1: The Batter. Whisk the all-purpose flour, mung bean flour, and water together until completely smooth. The batter should be very thin, like a French crepe batter.",
            "Step 2: Heat the Griddle. Heat a large, flat cast-iron crepe pan or griddle over medium heat. Brush lightly with oil and wipe off the excess.",
            "Step 3: The Pour. Pour half the batter into the center of the pan. Using a crepe spreader or the back of a ladle, quickly spread the batter outward in a circular motion to form a large, thin, even circle.",
            "Step 4: The Egg. As soon as the batter sets (about 30 seconds), crack one egg directly onto the center of the crepe. Use the spreader to aggressively scramble the egg and smear it evenly across the entire surface of the crepe.",
            "Step 5: The Herbs. While the egg is still wet, sprinkle half the scallions, cilantro, and black sesame seeds over it so they stick to the cooking egg.",
            "Step 6: The Flip. Once the egg is mostly cooked and the bottom of the crepe releases easily, slide a large spatula under it and flip the entire crepe over.",
            "Step 7: The Sauces. Immediately brush the cooked (non-egg) side facing up with a generous layer of sweet bean sauce and chili crisp.",
            "Step 8: The Crunch and Fold. Place the crispy baocui or youtiao directly in the center. Fold the sides of the crepe over the crunch, then fold the top and bottom to create a neat, sealed rectangular package. Serve immediately while hot and crispy."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "street food",
              "snack"
            ],
            "cookingMethods": [
              "griddling",
              "assembling",
              "folding"
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
              "Mars"
            ],
            "signs": [
              "Gemini",
              "Aries"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 450,
            "proteinG": 14,
            "carbsG": 62,
            "fatG": 16,
            "fiberG": 5,
            "sodiumMg": 850,
            "sugarG": 6,
            "vitamins": [
              "Vitamin A",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0756,"entropy":0.3233,"reactivity":1.5944,"gregsEnergy":-0.44,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "mung bean flour",
              "substituteOptions": [
                "all-purpose flour (will change texture significantly)",
                "buckwheat flour"
              ]
            },
            {
              "originalIngredient": "sweet bean sauce",
              "substituteOptions": [
                "hoisin sauce"
              ]
            }
          ]
        },
        {
          "name": "Authentic Scallion Pancakes (Cong You Bing)",
          "description": "A masterclass in Chinese hot-water dough lamination. Boiling water denatures the flour proteins, preventing heavy gluten formation and ensuring a tender dough. The dough is then smeared with a flour-oil roux (you酥) and massive amounts of scallions, coiled into a snail shape, and flattened to create dozens of distinct, flaky, shatteringly crisp layers when pan-fried.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 15,
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
              "name": "all-purpose flour",
              "notes": "For the dough."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "boiling water",
              "notes": "Crucial. Must be actively boiling to denature the proteins."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "cold water",
              "notes": "To adjust the dough hydration."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "scallions",
              "notes": "Green parts only, very finely chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "vegetable oil",
              "notes": "For the roux and pan-frying."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "all-purpose flour",
              "notes": "For the oil roux (you酥)."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "For the roux."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "five-spice powder",
              "notes": "Optional aromatic for the roux."
            }
          ],
          "instructions": [
            "Step 1: The Hot Water Dough. Place the 2 cups of flour in a bowl. Pour the boiling water evenly over the flour while stirring rapidly with chopsticks. It will look shaggy and dry.",
            "Step 2: Hydrate. Drizzle in the cold water. Knead by hand for 5 minutes until a smooth, slightly tacky dough forms. Cover with a damp cloth and let rest for 30 minutes to relax completely.",
            "Step 3: The Roux (You酥). In a small heatproof bowl, combine the 2 tbsp flour, salt, and five-spice. Heat 2 tbsp of oil until shimmering, then pour it over the flour mixture. It will sizzle. Stir into a smooth paste. This is the lamination fat.",
            "Step 4: Roll and Laminate. Divide the rested dough into 4 pieces. Roll one piece out on an oiled surface into a very thin rectangle. Smear a thin layer of the oil roux over the entire surface. Sprinkle heavily with chopped scallions.",
            "Step 5: The Coil. Roll the dough up tightly like a cigar (along the long edge) to trap the scallions and oil. Now, take that long rope and coil it in on itself like a snail shell. Tuck the tail end underneath.",
            "Step 6: Second Rest. Flatten the snail slightly with your palm. Let it rest for 15 minutes. (If you roll it immediately, the layers will burst and the dough will snap back).",
            "Step 7: Flatten. Gently roll the rested coil out into a 6-inch pancake, about 1/4-inch thick.",
            "Step 8: Fry. Heat 1 tbsp of oil in a skillet over medium heat. Fry the pancake for 3-4 minutes per side until deeply golden, blistered, and crispy.",
            "Step 9: The Fluff. Remove from the pan and use two spatulas (or your hands) to smash the edges inward toward the center to separate and fluff the flaky layers. Serve hot."
          ],
          "classifications": {
            "mealType": [
              "appetizer",
              "snack",
              "dim sum",
              "vegan"
            ],
            "cookingMethods": [
              "kneading",
              "laminating",
              "pan-frying"
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
              "Venus",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Aries"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 310,
            "proteinG": 6,
            "carbsG": 48,
            "fatG": 10,
            "fiberG": 2,
            "sodiumMg": 480,
            "sugarG": 1,
            "vitamins": [
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Selenium"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0057,"entropy":0.0072,"reactivity":0.7214,"gregsEnergy":0.0005,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "scallions",
              "substituteOptions": [
                "chives",
                "wild garlic"
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
          "name": "Authentic Sichuan Dan Dan Noodles",
          "description": "The quintessential street food of Chengdu. It is not a soup, but rather a dry noodle dish characterized by intense stratification. Fresh noodles are placed over a violently red, highly complex sauce of chili oil, sesame paste, and Sichuan peppercorns, then topped with deeply savory, dry-fried pork and preserved vegetables (ya cai).",
          "details": {
            "cuisine": "Chinese (Sichuan)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 15,
            "baseServingSize": 2,
            "spiceLevel": "Fiery",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 250,
              "unit": "g",
              "name": "fresh Chinese wheat noodles",
              "notes": "Alkaline noodles (with a slight chew) are preferred."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "ground pork",
              "notes": "Slightly fatty."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "Sui Mi Ya Cai",
              "notes": "Preserved mustard greens. Absolutely essential for the authentic deep, earthy funk. Rinse briefly."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the pork."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dark soy sauce",
              "notes": "For the pork color."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "Sichuan chili oil with sediment",
              "notes": "The foundation of the sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Chinese sesame paste",
              "notes": "Thicker and roasted much darker than tahini."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Chinkiang black vinegar",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "ground roasted Sichuan peppercorns",
              "notes": "Provides the 'ma' (numbing) sensation."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Finely minced."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "scallions",
              "notes": "Chopped, for garnish."
            },
            {
              "amount": 1,
              "unit": "handful",
              "name": "bok choy or spinach",
              "notes": "Blanched."
            }
          ],
          "instructions": [
            "Step 1: The Topping. Heat 1 tbsp oil in a wok. Add the ground pork. Stir-fry aggressively over high heat, breaking it up, until the moisture evaporates and the pork begins to crisp and brown in its own fat.",
            "Step 2: Flavor the pork. Add the Shaoxing wine and dark soy sauce. Toss. Add the chopped Ya Cai. Stir-fry for 1 more minute until deeply fragrant and dry. Remove from heat.",
            "Step 3: The Sauce Base. In each individual serving bowl, assemble the sauce. To each bowl add: 1.5 tbsp chili oil, 1/2 tbsp sesame paste, 1/2 tbsp light soy sauce, 1/2 tbsp black vinegar, a heavy pinch of ground Sichuan peppercorns, and half the minced garlic. Mix slightly into a dark paste.",
            "Step 4: The Greens. Blanch the bok choy in boiling water for 30 seconds. Remove and set aside.",
            "Step 5: The Noodles. In the same boiling water, cook the fresh noodles until just al dente. Drain very well.",
            "Step 6: Assemble. Place the hot noodles directly on top of the sauce paste in the serving bowls.",
            "Step 7: Crown. Top the noodles with the crispy pork/ya cai mixture, the blanched greens, and chopped scallions.",
            "Step 8: Serve. The dish is served layered. The diner must vigorously stir the noodles to coat them in the fiery sauce hidden at the bottom immediately before eating."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "street food",
              "noodle"
            ],
            "cookingMethods": [
              "stir-frying",
              "boiling",
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.6,
            "Water": 0.1,
            "Earth": 0.2,
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
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 580,
            "proteinG": 24,
            "carbsG": 55,
            "fatG": 28,
            "fiberG": 4,
            "sodiumMg": 1100,
            "sugarG": 4,
            "vitamins": [
              "Vitamin A",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0186,"entropy":0.02,"reactivity":0.905,"gregsEnergy":0.0005,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "ground pork",
              "substituteOptions": [
                "minced shiitake mushrooms and extra ya cai (vegan)"
              ]
            },
            {
              "originalIngredient": "Chinese sesame paste",
              "substituteOptions": [
                "tahini mixed with a drop of toasted sesame oil"
              ]
            }
          ]
        },
        {
          "name": "Authentic Sichuan Mapo Tofu",
          "description": "A masterpiece of Sichuanese culinary alchemy, defining the 'málà' (numbing and spicy) flavor profile.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "Fiery",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 450,
              "unit": "g",
              "name": "soft tofu",
              "notes": "Cut into cubes."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "ground beef",
              "notes": "Minced."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "Pixian doubanjiang",
              "notes": "Fermented chili broad bean paste."
            },
            {
              "amount": 1.5,
              "unit": "tsp",
              "name": "Sichuan peppercorns",
              "notes": "Toasted and ground."
            }
          ],
          "instructions": [
            "Step 1: Blanch tofu in salted water.",
            "Step 2: Toast and grind Sichuan peppercorns.",
            "Step 3: Stir-fry beef until crispy.",
            "Step 4: Fry doubanjiang until oil turns red.",
            "Step 5: Add aromatics, stock, and tofu.",
            "Step 6: Thicken with cornstarch slurry and serve with peppercorns on top."
          ],
          "classifications": {
            "mealType": [
              "dinner"
            ],
            "cookingMethods": [
              "stir-frying",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.6,
            "Water": 0.15,
            "Earth": 0.15,
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
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 310,
            "proteinG": 14,
            "carbsG": 12,
            "fatG": 24,
            "fiberG": 3,
              "sodiumMg": 608,
              "sugarG": 16,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0625,"entropy":0.0699,"reactivity":1.0529,"gregsEnergy":-0.0111,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "ground beef",
              "substituteOptions": [
                "mushrooms"
              ]
            }
          ]
        },
        {
          "name": "Authentic Har Gow (Shrimp Dumplings)",
          "description": "The benchmark of a Dim Sum chef's skill. Har Gow relies on a highly specialized dough made from wheat starch and tapioca starch, which turns completely translucent when steamed. The filling is pure, violently mixed shrimp and pork fat, engineered for an explosive, snappy texture rather than a soft paste.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
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
              "amount": 300,
              "unit": "g",
              "name": "raw shrimp",
              "notes": "Peeled, deveined. Washed with baking soda and rinsed to create a 'snappy' texture."
            },
            {
              "amount": 50,
              "unit": "g",
              "name": "pork back fat",
              "notes": "Finely minced. Essential for moisture and flavor; shrimp alone will dry out."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "granulated sugar",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sesame oil",
              "notes": "For the filling."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "white pepper",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "wheat starch",
              "notes": "Not wheat flour. This gives the dough its translucent quality."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "tapioca starch",
              "notes": "Provides elasticity."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "boiling water",
              "notes": "Must be violently boiling to gelatinize the starches immediately."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "lard or neutral oil",
              "notes": "Kneaded into the dough for suppleness."
            }
          ],
          "instructions": [
            "Step 1: Treat the shrimp. Toss the raw shrimp with 1/2 tsp baking soda and let sit for 15 minutes. Rinse extremely thoroughly under cold water and pat completely dry. This is the secret to 'bouncy' shrimp.",
            "Step 2: The Filling. Roughly chop the shrimp. In a bowl, combine the shrimp, pork fat, salt, sugar, white pepper, and sesame oil. Mix vigorously in one direction for 3 minutes until it becomes a sticky, cohesive paste. Refrigerate.",
            "Step 3: The Dough. In a bowl, mix the wheat starch and tapioca starch. Pour the rapidly boiling water directly over the starches. Stir quickly with chopsticks until a rough dough forms. Cover and rest for 5 minutes.",
            "Step 4: Knead the Dough. Add the lard/oil to the warm dough. Knead vigorously on a flat surface until it is perfectly smooth, white, and elastic. Keep it covered with a damp towel at all times; it dries out instantly.",
            "Step 5: Shaping. Cut a small piece of dough. Roll it into a thin circle using a specialized flat cleaver or rolling pin. The edges must be thinner than the center.",
            "Step 6: Pleating. Place a teaspoon of filling in the center. Fold the wrapper in half, pleating the front edge and pressing it against the flat back edge. A master makes 9 to 13 pleats.",
            "Step 7: Steam. Line a bamboo steamer with perforated parchment paper. Place the dumplings inside. Steam over boiling water for 6-7 minutes. The wrappers will become translucent, revealing the pink shrimp inside.",
            "Step 8: Serve immediately. They become tough as they cool."
          ],
          "classifications": {
            "mealType": [
              "dim sum",
              "appetizer",
              "seafood"
            ],
            "cookingMethods": [
              "mixing",
              "kneading",
              "pleating",
              "steaming"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.45,
            "Earth": 0.25,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Neptune"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 280,
            "proteinG": 14,
            "carbsG": 35,
            "fatG": 10,
            "fiberG": 0,
            "sodiumMg": 450,
            "sugarG": 2,
            "vitamins": [
              "Vitamin B12",
              "Selenium"
            ],
            "minerals": [
              "Iodine",
              "Zinc"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0767,"reactivity":3.3616,"gregsEnergy":-0.2574,"kalchm":4.0,"monica":0.0552},
                    "substitutions": [
            {
              "originalIngredient": "wheat starch",
              "substituteOptions": [
                "cornstarch (wrapper will be softer and less translucent)"
              ]
            },
            {
              "originalIngredient": "pork fat",
              "substituteOptions": [
                "bamboo shoots and extra sesame oil (for a pescatarian version)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Cantonese Char Siu (BBQ Pork)",
          "description": "The pinnacle of Cantonese roasting. Char Siu utilizes long strips of pork shoulder (providing the ideal fat-to-meat ratio) marinated in a complex, high-sugar, fermented bean matrix. High-heat roasting renders the fat, while a maltose glaze applied at the end creates a sticky, lacquer-like, slightly charred exterior.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prepTimeMinutes": 1440,
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
              "unit": "kg",
              "name": "pork shoulder (butt)",
              "notes": "Cut into long strips about 2 inches wide and 1 inch thick."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "hoisin sauce",
              "notes": "For the marinade."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dark soy sauce",
              "notes": "For color."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "oyster sauce",
              "notes": "For the marinade."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "fermented red bean curd (Nam Yu)",
              "notes": "Mashed. Essential for the authentic red color and deep funk. Do not use artificial red food coloring."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "white sugar",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "five-spice powder",
              "notes": "Aromatic base."
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
              "name": "maltose or honey",
              "notes": "Mixed with 1 tbsp hot water for the final lacquer glaze."
            }
          ],
          "instructions": [
            "Step 1: The Marinade. In a bowl, whisk together the hoisin, soy sauce, dark soy sauce, oyster sauce, Shaoxing wine, mashed red bean curd, sugar, five-spice, and garlic until the sugar dissolves.",
            "Step 2: Marinate. Place the pork strips in a large zip-top bag or bowl. Pour the marinade over the meat. Massage thoroughly. Refrigerate for at least 24 hours, up to 48 hours. This prolonged bath is non-negotiable for flavor penetration and tenderizing.",
            "Step 3: Setup. Preheat oven to 400°F (200°C). Line a roasting pan with heavy-duty foil. Place a wire rack over the pan. (Optionally, add 1/2 inch of water to the pan to prevent the dripping sugars from burning).",
            "Step 4: Roast. Place the pork strips on the wire rack, leaving space between them. Roast for 15 minutes.",
            "Step 5: Flip and Roast. Flip the pork strips. Roast for another 15 minutes.",
            "Step 6: The Glaze. Prepare the maltose/honey glaze. Remove the pork from the oven. Brush all sides heavily with the glaze.",
            "Step 7: The Char. Increase the oven temperature to 425°F (220°C) or turn on the broiler. Roast/broil for 5-10 minutes, watching carefully. You want the edges to char and blacken slightly, and the glaze to bubble and turn into a sticky lacquer.",
            "Step 8: Rest. Remove from the oven and let rest for 10 minutes before slicing thinly against the grain. Serve with rice or use in steamed buns."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "bbq",
              "meat"
            ],
            "cookingMethods": [
              "marinating",
              "roasting",
              "glazing"
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
              "Leo",
              "Aries"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 550,
            "proteinG": 38,
            "carbsG": 32,
            "fatG": 28,
            "fiberG": 1,
            "sodiumMg": 1200,
            "sugarG": 26,
            "vitamins": [
              "Vitamin B6",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.2,"entropy":0.2188,"reactivity":1.3432,"gregsEnergy":-0.0938,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "pork shoulder",
              "substituteOptions": [
                "pork belly (richer)",
                "chicken thighs",
                "firm seitan (vegan)"
              ]
            },
            {
              "originalIngredient": "fermented red bean curd",
              "substituteOptions": [
                "omit and use a drop of red food coloring (authenticity will suffer)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Cantonese Wonton Soup",
          "description": "A paradigm of delicate Chinese comfort. The alchemy lies in the contrast: a pristine, crystal-clear, intensely savory broth (often made from chicken, pork, and dried flounder) housing delicate, slippery wrappers that enclose a snappy, violently mixed filling of shrimp and pork fat.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 180,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "winter",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 200,
              "unit": "g",
              "name": "ground pork",
              "notes": "With a good fat ratio (70/30)."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "raw shrimp",
              "notes": "Peeled, deveined, treated with baking soda, and roughly chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sesame oil",
              "notes": "For the filling."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "white pepper",
              "notes": "For the filling."
            },
            {
              "amount": 30,
              "unit": "pieces",
              "name": "square wonton wrappers",
              "notes": "Must be thin, yellow egg/alkaline wrappers."
            },
            {
              "amount": 6,
              "unit": "cups",
              "name": "supreme broth (Gao Tang)",
              "notes": "A clear broth made from chicken, pork bones, and dried seafood. Essential for authenticity."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "yellow chives",
              "notes": "Finely chopped, for garnish."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "sesame oil",
              "notes": "A few drops per bowl for serving."
            }
          ],
          "instructions": [
            "Step 1: The Filling. In a large bowl, combine the ground pork, chopped shrimp, soy sauce, Shaoxing wine, sesame oil, white pepper, and a pinch of salt. Mix violently in one direction with chopsticks for 3-5 minutes. The mixture must become a sticky, cohesive paste (this develops the myosin for a bouncy texture). Refrigerate for 30 minutes.",
            "Step 2: Wrapping. Place a wrapper in your palm. Add 1 teaspoon of filling to the center. Dip your finger in water and wet the edges of the wrapper. Fold in half to form a triangle or rectangle, pressing out air. Bring the two opposite bottom corners together, overlap them, and press to seal (like a tortellini).",
            "Step 3: The Broth. In a separate pot, heat the supreme broth to a gentle simmer. Season to taste with salt and a pinch of sugar. It should be deeply savory but clear.",
            "Step 4: Boil Wontons. Bring a large pot of water to a rolling boil. Drop the wontons in. Cook for 3-4 minutes until they float to the top and the wrappers look wrinkled and translucent.",
            "Step 5: Assemble. Drain the wontons with a spider and divide them among serving bowls. Ladle the boiling hot, clear broth over the wontons.",
            "Step 6: Garnish with yellow chives and a drop of sesame oil. Serve immediately."
          ],
          "classifications": {
            "mealType": [
              "soup",
              "lunch",
              "dinner"
            ],
            "cookingMethods": [
              "mixing",
              "wrapping",
              "boiling",
              "simmering"
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
              "Moon",
              "Neptune"
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
            "calories": 380,
            "proteinG": 24,
            "carbsG": 45,
            "fatG": 12,
            "fiberG": 2,
            "sodiumMg": 950,
            "sugarG": 2,
            "vitamins": [
              "Vitamin B12",
              "Selenium"
            ],
            "minerals": [
              "Iron",
              "Phosphorus"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.001,"entropy":0.0734,"reactivity":4.0775,"gregsEnergy":-0.2984,"kalchm":4.0,"monica":0.0528},
                    "substitutions": [
            {
              "originalIngredient": "shrimp and pork",
              "substituteOptions": [
                "minced chicken",
                "shiitake and bok choy paste (vegan)"
              ]
            },
            {
              "originalIngredient": "supreme broth",
              "substituteOptions": [
                "high-quality chicken broth simmered with ginger and scallion"
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
          "name": "Authentic Peking Duck",
          "description": "The imperial masterpiece of Chinese roasting. The skin is separated from the meat using compressed air, blanched to tighten pores, coated in a maltose-vinegar glaze, and air-dried for 24 hours. The resulting roast yields skin that shatters like glass, served with thin pancakes, hoisin, and scallions.",
          "details": {
            "cuisine": "Chinese (Beijing)",
            "prepTimeMinutes": 2880,
            "cookTimeMinutes": 75,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "whole",
              "name": "duck (Long Island or Pekin)",
              "notes": "About 5-6 lbs. Head on if possible."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "maltose or honey",
              "notes": "For the glaze. Provides the glassy red lacquer."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "white vinegar",
              "notes": "For the glaze. Helps dry the skin."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For the glaze."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "five-spice powder",
              "notes": "Rubbed ONLY inside the cavity, never on the skin."
            },
            {
              "amount": 1,
              "unit": "pack",
              "name": "Peking duck pancakes (Spring pancakes)",
              "notes": "Paper-thin wheat wrappers."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "sweet bean sauce or hoisin sauce",
              "notes": "For serving."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "scallions",
              "notes": "White and light green parts only, cut into fine julienne/brushes."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "cucumber",
              "notes": "Peeled, seeded, and cut into fine matchsticks."
            }
          ],
          "instructions": [
            "Step 1: Separate the skin. Use a bicycle pump or your fingers to gently separate the duck skin from the meat all over the body. Do not tear the skin. This ensures the fat renders out completely during roasting.",
            "Step 2: Scald. Boil a large pot of water. Hold the duck over the sink and pour the boiling water continuously over the entire bird for 1-2 minutes. The skin will instantly tighten, shrink, and change color.",
            "Step 3: The Glaze. In a bowl, dissolve the maltose, vinegar, and soy sauce in 1 cup of boiling water. Brush this hot glaze evenly over the entire duck. Wait 30 minutes, then brush again.",
            "Step 4: Air Dry (Crucial). Hang the duck in a cool, well-ventilated area (or prop it up in the fridge) for 24 to 48 hours. The skin must feel like dry parchment paper before roasting. If it is moist, it will not crisp.",
            "Step 5: Roast. Preheat oven to 400°F (200°C). Place the duck breast-side up on a rack over a roasting pan half-filled with water (to prevent fat smoking). Roast for 15 minutes.",
            "Step 6: Reduce heat. Reduce oven to 350°F (175°C). Roast for another 45-60 minutes until the skin is a deep, lacquered mahogany and the internal temp of the thigh is 165°F.",
            "Step 7: Carve and Serve. Let rest for 15 minutes. The carving is an art: the skin should be sliced off separately from the meat. Serve the crispy skin and meat with the warm pancakes, scallion brushes, cucumber, and sweet bean sauce."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "celebration",
              "poultry"
            ],
            "cookingMethods": [
              "scalding",
              "air-drying",
              "glazing",
              "roasting"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.1,
            "Earth": 0.1,
            "Air": 0.4
          },
          "astrologicalAffinities": {
            "planets": [
              "Sun",
              "Jupiter"
            ],
            "signs": [
              "Leo",
              "Sagittarius"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 680,
            "proteinG": 35,
            "carbsG": 28,
            "fatG": 48,
            "fiberG": 2,
            "sodiumMg": 750,
            "sugarG": 12,
            "vitamins": [
              "Vitamin A",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Selenium"
            ]
          },
          alchemicalProperties: {"Spirit":2,"Essence":1,"Matter":0,"Substance":0},
          thermodynamicProperties: {"heat":1.625,"entropy":3.0,"reactivity":533.0,"gregsEnergy":-1597.375,"kalchm":4.0,"monica":2.1618},
                    "substitutions": [
            {
              "originalIngredient": "whole duck",
              "substituteOptions": [
                "no substitute. Technique is specific to duck skin."
              ]
            }
          ]
        },
        {
          "name": "Authentic Kung Pao Chicken (Gong Bao Ji Ding)",
          "description": "A classic Sichuan stir-fry requiring intense wok hei and the precise balance of the 'lychee flavor' profile—sweet, sour, and fiercely spicy. It utilizes the 'ma la' combination of numbing Sichuan peppercorns and scorching dried chilies.",
          "details": {
            "cuisine": "Chinese (Sichuan)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 10,
            "baseServingSize": 4,
            "spiceLevel": "Fiery",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 400,
              "unit": "g",
              "name": "chicken thigh meat",
              "notes": "Cut into 1/2 inch cubes. Dark meat is essential for juiciness."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the marinade."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "cornstarch",
              "notes": "For 'velveting' the chicken."
            },
            {
              "amount": 10,
              "unit": "whole",
              "name": "dried red chilies",
              "notes": "Sniped in half, seeds shaken out."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "Sichuan peppercorns",
              "notes": "Whole."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Sliced."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "fresh ginger",
              "notes": "Sliced."
            },
            {
              "amount": 4,
              "unit": "stalks",
              "name": "scallions",
              "notes": "White parts only, cut into 1/2 inch rounds."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "roasted unsalted peanuts",
              "notes": "Added at the very end to retain crunch."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "black rice vinegar (Chinkiang)",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "For the sauce."
            }
          ],
          "instructions": [
            "Step 1: Velvet the chicken. Mix the chicken cubes with light soy sauce, Shaoxing wine, and cornstarch. Let sit for 15 minutes.",
            "Step 2: Prepare the sauce. In a small bowl, mix the black vinegar, sugar, 1 tbsp light soy sauce, 1 tsp dark soy sauce, 1 tsp cornstarch, and 1 tbsp water. Stir until sugar dissolves.",
            "Step 3: Heat the wok. Heat a wok over high heat until smoking. Add 2 tbsp of peanut oil.",
            "Step 4: Sear the chicken. Add the chicken and stir-fry aggressively until just cooked and slightly browned. Remove from wok.",
            "Step 5: Bloom the spices. In the remaining oil, turn heat to medium-low. Add the dried chilies and Sichuan peppercorns. Fry for 15 seconds until the chilies darken but do not burn.",
            "Step 6: Aromatics. Add the ginger, garlic, and scallions. Stir-fry for 30 seconds until fragrant.",
            "Step 7: Combine and glaze. Return the chicken to the wok. Give the sauce mixture a stir and pour it in. Toss vigorously over high heat until the sauce thickens and glazes the chicken (about 30 seconds).",
            "Step 8: Finish. Turn off the heat. Stir in the roasted peanuts immediately before serving to maintain their crunch."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stir-fry"
            ],
            "cookingMethods": [
              "velveting",
              "stir-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.6,
            "Water": 0.1,
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
              "Scorpio"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 25,
            "carbsG": 12,
            "fatG": 24,
            "fiberG": 3,
            "sodiumMg": 680,
            "sugarG": 6,
            "vitamins": [
              "Vitamin E",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.2361,"entropy":0.259,"reactivity":1.6528,"gregsEnergy":-0.1919,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "chicken thigh",
              "substituteOptions": [
                "extra firm tofu cubes (vegan)",
                "shrimp"
              ]
            },
            {
              "originalIngredient": "peanuts",
              "substituteOptions": [
                "cashews"
              ]
            }
          ]
        },
        {
          "name": "Authentic Xiaolongbao (Soup Dumplings)",
          "description": "An architectural marvel of Shanghainese dim sum. The secret is incorporating a rich, gelatinous pork aspic (made from boiled pork skin/bones) directly into the meat filling. Upon steaming, the aspic melts, creating a pocket of scalding, savory soup trapped within a delicate, un-yeasted wheat wrapper.",
          "details": {
            "cuisine": "Chinese (Shanghai)",
            "prepTimeMinutes": 240,
            "cookTimeMinutes": 10,
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
              "name": "pork skin",
              "notes": "Boiled for hours to create the aspic."
            },
            {
              "amount": 300,
              "unit": "g",
              "name": "ground pork",
              "notes": "Must be relatively fatty."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For the filling."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "fresh ginger",
              "notes": "Finely minced."
            },
            {
              "amount": 1.5,
              "unit": "cups",
              "name": "all-purpose flour",
              "notes": "For the wrappers."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "warm water",
              "notes": "To hydrate the dough."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "Chinkiang black vinegar",
              "notes": "For the dipping sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "fresh ginger",
              "notes": "Finely julienned, for the dipping sauce."
            }
          ],
          "instructions": [
            "Step 1: The Aspic. Boil the pork skin in water with ginger and scallion for 2-3 hours until the liquid reduces and becomes sticky. Strain and chill the liquid in the fridge until it sets into a firm, solid gelatin (aspic). Mince the solid aspic finely.",
            "Step 2: The Filling. Vigorously mix the ground pork with soy sauce, wine, ginger, salt, and pepper until it becomes a sticky paste. Gently fold the minced aspic into the meat mixture. Keep refrigerated.",
            "Step 3: The Dough. Mix the flour and warm water into a smooth, elastic dough. Rest for 30 minutes.",
            "Step 4: The Wrappers. Divide dough into small 10g pieces. Roll each out into a circle, making the edges thinner than the center.",
            "Step 5: Pleating. Place a spoonful of the cold meat/aspic filling in the center. Pleat the edges together tightly at the top (aiming for 18+ pleats) to seal completely. A leak ruins the dumpling.",
            "Step 6: Steam. Line a bamboo steamer with perforated parchment or cabbage leaves. Steam over boiling water for 6-8 minutes until the wrappers are slightly translucent and the interior feels liquid.",
            "Step 7: Serve immediately. To eat, place on a soup spoon, bite a tiny hole to let steam escape, slurp the soup, then dip in black vinegar and julienned ginger."
          ],
          "classifications": {
            "mealType": [
              "dim sum",
              "appetizer"
            ],
            "cookingMethods": [
              "boiling",
              "kneading",
              "pleating",
              "steaming"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.5,
            "Earth": 0.2,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Neptune"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 22,
            "carbsG": 35,
            "fatG": 20,
            "fiberG": 1,
            "sodiumMg": 650,
            "sugarG": 2,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":1,"Substance":1},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0767,"reactivity":3.6806,"gregsEnergy":-0.2819,"kalchm":4.0,"monica":0.0552},
                    "substitutions": [
            {
              "originalIngredient": "pork skin aspic",
              "substituteOptions": [
                "agar agar set vegetable broth (for vegan version, using mushroom filling)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Sweet and Sour Pork (Tang Cu Li Ji)",
          "description": "A classic dish defined by its contrasting textures and flavors. Lean pork is coated in a heavy wet starch batter and double-fried for maximum crispness, then rapidly tossed in a bright, glossy sauce balanced precisely between sugar and black vinegar, without the heavy use of ketchup found in Westernized versions.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 400,
              "unit": "g",
              "name": "pork tenderloin",
              "notes": "Cut into bite-sized chunks."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "sweet potato starch or cornstarch",
              "notes": "For the batter."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg white",
              "notes": "For the batter."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "For the sauce."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "Chinkiang black vinegar",
              "notes": "Provides authentic complex sourness, not harsh white vinegar."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the marinade."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "bell peppers",
              "notes": "Cut into chunks."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "pineapple or lychee",
              "notes": "Optional, but common for fruitiness."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "neutral oil",
              "notes": "For deep frying."
            }
          ],
          "instructions": [
            "Step 1: Marinate. Toss the pork with Shaoxing wine, a pinch of salt, and white pepper. Let sit 15 mins.",
            "Step 2: The Batter. Mix the starch and egg white with just enough water to create a thick, sticky batter. Coat the pork pieces completely.",
            "Step 3: The First Fry. Heat oil to 320°F (160°C). Fry the pork in batches until the coating is set and pale golden (about 4 mins). Remove and drain. This cooks the meat.",
            "Step 4: The Second Fry (Crucial). Increase oil heat to 390°F (200°C). Return all the pork to the wok. Fry for 1 minute until deeply golden and intensely crispy. Remove and drain.",
            "Step 5: The Sauce. Mix sugar, vinegar, soy sauce, and 1 tsp cornstarch with a splash of water.",
            "Step 6: Combine. Leave 1 tbsp oil in the wok. Quickly stir-fry the bell peppers. Pour in the sauce mixture; it will bubble and thicken instantly.",
            "Step 7: Glaze. Immediately toss the crispy pork into the thickened sauce. Toss rapidly to coat, then remove from heat immediately so the crust doesn't become soggy. Serve."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stir-fry"
            ],
            "cookingMethods": [
              "deep-frying",
              "stir-frying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.2,
            "Earth": 0.2,
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
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 26,
            "carbsG": 35,
            "fatG": 26,
            "fiberG": 2,
            "sodiumMg": 550,
            "sugarG": 18,
            "vitamins": [
              "Vitamin C"
            ],
            "minerals": [
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1716,"entropy":0.2083,"reactivity":1.5556,"gregsEnergy":-0.1525,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "pork tenderloin",
              "substituteOptions": [
                "chicken breast",
                "cauliflower florets (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Beef with Broccoli",
          "description": "A staple of Chinese-American cuisine relying on the 'velveting' technique (passing meat through oil or water after an alkaline marinade) to render tough cuts of beef incredibly tender, contrasting with the bright crunch of briefly blanched broccoli.",
          "details": {
            "cuisine": "Chinese-American",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 10,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 400,
              "unit": "g",
              "name": "flank steak",
              "notes": "Sliced thinly against the grain."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "baking soda",
              "notes": "For the velveting marinade. Tenderizes the meat fibers."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "cornstarch",
              "notes": "For the marinade, creates a protective coating."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "Shaoxing wine",
              "notes": "For the marinade."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "broccoli florets",
              "notes": "Cut into uniform bite-sized pieces."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "oyster sauce",
              "notes": "The primary flavor of the brown sauce."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "light soy sauce",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "dark soy sauce",
              "notes": "For color."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "fresh ginger",
              "notes": "Minced."
            }
          ],
          "instructions": [
            "Step 1: Velvet the beef. Toss the sliced beef with baking soda, cornstarch, Shaoxing wine, and a splash of water. Let marinate for 20-30 minutes.",
            "Step 2: Blanch broccoli. Bring a pot of water to a boil with a pinch of salt and a drop of oil. Blanch the broccoli for exactly 60 seconds. Drain and rinse under cold water to stop the cooking. It must remain bright green and crunchy.",
            "Step 3: Prepare the sauce. Whisk the oyster sauce, light soy, dark soy, 1 tsp cornstarch, and 1/3 cup of water or broth.",
            "Step 4: Sear the beef. Heat a wok with 2 tbsp oil over high heat. Add the beef. Spread it out and let it sear without moving for 30 seconds, then stir-fry until just browned. Remove beef from wok.",
            "Step 5: Aromatics. In the remaining oil, stir-fry the garlic and ginger for 15 seconds.",
            "Step 6: Combine. Return the beef and add the blanched broccoli to the wok. Give the sauce a stir and pour it over. Toss continuously over high heat for 1 minute until the sauce thickens into a glossy glaze coating the meat and vegetables. Serve immediately over rice."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stir-fry"
            ],
            "cookingMethods": [
              "velveting",
              "blanching",
              "stir-frying"
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
              "Earth",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 26,
            "carbsG": 18,
            "fatG": 16,
            "fiberG": 4,
            "sodiumMg": 850,
            "sugarG": 4,
            "vitamins": [
              "Vitamin C",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0174,"entropy":0.0204,"reactivity":0.6433,"gregsEnergy":0.0043,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "flank steak",
              "substituteOptions": [
                "chicken breast",
                "seitan (vegan, omit oyster sauce for mushroom stir-fry sauce)"
              ]
            }
          ]
        },
            {
              "name": "Authentic Lion's Head Meatballs",
              "description": "Huaiyang's structural masterpiece. Massive, airy pork meatballs are gently braised in a clear broth with cabbage leaves, designed to resemble a lion's head and mane, achieving a 'melt-in-mouth' texture through high fat content and minimal binding.",
              "details": {
                "cuisine": "Chinese (Huaiyang)",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 90,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Pork belly",
                  "notes": "Hand-chopped into 3mm cubes."
                },
                {
                  "amount": 0.5,
                  "unit": "lb",
                  "name": "Napa cabbage",
                  "notes": "Large leaves."
                }
              ],
              "instructions": [
                "Step 1: Hand-chop pork to maintain texture.",
                "Step 2: Gently mix with water chestnuts and aromatics.",
                "Step 3: Form into 4 massive spheres.",
                "Step 4: Briefly sear, then cover with cabbage leaves.",
                "Step 5: Braise in clear stock for 1.5 hours."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "braising"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.45,
                "Earth": 0.3,
                "Air": 0.1
              },
              "astrologicalAffinities": {
                "planets": [
                  "Moon"
                ],
                "signs": [
                  "cancer"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 580,
                "proteinG": 22,
                "carbsG": 8,
                "fatG": 52,
                "fiberG": 3,
                "sodiumMg": 750,
                "sugarG": 2,
                "vitamins": [
                  "Vitamin B12"
                ],
                "minerals": [
                  "Zinc"
                ]
              },
              alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
              thermodynamicProperties: {"heat":0.0028,"entropy":0.0043,"reactivity":0.7308,"gregsEnergy":-0.0004,"kalchm":1.0,"monica":1.0},
                            "substitutions": []
            },
            {
              "name": "Authentic Scallion Oil Noodles",
              "description": "The essence of Shanghai. A study in aromatic extraction where scallions are slowly fried in oil until charred and brittle, creating a deep, umami-rich base for perfectly chewy wheat noodles.",
              "details": {
                "cuisine": "Chinese (Shanghai)",
                "prepTimeMinutes": 5,
                "cookTimeMinutes": 15,
                "baseServingSize": 2,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "portions",
                  "name": "Fresh wheat noodles",
                  "notes": "Thin."
                },
                {
                  "amount": 1,
                  "unit": "bunch",
                  "name": "Scallions",
                  "notes": "Whites and greens separated."
                }
              ],
              "instructions": [
                "Step 1: Fry scallion whites in oil until golden.",
                "Step 2: Add greens and fry until dark brown and brittle.",
                "Step 3: Remove scallions; stir soy sauce and sugar into oil.",
                "Step 4: Boil noodles until al dente.",
                "Step 5: Toss noodles in the aromatic oil; top with crispy scallions."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "breakfast"
                ],
                "cookingMethods": [
                  "infusing",
                  "boiling"
                ]
              },
              "elementalProperties": {
                "Fire": 0.3,
                "Water": 0.1,
                "Earth": 0.4,
                "Air": 0.2
              },
              "astrologicalAffinities": {
                "planets": [
                  "Mercury"
                ],
                "signs": [
                  "gemini"
                ],
                "lunarPhases": [
                  "New Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 450,
                "proteinG": 12,
                "carbsG": 65,
                "fatG": 24,
                "fiberG": 3,
                "sodiumMg": 950,
                "sugarG": 5,
                "vitamins": [
                  "Vitamin B6"
                ],
                "minerals": [
                  "Manganese"
                ]
              },
              alchemicalProperties: {"Spirit":1,"Essence":0,"Matter":0,"Substance":1},
              thermodynamicProperties: {"heat":0.3772,"entropy":8.52,"reactivity":13.375,"gregsEnergy":-113.5778,"kalchm":1.0,"monica":1.0},
                            "substitutions": []
            },
            {
              "name": "Authentic Biang Biang Noodles",
              "description": "The architectural giant of Shaanxi. Massive, belt-thick noodles are hand-pulled and 'biang-ed' against the counter, then topped with raw garlic and chili flakes which are violently flash-cooked by a pour of smoking hot oil.",
              "details": {
                "cuisine": "Chinese (Shaanxi)",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 5,
                "baseServingSize": 2,
                "spiceLevel": "High",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "High-gluten flour",
                  "notes": "For elasticity."
                },
                {
                  "amount": 0.5,
                  "unit": "cup",
                  "name": "Chili flakes",
                  "notes": "Coarse."
                }
              ],
              "instructions": [
                "Step 1: Knead a high-hydration dough until elastic.",
                "Step 2: Roll and pull into wide belts, slapping the counter.",
                "Step 3: Boil belts for 2 minutes.",
                "Step 4: Top with raw garlic, scallions, and chili flakes.",
                "Step 5: Pour 400°F oil directly onto the spices."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "dinner"
                ],
                "cookingMethods": [
                  "pulling",
                  "boiling",
                  "flash-frying"
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
                  "Jupiter"
                ],
                "signs": [
                  "aries",
                  "sagittarius"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 520,
                "proteinG": 14,
                "carbsG": 75,
                "fatG": 22,
                "fiberG": 4,
                "sodiumMg": 850,
                "sugarG": 2,
                "vitamins": [
                  "Niacin"
                ],
                "minerals": [
                  "Iron"
                ]
              },
              alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
              thermodynamicProperties: {"heat":0.102,"entropy":0.109,"reactivity":3.3808,"gregsEnergy":-0.2665,"kalchm":4.0,"monica":0.0569},
                            "substitutions": []
            },
            {
              "name": "Authentic Squirrel-Shaped Mandarin Fish",
              "description": "A triumph of Suzhou knife work and temperature control. A whole fish is carved into deep diamonds that expand like fur when deep-fried, then drenched in a vibrant, high-viscosity sweet and sour sauce.",
              "details": {
                "cuisine": "Chinese (Jiangsu)",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 10,
                "baseServingSize": 2,
                "spiceLevel": "None",
                "season": [
                  "spring"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "whole",
                  "name": "Mandarin fish",
                  "notes": "Deboned but head/tail intact."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Tomato sauce/Vinegar",
                  "notes": "For the glaze."
                }
              ],
              "instructions": [
                "Step 1: Execute 45-degree diamond cuts on the fillets.",
                "Step 2: Dredge in starch, ensuring it enters all cuts.",
                "Step 3: Deep fry until the diamond cubes fan out.",
                "Step 4: Prepare a high-gloss sweet and sour sauce.",
                "Step 5: Pour sauce over the 'furry' fish while hot."
              ],
              "classifications": {
                "mealType": [
                  "dinner",
                  "celebration"
                ],
                "cookingMethods": [
                  "deep-frying",
                  "knife-work"
                ]
              },
              "elementalProperties": {
                "Fire": 0.4,
                "Water": 0.25,
                "Earth": 0.15,
                "Air": 0.2
              },
              "astrologicalAffinities": {
                "planets": [
                  "Venus"
                ],
                "signs": [
                  "libra"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 480,
                "proteinG": 32,
                "carbsG": 45,
                "fatG": 18,
                "fiberG": 1,
                "sodiumMg": 650,
                "sugarG": 32,
                "vitamins": [
                  "Vitamin C"
                ],
                "minerals": [
                  "Selenium"
                ]
              },
              alchemicalProperties: {"Spirit":0,"Essence":1,"Matter":1,"Substance":0},
              thermodynamicProperties: {"heat":0.0237,"entropy":0.0347,"reactivity":0.9546,"gregsEnergy":-0.0095,"kalchm":1.0,"monica":1.0},
                            "substitutions": []
            },
            {
              "name": "Authentic Dongpo Pork",
              "description": "The alchemical reduction of Hangzhou. Thick cubes of pork belly are slow-braised in a dark, aromatic matrix of Shaoxing wine and soy sauce until the fat becomes purely structural jelly and the meat can be eaten with a spoon.",
              "details": {
                "cuisine": "Chinese (Zhejiang)",
                "prepTimeMinutes": 15,
                "cookTimeMinutes": 180,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "lbs",
                  "name": "Pork belly",
                  "notes": "Skin-on."
                },
                {
                  "amount": 2,
                  "unit": "cups",
                  "name": "Shaoxing wine",
                  "notes": "High quality."
                }
              ],
              "instructions": [
                "Step 1: Blanch pork belly and cut into massive cubes.",
                "Step 2: Tie with twine to maintain structural shape.",
                "Step 3: Place skin-side down on ginger and scallions.",
                "Step 4: Cover with wine and soy; simmer for 3 hours.",
                "Step 5: Steam for final 30 minutes to render fat to jelly."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "braising",
                  "steaming"
                ]
              },
              "elementalProperties": {
                "Fire": 0.1,
                "Water": 0.45,
                "Earth": 0.4,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Saturn",
                  "Moon"
                ],
                "signs": [
                  "capricorn",
                  "cancer"
                ],
                "lunarPhases": [
                  "Waning Gibbous"
                ]
              },
              "nutritionPerServing": {
                "calories": 850,
                "proteinG": 22,
                "carbsG": 12,
                "fatG": 78,
                "fiberG": 1,
                "sodiumMg": 1100,
                "sugarG": 15,
                "vitamins": [
                  "Vitamin B12"
                ],
                "minerals": [
                  "Zinc"
                ]
              },
              alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":2,"Substance":0},
              thermodynamicProperties: {"heat":0.0664,"entropy":0.0683,"reactivity":0.3845,"gregsEnergy":0.0401,"kalchm":0.25,"monica":0.0753},
                            "substitutions": []
            }
        ,
        {
          name: "Har Gow",
          description: "Har Gow - steamed shrimp dumplings - are the crown jewel of Cantonese dim sum, considered the benchmark by which all dim sum chefs are judged. A perfectly made Har Gow has a translucent, slightly chewy wrapper made from wheat starch and tapioca starch that is thin enough to see the pink shrimp filling through it, yet strong enough to hold without tearing. The filling is classically pure: coarsely chopped shrimp seasoned with sesame oil, white pepper, and a touch of bamboo shoot for crunch, steamed until the shrimp is just barely cooked.",
          details: {"cuisine":"Chinese","prepTimeMinutes":60,"cookTimeMinutes":15,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":0.75,"unit":"lb","name":"Large shrimp","notes":"Peeled, deveined, and coarsely chopped - not minced."},{"amount":0.25,"unit":"cup","name":"Bamboo shoots","notes":"Canned, finely diced for texture."},{"amount":1,"unit":"tsp","name":"Sesame oil","notes":"Toasted, for the filling."},{"amount":0.5,"unit":"tsp","name":"White pepper","notes":"Freshly ground - this is the defining spice."},{"amount":1,"unit":"tsp","name":"Cornstarch","notes":"To bind the filling."},{"amount":1.5,"unit":"cups","name":"Wheat starch (tang mian fen)","notes":"Not regular wheat flour - wheat starch is essential for the translucent wrapper."},{"amount":0.5,"unit":"cup","name":"Tapioca starch","notes":"Mixed with wheat starch for elasticity."},{"amount":1.25,"unit":"cups","name":"Boiling water","notes":"For the dough - must be boiling."}],
          instructions: ["Step 1: For the filling, coarsely chop the shrimp into rough pieces - some should be nearly whole, others smaller. Do not mince. Combine with finely diced bamboo shoots, sesame oil, white pepper, cornstarch, a pinch of sugar, and salt. Mix in one direction until slightly sticky. Refrigerate.","Step 2: For the wrapper dough, combine wheat starch and tapioca starch in a bowl. Pour the boiling water over the starches all at once and stir immediately with a chopstick or spatula until a rough dough forms. The starches will gelatinize instantly.","Step 3: Turn out the hot dough and knead quickly (it will be very hot) into a smooth, translucent dough. Cover tightly and rest for 5 minutes.","Step 4: Divide the dough into small pieces. Using a cleaver or the flat side of a knife, press each piece between plastic wrap into a thin round disk about 3 inches across. The wrapper should be translucent.","Step 5: Place a generous teaspoon of shrimp filling in the center of each wrapper. Fold one side over the other and crimp the edge with a series of small folds - the traditional har gow has 7 to 10 pleats on one side only, a mark of technical skill.","Step 6: Place each dumpling on an oiled bamboo steamer basket. Steam over vigorously boiling water for exactly 6 minutes. The wrappers will be translucent and slightly sticky, the shrimp just cooked through. Serve immediately with a dipping sauce of soy sauce and chili oil."],
          classifications: {"mealType":["lunch","breakfast","snack","appetizer"],"cookingMethods":["steaming","folding"]},
          elementalProperties: {"Fire":0.1,"Water":0.4,"Earth":0.35,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Venus","Mercury"],"signs":["cancer","taurus","virgo"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":220,"proteinG":18,"carbsG":28,"fatG":4,"fiberG":1,"sodiumMg":580,"sugarG":1,"vitamins":["Vitamin B12","Niacin","Selenium"],"minerals":["Phosphorus","Potassium","Zinc"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":2,"Substance":1},
          thermodynamicProperties: {"heat":0.029,"entropy":0.0901,"reactivity":1.1213,"gregsEnergy":-0.072,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Shrimp","substituteOptions":["Scallop and shrimp blend","Crab meat"]},{"originalIngredient":"Wheat starch","substituteOptions":["Tapioca starch alone (slightly different texture)"]}]
        },
        {
          name: "Mapo Tofu",
          description: "Mapo Tofu is one of the most electrifying dishes in the entire Chinese culinary canon - a Sichuan preparation of silken tofu trembling in a sauce of extraordinary complexity and layered heat. The dish is named for a pock-marked old woman (ma po) who reportedly invented it. The sauce combines doubanjiang (fermented bean and chili paste), ground pork, Sichuan peppercorn (which creates a unique numbing sensation called ma la on the tongue), fermented black beans, and chili oil into a volcanic, rust-red gravy that envelops the delicate tofu cubes.",
          details: {"cuisine":"Chinese","prepTimeMinutes":20,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"High","season":["all"]},
          ingredients: [{"amount":1,"unit":"block","name":"Silken or soft tofu","notes":"About 14 oz, cut into 1-inch cubes - handle gently."},{"amount":0.25,"unit":"lb","name":"Ground pork","notes":"Or ground beef."},{"amount":2,"unit":"tbsp","name":"Doubanjiang (spicy bean paste)","notes":"Pixian doubanjiang is the authentic choice - red and intensely fermented."},{"amount":1,"unit":"tbsp","name":"Fermented black beans","notes":"Rinsed and roughly chopped."},{"amount":1,"unit":"tsp","name":"Sichuan peppercorns","notes":"Toasted and ground - creates the numbing sensation."},{"amount":3,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":1,"unit":"inch","name":"Fresh ginger","notes":"Minced."},{"amount":1,"unit":"cup","name":"Chicken broth","notes":"For the sauce."},{"amount":1,"unit":"tbsp","name":"Cornstarch","notes":"Mixed with water, for thickening."}],
          instructions: ["Step 1: Toast the Sichuan peppercorns in a dry pan until fragrant, about 2 minutes. Grind to a coarse powder. Set aside - this will be added at the very end to preserve its numbing quality.","Step 2: Gently lower the tofu cubes into lightly salted simmering water for 2 minutes to firm them slightly and season them. Drain carefully and set aside.","Step 3: Heat wok or pan over high heat until smoking. Add oil, then ground pork. Stir-fry, breaking it up, until completely browned and starting to crisp at the edges.","Step 4: Add the doubanjiang to the pork - it will spit and the oil will turn deep red from the fermented chili. Add garlic and ginger and fry for 1 minute. Add the fermented black beans and chili oil if using.","Step 5: Pour in the chicken broth. Bring to a vigorous boil. Gently slide the tofu cubes into the sauce. Cook without aggressive stirring for 3 minutes, tilting the wok gently to baste the tofu.","Step 6: Pour in the cornstarch slurry to thicken the sauce. Let it boil once more until glossy. Plate in a shallow bowl. Finish with a generous dusting of ground Sichuan peppercorn, sliced green onions, and a drizzle of chili oil. Serve with steamed white rice."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["stir-frying","simmering","braising"]},
          elementalProperties: {"Fire":0.45,"Water":0.3,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Pluto","Uranus"],"signs":["aries","scorpio","aquarius"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":320,"proteinG":22,"carbsG":12,"fatG":22,"fiberG":3,"sodiumMg":980,"sugarG":3,"vitamins":["Calcium","Vitamin B12","Iron"],"minerals":["Iron","Magnesium","Potassium"]},
          alchemicalProperties: {"Spirit":0,"Essence":3,"Matter":3,"Substance":0},
          thermodynamicProperties: {"heat":0.0047,"entropy":0.0051,"reactivity":0.9375,"gregsEnergy":-0.0001,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Ground pork","substituteOptions":["Ground beef","Shiitake mushrooms (vegetarian version)"]},{"originalIngredient":"Doubanjiang","substituteOptions":["Gochujang plus soy sauce (different flavor profile)"]}]
        },
        {
          name: "Zhajiangmian",
          description: "Zhajiangmian is the definitive noodle dish of Beijing - thick wheat noodles topped with a deeply savory, slow-cooked ground pork and fermented bean paste sauce called zhajiang, meaning fried sauce. The sauce is built by slowly frying ground pork with yellow soybean paste (huangdoujiang) and sweet bean sauce (tianmianjiang) over low heat for 20 minutes until the pork fat renders into the sauce and the fermented notes mellow and deepen into something rich, complex, and almost caramel-like. It is served over thick noodles with fresh julienned cucumber.",
          details: {"cuisine":"Chinese","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"Fatty pork preferred for richness."},{"amount":3,"unit":"tbsp","name":"Yellow soybean paste (huangdoujiang)","notes":"Fermented, the defining ingredient."},{"amount":2,"unit":"tbsp","name":"Sweet bean sauce (tianmianjiang)","notes":"For balance and sweetness."},{"amount":1,"unit":"tbsp","name":"Shaoxing rice wine","notes":"For depth."},{"amount":3,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":1,"unit":"whole","name":"White onion","notes":"Finely diced."},{"amount":1,"unit":"lb","name":"Thick fresh wheat noodles","notes":"Or dried thick spaghetti or udon."},{"amount":2,"unit":"whole","name":"Persian cucumbers","notes":"Julienned into thin matchsticks, for garnish."}],
          instructions: ["Step 1: Heat a wok or heavy pan over medium heat. Add a small amount of oil. Add the ground pork and cook over medium heat, breaking it up, until the fat begins to render - do not rush this stage.","Step 2: Once the pork is cooked through and the fat has rendered, drain any excess liquid from the pan. The pork should be lightly browned.","Step 3: Add minced garlic and diced onion to the pork. Stir fry for 2 minutes over medium heat.","Step 4: Add the yellow soybean paste and sweet bean sauce. Stir to combine with the pork. Reduce heat to medium-low. This is the critical stage - cook the sauce over low heat for 20 minutes, stirring occasionally, until the pork fat fully integrates with the bean paste and the sauce becomes thick, glossy, and deeply fragrant. Add a splash of water if it becomes too dry.","Step 5: Add Shaoxing rice wine and a small amount of sugar to balance the saltiness. The finished sauce should be thick and coat the pork heavily, with visible oil glistening on the surface.","Step 6: Cook the noodles according to package directions. Drain and toss with a small amount of sesame oil to prevent sticking. Divide into bowls, add a generous ladle of zhajiang sauce on top. Garnish with julienned cucumber and bean sprouts. The diner mixes everything together at the table."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["stir-frying","slow-cooking"]},
          elementalProperties: {"Fire":0.2,"Water":0.2,"Earth":0.5,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Earth","Jupiter"],"signs":["capricorn","taurus","virgo"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":560,"proteinG":28,"carbsG":64,"fatG":22,"fiberG":4,"sodiumMg":1200,"sugarG":8,"vitamins":["Thiamin","Niacin","Vitamin B6"],"minerals":["Iron","Zinc","Phosphorus"]},
          alchemicalProperties: {"Spirit":2,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.5153,"entropy":0.5556,"reactivity":2.2622,"gregsEnergy":-0.7415,"kalchm":4.0,"monica":0.2364},
                    substitutions: [{"originalIngredient":"Ground pork","substituteOptions":["Ground beef","Firm tofu crumbled (vegetarian)"]},{"originalIngredient":"Yellow soybean paste","substituteOptions":["Miso paste plus soy sauce"]}]
        },
        {
          name: "Congee",
          description: "Congee (zhou in Mandarin, jook in Cantonese) is the most elemental and nourishing preparation in the Chinese culinary tradition - a thick, silky rice porridge that is made by cooking rice in a volume of water or broth eight to ten times greater than the rice itself, over a long period, until the grains completely dissolve and surrender their starch into a smooth, flowing, porcelain-white liquid of remarkable soothing power. It is served from birth to death, as everyday breakfast, as restorative food for the sick, and as the template for many of the most refined toppings.",
          details: {"cuisine":"Chinese","prepTimeMinutes":15,"cookTimeMinutes":90,"baseServingSize":6,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":1,"unit":"cup","name":"Jasmine or long-grain white rice","notes":"Rinsed well."},{"amount":8,"unit":"cups","name":"Chicken broth or water","notes":"Chicken broth creates a richer congee."},{"amount":2,"unit":"inch","name":"Fresh ginger","notes":"Sliced, for the broth."},{"amount":0.5,"unit":"lb","name":"Chicken breast or thigh","notes":"Optional but recommended - poached directly in the congee."},{"amount":2,"unit":"tbsp","name":"Soy sauce","notes":"Light soy sauce, for seasoning."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For serving."},{"amount":2,"unit":"whole","name":"Green onions","notes":"Thinly sliced, for garnish."},{"amount":2,"unit":"tbsp","name":"Fresh ginger","notes":"Julienned, for garnish."},{"amount":0.25,"unit":"cup","name":"Fried shallots or garlic","notes":"For crispy topping."}],
          instructions: ["Step 1: Rinse the rice thoroughly in several changes of water. Combine with the broth or water and sliced ginger in a large, heavy-bottomed pot. Bring to a vigorous boil.","Step 2: Once boiling, reduce heat to a low but active simmer. Cook uncovered, stirring occasionally (especially the bottom to prevent scorching), for 60 to 90 minutes. The rice grains should completely break down and dissolve into a smooth, thick porridge.","Step 3: If adding chicken, lower the raw chicken pieces directly into the simmering congee after the first 30 minutes of cooking. Poach gently until fully cooked, about 20 minutes. Remove, shred finely, and set aside.","Step 4: As the congee cooks, it will thicken significantly. Add more broth or water if needed to maintain a flowing, creamy consistency - it should pour from a spoon but not be watery.","Step 5: Season with soy sauce and white pepper. The congee base should be gently savory, serving as a neutral canvas for the toppings.","Step 6: Ladle into deep bowls. Top with shredded chicken, julienned fresh ginger, sliced green onions, a drizzle of sesame oil, and crispy fried shallots. Optional toppings include century egg, salted egg yolk, or a soft-poached egg cracked into the hot congee just before serving."],
          classifications: {"mealType":["breakfast","lunch","dinner"],"cookingMethods":["long-simmering","poaching"]},
          elementalProperties: {"Fire":0.1,"Water":0.5,"Earth":0.35,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Saturn","Neptune"],"signs":["cancer","capricorn","pisces"],"lunarPhases":["Waning Gibbous"]},
          nutritionPerServing: {"calories":240,"proteinG":16,"carbsG":32,"fatG":6,"fiberG":1,"sodiumMg":680,"sugarG":1,"vitamins":["Niacin","Vitamin B6","Vitamin B12"],"minerals":["Potassium","Phosphorus","Selenium"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":2,"Substance":1},
          thermodynamicProperties: {"heat":0.029,"entropy":0.0856,"reactivity":1.134,"gregsEnergy":-0.068,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Chicken","substituteOptions":["Pork (pork congee)","Fish fillet","Shrimp"]},{"originalIngredient":"Chicken broth","substituteOptions":["Pork bone broth","Vegetable broth"]}]
        },
        {
          name: "Wonton Soup",
          description: "Wonton Soup is one of the most perfectly balanced soups in existence - a crystalline, golden broth of extraordinary clarity and depth, in which thin-skinned wontons filled with seasoned pork and shrimp float like translucent packets, their wrappers simultaneously silky and slightly springy from the egg in the dough. The Cantonese version prized for its purity demands a broth made from dried flounder, shrimp roe, and pork bones that is clarified to jewel-like clarity - a broth so well-made it is considered a dish in itself.",
          details: {"cuisine":"Chinese","prepTimeMinutes":45,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"With some fat content for juiciness."},{"amount":0.25,"unit":"lb","name":"Shrimp","notes":"Finely chopped."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"Light soy sauce."},{"amount":1,"unit":"tsp","name":"Sesame oil","notes":"For the filling."},{"amount":0.5,"unit":"tsp","name":"White pepper","notes":"The essential seasoning in the filling."},{"amount":30,"unit":"whole","name":"Wonton wrappers","notes":"Thin, square, store-bought or homemade."},{"amount":8,"unit":"cups","name":"Chicken or pork broth","notes":"The best quality available."},{"amount":2,"unit":"whole","name":"Green onions","notes":"Sliced, for the broth and garnish."},{"amount":1,"unit":"cup","name":"Bok choy or baby spinach","notes":"Blanched, for the soup."}],
          instructions: ["Step 1: Combine ground pork and chopped shrimp in a bowl. Add soy sauce, sesame oil, white pepper, a pinch of sugar, and minced ginger. Stir vigorously in one direction with a chopstick for 2 minutes until the mixture becomes sticky and develops a slight springy texture - this is the protein binding.","Step 2: To fold wontons: place a wrapper on your palm with a corner pointing toward you. Add a teaspoon of filling slightly below center. Fold the bottom corner up over the filling. Press to seal, squeezing out any air. Bring the two side corners together around your finger and press firmly to seal. The result is a nurse-hat shape.","Step 3: Bring a large pot of water to a vigorous boil. Cook the wontons in batches of 10, never crowding the pot. They are done approximately 2 minutes after they float to the surface (about 4 minutes total). Remove with a spider.","Step 4: While the wontons cook, heat the broth in a separate pot. Season generously with soy sauce, white pepper, and sesame oil. The broth should be savory and clear.","Step 5: Blanch the bok choy or spinach briefly in the wonton cooking water.","Step 6: Divide the cooked wontons between deep bowls. Ladle the hot seasoned broth over them. Add blanched greens and garnish with sliced green onions, a few drops of sesame oil, and a pinch of white pepper. Serve immediately."],
          classifications: {"mealType":["lunch","dinner","breakfast"],"cookingMethods":["boiling","folding","simmering"]},
          elementalProperties: {"Fire":0.15,"Water":0.5,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Mercury","Neptune"],"signs":["cancer","gemini","pisces"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":340,"proteinG":24,"carbsG":38,"fatG":10,"fiberG":2,"sodiumMg":860,"sugarG":2,"vitamins":["Niacin","Vitamin B12","Vitamin C"],"minerals":["Iron","Potassium","Phosphorus"]},
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":2},
          thermodynamicProperties: {"heat":0.0299,"entropy":0.3579,"reactivity":5.9408,"gregsEnergy":-2.0961,"kalchm":1.0,"monica":1.0},
                    substitutions: [{"originalIngredient":"Wonton wrappers","substituteOptions":["Gyoza wrappers","Homemade egg dough wrappers"]},{"originalIngredient":"Ground pork","substituteOptions":["Chicken and shrimp","Tofu and water chestnuts"]}]
        },
        ],
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    dessert: {
      all: [
        {
          "name": "Authentic Egg Custard Tarts (Dan Tat)",
          "description": "A staple of Cantonese dim sum, combining Western pastry techniques with Chinese custard. The crust must be a highly laminated, flaky puff pastry (or a shortcrust cookie base in some regions), cradling a glassy, barely-set, brilliant yellow egg custard.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prepTimeMinutes": 120,
            "cookTimeMinutes": 20,
            "baseServingSize": 12,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "sheet",
              "name": "puff pastry or shortcrust pastry",
              "notes": "Rolled and cut to fit tartlet tins."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the custard."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "hot water",
              "notes": "To dissolve the sugar."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "evaporated milk",
              "notes": "Provides richness without the heaviness of cream."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "eggs",
              "notes": "Beaten gently."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "pure vanilla extract",
              "notes": "Optional, but common."
            }
          ],
          "instructions": [
            "Step 1: The Syrup. Dissolve the sugar in the hot water. Let it cool completely to room temperature. If you pour hot syrup into eggs, they will scramble.",
            "Step 2: The Custard Base. In a bowl, whisk the eggs, evaporated milk, and vanilla. Slowly pour in the cooled sugar syrup while whisking.",
            "Step 3: The Strain (Crucial). Strain the custard mixture through a fine-mesh sieve into a pouring jug. This removes chalazae and any unmixed egg white, ensuring a glass-smooth set.",
            "Step 4: Prep the tins. Preheat oven to 400°F (200°C). Press the pastry circles into individual metal tartlet tins.",
            "Step 5: Fill. Pour the custard into the pastry shells, filling them about 80% full.",
            "Step 6: Bake Phase 1. Bake for 10-12 minutes until the edges of the pastry begin to brown.",
            "Step 7: Bake Phase 2. Reduce the oven temperature to 350°F (175°C). Crack the oven door open slightly (to prevent the custard from boiling and puffing up, which ruins the smooth surface). Bake for another 10 minutes until the custard is just set but still jiggles in the center.",
            "Step 8: Cool slightly before unmolding. They are best served warm."
          ],
          "classifications": {
            "mealType": [
              "dim sum",
              "dessert",
              "baking"
            ],
            "cookingMethods": [
              "whisking",
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.35,
            "Earth": 0.25,
            "Air": 0.25
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
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 210,
            "proteinG": 4,
            "carbsG": 22,
            "fatG": 12,
            "fiberG": 0,
            "sodiumMg": 110,
            "sugarG": 10,
            "vitamins": [
              "Vitamin A",
              "Vitamin D"
            ],
            "minerals": [
              "Calcium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":1,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.1259,"entropy":0.1605,"reactivity":1.4128,"gregsEnergy":-0.1009,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "evaporated milk",
              "substituteOptions": [
                "whole milk (custard will be slightly less rich)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Eight Treasure Rice Pudding (Ba Bao Fan)",
          "description": "A highly decorative, ceremonial dessert served at Lunar New Year. Sticky glutinous rice is steamed with sugar and lard/oil, then molded in a bowl lined with exactly eight types of dried fruits, nuts, and seeds (representing fortune), filled with red bean paste, and steamed again to set the structure.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 240,
            "cookTimeMinutes": 45,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "winter",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "short-grain glutinous rice (sweet rice)",
              "notes": "Soaked overnight."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "pork lard or coconut oil",
              "notes": "Mixed into the cooked rice for gloss and flavor."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "Mixed into the cooked rice."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "sweetened red bean paste",
              "notes": "The hidden center."
            },
            {
              "amount": 8,
              "unit": "types",
              "name": "dried fruits and nuts ('Treasures')",
              "notes": "E.g., jujubes (red dates), lotus seeds, goji berries, candied winter melon, pumpkin seeds, walnuts, raisins, dried apricots."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "water",
              "notes": "For the finishing syrup."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "For the finishing syrup."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "cornstarch",
              "notes": "For the finishing syrup."
            }
          ],
          "instructions": [
            "Step 1: Steam the rice. Drain the soaked sticky rice. Steam it in a basket lined with cheesecloth for 30 minutes until fully cooked and translucent.",
            "Step 2: Season the rice. While the rice is still piping hot, transfer it to a bowl and fold in the lard/coconut oil and 1/2 cup sugar until completely absorbed and glossy.",
            "Step 3: The Architecture. Generously grease a medium-sized, heatproof, dome-shaped bowl. Arrange the 'eight treasures' (dried fruits and nuts) in a decorative, geometric pattern on the bottom and sides of the bowl. This will be the top when unmolded.",
            "Step 4: Layering. Carefully press a layer of the warm sticky rice into the bowl over the decorations, making a well in the center.",
            "Step 5: The Center. Fill the well with the red bean paste.",
            "Step 6: Seal. Cover the bean paste with the remaining sticky rice, pressing down firmly to compact the entire pudding so it holds its shape.",
            "Step 7: Second Steam. Place the bowl back into the steamer and steam for another 15 minutes to fuse everything together.",
            "Step 8: The Glaze. While steaming, boil the water, 2 tbsp sugar, and cornstarch slurry to make a clear, sweet glaze.",
            "Step 9: Unmold and Serve. Invert a serving plate over the bowl and carefully flip it over. Lift off the bowl to reveal the jewel-encrusted dome. Pour the clear glaze over the top and serve hot."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "holiday",
              "sweet"
            ],
            "cookingMethods": [
              "steaming",
              "molding"
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
              "Jupiter",
              "Venus"
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
            "calories": 420,
            "proteinG": 6,
            "carbsG": 85,
            "fatG": 8,
            "fiberG": 4,
            "sodiumMg": 10,
            "sugarG": 35,
            "vitamins": [
              "Vitamin C",
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },
          alchemicalProperties: {"Spirit":1,"Essence":2,"Matter":1,"Substance":0},
          thermodynamicProperties: {"heat":0.0664,"entropy":0.0706,"reactivity":2.2711,"gregsEnergy":-0.094,"kalchm":4.0,"monica":0.0299},
                    "substitutions": [
            {
              "originalIngredient": "pork lard",
              "substituteOptions": [
                "coconut oil (vegan)"
              ]
            },
            {
              "originalIngredient": "red bean paste",
              "substituteOptions": [
                "lotus seed paste",
                "black sesame paste"
              ]
            }
          ]
        },
        {
          "name": "Authentic Mango Pomelo Sago",
          "description": "A modern Hong Kong dessert soup utilizing suspended carbohydrate pearls (sago) in a tropical fluid matrix. The alchemy involves balancing the thick, sweet puree of mango and coconut milk with the acidic, bursting vesicles of pomelo citrus.",
          "details": {
            "cuisine": "Chinese (Hong Kong)",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "small sago pearls (tapioca pearls)",
              "notes": "Must be boiled until translucent."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "ripe mangoes",
              "notes": "Two pureed, one diced for texture."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "coconut milk",
              "notes": "Provides richness."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "evaporated milk",
              "notes": "Thins the puree and adds dairy sweetness."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "simple syrup or condensed milk",
              "notes": "To taste, depending on the sweetness of the mangoes."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "pomelo segments",
              "notes": "Separated into individual teardrop-shaped vesicles (juice sacs). Grapefruit can be used if pomelo is unavailable."
            }
          ],
          "instructions": [
            "Step 1: Boil the Sago. Bring a large pot of water to a rolling boil. Stir in the sago pearls. Boil for 10 minutes. Turn off the heat, cover, and let sit for another 10 minutes until the pearls are completely translucent with no white dots in the center.",
            "Step 2: Rinse. Drain the sago in a fine-mesh sieve and rinse thoroughly under cold running water to remove the excess starch. This stops the cooking and prevents them from clumping. Set aside in a bowl of cold water.",
            "Step 3: The Puree. Cube the flesh of two mangoes. Place them in a blender with the coconut milk, evaporated milk, and simple syrup. Blend until completely smooth and thick.",
            "Step 4: Prep the texture. Dice the remaining mango. Carefully separate the pomelo flesh into individual little sacs.",
            "Step 5: Assemble. In a large serving bowl or individual glasses, combine the chilled mango puree, the drained sago pearls, the diced mango, and the pomelo sacs.",
            "Step 6: Chill. Stir gently to combine. Refrigerate for at least 1 hour before serving. It must be served ice cold."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "soup",
              "sweet"
            ],
            "cookingMethods": [
              "boiling",
              "blending",
              "chilling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.05,
            "Water": 0.65,
            "Earth": 0.2,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Venus"
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
            "calories": 320,
            "proteinG": 4,
            "carbsG": 52,
            "fatG": 12,
            "fiberG": 4,
            "sodiumMg": 45,
            "sugarG": 38,
            "vitamins": [
              "Vitamin C",
              "Vitamin A"
            ],
            "minerals": [
              "Potassium"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0001,"entropy":0.0005,"reactivity":0.9163,"gregsEnergy":-0.0004,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "pomelo",
              "substituteOptions": [
                "pink grapefruit"
              ]
            },
            {
              "originalIngredient": "evaporated milk",
              "substituteOptions": [
                "extra coconut milk or almond milk (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Sesame Balls (Jian Dui)",
          "description": "A masterpiece of deep-fried pastry physics. A dough made of glutinous rice flour expands drastically when fried, creating a massive, hollow, balloon-like interior lined with chewy mochi, encasing a small center of sweet red bean paste, with a rigid, seed-crusted exterior.",
          "details": {
            "cuisine": "Chinese",
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
              "amount": 2,
              "unit": "cups",
              "name": "glutinous rice flour (sweet rice flour)",
              "notes": "Essential for the chewy texture and expansion."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "brown sugar or slab sugar",
              "notes": "Dissolved in boiling water to bind the dough."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "boiling water",
              "notes": "Must be hot to partially cook the rice flour during mixing."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "sweetened red bean paste",
              "notes": "Rolled into small balls for the filling."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "white sesame seeds",
              "notes": "For coating."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "neutral oil",
              "notes": "For deep frying."
            }
          ],
          "instructions": [
            "Step 1: The Syrup. Dissolve the sugar in the boiling water.",
            "Step 2: The Dough. Place the glutinous rice flour in a bowl. Slowly pour the hot sugar water into the flour, stirring continuously with chopsticks. Once cool enough to handle, knead it into a smooth, pliable dough. If it's too crumbly, add a teaspoon of hot water; if too sticky, add a little flour.",
            "Step 3: Shaping. Pinch off a ping-pong sized piece of dough. Roll it into a ball, then use your thumb to press a deep indentation into it, forming a cup.",
            "Step 4: Filling. Place a small ball of red bean paste into the cup. Carefully pinch the dough closed around the filling and roll it between your palms until perfectly smooth. There must be NO cracks, or they will explode in the oil.",
            "Step 5: Coating. Dip the dough ball very quickly into a bowl of water, then roll it in the sesame seeds, pressing firmly so the seeds adhere to the dough.",
            "Step 6: The Fry (Crucial Technique). Heat the oil to only 275°F-300°F (135°C-150°C). It must be a low temperature to start. Carefully drop the balls in.",
            "Step 7: The Expansion. As they fry, they will begin to float. Use a spatula to gently but firmly press the balls down against the side of the wok. This pressing action forces the air inside to expand, causing the ball to balloon up to 3 times its original size.",
            "Step 8: Finish. Once they are fully expanded and golden brown, increase the heat for 30 seconds to crisp the outside. Remove and drain."
          ],
          "classifications": {
            "mealType": [
              "dim sum",
              "dessert",
              "snack",
              "vegan"
            ],
            "cookingMethods": [
              "kneading",
              "filling",
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
              "Venus",
              "Uranus"
            ],
            "signs": [
              "Taurus",
              "Aquarius"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 6,
            "carbsG": 52,
            "fatG": 18,
            "fiberG": 3,
            "sodiumMg": 10,
            "sugarG": 24,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0076,"entropy":0.0103,"reactivity":0.7958,"gregsEnergy":-0.0007,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "red bean paste",
              "substituteOptions": [
                "lotus seed paste",
                "black sesame paste"
              ]
            }
          ]
        },
        {
          "name": "Authentic Tangyuan (Glutinous Rice Balls in Syrup)",
          "description": "A ceremonial dessert eaten during the Lantern Festival symbolizing family unity. The alchemy involves creating an emulsion of black sesame, sugar, and solid fat (lard), freezing it, and wrapping it in glutinous rice dough. When boiled, the fat melts, creating a liquid, molten lava center within a chewy mochi-like shell.",
          "details": {
            "cuisine": "Chinese",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 10,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "winter",
              "celebration"
            ]
          },
          "ingredients": [
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "black sesame seeds",
              "notes": "Toasted and ground into a fine powder."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the filling."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "pork lard or solid coconut oil",
              "notes": "Crucial. Must be solid at room temperature to create the molten center effect."
            },
            {
              "amount": 1.5,
              "unit": "cups",
              "name": "glutinous rice flour",
              "notes": "For the dough."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "warm water",
              "notes": "To hydrate the dough."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "water",
              "notes": "For the soup base."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "rock sugar or osmanthus syrup",
              "notes": "To sweeten the soup base."
            },
            {
              "amount": 1,
              "unit": "piece",
              "name": "fresh ginger",
              "notes": "Sliced, infused into the soup base."
            }
          ],
          "instructions": [
            "Step 1: The Molten Filling. In a food processor, blend the toasted black sesame seeds and sugar into a paste. Add the solid lard (or coconut oil) and pulse until it forms a cohesive, fatty dough. Roll this mixture into small, marble-sized balls. Freeze them for 30 minutes until rock solid.",
            "Step 2: The Dough. Mix the glutinous rice flour and warm water. Knead into a smooth, play-dough-like consistency. It should not stick to your hands.",
            "Step 3: Wrapping. Pinch off a piece of dough slightly larger than the filling balls. Flatten it into a disc. Place a frozen sesame ball in the center. Carefully stretch and pinch the dough around the filling to seal it completely. Roll it smoothly between your palms.",
            "Step 4: The Soup. In a pot, bring the 4 cups of water, rock sugar, and ginger slices to a boil. Simmer for 5 minutes to infuse the ginger.",
            "Step 5: Boil the Tangyuan. Gently drop the filled rice balls into the gently boiling soup. Stir carefully to prevent them from sticking to the bottom.",
            "Step 6: The Float. Cook until the balls float to the surface (about 3-5 minutes), then simmer for 1 more minute to ensure the fat inside has melted into liquid.",
            "Step 7: Serve hot. Place 3-4 balls in a small bowl and ladle the sweet ginger broth over them. Warn diners that the center is molten hot."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "sweet",
              "holiday"
            ],
            "cookingMethods": [
              "freezing",
              "kneading",
              "boiling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.5,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Libra"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 6,
            "carbsG": 45,
            "fatG": 16,
            "fiberG": 3,
            "sodiumMg": 5,
            "sugarG": 18,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          alchemicalProperties: {"Spirit":0,"Essence":2,"Matter":2,"Substance":0},
          thermodynamicProperties: {"heat":0.0004,"entropy":0.0009,"reactivity":0.8072,"gregsEnergy":-0.0003,"kalchm":1.0,"monica":1.0},
                    "substitutions": [
            {
              "originalIngredient": "pork lard",
              "substituteOptions": [
                "coconut oil (solid, refined to avoid strong coconut flavor)",
                "butter"
              ]
            },
            {
              "originalIngredient": "black sesame",
              "substituteOptions": [
                "crushed peanuts",
                "red bean paste (no fat required for this)"
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
      name: "Stir-Frying",
      description: "Quick cooking in a wok over high heat with constant motion",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: ["wok", "wok spatula", "high BTU burner"],
      bestFor: ["vegetables", "thinly sliced meats", "noodles", "rice"],
    },
    {
      name: "Steaming",
      description:
        "Gentle cooking with steam that preserves nutrients and delicate flavors",
      elementalProperties: { Water: 0.7, Air: 0.2, Earth: 0.1, Fire: 0.0 },
      toolsRequired: ["bamboo steamer", "wok or pot", "parchment paper"],
      bestFor: ["seafood", "vegetables", "dumplings", "delicate proteins"],
    },
    {
      name: "Red Cooking",
      description:
        "Slow braising in a soy sauce-based liquid with spices and aromatics",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: ["clay pot", "heavy-bottomed pot", "ladle"],
      bestFor: ["tough cuts of meat", "tofu", "eggs", "vegetables"],
    },
    {
      name: "Dry-Frying",
      description:
        "Frying without batter in minimal oil until ingredients become dry and crispy",
      elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0.0 },
      toolsRequired: ["wok", "fine mesh strainer", "slotted spoon"],
      bestFor: ["green beans", "beef", "tofu", "mushrooms"],
    },
    {
      name: "Velveting",
      description:
        "Marinating protein in egg white and cornstarch, then blanching before cooking",
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      toolsRequired: ["bowl", "strainer", "pot", "thermometer"],
      bestFor: ["chicken", "beef", "seafood", "pork"],
    },
  ],
  regionalCuisines: {
    cantonese: {
      name: "Cantonese Cuisine",
      description:
        "Light, fresh flavors that highlight natural tastes of ingredients, with an emphasis on steaming and stir-frying",
      signature: ["dim sum", "steamed fish", "char siu", "wonton noodles"],
      elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Venus", "Moon", "Libra"],
      seasonality: "all",
    },
    sichuan: {
      name: "Sichuan Cuisine",
      description:
        "Bold, spicy flavors featuring Sichuan peppercorns' numbing sensation (málà) and complex layering of flavors",
      signature: [
        "mapo tofu",
        "kung pao chicken",
        "dan dan noodles",
        "hot pot",
      ],
      elementalProperties: { Fire: 0.7, Earth: 0.2, Water: 0.1, Air: 0.0 },
      astrologicalInfluences: ["Mars", "Pluto", "Scorpio"],
      seasonality: "all",
    },
    shandong: {
      name: "Shandong Cuisine",
      description:
        "One of China's oldest cuisines, featuring fresh seafood, quick frying, and clear soups",
      signature: [
        "braised sea cucumber",
        "sweet and sour carp",
        "Dezhou chicken",
      ],
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Jupiter", "Saturn", "Capricorn"],
      seasonality: "all",
    },
    jiangsu: {
      name: "Jiangsu Cuisine",
      description:
        "Refined, artistically presented cuisine emphasizing seasonal ingredients and precise cutting techniques",
      signature: [
        "Nanjing salted duck",
        "sweet and sour mandarin fish",
        "beggar's chicken",
      ],
      elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
      astrologicalInfluences: ["Mercury", "Venus", "Gemini"],
      seasonality: "all",
    },
  },
  elementalProperties: {
    Earth: 0.3,
    Fire: 0.3,
    Water: 0.3,
    Air: 0.1,
  },
};

export default chinese;
