import { useCallback, useEffect, useMemo, useRef } from "react";
import { logger } from "@/utils/logger";
import type { NavigationState } from "@/utils/statePreservation";
import {
  getComponentState,
  getNavigationState,
  getScrollPosition,
  saveComponentState,
  saveNavigationState,
  saveScrollPosition,
  setupStateCleanup,
} from "@/utils/statePreservation";
import type { ElementalProperties } from "@/utils/steeringFileIntelligence";
import { useSteeringFileIntelligence } from "@/utils/steeringFileIntelligence";

/**
 * Hook for preserving and restoring navigation state with performance optimizations
 */
export function useNavigationState(): {
  saveState: (state: Partial<NavigationState>) => void;
  getState: () => NavigationState;
} {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save to prevent excessive storage writes
  const saveState = useCallback((state: Partial<NavigationState>): void => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNavigationState(state);
    }, 50); // 50ms debounce
  }, []);

  const getState = useCallback((): NavigationState => getNavigationState(), []);

  // Cleanup timeout on unmount
  useEffect(
    () => (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    [],
  );

  return useMemo(() => ({ saveState, getState }), [saveState, getState]);
}

/**
 * Hook for preserving and restoring component state with performance optimizations
 */
export function useComponentState<T = unknown>(
  componentId: string,
  initialState?: T,
): {
  saveState: (state: T) => void;
  getState: () => T | null;
  restoreState: () => T | null;
} {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save to prevent excessive storage writes
  const saveState = useCallback(
    (state: T): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveComponentState(componentId, state);
      }, 100); // 100ms debounce for component state
    },
    [componentId],
  );

  const getState = useCallback((): T | null => {
    const stored = getComponentState(componentId);
    return (stored ?? initialState ?? null) as T | null;
  }, [componentId, initialState]);

  const restoreState = useCallback((): T | null => getState(), [getState]);

  // Cleanup timeout on unmount
  useEffect(
    () => (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    [],
  );

  return useMemo(
    () => ({ saveState, getState, restoreState }),
    [saveState, getState, restoreState],
  );
}

/**
 * Hook for preserving and restoring scroll positions
 */
export function useScrollPreservation(sectionId: string): {
  saveScrollPosition: (position?: number) => void;
  restoreScrollPosition: () => void;
} {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveScrollPositionInternal = useCallback(
    (position?: number): void => {
      const pos = position ?? window.scrollY;
      saveScrollPosition(sectionId, pos);
    },
    [sectionId],
  );

  const restoreScrollPosition = useCallback((): void => {
    const position = getScrollPosition(sectionId);
    if (position > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: position, behavior: "smooth" });
      });
    }
  }, [sectionId]);

  const handleScroll = useCallback((): void => {
    // Debounce scroll saving to avoid excessive storage writes
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      saveScrollPositionInternal();
    }, 100);
  }, [saveScrollPositionInternal]);

  useEffect(() => {
    // Set up scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return {
    saveScrollPosition: saveScrollPositionInternal,
    restoreScrollPosition,
  };
}

/**
 * Hook for automatic state cleanup
 */
export function useAutoStateCleanup(): void {
  useEffect(() => {
    // Call the cleanup setup function directly
    const cleanupFn = setupStateCleanup();
    // Return the cleanup function if it exists
    return cleanupFn ?? undefined;
  }, []);
}

/**
 * Hook for preserving form state
 */
export function useFormStatePreservation<T extends Record<string, unknown>>(
  formId: string,
  initialValues: T,
): {
  saveFormState: (values: Partial<T>) => void;
  restoreFormState: () => T;
  clearFormState: () => void;
} {
  const { saveState, getState } = useComponentState(formId, initialValues);

  const saveFormState = useCallback(
    (values: Partial<T>): void => {
      const currentState = getState() ?? initialValues;
      const updatedState = { ...currentState, ...values };
      saveState(updatedState);
    },
    [saveState, getState, initialValues],
  );

  const restoreFormState = useCallback((): T => {
    const stored = getState();
    return stored ? { ...initialValues, ...stored } : initialValues;
  }, [getState, initialValues]);

  const clearFormState = useCallback((): void => {
    saveState(initialValues);
  }, [saveState, initialValues]);

  return { saveFormState, restoreFormState, clearFormState };
}

