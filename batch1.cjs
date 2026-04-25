const { injectRecipes } = require('./injector.cjs');

const africanRecipes = [
  {
    name: "Authentic South African Bunny Chow",
    description: "A uniquely South African street food consisting of a hollowed-out loaf of white bread filled with a heavily spiced, aromatic curry.",
    details: { cuisine: "South African", prepTimeMinutes: 20, cookTimeMinutes: 60, baseServingSize: 4, spiceLevel: "Medium-Hot", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "loaf", name: "unsliced white bread", notes: "Hollowed out" },
      { amount: 500, unit: "g", name: "lamb or mutton", notes: "Diced" },
      { amount: 2, unit: "tbsp", name: "curry powder", notes: "Durban masala preferred" },
      { amount: 1, unit: "large", name: "onion", notes: "Finely chopped" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tbsp", name: "ginger", notes: "Minced" },
      { amount: 2, unit: "medium", name: "potatoes", notes: "Cubed" },
      { amount: 1, unit: "cup", name: "tomatoes", notes: "Crushed" }
    ],
    instructions: [
      "Step 1: Sauté the onions in oil until soft, then add garlic and ginger.",
      "Step 2: Stir in the curry powder and toast for 1 minute.",
      "Step 3: Add the lamb and brown on all sides.",
      "Step 4: Pour in crushed tomatoes and simmer for 30 minutes.",
      "Step 5: Add potatoes and enough water to cover, simmering until tender.",
      "Step 6: Hollow out the loaf of bread and ladle the hot curry inside."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["simmering", "sautéing"] },
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Earth"], signs: ["Aries", "Taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 550, proteinG: 30, carbsG: 60, fatG: 22, fiberG: 5, sodiumMg: 600, sugarG: 5, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Iron", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 2.1, gregsEnergy: -0.5, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Moroccan Lamb Tagine",
    description: "A slow-cooked savory stew named after the traditional clay pot it is cooked in, featuring tender lamb, warm spices, and sweet dried fruits.",
    details: { cuisine: "North African (Morocco)", prepTimeMinutes: 25, cookTimeMinutes: 120, baseServingSize: 4, spiceLevel: "Mild", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 800, unit: "g", name: "lamb shoulder", notes: "Cut into chunks" },
      { amount: 2, unit: "large", name: "onions", notes: "Sliced" },
      { amount: 2, unit: "cloves", name: "garlic", notes: "Minced" },
      { amount: 1, unit: "tsp", name: "ginger", notes: "Ground" },
      { amount: 1, unit: "tsp", name: "cinnamon", notes: "Ground" },
      { amount: 0.5, unit: "tsp", name: "saffron", notes: "Threads" },
      { amount: 1, unit: "cup", name: "dried apricots or prunes", notes: "Pitted" },
      { amount: 0.5, unit: "cup", name: "almonds", notes: "Toasted" }
    ],
    instructions: [
      "Step 1: Toss lamb with ginger, cinnamon, and a pinch of saffron. Marinate for 1 hour.",
      "Step 2: Sauté onions and garlic in a tagine or heavy pot until translucent.",
      "Step 3: Add the lamb and sear until browned.",
      "Step 4: Add enough water to barely cover the meat. Cover and simmer on low for 1.5 hours.",
      "Step 5: Add the dried fruits and simmer for another 30 minutes until lamb is tender.",
      "Step 6: Garnish with toasted almonds and serve with couscous."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["slow-cooking", "braising"] },
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Venus"], signs: ["Sagittarius", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 600, proteinG: 45, carbsG: 30, fatG: 35, fiberG: 6, sodiumMg: 450, sugarG: 20, vitamins: ["Vitamin A", "Vitamin B6"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 4, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.35, reactivity: 1.8, gregsEnergy: -0.6, kalchm: 0.04, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Tanzanian Ugali and Sukuma Wiki",
    description: "The staple East African dish consisting of a dense maize flour porridge served with savory, garlicky collard greens.",
    details: { cuisine: "East African", prepTimeMinutes: 15, cookTimeMinutes: 30, baseServingSize: 4, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "white cornmeal (maize flour)", notes: "Finely ground" },
      { amount: 4, unit: "cups", name: "water", notes: "For boiling" },
      { amount: 1, unit: "bunch", name: "collard greens", notes: "Chopped" },
      { amount: 1, unit: "large", name: "onion", notes: "Diced" },
      { amount: 2, unit: "whole", name: "tomatoes", notes: "Diced" },
      { amount: 2, unit: "tbsp", name: "vegetable oil", notes: "For sautéing" }
    ],
    instructions: [
      "Step 1: Bring the water to a boil in a heavy pot.",
      "Step 2: Slowly pour in the cornmeal while stirring continuously to prevent lumps.",
      "Step 3: Continue to cook and stir vigorously until the mixture pulls away from the sides of the pot and forms a thick, dense mass. Set aside.",
      "Step 4: Heat oil in a pan, sauté onions until soft, then add tomatoes.",
      "Step 5: Add the chopped collard greens and cook until wilted and tender.",
      "Step 6: Serve the greens alongside a molded portion of the warm Ugali."
    ],
    classifications: { mealType: ["dinner", "lunch", "vegan"], cookingMethods: ["boiling", "sautéing"] },
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
    astrologicalAffinities: { planets: ["Saturn", "Moon"], signs: ["Capricorn", "Cancer"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 8, carbsG: 65, fatG: 8, fiberG: 8, sodiumMg: 150, sugarG: 4, vitamins: ["Vitamin K", "Vitamin C"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 2, Essence: 3, Matter: 8, Substance: 5 },
    thermodynamicProperties: { heat: 0.02, entropy: 0.2, reactivity: 1.2, gregsEnergy: -0.3, kalchm: 0.01, monica: 0.3 },
    substitutions: []
  },
  {
    name: "Authentic Malian Peanut Stew (Tigadèguèna)",
    description: "A profoundly rich, creamy West African stew powered by a ground peanut base, simmered with root vegetables and hearty proteins.",
    details: { cuisine: "West African", prepTimeMinutes: 20, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 500, unit: "g", name: "chicken or beef", notes: "Cut into pieces" },
      { amount: 0.75, unit: "cup", name: "unsweetened peanut butter", notes: "Smooth" },
      { amount: 2, unit: "tbsp", name: "tomato paste", notes: "For color and acidity" },
      { amount: 1, unit: "large", name: "onion", notes: "Chopped" },
      { amount: 2, unit: "cups", name: "sweet potatoes", notes: "Cubed" },
      { amount: 3, unit: "cups", name: "chicken broth", notes: "Base liquid" }
    ],
    instructions: [
      "Step 1: Sear the chicken or beef in a large pot until browned, then remove.",
      "Step 2: In the same pot, sauté the onion until translucent.",
      "Step 3: Stir in tomato paste and cook for 2 minutes.",
      "Step 4: Whisk the peanut butter with a cup of warm broth until smooth, then add to the pot along with remaining broth.",
      "Step 5: Return the meat and add the sweet potatoes.",
      "Step 6: Simmer on low for 30-40 minutes until the oil separates to the top and meat is tender."
    ],
    classifications: { mealType: ["dinner", "stew"], cookingMethods: ["simmering", "stewing"] },
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Earth", "Jupiter"], signs: ["Taurus", "Cancer"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 580, proteinG: 35, carbsG: 30, fatG: 38, fiberG: 6, sodiumMg: 450, sugarG: 8, vitamins: ["Vitamin A", "Vitamin E"], minerals: ["Magnesium", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.3, reactivity: 1.5, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Ghanaian Kelewele",
    description: "A beloved street food made from deep-fried, fiercely spiced ripe plantains, balancing intense sweetness with aggressive heat.",
    details: { cuisine: "West African", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Hot", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "whole", name: "ripe plantains", notes: "Skin should be mostly black, flesh sweet" },
      { amount: 1, unit: "tbsp", name: "fresh ginger", notes: "Grated" },
      { amount: 1, unit: "tsp", name: "cayenne pepper", notes: "Or minced habanero" },
      { amount: 0.5, unit: "tsp", name: "nutmeg", notes: "Ground" },
      { amount: 0.5, unit: "tsp", name: "salt", notes: "To taste" },
      { amount: 2, unit: "cups", name: "vegetable oil", notes: "For deep frying" }
    ],
    instructions: [
      "Step 1: Peel the plantains and cut them into bite-sized cubes.",
      "Step 2: In a blender or mortar, combine ginger, cayenne, nutmeg, salt, and a splash of water to form a paste.",
      "Step 3: Toss the plantain cubes in the spice paste until evenly coated.",
      "Step 4: Heat the oil in a deep pan to 350°F (175°C).",
      "Step 5: Fry the plantains in batches for 3-4 minutes until deeply caramelized and dark golden brown.",
      "Step 6: Drain on paper towels and serve immediately."
    ],
    classifications: { mealType: ["snack", "side", "street food", "vegan"], cookingMethods: ["deep-frying", "marinating"] },
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 320, proteinG: 2, carbsG: 60, fatG: 12, fiberG: 5, sodiumMg: 300, sugarG: 28, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Potassium", "Magnesium"] },
    alchemicalProperties: { Spirit: 5, Essence: 4, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.4, reactivity: 2.2, gregsEnergy: -0.5, kalchm: 0.05, monica: 0.7 },
    substitutions: []
  }
];

