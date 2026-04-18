"use client";

import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";

// ===== Types =====

interface IngredientData {
  name: string;
  category?: string;
  subCategory?: string;
  subcategory?: string;
  description?: string;
  qualities?: string[];
  origin?: string[] | string;
  elementalProperties?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
  alchemicalProperties?: { Spirit?: number; Essence?: number; Matter?: number; Substance?: number };
  kalchm?: number;
  monica?: number;
  flavorProfile?: Record<string, number>;
  sensoryProfile?: {
    taste?: Record<string, number>;
    aroma?: Record<string, number> | string[];
    texture?: Record<string, number> | string[];
  };
  nutritionalProfile?: {
    serving_size?: string;
    calories?: number;
    macros?: { protein?: number; carbs?: number; fat?: number; fiber?: number };
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
    antioxidants?: Record<string, string>;
    source?: string;
  };
  storage?:
    | string
    | {
        container?: string;
        duration?: string;
        temperature?: string | { fahrenheit: number; celsius: number };
        notes?: string;
      };
  seasonality?: string[] | string;
  season?: string[] | string;
  pairingRecommendations?: {
    complementary?: string[];
    contrasting?: string[];
    toAvoid?: string[];
  };
  astrologicalProfile?: {
    elementalAffinity?: { base?: string; secondary?: string };
    rulingPlanets?: string[];
    zodiacAffinity?: string[];
  };
  recommendedCookingMethods?: Array<string | { name?: string }>;
  quantityBase?: { amount?: number; unit?: string };
}

interface RelatedRecipe {
  id: string;
  name: string;
  cuisine?: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  amount?: number;
  unit?: string;
}

interface Substitution {
  name: string;
  rationale: string;
  type: "complementary" | "direct";
}

interface ApiResponse {
  success: boolean;
  ingredient: IngredientData | null;
  relatedRecipes: RelatedRecipe[];
  substitutions: Substitution[];
  totalRecipeMatches: number;
  error?: string;
}

interface IngredientDrawerProps {
  ingredientName: string | null;
  recipeAmount?: number;
  recipeUnit?: string;
  recipeNotes?: string;
  currentRecipeId?: string;
  onClose: () => void;
}

// ===== Constants =====

const ELEMENT_COLORS: Record<string, { bar: string; text: string }> = {
  Fire: { bar: "bg-red-500", text: "text-red-400" },
  Water: { bar: "bg-blue-500", text: "text-blue-400" },
  Earth: { bar: "bg-amber-600", text: "text-amber-400" },
  Air: { bar: "bg-sky-400", text: "text-sky-400" },
};

const ELEMENT_ICONS: Record<string, string> = {
  Fire: "\u{1F525}",
  Water: "\u{1F4A7}",
  Earth: "\u{1F30D}",
  Air: "\u{1F4A8}",
};

const ESMS_COLORS: Record<string, { color: string; text: string }> = {
  Spirit: { color: "#f59e0b", text: "text-amber-400" },
  Essence: { color: "#6366f1", text: "text-indigo-400" },
  Matter: { color: "#10b981", text: "text-emerald-400" },
  Substance: { color: "#a855f7", text: "text-purple-400" },
};

// ===== Helpers =====

function formatMinutes(m?: number): string {
  if (!m) return "";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return mins > 0 ? `${h}h ${mins}m` : `${h}h`;
}

function normalizeSeasons(seasons?: string[] | string): string[] {
  if (!seasons) return [];
  return Array.isArray(seasons) ? seasons : [seasons];
}

function normalizeOrigin(origin?: string[] | string): string[] {
  if (!origin) return [];
  return Array.isArray(origin) ? origin : [origin];
}

function normalizeMethods(methods?: Array<string | { name?: string }>): string[] {
  if (!methods) return [];
  return methods
    .map((m) => (typeof m === "string" ? m : m?.name || ""))
    .filter(Boolean);
}

function storageToText(storage: IngredientData["storage"]): string | null {
  if (!storage) return null;
  if (typeof storage === "string") return storage;
  const parts: string[] = [];
  if (storage.container) parts.push(storage.container);
  if (storage.duration) parts.push(`for ${storage.duration}`);
  if (storage.temperature) {
    const t = storage.temperature;
    if (typeof t === "string") parts.push(`at ${t}`);
    else parts.push(`at ${t.fahrenheit}\u00B0F / ${t.celsius}\u00B0C`);
  }
  if (storage.notes) parts.push(`— ${storage.notes}`);
  return parts.join(" ");
}

