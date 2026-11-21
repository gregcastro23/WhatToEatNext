"use client";

import { getCutById } from "@/data/butcher/cutsCatalogue";
import { MAX_PINNED_CUTS, buildCutComparison } from "@/lib/butcher/science/cutComparison";
import type { AnatomicalCut } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * Quick-compare drawer: pin up to two cuts and read marbling, collagen, best
 * method and modelled gray band side by side. Shared by the Breakdown and
 * Thermal & Grain tabs; pins live in `useButcherLab` so they survive tab
 * switches.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/CutCompareDrawer.tsx
 */

function ComparisonTable({ a, b }: { readonly a: AnatomicalCut; readonly b: AnatomicalCut }): JSX.Element {
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

export function CutCompareDrawer({
  cut,
  comparePins,
  onTogglePin,
}: {
  readonly cut: AnatomicalCut;
  readonly comparePins: readonly string[];
  readonly onTogglePin: (cutId: string) => void;
}): JSX.Element {
  const pinned = comparePins.map((id) => getCutById(id)).filter((c): c is AnatomicalCut => c !== null);
  const isPinned = comparePins.includes(cut.id);
  const [first, second] = pinned;
  return (
    <section className="bt-card space-y-3" aria-label="Cut comparison">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg">Quick Compare</h3>
        <button type="button" className="bt-btn" aria-pressed={isPinned} onClick={() => onTogglePin(cut.id)}>
          {isPinned ? `Unpin ${cut.name}` : `Pin ${cut.name} to compare`}
        </button>
      </div>
      {pinned.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Pinned cuts">
          {pinned.map((c) => (
            <li key={c.id}>
              <button type="button" className="bt-cut-pill" onClick={() => onTogglePin(c.id)} aria-label={`Unpin ${c.name}`}>
                {c.name} ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {first && second ? (
        <ComparisonTable a={first} b={second} />
      ) : (
        <p className="text-xs text-white/55">
          Pin {MAX_PINNED_CUTS - pinned.length} more cut{MAX_PINNED_CUTS - pinned.length === 1 ? "" : "s"} (e.g. Ribeye vs NY Strip, or Brisket Flat vs Point) to compare them side by side.
        </p>
      )}
    </section>
  );
}
