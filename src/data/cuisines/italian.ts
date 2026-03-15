// src/data/cuisines/italian.ts
import type { Cuisine } from "@/types/cuisine";

export const italian: Cuisine = {
  id: "italian",
  name: "Italian",
  description:
    "Traditional Italian cuisine emphasizing fresh ingredients, regional specialties, and time-honored techniques",
  dishes: {
    breakfast: {
      all: [
        {
          "recipe_name": "Authentic Cornetto e Cappuccino",
          "description": "The foundation of the Italian morning ritual. The Cornetto (often confused with the French croissant) is structurally different—it contains less butter, incorporates eggs, and is slightly sweeter, resulting in a softer, more brioche-like interior that pairs perfectly with the intensely aerated, dry foam of a traditional Italian Cappuccino.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 720,
            "cook_time_minutes": 20,
            "base_serving_size": 2,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "00 flour or all-purpose flour",
              "notes": "High quality, finely milled."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the dough."
            },
            {
              "amount": 2,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "Leavening."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "whole milk",
              "notes": "Warm (105°F) for the dough."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "One for the dough, one for the egg wash."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Room temperature, beaten into the dough (not laminated like a croissant)."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "orange or lemon zest",
              "notes": "Essential aromatic difference from a French croissant."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "vanilla extract",
              "notes": "Aromatic."
            },
            {
              "amount": 2,
              "unit": "shots",
              "name": "espresso",
              "notes": "Freshly pulled from an espresso machine."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "whole milk",
              "notes": "Cold, for frothing the cappuccino."
            }
          ],
          "instructions": [
            "Step 1: The Sponge. Dissolve the yeast in the warm milk with 1 tsp of sugar. Let sit for 10 minutes until foamy.",
            "Step 2: The Dough. In a stand mixer, combine the flour, remaining sugar, zest, and vanilla. Add the yeast mixture and 1 egg. Knead on low until a dough forms.",
            "Step 3: Enrich the Dough. While kneading, add the soft butter one tablespoon at a time until completely incorporated. Knead for 10 minutes until the dough is smooth, elastic, and slightly sticky.",
            "Step 4: The Long Fermentation. Cover the dough and let it rise in the refrigerator overnight (8-12 hours). This cold fermentation develops the brioche-like flavor.",
            "Step 5: Shaping. Roll the cold dough out into a large circle, about 1/4-inch thick. Cut the circle into 8 triangles.",
            "Step 6: Rolling. Starting from the wide base of the triangle, roll tightly toward the tip. Curve the ends inward slightly to form a crescent shape. Place on a parchment-lined baking sheet.",
            "Step 7: The Second Rise. Let the shaped cornetti rise in a warm place for 1.5 to 2 hours until doubled in size and very jiggly.",
            "Step 8: Bake. Preheat oven to 375°F (190°C). Brush the cornetti gently with a beaten egg wash. Bake for 15-18 minutes until deeply golden brown and puffed.",
            "Step 9: The Cappuccino. While the cornetti cool slightly, pull two shots of espresso into wide cups. Steam the cold whole milk, introducing air aggressively to create a thick, dense, dry foam (not wet microfoam like a latte).",
            "Step 10: Pour the milk. Pour the steamed milk over the espresso, holding back the foam with a spoon, then dollop the thick foam heavily on top. Serve immediately with the warm cornetto."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "pastry",
              "beverage"
            ],
            "cooking_methods": [
              "kneading",
              "fermenting",
              "baking",
              "steaming"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.25,
            "earth": 0.3,
            "air": 0.25
          },
          "astrological_affinities": {
            "planets": [
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Taurus"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 12,
            "carbs_g": 52,
            "fat_g": 24,
            "fiber_g": 2,
            "sodium_mg": 180,
            "sugar_g": 18,
            "vitamins": [
              "Vitamin A",
              "Riboflavin"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "00 flour",
              "substitute_options": [
                "all-purpose flour"
              ]
            },
            {
              "original_ingredient": "whole milk (for cappuccino)",
              "substitute_options": [
                "oat milk (froths best among plant milks)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Maritozzo con Panna",
          "description": "The quintessential Roman breakfast pastry. A heavily enriched, highly elastic brioche bun (often studded with pine nuts and raisins) is sliced open and violently over-stuffed with freshly whipped, barely sweetened heavy cream. The contrast between the structural bread and the ethereal cream is paramount.",
          "details": {
            "cuisine": "Italian (Rome)",
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
              "amount": 3,
              "unit": "cups",
              "name": "bread flour (farina manitoba)",
              "notes": "Requires high gluten for structural integrity."
            },
            {
              "amount": 2.25,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "Leavening."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "whole milk",
              "notes": "Warm."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the dough."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Room temperature."
            },
            {
              "amount": 6,
              "unit": "tbsp",
              "name": "unsalted butter",
              "notes": "Softened."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "orange zest",
              "notes": "Freshly grated."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "pine nuts",
              "notes": "Optional, but highly traditional in Rome."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "raisins",
              "notes": "Soaked in warm water and drained. Optional."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "heavy whipping cream",
              "notes": "Must be very cold."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "powdered sugar",
              "notes": "For the cream. Italian cream is barely sweetened."
            }
          ],
          "instructions": [
            "Step 1: The Sponge. Dissolve yeast and 1 tsp sugar in the warm milk. Let sit until foamy.",
            "Step 2: The Dough. In a stand mixer, combine flour, remaining sugar, orange zest, eggs, and the yeast mixture. Knead on low speed.",
            "Step 3: Enrich. Gradually add the softened butter, one tablespoon at a time, until the dough is smooth, glossy, and highly elastic (about 15 minutes). Fold in pine nuts and raisins if using.",
            "Step 4: First Rise. Cover and let rise in a warm place for 2 hours until doubled.",
            "Step 5: Shaping. Punch down. Divide the dough into oval-shaped buns (about 80g each). Place on a parchment-lined baking sheet.",
            "Step 6: Second Rise. Let the buns rise for 1 to 1.5 hours until very puffy.",
            "Step 7: Bake. Preheat oven to 350°F (175°C). Gently brush the buns with egg wash. Bake for 12-15 minutes until deeply golden. Let cool completely.",
            "Step 8: The Cream. Whip the cold heavy cream with the powdered sugar until stiff peaks form.",
            "Step 9: Assemble. Slice the cooled buns diagonally down the center, being careful not to cut all the way through the bottom hinge. Open the bun like a clam and over-fill it massively with the whipped cream. Use a straight spatula to scrape the exposed cream flush with the edges of the bun."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "pastry",
              "dessert"
            ],
            "cooking_methods": [
              "kneading",
              "baking",
              "whipping"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.3,
            "earth": 0.25,
            "air": 0.3
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
            "calories": 520,
            "protein_g": 8,
            "carbs_g": 48,
            "fat_g": 34,
            "fiber_g": 2,
            "sodium_mg": 180,
            "sugar_g": 14,
            "vitamins": [
              "Vitamin A"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "pine nuts/raisins",
              "substitute_options": [
                "omit entirely (for a modern plain brioche)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Fette Biscottate con Marmellata",
          "description": "The ubiquitous, austere Italian breakfast. Fette Biscottate translates to 'twice-baked slices'. It is essentially a slightly sweet, highly aerated brioche loaf that is baked, sliced, and baked again until completely dehydrated and shatteringly crisp, providing a rigid structural canvas for high-quality fruit marmalade.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 240,
            "cook_time_minutes": 75,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 3,
              "unit": "cups",
              "name": "bread flour (farina manitoba)",
              "notes": "High protein flour is needed for structural strength."
            },
            {
              "amount": 2.25,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "For lift."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "whole milk",
              "notes": "Warm."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "Slight sweetness."
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "unsalted butter",
              "notes": "Softened."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Room temperature."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Flavor balance."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "honey or malt extract",
              "notes": "Added to the dough to help browning."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "high-quality fruit marmalade",
              "notes": "Apricot, bitter orange, or cherry."
            }
          ],
          "instructions": [
            "Step 1: The Dough. Dissolve yeast and honey in the warm milk. In a stand mixer, combine flour, sugar, salt, the yeast mixture, egg, and butter. Knead for 10-12 minutes until a very smooth, elastic dough forms.",
            "Step 2: First Rise. Place the dough in a lightly oiled bowl, cover, and let rise in a warm place for 1.5 to 2 hours until doubled in size.",
            "Step 3: Shaping. Punch the dough down. Roll it tightly into a log shape that fits exactly into a 9x5 inch loaf pan.",
            "Step 4: Second Rise. Place the log in the greased loaf pan. Cover and let rise until the dough crowns about 1 inch above the rim of the pan (about 1 hour).",
            "Step 5: The First Bake. Preheat oven to 350°F (175°C). Bake the loaf for 35-40 minutes until deeply golden brown and it sounds hollow when tapped. Remove from the pan and let it cool completely on a wire rack (at least 4 hours, preferably overnight). It must be stale to slice properly.",
            "Step 6: The Slicing. Use a very sharp serrated knife to cut the stale loaf into slices exactly 1/2-inch thick.",
            "Step 7: The Second Bake (Biscottatura). Preheat the oven to 300°F (150°C). Lay the slices flat on a baking sheet. Bake for 15-20 minutes, then flip every slice, and bake for another 15-20 minutes.",
            "Step 8: The Dehydration. They are done when they are completely dry, rigid, and golden all the way through. Let them cool completely; they will harden further.",
            "Step 9: Serve the brittle slices spread generously with high-quality marmalade."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "snack"
            ],
            "cooking_methods": [
              "baking",
              "dehydrating",
              "kneading"
            ]
          },
          "elemental_properties": {
            "fire": 0.35,
            "water": 0.05,
            "earth": 0.4,
            "air": 0.2
          },
          "astrological_affinities": {
            "planets": [
              "Saturn",
              "Sun"
            ],
            "signs": [
              "Capricorn",
              "Virgo"
            ],
            "lunar_phases": [
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 310,
            "protein_g": 8,
            "carbs_g": 52,
            "fat_g": 8,
            "fiber_g": 2,
            "sodium_mg": 320,
            "sugar_g": 18,
            "vitamins": [
              "Vitamin C (from marmalade)"
            ],
            "minerals": [
              "Iron",
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "marmalade",
              "substitute_options": [
                "Nutella",
                "butter and honey"
              ]
            }
          ]
        },
      ],
      summer: [
        {
          "recipe_name": "Authentic Granita con Brioche",
          "description": "The definitive Sicilian breakfast. It is a brilliant textural contrast: a semi-frozen, crystalline, deeply flavored water-ice (usually lemon, almond, or coffee) paired with an impossibly light, warm, egg-rich brioche bun crowned with a topknot (tuppo). The brioche is designed to be torn and dipped directly into the melting ice.",
          "details": {
            "cuisine": "Italian (Sicily)",
            "prep_time_minutes": 240,
            "cook_time_minutes": 20,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "cups",
              "name": "water",
              "notes": "For the Granita."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the Granita syrup."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "Must be freshly squeezed, strained. (For Lemon Granita)."
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "bread flour (farina manitoba)",
              "notes": "For the Brioche."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the Brioche."
            },
            {
              "amount": 2.25,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "For the Brioche."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "whole milk",
              "notes": "Warm, for the Brioche."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "eggs",
              "notes": "2 for the dough, 1 for the egg wash."
            },
            {
              "amount": 80,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Softened to room temperature."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "orange zest",
              "notes": "Aromatic for the Brioche."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "For the Brioche."
            }
          ],
          "instructions": [
            "Step 1: The Granita Syrup. In a saucepan, heat the water and 3/4 cup sugar until dissolved. Let cool completely. Stir in the fresh lemon juice.",
            "Step 2: The Freeze. Pour the liquid into a wide, shallow metal or glass dish. Place in the freezer. Every 30-45 minutes, use a fork to aggressively scrape and break up the ice crystals forming on the edges and bottom. Repeat this for 3-4 hours until the entire mixture is a mass of flaky, snowy crystals.",
            "Step 3: The Brioche Dough. Dissolve yeast in warm milk. In a mixer, combine flour, 1/4 cup sugar, salt, and orange zest. Add the yeast mixture and 2 eggs. Knead until a dough forms.",
            "Step 4: Incorporate Butter. Add the softened butter slowly while kneading. Knead for 10-15 minutes until the dough is silky, glossy, and passes the windowpane test.",
            "Step 5: First Rise. Let the dough rise in a warm place for 2 hours until doubled.",
            "Step 6: Shaping the 'Tuppo'. Punch dough down. Divide into 4 large balls (the base) and 4 small balls (the tuppo/topknot). Place the large balls on a baking sheet. Press a deep indentation into the center of each large ball. Place the small ball into the indentation.",
            "Step 7: Second Rise. Let the shaped brioche rise for 1.5 hours until very puffy.",
            "Step 8: Bake. Preheat oven to 350°F (175°C). Gently brush the brioche with beaten egg wash. Bake for 15-20 minutes until deeply golden and glossy.",
            "Step 9: Serve. Serve the Granita in a glass goblet alongside the warm Brioche col Tuppo. The diner tears off the topknot first to dip into the ice."
          ],
          "classifications": {
            "meal_type": [
              "breakfast",
              "dessert"
            ],
            "cooking_methods": [
              "freezing",
              "scraping",
              "kneading",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.1,
            "water": 0.5,
            "earth": 0.15,
            "air": 0.25
          },
          "astrological_affinities": {
            "planets": [
              "Sun",
              "Moon"
            ],
            "signs": [
              "Leo",
              "Cancer"
            ],
            "lunar_phases": [
              "New Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 480,
            "protein_g": 10,
            "carbs_g": 85,
            "fat_g": 12,
            "fiber_g": 2,
            "sodium_mg": 280,
            "sugar_g": 45,
            "vitamins": [
              "Vitamin C"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "lemon juice",
              "substitute_options": [
                "almond milk/paste (for Granita di Mandorla)",
                "strong espresso (for Granita di Caffè)"
              ]
            }
          ]
        },
        {
          name: "Ricotta e Fichi",
          description: "Fresh ricotta with figs and honey",
          cuisine: "Italian",
          cookingMethods: ["assembling"],
          tools: ["serving bowl", "honey dipper", "knife", "spoon"],
          preparationSteps: [
            "Place ricotta in serving bowl",
            "Quarter fresh figs",
            "Arrange figs around ricotta",
            "Drizzle with honey",
            "Sprinkle with pistachios",
          ],
          ingredients: [
            {
              name: "ricotta",
              amount: "200",
              unit: "g",
              category: "dairy",
              swaps: ["almond ricotta"],
            },
            {
              name: "fresh figs",
              amount: "4",
              unit: "whole",
              category: "fruit",
            },
            { name: "honey", amount: "2", unit: "tbsp", category: "sweetener" },
            { name: "pistachios", amount: "30", unit: "g", category: "nuts" },
          ],
          substitutions: {
            ricotta: ["almond ricotta", "cashew ricotta"],
            honey: ["agave nectar", "maple syrup"],
          },
          servingSize: 2,
          allergens: ["dairy", "nuts"],
          prepTime: "5 minutes",
          cookTime: "0 minutes",
          culturalNotes:
            "A simple summer breakfast that showcases Italy's love for fresh, seasonal ingredients",
          pairingSuggestions: ["fresh mint tea", "crusty bread"],
          dietaryInfo: ["vegetarian", "gluten-free"],
          spiceLevel: "none",
          nutrition: {
            calories: 380,
            protein: 18,
            carbs: 42,
            fat: 18,
            fiber: 3,
            vitamins: ["A", "B12", "K"],
            minerals: ["Calcium", "Magnesium"],
          },
          season: ["summer"],
          mealType: ["breakfast"],
        },
      ],
      winter: [
        {
          "recipe_name": "Authentic Cioccolata Calda con Biscotti",
          "description": "True Italian hot chocolate is an exercise in viscosity, closer to a molten pudding than an American-style watery drink. The structural trick relies on cornstarch acting as a gelatinous matrix when heated, binding whole milk and intense dark chocolate into a spoonable, luxurious emulsion.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 5,
            "cook_time_minutes": 10,
            "base_serving_size": 2,
            "spice_level": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 1.5,
              "unit": "cups",
              "name": "whole milk",
              "notes": "Crucial for fat content."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "high-quality cocoa powder",
              "notes": "Unsweetened, sifted."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "granulated sugar",
              "notes": "Adjust based on the sweetness of the solid chocolate."
            },
            {
              "amount": 1.5,
              "unit": "tbsp",
              "name": "cornstarch",
              "notes": "The secret to Italian thickness."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "kosher salt",
              "notes": "Enhances the chocolate flavor."
            },
            {
              "amount": 60,
              "unit": "g",
              "name": "dark chocolate (70%+)",
              "notes": "Finely chopped."
            },
            {
              "amount": 4,
              "unit": "pieces",
              "name": "Cantuccini (Biscotti)",
              "notes": "Hard almond cookies for dipping."
            }
          ],
          "instructions": [
            "Step 1: The Slurry. In a small bowl, whisk the cornstarch with 3 tablespoons of the cold milk until completely smooth and lump-free.",
            "Step 2: Whisk the dry. In a small saucepan, whisk together the sifted cocoa powder, sugar, and salt.",
            "Step 3: Combine. Gradually whisk the remaining cold milk into the cocoa mixture in the saucepan until smooth.",
            "Step 4: Heat and thicken. Place the saucepan over medium-low heat. Whisk continuously as the milk heats. Do not let it boil vigorously.",
            "Step 5: Introduce the matrix. Just as steam begins to rise from the milk, whisk in the cornstarch slurry.",
            "Step 6: The Melt. Continue to whisk constantly for 3-5 minutes. As it reaches a simmer, it will suddenly and dramatically thicken. Once it coats the back of a spoon thickly (like a custard), remove it from the heat immediately.",
            "Step 7: The Chocolate. Stir the finely chopped dark chocolate into the hot mixture until melted and completely glossy.",
            "Step 8: Serve immediately in small cups, accompanied by the hard biscotti for dipping."
          ],
          "classifications": {
            "meal_type": [
              "beverage",
              "dessert",
              "snack"
            ],
            "cooking_methods": [
              "whisking",
              "simmering"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.5,
            "earth": 0.25,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Pluto"
            ],
            "signs": [
              "Scorpio",
              "Taurus"
            ],
            "lunar_phases": [
              "Waning Crescent"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 9,
            "carbs_g": 55,
            "fat_g": 18,
            "fiber_g": 4,
            "sodium_mg": 180,
            "sugar_g": 35,
            "vitamins": [
              "Vitamin D",
              "Calcium"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "whole milk",
              "substitute_options": [
                "oat milk (works very well with cornstarch)"
              ]
            },
            {
              "original_ingredient": "cornstarch",
              "substitute_options": [
                "potato starch"
              ]
            }
          ]
        },
      ],
    },
    lunch: {
      all: [
        {
          "recipe_name": "Authentic Pasta al Pomodoro",
          "description": "The ultimate test of an Italian cook. It is not just tomato sauce on noodles; it is an emulsion. The pasta must finish cooking directly in the pan with the tomato sauce and a ladle of starchy pasta water, aggressively tossed to create a glossy, binding mantle of sauce that clings to every strand.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 10,
            "cook_time_minutes": 20,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer",
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 400,
              "unit": "g",
              "name": "Spaghetti or Bucatini",
              "notes": "Dried bronze-die extruded pasta is essential for starch release."
            },
            {
              "amount": 800,
              "unit": "g",
              "name": "whole peeled San Marzano tomatoes",
              "notes": "Canned. Crushed by hand. Do not use pre-diced or pureed."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Smashed whole, to flavor the oil and be removed."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality."
            },
            {
              "amount": 1,
              "unit": "large bunch",
              "name": "fresh basil",
              "notes": "Torn by hand, never chopped with a knife."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "kosher salt",
              "notes": "For the pasta water (must taste like the sea)."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "Parmigiano-Reggiano",
              "notes": "Freshly grated. Optional, but traditional off heat."
            }
          ],
          "instructions": [
            "Step 1: Infuse the oil. In a wide skillet, heat the olive oil over medium heat. Add the smashed garlic cloves. Fry gently until golden brown, infusing the oil. Remove and discard the garlic.",
            "Step 2: The Sauce. Carefully pour the hand-crushed tomatoes into the hot oil (it will splatter). Add a pinch of salt. Simmer briskly uncovered for 15 minutes until the oil rises to the surface and the sauce thickens.",
            "Step 3: Boil the pasta. In a large pot of aggressively salted boiling water, drop the pasta. Cook for 2 minutes LESS than the package instructions for al dente.",
            "Step 4: The Emulsion (Mantecatura). Transfer the undercooked pasta directly from the water into the skillet with the tomato sauce using tongs (do not drain the pot).",
            "Step 5: Bind. Add one ladle of the starchy pasta water to the skillet. Increase the heat to high. Toss the pasta violently and continuously in the sauce for 2 minutes. The starch and oil will emulsify, creating a glossy coating.",
            "Step 6: Finish. Turn off the heat. Tear the fresh basil over the pasta. Add a drizzle of raw olive oil and toss one final time. Serve immediately with Parmigiano."
          ],
          "classifications": {
            "meal_type": [
              "lunch",
              "dinner",
              "pasta",
              "vegetarian",
              "vegan"
            ],
            "cooking_methods": [
              "simmering",
              "boiling",
              "emulsifying"
            ]
          },
          "elemental_properties": {
            "fire": 0.25,
            "water": 0.35,
            "earth": 0.3,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Taurus"
            ],
            "lunar_phases": [
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 12,
            "carbs_g": 70,
            "fat_g": 14,
            "fiber_g": 4,
            "sodium_mg": 350,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin C",
              "Lycopene"
            ],
            "minerals": [
              "Iron",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "San Marzano tomatoes",
              "substitute_options": [
                "fresh ripe cherry tomatoes (requires longer cooking to break down)"
              ]
            },
            {
              "original_ingredient": "Spaghetti",
              "substitute_options": [
                "gluten-free pasta (must have high starch content to emulsify)"
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Insalata Caprese",
          "description": "The edible manifestation of the Italian flag. It requires absolutely no cooking, relying 100% on the perfection of its ingredients: weeping, sun-warmed tomatoes, milky Buffalo mozzarella, pungent basil, and peppery olive oil. Balsamic vinegar is strictly prohibited in an authentic Caprese.",
          "details": {
            "cuisine": "Italian (Campania)",
            "prep_time_minutes": 5,
            "cook_time_minutes": 0,
            "base_serving_size": 2,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 200,
              "unit": "g",
              "name": "Mozzarella di Bufala Campana",
              "notes": "Must be buffalo mozzarella, served at room temperature. Never use hard, low-moisture mozzarella."
            },
            {
              "amount": 300,
              "unit": "g",
              "name": "Cuore di Bue or heirloom tomatoes",
              "notes": "Must be deeply ripe, stored at room temperature (never refrigerated)."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "fresh basil leaves",
              "notes": "Small, tender leaves are preferred. Do not chop them; bruising them turns them black."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "extra virgin olive oil",
              "notes": "Must be robust, grassy, and high quality."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "flaky sea salt",
              "notes": "For finishing."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground. Optional, but traditional."
            }
          ],
          "instructions": [
            "Step 1: Prep the ingredients. Use a very sharp serrated knife to slice the tomatoes exactly 1/4-inch thick. Slice the buffalo mozzarella to the exact same thickness. Tear the mozzarella slightly if you prefer a more rustic presentation to catch the oil.",
            "Step 2: Architecture. On a flat serving platter, alternate overlapping slices of tomato and mozzarella in a ring or a straight shingled line.",
            "Step 3: The Herb. Tuck whole, unbruised basil leaves between the layers of cheese and tomato.",
            "Step 4: Seasoning. Just before serving, sprinkle the flaky sea salt generously over the tomatoes (the salt draws out the juices, which mix with the milk from the cheese).",
            "Step 5: The Emulsion. Generously drizzle the extra virgin olive oil over the entire plate. The oil, tomato water, and whey from the mozzarella will form a natural, unctuous dressing at the bottom of the plate.",
            "Step 6: Serve immediately with crusty bread to mop up the juices."
          ],
          "classifications": {
            "meal_type": [
              "salad",
              "appetizer",
              "vegetarian",
              "raw"
            ],
            "cooking_methods": [
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.05,
            "water": 0.5,
            "earth": 0.25,
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
              "First Quarter"
            ]
          },
          "nutrition_per_serving": {
            "calories": 350,
            "protein_g": 18,
            "carbs_g": 8,
            "fat_g": 28,
            "fiber_g": 2,
            "sodium_mg": 450,
            "sugar_g": 5,
            "vitamins": [
              "Vitamin C",
              "Vitamin A",
              "Lycopene"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "buffalo mozzarella",
              "substitute_options": [
                "burrata",
                "cashew mozzarella (vegan)"
              ]
            },
            {
              "original_ingredient": "olive oil",
              "substitute_options": [
                "no substitute. Essential."
              ]
            }
          ]
        },
        {
          "recipe_name": "Authentic Panzanella (Tuscan Bread Salad)",
          "description": "The ultimate Tuscan agrarian recycling technique. Stale, saltless Tuscan bread is soaked in water, squeezed dry, and then used as a sponge to absorb the volatile juices of overripe tomatoes, sharp red onions, and pungent vinegar.",
          "details": {
            "cuisine": "Italian (Tuscany)",
            "prep_time_minutes": 30,
            "cook_time_minutes": 0,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 300,
              "unit": "g",
              "name": "stale, crusty bread (ideally saltless Tuscan bread)",
              "notes": "Must be genuinely stale and hard, not just toasted."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "very ripe tomatoes",
              "notes": "Cut into chunks."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "red onion",
              "notes": "Very thinly sliced and soaked in water/vinegar to remove harshness."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "cucumber",
              "notes": "Peeled, seeded, and chopped."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "fresh basil",
              "notes": "Torn."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Robust quality."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "Provides the essential sharp bite."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            }
          ],
          "instructions": [
            "Step 1: Prep the onions. Place the sliced red onions in a small bowl with cold water and 1 tbsp of vinegar for 15 minutes. Drain well.",
            "Step 2: Revive the bread. Tear the stale bread into large chunks. Place them in a bowl and sprinkle lightly with water until softened but not turning to mush. Squeeze the chunks aggressively with your hands to wring out all excess water.",
            "Step 3: The Tomato Juice. Place the chopped tomatoes in a large serving bowl. Sprinkle heavily with salt and let sit for 10 minutes to draw out their juices (the 'zoumi').",
            "Step 4: Combine. Add the squeezed bread chunks to the tomatoes. The bread will act as a sponge to absorb the tomato water.",
            "Step 5: Assemble. Add the drained red onions, chopped cucumber, and torn basil.",
            "Step 6: Dress. Drizzle the olive oil and remaining 2 tbsp of red wine vinegar over the salad. Season with black pepper.",
            "Step 7: The Rest (Crucial). Toss vigorously with your hands, mashing some of the bread into the tomatoes. Let the salad rest at room temperature for at least 30 minutes (up to 2 hours) before serving so the bread fully hydrates with the dressing."
          ],
          "classifications": {
            "meal_type": [
              "salad",
              "lunch",
              "vegan",
              "appetizer"
            ],
            "cooking_methods": [
              "soaking",
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.05,
            "water": 0.4,
            "earth": 0.45,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Earth",
              "Venus"
            ],
            "signs": [
              "Virgo",
              "Taurus"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 320,
            "protein_g": 6,
            "carbs_g": 38,
            "fat_g": 18,
            "fiber_g": 4,
            "sodium_mg": 450,
            "sugar_g": 6,
            "vitamins": [
              "Vitamin C",
              "Lycopene"
            ],
            "minerals": [
              "Potassium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "Tuscan bread",
              "substitute_options": [
                "stale ciabatta",
                "stale sourdough (note: these contain salt, adjust seasoning accordingly)"
              ]
            }
          ]
        },
      ],
      winter: [
        {
          name: "Ribollita",
          description: "Hearty Tuscan bread and vegetable soup",
          cuisine: "Italian",
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
              name: "sautéing",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.12,
                Earth: 0.18,
                Air: 0.29,
              },
            },
          ],
          tools: ["large pot", "wooden spoon", "knife", "cutting board"],
          preparationSteps: [
            "Sauté vegetables and herbs",
            "Add beans and tomatoes",
            "Simmer with broth",
            "Add bread chunks",
            "Continue cooking until thickened",
            "Rest overnight for best results",
          ],
          ingredients: [
            {
              name: "stale bread",
              amount: "300",
              unit: "g",
              category: "bread",
              swaps: ["gluten-free bread"],
            },
            {
              name: "cannellini beans",
              amount: "400",
              unit: "g",
              category: "legume",
            },
            {
              name: "cavolo nero",
              amount: "200",
              unit: "g",
              category: "vegetable",
              swaps: ["kale"],
            },
            {
              name: "vegetables",
              amount: "500",
              unit: "g",
              category: "vegetable",
            },
            { name: "olive oil", amount: "60", unit: "ml", category: "oil" },
          ],
          substitutions: {
            "cavolo nero": ["kale", "Swiss chard"],
            "stale bread": ["gluten-free bread", "crusty bread"],
            "cannellini beans": ["navy beans", "great northern beans"],
          },
          servingSize: 6,
          allergens: ["gluten"],
          prepTime: "30 minutes",
          cookTime: "1 hour",
          culturalNotes:
            "A peasant dish from Tuscany that exemplifies the Italian tradition of not wasting food",
          pairingSuggestions: [
            "Chianti wine",
            "extra virgin olive oil drizzle",
          ],
          dietaryInfo: ["vegetarian", "vegan"],
          spiceLevel: "mild",
          nutrition: {
            calories: 380,
            protein: 15,
            carbs: 58,
            fat: 12,
            fiber: 3,
            vitamins: ["A", "C", "K"],
            minerals: ["Iron", "Fiber"],
          },
          season: ["winter", "autumn"],

          elementalProperties: {
            Fire: 0.17,
            Water: 0.11,
            Earth: 0.54,
            Air: 0.17,
          },
          mealType: ["lunch", "dinner"],
        },
        {
          name: "Pasta e Fagioli",
          description: "Classic pasta and bean soup",
          cuisine: "Italian",
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
          tools: ["large pot", "wooden spoon", "knife", "cutting board"],
          preparationSteps: [
            "Sauté vegetables and herbs",
            "Add beans and pasta",
            "Simmer with broth",
            "Season with salt and pepper",
            "Serve with grated parmesan",
          ],
          ingredients: [
            {
              name: "small pasta",
              amount: "200",
              unit: "g",
              category: "grain",
              swaps: ["gluten-free pasta"],
            },
            {
              name: "borlotti beans",
              amount: "400",
              unit: "g",
              category: "legume",
            },
            {
              name: "tomato passata",
              amount: "200",
              unit: "ml",
              category: "sauce",
            },
            { name: "rosemary", amount: "2", unit: "sprigs", category: "herb" },
            {
              name: "pancetta",
              amount: "50",
              unit: "g",
              category: "protein",
              swaps: ["smoked tofu"],
            },
          ],
          substitutions: {
            "small pasta": ["gluten-free pasta", "rice pasta"],
            "borlotti beans": ["cannellini beans", "kidney beans"],
            "tomato passata": ["tomato sauce", "diced tomatoes"],
            rosemary: ["thyme", "oregano"],
            pancetta: ["bacon", "smoked tofu"],
          },
          servingSize: 4,
          allergens: ["gluten"],
          prepTime: "20 minutes",
          cookTime: "45 minutes",
          culturalNotes:
            "A hearty and comforting soup that's perfect for cold winter days",
          pairingSuggestions: ["Chianti wine", "crusty bread"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "mild",
          nutrition: {
            calories: 440,
            protein: 22,
            carbs: 68,
            fat: 12,
            fiber: 3,
            vitamins: ["B1", "B12", "C"],
            minerals: ["Iron", "Potassium"],
          },
          season: ["winter"],

          elementalProperties: {
            Fire: 0.08,
            Water: 0.22,
            Earth: 0.62,
            Air: 0.08,
          },
          mealType: ["lunch"],
        },
      ],
    },
    dinner: {
      all: [
        {
          "recipe_name": "Authentic Osso Buco alla Milanese",
          "description": "The pinnacle of Northern Italian braising.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 20,
            "cook_time_minutes": 150,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "pieces",
              "name": "veal shanks",
              "notes": "Tied."
            }
          ],
          "instructions": [
            "Step 1: Sear shanks.",
            "Step 2: Braise in white wine.",
            "Step 3: Top with gremolata."
          ],
          "classifications": {
            "meal_type": [
              "dinner"
            ],
            "cooking_methods": [
              "braising"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.35,
            "earth": 0.4,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Jupiter"
            ],
            "signs": [
              "Taurus"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 550,
            "protein_g": 48,
            "carbs_g": 12,
            "fat_g": 32,
            "fiber_g": 2,
              "sodium_mg": 209,
              "sugar_g": 15,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          name: "Risotto ai Funghi",
          description: "Creamy mushroom risotto",
          cuisine: "Italian",
          cookingMethods: [
            {
              name: "sautéing",
              elementalProperties: {
                Fire: 0.41,
                Water: 0.12,
                Earth: 0.18,
                Air: 0.29,
              },
            },
            "gradual-liquid-addition",
          ],
          tools: ["heavy-bottomed pan", "wooden spoon", "ladle", "saucepan"],
          preparationSteps: [
            "Prepare mushroom broth",
            "Toast rice with onions",
            "Add wine and reduce",
            "Gradually add hot broth",
            "Finish with butter and cheese",
            "Rest before serving",
          ],
          ingredients: [
            {
              name: "arborio rice",
              amount: "320",
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
              name: "porcini mushrooms",
              amount: "30",
              unit: "g",
              category: "fungi",
              swaps: ["other mushrooms"],
            },
            { name: "white wine", amount: "120", unit: "ml", category: "wine" },
            {
              name: "parmigiano",
              amount: "80",
              unit: "g",
              category: "dairy",
              swaps: ["nutritional yeast"],
            },
          ],
          substitutions: {
            parmigiano: ["nutritional yeast", "vegan parmesan"],
            "white wine": ["vegetable stock", "mushroom stock"],
            butter: ["olive oil", "vegan butter"],
          },
          servingSize: 4,
          allergens: ["dairy"],
          prepTime: "15 minutes",
          cookTime: "25 minutes",
          culturalNotes:
            "A northern Italian specialty that showcases the region's love for rice dishes",
          pairingSuggestions: ["Barolo", "simple green salad"],
          dietaryInfo: ["vegetarian"],
          spiceLevel: "none",
          nutrition: {
            calories: 380,
            protein: 12,
            carbs: 65,
            fat: 18,
            fiber: 3,
            vitamins: ["D", "B12"],
            minerals: ["Iron", "Calcium"],
          },
          season: ["autumn"],

          elementalProperties: {
            Fire: 0.09,
            Water: 0.27,
            Earth: 0.55,
            Air: 0.09,
          },
          mealType: ["dinner"],
        },
        {
          "recipe_name": "Authentic Gnocchi alla Sorrentina",
          "description": "A Campanian classic relying on the structural perfection of potato gnocchi. The gnocchi must be light enough to float but sturdy enough to withstand being aggressively baked in a rapidly bubbling, basil-heavy tomato sauce, buried under a thick mantle of stretching mozzarella.",
          "details": {
            "cuisine": "Italian (Campania)",
            "prep_time_minutes": 60,
            "cook_time_minutes": 30,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "starchy potatoes (Russet or older potatoes)",
              "notes": "Boiled whole with skin on to prevent waterlogging."
            },
            {
              "amount": 300,
              "unit": "g",
              "name": "00 flour or all-purpose flour",
              "notes": "Approximate amount. Use as little as possible to bind the dough."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Lightly beaten, helps bind the dough."
            },
            {
              "amount": 800,
              "unit": "g",
              "name": "tomato passata (purée)",
              "notes": "For the sauce."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Smashed whole."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "extra virgin olive oil",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "large bunch",
              "name": "fresh basil",
              "notes": "Torn by hand."
            },
            {
              "amount": 250,
              "unit": "g",
              "name": "fresh mozzarella (Fiordilatte)",
              "notes": "Cut into cubes and drained thoroughly of excess water."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "Parmigiano-Reggiano",
              "notes": "Freshly grated."
            }
          ],
          "instructions": [
            "Step 1: The Potatoes. Boil the potatoes whole, with their skins on, until completely tender (45 mins). This prevents them from absorbing water. Drain, peel them while still very hot, and pass them through a potato ricer onto a clean, floured surface.",
            "Step 2: The Dough. Let the riced potatoes cool slightly so the steam escapes. Sprinkle a pinch of salt and the beaten egg over the potatoes. Gradually sift the flour over the top.",
            "Step 3: Knead lightly. Using your hands, gently bring the mixture together into a soft dough. Do not over-knead, or gluten will develop and make the gnocchi rubbery. The dough should be slightly warm and pillowy.",
            "Step 4: Roll and Cut. Cut a piece of dough, roll it into a snake about 3/4-inch thick. Cut the snake into 1-inch pillows. (Optional: roll them over a gnocchi board or fork to create ridges). Toss with flour and set aside.",
            "Step 5: The Sauce. Heat olive oil in a pan, add smashed garlic. Fry until golden, then discard garlic. Pour in the tomato passata, season with salt, and simmer for 15 minutes. Tear in half the basil leaves.",
            "Step 6: Boil Gnocchi. Bring a large pot of salted water to a gentle boil. Drop the gnocchi in batches. The exact moment they float to the surface (about 1-2 minutes), they are done. Remove with a slotted spoon directly into the tomato sauce pan.",
            "Step 7: Assemble for baking. Preheat oven to 400°F (200°C) or prepare a broiler. Toss the gnocchi gently in the sauce. Transfer half the gnocchi to a clay baking dish. Top with half the mozzarella cubes and half the Parmigiano.",
            "Step 8: The Top Layer. Add the remaining gnocchi, the rest of the mozzarella, the rest of the Parmigiano, and the remaining fresh basil leaves.",
            "Step 9: Bake. Bake or broil for 5-10 minutes until the cheese is violently bubbling, melted, and slightly browned on top. Serve immediately."
          ],
          "classifications": {
            "meal_type": [
              "dinner",
              "lunch",
              "pasta",
              "vegetarian"
            ],
            "cooking_methods": [
              "boiling",
              "kneading",
              "simmering",
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.15,
            "water": 0.25,
            "earth": 0.45,
            "air": 0.15
          },
          "astrological_affinities": {
            "planets": [
              "Venus",
              "Moon"
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
            "calories": 550,
            "protein_g": 22,
            "carbs_g": 72,
            "fat_g": 18,
            "fiber_g": 6,
            "sodium_mg": 450,
            "sugar_g": 8,
            "vitamins": [
              "Vitamin C",
              "Vitamin A"
            ],
            "minerals": [
              "Calcium",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "starchy potatoes",
              "substitute_options": [
                "ricotta cheese (to make Gnudi instead)"
              ]
            },
            {
              "original_ingredient": "fresh mozzarella",
              "substitute_options": [
                "scamorza",
                "provolone"
              ]
            }
          ]
        },
      ],
      summer: [
        {
          name: "Acqua Pazza",
          description: "Neapolitan style fish in 'crazy water'",
          cuisine: "Italian (Neapolitan)",
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
              name: "simmering",
              elementalProperties: {
                Fire: 0.2,
                Water: 0.53,
                Earth: 0.17,
                Air: 0.1,
              },
            },
          ],
          tools: ["large skillet", "fish spatula", "knife", "cutting board"],
          preparationSteps: [
            "Clean and prepare fish",
            "Sauté garlic and herbs",
            "Add tomatoes and wine",
            "Poach fish in liquid",
            "Garnish with fresh herbs",
          ],
          ingredients: [
            {
              name: "fresh fish",
              amount: "600",
              unit: "g",
              category: "protein",
              swaps: ["sea bass", "cod"],
            },
            {
              name: "cherry tomatoes",
              amount: "300",
              unit: "g",
              category: "vegetable",
            },
            {
              name: "white wine",
              amount: "150",
              unit: "ml",
              category: "wine",
              swaps: ["fish stock"],
            },
            {
              name: "garlic",
              amount: "4",
              unit: "cloves",
              category: "vegetable",
            },
            { name: "parsley", amount: "1", unit: "bunch", category: "herb" },
          ],
          substitutions: {
            "fresh fish": ["sea bass", "cod", "halibut"],
            "white wine": ["fish stock", "vegetable stock"],
            "cherry tomatoes": ["diced tomatoes", "grape tomatoes"],
          },
          servingSize: 4,
          allergens: ["fish", "sulfites"],
          prepTime: "15 minutes",
          cookTime: "25 minutes",
          culturalNotes:
            'A traditional Neapolitan fisherman\'s dish, where fish is cooked in "crazy water" (acqua pazza) - a fragrant broth of tomatoes, herbs, and wine',
          pairingSuggestions: [
            "Falanghina wine",
            "crusty bread",
            "sautéed greens",
          ],
          dietaryInfo: ["contains fish", "gluten-free", "dairy-free"],
          spiceLevel: "mild",
          nutrition: {
            calories: 320,
            protein: 42,
            carbs: 12,
            fat: 14,
            fiber: 3,
            vitamins: ["D", "B12", "C"],
            minerals: ["Selenium", "Iodine", "Potassium"],
          },
          season: ["summer", "spring"],

          elementalProperties: {
            Fire: 0.05,
            Water: 0.72,
            Earth: 0.15,
            Air: 0.07,
          },
          mealType: ["lunch", "dinner"],
        },
        {
          "recipe_name": "Authentic Melanzane alla Parmigiana",
          "description": "A deeply traditional Southern Italian casserole.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 60,
            "cook_time_minutes": 45,
            "base_serving_size": 6,
            "spice_level": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 1.5,
              "unit": "kg",
              "name": "eggplants",
              "notes": "Fried without breading."
            }
          ],
          "instructions": [
            "Step 1: Salt eggplants.",
            "Step 2: Fry eggplants.",
            "Step 3: Layer with sauce and cheese.",
            "Step 4: Bake and rest."
          ],
          "classifications": {
            "meal_type": [
              "dinner"
            ],
            "cooking_methods": [
              "baking"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.2,
            "earth": 0.5,
            "air": 0.1
          },
          "astrological_affinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Taurus"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 450,
            "protein_g": 18,
            "carbs_g": 22,
            "fat_g": 35,
            "fiber_g": 8,
              "sodium_mg": 528,
              "sugar_g": 14,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
      ],
    },
    dessert: {
      all: [
        {
          "recipe_name": "Authentic Tiramisù",
          "description": "A modernist Italian classic born in Treviso.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 30,
            "cook_time_minutes": 0,
            "base_serving_size": 8,
            "spice_level": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "mascarpone cheese",
              "notes": "Room temp."
            },
            {
              "amount": 300,
              "unit": "g",
              "name": "Savoiardi (Ladyfingers)",
              "notes": "Crisp Italian variety."
            }
          ],
          "instructions": [
            "Step 1: Whisk yolks and sugar.",
            "Step 2: Fold in mascarpone.",
            "Step 3: Dip biscuits in espresso.",
            "Step 4: Layer and chill."
          ],
          "classifications": {
            "meal_type": [
              "dessert"
            ],
            "cooking_methods": [
              "assembling"
            ]
          },
          "elemental_properties": {
            "fire": 0.05,
            "water": 0.4,
            "earth": 0.15,
            "air": 0.4
          },
          "astrological_affinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Libra"
            ],
            "lunar_phases": [
              "Waning Gibbous"
            ]
          },
          "nutrition_per_serving": {
            "calories": 420,
            "protein_g": 8,
            "carbs_g": 38,
            "fat_g": 26,
            "fiber_g": 1,
              "sodium_mg": 104,
              "sugar_g": 21,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
      ],
      summer: [
        {
          "recipe_name": "Authentic Gelato Artigianale (Fior di Latte)",
          "description": "The purest expression of Italian gelato engineering. Unlike American ice cream, true gelato contains less fat (using more milk than cream), utilizes less incorporated air (overrun), and is served at a slightly warmer temperature. The 'Fior di Latte' (flower of milk) flavor relies entirely on a scientifically balanced ratio of sugars to lower the freezing point, creating a dense, elastic texture without eggs or heavy flavorings.",
          "details": {
            "cuisine": "Italian",
            "prep_time_minutes": 15,
            "cook_time_minutes": 30,
            "base_serving_size": 4,
            "spice_level": "None",
            "season": [
              "summer",
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 3,
              "unit": "cups",
              "name": "whole milk",
              "notes": "Must be very high quality. This is the primary fat and flavor source."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "heavy cream",
              "notes": "Used sparingly compared to ice cream to maintain density."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "granulated sugar",
              "notes": "Lowers the freezing point."
            },
            {
              "amount": 50,
              "unit": "g",
              "name": "dextrose or corn syrup",
              "notes": "Crucial. Monosaccharides prevent large ice crystals and provide elasticity (the 'stretch' of good gelato)."
            },
            {
              "amount": 30,
              "unit": "g",
              "name": "skim milk powder",
              "notes": "Absorbs free water, preventing iciness and improving texture."
            },
            {
              "amount": 2,
              "unit": "g",
              "name": "locust bean gum or guar gum (stabilizer)",
              "notes": "Optional, but used in professional gelaterias to stabilize the emulsion."
            },
            {
              "amount": 1,
              "unit": "pinch",
              "name": "sea salt",
              "notes": "Enhances the dairy flavor."
            }
          ],
          "instructions": [
            "Step 1: The Dry Mix. In a bowl, thoroughly whisk together the granulated sugar, dextrose, skim milk powder, salt, and the stabilizer (if using). Dispersing the stabilizer in the sugar prevents clumping.",
            "Step 2: The Liquids. In a medium saucepan, combine the whole milk and heavy cream. Place over medium heat.",
            "Step 3: The Infusion. Slowly whisk the dry mixture into the warming milk/cream. Continue to whisk constantly as the mixture heats.",
            "Step 4: Pasteurization. Bring the mixture to exactly 185°F (85°C). Use a thermometer. Hold it at this temperature for 2 minutes. This alters the milk proteins to trap more water, resulting in a smoother texture.",
            "Step 5: Rapid Cooling. Remove from heat immediately. Pour the base into a bowl and place that bowl inside an ice bath. Stir frequently until it cools to room temperature.",
            "Step 6: The Aging (Maturation). Cover the base tightly and refrigerate for a minimum of 4 hours, preferably 12-24 hours. This allows the milk proteins to fully hydrate and the fats to crystallize.",
            "Step 7: Churning. Pour the aged base into an ice cream/gelato maker. Churn according to the manufacturer's instructions, but pull it out *before* it gets completely stiff. Gelato should have less air whipped into it.",
            "Step 8: Serving. True gelato is served at around 10°F (-12°C), which is warmer than standard freezer temperature (-0°F/-18°C). Let it temper slightly before serving so it is elastic and soft."
          ],
          "classifications": {
            "meal_type": [
              "dessert",
              "sweet",
              "frozen"
            ],
            "cooking_methods": [
              "pasteurizing",
              "churning",
              "freezing"
            ]
          },
          "elemental_properties": {
            "fire": 0.05,
            "water": 0.6,
            "earth": 0.15,
            "air": 0.2
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
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 280,
            "protein_g": 7,
            "carbs_g": 45,
            "fat_g": 10,
            "fiber_g": 0,
            "sodium_mg": 120,
            "sugar_g": 38,
            "vitamins": [
              "Vitamin D",
              "Vitamin A"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "dextrose",
              "substitute_options": [
                "light corn syrup"
              ]
            },
            {
              "original_ingredient": "whole milk",
              "substitute_options": [
                "macadamia nut milk (for vegan gelato, though ratios of fat/sugar must be drastically altered)"
              ]
            }
          ]
        },
      ],
      winter: [
        {
          "recipe_name": "Authentic Panettone",
          "description": "The Everest of Italian baking. True Milanese Panettone is not a cake; it is a highly enriched, naturally leavened (sourdough) bread. It requires a stiff sourdough starter (Lieveto Madre), multiple long fermentations to build an impossibly airy, shreddable gluten structure that can support the weight of butter, egg yolks, and candied fruit, ending with the iconic upside-down cooling hang.",
          "details": {
            "cuisine": "Italian (Milan)",
            "prep_time_minutes": 2880,
            "cook_time_minutes": 55,
            "base_serving_size": 12,
            "spice_level": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 100,
              "unit": "g",
              "name": "active Lieveto Madre (stiff sourdough starter)",
              "notes": "Must be refreshed 3 times the day before baking to remove all acidity."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "strong bread flour (farina panettone)",
              "notes": "Must have extremely high protein (W350+)."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "granulated sugar",
              "notes": "For the dough."
            },
            {
              "amount": 6,
              "unit": "large",
              "name": "egg yolks",
              "notes": "Provides the rich yellow color and tender crumb."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Room temperature, beaten into the dough very slowly."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "water",
              "notes": "Hydration."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "candied orange and citron peel",
              "notes": "High quality, chopped."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "golden raisins",
              "notes": "Soaked in water or rum and drained well."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "vanilla bean paste",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "orange zest",
              "notes": "Aromatic."
            }
          ],
          "instructions": [
            "Step 1: First Dough (Primo Impasto). In a heavy-duty stand mixer, combine the active stiff starter, 2/3 of the flour, the water, and half the sugar. Knead until a dough forms. Slowly add half the egg yolks and half the butter. Knead for 20 minutes until the gluten is highly developed (windowpane test). Let rise at 80°F (26°C) for 12-14 hours until exactly tripled in volume.",
            "Step 2: Second Dough (Secondo Impasto). Deflate the first dough in the mixer. Add the remaining flour and sugar. Knead until smooth. Slowly incorporate the remaining egg yolks, then the remaining butter. This takes patience; the dough must remain elastic.",
            "Step 3: Aromatics and Inclusions. Add the vanilla, orange zest, candied peel, and raisins. Mix on low speed just until evenly distributed. Do not tear the gluten network.",
            "Step 4: Shaping (Pirlatura). Turn the dough onto a buttered surface. Let it rest for 45 mins. Using buttered hands, round the dough tightly, pulling the skin taut beneath it to form a perfect sphere.",
            "Step 5: The Mold. Place the sphere seam-side down into a paper Panettone mold. Cover and let rise at 80°F (26°C) for 6-8 hours, until the dough reaches 1 inch below the rim.",
            "Step 6: The Scarpatura. Let the dough sit uncovered for 15 mins to form a dry skin. Using a razor, cut a shallow cross on the top. Place a pat of cold butter in the center of the cross.",
            "Step 7: Bake. Bake at 320°F (160°C) for 50-55 minutes until the internal temperature reads 200°F (93°C).",
            "Step 8: The Hang. Immediately upon removing from the oven, pierce the base of the Panettone with two long metal skewers. Hang it upside down between two pots or chairs to cool completely (12 hours). If cooled upright, the delicate, butter-heavy structure will collapse."
          ],
          "classifications": {
            "meal_type": [
              "dessert",
              "holiday",
              "baking"
            ],
            "cooking_methods": [
              "fermenting",
              "kneading",
              "baking",
              "hanging"
            ]
          },
          "elemental_properties": {
            "fire": 0.2,
            "water": 0.1,
            "earth": 0.2,
            "air": 0.5
          },
          "astrological_affinities": {
            "planets": [
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Capricorn"
            ],
            "lunar_phases": [
              "Full Moon"
            ]
          },
          "nutrition_per_serving": {
            "calories": 450,
            "protein_g": 8,
            "carbs_g": 65,
            "fat_g": 18,
            "fiber_g": 2,
            "sodium_mg": 150,
            "sugar_g": 35,
            "vitamins": [
              "Vitamin A",
              "Riboflavin"
            ],
            "minerals": [
              "Iron"
            ]
          },
          "substitutions": [
            {
              "original_ingredient": "candied peel",
              "substitute_options": [
                "dark chocolate chunks (for modern variation)"
              ]
            }
          ]
        },
      ],
    },
  },
  motherSauces: {
    marinaraBase: {
      name: "Marinara Base",
      description:
        "Simple tomato sauce that forms the foundation of many Italian dishes",
      base: "tomato",
      thickener: "reduction",
      keyIngredients: ["tomatoes", "garlic", "olive oil", "basil", "oregano"],
      culinaryUses: [
        "pasta sauce",
        "pizza base",
        "dipping sauce",
        "casserole base",
      ],
      derivatives: ["Arrabbiata", "Puttanesca", "Alla Norma"],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Leo"],
      seasonality: "all",
      preparationNotes:
        "Best when made with San Marzano tomatoes for authentic flavor",
      technicalTips: "Simmer gently to maintain brightness of flavor",
      difficulty: "easy",
      storageInstructions:
        "Store in airtight container for up to 5 days in refrigerator",
      yield: "2 cups",
    },
    besciamella: {
      name: "Besciamella",
      description: "Italian white sauce made from roux and milk",
      base: "milk",
      thickener: "roux",
      keyIngredients: ["butter", "flour", "milk", "nutmeg", "bay leaf"],
      culinaryUses: [
        "lasagna layer",
        "cannelloni filling base",
        "vegetable gratin",
        "creamed spinach",
      ],
      derivatives: ["Mornay sauce", "Soubise", "Infused besciamella"],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.4,
        Air: 0.1,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Moon", "Venus", "Cancer"],
      seasonality: "all",
      preparationNotes:
        "For silky texture, add hot milk to roux gradually while whisking constantly",
      technicalTips:
        "Infuse milk with bay leaf, onion, and clove before making sauce for depth of flavor",
      difficulty: "medium",
      storageInstructions:
        "Store refrigerated in airtight container for up to 3 days",
      yield: "2 cups",
    },
  },
  traditionalSauces: {
    marinara: {
      name: "Marinara",
      description: "Simple tomato sauce with garlic, olive oil and herbs",
      base: "tomato",
      keyIngredients: ["tomatoes", "garlic", "olive oil", "basil", "oregano"],
      culinaryUses: [
        "pasta sauce",
        "pizza base",
        "dipping sauce",
        "casserole base",
      ],
      variants: ["Arrabbiata", "Puttanesca", "Alla Norma"],
      elementalProperties: {
        Fire: 0.4,
        Earth: 0.3,
        Water: 0.2,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "leo"],
      seasonality: "all",
      preparationNotes:
        "Best when made with San Marzano tomatoes for authentic flavor",
      technicalTips: "Simmer gently to maintain brightness of flavor",
    },
    pesto: {
      name: "Pesto alla Genovese",
      description:
        "Fresh basil sauce with pine nuts, garlic, Parmesan and olive oil",
      base: "herb",
      keyIngredients: [
        "basil leaves",
        "pine nuts",
        "garlic",
        "Parmigiano-Reggiano",
        "Pecorino",
        "olive oil",
      ],
      culinaryUses: [
        "pasta sauce",
        "sandwich spread",
        "marinade",
        "flavor enhancer",
      ],
      variants: ["Red pesto", "Pesto alla Siciliana", "Pesto alla Trapanese"],
      elementalProperties: {
        Air: 0.4,
        Earth: 0.3,
        Fire: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Venus", "gemini"],
      seasonality: "summer",
      preparationNotes:
        "Traditionally made in a marble mortar with wooden pestle",
      technicalTips: "Blanch basil briefly to preserve color if making ahead",
    },
    carbonara: {
      name: "Carbonara",
      description:
        "Silky sauce of eggs, hard cheese, cured pork and black pepper",
      base: "egg",
      keyIngredients: ["eggs", "Pecorino Romano", "guanciale", "black pepper"],
      culinaryUses: ["pasta sauce", "sauce for gnocchi", "savory custard base"],
      variants: [
        "Carbonara with pancetta",
        "Lighter carbonara with less egg yolks",
        "Vegetarian carbonara",
      ],
      elementalProperties: {
        Earth: 0.4,
        Air: 0.3,
        Fire: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Jupiter", "Mars", "aries"],
      seasonality: "all",
      preparationNotes:
        "Never add cream - authentic carbonara is creamy from eggs alone",
      technicalTips:
        "Temper eggs carefully to prevent scrambling, use pasta water to adjust consistency",
    },
    ragu: {
      name: "Ragù alla Bolognese",
      description: "Rich, slow-cooked meat sauce from Bologna",
      base: "meat",
      keyIngredients: [
        "beef",
        "pork",
        "soffritto",
        "tomato paste",
        "wine",
        "milk",
      ],
      culinaryUses: [
        "pasta sauce",
        "lasagna filling",
        "polenta topping",
        "stuffed pasta filling",
      ],
      variants: [
        "Ragù Napoletano",
        "White ragù",
        "Wild boar ragù",
        "Vegetarian mushroom ragù",
      ],
      elementalProperties: {
        Earth: 0.5,
        Fire: 0.3,
        Water: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Saturn", "Mars", "taurus"],
      seasonality: "autumn, winter",
      preparationNotes:
        "True Bolognese takes hours of gentle simmering for depth of flavor",
      technicalTips:
        "Add milk toward the end of cooking for authentic richness and tenderness",
    },
    bechamel: {
      name: "Besciamella",
      description: "Classic white sauce made from roux and milk",
      base: "dairy",
      keyIngredients: ["butter", "flour", "milk", "nutmeg", "bay leaf"],
      culinaryUses: [
        "lasagna layer",
        "cannelloni filling base",
        "vegetable gratin",
        "creamed spinach",
      ],
      variants: ["Mornay sauce", "Soubise", "Infused besciamella"],
      elementalProperties: {
        Water: 0.4,
        Earth: 0.4,
        Air: 0.1,
        Fire: 0.1,
      },
      astrologicalInfluences: ["Moon", "Venus", "cancer"],
      seasonality: "all",
      preparationNotes:
        "For silky texture, add hot milk to roux gradually while whisking constantly",
      technicalTips:
        "Infuse milk with bay leaf, onion, and clove before making sauce for depth of flavor",
    },
  },
  sauceRecommender: {
    forProtein: {
      beef: [
        "ragù alla Bolognese",
        "sugo di carne",
        "salsa alla pizzaiola",
        "Barolo wine sauce",
      ],
      pork: ["agrodolce", "marsala", "porchetta herbs", "black pepper sauce"],
      chicken: ["cacciatore", "piccata", "marsala", "salt-crusted herbs"],
      fish: ["acqua pazza", "salmoriglio", "livornese", "al limone"],
      vegetarian: ["pesto", "pomodoro", "aglio e olio", "burro e salvia"],
    },
    forVegetable: {
      leafy: ["aglio e olio", "parmigiano", "lemon butter", "anchovy"],
      root: ["besciamella", "gremolata", "herbed butter", "balsamic glaze"],
      nightshades: ["marinara", "alla Norma", "sugo di pomodoro", "caponata"],
      squash: [
        "brown butter sage",
        "gorgonzola cream",
        "agrodolce",
        "walnut pesto",
      ],
      mushroom: [
        "porcini sauce",
        "marsala",
        "truffle oil",
        "white wine garlic",
      ],
    },
    forCookingMethod: {
      grilling: [
        "salmoriglio",
        "rosemary oil",
        "balsamic glaze",
        "salsa verde",
      ],
      baking: ["marinara", "besciamella", "pesto", "ragù"],
      frying: ["aioli", "lemon dip", "arrabiata", "garlic-herb dip"],
      braising: ["osso buco sauce", "wine reduction", "pomodoro", "cacciatora"],
      raw: ["pinzimonio", "olio nuovo", "citronette", "bagna cauda"],
    },
    byAstrological: {
      fire: [
        "arrabiata",
        "puttanesca",
        "aglio e olio with peperoncino",
        "spicy pomodoro",
      ],
      earth: ["mushroom ragu", "tartufo", "carbonara", "ragù alla Bolognese"],
      air: ["lemon sauces", "herb oils", "white wine sauce", "pesto"],
      water: ["seafood sauces", "acqua pazza", "clam sauce", "besciamella"],
    },
    byRegion: {
      northern: [
        "pesto alla Genovese",
        "bagna cauda",
        "fonduta",
        "ragù alla Bolognese",
      ],
      central: ["carbonara", "cacio e pepe", "amatriciana", "sugo finto"],
      southern: ["marinara", "puttanesca", "aglio e olio", "alla Norma"],
      insular: ["sarde a beccafico", "nero di seppia", "bottarga", "caponata"],
    },
    byDietary: {
      vegetarian: ["pomodoro", "pesto", "aglio e olio", "burro e salvia"],
      vegan: ["marinara", "pomodoro", "aglio e olio", "salsa verde"],
      glutenFree: [
        "salsa verde",
        "salmoriglio",
        "sugo di pomodoro",
        "lemon sauce",
      ],
      dairyFree: ["marinara", "aglio e olio", "puttanesca", "arrabbiata"],
    },
  },
  cookingTechniques: [
    {
      name: "Al Dente",
      description: "Cooking pasta until firm to the bite, not soft",
      elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
      toolsRequired: ["large pot", "timer", "colander"],
      bestFor: ["pasta", "risotto rice", "vegetables"],
      difficulty: "easy",
    },
    {
      name: "Soffritto",
      description:
        "Slow-cooking aromatic base of finely chopped vegetables in fat",
      elementalProperties: { Fire: 0.4, Earth: 0.4, Air: 0.1, Water: 0.1 },
      toolsRequired: ["heavy-bottomed pan", "wooden spoon", "sharp knife"],
      bestFor: ["sauce base", "soup base", "risotto", "stews"],
      difficulty: "medium",
    },
    {
      name: "Mantecatura",
      description:
        "Final whisking of cold butter or cheese into hot dishes to create a creamy emulsion",
      elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
      toolsRequired: ["wooden spoon", "grater", "ladle"],
      bestFor: ["risotto", "pasta sauces", "polenta", "gnocchi"],
      difficulty: "hard",
    },
    {
      name: "Sfumato",
      description:
        "Deglazing with wine to lift flavor compounds and create depth",
      elementalProperties: { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
      toolsRequired: ["heavy pan", "wooden spoon"],
      bestFor: ["risotto", "sauces", "braises", "stews"],
      difficulty: "medium",
    },
    {
      name: "Battuto",
      description:
        "Finely chopped raw aromatic ingredients that form the base of many dishes",
      elementalProperties: { Earth: 0.5, Air: 0.3, Water: 0.1, Fire: 0.1 },
      toolsRequired: ["chef's knife", "cutting board", "mezzaluna"],
      bestFor: [
        "sauce preparation",
        "flavor base",
        "soup starters",
        "stuffings",
      ],
      difficulty: "easy",
    },
  ],
  regionalCuisines: {
    sicilian: {
      name: "Sicilian Cuisine",
      description:
        "Bold flavors reflecting diverse cultural influences with emphasis on seafood, citrus, and Arab-influenced sweets",
      signature: ["pasta alla Norma", "arancini", "cannoli", "caponata"],
      elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Sun", "leo"],
      seasonality: "all",
    },
    tuscan: {
      name: "Tuscan Cuisine",
      description:
        "Rustic simplicity focusing on high-quality ingredients with an emphasis on beans, bread, and olive oil",
      signature: [
        "ribollita",
        "panzanella",
        "bistecca alla fiorentina",
        "pappa al pomodoro",
      ],
      elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Saturn", "Jupiter", "capricorn"],
      seasonality: "all",
    },
    emilian: {
      name: "Emilian Cuisine",
      description:
        "Rich, indulgent cuisine from Italy's food valley, known for pasta, cured meats, and aged cheeses",
      signature: [
        "tagliatelle al ragù",
        "tortellini in brodo",
        "lasagne alla bolognese",
        "prosciutto di Parma",
      ],
      elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Jupiter", "Venus", "taurus"],
      seasonality: "all",
    },
    neapolitan: {
      name: "Neapolitan Cuisine",
      description:
        "Vibrant and tomato-forward cuisine with iconic pizza, pasta, and seafood dishes",
      signature: [
        "pizza napoletana",
        "spaghetti alle vongole",
        "pastiera napoletana",
        "ragù napoletano",
      ],
      elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Neptune", "aries"],
      seasonality: "all",
    },
  },
  elementalProperties: {
    Earth: 0.3, // Represents hearty ingredients and grounding dishes
    Water: 0.3, // Represents sauces and moisture,
    Fire: 0.2, // Represents cooking techniques
    Air: 0.2, // Represents herbs and lightness
  },
  astrologicalInfluences: [
    "Venus - Roman goddess of love and beauty influences the sensory pleasures of Italian cuisine",
    "Jupiter - Brings abundance and generosity to communal Italian dining traditions",
    "Mercury - Governs the communication and conviviality central to Italian food culture",
  ],
};

export default italian;
