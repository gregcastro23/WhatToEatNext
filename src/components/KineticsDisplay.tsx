/**
 * KineticsDisplay Component
 *
 * Displays kinetic properties using the P=IV circuit model:
 * - Velocity, Momentum, Force
 * - Power (P = I × V), Current, Voltage
 * - Charge, Inertia
 * - Force classification and thermal direction
 */

"use client";

import React from "react";
import type { KineticMetrics } from "@/types/kinetics";

export interface KineticsDisplayProps {
  kinetics: KineticMetrics | null;
  isLoading?: boolean;
}

export const KineticsDisplay: React.FC<KineticsDisplayProps> = ({
  kinetics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-cyan-500/20 rounded w-1/3"></div>
          <div className="h-4 bg-cyan-500/20 rounded w-full"></div>
          <div className="h-4 bg-cyan-500/20 rounded w-full"></div>
          <div className="h-4 bg-cyan-500/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!kinetics) {
    return (
      <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30">
        <p className="text-gray-400 italic">No kinetic data available</p>
      </div>
    );
  }

  // Element colors for velocity and momentum
  const elementColors: Record<string, string> = {
    Fire: "#ff6b6b",
    Water: "#4dabf7",
    Earth: "#82c91e",
    Air: "#ffd43b",
  };

  // Find max values for scaling bars
  const maxVelocity = Math.max(...Object.values(kinetics.velocity));
  const maxMomentum = Math.max(...Object.values(kinetics.momentum));

  // Classification colors
  const forceClassificationColor =
    kinetics.forceClassification === "accelerating"
      ? "#51cf66"
      : kinetics.forceClassification === "decelerating"
        ? "#ff6b6b"
        : "#ffd43b";

  const thermalDirectionColor =
    kinetics.thermalDirection === "heating"
      ? "#ff6b6b"
      : kinetics.thermalDirection === "cooling"
        ? "#4dabf7"
        : "#ffd43b";

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-cyan-300 mb-2">Planetary Kinetics</h3>
        <p className="text-sm text-gray-400">
          P=IV Circuit Model •{" "}
          <span className="text-cyan-300 font-semibold capitalize">
            {kinetics.forceClassification}
          </span>{" "}
          Force •{" "}
          <span className="text-cyan-300 font-semibold capitalize">
            {kinetics.thermalDirection}
          </span>{" "}
          Thermal
        </p>
      </div>

      {/* P=IV Circuit Metrics */}
      <div>
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">
          P=IV Circuit Model
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Power (P = I × V)</div>
            <div className="text-lg font-bold text-purple-300">
              {kinetics.power.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Current (I)</div>
            <div className="text-lg font-bold text-blue-300">
              {kinetics.currentFlow.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Voltage (V)</div>
            <div className="text-lg font-bold text-green-300">
              {kinetics.potentialDifference.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Charge (Q)</div>
            <div className="text-lg font-bold text-orange-300">
              {kinetics.charge.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Velocity by Element */}
      <div>
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">
          Elemental Velocity
        </h4>
        <div className="space-y-2">
          {Object.entries(kinetics.velocity).map(([element, value]) => {
            const color = elementColors[element];

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
                      width: `${maxVelocity > 0 ? (value / maxVelocity) * 100 : 0}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Momentum by Element */}
      <div>
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">
          Elemental Momentum
        </h4>
        <div className="space-y-2">
          {Object.entries(kinetics.momentum).map(([element, value]) => {
            const color = elementColors[element];

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
                      width: `${maxMomentum > 0 ? (value / maxMomentum) * 100 : 0}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Force and Dynamics */}
      <div>
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">
          Force & Dynamics
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Force Magnitude</div>
            <div className="text-lg font-bold text-cyan-300">
              {kinetics.forceMagnitude.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Inertia</div>
            <div className="text-lg font-bold text-cyan-300">
              {kinetics.inertia.toFixed(4)}
            </div>
          </div>

          <div
            className="p-3 bg-cyan-900/20 border rounded-lg"
            style={{ borderColor: `${forceClassificationColor}40` }}
          >
            <div className="text-xs text-gray-400 mb-1">Force Classification</div>
            <div
              className="text-lg font-bold capitalize"
              style={{ color: forceClassificationColor }}
            >
              {kinetics.forceClassification}
            </div>
          </div>

          <div
            className="p-3 bg-cyan-900/20 border rounded-lg"
            style={{ borderColor: `${thermalDirectionColor}40` }}
          >
            <div className="text-xs text-gray-400 mb-1">Thermal Direction</div>
            <div
              className="text-lg font-bold capitalize"
              style={{ color: thermalDirectionColor }}
            >
              {kinetics.thermalDirection}
            </div>
          </div>
        </div>
      </div>

      {/* Aspect Phase (if available) */}
      {kinetics.aspectPhase && (
        <div>
          <h4 className="text-lg font-semibold text-cyan-300 mb-3">
            Aspect Phase
          </h4>
          <div className="p-4 bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-500/30 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Type</span>
              <span className="text-lg font-bold text-indigo-300 capitalize">
                {kinetics.aspectPhase.type}
              </span>
            </div>
            <p className="text-sm text-gray-300 italic">
              {kinetics.aspectPhase.description}
            </p>
            {kinetics.aspectPhase.velocityBoost !== undefined && (
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>Velocity Boost:</span>
                <span className="text-indigo-300">
                  +{(kinetics.aspectPhase.velocityBoost * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {kinetics.aspectPhase.powerBoost !== undefined && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Power Boost:</span>
                <span className="text-indigo-300">
                  +{(kinetics.aspectPhase.powerBoost * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KineticsDisplay;