// ===== Small UI primitives =====

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-4 border-b border-white/5 last:border-b-0">
      <h3 className="text-[11px] uppercase tracking-[0.14em] text-white/50 font-semibold mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Bar({
  label,
  value,
  max = 1,
  barClass,
  labelClass = "text-white/60",
  showPct = true,
  icon,
}: {
  label: string;
  value: number;
  max?: number;
  barClass: string;
  labelClass?: string;
  showPct?: boolean;
  icon?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="w-5 text-center text-base leading-none">{icon}</span>}
      <span className={`w-16 text-xs font-medium capitalize ${labelClass}`}>{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showPct && (
        <span className="w-10 text-right text-xs text-white/50 tabular-nums">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

function Chip({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "good" | "warn" | "bad" | "info";
}) {
  const tones: Record<string, string> = {
    default: "bg-white/5 border-white/10 text-white/70",
    good: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    warn: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    bad: "bg-red-500/10 border-red-500/30 text-red-300",
    info: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full border text-xs capitalize ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

// ===== Drawer =====

export function IngredientDrawer({
  ingredientName,
  recipeAmount,
  recipeUnit,
  recipeNotes,
  currentRecipeId,
  onClose,
}: IngredientDrawerProps) {
  const open = Boolean(ingredientName);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingredientName) {
      setData(null);
      return;
    }
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/ingredients/${encodeURIComponent(ingredientName)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ApiResponse;
        setData(json);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError("Couldn't load ingredient details");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
    return () => controller.abort();
  }, [ingredientName]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const ingredient = data?.ingredient;
  const relatedRecipes = data?.relatedRecipes ?? [];
  const substitutions = data?.substitutions ?? [];

  const displayName = ingredient?.name ?? ingredientName ?? "";
  const category = ingredient?.category ?? "";
  const subcategory = ingredient?.subCategory ?? ingredient?.subcategory ?? "";

  const elemental = ingredient?.elementalProperties;
  const hasElemental =
    elemental &&
    ((elemental.Fire ?? 0) +
      (elemental.Water ?? 0) +
      (elemental.Earth ?? 0) +
      (elemental.Air ?? 0)) >
      0;

  const alch = ingredient?.alchemicalProperties;
  const hasAlch =
    alch &&
    ((alch.Spirit ?? 0) + (alch.Essence ?? 0) + (alch.Matter ?? 0) + (alch.Substance ?? 0)) >
      0;

  const taste =
    ingredient?.sensoryProfile?.taste ?? ingredient?.flavorProfile;
  const tasteEntries = taste
    ? Object.entries(taste).filter(([, v]) => typeof v === "number" && v > 0)
    : [];

  const nut = ingredient?.nutritionalProfile;
  const seasons = normalizeSeasons(ingredient?.seasonality ?? ingredient?.season);
  const origins = normalizeOrigin(ingredient?.origin);
  const methods = normalizeMethods(ingredient?.recommendedCookingMethods);
  const storageText = storageToText(ingredient?.storage);
  const pairing = ingredient?.pairingRecommendations;
  const rulingPlanets = ingredient?.astrologicalProfile?.rulingPlanets ?? [];
  const zodiacs = ingredient?.astrologicalProfile?.zodiacAffinity ?? [];

  const filteredRelated = currentRecipeId
    ? relatedRecipes.filter((r) => r.id !== currentRecipeId)
    : relatedRecipes;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${displayName} details`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="relative h-full w-full sm:max-w-lg md:max-w-xl bg-[#0a0a12] border-l border-white/10 overflow-y-auto animate-[slideInRight_0.28s_cubic-bezier(0.2,0.9,0.3,1)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0a12]/90 border-b border-white/10">
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 leading-tight truncate">
                {displayName || "Ingredient"}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                {category && (
                  <span className="text-white/60 capitalize">{category}</span>
                )}
                {subcategory && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="text-white/60 capitalize">
                      {subcategory.replace(/_/g, " ")}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* In this recipe banner */}
          {(recipeAmount != null || recipeUnit || recipeNotes) && (
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-semibold">
                  In this recipe
                </span>
                <span className="text-sm text-amber-100">
                  {recipeAmount != null && (
                    <span className="font-semibold">{recipeAmount} </span>
                  )}
                  {recipeUnit && <span>{recipeUnit}</span>}
                  {recipeNotes && (
                    <span className="text-amber-200/70 italic"> ({recipeNotes})</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-sm text-white/40">Loading ingredient…</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* No ingredient data — show related recipes only */}
        {!isLoading && !error && !ingredient && (
          <div className="px-5 py-6 text-sm text-white/50">
            <p>No detailed profile available for this ingredient yet.</p>
            {filteredRelated.length > 0 && (
              <p className="mt-2">
                Found in {filteredRelated.length} other recipe
                {filteredRelated.length === 1 ? "" : "s"} — see below.
              </p>
            )}
          </div>
        )}

        {/* Body */}
        {!isLoading && !error && (
          <div className="pb-6">
            {/* Qualities */}
            {ingredient?.qualities && ingredient.qualities.length > 0 && (
              <Section title="Qualities">
                <div className="flex flex-wrap gap-1.5">
                  {ingredient.qualities.map((q) => (
                    <Chip key={q} label={q} />
                  ))}
                </div>
              </Section>
            )}

            {/* Elemental Signature */}
            {hasElemental && elemental && (
              <Section title="Elemental Signature">
                <div className="space-y-2">
                  {(["Fire", "Water", "Earth", "Air"] as const).map((el) => (
                    <Bar
                      key={el}
                      label={el}
                      value={elemental[el] ?? 0}
                      barClass={ELEMENT_COLORS[el].bar}
                      labelClass={ELEMENT_COLORS[el].text}
                      icon={ELEMENT_ICONS[el]}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Alchemical (ESMS) */}
            {hasAlch && alch && (
              <Section title="Alchemical Properties">
                <div className="grid grid-cols-2 gap-2">
                  {(["Spirit", "Essence", "Matter", "Substance"] as const).map((key) => {
                    const v = alch[key] ?? 0;
                    if (v === 0) return null;
                    const cfg = ESMS_COLORS[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: cfg.color }}
                          />
                          <span className="text-xs text-white/70">{key}</span>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${cfg.text}`}>
                          {v.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {(ingredient?.kalchm != null || ingredient?.monica != null) && (
                  <div className="flex gap-4 mt-3 text-xs text-white/50">
                    {ingredient?.kalchm != null && (
                      <span>
                        K<sub>alchm</sub>:{" "}
                        <span className="text-amber-300 font-semibold tabular-nums">
                          {ingredient.kalchm.toFixed(3)}
                        </span>
                      </span>
                    )}
                    {ingredient?.monica != null && (
                      <span>
                        Monica:{" "}
                        <span className="text-indigo-300 font-semibold tabular-nums">
                          {ingredient.monica.toFixed(3)}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </Section>
            )}

            {/* Flavor / Taste */}
            {tasteEntries.length > 0 && (
              <Section title="Flavor Profile">
                <div className="space-y-2">
                  {tasteEntries.map(([k, v]) => (
                    <Bar
                      key={k}
                      label={k}
                      value={v}
                      max={1}
                      barClass="bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Nutrition */}
            {nut && (nut.calories != null || nut.macros) && (
              <Section title="Nutrition">
                {nut.serving_size && (
                  <p className="text-xs text-white/40 mb-3 italic">
                    Per {nut.serving_size}
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {nut.calories != null && (
                    <NutriStat label="Calories" value={nut.calories} color="text-amber-400" />
                  )}
                  {nut.macros?.protein != null && (
                    <NutriStat
                      label="Protein"
                      value={nut.macros.protein}
                      unit="g"
                      color="text-emerald-400"
                    />
                  )}
                  {nut.macros?.carbs != null && (
                    <NutriStat
                      label="Carbs"
                      value={nut.macros.carbs}
                      unit="g"
                      color="text-blue-400"
                    />
                  )}
                  {nut.macros?.fat != null && (
                    <NutriStat
                      label="Fat"
                      value={nut.macros.fat}
                      unit="g"
                      color="text-orange-400"
                    />
                  )}
                  {nut.macros?.fiber != null && (
                    <NutriStat
                      label="Fiber"
                      value={nut.macros.fiber}
                      unit="g"
                      color="text-green-400"
                    />
                  )}
                </div>

                {nut.vitamins && Object.keys(nut.vitamins).length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">
                      Vitamins
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(nut.vitamins).map(([v, _]) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 bg-emerald-500/10 rounded text-xs text-emerald-300"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {nut.minerals && Object.keys(nut.minerals).length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">
                      Minerals
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(nut.minerals).map(([m, _]) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 bg-sky-500/10 rounded text-xs text-sky-300"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {nut.source && (
                  <p className="text-[10px] text-white/30 mt-3 italic">Source: {nut.source}</p>
                )}
              </Section>
            )}

            {/* Seasonality / Origin */}
            {(seasons.length > 0 || origins.length > 0) && (
              <Section title="Seasonality & Origin">
                {seasons.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">
                      Peak seasons
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {seasons.map((s) => (
                        <Chip key={s} label={s} tone="good" />
                      ))}
                    </div>
                  </div>
                )}
                {origins.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">
                      Origin
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {origins.map((o) => (
                        <Chip key={o} label={o} />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Storage */}
            {storageText && (
              <Section title="Storage">
                <p className="text-sm text-white/70 leading-relaxed">{storageText}</p>
              </Section>
            )}

            {/* Cooking Methods */}
            {methods.length > 0 && (
              <Section title="Recommended Cooking Methods">
                <div className="flex flex-wrap gap-1.5">
                  {methods.map((m) => (
                    <Chip key={m} label={m} tone="info" />
                  ))}
                </div>
              </Section>
            )}

            {/* Astrological */}
            {(rulingPlanets.length > 0 || zodiacs.length > 0) && (
              <Section title="Astrological Affinities">
                {rulingPlanets.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">
                      Ruling planets
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rulingPlanets.map((p) => (
                        <Chip key={p} label={p} tone="info" />
                      ))}
                    </div>
                  </div>
                )}
                {zodiacs.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">
                      Zodiac
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zodiacs.map((z) => (
                        <Chip key={z} label={z} />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Pairings */}
            {pairing && (pairing.complementary?.length || pairing.contrasting?.length || pairing.toAvoid?.length) && (
              <Section title="Pairings">
                {pairing.complementary && pairing.complementary.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400/80 mb-1.5">
                      Complements
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pairing.complementary.map((p) => (
                        <Chip key={p} label={p} tone="good" />
                      ))}
                    </div>
                  </div>
                )}
                {pairing.contrasting && pairing.contrasting.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1.5">
                      Contrasts (bold)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pairing.contrasting.map((p) => (
                        <Chip key={p} label={p} tone="warn" />
                      ))}
                    </div>
                  </div>
                )}
                {pairing.toAvoid && pairing.toAvoid.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-red-400/80 mb-1.5">
                      Avoid
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pairing.toAvoid.map((p) => (
                        <Chip key={p} label={p} tone="bad" />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Substitutions */}
            {substitutions.length > 0 && (
              <Section title="Substitution Ideas">
                <ul className="space-y-2">
                  {substitutions.map((s) => (
                    <li
                      key={s.name}
                      className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-300 font-medium capitalize">{s.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 px-1.5 py-0.5 rounded bg-white/5">
                          {s.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                        {s.rationale}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Related recipes */}
            {filteredRelated.length > 0 && (
              <Section
                title={`More recipes with ${displayName} (${filteredRelated.length})`}
              >
                <ul className="space-y-2">
                  {filteredRelated.slice(0, 8).map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/recipes/${encodeURIComponent(r.id)}`}
                        onClick={onClose}
                        className="block px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-amber-200 truncate">
                              {r.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/40">
                              {r.cuisine && (
                                <span className="capitalize">{r.cuisine}</span>
                              )}
                              {(r.prepTime || r.cookTime) && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {formatMinutes((r.prepTime ?? 0) + (r.cookTime ?? 0))}
                                  </span>
                                </>
                              )}
                              {r.amount != null && r.unit && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {r.amount} {r.unit}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-amber-400/60 group-hover:text-amber-300 text-sm shrink-0">
                            →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {filteredRelated.length > 8 && (
                  <p className="text-xs text-white/40 mt-3 text-center">
                    +{filteredRelated.length - 8} more
                  </p>
                )}
              </Section>
            )}
          </div>
        )}
      </aside>

      {/* eslint-disable react/no-unknown-property */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      {/* eslint-enable react/no-unknown-property */}
    </div>
  );
}

// ===== Sub-components =====

function NutriStat({
  label,
  value,
  unit = "",
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-center">
      <div className={`text-base font-bold ${color} tabular-nums`}>
        {value}
        {unit}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{label}</div>
    </div>
  );
}
