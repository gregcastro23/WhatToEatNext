import { Sparkles } from "lucide-react";
import { AvatarCircle, type AvatarPerson } from "./AvatarCircle";
import { ELEMENT_COLORS, ELEMENT_ICONS } from "./elements";
import { LabelXS } from "./LabelXS";
import type { ReactionKind } from "./ReactionBar";
import type { JSX, ReactNode } from "react";

export interface ChatBubbleReaction {
  kind: ReactionKind;
}

export interface ChatBubbleProps {
  variant: "self" | "other";
  /** Sender identity; renders a tiny avatar on `other` bubbles. */
  author?: AvatarPerson;
  timestamp?: string;
  /** Message-level element reactions, stacked bottom-right. */
  reactions?: ChatBubbleReaction[];
  children: ReactNode;
  className?: string;
}

/**
 * Live Discussion bubble (tables-design-spec.md §2.12): `other` = blurred
 * surface capsule with a squared bottom-left corner + tiny avatar; `self` =
 * copper→violet tint, squared bottom-right, right-aligned. Reactions overlap
 * the bottom-right edge as tiny element badges.
 */
export function ChatBubble({
  variant,
  author,
  timestamp,
  reactions = [],
  children,
  className = "",
}: ChatBubbleProps): JSX.Element {
  const isSelf = variant === "self";
  const bubble = isSelf
    ? "bg-gradient-to-br from-alchm-copper/15 to-alchm-violet/15 border border-alchm-violet/20 rounded-2xl rounded-br-sm"
    : "bg-surface-container/40 backdrop-blur border border-white/5 rounded-2xl rounded-bl-sm";
  return (
    <div
      className={`flex items-end gap-2 ${isSelf ? "justify-end" : ""} ${className}`}
    >
      {!isSelf && author && <AvatarCircle {...author} size={24} />}
      <div className={`relative max-w-[75%] p-3.5 ${bubble}`}>
        {!isSelf && author && (
          <LabelXS className="block mb-1 text-alchm-violet-bright">
            {author.name}
          </LabelXS>
        )}
        <p className="text-sm text-alchm-fg leading-relaxed">{children}</p>
        {timestamp && (
          <LabelXS className="block mt-1.5 text-alchm-fg-mute">
            {timestamp}
          </LabelXS>
        )}
        {reactions.length > 0 && (
          <span
            className="absolute -bottom-2.5 -right-2 flex"
            aria-label={`Reactions: ${reactions.map((r) => r.kind).join(", ")}`}
            role="img"
          >
            {reactions.map((reaction, index) => {
              const Icon =
                reaction.kind === "spark"
                  ? Sparkles
                  : ELEMENT_ICONS[reaction.kind];
              const tint =
                reaction.kind === "spark"
                  ? "text-alchm-violet-bright"
                  : ELEMENT_COLORS[reaction.kind].text;
              return (
                <span
                  key={`${reaction.kind}-${index}`}
                  className={`flex h-5 w-5 items-center justify-center rounded-full bg-alchm-bg-elev border border-white/10 ${tint} ${index > 0 ? "-ml-2" : ""}`}
                >
                  <Icon size={10} aria-hidden />
                </span>
              );
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
