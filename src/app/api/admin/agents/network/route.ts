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
import {
  getCosmicModifiers,
  type CosmicModifier,
} from "@/services/skyConditionsService";

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
  /**
   * Local WTEN users.id for the target agent, if we could resolve it from the
   * PA metadata. `null` when the chat partner is a human user or when the
   * `targetAgentId`/`withAgent` field doesn't map to a known agent in WTEN.
   * Used by the dashboard to deep-link the target badge into /profile/[userId].
   */
  targetUserId: string | null;
  agentName1: string;
  agentName2: string;
  timestamp: string;
  preview: string;
}

export interface AgentRoleOpsAction {
  /** event_type suffix, e.g. `expiry_swept` from `pantry.expiry_swept`. */
  action: string;
  /** occurrences of this action in the trailing 7d window. */
  count: number;
}

export interface AgentRoleOpsEntry {
  id: string;
  label: string;
  /** Honest one-line description of what this role exists to do. */
  mandate: string;
  /** distinct agents whose events carry this role prefix, last 7d. */
  agentCount: number;
  events24h: number;
  events7d: number;
  lastActivityAt: string | null;
  /** top event-type suffixes for this role, busiest first. */
  actions: AgentRoleOpsAction[];
}

export interface AgentReasoningEntry {
  agentId: string;
  agentHandle: string;
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
  /**
   * Per-role operational telemetry for the canonical agent roles, rebuilt
   * over real `feed_events` aggregates (no fixtures). Degrades independently
   * to an empty `live: false` block when the source query fails.
   */
  roleOps: { entries: AgentRoleOpsEntry[]; live: boolean };
  /**
   * Closest-available reasoning signal: each agent's latest decision preview
   * from `agent_chat` metadata. `instrumented: false` records the honest truth
   * that step-level chain-of-thought traces are not captured yet — the panel
   * surfaces these previews as a proxy, not as full reasoning traces.
   */
  reasoning: { entries: AgentReasoningEntry[]; live: boolean; instrumented: boolean };
  /**
   * Active astrological aspects, framed as signed influences on agent
   * interaction velocity. Derived from the live ephemeris via
   * `getCosmicModifiers()`. Degrades to an empty `live: false` block when
   * the ephemeris is unavailable.
   */
  modifiers: {
    entries: CosmicModifier[];
    /** sum of all modifier impacts in roughly [-1, 1] */
    netVelocity: number;
    live: boolean;
  };
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

async function getInteractions(
  limit = 15,
  filters: { withAgent?: string | null; topic?: string | null } = {},
): Promise<AgentNetworkPayload["interactions"]> {
  try {
    const withAgent = (filters.withAgent ?? "").trim().toLowerCase() || null;
    const topic = (filters.topic ?? "").trim().toLowerCase() || null;

    // Pull the freshest agent_chat events and try to map the chat partner to a
    // local WTEN users.id. Resolution path (in priority order):
    //   1. `targetAgentId` matches a WTEN users.id directly (cross-system UUID)
    //   2. `targetAgentId` or `withAgent` is a slug we can append the
    //      `@agentic.alchm.kitchen` suffix to and look up by email
    // Both joins are LEFT — when neither matches we still surface the row, just
    // without a target badge link.
    const result = await executeQuery<{
      id: string;
      createdAt: Date;
      metadata_payload: any;
      actor_id: string;
      actor_name: string | null;
      target_user_id: string | null;
      target_resolved_name: string | null;
    }>(
      `SELECT f.id::text AS id,
              f.created_at AS "createdAt",
              f.metadata_payload,
              u.id::text AS actor_id,
              COALESCE(up.name, u.name) AS actor_name,
              COALESCE(target_uuid.id, target_email.id)::text AS target_user_id,
              COALESCE(
                target_uuid_up.name, target_uuid.name,
                target_email_up.name, target_email.name
              ) AS target_resolved_name
         FROM feed_events f
         JOIN users u ON f.actor_id = u.id
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN users target_uuid
           ON target_uuid.is_agent = true
          AND target_uuid.id::text = f.metadata_payload->>'targetAgentId'
         LEFT JOIN user_profiles target_uuid_up
           ON target_uuid_up.user_id = target_uuid.id
         LEFT JOIN users target_email
           ON target_email.is_agent = true
          AND target_uuid.id IS NULL
          AND target_email.email = LOWER(
                COALESCE(
                  NULLIF(f.metadata_payload->>'targetAgentId', ''),
                  NULLIF(f.metadata_payload->>'withAgent', '')
                )
              ) || '@agentic.alchm.kitchen'
         LEFT JOIN user_profiles target_email_up
           ON target_email_up.user_id = target_email.id
        WHERE u.is_agent = true
          AND f.event_type = 'agent_chat'
          AND (
            $2::text IS NULL
            OR LOWER(COALESCE(up.name, u.name, '')) LIKE '%' || $2 || '%'
            OR LOWER(u.email) LIKE '%' || $2 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'targetName', '')) LIKE '%' || $2 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'withAgent', '')) LIKE '%' || $2 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'partnerName', '')) LIKE '%' || $2 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'targetAgentId', '')) LIKE '%' || $2 || '%'
          )
          AND (
            $3::text IS NULL
            OR LOWER(COALESCE(f.metadata_payload->>'responsePreview', '')) LIKE '%' || $3 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'messagePreview', '')) LIKE '%' || $3 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'message', '')) LIKE '%' || $3 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'topic', '')) LIKE '%' || $3 || '%'
            OR LOWER(COALESCE(f.metadata_payload->>'subject', '')) LIKE '%' || $3 || '%'
          )
        ORDER BY f.created_at DESC
        LIMIT $1`,
      [limit, withAgent, topic],
    );

    const entries: AgentInteractionEntry[] = result.rows.map((row) => {
      const meta = (row.metadata_payload as Record<string, any>) || {};
      const targetName =
        row.target_resolved_name ||
        meta.targetName ||
        meta.withAgent ||
        meta.partnerName ||
        "User";
      return {
        sessionId: meta.sessionId || row.id,
        agentId1: row.actor_id,
        agentId2: meta.targetAgentId || "user",
        targetUserId: row.target_user_id,
        agentName1: row.actor_name || "Agent",
        agentName2: targetName,
        timestamp: new Date(row.createdAt).toISOString(),
        preview: meta.responsePreview || meta.messagePreview || "Discourse started",
      };
    });

    return { entries, live: true };
  } catch (error) {
    console.error("[admin/agents/network] interactions query failed:", error);
    return { entries: [], live: false };
  }
}

/**
 * Canonical agent roles surfaced as dedicated operational panels. Roles are
 * inferred from the `<role>.<action>` event_type prefix (there is no role
 * column yet), so a role with no matching events legitimately renders an
 * honest empty state rather than fabricated activity. The `mandate` is a
 * description of intent, not telemetry.
 */
const ROLE_OPS_DEFS: ReadonlyArray<{ id: string; label: string; mandate: string }> = [
  { id: "sous-chef", label: "Sous-Chef", mandate: "prep & mise-en-place" },
  { id: "galileo", label: "Galileo", mandate: "vision & image rendering" },
  { id: "substitution", label: "Substitution", mandate: "ingredient swaps" },
  { id: "pantry", label: "Pantry", mandate: "inventory & expiry sweeps" },
  { id: "procurement", label: "Procurement", mandate: "sourcing & supply" },
  { id: "lineage", label: "Lineage", mandate: "recipe provenance" },
];

const ROLE_OPS_ACTIONS_CAP = 6;
const REASONING_LIMIT = 8;

async function getRoleOps(): Promise<AgentNetworkPayload["roleOps"]> {
  try {
    const roleIds = ROLE_OPS_DEFS.map((r) => r.id);
    // GROUPING SETS gives us, per role, one role-level rollup row (action IS
    // NULL — correct DISTINCT agent count + 24h/7d totals + last activity) plus
    // one row per action for the breakdown — all in a single 7d scan.
    const result = await executeQuery<{
      role: string;
      action: string | null;
      agent_count: number;
      events_24h: number;
      events_7d: number;
      last_activity: Date | null;
    }>(
      `WITH agent_events AS (
         SELECT f.actor_id,
                f.created_at,
                split_part(f.event_type, '.', 1) AS role,
                COALESCE(NULLIF(split_part(f.event_type, '.', 2), ''), '(unlabeled)') AS action
         FROM feed_events f
         JOIN users u ON u.id = f.actor_id AND u.is_agent = true
         WHERE f.created_at > NOW() - INTERVAL '7 days'
           AND split_part(f.event_type, '.', 1) = ANY($1::text[])
       )
       SELECT
         role,
         action,
         COUNT(DISTINCT actor_id)::int AS agent_count,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS events_24h,
         COUNT(*)::int AS events_7d,
         MAX(created_at) AS last_activity
       FROM agent_events
       GROUP BY GROUPING SETS ((role), (role, action))
       ORDER BY role`,
      [roleIds],
    );

    interface Bucket {
      agentCount: number;
      events24h: number;
      events7d: number;
      lastActivityAt: string | null;
      actions: AgentRoleOpsAction[];
    }
    const byRole = new Map<string, Bucket>();
    for (const def of ROLE_OPS_DEFS) {
      byRole.set(def.id, {
        agentCount: 0,
        events24h: 0,
        events7d: 0,
        lastActivityAt: null,
        actions: [],
      });
    }
    for (const row of result.rows) {
      const bucket = byRole.get(row.role);
      if (!bucket) continue;
      if (row.action === null) {
        bucket.agentCount = row.agent_count;
        bucket.events24h = row.events_24h;
        bucket.events7d = row.events_7d;
        bucket.lastActivityAt = row.last_activity
          ? new Date(row.last_activity).toISOString()
          : null;
      } else {
        bucket.actions.push({ action: row.action, count: row.events_7d });
      }
    }

    const entries: AgentRoleOpsEntry[] = ROLE_OPS_DEFS.map((def) => {
      const b = byRole.get(def.id) as Bucket;
      return {
        id: def.id,
        label: def.label,
        mandate: def.mandate,
        agentCount: b.agentCount,
        events24h: b.events24h,
        events7d: b.events7d,
        lastActivityAt: b.lastActivityAt,
        actions: b.actions
          .sort((a, c) => c.count - a.count)
          .slice(0, ROLE_OPS_ACTIONS_CAP),
      };
    });

    return { entries, live: true };
  } catch (error) {
    console.error("[admin/agents/network] roleOps query failed:", error);
    // Still hand back the canonical role shells so the panels render an honest
    // "telemetry offline" state instead of disappearing.
    const entries: AgentRoleOpsEntry[] = ROLE_OPS_DEFS.map((def) => ({
      id: def.id,
      label: def.label,
      mandate: def.mandate,
      agentCount: 0,
      events24h: 0,
      events7d: 0,
      lastActivityAt: null,
      actions: [],
    }));
    return { entries, live: false };
  }
}

async function getReasoning(
  limit = REASONING_LIMIT,
): Promise<AgentNetworkPayload["reasoning"]> {
  try {
    // The latest decision preview per distinct agent. There is no reasoning /
    // trace store yet, so this `agent_chat` preview is the closest real signal
    // we can honestly surface; `instrumented` stays false to say so.
    const result = await executeQuery<{
      agent_id: string;
      handle: string | null;
      created_at: Date;
      preview: string;
    }>(
      `SELECT t.agent_id, t.handle, t.created_at, t.preview
         FROM (
           SELECT DISTINCT ON (f.actor_id)
             f.actor_id::text AS agent_id,
             COALESCE(up.name, u.name, split_part(u.email, '@', 1)) AS handle,
             f.created_at,
             COALESCE(
               f.metadata_payload->>'responsePreview',
               f.metadata_payload->>'messagePreview',
               f.metadata_payload->>'message'
             ) AS preview
           FROM feed_events f
           JOIN users u ON u.id = f.actor_id AND u.is_agent = true
           LEFT JOIN user_profiles up ON up.user_id = u.id
           WHERE f.event_type = 'agent_chat'
             AND COALESCE(
               f.metadata_payload->>'responsePreview',
               f.metadata_payload->>'messagePreview',
               f.metadata_payload->>'message'
             ) IS NOT NULL
           ORDER BY f.actor_id, f.created_at DESC
         ) t
        ORDER BY t.created_at DESC
        LIMIT $1`,
      [limit],
    );

    const entries: AgentReasoningEntry[] = result.rows.map((row) => ({
      agentId: row.agent_id,
      agentHandle: row.handle || "agent",
      timestamp: new Date(row.created_at).toISOString(),
      preview: row.preview,
    }));

    return { entries, live: true, instrumented: false };
  } catch (error) {
    console.error("[admin/agents/network] reasoning query failed:", error);
    return { entries: [], live: false, instrumented: false };
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
  // Trim+lower so cache keys are stable regardless of input casing/padding.
  // Empty strings collapse to null so the route still hits the full-history
  // cache slot when the operator clears the search bar.
  const withFilter = (searchParams.get("with") ?? "").trim().toLowerCase() || null;
  const topicFilter = (searchParams.get("topic") ?? "").trim().toLowerCase() || null;

  // Cache key includes limits + filters so two callers with different
  // ?dispatch=N / ?with= / ?topic= values don't share each other's payload.
  const cacheKey = [
    "admin:agents/network",
    dispatchLimit,
    leaderboardLimit,
    withFilter ?? "_",
    topicFilter ?? "_",
  ].join(":");
  const payload = await memoize<AgentNetworkPayload>(
    cacheKey,
    CACHE_TTL_MS,
    async () => {
      // Run all sub-queries in parallel — each degrades independently to a
      // `live: false` empty result on error, so a single failed table or a
      // missing ephemeris source can't take out the whole panel.
      const modifierTask = getCosmicModifiers()
        .then((r) => ({
          entries: r.modifiers,
          netVelocity: r.netVelocity,
          live: r.live,
        }))
        .catch((error) => {
          console.error(
            "[admin/agents/network] cosmic modifiers failed:",
            error,
          );
          return { entries: [], netVelocity: 0, live: false };
        });

      const [
        totals,
        roles,
        dispatch,
        leaderboard,
        interactions,
        roleOps,
        reasoning,
        modifiers,
      ] = await Promise.all([
        getTotals(),
        getRoles(),
        getDispatch(dispatchLimit),
        getLeaderboard(leaderboardLimit),
        getInteractions(15, { withAgent: withFilter, topic: topicFilter }),
        getRoleOps(),
        getReasoning(),
        modifierTask,
      ]);
      return {
        generatedAt: new Date().toISOString(),
        totals,
        roles,
        dispatch,
        leaderboard,
        interactions,
        roleOps,
        reasoning,
        modifiers,
      };
    },
  );

  return NextResponse.json({ success: true, ...payload });
}
