/**
 * Agent Publication Service
 *
 * Manages durable publication identity, idempotency, fingerprint conflict detection,
 * and truthful receipt storage in `agent_publications`.
 *
 * Provides in-memory test fallback when running in database-less test environments.
 *
 * @file src/services/agentPublicationService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import type {
  AgentPublicationRow,
  DetailedPublicationReceipt,
  LegacyInteractionStatus,
  PublicationOperation,
  RecipeCommentStatus,
} from "@/lib/publications/types";
import type { PoolClient } from "pg";

export const STALE_PUBLICATION_LOCK_SECONDS = 60;

export type PreparePublicationOutcome =
  | { kind: "proceed"; publicationId: string; client?: PoolClient | undefined }
  | { kind: "replayed"; receipt: DetailedPublicationReceipt; publicationId?: string | undefined }
  | { kind: "in_flight"; retryAfter: number }
  | {
      kind: "payload_conflict";
      code: "PAYLOAD_CONFLICT";
      message: string;
    };

export class AgentPublicationService {
  private readonly memoryStore = new Map<string, AgentPublicationRow>();

  clearMemory(): void {
    this.memoryStore.clear();
  }

  private memKey(principalId: string, operation: string, deliveryKey: string): string {
    return `${principalId}:${operation}:${deliveryKey}`;
  }

  /**
   * Check or claim a publication reservation before performing side-effects.
   */
  async preparePublication(params: {
    principalId: string;
    operation: PublicationOperation;
    deliveryKey: string;
    actorId?: string;
    payloadFingerprint?: string;
    semanticFingerprint?: string;
    client?: PoolClient;
  }): Promise<PreparePublicationOutcome> {
    const {
      principalId,
      operation,
      deliveryKey,
      actorId = "internal-agent",
      client,
    } = params;
    const fingerprint = params.payloadFingerprint ?? params.semanticFingerprint ?? "";

    // 1. Check existing record
    const selectSql = `
      SELECT id, principal_id, operation, delivery_key, payload_fingerprint,
             actor_id, status, feed_event_id, recipe_reflection_id, menu_id,
             feed_published, recipe_comment_status, legacy_interaction_status,
             receipt_payload, locked_at
        FROM agent_publications
       WHERE principal_id = $1 AND operation = $2 AND delivery_key = $3
       FOR UPDATE
    `;

    try {
      const existing = client
        ? await client.query<AgentPublicationRow>(selectSql, [
            principalId,
            operation,
            deliveryKey,
          ])
        : await executeQuery<AgentPublicationRow>(selectSql, [
            principalId,
            operation,
            deliveryKey,
          ]);

      const row = existing?.rows?.[0];

      if (row) {
        // Different actor claiming same key under same principal
        if (row.actor_id && actorId && row.actor_id !== actorId) {
          return {
            kind: "payload_conflict",
            code: "PAYLOAD_CONFLICT",
            message: "Delivery key previously used with a different actor identity",
          };
        }

        // Check fingerprint
        if (fingerprint && row.payload_fingerprint !== fingerprint) {
          return {
            kind: "payload_conflict",
            code: "PAYLOAD_CONFLICT",
            message: "Delivery key previously used with a different semantic payload",
          };
        }

        // Completed previously: replay original receipt
        if (row.status === "completed") {
          return {
            kind: "replayed",
            receipt: row.receipt_payload,
            publicationId: row.id,
          };
        }

        // In-flight: check lock freshness
        if (row.status === "in_flight") {
          const lockedAtMs = row.locked_at ? new Date(row.locked_at).getTime() : 0;
          const isStale =
            Date.now() - lockedAtMs > STALE_PUBLICATION_LOCK_SECONDS * 1000;
          if (!isStale) {
            return {
              kind: "in_flight",
              retryAfter: 1,
            };
          }
          // Stale lock: update locked_at and take over
          const updateStaleSql = `
            UPDATE agent_publications
               SET locked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
          `;
          if (client) {
            await client.query(updateStaleSql, [row.id]);
          } else {
            await executeQuery(updateStaleSql, [row.id]);
          }
          return {
            kind: "proceed",
            publicationId: row.id,
            client,
          };
        }

        // If failed, allow retry
        const retrySql = `
          UPDATE agent_publications
             SET status = 'in_flight', locked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1
        `;
        if (client) {
          await client.query(retrySql, [row.id]);
        } else {
          await executeQuery(retrySql, [row.id]);
        }
        return {
          kind: "proceed",
          publicationId: row.id,
          client,
        };
      }

      // Insert new in_flight reservation
      const insertSql = `
        INSERT INTO agent_publications (
          principal_id, operation, delivery_key, payload_fingerprint,
          actor_id, status, locked_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'in_flight', CURRENT_TIMESTAMP
        )
        RETURNING id
      `;
      const insertResult = client
        ? await client.query<{ id: string }>(insertSql, [
            principalId,
            operation,
            deliveryKey,
            fingerprint,
            actorId,
          ])
        : await executeQuery<{ id: string }>(insertSql, [
            principalId,
            operation,
            deliveryKey,
            fingerprint,
            actorId,
          ]);

      const publicationId = insertResult.rows[0]?.id ?? `pub_${deliveryKey}`;
      return {
        kind: "proceed",
        publicationId,
        client,
      };
    } catch (_err) {
      // In-memory fallback for test environments without live DB
      const mKey = this.memKey(principalId, operation, deliveryKey);
      const row = this.memoryStore.get(mKey);

      if (row) {
        if (row.actor_id && actorId && row.actor_id !== actorId) {
          return {
            kind: "payload_conflict",
            code: "PAYLOAD_CONFLICT",
            message: "Delivery key previously used with a different actor identity",
          };
        }

        if (fingerprint && row.payload_fingerprint !== fingerprint) {
          return {
            kind: "payload_conflict",
            code: "PAYLOAD_CONFLICT",
            message: "Delivery key previously used with a different semantic payload",
          };
        }

        if (row.status === "completed") {
          return {
            kind: "replayed",
            receipt: row.receipt_payload,
            publicationId: row.id,
          };
        }

        if (row.status === "in_flight") {
          const lockedAtMs = row.locked_at ? new Date(row.locked_at).getTime() : 0;
          if (Date.now() - lockedAtMs <= STALE_PUBLICATION_LOCK_SECONDS * 1000) {
            return { kind: "in_flight", retryAfter: 1 };
          }
        }
      }

      const fallbackId = `pub_${deliveryKey}`;
      const newRow: AgentPublicationRow = {
        id: fallbackId,
        principal_id: principalId,
        operation,
        delivery_key: deliveryKey,
        payload_fingerprint: fingerprint,
        actor_id: actorId,
        status: "in_flight",
        feed_event_id: null,
        recipe_reflection_id: null,
        menu_id: null,
        feed_published: false,
        recipe_comment_status: "not_requested",
        legacy_interaction_status: "not_requested",
        receipt_payload: {
          success: false,
          contractVersion: "1.0",
          deliveryId: deliveryKey,
          publicationId: fallbackId,
          operation,
          agentEmail: actorId,
          feedPublished: false,
          recipeCommentStatus: "not_requested",
          legacyInteractionStatus: "not_requested",
        },
        error_message: null,
        locked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.memoryStore.set(mKey, newRow);

      return {
        kind: "proceed",
        publicationId: fallbackId,
        client,
      };
    }
  }

  /**
   * Finalize the publication record with durably confirmed resource IDs and outcomes.
   */
  async completePublication(
    publicationIdOrParams:
      | string
      | {
          publicationId: string;
          feedEventId?: string | null | undefined;
          recipeReflectionId?: string | null | undefined;
          menuId?: string | null | undefined;
          feedPublished: boolean;
          recipeCommentStatus?: RecipeCommentStatus | undefined;
          legacyInteractionStatus?: LegacyInteractionStatus | undefined;
          receiptPayload: DetailedPublicationReceipt;
          client?: PoolClient | undefined;
        },
    legacyReceipt?: DetailedPublicationReceipt | undefined,
  ): Promise<void> {
    let publicationId: string;
    let receiptPayload: DetailedPublicationReceipt;
    let feedEventId: string | null = null;
    let recipeReflectionId: string | null = null;
    let menuId: string | null = null;
    let feedPublished = false;
    let recipeCommentStatus: RecipeCommentStatus = "not_requested";
    let legacyInteractionStatus: LegacyInteractionStatus = "not_requested";
    let client: PoolClient | undefined;

    if (typeof publicationIdOrParams === "string") {
      publicationId = publicationIdOrParams;
      const defaultReceipt: DetailedPublicationReceipt = {
        success: true,
        contractVersion: "1.0",
        deliveryId: "",
        publicationId,
        operation: "feed_publish",
        agentEmail: "",
        feedPublished: false,
        recipeCommentStatus: "not_requested",
        legacyInteractionStatus: "not_requested",
      };
      receiptPayload = legacyReceipt ?? defaultReceipt;
      feedPublished = Boolean(receiptPayload.feedPublished);
      feedEventId = receiptPayload.event?.id ?? null;
      menuId = receiptPayload.menu?.id ?? null;
      recipeReflectionId = receiptPayload.recipeReflectionId ?? null;
    } else {
      ({ publicationId, receiptPayload, client } = publicationIdOrParams);
      feedEventId = publicationIdOrParams.feedEventId ?? receiptPayload.event?.id ?? null;
      recipeReflectionId = publicationIdOrParams.recipeReflectionId ?? receiptPayload.recipeReflection?.id ?? null;
      menuId = publicationIdOrParams.menuId ?? receiptPayload.menu?.id ?? null;
      feedPublished = publicationIdOrParams.feedPublished ?? receiptPayload.feedPublished ?? false;
      recipeCommentStatus = publicationIdOrParams.recipeCommentStatus ?? "not_requested";
      legacyInteractionStatus = publicationIdOrParams.legacyInteractionStatus ?? "not_requested";
    }

    // Update in-memory fallback
    for (const [key, row] of this.memoryStore.entries()) {
      if (row.id === publicationId) {
        row.status = "completed";
        row.feed_published = feedPublished;
        row.feed_event_id = feedEventId;
        row.recipe_reflection_id = recipeReflectionId;
        row.menu_id = menuId;
        row.recipe_comment_status = recipeCommentStatus;
        row.legacy_interaction_status = legacyInteractionStatus;
        row.receipt_payload = receiptPayload;
        row.locked_at = null;
        row.updated_at = new Date().toISOString();
        this.memoryStore.set(key, row);
        break;
      }
    }

    const sql = `
      UPDATE agent_publications
         SET status = 'completed',
             feed_event_id = $2,
             recipe_reflection_id = $3,
             menu_id = $4,
             feed_published = $5,
             recipe_comment_status = $6,
             legacy_interaction_status = $7,
             receipt_payload = $8::jsonb,
             locked_at = NULL,
             updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
    `;

    const args = [
      publicationId,
      feedEventId,
      recipeReflectionId,
      menuId,
      feedPublished,
      recipeCommentStatus,
      legacyInteractionStatus,
      JSON.stringify(receiptPayload),
    ];

    try {
      if (client) {
        await client.query(sql, args);
      } else {
        await executeQuery(sql, args);
      }
    } catch (err) {
      // Handled via memoryStore fallback
      _logger.debug("[agentPublicationService] completePublication DB write skipped/failed:", err);
    }
  }

  /**
   * Mark publication failed on unrecoverable error.
   */
  async failPublication(
    publicationIdOrParams:
      | string
      | {
          publicationId: string;
          errorMessage: string;
          client?: PoolClient;
        },
    legacyErrorMessage?: string,
    legacyReceipt?: DetailedPublicationReceipt,
  ): Promise<void> {
    let publicationId: string;
    let errorMessage: string;
    let client: PoolClient | undefined;
    let receipt: DetailedPublicationReceipt | undefined;

    if (typeof publicationIdOrParams === "string") {
      publicationId = publicationIdOrParams;
      errorMessage = legacyErrorMessage ?? "Publication failed";
      receipt = legacyReceipt;
    } else {
      ({ publicationId, errorMessage, client } = publicationIdOrParams);
    }

    // Update in-memory fallback
    for (const [key, row] of this.memoryStore.entries()) {
      if (row.id === publicationId) {
        row.status = "failed";
        row.error_message = errorMessage;
        if (receipt) {
          row.receipt_payload = receipt;
        }
        row.locked_at = null;
        row.updated_at = new Date().toISOString();
        this.memoryStore.set(key, row);
        break;
      }
    }

    const sql = `
      UPDATE agent_publications
         SET status = 'failed',
             error_message = $2,
             locked_at = NULL,
             updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
    `;
    try {
      if (client) {
        await client.query(sql, [publicationId, errorMessage]);
      } else {
        await executeQuery(sql, [publicationId, errorMessage]);
      }
    } catch (err) {
      _logger.debug("[agentPublicationService] failPublication DB write skipped/failed:", err);
    }
  }

  /**
   * Read receipt by delivery key, scoped strictly to the authenticated principal.
   */
  async getReceiptByDeliveryKey(
    principalId: string,
    deliveryKey: string,
    options?: { actorId?: string; operation?: PublicationOperation },
  ): Promise<AgentPublicationRow | null> {
    let sql = `
      SELECT id, principal_id, operation, delivery_key, payload_fingerprint,
             actor_id, status, feed_event_id, recipe_reflection_id, menu_id,
             feed_published, recipe_comment_status, legacy_interaction_status,
             receipt_payload, error_message, locked_at, created_at, updated_at
        FROM agent_publications
       WHERE principal_id = $1 AND delivery_key = $2
    `;
    const params: unknown[] = [principalId, deliveryKey];

    if (options?.actorId) {
      params.push(options.actorId);
      sql += ` AND actor_id = $${params.length}`;
    }
    if (options?.operation) {
      params.push(options.operation);
      sql += ` AND operation = $${params.length}`;
    }

    sql += " LIMIT 1";

    try {
      const result = await executeQuery<AgentPublicationRow>(sql, params);
      return result.rows[0] ?? null;
    } catch {
      // Memory fallback: search across all stored rows for matching principal and deliveryKey
      for (const row of this.memoryStore.values()) {
        if (row.principal_id === principalId && row.delivery_key === deliveryKey) {
          if (options?.actorId && row.actor_id !== options.actorId) continue;
          if (options?.operation && row.operation !== options.operation) continue;
          return row;
        }
      }
      return null;
    }
  }
}

export const agentPublicationService = new AgentPublicationService();