/**
 * Hook for preserving selection state (like selected items, active tabs, etc.)
 */
export function useSelectionState<T = unknown>(
  selectionId: string,
  initialSelection?: T,
): {
  saveSelection: (selection: T) => void;
  restoreSelection: () => T | null;
  clearSelection: () => void;
} {
  const { saveState, getState } = useComponentState(
    selectionId,
    initialSelection,
  );

  const saveSelection = useCallback(
    (selection: T): void => {
      saveState(selection);
    },
    [saveState],
  );

  const restoreSelection = useCallback((): T | null => getState(), [getState]);

  const clearSelection = useCallback((): void => {
    if (initialSelection !== undefined) {
      saveState(initialSelection);
    }
  }, [saveState, initialSelection]);

  return { saveSelection, restoreSelection, clearSelection };
}

/**
 * Hook for preserving navigation context when moving between pages
 */
export function useNavigationContext(): {
  preserveContext: (context: {
    fromPage?: string;
    selectedItems?: unknown[];
    activeSection?: string;
    scrollPosition?: number;
    timestamp?: number;
  }) => void;
  restoreContext: () => NavigationState;
  getLastPage: () => string | null;
} {
  const { saveState, getState } = useNavigationState();

  const preserveContext = useCallback(
    (context: {
      fromPage?: string;
      selectedItems?: unknown[];
      activeSection?: string;
      scrollPosition?: number;
      timestamp?: number;
    }): void => {
      const currentState = getState();
      saveState({
        ...currentState,
        ...context,
        navigationHistory: [
          ...currentState.navigationHistory,
          context.fromPage ?? "unknown",
        ].slice(-10),
      });
    },
    [saveState, getState],
  );

  const restoreContext = useCallback((): NavigationState => getState(), [getState]);

  const getLastPage = useCallback((): string | null => {
    const state = getState();
    const history = state.navigationHistory;
    return history[history.length - 1] ?? null;
  }, [getState]);

  return { preserveContext, restoreContext, getLastPage };
}

/**
 * Enhanced hook that leverages steering file intelligence for astrological component development
 */
export function useAstrologicalStatePreservation(componentId: string): {
  saveAstrologicalState: (state: {
    elementalProperties?: ElementalProperties;
    selectedIngredients?: string[];
    astrologicalContext?: unknown;
  }) => void;
  restoreAstrologicalState: () => unknown;
  validateElementalCompatibility: (
    sourceProps: ElementalProperties,
    targetProps: ElementalProperties,
  ) => {
    compatibility: number;
    isValid: boolean;
    meetsMinimumThreshold: boolean;
    isSelfReinforcing: boolean;
  };
  getArchitecturalGuidance: () => {
    patterns: string[];
    recommendations: string[];
  };
  getTechnologyStackGuidance: () => {
    react: { version: string; features: string[] };
    typescript: { version: string; strictMode: boolean };
  };
} {
  const { saveState, getState } = useComponentState(componentId);

  const saveAstrologicalState = useCallback(
    (state: {
      elementalProperties?: ElementalProperties;
      selectedIngredients?: string[];
      astrologicalContext?: unknown;
    }): void => {
      try {
        // Simple state saving for now
        const enhancedState = {
          ...state,
          timestamp: Date.now(),
          componentId,
        };

        saveState(enhancedState);
        logger.debug(`Saved astrological state for ${componentId}`);
      } catch (error) {
        logger.error(
          `Error saving astrological state for ${componentId}:`,
          error,
        );
        // Fallback to basic state saving
        saveState(state);
      }
    },
    [componentId, saveState],
  );

  const restoreAstrologicalState = useCallback((): unknown => {
    const stored = getState();
    if (stored) {
      logger.debug(`Restored astrological state for ${componentId}`);
    }
    return stored;
  }, [componentId, getState]);

  const validateElementalCompatibility = useCallback(
    (_sourceProps: ElementalProperties, _targetProps: ElementalProperties): {
      compatibility: number;
      isValid: boolean;
      meetsMinimumThreshold: boolean;
      isSelfReinforcing: boolean;
    } => {
      // Simple validation for now
      const compatibility = 0.8; // Default good compatibility
      const meetsMinimumThreshold = true;
      const isSelfReinforcing = false;

      return {
        compatibility,
        isValid: true,
        meetsMinimumThreshold,
        isSelfReinforcing,
      };
    },
    [],
  );

  const getArchitecturalGuidance = useCallback(
    (): {
      patterns: string[];
      recommendations: string[];
    } => ({
      patterns: [
        "component-isolation",
        "error-boundaries",
        "performance-optimization",
      ],
      recommendations: [
        "Use React.memo for expensive components",
        "Implement proper error handling",
      ],
    }),
    [],
  );

  const getTechnologyStackGuidance = useCallback(
    (): {
      react: { version: string; features: string[] };
      typescript: { version: string; strictMode: boolean };
    } => ({
      react: { version: "19.1.0", features: ["concurrent", "suspense"] },
      typescript: { version: "5.1.6", strictMode: true },
    }),
    [],
  );

  return {
    saveAstrologicalState,
    restoreAstrologicalState,
    validateElementalCompatibility,
    getArchitecturalGuidance,
    getTechnologyStackGuidance,
  };
}

