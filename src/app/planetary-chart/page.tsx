/**
 * Planetary Chart Page
 *
 * Interactive visualization of current planetary positions with alchemical analysis.
 * Uses /api/astrologize and /api/alchemize endpoints.
 */

"use client";

import React, { useState } from "react";
import { useChartData } from "@/hooks/useChartData";
import PlanetaryChart from "@/components/PlanetaryChart";
import PlanetaryChartControls from "@/components/PlanetaryChartControls";
import AlchemicalDisplay from "@/components/AlchemicalDisplay";
import KineticsDisplay from "@/components/KineticsDisplay";

export default function PlanetaryChartPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
            Planetary Chart
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time astronomical positions with alchemical and kinetic
            analysis
          </p>
          {timestamp && (
            <p className="text-sm text-gray-400 mt-2">
              Chart calculated for: {new Date(timestamp).toLocaleString()}
            </p>
          )}
        </div>

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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
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

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg border border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            About This Chart
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">
                Planetary Positions
              </h4>
              <p>
                Calculated using the astronomy-engine library with real-time
                astronomical data. Positions are accurate to within 0.01
                degrees.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">
                Alchemical Properties
              </h4>
              <p>
                ESMS (Spirit, Essence, Matter, Substance) values are calculated
                from planetary positions using the authoritative planetary
                alchemy mapping system.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">
                Planetary Kinetics
              </h4>
              <p>
                P=IV circuit model calculates Power, Current, and Voltage from
                alchemical and elemental properties. Includes velocity,
                momentum, and force dynamics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Aspects</h4>
              <p>
                Aspects represent geometric relationships between planets. Major
                aspects include conjunction (0°), sextile (60°), square (90°),
                trine (120°), and opposition (180°).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Live Updates</h4>
              <p>
                When using &quot;current moment&quot; mode, the chart
                automatically refreshes every minute to reflect the latest
                planetary positions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">
                Force Classification
              </h4>
              <p>
                Kinetic force is classified as accelerating, balanced, or
                decelerating based on magnitude. Thermal direction indicates
                heating, cooling, or stable states.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
