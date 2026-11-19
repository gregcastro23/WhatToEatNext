/** @jest-environment node */
/**
 * Unit tests for GET /api/admin/agents/network: query routing, dormant role
 * fallback, response shaping, and bounded DB fan-out concurrency (<= 2).
 *
 * @file src/app/api/admin/agents/network/__tests__/route.test.ts
 */

import { NextRequest, NextResponse } from "next/server";
import type { QueryResult } from "pg";
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { clearAll } from "@/lib/cache/memoryCache";
import { getCosmicModifiers } from "@/services/skyConditionsService";
import { GET } from "../route";

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

jest.mock("@/services/skyConditionsService", () => ({
  getCosmicModifiers: jest.fn(),
}));

const mockValidateAdmin = jest.mocked(validateAdminRequest);
const mockGetCosmicModifiers = jest.mocked(getCosmicModifiers);

function allowAdmin(): void {
  mockValidateAdmin.mockResolvedValueOnce({
    user: {
      userId: "admin-1",
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
}

function qr(rows: Record<string, unknown>[]): QueryResult<Record<string, unknown>> {
  return {
    rows,
    command: "SELECT",
    rowCount: rows.length,
    oid: 0,
    fields: [],
  };
}

function makeQueryRouter(opts: {
  includeDormantHistory?: boolean;
  delayMs?: number;
  onConcurrent?: (inFlight: number) => void;
}) {
  let inFlight = 0;
  return async (
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<Record<string, unknown>>> => {
    inFlight += 1;
    opts.onConcurrent?.(inFlight);
    try {
      if (opts.delayMs) {
        await new Promise<void>((resolve): void => {
          setTimeout(resolve, opts.delayMs);
        });
      }
      if (sql.includes("recent_actors")) {
        return qr([{ total: 10, live: 4, idle: 2, warn: 3, draining: 1 }]);
      }
      if (sql.includes("per_actor_type")) {
        return qr([
          {
            role: "insight",
            agent_count: 6,
            live_count: 3,
            idle_count: 1,
            warn_count: 2,
            draining_count: 0,
            events_24h: 42,
          },
        ]);
      }
      if (sql.includes("COUNT(f.id)::int AS events_24h")) {
        return qr([
          {
            actor_id: "a1",
            email: "galileo@agentic.alchm.kitchen",
            name: "Galileo",
            events_24h: 12,
            last_event_at: new Date("2026-11-19T04:00:00Z"),
            dominant_element: "Fire",
          },
        ]);
      }
      if (sql.includes("target_resolved_name")) {
        return qr([]);
      }
      if (sql.includes("FROM role_events")) {
        return qr([
          {
            role: "galileo",
            agent_count: 4,
            events_24h: 20,
            events_7d: 90,
            events_total: 500,
            last_activity: new Date("2026-11-19T04:10:00Z"),
          },
          ...(opts.includeDormantHistory
            ? [
                {
                  role: "lineage",
                  agent_count: 2,
                  events_24h: 0,
                  events_7d: 0,
                  events_total: 120,
                  last_activity: new Date("2026-07-19T12:00:00Z"),
                },
              ]
            : []),
        ]);
      }
      if (sql.includes("ANY($1::text[])") && sql.includes("split_part(f.event_type, '.', 1) = ANY($2::text[])")) {
        expect(params?.[1]).toEqual(["lineage"]);
        return qr([
          { role: "lineage", action: "scrabble_sweep", count: 95 },
          { role: "lineage", action: "scrabble_bingo", count: 25 },
        ]);
      }
      if (sql.includes("WHERE f.created_at > NOW() - INTERVAL '7 days'") && sql.includes("AS action")) {
        return qr([{ role: "galileo", action: "insight", count: 75 }]);
      }
      if (sql.includes("top_candidates")) {
        return qr([
          {
            agent_id: "a1",
            handle: "Galileo",
            created_at: new Date("2026-11-19T04:12:00Z"),
            preview: "Mercury sextile Venus favors herbaceous broths.",
          },
        ]);
      }
      if (sql.includes("ORDER BY f.created_at DESC")) {
        return qr([
          {
            id: "ev-1",
            actor_id: "a1",
            event_type: "insight",
            created_at: new Date("2026-11-19T04:10:00Z"),
            email: "galileo@agentic.alchm.kitchen",
            name: "Galileo",
          },
        ]);
      }
      return qr([]);
    } finally {
      inFlight -= 1;
    }
  };
}

beforeEach(() => {
  clearAll();
  jest.clearAllMocks();
  mockExecuteQuery.mockReset();
  mockGetCosmicModifiers.mockResolvedValue({
    modifiers: [],
    netVelocity: 0.1,
    live: true,
    generatedAt: "2026-11-19T00:00:00.000Z",
  });
});

const NetworkBodySchema = z.object({
  success: z.boolean(),
  totals: z.object({
    total: z.number(),
    live: z.number(),
    idle: z.number(),
    warn: z.number(),
    draining: z.number(),
    live_source: z.boolean(),
  }),
  roleOps: z.object({
    entries: z.array(
      z.object({
        id: z.string(),
        events7d: z.number(),
        actions: z.array(z.object({ action: z.string(), count: z.number() })),
      }),
    ),
  }),
  reasoning: z.object({
    entries: z.array(z.object({ agentHandle: z.string(), preview: z.string() })),
    live: z.boolean(),
  }),
});

describe("GET /api/admin/agents/network", () => {
  it("forwards auth errors without touching the database", async () => {
    mockValidateAdmin.mockResolvedValueOnce({
      error: NextResponse.json({ success: false }, { status: 401 }),
    });
    const res = await GET(new NextRequest("https://alchm.kitchen/api/admin/agents/network"));
    expect(res.status).toBe(401);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("bounds DB fan-out concurrency to <= 2 and hydrates dormant role actions only when dormant", async () => {
    allowAdmin();
    let peakConcurrent = 0;
    mockExecuteQuery.mockImplementation(
      makeQueryRouter({
        includeDormantHistory: true,
        delayMs: 10,
        onConcurrent: (count): void => {
          peakConcurrent = Math.max(peakConcurrent, count);
        },
      }),
    );

    const res = await GET(new NextRequest("https://alchm.kitchen/api/admin/agents/network"));
    expect(res.status).toBe(200);
    const body = NetworkBodySchema.parse(await res.json());

    expect(body.success).toBe(true);
    expect(peakConcurrent).toBeLessThanOrEqual(2);
    expect(peakConcurrent).toBeGreaterThan(0);
    expect(body.totals).toEqual({
      total: 10,
      live: 4,
      idle: 2,
      warn: 3,
      draining: 1,
      live_source: true,
    });

    const galileo = body.roleOps.entries.find((e) => e.id === "galileo");
    const lineage = body.roleOps.entries.find((e) => e.id === "lineage");
    expect(galileo?.actions).toEqual([{ action: "insight", count: 75 }]);
    expect(lineage?.actions).toEqual([
      { action: "scrabble_sweep", count: 95 },
      { action: "scrabble_bingo", count: 25 },
    ]);
    expect(body.reasoning.entries[0]?.agentHandle).toBe("Galileo");

    const actionSqlCalls = mockExecuteQuery.mock.calls
      .map(([sql]) => String(sql))
      .filter((sql) => sql.includes("AS action"));
    expect(actionSqlCalls).toHaveLength(2);
    for (const sql of actionSqlCalls) {
      expect(sql).toContain("f.action_label");
      expect(sql).not.toContain("metadata_payload");
    }
  });

  it("skips dormant role query when no role has 0 7d events and nonzero historical total", async () => {
    allowAdmin();
    mockExecuteQuery.mockImplementation(
      makeQueryRouter({ includeDormantHistory: false }),
    );

    const res = await GET(
      new NextRequest("https://alchm.kitchen/api/admin/agents/network?dispatch=5"),
    );
    expect(res.status).toBe(200);

    const dormantCalls = mockExecuteQuery.mock.calls.filter(([sql]) =>
      String(sql).includes("ANY($1::text[])"),
    );
    expect(dormantCalls).toHaveLength(0);
  });
});
