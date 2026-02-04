// src/components/nutrition/MacroSummary.tsx
import React from "react";
import { NutritionRing } from "./NutritionRing";
import styles from "./MacroSummary.module.css";

interface MacroSummaryProps {
  totals: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  goals: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function MacroSummary({
  totals,
  goals,
  percentages,
}: MacroSummaryProps) {
  return (
    <div className={styles.macroSummary}>
      <div className={styles.macroRings}>
        <div className={styles.ringItem}>
          <NutritionRing
            percentage={percentages.protein}
            color="#007bff"
            size={80}
            strokeWidth={8}
            label="Protein"
            value={`${Math.round(totals.protein)}g`}
          />
          <div className={styles.macroDetails}>
            <span className={styles.macroLabel}>Protein</span>
            <span className={styles.macroValue}>
              {Math.round(totals.protein)}g
            </span>
            <span className={styles.macroTarget}>
              / {Math.round(goals.protein)}g
            </span>
          </div>
        </div>

        <div className={styles.ringItem}>
          <NutritionRing
            percentage={percentages.carbs}
            color="#28a745"
            size={80}
            strokeWidth={8}
            label="Carbs"
            value={`${Math.round(totals.carbs)}g`}
          />
          <div className={styles.macroDetails}>
            <span className={styles.macroLabel}>Carbs</span>
            <span className={styles.macroValue}>
              {Math.round(totals.carbs)}g
            </span>
            <span className={styles.macroTarget}>
              / {Math.round(goals.carbs)}g
            </span>
          </div>
        </div>

        <div className={styles.ringItem}>
          <NutritionRing
            percentage={percentages.fat}
            color="#ffc107"
            size={80}
            strokeWidth={8}
            label="Fat"
            value={`${Math.round(totals.fat)}g`}
          />
          <div className={styles.macroDetails}>
            <span className={styles.macroLabel}>Fat</span>
            <span className={styles.macroValue}>{Math.round(totals.fat)}g</span>
            <span className={styles.macroTarget}>
              / {Math.round(goals.fat)}g
            </span>
          </div>
        </div>
      </div>
      <div className={styles.caloriesOverview}>
        <span className={styles.caloriesLabel}>Total Calories:</span>
        <span className={styles.caloriesValue}>
          {Math.round(totals.calories)} kcal
        </span>
        <span className={styles.caloriesTarget}>
          / {Math.round(goals.calories)} kcal
        </span>
      </div>
    </div>
  );
}
