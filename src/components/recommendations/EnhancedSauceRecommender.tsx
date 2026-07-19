"use client";

/**
 * Enhanced Sauce Recommender — Cuisine-Native, Multi-Dimensional Scoring
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useAlchemicalData } from "@/contexts/AlchemicalDataContext";
import { allSauces } from "@/data/sauces";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import { useUserElementalBias } from "@/hooks/useUserElementalBias";
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
// Constants
// ============================================================================

const PROTEINS = ["beef", "pork", "chicken", "fish", "seafood", "tofu", "vegetarian", "vegetables"];
const VEGETABLES = ["leafy", "root", "nightshades", "squash", "mushroom", "seaweed"];
const COOKING_METHODS = ["grilling", "baking", "frying", "deep-frying", "braising", "steaming", "simmering", "raw", "sautéing", "roasting"];

const _DIETARY = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "glutenFree", label: "Gluten-Free" },
  { key: "dairyFree", label: "Dairy-Free" },
  { key: "lowSodium", label: "Low-Sodium" },
];

const _FLAVOR_AXES: Array<{ key: FlavorAxis; label: string; color: string }> = [
  { key: "umami", label: "Umami", color: "bg-rose-500/15 text-rose-700 border-rose-300/40" },
  { key: "spicy", label: "Spicy", color: "bg-orange-500/15 text-orange-700 border-orange-300/40" },
  { key: "sweet", label: "Sweet", color: "bg-amber-500/15 text-amber-700 border-amber-300/40" },
  { key: "sour", label: "Sour", color: "bg-lime-500/15 text-lime-700 border-lime-300/40" },
  { key: "bitter", label: "Bitter", color: "bg-emerald-500/15 text-emerald-700 border-emerald-300/40" },
  { key: "salty", label: "Salty", color: "bg-sky-500/15 text-sky-700 border-sky-300/40" },
];

const _ROLES: Array<{ key: SauceRole; label: string; description: string }> = [
  { key: "complement", label: "Complement", description: "Mirror the cuisine's energy" },
  { key: "contrast", label: "Contrast", description: "Cut through and contrast" },
  { key: "enhance", label: "Enhance", description: "Amplify the dominant note" },
  { key: "balance", label: "Balance", description: "Round out the missing notes" },
];

const _SEASON_OPTIONS = [
  { key: "all", label: "Year-round" },
  { key: "spring", label: "Spring" },
  { key: "summer", label: "Summer" },
  { key: "fall", label: "Fall" },
  { key: "winter", label: "Winter" },
] as const;

// ============================================================================
// Helpers
// ============================================================================

function CuisineFingerprintPanel({ cuisineKey, cuisinesMapData }: { cuisineKey: string, cuisinesMapData?: Record<string, any> }) {
  const fp = useMemo(() => getCuisineFingerprint(cuisineKey, cuisinesMapData), [cuisineKey, cuisinesMapData]);
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
          <h4 className="text-sm font-bold text-slate-800">{fp.name}</h4>
        </div>
        <div className="flex gap-1">
          {Object.entries(fp.elementalProperties).map(([el, val]) => (
            <div key={el} className="flex flex-col items-center">
              <div className="w-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${elementColors[el]}`} style={{ width: `${val * 100}%` }} />
              </div>
              <span className="text-[7px] text-slate-400 uppercase mt-0.5">{el[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {fp.description && <p className="text-[10px] text-slate-600 line-clamp-2">{fp.description}</p>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="text-[8px] uppercase text-slate-400 font-bold mb-1">Techniques</div>
            <div className="flex flex-wrap gap-1">
              {fp.signatureTechniques.slice(0, 3).map(t => (
                <span key={t} className="text-[9px] bg-slate-50 text-slate-600 px-1 rounded">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[8px] uppercase text-slate-400 font-bold mb-1">Resonance</div>
            <div className="flex flex-wrap gap-1">
              {fp.planetaryResonance.slice(0, 2).map(p => (
                <span key={p} className="text-[9px] bg-purple-50 text-purple-600 px-1 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : pct >= 40 ? "bg-orange-400" : "bg-slate-300";
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

function SauceResultCard({ result, rank }: { result: CuisineSauceResult; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const dataSauce = result.sauce.dataKey ? allSauces[result.sauce.dataKey] : undefined;
  const sauce = result.sauce;

  const scaledIngredients = useMemo(() => {
    const ings = sauce.ingredients ?? dataSauce?.ingredients;
    if (!ings) return [];
    return scaleSauceIngredients(ings, scaleMultiplier);
  }, [sauce.ingredients, dataSauce?.ingredients, scaleMultiplier]);

  const servings = useMemo(() => parseYieldToServings(sauce.yield ?? dataSauce?.yield ?? "4 servings"), [sauce.yield, dataSauce?.yield]);

  return (
    <div className={`rounded-xl border transition-all duration-300 ${expanded ? "ring-2 ring-violet-500 border-transparent shadow-lg" : "border-slate-200 hover:border-slate-300 shadow-sm"}`}>
      <div className="p-4 bg-white rounded-t-xl">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded-full text-xs font-bold">{rank}</span>
            <div>
              <h4 className="font-bold text-slate-800">{sauce.name}</h4>
              <div className="flex gap-1 mt-0.5">
                {result.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-violet-600 tabular-nums">{Math.round(result.score * 100)}%</div>
            <div className="text-[8px] uppercase tracking-tighter text-slate-400 font-bold">Match</div>
          </div>
        </div>
        
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{sauce.description || "A traditional sauce pairing for your selection."}</p>
        
        <div className="space-y-1 mb-4">
          <ScoreBar label="Authenticity" value={result.breakdown.cuisineAuthenticity} />
          <ScoreBar label="Pairing" value={result.breakdown.dishPairing} />
          <ScoreBar label="Cosmic Harmony" value={result.breakdown.astrologicalHarmony} />
        </div>

        <button onClick={() => setExpanded(!expanded)} className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors">
          {expanded ? "Hide Details" : "View Recipe & Reasoning"}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-600 mb-1">Reasoning</p>
              <ul className="space-y-1">
                {result.reasoning.map((r, i) => (
                  <li key={i} className="text-[10px] text-slate-500 flex items-start gap-1.5">
                    <span className="text-emerald-500">✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>
            
            {(sauce.ingredients || dataSauce?.ingredients) && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-semibold text-slate-600">Ingredients</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-400">Serves {Math.round(servings * scaleMultiplier)}</span>
                    <div className="flex border border-slate-200 rounded overflow-hidden">
                      <button onClick={() => setScaleMultiplier(m => Math.max(0.5, m - 0.5))} className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-[10px]">-</button>
                      <button onClick={() => setScaleMultiplier(m => m + 0.5)} className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-[10px]">+</button>
                    </div>
                  </div>
                </div>
                <ul className="text-[10px] text-slate-500 grid grid-cols-1 gap-0.5">
                  {scaledIngredients.map((ing, i) => (
                    <li key={i} className="flex justify-between border-b border-slate-50 pb-0.5">
                      <span>{typeof ing === "string" ? ing : (ing as any).name}</span>
                      <span className="font-medium text-slate-700">{typeof ing === "string" ? "" : `${(ing as any).amount} ${(ing as any).unit}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(sauce.preparationSteps || dataSauce?.preparationSteps) && (
              <div>
                <p className="text-[10px] font-semibold text-slate-600 mb-1">Preparation</p>
                <ol className="text-[10px] text-slate-500 space-y-1 list-decimal list-inside">
                  {(sauce.preparationSteps || dataSauce?.preparationSteps || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
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
  const { cuisines: cuisinesMapData, loading: dataLoading } = useAlchemicalData();
  const availableCuisines = useMemo(() => listCuisines(cuisinesMapData || undefined), [cuisinesMapData]);
  const detectedSeason = useCurrentSeason();
  const { isDaytime, planetaryHour, lunarPhase } = useAlchemical();
  const astroState = useAstrologicalState();

  const [cuisineKey, setCuisineKey] = useState<string>("Italian");
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [protein, setProtein] = useState<string | undefined>(undefined);
  const [vegetable, setVegetable] = useState<string | undefined>(undefined);
  const [cookingMethod, setCookingMethod] = useState<string | undefined>(undefined);
  const [dietary, _setDietary] = useState<string[]>([]);
  const [flavorTargets, _setFlavorTargets] = useState<FlavorAxis[]>([]);
  const [role, _setRole] = useState<SauceRole>("complement");
  const [season, _setSeason] = useState<CuisineSauceContext["season"]>(detectedSeason.toLowerCase() as any);
  const [cosmicSync, setCosmicSync] = useState(false);
  const [strictCuisine, setStrictCuisine] = useState(false);
  const [recommendations, setRecommendations] = useState<CuisineSauceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dataLoading && availableCuisines.length > 0 && !availableCuisines.find(c => c.key === cuisineKey)) {
      setCuisineKey(availableCuisines[0].key);
    }
  }, [dataLoading, availableCuisines, cuisineKey]);

  const fingerprint = useMemo(() => getCuisineFingerprint(cuisineKey, cuisinesMapData || undefined), [cuisineKey, cuisinesMapData]);

  // Visitor's elemental bias (chart/table) rides the context so the sauce
  // similarity target is personalized; null keeps scoring bit-identical.
  const { bias: userBias, source: biasSource } = useUserElementalBias();

  const ctx: CuisineSauceContext = useMemo(() => ({
    cuisine: cuisineKey, region, protein, vegetable, cookingMethod,
    dietary: dietary.length ? dietary : undefined,
    flavorTargets: flavorTargets.length ? flavorTargets : undefined,
    role, season,
    cosmic: cosmicSync ? { zodiac: astroState.currentZodiac, planetaryHour, isDaytime, lunarPhase } : undefined,
    cosmicWeight: cosmicSync ? 0.5 : 0,
    userElementals: userBias ?? undefined,
  }), [cuisineKey, region, protein, vegetable, cookingMethod, dietary, flavorTargets, role, season, cosmicSync, astroState.currentZodiac, planetaryHour, isDaytime, lunarPhase, userBias]);

  const handleRecommend = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const results = recommendForCuisineContext(ctx, { strictCuisine, maxResults: 15 }, cuisinesMapData || undefined);
        setRecommendations(results);
      } catch (error) {
        console.error("Recommendation error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [ctx, strictCuisine, cuisinesMapData]);

  const _toggleInArray = useCallback(<T extends string>(value: T, arr: T[], setter: (v: T[]) => void) => {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  }, []);

  if (dataLoading && !availableCuisines.length) {
    return <div className="p-10 text-center text-slate-500">Loading sauce recommender...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Configuration Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded flex items-center justify-center text-[10px]">1</span>
            Base Cuisine
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="sauce-cuisine-key" className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Region/Tradition</label>
              <select id="sauce-cuisine-key" value={cuisineKey} onChange={(e) => { setCuisineKey(e.target.value); setRegion(undefined); }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                {availableCuisines.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
              </select>
            </div>
            {fingerprint && fingerprint.regions.length > 0 && (
              <div>
                <label htmlFor="sauce-region" className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Regional Variant</label>
                <select id="sauce-region" value={region || ""} onChange={(e) => setRegion(e.target.value || undefined)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Full {fingerprint.name} Cuisine</option>
                  {fingerprint.regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
              </div>
            )}
            <CuisineFingerprintPanel cuisineKey={cuisineKey} cuisinesMapData={cuisinesMapData || undefined} />
          </div>
        </section>

        <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded flex items-center justify-center text-[10px]">2</span>
            Dish Composition
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sauce-protein" className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Protein</label>
                <select id="sauce-protein" value={protein || ""} onChange={(e) => setProtein(e.target.value || undefined)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                  <option value="">Select...</option>
                  {PROTEINS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="sauce-vegetable" className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Vegetable</label>
                <select id="sauce-vegetable" value={vegetable || ""} onChange={(e) => setVegetable(e.target.value || undefined)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                  <option value="">Select...</option>
                  {VEGETABLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="sauce-cooking-method" className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Cooking Method</label>
              <select id="sauce-cooking-method" value={cookingMethod || ""} onChange={(e) => setCookingMethod(e.target.value || undefined)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="">Select...</option>
                {COOKING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </section>

        <button onClick={handleRecommend} disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${loading ? "bg-slate-400" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"}`}>
          {loading ? "Alchemizing..." : "Get Sauce Recommendations"}
        </button>
      </div>

      {/* Results Area */}
      <div className="lg:col-span-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Recommended Pairings</h2>
          <div className="flex gap-2">
             {userBias && (
               <span className="text-[10px] px-2 py-1 rounded border border-violet-300 bg-violet-50 text-violet-700 font-semibold">
                 {biasSource === "chart" ? "Tuned to your chart" : "Tuned to your table"}
               </span>
             )}
             <button onClick={() => setStrictCuisine(!strictCuisine)} className={`text-[10px] px-2 py-1 rounded border transition-colors ${strictCuisine ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"}`}>Strict Cuisine</button>
             <button onClick={() => setCosmicSync(!cosmicSync)} className={`text-[10px] px-2 py-1 rounded border transition-colors ${cosmicSync ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-500 border-slate-200"}`}>Cosmic Sync</button>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((r, i) => <SauceResultCard key={r.sauce.id} result={r} rank={i + 1} />)}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-96 flex flex-col items-center justify-center text-center p-8">
            <div className="text-4xl mb-4">🍶</div>
            <h4 className="text-slate-700 font-bold mb-1">No recommendations yet</h4>
            <p className="text-slate-500 text-sm max-w-xs">Adjust your settings and click Recommend to find the perfect sauce alignment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
