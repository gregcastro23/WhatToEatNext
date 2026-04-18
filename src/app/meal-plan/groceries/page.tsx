"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useMealPlan, type MealPlanEntry } from "@/hooks/useMealPlan";
import type { Recipe, RecipeIngredient } from "@/types/recipe";

interface GroceryLine {
  key: string;
  name: string;
  unit: string;
  amount: number;
  sources: string[];
  category?: string;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase();
}

function getBaseServings(recipe: Recipe): number {
  return (recipe as { baseServingSize?: number }).baseServingSize
    || recipe.servingSize
    || recipe.numberOfServings
    || (recipe as { servings?: number }).servings
    || 1;
}

export default function GroceryListPage() {
  const { plan } = useMealPlan();
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (plan.length === 0) {
      setRecipes({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const uniqueIds = Array.from(new Set(plan.map((e) => e.recipeId)));
    void Promise.all(
      uniqueIds.map((id) =>
        fetch(`/api/recipes/${id}`)
          .then((r) => r.json())
          .then((j) => (j?.success && j.recipe ? [id, j.recipe as Recipe] as const : null))
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, Recipe> = {};
      results.forEach((r) => { if (r) map[r[0]] = r[1]; });
      setRecipes(map);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [plan]);

  const groceries = useMemo<GroceryLine[]>(() => {
    const lines = new Map<string, GroceryLine>();
    plan.forEach((entry: MealPlanEntry) => {
      const recipe = recipes[entry.recipeId];
      if (!recipe) return;
      const baseServings = getBaseServings(recipe);
      const scale = (entry.servings ?? baseServings) / baseServings;
      recipe.ingredients.forEach((ing: RecipeIngredient) => {
        const name = normalizeName(ing.name);
        const unit = normalizeUnit(ing.unit ?? "");
        const key = `${name}__${unit}`;
        const scaledAmount = (ing.amount ?? 0) * scale;
        const existing = lines.get(key);
        if (existing) {
          existing.amount += scaledAmount;
          if (!existing.sources.includes(recipe.name)) existing.sources.push(recipe.name);
        } else {
          lines.set(key, {
            key,
            name: ing.name,
            unit: ing.unit ?? "",
            amount: scaledAmount,
            sources: [recipe.name],
            category: ing.category,
          });
        }
      });
    });
    return Array.from(lines.values()).sort((a, b) => {
      const catA = a.category || "zzz";
      const catB = b.category || "zzz";
      if (catA !== catB) return catA.localeCompare(catB);
      return a.name.localeCompare(b.name);
    });
  }, [plan, recipes]);

  const grouped = useMemo(() => {
    const groups = new Map<string, GroceryLine[]>();
    groceries.forEach((line) => {
      const cat = line.category || "Other";
      const arr = groups.get(cat) ?? [];
      arr.push(line);
      groups.set(cat, arr);
    });
    return Array.from(groups.entries());
  }, [groceries]);

  const buildPlainList = (): string => {
    let text = "Grocery List — Alchm.kitchen\n";
    text += `${"=".repeat(32)}\n\n`;
    grouped.forEach(([cat, lines]) => {
      text += `--- ${cat.toUpperCase()} ---\n`;
      lines.forEach((l) => {
        const amt = l.amount > 0 ? `${Math.round(l.amount * 100) / 100} ${l.unit}`.trim() : "";
        text += `${`- ${amt} ${l.name}`.replace(/\s+/g, " ")}\n`;
      });
      text += "\n";
    });
    return text;
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainList());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/meal-plan" className="text-sm text-white/60 hover:text-amber-400">
              &larr; Back to meal plan
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400 mt-2">
              Grocery List
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Aggregated from {plan.length} scheduled meal{plan.length === 1 ? "" : "s"}.
            </p>
          </div>
          {groceries.length > 0 && (
            <button
              type="button"
              onClick={() => { void handleCopy(); }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-sm font-medium hover:bg-amber-500/30"
            >
              {copied ? "\u2713 Copied!" : "Copy list"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card-premium rounded-2xl border border-white/8 p-10 text-center">
            <div className="w-10 h-10 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Gathering ingredients...</p>
          </div>
        ) : groceries.length === 0 ? (
          <div className="glass-card-premium rounded-2xl border border-white/8 p-10 text-center">
            <p className="text-5xl mb-3">{"\u{1F6D2}"}</p>
            <p className="text-white/70 mb-4">Nothing to buy yet.</p>
            <Link
              href="/recipes"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 font-medium hover:bg-amber-500/30"
            >
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([category, lines]) => (
              <div key={category} className="glass-card-premium rounded-2xl border border-white/8 p-5">
                <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3 capitalize">
                  {category}
                </h2>
                <ul className="space-y-1.5">
                  {lines.map((line) => (
                    <li key={line.key} className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="text-white">
                          {line.amount > 0 && (
                            <span className="text-amber-300 font-semibold">{Math.round(line.amount * 100) / 100} </span>
                          )}
                          {line.unit && <span className="text-white/80">{line.unit} </span>}
                          <span>{line.name}</span>
                        </span>
                        {line.sources.length > 1 && (
                          <div className="text-xs text-white/50 mt-0.5">
                            Used in {line.sources.length} recipes: {line.sources.join(", ")}
                          </div>
                        )}
                      </div>
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
