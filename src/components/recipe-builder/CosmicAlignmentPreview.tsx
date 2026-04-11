"use client";

/**
 * Cosmic Alignment Preview
 *
 * Compact read-only widget rendered inside the Recipe Builder so users can
 * see, before they click generate, how the currently selected cuisines line
 * up with the day's dominant element and which ingredients are most aligned
 * with that element.
 *
 * Pulls from three memoized indexes:
 *   - `cuisineIndex.getDominantElementForCuisine` → per-cuisine dominant
 *   - `getDominantElementFromPositions` → today's dominant from live planets
 *   - `ingredientIndex.findTopIngredientsForElement` → grounded suggestions
 *
 * Intentionally never fetches or mutates — everything here is cheap enough
 * to compute on every selection change.
 *
 * @file src/components/recipe-builder/CosmicAlignmentPreview.tsx
 */

import React, { useMemo } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { DayOfWeek } from "@/types/menuPlanner";
import {
  getDominantElementFromPositions,
  type ClassicalElement,
} from "@/utils/astrology/signElement";
import {
  getCuisineEntry,
  getDominantElementForCuisine,
} from "@/utils/cuisine/cuisineIndex";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

const ELEMENT_ICON: Record<ClassicalElement, string> = {
  Fire: "\uD83D\uDD25",
  Water: "\uD83D\uDCA7",
  Earth: "\uD83C\uDF0D",
  Air: "\uD83D\uDCA8",
};

const ELEMENT_THEME: Record<ClassicalElement, string> = {
  Fire: "from-orange-50 to-red-50 border-orange-200 text-orange-800",
  Water: "from-blue-50 to-cyan-50 border-blue-200 text-blue-800",
  Earth: "from-amber-50 to-yellow-50 border-amber-200 text-amber-800",
  Air: "from-sky-50 to-indigo-50 border-sky-200 text-sky-800",
};

interface CuisineAlignmentRow {
  cuisine: string;
  dominant: ClassicalElement | null;
  aligned: boolean;
  signatureCount: number;
}

export default function CosmicAlignmentPreview() {
  const { selectedCuisines } = useRecipeBuilder();
  const astroState = useAstrologicalState();

  const dominantElement = useMemo<ClassicalElement>(() => {
    const alignment = astroState.currentPlanetaryAlignment;
    if (!alignment || Object.keys(alignment).length === 0) {
      // Fall back to the domElement totals the hook produces so we never
      // render a blank slate on first paint.
      const dom = astroState.domElements;
      if (dom) {
        const order: ClassicalElement[] = ["Fire", "Water", "Earth", "Air"];
        let best: ClassicalElement = "Fire";
        let high = -Infinity;
        for (const el of order) {
          const v = Number(dom[el] ?? 0);
          if (v > high) {
            high = v;
            best = el;
          }
        }
        return best;
      }
      return "Fire";
    }
    return getDominantElementFromPositions(alignment as any);
  }, [astroState.currentPlanetaryAlignment, astroState.domElements]);

  const dayChar = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getPlanetaryDayCharacteristics(new Date().getDay() as DayOfWeek);
  }, []);

  const cuisineRows = useMemo<CuisineAlignmentRow[]>(() => {
    return selectedCuisines.map((cuisine) => {
      const dominant = getDominantElementForCuisine(cuisine);
      const entry = getCuisineEntry(cuisine);
      return {
        cuisine,
        dominant,
        aligned: dominant === dominantElement,
        signatureCount: entry?.signatures?.length ?? 0,
      };
    });
  }, [selectedCuisines, dominantElement]);

  const topIngredients = useMemo(() => {
    return findTopIngredientsForElement(dominantElement, 6).map((i) => i.name);
  }, [dominantElement]);

  const alignedCount = cuisineRows.filter((row) => row.aligned).length;
  const theme = ELEMENT_THEME[dominantElement];

  return (
    <section
      className={`rounded-2xl border bg-gradient-to-br ${theme} p-4`}
      aria-label="Cosmic alignment preview"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            {ELEMENT_ICON[dominantElement]}
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70">
              Today&apos;s dominant element
            </p>
            <p className="text-sm font-semibold">
              {dominantElement}
              {dayChar ? (
                <span className="ml-1.5 font-normal opacity-80">
                  {"\u00B7 "}
                  {dayChar.planet} day
                </span>
              ) : null}
            </p>
          </div>
        </div>
        {cuisineRows.length > 0 && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide opacity-70">
              Cuisine alignment
            </p>
            <p className="text-sm font-semibold">
              {alignedCount}/{cuisineRows.length} aligned
            </p>
          </div>
        )}
      </header>

      {cuisineRows.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {cuisineRows.map((row) => (
            <li
              key={row.cuisine}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                row.aligned
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-white/60 bg-white/60 text-gray-700"
              }`}
              title={
                row.dominant
                  ? `${row.cuisine} dominant: ${row.dominant}${row.signatureCount ? ` \u00B7 ${row.signatureCount} signature(s)` : ""}`
                  : `${row.cuisine} has no indexed signature data`
              }
            >
              <span aria-hidden>{row.aligned ? "\u2605" : "\u2022"}</span>
              {row.cuisine}
              {row.dominant ? (
                <span className="opacity-70">({row.dominant})</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {topIngredients.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide opacity-70">
            Top {dominantElement.toLowerCase()} ingredients
          </p>
          <p className="mt-0.5 text-xs leading-relaxed">
            {topIngredients.join(" \u00B7 ")}
          </p>
        </div>
      )}
    </section>
  );
}
