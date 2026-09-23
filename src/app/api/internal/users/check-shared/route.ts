/**
 * POST /api/internal/users/check-shared
 *
 * Checks which emails from a provided list exist in WhatToEatNext.
 * Used by Planetary Agents (alchm-agents-solana) to identify shared users.
 *
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 *
 * Body:
 *   { emails: string[] }
 *
 * Response:
 *   { success: true, sharedEmails: string[] }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BATCH_SIZE = 1_000;

const checkSharedSchema = z.object({
  emails: z
    .array(z.string())
    .max(MAX_BATCH_SIZE, `Batch size exceeds limit of ${MAX_BATCH_SIZE} emails`),
});

function normalizeEmails(rawEmails: string[]): string[] {
  const cleanEmails: string[] = [];
  for (const item of rawEmails) {
    if (typeof item === "string" && item.trim().length > 0) {
      cleanEmails.push(item.trim().toLowerCase());
    }
  }
  return cleanEmails;
}

async function querySharedEmails(cleanEmails: string[]): Promise<string[]> {
  const res = await executeQuery<{ email: string }>(
    `SELECT DISTINCT LOWER(email) AS email
       FROM users
      WHERE LOWER(email) = ANY($1::text[])`,
    [cleanEmails],
  );
  return res.rows.map((r) => r.email);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
  const syncHeader = request.headers.get("x-sync-secret");

  if (!safeEqual(syncHeader, syncSecret)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = checkSharedSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const isBatchError = parseResult.error.issues.some((issue) =>
      issue.message.includes("Batch size exceeds limit"),
    );
    return NextResponse.json(
      {
        success: false,
        error: isBatchError
          ? `Batch size exceeds limit of ${MAX_BATCH_SIZE} emails`
          : "Body must contain an 'emails' array",
      },
      { status: 400 },
    );
  }

  const cleanEmails = normalizeEmails(parseResult.data.emails);
  if (cleanEmails.length === 0) {
    return NextResponse.json({ success: true, sharedEmails: [] });
  }

  try {
    const sharedEmails = await querySharedEmails(cleanEmails);
    return NextResponse.json({ success: true, sharedEmails });
  } catch (error) {
    _logger.error("[POST /api/internal/users/check-shared] Query failed:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
