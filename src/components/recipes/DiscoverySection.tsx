"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface DiscoveryRecipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  elementalProperties?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  monicaScore?: number;
  monicaScoreLabel?: string;
  prepTime?: string;
  cookTime?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

interface DiscoveryData {
  similarElemental: DiscoveryRecipe[];
  similarAlchemical: DiscoveryRecipe[];
  sameCuisine: DiscoveryRecipe[];
}

type Lens = "elemental" | "alchemical" | "cuisine";

const LENS_META: Record<Lens, { label: string; icon: string; blurb: string }> = {
  elemental: {
    label: "Elemental Kin",
    icon: "\u2697",
    blurb: "Closest Fire / Water / Earth / Air signature",
  },
  alchemical: {
    label: "Alchemical Kin",
    icon: "\u2609",
    blurb: "Closest Spirit / Essence / Matter / Substance alignment",
  },
  cuisine: {
    label: "Same Cuisine",
    icon: "\u{1F310}",
    blurb: "Top rated dishes from this tradition",
  },
};

const ELEMENT_DOT: Record<string, string> = {
  Fire: "bg-red-500",
  Water: "bg-blue-500",
  Earth: "bg-amber-500",
  Air: "bg-sky-400",
};

function dominantElement(r: DiscoveryRecipe): string | null {
  const e = r.elementalProperties;
  if (!e) return null;
  const entries = [
    ["Fire", e.Fire ?? 0] as const,
    ["Water", e.Water ?? 0] as const,
    ["Earth", e.Earth ?? 0] as const,
    ["Air", e.Air ?? 0] as const,
  ];
  entries.sort((a, b) => b[1] - a[1]);
  if (entries[0][1] === 0) return null;
  return entries[0][0];
}

function DiscoveryCard({ recipe }: { recipe: DiscoveryRecipe }) {
  const dom = dominantElement(recipe);
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block glass-card-premium rounded-xl border border-white/8 p-4 hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
          {recipe.name}
        </h3>
        {recipe.monicaScore != null && (
          <span className="shrink-0 text-xs font-bold text-amber-300">
            {Math.round(recipe.monicaScore)}
          </span>
        )}
      </div>

      {recipe.description && (
        <p className="text-xs text-white/60 line-clamp-2 mb-2">{recipe.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap text-xs">
        {recipe.cuisine && (
          <span className="text-white/60 capitalize">{recipe.cuisine}</span>
        )}
        {dom && (
          <span className="inline-flex items-center gap-1 text-white/60">
            <span className={`w-1.5 h-1.5 rounded-full ${ELEMENT_DOT[dom]}`} />
            {dom}
          </span>
        )}
        {recipe.isVegan && <span className="text-green-400">Vegan</span>}
        {!recipe.isVegan && recipe.isVegetarian && <span className="text-green-400">Veg</span>}
        {recipe.isGlutenFree && <span className="text-yellow-400">GF</span>}
      </div>
    </Link>
  );
}

export function DiscoverySection({ recipeId }: { recipeId: string }) {
  const [data, setData] = useState<DiscoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lens, setLens] = useState<Lens>("elemental");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/recipes/${recipeId}/discover`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success) {
          setData({
            similarElemental: json.similarElemental ?? [],
            similarAlchemical: json.similarAlchemical ?? [],
            sameCuisine: json.sameCuisine ?? [],
          });
        }
      })
      .catch((err) => console.error("Discovery fetch failed:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  if (loading) {
    return (
      <div className="glass-card-premium rounded-2xl border border-white/8 p-6">
        <div className="h-4 w-40 bg-white/5 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const lists: Record<Lens, DiscoveryRecipe[]> = {
    elemental: data.similarElemental,
    alchemical: data.similarAlchemical,
    cuisine: data.sameCuisine,
  };

  const available = (Object.keys(lists) as Lens[]).filter((k) => lists[k].length > 0);
  if (available.length === 0) return null;

  const activeLens: Lens = lists[lens].length > 0 ? lens : available[0];
  const items = lists[activeLens];

  return (
    <div className="glass-card-premium rounded-2xl border border-white/8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 flex items-center gap-2">
            <span className="not-italic text-2xl">{"\u{1F52D}"}</span>
            Discover More
          </h2>
          <p className="text-xs text-white/60 mt-1">{LENS_META[activeLens].blurb}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {available.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLens(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeLens === k
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="mr-1 not-italic">{LENS_META[k].icon}</span>
              {LENS_META[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <DiscoveryCard key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  );
}
