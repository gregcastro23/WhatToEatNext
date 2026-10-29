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
import { invalidateCommunityAgentsCache } from "@/lib/redis";

export interface FeedEvent {
  id: string;
  actorId: string;
  eventType: 'claim_daily' | 'transit_attunement' | 'commensal_request' | 'recipe_generation' | 'insight' | 'lab_entry' | 'made_it' | 'table_memory' | 'other';
  metadataPayload: Record<string, unknown>;
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

interface UserLookupRow {
  email?: string;
  is_agent?: boolean;
  actor_name?: string;
  share_identity?: boolean | null;
}

interface FeedEventRow {
  id: string;
  actor_id: string;
  event_type: FeedEvent['eventType'];
  metadata_payload: Record<string, unknown>;
  created_at: string | Date;
  is_agent?: boolean;
  actor_email?: string;
  actor_image?: string;
  actor_name?: string;
  actor_share_identity?: boolean | null;
  reaction_by_kind?: Record<string, number> | string;
  comment_count?: number | string;
}

export interface PublishFeedEventParams {
  actorId: string;
  eventType: string;
  metadataPayload?: Record<string, unknown>;
  skipWebhook?: boolean;
  identity?: Parameters<typeof buildIdentityStamp>[0];
  deliveryId?: string;
  publicationId?: string;
  client?: import("pg").PoolClient;
}

export interface DetailedPublicationResult {
  success: boolean;
  contractVersion: "1.0";
  deliveryId?: string;
  publicationId?: string;
  agentEmail?: string;
  eventType: string;
  event?: { id: string };
  eventId?: string;
  feedPublished: boolean;
  recipeCommentStatus: "not_requested" | "pending" | "saved" | "failed" | "unknown";
  recipeCommentSaved?: boolean;
  recipeReflectionId?: string;
  legacyInteractionStatus: "not_requested" | "saved" | "no_op" | "failed";
  details?: Record<string, unknown>;
  error?: string;
  economy?: import("@/types/economy").EconomyReceipt;
}

class FeedDatabaseService {

