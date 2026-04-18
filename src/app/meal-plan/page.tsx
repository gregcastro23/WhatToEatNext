"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMealPlan, type MealPlanEntry } from "@/hooks/useMealPlan";
import type { Recipe } from "@/types/recipe";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
type Element = (typeof ELEMENTS)[number];

const ELEMENT_COLORS: Record<Element, string> = {
  Fire: "#f97316",
  Water: "#60a5fa",
  Earth: "#a3a380",
  Air: "#e5e7eb",
};

interface BalanceSuggestion {
  id: string;
  name: string;
  cuisine: string | null;
  elementalProperties: Record<Element, number>;
  similarityToTarget: number;
}

function isoDay(offset = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function startOfWeek(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDayShort(iso: string): { weekday: string; date: string } {
  const d = new Date(`${iso}T00:00:00`);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  };
}

function formatRange(startIso: string): string {
  const end = addDays(startIso, 6);
  const s = new Date(`${startIso}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const sameMonth = s.getMonth() === e.getMonth();
  const sFmt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const eFmt = e.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: s.getFullYear() !== e.getFullYear() ? "numeric" : undefined,
  });
  return `${sFmt} – ${eFmt}`;
}

function normalizeElements(e: Partial<Record<Element, number>> | undefined): Record<Element, number> {
  const fire = Number(e?.Fire ?? 0);
  const water = Number(e?.Water ?? 0);
  const earth = Number(e?.Earth ?? 0);
  const air = Number(e?.Air ?? 0);
  const sum = fire + water + earth + air;
  if (sum <= 0) return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  return { Fire: fire / sum, Water: water / sum, Earth: earth / sum, Air: air / sum };
}

function getBaseServings(recipe: Recipe): number {
  return (recipe as { baseServingSize?: number }).baseServingSize
    || recipe.servingSize
    || recipe.numberOfServings
    || (recipe as { servings?: number }).servings
    || 1;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function getNutrition(recipe: Recipe): NutritionTotals {
  const n = recipe.nutrition as
    | { calories?: number | { value?: number }; protein?: number; carbs?: number; fat?: number; macros?: { protein?: number; carbs?: number; fat?: number } }
    | undefined;
  if (!n) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const cal =
    typeof n.calories === "number"
      ? n.calories
      : typeof n.calories === "object" && typeof n.calories?.value === "number"
        ? n.calories.value
        : 0;
  const m = n.macros ?? {};
  return {
    calories: Number(cal) || 0,
    protein: Number(n.protein ?? m.protein ?? 0) || 0,
    carbs: Number(n.carbs ?? m.carbs ?? 0) || 0,
    fat: Number(n.fat ?? m.fat ?? 0) || 0,
  };
}

export default function MealPlanPage() {
  const { plan, addEntry, removeEntry, clearAll } = useMealPlan();
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [weekStart, setWeekStart] = useState<string>(() => startOfWeek(isoDay()));
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceSuggestions, setBalanceSuggestions] = useState<BalanceSuggestion[]>([]);

  // Fetch recipe details for all planned recipes (once per unique id).
  useEffect(() => {
    let cancelled = false;
    const uniqueIds = Array.from(new Set(plan.map((e) => e.recipeId)));
    const missing = uniqueIds.filter((id) => !recipes[id]);
    if (missing.length === 0) return;

    void Promise.all(
      missing.map((id) =>
        fetch(`/api/recipes/${id}`)
          .then((r) => r.json())
          .then((j) => (j?.success && j.recipe ? [id, j.recipe as Recipe] as const : null))
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      setRecipes((prev) => {
        const next = { ...prev };
        results.forEach((r) => { if (r) next[r[0]] = r[1]; });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [plan, recipes]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const entriesByDay = useMemo(() => {
    const map = new Map<string, MealPlanEntry[]>();
    weekDays.forEach((d) => map.set(d, []));
    plan.forEach((e) => {
      if (map.has(e.date)) map.get(e.date)!.push(e);
    });
    map.forEach((arr) => arr.sort((a, b) => a.addedAt - b.addedAt));
    return map;
  }, [plan, weekDays]);

  const weekEntries = useMemo(
    () => weekDays.flatMap((d) => entriesByDay.get(d) ?? []),
    [weekDays, entriesByDay],
  );

  // Aggregate elemental + nutrition across the visible week
  const { elemental, nutrition, hasRecipes } = useMemo(() => {
    const agg = { Fire: 0, Water: 0, Earth: 0, Air: 0 } as Record<Element, number>;
    const nut: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    let weight = 0;
    let count = 0;
    weekEntries.forEach((entry) => {
      const recipe = recipes[entry.recipeId];
      if (!recipe) return;
      count += 1;
      const servings = entry.servings ?? 1;
      const base = getBaseServings(recipe);
      const scale = servings / base;
      const ep = normalizeElements(recipe.elementalProperties);
      weight += servings;
      ELEMENTS.forEach((el) => {
        agg[el] += ep[el] * servings;
      });
      const n = getNutrition(recipe);
      nut.calories += n.calories * scale;
      nut.protein += n.protein * scale;
      nut.carbs += n.carbs * scale;
      nut.fat += n.fat * scale;
    });
    const total = weight || 1;
    return {
      elemental: {
        Fire: agg.Fire / total,
        Water: agg.Water / total,
        Earth: agg.Earth / total,
        Air: agg.Air / total,
      },
      nutrition: nut,
      hasRecipes: count > 0,
    };
  }, [weekEntries, recipes]);

  const dominantElement: Element | null = useMemo(() => {
    if (!hasRecipes) return null;
    const entries = Object.entries(elemental) as Array<[Element, number]>;
    entries.sort((a, b) => b[1] - a[1]);
    const [el, share] = entries[0];
    return share >= 0.4 ? el : null;
  }, [elemental, hasRecipes]);

  const pieData = useMemo(
    () =>
      ELEMENTS.map((el) => ({
        name: el,
        value: Math.round(elemental[el] * 1000) / 10, // percent
        color: ELEMENT_COLORS[el],
      })),
    [elemental],
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, entryId: string) => {
    e.dataTransfer.setData("text/plain", entryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetDate: string) => {
    e.preventDefault();
    setDragOverDay(null);
    const id = e.dataTransfer.getData("text/plain");
    const entry = plan.find((x) => x.id === id);
    if (!entry || entry.date === targetDate) return;
    removeEntry(entry.id);
    addEntry({
      recipeId: entry.recipeId,
      recipeName: entry.recipeName,
      date: targetDate,
      mealType: entry.mealType,
      servings: entry.servings,
    });
  };

  const openBalance = useCallback(async () => {
    setBalanceOpen(true);
    setBalanceLoading(true);
    setBalanceSuggestions([]);
    try {
      const res = await fetch("/api/meal-plan/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: elemental,
          excludeRecipeIds: Array.from(new Set(weekEntries.map((e) => e.recipeId))),
          limit: 6,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setBalanceSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (err) {
      console.warn("balance fetch failed:", err);
    } finally {
      setBalanceLoading(false);
    }
  }, [elemental, weekEntries]);

  const addSuggestion = (s: BalanceSuggestion, date: string) => {
    addEntry({ recipeId: s.id, recipeName: s.name, date, servings: 1 });
  };

  const todayIso = isoDay();

  return (
    <main className="min-h-screen bg-[#08080e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-12 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400">
              Your Meal Plan
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Drag recipes between days to reshape your week.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/meal-plan/groceries"
              className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-sm font-medium hover:bg-amber-500/30"
            >
              Grocery list →
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

        {/* Week navigation */}
        <div className="glass-card-premium rounded-2xl border border-white/8 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-sm"
              aria-label="Previous week"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(isoDay()))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-sm"
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-sm"
              aria-label="Next week"
            >
              Next →
            </button>
          </div>
          <div className="text-sm text-white/70">
            <span className="text-amber-300 font-semibold">{formatRange(weekStart)}</span>
            <span className="ml-3 text-white/40 text-xs">
              {weekEntries.length} meal{weekEntries.length === 1 ? "" : "s"} planned
            </span>
          </div>
        </div>

        {/* Harmony ring + nutrition summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card-premium rounded-2xl border border-white/8 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                Elemental harmony
              </h2>
              {hasRecipes && (
                <button
                  type="button"
                  onClick={() => { void openBalance(); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/25"
                >
                  Balance this week
                </button>
              )}
            </div>
            {hasRecipes ? (
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={62}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#111",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(value: number | string) => `${value}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-sm"
                          style={{ background: d.color }}
                        />
                        <span className="text-white/80">{d.name}</span>
                      </div>
                      <span className="text-white/60 tabular-nums">{d.value}%</span>
                    </div>
                  ))}
                  {dominantElement && (
                    <p className="text-xs text-amber-300/80 mt-2">
                      {dominantElement}-heavy week. Try &quot;Balance this week&quot; for complements.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40 italic">
                Schedule a meal to see this week&apos;s elemental mix.
              </p>
            )}
          </div>

          <div className="glass-card-premium rounded-2xl border border-white/8 p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Week nutrition
            </h2>
            {hasRecipes ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NutritionStat label="Calories" value={Math.round(nutrition.calories)} unit="" />
                <NutritionStat label="Protein" value={Math.round(nutrition.protein)} unit="g" />
                <NutritionStat label="Carbs" value={Math.round(nutrition.carbs)} unit="g" />
                <NutritionStat label="Fat" value={Math.round(nutrition.fat)} unit="g" />
              </div>
            ) : (
              <p className="text-sm text-white/40 italic">
                Nutrition totals appear once meals are scheduled.
              </p>
            )}
            {hasRecipes && (
              <p className="text-xs text-white/40 mt-3">
                Totals scale by your servings. Daily averages: ~{Math.round(nutrition.calories / 7)}{" "}
                cal / day.
              </p>
            )}
          </div>
        </div>

        {/* Weekly grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map((date) => {
              const entries = entriesByDay.get(date) ?? [];
              const isToday = date === todayIso;
              const isDragOver = dragOverDay === date;
              const { weekday, date: short } = formatDayShort(date);
              return (
                <div
                  key={date}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverDay !== date) setDragOverDay(date);
                  }}
                  onDragLeave={() => setDragOverDay((d) => (d === date ? null : d))}
                  onDrop={(e) => handleDrop(e, date)}
                  className={`glass-card-premium rounded-2xl border p-3 min-h-[180px] transition-colors ${
                    isDragOver
                      ? "border-amber-400/60 bg-amber-500/5"
                      : isToday
                        ? "border-amber-400/40"
                        : "border-white/8"
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-amber-300" : "text-white/60"}`}>
                        {weekday}
                      </div>
                      <div className="text-xs text-white/40">{short}</div>
                    </div>
                    {entries.length > 0 && (
                      <span className="text-[10px] text-white/40">{entries.length}</span>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, entry.id)}
                          className="group p-2 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400/30 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-start gap-2">
                            <Link
                              href={`/recipes/${entry.recipeId}`}
                              className="flex-1 min-w-0 text-xs text-white hover:text-amber-200 font-medium line-clamp-2"
                            >
                              {entry.recipeName ?? entry.recipeId}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeEntry(entry.id)}
                              className="text-white/30 hover:text-rose-300 text-xs opacity-0 group-hover:opacity-100"
                              aria-label="Remove from plan"
                            >
                              ✕
                            </button>
                          </div>
                          {(entry.mealType || entry.servings) && (
                            <div className="text-[10px] text-white/40 mt-1 flex items-center gap-1 flex-wrap">
                              {entry.mealType && <span className="capitalize">{entry.mealType}</span>}
                              {entry.mealType && entry.servings ? <span>·</span> : null}
                              {entry.servings && (
                                <span>{entry.servings} srv</span>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {entries.length === 0 && (
                      <li className="text-[10px] text-white/20 italic text-center py-4">
                        Drop recipes here
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {balanceOpen && (
        <BalanceModal
          loading={balanceLoading}
          suggestions={balanceSuggestions}
          dominantElement={dominantElement}
          weekDays={weekDays}
          onClose={() => setBalanceOpen(false)}
          onAdd={addSuggestion}
        />
      )}
    </main>
  );
}

function NutritionStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <div className="text-[10px] text-white/50 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold text-amber-200 tabular-nums">
        {value.toLocaleString()}
        {unit && <span className="text-sm text-white/50 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

interface BalanceModalProps {
  loading: boolean;
  suggestions: BalanceSuggestion[];
  dominantElement: Element | null;
  weekDays: string[];
  onClose: () => void;
  onAdd: (s: BalanceSuggestion, date: string) => void;
}

function BalanceModal({
  loading,
  suggestions,
  dominantElement,
  weekDays,
  onClose,
  onAdd,
}: BalanceModalProps) {
  const [targetDay, setTargetDay] = useState<string>(weekDays[0]);
  const [added, setAdded] = useState<Set<string>>(new Set());

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-card-premium rounded-2xl border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-amber-200">
              Balance this week
            </h2>
            <p className="text-xs text-white/60 mt-1">
              {dominantElement
                ? `Your week leans ${dominantElement}. These recipes lift the other elements.`
                : "Recipes that round out this week's elemental mix."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/60">Add to:</span>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-amber-400/50"
            >
              {weekDays.map((d) => {
                const { weekday, date } = formatDayShort(d);
                return (
                  <option key={d} value={d} className="bg-[#111]">
                    {weekday} — {date}
                  </option>
                );
              })}
            </select>
          </div>

          {loading ? (
            <div className="py-10 text-center text-white/50 text-sm">
              <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-3" />
              Finding complements...
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-white/50 italic text-center py-6">
              No suggestions found.
            </p>
          ) : (
            <ul className="space-y-2">
              {suggestions.map((s) => {
                const top = (Object.entries(s.elementalProperties) as Array<[Element, number]>)
                  .sort((a, b) => b[1] - a[1])[0];
                const isAdded = added.has(s.id);
                return (
                  <li key={s.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/recipes/${s.id}`}
                        className="text-sm font-medium text-white hover:text-amber-200 line-clamp-1"
                      >
                        {s.name}
                      </Link>
                      <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2 flex-wrap">
                        {s.cuisine && <span className="capitalize">{s.cuisine}</span>}
                        {top && (
                          <span className="flex items-center gap-1">
                            <span
                              className="inline-block w-2 h-2 rounded-sm"
                              style={{ background: ELEMENT_COLORS[top[0]] }}
                            />
                            {top[0]} · {Math.round(top[1] * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAdd(s, targetDay);
                        setAdded((prev) => new Set(prev).add(s.id));
                      }}
                      disabled={isAdded}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        isAdded
                          ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                          : "bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/25"
                      }`}
                    >
                      {isAdded ? "✓ Added" : "Add"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
