"use client";

/**
 * Nutritional Dashboard Component
 * Displays weekly nutrition totals, macronutrient breakdown, and alchemical metrics
 *
 * @file src/components/menu-planner/NutritionalDashboard.tsx
 * @created 2026-01-11 (Phase 3)
 */

import React, { useMemo, useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type {
  DayOfWeek,
  NutritionalGoals,
  WeeklyNutritionTotals,
} from "@/types/menuPlanner";
import {
  calculateWeeklyTotals,
  calculateMacroBreakdown,
  generateMacroChartData,
  generateElementalChartData,
  generateDailyCaloriesChartData,
  generateGregsEnergyChartData,
  getNutritionalInsights,
} from "@/utils/menuPlanner/nutritionalCalculator";

interface NutritionalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  goals?: NutritionalGoals;
}

/**
 * Simple Pie Chart Component
 */
function PieChart({
  data,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativePercent = 0;

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Pie Chart */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const offset = cumulativePercent;
            cumulativePercent += percent;

            // SVG circle with stroke-dasharray for pie slice
            const circumference = 2 * Math.PI * 30; // radius = 30
            const dashArray = `${(percent / 100) * circumference} ${circumference}`;
            const dashOffset = -((offset / 100) * circumference);

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="30"
                fill="transparent"
                stroke={item.color || "#8b5cf6"}
                strokeWidth="30"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                style={{ transition: "all 0.3s ease" }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color || "#8b5cf6" }}
            />
            <span className="text-sm">
              {item.label}: {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple Bar Chart Component
 */
function BarChart({
  data,
  unit,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  unit?: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-600">
                {Math.round(item.value)} {unit || ""}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || "#8b5cf6",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Radar Chart Component
 */
function RadarChart({
  data,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
}) {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 20;
  const levels = 5;

  // Calculate points for the data polygon
  const dataPoints = data.map((item, i) => {
    const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
    const distance = item.value * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  // Calculate axis labels positions
  const axisLabels = data.map((item, i) => {
    const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
    const distance = radius + 15;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
      label: item.label,
      color: item.color,
    };
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background levels */}
        {Array.from({ length: levels }, (_, i) => {
          const levelRadius = ((i + 1) / levels) * radius;
          const levelPoints = data.map((_, j) => {
            const angle = (j * 2 * Math.PI) / data.length - Math.PI / 2;
            return {
              x: center + levelRadius * Math.cos(angle),
              y: center + levelRadius * Math.sin(angle),
            };
          });
          const levelPath =
            levelPoints
              .map((p, j) => `${j === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ") + " Z";

          return (
            <path
              key={i}
              d={levelPath}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        {data.map((_, i) => {
          const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="#8b5cf6"
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={data[i].color || "#8b5cf6"}
          />
        ))}

        {/* Labels */}
        {axisLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-xs font-medium"
            fill={label.color || "#8b5cf6"}
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Main Nutritional Dashboard Component
 */
export default function NutritionalDashboard({
  isOpen,
  onClose,
  goals,
}: NutritionalDashboardProps) {
  const { currentMenu } = useMenuPlanner();
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  // Group meals by day
  const mealsByDay = useMemo(() => {
    if (!currentMenu) return {} as Record<DayOfWeek, any[]>;

    const grouped: Record<DayOfWeek, any[]> = {} as any;
    ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).forEach((day) => {
      grouped[day] = [];
    });

    currentMenu.meals.forEach((meal) => {
      grouped[meal.dayOfWeek].push(meal);
    });

    return grouped;
  }, [currentMenu]);

  // Calculate weekly totals
  const weeklyTotals: WeeklyNutritionTotals = useMemo(() => {
    return calculateWeeklyTotals(mealsByDay);
  }, [mealsByDay]);

  // Calculate macro breakdown
  const macroBreakdown = useMemo(() => {
    return calculateMacroBreakdown(
      weeklyTotals.totalProtein / 7,
      weeklyTotals.totalCarbs / 7,
      weeklyTotals.totalFat / 7,
    );
  }, [weeklyTotals]);

  // Generate chart data
  const macroChart = useMemo(
    () => generateMacroChartData(macroBreakdown),
    [macroBreakdown],
  );
  const elementalChart = useMemo(
    () => generateElementalChartData(weeklyTotals.weeklyElementalBalance),
    [weeklyTotals],
  );
  const caloriesChart = useMemo(
    () => generateDailyCaloriesChartData(weeklyTotals.dailyBreakdown),
    [weeklyTotals],
  );
  const gregsEnergyChart = useMemo(
    () => generateGregsEnergyChartData(weeklyTotals.dailyBreakdown),
    [weeklyTotals],
  );

  // Get insights
  const insights = useMemo(
    () => getNutritionalInsights(weeklyTotals, goals),
    [weeklyTotals, goals],
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Nutritional Dashboard</h2>
              <p className="text-purple-100 text-sm mt-1">
                Weekly nutrition totals and alchemical metrics
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overview Section */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("overview")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                📊 Weekly Overview
              </h3>
              <span className="text-gray-600">
                {expandedSection === "overview" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "overview" && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Calories</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.round(weeklyTotals.totalCalories)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalCalories / 7)}/day avg
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Protein</p>
                  <p className="text-2xl font-bold text-red-700">
                    {Math.round(weeklyTotals.totalProtein)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalProtein / 7)}g/day avg
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Carbs</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {Math.round(weeklyTotals.totalCarbs)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalCarbs / 7)}g/day avg
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Fat</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.round(weeklyTotals.totalFat)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(weeklyTotals.totalFat / 7)}g/day avg
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Macronutrient Distribution */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("macros")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🥗 Macronutrient Distribution
              </h3>
              <span className="text-gray-600">
                {expandedSection === "macros" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "macros" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <PieChart data={macroChart.data} />
              </div>
            )}
          </section>

          {/* Daily Calories */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("calories")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                📈 Daily Calories
              </h3>
              <span className="text-gray-600">
                {expandedSection === "calories" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "calories" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <BarChart data={caloriesChart.data} unit={caloriesChart.unit} />
              </div>
            )}
          </section>

          {/* Elemental Balance */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("elemental")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🔮 Elemental Balance
              </h3>
              <span className="text-gray-600">
                {expandedSection === "elemental" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "elemental" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <RadarChart data={elementalChart.data} />
              </div>
            )}
          </section>

          {/* Greg's Energy Trend */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("gregs-energy")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                ⚡ Greg&apos;s Energy Trend
              </h3>
              <span className="text-gray-600">
                {expandedSection === "gregs-energy" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "gregs-energy" && (
              <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
                <BarChart
                  data={gregsEnergyChart.data}
                  unit={gregsEnergyChart.unit}
                />
              </div>
            )}
          </section>

          {/* Alchemical Metrics */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("alchemical")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                🧪 Alchemical Metrics
              </h3>
              <span className="text-gray-600">
                {expandedSection === "alchemical" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "alchemical" && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Greg&apos;s Energy</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {weeklyTotals.averageGregsEnergy.toFixed(3)}
                  </p>
                </div>

                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Monica Constant</p>
                  <p className="text-2xl font-bold text-pink-700">
                    {weeklyTotals.averageMonica.toFixed(3)}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Kalchm</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {weeklyTotals.averageKalchm.toFixed(3)}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Insights */}
          <section className="mb-6">
            <button
              onClick={() => toggleSection("insights")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-800">
                💡 Nutritional Insights
              </h3>
              <span className="text-gray-600">
                {expandedSection === "insights" ? "▼" : "▶"}
              </span>
            </button>

            {expandedSection === "insights" && (
              <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
