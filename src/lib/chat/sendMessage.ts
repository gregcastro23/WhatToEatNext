/**
 * The server-side send pipeline (docs/plans/pr3-messaging-plan.md §3):
 * gathers the facts, runs the pure enforcement chain, stores the photo,
 * inserts idempotently, then hands off to notifications and practices.
 *
 * SAFETY BOUNDARY: this module NEVER touches SpacetimeDB. Table-chat live
 * mirroring is client-side only (src/lib/spacetime/liveTableChatPublish.ts),
 * fired by the client AFTER this pipeline returns 200 — and only for
 * kind='table'. DM/circle bodies must never reach Spacetime's world-readable
 * tables.
 */

import {
  checkPhotoDataUrl,
  checkSend,
  sanitizeBody,
} from "@/lib/chat/enforcement";
import { isCirclesEnabledServer, isDmsEnabledServer } from "@/lib/chat/flags";
import { storeChatPhoto } from "@/lib/feed/cookPhotoStorage";
import { _logger } from "@/lib/logger";
import { chatDatabase } from "@/services/chatDatabaseService";
import type {
  ChatAttachment,
  ChatMessage,
  ConversationRecord,
} from "@/types/chat";

export interface SendChatMessageInput {
  conversationId: string;
  senderId: string;
  body: string;
  clientKey?: string;
  replyToId?: string;
  attachmentDataUrl?: string;
}

export type SendChatMessageOutcome =
  | {
      ok: true;
      message: ChatMessage;
      conversation: ConversationRecord;
      /** True when the clientKey matched an earlier insert (retry). */
      replay: boolean;
    }
  | { ok: false; status: number; message: string };

/** The DM counterpart of a sender (undefined for table/circle kinds). */
export function dmCounterpart(
  conversation: Pick<ConversationRecord, "kind" | "dmUserLo" | "dmUserHi">,
  senderId: string,
): string | undefined {
  if (conversation.kind !== "dm") return undefined;
  return conversation.dmUserLo === senderId ? conversation.dmUserHi : conversation.dmUserLo;
}

export async function sendChatMessage(
  input: SendChatMessageInput,
): Promise<SendChatMessageOutcome> {
  const conversation = await chatDatabase.getConversationById(input.conversationId);
  if (!conversation) {
    return { ok: false, status: 404, message: "Conversation not found" };
  }

  const membership = await chatDatabase.getMembership(input.conversationId, input.senderId);

  // Relationship facts only matter for DMs (table/circle blocks are read-path).
  let blockedWithCounterpart = false;
  let dmAccepted = false;
  if (conversation.kind === "dm") {
    const other = dmCounterpart(conversation, input.senderId);
    if (!other) {
      return { ok: false, status: 404, message: "Conversation not found" };
    }
    blockedWithCounterpart = await chatDatabase.isBlockedBetween(input.senderId, other);
    dmAccepted = await chatDatabase.hasAcceptedCommensalship(input.senderId, other);
  }

  // Attachment: validate shape/size, then persist to R2 (chat-photos/<userId>/).
  const attachments: ChatAttachment[] = [];
  if (input.attachmentDataUrl) {
    if (!checkPhotoDataUrl(input.attachmentDataUrl)) {
      return {
        ok: false,
        status: 400,
        message: "Photos must be JPEG, PNG, or WebP and at most 5MB.",
      };
    }
    const url = await storeChatPhoto(input.senderId, input.attachmentDataUrl);
    if (!url) {
      return { ok: false, status: 503, message: "Photo upload is unavailable right now." };
    }
    attachments.push({ type: "photo", url });
  }

  // Reply target must live in the same conversation.
  let replyTargetConversationId: string | null | undefined;
  if (input.replyToId) {
    replyTargetConversationId = await chatDatabase.getMessageConversationId(input.replyToId);
  }

  const body = sanitizeBody(input.body ?? "");
  const decision = checkSend({
    conversation,
    membership: membership
      ? {
          leftAt: membership.leftAt,
          banned: membership.banned,
          mutedByHostUntil: membership.mutedByHostUntil,
        }
      : null,
    relationship: { blockedWithCounterpart, dmAccepted },
    flags: { dmsEnabled: isDmsEnabledServer(), circlesEnabled: isCirclesEnabledServer() },
    body,
    attachments,
    replyTargetConversationId,
    conversationId: conversation.id,
  });
  if (!decision.allowed) {
    return { ok: false, status: decision.status, message: decision.message };
  }

  const inserted = await chatDatabase.insertMessage({
    conversationId: conversation.id,
    senderId: input.senderId,
    body,
    attachments,
    replyToId: input.replyToId,
    clientKey: input.clientKey,
  });
  if (!inserted) {
    return { ok: false, status: 500, message: "Message could not be sent." };
  }

  if (!inserted.replay) {
    // Post-insert hooks are best-effort: the message already landed.
    try {
      await afterMessageInserted(conversation, inserted.message);
    } catch (error) {
      _logger.warn("chat post-insert hooks failed (non-blocking):", error);
    }
  }

  return {
    ok: true,
    message: inserted.message,
    conversation,
    replay: inserted.replay,
  };
}

/**
 * Post-insert seam: notification fan-out (plan §6) and practice recognition
 * (plan §7). Fire-and-forget — the message already landed.
 */
async function afterMessageInserted(
  conversation: ConversationRecord,
  message: ChatMessage,
): Promise<void> {
  // TABLE chat emits NO notification rows — its badge is /api/chat/unread
  // (plan §6). DM/circle notify their recipients with the one-row-per-
  // (recipient, conversation) dedup upsert.
  if (conversation.kind === "table") return;

  const { chatDatabase } = await import("@/services/chatDatabaseService");
  const { notificationDatabase } = await import("@/services/notificationDatabaseService");

  const recipients = await chatDatabase.getNotifiableRecipients(
    conversation.id,
    message.senderId,
  );
  if (recipients.length === 0) return;

  const type = conversation.kind === "dm" ? "dm_message" : "circle_message";
  const title = conversation.kind === "dm" ? "New message" : conversation.title || "New message";
  const preview = messagePreview(message);

  await Promise.all(
    recipients.map((recipient) =>
      notificationDatabase
        .createOrBumpEventNotification(recipient.userId, type, conversation.id, {
          title,
          message: preview,
          relatedUserId: message.senderId,
          metadata: { conversationId: conversation.id, conversationKind: conversation.kind },
        })
        .catch(() => {}),
    ),
  );
}

/** A short, body-free-safe preview line (photos read as an attachment note). */
function messagePreview(message: ChatMessage): string {
  const body = message.body.trim();
  if (body) return body.slice(0, 140);
  if (message.attachments.some((a) => a.type === "photo")) return "Sent a photo";
  return "New message";
}
