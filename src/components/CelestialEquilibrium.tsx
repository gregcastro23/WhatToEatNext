"use client";

import React from "react";

interface CelestialEquilibriumProps {
  alchemicalQuantities: {
    spirit_score: number;
    essence_score: number;
    matter_score: number;
    substance_score: number;
  } | null;
}

export default function CelestialEquilibrium({
  alchemicalQuantities,
}: CelestialEquilibriumProps) {
  if (!alchemicalQuantities) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No alchemical quantities data available.
      </div>
    );
  }

  const data = [
    { name: "Spirit", value: alchemicalQuantities.spirit_score },
    { name: "Essence", value: alchemicalQuantities.essence_score },
    { name: "Matter", value: alchemicalQuantities.matter_score },
    { name: "Substance", value: alchemicalQuantities.substance_score },
  ];

  // Basic SVG for a radar chart-like visualization
  const size = 150;
  const center = size / 2;
  const spokeLength = center * 0.8; // Max radius for data points
  const maxValue = 1.0; // Max possible score

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const length = (value / maxValue) * spokeLength;
    return {
      x: center + length * Math.cos(angle),
      y: center + length * Math.sin(angle),
    };
  };

  const points = data.map((item, i) =>
    getCoordinates(item.value, i, data.length),
  );
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full flex justify-center py-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform scale-y-[-1]"
      >
        {/* Radar grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const r = level * spokeLength;
          return (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={r}
              stroke="rgba(128, 128, 128, 0.3)"
              strokeWidth="0.5"
              fill="none"
            />
          );
        })}

        {/* Spokes */}
        {data.map((_, i) => {
          const coord = getCoordinates(maxValue, i, data.length);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={coord.x}
              y2={coord.y}
              stroke="rgba(128, 128, 128, 0.3)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.4)"
          stroke="#8B5CF6"
          strokeWidth="1.5"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill="#8B5CF6" />
        ))}
      </svg>
    </div>
  );
}
