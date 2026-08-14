import { z } from "zod";

export const lintDebtBaselineSchema = z.object({
  trackedTotal: z.number().int().nonnegative(),
  declined: z.object({
    rules: z.record(z.string(), z.number().int().nonnegative()),
  }),
  rules: z.record(
    z.string(),
    z.object({
      count: z.number().int().nonnegative(),
      autoFixable: z.number().int().nonnegative(),
    }),
  ),
});

interface LintDebtComparison {
  exceedsBaseline: boolean;
  increasedBy: number;
}

export const compareLintDebt = (
  currentTotal: number,
  baselineTotal: number,
): LintDebtComparison => {
  const delta = currentTotal - baselineTotal;

  return {
    exceedsBaseline: delta > 0,
    increasedBy: Math.max(delta, 0),
  };
};
