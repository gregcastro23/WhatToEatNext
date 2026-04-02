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
  | 'friend_request'
  | 'friend_accepted'
  | 'commensal_request'
  | 'commensal_accepted';

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedUserId?: string;
  relatedUserName?: string;
  metadata?: Record<string, any>;
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
  friend_request:     { bg: '#FFF3E0', border: '#FFB74D', icon: '🤝' },
  friend_accepted:    { bg: '#E0F7FA', border: '#4DD0E1', icon: '✨' },
  commensal_request:  { bg: '#FCE4EC', border: '#F48FB1', icon: '🍽️' },
  commensal_accepted: { bg: '#F3E5F5', border: '#CE93D8', icon: '🎉' },
};
