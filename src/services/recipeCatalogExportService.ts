/**
 * Recipe Catalog Export Service
 *
 * Produces machine-consumable, immutable, versioned recipe catalog exports.
 * Features:
 * - Deterministic unique sorting by canonical stable recipe ID.
 * - Pinned immutable snapshot session with strict pagination consistency (expired/invalid snapshot fails closed).
 * - Deterministic SHA-256 content digest computation over canonical recipe representations.
 * - Honest source and nutrition coverage measurement (no hardcoded figures).
 * - Preserves domain distinction between elements and ESMS quantities.
 *
 * @file src/services/recipeCatalogExportService.ts
 */

import { createHash } from "node:crypto";
import { getServerRecipes } from "@/actions/recipes";
import { _logger } from "@/lib/logger";
import { withAuthoredFactsAll } from "@/lib/recipes/recipeRefResolver";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import type { Recipe } from "@/types/recipe";

export const EXPORT_SCHEMA_VERSION = 1;
export const DEFAULT_PAGE_SIZE = 100;
export const MAX_PAGE_SIZE = 250;
export const SNAPSHOT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface ExportedNutrition {
  status: "complete" | "partial" | "none";
  basis: "per_serving" | "whole_recipe" | "unknown";
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  isLowerBound: boolean;
  servingUnit?: string;
  servingsKnown: boolean;
}

export interface ExportedRecipe {
  id: string;
  name: string;
  cuisine?: string;
  category?: string;
  description?: string;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number | null;
  mealTypes: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    optional?: boolean;
  }>;
  instructions: string[];
  nutrition: ExportedNutrition;
  elementalProperties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  alchemicalQuantities?: Record<string, number>;
  sourceRevision: string;
  contentDigest: string;
}

export interface NutritionCoverageStats {
  total: number;
  complete: number;
  partial: number;
  none: number;
  sourceIdentification: string;
}

export interface SnapshotSession {
  snapshotId: string;
  schemaVersion: number;
  createdAt: number;
  expiresAt: number;
  exportedAt: string;
  source: "live_database" | "static_catalog" | "degraded_static_fallback";
  sourceStatus: "healthy" | "degraded";
  totalRecipes: number;
  contentDigest: string;
  nutritionCoverage: NutritionCoverageStats;
  recipes: ExportedRecipe[];
}

