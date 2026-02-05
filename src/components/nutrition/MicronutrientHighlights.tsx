// src/components/nutrition/MicronutrientHighlights.tsx
import React from "react";
import {
  NutritionalSummary,
  NutritionalTargets,
  ComplianceDeficiency,
} from "@/types/nutrition";
import styles from "./MicronutrientHighlights.module.css";

interface MicronutrientHighlightsProps {
  totals: NutritionalSummary;
  goals: NutritionalTargets;
  deficiencies: NutrientDeviation[];
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

// Helper to format nutrient names for display
const formatNutrientName = (nutrient: string): string => {
  const nameMap: Record<string, string> = {
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    calcium: "Calcium",
    iron: "Iron",
    magnesium: "Magnesium",
    potassium: "Potassium",
    zinc: "Zinc",
    folate: "Folate (B9)",
    // Add more as needed
  };
  return (
    nameMap[nutrient] ||
    nutrient
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
  );
};

// Helper to get nutrient unit
const getNutrientUnit = (nutrient: string): string => {
  const unitMap: Record<string, string> = {
    vitaminC: "mg",
    vitaminD: "mcg", // Micrograms
    calcium: "mg",
    iron: "mg",
    magnesium: "mg",
    potassium: "mg",
    zinc: "mg",
    folate: "mcg",
    // Add more as needed
  };
  return unitMap[nutrient] || "unit";
};

export function MicronutrientHighlights({
  totals,
  goals,
  deficiencies,
}: MicronutrientHighlightsProps) {
  const displayedMicros = KEY_MICRONUTRIENTS.map((key) => {
    const total = (totals as any)[key] || 0;
    const goal = (goals as any)[key] || 0; // Assuming goals also have these keys
    const isDeficient = deficiencies.some((d) => d.nutrient === key);
    return {
      name: formatNutrientName(key),
      total: Math.round(total),
      goal: Math.round(goal),
      unit: getNutrientUnit(key),
      isDeficient: isDeficient,
      percentage: goal > 0 ? (total / goal) * 100 : 100,
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
              className={`${styles.micronutrientItem} ${micro.isDeficient ? styles.deficient : ""}`}
            >
              <span className={styles.nutrientName}>{micro.name}</span>
              <div className={styles.nutrientProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${Math.min(100, micro.percentage)}%` }}
                  ></div>
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
              {micro.isDeficient && (
                <span
                  className={styles.deficiencyIndicator}
                  title="Below target"
                >
                  ⚠️
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
