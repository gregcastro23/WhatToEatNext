const { injectRecipes } = require('./injector.cjs');

const russianRecipes = [
  {
    name: "Authentic Borscht",
    description: "The iconic, deeply crimson Eastern European soup. A complex, sweet-and-sour broth built on beef stock, earthy beets, cabbage, and finished with a dollop of sour cream (smetana).",
    details: { cuisine: "Russian", prepTimeMinutes: 30, cookTimeMinutes: 120, baseServingSize: 6, spiceLevel: "None", season: ["winter"] },
    ingredients: [
      { amount: 500, unit: "g", name: "beef chuck or short rib", notes: "For the broth" },
      { amount: 3, unit: "medium", name: "beets", notes: "Peeled and julienned" },
      { amount: 2, unit: "cups", name: "green cabbage", notes: "Finely shredded" },
      { amount: 2, unit: "medium", name: "potatoes", notes: "Cubed" },
      { amount: 1, unit: "large", name: "carrot", notes: "Grated" },
      { amount: 1, unit: "large", name: "onion", notes: "Finely chopped" },
      { amount: 2, unit: "tbsp", name: "tomato paste", notes: "For depth" },
      { amount: 2, unit: "tbsp", name: "white vinegar", notes: "Crucial for sourness and keeping beets red" },
      { amount: 0.5, unit: "cup", name: "sour cream (smetana)", notes: "For serving" }
    ],
    instructions: [
      "Step 1: Simmer the beef in 8 cups of water for 1.5 hours. Remove beef, chop it, and return to the strained broth.",
      "Step 2: Sauté the beets, carrots, and onions in oil until soft.",
      "Step 3: Add tomato paste and vinegar to the vegetables, cooking for 2 minutes to concentrate the color.",
      "Step 4: Add the cabbage and potatoes to the simmering beef broth. Cook for 15 minutes.",
      "Step 5: Stir the beet mixture into the soup. Simmer for another 10 minutes (do not over-boil or the red color turns brown).",
      "Step 6: Stir in fresh dill and garlic off the heat. Serve hot with a heavy dollop of sour cream."
    ],
    classifications: { mealType: ["dinner", "soup"], cookingMethods: ["simmering", "sautéing"] },
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    astrologicalAffinities: { planets: ["Pluto", "Moon"], signs: ["Scorpio", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 350, proteinG: 22, carbsG: 25, fatG: 18, fiberG: 6, sodiumMg: 650, sugarG: 12, vitamins: ["Vitamin C", "Folate"], minerals: ["Iron", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 5, Substance: 5 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.3, reactivity: 1.4, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Beef Stroganoff",
    description: "A 19th-century Russian aristocrat classic. Quickly sautéed strips of tender beef folded into a rich, slightly tangy sour cream and mustard sauce.",
    details: { cuisine: "Russian", prepTimeMinutes: 15, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["winter", "all"] },
    ingredients: [
      { amount: 600, unit: "g", name: "beef tenderloin or sirloin", notes: "Cut into thin strips against the grain" },
      { amount: 1, unit: "large", name: "onion", notes: "Thinly sliced" },
      { amount: 300, unit: "g", name: "mushrooms", notes: "Sliced" },
      { amount: 2, unit: "tbsp", name: "butter", notes: "For sautéing" },
      { amount: 1, unit: "cup", name: "sour cream (smetana)", notes: "Full fat, room temperature" },
      { amount: 1, unit: "tbsp", name: "Dijon mustard", notes: "For a slight tang" },
      { amount: 1, unit: "cup", name: "beef broth", notes: "High quality" },
      { amount: 1, unit: "tbsp", name: "flour", notes: "For thickening" }
    ],
    instructions: [
      "Step 1: Season the beef strips. Quickly sear them in hot butter in batches so they brown but remain rare inside. Remove from pan.",
      "Step 2: In the same pan, sauté the onions and mushrooms until deeply browned.",
      "Step 3: Sprinkle flour over the vegetables and stir for 1 minute.",
      "Step 4: Gradually whisk in the beef broth, scraping the fond from the bottom. Simmer until thickened (5 mins).",
      "Step 5: Turn off the heat entirely. Whisk in the sour cream and mustard.",
      "Step 6: Return the beef and its juices to the sauce to gently warm through. Serve immediately over egg noodles or mashed potatoes."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["sautéing", "whisking"] },
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Jupiter"], signs: ["Taurus", "Sagittarius"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 550, proteinG: 40, carbsG: 12, fatG: 38, fiberG: 2, sodiumMg: 500, sugarG: 4, vitamins: ["Vitamin B12", "Riboflavin"], minerals: ["Zinc", "Iron"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.5, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Pelmeni",
    description: "Siberian comfort food. Tiny, ear-shaped dumplings filled with a savory mixture of minced meat and heavy black pepper, boiled and served swimming in butter or sour cream.",
    details: { cuisine: "Russian", prepTimeMinutes: 60, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["winter"] },
    ingredients: [
      { amount: 3, unit: "cups", name: "all-purpose flour", notes: "For dough" },
      { amount: 1, unit: "whole", name: "egg", notes: "For dough" },
      { amount: 0.75, unit: "cup", name: "water", notes: "For dough" },
      { amount: 250, unit: "g", name: "ground beef", notes: "Mixed meat is traditional" },
      { amount: 250, unit: "g", name: "ground pork", notes: "Adds fat and flavor" },
      { amount: 1, unit: "large", name: "onion", notes: "Very finely minced or grated" },
      { amount: 2, unit: "tsp", name: "black pepper", notes: "Freshly ground, generously" },
      { amount: 0.5, unit: "cup", name: "sour cream (smetana)", notes: "For serving" }
    ],
    instructions: [
      "Step 1: Knead the flour, egg, water, and a pinch of salt into a stiff dough. Rest for 30 minutes.",
      "Step 2: Mix the ground beef, ground pork, grated onion, salt, and heavy black pepper vigorously. Add a splash of ice water to make the filling juicy.",
      "Step 3: Roll the dough out thinly and cut out 2-inch circles.",
      "Step 4: Place a small marble of meat in the center of each circle. Fold into a half-moon and pinch the edges tightly.",
      "Step 5: Bring the two corners of the half-moon together to form the traditional 'ear' shape.",
      "Step 6: Boil in heavily salted water or broth for 5-7 minutes. Drain and toss immediately with copious amounts of butter and dill."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["boiling", "folding"] },
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Saturn", "Moon"], signs: ["Capricorn", "Cancer"], lunarPhases: ["Waning Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 32, carbsG: 65, fatG: 28, fiberG: 3, sodiumMg: 700, sugarG: 2, vitamins: ["B Vitamins"], minerals: ["Iron", "Selenium"] },
    alchemicalProperties: { Spirit: 3, Essence: 4, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.2, reactivity: 1.2, gregsEnergy: -0.4, kalchm: 0.01, monica: 0.3 },
    substitutions: []
  },
  {
    name: "Authentic Blini",
    description: "Paper-thin, yeast-leavened Russian pancakes with a distinct tang, traditionally served in stacks and rolled around smoked salmon, caviar, or jam.",
    details: { cuisine: "Russian", prepTimeMinutes: 60, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["spring", "all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "milk", notes: "Warm" },
      { amount: 1, unit: "tsp", name: "active dry yeast", notes: "For the authentic tang and bubbles" },
      { amount: 2, unit: "cups", name: "all-purpose flour", notes: "Or half buckwheat flour" },
      { amount: 2, unit: "large", name: "eggs", notes: "Separated" },
      { amount: 2, unit: "tbsp", name: "sugar", notes: "For slight sweetness" },
      { amount: 2, unit: "tbsp", name: "melted butter", notes: "Plus more for greasing" },
      { amount: 200, unit: "g", name: "smoked salmon or caviar", notes: "For serving" }
    ],
    instructions: [
      "Step 1: Dissolve yeast and sugar in the warm milk. Whisk in the flour and egg yolks. Cover and let rise in a warm place for 1 hour until bubbly.",
      "Step 2: Stir the melted butter and salt into the risen batter.",
      "Step 3: Whip the egg whites until stiff peaks form.",
      "Step 4: Gently fold the whipped egg whites into the batter to keep it light and airy.",
      "Step 5: Heat a buttered crepe pan or skillet. Pour a thin layer of batter, tilting the pan to spread it evenly.",
      "Step 6: Cook for 1 minute until bubbles form, flip, and cook 30 seconds. Serve warm, smeared with sour cream and topped with smoked salmon."
    ],
    classifications: { mealType: ["breakfast", "appetizer", "celebration"], cookingMethods: ["frying", "fermenting"] },
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 },
    astrologicalAffinities: { planets: ["Uranus", "Moon"], signs: ["Aquarius", "Cancer"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 380, proteinG: 18, carbsG: 45, fatG: 15, fiberG: 2, sodiumMg: 500, sugarG: 8, vitamins: ["Vitamin D", "B12"], minerals: ["Calcium", "Phosphorus"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.35, reactivity: 1.5, gregsEnergy: -0.2, kalchm: 0.03, monica: 0.5 },
    substitutions: []
  },
  {
    name: "Authentic Olivier Salad",
    description: "The classic Russian New Year's Eve salad. A dense, creamy, meticulously cubed mixture of potatoes, carrots, pickles, boiled eggs, and bologna, bound in mayonnaise.",
    details: { cuisine: "Russian", prepTimeMinutes: 30, cookTimeMinutes: 20, baseServingSize: 6, spiceLevel: "None", season: ["winter", "celebration"] },
    ingredients: [
      { amount: 4, unit: "medium", name: "potatoes", notes: "Boiled in jackets, then peeled and cubed" },
      { amount: 2, unit: "medium", name: "carrots", notes: "Boiled and cubed" },
      { amount: 4, unit: "whole", name: "hard-boiled eggs", notes: "Cubed" },
      { amount: 300, unit: "g", name: "Doktorskaya kolbasa (bologna) or boiled chicken", notes: "Cubed" },
      { amount: 4, unit: "whole", name: "dill pickles", notes: "Cubed" },
      { amount: 1, unit: "cup", name: "canned sweet peas", notes: "Drained" },
      { amount: 1, unit: "cup", name: "mayonnaise", notes: "High quality, for binding" },
      { amount: 1, unit: "bunch", name: "fresh dill", notes: "Finely chopped" }
    ],
    instructions: [
      "Step 1: Boil the potatoes and carrots whole until knife-tender. Cool completely before peeling to maintain shape.",
      "Step 2: Dice the potatoes, carrots, eggs, bologna, and pickles into perfectly uniform, small 1/4-inch cubes.",
      "Step 3: Place all the diced ingredients into a large mixing bowl.",
      "Step 4: Add the drained sweet peas and chopped dill.",
      "Step 5: Add the mayonnaise and fold gently but thoroughly until every cube is coated.",
      "Step 6: Cover and refrigerate for at least 2 hours to let the flavors meld before serving."
    ],
    classifications: { mealType: ["appetizer", "side", "celebration"], cookingMethods: ["boiling", "mixing"] },
    elementalProperties: { Fire: 0.0, Water: 0.4, Earth: 0.5, Air: 0.1 },
    astrologicalAffinities: { planets: ["Saturn", "Moon"], signs: ["Capricorn", "Cancer"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 420, proteinG: 12, carbsG: 25, fatG: 32, fiberG: 4, sodiumMg: 750, sugarG: 5, vitamins: ["Vitamin A", "Vitamin K"], minerals: ["Potassium", "Iron"] },
    alchemicalProperties: { Spirit: 2, Essence: 4, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.01, entropy: 0.2, reactivity: 1.1, gregsEnergy: -0.4, kalchm: 0.01, monica: 0.2 },
    substitutions: []
  }
];

const thaiRecipes = [
  {
    name: "Authentic Pad Thai",
    description: "The global ambassador of Thai cuisine. Rice noodles aggressively stir-fried with eggs, tofu, and shrimp, coated in a complex sweet, sour, and salty tamarind sauce.",
    details: { cuisine: "Thai", prepTimeMinutes: 20, cookTimeMinutes: 10, baseServingSize: 2, spiceLevel: "Mild-Medium", season: ["all"] },
    ingredients: [
      { amount: 200, unit: "g", name: "dried rice stick noodles", notes: "Soaked in warm water until pliable" },
      { amount: 3, unit: "tbsp", name: "tamarind paste", notes: "The crucial sour element" },
      { amount: 3, unit: "tbsp", name: "palm sugar", notes: "For sweetness" },
      { amount: 2, unit: "tbsp", name: "fish sauce", notes: "For saltiness and umami" },
      { amount: 100, unit: "g", name: "firm tofu", notes: "Cut into matchsticks" },
      { amount: 2, unit: "large", name: "eggs", notes: "Lightly beaten" },
      { amount: 1, unit: "tbsp", name: "dried shrimp", notes: "Finely chopped" },
      { amount: 2, unit: "cups", name: "bean sprouts", notes: "Fresh" },
      { amount: 0.5, unit: "cup", name: "roasted peanuts", notes: "Crushed" }
    ],
    instructions: [
      "Step 1: Make the sauce: Simmer the tamarind paste, palm sugar, and fish sauce until the sugar dissolves and it becomes a syrupy glaze.",
      "Step 2: Heat a wok over extreme heat. Fry the tofu and dried shrimp until golden.",
      "Step 3: Push tofu aside and scramble the eggs in the wok until barely set.",
      "Step 4: Add the soaked, drained noodles and a splash of water. Stir-fry vigorously until noodles soften.",
      "Step 5: Pour the tamarind sauce over the noodles, tossing rapidly until the noodles absorb the sauce and dry out slightly.",
      "Step 6: Toss in half the bean sprouts, garlic chives, and peanuts. Serve immediately with a lime wedge and chili flakes."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["stir-frying"] },
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    astrologicalAffinities: { planets: ["Mercury", "Venus"], signs: ["Gemini", "Libra"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 550, proteinG: 22, carbsG: 65, fatG: 24, fiberG: 4, sodiumMg: 950, sugarG: 18, vitamins: ["Vitamin C", "Folate"], minerals: ["Calcium", "Iron"] },
    alchemicalProperties: { Spirit: 4, Essence: 6, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.4, reactivity: 2.1, gregsEnergy: -0.4, kalchm: 0.03, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Tom Yum Goong",
    description: "A vividly fragrant, explosively sour and spicy shrimp soup powered by a holy trinity of Thai aromatics: lemongrass, galangal, and makrut lime leaves.",
    details: { cuisine: "Thai", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Hot", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "cups", name: "shrimp or chicken stock", notes: "High quality" },
      { amount: 2, unit: "stalks", name: "lemongrass", notes: "Bruised and cut into chunks" },
      { amount: 1, unit: "inch", name: "galangal", notes: "Sliced into coins" },
      { amount: 5, unit: "whole", name: "makrut lime leaves", notes: "Torn" },
      { amount: 5, unit: "whole", name: "bird's eye chilies", notes: "Bruised" },
      { amount: 3, unit: "tbsp", name: "nam prik pao (Thai chili jam)", notes: "For depth and color" },
      { amount: 3, unit: "tbsp", name: "fish sauce", notes: "For seasoning" },
      { amount: 0.25, unit: "cup", name: "lime juice", notes: "Added off heat" },
      { amount: 400, unit: "g", name: "large shrimp", notes: "Peeled and deveined, tails on" }
    ],
    instructions: [
      "Step 1: Bring the stock to a boil. Add the bruised lemongrass, sliced galangal, and torn lime leaves. Simmer for 5 minutes to infuse the aromatics.",
      "Step 2: Stir in the nam prik pao (chili jam), bruised chilies, and fish sauce.",
      "Step 3: Add the mushrooms and boil for 2 minutes.",
      "Step 4: Add the shrimp. Cook just until they turn pink and curl (about 2 minutes). Turn off the heat immediately.",
      "Step 5: Stir in the fresh lime juice (boiling lime juice ruins its brightness).",
      "Step 6: Taste and adjust the balance—it should be sharply sour, salty, and spicy. Garnish with cilantro."
    ],
    classifications: { mealType: ["soup", "dinner"], cookingMethods: ["simmering", "infusing"] },
    elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.0, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Neptune"], signs: ["Aries", "Pisces"], lunarPhases: ["Waxing Crescent"] },
    nutritionPerServing: { calories: 220, proteinG: 28, carbsG: 12, fatG: 6, fiberG: 2, sodiumMg: 1100, sugarG: 5, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Selenium", "Zinc"] },
    alchemicalProperties: { Spirit: 6, Essence: 7, Matter: 3, Substance: 3 },
    thermodynamicProperties: { heat: 0.09, entropy: 0.45, reactivity: 2.5, gregsEnergy: -0.6, kalchm: 0.06, monica: 0.8 },
    substitutions: []
  },
  {
    name: "Authentic Green Curry (Gaeng Keow Wan)",
    description: "A brilliantly herbaceous, sweet, and spicy curry whose vibrant color comes from pounding fresh green chilies, cilantro roots, and makrut lime leaves into a fiery paste.",
    details: { cuisine: "Thai", prepTimeMinutes: 30, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "Hot", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "tbsp", name: "green curry paste", notes: "Freshly pounded or high quality store-bought" },
      { amount: 1, unit: "can (14oz)", name: "coconut milk", notes: "Do not shake; you want the thick cream on top" },
      { amount: 500, unit: "g", name: "chicken thigh", notes: "Cut into bite-sized pieces" },
      { amount: 1, unit: "cup", name: "Thai eggplants", notes: "Quartered" },
      { amount: 4, unit: "whole", name: "makrut lime leaves", notes: "Torn" },
      { amount: 2, unit: "tbsp", name: "fish sauce", notes: "To taste" },
      { amount: 1, unit: "tbsp", name: "palm sugar", notes: "To balance heat" },
      { amount: 1, unit: "cup", name: "Thai basil", notes: "Fresh leaves" }
    ],
    instructions: [
      "Step 1: Scoop out the thick coconut cream from the top of the can into a wok or pan over medium-high heat.",
      "Step 2: 'Crack' the cream by cooking it until the oil separates and glistens.",
      "Step 3: Fry the green curry paste in the separated coconut oil for 3 minutes until intensely fragrant.",
      "Step 4: Add the chicken and sauté until it turns white on the outside.",
      "Step 5: Pour in the remaining thinner coconut milk, fish sauce, palm sugar, torn lime leaves, and eggplants.",
      "Step 6: Simmer for 10 minutes until chicken is cooked. Turn off heat, stir in Thai basil, and serve with jasmine rice."
    ],
    classifications: { mealType: ["dinner"], cookingMethods: ["frying", "simmering"] },
    elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Venus", "Mars"], signs: ["Taurus", "Aries"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 520, proteinG: 32, carbsG: 18, fatG: 38, fiberG: 5, sodiumMg: 850, sugarG: 8, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Potassium", "Iron"] },
    alchemicalProperties: { Spirit: 5, Essence: 6, Matter: 5, Substance: 4 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.35, reactivity: 1.8, gregsEnergy: -0.5, kalchm: 0.04, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Som Tum (Green Papaya Salad)",
    description: "A brutally sharp, fresh, and funky Isaan salad created by aggressively pounding shredded unripe papaya in a clay mortar with chilies, lime, garlic, and dried shrimp.",
    details: { cuisine: "Thai", prepTimeMinutes: 20, cookTimeMinutes: 0, baseServingSize: 2, spiceLevel: "Very Hot", season: ["summer", "all"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "green papaya", notes: "Shredded or julienned; must be unripe and crunchy" },
      { amount: 3, unit: "cloves", name: "garlic", notes: "Peeled" },
      { amount: 3, unit: "whole", name: "bird's eye chilies", notes: "Or more, depending on heat tolerance" },
      { amount: 2, unit: "tbsp", name: "dried shrimp", notes: "Rinsed" },
      { amount: 2, unit: "tbsp", name: "roasted peanuts", notes: "Plus more for garnish" },
      { amount: 1, unit: "cup", name: "cherry tomatoes", notes: "Halved" },
      { amount: 3, unit: "tbsp", name: "lime juice", notes: "Freshly squeezed" },
      { amount: 2, unit: "tbsp", name: "fish sauce", notes: "Essential" },
      { amount: 1.5, unit: "tbsp", name: "palm sugar", notes: "Melted or pounded to dissolve" }
    ],
    instructions: [
      "Step 1: In a large clay mortar (pok pok), aggressively pound the garlic and chilies with a wooden pestle until crushed into a rough paste.",
      "Step 2: Add the dried shrimp and roasted peanuts. Pound gently to break them up without turning them to powder.",
      "Step 3: Add the palm sugar, fish sauce, and lime juice. Use the pestle to dissolve the sugar and mix the dressing.",
      "Step 4: Add the cherry tomatoes and green beans, bruising them lightly with the pestle to release their juices.",
      "Step 5: Add the shredded green papaya.",
      "Step 6: Use a spoon in one hand to turn the salad while using the pestle in the other to lightly pound and bruise the papaya so it absorbs the dressing. Serve immediately."
    ],
    classifications: { mealType: ["salad", "appetizer"], cookingMethods: ["pounding", "bruising"] },
    elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Mercury"], signs: ["Aries", "Gemini"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 210, proteinG: 8, carbsG: 28, fatG: 10, fiberG: 4, sodiumMg: 900, sugarG: 15, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Potassium", "Magnesium"] },
    alchemicalProperties: { Spirit: 6, Essence: 5, Matter: 3, Substance: 3 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.4, reactivity: 2.2, gregsEnergy: -0.3, kalchm: 0.05, monica: 0.7 },
    substitutions: []
  },
  {
    name: "Authentic Massaman Curry",
    description: "A rich, relatively mild Southern Thai curry with heavy Indian and Persian influences, loaded with toasted dry spices (cardamom, cinnamon), potatoes, and peanuts.",
    details: { cuisine: "Thai", prepTimeMinutes: 20, cookTimeMinutes: 60, baseServingSize: 4, spiceLevel: "Mild", season: ["winter"] },
    ingredients: [
      { amount: 4, unit: "tbsp", name: "Massaman curry paste", notes: "Heavy on dried spices" },
      { amount: 1, unit: "can (14oz)", name: "coconut milk", notes: "Do not shake" },
      { amount: 500, unit: "g", name: "beef chuck or chicken thighs", notes: "Cut into chunks" },
      { amount: 2, unit: "medium", name: "potatoes", notes: "Peeled and cut into large chunks" },
      { amount: 1, unit: "large", name: "onion", notes: "Cut into wedges" },
      { amount: 0.5, unit: "cup", name: "roasted peanuts", notes: "Whole" },
      { amount: 3, unit: "tbsp", name: "tamarind paste", notes: "For tartness" },
      { amount: 2, unit: "tbsp", name: "palm sugar", notes: "For sweetness" },
      { amount: 2, unit: "tbsp", name: "fish sauce", notes: "To taste" }
    ],
    instructions: [
      "Step 1: If using beef, simmer the chunks in thinned coconut milk or water for 45 minutes until tender before starting.",
      "Step 2: Scoop the thick coconut cream from the can into a heavy pot. Heat until the oil separates.",
      "Step 3: Fry the Massaman curry paste in the coconut oil until deeply fragrant (3-4 minutes).",
      "Step 4: Add the meat (and its cooking liquid if using beef), potatoes, onions, and peanuts.",
      "Step 5: Pour in remaining coconut milk. Season with tamarind, palm sugar, and fish sauce.",
      "Step 6: Simmer gently for 20-30 minutes until potatoes are tender and the oil floats to the top in a rich red slick."
    ],
    classifications: { mealType: ["dinner", "stew"], cookingMethods: ["braising", "simmering"] },
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    astrologicalAffinities: { planets: ["Jupiter", "Earth"], signs: ["Sagittarius", "Taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 680, proteinG: 35, carbsG: 32, fatG: 48, fiberG: 6, sodiumMg: 750, sugarG: 12, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Potassium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 7, Substance: 6 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.3, reactivity: 1.5, gregsEnergy: -0.5, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  }
];

const vietnameseRecipes = [
  {
    name: "Authentic Pho Bo (Beef Noodle Soup)",
    description: "The definitive Vietnamese soup. A painstakingly clear, deeply aromatic beef bone broth steeped with charred ginger, onion, and toasted star anise, ladled boiling hot over rice noodles and raw beef.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 30, cookTimeMinutes: 360, baseServingSize: 6, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "kg", name: "beef bones (knuckle and marrow)", notes: "Parboiled and cleaned" },
      { amount: 1, unit: "large", name: "onion", notes: "Halved, charred black" },
      { amount: 4, unit: "inches", name: "ginger", notes: "Halved, charred black" },
      { amount: 5, unit: "whole", name: "star anise", notes: "Dry toasted" },
      { amount: 1, unit: "stick", name: "cinnamon", notes: "Dry toasted" },
      { amount: 3, unit: "tbsp", name: "fish sauce", notes: "High quality" },
      { amount: 1, unit: "chunk", name: "yellow rock sugar", notes: "For subtle sweetness" },
      { amount: 400, unit: "g", name: "flat rice noodles (banh pho)", notes: "Soaked and blanched" },
      { amount: 300, unit: "g", name: "beef sirloin", notes: "Sliced paper-thin, raw" }
    ],
    instructions: [
      "Step 1: Parboil the beef bones vigorously for 10 minutes. Dump the water, wash the bones spotlessly clean.",
      "Step 2: Char the onion halves and ginger over an open flame until completely blackened. Toast the spices in a dry pan.",
      "Step 3: Place bones, charred aromatics, toasted spices, rock sugar, and salt in a large pot with 5 liters of water.",
      "Step 4: Simmer extremely gently (do not boil) for 6-8 hours, skimming constantly to maintain absolute broth clarity.",
      "Step 5: Strain the broth, discarding solids. Season aggressively with fish sauce.",
      "Step 6: Place hot noodles in a bowl, drape raw beef slices over top, and ladle the boiling broth directly onto the beef to cook it instantly. Garnish with basil and lime."
    ],
    classifications: { mealType: ["soup", "dinner", "breakfast"], cookingMethods: ["simmering", "charring"] },
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    astrologicalAffinities: { planets: ["Neptune", "Sun"], signs: ["Pisces", "Leo"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 520, proteinG: 38, carbsG: 65, fatG: 12, fiberG: 2, sodiumMg: 1100, sugarG: 5, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Calcium"] },
    alchemicalProperties: { Spirit: 6, Essence: 7, Matter: 4, Substance: 5 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.25, reactivity: 1.4, gregsEnergy: -0.4, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Banh Mi (Thit Nguoi)",
    description: "The ultimate culinary fusion. A shattering-crust Vietnamese baguette smeared with rich pâté and mayonnaise, loaded with cold cuts, and cut with violently acidic pickled daikon and fresh chilies.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 20, cookTimeMinutes: 0, baseServingSize: 2, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 2, unit: "whole", name: "Vietnamese baguettes", notes: "Light, airy crumb, extremely crisp crust" },
      { amount: 2, unit: "tbsp", name: "pork liver pâté", notes: "For rich earthiness" },
      { amount: 2, unit: "tbsp", name: "mayonnaise", notes: "Kewpie or homemade" },
      { amount: 100, unit: "g", name: "Cha Lua (Vietnamese pork roll)", notes: "Thinly sliced" },
      { amount: 100, unit: "g", name: "Thit Nguoi (cured pork cold cuts)", notes: "Thinly sliced" },
      { amount: 0.5, unit: "cup", name: "Do Chua (pickled daikon and carrots)", notes: "Crucial for acidity" },
      { amount: 4, unit: "sprigs", name: "cilantro", notes: "Fresh" },
      { amount: 1, unit: "whole", name: "jalapeño or bird's eye chili", notes: "Thinly sliced" },
      { amount: 1, unit: "dash", name: "Maggi seasoning or soy sauce", notes: "For umami" }
    ],
    instructions: [
      "Step 1: Slice the baguettes lengthwise, keeping them hinged. Toast them lightly to maximize the crust's shatter.",
      "Step 2: Smear a thick layer of mayonnaise on the top inner half and pâté on the bottom half.",
      "Step 3: Drizzle a few drops of Maggi seasoning or soy sauce over the pâté.",
      "Step 4: Layer the Cha Lua and cured pork cuts evenly along the bottom.",
      "Step 5: Pack the sandwich with a heavy fistful of pickled daikon and carrots (Do Chua) and cucumber strips.",
      "Step 6: Top with cilantro sprigs and fresh chili slices. Close firmly and eat immediately."
    ],
    classifications: { mealType: ["lunch", "street food", "sandwich"], cookingMethods: ["assembling"] },
    elementalProperties: { Fire: 0.2, Water: 0.1, Earth: 0.4, Air: 0.3 },
    astrologicalAffinities: { planets: ["Mercury", "Mars"], signs: ["Gemini", "Aries"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 650, proteinG: 22, carbsG: 68, fatG: 32, fiberG: 4, sodiumMg: 950, sugarG: 6, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Iron", "Selenium"] },
    alchemicalProperties: { Spirit: 4, Essence: 5, Matter: 6, Substance: 4 },
    thermodynamicProperties: { heat: 0.02, entropy: 0.3, reactivity: 1.6, gregsEnergy: -0.3, kalchm: 0.02, monica: 0.4 },
    substitutions: []
  },
  {
    name: "Authentic Goi Cuon (Fresh Spring Rolls)",
    description: "An incredibly fresh, raw, tactile appetizer. Translucent rice paper wraps holding a tight, colorful bundle of boiled shrimp, pork, soft vermicelli, and pungent mint and perilla.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 30, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["summer", "spring"] },
    ingredients: [
      { amount: 12, unit: "whole", name: "rice paper wrappers (banh trang)", notes: "Round" },
      { amount: 200, unit: "g", name: "pork belly", notes: "Boiled and sliced wafer-thin" },
      { amount: 200, unit: "g", name: "shrimp", notes: "Boiled, peeled, and sliced in half lengthwise" },
      { amount: 100, unit: "g", name: "rice vermicelli noodles", notes: "Boiled and cooled" },
      { amount: 1, unit: "head", name: "butter lettuce", notes: "Torn" },
      { amount: 1, unit: "bunch", name: "fresh mint and perilla (tia to)", notes: "Essential herbs" },
      { amount: 0.5, unit: "cup", name: "hoisin-peanut dipping sauce", notes: "For serving" }
    ],
    instructions: [
      "Step 1: Prepare all ingredients into separate, easily accessible piles (mise en place is crucial here).",
      "Step 2: Quickly dip a sheet of rice paper into warm water for 2 seconds. Lay it flat on a damp towel (it will soften as it sits).",
      "Step 3: On the bottom third, place a piece of lettuce, a pinch of noodles, pork slices, and a heavy dose of herbs.",
      "Step 4: Roll the paper tightly over the filling once.",
      "Step 5: Lay 3 shrimp halves in a row (pink side down) just ahead of the roll, fold in the sides, and continue rolling tightly over the shrimp to seal.",
      "Step 6: Serve immediately at room temperature with hoisin-peanut sauce."
    ],
    classifications: { mealType: ["appetizer", "snack"], cookingMethods: ["rolling", "boiling"] },
    elementalProperties: { Fire: 0.0, Water: 0.6, Earth: 0.2, Air: 0.2 },
    astrologicalAffinities: { planets: ["Moon", "Venus"], signs: ["Cancer", "Libra"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 280, proteinG: 20, carbsG: 40, fatG: 6, fiberG: 2, sodiumMg: 350, sugarG: 4, vitamins: ["Vitamin A", "Vitamin K"], minerals: ["Selenium", "Iron"] },
    alchemicalProperties: { Spirit: 3, Essence: 5, Matter: 4, Substance: 3 },
    thermodynamicProperties: { heat: 0.01, entropy: 0.15, reactivity: 1.1, gregsEnergy: -0.2, kalchm: 0.01, monica: 0.2 },
    substitutions: []
  },
  {
    name: "Authentic Bun Cha (Hanoi Pork with Vermicelli)",
    description: "The ultimate Hanoi street food. Smoky, aggressively caramelized pork patties and belly slices swimming in a bowl of warm, sweet-and-sour Nuoc Cham broth, served with cold noodles.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 45, cookTimeMinutes: 15, baseServingSize: 4, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 400, unit: "g", name: "ground pork", notes: "For patties (cha)" },
      { amount: 400, unit: "g", name: "pork belly", notes: "Thinly sliced (thit nuong)" },
      { amount: 3, unit: "tbsp", name: "fish sauce", notes: "For marinade" },
      { amount: 3, unit: "tbsp", name: "sugar or caramel syrup", notes: "Crucial for the dark char" },
      { amount: 2, unit: "tbsp", name: "shallots", notes: "Minced" },
      { amount: 4, unit: "cups", name: "Nuoc Cham", notes: "Diluted sweet/sour/salty dipping fish sauce" },
      { amount: 1, unit: "cup", name: "pickled green papaya", notes: "Added to the broth" },
      { amount: 400, unit: "g", name: "rice vermicelli (bun)", notes: "Cooked and cooled" }
    ],
    instructions: [
      "Step 1: Marinate the ground pork and sliced pork belly separately in fish sauce, sugar, minced shallots, garlic, and black pepper for 2 hours.",
      "Step 2: Form the ground pork into small, flat patties.",
      "Step 3: Grill the patties and pork belly slices over roaring charcoal until deeply caramelized and slightly burnt on the edges.",
      "Step 4: Warm the diluted Nuoc Cham broth slightly. Add slices of pickled green papaya.",
      "Step 5: Drop the hot, sizzling, charred pork directly into the bowls of warm broth.",
      "Step 6: Serve the meat/broth bowls alongside plates of cold vermicelli noodles and massive piles of fresh herbs. Diners dip the noodles into the broth."
    ],
    classifications: { mealType: ["lunch", "dinner", "street food"], cookingMethods: ["grilling", "marinating"] },
    elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["Aries", "Leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 35, carbsG: 60, fatG: 28, fiberG: 3, sodiumMg: 1200, sugarG: 18, vitamins: ["Niacin", "Vitamin C"], minerals: ["Iron", "Zinc"] },
    alchemicalProperties: { Spirit: 5, Essence: 5, Matter: 6, Substance: 5 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.4, reactivity: 1.9, gregsEnergy: -0.5, kalchm: 0.04, monica: 0.6 },
    substitutions: []
  },
  {
    name: "Authentic Bun Bo Hue",
    description: "A fierce, pungent, deeply red noodle soup from central Vietnam. Known for its unapologetic use of fermented shrimp paste, intense lemongrass aroma, and spicy chili oil.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 30, cookTimeMinutes: 180, baseServingSize: 6, spiceLevel: "Hot", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "kg", name: "beef shank and pork knuckles", notes: "For the broth" },
      { amount: 6, unit: "stalks", name: "lemongrass", notes: "Bruised heavily" },
      { amount: 3, unit: "tbsp", name: "mam ruoc (fermented shrimp paste)", notes: "Essential funk" },
      { amount: 2, unit: "tbsp", name: "annatto seed oil", notes: "For the fiery red color" },
      { amount: 2, unit: "tbsp", name: "chili flakes", notes: "Fried in the oil" },
      { amount: 500, unit: "g", name: "thick round rice noodles", notes: "Specific to Bun Bo Hue" },
      { amount: 200, unit: "g", name: "cha lua or pork blood cubes", notes: "Traditional toppings" },
      { amount: 1, unit: "cup", name: "banana blossoms and cabbage", notes: "Shredded, for garnish" }
    ],
    instructions: [
      "Step 1: Parboil and clean the bones. Simmer them with heavily bruised lemongrass and charred onion for 2 hours.",
      "Step 2: Dissolve the fermented shrimp paste in water, let the grit settle, and pour only the clear, funky liquid into the simmering broth.",
      "Step 3: Heat oil in a pan, fry minced lemongrass, garlic, chili flakes, and annatto seeds to create a bright red, spicy 'sate' oil.",
      "Step 4: Pour the red sate oil directly into the broth. Season with fish sauce and sugar to balance the intense salt/funk.",
      "Step 5: Cook the thick round noodles and place them in bowls.",
      "Step 6: Slice the cooked beef shank and arrange it over the noodles. Ladle the boiling red broth over the top. Garnish heavily with shredded banana blossom and lime."
    ],
    classifications: { mealType: ["soup", "dinner"], cookingMethods: ["simmering", "infusing"] },
    elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.1, Air: 0.0 },
    astrologicalAffinities: { planets: ["Pluto", "Mars"], signs: ["Scorpio", "Aries"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 580, proteinG: 45, carbsG: 65, fatG: 18, fiberG: 4, sodiumMg: 1400, sugarG: 5, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Calcium"] },
    alchemicalProperties: { Spirit: 6, Essence: 7, Matter: 5, Substance: 6 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.45, reactivity: 2.3, gregsEnergy: -0.6, kalchm: 0.05, monica: 0.7 },
    substitutions: []
  }
];

injectRecipes('russian', 'dinner', russianRecipes);
injectRecipes('thai', 'dinner', thaiRecipes);
injectRecipes('vietnamese', 'dinner', vietnameseRecipes);
