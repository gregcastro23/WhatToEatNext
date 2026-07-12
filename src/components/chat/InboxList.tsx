"use client";

/**
 * InboxList — the /messages inbox (docs/plans/pr3-messaging-plan.md §5).
 * Lists the viewer's active conversations with a last-message preview and
 * unread count. DMs show the counterpart's identity; circles/tables show a
 * title. Flag-gated at the page level.
 */

import Link from "next/link";
import { formatNotificationTimeAgo } from "@/hooks/useNotifications";
import { SenderAvatar, elementForSender } from "./MessageBubble";
import type { InboxEntry } from "@/types/chat";
import type { JSX } from "react";

export interface InboxListProps {
  entries: InboxEntry[];
  loading?: boolean;
  className?: string;
}

function titleFor(entry: InboxEntry): string {
  if (entry.conversation.kind === "dm") return entry.otherUser?.name || "Direct message";
  return entry.conversation.title || (entry.conversation.kind === "table" ? "Table chat" : "Circle");
}

export function InboxList({ entries, loading = false, className = "" }: InboxListProps): JSX.Element {
  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className={`py-10 text-center text-sm text-alchm-fg-mute ${className}`}>
        No conversations yet.
      </p>
    );
  }

  return (
    <ul className={`space-y-1 ${className}`}>
      {entries.map((entry) => {
        const title = titleFor(entry);
        const preview = entry.lastMessage?.body || "No messages yet";
        return (
          <li key={entry.conversation.id}>
            <Link
              href={`/messages/${entry.conversation.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
            >
              <SenderAvatar
                name={title}
                src={entry.otherUser?.avatarUrl}
                element={elementForSender(entry.otherUser?.id || entry.conversation.id)}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-alchm-fg">{title}</span>
                  {entry.conversation.lastMessageAt && (
                    <span className="shrink-0 text-xs text-alchm-fg-mute">
                      {formatNotificationTimeAgo(entry.conversation.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-alchm-fg-dim">{preview}</span>
                  {entry.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-alchm-violet px-1.5 py-0.5 text-[10px] font-semibold text-alchm-bg">
                      {entry.unreadCount > 99 ? "99+" : entry.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default InboxList;
