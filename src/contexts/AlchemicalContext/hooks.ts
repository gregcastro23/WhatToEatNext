"use client";

import { useContext } from "react";
import { AlchemicalContext } from "./context";
import type { AlchemicalContextType } from "./types";

/**
 * Hook to access the AlchemicalContext.
 * Returns the context value (which always exists due to the default value
 * on the context). Logs a warning if called outside the provider tree
 * but does NOT throw, avoiding blank-screen crashes.
 */
export const useAlchemical = (): AlchemicalContextType => {
  const context = useContext(AlchemicalContext);

  if (!context) {
    console.warn(
      "[useAlchemical] Context is null — component may be outside AlchemicalProvider. Using default values.",
    );
  }

  // AlchemicalContext is created with a full default value, so context
  // should never actually be null. The guard above is purely defensive.
  return context as AlchemicalContextType;
};

/**
 * Safe variant that returns null when the provider is missing,
 * useful for optional integrations that should degrade gracefully.
 */
export const useAlchemicalSafe = (): AlchemicalContextType | null => {
  return useContext(AlchemicalContext) ?? null;
};
