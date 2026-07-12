"use client";

/**
 * MessagesBadge — the /messages nav entry beside the NotificationBell
 * (docs/plans/pr3-messaging-plan.md §5). Shows the aggregate chat unread count
 * from /api/chat/unread (table chat included). Rendered only when a chat
 * surface is enabled for the user (DMs or circles); table chat lives on the
 * table page, so the inbox entry is DM/circle-gated.
 */

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { isCirclesEnabledClient, isDmsEnabledClient } from "@/lib/chat/flags";
import { useChatUnread } from "@/hooks/useChatUnread";
import type { JSX } from "react";

export default function MessagesBadge(): JSX.Element | null {
  const { status } = useSession();
  const inboxEnabled = isDmsEnabledClient() || isCirclesEnabledClient();
  const { total } = useChatUnread(status === "authenticated" && inboxEnabled);

  if (status !== "authenticated" || !inboxEnabled) return null;

  return (
    <Link
      href="/messages"
      aria-label={`Messages${total > 0 ? ` (${total} unread)` : ""}`}
      title="Messages"
      className="relative px-2 py-1.5 rounded-lg bg-white bg-opacity-70 hover:bg-purple-100 border border-purple-200 transition-all duration-200 hover:scale-105 hover:shadow-md"
    >
      <MessageCircle size={20} className="text-purple-600" aria-hidden />
      {total > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm">
          {total > 9 ? "9+" : total}
        </span>
      )}
    </Link>
  );
}
