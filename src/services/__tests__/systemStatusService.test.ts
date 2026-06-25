import {
  worst,
  rollUpOverall,
  statusFromPathHealth,
  type FlowStatus,
} from "@/services/systemStatusService";
import type { PathHealth } from "@/lib/observability/requestLog";

function makePathHealth(overrides: Partial<PathHealth> = {}): PathHealth {
  return {
    pathPrefix: "/api/test",
    count: 10,
    errors4xx: 0,
    errors5xx: 0,
    successRate: 1,
    errorRate: 0,
    p50LatencyMs: 50,
    p95LatencyMs: 200,
    lastFailure: null,
    lastSeen: null,
    observed: true,
    ...overrides,
  };
}

describe("systemStatusService.worst", () => {
  it("returns OK on an empty array (vacuously healthy)", () => {
    expect(worst([])).toBe<FlowStatus>("OK");
  });

  it("returns OK when every flow is OK", () => {
    expect(worst(["OK", "OK", "OK"])).toBe<FlowStatus>("OK");
  });

  it("promotes to DEGRADED when any flow is DEGRADED", () => {
    expect(worst(["OK", "DEGRADED", "OK"])).toBe<FlowStatus>("DEGRADED");
  });

  it("promotes to INCIDENT regardless of other statuses", () => {
    expect(worst(["OK", "INCIDENT"])).toBe<FlowStatus>("INCIDENT");
    expect(worst(["DEGRADED", "INCIDENT", "OK"])).toBe<FlowStatus>("INCIDENT");
  });

  it("treats UNKNOWN-with-OK as DEGRADED (we can't claim healthy if we can't see)", () => {
    expect(worst(["UNKNOWN", "OK"])).toBe<FlowStatus>("DEGRADED");
    expect(worst(["UNKNOWN"])).toBe<FlowStatus>("DEGRADED");
  });

  it("INCIDENT beats UNKNOWN", () => {
    expect(worst(["UNKNOWN", "INCIDENT"])).toBe<FlowStatus>("INCIDENT");
  });
});

describe("systemStatusService.rollUpOverall", () => {
  it("stays OK when all flows are OK and dependencies are idle-UNKNOWN", () => {
    // The regression: Stripe + Google OAuth sit at UNKNOWN on a low-traffic day
    // (no synthetic ping), which previously pinned the banner at DEGRADED even
    // though every flow was green. Idle dependency-UNKNOWN must NOT escalate.
    expect(
      rollUpOverall(["OK", "OK", "OK"], ["UNKNOWN", "UNKNOWN"]),
    ).toBe<FlowStatus>("OK");
  });

  it("still surfaces an unmeasurable FLOW as DEGRADED (real blind spot)", () => {
    // Flows are softened by nothing — an UNKNOWN flow is a genuine blind spot.
    expect(rollUpOverall(["OK", "UNKNOWN"], ["UNKNOWN"])).toBe<FlowStatus>(
      "DEGRADED",
    );
  });

  it("escalates when a dependency reports a CONCRETE DEGRADED", () => {
    expect(rollUpOverall(["OK", "OK"], ["DEGRADED"])).toBe<FlowStatus>(
      "DEGRADED",
    );
  });

  it("escalates to INCIDENT when a dependency is in INCIDENT", () => {
    expect(rollUpOverall(["OK"], ["UNKNOWN", "INCIDENT"])).toBe<FlowStatus>(
      "INCIDENT",
    );
  });

  it("is OK when flows are OK and there are no dependencies", () => {
    expect(rollUpOverall(["OK", "OK"], [])).toBe<FlowStatus>("OK");
  });
});

describe("systemStatusService.statusFromPathHealth", () => {
  const thresholds = { warnErrorRate: 0.1, warnP95Ms: 1000, failErrorRate: 0.5 };

  it("returns UNKNOWN when no traffic observed", () => {
    expect(statusFromPathHealth(makePathHealth({ observed: false }), thresholds)).toBe(
      "UNKNOWN",
    );
  });

  it("returns INCIDENT when error rate breaches failErrorRate", () => {
    const health = makePathHealth({ errorRate: 0.6, errors5xx: 6, count: 10 });
    expect(statusFromPathHealth(health, thresholds)).toBe("INCIDENT");
  });

  it("returns DEGRADED at the warn error-rate threshold", () => {
    const health = makePathHealth({ errorRate: 0.15, errors5xx: 1, count: 10 });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("returns DEGRADED when p95 breaches the warn threshold even with no errors", () => {
    const health = makePathHealth({ p95LatencyMs: 2000 });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("returns OK when traffic is observed and both thresholds are below warn", () => {
    expect(statusFromPathHealth(makePathHealth(), thresholds)).toBe("OK");
  });

  it("error-rate exactly at warnErrorRate triggers DEGRADED (inclusive boundary)", () => {
    const health = makePathHealth({ errorRate: 0.1 });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("error-rate exactly at failErrorRate triggers INCIDENT (inclusive boundary)", () => {
    const health = makePathHealth({ errorRate: 0.5 });
    expect(statusFromPathHealth(health, thresholds)).toBe("INCIDENT");
  });
});
