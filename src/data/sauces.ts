import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties, ThermodynamicProperties } from "@/types/celestial";

export interface Sauce {
  name: string;
  description: string;
  base: string;
  keyIngredients: string[];
  culinaryUses: string[];
  variants?: string[];
  elementalProperties: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  astrologicalInfluences: string[];
  seasonality: string;
  preparationNotes?: string;
  technicalTips?: string;
  cuisine?: string;
  // Enhanced properties
  ingredients?: string[];
  preparationSteps?: string[];
  storageInstructions?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  yield?: string;
}

export interface SauceRecommendation {
  forProtein: Record<string, string[]>;
  forVegetable: Record<string, string[]>;
  forCookingMethod: Record<string, string[]>;
  byAstrological: Record<string, string[]>;
  byRegion: Record<string, string[]>;
  byDietary: Record<string, string[]>;
}

// Italian sauces
export const italianSauces: Record<string, Sauce> = {
  marinara: {
    name: "Marinara",
    description:
      "Simple tomato sauce with garlic, olive oil and herbs, perfect for pasta, pizza and dipping. Authentic marinara balances the acidity of tomatoes with the aromatics of herbs and garlic.",
    base: "tomato",
    keyIngredients: ["tomatoes", "garlic", "olive oil", "basil", "oregano"],
    culinaryUses: [
      "pasta sauce",
      "pizza base",
      "dipping sauce",
      "casserole base",
    ],
    variants: ["Arrabbiata", "Puttanesca", "Alla Norma"],
    elementalProperties: {
      Fire: 0.4,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.1,
    },
    alchemicalProperties: { Spirit: 3.5, Essence: 4.2, Matter: 3.8, Substance: 3.5 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.25, reactivity: 2.1, gregsEnergy: -0.6 },
    astrologicalInfluences: ["Mars", "Sun", "leo"],
    seasonality: "all",
    preparationNotes:
      "Best when made with San Marzano tomatoes for authentic flavor",
    technicalTips: "Simmer gently to maintain brightness of flavor",
    cuisine: "Italian",
    ingredients: [
      "2 lbs (900g) whole peeled tomatoes, preferably San Marzano",
      "4 cloves garlic, minced",
      "1/4 cup extra virgin olive oil",
      "2 tbsp fresh basil, chopped",
      "1 tbsp dried oregano",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "1 small onion, finely diced (optional)",
      "1 pinch red pepper flakes (optional)",
    ],
    preparationSteps: [
      "Heat olive oil in a large saucepan over medium heat.",
      "Add minced garlic (and onion if using) and sauté until fragrant but not browned, about 1-2 minutes.",
      "If using red pepper flakes, add them with the garlic.",
      "Pour in the tomatoes with their juices, crushing them with your hands or a potato masher as you add them.",
      "Add salt, pepper, and dried oregano.",
      "Bring to a gentle simmer and reduce heat to low.",
      "Cook uncovered, stirring occasionally, for 25-30 minutes until slightly thickened.",
      "Remove from heat and stir in fresh basil.",
      "Taste and adjust seasoning if necessary.",
    ],
    storageInstructions:
      "Refrigerate for up to 5 days in an airtight container. Can be frozen for up to 3 months.",
    prepTime: "10 minutes",
    cookTime: "30 minutes",
    difficulty: "Easy",
    yield: "Makes about 3 cups",
  },
  pesto: {
    name: "Pesto alla Genovese",
    description:
      "Fresh basil sauce with pine nuts, garlic, Parmesan and olive oil. A vibrant, uncooked sauce that brings bright, herbaceous flavors to any dish.",
    base: "herb",
    keyIngredients: [
      "basil leaves",
      "pine nuts",
      "garlic",
      "Parmigiano-Reggiano",
      "Pecorino",
      "olive oil",
    ],
    culinaryUses: [
      "pasta sauce",
      "sandwich spread",
      "marinade",
      "flavor enhancer",
    ],
    variants: ["Red pesto", "Pesto alla Siciliana", "Pesto alla Trapanese"],
    elementalProperties: {
      Air: 0.4,
      Earth: 0.3,
      Fire: 0.2,
      Water: 0.1,
    },
    alchemicalProperties: { Spirit: 4.5, Essence: 5.0, Matter: 3.0, Substance: 3.2 },
    thermodynamicProperties: { heat: 0.02, entropy: 0.35, reactivity: 2.8, gregsEnergy: -0.5 },
    astrologicalInfluences: ["Mercury", "Venus", "gemini"],
    seasonality: "summer",
    preparationNotes:
      "Traditionally made in a marble mortar with wooden pestle",
    technicalTips: "Blanch basil briefly to preserve color if making ahead",
    cuisine: "Italian",
    ingredients: [
      "2 cups (50g) fresh basil leaves, packed",
      "1/3 cup (50g) pine nuts, lightly toasted",
      "2 cloves garlic, peeled",
      "1/2 cup (50g) Parmigiano-Reggiano, freshly grated",
      "2 tbsp Pecorino Romano, freshly grated",
      "1/2 cup extra virgin olive oil",
      "1/4 tsp salt",
      "1/8 tsp freshly ground black pepper",
    ],
    preparationSteps: [
      "If using a mortar and pestle (traditional method): Add garlic and salt, pound until creamy. Add pine nuts and work into a paste. Add basil leaves in small batches, grinding until smooth. Mix in cheeses, then slowly drizzle in olive oil while mixing.",
      "If using a food, processor: Pulse pine nuts and garlic until coarsely chopped. Add basil and pulse again. Add cheeses and pulse to combine. With processor running, slowly drizzle in olive oil until desired consistency is reached.",
      "Season with salt and pepper to taste.",
      "If not using immediately, cover the surface directly with plastic wrap or a thin layer of olive oil to prevent oxidation.",
    ],
    storageInstructions:
      "Refrigerate for up to 3 days with a thin layer of olive oil on top to prevent browning. Can be frozen in ice cube trays for up to 3 months.",
    prepTime: "15 minutes",
    cookTime: "0 minutes",
    difficulty: "Easy",
    yield: "Makes about 1 cup",
  },
  carbonara: {
    name: "Carbonara",
    description:
      "Silky sauce of eggs, hard cheese, cured pork and black pepper. A rich, creamy sauce that relies on the emulsion of eggs and cheese with pasta cooking water rather than cream.",
    base: "egg",
    keyIngredients: ["eggs", "Pecorino Romano", "guanciale", "black pepper"],
    culinaryUses: ["pasta sauce", "sauce for gnocchi", "savory custard base"],
    variants: [
      "Carbonara with pancetta",
      "Lighter carbonara with less egg yolks",
      "Vegetarian carbonara",
    ],
    elementalProperties: {
      Earth: 0.4,
      Air: 0.3,
      Fire: 0.2,
      Water: 0.1,
    },
    alchemicalProperties: { Spirit: 3.2, Essence: 4.8, Matter: 5.5, Substance: 4.5 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.20, reactivity: 1.8, gregsEnergy: -0.7 },
    astrologicalInfluences: ["Jupiter", "Mars", "aries"],
    seasonality: "all",
    preparationNotes:
      "Never add cream - authentic carbonara is creamy from eggs alone",
    technicalTips:
      "Temper eggs carefully to prevent scrambling, use pasta water to adjust consistency",
    cuisine: "Italian",
    ingredients: [
      "4 large egg yolksat room temperature",
      "2 large whole eggsat room temperature",
      "1 cup (100g) Pecorino Romano, freshly grated",
      "1/4 cup (25g) Parmigiano-Reggiano, freshly grated (optional)",
      "4 oz (115g) guanciale, diced (can substitute pancetta)",
      "2 tsp freshly ground black pepper, plus more to taste",
      "1/4 cup pasta cooking water, reserved",
      "1 lb (450g) spaghetti or bucatini",
    ],
    preparationSteps: [
      "In a medium bowl, whisk together egg yolks, whole eggs, Pecorino Romano, Parmigiano (if using), and black pepper. Set aside.",
      "In a large skillet over medium heat, cook the diced guanciale until the fat renders and meat is crispy but not burnt, about 8-10 minutes.",
      "Meanwhile, cook pasta in well-salted water according to package instructions until al dente.",
      "Turn off heat under the skillet with guanciale. Remove about 1/2 cup of the pasta cooking water before draining.",
      "Working quickly, add drained pasta to the skillet with guanciale and toss to coat in the rendered fat.",
      "Allow pasta to cool for 1 minute (to prevent scrambling the eggs).",
      "Add 1/4 cup of the reserved pasta water to the egg mixture and whisk quickly.",
      "Pour the egg mixture over the pasta and toss vigorously with tongs until a creamy sauce forms. If too thick, add more pasta water 1 tablespoon at a time.",
      "Serve immediately with additional grated cheese and black pepper on top.",
    ],
    storageInstructions:
      "Carbonara is best eaten immediately after preparation. Not recommended for storage as the sauce will solidify when cold and may separate when reheated.",
    prepTime: "15 minutes",
    cookTime: "15 minutes",
    difficulty: "Medium",
    yield: "Serves 4",
  },
  ragu: {
    name: "Ragù alla Bolognese",
    description:
      "Rich, slow-cooked meat sauce from Bologna. A deep, complex sauce that develops flavor over hours of gentle simmering, with meat as the star ingredient rather than tomatoes.",
    base: "meat",
    keyIngredients: [
      "beef",
      "pork",
      "soffritto",
      "tomato paste",
      "wine",
      "milk",
    ],
    culinaryUses: [
      "pasta sauce",
      "lasagna filling",
      "polenta topping",
      "stuffed pasta filling",
    ],
    variants: [
      "Ragù Napoletano",
      "White ragù",
      "Wild boar ragù",
      "Vegetarian mushroom ragù",
    ],
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.1,
      Air: 0.1,
    },
    alchemicalProperties: { Spirit: 3.0, Essence: 4.5, Matter: 6.0, Substance: 5.0 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.15, reactivity: 1.5, gregsEnergy: -0.9 },
    astrologicalInfluences: ["Saturn", "Mars", "taurus"],
    seasonality: "autumn, winter",
    preparationNotes:
      "True Bolognese takes hours of gentle simmering for depth of flavor",
    technicalTips:
      "Add milk toward the end of cooking for authentic richness and tenderness",
    cuisine: "Italian",
    ingredients: [
      "1 lb (450g) ground beef (80/20 lean to fat ratio)",
      "1/2 lb (225g) ground pork",
      "4 oz (115g) pancetta, finely diced",
      "1 large onion, finely diced",
      "2 carrots, finely diced",
      "2 celery stalks, finely diced",
      "4 cloves garlic, minced",
      "3 tbsp tomato paste",
      "1 cup dry red wine",
      "2 cups beef stock",
      "1 cup whole milk",
      "1 bay leaf",
      "1/4 tsp grated nutmeg",
      "Salt and pepper to taste",
      "2 tbsp olive oil for sautéing",
    ],
    preparationSteps: [
      "Heat olive oil in a large, heavy-bottomed pot or Dutch oven over medium heat.",
      "Add pancetta and cook until fat renders, about 5 minutes.",
      "Add onion, carrot, and celery (soffritto) and sauté until softened but not browned, about 5-7 minutes.",
      "Add garlic and cook for another minute until fragrant.",
      "Increase heat to medium-high and add ground beef and pork. Break up the meat with a wooden spoon and cook until no longer pink, about 8-10 minutes.",
      "Add tomato paste and cook, stirring constantly, for 2-3 minutes until it darkens slightly.",
      "Pour in red wine and scrape up any browned bits from the bottom of the pot. Allow wine to reduce by half, about A-5 minutes.",
      "Add beef stock, bay leaf, and a generous pinch of salt and pepper. Bring to a boil, then reduce heat to the lowest setting.",
      "Partially cover and simmer very gently, stirring occasionally, for at least 2 hours (3-4 hours is better).",
      "In the final 30 minutes of cooking, stir in the milk and grated nutmeg.",
      "Continue to simmer uncovered until the sauce reaches your desired consistency.",
      "Taste and adjust seasoning with salt and pepper before serving.",
    ],
    storageInstructions:
      "Refrigerate for up to 5 days. Freezes extremely well for up to 3 months. The flavor often improves after a day in the refrigerator.",
    prepTime: "30 minutes",
    cookTime: "3-4 hours",
    difficulty: "Medium",
    yield: "Makes about 6 cups (enough for 8-10 servings)",
  },
  bechamel: {
    name: "Besciamella",
    description:
      "Classic white sauce made from roux and milk. A silky, versatile mother sauce that forms the base of countless dishes, from lasagna to gratins.",
    base: "dairy",
    keyIngredients: ["butter", "flour", "milk", "nutmeg", "bay leaf"],
    culinaryUses: [
      "lasagna layer",
      "cannelloni filling base",
      "vegetable gratin",
      "creamed spinach",
    ],
    variants: ["Mornay sauce", "Soubise", "Infused besciamella"],
    elementalProperties: {
      Water: 0.4,
      Earth: 0.4,
      Air: 0.1,
      Fire: 0.1,
    },
    alchemicalProperties: { Spirit: 2.5, Essence: 3.5, Matter: 4.5, Substance: 5.5 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.10, reactivity: 1.2, gregsEnergy: -0.4 },
    astrologicalInfluences: ["Moon", "Venus", "cancer"],
    seasonality: "all",
    preparationNotes:
      "For silky texture, add hot milk to roux gradually while whisking constantly",
    technicalTips:
      "Infuse milk with bay leaf, onion, and clove before making sauce for depth of flavor",
    cuisine: "Italian",
    ingredients: [
      "5 tbsp (70g) unsalted butter",
      "4 tbsp (30g) all-purpose flour",
      "4 cups (950ml) whole milk",
      "1 bay leaf",
      "1/4 onion, peeled",
      "1 whole clove",
      "1/4 tsp grated nutmeg",
      "1 tsp salt",
      "1/4 tsp white pepper",
    ],
    preparationSteps: [
      "In a medium saucepan, combine milk, bay leaf, onion (with clove stuck into it), and warm over medium-low heat until steaming but not boiling. Turn off heat and let infuse for 15 minutes.",
      "Strain the infused milk into a pitcher or bowl and discard the solids.",
      "In a large saucepan, melt butter over medium-low heat.",
      "Add flour and whisk continuously until well combined and slightly golden (a blonde roux), about 2-3 minutes.",
      "Slowly add the warm infused milk, about 1/2 cup at a time, whisking constantly to prevent lumps. Wait until each addition is fully incorporated before adding more.",
      "Once all milk is added, continue cooking over medium-low heat, whisking frequently, until the sauce thickens enough to coat the back of a wooden spoon, about 8-10 minutes.",
      "Add nutmeg, salt, and white pepper. Taste and adjust seasoning if needed.",
      "For a silkier texture, strain the finished sauce through a fine-mesh sieve.",
    ],
    storageInstructions:
      "Press plastic wrap directly onto the surface to prevent a skin from forming. Refrigerate for up to 3 days. Reheat gently, whisking to restore smooth consistency.",
    prepTime: "5 minutes",
    cookTime: "25 minutes",
    difficulty: "Medium",
    yield: "Makes about 4 cups",
  },
  arrabbiata: {
    name: "Arrabbiata",
    description:
      "Spicy tomato sauce with garlic and chili peppers. The name means 'angry' in Italian, referring to the fiery heat that distinguishes this bold sauce.",
    base: "tomato",
    keyIngredients: [
      "tomatoes",
      "garlic",
      "chili peppers",
      "olive oil",
      "parsley",
    ],
    culinaryUses: [
      "pasta sauce",
      "pizza topping",
      "protein topping",
      "dipping sauce",
    ],
    elementalProperties: {
      Fire: 0.7,
      Earth: 0.2,
      Water: 0.1,
      Air: 0.0,
    },
    alchemicalProperties: { Spirit: 4.8, Essence: 4.0, Matter: 3.5, Substance: 3.0 },
    thermodynamicProperties: { heat: 0.12, entropy: 0.30, reactivity: 3.5, gregsEnergy: -0.8 },
    astrologicalInfluences: ["Mars", "Sun", "Aries"],
    seasonality: "all",
    preparationNotes:
      "The name means 'angry' in Italian, referring to the spiciness",
    technicalTips:
      "Add chili at the beginning with garlic for more heat throughout",
    cuisine: "Italian",
    ingredients: [
      "2 lbs (900g) whole peeled tomatoes, preferably San Marzano",
      "1/4 cup (60ml) extra virgin olive oil",
      "4-6 cloves garlic, thinly sliced",
      "2-4 fresh red chili peppers, deseeded and finely chopped (or 1-2 tsp red pepper flakes)",
      "1 tsp salt",
      "1/4 cup fresh parsley, chopped",
      "1 tsp dried oregano (optional)",
      "1 tbsp tomato paste (optional, for deeper flavor)",
    ],
    preparationSteps: [
      "Heat olive oil in a large saucepan over medium heat.",
      "Add sliced garlic and chili peppers (or red pepper flakes). Sauté for 1-2 minutes until fragrant but not browned.",
      "If using tomato paste, add it now and cook for 30 seconds, stirring constantly.",
      "Add the tomatoes, crushing them with your hands or a potato masher as you add them to the pan.",
      "Add salt and dried oregano if using.",
      "Bring to a simmer, then reduce heat to medium-low and cook uncovered for 20-25 minutes, stirring occasionally.",
      "The sauce should reduce and thicken slightly. For a smoother sauce, use an immersion blender or let cool slightly and transfer to a blender.",
      "Stir in fresh parsley just before serving.",
      "Taste and adjust seasoning if necessary.",
    ],
    storageInstructions:
      "Refrigerate for up to 5 days in an airtight container. Can be frozen for up to 3 months.",
    prepTime: "10 minutes",
    cookTime: "25 minutes",
    difficulty: "Easy",
    yield: "Makes about 3 cups",
  },
};

