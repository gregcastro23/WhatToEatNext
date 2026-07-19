"use client";

/**
 * Interactive half of the planetary-chart page: the chart wheel with
 * date/location controls, live positions table, and alchemical/kinetics
 * displays. The page shell (server) renders the free-body-diagram grid from
 * per-request data; this component keeps the exploratory tooling.
 */

import dynamic from "next/dynamic";
import React, { useState } from "react";
import AlchemicalDisplay from "@/components/AlchemicalDisplay";
import KineticsDisplay from "@/components/KineticsDisplay";
import PlanetaryChartControls from "@/components/PlanetaryChartControls";
import { useChartData } from "@/hooks/useChartData";

const PlanetaryChart = dynamic(() => import("@/components/PlanetaryChart"), {
  ssr: false,
});

export default function PlanetaryChartClient() {
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState({
    latitude: 40.7128,
    longitude: -74.006,
  });
  const [zodiacSystem, setZodiacSystem] = useState<"tropical" | "sidereal">(
    "tropical",
  );
  const [showAspects, setShowAspects] = useState(true);
  const [showDegrees, setShowDegrees] = useState(true);

  const chartData = useChartData({
    dateTime,
    location,
    zodiacSystem,
    autoRefresh: !dateTime, // Auto-refresh only when using current moment
    refreshInterval: 60000, // 1 minute
  });

  const {
    positions,
    aspects,
    alchemical,
    kinetics,
    timestamp,
    isLoading,
    error,
    refetch,
  } = chartData;

  return (
    <div className="max-w-7xl mx-auto">
      {timestamp && (
        <p className="text-sm text-gray-400 mb-4 text-center">
          Interactive chart calculated for: {new Date(timestamp).toLocaleString()}
        </p>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-red-300">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <PlanetaryChartControls
            onDateTimeChange={setDateTime}
            onLocationChange={setLocation}
            onZodiacSystemChange={setZodiacSystem}
            onRefresh={refetch}
            currentDateTime={dateTime}
            currentLocation={location}
            currentZodiacSystem={zodiacSystem}
            isLoading={isLoading}
          />

          {/* Chart Options */}
          <div className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Chart Options
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAspects}
                  onChange={(e) => setShowAspects(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-500/50 bg-blue-900/30 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Show Aspects</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDegrees}
                  onChange={(e) => setShowDegrees(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-500/50 bg-blue-900/30 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Show Degrees</span>
              </label>
            </div>
          </div>

          {/* Aspect Legend */}
          {showAspects && aspects && aspects.length > 0 && (
            <div className="p-4 bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-lg border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-300 mb-3">
                Active Aspects ({aspects.length})
              </h3>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {aspects.map((aspect, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-300 py-1 px-2 bg-green-900/20 rounded"
                  >
                    <span className="font-semibold">{aspect.planet1}</span>{" "}
                    <span className="text-green-400">{aspect.type}</span>{" "}
                    <span className="font-semibold">{aspect.planet2}</span>
                    {aspect.orb !== undefined && (
                      <span className="text-gray-500 ml-2">
                        ({aspect.orb.toFixed(2)}°)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Chart Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30">
            {isLoading && !positions ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
                  <p className="text-gray-300">
                    Calculating planetary positions...
                  </p>
                </div>
              </div>
            ) : positions ? (
              <div className="flex justify-center">
                <PlanetaryChart
                  positions={positions}
                  aspects={showAspects ? aspects : []}
                  size={600}
                  showAspects={showAspects}
                  showDegrees={showDegrees}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-400 italic">
                  No chart data available
                </p>
              </div>
            )}
          </div>

          {/* Planetary Positions Table */}
          {positions && (
            <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                Planetary Positions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(positions).map(([planet, position]) => (
                  <div
                    key={planet}
                    className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-cyan-300">
                        {planet}
                      </span>
                      {position.isRetrograde && (
                        <span className="text-xs text-red-400 font-bold">
                          ℞
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 capitalize">
                      {position.degree.toFixed(0)}° {position.sign}
                    </div>
                    <div className="text-xs text-gray-500">
                      Exact: {(position.exactLongitude ?? 0).toFixed(2)}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alchemical Display */}
          <AlchemicalDisplay alchemical={alchemical} isLoading={isLoading} />

          {/* Kinetics Display */}
          <KineticsDisplay kinetics={kinetics} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
