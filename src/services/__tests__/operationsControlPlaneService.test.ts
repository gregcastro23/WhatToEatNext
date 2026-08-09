import {
  buildOperationsControlPlane,
  normalizePlanetaryHealth,
  type OperationsControlPlaneInput,
} from "@/services/operationsControlPlaneService";

function makeInput(
  overrides: Partial<OperationsControlPlaneInput> = {},
): OperationsControlPlaneInput {
  const checkedAt = "2026-08-09T12:00:00.000Z";
  const flow = (id: string, label: string) => ({
    id,
    label,
    description: `${label} flow`,
    status: "OK" as const,
    summary: `${label} healthy`,
    metrics: [],
    issues: [],
    checkedAt,
    live: true,
  });

  return {
    systemStatus: {
      generatedAt: checkedAt,
      overall: "OK",
      flows: [
        flow("auth", "Authentication"),
        flow("onboarding", "Onboarding"),
        flow("recommendations", "Recommendations"),
        flow("ai-generation", "AI Generation"),
        flow("economy", "Token Economy"),
        flow("payments", "Payments"),
        flow("agents", "Planetary Agents"),
        flow("mcp", "MCP"),
        flow("database", "Database"),
      ],
      dependencies: [],
    },
    onboarding: {
      generatedAt: checkedAt,
      overall: "OK",
      headline: "4/5 new users onboarded (80%)",
      funnel: [
        { id: "signup", label: "Signed up", count: 5, dropOff: 0 },
        { id: "birth-data", label: "Birth data", count: 4, dropOff: 0.2 },
        { id: "natal-chart", label: "Natal chart", count: 4, dropOff: 0 },
        { id: "onboarded", label: "Complete", count: 4, dropOff: 0 },
      ],
      stuckUsers: [],
      recentSuccesses: [],
      apiHealth: {
        observed: true,
        count: 5,
        successRate: 1,
        errors4xx: 0,
        errors5xx: 0,
        p50LatencyMs: 80,
        p95LatencyMs: 120,
        recentErrors: [],
      },
      skipRate: 0,
      live: true,
    },
    cosmicYield: {
      inCirculation: 1200,
      minted30d: 300,
      burned30d: 100,
      netFlow30d: 200,
      sinks24h: [],
      topHolders: [],
      live: true,
    },
    launchReadiness: {
      subsystems: [
        {
          key: "stripe-pro",
          label: "Stripe Pro",
          description: "Subscriptions",
          status: "READY",
          configured: 4,
          total: 4,
          checks: [],
        },
      ],
      settlement: { pending: 0, live: true },
      readyCount: 1,
      generatedAt: checkedAt,
    },
    recentAlerts: { entries: [], live: true },
    planetaryIntegration: {
      endpoints: {
        alchmNextApp: "https://alchm.kitchen",
        paUi: "https://agents.alchm.kitchen",
        paBackend: "https://api.agents.alchm.kitchen",
        wtenLegacyBackend: "https://api.alchm.kitchen",
      },
      health: "healthy",
      agentCount: 24,
      lastFeedEmit: {
        eventType: "recipe.created",
        agentEmail: "agent@agentic.alchm.kitchen",
        responseCode: 200,
        timestamp: checkedAt,
      },
      telemetry: {
        agentHarmony: {
          value: "90%",
          raw: 0.9,
          live: true,
          source: "ephemeris",
        },
        transmutationRate: {
          value: "12 /hr",
          raw: 12,
          live: true,
          source: "database",
        },
        spiritualEntropy: {
          value: "0.75",
          raw: 0.75,
          live: true,
          source: "database",
        },
        mcpInvocationRate: {
          value: "8 /hr",
          raw: 8,
          live: true,
          source: "database",
        },
        generatedAt: checkedAt,
        allLive: true,
      },
    },
    pulse: {
      state: "NOMINAL",
      score: 100,
      availability: 100,
      activeIncidents: 0,
      p95: 120,
      errRate: 0,
      deployFreshness: "4h",
    },
    stats: {
      totalUsers: 100,
      activeUsers: 80,
      newUsersToday: 5,
      completedOnboarding: 70,
      totalRecipes: 400,
      totalIngredients: 900,
      totalSubscriptions: 10,
      totalTransactions: 5000,
    },
    observability: {
      catalog: true,
      database: true,
      engine: true,
      security: true,
      commerce: true,
      resources: true,
      deploys: true,
      featureFlags: true,
    },
    mockedFields: [],
    codebaseGaps: [],
    ...overrides,
  };
}

