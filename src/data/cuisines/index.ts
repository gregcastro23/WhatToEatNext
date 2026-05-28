import type { Cuisine } from "@/types/cuisine";
import { standardizeRecipe } from "@/utils/recipe/recipeStandardization";
import cuisineImagesRaw from "./images.json";

const cuisineImages = cuisineImagesRaw as Record<string, string>;

// Define a type for the dynamic import functions
type CuisineImport = () => Promise<{ [key: string]: any }>;

// Map of dynamic import functions for each cuisine
const cuisineImports: Record<string, CuisineImport> = {
  African: () => import("./african").then(m => m.african),
  American: () => import("./american").then(m => m.american),
  Chinese: () => import("./chinese").then(m => m.chinese),
  French: () => import("./french").then(m => m.french),
  Greek: () => import("./greek").then(m => m.greek),
  Indian: () => import("./indian").then(m => m.indian),
  Italian: () => import("./italian").then(m => m.italian),
  Japanese: () => import("./japanese").then(m => m.japanese),
  Korean: () => import("./korean").then(m => m.korean),
  Mexican: () => import("./mexican").then(m => m.mexican),
  MiddleEastern: () => import("./middle-eastern").then(m => m.middleEastern),
  Russian: () => import("./russian").then(m => m.russian),
  Thai: () => import("./thai").then(m => m.thai),
  Vietnamese: () => import("./vietnamese").then(m => m.vietnamese),
  HSCA: () => import("./hsca").then(m => m.cuisine),
};

// Metadata is kept synchronous to avoid placeholders and allow immediate UI render
// These are extracted from the 2.8MB static files
export const CUISINES_METADATA: Record<string, Partial<Cuisine>> = {
  African: {
    name: "African",
    elementalProperties: { Fire: 0.3, Earth: 0.4, Water: 0.2, Air: 0.1 },
    description: "Rich and diverse culinary traditions from across the African continent.",
    imageUrl: cuisineImages.African,
  },
  American: {
    name: "American",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    description: "Diverse culinary influences reflecting the melting pot of American culture.",
    imageUrl: cuisineImages.American,
  },
  Chinese: {
    name: "Chinese",
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
    description: "Ancient culinary traditions with a focus on balance and wok hei.",
    imageUrl: cuisineImages.Chinese,
  },
  French: {
    name: "French",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    description: "Classical techniques and a focus on high-quality ingredients and sauces.",
    imageUrl: cuisineImages.French,
  },
  Greek: {
    name: "Greek",
    elementalProperties: { Fire: 0.2, Earth: 0.3, Water: 0.3, Air: 0.2 },
    description: "Mediterranean flavors with fresh herbs, olive oil, and seafood.",
    imageUrl: cuisineImages.Greek,
  },
  Indian: {
    name: "Indian",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    description: "Complex spice blends and traditional cooking methods like the tandoor.",
    imageUrl: cuisineImages.Indian,
  },
  Italian: {
    name: "Italian",
    elementalProperties: { Fire: 0.3, Earth: 0.4, Water: 0.2, Air: 0.1 },
    description: "Regional specialties with a focus on fresh pasta, tomatoes, and olive oil.",
    imageUrl: cuisineImages.Italian,
  },
  Japanese: {
    name: "Japanese",
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
    description: "Precision and seasonality with a focus on umami and fresh seafood.",
    imageUrl: cuisineImages.Japanese,
  },
  Korean: {
    name: "Korean",
    elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    description: "Bold flavors from fermentation and grilling.",
    imageUrl: cuisineImages.Korean,
  },
  Mexican: {
    name: "Mexican",
    elementalProperties: { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 },
    description: "Vibrant flavors with a focus on chilies, corn, and traditional salsas.",
    imageUrl: cuisineImages.Mexican,
  },
  MiddleEastern: {
    name: "Middle Eastern",
    elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    description: "Aromatic spices, grains, and grilled meats with fresh vegetable salads.",
    imageUrl: cuisineImages.MiddleEastern,
  },
  Russian: {
    name: "Russian",
    elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
    description: "Hearty soups, grains, and preserved foods suitable for cold climates.",
    imageUrl: cuisineImages.Russian,
  },
  Thai: {
    name: "Thai",
    elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    description: "Perfect balance of sour, sweet, salty, and spicy flavors.",
    imageUrl: cuisineImages.Thai,
  },
  Vietnamese: {
    name: "Vietnamese",
    elementalProperties: { Water: 0.4, Fire: 0.2, Earth: 0.2, Air: 0.2 },
    description: "Fresh, light flavors with an emphasis on herbs and clear broths.",
    imageUrl: cuisineImages.Vietnamese,
  },
  HSCA: {
    name: "HSCA",
    elementalProperties: { Fire: 0.25, Earth: 0.35, Water: 0.25, Air: 0.15 },
    description: "Holistic Health and Macrobiotic clean cuisine focusing on energetic harmony and elemental balance.",
    imageUrl: cuisineImages.HSCA,
  },
};

