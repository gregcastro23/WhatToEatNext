const { injectRecipes } = require('./injector.cjs');

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

injectRecipes('middle-eastern', 'lunch', middleEasternRecipes);
