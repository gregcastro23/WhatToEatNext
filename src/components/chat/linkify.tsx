import type { JSX, ReactNode } from "react";

/**
 * Render message text with only http(s) links linkified — everything else is
 * plain text (React escapes it). Links carry rel="noopener noreferrer nofollow
 * ugc" (plan §3: no unfurl v1, user-generated content). No HTML is ever
 * interpreted from the body.
 */
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g;

export function linkify(text: string): ReactNode[] {
  const parts = text.split(URL_RE);
  return parts.map((part, index): JSX.Element | string => {
    if (index % 2 === 1 && /^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className="text-alchm-copper-bright underline underline-offset-2 hover:text-alchm-copper break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
