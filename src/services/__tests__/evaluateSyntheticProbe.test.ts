/**
 * Tests for evaluateSyntheticProbe — the pure helper that normalizes a
 * latest-probe row into a struct the flow probes consume.
 */

import { evaluateSyntheticProbe } from "@/services/systemStatusService";
import type { LatestProbeRow } from "@/services/syntheticProbeService";

function makeRow(
  overrides: Partial<LatestProbeRow> & { probeName: string },
): LatestProbeRow {
  return {
    probeName: overrides.probeName,
    startedAt: overrides.startedAt ?? new Date().toISOString(),
    status: overrides.status ?? "success",
    latencyMs: overrides.latencyMs ?? 100,
    httpStatus: overrides.httpStatus ?? 200,
    errorMessage: overrides.errorMessage ?? null,
  };
}

const TEN_MINUTES = 10 * 60 * 1000;
const NINETY_MINUTES = 90 * 60 * 1000;

describe("evaluateSyntheticProbe", () => {
  it("returns a missing-marker when the probe is absent from the latest set", () => {
    const result = evaluateSyntheticProbe("auth-handshake", [], NINETY_MINUTES);
    expect(result.missing).toBe(true);
    expect(result.freshFailure).toBe(false);
    expect(result.stale).toBe(false);
    expect(result.metricValue).toBe("—");
    expect(result.issue).toBeNull();
  });

  it("returns a clean OK when the latest result is fresh + success", () => {
    const row = makeRow({ probeName: "auth-handshake", status: "success" });
    const result = evaluateSyntheticProbe(
      "auth-handshake",
      [row],
      NINETY_MINUTES,
    );
    expect(result.freshFailure).toBe(false);
    expect(result.stale).toBe(false);
    expect(result.missing).toBe(false);
    expect(result.metricValue).toBe("success");
    expect(result.metricRaw).toBe(1);
    expect(result.issue).toBeNull();
  });

  it("flags freshFailure when the latest fresh result is failure", () => {
    const row = makeRow({
      probeName: "stripe-webhook",
      status: "failure",
      errorMessage: "HTTP 503",
    });
    const result = evaluateSyntheticProbe(
      "stripe-webhook",
      [row],
      NINETY_MINUTES,
    );
    expect(result.freshFailure).toBe(true);
    expect(result.stale).toBe(false);
    expect(result.issue?.severity).toBe("error");
    expect(result.issue?.message).toContain("HTTP 503");
    expect(result.metricRaw).toBe(0);
  });

  it("flags stale when the latest result is older than the stale window", () => {
    const longAgo = new Date(Date.now() - 2 * NINETY_MINUTES).toISOString();
    const row = makeRow({
      probeName: "recommendations",
      status: "success",
      startedAt: longAgo,
    });
    const result = evaluateSyntheticProbe(
      "recommendations",
      [row],
      NINETY_MINUTES,
    );
    expect(result.stale).toBe(true);
    expect(result.freshFailure).toBe(false);
    expect(result.issue?.severity).toBe("warn");
    expect(result.issue?.message).toMatch(/cron may have stopped/);
  });

  it("does NOT flag freshFailure when result is stale + failure (cron stopped, not flow broken)", () => {
    const longAgo = new Date(Date.now() - 2 * NINETY_MINUTES).toISOString();
    const row = makeRow({
      probeName: "cosmic-recipe",
      status: "failure",
      startedAt: longAgo,
      errorMessage: "old failure",
    });
    const result = evaluateSyntheticProbe(
      "cosmic-recipe",
      [row],
      NINETY_MINUTES,
    );
    expect(result.stale).toBe(true);
    expect(result.freshFailure).toBe(false);
    expect(result.issue?.severity).toBe("warn"); // stale → warn, not error
  });

  it("respects the per-probe stale window (10-min probe is stale at 15 min)", () => {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const row = makeRow({
      probeName: "fast-probe",
      status: "success",
      startedAt: fifteenMinAgo,
    });
    const result = evaluateSyntheticProbe("fast-probe", [row], TEN_MINUTES);
    expect(result.stale).toBe(true);
  });
});
