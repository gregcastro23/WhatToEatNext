"use client";

/**
 * Cosmic Alignment Preview
 *
 * Celestial telemetry card inside the Recipe Builder that dynamically visualizes
 * how current selections resonate with today's dominant cosmic element, planetary
 * day, and current planetary hour.
 *
 * Features:
 *   - Modern Alchemist dark glass aesthetic with elemental glow auras
 *   - Real-time planetary day & planetary hour telemetry
 *   - Cuisine resonance indicators with statistical signatures
 *   - Quick-add buttons to instantly manifest top harmonic ingredients into the crucible
 *
 * @file src/components/recipe-builder/CosmicAlignmentPreview.tsx
 */

import { Sparkles, Check, Plus, Compass } from "lucide-react";
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
import {
  findTopIngredientsForElement,
  type IndexedIngredient,
} from "@/utils/ingredient/ingredientIndex";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

const ELEMENT_ICON: Record<ClassicalElement, string> = {
  Fire: "\uD83D\uDD25",
  Water: "\uD83D\uDCA7",
  Earth: "\uD83C\uDF0D",
  Air: "\uD83D\uDCA8",
};

const ELEMENT_THEME: Record<
  ClassicalElement,
  {
    border: string;
    bgGradient: string;
    glow: string;
    badge: string;
    accentText: string;
  }
> = {
  Fire: {
    border: "border-amber-500/30",
    bgGradient: "from-amber-950/25 via-red-950/15 to-black/60",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    accentText: "text-amber-400",
  },
  Water: {
    border: "border-cyan-500/30",
    bgGradient: "from-cyan-950/25 via-blue-950/15 to-black/60",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.08)]",
    badge: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    accentText: "text-cyan-400",
  },
  Earth: {
    border: "border-emerald-500/30",
    bgGradient: "from-emerald-950/25 via-amber-950/15 to-black/60",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.08)]",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    accentText: "text-emerald-400",
  },
  Air: {
    border: "border-violet-500/30",
    bgGradient: "from-violet-950/25 via-indigo-950/15 to-black/60",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.08)]",
    badge: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    accentText: "text-violet-400",
  },
};

interface CuisineAlignmentRow {
  cuisine: string;
  dominant: ClassicalElement | null;
  aligned: boolean;
  signatureCount: number;
}

export default function CosmicAlignmentPreview() {
  const { selectedCuisines, addIngredient, hasIngredient } = useRecipeBuilder();
  const astroState = useAstrologicalState();

  const dominantElement = useMemo<ClassicalElement>(() => {
    const alignment = astroState.currentPlanetaryAlignment;
    if (Object.keys(alignment).length === 0) {
      const dom = astroState.domElements;
      const order: ClassicalElement[] = ["Fire", "Water", "Earth", "Air"];
      let best: ClassicalElement = "Fire";
      let high = -Infinity;
      for (const el of order) {
        const v = dom[el];
        if (v > high) {
          high = v;
          best = el;
        }
      }
      return best;
    }
    return getDominantElementFromPositions(alignment);
  }, [astroState.currentPlanetaryAlignment, astroState.domElements]);

  const dayChar = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getPlanetaryDayCharacteristics(new Date().getDay() as DayOfWeek);
  }, []);

  const cuisineRows = useMemo<CuisineAlignmentRow[]>(
    () =>
      selectedCuisines.map((cuisine) => {
        const dominant = getDominantElementForCuisine(cuisine);
        const entry = getCuisineEntry(cuisine);
        return {
          cuisine,
          dominant,
          aligned: dominant === dominantElement,
          signatureCount: entry?.signatures.length ?? 0,
        };
      }),
    [selectedCuisines, dominantElement],
  );

  const topIngredients = useMemo<IndexedIngredient[]>(
    () => findTopIngredientsForElement(dominantElement, 6),
    [dominantElement],
  );

  const alignedCount = cuisineRows.filter((row) => row.aligned).length;
  const theme = ELEMENT_THEME[dominantElement];

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bgGradient} p-5 backdrop-blur-xl ${theme.glow} transition-all duration-300`}
      aria-label="Cosmic alignment preview"
    >
      {/* Background celestial watermark */}
      <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-5 select-none" aria-hidden>
        {ELEMENT_ICON[dominantElement]}
      </div>

      <header className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl shadow-inner backdrop-blur-md">
            <span aria-hidden>{ELEMENT_ICON[dominantElement]}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Cosmic Alignment
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-medium ${theme.badge}`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                {dominantElement} Resonance
              </span>
            </div>
            <p className="mt-0.5 text-base font-semibold text-white tracking-wide">
              {dominantElement} Dominant
              {dayChar && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {"\u00B7"} {dayChar.planet} Day
                </span>
              )}
              {astroState.currentPlanetaryHour && (
                <span className="ml-1.5 text-xs font-mono text-purple-300/80">
                  {"\u00B7"} {astroState.currentPlanetaryHour} Hour
                </span>
              )}
            </p>
          </div>
        </div>

        {cuisineRows.length > 0 && (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            <Compass className="h-4 w-4 text-purple-400" />
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Cuisine Resonance
              </p>
              <p className="text-xs font-semibold text-white">
                <span className={alignedCount > 0 ? "text-emerald-400" : "text-amber-400"}>
                  {alignedCount}
                </span>
                /{cuisineRows.length} Aligned
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Selected Cuisines Alignment Breakdown */}
      {cuisineRows.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Selected Cuisines
          </p>
          <ul className="flex flex-wrap gap-2">
            {cuisineRows.map((row) => (
              <li
                key={row.cuisine}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-medium backdrop-blur-md transition-all ${
                  row.aligned
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                }`}
                title={
                  row.dominant
                    ? `${row.cuisine} dominant: ${row.dominant}${row.signatureCount ? ` \u00B7 ${row.signatureCount} flavor signature(s)` : ""}`
                    : `${row.cuisine} has no indexed signature data`
                }
              >
                <span
                  className={`flex h-1.5 w-1.5 rounded-full ${
                    row.aligned ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-gray-500"
                  }`}
                  aria-hidden
                />
                <span>{row.cuisine}</span>
                {row.dominant && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ({row.dominant})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Harmonic Elemental Ingredients with Quick-Add */}
      {topIngredients.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Harmonic {dominantElement} Ingredients
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              Tap + to add to crucible
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {topIngredients.map((item) => {
              const inCrucible = hasIngredient(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    if (!inCrucible) {
                      addIngredient({
                        name: item.name,
                        category: item.category,
                        elementalProperties: item.elementalProperties,
                      });
                    }
                  }}
                  disabled={inCrucible}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    inCrucible
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default opacity-90"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
                  }`}
                >
                  {inCrucible ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Plus className="h-3 w-3 text-purple-400" />
                  )}
                  <span>{item.name}</span>
                  {inCrucible && (
                    <span className="text-[10px] font-mono text-emerald-400/80">
                      queued
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
