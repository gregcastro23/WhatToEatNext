import type { NutritionCoverage } from "@/types/nutrition";
import { coverageNote } from "@/utils/menuPlanner/nutritionCoverage";
import type React from "react";

/** Dark = the alchm planner surfaces; light = the (not yet reskinned) dashboard modal. */
const TONE_CLASSES: Record<"dark" | "light", string> = {
  dark: "text-[10px] text-gold-accent",
  light: "text-sm text-amber-700",
};

/**
 * The label a nutrition total carries when some planned meals publish no
 * nutrition ("partial: 2 of 3 meals have nutrition"), or the reason there is
 * no total. Renders nothing when the total is whole.
 */
export default function NutritionCoverageNote({
  coverage,
  className = "",
  tone = "dark",
}: {
  coverage: NutritionCoverage;
  className?: string;
  tone?: "dark" | "light";
}): React.JSX.Element | null {
  const note = coverageNote(coverage);
  if (!note) return null;
  return (
    <p
      className={`font-mono ${TONE_CLASSES[tone]} ${className}`}
      data-testid="nutrition-coverage-note"
    >
      {note}
    </p>
  );
}