// Mexican sauces
export const mexicanSauces: Record<string, Sauce> = {
  mole: {
    name: "Mole Poblano",
    description:
      "Complex sauce combining chilis, chocolate, nuts, and spices. This iconic Mexican sauce balances heat, sweetness, and richness with dozens of ingredients meticulously blended together.",
    base: "chili",
    keyIngredients: ["dried chilies", "chocolate", "nuts", "seeds", "spices"],
    culinaryUses: ["protein topping", "enchilada sauce", "tamale filling"],
    variants: ["Mole Negro", "Mole Verde", "Mole Amarillo", "Mole Colorado"],
    elementalProperties: {
      Earth: 0.4,
      Fire: 0.4,
      Water: 0.1,
      Air: 0.1,
    },
    alchemicalProperties: { Spirit: 4.5, Essence: 6.5, Matter: 5.0, Substance: 4.5 },
    thermodynamicProperties: { heat: 0.09, entropy: 0.45, reactivity: 3.0, gregsEnergy: -1.2 },
    astrologicalInfluences: ["Mars", "Pluto", "Scorpio"],
    seasonality: "all",
    cuisine: "Mexican",
    ingredients: [
      "6 dried ancho chilies, stemmed and deseeded",
      "4 dried guajillo chilies, stemmed and deseeded",
      "2 dried chipotle chilies, stemmed and deseeded",
      "1/4 cup (60ml) vegetable oil, divided",
      "1 medium onion, chopped",
      "3 cloves garlic, minced",
      "2 roma tomatoes, chopped",
      "1/4 cup (30g) pumpkin seeds",
      "1/4 cup (30g) sesame seeds",
      "1/4 cup (30g) almonds",
      "1/4 cup (30g) raisins",
      "1 corn tortilla, torn into pieces",
      "1/4 tsp, each: ground cinnamon, ground cloves, ground coriander",
      "1/2 tsp, each: ground cumin, dried oregano",
      "2 cups (475ml) chicken broth",
      "2 oz (60g) dark chocolate (70% cocoa), chopped",
      "1 tbsp brown sugar",
      "Salt to taste",
    ],
    preparationSteps: [
      "Heat a large skillet over medium heat. Toast the dried chilies for 2-3 minutes, turning frequently until fragrant but not burnt. Transfer to a bowl and cover with hot water. Let soak for 30 minutes.",
      "In the same skillet heat 2 tablespoons of oil. Add onions and cook until translucent, about 5 minutes. Add garlic and cook for 1 minute more.",
      "Add tomatoes and cook until softened, about 5 minutes. Transfer to a bowl.",
      "In the same skillet toast pumpkin seeds and sesame seeds until golden, about 2-3 minutes. Add to the bowl with tomatoes.",
      "Toast almonds in the skillet until fragrant, about 3 minutes. Add to the same bowl.",
      "Add raisins and torn tortilla to the bowl.",
      "Drain the soaked chilies, reserving 1 cup of the soaking liquid.",
      "In a blender, combine the soaked chilies, the tomato-seed-nut mixture, spices, and enough reserved soaking liquid to blend smoothly. Work in batches if needed.",
      "Heat remaining oil in a large pot. Carefully pour in the blended sauce (it may splatter). Cook, stirring constantly, for 5 minutes.",
      "Add chicken broth gradually, stirring to incorporate. Bring to a simmer.",
      "Add chocolate and sugar, stirring until melted and incorporated.",
      "Reduce heat to low and simmer, partially covered, for 30-45 minutes, stirring occasionally, until thickened.",
      "Season with salt to taste. For a smoother sauce, blend again or strain through a fine-mesh sieve.",
    ],
    storageInstructions:
      "Refrigerate for up to 5 days or freeze for up to 3 months. The flavor actually improves after a day in the refrigerator as the complex flavors meld together.",
    prepTime: "45 minutes",
    cookTime: "1 hour",
    difficulty: "Complex",
    yield: "Makes about 4 cups",
  },
  salsa: {
    name: "Salsa Roja",
    description:
      "Fresh or cooked tomato-based sauce with chilies and aromatics. A vibrant, versatile sauce that can range from mild to fiery depending on the chilies used.",
    base: "tomato",
    keyIngredients: ["tomatoes", "chilies", "onion", "cilantro", "lime"],
    culinaryUses: ["dip", "topping", "marinade", "cooking sauce"],
    variants: ["Salsa Verde", "Pico de Gallo", "Salsa Taquera"],
    elementalProperties: {
      Fire: 0.5,
      Water: 0.3,
      Earth: 0.1,
      Air: 0.1,
    },
    alchemicalProperties: { Spirit: 4.0, Essence: 4.5, Matter: 2.5, Substance: 3.5 },
    thermodynamicProperties: { heat: 0.10, entropy: 0.35, reactivity: 3.2, gregsEnergy: -0.6 },
    astrologicalInfluences: ["Mars", "Sun", "Aries"],
    seasonality: "all",
    cuisine: "Mexican",
    ingredients: [
      "8 medium tomatoes (about 2 lbs/900g)",
      "2-4 jalapeño or serrano chilies, stemmed (adjust for heat preference)",
      "1 medium white onion, quartered",
      "4 cloves garlic, peeled",
      "1/2 cup fresh cilantro, roughly chopped",
      "2 tbsp lime juice (about 1-2 limes)",
      "1 tsp saltor to taste",
      "1 tsp ground cumin (optional)",
      "1 tbsp vegetable oil (for roasted version)",
    ],
    preparationSteps: [
      "Fresh (Raw) Method: ",
      "Roughly chop tomatoes, chilies, and onion.",
      "Place all ingredients except cilantro and lime juice in a food processor or blender.",
      "Pulse to desired consistency - chunky or smooth.",
      "Stir in cilantro and lime juice.",
      "Adjust seasoning with salt to taste.",
      "Let sit for at least 30 minutes before serving to allow flavors to meld.",
      "",
      "Roasted Method: ",
      "Preheat oven to 450°F (230°C) or heat a comal/cast-iron skillet over medium-high heat.",
      "Place whole tomatoes, chilies, onion quarters, and garlic on a baking sheet. Drizzle with oil.",
      "Roast for 15-20 minutes, turning once, until vegetables have charred spots and tomatoes are soft.",
      "Let cool slightly, then transfer to a blender or food processor.",
      "Add cilantro, lime juice, salt, and cumin if using.",
      "Pulse to desired consistency.",
      "Adjust seasoning to taste.",
    ],
    storageInstructions:
      "Refrigerate in an airtight container for up to 1 week. Fresh salsa is best consumed within 3-4 days for optimal flavor. Not recommended for freezing as texture will change.",
    prepTime: "15 minutes",
    cookTime: "0 minutes (fresh) or 20 minutes (roasted)",
    difficulty: "Easy",
    yield: "Makes about 3 cups",
  },
};

