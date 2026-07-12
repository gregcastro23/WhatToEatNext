/**
 * Messaging domain types (docs/plans/pr3-messaging-plan.md).
 *
 * One Postgres data model, three conversation kinds:
 * - 'table'  — the Table's discussion; subject_ref = tables.id (UUID as text,
 *              docs/plans/tables-program-sequencing.md Reconciliation 1).
 *              Bodies MAY mirror into SpacetimeDB for live delivery.
 * - 'dm'     — canonicalized 1:1 (dm_user_lo < dm_user_hi). Bodies MUST NOT
 *              enter SpacetimeDB (world-readable tables).
 * - 'circle' — small named group. Bodies MUST NOT enter SpacetimeDB.
 *
 * Agents are users (`is_agent = true`): message senders can be historical or
 * planetary agents with no schema special-casing.
 */

export type ConversationKind = "table" | "dm" | "circle";

export type ConversationRole = "host" | "member";

export type NotifyLevel = "all" | "mentions" | "none";

export interface ConversationRecord {
  id: string;
  kind: ConversationKind;
  /** tables.id for 'table', circle id for 'circle', undefined for 'dm'. */
  subjectRef?: string;
  title?: string;
  createdBy?: string;
  dmUserLo?: string;
  dmUserHi?: string;
  lastMessageAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMembership {
  conversationId: string;
  userId: string;
  role: ConversationRole;
  notifyLevel: NotifyLevel;
  mutedByHostUntil: string | null;
  lastReadAt: string | null;
  lastReadMessageId: string | null;
  joinedAt: string;
  leftAt: string | null;
  banned: boolean;
}

export interface ChatAttachment {
  type: "photo";
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  /** Empty string for deleted tombstones. */
  body: string;
  attachments: ChatAttachment[];
  replyToId?: string;
  clientKey?: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  /** Denormalized sender display fields (joined at read time). */
  senderName?: string;
  senderAvatarUrl?: string;
  senderIsAgent?: boolean;
}

export type MessageReportReason = "spam" | "harassment" | "inappropriate" | "other";

export type MessageReportStatus = "open" | "reviewed" | "dismissed" | "actioned";

export interface MessageReport {
  id: string;
  messageId: string;
  conversationId: string;
  reporterId: string;
  reason: MessageReportReason;
  detail?: string;
  status: MessageReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  /** Joined context for the admin queue. */
  messageBody?: string;
  messageSenderId?: string;
  messageHidden?: boolean;
  conversationKind?: ConversationKind;
}

/** One row of the /messages inbox. */
export interface InboxEntry {
  conversation: ConversationRecord;
  membership: Pick<ConversationMembership, "role" | "notifyLevel" | "lastReadAt">;
  /** Preview of the newest visible message (blocked senders filtered). */
  lastMessage: {
    id: string;
    senderId: string;
    senderName?: string;
    body: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  /** For DMs: the other participant. */
  otherUser?: {
    id: string;
    name?: string;
    avatarUrl?: string;
    isAgent?: boolean;
  };
}

export interface ChatUnread {
  total: number;
  byConversation: Record<string, number>;
}
