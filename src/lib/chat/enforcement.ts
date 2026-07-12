/**
 * Send-enforcement chain for messaging (docs/plans/pr3-messaging-plan.md §3).
 *
 * Pure decision functions — no I/O. The route/service layer gathers the facts
 * (membership row, conversation row, block/commensal lookups, flags) and this
 * module decides, so every rule is unit-testable without a database.
 *
 * Chain order (each step names the earliest failure):
 *   auth → active membership (not left/banned) → host-mute → not archived →
 *   blocks BOTH directions → DM gate (accepted commensals only) →
 *   content caps (2000 chars, control chars stripped, 1 photo ≤5MB,
 *   same-conversation reply) → flag gates (server CHAT_DMS_ENABLED /
 *   CHAT_CIRCLES_ENABLED).
 *
 * SAFETY BOUNDARY (plan §0): nothing in this module — or anywhere in the
 * server chat path — touches SpacetimeDB. DM and circle bodies must never be
 * written to Spacetime's world-readable tables; only the CLIENT mirrors
 * table-chat bodies after a Postgres 200 (src/lib/spacetime/liveTableChatPublish.ts).
 */

import type {
  ChatAttachment,
  ConversationKind,
  ConversationMembership,
  ConversationRecord,
} from "@/types/chat";

export const MAX_BODY_CHARS = 2000;
export const MAX_ATTACHMENTS = 1;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_CLIENT_KEY_CHARS = 64;
export const MAX_REPORT_DETAIL_CHARS = 1000;
/** flagged_count at which a message auto-hides pending review. */
export const AUTO_HIDE_REPORT_COUNT = 3;

/** Neutral wording for every block-related denial — never reveals who blocked whom. */
export const NEUTRAL_UNAVAILABLE_MESSAGE = "This conversation is not available.";

export interface SendDenial {
  allowed: false;
  /** HTTP status the route should return. */
  status: 400 | 403 | 409;
  /** User-facing message (neutral for block denials). */
  message: string;
  /** Stable machine reason for tests/telemetry. */
  reason:
    | "not_member"
    | "left"
    | "banned"
    | "host_muted"
    | "archived"
    | "blocked"
    | "dm_not_commensal"
    | "kind_disabled"
    | "empty_body"
    | "body_too_long"
    | "too_many_attachments"
    | "bad_reply";
}

export type SendDecision = { allowed: true } | SendDenial;

const deny = (
  status: SendDenial["status"],
  reason: SendDenial["reason"],
  message: string,
): SendDenial => ({ allowed: false, status, reason, message });

/**
 * Strip C0/C1 control characters (keeping \n and \t) and trim. Zero-width
 * direction marks are left alone — they're legitimate in RTL text.
 */
export function sanitizeBody(raw: string): string {
  let out = "";
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = (code < 0x20 && ch !== "\n" && ch !== "\t") || (code >= 0x7f && code <= 0x9f);
    if (!isControl) out += ch;
  }
  return out.trim();
}

/** Validate an already-sanitized body against the caps. */
export function checkBody(body: string, hasAttachment: boolean): SendDecision {
  if (body.length === 0 && !hasAttachment) {
    return deny(400, "empty_body", "Say something first.");
  }
  if (body.length > MAX_BODY_CHARS) {
    return deny(400, "body_too_long", `Messages are capped at ${MAX_BODY_CHARS} characters.`);
  }
  return { allowed: true };
}

/**
 * Validate a photo attachment data URL shape and size WITHOUT decoding it —
 * base64 length bounds the byte size (bytes ≈ chars * 3/4).
 */
export function checkPhotoDataUrl(dataUrl: string): boolean {
  const match = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return false;
  const approxBytes = (match[1].length * 3) / 4;
  return approxBytes > 0 && approxBytes <= MAX_PHOTO_BYTES;
}

export function checkAttachments(attachments: ChatAttachment[]): SendDecision {
  if (attachments.length > MAX_ATTACHMENTS) {
    return deny(400, "too_many_attachments", "One photo per message.");
  }
  return { allowed: true };
}

export interface MembershipFacts {
  /** Null when the sender has no conversation_members row at all. */
  membership: Pick<
    ConversationMembership,
    "leftAt" | "banned" | "mutedByHostUntil"
  > | null;
  now?: Date;
}

