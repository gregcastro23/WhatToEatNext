"use client";

/**
 * MessageList — newest-100 window with an optional "load earlier" affordance
 * (no virtualization in v1, plan §5). Auto-scrolls to the bottom on new
 * messages when the viewer is already near the bottom. Renders each message
 * via MessageBubble with a per-message menu supplied by the parent.
 */

import { useEffect, useRef } from "react";
import { formatNotificationTimeAgo } from "@/hooks/useNotifications";
import type { ChatMessage } from "@/types/chat";
import { MessageBubble, elementForSender } from "./MessageBubble";
import type { JSX, ReactNode } from "react";

export interface MessageListProps {
  messages: ChatMessage[];
  viewerId: string | null;
  loading?: boolean;
  emptyLabel?: string;
  onLoadEarlier?: () => void;
  hasMore?: boolean;
  /** Build the per-message affordance menu (report / host-delete). */
  renderMenu?: (message: ChatMessage) => ReactNode;
  className?: string;
}

export function MessageList({
  messages,
  viewerId,
  loading = false,
  emptyLabel = "No messages yet — say the first word.",
  onLoadEarlier,
  hasMore = false,
  renderMenu,
  className = "",
}: MessageListProps): JSX.Element {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const grew = messages.length > lastCountRef.current;
    lastCountRef.current = messages.length;
    if (!grew) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 160;
    if (nearBottom && typeof bottomRef.current?.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-3 overflow-y-auto ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Messages"
    >
      {hasMore && onLoadEarlier && (
        <button
          type="button"
          onClick={onLoadEarlier}
          className="mx-auto rounded-full border border-white/10 px-3 py-1 text-xs text-alchm-fg-mute hover:text-alchm-fg"
        >
          Load earlier
        </button>
      )}

      {messages.length === 0 && !loading && (
        <p className="py-8 text-center text-sm text-alchm-fg-mute">{emptyLabel}</p>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSelf={!!viewerId && message.senderId === viewerId}
          element={elementForSender(message.senderId || message.id)}
          timestamp={message.createdAt ? formatNotificationTimeAgo(message.createdAt) : undefined}
          menu={renderMenu?.(message)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
