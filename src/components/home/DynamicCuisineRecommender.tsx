"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getServerRecipes } from "@/actions/recipes";
import { biasQueryParam, useUserElementalBias } from "@/hooks/useUserElementalBias";
import { PlanetaryScoringService } from "@/services/planetaryScoring";
import { fetchWithRetry } from "@/utils/apiUtils";
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
  selectedCuisine?: string | null;
  onSelectCuisine?: (cuisineName: string | null) => void;
  onDoubleClickCuisine?: (cuisineName: string) => void;
}

export default function DynamicCuisineRecommender({
  selectedCuisine,
  onSelectCuisine,
  onDoubleClickCuisine,
}: DynamicCuisineRecommenderProps = {}) {
  const [recommendations, setRecommendations] = useState<
    DynamicCuisineRecommendation[]
  >([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showAllCuisines, setShowAllCuisines] = useState(false);
  const [personalized, setPersonalized] = useState(false);

  // The visitor's elemental bias (chart and/or guest table) rides the request
  // as a query param so the server reorders the ranking for their table.
  const { bias, source: biasSource, hydrated: biasHydrated } = useUserElementalBias();
  const biasParam = useMemo(() => biasQueryParam(bias), [bias]);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    console.log("DynamicCuisineRecommender: Starting to load recommendations from unified API...");
    try {
      // Phase 1: Call the unified API endpoint (which handles backend + local fallback)
      const response = await fetchWithRetry(
        biasParam
          ? `/api/cuisines/recommend?bias=${encodeURIComponent(biasParam)}`
          : "/api/cuisines/recommend",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
          retries: 2,
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("DynamicCuisineRecommender: API response received:", data.source);

      if (data.success) {
        setPersonalized(Boolean(data.personalized));
        // Map API response to our component's format
        // The backend might return cuisines in several possible fields depending on the engine
        const apiCuisines: any[] =
          Array.isArray(data.recommendations?.cuisines) ? data.recommendations.cuisines :
          Array.isArray(data.cuisines) ? data.cuisines :
          Array.isArray(data.topCuisines) ? data.topCuisines :
          Array.isArray(data.cuisineRecommendations) ? data.cuisineRecommendations :
          Array.isArray(data.recommendations) ? data.recommendations :
          [];
        
        const recipeCounts = data.recipeCounts || {};

        if (apiCuisines.length === 0) {
          console.warn("DynamicCuisineRecommender: API response contained no cuisines. Raw data:", data);
        }

        // If we got a valid response with cuisines, use it
        if (apiCuisines.length > 0) {
          const mapped: DynamicCuisineRecommendation[] = [];

          for (const def of CUISINE_DEFINITIONS) {
            const nameLower = def.name.toLowerCase();
            const count = recipeCounts[nameLower] || 0;

            const isRecommended = apiCuisines.some(c => {
              const cName = typeof c === 'string' ? c : (c?.name || c?.cuisine_id || '');
              return typeof cName === 'string' && cName.toLowerCase() === nameLower;
            });
            
            const recommendationIndex = apiCuisines.findIndex(c => {
              const cName = typeof c === 'string' ? c : (c?.name || c?.cuisine_id || '');
              return typeof cName === 'string' && cName.toLowerCase() === nameLower;
            });

            let score = 70; // Default
            if (isRecommended) {
              score = 95 - (recommendationIndex * 5);
            } else {
              score = 60;
            }

            // Get the actual recommendation object from the API response
            const recommendationObj = recommendationIndex !== -1 ? apiCuisines[recommendationIndex] : null;
            
            // Map nested recipes if available
            const topRecipes = (recommendationObj?.nested_recipes || []).map((r: any) => ({
              id: r.recipe_id || r.id,
              name: r.name,
              matchScore: 95 // Backend recommends these highly
            }));

            mapped.push({
              cuisine: def.name,
              score: Math.max(score, 1),
              planet: def.planet,
              reasoning: recommendationObj?.compatibility_reason || CUISINE_QUALITIES[def.name] || `A fine ${def.name} selection.`,
              recipeCount: count,
              optimalTiming: OPTIMAL_TIMINGS[def.planet] || "Anytime today",
              topRecipes,
              isRetrograde: false
            });
          }

          mapped.sort((a, b) => b.score - a.score);
          setRecommendations(mapped);
          setLastUpdated(new Date());
          console.log(`DynamicCuisineRecommender: Successfully mapped ${mapped.length} cuisines from API (${data.source})`);
          setIsLoading(false);
          return;
        }
      }

      // If we reach here, the API response was not in the expected format — trigger legacy fallback
      throw new Error("API response lacked usable cuisine data or success=false");

    } catch (error) {
      console.warn("DynamicCuisineRecommender: API call failed, falling back to legacy logic:", error);

      try {
        const service = PlanetaryScoringService.getInstance();
        const allRecipes = await getServerRecipes();

        // Fallback Phase 1: Load recipe counts
        const recipeCountsMap = new Map<string, number>();
        for (const cuisine of CUISINE_DEFINITIONS) {
          try {
            const cuisineRecipes = allRecipes.filter((r: any) =>
              r.cuisine?.toLowerCase().includes(cuisine.name.toLowerCase())
            );
            recipeCountsMap.set(cuisine.name, cuisineRecipes.length);
          } catch {
            recipeCountsMap.set(cuisine.name, 0);
          }
        }

        // Fallback Phase 2: Fetch positions
        let positions: any[] = [];
        try {
          positions = await service.getCurrentPlanetaryPositions();
        } catch (posError) {
          console.warn("DynamicCuisineRecommender: Fallback positions unavailable", posError);
        }

        // Calculate fallback scores
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const dayRulers = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
        const chaldeanOrder = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
        const dayRuler = dayRulers[dayOfWeek];
        const rulerIdx = chaldeanOrder.indexOf(dayRuler);
        const planetaryHour = chaldeanOrder[(rulerIdx + hour) % 7];

        const scored: DynamicCuisineRecommendation[] = [];
        for (const cuisine of CUISINE_DEFINITIONS) {
          const count = recipeCountsMap.get(cuisine.name) || 0;
          let sign = "aries";
          let isRetrograde = false;

          const planetPos = positions.find((p: any) => p.planet === cuisine.planet);
          if (planetPos) {
            sign = typeof planetPos.sign === "string" ? planetPos.sign : "aries";
            isRetrograde = planetPos.isRetrograde === true;
          }

          const dignityScore = calculateDignity(cuisine.planet, sign);
          const isCurrentHourPlanet = planetaryHour === cuisine.planet;
          const timingScore = getTimingScore(cuisine.name, hour);

          const totalScore = Math.round(
            Math.min((dignityScore * 0.6 + timingScore * 0.2 + (isCurrentHourPlanet ? 0.2 : 0)) * 100, 99)
          );

          scored.push({
            cuisine: cuisine.name,
            score: Math.max(totalScore, 1),
            planet: cuisine.planet,
            reasoning: generateReasoning(cuisine.name, cuisine.planet, sign, dignityScore, isCurrentHourPlanet, isRetrograde),
            recipeCount: count,
            optimalTiming: OPTIMAL_TIMINGS[cuisine.planet] || "Anytime today",
            topRecipes: [],
            isRetrograde,
          });
        }

        scored.sort((a, b) => b.score - a.score);
        setRecommendations(scored);
        setLastUpdated(new Date());
      } catch (innerError) {
        console.error("DynamicCuisineRecommender: CRITICAL ERROR in fallback logic:", innerError);

        // Final emergency fallback
        const fallback: DynamicCuisineRecommendation[] = CUISINE_DEFINITIONS.map((c, i) => ({
          cuisine: c.name,
          score: 80 - i,
          planet: c.planet,
          reasoning: CUISINE_QUALITIES[c.name] || "Great variety",
          recipeCount: 0,
          optimalTiming: OPTIMAL_TIMINGS[c.planet] || "Anytime",
          topRecipes: [],
          isRetrograde: false,
        }));
        setRecommendations(fallback);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
  }, [biasParam]);

  useEffect(() => {
    // Wait for the bias to hydrate from localStorage so the first request
    // already carries the visitor's table instead of double-fetching.
    if (!biasHydrated) return;
    void loadRecommendations();
    const interval = setInterval(() => { void loadRecommendations(); }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRecommendations, biasHydrated]);

  const topCuisines = recommendations.slice(0, 6);
  const remainingCuisines = recommendations.slice(6);

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2
          id="dynamic-cuisine-heading"
          className="text-3xl font-bold text-white mb-3"
        >
          Cuisines Aligned with the Cosmos
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Recommendations powered by real-time planetary positions. Updated{" "}
          {getTimeAgo(lastUpdated)}.
        </p>

        {/* Live indicator */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-emerald-300">
            {personalized
              ? biasSource === "chart"
                ? "Live planetary scoring · tuned to your chart"
                : "Live planetary scoring · tuned to your table"
              : "Live planetary scoring"}
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
                selectedCuisine={selectedCuisine}
                onSelectCuisine={onSelectCuisine}
                onDoubleClickCuisine={onDoubleClickCuisine}
              />
            ))}
          </div>

          {/* Remaining Cuisines - Collapsible */}
          {remainingCuisines.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowAllCuisines(!showAllCuisines)}
                className="mx-auto flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg transition-colors"
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
                      selectedCuisine={selectedCuisine}
                      onSelectCuisine={onSelectCuisine}
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
          onClick={() => { void loadRecommendations(); }}
          disabled={isLoading}
          className="px-6 py-3 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
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
