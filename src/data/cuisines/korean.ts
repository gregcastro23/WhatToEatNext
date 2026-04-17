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

          alchemicalProperties: {"Spirit":2.01,"Essence":3.02,"Matter":3.49,"Substance":2.9},
          thermodynamicProperties: {"heat":0.0386,"entropy":0.2441,"reactivity":1.3603,"gregsEnergy":-0.2934,"kalchm":0.0666,"monica":0.5486},
          substitutions: [{"originalIngredient":"Butter","substituteOptions":["Gochujang (for heat)","Omit for traditional"]}],
            nutritionPerServing: {"calories":18,"proteinG":0,"carbsG":0,"fatG":2,"fiberG":0,"sodiumMg":0,"sugarG":0,"vitamins":["Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["0","1","2"]}
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

          alchemicalProperties: {"Spirit":2.15,"Essence":2.88,"Matter":2.82,"Substance":2.44},
          thermodynamicProperties: {"heat":0.0567,"entropy":0.2468,"reactivity":2.0417,"gregsEnergy":-0.4472,"kalchm":0.6651,"monica":-0.0188},
          substitutions: [{"originalIngredient":"Minced vegetables","substituteOptions":["Abalone (for Jeonbokjuk)","Minced beef"]}],
            nutritionPerServing: {"calories":339,"proteinG":62,"carbsG":0,"fatG":8,"fiberG":0,"sodiumMg":148,"sugarG":0,"vitamins":["Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["Selenium","Phosphorus","Zinc","0","1","2"]}
        },
      ],
      summer: [
        {
          name: "Kong Guksu",
          description: "A quintessential Korean summer dish of thin wheat noodles served in an ice-cold, creamy broth made from ground soybeans. The raw soybeans are soaked, blanched, and blended into a silky, subtly nutty liquid that envelops the noodles in a refreshing, protein-rich cloud. The chilled temperature and pale white broth make it a meditative summer food prized for cooling the body through the theory of hot-foods-fighting-heat.",
          details: {"cuisine":"Korean","prepTimeMinutes":30,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"None","season":["summer"]},
          ingredients: [{"amount":1.5,"unit":"cups","name":"Dried soybeans","notes":"Soaked overnight in cold water."},{"amount":200,"unit":"g","name":"Somyeon (thin wheat noodles)","notes":"Or somen noodles."},{"amount":2,"unit":"cups","name":"Ice water","notes":"For blending the soybean broth."},{"amount":1,"unit":"tsp","name":"Salt","notes":"To season the broth."},{"amount":0.5,"unit":"tsp","name":"Sesame seeds","notes":"Toasted, for garnish."},{"amount":0.25,"unit":"whole","name":"Cucumber","notes":"Julienned thinly for topping."},{"amount":4,"unit":"cubes","name":"Ice","notes":"Served directly in the bowl to keep the broth frigid."}],
          instructions: ["Step 1: The Soybean Preparation. Drain the soaked soybeans. Blanch them in boiling water for 5 minutes, then drain and rinse under cold water. Rub them together to remove as many skins as possible; the white interior produces a cleaner, brighter broth.","Step 2: The Blending. Add the peeled soybeans and 2 cups of ice-cold water to a high-powered blender. Blend on maximum speed for 2 full minutes until the mixture is absolutely smooth and uniformly white. Strain through a fine-mesh sieve. Season with salt. Refrigerate until ice cold.","Step 3: The Noodles. Boil the somyeon in vigorously salted water for 2-3 minutes. Drain immediately and rinse repeatedly and aggressively under cold running water to stop cooking and remove surface starch. The noodles must be completely cold.","Step 4: The Assembly. Twist the cold noodles into a neat nest and place them in a deep, chilled bowl. Pour the ice-cold soybean broth generously over the noodles.","Step 5: The Finish. Top with the julienned cucumber, a pinch of toasted sesame seeds, and two or three ice cubes directly in the bowl. Serve immediately while the broth is as cold as possible."],
          classifications: {"mealType":["breakfast","lunch"],"cookingMethods":["boiling","blending"]},
          elementalProperties: {"Fire":0.05,"Water":0.55,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","taurus"],"lunarPhases":["Waning Crescent"]},

          alchemicalProperties: {"Spirit":1.2,"Essence":2.32,"Matter":3.01,"Substance":2.43},
          thermodynamicProperties: {"heat":0.019,"entropy":0.1926,"reactivity":1.1904,"gregsEnergy":-0.2103,"kalchm":0.0368,"monica":0.0922},
          substitutions: [{"originalIngredient":"Somyeon noodles","substituteOptions":["Buckwheat noodles","Rice noodles"]},{"originalIngredient":"Soybeans","substituteOptions":["Black soybeans for a grey broth"]}],
            nutritionPerServing: {"calories":2,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sodiumMg":0,"sugarG":0,"vitamins":[],"minerals":[]}
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

          alchemicalProperties: {"Spirit":0.3,"Essence":0.31,"Matter":0.22,"Substance":0.17},
          thermodynamicProperties: {"heat":0.0578,"entropy":0.1558,"reactivity":0.8715,"gregsEnergy":-0.078,"kalchm":0.914,"monica":0.2786},
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

          alchemicalProperties: {"Spirit":2.59,"Essence":3.73,"Matter":3.28,"Substance":2.99},
          thermodynamicProperties: {"heat":0.0642,"entropy":0.2905,"reactivity":2.5439,"gregsEnergy":-0.6749,"kalchm":1.2263,"monica":0.3064},
          substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Canned tuna","More tofu (vegan)"]}],
            nutritionPerServing: {"calories":70,"proteinG":7,"carbsG":4,"fatG":3,"fiberG":1,"sodiumMg":16,"sugarG":2,"vitamins":["Vitamin thiamin","Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin riboflavin","Vitamin K","Vitamin folate","Vitamin C"],"minerals":["Selenium","Zinc","Phosphorus","Iron","Potassium","Manganese"]}
        },
      ],
      summer: [
        {
          name: "Naengmyeon",
          description: "The definitive Korean cold noodle dish originating from Pyongyang. Long, elastic buckwheat noodles are served in an intensely chilled, crystal-clear beef and dongchimi (radish water kimchi) broth, topped with thin slices of chilled beef brisket, julienned cucumber, half a hard-boiled egg, and a disc of water kimchi radish. The broth is sharp, subtly sour, and deeply savory, and traditionally mustard and vinegar are added tableside to modulate the experience.",
          details: {"cuisine":"Korean","prepTimeMinutes":60,"cookTimeMinutes":90,"baseServingSize":2,"spiceLevel":"Mild","season":["summer"]},
          ingredients: [{"amount":200,"unit":"g","name":"Naengmyeon noodles","notes":"Buckwheat-based, thin and extremely elastic."},{"amount":1,"unit":"lb","name":"Beef brisket","notes":"Simmered whole until tender, then chilled and sliced paper-thin."},{"amount":4,"unit":"cups","name":"Beef broth","notes":"From the brisket, chilled to near-freezing, skimmed of all fat."},{"amount":1,"unit":"cup","name":"Dongchimi brine","notes":"Radish water kimchi liquid, for tartness in the broth."},{"amount":1,"unit":"whole","name":"Cucumber","notes":"Julienned into thin matchsticks."},{"amount":2,"unit":"large","name":"Eggs","notes":"Hard-boiled, halved."},{"amount":1,"unit":"tbsp","name":"Korean mustard","notes":"Served on the side for tableside addition."},{"amount":1,"unit":"tbsp","name":"Rice vinegar","notes":"Served on the side for tableside addition."}],
          instructions: ["Step 1: The Broth. Simmer the beef brisket in water with onion, garlic, and ginger for 90 minutes. Remove the brisket; slice thinly when cold. Strain and completely chill the broth. Combine 3 parts beef broth with 1 part dongchimi brine; taste for seasoning. The finished broth must be ice cold, ideally with ice crystals forming on the surface.","Step 2: The Noodles. Cook the naengmyeon noodles in vigorously boiling water for 3-4 minutes, stirring to prevent clumping. The noodles will remain extremely elastic and chewy. Drain and rinse repeatedly and violently under ice-cold running water, kneading them to remove starch.","Step 3: The Assembly. Form the cold noodles into a tight nest at the center of a deep, chilled metal bowl. Pour the near-frozen broth over the noodles until they are half-submerged.","Step 4: The Toppings. Arrange the sliced brisket, julienned cucumber, and the egg half on top of the noodle mound. Place a disc of water kimchi radish on the side.","Step 5: The Finish. Add 2-3 ice cubes directly into the broth to keep it at maximum coldness. Serve with small dishes of mustard and vinegar on the side; the diner adds both to taste, customizing the sharp, sour, mustardy edge of each bite."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["boiling","simmering"]},
          elementalProperties: {"Fire":0.1,"Water":0.55,"Earth":0.25,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Saturn"],"signs":["cancer","capricorn"],"lunarPhases":["Waning Gibbous"]},

          alchemicalProperties: {"Spirit":2.06,"Essence":2.98,"Matter":4.11,"Substance":4.03},
          thermodynamicProperties: {"heat":0.0294,"entropy":0.3294,"reactivity":1.5617,"gregsEnergy":-0.485,"kalchm":0.0013,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Beef brisket","substituteOptions":["Chicken breast","Tofu for vegetarian"]},{"originalIngredient":"Dongchimi brine","substituteOptions":["Diluted apple cider vinegar with a pinch of sugar"]}],
            nutritionPerServing: {"calories":539,"proteinG":55,"carbsG":1,"fatG":33,"fiberG":0,"sodiumMg":150,"sugarG":0,"vitamins":["Vitamin B12","Vitamin B6","Vitamin niacin","Vitamin riboflavin","Vitamin thiamin"],"minerals":["Zinc","Iron","Phosphorus","Selenium","Magnesium"]}
        },
      ],
      winter: [
        {
          name: "Tteokguk",
          description: "The ritual New Year rice cake soup eaten on Seollal (Korean Lunar New Year), symbolically granting a year of age with each bowl. Thin oval discs of garaetteok (cylindrical rice cake) are simmered in a clear, golden beef broth made from brisket and dried anchovies until they become tender and slightly chewy, absorbing the savory broth. The clean, white rounds represent coins and purity for the coming year.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["winter"]},
          ingredients: [{"amount":3,"unit":"cups","name":"Garaetteok (sliced rice cakes)","notes":"Oval-cut slices, soaked in cold water for 30 minutes if dried."},{"amount":6,"unit":"cups","name":"Beef and anchovy stock","notes":"Clear, golden broth made from brisket and dried anchovies."},{"amount":0.5,"unit":"lb","name":"Beef brisket","notes":"Simmered in the stock, then hand-shredded into thin strips."},{"amount":2,"unit":"large","name":"Eggs","notes":"Beaten, then pan-fried into a thin omelet and julienned into ribbons."},{"amount":2,"unit":"sheets","name":"Gim (roasted seaweed)","notes":"Crumbled or cut into thin strips for garnish."},{"amount":2,"unit":"stalks","name":"Scallions","notes":"Sliced thinly on a diagonal."},{"amount":1,"unit":"tbsp","name":"Soup soy sauce","notes":"Guk-ganjang, light, salty, and umami for seasoning."},{"amount":1,"unit":"tsp","name":"Sesame oil","notes":"A few drops at the end."}],
          instructions: ["Step 1: The Stock. Simmer the beef brisket with dried anchovies, a piece of kelp, and a halved onion in 7 cups of water for 30 minutes. Remove the brisket; shred it thinly by hand. Strain the broth through a fine sieve; it should be completely clear and golden.","Step 2: The Egg Garnish. Separate 2 eggs into yolks and whites. Cook each separately in a lightly oiled pan into thin, flat sheets. Stack and cut both into thin ribbons (jidan). Set aside.","Step 3: The Rice Cakes. Bring the clear broth back to a rolling boil. Drain the soaked tteok slices and add them to the boiling broth. Simmer for 5-7 minutes until they are tender but still slightly resistant, having absorbed the flavor of the broth.","Step 4: The Seasoning. Season the broth carefully with soup soy sauce and salt. The broth must be clean-tasting and deeply savory without being heavy.","Step 5: The Finish. Ladle the soup and tteok into bowls. Top with the shredded brisket, the yellow and white egg ribbons arranged separately, the crumbled gim, and the scallions. Finish with a few drops of sesame oil and serve immediately."],
          classifications: {"mealType":["lunch","dinner","breakfast"],"cookingMethods":["simmering","boiling"]},
          elementalProperties: {"Fire":0.15,"Water":0.5,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Saturn"],"signs":["capricorn","cancer"],"lunarPhases":["New Moon"]},

          alchemicalProperties: {"Spirit":2.42,"Essence":3.51,"Matter":4.12,"Substance":3.83},
          thermodynamicProperties: {"heat":0.0388,"entropy":0.2892,"reactivity":1.6953,"gregsEnergy":-0.4515,"kalchm":0.0119,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Beef brisket","substituteOptions":["Chicken for a lighter broth","Omit for vegetarian with kelp-only stock"]},{"originalIngredient":"Garaetteok","substituteOptions":["Mandu (dumplings) for Tteok-mandu-guk"]}],
            nutritionPerServing: {"calories":379,"proteinG":36,"carbsG":1,"fatG":25,"fiberG":0,"sodiumMg":99,"sugarG":0,"vitamins":["Vitamin B12","Vitamin B6","Vitamin niacin","Vitamin riboflavin","Vitamin thiamin","Vitamin K","Vitamin folate","Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["Zinc","Iron","Phosphorus","Selenium","Magnesium","Manganese","0","1","2"]}
        },
      ],
    },
    dinner: {
      all: [
        {
          "name": "Authentic Bibimbap",
          "description": "The quintessential Korean 'mixed rice' bowl, representing the five cardinal colors and elements of traditional Korean philosophy. A colorful array of individually seasoned vegetables (namul), marinated beef, and a fried egg are arranged over a bed of short-grain rice, intended to be unified by a fierce mixing with savory gochujang paste.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 15,
            "baseServingSize": 2,
            "spiceLevel": "Medium",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 2, "unit": "cups", "name": "short-grain white rice", "notes": "Cooked and warm." },
            { "amount": 150, "unit": "g", "name": "beef ribeye", "notes": "Thinly sliced, marinated in soy, sugar, and sesame oil." },
            { "amount": 1, "unit": "bunch", "name": "spinach", "notes": "Blanched and seasoned with sesame oil and salt." },
            { "amount": 1, "unit": "cup", "name": "soybean sprouts", "notes": "Blanched and seasoned." },
            { "amount": 1, "unit": "medium", "name": "carrot", "notes": "Julienned and lightly sautéed." },
            { "amount": 1, "unit": "medium", "name": "zucchini", "notes": "Sliced into half-moons and sautéed." },
            { "amount": 4, "unit": "whole", "name": "shiitake mushrooms", "notes": "Sliced and sautéed." },
            { "amount": 2, "unit": "large", "name": "eggs", "notes": "Fried sunny-side up." },
            { "amount": 2, "unit": "tbsp", "name": "gochujang", "notes": "The primary flavor binder." }
          ],
          "instructions": [
            "Step 1: Prepare each vegetable (namul) individually. Blanch the spinach and sprouts; squeeze dry and season. Sauté the carrots, zucchini, and mushrooms with a pinch of salt.",
            "Step 2: Sauté the marinated beef over high heat until browned and caramelized.",
            "Step 3: Place a generous serving of rice in a deep bowl.",
            "Step 4: Arrange the beef and prepared vegetables in distinct radial sections on top of the rice, following the cardinal color patterns.",
            "Step 5: Place the fried egg in the center. Serve with gochujang and a drizzle of sesame oil.",
            "Step 6: To eat, add the gochujang and mix everything vigorously until the rice is uniformly coated and the flavors are unified."
          ],
          "classifications": {
            "mealType": ["dinner", "lunch"],
            "cookingMethods": ["sautéing", "blanching", "mixing"]
          },
          "elementalProperties": { "Fire": 0.2, "Water": 0.2, "Earth": 0.4, "Air": 0.2 },
          "astrologicalAffinities": {
            "planets": ["Sun", "Earth"],
            "signs": ["Virgo", "Leo"],
            "lunarPhases": ["Full Moon"]
          },
          "nutritionPerServing": {
            "calories": 580, "proteinG": 28, "carbsG": 75, "fatG": 18, "fiberG": 8, "sodiumMg": 850, "sugarG": 12,
            "vitamins": ["Vitamin A", "Vitamin C", "Vitamin K"],
            "minerals": ["Iron", "Manganese", "Potassium"]
          },
          "alchemicalProperties": { "Spirit": 5, "Essence": 7, "Matter": 8, "Substance": 6 },
          "thermodynamicProperties": { "heat": 0.04, "entropy": 0.35, "reactivity": 1.8, "gregsEnergy": -0.5, "kalchm": 0.8, "monica": 0.6 },
          "substitutions": []
        },
        {
          "name": "Authentic Kimchi Jjigae",
          "description": "A deeply soul-satisfying, fiercely bubbling Korean stew. This dish transforms aged, sour kimchi into a complex, fiery broth enriched by the fatty rendering of pork belly and the silky texture of tofu. It is the definitive comfort food of the Korean peninsula.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 30,
            "baseServingSize": 2,
            "spiceLevel": "High",
            "season": ["all", "winter"]
          },
          "ingredients": [
            { "amount": 2, "unit": "cups", "name": "aged sour kimchi", "notes": "Must be at least 2-3 weeks old." },
            { "amount": 200, "unit": "g", "name": "pork belly", "notes": "Sliced into bite-sized strips." },
            { "amount": 0.5, "unit": "block", "name": "firm tofu", "notes": "Sliced into rectangles." },
            { "amount": 2, "unit": "tbsp", "name": "gochugaru", "notes": "Korean red chili flakes." },
            { "amount": 1, "unit": "tbsp", "name": "soup soy sauce", "notes": "For deep umami." },
            { "amount": 2, "unit": "stalks", "name": "scallions", "notes": "Sliced diagonally." },
            { "amount": 1, "unit": "tsp", "name": "sugar", "notes": "To balance the acidity of the kimchi." },
            { "amount": 3, "unit": "cups", "name": "anchovy-kelp stock", "notes": "The traditional broth base." }
          ],
          "instructions": [
            "Step 1: Sauté the pork belly in a heavy pot (preferably earthenware) until the fat renders and meat starts to brown.",
            "Step 2: Add the sour kimchi and sauté in the pork fat for 5-7 minutes until softened.",
            "Step 3: Stir in the gochugaru, sugar, and soy sauce, ensuring the kimchi is well-coated.",
            "Step 4: Pour in the anchovy-kelp stock. Bring to a vigorous boil, then reduce heat and simmer for 20 minutes.",
            "Step 5: Lay the tofu slices and scallions on top. Simmer for another 5 minutes.",
            "Step 6: Serve bubbling hot with plain steamed rice. The broth should be rich, sour, and spicy."
          ],
          "classifications": {
            "mealType": ["dinner"],
            "cookingMethods": ["stewing", "sautéing"]
          },
          "elementalProperties": { "Fire": 0.6, "Water": 0.25, "Earth": 0.1, "Air": 0.05 },
          "astrologicalAffinities": {
            "planets": ["Mars", "Pluto"],
            "signs": ["Aries", "Scorpio"],
            "lunarPhases": ["Waning Gibbous"]
          },
          "nutritionPerServing": {
            "calories": 420, "proteinG": 22, "carbsG": 18, "fatG": 28, "fiberG": 4, "sodiumMg": 1200, "sugarG": 6,
            "vitamins": ["Vitamin C", "Vitamin K", "Vitamin B12"],
            "minerals": ["Calcium", "Iron", "Selenium"]
          },
          "alchemicalProperties": { "Spirit": 6, "Essence": 8, "Matter": 7, "Substance": 5 },
          "thermodynamicProperties": { "heat": 0.09, "entropy": 0.45, "reactivity": 2.5, "gregsEnergy": -0.7, "kalchm": 1.2, "monica": 0.8 },
          "substitutions": []
        },
        {
          "name": "Authentic Bulgogi",
          "description": "Thinly sliced, premium beef marinated in a sweet and savory emulsion of soy sauce, toasted sesame oil, and Asian pear. The pear contains natural enzymes that tenderize the meat, while the high-heat grilling creates a charred, lacquered finish that is the hallmark of Korean barbecue.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 60,
            "cookTimeMinutes": 10,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 600, "unit": "g", "name": "beef ribeye or sirloin", "notes": "Sliced paper-thin." },
            { "amount": 0.5, "unit": "cup", "name": "soy sauce", "notes": "The savory core." },
            { "amount": 3, "unit": "tbsp", "name": "brown sugar", "notes": "For caramelization." },
            { "amount": 0.5, "unit": "whole", "name": "Asian pear", "notes": "Grated for tenderization." },
            { "amount": 2, "unit": "tbsp", "name": "toasted sesame oil", "notes": "For the signature aroma." },
            { "amount": 4, "unit": "cloves", "name": "garlic", "notes": "Minced." },
            { "amount": 1, "unit": "tbsp", "name": "toasted sesame seeds", "notes": "For garnish." },
            { "amount": 2, "unit": "stalks", "name": "scallions", "notes": "Finely chopped." }
          ],
          "instructions": [
            "Step 1: Whisk together soy sauce, sugar, grated pear, sesame oil, garlic, and scallions to create the marinade.",
            "Step 2: Add the thinly sliced beef and massage the marinade into each piece. Refrigerate for at least 1 hour.",
            "Step 3: Heat a heavy cast-iron skillet or grill pan until smoking hot.",
            "Step 4: Grill the beef in batches to avoid crowding. Cook for 1-2 minutes per side until charred and caramelized.",
            "Step 5: Garnish with toasted sesame seeds.",
            "Step 6: Serve with lettuce leaves (ssam), rice, and ssamjang for the full experience."
          ],
          "classifications": {
            "mealType": ["dinner"],
            "cookingMethods": ["marinating", "grilling"]
          },
          "elementalProperties": { "Fire": 0.4, "Water": 0.1, "Earth": 0.4, "Air": 0.1 },
          "astrologicalAffinities": {
            "planets": ["Sun", "Venus"],
            "signs": ["Leo", "Taurus"],
            "lunarPhases": ["Full Moon"]
          },
          "nutritionPerServing": {
            "calories": 450, "proteinG": 35, "carbsG": 18, "fatG": 24, "fiberG": 1, "sodiumMg": 950, "sugarG": 14,
            "vitamins": ["Vitamin B12", "Niacin"],
            "minerals": ["Zinc", "Iron", "Selenium"]
          },
          "alchemicalProperties": { "Spirit": 4, "Essence": 6, "Matter": 7, "Substance": 5 },
          "thermodynamicProperties": { "heat": 0.05, "entropy": 0.3, "reactivity": 1.7, "gregsEnergy": -0.4, "kalchm": 0.9, "monica": 0.5 },
          "substitutions": []
        },
        {
          "name": "Authentic Japchae",
          "description": "A festive, highly elastic stir-fry of translucent sweet potato starch noodles (dangmyeon). Each component—beef, spinach, carrots, and mushrooms—is individually prepared to preserve its unique color and texture before being unified in a dark, glossy sesame-soy glaze.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 40,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 250, "unit": "g", "name": "dangmyeon", "notes": "Sweet potato glass noodles." },
            { "amount": 150, "unit": "g", "name": "beef sirloin", "notes": "Thinly sliced into strips." },
            { "amount": 2, "unit": "cups", "name": "spinach", "notes": "Blanched and seasoned." },
            { "amount": 1, "unit": "medium", "name": "carrot", "notes": "Julienned." },
            { "amount": 1, "unit": "small", "name": "onion", "notes": "Sliced." },
            { "amount": 4, "unit": "whole", "name": "shiitake mushrooms", "notes": "Sliced." },
            { "amount": 4, "unit": "tbsp", "name": "soy sauce", "notes": "For the final toss." },
            { "amount": 2, "unit": "tbsp", "name": "sesame oil", "notes": "Essential for the characteristic gloss." },
            { "amount": 1, "unit": "tbsp", "name": "sugar", "notes": "For savory-sweet balance." }
          ],
          "instructions": [
            "Step 1: Boil the glass noodles for 7 minutes until chewy and translucent. Rinse in cold water and cut into shorter lengths.",
            "Step 2: Individually sauté the onions, carrots, and mushrooms with a pinch of salt until tender.",
            "Step 3: Blanch the spinach, squeeze dry, and season with sesame oil and salt.",
            "Step 4: Stir-fry the beef strips until cooked through.",
            "Step 5: Combine all ingredients in a large bowl. Add soy sauce, sugar, and sesame oil.",
            "Step 6: Mix aggressively by hand (using gloves) to ensure every noodle is lacquered in the sauce. Garnish with sesame seeds."
          ],
          "classifications": {
            "mealType": ["dinner", "side"],
            "cookingMethods": ["boiling", "stir-frying", "tossing"]
          },
          "elementalProperties": { "Fire": 0.1, "Water": 0.2, "Earth": 0.5, "Air": 0.2 },
          "astrologicalAffinities": {
            "planets": ["Venus", "Mercury"],
            "signs": ["Libra", "Taurus"],
            "lunarPhases": ["First Quarter"]
          },
          "nutritionPerServing": {
            "calories": 380, "proteinG": 12, "carbsG": 65, "fatG": 10, "fiberG": 4, "sodiumMg": 780, "sugarG": 10,
            "vitamins": ["Vitamin A", "Vitamin K", "Vitamin B6"],
            "minerals": ["Iron", "Potassium", "Manganese"]
          },
          "alchemicalProperties": { "Spirit": 5, "Essence": 6, "Matter": 7, "Substance": 4 },
          "thermodynamicProperties": { "heat": 0.03, "entropy": 0.2, "reactivity": 1.4, "gregsEnergy": -0.3, "kalchm": 0.7, "monica": 0.4 },
          "substitutions": []
        },
        {
          "name": "Authentic Galbi-gui",
          "description": "The crown jewel of Korean barbecue: beef short ribs butterfly-cut across the bone and marinated in a rich, complex syrup. The high heat of the grill melts the heavy marbling and connective tissue, resulting in a meat that is both tender and intensely flavorful, with a smoky, caramelized exterior.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 120,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 1, "unit": "kg", "name": "beef short ribs", "notes": "LA-style cut (across the bone) or butterfly cut." },
            { "amount": 0.5, "unit": "cup", "name": "soy sauce", "notes": "The foundation of the marinade." },
            { "amount": 0.5, "unit": "whole", "name": "Asian pear", "notes": "Grated for enzyme action." },
            { "amount": 3, "unit": "tbsp", "name": "honey", "notes": "For a deep, natural sweetness." },
            { "amount": 2, "unit": "tbsp", "name": "mirin", "notes": "For acidity and shine." },
            { "amount": 1, "unit": "tbsp", "name": "fresh ginger", "notes": "Grated." },
            { "amount": 4, "unit": "cloves", "name": "garlic", "notes": "Minced." },
            { "amount": 2, "unit": "tbsp", "name": "toasted sesame oil", "notes": "For the finishing aroma." }
          ],
          "instructions": [
            "Step 1: Soak the short ribs in cold water for 1 hour to remove excess blood, then pat dry.",
            "Step 2: Combine soy sauce, pear, honey, mirin, ginger, garlic, and sesame oil in a blender and pulse until smooth.",
            "Step 3: Marinate the ribs for at least 4 hours, ideally overnight, in the refrigerator.",
            "Step 4: Grill over high-heat charcoal or a very hot grill pan.",
            "Step 5: Sear quickly to achieve a dark char without overcooking the center. Flip only once if possible.",
            "Step 6: Cut into bite-sized pieces with kitchen scissors and serve immediately with ssam set."
          ],
          "classifications": {
            "mealType": ["dinner"],
            "cookingMethods": ["marinating", "grilling"]
          },
          "elementalProperties": { "Fire": 0.5, "Water": 0.1, "Earth": 0.3, "Air": 0.1 },
          "astrologicalAffinities": {
            "planets": ["Mars", "Sun"],
            "signs": ["Aries", "Leo"],
            "lunarPhases": ["Full Moon"]
          },
          "nutritionPerServing": {
            "calories": 620, "proteinG": 42, "carbsG": 24, "fatG": 38, "fiberG": 1, "sodiumMg": 1150, "sugarG": 18,
            "vitamins": ["Vitamin B12", "Niacin", "B6"],
            "minerals": ["Zinc", "Iron", "Selenium", "Phosphorus"]
          },
          "alchemicalProperties": { "Spirit": 6, "Essence": 9, "Matter": 8, "Substance": 7 },
          "thermodynamicProperties": { "heat": 0.08, "entropy": 0.4, "reactivity": 2.2, "gregsEnergy": -0.6, "kalchm": 1.5, "monica": 0.9 },
          "substitutions": []
        },
        {
          "name": "Authentic Haemul Pajeon",
          "description": "A grand, oil-fried pancake dominated by whole stalks of sweet scallions and a bounty of fresh seafood. The batter is kept light to emphasize the crispy, lattice-like structure that forms when the seafood juices emulsify with the hot oil on a griddle.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 15,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": ["all", "rainy days"]
          },
          "ingredients": [
            { "amount": 1, "unit": "bunch", "name": "green onions", "notes": "Left whole and trimmed." },
            { "amount": 200, "unit": "g", "name": "mixed seafood", "notes": "Shrimp, squid, and clams, chopped." },
            { "amount": 1, "unit": "cup", "name": "Korean pancake mix", "notes": "A blend of wheat and rice flour." },
            { "amount": 0.75, "unit": "cup", "name": "ice cold water", "notes": "Crucial for a crispy result." },
            { "amount": 1, "unit": "large", "name": "egg", "notes": "Poured over the top." },
            { "amount": 1, "unit": "tbsp", "name": "red chili pepper", "notes": "Sliced thinly for visual contrast." },
            { "amount": 0.25, "unit": "cup", "name": "vegetable oil", "notes": "For a semi-fry." }
          ],
          "instructions": [
            "Step 1: Whisk the pancake mix with ice-cold water until just combined; do not overmix.",
            "Step 2: Heat a large amount of oil in a wide pan over medium-high heat.",
            "Step 3: Lay the whole scallions flat in a single layer in the pan.",
            "Step 4: Pour the batter evenly over the scallions, then press the chopped seafood into the wet batter.",
            "Step 5: Crack the egg over the center and spread it slightly. Top with red chili slices.",
            "Step 6: Flip when the bottom is golden and crispy. Press down with a spatula to ensure the seafood sears. Serve with a soy-vinegar dipping sauce."
          ],
          "classifications": {
            "mealType": ["dinner", "snack"],
            "cookingMethods": ["shallow frying"]
          },
          "elementalProperties": { "Fire": 0.4, "Water": 0.2, "Earth": 0.2, "Air": 0.2 },
          "astrologicalAffinities": {
            "planets": ["Moon", "Venus"],
            "signs": ["Cancer", "Libra"],
            "lunarPhases": ["Last Quarter"]
          },
          "nutritionPerServing": {
            "calories": 480, "proteinG": 24, "carbsG": 52, "fatG": 22, "fiberG": 3, "sodiumMg": 820, "sugarG": 4,
            "vitamins": ["Vitamin C", "Vitamin K", "Vitamin B12"],
            "minerals": ["Iron", "Calcium", "Zinc"]
          },
          "alchemicalProperties": { "Spirit": 5, "Essence": 7, "Matter": 6, "Substance": 5 },
          "thermodynamicProperties": { "heat": 0.07, "entropy": 0.3, "reactivity": 2.1, "gregsEnergy": -0.5, "kalchm": 1.1, "monica": 0.7 },
          "substitutions": []
        },
        {
          "name": "Authentic Tteokbokki",
          "description": "The quintessential street food of Seoul. Chewy, cylindrical rice cakes (tteok) are simmered in a thick, vibrant red, sweet-spicy gochujang sauce. As the sauce reduces, it transforms into a glossy, concentrated glaze that perfectly coats the elastic rice cakes and yielding fish cakes.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 20,
            "baseServingSize": 2,
            "spiceLevel": "Hot",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 400, "unit": "g", "name": "garaetteok", "notes": "Short, thick rice cakes." },
            { "amount": 2, "unit": "sheets", "name": "fish cakes (eomuk)", "notes": "Cut into triangles." },
            { "amount": 3, "unit": "tbsp", "name": "gochujang", "notes": "Korean chili paste." },
            { "amount": 1, "unit": "tbsp", "name": "gochugaru", "notes": "Korean chili flakes." },
            { "amount": 2, "unit": "tbsp", "name": "sugar", "notes": "Crucial for the glossy reduction." },
            { "amount": 2, "unit": "cups", "name": "anchovy-kelp stock", "notes": "The flavor base." },
            { "amount": 2, "unit": "stalks", "name": "scallions", "notes": "Cut into 2-inch pieces." },
            { "amount": 2, "unit": "whole", "name": "hard-boiled eggs", "notes": "Traditional accompaniment." }
          ],
          "instructions": [
            "Step 1: In a shallow pan, combine the stock, gochujang, gochugaru, and sugar. Bring to a rolling boil.",
            "Step 2: Add the rice cakes to the bubbling liquid.",
            "Step 3: Simmer over medium-high heat for 10-12 minutes, stirring constantly to prevent the rice cakes from sticking.",
            "Step 4: Once the sauce starts to thicken and turn glossy, add the fish cakes and hard-boiled eggs.",
            "Step 5: Continue to simmer for 3-5 minutes until the sauce has a syrupy consistency.",
            "Step 6: Toss in the scallions right at the end. Serve piping hot, ideally with a side of fried mandu."
          ],
          "classifications": {
            "mealType": ["snack", "dinner"],
            "cookingMethods": ["simmering", "reducing"]
          },
          "elementalProperties": { "Fire": 0.6, "Water": 0.1, "Earth": 0.2, "Air": 0.1 },
          "astrologicalAffinities": {
            "planets": ["Mars", "Pluto"],
            "signs": ["Aries", "Scorpio"],
            "lunarPhases": ["Full Moon"]
          },
          "nutritionPerServing": {
            "calories": 420, "proteinG": 14, "carbsG": 82, "fatG": 5, "fiberG": 3, "sodiumMg": 920, "sugarG": 15,
            "vitamins": ["Vitamin A", "Vitamin C"],
            "minerals": ["Calcium", "Iron"]
          },
          "alchemicalProperties": { "Spirit": 5, "Essence": 6, "Matter": 8, "Substance": 7 },
          "thermodynamicProperties": { "heat": 0.08, "entropy": 0.4, "reactivity": 2.0, "gregsEnergy": -0.6, "kalchm": 0.9, "monica": 0.8 },
          "substitutions": []
        },
        {
          "name": "Authentic Sundubu Jjigae",
          "description": "A violent, bubbling cauldron of extra-soft tofu, characterized by its intense chili oil base and delicate, custard-like texture. This stew is built by toasting chili flakes in sesame oil before adding an oceanic stock, creating a complex, layered heat that is finished with a raw egg cracked into the boiling center.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 15,
            "baseServingSize": 1,
            "spiceLevel": "High",
            "season": ["all", "winter"]
          },
          "ingredients": [
            { "amount": 1, "unit": "tube", "name": "extra-soft tofu", "notes": "Sundubu." },
            { "amount": 0.5, "unit": "cup", "name": "clams or mixed seafood", "notes": "For briney depth." },
            { "amount": 2, "unit": "tbsp", "name": "gochugaru", "notes": "For the chili oil base." },
            { "amount": 1, "unit": "tbsp", "name": "toasted sesame oil", "notes": "To bloom the chili." },
            { "amount": 1, "unit": "cup", "name": "anchovy-kelp stock", "notes": "The broth foundation." },
            { "amount": 1, "unit": "large", "name": "egg", "notes": "To be cracked in at the end." },
            { "amount": 2, "unit": "stalks", "name": "scallions", "notes": "Finely chopped." },
            { "amount": 3, "unit": "cloves", "name": "garlic", "notes": "Minced." }
          ],
          "instructions": [
            "Step 1: In a traditional earthenware pot (ttukbaegi), heat sesame oil over medium-low heat. Add garlic and gochugaru, stirring for 1 minute to create a bright red chili oil.",
            "Step 2: Pour in the anchovy-kelp stock and bring to a rolling boil.",
            "Step 3: Add the mixed seafood and cook until the clams open.",
            "Step 4: Slice the tofu tube and slide the soft chunks into the boiling broth. Do not break them up too much.",
            "Step 5: Boil for 3-5 minutes, allowing the tofu to absorb the spicy oil.",
            "Step 6: Remove from heat while still bubbling fiercely. Immediately crack the raw egg into the center and top with scallions. Serve with rice."
          ],
          "classifications": {
            "mealType": ["dinner"],
            "cookingMethods": ["boiling", "blooming"]
          },
          "elementalProperties": { "Fire": 0.7, "Water": 0.2, "Earth": 0.05, "Air": 0.05 },
          "astrologicalAffinities": {
            "planets": ["Pluto", "Mars"],
            "signs": ["Scorpio", "Aries"],
            "lunarPhases": ["New Moon"]
          },
          "nutritionPerServing": {
            "calories": 320, "proteinG": 24, "carbsG": 12, "fatG": 20, "fiberG": 2, "sodiumMg": 1100, "sugarG": 4,
            "vitamins": ["Vitamin D", "Vitamin B12", "C"],
            "minerals": ["Iodine", "Zinc", "Calcium", "Iron"]
          },
          "alchemicalProperties": { "Spirit": 8, "Essence": 7, "Matter": 6, "Substance": 8 },
          "thermodynamicProperties": { "heat": 0.1, "entropy": 0.5, "reactivity": 2.8, "gregsEnergy": -0.8, "kalchm": 1.3, "monica": 0.5 },
          "substitutions": []
        },
        {
          "name": "Authentic Jajangmyeon",
          "description": "The definitive Korean-Chinese comfort dish. Thick, hand-pulled wheat noodles are submerged in a dark, rich, and slightly sweet sauce made from fried black bean paste (chunjang). The sauce is a dense reduction of pork, onions, and cabbage, yielding a savory intensity that is both nostalgic and profoundly satisfying.",
          "details": {
            "cuisine": "Korean-Chinese",
            "prepTimeMinutes": 20,
            "cookTimeMinutes": 25,
            "baseServingSize": 2,
            "spiceLevel": "None",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 400, "unit": "g", "name": "jajangmyeon noodles", "notes": "Thick, fresh wheat noodles." },
            { "amount": 0.5, "unit": "cup", "name": "chunjang", "notes": "Korean black bean paste." },
            { "amount": 200, "unit": "g", "name": "pork shoulder", "notes": "Cubed small." },
            { "amount": 2, "unit": "cups", "name": "onions", "notes": "Diced large; they provide the sweetness." },
            { "amount": 1, "unit": "cup", "name": "cabbage", "notes": "Diced." },
            { "amount": 1, "unit": "tbsp", "name": "sugar", "notes": "To balance the paste's bitterness." },
            { "amount": 2, "unit": "tbsp", "name": "cornstarch slurry", "notes": "To thicken the sauce." },
            { "amount": 0.5, "unit": "cup", "name": "cucumber", "notes": "Julienned for fresh garnish." }
          ],
          "instructions": [
            "Step 1: Fry the black bean paste (chunjang) in 0.25 cup of oil for 3 minutes over medium heat to remove its bitter edge. Drain and set paste aside.",
            "Step 2: In a wok, sauté the pork until browned. Add the onions and cabbage, cooking until the onions are translucent and slightly caramelized.",
            "Step 3: Stir the fried paste back into the pork and vegetables.",
            "Step 4: Pour in 1 cup of water and the sugar. Simmer for 10 minutes.",
            "Step 5: Stir in the slurry until the sauce is thick, dark, and glossy.",
            "Step 6: Boil the noodles, drain, and place in large bowls. Ladle the thick black sauce over the noodles and top with fresh cucumber. Mix well before eating."
          ],
          "classifications": {
            "mealType": ["dinner", "lunch"],
            "cookingMethods": ["frying", "simmering", "reduction"]
          },
          "elementalProperties": { "Earth": 0.6, "Water": 0.2, "Fire": 0.1, "Air": 0.1 },
          "astrologicalAffinities": {
            "planets": ["Saturn", "Jupiter"],
            "signs": ["Capricorn", "Taurus"],
            "lunarPhases": ["Full Moon"]
          },
          "nutritionPerServing": {
            "calories": 650, "proteinG": 28, "carbsG": 95, "fatG": 18, "fiberG": 6, "sodiumMg": 1050, "sugarG": 12,
            "vitamins": ["Vitamin B1", "B6", "A"],
            "minerals": ["Iron", "Phosphorus", "Potassium"]
          },
          "alchemicalProperties": { "Spirit": 4, "Essence": 5, "Matter": 9, "Substance": 8 },
          "thermodynamicProperties": { "heat": 0.04, "entropy": 0.3, "reactivity": 1.5, "gregsEnergy": -0.4, "kalchm": 0.6, "monica": 0.8 },
          "substitutions": []
        },
        {
          "name": "Authentic Samgyeopsal",
          "description": "The quintessential social dining experience of Korea. Thick-cut strips of high-quality pork belly are grilled unmarinated at the table, allowing the fat to render and crisp the meat. It is a tactile, communal meal centered around the 'ssam'—fresh lettuce wraps containing the hot pork, fermented soybean paste, and sharp aromatics.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 15,
            "cookTimeMinutes": 10,
            "baseServingSize": 2,
            "spiceLevel": "Mild",
            "season": ["all"]
          },
          "ingredients": [
            { "amount": 500, "unit": "g", "name": "pork belly", "notes": "Thick slices, skin-on preferred." },
            { "amount": 1, "unit": "head", "name": "red leaf lettuce", "notes": "For wrapping." },
            { "amount": 0.25, "unit": "cup", "name": "ssamjang", "notes": "Spicy bean paste." },
            { "amount": 4, "unit": "cloves", "name": "garlic", "notes": "Sliced thinly for raw consumption." },
            { "amount": 2, "unit": "whole", "name": "green chilies", "notes": "Sliced." },
            { "amount": 1, "unit": "cup", "name": "aged kimchi", "notes": "To be grilled in the pork fat." },
            { "amount": 2, "unit": "tbsp", "name": "toasted sesame oil", "notes": "With salt and pepper for dipping." }
          ],
          "instructions": [
            "Step 1: Arrange the raw pork, lettuce, ssamjang, and aromatics on the table around a central grill.",
            "Step 2: Heat the grill until smoking. Lay the pork belly strips flat. Do not season; let the meat speak for itself.",
            "Step 3: Grill until the bottom is deeply browned and crispy. Flip only once.",
            "Step 4: Use kitchen scissors to cut the long strips into bite-sized pieces directly on the grill. Move the aged kimchi to the edge of the grill to fry in the rendering pork fat.",
            "Step 5: Dip a piece of hot pork into the salted sesame oil.",
            "Step 6: Place the meat in a lettuce leaf, add a smear of ssamjang, a slice of garlic, and a piece of grilled kimchi. Wrap tightly and eat in one bite."
          ],
          "classifications": {
            "mealType": ["dinner", "social"],
            "cookingMethods": ["grilling", "rendering"]
          },
          "elementalProperties": { "Fire": 0.5, "Water": 0.05, "Earth": 0.35, "Air": 0.1 },
          "astrologicalAffinities": {
            "planets": ["Mars", "Venus"],
            "signs": ["Taurus", "Aries"],
            "lunarPhases": ["Waxing Gibbous"]
          },
          "nutritionPerServing": {
            "calories": 520, "proteinG": 28, "carbsG": 8, "fatG": 42, "fiberG": 2, "sodiumMg": 650, "sugarG": 2,
            "vitamins": ["Vitamin B1", "B12", "D"],
            "minerals": ["Selenium", "Zinc", "Iron", "Potassium"]
          },
          "alchemicalProperties": { "Spirit": 5, "Essence": 4, "Matter": 6, "Substance": 5 },
          "thermodynamicProperties": { "heat": 0.09, "entropy": 0.4, "reactivity": 2.2, "gregsEnergy": -0.7, "kalchm": 1.4, "monica": 0.8 },
          "substitutions": []
        },
        {
          "name": "Authentic Bibimbap (Dolsot)",
          "description": "The definitive Korean mixed rice bowl. Served in a sizzling hot stone pot (dolsot), it features perfectly arranged namul (sautéed vegetables), marinated beef, and a raw egg yolk that cooks as you aggressively mix it with gochujang.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 45,
            "cookTimeMinutes": 15,
            "baseServingSize": 4,
            "spiceLevel": "Medium",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 4,
              "unit": "cups",
              "name": "short-grain rice",
              "notes": "Cooked"
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "beef ribeye",
              "notes": "Thinly sliced, marinated in soy/sugar/sesame"
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "spinach",
              "notes": "Blanched, seasoned with sesame oil"
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "bean sprouts",
              "notes": "Blanched, seasoned"
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "carrots",
              "notes": "Julienned, lightly sautéed"
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "shiitake mushrooms",
              "notes": "Sliced and sautéed"
            },
            {
              "amount": 4,
              "unit": "whole",
              "name": "egg yolks",
              "notes": "Or sunny-side up eggs"
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "gochujang",
              "notes": "Korean chili paste, for serving"
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sesame oil",
              "notes": "For coating the stone pots"
            }
          ],
          "instructions": [
            "Step 1: Prepare all the namul (vegetables) separately by blanching or sautéing them, seasoning each with garlic, soy sauce, and sesame oil.",
            "Step 2: Sauté the marinated beef over high heat until cooked.",
            "Step 3: Coat the inside of stone pots (dolsot) generously with sesame oil. Heat on the stove until smoking.",
            "Step 4: Press 1 cup of cooked rice into the bottom of each pot. Let it crackle and toast for 5 minutes to form a crust (nurungji).",
            "Step 5: Artfully arrange the beef and vegetables on top of the rice in distinct sections.",
            "Step 6: Drop the egg yolk in the center. Serve immediately while sizzling, with gochujang on the side for the diner to mix in vigorously."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "dinner"
            ],
            "cookingMethods": [
              "sautéing",
              "toasting"
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
              "Sun",
              "Earth"
            ],
            "signs": [
              "Leo",
              "Virgo"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 580,
            "proteinG": 22,
            "carbsG": 75,
            "fatG": 18,
            "fiberG": 6,
            "sodiumMg": 850,
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
          "alchemicalProperties": {
            "Spirit": 5,
            "Essence": 5,
            "Matter": 7,
            "Substance": 6
          },
          "thermodynamicProperties": {
            "heat": 0.06,
            "entropy": 0.4,
            "reactivity": 1.8,
            "gregsEnergy": -0.5,
            "kalchm": 0.04,
            "monica": 0.6
          },
          "substitutions": []
        },
        {
          "name": "Authentic Kimchi Jjigae",
          "description": "A fiercely bubbling, fiercely sour, and fiercely spicy stew built on aged, over-fermented kimchi, fatty pork belly, and tofu.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 25,
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
              "name": "aged sour kimchi",
              "notes": "Must be old and pungent, chopped"
            },
            {
              "amount": 200,
              "unit": "g",
              "name": "pork belly",
              "notes": "Cut into bite-sized strips"
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "kimchi juice",
              "notes": "Essential for depth"
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "gochugaru (Korean chili flakes)",
              "notes": "For heat and color"
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "gochujang",
              "notes": "For body"
            },
            {
              "amount": 1,
              "unit": "block",
              "name": "firm tofu",
              "notes": "Sliced"
            },
            {
              "amount": 2,
              "unit": "cups",
              "name": "anchovy-kelp stock or water",
              "notes": "For the broth"
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "scallions",
              "notes": "Chopped"
            }
          ],
          "instructions": [
            "Step 1: In a heavy pot (ttukbaegi preferred), sear the pork belly until its fat begins to render.",
            "Step 2: Add the sour kimchi and sauté in the pork fat for 5 minutes to mellow its bite.",
            "Step 3: Stir in the gochugaru, gochujang, and kimchi juice.",
            "Step 4: Pour in the stock. Bring to a boil, then cover and vigorously boil/simmer for 15 minutes to marry the flavors.",
            "Step 5: Fan the sliced tofu over the top of the stew and cook for another 5 minutes.",
            "Step 6: Garnish with scallions and serve boiling hot alongside a bowl of plain white rice."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "stew",
              "soup"
            ],
            "cookingMethods": [
              "boiling",
              "simmering"
            ]
          },
          "elementalProperties": {
            "Fire": 0.6,
            "Water": 0.3,
            "Earth": 0.1,
            "Air": 0
          },
          "astrologicalAffinities": {
            "planets": [
              "Mars",
              "Pluto"
            ],
            "signs": [
              "Aries",
              "Scorpio"
            ],
            "lunarPhases": [
              "Waning Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 18,
            "carbsG": 15,
            "fatG": 24,
            "fiberG": 4,
            "sodiumMg": 1100,
            "sugarG": 5,
            "vitamins": [
              "Vitamin C",
              "Vitamin K"
            ],
            "minerals": [
              "Calcium",
              "Iron"
            ]
          },
          "alchemicalProperties": {
            "Spirit": 6,
            "Essence": 5,
            "Matter": 4,
            "Substance": 4
          },
          "thermodynamicProperties": {
            "heat": 0.08,
            "entropy": 0.45,
            "reactivity": 2.2,
            "gregsEnergy": -0.6,
            "kalchm": 0.05,
            "monica": 0.7
          },
          "substitutions": []
        },
        {
          "name": "Authentic Beef Bulgogi",
          "description": "Korea's most famous barbecue export. Wafer-thin slices of beef marinated in a sweet, savory blend of soy, sesame, and Asian pear (which tenderizes the meat), quickly grilled over an open flame.",
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
              "name": "beef ribeye or sirloin",
              "notes": "Sliced paper-thin"
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "soy sauce",
              "notes": "For marinade"
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "brown sugar or honey",
              "notes": "For caramelization"
            },
            {
              "amount": 0.5,
              "unit": "whole",
              "name": "Asian pear",
              "notes": "Grated; contains tenderizing enzymes"
            },
            {
              "amount": 1,
              "unit": "small",
              "name": "onion",
              "notes": "Grated"
            },
            {
              "amount": 4,
              "unit": "cloves",
              "name": "garlic",
              "notes": "Minced"
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sesame oil",
              "notes": "Toasted"
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "toasted sesame seeds",
              "notes": "For garnish"
            }
          ],
          "instructions": [
            "Step 1: In a large bowl, whisk together the soy sauce, sugar, grated pear, grated onion, garlic, and sesame oil.",
            "Step 2: Add the thinly sliced beef. Massage the marinade into the meat with your hands.",
            "Step 3: Cover and refrigerate for 1-2 hours (do not exceed 4 hours or the pear will turn the meat to mush).",
            "Step 4: Heat a grill pan or cast-iron skillet over maximum heat until smoking.",
            "Step 5: Flash-fry the beef in small batches for 1-2 minutes per side until deeply caramelized and slightly charred.",
            "Step 6: Sprinkle with sesame seeds and serve with lettuce leaves (ssam), rice, and ssamjang."
          ],
          "classifications": {
            "mealType": [
              "dinner",
              "bbq"
            ],
            "cookingMethods": [
              "marinating",
              "grilling"
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
            "calories": 420,
            "proteinG": 32,
            "carbsG": 18,
            "fatG": 22,
            "fiberG": 1,
            "sodiumMg": 950,
            "sugarG": 14,
            "vitamins": [
              "Vitamin B12",
              "Niacin"
            ],
            "minerals": [
              "Zinc",
              "Iron"
            ]
          },
          "alchemicalProperties": {
            "Spirit": 4,
            "Essence": 5,
            "Matter": 6,
            "Substance": 5
          },
          "thermodynamicProperties": {
            "heat": 0.05,
            "entropy": 0.3,
            "reactivity": 1.6,
            "gregsEnergy": -0.4,
            "kalchm": 0.02,
            "monica": 0.5
          },
          "substitutions": []
        },
        {
          "name": "Authentic Tteokbokki",
          "description": "The undisputed king of Korean street food. Chewy, dense rice cakes simmering in a thick, fiery red, and remarkably sweet gochujang sauce with fish cakes.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 10,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "Hot",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 400,
              "unit": "g",
              "name": "garaetteok (cylinder rice cakes)",
              "notes": "Soaked if hard"
            },
            {
              "amount": 3,
              "unit": "sheets",
              "name": "eomuk (fish cakes)",
              "notes": "Cut into triangles"
            },
            {
              "amount": 3,
              "unit": "cups",
              "name": "anchovy-kelp stock",
              "notes": "Essential umami base"
            },
            {
              "amount": 3,
              "unit": "tbsp",
              "name": "gochujang",
              "notes": "Korean chili paste"
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "gochugaru",
              "notes": "Korean chili flakes"
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sugar or corn syrup",
              "notes": "Crucial for the glossy glaze"
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For saltiness"
            },
            {
              "amount": 2,
              "unit": "whole",
              "name": "hard-boiled eggs",
              "notes": "Peeled"
            },
            {
              "amount": 1,
              "unit": "bunch",
              "name": "scallions",
              "notes": "Cut into 2-inch pieces"
            }
          ],
          "instructions": [
            "Step 1: In a wide, shallow pan, combine the stock, gochujang, gochugaru, sugar, and soy sauce. Bring to a boil.",
            "Step 2: Add the rice cakes to the bubbling sauce.",
            "Step 3: Simmer vigorously for 10-15 minutes, stirring frequently so the rice cakes don't stick to the bottom, until the sauce thickens into a thick glaze.",
            "Step 4: Stir in the fish cake triangles and hard-boiled eggs.",
            "Step 5: Cook for another 3 minutes until the fish cakes puff up and absorb the sauce.",
            "Step 6: Toss in the scallions right at the end. Serve piping hot."
          ],
          "classifications": {
            "mealType": [
              "snack",
              "street food"
            ],
            "cookingMethods": [
              "simmering",
              "reducing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.5,
            "Water": 0.2,
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
              "Gemini"
            ],
            "lunarPhases": [
              "First Quarter"
            ]
          },
          "nutritionPerServing": {
            "calories": 380,
            "proteinG": 12,
            "carbsG": 65,
            "fatG": 4,
            "fiberG": 2,
            "sodiumMg": 850,
            "sugarG": 12,
            "vitamins": [
              "Vitamin A",
              "Calcium"
            ],
            "minerals": [
              "Iron"
            ]
          },
          "alchemicalProperties": {
            "Spirit": 5,
            "Essence": 5,
            "Matter": 4,
            "Substance": 5
          },
          "thermodynamicProperties": {
            "heat": 0.06,
            "entropy": 0.35,
            "reactivity": 1.8,
            "gregsEnergy": -0.5,
            "kalchm": 0.03,
            "monica": 0.6
          },
          "substitutions": []
        },
        {
          "name": "Authentic Japchae",
          "description": "A celebratory dish of bouncy sweet potato glass noodles stir-fried with an array of individually prepared vegetables and beef, yielding a harmoniously sweet and savory sesame-rich finish.",
          "details": {
            "cuisine": "Korean",
            "prepTimeMinutes": 40,
            "cookTimeMinutes": 20,
            "baseServingSize": 4,
            "spiceLevel": "None",
            "season": [
              "all"
            ]
          },
          "ingredients": [
            {
              "amount": 250,
              "unit": "g",
              "name": "dangmyeon (sweet potato starch noodles)",
              "notes": "Boiled until chewy and transparent"
            },
            {
              "amount": 150,
              "unit": "g",
              "name": "beef sirloin",
              "notes": "Thinly sliced"
            },
            {
              "amount": 1,
              "unit": "cup",
              "name": "spinach",
              "notes": "Blanched"
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "carrots",
              "notes": "Julienned"
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "onion",
              "notes": "Sliced"
            },
            {
              "amount": 0.5,
              "unit": "cup",
              "name": "shiitake mushrooms",
              "notes": "Sliced"
            },
            {
              "amount": 4,
              "unit": "tbsp",
              "name": "soy sauce",
              "notes": "For the sauce"
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sugar",
              "notes": "For the sauce"
            },
            {
              "amount": 2,
              "unit": "tbsp",
              "name": "sesame oil",
              "notes": "For the sauce"
            },
            {
              "amount": 1,
              "unit": "tbsp",
              "name": "toasted sesame seeds",
              "notes": "For garnish"
            }
          ],
          "instructions": [
            "Step 1: Boil the dangmyeon for 6 minutes until chewy. Rinse in cold water, drain, cut into 6-inch lengths, and toss with a little sesame oil so they don't stick.",
            "Step 2: Mix the soy sauce, sugar, and sesame oil to create the master seasoning sauce.",
            "Step 3: Blanch the spinach, squeeze out all water, and season lightly with salt and sesame oil.",
            "Step 4: In a skillet, separately stir-fry the onions, carrots, and mushrooms. Set each aside.",
            "Step 5: Stir-fry the beef until just cooked.",
            "Step 6: In a very large bowl, combine the noodles, all the vegetables, the beef, and the master seasoning sauce. Toss everything aggressively by hand. Garnish with sesame seeds."
          ],
          "classifications": {
            "mealType": [
              "lunch",
              "side",
              "celebration"
            ],
            "cookingMethods": [
              "boiling",
              "stir-frying",
              "tossing"
            ]
          },
          "elementalProperties": {
            "Fire": 0.2,
            "Water": 0.1,
            "Earth": 0.5,
            "Air": 0.2
          },
          "astrologicalAffinities": {
            "planets": [
              "Venus",
              "Mercury"
            ],
            "signs": [
              "Libra",
              "Taurus"
            ],
            "lunarPhases": [
              "Full Moon"
            ]
          },
          "nutritionPerServing": {
            "calories": 350,
            "proteinG": 12,
            "carbsG": 55,
            "fatG": 10,
            "fiberG": 4,
            "sodiumMg": 750,
            "sugarG": 10,
            "vitamins": [
              "Vitamin A",
              "Vitamin K"
            ],
            "minerals": [
              "Iron",
              "Potassium"
            ]
          },
          "alchemicalProperties": {
            "Spirit": 4,
            "Essence": 5,
            "Matter": 6,
            "Substance": 4
          },
          "thermodynamicProperties": {
            "heat": 0.03,
            "entropy": 0.25,
            "reactivity": 1.4,
            "gregsEnergy": -0.3,
            "kalchm": 0.01,
            "monica": 0.4
          },
          "substitutions": []
        },
        {
          name: "Samgyeopsal-gui",
          description: "The communal and tactile experience of Korean BBQ. Unmarinated, thick-cut pork belly is grilled at the table, crisped in its own rendered fat, and eaten wrapped in fresh lettuce with pungent aromatics and fermented pastes.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1,"unit":"lb","name":"Pork belly (Samgyeopsal)","notes":"Thick slices, distinct layers of meat and fat."},{"amount":1,"unit":"head","name":"Red leaf lettuce","notes":"Washed and dried perfectly for wrapping."},{"amount":0.5,"unit":"cup","name":"Ssamjang","notes":"Thick, spicy fermented bean paste."},{"amount":4,"unit":"cloves","name":"Garlic","notes":"Raw, sliced thinly."},{"amount":2,"unit":"tbsp","name":"Sesame oil","notes":"Mixed with salt and pepper for dipping."},{"amount":1,"unit":"cup","name":"Kimchi","notes":"Aged, for grilling alongside the pork."}],
          instructions: ["Step 1: The Table Setup. Arrange the raw pork, lettuce leaves, ssamjang, sliced garlic, and sesame oil dipping sauce around a tabletop grill or cast-iron pan.","Step 2: The Grill. Heat the grill until smoking hot. Lay the pork belly slices flat. Do not touch them until the bottom is deeply browned and crispy. The fat will render vigorously.","Step 3: The Flip and Cut. Flip the meat to crisp the other side. Using heavy scissors, cut the long strips into bite-sized pieces directly on the grill. Place the kimchi on the lower end of the grill to fry in the rendering pork fat.","Step 4: The Ssam (Wrap). To eat, take a fresh lettuce leaf. Dip a piece of the crackling-hot pork into the sesame oil, then place it in the leaf.","Step 5: The Build. Add a smear of ssamjang, a slice of raw garlic, and some of the grilled, fat-soaked kimchi. Wrap it tightly into a small pouch and eat it in one complete bite."],
          classifications: {"mealType":["dinner","social"],"cookingMethods":["grilling"]},
          elementalProperties: {"Fire":0.5,"Water":0.05,"Earth":0.35,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Venus"],"signs":["taurus","aries"],"lunarPhases":["Waxing Gibbous"]},

          alchemicalProperties: {"Spirit":2.65,"Essence":2.58,"Matter":2.67,"Substance":2.53},
          thermodynamicProperties: {"heat":0.1061,"entropy":0.4286,"reactivity":2.2304,"gregsEnergy":-0.85,"kalchm":1.059,"monica":0.4376},
          substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Beef short ribs (Galbi)","Thick-cut mushrooms"]}],
            nutritionPerServing: {"calories":147,"proteinG":13,"carbsG":6,"fatG":8,"fiberG":0,"sodiumMg":28,"sugarG":4,"vitamins":["Vitamin thiamin","Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin riboflavin","Vitamin C","Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["Selenium","Zinc","Phosphorus","Iron","Potassium","Manganese","0","1","2"]}
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

          alchemicalProperties: {"Spirit":2.98,"Essence":3.38,"Matter":3.39,"Substance":3.01},
          thermodynamicProperties: {"heat":0.0892,"entropy":0.361,"reactivity":2.5197,"gregsEnergy":-0.8206,"kalchm":0.9184,"monica":0.0278},
          substitutions: [{"originalIngredient":"Mixed seafood","substituteOptions":["Pork belly","Enoki mushrooms"]}],
            nutritionPerServing: {"calories":44,"proteinG":1,"carbsG":6,"fatG":2,"fiberG":0,"sodiumMg":4,"sugarG":4,"vitamins":["Vitamin 0","Vitamin 1","Vitamin 2","Vitamin C","Vitamin B6"],"minerals":["0","1","2","Manganese","Selenium"]}
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

          alchemicalProperties: {"Spirit":0.15,"Essence":0.4,"Matter":0.85,"Substance":0.8},
          thermodynamicProperties: {"heat":0.0333,"entropy":0.3028,"reactivity":0.7996,"gregsEnergy":-0.2088,"kalchm":0.7157,"monica":0.4376},
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

          alchemicalProperties: {"Spirit":2.11,"Essence":3.27,"Matter":3.75,"Substance":3.65},
          thermodynamicProperties: {"heat":0.0385,"entropy":0.333,"reactivity":1.7994,"gregsEnergy":-0.5607,"kalchm":0.0145,"monica":0.2786},
          substitutions: [{"originalIngredient":"Chicken thighs","substituteOptions":["Spicy pork","Extra tofu and mushrooms"]}],
            nutritionPerServing: {"calories":105,"proteinG":17,"carbsG":5,"fatG":2,"fiberG":2,"sodiumMg":53,"sugarG":3,"vitamins":["Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin C","Vitamin K","Vitamin folate"],"minerals":["Selenium","Phosphorus","Zinc","Manganese","Potassium"]}
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

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4376},
          substitutions: [{"originalIngredient":"Core element of Haemul Pajeon","substituteOptions":["Alternative element"]}],
            nutritionPerServing: {"calories":0,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sodiumMg":0,"sugarG":0,"vitamins":[],"minerals":[]}
        },
        {
          name: "Gamjatang",
          description: "A fiercely warming pork spine soup that extracts collagen and marrow from long-simmered neck bones into a rich, brick-red broth flavored with perilla leaves, fermented soybean paste, and gochugaru. The large potato chunks absorb the spicy, fatty broth while the meat clings to the bones with a tender, falling texture achieved only through hours of patient simmering.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":180,"baseServingSize":4,"spiceLevel":"High","season":["winter","autumn"]},
          ingredients: [{"amount":3,"unit":"lbs","name":"Pork neck bones (spine)","notes":"Soaked in cold water for 1 hour to remove blood."},{"amount":2,"unit":"large","name":"Potatoes","notes":"Peeled and halved or quartered."},{"amount":3,"unit":"tbsp","name":"Gochugaru","notes":"Korean red chili flakes."},{"amount":2,"unit":"tbsp","name":"Doenjang","notes":"Fermented soybean paste."},{"amount":1,"unit":"cup","name":"Perilla leaves (kkaennip)","notes":"Roughly torn; essential aromatic character."},{"amount":4,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":2,"unit":"tbsp","name":"Soy sauce","notes":"For seasoning."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"Finishing drizzle."},{"amount":2,"unit":"stalks","name":"Scallions","notes":"Sliced diagonally for garnish."}],
          instructions: ["Step 1: The Blanching. Drain the soaked pork bones. Add them to a large pot of cold water, bring to a rapid boil, and blanch for 10 minutes. Drain and rinse each bone thoroughly under cold running water to remove impurities. This step is non-negotiable for a clean broth.","Step 2: The Long Simmer. Return the cleaned bones to the pot with 10 cups of fresh water. Bring to a boil, then reduce to a steady simmer. Skim foam for the first 20 minutes. Simmer for 1.5 to 2 hours until the meat begins to loosen from the bone.","Step 3: The Spice Paste. In a bowl, combine the gochugaru, doenjang, minced garlic, and soy sauce into a thick paste. Add this paste to the simmering broth and stir to dissolve. The broth will deepen to a rich, opaque red.","Step 4: The Potatoes. Add the halved potatoes to the spicy broth. Simmer for an additional 25-30 minutes until the potatoes are fully cooked through and have absorbed the spicy fat from the broth.","Step 5: The Finish. Add the torn perilla leaves and simmer for 5 more minutes. The leaves will wilt and release their distinctive anise-mint aroma. Drizzle with sesame oil, top with scallions, and serve directly from the pot with steamed rice."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","boiling"]},
          elementalProperties: {"Fire":0.45,"Water":0.35,"Earth":0.15,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Saturn"],"signs":["scorpio","capricorn"],"lunarPhases":["Waning Gibbous"]},

          alchemicalProperties: {"Spirit":3.61,"Essence":4.35,"Matter":4.5,"Substance":4.2},
          thermodynamicProperties: {"heat":0.0716,"entropy":0.3532,"reactivity":2.3088,"gregsEnergy":-0.7439,"kalchm":0.171,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Pork neck bones","substituteOptions":["Pork ribs","Beef neck bones"]},{"originalIngredient":"Perilla leaves","substituteOptions":["Fresh basil","Sesame leaves"]}],
            nutritionPerServing: {"calories":175,"proteinG":18,"carbsG":4,"fatG":10,"fiberG":0,"sodiumMg":39,"sugarG":2,"vitamins":["Vitamin thiamin","Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin riboflavin","Vitamin C","Vitamin 0","Vitamin 1","Vitamin 2","Vitamin K","Vitamin folate"],"minerals":["Selenium","Zinc","Phosphorus","Iron","Potassium","Manganese","0","1","2"]}
        },
        {
          name: "Bossam",
          description: "A masterpiece of controlled, aromatic boiling: pork belly or shoulder is simmered for hours in a complex pot of soybean paste, ginger, garlic, and onion until the fat becomes translucent and the meat slices cleanly. The result is eaten wrapped in salted napa cabbage leaves with fresh oysters, spicy radish kimchi, and fermented shrimp paste, creating a layered contrast of soft, fatty meat against cold, crunchy, briny wraps.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":90,"baseServingSize":4,"spiceLevel":"Mild","season":["autumn","winter"]},
          ingredients: [{"amount":2,"unit":"lbs","name":"Pork belly or shoulder","notes":"Whole piece, skin-on optional."},{"amount":2,"unit":"tbsp","name":"Doenjang","notes":"Fermented soybean paste for the poaching liquid."},{"amount":1,"unit":"whole","name":"Onion","notes":"Halved."},{"amount":1,"unit":"2-inch piece","name":"Fresh ginger","notes":"Sliced."},{"amount":6,"unit":"cloves","name":"Garlic","notes":"Whole, smashed."},{"amount":1,"unit":"head","name":"Salted napa cabbage","notes":"Outer leaves removed, inner leaves rinsed."},{"amount":1,"unit":"cup","name":"Kkakdugi (radish kimchi)","notes":"Cubed, cold."},{"amount":0.5,"unit":"cup","name":"Saeujeot (fermented salted shrimp)","notes":"For the ssamjang accompaniment."}],
          instructions: ["Step 1: The Poaching Liquid. Fill a large pot with enough water to submerge the pork. Add the halved onion, ginger slices, whole garlic cloves, doenjang, and a splash of soju or rice wine. Bring to a boil.","Step 2: The Long Boil. Lower the whole piece of pork into the boiling aromatic liquid. Reduce heat to a gentle but active simmer. Cook for 60-80 minutes, turning once, until a chopstick pierces the thickest part with no resistance. The fat should be completely translucent.","Step 3: The Resting Slice. Remove the pork and let it rest for 10 minutes. Slice against the grain into pieces approximately 5mm thick. Each slice should hold together, showing the distinct layers of skin, fat, and lean meat.","Step 4: The Table Spread. Arrange the sliced pork, salted cabbage leaves, cubed kkakdugi, fresh oysters if available, and small dishes of saeujeot and ssamjang across the table.","Step 5: The Wrap. To eat, take a salted cabbage leaf. Add two pieces of pork, a cube of radish kimchi, a small amount of saeujeot, and a smear of ssamjang. Fold the leaf tightly and consume in a single, complete bite."],
          classifications: {"mealType":["dinner","social"],"cookingMethods":["boiling","simmering"]},
          elementalProperties: {"Fire":0.2,"Water":0.45,"Earth":0.3,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["taurus","cancer"],"lunarPhases":["Waxing Gibbous"]},

          alchemicalProperties: {"Spirit":3.65,"Essence":3.83,"Matter":3.55,"Substance":3.4},
          thermodynamicProperties: {"heat":0.0996,"entropy":0.3771,"reactivity":2.6849,"gregsEnergy":-0.9128,"kalchm":3.3549,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Pork belly","substituteOptions":["Pork shoulder for leaner version","Beef brisket"]},{"originalIngredient":"Fresh oysters","substituteOptions":["Omit for a simpler version"]}],
            nutritionPerServing: {"calories":185,"proteinG":19,"carbsG":13,"fatG":6,"fiberG":2,"sodiumMg":120,"sugarG":5,"vitamins":["Vitamin thiamin","Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin riboflavin","Vitamin C","Vitamin folate","Vitamin K"],"minerals":["Selenium","Zinc","Phosphorus","Iron","Potassium","Manganese","Magnesium"]}
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

              alchemicalProperties: {"Spirit":0.53,"Essence":0.77,"Matter":0.95,"Substance":0.9},
              thermodynamicProperties: {"heat":0.0274,"entropy":0.2053,"reactivity":0.8413,"gregsEnergy":-0.1453,"kalchm":0.6742,"monica":0.2598},
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

              alchemicalProperties: {"Spirit":0.5,"Essence":0.75,"Matter":1.2,"Substance":1.15},
              thermodynamicProperties: {"heat":0.0211,"entropy":0.268,"reactivity":0.948,"gregsEnergy":-0.233,"kalchm":0.3899,"monica":0.2598},
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

              alchemicalProperties: {"Spirit":0.53,"Essence":1.07,"Matter":0.7,"Substance":0.65},
              thermodynamicProperties: {"heat":0.0623,"entropy":0.2046,"reactivity":2.1183,"gregsEnergy":-0.3711,"kalchm":1.3042,"monica":0.2511},
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

              alchemicalProperties: {"Spirit":0.7,"Essence":1.0,"Matter":0.6,"Substance":0.65},
              thermodynamicProperties: {"heat":0.0883,"entropy":0.2844,"reactivity":2.9896,"gregsEnergy":-0.7618,"kalchm":1.4005,"monica":0.4376},
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

              alchemicalProperties: {"Spirit":0.61,"Essence":0.49,"Matter":0.71,"Substance":0.59},
              thermodynamicProperties: {"heat":0.0831,"entropy":0.2994,"reactivity":0.9052,"gregsEnergy":-0.1879,"kalchm":0.9079,"monica":0.4842},
              "substitutions": []
            },
        {
          name: "Tteokbokki",
          description: "The most iconic Korean street food: cylindrical rice cakes (garaetteok) simmered in a fierce, sticky, sweet-spicy sauce built from gochujang, gochugaru, and anchovy stock until the tteok absorb the sauce and the liquid reduces to a glossy, caramelized glaze. Fish cakes, boiled eggs, and scallions are traditional additions that soak up the fiery red coating, creating an interplay of chewy, elastic rice cake against soft, yielding fish cake.",
          details: {"cuisine":"Korean","prepTimeMinutes":10,"cookTimeMinutes":20,"baseServingSize":2,"spiceLevel":"High","season":["all"]},
          ingredients: [{"amount":2,"unit":"cups","name":"Garaetteok (cylindrical rice cakes)","notes":"Soaked in cold water for 20 minutes if refrigerated or frozen."},{"amount":3,"unit":"tbsp","name":"Gochujang","notes":"Korean chili paste, the sauce foundation."},{"amount":1,"unit":"tbsp","name":"Gochugaru","notes":"For additional heat and color."},{"amount":2,"unit":"tbsp","name":"Sugar","notes":"Balances the heat and creates the sticky glaze."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"For depth and salinity."},{"amount":2,"unit":"cups","name":"Anchovy-kelp stock","notes":"Made by boiling dried anchovies and kelp for 10 minutes."},{"amount":2,"unit":"pieces","name":"Eomuk (fish cakes)","notes":"Cut into bite-sized pieces or triangles."},{"amount":2,"unit":"large","name":"Eggs","notes":"Hard-boiled, peeled."},{"amount":2,"unit":"stalks","name":"Scallions","notes":"Cut into 2-inch pieces."}],
          instructions: ["Step 1: The Stock. Simmer dried anchovies and a 3-inch piece of kelp in 2.5 cups of water for 10 minutes. Remove the anchovies and kelp; the resulting stock should smell of the sea.","Step 2: The Sauce Base. In the hot stock, dissolve the gochujang, gochugaru, sugar, and soy sauce, whisking to fully combine. Bring to a rolling boil.","Step 3: The Rice Cakes. Add the drained tteok to the boiling sauce. Stir continuously and vigorously to prevent the rice cakes from sticking to the bottom. The sauce will begin to thicken and coat the tteok.","Step 4: The Additions. Add the fish cakes and hard-boiled eggs. Continue to simmer over medium heat for 10 minutes, stirring often, until the sauce is thick, glossy, and clings to every piece.","Step 5: The Finish. Add the scallions in the final 2 minutes. The sauce should be reduced to a thick, sticky, fiercely red glaze. Serve immediately in a shallow bowl."],
          classifications: {"mealType":["snack","lunch","dinner"],"cookingMethods":["simmering","boiling"]},
          elementalProperties: {"Fire":0.5,"Water":0.25,"Earth":0.2,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Pluto"],"signs":["aries","scorpio"],"lunarPhases":["Full Moon"]},

          alchemicalProperties: {"Spirit":2.69,"Essence":3.57,"Matter":3.33,"Substance":3.21},
          thermodynamicProperties: {"heat":0.0665,"entropy":0.3294,"reactivity":2.4557,"gregsEnergy":-0.7423,"kalchm":0.58,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Eomuk fish cakes","substituteOptions":["Tofu puffs","Sliced mushrooms"]},{"originalIngredient":"Anchovy-kelp stock","substituteOptions":["Vegetable stock","Water with a pinch of dashi powder"]}],
            nutritionPerServing: {"calories":5,"proteinG":0,"carbsG":1,"fatG":0,"fiberG":0,"sodiumMg":2,"sugarG":0,"vitamins":["Vitamin K","Vitamin folate"],"minerals":["Iron","Manganese"]}
        },
        {
          name: "Kimbap",
          description: "The essential Korean portable meal: seasoned short-grain rice and a colorful matrix of fillings are rolled tightly in sheets of roasted seaweed (gim) and sliced into perfect cross-sections that reveal a geometric mosaic of colors. Unlike sushi, kimbap rice is seasoned with sesame oil rather than vinegar, giving it a warm, nutty richness. Classic fillings include beef bulgogi, pickled radish, spinach namul, carrots, and egg omelet strips.",
          details: {"cuisine":"Korean","prepTimeMinutes":45,"cookTimeMinutes":30,"baseServingSize":4,"spiceLevel":"None","season":["all"]},
          ingredients: [{"amount":3,"unit":"cups","name":"Short-grain white rice","notes":"Cooked and seasoned with 2 tbsp sesame oil, 1 tsp salt while hot."},{"amount":6,"unit":"sheets","name":"Gim (roasted seaweed)","notes":"Full-size nori sheets."},{"amount":0.5,"unit":"lb","name":"Beef bulgogi","notes":"Thinly sliced, marinated in soy, sesame, garlic, and cooked."},{"amount":1,"unit":"whole","name":"Danmuji (yellow pickled radish)","notes":"Pre-sliced into long strips."},{"amount":1,"unit":"bunch","name":"Fresh spinach","notes":"Blanched, squeezed dry, and seasoned with sesame oil."},{"amount":2,"unit":"medium","name":"Carrots","notes":"Julienned and stir-fried briefly."},{"amount":3,"unit":"large","name":"Eggs","notes":"Beaten, fried into a thin sheet, cut into long strips."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For brushing the finished rolls."}],
          instructions: ["Step 1: The Fillings. Prepare each component individually: cook the bulgogi; blanch and season the spinach; julienne and briefly saute the carrots; fry the eggs into thin sheets and slice into strips. Lay all components out on a board.","Step 2: The Rice Layer. Place a bamboo rolling mat on the counter. Lay one sheet of gim, shiny side down. With wet hands, spread approximately 0.75 cup of seasoned rice evenly over the gim, leaving a 1-inch border at the far edge.","Step 3: The Fillings Line. Across the near end of the rice (one-third of the way in), lay a strip of each filling in a horizontal line: beef, spinach, carrot, egg, and danmuji from edge to edge.","Step 4: The Roll. Using the bamboo mat, fold the near edge of the gim tightly over the fillings and roll forward firmly, pressing to compact the cylinder. Use the bare border of gim to seal the roll. Roll should be firm but not crushed.","Step 5: The Slice. Brush the outside of the roll with sesame oil. Using a sharp, damp knife, slice the roll into 8-10 pieces with confident, single-stroke cuts. The cross-section should reveal a perfect spiral of colors."],
          classifications: {"mealType":["lunch","snack","breakfast"],"cookingMethods":["boiling","stir-frying","rolling"]},
          elementalProperties: {"Fire":0.15,"Water":0.2,"Earth":0.5,"Air":0.15},
          astrologicalAffinities: {"planets":["Moon","Mercury"],"signs":["cancer","virgo"],"lunarPhases":["Waxing Crescent"]},

          alchemicalProperties: {"Spirit":2.77,"Essence":2.9,"Matter":3.5,"Substance":3.14},
          thermodynamicProperties: {"heat":0.0713,"entropy":0.3487,"reactivity":1.6267,"gregsEnergy":-0.4959,"kalchm":0.1265,"monica":0.6974},
          substitutions: [{"originalIngredient":"Beef bulgogi","substituteOptions":["Tuna with mayonnaise","Imitation crab sticks"]},{"originalIngredient":"Danmuji","substituteOptions":["Regular pickle strips"]}],
            nutritionPerServing: {"calories":45,"proteinG":3,"carbsG":3,"fatG":2,"fiberG":1,"sodiumMg":16,"sugarG":1,"vitamins":["Vitamin B12","Vitamin B6","Vitamin niacin","Vitamin riboflavin","Vitamin thiamin","Vitamin K","Vitamin A","Vitamin C","Vitamin folate","Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["Zinc","Iron","Phosphorus","Selenium","Magnesium","Calcium","Potassium","Manganese","0","1","2"]}
        },
        {
          name: "Mandu",
          description: "The Korean art of the dumpling: thin, hand-pleated wrappers filled with a mixture of ground pork, tofu, glass noodles, garlic chives, and seasoned vegetables. The filling achieves its texture through the careful removal of all excess moisture from the tofu and cabbage, resulting in a compact, savory mass that steams or pan-fries into a juicy, plump morsel enclosed in a tender, slightly translucent skin. Mandu can be steamed (jjin mandu), pan-fried (gun mandu), or boiled (mul mandu).",
          details: {"cuisine":"Korean","prepTimeMinutes":60,"cookTimeMinutes":20,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":30,"unit":"pieces","name":"Round mandu wrappers","notes":"Store-bought or homemade with flour and hot water."},{"amount":0.5,"unit":"lb","name":"Ground pork","notes":"The fatty core of the filling."},{"amount":1,"unit":"cup","name":"Firm tofu","notes":"Drained, wrapped in cloth, and squeezed of all excess water."},{"amount":1,"unit":"cup","name":"Napa cabbage","notes":"Finely minced, heavily salted, and squeezed completely dry."},{"amount":1,"unit":"cup","name":"Glass noodles (dangmyeon)","notes":"Soaked in water, boiled 5 minutes, drained, and roughly chopped."},{"amount":0.5,"unit":"cup","name":"Garlic chives","notes":"Finely chopped."},{"amount":3,"unit":"cloves","name":"Garlic","notes":"Finely minced."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For binding and flavor."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"For seasoning the filling."}],
          instructions: ["Step 1: The Filling. Combine the ground pork, squeezed tofu, squeezed cabbage, chopped noodles, garlic chives, garlic, sesame oil, and soy sauce in a large bowl. Mix vigorously by hand until completely homogeneous. Refrigerate for 15 minutes to firm up.","Step 2: The Wrapping. Place a wrapper on your palm. Spoon 1 tablespoon of filling in the center. Wet the edge with a fingertip dipped in water. Fold the wrapper in half over the filling to form a half-moon, then crimp the edge in a tight pleat pattern to seal securely.","Step 3a (Pan-fry). For gun mandu: heat oil in a flat pan. Place dumplings flat-side down; fry undisturbed until the bottom is golden brown and crispy, about 3 minutes. Add 3 tbsp of water, immediately cover with a lid. Steam for 4 minutes until cooked through.","Step 4: The Dipping Sauce. Combine 2 tbsp soy sauce, 1 tbsp rice vinegar, 1 tsp sesame oil, and a pinch of gochugaru in a small dish.","Step 5: The Finish. Arrange the hot mandu on a plate, crispy side up if pan-fried. Serve immediately with the dipping sauce alongside."],
          classifications: {"mealType":["dinner","lunch","snack"],"cookingMethods":["pan-frying","steaming","boiling"]},
          elementalProperties: {"Fire":0.2,"Water":0.3,"Earth":0.4,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","taurus"],"lunarPhases":["First Quarter"]},

          alchemicalProperties: {"Spirit":3.86,"Essence":4.0,"Matter":4.38,"Substance":4.05},
          thermodynamicProperties: {"heat":0.0854,"entropy":0.3803,"reactivity":2.0764,"gregsEnergy":-0.7042,"kalchm":0.2527,"monica":0.3156},
          substitutions: [{"originalIngredient":"Ground pork","substituteOptions":["Ground chicken","Mushroom and tofu for vegetarian"]},{"originalIngredient":"Mandu wrappers","substituteOptions":["Gyoza wrappers","Homemade flour wrappers"]}],
            nutritionPerServing: {"calories":57,"proteinG":4,"carbsG":6,"fatG":2,"fiberG":2,"sodiumMg":18,"sugarG":4,"vitamins":["Vitamin thiamin","Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin riboflavin","Vitamin C","Vitamin K","Vitamin folate","Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["Selenium","Zinc","Phosphorus","Iron","Potassium","Manganese","0","1","2"]}
        },
        {
          name: "Doenjang Jjigae",
          description: "The foundational Korean household stew, built around the deep, complex salinity of doenjang (fermented soybean paste), which is neither miso nor tahini but something uniquely pungent, earthy, and alive with beneficial fermentation. Anchovy-kelp stock provides the umami base into which the paste dissolves, creating a broth of remarkable depth that simmers with zucchini, potatoes, mushrooms, and tofu until each vegetable becomes saturated with fermented flavor.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":25,"baseServingSize":2,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":3,"unit":"tbsp","name":"Doenjang","notes":"Aged fermented soybean paste; the older and more pungent, the better."},{"amount":2,"unit":"cups","name":"Anchovy-kelp stock","notes":"Simmered from dried anchovies and kelp for 10 minutes."},{"amount":1,"unit":"medium","name":"Zucchini","notes":"Cut into half-moon slices."},{"amount":1,"unit":"small","name":"Potato","notes":"Peeled and cut into bite-sized cubes."},{"amount":1,"unit":"block","name":"Medium-firm tofu","notes":"Cut into large cubes."},{"amount":5,"unit":"pieces","name":"Dried shiitake mushrooms","notes":"Rehydrated and sliced."},{"amount":1,"unit":"whole","name":"Chili pepper","notes":"Korean green chili, sliced; for mild heat."},{"amount":3,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":0.5,"unit":"tsp","name":"Gochugaru","notes":"Optional, for gentle heat."}],
          instructions: ["Step 1: The Stock. Bring 2.5 cups of water to a boil with 10 dried anchovies and a 3-inch piece of kelp. Simmer 10 minutes, then remove the anchovies and kelp. The broth should smell deeply oceanic.","Step 2: The Paste. Reduce heat to medium. Add the doenjang to the hot stock in spoonfuls, pressing each spoonful against the side of the pot to dissolve it into the liquid. Add the gochugaru and minced garlic.","Step 3: The Vegetables. Add the potato cubes first; they require the most time. Simmer for 5 minutes, then add the zucchini, rehydrated mushrooms, and sliced green chili.","Step 4: The Tofu. After the vegetables have softened (approximately 8 more minutes), gently lower the tofu cubes into the stew. Do not stir vigorously; push them gently under the liquid. Simmer for 5 minutes.","Step 5: The Finish. Taste and adjust with a small amount of soup soy sauce or salt if needed. The final broth must be intensely savory, earthy, and slightly funky from the fermented paste. Serve in the pot directly alongside steamed rice."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","boiling"]},
          elementalProperties: {"Fire":0.2,"Water":0.5,"Earth":0.25,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Moon"],"signs":["capricorn","cancer"],"lunarPhases":["Waning Crescent"]},

          alchemicalProperties: {"Spirit":3.23,"Essence":3.51,"Matter":3.99,"Substance":3.68},
          thermodynamicProperties: {"heat":0.073,"entropy":0.3529,"reactivity":2.0352,"gregsEnergy":-0.6452,"kalchm":0.1198,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Doenjang","substituteOptions":["Japanese miso (milder result)","Red miso"]},{"originalIngredient":"Anchovy-kelp stock","substituteOptions":["Vegetable stock for vegetarian"]}],
            nutritionPerServing: {"calories":28,"proteinG":1,"carbsG":5,"fatG":0,"fiberG":0,"sodiumMg":3,"sugarG":3,"vitamins":["Vitamin 0","Vitamin 1","Vitamin 2","Vitamin 3","Vitamin 4","Vitamin C","Vitamin B6"],"minerals":["0","1","2","Manganese","Selenium"]}
        },
        {
          name: "Galbijjim",
          description: "A deeply ceremonial Korean braised short rib dish reserved for holidays and special occasions. Beef short ribs (galbi) are blanched, then slowly braised for hours in a rich marinade of soy sauce, garlic, ginger, sugar, and Asian pear, with chestnuts, jujubes, and pine nuts added near the end. The collagen in the rib bones dissolves into the braising liquid, creating a sauce of extraordinary body and gloss that lacquers each rib in a dark, mahogany coat.",
          details: {"cuisine":"Korean","prepTimeMinutes":30,"cookTimeMinutes":120,"baseServingSize":4,"spiceLevel":"None","season":["winter","autumn"]},
          ingredients: [{"amount":3,"unit":"lbs","name":"Beef short ribs (galbi)","notes":"Cut through the bone into 3-inch sections; fat trimmed but not removed."},{"amount":0.5,"unit":"cup","name":"Soy sauce","notes":"The salt and umami foundation."},{"amount":0.25,"unit":"cup","name":"Sugar","notes":"Balanced sweetness."},{"amount":1,"unit":"whole","name":"Asian pear","notes":"Grated; the enzymes tenderize the meat naturally."},{"amount":8,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":1,"unit":"2-inch piece","name":"Fresh ginger","notes":"Grated."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"Added at the end for aroma."},{"amount":10,"unit":"pieces","name":"Chestnuts","notes":"Peeled; add richness and texture."},{"amount":8,"unit":"pieces","name":"Jujubes (dried dates)","notes":"Pitted; add natural sweetness."},{"amount":2,"unit":"medium","name":"Carrots","notes":"Cut into rolling cuts."}],
          instructions: ["Step 1: The Blanching. Score the short ribs every inch to allow marinade penetration. Place in cold water and bring to a full boil. Boil for 5 minutes to remove blood and impurities. Drain and rinse each rib under cold running water.","Step 2: The Braising Liquid. Combine the soy sauce, sugar, grated pear, garlic, ginger, and 2 cups of water in a large heavy pot or Dutch oven. Stir until the sugar dissolves.","Step 3: The Long Braise. Add the blanched ribs to the braising liquid. Bring to a boil, then reduce to a low simmer. Cover and braise for 60-80 minutes, turning the ribs every 20 minutes.","Step 4: The Final Additions. Add the chestnuts, jujubes, and carrot pieces. Continue to simmer uncovered for an additional 30 minutes, allowing the liquid to reduce and concentrate into a glossy, thick sauce.","Step 5: The Finish. The ribs are done when the meat is tender and the braising liquid has reduced to a dark, lacquered sauce. Stir in the sesame oil. Arrange on a platter with the garnishes, drizzling the thick sauce over the top."],
          classifications: {"mealType":["dinner","special occasion"],"cookingMethods":["braising","simmering"]},
          elementalProperties: {"Fire":0.25,"Water":0.35,"Earth":0.35,"Air":0.05},
          astrologicalAffinities: {"planets":["Saturn","Jupiter"],"signs":["capricorn","sagittarius"],"lunarPhases":["Full Moon"]},

          alchemicalProperties: {"Spirit":3.81,"Essence":4.82,"Matter":4.8,"Substance":4.31},
          thermodynamicProperties: {"heat":0.0676,"entropy":0.3113,"reactivity":2.1307,"gregsEnergy":-0.5957,"kalchm":0.317,"monica":0.0278},
          substitutions: [{"originalIngredient":"Asian pear","substituteOptions":["Kiwi fruit","Grated apple"]},{"originalIngredient":"Chestnuts","substituteOptions":["Water chestnuts","Omit"]}],
            nutritionPerServing: {"calories":369,"proteinG":19,"carbsG":53,"fatG":10,"fiberG":6,"sodiumMg":57,"sugarG":40,"vitamins":["Vitamin B12","Vitamin B6","Vitamin niacin","Vitamin riboflavin","Vitamin thiamin","Vitamin 0","Vitamin 1","Vitamin C","Vitamin 2","Vitamin A","Vitamin K"],"minerals":["Zinc","Iron","Phosphorus","Selenium","Magnesium","0","1","Manganese","Potassium","2","Copper"]}
        },
        {
          name: "Seolleongtang",
          description: "One of the most ancient and meditative Korean soups, requiring up to 12 hours of continuous, vigorous boiling of ox bones (leg and knuckle bones) until the collagen and fat emulsify into an opaque, ivory-white broth of extraordinary richness. The whiteness is not added; it is extracted from the bones themselves through the sustained action of boiling water breaking down marrow fat into microscopic droplets. Traditionally eaten for breakfast, it is seasoned at the table with salt, scallions, and black pepper.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":480,"baseServingSize":6,"spiceLevel":"None","season":["winter","all"]},
          ingredients: [{"amount":4,"unit":"lbs","name":"Ox leg and knuckle bones","notes":"The bone-to-water ratio determines broth opacity."},{"amount":0.5,"unit":"lb","name":"Beef brisket","notes":"Added to the broth for sliced meat topping."},{"amount":200,"unit":"g","name":"Somyeon or rice noodles","notes":"Added to the bowl when serving."},{"amount":3,"unit":"stalks","name":"Scallions","notes":"Thinly sliced for tableside seasoning."},{"amount":1,"unit":"tsp","name":"Coarse salt","notes":"Served on the side; each diner seasons their own bowl."},{"amount":1,"unit":"tsp","name":"White or black pepper","notes":"Freshly ground, served on the side."},{"amount":1,"unit":"whole","name":"Onion","notes":"Halved and charred for sweetness in the broth."}],
          instructions: ["Step 1: The Blood Soak. Submerge the ox bones in cold water for at least 2 hours, changing the water twice, to remove maximum blood. Drain.","Step 2: The First Blanch. Bring a very large pot of water to a full rolling boil. Add all bones and the brisket. Boil hard for 10 minutes. Drain completely. Scrub each bone under cold water with a stiff brush to remove all grey matter.","Step 3: The Long Boil. Return the clean bones to the pot with the brisket and the charred onion. Cover with 5 quarts of cold water. Bring to a full, vigorous boil, then maintain a hard simmer for 6-12 hours, adding water as needed to keep bones submerged. Do not skim; the fat and collagen must emulsify. The broth will slowly turn creamy white.","Step 4: The Brisket. After 1.5 hours, remove the brisket; slice thinly and set aside. Return only bones to continue.","Step 5: The Finish. The finished broth should be a dense, ivory-white color. Strain it through a fine sieve. Season generously with salt. Serve in deep bowls with noodles, sliced brisket, and scallions, with salt and pepper on the side for individual seasoning."],
          classifications: {"mealType":["breakfast","dinner","lunch"],"cookingMethods":["boiling","simmering"]},
          elementalProperties: {"Fire":0.15,"Water":0.6,"Earth":0.2,"Air":0.05},
          astrologicalAffinities: {"planets":["Moon","Saturn"],"signs":["cancer","capricorn"],"lunarPhases":["New Moon"]},

          alchemicalProperties: {"Spirit":2.52,"Essence":2.76,"Matter":3.6,"Substance":3.5},
          thermodynamicProperties: {"heat":0.0556,"entropy":0.3633,"reactivity":1.8423,"gregsEnergy":-0.6138,"kalchm":0.021,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Ox leg bones","substituteOptions":["Pork neck bones","Chicken carcasses for a lighter version"]},{"originalIngredient":"Somyeon noodles","substituteOptions":["Rice cakes","Udon noodles"]}],
            nutritionPerServing: {"calories":29,"proteinG":2,"carbsG":3,"fatG":1,"fiberG":1,"sodiumMg":7,"sugarG":1,"vitamins":["Vitamin B12","Vitamin B6","Vitamin niacin","Vitamin riboflavin","Vitamin thiamin","Vitamin K","Vitamin folate","Vitamin C","Vitamin A"],"minerals":["Zinc","Iron","Phosphorus","Selenium","Magnesium","Manganese","Calcium","Potassium"]}
        },
        {
          name: "Jjimdak",
          description: "A braised soy chicken dish originating from Andong, built from bone-in chicken pieces slow-braised in a dark, intensely savory and slightly sweet soy-based sauce with glass noodles, potatoes, and carrots absorbing the rich liquid. The sauce achieves its lacquered depth from dark soy sauce, oyster sauce, and the natural sugars in the onions and carrots caramelizing slowly into the braising liquid over 40 minutes of steady reduction.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":45,"baseServingSize":4,"spiceLevel":"Mild","season":["all"]},
          ingredients: [{"amount":1,"unit":"whole","name":"Chicken","notes":"Cut into bone-in pieces, or 3 lbs bone-in thighs and drumsticks."},{"amount":0.5,"unit":"cup","name":"Soy sauce","notes":"Regular and a splash of dark soy for color."},{"amount":2,"unit":"tbsp","name":"Oyster sauce","notes":"For depth and body."},{"amount":2,"unit":"tbsp","name":"Sugar","notes":"Balanced sweetness."},{"amount":2,"unit":"tbsp","name":"Sesame oil","notes":"Added at the finish."},{"amount":100,"unit":"g","name":"Glass noodles (dangmyeon)","notes":"Soaked in cold water for 20 minutes."},{"amount":2,"unit":"medium","name":"Potatoes","notes":"Cut into bite-sized cubes."},{"amount":2,"unit":"medium","name":"Carrots","notes":"Cut into rolling cut pieces."},{"amount":4,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":2,"unit":"whole","name":"Dried red chilies","notes":"For mild background heat."}],
          instructions: ["Step 1: The Blanch. Blanch chicken pieces in boiling water for 5 minutes to remove impurities and excess fat. Drain and rinse under cold water.","Step 2: The Braising Liquid. Combine soy sauce, oyster sauce, sugar, garlic, ginger, sesame oil, and 1.5 cups of water in a large, wide pot. Add the dried chilies. Bring to a boil.","Step 3: The Braise. Add the blanched chicken to the boiling braising liquid. Cover and cook over medium heat for 20 minutes, turning chicken pieces once.","Step 4: The Vegetables. Add potatoes and carrots. Continue to braise uncovered for 15 minutes, stirring occasionally. The liquid should be reducing and concentrating.","Step 5: The Noodles. Add the soaked glass noodles in the final 5 minutes. They will absorb the sauce and turn translucent. Drizzle with sesame oil, toss everything together, and serve hot directly from the pan, garnished with sliced scallions and sesame seeds."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["braising","simmering"]},
          elementalProperties: {"Fire":0.25,"Water":0.35,"Earth":0.3,"Air":0.1},
          astrologicalAffinities: {"planets":["Jupiter","Saturn"],"signs":["sagittarius","capricorn"],"lunarPhases":["Waxing Gibbous"]},

          alchemicalProperties: {"Spirit":3.09,"Essence":4.08,"Matter":5.06,"Substance":4.74},
          thermodynamicProperties: {"heat":0.0449,"entropy":0.3348,"reactivity":1.7006,"gregsEnergy":-0.5244,"kalchm":0.0017,"monica":0.0278},
          substitutions: [{"originalIngredient":"Whole chicken","substituteOptions":["Bone-in thighs only","Duck pieces"]},{"originalIngredient":"Oyster sauce","substituteOptions":["Additional soy sauce with a pinch of sugar"]}],
            nutritionPerServing: {"calories":76,"proteinG":9,"carbsG":6,"fatG":2,"fiberG":1,"sodiumMg":29,"sugarG":3,"vitamins":["Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin 0","Vitamin 1","Vitamin 2","Vitamin A","Vitamin K","Vitamin C"],"minerals":["Selenium","Phosphorus","Zinc","0","1","2","Potassium","Manganese"]}
        },
        {
          name: "Bibim Guksu",
          description: "A vibrant, fiercely spiced cold noodle dish made from thin wheat noodles (somyeon) tossed in a bold, tangy gochujang sauce balanced with rice vinegar, sesame oil, and a touch of sugar. Unlike the serene, broth-based Naengmyeon, Bibim Guksu is aggressive and immediate: the noodles are coated in bright red paste rather than submerged in broth, topped with julienned cucumber, shredded cabbage, a hard-boiled egg, and a shower of sesame seeds.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":10,"baseServingSize":2,"spiceLevel":"High","season":["summer","spring"]},
          ingredients: [{"amount":200,"unit":"g","name":"Somyeon (thin wheat noodles)","notes":"Or any thin Asian wheat noodle."},{"amount":3,"unit":"tbsp","name":"Gochujang","notes":"The core of the sauce."},{"amount":1,"unit":"tbsp","name":"Rice vinegar","notes":"Tartness to balance the heat."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For rich, nutty aroma."},{"amount":1,"unit":"tbsp","name":"Sugar","notes":"To balance the heat."},{"amount":1,"unit":"tbsp","name":"Soy sauce","notes":"For salinity and depth."},{"amount":1,"unit":"whole","name":"Cucumber","notes":"Julienned into thin matchsticks."},{"amount":2,"unit":"cups","name":"Cabbage","notes":"Finely shredded."},{"amount":2,"unit":"large","name":"Eggs","notes":"Hard-boiled, halved."},{"amount":1,"unit":"tbsp","name":"Toasted sesame seeds","notes":"For garnish."}],
          instructions: ["Step 1: The Sauce. In a mixing bowl, combine the gochujang, rice vinegar, sesame oil, sugar, and soy sauce. Whisk until completely smooth. Taste: it should be fiercely spicy, tangy, slightly sweet, and deeply savory. Refrigerate the sauce until needed.","Step 2: The Noodles. Cook the somyeon in vigorously boiling water for 2-3 minutes until just tender. Drain immediately and rinse aggressively under cold running water, kneading the noodles to remove all excess starch and cool them rapidly.","Step 3: The Preparation. Transfer the cold, well-drained noodles to a large bowl. Pour three-quarters of the sauce over the noodles and toss vigorously using chopsticks or tongs to ensure total, even coating.","Step 4: The Assembly. Divide the dressed noodles between two bowls. Arrange the julienned cucumber, shredded cabbage, and halved eggs on top.","Step 5: The Finish. Drizzle the remaining sauce over the toppings. Shower with toasted sesame seeds. Serve immediately while the noodles are cold and the sauce is vibrant. A few ice cubes in the bowl are traditional to maintain cold temperature."],
          classifications: {"mealType":["lunch","dinner"],"cookingMethods":["boiling","mixing"]},
          elementalProperties: {"Fire":0.45,"Water":0.3,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Mercury"],"signs":["aries","gemini"],"lunarPhases":["First Quarter"]},

          alchemicalProperties: {"Spirit":3.34,"Essence":4.03,"Matter":4.09,"Substance":3.96},
          thermodynamicProperties: {"heat":0.0712,"entropy":0.3683,"reactivity":2.413,"gregsEnergy":-0.8175,"kalchm":0.2089,"monica":0.0922},
          substitutions: [{"originalIngredient":"Somyeon noodles","substituteOptions":["Buckwheat noodles","Udon noodles"]},{"originalIngredient":"Gochujang","substituteOptions":["Sambal oelek mixed with miso"]}],
            nutritionPerServing: {"calories":37,"proteinG":1,"carbsG":6,"fatG":1,"fiberG":3,"sodiumMg":16,"sugarG":3,"vitamins":["Vitamin 0","Vitamin 1","Vitamin 2","Vitamin C","Vitamin K","Vitamin folate"],"minerals":["0","1","2","Manganese","Potassium"]}
        },
        {
          name: "Haemul Dubu Jorim",
          description: "A fiery, visually stunning braised dish of firm tofu and mixed seafood lacquered in a thick, brick-red gochugaru-based sauce. The tofu is pan-fried first to achieve a golden, firm exterior before being braised in a sauce built from anchovy stock, gochugaru, soy sauce, and garlic. The shrimp and squid are added late to prevent overcooking, and the entire dish is finished with a drizzle of sesame oil and a scattering of scallions, creating a caramelized, spicy surface that contrasts with the silken interior of the tofu.",
          details: {"cuisine":"Korean","prepTimeMinutes":15,"cookTimeMinutes":25,"baseServingSize":2,"spiceLevel":"High","season":["all"]},
          ingredients: [{"amount":1,"unit":"block","name":"Extra-firm tofu","notes":"Pressed dry, cut into 1-inch thick rectangles."},{"amount":0.5,"unit":"lb","name":"Mixed seafood","notes":"Shrimp (peeled), squid rings, or clams."},{"amount":3,"unit":"tbsp","name":"Gochugaru","notes":"Korean chili flakes for sauce and color."},{"amount":2,"unit":"tbsp","name":"Soy sauce","notes":"For salinity."},{"amount":1,"unit":"tbsp","name":"Gochujang","notes":"For depth and body in the sauce."},{"amount":1,"unit":"cup","name":"Anchovy stock","notes":"The braising liquid base."},{"amount":4,"unit":"cloves","name":"Garlic","notes":"Minced."},{"amount":1,"unit":"tsp","name":"Sugar","notes":"To balance the heat."},{"amount":2,"unit":"stalks","name":"Scallions","notes":"Sliced diagonally for garnish."},{"amount":1,"unit":"tbsp","name":"Sesame oil","notes":"For finishing."}],
          instructions: ["Step 1: The Tofu Fry. Pat the tofu rectangles completely dry. Heat 3 tbsp of vegetable oil in a wide skillet over high heat. Fry the tofu in a single layer, undisturbed, for 3 minutes per side until both faces are golden and firm. Remove and set aside.","Step 2: The Sauce. In the same pan, add a splash of oil and saute the minced garlic for 30 seconds. Add the gochugaru and gochujang; stir-fry for 1 minute to toast the chili and release its color into the oil. Add the soy sauce, sugar, and anchovy stock. Bring to a boil.","Step 3: The Braise. Return the fried tofu to the sauce in a single layer. Spoon the sauce over the tofu repeatedly. Reduce heat to medium and braise for 8 minutes, turning once, until the sauce reduces slightly and coats the tofu.","Step 4: The Seafood. Push the tofu to the edges of the pan. Add the seafood to the center of the sauce. Cook the shrimp and squid for 2-3 minutes only, just until the shrimp turn pink and opaque. Overcooked seafood will be rubbery.","Step 5: The Finish. Drizzle the sesame oil over the entire pan. Scatter the scallions on top. Serve immediately from the pan with steamed rice, spooning the thick, spicy sauce over both the tofu and the rice."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["pan-frying","braising","stir-frying"]},
          elementalProperties: {"Fire":0.5,"Water":0.3,"Earth":0.15,"Air":0.05},
          astrologicalAffinities: {"planets":["Mars","Pluto"],"signs":["scorpio","aries"],"lunarPhases":["Waxing Gibbous"]},

          alchemicalProperties: {"Spirit":3.96,"Essence":4.25,"Matter":3.76,"Substance":3.56},
          thermodynamicProperties: {"heat":0.1094,"entropy":0.3997,"reactivity":3.0586,"gregsEnergy":-1.1132,"kalchm":8.1594,"monica":0.7628},
          substitutions: [{"originalIngredient":"Mixed seafood","substituteOptions":["Additional tofu","Chicken pieces"]},{"originalIngredient":"Anchovy stock","substituteOptions":["Vegetable stock","Water with dashi"]}],
            nutritionPerServing: {"calories":40,"proteinG":2,"carbsG":7,"fatG":1,"fiberG":1,"sodiumMg":6,"sugarG":4,"vitamins":["Vitamin C","Vitamin B6","Vitamin K","Vitamin folate","Vitamin 0","Vitamin 1","Vitamin 2"],"minerals":["Manganese","Selenium","Iron","0","1","2"]}
        }
        ],
      winter: [
        {
          name: "Budae Jjigae",
          description: "A bubbling, fiery Korean-American fusion stew born from the resourcefulness of the Korean War era. Kimchi, gochujang, sliced Spam, hot dogs, ramen noodles, and soft tofu are combined in a rich, brick-red broth that simmers in a wide, shallow pot at the center of the table. Baked beans add an unexpected sweetness that melds with the fermented funk of aged kimchi, while scallions and a final drizzle of sesame oil provide aromatic brightness. The stew is eaten communally, with each diner fishing out their preferred combination of ingredients.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":30,"baseServingSize":3,"spiceLevel":"High","season":["winter"]},
          ingredients: [{"amount":1.5,"unit":"cups","name":"Aged kimchi","notes":"Well-fermented, at least 2 weeks old, roughly chopped with its juices reserved."},{"amount":2,"unit":"tbsp","name":"Gochujang","notes":"Fermented red chili paste for body and heat."},{"amount":1,"unit":"can","name":"Spam","notes":"Sliced into 1/4-inch rectangles."},{"amount":2,"unit":"packs","name":"Instant ramen noodles","notes":"Discard seasoning packets; noodles only."},{"amount":0.5,"unit":"block","name":"Soft tofu","notes":"Sliced into thick, pillowy pieces."},{"amount":2,"unit":"links","name":"Hot dogs","notes":"Sliced diagonally into 1/2-inch pieces."},{"amount":0.5,"unit":"cup","name":"Baked beans","notes":"Canned, for sweetness and body."},{"amount":3,"unit":"stalks","name":"Scallions","notes":"Cut into 2-inch lengths."},{"amount":3,"unit":"cups","name":"Anchovy or kelp stock","notes":"The broth base providing umami depth."}],
          instructions: ["Step 1: The Arrangement. In a wide, shallow pot or traditional budae jjigae pan, arrange the chopped kimchi, sliced Spam, hot dogs, baked beans, and tofu in neat sections, each occupying its own quadrant of the pot. This visual presentation is traditional and allows diners to see and choose their ingredients.","Step 2: The Broth. Mix the gochujang and reserved kimchi juice into the anchovy stock, stirring until the paste dissolves completely. Pour this fiery broth around and over the arranged ingredients until everything is partially submerged.","Step 3: The Boil. Place the pot over high heat and bring to a vigorous, rolling boil. Let the stew bubble aggressively for 8-10 minutes, allowing the Spam and hot dogs to release their smoky fats into the broth and the kimchi to soften and meld with the liquid.","Step 4: The Noodles. Push the ingredients aside and nestle the ramen noodles into the center of the boiling broth. Cook for 3 minutes, using chopsticks to loosen and separate the noodle blocks as they soften. The noodles should remain slightly chewy.","Step 5: The Finish. Scatter the scallion lengths over the surface. Serve the pot directly on a portable burner at the table, keeping the stew at a gentle simmer throughout the meal. Each diner serves themselves from the communal pot with long chopsticks and a ladle."],
          classifications: {"mealType":["dinner"],"cookingMethods":["boiling","simmering"]},
          elementalProperties: {"Fire":0.45,"Water":0.3,"Earth":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Mars","Jupiter"],"signs":["aries","sagittarius"],"lunarPhases":["Waxing Gibbous"]},

          alchemicalProperties: {"Spirit":2.46,"Essence":3.11,"Matter":3.35,"Substance":3.23},
          thermodynamicProperties: {"heat":0.0596,"entropy":0.3497,"reactivity":2.1599,"gregsEnergy":-0.6957,"kalchm":0.1232,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Spam","substituteOptions":["Turkey Spam","Sliced ham"]},{"originalIngredient":"Hot dogs","substituteOptions":["Smoked sausage","Tofu puffs"]}],
            nutritionPerServing: {"calories":5,"proteinG":0,"carbsG":1,"fatG":0,"fiberG":0,"sodiumMg":2,"sugarG":0,"vitamins":["Vitamin K","Vitamin folate"],"minerals":["Iron","Manganese"]}
        },
      ],
      summer: [
        {
          name: "Samgye-tang",
          description: "A deeply restorative Korean ginseng chicken soup traditionally eaten during the hottest days of summer to replenish energy through the principle of fighting heat with heat. A whole young chicken is stuffed with glutinous rice, fresh ginseng root, dried jujubes, and whole garlic cloves, then simmered for hours in a heavy stone pot until the broth turns milky white and the meat falls effortlessly from the bone. The ginseng imparts a subtly bitter, earthy undertone that balances the richness of the chicken, while the glutinous rice inside the cavity absorbs the concentrated broth into a savory porridge.",
          details: {"cuisine":"Korean","prepTimeMinutes":30,"cookTimeMinutes":180,"baseServingSize":1,"spiceLevel":"Mild","season":["summer"]},
          ingredients: [{"amount":1,"unit":"whole","name":"Cornish hen or small chicken","notes":"About 1 lb, cleaned and cavity emptied."},{"amount":0.33,"unit":"cup","name":"Glutinous rice","notes":"Soaked in water for at least 1 hour, drained."},{"amount":1,"unit":"root","name":"Fresh ginseng","notes":"About 3 inches, lightly scrubbed but not peeled."},{"amount":4,"unit":"pieces","name":"Dried jujubes","notes":"Korean red dates, rinsed."},{"amount":8,"unit":"cloves","name":"Garlic","notes":"Whole, unpeeled for gentle infusion."},{"amount":5,"unit":"pieces","name":"Ginkgo nuts","notes":"Shelled, for earthy sweetness."},{"amount":2,"unit":"pieces","name":"Dried astragalus root","notes":"Optional, for additional herbal depth."},{"amount":6,"unit":"cups","name":"Water","notes":"Cold, to build the broth slowly from scratch."}],
          instructions: ["Step 1: The Stuffing. Stuff the cavity of the chicken with the soaked glutinous rice, 2 garlic cloves, 2 jujubes, and the ginkgo nuts. Cross the legs and tie them with kitchen twine to seal the cavity. The rice will expand during cooking, absorbing the rich broth into a savory porridge.","Step 2: The Pot. Place the stuffed chicken breast-side up in a heavy stone pot or Dutch oven. Add the remaining garlic, jujubes, the ginseng root, and astragalus. Pour the cold water over the chicken until it is just submerged.","Step 3: The Simmer. Bring the pot to a boil over high heat, skimming any foam and impurities that rise to the surface during the first 10 minutes. Reduce to the lowest possible simmer, cover, and cook for 2.5 to 3 hours. Do not stir or disturb the chicken.","Step 4: The Check. The soup is ready when the broth has turned opaque and milky white, the meat pulls away from the bone with no resistance, and the rice inside the cavity has swollen into a thick, creamy porridge. The ginseng root should be soft enough to eat.","Step 5: The Serve. Transfer the whole chicken to a deep individual stone bowl. Ladle the milky broth over and around it. Serve with coarse salt and black pepper on the side for each diner to season to their own taste. The ginseng root is eaten alongside the chicken."],
          classifications: {"mealType":["dinner","lunch"],"cookingMethods":["simmering","boiling"]},
          elementalProperties: {"Water":0.45,"Earth":0.3,"Fire":0.15,"Air":0.1},
          astrologicalAffinities: {"planets":["Moon","Jupiter"],"signs":["cancer","sagittarius"],"lunarPhases":["Full Moon"]},

          alchemicalProperties: {"Spirit":1.86,"Essence":2.83,"Matter":3.4,"Substance":3.11},
          thermodynamicProperties: {"heat":0.0335,"entropy":0.2702,"reactivity":1.5614,"gregsEnergy":-0.3884,"kalchm":0.0276,"monica":-0.0376},
          substitutions: [{"originalIngredient":"Fresh ginseng","substituteOptions":["Dried ginseng slices","Ginseng tea bags"]},{"originalIngredient":"Ginkgo nuts","substituteOptions":["Pine nuts","Chestnuts"]}],
            nutritionPerServing: {"calories":269,"proteinG":36,"carbsG":24,"fatG":4,"fiberG":2,"sodiumMg":90,"sugarG":16,"vitamins":["Vitamin B6","Vitamin niacin","Vitamin B12","Vitamin C"],"minerals":["Selenium","Phosphorus","Zinc","Manganese"]}
        },
      ],
    },
    dessert: {
      summer: [
        {
          name: "Patbingsu",
          description: "A towering Korean shaved ice dessert built upon a base of finely shaved milk ice so delicate it resembles fresh snow. The ice is mounded high and crowned with a generous ladle of sweet red bean paste, chewy mochi pieces, a drizzle of sweetened condensed milk, sliced fresh strawberries, and small cubes of rice cake. Each spoonful delivers a cascade of textures: the powdery ice melting instantly on the tongue, the yielding chew of mochi, the creamy sweetness of condensed milk, and the earthy depth of slow-cooked red beans.",
          details: {"cuisine":"Korean","prepTimeMinutes":20,"cookTimeMinutes":0,"baseServingSize":2,"spiceLevel":"None","season":["summer"]},
          ingredients: [{"amount":4,"unit":"cups","name":"Milk ice","notes":"Frozen milk shaved into fine, snow-like flakes using a bingsu machine or finely crushed."},{"amount":0.5,"unit":"cup","name":"Sweet red bean paste","notes":"Slow-cooked azuki beans sweetened with sugar, slightly chunky."},{"amount":6,"unit":"pieces","name":"Mochi","notes":"Small, chewy rice cake balls, store-bought or homemade."},{"amount":3,"unit":"tbsp","name":"Sweetened condensed milk","notes":"Drizzled over the top for creamy sweetness."},{"amount":0.5,"unit":"cup","name":"Fresh strawberries","notes":"Sliced, or substitute seasonal fruit like mango or kiwi."},{"amount":4,"unit":"pieces","name":"Rice cake cubes","notes":"Small tteok pieces, briefly boiled until soft and chewy."}],
          instructions: ["Step 1: The Base. Chill a large serving bowl in the freezer for 10 minutes. Shave the frozen milk into the chilled bowl using a bingsu machine or fine ice shaver, building a tall, fluffy mound. The ice should be powdery and light, not chunky or crystalline.","Step 2: The Red Bean. Spoon the sweet red bean paste directly onto the center peak of the shaved ice. Let it sit as a generous mound on top without mixing it in, so each diner can incorporate it as they eat.","Step 3: The Toppings. Arrange the mochi balls, rice cake cubes, and sliced strawberries around and over the red bean in a decorative pattern. Each topping should be visible and accessible.","Step 4: The Drizzle. Pour the sweetened condensed milk in a slow, thin stream over the entire mountain of shaved ice and toppings, letting it cascade down the sides and pool slightly at the base.","Step 5: The Serve. Present immediately with long spoons. Patbingsu melts quickly, so diners should begin eating from the top down, mixing toppings with the shaved ice as they go. The bottom of the bowl, where melted ice and condensed milk pool, is a coveted final treat."],
          classifications: {"mealType":["dessert","snack"],"cookingMethods":["freezing","assembling"]},
          elementalProperties: {"Water":0.5,"Air":0.3,"Earth":0.15,"Fire":0.05},
          astrologicalAffinities: {"planets":["Moon","Venus"],"signs":["cancer","libra"],"lunarPhases":["Waning Crescent"]},

          alchemicalProperties: {"Spirit":0.93,"Essence":1.99,"Matter":2.16,"Substance":2.07},
          thermodynamicProperties: {"heat":0.0169,"entropy":0.2275,"reactivity":1.7714,"gregsEnergy":-0.3862,"kalchm":0.1545,"monica":0.5468},
          substitutions: [{"originalIngredient":"Milk ice","substituteOptions":["Plain shaved ice with evaporated milk"]},{"originalIngredient":"Mochi","substituteOptions":["Chewy tteok pieces","Jelly cubes"]}],
            nutritionPerServing: {"calories":23,"proteinG":1,"carbsG":5,"fatG":0,"fiberG":0,"sodiumMg":1,"sugarG":4,"vitamins":["Vitamin B1","Vitamin B6"],"minerals":["Iron","Potassium","Magnesium"]}
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

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4188},
          substitutions: [{"originalIngredient":"Primary ingredient for Hotteok","substituteOptions":["Elemental equivalent"]}],
            nutritionPerServing: {"calories":0,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sodiumMg":0,"sugarG":0,"vitamins":[],"minerals":[]}
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

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4188},
          substitutions: [{"originalIngredient":"Primary ingredient for Songpyeon","substituteOptions":["Elemental equivalent"]}],
            nutritionPerServing: {"calories":0,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sodiumMg":0,"sugarG":0,"vitamins":[],"minerals":[]}
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

          alchemicalProperties: {"Spirit":0.7,"Essence":0.7,"Matter":0.7,"Substance":0.7},
          thermodynamicProperties: {"heat":0.068,"entropy":0.3061,"reactivity":1.8366,"gregsEnergy":-0.4941,"kalchm":1.0,"monica":0.4188},
          substitutions: [{"originalIngredient":"Primary ingredient for Japchae","substituteOptions":["Elemental equivalent"]}],
            nutritionPerServing: {"calories":0,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sodiumMg":0,"sugarG":0,"vitamins":[],"minerals":[]}
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
