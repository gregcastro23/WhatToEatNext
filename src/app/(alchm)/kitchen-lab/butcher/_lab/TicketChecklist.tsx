"use client";

import type { TicketCheck } from "@/lib/butcher/science/ticketChecklist";
import type { JSX } from "react";

/**
 * Live ✓ / ✗ list of a ticket's requirements against the cut on the block,
 * plus the carve meters (grain and portion) that the scorecard grades.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/TicketChecklist.tsx
 */

export function TicketChecklist({
  checks,
  cutName,
}: {
  readonly checks: readonly TicketCheck[];
  readonly cutName: string;
}): JSX.Element {
  return (
    <div>
      <p className="bt-label">Requirements · live vs {cutName}</p>
      <ul className="bt-checks" aria-label="Ticket requirements">
        {checks.map((c) => (
          <li key={c.id} data-met={c.met}>
            <span className="bt-checks__mark" aria-hidden="true">{c.met ? "✓" : "✗"}</span>
            <span className="bt-checks__label">
              {c.label}
              <span className="sr-only">{c.met ? " — met" : " — not met"}</span>
            </span>
            <span className="bt-num bt-checks__actual">{c.actual}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Meter colour bands on the game's own grade cut-offs: ≥85 is grade A or better, ≥60 is C or better. */
function meterBand(pct: number): "good" | "fair" | "poor" {
  if (pct >= 85) return "good";
  if (pct >= 60) return "fair";
  return "poor";
}

export function ScoreMeter({ label, pct }: { readonly label: string; readonly pct: number }): JSX.Element {
  const clamped = Math.max(0, Math.min(100, pct));
  const band = meterBand(clamped);
  return (
    <div className="bt-meter" data-band={band}>
      <div className="flex items-baseline justify-between gap-2 text-[11px]">
        <span className="text-white/60">{label}</span>
        <span className="bt-num text-white">{Math.round(clamped)}%</span>
      </div>
      <div className="bt-bar" aria-hidden="true">
        <span className="bt-bar__fill bt-meter__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
