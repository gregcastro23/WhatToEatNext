/**
 * AdminPanelsKitMigration.test.tsx
 *
 * Contract test suite verifying that all migrated admin panels correctly adopt
 * the Admin Kit primitives (Metric, ProvenanceBadge, EmptyState, provenance utils)
 * and enforce the zero-drift honesty invariants.
 */

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import AdvancedMetricsPanel from "@/components/admin/AdvancedMetricsPanel";
import ApiRouteHealthPanel from "@/components/admin/ApiRouteHealthPanel";
import LaunchReadinessPanel from "@/components/admin/LaunchReadinessPanel";
import LiveActivityPanel from "@/components/admin/LiveActivityPanel";
import OnboardingFunnelPanel from "@/components/admin/OnboardingFunnelPanel";
import SystemStatusPanel from "@/components/admin/SystemStatusPanel";
import TodaysHighlightsPanel from "@/components/admin/TodaysHighlightsPanel";
import UserInsightsPanel from "@/components/admin/UserInsightsPanel";
import { makeDocumentVisible } from "@/utils/testing/pollingTestEnv";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";

let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => {
  restoreVisibility?.();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockFetch(body: unknown, ok = true) {
  installFetchMock(
    jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body }),
  );
}

describe("Admin Panels Kit Migration & Zero-Drift Honesty", () => {
  describe("ApiRouteHealthPanel", () => {
    it("renders ProvenanceBadge and Metric values when active", async () => {
      mockFetch({
        success: true,
        requests: {
          summary: {
            count: 42,
            p50LatencyMs: 12,
            p95LatencyMs: 85,
            p99LatencyMs: 120,
            errorRate: 0.02,
            topPaths: [{ path: "/api/feed", count: 42 }],
          },
          recent: [
            {
              id: 1,
              at: new Date().toISOString(),
              method: "GET",
              path: "/api/feed",
              status: 200,
              latencyMs: 15,
            },
          ],
          recentFailures: [],
        },
        slowQueries: {
          summary: {},
          recent: [],
        },
      });

      render(<ApiRouteHealthPanel />);

      await waitFor(() => {
        expect(screen.getAllByText("Reqs").length).toBeGreaterThanOrEqual(1);
      });
      expect(screen.getAllByText("LIVE").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("/api/feed")).toBeInTheDocument();
    });

    it("renders EmptyState when no requests observed in 5m window", async () => {
      mockFetch({
        success: true,
        requests: {
          summary: {
            count: 0,
            p50LatencyMs: 0,
            p95LatencyMs: 0,
            p99LatencyMs: 0,
            errorRate: 0,
            topPaths: [],
          },
          recent: [],
          recentFailures: [],
        },
        slowQueries: { summary: {}, recent: [] },
      });

      render(<ApiRouteHealthPanel />);

      await waitFor(() => {
        expect(screen.getByText("No requests observed in 5m window")).toBeInTheDocument();
      });
    });
  });

  describe("LaunchReadinessPanel", () => {
    it("renders ProvenanceBadge and subsystem checklist", async () => {
      mockFetch({
        success: true,
        subsystems: [
          {
            key: "stripe",
            label: "Stripe · Payments",
            description: "Webhook secret and API key",
            status: "READY",
            configured: 3,
            total: 3,
            checks: [
              { label: "Webhook secret", source: "STRIPE_WEBHOOK_SECRET", ok: true, kind: "secret", isPublic: false },
            ],
          },
        ],
        settlement: { pending: 0, live: true },
        readyCount: 1,
        generatedAt: new Date().toISOString(),
      });

      render(<LaunchReadinessPanel variant="full" />);

      await waitFor(() => {
        expect(screen.getByText("Launch Readiness")).toBeInTheDocument();
      });
      expect(screen.getByText("LIVE")).toBeInTheDocument();
      expect(screen.getByText("1/1 ready")).toBeInTheDocument();
      expect(screen.getByText("clear — no stuck orders ✓")).toBeInTheDocument();
    });
  });

  describe("LiveActivityPanel", () => {
    it("renders ProvenanceBadge and EmptyState when quiet", async () => {
      mockFetch({
        success: true,
        generatedAt: new Date().toISOString(),
        windowHours: 24,
        events: [],
        countsByCategory: {
          signup: 0,
          auth: 0,
          onboarding: 0,
          recipe: 0,
          economy: 0,
          agent: 0,
          diary: 0,
        },
        live: true,
      });

      render(<LiveActivityPanel />);

      await waitFor(() => {
        expect(screen.getByText("Live Activity")).toBeInTheDocument();
      });
      expect(screen.getByText("LIVE")).toBeInTheDocument();
      expect(screen.getByText("No activity in window")).toBeInTheDocument();
    });
  });

  describe("OnboardingFunnelPanel", () => {
    it("renders ProvenanceBadge and EmptyState when no recent successes", async () => {
      mockFetch({
        success: true,
        generatedAt: new Date().toISOString(),
        overall: "OK",
        headline: "Onboarding running normally",
        funnel: [
          { id: "signup", label: "Signed up", count: 10, dropOff: 0 },
          { id: "completed", label: "Onboarded", count: 8, dropOff: 0.2 },
        ],
        stuckUsers: [],
        recentSuccesses: [],
        apiHealth: {
          observed: false,
          count: 0,
          successRate: 1,
          errors4xx: 0,
          errors5xx: 0,
          p50LatencyMs: 0,
          p95LatencyMs: 0,
          recentErrors: [],
        },
        skipRate: 0.1,
        live: true,
      });

      render(<OnboardingFunnelPanel />);

      await waitFor(() => {
        expect(screen.getByText("New-User Onboarding")).toBeInTheDocument();
      });
      expect(screen.getByText("LIVE")).toBeInTheDocument();
      expect(screen.getByText("No completed onboardings")).toBeInTheDocument();
      expect(screen.getByText("No /api/onboarding traffic")).toBeInTheDocument();
    });
  });

  describe("SystemStatusPanel", () => {
    it("renders overall ProvenanceBadge and flow tiles", async () => {
      mockFetch({
        success: true,
        generatedAt: new Date().toISOString(),
        overall: "OK",
        flows: [
          {
            id: "auth",
            label: "Authentication",
            description: "Google OAuth and sessions",
            status: "OK",
            summary: "All auth flows operational",
            metrics: [{ label: "Logins", value: "15" }],
            issues: [],
            checkedAt: new Date().toISOString(),
            live: true,
          },
        ],
        dependencies: [
          {
            id: "stripe",
            label: "Stripe",
            status: "OK",
            summary: "Reachable",
            latencyMs: 45,
            checkedAt: new Date().toISOString(),
          },
        ],
      });

      render(<SystemStatusPanel />);

      await waitFor(() => {
        expect(screen.getByText("System Status")).toBeInTheDocument();
      });
      expect(screen.getAllByText("LIVE").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Authentication")).toBeInTheDocument();
      expect(screen.getByText("All auth flows operational")).toBeInTheDocument();
    });
  });

  describe("TodaysHighlightsPanel", () => {
    it("renders ProvenanceBadge and honest absence when a metric is offline", async () => {
      mockFetch({
        success: true,
        generatedAt: new Date().toISOString(),
        metrics: [
          {
            id: "signups",
            label: "Signups",
            today: 5,
            yesterday: 3,
            delta: 2,
            live: true,
            goodWhenIncreasing: true,
          },
          {
            id: "revenue",
            label: "Revenue",
            today: 0,
            yesterday: null,
            delta: null,
            live: false,
            goodWhenIncreasing: true,
          },
        ],
        live: true,
      });

      render(<TodaysHighlightsPanel />);

      await waitFor(() => {
        expect(screen.getByText("Today")).toBeInTheDocument();
      });
      // The offline metric must render em-dash — never a fake zero.
      expect(screen.getByText("—")).toBeInTheDocument();
      expect(screen.getByText("source offline")).toBeInTheDocument();
      expect(screen.getByText("+2 vs yesterday")).toBeInTheDocument();
    });
  });

  describe("UserInsightsPanel", () => {
    it("renders ProvenanceBadge and Metric tiles with honest degradation handling", async () => {
      mockFetch({
        success: true,
        generatedAt: new Date().toISOString(),
        live: false,
        totals: { all: 10, humans: 8, agents: 2, active: 5, admins: 1 },
        signups: { last24h: 1, last7d: 3, last30d: 8, trend: [] },
        activity: {
          activeIn24h: 3,
          activeIn7d: 5,
          activeIn30d: 8,
          neverLoggedIn: 1,
          dormantOver30d: 1,
          activeSessions: 2,
        },
        onboarding: {
          completed: 6,
          pending: 2,
          completionRate: 0.75,
          completedLast7d: 2,
          medianMinutesToComplete: 15,
        },
        tiers: { free: 8, premium: 1, admin: 1 },
        elements: { fire: 2, water: 2, earth: 1, air: 1, unknown: 0 },
        modalities: { cardinal: 2, fixed: 2, mutable: 2, unknown: 0 },
        sunSigns: [],
      });

      render(<UserInsightsPanel />);

      await waitFor(() => {
        expect(screen.getByText("User Insights")).toBeInTheDocument();
      });
      // When live is false, ProvenanceBadge shows NO SOURCE and Metric shows em-dash and warning banner
      expect(screen.getAllByText("NO SOURCE").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Degraded snapshot/)).toBeInTheDocument();
      expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });
  });

  describe("AdvancedMetricsPanel", () => {
    it("renders Metric KPIs, ProvenanceBadges, and EmptyStates", async () => {
      installFetchMock(
        jest.fn().mockImplementation((url: string) => {
          if (url.includes("/api/admin/users/stats")) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                success: true,
                users: {
                  total: 20,
                  active: 10,
                  onboarded: 15,
                  premium: 2,
                  agents: 3,
                  signups: { last24h: 2, last7d: 5 },
                  activity: { loggedIn24h: 4, loggedIn7d: 8, loggedIn30d: 12 },
                },
                sessions: { active: 3 },
                authEvents: {
                  last24h: { total: 0, successes: 0, failures: 0, byType: [] },
                  last7d: { total: 0, successes: 0, failures: 0, byType: [] },
                },
                recentLogins: [],
              }),
            });
          }
          if (url.includes("/api/admin/abuse")) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                success: true,
                window: "1h",
                suspiciousIps: [],
                targetedEmails: [],
              }),
            });
          }
          if (url.includes("/api/admin/observability")) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                success: true,
                requests: {
                  summary: {
                    count: 10,
                    p50LatencyMs: 20,
                    p95LatencyMs: 40,
                    p99LatencyMs: 60,
                    errorRate: 0,
                    topPaths: [],
                  },
                  recentFailures: [],
                },
                slowQueries: {
                  summary: { count: 0, thresholdMs: 100, slowestMs: 0 },
                  recent: [],
                },
              }),
            });
          }
          return Promise.reject(new Error(`Unhandled URL: ${url}`));
        }),
      );

      render(<AdvancedMetricsPanel />);

      await waitFor(() => {
        expect(screen.getByText("2 / 5")).toBeInTheDocument();
      });
      expect(screen.getByText("Advanced Metrics")).toBeInTheDocument();
      expect(screen.getAllByText("LIVE").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Sign-ups (24h / 7d)")).toBeInTheDocument();
      expect(screen.getByText("No auth events in last 24h")).toBeInTheDocument();
      expect(screen.getByText("No suspicious IPs")).toBeInTheDocument();
      expect(screen.getByText("No targeted emails")).toBeInTheDocument();
      expect(screen.getByText("No slow queries")).toBeInTheDocument();
      expect(screen.getByText("No 5xx failures")).toBeInTheDocument();
    });
  });
});
