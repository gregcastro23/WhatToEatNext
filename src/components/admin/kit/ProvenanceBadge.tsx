"use client";

/**
 * Admin kit — the one liveness badge.
 *
 * Replaces the ~25 hand-typed `● LIVE` literals across the admin, which used
 * seven different words for the false state. Status is carried by dot shape +
 * color + word together, never by color alone.
 *
 * Visual treatments for the two "no value" states are deliberately non-color
 * so they survive both a colorblind operator and a greyscale screenshot:
 * NO SOURCE gets a diagonal hatch, NOT INSTRUMENTED gets a dashed outline.
 */

import React from "react";
import {
  formatAge,
  PROVENANCE_LABEL,
  type Provenance,
  type ProvenanceState,
} from "@/components/admin/kit/provenance";

const STYLE: Record<
  ProvenanceState,
  { color: string; dot: string; border: string; extra?: React.CSSProperties }
> = {
  live: {
    color: "var(--status-ok)",
    dot: "●",
    border: "color-mix(in srgb, var(--status-ok), transparent 70%)",
  },
  stale: {
    color: "var(--status-warn)",
    dot: "◐",
    border: "color-mix(in srgb, var(--status-warn), transparent 70%)",
  },
  "no-source": {
    color: "var(--status-unknown)",
    dot: "○",
    border: "color-mix(in srgb, var(--status-unknown), transparent 70%)",
    // Hatch reads as "nothing here" without relying on hue.
    extra: {
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 4px, transparent 4px 8px)",
    },
  },
  "not-instrumented": {
    color: "var(--status-unknown)",
    dot: "◌",
    border: "color-mix(in srgb, var(--status-unknown), transparent 55%)",
    extra: { borderStyle: "dashed" },
  },
  partial: {
    color: "var(--status-warn)",
    dot: "◑",
    border: "color-mix(in srgb, var(--status-warn), transparent 70%)",
  },
};

export interface ProvenanceBadgeProps {
  provenance: Provenance;
  /** Hide the word, keep the dot. For tight rows and table cells. */
  compact?: boolean;
  className?: string;
}

export function ProvenanceBadge({
  provenance,
  compact = false,
  className,
}: ProvenanceBadgeProps): React.JSX.Element {
  const style = STYLE[provenance.state];

  let label = PROVENANCE_LABEL[provenance.state];
  if (provenance.state === "stale" && typeof provenance.ageMs === "number") {
    label = `${label} ${formatAge(provenance.ageMs)}`;
  }
  if (
    provenance.state === "partial" &&
    typeof provenance.ok === "number" &&
    typeof provenance.total === "number"
  ) {
    label = `${label} ${provenance.ok}/${provenance.total}`;
  }

  // The dot is decorative; the word carries the meaning for screen readers.
  const title = provenance.detail ? `${label} — ${provenance.detail}` : label;

  return (
    <span
      className={className}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: compact ? "1px 5px" : "2px 7px",
        borderRadius: 999,
        border: `1px solid ${style.border}`,
        borderStyle: style.extra?.borderStyle ?? "solid",
        color: style.color,
        fontFamily: "var(--f-mono, ui-monospace, monospace)",
        fontSize: compact ? 9 : 10,
        letterSpacing: "0.14em",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...style.extra,
      }}
    >
      <span aria-hidden="true">{style.dot}</span>
      {!compact && <span>{label}</span>}
      {compact && <span className="sr-only">{label}</span>}
    </span>
  );
}

export default ProvenanceBadge;
