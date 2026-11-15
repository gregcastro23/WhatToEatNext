"use client";

/**
 * FastStartCard — the guided empty-state for the redesigned planner.
 * Ask three quick things (diet, budget, portions), then draft a full week by
 * looping the planetary-aligned day generator. This restores whole-week
 * auto-plan on mobile after the legacy QuickActionsToolbar was hidden.
 *
 * @file src/components/menu-planner/redesign/FastStartCard.tsx
 */

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";

const MAIN_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];
const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

type DietKey =
  | "balanced"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "high-protein";

const DIETS: Array<{ key: DietKey; label: string }> = [
  { key: "balanced", label: "Balanced" },
  { key: "high-protein", label: "High-protein" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "pescatarian", label: "Pescatarian" },
];

export default function FastStartCard(): React.JSX.Element {
  const {
    generateMealsForDay,
    updateGenerationPreference,
    setWeeklyBudget,
    generationPreferences,
  } = useMenuPlanner();

  const [diet, setDiet] = useState<DietKey>("balanced");
  const [budget, setBudget] = useState<number>(60);
  const [noBudget, setNoBudget] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [featuredInput, setFeaturedInput] = useState("");
  const [mealScope, setMealScope] = useState<"3_dinners" | "5_weeknights" | "full_week">("3_dinners");

  const resolvedRestrictions = (): string[] =>
    diet === "balanced" || diet === "high-protein" ? [] : [diet];

  const applyPreferences = (parsedIngredients?: string[]): string[] => {
    const restrictions = resolvedRestrictions();
    // Map the diet chip onto the real generation-preference model.
    if (diet === "high-protein") {
      updateGenerationPreference("dietaryRestrictions", []);
      updateGenerationPreference("nutritionalTargets", {
        ...generationPreferences.nutritionalTargets,
        prioritizeProtein: true,
      });
    } else {
      updateGenerationPreference("dietaryRestrictions", restrictions);
    }
    if (parsedIngredients !== undefined) {
      updateGenerationPreference("requiredIngredients", parsedIngredients);
    }
    setWeeklyBudget(noBudget ? null : budget);
    return restrictions;
  };

  const draftWeek = async (): Promise<void> => {
    if (drafting) return;
    setDrafting(true);
    setProgress(0);
    const dietaryRestrictions = applyPreferences();
    try {
      for (const day of ALL_DAYS) {
        await generateMealsForDay(day, {
          mealTypes: MAIN_TYPES,
          dietaryRestrictions,
        });
        setProgress((p) => p + 1);
      }
    } finally {
      setDrafting(false);
    }
  };

  const handleIngredientFirstPlan = async (): Promise<void> => {
    if (drafting) return;
    const parsedIngredients = featuredInput
      .split(/[,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    setDrafting(true);
    setProgress(0);
    const dietaryRestrictions = applyPreferences(parsedIngredients);

    const targetDays: DayOfWeek[] =
      mealScope === "3_dinners"
        ? [1, 3, 5] // Mon, Wed, Fri
        : mealScope === "5_weeknights"
          ? [1, 2, 3, 4, 5] // Mon–Fri
          : ALL_DAYS;

    try {
      for (const dayIdx of targetDays) {
        await generateMealsForDay(dayIdx, {
          mealTypes: mealScope === "full_week" ? MAIN_TYPES : ["dinner"],
          dietaryRestrictions,
          ...(parsedIngredients.length > 0
            ? { requiredIngredients: parsedIngredients }
            : {}),
        });
        setProgress((p) => p + 1);
      }
    } finally {
      setDrafting(false);
    }
  };

  return (
    <section className="alchm-panel alchm-panel-glow regmarks rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-active-violet/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <h2 className="font-headline-md text-headline-md font-bold text-primary">
          Let&apos;s plan your week
        </h2>
        <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">
          Answer 3 quick things and we&apos;ll draft a balanced week you can tweak.
        </p>

        {/* Plan Balanced Meals Before You Shop (Ingredient-First Bar) */}
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Plan Balanced Meals Before You Shop
            </span>
            <div className="flex gap-1">
              {(
                [
                  { id: "3_dinners", label: "3 Meals" },
                  { id: "5_weeknights", label: "5 Dinners" },
                  { id: "full_week", label: "Full Week" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMealScope(opt.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    mealScope === opt.id
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={featuredInput}
              onChange={(e) => setFeaturedInput(e.target.value)}
              placeholder="Ingredients to feature (e.g., rice, black beans, spinach, chicken)"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={drafting}
              onClick={() => {
                handleIngredientFirstPlan().catch(() => {});
              }}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition whitespace-nowrap disabled:opacity-60"
            >
              Build Plan &amp; Cart
            </button>
          </div>
        </div>

        {/* Diet */}
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
            Diet &amp; preferences
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETS.map((d) => {
              const active = diet === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDiet(d.key)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wide transition-all ${
                    active
                      ? "bg-active-violet/15 border border-active-violet/50 text-active-violet"
                      : "bg-surface-container-low border border-muted text-on-surface-variant hover:text-on-surface hover:border-active-violet/30"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
              Weekly budget
            </p>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noBudget}
                onChange={(e) => setNoBudget(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-muted bg-surface-container-lowest text-active-violet focus:ring-active-violet focus:ring-offset-0"
              />
              <span className="font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
                No budget
              </span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={budget}
              disabled={noBudget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="flex-1 accent-gold-accent disabled:opacity-40"
            />
            <span
              className={`font-mono text-sm tabular-nums w-14 text-right ${noBudget ? "text-on-surface-variant/40" : "text-gold-accent"}`}
            >
              {noBudget ? "—" : `$${budget}`}
            </span>
          </div>
        </div>

        {/* Draft CTA */}
        <button
          type="button"
          onClick={() => {
            void draftWeek();
          }}
          disabled={drafting}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-gold-accent to-active-violet text-background font-mono text-[12px] uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(184,90,240,0.25)] active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {drafting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Drafting… {progress}/7 days
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Draft my week
            </>
          )}
        </button>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wide text-on-surface-variant/50">
          Planetary-aligned · fully editable after
        </p>
      </div>
    </section>
  );
}
