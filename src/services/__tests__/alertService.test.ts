/**
 * Tests for the pure transition-detection helpers in alertService.
 * Dispatch (DB writes, webhooks, email) is integration-tested separately.
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [{ id: 1 }] }),
}));

import {
  classifyTransition,
  diffPayloadsForAlerts,
} from "@/services/alertService";
import type {
  DependencyHealth,
  FlowHealth,
  FlowStatus,
  SystemStatusPayload,
} from "@/services/systemStatusService";

function makeFlow(id: string, status: FlowStatus): FlowHealth {
  return {
    id,
    label: id,
    description: `${id} flow`,
    status,
    summary: `${id} is ${status}`,
    metrics: [],
    issues: [],
    checkedAt: new Date().toISOString(),
    live: true,
  };
}

function makeDep(id: string, status: FlowStatus): DependencyHealth {
  return {
    id,
    label: id,
    status,
    summary: `${id} is ${status}`,
    latencyMs: 50,
    checkedAt: new Date().toISOString(),
  };
}

function makePayload(
  overall: FlowStatus,
  flows: FlowHealth[],
  deps: DependencyHealth[] = [],
): SystemStatusPayload {
  return {
    generatedAt: new Date().toISOString(),
    overall,
    flows,
    dependencies: deps,
  };
}

describe("alertService.classifyTransition", () => {
  it("returns null for same-status transitions", () => {
    expect(
      classifyTransition("auth", "Auth", "OK", "OK", "no change"),
    ).toBeNull();
    expect(
      classifyTransition(
        "payments",
        "Payments",
        "DEGRADED",
        "DEGRADED",
        "still degraded",
      ),
    ).toBeNull();
  });

  it("returns null for UNKNOWN transitions (monitoring loss, not health)", () => {
    expect(
      classifyTransition("auth", "Auth", "OK", "UNKNOWN", "probe lost"),
    ).toBeNull();
    expect(
      classifyTransition("auth", "Auth", "UNKNOWN", "OK", "probe recovered"),
    ).toBeNull();
  });

  it("marks worsenings as warn or error per terminal status", () => {
    const warn = classifyTransition("a", "A", "OK", "DEGRADED", "slow");
    expect(warn?.severity).toBe("warn");
    expect(warn?.title).toMatch(/degraded/i);

    const err = classifyTransition("a", "A", "OK", "INCIDENT", "down");
    expect(err?.severity).toBe("error");
    expect(err?.title).toMatch(/incident/i);
  });

  it("marks recoveries to OK as info severity", () => {
    const recoveryFromDegraded = classifyTransition(
      "a",
      "A",
      "DEGRADED",
      "OK",
      "healthy again",
    );
    expect(recoveryFromDegraded?.severity).toBe("info");
    expect(recoveryFromDegraded?.title).toMatch(/recovered/i);

    const recoveryFromIncident = classifyTransition(
      "a",
      "A",
      "INCIDENT",
      "OK",
      "all clear",
    );
    expect(recoveryFromIncident?.severity).toBe("info");
  });

  it("escalating DEGRADED -> INCIDENT alerts as error", () => {
    const escalation = classifyTransition(
      "p",
      "Payments",
      "DEGRADED",
      "INCIDENT",
      "stripe is down",
    );
    expect(escalation?.severity).toBe("error");
    expect(escalation?.message).toBe("stripe is down");
  });
});

describe("alertService.diffPayloadsForAlerts", () => {
  it("returns empty when nothing changed", () => {
    const a = makePayload("OK", [makeFlow("auth", "OK")]);
    const b = makePayload("OK", [makeFlow("auth", "OK")]);
    expect(diffPayloadsForAlerts(a, b)).toEqual([]);
  });

  it("surfaces the aggregate transition when overall changes", () => {
    const a = makePayload("OK", [makeFlow("auth", "OK")]);
    const b = makePayload("INCIDENT", [makeFlow("auth", "INCIDENT")]);
    const candidates = diffPayloadsForAlerts(a, b);
    expect(candidates.map((c) => c.component)).toEqual(["system", "auth"]);
    expect(candidates[0]?.severity).toBe("error");
    expect(candidates[1]?.severity).toBe("error");
  });

  it("surfaces per-flow + per-dependency transitions, skipping unchanged ones", () => {
    const a = makePayload(
      "OK",
      [makeFlow("auth", "OK"), makeFlow("payments", "OK")],
      [makeDep("stripe", "OK")],
    );
    const b = makePayload(
      "DEGRADED",
      [makeFlow("auth", "OK"), makeFlow("payments", "DEGRADED")],
      [makeDep("stripe", "INCIDENT")],
    );
    const candidates = diffPayloadsForAlerts(a, b);
    expect(candidates.map((c) => c.component)).toEqual([
      "system",
      "payments",
      "stripe",
    ]);
  });

  it("does NOT alert on a new flow appearing (no previous state to compare)", () => {
    const a = makePayload("OK", [makeFlow("auth", "OK")]);
    const b = makePayload("OK", [makeFlow("auth", "OK"), makeFlow("new", "DEGRADED")]);
    const candidates = diffPayloadsForAlerts(a, b);
    expect(candidates.map((c) => c.component)).not.toContain("new");
  });
});
