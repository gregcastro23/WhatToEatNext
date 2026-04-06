"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import { sauceRecommender } from "@/services/sauceRecommender";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";
import type { Variants } from "framer-motion";

// ===== Constants =====

const ELEMENT_ICONS: Record<string, string> = {
  Fire: "\u{1F525}",
  Water: "\u{1F4A7}",
  Earth: "\u{1F30D}",
  Air: "\u{1F4A8}",
};

const ELEMENT_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  Fire: { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" },
  Water: { bar: "bg-blue-500", text: "text-blue-400", bg: "bg-blue-500/10" },
  Earth: { bar: "bg-amber-600", text: "text-amber-400", bg: "bg-amber-500/10" },
  Air: { bar: "bg-sky-400", text: "text-sky-400", bg: "bg-sky-500/10" },
};

const PLANET_ICONS: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
  Uranus: "\u2645",
  Neptune: "\u2646",
  Pluto: "\u2647",
};

const SPICE_LEVEL_DISPLAY: Record<string, { label: string; color: string; dots: number }> = {
  "None": { label: "No Spice", color: "text-slate-400", dots: 0 },
  "none": { label: "No Spice", color: "text-slate-400", dots: 0 },
  "mild": { label: "Mild", color: "text-green-400", dots: 1 },
  "Mild": { label: "Mild", color: "text-green-400", dots: 1 },
  "medium": { label: "Medium", color: "text-yellow-400", dots: 2 },
  "Medium": { label: "Medium", color: "text-yellow-400", dots: 2 },
  "hot": { label: "Hot", color: "text-orange-400", dots: 3 },
  "Hot": { label: "Hot", color: "text-orange-400", dots: 3 },
  "very hot": { label: "Very Hot", color: "text-red-400", dots: 4 },
  "Very Hot": { label: "Very Hot", color: "text-red-400", dots: 4 },
};

// ===== Helpers =====

function getBaseServings(recipe: Recipe): number {
  return (recipe as any).baseServingSize
    || recipe.servingSize
    || recipe.numberOfServings
    || (recipe as any).servings
    || 1;
}

function formatTime(minutes: number | undefined): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function getTimeMinutes(recipe: Recipe): { prep: number; cook: number } {
  const details = (recipe as any).details;
  if (details?.prepTimeMinutes != null) {
    return { prep: details.prepTimeMinutes, cook: details.cookTimeMinutes || 0 };
  }
  // Fallback: parse string times
  const parseTime = (t?: string): number => {
    if (!t) return 0;
    const match = t.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  return { prep: parseTime(recipe.prepTime), cook: parseTime(recipe.cookTime) };
}

function getCookingMethods(recipe: Recipe): string[] {
  const methods = (recipe as any).cookingMethods || recipe.cookingMethod || [];
  const arr = Array.isArray(methods) ? methods : [methods];
  return arr.map((m: any) => (typeof m === "string" ? m : m?.name || "")).filter(Boolean);
}

function getMealTypes(recipe: Recipe): string[] {
  if (!recipe.mealType) return [];
  return Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];
}

function getSeasons(recipe: Recipe): string[] {
  if (!recipe.season) return [];
  return Array.isArray(recipe.season) ? recipe.season : [recipe.season];
}

function getSpiceLevel(recipe: Recipe): string {
  const level = recipe.spiceLevel ?? (recipe as any).details?.spiceLevel;
  if (typeof level === "number") {
    if (level === 0) return "None";
    if (level <= 2) return "Mild";
    if (level <= 4) return "Medium";
    if (level <= 6) return "Hot";
    return "Very Hot";
  }
  return level || "";
}

function getPlanetaryInfluences(recipe: Recipe): string[] {
  const pi = recipe.planetaryInfluences;
  if (pi && typeof pi === "object" && !Array.isArray(pi)) {
    return [...(pi.favorable || []), ...(pi.neutral || [])];
  }
  if (Array.isArray(pi)) return pi as string[];
  const astro = recipe.astrologicalInfluences;
  if (Array.isArray(astro)) return astro;
  return [];
}

function getZodiacInfluences(recipe: Recipe): string[] {
  const zi = recipe.zodiacInfluences;
  if (Array.isArray(zi)) return zi.map((z: any) => typeof z === "string" ? z : z?.name || "").filter(Boolean);
  return [];
}

function getLunarPhases(recipe: Recipe): string[] {
  const lp = recipe.lunarPhaseInfluences;
  if (Array.isArray(lp)) return lp;
  return [];
}

