"use client";

import React from "react";
import type { NutritionalSummary } from "@/types/nutrition";
import NutritionRing from "./NutritionRing";

interface MacroSummaryProps {
  actual: NutritionalSummary;
  target: NutritionalSummary;
}

/**
 * Displays macronutrient rings (calories, protein, carbs, fat, fiber)
 * with progress toward daily targets.
 */
export default function MacroSummary({ actual, target }: MacroSummaryProps) {
  const macros = [
    { key: "calories" as const, label: "Calories", unit: "kcal", color: "#3b82f6" },
    { key: "protein" as const, label: "Protein", unit: "g", color: "#ef4444" },
    { key: "carbs" as const, label: "Carbs", unit: "g", color: "#eab308" },
    { key: "fat" as const, label: "Fat", unit: "g", color: "#f97316" },
    { key: "fiber" as const, label: "Fiber", unit: "g", color: "#22c55e" },
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Macronutrients</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {macros.map((m) => (
          <NutritionRing
            key={m.key}
            value={actual[m.key]}
            max={target[m.key]}
            label={m.label}
            unit={m.unit}
            color={m.color}
            size={80}
            strokeWidth={6}
          />
        ))}
      </div>

      {/* Macro percentage bar */}
      <div className="mt-4">
        <MacroPercentageBar protein={actual.protein} carbs={actual.carbs} fat={actual.fat} />
      </div>
    </div>
  );
}

function MacroPercentageBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;
  const total = proteinCal + carbsCal + fatCal;

  if (total === 0) return null;

  const pPct = (proteinCal / total) * 100;
  const cPct = (carbsCal / total) * 100;
  const fPct = (fatCal / total) * 100;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div style={{ width: `${pPct}%`, backgroundColor: "#ef4444" }} title={`Protein: ${pPct.toFixed(0)}%`} />
        <div style={{ width: `${cPct}%`, backgroundColor: "#eab308" }} title={`Carbs: ${cPct.toFixed(0)}%`} />
        <div style={{ width: `${fPct}%`, backgroundColor: "#f97316" }} title={`Fat: ${fPct.toFixed(0)}%`} />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>P: {pPct.toFixed(0)}%</span>
        <span>C: {cPct.toFixed(0)}%</span>
        <span>F: {fPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
