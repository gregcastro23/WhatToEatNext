const { injectRecipes } = require('./injector.cjs');

const indianRecipes = [
  {
    name: "Authentic Murgh Makhani (Butter Chicken)",
    description: "A profoundly rich, creamy North Indian curry featuring tender, yogurt-marinated tandoori chicken simmered in a spiced tomato and butter sauce.",
    details: { cuisine: "Indian", prepTimeMinutes: 120, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Mild-Medium", season: ["all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "chicken thighs", notes: "Boneless, skinless" },
      { amount: 0.5, unit: "cup", name: "plain yogurt", notes: "For marinade" },
      { amount: 1, unit: "tbsp", name: "garam masala", notes: "Divided" },
      { amount: 1, unit: "tbsp", name: "Kashmiri chili powder", notes: "For color and mild heat" },
      { amount: 2, unit: "tbsp", name: "ginger-garlic paste", notes: "Divided" },
      { amount: 4, unit: "tbsp", name: "butter", notes: "Essential" },
      { amount: 2, unit: "cups", name: "tomato purée", notes: "Fresh or canned" },
      { amount: 0.5, unit: "cup", name: "heavy cream", notes: "For finishing" },
      { amount: 1, unit: "tbsp", name: "kasuri methi", notes: "Dried fenugreek leaves, crushed" }
    ],
    instructions: [
      "Step 1: Marinate chicken in yogurt, half the ginger-garlic paste, chili powder, half the garam masala, and salt for at least 2 hours.",
      "Step 2: Grill, bake, or pan-sear the marinated chicken until deeply charred. Set aside.",
      "Step 3: In a large pan, melt the butter. Sauté remaining ginger-garlic paste until fragrant.",
      "Step 4: Add tomato purée, remaining chili powder, and salt. Simmer for 20 minutes until the oil separates from the paste.",
      "Step 5: Stir in the heavy cream, remaining garam masala, and crushed kasuri methi.",
      "Step 6: Add the cooked chicken back into the sauce. Simmer for 10 minutes and serve with naan or basmati rice."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["marinating", "simmering", "grilling"] },
    elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Sun"], signs: ["Taurus", "Leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 620, proteinG: 35, carbsG: 12, fatG: 48, fiberG: 2, sodiumMg: 750, sugarG: 6, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 7, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.6, gregsEnergy: -0.5, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Palak Paneer",
    description: "A deeply vibrant, herbaceous vegetarian dish consisting of fresh paneer cheese cubes simmered in a smooth, spiced spinach purée.",
    details: { cuisine: "Indian", prepTimeMinutes: 20, cookTimeMinutes: 30, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "fresh spinach", notes: "Washed and stemmed" },
      { amount: 250, unit: "g", name: "paneer", notes: "Cut into cubes" },
      { amount: 1, unit: "large", name: "onion", notes: "Finely chopped" },
      { amount: 1, unit: "large", name: "tomato", notes: "Finely chopped" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tbsp", name: "ginger", notes: "Minced" },
      { amount: 1, unit: "tsp", name: "cumin seeds", notes: "Whole" },
      { amount: 0.5, unit: "tsp", name: "turmeric", notes: "Ground" },
      { amount: 0.5, unit: "tsp", name: "garam masala", notes: "For finishing" },
      { amount: 2, unit: "tbsp", name: "ghee", notes: "Or oil" }
    ],
    instructions: [
      "Step 1: Blanch spinach in boiling water for 2 minutes, then immediately plunge into an ice bath. Purée in a blender.",
      "Step 2: Lightly pan-fry the paneer cubes in a little oil until golden. Soak in warm water to keep them soft.",
      "Step 3: Heat ghee in a pan, add cumin seeds until they pop, then add onions, ginger, and garlic, sautéing until golden.",
      "Step 4: Add tomatoes, turmeric, and salt. Cook until tomatoes break down into a paste.",
      "Step 5: Pour in the spinach purée. Simmer gently for 5 minutes (do not overcook or it loses its bright green color).",
      "Step 6: Fold in the paneer cubes and garam masala. Serve hot."
    ],
    classifications: { mealType: ["dinner", "lunch", "vegetarian"], cookingMethods: ["blanching", "simmering"] },
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Moon", "Venus"], signs: ["Cancer", "Virgo"], lunarPhases: ["Waxing Crescent"] },
    nutritionPerServing: { calories: 380, proteinG: 15, carbsG: 12, fatG: 32, fiberG: 4, sodiumMg: 450, sugarG: 3, vitamins: ["Vitamin A", "Vitamin K", "Folate"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 6, Substance: 4 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.25, reactivity: 1.4, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Chana Masala",
    description: "A robust, tangy, and earthy North Indian chickpea curry layered with complex roasted spices and an acidic hit of amchur or pomegranate powder.",
    details: { cuisine: "Indian", prepTimeMinutes: 15, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Medium-Hot", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cans", name: "chickpeas", notes: "Rinsed and drained (or 1 cup dried, soaked and boiled)" },
      { amount: 2, unit: "large", name: "onions", notes: "Finely diced" },
      { amount: 2, unit: "whole", name: "tomatoes", notes: "Puréed" },
      { amount: 1, unit: "tbsp", name: "ginger-garlic paste", notes: "Fresh" },
      { amount: 1, unit: "tbsp", name: "chana masala powder", notes: "Specialized spice blend" },
      { amount: 1, unit: "tsp", name: "amchur (dry mango powder)", notes: "Essential for tartness" },
      { amount: 1, unit: "tsp", name: "cumin powder", notes: "Ground" },
      { amount: 1, unit: "tsp", name: "coriander powder", notes: "Ground" },
      { amount: 2, unit: "tbsp", name: "oil or ghee", notes: "For tempering" }
    ],
    instructions: [
      "Step 1: Heat oil in a heavy pot. Sauté onions until deeply browned and caramelized (15 mins).",
      "Step 2: Add ginger-garlic paste and cook for 1 minute.",
      "Step 3: Add tomato purée, chana masala powder, cumin, coriander, and salt. Cook until the oil separates from the masala.",
      "Step 4: Add the chickpeas and 1 cup of water. Bring to a boil.",
      "Step 5: Cover and simmer on low for 20-30 minutes so the chickpeas absorb the spices.",
      "Step 6: Stir in the amchur powder for a final tart kick. Garnish with cilantro and raw onion."
    ],
    classifications: { mealType: ["dinner", "lunch", "vegan"], cookingMethods: ["simmering", "sautéing"] },
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Saturn"], signs: ["Aries", "Capricorn"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 310, proteinG: 12, carbsG: 45, fatG: 10, fiberG: 12, sodiumMg: 500, sugarG: 6, vitamins: ["Vitamin C", "Folate"], minerals: ["Iron", "Magnesium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.35, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Hyderabadi Chicken Biryani",
    description: "The zenith of Indian rice dishes. A highly complex, layered masterpiece of marinated chicken and par-boiled saffron rice, sealed and steamed (dum) to lock in aromatics.",
    details: { cuisine: "Indian", prepTimeMinutes: 240, cookTimeMinutes: 60, baseServingSize: 6, spiceLevel: "Medium-Hot", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "kg", name: "bone-in chicken", notes: "Cut into large pieces" },
      { amount: 3, unit: "cups", name: "basmati rice", notes: "Aged, extra-long grain, soaked for 30 mins" },
      { amount: 1, unit: "cup", name: "yogurt", notes: "For marinade" },
      { amount: 2, unit: "cups", name: "fried onions (birista)", notes: "Deeply caramelized" },
      { amount: 0.5, unit: "cup", name: "mint and cilantro", notes: "Chopped" },
      { amount: 2, unit: "tbsp", name: "ginger-garlic paste", notes: "Fresh" },
      { amount: 1, unit: "tbsp", name: "biryani masala", notes: "Complex spice blend" },
      { amount: 0.5, unit: "tsp", name: "saffron threads", notes: "Soaked in warm milk" },
      { amount: 4, unit: "tbsp", name: "ghee", notes: "Melted" }
    ],
    instructions: [
      "Step 1: Marinate chicken with yogurt, half the fried onions, herbs, ginger-garlic paste, biryani masala, salt, and 2 tbsp oil for at least 3 hours.",
      "Step 2: Boil a large pot of heavily salted water with whole spices (cardamom, cloves, cinnamon). Add soaked rice and boil until 70% cooked (al dente). Drain.",
      "Step 3: In a heavy-bottomed pot, spread the marinated chicken in a single layer at the bottom.",
      "Step 4: Layer the 70% cooked hot rice evenly over the raw chicken.",
      "Step 5: Drizzle the saffron milk, melted ghee, remaining herbs, and remaining fried onions over the rice.",
      "Step 6: Seal the pot hermetically with dough or heavy foil (Dum). Cook on high for 10 mins to generate steam, then on the absolute lowest heat for 40 mins. Rest 15 mins before opening."
    ],
    classifications: { mealType: ["dinner", "celebration"], cookingMethods: ["marinating", "steaming", "layering"] },
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    astrologicalAffinities: { planets: ["Sun", "Jupiter"], signs: ["Leo", "Sagittarius"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 35, carbsG: 65, fatG: 25, fiberG: 4, sodiumMg: 850, sugarG: 4, vitamins: ["Vitamin B6", "Niacin"], minerals: ["Zinc", "Iron"] },
    alchemicalProperties: { Spirit: 6, Essence: 7, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.07, entropy: 0.45, reactivity: 2.1, gregsEnergy: -0.6, kalchm: 0.05, monica: 0.7 },
    substitutions: []
  },
  {
    name: "Authentic Punjabi Samosa",
    description: "The quintessential Indian street snack. A crisp, blistered, carom-seeded pastry shell stuffed with a fiercely spiced potato and green pea filling.",
    details: { cuisine: "Indian", prepTimeMinutes: 45, cookTimeMinutes: 30, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "all-purpose flour (maida)", notes: "For the dough" },
      { amount: 0.25, unit: "cup", name: "oil or ghee", notes: "For the dough (moyen)" },
      { amount: 0.5, unit: "tsp", name: "carom seeds (ajwain)", notes: "Crushed, for the dough" },
      { amount: 4, unit: "large", name: "potatoes", notes: "Boiled, peeled, and crumbled" },
      { amount: 0.5, unit: "cup", name: "green peas", notes: "Boiled" },
      { amount: 1, unit: "tbsp", name: "ginger and green chili", notes: "Pounded into a coarse paste" },
      { amount: 1, unit: "tsp", name: "coriander seeds", notes: "Crushed" },
      { amount: 1, unit: "tsp", name: "garam masala", notes: "For the filling" },
      { amount: 1, unit: "tsp", name: "amchur", notes: "Dry mango powder" },
      { amount: 3, unit: "cups", name: "oil", notes: "For deep frying" }
    ],
    instructions: [
      "Step 1: Rub the flour, ajwain, salt, and 1/4 cup oil together until it resembles breadcrumbs. Add cold water little by little to knead a stiff dough. Rest 30 mins.",
      "Step 2: Heat 1 tbsp oil, temper crushed coriander seeds, add ginger-chili paste, and sauté for 30 seconds.",
      "Step 3: Add crumbled potatoes, peas, garam masala, amchur, and salt. Toss well. Do not mash the potatoes fully; leave chunks. Cool the filling.",
      "Step 4: Roll a ball of dough into an oval, cut in half. Form a cone with one half, seal the edge with water.",
      "Step 5: Stuff the cone with the potato filling, pleat the back edge, and seal the base tightly with water.",
      "Step 6: Fry in medium-low oil (not hot) for 15-20 minutes so the crust becomes crisp and flaky without blistering heavily."
    ],
    classifications: { mealType: ["snack", "street food", "vegetarian"], cookingMethods: ["kneading", "deep-frying"] },
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Earth"], signs: ["Aries", "Taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 380, proteinG: 6, carbsG: 45, fatG: 20, fiberG: 4, sodiumMg: 400, sugarG: 2, vitamins: ["Vitamin C"], minerals: ["Potassium", "Iron"] },
    alchemicalProperties: { Spirit: 3, Essence: 4, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.6, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  }
];

