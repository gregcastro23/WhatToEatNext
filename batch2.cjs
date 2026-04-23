const { injectRecipes } = require('./injector.cjs');

const chineseRecipes = [
  {
    name: "Authentic Peking Duck",
    description: "A world-renowned dish from Beijing featuring duck with thin, crisp skin, served with pancakes, scallions, and hoisin sauce.",
    details: { cuisine: "Chinese", prepTimeMinutes: 120, cookTimeMinutes: 60, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "whole", name: "duck", notes: "Air-dried overnight" },
      { amount: 0.5, unit: "cup", name: "maltose syrup", notes: "For glazing the skin" },
      { amount: 1, unit: "tbsp", name: "soy sauce", notes: "Mixed into the glaze" },
      { amount: 10, unit: "whole", name: "Mandarin pancakes", notes: "For serving" },
      { amount: 1, unit: "cup", name: "scallions", notes: "Cut into thin strips" },
      { amount: 1, unit: "cup", name: "cucumber", notes: "Cut into thin strips" },
      { amount: 0.5, unit: "cup", name: "sweet bean sauce or hoisin", notes: "For serving" }
    ],
    instructions: [
      "Step 1: Clean the duck and pour boiling water over the skin to tighten it.",
      "Step 2: Mix maltose syrup with boiling water and soy sauce. Brush evenly over the duck.",
      "Step 3: Hang the duck in a cool, well-ventilated area for 24 hours to completely dry the skin.",
      "Step 4: Roast the duck at 400°F (200°C) until the skin is deep brown and crispy.",
      "Step 5: Carve the duck table-side, ensuring every piece has crisp skin.",
      "Step 6: Serve wrapped in Mandarin pancakes with scallions, cucumber, and sweet bean sauce."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["roasting", "glazing"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
    astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["Leo", "Libra"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 750, proteinG: 35, carbsG: 45, fatG: 48, fiberG: 2, sodiumMg: 900, sugarG: 12, vitamins: ["Vitamin A", "Iron"], minerals: ["Zinc", "Phosphorus"] },
    alchemicalProperties: { Spirit: 5, Essence: 6, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Mapo Tofu",
    description: "A famously fiery and numbing Sichuan dish made of soft silken tofu set in a spicy, brilliant red, minced meat and chili bean sauce.",
    details: { cuisine: "Chinese (Sichuan)", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Fiery", season: ["winter", "all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "silken tofu", notes: "Cut into cubes" },
      { amount: 150, unit: "g", name: "ground pork or beef", notes: "Finely minced" },
      { amount: 2, unit: "tbsp", name: "doubanjiang (spicy broad bean paste)", notes: "Essential for the red oil base" },
      { amount: 1, unit: "tbsp", name: "douchi (fermented black beans)", notes: "Chopped" },
      { amount: 1, unit: "tbsp", name: "Sichuan peppercorns", notes: "Ground, for the 'ma' (numbing) flavor" },
      { amount: 1, unit: "tbsp", name: "chili oil", notes: "For extra heat and color" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tbsp", name: "ginger", notes: "Minced" }
    ],
    instructions: [
      "Step 1: Blanch the tofu cubes in salted boiling water for 2 minutes, then drain.",
      "Step 2: Heat a wok, add oil, and stir-fry the ground meat until crispy and browned.",
      "Step 3: Lower heat and add doubanjiang, frying until the oil turns bright red.",
      "Step 4: Add garlic, ginger, and douchi, stir-frying until fragrant.",
      "Step 5: Pour in 1 cup of water or broth and bring to a simmer. Gently slide in the tofu.",
      "Step 6: Thicken with a cornstarch slurry. Sprinkle heavily with ground Sichuan peppercorns before serving."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["stir-frying", "simmering"] },
    elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Pluto"], signs: ["Aries", "Scorpio"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 350, proteinG: 22, carbsG: 12, fatG: 24, fiberG: 4, sodiumMg: 850, sugarG: 3, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 6, Essence: 5, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.4, reactivity: 2.2, gregsEnergy: -0.6, kalchm: 0.05, monica: 0.8 },
    substitutions: []
  },
  {
    name: "Authentic Char Siu (Chinese BBQ Pork)",
    description: "A classic Cantonese roasted pork dish characterized by its sweet, savory, and sticky red glaze and tender, juicy interior.",
    details: { cuisine: "Chinese (Cantonese)", prepTimeMinutes: 240, cookTimeMinutes: 40, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "pork shoulder or belly", notes: "Cut into thick strips" },
      { amount: 3, unit: "tbsp", name: "hoisin sauce", notes: "Base of marinade" },
      { amount: 2, unit: "tbsp", name: "soy sauce", notes: "For saltiness" },
      { amount: 2, unit: "tbsp", name: "honey or maltose", notes: "For sweetness and glaze" },
      { amount: 1, unit: "tbsp", name: "Shaoxing wine", notes: "For depth" },
      { amount: 1, unit: "tsp", name: "five-spice powder", notes: "Aromatic" },
      { amount: 1, unit: "tsp", name: "red fermented tofu or food coloring", notes: "For the iconic red hue" }
    ],
    instructions: [
      "Step 1: Combine hoisin, soy sauce, honey, wine, five-spice, and coloring to make the marinade.",
      "Step 2: Marinate the pork strips for at least 4 hours, or overnight for best results.",
      "Step 3: Preheat oven to 400°F (200°C). Place pork on a wire rack over a roasting pan.",
      "Step 4: Roast for 20 minutes. Reserve the leftover marinade.",
      "Step 5: Simmer the leftover marinade until thick and syrupy.",
      "Step 6: Flip the pork, brush generously with the thickened glaze, and roast for another 15-20 minutes until caramelized."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["roasting", "marinating"] },
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Sun"], signs: ["Taurus", "Leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 450, proteinG: 35, carbsG: 20, fatG: 25, fiberG: 1, sodiumMg: 800, sugarG: 15, vitamins: ["Vitamin B6", "Thiamin"], minerals: ["Zinc", "Iron"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.3, reactivity: 1.6, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Har Gow (Shrimp Dumplings)",
    description: "The crown jewel of Cantonese dim sum. Delicate, translucent wrappers pleated elegantly around a crisp, sweet shrimp filling.",
    details: { cuisine: "Chinese (Cantonese)", prepTimeMinutes: 45, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 300, unit: "g", name: "raw shrimp", notes: "Peeled, deveined, and roughly chopped" },
      { amount: 0.5, unit: "cup", name: "bamboo shoots", notes: "Finely diced" },
      { amount: 1, unit: "tbsp", name: "sesame oil", notes: "For aroma" },
      { amount: 1, unit: "tsp", name: "white pepper", notes: "Finely ground" },
      { amount: 1, unit: "cup", name: "wheat starch", notes: "Essential for the translucent wrapper" },
      { amount: 0.5, unit: "cup", name: "tapioca starch", notes: "Adds chewiness to wrapper" },
      { amount: 0.75, unit: "cup", name: "boiling water", notes: "To gelatinize the dough" }
    ],
    instructions: [
      "Step 1: Mix the chopped shrimp, bamboo shoots, sesame oil, white pepper, and salt. Stir vigorously in one direction until sticky.",
      "Step 2: Combine wheat starch and tapioca starch in a bowl. Pour in boiling water and stir rapidly.",
      "Step 3: Knead the dough until smooth, then divide into small balls and flatten them into circles.",
      "Step 4: Place a spoonful of shrimp filling in the center of a wrapper.",
      "Step 5: Fold the wrapper over and make 9-13 fine pleats along the edge to seal it.",
      "Step 6: Steam the dumplings in a bamboo steamer over high heat for 6-8 minutes until the wrappers turn translucent."
    ],
    classifications: { mealType: ["breakfast", "lunch", "dim sum"], cookingMethods: ["steaming", "folding"] },
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
    astrologicalAffinities: { planets: ["Moon", "Neptune"], signs: ["Cancer", "Pisces"], lunarPhases: ["Waxing Crescent"] },
    nutritionPerServing: { calories: 250, proteinG: 18, carbsG: 35, fatG: 5, fiberG: 2, sodiumMg: 450, sugarG: 2, vitamins: ["Vitamin B12", "Selenium"], minerals: ["Iodine", "Zinc"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.02, entropy: 0.2, reactivity: 1.1, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.2 },
    substitutions: []
  },
  {
    name: "Authentic Dan Dan Noodles",
    description: "A classic Sichuan street food consisting of fresh noodles tossed in a fiercely spicy, savory, and nutty sauce, topped with crispy spiced pork.",
    details: { cuisine: "Chinese (Sichuan)", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Hot", season: ["all"] },
    ingredients: [
      { amount: 400, unit: "g", name: "fresh wheat noodles", notes: "Boiled" },
      { amount: 200, unit: "g", name: "ground pork", notes: "For the topping" },
      { amount: 2, unit: "tbsp", name: "Sui Mi Ya Cai (preserved mustard greens)", notes: "Essential for authentic umami" },
      { amount: 3, unit: "tbsp", name: "chili oil", notes: "With chili flakes" },
      { amount: 2, unit: "tbsp", name: "sesame paste", notes: "Or peanut butter" },
      { amount: 1, unit: "tbsp", name: "black vinegar", notes: "Chinkiang preferred" },
      { amount: 1, unit: "tbsp", name: "soy sauce", notes: "Light and dark" },
      { amount: 1, unit: "tsp", name: "Sichuan peppercorn powder", notes: "For numbing heat" }
    ],
    instructions: [
      "Step 1: Stir-fry the ground pork until crispy. Add the preserved mustard greens and a dash of soy sauce, cooking until fragrant. Set aside.",
      "Step 2: In serving bowls, whisk together chili oil, sesame paste, black vinegar, soy sauce, and Sichuan peppercorn powder to form the sauce base.",
      "Step 3: Boil the fresh noodles in a large pot of water until al dente.",
      "Step 4: Drain the noodles and immediately divide them into the bowls over the sauce base.",
      "Step 5: Top the noodles with the crispy pork mixture and blanched leafy greens.",
      "Step 6: Toss everything together vigorously right before eating."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["boiling", "stir-frying"] },
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Mercury"], signs: ["Aries", "Gemini"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 520, proteinG: 22, carbsG: 60, fatG: 22, fiberG: 4, sodiumMg: 800, sugarG: 5, vitamins: ["Vitamin B6", "Iron"], minerals: ["Magnesium", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 4, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.35, reactivity: 1.9, gregsEnergy: -0.5, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  }
];

const frenchRecipes = [
  {
    name: "Authentic Coq au Vin",
    description: "A timeless French classic consisting of chicken slowly braised in red Burgundy wine with pearl onions, mushrooms, and lardons.",
    details: { cuisine: "French", prepTimeMinutes: 30, cookTimeMinutes: 120, baseServingSize: 4, spiceLevel: "None", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 1, unit: "whole", name: "chicken", notes: "Cut into 8 pieces" },
      { amount: 1, unit: "bottle", name: "red wine", notes: "Burgundy or Pinot Noir" },
      { amount: 200, unit: "g", name: "slab bacon or lardons", notes: "Cut into thick strips" },
      { amount: 250, unit: "g", name: "cremini mushrooms", notes: "Quartered" },
      { amount: 20, unit: "whole", name: "pearl onions", notes: "Peeled" },
      { amount: 2, unit: "tbsp", name: "butter", notes: "For finishing" },
      { amount: 1, unit: "bouquet", name: "garni", notes: "Thyme, bay leaf, parsley" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Smashed" }
    ],
    instructions: [
      "Step 1: Marinate the chicken pieces in the red wine with the bouquet garni and garlic overnight.",
      "Step 2: In a heavy Dutch oven, fry the lardons until crisp. Remove and set aside.",
      "Step 3: Remove the chicken from the wine, pat dry, and sear in the bacon fat until deeply browned.",
      "Step 4: Pour the wine marinade over the chicken, bring to a boil, then reduce to a simmer. Cover and braise for 1.5 hours.",
      "Step 5: While the chicken cooks, sauté the pearl onions and mushrooms in butter until golden.",
      "Step 6: Add the onions, mushrooms, and lardons to the pot in the last 15 minutes. Thicken the sauce with a beurre manié if needed."
    ],
    classifications: { mealType: ["dinner", "stew"], cookingMethods: ["braising", "sautéing"] },
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Venus"], signs: ["Taurus", "Pisces"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 45, carbsG: 15, fatG: 38, fiberG: 3, sodiumMg: 550, sugarG: 6, vitamins: ["Vitamin B12", "Niacin"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 5, Substance: 6 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.3, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Beef Bourguignon",
    description: "The crown jewel of French stews, featuring tender beef chunks simmered slowly in rich red wine, aromatics, and beef stock.",
    details: { cuisine: "French", prepTimeMinutes: 40, cookTimeMinutes: 180, baseServingSize: 6, spiceLevel: "None", season: ["winter"] },
    ingredients: [
      { amount: 1.5, unit: "kg", name: "beef chuck", notes: "Cut into 2-inch cubes" },
      { amount: 1, unit: "bottle", name: "red wine", notes: "Dry, like Pinot Noir" },
      { amount: 200, unit: "g", name: "bacon", notes: "Diced" },
      { amount: 2, unit: "cups", name: "beef stock", notes: "High quality" },
      { amount: 2, unit: "large", name: "carrots", notes: "Sliced" },
      { amount: 1, unit: "large", name: "onion", notes: "Sliced" },
      { amount: 3, unit: "tbsp", name: "flour", notes: "To coat the beef" },
      { amount: 300, unit: "g", name: "mushrooms", notes: "For garnish" }
    ],
    instructions: [
      "Step 1: Fry the bacon in a large casserole until crisp. Remove.",
      "Step 2: Dry the beef cubes, toss them in flour, and sear them in the hot bacon fat in batches until deeply crusted.",
      "Step 3: Sauté the carrots and onion in the remaining fat.",
      "Step 4: Return the beef and bacon to the pot. Pour in the wine and beef stock. Add thyme and bay leaf.",
      "Step 5: Simmer gently on the stovetop or in a 300°F (150°C) oven for 2.5 to 3 hours until the meat is fork-tender.",
      "Step 6: Sauté mushrooms separately in butter and stir them into the stew right before serving."
    ],
    classifications: { mealType: ["dinner", "stew"], cookingMethods: ["slow-cooking", "braising"] },
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Saturn"], signs: ["Capricorn", "Taurus"], lunarPhases: ["Waning Moon"] },
    nutritionPerServing: { calories: 720, proteinG: 55, carbsG: 20, fatG: 42, fiberG: 4, sodiumMg: 650, sugarG: 5, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.35, reactivity: 1.6, gregsEnergy: -0.5, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Bouillabaisse",
    description: "A complex, rustic Provençal fish stew originating from Marseille, flavored heavily with saffron, fennel, and orange zest.",
    details: { cuisine: "French (Provençal)", prepTimeMinutes: 30, cookTimeMinutes: 60, baseServingSize: 6, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "kg", name: "mixed firm and flaky fish", notes: "Monkfish, red snapper, sea bass" },
      { amount: 500, unit: "g", name: "shellfish", notes: "Mussels, clams, or crab" },
      { amount: 1, unit: "large", name: "fennel bulb", notes: "Sliced" },
      { amount: 2, unit: "whole", name: "tomatoes", notes: "Peeled and chopped" },
      { amount: 1, unit: "pinch", name: "saffron threads", notes: "Crucial for flavor and color" },
      { amount: 1, unit: "strip", name: "orange zest", notes: "For aromatics" },
      { amount: 4, unit: "cups", name: "fish stock", notes: "Rich and clear" },
      { amount: 0.5, unit: "cup", name: "olive oil", notes: "High quality" }
    ],
    instructions: [
      "Step 1: In a large pot, sweat the fennel, onions, and garlic in olive oil until soft.",
      "Step 2: Add the tomatoes, orange zest, and saffron. Cook for 5 minutes.",
      "Step 3: Pour in the fish stock and bring to a rolling boil.",
      "Step 4: Add the firmest fish first and boil aggressively for 5 minutes (the fast boil emulsifies the oil and water).",
      "Step 5: Add the delicate fish and shellfish, cooking for another 5 minutes until the shells open.",
      "Step 6: Serve the broth poured over crusty bread smeared with Rouille (garlic saffron mayonnaise), with the fish presented on a separate platter."
    ],
    classifications: { mealType: ["dinner", "soup"], cookingMethods: ["boiling", "poaching"] },
    elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
    astrologicalAffinities: { planets: ["Neptune", "Venus"], signs: ["Pisces", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 450, proteinG: 48, carbsG: 12, fatG: 22, fiberG: 3, sodiumMg: 750, sugarG: 4, vitamins: ["Vitamin D", "Vitamin B12"], minerals: ["Iodine", "Selenium"] },
    alchemicalProperties: { Spirit: 5, Essence: 7, Matter: 4, Substance: 5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.8, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Cassoulet",
    description: "A profoundly rich, slow-baked bean casserole from the South of France, containing confit duck, sausages, and pork.",
    details: { cuisine: "French (Languedoc)", prepTimeMinutes: 120, cookTimeMinutes: 300, baseServingSize: 8, spiceLevel: "None", season: ["winter"] },
    ingredients: [
      { amount: 500, unit: "g", name: "white haricot beans", notes: "Soaked overnight" },
      { amount: 4, unit: "legs", name: "duck confit", notes: "Preserved in fat" },
      { amount: 4, unit: "links", name: "Toulouse sausage", notes: "Garlicky pork sausage" },
      { amount: 300, unit: "g", name: "pork belly or shoulder", notes: "Cubed" },
      { amount: 1, unit: "whole", name: "bouquet garni", notes: "Herb bundle" },
      { amount: 1, unit: "head", name: "garlic", notes: "Whole" },
      { amount: 4, unit: "cups", name: "pork or chicken stock", notes: "Gelatinous" }
    ],
    instructions: [
      "Step 1: Boil the soaked beans with the pork belly, garlic head, and bouquet garni for 1 hour until tender.",
      "Step 2: Brown the sausages in a skillet. In the same skillet, gently warm the duck confit to melt the fat.",
      "Step 3: In a large, deep earthenware pot (a cassole), layer the beans, pork belly, sausages, and duck legs.",
      "Step 4: Pour the rich stock over the mixture until it barely covers the beans.",
      "Step 5: Bake at 300°F (150°C) for 3-4 hours. A crust will form on top. Break the crust every hour and let it reform.",
      "Step 6: Serve bubbling hot straight from the oven."
    ],
    classifications: { mealType: ["dinner", "casserole"], cookingMethods: ["slow-baking", "simmering"] },
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
    astrologicalAffinities: { planets: ["Saturn", "Earth"], signs: ["Taurus", "Capricorn"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 850, proteinG: 45, carbsG: 55, fatG: 48, fiberG: 18, sodiumMg: 950, sugarG: 4, vitamins: ["Vitamin B", "Iron"], minerals: ["Magnesium", "Zinc"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 8, Substance: 7 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.2, reactivity: 1.2, gregsEnergy: -0.6, kalchm: 0.04, monica: 0.3 },
    substitutions: []
  },
  {
    name: "Authentic Quiche Lorraine",
    description: "A classic savory tart featuring a buttery, flaky pastry crust filled with a rich custard of cream, eggs, and crisp lardons.",
    details: { cuisine: "French", prepTimeMinutes: 30, cookTimeMinutes: 45, baseServingSize: 6, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "whole", name: "shortcrust pastry", notes: "Blind baked" },
      { amount: 200, unit: "g", name: "smoked bacon or lardons", notes: "Diced" },
      { amount: 3, unit: "large", name: "eggs", notes: "Plus 1 egg yolk" },
      { amount: 1.5, unit: "cups", name: "crème fraîche or heavy cream", notes: "Essential for texture" },
      { amount: 1, unit: "pinch", name: "nutmeg", notes: "Freshly grated" },
      { amount: 0.5, unit: "tsp", name: "salt", notes: "To taste" },
      { amount: 0.5, unit: "tsp", name: "black pepper", notes: "Freshly ground" }
    ],
    instructions: [
      "Step 1: Blind bake the pastry crust in a 9-inch tart pan until golden and sealed.",
      "Step 2: Fry the lardons in a skillet until crisp, then drain on paper towels.",
      "Step 3: In a bowl, vigorously whisk the eggs, egg yolk, cream, nutmeg, salt, and pepper to create a smooth custard.",
      "Step 4: Scatter the crisp lardons evenly over the bottom of the baked crust.",
      "Step 5: Pour the egg and cream custard over the lardons.",
      "Step 6: Bake at 350°F (175°C) for 30-35 minutes until the custard is set and slightly puffed. Serve warm or at room temperature."
    ],
    classifications: { mealType: ["lunch", "brunch", "dinner"], cookingMethods: ["baking", "whisking"] },
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["Taurus", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 480, proteinG: 14, carbsG: 22, fatG: 38, fiberG: 1, sodiumMg: 600, sugarG: 2, vitamins: ["Vitamin A", "Vitamin D"], minerals: ["Calcium", "Phosphorus"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.3, reactivity: 1.4, gregsEnergy: -0.3, kalchm: 0.01, monica: 0.4 },
    substitutions: []
  }
];

const greekRecipes = [
  {
    name: "Authentic Moussaka",
    description: "The iconic Greek casserole consisting of layered roasted eggplant, a rich spiced meat sauce, and a thick, golden béchamel topping.",
    details: { cuisine: "Greek", prepTimeMinutes: 45, cookTimeMinutes: 60, baseServingSize: 8, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 3, unit: "large", name: "eggplants", notes: "Sliced into rounds" },
      { amount: 500, unit: "g", name: "ground beef or lamb", notes: "For the meat sauce" },
      { amount: 1, unit: "large", name: "onion", notes: "Finely chopped" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "can (14oz)", name: "crushed tomatoes", notes: "For the sauce" },
      { amount: 1, unit: "tsp", name: "cinnamon", notes: "Ground, essential for flavor" },
      { amount: 3, unit: "cups", name: "milk", notes: "For the béchamel" },
      { amount: 0.5, unit: "cup", name: "butter", notes: "For the béchamel" },
      { amount: 0.5, unit: "cup", name: "flour", notes: "For the béchamel" },
      { amount: 2, unit: "whole", name: "egg yolks", notes: "For enriching the béchamel" },
      { amount: 0.5, unit: "cup", name: "kefalotyri or parmesan cheese", notes: "Grated" }
    ],
    instructions: [
      "Step 1: Salt the eggplant slices and let sit for 30 mins. Rinse, dry, and roast or pan-fry until golden.",
      "Step 2: Brown the meat with onions and garlic. Add tomatoes, cinnamon, salt, and pepper. Simmer for 30 minutes until thick.",
      "Step 3: Melt butter in a saucepan, whisk in flour for 1 minute. Gradually add milk, whisking until thickened into a béchamel. Off heat, temper in egg yolks and half the cheese.",
      "Step 4: Layer the bottom of a 9x13 baking dish with the roasted eggplant slices.",
      "Step 5: Spread the meat sauce evenly over the eggplant. Top with the béchamel sauce.",
      "Step 6: Sprinkle with remaining cheese. Bake at 375°F (190°C) for 45 minutes until golden brown."
    ],
    classifications: { mealType: ["dinner", "casserole"], cookingMethods: ["layering", "baking"] },
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Earth"], signs: ["Taurus", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 550, proteinG: 28, carbsG: 35, fatG: 36, fiberG: 8, sodiumMg: 650, sugarG: 12, vitamins: ["Vitamin A", "Calcium"], minerals: ["Iron", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.25, reactivity: 1.3, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Chicken Souvlaki",
    description: "Classic Greek street food of tender, lemon-oregano marinated chicken chunks skewered and grilled over an open flame.",
    details: { cuisine: "Greek", prepTimeMinutes: 60, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "None", season: ["summer", "all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "chicken breast or thighs", notes: "Cut into 1-inch cubes" },
      { amount: 0.25, unit: "cup", name: "olive oil", notes: "Extra virgin" },
      { amount: 0.25, unit: "cup", name: "lemon juice", notes: "Freshly squeezed" },
      { amount: 1, unit: "tbsp", name: "dried oregano", notes: "Greek oregano preferred" },
      { amount: 3, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tsp", name: "salt", notes: "To taste" },
      { amount: 1, unit: "tsp", name: "black pepper", notes: "Freshly ground" },
      { amount: 4, unit: "whole", name: "pita breads", notes: "For serving" }
    ],
    instructions: [
      "Step 1: Whisk together the olive oil, lemon juice, oregano, garlic, salt, and pepper in a large bowl.",
      "Step 2: Add the chicken cubes and toss to coat completely. Marinate in the refrigerator for 1-2 hours.",
      "Step 3: Thread the marinated chicken tightly onto wooden or metal skewers.",
      "Step 4: Preheat a grill or grill pan over medium-high heat.",
      "Step 5: Grill the skewers for 10-12 minutes, turning occasionally, until charred and cooked through.",
      "Step 6: Serve hot inside warm pita bread with tzatziki, tomatoes, and onions."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["grilling", "skewering"] },
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Leo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 420, proteinG: 35, carbsG: 22, fatG: 20, fiberG: 2, sodiumMg: 650, sugarG: 2, vitamins: ["Vitamin C", "Niacin"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 4, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.07, entropy: 0.35, reactivity: 1.8, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Spanakopita",
    description: "A savory Greek pastry made of impossibly flaky phyllo dough encasing a rich, herbaceous filling of spinach, feta cheese, and dill.",
    details: { cuisine: "Greek", prepTimeMinutes: 30, cookTimeMinutes: 45, baseServingSize: 8, spiceLevel: "None", season: ["spring", "all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "fresh spinach", notes: "Washed and roughly chopped" },
      { amount: 1, unit: "bunch", name: "scallions", notes: "Finely chopped" },
      { amount: 0.5, unit: "cup", name: "fresh dill", notes: "Chopped" },
      { amount: 200, unit: "g", name: "feta cheese", notes: "Crumbled" },
      { amount: 3, unit: "large", name: "eggs", notes: "Lightly beaten" },
      { amount: 1, unit: "pack", name: "phyllo dough", notes: "Thawed" },
      { amount: 0.5, unit: "cup", name: "olive oil or melted butter", notes: "For brushing" }
    ],
    instructions: [
      "Step 1: Sauté the scallions and spinach until wilted. Drain excess liquid thoroughly by squeezing in a towel.",
      "Step 2: In a large bowl, combine the dry spinach mixture with the feta, dill, and eggs. Mix well.",
      "Step 3: Brush a 9x13 baking dish with oil. Layer half of the phyllo sheets in the bottom, brushing each individual sheet with oil.",
      "Step 4: Spread the spinach filling evenly over the phyllo base.",
      "Step 5: Top with the remaining phyllo sheets, again brushing each layer with oil.",
      "Step 6: Score the top layers into squares and bake at 350°F (175°C) for 45 minutes until golden and crisp."
    ],
    classifications: { mealType: ["lunch", "appetizer", "vegetarian"], cookingMethods: ["baking", "layering"] },
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["Taurus", "Virgo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 320, proteinG: 12, carbsG: 25, fatG: 22, fiberG: 4, sodiumMg: 450, sugarG: 3, vitamins: ["Vitamin A", "Vitamin K"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.3, reactivity: 1.4, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Tzatziki",
    description: "The classic, refreshing Greek yogurt dip made with grated cucumber, garlic, and fresh herbs.",
    details: { cuisine: "Greek", prepTimeMinutes: 15, cookTimeMinutes: 0, baseServingSize: 6, spiceLevel: "None", season: ["summer", "all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Greek yogurt", notes: "Full fat" },
      { amount: 1, unit: "large", name: "cucumber", notes: "Grated" },
      { amount: 3, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tbsp", name: "olive oil", notes: "Extra virgin" },
      { amount: 1, unit: "tbsp", name: "white vinegar or lemon juice", notes: "For acidity" },
      { amount: 1, unit: "tbsp", name: "fresh dill", notes: "Finely chopped" },
      { amount: 0.5, unit: "tsp", name: "salt", notes: "To taste" }
    ],
    instructions: [
      "Step 1: Grate the cucumber and place it in a fine-mesh sieve. Salt lightly and let drain for 15 minutes.",
      "Step 2: Squeeze the grated cucumber vigorously to remove as much water as possible.",
      "Step 3: In a medium bowl, combine the strained cucumber with the Greek yogurt, minced garlic, olive oil, vinegar, and dill.",
      "Step 4: Stir until completely mixed.",
      "Step 5: Cover and refrigerate for at least 1 hour to allow the garlic flavor to mellow and permeate the yogurt.",
      "Step 6: Serve chilled as a dip with pita or as a sauce for grilled meats."
    ],
    classifications: { mealType: ["appetizer", "sauce", "vegetarian"], cookingMethods: ["mixing"] },
    elementalProperties: { Fire: 0.0, Water: 0.6, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Moon", "Venus"], signs: ["Cancer", "Taurus"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 90, proteinG: 6, carbsG: 5, fatG: 6, fiberG: 1, sodiumMg: 200, sugarG: 3, vitamins: ["Calcium", "Vitamin C"], minerals: ["Potassium"] },
    alchemicalProperties: { Spirit: 2, Essence: 6, Matter: 4, Substance: 5 },
    thermodynamicProperties: { heat: 0.01, entropy: 0.15, reactivity: 1.0, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.1 },
    substitutions: []
  },
  {
    name: "Authentic Gyro (Pork or Chicken)",
    description: "Iconic Greek sandwich featuring thinly sliced, heavily seasoned meat roasted on a vertical spit, served in a warm pita.",
    details: { cuisine: "Greek", prepTimeMinutes: 30, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 800, unit: "g", name: "pork shoulder or chicken thighs", notes: "Thinly sliced" },
      { amount: 3, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tbsp", name: "dried oregano", notes: "Crushed" },
      { amount: 1, unit: "tsp", name: "paprika", notes: "For color" },
      { amount: 1, unit: "tsp", name: "cumin", notes: "Ground" },
      { amount: 3, unit: "tbsp", name: "olive oil", notes: "For marinating" },
      { amount: 2, unit: "tbsp", name: "lemon juice", notes: "For marinating" },
      { amount: 4, unit: "whole", name: "pita breads", notes: "For wrapping" }
    ],
    instructions: [
      "Step 1: In a large bowl, whisk the garlic, oregano, paprika, cumin, olive oil, lemon juice, salt, and pepper.",
      "Step 2: Add the thinly sliced meat and toss well. Marinate for at least 2 hours.",
      "Step 3: Preheat oven to 400°F (200°C) or heat a heavy skillet.",
      "Step 4: If using an oven, thread meat tightly onto skewers and roast until edges are crispy. If using a skillet, sear the meat over high heat until browned and cooked through.",
      "Step 5: Warm the pita breads on a dry pan.",
      "Step 6: Assemble the gyro by placing the hot meat on the pita, topping with tzatziki, tomatoes, red onion, and a few French fries."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["roasting", "searing"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Leo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 650, proteinG: 40, carbsG: 45, fatG: 32, fiberG: 4, sodiumMg: 850, sugarG: 4, vitamins: ["Vitamin C", "Niacin"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.35, reactivity: 1.7, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  }
];

injectRecipes('chinese', 'dinner', chineseRecipes);
injectRecipes('french', 'dinner', frenchRecipes);
injectRecipes('greek', 'dinner', greekRecipes);
