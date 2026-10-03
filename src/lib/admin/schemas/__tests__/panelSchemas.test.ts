/**
 * Round-trips for the admin panel schemas that replaced `(await res.json()) as T`
 * (Phase 42). Fixtures are the DEGRADED shapes each route sends when a source
 * is down — nulls, `live: false`, empty lists, an `error` string — because
 * Phase 41's regressions came from schemas that only knew the happy path.
 */
import { AgentNetworkResponseSchema, AgentSyncBatchResponseSchema, MonicaTelemetryResponseSchema } from "../agents";
import { ReportQueueCountSchema } from "../moderation";
import { OnboardingHealthResponseSchema } from "../onboardingHealth";
import { ReliabilityResponseSchema } from "../reliability";
import { SettlementActionSuccessSchema, SettlementListResponseSchema } from "../settlement";
import { SystemStatusResponseSchema } from "../systemStatus";
import { TodaysHighlightsResponseSchema } from "../todaysHighlights";
import { UserInsightsResponseSchema } from "../userInsights";

const wire = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const at = "2026-09-25T12:00:00.000Z";

describe("admin panel schemas accept each route's degraded payload", () => {
  it("system status with an unmeasured dependency", () => {
    expect(
      SystemStatusResponseSchema.safeParse(
        wire({
          success: true,
          generatedAt: at,
          overall: "DEGRADED",
          flows: [
            { id: "auth", label: "Auth", description: "d", status: "UNKNOWN", summary: "no source", metrics: [{ label: "p95", value: "—" }], issues: [], checkedAt: at, live: false },
          ],
          dependencies: [{ id: "stripe", label: "Stripe", status: "UNKNOWN", summary: "idle", latencyMs: null, checkedAt: at }],
        }),
      ).success,
    ).toBe(true);
  });

  it("onboarding health with no observed API traffic", () => {
    expect(
      OnboardingHealthResponseSchema.safeParse(
        wire({
          success: true,
          generatedAt: at,
          overall: "UNKNOWN",
          headline: "no data",
          funnel: [],
          stuckUsers: [{ userId: "u", email: "e", name: null, createdAt: at, ageHours: 3, missing: "birth data" }],
          recentSuccesses: [],
          apiHealth: { observed: false, count: 0, successRate: 0, errors4xx: 0, errors5xx: 0, p50LatencyMs: 0, p95LatencyMs: 0, recentErrors: [] },
          skipRate: 0,
          live: false,
        }),
      ).success,
    ).toBe(true);
  });

  it("today's highlights with no yesterday comparison and no hint", () => {
    expect(
      TodaysHighlightsResponseSchema.safeParse(
        wire({ success: true, generatedAt: at, live: false, metrics: [{ id: "m", label: "Signups", today: 0, yesterday: null, delta: null, live: false, goodWhenIncreasing: true }] }),
      ).success,
    ).toBe(true);
  });

  it("user insights without the optional visitor tiers", () => {
    const zeros = { fire: 0, water: 0, earth: 0, air: 0, unknown: 0 };
    expect(
      UserInsightsResponseSchema.safeParse(
        wire({
          success: true,
          generatedAt: at,
          live: false,
          totals: { all: 0, humans: 0, agents: 0, active: 0, admins: 0 },
          signups: { last24h: 0, last7d: 0, last30d: 0, trend: [] },
          activity: { activeIn24h: 0, activeIn7d: 0, activeIn30d: 0, neverLoggedIn: 0, dormantOver30d: 0, activeSessions: 0 },
          onboarding: { completed: 0, pending: 0, completionRate: 0, completedLast7d: 0, medianMinutesToComplete: null },
          tiers: { free: 0, premium: 0, admin: 0 },
          elements: zeros,
          modalities: { cardinal: 0, fixed: 0, mutable: 0, unknown: 0 },
          sunSigns: [],
        }),
      ).success,
    ).toBe(true);
  });

  it("reliability with every source down", () => {
    expect(
      ReliabilityResponseSchema.safeParse(
        wire({
          success: true,
          generatedAt: at,
          health: { points: [], windowHours: 0, uptimePct: null, drift: null, live: false },
          probes: { probes: [], windowDays: 7, totalRuns: 0, totalFailures: 0, live: false },
          alerts: { windowDays: 30, alertsFired: 0, suppressed: 0, channels: [], live: false },
        }),
      ).success,
    ).toBe(true);
  });

  it("settlement list with unknown lifetime totals, and both action outcomes", () => {
    expect(SettlementListResponseSchema.safeParse(wire({ success: true, pending: [], lifetime: null })).success).toBe(true);
    expect(
      SettlementActionSuccessSchema.safeParse(wire({ success: true, action: "retry", orderId: "o", transferId: "tr_1", status: "paid" })).success,
    ).toBe(true);
    expect(
      SettlementActionSuccessSchema.safeParse(
        wire({ success: true, action: "refund", orderId: "o", credited: [], balances: {}, status: "refunded" }),
      ).success,
    ).toBe(true);
    expect(SettlementActionSuccessSchema.safeParse(wire({ success: false, message: "Order not found." })).success).toBe(false);
  });

  it("Monica telemetry's fallback payload when the agents backend is down", () => {
    expect(
      MonicaTelemetryResponseSchema.safeParse(
        wire({
          success: true,
          window: "24h",
          generatedAt: at,
          helpfulnessScore: null,
          helpfulnessSampleSize: 0,
          avgCompletionMs: null,
          totalInteractions: 0,
          contextualHelpRequests: 0,
          topPages: [],
          live: false,
          source: "fallback",
          error: "fetch failed",
        }),
      ).success,
    ).toBe(true);
  });

  it("an empty agent network", () => {
    const empty = { entries: [], live: false };
    expect(
      AgentNetworkResponseSchema.safeParse(
        wire({
          success: true,
          generatedAt: at,
          totals: { total: 0, live: 0, idle: 0, warn: 0, draining: 0, live_source: false },
          roles: empty,
          dispatch: empty,
          leaderboard: empty,
          interactions: empty,
          roleOps: empty,
          reasoning: { ...empty, instrumented: false },
          modifiers: { ...empty, netVelocity: 0 },
        }),
      ).success,
    ).toBe(true);
  });

  it("an agent sync batch where one request never got a reply", () => {
    expect(
      AgentSyncBatchResponseSchema.safeParse(
        wire({
          success: true,
          synced: 1,
          failed: 1,
          results: [
            { agentId: "a", email: "a@agentic.alchm.kitchen", ok: true, status: 200 },
            { agentId: "b", email: "b@agentic.alchm.kitchen", ok: false, error: "timeout" },
          ],
        }),
      ).success,
    ).toBe(true);
  });

  it("a report queue body without `reports` is unreadable, not empty", () => {
    expect(ReportQueueCountSchema.safeParse({ success: true, reports: [] }).success).toBe(true);
    expect(ReportQueueCountSchema.safeParse({ success: false, message: "nope" }).success).toBe(false);
  });
});