// Asian sauces
export const asianSauces: Record<string, Sauce> = {
  thaiGreenCurry: {
    name: "Thai Green Curry Paste",
    description: "Aromatic and vibrant curry paste made with fresh green chilies, lemongrass, galangal and aromatic herbs. The foundation of Thai green curry dishes.",
    base: "herb-chili",
    keyIngredients: ["green chilies", "lemongrass", "galangal", "kaffir lime", "coriander root"],
    culinaryUses: ["curry base", "marinade", "stir-fry seasoning", "soup flavoring"],
    variants: ["Red Curry Paste", "Yellow Curry Paste", "Panang Curry Paste"],
    elementalProperties: { Fire: 0.5, Water: 0.2, Air: 0.2, Earth: 0.1 },
    alchemicalProperties: { Spirit: 4.2, Essence: 5.1, Matter: 3.5, Substance: 3.2 },
    thermodynamicProperties: { heat: 0.08, entropy: 0.35, reactivity: 3.2, gregsEnergy: -0.9 },
    astrologicalInfluences: ["Mars", "Mercury", "Leo"],
    seasonality: "all",
    cuisine: "Thai",
    ingredients: [
      "15 fresh green Thai chilies, stemmed and roughly chopped",
      "2 stalks lemongrass, tough outer layers removed, sliced",
      "1 inch (2.5cm) piece galangal or ginger, peeled and chopped",
      "1 medium shallot, roughly chopped",
      "4 cloves garlic, peeled",
      "2 tbsp coriander roots and stems, chopped",
      "6 kaffir lime leaves, deveined and chopped",
      "1 tsp coriander seeds, toasted",
      "1/2 tsp cumin seeds, toasted",
      "1/2 tsp white peppercorns",
      "1 tsp shrimp paste (omit for vegetarian version)",
      "1 tsp salt",
      "1 tbsp neutral oil to help blending",
      "2 tbsp water or as needed"
    ],
    preparationSteps: [
      "If using whole spices, toast coriander seeds, cumin seeds, and white peppercorns in a dry skillet over medium heat until fragrant, about 1-2 minutes. Let cool, then grind in a spice grinder or mortar and pestle.",
      "Traditional method (mortar and pestle): Start with the hardest ingredients - lemongrass, galangal, and kaffir lime. Pound until broken down. Add garlic, shallots, and coriander roots, and continue pounding. Add chilies and pound until a rough paste forms. Add ground spices, shrimp paste, and salt, and continue pounding until homogeneous.",
      "Food processor method: Combine all ingredients except oil in a food processor. Pulse several times, then process continuously, scraping down the sides occasionally. Add oil slowly while machine is running to help form a smooth paste. Add water 1 teaspoon at a time if needed to help blending.",
      "To use: For a basic curry, fry 2-3 tablespoons of paste in coconut milk until fragrant before adding proteins and vegetables."
    ],
    storageInstructions: "Store in an airtight container in the refrigerator for up to 2 weeks or freeze in ice cube trays for up to 3 months. Freeze small portions for easy use. Add a thin layer of oil on top of refrigerated paste to preserve freshness.",
    prepTime: "30 minutes",
    cookTime: "0 minutes",
    difficulty: "Medium",
    yield: "Makes about 1 cup of curry paste (enough for 3-4 curries)",
  },
  thaiRedCurry: {
    name: "Thai Red Curry Paste",
    description: "Deep, robust, and moderately spicy paste anchored by dried red chilies, lemongrass, and galangal.",
    base: "herb-chili",
    keyIngredients: ["dried red chilies", "lemongrass", "galangal", "shrimp paste", "coriander root"],
    culinaryUses: ["curry base", "marinade", "stir-fry seasoning", "soup flavoring"],
    elementalProperties: { Fire: 0.6, Earth: 0.2, Water: 0.1, Air: 0.1 },
    alchemicalProperties: { Spirit: 4.8, Essence: 4.2, Matter: 4.0, Substance: 3.5 },
    thermodynamicProperties: { heat: 0.09, entropy: 0.32, reactivity: 3.0, gregsEnergy: -0.85 },
    astrologicalInfluences: ["Mars", "Sun", "Aries"],
    seasonality: "all",
    cuisine: "Thai",
    ingredients: [
      "15 large dried red chilies (such as guajillo or puya), deseeded and soaked",
      "2 stalks lemongrass, tough outer layers removed, sliced",
      "1 inch (2.5cm) piece galangal, peeled and chopped",
      "2 medium shallots, roughly chopped",
      "4 cloves garlic, peeled",
      "2 tbsp coriander roots and stems, chopped",
      "4 kaffir lime leaves, deveined and chopped",
      "1 tsp coriander seeds, toasted",
      "1/2 tsp cumin seeds, toasted",
      "1 tsp white peppercorns",
      "1 tbsp shrimp paste",
      "1 tsp salt"
    ],
    preparationSteps: [
      "Soak the dried red chilies in hot water for 20 minutes until softened, then drain well.",
      "Toast the coriander and cumin seeds until fragrant, then grind into a powder with the peppercorns.",
      "Using a mortar and pestle, pound the softened chilies and salt into a coarse paste.",
      "Add the lemongrass, galangal, and kaffir lime leaves, pounding until smooth.",
      "Add the garlic, shallots, and coriander roots, continuing to pound.",
      "Finally, incorporate the ground spices and shrimp paste, pounding until a uniform, deep red paste forms.",
      "Alternatively, blend all ingredients in a food processor with a little water or oil until smooth."
    ],
    storageInstructions: "Store in an airtight container in the refrigerator for up to 2 weeks, or freeze in ice cube trays for up to 3 months.",
    prepTime: "30 minutes",
    cookTime: "0 minutes",
    difficulty: "Medium",
    yield: "Makes about 1 cup of curry paste"
  },
  thaiYellowCurry: {
    name: "Thai Yellow Curry Paste",
    description: "Mild, fragrant, and deeply savory curry paste characterized by fresh turmeric, dried spices, and a gentle heat.",
    base: "herb-spice",
    keyIngredients: ["turmeric", "curry powder", "lemongrass", "dried chilies", "shallots"],
    culinaryUses: ["curry base", "marinade for chicken/seafood", "stew base"],
    elementalProperties: { Earth: 0.5, Fire: 0.3, Air: 0.1, Water: 0.1 },
    alchemicalProperties: { Spirit: 3.8, Essence: 4.5, Matter: 4.5, Substance: 3.8 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.28, reactivity: 2.5, gregsEnergy: -0.7 },
    astrologicalInfluences: ["Jupiter", "Sun", "Taurus"],
    seasonality: "all",
    cuisine: "Thai",
    ingredients: [
      "10 large dried red chilies, deseeded and soaked",
      "1 tbsp fresh turmeric, peeled and sliced (or 2 tsp ground turmeric)",
      "1 tbsp curry powder",
      "2 stalks lemongrass, tough outer layers removed, sliced",
      "1 inch (2.5cm) piece galangal or ginger, peeled and chopped",
      "3 medium shallots, roughly chopped",
      "4 cloves garlic, peeled",
      "1 tsp coriander seeds, toasted",
      "1/2 tsp cumin seeds, toasted",
      "1 tsp shrimp paste",
      "1 tsp salt"
    ],
    preparationSteps: [
      "Soak dried chilies in hot water for 20 minutes, then drain.",
      "Toast coriander and cumin seeds, then grind into a powder.",
      "Pound chilies and salt in a mortar and pestle into a paste.",
      "Add lemongrass, galangal, and fresh turmeric, pounding until smooth.",
      "Add shallots and garlic, continuing to pound.",
      "Incorporate the ground spices, curry powder, and shrimp paste.",
      "Pound until completely integrated, or use a food processor to blend all ingredients."
    ],
    storageInstructions: "Store in an airtight container in the refrigerator for up to 2 weeks, or freeze for up to 3 months.",
    prepTime: "30 minutes",
    cookTime: "0 minutes",
    difficulty: "Medium",
    yield: "Makes about 1 cup of curry paste"
  },
  thaiPanangCurry: {
    name: "Thai Panang Curry Paste",
    description: "Rich, nutty, and mildly spicy curry paste characterized by the addition of roasted peanuts and a slightly sweeter profile.",
    base: "herb-nut",
    keyIngredients: ["dried red chilies", "peanuts", "lemongrass", "galangal", "kaffir lime"],
    culinaryUses: ["curry base (especially for beef/pork)", "thick sauces"],
    elementalProperties: { Earth: 0.4, Fire: 0.4, Water: 0.1, Air: 0.1 },
    alchemicalProperties: { Spirit: 4.0, Essence: 4.2, Matter: 4.8, Substance: 4.0 },
    thermodynamicProperties: { heat: 0.07, entropy: 0.30, reactivity: 2.8, gregsEnergy: -0.8 },
    astrologicalInfluences: ["Venus", "Mars", "Taurus"],
    seasonality: "all",
    cuisine: "Thai",
    ingredients: [
      "10 large dried red chilies, deseeded and soaked",
      "2 tbsp roasted unsalted peanuts",
      "2 stalks lemongrass, sliced",
      "1 inch (2.5cm) piece galangal, peeled and chopped",
      "2 medium shallots, roughly chopped",
      "4 cloves garlic, peeled",
      "1 tsp coriander roots, chopped",
      "2 kaffir lime leaves, very finely minced",
      "1 tsp coriander seeds, toasted",
      "1/2 tsp cumin seeds, toasted",
      "1 tsp shrimp paste",
      "1 tsp salt"
    ],
    preparationSteps: [
      "Soak dried chilies in hot water for 20 minutes; drain.",
      "Toast coriander and cumin seeds; grind into a powder. Finely crush the roasted peanuts.",
      "In a mortar and pestle, pound the chilies and salt into a paste.",
      "Add lemongrass, galangal, and kaffir lime leaves; pound until broken down.",
      "Add garlic, shallots, and coriander roots; continue pounding.",
      "Add ground spices, crushed peanuts, and shrimp paste.",
      "Pound until a thick, homogeneous paste forms (the peanuts will make it slightly coarser than red or green curry paste)."
    ],
    storageInstructions: "Refrigerate for up to 2 weeks or freeze for up to 3 months.",
    prepTime: "30 minutes",
    cookTime: "0 minutes",
    difficulty: "Medium",
    yield: "Makes about 1 cup of curry paste"
  },
  thaiMassamanCurry: {
    name: "Thai Massaman Curry Paste",
    description: "A fragrant, complex, and relatively mild curry paste featuring warm, sweet spices like cardamom, cinnamon, and cloves.",
    base: "spice",
    keyIngredients: ["dried red chilies", "cardamom", "cinnamon", "cloves", "shallots"],
    culinaryUses: ["curry base (traditionally for beef or chicken with potatoes)"],
    elementalProperties: { Earth: 0.6, Fire: 0.2, Air: 0.1, Water: 0.1 },
    alchemicalProperties: { Spirit: 3.5, Essence: 5.0, Matter: 4.6, Substance: 4.2 },
    thermodynamicProperties: { heat: 0.05, entropy: 0.25, reactivity: 2.0, gregsEnergy: -0.6 },
    astrologicalInfluences: ["Saturn", "Jupiter", "Capricorn"],
    seasonality: "all",
    cuisine: "Thai",
    ingredients: [
      "8 large dried red chilies, deseeded and soaked",
      "1 tsp coriander seeds, toasted",
      "1 tsp cumin seeds, toasted",
      "3 cardamom pods, toasted and seeded",
      "1/2 inch piece cinnamon stick, toasted",
      "3 whole cloves, toasted",
      "1/4 tsp whole nutmeg, grated",
      "2 stalks lemongrass, sliced",
      "1 inch piece galangal, chopped",
      "4 medium shallots, roasted",
      "6 cloves garlic, roasted",
      "1 tsp shrimp paste, roasted",
      "1 tsp salt"
    ],
    preparationSteps: [
      "Roast shallots and garlic (in their skins) in a dry pan or oven until soft and slightly charred. Peel them once cool.",
      "Wrap shrimp paste in aluminum foil and roast in a dry pan for 2-3 minutes until fragrant.",
      "Dry-toast coriander, cumin, cardamom seeds, cinnamon, and cloves. Grind all toasted spices (including grated nutmeg) into a fine powder.",
      "Pound soaked and drained chilies with salt in a mortar and pestle until a paste forms.",
      "Add lemongrass and galangal; pound until smooth.",
      "Add roasted shallots and garlic; pound until incorporated.",
      "Finally, stir or lightly pound in the ground spice mixture and roasted shrimp paste until fully combined."
    ],
    storageInstructions: "Refrigerate for up to 2 weeks or freeze for up to 3 months.",
    prepTime: "40 minutes",
    cookTime: "10 minutes",
    difficulty: "High",
    yield: "Makes about 1 cup of curry paste"
  }
};


