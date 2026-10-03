/**
 * Client-side validators for the High Alchemist dashboard's agent panels:
 * GET /api/admin/agents/network, GET /api/admin/agents/monica and
 * POST /api/admin/agent-sync. Server payload types are imported type-only.
 *
 * @file src/lib/admin/schemas/agents.ts
 */

import { z } from "zod";
import type { MonicaTelemetryPayload } from "@/app/api/admin/agents/monica/route";
import type { AgentNetworkPayload } from "@/app/api/admin/agents/network/route";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { AgentSyncBatchResponse } from "@/types/adminAgentSync";

// ─── Agent network — GET /api/admin/agents/network ────────────────────────

const agentName = z.string().nullable();

export const AgentNetworkSchema = z.object({
  generatedAt: z.string(),
  totals: z.object({
    total: z.number(),
    live: z.number(),
    idle: z.number(),
    warn: z.number(),
    draining: z.number(),
    live_source: z.boolean(),
  }),
  roles: z.object({
    entries: z.array(
      z.object({ id: z.string(), label: z.string(), agentCount: z.number(), events24h: z.number() }),
    ),
    live: z.boolean(),
  }),
  dispatch: z.object({
    entries: z.array(
      z.object({
        id: z.string(),
        timestamp: z.string(),
        agentId: z.string(),
        agentEmail: z.string(),
        agentName,
        eventType: z.string(),
        role: z.string(),
      }),
    ),
    live: z.boolean(),
  }),
  leaderboard: z.object({
    entries: z.array(
      z.object({
        rank: z.number(),
        agentId: z.string(),
        agentEmail: z.string(),
        agentName,
        events24h: z.number(),
        lastEventAt: z.string().nullable(),
        dominantElement: z.string().nullable(),
      }),
    ),
    live: z.boolean(),
  }),
  interactions: z.object({
    entries: z.array(
      z.object({
        sessionId: z.string(),
        agentId1: z.string(),
        agentId2: z.string(),
        targetUserId: z.string().nullable(),
        agentName1: z.string(),
        agentName2: z.string(),
        timestamp: z.string(),
        preview: z.string(),
      }),
    ),
    live: z.boolean(),
  }),
  roleOps: z.object({
    entries: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        mandate: z.string(),
        agentCount: z.number(),
        events24h: z.number(),
        events7d: z.number(),
        lastActivityAt: z.string().nullable(),
        actions: z.array(z.object({ action: z.string(), count: z.number() })),
      }),
    ),
    live: z.boolean(),
  }),
  reasoning: z.object({
    entries: z.array(
      z.object({
        agentId: z.string(),
        agentHandle: z.string(),
        timestamp: z.string(),
        preview: z.string(),
      }),
    ),
    live: z.boolean(),
    instrumented: z.boolean(),
  }),
  modifiers: z.object({
    entries: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        bodyA: z.string(),
        symbolA: z.string(),
        bodyB: z.string(),
        symbolB: z.string(),
        aspectGlyph: z.string(),
        aspectName: z.string(),
        orbDegrees: z.number(),
        orbLabel: z.string(),
        applying: z.boolean(),
        kind: z.enum(["amplify", "harmonize", "flow", "friction", "tension"]),
        velocityImpact: z.number(),
        description: z.string(),
      }),
    ),
    netVelocity: z.number(),
    live: z.boolean(),
  }),
});

export type AgentNetworkView = z.infer<typeof AgentNetworkSchema>;

type _AgentNetworkDrift = AssertTrue<ServerSatisfies<AgentNetworkPayload, AgentNetworkView>>;
type _AgentNetworkExact = AssertTrue<ServerSatisfies<AgentNetworkView, AgentNetworkPayload>>;

/** The route spreads the payload next to `success: true`. */
export const AgentNetworkResponseSchema = AgentNetworkSchema.extend({ success: z.literal(true) });

// ─── Monica telemetry — GET /api/admin/agents/monica ──────────────────────

export const MonicaTelemetrySchema = z.object({
  window: z.enum(["1h", "24h", "7d"]),
  generatedAt: z.string(),
  helpfulnessScore: z.number().nullable(),
  helpfulnessSampleSize: z.number(),
  avgCompletionMs: z.number().nullable(),
  totalInteractions: z.number(),
  contextualHelpRequests: z.number(),
  topPages: z.array(z.object({ path: z.string(), count: z.number() })),
  live: z.boolean(),
  source: z.string(),
  error: z.string().exactOptional(),
});

export type MonicaTelemetryView = z.infer<typeof MonicaTelemetrySchema>;

type _MonicaDrift = AssertTrue<ServerSatisfies<MonicaTelemetryPayload, MonicaTelemetryView>>;
type _MonicaExact = AssertTrue<ServerSatisfies<MonicaTelemetryView, MonicaTelemetryPayload>>;

export const MonicaTelemetryResponseSchema = MonicaTelemetrySchema.extend({ success: z.literal(true) });

// ─── Agent sync — POST /api/admin/agent-sync ──────────────────────────────

export const AgentSyncBatchResponseSchema = z.object({
  success: z.literal(true),
  synced: z.number(),
  failed: z.number(),
  results: z.array(
    z.object({
      agentId: z.string(),
      email: z.string(),
      ok: z.boolean(),
      status: z.number().exactOptional(),
      error: z.string().exactOptional(),
    }),
  ),
  note: z.string().exactOptional(),
});

export type AgentSyncBatchView = z.infer<typeof AgentSyncBatchResponseSchema>;

type _AgentSyncDrift = AssertTrue<ServerSatisfies<AgentSyncBatchResponse, AgentSyncBatchView>>;

/** Any failure body: `{ success: false, error }`. */
export const AgentSyncFailureSchema = z.object({ error: z.string().optional() });
