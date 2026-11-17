/**
 * Unit tests for trafficReaders: readRefRollups, readPlannerFunnel,
 * readLabEngagement, readFrictionAlerts, and buildVisitorSessions feedback attachment.
 *
 * @file src/services/admin/__tests__/trafficReaders.test.ts
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

import { executeQuery } from "@/lib/database/connection";
import {
  buildVisitorSessions,
  computeVariantLiftAndConfidence,
  enrichRecentPageViews,
  readActivationAndStickiness,
  readFrictionAlerts,
  readInteractionTallies,
  readLabEngagement,
  readPlannerFunnel,
  readRefRollups,
  readRetentionCohorts,
  readRouteFlowMatrix,
  readSessionFeedback,
} from "@/services/admin/trafficReaders";

const mockQuery = jest.mocked(executeQuery);

describe("trafficReaders rollups, funnels, and friction alerts", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("computes per-tag ?ref= attribution rollups and degrades to [] when column is missing", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          ref_tag: "alex-feedback",
          visitors: 3,
          sessions: 4,
          pageviews: 12,
          engaged_sessions: 3,
          median_dwell_ms: 62_400,
          avg_pages: 3.0,
          signed_in_users: 1,
        },
      ],
      command: "SELECT",
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const rollups = await readRefRollups("24 hours");
    expect(rollups).toEqual([
      {
        refTag: "alex-feedback",
        visitors: 3,
        sessions: 4,
        pageviews: 12,
        engagedSessions: 3,
        engagedRate: 0.75,
        medianDwellMs: 62_400,
        avgPagesPerSession: 3.0,
        signedInUsers: 1,
      },
    ]);

    mockQuery.mockRejectedValueOnce(Object.assign(new Error("column ref_tag does not exist"), { code: "42703" }));
    expect(await readRefRollups("24 hours")).toEqual([]);
  });

  it("computes Menu Planner -> Cart conversion funnel stages and cohorts", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { cohort: "all", landed: 10, generated: 6, refined: 4, converted: 2 },
        { cohort: "Via ?ref= Share Link", landed: 4, generated: 3, refined: 2, converted: 2 },
        { cohort: "Direct / Organic", landed: 6, generated: 3, refined: 2, converted: 0 },
      ],
      command: "SELECT",
      rowCount: 3,
      oid: 0,
      fields: [],
    });

    const funnel = await readPlannerFunnel("7 days");
    expect(funnel.stages).toHaveLength(4);
    expect(funnel.stages[0]).toEqual({ stage: "1. Landed on /menu-planner", sessions: 10, rate: 1 });
    expect(funnel.stages[3]).toEqual({ stage: "4. Exported / Cart Handoff", sessions: 2, rate: 0.2 });
    expect(funnel.cohorts[0]).toMatchObject({
      label: "Via ?ref= Share Link",
      landed: 4,
      converted: 2,
      conversionRate: 0.5,
    });
  });

  it("ranks lab tab and solver interactions with median dwell", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { tag: "patch:solve:opus_culinaris", sessions: 5, median_dwell_ms: 94_000 },
        { tag: "tab:kitchenLab", sessions: 8, median_dwell_ms: 42_000 },
      ],
      command: "SELECT",
      rowCount: 2,
      oid: 0,
      fields: [],
    });

    const rows = await readLabEngagement("7 days");
    expect(rows).toEqual([
      { tag: "patch:solve:opus_culinaris", kind: "solver", sessions: 5, medianDwellMs: 94_000 },
      { tag: "tab:kitchenLab", kind: "tab", sessions: 8, medianDwellMs: 42_000 },
    ]);
  });

  it("detects client error bursts, zero-result spikes, and active reviewers", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ sessions: 4, top_tag: "error:api_500:search" }],
        command: "SELECT",
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [{ act: "search:zero_results:black_garlic", sessions: 3 }],
        command: "SELECT",
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            sid: "sess-vip",
            ref_tag: "investor-demo",
            path: "/menu-planner",
            last_seen_at: new Date("2026-11-16T02:00:00Z"),
            visitor_hash: "deadbeef1122334455667788",
          },
        ],
        command: "SELECT",
        rowCount: 1,
        oid: 0,
        fields: [],
      });

    const alerts = await readFrictionAlerts();
    expect(alerts.errorBurstTriggered).toBe(true);
    expect(alerts.errorSessions60m).toBe(4);
    expect(alerts.topErrorTag).toBe("error:api_500:search");
    expect(alerts.topZeroResultQuery).toEqual({ slug: "black_garlic", sessions: 3 });
    expect(alerts.activeReviewers[0]?.refTag).toBe("investor-demo");
  });

  it("attaches session_feedback items onto matching VisitorSessions", () => {
    const now = new Date("2026-11-16T02:00:00Z");
    const sessions = buildVisitorSessions(
      [
        {
          id: "pv-1",
          at: "2026-11-16T01:59:00Z",
          path: "/menu-planner",
          referrerHost: null,
          country: "US",
          region: "NY",
          city: "New York",
          deviceType: "mobile",
          browser: "Safari",
          os: "iOS",
          sessionId: "sess-99",
          visitorHash: "abcdef001122334455667788",
          durationMs: 25_000,
          refTag: "alex",
          interactions: [],
          user: null,
        },
      ],
      now,
      [
        {
          id: "fb-1",
          at: "2026-11-16T01:59:20Z",
          viewId: "v-1",
          sessionId: "sess-99",
          visitorHash: "abcdef001122334455667788",
          path: "/menu-planner",
          refTag: "alex",
          rating: 5,
          note: "Loved the ingredient-first meal planner!",
        },
      ],
    );

    expect(sessions[0]?.feedback).toHaveLength(1);
    expect(sessions[0]?.feedback?.[0]?.note).toBe("Loved the ingredient-first meal planner!");
  });

  it("aggregates site-wide interaction tallies with category rollups and excludes /admin", async () => {
    const seen = new Date("2026-11-16T01:55:00Z");
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          tag: null,
          category: null,
          total_count: 15,
          unique_views: 10,
          unique_sessions: 8,
          unique_visitors: 6,
          avg_dwell_ms: 42_000,
          last_seen_at: seen,
          top_path: null,
          total_sessions: 20,
        },
        {
          tag: null,
          category: "plan",
          total_count: 9,
          unique_views: 6,
          unique_sessions: 6,
          unique_visitors: 5,
          avg_dwell_ms: 51_000,
          last_seen_at: seen,
          top_path: null,
          total_sessions: 20,
        },
        {
          tag: "plan:fill_week",
          category: "plan",
          total_count: 9,
          unique_views: 6,
          unique_sessions: 6,
          unique_visitors: 5,
          avg_dwell_ms: 51_000,
          last_seen_at: seen,
          top_path: "/menu-planner",
          total_sessions: 20,
        },
        {
          tag: "search:zero_results:matcha",
          category: "search",
          total_count: 6,
          unique_views: 4,
          unique_sessions: 3,
          unique_visitors: 3,
          avg_dwell_ms: 18_500,
          last_seen_at: seen,
          top_path: "/",
          total_sessions: 20,
        },
      ],
      command: "SELECT",
      rowCount: 4,
      oid: 0,
      fields: [],
    });

    const tallies = await readInteractionTallies("7 days");
    const sql = mockQuery.mock.calls[0]?.[0] ?? "";
    expect(sql).toContain("path <> '/admin'");
    expect(sql).toContain("path NOT LIKE '/admin/%'");
    expect(tallies.totalInteractions).toBe(15);
    expect(tallies.totalSessionsWithInteractions).toBe(8);
    expect(tallies.categories).toEqual([
      {
        category: "plan",
        totalCount: 9,
        uniqueSessions: 6,
        sessionReachPct: 0.3,
      },
    ]);
    expect(tallies.rows[0]).toMatchObject({
      tag: "plan:fill_week",
      category: "plan",
      tone: "feature",
      totalCount: 9,
      uniqueViews: 6,
      uniqueSessions: 6,
      uniqueVisitors: 5,
      sessionReachPct: 0.3,
      avgDwellMs: 51_000,
      topPath: "/menu-planner",
      lastSeenAt: seen.toISOString(),
    });
    expect(tallies.rows[1]?.tone).toBe("friction");
  });

  it("enriches individual page views with Entry/Step/Exit badges and attached feedback", () => {
    const now = new Date("2026-11-16T02:00:00Z");
    const rawRecent = [
      {
        id: "pv-2",
        viewId: "v-2",
        at: "2026-11-16T01:59:30Z",
        lastSeenAt: "2026-11-16T01:59:50Z",
        path: "/menu-planner",
        referrerHost: null,
        country: "US",
        region: "NY",
        city: "New York",
        deviceType: "desktop",
        browser: "Chrome",
        os: "macOS",
        sessionId: "sess-100",
        visitorHash: "vis-hash-100",
        durationMs: 20_000,
        refTag: "qa-review",
        interactions: ["plan:fill_week"],
        isEngaged: true,
        isLive: true,
        user: null,
      },
      {
        id: "pv-1",
        viewId: "v-1",
        at: "2026-11-16T01:58:00Z",
        lastSeenAt: "2026-11-16T01:59:25Z",
        path: "/",
        referrerHost: "google.com",
        country: "US",
        region: "NY",
        city: "New York",
        deviceType: "desktop",
        browser: "Chrome",
        os: "macOS",
        sessionId: "sess-100",
        visitorHash: "vis-hash-100",
        durationMs: 85_000,
        refTag: "qa-review",
        interactions: [],
        isEngaged: true,
        isLive: false,
        user: null,
      },
    ];

    const sessions = buildVisitorSessions(rawRecent, now, [
      {
        id: "fb-1",
        at: "2026-11-16T01:59:40Z",
        viewId: "v-2",
        sessionId: "sess-100",
        visitorHash: "vis-hash-100",
        path: "/menu-planner",
        refTag: "qa-review",
        rating: 5,
        note: "Smooth planner!",
      },
    ]);
    const enriched = enrichRecentPageViews(rawRecent, sessions);

    const plannerView = enriched.find((v) => v.id === "pv-2");
    const homeView = enriched.find((v) => v.id === "pv-1");
    expect(homeView).toMatchObject({
      stepIndex: 1,
      stepCount: 2,
      isEntry: true,
      isExit: false,
      feedback: [],
    });
    expect(plannerView).toMatchObject({
      stepIndex: 2,
      stepCount: 2,
      isEntry: false,
      isExit: true,
      isEngaged: true,
      isLive: true,
      visitNumber: 1,
    });
    expect(plannerView?.feedback?.[0]?.note).toBe("Smooth planner!");
  });

  it("computes route flow matrix metrics with entry/exit/bounce rates and top next hops", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          path: "/menu-planner",
          total_views: 25,
          unique_sessions: 20,
          entry_count: 10,
          exit_count: 8,
          bounced_entries: 2,
          avg_dwell_ms: 48_500,
          friction_count: 3,
          top_next_paths: [
            { path: "/recipes", count: 7 },
            { path: "/baking-lab", count: 4 },
          ],
        },
      ],
      command: "SELECT",
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const matrix = await readRouteFlowMatrix("7 days");
    const sql = mockQuery.mock.calls[0]?.[0] ?? "";
    expect(sql).toContain("path <> '/admin'");
    expect(matrix).toEqual([
      {
        path: "/menu-planner",
        totalViews: 25,
        uniqueSessions: 20,
        entryCount: 10,
        entryRatePct: 0.5,
        exitCount: 8,
        exitRatePct: 0.4,
        singlePageBounceRatePct: 0.2,
        avgDwellMs: 48_500,
        frictionCount: 3,
        topNextPaths: [
          { path: "/recipes", count: 7 },
          { path: "/baking-lab", count: 4 },
        ],
      },
    ]);
  });

  it("computes activation, returning rate, frustration rate, and DAU/WAU stickiness", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          total_visitors: 100,
          returning_visitors: 25,
          total_sessions: 120,
          activated_sessions: 48,
          avg_ttfa_ms: 14_200,
          frustrated_sessions: 6,
          dau_count: 30,
          wau_count: 100,
        },
      ],
      command: "SELECT",
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const pulse = await readActivationAndStickiness("7 days");
    expect(pulse).toEqual({
      totalVisitors: 100,
      newVisitors: 75,
      returningVisitors: 25,
      returningRatePct: 0.25,
      activatedSessions: 48,
      activationRatePct: 0.4,
      avgTimeToFirstActionMs: 14_200,
      frustratedSessions: 6,
      frustrationRatePct: 0.05,
      dauCount: 30,
      wauCount: 100,
      stickinessRatioPct: 0.3,
    });
  });

  it("reads session_feedback status and falls back to open when status column is missing", async () => {
    const resolvedAt = new Date("2026-11-16T03:00:00Z");
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "11",
          at: new Date("2026-11-16T02:00:00Z"),
          view_id: "v-11",
          session_id: "sess-11",
          visitor_hash: "hash-11",
          path: "/menu-planner",
          ref_tag: "alex",
          rating: 4,
          note: "Fixed after deploy",
          status: "resolved",
          resolved_at: resolvedAt,
        },
      ],
      command: "SELECT",
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const withStatus = await readSessionFeedback(10);
    expect(withStatus[0]?.status).toBe("resolved");
    expect(withStatus[0]?.resolvedAt).toBe(resolvedAt.toISOString());

    const missingColErr = Object.assign(new Error("column status does not exist"), { code: "42703" });
    mockQuery.mockRejectedValueOnce(missingColErr);
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "12",
          at: new Date("2026-11-16T01:00:00Z"),
          view_id: "v-12",
          session_id: "sess-12",
          visitor_hash: "hash-12",
          path: "/",
          ref_tag: null,
          rating: 5,
          note: "Pre-104 note",
        },
      ],
      command: "SELECT",
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const fallbackRows = await readSessionFeedback(10);
    expect(fallbackRows[0]?.status).toBe("open");
    expect(fallbackRows[0]?.resolvedAt).toBeNull();
  });

  it("computes variant conversion lift and two-proportion z-test confidence labels", () => {
    const lowN = computeVariantLiftAndConfidence([
      { variant: "variant:fast_start_cta=control", sessions: 10, activatedSessions: 3, activationRatePct: 0.3, frustratedSessions: 0, frustrationRatePct: 0 },
      { variant: "variant:fast_start_cta=instant_plan", sessions: 10, activatedSessions: 6, activationRatePct: 0.6, frustratedSessions: 0, frustrationRatePct: 0 },
    ]);
    expect(lowN[0]?.confidenceLabel).toBe("Insufficient Data");
    expect(lowN[1]?.liftVsControlPct).toBe(100);
    expect(lowN[1]?.confidenceLabel).toBe("Insufficient Data");

    const sig = computeVariantLiftAndConfidence([
      { variant: "variant:fast_start_cta=control", sessions: 100, activatedSessions: 20, activationRatePct: 0.2, frustratedSessions: 0, frustrationRatePct: 0 },
      { variant: "variant:fast_start_cta=instant_plan", sessions: 100, activatedSessions: 45, activationRatePct: 0.45, frustratedSessions: 0, frustrationRatePct: 0 },
    ]);
    expect(sig[0]?.liftVsControlPct).toBeNull();
    expect(sig[1]?.liftVsControlPct).toBe(125);
    expect(sig[1]?.confidenceLabel).toBe("Statistically Significant (95%+)");
  });

  it("reads visitor retention cohorts (Day-0 activation and D1/D3/D7 returns) and degrades gracefully", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          cohort_start: "2026-11-10",
          new_visitors: 20,
          activated_day0: 12,
          returned_d1: 8,
          returned_d3: 5,
          returned_d7: 3,
        },
      ],
      command: "SELECT",
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const cohorts = await readRetentionCohorts(14);
    expect(cohorts).toEqual([
      {
        cohortStart: "2026-11-10",
        cohortLabel: "Nov 10",
        newVisitors: 20,
        activatedFirstDayPct: 0.6,
        d1ReturnPct: 0.4,
        d3ReturnPct: 0.25,
        d7ReturnPct: 0.15,
      },
    ]);

    mockQuery.mockRejectedValueOnce(Object.assign(new Error("relation does not exist"), { code: "42P01" }));
    expect(await readRetentionCohorts(14)).toEqual([]);
  });
});
