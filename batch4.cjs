const { injectRecipes } = require('./injector.cjs');

const koreanRecipes = [
  {
    name: "Authentic Bibimbap (Dolsot)",
    description: "The definitive Korean mixed rice bowl. Served in a sizzling hot stone pot (dolsot), it features perfectly arranged namul (sautéed vegetables), marinated beef, and a raw egg yolk that cooks as you aggressively mix it with gochujang.",
    details: { cuisine: "Korean", prepTimeMinutes: 45, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "cups", name: "short-grain rice", notes: "Cooked" },
      { amount: 200, unit: "g", name: "beef ribeye", notes: "Thinly sliced, marinated in soy/sugar/sesame" },
      { amount: 1, unit: "cup", name: "spinach", notes: "Blanched, seasoned with sesame oil" },
      { amount: 1, unit: "cup", name: "bean sprouts", notes: "Blanched, seasoned" },
      { amount: 1, unit: "cup", name: "carrots", notes: "Julienned, lightly sautéed" },
      { amount: 1, unit: "cup", name: "shiitake mushrooms", notes: "Sliced and sautéed" },
      { amount: 4, unit: "whole", name: "egg yolks", notes: "Or sunny-side up eggs" },
      { amount: 4, unit: "tbsp", name: "gochujang", notes: "Korean chili paste, for serving" },
      { amount: 2, unit: "tbsp", name: "sesame oil", notes: "For coating the stone pots" }
    ],
    instructions: [
      "Step 1: Prepare all the namul (vegetables) separately by blanching or sautéing them, seasoning each with garlic, soy sauce, and sesame oil.",
      "Step 2: Sauté the marinated beef over high heat until cooked.",
      "Step 3: Coat the inside of stone pots (dolsot) generously with sesame oil. Heat on the stove until smoking.",
      "Step 4: Press 1 cup of cooked rice into the bottom of each pot. Let it crackle and toast for 5 minutes to form a crust (nurungji).",
      "Step 5: Artfully arrange the beef and vegetables on top of the rice in distinct sections.",
      "Step 6: Drop the egg yolk in the center. Serve immediately while sizzling, with gochujang on the side for the diner to mix in vigorously."
    ],
    classifications: { mealType: ["lunch", "dinner"], cookingMethods: ["sautéing", "toasting"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Sun", "Earth"], signs: ["Leo", "Virgo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 580, proteinG: 22, carbsG: 75, fatG: 18, fiberG: 6, sodiumMg: 850, sugarG: 8, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Iron", "Potassium"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.4, reactivity: 1.8, gregsEnergy: -0.5, kalchm: 0.04, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Kimchi Jjigae",
    description: "A fiercely bubbling, fiercely sour, and fiercely spicy stew built on aged, over-fermented kimchi, fatty pork belly, and tofu.",
    details: { cuisine: "Korean", prepTimeMinutes: 10, cookTimeMinutes: 25, baseServingSize: 4, spiceLevel: "Hot", season: ["winter", "all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "aged sour kimchi", notes: "Must be old and pungent, chopped" },
      { amount: 200, unit: "g", name: "pork belly", notes: "Cut into bite-sized strips" },
      { amount: 0.5, unit: "cup", name: "kimchi juice", notes: "Essential for depth" },
      { amount: 2, unit: "tbsp", name: "gochugaru (Korean chili flakes)", notes: "For heat and color" },
      { amount: 1, unit: "tbsp", name: "gochujang", notes: "For body" },
      { amount: 1, unit: "block", name: "firm tofu", notes: "Sliced" },
      { amount: 2, unit: "cups", name: "anchovy-kelp stock or water", notes: "For the broth" },
      { amount: 1, unit: "bunch", name: "scallions", notes: "Chopped" }
    ],
    instructions: [
      "Step 1: In a heavy pot (ttukbaegi preferred), sear the pork belly until its fat begins to render.",
      "Step 2: Add the sour kimchi and sauté in the pork fat for 5 minutes to mellow its bite.",
      "Step 3: Stir in the gochugaru, gochujang, and kimchi juice.",
      "Step 4: Pour in the stock. Bring to a boil, then cover and vigorously boil/simmer for 15 minutes to marry the flavors.",
      "Step 5: Fan the sliced tofu over the top of the stew and cook for another 5 minutes.",
      "Step 6: Garnish with scallions and serve boiling hot alongside a bowl of plain white rice."
    ],
    classifications: { mealType: ["dinner", "stew", "soup"], cookingMethods: ["boiling", "simmering"] },
    elementalProperties: { Fire: 0.6, Water: 0.3, Earth: 0.1, Air: 0.0 },
    astrologicalAffinities: { planets: ["Mars", "Pluto"], signs: ["Aries", "Scorpio"], lunarPhases: ["Waning Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 18, carbsG: 15, fatG: 24, fiberG: 4, sodiumMg: 1100, sugarG: 5, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 6, Essence: 5, Matter: 4, Substance: 4 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.45, reactivity: 2.2, gregsEnergy: -0.6, kalchm: 0.05, monica: 0.7 },
    substitutions: []
  },
  {
    name: "Authentic Beef Bulgogi",
    description: "Korea's most famous barbecue export. Wafer-thin slices of beef marinated in a sweet, savory blend of soy, sesame, and Asian pear (which tenderizes the meat), quickly grilled over an open flame.",
    details: { cuisine: "Korean", prepTimeMinutes: 60, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "beef ribeye or sirloin", notes: "Sliced paper-thin" },
      { amount: 0.5, unit: "cup", name: "soy sauce", notes: "For marinade" },
      { amount: 3, unit: "tbsp", name: "brown sugar or honey", notes: "For caramelization" },
      { amount: 0.5, unit: "whole", name: "Asian pear", notes: "Grated; contains tenderizing enzymes" },
      { amount: 1, unit: "small", name: "onion", notes: "Grated" },
      { amount: 4, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 2, unit: "tbsp", name: "sesame oil", notes: "Toasted" },
      { amount: 1, unit: "tbsp", name: "toasted sesame seeds", notes: "For garnish" }
    ],
    instructions: [
      "Step 1: In a large bowl, whisk together the soy sauce, sugar, grated pear, grated onion, garlic, and sesame oil.",
      "Step 2: Add the thinly sliced beef. Massage the marinade into the meat with your hands.",
      "Step 3: Cover and refrigerate for 1-2 hours (do not exceed 4 hours or the pear will turn the meat to mush).",
      "Step 4: Heat a grill pan or cast-iron skillet over maximum heat until smoking.",
      "Step 5: Flash-fry the beef in small batches for 1-2 minutes per side until deeply caramelized and slightly charred.",
      "Step 6: Sprinkle with sesame seeds and serve with lettuce leaves (ssam), rice, and ssamjang."
    ],
    classifications: { mealType: ["dinner", "bbq"], cookingMethods: ["marinating", "grilling"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["Leo", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 420, proteinG: 32, carbsG: 18, fatG: 22, fiberG: 1, sodiumMg: 950, sugarG: 14, vitamins: ["Vitamin B12", "Niacin"], minerals: ["Zinc", "Iron"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.6, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Tteokbokki",
    description: "The undisputed king of Korean street food. Chewy, dense rice cakes simmering in a thick, fiery red, and remarkably sweet gochujang sauce with fish cakes.",
    details: { cuisine: "Korean", prepTimeMinutes: 10, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "Hot", season: ["all"] },
    ingredients: [
      { amount: 400, unit: "g", name: "garaetteok (cylinder rice cakes)", notes: "Soaked if hard" },
      { amount: 3, unit: "sheets", name: "eomuk (fish cakes)", notes: "Cut into triangles" },
      { amount: 3, unit: "cups", name: "anchovy-kelp stock", notes: "Essential umami base" },
      { amount: 3, unit: "tbsp", name: "gochujang", notes: "Korean chili paste" },
      { amount: 1, unit: "tbsp", name: "gochugaru", notes: "Korean chili flakes" },
      { amount: 2, unit: "tbsp", name: "sugar or corn syrup", notes: "Crucial for the glossy glaze" },
      { amount: 1, unit: "tbsp", name: "soy sauce", notes: "For saltiness" },
      { amount: 2, unit: "whole", name: "hard-boiled eggs", notes: "Peeled" },
      { amount: 1, unit: "bunch", name: "scallions", notes: "Cut into 2-inch pieces" }
    ],
    instructions: [
      "Step 1: In a wide, shallow pan, combine the stock, gochujang, gochugaru, sugar, and soy sauce. Bring to a boil.",
      "Step 2: Add the rice cakes to the bubbling sauce.",
      "Step 3: Simmer vigorously for 10-15 minutes, stirring frequently so the rice cakes don't stick to the bottom, until the sauce thickens into a thick glaze.",
      "Step 4: Stir in the fish cake triangles and hard-boiled eggs.",
      "Step 5: Cook for another 3 minutes until the fish cakes puff up and absorb the sauce.",
      "Step 6: Toss in the scallions right at the end. Serve piping hot."
    ],
    classifications: { mealType: ["snack", "street food"], cookingMethods: ["simmering", "reducing"] },
    elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Gemini"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 380, proteinG: 12, carbsG: 65, fatG: 4, fiberG: 2, sodiumMg: 850, sugarG: 12, vitamins: ["Vitamin A", "Calcium"], minerals: ["Iron"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 4, Substance: 5 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.35, reactivity: 1.8, gregsEnergy: -0.5, kalchm: 0.03, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Japchae",
    description: "A celebratory dish of bouncy sweet potato glass noodles stir-fried with an array of individually prepared vegetables and beef, yielding a harmoniously sweet and savory sesame-rich finish.",
    details: { cuisine: "Korean", prepTimeMinutes: 40, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 250, unit: "g", name: "dangmyeon (sweet potato starch noodles)", notes: "Boiled until chewy and transparent" },
      { amount: 150, unit: "g", name: "beef sirloin", notes: "Thinly sliced" },
      { amount: 1, unit: "cup", name: "spinach", notes: "Blanched" },
      { amount: 0.5, unit: "cup", name: "carrots", notes: "Julienned" },
      { amount: 0.5, unit: "cup", name: "onion", notes: "Sliced" },
      { amount: 0.5, unit: "cup", name: "shiitake mushrooms", notes: "Sliced" },
      { amount: 4, unit: "tbsp", name: "soy sauce", notes: "For the sauce" },
      { amount: 2, unit: "tbsp", name: "sugar", notes: "For the sauce" },
      { amount: 2, unit: "tbsp", name: "sesame oil", notes: "For the sauce" },
      { amount: 1, unit: "tbsp", name: "toasted sesame seeds", notes: "For garnish" }
    ],
    instructions: [
      "Step 1: Boil the dangmyeon for 6 minutes until chewy. Rinse in cold water, drain, cut into 6-inch lengths, and toss with a little sesame oil so they don't stick.",
      "Step 2: Mix the soy sauce, sugar, and sesame oil to create the master seasoning sauce.",
      "Step 3: Blanch the spinach, squeeze out all water, and season lightly with salt and sesame oil.",
      "Step 4: In a skillet, separately stir-fry the onions, carrots, and mushrooms. Set each aside.",
      "Step 5: Stir-fry the beef until just cooked.",
      "Step 6: In a very large bowl, combine the noodles, all the vegetables, the beef, and the master seasoning sauce. Toss everything aggressively by hand. Garnish with sesame seeds."
    ],
    classifications: { mealType: ["lunch", "side", "celebration"], cookingMethods: ["boiling", "stir-frying", "tossing"] },
    elementalProperties: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
    astrologicalAffinities: { planets: ["Venus", "Mercury"], signs: ["Libra", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 12, carbsG: 55, fatG: 10, fiberG: 4, sodiumMg: 750, sugarG: 10, vitamins: ["Vitamin A", "Vitamin K"], minerals: ["Iron", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 6, Substance: 4 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.25, reactivity: 1.4, gregsEnergy: -0.3, kalchm: 0.01, monica: 0.4 },
    substitutions: []
  }
];

const mexicanRecipes = [
  {
    name: "Authentic Tacos al Pastor",
    description: "The crown jewel of Mexican street food. Deeply marinated pork layered onto a vertical trompo (spit), roasted over fire, and sliced thinly onto corn tortillas with pineapple.",
    details: { cuisine: "Mexican", prepTimeMinutes: 120, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "kg", name: "pork shoulder", notes: "Sliced into 1/4-inch steaks" },
      { amount: 3, unit: "whole", name: "guajillo chiles", notes: "Toasted, soaked, and seeded" },
      { amount: 2, unit: "whole", name: "ancho chiles", notes: "Toasted, soaked, and seeded" },
      { amount: 2, unit: "tbsp", name: "achiote paste", notes: "For earthiness and deep red color" },
      { amount: 0.25, unit: "cup", name: "pineapple juice", notes: "Tenderizes the meat" },
      { amount: 0.25, unit: "cup", name: "white vinegar", notes: "For tang" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Whole" },
      { amount: 1, unit: "tsp", name: "oregano", notes: "Mexican oregano" },
      { amount: 1, unit: "cup", name: "fresh pineapple", notes: "Diced, for serving" },
      { amount: 12, unit: "whole", name: "corn tortillas", notes: "Warmed" }
    ],
    instructions: [
      "Step 1: Blend the soaked chiles, achiote, pineapple juice, vinegar, garlic, oregano, and salt until completely smooth to make the adobo.",
      "Step 2: Smear the adobo generously over every slice of pork. Marinate for at least 4 hours (or overnight).",
      "Step 3: To simulate a trompo at home, stack the pork slices tightly on a skewer stuck into a pineapple base.",
      "Step 4: Roast the stack in a 400°F (200°C) oven or grill indirectly until the edges are crispy and charred.",
      "Step 5: Slice the meat thinly off the stack as it cooks.",
      "Step 6: Serve the charred meat on warm corn tortillas topped with diced pineapple, raw onion, and cilantro."
    ],
    classifications: { mealType: ["dinner", "street food"], cookingMethods: ["roasting", "marinating"] },
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Leo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 550, proteinG: 45, carbsG: 40, fatG: 22, fiberG: 5, sodiumMg: 750, sugarG: 12, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.35, reactivity: 1.8, gregsEnergy: -0.5, kalchm: 0.03, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Mole Poblano",
    description: "The summit of Mexican culinary complexity. A dark, thick, glossy sauce made from over 20 ingredients including toasted chiles, nuts, seeds, spices, and Mexican chocolate, draped over poultry.",
    details: { cuisine: "Mexican (Puebla)", prepTimeMinutes: 60, cookTimeMinutes: 180, baseServingSize: 8, spiceLevel: "Medium", season: ["all", "celebration"] },
    ingredients: [
      { amount: 1, unit: "whole", name: "chicken or turkey", notes: "Poached, stock reserved" },
      { amount: 4, unit: "whole", name: "mulato chiles", notes: "Toasted and seeded" },
      { amount: 4, unit: "whole", name: "ancho chiles", notes: "Toasted and seeded" },
      { amount: 4, unit: "whole", name: "pasilla chiles", notes: "Toasted and seeded" },
      { amount: 0.25, unit: "cup", name: "almonds and pecans", notes: "Toasted" },
      { amount: 0.25, unit: "cup", name: "sesame seeds", notes: "Toasted" },
      { amount: 1, unit: "whole", name: "plantain or ripe banana", notes: "Fried" },
      { amount: 1, unit: "whole", name: "corn tortilla", notes: "Burnt black" },
      { amount: 0.5, unit: "tsp", name: "cinnamon, cloves, anise", notes: "Toasted and ground" },
      { amount: 50, unit: "g", name: "Mexican chocolate", notes: "For finishing" }
    ],
    instructions: [
      "Step 1: Toast the dried chiles in a dry pan until fragrant, then soak them in hot chicken stock until soft.",
      "Step 2: In a skillet with lard, fry the nuts, seeds, raisins, plantain, burnt tortilla, and spices one by one.",
      "Step 3: Blend the soaked chiles and the fried ingredients with enough stock to form a completely smooth, thick paste.",
      "Step 4: Push the paste through a fine-mesh sieve for a silky texture.",
      "Step 5: Heat lard in a large cazuela (clay pot). Add the mole paste and fry it vigorously for 15 minutes to intensify the flavors.",
      "Step 6: Whisk in 4 cups of chicken stock and the Mexican chocolate. Simmer for 2 hours. Serve ladled heavily over the poached poultry."
    ],
    classifications: { mealType: ["dinner", "celebration"], cookingMethods: ["toasting", "blending", "simmering"] },
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Pluto", "Sun"], signs: ["Scorpio", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 680, proteinG: 38, carbsG: 45, fatG: 42, fiberG: 12, sodiumMg: 600, sugarG: 15, vitamins: ["Vitamin A", "Niacin"], minerals: ["Magnesium", "Iron"] },
    alchemicalProperties: { Spirit: 7, Essence: 6, Matter: 8, Substance: 6 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.5, reactivity: 2.2, gregsEnergy: -0.7, kalchm: 0.06, monica: 0.8 },
    substitutions: []
  },
  {
    name: "Authentic Enchiladas Verdes",
    description: "Corn tortillas briefly fried to prevent disintegration, rolled around shredded chicken, and submerged in a bright, acidic, and spicy roasted tomatillo salsa.",
    details: { cuisine: "Mexican", prepTimeMinutes: 20, cookTimeMinutes: 40, baseServingSize: 4, spiceLevel: "Medium-Hot", season: ["all"] },
    ingredients: [
      { amount: 12, unit: "whole", name: "corn tortillas", notes: "Essential; do not use flour" },
      { amount: 3, unit: "cups", name: "cooked chicken", notes: "Shredded" },
      { amount: 500, unit: "g", name: "tomatillos", notes: "Husked and rinsed" },
      { amount: 2, unit: "whole", name: "jalapeños or serranos", notes: "Stems removed" },
      { amount: 0.5, unit: "whole", name: "onion", notes: "Quartered" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Whole" },
      { amount: 0.5, unit: "cup", name: "cilantro", notes: "Fresh" },
      { amount: 1, unit: "cup", name: "crema Mexicana", notes: "For drizzling" },
      { amount: 0.5, unit: "cup", name: "queso fresco", notes: "Crumbled" }
    ],
    instructions: [
      "Step 1: Boil or roast the tomatillos, jalapeños, onion, and garlic until the tomatillos soften and change color (about 10 mins).",
      "Step 2: Blend the cooked vegetables with fresh cilantro and salt into a smooth salsa verde.",
      "Step 3: Heat 1 tbsp oil in a saucepan. Pour in the salsa verde and 'fry' the sauce for 5 minutes to intensify it.",
      "Step 4: Flash-fry each corn tortilla in hot oil for 5 seconds per side just to make them pliable and waterproof.",
      "Step 5: Dip a tortilla in the hot salsa, place shredded chicken inside, and roll it tightly. Place seam-side down in a dish.",
      "Step 6: Pour the remaining salsa over the rolled enchiladas. Drizzle heavily with crema, queso fresco, and sliced raw onions."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["blending", "frying", "rolling"] },
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["Cancer", "Taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 520, proteinG: 32, carbsG: 45, fatG: 24, fiberG: 6, sodiumMg: 750, sugarG: 5, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Calcium", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.6, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Pozole Rojo",
    description: "An ancient, culturally monumental Mexican soup centered around thoroughly bloomed hominy (nixtamalized corn) and tender pork, bathed in a deep red chile broth.",
    details: { cuisine: "Mexican", prepTimeMinutes: 30, cookTimeMinutes: 180, baseServingSize: 8, spiceLevel: "Medium", season: ["winter", "celebration"] },
    ingredients: [
      { amount: 1.5, unit: "kg", name: "pork shoulder and trotter", notes: "For gelatinous broth" },
      { amount: 800, unit: "g", name: "canned white hominy (maiz mote)", notes: "Rinsed well" },
      { amount: 4, unit: "whole", name: "guajillo chiles", notes: "Toasted and soaked" },
      { amount: 2, unit: "whole", name: "ancho chiles", notes: "Toasted and soaked" },
      { amount: 1, unit: "head", name: "garlic", notes: "Whole" },
      { amount: 1, unit: "whole", name: "onion", notes: "Halved" },
      { amount: 2, unit: "cups", name: "shredded cabbage or lettuce", notes: "For garnish" },
      { amount: 1, unit: "bunch", name: "radishes", notes: "Sliced thin" }
    ],
    instructions: [
      "Step 1: Place the pork, onion head, and garlic head in a massive pot. Cover with water and simmer for 2 hours, skimming the scum, until the meat is extremely tender.",
      "Step 2: Remove the pork, shred it, and return to the broth. Discard the onion and garlic.",
      "Step 3: Blend the soaked red chiles with a little broth until perfectly smooth. Strain this red adobo directly into the simmering soup.",
      "Step 4: Add the rinsed hominy to the pot.",
      "Step 5: Simmer everything together for another hour until the hominy 'blooms' (opens up like a flower).",
      "Step 6: Serve the soup hot. Diners customize their bowls heavily with shredded cabbage, radishes, diced onion, dried oregano, and lime juice."
    ],
    classifications: { mealType: ["dinner", "soup", "celebration"], cookingMethods: ["simmering", "blending"] },
    elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Moon"], signs: ["Sagittarius", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 450, proteinG: 35, carbsG: 30, fatG: 22, fiberG: 8, sodiumMg: 850, sugarG: 4, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 6, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.35, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Guacamole en Molcajete",
    description: "The true Mexican avocado dip, made not by stirring, but by crushing aromatics in a volcanic stone mortar (molcajete) before gently folding in perfectly ripe avocados.",
    details: { cuisine: "Mexican", prepTimeMinutes: 10, cookTimeMinutes: 0, baseServingSize: 4, spiceLevel: "Mild-Medium", season: ["all"] },
    ingredients: [
      { amount: 3, unit: "large", name: "Hass avocados", notes: "Perfectly ripe" },
      { amount: 0.25, unit: "cup", name: "white onion", notes: "Finely minced" },
      { amount: 2, unit: "whole", name: "serrano chiles", notes: "Finely minced" },
      { amount: 0.25, unit: "cup", name: "cilantro", notes: "Freshly chopped" },
      { amount: 1, unit: "tbsp", name: "lime juice", notes: "Freshly squeezed" },
      { amount: 1, unit: "tsp", name: "coarse sea salt", notes: "Essential for grinding" },
      { amount: 1, unit: "whole", name: "Roma tomato", notes: "Seeded and diced (optional)" }
    ],
    instructions: [
      "Step 1: In a molcajete (or mortar), combine half the onion, half the serrano chiles, half the cilantro, and the coarse sea salt.",
      "Step 2: Grind these ingredients with the pestle (tejolote) until they break down into a fragrant, wet green paste.",
      "Step 3: Halve the avocados, remove the pits, and score the flesh in a grid pattern. Scoop the chunks into the molcajete.",
      "Step 4: Using a spoon (not the pestle), gently fold the avocado chunks into the aromatic paste. Do not mash it into a smooth purée; it must remain chunky.",
      "Step 5: Fold in the remaining onion, serrano, cilantro, and the diced tomato if using.",
      "Step 6: Squeeze the lime juice over the top, fold once more, and serve immediately with tortilla chips."
    ],
    classifications: { mealType: ["appetizer", "dip", "vegan"], cookingMethods: ["mashing", "folding"] },
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Earth"], signs: ["Taurus", "Virgo"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 250, proteinG: 3, carbsG: 12, fatG: 22, fiberG: 10, sodiumMg: 350, sugarG: 1, vitamins: ["Vitamin K", "Folate"], minerals: ["Potassium", "Magnesium"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 7, Substance: 4 },
    thermodynamicProperties: { heat: 0.02, entropy: 0.2, reactivity: 1.2, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.3 },
    substitutions: []
  }
];

const middleEasternRecipes = [
  {
    name: "Authentic Falafel",
    description: "The iconic Levantine street food. Crispy, deeply herb-flecked fritters made from raw (not cooked) soaked chickpeas ground with fresh parsley, cilantro, and cumin.",
    details: { cuisine: "Middle-Eastern", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "dried chickpeas", notes: "Do not use canned; soak for 24 hours" },
      { amount: 1, unit: "cup", name: "fresh parsley", notes: "Leaves and stems" },
      { amount: 1, unit: "cup", name: "fresh cilantro", notes: "Leaves and stems" },
      { amount: 1, unit: "small", name: "onion", notes: "Roughly chopped" },
      { amount: 4, unit: "cloves", name: "garlic", notes: "Roughly chopped" },
      { amount: 1, unit: "tbsp", name: "cumin", notes: "Ground" },
      { amount: 1, unit: "tbsp", name: "coriander", notes: "Ground" },
      { amount: 1, unit: "tsp", name: "baking soda", notes: "Crucial for an airy texture" },
      { amount: 4, unit: "cups", name: "oil", notes: "For deep frying" }
    ],
    instructions: [
      "Step 1: Drain the soaked raw chickpeas completely.",
      "Step 2: In a food processor, pulse the chickpeas, herbs, onion, garlic, cumin, coriander, and salt until it forms a coarse meal that holds together when squeezed. Do not over-process into a paste.",
      "Step 3: Transfer to a bowl, mix in the baking soda, and let the mixture rest in the fridge for 30 minutes.",
      "Step 4: Form the mixture into small balls or patties without packing them too tightly.",
      "Step 5: Heat oil to 350°F (175°C). Drop the falafel into the hot oil.",
      "Step 6: Fry for 4-5 minutes until deeply browned and crisp on the outside, and bright green and fluffy inside. Serve in pita with tahini."
    ],
    classifications: { mealType: ["lunch", "snack", "vegan", "street food"], cookingMethods: ["deep-frying", "blending"] },
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Earth", "Mars"], signs: ["Taurus", "Aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 420, proteinG: 15, carbsG: 45, fatG: 22, fiberG: 12, sodiumMg: 450, sugarG: 5, vitamins: ["Vitamin C", "Folate"], minerals: ["Iron", "Magnesium"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Hummus bi Tahini",
    description: "The foundational Levantine dip. A monument to texture, created by blending overcooked, skinless chickpeas with copious amounts of premium tahini, lemon juice, and ice water.",
    details: { cuisine: "Middle-Eastern", prepTimeMinutes: 15, cookTimeMinutes: 60, baseServingSize: 6, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "dried chickpeas", notes: "Soaked overnight with 1 tsp baking soda" },
      { amount: 0.75, unit: "cup", name: "tahini", notes: "High-quality, runny sesame paste" },
      { amount: 0.25, unit: "cup", name: "lemon juice", notes: "Freshly squeezed" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Smashed" },
      { amount: 3, unit: "tbsp", name: "ice water", notes: "Essential for a fluffy emulsion" },
      { amount: 1, unit: "tsp", name: "salt", notes: "To taste" },
      { amount: 3, unit: "tbsp", name: "extra virgin olive oil", notes: "For garnish only" }
    ],
    instructions: [
      "Step 1: Boil the soaked chickpeas with another pinch of baking soda until they are completely mushy and falling apart (about 1 hour).",
      "Step 2: Drain the chickpeas. (Optional: agitate them in cold water to remove the skins for maximum smoothness).",
      "Step 3: In a food processor, blend the tahini, lemon juice, and garlic until it whips into a pale, thick paste.",
      "Step 4: Add the hot, mushy chickpeas and process continuously for 3-5 minutes.",
      "Step 5: With the machine running, drizzle in the ice water. The hummus will transform, becoming dramatically lighter, paler, and fluffier.",
      "Step 6: Spread onto a shallow plate, creating a well in the center. Pool olive oil in the well and dust with paprika."
    ],
    classifications: { mealType: ["appetizer", "dip", "vegan"], cookingMethods: ["boiling", "emulsifying", "blending"] },
    elementalProperties: { Fire: 0.0, Water: 0.3, Earth: 0.5, Air: 0.2 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["Taurus", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 12, carbsG: 28, fatG: 24, fiberG: 8, sodiumMg: 400, sugarG: 2, vitamins: ["Vitamin C", "B6"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 2, Essence: 6, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.02, entropy: 0.2, reactivity: 1.2, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.3 },
    substitutions: []
  },
  {
    name: "Authentic Chicken Shawarma",
    description: "The ubiquitous street food wrap. Chicken thighs marinated in a complex blend of warm spices and yogurt, roasted aggressively, and served with pungent garlic sauce (Toum).",
    details: { cuisine: "Middle-Eastern", prepTimeMinutes: 120, cookTimeMinutes: 30, baseServingSize: 4, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 800, unit: "g", name: "chicken thighs", notes: "Boneless, skinless" },
      { amount: 0.5, unit: "cup", name: "plain yogurt", notes: "For tenderizing" },
      { amount: 0.25, unit: "cup", name: "lemon juice", notes: "For acidity" },
      { amount: 1, unit: "tbsp", name: "cumin", notes: "Ground" },
      { amount: 1, unit: "tbsp", name: "coriander", notes: "Ground" },
      { amount: 1, unit: "tsp", name: "cardamom", notes: "Ground" },
      { amount: 0.5, unit: "tsp", name: "cinnamon", notes: "Ground" },
      { amount: 0.5, unit: "tsp", name: "smoked paprika", notes: "Ground" },
      { amount: 4, unit: "whole", name: "flatbreads", notes: "Pita or saj" }
    ],
    instructions: [
      "Step 1: Whisk the yogurt, lemon juice, olive oil, minced garlic, and all the dry spices to form the marinade.",
      "Step 2: Toss the chicken thighs in the marinade, ensuring complete coverage. Marinate for at least 4 hours.",
      "Step 3: Preheat oven to 425°F (220°C).",
      "Step 4: Pack the chicken tightly onto a wire rack over a baking sheet (or skewer them tightly together).",
      "Step 5: Roast for 30 minutes until the edges are dark, charred, and crispy.",
      "Step 6: Slice the meat thinly. Wrap in flatbread with Toum (garlic sauce), pickles, and fries."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["roasting", "marinating"] },
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
    astrologicalAffinities: { planets: ["Sun", "Mars"], signs: ["Leo", "Aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 580, proteinG: 45, carbsG: 35, fatG: 28, fiberG: 3, sodiumMg: 750, sugarG: 4, vitamins: ["Vitamin C", "Niacin"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.3, reactivity: 1.7, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Shakshuka",
    description: "A brilliant North African and Middle Eastern breakfast staple of eggs gently poached in a fiercely bubbling, spiced sauce of tomatoes, bell peppers, and cumin.",
    details: { cuisine: "Middle-Eastern", prepTimeMinutes: 10, cookTimeMinutes: 25, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 6, unit: "large", name: "eggs", notes: "Fresh" },
      { amount: 1, unit: "can (28oz)", name: "whole peeled tomatoes", notes: "Crushed by hand" },
      { amount: 1, unit: "large", name: "red bell pepper", notes: "Sliced" },
      { amount: 1, unit: "large", name: "onion", notes: "Diced" },
      { amount: 4, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tbsp", name: "cumin", notes: "Ground" },
      { amount: 1, unit: "tbsp", name: "sweet paprika", notes: "Ground" },
      { amount: 1, unit: "tsp", name: "cayenne pepper", notes: "Optional, for heat" },
      { amount: 0.25, unit: "cup", name: "feta cheese", notes: "Crumbled, for garnish" }
    ],
    instructions: [
      "Step 1: Heat olive oil in a wide cast-iron skillet. Sauté the onions and bell peppers until soft and slightly blistered.",
      "Step 2: Stir in the garlic, cumin, paprika, and cayenne. Cook for 1 minute until fragrant.",
      "Step 3: Pour in the hand-crushed tomatoes and their juices.",
      "Step 4: Simmer the sauce vigorously for 10-15 minutes until it reduces and thickens significantly.",
      "Step 5: Use a spoon to make 6 small wells in the sauce. Carefully crack an egg into each well.",
      "Step 6: Cover the skillet and simmer for 5-8 minutes until the egg whites are just set but the yolks remain runny. Garnish with feta and cilantro."
    ],
    classifications: { mealType: ["breakfast", "brunch", "vegetarian"], cookingMethods: ["simmering", "poaching"] },
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["Leo", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 320, proteinG: 14, carbsG: 22, fatG: 20, fiberG: 6, sodiumMg: 600, sugarG: 12, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Iron", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.5, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Baba Ganoush",
    description: "A sublime Levantine dip relying on the intense smokiness imparted by charring whole eggplants over an open flame, then mixing the soft flesh with tahini and lemon.",
    details: { cuisine: "Middle-Eastern", prepTimeMinutes: 10, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["summer", "all"] },
    ingredients: [
      { amount: 2, unit: "large", name: "eggplants", notes: "Firm and shiny" },
      { amount: 0.25, unit: "cup", name: "tahini", notes: "Sesame paste" },
      { amount: 2, unit: "tbsp", name: "lemon juice", notes: "Freshly squeezed" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Mashed into a paste with salt" },
      { amount: 2, unit: "tbsp", name: "extra virgin olive oil", notes: "For mixing and garnishing" },
      { amount: 1, unit: "tbsp", name: "fresh parsley", notes: "Chopped" },
      { amount: 1, unit: "tsp", name: "pomegranate seeds", notes: "For garnish" }
    ],
    instructions: [
      "Step 1: Pierce the eggplants a few times with a fork.",
      "Step 2: Place the whole eggplants directly onto the grates of a gas burner or charcoal grill. Char them aggressively, turning occasionally, until the skin is entirely black, ashen, and the inside collapses (15-20 mins).",
      "Step 3: Transfer to a bowl and cover with plastic wrap for 10 minutes to steam.",
      "Step 4: Peel away and discard the charred skin. Place the soft flesh in a colander to drain excess bitter liquid.",
      "Step 5: Chop the eggplant flesh vigorously with a knife (do not blend, it should be rustic and stringy).",
      "Step 6: In a bowl, fold the eggplant with tahini, lemon juice, garlic paste, and salt. Spread on a plate, pool with olive oil, and garnish."
    ],
    classifications: { mealType: ["appetizer", "dip", "vegan"], cookingMethods: ["charring", "mashing"] },
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Pluto", "Moon"], signs: ["Scorpio", "Cancer"], lunarPhases: ["Waning Moon"] },
    nutritionPerServing: { calories: 220, proteinG: 4, carbsG: 18, fatG: 16, fiberG: 8, sodiumMg: 300, sugarG: 8, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Potassium", "Manganese"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.35, reactivity: 1.6, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  }
];

injectRecipes('korean', 'dinner', koreanRecipes);
injectRecipes('mexican', 'dinner', mexicanRecipes);
injectRecipes('middle-eastern', 'dinner', middleEasternRecipes);
