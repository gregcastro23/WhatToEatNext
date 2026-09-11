import type { Cuisine } from "@/types/cuisine";
import { createLogger } from "@/utils/logger";
import { standardizeRecipe } from "@/utils/recipe/recipeStandardization";
import cuisineImagesRaw from "./images.json";

const logger = createLogger("data:cuisines");

const cuisineImages = cuisineImagesRaw as Record<string, string>;

// Define a type for the dynamic import functions
type CuisineImport = () => Promise<Cuisine | Partial<Cuisine> | Record<string, unknown>>;

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
  Fusion: () => import("./fusion").then(m => m.fusion),
  HSCA: () => import("./hsca").then(m => m.cuisine),
};

// Helper to conditionally supply imageUrl only when defined (exactOptionalPropertyTypes)
const getCuisineImage = (key: string): { imageUrl: string } | Record<string, never> => {
  const img = cuisineImages[key];
  return img ? { imageUrl: img } : {};
};

// Metadata is kept synchronous to avoid placeholders and allow immediate UI render
// These are extracted from the 2.8MB static files
export const CUISINES_METADATA: Record<string, Partial<Cuisine>> = {
  African: {
    name: "African",
    elementalProperties: { Fire: 0.3, Earth: 0.4, Water: 0.2, Air: 0.1 },
    description: "Rich and diverse culinary traditions from across the African continent.",
    ...getCuisineImage("African"),
  },
  American: {
    name: "American",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    description: "Diverse culinary influences reflecting the melting pot of American culture.",
    ...getCuisineImage("American"),
  },
  Chinese: {
    name: "Chinese",
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
    description: "Ancient culinary traditions with a focus on balance and wok hei.",
    ...getCuisineImage("Chinese"),
  },
  French: {
    name: "French",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    description: "Classical techniques and a focus on high-quality ingredients and sauces.",
    ...getCuisineImage("French"),
  },
  Greek: {
    name: "Greek",
    elementalProperties: { Fire: 0.2, Earth: 0.3, Water: 0.3, Air: 0.2 },
    description: "Mediterranean flavors with fresh herbs, olive oil, and seafood.",
    ...getCuisineImage("Greek"),
  },
  Indian: {
    name: "Indian",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    description: "Complex spice blends and traditional cooking methods like the tandoor.",
    ...getCuisineImage("Indian"),
  },
  Italian: {
    name: "Italian",
    elementalProperties: { Fire: 0.3, Earth: 0.4, Water: 0.2, Air: 0.1 },
    description: "Regional specialties with a focus on fresh pasta, tomatoes, and olive oil.",
    ...getCuisineImage("Italian"),
  },
  Japanese: {
    name: "Japanese",
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
    description: "Precision and seasonality with a focus on umami and fresh seafood.",
    ...getCuisineImage("Japanese"),
  },
  Korean: {
    name: "Korean",
    elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    description: "Bold flavors from fermentation and grilling.",
    ...getCuisineImage("Korean"),
  },
  Mexican: {
    name: "Mexican",
    elementalProperties: { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 },
    description: "Vibrant flavors with a focus on chilies, corn, and traditional salsas.",
    ...getCuisineImage("Mexican"),
  },
  MiddleEastern: {
    name: "Middle Eastern",
    elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    description: "Aromatic spices, grains, and grilled meats with fresh vegetable salads.",
    ...getCuisineImage("MiddleEastern"),
  },
  Russian: {
    name: "Russian",
    elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
    description: "Hearty soups, grains, and preserved foods suitable for cold climates.",
    ...getCuisineImage("Russian"),
  },
  Thai: {
    name: "Thai",
    elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    description: "Perfect balance of sour, sweet, salty, and spicy flavors.",
    ...getCuisineImage("Thai"),
  },
  Vietnamese: {
    name: "Vietnamese",
    elementalProperties: { Water: 0.4, Fire: 0.2, Earth: 0.2, Air: 0.2 },
    description: "Fresh, light flavors with an emphasis on herbs and clear broths.",
    ...getCuisineImage("Vietnamese"),
  },
  Fusion: {
    name: "Fusion",
    elementalProperties: { Fire: 0.35, Earth: 0.35, Water: 0.2, Air: 0.1 },
    description: "Innovative culinary intersections bridging traditions across cultures through elemental harmony.",
    ...getCuisineImage("Fusion"),
  },
  // HSCA is intentionally absent: it is an internal archive collection, not
  // a real cuisine, and must never surface on public cuisine browse/detail
  // pages (see src/utils/internalCuisineCodes.ts). Its dishes stay loadable
  // through cuisineImports for the static recipe payload.
};

type MealKey = keyof NonNullable<Cuisine["dishes"]>;
// `all` is a real bucket in the cuisine files, not a placeholder: it holds dishes
// served year-round, and it carries 1061 of the corpus's 1174 dishes (HSCA alone
// keeps 533 there). Omitting it here silently dropped ~90% of the catalog — and
// `extractRecipesFromCuisines` in actions/recipes.ts already reads an `all` key,
// so the producer was the only half that disagreed.
type SeasonKey = "spring" | "summer" | "autumn" | "winter" | "all";

function extractSeasonDishes(
  rawDishes: Record<string, Record<string, unknown[]>>,
  cuisineName: string,
): NonNullable<Cuisine["dishes"]> {
  const dishes: NonNullable<Cuisine["dishes"]> = {
    breakfast: { spring: [], summer: [], autumn: [], winter: [], all: [] },
    lunch: { spring: [], summer: [], autumn: [], winter: [], all: [] },
    dinner: { spring: [], summer: [], autumn: [], winter: [], all: [] },
    dessert: { spring: [], summer: [], autumn: [], winter: [], all: [] },
  };

  const mealKeys: MealKey[] = ["breakfast", "lunch", "dinner", "dessert"];
  const seasonKeys: SeasonKey[] = ["spring", "summer", "autumn", "winter", "all"];

  for (const mealKey of mealKeys) {
    const mealTypeData = rawDishes[mealKey];
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

  const rawCuisine = cuisine as Partial<Cuisine>;
  const name = typeof rawCuisine.name === "string" ? rawCuisine.name : "Unknown";
  const dishes =
    rawCuisine.dishes && typeof rawCuisine.dishes === "object"
      ? extractSeasonDishes(
          rawCuisine.dishes as unknown as Record<string, Record<string, unknown[]>>,
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
    ...rawCuisine,
    id: rawCuisine.id ?? normalizedKey.toLowerCase(),
    name,
    imageUrl,
    dishes,
  } as Cuisine;
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
    ...(meta.imageUrl ? { imageUrl: meta.imageUrl } : {}),
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
