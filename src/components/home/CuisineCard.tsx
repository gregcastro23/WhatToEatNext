"use client";

import Link from "next/link";
import React, { useState } from "react";
import { getCuisineProfile } from "@/data/cuisineFlavorProfiles";

type OnDoubleClickCuisine = (cuisineName: string) => void;

const PLANET_ICONS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

// Dark-theme planet badge styles
const PLANET_COLORS: Record<string, string> = {
  Sun: "text-yellow-300 bg-yellow-900/30 border-yellow-700/50",
  Moon: "text-blue-300 bg-blue-900/30 border-blue-700/50",
  Mercury: "text-slate-300 bg-slate-800/50 border-slate-600/50",
  Venus: "text-pink-300 bg-pink-900/30 border-pink-700/50",
  Mars: "text-red-300 bg-red-900/30 border-red-700/50",
  Jupiter: "text-orange-300 bg-orange-900/30 border-orange-700/50",
  Saturn: "text-slate-400 bg-slate-800/50 border-slate-500/50",
};

// Gradient header tones — still vibrant but shifted darker
const GRADIENT_COLORS: Record<string, string> = {
  Sun: "from-yellow-700 to-amber-900",
  Moon: "from-blue-800 to-indigo-900",
  Mercury: "from-slate-700 to-slate-900",
  Venus: "from-pink-800 to-rose-900",
  Mars: "from-red-800 to-orange-900",
  Jupiter: "from-orange-800 to-amber-900",
  Saturn: "from-slate-700 to-gray-900",
};

const FLAVOR_LABELS: Record<string, { label: string; color: string }> = {
  spicy:  { label: "Spicy",  color: "bg-red-500" },
  sweet:  { label: "Sweet",  color: "bg-amber-400" },
  sour:   { label: "Sour",   color: "bg-lime-500" },
  bitter: { label: "Bitter", color: "bg-emerald-600" },
  salty:  { label: "Salty",  color: "bg-sky-500" },
  umami:  { label: "Umami",  color: "bg-purple-500" },
};

const FLAVOR_ORDER = ["spicy", "umami", "salty", "sweet", "sour", "bitter"] as const;

