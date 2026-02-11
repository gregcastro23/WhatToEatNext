"use client";

import React, { useState } from "react";
import Link from "next/link";

const PLANET_ICONS: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Moon: "text-blue-400 bg-blue-50 border-blue-200",
  Mercury: "text-gray-600 bg-gray-50 border-gray-200",
  Venus: "text-pink-500 bg-pink-50 border-pink-200",
  Mars: "text-red-600 bg-red-50 border-red-200",
  Jupiter: "text-orange-500 bg-orange-50 border-orange-200",
  Saturn: "text-gray-700 bg-gray-50 border-gray-300",
};

const GRADIENT_COLORS: Record<string, string> = {
  Sun: "from-yellow-400 to-amber-500",
  Moon: "from-blue-400 to-indigo-500",
  Mercury: "from-gray-400 to-slate-500",
  Venus: "from-pink-400 to-rose-500",
  Mars: "from-red-500 to-orange-600",
  Jupiter: "from-orange-400 to-amber-600",
  Saturn: "from-gray-500 to-slate-600",
};

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
}

export function CuisineCard({ cuisine, rank, compact }: CuisineCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const icon = PLANET_ICONS[cuisine.planet] || "\u2609";
  const colorClass = PLANET_COLORS[cuisine.planet] || PLANET_COLORS.Sun;
  const gradient = GRADIENT_COLORS[cuisine.planet] || GRADIENT_COLORS.Sun;

  const scoreColor =
    cuisine.score >= 85
      ? "bg-green-500"
      : cuisine.score >= 70
        ? "bg-amber-500"
        : "bg-gray-400";

  if (compact) {
    return (
      <Link
        href={`/recipes?cuisine=${encodeURIComponent(cuisine.cuisine.toLowerCase())}`}
      >
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 hover:border-amber-300 cursor-pointer p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <h3 className="font-semibold text-gray-900">{cuisine.cuisine}</h3>
              {cuisine.isRetrograde && (
                <span
                  className="text-xs text-amber-600"
                  title={`${cuisine.planet} retrograde`}
                >
                  Rx
                </span>
              )}
            </div>
            <div
              className={`px-2 py-0.5 ${scoreColor} text-white rounded-full text-xs font-bold`}
            >
              {cuisine.score}%
            </div>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {cuisine.reasoning}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            {cuisine.recipeCount > 0 && (
              <span>{cuisine.recipeCount} recipes</span>
            )}
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
    >
      <Link
        href={`/recipes?cuisine=${encodeURIComponent(cuisine.cuisine.toLowerCase())}`}
      >
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-amber-300 cursor-pointer transform hover:-translate-y-1">
          {/* Rank Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              #{rank}
            </div>
          </div>

          {/* Score Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div
              className={`px-3 py-1 ${scoreColor} text-white rounded-full font-bold text-sm shadow-lg`}
            >
              {cuisine.score}%
            </div>
          </div>

          {/* Header with gradient */}
          <div
            className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-8xl text-white">{icon}</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                {cuisine.cuisine}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Planetary indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass}`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-semibold">
                  {cuisine.planet} Ruled
                </span>
              </div>
              {cuisine.isRetrograde && (
                <span
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full"
                  title={`${cuisine.planet} is retrograde`}
                >
                  Rx
                </span>
              )}
            </div>

            {/* Reasoning */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {cuisine.reasoning}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {cuisine.recipeCount > 0 ? (
                  <span>{cuisine.recipeCount} recipes</span>
                ) : (
                  <span>Explore cuisine</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {cuisine.optimalTiming}
              </div>
            </div>
          </div>

          {/* Hover Preview */}
          {showPreview && cuisine.topRecipes.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm p-5 flex flex-col justify-center rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">Top Recipes:</h4>
              <div className="space-y-2">
                {cuisine.topRecipes.map((recipe, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{recipe.name}</span>
                    <span className="text-amber-600 font-medium">
                      {recipe.matchScore}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-amber-600 font-medium text-sm">
                  Click to explore &rarr;
                </span>
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default CuisineCard;