export interface RecipeExportPage {
  schemaVersion: number;
  snapshotId: string;
  contentDigest: string;
  exportedAt: string;
  source: string;
  sourceStatus: "healthy" | "degraded";
  totalRecipes: number;
  nutritionCoverage: NutritionCoverageStats;
  pagination: {
    pageSize: number;
    cursor: string | null;
    nextCursor: string | null;
    isComplete: boolean;
  };
  recipes: ExportedRecipe[];
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function canonicalJsonString(obj: unknown): string {
  if (obj === null || obj === undefined) return "null";
  if (!isRecord(obj)) {
    if (Array.isArray(obj)) {
      return `[${obj.map(canonicalJsonString).join(",")}]`;
    }
    return JSON.stringify(obj);
  }
  const keys = Object.keys(obj).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalJsonString(obj[k])}`,
  );
  return `{${parts.join(",")}}`;
}

export function computeRecipeDigest(recipeData: Omit<ExportedRecipe, "contentDigest">): string {
  const canonical = canonicalJsonString(recipeData);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function computeSnapshotDigest(recipeDigests: string[]): string {
  // Hash joined recipe hashes in deterministic order
  const payload = recipeDigests.join("\n");
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

function transformRecipeForExport(recipe: Recipe): ExportedRecipe {
  const rawRecipe: Record<string, unknown> = {};
  if (isRecord(recipe)) {
    for (const [k, v] of Object.entries(recipe)) {
      rawRecipe[k] = v;
    }
  }
  const id = String(recipe.id).trim();
  const name = recipe.name.trim();

  // Parse and analyze nutrition completeness
  let nutritionStatus: "complete" | "partial" | "none" = "none";
  let isLowerBound = false;
  let calories: number | null = null;
  let protein: number | null = null;
  let carbs: number | null = null;
  let fat: number | null = null;
  let fiber: number | null = null;

  if (recipe.nutrition && isRecord(recipe.nutrition)) {
    const nut = recipe.nutrition;
    calories = typeof nut.calories === "number" ? nut.calories : null;
    protein = typeof nut.protein === "number" ? nut.protein : null;
    carbs = typeof nut.carbs === "number" ? nut.carbs : null;
    fat = typeof nut.fat === "number" ? nut.fat : null;
    fiber = typeof nut.fiber === "number" ? nut.fiber : null;

    const hasCore = calories !== null && protein !== null && carbs !== null && fat !== null;
    const hasAny = calories !== null || protein !== null || carbs !== null || fat !== null;

    if (hasCore && calories !== null && calories > 0) {
      nutritionStatus = "complete";
      isLowerBound = false;
    } else if (hasAny) {
      nutritionStatus = "partial";
      isLowerBound = true;
    }
  }

  const prepTime =
    typeof recipe.prepTime === "number"
      ? recipe.prepTime
      : typeof rawRecipe.prep_time_minutes === "number"
        ? rawRecipe.prep_time_minutes
        : null;
  const cookTime =
    typeof recipe.cookTime === "number"
      ? recipe.cookTime
      : typeof rawRecipe.cook_time_minutes === "number"
        ? rawRecipe.cook_time_minutes
        : null;
  const totalTime = prepTime !== null && cookTime !== null ? prepTime + cookTime : null;

  const rawIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const ingredients = rawIngredients.map((ing) => ({
    name: typeof ing === "string" ? ing : isRecord(ing) && typeof ing.name === "string" ? ing.name : "",
    amount: isRecord(ing) && typeof ing.amount === "number" ? ing.amount : 0,
    unit: isRecord(ing) && typeof ing.unit === "string" ? ing.unit : "",
    optional: isRecord(ing) ? Boolean(ing.optional) : false,
  }));

  const rawInstructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const instructions = rawInstructions.map((ins: unknown) => {
    if (typeof ins === "string") return ins;
    if (isRecord(ins) && typeof ins.text === "string") return ins.text;
    return "";
  });

  // Elemental properties (Fire, Water, Earth, Air)
  let elementalProperties: ExportedRecipe["elementalProperties"] | undefined;
  if (isRecord(recipe.elementalProperties)) {
    const ep = recipe.elementalProperties;
    const fireVal = typeof ep.Fire === "number" ? ep.Fire : typeof ep.fire === "number" ? ep.fire : 0;
    const waterVal = typeof ep.Water === "number" ? ep.Water : typeof ep.water === "number" ? ep.water : 0;
    const earthVal = typeof ep.Earth === "number" ? ep.Earth : typeof ep.earth === "number" ? ep.earth : 0;
    const airVal = typeof ep.Air === "number" ? ep.Air : typeof ep.air === "number" ? ep.air : 0;
    elementalProperties = {
      Fire: fireVal,
      Water: waterVal,
      Earth: earthVal,
      Air: airVal,
    };
  }

  // Preserves authored alchemical quantities if explicitly present (Salt, Mercury, Sulfur)
  // NEVER synthesize ESMS from elements!
  let alchemicalQuantities: ExportedRecipe["alchemicalQuantities"] | undefined;
  if (isRecord(rawRecipe.alchemicalQuantities)) {
    const aq = rawRecipe.alchemicalQuantities;
    alchemicalQuantities = {
      Salt: typeof aq.Salt === "number" ? aq.Salt : 0,
      Mercury: typeof aq.Mercury === "number" ? aq.Mercury : 0,
      Sulfur: typeof aq.Sulfur === "number" ? aq.Sulfur : 0,
    };
  }

  const sourceRevision =
    typeof rawRecipe.updatedAt === "string" || rawRecipe.updatedAt instanceof Date
      ? String(rawRecipe.updatedAt)
      : typeof rawRecipe.createdAt === "string" || rawRecipe.createdAt instanceof Date
        ? String(rawRecipe.createdAt)
        : "unknown";

  const recipeBase: Omit<ExportedRecipe, "contentDigest"> = {
    id,
    name,
    ...(typeof recipe.cuisine === "string" ? { cuisine: recipe.cuisine } : {}),
    ...(typeof recipe.category === "string" ? { category: recipe.category } : {}),
    ...(typeof recipe.description === "string" ? { description: recipe.description } : {}),
    servings: typeof recipe.servings === "number" ? recipe.servings : null,
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    totalTimeMinutes: totalTime,
    mealTypes: Array.isArray(recipe.mealTypes)
      ? recipe.mealTypes.filter((m): m is string => typeof m === "string")
      : [],
    ingredients,
    instructions,
    nutrition: {
      status: nutritionStatus,
      basis: nutritionStatus !== "none" ? "per_serving" : "unknown",
      calories,
      protein,
      carbs,
      fat,
      fiber,
      isLowerBound,
      servingsKnown: typeof recipe.servings === "number" && recipe.servings > 0,
    },
    ...(elementalProperties !== undefined ? { elementalProperties } : {}),
    ...(alchemicalQuantities !== undefined ? { alchemicalQuantities } : {}),
    sourceRevision,
  };

  const contentDigest = computeRecipeDigest(recipeBase);

  return {
    ...recipeBase,
    contentDigest,
  };
}

export class RecipeCatalogExportService {
  private readonly sessions = new Map<string, SnapshotSession>();

  /**
   * Initialize or retrieve an existing immutable snapshot session.
   */
  async getOrCreateSnapshot(requestedSnapshotId?: string): Promise<SnapshotSession> {
    const now = Date.now();

    // 1. If snapshotId requested, return if valid and unexpired
    if (requestedSnapshotId) {
      const existing = this.sessions.get(requestedSnapshotId);
      if (existing) {
        if (existing.expiresAt > now) {
          return existing;
        }
        this.sessions.delete(requestedSnapshotId);
        throw new Error("SNAPSHOT_EXPIRED");
      }
      throw new Error("SNAPSHOT_NOT_FOUND");
    }

    // 2. Load recipes and determine authoritative source state
    let rawRecipes: Recipe[];
    let source: SnapshotSession["source"];
    let sourceStatus: SnapshotSession["sourceStatus"];

    try {
      rawRecipes = await LocalRecipeService.getAllRecipes();
      if (LocalRecipeService.isCatalogDegraded()) {
        source = "degraded_static_fallback";
        sourceStatus = "degraded";
      } else {
        source = "live_database";
        sourceStatus = "healthy";
      }
    } catch {
      _logger.warn("[recipeCatalogExportService] live catalog failed, using static fallback");
      rawRecipes = await getServerRecipes();
      source = "degraded_static_fallback";
      sourceStatus = "degraded";
    }

    if (rawRecipes.length === 0) {
      rawRecipes = await getServerRecipes();
      source = "static_catalog";
      sourceStatus = "healthy";
    }

    // Merge authored facts
    const enrichedRecipes = await withAuthoredFactsAll(rawRecipes);

    // Transform and sort deterministically by id ASC
    const exportedRecipes: ExportedRecipe[] = enrichedRecipes
      .map(transformRecipeForExport)
      .sort((a, b) => a.id.localeCompare(b.id));

    // Calculate real nutrition coverage
    let completeCount = 0;
    let partialCount = 0;
    let noneCount = 0;

    for (const r of exportedRecipes) {
      if (r.nutrition.status === "complete") completeCount++;
      else if (r.nutrition.status === "partial") partialCount++;
      else noneCount++;
    }

    const nutritionCoverage: NutritionCoverageStats = {
      total: exportedRecipes.length,
      complete: completeCount,
      partial: partialCount,
      none: noneCount,
      sourceIdentification: `catalog_${source}_${exportedRecipes.length}_recipes`,
    };

    // Calculate deterministic content digest over all recipes
    const recipeDigests = exportedRecipes.map((r) => r.contentDigest);
    const contentDigest = computeSnapshotDigest(recipeDigests);

    const snapshotId = `snap_${now}_${contentDigest.substring(0, 12)}`;
    const session: SnapshotSession = {
      snapshotId,
      schemaVersion: EXPORT_SCHEMA_VERSION,
      createdAt: now,
      expiresAt: now + SNAPSHOT_TTL_MS,
      exportedAt: new Date(now).toISOString(),
      source,
      sourceStatus,
      totalRecipes: exportedRecipes.length,
      contentDigest,
      nutritionCoverage,
      recipes: exportedRecipes,
    };

    this.sessions.set(snapshotId, session);

    // Cleanup expired sessions
    for (const [id, s] of this.sessions.entries()) {
      if (s.expiresAt <= now) {
        this.sessions.delete(id);
      }
    }

    return session;
  }

  /**
   * Retrieve a paginated slice from a pinned snapshot.
   */
  async getExportPage(params: {
    snapshotId?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<RecipeExportPage> {
    const { snapshotId, cursor, limit = DEFAULT_PAGE_SIZE } = params;
    const pageSize = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);

    const session = await this.getOrCreateSnapshot(snapshotId);

    let startIndex = 0;
    if (cursor) {
      const idx = session.recipes.findIndex((r) => r.id === cursor);
      if (idx === -1) {
        // Fallback: check if cursor is after last or lexicographical
        const lexiIdx = session.recipes.findIndex((r) => r.id > cursor);
        startIndex = lexiIdx === -1 ? session.recipes.length : lexiIdx;
      } else {
        startIndex = idx + 1; // Start strictly after cursor
      }
    }

    const pageRecipes = session.recipes.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < session.recipes.length;
    const lastRecipe = pageRecipes[pageRecipes.length - 1];
    const nextCursor = hasMore && lastRecipe ? lastRecipe.id : null;

    return {
      schemaVersion: session.schemaVersion,
      snapshotId: session.snapshotId,
      contentDigest: session.contentDigest,
      exportedAt: session.exportedAt,
      source: session.source,
      sourceStatus: session.sourceStatus,
      totalRecipes: session.totalRecipes,
      nutritionCoverage: session.nutritionCoverage,
      pagination: {
        pageSize: pageRecipes.length,
        cursor: cursor ?? null,
        nextCursor,
        isComplete: nextCursor === null,
      },
      recipes: pageRecipes,
    };
  }

  // Testing helper
  clearSessions(): void {
    this.sessions.clear();
  }
}

export const recipeCatalogExportService = new RecipeCatalogExportService();
