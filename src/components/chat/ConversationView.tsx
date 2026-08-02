"use client";

/**
 * ConversationView — a DM or circle thread (docs/plans/pr3-messaging-plan.md
 * §5). Postgres-only via useConversation (never SpacetimeDB — DM/circle bodies
 * are private). Marks the thread read on mount and after each send.
 */

import { useEffect, useState } from "react";
import { useConversation } from "@/hooks/useConversation";
import type { ChatMessage } from "@/types/chat";
import { HostModerationMenu } from "./HostModerationMenu";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { ReportMessageDialog } from "./ReportMessageDialog";
import type { JSX } from "react";

export interface ConversationViewProps {
  conversationId: string;
  /** Optional seed; the hook resolves the authoritative DB id from the API. */
  viewerId?: string | null;
  isHost?: boolean;
  className?: string;
}

export function ConversationView({
  conversationId,
  viewerId: seedViewerId = null,
  isHost = false,
  className = "",
}: ConversationViewProps): JSX.Element {
  const convo = useConversation(conversationId, { viewerId: seedViewerId });
  const viewerId = convo.viewerId;
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);

  // Mark the thread read whenever new messages arrive. Hoisting the two values
  // the effect actually depends on keeps the dependency list exact (rather than
  // depending on the whole `convo` object, which is a fresh reference each render
  // and would re-fire markRead on every render).
  const markRead = convo.markRead;
  const messageCount = convo.messages.length;
  useEffect(() => {
    void markRead();
  }, [markRead, messageCount]);

  const renderMenu = (message: ChatMessage) => {
    if (message.pending || message.deletedAt) return null;
    const isOwn = !!viewerId && message.senderId === viewerId;
    return (
      <HostModerationMenu
        isHost={isHost}
        isOwnMessage={isOwn}
        onReport={() => setReportTarget(message)}
        onDelete={undefined}
      />
    );
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {convo.error ? (
        <p className="flex-1 py-8 text-center text-sm text-alchm-fg-mute">{convo.error}</p>
      ) : (
        <MessageList
          messages={convo.messages}
          viewerId={viewerId}
          loading={convo.loading}
          hasMore={convo.hasMore}
          onLoadEarlier={() => void convo.loadEarlier()}
          renderMenu={renderMenu}
          className="flex-1 px-1 py-2"
          emptyLabel="No messages yet — start the conversation."
        />
      )}
      <div className="mt-2">
        <MessageComposer
          disabled={!!convo.error}
          placeholder="Message…"
          onSend={async (body, opts) => {
            const ok = await convo.send(body, opts);
            if (ok) void convo.markRead();
            return ok;
          }}
        />
      </div>
      {reportTarget && (
        <ReportMessageDialog messageId={reportTarget.id} onClose={() => setReportTarget(null)} />
      )}
    </div>
  );
}

export default ConversationView;