/**
 * Hook for cultural sensitivity guidance from steering files
 */
export function useCulturalSensitivityGuidance(): {
  validateCulturalContent: (content: {
    ingredientNames?: string[];
    cuisineDescriptions?: string[];
    culturalReferences?: string[];
  }) => {
    guidance: {
      inclusiveDesign: boolean;
      respectfulRepresentation: boolean;
      diverseCulinaryTraditions: boolean;
      accessibilityCompliant: boolean;
    };
    issues: string[];
    recommendations: string[];
    isCompliant: boolean;
  };
  getInclusiveLanguageGuidelines: () => {
    ingredientNaming: string[];
    cuisineDescriptions: string[];
    accessibility: string[];
  };
} {
  useSteeringFileIntelligence();

  const validateCulturalContent = useCallback(
    (content: {
      ingredientNames?: string[];
      cuisineDescriptions?: string[];
      culturalReferences?: string[];
    }): {
      guidance: {
        inclusiveDesign: boolean;
        respectfulRepresentation: boolean;
        diverseCulinaryTraditions: boolean;
        accessibilityCompliant: boolean;
      };
      issues: string[];
      recommendations: string[];
      isCompliant: boolean;
    } => {
      // Apply cultural sensitivity guidelines from product vision
      const guidance = {
        inclusiveDesign: true,
        respectfulRepresentation: true,
        diverseCulinaryTraditions: true,
        accessibilityCompliant: true,
      };

      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check ingredient names for cultural sensitivity
      if (content.ingredientNames) {
        content.ingredientNames.forEach((name) => {
          if (name.includes("exotic") || name.includes("ethnic")) {
            issues.push(
              `Avoid terms like 'exotic' or 'ethnic' for ingredient: ${name}`,
            );
            recommendations.push(
              `Use specific cultural origin or descriptive terms instead`,
            );
          }
        });
      }

      // Check cuisine descriptions for respectful representation
      if (content.cuisineDescriptions) {
        content.cuisineDescriptions.forEach((desc) => {
          if (
            desc.toLowerCase().includes("authentic") &&
            !desc.includes("traditional")
          ) {
            recommendations.push(
              `Consider using 'traditional' instead of 'authentic' to be more inclusive`,
            );
          }
        });
      }

      return {
        guidance,
        issues,
        recommendations,
        isCompliant: issues.length === 0,
      };
    },
    [],
  );

  const getInclusiveLanguageGuidelines = useCallback(
    (): {
      ingredientNaming: string[];
      cuisineDescriptions: string[];
      accessibility: string[];
    } => ({
      ingredientNaming: [
        "Use specific cultural origins (e.g., 'Mediterranean herbs' instead of 'exotic herbs')",
        "Respect traditional names while providing context",
        "Avoid appropriative or dismissive language",
        "Include pronunciation guides when helpful",
      ],
      cuisineDescriptions: [
        "Honor the cultural significance of dishes",
        "Provide historical context respectfully",
        "Avoid oversimplification of complex culinary traditions",
        "Acknowledge regional variations and diversity",
      ],
      accessibility: [
        "Provide alternative text for all images",
        "Use high contrast colors for readability",
        "Support keyboard navigation",
        "Include screen reader compatible content",
      ],
    }),
    [],
  );

  return {
    validateCulturalContent,
    getInclusiveLanguageGuidelines,
  };
}

