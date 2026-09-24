"use client";

/**
 * `/recipe-builder?ingredients=spinach` queues those ingredients (omnibar
 * Phase 4, "Cook with this", #870). Names are matched against the builder's
 * own ingredient list, so a queued card carries the category and elemental
 * values its search bar would give it; a name the list lacks is queued by
 * name alone. The parameter is removed afterwards, so a reload does not add
 * it twice.
 */
import { useEffect } from "react";
import { useRecipeBuilder, type SelectedIngredient } from "@/contexts/RecipeBuilderContext";
import { PREFILL_PARAM } from "@/lib/recipe-builder/prefillLink";
import { getAllIngredients } from "@/utils/foodRecommender";
import { createLogger } from "@/utils/logger";

const logger = createLogger("IngredientPrefill");

/** A link is a handful of names; the cap keeps a crafted URL from flooding the queue. */
export const MAX_PREFILL = 8;

interface ListedIngredient {
  name: string;
  category?: string;
  elementalProperties?: Record<string, number>;
}

/** Requested names → queue entries, in order, deduplicated, matched case-insensitively. */
export function prefillIngredients(names: readonly string[], listed: readonly ListedIngredient[]): SelectedIngredient[] {
  const byName = new Map(listed.map((ingredient) => [ingredient.name.toLowerCase(), ingredient]));
  const seen = new Set<string>();
  const queued: SelectedIngredient[] = [];
  for (const raw of names) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key) || queued.length === MAX_PREFILL) continue;
    seen.add(key);
    const match = byName.get(key);
    queued.push({
      name: match?.name ?? name,
      ...(match?.category !== undefined ? { category: match.category } : {}),
      ...(match?.elementalProperties !== undefined ? { elementalProperties: match.elementalProperties } : {}),
    });
  }
  return queued;
}

function requestedNames(): string[] {
  return new URLSearchParams(window.location.search).getAll(PREFILL_PARAM);
}

function withoutPrefill(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete(PREFILL_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useIngredientPrefill(): void {
  const { isReady, addIngredient } = useRecipeBuilder();
  useEffect(() => {
    if (!isReady) return;
    const names = requestedNames();
    if (names.length === 0) return;
    try {
      prefillIngredients(names, getAllIngredients()).forEach(addIngredient);
    } catch (error) {
      logger.error("Failed to queue linked ingredients:", error);
    }
    window.history.replaceState(window.history.state, "", withoutPrefill());
  }, [isReady, addIngredient]);
}
