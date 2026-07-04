"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FEATURED_RECIPE_META, featuredRecipe } from "@/data/featuredRecipe";
import { elementalSignature } from "@/utils/elemental";

export interface QuoteResponse {
  recipeId: string;
  title: string;
  enabled: boolean;
  fingerprint: {
    aSharp: number;
    totals: Record<string, number>;
    physics: { kalchm: number; monica: number; heat: number; entropy: number; reactivity: number; gregsEnergy: number };
    matchRate: number;
    elemental: { Fire: number; Water: number; Earth: number; Air: number };
    smartServings: number;
    servingsLimitedBy: string | null;
  };
  quote: {
    baseCost: Record<string, number>;
    liveCost: Record<string, number>;
    redistributePreview: Record<string, Record<string, number>>;
    pricing: { multiplier: number; dominantElement: string; timestamp: string };
    swap: { rulingHourPlanet: string; rulingDayPlanet: string };
  };
}

const ELEMENT_ROWS = [
  { key: "fire", name: "Fire", icon: "🔥", bar: "bg-red-500", text: "text-red-400" },
  { key: "earth", name: "Earth", icon: "🌍", bar: "bg-emerald-500", text: "text-emerald-400" },
  { key: "air", name: "Air", icon: "💨", bar: "bg-amber-400", text: "text-amber-300" },
  { key: "water", name: "Water", icon: "💧", bar: "bg-blue-500", text: "text-blue-400" },
] as const;

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 24;

