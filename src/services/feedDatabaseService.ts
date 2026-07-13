/**
 * Feed Database Service
 * Manages fetching and recording community feed events.
 *
 * Identity (PR 4): every new event is stamped at write time with
 * metadata_payload.identity = {v:2, share, explicit} plus the legacy
 * shareName mirror (rollback-safe: an old reader renders new events
 * correctly). Read paths resolve the actor's reveal through
 * resolveFeedActorReveal — legacy (unstamped) events stay frozen under the
 * old opt-in rule, so the default flip can never de-anonymize an existing row.
 */

import { executeQuery } from "@/lib/database/connection";
import {
  buildIdentityStamp,
  readIdentityStamp,
  resolveFeedActorReveal,
} from "@/lib/feed/identity";
import { _logger } from "@/lib/logger";

export interface FeedEvent {
  id: string;
  actorId: string;
  eventType: 'claim_daily' | 'transit_attunement' | 'commensal_request' | 'recipe_generation' | 'insight' | 'lab_entry' | 'made_it' | 'table_memory' | 'other';
  metadataPayload: any;
  createdAt: Date;
  actorName: string;
  actorImage?: string;
  actorIsAgent: boolean;
  /**
   * Agent slug (the `@agentic.alchm.kitchen` email local-part) — set ONLY for
   * agent actors, so the feed UI can link them to the PA chat. Never populated
   * for human actors: their email must not leak through this public endpoint.
   */
  actorSlug?: string;
  /** Total reaction count from feed_reactions (derived sum; recent-events read path only). */
  reactionCount?: number;
  /**
   * Per-kind reaction counts (spark/fire/water/earth/air → n). Viewer-independent,
   * so it rides the shared feed cache. `reactionCount` is the derived sum.
   */
  reactionCounts?: Record<string, number>;
  /** Non-deleted, non-hidden comment count (viewer-independent → cache-safe). */
  commentCount?: number;
  /**
   * Whether the actor's REAL identity is rendered (resolver output). False
   * means actorName is "Anonymous Alchemist" and actorImage is absent.
   * Always true for agents.
   */
  actorRevealed: boolean;
}

class FeedDatabaseService {

