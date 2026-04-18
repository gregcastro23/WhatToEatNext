"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { useMealPlan } from "@/hooks/useMealPlan";

export default function MealPlanPage() {
  const { plan, removeEntry, clearAll } = useMealPlan();

  const byDate = useMemo(() => {
    const groups = new Map<string, typeof plan>();
    [...plan]
      .sort((a, b) => a.date.localeCompare(b.date) || a.addedAt - b.addedAt)
      .forEach((e) => {
        const arr = groups.get(e.date) ?? [];
        arr.push(e);
        groups.set(e.date, arr);
      });
    return Array.from(groups.entries());
  }, [plan]);

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400">
              Your Meal Plan
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Scheduled locally in your browser. Sync to your account coming soon.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/meal-plan/groceries"
              className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-sm font-medium hover:bg-amber-500/30"
            >
              Grocery list &rarr;
            </Link>
            {plan.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:text-rose-300"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {plan.length === 0 ? (
          <div className="glass-card-premium rounded-2xl border border-white/8 p-10 text-center">
            <p className="text-5xl mb-3">{"\u{1F4C5}"}</p>
            <p className="text-white/70 mb-4">No meals scheduled yet.</p>
            <Link
              href="/recipes"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 font-medium hover:bg-amber-500/30"
            >
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {byDate.map(([date, entries]) => (
              <div key={date} className="glass-card-premium rounded-2xl border border-white/8 p-5">
                <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3">
                  {formatDate(date)}
                </h2>
                <ul className="space-y-2">
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/recipes/${entry.recipeId}`}
                          className="text-white hover:text-amber-200 font-medium line-clamp-1"
                        >
                          {entry.recipeName ?? entry.recipeId}
                        </Link>
                        <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2 flex-wrap">
                          {entry.mealType && <span className="capitalize">{entry.mealType}</span>}
                          {entry.servings && <span>&middot; {entry.servings} serving{entry.servings === 1 ? "" : "s"}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="text-white/40 hover:text-rose-300 text-sm"
                        aria-label="Remove from plan"
                      >
                        &#x2715;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}
