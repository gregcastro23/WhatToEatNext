"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useEnhancedRecommendations } from "@/hooks/useEnhancedRecommendations";

interface KalchmRecommenderProps {
  maxRecommendations?: number;
  showFilters?: boolean;
  showScoring?: boolean;
}

export const KalchmRecommender: React.FC<KalchmRecommenderProps> = ({
  maxRecommendations = 18,
  showFilters = false,
  showScoring = true,
}) => {
  const [view, setView] = useState<"all" | "top">("all");
  const [sortBy, setSortBy] = useState<"score" | "name" | "time">("score");

  // Hooks
  const { recommendations, loading, error, getRecommendations } =
    useEnhancedRecommendations();

  // Get alchemical context (with null check)
  let alchemicalContext;
  try {
    alchemicalContext = useAlchemical();
  } catch {
    alchemicalContext = null;
  }

  // Fetch recommendations on mount
  useEffect(() => {
    void getRecommendations({
      datetime: new Date().toISOString(),
      useBackendInfluence: true,
    });
  }, [getRecommendations]);

  // Sorted recommendations
  const sortedRecommendations = useMemo(() => {
    if (!recommendations?.recommendations) return [];

    const items = [...recommendations.recommendations];

    items.sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score;
      } else if (sortBy === "name") {
        return a.recipe.name.localeCompare(b.recipe.name);
      } else if (sortBy === "time") {
        return a.recipe.cookingTime - b.recipe.cookingTime;
      }
      return 0;
    });

    const filtered = view === "top" ? items.slice(0, 5) : items;
    return filtered.slice(0, maxRecommendations);
  }, [recommendations, sortBy, view, maxRecommendations]);

  // Render current moment summary
  const renderCurrentMoment = () => {
    if (!recommendations?.astrologicalContext && !alchemicalContext)
      return null;

    const astroContext = recommendations?.astrologicalContext;

    return (
      <div className="mb-6 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">
          Current Alchemical Moment
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {astroContext?.dominantElement && (
            <div>
              <div className="text-sm text-gray-600">Dominant Element</div>
              <div className="font-medium text-gray-900">
                {astroContext.dominantElement}
              </div>
            </div>
          )}
          {astroContext?.planetaryHour && (
            <div>
              <div className="text-sm text-gray-600">Planetary Hour</div>
              <div className="font-medium text-gray-900">
                {astroContext.planetaryHour}
              </div>
            </div>
          )}
          {astroContext?.lunarPhase && (
            <div>
              <div className="text-sm text-gray-600">Lunar Phase</div>
              <div className="font-medium text-gray-900 capitalize">
                {astroContext.lunarPhase}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render recommendation card
  const renderRecommendationCard = (
    item: (typeof sortedRecommendations)[0],
    index: number,
  ) => {
    const {
      recipe,
      score,
      reasons,
      alchemicalCompatibility,
      astrologicalAlignment,
    } = item;

    return (
      <div
        key={recipe.id || index}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              {recipe.name}
            </h4>
            <p className="text-sm text-gray-500">{recipe.cuisine}</p>
          </div>
          {showScoring && (
            <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
              {(score * 100).toFixed(0)}%
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="mb-3 text-sm text-gray-600">{recipe.description}</p>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {recipe.cookingTime} min
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {recipe.difficulty}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
            ⭐ {recipe.rating.toFixed(1)}
          </span>
        </div>

        {showScoring && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">
                Alchemical:
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${alchemicalCompatibility * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {(alchemicalCompatibility * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">
                Astrological:
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${astrologicalAlignment * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {(astrologicalAlignment * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {reasons && reasons.length > 0 && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="text-xs font-medium text-gray-600">
              Why recommended:
            </div>
            <ul className="mt-1 space-y-1">
              {reasons.slice(0, 2).map((reason, idx) => (
                <li key={idx} className="text-xs text-gray-500">
                  • {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-indigo-600" />
          <p className="text-gray-600">
            Calculating alchemical recommendations...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-800">
          Error Loading Recommendations
        </h3>
        <p className="text-red-600">
          {error || "An unexpected error occurred"}
        </p>
        <button
          onClick={() =>
            getRecommendations({
              datetime: new Date().toISOString(),
              useBackendInfluence: true,
            })
          }
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-6">
      {renderCurrentMoment()}

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView("all")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              view === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Recommendations
          </button>
          <button
            onClick={() => setView("top")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              view === "top"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Top 5
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "score" | "name" | "time")
          }
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="score">Sort by Score</option>
          <option value="name">Sort by Name</option>
          <option value="time">Sort by Time</option>
        </select>
      </div>

      {/* Recommendations grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedRecommendations.map((item, index) =>
          renderRecommendationCard(item, index),
        )}
      </div>

      {sortedRecommendations.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No recommendations available at this time.
        </div>
      )}
    </div>
  );
};

export default KalchmRecommender;
