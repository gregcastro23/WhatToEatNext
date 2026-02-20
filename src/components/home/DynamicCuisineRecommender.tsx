"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import { CuisineCard, CuisineCardSkeleton } from "./CuisineCard";
import type { DynamicCuisineRecommendation } from "./CuisineCard";

// Cuisine definitions with planetary rulerships
// These must match the 14 actual cuisine data files in src/data/cuisines/
const CUISINE_DEFINITIONS = [
  { name: "Italian", planet: "Venus", tags: ["pasta", "comfort", "indulgent"] },
  { name: "Thai", planet: "Mars", tags: ["spicy", "bold", "aromatic"] },
  {
    name: "Japanese",
    planet: "Mercury",
    tags: ["light", "balanced", "precise"],
  },
  { name: "Mexican", planet: "Mars", tags: ["spicy", "vibrant", "festive"] },
  { name: "French", planet: "Venus", tags: ["elegant", "refined", "rich"] },
  {
    name: "Indian",
    planet: "Jupiter",
    tags: ["abundant", "complex", "aromatic"],
  },
  {
    name: "American",
    planet: "Sun",
    tags: ["hearty", "diverse", "bold"],
  },
  {
    name: "Chinese",
    planet: "Jupiter",
    tags: ["varied", "abundant", "balanced"],
  },
  {
    name: "Middle Eastern",
    planet: "Saturn",
    tags: ["traditional", "grounding", "wholesome"],
  },
  { name: "Greek", planet: "Sun", tags: ["fresh", "light", "citrus"] },
  { name: "Korean", planet: "Mars", tags: ["fermented", "bold", "umami"] },
  {
    name: "African",
    planet: "Jupiter",
    tags: ["spiced", "communal", "aromatic"],
  },
  { name: "Vietnamese", planet: "Mercury", tags: ["fresh", "herbal", "light"] },
  {
    name: "Russian",
    planet: "Saturn",
    tags: ["hearty", "warming", "traditional"],
  },
];

const CUISINE_QUALITIES: Record<string, string> = {
  Italian: "favors indulgent pasta and rich sauces",
  Thai: "favors bold spices and aromatic herbs",
  Japanese: "favors precision and balanced flavors",
  Mexican: "favors vibrant, festive dishes",
  French: "favors refined techniques and elegance",
  Indian: "favors abundant spices and complex flavors",
  American: "favors hearty, diverse flavors and comfort food",
  Chinese: "favors variety and balance",
  "Middle Eastern": "favors traditional, grounding meals",
  Greek: "favors fresh, citrus-forward dishes",
  Korean: "favors bold fermented and umami flavors",
  African: "favors communal dining with complex spices",
  Vietnamese: "favors fresh herbs and delicate broths",
  Russian: "favors warming, hearty traditional dishes",
};

const OPTIMAL_TIMINGS: Record<string, string> = {
  Sun: "Best 7-9 AM or 1-3 PM",
  Moon: "Best 6-8 PM",
  Mars: "Best 7-9 PM",
  Mercury: "Best 12-2 PM",
  Jupiter: "Best 5-7 PM",
  Venus: "Best 4-6 PM or 7-9 PM",
  Saturn: "Best 6-8 AM",
};

const DIGNITIES: Record<string, { domicile: string[]; exaltation: string[] }> =
  {
    Sun: { domicile: ["leo"], exaltation: ["aries"] },
    Moon: { domicile: ["cancer"], exaltation: ["taurus"] },
    Mercury: { domicile: ["gemini", "virgo"], exaltation: ["virgo"] },
    Venus: { domicile: ["taurus", "libra"], exaltation: ["pisces"] },
    Mars: { domicile: ["aries", "scorpio"], exaltation: ["capricorn"] },
    Jupiter: { domicile: ["sagittarius", "pisces"], exaltation: ["cancer"] },
    Saturn: { domicile: ["capricorn", "aquarius"], exaltation: ["libra"] },
  };