/** Steps 2–3: active membership, then host-mute. */
export function checkMembership(facts: MembershipFacts): SendDecision {
  const { membership } = facts;
  const now = facts.now ?? new Date();
  if (!membership) {
    return deny(403, "not_member", NEUTRAL_UNAVAILABLE_MESSAGE);
  }
  if (membership.banned) {
    return deny(403, "banned", NEUTRAL_UNAVAILABLE_MESSAGE);
  }
  if (membership.leftAt) {
    return deny(403, "left", NEUTRAL_UNAVAILABLE_MESSAGE);
  }
  if (
    membership.mutedByHostUntil &&
    new Date(membership.mutedByHostUntil).getTime() > now.getTime()
  ) {
    return deny(403, "host_muted", "The host has muted you in this conversation for now.");
  }
  return { allowed: true };
}

/** Step 4: archived conversations are read-only. */
export function checkNotArchived(
  conversation: Pick<ConversationRecord, "archivedAt">,
): SendDecision {
  if (conversation.archivedAt) {
    return deny(409, "archived", "This conversation is archived.");
  }
  return { allowed: true };
}

export interface RelationshipFacts {
  kind: ConversationKind;
  /**
   * True when ANY blocked commensalship exists between the sender and ANY
   * other DM participant, in EITHER direction (plan §3: blocks are
   * bidirectional for sending).
   */
  blockedWithCounterpart: boolean;
  /** DM gate: sender and counterpart have an accepted commensalship. */
  dmAccepted: boolean;
}

/**
 * Steps 5–6: blocks, then the DM accepted-commensals gate.
 *
 * Blocks: for DMs the send is denied outright (neutral message). For table/
 * circle kinds the send is ALLOWED — the block is enforced on the read path
 * (the blocker's list filters blocked senders) so a block never reveals
 * itself to the room.
 */
export function checkRelationship(facts: RelationshipFacts): SendDecision {
  if (facts.kind === "dm") {
    if (facts.blockedWithCounterpart) {
      return deny(403, "blocked", NEUTRAL_UNAVAILABLE_MESSAGE);
    }
    if (!facts.dmAccepted) {
      return deny(403, "dm_not_commensal", "Direct messages are between linked companions.");
    }
  }
  return { allowed: true };
}

export interface FlagFacts {
  kind: ConversationKind;
  dmsEnabled: boolean;
  circlesEnabled: boolean;
}

/** Step 7: server-side kind gates. Table chat is never flag-gated server-side. */
export function checkKindEnabled(facts: FlagFacts): SendDecision {
  if (facts.kind === "dm" && !facts.dmsEnabled) {
    return deny(403, "kind_disabled", "Direct messages are not open yet.");
  }
  if (facts.kind === "circle" && !facts.circlesEnabled) {
    return deny(403, "kind_disabled", "Circles are not open yet.");
  }
  return { allowed: true };
}

export interface SendCheckInput {
  conversation: Pick<ConversationRecord, "kind" | "archivedAt">;
  membership: MembershipFacts["membership"];
  relationship: Omit<RelationshipFacts, "kind">;
  flags: Omit<FlagFacts, "kind">;
  body: string;
  attachments: ChatAttachment[];
  /** Reply target's conversation id, when replying (null = not found). */
  replyTargetConversationId?: string | null;
  conversationId: string;
  now?: Date;
}

/**
 * The full chain in plan order. The first failing step wins so the caller
 * returns one precise denial.
 */
export function checkSend(input: SendCheckInput): SendDecision {
  const membership = checkMembership({ membership: input.membership, now: input.now });
  if (!membership.allowed) return membership;

  const archived = checkNotArchived(input.conversation);
  if (!archived.allowed) return archived;

  const relationship = checkRelationship({
    kind: input.conversation.kind,
    ...input.relationship,
  });
  if (!relationship.allowed) return relationship;

  const kindEnabled = checkKindEnabled({
    kind: input.conversation.kind,
    ...input.flags,
  });
  if (!kindEnabled.allowed) return kindEnabled;

  const attachments = checkAttachments(input.attachments);
  if (!attachments.allowed) return attachments;

  const body = checkBody(input.body, input.attachments.length > 0);
  if (!body.allowed) return body;

  if (input.replyTargetConversationId !== undefined) {
    if (
      input.replyTargetConversationId === null ||
      input.replyTargetConversationId !== input.conversationId
    ) {
      return deny(400, "bad_reply", "That message can't be replied to here.");
    }
  }

  return { allowed: true };
}
