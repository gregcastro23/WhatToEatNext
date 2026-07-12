/**
 * Public User Profile API
 * GET /api/users/:userId — returns the public-safe slice of a user/agent
 * profile, including bio, natal chart highlights, dominant element, the
 * most recent feed activity, and (PR 4) the social block: follower /
 * following / commensal counts, table counts (null when the PR 2 tables
 * schema is absent — clients hide those tiles), and the viewer's
 * relationship to the profile owner. Used by the /profile/[userId] page so
 * anyone can inspect an agent or human's alchemical identity without auth.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  agentSlugFromEmail,
  fetchAgentProfile,
  fetchAgentInteractions,
  fetchAgentActions,
  fetchAgentArtifacts,
} from "@/lib/agents/fetchAgentProfile";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { followDatabase } from "@/services/followDatabaseService";
import { computeTasteGraph } from "@/services/userInteractionsService";
import type { ProfileSocialBlock } from "@/types/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ProfileRow {
  user_id: string;
  email: string;
  is_agent: boolean;
  name: string | null;
  bio: string | null;
  natal_chart: any;
  natal_positions: any;
  dominant_element: string | null;
  birth_data: any;
  dietary_preferences: any;
  profile_layout: any;
  avatar_url: string | null;
  share_identity: boolean | null;
  created_at: string;
}

interface FeedRow {
  id: string;
  event_type: string;
  metadata_payload: any;
  created_at: string;
}

interface BalanceRow {
  spirit: string;
  essence: string;
  matter: string;
  substance: string;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

/** COUNT of accepted commensalships (the mutual inner circle). */
async function commensalCount(userId: string): Promise<number> {
  const res = await executeQuery<{ n: string }>(
    `SELECT COUNT(*)::int AS n FROM commensalships
      WHERE status = 'accepted'
        AND (requester_id = $1::uuid OR addressee_id = $1::uuid)`,
    [userId],
  );
  return Number(res.rows[0]?.n ?? 0);
}

/**
 * Table stat tiles, guarded by to_regclass so this route works before the
 * PR 2 tables schema exists: null → the client hides the tiles entirely.
 */
async function tableCounts(
  userId: string,
): Promise<{ hosted: number; joined: number } | null> {
  const reg = await executeQuery<{ present: boolean }>(
    `SELECT to_regclass('public.tables') IS NOT NULL AS present`,
  );
  if (reg.rows[0]?.present !== true) return null;
  const res = await executeQuery<{ hosted: string; joined: string }>(
    `SELECT
       (SELECT COUNT(*) FROM tables t
         WHERE t.host_id = $1::uuid AND t.status <> 'cancelled') AS hosted,
       (SELECT COUNT(*) FROM table_members tm
          JOIN tables t ON t.id = tm.table_id
         WHERE tm.user_id = $1::uuid AND tm.rsvp_status = 'joined'
           AND t.host_id <> $1::uuid AND t.status <> 'cancelled') AS joined`,
    [userId],
  );
  return {
    hosted: Number(res.rows[0]?.hosted ?? 0),
    joined: Number(res.rows[0]?.joined ?? 0),
  };
}

/**
 * The viewer's relationship to the profile owner. Null when there is no
 * authenticated viewer, the viewer IS the owner, or the pair is blocked —
 * clients hide the follow button whenever this is null.
 */
