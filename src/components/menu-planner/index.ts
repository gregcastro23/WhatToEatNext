/**
 * Menu Planner Components Index
 *
 * Exports all menu planner related components for easy importing.
 *
 * @file src/components/menu-planner/index.ts
 */

// Core components
export { default as WeeklyCalendar } from "./WeeklyCalendar";
export { default as MealSlot } from "./MealSlot";
export { default as RecipeSelector } from "./RecipeSelector";
export { default as RecipeQueue } from "./RecipeQueue";

// Dashboard components
export { default as NutritionalDashboard } from "./NutritionalDashboard";
export {
  default as InlineNutritionDashboard,
  DailyNutritionSummary,
  MacroRing,
} from "./InlineNutritionDashboard";

// Recipe display components
export {
  default as RecipeQuickView,
  RecipeGrid,
  RecipeList,
  MiniRecipeCard,
} from "./RecipeQuickView";

// Recommendation components
export {
  default as SmartRecommendations,
  QuickSuggestionBar,
} from "./SmartRecommendations";

// Browser and detail components
export { default as RecipeBrowserPanel } from "./RecipeBrowserPanel";
export { default as RecipeDetailModal } from "./RecipeDetailModal";

// Circuit metrics components
export { default as CircuitMetricsPanel } from "./CircuitMetricsPanel";
export { default as MealCircuitBadge } from "./MealCircuitBadge";

// Utility modals
export { default as GroceryListModal } from "./GroceryListModal";
export { default as CopyMealModal } from "./CopyMealModal";
