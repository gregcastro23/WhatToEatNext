/**
 * User Notification Types
 *
 * Types for the persistent notification system.
 * Notifications are stored in PostgreSQL and displayed
 * as post-it style cards in the header bell dropdown and dashboard panel.
 */

export type NotificationType =
  | 'welcome'
  | 'login_greeting'
  | 'daily_insight'
  | 'commensal_request'
  | 'commensal_accepted'
  | 'quest_completed'
  | 'master_quest_broadcast'
  | 'agent_broadcast'
  | 'transit_attunement'
  | 'table_invite'
  | 'table_rsvp'
  | 'table_going_live'
  | 'table_memory_posted'
  | 'dm_message'
  | 'circle_message'
  | 'table_chat_mention';

export interface NotificationMetadata {
  commensalshipId?: string;
  overallHarmony?: number;
  dominantElement?: string;
  favorableElements?: string[];
  questSlug?: string;
  tokenType?: string;
  tokenAmount?: number;
  agentName?: string;
  sacredStat?: string;
  completedByUserId?: string;
  communityRewardAmount?: number;
  communityBuff?: {
    kind: string;
    yieldMultiplier?: number;
    expiresAt?: string;
  };
  /** Deep-link target for all `table_*` notification types. */
  tableId?: string;
  tableTitle?: string;
  scheduledAt?: string;
  venueName?: string;
  hostName?: string;
  guestName?: string;
  response?: string;
  feedEventId?: string;
  photoCount?: number;
  /** Chat deep-link target + dedup key (one unread row per recipient+conversation). */
  conversationId?: string;
  conversationKind?: string;
  /** Running unread count folded into a single deduped chat notification row. */
  unreadCount?: number;
  messagePreview?: string;
  [key: string]: unknown;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedUserId?: string;
  relatedUserName?: string;
  metadata?: NotificationMetadata;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationListResponse {
  success: boolean;
  notifications: UserNotification[];
  unreadCount: number;
  total: number;
}

/** Colors and icons for each notification type (used in UI) */
export const NOTIFICATION_STYLES: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  welcome:            { bg: '#FFF8E1', border: '#FFD54F', icon: '🌟' },
  login_greeting:     { bg: '#E8F5E9', border: '#81C784', icon: '👋' },
  daily_insight:      { bg: '#E8EAF6', border: '#7986CB', icon: '🔮' },
  commensal_request:  { bg: '#FCE4EC', border: '#F48FB1', icon: '🍽️' },
  commensal_accepted: { bg: '#F3E5F5', border: '#CE93D8', icon: '🎉' },
  quest_completed:    { bg: '#E0F7FA', border: '#7986CB', icon: '🏆' },
  master_quest_broadcast: { bg: '#FFF3E0', border: '#FFB74D', icon: '🌌' },
  agent_broadcast:    { bg: '#F3E8FF', border: '#C084FC', icon: '🤖' },
  transit_attunement: { bg: '#EDE9FE', border: '#A78BFA', icon: '🌠' },
  table_invite:        { bg: '#FFF3E0', border: '#e0a66b', icon: '🍽️' },
  table_rsvp:          { bg: '#F3E5F5', border: '#B57EE0', icon: '📋' },
  table_going_live:    { bg: '#EDE9FE', border: '#B57EE0', icon: '⚡' },
  table_memory_posted: { bg: '#FFF8E1', border: '#e0a66b', icon: '📸' },
  dm_message:          { bg: '#E8EAF6', border: '#7986CB', icon: '💬' },
  circle_message:      { bg: '#EDE9FE', border: '#A78BFA', icon: '💬' },
  table_chat_mention:  { bg: '#EDE9FE', border: '#B57EE0', icon: '📣' },
};
