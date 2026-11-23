/**
 * Pure view-model helper tests for the Sync-Debit 402 Refusal Reasons card.
 *
 * @file src/components/admin/agents/__tests__/debitRefusalsView.test.ts
 */

import {
  computeCoverageNote,
  describeDebitRefusalReason,
  formatShare,
  formatShortfallValue,
  formatUtcHour,
  formatUtcHourShort,
  refusalCardStatus,
  toHourlyColumns,
} from "@/components/admin/agents/debitRefusalsView";
import { DEBIT_REFUSAL_REASONS } from "@/services/debitRefusalService";
import type { DebitRefusalReportView } from "@/lib/admin/schemas/debitRefusals";

const BASE_REPORT: DebitRefusalReportView = {
  live: true,
  note: null,
  generatedAt: "2026-11-23T21:52:00.000Z",
  windowHours: 168,
  recordingSince: "2026-11-23T21:00:00.000Z",
  total: 70,
  emptyBasket: 0,
  byReason: [
    {
      reason: "insufficient_value",
      refusals: 70,
      emptyBasket: 0,
      meanShortfallValue: 2.4987,
      shortfallKnown: 70,
    },
  ],
  byHour: [{ hour: "2026-11-23T21:00:00.000Z", refusals: 70, emptyBasket: 0 }],
};

describe("describeDebitRefusalReason", () => {
  it("provides human labels and descriptions for every known refusal reason", () => {
    for (const reason of DEBIT_REFUSAL_REASONS) {
      const info = describeDebitRefusalReason(reason);
      expect(info.label.length).toBeGreaterThan(0);
      expect(info.label).not.toBe(reason);
      expect(info.detail).not.toBe("Unclassified refusal reason");
    }
  });

  it("falls back cleanly for an unknown future reason", () => {
    expect(describeDebitRefusalReason("future_reason")).toEqual({
      label: "future_reason",
      detail: "Unclassified refusal reason",
    });
  });
});

describe("formatShortfallValue", () => {
  it("formats measured finite shortfalls to two decimal places", () => {
    expect(formatShortfallValue(2.4987, 70)).toBe("2.50 tok");
    expect(formatShortfallValue(0, 3)).toBe("0.00 tok");
  });

  it("returns an em-dash rather than zero when shortfall is unmeasured", () => {
    expect(formatShortfallValue(null, 0)).toBe("—");
    expect(formatShortfallValue(1.5, 0)).toBe("—");
    expect(formatShortfallValue(Number.NaN, 5)).toBe("—");
    expect(formatShortfallValue(Number.POSITIVE_INFINITY, 5)).toBe("—");
  });
});

describe("formatShare", () => {
  it("returns an em-dash when total is zero or negative", () => {
    expect(formatShare(0, 0)).toBe("—");
    expect(formatShare(5, 0)).toBe("—");
  });

  it("formats rounded percentages for positive totals", () => {
    expect(formatShare(0, 70)).toBe("0%");
    expect(formatShare(35, 70)).toBe("50%");
    expect(formatShare(70, 70)).toBe("100%");
  });
});

describe("UTC hour formatting", () => {
  it("formats ISO hours deterministically in UTC and returns em-dash for invalid timestamps", () => {
    expect(formatUtcHour("2026-11-23T21:00:00.000Z")).toBe("2026-11-23 21:00 UTC");
    expect(formatUtcHourShort("2026-11-23T21:00:00.000Z")).toBe("11-23 21Z");
    expect(formatUtcHour("not-a-date")).toBe("—");
    expect(formatUtcHourShort("not-a-date")).toBe("—");
  });
});

describe("computeCoverageNote", () => {
  it("flags an unrecorded table when recordingSince is null", () => {
    const note = computeCoverageNote({
      windowHours: 168,
      recordingSince: null,
      generatedAt: "2026-11-23T21:52:00.000Z",
    });

    expect(note.partialWindow).toBe(true);
    expect(note.label).toContain("unmeasured, not zero");
  });

  it("flags a partial window matching the 47-minute production start", () => {
    const note = computeCoverageNote({
      windowHours: 168,
      recordingSince: "2026-11-23T21:00:00.000Z",
      generatedAt: "2026-11-23T21:52:00.000Z",
    });

    expect(note.partialWindow).toBe(true);
    expect(note.label).toContain("2026-11-23 21:00 UTC");
    expect(note.label).toContain("unmeasured, not zero");
  });

  it("reports a full window when recordingSince precedes the window start", () => {
    const note = computeCoverageNote({
      windowHours: 24,
      recordingSince: "2026-11-20T00:00:00.000Z",
      generatedAt: "2026-11-23T21:52:00.000Z",
    });

    expect(note.partialWindow).toBe(false);
    expect(note.label).toContain("Full 24h window measured");
    expect(note.label).toContain("2026-11-20 00:00 UTC");
  });
});

describe("toHourlyColumns", () => {
  it("preserves order and adds empty-basket detail", () => {
    const cols = toHourlyColumns([
      { hour: "2026-11-23T20:00:00.000Z", refusals: 12, emptyBasket: 2 },
      { hour: "2026-11-23T21:00:00.000Z", refusals: 70, emptyBasket: 0 },
    ]);

    expect(cols).toEqual([
      { key: "2026-11-23T20:00:00.000Z", label: "11-23 20Z", value: 12, detail: "2 empty-basket" },
      { key: "2026-11-23T21:00:00.000Z", label: "11-23 21Z", value: 70, detail: "0 empty-basket" },
    ]);
  });
});

describe("refusalCardStatus", () => {
  it("maps all five card lifecycle states accurately", () => {
    expect(refusalCardStatus({ data: null, error: "HTTP 500" })).toEqual({ tone: "bad", label: "Unavailable" });
    expect(refusalCardStatus({ data: null, error: null })).toEqual({ tone: "neutral", label: "Loading" });
    expect(refusalCardStatus({ data: { ...BASE_REPORT, live: false, total: 0 }, error: null })).toEqual({
      tone: "warn",
      label: "Not live",
    });
    expect(refusalCardStatus({ data: { ...BASE_REPORT, total: 0, byReason: [], byHour: [] }, error: null })).toEqual({
      tone: "ok",
      label: "0 Refused",
    });
    expect(refusalCardStatus({ data: BASE_REPORT, error: null })).toEqual({
      tone: "info",
      label: "Live · Counting",
    });
  });
});
