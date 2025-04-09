import type { ElementalProperties } from '@/types/alchemy';

export interface Sauce {
  name: string;
  description: string;
  base: string;
  keyIngredients: string[];
  culinaryUses: string[];
  variants?: string[];
  elementalProperties: ElementalProperties;
  astrologicalInfluences: string[];
  seasonality: string;
  preparationNotes?: string;
  technicalTips?: string;
  cuisine?: string;
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
    description: "Simple tomato sauce with garlic, olive oil and herbs",
    base: "tomato",
    keyIngredients: ["tomatoes", "garlic", "olive oil", "basil", "oregano"],
    culinaryUses: ["pasta sauce", "pizza base", "dipping sauce", "casserole base"],
    variants: ["Arrabbiata", "Puttanesca", "Alla Norma"],
    elementalProperties: {
      Fire: 0.4,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.1
    },
    astrologicalInfluences: ["Mars", "Sun", "leo"],
    seasonality: "all",
    preparationNotes: "Best when made with San Marzano tomatoes for authentic flavor",
    technicalTips: "Simmer gently to maintain brightness of flavor",
    cuisine: "Italian"
  },
  pesto: {
    name: "Pesto alla Genovese",
    description: "Fresh basil sauce with pine nuts, garlic, Parmesan and olive oil",
    base: "herb",
    keyIngredients: ["basil leaves", "pine nuts", "garlic", "Parmigiano-Reggiano", "Pecorino", "olive oil"],
    culinaryUses: ["pasta sauce", "sandwich spread", "marinade", "flavor enhancer"],
    variants: ["Red pesto", "Pesto alla Siciliana", "Pesto alla Trapanese"],
    elementalProperties: {
      Air: 0.4,
      Earth: 0.3,
      Fire: 0.2,
      Water: 0.1
    },
    astrologicalInfluences: ["Mercury", "Venus", "gemini"],
    seasonality: "summer",
    preparationNotes: "Traditionally made in a marble mortar with wooden pestle",
    technicalTips: "Blanch basil briefly to preserve color if making ahead",
    cuisine: "Italian"
  },
  carbonara: {
    name: "Carbonara",
    description: "Silky sauce of eggs, hard cheese, cured pork and black pepper",
    base: "egg",
    keyIngredients: ["eggs", "Pecorino Romano", "guanciale", "black pepper"],
    culinaryUses: ["pasta sauce", "sauce for gnocchi", "savory custard base"],
    variants: ["Carbonara with pancetta", "Lighter carbonara with less egg yolks", "Vegetarian carbonara"],
    elementalProperties: {
      Earth: 0.4,
      Air: 0.3,
      Fire: 0.2,
      Water: 0.1
    },
    astrologicalInfluences: ["Jupiter", "Mars", "aries"],
    seasonality: "all",
    preparationNotes: "Never add cream - authentic carbonara is creamy from eggs alone",
    technicalTips: "Temper eggs carefully to prevent scrambling; use pasta water to adjust consistency",
    cuisine: "Italian"
  },
  ragu: {
    name: "Ragù alla Bolognese",
    description: "Rich, slow-cooked meat sauce from Bologna",
    base: "meat",
    keyIngredients: ["beef", "pork", "soffritto", "tomato paste", "wine", "milk"],
    culinaryUses: ["pasta sauce", "lasagna filling", "polenta topping", "stuffed pasta filling"],
    variants: ["Ragù Napoletano", "White ragù", "Wild boar ragù", "Vegetarian mushroom ragù"],
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.1,
      Air: 0.1
    },
    astrologicalInfluences: ["Saturn", "Mars", "taurus"],
    seasonality: "autumn, winter",
    preparationNotes: "True Bolognese takes hours of gentle simmering for depth of flavor",
    technicalTips: "Add milk toward the end of cooking for authentic richness and tenderness",
    cuisine: "Italian"
  },
  bechamel: {
    name: "Besciamella",
    description: "Classic white sauce made from roux and milk",
    base: "dairy",
    keyIngredients: ["butter", "flour", "milk", "nutmeg", "bay leaf"],
    culinaryUses: ["lasagna layer", "cannelloni filling base", "vegetable gratin", "creamed spinach"],
    variants: ["Mornay sauce", "Soubise", "Infused besciamella"],
    elementalProperties: {
      Water: 0.4,
      Earth: 0.4,
      Air: 0.1,
      Fire: 0.1
    },
    astrologicalInfluences: ["Moon", "Venus", "cancer"],
    seasonality: "all",
    preparationNotes: "For silky texture, add hot milk to roux gradually while whisking constantly",
    technicalTips: "Infuse milk with bay leaf, onion, and clove before making sauce for depth of flavor",
    cuisine: "Italian"
  },
  arrabbiata: {
    name: "Arrabbiata",
    description: "Spicy tomato sauce with garlic and chili peppers",
    base: "tomato",
    keyIngredients: ["tomatoes", "garlic", "chili peppers", "olive oil", "parsley"],
    culinaryUses: ["pasta sauce", "pizza topping", "protein topping", "dipping sauce"],
    elementalProperties: {
      Fire: 0.7,
      Earth: 0.2,
      Water: 0.1,
      Air: 0.0
    },
    astrologicalInfluences: ["Mars", "Sun", "Aries"],
    seasonality: "all",
    preparationNotes: "The name means 'angry' in Italian, referring to the spiciness",
    technicalTips: "Add chili at the beginning with garlic for more heat throughout",
    cuisine: "Italian"
  }
};

