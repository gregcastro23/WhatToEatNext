import React, { useState } from "react";
import { formatNutrientName, getNutrientUnit } from "../../utils/nutrition";
import {
  WeeklyNutritionResult,
  ComplianceSeverity,
  getComplianceSeverity,
} from "@/types/nutrition";
import { NutritionRing } from "./NutritionRing";
import { MacroSummary } from "./MacroSummary";
import { MicronutrientHighlights } from "./MicronutrientHighlights";
import { ComplianceScore } from "./ComplianceScore";
import styles from "./WeeklyNutritionDashboard.module.css";

interface WeeklyNutritionDashboardProps {
  weeklyData: WeeklyNutritionResult;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function WeeklyNutritionDashboard({
  weeklyData,
  isExpanded = false,
  onToggleExpand,
}: WeeklyNutritionDashboardProps) {
  const { weeklyTotals, weeklyGoals, weeklyCompliance, variety } = weeklyData;

  // Get compliance severity for visual styling
  const severity = getComplianceSeverity(weeklyCompliance.overall / 100);

  // Calculate macro percentages
  const totalMacroCalories =
    weeklyTotals.protein * 4 + weeklyTotals.carbs * 4 + weeklyTotals.fat * 9;

  const macroPercentages = {
    protein:
      totalMacroCalories > 0
        ? ((weeklyTotals.protein * 4) / totalMacroCalories) * 100
        : 33,
    carbs:
      totalMacroCalories > 0
        ? ((weeklyTotals.carbs * 4) / totalMacroCalories) * 100
        : 33,
    fat:
      totalMacroCalories > 0
        ? ((weeklyTotals.fat * 9) / totalMacroCalories) * 100
        : 33,
  };

  return (
    <div
      className={`${styles.dashboard} ${styles[`severity-${severity}`]} ${isExpanded ? styles.expanded : styles.collapsed}`}
      role="region"
      aria-label="Weekly Nutrition Dashboard"
    >
      {/* Compact View (Always Visible) */}
      <div className={styles.compactView}>
        <div className={styles.compactLeft}>
          {/* Overall Compliance Ring */}
          <ComplianceScore
            score={weeklyCompliance.overall}
            size="compact"
            showLabel={true}
          />

          {/* Macro Pills */}
          <div className={styles.macroPills}>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Calories</span>
              <span className={styles.pillValue}>
                {Math.round(weeklyTotals.calories)}
                <span className={styles.pillTarget}>
                  / {Math.round(weeklyGoals.calories)}
                </span>
              </span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Protein</span>
              <span className={styles.pillValue}>
                {Math.round(weeklyTotals.protein)}g
                <span className={styles.pillTarget}>
                  / {Math.round(weeklyGoals.protein)}g
                </span>
              </span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Carbs</span>
              <span className={styles.pillValue}>
                {Math.round(weeklyTotals.carbs)}g
                <span className={styles.pillTarget}>
                  / {Math.round(weeklyGoals.carbs)}g
                </span>
              </span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Fat</span>
              <span className={styles.pillValue}>
                {Math.round(weeklyTotals.fat)}g
                <span className={styles.pillTarget}>
                  / {Math.round(weeklyGoals.fat)}g
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.compactRight}>
          {/* Top Deficiencies Alert */}
          {weeklyCompliance.deficiencies.length > 0 && (
            <div className={styles.deficiencyAlert}>
              <span className={styles.alertIcon}>⚠️</span>
              <span className={styles.alertText}>
                {weeklyCompliance.deficiencies.length} nutrient
                {weeklyCompliance.deficiencies.length > 1 ? "s" : ""} below
                target
              </span>
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            className={styles.expandButton}
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? "Collapse nutrition details"
                : "Expand nutrition details"
            }
          >
            {isExpanded ? (
              <>
                <span>Hide Details</span>
                <svg
                  className={styles.chevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>Show Details</span>
                <svg
                  className={styles.chevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded View (Conditional) */}
      {isExpanded && (
        <div className={styles.expandedView}>
          <div className={styles.expandedGrid}>
            {/* Left Column: Macro Breakdown */}
            <div className={styles.expandedSection}>
              <h3 className={styles.sectionTitle}>
                Macronutrient Distribution
              </h3>
              <MacroSummary
                totals={{
                  protein: weeklyTotals.protein,
                  carbs: weeklyTotals.carbs,
                  fat: weeklyTotals.fat,
                  calories: weeklyTotals.calories,
                }}
                goals={{
                  protein: weeklyGoals.protein,
                  carbs: weeklyGoals.carbs,
                  fat: weeklyGoals.fat,
                  calories: weeklyGoals.calories,
                }}
                percentages={macroPercentages}
              />
            </div>

            {/* Middle Column: Micronutrient Highlights */}
            <div className={styles.expandedSection}>
              <h3 className={styles.sectionTitle}>Key Micronutrients</h3>
              <MicronutrientHighlights
                totals={weeklyTotals}
                goals={weeklyGoals}
              />
            </div>

            {/* Right Column: Variety & Compliance */}
            <div className={styles.expandedSection}>
              <h3 className={styles.sectionTitle}>Dietary Variety</h3>
              <div className={styles.varietyStats}>
                <div className={styles.varietyStat}>
                  <span className={styles.varietyLabel}>
                    Unique Ingredients
                  </span>
                  <span className={styles.varietyValue}>
                    {variety.uniqueIngredients}
                  </span>
                </div>
                <div className={styles.varietyStat}>
                  <span className={styles.varietyLabel}>Unique Recipes</span>
                  <span className={styles.varietyValue}>
                    {variety.uniqueRecipes}
                  </span>
                </div>
                <div className={styles.varietyStat}>
                  <span className={styles.varietyLabel}>Cuisine Diversity</span>
                  <div className={styles.varietyBar}>
                    <div
                      className={styles.varietyBarFill}
                      style={{ width: `${variety.cuisineDiversity * 100}%` }}
                    />
                  </div>
                  <span className={styles.varietyPercent}>
                    {Math.round(variety.cuisineDiversity * 100)}%
                  </span>
                </div>
                <div className={styles.varietyStat}>
                  <span className={styles.varietyLabel}>Color Diversity</span>
                  <div className={styles.varietyBar}>
                    <div
                      className={styles.varietyBarFill}
                      style={{ width: `${variety.colorDiversity * 100}%` }}
                    />
                  </div>
                  <span className={styles.varietyPercent}>
                    {Math.round(variety.colorDiversity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Suggestions */}
          {weeklyCompliance.deficiencies.length > 0 && (
            <div className={styles.suggestions}>
              <h4 className={styles.suggestionsTitle}>
                💡 Nutrition Recommendations
              </h4>
              <ul className={styles.suggestionsList}>
                {weeklyCompliance.deficiencies.slice(0, 5).map((def, idx) => (
                  <li key={idx} className={styles.suggestionItem}>
                    <strong>{formatNutrientName(def.nutrient)}</strong>:
                    Currently averaging {Math.round(def.averageDaily)}
                    {getNutrientUnit(def.nutrient)}/day (target:{" "}
                    {Math.round(def.targetDaily)}
                    {getNutrientUnit(def.nutrient)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
