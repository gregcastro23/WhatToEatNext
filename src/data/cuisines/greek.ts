// src/data/cuisines/greek.ts
import type { Cuisine } from "@/types/cuisine";

export const greek: Cuisine = {
  id: "greek",
  name: "Greek",
  description:
    "Traditional Greek cuisine emphasizing fresh ingredients, olive oil, herbs, and regional specialties from mainland to islands",
  dishes: {
    breakfast: {
      all: [
        {
          "name": "Authentic Greek Bougatsa",
          "description": "A Northern Greek breakfast icon from Thessaloniki. It consists of multiple layers of ultra-thin phyllo pastry wrapping a warm, creamy semolina custard. It is defined by its presentation: cut into small bite-sized squares and heavily dusted with powdered sugar and cinnamon while still hot.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 30,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "package",
              "name": "phyllo dough",
              "notes": "Must be very fresh."
            },
            {
              "amount": 1,
              "unit": "liter",
              "name": "whole milk",
              "notes": "For the custard."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fine semolina",
              "notes": "For the custard."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For the custard."
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Melted, for brushing."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "vanilla extract",
              "notes": "Aromatic."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "powdered sugar",
              "notes": "For heavy dusting."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ground cinnamon",
              "notes": "For heavy dusting."
            }
          ],
          "instructions": [
            "Step 1: The Custard. Whisk semolina, sugar, and milk in a saucepan. Cook over medium heat until thick like porridge. Stir in vanilla and 1 tbsp butter. Let cool slightly.",
            "Step 2: The Wrap. Butter two sheets of phyllo. Place a large spoonful of custard in the center. Fold the phyllo over the custard to create a large rectangular envelope. Wrap this envelope in another 2 buttered sheets of phyllo to ensure strength.",
            "Step 3: Bake. Place seam-side down on a baking sheet. Bake at 375°F (190°C) for 20-25 mins until deeply golden and crisp.",
            "Step 4: Finish. While hot, use a pizza cutter to chop into 1-inch squares. Heavily dust with powdered sugar and cinnamon. Serve immediately."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack"
            ],
            "cookingMethods": [
              "whisking",
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.3,
            "Earth": 0.3,
            "Air": 0.2
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
            "calories": 380,
            "proteinG": 8,
            "carbsG": 48,
            "fatG": 18,
            "fiberG": 1,
            "sodiumMg": 150,
            "sugarG": 22,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "semolina custard",
              "substituteOptions": [
                "savory spiced meat (for savory Bougatsa)",
                "feta cheese"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Yogurt with Honey and Walnuts",
          "description": "The simplest and purest expression of Greek dairy and apiary. It relies entirely on the quality of three raw ingredients. The yogurt must be authentic, full-fat, sheep or goat's milk yogurt (strained/straggisto) to provide a tart, thick, spackle-like base for the floral sweetness of raw thyme honey and the bitter tannin of walnuts.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 5,
            "cookTimeMinutes": 0,
            "baseServingSize": 1,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "cup",
              "name": "authentic Greek strained yogurt",
              "notes": "Full-fat (5-10%). Sheep's milk is traditional and preferred for its slight tang."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "raw Greek honey",
              "notes": "Thyme honey or pine honey is traditional. It should be thick and intensely floral."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "walnuts",
              "notes": "Roughly chopped. Briefly toasted if desired, but raw is common."
            }
          ],
          "instructions": [
            "Step 1: Chill the serving bowl. The yogurt must be served very cold.",
            "Step 2: Spoon the thick, strained yogurt into the bowl. Do not stir or whip it; keep the dense, spackle-like texture intact.",
            "Step 3: Generously drizzle the raw honey over the top. The honey should sit heavily on the surface.",
            "Step 4: Scatter the chopped walnuts over the honey.",
            "Step 5: Serve immediately. The diner should dig through the layers to get a combination of tart, sweet, and crunch in every bite."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "dessert",
              "snack",
              "raw"
            ],
            "cookingMethods": [
              "assembling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.05,
            "Water": 0.4,
            "Earth": 0.4,
            "Air": 0.15
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
            "calories": 350,
            "proteinG": 20,
            "carbsG": 38,
            "fatG": 16,
            "fiberG": 2,
            "sodiumMg": 85,
            "sugarG": 35,
            "vitamins": [
              "Riboflavin",
              "Vitamin B12"
            ],
            "minerals": [
              "Calcium",
              "Phosphorus",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "Greek yogurt",
              "substituteOptions": [
                "coconut or almond milk thick yogurt (vegan)"
              ]
            },
            {
              "originalIngredient": "walnuts",
              "substituteOptions": [
                "pistachios",
                "almonds"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Strapatsada",
          "description": "The quintessential Greek island summer breakfast. It is an alchemical emulsion of ripe, summer tomato water and eggs. The secret is to grate the tomatoes and boil them until their water is almost completely gone, concentrating the lycopene and sweetness before the eggs are added.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 15,
            "baseServingSize": 2,
            "spiceLevel": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "large",
              "name": "vine-ripened tomatoes",
              "notes": "Grated on a box grater, skin discarded."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "Greek feta cheese",
              "notes": "Crumbled."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "dried oregano",
              "notes": "Rigani."
            },
            {
              "amount": 0.5,
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
            "Step 1: The Reduction. Place the grated tomato pulp and olive oil in a skillet over medium-high heat. Simmer for 10-12 minutes, stirring occasionally, until all the watery juice has evaporated and you are left with a thick, fragrant tomato jam.",
            "Step 2: The Eggs. Lower the heat to medium. Pour the beaten eggs into the tomato reduction.",
            "Step 3: The Scramble. Stir continuously for 2-3 minutes. You want the eggs to remain soft and custardy, infused with the red oil of the tomatoes.",
            "Step 4: The Cheese. Just before the eggs are fully set, stir in the crumbled feta and oregano. Cook for 30 more seconds so the cheese softens but doesn't melt completely.",
            "Step 5: Serve hot over toasted country bread with a final drizzle of raw olive oil."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "lunch",
              "vegetarian"
            ],
            "cookingMethods": [
              "simmering",
              "scrambling"
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
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Taurus"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 18,
            "carbsG": 12,
            "fatG": 26,
            "fiberG": 3,
            "sodiumMg": 520,
            "sugarG": 6,
            "vitamins": [
              "Vitamin C",
              "Vitamin A",
              "Lycopene"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "eggs",
              "substituteOptions": [
                "tofu scramble (vegan)"
              ]
            }
          ]
        },
      ],
      summer: [
        {
          "name": "Authentic Paximadia (Greek Barley Rusks)",
          "description": "An ancient Greek survival bread. These twice-baked barley rusks are intensely hard and dehydrated, designed to last for months. The alchemy lies in the fermentation of barley and whole wheat, followed by a slow drying process that creates a rigid, crystalline starch structure that must be briefly rehydrated in water or tomato juice to be eaten.",
          "details": {
            "cuisine": "Greek (Crete)",
            "prepTimeMinutes": 180,
            "cookTimeMinutes": 120,
            "baseServingSize": 12,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "barley flour",
              "notes": "Must be high-quality whole grain barley."
            },
            {
              "amount": 500,
              "unit": "g",
              "name": "whole wheat flour",
              "notes": "For structural strength."
            },
            {
              "amount": 2,
              "unit": "tsp",
              "name": "active dry yeast",
              "notes": "Leavening."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Flavor."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Shortens the gluten for a crumbly interior."
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "lukewarm water",
              "notes": "Hydration."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "anise seeds",
              "notes": "Optional aromatic."
            }
          ],
          "instructions": [
            "Step 1: The Dough. Mix yeast in warm water. Combine flours and salt. Add olive oil and water. Knead for 10 minutes until a very stiff, dense dough forms.",
            "Step 2: First Rise. Let rise in a warm place for 2 hours. It will not double in size due to the heavy barley.",
            "Step 3: Shaping. Shape into thick, elongated loaves (like a large biscotti log). Score the top deeply with a knife into 1-inch thick slices, but do not cut all the way through.",
            "Step 4: First Bake. Bake at 375°F (190°C) for 1 hour until hard.",
            "Step 5: The Slicing. Remove from oven. While still warm, cut all the way through the pre-scored slices.",
            "Step 6: The Second Bake (Paximadi). Lower oven to 250°F (120°C). Lay the slices flat on the oven rack. Bake for 2-3 hours until they are completely dehydrated and rock hard. Let cool completely in the oven.",
            "Step 7: To serve, briefly dip in water or top with grated tomato and feta (Dakos)."
          ],
          "classifications": {
            "mealType": [
              "breakfast",
              "snack"
            ],
            "cookingMethods": [
              "kneading",
              "baking",
              "dehydrating"
            ]
          },
          "elementalProperties": {
            "Fire": 0.25,
            "Water": 0.05,
            "Earth": 0.6,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Saturn",
              "Earth"
            ],
            "signs": [
              "Capricorn",
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 280,
            "proteinG": 8,
            "carbsG": 52,
            "fatG": 8,
            "fiberG": 12,
            "sodiumMg": 320,
            "sugarG": 1,
            "vitamins": [
              "B Vitamins"
            ],
            "minerals": [
              "Iron",
              "Magnesium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "barley flour",
              "substituteOptions": [
                "rye flour"
              ]
            }
          ]
        },
      ],
    },
    lunch: {
      all: [
        {
          "name": "Authentic Greek Souvlaki (Pork Skewers)",
          "description": "The quintessential Greek street food. Success relies on selecting a cut of pork with sufficient intramuscular fat (neck or shoulder) and marinating it heavily in an acidic, herbaceous lemon-oregano bath to tenderize the meat before subjecting it to aggressive, high-heat charcoal grilling.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 120,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "summer",
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 800,
              "unit": "g",
              "name": "pork neck or shoulder (butt)",
              "notes": "Cut into uniform 1-inch cubes. Do not use lean pork tenderloin or loin; they will dry out."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "For the marinade."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "For the marinade. The acid tenderizes the meat."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced or pressed."
            },
            {
              "amount": 1.5,
              "unit": "tbsp",
              "name": "dried Greek oregano (rigani)",
              "notes": "Must be dried, not fresh."
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
            },
            {
              "amount": 8,
              "unit": "whole",
              "name": "wooden skewers",
              "notes": "Soaked in water for 30 minutes to prevent burning."
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "Greek pita bread",
              "notes": "Thick and pocketless, grilled with olive oil."
            }
          ],
          "instructions": [
            "Step 1: The Marinade. In a large bowl, whisk together the olive oil, lemon juice, minced garlic, oregano, salt, and pepper.",
            "Step 2: Marinate the meat. Add the pork cubes to the bowl and toss thoroughly with your hands, massaging the liquid into the meat. Cover and refrigerate for at least 2 hours (up to 12 hours max; beyond that, the lemon juice turns the meat mushy).",
            "Step 3: Skewer. Thread the pork cubes tightly onto the soaked wooden skewers, leaving about an inch bare at the bottom for handling.",
            "Step 4: Heat the grill. Prepare a charcoal grill for high, direct heat (or use a heavy cast-iron grill pan).",
            "Step 5: Grill the Souvlaki. Place the skewers directly over the high heat. Grill for 10-12 minutes, turning every 2-3 minutes, until all sides are deeply browned, slightly charred on the edges, and the pork is cooked through.",
            "Step 6: Grill the pita. Lightly brush the pita breads with olive oil and grill them for 1 minute per side until warm and pliable.",
            "Step 7: Serve immediately. Traditionally served either on the stick with a squeeze of fresh lemon, or wrapped inside the grilled pita with tzatziki, tomatoes, red onions, and french fries."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner",
              "street food",
              "bbq"
            ],
            "cookingMethods": [
              "marinating",
              "grilling"
            ]
          },
          "elementalProperties": {
            "Fire": 0.5,
            "Water": 0.1,
            "Earth": 0.2,
            "Air": 0.2
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
            "calories": 480,
            "proteinG": 35,
            "carbsG": 28,
            "fatG": 26,
            "fiberG": 2,
            "sodiumMg": 650,
            "sugarG": 3,
            "vitamins": [
              "Vitamin C",
              "Niacin"
            ],
            "minerals": [
              "Iron",
              "Zinc"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "pork neck",
              "substituteOptions": [
                "chicken thighs (for Souvlaki Kotopoulo)",
                "lamb shoulder",
                "firm tofu chunks (vegan)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Horiatiki (Greek Village Salad)",
          "description": "The quintessential Greek summer salad. 'Horiatiki' means 'village style'. It is defined by what it lacks: there is absolutely no lettuce. It is a crude, rustic amalgamation of sun-ripened tomatoes, crisp cucumbers, and pungent onions, crowned with a massive, unbroken slab of feta and drowned in robust extra virgin olive oil.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 0,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "large",
              "name": "vine-ripened tomatoes",
              "notes": "Core removed, cut into large, irregular wedges."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "cucumber",
              "notes": "Partially peeled (striped), cut into thick half-moons."
            },
            {
              "amount": 1,
              "unit": "medium",
              "name": "red onion",
              "notes": "Very thinly sliced into rings."
            },
            {
              "amount": 1,
              "unit": "small",
              "name": "green bell pepper",
              "notes": "Cored and sliced into rings."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "Kalamata olives",
              "notes": "Whole, unpitted (traditional, prevents them from becoming mushy)."
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "Greek feta cheese",
              "notes": "Served as one or two large rectangular slabs laid on top, NEVER crumbled."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dried Greek oregano (rigani)",
              "notes": "Must be dried on the branch, rubbed between palms to release oils."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality, robust. Poured generously over the top."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "A very light splash; the tomato juices provide the primary acid."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "sea salt",
              "notes": "Added to the vegetables, but not the feta."
            }
          ],
          "instructions": [
            "Step 1: The Base. In a large, shallow bowl, combine the tomato wedges, cucumber half-moons, green pepper rings, and red onion rings.",
            "Step 2: Season the vegetables. Sprinkle the sea salt over the vegetables. Toss them gently with your hands. Let them sit for 5 minutes so the salt draws out the tomato juices, creating the 'zoumi' (the highly prized liquid at the bottom of the bowl).",
            "Step 3: Add olives. Scatter the whole Kalamata olives over the salad.",
            "Step 4: The Dressing. Drizzle the red wine vinegar over the vegetables.",
            "Step 5: The Crown. Place the large, unbroken slab(s) of feta cheese directly on top of the salad.",
            "Step 6: The Emulsion. Pour the extra virgin olive oil generously over everything, ensuring the feta is coated.",
            "Step 7: The Finish. Rub the dried oregano between your palms directly over the salad, letting it fall heavily on the feta and oil.",
            "Step 8: Serve immediately. Do not toss before serving. It must be served with thick slices of crusty country bread to mop up the oil and tomato juices (papara)."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "salad",
              "appetizer",
              "vegetarian"
            ],
            "cookingMethods": [
              "assembling"
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
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 320,
            "proteinG": 8,
            "carbsG": 12,
            "fatG": 28,
            "fiberG": 4,
            "sodiumMg": 750,
            "sugarG": 6,
            "vitamins": [
              "Vitamin C",
              "Vitamin K"
            ],
            "minerals": [
              "Calcium",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "feta cheese",
              "substituteOptions": [
                "firm tofu marinated in olive oil, lemon, and oregano (vegan)"
              ]
            },
            {
              "originalIngredient": "Kalamata olives",
              "substituteOptions": [
                "Throubes (wrinkled black olives)",
                "green olives"
              ]
            }
          ]
        },
      ],
      summer: [
        {
          "name": "Authentic Greek Gemista",
          "description": "The art of summer vegetable stuffing. Firm tomatoes and bell peppers are hollowed out, their flesh pureed and combined with short-grain rice and an abundance of fresh herbs. They are then baked slowly until the rice absorbs the vegetable juices and the shells collapse into sweet, caramelized submission.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 75,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 6,
              "unit": "large",
              "name": "firm beefsteak tomatoes",
              "notes": "Tops sliced off (reserved), flesh scooped out and reserved."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "bell peppers",
              "notes": "Tops sliced off (reserved), seeds removed."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "short-grain rice (Carolina or Arborio)",
              "notes": "Rinsed well."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Divided use. High quality is essential."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely minced."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh mint",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "For depth."
            },
            {
              "amount": 1.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            },
            {
              "amount": 2,
              "unit": "medium",
              "name": "potatoes",
              "notes": "Peeled and cut into thick wedges, to fill the gaps in the baking pan."
            }
          ],
          "instructions": [
            "Step 1: Hollow the vegetables. Cut the tops off the tomatoes and peppers. Set the caps aside. Use a spoon to carefully hollow out the tomatoes. Place the tomato flesh in a blender and puree it.",
            "Step 2: Prepare the base. Arrange the empty tomatoes and peppers in a large, deep baking dish. Fill any large empty spaces between them with the potato wedges.",
            "Step 3: The Filling. In a large skillet, heat half the olive oil over medium heat. Sauté the onions and garlic until soft. Add the rinsed rice and toast for 1 minute.",
            "Step 4: Incorporate the liquids. Pour half of the reserved tomato puree into the skillet. Add the tomato paste, parsley, mint, salt, and pepper. Simmer for 5 minutes until the liquid is slightly absorbed. The rice will only be partially cooked.",
            "Step 5: Stuff. Spoon the rice mixture loosely into the hollowed vegetables, filling them only 3/4 of the way to the top (the rice will expand significantly). Place the reserved caps back on top.",
            "Step 6: The Bath. Pour the remaining tomato puree and the remaining olive oil over the top of all the vegetables and the potatoes. Add 1/2 cup of water to the bottom of the pan.",
            "Step 7: Bake. Preheat oven to 375°F (190°C). Cover the pan tightly with aluminum foil. Bake for 45 minutes.",
            "Step 8: Caramelize. Remove the foil and bake for another 30 minutes. The vegetables should look wrinkled, slightly charred on the edges, and the potatoes should be tender and golden.",
            "Step 9: Rest. Let them rest at room temperature for at least 30 minutes before serving. They are often eaten lukewarm or cold."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "lunch",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "hollowing",
              "simmering",
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.4,
            "Earth": 0.3,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Sun",
              "Venus"
            ],
            "signs": [
              "Leo",
              "Cancer"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 6,
            "carbsG": 48,
            "fatG": 16,
            "fiberG": 8,
            "sodiumMg": 620,
            "sugarG": 10,
            "vitamins": [
              "Vitamin C",
              "Vitamin A",
              "Potassium"
            ],
            "minerals": [
              "Iron",
              "Manganese"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "short-grain rice",
              "substituteOptions": [
                "quinoa",
                "bulgur wheat"
              ]
            },
            {
              "originalIngredient": "potatoes",
              "substituteOptions": [
                "zucchini wedges"
              ]
            }
          ]
        },
      ],
    },
    dinner: {
      all: [
        {
          "name": "Authentic Greek Moussaka",
          "description": "A structurally complex casserole relying on precise layering and moisture control.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 60,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 3,
              "unit": "large",
              "name": "eggplants",
              "notes": "Salted and dried."
            }
          ],
          "instructions": [
            "Step 1: Fry vegetables.",
            "Step 2: Make meat sauce.",
            "Step 3: Make béchamel.",
            "Step 4: Layer and bake.",
            "Step 5: Rest before cutting."
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
            "Fire": 0.2,
            "Water": 0.2,
            "Earth": 0.45,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Jupiter"
            ],
            "signs": [
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 650,
            "proteinG": 32,
            "carbsG": 35,
            "fatG": 42,
            "fiberG": 6,
              "sodiumMg": 269,
              "sugarG": 10,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "name": "Authentic Spanakopita",
          "description": "An ancient, herbaceous pie balancing wild greens and feta.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 60,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "spring"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "kg",
              "name": "spinach",
              "notes": "Massaged to remove water."
            }
          ],
          "instructions": [
            "Step 1: Massage spinach.",
            "Step 2: Mix filling.",
            "Step 3: Layer phyllo with butter/oil.",
            "Step 4: Bake until crispy."
          ],
          "classifications": {
            "mealType": [
              "lunch"
            ],
            "cookingMethods": [
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.2,
            "Earth": 0.35,
            "Air": 0.25
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus"
            ],
            "signs": [
              "Taurus"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 14,
            "carbsG": 28,
            "fatG": 26,
            "fiberG": 4,
              "sodiumMg": 363,
              "sugarG": 13,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "name": "Authentic Greek Pastitsio",
          "description": "The majestic cousin of Moussaka. A highly architectural baked pasta dish featuring three distinct layers: a thick base of tubular pasta bound with egg and cheese, a fiercely spiced, cinnamon-heavy meat ragù, and a towering, cloud-like crown of nutmeg-scented béchamel sauce.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 60,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "Pastitsio pasta (Misko No. 2) or Ziti",
              "notes": "Long, thick, tubular pasta. Do not use penne if you want the authentic structural cut."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten. Used to bind the pasta layer."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "Kefalotyri or Parmesan cheese",
              "notes": "Grated. Divided across all layers."
            },
            {
              "amount": 750,
              "unit": "g",
              "name": "ground beef or lamb",
              "notes": "For the meat sauce."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely diced."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "dry red wine",
              "notes": "For deglazing."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "For the sauce."
            },
            {
              "amount": 1,
              "unit": "stick",
              "name": "cinnamon",
              "notes": "Essential."
            },
            {
              "amount": 0.25,
              "unit": "tsp",
              "name": "ground cloves",
              "notes": "Essential aromatic warmth."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "For the béchamel."
            },
            {
              "amount": 100,
              "unit": "g",
              "name": "all-purpose flour",
              "notes": "For the béchamel."
            },
            {
              "amount": 1,
              "unit": "liter",
              "name": "whole milk",
              "notes": "Warm, for the béchamel."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "egg yolks",
              "notes": "To enrich the béchamel."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "freshly grated nutmeg",
              "notes": "For the béchamel."
            }
          ],
          "instructions": [
            "Step 1: The Meat Sauce. Brown the meat, onions, and garlic in olive oil. Deglaze with red wine. Add tomatoes, cinnamon stick, cloves, salt, and pepper. Simmer for 45 minutes until very thick and dry. Remove cinnamon stick.",
            "Step 2: The Pasta. Boil the pasta in salted water until just al dente. Drain well. Return to the pot and quickly toss with 2 lightly beaten eggs, 1/3 cup of the grated cheese, and a knob of butter. This binds the base layer so it slices cleanly.",
            "Step 3: The Béchamel. Melt butter, whisk in flour, cook 2 mins. Slowly whisk in warm milk until thick. Remove from heat. Whisk in nutmeg, salt, 1/3 cup cheese, and rapidly whisk in the 2 egg yolks.",
            "Step 4: Assemble Layer 1. Preheat oven to 350°F (175°C). Butter a deep 9x13-inch baking dish. Lay the dressed pasta in the bottom, arranging the tubes so they all point in the same direction (for aesthetic slicing).",
            "Step 5: Assemble Layer 2. Spread the thick meat sauce evenly over the pasta.",
            "Step 6: Assemble Layer 3. Pour the thick béchamel over the meat, spreading it to the edges. Sprinkle the remaining 1/3 cup of cheese over the top.",
            "Step 7: Bake. Bake for 45-60 minutes until the top is puffed and deeply golden brown.",
            "Step 8: Rest. Crucial step. The Pastitsio MUST rest at room temperature for at least 45 minutes before slicing, or the layers will slide apart."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "casserole"
            ],
            "cookingMethods": [
              "simmering",
              "boiling",
              "whisking",
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
            "calories": 720,
            "proteinG": 38,
            "carbsG": 58,
            "fatG": 36,
            "fiberG": 4,
            "sodiumMg": 820,
            "sugarG": 9,
            "vitamins": [
              "Vitamin A",
              "Riboflavin"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "ground beef",
              "substituteOptions": [
                "lentil and walnut ragù (vegetarian)"
              ]
            },
            {
              "originalIngredient": "Kefalotyri cheese",
              "substituteOptions": [
                "Parmigiano-Reggiano",
                "Pecorino Romano"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Dolmades",
          "description": "An ancient Mediterranean art form of encasing a heavily herbed, pine-nut and currant-studded rice filling within slightly bitter, brined grape leaves. The bundles are then tightly packed and steamed in an olive oil and lemon emulsion, creating tender, self-contained flavor capsules.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 45,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "spring",
              "summer"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "jar (about 60 leaves)",
              "name": "grape leaves in brine",
              "notes": "Carefully unrolled, rinsed, and stems snipped off."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "short-grain rice (e.g., Arborio or Carolina)",
              "notes": "Rinsed well."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Divided; half for the filling, half for the cooking liquid."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely minced."
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "fresh dill",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.5,
              "unit": "bunch",
              "name": "fresh mint",
              "notes": "Finely chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "pine nuts",
              "notes": "Lightly toasted."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "dried currants",
              "notes": "For a subtle sweetness."
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
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "Crucial for the cooking broth."
            },
            {
              "amount": 1.5,
              "unit": "cups",
              "name": "hot water or vegetable broth",
              "notes": "For steaming."
            }
          ],
          "instructions": [
            "Step 1: Prep the leaves. Bring a large pot of water to a boil. Blanch the rinsed grape leaves in batches for 2 minutes to soften them further. Drain and set aside.",
            "Step 2: The Filling. In a skillet, heat 1/4 cup of olive oil. Sauté the minced onions until soft. Remove from heat. Stir in the raw rinsed rice, dill, mint, pine nuts, currants, salt, and pepper. Mix thoroughly.",
            "Step 3: Rolling. Lay a grape leaf flat on a cutting board, shiny side down, vein side up. Place 1 heaping teaspoon of the rice mixture near the stem end. Fold the bottom two lobes up over the filling. Fold the sides inward tightly. Roll tightly toward the tip of the leaf, like a small cigar. Repeat until filling is gone.",
            "Step 4: The Base. Line the bottom of a wide, heavy pot or Dutch oven with any torn or unused grape leaves. This prevents the dolmades from burning.",
            "Step 5: Pack the pot. Arrange the rolled dolmades seam-side down in the pot, packing them very tightly together in concentric circles. Create a second layer if necessary.",
            "Step 6: The Emulsion. Pour the remaining 1/4 cup olive oil, the lemon juice, and the hot water over the dolmades. The liquid should just barely cover the top layer.",
            "Step 7: The Weight. Place an inverted, heat-proof dinner plate directly on top of the dolmades to weigh them down and prevent them from unrolling during cooking.",
            "Step 8: Cook. Bring the liquid to a gentle simmer over medium heat. Reduce heat to low, cover the pot, and simmer for 40-45 minutes until the rice is completely tender and has absorbed the liquid.",
            "Step 9: Cool. Remove from heat and let them cool completely in the pot. Dolmades are traditionally served at room temperature or chilled."
          ],
          "classifications": {
            "mealType": [
              "appetizer",
              "meze",
              "vegan"
            ],
            "cookingMethods": [
              "blanching",
              "rolling",
              "steaming"
            ]
          },
          "elementalProperties": {
            "Fire": 0.1,
            "Water": 0.3,
            "Earth": 0.4,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Earth",
              "Venus"
            ],
            "signs": [
              "Virgo",
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 280,
            "proteinG": 4,
            "carbsG": 32,
            "fatG": 16,
            "fiberG": 5,
            "sodiumMg": 580,
            "sugarG": 6,
            "vitamins": [
              "Vitamin A",
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Manganese",
              "Iron"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "grape leaves",
              "substituteOptions": [
                "blanched cabbage leaves",
                "Swiss chard leaves"
              ]
            },
            {
              "originalIngredient": "pine nuts and currants",
              "substituteOptions": [
                "ground lamb or beef (for a meat version, omit currants)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Galaktoboureko",
          "description": "A masterpiece of Hellenic pastry alchemy.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 30,
            "cookTimeMinutes": 50,
            "baseServingSize": 12,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "package",
              "name": "phyllo dough",
              "notes": "Thawed."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "fine semolina flour",
              "notes": "For custard base."
            }
          ],
          "instructions": [
            "Step 1: Prepare and cool syrup.",
            "Step 2: Make semolina custard.",
            "Step 3: Layer phyllo.",
            "Step 4: Bake.",
            "Step 5: Pour cold syrup over hot pastry."
          ],
          "classifications": {
            "mealType": [
              "dessert"
            ],
            "cookingMethods": [
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.25,
            "Water": 0.3,
            "Earth": 0.3,
            "Air": 0.15
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
            "calories": 480,
            "proteinG": 9,
            "carbsG": 65,
            "fatG": 22,
            "fiberG": 1,
              "sodiumMg": 111,
              "sugarG": 24,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "name": "Authentic Fasolada",
          "description": "Considered the national dish of Greece.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 120,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "white beans",
              "notes": "Soaked."
            }
          ],
          "instructions": [
            "Step 1: Boil beans.",
            "Step 2: Simmer with vegetables.",
            "Step 3: Emulsify with olive oil at the end."
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
            "Fire": 0.1,
            "Water": 0.4,
            "Earth": 0.45,
            "Air": 0.05
          },
          "astrologicalAffinities": {
            "planets": [
              "Earth"
            ],
            "signs": [
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Crescent"
            ]
          },
          "nutritionPerServing": {
            "calories": 410,
            "proteinG": 14,
            "carbsG": 45,
            "fatG": 20,
            "fiberG": 12,
              "sodiumMg": 391,
              "sugarG": 8,
              "vitamins": ["Vitamin C","Vitamin A"],
              "minerals": ["Iron","Calcium"]
        },
          "substitutions": []
        },
        {
          "name": "Authentic Greek Youvetsi",
          "description": "A profound, slow-baked, one-pot Sunday staple. It involves braising bone-in meat (usually beef or lamb) in a spiced tomato sauce until meltingly tender, then adding kritharaki (orzo) directly into the boiling meat juices in the oven. The pasta absorbs all the fat and liquid, swelling into a dense, savory, almost risotto-like mass.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 150,
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
              "unit": "kg",
              "name": "beef chuck or lamb shoulder",
              "notes": "Cut into large 2-inch chunks, bone-in preferred for depth of flavor."
            },
            {
              "amount": 0.33,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "For searing the meat and sautéing aromatics."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "yellow onion",
              "notes": "Finely chopped."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "dry red wine",
              "notes": "For deglazing."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "Fresh or canned."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "For concentrated flavor."
            },
            {
              "amount": 1,
              "unit": "stick",
              "name": "cinnamon",
              "notes": "The defining aromatic profile of the dish."
            },
            {
              "amount": 3,
              "unit": "whole",
              "name": "allspice berries",
              "notes": "Or 1/4 tsp ground allspice."
            },
            {
              "amount": 4,
              "unit": "cups",
              "name": "beef or vegetable broth",
              "notes": "Kept hot. Needed to cook the pasta."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "kritharaki (Greek orzo pasta)",
              "notes": "Toasted briefly in butter or oil before baking."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "Kefalotyri or Mizithra cheese",
              "notes": "Hard, salty sheep's milk cheese, grated heavily over the top."
            }
          ],
          "instructions": [
            "Step 1: Sear the meat. In a heavy oven-safe pot or Dutch oven, heat the olive oil over high heat. Brown the meat chunks aggressively on all sides. Remove meat and set aside.",
            "Step 2: Sauté Aromatics. Reduce heat to medium. Add the chopped onions to the fat and sauté until soft (5 mins). Add the garlic and tomato paste, cooking for 1 minute until the paste darkens.",
            "Step 3: Deglaze. Pour in the red wine and scrape up all the browned bits from the bottom. Let the alcohol boil off.",
            "Step 4: The Braise. Return the meat to the pot. Add the crushed tomatoes, cinnamon stick, allspice, salt, pepper, and 1 cup of the broth. Bring to a boil, cover, and reduce heat to low. Simmer on the stove for 1.5 to 2 hours until the meat is very tender.",
            "Step 5: Toast the pasta (Optional but recommended). In a separate dry skillet, toast the dry orzo for 2-3 minutes until slightly golden. This prevents it from turning to mush when baked.",
            "Step 6: Assemble for baking. Preheat oven to 375°F (190°C). Remove the pot from the stove. Pour the remaining 3 cups of hot broth into the pot with the meat. Stir in the toasted orzo.",
            "Step 7: The Bake. Place the uncovered pot into the oven. Bake for 25-30 minutes. Stir it gently exactly once halfway through to prevent the pasta from sticking to the bottom. It is done when the orzo is tender and has absorbed most of the liquid (it should still be slightly saucy, not completely dry).",
            "Step 8: The Finish. Remove from the oven and immediately cover it with a towel for 10 minutes. The pasta will continue to absorb liquid. Serve hot, buried under a mountain of grated Kefalotyri cheese."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "casserole"
            ],
            "cookingMethods": [
              "searing",
              "braising",
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.25,
            "Earth": 0.45,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Jupiter",
              "Saturn"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 680,
            "proteinG": 42,
            "carbsG": 55,
            "fatG": 32,
            "fiberG": 5,
            "sodiumMg": 950,
            "sugarG": 8,
            "vitamins": [
              "Vitamin A",
              "Vitamin B12"
            ],
            "minerals": [
              "Iron",
              "Zinc",
              "Calcium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "beef chuck",
              "substituteOptions": [
                "lamb shoulder",
                "whole chicken legs (requires less braising time)"
              ]
            },
            {
              "originalIngredient": "Kefalotyri cheese",
              "substituteOptions": [
                "Pecorino Romano",
                "Parmigiano-Reggiano"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Revithia (Chickpea Stew)",
          "description": "A humble, slow-cooked agrarian stew primarily consumed on the island of Sifnos. It relies on the prolonged baking of soaked chickpeas in a clay pot (skepastaria) with massive quantities of onions and olive oil, resulting in a sweet, starchy, golden emulsion.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 240,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "winter"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "dried chickpeas",
              "notes": "Must be dried. Soaked overnight with baking soda."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "baking soda",
              "notes": "Added to the soaking water to soften the skins."
            },
            {
              "amount": 4,
              "unit": "large",
              "name": "yellow onions",
              "notes": "Finely chopped. The volume of onions creates the sweet, thick base."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality. Do not reduce the amount; it emulsifies the stew."
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "bay leaves",
              "notes": "Dried."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh lemon juice",
              "notes": "Stirred in at the very end to cut the richness."
            }
          ],
          "instructions": [
            "Step 1: The Soak. Place the chickpeas in a large bowl. Dissolve the baking soda in cold water and cover the chickpeas by 3 inches. Soak for 12-24 hours. Drain and rub the chickpeas vigorously in a towel to remove as many loose skins as possible. Rinse thoroughly.",
            "Step 2: Preheat oven. Preheat oven to 300°F (150°C). Use a heavy Dutch oven or a traditional clay pot with a lid.",
            "Step 3: Assemble. Place the drained chickpeas, chopped onions, bay leaves, salt, and pepper into the pot.",
            "Step 4: The Liquids. Pour the olive oil over the chickpeas. Add enough cold water to just cover the chickpeas by about 1 inch.",
            "Step 5: Seal the pot. Cover the pot tightly with the lid. Traditionally, a flour-water paste is used to seal the lid to the pot to prevent any steam from escaping.",
            "Step 6: The Long Bake. Bake undisturbed for 4 to 5 hours. Check once at the 3-hour mark to ensure they haven't dried out (add boiling water if necessary).",
            "Step 7: The Finish. The stew is done when the chickpeas melt on your tongue and the liquid has reduced to a thick, golden, oily gravy. Remove from the oven.",
            "Step 8: Emulsify. Stir vigorously with a wooden spoon for 1 minute; this mashes some of the chickpeas and emulsifies the oil with the starches.",
            "Step 9: Add the lemon juice off the heat. Serve hot with rustic bread and olives."
          ],
          "classifications": {
            "mealType": [
              "soup",
              "stew",
              "vegan",
              "dinner"
            ],
            "cookingMethods": [
              "soaking",
              "baking",
              "emulsifying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.15,
            "Water": 0.35,
            "Earth": 0.45,
            "Air": 0.05
          },
          "astrologicalAffinities": {
            "planets": [
              "Earth",
              "Saturn"
            ],
            "signs": [
              "Capricorn",
              "Taurus"
            ],
            "lunarPhases": [
              "New Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 480,
            "proteinG": 14,
            "carbsG": 45,
            "fatG": 28,
            "fiberG": 12,
            "sodiumMg": 550,
            "sugarG": 6,
            "vitamins": [
              "Folate",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Manganese",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "dried chickpeas",
              "substituteOptions": [
                "no direct substitute for this specific textural breakdown"
              ]
            },
            {
              "originalIngredient": "yellow onions",
              "substituteOptions": [
                "white onions"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Gigantes Plaki",
          "description": "A slow-baked, magnificent agrarian dish utilizing giant white beans (Gigantes or Corona). The beans are first boiled until tender, then transferred to a pan and baked slowly in a rich, olive-oil-heavy tomato and herb sauce until the sauce caramelizes and the top layer of beans becomes crusty and slightly charred.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 720,
            "cookTimeMinutes": 180,
            "baseServingSize": 6,
            "spiceLevel": "None",
            "season": [
              "winter",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "dried Gigantes beans or large Lima/Corona beans",
              "notes": "Must be soaked overnight."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Divided use. High quality."
            },
            {
              "amount": 2,
              "unit": "large",
              "name": "red onions",
              "notes": "Thinly sliced."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 400,
              "unit": "g",
              "name": "crushed tomatoes",
              "notes": "Canned or fresh."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "tomato paste",
              "notes": "For depth."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Roughly chopped."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh dill",
              "notes": "Roughly chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "honey or sugar",
              "notes": "To balance the acidity of the tomatoes."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "Added late."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            }
          ],
          "instructions": [
            "Step 1: Soak. Soak the dried beans in plenty of cold water overnight (12-24 hours). Drain and rinse.",
            "Step 2: Boil. Place the beans in a large pot, cover with fresh water by 2 inches. Bring to a boil, skim the foam, reduce heat, and simmer until they are just tender but still hold their shape completely (about 45-60 mins). Drain, reserving 1 cup of the cooking water.",
            "Step 3: The Sauce. In a skillet, heat half the olive oil over medium heat. Sauté the sliced onions until deeply softened and golden (10 mins). Add the garlic and tomato paste, cooking for 1 minute.",
            "Step 4: Combine. Add the crushed tomatoes, honey, parsley, dill, salt, and pepper to the skillet. Simmer for 5 minutes.",
            "Step 5: Assemble for baking. Preheat oven to 375°F (190°C). Transfer the boiled beans to a 9x13-inch baking dish. Pour the tomato/onion sauce evenly over the beans. Add the reserved 1 cup of bean cooking water. Drizzle the remaining 1/4 cup of olive oil over the top.",
            "Step 6: Bake (Plaki). Bake uncovered for 1 hour to 1 hour and 15 minutes. The liquid should reduce to a thick, oily glaze, and the beans on the top layer should develop a darkened, crusty exterior. Do not stir them while baking.",
            "Step 7: Serve warm or at room temperature. It is essential to serve with crusty bread to mop up the seasoned olive oil."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "lunch",
              "vegan",
              "vegetarian"
            ],
            "cookingMethods": [
              "boiling",
              "baking",
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
              "Earth",
              "Saturn"
            ],
            "signs": [
              "Taurus",
              "Capricorn"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 420,
            "proteinG": 18,
            "carbsG": 52,
            "fatG": 18,
            "fiberG": 14,
            "sodiumMg": 480,
            "sugarG": 9,
            "vitamins": [
              "Folate",
              "Vitamin C"
            ],
            "minerals": [
              "Iron",
              "Magnesium",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "Gigantes beans",
              "substituteOptions": [
                "butter beans",
                "large lima beans"
              ]
            },
            {
              "originalIngredient": "honey",
              "substituteOptions": [
                "maple syrup (vegan)",
                "granulated sugar"
              ]
            }
          ]
        },
        {
          "name": "Authentic Keftedes (Greek Meatballs)",
          "description": "Crispy, intensely aromatic Greek meatballs. The alchemy lies in the heavy hydration of the meat with grated onions and soaked bread (panade), combined with an aggressive amount of fresh mint and oregano. They are pan-fried in olive oil to create a deeply crusted, rigid exterior that shatters to reveal a light, steaming interior.",
          "details": {
            "cuisine": "Greek",
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
              "amount": 500,
              "unit": "g",
              "name": "ground beef or a mix of beef and pork",
              "notes": "At least 20% fat."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "red onion",
              "notes": "Grated on the large holes of a box grater. Retain all the juices."
            },
            {
              "amount": 2,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced."
            },
            {
              "amount": 2,
              "unit": "slices",
              "name": "stale white bread",
              "notes": "Crusts removed, soaked in water and squeezed completely dry."
            },
            {
              "amount": 1,
              "unit": "large",
              "name": "egg",
              "notes": "Lightly beaten."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "fresh mint",
              "notes": "Finely chopped. The dominant flavor profile."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh parsley",
              "notes": "Finely chopped."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "dried oregano",
              "notes": "Greek rigani."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "Tenderizes the meat."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "olive oil",
              "notes": "Added directly into the meat mixture for moisture."
            },
            {
              "amount": 1.5,
              "unit": "tsp",
              "name": "kosher salt",
              "notes": "To taste."
            },
            {
              "amount": 0.5,
              "unit": "tsp",
              "name": "black pepper",
              "notes": "Freshly ground."
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "all-purpose flour",
              "notes": "For dredging the meatballs before frying."
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "olive oil or neutral oil",
              "notes": "For shallow frying."
            }
          ],
          "instructions": [
            "Step 1: The Mix. In a large bowl, combine the ground meat, grated onion (with its juices), squeezed-dry bread, egg, mint, parsley, oregano, vinegar, 2 tbsp olive oil, salt, and pepper.",
            "Step 2: The Knead. Use your hands to knead the mixture vigorously for 3-5 minutes. The mixture should become sticky and pale. This develops the myosin proteins, ensuring the meatballs hold together without being dense.",
            "Step 3: The Rest. Cover the bowl and refrigerate for at least 1 hour. This hydrates the bread and allows the mint and onion flavors to permeate the fat.",
            "Step 4: Form. Scoop out about 1.5 tablespoons of the mixture and roll it into a smooth ball. Slightly flatten it into a thick medallion.",
            "Step 5: Dredge. Place the flour on a plate. Roll each meatball in the flour to coat completely, then gently shake off the excess. This flour barrier creates the crispy crust.",
            "Step 6: Heat oil. Heat 1/2 inch of oil in a large, heavy skillet over medium-high heat. The oil is ready when a pinch of flour sizzles instantly.",
            "Step 7: Fry. Carefully place the meatballs in the hot oil. Do not crowd the pan. Fry for 3-4 minutes per side until deeply browned and crusty.",
            "Step 8: Drain. Remove to a paper towel-lined plate to drain. Serve hot or at room temperature with tzatziki and pita."
          ],
          "classifications": {
            "mealType": [
              "appetizer",
              "meze",
              "dinner"
            ],
            "cookingMethods": [
              "kneading",
              "shallow-frying"
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
              "Venus"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 450,
            "proteinG": 24,
            "carbsG": 18,
            "fatG": 32,
            "fiberG": 2,
            "sodiumMg": 680,
            "sugarG": 2,
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
              "originalIngredient": "ground beef",
              "substituteOptions": [
                "ground lamb",
                "lentil and mushroom mix (vegan)"
              ]
            },
            {
              "originalIngredient": "stale bread",
              "substituteOptions": [
                "panko breadcrumbs",
                "gluten-free bread"
              ]
            }
          ]
        },
        {
          "name": "Authentic Galatopita",
          "description": "A rustic, crustless Greek milk pie. It is an exercise in simple agrarian alchemy: milk is thickened with semolina into a dense custard, enriched with eggs and butter, and baked until the top forms a naturally scorched, caramelized skin, requiring no phyllo pastry.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 50,
            "baseServingSize": 8,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 1,
              "unit": "liter",
              "name": "whole milk",
              "notes": "Must be whole milk for proper texture."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "fine semolina flour",
              "notes": "The primary thickener."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "granulated sugar",
              "notes": "For sweetness and caramelization."
            },
            {
              "amount": 3,
              "unit": "large",
              "name": "eggs",
              "notes": "Lightly beaten."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "pure vanilla extract",
              "notes": "Aromatic."
            },
            {
              "amount": 1,
              "unit": "tsp",
              "name": "lemon zest",
              "notes": "Freshly grated."
            },
            {
              "amount": 50,
              "unit": "g",
              "name": "unsalted butter",
              "notes": "Stirred into the hot custard."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "butter",
              "notes": "For heavily greasing the baking pan."
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "ground cinnamon",
              "notes": "For heavy dusting before serving."
            }
          ],
          "instructions": [
            "Step 1: Preheat oven to 350°F (175°C). Heavily butter a 9-inch round or square baking dish.",
            "Step 2: Heat the milk. In a medium saucepan, warm the milk over medium heat until it begins to steam (do not boil).",
            "Step 3: Thicken. Slowly whisk in the semolina and sugar in a steady stream. Continue whisking constantly for 5-8 minutes until the mixture thickens into a heavy porridge. Remove from heat.",
            "Step 4: Enrich. Immediately stir in the 50g of butter, vanilla extract, and lemon zest until the butter melts completely.",
            "Step 5: Temper the eggs. In a small bowl, have the beaten eggs ready. Slowly whisk about 1/2 cup of the hot semolina mixture into the eggs to temper them. Then, rapidly whisk the egg mixture back into the main saucepan until completely smooth.",
            "Step 6: Bake. Pour the custard into the prepared baking dish. Smooth the top with a spatula.",
            "Step 7: The Crust. Bake for 45-50 minutes. The pie will puff up significantly and the top must become deeply golden brown with dark, almost burnt-looking patches. This scorched skin is the signature of the dish.",
            "Step 8: Cool. Remove from the oven. It will deflate as it cools. You must let it cool completely to room temperature (at least 2 hours) so the semolina sets firmly enough to slice.",
            "Step 9: Garnish. Dust generously with ground cinnamon before cutting into squares or wedges."
          ],
          "classifications": {
            "mealType": [
              "dessert",
              "snack"
            ],
            "cookingMethods": [
              "whisking",
              "baking"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.35,
            "Earth": 0.35,
            "Air": 0.1
          },
          "astrologicalAffinities": {
            "planets": [
              "Moon",
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
            "calories": 250,
            "proteinG": 8,
            "carbsG": 35,
            "fatG": 9,
            "fiberG": 1,
            "sodiumMg": 85,
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
              "originalIngredient": "semolina flour",
              "substituteOptions": [
                "farina (Cream of Wheat)"
              ]
            },
            {
              "originalIngredient": "whole milk",
              "substituteOptions": [
                "oat milk (will be less rich and may require slightly more semolina)"
              ]
            }
          ]
        },
        {
          "name": "Authentic Greek Skordalia",
          "description": "A fiercely pungent, elemental Greek garlic dip. It relies on the mechanical emulsification of raw garlic, starches (either potatoes or stale bread), and high-quality olive oil. The result is a dense, creamy, heavily aerated paste that bites aggressively and is traditionally served alongside fried salt cod (Bakalarios) or boiled beets.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 25,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 500,
              "unit": "g",
              "name": "Russet or Yukon Gold potatoes",
              "notes": "Peeled and cut into chunks. Must be a starchy potato, not waxy."
            },
            {
              "amount": 6,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Peeled. Adjust down to 4 if you prefer less intense heat."
            },
            {
              "amount": 0.75,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "Must be very high quality, as it is the primary flavor carrier."
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "white wine vinegar or fresh lemon juice",
              "notes": "Vinegar is more traditional in some regions, lemon in others."
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
              "name": "almonds or walnuts",
              "notes": "Finely crushed. Optional, but adds textural complexity and helps stabilize the emulsion."
            }
          ],
          "instructions": [
            "Step 1: Boil potatoes. Boil the potato chunks in salted water until completely fork-tender (about 20 mins). Drain well and return them to the hot, empty pot for 1 minute to evaporate excess moisture. They must be dry to emulsify properly.",
            "Step 2: The Garlic Paste. While the potatoes cook, place the raw garlic cloves and the 1 tsp of salt in a mortar and pestle. Pound violently until it becomes a completely smooth, sticky, translucent paste.",
            "Step 3: Mash the potatoes. Transfer the hot, dry potatoes to a large bowl. Mash them thoroughly until completely smooth. Do NOT use a blender or food processor for the potatoes, or they will turn into glue.",
            "Step 4: Combine base. Stir the garlic paste (and crushed nuts, if using) into the hot mashed potatoes.",
            "Step 5: The Emulsion (Crucial). While stirring the potato mixture continuously and vigorously with a wooden spoon or whisk, slowly drizzle in the olive oil in a thin, steady stream. The starch will absorb the oil.",
            "Step 6: The Acid. Alternate drizzling the oil with splashes of the vinegar/lemon juice until the mixture becomes pale, light, and almost fluffy.",
            "Step 7: Serve at room temperature or slightly chilled, heavily drizzled with more olive oil."
          ],
          "classifications": {
            "mealType": [
              "appetizer",
              "meze",
              "dip",
              "vegan"
            ],
            "cookingMethods": [
              "boiling",
              "mashing",
              "emulsifying"
            ]
          },
          "elementalProperties": {
            "Fire": 0.4,
            "Water": 0.1,
            "Earth": 0.35,
            "Air": 0.15
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Earth"
            ],
            "signs": [
              "Aries",
              "Taurus"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 3,
            "carbsG": 25,
            "fatG": 32,
            "fiberG": 3,
            "sodiumMg": 450,
            "sugarG": 2,
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
              "originalIngredient": "potatoes",
              "substituteOptions": [
                "3 thick slices of stale country bread (crusts removed, soaked in water, and squeezed dry)"
              ]
            },
            {
              "originalIngredient": "white wine vinegar",
              "substituteOptions": [
                "red wine vinegar",
                "fresh lemon juice"
              ]
            }
          ]
        },
        {
          "name": "Authentic Melitzanosalata (Greek Eggplant Dip)",
          "description": "A rustic, elemental dip. Unlike the smooth, tahini-heavy Baba Ganoush of the Levant, Greek Melitzanosalata is coarse, chunky, and relies entirely on the aggressive char of the eggplant skin to infuse the flesh with smoke. It is heavily acidulated with vinegar or lemon and bound with raw garlic and olive oil.",
          "details": {
            "cuisine": "Greek",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 45,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "summer",
              "autumn"
            ]
          },
          "ingredients": [
            {
              "amount": 2,
              "unit": "large",
              "name": "globe eggplants (aubergines)",
              "notes": "Must be firm and shiny."
            },
            {
              "amount": 3,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Finely minced or mashed into a paste."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "extra virgin olive oil",
              "notes": "High quality, robust."
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "red wine vinegar",
              "notes": "Traditional, provides a sharper bite than lemon juice."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "red onion",
              "notes": "Very finely minced."
            },
            {
              "amount": 0.25,
              "unit": "cup",
              "name": "fresh flat-leaf parsley",
              "notes": "Finely chopped."
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
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "walnuts",
              "notes": "Finely crushed. Optional, but adds textural contrast."
            }
          ],
          "instructions": [
            "Step 1: Char the eggplants. Prick the eggplants a few times with a fork. Roast them directly over an open gas flame, turning with tongs until the skin is completely blackened, blistered, and the flesh has collapsed (about 15-20 minutes). Alternatively, broil them in the oven, turning occasionally.",
            "Step 2: Steam and cool. Place the charred eggplants in a bowl and cover tightly with plastic wrap for 10 minutes. The trapped steam will loosen the skin.",
            "Step 3: Extract the flesh. Carefully peel away and discard the blackened skin. Remove the stem. Do not rinse the flesh, or you will lose the smoky flavor.",
            "Step 4: Drain. Place the naked eggplant flesh in a fine-mesh sieve over a bowl. Let it drain for 15 minutes to remove excess bitter liquid.",
            "Step 5: The Mash. Transfer the drained flesh to a mixing bowl. Use a fork to roughly mash it. Do not use a food processor; the texture must be chunky and fibrous.",
            "Step 6: Build the dip. Stir the minced garlic, red onion, parsley, salt, and pepper into the mashed eggplant.",
            "Step 7: The Emulsion. While stirring constantly, slowly drizzle in the red wine vinegar, followed by the olive oil. The mixture will slightly emulsify but remain rustic.",
            "Step 8: Rest. Cover and refrigerate for at least 1 hour before serving to allow the raw garlic and onion to mellow and the flavors to meld. Garnish with crushed walnuts and a drizzle of olive oil."
          ],
          "classifications": {
            "mealType": [
              "appetizer",
              "meze",
              "vegan",
              "dip"
            ],
            "cookingMethods": [
              "charring",
              "mashing"
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
              "Pluto",
              "Mars"
            ],
            "signs": [
              "Scorpio",
              "Aries"
            ],
            "lunarPhases": [
              "Waning Gibbous"
            ]
          },
          "nutritionPerServing": {
            "calories": 180,
            "proteinG": 2,
            "carbsG": 12,
            "fatG": 15,
            "fiberG": 5,
            "sodiumMg": 320,
            "sugarG": 4,
            "vitamins": [
              "Vitamin C",
              "Folate"
            ],
            "minerals": [
              "Manganese",
              "Potassium"
            ]
          },
          "substitutions": [
            {
              "originalIngredient": "red wine vinegar",
              "substituteOptions": [
                "fresh lemon juice"
              ]
            },
            {
              "originalIngredient": "walnuts",
              "substituteOptions": [
                "pine nuts",
                "omit entirely"
              ]
            }
          ]
        },
            {
              "name": "Authentic Moussaka",
              "description": "The architectural giant of Greek cuisine. Layers of fried eggplant and spiced lamb ragu are topped with a massive, 2-inch thick layer of stiff Greek béchamel, baked until the surface forms a dark, scorched crust.",
              "details": {
                "cuisine": "Greek",
                "prepTimeMinutes": 60,
                "cookTimeMinutes": 60,
                "baseServingSize": 8,
                "spiceLevel": "Mild",
                "season": [
                  "autumn",
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 2,
                  "unit": "large",
                  "name": "Eggplants",
                  "notes": "Sliced and fried."
                },
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Ground lamb",
                  "notes": "Spiced with cinnamon."
                }
              ],
              "instructions": [
                "Step 1: Fry eggplant slices until golden.",
                "Step 2: Prepare a thick lamb ragu with tomato and wine.",
                "Step 3: Make a stiff béchamel enriched with egg yolks.",
                "Step 4: Layer eggplant, then meat, then béchamel.",
                "Step 5: Bake at 375°F until the top is deeply browned."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "layering",
                  "baking"
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
                "calories": 680,
                "proteinG": 32,
                "carbsG": 45,
                "fatG": 48,
                "fiberG": 8,
                "sodiumMg": 850,
                "sugarG": 10,
                "vitamins": [
                  "Vitamin A",
                  "Vitamin K"
                ],
                "minerals": [
                  "Potassium",
                  "Iron"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Spanakopita",
              "description": "A study in paper-thin stratification. Dozens of layers of buttered phyllo pastry encapsulate a moisture-controlled filling of spinach, feta, and dill, baked until the exterior shatters at the touch.",
              "details": {
                "cuisine": "Greek",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 45,
                "baseServingSize": 8,
                "spiceLevel": "None",
                "season": [
                  "all"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Phyllo pastry",
                  "notes": "Defrosted."
                },
                {
                  "amount": 2,
                  "unit": "lbs",
                  "name": "Fresh spinach",
                  "notes": "Wilted and squeezed completely dry."
                }
              ],
              "instructions": [
                "Step 1: Wring spinach until zero water remains.",
                "Step 2: Mix with feta, eggs, and massive amounts of dill.",
                "Step 3: Layer 10 sheets of phyllo, brushing each with butter.",
                "Step 4: Spread filling; top with 10 more buttered sheets.",
                "Step 5: Score top layers; bake until golden and crisp."
              ],
              "classifications": {
                "mealType": [
                  "lunch",
                  "appetizer"
                ],
                "cookingMethods": [
                  "baking",
                  "layering"
                ]
              },
              "elementalProperties": {
                "Fire": 0.25,
                "Water": 0.1,
                "Earth": 0.35,
                "Air": 0.3
              },
              "astrologicalAffinities": {
                "planets": [
                  "Venus"
                ],
                "signs": [
                  "libra"
                ],
                "lunarPhases": [
                  "First Quarter"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 14,
                "carbsG": 38,
                "fatG": 28,
                "fiberG": 6,
                "sodiumMg": 950,
                "sugarG": 2,
                "vitamins": [
                  "Vitamin K",
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
              "name": "Authentic Pastitsio",
              "description": "The Greek pasta bake. Tubular pasta is aligned horizontally, bonded by egg and cheese, topped with a rich meat sauce and a dense, structural layer of béchamel, creating a perfect cross-section when sliced.",
              "details": {
                "cuisine": "Greek",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 60,
                "baseServingSize": 8,
                "spiceLevel": "None",
                "season": [
                  "winter"
                ]
              },
              "ingredients": [
                {
                  "amount": 500,
                  "unit": "g",
                  "name": "Pastitsio pasta",
                  "notes": "Long tubes (No. 2)."
                },
                {
                  "amount": 1,
                  "unit": "lb",
                  "name": "Ground beef",
                  "notes": "Spiced with cloves and cinnamon."
                }
              ],
              "instructions": [
                "Step 1: Boil pasta; toss with egg whites and kefalotyri.",
                "Step 2: Prepare meat sauce with tomato and warm spices.",
                "Step 3: Align pasta tubes in a deep baking dish.",
                "Step 4: Layer meat sauce, then a thick béchamel.",
                "Step 5: Bake at 350°F until the surface is rigid and golden."
              ],
              "classifications": {
                "mealType": [
                  "dinner"
                ],
                "cookingMethods": [
                  "baking",
                  "layering"
                ]
              },
              "elementalProperties": {
                "Fire": 0.2,
                "Water": 0.2,
                "Earth": 0.55,
                "Air": 0.05
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
                "calories": 720,
                "proteinG": 38,
                "carbsG": 75,
                "fatG": 42,
                "fiberG": 4,
                "sodiumMg": 1100,
                "sugarG": 8,
                "vitamins": [
                  "Vitamin B12"
                ],
                "minerals": [
                  "Calcium",
                  "Iron"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Gemista",
              "description": "Vegetables filled with the essence of summer. Tomatoes and peppers are hollowed and stuffed with a kinetic mixture of rice, herbs, and the vegetable's own pulp, then slow-roasted until the skins collapse and caramelize.",
              "details": {
                "cuisine": "Greek",
                "prepTimeMinutes": 45,
                "cookTimeMinutes": 90,
                "baseServingSize": 4,
                "spiceLevel": "None",
                "season": [
                  "summer"
                ]
              },
              "ingredients": [
                {
                  "amount": 8,
                  "unit": "whole",
                  "name": "Tomatoes/Bell Peppers",
                  "notes": "Large and firm."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Short-grain rice",
                  "notes": "Raw."
                }
              ],
              "instructions": [
                "Step 1: Hollow out vegetables; reserve the pulp.",
                "Step 2: Sauté onion, garlic, and rice; add vegetable pulp.",
                "Step 3: Fold in massive amounts of parsley and mint.",
                "Step 4: Stuff vegetables 3/4 full (rice will expand).",
                "Step 5: Bake with potatoes in a lake of olive oil."
              ],
              "classifications": {
                "mealType": [
                  "dinner",
                  "lunch",
                  "vegan"
                ],
                "cookingMethods": [
                  "roasting",
                  "stuffing"
                ]
              },
              "elementalProperties": {
                "Fire": 0.15,
                "Water": 0.35,
                "Earth": 0.45,
                "Air": 0.05
              },
              "astrologicalAffinities": {
                "planets": [
                  "Sun"
                ],
                "signs": [
                  "leo"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 450,
                "proteinG": 8,
                "carbsG": 62,
                "fatG": 22,
                "fiberG": 8,
                "sodiumMg": 550,
                "sugarG": 12,
                "vitamins": [
                  "Vitamin C",
                  "Vitamin A"
                ],
                "minerals": [
                  "Potassium"
                ]
              },
              "substitutions": []
            },
            {
              "name": "Authentic Galaktoboureko",
              "description": "The supreme Greek dessert. A thick semolina custard is encased in buttered phyllo, baked until golden, and then drowned in a cold lemon-scented syrup, resulting in a dual texture of shattering pastry and silken cream.",
              "details": {
                "cuisine": "Greek",
                "prepTimeMinutes": 30,
                "cookTimeMinutes": 45,
                "baseServingSize": 12,
                "spiceLevel": "None",
                "season": [
                  "celebration"
                ]
              },
              "ingredients": [
                {
                  "amount": 1,
                  "unit": "quart",
                  "name": "Whole milk",
                  "notes": "For the custard."
                },
                {
                  "amount": 1,
                  "unit": "cup",
                  "name": "Fine semolina",
                  "notes": "Thickener."
                }
              ],
              "instructions": [
                "Step 1: Cook milk, sugar, and semolina until very thick.",
                "Step 2: Temper in egg yolks and butter.",
                "Step 3: Line dish with buttered phyllo; pour in custard.",
                "Step 4: Cover with more phyllo; bake until dark golden.",
                "Step 5: Pour cold lemon syrup over the bubbling hot pastry."
              ],
              "classifications": {
                "mealType": [
                  "dessert"
                ],
                "cookingMethods": [
                  "boiling",
                  "baking",
                  "syrup-saturation"
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
                  "Venus"
                ],
                "signs": [
                  "taurus"
                ],
                "lunarPhases": [
                  "Full Moon"
                ]
              },
              "nutritionPerServing": {
                "calories": 420,
                "proteinG": 10,
                "carbsG": 65,
                "fatG": 18,
                "fiberG": 1,
                "sodiumMg": 180,
                "sugarG": 45,
                "vitamins": [
                  "Riboflavin"
                ],
                "minerals": [
                  "Calcium"
                ]
              },
              "substitutions": []
            }
        ,
        {
          name: "Spanakopita",
          description: "The definitive Greek savory pastry, Spanakopita is a masterclass in contrasting textures and flavors. Dozens of paper-thin phyllo sheets, each individually brushed with golden olive oil or clarified butter, are layered to create a shatteringly crisp pastry shell that encases a dense, rich filling of wilted spinach, creamy feta cheese, eggs, fresh dill, and green onions. The salt of the feta penetrates the spinach while the eggs bind everything into a cohesive, custardy interior.",
          details: {"cuisine":"Greek","prepTimeMinutes":45,"cookTimeMinutes":50,"baseServingSize":8,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"Fresh spinach","notes":"Or 20 oz frozen spinach, thawed and squeezed completely dry."},{"amount":0.75,"unit":"lb","name":"Feta cheese","notes":"High-quality Greek PDO feta, crumbled."},{"amount":4,"unit":"large","name":"Eggs","notes":"Lightly beaten."},{"amount":1,"unit":"bunch","name":"Green onions","notes":"Finely sliced."},{"amount":0.5,"unit":"cup","name":"Fresh dill","notes":"Finely chopped. This is non-negotiable."},{"amount":1,"unit":"lb","name":"Phyllo dough","notes":"Thawed if frozen, kept covered with a damp towel."},{"amount":0.75,"unit":"cup","name":"Olive oil or melted butter","notes":"For brushing each phyllo layer."}],
          instructions: ["Step 1: If using fresh spinach, blanch briefly in boiling water, then drain and squeeze until completely dry in a clean kitchen towel. The spinach must be as dry as possible or the filling will be watery and the phyllo will become soggy. Chop roughly.","Step 2: Combine the squeezed spinach with crumbled feta, beaten eggs, sliced green onions, fresh dill, and black pepper in a large bowl. Mix well. Taste - the feta is salty, so add salt only if needed.","Step 3: Unroll the phyllo dough. Keep it covered with a barely damp towel at all times to prevent it from drying and cracking.","Step 4: Brush a 13x9 inch baking pan with olive oil. Lay one phyllo sheet in the pan and brush it generously with olive oil. Continue layering and brushing for 10 to 12 sheets, building the base.","Step 5: Spread the entire spinach and feta filling evenly over the phyllo base. Continue layering the remaining phyllo sheets on top, brushing each one with oil, for another 10 to 12 sheets. Tuck in any overhanging edges.","Step 6: With a sharp knife, score the top layers of phyllo into serving portions before baking - this prevents cracking. Bake at 375F for 45 to 50 minutes until deep golden brown and shatteringly crisp. Allow to cool for 15 minutes before serving."],
          classifications: {"mealType":["lunch","dinner","snack","appetizer"],"cookingMethods":["baking","layering"]},
          elementalProperties: {"Fire":0.15,"Water":0.2,"Earth":0.5,"Air":0.15},
          astrologicalAffinities: {"planets":["Venus","Moon","Mercury"],"signs":["taurus","cancer","virgo"],"lunarPhases":["Waxing Gibbous"]},
          nutritionPerServing: {"calories":380,"proteinG":14,"carbsG":32,"fatG":24,"fiberG":4,"sodiumMg":680,"sugarG":2,"vitamins":["Vitamin A","Folate","Vitamin K"],"minerals":["Calcium","Iron","Magnesium"]},
          substitutions: [{"originalIngredient":"Feta cheese","substituteOptions":["Ricotta plus salt","Goat cheese"]},{"originalIngredient":"Phyllo dough","substituteOptions":["Puff pastry (different texture)"]}]
        },
        {
          name: "Dolmades",
          description: "Dolmades - stuffed grape leaves - represent one of the most ancient and meditative preparations in Greek cuisine. Each tender, slightly tart brined grape leaf is individually filled with a mixture of short-grain rice, pine nuts, currants, fresh herbs, and lemon zest, then rolled into a precise cylinder, packed tightly in a pot, and steamed under pressure in a bath of olive oil and lemon juice until the rice cooks from the steam and the flavors meld into a remarkably complex, lemony, herbal whole.",
          details: {"cuisine":"Greek","prepTimeMinutes":60,"cookTimeMinutes":45,"baseServingSize":6,"spiceLevel":"None","season":["spring","summer"]},
          ingredients: [{"amount":40,"unit":"whole","name":"Brined grape leaves","notes":"Rinsed well to remove excess salt, stems trimmed."},{"amount":1.5,"unit":"cups","name":"Short-grain rice","notes":"Arborio or similar - not rinsed."},{"amount":0.25,"unit":"cup","name":"Pine nuts","notes":"Lightly toasted."},{"amount":0.25,"unit":"cup","name":"Currants or raisins","notes":"For sweetness contrast."},{"amount":0.5,"unit":"bunch","name":"Fresh flat-leaf parsley","notes":"Finely chopped."},{"amount":0.25,"unit":"cup","name":"Fresh dill","notes":"Finely chopped."},{"amount":2,"unit":"whole","name":"Lemons","notes":"Juice and zest for filling and cooking."},{"amount":0.75,"unit":"cup","name":"Extra virgin olive oil","notes":"Generously used - this is not a low-fat dish."},{"amount":1,"unit":"whole","name":"White onion","notes":"Very finely diced."}],
          instructions: ["Step 1: Combine the raw rice, toasted pine nuts, currants, finely chopped parsley, dill, lemon zest, grated onion, a generous pour of olive oil, and salt and pepper. Mix well. The filling should be fragrant and well-seasoned.","Step 2: Lay a grape leaf flat on a work surface, smooth side down. Place a generous teaspoon of rice filling at the stem end. Fold the stem end up over the filling, fold in the sides, then roll tightly away from you into a compact cylinder. The roll should be snug but not so tight that the rice cannot expand during cooking.","Step 3: Line the bottom of a wide, heavy pot with a single layer of unstuffed grape leaves (this prevents the dolmades from burning).","Step 4: Pack the dolmades tightly in the pot in layers, seam side down. They should be packed so they support each other and do not unroll during cooking.","Step 5: Mix together the remaining olive oil, fresh lemon juice, and enough water to just cover the dolmades. Pour over the packed rolls.","Step 6: Place a heavy plate directly on top of the dolmades to weigh them down and keep them submerged. Cover the pot tightly and cook over medium-low heat for 45 minutes. The steam inside the pot cooks the rice. Allow to cool completely before serving - they are traditionally served at room temperature with lemon wedges and thick yogurt."],
          classifications: {"mealType":["appetizer","lunch","snack"],"cookingMethods":["steaming","simmering"]},
          elementalProperties: {"Fire":0.1,"Water":0.3,"Earth":0.45,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Venus","Jupiter"],"signs":["cancer","taurus","pisces"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":340,"proteinG":6,"carbsG":42,"fatG":18,"fiberG":4,"sodiumMg":480,"sugarG":8,"vitamins":["Vitamin K","Folate","Vitamin C"],"minerals":["Iron","Magnesium","Potassium"]},
          substitutions: [{"originalIngredient":"Brined grape leaves","substituteOptions":["Blanched cabbage leaves","Chard leaves"]},{"originalIngredient":"Currants","substituteOptions":["Raisins","Dried cranberries"]}]
        },
        {
          name: "Avgolemono",
          description: "Avgolemono - egg-lemon - is both a sauce and a soup, and the technique defines a cornerstone of Greek cooking. In its soup form, a rich chicken broth is tempered with a stabilizing emulsion of beaten eggs and fresh lemon juice that is whisked together and then slowly introduced to the hot broth, transforming it from a clear consomme into a silky, cloud-like, pale golden elixir of remarkable gentleness. The science lies in the egg proteins denaturing gradually in the hot broth to create a natural thickener without curdling.",
          details: {"cuisine":"Greek","prepTimeMinutes":20,"cookTimeMinutes":40,"baseServingSize":6,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":8,"unit":"cups","name":"Rich chicken broth","notes":"Homemade strongly preferred for depth of flavor."},{"amount":0.5,"unit":"cup","name":"Orzo or short-grain rice","notes":"For body."},{"amount":3,"unit":"large","name":"Eggs","notes":"Room temperature - cold eggs are harder to temper."},{"amount":2,"unit":"whole","name":"Lemons","notes":"Freshly squeezed - bottled juice will not work."},{"amount":1,"unit":"cup","name":"Cooked shredded chicken","notes":"From making the broth."},{"amount":1,"unit":"tsp","name":"Salt","notes":"Adjusted to taste."}],
          instructions: ["Step 1: Bring the chicken broth to a boil in a medium saucepan. Add the orzo or rice and cook until just tender, about 8 to 10 minutes. Reduce heat to a low simmer.","Step 2: In a medium bowl, whisk the eggs vigorously until frothy and pale - this takes about 2 minutes of vigorous whisking. The air incorporated into the eggs is crucial for the silky texture.","Step 3: While still whisking, gradually add the fresh lemon juice to the beaten eggs in a thin stream. Continue whisking until the mixture is well combined.","Step 4: The critical step - tempering. Using a ladle, slowly add hot broth from the pot to the egg-lemon mixture, one ladle at a time, whisking constantly between each addition. Add 4 to 6 ladles, whisking continuously. This brings the eggs up to temperature gradually so they thicken without scrambling.","Step 5: Pour the tempered egg-lemon mixture back into the pot of broth in a slow, steady stream while stirring constantly. Do not allow the soup to boil after adding the avgolemono - a boil will cause the eggs to curdle.","Step 6: Add the shredded chicken and warm through. Serve immediately in warm bowls with freshly cracked black pepper and a final squeeze of lemon."],
          classifications: {"mealType":["lunch","dinner","starter"],"cookingMethods":["simmering","tempering"]},
          elementalProperties: {"Fire":0.1,"Water":0.5,"Earth":0.25,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Venus","Mercury"],"signs":["cancer","libra","gemini"],"lunarPhases":["Waxing Crescent"]},
          nutritionPerServing: {"calories":220,"proteinG":18,"carbsG":18,"fatG":8,"fiberG":1,"sodiumMg":720,"sugarG":2,"vitamins":["Vitamin B12","Niacin","Vitamin C"],"minerals":["Potassium","Phosphorus","Selenium"]},
          substitutions: [{"originalIngredient":"Chicken broth","substituteOptions":["Vegetable broth","Lamb broth"]},{"originalIngredient":"Orzo","substituteOptions":["Short-grain rice","Broken vermicelli"]}]
        },
        {
          name: "Kleftiko",
          description: "Kleftiko - literally meaning stolen or bandit-style - is a legendary slow-cooked lamb preparation with origins in the Greek mountains, where bandits (kleftes) would cook lamb in sealed pits in the ground to avoid detection by the smoke. The lamb is marinated in garlic, lemon, and wild oregano, wrapped tightly in parchment paper with slices of potato and tomato, and slow-roasted until the connective tissue completely dissolves and the meat can be pulled apart with a spoon, permeated by its own concentrated juices.",
          details: {"cuisine":"Greek","prepTimeMinutes":30,"cookTimeMinutes":240,"baseServingSize":6,"spiceLevel":"None","season":["spring","winter"]},
          ingredients: [{"amount":3,"unit":"lbs","name":"Bone-in lamb shoulder or leg","notes":"Cut into large pieces, or use a small whole leg."},{"amount":8,"unit":"cloves","name":"Garlic","notes":"Some sliced for studding the meat, some minced for marinade."},{"amount":3,"unit":"whole","name":"Lemons","notes":"Juice and zest."},{"amount":3,"unit":"tbsp","name":"Dried Greek oregano","notes":"Genuine rigani - Greek mountain oregano is key."},{"amount":0.5,"unit":"cup","name":"Extra virgin olive oil","notes":"For the marinade."},{"amount":4,"unit":"medium","name":"Potatoes","notes":"Cut into large chunks, they cook in the lamb juices."},{"amount":2,"unit":"whole","name":"Tomatoes","notes":"Cut into wedges."},{"amount":0.5,"unit":"lb","name":"Kefalotyri or Kefalograviera cheese","notes":"Optional, added in the last 30 minutes."}],
          instructions: ["Step 1: Using a small knife, make deep incisions all over the lamb pieces and insert slices of garlic deep into the meat. This ensures the garlic infuses the interior as it roasts.","Step 2: Prepare the marinade: whisk together olive oil, lemon juice, lemon zest, minced garlic, dried oregano, salt, and black pepper. Coat the lamb thoroughly in the marinade. For best results, marinate overnight in the refrigerator.","Step 3: Preheat the oven to 325F. Tear off large sheets of parchment paper. Place lamb pieces in the center, surround with potato chunks and tomato wedges. Season the vegetables as well.","Step 4: Wrap each portion tightly in the parchment, folding the edges over multiple times to create an absolutely airtight seal. The steam that builds inside is what braises the lamb without drying it.","Step 5: Place the sealed parcels in a roasting pan. Roast at 325F for 3.5 to 4 hours. The meat should be completely tender and falling off the bone when done.","Step 6: Carefully open the parchment at the table (the steam is very hot). If using cheese, add chunks of kefalotyri on top of the opened parcels and return to a 400F oven for 15 minutes to brown. Serve with crusty bread to soak up the extraordinary juices."],
          classifications: {"mealType":["dinner","celebration"],"cookingMethods":["slow-roasting","braising"]},
          elementalProperties: {"Fire":0.2,"Water":0.2,"Earth":0.5,"Air":0.1},
          astrologicalAffinities: {"planets":["Saturn","Mars","Jupiter"],"signs":["capricorn","aries","sagittarius"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":620,"proteinG":52,"carbsG":28,"fatG":34,"fiberG":4,"sodiumMg":580,"sugarG":4,"vitamins":["Vitamin B12","Niacin","Vitamin C"],"minerals":["Iron","Zinc","Potassium"]},
          substitutions: [{"originalIngredient":"Lamb shoulder","substituteOptions":["Goat shoulder","Bone-in chicken (reduce time)"]},{"originalIngredient":"Kefalotyri cheese","substituteOptions":["Pecorino Romano","Aged Manchego"]}]
        },
        {
          name: "Loukoumades",
          description: "Loukoumades are Greece ancient answer to the donut - golden spheres of yeasted dough dropped into hot oil and fried until they puff into perfectly round, crispy-shelled, hollow-centered fritters. They are the oldest recorded sweet in Western culture, awarded to Olympic winners in ancient Greece. Fresh from the oil, the hot fritters are immediately drizzled with wildflower or thyme honey, dusted with cinnamon, and scattered with crushed walnuts, creating the perfect contrast of hot crispy exterior and warm, pillowy interior.",
          details: {"cuisine":"Greek","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":6,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"All-purpose flour","notes":"Sifted."},{"amount":1,"unit":"packet","name":"Active dry yeast","notes":"7g, dissolved in warm water with a pinch of sugar."},{"amount":1,"unit":"cup","name":"Warm water","notes":"For the dough - should feel warm to the touch."},{"amount":1,"unit":"tsp","name":"Salt","notes":"Fine salt."},{"amount":1,"unit":"tsp","name":"Sugar","notes":"For the dough."},{"amount":4,"unit":"cups","name":"Vegetable oil","notes":"For deep frying."},{"amount":0.5,"unit":"cup","name":"Greek thyme honey","notes":"Or wildflower honey."},{"amount":0.5,"unit":"cup","name":"Crushed walnuts","notes":"Coarsely chopped."},{"amount":1,"unit":"tsp","name":"Ground cinnamon","notes":"For dusting."}],
          instructions: ["Step 1: Dissolve the yeast in 1/4 cup of the warm water with a pinch of sugar. Let sit for 10 minutes until foamy and active - if the yeast does not foam, it is dead and must be replaced.","Step 2: In a large bowl, combine the sifted flour, salt, and sugar. Make a well in the center and add the yeast mixture and remaining warm water. Beat vigorously with a whisk or wooden spoon until a smooth, elastic batter forms - it should be thicker than pancake batter but still pourable.","Step 3: Cover the bowl with a clean towel and let rise in a warm place for 1 hour until doubled and very bubbly.","Step 4: Heat the oil in a deep pot to 375F. Use a thermometer - temperature control is critical. Too cool and the loukoumades absorb oil and are greasy; too hot and they burn outside while staying raw inside.","Step 5: Using two wet spoons or a small ice cream scoop, drop spoonfuls of batter into the hot oil. They will sink, then rise and puff dramatically as the yeast in the batter reacts to the heat. Fry for 3 to 4 minutes, turning, until uniformly deep golden brown.","Step 6: Remove with a slotted spoon and drain briefly. Immediately pile onto a plate and drizzle generously with honey, scatter crushed walnuts over the top, and dust with cinnamon. Loukoumades must be eaten hot - they lose their magic within minutes of frying."],
          classifications: {"mealType":["dessert","snack","celebration"],"cookingMethods":["deep-frying","proofing"]},
          elementalProperties: {"Fire":0.35,"Water":0.2,"Earth":0.3,"Air":0.15},
          astrologicalAffinities: {"planets":["Jupiter","Venus","Sun"],"signs":["sagittarius","taurus","leo"],"lunarPhases":["Full Moon"]},
          nutritionPerServing: {"calories":420,"proteinG":6,"carbsG":58,"fatG":20,"fiberG":2,"sodiumMg":220,"sugarG":28,"vitamins":["Thiamin","Niacin","Folate"],"minerals":["Iron","Calcium","Magnesium"]},
          substitutions: [{"originalIngredient":"Greek thyme honey","substituteOptions":["Maple syrup","Date syrup"]},{"originalIngredient":"Walnuts","substituteOptions":["Pistachios","Almonds"]}]
        },
        ],
    },
    dessert: {
      all: [
        // ... dessert dishes
      ],
    },
  },
  traditionalSauces: {
    tzatziki: {
      name: "Tzatziki",
      description: "Cooling yogurt and cucumber sauce with garlic and herbs",
      base: "yogurt",
      keyIngredients: [
        "Greek yogurt",
        "cucumber",
        "garlic",
        "olive oil",
        "dill",
      ],
      culinaryUses: ["dipping sauce", "condiment", "marinade", "meze"],
      variants: ["Mint tzatziki", "Spicy tzatziki", "Avocado tzatziki"],
      elementalProperties: {
        Water: 0.6,
        Earth: 0.2,
        Air: 0.2,
        Fire: 0.0,
      },
      astrologicalInfluences: ["Moon", "Venus", "Cancer"],
      seasonality: "all",
      preparationNotes:
        "Properly draining the cucumber is key to a thick consistency",
      technicalTips:
        "Salt and drain cucumbers for at least 30 minutes before mixing",
    },
    avgolemono: {
      name: "Avgolemono",
      description: "Silky egg and lemon sauce that thickens soups and stews",
      base: "eggs and lemon",
      keyIngredients: [
        "eggs",
        "lemon juice",
        "broth",
        "rice or orzo (optional)",
      ],
      culinaryUses: [
        "soup base",
        "sauce for dolmades",
        "fish sauce",
        "vegetable dressing",
      ],
      variants: ["Thick sauce", "Soup form", "Vegetable avgolemono"],
      elementalProperties: {
        Water: 0.4,
        Air: 0.3,
        Fire: 0.2,
        Earth: 0.1,
      },
      astrologicalInfluences: ["Mercury", "Moon", "Gemini"],
      seasonality: "winter, spring",
      preparationNotes:
        "The key is to temper the eggs properly to avoid curdling",
      technicalTips:
        "Add hot broth to eggs very slowly while whisking constantly",
    },
    ladolemono: {
      name: "Ladolemono",
      description: "Simple but powerful emulsion of olive oil and lemon juice",
      base: "olive oil and lemon",
      keyIngredients: [
        "extra virgin olive oil",
        "lemon juice",
        "garlic",
        "oregano",
      ],
      culinaryUses: [
        "dressing for grilled foods",
        "marinade",
        "seafood sauce",
        "vegetable dressing",
      ],
      variants: ["Mustard ladolemono", "Herb-infused", "Spicy version"],
      elementalProperties: {
        Air: 0.5,
        Fire: 0.2,
        Earth: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Sun", "Mercury", "Leo"],
      seasonality: "all",
      preparationNotes:
        "The ratio is typically 3 parts oil to 1 part lemon juice",
      technicalTips: "Whisk vigorously or blend for proper emulsification",
    },
    skordalia: {
      name: "Skordalia",
      description: "Pungent garlic sauce made with potato, bread, or nuts",
      base: "garlic and starch",
      keyIngredients: [
        "garlic",
        "potato or bread",
        "olive oil",
        "vinegar",
        "almonds (optional)",
      ],
      culinaryUses: ["fish accompaniment", "vegetable dip", "spread", "meze"],
      variants: ["Potato skordalia", "Bread skordalia", "Almond skordalia"],
      elementalProperties: {
        Earth: 0.4,
        Fire: 0.3,
        Air: 0.2,
        Water: 0.1,
      },
      astrologicalInfluences: ["Mars", "Saturn", "Aries"],
      seasonality: "all",
      preparationNotes:
        "Achieving the right balance of garlic is crucial - adjust to taste",
      technicalTips:
        "Slowly incorporate oil while blending for proper emulsification",
    },
    htipiti: {
      name: "Htipiti",
      description: "Spicy roasted red pepper and feta dip",
      base: "roasted peppers and cheese",
      keyIngredients: [
        "roasted red peppers",
        "feta cheese",
        "olive oil",
        "garlic",
        "chili",
      ],
      culinaryUses: [
        "bread spread",
        "vegetable dip",
        "sandwich filling",
        "meze",
      ],
      variants: ["Spicy htipiti", "Smoky htipiti", "Creamy htipiti"],
      elementalProperties: {
        Fire: 0.5,
        Earth: 0.3,
        Water: 0.1,
        Air: 0.1,
      },
      astrologicalInfluences: ["Mars", "Sun", "Leo"],
      seasonality: "summer, autumn",
      preparationNotes:
        "The smokiness of the peppers is essential for authentic flavor",
      technicalTips: "Roast peppers directly over flame for best smoky taste",
    },
  },
  sauceRecommender: {
    forProtein: {
      chicken: ["ladolemono", "avgolemono", "tomato-based sauce"],
      lamb: ["tzatziki", "ladolemono", "minty yogurt sauce"],
      fish: ["skordalia", "ladolemono", "avgolemono", "lemon sauce"],
      beef: ["tomato-based sauce", "yogurt-based sauce", "red wine reduction"],
      vegetable: ["skordalia", "tzatziki", "tahini sauce"],
      seafood: ["ladolemono", "skordalia", "garlic oil", "lemon sauce"],
      pork: ["ladolemono", "htipiti", "mustard sauce"],
    },
    forVegetable: {
      leafy: ["ladolemono", "tahini sauce", "yogurt-based sauce"],
      root: ["skordalia", "olive oil and lemon", "tomato-based sauce"],
      eggplant: ["tzatziki", "tomato sauce", "tahini sauce", "garlic sauce"],
      legumes: [
        "olive oil and lemon",
        "tomato sauce",
        "herb oil",
        "vinegar sauce",
      ],
      squash: ["yogurt sauce", "tahini", "olive oil and herbs"],
      zucchini: ["tzatziki", "mint sauce", "ladolemono"],
    },
    forCookingMethod: {
      grilling: ["tzatziki", "ladolemono", "herb oil", "htipiti"],
      roasting: [
        "skordalia",
        "yogurt sauce",
        "olive oil and lemon",
        "avgolemono",
      ],
      braising: [
        "avgolemono",
        "tomato sauce",
        "olive oil finish",
        "red wine sauce",
      ],
      frying: ["tzatziki", "skordalia", "lemon wedges", "garlic sauce"],
      stewing: [
        "avgolemono",
        "olive oil finish",
        "herb oil",
        "red wine reduction",
      ],
      baking: ["ladolemono", "yogurt sauce", "lemon sauce"],
    },
    byAstrological: {
      Fire: [
        "spicy yogurt sauce",
        "red pepper-based sauce",
        "garlic oil",
        "htipiti",
      ],
      Earth: [
        "skordalia",
        "mushroom-based sauce",
        "tahini sauce",
        "olive tapenade",
      ],
      Air: [
        "ladolemono",
        "herb-infused oil",
        "light yogurt sauce",
        "lemon vinaigrette",
      ],
      Water: ["avgolemono", "tzatziki", "cucumber-based sauce", "fish sauce"],
    },
    byRegion: {
      mainland: ["skordalia", "tomato-based sauces", "avgolemono", "htipiti"],
      islands: ["ladolemono", "herb oils", "fish-based sauces", "lemon sauces"],
      northern: [
        "butter-based sauces",
        "yogurt sauces",
        "paprika oil",
        "garlic sauce",
      ],
      crete: [
        "herb-infused olive oil",
        "wine reductions",
        "dakos-style sauce",
        "ancient grain sauces",
      ],
      peloponnese: [
        "oil and lemon sauces",
        "oregano-infused oils",
        "wine reductions",
      ],
      cyclades: [
        "caper sauces",
        "olive pastes",
        "fresh herb oils",
        "seafood reductions",
      ],
    },
    byDietary: {
      vegetarian: [
        "tahini sauce",
        "skordalia",
        "olive oil and lemon",
        "htipiti",
      ],
      vegan: ["ladolemono", "tahini sauce", "herb oil", "olive tapenade"],
      glutenFree: ["tzatziki", "ladolemono", "herb oil", "yogurt-based sauces"],
      dairyFree: [
        "ladolemono",
        "tomato-based sauce",
        "herb oil",
        "garlic sauce",
      ],
      lowCarb: ["tzatziki", "olive oil dips", "lemon sauce", "herb sauce"],
    },
  },
  cookingTechniques: [
    {
      name: "Psisimo",
      description:
        "Greek-style grilling, often using olive oil, lemon, and herbs",
      elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
      toolsRequired: ["charcoal grill", "skewers", "brush for oil", "tongs"],
      bestFor: ["lamb", "pork", "chicken", "seafood", "vegetables"],
      difficulty: "easy",
    },
    {
      name: "Stifado",
      description: "Slow-cooked stew with pearl onions, wine, and tomatoes",
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "heavy pot",
        "wooden spoon",
        "sharp knife",
        "measuring cups",
      ],
      bestFor: ["beef", "rabbit", "game meat", "octopus"],
      difficulty: "medium",
    },
    {
      name: "Sotirito",
      description: "Shallow frying, often used for vegetables and fritters",
      elementalProperties: { Fire: 0.5, Air: 0.3, Earth: 0.1, Water: 0.1 },
      toolsRequired: [
        "heavy-bottomed pan",
        "slotted spoon",
        "paper towels",
        "thermometer",
      ],
      bestFor: ["zucchini fritters", "eggplant", "fish", "meatballs"],
      difficulty: "medium",
    },
    {
      name: "Yiachni",
      description: "Braising in tomato sauce with herbs and spices",
      elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
      toolsRequired: [
        "Dutch oven",
        "wooden spoon",
        "sharp knife",
        "measuring spoons",
      ],
      bestFor: ["green beans", "okra", "rabbit", "beef"],
      difficulty: "easy",
    },
    {
      name: "Plasto",
      description:
        "Traditional pie-making technique with layered phyllo or other dough",
      elementalProperties: { Earth: 0.5, Air: 0.3, Water: 0.1, Fire: 0.1 },
      toolsRequired: [
        "baking pan",
        "pastry brush",
        "rolling pin",
        "sharp knife",
      ],
      bestFor: ["spinach pie", "cheese pie", "meat pie", "vegetable pie"],
      difficulty: "hard",
    },
  ],
  regionalCuisines: {
    crete: {
      name: "Cretan Cuisine",
      description:
        "Focused on local ingredients, wild greens, olive oil, and rustic preparation methods",
      signature: ["dakos", "gamopilafo", "staka", "sfakian pie"],
      elementalProperties: { Earth: 0.5, Air: 0.2, Fire: 0.2, Water: 0.1 },
      astrologicalInfluences: ["Saturn", "Jupiter", "Taurus"],
      seasonality: "all",
    },
    macedonia: {
      name: "Macedonian Cuisine",
      description:
        "Northern Greek cuisine with strong Balkan influences and hearty dishes",
      signature: ["bougatsa", "pastitsada", "gigantes plaki", "trahana soup"],
      elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Saturn", "Mars", "Capricorn"],
      seasonality: "all",
    },
    cyclades: {
      name: "Cycladic Cuisine",
      description:
        "Island cuisine featuring seafood, local cheeses, and sun-dried ingredients",
      signature: [
        "fava dip",
        "kakavia fish soup",
        "matsata pasta",
        "louza cured pork",
      ],
      elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
      astrologicalInfluences: ["Neptune", "Moon", "Pisces"],
      seasonality: "all",
    },
    peloponnese: {
      name: "Peloponnesian Cuisine",
      description:
        "Rich in olive oil, citrus, and slow-cooked meat and bean dishes",
      signature: [
        "rooster kokkinisto",
        "diples",
        "kagianas",
        "lagoto rabbit stew",
      ],
      elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
      astrologicalInfluences: ["Mars", "Venus", "Aries"],
      seasonality: "all",
    },
  },
  elementalProperties: {
    Earth: 0.4,
    Water: 0.3,
    Fire: 0.2,
    Air: 0.1,
  },
};

export default greek;
