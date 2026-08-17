/**
 * The kit's contract test.
 *
 * These pin the one guarantee the whole admin honesty effort rests on: a
 * value that could not be measured must be structurally incapable of
 * rendering as a number, and the three kinds of "empty" must stay visually
 * distinct. If someone later "simplifies" Metric to print `value ?? 0`,
 * these fail.
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { Metric } from "@/components/admin/kit/Metric";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import {
  combine,
  formatAge,
  fromLiveFlag,
  hasValue,
} from "@/components/admin/kit/provenance";

describe("provenance contract", () => {
  it("treats a measured empty result as live, not as an absence", () => {
    // live:true + zero rows is a REAL zero. This is the distinction the
    // whole kit exists to preserve.
    const p = fromLiveFlag(true);
    expect(p.state).toBe("live");
    expect(hasValue(p)).toBe(true);
  });

  it("treats a failed read as no-source", () => {
    const p = fromLiveFlag(false, { detail: "auth_events query failed" });
    expect(p.state).toBe("no-source");
    expect(hasValue(p)).toBe(false);
    expect(p.detail).toBe("auth_events query failed");
  });

  it("marks a value older than its freshness budget as stale but present", () => {
    const p = fromLiveFlag(true, { ageMs: 600_000, staleAfterMs: 300_000 });
    expect(p.state).toBe("stale");
    expect(hasValue(p)).toBe(true);
  });

  it("combines mixed sources into partial with counts", () => {
    const p = combine([
      { state: "live" },
      { state: "live" },
      { state: "no-source" },
    ]);
    expect(p.state).toBe("partial");
    expect(p.ok).toBe(2);
    expect(p.total).toBe(3);
  });

  it("combines all-failed sources into no-source, never partial", () => {
    expect(combine([{ state: "no-source" }, { state: "no-source" }]).state).toBe(
      "no-source",
    );
  });

  it("formats ages compactly", () => {
    expect(formatAge(45_000)).toBe("45s");
    expect(formatAge(240_000)).toBe("4m");
    expect(formatAge(7_200_000)).toBe("2h");
  });
});

describe("Metric cannot fabricate a zero", () => {
  it("renders an em-dash and a reason when the source failed", () => {
    render(
      <Metric
        label="Suspicious IPs"
        value={0}
        provenance={{ state: "no-source" }}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("no source — not a zero")).toBeInTheDocument();
    // Even though a 0 was passed in, no digit may reach the DOM.
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders a genuine measured zero as a zero", () => {
    render(
      <Metric label="Suspicious IPs" value={0} provenance={{ state: "live" }} />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("refuses to print a value the service forgot to supply", () => {
    render(
      <Metric label="Latency" value={null} provenance={{ state: "live" }} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("suppresses the delta when there is no value to compare", () => {
    render(
      <Metric
        label="Signups"
        value={42}
        provenance={{ state: "no-source" }}
        delta={{ value: "12%", direction: "up" }}
      />,
    );
    expect(screen.queryByText(/12%/)).not.toBeInTheDocument();
  });

  it("names the reason a signal is not instrumented", () => {
    render(
      <Metric
        label="/api/onboarding · 1h"
        value={0}
        provenance={{ state: "not-instrumented" }}
      />,
    );
    expect(screen.getByText("not instrumented")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});

describe("ProvenanceBadge vocabulary", () => {
  it.each([
    ["live", "LIVE"],
    ["no-source", "NO SOURCE"],
    ["not-instrumented", "NOT INSTRUMENTED"],
  ] as const)("renders %s as the single canonical word %s", (state, word) => {
    render(<ProvenanceBadge provenance={{ state }} />);
    expect(screen.getByText(word)).toBeInTheDocument();
  });

  it("carries the age on a stale badge and the counts on a partial one", () => {
    const { rerender } = render(
      <ProvenanceBadge provenance={{ state: "stale", ageMs: 240_000 }} />,
    );
    expect(screen.getByText("STALE 4m")).toBeInTheDocument();

    rerender(
      <ProvenanceBadge provenance={{ state: "partial", ok: 3, total: 5 }} />,
    );
    expect(screen.getByText("PARTIAL 3/5")).toBeInTheDocument();
  });
});

describe("EmptyState keeps the three emptinesses apart", () => {
  it("does not present an unproven feature as success", () => {
    render(
      <EmptyState
        kind="never-used"
        title="Rail not yet in use"
        description="No restaurant order has ever been placed."
      />,
    );
    expect(screen.getByText("Rail not yet in use")).toBeInTheDocument();
    // The reassuring checkmark belongs to all-clear alone.
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("announces an unreadable source assertively", () => {
    render(
      <EmptyState
        kind="cannot-read"
        title="Could not load reports"
        description="This is not a zero."
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("reserves the check glyph for a genuine all-clear", () => {
    render(<EmptyState kind="all-clear" title="No orders awaiting settlement" />);
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
