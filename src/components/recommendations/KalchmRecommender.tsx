"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useUser } from "@/contexts/UserContext";
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Hooks
  const { recommendations, loading, error, getRecommendations } =
    useEnhancedRecommendations();
  const { currentUser } = useUser();

  // Get alchemical context (hook must be called unconditionally)
  const alchemicalContext = useAlchemical();

  // Get dining groups from user profile
  const diningGroups = currentUser?.diningGroups || [];
  const groupMembers = currentUser?.groupMembers || [];

  // Get selected group details
  const selectedGroup = diningGroups.find((g) => g.id === selectedGroupId);
  const isGroupMode = selectedGroupId !== null;

  // Fetch recommendations when group selection changes
  useEffect(() => {
    void getRecommendations({
      datetime: new Date().toISOString(),
      useBackendInfluence: true,
      groupId: selectedGroupId || undefined,
    });
  }, [getRecommendations, selectedGroupId]);

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
    const groupContext = recommendations?.groupContext;

    return (
      <div className="mb-6 space-y-4">
        {/* Group Mode Indicator */}
        {isGroupMode && groupContext && (
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-purple-900">
              Group Mode: {groupContext.groupName}
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm text-purple-700">Members</div>
                <div className="font-medium text-purple-900">
                  {groupContext.memberCount}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-700">Dominant Element</div>
                <div className="font-medium text-purple-900">
                  {groupContext.dominantElement}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-700">Group Harmony</div>
                <div className="font-medium text-purple-900">
                  {(groupContext.harmony * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-700">Mode</div>
                <div className="font-medium text-purple-900">
                  Group Recommendations
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Astrological Context */}
        <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
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
      groupScore,
      harmony,
      memberScores,
    } = item;

    const displayScore =
      isGroupMode && groupScore !== undefined ? groupScore : score;
    const isBestForEveryone =
      isGroupMode && memberScores
        ? Math.min(...memberScores.map((ms) => ms.score)) >= 0.6
        : false;

    return (
      <div
        key={recipe.id || index}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900">
                {recipe.name}
              </h4>
              {isBestForEveryone && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  ✓ Best for everyone
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{recipe.cuisine}</p>
          </div>
          {showScoring && (
            <div className="flex flex-col items-end gap-1">
              <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                {(displayScore * 100).toFixed(0)}%
              </div>
              {isGroupMode && harmony !== undefined && (
                <div className="text-xs text-gray-600">
                  Harmony: {(harmony * 100).toFixed(0)}%
                </div>
              )}
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

        {/* Group member scores */}
        {isGroupMode && memberScores && memberScores.length > 0 && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <details className="cursor-pointer">
              <summary className="text-xs font-medium text-gray-600">
                Per-member scores ({memberScores.length})
              </summary>
              <div className="mt-2 space-y-2">
                {memberScores.map((memberScore) => {
                  const scoreColor =
                    memberScore.score >= 0.7
                      ? "text-green-700 bg-green-50"
                      : memberScore.score >= 0.5
                        ? "text-yellow-700 bg-yellow-50"
                        : "text-red-700 bg-red-50";

                  return (
                    <div
                      key={memberScore.memberId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-gray-700">
                        {memberScore.memberName}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${scoreColor}`}
                      >
                        {(memberScore.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </details>
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
          onClick={() => {
            void getRecommendations({
              datetime: new Date().toISOString(),
              useBackendInfluence: true,
            });
          }}
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
      <div className="mb-6 space-y-4">
        {/* Group Selector */}
        {diningGroups.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Recommendation Mode
            </label>
            <select
              value={selectedGroupId || "individual"}
              onChange={(e) =>
                setSelectedGroupId(
                  e.target.value === "individual" ? null : e.target.value,
                )
              }
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm md:w-auto"
            >
              <option value="individual">Individual (just me)</option>
              {diningGroups.map((group) => {
                const members = groupMembers.filter((m) =>
                  group.memberIds.includes(m.id),
                );
                return (
                  <option key={group.id} value={group.id}>
                    Group: {group.name} ({members.length} members)
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* View and Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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
