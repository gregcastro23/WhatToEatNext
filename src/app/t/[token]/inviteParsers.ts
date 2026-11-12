/**
 * Wire parsers for the two table-invite calls `/t/[token]` makes.
 *
 * GET /api/table-invites/[token] (src/app/api/table-invites/[token]/route.ts:30-33)
 *   answers `{ success: true, preview }` on 200 and `{ success: false, message }`
 *   on 404/429/500. The page returns early on `!res.ok`, so only a 200 reaches
 *   {@link parseInvitePreviewBody}. `preview` is built by
 *   `getInvitePreview` (src/services/tableDatabaseService.ts:1176-1183):
 *   `tableTitle`, `hostName` ("Someone" when unknown), `scheduledAt` (ISO
 *   string), `joinedCount` and `valid` are ALWAYS present; `venueName` is
 *   present only when non-empty. Every field the card renders is validated.
 *
 * POST /api/table-invites/[token]/redeem
 *   (src/app/api/table-invites/[token]/redeem/route.ts:36-102) answers
 *   `{ success: true, tableId, alreadyMember }` on success and
 *   `{ success: false, message }` on every refusal (401/400/404/409/410/500);
 *   the 429 from `rateLimit` (src/lib/rateLimit.ts:159-166) carries
 *   `{ error, message }`. The page reads only `success`, `tableId`, `message`,
 *   so only those are kept, each only when it has the type the page reads it as.
 *
 * Both parsers throw on a body that is not a JSON object. The page calls them
 * inside its existing try/catch, so a malformed body lands in the page's own
 * failure branch instead of being read as "invite not found / unusable".
 *
 * @file src/app/t/[token]/inviteParsers.ts
 */

import { isJsonRecord } from "@/lib/api/json";
import type { TableInvitePreview } from "@/types/table";

export interface InvitePreviewBody {
  preview?: TableInvitePreview;
}

export interface RedeemInviteBody {
  success?: boolean;
  tableId?: string;
  message?: string;
}

function parseInvitePreview(value: unknown): TableInvitePreview {
  if (!isJsonRecord(value)) {
    throw new TypeError("Invite preview must be a JSON object");
  }
  const { tableTitle, hostName, scheduledAt, venueName, joinedCount, valid } = value;
  if (typeof tableTitle !== "string") {
    throw new TypeError("Invite preview tableTitle must be a string");
  }
  if (typeof hostName !== "string") {
    throw new TypeError("Invite preview hostName must be a string");
  }
  if (typeof scheduledAt !== "string") {
    throw new TypeError("Invite preview scheduledAt must be a string");
  }
  if (typeof joinedCount !== "number" || !Number.isFinite(joinedCount)) {
    throw new TypeError("Invite preview joinedCount must be a number");
  }
  if (typeof valid !== "boolean") {
    throw new TypeError("Invite preview valid must be a boolean");
  }
  return {
    tableTitle,
    hostName,
    scheduledAt,
    ...(typeof venueName === "string" ? { venueName } : {}),
    joinedCount,
    valid,
  };
}

/**
 * `parse` for `readJson` on `GET /api/table-invites/[token]`. A missing or
 * `null` `preview` parses to `{}` (the page shows "not found"); a `preview`
 * that is present but malformed throws.
 */
export function parseInvitePreviewBody(value: unknown): InvitePreviewBody {
  if (!isJsonRecord(value)) {
    throw new TypeError("Invite preview response must be a JSON object");
  }
  const { preview } = value;
  if (preview === undefined || preview === null) return {};
  return { preview: parseInvitePreview(preview) };
}

/**
 * `parse` for `readJson` on `POST /api/table-invites/[token]/redeem`. Fields of
 * the wrong type are dropped, so the page's `!success || !tableId` check treats
 * them as a refusal (and shows its default message when `message` is dropped).
 */
export function parseRedeemInviteBody(value: unknown): RedeemInviteBody {
  if (!isJsonRecord(value)) {
    throw new TypeError("Redeem response must be a JSON object");
  }
  const { success, tableId, message } = value;
  return {
    ...(typeof success === "boolean" ? { success } : {}),
    ...(typeof tableId === "string" ? { tableId } : {}),
    ...(typeof message === "string" ? { message } : {}),
  };
}
