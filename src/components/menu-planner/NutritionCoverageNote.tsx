import type { NutritionCoverage } from "@/types/nutrition";
import { coverageNote } from "@/utils/menuPlanner/nutritionCoverage";
import type React from "react";

/**
 * The label a nutrition total carries when some planned meals publish no
 * nutrition ("partial: 2 of 3 meals have nutrition"), or the reason there is
 * no total. Renders nothing when the total is whole. Every planner surface,
 * the Nutrition Dashboard included, is on the alchm dark palette.
 */
export default function NutritionCoverageNote({
  coverage,
  className = "",
}: {
  coverage: NutritionCoverage;
  className?: string;
}): React.JSX.Element | null {
  const note = coverageNote(coverage);
  if (!note) return null;
  return (
    <p
      className={`font-mono text-[10px] text-gold-accent ${className}`}
      data-testid="nutrition-coverage-note"
    >
      {note}
    </p>
  );
}
