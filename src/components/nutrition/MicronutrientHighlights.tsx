// src/components/nutrition/MicronutrientHighlights.tsx
import React from "react";
import type { NutritionalSummary, NutritionCoverage } from "@/types/nutrition";
import { coverageState } from "@/utils/menuPlanner/nutritionCoverage";
import { formatNutrientName, getNutrientUnit } from "../../utils/nutrition";
import styles from "./MicronutrientHighlights.module.css";

interface MicronutrientHighlightsProps {
  totals: NutritionalSummary;
  goals: NutritionalSummary;
  /**
   * For a nutrient a recipe may not state (potassium): how many planned meals do.
   * With none the row is omitted; with some, the total is a lower bound.
   */
  coverage?: Partial<Record<string, NutritionCoverage>>;
}

// List of key micronutrients to display, in order of importance/common interest
const KEY_MICRONUTRIENTS = [
  "vitaminC",
  "vitaminD",
  "calcium",
  "iron",
  "magnesium",
  "potassium",
  "zinc",
  "folate",
];

export function MicronutrientHighlights({
  totals,
  goals,
  coverage,
}: MicronutrientHighlightsProps) {
  const displayedMicros = KEY_MICRONUTRIENTS.map((key) => {
    const totalVal: unknown = Reflect.get(totals, key);
    const goalVal: unknown = Reflect.get(goals, key);
    const total = typeof totalVal === "number" && Number.isFinite(totalVal) ? totalVal : 0;
    const goal = typeof goalVal === "number" && Number.isFinite(goalVal) ? goalVal : 0;
    const percentage = goal > 0 ? (total / goal) * 100 : 100;
    const covered = coverage?.[key];
    const state = covered ? coverageState(covered) : "complete";
    // A lower bound below 90% proves nothing: the meals that do not state it may supply the rest.
    const status =
      state === "partial" && percentage < 90
        ? "unknown"
        : percentage >= 90
        ? "excellent"
        : percentage >= 75
          ? "good"
          : percentage >= 50
            ? "fair"
            : "poor";

    return {
      name: formatNutrientName(key),
      total: Math.round(total),
      goal: Math.round(goal),
      unit: getNutrientUnit(key),
      percentage,
      status,
      bound: state === "partial" ? "≥" : "",
      stated: state !== "none",
    };
  }).filter((micro) => micro.goal > 0 && micro.stated); // Only show if there's a goal, and a meal states it

  return (
    <div className={styles.micronutrientHighlights}>
      {displayedMicros.length === 0 ? (
        <p className={styles.noData}>
          No key micronutrient data available or goals set.
        </p>
      ) : (
        <ul className={styles.micronutrientList}>
          {displayedMicros.map((micro, index) => (
            <li
              key={index}
              className={`${styles.micronutrientItem} ${styles[micro.status === "unknown" ? "fair" : micro.status]}`}
            >
              <span className={styles.nutrientName}>{micro.name}</span>
              <div className={styles.nutrientProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressBarFill} ${styles[`progressBarFill-${micro.status === "unknown" ? "fair" : micro.status}`]}`}
                    style={{ width: `${Math.min(100, micro.percentage)}%` }}
                   />
                </div>
                <span className={styles.nutrientValue}>
                  {micro.bound}
                  {micro.total}
                  {micro.unit}{" "}
                  <span className={styles.nutrientTarget}>
                    / {micro.goal}
                    {micro.unit}
                  </span>
                </span>
              </div>
              <span className={styles.statusIndicator}>
                {micro.status === "excellent" && "✅"}
                {micro.status === "good" && "👍"}
                {micro.status === "fair" && "⚠️"}
                {micro.status === "poor" && "🚨"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