async function viewerState(
  viewerId: string | null,
  ownerId: string,
): Promise<ProfileSocialBlock["viewer"]> {
  if (!viewerId || viewerId === ownerId) return null;
  const blocked = await executeQuery(
    `SELECT 1 FROM commensalships
      WHERE status = 'blocked'
        AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
          OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
      LIMIT 1`,
    [viewerId, ownerId],
  );
  if (blocked.rows.length > 0) return null;
  const [followState, commensal] = await Promise.all([
    followDatabase.getFollowState(viewerId, ownerId),
    executeQuery(
      `SELECT 1 FROM commensalships
        WHERE status = 'accepted'
          AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
            OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
        LIMIT 1`,
      [viewerId, ownerId],
    ),
  ]);
  return {
    follows: followState.follows,
    followedBy: followState.followedBy,
    isCommensal: commensal.rows.length > 0,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { success: false, message: "userId required" },
      { status: 400 },
    );
  }

  // Allow lookup either by uuid or by exact email — agents often live under
  // a stable email so callers can deep link with the friendlier slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const lookupColumn = isUuid ? "u.id::text = $1" : "u.email = $1";

  try {
    const profileResult = await executeQuery<ProfileRow>(
      `SELECT u.id AS user_id, u.email, COALESCE(u.is_agent, false) AS is_agent,
              up.name, up.bio, up.natal_chart, up.natal_positions,
              up.dominant_element, up.birth_data, up.dietary_preferences, up.profile_layout,
              COALESCE(up.avatar_url, u.image) AS avatar_url,
              up.share_identity,
              u.created_at
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ${lookupColumn}
        LIMIT 1`,
      [userId],
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 },
      );
    }

    const row = profileResult.rows[0];
    const realUserId = row.user_id;

    // Optional viewer — never required (public route); failures count as anon.
    let viewerId: string | null = null;
    try {
      viewerId = await getUserIdFromRequest(req);
    } catch {
      viewerId = null;
    }

    // Per-source isolation: a single missing table (e.g. migration 32 not
    // applied) or a malformed row should not blank the whole profile. Each
    // sub-query degrades to a safe empty value, so the page renders even
    // when one slice is broken.
    const [
      feedSettled,
      balanceSettled,
      tasteGraphSettled,
      followCountsSettled,
      commensalsSettled,
      tablesSettled,
      viewerSettled,
    ] = await Promise.allSettled([
      executeQuery<FeedRow>(
        `SELECT id, event_type, metadata_payload, created_at
           FROM feed_events
          WHERE actor_id = $1
          ORDER BY created_at DESC
          LIMIT 12`,
        [realUserId],
      ),
      executeQuery<BalanceRow>(
        `SELECT spirit::text, essence::text, matter::text, substance::text
           FROM token_balances
          WHERE user_id = $1
          LIMIT 1`,
        [realUserId],
      ),
      computeTasteGraph(realUserId),
      followDatabase.getFollowCounts(realUserId),
      commensalCount(realUserId),
      tableCounts(realUserId),
      viewerState(viewerId, realUserId),
    ] as const);

    if (feedSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] feed_events query failed:", feedSettled.reason);
    }
    if (balanceSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] token_balances query failed:", balanceSettled.reason);
    }
    if (tasteGraphSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] computeTasteGraph failed:", tasteGraphSettled.reason);
    }
    if (followCountsSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] follow counts failed:", followCountsSettled.reason);
    }
    if (commensalsSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] commensal count failed:", commensalsSettled.reason);
    }
    if (tablesSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] table counts failed:", tablesSettled.reason);
    }
    if (viewerSettled.status === "rejected") {
      console.warn("[GET /api/users/:userId] viewer state failed:", viewerSettled.reason);
    }

    const feedResult = feedSettled.status === "fulfilled"
      ? feedSettled.value
      : { rows: [] as FeedRow[] };
    const balanceResult = balanceSettled.status === "fulfilled"
      ? balanceSettled.value
      : { rows: [] as BalanceRow[] };
    const tasteGraph = tasteGraphSettled.status === "fulfilled"
      ? tasteGraphSettled.value
      : null;
    const followCounts = followCountsSettled.status === "fulfilled"
      ? followCountsSettled.value
      : { followers: 0, following: 0 };
    const commensals = commensalsSettled.status === "fulfilled"
      ? commensalsSettled.value
      : 0;
    const tables = tablesSettled.status === "fulfilled" ? tablesSettled.value : null;
    const viewer = viewerSettled.status === "fulfilled" ? viewerSettled.value : null;

    const social: ProfileSocialBlock = {
      followers: followCounts.followers,
      following: followCounts.following,
      commensals,
      tablesHosted: tables?.hosted ?? null,
      tablesJoined: tables?.joined ?? null,
      viewer,
    };

    const balance = balanceResult.rows[0] ?? {
      spirit: "0",
      essence: "0",
      matter: "0",
      substance: "0",
    };

    const natalChart = parseJsonField<Record<string, unknown>>(row.natal_chart, {});
    const natalPositions = parseJsonField<unknown[]>(row.natal_positions, []);
    const birthData = parseJsonField<Record<string, unknown>>(row.birth_data, {});
    const dietaryPreferences = parseJsonField<Record<string, unknown>>(row.dietary_preferences, {});
    const profileLayout = parseJsonField<unknown[]>(row.profile_layout, ["natalChart", "alchemicalConstitution", "tasteGraph", "dietaryPrefs", "insightsTicker", "tokenEconomy", "recentActivity"]);

    // For agent users, pull the rich CraftedAgent profile, interactions,
    // actions, and artifacts from planetary_agents-main in parallel.
    const slug = row.is_agent ? agentSlugFromEmail(row.email) : null;
    
    let agentProfile: any = null;
    let agentInteractions: any[] = [];
    let agentActions: any[] = [];
    let agentArtifacts: any[] = [];

    if (slug) {
      const [profileRes, interactionsRes, actionsRes, artifactsRes] = await Promise.allSettled([
        fetchAgentProfile(slug),
        fetchAgentInteractions(slug),
        fetchAgentActions(slug),
        fetchAgentArtifacts(slug),
      ]);

      if (profileRes.status === "fulfilled") agentProfile = profileRes.value;
      if (interactionsRes.status === "fulfilled") agentInteractions = interactionsRes.value || [];
      if (actionsRes.status === "fulfilled") agentActions = actionsRes.value || [];
      if (artifactsRes.status === "fulfilled") agentArtifacts = artifactsRes.value || [];
    }

    return NextResponse.json({
      success: true,
      profile: {
        userId: realUserId,
        // Never leak full email for human users — only show the agentic slug.
        handle: row.is_agent ? row.email : null,
        name: row.name || (row.is_agent ? row.email.split("@")[0] : "Alchemist"),
        isAgent: row.is_agent,
        // COALESCE(user_profiles.avatar_url, users.image) — client falls back
        // to the element sigil (AvatarCircle) when null.
        avatarUrl: row.avatar_url || null,
        social,
        // Owner-only: the identity default toggle state. Never sent to
        // other viewers.
        shareIdentity:
          viewerId === realUserId ? row.share_identity !== false : undefined,
        agentSlug: slug,
        agentProfile,
        agentInteractions,
        agentActions,
        agentArtifacts,
        bio: row.bio,
        dominantElement: row.dominant_element,
        natalChart,
        natalPositions,
        birthData,
        dietary_preferences: dietaryPreferences,
        profile_layout: profileLayout,
        tasteGraph,
        createdAt: row.created_at,
        balances: {
          spirit: parseFloat(balance.spirit) || 0,
          essence: parseFloat(balance.essence) || 0,
          matter: parseFloat(balance.matter) || 0,
          substance: parseFloat(balance.substance) || 0,
        },
        recentActivity: feedResult.rows.map((event) => ({
          id: event.id,
          eventType: event.event_type,
          metadataPayload: event.metadata_payload,
          createdAt: event.created_at,
        })),
      },
    });
  } catch (error) {
    // Surface the actual failure cause in logs — the previous bare
    // console.error truncated `error` to "[GET /api/users/:userId] er..."
    // in Vercel, hiding the underlying message + stack.
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(
      `[GET /api/users/:userId] userId=${userId} message=${message}`,
      stack ?? error,
    );
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 },
    );
  }
}
