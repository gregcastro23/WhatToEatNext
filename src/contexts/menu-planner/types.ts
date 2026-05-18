/**
 * Menu Planner — TypeScript types and interfaces
 *
 * No runtime code lives here. All interfaces exported from MenuPlannerContext
 * are re-exported from this module so consumers can import from either path.
 *
 * @file src/contexts/menu-planner/types.ts
 */

import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type {
  WeeklyMenuCircuitMetrics,
  DayCircuitMetrics,
  MealCircuitMetrics,
  CircuitBottleneck,
  CircuitImprovementSuggestion,
} from "@/types/kinetics";
import type {
  WeeklyMenu,
  MealSlot,
  DayOfWeek,
  MealType,
  GroceryItem,
  WeeklyMenuStats,
  CalendarNavigation,
} from "@/types/menuPlanner";

// Re-export consumed types so callers only need one import path
export type {
  WeeklyMenu,
  MealSlot,
  DayOfWeek,
  MealType,
  GroceryItem,
  WeeklyMenuStats,
  CalendarNavigation,
  MonicaOptimizedRecipe,
  WeeklyMenuCircuitMetrics,
  DayCircuitMetrics,
  MealCircuitMetrics,
  CircuitBottleneck,
  CircuitImprovementSuggestion,
};

/**
 * Flavor preference type for generation
 */
export type FlavorPreference =
  | "spicy"
  | "sweet"
  | "savory"
  | "bitter"
  | "sour"
  | "umami";

/**
 * Daily nutritional targets for meal generation.
 * When set, recommendations will prioritize recipes that fill nutritional gaps.
 * null values mean "use default RDA targets".
 */
export interface NutritionalTargets {
  dailyCalories: number | null;
  dailyProteinG: number | null;
  dailyCarbsG: number | null;
  dailyFatG: number | null;
  dailyFiberG: number | null;
  prioritizeProtein: boolean;
  prioritizeFiber: boolean;
}

/**
 * Generation preferences for meal recommendation customization
 */
export interface GenerationPreferences {
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  excludeIngredients: string[];
  requiredIngredients: string[];
  preferredCookingMethods: string[];
  flavorPreferences: FlavorPreference[];
  maxPrepTimeMinutes: number | null;
  nutritionalTargets: NutritionalTargets;
}

/**
 * Guest alchemist participant for synastry calculations
 */
export interface Participant {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  location?: string;
}

/**
 * Full context type — the shape of everything returned by useMenuPlanner()
 */
export interface MenuPlannerContextType {
  // Guest alchemist participants
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, "id">, id?: string) => void;
  removeParticipant: (id: string) => void;

  // Current menu state
  currentMenu: WeeklyMenu | null;
  isLoading: boolean;
  error: Error | null;

  // Circuit metrics (Phase 3A)
  weeklyCircuitMetrics: WeeklyMenuCircuitMetrics | null;
  dayCircuitMetrics: Record<DayOfWeek, DayCircuitMetrics | null>;
  mealCircuitMetrics: Record<string, MealCircuitMetrics | null>;

  // Calendar navigation
  navigation: CalendarNavigation;

  // Meal operations
  addMealToSlot: (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
    recipe: MonicaOptimizedRecipe,
    servings?: number,
  ) => Promise<void>;
  removeMealFromSlot: (mealSlotId: string) => Promise<void>;
  updateMealServings: (mealSlotId: string, servings: number) => Promise<void>;
  copyMeal: (
    sourceMealSlotId: string,
    targetDay: DayOfWeek,
    targetMealType: MealType,
  ) => Promise<void>;
  moveMeal: (
    sourceMealSlotId: string,
    targetMealSlotId: string,
  ) => Promise<void>;
  swapMeals: (mealSlotId1: string, mealSlotId2: string) => Promise<void>;
  copyMealToSlots: (
    sourceMealSlotId: string,
    targetSlotIds: string[],
    servings?: number,
  ) => Promise<void>;
  moveMealToSlots: (
    sourceMealSlotId: string,
    targetSlotIds: string[],
    servings?: number,
  ) => Promise<void>;

  // Bulk operations
  clearDay: (dayOfWeek: DayOfWeek) => Promise<void>;
  clearWeek: () => Promise<void>;
  regenerateDay: (dayOfWeek: DayOfWeek) => Promise<void>;
  generateMealsForDay: (
    dayOfWeek: DayOfWeek,
    options?: {
      mealTypes?: MealType[];
      dietaryRestrictions?: string[];
      preferredCuisines?: string[];
      excludeIngredients?: string[];
      requiredIngredients?: string[];
      preferredCookingMethods?: string[];
      flavorPreferences?: string[];
      maxPrepTimeMinutes?: number | null;
      useCurrentPlanetary?: boolean;
      usePersonalization?: boolean;
    },
  ) => Promise<void>;

  // Sauce operations
  addSauceToMeal: (
    mealSlotId: string,
    sauceId: string,
    servings?: number,
  ) => void;
  removeSauceFromMeal: (mealSlotId: string) => void;
  updateSauceServings: (mealSlotId: string, servings: number) => void;

  // Meal lock operations
  lockMeal: (mealSlotId: string) => void;
  unlockMeal: (mealSlotId: string) => void;
  isMealLocked: (mealSlotId: string) => boolean;

  // Grocery list
  groceryList: GroceryItem[];
  updateGroceryItem: (itemId: string, updates: Partial<GroceryItem>) => void;
  regenerateGroceryList: () => void;

  // Menu templates
  saveAsTemplate: (name: string, description?: string) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;

  // Statistics
  weeklyStats: WeeklyMenuStats | null;
  refreshStats: () => void;

  // Template persistence state
  isTemplateSaving: boolean;
  isTemplateLoading: boolean;
  persistenceError: Error | null;

  // Circuit operations (Phase 3A)
  calculateMealCircuit: (
    mealSlotId: string,
  ) => Promise<MealCircuitMetrics | null>;
  calculateDayCircuit: (
    dayOfWeek: DayOfWeek,
  ) => Promise<DayCircuitMetrics | null>;
  calculateWeeklyCircuit: () => Promise<WeeklyMenuCircuitMetrics | null>;
  refreshCircuitMetrics: () => Promise<void>;
  findBottlenecks: () => CircuitBottleneck[];
  getSuggestions: () => CircuitImprovementSuggestion[];

  // Persistence
  saveMenu: () => Promise<void>;
  loadMenu: (menuId: string) => Promise<void>;

  // Lunar Sync
  syncWithLunarCycle: boolean;
  toggleSyncWithLunarCycle: () => void;

  // Budget
  weeklyBudget: number | null;
  setWeeklyBudget: (budget: number | null) => void;
  estimatedWeeklyCost: number;
  costConfidence: "high" | "medium" | "low";
  costBreakdown: Array<{
    ingredient: string;
    estimatedCost: number;
    confidence: string;
  }>;
  budgetPerMeal: number | null;

  // Inventory / Posso
  inventory: string[];
  setInventory: (inv: string[]) => void;

  // Generation Preferences
  generationPreferences: GenerationPreferences;
  setGenerationPreferences: (prefs: GenerationPreferences) => void;
  updateGenerationPreference: <K extends keyof GenerationPreferences>(
    key: K,
    value: GenerationPreferences[K],
  ) => void;
  resetGenerationPreferences: () => void;
}
