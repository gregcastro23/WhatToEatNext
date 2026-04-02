'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NOTIFICATION_STYLES } from '@/types/notification';
import type { UserNotification } from '@/types/notification';

/**
 * NotificationBell — test-tube icon in the header with unread badge.
 * Opens a dropdown showing recent notifications styled as post-it notes.
 */
export default function NotificationBell() {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications?limit=10');
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

  // Fetch on mount and every 60s
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [status, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

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

  if (status !== 'authenticated') return null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Test-tube button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative px-2 py-1.5 rounded-lg bg-white bg-opacity-70 hover:bg-purple-100 border border-purple-200 transition-all duration-200 hover:scale-105 hover:shadow-md"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
      >
        {/* Test tube SVG icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
          <path d="M9 3h6v2H9z" />
          <path d="M8 5h8l-2 14a2 2 0 0 1-2 1.73h-0a2 2 0 0 1-2-1.73L8 5z" />
          <path d="M7 12h10" />
          <circle cx="11" cy="16" r="1" fill="currentColor" />
          <circle cx="13" cy="14" r="0.5" fill="currentColor" />
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between rounded-t-xl">
            <span className="font-semibold text-sm text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((n) => {
                const style = NOTIFICATION_STYLES[n.type] || NOTIFICATION_STYLES.welcome;
                return (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                    className="w-full text-left p-3 rounded-lg transition-all duration-150 hover:scale-[1.01]"
                    style={{
                      backgroundColor: style.bg,
                      border: `1px solid ${style.border}`,
                      opacity: n.isRead ? 0.7 : 1,
                      transform: `rotate(${n.isRead ? 0 : (Math.random() - 0.5) * 1.5}deg)`,
                      boxShadow: n.isRead ? 'none' : '2px 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0">{style.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {n.title}
                          {!n.isRead && (
                            <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-purple-500" />
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatTimeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
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
