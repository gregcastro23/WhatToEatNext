import { render, screen } from "@testing-library/react";
import { OperationsControlPlane } from "@/app/admin/_dashboard/OperationsControlPlane";
import {
  FALLBACK_DATA,
  type AdminDashboardData,
} from "@/app/admin/_dashboard/data";

function makeDashboard(): AdminDashboardData {
  return {
    ...FALLBACK_DATA,
    stats: {
      ...FALLBACK_DATA.stats,
      totalUsers: 12,
      activeUsers: 9,
      completedOnboarding: 8,
    },
    onboardingHealth: {
      ...FALLBACK_DATA.onboardingHealth,
      overall: "DEGRADED",
      headline: "1 user is stuck mid-onboarding",
      live: true,
      stuckUsers: [
        {
          userId: "user-123",
          email: "stuck@example.com",
          name: "Stuck User",
          createdAt: "2026-08-09T08:00:00.000Z",
          ageHours: 4,
          missing: "no-natal-chart",
        },
      ],
    },
    launchReadiness: {
      generatedAt: "2026-08-09T12:00:00.000Z",
      readyCount: 0,
      settlement: { pending: 1, live: true },
      subsystems: [
        {
          key: "stripe-pro",
          label: "Stripe Pro",
          description: "Subscription billing",
          status: "PARTIAL",
          configured: 2,
          total: 4,
          checks: [],
        },
      ],
    },
    planetaryIntegration: {
      ...FALLBACK_DATA.planetaryIntegration,
      health: "unhealthy",
      agentCount: 24,
    },
    operations: {
      generatedAt: "2026-08-09T12:00:00.000Z",
      state: "ATTENTION",
      readinessScore: 72,
      summary: "2 domains need attention · 1 blind spot",
      coverage: {
        live: 11,
        total: 12,
        percent: 92,
        blindSpots: ["Token ledger"],
      },
      rollout: { ready: 0, total: 1, partial: 1, off: 0 },
      codebase: {
        highPriority: 1,
        knownGaps: [
          {
            id: "api-heatmap",
            label: "API heatmap is seeded",
            category: "PLACEHOLDER_DATA",
            severity: "P1",
            detail: "Hourly request telemetry is missing.",
            href: "#infrastructure",
          },
        ],
      },
      domains: [
        {
          id: "token-economy",
          label: "Token Economy",
          status: "BLIND",
          summary: "Ledger rollup unavailable",
          href: "#economy",
          metrics: [{ label: "Circulation", value: "—" }],
        },
        {
          id: "planetary-agents",
          label: "Planetary Agents",
          status: "WATCH",
          summary: "24 agents · backend unhealthy",
          href: "#agents",
          metrics: [{ label: "Agents", value: "24" }],
        },
      ],
      priorities: [
        {
          id: "settlement-backlog",
          severity: "P0",
          category: "Commerce",
          title: "1 settlement is unresolved",
          detail: "Tokens were debited but transfer is unconfirmed.",
          href: "/admin/settlements",
        },
      ],
      maintenance: [
        {
          id: "onboarding-review",
          label: "Onboarding rescue",
          status: "DUE",
          count: 1,
          detail: "Inspect the incomplete journey.",
          href: "/admin/onboarding",
        },
      ],
    },
  };
}

describe("OperationsControlPlane", () => {
  it("renders actionable priorities, domain health, codebase gaps, and admin routes", () => {
    render(<OperationsControlPlane data={makeDashboard()} />);

    expect(
      screen.getByRole("heading", { name: "The work that matters, in order" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 settlement is unresolved")).toBeInTheDocument();
    expect(screen.getByText("Token Economy")).toBeInTheDocument();
    expect(screen.getByText("API heatmap is seeded")).toBeInTheDocument();
    expect(screen.getByText("stuck@example.com")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Users 12/ })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(
      screen.getByRole("link", { name: /Onboarding 1 stuck/ }),
    ).toHaveAttribute("href", "/admin/onboarding");
    expect(
      screen.getByRole("link", { name: /1 settlement is unresolved/ }),
    ).toHaveAttribute("href", "/admin/settlements");
    expect(
      screen.getByRole("link", { name: /stuck@example.com/ }),
    ).toHaveAttribute("href", "/admin/users/user-123");
  });
});
