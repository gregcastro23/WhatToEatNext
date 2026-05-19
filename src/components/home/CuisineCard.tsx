"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Planet badge styles — refined for the 3.0 dark glass motif
const PLANET_BADGE: Record<string, string> = {
  Sun: "text-amber-200 bg-amber-500/10 border-amber-400/30",
  Moon: "text-blue-200 bg-blue-500/10 border-blue-400/30",
  Mercury: "text-slate-200 bg-slate-500/10 border-slate-400/30",
  Venus: "text-pink-200 bg-pink-500/10 border-pink-400/30",
  Mars: "text-red-200 bg-red-500/10 border-red-400/30",
  Jupiter: "text-orange-200 bg-orange-500/10 border-orange-400/30",
  Saturn: "text-slate-300 bg-slate-600/15 border-slate-500/30",
};

// Header gradient tones — vibrant but at low opacity behind the glow layer
const HEADER_GRADIENT: Record<string, string> = {
  Sun: "from-amber-600/40 via-yellow-700/30 to-orange-700/40",
  Moon: "from-blue-700/40 via-indigo-700/30 to-violet-800/40",
  Mercury: "from-slate-600/40 via-slate-700/30 to-zinc-800/40",
  Venus: "from-pink-600/40 via-rose-700/30 to-fuchsia-700/40",
  Mars: "from-red-600/40 via-orange-700/30 to-rose-700/40",
  Jupiter: "from-orange-600/40 via-amber-700/30 to-yellow-700/40",
  Saturn: "from-slate-600/40 via-zinc-700/30 to-gray-800/40",
};

// Glow color per planet — used in the ambient blur layer
const PLANET_GLOW: Record<string, string> = {
  Sun: "bg-amber-500/20",
  Moon: "bg-blue-500/20",
  Mercury: "bg-slate-400/20",
  Venus: "bg-pink-500/20",
  Mars: "bg-red-500/20",
  Jupiter: "bg-orange-500/20",
  Saturn: "bg-slate-400/15",
};

const FLAVOR_LABELS: Record<string, { label: string; color: string }> = {
  spicy:  { label: "Spicy",  color: "bg-red-500" },
  sweet:  { label: "Sweet",  color: "bg-amber-400" },
  sour:   { label: "Sour",   color: "bg-lime-500" },
  bitter: { label: "Bitter", color: "bg-emerald-500" },
  salty:  { label: "Salty",  color: "bg-sky-500" },
  umami:  { label: "Umami",  color: "bg-purple-500" },
};

const FLAVOR_ORDER = ["spicy", "umami", "salty", "sweet", "sour", "bitter"] as const;

