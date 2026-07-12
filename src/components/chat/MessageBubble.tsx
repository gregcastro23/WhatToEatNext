"use client";

/**
 * MessageBubble — one chat message. Composes the Tables UI kit's ChatBubble
 * (tables-design-spec.md §2.12). Deleted messages render as a muted tombstone;
 * a photo attachment renders above the text; the per-message menu (report /
 * host-delete) is provided by the parent via `menu`.
 */

import { AvatarCircle } from "@/components/tables/ui/AvatarCircle";
import { ChatBubble } from "@/components/tables/ui/ChatBubble";
import type { Element } from "@/components/tables/ui/elements";
import type { ChatMessage } from "@/types/chat";
import { linkify } from "./linkify";
import type { JSX, ReactNode } from "react";

export interface MessageBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
  element?: Element;
  timestamp?: string;
  /** Optional affordance menu (report/delete), shown on hover/focus. */
  menu?: ReactNode;
}

export function MessageBubble({
  message,
  isSelf,
  element = "Air",
  timestamp,
  menu,
}: MessageBubbleProps): JSX.Element {
  const deleted = !!message.deletedAt;
  const photo = message.attachments.find((a) => a.type === "photo");

  if (deleted) {
    return (
      <div className={`flex ${isSelf ? "justify-end" : ""}`}>
        <p className="rounded-2xl bg-white/[0.02] px-3.5 py-2 text-xs italic text-alchm-fg-mute">
          Message removed
        </p>
      </div>
    );
  }

  return (
    <div className="group relative">
      <ChatBubble
        variant={isSelf ? "self" : "other"}
        author={
          isSelf
            ? undefined
            : { name: message.senderName || "Guest", src: message.senderAvatarUrl, element }
        }
        timestamp={timestamp}
      >
        {photo && (
          <span className="mb-2 block overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Shared in chat"
              loading="lazy"
              className="max-h-64 w-full object-cover"
            />
          </span>
        )}
        {message.body && <span className="whitespace-pre-wrap break-words">{linkify(message.body)}</span>}
      </ChatBubble>
      {menu && (
        <div className="absolute -top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {menu}
        </div>
      )}
    </div>
  );
}

/** Sender→element cycle so bubbles read distinctly without inventing identity. */
export function elementForSender(senderId: string): Element {
  const cycle: Element[] = ["Fire", "Water", "Earth", "Air"];
  let h = 0;
  for (let i = 0; i < senderId.length; i++) h = (h * 31 + senderId.charCodeAt(i)) >>> 0;
  return cycle[h % cycle.length];
}

/** Small avatar used by inbox/DM headers. */
export function SenderAvatar({
  name,
  src,
  element,
  size = 32,
}: {
  name: string;
  src?: string;
  element?: Element;
  size?: number;
}): JSX.Element {
  return <AvatarCircle name={name} src={src} element={element} size={size} />;
}

export default MessageBubble;
