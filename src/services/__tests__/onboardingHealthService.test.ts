import {
  diagnose,
  type FunnelRow,
  type OnboardingApiHealth,
} from "@/services/onboardingHealthService";

function makeFunnel(overrides: Partial<FunnelRow> = {}): FunnelRow {
  return {
    signups: 0,
    birthDataSubmitted: 0,
    natalChartComputed: 0,
    onboarded: 0,
    skipped: 0,
    ...overrides,
  };
}

function makeApi(overrides: Partial<OnboardingApiHealth> = {}): OnboardingApiHealth {
  return {
    observed: false,
    count: 0,
    successRate: 1,
    errors4xx: 0,
    errors5xx: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    recentErrors: [],
    ...overrides,
  };
}

describe("onboardingHealthService.diagnose", () => {
  it("returns UNKNOWN when both DB and API are silent", () => {
    const result = diagnose({
      funnel: makeFunnel(),
      stuckCount: 0,
      apiHealth: makeApi({ observed: false }),
      live: false,
    });
    expect(result.overall).toBe("UNKNOWN");
    expect(result.headline).toMatch(/unavailable/i);
  });

  it("returns INCIDENT when >=50% of /api/onboarding traffic is failing", () => {
    const result = diagnose({
      funnel: makeFunnel({ signups: 5 }),
      stuckCount: 0,
      apiHealth: makeApi({
        observed: true,
        count: 10,
        successRate: 0.4,
        errors5xx: 6,
      }),
      live: true,
    });
    expect(result.overall).toBe("INCIDENT");
    expect(result.headline).toMatch(/broken|failing/i);
  });

  it("returns DEGRADED when there are signups but no completions and no submissions", () => {
    const result = diagnose({
      funnel: makeFunnel({
        signups: 5,
        birthDataSubmitted: 0,
        onboarded: 0,
      }),
      stuckCount: 0,
      apiHealth: makeApi({ observed: false }),
      live: true,
    });
    expect(result.overall).toBe("DEGRADED");
    expect(result.headline).toMatch(/0 onboarding/i);
  });

  it("returns DEGRADED when 5+ users are stuck mid-onboarding", () => {
    const result = diagnose({
      funnel: makeFunnel({ signups: 10, onboarded: 5 }),
      stuckCount: 5,
      apiHealth: makeApi({ observed: false }),
      live: true,
    });
    expect(result.overall).toBe("DEGRADED");
    expect(result.headline).toMatch(/stuck/i);
  });

  it("returns DEGRADED when API success rate is below 90%", () => {
    const result = diagnose({
      funnel: makeFunnel({ signups: 3, onboarded: 3 }),
      stuckCount: 0,
      apiHealth: makeApi({
        observed: true,
        count: 20,
        successRate: 0.8,
        errors4xx: 4,
      }),
      live: true,
    });
    expect(result.overall).toBe("DEGRADED");
    expect(result.headline).toMatch(/80%|success rate/i);
  });

  it("returns OK with quiet headline when no signups happened", () => {
    const result = diagnose({
      funnel: makeFunnel({ signups: 0 }),
      stuckCount: 0,
      apiHealth: makeApi({ observed: false }),
      live: true,
    });
    expect(result.overall).toBe("OK");
    expect(result.headline).toMatch(/quiet/i);
  });

  it("returns OK with completion-rate headline on a healthy day", () => {
    const result = diagnose({
      funnel: makeFunnel({
        signups: 4,
        birthDataSubmitted: 4,
        natalChartComputed: 4,
        onboarded: 3,
      }),
      stuckCount: 0,
      apiHealth: makeApi({
        observed: true,
        count: 12,
        successRate: 1,
      }),
      live: true,
    });
    expect(result.overall).toBe("OK");
    expect(result.headline).toMatch(/3\/4|onboarded/i);
  });

  it("INCIDENT takes priority over stuck-user count", () => {
    const result = diagnose({
      funnel: makeFunnel({ signups: 5 }),
      stuckCount: 12,
      apiHealth: makeApi({
        observed: true,
        count: 10,
        successRate: 0.3,
        errors5xx: 7,
      }),
      live: true,
    });
    expect(result.overall).toBe("INCIDENT");
  });
});
