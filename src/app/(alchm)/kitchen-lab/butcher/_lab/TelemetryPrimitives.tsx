"use client";

import { useId, useState, type JSX } from "react";
import { BUTCHER_CUTS } from "@/data/butcher/cutsCatalogue";
import { FAT_CLASS_COLOR, FAT_CLASS_LABEL, FAT_CLASS_THRESHOLDS_G } from "@/lib/butcher/science/fatClass";
import type { CutProximate, FatClass, FdcButcherRecord } from "@/lib/butcher/types";

/**
 * Small, reusable read-outs for the Butcher Shop telemetry: scaled metric bars,
 * the per-100 g composition bar, the fat-class chip and the USDA provenance
 * badge. Every bar is drawn on a stated scale (the catalogue's own maximum),
 * so a bar's length means the same thing for every cut.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/TelemetryPrimitives.tsx
 */

/** Bar scales: the fattest and most collagen-rich cut in the catalogue. */
export const CATALOGUE_MAX = {
  fatG: Math.max(...BUTCHER_CUTS.map((c) => c.proximate.fatG)),
  collagenG: Math.max(...BUTCHER_CUTS.map((c) => c.proximate.collagenG)),
};

/** Fat-class boundaries and the overlay's collagen bands, as bar ticks. */
export const FAT_TICKS_G: readonly number[] = Object.values(FAT_CLASS_THRESHOLDS_G);
export const COLLAGEN_TICKS_G: readonly number[] = [1.3, 2.2];

function pct(value: number, max: number): number {
  return max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
}

export function MetricBar({
  value,
  max,
  ticks,
  color,
}: {
  readonly value: number;
  readonly max: number;
  readonly ticks: readonly number[];
  readonly color: string;
}): JSX.Element {
  return (
    <div className="bt-bar" aria-hidden="true">
      <span className="bt-bar__fill" style={{ width: `${pct(value, max)}%`, backgroundColor: color }} />
      {ticks.map((t) => (
        <span key={t} className="bt-bar__tick" style={{ left: `${pct(t, max)}%` }} />
      ))}
    </div>
  );
}

export function FatClassChip({ fatClass }: { readonly fatClass: FatClass }): JSX.Element {
  return (
    <span className="bt-chip" data-fat-class={fatClass}>
      <span className="bt-chip__dot" style={{ backgroundColor: FAT_CLASS_COLOR[fatClass] }} aria-hidden="true" />
      {FAT_CLASS_LABEL[fatClass]}
    </span>
  );
}

const COMPOSITION_PARTS = [
  { key: "waterG", label: "Water", className: "bt-comp--water" },
  { key: "proteinG", label: "Protein", className: "bt-comp--protein" },
  { key: "fatG", label: "Fat", className: "bt-comp--fat" },
  { key: "ashG", label: "Ash", className: "bt-comp--ash" },
] as const;

/** What 100 g of the raw cut is made of, as one stacked bar plus exact values. */
export function CompositionBar({ proximate }: { readonly proximate: CutProximate }): JSX.Element {
  return (
    <div>
      <div className="bt-comp" aria-hidden="true">
        {COMPOSITION_PARTS.map((p) => (
          <span key={p.key} className={p.className} style={{ flexGrow: proximate[p.key] }} />
        ))}
      </div>
      <dl className="bt-comp-legend">
        {COMPOSITION_PARTS.map((p) => (
          <div key={p.key}>
            <dt><span className={`bt-comp-key ${p.className}`} aria-hidden="true" />{p.label}</dt>
            <dd className="bt-num">{proximate[p.key].toFixed(1)} g</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** EXACT / PROXY badge; opens the USDA record behind the cut's composition. */
export function ProvenanceBadge({ record }: { readonly record: FdcButcherRecord }): JSX.Element {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const isProxy = record.match === "PROXY";
  return (
    <div className="bt-prov">
      <button
        type="button"
        className="bt-prov__badge"
        data-match={record.match}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title={`${isProxy ? "Proxy USDA record" : "Exact USDA record"}: ${record.description}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <span className="bt-prov__dot" aria-hidden="true" />
        {isProxy ? "Proxy" : "Exact"} · FDC <span className="bt-num">{record.fdcId}</span>
      </button>
      {open ? <ProvenancePanel id={panelId} record={record} /> : null}
    </div>
  );
}

function ProvenancePanel({ id, record }: { readonly id: string; readonly record: FdcButcherRecord }): JSX.Element {
  return (
    <div id={id} className="bt-prov__panel">
      <p className="bt-label">USDA FoodData Central · {record.dataType} · NDB {record.ndbNumber}</p>
      <p className="mt-1 text-white/85">{record.description}</p>
      {record.matchNote ? <p className="mt-1 text-white/60">{record.matchNote}</p> : null}
      <a className="mt-1.5 inline-block underline" href={`https://fdc.nal.usda.gov/food-details/${record.fdcId}/nutrients`} target="_blank" rel="noreferrer">
        Open FDC {record.fdcId} ↗
      </a>
    </div>
  );
}