function FlavorBars({ cuisineName }: { cuisineName: string }) {
  const profile = getCuisineProfile(cuisineName);
  if (!profile) return null;
  const fp = profile.flavorProfiles;

  return (
    <div className="space-y-1 mt-2">
      {FLAVOR_ORDER.map((key) => {
        const value = fp[key] ?? 0;
        const meta = FLAVOR_LABELS[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-9 shrink-0">{meta.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-700/60">
              <div
                className={`h-1.5 rounded-full ${meta.color} opacity-85`}
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 w-6 text-right">
              {Math.round(value * 100)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TopFlavorPills({ cuisineName }: { cuisineName: string }) {
  const profile = getCuisineProfile(cuisineName);
  if (!profile) return null;
  const fp = profile.flavorProfiles;

  const sorted = FLAVOR_ORDER
    .map((k) => ({ key: k, val: fp[k] ?? 0 }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 3)
    .filter((x) => x.val >= 0.35);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {sorted.map(({ key }) => {
        const meta = FLAVOR_LABELS[key];
        return (
          <span
            key={key}
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${meta.color} text-white/90`}
          >
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

export interface DynamicCuisineRecommendation {
  cuisine: string;
  score: number;
  planet: string;
  reasoning: string;
  recipeCount: number;
  optimalTiming: string;
  topRecipes: Array<{ name: string; matchScore: number }>;
  isRetrograde?: boolean;
}

interface CuisineCardProps {
  cuisine: DynamicCuisineRecommendation;
  rank: number;
  compact?: boolean;
  onDoubleClickCuisine?: OnDoubleClickCuisine;
}

export function CuisineCard({ cuisine, rank, compact, onDoubleClickCuisine }: CuisineCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const icon = PLANET_ICONS[cuisine.planet] || "☉";
  const colorClass = PLANET_COLORS[cuisine.planet] || PLANET_COLORS.Sun;
  const gradient = GRADIENT_COLORS[cuisine.planet] || GRADIENT_COLORS.Sun;

  const scoreColor =
    cuisine.score >= 85
      ? "bg-emerald-600"
      : cuisine.score >= 70
        ? "bg-amber-600"
        : "bg-slate-600";

  if (compact) {
    return (
      <Link
        href={`/recipes?cuisine=${encodeURIComponent(cuisine.cuisine.toLowerCase())}`}
        onDoubleClick={(e) => {
          if (onDoubleClickCuisine) {
            e.preventDefault();
            onDoubleClickCuisine(cuisine.cuisine);
          }
        }}
      >
        <div className="bg-slate-900/80 rounded-lg transition-all duration-200 overflow-hidden border border-purple-500/20 hover:border-purple-400/40 hover:bg-slate-800/80 cursor-pointer p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg opacity-80">{icon}</span>
              <h3 className="font-semibold text-slate-100">{cuisine.cuisine}</h3>
              {cuisine.isRetrograde && (
                <span className="text-xs text-amber-400" title={`${cuisine.planet} retrograde`}>
                  Rx
                </span>
              )}
            </div>
            <div className={`px-2 py-0.5 ${scoreColor} text-white rounded-full text-xs font-bold`}>
              {cuisine.score}%
            </div>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{cuisine.reasoning}</p>
          <TopFlavorPills cuisineName={cuisine.cuisine} />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            {cuisine.recipeCount > 0 && <span>{cuisine.recipeCount} recipes</span>}
            <span>{cuisine.optimalTiming}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      onDoubleClick={(e) => {
        if (onDoubleClickCuisine) {
          e.preventDefault();
          onDoubleClickCuisine(cuisine.cuisine);
        }
      }}
    >
      <Link href={`/recipes?cuisine=${encodeURIComponent(cuisine.cuisine.toLowerCase())}`}>
        <div className="bg-slate-900/80 rounded-xl transition-all duration-300 overflow-hidden border border-purple-500/20 hover:border-purple-400/50 hover:bg-slate-800/80 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20">
          {/* Rank Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="w-8 h-8 bg-purple-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              #{rank}
            </div>
          </div>

          {/* Score Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`px-3 py-1 ${scoreColor} text-white rounded-full font-bold text-sm shadow-lg`}>
              {cuisine.score}%
            </div>
          </div>

          {/* Header with gradient */}
          <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-8xl text-white">{icon}</span>
            </div>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">{cuisine.cuisine}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Planetary badge */}
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass}`}>
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-semibold">{cuisine.planet} Ruled</span>
              </div>
              {cuisine.isRetrograde && (
                <span
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-300 bg-amber-900/30 border border-amber-700/50 rounded-full"
                  title={`${cuisine.planet} is retrograde`}
                >
                  Rx
                </span>
              )}
            </div>

            {/* Reasoning */}
            <p className="text-sm text-slate-300 leading-relaxed">{cuisine.reasoning}</p>

            {/* Flavor Profile */}
            <div className="pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Flavor Profile
              </p>
              <FlavorBars cuisineName={cuisine.cuisine} />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                {cuisine.recipeCount > 0 ? (
                  <span>{cuisine.recipeCount} recipes</span>
                ) : (
                  <span>Explore cuisine</span>
                )}
              </div>
              <div className="text-xs text-slate-500">{cuisine.optimalTiming}</div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3" onClick={(e) => e.preventDefault()}>
              <Link
                href={`/recipes?cuisine=${encodeURIComponent(cuisine.cuisine.toLowerCase())}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-sm transition-all border border-orange-400/50"
              >
                <span aria-hidden>🥘</span> Cook It
              </Link>
              <Link
                href={`/restaurants?cuisine=${encodeURIComponent(cuisine.cuisine.toLowerCase())}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-rose-500/80 to-purple-500/80 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-sm transition-all border border-purple-400/50"
              >
                <span aria-hidden>📍</span> Order It
              </Link>
            </div>
          </div>

          {/* Hover Preview */}
          {showPreview && cuisine.topRecipes.length > 0 && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm p-5 flex flex-col justify-center rounded-xl border border-purple-500/30">
              <h4 className="font-semibold text-slate-100 mb-3">Top Recipes:</h4>
              <div className="space-y-2">
                {cuisine.topRecipes.map((recipe, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{recipe.name}</span>
                    <span className="text-amber-400 font-medium">{recipe.matchScore}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-purple-400 font-medium text-sm">Click to explore &rarr;</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export function CuisineCardSkeleton() {
  return (
    <div className="bg-slate-900/80 rounded-xl overflow-hidden border border-purple-500/20 animate-pulse">
      <div className="h-32 bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-8 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-800 rounded w-5/6" />
        <div className="space-y-1.5 pt-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2 bg-slate-800 rounded w-9" />
              <div className="flex-1 h-1.5 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default CuisineCard;
