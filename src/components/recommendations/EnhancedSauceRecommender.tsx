"use client";

/**
 * Enhanced Sauce Recommender — Cuisine-Native, Multi-Dimensional Scoring
 *
 * The recommender is organized around real culinary decisions instead of
 * abstract elemental sliders:
 *   1. Pick a cuisine (and optional region)
 *   2. Build the dish: protein + vegetable + cooking method
 *   3. Layer dietary needs, target flavors, and seasonal context
 *   4. (Optional) Sync with the live cosmic moment for astrological harmony
 *
 * Scoring blends 8 dimensions surfaced as a transparent breakdown so users
 * can understand why each sauce was suggested.
 */

import React, { useState, useMemo, useCallback } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { allSauces } from "@/data/sauces";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import {
  buildCuisineSaucePool,
  getCuisineFingerprint,
  listCuisines,
  recommendForCuisineContext,
  type CuisineSauceContext,
  type CuisineSauceResult,
  type FlavorAxis,
  type SauceRole,
  type UnifiedSauce,
} from "@/utils/cuisine/cuisineSauceProfiler";
import { scaleSauceIngredients, parseYieldToServings } from "@/utils/sauceScaling";

// ============================================================================
// Constants
// ============================================================================

const PROTEINS = [
  "beef",
  "pork",
  "chicken",
  "fish",
  "seafood",
  "tofu",
  "vegetarian",
  "vegetables",
];

const VEGETABLES = [
  "leafy",
  "root",
  "nightshades",
  "squash",
  "mushroom",
  "seaweed",
];

const COOKING_METHODS = [
  "grilling",
  "baking",
  "frying",
  "deep-frying",
  "braising",
  "steaming",
  "simmering",
  "raw",
  "sautéing",
  "roasting",
];

const DIETARY = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "glutenFree", label: "Gluten-Free" },
  { key: "dairyFree", label: "Dairy-Free" },
  { key: "lowSodium", label: "Low-Sodium" },
];

const FLAVOR_AXES: Array<{ key: FlavorAxis; label: string; color: string }> = [
  { key: "umami", label: "Umami", color: "bg-rose-500/15 text-rose-700 border-rose-300/40" },
  { key: "spicy", label: "Spicy", color: "bg-orange-500/15 text-orange-700 border-orange-300/40" },
  { key: "sweet", label: "Sweet", color: "bg-amber-500/15 text-amber-700 border-amber-300/40" },
  { key: "sour", label: "Sour", color: "bg-lime-500/15 text-lime-700 border-lime-300/40" },
  { key: "bitter", label: "Bitter", color: "bg-emerald-500/15 text-emerald-700 border-emerald-300/40" },
  { key: "salty", label: "Salty", color: "bg-sky-500/15 text-sky-700 border-sky-300/40" },
];

const ROLES: Array<{ key: SauceRole; label: string; description: string }> = [
  { key: "complement", label: "Complement", description: "Mirror the cuisine's energy" },
  { key: "contrast", label: "Contrast", description: "Cut through and contrast" },
  { key: "enhance", label: "Enhance", description: "Amplify the dominant note" },
  { key: "balance", label: "Balance", description: "Round out the missing notes" },
];

const SEASON_OPTIONS = [
  { key: "all", label: "Year-round" },
  { key: "spring", label: "Spring" },
  { key: "summer", label: "Summer" },
  { key: "fall", label: "Fall" },
  { key: "winter", label: "Winter" },
] as const;

// ============================================================================
// Helpers
// ============================================================================

