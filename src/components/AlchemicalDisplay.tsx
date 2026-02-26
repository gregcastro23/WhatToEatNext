/**
 * AlchemicalDisplay Component
 *
 * Displays alchemical properties (ESMS), elemental properties,
 * and thermodynamic values from the alchemize API.
 */

"use client";

import React from "react";
import type { AlchemicalResult } from "@/hooks/useChartData";
import { getElementColor } from "@/utils/chartRendering";

export interface AlchemicalDisplayProps {
  alchemical: AlchemicalResult | null;
  isLoading?: boolean;
}

export const AlchemicalDisplay: React.FC<AlchemicalDisplayProps> = ({
  alchemical,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-orange-500/20 rounded w-1/3" />
          <div className="h-4 bg-orange-500/20 rounded w-full" />
          <div className="h-4 bg-orange-500/20 rounded w-full" />
          <div className="h-4 bg-orange-500/20 rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Enhanced defensive checks for alchemical and all required properties
  if (
    !alchemical ||
    !alchemical.elementalProperties ||
    !alchemical.thermodynamicProperties ||
    !alchemical.esms
  ) {
    return (
      <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30">
        <p className="text-gray-400 italic">No alchemical data available</p>
      </div>
    );
  }

  const {
    elementalProperties,
    thermodynamicProperties,
    esms,
    kalchm,
    monica,
    score,
    metadata,
  } = alchemical;

  // Find max values for scaling bars
  const maxElemental = Math.max(...Object.values(elementalProperties));
  const maxEsms = Math.max(...Object.values(esms));

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-orange-300 mb-2">
          Alchemical Analysis
        </h3>
        {metadata?.dominantElement && (
          <p className="text-sm text-gray-400">
            Dominant Element:{" "}
            <span className="text-orange-300 font-semibold">
              {metadata.dominantElement}
            </span>
            {metadata.sunSign && (
              <>
                {" "}
                • Sun in{" "}
                <span className="text-orange-300 font-semibold capitalize">
                  {metadata.sunSign}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* ESMS (Spirit, Essence, Matter, Substance) */}
      <div>
        <h4 className="text-lg font-semibold text-orange-300 mb-3">
          Alchemical Properties (ESMS)
        </h4>
        <div className="space-y-2">
          {Object.entries(esms).map(([property, value]) => (
            <div key={property}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{property}</span>
                <span className="text-orange-300 font-semibold">
                  {value.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-orange-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(value / maxEsms) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elemental Properties */}
      <div>
        <h4 className="text-lg font-semibold text-orange-300 mb-3">
          Elemental Properties
        </h4>
        <div className="space-y-2">
          {Object.entries(elementalProperties).map(([element, value]) => {
            const color = getElementColor(element);

            return (
              <div key={element}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{element}</span>
                  <span className="font-semibold" style={{ color }}>
                    {value.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(value / maxElemental) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thermodynamic Properties */}
      <div>
        <h4 className="text-lg font-semibold text-orange-300 mb-3">
          Thermodynamic Properties
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(thermodynamicProperties).map(([property, value]) => (
            <div
              key={property}
              className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg"
            >
              <div className="text-xs text-gray-400 capitalize mb-1">
                {property.replace(/([A-Z])/g, " $1").trim()}
              </div>
              <div className="text-lg font-bold text-orange-300">
                {value.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Metrics */}
      <div>
        <h4 className="text-lg font-semibold text-orange-300 mb-3">
          Special Metrics
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Kalchm</div>
            <div className="text-lg font-bold text-purple-300">
              {kalchm.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Monica</div>
            <div className="text-lg font-bold text-blue-300">
              {monica.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Score</div>
            <div className="text-lg font-bold text-green-300">
              {score.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      {metadata?.source && (
        <div className="pt-4 border-t border-orange-500/20">
          <p className="text-xs text-gray-500">
            Source: {metadata.source}
            {metadata.chartRuler && ` • Chart Ruler: ${metadata.chartRuler}`}
            {metadata.dominantModality &&
              ` • Dominant Modality: ${metadata.dominantModality}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlchemicalDisplay;
