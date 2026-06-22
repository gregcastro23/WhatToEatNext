"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RecipeNftMintPanel, type QuoteResponse } from "@/components/home/RecipeNftMintPanel";
import { FEATURED_RECIPE_META, featuredRecipe } from "@/data/featuredRecipe";
import { elementalSignature } from "@/utils/elemental";

const ELEMENT_ROWS = [
  { key: "fire", name: "Fire", icon: "🔥", bar: "bg-red-500", text: "text-red-400" },
  { key: "earth", name: "Earth", icon: "🌍", bar: "bg-emerald-500", text: "text-emerald-400" },
  { key: "air", name: "Air", icon: "💨", bar: "bg-amber-400", text: "text-amber-300" },
  { key: "water", name: "Water", icon: "💧", bar: "bg-blue-500", text: "text-blue-400" },
] as const;

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 24;

/** Parse a recipe quantity ("2", "0.5", "1/2", "1 1/2") to a number, or null. */
function parseQty(raw: string): number | null {
  const s = raw.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Tidy a scaled amount: integers stay integers, else up to 2 decimals, no trailing zeros. */
function formatQty(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/** Scale a displayed ingredient amount by the serving factor (unparseable amounts pass through). */
function scaleAmount(quantity: string, factor: number): string {
  if (factor === 1) return quantity;
  const n = parseQty(quantity);
  if (n === null) return quantity;
  return formatQty(n * factor);
}

/**
 * Featured Recipe of the Month — a self-contained block rendered inside the
 * home-page Promotion. Pulls the schema-typed `featuredRecipe` payload and
 * derives its elemental framing from the canonical `elementalSignature()`
 * model (adaptive co-dominance, no oppositions) rather than hard-coding a label.
 */
export function FeaturedRecipe() {
  const [expanded, setExpanded] = useState(false);

  const recipe = featuredRecipe;

  // One shared mint-quote fetch for the whole featured block: it drives the
  // ingredient-derived signature (badge + bars), the smart-default servings, and
  // is handed straight to the mint panel below (which no longer self-fetches).
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  // Hero image — generated via the live image pipeline (Redis-cached).
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // no-store: the image may not exist on the first visit, and a cached null
    // would otherwise stick for the route's max-age.
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

  // Ingredient-derived signature + smart servings come from the shared quote;
  // fall back to the authored values until (or unless) it resolves.
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

  // Servings adjuster (cooking convenience): scales the DISPLAYED ingredient
  // amounts only. The mint cost stays the recipe's intrinsic per-serving
  // fingerprint — it is computed server-side and never reads a client serving
  // count, so the selector can't change what a mint charges.
  const baseServings = smartServes ?? recipe.yields;
  const [servingsOverride, setServingsOverride] = useState<number | null>(null);
  const servings = servingsOverride ?? baseServings;
  const scaleFactor = baseServings > 0 ? servings / baseServings : 1;
  // Functional updater so rapid +/- clicks accumulate off the latest value.
  const stepServings = (delta: number) =>
    setServingsOverride((prev) =>
      Math.max(MIN_SERVINGS, Math.min(MAX_SERVINGS, (prev ?? baseServings) + delta)),
    );

  const steps = [...recipe.steps].sort(
    (a, b) => a.step_number - b.step_number,
  );

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.06]">
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-[#0c0a06]/80 to-[#0a0f0a]/60 p-5 md:p-6">
        {/* Warm ambient glow to set the featured block apart */}
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10">
          {/* Hero image — generated by the live recipe-image pipeline */}
          {heroImage && (
            <div className="relative mb-5 rounded-2xl overflow-hidden border border-white/10 aspect-[16/7]">
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

          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
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

          {/* Title + description */}
          <h3 className="text-lg md:text-2xl font-black text-white/95 leading-tight tracking-tight">
            {recipe.title}
          </h3>
          <p className="mt-2 text-xs md:text-sm text-white/50 leading-relaxed max-w-3xl">
            {recipe.short_description}
          </p>

          {/* Quick stats */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white/35 uppercase tracking-wider text-[10px] font-bold">Time</span>
              <span className="text-white/80 font-semibold">{recipe.total_time} min</span>
            </div>
            <div
              className="flex items-center gap-1.5"
              title={
                `${servesLimitedBy
                  ? `Smart default — yield-limited by ${servesLimitedBy}. `
                  : "Smart default servings. " 
                }Adjust to scale the ingredient list; the mint cost is the recipe's fixed per-serving fingerprint.`
              }
            >
              <span className="text-white/35 uppercase tracking-wider text-[10px] font-bold">Serves</span>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepServings(-1)}
                  disabled={servings <= MIN_SERVINGS}
                  aria-label="Fewer servings"
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors leading-none"
                >
                  −
                </button>
                <span className="text-white/80 font-semibold tabular-nums w-5 text-center">{servings}</span>
                <button
                  type="button"
                  onClick={() => stepServings(1)}
                  disabled={servings >= MAX_SERVINGS}
                  aria-label="More servings"
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors leading-none"
                >
                  +
                </button>
                {servingsOverride !== null && servingsOverride !== baseServings && (
                  <button
                    type="button"
                    onClick={() => setServingsOverride(null)}
                    className="ml-1 text-[9px] uppercase tracking-wider text-amber-300/70 hover:text-amber-200 transition-colors"
                  >
                    reset
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white/35 uppercase tracking-wider text-[10px] font-bold">Level</span>
              <span className="text-white/80 font-semibold capitalize">{recipe.difficulty}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white/35 uppercase tracking-wider text-[10px] font-bold">Cuisine</span>
              <span className="text-white/80 font-semibold">{recipe.cuisine}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white/35 uppercase tracking-wider text-[10px] font-bold">Aligns</span>
              <span className="text-amber-300 font-semibold">{recipe.alignment_score.overall}/100</span>
            </div>
          </div>

          {/* Elemental signature */}
          <div className="mt-5 grid md:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-[11px] font-bold text-white/45 uppercase tracking-widest">
                  Elemental Signature
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-extrabold text-white/70 uppercase tracking-wide">
                  {signature.tier === "co-dominant"
                    ? `${signature.shortLabel} · co-dominant`
                    : signature.shortLabel}
                </span>
              </div>
              {ELEMENT_ROWS.map((el) => {
                const val = Math.round((shares[el.name] ?? 0) * 100);
                const isCoDominant = coDominantSet.has(el.name.toLowerCase());
                return (
                  <div key={el.key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={`font-semibold flex items-center gap-1.5 ${isCoDominant ? el.text : "text-white/60"}`}>
                        {el.icon} {el.name}
                        {isCoDominant && (
                          <span className="text-[8px] font-extrabold uppercase tracking-wider opacity-80">
                            lead
                          </span>
                        )}
                      </span>
                      <span className="text-white/40 font-medium">{val}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${el.bar} ${isCoDominant ? "" : "opacity-60"} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(100, val)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-white/30 leading-relaxed pt-1">
                {signature.tier === "co-dominant"
                  ? `${signature.shortLabel} reinforce each other`
                  : `${signature.shortLabel} leads`}{" "}
                — an additive spark, never an opposition; the elements never
                conflict. Derived from the recipe&apos;s own ingredients.
              </p>
            </div>

            {/* Astro mapping */}
            <div className="rounded-xl bg-indigo-500/[0.04] border border-indigo-500/15 p-4">
              <h4 className="text-[11px] font-bold text-indigo-300/80 uppercase tracking-widest mb-2">
                Cosmic Mapping
              </h4>
              <p className="text-[11px] text-white/55 leading-relaxed mb-3">
                {recipe.astro_explanation.summary}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.planets.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 uppercase tracking-wide"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mint this recipe as an NFT — the featured mechanic. Fed the shared
              quote so it doesn't re-fetch; falls back to its own fetch standalone. */}
          <RecipeNftMintPanel quote={quote} quoteError={quoteError} />

          {/* Expand / collapse */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/40 text-amber-200 font-semibold text-xs transition-all duration-200"
          >
            {expanded ? "Hide the full recipe" : "Reveal the full recipe"}
            <span className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {expanded && (
            <div className="mt-5 grid lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Ingredients */}
              <div className="lg:col-span-2">
                <h4 className="text-[11px] font-bold text-white/45 uppercase tracking-widest mb-3">
                  Ingredients · {recipe.ingredients.length}
                  {scaleFactor !== 1 && (
                    <span className="ml-2 text-amber-300/60 normal-case tracking-normal font-medium">
                      scaled to {servings} serving{servings === 1 ? "" : "s"}
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

              {/* Method */}
              <div className="lg:col-span-3">
                <h4 className="text-[11px] font-bold text-white/45 uppercase tracking-widest mb-3">
                  Method
                </h4>
                <ol className="space-y-4">
                  {steps.map((step) => (
                    <li key={step.step_number} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-[11px]">
                        {step.step_number}
                      </span>
                      <div className="flex-1">
                        <p className="text-[12px] text-white/70 leading-relaxed">
                          {step.instruction}
                        </p>
                        <span className="text-[10px] text-white/30 uppercase tracking-wide">
                          {step.cooking_method} · {step.time_minutes} min
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Finishing */}
                <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
                  <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                    Finishing &amp; Plating
                  </h5>
                  <p className="text-[11px] text-white/55 leading-relaxed">
                    {recipe.finishing_and_serving.garnish_and_plating}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-5 pt-4 border-t border-white/[0.04]">
            <Link
              href="/recipe-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 font-semibold text-sm transition-all duration-200 group"
            >
              ✨ Conjure your own cosmic recipe
              <span className="group-hover:translate-x-1 transition-transform duration-200">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
