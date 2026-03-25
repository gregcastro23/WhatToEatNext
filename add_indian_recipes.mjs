import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
const sf = project.addSourceFileAtPath('src/data/cuisines/indian.ts');

const newRecipes = [
  {
    name: "Authentic Rogan Josh",
    description: "The crown jewel of Kashmiri cuisine. Tender lamb is slow-braised in a vibrant red sauce, flavored not with tomatoes, but with the essence of dried cockscomb flowers (Ratan Jot) and an intense aromatic matrix of fennel and ginger.",
    details: { cuisine: "Indian (Kashmiri)", prepTimeMinutes: 20, cookTimeMinutes: 120, baseServingSize: 4, spiceLevel: "Medium", season: ["winter"] },
    ingredients: [
      { amount: 2, unit: "lbs", name: "Lamb shoulder", notes: "Bone-in, cut into chunks." },
      { amount: 1, unit: "cup", name: "Yogurt", notes: "Whisked, room temperature." },
      { amount: 3, unit: "tbsp", name: "Kashmiri red chili powder", notes: "For vibrant color without extreme heat." },
      { amount: 2, unit: "tsp", name: "Fennel powder", notes: "Primary aromatic." },
      { amount: 1, unit: "tsp", name: "Ginger powder", notes: "Sun-dried ginger (Sonth)." },
      { amount: 1, unit: "pinch", name: "Asafoetida (Hing)", notes: "Essential for Kashmiri Pandit style." },
      { amount: 4, unit: "tbsp", name: "Mustard oil", notes: "Heated to smoking point to remove bitterness." }
    ],
    instructions: [
      "Step 1: The Oil Prep. Heat mustard oil in a heavy pot until it smokes. Turn off heat, let it cool slightly, then return to medium heat. This removes the harsh raw sulfur smell.",
      "Step 2: The Searing. Add whole spices (cardamom, cloves, bay leaf) and then the lamb chunks. Sear aggressively until deeply browned.",
      "Step 3: The Red Matrix. Whisk the chili powder, fennel, and ginger powder into the yogurt. Pour this mixture over the meat.",
      "Step 4: The Slow Braise. Reduce heat to low. Cover and cook for 1.5 to 2 hours. The meat must cook in its own juices and the yogurt moisture. Do not add water.",
      "Step 5: The Bloom. The dish is ready when the oil (the 'Rogan') separates and floats to the top, reflecting a deep, jewel-like red color. Serve with steamed basmati rice."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["braising", "searing"] },
    elementalProperties: { Fire: 0.35, Water: 0.20, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["aries", "scorpio"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 580, proteinG: 45, carbsG: 8, fatG: 42, fiberG: 2, sodiumMg: 850, sugarG: 4, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Potassium"] },
    substitutions: [{ originalIngredient: "Lamb shoulder", substituteOptions: ["Goat meat", "Beef chuck"] }]
  },
  {
    name: "Authentic Pav Bhaji",
    description: "The kinetic pulse of Mumbai street food. A thick, spicy vegetable mash (bhaji) is violently crushed on a flat iron griddle, incorporating massive amounts of butter, served with soft, ghee-toasted bread rolls (pav).",
    details: { cuisine: "Indian (Street)", prepTimeMinutes: 15, cookTimeMinutes: 25, baseServingSize: 4, spiceLevel: "High", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Mixed vegetables", notes: "Potatoes, cauliflower, peas, carrots - boiled." },
      { amount: 3, unit: "large", name: "Tomatoes", notes: "Finely chopped." },
      { amount: 1, unit: "large", name: "Green bell pepper", notes: "Finely diced." },
      { amount: 4, unit: "tbsp", name: "Pav Bhaji Masala", notes: "Concentrated spice blend." },
      { amount: 100, unit: "g", name: "Salted butter", notes: "Amul brand is traditional; used at every stage." },
      { amount: 8, unit: "whole", name: "Pav rolls", notes: "Soft white bread rolls." }
    ],
    instructions: [
      "Step 1: The Base Sauté. On a large flat griddle (tawa) or wide pan, sauté onions and bell peppers in a massive knob of butter.",
      "Step 2: The Red Acid. Add tomatoes and cook until they collapse into a pulp. Stir in the Pav Bhaji masala and salt.",
      "Step 3: The Mash. Add the boiled mixed vegetables. Using a flat potato masher, violently crush and mix the vegetables into the tomato-butter matrix directly on the griddle.",
      "Step 4: The Hydration. Add a splash of hot water if the mash is too dry. It should be thick but flowing. Add more butter. Let it sizzle and emulsify.",
      "Step 5: The Toast. Slice the pav rolls horizontally. Toast them on the same griddle with butter and a pinch of spice until golden. Serve the bubbling bhaji with raw onions, lime wedges, and extra butter."
    ],
    classifications: { mealType: ["lunch", "dinner", "snack"], cookingMethods: ["mashing", "griddling"] },
    elementalProperties: { Fire: 0.40, Water: 0.15, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Sun", "Mars"], signs: ["leo", "aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 480, proteinG: 12, carbsG: 65, fatG: 28, fiberG: 10, sodiumMg: 1100, sugarG: 12, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Potassium", "Iron"] },
    substitutions: [{ originalIngredient: "Butter", substituteOptions: ["Vegan butter (for vegan option)"] }]
  },
  {
    name: "Authentic Prawn Gassi",
    description: "A coastal masterpiece from Mangalore. Fresh prawns are submerged in a fiercely orange coconut curry, characterized by the sharp, fruity acidity of tamarind and the deep warmth of roasted Bydagi chilies.",
    details: { cuisine: "Indian (Mangalorean)", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "High", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Tiger prawns", notes: "Peeled and deveined." },
      { amount: 1, unit: "cup", name: "Fresh grated coconut", notes: "For the ground paste." },
      { amount: 6, unit: "whole", name: "Bydagi chilies", notes: "Roasted until dark and smoky." },
      { amount: 1, unit: "tbsp", name: "Coriander seeds", notes: "Roasted." },
      { amount: 1, unit: "tsp", name: "Tamarind paste", notes: "For acidity." },
      { amount: 1, unit: "sprig", name: "Curry leaves", notes: "For tempering." },
      { amount: 2, unit: "tbsp", name: "Coconut oil", notes: "For authentic aroma." }
    ],
    instructions: [
      "Step 1: The Gassi Paste. Grind the grated coconut, roasted chilies, coriander seeds, turmeric, and tamarind into an impossibly smooth, vibrant orange paste with a tiny splash of water.",
      "Step 2: The Sizzle. In a pan, heat coconut oil. Add mustard seeds and curry leaves. When they pop, add the coconut-chili paste.",
      "Step 3: The Simmer. Cook the paste for 5 minutes to remove the raw coconut smell. Add half a cup of water to create a thick, pourable curry.",
      "Step 4: The Poach. Add the fresh prawns to the bubbling curry. Cook for exactly 3-4 minutes. Do not overcook; the prawns must be snappy and tender.",
      "Step 5: The Finish. Serve hot with 'Kori Rotti' (crispy rice wafers) or steamed red rice."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["simmering", "grinding"] },
    elementalProperties: { Fire: 0.45, Water: 0.35, Earth: 0.15, Air: 0.05 },
    astrologicalAffinities: { planets: ["Neptune", "Moon"], signs: ["pisces", "cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 380, proteinG: 32, carbsG: 12, fatG: 24, fiberG: 4, sodiumMg: 950, sugarG: 2, vitamins: ["Vitamin B12", "Zinc"], minerals: ["Selenium", "Iron"] },
    substitutions: [{ originalIngredient: "Prawns", substituteOptions: ["Fish cubes", "Chicken (for Kori Gassi)"] }]
  },
  {
    name: "Authentic Aloo Paratha",
    description: "The heavy, structural breakfast of Punjab. A whole-wheat unleavened dough encapsulates a fiercely spiced potato mash, rolled out and griddled with ghee until the layers fuse and the exterior develops golden brown leopard spots.",
    details: { cuisine: "Indian (Punjabi)", prepTimeMinutes: 20, cookTimeMinutes: 10, baseServingSize: 2, spiceLevel: "Medium", season: ["winter", "all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Atta (Durum whole wheat flour)", notes: "For the dough." },
      { amount: 2, unit: "large", name: "Potatoes", notes: "Boiled and mashed smooth." },
      { amount: 1, unit: "tsp", name: "Amchur (Dried mango powder)", notes: "Essential for sourness." },
      { amount: 1, unit: "tsp", name: "Ajwain (Carom seeds)", notes: "For digestion and aroma." },
      { amount: 2, unit: "tbsp", name: "Fresh cilantro", notes: "Finely chopped." },
      { amount: 4, unit: "tbsp", name: "Ghee", notes: "For griddling." }
    ],
    instructions: [
      "Step 1: The Dough. Knead the atta with water and a pinch of salt until it is soft and elastic. Let it rest for 20 minutes.",
      "Step 2: The Stuffing. Mix the mashed potatoes with amchur, ajwain, chopped green chilies, cilantro, and salt. Ensure there are no lumps.",
      "Step 3: The Enclosure. Take a ball of dough, flatten it, and place a slightly smaller ball of potato stuffing in the center. Pleat the edges together to seal it completely.",
      "Step 4: The Roll. Gently roll out the stuffed ball into a flat disc. Be careful not to rupture the dough and leak the stuffing.",
      "Step 5: The Fire. Place on a hot tawa (griddle). Cook one side for 30 seconds, flip, and apply a teaspoon of ghee. Flip again and apply ghee. Press down with a spatula until both sides are crisp and golden brown. Serve with a massive dollop of white butter and mango pickle."
    ],
    classifications: { mealType: ["breakfast", "brunch"], cookingMethods: ["kneading", "griddling"] },
    elementalProperties: { Fire: 0.25, Water: 0.10, Earth: 0.55, Air: 0.10 },
    astrologicalAffinities: { planets: ["Saturn", "Jupiter"], signs: ["capricorn", "taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 450, proteinG: 10, carbsG: 62, fatG: 22, fiberG: 8, sodiumMg: 650, sugarG: 2, vitamins: ["Vitamin B6", "Niacin"], minerals: ["Magnesium", "Iron"] },
    substitutions: [{ originalIngredient: "Atta", substituteOptions: ["Standard whole wheat flour"] }]
  },
  {
    name: "Authentic Gulab Jamun",
    description: "The alchemical transformation of milk solids into crystalline luxury. 'Khoya' (reduced milk) is shaped into spheres, deep-fried to a dark mahogany brown, and then submerged in a hot cardamom-rose syrup until they swell into sponges of pure sweetness.",
    details: { cuisine: "Indian (Dessert)", prepTimeMinutes: 20, cookTimeMinutes: 30, baseServingSize: 6, spiceLevel: "None", season: ["celebration"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Khoya (Mawa)", notes: "Full-fat milk solids." },
      { amount: 2, unit: "tbsp", name: "Chenna (Fresh paneer)", notes: "Crumbled, for texture." },
      { amount: 0.25, unit: "cup", name: "All-purpose flour", notes: "For binding." },
      { amount: 2, unit: "cups", name: "Sugar", notes: "For the syrup." },
      { amount: 1, unit: "pinch", name: "Saffron and Cardamom", notes: "For the syrup." },
      { amount: 4, unit: "cups", name: "Ghee", notes: "For deep frying (traditionally preferred over oil)." }
    ],
    instructions: [
      "Step 1: The Syrup. Boil sugar and water with crushed cardamom and saffron until it reaches a 'half-thread' consistency (slightly sticky). Keep it warm.",
      "Step 2: The Dough. Rub the khoya and chenna together until perfectly smooth. Mix in the flour gently. Knead into a soft, crack-free dough. Do not overwork.",
      "Step 3: The Shape. Form the dough into small, perfectly smooth balls. Any crack will cause them to explode in the hot oil.",
      "Step 4: The Fry. Heat ghee over very low heat. Drop the balls in. They must sink and then slowly rise as the heat penetrates. Fry, constantly rotating the oil, until they are an even, dark golden-brown.",
      "Step 5: The Saturation. Immediately remove from the ghee and drop the hot balls into the warm syrup. Let them soak for at least 2 hours. They will double in size and become incredibly soft. Serve warm."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["deep-frying", "soaking"] },
    elementalProperties: { Fire: 0.15, Water: 0.40, Earth: 0.35, Air: 0.10 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["taurus", "cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 380, proteinG: 6, carbsG: 55, fatG: 24, fiberG: 0, sodiumMg: 120, sugarG: 48, vitamins: ["Riboflavin", "Vitamin B12"], minerals: ["Calcium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Khoya", substituteOptions: ["Milk powder mixed with cream (cheat version)"] }]
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
console.log("Successfully added 5 new recipes to indian.ts");
