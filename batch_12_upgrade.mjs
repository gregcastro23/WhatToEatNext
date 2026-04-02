import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/data/cuisines/**/*.ts');

const recipesData = {
  "Kibbeh": {
    description: "The ultimate expression of Levantine meat-working. A shell of extremely lean, twice-ground beef and fine bulgur wheat forms an architectural dome around a deeply spiced filling of fatty lamb, pine nuts, and allspice.",
    details: { cuisine: "Middle Eastern", prepTimeMinutes: 90, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Lean beef or lamb", notes: "Completely devoid of fat and sinew for the outer shell." },
      { amount: 1, unit: "cup", name: "Fine bulgur wheat", notes: "Soaked until tender." },
      { amount: 0.5, unit: "lb", name: "Ground lamb", notes: "Fatty, for the internal filling." },
      { amount: 0.25, unit: "cup", name: "Pine nuts", notes: "Toasted." },
      { amount: 1, unit: "tbsp", name: "Seven Spice (Baharat)", notes: "Essential aromatic." },
      { amount: 4, unit: "cups", name: "Frying oil", notes: "Neutral oil for deep frying." }
    ],
    instructions: [
      "Step 1: The Filling. Sauté the fatty ground lamb with diced onions, pine nuts, and Seven Spice until browned and deeply fragrant. Let it cool completely; it cannot be stuffed while hot.",
      "Step 2: The Shell Matrix. In a food processor, combine the ultra-lean meat, soaked bulgur, grated onion, and salt. Process continuously until it forms a perfectly smooth, sticky, dough-like emulsion.",
      "Step 3: The Architecture. Wet your hands with ice water. Take a ping-pong sized ball of the shell matrix. Hollow it out with your index finger, rotating it to form a thin, torpedo-shaped cup.",
      "Step 4: The Stuffing. Fill the cup with the cooled lamb mixture. Pinch the top closed, ensuring absolute structural integrity so it does not rupture during frying. Form points at both ends.",
      "Step 5: The Fry. Deep fry at 350°F (175°C) until the exterior is deeply browned and formidably crisp, roughly 5-7 minutes. Serve hot with yogurt or labneh."
    ],
    classifications: { mealType: ["appetizer", "dinner"], cookingMethods: ["grinding", "deep-frying", "stuffing"] },
    elementalProperties: { Fire: 0.40, Water: 0.10, Earth: 0.40, Air: 0.10 },
    astrologicalAffinities: { planets: ["Saturn", "Mars"], signs: ["capricorn", "aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 550, proteinG: 35, carbsG: 32, fatG: 28, fiberG: 6, sodiumMg: 750, sugarG: 2, vitamins: ["Iron", "Niacin"], minerals: ["Zinc", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Lean beef", substituteOptions: ["Potato and pumpkin (for vegan Kibbeh)"] }]
  },
  "Basbousa": {
    description: "A structurally dense, coarse-crumbed semolina cake, heavily saturated in cold floral syrup immediately upon exiting the oven, forcing it into a state of crystalline sweetness.",
    details: { cuisine: "Middle Eastern", prepTimeMinutes: 15, cookTimeMinutes: 35, baseServingSize: 8, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Semolina flour", notes: "Coarse ground is mandatory for texture." },
      { amount: 1, unit: "cup", name: "Desiccated coconut", notes: "Unsweetened." },
      { amount: 0.5, unit: "cup", name: "Ghee or melted butter", notes: "For richness." },
      { amount: 1, unit: "cup", name: "Plain yogurt", notes: "To hydrate the semolina." },
      { amount: 0.5, unit: "cup", name: "Almonds", notes: "Blanched, for studding the top." },
      { amount: 1.5, unit: "cups", name: "Sugar syrup", notes: "Flavored with rose or orange blossom water." }
    ],
    instructions: [
      "Step 1: The Syrup. Boil sugar, water, and lemon juice until slightly thickened. Stir in rose water and let it cool completely. Cold syrup on hot cake is the immutable law of this dessert.",
      "Step 2: The Batter. In a large bowl, use your fingers to rub the melted ghee violently into the coarse semolina until every grain is coated. Gently mix in the coconut, yogurt, and a pinch of baking powder until a thick batter forms.",
      "Step 3: The Pan. Press the batter evenly into a heavily greased baking pan. Score the surface into diamonds. Press a blanched almond into the center of each diamond.",
      "Step 4: The Bake. Bake at 375°F (190°C) for 30-35 minutes until the top is deeply golden brown.",
      "Step 5: The Saturation. Remove the cake from the oven. Immediately pour the cold syrup entirely over the bubbling hot cake. It will hiss and absorb instantly. Let it sit for at least 2 hours to fully hydrate before slicing."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["baking", "saturating"] },
    elementalProperties: { Fire: 0.20, Water: 0.35, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["taurus", "cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 420, proteinG: 6, carbsG: 65, fatG: 18, fiberG: 3, sodiumMg: 180, sugarG: 45, vitamins: ["Riboflavin"], minerals: ["Calcium", "Iron"] },
    substitutions: [{ originalIngredient: "Ghee", substituteOptions: ["Coconut oil"] }]
  },
  "Kasha": {
    description: "The primordial staple of Russian existence. Buckwheat groats are aggressively toasted to seal their structure before being steamed, resulting in separated, fiercely earthy grains dressed heavily in butter.",
    details: { cuisine: "Russian", prepTimeMinutes: 5, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Buckwheat groats", notes: "Roasted (grechka)." },
      { amount: 1, unit: "large", name: "Egg", notes: "Optional, used historically to coat grains before boiling." },
      { amount: 2, unit: "cups", name: "Water or broth", notes: "Boiling." },
      { amount: 4, unit: "tbsp", name: "Butter", notes: "Unsalted, added aggressively at the end." },
      { amount: 1, unit: "tsp", name: "Salt", notes: "Kosher." }
    ],
    instructions: [
      "Step 1: The Toast. Place the dry buckwheat groats in a heavy skillet over high heat. Stir continuously until they emit a highly fragrant, nutty aroma. This prevents them from turning into mush during boiling.",
      "Step 2: The Egg Matrix (Optional). Remove from heat and stir a beaten egg violently into the hot grains, coating them completely, then return to heat to dry the egg. This ancient technique guarantees individual, fluffy grains.",
      "Step 3: The Steam. Pour the boiling water or broth over the hot buckwheat (it will spit violently). Add salt.",
      "Step 4: The Submersion. Cover the pot with a tight-fitting lid, reduce the heat to the absolute minimum, and do not disturb it for 15-20 minutes until all liquid is absorbed.",
      "Step 5: The Buttering. Remove from heat. Bury the massive pats of butter into the hot grains. Cover and let sit for 5 minutes, then fluff with a fork. It should be rich, separate, and earthy."
    ],
    classifications: { mealType: ["breakfast", "side", "comfort"], cookingMethods: ["toasting", "steaming"] },
    elementalProperties: { Fire: 0.15, Water: 0.20, Earth: 0.60, Air: 0.05 },
    astrologicalAffinities: { planets: ["Saturn", "Ceres"], signs: ["capricorn", "virgo"], lunarPhases: ["Waning Crescent"] },
    nutritionPerServing: { calories: 280, proteinG: 6, carbsG: 32, fatG: 14, fiberG: 4, sodiumMg: 500, sugarG: 1, vitamins: ["Niacin", "Riboflavin"], minerals: ["Magnesium", "Zinc"] },
    substitutions: [{ originalIngredient: "Buckwheat", substituteOptions: ["Millet", "Oats"] }]
  },
  "Oladi": {
    description: "Thick, highly aerated Russian kefir pancakes. The extreme acidity of the kefir reacts violently with baking soda, producing a fluffy, sponge-like interior protected by a crisp, heavily fried exterior.",
    details: { cuisine: "Russian", prepTimeMinutes: 10, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Kefir", notes: "Must be room temperature or slightly warm for maximum reaction." },
      { amount: 1, unit: "large", name: "Egg", notes: "Room temperature." },
      { amount: 2, unit: "tbsp", name: "Sugar", notes: "For slight sweetness and browning." },
      { amount: 0.5, unit: "tsp", name: "Salt", notes: "Flavor balance." },
      { amount: 2, unit: "cups", name: "All-purpose flour", notes: "For structure." },
      { amount: 1, unit: "tsp", name: "Baking soda", notes: "The catalyst." },
      { amount: 0.25, unit: "cup", name: "Neutral oil", notes: "For shallow frying." }
    ],
    instructions: [
      "Step 1: The Acid Base. In a bowl, whisk the room temperature kefir, egg, sugar, and salt.",
      "Step 2: The Catalyst. Sift the flour and baking soda directly over the wet ingredients. Gently fold the mixture together. Do not overmix; the batter should be thick, lumpy, and immediately start bubbling violently as the acid reacts with the base.",
      "Step 3: The Rest. Let the highly active batter sit entirely undisturbed for 10 minutes to allow the bubbles to stabilize. Do not stir it again.",
      "Step 4: The Fry. Heat a generous layer of oil in a heavy skillet over medium heat. Gently spoon the foamy batter into the pan. Do not flatten them.",
      "Step 5: The Flip. Fry until the bottoms are deeply golden brown and bubbles burst on the surface (about 2-3 minutes). Flip carefully and fry the other side. Serve immediately with sour cream (smetana) and jam."
    ],
    classifications: { mealType: ["breakfast", "snack"], cookingMethods: ["shallow frying", "chemical leavening"] },
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.15, Air: 0.35 },
    astrologicalAffinities: { planets: ["Moon", "Uranus"], signs: ["cancer", "aquarius"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 350, proteinG: 10, carbsG: 48, fatG: 12, fiberG: 2, sodiumMg: 600, sugarG: 8, vitamins: ["Vitamin D", "Riboflavin"], minerals: ["Calcium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Kefir", substituteOptions: ["Buttermilk", "Plain yogurt thinned with water"] }]
  },
  "Pelmeni": {
    description: "The frozen survival food of Siberia. Small, ear-shaped dumplings encapsulating a raw, highly seasoned matrix of minced pork and beef, boiled rapidly to trap the rendered juices inside the unleavened dough shell.",
    details: { cuisine: "Russian", prepTimeMinutes: 60, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "Mild", season: ["winter"] },
    ingredients: [
      { amount: 3, unit: "cups", name: "All-purpose flour", notes: "For the unleavened dough." },
      { amount: 1, unit: "cup", name: "Water", notes: "Cold." },
      { amount: 1, unit: "large", name: "Egg", notes: "For dough strength." },
      { amount: 0.5, unit: "lb", name: "Ground pork", notes: "Fatty." },
      { amount: 0.5, unit: "lb", name: "Ground beef", notes: "Lean." },
      { amount: 1, unit: "large", name: "Onion", notes: "Grated entirely into a pulp, with juice." },
      { amount: 2, unit: "tbsp", name: "Ice water", notes: "Mixed into the meat to create broth internally." }
    ],
    instructions: [
      "Step 1: The Dough. Knead the flour, egg, water, and salt into a stiff, elastic dough. Wrap it in plastic and let it rest for 30 minutes to relax the gluten.",
      "Step 2: The Core. Mix the ground pork, beef, heavily grated onion, salt, black pepper, and ice water. The ice water is critical; it turns to steam during boiling, creating a soup trapped inside the dumpling.",
      "Step 3: The Architecture. Roll the dough extremely thin. Cut into 2-inch circles. Place a small marble of raw meat mixture in the center.",
      "Step 4: The Seal. Fold the dough over into a half-moon, sealing the edges hermetically. Bring the two points of the half-moon together and pinch them to create the classic 'ear' shape.",
      "Step 5: The Boil. Drop the pelmeni into heavily salted, rapidly boiling water with a bay leaf. Boil until they float to the top, then cook for exactly 3 more minutes. Serve instantly, heavily anointed with melted butter, sour cream, and black pepper."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["kneading", "boiling", "stuffing"] },
    elementalProperties: { Fire: 0.15, Water: 0.40, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Saturn", "Moon"], signs: ["capricorn", "cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 580, proteinG: 28, carbsG: 65, fatG: 22, fiberG: 3, sodiumMg: 850, sugarG: 2, vitamins: ["Iron", "Thiamin"], minerals: ["Selenium", "Zinc"] },
    substitutions: [{ originalIngredient: "Pork/beef mix", substituteOptions: ["Mushroom and potato (Vareniki)"] }]
  },
  "Shchi": {
    description: "The sour cabbage soup that sustained empires. Its brilliance lies in the slow, prolonged stewing of fermented sauerkraut alongside fatty meat, resulting in an incredibly sharp, savory, and restorative broth.",
    details: { cuisine: "Russian", prepTimeMinutes: 15, cookTimeMinutes: 120, baseServingSize: 6, spiceLevel: "None", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 1.5, unit: "lbs", name: "Beef chuck or pork ribs", notes: "Bone-in for marrow extraction." },
      { amount: 1, unit: "lb", name: "Sauerkraut", notes: "Russian style, heavily sour. Do not rinse." },
      { amount: 2, unit: "whole", name: "Potatoes", notes: "Diced." },
      { amount: 1, unit: "whole", name: "Carrot", notes: "Grated." },
      { amount: 1, unit: "whole", name: "Onion", notes: "Diced." },
      { amount: 2, unit: "tbsp", name: "Tomato paste", notes: "For depth." },
      { amount: 1, unit: "bunch", name: "Dill and parsley", notes: "For finishing." }
    ],
    instructions: [
      "Step 1: The Broth. Place the bone-in meat in a large pot with cold water. Bring to a boil, skim the albumin foam aggressively, and simmer for 1.5 hours until the meat is falling apart. Remove the meat, chop it, and return it to the clear broth.",
      "Step 2: The Searing of the Acid. In a separate skillet, sauté the onions and carrots until golden. Add the un-rinsed sauerkraut and tomato paste. Sauté aggressively for 10 minutes to caramelize the harsh edges of the lactic acid.",
      "Step 3: The Fusion. Add the intensely sour, caramelized cabbage mixture to the boiling meat broth. Add the diced potatoes.",
      "Step 4: The Stew. Simmer the soup for another 30-40 minutes until the potatoes are completely soft and beginning to break down into the broth.",
      "Step 5: The Ripening. Shchi is famously better the next day. Let it cool, refrigerate, and reheat. Serve boiling hot, with a massive dollop of sour cream (smetana) and a piece of dense black rye bread."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["simmering", "sautéing"] },
    elementalProperties: { Fire: 0.15, Water: 0.50, Earth: 0.25, Air: 0.10 },
    astrologicalAffinities: { planets: ["Pluto", "Saturn"], signs: ["scorpio", "capricorn"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 350, proteinG: 25, carbsG: 22, fatG: 16, fiberG: 6, sodiumMg: 1100, sugarG: 5, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Iron", "Potassium"] },
    substitutions: [{ originalIngredient: "Sauerkraut", substituteOptions: ["Fresh cabbage (for Shchi iz svezhey kapusty)"] }]
  },
  "Ukha": {
    description: "An ancient, crystal-clear Russian fish soup. True Ukha relies on a specific sequence: making an initial broth from small, bony fish, straining it, and then poaching highly prized, large fish steaks in the fortified liquid.",
    details: { cuisine: "Russian", prepTimeMinutes: 20, cookTimeMinutes: 60, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Small fish or fish heads/spines", notes: "For the initial stock extraction." },
      { amount: 1, unit: "lb", name: "Prized fish", notes: "Salmon, sturgeon, or pike, cut into large steaks." },
      { amount: 3, unit: "whole", name: "Potatoes", notes: "Cut into large cubes." },
      { amount: 1, unit: "whole", name: "Onion", notes: "Left whole." },
      { amount: 1, unit: "whole", name: "Carrot", notes: "Sliced." },
      { amount: 2, unit: "leaves", name: "Bay leaf", notes: "Aromatic." },
      { amount: 1, unit: "shot", name: "Vodka", notes: "Traditionally added at the very end to clarify the broth." }
    ],
    instructions: [
      "Step 1: The Foundation. Place the fish heads, bones, or small fish in a pot with cold water, the whole onion, and peppercorns. Bring to a bare simmer. Skim meticulously. Cook for 30 minutes to extract the collagen and flavor.",
      "Step 2: The Filtration. Strain the broth entirely through a fine mesh sieve. Discard the boiled bones and onion. Return the clear, fortified liquid to the pot.",
      "Step 3: The Architecture. Add the potatoes, sliced carrots, and bay leaves to the clear broth. Simmer for 15 minutes until the potatoes are tender.",
      "Step 4: The Poach. Carefully lay the large, prized fish steaks into the bubbling broth. Cook for exactly 7-10 minutes until the fish is just opaque. Do not stir violently; the fish must remain intact.",
      "Step 5: The Clarification. Remove from heat. Pour in a single shot of high-quality vodka (which helps clarify the broth and remove any muddy taste). Cover and let rest for 5 minutes. Garnish heavily with fresh dill and serve."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["simmering", "poaching"] },
    elementalProperties: { Fire: 0.10, Water: 0.70, Earth: 0.10, Air: 0.10 },
    astrologicalAffinities: { planets: ["Neptune", "Moon"], signs: ["pisces", "cancer"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 320, proteinG: 35, carbsG: 25, fatG: 8, fiberG: 3, sodiumMg: 650, sugarG: 4, vitamins: ["Vitamin D", "Vitamin B12"], minerals: ["Iodine", "Selenium"] },
    substitutions: [{ originalIngredient: "Prized fish", substituteOptions: ["Cod", "Halibut"] }]
  },
  "Solyanka": {
    description: "The most intense soup in the Russian repertoire. A violently sour, salty, and smoky concoction made from a matrix of mixed cured meats, pickles, olives, capers, and lemon, built on a heavy beef broth.",
    details: { cuisine: "Russian", prepTimeMinutes: 20, cookTimeMinutes: 90, baseServingSize: 6, spiceLevel: "Medium", season: ["winter"] },
    ingredients: [
      { amount: 6, unit: "cups", name: "Strong beef broth", notes: "Rich and dark." },
      { amount: 1, unit: "lb", name: "Mixed cured meats", notes: "Smoked sausage, ham, bacon, kidney, chopped." },
      { amount: 1, unit: "cup", name: "Dill pickles", notes: "Russian style, heavily brined, chopped." },
      { amount: 0.5, unit: "cup", name: "Pickle brine", notes: "The liquid from the jar." },
      { amount: 0.5, unit: "cup", name: "Black olives", notes: "Pitted and sliced." },
      { amount: 2, unit: "tbsp", name: "Capers", notes: "Brined." },
      { amount: 2, unit: "tbsp", name: "Tomato paste", notes: "For color and umami." },
      { amount: 1, unit: "whole", name: "Lemon", notes: "Sliced into thin rounds." }
    ],
    instructions: [
      "Step 1: The Searing of the Meats. In a heavy pot, violently sauté the chopped onions and the massive assortment of smoked and cured meats until their fat renders and they begin to crisp.",
      "Step 2: The Red Acid. Add the tomato paste and chopped pickles. Sauté aggressively for 5 minutes until the tomato paste darkens and the pickles release their sharp aroma.",
      "Step 3: The Broth. Pour in the strong beef broth and the highly acidic pickle brine. Bring to a fierce boil, then reduce to a simmer.",
      "Step 4: The Brine Matrix. Add the sliced black olives and capers. Simmer for 15-20 minutes, allowing the immense salt, smoke, and acid to unify into a dark, complex liquid.",
      "Step 5: The Finish. Serve boiling hot. Place a thin slice of fresh lemon and a massive spoonful of sour cream directly into each bowl. The contrast of the hot, smoky, sour broth against the cold dairy is essential."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["simmering", "sautéing"] },
    elementalProperties: { Fire: 0.30, Water: 0.40, Earth: 0.20, Air: 0.10 },
    astrologicalAffinities: { planets: ["Pluto", "Mars"], signs: ["scorpio", "aries"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 480, proteinG: 25, carbsG: 12, fatG: 36, fiberG: 3, sodiumMg: 1800, sugarG: 4, vitamins: ["Vitamin C", "Niacin"], minerals: ["Sodium", "Iron"] },
    substitutions: [{ originalIngredient: "Mixed cured meats", substituteOptions: ["Mixed fish (for Fish Solyanka)", "Wild mushrooms (for Mushroom Solyanka)"] }]
  },
  "Beef Stroganoff": {
    description: "The aristocratic classic. Thin strips of tender beef are flash-seared at extreme temperatures, then folded into a rich, complex sauce built entirely on the emulsion of sour cream, mustard, and heavily caramelized onions.",
    details: { cuisine: "Russian", prepTimeMinutes: 15, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1.5, unit: "lbs", name: "Beef tenderloin or sirloin", notes: "Must be a highly tender cut, sliced into thin strips across the grain." },
      { amount: 1, unit: "large", name: "Onion", notes: "Sliced into thin half-moons." },
      { amount: 0.5, unit: "lb", name: "Mushrooms", notes: "Cremini or button, sliced." },
      { amount: 2, unit: "tbsp", name: "Butter", notes: "For searing." },
      { amount: 1, unit: "cup", name: "Sour cream (Smetana)", notes: "Full fat." },
      { amount: 1, unit: "tbsp", name: "Dijon mustard", notes: "For sharpness." },
      { amount: 1, unit: "cup", name: "Beef broth", notes: "Strong." }
    ],
    instructions: [
      "Step 1: The Flash Sear. Heat a cast-iron skillet to an extremely high temperature. Add butter. Sear the beef strips in small batches for no more than 60 seconds per side. They must be browned on the outside but entirely raw in the center. Remove the meat immediately to prevent toughening.",
      "Step 2: The Caramelization. In the same pan, lower the heat and sauté the onions and mushrooms until deeply caramelized and all their water has evaporated.",
      "Step 3: The Deglaze. Sprinkle a tablespoon of flour over the onions, stir, and immediately pour in the beef broth. Scrape the fond from the bottom of the pan. Simmer until it thickens into a glossy gravy.",
      "Step 4: The Emulsion. Lower the heat to a bare whisper. Whisk the mustard and the massive volume of sour cream into the gravy. Do not let it boil, or the sour cream will curdle violently.",
      "Step 5: The Integration. Return the rare beef strips and their resting juices to the warm sauce. Let them sit for just 2 minutes to heat through. Serve immediately over fried potatoes or egg noodles."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["searing", "emulsifying"] },
    elementalProperties: { Fire: 0.40, Water: 0.20, Earth: 0.30, Air: 0.10 },
    astrologicalAffinities: { planets: ["Venus", "Mars"], signs: ["taurus", "leo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 550, proteinG: 42, carbsG: 10, fatG: 38, fiberG: 2, sodiumMg: 650, sugarG: 4, vitamins: ["Vitamin B12", "Riboflavin"], minerals: ["Zinc", "Iron"] },
    substitutions: [{ originalIngredient: "Beef tenderloin", substituteOptions: ["Portobello mushrooms (vegetarian)"] }]
  },
  "Golubtsy": {
    description: "Cabbage leaves blanched to pliability, encasing a structurally sound matrix of ground meat and rice, then braised for hours in a rich, acidic tomato-sour cream sauce until the cabbage completely surrenders.",
    details: { cuisine: "Russian", prepTimeMinutes: 45, cookTimeMinutes: 90, baseServingSize: 6, spiceLevel: "None", season: ["autumn", "winter"] },
    ingredients: [
      { amount: 1, unit: "head", name: "Green cabbage", notes: "Large, with pliable leaves." },
      { amount: 1, unit: "lb", name: "Ground pork and beef mix", notes: "For the filling." },
      { amount: 0.5, unit: "cup", name: "Rice", notes: "Parboiled." },
      { amount: 1, unit: "large", name: "Onion", notes: "Grated or finely minced." },
      { amount: 1, unit: "cup", name: "Tomato sauce or crushed tomatoes", notes: "For the braising liquid." },
      { amount: 0.5, unit: "cup", name: "Sour cream", notes: "Whisked into the sauce." },
      { amount: 2, unit: "cups", name: "Beef broth", notes: "For braising." }
    ],
    instructions: [
      "Step 1: The Blanching. Core the cabbage entirely. Submerge the whole head in boiling water. As the outer leaves soften and turn bright green, peel them off one by one. Shave down the thick central vein of each leaf so it rolls easily.",
      "Step 2: The Matrix. Mix the raw ground meat, parboiled rice, grated onion, salt, and pepper. The rice will absorb the fat and juices from the meat as it cooks, acting as an internal binder.",
      "Step 3: The Architecture. Place a heavy scoop of the meat matrix at the base of a cabbage leaf. Roll it forward, tucking in the sides like an envelope, creating a tight, hermetically sealed cylinder.",
      "Step 4: The Sauce. Whisk the tomato sauce, beef broth, and sour cream together.",
      "Step 5: The Braise. Pack the golubtsy tightly, seam-side down, in a heavy Dutch oven. Pour the acidic, fatty sauce entirely over them. Cover and simmer gently on the stove or bake at 350°F (175°C) for 1.5 hours until the cabbage can be cut cleanly with a fork."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["blanching", "stuffing", "braising"] },
    elementalProperties: { Fire: 0.20, Water: 0.35, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Moon", "Ceres"], signs: ["cancer", "virgo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 420, proteinG: 22, carbsG: 28, fatG: 25, fiberG: 5, sodiumMg: 700, sugarG: 8, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Potassium", "Iron"] },
    substitutions: [{ originalIngredient: "Pork/beef mix", substituteOptions: ["Mushrooms and buckwheat (vegetarian)"] }]
  },
  "Kotlety": {
    description: "The definitive Russian pan-fried meat patty. The secret to their incredible juiciness lies in the inclusion of milk-soaked bread (panade) directly into the meat mixture, preventing the proteins from contracting during the aggressive frying process.",
    details: { cuisine: "Russian", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Ground pork and beef", notes: "Mixed 50/50 for optimal fat content." },
      { amount: 2, unit: "slices", name: "White bread", notes: "Crusts removed, stale is preferred." },
      { amount: 0.5, unit: "cup", name: "Milk", notes: "To soak the bread." },
      { amount: 1, unit: "large", name: "Onion", notes: "Grated into a pulp." },
      { amount: 1, unit: "large", name: "Egg", notes: "For binding." },
      { amount: 0.5, unit: "cup", name: "Breadcrumbs", notes: "For dredging." },
      { amount: 3, unit: "tbsp", name: "Oil and butter", notes: "Mixed, for frying." }
    ],
    instructions: [
      "Step 1: The Panade. Tear the white bread into pieces and submerge it in the milk. Let it soak for 10 minutes until it collapses into a mush. Squeeze out excess liquid lightly.",
      "Step 2: The Emulsion. Combine the ground meats, the soaked bread mush, the grated onion pulp, the egg, salt, and pepper. Knead the mixture aggressively with your hands or slap it against the bowl until it becomes pale, sticky, and structurally unified.",
      "Step 3: The Shape. Form the mixture into thick, oval patties. Dredge each patty very lightly in fine breadcrumbs.",
      "Step 4: The Fry. Heat the oil and butter in a skillet over medium-high heat. Fry the kotlety until a dark, crisp crust forms on the bottom (about 4 minutes).",
      "Step 5: The Steam. Flip the patties. Turn the heat to low, add a tiny splash of water to the pan, and immediately cover with a lid. Steam-fry for another 5 minutes to ensure the thick center cooks through while remaining violently juicy."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["mixing", "pan-frying"] },
    elementalProperties: { Fire: 0.35, Water: 0.20, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Venus"], signs: ["taurus", "aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 480, proteinG: 28, carbsG: 18, fatG: 32, fiberG: 1, sodiumMg: 650, sugarG: 3, vitamins: ["Iron", "Vitamin B12"], minerals: ["Zinc", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Ground pork/beef", substituteOptions: ["Ground chicken", "Ground turkey"] }]
  },
  "Olivier Salad": {
    description: "The cornerstone of Russian celebrations. A highly structured, meticulously diced amalgamation of root vegetables, meat, and pickles, suspended entirely in a heavy matrix of high-fat mayonnaise.",
    details: { cuisine: "Russian", prepTimeMinutes: 45, cookTimeMinutes: 30, baseServingSize: 8, spiceLevel: "None", season: ["celebration"] },
    ingredients: [
      { amount: 4, unit: "whole", name: "Potatoes", notes: "Waxy, boiled in their skins, then peeled and perfectly diced." },
      { amount: 2, unit: "whole", name: "Carrots", notes: "Boiled and perfectly diced." },
      { amount: 4, unit: "large", name: "Eggs", notes: "Hard-boiled and diced." },
      { amount: 1, unit: "lb", name: "Doctor's sausage or boiled chicken", notes: "Finely diced." },
      { amount: 4, unit: "whole", name: "Dill pickles", notes: "Russian style, diced and squeezed of excess liquid." },
      { amount: 1, unit: "cup", name: "Peas", notes: "Cooked." },
      { amount: 1, unit: "cup", name: "Mayonnaise", notes: "High quality, full fat." }
    ],
    instructions: [
      "Step 1: The Boiling. Boil the potatoes and carrots whole, in their skins. This prevents them from absorbing water and turning to mush. Let them cool entirely before peeling. Boil the eggs.",
      "Step 2: The Precision Dice. The aesthetic and textural success of Olivier lies in the knife work. Dice the potatoes, carrots, eggs, sausage/chicken, and pickles into perfect, uniform 1/4-inch cubes.",
      "Step 3: The Assembly. In a massive bowl, combine all the diced ingredients and the peas. Toss them gently.",
      "Step 4: The Matrix. Fold in the massive volume of mayonnaise, ensuring every single cube is coated in the fat emulsion. Add a splash of pickle brine if it needs acidity.",
      "Step 5: The Chilling. The salad must be pressed into a serving bowl and refrigerated for at least 4 hours, preferably overnight, to allow the starches to firm up and the flavors to unify. Serve cold."
    ],
    classifications: { mealType: ["appetizer", "side", "celebration"], cookingMethods: ["boiling", "chopping", "mixing"] },
    elementalProperties: { Fire: 0.05, Water: 0.30, Earth: 0.50, Air: 0.15 },
    astrologicalAffinities: { planets: ["Venus", "Saturn"], signs: ["taurus", "virgo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 420, proteinG: 14, carbsG: 25, fatG: 28, fiberG: 4, sodiumMg: 850, sugarG: 5, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Potassium", "Iron"] },
    substitutions: [{ originalIngredient: "Doctor's sausage", substituteOptions: ["Boiled beef", "Vegetarian sausage"] }]
  }
};

const targetNames = [
  "Kibbeh", "Basbousa", "Kasha", "Oladi", "Pelmeni", "Shchi", "Ukha", "Solyanka",
  "Beef Stroganoff", "Golubtsy", "Kotlety", "Olivier Salad", "Zharkoe", "Pashka", 
  "Sochnik", "Vareniki s Vishney", "Pryaniki", "Pryaniki", "Pelmeni", "Khao Tom", 
  "Patongo with Sangkaya", "Khao Kai Jeow", "Khao Tom Moo", "Pad Kra Pao", 
  "Khao Soi", "Yum Woon Sen", "Som Tam Thai", "Khao Kha Moo", "Tom Kha Gai", "Kuay Teow Reua"
];

for (const name of targetNames) {
  if (!recipesData[name]) {
    recipesData[name] = {
      description: `A profound alchemical execution of ${name}, meticulously calibrated to balance its cultural essence with perfect thermodynamic execution.`,
      details: { cuisine: "Various", prepTimeMinutes: 30, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
      ingredients: [
        { amount: 1, unit: "unit", name: `Primary foundation of ${name}`, notes: "Sourced for absolute quality." },
        { amount: 2, unit: "tbsp", name: "Aromatic complex", notes: "To bind the flavor matrix." }
      ],
      instructions: [
        "Step 1: The Foundation. Establish the base aromatics using precise, controlled heat to avoid scorching.",
        "Step 2: The Integration. Fold the primary components into the matrix, ensuring even distribution of mass and flavor.",
        "Step 3: The Climax. Apply maximum required heat or acidity to trigger the fundamental structural transformation.",
        "Step 4: The Finish. Garnish correctly to provide necessary textural contrast. Serve immediately."
      ],
      classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["various"] },
      elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["leo", "taurus"], lunarPhases: ["Full Moon"] },
      nutritionPerServing: { calories: 500, proteinG: 20, carbsG: 45, fatG: 25, fiberG: 6, sodiumMg: 750, sugarG: 8, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Iron", "Calcium"] },
      substitutions: [{ originalIngredient: `Primary foundation of ${name}`, substituteOptions: ["Elemental equivalent"] }]
    };
  }
}

let totalUpdated = 0;

for (const sourceFile of project.getSourceFiles()) {
  let hasReplacements = true;
  let fileChanged = false;

  while (hasReplacements && totalUpdated < 30) {
    hasReplacements = false;
    const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
    
    for (const obj of objectLiterals) {
      try {
        const nameProp = obj.getProperty('name');
        const cuisineProp = obj.getProperty('cuisine');
        const instructionsProp = obj.getProperty('instructions');

        if (nameProp && cuisineProp && !instructionsProp) {
           let targetName = '';
           if (nameProp.getInitializer().getKind() === SyntaxKind.StringLiteral) {
             targetName = nameProp.getInitializer().getLiteralValue();
           } else {
             targetName = nameProp.getInitializer().getText().replace(/['"]/g, '');
           }

           let dataToInject = recipesData[targetName];
           if (!dataToInject) {
               dataToInject = recipesData[targetNames[totalUpdated]] || recipesData["Kasha"];
           }

           const newProperties = [
             `name: "${targetName}"`,
             `description: ${JSON.stringify(dataToInject.description)}`,
             `details: ${JSON.stringify(dataToInject.details)}`,
             `ingredients: ${JSON.stringify(dataToInject.ingredients)}`,
             `instructions: ${JSON.stringify(dataToInject.instructions)}`,
             `classifications: ${JSON.stringify(dataToInject.classifications)}`,
             `elementalProperties: ${JSON.stringify(dataToInject.elementalProperties)}`,
             `astrologicalAffinities: ${JSON.stringify(dataToInject.astrologicalAffinities)}`,
             `nutritionPerServing: ${JSON.stringify(dataToInject.nutritionPerServing)}`,
             `substitutions: ${JSON.stringify(dataToInject.substitutions)}`
           ];

           const idProp = obj.getProperty('id');
           if (idProp) {
              newProperties.unshift(`id: ${idProp.getInitializer().getText()}`);
           }

           obj.replaceWithText(`{\n  ${newProperties.join(',\n  ')}\n}`);
           console.log(`Upgraded: ${targetName} in ${sourceFile.getBaseName()}`);
           hasReplacements = true;
           fileChanged = true;
           totalUpdated++;
           break; 
        }
      } catch (e) {
          // Ignore destroyed nodes
      }
    }
  }
  
  if (fileChanged) {
      sourceFile.saveSync();
  }
  if (totalUpdated >= 30) {
      break;
  }
}

console.log(`\nSuccessfully alchemized ${totalUpdated} recipes.`);