function CuisineFingerprintPanel({ cuisineKey }: { cuisineKey: string }) {
  const fp = useMemo(() => getCuisineFingerprint(cuisineKey), [cuisineKey]);
  if (!fp) return null;

  const elementColors: Record<string, string> = {
    Fire: "bg-red-400",
    Water: "bg-blue-400",
    Earth: "bg-lime-500",
    Air: "bg-violet-400",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Cuisine Fingerprint
          </div>
          <div className="text-base font-semibold text-slate-800">{fp.name}</div>
          {fp.description && (
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{fp.description}</p>
          )}
        </div>
        <div className="flex gap-1.5 text-[10px] text-slate-500">
          <span className="bg-slate-100 px-2 py-1 rounded">
            {fp.motherSauceCount} mother
          </span>
          <span className="bg-slate-100 px-2 py-1 rounded">
            {fp.traditionalSauceCount} traditional
          </span>
          <span className="bg-slate-100 px-2 py-1 rounded">
            {fp.regions.length} regions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Elemental */}
        <div>
          <div className="text-[10px] text-slate-500 mb-1.5 font-medium">
            Elemental Profile
          </div>
          <div className="space-y-1">
            {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
              const v = fp.elementalProperties[el] ?? 0;
              return (
                <div key={el} className="flex items-center gap-2 text-[11px]">
                  <span className="w-10 text-slate-600">{el}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${elementColors[el]} rounded-full`}
                      style={{ width: `${Math.round(v * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-500">
                    {Math.round(v * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flavor profile */}
        {fp.flavorProfile && (
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 font-medium">
              Flavor Signature
            </div>
            <div className="space-y-1">
              {Object.entries(fp.flavorProfile).map(([k, raw]) => {
                const v = typeof raw === "number" ? raw : 0;
                return (
                  <div key={k} className="flex items-center gap-2 text-[11px]">
                    <span className="w-10 capitalize text-slate-600">{k}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        style={{ width: `${Math.round(v * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-500">
                      {Math.round(v * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Astrological */}
        <div>
          <div className="text-[10px] text-slate-500 mb-1.5 font-medium">
            Planetary Resonance
          </div>
          <div className="flex flex-wrap gap-1">
            {fp.planetaryResonance.length === 0 ? (
              <span className="text-[11px] text-slate-400">—</span>
            ) : (
              fp.planetaryResonance.map((p) => (
                <span
                  key={p}
                  className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.5 rounded"
                >
                  {p}
                </span>
              ))
            )}
          </div>
          {fp.signatureTechniques.length > 0 && (
            <>
              <div className="text-[10px] text-slate-500 mt-3 mb-1 font-medium">
                Signature Techniques
              </div>
              <div className="flex flex-wrap gap-1">
                {fp.signatureTechniques.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-amber-500"
        : pct >= 40
          ? "bg-orange-400"
          : "bg-slate-300";
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-28 text-slate-500">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-slate-600 tabular-nums">{pct}</span>
    </div>
  );
}

function SauceResultCard({
  result,
  rank,
}: {
  result: CuisineSauceResult;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  // Pull richer data if available
  const dataSauce = result.sauce.dataKey ? allSauces[result.sauce.dataKey] : undefined;
  const sauce = result.sauce;

  const scaledIngredients = useMemo(() => {
    const ings = sauce.ingredients ?? dataSauce?.ingredients;
    if (!ings) return [];
    return scaleSauceIngredients(ings, scaleMultiplier);
  }, [sauce.ingredients, dataSauce?.ingredients, scaleMultiplier]);

  const originBadge =
    sauce.origin === "mother"
      ? { label: "Mother sauce", className: "bg-amber-500 text-white" }
      : sauce.origin === "traditional"
        ? { label: "Traditional", className: "bg-slate-700 text-white" }
        : sauce.origin === "global"
          ? { label: sauce.ownerCuisine ?? "Global", className: "bg-slate-200 text-slate-700" }
          : { label: "Pairing reference", className: "bg-slate-100 text-slate-500" };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
            <span className="font-bold text-slate-300">#{rank}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${originBadge.className}`}>
              {originBadge.label}
            </span>
            {sauce.ownerCuisine && (
              <span className="text-slate-400">{sauce.ownerCuisine}</span>
            )}
          </div>
          <h3 className="font-semibold text-base text-slate-800 leading-tight truncate">
            {sauce.name}
          </h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className="text-base font-bold text-amber-700 tabular-nums">
            {Math.round(result.score * 100)}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider">match</div>
        </div>
      </div>

      {sauce.description && (
        <p className="text-slate-600 text-xs mb-2 line-clamp-2">{sauce.description}</p>
      )}

      {/* Tag chips */}
      {result.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {result.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Reasoning */}
      {result.reasoning.length > 0 && (
        <div className="bg-slate-50 rounded p-2 mb-2 border border-slate-100">
          <ul className="text-[11px] text-slate-700 space-y-0.5">
            {result.reasoning.slice(0, 4).map((r, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-emerald-600">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Score breakdown */}
      <div className="bg-slate-50/60 rounded p-2 mb-2 border border-slate-100/60">
        <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
          Score Breakdown
        </div>
        <div className="space-y-1">
          <ScoreBar label="Cuisine" value={result.breakdown.cuisineAuthenticity} />
          <ScoreBar label="Dish pairing" value={result.breakdown.dishPairing} />
          <ScoreBar label="Region" value={result.breakdown.regionalMatch} />
          <ScoreBar label="Dietary" value={result.breakdown.dietaryFit} />
          <ScoreBar label="Seasonal" value={result.breakdown.seasonalResonance} />
          <ScoreBar label="Astrological" value={result.breakdown.astrologicalHarmony} />
          <ScoreBar label="Elemental" value={result.breakdown.elementalCompatibility} />
          <ScoreBar label="Flavor" value={result.breakdown.flavorMatch} />
        </div>
      </div>

      {/* Key ingredients */}
      {sauce.keyIngredients && sauce.keyIngredients.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {sauce.keyIngredients.slice(0, 5).map((ing) => (
            <span
              key={ing}
              className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
            >
              {ing}
            </span>
          ))}
        </div>
      )}

      {/* Astrological influences */}
      {sauce.astrologicalInfluences && sauce.astrologicalInfluences.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {sauce.astrologicalInfluences.slice(0, 4).map((a) => (
            <span
              key={a}
              className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200/40 px-1.5 py-0.5 rounded lowercase"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Quick metadata */}
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-2">
        {sauce.difficulty && <span>● {sauce.difficulty}</span>}
        {sauce.prepTime && <span>● Prep: {sauce.prepTime}</span>}
        {sauce.cookTime && <span>● Cook: {sauce.cookTime}</span>}
        {sauce.seasonality && <span>● {sauce.seasonality}</span>}
      </div>

      {/* Nutrition */}
      {sauce.nutritionalProfile && (
        <div className="flex gap-3 text-[10px] text-slate-500 mb-2 bg-slate-50 rounded px-2 py-1">
          <span className="font-medium">{sauce.nutritionalProfile.calories} cal</span>
          <span>{sauce.nutritionalProfile.protein}g P</span>
          <span>{sauce.nutritionalProfile.fat}g F</span>
          <span>{sauce.nutritionalProfile.carbs}g C</span>
          {sauce.nutritionalProfile.servingSize && (
            <span className="ml-auto text-slate-400">per {sauce.nutritionalProfile.servingSize}</span>
          )}
        </div>
      )}

      <div className="mt-auto">
        {/* Batch scaling */}
        {(sauce.ingredients ?? dataSauce?.ingredients) && (
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1.5">
            <span className="font-medium text-[10px]">Scale:</span>
            {[1, 2, 3].map((m) => (
              <button
                key={m}
                onClick={() => setScaleMultiplier(m)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${scaleMultiplier === m
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {m}x
              </button>
            ))}
            {(sauce.yield ?? dataSauce?.yield) && (
              <span className="text-slate-400 text-[10px] ml-1">
                ~{Math.round(parseYieldToServings((sauce.yield ?? dataSauce?.yield) as string) * scaleMultiplier)} servings
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[10px] text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
        >
          {expanded ? "Hide details" : "Show details"}
        </button>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
            {scaledIngredients.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-600 mb-1">
                  Ingredients ({scaleMultiplier}x)
                </p>
                <ul className="text-[10px] text-slate-500 space-y-0.5 max-h-40 overflow-y-auto bg-slate-50 rounded p-2">
                  {scaledIngredients.map((ing, i) => (
                    <li key={i}>– {ing}</li>
                  ))}
                </ul>
              </div>
            )}
            {(sauce.preparationSteps ?? dataSauce?.preparationSteps) && (
              <div>
                <p className="text-[10px] font-semibold text-slate-600 mb-1">Preparation</p>
                <ol className="text-[10px] text-slate-500 space-y-0.5 max-h-40 overflow-y-auto list-decimal list-inside">
                  {(sauce.preparationSteps ?? dataSauce?.preparationSteps ?? []).map(
                    (s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ),
                  )}
                </ol>
              </div>
            )}
            {sauce.preparationNotes && (
              <p className="text-[10px] text-slate-500 italic">📝 {sauce.preparationNotes}</p>
            )}
            {sauce.technicalTips && (
              <p className="text-[10px] text-amber-700">💡 {sauce.technicalTips}</p>
            )}
            {sauce.variants && sauce.variants.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-600 mb-1">Variants</p>
                <div className="flex flex-wrap gap-1">
                  {sauce.variants.map((v) => (
                    <span
                      key={v}
                      className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {sauce.storageInstructions && (
              <p className="text-[10px] text-slate-400">📦 {sauce.storageInstructions}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function EnhancedSauceRecommender() {
  const cuisines = useMemo(() => listCuisines(), []);
  const detectedSeason = useCurrentSeason();

  const [cuisineKey, setCuisineKey] = useState<string>(cuisines[0]?.key ?? "Italian");
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [protein, setProtein] = useState<string | undefined>(undefined);
  const [vegetable, setVegetable] = useState<string | undefined>(undefined);
  const [cookingMethod, setCookingMethod] = useState<string | undefined>(undefined);
  const [dietary, setDietary] = useState<string[]>([]);
  const [flavorTargets, setFlavorTargets] = useState<FlavorAxis[]>([]);
  const [role, setRole] = useState<SauceRole>("complement");
  const [season, setSeason] = useState<CuisineSauceContext["season"]>(
    detectedSeason.toLowerCase() as CuisineSauceContext["season"],
  );
  const [cosmicSync, setCosmicSync] = useState(false);
  const [strictCuisine, setStrictCuisine] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const astroState = useAstrologicalState();
  const { isDaytime, planetaryHour, lunarPhase } = useAlchemical();

  const fingerprint = useMemo(() => getCuisineFingerprint(cuisineKey), [cuisineKey]);

  const toggleInArray = useCallback(<T extends string>(value: T, arr: T[], setter: (v: T[]) => void) => {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  }, []);

  const ctx: CuisineSauceContext = useMemo(
    () => ({
      cuisine: cuisineKey,
      region,
      protein,
      vegetable,
      cookingMethod,
      dietary: dietary.length ? dietary : undefined,
      flavorTargets: flavorTargets.length ? flavorTargets : undefined,
      role,
      season,
      cosmic: cosmicSync
        ? {
          zodiac: astroState.currentZodiac as string | undefined,
          planetaryHour: (astroState.currentPlanetaryHour ?? planetaryHour) as string | undefined,
          isDaytime,
          lunarPhase: lunarPhase as string | undefined,
        }
        : undefined,
      cosmicWeight: cosmicSync ? 0.5 : 0,
    }),
    [
      cuisineKey,
      region,
      protein,
      vegetable,
      cookingMethod,
      dietary,
      flavorTargets,
      role,
      season,
      cosmicSync,
      astroState.currentZodiac,
      astroState.currentPlanetaryHour,
      planetaryHour,
      isDaytime,
      lunarPhase,
    ],
  );

  const results = useMemo(() => {
    const all = recommendForCuisineContext(ctx, {
      strictCuisine,
      maxResults: 30,
      minScore: 0.15,
    });
    if (!searchQuery) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      (r) =>
        r.sauce.name.toLowerCase().includes(q) ||
        (r.sauce.keyIngredients ?? []).some((i) => i.toLowerCase().includes(q)),
    );
  }, [ctx, strictCuisine, searchQuery]);

  const poolSize = useMemo(() => buildCuisineSaucePool(cuisineKey).length, [cuisineKey]);

  const proteinOptions = useMemo(() => {
    const arr = new Set([...(fingerprint?.pairingAxes.proteins ?? []), ...PROTEINS]);
    return Array.from(arr);
  }, [fingerprint]);

  const vegetableOptions = useMemo(() => {
    const arr = new Set([...(fingerprint?.pairingAxes.vegetables ?? []), ...VEGETABLES]);
    return Array.from(arr);
  }, [fingerprint]);

  const cookingMethodOptions = useMemo(() => {
    const arr = new Set([
      ...(fingerprint?.pairingAxes.cookingMethods ?? []),
      ...COOKING_METHODS,
    ]);
    return Array.from(arr);
  }, [fingerprint]);

  const regionOptions = useMemo(() => fingerprint?.regions ?? [], [fingerprint]);

  const reset = useCallback(() => {
    setRegion(undefined);
    setProtein(undefined);
    setVegetable(undefined);
    setCookingMethod(undefined);
    setDietary([]);
    setFlavorTargets([]);
    setRole("complement");
    setSearchQuery("");
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Cuisine-Native Sauce Recommender
            </h2>
            <p className="text-slate-600 mt-1 text-sm max-w-2xl">
              Score sauces across cuisine authenticity, dish pairing, region, dietary fit,
              season, planetary resonance, elemental harmony, and flavor target.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer bg-white/70 rounded-full px-3 py-1.5 border border-slate-200">
              <input
                type="checkbox"
                checked={cosmicSync}
                onChange={(e) => setCosmicSync(e.target.checked)}
                className="accent-purple-600"
              />
              <span className="text-slate-700">✨ Cosmic Sync</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer bg-white/70 rounded-full px-3 py-1.5 border border-slate-200">
              <input
                type="checkbox"
                checked={strictCuisine}
                onChange={(e) => setStrictCuisine(e.target.checked)}
                className="accent-amber-600"
              />
              <span className="text-slate-700">Strict cuisine</span>
            </label>
            <button
              onClick={reset}
              className="bg-white/70 rounded-full px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-white"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Cuisine selector */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            1. Choose Cuisine
          </div>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setCuisineKey(c.key);
                  setRegion(undefined);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${cuisineKey === c.key
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine fingerprint */}
        <CuisineFingerprintPanel cuisineKey={cuisineKey} />

        {/* Region (if available) */}
        {regionOptions.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              2. Region <span className="text-slate-400 lowercase">(optional)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRegion(undefined)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${region === undefined
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                Any region
              </button>
              {regionOptions.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRegion(r.key)}
                  title={r.description}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${region === r.key
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dish builder */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            3. Dish Builder <span className="text-slate-400 lowercase">(any combination)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Protein</div>
              <select
                value={protein ?? ""}
                onChange={(e) => setProtein(e.target.value || undefined)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white"
              >
                <option value="">— Any —</option>
                {proteinOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Vegetable</div>
              <select
                value={vegetable ?? ""}
                onChange={(e) => setVegetable(e.target.value || undefined)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white"
              >
                <option value="">— Any —</option>
                {vegetableOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Cooking Method</div>
              <select
                value={cookingMethod ?? ""}
                onChange={(e) => setCookingMethod(e.target.value || undefined)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white"
              >
                <option value="">— Any —</option>
                {cookingMethodOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dietary chips */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            4. Dietary <span className="text-slate-400 lowercase">(must satisfy all)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map((d) => {
              const active = dietary.includes(d.key);
              return (
                <button
                  key={d.key}
                  onClick={() => toggleInArray(d.key, dietary, setDietary)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${active
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flavor target chips */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            5. Flavor Targets
          </div>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_AXES.map((f) => {
              const active = flavorTargets.includes(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() =>
                    toggleInArray<FlavorAxis>(f.key, flavorTargets, setFlavorTargets)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${active ? "bg-slate-800 text-white border-slate-800" : f.color
                    }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role + season */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              6. Sauce Role
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  title={r.description}
                  onClick={() => setRole(r.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === r.key
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              7. Season
            </div>
            <div className="flex flex-wrap gap-2">
              {SEASON_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSeason(s.key as CuisineSauceContext["season"])}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${season === s.key
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cosmic state readout */}
        {cosmicSync && (
          <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Live Cosmic Moment
              </div>
              <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                live
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-600">
              <div>
                <div className="text-[10px] text-slate-400">Sun sign</div>
                <div className="font-semibold text-slate-800 lowercase">
                  {(astroState.currentZodiac as string) || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Planetary hour</div>
                <div className="font-semibold text-slate-800">
                  {astroState.currentPlanetaryHour || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Phase</div>
                <div className="font-semibold text-slate-800">
                  {astroState.isDaytime ? "☀️ Day" : "🌙 Night"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Lunar</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {astroState.lunarPhase || "—"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter results by sauce name or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Result count + pool size */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            <span className="font-semibold text-slate-700">{results.length}</span>{" "}
            results from a pool of{" "}
            <span className="font-semibold text-slate-700">{poolSize}</span> sauces
          </span>
          {results.length > 0 && (
            <span>
              Top match:{" "}
              <span className="font-semibold text-amber-700">
                {Math.round(results[0].score * 100)}
              </span>
            </span>
          )}
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r, i) => (
            <SauceResultCard key={r.sauce.id} result={r} rank={i + 1} />
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-3xl mb-2">🥄</div>
            <div className="text-sm font-medium text-slate-600">
              No sauces match the current criteria
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Try relaxing dietary filters or unchecking strict cuisine.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export to keep the type accessible if needed elsewhere
export type { UnifiedSauce };
