/**
 * Database Client - High-Level Database Operations
 * Created: September 26, 2025
 *
 * Wrapper around database connection providing common CRUD operations
 * and query helpers for alchm.kitchen application
 */

import { logger } from "../logger";
import {
  checkDatabaseHealth,
  executeQuery,
  getDatabasePool,
  withTransaction,
} from "./connection";
import type {
  ElementalProperties,
  Ingredient,
  Insertable,
  PaginationResult,
  PlanetaryInfluence,
  QueryOptions,
  Recipe,
  RecipeSearch,
} from "./types";

// ==========================================
// INGREDIENT OPERATIONS
// ==========================================

export class IngredientService {
  static async getById(id: string): Promise<Ingredient | null> {
    const result = await executeQuery<Ingredient>(
      "SELECT * FROM ingredients WHERE id = $1 AND is_active = true",
      [id],
    );
    return result.rows[0] || null;
  }

  static async getByCategory(
    category: string,
    options: QueryOptions = {},
  ): Promise<PaginationResult<Ingredient>> {
    const {
      limit = 50,
      offset = 0,
      orderBy = "name",
      orderDirection = "ASC",
    } = options;

    const countResult = await executeQuery<{ count: number }>(
      "SELECT COUNT(*) as count FROM ingredients WHERE category = $1 AND is_active = true",
      [category],
    );

    const dataResult = await executeQuery<Ingredient>(
      `SELECT * FROM ingredients
       WHERE category = $1 AND is_active = true
       ORDER BY ${orderBy} ${orderDirection}
       LIMIT $2 OFFSET $3`,
      [category, limit, offset],
    );

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: dataResult.rows,
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  static async searchByName(
    searchTerm: string,
    limit = 20,
  ): Promise<Ingredient[]> {
    const result = await executeQuery<Ingredient>(
      `SELECT * FROM ingredients
       WHERE is_active = true AND name ILIKE $1
       ORDER BY name
       LIMIT $2`,
      [`%${searchTerm}%`, limit],
    );
    return result.rows;
  }

  static async getElementalProperties(
    ingredientId: string,
  ): Promise<ElementalProperties | null> {
    const result = await executeQuery<ElementalProperties>(
      `SELECT ep.* FROM elemental_properties ep
       WHERE ep.entity_type = 'ingredient' AND ep.entity_id = $1`,
      [ingredientId],
    );
    return result.rows[0] || null;
  }

  static async getPlanetaryInfluences(
    ingredientId: string,
  ): Promise<PlanetaryInfluence[]> {
    const result = await executeQuery<PlanetaryInfluence>(
      `SELECT pi.* FROM planetary_influences pi
       WHERE pi.entity_type = 'ingredient' AND pi.entity_id = $1
       ORDER BY pi.influence_strength DESC`,
      [ingredientId],
    );
    return result.rows;
  }

  static async getCompatibleIngredients(
    ingredientId: string,
    minScore = 0.7,
  ): Promise<
    Array<{
      ingredient: Ingredient;
      compatibility_score: number;
      interaction_type: string;
    }>
  > {
    const result = await executeQuery(
      `SELECT i.*, ic.compatibility_score, ic.interaction_type
       FROM ingredients i
       JOIN ingredient_compatibility ic ON (
         (ic.ingredient_a_id = $1 AND ic.ingredient_b_id = i.id) OR
         (ic.ingredient_b_id = $1 AND ic.ingredient_a_id = i.id)
       )
       WHERE i.is_active = true AND ic.compatibility_score >= $2
       ORDER BY ic.compatibility_score DESC`,
      [ingredientId, minScore],
    );
    return result.rows;
  }
}

// ==========================================
// RECIPE OPERATIONS
// ==========================================

export class RecipeService {
  static async getById(id: string): Promise<Recipe | null> {
    const result = await executeQuery<Recipe>(
      "SELECT * FROM recipes WHERE id = $1 AND is_public = true",
      [id],
    );
    return result.rows[0] || null;
  }