const americanRecipes = [
  {
    name: "Classic American Cheeseburger",
    description: "The quintessential American sandwich, featuring a smashed and seared beef patty, melted cheese, and fresh toppings on a toasted bun.",
    details: { cuisine: "American", prepTimeMinutes: 10, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["summer", "all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "ground beef (80/20)", notes: "Formed into 4 loose balls" },
      { amount: 4, unit: "slices", name: "American cheese", notes: "Essential for melting" },
      { amount: 4, unit: "whole", name: "hamburger buns", notes: "Brioche or potato, buttered and toasted" },
      { amount: 4, unit: "leaves", name: "iceberg lettuce", notes: "Crisp" },
      { amount: 1, unit: "whole", name: "tomato", notes: "Thickly sliced" },
      { amount: 0.25, unit: "cup", name: "mayonnaise", notes: "For spreading" },
      { amount: 1, unit: "tsp", name: "kosher salt", notes: "To taste" },
      { amount: 1, unit: "tsp", name: "black pepper", notes: "Freshly ground" }
    ],
    instructions: [
      "Step 1: Preheat a cast-iron skillet or griddle over high heat until smoking.",
      "Step 2: Place the beef balls onto the griddle and immediately smash them flat with a sturdy spatula.",
      "Step 3: Season generously with salt and pepper. Cook undisturbed for 2-3 minutes to form a dark crust.",
      "Step 4: Flip the patties, top each with a slice of American cheese, and cook for 1 more minute.",
      "Step 5: Toast the buns on the griddle until golden.",
      "Step 6: Assemble the burgers with mayonnaise, lettuce, tomato, and the hot patty."
    ],
    classifications: { mealType: ["lunch", "dinner", "bbq"], cookingMethods: ["grilling", "searing"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Sun", "Mars"], signs: ["Leo", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 550, proteinG: 32, carbsG: 28, fatG: 35, fiberG: 2, sodiumMg: 750, sugarG: 5, vitamins: ["Vitamin A", "Vitamin B12"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.4, reactivity: 1.8, gregsEnergy: -0.5, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Classic New England Clam Chowder",
    description: "A thick, creamy, historically rich maritime soup loaded with tender clams, salt pork or bacon, and potatoes.",
    details: { cuisine: "American (New England)", prepTimeMinutes: 20, cookTimeMinutes: 40, baseServingSize: 4, spiceLevel: "None", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 4, unit: "cups", name: "chopped clams", notes: "With their juice reserved" },
      { amount: 4, unit: "slices", name: "bacon", notes: "Diced" },
      { amount: 1, unit: "large", name: "onion", notes: "Finely diced" },
      { amount: 2, unit: "tbsp", name: "all-purpose flour", notes: "For thickening" },
      { amount: 2, unit: "cups", name: "potatoes", notes: "Peeled and cubed" },
      { amount: 2, unit: "cups", name: "heavy cream", notes: "Provides the rich base" },
      { amount: 1, unit: "cup", name: "milk", notes: "To thin out if necessary" },
      { amount: 1, unit: "tsp", name: "black pepper", notes: "Freshly ground" }
    ],
    instructions: [
      "Step 1: In a large heavy pot, fry the diced bacon until crisp. Remove bacon but leave the fat.",
      "Step 2: Sauté the onions in the bacon fat until soft and translucent.",
      "Step 3: Whisk in the flour to create a blonde roux, cooking for 2 minutes.",
      "Step 4: Gradually whisk in the reserved clam juice to avoid lumps.",
      "Step 5: Add the potatoes and simmer for 15-20 minutes until tender.",
      "Step 6: Stir in the clams, heavy cream, milk, and black pepper. Heat gently but do not let it boil. Serve with oyster crackers."
    ],
    classifications: { mealType: ["dinner", "lunch", "soup"], cookingMethods: ["simmering", "sautéing"] },
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Moon", "Neptune"], signs: ["Cancer", "Pisces"], lunarPhases: ["Waxing Gibbous"] },
    nutritionPerServing: { calories: 480, proteinG: 22, carbsG: 30, fatG: 32, fiberG: 3, sodiumMg: 600, sugarG: 6, vitamins: ["Vitamin C", "Vitamin B12"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 3, Essence: 6, Matter: 5, Substance: 6 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.2, reactivity: 1.1, gregsEnergy: -0.3, kalchm: 0.01, monica: 0.2 },
    substitutions: []
  },
  {
    name: "Southern Biscuits and Sausage Gravy",
    description: "The pinnacle of Appalachian comfort food. Flaky, buttery buttermilk biscuits drenched in a thick, peppery pork sausage gravy.",
    details: { cuisine: "American (Southern)", prepTimeMinutes: 20, cookTimeMinutes: 25, baseServingSize: 4, spiceLevel: "Mild", season: ["winter", "all"] },
    ingredients: [
      { amount: 4, unit: "whole", name: "buttermilk biscuits", notes: "Freshly baked" },
      { amount: 400, unit: "g", name: "bulk pork breakfast sausage", notes: "Mild or sage flavored" },
      { amount: 0.25, unit: "cup", name: "all-purpose flour", notes: "For the gravy" },
      { amount: 3, unit: "cups", name: "whole milk", notes: "Cold" },
      { amount: 1, unit: "tsp", name: "black pepper", notes: "Heavily applied" },
      { amount: 0.5, unit: "tsp", name: "salt", notes: "To taste" }
    ],
    instructions: [
      "Step 1: Crumble the pork sausage into a large cast-iron skillet over medium-high heat.",
      "Step 2: Cook until thoroughly browned, leaving the rendered fat in the pan.",
      "Step 3: Sprinkle the flour evenly over the sausage and fat. Stir and cook for 2 minutes to eliminate raw flour taste.",
      "Step 4: Slowly whisk in the cold milk, stirring constantly to prevent lumps.",
      "Step 5: Bring the mixture to a simmer, allowing it to thicken into a rich gravy (about 5-8 minutes).",
      "Step 6: Season heavily with black pepper and salt. Serve immediately over split open biscuits."
    ],
    classifications: { mealType: ["breakfast", "brunch"], cookingMethods: ["simmering", "frying"] },
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Earth", "Venus"], signs: ["Taurus", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 20, carbsG: 45, fatG: 42, fiberG: 2, sodiumMg: 1100, sugarG: 10, vitamins: ["Vitamin D", "Calcium"], minerals: ["Iron", "Phosphorus"] },
    alchemicalProperties: { Spirit: 2, Essence: 5, Matter: 8, Substance: 7 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.3, gregsEnergy: -0.5, kalchm: 0.02, monica: 0.3 },
    substitutions: []
  },
  {
    name: "Classic Philadelphia Cheesesteak",
    description: "An iconic urban sandwich featuring paper-thin sliced ribeye steak, caramelized onions, and melted cheese on a long hoagie roll.",
    details: { cuisine: "American", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "ribeye steak", notes: "Thinly shaved" },
      { amount: 1, unit: "large", name: "onion", notes: "Thinly sliced" },
      { amount: 4, unit: "whole", name: "hoagie rolls", notes: "Split" },
      { amount: 8, unit: "slices", name: "provolone cheese", notes: "Or Cheez Whiz" },
      { amount: 2, unit: "tbsp", name: "vegetable oil", notes: "For the griddle" },
      { amount: 1, unit: "tsp", name: "salt", notes: "To taste" },
      { amount: 1, unit: "tsp", name: "black pepper", notes: "To taste" }
    ],
    instructions: [
      "Step 1: Heat oil on a flat-top griddle or large skillet over medium-high heat.",
      "Step 2: Add onions and cook until deeply caramelized and sweet.",
      "Step 3: Push onions aside and add the shaved ribeye, chopping it with spatulas as it cooks.",
      "Step 4: Season with salt and pepper, then mix the caramelized onions into the cooked meat.",
      "Step 5: Divide the meat mixture into 4 portions on the griddle. Lay 2 slices of provolone over each portion to melt.",
      "Step 6: Place a split hoagie roll upside down over the melted cheese and meat. Use a spatula to scoop the entire assembly, flipping it over."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["griddling", "searing"] },
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Taurus"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 720, proteinG: 45, carbsG: 45, fatG: 38, fiberG: 3, sodiumMg: 950, sugarG: 5, vitamins: ["Vitamin B12", "Niacin"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.35, reactivity: 1.7, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Classic American Apple Pie",
    description: "A profound symbol of American baking tradition. A flaky, buttery double crust enveloping tart, cinnamon-spiced apples baked until bubbling and syrupy.",
    details: { cuisine: "American", prepTimeMinutes: 45, cookTimeMinutes: 60, baseServingSize: 8, spiceLevel: "None", season: ["autumn", "all"] },
    ingredients: [
      { amount: 2, unit: "crusts", name: "pie dough", notes: "For top and bottom" },
      { amount: 6, unit: "cups", name: "Granny Smith apples", notes: "Peeled, cored, and sliced" },
      { amount: 0.75, unit: "cup", name: "granulated sugar", notes: "For sweetness" },
      { amount: 1, unit: "tsp", name: "cinnamon", notes: "Ground" },
      { amount: 0.25, unit: "tsp", name: "nutmeg", notes: "Ground" },
      { amount: 2, unit: "tbsp", name: "all-purpose flour", notes: "To thicken the juices" },
      { amount: 1, unit: "tbsp", name: "lemon juice", notes: "To brighten flavors" },
      { amount: 1, unit: "tbsp", name: "butter", notes: "Dotted over filling" }
    ],
    instructions: [
      "Step 1: Preheat oven to 425°F (220°C).",
      "Step 2: In a large bowl, toss the sliced apples with sugar, cinnamon, nutmeg, flour, and lemon juice until well coated.",
      "Step 3: Roll out the bottom pie crust and place it into a 9-inch pie dish.",
      "Step 4: Pour the apple filling into the crust, mounding it slightly in the center. Dot the top with small pieces of butter.",
      "Step 5: Cover with the top pie crust. Crimp the edges to seal and cut slits in the top to vent steam.",
      "Step 6: Bake for 45-60 minutes until the crust is golden brown and the filling is visibly bubbling."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["baking"] },
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2 },
    astrologicalAffinities: { planets: ["Venus", "Sun"], signs: ["Libra", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 380, proteinG: 3, carbsG: 55, fatG: 18, fiberG: 4, sodiumMg: 220, sugarG: 30, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Calcium", "Potassium"] },
    alchemicalProperties: { Spirit: 5, Essence: 6, Matter: 4, Substance: 4 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.4, gregsEnergy: -0.3, kalchm: 0.01, monica: 0.5 },
    substitutions: []
  }
];

injectRecipes('african', 'dinner', africanRecipes);
injectRecipes('american', 'dinner', americanRecipes);
