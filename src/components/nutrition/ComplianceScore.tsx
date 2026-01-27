"use client";

import React from "react";
import { getComplianceSeverity } from "@/types/nutrition";
import type { ComplianceSeverity } from "@/types/nutrition";

interface ComplianceScoreProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const SEVERITY_COLORS: Record<ComplianceSeverity, string> = {
  excellent: "#22c55e",
  good: "#84cc16",
  fair: "#eab308",
  poor: "#f97316",
  critical: "#ef4444",
};

const SEVERITY_BG: Record<ComplianceSeverity, string> = {
  excellent: "bg-green-50",
  good: "bg-lime-50",
  fair: "bg-yellow-50",
  poor: "bg-orange-50",
  critical: "bg-red-50",
};

/**
 * Displays an overall compliance score with color-coded severity.
 */
export default function ComplianceScore({
  score,
  label = "Compliance",
  size = "md",
}: ComplianceScoreProps) {
  const severity = getComplianceSeverity(score);
  const color = SEVERITY_COLORS[severity];
  const bg = SEVERITY_BG[severity];
  const pct = Math.round(score * 100);

  const sizeClasses = {
    sm: "p-2 text-xs",
    md: "p-3 text-sm",
    lg: "p-4 text-base",
  };

  const scoreSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={`rounded-xl ${bg} ${sizeClasses[size]} flex flex-col items-center gap-1`}>
      <span className="text-gray-600 font-medium">{label}</span>
      <span className={`${scoreSize[size]} font-bold`} style={{ color }}>
        {pct}%
      </span>
      <span className="capitalize font-medium text-xs" style={{ color }}>
        {severity}
      </span>
    </div>
  );
}
