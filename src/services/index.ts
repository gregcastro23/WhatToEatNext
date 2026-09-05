// Core consolidated services
export { alchemicalService } from "./AlchemicalService";
export { currentMomentManager } from "./CurrentMomentManager";
export { ingredientService } from "./IngredientService";
// DISABLED - Services have been deleted or renamed
// export { recipeService } from "./RecipeService";
export {
  fetchPlanetaryPositions,
  getCurrentPlanetaryPositions,
  getPlanetaryPositionsForDateTime,
  testAstrologizeApi,
} from "./astrologizeApi";

// Core alchemical calculation service
export { alchemize } from "./RealAlchemizeService";
export type {
  PlanetaryPosition,
  StandardizedAlchemicalResult,
  ThermodynamicProperties,
} from "./RealAlchemizeService";

// Logging service
export { log } from "./LoggingService";

// Services manager for initialization and lifecycle management
export const servicesManager = {
  initialized: false,

  initialize(): Promise<
    | { status: "already-initialized" }
    | { status: "success" }
    | { status: "error"; error: unknown }
  > {
    if (this.initialized) {
      return Promise.resolve({ status: "already-initialized" });
    }

    try {
      // Initialize services here
      this.initialized = true;
      return Promise.resolve({ status: "success" });
    } catch (error) {
      console.error("Services initialization failed:", error);
      return Promise.resolve({ status: "error", error });
    }
  },

  getStatus() {
    return {
      initialized: this.initialized,
      services: {
        alchemical: true,
        ingredient: true,
        recipe: true,
        recommendation: true,
      },
    };
  },
};

// Export as enum for code using InitializationStatus.COMPLETED
export const InitializationStatus = {
  NOT_STARTED: "not-started" as const,
  IN_PROGRESS: "in-progress" as const,
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
  ALREADY_INITIALIZED: "already-initialized" as const,
} as const;

// Type alias for backward compatibility
export type InitializationStatusType =
  | "success"
  | "error"
  | "already-initialized"
  | "not-started"
  | "in-progress"
  | "completed"
  | "failed";
