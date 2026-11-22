"use client";

import { buildCutComparison } from "@/lib/butcher/science/cutComparison";
import type { AnatomicalCut } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * The two-cut comparison table, loaded on demand by `CutCompareDrawer` (it
 * runs the 1D trajectory solver for each cut's modelled gray band).
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/CutComparisonTable.tsx
 */

export function ComparisonTable({ a, b }: { readonly a: AnatomicalCut; readonly b: AnatomicalCut }): JSX.Element {
  const rows = buildCutComparison(a, b);
  const cellClass = (side: "a" | "b", higher: "a" | "b" | null): string =>
    `bt-num px-2 py-1.5 ${higher === side ? "text-amber-200" : "text-white/80"}`;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-xs">
        <caption className="sr-only">Comparison of {a.name} and {b.name}</caption>
        <thead>
          <tr className="text-white/55">
            <th scope="col" className="px-2 py-1.5 font-medium">Property</th>
            <th scope="col" className="px-2 py-1.5 font-medium text-white/85">{a.name}</th>
            <th scope="col" className="px-2 py-1.5 font-medium text-white/85">{b.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <th scope="row" className="px-2 py-1.5 font-normal text-white/60">{row.label}</th>
              <td className={cellClass("a", row.higher)}>{row.a}</td>
              <td className={cellClass("b", row.higher)}>{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
