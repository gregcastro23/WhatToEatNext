'use client';

import { useEffect, useState } from 'react';
import { usePlanetaryKinetics } from '@/hooks/usePlanetaryKinetics';

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
    checkHealth
  } = usePlanetaryKinetics({
    location: { lat: 40.7128, lon: -74.0060 }, // NYC
    updateInterval: 60000, // Update every minute
    enableAutoUpdate: false // Manual control for testing
  });

  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    // Check health on mount
    checkHealth().then(setHealthStatus);
  }, [checkHealth]);

  const handleRefresh = async () => {
    await refreshKinetics();
    const health = await checkHealth();
    setHealthStatus(health);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Planetary Agents Backend Test</h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Backend Status:</span>
              <span className={`ml-2 font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Health Check:</span>
              <span className={`ml-2 font-medium ${
                healthStatus?.status === 'healthy' ? 'text-green-600' :
                healthStatus?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {healthStatus?.status || 'Unknown'}
                {healthStatus?.latency && ` (${healthStatus.latency}ms)`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Loading:</span>
              <span className="ml-2 font-medium">{isLoading ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Update:</span>
              <span className="ml-2 font-medium">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
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
            <h2 className="text-xl font-semibold mb-4">Current Planetary Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Current Power Level:</span>
                <span className="ml-2 font-medium">{(currentPowerLevel * 100).toFixed(0)}%</span>
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
                  {kinetics.data.base.timing.planetaryHours.join(', ')}
                </span>
              </div>
            </div>

            {/* Elemental Totals */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Elemental Balance</h3>
              <div className="space-y-2">
                {Object.entries(kinetics.data.base.elemental.totals).map(([element, value]) => (
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
                ))}
              </div>
            </div>

            {/* Power Predictions */}
            {kinetics.data.powerPrediction && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Power Prediction</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Trend:</span>
                    <span className="ml-2 font-medium">{kinetics.data.powerPrediction.trend}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-2 font-medium">
                      {(kinetics.data.powerPrediction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Next Peak:</span>
                    <span className="ml-2 font-medium">
                      {new Date(kinetics.data.powerPrediction.nextPeak).toLocaleTimeString()}
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
                      {kinetics.data.agentOptimization.recommendedAgents.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Power Amplification:</span>
                    <span className="ml-2 font-medium">
                      {kinetics.data.agentOptimization.powerAmplification.toFixed(2)}x
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Harmony Score:</span>
                    <span className="ml-2 font-medium">
                      {(kinetics.data.agentOptimization.harmonyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