  /**
   * Publish a feed event with detailed, truthful receipts for feed, reflection, and legacy interaction outcomes.
   */
  async publishFeedEvent(
    paramsOrActorId: PublishFeedEventParams | string,
    legacyEventType?: string,
    legacyMetadataPayload?: Record<string, unknown>,
    legacySkipWebhook?: boolean,
  ): Promise<DetailedPublicationResult> {
    const params: PublishFeedEventParams =
      typeof paramsOrActorId === "string"
        ? {
            actorId: paramsOrActorId,
            eventType: legacyEventType ?? "feed_event",
            metadataPayload: legacyMetadataPayload ?? {},
            skipWebhook: legacySkipWebhook ?? false,
          }
        : paramsOrActorId;

    const {
      actorId,
      eventType,
      metadataPayload = {},
      skipWebhook = false,
      identity,
      deliveryId,
      publicationId,
      client,
    } = params;

    if (["agent_chat", "chat", "agent.chat"].includes(eventType)) {
      _logger.info(`[feed] Blocked agent chat event type: ${eventType} for anonymity`);
      return {
        success: false,
        contractVersion: "1.0",
        ...(deliveryId ? { deliveryId } : {}),
        ...(publicationId ? { publicationId } : {}),
        eventType,
        feedPublished: false,
        recipeCommentStatus: "not_requested",
        legacyInteractionStatus: "not_requested",
        error: "Agent chat event types are excluded from feed publication",
      };
    }

    let user: UserLookupRow | null = null;
    try {
      const userLookupSql = `
        SELECT u.email, u.is_agent, up.name as actor_name, up.share_identity
          FROM users u
          LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = $1
      `;
      const result = client
        ? await client.query<UserLookupRow>(userLookupSql, [actorId])
        : await executeQuery<UserLookupRow>(userLookupSql, [actorId]);
      user = result.rows[0] ?? null;
    } catch (lookupError) {
      _logger.warn("[feed] actor lookup failed — stamping privacy-safe:", lookupError);
    }

    let stampedPayload = metadataPayload;
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

    let feedEventId: string | undefined;
    let feedPublished: boolean;

    try {
      const insertFeedSql = `
        INSERT INTO feed_events (actor_id, event_type, metadata_payload)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const feedRes = client
        ? await client.query<{ id: string }>(insertFeedSql, [
            actorId,
            eventType,
            JSON.stringify(stampedPayload),
          ])
        : await executeQuery<{ id: string }>(insertFeedSql, [
            actorId,
            eventType,
            JSON.stringify(stampedPayload),
          ]);

      feedEventId = feedRes.rows[0]?.id;
      feedPublished = Boolean(feedEventId) || (typeof feedRes.rowCount === "number" && feedRes.rowCount > 0);
      if (feedPublished && user?.is_agent === true && !client) {
        // Explicit transactions invalidate in their afterCommit callback.
        await invalidateCommunityAgentsCache();
      }
    } catch (feedError) {
      _logger.error("Failed to insert feed event:", feedError);
      return {
        success: false,
        contractVersion: "1.0",
        ...(deliveryId ? { deliveryId } : {}),
        ...(publicationId ? { publicationId } : {}),
        ...(user?.email ? { agentEmail: user.email } : {}),
        eventType,
        feedPublished: false,
        recipeCommentStatus: "not_requested",
        legacyInteractionStatus: "not_requested",
        error: "Failed to persist feed event",
      };
    }

    let recipeCommentStatus: "not_requested" | "pending" | "saved" | "failed" | "unknown" = "not_requested";
    let recipeCommentSaved: boolean | undefined = undefined;
    let recipeReflectionId: string | undefined = undefined;
    let legacyInteractionStatus: "not_requested" | "saved" | "no_op" | "failed" = "not_requested";
    let reflectionEconomyReceipt: import("@/types/economy").EconomyReceipt | undefined = undefined;

    const rawRecipeId = stampedPayload.recipeId ?? stampedPayload.recipe_id;
    const targetRecipeId = typeof rawRecipeId === "string" ? rawRecipeId : undefined;
    const rawReview = stampedPayload.review ?? stampedPayload.comment ?? stampedPayload.description;
    const reviewText = typeof rawReview === "string" ? rawReview.trim() : undefined;

    if (targetRecipeId && reviewText && reviewText.length > 0) {
      const isAgentActor = user?.is_agent === true;
      const isCatalogCritique = stampedPayload.source === "catalog_critique";
      const isRecipeAlteration = stampedPayload.source === "recipe_alteration";
      const isAgentGenerated = isAgentActor || isCatalogCritique || isRecipeAlteration;

      const rawRating =
        typeof stampedPayload.rating === "number" && Number.isFinite(stampedPayload.rating)
          ? stampedPayload.rating
          : null;

      try {
        const { recipeReflectionId: explicitReflectionId } = stampedPayload;
        if (typeof explicitReflectionId === "string" && explicitReflectionId.length > 0) {
          recipeReflectionId = explicitReflectionId;
          recipeCommentStatus = "saved";
          recipeCommentSaved = true;
        } else {
          if (isAgentActor && stampedPayload.skipEconomyCharge !== true) {
            const { agentEconomyActionService } = await import("./agentEconomyActionService");
            const { RECIPE_REFLECTION_COST } = await import("@/types/economy");

            const debitRes = await agentEconomyActionService.debitActionInTx({
              userId: actorId,
              costs: RECIPE_REFLECTION_COST,
              sourceType: "recipe_reflection",
              sourceId: targetRecipeId,
              description: `Recipe reflection on ${targetRecipeId}`,
              idempotencyKey: deliveryId ? `reflection:${deliveryId}` : null,
              autoSwap: stampedPayload.autoSwap !== false,
              ...(client ? { client } : {}),
            });

            if (!debitRes.success) {
              _logger.warn("[feed] agent has insufficient funds to post recipe reflection:", debitRes);
              throw new Error(`Insufficient ESMS funds for recipe reflection: ${debitRes.reason}`);
            }
            reflectionEconomyReceipt = debitRes.receipt;
          }

          const { recipeReflectionsService } = await import("./recipeReflectionsService");
          const reflection = await recipeReflectionsService.createReflection({
            recipeId: targetRecipeId,
            authorId: actorId,
            ...(publicationId ? { publicationId } : {}),
            ...(feedEventId ? { feedEventId } : {}),
            ...(deliveryId ? { deliveryKey: deliveryId } : {}),
            source: typeof stampedPayload.source === "string" ? stampedPayload.source : (isAgentActor ? "recipe_alteration" : "community_review"),
            contentState: "proposed",
            review: reviewText,
            score: rawRating,
            isAgent: isAgentActor,
            instructionReviewRequired: stampedPayload.instructionReviewRequired !== false,
            provenance: {
              substitutions: Array.isArray(stampedPayload.substitutions) ? stampedPayload.substitutions : [],
              recipePayload: stampedPayload.recipePayload,
              unverifiedReadings: ["nutrition", "elemental", "esms", "planetary"],
              ...(reflectionEconomyReceipt ? { economy: reflectionEconomyReceipt } : {}),
            },
            ...(client ? { client } : {}),
          });

          recipeReflectionId = reflection.id;
          recipeCommentStatus = "saved";
          recipeCommentSaved = true;
        }
      } catch (reflectionErr) {
        _logger.warn("[feed] failed to save recipe reflection record:", reflectionErr);
        recipeCommentStatus = "failed";
        recipeCommentSaved = false;
      }

      // Legacy user_recipe_interactions mirror
      const humanRating = !isAgentGenerated && rawRating !== null
        ? Math.min(5, Math.max(1, Math.round(rawRating)))
        : null;
      const humanMadeIt = !isAgentGenerated && (stampedPayload.madeIt === true || stampedPayload.made_it === true);
      const hasMadeIt = !isAgentGenerated && (typeof stampedPayload.madeIt === "boolean" || typeof stampedPayload.made_it === "boolean");
      const isProtectedFromOverwrite = isAgentGenerated;

      try {
        const interactionSql = `
          INSERT INTO user_recipe_interactions (user_id, recipe_id, made_it, rating, review)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, recipe_id) DO UPDATE SET
            made_it = CASE WHEN $6 THEN EXCLUDED.made_it ELSE user_recipe_interactions.made_it END,
            rating = COALESCE(EXCLUDED.rating, user_recipe_interactions.rating),
            review = EXCLUDED.review,
            updated_at = CURRENT_TIMESTAMP
          WHERE NOT $7
        `;
        const interactionArgs = [
          actorId,
          targetRecipeId,
          humanMadeIt,
          humanRating,
          reviewText,
          hasMadeIt,
          isProtectedFromOverwrite,
        ];

        const interactionRes = client
          ? await client.query(interactionSql, interactionArgs)
          : await executeQuery(interactionSql, interactionArgs);

        if (isProtectedFromOverwrite && (interactionRes.rowCount ?? 0) === 0) {
          legacyInteractionStatus = "no_op";
        } else {
          legacyInteractionStatus = "saved";
        }
      } catch (interactionError) {
        _logger.warn("[feed] failed to mirror recipe review to user_recipe_interactions:", interactionError);
        legacyInteractionStatus = "failed";
      }
    }

    if (!skipWebhook && user?.is_agent === true && user.email) {
      await this.pushAgentFeedWebhook({
        agentEmail: user.email,
        agentDisplayName: user.actor_name ?? null,
        eventType,
        metadataPayload: stampedPayload,
      });
    }

    return {
      success: feedPublished,
      contractVersion: "1.0",
      ...(deliveryId ? { deliveryId } : {}),
      ...(publicationId ? { publicationId } : {}),
      ...(user?.email ? { agentEmail: user.email } : {}),
      eventType,
      ...(feedEventId ? { event: { id: feedEventId } } : {}),
      feedPublished,
      recipeCommentStatus,
      ...(recipeCommentSaved !== undefined ? { recipeCommentSaved } : {}),
      ...(recipeReflectionId ? { recipeReflectionId } : {}),
      legacyInteractionStatus,
      ...(reflectionEconomyReceipt ? { economy: reflectionEconomyReceipt } : {}),
    };
  }

  /**
   * Push an agent feed event to Planetary Agents (/api/feed).
   * Can be invoked directly inside publishFeedEvent (when autocommitting) or
   * deferred to an afterCommit hook when publishFeedEvent runs inside an explicit
   * database transaction with skipWebhook: true.
   */
  async pushAgentFeedWebhook(params: {
    agentEmail: string;
    agentDisplayName?: string | null;
    eventType: string;
    metadataPayload: Record<string, unknown>;
  }): Promise<void> {
    let agentEmail = params.agentEmail.toLowerCase().trim();
    if (!agentEmail.endsWith("@agentic.alchm.kitchen")) {
      const [agentId] = agentEmail.split("@");
      agentEmail = `${agentId}@agentic.alchm.kitchen`;
    }

    const { getServiceUrlSafe } = await import("@/lib/serviceUrls");
    const PLANETARY_AGENTS_URL = getServiceUrlSafe("planetaryAgentsApi");
    const internalSecret = process.env.INTERNAL_API_SECRET;

    if (!internalSecret) {
      _logger.warn("[Webhook PA] INTERNAL_API_SECRET not set. Skipping webhook.");
      return;
    }

    const payload = {
      agentEmail,
      eventType: params.eventType,
      agentDisplayName: params.agentDisplayName ?? agentEmail.split("@")[0],
      metadataPayload: params.metadataPayload,
    };

    fetch(`${PLANETARY_AGENTS_URL}/api/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalSecret}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          _logger.error(`[Webhook PA] Failed to push event to PA: ${res.status} ${text}`);
        } else {
          _logger.info(`[Webhook PA] Successfully pushed event ${params.eventType} to PA for agent ${agentEmail}`);
        }
      })
      .catch((err: unknown) => {
        _logger.error("[Webhook PA] Error pushing to PA feed:", err);
      });
  }

  /**
   * Record a new feed event. Compatible wrapper around publishFeedEvent.
   */
  async createEvent(
    actorId: string,
    eventType: string,
    metadataPayload: Record<string, unknown> = {},
    skipWebhook = false,
    identity?: { share?: boolean; explicit?: boolean },
  ): Promise<boolean> {
    try {
      const result = await this.publishFeedEvent({
        actorId,
        eventType,
        metadataPayload,
        skipWebhook,
        identity,
      });
      return result.success && result.feedPublished;
    } catch (error) {
      _logger.error("Failed to create feed event:", error);
      return false;
    }
  }

  /**
   * Fetch recent feed events
   */
  async getRecentEvents(limit = 50, offset = 0): Promise<FeedEvent[]> {
    try {
      const result = await executeQuery<FeedEventRow>(
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

      return result.rows.map((row): FeedEvent => {
        const isAgent = row.is_agent === true;
        // Agent slug is the email local-part — only for agents. Human emails
        // are never surfaced through this public endpoint.
        const actorSlug =
          isAgent && typeof row.actor_email === "string" && row.actor_email.includes("@")
            ? row.actor_email.split("@")[0]
            : undefined;

        let actorName = row.actor_name ?? 'Alchemist';
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
            : rawByKind ?? {};
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
          ...(actorImage !== undefined ? { actorImage } : {}),
          actorIsAgent: isAgent,
          ...(actorSlug !== undefined ? { actorSlug } : {}),
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
  async getEventsByActor(actorId: string, limit = 20, offset = 0): Promise<FeedEvent[]> {
    try {
      const result = await executeQuery<FeedEventRow>(
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

      return result.rows.map((row): FeedEvent => {
        const isAgent = row.is_agent === true;
        const actorSlug =
          isAgent && typeof row.actor_email === "string" && row.actor_email.includes("@")
            ? row.actor_email.split("@")[0]
            : undefined;

        let actorName = row.actor_name ?? 'Alchemist';
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
          ...(actorImage !== undefined ? { actorImage } : {}),
          actorIsAgent: isAgent,
          ...(actorSlug !== undefined ? { actorSlug } : {}),
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
