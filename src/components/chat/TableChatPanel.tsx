"use client";

/**
 * TableChatPanel — the live Table discussion, mounted inside the table detail
 * page for status='live' (docs/plans/tables-program-sequencing.md
 * Reconciliation 1: this replaces the PR 3 plan's LiveCommensalLobby mount;
 * the old lobby stays untouched).
 *
 * Ships VISIBLE — table chat is not behind a server flag. When the Spacetime
 * flag is off or disconnected it runs on the 10s Postgres poll; a small badge
 * shows the mode. DMs/circles are the flag-gated surfaces, not this.
 */

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { GlassPanel } from "@/components/tables/ui/GlassPanel";
import { LabelXS } from "@/components/tables/ui/LabelXS";
import { useTableChat } from "@/hooks/useTableChat";
import type { ChatMessage } from "@/types/chat";
import { HostModerationMenu } from "./HostModerationMenu";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { ReportMessageDialog } from "./ReportMessageDialog";
import type { JSX } from "react";

export interface TableChatPanelProps {
  tableId: string;
  isHost: boolean;
  viewerId: string | null;
  /** The panel only enables its data path when the table is live. */
  enabled: boolean;
  className?: string;
}

export function TableChatPanel({
  tableId,
  isHost,
  viewerId,
  enabled,
  className = "",
}: TableChatPanelProps): JSX.Element {
  const chat = useTableChat(tableId, { enabled, viewerId });
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);

  const renderMenu = (message: ChatMessage) => {
    if (message.pending || message.deletedAt) return null;
    const isOwn = !!viewerId && message.senderId === viewerId;
    return (
      <HostModerationMenu
        isHost={isHost}
        isOwnMessage={isOwn}
        onReport={() => setReportTarget(message)}
        onDelete={isHost || isOwn ? () => void chat.remove(message.id) : undefined}
        onMuteSender={
          isHost && !isOwn && message.senderId
            ? () => void chat.hostMute(message.senderId)
            : undefined
        }
        onKickSender={
          isHost && !isOwn && message.senderId
            ? () => void chat.hostKick(message.senderId)
            : undefined
        }
      />
    );
  };

  return (
    <GlassPanel className={`flex flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <MessageCircle size={14} className="text-alchm-violet-bright" aria-hidden />
          <LabelXS className="text-alchm-violet-bright">Live Discussion</LabelXS>
        </span>
        <LabelXS className="text-alchm-fg-mute">
          {chat.connectionMode === "live" ? "Live" : "Updating"}
        </LabelXS>
      </div>

      {chat.error ? (
        <p className="py-6 text-center text-sm text-alchm-fg-mute">{chat.error}</p>
      ) : (
        <MessageList
          messages={chat.messages}
          viewerId={viewerId}
          loading={chat.loading}
          renderMenu={renderMenu}
          className="max-h-[420px] min-h-[200px] pr-1"
        />
      )}

      <div className="mt-3">
        <MessageComposer
          disabled={!chat.canSend || !!chat.error}
          placeholder="Share a thought with the table..."
          onSend={(body, opts) => chat.send(body, opts)}
        />
      </div>

      {reportTarget && (
        <ReportMessageDialog
          messageId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </GlassPanel>
  );
}

export default TableChatPanel;
