/**
 * Database query & fuel-readiness helpers for historical agent engagement.
 *
 * Keeps agent eligibility queries, candidate feed post lookups, review
 * deduplication maps, and daily-yield top-ups modular and concise.
 *
 * @file src/services/historicalAgentEngagementQueries.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  deriveAgentDietaryProfile,
  type DietaryProfile,
} from "@/lib/recipes/historicalAgentPersona";
import { planetPositionsFromNatal } from "@/services/agentDailyYield";
import { dailyYieldService } from "@/services/DailyYieldService";

export const MIN_REFLECTION_ESMS = 0.4;

export interface HistoricalAgentEngagementResult {
  agentsEligible: number;
  yieldsClaimed: number;
  recipesReviewed: number;
  reflectionsSaved: number;
  feedCommentsPosted: number;
  feedInsightsPosted: number;
  errors: number;
}

export interface HistoricalEngagementAgentRow {
  id: string;
  email: string;
  name: string | null;
  dominant_element: string | null;
  dietary_preferences: Record<string, unknown> | null;
  natal_positions: unknown;
  total_balance: number;
  last_reviewed_at: string | Date | null;
  last_posted_at: string | Date | null;
}

export interface PreparedAgent {
  row: HistoricalEngagementAgentRow;
  slug: string;
  displayName: string;
  profile: DietaryProfile;
  balance: number;
}

export interface CandidateFeedPostRow {
  id: string;
  actor_id: string;
  event_type: string;
  metadata_payload: unknown;
  actor_name: string | null;
  actor_is_agent: boolean;
}

interface ExistingReflectionPairRow {
  author_id: string;
  recipe_id: string;
}

interface CommentAuthorRow {
  event_id: string;
  author_id: string;
}

const SQL_LOAD_HISTORICAL_AGENTS = `
  SELECT u.id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         up.dominant_element,
         up.dietary_preferences,
         up.natal_positions,
         (COALESCE(tb.spirit, 0) + COALESCE(tb.essence, 0)
           + COALESCE(tb.matter, 0) + COALESCE(tb.substance, 0))::float8 AS total_balance,
         last_rev.last_reviewed_at,
         last_evt.last_posted_at
    FROM users u
    JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN token_balances tb ON tb.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT MAX(rr.created_at) AS last_reviewed_at
        FROM recipe_reflections rr
       WHERE rr.author_id = u.id
    ) last_rev ON true
    LEFT JOIN LATERAL (
      SELECT MAX(fe.created_at) AS last_posted_at
        FROM feed_events fe
       WHERE fe.actor_id = u.id
    ) last_evt ON true
   WHERE COALESCE(u.is_agent, false) = true
     AND COALESCE(u.is_active, true) = true
     AND COALESCE(u.email, '') LIKE '%@agentic.alchm.kitchen'
     AND COALESCE(u.email, '') <> 'greg-castro-1991@agentic.alchm.kitchen'
     AND COALESCE(up.name, u.name, '') !~ '^(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Moon Phase) '
     AND up.natal_positions IS NOT NULL
     AND up.natal_positions::text NOT IN ('[]', 'null', '{}')
   ORDER BY last_rev.last_reviewed_at ASC NULLS FIRST, u.email ASC
   LIMIT 100
`;

const SQL_LOAD_CANDIDATE_POSTS = `
  SELECT f.id, f.actor_id, f.event_type, f.metadata_payload,
         COALESCE(up.name, u.name, split_part(u.email, '@', 1)) AS actor_name,
         COALESCE(u.is_agent, false) AS actor_is_agent
    FROM feed_events f
    JOIN users u ON u.id = f.actor_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
   WHERE f.created_at > NOW() - INTERVAL '7 days'
     AND f.event_type IN ('made_it', 'recipe_generation', 'recipe_review', 'recipe_adapted', 'lab_entry', 'preferences_share', 'insight')
     AND (
       SELECT COUNT(*)::int FROM feed_comments fc
        WHERE fc.event_id = f.id AND fc.deleted_at IS NULL AND NOT fc.hidden
     ) < 3
   ORDER BY COALESCE(u.is_agent, false) ASC,
            (f.event_type = 'recipe_review') DESC,
            f.created_at DESC
   LIMIT 12
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toTimestampMs(val: string | Date | null | undefined): number {
  if (!val) return 0;
  const ms = new Date(val).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function parseMeta(raw: unknown): Record<string, unknown> {
  if (isRecord(raw)) return raw;
  if (typeof raw !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function parseNatalPreview(raw: unknown): Array<{ planet: string; sign: string }> {
  const positions = planetPositionsFromNatal(raw);
  return Object.entries(positions)
    .slice(0, 6)
    .map(([planet, val]) => ({
      planet,
      sign: typeof val === "string" ? val : val.sign,
    }));
}

function toPreparedAgent(row: HistoricalEngagementAgentRow): PreparedAgent | null {
  const [slug = ""] = row.email.split("@");
  const cleanSlug = slug.toLowerCase().trim();
  if (!cleanSlug) return null;
  const displayName = (row.name ?? "").trim() || cleanSlug;
  return {
    row,
    slug: cleanSlug,
    displayName,
    profile: deriveAgentDietaryProfile(cleanSlug, row.dietary_preferences),
    balance: Number(row.total_balance) || 0,
  };
}

/** Load eligible chart-bearing historical thinkers ordered by oldest review activity. */
export async function loadHistoricalAgents(): Promise<PreparedAgent[]> {
  const res = await executeQuery<HistoricalEngagementAgentRow>(SQL_LOAD_HISTORICAL_AGENTS);
  return res.rows
    .map((row): PreparedAgent | null => toPreparedAgent(row))
    .filter((entry): entry is PreparedAgent => entry !== null);
}

