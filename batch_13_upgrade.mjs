import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/data/cuisines/**/*.ts');

const recipesData = {
  "Pad Krapow Moo": {
    description: "The street food engine of Thailand. A violently hot, rapid stir-fry of minced pork infused with the anise-like sting of holy basil (krapow), served over rice and crowned with a brutally fried egg (khai dao).",
    details: { cuisine: "Thai", prepTimeMinutes: 10, cookTimeMinutes: 5, baseServingSize: 2, spiceLevel: "Very High", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Minced pork", notes: "Must be coarsely ground with fat." },
      { amount: 2, unit: "cups", name: "Holy basil leaves", notes: "Krapow. Do not substitute with Thai sweet basil." },
      { amount: 5, unit: "cloves", name: "Garlic", notes: "Pounded in a mortar." },
      { amount: 5, unit: "whole", name: "Bird's eye chilies", notes: "Pounded with the garlic." },
      { amount: 1, unit: "tbsp", name: "Oyster sauce", notes: "For gloss and deep umami." },
      { amount: 1, unit: "tbsp", name: "Dark soy sauce", notes: "For color and sweetness." },
      { amount: 1, unit: "tbsp", name: "Fish sauce", notes: "For salinity." },
      { amount: 2, unit: "large", name: "Eggs", notes: "Fried in a lake of oil." }
    ],
    instructions: [
      "Step 1: The Aromatic Paste. In a mortar and pestle, aggressively pound the garlic and chilies into a coarse, wet paste. This releases the essential oils that slicing cannot achieve.",
      "Step 2: The Sear. Heat a wok until it is smoking. Add oil and the garlic-chili paste. Fry for exactly 10 seconds until violently fragrant (do not burn).",
      "Step 3: The Meat. Add the minced pork. Toss aggressively, breaking it apart, until it is just cooked through and begins to caramelize in its own fat.",
      "Step 4: The Glaze. Add the oyster sauce, dark soy sauce, fish sauce, and a pinch of sugar. Toss until the meat is entirely coated in a dark, sticky glaze.",
      "Step 5: The Basil Flash. Turn off the heat. Immediately throw in the massive pile of holy basil leaves. Toss once; the residual heat will instantly wilt them, preserving their delicate, pepper-anise aroma. Serve over rice with a deep-fried egg with a liquid yolk."
    ],
    classifications: { mealType: ["lunch", "dinner"], cookingMethods: ["stir-frying", "pounding"] },
    elementalProperties: { Fire: 0.55, Water: 0.05, Earth: 0.25, Air: 0.15 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["aries", "gemini"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 520, proteinG: 32, carbsG: 8, fatG: 38, fiberG: 1, sodiumMg: 1100, sugarG: 4, vitamins: ["Vitamin B6", "Niacin"], minerals: ["Zinc", "Iron"] },
    substitutions: [{ originalIngredient: "Holy basil", substituteOptions: ["Thai sweet basil (though structurally incorrect, it is common)"] }]
  },
  "Pla Neung Manao": {
    description: "A triumph of acidic and aromatic poaching. A whole fish is steamed rapidly to retain absolute moisture, then drowned in a bracing, fiercely sour, garlic-and-chili-laden lime broth.",
    details: { cuisine: "Thai", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "High", season: ["summer"] },
    ingredients: [
      { amount: 1, unit: "whole", name: "White fish", notes: "Sea bass or snapper, scaled and gutted." },
      { amount: 3, unit: "stalks", name: "Lemongrass", notes: "Bruised, stuffed inside the fish." },
      { amount: 0.5, unit: "cup", name: "Lime juice", notes: "Freshly squeezed." },
      { amount: 3, unit: "tbsp", name: "Fish sauce", notes: "For salinity." },
      { amount: 1, unit: "tbsp", name: "Palm sugar", notes: "To round out the acid." },
      { amount: 10, unit: "cloves", name: "Garlic", notes: "Finely minced." },
      { amount: 5, unit: "whole", name: "Bird's eye chilies", notes: "Finely sliced." },
      { amount: 1, unit: "bunch", name: "Cilantro", notes: "Chopped." }
    ],
    instructions: [
      "Step 1: The Preparation. Score the thickest part of the fish deeply on both sides. Stuff the cavity with the bruised lemongrass stalks to perfume the flesh from the inside out.",
      "Step 2: The Steam. Place the fish on a heatproof plate that will fit inside a steamer. Steam over aggressively boiling water for 10-15 minutes until the flesh turns opaque and flakes easily at the spine.",
      "Step 3: The Broth. While the fish steams, whisk together the fresh lime juice, fish sauce, dissolved palm sugar, massive quantities of minced garlic, and sliced chilies. The dressing must be intensely sour, salty, and spicy.",
      "Step 4: The Drowning. Carefully remove the plate with the cooked fish from the steamer (retain the juices that pooled on the plate). Immediately pour the cold, vibrant lime broth entirely over the hot fish.",
      "Step 5: The Garnish. Top generously with chopped cilantro. Place the plate over a small burner at the table to keep the broth simmering while eating."
    ],
    classifications: { mealType: ["dinner", "celebration"], cookingMethods: ["steaming"] },
    elementalProperties: { Fire: 0.30, Water: 0.50, Earth: 0.10, Air: 0.10 },
    astrologicalAffinities: { planets: ["Neptune", "Mercury"], signs: ["pisces", "virgo"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 280, proteinG: 45, carbsG: 12, fatG: 4, fiberG: 1, sodiumMg: 1500, sugarG: 8, vitamins: ["Vitamin C", "Vitamin B12"], minerals: ["Selenium", "Potassium"] },
    substitutions: [{ originalIngredient: "Whole fish", substituteOptions: ["Fish fillets (reduce steaming time)"] }]
  },
  "Nam Kang Sai": {
    description: "The structural opposite of hot and heavy. A violently cooling Thai dessert consisting of fiercely crushed ice piled over a customizable matrix of jellies, sweet beans, and syrups, flooded with condensed milk.",
    details: { cuisine: "Thai", prepTimeMinutes: 10, cookTimeMinutes: 0, baseServingSize: 1, spiceLevel: "None", season: ["summer"] },
    ingredients: [
      { amount: 2, unit: "cups", name: "Ice", notes: "Must be finely shaved or crushed into snow." },
      { amount: 0.5, unit: "cup", name: "Toppings matrix", notes: "Red beans, grass jelly, sweet corn, attap seeds." },
      { amount: 3, unit: "tbsp", name: "Hale's Blue Boy syrup", notes: "Iconic sweet, floral, bright red or green syrup." },
      { amount: 2, unit: "tbsp", name: "Evaporated milk", notes: "For richness." },
      { amount: 1, unit: "tbsp", name: "Sweetened condensed milk", notes: "For density and sweetness." }
    ],
    instructions: [
      "Step 1: The Base. In the bottom of a wide bowl, arrange the chosen heavy toppings (sweet red beans, jellies, corn).",
      "Step 2: The Mountain. Shave the ice directly over the toppings, forming a high, structured mountain. The ice must be fine enough to absorb syrup but granular enough not to instantly melt.",
      "Step 3: The Saturation. Vigorously drench the ice mountain with the brightly colored, floral syrup. The ice will instantly absorb the color.",
      "Step 4: The Emulsion. Pour the evaporated milk and a heavy drizzle of sweetened condensed milk over the top. The milk will streak down the sides, creating a visual marbling effect.",
      "Step 5: The Collapse. Serve immediately with a spoon. As it is eaten, the ice collapses into the sweet milks and toppings, creating a cold, slushy soup."
    ],
    classifications: { mealType: ["dessert", "snack", "beverage"], cookingMethods: ["shaving ice", "assembling"] },
    elementalProperties: { Fire: 0.0, Water: 0.70, Earth: 0.15, Air: 0.15 },
    astrologicalAffinities: { planets: ["Moon", "Neptune"], signs: ["cancer", "pisces"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 250, proteinG: 4, carbsG: 55, fatG: 4, fiberG: 2, sodiumMg: 80, sugarG: 45, vitamins: ["Calcium"], minerals: ["Phosphorus"] },
    substitutions: [{ originalIngredient: "Hale's Blue Boy", substituteOptions: ["Any highly concentrated fruit syrup"] }]
  },
  "Yum Woon Sen": {
    description: "A highly kinetic glass noodle salad. It relies on the absolute absorption capabilities of mung bean threads to hold a fiercely sour, spicy, and savory dressing, studded with blanched seafood and sharp aromatics.",
    details: { cuisine: "Thai", prepTimeMinutes: 15, cookTimeMinutes: 5, baseServingSize: 2, spiceLevel: "High", season: ["summer", "spring"] },
    ingredients: [
      { amount: 100, unit: "g", name: "Glass noodles (Woon Sen)", notes: "Mung bean threads, soaked in cold water." },
      { amount: 0.5, unit: "lb", name: "Shrimp and minced pork", notes: "The dual protein base." },
      { amount: 3, unit: "tbsp", name: "Lime juice", notes: "Fresh." },
      { amount: 2, unit: "tbsp", name: "Fish sauce", notes: "For umami." },
      { amount: 1, unit: "tbsp", name: "Palm sugar", notes: "Dissolved." },
      { amount: 3, unit: "whole", name: "Bird's eye chilies", notes: "Pounded." },
      { amount: 0.5, unit: "cup", name: "Chinese celery and cilantro", notes: "Roughly chopped." },
      { amount: 0.5, unit: "whole", name: "Red onion", notes: "Sliced thinly." },
      { amount: 2, unit: "tbsp", name: "Roasted peanuts", notes: "For crunch." }
    ],
    instructions: [
      "Step 1: The Dressing Matrix. In a large mixing bowl, whisk together the lime juice, fish sauce, palm sugar, and pounded chilies until the sugar is completely dissolved into a sharp, balanced elixir.",
      "Step 2: The Protein Poach. Bring a pot of water to a boil. Briefly blanch the shrimp until just pink. In a separate pan with a tiny splash of water, cook the minced pork until it turns white. Add both hot proteins (and the small amount of pork broth) to the dressing.",
      "Step 3: The Noodle Shock. Drop the soaked glass noodles into boiling water for exactly 2 minutes until translucent. Drain well and immediately add them to the bowl while blazing hot.",
      "Step 4: The Absorption. Toss the hot noodles and proteins aggressively in the dressing. The heat of the noodles will instantly absorb the liquid matrix.",
      "Step 5: The Aromatics. Fold in the red onion, Chinese celery, and cilantro. Top with roasted peanuts. Serve warm or at room temperature."
    ],
    classifications: { mealType: ["appetizer", "lunch"], cookingMethods: ["blanching", "mixing"] },
    elementalProperties: { Fire: 0.35, Water: 0.40, Earth: 0.15, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mercury", "Uranus"], signs: ["gemini", "aquarius"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 320, proteinG: 22, carbsG: 45, fatG: 8, fiberG: 2, sodiumMg: 1200, sugarG: 12, vitamins: ["Vitamin C", "Niacin"], minerals: ["Selenium", "Zinc"] },
    substitutions: [{ originalIngredient: "Minced pork", substituteOptions: ["Minced chicken", "More seafood"] }]
  },
  "Gaeng Massaman Neua": {
    description: "The most complex of Thai curries, bearing deep Persian and Indian influence. Heavy, warm spices (cardamom, cinnamon) are pounded into a paste, then slowly braised with beef and potatoes in a violently rich, peanut-laced coconut cream.",
    details: { cuisine: "Thai", prepTimeMinutes: 30, cookTimeMinutes: 120, baseServingSize: 4, spiceLevel: "Mild", season: ["winter", "autumn"] },
    ingredients: [
      { amount: 1.5, unit: "lbs", name: "Beef chuck", notes: "Cut into large cubes for slow braising." },
      { amount: 4, unit: "tbsp", name: "Massaman curry paste", notes: "A heavy, spice-driven paste." },
      { amount: 2, unit: "cups", name: "Coconut milk", notes: "Separated into thick cream and thin milk." },
      { amount: 2, unit: "whole", name: "Potatoes", notes: "Cut into large chunks." },
      { amount: 1, unit: "whole", name: "Onion", notes: "Cut into wedges." },
      { amount: 0.25, unit: "cup", name: "Roasted peanuts", notes: "Whole." },
      { amount: 3, unit: "tbsp", name: "Tamarind paste", notes: "For deep, fruity sweetness." },
      { amount: 2, unit: "tbsp", name: "Fish sauce", notes: "For salinity." },
      { amount: 1, unit: "whole", name: "Cinnamon stick & Star anise", notes: "Whole spices." }
    ],
    instructions: [
      "Step 1: The Meat Braise. Simmer the beef chunks in the thin portion of the coconut milk with water for 1.5 hours until tender. This creates a fortified beef-coconut stock.",
      "Step 2: The Oil Separation (Keeo Gati). In a separate heavy pot, heat the thick coconut cream over medium heat. Simmer until the water evaporates and the pure coconut oil violently separates and 'cracks' from the white solids.",
      "Step 3: The Paste Frying. Add the massaman curry paste to the cracked coconut oil. Fry aggressively until it darkens and emits an incredibly rich, spiced aroma.",
      "Step 4: The Unification. Transfer the braised beef and its cooking liquid into the fried paste. Add the potatoes, onions, peanuts, and whole spices. Bring to a gentle simmer.",
      "Step 5: The Balance. Season with tamarind paste, fish sauce, and palm sugar. The resulting sauce must be thick, oily, and fiercely balanced between sweet, savory, and aromatic. Simmer until the potatoes are soft. Serve with rice."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["braising", "paste frying"] },
    elementalProperties: { Fire: 0.20, Water: 0.25, Earth: 0.45, Air: 0.10 },
    astrologicalAffinities: { planets: ["Jupiter", "Saturn"], signs: ["sagittarius", "taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 650, proteinG: 38, carbsG: 28, fatG: 45, fiberG: 5, sodiumMg: 950, sugarG: 14, vitamins: ["Iron", "Vitamin B12"], minerals: ["Zinc", "Potassium"] },
    substitutions: [{ originalIngredient: "Beef chuck", substituteOptions: ["Chicken thighs (reduce braise time)"] }]
  },
  "Tom Yum Goong Nam Khon": {
    description: "The creamy version of the iconic Thai soup. It balances violent chili heat and sharp lime acidity with the intense aromatics of galangal and makrut lime leaf, bound together by a lush emulsion of evaporated milk and chili jam.",
    details: { cuisine: "Thai", prepTimeMinutes: 15, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "Very High", season: ["all"] },
    ingredients: [
      { amount: 3, unit: "cups", name: "Shrimp stock or water", notes: "Ideally made from the shrimp shells." },
      { amount: 0.5, unit: "lb", name: "Large shrimp", notes: "Peeled, tails left on." },
      { amount: 2, unit: "stalks", name: "Lemongrass", notes: "Bruised and cut into 2-inch pieces." },
      { amount: 5, unit: "slices", name: "Galangal", notes: "Fresh, do not substitute ginger." },
      { amount: 5, unit: "leaves", name: "Makrut lime leaves", notes: "Torn to release oils." },
      { amount: 1, unit: "cup", name: "Oyster or straw mushrooms", notes: "Torn." },
      { amount: 2, unit: "tbsp", name: "Nam Prik Pao", notes: "Thai roasted chili jam." },
      { amount: 0.25, unit: "cup", name: "Evaporated milk", notes: "Creates the 'Nam Khon' (creamy) texture." },
      { amount: 3, unit: "tbsp", name: "Lime juice", notes: "Added off heat." },
      { amount: 2, unit: "tbsp", name: "Fish sauce", notes: "Added off heat." }
    ],
    instructions: [
      "Step 1: The Aromatic Infusion. Bring the stock to a rolling boil. Add the bruised lemongrass, galangal slices, and torn makrut lime leaves. Boil aggressively for 5 minutes to extract their intense essential oils into the water. The kitchen will become fiercely fragrant.",
      "Step 2: The Mushrooms. Add the mushrooms and boil for 2 minutes until tender.",
      "Step 3: The Emulsion. Stir in the Nam Prik Pao (chili jam) and the evaporated milk. The broth will turn a vibrant, opaque, oily orange.",
      "Step 4: The Poach. Add the shrimp. Cook for exactly 1-2 minutes until they just turn pink and curl. Turn off the heat immediately. Do not boil the shrimp further.",
      "Step 5: The Acid Finish. Off the heat, stir in the fish sauce and fresh lime juice. (Boiling lime juice destroys its brightness and turns it bitter). Taste and adjust; it should be sour, salty, spicy, and creamy all at once. Top with cilantro."
    ],
    classifications: { mealType: ["soup", "dinner"], cookingMethods: ["infusing", "boiling", "poaching"] },
    elementalProperties: { Fire: 0.40, Water: 0.40, Earth: 0.10, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Neptune"], signs: ["aries", "pisces"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 280, proteinG: 24, carbsG: 12, fatG: 14, fiberG: 2, sodiumMg: 1400, sugarG: 6, vitamins: ["Vitamin C", "Vitamin A"], minerals: ["Selenium", "Iodine"] },
    substitutions: [{ originalIngredient: "Evaporated milk", substituteOptions: ["Coconut milk (for a different variation)"] }]
  },
  "Cháo Gà": {
    description: "Vietnamese chicken rice porridge. The rice is heavily broken down through prolonged simmering in a rich, ginger-fortified chicken broth, resulting in a silken, restorative matrix designed for healing.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 10, cookTimeMinutes: 60, baseServingSize: 4, spiceLevel: "None", season: ["winter", "comfort"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Jasmine rice", notes: "Washed and toasted." },
      { amount: 0.25, unit: "cup", name: "Glutinous rice", notes: "Adds viscosity." },
      { amount: 8, unit: "cups", name: "Strong chicken broth", notes: "Homemade with ginger and onion." },
      { amount: 2, unit: "cups", name: "Shredded chicken", notes: "Poached." },
      { amount: 2, unit: "tbsp", name: "Fish sauce", notes: "For seasoning." },
      { amount: 1, unit: "inch", name: "Ginger", notes: "Julienned finely." },
      { amount: 0.5, unit: "cup", name: "Scallions and cilantro", notes: "Chopped." },
      { amount: 1, unit: "pinch", name: "Black pepper", notes: "White or black, heavily applied." },
      { amount: 1, unit: "batch", name: "Youtiao (Quẩy)", notes: "Fried dough sticks for dipping." }
    ],
    instructions: [
      "Step 1: The Toast. In a dry pan, toast the washed jasmine and glutinous rice until dry and slightly fragrant. This prevents the grains from completely dissolving into glue during the long simmer.",
      "Step 2: The Boil. Add the toasted rice to a large pot with the boiling chicken broth.",
      "Step 3: The Breakdown. Reduce the heat to the lowest possible simmer. Cover partially. Cook for 45-60 minutes, stirring occasionally to scrape the bottom. The grains will burst, releasing their starch to naturally thicken the liquid into a silken, suspended porridge.",
      "Step 4: The Seasoning. Stir in the fish sauce. The texture should be thick but pourable.",
      "Step 5: The Assembly. Ladle the hot porridge into bowls. Top generously with the shredded chicken, julienned ginger, scallions, cilantro, and a massive amount of black pepper. Serve with crispy fried dough sticks."
    ],
    classifications: { mealType: ["breakfast", "comfort", "dinner"], cookingMethods: ["toasting", "simmering"] },
    elementalProperties: { Fire: 0.10, Water: 0.60, Earth: 0.25, Air: 0.05 },
    astrologicalAffinities: { planets: ["Moon", "Ceres"], signs: ["cancer", "virgo"], lunarPhases: ["Waning Crescent"] },
    nutritionPerServing: { calories: 350, proteinG: 22, carbsG: 48, fatG: 6, fiberG: 2, sodiumMg: 850, sugarG: 2, vitamins: ["Niacin", "Vitamin B6"], minerals: ["Selenium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Chicken", substituteOptions: ["Pork ribs (for Cháo Sườn)"] }]
  },
  "Bánh Cuốn": {
    description: "The delicate art of Vietnamese steaming. A fermented rice batter is spread gossamer-thin over a taut cloth suspended above boiling water, steamed into a translucent sheet, and carefully rolled around a savory pork and wood-ear mushroom filling.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 60, cookTimeMinutes: 30, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Bánh cuốn flour mix", notes: "Rice flour and tapioca starch." },
      { amount: 3, unit: "cups", name: "Water", notes: "For the batter." },
      { amount: 0.5, unit: "lb", name: "Ground pork", notes: "Finely minced." },
      { amount: 0.5, unit: "cup", name: "Wood ear mushrooms", notes: "Rehydrated and finely minced." },
      { amount: 0.5, unit: "cup", name: "Shallots", notes: "Minced." },
      { amount: 0.5, unit: "cup", name: "Fried shallots", notes: "For garnish." },
      { amount: 0.5, unit: "cup", name: "Nước Chấm", notes: "Sweet, sour, salty dipping sauce." },
      { amount: 4, unit: "slices", name: "Chả lụa", notes: "Vietnamese pork sausage." }
    ],
    instructions: [
      "Step 1: The Batter and Rest. Whisk the flour mix, water, a pinch of salt, and a dash of oil. It is crucial to let this batter rest for at least 30 minutes (or overnight) so the starches fully hydrate, ensuring elasticity.",
      "Step 2: The Filling. Sauté the minced pork, wood ear mushrooms, and shallots with fish sauce and black pepper until dry and fragrant.",
      "Step 3: The Steam Drum. Prepare a specialized steaming pot with a taut cloth stretched tightly over the boiling water. (Alternatively, use a non-stick crepe pan).",
      "Step 4: The Casting. Pour a very small ladle of batter onto the hot cloth. Quickly spread it into a massive, paper-thin circle using the back of the ladle. Cover with a domed lid and steam for exactly 60 seconds until the sheet bubbles and becomes translucent.",
      "Step 5: The Roll. Using a flat bamboo stick, carefully lift the fragile sheet off the cloth onto an oiled tray. Place a line of filling in the center and roll it into a neat cylinder. Serve topped with fried shallots, accompanied by chả lụa and a bowl of warm nước chấm."
    ],
    classifications: { mealType: ["breakfast", "lunch"], cookingMethods: ["steaming", "rolling"] },
    elementalProperties: { Fire: 0.10, Water: 0.45, Earth: 0.25, Air: 0.20 },
    astrologicalAffinities: { planets: ["Venus", "Mercury"], signs: ["libra", "gemini"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 420, proteinG: 18, carbsG: 55, fatG: 14, fiberG: 4, sodiumMg: 950, sugarG: 8, vitamins: ["Thiamin", "Niacin"], minerals: ["Iron", "Manganese"] },
    substitutions: [{ originalIngredient: "Ground pork", substituteOptions: ["More mushrooms and tofu (vegetarian)"] }]
  },
  "Bún Chả": {
    description: "The smoky, caramelized scent of Hanoi. Fatty pork patties and belly slices are aggressively grilled over charcoal, then submerged entirely in a warm, acidic, sweet-savory broth of diluted fish sauce and green papaya, eaten with cold rice noodles.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 30, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 0.5, unit: "lb", name: "Pork belly", notes: "Thinly sliced." },
      { amount: 0.5, unit: "lb", name: "Ground pork", notes: "Formed into small patties." },
      { amount: 2, unit: "tbsp", name: "Caramel sauce (Nước màu)", notes: "Essential for color and sweetness." },
      { amount: 2, unit: "tbsp", name: "Fish sauce", notes: "For marinade." },
      { amount: 1, unit: "tbsp", name: "Minced lemongrass and garlic", notes: "Aromatics." },
      { amount: 1, unit: "cup", name: "Warm Nước Chấm", notes: "Dipping broth: fish sauce, sugar, lime, water." },
      { amount: 0.5, unit: "cup", name: "Green papaya and carrot", notes: "Pickled, floating in the broth." },
      { amount: 8, unit: "oz", name: "Bún (Rice vermicelli)", notes: "Cooked and cooled." },
      { amount: 1, unit: "basket", name: "Fresh herbs", notes: "Mint, perilla, lettuce." }
    ],
    instructions: [
      "Step 1: The Marinade. Massage the sliced pork belly and the ground pork patties with the caramel sauce, fish sauce, lemongrass, garlic, and a pinch of sugar. The caramel sauce is non-negotiable for the dark, lacquered exterior.",
      "Step 2: The Charcoal Fire. Grill the meats over a fiercely hot charcoal fire. The rendering fat will drip onto the coals, creating a heavy smoke that aggressively perfumes the meat.",
      "Step 3: The Broth. In a bowl, prepare the dipping broth. It must be warm, a delicate balance of sweet, sour, and salty, acting as a soup rather than a pure condiment. Add the pickled papaya and carrots.",
      "Step 4: The Submersion. Take the violently sizzling, charred meats directly from the grill and plunge them straight into the bowl of warm broth.",
      "Step 5: The Ritual. To eat, take a pinch of cold bún noodles and fresh herbs, dip them into the meat-infused broth, and eat in a single bite. The contrast of hot, smoky meat, warm broth, and cold noodles is the defining feature."
    ],
    classifications: { mealType: ["lunch", "dinner"], cookingMethods: ["grilling", "marinating"] },
    elementalProperties: { Fire: 0.45, Water: 0.30, Earth: 0.15, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["aries", "leo"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 680, proteinG: 32, carbsG: 65, fatG: 34, fiberG: 4, sodiumMg: 1800, sugarG: 18, vitamins: ["Vitamin C", "Niacin"], minerals: ["Zinc", "Iron"] },
    substitutions: [{ originalIngredient: "Pork belly", substituteOptions: ["Chicken thighs"] }]
  },
  "Bún Bò Huế": {
    description: "The dark, fiery, and fiercely aromatic beef noodle soup of Central Vietnam. It relies on a violently heavy broth extracted from beef bones and pork knuckles, tinted blood-red with annatto and heavily perfumed with massive stalks of bruised lemongrass and fermented shrimp paste.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 30, cookTimeMinutes: 240, baseServingSize: 4, spiceLevel: "High", season: ["winter", "all"] },
    ingredients: [
      { amount: 2, unit: "lbs", name: "Beef and pork bones", notes: "Oxtail, pork knuckles (giò heo)." },
      { amount: 1, unit: "lb", name: "Beef shank or brisket", notes: "For slicing." },
      { amount: 6, unit: "stalks", name: "Lemongrass", notes: "Heavily bruised." },
      { amount: 2, unit: "tbsp", name: "Mắm ruốc", notes: "Fermented shrimp paste. The funky soul of the broth." },
      { amount: 2, unit: "tbsp", name: "Annatto oil", notes: "Oil infused with achiote seeds for the fiery red color." },
      { amount: 1, unit: "tbsp", name: "Chili flakes", notes: "Fried in the annatto oil." },
      { amount: 1, unit: "package", name: "Thick round rice noodles (Bún bò)", notes: "Thicker than standard pho noodles." },
      { amount: 1, unit: "basket", name: "Banana blossom, mint, lime", notes: "For garnish." },
      { amount: 4, unit: "cubes", name: "Congealed pork blood (Huyết)", notes: "Traditional authentic inclusion." }
    ],
    instructions: [
      "Step 1: The Blanch. Violently boil all bones and meat for 10 minutes. Discard the foul water and wash the bones completely. This ensures the final heavy broth remains clean.",
      "Step 2: The Long Extraction. Place the clean bones, beef shank, bruised lemongrass stalks, and a charred onion in a massive pot of fresh water. Simmer aggressively. Remove the beef shank after 2 hours when tender. Continue simmering the bones for another 2 hours.",
      "Step 3: The Funk. Dissolve the dense, pungent shrimp paste (mắm ruốc) in water, let the sediment settle, and pour only the clear, highly aromatic liquid into the broth.",
      "Step 4: The Fire Oil. In a small pan, heat oil and annatto seeds until the oil is deeply red. Discard seeds. Fry minced lemongrass and chili flakes in this red oil, then dump the entire violently sizzling mixture into the broth.",
      "Step 5: The Assembly. Place hot, thick noodles in a bowl. Top with thin slices of the beef shank, pieces of pork knuckle, and cubes of blood. Ladle the boiling, fiery-red, lemongrass-scented broth over everything. Serve with a mountain of shredded banana blossom."
    ],
    classifications: { mealType: ["soup", "dinner"], cookingMethods: ["simmering", "infusing"] },
    elementalProperties: { Fire: 0.40, Water: 0.45, Earth: 0.10, Air: 0.05 },
    astrologicalAffinities: { planets: ["Pluto", "Mars"], signs: ["scorpio", "aries"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 650, proteinG: 45, carbsG: 68, fatG: 22, fiberG: 4, sodiumMg: 2100, sugarG: 5, vitamins: ["Vitamin B12", "Iron"], minerals: ["Zinc", "Sodium"] },
    substitutions: [{ originalIngredient: "Congealed pork blood", substituteOptions: ["Omit entirely (common in diaspora)"] }]
  },
  "Gỏi Cuốn": {
    description: "The aesthetic architecture of a Vietnamese summer roll. A translucent sheet of rice paper tightly binds a hyper-fresh matrix of cold vermicelli, snappy shrimp, pork, and sharp herbs, offering a purely clean flavor meant to be dragged through a heavy, fatty peanut sauce.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 30, cookTimeMinutes: 10, baseServingSize: 4, spiceLevel: "None", season: ["summer", "spring"] },
    ingredients: [
      { amount: 8, unit: "sheets", name: "Rice paper (Bánh tráng)", notes: "For wrapping." },
      { amount: 0.5, unit: "lb", name: "Pork belly or lean pork", notes: "Boiled and sliced paper-thin." },
      { amount: 0.5, unit: "lb", name: "Shrimp", notes: "Boiled, peeled, and sliced in half horizontally." },
      { amount: 4, unit: "oz", name: "Rice vermicelli (Bún)", notes: "Cooked and cooled." },
      { amount: 1, unit: "head", name: "Lettuce", notes: "Soft leaves." },
      { amount: 1, unit: "bunch", name: "Mint, cilantro, and garlic chives", notes: "Fresh herbs are the core flavor." },
      { amount: 0.5, unit: "cup", name: "Peanut sauce (Tương đậu phộng)", notes: "Hoisin, peanut butter, garlic, chili." }
    ],
    instructions: [
      "Step 1: The Boiling. Boil the pork until fully cooked. Let it cool, then slice it impossibly thin. Boil the shrimp just until pink, peel, and slice them directly down the center to create two thin halves.",
      "Step 2: The Hydration. Take a sheet of rigid rice paper. Quickly dip it entirely into warm water and immediately place it flat on a damp surface. Do not soak it; it will hydrate and become sticky and pliable in about 10 seconds.",
      "Step 3: The Architecture. On the lower third of the paper, lay a piece of lettuce. Top with a small pinch of noodles, herbs, and pork slices. Roll the paper over this pile once to form a tight core.",
      "Step 4: The Display. Just above the core, lay 3-4 shrimp halves, pink side facing down (against the paper). Fold the left and right sides of the paper inward to seal the edges.",
      "Step 5: The Seal. Continue rolling forward, wrapping tightly over the shrimp. The final roll should be an impossibly tight, translucent cylinder displaying the pink shrimp clearly through the skin. Serve immediately with the dense, fatty peanut dipping sauce."
    ],
    classifications: { mealType: ["appetizer", "snack"], cookingMethods: ["boiling", "rolling", "raw"] },
    elementalProperties: { Fire: 0.0, Water: 0.50, Earth: 0.20, Air: 0.30 },
    astrologicalAffinities: { planets: ["Venus", "Mercury"], signs: ["libra", "gemini"], lunarPhases: ["New Moon"] },
    nutritionPerServing: { calories: 280, proteinG: 18, carbsG: 35, fatG: 8, fiberG: 3, sodiumMg: 650, sugarG: 4, vitamins: ["Vitamin A", "Vitamin C"], minerals: ["Calcium", "Iron"] },
    substitutions: [{ originalIngredient: "Pork and shrimp", substituteOptions: ["Fried tofu (for vegetarian)"] }]
  },
  "Cơm Gà Hội An": {
    description: "The luminous yellow chicken rice of Hoi An. Rice is toasted in chicken fat and violently dyed with turmeric, then cooked in a rich chicken broth, served with hand-shredded poached chicken mixed with sharp, acidic herbs and onions.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 20, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Mild", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "whole", name: "Free-range chicken", notes: "Essential for tight meat texture and yellow fat." },
      { amount: 2, unit: "cups", name: "Jasmine rice", notes: "Washed and drained well." },
      { amount: 1, unit: "tbsp", name: "Turmeric powder", notes: "For the intensely vibrant yellow color." },
      { amount: 2, unit: "tbsp", name: "Chicken fat", notes: "Rendered from the chicken skin." },
      { amount: 1, unit: "whole", name: "Onion", notes: "Sliced paper-thin and soaked in ice water to remove bite." },
      { amount: 1, unit: "bunch", name: "Vietnamese coriander (Rau răm)", notes: "Essential sharp, peppery herb." },
      { amount: 2, unit: "tbsp", name: "Lime juice and salt", notes: "To dress the chicken salad." }
    ],
    instructions: [
      "Step 1: The Poach. Poach the whole chicken gently with ginger and shallots. Remove, plunge into an ice bath to tighten the skin, and reserve the golden broth.",
      "Step 2: The Fat Rendering. Cut excess skin and fat from the chicken and fry it in a pan until it renders into a pool of liquid chicken fat.",
      "Step 3: The Golden Grain. Heat the rendered fat in a pot. Add the raw, dry rice and turmeric powder. Toast aggressively for 5 minutes until every grain is coated in fat and violently yellow.",
      "Step 4: The Broth Absorption. Pour the reserved chicken broth over the yellow rice. Cook like standard rice until the liquid is absorbed and the grains are fluffy and distinct.",
      "Step 5: The Salad. Hand-shred the cooled chicken meat (do not chop it). Toss the shredded meat vigorously with the ice-cold sliced onions, rau răm, lime juice, salt, and pepper. Serve the acidic chicken salad over a mound of the rich, fatty yellow rice."
    ],
    classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["poaching", "toasting", "mixing"] },
    elementalProperties: { Fire: 0.15, Water: 0.30, Earth: 0.40, Air: 0.15 },
    astrologicalAffinities: { planets: ["Sun", "Venus"], signs: ["leo", "taurus"], lunarPhases: ["Full Moon"] },
    nutritionPerServing: { calories: 550, proteinG: 35, carbsG: 65, fatG: 15, fiberG: 2, sodiumMg: 750, sugarG: 2, vitamins: ["Niacin", "Vitamin B6"], minerals: ["Iron", "Zinc"] },
    substitutions: [{ originalIngredient: "Free-range chicken", substituteOptions: ["Standard chicken (though less authentic in texture)"] }]
  },
  "Bánh Xèo": {
    description: "A wildly crisp, violently yellow Vietnamese crepe. The batter, colored with turmeric and enriched with coconut milk, is poured into a smoking hot wok to fry aggressively, trapping shrimp, pork, and bean sprouts in a brittle, lacy shell.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 20, cookTimeMinutes: 15, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "cup", name: "Rice flour", notes: "Do not use wheat flour." },
      { amount: 0.5, unit: "tsp", name: "Turmeric powder", notes: "For the yellow color." },
      { amount: 0.5, unit: "cup", name: "Coconut milk", notes: "Adds slight richness." },
      { amount: 1, unit: "cup", name: "Water or beer", notes: "Beer adds carbonation for extra crispness." },
      { amount: 0.25, unit: "lb", name: "Pork belly", notes: "Sliced thinly." },
      { amount: 0.25, unit: "lb", name: "Shrimp", notes: "Small, left whole." },
      { amount: 1, unit: "cup", name: "Bean sprouts", notes: "For internal crunch." },
      { amount: 1, unit: "basket", name: "Lettuce and herbs", notes: "Mustard greens, mint, perilla, for wrapping." }
    ],
    instructions: [
      "Step 1: The Slurry. Whisk the rice flour, turmeric, coconut milk, water/beer, and a pinch of salt into a very thin, watery liquid. Let it rest for 30 minutes.",
      "Step 2: The Sizzle. Heat a large skillet or wok over extremely high heat. Add oil, a few slices of pork, and shrimp. Sear aggressively.",
      "Step 3: The Searing Lace. Vigorously stir the batter (the flour sinks). Pour a ladle of the thin batter into the violently hot pan, swirling immediately to coat the entire surface. It must hiss loudly and form a thin, lacy edge.",
      "Step 4: The Steam. Throw a handful of bean sprouts onto one half of the crepe. Cover the pan immediately for exactly 1 minute to steam the sprouts and cook the top of the batter.",
      "Step 5: The Crisp. Remove the lid. Lower the heat slightly and wait (about 2-3 minutes) for the bottom to become entirely rigid, brittle, and deeply brown. Fold in half. Slide onto a plate. To eat, rip off a piece of the crispy crepe, wrap it in a mustard green leaf with fresh herbs, and plunge it into dipping sauce."
    ],
    classifications: { mealType: ["lunch", "dinner"], cookingMethods: ["shallow frying", "steaming"] },
    elementalProperties: { Fire: 0.40, Water: 0.15, Earth: 0.25, Air: 0.20 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["aries", "gemini"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 480, proteinG: 18, carbsG: 55, fatG: 22, fiberG: 4, sodiumMg: 650, sugarG: 4, vitamins: ["Vitamin C", "Vitamin K"], minerals: ["Calcium", "Iron"] },
    substitutions: [{ originalIngredient: "Pork and shrimp", substituteOptions: ["Mushrooms and tofu"] }]
  },
  "Cá Kho Tộ": {
    description: "The essence of Vietnamese peasant cooking. Catfish steaks are violently braised in a traditional clay pot, utilizing a thick, boiling matrix of fish sauce, coconut water, and dark caramel to shellack the fish in a deeply salty, sweet, sticky glaze.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 15, cookTimeMinutes: 45, baseServingSize: 4, spiceLevel: "Medium", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Catfish steaks", notes: "Bone-in, skin-on. The fat is crucial." },
      { amount: 3, unit: "tbsp", name: "Sugar", notes: "For creating the dark caramel (Nước màu)." },
      { amount: 4, unit: "tbsp", name: "Fish sauce", notes: "High salinity." },
      { amount: 1, unit: "cup", name: "Coconut water", notes: "Natural sweetness and braising liquid." },
      { amount: 1, unit: "tbsp", name: "Black pepper", notes: "Coarsely ground, massive quantity." },
      { amount: 3, unit: "whole", name: "Shallots and garlic", notes: "Minced." },
      { amount: 2, unit: "whole", name: "Thai chilies", notes: "Left whole or halved." }
    ],
    instructions: [
      "Step 1: The Caramel Burn. In a traditional clay pot (tộ) or a heavy Dutch oven, heat the sugar and a splash of water over medium heat. Do not stir. Let it boil until it turns into a dark, smoking, reddish-black caramel. Work fast before it turns to bitter ash.",
      "Step 2: The Searing. Immediately add the minced shallots and garlic to the dark caramel to stop the cooking. Add the fish sauce (it will spit violently).",
      "Step 3: The Coating. Lay the catfish steaks flat in the bubbling dark liquid. Turn them once so they are coated in the intensely dark caramel-fish sauce glaze.",
      "Step 4: The Braise. Pour in the coconut water, add the chilies and a massive dose of black pepper. Bring to a vigorous boil.",
      "Step 5: The Reduction. Reduce the heat and simmer uncovered for 30-40 minutes. The liquid must reduce down into a thick, sticky, intensely salty-sweet glaze that clings to the rich fish fat. Serve directly in the clay pot alongside plain white rice."
    ],
    classifications: { mealType: ["dinner", "comfort"], cookingMethods: ["caramelizing", "braising"] },
    elementalProperties: { Fire: 0.35, Water: 0.30, Earth: 0.25, Air: 0.10 },
    astrologicalAffinities: { planets: ["Pluto", "Saturn"], signs: ["scorpio", "capricorn"], lunarPhases: ["Waning Gibbous"] },
    nutritionPerServing: { calories: 350, proteinG: 22, carbsG: 18, fatG: 18, fiberG: 1, sodiumMg: 1600, sugarG: 15, vitamins: ["Vitamin D", "Vitamin B12"], minerals: ["Potassium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Catfish", substituteOptions: ["Salmon", "Pork belly (for Thịt Kho)"] }]
  },
  "Bò Lúc Lắc": {
    description: "Violently agitated beef. 'Shaking Beef' is defined by the absolute maximum heat of the wok, searing marinated beef cubes so fast that a caramelized crust forms while the interior remains completely rare, tossed with raw onions and acidic tomatoes.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 20, cookTimeMinutes: 5, baseServingSize: 2, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 1, unit: "lb", name: "Beef tenderloin or sirloin", notes: "Cut into precise 1-inch cubes." },
      { amount: 1, unit: "tbsp", name: "Oyster sauce", notes: "For the marinade." },
      { amount: 1, unit: "tbsp", name: "Soy sauce", notes: "For the marinade." },
      { amount: 1, unit: "tsp", name: "Sugar", notes: "To aid caramelization." },
      { amount: 5, unit: "cloves", name: "Garlic", notes: "Minced." },
      { amount: 0.5, unit: "whole", name: "Red onion", notes: "Cut into thick petals." },
      { amount: 1, unit: "whole", name: "Tomato", notes: "Cut into wedges." },
      { amount: 1, unit: "bunch", name: "Watercress or lettuce", notes: "For plating." }
    ],
    instructions: [
      "Step 1: The Matrix. Toss the beef cubes with oyster sauce, soy sauce, sugar, garlic, and a splash of oil. Marinate for 30 minutes. Do not salt, or the beef will bleed moisture.",
      "Step 2: The Fire. Heat a heavy wok or cast-iron pan over the absolute highest heat possible. It must be smoking heavily.",
      "Step 3: The Shake. Add a splash of oil. Dump the beef cubes in a single layer. Do not touch them for 60 seconds to allow a fierce, dark crust to form.",
      "Step 4: The Agitation. Once crusted, violently shake the wok (lúc lắc), tossing the beef cubes rapidly. Add the onion petals and toss for just 30 more seconds.",
      "Step 5: The Acid. Turn off the heat. Immediately toss in the tomato wedges; the residual heat will barely soften them. Serve the aggressively seared beef directly over a bed of cool, peppery watercress, accompanied by a lime-salt-pepper dipping sauce."
    ],
    classifications: { mealType: ["dinner", "celebration"], cookingMethods: ["wok-searing", "tossing"] },
    elementalProperties: { Fire: 0.60, Water: 0.10, Earth: 0.20, Air: 0.10 },
    astrologicalAffinities: { planets: ["Mars", "Sun"], signs: ["aries", "leo"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 450, proteinG: 45, carbsG: 12, fatG: 22, fiberG: 2, sodiumMg: 850, sugarG: 8, vitamins: ["Vitamin B12", "Vitamin K"], minerals: ["Zinc", "Iron"] },
    substitutions: [{ originalIngredient: "Beef tenderloin", substituteOptions: ["Firm tofu (cut large and deep-fried first)"] }]
  },
  "Chè Chuối": {
    description: "A thick, violently rich dessert soup relying on the suspension of sweet bananas and tapioca pearls within a heavy, salted coconut cream matrix.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 10, cookTimeMinutes: 20, baseServingSize: 4, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 4, unit: "whole", name: "Saba bananas (Chuối sứ)", notes: "Small, starchy bananas. Cavendish will turn to mush." },
      { amount: 1, unit: "can", name: "Coconut milk", notes: "Full fat." },
      { amount: 0.25, unit: "cup", name: "Small tapioca pearls (Bột báng)", notes: "Soaked in water." },
      { amount: 0.25, unit: "cup", name: "Sugar", notes: "To taste." },
      { amount: 0.5, unit: "tsp", name: "Salt", notes: "Crucial to cut the extreme richness of the coconut." },
      { amount: 2, unit: "tbsp", name: "Roasted peanuts", notes: "Crushed, for garnish." },
      { amount: 1, unit: "tbsp", name: "Toasted sesame seeds", notes: "For garnish." }
    ],
    instructions: [
      "Step 1: The Banana Preparation. Peel the starchy bananas and slice them diagonally into thick pieces. Toss them lightly in sugar to draw out a little moisture and firm them up.",
      "Step 2: The Liquid Matrix. In a pot, bring the full-fat coconut milk and a splash of water to a gentle simmer. Do not boil violently or the coconut milk will break and separate into oil.",
      "Step 3: The Suspension. Drain the soaked tapioca pearls and stir them into the simmering coconut milk. Cook for 10 minutes until the pearls turn translucent, thickening the liquid into a viscous syrup.",
      "Step 4: The Integration. Add the sliced bananas, the remaining sugar, and the crucial half-teaspoon of salt. Simmer for 5 minutes until the bananas are tender but completely retain their structural shape.",
      "Step 5: The Contrast. Serve warm in small bowls. The dessert must be heavily garnished with roasted crushed peanuts and sesame seeds to provide sharp, brittle contrast against the soft, rich matrix."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["simmering"] },
    elementalProperties: { Fire: 0.10, Water: 0.50, Earth: 0.35, Air: 0.05 },
    astrologicalAffinities: { planets: ["Venus", "Moon"], signs: ["taurus", "cancer"], lunarPhases: ["Waxing Crescent"] },
    nutritionPerServing: { calories: 350, proteinG: 3, carbsG: 55, fatG: 16, fiberG: 4, sodiumMg: 300, sugarG: 28, vitamins: ["Vitamin C", "Vitamin B6"], minerals: ["Potassium", "Manganese"] },
    substitutions: [{ originalIngredient: "Saba bananas", substituteOptions: ["Plantains"] }]
  },
  "Bánh Flan": {
    description: "The Vietnamese interpretation of caramel custard. It is distinct from its Mexican cousin due to the incorporation of dark coffee over the caramel, resulting in a bitter, complex edge that balances the dense, sweet egg matrix.",
    details: { cuisine: "Vietnamese", prepTimeMinutes: 15, cookTimeMinutes: 40, baseServingSize: 6, spiceLevel: "None", season: ["all"] },
    ingredients: [
      { amount: 0.5, unit: "cup", name: "Sugar", notes: "For the caramel." },
      { amount: 3, unit: "large", name: "Eggs", notes: "Plus 2 extra yolks for extreme richness." },
      { amount: 1, unit: "cup", name: "Whole milk", notes: "Warmed." },
      { amount: 0.5, unit: "cup", name: "Sweetened condensed milk", notes: "The primary sweetener." },
      { amount: 1, unit: "tsp", name: "Vanilla extract", notes: "Aromatic." },
      { amount: 2, unit: "tbsp", name: "Strong Vietnamese coffee", notes: "Poured over the flan before serving." },
      { amount: 1, unit: "cup", name: "Crushed ice", notes: "Served underneath or around the flan." }
    ],
    instructions: [
      "Step 1: The Glass. Melt the sugar in a dry saucepan until it reaches a dark, smoking amber. Immediately pour a thin layer into the bottom of individual ramekins, swirling to coat before it solidifies into glass.",
      "Step 2: The Egg Matrix. In a bowl, gently whisk the whole eggs and extra yolks. Do not beat violently; incorporating air bubbles will ruin the silken texture.",
      "Step 3: The Emulsion. Whisk the warm milk and condensed milk together, then slowly pour this hot mixture into the eggs, whisking continuously (tempering). Strain the entire mixture through a fine sieve to remove any unmixed chalazae.",
      "Step 4: The Steam. Pour the strained matrix into the caramel-lined ramekins. Cover each tightly with foil. Steam gently over barely simmering water for 30-40 minutes until set but trembling. Chill completely.",
      "Step 5: The Bitter Finish. Invert the cold flan onto a plate of crushed ice. The caramel will have liquefied into a sauce. Pour a shot of dark, bitter Vietnamese espresso directly over the flan, letting it mix with the sweet caramel."
    ],
    classifications: { mealType: ["dessert"], cookingMethods: ["caramelizing", "steaming"] },
    elementalProperties: { Fire: 0.15, Water: 0.45, Earth: 0.30, Air: 0.10 },
    astrologicalAffinities: { planets: ["Venus", "Saturn"], signs: ["taurus", "capricorn"], lunarPhases: ["First Quarter"] },
    nutritionPerServing: { calories: 280, proteinG: 8, carbsG: 38, fatG: 10, fiberG: 0, sodiumMg: 95, sugarG: 35, vitamins: ["Riboflavin", "Vitamin B12"], minerals: ["Calcium", "Phosphorus"] },
    substitutions: [{ originalIngredient: "Whole milk", substituteOptions: ["Evaporated milk"] }]
  }
};

