/**
 * Feed Database Service
 * Manages fetching and recording community feed events.
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export interface FeedEvent {
  id: string;
  actorId: string;
  eventType: 'claim_daily' | 'commensal_request' | 'recipe_generation' | 'insight' | 'lab_entry' | 'made_it' | 'other';
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
}

class FeedDatabaseService {
  
  /**
   * Record a new feed event
   */
  async createEvent(actorId: string, eventType: string, metadataPayload: any = {}, skipWebhook = false): Promise<boolean> {
    try {
      await executeQuery(
        `INSERT INTO feed_events (actor_id, event_type, metadata_payload)
         VALUES ($1, $2, $3)`,
        [actorId, eventType, JSON.stringify(metadataPayload)]
      );

      // Secure Webhook Ingestion to Planetary Agents
      if (!skipWebhook) {
        // Query the database to check if this is an agentic user
        const result = await executeQuery(
          `SELECT u.email, u.is_agent, up.name as actor_name
           FROM users u
           LEFT JOIN user_profiles up ON u.id = up.user_id
           WHERE u.id = $1`,
          [actorId]
        );

        if (result && result.rows.length > 0) {
          const user = result.rows[0];
          if (user.is_agent === true) {
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
                metadataPayload,
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
        `SELECT f.*, u.is_agent, u.email as actor_email, u.image as actor_image, up.name as actor_name
         FROM feed_events f
         JOIN users u ON f.actor_id = u.id
         LEFT JOIN user_profiles up ON u.id = up.user_id
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
        return {
          id: row.id,
          actorId: row.actor_id,
          eventType: row.event_type,
          metadataPayload: row.metadata_payload,
          createdAt: new Date(row.created_at),
          actorName: row.actor_name || 'Alchemist',
          actorImage: row.actor_image,
          actorIsAgent: isAgent,
          actorSlug,
        };
      });
    } catch (error) {
      _logger.error("Failed to fetch feed events:", error);
      return [];
    }
  }
}

export const feedDatabase = new FeedDatabaseService();
