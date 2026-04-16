import 'server-only';
import { executeQuery } from "@/lib/database";
import type {
  ElementalProperties,
  Recipe,
  RecipeIngredient,
} from "@/types/recipe";
import { logger } from "@/utils/logger";

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
    r.*,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', ri.id,
            'name', i.name,
            'amount', COALESCE(ri.quantity, 0),
            'unit', COALESCE(ri.unit, ''),
            'optional', COALESCE(ri.is_optional, false),
            'notes', ri.preparation_notes,
            'category', i.category
          )
          ORDER BY ri.order_index
        )
        FROM recipe_ingredients ri
        JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE ri.recipe_id = r.id AND i.is_active = true
      ),
      '[]'::json
    ) AS ingredients,
    COALESCE(
      (
        SELECT rc.time_of_day
        FROM recipe_contexts rc
        WHERE rc.recipe_id = r.id
        LIMIT 1
      ),
      ARRAY[]::text[]
    ) AS meal_types,
    COALESCE(
      (
        SELECT rc.recommended_seasons::text[]
        FROM recipe_contexts rc
        WHERE rc.recipe_id = r.id
        LIMIT 1
      ),
      ARRAY[]::text[]
    ) AS seasons,
    COALESCE(
      (
        SELECT json_build_object(
          'Fire', ep.fire,
          'Water', ep.water,
          'Earth', ep.earth,
          'Air', ep.air
        )
        FROM elemental_properties ep
        WHERE ep.entity_type = 'recipe' AND ep.entity_id = r.id
        LIMIT 1
      ),
      json_build_object(
        'Fire', 0.25,
        'Water', 0.25,
        'Earth', 0.25,
        'Air', 0.25
      )
    ) AS elemental_properties
  FROM recipes r
  WHERE 1=1 -- r.is_public flag bypassed for migration compatibility
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
    .map((ingredient) => {
      if (!ingredient || typeof ingredient !== "object") {
        return null;
      }

      const record = ingredient as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : null;
      if (!name) {
        return null;
      }

      return {
        id: typeof record.id === "string" ? record.id : undefined,
        name,
        amount: Number(record.amount ?? 0),
        unit: typeof record.unit === "string" ? record.unit : "",
        optional: Boolean(record.optional),
        notes: typeof record.notes === "string" ? record.notes : undefined,
        category:
          typeof record.category === "string" ? record.category : undefined,
      } as RecipeIngredient;
    })
    .filter((ingredient): ingredient is RecipeIngredient => Boolean(ingredient));
}

function normalizeElementalProperties(value: unknown): ElementalProperties {
  const parsed = parseJsonValue<Record<string, unknown>>(
    value,
    DEFAULT_ELEMENTAL_PROPERTIES,
  );

  return {
    Fire: Number(parsed.Fire ?? parsed.fire ?? DEFAULT_ELEMENTAL_PROPERTIES.Fire),
    Water: Number(
      parsed.Water ?? parsed.water ?? DEFAULT_ELEMENTAL_PROPERTIES.Water,
    ),
    Earth: Number(
      parsed.Earth ?? parsed.earth ?? DEFAULT_ELEMENTAL_PROPERTIES.Earth,
    ),
    Air: Number(parsed.Air ?? parsed.air ?? DEFAULT_ELEMENTAL_PROPERTIES.Air),
  };
}

function hasDietaryTag(tags: string[] | null | undefined, tag: string): boolean {
  return (tags || []).some(
    (item) => item.toLowerCase().replace(/\s+/g, "") === tag,
  );
}

function mapRowToRecipe(row: DbRecipeRow): Recipe {
  const dietaryTags = row.dietary_tags || [];
  const prepTime = row.prep_time_minutes ?? 0;
  const cookTime = row.cook_time_minutes ?? 0;
  const mealTypes = row.meal_types?.length ? row.meal_types : row.category ? [row.category] : [];

  return {
    id: row.id,
    name: row.name,
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
    elementalProperties: normalizeElementalProperties(row.elemental_properties),
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

export class LocalRecipeService {
  private static _allRecipes: Recipe[] | null = null;

  private static async fetchRecipes(where = "", params: unknown[] = []) {
    const query = `${RECIPE_QUERY} ${where}`;
    const result = await executeQuery<DbRecipeRow>(query, params);
    return result.rows.map(mapRowToRecipe);
  }

  static async getAllRecipes(): Promise<Recipe[]> {
    if (this._allRecipes) {
      return this._allRecipes;
    }

    try {
      const recipes = await this.fetchRecipes("ORDER BY r.popularity_score DESC, r.created_at DESC");
      
      if (recipes.length === 0) {
        logger.warn("Database recipes table returned 0 rows, gracefully resolving local hardcoded payload fallback");
        const { allRecipes } = await import("@/data/recipes/index");
        this._allRecipes = allRecipes;
        return this._allRecipes;
      }
      
      this._allRecipes = recipes;
      return recipes;
    } catch (error) {
      logger.error("Error loading recipes from database, extracting raw local fallback:", error);
      const { allRecipes } = await import("@/data/recipes/index");
      return allRecipes;
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
  }
}
