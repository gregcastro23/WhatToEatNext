"use client";

import { getFdcRecordForCut } from "@/data/butcher/cutsCatalogue";
import { FAT_CLASS_LABEL } from "@/lib/butcher/science/fatClass";
import type { AnatomicalCut } from "@/lib/butcher/types";
import type { JSX } from "react";

/**
 * Compact read-out shown directly under the stage on narrow screens, where the
 * full telemetry card sits below the cut list. It carries the numbers a cook
 * checks first and links down to the full card. Hidden at ≥1100 px, where the
 * card is a sticky sidebar.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/CutSummaryStrip.tsx
 */
export function CutSummaryStrip({ cut }: { readonly cut: AnatomicalCut }): JSX.Element {
  const fdc = getFdcRecordForCut(cut);
  return (
    <div className="bt-summary bt-narrow-only">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-white">{cut.name}</span>
        {fdc ? (
          <span className="bt-prov__badge is-static" data-match={fdc.match}>
            <span className="bt-prov__dot" aria-hidden="true" />
            {fdc.match === "PROXY" ? "Proxy" : "Exact"}
          </span>
        ) : null}
      </div>
      <dl className="bt-summary__stats">
        <div><dt>Fat</dt><dd className="bt-num">{cut.proximate.fatG.toFixed(1)} g · {FAT_CLASS_LABEL[cut.fatClass]}</dd></div>
        <div><dt>Collagen</dt><dd className="bt-num">{cut.proximate.collagenG.toFixed(2)} g</dd></div>
        <div><dt>Core</dt><dd className="bt-num">{cut.targetCoreTempC.ideal} °C</dd></div>
      </dl>
      <a href="#bt-hud" className="bt-summary__link">Full telemetry ↓</a>
    </div>
  );
}
