"use client";

import dynamic from "next/dynamic";
import { getCutById } from "@/data/butcher/cutsCatalogue";
import { MAX_PINNED_CUTS } from "@/lib/butcher/science/comparePins";
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

const ComparisonTable = dynamic(() => import("./CutComparisonTable").then((m) => m.ComparisonTable), {
  loading: () => <p className="text-xs text-white/55">Comparing…</p>,
});

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
