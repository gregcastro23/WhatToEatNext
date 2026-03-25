import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
const sf = project.addSourceFileAtPath('src/data/cuisines/italian.ts');

const newRecipes = [
  {
    name: "Authentic Osso Buco alla Milanese",
    description: "A monumental achievement of Lombardy. Cross-cut veal shanks are braised with aromatics and white wine until the marrow becomes custardy and the meat structurally collapses, finished with a bright, electric gremolata.",
    details: { cuisine: "Italian (Milan)", prepTimeMinutes: 20, cookTimeMinutes: 120, baseServingSize: 4, spiceLevel: "None", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 4, unit: "cuts", name: "Veal shanks", notes: "Cross-cut, 1.5 inches thick." },
      { amount: 0.5, unit: "cup", name: "Dry white wine", notes: "Pinot Grigio or similar." },
      { amount: 2, unit: "cups", name: "Veal or beef stock", notes: "Rich and gelatinous." },
      { amount: 1, unit: "bunch", name: "Gremolata", notes: "Parsley, lemon zest, and garlic minced together." },
      { amount: 2, unit: "tbsp", name: "Tomato paste", notes: "For depth." }
    ],
    instructions: [
      "Step 1: The Tie. Tie the veal shanks with kitchen twine to prevent the meat from falling off the bone during the long braise.",
      "Step 2: The Sear. Dredge the shanks in flour and sear in butter and oil until a deep, crusty Maillard layer forms.",
      "Step 3: The Deglaze. Remove meat. Sauté mirepoix (onion, carrot, celery). Add tomato paste, then deglaze with white wine, scraping all fond.",
      "Step 4: The Braise. Return shanks to the pot. Add stock until halfway submerged. Cover and simmer on low for 2 hours.",
      "Step 5: The Gremolata. Five minutes before serving, sprinkle the fresh gremolata over the meat. The heat will release the lemon and garlic oils, cutting through the heavy fat of the marrow."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["braising", "searing"] },
    elementalProperties: { Fire: 0.20, Water: 0.30, Earth: 0.45, Air: 0.05 },
    astrologicalAffinities: { planets: ["Saturn", "Jupiter"], signs: ["capricorn", "sagittarius"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 650, proteinG: 52, carbsG: 12, fatG: 42, fiberG: 2, sodiumMg: 850, sugarG: 4, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Potassium"] },
    substitutions: [{ originalIngredient: "Veal shanks", substituteOptions: ["Beef shanks (though tougher)"] }]
  },
  {
    name: "Authentic Saltimbocca alla Romana",
    description: "Meat that 'jumps in the mouth'. Paper-thin veal escalopes are structurally fused with salty prosciutto and aromatic sage, flash-fried in butter and white wine to create an instantaneous, high-kinetic flavor profile.",
    details: { cuisine: "Italian (Rome)", prepTimeMinutes: 15, cookTimeMinutes: 5, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "slices", name: "Veal scallopini", notes: "Pounded extremely thin." },
      { amount: 4, unit: "slices", name: "Prosciutto di Parma", notes: "Thinly sliced." },
      { amount: 4, unit: "leaves", name: "Fresh sage", notes: "Large leaves." },
      { amount: 0.25, unit: "cup", name: "Dry white wine", notes: "For the pan sauce." },
      { amount: 2, unit: "tbsp", name: "Cold butter", notes: "To emulsify the sauce." }
    ],
    instructions: [
      "Step 1: The Fusion. Lay a slice of prosciutto over each pounded veal slice. Place a sage leaf in the center. Secure all three layers by 'stitching' a toothpick through them.",
      "Step 2: The Flour. Dredge only the meat side (not the prosciutto side) lightly in flour.",
      "Step 3: The Flash Fry. Heat butter in a skillet. Fry the veal prosciutto-side down for 1 minute to crisp the ham, then flip and fry the meat side for 30 seconds.",
      "Step 4: The Deglaze. Remove meat. Immediately pour wine into the pan. Scrape the bits. Whisk in cold butter to create a glossy, mounted emulsion.",
      "Step 5: The Finish. Pour the sauce over the veal and serve immediately while the sage is still aromatic."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["pan-frying", "pounding"] },
    elementalProperties: { Fire: 0.45, Water: 0.10, Earth: 0.30, Air: 0.15 },
    astrologicalAffinities: { planets: ["Mars", "Venus"], signs: ["aries", "libra"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 420, proteinG: 38, carbsG: 5, fatG: 28, fiberG: 0, sodiumMg: 1100, sugarG: 1, vitamins: ["Vitamin B6", "Niacin"], minerals: ["Zinc", "Iron"] },
    substitutions: [{ originalIngredient: "Veal", substituteOptions: ["Chicken breast", "Turkey breast"] }]
  },
  {
    name: "Authentic Spaghetti alla Carbonara",
    description: "The chemical triumph of emulsion. No cream is permitted; the rich, velvety sauce is created entirely through the controlled tempering of raw eggs and Pecorino Romano with the rendering fat of Guanciale and hot pasta water.",
    details: { cuisine: "Italian (Rome)", prepTimeMinutes: 5, cookTimeMinutes: 10, baseServingSize: 2, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 200, unit: "g", name: "Spaghetti", notes: "High-quality bronze-die pasta." },
      { amount: 100, unit: "g", name: "Guanciale", notes: "Cured pork jowl. Do not substitute with bacon." },
      { amount: 2, unit: "large", name: "Egg yolks", notes: "Plus one whole egg for extra protein binding." },
      { amount: 50, unit: "g", name: "Pecorino Romano", notes: "Freshly and finely grated." },
      { amount: 1, unit: "tbsp", name: "Black pepper", notes: "Toasted and coarsely ground." }
    ],
    instructions: [
      "Step 1: The Rendering. Sauté diced guanciale in a cold pan, gradually increasing heat until the fat renders out and the meat becomes golden and crispy. Remove from heat but keep the fat hot.",
      "Step 2: The Cream. In a bowl, whisk the eggs and Pecorino into a thick, dry paste. Add the toasted black pepper.",
      "Step 3: The Pasta. Boil spaghetti in heavily salted water until 'al dente'. Save a cup of starchy pasta water.",
      "Step 4: The Tempering. This is the critical alchemical step. Add the hot pasta to the guanciale fat (off the heat). Toss to coat. Then, add the egg-cheese paste.",
      "Step 5: The Emulsion. Vigorously toss the mixture while adding splashes of hot pasta water. The heat of the pasta 'cooks' the egg into a creamy sauce without scrambling it. Serve immediately on warmed plates."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["boiling", "emulsifying"] },
    elementalProperties: { Fire: 0.30, Water: 0.20, Earth: 0.40, Air: 0.10 },
    astrologicalAffinities: { planets: ["Venus", "Saturn"], signs: ["taurus", "capricorn"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 720, proteinG: 28, carbsG: 65, fatG: 52, fiberG: 3, sodiumMg: 1400, sugarG: 2, vitamins: ["Vitamin B12", "Selenium"], minerals: ["Calcium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Guanciale", substituteOptions: ["Pancetta"] }]
  },
  {
    name: "Authentic Focaccia Genovese",
    description: "A study in hydration and architectural dimpling. This flatbread is defined by a 70%+ hydration dough, soaked in a 'salamoia' (brine) of oil and water that pools in deep finger-pressed craters to create a fried-yet-steamed texture.",
    details: { cuisine: "Italian (Genoa)", prepTimeMinutes: 240, cookTimeMinutes: 20, baseServingSize: 8, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "Bread flour", notes: "High protein (12.5%+)." },
      { amount: 350, unit: "g", name: "Water", notes: "Room temperature." },
      { amount: 100, unit: "g", name: "Extra virgin olive oil", notes: "High quality, divided." },
      { amount: 10, unit: "g", name: "Malt or honey", notes: "To feed the yeast and aid browning." },
      { amount: 1, unit: "tbsp", name: "Flaky sea salt", notes: "For the surface." }
    ],
    instructions: [
      "Step 1: The Dough. Knead flour, water, yeast, malt, and a portion of oil until very smooth and elastic. It will be sticky. Let it rise for 2 hours.",
      "Step 2: The Stretch. Pour oil onto a baking sheet. Place dough on top, flip to coat, and gently stretch to the edges. Let it rest and rise again for 45 minutes.",
      "Step 3: The Dimpling. This is the core technique. Use your fingertips to press deep, vertical holes all over the dough, reaching all the way to the bottom of the pan.",
      "Step 4: The Salamoia. Whisk 30g water with 30g olive oil and salt until emulsified. Pour this brine over the dough so it fills every dimple. Let rise for a final 45 minutes.",
      "Step 5: The Bake. Bake at 450°F (230°C) until the top is golden but the dimples remain pale and moist from the oil-water pool. The bottom should be essentially fried in the pan oil."
    ],
    classifications: { mealType: ["snack", "side"], cookingMethods: ["baking", "fermenting"] },
    elementalProperties: { Fire: 0.25, Water: 0.20, Earth: 0.40, Air: 0.15 },
    astrologicalAffinities: { planets: ["Venus", "Earth"], signs: ["taurus", "virgo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 320, proteinG: 8, carbsG: 45, fatG: 12, fiberG: 2, sodiumMg: 550, sugarG: 1, vitamins: ["Vitamin E", "Thiamin"], minerals: ["Iron", "Manganese"] },
    substitutions: [{ originalIngredient: "Bread flour", substituteOptions: ["All-purpose flour (less chewy result)"] }]
  },
  {
    name: "Authentic Tiramisù",
    description: "The 'Pick Me Up'. A structural assembly of caffeine-soaked ladyfingers and a lush, aerated zabaglione-mascarpone cream. It relies on the perfect saturation of the biscuits—too much and it collapses into mush, too little and it remains rigid.",
    details: { cuisine: "Italian (Veneto)", prepTimeMinutes: 30, cookTimeMinutes: 0, baseServingSize: 6, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "Mascarpone cheese", notes: "Must be full fat and cold." },
      { amount: 4, unit: "large", name: "Egg yolks", notes: "Freshest possible." },
      { amount: 100, unit: "g", name: "Granulated sugar", notes: "For the zabaglione." },
      { amount: 1, unit: "package", name: "Savoiardi (Ladyfingers)", notes: "Hard, sugar-crusted biscuits." },
      { amount: 2, unit: "cups", name: "Strong Espresso", notes: "Cooled to room temperature." },
      { amount: 2, unit: "tbsp", name: "Marsala wine or dark rum", notes: "Optional, for the coffee soak." },
      { amount: 0.25, unit: "cup", name: "Cocoa powder", notes: "For the final protective layer." }
    ],
    instructions: [
      "Step 1: The Zabaglione. Whisk yolks and sugar over a simmering water bath (Baño María) until they double in volume and become pale and thick. This pasteurizes the eggs and creates stability.",
      "Step 2: The Cream. Gently fold the cold mascarpone into the cooled yolk mixture until smooth. For extreme lightness, fold in stiffly peaked egg whites or whipped cream.",
      "Step 3: The Soak. Dip each Savoiardi into the espresso for exactly 1.5 seconds per side. They must be moist on the outside but still have a dry core that will soften over time.",
      "Step 4: The Stratification. Layer the soaked biscuits in a dish. Spread half the cream. Repeat. The structure must be even and level.",
      "Step 5: The Ripening. Refrigerate for at least 6 hours. This allows the moisture to migrate from the cream into the biscuits, unifying them into a single, spoonable matrix. Dust heavily with cocoa powder only at the moment of serving."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["whipping", "assembling", "tempering"] },
    elementalProperties: { Fire: 0.05, Water: 0.35, Earth: 0.30, Air: 0.30 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["libra", "cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 480, proteinG: 10, carbsG: 42, fatG: 34, fiberG: 1, sodiumMg: 150, sugarG: 28, vitamins: ["Vitamin A", "Riboflavin"], minerals: ["Calcium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Mascarpone", substituteOptions: ["Cream cheese mixed with heavy cream (not authentic)"] }]
  }
];

const objectLiterals = sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
const dishesObjProp = objectLiterals.find(obj => obj.getProperty('dishes'))?.getProperty('dishes');

if (dishesObjProp) {
    const dishesObj = dishesObjProp.getInitializer();
    const dinnerObj = dishesObj.getProperty('dinner')?.getInitializer();
    if (dinnerObj) {
        const allArray = dinnerObj.getProperty('all')?.getInitializer();
        if (allArray && allArray.getKind() === SyntaxKind.ArrayLiteralExpression) {
            newRecipes.forEach(recipe => {
                allArray.addElement(JSON.stringify(recipe, null, 2));
            });
        }
    }
}

sf.saveSync();
console.log("Successfully added 5 new recipes to italian.ts");
