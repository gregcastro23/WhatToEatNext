"use client";

import React from "react";
import type { NutritionalSummary, NutrientDeviation } from "@/types/nutrition";
import { formatNutrientName } from "@/utils/nutritionAggregation";
import { getNutrientUnit } from "@/data/nutritional/rdaStandards";

interface MicronutrientHighlightsProps {
  actual: NutritionalSummary;
  target: NutritionalSummary;
  deficiencies: NutrientDeviation[];
  excesses: NutrientDeviation[];
}

/**
 * Shows top micronutrient deficiencies and excesses as a compact highlight list.
 */
export default function MicronutrientHighlights({
  actual,
  target,
  deficiencies,
  excesses,
}: MicronutrientHighlightsProps) {
  const topDeficiencies = deficiencies.slice(0, 5);
  const topExcesses = excesses.slice(0, 3);

  if (topDeficiencies.length === 0 && topExcesses.length === 0) {
    return (
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <p className="text-green-700 text-sm font-medium">
          All micronutrients are within target ranges.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Micronutrient Highlights</h3>

      {topDeficiencies.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-red-600 mb-1 uppercase tracking-wide">Below Target</h4>
          <div className="space-y-1">
            {topDeficiencies.map((d) => {
              const pct = Math.round((d.actual / d.target) * 100);
              const unit = getNutrientUnit(d.nutrient);
              return (
                <div key={d.nutrient} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{formatNutrientName(d.nutrient)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: d.severity === 'severe' ? '#ef4444' : d.severity === 'moderate' ? '#f97316' : '#eab308',
                        }}
                      />
                    </div>
                    <span className="text-gray-500 w-20 text-right">
                      {Math.round(d.actual)}/{Math.round(d.target)} {unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topExcesses.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-orange-600 mb-1 uppercase tracking-wide">Above Target</h4>
          <div className="space-y-1">
            {topExcesses.map((e) => {
              const pct = Math.round((e.actual / e.target) * 100);
              const unit = getNutrientUnit(e.nutrient);
              return (
                <div key={e.nutrient} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{formatNutrientName(e.nutrient)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-medium">{pct}%</span>
                    <span className="text-gray-500">
                      {Math.round(e.actual)}/{Math.round(e.target)} {unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