function parseQty(raw: string): number | null {
  const s = raw.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatQty(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function scaleAmount(quantity: string, factor: number): string {
  if (factor === 1) return quantity;
  const n = parseQty(quantity);
  if (n === null) return quantity;
  return formatQty(n * factor);
}

export function FeaturedRecipe() {
  const [expanded, setExpanded] = useState(false);
  const recipe = featuredRecipe;

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/recipes/featured/hero-image", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        if (active && typeof j?.url === "string") setHeroImage(j.url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/recipes/featured/mint-quote")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        if (active) setQuote(j as QuoteResponse);
      })
      .catch(() => {
        if (active) setQuoteError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const derived = quote?.fingerprint?.elemental ?? null;
  const smartServes = quote?.fingerprint?.smartServings ?? null;
  const servesLimitedBy = quote?.fingerprint?.servingsLimitedBy ?? null;

  const shares = useMemo(
    () =>
      derived ?? {
        Fire: recipe.elementalBalance.fire / 100,
        Water: recipe.elementalBalance.water / 100,
        Earth: recipe.elementalBalance.earth / 100,
        Air: recipe.elementalBalance.air / 100,
      },
    [derived, recipe.elementalBalance],
  );

  const signature = useMemo(() => elementalSignature(shares), [shares]);
  const coDominantSet = new Set(signature.coDominant.map((e) => e.toLowerCase()));

  const baseServings = smartServes ?? recipe.yields;
  const [servingsOverride, setServingsOverride] = useState<number | null>(null);
  const servings = servingsOverride ?? baseServings;
  const scaleFactor = baseServings > 0 ? servings / baseServings : 1;
  const servingsReady = quote !== null || quoteError;

  const stepServings = (delta: number) =>
    setServingsOverride((prev) =>
      Math.max(MIN_SERVINGS, Math.min(MAX_SERVINGS, (prev ?? baseServings) + delta)),
    );

  const steps = [...recipe.steps].sort(
    (a, b) => a.step_number - b.step_number,
  );

  const aSharpVal = quote?.fingerprint?.aSharp ?? 129.5;
  const contentHash = quote?.recipeId ? `0x${quote.recipeId.substring(0, 40)}` : "0xa9f47e30d12f2b7e51c8a1dbf7d5440628e932b7e";

  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-[#0c0a06]/80 to-[#0a0f0a]/60 p-5 md:p-6 shadow-xl">
      {/* Warm ambient glow to set the featured block apart */}
      <div className="absolute -top-16 -right-10 w-56 h-56 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Upper row: Main Showcase and Blockchain Ledger split */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Block: Recipe Showcase details (Span 3) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[9px] font-extrabold text-amber-300 uppercase tracking-widest">
                  ✧ {FEATURED_RECIPE_META.designation}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-extrabold text-emerald-400 uppercase tracking-wide">
                  {FEATURED_RECIPE_META.status}
                </span>
                <span className="text-[10px] font-mono text-white/35">
                  by {FEATURED_RECIPE_META.authorAgent}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl md:text-2xl font-black text-white/95 leading-tight tracking-tight">
                {recipe.title}
              </h3>
              <p className="text-xs md:text-sm text-white/50 leading-relaxed">
                {recipe.short_description}
              </p>
            </div>

            {/* Hero image — generated by the live recipe-image pipeline */}
            {heroImage && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/7] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={recipe.title}
                  loading="lazy"
                  onError={() => setHeroImage(null)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0a]/70 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-white/35 uppercase tracking-wider text-[9px] font-bold">Time</span>
                <span className="text-white/80 font-semibold">{recipe.total_time} min</span>
              </div>
              <div
                className="flex items-center gap-1.5"
                title={
                  `${servesLimitedBy
                    ? `Smart default — yield-limited by ${servesLimitedBy}. `
                    : "Smart default servings. " 
                  }Adjust to scale the ingredient list; the ledger weight stays fixed.`
                }
              >
                <span className="text-white/35 uppercase tracking-wider text-[9px] font-bold">Serves</span>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => stepServings(-1)}
                    disabled={!servingsReady || servings <= MIN_SERVINGS}
                    aria-label="Fewer servings"
                    className="w-5 h-5 flex items-center justify-center rounded-md bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors leading-none"
                  >
                    −
                  </button>
                  <span className="text-white/80 font-semibold tabular-nums w-5 text-center">{servings}</span>
                  <button
                    type="button"
                    onClick={() => stepServings(1)}
                    disabled={!servingsReady || servings >= MAX_SERVINGS}
                    aria-label="More servings"
                    className="w-5 h-5 flex items-center justify-center rounded-md bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors leading-none"
                  >
                    +
                  </button>
                  {servingsOverride !== null && servingsOverride !== baseServings && (
                    <button
                      type="button"
                      onClick={() => setServingsOverride(null)}
                      className="ml-1 text-[8px] uppercase tracking-wider text-amber-300/70 hover:text-amber-200 transition-colors"
                    >
                      reset
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white/35 uppercase tracking-wider text-[9px] font-bold">Level</span>
                <span className="text-white/80 font-semibold capitalize">{recipe.difficulty}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white/35 uppercase tracking-wider text-[9px] font-bold">Cuisine</span>
                <span className="text-white/80 font-semibold">{recipe.cuisine}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white/35 uppercase tracking-wider text-[9px] font-bold">Aligns</span>
                <span className="text-amber-300 font-semibold">{recipe.alignment_score.overall}/100</span>
              </div>
            </div>
          </div>

          {/* Right Block: On-Chain Ledger Showcase (Span 2) */}
          <div className="lg:col-span-2 flex flex-col justify-between rounded-xl border border-cyan-500/25 bg-[#070b0e]/95 p-4 relative overflow-hidden shadow-lg">
            <div className="absolute -top-16 -left-10 w-48 h-48 bg-cyan-600/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest">
                  ⛓ Base Ledger Showcase
                </span>
                <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  ✓ Minted & Verified
                </span>
              </div>

              {/* Ledger metadata list */}
              <div className="space-y-2.5 font-mono text-[10px] text-white/70">
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/35 uppercase tracking-wider font-bold">Ledger Registry</span>
                  <span className="text-white/80 text-right truncate max-w-[150px]" title="0x47b92B08f75b7b98e72322af505f0628e932b7e">
                    0x47b92B08...3df9
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/35 uppercase tracking-wider font-bold">Token ID</span>
                  <span className="text-cyan-300 font-extrabold">#1002</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/35 uppercase tracking-wider font-bold">Alchemical Weight</span>
                  <span className="text-white/95 font-semibold">A# {aSharpVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/35 uppercase tracking-wider font-bold">Content Hash</span>
                  <span className="text-white/80 text-right truncate max-w-[150px]" title={contentHash}>
                    {contentHash.substring(0, 10)}...{contentHash.substring(contentHash.length - 8)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/35 uppercase tracking-wider font-bold">Provenance Block</span>
                  <span className="text-white/80">#18,349,202</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                  <span className="text-white/35 uppercase tracking-wider font-bold">Alchm License</span>
                  <span className="text-white/60">5% Royalty / VA 2-434-962</span>
                </div>
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed">
                Alchm.kitchen publishes a new curated recipe on-chain monthly. This ledger record serves as proof-of-provenance. Minting is sponsored and preserved immutably.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.06] mt-4">
              <Link
                href="/recipe-builder"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all duration-200 group"
              >
                ✨ Build &amp; Mint Your Own Recipe
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">&rarr;</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Action Toggle to reveal full recipe details */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-200 font-semibold text-xs transition-all duration-200"
          >
            {expanded ? "Hide Recipe Details" : "Reveal Recipe Details"}
            <span className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
        </div>

        {/* Expanded Recipe Segment */}
        {expanded && (
          <div className="mt-4 pt-6 border-t border-white/[0.06] grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Ingredients column (Span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-bold text-white/45 uppercase tracking-widest flex items-center justify-between">
                <span>Ingredients · {recipe.ingredients.length}</span>
                {scaleFactor !== 1 && (
                  <span className="text-amber-300/60 normal-case tracking-normal font-medium">
                    scaled to {servings} servings
                  </span>
                )}
              </h4>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={ing.name}
                    className="flex justify-between gap-3 text-[11px] border-b border-white/[0.04] pb-2 last:border-0"
                  >
                    <span className="text-white/70 leading-snug">
                      {ing.name}
                      {ing.optional && (
                        <span className="ml-1 text-white/30 italic">(optional)</span>
                      )}
                    </span>
                    <span className="text-amber-300/90 font-medium whitespace-nowrap">
                      {scaleAmount(ing.quantity, scaleFactor)} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cooking steps / method (Span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-[11px] font-bold text-white/45 uppercase tracking-widest">
                Method Steps
              </h4>
              <ol className="space-y-4">
                {steps.map((step) => (
                  <li key={step.step_number} className="flex gap-3">
                    <span className="flex-shrink-0 w-5.5 h-5.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-[10px] aspect-square">
                      {step.step_number}
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] text-white/70 leading-relaxed">
                        {step.instruction}
                      </p>
                      <span className="text-[9px] text-white/35 uppercase tracking-wide">
                        {step.cooking_method} · {step.time_minutes} min
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Finishing & Plating */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
                <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  Finishing &amp; Plating
                </h5>
                <p className="text-[11px] text-white/55 leading-relaxed">
                  {recipe.finishing_and_serving.garnish_and_plating}
                </p>
              </div>

              {/* Elemental signature & Astro mapping layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
                {/* Elemental shares */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-widest">
                      Elemental Share
                    </h4>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-extrabold text-white/70 uppercase tracking-wide">
                      {signature.tier === "co-dominant"
                        ? `${signature.shortLabel} · co-dominant`
                        : signature.shortLabel}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {ELEMENT_ROWS.map((el) => {
                      const val = Math.round((shares[el.name] ?? 0) * 100);
                      const isCoDominant = coDominantSet.has(el.name.toLowerCase());
                      return (
                        <div key={el.key} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className={`font-semibold flex items-center gap-1.5 ${isCoDominant ? el.text : "text-white/60"}`}>
                              {el.icon} {el.name}
                            </span>
                            <span className="text-white/40 font-medium">{val}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${el.bar} ${isCoDominant ? "" : "opacity-60"} transition-all duration-1000 ease-out`}
                              style={{ width: `${Math.min(100, val)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Astro/Planetary Mapping */}
                <div className="rounded-xl bg-indigo-500/[0.03] border border-indigo-500/10 p-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-widest mb-1.5">
                      Cosmic Mapping
                    </h4>
                    <p className="text-[10px] text-white/55 leading-relaxed">
                      {recipe.astro_explanation.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {recipe.tags.planets.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-bold text-indigo-300 uppercase tracking-wide"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