  static async getByCuisine(
    cuisine: string,
    options: QueryOptions = {},
  ): Promise<PaginationResult<Recipe>> {
    const {
      limit = 20,
      offset = 0,
      orderBy = "popularity_score",
      orderDirection = "DESC",
    } = options;

    const countResult = await executeQuery<{ count: number }>(
      "SELECT COUNT(*) as count FROM recipes WHERE cuisine = $1 AND is_public = true",
      [cuisine],
    );

    const dataResult = await executeQuery<Recipe>(
      `SELECT * FROM recipes
       WHERE cuisine = $1 AND is_public = true
       ORDER BY ${orderBy} ${orderDirection}
       LIMIT $2 OFFSET $3`,
      [cuisine, limit, offset],
    );

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: dataResult.rows,
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  static async searchRecipes(
    searchTerm: string,
    options: QueryOptions = {},
  ): Promise<PaginationResult<RecipeSearch>> {
    const { limit = 20, offset = 0 } = options;

    // Use full-text search on recipe names
    const countResult = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM recipes r
       WHERE r.is_public = true AND r.name ILIKE $1`,
      [`%${searchTerm}%`],
    );

    const dataResult = await executeQuery<RecipeSearch>(
      `SELECT
        r.id, r.name, r.description, r.cuisine, r.category,
        r.prep_time_minutes, r.cook_time_minutes, r.difficulty_level,
        r.dietary_tags, r.popularity_score, r.user_rating,
        ep.fire, ep.water, ep.earth, ep.air
       FROM recipes r
       LEFT JOIN elemental_properties ep ON (ep.entity_type = 'recipe' AND ep.entity_id = r.id)
       WHERE r.is_public = true AND r.name ILIKE $1
       ORDER BY r.popularity_score DESC, r.user_rating DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset],
    );

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: dataResult.rows,
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  static async getRecipeIngredients(recipeId: string): Promise<
    Array<{
      ingredient: Ingredient;
      quantity: number;
      unit: string;
      preparation_notes?: string;
      is_optional: boolean;
      order_index: number;
    }>
  > {
    const result = await executeQuery(
      `SELECT ri.quantity, ri.unit, ri.preparation_notes, ri.is_optional, ri.order_index,
              i.*
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = $1 AND i.is_active = true
       ORDER BY ri.order_index`,
      [recipeId],
    );
    return result.rows;
  }

  static async getRecipeContexts(recipeId: string): Promise<{
    moon_phases: string[];
    seasons: string[];
    time_of_day: string[];
    occasion: string[];
    energy_intention?: string;
  } | null> {
    const result = await executeQuery(
      `SELECT recommended_moon_phases, recommended_seasons, time_of_day, occasion, energy_intention
       FROM recipe_contexts
       WHERE recipe_id = $1`,
      [recipeId],
    );
    return result.rows[0] || null;
  }
}

// ==========================================
// ELEMENTAL OPERATIONS
// ==========================================

export class ElementalService {
  static async getEntityProperties(
    entityType: string,
    entityId: string,
  ): Promise<ElementalProperties | null> {
    const result = await executeQuery<ElementalProperties>(
      `SELECT * FROM elemental_properties
       WHERE entity_type = $1 AND entity_id = $2`,
      [entityType, entityId],
    );
    return result.rows[0] || null;
  }

