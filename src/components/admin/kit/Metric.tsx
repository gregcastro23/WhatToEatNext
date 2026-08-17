"use client";

/**
 * Admin kit — a number that cannot lie.
 *
 * The single largest class in the admin audit (~28 findings) was a failed read
 * rendering as a confident `0`: "0 suspicious IPs", "100% availability",
 * "0 above 200ms". Each was a query that never ran, drawn identically to a
 * real measurement.
 *
 * `Metric` makes that shape impossible to express. The value is not a prop you
 * format yourself — you hand over the raw value *and* its provenance, and when
 * provenance says there is no value the component renders an em-dash with a
 * reason. There is no code path where `no-source` prints a digit.
 *
 * A measured zero and an unmeasurable one are therefore visually distinct by
 * construction, which is the guarantee the honesty tests pin.
 */

import React from "react";
import {
  hasValue,
  type Provenance,
  type ProvenanceState,
} from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";

export interface MetricProps {
  label: string;
  /**
   * The measured value. `null`/`undefined` is treated as absent regardless of
   * provenance, so a service that forgot its flag still cannot print a fake 0.
   */
  value: number | string | null | undefined;
  provenance: Provenance;
  /** Formats the value only when one exists. */
  format?: (value: number | string) => string;
  /** e.g. "+12%" — rendered only alongside a real value. */
  delta?: { value: string; direction: "up" | "down" | "flat" };
  /** Is an increase good? Drives delta color. Defaults to true. */
  higherIsBetter?: boolean;
  /** Small caption under the value. */
  caption?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { value: 18, label: 10 },
  md: { value: 26, label: 10 },
  lg: { value: 38, label: 11 },
};

/**
 * Reason text shown in place of a value. Never a number. Partial on purpose —
 * the remaining states carry a value, so they have no absence caption and fall
 * through to the generic one.
 */
const ABSENT_CAPTION: Partial<Record<ProvenanceState, string>> = {
  "no-source": "no source — not a zero",
  "not-instrumented": "not instrumented",
};

export function Metric({
  label,
  value,
  provenance,
  format,
  delta,
  higherIsBetter = true,
  caption,
  size = "md",
  className,
}: MetricProps): React.JSX.Element {
  const dims = SIZE[size];

  // Resolve once, here, so the "is there a value" question is answered in a
  // single place. The JSX below can then never reach a formatting branch for
  // an absent value — which is the property the contract tests pin.
  const display: string | null =
    hasValue(provenance) && value !== null && value !== undefined
      ? format
        ? format(value)
        : String(value)
      : null;
  const present = display !== null;

  const deltaColor =
    delta?.direction === "flat"
      ? "var(--fg-mute, #6e6884)"
      : (delta?.direction === "up") === higherIsBetter
        ? "var(--status-ok)"
        : "var(--status-incident)";

  return (
    <div className={className}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-mono, ui-monospace, monospace)",
            fontSize: dims.label,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-mute, #6e6884)",
          }}
        >
          {label}
        </span>
        {/* The badge is always present, so provenance is never implicit. */}
        <ProvenanceBadge provenance={provenance} compact />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--f-mono, ui-monospace, monospace)",
            fontVariantNumeric: "tabular-nums",
            fontSize: dims.value,
            lineHeight: 1.15,
            // An absent value is muted; a real one is full-strength.
            color: present ? "var(--fg, #f2edff)" : "var(--status-unknown)",
          }}
        >
          {display ?? "—"}
        </span>

        {present && delta && (
          <span
            style={{
              fontFamily: "var(--f-mono, ui-monospace, monospace)",
              fontSize: 11,
              color: deltaColor,
            }}
          >
            {delta.direction === "up"
              ? "▲"
              : delta.direction === "down"
                ? "▼"
                : "="}{" "}
            {delta.value}
          </span>
        )}
      </div>

      {(caption !== undefined || !present) && (
        <div
          style={{
            marginTop: 3,
            fontSize: 11,
            color: "var(--fg-mute, #6e6884)",
          }}
        >
          {present
            ? caption
            : (provenance.detail ??
              ABSENT_CAPTION[provenance.state] ??
              "no value")}
        </div>
      )}
    </div>
  );
}

export default Metric;
