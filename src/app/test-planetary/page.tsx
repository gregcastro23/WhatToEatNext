"use client";

import { usePlanetaryKinetics } from "@/hooks/usePlanetaryKinetics";
import { useEffect, useState } from "react";

import { fetchAstrologicalRecipes } from "@/services/astrologizeApi";

export default function TestPlanetaryPage() {
  const {
    kinetics,
    isLoading,
    error,
    isOnline,
    lastUpdate,
    currentPowerLevel,
    dominantElement,
    seasonalInfluence,
    refreshKinetics,
    checkHealth,
  } = usePlanetaryKinetics({
    location: { lat: 40.7128, lon: -74.006 }, // NYC
    updateInterval: 60000, // Update every minute
    enableAutoUpdate: false, // Manual control for testing
  });

  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Recipe State
  const [recipeData, setRecipeData] = useState<any>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  useEffect(() => {
    // Check health on mount
    void checkHealth().then(setHealthStatus);
  }, [checkHealth]);

  const handleRefresh = async () => {
    await refreshKinetics();
    const health = await checkHealth();
    setHealthStatus(health);
  };

  const handleGenerateRecipes = async () => {
    setRecipeLoading(true);
    setRecipeError(null);
    setRecipeData(null);

    try {
      // Use current time and default NYC location (or from kinetics if available)
      const now = new Date();
      const recipes = await fetchAstrologicalRecipes({
        latitude: 40.7128,
        longitude: -74.006,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
      } as any);

      if (recipes.error) {
        setRecipeError(recipes.error);
      } else {
        setRecipeData(recipes);
      }
    } catch (err) {
      setRecipeError(
        err instanceof Error ? err.message : "Failed to generate recipes",
      );
    } finally {
      setRecipeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Planetary Agents Backend Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Backend Status:</span>
              <span
                className={`ml-2 font-medium ${isOnline ? "text-green-600" : "text-red-600"}`}
              >
                {isOnline ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Health Check:</span>
              <span
                className={`ml-2 font-medium ${
                  healthStatus?.status === "healthy"
                    ? "text-green-600"
                    : healthStatus?.status === "degraded"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {healthStatus?.status || "Unknown"}
                {healthStatus?.latency && ` (${healthStatus.latency}ms)`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Loading:</span>
              <span className="ml-2 font-medium">
                {isLoading ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Update:</span>
              <span className="ml-2 font-medium">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}
              </span>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>

        {/* Current Planetary Data */}
        {kinetics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Current Planetary Data
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Current Power Level:</span>
                <span className="ml-2 font-medium">
                  {(currentPowerLevel * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Dominant Element:</span>
                <span className="ml-2 font-medium">{dominantElement}</span>
              </div>
              <div>
                <span className="text-gray-600">Seasonal Influence:</span>
                <span className="ml-2 font-medium">{seasonalInfluence}</span>
              </div>
              <div>
                <span className="text-gray-600">Planetary Hours:</span>
                <span className="ml-2 font-medium">
                  {kinetics?.data?.base?.timing?.planetaryHours?.join(", ") ??
                    "N/A"}
                </span>
              </div>
            </div>

            {/* Elemental Totals */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Elemental Balance</h3>
              <div className="space-y-2">
                {Object.entries(kinetics.data.base.elemental.totals).map(
                  ([element, value]) => (
                    <div key={element} className="flex items-center">
                      <span className="w-20 text-gray-600">{element}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 ml-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{ width: `${Math.min(100, value * 20)}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm">{value.toFixed(2)}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Power Predictions */}
            {kinetics.data.powerPrediction && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Power Prediction</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Trend:</span>
                    <span className="ml-2 font-medium">
                      {kinetics.data.powerPrediction.trend}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-2 font-medium">
                      {(kinetics.data.powerPrediction.confidence * 100).toFixed(
                        0,
                      )}
                      %
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Next Peak:</span>
                    <span className="ml-2 font-medium">
                      {new Date(
                        kinetics.data.powerPrediction.nextPeak,
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Optimization */}
            {kinetics.data.agentOptimization && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Agent Optimization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Recommended Agents:</span>
                    <span className="ml-2 font-medium">
                      {kinetics.data.agentOptimization.recommendedAgents.join(
                        ", ",
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Power Amplification:</span>
                    <span className="ml-2 font-medium">
                      {kinetics.data.agentOptimization.powerAmplification.toFixed(
                        2,
                      )}
                      x
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Harmony Score:</span>
                    <span className="ml-2 font-medium">
                      {(
                        kinetics.data.agentOptimization.harmonyScore * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recipe Generator Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Astrological Recipe Engine
          </h2>
          <p className="text-gray-600 mb-4">
            Generate recipes based on your current interactions with Swiss
            Ephemeris data.
            <br />
            <span className="text-sm text-gray-500">
              Source: http://192.168.0.129:8001 (Mac Mini)
            </span>
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                void handleGenerateRecipes();
              }}
              disabled={recipeLoading || !isOnline}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {recipeLoading ? (
                <>
                  <span className="animate-spin text-xl">⟳</span>
                  Calculating Orbits...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Cosmic Recipes
                </>
              )}
            </button>
          </div>

          {recipeError && (
            <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 mb-4">
              <strong>Error:</strong> {recipeError}
            </div>
          )}

          {recipeData && (
            <div className="animate-fade-in">
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Cosmic Alignment
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="block text-sm text-blue-600 uppercase tracking-wider">
                      Sun
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {recipeData.chart_points?.Sun}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-blue-600 uppercase tracking-wider">
                      Moon
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {recipeData.chart_points?.Moon}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-blue-600 uppercase tracking-wider">
                      Ascendant
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {recipeData.chart_points?.Ascendant}
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mb-3">
                Recommended Recipes
              </h3>
              <div className="space-y-4">
                {recipeData.recommendations?.length > 0 ? (
                  recipeData.recommendations.map((rec: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-purple-900">
                          {rec.name}
                        </h4>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {rec.cuisine}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {rec.description}
                      </p>

                      <div className="mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Cosmic Resonance
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full"
                            style={{ width: `${rec.score * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-sm bg-gray-50 p-3 rounded text-gray-700">
                        <strong>Why this works:</strong>{" "}
                        {rec.match_reasons?.join(", ")}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded text-gray-500 italic">
                    The stars are silent. No recipes found for this alignment.
                  </div>
                )}
              </div>

              <div className="mt-6 text-xs text-gray-400 text-center">
                Calculation time: {lastUpdate?.toLocaleTimeString()} • Lat:
                40.7128, Lon: -74.006
              </div>
            </div>
          )}
        </div>

        {/* Raw Response Data */}
        {kinetics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Raw Response Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify(kinetics, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              void handleRefresh();
            }}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh Kinetics"}
          </button>
        </div>
      </div>
    </div>
  );
}
