"use client";

/**
 * Full Generated Recipe View
 *
 * Reads a generated recipe from localStorage (keyed by ID), then displays
 * a rich, printable page with:
 *  - Header: title + Monica score badge
 *  - Action bar: Save to Profile, Print, Copy to Clipboard
 *  - Body: ingredient list + step-by-step instructions
 *  - Footer: planetary alignment explanation ("Why this recipe?")
 *
 * @file src/app/generated-recipe/[id]/page.tsx
 */

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { getRecipeFromStore } from "@/utils/generatedRecipeStore";

// ─── Element helpers ─────────────────────────────────────────────────────────

function elementIcon(el: string) {
  switch (el) {
    case "Fire":
      return "🔥";
    case "Water":
      return "💧";
    case "Earth":
      return "🌍";
    case "Air":
      return "💨";
    default:
      return "⚡";
  }
}

function elementColor(el: string) {
  switch (el) {
    case "Fire":
      return "bg-red-500";
    case "Water":
      return "bg-blue-500";
    case "Earth":
      return "bg-green-600";
    case "Air":
      return "bg-cyan-400";
    default:
      return "bg-gray-400";
  }
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${color} text-white`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[11px] opacity-90">{label}</span>
    </div>
  );
}

// ─── Ingredient card ──────────────────────────────────────────────────────────

interface IngredientRowProps {
  name: string;
  amount?: number | string;
  unit?: string;
  elementalProperties?: Record<string, number>;
}

function IngredientRow({ name, amount, unit, elementalProperties }: IngredientRowProps) {
  const [showProps, setShowProps] = useState(false);
  const dominantElement =
    elementalProperties
      ? Object.entries(elementalProperties)
          .filter(([k]) => ["Fire", "Water", "Earth", "Air"].includes(k))
          .sort(([, a], [, b]) => b - a)[0]?.[0]
      : undefined;

  return (
    <li className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-2 min-w-0">
        {dominantElement && (
          <span className="text-base shrink-0">{elementIcon(dominantElement)}</span>
        )}
        <span className="font-medium text-gray-800 truncate">{name}</span>
        {amount !== undefined && (
          <span className="text-sm text-gray-500 shrink-0">
            {amount} {unit}
          </span>
        )}
      </div>

      {elementalProperties && (
        <button
          onClick={() => setShowProps((v) => !v)}
          className="text-xs text-purple-500 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          title="Show alchemical properties"
        >
          {showProps ? "Hide ✕" : "Alchemy ▾"}
        </button>
      )}

      {showProps && elementalProperties && (
        <div className="w-full mt-1 pt-1 border-t border-gray-100 flex flex-wrap gap-2">
          {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
            const val = elementalProperties[el] ?? 0;
            return (
              <div key={el} className="flex items-center gap-1">
                <span className="text-xs">{elementIcon(el)}</span>
                <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${elementColor(el)}`}
                    style={{ width: `${val * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{Math.round(val * 100)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GeneratedRecipePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [recipe, setRecipe] = useState<MonicaOptimizedRecipe | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getRecipeFromStore(id);
    if (found) {
      setRecipe(found);
    }
  }, [id]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopy = useCallback(() => {
    if (!recipe) return;
    const lines: string[] = [
      recipe.name,
      "",
      `Cuisine: ${recipe.cuisine || "Fusion"}`,
      recipe.prepTime ? `Prep: ${recipe.prepTime}` : "",
      recipe.cookTime ? `Cook: ${recipe.cookTime}` : "",
      "",
      "INGREDIENTS",
      ...(recipe.ingredients || []).map(
        (i) => `- ${i.amount ?? ""} ${i.unit ?? ""} ${i.name}`.trim(),
      ),
      "",
      "INSTRUCTIONS",
      ...(recipe.instructions || []).map((step, idx) => `${idx + 1}. ${step}`),
    ].filter((l) => l !== undefined);

    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [recipe]);

  const handleSaveToProfile = useCallback(async () => {
    if (!recipe) return;
    // Optimistic UI
    setSaved(true);
    try {
      const res = await fetch("/api/profile/saved-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe }),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      // Non-critical – recipe is already in localStorage
    }
  }, [recipe]);

  // ── Loading / Not Found ───────────────────────────────────────────────────

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-orange-50">
        <div className="text-center p-8 max-w-sm">
          <p className="text-gray-500 mb-4">
            Recipe not found. It may have expired from your session.
          </p>
          <Link
            href="/recipe-builder"
            className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            Back to Recipe Builder
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const monicaScore = recipe.alchemicalProperties?.monicaConstant;
  const monicaDisplay =
    monicaScore !== undefined && monicaScore !== null
      ? Math.round(monicaScore)
      : null;

  const monicaOptimized = recipe.monicaOptimization?.optimizedMonica;
  const monicaOptDisplay =
    monicaOptimized !== undefined ? Math.round(monicaOptimized) : null;

  const ingredients = recipe.ingredients ?? [];
  const instructions = recipe.instructions ?? [];

  const planetaryReasons: string[] = [
    ...(recipe.monicaOptimization?.planetaryTimingRecommendations ?? []),
    ...(recipe.monicaOptimization?.intensityModifications?.map(
      (m) => `Intensity modification: ${m.replace(/-/g, " ")}`,
    ) ?? []),
    ...(recipe.seasonalAdaptation?.seasonalCookingMethodAdjustments?.map(
      (a) => `${a.method}: ${a.adjustment} — ${a.reason}`,
    ) ?? []),
  ];

  const culturalNotes = recipe.cuisineIntegration?.culturalNotes ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-orange-50 print:bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6 print:space-y-4">

        {/* Back nav – hidden on print */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600"
          >
            ← Back
          </button>
          <Link
            href="/recipe-builder"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600"
          >
            Recipe Builder
          </Link>
        </div>

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {recipe.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {recipe.cuisine && (
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                    {recipe.cuisine}
                  </span>
                )}
                {Array.isArray(recipe.mealType) && recipe.mealType.map((m) => (
                  <span key={m} className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium capitalize">
                    {m}
                  </span>
                ))}
                {recipe.prepTime && (
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    Prep: {recipe.prepTime}
                  </span>
                )}
                {recipe.cookTime && (
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    Cook: {recipe.cookTime}
                  </span>
                )}
              </div>
              {recipe.description && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Score badges */}
            <div className="flex gap-2 shrink-0">
              {monicaDisplay !== null && (
                <ScoreBadge
                  label="Monica"
                  value={monicaDisplay}
                  color="bg-purple-600"
                />
              )}
              {monicaOptDisplay !== null && (
                <ScoreBadge
                  label="Optimized"
                  value={monicaOptDisplay}
                  color="bg-amber-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div className="flex flex-wrap gap-3 print:hidden">
          <button
            onClick={handleSaveToProfile}
            disabled={saved}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 transition-colors font-medium text-sm"
          >
            {saved ? "✓ Saved" : "Save to Profile"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            🖨 Print
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {copied ? "✓ Copied!" : "Copy to Clipboard"}
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="grid md:grid-cols-5 gap-6">

          {/* Ingredients – 2 cols */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Ingredients
              {recipe.numberOfServings && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  (serves {recipe.numberOfServings})
                </span>
              )}
            </h2>
            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-400">No ingredients listed.</p>
            ) : (
              <ul className="space-y-0.5">
                {ingredients.map((ing, i) => {
                  const ingExt = ing as typeof ing & {
                    elementalProperties?: Record<string, number>;
                  };
                  return (
                    <IngredientRow
                      key={ingExt.id ?? i}
                      name={String(ingExt.name ?? "Ingredient")}
                      amount={ingExt.amount}
                      unit={ingExt.unit}
                      elementalProperties={ingExt.elementalProperties}
                    />
                  );
                })}
              </ul>
            )}

            {/* Elemental profile */}
            {recipe.elementalProperties && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Elemental Profile
                </p>
                {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                  const val =
                    (recipe.elementalProperties as Record<string, number>)[el] ?? 0;
                  return (
                    <div key={el} className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm w-4">{elementIcon(el)}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${elementColor(el)}`}
                          style={{ width: `${val * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Instructions – 3 cols */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Instructions
            </h2>
            {instructions.length === 0 ? (
              <p className="text-sm text-gray-400">No instructions available.</p>
            ) : (
              <ol className="space-y-4">
                {instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-none w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {/* Nutrition strip */}
            {recipe.nutrition && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Nutrition (per serving)
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {recipe.nutrition.calories !== undefined && (
                    <span>
                      <strong>{recipe.nutrition.calories}</strong>{" "}
                      <span className="text-gray-400">kcal</span>
                    </span>
                  )}
                  {recipe.nutrition.protein !== undefined && (
                    <span>
                      <strong>{recipe.nutrition.protein}g</strong>{" "}
                      <span className="text-gray-400">protein</span>
                    </span>
                  )}
                  {recipe.nutrition.carbs !== undefined && (
                    <span>
                      <strong>{recipe.nutrition.carbs}g</strong>{" "}
                      <span className="text-gray-400">carbs</span>
                    </span>
                  )}
                  {recipe.nutrition.fat !== undefined && (
                    <span>
                      <strong>{recipe.nutrition.fat}g</strong>{" "}
                      <span className="text-gray-400">fat</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER: Why this recipe? ── */}
        {(planetaryReasons.length > 0 || culturalNotes.length > 0) && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5">
            <h2 className="text-base font-bold text-purple-800 mb-3">
              ✨ Why this recipe?
            </h2>

            {planetaryReasons.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1.5">
                  Planetary Alignment
                </p>
                <ul className="space-y-1">
                  {planetaryReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-purple-700">
                      <span className="text-purple-400 mt-0.5">◆</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {culturalNotes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">
                  Cultural Context
                </p>
                <ul className="space-y-1">
                  {culturalNotes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-700">
                      <span className="text-indigo-400 mt-0.5">◆</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-gray-400 pt-4">
          Generated by WhatToEatNext · alchm.kitchen
        </div>
      </div>
    </div>
  );
}