  /**
   * Record a new feed event.
   *
   * `identity` is the caller's per-post choice (composer checkbox / API
   * field); absent means "inherit the actor's share_identity default"
   * (missing profile row = shared — the PR 4 flip; IDENTITY_DEFAULT_ANONYMOUS=1
   * reverts the default without redeploy). Payloads that already carry a v2
   * stamp (e.g. frozen table memories) are left untouched.
   */
  async createEvent(
    actorId: string,
    eventType: string,
    metadataPayload: any = {},
    skipWebhook = false,
    identity?: { share?: boolean; explicit?: boolean },
  ): Promise<boolean> {
    try {
      if (["agent_chat", "chat", "agent.chat"].includes(eventType)) {
        _logger.info(`[feed] Blocked agent chat event type: ${eventType} for anonymity`);
        return false;
      }

      // One indexed lookup serves both the identity stamp and the PA webhook.
      // On failure the stamp falls back to CONCEALED unless the caller chose
      // explicitly — a DB blip must never reveal someone who opted out.
      let user: { email?: string; is_agent?: boolean; actor_name?: string; share_identity?: boolean | null } | null = null;
      try {
        const result = await executeQuery(
          `SELECT u.email, u.is_agent, up.name as actor_name, up.share_identity
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.id = $1`,
          [actorId]
        );
        user = result?.rows?.[0] ?? null;
      } catch (lookupError) {
        _logger.warn("[feed] actor lookup failed — stamping privacy-safe:", lookupError);
      }

      let stampedPayload = metadataPayload ?? {};
      if (!readIdentityStamp(stampedPayload)) {
        const stamp =
          identity?.share === undefined && !user
            ? { v: 2 as const, share: false, explicit: false } // lookup failed → conceal
            : buildIdentityStamp(identity, user?.share_identity);
        stampedPayload = {
          ...stampedPayload,
          identity: stamp,
          // Legacy mirror so a rolled-back reader renders new events correctly.
          shareName: stamp.share,
        };
      }

      await executeQuery(
        `INSERT INTO feed_events (actor_id, event_type, metadata_payload)
         VALUES ($1, $2, $3)`,
        [actorId, eventType, JSON.stringify(stampedPayload)]
      );

      // Secure Webhook Ingestion to Planetary Agents
      if (!skipWebhook) {
        if (user) {
          if (user.is_agent === true && user.email) {
            let agentEmail = user.email.toLowerCase().trim();
            // Ensure canonical agent email format (ends with @agentic.alchm.kitchen)
            if (!agentEmail.endsWith("@agentic.alchm.kitchen")) {
              const agentId = agentEmail.split("@")[0];
              agentEmail = `${agentId}@agentic.alchm.kitchen`;
            }

            const { getServiceUrlSafe } = await import("@/lib/serviceUrls");
            const PLANETARY_AGENTS_URL = getServiceUrlSafe("planetaryAgentsApi");
            const internalSecret = process.env.INTERNAL_API_SECRET;

            if (internalSecret) {
              const payload = {
                agentEmail,
                eventType,
                agentDisplayName: user.actor_name || agentEmail.split("@")[0],
                metadataPayload: stampedPayload,
              };

              fetch(`${PLANETARY_AGENTS_URL}/api/feed`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${internalSecret}`,
                },
                body: JSON.stringify(payload),
              }).then(async (res) => {
                if (!res.ok) {
                  const text = await res.text().catch(() => "");
                  _logger.error(`[Webhook PA] Failed to push event to PA: ${res.status} ${text}`);
                } else {
                  _logger.info(`[Webhook PA] Successfully pushed event ${eventType} to PA for agent ${agentEmail}`);
                }
              }).catch((err) => {
                _logger.error("[Webhook PA] Error pushing to PA feed:", err);
              });
            } else {
              _logger.warn("[Webhook PA] INTERNAL_API_SECRET not set. Skipping webhook.");
            }
          }
        }
      }

      return true;
    } catch (error) {
      _logger.error("Failed to create feed event:", error);
      return false;
    }
  }

  /**
   * Fetch recent feed events
   */
  async getRecentEvents(limit: number = 50, offset: number = 0): Promise<FeedEvent[]> {
    try {
      const result = await executeQuery(
        `SELECT f.*, u.is_agent, u.email as actor_email,
                COALESCE(up.avatar_url, u.image) as actor_image,
                up.name as actor_name, up.share_identity as actor_share_identity,
                COALESCE(r.by_kind, '{}'::jsonb) AS reaction_by_kind,
                COALESCE(cc.n, 0) AS comment_count
         FROM feed_events f
         JOIN users u ON f.actor_id = u.id
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN LATERAL (
           SELECT jsonb_object_agg(kind, n) AS by_kind FROM
             (SELECT kind, COUNT(*)::int n FROM feed_reactions
               WHERE event_id = f.id GROUP BY kind) s
         ) r ON true
         LEFT JOIN LATERAL (
           SELECT COUNT(*)::int AS n FROM feed_comments c
            WHERE c.event_id = f.id AND c.deleted_at IS NULL AND NOT c.hidden
         ) cc ON true
         ORDER BY f.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows.map(row => {
        const isAgent = row.is_agent === true;
        // Agent slug is the email local-part — only for agents. Human emails
        // are never surfaced through this public endpoint.
        const actorSlug =
          isAgent && typeof row.actor_email === "string" && row.actor_email.includes("@")
            ? row.actor_email.split("@")[0]
            : undefined;

        let actorName = row.actor_name || 'Alchemist';
        let actorImage = row.actor_image;

        // Identity resolution (src/lib/feed/identity.ts): legacy events stay
        // frozen under the old opt-in rule; stamped events honor the stamp,
        // with default-named posts concealed by a LATER opt-out (never the
        // reverse). Concealed rendering is unchanged: name + no image.
        const revealed = resolveFeedActorReveal({
          isAgent,
          metadata: row.metadata_payload,
          currentShareIdentity: row.actor_share_identity,
        });
        if (!revealed) {
          actorName = "Anonymous Alchemist";
          actorImage = undefined;
        }

        // jsonb_object_agg gives {kind: n}. `pg` may hand it back parsed (object)
        // or as a JSON string depending on the column type inference — normalize.
        const rawByKind = row.reaction_by_kind;
        const byKind: Record<string, number> =
          typeof rawByKind === "string"
            ? (JSON.parse(rawByKind) as Record<string, number>)
            : (rawByKind as Record<string, number>) || {};
        const reactionTotal = Object.values(byKind).reduce(
          (sum, n) => sum + (Number(n) || 0),
          0,
        );

        return {
          id: row.id,
          actorId: row.actor_id,
          eventType: row.event_type,
          metadataPayload: row.metadata_payload,
          createdAt: new Date(row.created_at),
          actorName,
          actorImage,
          actorIsAgent: isAgent,
          actorSlug,
          reactionCount: reactionTotal,
          reactionCounts: byKind,
          commentCount: Number(row.comment_count) || 0,
          actorRevealed: revealed,
        };
      });
    } catch (error) {
      _logger.error("Failed to fetch feed events:", error);
      return [];
    }
  }

  /**
   * Fetch paginated feed events for a specific actor
   */
  async getEventsByActor(actorId: string, limit: number = 20, offset: number = 0): Promise<FeedEvent[]> {
    try {
      const result = await executeQuery(
        `SELECT f.*, u.is_agent, u.email as actor_email,
                COALESCE(up.avatar_url, u.image) as actor_image,
                up.name as actor_name, up.share_identity as actor_share_identity
         FROM feed_events f
         JOIN users u ON f.actor_id = u.id
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE f.actor_id = $1
         ORDER BY f.created_at DESC
         LIMIT $2 OFFSET $3`,
        [actorId, limit, offset]
      );

      return result.rows.map(row => {
        const isAgent = row.is_agent === true;
        const actorSlug =
          isAgent && typeof row.actor_email === "string" && row.actor_email.includes("@")
            ? row.actor_email.split("@")[0]
            : undefined;

        let actorName = row.actor_name || 'Alchemist';
        let actorImage = row.actor_image;

        // Same resolver as getRecentEvents — see the comment there.
        const revealed = resolveFeedActorReveal({
          isAgent,
          metadata: row.metadata_payload,
          currentShareIdentity: row.actor_share_identity,
        });
        if (!revealed) {
          actorName = "Anonymous Alchemist";
          actorImage = undefined;
        }

        return {
          id: row.id,
          actorId: row.actor_id,
          eventType: row.event_type,
          metadataPayload: row.metadata_payload,
          createdAt: new Date(row.created_at),
          actorName,
          actorImage,
          actorIsAgent: isAgent,
          actorSlug,
          actorRevealed: revealed,
        };
      });
    } catch (error) {
      _logger.error("Failed to fetch actor feed events:", error);
      return [];
    }
  }
}

export const feedDatabase = new FeedDatabaseService();
