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
 * Until live planetary positions arrive it says so, rather than naming an
 * element it has not read (the old default was "Fire", which then jumped).
 *
 * @file src/components/recipe-builder/CosmicAlignmentPreview.tsx
 */

import { Check, Compass, Plus, Sparkles } from "lucide-react";
import React, { useMemo } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { currentDayOfWeek } from "@/lib/recipe-builder/generateRecommendations";
import {
  getDominantElementFromPositions,
  type ClassicalElement,
} from "@/utils/astrology/signElement";
import { getCuisineEntry, getDominantElementForCuisine } from "@/utils/cuisine/cuisineIndex";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";
import { CRUCIBLE_ELEMENTS } from "./crucible/elementalBalance";
import { FOCUS_RING } from "./focusRing";

const ELEMENT_ICON: Record<ClassicalElement, string> = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌍",
  Air: "💨",
};

interface ElementTheme {
  frame: string;
  badge: string;
}

const ELEMENT_THEME: Record<ClassicalElement, ElementTheme> = {
  Fire: {
    frame: "border-amber-500/30 from-amber-950/25 via-red-950/15 to-black/60 shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  Water: {
    frame: "border-cyan-500/30 from-cyan-950/25 via-blue-950/15 to-black/60 shadow-[0_0_30px_rgba(6,182,212,0.08)]",
    badge: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  },
  Earth: {
    frame: "border-emerald-500/30 from-emerald-950/25 via-amber-950/15 to-black/60 shadow-[0_0_30px_rgba(16,185,129,0.08)]",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  Air: {
    frame: "border-violet-500/30 from-violet-950/25 via-indigo-950/15 to-black/60 shadow-[0_0_30px_rgba(139,92,246,0.08)]",
    badge: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  },
};

const PENDING_FRAME = "border-white/10 from-white/[0.03] via-purple-950/10 to-black/60";

/**
 * Today's dominant element: from live positions when present, else from the
 * hook's element weights, else null — the sky has not been read yet.
 */
export function resolveDominantElement(
  alignment: Record<string, { sign?: unknown } | string | null | undefined>,
  weights: Record<ClassicalElement, number>,
): ClassicalElement | null {
  if (Object.keys(alignment).length > 0) return getDominantElementFromPositions(alignment);
  let best: ClassicalElement | null = null;
  for (const element of CRUCIBLE_ELEMENTS) {
    if (weights[element] > 0 && (best === null || weights[element] > weights[best])) best = element;
  }
  return best;
}

function SkyLine({ planetaryHour, dominant }: { planetaryHour: string | null; dominant: ClassicalElement | null }): React.JSX.Element {
  const day = getPlanetaryDayCharacteristics(currentDayOfWeek());
  return (
    <p className="mt-0.5 text-base font-semibold text-white tracking-wide">
      {dominant ? `${dominant} Dominant` : "Reading the sky…"}
      <span className="ml-2 text-xs font-normal text-muted-foreground">· {day.planet} Day</span>
      {planetaryHour && (
        <span className="ml-1.5 text-xs font-mono text-purple-300/80">· {planetaryHour} Hour</span>
      )}
    </p>
  );
}

interface CuisineRow {
  cuisine: string;
  dominant: ClassicalElement | null;
  aligned: boolean;
  signatureCount: number;
}

function cuisineTitle(row: CuisineRow): string {
  if (!row.dominant) return `${row.cuisine} has no indexed signature data`;
  const signatures = row.signatureCount > 0 ? ` · ${row.signatureCount} flavor signature(s)` : "";
  return `${row.cuisine} dominant: ${row.dominant}${signatures}`;
}

function CuisineResonance({ rows }: { rows: CuisineRow[] }): React.JSX.Element | null {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Selected Cuisines</p>
      <ul className="flex flex-wrap gap-2">
        {rows.map((row) => (
          <li
            key={row.cuisine}
            title={cuisineTitle(row)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-medium backdrop-blur-md transition-all ${
              row.aligned
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
            }`}
          >
            <span
              className={`flex h-1.5 w-1.5 rounded-full ${row.aligned ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-gray-500"}`}
              aria-hidden
            />
            <span>{row.cuisine}</span>
            {row.dominant && <span className="text-[10px] font-mono text-muted-foreground">({row.dominant})</span>}
            {row.aligned && <span className="sr-only">(aligned)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HarmonicIngredients({ element }: { element: ClassicalElement }): React.JSX.Element | null {
  const { addIngredient, hasIngredient } = useRecipeBuilder();
  const ingredients = useMemo(() => findTopIngredientsForElement(element, 6), [element]);
  if (ingredients.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Harmonic {element} Ingredients</p>
        <span className="text-[10px] text-muted-foreground font-mono" aria-hidden>Tap + to add to crucible</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((item) => {
          const queued = hasIngredient(item.name);
          return (
            <button
              key={item.name}
              type="button"
              disabled={queued}
              aria-label={queued ? `${item.name} (queued in crucible)` : `Add ${item.name} to crucible`}
              onClick={() => addIngredient({ name: item.name, category: item.category, elementalProperties: item.elementalProperties })}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${FOCUS_RING} ${
                queued
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default opacity-90"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
              }`}
            >
              {queued ? <Check className="h-3 w-3 text-emerald-400" aria-hidden /> : <Plus className="h-3 w-3 text-purple-400" aria-hidden />}
              <span>{item.name}</span>
              {queued && <span className="text-[10px] font-mono text-emerald-400/80">queued</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface AlignmentHeaderProps {
  dominant: ClassicalElement | null;
  planetaryHour: string | null;
  alignedCount: number;
  cuisineCount: number;
}

function AlignmentHeader({ dominant, planetaryHour, alignedCount, cuisineCount }: AlignmentHeaderProps): React.JSX.Element {
  return (
    <header className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl shadow-inner backdrop-blur-md ${dominant ? "" : "animate-pulse"}`}>
          <span aria-hidden>{dominant ? ELEMENT_ICON[dominant] : "✧"}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Cosmic Alignment</span>
            {dominant && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ELEMENT_THEME[dominant].badge}`}>
                <Sparkles className="h-2.5 w-2.5" aria-hidden />
                {dominant} Resonance
              </span>
            )}
          </div>
          <SkyLine planetaryHour={planetaryHour} dominant={dominant} />
        </div>
      </div>
      {dominant && cuisineCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
          <Compass className="h-4 w-4 text-purple-400" aria-hidden />
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Cuisine Resonance</p>
            <p className="text-xs font-semibold text-white">
              <span className={alignedCount > 0 ? "text-emerald-400" : "text-amber-400"}>{alignedCount}</span>/{cuisineCount} Aligned
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

export default function CosmicAlignmentPreview(): React.JSX.Element {
  const { selectedCuisines } = useRecipeBuilder();
  const astro = useAstrologicalState();
  const dominant = useMemo(
    () => resolveDominantElement(astro.currentPlanetaryAlignment, astro.domElements),
    [astro.currentPlanetaryAlignment, astro.domElements],
  );
  const rows = useMemo<CuisineRow[]>(
    () =>
      selectedCuisines.map((cuisine) => {
        const cuisineElement = getDominantElementForCuisine(cuisine);
        return {
          cuisine,
          dominant: cuisineElement,
          aligned: dominant !== null && cuisineElement === dominant,
          signatureCount: getCuisineEntry(cuisine)?.signatures.length ?? 0,
        };
      }),
    [selectedCuisines, dominant],
  );

  return (
    <section
      aria-label="Cosmic alignment preview"
      aria-busy={dominant === null}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-xl transition-all duration-300 ${dominant ? ELEMENT_THEME[dominant].frame : PENDING_FRAME}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-5 select-none" aria-hidden>
        {dominant ? ELEMENT_ICON[dominant] : "✧"}
      </div>
      <AlignmentHeader
        dominant={dominant}
        planetaryHour={astro.currentPlanetaryHour}
        alignedCount={rows.filter((row) => row.aligned).length}
        cuisineCount={rows.length}
      />
      <CuisineResonance rows={rows} />
      {dominant && <HarmonicIngredients element={dominant} />}
    </section>
  );
}