// French sauces
export const frenchSauces: Record<string, Sauce> = {
  hollandaise: {
    name: "Hollandaise",
    description: "A rich, buttery, and slightly tangy emulsion of egg yolks, melted butter, and lemon juice. One of the five French mother sauces.",
    base: "egg-butter",
    keyIngredients: ["egg yolks", "butter", "lemon juice", "cayenne pepper", "salt"],
    culinaryUses: ["eggs benedict", "asparagus", "steamed vegetables", "poached fish"],
    variants: ["Béarnaise", "Choron", "Mousseline"],
    elementalProperties: { Water: 0.4, Earth: 0.4, Air: 0.1, Fire: 0.1 },
    alchemicalProperties: { Spirit: 2.5, Essence: 3.8, Matter: 4.5, Substance: 5.0 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.12, reactivity: 1.3, gregsEnergy: -0.5 },
    astrologicalInfluences: ["Venus", "Moon", "taurus"],
    seasonality: "spring",
    cuisine: "French",
    ingredients: [
      "3 large egg yolks",
      "1 tbsp lemon juice",
      "1/2 cup (115g) unsalted butter, melted and warm",
      "Pinch of cayenne pepper",
      "Pinch of salt"
    ],
    preparationSteps: [
      "Whisk egg yolks and lemon juice together in a heatproof bowl until thickened and doubled in volume.",
      "Place the bowl over a saucepan containing barely simmering water (double boiler). The water should not touch the bottom of the bowl.",
      "Continue to whisk rapidly.",
      "Slowly drizzle in the warm melted butter, whisking constantly until the sauce is thickened and emulsified.",
      "Remove from heat and whisk in cayenne and salt."
    ],
    storageInstructions: "Best used immediately. Can be kept warm in a thermos for up to an hour. Does not reheat well.",
    prepTime: "5 minutes",
    cookTime: "10 minutes",
    difficulty: "High",
    yield: "Makes about 1 cup"
  },
  espagnole: {
    name: "Sauce Espagnole",
    description: "A basic brown sauce and one of the five French mother sauces. Deep, robust, and complex, it serves as the starting point for demi-glace.",
    base: "brown-stock",
    keyIngredients: ["brown stock", "mirepoix", "brown roux", "tomato purée", "bouquet garni"],
    culinaryUses: ["base for demi-glace", "beef stews", "braised meats"],
    variants: ["Demi-glace", "Bordelaise", "Chasseur", "Robert"],
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    alchemicalProperties: { Spirit: 3.2, Essence: 4.5, Matter: 5.5, Substance: 4.8 },
    thermodynamicProperties: { heat: 0.07, entropy: 0.18, reactivity: 1.6, gregsEnergy: -0.8 },
    astrologicalInfluences: ["Saturn", "Pluto", "capricorn"],
    seasonality: "autumn, winter",
    cuisine: "French",
    ingredients: [
      "1/4 cup butter",
      "1/4 cup all-purpose flour",
      "1 cup mirepoix (diced onions, carrots, celery)",
      "1/4 cup tomato purée",
      "4 cups dark brown veal or beef stock",
      "1 bouquet garni (parsley, thyme, bay leaf)"
    ],
    preparationSteps: [
      "Melt butter in a saucepan, add mirepoix and sauté until browned.",
      "Stir in flour to make a brown roux, cooking until it smells nutty and turns a deep brown color.",
      "Whisk in the tomato purée.",
      "Gradually whisk in the brown stock to prevent lumps.",
      "Add the bouquet garni, bring to a simmer, and reduce heat.",
      "Simmer gently for 45-60 minutes, skimming the surface as needed.",
      "Strain through a fine-mesh sieve."
    ],
    storageInstructions: "Refrigerate for up to 5 days or freeze for up to 3 months.",
    prepTime: "15 minutes",
    cookTime: "1 hour",
    difficulty: "Medium",
    yield: "Makes about 2.5 cups"
  }
};

