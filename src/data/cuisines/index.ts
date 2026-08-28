import type { Cuisine } from "@/types/cuisine";
import { createLogger } from "@/utils/logger";
import { standardizeRecipe } from "@/utils/recipe/recipeStandardization";
import cuisineImagesRaw from "./images.json";

const logger = createLogger("data:cuisines");

const cuisineImages = cuisineImagesRaw as Record<string, string>;

// Define a type for the dynamic import functions
type CuisineImport = () => Promise<Record<string, unknown>>;

// Map of dynamic import functions for each cuisine
const cuisineImports: Record<string, CuisineImport> = {
  African: () => import("./african").then(m => m.african as unknown as Record<string, unknown>),
  American: () => import("./american").then(m => m.american as unknown as Record<string, unknown>),
  Chinese: () => import("./chinese").then(m => m.chinese as unknown as Record<string, unknown>),
  French: () => import("./french").then(m => m.french as unknown as Record<string, unknown>),
  Greek: () => import("./greek").then(m => m.greek as unknown as Record<string, unknown>),
  Indian: () => import("./indian").then(m => m.indian as unknown as Record<string, unknown>),
  Italian: () => import("./italian").then(m => m.italian as unknown as Record<string, unknown>),
  Japanese: () => import("./japanese").then(m => m.japanese as unknown as Record<string, unknown>),
  Korean: () => import("./korean").then(m => m.korean as unknown as Record<string, unknown>),
  Mexican: () => import("./mexican").then(m => m.mexican as unknown as Record<string, unknown>),
  MiddleEastern: () => import("./middle-eastern").then(m => m.middleEastern as unknown as Record<string, unknown>),
  Russian: () => import("./russian").then(m => m.russian as unknown as Record<string, unknown>),
  Thai: () => import("./thai").then(m => m.thai as unknown as Record<string, unknown>),
  Vietnamese: () => import("./vietnamese").then(m => m.vietnamese as unknown as Record<string, unknown>),
  HSCA: () => import("./hsca").then(m => m.cuisine as unknown as Record<string, unknown>),
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
  // HSCA is intentionally absent: it is an internal archive collection, not
  // a real cuisine, and must never surface on public cuisine browse/detail
  // pages (see src/utils/internalCuisineCodes.ts). Its dishes stay loadable
  // through cuisineImports for the static recipe payload.
};

type MealKey = keyof NonNullable<Cuisine["dishes"]>;
type SeasonKey = "spring" | "summer" | "autumn" | "winter";

function extractSeasonDishes(
  rawDishes: Record<string, Record<string, unknown[]>>,
  cuisineName: string,
): NonNullable<Cuisine["dishes"]> {
  const dishes: NonNullable<Cuisine["dishes"]> = {
    breakfast: { spring: [], summer: [], autumn: [], winter: [] },
    lunch: { spring: [], summer: [], autumn: [], winter: [] },
    dinner: { spring: [], summer: [], autumn: [], winter: [] },
    dessert: { spring: [], summer: [], autumn: [], winter: [] },
  };

  const mealKeys: MealKey[] = ["breakfast", "lunch", "dinner", "dessert"];
  const seasonKeys: SeasonKey[] = ["spring", "summer", "autumn", "winter"];

  for (const mealKey of mealKeys) {
    const mealTypeData = rawDishes[mealKey] as Record<string, unknown[]> | undefined;
    if (!mealTypeData || typeof mealTypeData !== "object") continue;

    const targetMeal = dishes[mealKey];
    if (!targetMeal) continue;
    for (const seasonKey of seasonKeys) {
      const recipes = mealTypeData[seasonKey];
      if (Array.isArray(recipes)) {
        targetMeal[seasonKey] = recipes.map(
          (r) => standardizeRecipe(r, cuisineName, mealKey, seasonKey).standardizedRecipe,
        );
      }
    }
  }

  return dishes;
}

/**
 * Process a cuisine object to ensure consistent structure and standardize recipes.
 */
export function processCuisineRecipes(cuisine: unknown): Cuisine | null {
  if (!cuisine || typeof cuisine !== "object") return null;

  const rawCuisine = cuisine as Record<string, unknown>;
  const name = typeof rawCuisine.name === "string" ? rawCuisine.name : "Unknown";
  const dishes =
    rawCuisine.dishes && typeof rawCuisine.dishes === "object"
      ? extractSeasonDishes(
          rawCuisine.dishes as Record<string, Record<string, unknown[]>>,
          name,
        )
      : {
          breakfast: { spring: [], summer: [], autumn: [], winter: [] },
          lunch: { spring: [], summer: [], autumn: [], winter: [] },
          dinner: { spring: [], summer: [], autumn: [], winter: [] },
          dessert: { spring: [], summer: [], autumn: [], winter: [] },
        };

  const normalizedKey = name === "Middle Eastern" ? "MiddleEastern" : name;
  const imageUrl = cuisineImages[normalizedKey] ?? undefined;

  return {
    ...(rawCuisine as unknown as Cuisine),
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
    logger.error(`Failed to load cuisine data for ${key}:`, error);
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
  if (!meta) return; // internal collections (HSCA) have no public metadata
  cuisinesMapBase[key] = {
    ...meta,
    id: key.toLowerCase(),
    name: meta.name ?? key,
    elementalProperties: meta.elementalProperties ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    description: meta.description ?? "",
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
  get(target, prop: string): Cuisine | undefined {
    const key = Object.keys(target).find(k => k.toLowerCase() === prop.toLowerCase()) ?? prop;
    return target[key];
  }
});

export const primaryCuisines = cuisinesMap;

/** @deprecated Use CUISINES_METADATA instead */
export const CUISINES = CUISINES_METADATA;

export default cuisinesMap;
