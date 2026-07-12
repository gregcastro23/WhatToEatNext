"use client";

/**
 * Client-side table-chat dual-write (mirrors liveFeedPublish.ts): when a
 * message lands in canonical Postgres (via POST /api/chat/.../messages → 200),
 * the CLIENT publishes it to the live `table_chat_message` mirror so connected
 * clients see it instantly, carrying the canonical `message_uuid` for
 * reconciliation.
 *
 * Deliberately client-side, NOT a server dual-write: the module stamps
 * `sender = ctx.sender`, so the mirror row must be posted over the *user's own*
 * SpacetimeDB connection for the identity (and the presence-derived
 * sender_name) to be correct.
 *
 * Fire-and-forget: Postgres is the source of truth; a failed live publish only
 * costs instant delivery (the 10s poll still picks it up), and unmatched live
 * rows are dropped by the reconcile logic after 30s.
 *
 * SAFETY BOUNDARY (docs/plans/pr3-messaging-plan.md §0): this helper is the
 * ONLY chat→Spacetime path, and it is called ONLY for kind='table'. DM and
 * circle bodies must never reach SpacetimeDB's world-readable tables — callers
 * MUST gate on the conversation kind before invoking this.
 */

import type { DbConnection } from "@/lib/spacetime/generated";

const BODY_MAX = 2_000;
const UUID_MAX = 64;

export function publishLiveTableChatMessage(
  connection: DbConnection,
  message: {
    wtenTableId: string;
    messageUuid: string;
    body: string;
    replyToUuid?: string;
  },
): void {
  try {
    void connection.reducers
      .sendTableChatMessage({
        wtenTableId: message.wtenTableId.slice(0, UUID_MAX),
        messageUuid: message.messageUuid.slice(0, UUID_MAX),
        body: message.body.slice(0, BODY_MAX),
        replyToUuid: (message.replyToUuid ?? "").slice(0, UUID_MAX),
      })
      .catch(() => {
        // Live publish is best-effort; the poll remains authoritative.
      });
  } catch {
    // Connection raced a disconnect.
  }
}

/** Best-effort live tombstone when a message is deleted in Postgres. */
export function publishLiveTableChatDelete(
  connection: DbConnection,
  chatId: bigint,
): void {
  try {
    void connection.reducers.deleteTableChatMessage({ chatId }).catch(() => {});
  } catch {
    // Connection raced a disconnect.
  }
}
