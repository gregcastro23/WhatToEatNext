"use client";

/**
 * `/recipe-builder?ingredients=spinach` queues those ingredients (omnibar
 * Phase 4, "Cook with this", #870). Names are matched against the builder's
 * own ingredient list, so a queued card carries the category and elemental
 * values its search bar would give it; a name the list lacks is queued by
 * name alone. The parameter is removed afterwards, so a reload does not add
 * it twice.
 */
import { useSearchParams } from "next/navigation";
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

function withoutPrefill(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete(PREFILL_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Joins the requested names into one comparable effect key. */
const SEPARATOR = "\u0000";

export function useIngredientPrefill(): void {
  const { isReady, addIngredient } = useRecipeBuilder();
  // Keyed on the parameter, not on mounting: "Cook with this" from the header
  // while already on the builder is a soft navigation that keeps this
  // component mounted, so an effect that only ran on mount would miss it.
  const requested = useSearchParams()?.getAll(PREFILL_PARAM).join(SEPARATOR) ?? "";
  useEffect(() => {
    if (!isReady || requested === "") return;
    try {
      prefillIngredients(requested.split(SEPARATOR), getAllIngredients()).forEach(addIngredient);
    } catch (error) {
      logger.error("Failed to queue linked ingredients:", error);
    }
    window.history.replaceState(window.history.state, "", withoutPrefill());
  }, [isReady, addIngredient, requested]);
}

/**
 * The prefill as a render-nothing component. `useSearchParams` needs a
 * Suspense boundary on a prerendered page, so the panel mounts this inside
 * one rather than calling the hook itself.
 */
export function IngredientPrefill(): null {
  useIngredientPrefill();
  return null;
}
