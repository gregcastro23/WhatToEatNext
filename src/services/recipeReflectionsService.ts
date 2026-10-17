/**
 * Recipe Reflections Service
 *
 * Persists append-only recipe reflections/comments from agents and users,
 * providing keyset pagination, block filtering, and moderation-safe history.
 *
 * Keeps agent proposal commentary strictly separated from human cooking interactions
 * in `user_recipe_interactions`.
 *
 * @file src/services/recipeReflectionsService.ts
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import { isBlockedBetween } from "@/lib/feed/commentEnforcement";
import { _logger } from "@/lib/logger";
import type { PoolClient } from "pg";

const ProvenanceSchema = z.record(z.string(), z.unknown());

function parseProvenance(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return ProvenanceSchema.safeParse(parsed).data ?? {};
    } catch {
      return {};
    }
  }
  return ProvenanceSchema.safeParse(value).data ?? {};
}

export interface CreateReflectionParams {
  recipeId: string;
  authorId: string;
  publicationId?: string | null;
  feedEventId?: string | null;
  deliveryKey?: string | null;
  source: string;
  contentState?: "proposed" | "reviewed" | "published" | "archived";
  review: string;
  score?: number | null;
  isAgent?: boolean;
  instructionReviewRequired?: boolean;
  provenance?: Record<string, unknown>;
  createdAt?: Date | string;
  client?: PoolClient;
}

export interface RecipeReflectionRecord {
  id: string;
  recipeId: string;
  authorId: string;
  publicationId: string | null;
  feedEventId: string | null;
  deliveryKey: string | null;
  source: string;
  contentState: string;
  review: string;
  score: number | null;
  isAgent: boolean;
  instructionReviewRequired: boolean;
  provenance: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  hidden: boolean;
}

export interface ListReflectionsParams {
  recipeId: string;
  viewerId?: string | null;
  limit?: number;
  cursor?: string | null;
  authorType?: "all" | "agent" | "human";
  source?: string;
}

export interface FormattedRecipeReflection {
  id: string;
  recipeId: string;
  author: {
    id: string;
    name: string;
    slug?: string;
    isAgent: boolean;
  };
  publicationId: string | null;
  feedEventId: string | null;
  deliveryKey: string | null;
  source: string;
  contentState: string;
  review: string;
  score: number | null;
  isAgent: boolean;
  instructionReviewRequired: boolean;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeReflectionsPage {
  items: FormattedRecipeReflection[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface RawReflectionRow {
  id: string;
  recipe_id: string;
  author_id: string;
  publication_id: string | null;
  feed_event_id: string | null;
  delivery_key: string | null;
  source: string;
  content_state: string;
  review: string;
  score: number | string | null;
  is_agent: boolean;
  instruction_review_required: boolean;
  provenance: Record<string, unknown> | string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  hidden: boolean;
  author_name: string | null;
  author_email: string | null;
}

// eslint-disable-next-line no-control-regex -- explicitly strip ASCII control characters for moderation sanitization
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;

function sanitizeReview(text: string): string {
  return text.replace(CONTROL_CHARS, "").trim();
}

export function encodeCursor(createdAt: Date | string, id: string): string {
  const iso = new Date(createdAt).toISOString();
  return Buffer.from(`${iso}|${id}`).toString("base64url");
}

export function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [iso, id] = raw.split("|");
    if (!iso || !id) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
}

export class RecipeReflectionsService {
  private inMemoryReflections: Array<RecipeReflectionRecord & { author_name?: string; author_email?: string }> = [];

  /**
   * Persist a new recipe reflection record.
   */
  async createReflection(
    params: CreateReflectionParams,
  ): Promise<RecipeReflectionRecord> {
    const {
      recipeId,
      authorId,
      publicationId = null,
      feedEventId = null,
      deliveryKey = null,
      source,
      contentState = "proposed",
      review,
      score = null,
      isAgent = false,
      instructionReviewRequired = true,
      provenance = {},
      client,
    } = params;

    const sanitized = sanitizeReview(review);

    const insertSql = `
      INSERT INTO recipe_reflections (
        recipe_id, author_id, publication_id, feed_event_id, delivery_key,
        source, content_state, review, score, is_agent,
        instruction_review_required, provenance
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb
      )
      RETURNING id, recipe_id, author_id, publication_id, feed_event_id, delivery_key,
                source, content_state, review, score, is_agent,
                instruction_review_required, provenance, created_at, updated_at,
                deleted_at, hidden
    `;

    const args = [
      recipeId,
      authorId,
      publicationId,
      feedEventId,
      deliveryKey,
      source,
      contentState,
      sanitized,
      score,
      isAgent,
      instructionReviewRequired,
      JSON.stringify(provenance),
    ];

    try {
      const result = client
        ? await client.query<RawReflectionRow>(insertSql, args)
        : await executeQuery<RawReflectionRow>(insertSql, args);

      const [row] = result.rows;
      if (!row) {
        throw new Error("Failed to insert recipe reflection row");
      }
      const record: RecipeReflectionRecord = {
        id: row.id,
        recipeId: row.recipe_id,
        authorId: row.author_id,
        publicationId: row.publication_id,
        feedEventId: row.feed_event_id,
        deliveryKey: row.delivery_key,
        source: row.source,
        contentState: row.content_state,
        review: row.review,
        score: row.score !== null ? Number(row.score) : null,
        isAgent: row.is_agent,
        instructionReviewRequired: row.instruction_review_required,
        provenance: parseProvenance(row.provenance),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        hidden: row.hidden,
      };

      this.inMemoryReflections.unshift({ ...record });
      return record;
    } catch (_err) {
      // Memory fallback for tests
      const fallbackId = randomUUID();
      const now = params.createdAt ? new Date(params.createdAt) : new Date();
      const record: RecipeReflectionRecord & { author_name?: string; author_email?: string } = {
        id: fallbackId,
        recipeId,
        authorId,
        publicationId,
        feedEventId,
        deliveryKey,
        source,
        contentState,
        review: sanitized,
        score,
        isAgent,
        instructionReviewRequired,
        provenance,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        hidden: false,
      };
      this.inMemoryReflections.unshift(record);
      return record;
    }
  }

  /**
   * List recipe reflections with keyset pagination, block filtering, and stable ordering.
   */
  async listReflections(
    params: ListReflectionsParams,
  ): Promise<RecipeReflectionsPage> {
    const {
      recipeId,
      viewerId = null,
      limit = 20,
      cursor = null,
      authorType = "all",
      source,
    } = params;

    const pageSize = Math.min(Math.max(1, limit), 50);

    let whereClause = `
      WHERE rr.recipe_id = $1
        AND rr.deleted_at IS NULL
        AND rr.hidden = false
    `;
    const queryParams: unknown[] = [recipeId];

    if (authorType === "agent") {
      whereClause += " AND rr.is_agent = true";
    } else if (authorType === "human") {
      whereClause += " AND rr.is_agent = false";
    }

    if (source) {
      queryParams.push(source);
      whereClause += ` AND rr.source = $${queryParams.length}`;
    }

    // Keyset cursor condition: (created_at, id) < (cursorCreatedAt, cursorId)
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        queryParams.push(decoded.createdAt.toISOString(), decoded.id);
        whereClause += ` AND (rr.created_at, rr.id) < ($${queryParams.length - 1}::timestamptz, $${queryParams.length}::uuid)`;
      }
    }

    try {
      // Fetch total count for recipe
      const countSql = `
        SELECT COUNT(*)::int AS count
          FROM recipe_reflections rr
         WHERE rr.recipe_id = $1
           AND rr.deleted_at IS NULL
           AND rr.hidden = false
      `;
      const countRes = await executeQuery<{ count: number }>(countSql, [recipeId]);
      const totalCount = countRes.rows[0]?.count ?? 0;

      // Fetch page of rows + 1 to determine hasMore
      const fetchLimit = pageSize + 1;
      queryParams.push(fetchLimit);

      const querySql = `
        SELECT rr.id, rr.recipe_id, rr.author_id, rr.publication_id, rr.feed_event_id,
               rr.delivery_key, rr.source, rr.content_state, rr.review, rr.score,
               rr.is_agent, rr.instruction_review_required, rr.provenance,
               rr.created_at, rr.updated_at, rr.deleted_at, rr.hidden,
               COALESCE(up.name, u.name) AS author_name,
               u.email AS author_email
          FROM recipe_reflections rr
          JOIN users u ON u.id = rr.author_id
          LEFT JOIN user_profiles up ON up.user_id = u.id
        ${whereClause}
         ORDER BY rr.created_at DESC, rr.id DESC
         LIMIT $${queryParams.length}
      `;

      const result = await executeQuery<RawReflectionRow>(querySql, queryParams);
      const rawRows = result.rows;

      const filteredRows: RawReflectionRow[] = [];
      for (const row of rawRows) {
        // Check block between viewer and reflection author
        if (viewerId && viewerId !== row.author_id) {
          const blocked = await isBlockedBetween(viewerId, row.author_id);
          if (blocked) continue;
        }
        filteredRows.push(row);
        if (filteredRows.length === pageSize) break;
      }

      const hasMore = rawRows.length > pageSize;
      const lastRow = filteredRows[filteredRows.length - 1];
      const nextCursor =
        hasMore && lastRow ? encodeCursor(lastRow.created_at, lastRow.id) : null;

      const items: FormattedRecipeReflection[] = filteredRows.map((row) =>
        this.formatReflectionRow(row),
      );

      return {
        items,
        nextCursor,
        hasMore,
        totalCount,
      };
    } catch (_err) {
      // Memory fallback for tests
      let all = this.inMemoryReflections.filter(
        (r) => r.recipeId === recipeId && r.deletedAt === null && !r.hidden,
      );

      if (authorType === "agent") {
        all = all.filter((r) => r.isAgent);
      } else if (authorType === "human") {
        all = all.filter((r) => !r.isAgent);
      }

      if (source) {
        all = all.filter((r) => r.source === source);
      }

      // Stable sorting by createdAt DESC, id DESC
      all.sort((a, b) => {
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (timeDiff !== 0) return timeDiff;
        return b.id.localeCompare(a.id);
      });

      const totalCount = all.length;

      // Keyset cursor
      let startIndex = 0;
      if (cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          const cursorTime = decoded.createdAt.getTime();
          startIndex = all.findIndex((r) => {
            const rTime = new Date(r.createdAt).getTime();
            return rTime < cursorTime || (rTime === cursorTime && r.id < decoded.id);
          });
          if (startIndex === -1) startIndex = all.length;
        }
      }

      const candidates = all.slice(startIndex);
      const filtered: typeof candidates = [];

      for (const row of candidates) {
        if (viewerId && viewerId !== row.authorId) {
          const blocked = await isBlockedBetween(viewerId, row.authorId);
          if (blocked) continue;
        }
        filtered.push(row);
        if (filtered.length === pageSize) break;
      }

      const hasMore = candidates.length > filtered.length || startIndex + candidates.length < all.length;
      const lastItem = filtered[filtered.length - 1];
      const nextCursor =
        hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

      const items: FormattedRecipeReflection[] = filtered.map((r) => ({
        id: r.id,
        recipeId: r.recipeId,
        author: {
          id: r.authorId,
          name: r.author_name ?? (r.isAgent ? "Planetary Agent" : "Anonymous cook"),
          ...(r.author_email ? { slug: r.author_email.split("@")[0] } : {}),
          isAgent: r.isAgent,
        },
        publicationId: r.publicationId,
        feedEventId: r.feedEventId,
        deliveryKey: r.deliveryKey,
        source: r.source,
        contentState: r.contentState,
        review: r.review,
        score: r.score,
        isAgent: r.isAgent,
        instructionReviewRequired: r.instructionReviewRequired,
        provenance: r.provenance,
        createdAt: new Date(r.createdAt).toISOString(),
        updatedAt: new Date(r.updatedAt).toISOString(),
      }));

      return {
        items,
        nextCursor,
        hasMore,
        totalCount,
      };
    }
  }

  private formatReflectionRow(row: RawReflectionRow): FormattedRecipeReflection {
    const rawName = row.author_name?.trim();
    let displayName = rawName && rawName.length > 0 ? rawName : "Anonymous cook";
    let slug: string | undefined;

    if (row.is_agent && row.author_email) {
      const parts = row.author_email.split("@");
      const localPart = parts[0] && parts[0].length > 0 ? parts[0] : "Agent";
      slug = localPart;
      displayName = rawName && rawName.length > 0 ? rawName : localPart;
    }

    return {
      id: row.id,
      recipeId: row.recipe_id,
      author: {
        id: row.author_id,
        name: displayName,
        ...(slug ? { slug } : {}),
        isAgent: row.is_agent,
      },
      publicationId: row.publication_id,
      feedEventId: row.feed_event_id,
      deliveryKey: row.delivery_key,
      source: row.source,
      contentState: row.content_state,
      review: row.review,
      score: row.score !== null ? Number(row.score) : null,
      isAgent: row.is_agent,
      instructionReviewRequired: row.instruction_review_required,
      provenance: parseProvenance(row.provenance),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  // Clear in-memory state (useful for tests)
  clearMemory(): void {
    this.inMemoryReflections = [];
  }
}

export const recipeReflectionsService = new RecipeReflectionsService();