function FlavorBars({ cuisineName }: { cuisineName: string }) {
  const profile = getCuisineProfile(cuisineName);
  if (!profile) return null;
  const fp = profile.flavorProfiles;

  return (
    <div className="space-y-1.5 mt-2">
      {FLAVOR_ORDER.map((key) => {
        const value = fp[key] ?? 0;
        const meta = FLAVOR_LABELS[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 w-10 shrink-0 font-medium uppercase tracking-wider">
              {meta.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${meta.color} opacity-80`}
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-white/50 w-6 text-right font-mono">
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

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {sorted.map(({ key }) => {
        const meta = FLAVOR_LABELS[key];
        return (
          <span
            key={key}
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.color}/80 text-white/95`}
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
  const router = useRouter();
  const cuisineSlug = encodeURIComponent(cuisine.cuisine.toLowerCase());
  const cookHref = `/recipes?cuisine=${cuisineSlug}`;
  const orderHref = `/restaurants?cuisine=${cuisineSlug}`;

  const icon = PLANET_ICONS[cuisine.planet] || "☉";
  const planetBadge = PLANET_BADGE[cuisine.planet] || PLANET_BADGE.Sun;
  const headerGradient = HEADER_GRADIENT[cuisine.planet] || HEADER_GRADIENT.Sun;
  const planetGlow = PLANET_GLOW[cuisine.planet] || PLANET_GLOW.Sun;

  const scoreColor =
    cuisine.score >= 85
      ? "bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-400/50"
      : cuisine.score >= 70
        ? "bg-gradient-to-br from-amber-500 to-orange-700 border-amber-400/50"
        : "bg-gradient-to-br from-slate-500 to-slate-700 border-slate-400/40";

  if (compact) {
    return (
      <Link
        href={cookHref}
        onDoubleClick={(e) => {
          if (onDoubleClickCuisine) {
            e.preventDefault();
            onDoubleClickCuisine(cuisine.cuisine);
          }
        }}
      >
        <div className="rounded-xl border border-white/10 bg-[#0c0c14]/80 backdrop-blur-md hover:border-purple-400/40 hover:bg-[#10101a]/90 transition-all duration-200 p-4 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg text-purple-300/80 shrink-0">{icon}</span>
              <h3 className="font-bold text-white truncate">{cuisine.cuisine}</h3>
              {cuisine.isRetrograde && (
                <span
                  className="text-[10px] text-amber-300 font-bold shrink-0"
                  title={`${cuisine.planet} retrograde`}
                >
                  Rx
                </span>
              )}
            </div>
            <div
              className={`px-2 py-0.5 ${scoreColor} text-white rounded-full text-[10px] font-black border shadow-lg`}
            >
              {cuisine.score}%
            </div>
          </div>
          <p className="text-xs text-white/55 line-clamp-2 leading-relaxed">
            {cuisine.reasoning}
          </p>
          <TopFlavorPills cuisineName={cuisine.cuisine} />
          <div className="flex items-center justify-between mt-2 text-[10px] text-white/40 font-medium">
            {cuisine.recipeCount > 0 && (
              <span>{cuisine.recipeCount} recipes</span>
            )}
            <span className="uppercase tracking-wider">
              {cuisine.optimalTiming}
            </span>
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
      <div
        role="link"
        tabIndex={0}
        onClick={() => { router.push(cookHref); }}
        onKeyDown={(e) => { if (e.key === 'Enter') router.push(cookHref); }}
      >
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0c14]/90 to-[#16101e]/90 backdrop-blur-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:border-purple-400/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/30">
          {/* Ambient planet glow */}
          <div
            className={`absolute -top-20 -right-20 w-64 h-64 ${planetGlow} rounded-full blur-[80px] pointer-events-none opacity-70`}
          />

          {/* Rank Badge */}
          <div className="absolute top-3 left-3 z-20">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-purple-900/40 border border-white/20">
              #{rank}
            </div>
          </div>

          {/* Score Badge */}
          <div className="absolute top-3 right-3 z-20">
            <div
              className={`px-3 py-1 ${scoreColor} text-white rounded-full font-black text-sm shadow-lg border`}
            >
              {cuisine.score}%
            </div>
          </div>

          {/* Header with gradient */}
          <div
            className={`relative h-32 bg-gradient-to-br ${headerGradient} overflow-hidden border-b border-white/5`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-25">
              <span className="text-8xl text-white drop-shadow-lg">{icon}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14]/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h3 className="text-2xl font-extrabold text-white drop-shadow-lg tracking-tight">
                {cuisine.cuisine}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3 relative z-10">
            {/* Planetary badge */}
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${planetBadge} backdrop-blur-sm`}
              >
                <span className="text-base">{icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {cuisine.planet} Ruled
                </span>
              </div>
              {cuisine.isRetrograde && (
                <span
                  className="inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-full"
                  title={`${cuisine.planet} is retrograde`}
                >
                  Rx
                </span>
              )}
            </div>

            {/* Reasoning */}
            <p className="text-sm text-white/70 leading-relaxed">
              {cuisine.reasoning}
            </p>

            {/* Flavor Profile */}
            <div className="pt-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/70 mb-2">
                Flavor Profile
              </p>
              <FlavorBars cuisineName={cuisine.cuisine} />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/50 font-medium">
                {cuisine.recipeCount > 0 ? (
                  <span>{cuisine.recipeCount} recipes</span>
                ) : (
                  <span>Explore cuisine</span>
                )}
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                {cuisine.optimalTiming}
              </div>
            </div>

            {/* Action Buttons — Cook It (amber/orange) vs Order It (purple/rose) */}
            <div
              className="grid grid-cols-2 gap-2 mt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={cookHref}
                className="group/btn relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-900/30 border border-amber-400/40 transition-all"
                aria-label={`Cook ${cuisine.cuisine} at home`}
              >
                <span aria-hidden className="text-base">🥘</span>
                Cook It
              </Link>
              <Link
                href={orderHref}
                className="group/btn relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-900/30 border border-purple-400/40 transition-all"
                aria-label={`Find ${cuisine.cuisine} restaurants near me`}
              >
                <span aria-hidden className="text-base">📍</span>
                Order It
              </Link>
            </div>
          </div>

          {/* Hover Preview */}
          {showPreview && cuisine.topRecipes.length > 0 && (
            <div className="absolute inset-0 z-30 bg-[#0c0c14]/95 backdrop-blur-sm p-5 flex flex-col justify-center rounded-2xl border border-purple-400/30">
              <h4 className="font-black text-purple-200 uppercase tracking-widest text-xs mb-3">
                Top Recipes
              </h4>
              <div className="space-y-2">
                {cuisine.topRecipes.map((recipe, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/80 font-medium truncate pr-2">
                      {recipe.name}
                    </span>
                    <span className="text-amber-300 font-black shrink-0">
                      {recipe.matchScore}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-purple-300 font-bold text-xs uppercase tracking-widest">
                  Click to explore &rarr;
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CuisineCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c14]/80 backdrop-blur-md overflow-hidden animate-pulse">
      <div className="h-32 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-8 bg-white/5 rounded-full w-3/4" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
        <div className="space-y-1.5 pt-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2 bg-white/5 rounded w-10" />
              <div className="flex-1 h-1.5 bg-white/5 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="h-10 bg-white/5 rounded-xl" />
          <div className="h-10 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default CuisineCard;