const italianRecipes = [
  {
    name: "Authentic Spaghetti alla Carbonara",
    description: "A Roman classic defining culinary minimalism. The alchemy relies on aggressively emulsifying starchy pasta water, rendered guanciale fat, pecorino cheese, and raw eggs into a thick, glossy sauce.",
    details: { cuisine: "Italian", prepTimeMinutes: 10, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 400, unit: "g", name: "spaghetti", notes: "High quality durum wheat" },
      { amount: 150, unit: "g", name: "guanciale", notes: "Cured pork jowl, cut into strips" },
      { amount: 4, unit: "large", name: "egg yolks", notes: "Plus 1 whole egg" },
      { amount: 100, unit: "g", name: "Pecorino Romano", notes: "Finely grated, plus extra for serving" },
      { amount: 2, unit: "tsp", name: "black pepper", notes: "Freshly and coarsely ground" }
    ],
    instructions: [
      "Step 1: Bring a large pot of water to a boil. Salt it less than usual, as the guanciale and pecorino are very salty.",
      "Step 2: In a cold skillet, add the guanciale strips. Heat slowly to render the fat until the meat is crispy. Remove from heat.",
      "Step 3: In a bowl, vigorously whisk the egg yolks, whole egg, grated pecorino, and a heavy amount of black pepper into a thick paste.",
      "Step 4: Boil the spaghetti until al dente. Reserve 1 cup of starchy pasta water.",
      "Step 5: Transfer the hot pasta directly into the skillet with the guanciale and its fat. Toss well.",
      "Step 6: Off the heat, pour the egg and cheese paste over the pasta. Rapidly toss and add splashes of hot pasta water to emulsify the mixture into a creamy sauce. Serve immediately."
    ],
    classifications: { mealType: ["dinner", "lunch", "pasta"], cookingMethods: ["boiling", "emulsifying"] },
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    astrologicalAffinities: { planets: ["Venus", "Earth"], signs: ["Taurus", "Libra"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 25, carbsG: 75, fatG: 28, fiberG: 3, sodiumMg: 950, sugarG: 2, vitamins: ["Vitamin B12", "Riboflavin"], minerals: ["Calcium", "Phosphorus"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Lasagna al Forno",
    description: "The ultimate expression of Emilia-Romagna comfort. Layers of fresh egg pasta, slow-cooked Bolognese ragù, and creamy béchamel, baked until bubbling and golden.",
    details: { cuisine: "Italian", prepTimeMinutes: 60, cookTimeMinutes: 240, baseServingSize: 8, spiceLevel: "None", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 500, unit: "g", name: "fresh egg pasta sheets", notes: "Or dried lasagna noodles" },
      { amount: 800, unit: "g", name: "Bolognese ragù", notes: "Rich meat sauce cooked for 3 hours" },
      { amount: 4, unit: "cups", name: "béchamel sauce", notes: "Made from butter, flour, milk, and nutmeg" },
      { amount: 1, unit: "cup", name: "Parmigiano-Reggiano", notes: "Freshly grated" },
      { amount: 2, unit: "tbsp", name: "butter", notes: "For greasing the dish" }
    ],
    instructions: [
      "Step 1: Prepare the Bolognese ragù in advance (beef/pork, soffritto, wine, milk, tomato).",
      "Step 2: Prepare the béchamel sauce, seasoning it with salt, white pepper, and nutmeg.",
      "Step 3: Blanch the pasta sheets in boiling salted water for 30 seconds, then shock in ice water and dry on towels.",
      "Step 4: Butter a 9x13 baking dish. Spread a thin layer of ragù on the bottom.",
      "Step 5: Layer in order: pasta, ragù, béchamel, and Parmigiano. Repeat to create 4-5 layers, ending with béchamel and a heavy dusting of cheese.",
      "Step 6: Bake at 375°F (190°C) for 40 minutes until the top is deeply browned and bubbling. Rest for 15 minutes before slicing."
    ],
    classifications: { mealType: ["dinner", "casserole", "pasta"], cookingMethods: ["layering", "baking", "slow-cooking"] },
    elementalProperties: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Venus"], signs: ["Cancer", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 720, proteinG: 35, carbsG: 55, fatG: 38, fiberG: 4, sodiumMg: 850, sugarG: 8, vitamins: ["Vitamin A", "Calcium"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 8, Substance: 6 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.4, gregsEnergy: -0.5, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Osso Buco alla Milanese",
    description: "A luxurious Milanese braise of cross-cut veal shanks, where the marrow renders into the wine and broth sauce, finished with a bright, zesty gremolata.",
    details: { cuisine: "Italian (Milanese)", prepTimeMinutes: 20, cookTimeMinutes: 120, baseServingSize: 4, spiceLevel: "None", season: ["winter"] },
    ingredients: [
      { amount: 4, unit: "pieces", name: "veal shanks (osso buco)", notes: "Cut 1.5 inches thick, tied with twine" },
      { amount: 0.5, unit: "cup", name: "all-purpose flour", notes: "For dredging" },
      { amount: 1, unit: "large", name: "onion", notes: "Finely diced" },
      { amount: 1, unit: "medium", name: "carrot", notes: "Finely diced" },
      { amount: 1, unit: "stalk", name: "celery", notes: "Finely diced" },
      { amount: 1, unit: "cup", name: "dry white wine", notes: "Pinot Grigio or similar" },
      { amount: 2, unit: "cups", name: "chicken or veal stock", notes: "Warm" },
      { amount: 1, unit: "tbsp", name: "lemon zest", notes: "For the gremolata" },
      { amount: 2, unit: "tbsp", name: "fresh parsley", notes: "Finely chopped, for gremolata" },
      { amount: 1, unit: "clove", name: "garlic", notes: "Minced, for gremolata" }
    ],
    instructions: [
      "Step 1: Tie the veal shanks to keep them intact. Season generously with salt and pepper, then dredge lightly in flour.",
      "Step 2: In a heavy Dutch oven, brown the shanks in butter and olive oil until deeply crusty. Remove.",
      "Step 3: In the same pot, sauté the onion, carrot, and celery until soft.",
      "Step 4: Deglaze the pan with white wine, scraping up the browned bits, and reduce by half.",
      "Step 5: Return the veal, add the stock until it comes halfway up the shanks. Cover and braise at 325°F (160°C) for 2 hours until fork-tender.",
      "Step 6: Mix lemon zest, parsley, and garlic to make gremolata. Sprinkle over the hot meat just before serving."
    ],
    classifications: { mealType: ["dinner", "stew"], cookingMethods: ["braising", "searing"] },
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Sun"], signs: ["Taurus", "Leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 580, proteinG: 45, carbsG: 12, fatG: 35, fiberG: 2, sodiumMg: 600, sugarG: 3, vitamins: ["Vitamin C", "Niacin"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.6, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Risotto alla Milanese",
    description: "The golden jewel of Milan. A creamy, rich, saffron-infused rice dish requiring constant attention, continuous stirring, and a precise finish of butter and cheese (mantecatura).",
    details: { cuisine: "Italian (Milanese)", prepTimeMinutes: 10, cookTimeMinutes: 25, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 320, unit: "g", name: "Carnaroli or Arborio rice", notes: "High starch, short-grain" },
      { amount: 1, unit: "small", name: "onion", notes: "Very finely minced" },
      { amount: 0.5, unit: "tsp", name: "saffron threads", notes: "Steeped in a little hot broth" },
      { amount: 1, unit: "cup", name: "dry white wine", notes: "Room temperature" },
      { amount: 1.5, unit: "liters", name: "beef or chicken broth", notes: "Kept at a rolling simmer" },
      { amount: 60, unit: "g", name: "unsalted butter", notes: "Cold, diced, for mantecatura" },
      { amount: 60, unit: "g", name: "Parmigiano-Reggiano", notes: "Freshly grated" }
    ],
    instructions: [
      "Step 1: Sauté the minced onion in butter until translucent but not browned.",
      "Step 2: Add the rice and toast it for 2-3 minutes until the edges turn translucent.",
      "Step 3: Pour in the white wine and stir until completely absorbed.",
      "Step 4: Begin adding the simmering broth one ladle at a time, stirring constantly. Wait until each ladle is absorbed before adding the next.",
      "Step 5: Halfway through, pour in the saffron-infused broth. Continue adding broth and stirring until the rice is al dente (about 18 minutes).",
      "Step 6: Remove from heat. Vigorously beat in the cold butter and Parmigiano (the mantecatura) until the risotto forms a wave ('all'onda'). Serve on a flat plate."
    ],
    classifications: { mealType: ["dinner", "primo"], cookingMethods: ["stirring", "simmering"] },
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["Leo", "Taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 450, proteinG: 12, carbsG: 65, fatG: 16, fiberG: 2, sodiumMg: 800, sugarG: 2, vitamins: ["Vitamin A", "B Vitamins"], minerals: ["Calcium", "Phosphorus"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.2, reactivity: 1.4, gregsEnergy: -0.3, kalchm: 0.01, monica: 0.3 },
    substitutions: []
  },
  {
    name: "Authentic Tiramisù",
    description: "The quintessential Italian 'pick-me-up' dessert. Layers of espresso-soaked savoiardi (ladyfingers) encased in a rich, airy mascarpone and egg yolk cream, dusted heavily with bitter cocoa.",
    details: { cuisine: "Italian", prepTimeMinutes: 30, cookTimeMinutes: 0, baseServingSize: 8, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "large", name: "eggs", notes: "Separated into yolks and whites" },
      { amount: 0.5, unit: "cup", name: "granulated sugar", notes: "Divided" },
      { amount: 500, unit: "g", name: "mascarpone cheese", notes: "Room temperature" },
      { amount: 2, unit: "cups", name: "strong espresso", notes: "Cooled" },
      { amount: 2, unit: "tbsp", name: "Marsala wine or dark rum", notes: "Optional, mixed into espresso" },
      { amount: 300, unit: "g", name: "savoiardi (ladyfingers)", notes: "Dry and crisp" },
      { amount: 2, unit: "tbsp", name: "unsweetened cocoa powder", notes: "For dusting" }
    ],
    instructions: [
      "Step 1: Whisk the egg yolks with half the sugar until pale and thick. Gently fold in the mascarpone until smooth.",
      "Step 2: In a separate clean bowl, whip the egg whites with the remaining sugar until stiff peaks form.",
      "Step 3: Gently fold the whipped egg whites into the mascarpone mixture to lighten it.",
      "Step 4: Quickly dip each ladyfinger into the cooled espresso mixture (do not soak or they will disintegrate) and arrange them in a tight layer in a dish.",
      "Step 5: Spread half the mascarpone cream over the ladyfingers. Repeat with a second layer of dipped ladyfingers and the remaining cream.",
      "Step 6: Refrigerate for at least 4 hours (preferably overnight). Dust heavily with cocoa powder just before serving."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["whipping", "layering", "chilling"] },
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.4 },
    astrologicalAffinities: { planets: ["Venus", "Neptune"], signs: ["Libra", "Pisces"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 410, proteinG: 8, carbsG: 35, fatG: 28, fiberG: 1, sodiumMg: 100, sugarG: 20, vitamins: ["Vitamin A", "Riboflavin"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 5, Essence: 6, Matter: 4, Substance: 4 },
    thermodynamicProperties: { heat: 0.01, entropy: 0.35, reactivity: 1.2, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.2 },
    substitutions: []
  }
];

const japaneseRecipes = [
  {
    name: "Authentic Nigiri Sushi (Tuna & Salmon)",
    description: "The purest expression of Japanese culinary minimalism. A hand-formed mound of vinegared rice draped with a meticulously sliced, pristine piece of raw fish.",
    details: { cuisine: "Japanese", prepTimeMinutes: 45, cookTimeMinutes: 30, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "short-grain sushi rice", notes: "Washed until water runs clear" },
      { amount: 0.33, unit: "cup", name: "rice vinegar", notes: "For the sushi-zu" },
      { amount: 2, unit: "tbsp", name: "sugar", notes: "Dissolved in the vinegar" },
      { amount: 1, unit: "tsp", name: "salt", notes: "Dissolved in the vinegar" },
      { amount: 200, unit: "g", name: "sashimi-grade tuna (Maguro)", notes: "Cut into 1/4-inch slices" },
      { amount: 200, unit: "g", name: "sashimi-grade salmon (Sake)", notes: "Cut into 1/4-inch slices" },
      { amount: 1, unit: "tsp", name: "wasabi paste", notes: "For under the fish" },
      { amount: 0.25, unit: "cup", name: "soy sauce", notes: "For dipping" }
    ],
    instructions: [
      "Step 1: Cook the rice. Once done, transfer to a large wooden tub (hangiri).",
      "Step 2: Fold the vinegar-sugar-salt mixture into the hot rice using a slicing motion with a paddle, while fanning it to cool and create a glossy sheen.",
      "Step 3: Wet your hands lightly. Take a small amount of warm rice and form it into a firm but airy oval mound.",
      "Step 4: Take a slice of fish in your other hand, dab a minuscule amount of wasabi in the center.",
      "Step 5: Press the rice mound onto the fish. Gently flip it over and use two fingers to press the fish neatly over the sides of the rice.",
      "Step 6: Serve immediately. The rice should be slightly warm, and the fish cool."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["steaming", "folding", "slicing"] },
    elementalProperties: { Fire: 0.0, Water: 0.5, Earth: 0.3, Air: 0.2 },
    astrologicalAffinities: { planets: ["Moon", "Neptune"], signs: ["Pisces", "Cancer"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 25, carbsG: 50, fatG: 5, fiberG: 1, sodiumMg: 600, sugarG: 8, vitamins: ["Vitamin D", "Vitamin B12"], minerals: ["Iodine", "Selenium"] },
    alchemicalProperties: { Spirit: 6, Essence: 7, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.01, entropy: 0.15, reactivity: 1.1, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.1 },
    substitutions: []
  },
  {
    name: "Authentic Tonkotsu Ramen",
    description: "A triumph of patience. A rich, opaque, intensely porky broth created by boiling pork bones for over 12 hours until the marrow, fat, and collagen completely emulsify into a milky soup.",
    details: { cuisine: "Japanese", prepTimeMinutes: 30, cookTimeMinutes: 720, baseServingSize: 4, spiceLevel: "None", season: ["winter", "all"] },
    ingredients: [
      { amount: 2, unit: "kg", name: "pork leg bones and trotters", notes: "Split to expose marrow" },
      { amount: 1, unit: "whole", name: "onion", notes: "Halved" },
      { amount: 1, unit: "head", name: "garlic", notes: "Halved" },
      { amount: 4, unit: "portions", name: "fresh ramen noodles", notes: "Alkaline noodles" },
      { amount: 0.5, unit: "cup", name: "shoyu tare or shio tare", notes: "The concentrated seasoning base" },
      { amount: 4, unit: "slices", name: "chashu (braised pork belly)", notes: "For topping" },
      { amount: 2, unit: "whole", name: "ajitsuke tamago", notes: "Soft-boiled marinated eggs, halved" },
      { amount: 0.5, unit: "cup", name: "scallions", notes: "Finely chopped" }
    ],
    instructions: [
      "Step 1: Clean the bones. Boil them rapidly for 10 minutes, then discard the water and wash the bones thoroughly to remove scum.",
      "Step 2: Place clean bones, onion, and garlic in a large pot. Cover with water and bring to a rolling boil.",
      "Step 3: Keep the broth at a rapid, rolling boil (not a simmer) for 12 to 14 hours. The violent agitation emulsifies the fat and collagen into the milky Tonkotsu base.",
      "Step 4: Strain the broth perfectly smooth.",
      "Step 5: Place 2 tbsp of tare in the bottom of a serving bowl. Boil the noodles separately for 60 seconds.",
      "Step 6: Pour the boiling hot broth into the bowl, add the noodles, and top with chashu, egg, and scallions."
    ],
    classifications: { mealType: ["dinner", "lunch", "soup"], cookingMethods: ["boiling", "emulsifying"] },
    elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.1, Air: 0.1 },
    astrologicalAffinities: { planets: ["Pluto", "Saturn"], signs: ["Scorpio", "Capricorn"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 750, proteinG: 32, carbsG: 65, fatG: 40, fiberG: 2, sodiumMg: 1200, sugarG: 4, vitamins: ["Vitamin B12", "Thiamin"], minerals: ["Iron", "Calcium"] },
    alchemicalProperties: { Spirit: 4, Essence: 7, Matter: 6, Substance: 6 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.45, reactivity: 2.2, gregsEnergy: -0.6, kalchm: 0.05, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Tempura (Shrimp & Vegetables)",
    description: "The pinnacle of Japanese deep-frying. A technique focusing on an impossibly light, lacy, and shatteringly crisp batter that steams the pristine ingredient inside.",
    details: { cuisine: "Japanese", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 12, unit: "large", name: "shrimp", notes: "Peeled, stretched straight" },
      { amount: 2, unit: "cups", name: "mixed vegetables", notes: "Sweet potato, eggplant, shiso leaves" },
      { amount: 1, unit: "cup", name: "cake flour", notes: "Low protein flour for less gluten" },
      { amount: 1, unit: "cup", name: "ice water", notes: "Must be freezing cold" },
      { amount: 1, unit: "whole", name: "egg yolk", notes: "For the batter" },
      { amount: 4, unit: "cups", name: "neutral oil or sesame oil blend", notes: "For frying" },
      { amount: 1, unit: "cup", name: "tentsuyu", notes: "Dipping broth made from dashi, soy, and mirin" }
    ],
    instructions: [
      "Step 1: Prepare the ingredients. Score the belly of the shrimp to prevent curling.",
      "Step 2: Heat the oil to precisely 340°F (170°C).",
      "Step 3: Make the batter just before frying. Whisk the egg yolk and ice water together. Gently dump in the flour.",
      "Step 4: Barely mix the batter with chopsticks. Lumps of flour should remain. Overmixing develops gluten and ruins the texture.",
      "Step 5: Dust the ingredients lightly in dry flour, dip into the cold batter, and immediately drop into the hot oil.",
      "Step 6: Fry for 1-2 minutes until crisp but not brown. Serve immediately with warm tentsuyu dipping broth and grated daikon."
    ],
    classifications: { mealType: ["dinner", "appetizer"], cookingMethods: ["deep-frying"] },
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
    astrologicalAffinities: { planets: ["Mercury", "Uranus"], signs: ["Gemini", "Aquarius"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 450, proteinG: 18, carbsG: 35, fatG: 26, fiberG: 3, sodiumMg: 600, sugarG: 2, vitamins: ["Vitamin E", "Selenium"], minerals: ["Iodine", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 4, Matter: 3, Substance: 3 },
    thermodynamicProperties: { heat: 0.07, entropy: 0.35, reactivity: 2.0, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Okonomiyaki (Osaka Style)",
    description: "A savory, highly customizable Japanese cabbage pancake cooked on a teppan (griddle), loaded with pork belly, seafood, and heavily garnished with sauces and bonito flakes.",
    details: { cuisine: "Japanese", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "all-purpose flour", notes: "For the batter" },
      { amount: 0.75, unit: "cup", name: "dashi broth", notes: "For the batter" },
      { amount: 2, unit: "large", name: "eggs", notes: "For binding" },
      { amount: 3, unit: "cups", name: "green cabbage", notes: "Very finely shredded" },
      { amount: 0.5, unit: "cup", name: "tenkasu (tempura scraps)", notes: "For internal crunch" },
      { amount: 6, unit: "slices", name: "thin pork belly", notes: "To be cooked into the top" },
      { amount: 0.25, unit: "cup", name: "okonomiyaki sauce", notes: "Thick, sweet, and savory" },
      { amount: 2, unit: "tbsp", name: "Kewpie mayonnaise", notes: "For the lattice topping" },
      { amount: 1, unit: "tbsp", name: "katsuobushi (bonito flakes)", notes: "For garnish" }
    ],
    instructions: [
      "Step 1: Whisk the flour and dashi broth together, then let rest for 15 minutes.",
      "Step 2: Add the shredded cabbage, eggs, and tenkasu into the batter. Fold gently so the cabbage retains its airiness.",
      "Step 3: Heat a griddle or skillet to medium heat. Pour the cabbage mixture into a thick, round pancake shape.",
      "Step 4: Lay the slices of pork belly evenly across the top of the raw batter.",
      "Step 5: Cook for 5 minutes, then carefully flip the pancake so the pork belly sears and crisps against the hot griddle for another 5 minutes.",
      "Step 6: Flip onto a plate. Brush generously with okonomiyaki sauce, drizzle with a lattice of mayonnaise, and top with dancing bonito flakes."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["griddling", "pan-frying"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Venus"], signs: ["Taurus", "Sagittarius"], lunarPhases: ["Waxing Gibbous"] },
    nutritionPerServing: { calories: 580, proteinG: 22, carbsG: 50, fatG: 32, fiberG: 6, sodiumMg: 950, sugarG: 12, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Yakitori (Negima)",
    description: "The beloved izakaya staple. Skewered chunks of chicken thigh alternated with sections of scallion, grilled fiercely over binchotan charcoal and glazed with a sweet soy 'tare'.",
    details: { cuisine: "Japanese", prepTimeMinutes: 20, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "chicken thighs", notes: "Boneless, cut into 1-inch bite-sized pieces" },
      { amount: 2, unit: "bunches", name: "Tokyo negi or thick scallions", notes: "Cut into 1-inch lengths" },
      { amount: 0.5, unit: "cup", name: "soy sauce", notes: "For the tare" },
      { amount: 0.5, unit: "cup", name: "mirin", notes: "For the tare" },
      { amount: 0.25, unit: "cup", name: "sake", notes: "For the tare" },
      { amount: 2, unit: "tbsp", name: "sugar", notes: "For the tare" },
      { amount: 8, unit: "whole", name: "bamboo skewers", notes: "Soaked in water for 30 minutes" }
    ],
    instructions: [
      "Step 1: Make the tare: Combine soy sauce, mirin, sake, and sugar in a small pot. Simmer until it reduces to a thick, glossy syrup.",
      "Step 2: Thread the chicken pieces and scallion lengths alternately onto the soaked bamboo skewers.",
      "Step 3: Prepare a charcoal grill, ideally using binchotan (white charcoal) for high heat without smoke.",
      "Step 4: Grill the skewers directly over the coals until the chicken begins to turn white and the scallions char.",
      "Step 5: Dip the skewers into the tare sauce or brush it on heavily, then return to the grill for 30 seconds to caramelize.",
      "Step 6: Dip and grill a second time for a deeply sticky, glossy finish. Serve immediately."
    ],
    classifications: { mealType: ["dinner", "appetizer", "street food"], cookingMethods: ["grilling", "glazing"] },
    elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Leo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 310, proteinG: 26, carbsG: 18, fatG: 12, fiberG: 1, sodiumMg: 850, sugarG: 14, vitamins: ["Niacin", "Vitamin B6"], minerals: ["Zinc", "Iron"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.07, entropy: 0.35, reactivity: 1.8, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  }
];

injectRecipes('indian', 'dinner', indianRecipes);
injectRecipes('italian', 'dinner', italianRecipes);
injectRecipes('japanese', 'dinner', japaneseRecipes);
