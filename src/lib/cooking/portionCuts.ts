/**
 * Which cut a recipe line measured, where USDA weighed a measure only several
 * ways: a cup of walnuts is 80 g ground, 117 g chopped, 120 g in pieces or
 * chips and 100 g as shelled halves (FDC 170187).
 *
 * @file src/lib/cooking/portionCuts.ts
 */
import type { MeasuredCut } from "@/data/cooking/measuredPortions";

export interface LineCut {
  /** The cut to weigh the line at. */
  cut: MeasuredCut;
  /** Grams per ONE measure the line may weigh beyond `cut`, when it named no cut. */
  spread?: number;
}

/** The words a cut is named by: "chopped or diced" is chopped, diced. A parenthetical is a note. */
function cutWords(as: string): string[] {
  return as
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 0 && word !== "or" && word !== "and");
}

/**
 * The one cut a recipe line's own words name: "1 cup walnuts, chopped" is the
 * chopped cup. A line that names none of the cuts, or more than one ("coarsely
 * chopped, not ground"), names no cut.
 */
function cutNamedBy(cuts: readonly MeasuredCut[], lineText: string | undefined): MeasuredCut | undefined {
  const words = new Set((lineText ?? "").toLowerCase().split(/[^a-z]+/));
  const named = cuts.filter((cut) => cutWords(cut.as).some((word) => words.has(word)));
  return named.length === 1 ? named[0] : undefined;
}

/**
 * The cut a line is weighed at: the one it names; otherwise the lightest, with
 * the gap to the heaviest as its spread. Both ends are measured, so for any cut
 * USDA weighed the line's mass lies between them. Null when there are no cuts.
 */
export function cutForLine(cuts: readonly MeasuredCut[], lineText: string | undefined): LineCut | null {
  const named = cutNamedBy(cuts, lineText);
  if (named !== undefined) return { cut: named };
  const lightest = cuts.reduce<MeasuredCut | undefined>((min, c) => (min === undefined || c.grams < min.grams ? c : min), undefined);
  if (lightest === undefined) return null;
  return { cut: lightest, spread: Math.max(...cuts.map((c) => c.grams)) - lightest.grams };
}