  static async updateElementalProperties(
    entityType: string,
    entityId: string,
    properties: Insertable<ElementalProperties>,
  ): Promise<ElementalProperties> {
    const result = await withTransaction(async (client) => {
      // Check if properties already exist
      const existing = await client.query(
        "SELECT id FROM elemental_properties WHERE entity_type = $1 AND entity_id = $2",
        [entityType, entityId],
      );

      if (existing.rows.length > 0) {
        // Update existing
        const updateResult = await client.query<ElementalProperties>(
          `UPDATE elemental_properties
           SET fire = $3, water = $4, earth = $5, air = $6,
               calculation_method = $7, confidence_score = $8, updated_at = CURRENT_TIMESTAMP
           WHERE entity_type = $1 AND entity_id = $2
           RETURNING *`,
          [
            entityType,
            entityId,
            properties.fire,
            properties.water,
            properties.earth,
            properties.air,
            properties.calculation_method || "manual",
            properties.confidence_score || 1.0,
          ],
        );
        return updateResult.rows[0];
      } else {
        // Insert new
        const insertResult = await client.query<ElementalProperties>(
          `INSERT INTO elemental_properties
           (entity_type, entity_id, fire, water, earth, air, calculation_method, confidence_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            entityType,
            entityId,
            properties.fire,
            properties.water,
            properties.earth,
            properties.air,
            properties.calculation_method || "manual",
            properties.confidence_score || 1.0,
          ],
        );
        return insertResult.rows[0];
      }
    });

    return result;
  }
}

// ==========================================
// CACHE OPERATIONS
// ==========================================

export class CacheService {
  static async get(key: string): Promise<any | null> {
    try {
      const result = await executeQuery(
        `SELECT result_data FROM calculation_cache
         WHERE cache_key = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [key],
      );

      if (result.rows.length > 0) {
        // Update hit count and last accessed
        await executeQuery(
          `UPDATE calculation_cache
           SET hit_count = hit_count + 1, last_accessed_at = CURRENT_TIMESTAMP
           WHERE cache_key = $1`,
          [key],
        );

        return result.rows[0].result_data;
      }
    } catch (error) {
      void logger.warn("Cache retrieval failed", {
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return null;
  }

  static async set(key: string, data: any, ttlSeconds = 3600): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await executeQuery(
        `INSERT INTO calculation_cache (cache_key, calculation_type, input_data, result_data, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (cache_key) DO UPDATE SET
           result_data = EXCLUDED.result_data,
           expires_at = EXCLUDED.expires_at,
           hit_count = 0,
           last_accessed_at = CURRENT_TIMESTAMP`,
        [key, "general", {}, data, expiresAt],
      );
    } catch (error) {
      void logger.warn("Cache storage failed", {
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async invalidate(pattern: string): Promise<number> {
    try {
      const result = await executeQuery(
        "DELETE FROM calculation_cache WHERE cache_key LIKE $1",
        [`%${pattern}%`],
      );
      return result.rowCount || 0;
    } catch (error) {
      void logger.warn("Cache invalidation failed", {
        pattern,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return 0;
    }
  }

  static async cleanup(): Promise<number> {
    try {
      const result = await executeQuery(
        "SELECT clean_expired_cache() as deleted_count",
      );
      return result.rows[0].deleted_count || 0;
    } catch (error) {
      void logger.warn("Cache cleanup failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return 0;
    }
  }
}

// ==========================================
// HEALTH AND MONITORING
// ==========================================

export class DatabaseHealthService {
  static async getHealthStatus() {
    return await checkDatabaseHealth();
  }

  static async getMetrics(): Promise<{
    connectionPoolSize: number;
    activeConnections: number;
    idleConnections: number;
    totalCount: number;
    waitingClients: number;
  }> {
    const pool = getDatabasePool();
    return {
      connectionPoolSize: pool.options.max || 0,
      activeConnections: pool.totalCount - pool.idleCount,
      idleConnections: pool.idleCount,
      totalCount: pool.totalCount,
      waitingClients: pool.waitingCount,
    };
  }

  static async logSystemMetric(
    name: string,
    value: number,
    unit?: string,
    tags: Record<string, any> = {},
  ): Promise<void> {
    try {
      await executeQuery(
        `INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags)
         VALUES ($1, $2, $3, $4)`,
        [name, value, unit, tags],
      );
    } catch (error) {
      void logger.warn("Failed to log system metric", {
        name,
        value,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export async function initializeDatabaseData(): Promise<void> {
  void logger.info("Initializing database with seed data...");

  // This will be expanded in Phase 2 with actual data migration
  // For now, just ensure the database is responsive
  await executeQuery("SELECT 1");

  void logger.info("Database initialization complete");
}

export { checkDatabaseHealth };
