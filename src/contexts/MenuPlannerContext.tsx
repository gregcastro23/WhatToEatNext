"use client";

/**
 * Menu Planner Context — barrel re-export for backward compatibility.
 *
 * All implementation has been moved to src/contexts/menu-planner/.
 * This file keeps the public import path `@/contexts/MenuPlannerContext`
 * working without requiring any consumer changes.
 *
 * @file src/contexts/MenuPlannerContext.tsx
 */

// Types
export type {
  FlavorPreference,
  NutritionalTargets,
  GenerationPreferences,
  Participant,
  MenuPlannerContextType,
} from "./menu-planner/types";

// Context, hook, and provider
export {
  MenuPlannerContext,
  useMenuPlanner,
  MenuPlannerProvider,
  MenuPlannerProvider as default,
} from "./menu-planner/MenuPlannerProvider";
