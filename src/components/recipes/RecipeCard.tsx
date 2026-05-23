// src/components/recipes/RecipeCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import type { Recipe } from "@/types/recipe";

const PLANET_ICONS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
type Element = (typeof ELEMENTS)[number];

const ELEMENT_META: Record<Element, { icon: string; bar: string; cover: string }> = {
  Fire: { icon: "\u{1F525}", bar: "bg-red-500", cover: "from-red-900/60 via-orange-900/30" },
  Water: { icon: "\u{1F4A7}", bar: "bg-blue-500", cover: "from-blue-900/60 via-cyan-900/30" },
  Earth: { icon: "\u{1F33F}", bar: "bg-amber-600", cover: "from-amber-900/60 via-yellow-900/30" },
  Air: { icon: "\u{1F4A8}", bar: "bg-sky-400", cover: "from-sky-800/60 via-indigo-900/30" },
};

const MEAL_ICONS: Record<string, string> = {
  breakfast: "\u{1F373}",
  lunch: "\u{1F957}",
  dinner: "\u{1F37D}️",
  dessert: "\u{1F370}",
  snack: "\u{1F36A}",
};

const SPICE_META: Record<string, { label: string; dots: number }> = {
  none: { label: "No Spice", dots: 0 },
  mild: { label: "Mild", dots: 1 },
  medium: { label: "Medium", dots: 2 },
  hot: { label: "Hot", dots: 3 },
  "very hot": { label: "Very Hot", dots: 4 },
};

