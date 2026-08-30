"use client";

/**
 * Recipe Queue Context
 * State management for recipe queue (recipes saved for later use)
 *
 * @file src/contexts/RecipeQueueContext.tsx
 * @created 2026-01-10 (Phase 2)
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { z } from "zod";
import { RecipeSchema } from "@/lib/validation/apiSchemas";
import type { Recipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RecipeQueueContext");

const STORAGE_KEY = "alchm-recipe-queue";

const queuedRecipeEnvelopeSchema = z
  .object({
    id: z.string().min(1),
    recipe: z.unknown(),
    addedAt: z.union([z.string(), z.number(), z.date()]).optional(),
    notes: z.string().optional(),
    suggestedMealTypes: z.array(z.string()).optional(),
    suggestedDays: z.array(z.number().finite()).optional(),
  })
  .passthrough();

/**
 * Queue item with metadata
 */
export interface QueuedRecipe {
  id: string;
  recipe: Recipe;
  addedAt: Date;
  notes?: string;
  suggestedMealTypes?: string[];
  suggestedDays?: number[];
}

/**
 * Context type definition
 */
export interface RecipeQueueContextType {
  // State
  queue: QueuedRecipe[];
  queueSize: number;

  // Actions
  addToQueue: (recipe: Recipe, metadata?: Partial<QueuedRecipe>) => void;
  removeFromQueue: (queueItemId: string) => void;
  clearQueue: () => void;
  updateQueueItem: (
    queueItemId: string,
    updates: Partial<QueuedRecipe>,
  ) => void;
  isInQueue: (recipeId: string) => boolean;
  getQueueItem: (recipeId: string) => QueuedRecipe | undefined;

  // Utilities
  reorderQueue: (startIndex: number, endIndex: number) => void;
  exportQueue: () => string;
  importQueue: (jsonData: string) => boolean;
}

const RecipeQueueContext = createContext<RecipeQueueContextType | undefined>(
  undefined,
);

function normalizeStoredRecipe(value: unknown): Recipe | null {
  const parsed = RecipeSchema.safeParse(value);
  if (!parsed.success) return null;

  const { cookingMethod, ...recipe } = parsed.data;
  return {
    ...recipe,
    cookingMethod:
      typeof cookingMethod === "string" ? [cookingMethod] : cookingMethod,
  };
}

