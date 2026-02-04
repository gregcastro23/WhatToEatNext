// src/components/nutrition/NutritionRing.tsx
import React from "react";
import styles from "./NutritionRing.module.css";

interface NutritionRingProps {
  percentage: number; // 0-100
  color?: string; // Optional custom color for the progress ring
  backgroundColor?: string; // Optional custom color for the background ring
  size?: number; // Diameter of the ring in pixels
  strokeWidth?: number; // Width of the ring stroke
  label?: string; // Text label to display in the center
  value?: string; // Value to display in the center (e.g., "150g")
  max?: number;
}

export function NutritionRing({
  percentage,
  color = "#20c997", // Default to a general "good" color
  backgroundColor = "#e0e0e0",
  size = 60,
  strokeWidth = 6,
  label,
  value,
}: NutritionRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={styles.nutritionRingContainer}
      style={{ width: size, height: size }}
    >
      <svg
        className={styles.nutritionRingSvg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className={styles.ringBackground}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        ></circle>
        <circle
          className={styles.ringProgress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        ></circle>
      </svg>
      <div className={styles.content}>
        {value && <span className={styles.value}>{value}</span>}
        {label && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
}
