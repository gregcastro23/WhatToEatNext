/**
 * Admin Agent Network Telemetry
 * GET /api/admin/agents/network
 *
 * Live data backing the High Alchemist dashboard Agent Feed Control Room.
 * Replaces the previously-hardcoded "440 agents · 8 roles" fixtures with
 * real DB aggregates over the `users` (is_agent=true) and `feed_events` tables:
 *
 *   - totals: total agents, live (last login < 24h), idle, warn (no events in
 *     7d), draining (deactivated)
 *   - roles: count + 24h dispatch volume per agent role (inferred from
 *     feed_events.event_type prefix when no role column exists yet)
 *   - dispatch: last N feed events from agents (with email + event type)
 *   - leaderboard: top agents by 24h event count
 *
 * The entire payload degrades gracefully: each subsection is wrapped in a
 * safe try/catch so one missing table can't break the dashboard.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { executeQuery } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_DISPATCH_LIMIT = 20;
const DEFAULT_LEADERBOARD_LIMIT = 10;
const MAX_LIMIT = 50;
const CACHE_TTL_MS = 5_000;

export interface AgentRoleSlice {
  id: string;
  label: string;
  agentCount: number;
  events24h: number;
}

export interface AgentDispatchEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentEmail: string;
  agentName: string | null;
  eventType: string;
  role: string;
}

export interface AgentLeaderboardEntry {
  rank: number;
  agentId: string;
  agentEmail: string;
  agentName: string | null;
  events24h: number;
  lastEventAt: string | null;
  dominantElement: string | null;
}

export interface AgentInteractionEntry {
  sessionId: string;
  agentId1: string;
  agentId2: string;
  agentName1: string;
  agentName2: string;
  timestamp: string;
  preview: string;
}

export interface AgentNetworkPayload {
  generatedAt: string;
  totals: {
    total: number;
    live: number;
    idle: number;
    warn: number;
    draining: number;
    live_source: boolean;
  };
  roles: { entries: AgentRoleSlice[]; live: boolean };
  dispatch: { entries: AgentDispatchEntry[]; live: boolean };
  leaderboard: { entries: AgentLeaderboardEntry[]; live: boolean };
  interactions: { entries: AgentInteractionEntry[]; live: boolean };
}

/**
 * Infer a high-level role label from a feed_event event_type. Agent
 * event_types follow `<role>.<action>` (e.g. `pantry.expiry_swept`,
 * `galileo.image_rendered`). When there's no dot, treat the whole string
 * as the role.
 */
function roleFromEventType(eventType: string): string {
  if (!eventType) return "general";
  const dot = eventType.indexOf(".");
  return dot > 0 ? eventType.slice(0, dot) : eventType;
}

