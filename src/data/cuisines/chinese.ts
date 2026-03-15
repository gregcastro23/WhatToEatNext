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
      fire: ["chili oil", "spicy bean paste", "XO sauce"],
      earth: ["dark soy sauce", "black bean sauce", "hoisin sauce"],
      air: ["white pepper sauce", "light vinegar dressing", "clear broths"],
      water: ["oyster sauce", "ginger sauce", "delicate seafood-based sauces"],
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
          "recipe_name": "Authentic Chinese Congee (Jook)",
          "description": "The ultimate restorative foundation of Chinese comfort food. It relies on the prolonged, violent boiling of rice grains in excess liquid until the structural integrity of the starch completely breaks down, resulting in a thick, velvety, homogenized suspension.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 10,
            "cook_time_minutes": 90,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "breakfast",
              "comfort food",
              "vegan"
            ],
            "cooking_methods": [
              "boiling",
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.6,
            "earth": 0.25,
            "air": 0.05
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Taurus"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 210,
            "protein_g": 5,
            "carbs_g": 42,
            "fat_g": 4,
            "fiber_g": 1,
            "sodium_mg": 580,
            "sugar_g": 0,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "chicken broth",
              "substitute_options": [
                "water",
                "vegetable broth"
              ]
            },
            {
              "original_ingredient": "jasmine rice",
              "substitute_options": [
                "short grain white rice"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Youtiao (Chinese Fried Dough)",
          "description": "A structural engineering marvel of the breakfast world. The dough utilizes the explosive chemical reaction of baking powder, baking soda, and ammonium bicarbonate (alum). When a pair of the dough strips are pressed together and violently stretched into screaming hot oil, they expand rapidly, creating massive internal air pockets within a shatteringly crisp exterior.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 240,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "breakfast",
              "snack",
              "street food"
            ],
            "cooking_methods": [
              "kneading",
              "resting",
              "deep-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.45,
            "water": 0.1,
            "earth": 0.2,
            "air": 0.25
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Uranus"
            ],
            "signs": [
              "Aries",
              "Aquarius"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 380,
            "protein_g": 7,
            "carbs_g": 52,
            "fat_g": 16,
            "fiber_g": 2,
            "sodium_mg": 380,
            "sugar_g": 1,
            "vitamins": [
              "Vitamin E"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "egg",
              "substitute_options": [
                "extra 2 tbsp of water (for vegan youtiao)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Sweet/Savory Soy Milk Soup (Dou Jiang)",
          "description": "The essential pairing for Youtiao. True Chinese breakfast soy milk is made from scratch, utilizing the slow, methodical soaking and grinding of raw yellow soybeans. It is served either sweetened with sugar, or in a highly complex savory version (Xian Dou Jiang) where the hot milk is deliberately curdled with black vinegar, creating a silken tofu-like soup.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 720,
            "cook_time_minutes": 30,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "breakfast",
              "beverage",
              "soup"
            ],
            "cooking_methods": [
              "soaking",
              "blending",
              "boiling",
              "curdling"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.6,
            "earth": 0.15,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Uranus"
            ],
            "signs": [
              "Cancer",
              "Aquarius"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 250,
            "protein_g": 18,
            "carbs_g": 15,
            "fat_g": 12,
            "fiber_g": 4,
            "sodium_mg": 480,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin K",
              "B Vitamins"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "black vinegar",
              "substitute_options": [
                "rice vinegar (will alter the flavor slightly, but will still curdle)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Jianbing (Chinese Crepe)",
          "description": "The king of Chinese street food breakfasts. It is an architectural performance art: a thin, slightly elastic mung bean and wheat crepe is poured on a hot cast-iron griddle, coated in egg, slathered in fermented sweet and spicy sauces, and wrapped around a crispy, violently crunchy fried cracker (baocui) or youtiao.",
          "details": {
            "cuisine": "Chinese (Northern)",
            "prep_time_minutes": 20,
            "cook_time_minutes": 10,
            "base_serving_size": 2,
            "spice_level": "Mild-Medium",
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
            "meal_type": [
              "breakfast",
              "street food",
              "snack"
            ],
            "cooking_methods": [
              "griddling",
              "assembling",
              "folding"
            ]
          },
          "elemental_properties": {
            "fire": 0.25,
            "water": 0.15,
            "earth": 0.4,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Mercury",
              "Mars"
            ],
            "signs": [
              "Gemini",
              "Aries"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 450,
            "protein_g": 14,
            "carbs_g": 62,
            "fat_g": 16,
            "fiber_g": 5,
            "sodium_mg": 850,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin A",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "mung bean flour",
              "substitute_options": [
                "all-purpose flour (will change texture significantly)",
                "buckwheat flour"
              ]
            },
            {
              "original_ingredient": "sweet bean sauce",
              "substitute_options": [
                "hoisin sauce"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Scallion Pancakes (Cong You Bing)",
          "description": "A masterclass in Chinese hot-water dough lamination. Boiling water denatures the flour proteins, preventing heavy gluten formation and ensuring a tender dough. The dough is then smeared with a flour-oil roux (you酥) and massive amounts of scallions, coiled into a snail shape, and flattened to create dozens of distinct, flaky, shatteringly crisp layers when pan-fried.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 60,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "appetizer",
              "snack",
              "dim sum",
              "vegan"
            ],
            "cooking_methods": [
              "kneading",
              "laminating",
              "pan-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.35,
            "water": 0.1,
            "earth": 0.4,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Aries"
            ],
            "lunar_phases": [
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 310,
            "protein_g": 6,
            "carbs_g": 48,
            "fat_g": 10,
            "fiber_g": 2,
            "sodium_mg": 480,
            "sugar_g": 1,
            "vitamins": [
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Selenium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "scallions",
              "substitute_options": [
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
          "recipe_name": "Authentic Sichuan Dan Dan Noodles",
          "description": "The quintessential street food of Chengdu. It is not a soup, but rather a dry noodle dish characterized by intense stratification. Fresh noodles are placed over a violently red, highly complex sauce of chili oil, sesame paste, and Sichuan peppercorns, then topped with deeply savory, dry-fried pork and preserved vegetables (ya cai).",
          "details": {
            "cuisine": "Chinese (Sichuan)",
            "prep_time_minutes": 20,
            "cook_time_minutes": 15,
            "base_serving_size": 2,
            "spice_level": "Fiery",
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
            "meal_type": [
              "lunch",
              "dinner",
              "street food",
              "noodle"
            ],
            "cooking_methods": [
              "stir-frying",
              "boiling",
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.6,
            "water": 0.1,
            "earth": 0.2,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Pluto"
            ],
            "signs": [
              "Scorpio",
              "Aries"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 580,
            "protein_g": 24,
            "carbs_g": 55,
            "fat_g": 28,
            "fiber_g": 4,
            "sodium_mg": 1100,
            "sugar_g": 4,
            "vitamins": [
              "Vitamin A",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "ground pork",
              "substitute_options": [
                "minced shiitake mushrooms and extra ya cai (vegan)"
              ]
            },
            {
              "original_ingredient": "Chinese sesame paste",
              "substitute_options": [
                "tahini mixed with a drop of toasted sesame oil"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Sichuan Mapo Tofu",
          "description": "A masterpiece of Sichuanese culinary alchemy, defining the 'málà' (numbing and spicy) flavor profile.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 15,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "Fiery",
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
            "meal_type": [
              "dinner"
            ],
            "cooking_methods": [
              "stir-frying",
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.6,
            "water": 0.15,
            "earth": 0.15,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars"
            ],
            "signs": [
              "Aries"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 310,
            "protein_g": 14,
            "carbs_g": 12,
            "fat_g": 24,
            "fiber_g": 3,
              "sodium_mg": 608,
              "sugar_g": 16,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": [
            {
              "original_ingredient": "ground beef",
              "substitute_options": [
                "mushrooms"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Har Gow (Shrimp Dumplings)",
          "description": "The benchmark of a Dim Sum chef's skill. Har Gow relies on a highly specialized dough made from wheat starch and tapioca starch, which turns completely translucent when steamed. The filling is pure, violently mixed shrimp and pork fat, engineered for an explosive, snappy texture rather than a soft paste.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prep_time_minutes": 60,
            "cook_time_minutes": 10,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dim sum",
              "appetizer",
              "seafood"
            ],
            "cooking_methods": [
              "mixing",
              "kneading",
              "pleating",
              "steaming"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.45,
            "earth": 0.25,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Neptune"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 280,
            "protein_g": 14,
            "carbs_g": 35,
            "fat_g": 10,
            "fiber_g": 0,
            "sodium_mg": 450,
            "sugar_g": 2,
            "vitamins": [
              "Vitamin B12",
              "Selenium"
            ],
            "minerals": [
              "Iodine",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "wheat starch",
              "substitute_options": [
                "cornstarch (wrapper will be softer and less translucent)"
              ]
            },
            {
              "original_ingredient": "pork fat",
              "substitute_options": [
                "bamboo shoots and extra sesame oil (for a pescatarian version)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Cantonese Char Siu (BBQ Pork)",
          "description": "The pinnacle of Cantonese roasting. Char Siu utilizes long strips of pork shoulder (providing the ideal fat-to-meat ratio) marinated in a complex, high-sugar, fermented bean matrix. High-heat roasting renders the fat, while a maltose glaze applied at the end creates a sticky, lacquer-like, slightly charred exterior.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prep_time_minutes": 1440,
            "cook_time_minutes": 45,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dinner",
              "bbq",
              "meat"
            ],
            "cooking_methods": [
              "marinating",
              "roasting",
              "glazing"
            ]
          },
          "elemental_properties": {
            "fire": 0.5,
            "water": 0.1,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Leo",
              "Aries"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 550,
            "protein_g": 38,
            "carbs_g": 32,
            "fat_g": 28,
            "fiber_g": 1,
            "sodium_mg": 1200,
            "sugar_g": 26,
            "vitamins": [
              "Vitamin B6",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pork shoulder",
              "substitute_options": [
                "pork belly (richer)",
                "chicken thighs",
                "firm seitan (vegan)"
              ]
            },
            {
              "original_ingredient": "fermented red bean curd",
              "substitute_options": [
                "omit and use a drop of red food coloring (authenticity will suffer)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Cantonese Wonton Soup",
          "description": "A paradigm of delicate Chinese comfort. The alchemy lies in the contrast: a pristine, crystal-clear, intensely savory broth (often made from chicken, pork, and dried flounder) housing delicate, slippery wrappers that enclose a snappy, violently mixed filling of shrimp and pork fat.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prep_time_minutes": 60,
            "cook_time_minutes": 180,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "soup",
              "lunch",
              "dinner"
            ],
            "cooking_methods": [
              "mixing",
              "wrapping",
              "boiling",
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.6,
            "earth": 0.15,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Neptune"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 380,
            "protein_g": 24,
            "carbs_g": 45,
            "fat_g": 12,
            "fiber_g": 2,
            "sodium_mg": 950,
            "sugar_g": 2,
            "vitamins": [
              "Vitamin B12",
              "Selenium"
            ],
            "minerals": [
              "Iron",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "shrimp and pork",
              "substitute_options": [
                "minced chicken",
                "shiitake and bok choy paste (vegan)"
              ]
            },
            {
              "original_ingredient": "supreme broth",
              "substitute_options": [
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
          "recipe_name": "Authentic Peking Duck",
          "description": "The imperial masterpiece of Chinese roasting. The skin is separated from the meat using compressed air, blanched to tighten pores, coated in a maltose-vinegar glaze, and air-dried for 24 hours. The resulting roast yields skin that shatters like glass, served with thin pancakes, hoisin, and scallions.",
          "details": {
            "cuisine": "Chinese (Beijing)",
            "prep_time_minutes": 2880,
            "cook_time_minutes": 75,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dinner",
              "celebration",
              "poultry"
            ],
            "cooking_methods": [
              "scalding",
              "air-drying",
              "glazing",
              "roasting"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.1,
            "earth": 0.1,
            "air": 0.4
          },
          "astrological_affinities": {
            "planets": [
              "Sun",
              "Jupiter"
            ],
            "signs": [
              "Leo",
              "Sagittarius"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 680,
            "protein_g": 35,
            "carbs_g": 28,
            "fat_g": 48,
            "fiber_g": 2,
            "sodium_mg": 750,
            "sugar_g": 12,
            "vitamins": [
              "Vitamin A",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Selenium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "whole duck",
              "substitute_options": [
                "no substitute. Technique is specific to duck skin."
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Kung Pao Chicken (Gong Bao Ji Ding)",
          "description": "A classic Sichuan stir-fry requiring intense wok hei and the precise balance of the 'lychee flavor' profile—sweet, sour, and fiercely spicy. It utilizes the 'ma la' combination of numbing Sichuan peppercorns and scorching dried chilies.",
          "details": {
            "cuisine": "Chinese (Sichuan)",
            "prep_time_minutes": 20,
            "cook_time_minutes": 10,
            "base_serving_size": 4,
            "spice_level": "Fiery",
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
            "meal_type": [
              "dinner",
              "stir-fry"
            ],
            "cooking_methods": [
              "velveting",
              "stir-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.6,
            "water": 0.1,
            "earth": 0.2,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Mars",
              "Sun"
            ],
            "signs": [
              "Aries",
              "Scorpio"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 380,
            "protein_g": 25,
            "carbs_g": 12,
            "fat_g": 24,
            "fiber_g": 3,
            "sodium_mg": 680,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin E",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "chicken thigh",
              "substitute_options": [
                "extra firm tofu cubes (vegan)",
                "shrimp"
              ]
            },
            {
              "original_ingredient": "peanuts",
              "substitute_options": [
                "cashews"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Xiaolongbao (Soup Dumplings)",
          "description": "An architectural marvel of Shanghainese dim sum. The secret is incorporating a rich, gelatinous pork aspic (made from boiled pork skin/bones) directly into the meat filling. Upon steaming, the aspic melts, creating a pocket of scalding, savory soup trapped within a delicate, un-yeasted wheat wrapper.",
          "details": {
            "cuisine": "Chinese (Shanghai)",
            "prep_time_minutes": 240,
            "cook_time_minutes": 10,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dim sum",
              "appetizer"
            ],
            "cooking_methods": [
              "boiling",
              "kneading",
              "pleating",
              "steaming"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.5,
            "earth": 0.2,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Neptune"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 22,
            "carbs_g": 35,
            "fat_g": 20,
            "fiber_g": 1,
            "sodium_mg": 650,
            "sugar_g": 2,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pork skin aspic",
              "substitute_options": [
                "agar agar set vegetable broth (for vegan version, using mushroom filling)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Sweet and Sour Pork (Tang Cu Li Ji)",
          "description": "A classic dish defined by its contrasting textures and flavors. Lean pork is coated in a heavy wet starch batter and double-fried for maximum crispness, then rapidly tossed in a bright, glossy sauce balanced precisely between sugar and black vinegar, without the heavy use of ketchup found in Westernized versions.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 30,
            "cook_time_minutes": 20,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dinner",
              "stir-fry"
            ],
            "cooking_methods": [
              "deep-frying",
              "stir-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.2,
            "earth": 0.2,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Sun"
            ],
            "signs": [
              "Taurus",
              "Leo"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 26,
            "carbs_g": 35,
            "fat_g": 26,
            "fiber_g": 2,
            "sodium_mg": 550,
            "sugar_g": 18,
            "vitamins": [
              "Vitamin C"
            ],
            "minerals": [
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pork tenderloin",
              "substitute_options": [
                "chicken breast",
                "cauliflower florets (vegan)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Beef with Broccoli",
          "description": "A staple of Chinese-American cuisine relying on the 'velveting' technique (passing meat through oil or water after an alkaline marinade) to render tough cuts of beef incredibly tender, contrasting with the bright crunch of briefly blanched broccoli.",
          "details": {
            "cuisine": "Chinese-American",
            "prep_time_minutes": 30,
            "cook_time_minutes": 10,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dinner",
              "stir-fry"
            ],
            "cooking_methods": [
              "velveting",
              "blanching",
              "stir-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.35,
            "water": 0.2,
            "earth": 0.35,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Earth",
              "Mars"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 320,
            "protein_g": 26,
            "carbs_g": 18,
            "fat_g": 16,
            "fiber_g": 4,
            "sodium_mg": 850,
            "sugar_g": 4,
            "vitamins": [
              "Vitamin C",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "flank steak",
              "substitute_options": [
                "chicken breast",
                "seitan (vegan, omit oyster sauce for mushroom stir-fry sauce)"
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
    dessert: {
      all: [
        {
          "recipe_name": "Authentic Egg Custard Tarts (Dan Tat)",
          "description": "A staple of Cantonese dim sum, combining Western pastry techniques with Chinese custard. The crust must be a highly laminated, flaky puff pastry (or a shortcrust cookie base in some regions), cradling a glassy, barely-set, brilliant yellow egg custard.",
          "details": {
            "cuisine": "Chinese (Cantonese)",
            "prep_time_minutes": 120,
            "cook_time_minutes": 20,
            "base_serving_size": 12,
            "spice_level": "None",
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
            "meal_type": [
              "dim sum",
              "dessert",
              "baking"
            ],
            "cooking_methods": [
              "whisking",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.35,
            "earth": 0.25,
            "air": 0.25
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Sun"
            ],
            "signs": [
              "Taurus",
              "Leo"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 210,
            "protein_g": 4,
            "carbs_g": 22,
            "fat_g": 12,
            "fiber_g": 0,
            "sodium_mg": 110,
            "sugar_g": 10,
            "vitamins": [
              "Vitamin A",
              "Vitamin D"
            ],
            "minerals": [
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "evaporated milk",
              "substitute_options": [
                "whole milk (custard will be slightly less rich)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Eight Treasure Rice Pudding (Ba Bao Fan)",
          "description": "A highly decorative, ceremonial dessert served at Lunar New Year. Sticky glutinous rice is steamed with sugar and lard/oil, then molded in a bowl lined with exactly eight types of dried fruits, nuts, and seeds (representing fortune), filled with red bean paste, and steamed again to set the structure.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 240,
            "cook_time_minutes": 45,
            "base_serving_size": 8,
            "spice_level": "None",
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
            "meal_type": [
              "dessert",
              "holiday",
              "sweet"
            ],
            "cooking_methods": [
              "steaming",
              "molding"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.3,
            "earth": 0.5,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Jupiter",
              "Venus"
            ],
            "signs": [
              "Taurus",
              "Cancer"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 6,
            "carbs_g": 85,
            "fat_g": 8,
            "fiber_g": 4,
            "sodium_mg": 10,
            "sugar_g": 35,
            "vitamins": [
              "Vitamin C",
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pork lard",
              "substitute_options": [
                "coconut oil (vegan)"
              ]
            },
            {
              "original_ingredient": "red bean paste",
              "substitute_options": [
                "lotus seed paste",
                "black sesame paste"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Mango Pomelo Sago",
          "description": "A modern Hong Kong dessert soup utilizing suspended carbohydrate pearls (sago) in a tropical fluid matrix. The alchemy involves balancing the thick, sweet puree of mango and coconut milk with the acidic, bursting vesicles of pomelo citrus.",
          "details": {
            "cuisine": "Chinese (Hong Kong)",
            "prep_time_minutes": 20,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dessert",
              "soup",
              "sweet"
            ],
            "cooking_methods": [
              "boiling",
              "blending",
              "chilling"
            ]
          },
          "elemental_properties": {
            "fire": 0.05,
            "water": 0.65,
            "earth": 0.2,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Pisces"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 320,
            "protein_g": 4,
            "carbs_g": 52,
            "fat_g": 12,
            "fiber_g": 4,
            "sodium_mg": 45,
            "sugar_g": 38,
            "vitamins": [
              "Vitamin C",
              "Vitamin A"
            ],
            "minerals": [
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pomelo",
              "substitute_options": [
                "pink grapefruit"
              ]
            },
            {
              "original_ingredient": "evaporated milk",
              "substitute_options": [
                "extra coconut milk or almond milk (vegan)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Sesame Balls (Jian Dui)",
          "description": "A masterpiece of deep-fried pastry physics. A dough made of glutinous rice flour expands drastically when fried, creating a massive, hollow, balloon-like interior lined with chewy mochi, encasing a small center of sweet red bean paste, with a rigid, seed-crusted exterior.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 30,
            "cook_time_minutes": 15,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dim sum",
              "dessert",
              "snack",
              "vegan"
            ],
            "cooking_methods": [
              "kneading",
              "filling",
              "deep-frying"
            ]
          },
          "elemental_properties": {
            "fire": 0.4,
            "water": 0.1,
            "earth": 0.3,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Uranus"
            ],
            "signs": [
              "Taurus",
              "Aquarius"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 380,
            "protein_g": 6,
            "carbs_g": 52,
            "fat_g": 18,
            "fiber_g": 3,
            "sodium_mg": 10,
            "sugar_g": 24,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "red bean paste",
              "substitute_options": [
                "lotus seed paste",
                "black sesame paste"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Tangyuan (Glutinous Rice Balls in Syrup)",
          "description": "A ceremonial dessert eaten during the Lantern Festival symbolizing family unity. The alchemy involves creating an emulsion of black sesame, sugar, and solid fat (lard), freezing it, and wrapping it in glutinous rice dough. When boiled, the fat melts, creating a liquid, molten lava center within a chewy mochi-like shell.",
          "details": {
            "cuisine": "Chinese",
            "prep_time_minutes": 60,
            "cook_time_minutes": 10,
            "base_serving_size": 4,
            "spice_level": "None",
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
            "meal_type": [
              "dessert",
              "sweet",
              "holiday"
            ],
            "cooking_methods": [
              "freezing",
              "kneading",
              "boiling"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.5,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Moon",
              "Venus"
            ],
            "signs": [
              "Cancer",
              "Libra"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 350,
            "protein_g": 6,
            "carbs_g": 45,
            "fat_g": 16,
            "fiber_g": 3,
            "sodium_mg": 5,
            "sugar_g": 18,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pork lard",
              "substitute_options": [
                "coconut oil (solid, refined to avoid strong coconut flavor)",
                "butter"
              ]
            },
            {
              "original_ingredient": "black sesame",
              "substitute_options": [
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
