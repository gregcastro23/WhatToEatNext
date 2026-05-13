import { executeQuery } from "@/lib/database";
import { redisGet, redisSet, redisDel } from "@/lib/redis";
import { getValidatedAssetUrl } from "@/lib/assets";
import type {
  ElementalProperties,
  Recipe,
  RecipeIngredient,
} from "@/types/recipe";
import { logger } from "@/utils/logger";
import { getAssetUrl } from "@/utils/urlUtils";

interface DbRecipeRow {
  id: string;
  name: string;
  description?: string | null;
  cuisine?: string | null;
  cuisine_type?: string | null;
  category?: string | null;
  instructions?: unknown;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  dietary_tags?: string[] | null;
  allergens?: string[] | null;
  nutritional_profile?: unknown;
  ingredients?: unknown;
  meal_types?: string[] | null;
  seasons?: string[] | null;
  elemental_properties?: unknown;
  image_url?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

const RECIPE_QUERY = `
  SELECT
    r.id,
    r.name,
    r.description,
    r.cuisine,
    r.category,
    r.prep_time_minutes,
    r.cook_time_minutes,
    r.servings,
    r.dietary_tags::text[] AS dietary_tags,
    r.allergens::text[] AS allergens,
    r.nutritional_profile,
    r.image_url,
    r.created_at,
    r.updated_at,
    r.read_model
  FROM recipes r
  WHERE r.is_public = true
`;

function parseJsonValue<T>(value: unknown, fallback: T): T {
  if (value == null) {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return value as T;
}

function normalizeInstructions(value: unknown): string[] {
  const parsed = parseJsonValue<unknown>(value, []);

  if (Array.isArray(parsed)) {
    return parsed
      .map((step) => {
        if (typeof step === "string") return step;
        if (step && typeof step === "object") {
          const candidate = (step as Record<string, unknown>).instruction
            ?? (step as Record<string, unknown>).text
            ?? (step as Record<string, unknown>).step;
          return typeof candidate === "string" ? candidate : null;
        }
        return null;
      })
      .filter((step): step is string => Boolean(step));
  }

  if (parsed && typeof parsed === "object") {
    const steps = (parsed as Record<string, unknown>).steps;
    return normalizeInstructions(steps);
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return [parsed];
  }

  return [];
}

function normalizeIngredients(value: unknown): RecipeIngredient[] {
  const parsed = parseJsonValue<unknown[]>(value, []);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((ingredient): RecipeIngredient | null => {
      if (!ingredient || typeof ingredient !== "object") {
        return null;
      }

      const record = ingredient as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : (record.ingredient as string);
      if (!name) {
        return null;
      }

      return {
        id: typeof record.id === "string" ? record.id : undefined,
        name,
        amount: Number(record.amount ?? record.quantity ?? 0),
        unit: typeof record.unit === "string" ? record.unit : "",
        optional: Boolean(record.optional),
        notes: typeof record.notes === "string" ? record.notes : (record.preparation as string),
        category:
          typeof record.category === "string" ? record.category : undefined,
        asin: typeof record.asin === "string" ? record.asin : (typeof record.amazon_asin === "string" ? record.amazon_asin : undefined),
      };
    })
    .filter((ingredient): ingredient is RecipeIngredient => Boolean(ingredient));
}

function hasDietaryTag(tags: string[] | null | undefined, tag: string): boolean {
  return (tags || []).some(
    (item) => item.toLowerCase().replace(/\s+/g, "") === tag,
  );
}

function mapRowToRecipe(row: DbRecipeRow & { read_model?: any }): Recipe {
  // Prefer the denormalized read_model for performance and data consistency
  if (row.read_model) {
    const rm = row.read_model;
    const dietaryTags = rm.dietary_tags || row.dietary_tags || [];
    
    // Extract seasons from nested contexts if available
    let seasons: string[] = [];
    if (Array.isArray(rm.contexts)) {
      seasons = rm.contexts.flatMap((c: any) => c.seasonal || []);
    }
    
    // Extract meal types from nested contexts (timeOfDay)
    let mealTypes: string[] = [];
    if (Array.isArray(rm.contexts)) {
      mealTypes = rm.contexts.flatMap((c: any) => c.timeOfDay || []);
    }
    if (mealTypes.length === 0 && rm.category) {
      mealTypes = [rm.category];
    }

    const imageUrl = getAssetUrl(rm.image_url || row.image_url);

    return {
      id: rm.id || row.id,
      name: rm.name || row.name,
      image: imageUrl,
      imageUrl,
      description: rm.description || row.description || undefined,
      cuisine: rm.cuisine || row.cuisine || undefined,
      ingredients: normalizeIngredients(rm.ingredients),
      instructions: normalizeInstructions(rm.instructions),
      prepTime: String(rm.prep_time_minutes ?? row.prep_time_minutes ?? 0),
      cookTime: String(rm.cook_time_minutes ?? row.cook_time_minutes ?? 0),
      totalTime: String((rm.prep_time_minutes ?? 0) + (rm.cook_time_minutes ?? 0)),
      timeToMake: `${(rm.prep_time_minutes ?? 0) + (rm.cook_time_minutes ?? 0)} minutes`,
      servingSize: rm.servings ?? row.servings ?? undefined,
      numberOfServings: rm.servings ?? row.servings ?? undefined,
      mealType: mealTypes,
      season: seasons.length ? seasons : undefined,
      elementalProperties: {
        Fire: rm.elemental_properties?.fire ?? rm.elemental_properties?.Fire ?? 0.25,
        Water: rm.elemental_properties?.water ?? rm.elemental_properties?.Water ?? 0.25,
        Earth: rm.elemental_properties?.earth ?? rm.elemental_properties?.Earth ?? 0.25,
        Air: rm.elemental_properties?.air ?? rm.elemental_properties?.Air ?? 0.25,
      },
      allergens: rm.allergens || row.allergens || [],
      isVegetarian: hasDietaryTag(dietaryTags, "vegetarian"),
      isVegan: hasDietaryTag(dietaryTags, "vegan"),
      isGlutenFree: hasDietaryTag(dietaryTags, "glutenfree") || hasDietaryTag(dietaryTags, "gluten-free"),
      isDairyFree: hasDietaryTag(dietaryTags, "dairyfree") || hasDietaryTag(dietaryTags, "dairy-free"),
      nutrition: rm.nutritional_profile || row.nutritional_profile || undefined,
      tags: dietaryTags,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    };
  }

  // Fallback to legacy row-based mapping if read_model is missing
  const dietaryTags = row.dietary_tags || [];
  const prepTime = row.prep_time_minutes ?? 0;
  const cookTime = row.cook_time_minutes ?? 0;
  const mealTypes = row.meal_types?.length ? row.meal_types : row.category ? [row.category] : [];
  const imageUrl = getAssetUrl(row.image_url);

  return {
    id: row.id,
    name: row.name,
    image: imageUrl,
    imageUrl,
    description: row.description ?? undefined,
    cuisine: row.cuisine ?? row.cuisine_type ?? undefined,
    ingredients: normalizeIngredients(row.ingredients),
    instructions: normalizeInstructions(row.instructions),
    prepTime: String(prepTime),
    cookTime: String(cookTime),
    totalTime: String(prepTime + cookTime),
    timeToMake: `${prepTime + cookTime} minutes`,
    servingSize: row.servings ?? undefined,
    numberOfServings: row.servings ?? undefined,
    mealType: mealTypes,
    season: row.seasons || undefined,
    elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES, // Legacy fallback
    allergens: row.allergens || [],
    isVegetarian: hasDietaryTag(dietaryTags, "vegetarian"),
    isVegan: hasDietaryTag(dietaryTags, "vegan"),
    isGlutenFree: hasDietaryTag(dietaryTags, "glutenfree"),
    isDairyFree: hasDietaryTag(dietaryTags, "dairyfree"),
    nutrition: parseJsonValue<any>(
      row.nutritional_profile,
      undefined,
    ),
    tags: dietaryTags,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

const REDIS_CATALOG_KEY = "recipes:catalog:all";
const REDIS_TTL_SECONDS = 5 * 60; // 5 minutes — matches in-process TTL

export class LocalRecipeService {
  private static _allRecipes: Recipe[] | null = null;
  private static _allRecipesLoadedAt: number | null = null;
  private static readonly CACHE_TTL_MS = REDIS_TTL_SECONDS * 1000;

  private static isCacheFresh(): boolean {
    return (
      this._allRecipes !== null &&
      this._allRecipesLoadedAt !== null &&
      Date.now() - this._allRecipesLoadedAt < this.CACHE_TTL_MS
    );
  }

  private static async fetchRecipes(where = "", params: unknown[] = []) {
    const query = `${RECIPE_QUERY} ${where}`;
    const result = await executeQuery<DbRecipeRow>(query, params);
    return result.rows.map(mapRowToRecipe);
  }

  static async getAllRecipes(): Promise<Recipe[]> {
    // L1: in-process memory (warm path — sub-ms)
    if (this.isCacheFresh()) {
      return this._allRecipes!;
    }

    // L2: Redis catalog cache (cross-instance — target <20ms)
    try {
      const cached = await redisGet(REDIS_CATALOG_KEY);
      if (cached) {
        const recipes = JSON.parse(cached) as Recipe[];
        this._allRecipes = recipes;
        this._allRecipesLoadedAt = Date.now();
        return recipes;
      }
    } catch (err) {
      logger.warn("Redis cache read failed, falling through to DB:", err);
    }

    // L3: PostgreSQL
    try {
      const recipes = await this.fetchRecipes("ORDER BY r.popularity_score DESC, r.created_at DESC");

      if (recipes.length === 0) {
        logger.warn("Database recipes table returned 0 rows, gracefully resolving local hardcoded payload fallback");
        const { allRecipes } = await import("@/data/recipes/index");
        this._allRecipes = allRecipes;
        this._allRecipesLoadedAt = Date.now();
        return this._allRecipes;
      }

      this._allRecipes = recipes;
      this._allRecipesLoadedAt = Date.now();

      // Populate Redis asynchronously so we don't block the response
      redisSet(REDIS_CATALOG_KEY, JSON.stringify(recipes), REDIS_TTL_SECONDS).catch(() => {});

      // Part 3: Warm Image Asset Cache
      this.warmImageAssetCache(recipes);

      return recipes;
    } catch (error) {
      logger.error("Error loading recipes from database, extracting raw local fallback:", error);
      const { allRecipes } = await import("@/data/recipes/index");
      return allRecipes;
    }
  }

  /**
   * Asynchronously warms the Redis cache for all recipe images.
   */
  private static warmImageAssetCache(recipes: Recipe[]) {
    // Process in small batches to avoid Redis/Network congestion
    const batchSize = 20;
    const recipesWithImages = recipes.filter((r) => r.imageUrl && !r.imageUrl.startsWith("http"));

    void (async () => {
      for (let i = 0; i < recipesWithImages.length; i += batchSize) {
        const batch = recipesWithImages.slice(i, i + batchSize);
        await Promise.allSettled(batch.map((r) => getValidatedAssetUrl(r.imageUrl)));
        // Tiny pause between batches
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      logger.debug(`[AssetCache] Warmed ${recipesWithImages.length} image paths`);
    })();
  }

  static async getRecipeById(recipeId: string): Promise<Recipe | null> {
    if (!recipeId) {
      return null;
    }

    try {
      const decodedId = decodeURIComponent(recipeId);
      const allRecipes = await this.getAllRecipes();
      
      const recipe = allRecipes.find(
        (r) => String(r.id) === decodedId || r.name === decodedId
      );

      if (recipe) return recipe;

      // Fallback: check if we can query the DB directly by UUID (just in case cache missed a newly added one)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decodedId);
      if (isUuid) {
        const recipes = await this.fetchRecipes("AND r.id = $1", [decodedId]);
        if (recipes.length > 0) return recipes[0];
      }

      return null;
    } catch (error) {
      logger.error(`Error getting recipe by id '${recipeId}':`, error);
      
      // Ultimate local fallback
      try {
        const decodedId = decodeURIComponent(recipeId);
        const { allRecipes } = await import("@/data/recipes/index");
        return allRecipes.find((r) => String(r.id) === decodedId || r.name === decodedId) || null;
      } catch (_innerError) {
        return null;
      }
    }
  }

  static async getRecipesByCuisine(cuisineName: string): Promise<Recipe[]> {
    if (!cuisineName) {
      return [];
    }

    try {
      const allRecipes = await this.getAllRecipes();
      return allRecipes.filter(
        (recipe) => recipe.cuisine?.toLowerCase() === cuisineName.toLowerCase(),
      );
    } catch (error) {
      logger.error(`Error getting recipes for cuisine '${cuisineName}':`, error);
      return [];
    }
  }

  static async searchRecipes(query: string): Promise<Recipe[]> {
    if (!query) {
      return [];
    }

    try {
      const normalizedQuery = query.toLowerCase().trim();
      const recipes = await this.getAllRecipes();

      return recipes.filter((recipe) => {
        if (recipe.name?.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        if (recipe.description?.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        return recipe.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(normalizedQuery),
        );
      });
    } catch (error) {
      logger.error(`Error searching recipes for query '${query}':`, error);
      return [];
    }
  }

  static async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    if (!mealType) {
      return [];
    }

    try {
      const normalizedMealType = mealType.toLowerCase().trim();
      const recipes = await this.getAllRecipes();

      return recipes.filter((recipe) => {
        if (!recipe.mealType) {
          return false;
        }

        return Array.isArray(recipe.mealType)
          ? recipe.mealType.some((value) => value.toLowerCase() === normalizedMealType)
          : recipe.mealType.toLowerCase() === normalizedMealType;
      });
    } catch (error) {
      logger.error(`Error getting recipes for meal type '${mealType}':`, error);
      return [];
    }
  }

  static async getRecipesBySeason(season: string): Promise<Recipe[]> {
    if (!season) {
      return [];
    }

    try {
      const normalizedSeason = season.toLowerCase().trim();
      const recipes = await this.getAllRecipes();

      return recipes.filter((recipe) => {
        if (!recipe.season) {
          return false;
        }

        return Array.isArray(recipe.season)
          ? recipe.season.some((value) => value.toLowerCase() === normalizedSeason)
          : recipe.season.toLowerCase() === normalizedSeason;
      });
    } catch (error) {
      logger.error(`Error getting recipes for season '${season}':`, error);
      return [];
    }
  }

  static clearCache(): void {
    this._allRecipes = null;
    this._allRecipesLoadedAt = null;
    redisDel(REDIS_CATALOG_KEY).catch(() => {});
  }
}