// Mexican sauces - adding as an example of another cuisine's sauces
export const mexicanSauces: Record<string, Sauce> = {
  mole: {
    name: "Mole",
    description: "Complex sauce combining chilis, chocolate, nuts, and spices",
    base: "chili",
    keyIngredients: ["dried chilies", "chocolate", "nuts", "seeds", "spices"],
    culinaryUses: ["protein topping", "enchilada sauce", "tamale filling"],
    variants: ["Mole Poblano", "Mole Negro", "Mole Verde", "Mole Amarillo"],
    elementalProperties: {
      Earth: 0.4,
      Fire: 0.4,
      Water: 0.1,
      Air: 0.1
    },
    astrologicalInfluences: ["Mars", "Pluto", "Scorpio"],
    seasonality: "all",
    cuisine: "Mexican"
  },
  salsa: {
    name: "Salsa Roja",
    description: "Fresh or cooked tomato-based sauce with chilies and aromatics",
    base: "tomato",
    keyIngredients: ["tomatoes", "chilies", "onion", "cilantro", "lime"],
    culinaryUses: ["dip", "topping", "marinade", "cooking sauce"],
    variants: ["Salsa Verde", "Pico de Gallo", "Salsa Taquera"],
    elementalProperties: {
      Fire: 0.5,
      Water: 0.3,
      Earth: 0.1,
      Air: 0.1
    },
    astrologicalInfluences: ["Mars", "Sun", "Aries"],
    seasonality: "all",
    cuisine: "Mexican"
  }
};

// Consolidate all sauces
export const allSauces: Record<string, Sauce> = {
  ...italianSauces,
  ...mexicanSauces,
  // Add other cuisine sauces as they become available
};

// Sauce recommendations
export const sauceRecommendations: SauceRecommendation = {
  forProtein: {
    beef: ["ragù alla Bolognese", "sugo di carne", "salsa alla pizzaiola", "Barolo wine sauce", "mole"],
    pork: ["agrodolce", "marsala", "porchetta herbs", "black pepper sauce", "salsa verde"],
    chicken: ["cacciatore", "piccata", "marsala", "salt-crusted herbs", "mole"],
    fish: ["acqua pazza", "salmoriglio", "livornese", "al limone"],
    vegetarian: ["pesto", "pomodoro", "aglio e olio", "burro e salvia"]
  },
  forVegetable: {
    leafy: ["aglio e olio", "parmigiano", "lemon butter", "anchovy"],
    root: ["besciamella", "gremolata", "herbed butter", "balsamic glaze"],
    nightshades: ["marinara", "alla Norma", "sugo di pomodoro", "caponata"],
    squash: ["brown butter sage", "gorgonzola cream", "agrodolce", "walnut pesto"],
    mushroom: ["porcini sauce", "marsala", "truffle oil", "white wine garlic"]
  },
  forCookingMethod: {
    grilling: ["salmoriglio", "rosemary oil", "balsamic glaze", "salsa verde"],
    baking: ["marinara", "besciamella", "pesto", "ragù"],
    frying: ["aioli", "lemon dip", "arrabiata", "garlic-herb dip"],
    braising: ["osso buco sauce", "wine reduction", "pomodoro", "cacciatora"],
    raw: ["pinzimonio", "olio nuovo", "citronette", "bagna cauda"]
  },
  byAstrological: {
    fire: ["arrabiata", "puttanesca", "aglio e olio with peperoncino", "spicy pomodoro", "salsa roja"],
    earth: ["mushroom ragu", "tartufo", "carbonara", "ragù alla Bolognese", "mole"],
    air: ["lemon sauces", "herb oils", "white wine sauce", "pesto"],
    water: ["seafood sauces", "acqua pazza", "clam sauce", "besciamella"]
  },
  byRegion: {
    northern: ["pesto alla Genovese", "bagna cauda", "fonduta", "ragù alla Bolognese"],
    central: ["carbonara", "cacio e pepe", "amatriciana", "sugo finto"],
    southern: ["marinara", "puttanesca", "aglio e olio", "alla Norma"],
    insular: ["sarde a beccafico", "nero di seppia", "bottarga", "caponata"]
  },
  byDietary: {
    vegetarian: ["pomodoro", "pesto", "aglio e olio", "burro e salvia"],
    vegan: ["marinara", "pomodoro", "aglio e olio", "salsa verde"],
    glutenFree: ["salsa verde", "salmoriglio", "sugo di pomodoro", "lemon sauce"],
    dairyFree: ["marinara", "aglio e olio", "puttanesca", "arrabbiata"]
  }
};

// Helper functions
export function getSaucesByAstrologicalInfluence(influence: string): Sauce[] {
  return Object.values(allSauces).filter(sauce => 
    sauce.astrologicalInfluences.some(infl => 
      infl.toLowerCase() === influence.toLowerCase()
    )
  );
}

export function getSaucesByElement(element: keyof ElementalProperties): Sauce[] {
  return Object.values(allSauces).filter(sauce => {
    // Find the dominant element
    const dominantElement = Object.entries(sauce.elementalProperties)
      .sort(([, a], [, b]) => b - a)[0][0];
    return dominantElement === element;
  });
}

export function getMarsInfluencedSauces(): Sauce[] {
  return getSaucesByAstrologicalInfluence('Mars');
}

export default {
  italianSauces,
  mexicanSauces,
  allSauces,
  sauceRecommendations,
  getSaucesByAstrologicalInfluence,
  getSaucesByElement,
  getMarsInfluencedSauces
}; 