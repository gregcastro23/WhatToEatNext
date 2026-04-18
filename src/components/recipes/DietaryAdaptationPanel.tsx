"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Recipe } from "@/types/recipe";
import {
  adaptRecipe,
  isAlreadyCompatible,
  needsAdaptation,
  type AdaptationResult,
  type DietaryMode,
} from "@/utils/dietaryAdaptation";

const MODES: Array<{ key: DietaryMode; label: string; icon: string }> = [
  { key: "vegan", label: "Vegan", icon: "\u{1F33F}" },
  { key: "vegetarian", label: "Vegetarian", icon: "\u{1F957}" },
  { key: "gluten-free", label: "Gluten-Free", icon: "\u{1F33E}" },
  { key: "dairy-free", label: "Dairy-Free", icon: "\u{1F95B}" },
  { key: "keto", label: "Keto", icon: "\u{1F951}" },
  { key: "low-carb", label: "Low-Carb", icon: "\u{1F366}" },
];

const PREFERENCES_KEY = "userFoodPreferences";
const DISMISSED_KEY = "alchm:dietary-suggestion-dismissed:v1";

/** Map a free-form preference string to a DietaryMode. Permissive. */
function matchPreferenceToMode(pref: string): DietaryMode | null {
  const p = pref.toLowerCase().trim();
  if (p === "vegan") return "vegan";
  if (p === "vegetarian" || p === "veg") return "vegetarian";
  if (p.includes("gluten")) return "gluten-free";
  if (p.includes("dairy") || p === "lactose-free") return "dairy-free";
  if (p === "keto" || p === "ketogenic") return "keto";
  if (p.includes("low carb") || p.includes("low-carb")) return "low-carb";
  return null;
}

interface StoredPrefs {
  dietaryRestrictions?: string[];
}

function readStoredPreferredMode(): DietaryMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPrefs;
    const list = Array.isArray(parsed.dietaryRestrictions) ? parsed.dietaryRestrictions : [];
    for (const r of list) {
      const m = matchPreferenceToMode(r);
      if (m) return m;
    }
  } catch {
    // ignore
  }
  return null;
}

function savePreferredMode(mode: DietaryMode) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    const parsed: StoredPrefs & Record<string, unknown> = raw ? JSON.parse(raw) : {};
    const existing = Array.isArray(parsed.dietaryRestrictions) ? parsed.dietaryRestrictions : [];
    // Drop any existing entries that map to a dietary mode (one active mode at a time)
    const withoutModes = existing.filter((r) => matchPreferenceToMode(r) === null);
    parsed.dietaryRestrictions = [...withoutModes, mode];
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn("preference save failed:", err);
  }
}

