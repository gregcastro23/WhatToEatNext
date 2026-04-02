'use client';

import { useCallback, useEffect, useState } from 'react';
import { NOTIFICATION_STYLES } from '@/types/notification';
import type { UserNotification } from '@/types/notification';

/**
 * NotificationPanel — full notification list for the user dashboard.
 * Renders notifications as post-it style cards. Premium daily insights
 * get a richer display with harmony scores and elemental highlights.
 */
export function NotificationPanel() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' }).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        No notifications yet. They will appear here when you receive commensal
        invitations, acceptances, or cosmic insights.
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={markAllRead}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            Mark all as read ({unreadCount})
          </button>
        </div>
      )}

      {/* Notification grid — post-it style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {notifications.map((n) => {
          const style = NOTIFICATION_STYLES[n.type] || NOTIFICATION_STYLES.welcome;
          const isDailyInsight = n.type === 'daily_insight';

          return (
            <div
              key={n.id}
              onClick={() => { if (!n.isRead) markAsRead(n.id); }}
              className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isDailyInsight ? 'sm:col-span-2' : ''
              }`}
              style={{
                backgroundColor: style.bg,
                border: `1.5px solid ${style.border}`,
                opacity: n.isRead ? 0.65 : 1,
                boxShadow: n.isRead ? 'none' : '3px 3px 12px rgba(0,0,0,0.08)',
              }}
              role="button"
              tabIndex={0}
            >
              {/* Unread dot */}
              {!n.isRead && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
              )}

              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                  {/* Rich detail for daily insights */}
                  {isDailyInsight && n.metadata && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {n.metadata.overallHarmony != null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white bg-opacity-60 text-xs font-medium text-indigo-700">
                          Harmony: {Math.round(n.metadata.overallHarmony * 100)}%
                        </span>
                      )}
                      {n.metadata.dominantElement && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white bg-opacity-60 text-xs font-medium text-gray-700">
                          Dominant: {n.metadata.dominantElement}
                        </span>
                      )}
                      {(n.metadata.favorableElements as string[] | undefined)?.map((el: string) => (
                        <span
                          key={el}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-white bg-opacity-60 text-xs font-medium text-green-700"
                        >
                          {el}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Related user */}
                  {n.relatedUserName && (
                    <p className="text-xs text-gray-500 mt-2">
                      From: {n.relatedUserName}
                    </p>
                  )}

                  <p className="text-[10px] text-gray-400 mt-2">
                    {formatTimeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
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
