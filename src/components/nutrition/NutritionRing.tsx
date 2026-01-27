"use client";

import React from "react";
import { getComplianceSeverity } from "@/types/nutrition";

interface NutritionRingProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

/**
 * Circular progress ring for displaying nutrient progress toward a goal.
 * Shows percentage fill with the actual value in the center.
 */
export default function NutritionRing({
  value,
  max,
  label,
  unit = "",
  size = 100,
  strokeWidth = 8,
  color,
}: NutritionRingProps) {
  const ratio = max > 0 ? Math.min(value / max, 1.5) : 0;
  const displayRatio = Math.min(ratio, 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - displayRatio);

  const resolvedColor = color ?? getColorForRatio(ratio);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold" style={{ color: resolvedColor }}>
            {Math.round(ratio * 100)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-600 font-medium text-center">{label}</span>
      <span className="text-xs text-gray-400">
        {Math.round(value)}{unit ? ` ${unit}` : ""} / {Math.round(max)}
      </span>
    </div>
  );
}

function getColorForRatio(ratio: number): string {
  const severity = getComplianceSeverity(ratio >= 0.85 && ratio <= 1.15 ? 1.0 : ratio < 0.85 ? ratio : Math.max(0, 1 - (ratio - 1.15) * 2));
  switch (severity) {
    case "excellent": return "#22c55e";
    case "good": return "#84cc16";
    case "fair": return "#eab308";
    case "poor": return "#f97316";
    case "critical": return "#ef4444";
  }
}
