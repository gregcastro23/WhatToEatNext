"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useMealPlan } from "@/hooks/useMealPlan";
import type { Recipe } from "@/types/recipe";

interface Props {
  recipe: Recipe;
  servings: number;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function AddToMealPlanButton({ recipe, servings }: Props) {
  const { addEntry, entriesForRecipe } = useMealPlan();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState<string>("dinner");
  const [justAdded, setJustAdded] = useState(false);

  const scheduledCount = entriesForRecipe(recipe.id).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSave = () => {
    addEntry({
      date,
      recipeId: recipe.id,
      recipeName: recipe.name,
      mealType,
      servings,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setOpen(false);
    }, 900);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 bg-white/10/80 border border-white/10/50 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Add to Meal Plan
        {scheduledCount > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-300 rounded-full">
            {scheduledCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md glass-card-premium rounded-2xl border border-white/8 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">
                  Schedule {recipe.name}
                </h3>
                <p className="text-xs text-white/60 mt-0.5">Saved to your browser&apos;s meal plan.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                &#x2715;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5" htmlFor="mp-date">Date</label>
                <input
                  id="mp-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-card-premium border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div role="group" aria-label="Meal type">
                <div className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Meal</div>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealType(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize transition-colors ${
                        mealType === m
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-white/50">
                Scheduling <span className="text-amber-300 font-semibold">{servings}</span> serving{servings === 1 ? "" : "s"}.
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={justAdded}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  justAdded
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                    : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30"
                }`}
              >
                {justAdded ? "\u2713 Added!" : "Add to plan"}
              </button>
              <Link
                href="/meal-plan"
                className="px-4 py-2.5 rounded-lg font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm"
              >
                View plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