function restoreDate(value: unknown): Date {
  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(
          typeof value === "string" || typeof value === "number"
            ? value
            : Date.now(),
        );
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function normalizeStoredQueue(value: unknown): QueuedRecipe[] | null {
  if (!Array.isArray(value)) return null;

  return value.flatMap((item) => {
    const parsed = queuedRecipeEnvelopeSchema.safeParse(item);
    if (!parsed.success) return [];

    const recipe = normalizeStoredRecipe(parsed.data.recipe);
    if (!recipe) return [];

    const { recipe: _storedRecipe, addedAt, ...metadata } = parsed.data;
    return [
      {
        ...metadata,
        id: parsed.data.id,
        recipe,
        addedAt: restoreDate(addedAt),
        notes: parsed.data.notes,
        suggestedMealTypes: parsed.data.suggestedMealTypes,
        suggestedDays: parsed.data.suggestedDays,
      },
    ];
  });
}

/**
 * Recipe Queue Provider Component
 */
export function RecipeQueueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<QueuedRecipe[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const restoredQueue = normalizeStoredQueue(parsed);
        if (!restoredQueue) {
          throw new Error("Invalid recipe queue storage payload");
        }
        setQueue(restoredQueue);
        logger.info(`Loaded ${restoredQueue.length} items from queue storage`);
      }
    } catch (error) {
      logger.error("Failed to load recipe queue from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      logger.debug(`Saved queue with ${queue.length} items to localStorage`);
    } catch (error) {
      logger.error("Failed to save recipe queue to localStorage:", error);
    }
  }, [queue, isInitialized]);

  /**
   * Add recipe to queue
   */
  const addToQueue = useCallback(
    (recipe: Recipe, metadata?: Partial<QueuedRecipe>) => {
      try {
        // Check if recipe already in queue
        const existingIndex = queue.findIndex(
          (item) => item.recipe.id === recipe.id,
        );

        if (existingIndex >= 0) {
          logger.warn(
            `Recipe "${recipe.name}" already in queue, updating metadata`,
          );
          // Update existing item
          setQueue((prev) => {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...metadata,
              addedAt: new Date(), // Refresh timestamp
            };
            return updated;
          });
        } else {
          // Add new item
          const queueItem: QueuedRecipe = {
            id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            recipe,
            addedAt: new Date(),
            ...metadata,
          };

          setQueue((prev) => [...prev, queueItem]);
          logger.info(`Added "${recipe.name}" to queue`);
        }
      } catch (error) {
        logger.error("Failed to add recipe to queue:", error);
      }
    },
    [queue],
  );

  /**
   * Remove recipe from queue
   */
  const removeFromQueue = useCallback((queueItemId: string) => {
    try {
      setQueue((prev) => {
        const filtered = prev.filter((item) => item.id !== queueItemId);
        logger.info(`Removed item from queue (${filtered.length} remaining)`);
        return filtered;
      });
    } catch (error) {
      logger.error("Failed to remove recipe from queue:", error);
    }
  }, []);

  /**
   * Clear entire queue
   */
  const clearQueue = useCallback(() => {
    try {
      setQueue([]);
      logger.info("Cleared recipe queue");
    } catch (error) {
      logger.error("Failed to clear queue:", error);
    }
  }, []);

  /**
   * Update queue item metadata
   */
  const updateQueueItem = useCallback(
    (queueItemId: string, updates: Partial<QueuedRecipe>) => {
      try {
        setQueue((prev) => {
          const index = prev.findIndex((item) => item.id === queueItemId);
          if (index === -1) {
            logger.warn(`Queue item ${queueItemId} not found`);
            return prev;
          }

          const updated = [...prev];
          updated[index] = { ...updated[index], ...updates };
          logger.debug(`Updated queue item ${queueItemId}`);
          return updated;
        });
      } catch (error) {
        logger.error("Failed to update queue item:", error);
      }
    },
    [],
  );

  /**
   * Check if recipe is in queue
   */
  const isInQueue = useCallback(
    (recipeId: string): boolean => queue.some((item) => item.recipe.id === recipeId),
    [queue],
  );

  /**
   * Get queue item by recipe ID
   */
  const getQueueItem = useCallback(
    (recipeId: string): QueuedRecipe | undefined => queue.find((item) => item.recipe.id === recipeId),
    [queue],
  );

  /**
   * Reorder queue items (for drag-and-drop)
   */
  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    try {
      setQueue((prev) => {
        const result = Array.from(prev);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        logger.debug(`Reordered queue: ${startIndex} → ${endIndex}`);
        return result;
      });
    } catch (error) {
      logger.error("Failed to reorder queue:", error);
    }
  }, []);

  /**
   * Export queue as JSON string
   */
  const exportQueue = useCallback((): string => {
    try {
      return JSON.stringify(queue, null, 2);
    } catch (error) {
      logger.error("Failed to export queue:", error);
      return "[]";
    }
  }, [queue]);

  /**
   * Import queue from JSON string
   */
  const importQueue = useCallback((jsonData: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(jsonData);
      const imported = normalizeStoredQueue(parsed);
      if (!imported) {
        logger.error("Invalid queue data: not an array");
        return false;
      }

      setQueue(imported);
      logger.info(`Imported ${imported.length} items to queue`);
      return true;
    } catch (error) {
      logger.error("Failed to import queue:", error);
      return false;
    }
  }, []);

  /**
   * Memoized queue size
   */
  const queueSize = useMemo(() => queue.length, [queue]);

  /**
   * Memoized context value
   */
  const contextValue = useMemo<RecipeQueueContextType>(
    () => ({
      queue,
      queueSize,
      addToQueue,
      removeFromQueue,
      clearQueue,
      updateQueueItem,
      isInQueue,
      getQueueItem,
      reorderQueue,
      exportQueue,
      importQueue,
    }),
    [
      queue,
      queueSize,
      addToQueue,
      removeFromQueue,
      clearQueue,
      updateQueueItem,
      isInQueue,
      getQueueItem,
      reorderQueue,
      exportQueue,
      importQueue,
    ],
  );

  return (
    <RecipeQueueContext.Provider value={contextValue}>
      {children}
    </RecipeQueueContext.Provider>
  );
}

/**
 * Hook to use Recipe Queue context
 */
export function useRecipeQueue(): RecipeQueueContextType {
  const context = useContext(RecipeQueueContext);
  if (!context) {
    throw new Error("useRecipeQueue must be used within a RecipeQueueProvider");
  }
  return context;
}