// Japanese sauces
export const japaneseSauces: Record<string, Sauce> = {
  teriyaki: {
    name: "Teriyaki Sauce",
    description: "A glossy, sweet, and savory glaze made from soy sauce, mirin, sake, and sugar. Brings deep umami and caramelization to grilled foods.",
    base: "soy-sweet",
    keyIngredients: ["soy sauce", "mirin", "sake", "sugar"],
    culinaryUses: ["glaze for grilled chicken/fish", "stir-fry sauce", "marinade"],
    variants: ["Spicy Teriyaki", "Garlic Teriyaki"],
    elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
    alchemicalProperties: { Spirit: 3.5, Essence: 4.2, Matter: 4.0, Substance: 4.5 },
    thermodynamicProperties: { heat: 0.06, entropy: 0.22, reactivity: 2.0, gregsEnergy: -0.7 },
    astrologicalInfluences: ["Sun", "Jupiter", "leo"],
    seasonality: "all",
    cuisine: "Japanese",
    ingredients: [
      "1/2 cup soy sauce",
      "1/2 cup mirin",
      "1/4 cup sake",
      "2 tbsp brown sugar or white sugar",
      "1 tsp ginger, freshly grated (optional)",
      "1 clove garlic, minced (optional)"
    ],
    preparationSteps: [
      "Combine soy sauce, mirin, sake, and sugar in a small saucepan.",
      "Add ginger and garlic if using.",
      "Bring the mixture to a boil over medium heat.",
      "Reduce heat and simmer until the sauce is reduced by half and thick enough to coat the back of a spoon.",
      "Let cool (it will thicken further as it cools)."
    ],
    storageInstructions: "Store in an airtight container in the refrigerator for up to 2-3 weeks.",
    prepTime: "5 minutes",
    cookTime: "15 minutes",
    difficulty: "Easy",
    yield: "Makes about 1/2 cup"
  },
  ponzu: {
    name: "Ponzu",
    description: "A citrus-based sauce with a tart, tangy, and umami-rich flavor profile. Refreshing and light.",
    base: "citrus-soy",
    keyIngredients: ["citrus juice (yuzu/sudachi/lemon)", "soy sauce", "mirin", "kombu", "katsuobushi"],
    culinaryUses: ["dipping sauce for hot pot (shabu-shabu)", "sashimi", "grilled meats", "salads"],
    variants: ["Ponzu Shoyu"],
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    alchemicalProperties: { Spirit: 4.5, Essence: 4.0, Matter: 2.5, Substance: 3.0 },
    thermodynamicProperties: { heat: 0.03, entropy: 0.30, reactivity: 2.5, gregsEnergy: -0.5 },
    astrologicalInfluences: ["Mercury", "Uranus", "gemini"],
    seasonality: "summer",
    cuisine: "Japanese",
    ingredients: [
      "1/2 cup soy sauce",
      "1/4 cup citrus juice (yuzu, lemon, or a mix of lemon and lime)",
      "2 tbsp mirin",
      "1 tbsp rice vinegar",
      "1 small piece of kombu (dried kelp)",
      "1/4 cup katsuobushi (bonito flakes)"
    ],
    preparationSteps: [
      "Combine all ingredients in a glass jar or bowl.",
      "Let it steep in the refrigerator for at least 24 hours (up to a few days for deeper flavor).",
      "Strain the sauce through a fine-mesh sieve, pressing lightly on the solids.",
      "Store the clear liquid."
    ],
    storageInstructions: "Store in the refrigerator for up to 1 month.",
    prepTime: "5 minutes (plus 24 hours steeping)",
    cookTime: "0 minutes",
    difficulty: "Easy",
    yield: "Makes about 1 cup"
  },
  gomaDare: {
    name: "Goma Dare (Sesame Sauce)",
    description: "A creamy, nutty, and savory-sweet dipping sauce made from ground toasted sesame seeds.",
    base: "sesame",
    keyIngredients: ["toasted sesame seeds", "soy sauce", "mirin", "rice vinegar", "sugar", "dashi"],
    culinaryUses: ["shabu-shabu dipping sauce", "cold noodle salad", "blanched vegetables"],
    elementalProperties: { Earth: 0.5, Water: 0.3, Air: 0.1, Fire: 0.1 },
    alchemicalProperties: { Spirit: 3.2, Essence: 4.5, Matter: 4.8, Substance: 4.2 },
    thermodynamicProperties: { heat: 0.04, entropy: 0.25, reactivity: 1.8, gregsEnergy: -0.6 },
    astrologicalInfluences: ["Venus", "Earth", "taurus"],
    seasonality: "all",
    cuisine: "Japanese",
    ingredients: [
      "4 tbsp white sesame seeds, toasted",
      "2 tbsp soy sauce",
      "1 tbsp rice vinegar",
      "1 tbsp mirin",
      "1 tbsp sugar",
      "1 tsp sesame oil",
      "1 tbsp dashi or water to thin"
    ],
    preparationSteps: [
      "Grind the toasted sesame seeds in a suribachi (Japanese mortar) or food processor until they release their oils and form a rough paste.",
      "Add the sugar and continue to grind.",
      "Whisk in the soy sauce, rice vinegar, mirin, and sesame oil.",
      "Add dashi or water gradually until you reach the desired consistency (it should be slightly thick but pourable)."
    ],
    storageInstructions: "Refrigerate in an airtight container for up to 1 week.",
    prepTime: "10 minutes",
    cookTime: "0 minutes",
    difficulty: "Easy",
    yield: "Makes about 1/2 cup"
  }
};

