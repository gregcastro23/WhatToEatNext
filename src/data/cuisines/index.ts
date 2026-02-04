import type { Cuisine } from "@/types/cuisine";

// Import all cuisines
import { african } from "./african";
import { american } from "./american";
import { chinese } from "./chinese";
import { french } from "./french";
import { greek } from "./greek";
import { indian } from "./indian";
import { italian } from "./italian";
import { japanese } from "./japanese";
import { korean } from "./korean";
import { mexican } from "./mexican";
import { middleEastern } from "./middle-eastern";
import { russian } from "./russian";
import { thai } from "./thai";
import { vietnamese } from "./vietnamese";

// Create a base cuisine structure
const baseCuisine: Cuisine = {
  id: "base",
  name: "",
  description: "",
  motherSauces: {},
  dishes: {
    breakfast: {
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    lunch: {
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    dinner: {
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
    dessert: {
      spring: [],
      summer: [],
      autumn: [],
      winter: [],
    },
  },
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
  elementalProperties: {
    Fire: 0,
    Water: 0.75,
    Earth: 0.65,
    Air: 0,
  },
  astrologicalInfluences: [],
};

// Process the recipes to combine seasonal and 'all' categories
const processCuisineRecipes = (cuisine: Partial<Cuisine>): Cuisine => {
  if (!cuisine) return { ...baseCuisine };

  // Helper to combine 'all' recipes with seasonal ones
  const combineRecipes = (mealType: unknown) => {
    if (!mealType) return { spring: [], summer: [], autumn: [], winter: [] };

    // Use safe type casting for mealType property access
    const mealData = mealType as any;

    // Extract the 'all' recipes that should be added to each season
    // Make sure 'all' is an array even if it's not defined
    const allRecipes = Array.isArray(mealData.all) ? mealData.all : [];

    return {
      spring: [
        ...(Array.isArray(mealData.spring) ? mealData.spring : []),
        ...allRecipes,
      ],
      summer: [
        ...(Array.isArray(mealData.summer) ? mealData.summer : []),
        ...allRecipes,
      ],
      autumn: [
        ...(Array.isArray(mealData.autumn) ? mealData.autumn : []),
        ...allRecipes,
      ],
      winter: [
        ...(Array.isArray(mealData.winter) ? mealData.winter : []),
        ...allRecipes,
      ],
    };
  };

  // Ensure the cuisine has at least a valid ID and name
  const name = cuisine.name || "";
  const id = cuisine.id || `cuisine-${name.toLowerCase().replace(/\s+/g, "-")}`;

  return {
    id,
    name,
    description: cuisine.description || "",
    motherSauces: cuisine.motherSauces || {},
    dishes: {
      breakfast: combineRecipes(cuisine.dishes?.breakfast),
      lunch: combineRecipes(cuisine.dishes?.lunch),
      dinner: combineRecipes(cuisine.dishes?.dinner),
      dessert: combineRecipes(cuisine.dishes?.dessert),
    },
    traditionalSauces: cuisine.traditionalSauces || {},
    sauceRecommender: {
      forProtein: cuisine.sauceRecommender?.forProtein || {},
      forVegetable: cuisine.sauceRecommender?.forVegetable || {},
      forCookingMethod: cuisine.sauceRecommender?.forCookingMethod || {},
      byAstrological: cuisine.sauceRecommender?.byAstrological || {},
      byRegion: cuisine.sauceRecommender?.byRegion || {},
      byDietary: cuisine.sauceRecommender?.byDietary || {},
    },
    cookingTechniques: Array.isArray(cuisine.cookingTechniques)
      ? cuisine.cookingTechniques
      : [],
    regionalCuisines: cuisine.regionalCuisines || {},
    elementalProperties: cuisine.elementalProperties ||
      (cuisine as any).elementalState || { ...baseCuisine.elementalProperties }, // For backward compatibility
    regionalVarieties: cuisine.regionalCuisines
      ? Object.keys(cuisine.regionalCuisines).length
      : 0,
    astrologicalInfluences: Array.isArray(cuisine.astrologicalInfluences)
      ? cuisine.astrologicalInfluences
      : [],
  } as Cuisine; // Use type assertion to ensure the return type is Cuisine
};

// Pre-process all cuisines once for efficiency
const processedCuisines = {
  African: processCuisineRecipes(african as unknown as Partial<Cuisine>),
  American: processCuisineRecipes(american as unknown as Partial<Cuisine>),
  Chinese: processCuisineRecipes(chinese as unknown as Partial<Cuisine>),
  French: processCuisineRecipes(french as unknown as Partial<Cuisine>),
  Greek: processCuisineRecipes(greek as unknown as Partial<Cuisine>),
  Indian: processCuisineRecipes(indian as unknown as Partial<Cuisine>),
  Italian: processCuisineRecipes(italian as unknown as Partial<Cuisine>),
  Japanese: processCuisineRecipes(japanese as unknown as Partial<Cuisine>),
  Korean: processCuisineRecipes(korean as unknown as Partial<Cuisine>),
  Mexican: processCuisineRecipes(mexican as unknown as Partial<Cuisine>),
  "Middle Eastern": processCuisineRecipes(middleEastern as unknown as Partial<Cuisine>),
  Russian: processCuisineRecipes(russian as unknown as Partial<Cuisine>),
  Thai: processCuisineRecipes(thai as unknown as Partial<Cuisine>),
  Vietnamese: processCuisineRecipes(vietnamese as unknown as Partial<Cuisine>),
};

// Create and export the cuisines map with validated structures
// Includes both capitalized and lowercase keys for backward compatibility
// but references the SAME processed objects to avoid duplication
export const cuisinesMap = {
  // Primary entries (capitalized)
  ...processedCuisines,
  // Lowercase aliases pointing to same objects (backward compatibility)
  african: processedCuisines.African,
  american: processedCuisines.American,
  chinese: processedCuisines.Chinese,
  french: processedCuisines.French,
  greek: processedCuisines.Greek,
  indian: processedCuisines.Indian,
  italian: processedCuisines.Italian,
  japanese: processedCuisines.Japanese,
  korean: processedCuisines.Korean,
  mexican: processedCuisines.Mexican,
  middleEastern: processedCuisines["Middle Eastern"],
  russian: processedCuisines.Russian,
  thai: processedCuisines.Thai,
  vietnamese: processedCuisines.Vietnamese,
} as const;

// Export only primary cuisines for iteration (avoids duplicates)
export const primaryCuisines = processedCuisines;

export type CuisineName = keyof typeof cuisinesMap;
export default cuisinesMap;

// Element properties for the refined culinary search
export const CUISINES = {
  american: {
    name: "American",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.2,
    },
  },
  chinese: {
    name: "Chinese",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.1,
    },
  },
  japanese: {
    name: "Japanese",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.4,
      Earth: 0.2,
      Air: 0.2,
    },
  },
  indian: {
    name: "Indian",
    elementalProperties: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.2,
    },
  },
  french: {
    name: "French",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.2,
    },
  },
  italian: {
    name: "Italian",
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1,
    },
  },
  african: {
    name: "African",
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1,
    },
  },
  middleEastern: {
    name: "Middle Eastern",
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.2,
    },
  },
  greek: {
    name: "Greek",
    elementalProperties: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2,
    },
  },
  mexican: {
    name: "Mexican",
    elementalProperties: {
      Fire: 0.5,
      Earth: 0.3,
      Water: 0.1,
      Air: 0.1,
    },
  },
  thai: {
    name: "Thai",
    elementalProperties: {
      Fire: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.1,
    },
  },
  vietnamese: {
    name: "Vietnamese",
    elementalProperties: {
      Water: 0.4,
      Fire: 0.2,
      Earth: 0.2,
      Air: 0.2,
    },
  },
  korean: {
    name: "Korean",
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.2,
    },
  },
  russian: {
    name: "Russian",
    elementalProperties: {
      Earth: 0.5,
      Water: 0.2,
      Fire: 0.2,
      Air: 0.1,
    },
  },
} as const;

// Type for cuisine data
export interface CuisineData {
  name: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
}

// Ensure type safety
export type Cuisines = typeof CUISINES;