function dominantElement(ep: Recipe["elementalProperties"] | undefined): Element {
  if (!ep) return "Earth";
  let best: Element = "Earth";
  let max = -Infinity;
  for (const e of ELEMENTS) {
    const v = typeof ep[e] === "number" ? ep[e] : 0;
    if (v > max) {
      max = v;
      best = e;
    }
  }
  return best;
}

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.find((v) => typeof v === "string" && v.length > 0);
  }
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Pull a minute count out of "140 minutes" / "1h 20m" and pretty-print it. */
function formatDuration(recipe: Recipe): string | null {
  const raw = recipe.timeToMake ?? recipe.totalTime ?? recipe.prepTime ?? "";
  const match = String(raw).match(/(\d+)/);
  const mins = match ? parseInt(match[1], 10) : 0;
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function spiceInfo(level: Recipe["spiceLevel"]): { label: string; dots: number } | null {
  if (level == null) return null;
  let info: { label: string; dots: number } | undefined;
  if (typeof level === "number") {
    if (level <= 0) return null;
    info = level <= 2 ? SPICE_META.mild : level <= 4 ? SPICE_META.medium : level <= 6 ? SPICE_META.hot : SPICE_META["very hot"];
  } else {
    info = SPICE_META[String(level).toLowerCase()];
  }
  // "No Spice" is the absence of a property — not worth a chip.
  return info && info.dots > 0 ? info : null;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // Planetary fields are attached by the recipes page's scoring pass; they
  // are absent on un-scored cards (e.g. "similar recipes" on the detail page).
  const score = recipe.score ?? (recipe as { planetaryScore?: number }).planetaryScore;
  const rulingPlanet = (recipe as { rulingPlanet?: string }).rulingPlanet;
  const planetaryReason = (recipe as { planetaryReason?: string }).planetaryReason;
  const regionalVariant =
    typeof recipe.regionalVariant === "string" ? recipe.regionalVariant : undefined;

  const rawImage =
    (typeof recipe.image === "string" && recipe.image) ||
    (typeof recipe.imageUrl === "string" && recipe.imageUrl) ||
    "";
  const showImage = rawImage.length > 0 && !imageFailed;

  const ep = recipe.elementalProperties;
  const dom = dominantElement(ep);
  const elementTotal = ep
    ? ELEMENTS.reduce((sum, e) => sum + (typeof ep[e] === "number" ? ep[e] : 0), 0)
    : 0;

  const mealType = firstString(recipe.mealType)?.toLowerCase();
  const coverGlyph = (mealType && MEAL_ICONS[mealType]) || ELEMENT_META[dom].icon;

  const duration = formatDuration(recipe);
  const servings = recipe.numberOfServings ?? recipe.servingSize;
  const ingredientCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
  const calories = recipe.nutrition?.calories;

  const spice = spiceInfo(recipe.spiceLevel);
  const monicaLabel =
    typeof recipe.monicaScoreLabel === "string" ? recipe.monicaScoreLabel : undefined;
  const cookingMethod = Array.isArray(recipe.cookingMethod)
    ? recipe.cookingMethod[0]
    : undefined;

  const meta: string[] = [];
  if (duration) meta.push(duration);
  if (servings != null) meta.push(`Serves ${servings}`);
  if (ingredientCount > 0) meta.push(`${ingredientCount} ingredients`);
  if (typeof calories === "number" && calories > 0) meta.push(`${Math.round(calories)} cal`);

  const scoreColor =
    score != null && score >= 80
      ? "text-emerald-300"
      : score != null && score >= 60
        ? "text-amber-300"
        : "text-slate-300";

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block h-full">
      <article className="glass-card-premium rounded-2xl border border-white/8 overflow-hidden h-full flex flex-col transition-all duration-200 group-hover:border-amber-400/30 group-hover:-translate-y-1">
        {/* ── Cover ── */}
        <div className={`relative h-28 bg-gradient-to-br ${ELEMENT_META[dom].cover} to-slate-950`}>
          {showImage ? (
            <Image
              src={rawImage}
              alt={recipe.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="object-cover"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center text-5xl opacity-25 select-none"
              aria-hidden="true"
            >
              {coverGlyph}
            </span>
          )}
          {recipe.cuisine && (
            <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium capitalize text-amber-200 backdrop-blur">
              {recipe.cuisine}
            </span>
          )}
          {score != null && (
            <span
              className={`absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold backdrop-blur ${scoreColor}`}
            >
              {Math.round(score)}%
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-semibold leading-snug text-white line-clamp-2 transition-colors group-hover:text-amber-200">
            {recipe.name}
          </h3>

          {regionalVariant && (
            <span className="self-start rounded border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[11px] text-amber-300/90">
              {regionalVariant}
            </span>
          )}

          {recipe.description && (
            <p className="text-sm leading-relaxed text-slate-400 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {meta.length > 0 && (
            <p className="text-xs text-slate-400">{meta.join("  ·  ")}</p>
          )}

          {/* Elemental balance bar */}
          {ep && elementTotal > 0 && (
            <div className="flex h-1.5 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
              {ELEMENTS.map((e) => {
                const value = typeof ep[e] === "number" ? ep[e] : 0;
                const pct = (value / elementTotal) * 100;
                if (pct <= 0) return null;
                return (
                  <div
                    key={e}
                    className={ELEMENT_META[e].bar}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          )}

          {/* Tag chips */}
          {(monicaLabel || spice || cookingMethod || recipe.isVegan || recipe.isVegetarian || recipe.isGlutenFree) && (
            <div className="flex flex-wrap gap-1.5">
              {monicaLabel && (
                <span className="rounded border border-indigo-400/20 bg-indigo-500/10 px-1.5 py-0.5 text-[11px] text-indigo-300">
                  ⚗ {monicaLabel}
                </span>
              )}
              {spice && (
                <span className="rounded border border-red-400/20 bg-red-500/10 px-1.5 py-0.5 text-[11px] text-red-300">
                  {"\u{1F336}️"} {spice.label}
                </span>
              )}
              {recipe.isVegan ? (
                <span className="rounded border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-emerald-300">
                  Vegan
                </span>
              ) : recipe.isVegetarian ? (
                <span className="rounded border border-green-400/30 bg-green-500/10 px-1.5 py-0.5 text-[11px] text-green-300">
                  Vegetarian
                </span>
              ) : null}
              {recipe.isGlutenFree && (
                <span className="rounded border border-yellow-400/20 bg-yellow-500/10 px-1.5 py-0.5 text-[11px] text-yellow-300">
                  GF
                </span>
              )}
              {cookingMethod && (
                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] capitalize text-slate-300">
                  {cookingMethod}
                </span>
              )}
            </div>
          )}

          {/* Planetary footer (present only on scored cards) */}
          {(rulingPlanet || planetaryReason) && (
            <div className="mt-auto border-t border-white/8 pt-2">
              {rulingPlanet && (
                <p className="text-xs text-slate-300">
                  <span className="text-amber-300">
                    {PLANET_ICONS[rulingPlanet] || "✦"}
                  </span>{" "}
                  {rulingPlanet}-ruled
                </p>
              )}
              {planetaryReason && (
                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                  {planetaryReason}
                </p>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