function getNutrition(recipe: Recipe): Record<string, any> | null {
  const n = recipe.nutrition;
  if (!n) return null;
  return {
    calories: n.calories,
    protein: (n as any).protein ?? (n as any).proteinG,
    carbs: (n as any).carbs ?? (n as any).carbsG,
    fat: (n as any).fat ?? (n as any).fatG,
    fiber: (n as any).fiber ?? (n as any).fiberG,
    sodium: (n as any).sodium ?? (n as any).sodiumMg,
    sugar: (n as any).sugar ?? (n as any).sugarG,
    vitamins: (n as any).vitamins,
    minerals: (n as any).minerals,
  };
}

function getSubstitutions(recipe: Recipe): Array<{ original: string; alternatives: string[] }> {
  const subs = recipe.substitutions;
  if (!subs) return [];
  if (Array.isArray(subs)) {
    return subs.map((s: any) => ({
      original: s.original || s.originalIngredient || "",
      alternatives: s.alternatives || s.substituteOptions || [],
    }));
  }
  // Object format fallback
  return Object.entries(subs).map(([key, value]) => ({
    original: key,
    alternatives: Array.isArray(value) ? value : [String(value)],
  }));
}

function getPairingRecommendations(recipe: Recipe): Record<string, string[]> | null {
  const pr = recipe.pairingRecommendations;
  if (!pr) return null;
  if (Array.isArray(pr)) {
    return { suggestions: pr };
  }
  if (typeof pr === "object") {
    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(pr)) {
      if (Array.isArray(value) && value.length > 0) {
        result[key] = value;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }
  return null;
}

function buildPlainTextRecipe(recipe: Recipe, servings: number): string {
  const baseServings = getBaseServings(recipe);
  const scale = servings / baseServings;
  const times = getTimeMinutes(recipe);
  const methods = getCookingMethods(recipe);
  const nutrition = getNutrition(recipe);
  const subs = getSubstitutions(recipe);

  let text = "";
  text += `${"=".repeat(50)}\n`;
  text += `${recipe.name}\n`;
  text += `${"=".repeat(50)}\n\n`;

  if (recipe.description) {
    text += `${recipe.description}\n\n`;
  }

  text += `Cuisine: ${recipe.cuisine || "N/A"}\n`;
  text += `Servings: ${servings}\n`;
  if (times.prep) text += `Prep Time: ${formatTime(times.prep)}\n`;
  if (times.cook) text += `Cook Time: ${formatTime(times.cook)}\n`;
  if (times.prep && times.cook) text += `Total Time: ${formatTime(times.prep + times.cook)}\n`;
  if (methods.length > 0) text += `Cooking Methods: ${methods.join(", ")}\n`;
  const spice = getSpiceLevel(recipe);
  if (spice) text += `Spice Level: ${spice}\n`;
  text += "\n";

  text += `--- INGREDIENTS (${servings} servings) ---\n\n`;
  recipe.ingredients.forEach((ing) => {
    const amount = ing.amount ? (Math.round(ing.amount * scale * 100) / 100) : "";
    text += `- ${amount} ${ing.unit || ""} ${ing.name}`.trim();
    if (ing.notes) text += ` (${ing.notes})`;
    text += "\n";
  });
  text += "\n";

  text += `--- INSTRUCTIONS ---\n\n`;
  recipe.instructions.forEach((inst, i) => {
    text += `${i + 1}. ${inst}\n\n`;
  });

  if (nutrition) {
    text += `--- NUTRITION (per serving) ---\n\n`;
    if (nutrition.calories) text += `Calories: ${nutrition.calories}\n`;
    if (nutrition.protein) text += `Protein: ${nutrition.protein}g\n`;
    if (nutrition.carbs) text += `Carbs: ${nutrition.carbs}g\n`;
    if (nutrition.fat) text += `Fat: ${nutrition.fat}g\n`;
    if (nutrition.fiber) text += `Fiber: ${nutrition.fiber}g\n`;
    text += "\n";
  }

  if (subs.length > 0) {
    text += `--- SUBSTITUTIONS ---\n\n`;
    subs.forEach((s) => {
      text += `- ${s.original}: ${s.alternatives.join(", ")}\n`;
    });
    text += "\n";
  }

  text += `\nFrom Alchm.kitchen\n`;
  return text;
}

// ===== Section Components =====

function SectionCard({ title, icon, children, className = "" }: {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">
        {icon && <span className="text-2xl not-italic">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function ElementalBar({ element, value }: { element: string; value: number }) {
  const colors = ELEMENT_COLORS[element] || { bar: "bg-slate-500", text: "text-slate-400", bg: "bg-slate-500/10" };
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-center text-lg">{ELEMENT_ICONS[element] || ""}</span>
      <span className={`w-14 text-sm font-medium ${colors.text}`}>{element}</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm text-slate-400">{pct}%</span>
    </div>
  );
}

function SpiceMeter({ level }: { level: string }) {
  const config = SPICE_LEVEL_DISPLAY[level] || { label: level, color: "text-slate-400", dots: 0 };
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i <= config.dots ? "bg-red-500" : "bg-slate-700"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ===== Alchemical Score Components =====

const ESMS_CONFIG = {
  Spirit:    { color: "#f59e0b", stroke: "stroke-amber-400",    text: "text-amber-400",    label: "Spirit",    symbol: "\u2609" },
  Essence:   { color: "#6366f1", stroke: "stroke-indigo-400",   text: "text-indigo-400",   label: "Essence",   symbol: "\u2640" },
  Matter:    { color: "#10b981", stroke: "stroke-emerald-400",  text: "text-emerald-400",  label: "Matter",    symbol: "\u2295" },
  Substance: { color: "#a855f7", stroke: "stroke-purple-400",   text: "text-purple-400",   label: "Substance", symbol: "\u2641" },
} as const;

const MONICA_COMPONENT_CONFIG = {
  Heat:       { color: "#f97316", stroke: "stroke-orange-400",  text: "text-orange-400",  label: "Heat",       symbol: "\u{1F525}" },
  Entropy:    { color: "#3b82f6", stroke: "stroke-blue-400",    text: "text-blue-400",    label: "Entropy",    symbol: "\u{1F4A7}" },
  Reactivity: { color: "#eab308", stroke: "stroke-yellow-400",  text: "text-yellow-400",  label: "Reactivity", symbol: "\u26A1" },
} as const;

// Segmented SVG donut: renders stacked circles using stroke-dasharray + offset
interface DonutSegment { value: number; color: string; label: string; }

function SegmentedDonut({
  segments,
  centerLabel,
  centerSublabel,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerSublabel?: string;
}) {
  // r = 15.9155 → circumference ≈ 100, convenient for percentage math
  const r = 15.9155;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  let accumulated = 0;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {/* Background track */}
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgb(30,41,59)" strokeWidth="3.5" />
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100;
          const dashOffset = 100 - accumulated;
          accumulated += pct;
          return (
            <circle
              key={i}
              cx="18" cy="18" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-100 leading-tight">{centerLabel}</span>
        {centerSublabel && <span className="text-xs text-slate-500 leading-tight">{centerSublabel}</span>}
      </div>
    </div>
  );
}

function DonutLegend({ segments, total }: { segments: DonutSegment[]; total: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
      {segments.map((seg) => (
        <div key={seg.label} className="flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
          <span className="text-slate-400 truncate">{seg.label}</span>
          <span className="text-slate-300 font-medium ml-auto">
            {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

function computeMonicaComponents(
  spirit: number, essence: number, matter: number, substance: number,
  fire: number, water: number, earth: number, air: number,
) {
  const denomHeat = Math.max(0.0001, substance + essence + matter + water + air + earth);
  const Heat = (spirit * spirit + fire * fire) / (denomHeat * denomHeat);

  const denomEntropy = Math.max(0.0001, essence + matter + earth + water);
  const Entropy = (spirit * spirit + substance * substance + fire * fire + air * air) / (denomEntropy * denomEntropy);

  const denomReactivity = Math.max(0.0001, matter + earth);
  const Reactivity = (spirit * spirit + substance * substance + essence * essence + fire * fire + air * air + water * water) / (denomReactivity * denomReactivity);

  return { Heat, Entropy, Reactivity };
}

function AlchemicalScoreSection({ recipe }: { recipe: Recipe }) {
  const spirit    = (recipe as any).spirit    ?? 0;
  const essence   = (recipe as any).essence   ?? 0;
  const matter    = (recipe as any).matter    ?? 0;
  const substance = (recipe as any).substance ?? 0;
  const aSharp    = spirit + essence + matter + substance;

  const fire  = recipe.elementalProperties?.Fire  ?? 0;
  const water = recipe.elementalProperties?.Water ?? 0;
  const earth = recipe.elementalProperties?.Earth ?? 0;
  const air   = recipe.elementalProperties?.Air   ?? 0;

  const { Heat, Entropy, Reactivity } = computeMonicaComponents(
    spirit, essence, matter, substance, fire, water, earth, air
  );
  const monicaComponentTotal = Heat + Entropy + Reactivity;

  const aSharpSegments: DonutSegment[] = (
    [
      { key: "Spirit"    as const, value: spirit    },
      { key: "Essence"   as const, value: essence   },
      { key: "Matter"    as const, value: matter    },
      { key: "Substance" as const, value: substance },
    ] as Array<{ key: keyof typeof ESMS_CONFIG; value: number }>
  )
    .filter((s) => s.value > 0)
    .map((s) => ({ value: s.value, color: ESMS_CONFIG[s.key].color, label: ESMS_CONFIG[s.key].label }));

  const monicaSegments: DonutSegment[] = (
    [
      { key: "Heat"       as const, value: Heat       },
      { key: "Entropy"    as const, value: Entropy    },
      { key: "Reactivity" as const, value: Reactivity },
    ] as Array<{ key: keyof typeof MONICA_COMPONENT_CONFIG; value: number }>
  )
    .filter((s) => s.value > 0)
    .map((s) => ({ value: s.value, color: MONICA_COMPONENT_CONFIG[s.key].color, label: MONICA_COMPONENT_CONFIG[s.key].label }));

  const monicaScore  = recipe.monicaScore;
  const monicaLabel  = recipe.monicaScoreLabel;
  const rawMonica    = (recipe as any).monicaOptimization?.optimizedMonica as number | null | undefined;

  // Ingredient-summed alchemical quantities
  const ingAlch = recipe.ingredientAlchemicalSummary;
  const ingTotalASharp = ingAlch?.totalASharp ?? 0;
  const ingASharpSegments: DonutSegment[] = ingAlch
    ? (
        [
          { key: "Spirit"    as const, value: ingAlch.totalSpirit    },
          { key: "Essence"   as const, value: ingAlch.totalEssence   },
          { key: "Matter"    as const, value: ingAlch.totalMatter    },
          { key: "Substance" as const, value: ingAlch.totalSubstance },
        ] as Array<{ key: keyof typeof ESMS_CONFIG; value: number }>
      )
        .filter((s) => s.value > 0)
        .map((s) => ({ value: s.value, color: ESMS_CONFIG[s.key].color, label: ESMS_CONFIG[s.key].label }))
    : [];

  const hasASharp = aSharp > 0;
  const hasIngASharp = ingTotalASharp > 0;
  const hasMonicaDisplay = monicaScore != null || monicaComponentTotal > 0;

  if (!hasASharp && !hasIngASharp && !hasMonicaDisplay) return null;

  return (
    <SectionCard title="Alchemical Scores" icon={"\u2697\uFE0F"}>
      <div className="space-y-6">

        {/* ── Ingredient-Summed A# ── */}
        {hasIngASharp && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-slate-300">A<sup className="text-amber-400">#</sup></span>
                <span className="text-xs text-slate-500 ml-2">Ingredient Sum</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Σ ingredients = <span className="text-amber-300 font-bold">{ingTotalASharp.toFixed(2)}</span>
              </span>
            </div>

            <SegmentedDonut
              segments={ingASharpSegments}
              centerLabel={ingTotalASharp.toFixed(1)}
              centerSublabel="A#"
            />

            {/* Per-component totals */}
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {(["Spirit", "Essence", "Matter", "Substance"] as const).map((prop) => {
                const val = prop === "Spirit" ? (ingAlch?.totalSpirit ?? 0)
                  : prop === "Essence" ? (ingAlch?.totalEssence ?? 0)
                  : prop === "Matter" ? (ingAlch?.totalMatter ?? 0)
                  : (ingAlch?.totalSubstance ?? 0);
                const cfg = ESMS_CONFIG[prop];
                if (val === 0) return null;
                return (
                  <div key={prop} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-slate-400">{cfg.label}</span>
                    <span className={`${cfg.text} font-semibold ml-auto`}>{val.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Match rate indicator */}
            {ingAlch && ingAlch.matchRate < 1 && (
              <p className="text-xs text-slate-600 mt-2">
                {Math.round(ingAlch.matchRate * 100)}% of ingredients matched in alchemical database
              </p>
            )}
          </div>
        )}

        {hasIngASharp && (hasASharp || hasMonicaDisplay) && (
          <div className="border-t border-slate-800" />
        )}

        {/* ── Planetary A# gauge ── */}
        {hasASharp && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-slate-300">A<sup className="text-amber-400">#</sup></span>
                <span className="text-xs text-slate-500 ml-2">Planetary</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                S+E+M+Sb = <span className="text-amber-300 font-bold">{aSharp.toFixed(2)}</span>
              </span>
            </div>

            <SegmentedDonut
              segments={aSharpSegments}
              centerLabel={aSharp.toFixed(1)}
              centerSublabel="A#"
            />

            {/* ESMS value row */}
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {(["Spirit", "Essence", "Matter", "Substance"] as const).map((prop) => {
                const val = prop === "Spirit" ? spirit : prop === "Essence" ? essence : prop === "Matter" ? matter : substance;
                const cfg = ESMS_CONFIG[prop];
                if (val === 0) return null;
                return (
                  <div key={prop} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-slate-400">{cfg.label}</span>
                    <span className={`${cfg.text} font-semibold ml-auto`}>{val.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasASharp && hasMonicaDisplay && (
          <div className="border-t border-slate-800" />
        )}

        {/* ── Monica gauge ── */}
        {hasMonicaDisplay && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-slate-300">Monica</span>
                <span className="text-xs text-slate-500 ml-2">Constant</span>
              </div>
              {rawMonica != null && (
                <span className="text-xs text-slate-500 font-mono">
                  M = <span className="text-indigo-300 font-bold">{rawMonica.toFixed(3)}</span>
                </span>
              )}
            </div>

            {monicaComponentTotal > 0 ? (
              <>
                <SegmentedDonut
                  segments={monicaSegments}
                  centerLabel={monicaScore != null ? String(Math.round(monicaScore)) : "—"}
                  centerSublabel="/100"
                />
                <DonutLegend segments={monicaSegments} total={monicaComponentTotal} />
              </>
            ) : monicaScore != null ? (
              // Fallback: simple single-arc gauge if components are zero
              <div className="relative w-28 h-28 mx-auto">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r={15.9155} fill="none" stroke="rgb(30,41,59)" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r={15.9155}
                    fill="none" stroke="#f59e0b" strokeWidth="3.5"
                    strokeDasharray={`${monicaScore} ${100 - monicaScore}`}
                    strokeDashoffset="100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-amber-300">{Math.round(monicaScore)}</span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
              </div>
            ) : null}

            {/* Component values */}
            {monicaComponentTotal > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {(["Heat", "Entropy", "Reactivity"] as const).map((comp) => {
                  const val = comp === "Heat" ? Heat : comp === "Entropy" ? Entropy : Reactivity;
                  const cfg = MONICA_COMPONENT_CONFIG[comp];
                  return (
                    <div key={comp} className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <div className={`text-sm font-bold ${cfg.text}`}>{val.toFixed(3)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {monicaLabel && (
              <p className="text-center text-xs font-medium text-amber-400/80 mt-3 italic">
                {monicaLabel}
              </p>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function NutritionGrid({ nutrition }: { nutrition: Record<string, any> }) {
  const macros = [
    { label: "Calories", value: nutrition.calories, unit: "", color: "text-amber-400" },
    { label: "Protein", value: nutrition.protein, unit: "g", color: "text-emerald-400" },
    { label: "Carbs", value: nutrition.carbs, unit: "g", color: "text-blue-400" },
    { label: "Fat", value: nutrition.fat, unit: "g", color: "text-orange-400" },
    { label: "Fiber", value: nutrition.fiber, unit: "g", color: "text-green-400" },
    { label: "Sodium", value: nutrition.sodium, unit: "mg", color: "text-purple-400" },
    { label: "Sugar", value: nutrition.sugar, unit: "g", color: "text-pink-400" },
  ].filter((m) => m.value != null && m.value !== 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {macros.map((m) => (
        <div key={m.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
          <div className={`text-xl font-bold ${m.color}`}>
            {m.value}{m.unit}
          </div>
          <div className="text-xs text-slate-500 mt-1">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

// ===== Main Component =====

export default function RecipePage(props: any) {
  const params = props.params as { recipeId: string };
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recommendedSauces, setRecommendedSauces] = useState<string[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [copied, setCopied] = useState(false);

  const baseServings = useMemo(() => recipe ? getBaseServings(recipe) : 1, [recipe]);
  const scale = servings / baseServings;

  useEffect(() => {
    if (params.recipeId) {
      const fetchRecipe = async () => {
        setIsLoading(true);
        try {
          const recipeService = UnifiedRecipeService.getInstance();
          const fetchedRecipe = await recipeService.getRecipeById(params.recipeId);
          setRecipe(fetchedRecipe);

          if (fetchedRecipe) {
            setServings(getBaseServings(fetchedRecipe));

            const proteins = fetchedRecipe.ingredients
              .filter((i) => i.category === "protein")
              .map((i) => i.name);
            const vegetables = fetchedRecipe.ingredients
              .filter((i) => i.category === "vegetable")
              .map((i) => i.name);
            const cookingMethods = getCookingMethods(fetchedRecipe);

            const sauces = await sauceRecommender.recommendSauce(
              fetchedRecipe.cuisine ?? '',
              {
                protein: proteins[0],
                vegetable: vegetables[0],
                cookingMethod: cookingMethods[0],
              },
            );
            setRecommendedSauces(sauces);

            const allRecipes = await recipeService.getAllRecipes();
            const recommended = await _recipeRecommender.recommendSimilarRecipes(
              fetchedRecipe,
              allRecipes,
            );
            setRecommendedRecipes(recommended);
          }
        } catch (error) {
          console.error("Failed to fetch recipe:", error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchRecipe();
    }
  }, [params.recipeId]);

  const handleCopyRecipe = useCallback(async () => {
    if (!recipe) return;
    const text = buildPlainTextRecipe(recipe, servings);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [recipe, servings]);

  // ===== Loading / Not Found =====

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-lg">Conjuring recipe...</p>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-4xl">&#x1F50D;</p>
          <p className="text-xl text-slate-400">Recipe not found</p>
          <Link
            href="/recipes"
            className="inline-block mt-4 px-6 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            Browse Recipes
          </Link>
        </div>
      </main>
    );
  }

  // ===== Derived data =====

  const times = getTimeMinutes(recipe);
  const methods = getCookingMethods(recipe);
  const mealTypes = getMealTypes(recipe);
  const seasons = getSeasons(recipe);
  const spiceLevel = getSpiceLevel(recipe);
  const planets = getPlanetaryInfluences(recipe);
  const signs = getZodiacInfluences(recipe);
  const lunarPhases = getLunarPhases(recipe);
  const nutrition = getNutrition(recipe);
  const substitutions = getSubstitutions(recipe);
  const pairings = getPairingRecommendations(recipe);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ===== Hero Header ===== */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
          {/* Back link */}
          <Link
            href="/recipes"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            &#x2190; Back to recipes
          </Link>

          {/* Title & description */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-indigo-400 leading-tight pb-2">
            {recipe.name}
          </h1>

          {recipe.description && (
            <p className="mt-4 text-lg text-slate-400 max-w-3xl leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            {recipe.cuisine && (
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-sm text-amber-300 font-medium">
                {recipe.cuisine}
              </span>
            )}
            {times.prep > 0 && (
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-sm text-slate-300">
                Prep: {formatTime(times.prep)}
              </span>
            )}
            {times.cook > 0 && (
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-sm text-slate-300">
                Cook: {formatTime(times.cook)}
              </span>
            )}
            {(times.prep > 0 || times.cook > 0) && (
              <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-300 font-medium">
                Total: {formatTime(times.prep + times.cook)}
              </span>
            )}
            {methods.length > 0 && methods.map((m) => (
              <span key={m} className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-sm text-slate-300 capitalize">
                {m}
              </span>
            ))}
          </div>

          {/* Servings adjuster + Copy button */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2.5">
              <label htmlFor="servings" className="text-sm text-slate-400 font-medium whitespace-nowrap">
                Servings
              </label>
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-lg font-bold"
                aria-label="Decrease servings"
              >
                -
              </button>
              <input
                id="servings"
                type="number"
                min={1}
                max={100}
                value={servings}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 100) setServings(val);
                }}
                className="w-14 text-center bg-slate-900 border border-slate-600 rounded-lg py-1 text-slate-100 text-lg font-bold focus:outline-none focus:border-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setServings((s) => Math.min(100, s + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-lg font-bold"
                aria-label="Increase servings"
              >
                +
              </button>
              {servings !== baseServings && (
                <button
                  onClick={() => setServings(baseServings)}
                  className="text-xs text-amber-400 hover:text-amber-300 ml-1 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={handleCopyRecipe}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                copied
                  ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                  : "bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:bg-slate-700/80 hover:text-amber-300"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy Recipe
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== Main Content ===== */}
      <motion.div
        className="max-w-5xl mx-auto px-4 pb-16 space-y-8"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
        } as Variants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== Left Column: Ingredients + Instructions ===== */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
            <SectionCard title="Ingredients" icon="&#x1F9C2;">
              {servings !== baseServings && (
                <p className="text-sm text-amber-400/80 mb-4 italic">
                  Scaled from {baseServings} to {servings} servings
                </p>
              )}
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, index) => {
                  const scaledAmount = ing.amount ? Math.round(ing.amount * scale * 100) / 100 : null;
                  return (
                    <li key={index} className="flex items-start gap-3 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 shrink-0 group-hover:bg-amber-300 transition-colors" />
                      <div>
                        <span className="text-slate-100">
                          {scaledAmount != null && (
                            <span className="text-amber-300 font-semibold">{scaledAmount} </span>
                          )}
                          {ing.unit && <span className="text-slate-300">{ing.unit} </span>}
                          {ing.name}
                        </span>
                        {ing.notes && (
                          <span className="text-sm text-slate-500 ml-2 italic">({ing.notes})</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>

            {/* Instructions */}
            <SectionCard title="Instructions" icon="&#x1F4DD;">
              <ol className="space-y-5">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-300">
                      {index + 1}
                    </span>
                    <p className="text-slate-300 leading-relaxed pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            {/* Chef's Tips & Variations */}
            {(recipe.tips?.length || recipe.chefNotes?.length || recipe.variations?.length || recipe.commonMistakes?.length || recipe.technicalTips?.length || recipe.presentationTips?.length) && (
              <SectionCard title="Chef's Notes & Tips" icon="&#x1F468;&#x200D;&#x1F373;">
                <div className="space-y-4">
                  {recipe.chefNotes && recipe.chefNotes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
                      <ul className="space-y-2">
                        {recipe.chefNotes.map((note, i) => (
                          <li key={i} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-amber-500 shrink-0">&#x25B8;</span> {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.tips && recipe.tips.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Tips</h3>
                      <ul className="space-y-2">
                        {recipe.tips.map((tip, i) => (
                          <li key={i} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-emerald-500 shrink-0">&#x2714;</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.technicalTips && recipe.technicalTips.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Tips</h3>
                      <ul className="space-y-2">
                        {recipe.technicalTips.map((tip, i) => (
                          <li key={i} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-blue-500 shrink-0">&#x2699;</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.commonMistakes && recipe.commonMistakes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Common Mistakes to Avoid</h3>
                      <ul className="space-y-2">
                        {recipe.commonMistakes.map((mistake, i) => (
                          <li key={i} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-red-500 shrink-0">&#x26A0;</span> {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.variations && recipe.variations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Variations</h3>
                      <ul className="space-y-2">
                        {recipe.variations.map((variation, i) => (
                          <li key={i} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-purple-500 shrink-0">&#x2728;</span> {variation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.presentationTips && recipe.presentationTips.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Presentation</h3>
                      <ul className="space-y-2">
                        {recipe.presentationTips.map((tip, i) => (
                          <li key={i} className="text-slate-300 text-sm flex gap-2">
                            <span className="text-pink-500 shrink-0">&#x1F3A8;</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Recommended Sauces */}
            {recommendedSauces.length > 0 && (
              <SectionCard title="Recommended Sauces" icon="&#x1F372;">
                <div className="flex flex-wrap gap-2">
                  {recommendedSauces.map((sauce, index) => (
                    <span key={index} className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-sm text-slate-300">
                      {sauce}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ===== Right Column: Details & Properties ===== */}
          <div className="space-y-6">
            {/* Quick Details */}
            <SectionCard title="Details" icon="&#x1F4CB;">
              <div className="space-y-3 text-sm">
                {recipe.cuisine && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cuisine</span>
                    <span className="text-slate-200 font-medium capitalize">{recipe.cuisine}</span>
                  </div>
                )}
                {mealTypes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Meal Type</span>
                    <span className="text-slate-200 capitalize">{mealTypes.join(", ")}</span>
                  </div>
                )}
                {seasons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Season</span>
                    <span className="text-slate-200 capitalize">{seasons.join(", ")}</span>
                  </div>
                )}
                {spiceLevel && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Spice Level</span>
                    <SpiceMeter level={spiceLevel} />
                  </div>
                )}
                {recipe.tools && recipe.tools.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block mb-1.5">Equipment</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.tools.map((tool, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Elemental Properties */}
            {recipe.elementalProperties && (
              <SectionCard title="Elemental Properties" icon="&#x2697;">
                <div className="space-y-3">
                  {(["Fire", "Water", "Earth", "Air"] as const).map((element) => (
                    <ElementalBar
                      key={element}
                      element={element}
                      value={recipe.elementalProperties[element] || 0}
                    />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Alchemical Scores: A# and Monica */}
            <AlchemicalScoreSection recipe={recipe} />

            {/* Astrological Affinities */}
            {(planets.length > 0 || signs.length > 0 || lunarPhases.length > 0) && (
              <SectionCard title="Astrological Affinities" icon="&#x2728;">
                <div className="space-y-4">
                  {planets.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Planets</h3>
                      <div className="flex flex-wrap gap-2">
                        {planets.map((planet) => (
                          <span key={planet} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
                            <span className="text-base">{PLANET_ICONS[planet] || ""}</span> {planet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {signs.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Zodiac Signs</h3>
                      <div className="flex flex-wrap gap-2">
                        {signs.map((sign) => (
                          <span key={sign} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-300 capitalize">
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lunarPhases.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lunar Phases</h3>
                      <div className="flex flex-wrap gap-2">
                        {lunarPhases.map((phase) => (
                          <span key={phase} className="px-2.5 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300">
                            &#x1F319; {phase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Nutrition */}
            {nutrition && (
              <SectionCard title="Nutrition Per Serving" icon="&#x1F4CA;">
                <NutritionGrid nutrition={nutrition} />
                {(nutrition.vitamins?.length > 0 || nutrition.minerals?.length > 0) && (
                  <div className="mt-4 space-y-3">
                    {nutrition.vitamins?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Vitamins</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {nutrition.vitamins.map((v: string) => (
                            <span key={v} className="px-2 py-0.5 bg-emerald-500/10 rounded text-xs text-emerald-400">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {nutrition.minerals?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Minerals</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {nutrition.minerals.map((m: string) => (
                            <span key={m} className="px-2 py-0.5 bg-sky-500/10 rounded text-xs text-sky-400">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
            )}

            {/* Substitutions */}
            {substitutions.length > 0 && (
              <SectionCard title="Substitutions" icon="&#x1F504;">
                <ul className="space-y-3">
                  {substitutions.map((sub, i) => (
                    <li key={i} className="text-sm">
                      <span className="text-amber-300 font-medium">{sub.original}</span>
                      <span className="text-slate-600 mx-2">&#x2192;</span>
                      <span className="text-slate-400">{sub.alternatives.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Pairing Recommendations */}
            {pairings && (
              <SectionCard title="Pairing Suggestions" icon="&#x1F377;">
                <div className="space-y-3">
                  {Object.entries(pairings).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{category}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((item, i) => (
                          <span key={i} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Cultural Notes */}
            {recipe.cuisineIntegration?.culturalNotes && recipe.cuisineIntegration.culturalNotes.length > 0 && (
              <SectionCard title="Cultural Notes" icon="&#x1F30E;">
                <ul className="space-y-2">
                  {recipe.cuisineIntegration.culturalNotes.map((note, i) => (
                    <li key={i} className="text-sm text-slate-400">{note}</li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Sensory Indicators */}
            {recipe.sensoryIndicators && (
              <SectionCard title="Sensory Indicators" icon="&#x1F440;">
                <div className="space-y-3 text-sm">
                  {recipe.sensoryIndicators.visual?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Visual</h3>
                      <p className="text-slate-400">{recipe.sensoryIndicators.visual.join("; ")}</p>
                    </div>
                  )}
                  {recipe.sensoryIndicators.aroma?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Aroma</h3>
                      <p className="text-slate-400">{recipe.sensoryIndicators.aroma.join("; ")}</p>
                    </div>
                  )}
                  {recipe.sensoryIndicators.texture?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Texture</h3>
                      <p className="text-slate-400">{recipe.sensoryIndicators.texture.join("; ")}</p>
                    </div>
                  )}
                  {recipe.sensoryIndicators.sound?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Sound</h3>
                      <p className="text-slate-400">{recipe.sensoryIndicators.sound.join("; ")}</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Flavor Profile */}
            {recipe.flavorProfile && (
              <SectionCard title="Flavor Profile" icon="&#x1F444;">
                <div className="space-y-3 text-sm">
                  {recipe.flavorProfile.primary && recipe.flavorProfile.primary.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Primary</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.flavorProfile.primary.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-orange-500/10 rounded text-xs text-orange-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.flavorProfile.accent && recipe.flavorProfile.accent.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">Accent</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.flavorProfile.accent.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-500/10 rounded text-xs text-yellow-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.flavorProfile.tasteBalance && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Taste Balance</h3>
                      <div className="space-y-1.5">
                        {Object.entries(recipe.flavorProfile.tasteBalance).map(([taste, value]) => (
                          <div key={taste} className="flex items-center gap-2">
                            <span className="w-14 text-xs text-slate-500 capitalize">{taste}</span>
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${(value / 10) * 100}%` }} />
                            </div>
                            <span className="w-5 text-xs text-slate-500 text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Dietary Tags */}
            {(recipe.isVegetarian || recipe.isVegan || recipe.isGlutenFree || recipe.isDairyFree || recipe.isNutFree || recipe.isKeto || recipe.isPaleo || recipe.isLowCarb) && (
              <SectionCard title="Dietary" icon="&#x1F96C;">
                <div className="flex flex-wrap gap-2">
                  {recipe.isVegetarian && <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">Vegetarian</span>}
                  {recipe.isVegan && <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">Vegan</span>}
                  {recipe.isGlutenFree && <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs text-yellow-400">Gluten-Free</span>}
                  {recipe.isDairyFree && <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400">Dairy-Free</span>}
                  {recipe.isNutFree && <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400">Nut-Free</span>}
                  {recipe.isKeto && <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-400">Keto</span>}
                  {recipe.isPaleo && <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs text-orange-400">Paleo</span>}
                  {recipe.isLowCarb && <span className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-xs text-teal-400">Low-Carb</span>}
                </div>
              </SectionCard>
            )}

            {/* Allergens */}
            {recipe.allergens && recipe.allergens.length > 0 && (
              <SectionCard title="Allergens" icon="&#x26A0;">
                <div className="flex flex-wrap gap-2">
                  {recipe.allergens.map((allergen, i) => (
                    <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400">
                      {allergen}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        {/* ===== Similar Recipes ===== */}
        {recommendedRecipes.length > 0 && (
          <div className="pt-8">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">
              Similar Recipes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRecipes.map((rec) => (
                <RecipeCard key={rec.id} recipe={rec} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
