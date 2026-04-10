/**
 * Database Module Index - Phase 1 Infrastructure Migration
 * Created: September 26, 2025
 *
 * Central export point for all database functionality
 * in the alchm.kitchen application
 */

// Connection and low-level utilities
export {
  checkDatabaseHealth,
  closeDatabase,
  executeQuery,
  executeQueryWithRetry,
  getDatabasePool,
  initializeDatabase,
  withTransaction,
} from "./connection";

// Type definitions
export type {
  ActiveUser,
  ApiKey,
  CalculationCache,
  CuisineType,
  DailyEphemerisCacheRecord,
  DatabaseTable,
  DietaryRestriction,
  ElementalProperties,
  Ingredient,
  IngredientCompatibility,
  IngredientCuisine,
  Insertable,
  LunarPhase,
  PaginationResult,
  PlanetType,
  PlanetaryInfluence,
  QueryOptions,
  QuestDefinitionRecord,
  Recipe,
  RecipeContext,
  RecipeIngredient,
  RecipeSearch,
  Recommendation,
  Season,
  SeasonalAssociation,
  ShopItemRecord,
  SystemMetric,
  TokenBalanceRecord,
  TokenTransactionRecord,
  Updatable,
  User,
  UserCalculation,
  UserPurchaseRecord,
  UserQuestProgressRecord,
  UserRole,
  UserStreakRecord,
  UserYieldProfileRecord,
  ZodiacAffinity,
  ZodiacSignType,
} from "./types";

// High-level service classes
export {
  CacheService,
  DatabaseHealthService,
  ElementalService,
  IngredientService,
  RecipeService,
  initializeDatabaseData,
} from "./client";