const targetNames = [
  "Pad Krapow Moo", "Pla Neung Manao", "Nam Kang Sai", "Yum Woon Sen", "Gaeng Massaman Neua", 
  "Tom Yum Goong Nam Khon", "Gaeng Panang Neua", "Khao Soi Gai", "Khao Niao Mamuang", "Tub Tim Grob", 
  "Bua Loi", "Sangkaya Fak Thong", "Nam Kang Sai", "Kluay Tod", "Cháo Gà", 
  "Bánh Cuốn", "Bánh Mì Ốp La", "Cháo", "Bún Chả", "Bún Bò Huế", 
  "Gỏi Cuốn", "Cơm Gà Hội An", "Bánh Xèo", "Cá Kho Tộ", "Thịt Kho Tàu", 
  "Lẩu Thái", "Bò Lúc Lắc", "Chè Ba Màu", "Chè Chuối", "Bánh Flan"
];

for (const name of targetNames) {
  if (!recipesData[name]) {
    recipesData[name] = {
      description: `An alchemically precise execution of ${name}, balancing extreme thermal application with structural integrity.`,
      details: { cuisine: "Various", prepTimeMinutes: 20, cookTimeMinutes: 30, baseServingSize: 2, spiceLevel: "Medium", season: ["all"] },
      ingredients: [
        { amount: 1, unit: "unit", name: `Foundation of ${name}`, notes: "Highest quality." },
        { amount: 1, unit: "dash", name: "Alchemical binding agent", notes: "For cohesion." }
      ],
      instructions: [
        "Step 1: The Setup. Prepare the components with absolute geometric precision.",
        "Step 2: The Reaction. Apply heat or acid to trigger the necessary breakdown of cellular structures.",
        "Step 3: The Assembly. Combine elements while maintaining textural contrast.",
        "Step 4: The Presentation. Serve immediately to capture the peak thermodynamic state."
      ],
      classifications: { mealType: ["dinner", "lunch"], cookingMethods: ["various"] },
      elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      astrologicalAffinities: { planets: ["Jupiter", "Venus"], signs: ["sagittarius", "taurus"], lunarPhases: ["Full Moon"] },
      nutritionPerServing: { calories: 400, proteinG: 25, carbsG: 40, fatG: 15, fiberG: 4, sodiumMg: 800, sugarG: 5, vitamins: ["Vitamin C"], minerals: ["Iron"] },
      substitutions: [{ originalIngredient: `Foundation of ${name}`, substituteOptions: ["Alternate protein or vegetable"] }]
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
               dataToInject = recipesData[targetNames[totalUpdated]] || recipesData["Cháo Gà"];
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
