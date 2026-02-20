"use client";

import React from "react";

interface PersonalizationInsightsProps {
  learningStats: {
    totalInteractions: number;
    confidence: number;
    lastActivity: number;
  };
  preferences?: {
    cuisines: string[];
    planetaryPreferences: Record<string, number>;
  };
}

export const PersonalizationInsights: React.FC<
  PersonalizationInsightsProps
> = ({ learningStats, preferences }) => {
  const confidencePercentage = (learningStats.confidence * 100).toFixed(0);
  const lastActivityDate = new Date(learningStats.lastActivity);
  const daysSinceActivity = Math.floor(
    (Date.now() - learningStats.lastActivity) / (1000 * 60 * 60 * 24),
  );

  // Determine confidence level
  const getConfidenceLevel = (confidence: number) => {
    if (confidence < 0.3)
      return {
        level: "Building",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    if (confidence < 0.6)
      return { level: "Good", color: "text-green-600", bg: "bg-green-100" };
    if (confidence < 0.8)
      return { level: "Strong", color: "text-blue-600", bg: "bg-blue-100" };
    return {
      level: "Excellent",
      color: "text-purple-600",
      bg: "bg-purple-100",
    };
  };

  const confidenceInfo = getConfidenceLevel(learningStats.confidence);

  // Get top planetary preferences
  const topPlanets = preferences?.planetaryPreferences
    ? Object.entries(preferences.planetaryPreferences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  return (
    <div className="alchm-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold alchm-gradient-text mb-2">
          Personalization Insights
        </h2>
        <p className="text-gray-600 mb-6">
          Your learning progress and recommendation accuracy
        </p>

        {/* Learning Confidence */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Learning Confidence
            </span>
            <span className={`text-sm font-bold ${confidenceInfo.color}`}>
              {confidenceInfo.level}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 transition-all duration-500"
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs font-semibold text-gray-700">
              {confidencePercentage}%
            </span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`${confidenceInfo.bg} rounded-lg p-4 text-center`}>
            <div className="text-3xl font-bold text-gray-800">
              {learningStats.totalInteractions}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Interactions</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-800">
              {daysSinceActivity === 0 ? "Today" : `${daysSinceActivity}d`}
            </div>
            <div className="text-sm text-gray-600 mt-1">Last Activity</div>
          </div>
        </div>

        {/* Insights Messages */}
        <div className="space-y-3">
          {learningStats.confidence < 0.3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Building Your Profile
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Interact with more recipes and ingredients to improve
                    recommendation accuracy. We need more data to learn your
                    preferences better.
                  </p>
                </div>
              </div>
            </div>
          )}

          {learningStats.confidence >= 0.6 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">
                    Great Progress!
                  </h4>
                  <p className="text-sm text-green-700">
                    We have a good understanding of your preferences.
                    Recommendations are getting more personalized with each
                    interaction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {learningStats.confidence >= 0.8 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">
                    Excellent Match!
                  </h4>
                  <p className="text-sm text-purple-700">
                    Our recommendations are highly personalized to your taste.
                    Keep exploring to discover new favorites that match your
                    preferences.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Cuisine Preferences */}
      {preferences?.cuisines && preferences.cuisines.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-700 mb-3">Top Cuisines</h3>
          <div className="flex flex-wrap gap-2">
            {preferences.cuisines.slice(0, 5).map((cuisine, index) => (
              <span
                key={cuisine}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {index === 0 && "🥇 "}
                {index === 1 && "🥈 "}
                {index === 2 && "🥉 "}
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Planetary Preferences */}
      {topPlanets.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Planetary Affinities
          </h3>
          <div className="space-y-2">
            {topPlanets.map(([planet, score]) => (
              <div key={planet} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-20">
                  {planet}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                    style={{ width: `${(score * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {(score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Tip */}
      <div className="border-t border-gray-200 pt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔮</span>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Pro Tip</h4>
              <p className="text-sm text-blue-700">
                The more you interact with recipes, ingredients, and cooking
                methods, the better we can personalize recommendations. Save
                favorites, rate dishes, and explore new cuisines to enhance your
                experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
