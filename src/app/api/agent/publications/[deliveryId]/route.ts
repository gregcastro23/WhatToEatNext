/**
 * Agent Publication Receipt & Reconciliation API
 *
 * GET  /api/agent/publications/[deliveryId] - Retrieve durable publication receipt.
 * POST /api/agent/publications/[deliveryId] - Narrowly reconcile partial outcomes.
 *
 * Scoped to authenticated integration principal (INTERNAL_API_SECRET).
 *
 * @file src/app/api/agent/publications/[deliveryId]/route.ts
 */

import { NextResponse } from "next/server";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import { agentPublicationService } from "@/services/agentPublicationService";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(authHeader: string | null): boolean {
  return bearerMatches(authHeader, process.env.INTERNAL_API_SECRET);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> },
) {
  if (!isAuthorized(request.headers.get("Authorization"))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { deliveryId } = await params;
  if (!deliveryId || deliveryId.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "deliveryId is required" },
      { status: 400 },
    );
  }

  try {
    const publication = await agentPublicationService.getReceiptByDeliveryKey(
      "internal_api_secret",
      deliveryId.trim(),
    );

    if (!publication) {
      return NextResponse.json(
        {
          success: false,
          error: "Publication not found",
          deliveryId: deliveryId.trim(),
        },
        { status: 404 },
      );
    }

    const receiptPayload = publication.receipt_payload;
    const commentSaved =
      publication.recipe_comment_status === "saved" || receiptPayload?.recipeCommentSaved === true
        ? true
        : publication.recipe_comment_status === "not_requested"
          ? undefined
          : false;

    return NextResponse.json({
      success: publication.status === "completed",
      contractVersion: "1.0",
      deliveryId: publication.delivery_key,
      publicationId: publication.id,
      principalId: publication.principal_id,
      operation: publication.operation,
      status: publication.status,
      feedPublished: publication.feed_published,
      feedEventId: publication.feed_event_id,
      recipeCommentStatus: publication.recipe_comment_status,
      ...(commentSaved !== undefined ? { recipeCommentSaved: commentSaved } : {}),
      recipeReflectionId: publication.recipe_reflection_id,
      menuId: publication.menu_id,
      legacyInteractionStatus: publication.legacy_interaction_status,
      event: receiptPayload.event ?? (publication.feed_event_id ? { id: publication.feed_event_id } : undefined),
      recipeReflection: receiptPayload.recipeReflection ?? (publication.recipe_reflection_id ? { id: publication.recipe_reflection_id } : undefined),
      menu: receiptPayload.menu ?? (publication.menu_id ? { id: publication.menu_id } : undefined),
      receipt: publication.receipt_payload,
      createdAt: publication.created_at,
      updatedAt: publication.updated_at,
    });
  } catch (error) {
    _logger.error("[agent/publications GET] Error retrieving receipt:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load publication receipt" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> },
) {
  if (!isAuthorized(request.headers.get("Authorization"))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { deliveryId } = await params;
  if (!deliveryId || deliveryId.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "deliveryId is required" },
      { status: 400 },
    );
  }

  try {
    const publication = await agentPublicationService.getReceiptByDeliveryKey(
      "internal_api_secret",
      deliveryId.trim(),
    );

    if (!publication) {
      return NextResponse.json(
        { success: false, error: "Publication not found to reconcile", deliveryId },
        { status: 404 },
      );
    }

    // Reconcile: If feed event or menu or reflection exists, update publication without duplicate feed rows
    let feedEventId = publication.feed_event_id;
    let feedPublished = publication.feed_published;

    if (!feedEventId) {
      try {
        const feedCheck = await executeQuery<{ id: string }>(
          `SELECT id FROM feed_events WHERE metadata_payload->>'deliveryId' = $1 OR metadata_payload->>'idempotencyKey' = $1 LIMIT 1`,
          [deliveryId],
        );
        if (feedCheck.rows[0]) {
          feedEventId = feedCheck.rows[0].id;
          feedPublished = true;
        }
      } catch {
        // DB query error caught safely
      }
    }

    let recipeReflectionId = publication.recipe_reflection_id;
    let recipeCommentStatus = publication.recipe_comment_status;

    if (!recipeReflectionId) {
      try {
        const refCheck = await executeQuery<{ id: string }>(
          `SELECT id FROM recipe_reflections WHERE delivery_key = $1 OR publication_id = $2 LIMIT 1`,
          [deliveryId, publication.id],
        );
        if (refCheck.rows[0]) {
          recipeReflectionId = refCheck.rows[0].id;
          recipeCommentStatus = "saved";
        }
      } catch {
        // DB query error caught safely
      }
    }

    const commentSaved =
      recipeCommentStatus === "saved"
        ? true
        : recipeCommentStatus === "not_requested"
          ? undefined
          : false;

    const reconciledReceipt = {
      ...publication.receipt_payload,
      success: true,
      deliveryId: publication.delivery_key,
      publicationId: publication.id,
      feedPublished,
      ...(feedEventId ? { event: { id: feedEventId } } : {}),
      recipeCommentStatus,
      ...(commentSaved !== undefined ? { recipeCommentSaved: commentSaved } : {}),
      ...(recipeReflectionId ? { recipeReflectionId } : {}),
      reconciled: true,
    };

    await agentPublicationService.completePublication({
      publicationId: publication.id,
      feedEventId,
      recipeReflectionId,
      menuId: publication.menu_id,
      feedPublished,
      recipeCommentStatus,
      legacyInteractionStatus: publication.legacy_interaction_status,
      receiptPayload: reconciledReceipt,
    });

    return NextResponse.json({
      success: true,
      contractVersion: "1.0",
      reconciled: true,
      deliveryId: publication.delivery_key,
      publicationId: publication.id,
      status: "completed",
      feedPublished,
      feedEventId,
      recipeCommentStatus,
      ...(commentSaved !== undefined ? { recipeCommentSaved: commentSaved } : {}),
      recipeReflectionId,
      menuId: publication.menu_id,
      legacyInteractionStatus: publication.legacy_interaction_status,
      receipt: reconciledReceipt,
    });
  } catch (error) {
    _logger.error("[agent/publications POST reconcile] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reconcile publication" },
      { status: 500 },
    );
  }
}
