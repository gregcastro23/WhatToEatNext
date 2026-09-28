"use client";

/**
 * Enhanced Sauce Recommender — Alchemical Pairing Studio
 *
 * Multi-dimensional culinary harmony engine combining four-element vector matching,
 * tradition-native mother sauce lineage, cosmic timing, and batch scaling.
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useAlchemicalData } from "@/contexts/AlchemicalDataContext";
import { allSauces } from "@/data/sauces";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import { useUserElementalBias } from "@/hooks/useUserElementalBias";
import { _logger } from "@/lib/logger";
import {
  getCuisineFingerprint,
  listCuisines,
  recommendForCuisineContext,
  type CuisineSauceContext,
  type CuisineSauceResult,
  type FlavorAxis,
  type SauceRole,
} from "@/utils/cuisine/cuisineSauceProfiler";
import { scaleSauceIngredients, parseYieldToServings } from "@/utils/sauceScaling";

// ============================================================================
// Constants & Config
// ============================================================================

const PROTEINS = [
  { key: "beef", label: "Beef / Steak" },
  { key: "pork", label: "Pork" },
  { key: "chicken", label: "Poultry / Chicken" },
  { key: "fish", label: "White / Fin Fish" },
  { key: "seafood", label: "Shellfish / Seafood" },
  { key: "tofu", label: "Tofu / Tempeh" },
  { key: "vegetarian", label: "Legumes / Beans" },
  { key: "vegetables", label: "Vegetables / Gourd" },
];

const VEGETABLES = [
  { key: "leafy", label: "Leafy Greens (Spinach, Kale)" },
  { key: "root", label: "Root Vegetables (Carrot, Parsnip)" },
  { key: "nightshades", label: "Nightshades (Tomato, Eggplant, Pepper)" },
  { key: "squash", label: "Squash / Pumpkin" },
  { key: "mushroom", label: "Wild Mushrooms / Fungi" },
  { key: "seaweed", label: "Seaweed / Marine Flora" },
];

const COOKING_METHODS = [
  { key: "grilling", label: "Grilling / Char (Fire)" },
  { key: "roasting", label: "Roasting (Fire + Earth)" },
  { key: "sautéing", label: "Sautéing (Fire + Air)" },
  { key: "braising", label: "Braising (Water + Earth)" },
  { key: "steaming", label: "Steaming (Water + Air)" },
  { key: "frying", label: "Frying / Searing (Fire)" },
  { key: "deep-frying", label: "Deep-Frying (Fire)" },
  { key: "baking", label: "Baking (Earth)" },
  { key: "simmering", label: "Simmering (Water)" },
  { key: "raw", label: "Raw / Cured (Air)" },
];

const DIETARY_OPTIONS = [
  { key: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { key: "vegan", label: "Vegan", icon: "🌿" },
  { key: "glutenFree", label: "Gluten-Free", icon: "🌾" },
  { key: "dairyFree", label: "Dairy-Free", icon: "🥛" },
  { key: "lowSodium", label: "Low-Sodium", icon: "🧂" },
];

const FLAVOR_AXES: Array<{ key: FlavorAxis; label: string; tone: string }> = [
  { key: "umami", label: "Umami", tone: "border-rose-500/40 text-rose-300 bg-rose-500/10" },
  { key: "spicy", label: "Spicy", tone: "border-orange-500/40 text-orange-300 bg-orange-500/10" },
  { key: "sweet", label: "Sweet", tone: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
  { key: "sour", label: "Sour", tone: "border-lime-500/40 text-lime-300 bg-lime-500/10" },
  { key: "bitter", label: "Bitter", tone: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
  { key: "salty", label: "Salty", tone: "border-sky-500/40 text-sky-300 bg-sky-500/10" },
];

const ROLES: Array<{ key: SauceRole; label: string; glyph: string; description: string }> = [
  {
    key: "complement",
    label: "Complement",
    glyph: "☯",
    description: "Mirror & reinforce native elemental energy",
  },
  {
    key: "contrast",
    label: "Contrast",
    glyph: "⚡",
    description: "Cut through rich textures with bright counterpoint",
  },
  {
    key: "enhance",
    label: "Enhance",
    glyph: "🔥",
    description: "Amplify dominant aromatic & savory notes",
  },
  {
    key: "balance",
    label: "Balance",
    glyph: "⚖",
    description: "Introduce the missing elemental pillars",
  },
];

const PRESETS = [
  {
    title: "Florentine Bistecca",
    subtitle: "Italian · Beef · Grilling",
    cuisine: "Italian",
    protein: "beef",
    vegetable: "leafy",
    cookingMethod: "grilling",
    role: "contrast" as SauceRole,
    flavors: ["sour", "umami"] as FlavorAxis[],
  },
  {
    title: "Cantonese Steamed Fish",
    subtitle: "Chinese · Fish · Steaming",
    cuisine: "Chinese",
    protein: "fish",
    vegetable: "mushroom",
    cookingMethod: "steaming",
    role: "complement" as SauceRole,
    flavors: ["umami", "salty"] as FlavorAxis[],
  },
  {
    title: "Oaxacan Braised Carnitas",
    subtitle: "Mexican · Pork · Braising",
    cuisine: "Mexican",
    protein: "pork",
    vegetable: "nightshades",
    cookingMethod: "braising",
    role: "enhance" as SauceRole,
    flavors: ["spicy", "umami"] as FlavorAxis[],
  },
  {
    title: "Kyoto Forest Harvest",
    subtitle: "Japanese · Tofu · Roasting",
    cuisine: "Japanese",
    protein: "tofu",
    vegetable: "squash",
    cookingMethod: "roasting",
    role: "balance" as SauceRole,
    flavors: ["sweet", "umami"] as FlavorAxis[],
  },
];

// ============================================================================
// Subcomponents
// ============================================================================

function CuisineFingerprintPanel({
  cuisineKey,
  cuisinesMapData,
}: {
  cuisineKey: string;
  cuisinesMapData?: Record<string, unknown> | undefined;
}) {
  const fp = useMemo(
    () => getCuisineFingerprint(cuisineKey, cuisinesMapData),
    [cuisineKey, cuisinesMapData],
  );
  if (!fp) return null;

  const elementBars = [
    { name: "Fire", val: fp.elementalProperties.Fire, color: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" },
    { name: "Water", val: fp.elementalProperties.Water, color: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]" },
    { name: "Earth", val: fp.elementalProperties.Earth, color: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" },
    { name: "Air", val: fp.elementalProperties.Air, color: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.4)]" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase">
            Cuisine Telemetry
          </span>
          <h4 className="text-sm font-serif font-semibold text-white tracking-wide">
            {fp.name} Tradition
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {elementBars.map((el) => (
            <div key={el.name} className="flex flex-col items-center">
              <div className="w-5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${el.color}`}
                  style={{ width: `${Math.round(el.val * 100)}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-white/50 uppercase mt-0.5">
                {el.name[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {fp.description && (
        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
          {fp.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        {fp.signatureTechniques.length > 0 && (
          <div>
            <div className="text-[9px] font-mono uppercase text-white/40 mb-1 tracking-wider">
              Signature Methods
            </div>
            <div className="flex flex-wrap gap-1">
              {fp.signatureTechniques.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {fp.planetaryResonance.length > 0 && (
          <div>
            <div className="text-[9px] font-mono uppercase text-violet-300/60 mb-1 tracking-wider">
              Planetary Rulers
            </div>
            <div className="flex flex-wrap gap-1">
              {fp.planetaryResonance.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-200"
                >
                  ✦ {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TelemetryBar({
  label,
  value,
  tone = "violet",
}: {
  label: string;
  value: number;
  tone?: "violet" | "amber" | "emerald" | "sky";
}) {
  const pct = Math.round(value * 100);
  const colorMap = {
    violet: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    sky: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]",
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-white/50 truncate font-mono text-[10px] uppercase">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[tone]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-[11px] text-white/70 tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

function SauceResultCard({
  result,
  rank,
  onInspectLineage,
}: {
  result: CuisineSauceResult;
  rank: number;
  onInspectLineage?: ((id: string) => void) | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const dataSauce = result.sauce.dataKey ? allSauces[result.sauce.dataKey] : undefined;
  const { sauce } = result;

  const scaledIngredients = useMemo(() => {
    const ings = sauce.ingredients ?? dataSauce?.ingredients;
    if (!ings) return [];
    return scaleSauceIngredients(ings, scaleMultiplier);
  }, [sauce.ingredients, dataSauce?.ingredients, scaleMultiplier]);

  const servings = useMemo(
    () => parseYieldToServings(sauce.yield ?? dataSauce?.yield ?? "4 servings"),
    [sauce.yield, dataSauce?.yield],
  );

  const matchPct = Math.round(result.score * 100);

  const originBadge = useMemo(() => {
    switch (sauce.origin) {
      case "mother":
        return { label: "Mother Sauce", tone: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "traditional":
        return { label: "Traditional", tone: "bg-violet-500/20 text-violet-300 border-violet-500/40" };
      default:
        return { label: "Catalog", tone: "bg-white/10 text-white/70 border-white/15" };
    }
  }, [sauce.origin]);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl overflow-hidden ${
        expanded
          ? "border-violet-500/60 bg-[#120f20] shadow-[0_0_35px_rgba(139,92,246,0.2)] ring-1 ring-violet-500/40"
          : "border-white/10 bg-[#0e0c16]/85 hover:border-white/20 hover:bg-[#120f1e] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
      }`}
    >
      <div className="p-5 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-mono font-bold shrink-0 ${
                rank === 1
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  : rank === 2
                  ? "bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-[0_0_12px_rgba(167,139,250,0.4)]"
                  : "bg-white/10 text-white/80 border border-white/10"
              }`}
            >
              #{rank}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${originBadge.tone}`}
                >
                  {originBadge.label}
                </span>
                {sauce.ownerCuisine && (
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60">
                    {sauce.ownerCuisine}
                  </span>
                )}
                {sauce.base && (
                  <span className="text-[9px] font-mono text-white/40">
                    · {sauce.base} base
                  </span>
                )}
              </div>
              <h4 className="text-xl font-serif font-medium text-white tracking-wide">
                {sauce.name}
              </h4>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-mono font-bold tracking-tight bg-gradient-to-r from-violet-300 via-white to-amber-300 bg-clip-text text-transparent">
              {matchPct}%
            </div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-violet-300/70">
              Harmonic Match
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
          {sauce.description ?? "An authentic alchemical sauce formulation tuned for this composition."}
        </p>

        {/* Telemetry Breakdown */}
        <div className="space-y-1.5 rounded-xl border border-white/5 bg-black/25 p-3">
          <TelemetryBar
            label="Authenticity"
            value={result.breakdown.cuisineAuthenticity}
            tone="violet"
          />
          <TelemetryBar
            label="Dish Pairing"
            value={result.breakdown.dishPairing}
            tone="amber"
          />
          <TelemetryBar
            label="Cosmic Harmony"
            value={result.breakdown.astrologicalHarmony}
            tone="sky"
          />
          {result.breakdown.elementalCompatibility !== undefined && (
            <TelemetryBar
              label="Elemental Fit"
              value={result.breakdown.elementalCompatibility}
              tone="emerald"
            />
          )}
        </div>

        {/* Tags */}
        {result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-white/60"
              >
                ✦ {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action button bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono tracking-wider uppercase text-white/80 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <span>{expanded ? "Hide Recipe & Notes" : "View Recipe & Scaler"}</span>
            <span className="text-[10px] text-violet-400">{expanded ? "▲" : "▼"}</span>
          </button>

          {onInspectLineage && (
            <button
              onClick={() => onInspectLineage(sauce.id)}
              className="py-2 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-xs font-mono tracking-wider uppercase text-violet-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
              title="Inspect family tree & ancestor sauces"
            >
              <span>Phylogeny</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Expanded recipe & dosage drawer */}
        {expanded && (
          <div className="pt-4 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Reasoning */}
            {result.reasoning.length > 0 && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-violet-300 mb-2">
                  Alchemical Reasoning
                </p>
                <ul className="space-y-1.5">
                  {result.reasoning.map((r, i) => (
                    <li
                      key={i}
                      className="text-xs text-white/70 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-emerald-400 mt-0.5">✦</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ingredients & Scaler */}
            {(sauce.ingredients ?? dataSauce?.ingredients) && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                      Recipe Dosage
                    </span>
                    <h5 className="text-xs font-medium text-white">
                      Ingredients & Proportions
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-violet-300">
                      Serves {Math.round(servings * scaleMultiplier)}
                    </span>
                    <div className="flex items-center border border-white/15 rounded-lg bg-black/40 overflow-hidden">
                      <button
                        onClick={() => setScaleMultiplier((m) => Math.max(0.5, m - 0.5))}
                        className="px-2 py-0.5 hover:bg-white/10 text-xs text-white/80 transition-colors"
                        title="Reduce batch"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-[11px] font-mono text-white/90 border-x border-white/10">
                        {scaleMultiplier}x
                      </span>
                      <button
                        onClick={() => setScaleMultiplier((m) => m + 0.5)}
                        className="px-2 py-0.5 hover:bg-white/10 text-xs text-white/80 transition-colors"
                        title="Increase batch"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <ul className="text-xs space-y-1.5 divide-y divide-white/5">
                  {scaledIngredients.map((ing, i) => {
                    const ingObj =
                      typeof ing === "object" && ing !== null
                        ? (ing as { name?: string; amount?: number | string; unit?: string })
                        : null;
                    return (
                      <li key={i} className="flex justify-between items-center pt-1.5 first:pt-0">
                        <span className="text-white/80">
                          {typeof ing === "string" ? ing : ingObj?.name}
                        </span>
                        <span className="font-mono text-violet-300 text-xs">
                          {typeof ing === "string" ? "" : `${ingObj?.amount ?? ""} ${ingObj?.unit ?? ""}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Preparation Steps */}
            {(sauce.preparationSteps ?? dataSauce?.preparationSteps) && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                  Execution Method
                </p>
                <ol className="space-y-2">
                  {(sauce.preparationSteps ?? dataSauce?.preparationSteps ?? []).map(
                    (step: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-white/70 flex items-start gap-2.5 leading-relaxed bg-white/[0.02] border border-white/5 rounded-lg p-2.5"
                      >
                        <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ),
                  )}
                </ol>
              </div>
            )}

            {/* Technical Tips */}
            {(sauce.technicalTips ?? dataSauce?.technicalTips) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block mb-1">
                  💡 Chef&apos;s Alchemical Tip
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  {sauce.technicalTips ?? dataSauce?.technicalTips}
                </p>
              </div>
            )}

            {/* Nutrition preview if available */}
            {sauce.nutritionalProfile && (
              <div className="flex items-center gap-3 text-[10px] font-mono text-white/50 pt-1">
                <span>{sauce.nutritionalProfile.calories} cal</span>
                <span>·</span>
                <span>{sauce.nutritionalProfile.protein}g protein</span>
                <span>·</span>
                <span>{sauce.nutritionalProfile.fat}g fat</span>
                <span>·</span>
                <span>{sauce.nutritionalProfile.carbs}g carbs</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Recommender Component
// ============================================================================

export interface EnhancedSauceRecommenderProps {
  initialCuisine?: string;
  onInspectLineage?: (sauceId: string) => void;
  className?: string;
}

export default function EnhancedSauceRecommender({
  initialCuisine,
  onInspectLineage,
  className = "",
}: EnhancedSauceRecommenderProps) {
  const { cuisines: cuisinesMapData, loading: dataLoading } = useAlchemicalData();
  const availableCuisines = useMemo(
    () => listCuisines(cuisinesMapData ?? undefined),
    [cuisinesMapData],
  );
  const detectedSeason = useCurrentSeason();
  const { isDaytime, planetaryHour, lunarPhase } = useAlchemical();
  const astroState = useAstrologicalState();

  const [cuisineKey, setCuisineKey] = useState<string>(initialCuisine ?? "Italian");
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [protein, setProtein] = useState<string | undefined>(undefined);
  const [vegetable, setVegetable] = useState<string | undefined>(undefined);
  const [cookingMethod, setCookingMethod] = useState<string | undefined>(undefined);
  const [dietary, setDietary] = useState<string[]>([]);
  const [flavorTargets, setFlavorTargets] = useState<FlavorAxis[]>([]);
  const [role, setRole] = useState<SauceRole>("complement");
  const [season, _setSeason] = useState<CuisineSauceContext["season"]>(
    detectedSeason.toLowerCase() as CuisineSauceContext["season"],
  );
  const [cosmicSync, setCosmicSync] = useState(true);
  const [strictCuisine, setStrictCuisine] = useState(false);
  const [applyUserBias, setApplyUserBias] = useState(true);
  const [recommendations, setRecommendations] = useState<CuisineSauceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCuisine) {
      setCuisineKey(initialCuisine);
    }
  }, [initialCuisine]);

  useEffect(() => {
    if (
      !dataLoading &&
      availableCuisines.length > 0 &&
      !availableCuisines.find((c) => c.key === cuisineKey)
    ) {
      const [firstCuisine] = availableCuisines;
      if (firstCuisine) setCuisineKey(firstCuisine.key);
    }
  }, [dataLoading, availableCuisines, cuisineKey]);

  const fingerprint = useMemo(
    () => getCuisineFingerprint(cuisineKey, cuisinesMapData ?? undefined),
    [cuisineKey, cuisinesMapData],
  );

  const { bias: userBias, source: biasSource } = useUserElementalBias();

  const ctx: CuisineSauceContext = useMemo(
    () => ({
      cuisine: cuisineKey,
      ...(region ? { region } : {}),
      ...(protein ? { protein } : {}),
      ...(vegetable ? { vegetable } : {}),
      ...(cookingMethod ? { cookingMethod } : {}),
      ...(dietary.length ? { dietary } : {}),
      ...(flavorTargets.length ? { flavorTargets } : {}),
      role,
      ...(season ? { season } : {}),
      ...(cosmicSync
        ? {
            cosmic: {
              ...(astroState.currentZodiac ? { zodiac: astroState.currentZodiac } : {}),
              ...(planetaryHour ? { planetaryHour } : {}),
              isDaytime,
              ...(lunarPhase ? { lunarPhase } : {}),
            },
            cosmicWeight: 0.5,
          }
        : {}),
      ...(applyUserBias && userBias ? { userElementals: userBias } : {}),
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
      planetaryHour,
      isDaytime,
      lunarPhase,
      applyUserBias,
      userBias,
    ],
  );

  const handleRecommend = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const results = recommendForCuisineContext(
          ctx,
          { strictCuisine, maxResults: 12 },
          cuisinesMapData ?? undefined,
        );
        setRecommendations(results);
      } catch (error) {
        _logger.error("Recommendation error:", error);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [ctx, strictCuisine, cuisinesMapData]);

  // Run initial recommendations on first load once cuisines are ready
  useEffect(() => {
    if (!dataLoading && availableCuisines.length > 0 && recommendations.length === 0) {
      handleRecommend();
    }
  }, [dataLoading, availableCuisines, recommendations.length, handleRecommend]);

  const toggleDietary = useCallback((key: string) => {
    setDietary((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
  }, []);

  const toggleFlavor = useCallback((key: FlavorAxis) => {
    setFlavorTargets((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }, []);

  const applyPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      setCuisineKey(preset.cuisine);
      setRegion(undefined);
      setProtein(preset.protein);
      setVegetable(preset.vegetable);
      setCookingMethod(preset.cookingMethod);
      setRole(preset.role);
      setFlavorTargets(preset.flavors);

      // Trigger recommend after state update
      setLoading(true);
      setTimeout(() => {
        try {
          const results = recommendForCuisineContext(
            {
              cuisine: preset.cuisine,
              protein: preset.protein,
              vegetable: preset.vegetable,
              cookingMethod: preset.cookingMethod,
              role: preset.role,
              flavorTargets: preset.flavors,
              ...(cosmicSync
                ? {
                    cosmic: {
                      ...(astroState.currentZodiac ? { zodiac: astroState.currentZodiac } : {}),
                      ...(planetaryHour ? { planetaryHour } : {}),
                      isDaytime,
                      ...(lunarPhase ? { lunarPhase } : {}),
                    },
                    cosmicWeight: 0.5,
                  }
                : {}),
              ...(applyUserBias && userBias ? { userElementals: userBias } : {}),
            },
            { strictCuisine, maxResults: 12 },
            cuisinesMapData ?? undefined,
          );
          setRecommendations(results);
        } catch (err) {
          _logger.error("Preset recommend failed:", err);
        } finally {
          setLoading(false);
        }
      }, 200);
    },
    [cosmicSync, astroState.currentZodiac, planetaryHour, isDaytime, lunarPhase, applyUserBias, userBias, strictCuisine, cuisinesMapData],
  );

  if (dataLoading && !availableCuisines.length) {
    return (
      <div className="p-12 text-center text-white/50 font-mono text-sm animate-pulse">
        Initializing Alchemical Sauce Matrices...
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-8 ${className}`}>
      {/* Preset inspirations bar */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300">
            ✦ Quick Alchemical Presets
          </span>
          <span className="text-[10px] text-white/40 hidden sm:inline">
            Click to load & alchemize instantly
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.title}
              onClick={() => applyPreset(p)}
              className="text-left p-3 rounded-xl border border-white/5 bg-white/[0.03] hover:border-violet-500/40 hover:bg-violet-950/20 transition-all group"
            >
              <div className="text-xs font-serif font-medium text-white group-hover:text-violet-200">
                {p.title}
              </div>
              <div className="text-[10px] font-mono text-white/50 truncate mt-0.5">
                {p.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0e0c16]/90 p-5 md:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-6">
            {/* Step 1: Base Cuisine */}
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  Culinary Tradition
                </h3>
                <span className="text-[10px] font-mono text-violet-300/60">
                  {availableCuisines.length} Traditions
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="sauce-cuisine-key"
                    className="text-[10px] font-mono uppercase text-white/50 mb-1 block"
                  >
                    Cuisine Culture
                  </label>
                  <select
                    id="sauce-cuisine-key"
                    value={cuisineKey}
                    onChange={(e) => {
                      setCuisineKey(e.target.value);
                      setRegion(undefined);
                    }}
                    className="w-full bg-[#15121f] text-white border border-white/15 rounded-xl px-3 py-2 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-colors"
                  >
                    {availableCuisines.map((c) => (
                      <option key={c.key} value={c.key} className="bg-[#15121f] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {fingerprint && fingerprint.regions.length > 0 && (
                  <div>
                    <label
                      htmlFor="sauce-region"
                      className="text-[10px] font-mono uppercase text-white/50 mb-1 block"
                    >
                      Regional Dialect
                    </label>
                    <select
                      id="sauce-region"
                      value={region ?? ""}
                      onChange={(e) => setRegion(e.target.value || undefined)}
                      className="w-full bg-[#15121f] text-white border border-white/15 rounded-xl px-3 py-2 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-colors"
                    >
                      <option value="" className="bg-[#15121f] text-white">
                        Pan-{fingerprint.name} Tradition
                      </option>
                      {fingerprint.regions.map((r) => (
                        <option key={r.key} value={r.key} className="bg-[#15121f] text-white">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <CuisineFingerprintPanel
                  cuisineKey={cuisineKey}
                  cuisinesMapData={cuisinesMapData ?? undefined}
                />
              </div>
            </section>

            {/* Step 2: Dish Composition */}
            <section className="space-y-3 pt-2 border-t border-white/5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                Dish Composition
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="sauce-protein"
                      className="text-[10px] font-mono uppercase text-white/50 mb-1 block"
                    >
                      Protein Core
                    </label>
                    <select
                      id="sauce-protein"
                      value={protein ?? ""}
                      onChange={(e) => setProtein(e.target.value || undefined)}
                      className="w-full bg-[#15121f] text-white border border-white/15 rounded-xl px-2.5 py-2 text-xs focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-colors"
                    >
                      <option value="">Any / Universal</option>
                      {PROTEINS.map((p) => (
                        <option key={p.key} value={p.key} className="bg-[#15121f] text-white">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="sauce-vegetable"
                      className="text-[10px] font-mono uppercase text-white/50 mb-1 block"
                    >
                      Produce / Botanical
                    </label>
                    <select
                      id="sauce-vegetable"
                      value={vegetable ?? ""}
                      onChange={(e) => setVegetable(e.target.value || undefined)}
                      className="w-full bg-[#15121f] text-white border border-white/15 rounded-xl px-2.5 py-2 text-xs focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-colors"
                    >
                      <option value="">Any / Botanical</option>
                      {VEGETABLES.map((v) => (
                        <option key={v.key} value={v.key} className="bg-[#15121f] text-white">
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sauce-cooking-method"
                    className="text-[10px] font-mono uppercase text-white/50 mb-1 block"
                  >
                    Culinary Method
                  </label>
                  <select
                    id="sauce-cooking-method"
                    value={cookingMethod ?? ""}
                    onChange={(e) => setCookingMethod(e.target.value || undefined)}
                    className="w-full bg-[#15121f] text-white border border-white/15 rounded-xl px-3 py-2 text-xs focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-colors"
                  >
                    <option value="">Any Technique</option>
                    {COOKING_METHODS.map((m) => (
                      <option key={m.key} value={m.key} className="bg-[#15121f] text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Step 3: Alchemical Intention (Role & Flavor) */}
            <section className="space-y-3 pt-2 border-t border-white/5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                Alchemical Intention
              </h3>

              {/* Roles */}
              <div>
                <div className="text-[10px] font-mono uppercase text-white/50 mb-1.5 block">
                  Harmonic Role
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const isSelected = role === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setRole(r.key)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-violet-600/25 border-violet-400/70 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-400/40"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-medium text-xs text-white mb-0.5">
                          <span>{r.glyph}</span>
                          <span>{r.label}</span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-tight">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Flavor Notes */}
              <div>
                <div className="text-[10px] font-mono uppercase text-white/50 mb-1.5 block">
                  Target Flavor Accents
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FLAVOR_AXES.map((f) => {
                    const active = flavorTargets.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => toggleFlavor(f.key)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all border ${
                          active
                            ? `${f.tone} shadow-[0_0_10px_rgba(255,255,255,0.15)] ring-1 ring-white/20`
                            : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary filters */}
              <div>
                <div className="text-[10px] font-mono uppercase text-white/50 mb-1.5 block">
                  Dietary Boundaries
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((d) => {
                    const active = dietary.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDietary(d.key)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all border flex items-center gap-1.5 ${
                          active
                            ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                            : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <span>{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Step 4: Cosmic & Chart Synchronization */}
            <section className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
                    4
                  </span>
                  Cosmic Synchrony
                </h3>
                <span className="text-[10px] font-mono text-purple-300/80">
                  {astroState.currentZodiac ? `☉ ${astroState.currentZodiac}` : ""}
                  {planetaryHour ? ` · ♃ ${planetaryHour}` : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCosmicSync(!cosmicSync)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    cosmicSync
                      ? "bg-purple-950/40 border-purple-500/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-mono font-medium flex items-center justify-between">
                    <span>Cosmic Sync</span>
                    <span>{cosmicSync ? "ON" : "OFF"}</span>
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {detectedSeason} · {isDaytime ? "Daytime" : "Night"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStrictCuisine(!strictCuisine)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    strictCuisine
                      ? "bg-amber-950/40 border-amber-500/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-mono font-medium flex items-center justify-between">
                    <span>Tradition Gate</span>
                    <span>{strictCuisine ? "STRICT" : "GLOBAL"}</span>
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {strictCuisine ? "Cuisine native only" : "Cross-cultural bridges"}
                  </div>
                </button>
              </div>

              {userBias && (
                <button
                  type="button"
                  onClick={() => setApplyUserBias(!applyUserBias)}
                  className={`w-full p-2 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                    applyUserBias
                      ? "bg-violet-950/40 border-violet-500/40 text-violet-200"
                      : "bg-white/[0.02] border-white/10 text-white/50"
                  }`}
                >
                  <span>
                    ✦ Personal {biasSource === "chart" ? "Natal Chart" : "Commensal Table"} Alignment
                  </span>
                  <span className="text-[10px] uppercase font-bold text-violet-300">
                    {applyUserBias ? "ACTIVE" : "BYPASSED"}
                  </span>
                </button>
              )}
            </section>

            {/* Alchemize Action Button */}
            <button
              onClick={handleRecommend}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-mono text-xs font-bold tracking-widest uppercase text-white shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all active:scale-[0.98] ${
                loading
                  ? "bg-violet-900/50 cursor-wait"
                  : "bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 hover:shadow-[0_0_35px_rgba(139,92,246,0.5)]"
              }`}
            >
              {loading ? "Transmuting & Aligning..." : "Alchemize Sauce Pairings →"}
            </button>
          </div>
        </div>

        {/* Right Column: Recommendations Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 block mb-0.5">
                Alchemical Matrix
              </span>
              <h2 className="text-2xl font-serif font-medium text-white tracking-wide">
                Harmonized Sauce Pairings
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/70">
                {recommendations.length} formulated
              </span>
            </div>
          </div>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {recommendations.map((r, i) => (
                <SauceResultCard
                  key={r.sauce.id}
                  result={r}
                  rank={i + 1}
                  onInspectLineage={onInspectLineage}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-white/10 bg-[#0e0c16]/50 p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                🍶
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-serif font-semibold text-white">
                  Awaiting Alchemical Crucible
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Select your culinary canvas and intention on the left, or pick one of the quick presets above to compute personalized finishes.
                </p>
              </div>
              <button
                onClick={handleRecommend}
                className="py-2.5 px-5 rounded-xl border border-violet-400/40 bg-violet-600/20 text-violet-200 hover:bg-violet-600/30 text-xs font-mono uppercase tracking-wider transition-all"
              >
                Compute Pairings Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
