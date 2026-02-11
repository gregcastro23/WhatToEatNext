"use client";

/**
 * Week Progress Component
 * Shows circular progress indicators for meals planned, nutrition compliance, and variety
 *
 * @file src/components/menu-builder/WeekProgress.tsx
 * @created 2026-01-28
 */

import React, { useMemo } from "react";
import type { WeeklyMenu } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";

interface WeekProgressProps {
  weekPlan: WeeklyMenu | null;
  weeklyNutrition: WeeklyNutritionResult | null;
}

/** SVG circular progress ring */
function ProgressRing({
  value,
  max,
  color,
  label,
  sublabel,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel: string;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const circumference = 2 * Math.PI * 28; // r=28
  const offset = circumference * (1 - pct);

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto">
        <svg width="64" height="64" className="transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{value}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2">{label}</p>
      <p className="text-[10px] text-gray-400">{sublabel}</p>
    </div>
  );
}

export default function WeekProgress({
  weekPlan,
  weeklyNutrition,
}: WeekProgressProps) {
  const stats = useMemo(() => {
    const plannedMeals = weekPlan
      ? weekPlan.meals.filter((m) => m.recipe).length
      : 0;

    const ingredients = weekPlan
      ? weekPlan.meals
          .filter((m) => m.recipe)
          .flatMap((m) =>
            (m.recipe!.ingredients || []).map((i) => i.name.toLowerCase()),
          )
      : [];
    const uniqueIngredients = new Set(ingredients).size;

    const compliance = weeklyNutrition?.weeklyCompliance?.overall ?? 0;

    return { plannedMeals, uniqueIngredients, compliance };
  }, [weekPlan, weeklyNutrition]);

  const compliancePct = Math.round(stats.compliance * 100);
  const complianceColor =
    compliancePct > 80 ? "#10b981" : compliancePct > 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">
        Week Progress
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <ProgressRing
          value={stats.plannedMeals}
          max={21}
          color="#f59e0b"
          label="Meals"
          sublabel="of 21"
        />
        <ProgressRing
          value={compliancePct}
          max={100}
          color={complianceColor}
          label="Nutrition"
          sublabel="compliance"
        />
        <ProgressRing
          value={stats.uniqueIngredients}
          max={30}
          color="#8b5cf6"
          label="Ingredients"
          sublabel="target: 30+"
        />
      </div>
    </div>
  );
}
