// src/components/nutrition/MicronutrientHighlights.tsx
import React from "react";
import type { NutritionalSummary} from "@/types/nutrition";
import { formatNutrientName, getNutrientUnit } from "../../utils/nutrition";
import styles from "./MicronutrientHighlights.module.css";

interface MicronutrientHighlightsProps {
  totals: NutritionalSummary;
  goals: NutritionalSummary;
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
}: MicronutrientHighlightsProps) {
  const displayedMicros = KEY_MICRONUTRIENTS.map((key) => {
    const totalVal: unknown = Reflect.get(totals, key);
    const goalVal: unknown = Reflect.get(goals, key);
    const total = typeof totalVal === "number" && Number.isFinite(totalVal) ? totalVal : 0;
    const goal = typeof goalVal === "number" && Number.isFinite(goalVal) ? goalVal : 0;
    const percentage = goal > 0 ? (total / goal) * 100 : 100;
    const status =
      percentage >= 90
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
    };
  }).filter((micro) => micro.goal > 0); // Only show if there's a goal for it

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
              className={`${styles.micronutrientItem} ${styles[micro.status]}`}
            >
              <span className={styles.nutrientName}>{micro.name}</span>
              <div className={styles.nutrientProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressBarFill} ${styles[`progressBarFill-${micro.status}`]}`}
                    style={{ width: `${Math.min(100, micro.percentage)}%` }}
                   />
                </div>
                <span className={styles.nutrientValue}>
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