function calculateDignity(planet: string, sign: string): number {
  const dignity = DIGNITIES[planet];
  if (!dignity) return 0.6;
  const s = (sign || "").toLowerCase();
  if (dignity.domicile.includes(s)) return 1.0;
  if (dignity.exaltation.includes(s)) return 0.9;
  return 0.6;
}

function getTimingScore(cuisine: string, hour: number): number {
  const lightCuisines = ["Japanese", "Greek", "Vietnamese", "Chinese"];
  const heartyCuisines = [
    "Italian",
    "Indian",
    "Mexican",
    "French",
    "American",
    "Russian",
    "African",
  ];

  if (hour >= 6 && hour < 10) {
    return lightCuisines.includes(cuisine) ? 1.0 : 0.5;
  }
  if (hour >= 18 && hour < 21) {
    return heartyCuisines.includes(cuisine) ? 1.0 : 0.6;
  }
  return 0.7;
}

function generateReasoning(
  cuisine: string,
  planet: string,
  sign: string,
  dignityScore: number,
  isCurrentHour: boolean,
  isRetrograde: boolean,
): string {
  const parts: string[] = [];
  if (dignityScore >= 0.9) {
    parts.push(`${planet} is strong in ${sign}`);
  }
  if (isCurrentHour) {
    parts.push(`current ${planet} hour enhances these flavors`);
  }
  if (isRetrograde) {
    parts.push(`${planet} retrograde favors familiar preparations`);
  }
  parts.push(CUISINE_QUALITIES[cuisine] || "offers excellent variety");
  return parts.join(", ");
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 300) return `${Math.floor(seconds / 60)} minutes ago`;
  return "recently";
}

interface DynamicCuisineRecommenderProps {
  onDoubleClickCuisine?: (cuisineName: string) => void;
}