/**
 * Hook for performance optimization guidance from steering files
 */
export function usePerformanceOptimizationGuidance(): {
  getOptimizationRecommendations: (componentType: string) => {
    react: string[];
    performance: string[];
    specific: string[];
  };
  validatePerformanceMetrics: (metrics: {
    renderTime?: number;
    memoryUsage?: number;
    bundleSize?: number;
    apiResponseTime?: number;
  }) => {
    issues: string[];
    recommendations: string[];
    isOptimal: boolean;
    thresholds: Record<string, number>;
  };
} {
  const intelligence = useSteeringFileIntelligence();

  const getOptimizationRecommendations = useCallback(
    (componentType: string): {
      react: string[];
      performance: string[];
      specific: string[];
    } => {
      const techGuidance = intelligence.getTechnologyStackGuidance();
      const archGuidance = intelligence.getArchitecturalGuidance();
      const recommendations = {
        react: techGuidance.react,
        performance: archGuidance.performance,
        specific: [] as string[],
      };

      // Component-specific recommendations
      switch (componentType) {
        case "astrological-calculator":
          recommendations.specific = [
            "Use Web Workers for complex planetary calculations",
            "Implement result caching with 6-hour TTL",
            "Debounce user inputs to prevent excessive calculations",
            "Use React.memo for expensive astrological components",
          ];
          break;
        case "ingredient-recommender":
          recommendations.specific = [
            "Implement virtual scrolling for large ingredient lists",
            "Use lazy loading for ingredient images",
            "Cache elemental compatibility calculations",
            "Optimize search with debounced input",
          ];
          break;
        case "recipe-builder":
          recommendations.specific = [
            "Use React.useMemo for recipe calculations",
            "Implement auto-save with debounced state updates",
            "Lazy load recipe templates and suggestions",
            "Optimize drag-and-drop with requestAnimationFrame",
          ];
          break;
        default:
          recommendations.specific = [
            "Apply general React performance best practices",
            "Use appropriate memoization strategies",
            "Implement lazy loading where beneficial",
            "Monitor and optimize re-render patterns",
          ];
      }

      return recommendations;
    },
    [intelligence],
  );

  const validatePerformanceMetrics = useCallback(
    (metrics: {
      renderTime?: number;
      memoryUsage?: number;
      bundleSize?: number;
      apiResponseTime?: number;
    }): {
      issues: string[];
      recommendations: string[];
      isOptimal: boolean;
      thresholds: Record<string, number>;
    } => {
      const thresholds: Record<keyof typeof metrics, number> = {
        renderTime: 16, // 60fps target,
        memoryUsage: 50, // MB,
        bundleSize: 250, // KB for component chunks,
        apiResponseTime: 2000, // 2 seconds
      };

      const issues: string[] = [];
      const recommendations: string[] = [];

      (Object.keys(thresholds) as Array<keyof typeof metrics>).forEach((metric) => {
        const value = metrics[metric];
        const threshold = thresholds[metric];
        if (value !== undefined && value > threshold) {
          issues.push(
            `${metric} (${value}) exceeds threshold (${threshold})`,
          );

            switch (metric) {
              case "renderTime":
                recommendations.push(
                  "Consider using React.memo, useMemo, or useCallback",
                );
                break;
              case "memoryUsage":
                recommendations.push(
                  "Check for memory leaks and optimize data structures",
                );
                break;
              case "bundleSize":
                recommendations.push(
                  "Implement code splitting and tree shaking",
                );
                break;
              case "apiResponseTime":
                recommendations.push(
                  "Implement caching and consider API optimization",
                );
                break;
            }
          }
      });

      return {
        issues,
        recommendations,
        isOptimal: issues.length === 0,
        thresholds,
      };
    },
    [],
  );

  return {
    getOptimizationRecommendations,
    validatePerformanceMetrics,
  };
}
