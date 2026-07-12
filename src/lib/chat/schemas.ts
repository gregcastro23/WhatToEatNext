/**
 * Zod schemas + cursor codec for the /api/chat namespace
 * (docs/plans/pr3-messaging-plan.md §3).
 */

import { z } from "zod";
import { MAX_CLIENT_KEY_CHARS, MAX_REPORT_DETAIL_CHARS } from "@/lib/chat/enforcement";

const uuid = z.string().uuid();

/** POST /api/chat/conversations — ensure/create by kind. */
export const ensureConversationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("table"),
    /** Postgres tables.id (Reconciliation 1 — NOT a Spacetime session id). */
    tableId: uuid,
  }),
  z.object({
    kind: z.literal("dm"),
    otherUserId: uuid,
  }),
  z.object({
    kind: z.literal("circle"),
    title: z.string().trim().min(1).max(120),
    memberIds: z.array(uuid).max(23).default([]),
  }),
]);

/** POST /api/chat/conversations/[id]/messages */
export const sendMessageSchema = z.object({
  // Pre-sanitization bound only — the enforcement chain applies the real
  // 2000-char cap AFTER control-char stripping.
  body: z.string().max(4000).default(""),
  clientKey: z
    .string()
    .regex(/^[A-Za-z0-9_.:-]{1,64}$/)
    .max(MAX_CLIENT_KEY_CHARS)
    .optional(),
  replyToId: uuid.optional(),
  /** One photo, ≤5MB decoded — validated by checkPhotoDataUrl. */
  attachmentDataUrl: z.string().max(8_000_000).optional(),
});

/** POST /api/chat/conversations/[id]/read */
export const markReadSchema = z.object({
  messageId: uuid.optional(),
});

/** POST /api/chat/conversations/[id]/mute — per-user notification level. */
export const muteSchema = z.object({
  notifyLevel: z.enum(["all", "mentions", "none"]),
});

/** POST /api/chat/conversations/[id]/moderate — host-only. */
export const moderateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("kick"),
    userId: uuid,
  }),
  z.object({
    action: z.literal("mute"),
    userId: uuid,
    /** Mute window in minutes (default 60, max 7 days). */
    minutes: z.number().int().min(1).max(10_080).default(60),
  }),
  z.object({
    action: z.literal("unmute"),
    userId: uuid,
  }),
  z.object({
    action: z.literal("archive"),
  }),
]);

/** POST /api/chat/messages/[id]/report */
export const reportSchema = z.object({
  reason: z.enum(["spam", "harassment", "inappropriate", "other"]),
  detail: z.string().trim().max(MAX_REPORT_DETAIL_CHARS).optional(),
});

/** POST /api/chat/spacetime-identity */
export const bindIdentitySchema = z.object({
  identityHex: z.string().trim().min(8).max(66),
});

/** PATCH /api/admin/chat/reports/[id] */
export const resolveReportSchema = z.object({
  status: z.enum(["reviewed", "dismissed", "actioned"]),
});

// ─── Keyset cursor: base64("createdAtIso|messageId") ─────────────────────

export interface MessageCursor {
  createdAt: string;
  id: string;
}

export function encodeCursor(cursor: MessageCursor): string {
  return Buffer.from(`${cursor.createdAt}|${cursor.id}`, "utf8").toString("base64url");
}

export function decodeCursor(raw: string | null): MessageCursor | null {
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const sep = decoded.lastIndexOf("|");
    if (sep <= 0) return null;
    const createdAt = decoded.slice(0, sep);
    const id = decoded.slice(sep + 1);
    if (Number.isNaN(new Date(createdAt).getTime())) return null;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}