function formatDelta(n: number, unit = "", digits = 0): string {
  if (n === 0) return `0${unit}`;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}${unit}`;
}

interface Props {
  recipe: Recipe;
  activeMode: DietaryMode | null;
  onModeChange: (mode: DietaryMode | null) => void;
}

export function DietaryAdaptationPanel({ recipe, activeMode, onModeChange }: Props) {
  const [preferredMode, setPreferredMode] = useState<DietaryMode | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [savedRecently, setSavedRecently] = useState<DietaryMode | null>(null);

  useEffect(() => {
    setPreferredMode(readStoredPreferredMode());
    try {
      const dismissed = window.localStorage.getItem(DISMISSED_KEY);
      setSuggestionDismissed(dismissed === "1");
    } catch {
      // ignore
    }
  }, []);

  const showSuggestion = useMemo(() => {
    if (!preferredMode) return false;
    if (suggestionDismissed) return false;
    if (activeMode) return false;
    if (isAlreadyCompatible(recipe, preferredMode)) return false;
    return needsAdaptation(recipe, preferredMode);
  }, [preferredMode, suggestionDismissed, activeMode, recipe]);

  const adaptation: AdaptationResult | null = useMemo(() => {
    if (!activeMode) return null;
    return adaptRecipe(recipe, activeMode);
  }, [recipe, activeMode]);

  const handleDismissSuggestion = useCallback(() => {
    setSuggestionDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const handleSaveAsPreference = useCallback((mode: DietaryMode) => {
    savePreferredMode(mode);
    setPreferredMode(mode);
    setSavedRecently(mode);
    window.setTimeout(() => setSavedRecently(null), 2500);
  }, []);

  const showSaveToggle = activeMode !== null && activeMode !== preferredMode;

  return (
    <div className="glass-card-premium rounded-2xl border border-white/8 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 flex items-center gap-2">
            <span className="not-italic text-xl">{"\u{1F504}"}</span>
            Adapt This Recipe
          </h2>
          <p className="text-xs text-white/60 mt-1">
            One-click swap-outs. Original is never overwritten.
          </p>
        </div>
        {activeMode && (
          <button
            type="button"
            onClick={() => onModeChange(null)}
            className="text-xs text-amber-300 hover:text-amber-200 underline decoration-dotted underline-offset-4"
          >
            Reset to original
          </button>
        )}
      </div>

      {showSuggestion && preferredMode && (
        <div className="mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-indigo-200">
              <span className="font-semibold">Based on your profile ({preferredMode})</span>, here&apos;s how to adapt this dish.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onModeChange(preferredMode)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/30 border border-indigo-400/50 text-indigo-100 hover:bg-indigo-500/40"
            >
              Apply {preferredMode}
            </button>
            <button
              type="button"
              onClick={handleDismissSuggestion}
              aria-label="Dismiss suggestion"
              className="text-indigo-300/60 hover:text-indigo-200 text-sm"
            >
              &#x2715;
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {MODES.map(({ key, label, icon }) => {
          const compatible = isAlreadyCompatible(recipe, key);
          const wouldSwap = !compatible && needsAdaptation(recipe, key);
          const isActive = activeMode === key;
          const isPreferred = preferredMode === key;
          const disabled = compatible;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onModeChange(isActive ? null : key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 relative ${
                disabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 cursor-default"
                  : isActive
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                    : isPreferred
                      ? "bg-indigo-500/10 border-indigo-400/40 text-indigo-100 hover:bg-indigo-500/20"
                      : wouldSwap
                        ? "bg-white/5 border-white/10 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-200"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
              title={
                disabled
                  ? `Already ${label.toLowerCase()}-compatible`
                  : isPreferred
                    ? `Your saved preference`
                    : wouldSwap
                      ? `Adapt to ${label.toLowerCase()}`
                      : `No swap rules triggered for ${label.toLowerCase()}`
              }
            >
              <span className="not-italic">{icon}</span>
              {label}
              {disabled && <span className="ml-0.5 text-emerald-300">&#x2713;</span>}
              {isPreferred && !disabled && (
                <span className="ml-0.5 text-[10px] text-indigo-300" aria-label="Preferred">
                  {"\u2605"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showSaveToggle && (
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-white/60">
            {savedRecently === activeMode
              ? `Saved — future recipes will auto-suggest ${activeMode}.`
              : `Make ${activeMode} your default across the app?`}
          </span>
          {savedRecently !== activeMode && (
            <button
              type="button"
              onClick={() => handleSaveAsPreference(activeMode)}
              className="text-xs px-3 py-1 rounded-md bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 hover:bg-indigo-500/25"
            >
              Save as my preference
            </button>
          )}
        </div>
      )}

      {adaptation && <AdaptationBanner adaptation={adaptation} />}
    </div>
  );
}

function AdaptationBanner({ adaptation }: { adaptation: AdaptationResult }) {
  const { mode, swaps, nutritionalDelta, elementalDelta, compatible } = adaptation;

  if (compatible) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
        Recipe is already {mode}-compatible. No swaps needed.
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60">
        No ingredients matched {mode} swap rules. Review the full ingredient list for manual adjustments.
      </div>
    );
  }

  const nutritionChips: Array<{ label: string; value: string; cls: string }> = [];
  if (nutritionalDelta.calories != null && nutritionalDelta.calories !== 0) {
    nutritionChips.push({
      label: "cal",
      value: formatDelta(nutritionalDelta.calories),
      cls: nutritionalDelta.calories < 0 ? "text-emerald-300" : "text-orange-300",
    });
  }
  if (nutritionalDelta.protein != null && nutritionalDelta.protein !== 0) {
    nutritionChips.push({ label: "protein", value: formatDelta(nutritionalDelta.protein, "g"), cls: "text-sky-300" });
  }
  if (nutritionalDelta.carbs != null && nutritionalDelta.carbs !== 0) {
    nutritionChips.push({ label: "carbs", value: formatDelta(nutritionalDelta.carbs, "g"), cls: "text-amber-300" });
  }
  if (nutritionalDelta.fat != null && nutritionalDelta.fat !== 0) {
    nutritionChips.push({ label: "fat", value: formatDelta(nutritionalDelta.fat, "g"), cls: "text-rose-300" });
  }

  const elementalChips: Array<{ el: string; value: string; cls: string }> = [];
  (["Fire", "Water", "Earth", "Air"] as const).forEach((el) => {
    const v = elementalDelta[el];
    if (Math.abs(v) >= 0.005) {
      elementalChips.push({
        el,
        value: formatDelta(v, "", 2),
        cls: el === "Fire" ? "text-red-300" : el === "Water" ? "text-blue-300" : el === "Earth" ? "text-amber-300" : "text-sky-300",
      });
    }
  });

  return (
    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-amber-200 font-semibold">
          Adapted for {mode} &middot; {swaps.length} swap{swaps.length === 1 ? "" : "s"}
        </span>
        {nutritionChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {nutritionChips.map((c) => (
              <span key={c.label} className={`text-xs ${c.cls}`}>
                {c.value} {c.label}
              </span>
            ))}
          </div>
        )}
        {elementalChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {elementalChips.map((c) => (
              <span key={c.el} className={`text-xs ${c.cls}`}>
                {c.el} {c.value}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-white/50 mt-1.5 italic">
        Deltas are estimates. ESMS/planetary scores reflect the original recipe.
      </p>
    </div>
  );
}
