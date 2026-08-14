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
    serverErrorRate: 0,
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

  it("returns INCIDENT when the SERVER error rate breaches failErrorRate", () => {
    const health = makePathHealth({
      count: 10,
      errors5xx: 6,
      serverErrorRate: 0.6,
      errorRate: 0.6,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("INCIDENT");
  });

  it("returns DEGRADED at the warn server-error-rate threshold", () => {
    const health = makePathHealth({
      count: 10,
      errors5xx: 2,
      serverErrorRate: 0.2,
      errorRate: 0.2,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("returns DEGRADED when p95 breaches the warn threshold even with no errors", () => {
    const health = makePathHealth({ p95LatencyMs: 2000 });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("returns OK when traffic is observed and both thresholds are below warn", () => {
    expect(statusFromPathHealth(makePathHealth(), thresholds)).toBe("OK");
  });

  it("server-error rate exactly at warnErrorRate triggers DEGRADED (inclusive)", () => {
    const health = makePathHealth({ serverErrorRate: 0.1, errorRate: 0.1 });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("server-error rate exactly at failErrorRate triggers INCIDENT (inclusive)", () => {
    const health = makePathHealth({ serverErrorRate: 0.5, errorRate: 0.5 });
    expect(statusFromPathHealth(health, thresholds)).toBe("INCIDENT");
  });
});

/**
 * A 4xx is the server correctly refusing a request. It is not an outage, and it
 * must never page anyone.
 *
 * `[MEASURED 2026-08-14]` before this rule existed, the `economy` flow raised 26
 * INCIDENT alerts in 7 days — each one emailing every admin — over a window in
 * which the ENTIRE request log held 9,819 requests and **zero** 5xx. 6,427 of
 * the 6,488 responses >= 400 were `402 insufficient_funds` on
 * `/api/economy/sync-debit`: an agent trying to spend ESMS it does not hold,
 * which is that route working exactly as documented.
 *
 * These cases are reconstructed from real alert windows. `errorRate` is carried
 * alongside `serverErrorRate` in every fixture on purpose: it is the field the
 * old rule read, so if the implementation ever reverts to it these fail rather
 * than silently pass.
 *
 * NOTE: this test file is NOT covered by `tsc` — tsconfig excludes every
 * `.test.ts` — so a fixture missing `serverErrorRate` would still compile, and
 * `undefined >= 0.5` evaluates to false: a test passing for the wrong reason.
 * Every fixture below sets it explicitly.
 */
describe("statusFromPathHealth ignores client errors (the 402 false-alarm)", () => {
  const thresholds = { warnErrorRate: 0.1, warnP95Ms: 1000, failErrorRate: 0.5 };

  it("stays OK when every single request was refused with a 4xx", () => {
    // The 2026-08-13 20:01 alert: 72 requests, 72 of them 402, no 5xx.
    // Old rule: errorRate 1.0 -> INCIDENT -> email to every admin.
    const health = makePathHealth({
      count: 72,
      errors4xx: 72,
      errors5xx: 0,
      errorRate: 1,
      serverErrorRate: 0,
      successRate: 0,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("OK");
  });

  it("stays OK on the two-request sample that produced '/api/economy failing (100.0%)'", () => {
    // The 2026-08-14 18:01 alert. Two requests, both 402. A rate computed over
    // n=2 said 100%, and that was enough to page.
    const health = makePathHealth({
      count: 2,
      errors4xx: 2,
      errors5xx: 0,
      errorRate: 1,
      serverErrorRate: 0,
      successRate: 0,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("OK");
  });

  it("still raises INCIDENT when the route really is 500-ing on everything", () => {
    // `/api/economy/sync-debit` returned 500 on 100% of calls for twelve weeks
    // (see agentDebitPathHealth.ts). Narrowing the rule must not cost us this.
    const health = makePathHealth({
      count: 72,
      errors4xx: 0,
      errors5xx: 72,
      errorRate: 1,
      serverErrorRate: 1,
      successRate: 0,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("INCIDENT");
  });

  it("raises INCIDENT on a LONE 5xx on a quiet route — no minimum sample was added", () => {
    // Deliberate: a minimum-sample guard would have suppressed the n=2 alarm
    // above, but it would also silence a single genuine 500 on a low-traffic
    // route like /api/stripe/webhook. There was no evidence that a 5xx is ever
    // noise here — there were none at all — so the narrowing is confined to
    // what was measured.
    const health = makePathHealth({
      count: 1,
      errors4xx: 0,
      errors5xx: 1,
      errorRate: 1,
      serverErrorRate: 1,
      successRate: 0,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("INCIDENT");
  });

  it("a wall of 4xx does not hide a real server failure underneath it", () => {
    // 60 refusals + 12 genuine 500s in the same window. The 500s must still be
    // seen, at 12/72 = 16.7%.
    const health = makePathHealth({
      count: 72,
      errors4xx: 60,
      errors5xx: 12,
      errorRate: 1,
      serverErrorRate: 12 / 72,
      successRate: 0,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });

  it("prices the denominator honestly: 4xx traffic dilutes the server-error rate", () => {
    // A documented consequence, pinned so it stays a decision rather than an
    // accident. serverErrorRate is 5xx over ALL requests — the standard
    // availability definition, and what a user actually experiences. On a route
    // that is 70% legitimately-refused, 30% of ALL calls must 500 before the
    // rate reaches the 0.5 INCIDENT threshold; it reports DEGRADED until then,
    // which still alerts. The alternative denominator (5xx over non-4xx) is
    // more sensitive but divides by zero on an all-4xx window.
    const health = makePathHealth({
      count: 100,
      errors4xx: 70,
      errors5xx: 30,
      errorRate: 1,
      serverErrorRate: 0.3,
      successRate: 0,
    });
    expect(statusFromPathHealth(health, thresholds)).toBe("DEGRADED");
  });
});
