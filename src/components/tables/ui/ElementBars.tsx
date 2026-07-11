import { ELEMENT_COLORS, ELEMENTS, type Element } from "./elements";
import { LabelXS } from "./LabelXS";
import type { JSX } from "react";

export interface ElementBarsProps {
  /** Raw or normalized element vector; normalized to percentages internally. */
  values: Partial<Record<Element, number>>;
  className?: string;
}

/** Normalize an element vector into whole percentages summing from raw shares. */
export function elementPercentages(
  values: Partial<Record<Element, number>>,
): Record<Element, number> {
  const total = ELEMENTS.reduce(
    (sum, element) => sum + Math.max(0, values[element] ?? 0),
    0,
  );
  return ELEMENTS.reduce(
    (acc, element) => {
      const value = Math.max(0, values[element] ?? 0);
      acc[element] = total > 0 ? Math.round((value / total) * 100) : 0;
      return acc;
    },
    {} as Record<Element, number>,
  );
}

/**
 * Cosmic Identity bars: per-element 1px-high track with a colored fill and
 * tiny mono % labels; each bar is a progressbar (tables-design-spec.md §2.9).
 */
export function ElementBars({
  values,
  className = "",
}: ElementBarsProps): JSX.Element {
  const percentages = elementPercentages(values);
  return (
    <div className={`space-y-3 ${className}`}>
      {ELEMENTS.map((element) => {
        const colors = ELEMENT_COLORS[element];
        const pct = percentages[element];
        return (
          <div key={element}>
            <div className="flex items-center justify-between mb-1.5">
              <LabelXS className={colors.text}>{element}</LabelXS>
              <span className="text-[10px] font-mono text-alchm-fg-dim tabular-nums">
                {pct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${element} ${pct}%`}
              className="h-px w-full bg-surface-container"
            >
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: colors.hex,
                  boxShadow: `0 0 5px ${colors.hex}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ElementBars;
