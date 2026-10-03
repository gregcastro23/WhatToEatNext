/**
 * Tests for AdminAgentsSchema
 *
 * @file src/lib/admin/schemas/__tests__/agentsAdminSchema.test.ts
 */

import {
  AdminAgentsSchema,
  AdminAgentsResponseSchema,
  type AdminAgentsView,
} from "@/lib/admin/schemas/agents";

function makeValidPayload(): AdminAgentsView {
  return {
    generatedAt: "2026-10-03T12:00:00.000Z",
    live: true,
    roster: {
      totalAgents: 42,
      activeAgents24h: 12,
      live: true,
    },
    connectivity: {
      services: [
        {
          key: "planetaryAgentsApi",
          label: "Planetary Agents API",
          url: "https://api.agents.alchm.kitchen/health",
          reachable: true,
          statusCode: 200,
          latencyMs: 45,
          checkedAt: "2026-10-03T12:00:00.000Z",
        },
        {
          key: "agentsUi",
          label: "Planetary Agents UI",
          url: "https://agents.alchm.kitchen",
          reachable: true,
          statusCode: 200,
          latencyMs: 65,
          checkedAt: "2026-10-03T12:00:00.000Z",
        },
      ],
      contractProbe: {
        success: true,
        timestamp: "2026-10-03T12:00:00.000Z",
        checks: {
          agentRosterAuth: { passed: true, status: 200 },
          syncStatusAuth: { passed: true, status: 200 },
          vesselAuth: { passed: true, status: 200 },
          checkSharedAuth: { passed: true, status: 200 },
          negativeControls: {
            passed: true,
            allRejectedWith401: true,
            statuses: {
              "agent-roster": 401,
              "sync-status": 401,
              vessel: 401,
              "check-shared": 401,
            },
          },
        },
      },
      inboundDelivery: {
        generatedAt: "2026-10-03T12:00:00.000Z",
        totalReceived: 100,
        totalProcessed: 98,
        totalInFlight: 1,
        totalLiveInFlight: 1,
        totalStaleLocks: 0,
        totalFailed: 1,
        totalDuplicates: 5,
        overallP95LatencyMs: 85,
        sources: [
          {
            source: "asol-sync-event",
            received: 50,
            processed: 50,
            inFlight: 0,
            liveInFlight: 0,
            staleLocks: 0,
            failed: 0,
            duplicates: 2,
            p95LatencyMs: 70,
            signatureBreakdown: {
              valid: 50,
              unsigned: 0,
              untracked: 0,
              failed: 0,
              reasons: {},
            },
          },
        ],
        recentEvents: [],
        feedStatus: {
          lastEmit: null,
          signatureMode: "shadow",
          signatureModeInfo: {
            mode: "shadow",
            raw: "shadow",
            valid: true,
          },
          internalSecretConfigured: true,
          syncSecretConfigured: true,
          hookSecretConfigured: true,
        },
      },
    },
    actions: {
      creditPath: {
        verdict: "OK",
        summary: "12 credits · 15 calls",
        calls24h: 15,
        credits24h: 12,
        lastCreditAgeMs: 3600000,
        priorCalls7d: 100,
        priorCredits7d: 95,
        live: true,
      },
      debitPath: {
        verdict: "OK",
        summary: "8 debits · 10 calls",
        agentTraffic24h: 10,
        trafficSource: "sync-debit-calls",
        debits24h: 8,
        lastDebitAgeMs: 4000000,
        live: true,
      },
      actionMetrics: [
        {
          action: "credit",
          label: "Agent Credit Push",
          path: "/api/economy/sync-credit",
          calls24h: 15,
          successes24h: 15,
          failures24h: 0,
          serverFailures24h: 0,
          p50Ms: 35,
          p95Ms: 90,
          lastSeenAt: "2026-10-03T11:55:00.000Z",
        },
      ],
      cronHeartbeats: [
        {
          name: "agents-daily-yield",
          schedule: "0 0 * * *",
          expectedIntervalMinutes: 1440,
          lastRun: "2026-10-03T00:00:00.000Z",
          lastStatus: "success",
          state: "ok",
        },
      ],
      recipePipeline: {
        attempts: 25,
        repairs: 0,
        retries: 0,
        refunds: 1,
        finalFailures: 0,
        live: true,
      },
    },
  };
}

describe("AdminAgentsSchema", () => {
  it("validates a complete, valid AdminAgentsView payload", () => {
    const payload = makeValidPayload();
    const result = AdminAgentsSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("validates with AdminAgentsResponseSchema when wrapped in success: true", () => {
    const payload = { success: true, ...makeValidPayload() };
    const result = AdminAgentsResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("fails if required sections are missing", () => {
    const invalid = {
      generatedAt: "2026-10-03T12:00:00.000Z",
      live: true,
      // missing roster, connectivity, actions
    };
    const result = AdminAgentsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("fails if creditPath verdict is invalid", () => {
    const payload = makeValidPayload();
    const invalid = {
      ...payload,
      actions: {
        ...payload.actions,
        creditPath: {
          ...payload.actions.creditPath,
          verdict: "INVALID_VERDICT",
        },
      },
    };
    const result = AdminAgentsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("fails if cron heartbeat state is invalid", () => {
    const payload = makeValidPayload();
    const invalid = {
      ...payload,
      actions: {
        ...payload.actions,
        cronHeartbeats: [
          {
            ...payload.actions.cronHeartbeats[0],
            state: "unknown-state",
          },
        ],
      },
    };
    const result = AdminAgentsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
