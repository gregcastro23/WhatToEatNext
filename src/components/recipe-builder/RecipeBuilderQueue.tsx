"use client";

/**
 * Recipe Builder Queue - The Alchemical Crucible
 * Displays every builder selection as removable chips, a category summary,
 * a clear-all action, and the live elemental quad-spectrum balance of the
 * queued ingredients.
 *
 * @file src/components/recipe-builder/RecipeBuilderQueue.tsx
 */

import React, { useMemo } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { computeElementalBalance } from "./crucible/elementalBalance";
import ElementalBalanceGauge from "./crucible/ElementalBalanceGauge";
import QueueChipGroup from "./crucible/QueueChipGroup";
import { buildQueueGroups } from "./crucible/queueGroups";
import { FOCUS_RING } from "./focusRing";

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

interface CategorySummaryProps {
  cuisineCount: number;
  ingredientCount: number;
  methodCount: number;
}

function CategorySummary({
  cuisineCount,
  ingredientCount,
  methodCount,
}: CategorySummaryProps): React.JSX.Element | null {
  const total = cuisineCount + ingredientCount + methodCount;
  if (total === 0) return null;

  const parts = [
    { count: ingredientCount, noun: "ingredient", text: "text-emerald-300", dot: "bg-emerald-400" },
    { count: cuisineCount, noun: "cuisine", text: "text-purple-300", dot: "bg-purple-400" },
    { count: methodCount, noun: "method", text: "text-amber-300", dot: "bg-amber-400" },
  ].filter((part) => part.count > 0);

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
      <span className="font-semibold text-white t-mono">{plural(total, "item")} queued</span>
      <span className="text-white/20" aria-hidden>&bull;</span>
      {parts.map((part) => (
        <span key={part.noun} className={`flex items-center gap-1.5 ${part.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${part.dot}`} aria-hidden />
          {plural(part.count, part.noun)}
        </span>
      ))}
    </div>
  );
}

function EmptyCrucible({ className }: { className: string }): React.JSX.Element {
  return (
    <div
      className={`glass-card-premium rounded-2xl border border-dashed border-white/10 p-6 sm:p-8 text-center ${className}`}
    >
      <div className="text-3xl mb-2 opacity-50" aria-hidden>🌌</div>
      <p className="text-sm font-semibold text-white/90">The Alchemical Crucible is Empty</p>
      <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto leading-relaxed">
        Search ingredients, select pantry staples, or choose cuisine traditions and cooking methods above to begin formulating your recipe.
      </p>
    </div>
  );
}

interface RecipeBuilderQueueProps {
  className?: string;
}

export default function RecipeBuilderQueue({
  className = "",
}: RecipeBuilderQueueProps): React.JSX.Element {
  const builder = useRecipeBuilder();
  const { selectedIngredients, selectedCuisines, selectedCookingMethods, clearQueue } = builder;
  const balance = useMemo(() => computeElementalBalance(selectedIngredients), [selectedIngredients]);
  const groups = buildQueueGroups(builder);

  if (groups.length === 0) return <EmptyCrucible className={className} />;

  return (
    <section
      aria-label="Alchemical Crucible"
      className={`glass-card-premium rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#120e24] to-[#0a0714] p-5 sm:p-6 shadow-2xl relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>⚗️</span>
          <h3 className="t-display text-lg font-medium text-white tracking-wide">Alchemical Crucible</h3>
        </div>
        <button
          type="button"
          onClick={clearQueue}
          className={`text-xs text-white/40 hover:text-red-400 hover:bg-red-950/20 px-2.5 py-1 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer ${FOCUS_RING}`}
        >
          Clear Crucible
        </button>
      </div>

      <CategorySummary
        cuisineCount={selectedCuisines.length}
        ingredientCount={selectedIngredients.length}
        methodCount={selectedCookingMethods.length}
      />

      {balance && <ElementalBalanceGauge balance={balance} />}

      {groups.map((group) => (
        <QueueChipGroup key={group.title} group={group} />
      ))}
    </section>
  );
}
