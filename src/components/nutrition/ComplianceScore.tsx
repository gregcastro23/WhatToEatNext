// src/components/nutrition/ComplianceScore.tsx
import React from "react";
import styles from "./ComplianceScore.module.css";

export type ComplianceScoreSize = "compact" | "default" | "large";

interface ComplianceScoreProps {
  score: number; // 0-100
  size?: ComplianceScoreSize;
  showLabel?: boolean;
  label?: string;
}

const getSeverityClass = (score: number): string => {
  if (score >= 90) return "severity-excellent";
  if (score >= 75) return "severity-good";
  if (score >= 50) return "severity-fair";
  if (score >= 25) return "severity-poor";
  return "severity-critical";
};

export function ComplianceScore({
  score,
  size = "default",
  showLabel = false,
  label, // Destructure the new label prop
}: ComplianceScoreProps) {
  const normalizedScore = Math.max(0, Math.min(100, score)); // Ensure score is between 0 and 100
  const severityClass = getSeverityClass(normalizedScore);

  return (
    <div
      className={`${styles.complianceScore} ${styles[size]} ${styles[severityClass]}`}
      role="status"
      aria-label={`Nutrition compliance score: ${normalizedScore.toFixed(0)}%`}
    >
      <svg className={styles.ringSvg} viewBox="0 0 36 36">
        <circle
          className={styles.ringBackground}
          cx="18"
          cy="18"
          r="16"
        ></circle>
        <circle
          className={styles.ringProgress}
          cx="18"
          cy="18"
          r="16"
          strokeDasharray={`${normalizedScore}, 100`}
        ></circle>
      </svg>
      <div className={styles.scoreValue}>{normalizedScore.toFixed(0)}%</div>
      {showLabel && (
        <div className={styles.scoreLabel}>{label || "Compliance"}</div>
      )}
    </div>
  );
}
