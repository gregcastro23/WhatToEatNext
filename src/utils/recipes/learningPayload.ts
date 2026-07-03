export interface RecipeLearningPayload {
  id?: string;
  name?: string;
  cuisine?: string;
  cookingMethod?: string;
  ingredients: string[];
  complexity?: "simple" | "moderate" | "complex";
  elementalBalance?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
}

interface RecipeLearningFallback {
  id?: string;
  name?: string;
  cuisine?: string;
  source?: string;
  sourceRecipeId?: string;
}

const ELEMENT_KEYS = ["Fire", "Water", "Earth", "Air"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizeElementValue(value: unknown): number | undefined {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  if (numeric > 1) return Math.max(0, Math.min(1, numeric / 100));
  return Math.max(0, Math.min(1, numeric));
}

function readElementalBalance(
  recipe: Record<string, unknown>,
): RecipeLearningPayload["elementalBalance"] | undefined {
  const raw =
    asRecord(recipe.elementalProperties) ??
    asRecord(recipe.elementalBalance) ??
    asRecord(recipe.elemental_profile);

  if (!raw) return undefined;

  const balance = {
    Fire: normalizeElementValue(raw.Fire ?? raw.fire) ?? 0,
    Water: normalizeElementValue(raw.Water ?? raw.water) ?? 0,
    Earth: normalizeElementValue(raw.Earth ?? raw.earth) ?? 0,
    Air: normalizeElementValue(raw.Air ?? raw.air) ?? 0,
  };

  const total = ELEMENT_KEYS.reduce((sum, key) => sum + balance[key], 0);
  return total > 0 ? balance : undefined;
}

function readIngredientNames(recipe: Record<string, unknown>): string[] {
  const raw = recipe.ingredients;
  if (!Array.isArray(raw)) return [];

  const names = raw
    .map((ingredient) => {
      if (typeof ingredient === "string") return ingredient;
      const record = asRecord(ingredient);
      return record
        ? firstString(record.name, record.ingredient, record.foodName)
        : undefined;
    })
    .filter((name): name is string => !!name)
    .map((name) => name.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return Array.from(new Set(names)).slice(0, 40);
}

function readCookingMethod(recipe: Record<string, unknown>): string | undefined {
  const direct = firstString(
    recipe.cookingMethod,
    recipe.cooking_method,
    recipe.method,
    recipe.technique,
  );
  if (direct) return direct;

  for (const key of ["cookingMethod", "cookingMethods", "cookingTechniques"]) {
    const value = recipe[key];
    if (Array.isArray(value)) {
      const method = value.find(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
      if (method) return method.trim();
    }
  }

  return undefined;
}

function readComplexity(
  recipe: Record<string, unknown>,
): RecipeLearningPayload["complexity"] | undefined {
  const raw = firstString(recipe.complexity, recipe.difficulty)?.toLowerCase();
  if (!raw) return undefined;
  if (raw === "simple" || raw === "easy" || raw === "beginner") {
    return "simple";
  }
  if (raw === "complex" || raw === "hard" || raw === "advanced") {
    return "complex";
  }
  if (raw === "moderate" || raw === "medium" || raw === "intermediate") {
    return "moderate";
  }
  return undefined;
}

export function buildRecipeLearningPayload(
  recipeLike: unknown,
  fallback: RecipeLearningFallback = {},
): RecipeLearningPayload {
  const recipe = asRecord(recipeLike) ?? {};
  const id = firstString(
    fallback.sourceRecipeId,
    fallback.id,
    recipe.id,
    recipe.recipeId,
  );
  const name = firstString(fallback.name, recipe.name, recipe.title);
  const cuisine = firstString(
    fallback.cuisine,
    recipe.cuisine,
    recipe.cuisineType,
  );

  return {
    ...(id ? { id } : {}),
    ...(name ? { name } : {}),
    ...(cuisine ? { cuisine } : {}),
    ingredients: readIngredientNames(recipe),
    ...(readCookingMethod(recipe)
      ? { cookingMethod: readCookingMethod(recipe) }
      : {}),
    ...(readComplexity(recipe) ? { complexity: readComplexity(recipe) } : {}),
    ...(readElementalBalance(recipe)
      ? { elementalBalance: readElementalBalance(recipe) }
      : {}),
  };
}
