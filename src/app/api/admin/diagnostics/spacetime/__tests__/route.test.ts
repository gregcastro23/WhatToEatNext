/** @jest-environment node */
import { NextRequest, NextResponse } from "next/server";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { resetSpacetimeCircuitBreakerForTests } from "@/lib/spacetime/spacetimeCircuitBreaker";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { feedDatabase } from "@/services/feedDatabaseService";
import { GET } from "../route";

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/lib/redis", () => ({
  invalidateCommunityAgentsCache: jest.fn().mockResolvedValue(undefined),
}));

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);

function allowAdmin(): void {
  mockValidateAdminRequest.mockResolvedValueOnce({
    user: {
      userId: "admin-1",
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
}

describe("Live Critique & SpacetimeDB asol.agent_rating Sweep Verification", () => {
  const originalFetch = global.fetch;
  const originalInternalSecret = process.env.INTERNAL_API_SECRET;

  beforeEach(() => {
    mockValidateAdminRequest.mockReset();
    mockExecuteQuery.mockReset();
    resetSpacetimeCircuitBreakerForTests();
    process.env.INTERNAL_API_SECRET = "test-internal-secret";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.INTERNAL_API_SECRET = originalInternalSecret;
  });

  it("returns 403 when admin validation fails on /api/admin/diagnostics/spacetime", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await GET(
      new NextRequest("http://localhost:3000/api/admin/diagnostics/spacetime"),
    );
    expect(res.status).toBe(403);
  });

  it("reconciles WTEN critique counts, ASOL rating gateway parity, and SpacetimeDB asol.agent_rating 71/71 sweep", async () => {
    allowAdmin();
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          live_critiques: 4,
          degraded_critiques: 1,
          curated_critiques: 142,
          saved_adaptations: 12,
          distinct_agents: 71,
          reflections_mirrored: 147,
          last_critique_at: "2026-11-10T18:00:00.000Z",
        },
      ],
    });

    installFetchMock(
      jest.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/agents/rating")) {
          return new Response(
            JSON.stringify({
              key: "leonardo-da-vinci",
              provenance: "historical",
              ovr: 79,
              esmsSource: "database",
              sky: { source: "swiss-ephemeris" },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        if (url.includes("/v1/database/asol/sql")) {
          return new Response(JSON.stringify([{ rows: [[71]] }]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response("Not Found", { status: 404 });
      }),
    );

    const res = await GET(
      new NextRequest("http://localhost:3000/api/admin/diagnostics/spacetime"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.diagnostics.agentRatingSync).toMatchObject({
      critiquePipeline: {
        live: true,
        liveCritiques: 4,
        degradedCritiques: 1,
        curatedCritiques: 142,
        savedAdaptations: 12,
        distinctHistoricalAgents: 71,
        reflectionsMirrored: 147,
      },
      asolRatingGateway: {
        reachable: true,
        statusCode: 200,
        agentId: "leonardo-da-vinci",
        ovr: 79,
        esmsSource: "database",
        skySource: "swiss-ephemeris",
        provenance: "historical",
      },
      spacetimeAgentRating: {
        database: "asol",
        status: "synced",
        statusCode: 200,
        publishedCount: 71,
        expectedHistoricalAgents: 71,
        unmatchedCount: 0,
      },
    });
  });

  it("reports paused status, opens the PostgreSQL fallback circuit breaker, and emits an availability shift alert when SpacetimeDB Maincloud returns 503", async () => {
    allowAdmin();
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            live_critiques: 0,
            degraded_critiques: 0,
            curated_critiques: 142,
            saved_adaptations: 12,
            distinct_agents: 71,
            reflections_mirrored: 142,
            last_critique_at: "2026-11-10T18:00:00.000Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            agent_count: 71,
            rated_critiques: 142,
            avg_rating: 4.5,
          },
        ],
      });

    installFetchMock(
      jest.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/agents/rating")) {
          return new Response(
            JSON.stringify({
              key: "socrates",
              provenance: "historical",
              ovr: 76,
              esmsSource: "database",
              sky: { source: "swiss-ephemeris" },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response("database is paused", { status: 503 });
      }),
    );

    const res = await GET(
      new NextRequest(
        "http://localhost:3000/api/admin/diagnostics/spacetime?agentId=socrates",
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.diagnostics.agentRatingSync.spacetimeAgentRating).toEqual({
      database: "asol",
      status: "paused",
      statusCode: 503,
      publishedCount: null,
      expectedHistoricalAgents: 71,
      unmatchedCount: null,
      detail: "SpacetimeDB module asol is currently paused on Maincloud",
      fallback: {
        source: "postgresql_fallback",
        available: true,
        agentCount: 71,
        ratedCritiqueCount: 142,
        averageRating: 4.5,
      },
    });
    expect(body.diagnostics.agentRatingSync.circuitBreaker).toMatchObject({
      state: "open",
      lastClusterStatus: "paused",
      activeReadSource: "postgresql_fallback",
      consecutiveFailures: 1,
    });
    expect(body.diagnostics.agentRatingSync.circuitBreaker.shiftAlerts).toHaveLength(1);
    expect(body.diagnostics.agentRatingSync.circuitBreaker.shiftAlerts[0]).toMatchObject({
      previousStatus: "unknown",
      nextStatus: "paused",
      circuitState: "open",
      activeReadSource: "postgresql_fallback",
      severity: "warning",
    });

    // Verify feedDatabase routes rating reads through PostgreSQL fallback
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ agent_count: 1, rated_critiques: 2, avg_rating: 5 }],
    });
    const fallbackSummary = await feedDatabase.getAgentRatingSummaryWithFallback("socrates");
    expect(fallbackSummary).toEqual({
      source: "postgresql_fallback",
      available: true,
      agentCount: 1,
      ratedCritiqueCount: 2,
      averageRating: 5,
      circuitState: "open",
    });
  });

  it("records outbound PA feed webhook telemetry in feedEmitTracker when an agent critique is published", async () => {
    installFetchMock(jest.fn(async () => new Response("ok", { status: 202 })));

    await feedDatabase.pushAgentFeedWebhook({
      agentEmail: "socrates@agentic.alchm.kitchen",
      agentDisplayName: "Socrates",
      eventType: "recipe_review",
      metadataPayload: {
        recipeId: "greek-lentil-soup",
        source: "catalog_critique",
        contentState: "live",
      },
    });
    // Allow promise chain to settle
    await new Promise((resolve) => setImmediate(resolve));

    const lastEmit = feedEmitTracker.getLastEmit();
    expect(lastEmit).toMatchObject({
      eventType: "recipe_review",
      agentEmail: "socrates@agentic.alchm.kitchen",
      responseCode: 202,
    });
  });
});