/**
 * Process a cuisine object to ensure consistent structure and standardize recipes.
 */
export function processCuisineRecipes(cuisine: any): Cuisine {
  if (!cuisine) return null as any;

  const name = cuisine.name || "Unknown";
  const dishes: any = {
    breakfast: { spring: [], summer: [], autumn: [], winter: [] },
    lunch: { spring: [], summer: [], autumn: [], winter: [] },
    dinner: { spring: [], summer: [], autumn: [], winter: [] },
    dessert: { spring: [], summer: [], autumn: [], winter: [] },
  };

  if (cuisine.dishes) {
    Object.entries(cuisine.dishes).forEach(([mealType, mealTypeData]: [string, any]) => {
      if (mealTypeData && dishes[mealType]) {
        Object.entries(mealTypeData).forEach(([season, recipes]: [string, any]) => {
          if (Array.isArray(recipes)) {
            dishes[mealType][season] = recipes.map(r => standardizeRecipe(r, name, mealType, season).standardizedRecipe);
          }
        });
      }
    });
  }

  const normalizedKey = name === "Middle Eastern" ? "MiddleEastern" : name;
  const imageUrl = cuisineImages[normalizedKey] || undefined;

  return {
    ...cuisine,
    imageUrl,
    dishes,
  };
}

/**
 * Asynchronously load full cuisine data including all recipes.
 */
export async function getCuisineData(key: string): Promise<Cuisine | null> {
  const normalizedKey = key === "Middle Eastern" ? "MiddleEastern" : key;
  const loader = cuisineImports[normalizedKey];
  if (!loader) return null;

  try {
    const rawData = await loader();
    return processCuisineRecipes(rawData);
  } catch (error) {
    console.error(`Failed to load cuisine data for ${key}:`, error);
    return null;
  }
}

// Map of primary cuisine keys
export const PRIMARY_CUISINE_KEYS = Object.keys(cuisineImports);

// Legacy exports - these now return METADATA by default to avoid the 2.8MB bundle.
// If dishes are needed, use getCuisineData() instead.
const cuisinesMapBase: Record<string, Cuisine> = {};
PRIMARY_CUISINE_KEYS.forEach(key => {
  const meta = CUISINES_METADATA[key];
  (cuisinesMapBase as any)[key] = {
    ...meta,
    id: key.toLowerCase(),
    imageUrl: meta.imageUrl,
    dishes: {
      breakfast: { spring: [], summer: [], autumn: [], winter: [] },
      lunch: { spring: [], summer: [], autumn: [], winter: [] },
      dinner: { spring: [], summer: [], autumn: [], winter: [] },
      dessert: { spring: [], summer: [], autumn: [], winter: [] },
    },
    motherSauces: {},
    traditionalSauces: {},
    sauceRecommender: {
      forProtein: {},
      forVegetable: {},
      forCookingMethod: {},
      byAstrological: {},
      byRegion: {},
      byDietary: {},
    },
    cookingTechniques: [],
    regionalCuisines: {},
    astrologicalInfluences: [],
  };
});

// Proxy to provide warnings and handle both capitalized and lowercase keys
export const cuisinesMap = new Proxy(cuisinesMapBase, {
  get(target, prop: string) {
    const key = Object.keys(target).find(k => k.toLowerCase() === prop.toLowerCase()) || prop;
    if (prop !== "then" && prop !== "toJSON" && typeof prop === "string") {
      // console.warn(`Accessing cuisinesMap.${prop} synchronously. For full data including recipes, use getCuisineData('${key}').`);
    }
    return target[key];
  }
});

export const primaryCuisines = cuisinesMap;

/** @deprecated Use CUISINES_METADATA instead */
export const CUISINES = CUISINES_METADATA;

export default cuisinesMap;