/** Claim daily ESMS yield if an agent's balance sits below the reflection debit cost. */
export async function ensureReflectionFuel(
  agent: PreparedAgent,
  result: HistoricalAgentEngagementResult,
): Promise<boolean> {
  if (agent.balance >= MIN_REFLECTION_ESMS) return true;
  const positions = planetPositionsFromNatal(agent.row.natal_positions);
  if (Object.keys(positions).length === 0) return false;
  try {
    const claim = await dailyYieldService.claimDailyYield(
      agent.row.id,
      { positions },
      "agents",
    );
    if (claim.status === "claimed") {
      agent.balance += claim.result.totalTokens;
      result.yieldsClaimed += 1;
    }
  } catch (err) {
    _logger.warn(`[hist-engagement] daily yield top-up failed for ${agent.slug}:`, err);
  }
  return agent.balance >= MIN_REFLECTION_ESMS;
}

/** Index existing non-deleted recipe reflections per agent and recipe usage frequency. */
export async function loadExistingReflectionIndex(): Promise<{
  reviewedByAgent: Map<string, Set<string>>;
  usedCounts: Map<string, number>;
}> {
  const existingRes = await executeQuery<ExistingReflectionPairRow>(
    `SELECT author_id, recipe_id FROM recipe_reflections WHERE deleted_at IS NULL`,
  );
  const reviewedByAgent = new Map<string, Set<string>>();
  const usedCounts = new Map<string, number>();
  for (const row of existingRes.rows) {
    const set = reviewedByAgent.get(row.author_id) ?? new Set<string>();
    set.add(row.recipe_id);
    reviewedByAgent.set(row.author_id, set);
    usedCounts.set(row.recipe_id, (usedCounts.get(row.recipe_id) ?? 0) + 1);
  }
  return { reviewedByAgent, usedCounts };
}

/** Load recent feed posts needing comments along with existing commenter IDs. */
export async function loadCandidatePostsWithCommenters(): Promise<{
  posts: CandidateFeedPostRow[];
  commentedByEvent: Map<string, Set<string>>;
}> {
  const postsRes = await executeQuery<CandidateFeedPostRow>(SQL_LOAD_CANDIDATE_POSTS);
  const commentedByEvent = new Map<string, Set<string>>();
  if (postsRes.rows.length === 0) {
    return { posts: [], commentedByEvent };
  }
  const postIds = postsRes.rows.map((p) => p.id);
  const existingComments = await executeQuery<CommentAuthorRow>(
    `SELECT event_id, author_id
       FROM feed_comments
      WHERE event_id = ANY($1::uuid[]) AND deleted_at IS NULL`,
    [postIds],
  );
  for (const row of existingComments.rows) {
    const set = commentedByEvent.get(row.event_id) ?? new Set<string>();
    set.add(row.author_id);
    commentedByEvent.set(row.event_id, set);
  }
  return { posts: postsRes.rows, commentedByEvent };
}
