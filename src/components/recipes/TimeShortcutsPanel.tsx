"use client";

import React, { useMemo } from "react";
import type { Recipe } from "@/types/recipe";
import { analyzeTimeShortcuts, type TimeBudget } from "@/utils/timeShortcuts";

const BUDGETS: Array<{ key: TimeBudget; label: string }> = [
  { key: 15, label: "15 min" },
  { key: 30, label: "30 min" },
  { key: 60, label: "1 hour" },
  { key: "all", label: "All day" },
];

interface Props {
  recipe: Recipe;
  activeBudget: TimeBudget | null;
  onBudgetChange: (b: TimeBudget | null) => void;
}

export function TimeShortcutsPanel({ recipe, activeBudget, onBudgetChange }: Props) {
  const result = useMemo(
    () => (activeBudget ? analyzeTimeShortcuts(recipe, activeBudget) : null),
    [recipe, activeBudget],
  );

  return (
    <div className="glass-card-premium rounded-2xl border border-white/8 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 flex items-center gap-2">
            <span className="not-italic text-xl">{"\u23F1"}</span>
            How Much Time Do You Have?
          </h2>
          <p className="text-xs text-white/60 mt-1">
            We&apos;ll highlight steps to skip, parallelize, or make ahead.
          </p>
        </div>
        {activeBudget && (
          <button
            type="button"
            onClick={() => onBudgetChange(null)}
            className="text-xs text-amber-300 hover:text-amber-200 underline decoration-dotted underline-offset-4"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {BUDGETS.map(({ key, label }) => {
          const active = activeBudget === key;
          return (
            <button
              key={String(key)}
              type="button"
              onClick={() => onBudgetChange(active ? null : key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                active
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {result && <ResultBanner result={result} />}
    </div>
  );
}

function ResultBanner({ result }: { result: ReturnType<typeof analyzeTimeShortcuts> }) {
  const { fitsBudget, totalRecipeMinutes, budget, shortcutTips, makeAheadTips, equipmentSwaps } = result;

  return (
    <div className="mt-4 space-y-3">
      <div
        className={`p-3 rounded-lg border text-sm ${
          fitsBudget
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-orange-500/10 border-orange-500/30 text-orange-300"
        }`}
      >
        {fitsBudget ? (
          <>
            <span className="text-emerald-300 mr-1">&#x2713;</span>
            {totalRecipeMinutes > 0
              ? `Recipe fits in ${budget === "all" ? "any" : `${budget} min`} budget (est. ${totalRecipeMinutes} min total).`
              : "No shortcuts required — cook at your pace."}
          </>
        ) : (
          <>Recipe takes about {totalRecipeMinutes} min. Budget is {budget === "all" ? "unlimited" : `${budget} min`}. Use the shortcuts below to close the gap.</>
        )}
      </div>

      {shortcutTips.length > 0 && (
        <ul className="space-y-1 text-xs text-white/70">
          {shortcutTips.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-400 shrink-0">&#x25B8;</span> {t}
            </li>
          ))}
        </ul>
      )}

      {makeAheadTips.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Make-Ahead</h3>
          <ul className="space-y-1">
            {makeAheadTips.map((tip, i) => (
              <li key={i} className="text-sm text-white/80 flex gap-2">
                <span className="text-sky-400 shrink-0">&#x1F5C3;</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {equipmentSwaps.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Equipment Shortcuts</h3>
          <ul className="space-y-1">
            {equipmentSwaps.map((swap, i) => (
              <li key={i} className="text-sm text-white/80 flex gap-2">
                <span className="text-purple-400 shrink-0">&#x2699;</span> {swap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