// Consolidate all sauces
export const allSauces: Record<string, Sauce> = {
  ...italianSauces,
  ...mexicanSauces,
  ...asianSauces,
  ...frenchSauces,
  ...japaneseSauces,
  // Add other cuisine sauces as they become available
};

// Sauce recommendations
export const sauceRecommendations: SauceRecommendation = {
  forProtein: {
    beef: [
      "ragù alla Bolognese",
      "sugo di carne",
      "salsa alla pizzaiola",
      "Barolo wine sauce",
      "mole",
    ],
    pork: [
      "agrodolce",
      "marsala",
      "porchetta herbs",
      "black pepper sauce",
      "salsa verde",
    ],
    chicken: ["cacciatore", "piccata", "marsala", "salt-crusted herbs", "mole"],
    fish: ["acqua pazza", "salmoriglio", "livornese", "al limone"],
    vegetarian: ["pesto", "pomodoro", "aglio e olio", "burro e salvia"],
  },
  forVegetable: {
    leafy: ["aglio e olio", "parmigiano", "lemon butter", "anchovy"],
    root: ["besciamella", "gremolata", "herbed butter", "balsamic glaze"],
    nightshades: ["marinara", "alla Norma", "sugo di pomodoro", "caponata"],
    squash: [
      "brown butter sage",
      "gorgonzola cream",
      "agrodolce",
      "walnut pesto",
    ],
    mushroom: ["porcini sauce", "marsala", "truffle oil", "white wine garlic"],
  },
  forCookingMethod: {
    grilling: ["salmoriglio", "rosemary oil", "balsamic glaze", "salsa verde"],
    baking: ["marinara", "besciamella", "pesto", "ragù"],
    frying: ["aioli", "lemon dip", "arrabiata", "garlic-herb dip"],
    braising: ["osso buco sauce", "wine reduction", "pomodoro", "cacciatora"],
    raw: ["pinzimonio", "olio nuovo", "citronette", "bagna cauda"],
  },
  byAstrological: {
    fire: [
      "arrabiata",
      "puttanesca",
      "aglio e olio with peperoncino",
      "spicy pomodoro",
      "salsa roja",
    ],
    earth: [
      "mushroom ragu",
      "tartufo",
      "carbonara",
      "ragù alla Bolognese",
      "mole",
    ],
    air: ["lemon sauces", "herb oils", "white wine sauce", "pesto"],
    water: ["seafood sauces", "acqua pazza", "clam sauce", "besciamella"],
  },
  byRegion: {
    northern: [
      "pesto alla Genovese",
      "bagna cauda",
      "fonduta",
      "ragù alla Bolognese",
    ],
    central: ["carbonara", "cacio e pepe", "amatriciana", "sugo finto"],
    southern: ["marinara", "puttanesca", "aglio e olio", "alla Norma"],
    insular: ["sarde a beccafico", "nero di seppia", "bottarga", "caponata"],
  },
  byDietary: {
    vegetarian: ["pomodoro", "pesto", "aglio e olio", "burro e salvia"],
    vegan: ["marinara", "pomodoro", "aglio e olio", "salsa verde"],
    glutenFree: [
      "salsa verde",
      "salmoriglio",
      "sugo di pomodoro",
      "lemon sauce",
    ],
    dairyFree: ["marinara", "aglio e olio", "puttanesca", "arrabbiata"],
  },
};

// Helper functions
export function getSaucesByAstrologicalInfluence(influence: string): Sauce[] {
  return Object.values(allSauces).filter((sauce) =>
    sauce.astrologicalInfluences.some(
      (infl) => infl.toLowerCase() === influence.toLowerCase(),
    ),
  );
}

export function getSaucesByElement(
  element: keyof ElementalProperties,
): Sauce[] {
  return Object.values(allSauces).filter((sauce) => {
    // Find the dominant element
    const dominantElement = Object.entries(sauce.elementalProperties).sort(
      ([, a], [, b]) => b - a,
    )[0][0];
    return dominantElement === element;
  });
}

export function getMarsInfluencedSauces(): Sauce[] {
  return getSaucesByAstrologicalInfluence("Mars");
}

const saucesExport = {
  italianSauces,
  mexicanSauces,
  asianSauces,
  frenchSauces,
  japaneseSauces,
  allSauces,
  sauceRecommendations,
  getSaucesByAstrologicalInfluence,
  getSaucesByElement,
  getMarsInfluencedSauces,
};

export default saucesExport;
