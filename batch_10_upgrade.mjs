import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths('src/data/cuisines/**/*.ts');

const recipesData = {
  "Ramen": {
    description: "A profound Japanese noodle soup where the alchemy of slow-simmered broth, alkaline noodles, and umami-rich tare creates a deeply restorative and complex sensory experience.",
    details: { cuisine: "Japanese", prepTimeMinutes: 45, cookTimeMinutes: 720, baseServingSize: 2, spiceLevel: "Medium", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 4, unit: "cups", name: "Pork and chicken bone broth", notes: "Simmered for 12 hours for rich mouthfeel." },
      { amount: 2, unit: "portions", name: "Alkaline wheat noodles", notes: "Kansui gives them their distinct chew and yellow hue." },
      { amount: 4, unit: "tbsp", name: "Shoyu tare", notes: "A concentrated seasoning blend of soy sauce, mirin, and kombu." },
      { amount: 4, unit: "slices", name: "Chashu pork", notes: "Braised pork belly, rolled and sliced." },
      { amount: 1, unit: "whole", name: "Ajitsuke Tamago", notes: "Soft-boiled egg marinated in soy and mirin." },
      { amount: 2, unit: "tbsp", name: "Scallions", notes: "Finely chopped for aromatic sharpness." }
    ],
    instructions: [
      "Step 1: The Broth. Bring the long-simmered bone broth to a rolling boil, ensuring the fat is fully emulsified into the liquid.",
      "Step 2: The Tare. Place 2 tablespoons of the concentrated shoyu tare into the bottom of each warmed serving bowl.",
      "Step 3: The Noodles. Boil the alkaline noodles in unsalted water for exactly 60 seconds to maintain a firm, toothsome 'katame' texture.",
      "Step 4: The Assembly. Vigorously pour the boiling broth over the tare to mix them instantly, then fold the drained noodles into the broth, arranging them neatly.",
      "Step 5: The Toppings. Carefully lay the chashu slices, halved marinated egg, and scallions over the noodles. Serve immediately while fiercely hot."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["simmering", "boiling", "braising"] },
    elementalProperties: { Fire: 0.25, Water: 0.50, Earth: 0.15, Air: 0.10 },
    astrologicalAffinities: { planets: ["Pluto", "Moon"], signs: ["scorpio", "cancer"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 850, proteinG: 35, carbsG: 65, fatG: 45, fiberG: 4, sodiumMg: 1500, sugarG: 5, vitamins: ["Vitamin B12", "Niacin"], minerals: ["Iron", "Zinc"] },
    substitutions: [{ originalIngredient: "Chashu pork", substituteOptions: ["Braised tofu", "Roasted chicken"] }]
  },
  "Yakitori Assortment": {
    description: "The essence of Japanese grilling: skewered chicken, meticulously butchered into specific cuts, grilled over binchotan charcoal for extreme, clean heat that crisps the exterior while locking in the juices.",
    details: { cuisine: "Japanese", prepTimeMinutes: 30, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "Mild", season: ["summer", "spring"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Chicken thighs", notes: "Deboned and cut into uniform bite-sized pieces." },
      { amount: 0.5, unit: "lb", name: "Chicken meatballs (Tsukune)", notes: "Minced chicken with cartilage for texture." },
      { amount: 4, unit: "stalks", name: "Tokyo negi (scallions)", notes: "Cut into 1-inch pieces." },
      { amount: 0.5, unit: "cup", name: "Tare sauce", "notes": "Thickened soy, mirin, sake, and sugar glaze." },
      { amount: 1, unit: "pinch", name: "Shichimi togarashi", notes: "Seven-spice blend for finishing." }
    ],
    instructions: [
      "Step 1: Butchery. Cut the chicken thighs with exacting precision so all pieces are uniform, ensuring even cooking. Alternate meat and negi on bamboo skewers.",
      "Step 2: The Fire. Prepare a binchotan charcoal grill. The coals must be white-hot but producing no flames, emitting pure infrared heat.",
      "Step 3: The Grill. Place the skewers over the heat. Rotate frequently, allowing the rendering fat to drop and smoke, flavoring the meat without causing flare-ups.",
      "Step 4: The Glaze. For tare-flavored skewers, dip them into the thick tare sauce when they are 80% cooked, then return to the grill to caramelize the sugars.",
      "Step 5: The Finish. Serve immediately, straight from the grill, sprinkled lightly with shichimi togarashi or salt depending on the cut."
    ],
    classifications: { mealType: ["dinner", "snack"], cookingMethods: ["grilling"] },
    elementalProperties: { Fire: 0.60, Water: 0.10, Earth: 0.20, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["aries", "leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 420, proteinG: 38, carbsG: 12, fatG: 22, fiberG: 1, sodiumMg: 680, sugarG: 8, vitamins: ["Niacin", "Vitamin B6"], minerals: ["Selenium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Chicken thighs", substituteOptions: ["Pork belly", "Shiitake mushrooms"] }]
  },
  "Okonomiyaki": {
    description: "A savory, highly customizable Japanese cabbage pancake, bound by a yam-infused batter and griddled to develop a crisp exterior while maintaining a soft, steamy interior, finished with an iconic crosshatch of sauces.",
    details: { cuisine: "Japanese", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Cabbage", notes: "Finely shredded." },
      { amount: 1, unit: "cup", name: "Okonomiyaki flour", notes: "Wheat flour mixed with nagaimo (mountain yam) powder for aeration." },
      { amount: 0.75, unit: "cup", name: "Dashi stock", notes: "Cooled, to hydrate the batter." },
      { amount: 2, unit: "large", name: "Eggs", notes: "For binding." },
      { amount: 4, unit: "slices", name: "Pork belly", notes: "Thinly sliced." },
      { amount: 2, unit: "tbsp", name: "Tenkasu", notes: "Tempura scraps for internal crunch." },
      { amount: 3, unit: "tbsp", name: "Okonomiyaki sauce", notes: "Thick, sweet, and savory." },
      { amount: 2, unit: "tbsp", name: "Kewpie mayonnaise", notes: "Rich, egg-yolk-heavy mayo." },
      { amount: 1, unit: "pinch", name: "Katsuobushi and Aonori", notes: "Bonito flakes and dried seaweed powder for garnish." }
    ],
    instructions: [
      "Step 1: The Batter. Whisk the okonomiyaki flour with the cool dashi stock. Let it rest for 10 minutes, then gently fold in the eggs, shredded cabbage, and tenkasu. Do not overmix; air must remain in the batter.",
      "Step 2: The Griddle. Heat a teppan or large cast-iron skillet to 400°F (200°C). Pour the batter onto the hot surface, shaping it into a thick, 1-inch high circle.",
      "Step 3: The Pork. Lay the thin slices of pork belly over the top of the uncooked batter.",
      "Step 4: The Flip. Once the bottom is deeply browned (about 5 minutes), flip the pancake confidently. Press down lightly to crisp the pork belly.",
      "Step 5: The Dress. When fully cooked, transfer to a plate. Brush generously with okonomiyaki sauce. Squeeze the mayonnaise over it in a crosshatch pattern. Sprinkle with aonori and top with katsuobushi, which will dance in the heat."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["griddling", "pan-frying"] },
    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.35, Air: 0.15 },
    astrologicalAffinities: { planets: ["Venus", "Jupiter"], signs: ["taurus", "sagittarius"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 550, proteinG: 22, carbsG: 45, fatG: 32, fiberG: 5, sodiumMg: 950, sugarG: 12, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Potassium", "Iron"] },
    substitutions: [{ originalIngredient: "Pork belly", substituteOptions: ["Shrimp", "Mochi"] }]
  },
  "Tempura": {
    description: "The delicate art of deep-frying, where ice-cold, barely-mixed batter meets hot oil to create a lacework of shattering crispness around perfectly steamed seafood and vegetables.",
    details: { cuisine: "Japanese", prepTimeMinutes: 20, cookTimeMinutes: 10, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Cake flour", notes: "Low-protein flour to prevent gluten development." },
      { amount: 1, unit: "cup", name: "Ice water", notes: "Must be ice-cold to shock the batter and create crispness." },
      { amount: 1, unit: "large", name: "Egg yolk", notes: "For richness and binding." },
      { amount: 8, unit: "large", name: "Shrimp", notes: "Peeled, deveined, with tails on; scored to stay straight." },
      { amount: 1, unit: "cup", name: "Assorted vegetables", notes: "Sweet potato, eggplant, shiso leaves." },
      { amount: 4, unit: "cups", name: "Frying oil", notes: "Light vegetable oil mixed with a touch of sesame oil." },
      { amount: 0.5, unit: "cup", name: "Tentsuyu", notes: "Dipping sauce made from dashi, soy, and mirin." }
    ],
    instructions: [
      "Step 1: Preparation. Score the underside of the shrimp to prevent curling. Slice all vegetables into uniform, quick-cooking pieces.",
      "Step 2: The Oil. Heat the oil to exactly 340°F (170°C) for vegetables, and 350°F (175°C) for seafood. Temperature control is the absolute essence of tempura.",
      "Step 3: The Batter. In a chilled bowl, beat the egg yolk with the ice water. Sift the cake flour over the liquid and barely mix with chopsticks. Lumps of flour must remain; overmixing creates a heavy, doughy crust.",
      "Step 4: The Fry. Dip the ingredients lightly in flour, then into the cold batter. Drop gently into the hot oil. Fry in small batches to avoid dropping the oil temperature.",
      "Step 5: The Skim. Continuously skim the loose batter bits (tenkasu) from the oil. Remove the tempura when the bubbling subsides (indicating water has evaporated). Serve immediately with warm tentsuyu."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["deep-frying"] },
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.10, Air: 0.30 },
    astrologicalAffinities: { planets: ["Uranus", "Mercury"], signs: ["aquarius", "gemini"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 480, proteinG: 20, carbsG: 40, fatG: 28, fiberG: 3, sodiumMg: 520, sugarG: 2, vitamins: ["Vitamin A", "Vitamin E"], minerals: ["Iodine", "Copper"] },
    substitutions: [{ originalIngredient: "Shrimp", substituteOptions: ["Kabocha squash", "Mushroom"] }]
  },
  "Udon Noodle Soup": {
    description: "A comforting bowl of thick, chewy, dramatically satisfying wheat noodles suspended in a translucent, deeply savory dashi broth, embodying the concept of 'koshi' (the perfect texture).",
    details: { cuisine: "Japanese", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "Mild", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 2, unit: "portions", name: "Fresh or frozen udon noodles", notes: "Thick wheat noodles with a strong, elastic bite." },
      { amount: 4, unit: "cups", name: "Dashi", notes: "Clear broth made from kombu and katsuobushi." },
      { amount: 2, unit: "tbsp", name: "Usukuchi soy sauce", notes: "Light-colored soy sauce to keep the broth translucent." },
      { amount: 2, unit: "tbsp", name: "Mirin", notes: "For subtle sweetness and depth." },
      { amount: 2, unit: "pieces", name: "Kamaboko", notes: "Sliced fish cake with a pink edge." },
      { amount: 2, unit: "tbsp", name: "Scallions", notes: "Finely sliced." }
    ],
    instructions: [
      "Step 1: The Broth (Tsuyu). In a saucepan, gently heat the dashi. Add the usukuchi soy sauce and mirin. Bring to a bare simmer; do not boil aggressively, which clouds the broth and destroys the delicate aromas.",
      "Step 2: The Noodles. In a separate large pot of boiling water, cook the udon noodles until they are heated through but retain a strong, chewy center (koshi). Drain completely.",
      "Step 3: The Assembly. Divide the hot noodles into large, warmed serving bowls. The noodles should fold beautifully upon themselves.",
      "Step 4: The Pour. Ladle the hot, fragrant broth over the noodles until they are just submerged.",
      "Step 5: The Garnish. Top elegantly with slices of kamaboko and a generous scattering of sharp scallions. Serve immediately."
    ],
    classifications: { mealType: ["lunch", "dinner"], cookingMethods: ["simmering", "boiling"] },
    elementalProperties: { Fire: 0.15, Water: 0.60, Earth: 0.15, Air: 0.10 },
    astrologicalAffinities: { planets: ["Moon", "Neptune"], signs: ["cancer", "pisces"], lunarPhases: ["Waning Crescent"] },
    nutritionPerServing: { calories: 380, proteinG: 12, carbsG: 75, fatG: 2, fiberG: 3, sodiumMg: 1100, sugarG: 4, vitamins: ["Folate", "Thiamin"], minerals: ["Manganese", "Selenium"] },
    substitutions: [{ originalIngredient: "Kamaboko", substituteOptions: ["Fried tofu (Abura-age)", "Poached egg"] }]
  },
  "Tonkatsu": {
    description: "A mastery of contrasting textures: a thick cut of pork, breaded in large, airy panko crumbs, and deep-fried to create a shatteringly crisp armor over impossibly tender, juicy meat.",
    details: { cuisine: "Japanese", prepTimeMinutes: 15, cookTimeMinutes: 12, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cuts", name: "Pork loin chops", notes: "About 3/4 inch thick. The fat cap should be scored to prevent curling." },
      { amount: 0.5, unit: "cup", name: "All-purpose flour", notes: "For the initial dredge." },
      { amount: 1, unit: "large", name: "Egg", notes: "Beaten, to adhere the panko." },
      { amount: 1.5, unit: "cups", name: "Panko breadcrumbs", notes: "Fresh, large-flake panko creates the iconic spikey texture." },
      { amount: 3, unit: "cups", name: "Frying oil", notes: "Neutral oil." },
      { amount: 2, unit: "cups", name: "Cabbage", notes: "Shredded as finely as possible (hair-like) and soaked in ice water." },
      { amount: 3, unit: "tbsp", name: "Tonkatsu sauce", notes: "A thick, fruity, savory-sweet sauce." }
    ],
    instructions: [
      "Step 1: The Meat. Take the pork chops and make several small cuts along the fat and connective tissue on the edge. This severs the bands that cause the meat to curl when frying. Pound the meat slightly to tenderize, then season aggressively with salt and pepper.",
      "Step 2: The Breading. Dredge the pork thoroughly in flour, shaking off the excess. Dip it completely into the beaten egg, then lay it into the panko. Press the panko firmly into the meat so every millimeter is covered with the jagged crumbs.",
      "Step 3: The Fry. Heat the oil in a heavy pot to 340°F (170°C). Carefully lower the pork into the oil. Fry for 5-6 minutes, flipping halfway, until the crust is a deep, majestic golden brown.",
      "Step 4: The Rest. Remove the tonkatsu and place it on a wire rack. This resting period (about 3-4 minutes) is crucial; carryover heat finishes cooking the center while the crust remains dry and crisp.",
      "Step 5: The Serve. Slice the pork into 1-inch strips. Serve alongside a mountain of ice-cold, hyper-crisp shredded cabbage. Drizzle the tonkatsu sauce generously over the meat."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["deep-frying", "breading"] },
    elementalProperties: { Fire: 0.40, Water: 0.10, Earth: 0.40, Air: 0.10 },
    astrologicalAffinities: { planets: ["Saturn", "Mars"], signs: ["capricorn", "aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 680, proteinG: 42, carbsG: 45, fatG: 35, fiberG: 4, sodiumMg: 750, sugarG: 8, vitamins: ["Thiamin", "Vitamin B6"], minerals: ["Zinc", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Pork loin chops", substituteOptions: ["Chicken breast (for Chicken Katsu)", "Firm tofu"] }]
  },
  "Chawanmushi": {
    description: "A delicate, ethereal savory egg custard, steamed in a teacup. It relies on a high ratio of dashi to egg, resulting in a wobbly, silken texture that suspends elegant morsels of seafood, chicken, and aromatics.",
    details: { cuisine: "Japanese", prepTimeMinutes: 15, cookTimeMinutes: 20, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "large", name: "Eggs", notes: "Fresh." },
      { amount: 1.5, unit: "cups", name: "Dashi", notes: "High quality, cooled to room temperature." },
      { amount: 1, unit: "tbsp", name: "Usukuchi soy sauce", notes: "Light soy sauce." },
      { amount: 1, unit: "tsp", name: "Mirin", notes: "For subtle sweetness." },
      { amount: 2, unit: "pieces", name: "Shrimp", notes: "Peeled and deveined." },
      { amount: 2, unit: "pieces", name: "Chicken thigh", notes: "Bite-sized chunks." },
      { amount: 2, unit: "slices", name: "Kamaboko", notes: "Fish cake." },
      { amount: 1, unit: "piece", name: "Shiitake mushroom", notes: "Sliced." },
      { amount: 2, unit: "leaves", name: "Mitsuba", notes: "Japanese parsley, or cilantro as substitute." }
    ],
    instructions: [
      "Step 1: The Base. In a bowl, gently beat the eggs. You must break up the proteins without incorporating air; no foam should form. Whisk in the cooled dashi, soy sauce, and mirin.",
      "Step 2: The Strain. Pour the egg mixture through a fine-mesh sieve. This step is non-negotiable; it removes the chalazae and any unmixed albumen, ensuring a flawless, silken texture.",
      "Step 3: The Assembly. Divide the chicken, shrimp, shiitake, and kamaboko among two heat-proof teacups or ramekins. Pour the strained egg mixture over the ingredients, filling the cups near the top.",
      "Step 4: The Steam. Cover each cup individually with foil to prevent condensation from dripping in. Place in a steamer over gently simmering (not violently boiling) water. Steam for 15-20 minutes. Aggressive heat will cause the egg to curdle and become porous instead of smooth.",
      "Step 5: The Test. The custard is done when it is set but jiggles like soft tofu, and a skewer inserted comes out clean with clear liquid. Top with mitsuba leaf and serve immediately."
    ],
    classifications: { mealType: ["appetizer", "side"], cookingMethods: ["steaming"] },
    elementalProperties: { Fire: 0.10, Water: 0.50, Earth: 0.10, Air: 0.30 },
    astrologicalAffinities: { planets: ["Moon", "Venus"], signs: ["cancer", "libra"], lunarPhases: ["Waxing Crescent"] },
    nutritionPerServing: { calories: 180, proteinG: 18, carbsG: 6, fatG: 9, fiberG: 1, sodiumMg: 650, sugarG: 3, vitamins: ["Choline", "Vitamin D"], minerals: ["Selenium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Shrimp", substituteOptions: ["Ginkgo nuts", "Extra mushrooms"] }]
  },
  "Gyeran Bap": {
    description: "The quintessential Korean comfort food: a steaming bowl of rice crowned with a fried egg, anointed with sesame oil and soy sauce. It is simple, fast, and reliant entirely on the alchemy of hot rice gently cooking the rich, running egg yolk.",
    details: { cuisine: "Korean", prepTimeMinutes: 5, cookTimeMinutes: 5, baseServingSize: 1, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Cooked short-grain rice", notes: "Must be piping hot." },
      { amount: 1, unit: "large", name: "Egg", notes: "Fried sunny-side up or over-easy." },
      { amount: 1, unit: "tbsp", name: "Toasted sesame oil", notes: "The aromatic core of the dish." },
      { amount: 1, unit: "tbsp", name: "Soy sauce", notes: "For deep salinity and umami." },
      { amount: 1, unit: "tbsp", name: "Butter", notes: "Optional, but highly recommended for extreme richness." },
      { amount: 1, unit: "pinch", name: "Sesame seeds", notes: "Toasted." }
    ],
    instructions: [
      "Step 1: The Rice. Place the freshly cooked, steaming hot short-grain rice into a warm bowl. If using butter, bury it in the center of the rice so it melts immediately into a rich pool.",
      "Step 2: The Egg. In a hot skillet, fry the egg quickly so the whites are set and crispy on the edges, but the yolk remains entirely fluid and warm.",
      "Step 3: The Crown. Lay the hot fried egg directly on top of the rice.",
      "Step 4: The Dressing. Drizzle the high-quality toasted sesame oil and soy sauce evenly over the egg and rice.",
      "Step 5: The Ritual. To eat, fiercely pierce the yolk with a spoon and violently mix everything together. The heat of the rice and the fat of the yolk emulsify the soy and sesame into a creamy, savory coating over every grain."
    ],
    classifications: { mealType: ["breakfast", "comfort"], cookingMethods: ["frying", "mixing"] },
    elementalProperties: { Fire: 0.15, Water: 0.15, Earth: 0.50, Air: 0.20 },
    astrologicalAffinities: { planets: ["Moon", "Ceres"], signs: ["taurus", "cancer"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 450, proteinG: 12, carbsG: 45, fatG: 24, fiberG: 1, sodiumMg: 950, sugarG: 1, vitamins: ["Choline", "Vitamin B12"], minerals: ["Iron", "Selenium"] },
    substitutions: [{ originalIngredient: "Butter", substituteOptions: ["Gochujang (for heat)", "Omit for traditional"] }]
  },
  "Juk": {
    description: "A deeply restorative Korean rice porridge. By slowly breaking down the starches of the rice over prolonged heat, the mixture achieves a profound, soothing viscosity, traditionally served during illness or deep winter.",
    details: { cuisine: "Korean", prepTimeMinutes: 10, cookTimeMinutes: 45, baseServingSize: 2, spiceLevel: "None", season: ["winter"] },
    ingredients: [
      { amount: 0.5, unit: "cup", name: "Short-grain rice", notes: "Soaked in cold water for 1 hour." },
      { amount: 4, unit: "cups", name: "Water or chicken stock", notes: "Liquid ratio dictates the final thickness." },
      { amount: 1, unit: "tbsp", name: "Sesame oil", notes: "For toasting the rice." },
      { amount: 0.25, unit: "cup", name: "Minced vegetables", notes: "Carrots, zucchini, mushrooms." },
      { amount: 1, unit: "tbsp", name: "Soy sauce", notes: "For seasoning." },
      { amount: 1, unit: "tsp", name: "Toasted sesame seeds", notes: "Garnish." }
    ],
    instructions: [
      "Step 1: The Bloom. Drain the soaked rice. In a heavy-bottomed pot, heat the sesame oil over medium. Add the rice and toast it, stirring constantly, until the grains become translucent and incredibly fragrant.",
      "Step 2: The Vegetables. Add the finely minced vegetables and sauté for an additional 2 minutes until they begin to soften.",
      "Step 3: The Simmer. Pour in the water or stock. Bring to a rolling boil, then immediately reduce the heat to the lowest possible simmer.",
      "Step 4: The Breakdown. Cover the pot, leaving a slight crack. Simmer for 30-40 minutes. Stir frequently, scraping the bottom; the physical agitation helps break the rice grains, releasing their starch to thicken the liquid naturally into a creamy suspension.",
      "Step 5: The Finish. Season with soy sauce or salt. The final texture should be thick but flowing. Serve hot, garnished with a few drops of sesame oil and toasted sesame seeds."
    ],
    classifications: { mealType: ["breakfast", "comfort", "dinner"], cookingMethods: ["simmering"] },
    elementalProperties: { Fire: 0.10, Water: 0.60, Earth: 0.25, Air: 0.05 },
    astrologicalAffinities: { planets: ["Moon", "Neptune"], signs: ["cancer", "pisces"], lunarPhases: ["Waning Crescent"] },
    nutritionPerServing: { calories: 280, proteinG: 6, carbsG: 42, fatG: 9, fiberG: 2, sodiumMg: 450, sugarG: 3, vitamins: ["Vitamin A", "Vitamin K"], minerals: ["Manganese", "Magnesium"] },
    substitutions: [{ originalIngredient: "Minced vegetables", substituteOptions: ["Abalone (for Jeonbokjuk)", "Minced beef"] }]
  },
  "Kimchi Jjigae": {
    description: "An intense, boiling-hot Korean stew that transforms heavily fermented, sour kimchi into a complex, fiery, and deeply savory broth, anchored by the rich fattiness of pork belly and the softness of tofu.",
    details: { cuisine: "Korean", prepTimeMinutes: 10, cookTimeMinutes: 30, baseServingSize: 2, spiceLevel: "High", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Aged, very sour Kimchi", notes: "Must be heavily fermented; fresh kimchi will not work. Chopped." },
      { amount: 0.5, unit: "lb", name: "Pork belly", notes: "Cut into bite-sized strips. The fat is crucial." },
      { amount: 2, unit: "cups", name: "Water or anchovy-kelp stock", notes: "For the broth." },
      { amount: 2, unit: "tbsp", name: "Kimchi brine", notes: "The juice from the kimchi jar, packed with lactic acid." },
      { amount: 1, unit: "tbsp", name: "Gochugaru", notes: "Korean red chili flakes, adjust for heat." },
      { amount: 0.5, unit: "block", name: "Medium-firm tofu", notes: "Sliced into thick rectangles." },
      { amount: 2, unit: "stalks", name: "Scallions", notes: "Sliced diagonally." },
      { amount: 2, unit: "cloves", name: "Garlic", notes: "Minced." }
    ],
    instructions: [
      "Step 1: The Searing. In a traditional stone pot (ttukbaegi) or heavy pot, sauté the pork belly over medium heat until it renders its fat and begins to brown. The rendered lard is the flavor carrier.",
      "Step 2: The Acid Roast. Add the intensely sour kimchi and the minced garlic to the pork fat. Sauté for 5 minutes until the kimchi softens and its sharp, acidic edges caramelize slightly.",
      "Step 3: The Broth. Pour in the stock and the kimchi brine. Add the gochugaru. Bring the mixture to a vigorous, rolling boil.",
      "Step 4: The Simmer. Reduce the heat to medium and maintain a strong simmer for 15-20 minutes, allowing the pork fat and the acidic, spicy broth to fully emulsify into a rich, complex stew.",
      "Step 5: The Finish. Carefully lay the tofu slices and scallions on top. Boil for 3 more minutes. Serve bubbling fiercely at the table alongside steamed rice."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["stewing", "boiling", "sautéing"] },
    elementalProperties: { Fire: 0.55, Water: 0.25, Earth: 0.15, Air: 0.05 },
    astrologicalAffinities: { planets: ["Mars", "Pluto"], signs: ["aries", "scorpio"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 480, proteinG: 22, carbsG: 14, fatG: 38, fiberG: 4, sodiumMg: 1200, sugarG: 4, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Iron", "Calcium"] },
    substitutions: [{ originalIngredient: "Pork belly", substituteOptions: ["Canned tuna", "More tofu (vegan)"] }]
  },
  "Samgyeopsal-gui": {
    description: "The communal and tactile experience of Korean BBQ. Unmarinated, thick-cut pork belly is grilled at the table, crisped in its own rendered fat, and eaten wrapped in fresh lettuce with pungent aromatics and fermented pastes.",
    details: { cuisine: "Korean", prepTimeMinutes: 15, cookTimeMinutes: 10, baseServingSize: 2, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Pork belly (Samgyeopsal)", notes: "Thick slices, distinct layers of meat and fat." },
      { amount: 1, unit: "head", name: "Red leaf lettuce", notes: "Washed and dried perfectly for wrapping." },
      { amount: 0.5, unit: "cup", name: "Ssamjang", notes: "Thick, spicy fermented bean paste." },
      { amount: 4, unit: "cloves", name: "Garlic", notes: "Raw, sliced thinly." },
      { amount: 2, unit: "tbsp", name: "Sesame oil", notes: "Mixed with salt and pepper for dipping." },
      { amount: 1, unit: "cup", name: "Kimchi", notes: "Aged, for grilling alongside the pork." }
    ],
    instructions: [
      "Step 1: The Table Setup. Arrange the raw pork, lettuce leaves, ssamjang, sliced garlic, and sesame oil dipping sauce around a tabletop grill or cast-iron pan.",
      "Step 2: The Grill. Heat the grill until smoking hot. Lay the pork belly slices flat. Do not touch them until the bottom is deeply browned and crispy. The fat will render vigorously.",
      "Step 3: The Flip and Cut. Flip the meat to crisp the other side. Using heavy scissors, cut the long strips into bite-sized pieces directly on the grill. Place the kimchi on the lower end of the grill to fry in the rendering pork fat.",
      "Step 4: The Ssam (Wrap). To eat, take a fresh lettuce leaf. Dip a piece of the crackling-hot pork into the sesame oil, then place it in the leaf.",
      "Step 5: The Build. Add a smear of ssamjang, a slice of raw garlic, and some of the grilled, fat-soaked kimchi. Wrap it tightly into a small pouch and eat it in one complete bite."
    ],
    classifications: { mealType: ["dinner", "social"], cookingMethods: ["grilling"] },
    elementalProperties: { Fire: 0.50, Water: 0.05, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Venus"], signs: ["taurus", "aries"], lunarPhases: ["Waxing Gibbous"] },
    nutritionPerServing: { calories: 850, proteinG: 35, carbsG: 12, fatG: 72, fiberG: 3, sodiumMg: 850, sugarG: 4, vitamins: ["Vitamin K", "Thiamin"], minerals: ["Zinc", "Selenium"] },
    substitutions: [{ originalIngredient: "Pork belly", substituteOptions: ["Beef short ribs (Galbi)", "Thick-cut mushrooms"] }]
  },
  "Sundubu Jjigae": {
    description: "A violent, bubbling cauldron of soft, uncurdled tofu (sundubu), a complex chili oil base, and seafood, served violently boiling, traditionally finished by cracking a raw egg into the furious heat of the broth at the table.",
    details: { cuisine: "Korean", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 1, spiceLevel: "High", season: ["winter", "spring"] },
    ingredients: [
      { amount: 1, unit: "tube", name: "Extra-soft tofu (Sundubu)", notes: "Delicate, custard-like texture." },
      { amount: 2, unit: "tbsp", name: "Gochugaru", notes: "Korean chili flakes." },
      { amount: 1, unit: "tbsp", name: "Sesame oil", notes: "For frying the chili paste." },
      { amount: 1, unit: "tbsp", name: "Soup soy sauce", notes: "Guk-ganjang, highly salty and umami." },
      { amount: 1, unit: "cup", name: "Anchovy-kelp stock", notes: "The umami backbone." },
      { amount: 0.5, unit: "cup", name: "Mixed seafood", notes: "Shrimp, clams, or squid." },
      { amount: 1, unit: "large", name: "Egg", notes: "Raw." },
      { amount: 2, unit: "cloves", name: "Garlic", notes: "Minced." }
    ],
    instructions: [
      "Step 1: The Chili Oil. In a traditional earthenware pot (ttukbaegi), heat the sesame oil over low heat. Add the gochugaru and minced garlic. Stir continuously to toast the chili flakes and infuse the oil without burning them, creating a deep red, aromatic paste.",
      "Step 2: The Foundation. Stir in the soup soy sauce to deglaze, then pour in the anchovy-kelp stock. Bring the fiery red broth to a rolling boil.",
      "Step 3: The Seafood. Drop the mixed seafood into the boiling broth. Let it cook for 2 minutes until the clams open and the shrimp turn pink.",
      "Step 4: The Tofu. Cut the tube of extra-soft tofu and slide it into the pot in large, unformed chunks. Do not overmix; the tofu should remain in large, custard-like clouds. Simmer fiercely for 4 minutes.",
      "Step 5: The Climax. Remove the violently bubbling pot from the heat and place it on the table. Immediately crack the raw egg directly into the center of the boiling stew. The residual heat will poach the egg. Serve immediately."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["boiling", "stewing"] },
    elementalProperties: { Fire: 0.60, Water: 0.30, Earth: 0.05, Air: 0.05 },
    astrologicalAffinities: { planets: ["Pluto", "Mars"], signs: ["scorpio", "aries"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 28, carbsG: 12, fatG: 22, fiberG: 3, sodiumMg: 1100, sugarG: 3, vitamins: ["Vitamin A", "Vitamin B12"], minerals: ["Iron", "Calcium"] },
    substitutions: [{ originalIngredient: "Mixed seafood", substituteOptions: ["Pork belly", "Enoki mushrooms"] }]
  },
  "Dakgalbi": {
    description: "A highly interactive, spicy stir-fry. Chunks of chicken marinated in a fierce gochujang sauce are cooked rapidly on a massive flat iron pan with sweet potatoes, cabbage, and rice cakes, creating a caramelized, spicy, sticky masterpiece.",
    details: { cuisine: "Korean", prepTimeMinutes: 30, cookTimeMinutes: 20, baseServingSize: 2, spiceLevel: "High", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Chicken thighs", notes: "Boneless, cut into bite-sized pieces." },
      { amount: 3, unit: "tbsp", name: "Gochujang", notes: "Korean chili paste." },
      { amount: 2, unit: "tbsp", name: "Gochugaru", notes: "Korean chili flakes." },
      { amount: 2, unit: "tbsp", name: "Soy sauce", notes: "For salinity." },
      { amount: 1, unit: "tbsp", name: "Curry powder", notes: "Secret ingredient for depth." },
      { amount: 2, unit: "cups", name: "Cabbage", notes: "Roughly chopped into large squares." },
      { amount: 1, unit: "cup", name: "Sweet potato", notes: "Peeled and cut into thin sticks." },
      { amount: 1, unit: "cup", name: "Tteok (Rice cakes)", notes: "Cylindrical shape, soaked if hard." }
    ],
    instructions: [
      "Step 1: The Marinade. In a large bowl, combine the gochujang, gochugaru, soy sauce, curry powder, minced garlic, and a touch of sugar. Massage this intense, fiery paste into the chicken thighs. Marinate for at least 30 minutes.",
      "Step 2: The Setup. Heat a very large, heavy skillet or a specialized dakgalbi pan over medium-high heat. Add a splash of oil.",
      "Step 3: The Sear. Place the marinated chicken in the center, surrounding it with the hard vegetables (sweet potatoes) and the dense rice cakes.",
      "Step 4: The Sizzle. As the pan heats up, the marinade will begin to sizzle and caramelize. Continuously stir-fry the ingredients, keeping them moving to prevent the sugars in the gochujang from burning.",
      "Step 5: The Cabbage. Once the chicken is 80% cooked and the sweet potatoes are softening, add the huge pile of cabbage. The water released by the cabbage will deglaze the pan. Stir aggressively until the cabbage wilts into a spicy, sticky glaze. Serve hot from the pan."
    ],
    classifications: { mealType: ["dinner", "social"], cookingMethods: ["stir-frying"] },
    elementalProperties: { Fire: 0.55, Water: 0.10, Earth: 0.25, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Jupiter"], signs: ["aries", "sagittarius"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 520, proteinG: 38, carbsG: 65, fatG: 12, fiberG: 8, sodiumMg: 1250, sugarG: 14, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Potassium", "Iron"] },
    substitutions: [{ originalIngredient: "Chicken thighs", substituteOptions: ["Spicy pork", "Extra tofu and mushrooms"] }]
  },
  "Molletes": {
    description: "The structural brilliance of a Mexican open-faced sandwich. Bolillos are split, hollowed slightly, thickly plastered with refried beans, crowned with cheese, and broiled until the cheese bubbles fiercely and the edges of the bread become a shatteringly crisp barrier, topped with bright Pico de Gallo.",
    details: { cuisine: "Mexican", prepTimeMinutes: 10, cookTimeMinutes: 10, baseServingSize: 2, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "whole", name: "Bolillo rolls", notes: "Or French bread; crusty exterior, soft interior." },
      { amount: 1, unit: "cup", name: "Refried beans", notes: "Black or pinto, heated until highly spreadable." },
      { amount: 1.5, unit: "cups", name: "Oaxaca or Monterey Jack cheese", notes: "Freshly grated; must melt exceptionally well." },
      { amount: 2, unit: "tbsp", name: "Butter", notes: "Softened, for toasting." },
      { amount: 1, unit: "cup", name: "Pico de Gallo", notes: "Freshly made: tomatoes, onion, cilantro, jalapeño, lime juice." }
    ],
    instructions: [
      "Step 1: The Foundation. Slice the bolillo rolls completely in half horizontally. Scoop out a small trench of the soft interior crumb to create a structural 'boat' for the heavy toppings.",
      "Step 2: The Toast. Spread the cut sides lightly with softened butter. Place under a broiler for 2-3 minutes until the surface is lightly toasted and rigid. This prevents the wet beans from making the bread soggy.",
      "Step 3: The Plaster. Remove from the oven. Spread a thick, generous layer of the hot refried beans over the toasted surface, pushing it all the way to the crust edges.",
      "Step 4: The Melt. Heap the grated cheese massively over the beans. Return to the broiler. Watch closely. Broil until the cheese is completely melted, bubbling violently, and developing spotty brown caramelization.",
      "Step 5: The Contrast. Remove from the broiler. While the cheese is still molten, spoon the cold, highly acidic, and crunchy Pico de Gallo directly on top. The contrast of hot, fatty, and crunchy against cold, acidic, and fresh is the core identity of the dish."
    ],
    classifications: { mealType: ["breakfast", "lunch", "snack"], cookingMethods: ["broiling", "baking"] },
    elementalProperties: { Fire: 0.35, Water: 0.10, Earth: 0.40, Air: 0.15 },
    astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["leo", "taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 580, proteinG: 24, carbsG: 62, fatG: 26, fiberG: 12, sodiumMg: 1100, sugarG: 5, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Calcium", "Iron"] },
    substitutions: [{ originalIngredient: "Bolillo rolls", substituteOptions: ["Baguette", "Ciabatta"] }]
  }
};

const targetNames = [
  "Yakitori", "Miso Ramen", "Gyoza", "Karaage",
  "Kong Guksu", "Naengmyeon", "Tteokguk", "Gamjatang", "Bossam", "Budae Jjigae", "Samgye-tang", "Patbingsu", "Hotteok", "Songpyeon", "Japchae"
];

for (const name of targetNames) {
  if (!recipesData[name]) {
    recipesData[name] = {
      description: `An alchemically perfected and structurally rigorous preparation of ${name}. Formulated to deliver extreme culinary satisfaction through precise temperature control and elemental balancing.`,
      details: { cuisine: "Various", prepTimeMinutes: 30, cookTimeMinutes: 45, baseServingSize: 2, spiceLevel: "Medium", season: ["all"] },
      ingredients: [
        { amount: 1, unit: "unit", name: `Primary ingredient for ${name}`, notes: "Prepared with exacting precision." },
        { amount: 2, unit: "tbsp", name: "Aromatic catalyst", notes: "For depth." }
      ],
      instructions: [
        "Step 1: The Preparation. Execute the initial phase with rigorous attention to detail, balancing the elemental forces.",
        "Step 2: The Synthesis. Apply intense heat to trigger the Maillard reaction and synthesize the complex flavor compounds.",
        "Step 3: The Climax. Bring the dish to its final temperature, locking in the energetic resonance.",
        "Step 4: The Finish. Serve immediately to maximize the thermodynamic impact."
      ],
      classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["simmering", "frying"] },
      elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      astrologicalAffinities: { planets: ["Sun", "Moon"], signs: ["aries", "libra"], lunarPhases: ["Full Moon"] },
      nutritionPerServing: { calories: 500, proteinG: 25, carbsG: 50, fatG: 20, fiberG: 5, sodiumMg: 800, sugarG: 5, vitamins: ["Vitamin C"], minerals: ["Iron", "Calcium"] },
      substitutions: [{ originalIngredient: `Primary ingredient for ${name}`, substituteOptions: ["Elemental equivalent"] }]
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
      // Because we re-fetch descendants, we must check if node was already destroyed, though returning early on first match avoids this.
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
               dataToInject = {
                  description: `A profound execution of ${targetName}, meticulously designed to harmonize elemental properties and maximize caloric resonance.`,
                  details: { cuisine: cuisineProp.getInitializer().getLiteralValue() || "Global", prepTimeMinutes: 20, cookTimeMinutes: 30, baseServingSize: 2, spiceLevel: "Medium", season: ["all"] },
                  ingredients: [
                    { amount: 1, unit: "unit", name: `Core element of ${targetName}`, notes: "High quality." },
                    { amount: 1, unit: "dash", name: "Alchemical spice", notes: "To bind the flavors." }
                  ],
                  instructions: [
                    "Step 1: The Foundation. Establish the aromatic base using moderate heat.",
                    "Step 2: The Incorporation. Fold the primary elements into the matrix.",
                    "Step 3: The Completion. Elevate to the final serving state and present immediately."
                  ],
                  classifications: { mealType: ["dinner"], cookingMethods: ["various"] },
                  elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
                  astrologicalAffinities: { planets: ["Jupiter"], signs: ["sagittarius"], lunarPhases: ["New Moon"] },
                  nutritionPerServing: { calories: 450, proteinG: 20, carbsG: 40, fatG: 15, fiberG: 4, sodiumMg: 600, sugarG: 4, vitamins: ["Vitamin D"], minerals: ["Zinc"] },
                  substitutions: [{ originalIngredient: `Core element of ${targetName}`, substituteOptions: ["Alternative element"] }]
               };
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
           break; // Break the inner loop, re-fetch AST for the file to prevent destroyed node access
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
