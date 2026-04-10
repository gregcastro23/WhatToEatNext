'use client';

import { useMemo, useState } from 'react';
import { formatNotificationTimeAgo, useNotifications } from '@/hooks/useNotifications';
import { NOTIFICATION_STYLES } from '@/types/notification';
import type { UserNotification } from '@/types/notification';

type NotificationFilter = 'all' | 'unread';

/**
 * NotificationPanel — full notification list for the user dashboard.
 * Includes filtering, quick actions, and direct commensal request handling.
 */
export function NotificationPanel() {
  const {
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
  } = useNotifications({ limit: 30, pollingMs: 45_000 });

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [busyNotificationId, setBusyNotificationId] = useState<string | null>(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const displayedNotifications = useMemo(
    () => (filter === 'unread' ? unreadNotifications : notifications),
    [filter, notifications, unreadNotifications],
  );

  const handleGenerateInsight = async () => {
    setGeneratingInsight(true);
    setStatusMessage(null);

    const result = await generateDailyInsight();

    if (!result.success) {
      setStatusMessage(result.message || 'Unable to generate daily insight right now.');
    } else if (result.created) {
      setStatusMessage('New daily insight generated.');
    } else {
      setStatusMessage(result.message || 'Daily insight already generated today.');
    }

    setGeneratingInsight(false);
  };

  const handleCommensalAction = async (
    notification: UserNotification,
    action: 'accept' | 'reject',
  ) => {
    setBusyNotificationId(notification.id);
    setStatusMessage(null);

    const result = await respondToCommensalRequest(notification, action);

    if (!result.success) {
      setStatusMessage(result.message || `Could not ${action} request.`);
    } else {
      setStatusMessage(
        action === 'accept' ? 'Companion request accepted.' : 'Companion request declined.',
      );
      await fetchNotifications();
    }

    setBusyNotificationId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl p-1.5 glass-base border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              filter === 'all' ? 'glass-highlight text-white shadow-lg' : 'text-white/40 hover:text-white/60'
            }`}
          >
            All Codex ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              filter === 'unread' ? 'glass-highlight text-white shadow-lg' : 'text-white/40 hover:text-white/60'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void fetchNotifications();
            }}
            className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
          >
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={() => {
                void markAllRead();
              }}
              className="text-[9px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-all"
            >
              Clear All
            </button>
          )}

          <button
            onClick={() => {
              void handleGenerateInsight();
            }}
            disabled={generatingInsight}
            className="text-[9px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/10 hover:border-amber-500/30 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            {generatingInsight ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400/20 group-hover:bg-amber-400 transition-colors" />
            )}
            {generatingInsight ? 'Calibrating...' : 'Generate Insight'}
          </button>
        </div>
      </div>

      {(error || statusMessage) && (
        <div className="text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-3 glass-highlight border border-white/5 text-white/60 animate-fade-in">
          {statusMessage || error}
        </div>
      )}

      {displayedNotifications.length === 0 ? (
        <div className="text-center py-12 glass-base rounded-[2rem] border border-white/5 border-dashed">
          <p className="text-white/20 text-xs font-medium italic">
            {filter === 'unread' ? 'Your celestial slate is clean.' : 'No alchemical logs found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedNotifications.map((n) => {
            const style = NOTIFICATION_STYLES[n.type] || NOTIFICATION_STYLES.welcome;
            const isDailyInsight = n.type === 'daily_insight';
            const isCommensalRequest = n.type === 'commensal_request';
            const canRespondToCommensal =
              isCommensalRequest &&
              !n.isRead &&
              typeof n.metadata?.commensalshipId === 'string';

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) {
                    void markAsRead(n.id);
                  }
                }}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && !n.isRead) {
                    event.preventDefault();
                    void markAsRead(n.id);
                  }
                }}
                className={`group relative p-6 rounded-[1.75rem] cursor-pointer transition-all duration-500 hover:translate-y-[-4px] overflow-hidden ${
                  isDailyInsight ? 'sm:col-span-2' : ''
                } ${n.isRead ? 'glass-base opacity-60' : 'glass-card-premium border-white/20'}`}
                role="button"
                tabIndex={0}
              >
                {!n.isRead && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full group-hover:bg-purple-500/10 transition-colors" />
                )}

                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                )}

                <div className="flex items-start gap-5 relative z-10">
                  <span className="text-2xl shrink-0 mt-1 transition-transform group-hover:scale-125 duration-500">{style.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-white/90 uppercase tracking-[0.15em] mb-1">{n.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">{n.message}</p>

                    {isDailyInsight && n.metadata && (
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {n.metadata.overallHarmony != null && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-highlight text-[9px] font-black uppercase tracking-widest text-indigo-300 border border-indigo-500/10">
                            Harmony: {Math.round(Number(n.metadata.overallHarmony) * 100)}%
                          </span>
                        )}
                        {n.metadata.dominantElement && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-highlight text-[9px] font-black uppercase tracking-widest text-amber-300 border border-amber-500/10">
                            {String(n.metadata.dominantElement)}
                          </span>
                        )}
                        {Array.isArray(n.metadata.favorableElements) &&
                          n.metadata.favorableElements.map((el) => (
                            <span
                              key={el}
                              className="inline-flex items-center px-3 py-1 rounded-full glass-highlight text-[9px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-500/10"
                            >
                              {el}
                            </span>
                          ))}
                      </div>
                    )}

                    {canRespondToCommensal && (
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCommensalAction(n, 'accept');
                          }}
                          disabled={busyNotificationId === n.id}
                          className="text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all disabled:opacity-30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCommensalAction(n, 'reject');
                          }}
                          disabled={busyNotificationId === n.id}
                          className="text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all disabled:opacity-30"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                      {n.relatedUserName && (
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                          Source: {n.relatedUserName}
                        </p>
                      )}
                      <p className="text-[9px] font-mono text-white/10 uppercase ml-auto">
                        {formatNotificationTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
