'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NotificationListResponse, UserNotification } from '@/types/notification';

const NOTIFICATION_REFRESH_EVENT = 'notifications:refresh';

interface UseNotificationsOptions {
  enabled?: boolean;
  limit?: number;
  pollingMs?: number;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  notifications?: UserNotification[];
  unreadCount?: number;
  notification?: UserNotification;
  alreadyGenerated?: boolean;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const enabled = options?.enabled ?? true;
  const limit = options?.limit ?? 20;
  const pollingMs = options?.pollingMs ?? 60_000;

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notifyRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT));
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch(`/api/notifications?limit=${limit}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch notifications (${res.status})`);
      }

      const data = (await res.json()) as NotificationListResponse;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setError('Unable to load notifications right now.');
    } finally {
      setLoading(false);
    }
  }, [enabled, limit]);

  useEffect(() => {
    setLoading(true);
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!enabled || !pollingMs || pollingMs <= 0) return;

    const interval = setInterval(() => {
      void fetchNotifications();
    }, pollingMs);

    return () => clearInterval(interval);
  }, [enabled, pollingMs, fetchNotifications]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleRefresh = () => {
      void fetchNotifications();
    };

    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh);
    };
  }, [enabled, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return { success: true };

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to mark as read');
      }

      notifyRefresh();
      return { success: true };
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: target.isRead } : n)),
      );
      setUnreadCount((count) => (target.isRead ? count : count + 1));
      return { success: false, message: 'Could not mark notification as read.' };
    }
  }, [notifications]);

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    const hadUnread = previous.some((n) => !n.isRead);
    if (!hadUnread) return { success: true, count: 0 };

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to mark all as read');
      }

      const data = (await res.json()) as { count?: number };
      notifyRefresh();
      return { success: true, count: data.count || 0 };
    } catch {
      setNotifications(previous);
      setUnreadCount(previous.filter((n) => !n.isRead).length);
      return { success: false, count: 0, message: 'Could not mark all notifications as read.' };
    }
  }, [notifications]);

  const generateDailyInsight = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/generate-insight', {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json()) as ApiResponse;

      if (!res.ok) {
        return {
          success: false,
          message: data.message || 'Unable to generate your daily insight.',
        };
      }

      if (data.notification) {
        setNotifications((prev) => [data.notification!, ...prev.filter((n) => n.id !== data.notification!.id)]);
        setUnreadCount((count) => count + 1);
        notifyRefresh();
        return { success: true, created: true };
      }

      if (data.alreadyGenerated) {
        return { success: true, created: false, message: data.message || 'Insight already generated today.' };
      }

      return { success: true, created: false, message: data.message || 'No new insight generated.' };
    } catch {
      return { success: false, message: 'Unable to generate your daily insight.' };
    }
  }, []);

  const respondToCommensalRequest = useCallback(
    async (notification: UserNotification, action: 'accept' | 'reject') => {
      const commensalshipId = notification.metadata?.commensalshipId;
      if (!commensalshipId || typeof commensalshipId !== 'string') {
        return { success: false, message: 'This request can no longer be acted on from notifications.' };
      }

      const endpoint = action === 'accept' ? '/api/commensals/accept' : '/api/commensals/reject';

      try {
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ commensalshipId }),
        });
        const data = (await res.json()) as ApiResponse;

        if (!res.ok || data.success === false) {
          return {
            success: false,
            message: data.message || `Failed to ${action} companion request.`,
          };
        }

        const markResult = await markAsRead(notification.id);
        if (!markResult.success) {
          return markResult;
        }

        notifyRefresh();
        return { success: true };
      } catch {
        return { success: false, message: `Failed to ${action} companion request.` };
      }
    },
    [markAsRead],
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications],
  );

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllRead,
    generateDailyInsight,
    respondToCommensalRequest,
  };
}

export function formatNotificationTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString();
}