describe("operationsControlPlaneService", () => {
  it("normalizes backend-specific planetary health vocabulary", () => {
    expect(normalizePlanetaryHealth("ready")).toBe("healthy");
    expect(normalizePlanetaryHealth("degraded")).toBe("unhealthy");
    expect(normalizePlanetaryHealth("offline")).toBe("offline");
    expect(normalizePlanetaryHealth("something-new")).toBe("unknown");
  });

  it("reports a fully observed healthy platform as nominal", () => {
    const result = buildOperationsControlPlane(makeInput());

    expect(result.state).toBe("NOMINAL");
    expect(result.readinessScore).toBe(100);
    expect(result.priorities).toHaveLength(0);
    expect(result.coverage.live).toBe(result.coverage.total);
    expect(result.domains.every((domain) => domain.status === "HEALTHY")).toBe(
      true,
    );
  });

  it("promotes a broken planetary-agent path into a P0 control-plane incident", () => {
    const input = makeInput();
    input.systemStatus.flows = input.systemStatus.flows.map((flow) =>
      flow.id === "agents"
        ? {
            ...flow,
            status: "INCIDENT",
            summary: "Agent traffic is arriving but no debits are landing",
          }
        : flow,
    );
    input.planetaryIntegration.health = "offline";

    const result = buildOperationsControlPlane(input);
    const agents = result.domains.find(
      (domain) => domain.id === "planetary-agents",
    );

    expect(result.state).toBe("CRITICAL");
    expect(agents?.status).toBe("CRITICAL");
    expect(result.priorities[0]).toMatchObject({
      severity: "P0",
      category: "Planetary Agents",
      href: "#agents",
    });
  });

  it("turns stuck onboarding users into an actionable maintenance item", () => {
    const input = makeInput();
    input.onboarding.stuckUsers = [
      {
        userId: "user-123",
        email: "stuck@example.com",
        name: "Stuck User",
        createdAt: "2026-08-09T08:00:00.000Z",
        ageHours: 4,
        missing: "no-natal-chart",
      },
    ];

    const result = buildOperationsControlPlane(input);

    expect(result.priorities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "onboarding-stuck",
          href: "/admin/onboarding",
        }),
      ]),
    );
    expect(
      result.maintenance.find((item) => item.id === "onboarding-review"),
    ).toMatchObject({
      status: "DUE",
      count: 1,
    });
  });

  it("does not count recovered alert transitions as active incidents", () => {
    const input = makeInput();
    input.recentAlerts.entries = [
      {
        id: 2,
        triggeredAt: "2026-08-09T12:00:00.000Z",
        component: "database",
        previousStatus: "INCIDENT",
        currentStatus: "OK",
        severity: "info",
        title: "Database recovered",
        message: "Healthy again",
        suppressed: false,
      },
      {
        id: 1,
        triggeredAt: "2026-08-09T11:00:00.000Z",
        component: "database",
        previousStatus: "OK",
        currentStatus: "INCIDENT",
        severity: "error",
        title: "Database failed",
        message: "Connection refused",
        suppressed: false,
      },
    ];

    const result = buildOperationsControlPlane(input);

    expect(
      result.domains.find((domain) => domain.id === "trust")?.metrics,
    ).toEqual(expect.arrayContaining([{ label: "Open alerts", value: "0" }]));
    expect(
      result.maintenance.find((item) => item.id === "alert-triage")?.status,
    ).toBe("CLEAR");
  });

  it("does not count a suppressed current alert as open work", () => {
    const input = makeInput();
    input.recentAlerts.entries = [
      {
        id: 3,
        triggeredAt: "2026-08-09T12:00:00.000Z",
        component: "recommendations",
        previousStatus: "OK",
        currentStatus: "DEGRADED",
        severity: "warn",
        title: "Expected canary degradation",
        message: "Suppressed during a controlled rollout",
        suppressed: true,
      },
    ];

    const result = buildOperationsControlPlane(input);

    expect(
      result.domains.find((domain) => domain.id === "trust")?.metrics,
    ).toEqual(expect.arrayContaining([{ label: "Open alerts", value: "0" }]));
  });

  it("registers known codebase debt as unfinished priority work", () => {
    const result = buildOperationsControlPlane(
      makeInput({
        codebaseGaps: [
          {
            id: "api-heatmap",
            label: "API heatmap is seeded",
            category: "PLACEHOLDER_DATA",
            severity: "P1",
            detail: "Hourly route telemetry is missing.",
            href: "#infrastructure",
          },
        ],
      }),
    );

    expect(result.state).toBe("ATTENTION");
    expect(result.readinessScore).toBe(97);
    expect(result.codebase).toMatchObject({ highPriority: 1 });
    expect(result.priorities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "codebase-api-heatmap", severity: "P1" }),
      ]),
    );
  });

  it("surfaces partial rollout configuration and telemetry blind spots", () => {
    const input = makeInput({
      cosmicYield: {
        inCirculation: 0,
        minted30d: 0,
        burned30d: 0,
        netFlow30d: 0,
        sinks24h: [],
        topHolders: [],
        live: false,
      },
      mockedFields: ["catalogTrending"],
      observability: {
        catalog: false,
        database: true,
        engine: true,
        security: true,
        commerce: true,
        resources: true,
        deploys: true,
        featureFlags: true,
      },
    });
    input.launchReadiness.subsystems[0] = {
      ...input.launchReadiness.subsystems[0],
      status: "PARTIAL",
      configured: 2,
    };
    input.launchReadiness.readyCount = 0;

    const result = buildOperationsControlPlane(input);

    expect(result.state).toBe("ATTENTION");
    expect(result.coverage.blindSpots).toEqual(
      expect.arrayContaining([
        "Token ledger",
        "Catalog telemetry",
        "Mocked: catalogTrending",
      ]),
    );
    expect(result.priorities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "config-stripe-pro", severity: "P2" }),
        expect.objectContaining({ id: "blind-token-ledger", severity: "P1" }),
      ]),
    );
  });
});