async function getTotals(): Promise<AgentNetworkPayload["totals"]> {
  try {
    const result = await executeQuery<{
      total: number;
      live: number;
      idle: number;
      warn: number;
      draining: number;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE u.is_agent = true)::int AS total,
         COUNT(*) FILTER (
           WHERE u.is_agent = true
             AND u.is_active = true
             AND EXISTS (
               SELECT 1 FROM feed_events f
               WHERE f.actor_id = u.id
                 AND f.created_at > NOW() - INTERVAL '24 hours'
             )
         )::int AS live,
         COUNT(*) FILTER (
           WHERE u.is_agent = true
             AND u.is_active = true
             AND NOT EXISTS (
               SELECT 1 FROM feed_events f
               WHERE f.actor_id = u.id
                 AND f.created_at > NOW() - INTERVAL '24 hours'
             )
             AND EXISTS (
               SELECT 1 FROM feed_events f
               WHERE f.actor_id = u.id
                 AND f.created_at > NOW() - INTERVAL '7 days'
             )
         )::int AS idle,
         COUNT(*) FILTER (
           WHERE u.is_agent = true
             AND u.is_active = true
             AND NOT EXISTS (
               SELECT 1 FROM feed_events f
               WHERE f.actor_id = u.id
                 AND f.created_at > NOW() - INTERVAL '7 days'
             )
         )::int AS warn,
         COUNT(*) FILTER (WHERE u.is_agent = true AND u.is_active = false)::int AS draining
       FROM users u`,
    );

    const row = result.rows[0] ?? {
      total: 0,
      live: 0,
      idle: 0,
      warn: 0,
      draining: 0,
    };
    return { ...row, live_source: true };
  } catch (error) {
    console.error("[admin/agents/network] totals query failed:", error);
    return { total: 0, live: 0, idle: 0, warn: 0, draining: 0, live_source: false };
  }
}

async function getRoles(): Promise<AgentNetworkPayload["roles"]> {
  try {
    // Each agent's "role" is approximated by the most-common prefix of its
    // feed_events.event_type, then we summarize per role: distinct agents +
    // 24h event volume. Agents with no events fall into a "dormant" bucket.
    const result = await executeQuery<{
      role: string;
      agent_count: number;
      events_24h: number;
    }>(
      `WITH agent_role AS (
         SELECT u.id AS agent_id,
                COALESCE(
                  (
                    SELECT split_part(f.event_type, '.', 1)
                    FROM feed_events f
                    WHERE f.actor_id = u.id
                    GROUP BY split_part(f.event_type, '.', 1)
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                  ),
                  'dormant'
                ) AS role
         FROM users u
         WHERE u.is_agent = true
       )
       SELECT
         ar.role,
         COUNT(DISTINCT ar.agent_id)::int AS agent_count,
         COALESCE(
           SUM(
             (
               SELECT COUNT(*)
               FROM feed_events f
               WHERE f.actor_id = ar.agent_id
                 AND f.created_at > NOW() - INTERVAL '24 hours'
             )
           ),
           0
         )::int AS events_24h
       FROM agent_role ar
       GROUP BY ar.role
       ORDER BY agent_count DESC, events_24h DESC`,
    );

    const entries: AgentRoleSlice[] = result.rows.map((row) => ({
      id: row.role,
      label: row.role.charAt(0).toUpperCase() + row.role.slice(1),
      agentCount: row.agent_count,
      events24h: row.events_24h,
    }));

    return { entries, live: true };
  } catch (error) {
    console.error("[admin/agents/network] roles query failed:", error);
    return { entries: [], live: false };
  }
}

async function getDispatch(limit: number): Promise<AgentNetworkPayload["dispatch"]> {
  try {
    const result = await executeQuery<{
      id: string;
      actor_id: string;
      event_type: string;
      created_at: Date;
      email: string;
      name: string | null;
    }>(
      `SELECT
         f.id::text AS id,
         f.actor_id::text AS actor_id,
         f.event_type,
         f.created_at,
         u.email,
         COALESCE(up.name, u.name) AS name
       FROM feed_events f
       JOIN users u ON f.actor_id = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.is_agent = true
       ORDER BY f.created_at DESC
       LIMIT $1`,
      [limit],
    );

    const entries: AgentDispatchEntry[] = result.rows.map((row) => ({
      id: row.id,
      timestamp: new Date(row.created_at).toISOString(),
      agentId: row.actor_id,
      agentEmail: row.email,
      agentName: row.name,
      eventType: row.event_type,
      role: roleFromEventType(row.event_type),
    }));

    return { entries, live: true };
  } catch (error) {
    console.error("[admin/agents/network] dispatch query failed:", error);
    return { entries: [], live: false };
  }
}

async function getLeaderboard(
  limit: number,
): Promise<AgentNetworkPayload["leaderboard"]> {
  try {
    const result = await executeQuery<{
      actor_id: string;
      email: string;
      name: string | null;
      events_24h: number;
      last_event_at: Date | null;
      dominant_element: string | null;
    }>(
      `SELECT
         u.id::text AS actor_id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         COUNT(f.id)::int AS events_24h,
         MAX(f.created_at) AS last_event_at,
         COALESCE(up.dominant_element, up.natal_chart->>'dominantElement') AS dominant_element
       FROM users u
       LEFT JOIN feed_events f
         ON f.actor_id = u.id
        AND f.created_at > NOW() - INTERVAL '24 hours'
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.is_agent = true
       GROUP BY u.id, u.email, up.name, u.name, up.dominant_element, up.natal_chart
       ORDER BY events_24h DESC, last_event_at DESC NULLS LAST
       LIMIT $1`,
      [limit],
    );

    const entries: AgentLeaderboardEntry[] = result.rows.map((row, idx) => ({
      rank: idx + 1,
      agentId: row.actor_id,
      agentEmail: row.email,
      agentName: row.name,
      events24h: row.events_24h,
      lastEventAt: row.last_event_at
        ? new Date(row.last_event_at).toISOString()
        : null,
      dominantElement: row.dominant_element,
    }));

    return { entries, live: true };
  } catch (error) {
    console.error("[admin/agents/network] leaderboard query failed:", error);
    return { entries: [], live: false };
  }
}

async function getInteractions(limit = 15): Promise<AgentNetworkPayload["interactions"]> {
  try {
    const result = await executeQuery<{
      sessionId: string;
      agentId1: string;
      agentId2: string;
      createdAt: Date;
      agentName1: string | null;
      agentName2: string | null;
      userMessage: string;
      agentResponse: string;
    }>(
      `SELECT c1."sessionId", c1."agentId" AS "agentId1", c2."agentId" AS "agentId2",
              c1."createdAt" AS "createdAt", h1.name AS "agentName1", h2.name AS "agentName2",
              c1."userMessage" AS "userMessage", c1."agentResponse" AS "agentResponse"
         FROM "AgentConversation" c1
         JOIN "AgentConversation" c2 ON c1."sessionId" = c2."sessionId" AND c1."agentId" != c2."agentId"
         LEFT JOIN historical_agents h1 ON c1."agentId" = h1."agentId"
         LEFT JOIN historical_agents h2 ON c2."agentId" = h2."agentId"
        ORDER BY c1."createdAt" DESC
        LIMIT 30`
    );

    const seen = new Set<string>();
    const entries: AgentInteractionEntry[] = [];
    for (const row of result.rows) {
      if (!seen.has(row.sessionId)) {
        seen.add(row.sessionId);
        entries.push({
          sessionId: row.sessionId,
          agentId1: row.agentId1,
          agentId2: row.agentId2,
          agentName1: row.agentName1 || row.agentId1,
          agentName2: row.agentName2 || row.agentId2,
          timestamp: new Date(row.createdAt).toISOString(),
          preview: row.agentResponse || row.userMessage,
        });
      }
    }
    return { entries: entries.slice(0, limit), live: true };
  } catch (error) {
    console.error("[admin/agents/network] interactions query failed:", error);
    return { entries: [], live: false };
  }
}

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { searchParams } = new URL(request.url);
  const dispatchLimit = Math.min(
    Math.max(parseInt(searchParams.get("dispatch") ?? "0", 10) || DEFAULT_DISPATCH_LIMIT, 1),
    MAX_LIMIT,
  );
  const leaderboardLimit = Math.min(
    Math.max(parseInt(searchParams.get("leaderboard") ?? "0", 10) || DEFAULT_LEADERBOARD_LIMIT, 1),
    MAX_LIMIT,
  );

  // Cache key includes limits so two callers with different ?dispatch=N
  // values don't share each other's payload.
  const cacheKey = `admin:agents/network:${dispatchLimit}:${leaderboardLimit}`;
  const payload = await memoize<AgentNetworkPayload>(
    cacheKey,
    CACHE_TTL_MS,
    async () => {
      // Run all queries in parallel — each degrades independently to a
      // `live: false` empty result on error, so a single failed table can't
      // take out the whole panel.
      const [totals, roles, dispatch, leaderboard, interactions] = await Promise.all([
        getTotals(),
        getRoles(),
        getDispatch(dispatchLimit),
        getLeaderboard(leaderboardLimit),
        getInteractions(15),
      ]);
      return {
        generatedAt: new Date().toISOString(),
        totals,
        roles,
        dispatch,
        leaderboard,
        interactions,
      };
    },
  );

  return NextResponse.json({ success: true, ...payload });
}
