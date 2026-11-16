"use client";

import type { DeltaEntry } from "@/lib/baking/substitution";
import { fmtNum, fmtSigned } from "./format";
import type { JSX } from "react";

/** Relative changes past ±100 % are drawn at the edge and labelled with their true value. */
const FULL_SCALE = 1;

function Bar({ entry, compare }: { entry: DeltaEntry; compare: DeltaEntry | null }): JSX.Element {
  const rel = entry.relative ?? 0;
  const width = Math.min(Math.abs(rel) / FULL_SCALE, 1) * 50;
  const patchedRel = compare === null ? null : compare.relative;
  const patchedWidth = patchedRel === null ? null : Math.min(Math.abs(patchedRel) / FULL_SCALE, 1) * 50;
  return (
    <div className="grid grid-cols-[9.5rem_1fr_6.5rem] items-center gap-2 py-1 text-[12px]">
      <span className="truncate text-white/70" title={entry.label}>
        {entry.label}
      </span>
      <svg viewBox="0 0 100 10" className="h-3 w-full" role="img" aria-label={`${entry.label} ${fmtSigned(rel * 100, 0, " %")}`}>
        <line x1="50" y1="0" x2="50" y2="10" stroke="currentColor" strokeOpacity="0.25" />
        <rect x={rel < 0 ? 50 - width : 50} y="2" width={width} height="6" fill={rel < 0 ? "rgb(248 113 113)" : "rgb(52 211 153)"} opacity="0.85" />
        {patchedWidth === null || patchedRel === null ? null : (
          <rect x={patchedRel < 0 ? 50 - patchedWidth : 50} y="4" width={patchedWidth} height="2" fill="white" opacity="0.9" />
        )}
      </svg>
      <span className="bl-num text-right text-white/80">
        {entry.delta === null ? "—" : `${fmtSigned(entry.delta, Math.abs(entry.delta) < 10 ? 2 : 0)} ${entry.unit === "fraction" || entry.unit === "a_w" ? "" : entry.unit}`}
      </span>
    </div>
  );
}

/** ΔĪ, original → swapped (coloured bars), with the patched result overlaid (white line). */
export function DeltaBars({ swap, patched }: { swap: readonly DeltaEntry[]; patched?: readonly DeltaEntry[] }): JSX.Element {
  return (
    <div>
      {swap.map((entry) => (
        <Bar key={entry.id} entry={entry} compare={patched?.find((p) => p.id === entry.id) ?? null} />
      ))}
      <p className="mt-2 text-[11px] text-white/40">
        Bars: change after the swap, relative to the original (edge = ±{fmtNum(FULL_SCALE * 100, 0)} %). White line: after the patch.
      </p>
    </div>
  );
}
