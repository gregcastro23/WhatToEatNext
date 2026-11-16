/**
 * Scaling a formula — by a factor, or around the one ingredient you are
 * short of ("I only have 135 g of butter").
 *
 * Grams are scaled exactly and left unrounded: rounding is a display choice,
 * and rounding here would let a scaled formula drift from its own ratios.
 *
 * @file src/lib/baking/scaling.ts
 */
import type { Formula } from "./formulaTypes";

export function scaleFormula(formula: Formula, factor: number): Formula {
  if (!(Number.isFinite(factor) && factor > 0)) throw new RangeError(`scale factor must be positive, received ${factor}`);
  return { ...formula, lines: formula.lines.map((line) => ({ ...line, grams: line.grams * factor })) };
}

export interface LimitScaling {
  formula: Formula;
  factor: number;
}

/**
 * Scale every line so that line `lineIndex` becomes `availableGrams`.
 * @throws RangeError when the line is missing or holds zero grams (no ratio to keep).
 */
export function scaleToLimit(formula: Formula, lineIndex: number, availableGrams: number): LimitScaling {
  const line = formula.lines[lineIndex];
  if (line === undefined) throw new RangeError(`no formula line ${lineIndex}`);
  if (!(line.grams > 0)) throw new RangeError(`${line.ingredientId} has no grams to scale from`);
  if (!(Number.isFinite(availableGrams) && availableGrams > 0)) throw new RangeError(`available grams must be positive, received ${availableGrams}`);
  const factor = availableGrams / line.grams;
  return { formula: scaleFormula(formula, factor), factor };
}

/** Replace one line's grams, leaving the rest as they are. */
export function setLineGrams(formula: Formula, lineIndex: number, grams: number): Formula {
  if (!(Number.isFinite(grams) && grams >= 0)) throw new RangeError(`grams must be non-negative, received ${grams}`);
  return { ...formula, lines: formula.lines.map((line, i) => (i === lineIndex ? { ...line, grams } : line)) };
}