export default function DynamicCuisineRecommender({ onDoubleClickCuisine }: DynamicCuisineRecommenderProps = {}) {
  const [recommendations, setRecommendations] = useState<
    DynamicCuisineRecommendation[]
  >([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = PlanetaryScoringService.getInstance();
      const recipeService = UnifiedRecipeService.getInstance();
      const positions = await service.getCurrentPlanetaryPositions();

      // Calculate current planetary hour
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      const dayRulers = [
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
      ];
      const chaldeanOrder = [
        "Saturn",
        "Jupiter",
        "Mars",
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
      ];
      const dayRuler = dayRulers[dayOfWeek];
      const rulerIdx = chaldeanOrder.indexOf(dayRuler);
      const hourIdx = (rulerIdx + hour) % 7;
      const planetaryHour = chaldeanOrder[hourIdx];

      const currentHour = now.getHours();

      const scored: DynamicCuisineRecommendation[] = [];
      for (const cuisine of CUISINE_DEFINITIONS) {
        const planetPos = positions.find(
          (p: any) => p.planet === cuisine.planet,
        );
        const sign = planetPos
          ? typeof planetPos.sign === "string"
            ? planetPos.sign
            : "aries"
          : "aries";
        const isRetrograde = planetPos?.isRetrograde === true;

        const dignityScore = calculateDignity(cuisine.planet, sign);
        const isCurrentHourPlanet = planetaryHour === cuisine.planet;
        const hourBonus = isCurrentHourPlanet ? 0.2 : 0;
        const timingScore = getTimingScore(cuisine.name, currentHour);
        const retrogradeModifier = isRetrograde ? -0.05 : 0;

        const totalScore = Math.round(
          Math.min(
            (dignityScore * 0.6 +
              timingScore * 0.2 +
              hourBonus * 0.2 +
              retrogradeModifier) *
              100,
            99,
          ),
        );

        const reasoning = generateReasoning(
          cuisine.name,
          cuisine.planet,
          sign,
          dignityScore,
          isCurrentHourPlanet,
          isRetrograde,
        );

        // Get real recipe count and score top recipes for this cuisine
        let recipeCount = 0;
        let topRecipes: Array<{ name: string; matchScore: number }> = [];
        try {
          const cuisineRecipes = await recipeService.getRecipesForCuisine(
            cuisine.name.toLowerCase(),
          );
          recipeCount = cuisineRecipes.length;

          // Score a sample of recipes and pick the top 5
          const sampleSize = Math.min(cuisineRecipes.length, 15);
          const sample = cuisineRecipes.slice(0, sampleSize);
          const scoredSample = await Promise.all(
            sample.map(async (r) => {
              try {
                const result = await service.scoreRecipe(r as any);
                return { name: r.name || "Unknown", matchScore: result.overallScore };
              } catch {
                return { name: r.name || "Unknown", matchScore: totalScore };
              }
            }),
          );
          scoredSample.sort((a, b) => b.matchScore - a.matchScore);
          topRecipes = scoredSample.slice(0, 5);
        } catch {
          recipeCount = 0;
        }

        scored.push({
          cuisine: cuisine.name,
          score: Math.max(totalScore, 1),
          planet: cuisine.planet,
          reasoning,
          recipeCount,
          optimalTiming: OPTIMAL_TIMINGS[cuisine.planet] || "Anytime today",
          topRecipes,
          isRetrograde,
        });
      }

      const filteredAndScored = scored.filter(cuisine => cuisine.recipeCount > 0);
      filteredAndScored.sort((a, b) => b.score - a.score);
      setRecommendations(filteredAndScored);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dynamic cuisine recommendations:", error);
      setRecommendations(
        CUISINE_DEFINITIONS.map((c, i) => ({
          cuisine: c.name,
          score: 80 - i * 3,
          planet: c.planet,
          reasoning: CUISINE_QUALITIES[c.name] || "Great variety",
          recipeCount: 0,
          optimalTiming: OPTIMAL_TIMINGS[c.planet] || "Anytime",
          topRecipes: [],
          isRetrograde: false,
        })),
      );
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
    const interval = setInterval(loadRecommendations, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRecommendations]);

  const topCuisines = recommendations.slice(0, 6);
  const remainingCuisines = recommendations.slice(6);

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2
          id="dynamic-cuisine-heading"
          className="text-3xl font-bold text-gray-900 mb-3"
        >
          Cuisines Aligned with the Cosmos
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Recommendations powered by real-time planetary positions. Updated{" "}
          {getTimeAgo(lastUpdated)}.
        </p>

        {/* Live indicator */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-green-800">
            Live planetary scoring
          </span>
        </div>
      </div>

      {/* Top 6 Cuisine Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CuisineCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCuisines.map((cuisine, index) => (
              <CuisineCard
                key={cuisine.cuisine}
                cuisine={cuisine}
                rank={index + 1}
                onDoubleClickCuisine={onDoubleClickCuisine}
              />
            ))}
          </div>

          {/* Remaining Cuisines - Collapsible */}
          {remainingCuisines.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowAllCuisines(!showAllCuisines)}
                className="mx-auto flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showAllCuisines
                  ? "Show fewer"
                  : `Show ${remainingCuisines.length} more cuisines`}
                <span
                  className={`transition-transform duration-200 ${showAllCuisines ? "rotate-180" : ""}`}
                >
                  &#9660;
                </span>
              </button>
              {showAllCuisines && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {remainingCuisines.map((cuisine, index) => (
                    <CuisineCard
                      key={cuisine.cuisine}
                      cuisine={cuisine}
                      rank={index + 7}
                      compact
                      onDoubleClickCuisine={onDoubleClickCuisine}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={loadRecommendations}
          disabled={isLoading}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          <span className={isLoading ? "animate-spin inline-block" : ""}>
            &#x21bb;
          </span>
          {isLoading ? "Updating..." : "Refresh Recommendations"}
        </button>
      </div>
    </div>
  );
}
